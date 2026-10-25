/**
 * PHARMACEUTICS — Pharmaceutical solution preparation & dilution (owner's shortlist, 2026-10-25).
 *
 * The task: prepare 100.0 mL of a sodium chloride stock (solution A) at a strength stated in ONE
 * measure — % w/v, mg/mL or mol/L, chosen by the seed — then 100.0 mL of a 1 in 10 dilution of it
 * (solution B) with a 10 mL bulb pipette, verify both concentrations from what was ACTUALLY weighed
 * and measured, and clean up.
 *
 * TEACHING VALUES (stated here and on screen): the three task strengths (0.900 % w/v is the strength
 * of normal saline, ≈ 154 mmol/L, but this is a practice solution and is never for use), the ±2 %
 * weighing tolerance, and the transfer-loss figures in `METHOD.residue`. Glassware tolerances are
 * the published Class A figures; NaCl constants are in calculations/solutionPrep.ts with sources.
 *
 * The model follows the student, so every technique error moves the result in its real direction:
 * an untared balance makes the recorded mass (and every calculated concentration) high; skipped
 * rinses lose solute (A low); water past the mark dilutes (A low); a flask made up over undissolved
 * crystals contracts below the mark once they dissolve (A slightly high); an unrinsed, water-wet
 * pipette dilutes the aliquot (B low); an unmixed flask gives a top-layer sample (low).
 *
 * The bench mechanics shared by the Pharmaceutics room (cabinets, sink, waste station) come from
 * `common.ts`; equipment ids come from `contract.ts`; the room draws `solutionPrepVisual(state)`.
 */
import type { ControllerDef, ExperimentDefinition, ExperimentReport, Feedback, LabMode, ObservationSection, Suggestion } from "../../engine/types";
import { fmt, info, mistake, ok, rand, refuse, round, warn } from "../../engine/machine";
import { LABS } from "../../catalog";
import { dilutionStockVolume } from "../../calculations/pharmaceutics";
import {
  DISSOLVED_ML_PER_G,
  NACL_MR,
  SOLID_ML_PER_G,
  concentrationFromMass,
  deviationPercent,
  fourSf,
  fromGPerMl,
  massForConcentration,
  meniscusPosition,
  solutionVolumeMl,
  trueConcentrationGPerMl,
  withinRelative,
  type ConcUnit,
} from "../../calculations/solutionPrep";
import { commonKit, isCommonAction, type BenchCommon, type CabinetId, type CommonAction } from "./common";
import { EQUIPMENT_PLAN, type FlaskVisual, type SolutionPrepVisual } from "./contract";

// ── Method: every number a teacher might change ─────────────────────────────

export const METHOD = {
  flaskMl: 100.0,
  /** Class A 100 mL one-mark flask, to contain: ±0.08 mL (ASTM E288, as stated by the glassware maker — see PROCEDURE). */
  flaskToleranceMl: 0.08,
  pipetteMl: 10.0,
  /** Class A 10 mL one-mark (bulb) pipette, to deliver: ±0.02 mL (ISO 648 / ASTM E969 Class A). */
  pipetteToleranceMl: 0.02,
  /** The drawn meniscus counts as "at the mark" within ± half a drop. */
  meniscusBandMl: 0.025,
  pipetteBandMl: 0.015,
  dropMl: 0.05, // one drop from the wash-bottle tip
  squirtMl: 0.5,
  beakerPortionMl: 10,
  beakerMaxMl: 60, // "a portion" — leaves room in the flask for the rinses
  pipetteLittleMl: 0.2,
  pipetteDropMl: 0.03,
  /** Teaching tolerance on the weighed mass (the owner's brief); an analytical balance meets it easily. */
  weighTolerance: 0.02,
  /** Calculations are checked to 4 significant figures (0.1 %). */
  calcTolerance: 0.001,
  inversionsNeeded: 10,
  inversionsPerPress: 5,
  /** Analytical balance: readability 0.1 mg; the last digit flickers ±1. */
  readabilityG: 0.0001,
  /** Fraction of the NaCl left behind at each surface after pouring — TEACHING VALUES. */
  residue: { boat: 0.005, beaker: 0.03, rod: 0.005, funnel: 0.005 },
  /** Fraction of that residue one rinse carries into the flask — TEACHING VALUES. */
  rinseRecovery: { boat: 0.98, beaker: 0.9, rod: 0.95, funnel: 0.95 },
  rinseMl: { boat: 3, beaker: 5, rod: 2, funnel: 3 },
  minBeakerRinses: 2,
  /** Undissolved fraction left after 30 s of stirring (NaCl, 0.9 g in ~30 mL; solubility ~36 g/100 g water). */
  stirLeft: 0.08,
  /** Water film left in a washed, drained pipette dilutes the first aliquot by about 1 % (teaching value). */
  wetPipetteFactor: 0.99,
  /** Water added at the mark floats on the denser solution: an unmixed top-layer sample is ~2 % weak (teaching value). */
  unmixedTopFactor: 0.98,
  /** Blowing out the drop a TD pipette is calibrated to retain adds about 0.02 mL (teaching value). */
  blowOutMl: 0.02,
  solidThresholdG: 0.0005,
  /** Stated strength of solution B relative to A: a 1 in 10 dilution. */
  dilutionFactor: 10,
};

export type TaskId = "pct" | "mgml" | "molar";

export interface TaskDef {
  id: TaskId;
  unit: ConcUnit;
  stock: number;
  dilute: number;
  stockText: string;
  diluteText: string;
}

/** The three ways the task can state its strength. Each needs a different calculation. */
export const TASKS: Record<TaskId, TaskDef> = {
  pct: { id: "pct", unit: "% w/v", stock: 0.9, dilute: 0.09, stockText: "0.900 % w/v", diluteText: "0.0900 % w/v" },
  mgml: { id: "mgml", unit: "mg/mL", stock: 9.0, dilute: 0.9, stockText: "9.00 mg/mL", diluteText: "0.900 mg/mL" },
  molar: { id: "molar", unit: "mol/L", stock: 0.15, dilute: 0.015, stockText: "0.1500 mol/L", diluteText: "0.01500 mol/L" },
};
const TASK_IDS: TaskId[] = ["pct", "mgml", "molar"];

export const SOLUTE_LABEL = `Sodium chloride AR · NaCl · Mr ${NACL_MR} g/mol`;

export const SOLUTE_OPTIONS = [
  { id: "nacl", text: `Sodium chloride, NaCl — Mr ${NACL_MR} g/mol`, correct: true, why: "Matches the task and the jar's label." },
  { id: "na-only", text: "Sodium chloride — use Mr 22.99 g/mol", correct: false, why: "22.99 g/mol is the atomic mass of sodium alone. The formula unit NaCl is 22.99 + 35.45 = 58.44 g/mol." },
  { id: "kcl", text: "Potassium chloride, KCl — Mr 74.55 g/mol", correct: false, why: "Wrong substance: the task names sodium chloride. KCl looks the same on the shelf — always read the label against the task." },
  { id: "nahco3", text: "Sodium bicarbonate, NaHCO₃ — Mr 84.01 g/mol", correct: false, why: "Wrong substance: the task names sodium chloride." },
] as const;

export const STOCK_VESSELS = [
  { id: "flask", text: "100 mL Class A volumetric flask (±0.08 mL)", correct: true, why: "" },
  { id: "cylinder", text: "100 mL measuring cylinder (±0.5 mL or more)", correct: false, why: "A measuring cylinder is accurate only to about ±0.5–1 mL in 100 mL — 5 to 10 times the flask's tolerance — so the concentration would be imprecise, high or low." },
  { id: "beaker", text: "Beaker, to its printed 100 mL graduation", correct: false, why: "Beaker graduations are approximate (±5 % or worse): the concentration would be imprecise, high or low." },
] as const;

export const ALIQUOT_VESSELS = [
  { id: "pipette", text: "10 mL Class A bulb pipette, with a pipette filler (±0.02 mL)", correct: true, why: "" },
  { id: "cylinder", text: "10 mL measuring cylinder (±0.1–0.2 mL)", correct: false, why: "A 10 mL cylinder is accurate to about ±0.1–0.2 mL — 1–2 % of the aliquot — so B would be imprecise, high or low." },
  { id: "beaker", text: "Pour roughly 10 mL from a beaker", correct: false, why: "An estimated pour is not a measured volume: B's concentration would be unknown." },
] as const;

type FlaskId = "flask-a" | "flask-b";
export type CalcId = "mass" | "dilution" | "results";

/** Everything the plan retrieves from the cabinets (the balance and the wash bottle are fixed). */
const STORED_NAMES: Record<string, string> = {
  boat: "Weighing boat",
  spatula: "Spatula",
  nacl: "Sodium chloride (reagent jar)",
  beaker: "Beaker, 100 mL",
  rod: "Glass stirring rod",
  funnel: "Small glass funnel",
  "flask-a": "Volumetric flask A, 100 mL",
  "flask-b": "Volumetric flask B, 100 mL",
  pipette: "Bulb pipette, 10 mL, with filler",
};
const PLAN = EQUIPMENT_PLAN["solution-preparation"];
const STORED_IDS = Object.keys(PLAN.stored);

/**
 * Wastes (shared rules in common.ts; sources in docs/virtual-labs/PHARMACEUTICS_REFERENCE_DATA.md §6).
 *
 * Drug-free sodium chloride solution is sink-safe BECAUSE OF WHAT IT IS, not because it is dilute:
 * "Sodium Chloride (NaCl)" is on the NIH Drain Discharge Guide's approved list (Appendix B), NaCl is
 * not GHS-classified, and both ions are on the USDA ARS low-toxicity drain lists. The NIH procedure
 * runs water before and after, so the kit refuses the sink while the tap is off. Dilution never makes
 * anything sink-safe. This is the lab's stated rule; local rules can be stricter.
 *
 * The used weighing boat held only NaCl — not a drug — so it is ordinary non-hazardous `solid` waste
 * (reference data §6: "clean weighing boats, tissues, gloves (no drug)"). A boat that held a drug
 * (e.g. paracetamol in solubility-dissolution) would be `chemical-solid` instead.
 */
const SINK_WHY = "Drug-free sodium chloride solution is on the approved drain-disposal list (NIH Drain Discharge Guide), so it goes down the sink with plenty of running water — because of what it is, not because it is dilute. Anything containing a drug is collected as chemical waste.";
export const KIT = commonKit({
  stored: STORED_IDS.map((id) => ({ id, name: STORED_NAMES[id] ?? id, cabinet: PLAN.stored[id] })),
  waste: [
    { id: "boat", name: "Used weighing boat", stream: "solid", hazardous: false, why: "It held only sodium chloride — not a drug — so it is ordinary non-hazardous solid waste. A boat that held a drug would go to chemical/pharmaceutical solid waste. Boats are single-use: never returned to the cabinet." },
    { id: "pipette-rinse", name: "Stock used to rinse and adjust the pipette", stream: "sink", hazardous: false, why: SINK_WHY },
    { id: "surplus-a", name: "Surplus stock solution A (NaCl)", stream: "sink", hazardous: false, why: SINK_WHY },
    { id: "surplus-b", name: "Surplus diluted solution B (NaCl)", stream: "sink", hazardous: false, why: SINK_WHY },
    { id: "discarded-a", name: "Discarded stock (made up wrongly)", stream: "sink", hazardous: false, why: SINK_WHY },
    { id: "discarded-b", name: "Discarded dilution (made up wrongly)", stream: "sink", hazardous: false, why: SINK_WHY },
  ],
});

// ── State and actions ───────────────────────────────────────────────────────

export interface FlaskState {
  /** Water in the flask, mL (the volume of dissolved/undissolved NaCl is added on top). */
  water: number;
  dissolvedG: number;
  solidG: number;
  stoppered: boolean;
  /** Inversions since the last water was added. */
  inversions: number;
  labelled: boolean;
  fills: number;
  /** Meniscus position when it was labelled (the student's "made up" moment). */
  labelledAt: "below" | "at" | "above" | null;
}

export interface SolutionPrepState {
  seed: number;
  task: TaskId;
  bench: BenchCommon;
  retrievedEver: string[];
  /** Items that have held NaCl and must be rinsed before they are put away. */
  dirty: string[];
  lastRinse: string | null;
  lastAction: string | null;
  identified: boolean;
  planned: boolean;
  calcMass: number | null;
  calcV1: number | null;
  results: { a: number; b: number } | null;
  /** Simulated assay of both flasks, taken when the results are recorded (the flasks are emptied at clean-up). */
  assay: { a: number; b: number } | null;
  attempts: Record<CalcId, number>;
  /** Worked solutions viewed, and in which mode (Practical views cost marks). */
  worked: Record<CalcId, LabMode | null>;
  // balance
  boatMassG: number;
  boatOn: boolean;
  tareG: number;
  boatSolidG: number;
  scoops: number;
  massRecorded: number | null;
  boatUsed: boolean;
  boatResidueG: number;
  boatRinsed: boolean;
  // beaker
  beaker: { water: number; dissolvedG: number; solidG: number };
  // transfer
  funnelIn: boolean;
  transferred: boolean;
  residue: { beaker: number; rod: number; funnel: number };
  rinses: { beaker: number; rod: number; funnel: number };
  funnelRemoved: boolean;
  flaskA: FlaskState;
  flaskB: FlaskState;
  pipette: { ml: number; naclG: number; stockRinsed: boolean; at: FlaskId | null; draws: number };
  aliquotMl: number | null;
}

export type SolutionPrepAction =
  | CommonAction
  | { type: "inspect"; id: string }
  | { type: "identify"; choice: string }
  | { type: "plan"; stock: string; aliquot: string }
  | { type: "calcMass"; value: number }
  | { type: "calcDilution"; value: number }
  | { type: "recordResults"; a: number; b: number }
  | { type: "worked"; calc: CalcId; mode: LabMode }
  | { type: "placeBoat" }
  | { type: "tare" }
  | { type: "addSolid"; amount: "scoop" | "small" | "tap" }
  | { type: "removeSolid" }
  | { type: "recordMass"; value: number }
  | { type: "tipIntoBeaker" }
  | { type: "rinseBoat" }
  | { type: "addWater"; target: "beaker" | FlaskId; amount: "portion" | "fill" | "squirt" | "drop" | "drops5" }
  | { type: "stir" }
  | { type: "placeFunnel" }
  | { type: "transfer" }
  | { type: "rinseInto"; item: "beaker" | "rod" | "funnel" }
  | { type: "removeFunnel" }
  | { type: "swirl"; flask: FlaskId }
  | { type: "stopper"; flask: FlaskId; on: boolean }
  | { type: "invert"; flask: FlaskId }
  | { type: "label"; flask: FlaskId }
  | { type: "discard"; flask: FlaskId }
  | { type: "empty"; flask: FlaskId }
  | { type: "pipetteRinse" }
  | { type: "pipetteDraw"; method: "filler" | "mouth" }
  | { type: "pipetteDrain"; amount: "little" | "drop" }
  | { type: "pipetteDeliver"; style: "touch" | "blow" };

// ── Derived quantities ──────────────────────────────────────────────────────

export const taskOf = (s: SolutionPrepState) => TASKS[s.task];

/** Exact mass (g) the task needs, from its own measure. */
export const targetMassG = (s: SolutionPrepState) => massForConcentration(taskOf(s).unit, taskOf(s).stock, METHOD.flaskMl);

/** V1 (mL) for the stated dilution, by C1V1 = C2V2. */
export const targetV1Ml = (s: SolutionPrepState) => dilutionStockVolume(taskOf(s).stock, taskOf(s).dilute, METHOD.flaskMl);

export const flaskMl = (f: FlaskState) => solutionVolumeMl(f.water, f.dissolvedG, f.solidG);
export const flaskMeniscus = (f: FlaskState) => meniscusPosition(flaskMl(f), METHOD.flaskMl, METHOD.meniscusBandMl);
export const flaskMixed = (f: FlaskState) => f.inversions >= METHOD.inversionsNeeded;

/** The analytical balance's display, g: gross − tare, with the last digit's ±1 flicker once something is on the pan. */
export function balanceReading(s: SolutionPrepState): number {
  const gross = s.boatOn ? s.boatMassG + s.boatSolidG : 0;
  const flicker = s.boatOn && s.boatSolidG > 0 ? (Math.floor(rand(s.seed, 71, s.scoops) * 3) - 1) * METHOD.readabilityG : 0;
  return round(gross - s.tareG + flicker, 4);
}

/** The concentrations the student's own record gives (task unit), or NaN before the mass is recorded. */
export function recordedConcentrations(s: SolutionPrepState) {
  const unit = taskOf(s).unit;
  const a = s.massRecorded === null ? NaN : concentrationFromMass(unit, s.massRecorded, METHOD.flaskMl);
  const b = (a * METHOD.pipetteMl) / METHOD.flaskMl;
  return { a, b };
}

/** What an assay of each flask would find (simulated truth, task unit). B is the sample a student would draw. */
export function trueConcentrations(s: SolutionPrepState) {
  const unit = taskOf(s).unit;
  const A = s.flaskA;
  const B = s.flaskB;
  const a = A.dissolvedG + A.solidG > 0 ? fromGPerMl(unit, trueConcentrationGPerMl(A.water, A.dissolvedG, A.solidG)) : NaN;
  const bRaw = B.dissolvedG > 0 ? fromGPerMl(unit, trueConcentrationGPerMl(B.water, B.dissolvedG, B.solidG)) : NaN;
  const b = bRaw * (flaskMixed(B) ? 1 : METHOD.unmixedTopFactor);
  return { a, b };
}

/** The simulated assay the report shows: the snapshot taken at recording, else the flasks as they are now. */
export const assayOf = (s: SolutionPrepState) => s.assay ?? trueConcentrations(s);

const cabinetOf = (item: string): CabinetId => PLAN.stored[item];

function cleanupDone(s: SolutionPrepState) {
  const b = s.bench;
  return (
    s.results !== null &&
    b.pending.length === 0 &&
    b.disposed.some((d) => d.id === "boat") &&
    STORED_IDS.every((id) => !b.out.includes(id)) &&
    s.dirty.length === 0 &&
    !b.tap &&
    b.open === null
  );
}

// ── Worked solutions (rendered in the notebook; scored in Practical) ───────

export function workedSolution(s: SolutionPrepState, calc: CalcId): string[] {
  const t = taskOf(s);
  if (calc === "mass") {
    const m = targetMassG(s).toFixed(4);
    if (t.unit === "% w/v") return [`Variables: C = ${t.stockText} (g per 100 mL), V = 100.0 mL.`, "Formula: m = C × V ÷ 100.", `m = 0.900 g/100 mL × 100.0 mL = ${m} g.`];
    if (t.unit === "mg/mL") return [`Variables: C = ${t.stockText}, V = 100.0 mL.`, "Formula: m = C × V.", `m = 9.00 mg/mL × 100.0 mL = 900.0 mg = ${m} g.`];
    return [`Variables: C = ${t.stockText}, V = 100.0 mL = 0.1000 L, Mr(NaCl) = ${NACL_MR} g/mol.`, "Formula: m = C × V × Mr.", `m = 0.1500 mol/L × 0.1000 L × ${NACL_MR} g/mol = ${m} g.`];
  }
  if (calc === "dilution") {
    return [
      `Variables: C₁ = ${t.stockText} (stock A), C₂ = ${t.diluteText} (B), V₂ = 100.0 mL.`,
      "Formula: C₁V₁ = C₂V₂, so V₁ = C₂ × V₂ ÷ C₁.",
      `V₁ = ${t.diluteText} × 100.0 mL ÷ ${t.stockText} = ${targetV1Ml(s).toFixed(2)} mL — a 1 in 10 dilution, so the 10 mL bulb pipette.`,
    ];
  }
  const m = s.massRecorded;
  if (m === null) return ["Record the mass first: the results are calculated from what you actually weighed."];
  const { a, b } = recordedConcentrations(s);
  const formula =
    t.unit === "% w/v" ? `C_A = m ÷ V × 100 = ${m.toFixed(4)} g ÷ 100.0 mL × 100` : t.unit === "mg/mL" ? `C_A = m ÷ V = ${(m * 1000).toFixed(1)} mg ÷ 100.0 mL` : `C_A = m ÷ (Mr × V) = ${m.toFixed(4)} g ÷ (${NACL_MR} g/mol × 0.1000 L)`;
  return [
    `Variables: your recorded mass m = ${m.toFixed(4)} g; flask A V = 100.0 mL; aliquot V₁ = 10.00 mL; flask B V₂ = 100.0 mL.`,
    `${formula} = ${fourSf(a)} ${t.unit}.`,
    `C_B = C_A × V₁ ÷ V₂ = ${fourSf(a)} ${t.unit} × 10.00 mL ÷ 100.0 mL = ${fourSf(b)} ${t.unit}.`,
  ];
}

// ── initial / apply ────────────────────────────────────────────────────────

const emptyFlask = (): FlaskState => ({ water: 0, dissolvedG: 0, solidG: 0, stoppered: false, inversions: 0, labelled: false, fills: 0, labelledAt: null });

function initial(seed: number): SolutionPrepState {
  return {
    seed,
    task: TASK_IDS[Math.floor(rand(seed, 3) * 3)],
    bench: KIT.initial(),
    retrievedEver: [],
    dirty: [],
    lastRinse: null,
    lastAction: null,
    identified: false,
    planned: false,
    calcMass: null,
    calcV1: null,
    results: null,
    assay: null,
    attempts: { mass: 0, dilution: 0, results: 0 },
    worked: { mass: null, dilution: null, results: null },
    boatMassG: round(1.2 + rand(seed, 5) * 0.4, 4),
    boatOn: false,
    tareG: 0,
    boatSolidG: 0,
    scoops: 0,
    massRecorded: null,
    boatUsed: false,
    boatResidueG: 0,
    boatRinsed: false,
    beaker: { water: 0, dissolvedG: 0, solidG: 0 },
    funnelIn: false,
    transferred: false,
    residue: { beaker: 0, rod: 0, funnel: 0 },
    rinses: { beaker: 0, rod: 0, funnel: 0 },
    funnelRemoved: false,
    flaskA: emptyFlask(),
    flaskB: emptyFlask(),
    pipette: { ml: 0, naclG: 0, stockRinsed: false, at: null, draws: 0 },
    aliquotMl: null,
  };
}

/**
 * Mark a waste as waiting for disposal. Unlike `KIT.produce` this re-adds a waste that was already
 * disposed of once: a second boat after a remake, or more pipette rinse, is new material.
 */
const addWaste = (b: BenchCommon, id: string): BenchCommon => (b.pending.includes(id) ? b : { ...b, pending: [...b.pending, id] });

const addDirty = (s: SolutionPrepState, ...ids: string[]) => {
  const add = ids.filter((id) => !s.dirty.includes(id));
  return add.length ? [...s.dirty, ...add] : s.dirty;
};

const FLASK_KEY = { "flask-a": "flaskA", "flask-b": "flaskB" } as const;
const FLASK_NAME = { "flask-a": "flask A", "flask-b": "flask B" } as const;
const isFlask = (x: unknown): x is FlaskId => x === "flask-a" || x === "flask-b";

/** Remove `volMl` of solution from a flask, solute leaving in proportion. */
function withdraw(f: FlaskState, volMl: number): FlaskState {
  const v = flaskMl(f);
  const k = v > 0 ? Math.max(0, 1 - volMl / v) : 0;
  return { ...f, water: f.water * k, dissolvedG: f.dissolvedG * k };
}

/** Is the item still holding material (so it cannot be rinsed or put away)? */
function inUse(s: SolutionPrepState, item: string): boolean {
  switch (item) {
    case "boat":
      return s.boatOn || s.boatSolidG > 0;
    case "beaker":
      return s.beaker.water > 0 || s.beaker.dissolvedG + s.beaker.solidG > 0;
    case "funnel":
      return s.funnelIn;
    case "flask-a":
      return flaskMl(s.flaskA) > 0;
    case "flask-b":
      return flaskMl(s.flaskB) > 0;
    case "pipette":
      return s.pipette.ml > 0;
    default:
      return false;
  }
}

function applyCommon(s: SolutionPrepState, a: CommonAction): { state: SolutionPrepState; feedback: Feedback[] } {
  const same = (...fb: Feedback[]) => ({ state: s, feedback: fb });
  // Pre-checks the shared kit cannot know about. (A malformed cabinet id would throw inside the kit.)
  if (a.type === "cabinet" && !Object.values(PLAN.stored).includes(a.cabinet)) return same(refuse("There is no such cabinet in this lab."));
  if (a.type === "rinse") {
    if (a.item === "boat") return same(refuse("Weighing boats are single-use — dispose of it at the waste station instead of washing it."));
    if (a.item === "nacl") return same(refuse("Never wet a reagent jar: water would dissolve and contaminate the salt. Close it and put it back."));
    if (inUse(s, a.item)) return same(refuse(`Empty the ${STORED_NAMES[a.item]?.toLowerCase() ?? a.item} first — it still holds material.`));
  }
  if (a.type === "return") {
    if (a.item === "boat" && s.boatUsed) return same(refuse("A used weighing boat is waste: dispose of it in the solid-waste bin, not the cabinet."));
    if (s.dirty.includes(a.item)) return same(refuse(`Rinse the ${STORED_NAMES[a.item]?.toLowerCase() ?? a.item} at the sink before putting it away.`));
  }
  if (a.type === "dispose" && a.waste === "boat" && s.boatOn) return same(refuse("The boat is still on the balance pan."));

  const r = KIT.apply(s.bench, a, { inUse: (item) => inUse(s, item) });
  if (!r.changed) return { state: s, feedback: r.feedback };
  let next: SolutionPrepState = { ...s, bench: r.bench, lastAction: a.type };
  if (a.type === "retrieve" && !s.retrievedEver.includes(a.item)) next = { ...next, retrievedEver: [...s.retrievedEver, a.item] };
  if (a.type === "rinse") {
    next = { ...next, dirty: s.dirty.filter((x) => x !== a.item), lastRinse: a.item };
    // Washing the pipette with water leaves it wet with water again.
    if (a.item === "pipette") next = { ...next, pipette: { ...next.pipette, stockRinsed: false } };
    // Washing a flask takes the label off.
    if (isFlask(a.item)) next = { ...next, [FLASK_KEY[a.item]]: { ...next[FLASK_KEY[a.item]], labelled: false } };
  }
  // A disposed boat is in the bin, no longer on the bench.
  if (a.type === "dispose" && a.waste === "boat") next = { ...next, bench: { ...next.bench, out: next.bench.out.filter((x) => x !== "boat") } };
  return { state: next, feedback: r.feedback };
}

function calcMistake(id: CalcId, entered: number, expected: number, unit: string, what: string): Feedback {
  const high = entered > expected;
  const effect = {
    mass: high ? "Weighing to that figure would make stock A too strong (high), and B with it." : "Weighing to that figure would make stock A too weak (low), and B with it.",
    dilution: high ? "Taking that volume of stock would make B too strong (high)." : "Taking that volume of stock would make B too weak (low).",
    results: "A wrong result in the record misreports the solutions you actually made, whatever their true strength.",
  }[id];
  return mistake(`calc-${id}`, 3, `${Number.isFinite(entered) ? fmt(entered, 4) : "That"} ${unit} is not the ${what} — not accepted.`, `${effect} Check the variables and units, or ask for a hint.`);
}

function apply(s: SolutionPrepState, a: SolutionPrepAction): { state: SolutionPrepState; feedback: Feedback[] } {
  const same = (...fb: Feedback[]) => ({ state: s, feedback: fb });
  const next = (patch: Partial<SolutionPrepState>, ...fb: Feedback[]) => ({ state: { ...s, ...patch, lastAction: a.type }, feedback: fb });
  const need = (...ids: string[]) => KIT.need(s.bench, ...ids);
  const t = taskOf(s);

  if (isCommonAction(a)) return applyCommon(s, a);

  switch (a.type) {
    case "inspect":
      return same();

    // ── Notebook ──────────────────────────────────────────────────────────
    case "identify": {
      if (s.identified) return same(info("The solute is already identified."));
      const o = SOLUTE_OPTIONS.find((x) => x.id === a.choice);
      if (!o) return same(refuse("Choose one of the listed substances."));
      if (!o.correct) return same(mistake("solute-identification", 3, `${o.text}: not accepted.`, `${o.why} Weighing the wrong substance, or using the wrong Mr, makes every concentration that follows wrong.`));
      return next({ identified: true }, ok(`Solute: ${o.text}. Read the jar's label against the task again before weighing.`));
    }
    case "plan": {
      if (!s.identified) return same(refuse("Identify the solute first."));
      if (s.planned) return same(info("The glassware is planned."));
      const st = STOCK_VESSELS.find((x) => x.id === a.stock);
      const al = ALIQUOT_VESSELS.find((x) => x.id === a.aliquot);
      if (!st || !al) return same(refuse("Choose a vessel for each purpose."));
      if (!st.correct) return same(mistake("wrong-glassware", 5, `${st.text} for the final volume: not accepted.`, st.why));
      if (!al.correct) return same(mistake("wrong-glassware", 5, `${al.text} for the aliquot: not accepted.`, al.why));
      return next({ planned: true }, ok("Plan: volumetric flasks for both final volumes, a 10 mL bulb pipette with a filler for the aliquot."));
    }
    case "calcMass": {
      if (!s.planned) return same(refuse("Identify the solute and plan the glassware first."));
      if (s.calcMass !== null) return same(info("The mass is calculated."));
      const req = targetMassG(s);
      if (!withinRelative(a.value, req, METHOD.calcTolerance)) {
        return next({ attempts: { ...s.attempts, mass: s.attempts.mass + 1 } }, calcMistake("mass", a.value, req, "g", `mass of NaCl for 100.0 mL of ${t.stockText}`));
      }
      return next({ calcMass: round(req, 4) }, ok(`Mass needed: ${req.toFixed(4)} g of NaCl. Weigh it within ±${METHOD.weighTolerance * 100} % (${(req * (1 - METHOD.weighTolerance)).toFixed(4)}–${(req * (1 + METHOD.weighTolerance)).toFixed(4)} g) and record exactly what the balance shows.`));
    }
    case "calcDilution": {
      if (s.calcMass === null) return same(refuse("Calculate the stock first."));
      if (s.calcV1 !== null) return same(info("V₁ is calculated."));
      const v1 = targetV1Ml(s);
      if (!Number.isFinite(a.value) || Math.abs(a.value - v1) > 0.01) {
        return next({ attempts: { ...s.attempts, dilution: s.attempts.dilution + 1 } }, calcMistake("dilution", a.value, v1, "mL", "volume of stock (V₁)"));
      }
      return next({ calcV1: round(v1, 2) }, ok(`V₁ = ${v1.toFixed(2)} mL of stock, made up to 100.0 mL.`));
    }
    case "recordResults": {
      if (!s.flaskB.labelled) return same(refuse("Prepare, mix and label both solutions before recording the results."));
      if (s.results !== null) return same(info("The results are recorded."));
      const e = recordedConcentrations(s);
      if (!withinRelative(a.a, e.a, METHOD.calcTolerance)) {
        return next({ attempts: { ...s.attempts, results: s.attempts.results + 1 } }, calcMistake("results", a.a, e.a, t.unit, "concentration of A your record gives"));
      }
      if (!withinRelative(a.b, e.b, METHOD.calcTolerance)) {
        return next({ attempts: { ...s.attempts, results: s.attempts.results + 1 } }, calcMistake("results", a.b, e.b, t.unit, "concentration of B your record gives"));
      }
      const dA = deviationPercent(e.a, t.stock);
      return next({ results: { a: a.a, b: a.b }, assay: trueConcentrations(s) }, ok(`Recorded: A = ${fourSf(a.a)} ${t.unit}, B = ${fourSf(a.b)} ${t.unit} (${dA >= 0 ? "+" : ""}${dA.toFixed(2)} % from the target). Now clean up.`));
    }
    case "worked": {
      if (!["mass", "dilution", "results"].includes(a.calc)) return same();
      if (s.worked[a.calc]) return same(info("The worked solution is open in the notebook."));
      if (a.calc === "results" && s.massRecorded === null) return same(refuse("The results are worked from your recorded mass — record it first."));
      if (a.mode === "practical") {
        if (s.attempts[a.calc] === 0) return same(refuse("In Practical mode the worked solution is offered only after your first attempt. Try it, or ask for a hint."));
        return next(
          { worked: { ...s.worked, [a.calc]: "practical" } },
          mistake(`worked-solution-${a.calc}`, 4, "Worked solution viewed in a Practical run.", "The calculation is no longer independent work, so it costs technique marks. The solution itself is not affected."),
        );
      }
      return next({ worked: { ...s.worked, [a.calc]: "learning" } }, info("Worked solution shown in the notebook (free in Learning mode)."));
    }

    // ── Analytical balance ───────────────────────────────────────────────
    case "placeBoat": {
      const n = need("boat");
      if (n) return same(n);
      if (s.boatUsed) return same(refuse("That boat is used. Dispose of it and take a fresh one."));
      if (s.boatOn) return same(info("The boat is already on the pan."));
      return next({ boatOn: true }, info("Weighing boat on the pan, draught-shield doors closed. Tare before adding the salt."));
    }
    case "tare":
      if (!s.boatOn) return same(refuse("Place the empty weighing boat on the pan, then tare."));
      if (s.boatSolidG > 0) return same(refuse("Tare with the empty boat only."));
      return next({ tareG: s.boatMassG }, ok("Tared: 0.0000 g."));
    case "addSolid": {
      if (s.calcMass === null) return same(refuse("Calculate the mass first — you need to know what to weigh."));
      const n = need("spatula", "nacl");
      if (n) return same(n);
      if (!s.boatOn) return same(refuse("Place a weighing boat on the pan first."));
      if (s.massRecorded !== null) return same(refuse("The mass is already recorded."));
      const r = rand(s.seed, 41, s.scoops);
      const g = a.amount === "scoop" ? 0.22 + r * 0.12 : a.amount === "small" ? 0.035 + r * 0.03 : 0.003 + r * 0.005;
      const fb: Feedback[] = [];
      if (s.tareG === 0 && s.boatSolidG === 0) {
        fb.push(mistake("not-tared", 8, "Salt added without taring the boat.", `The display includes the boat (${s.boatMassG.toFixed(4)} g). A mass recorded from it is too high, so every concentration you calculate from it is too high — the flask holds less NaCl than you report.`));
      }
      return next({ boatSolidG: round(s.boatSolidG + g, 5), scoops: s.scoops + 1, dirty: addDirty(s, "spatula") }, ...fb);
    }
    case "removeSolid": {
      if (s.boatSolidG <= 0 || s.massRecorded !== null) return same(refuse("There is nothing to take off."));
      const g = 0.003 + rand(s.seed, 43, s.scoops) * 0.008;
      return next({ boatSolidG: round(Math.max(0, s.boatSolidG - g), 5), scoops: s.scoops + 1 }, info("A little salt taken back off with the spatula (never back into the jar)."));
    }
    case "recordMass": {
      if (!s.boatOn || s.boatSolidG <= 0) return same(refuse("Weigh the salt first."));
      if (s.massRecorded !== null) return same(info("The mass is recorded."));
      const disp = balanceReading(s);
      if (!Number.isFinite(a.value) || Math.abs(a.value - disp) > 0.00005) {
        return same(mistake("mass-transcription", 3, `You wrote ${fmt(a.value, 4)} g; the display reads ${disp.toFixed(4)} g.`, "Copy every digit the balance shows. A transcription error goes straight into every concentration you report."));
      }
      const fb: Feedback[] = [];
      const target = s.calcMass ?? NaN;
      const dev = deviationPercent(s.boatSolidG, target);
      if (Math.abs(dev) > METHOD.weighTolerance * 100) {
        fb.push(mistake("weight-out-of-tolerance", 6, `The salt weighed (${s.boatSolidG.toFixed(4)} g) is ${dev > 0 ? "above" : "below"} the calculated mass by ${Math.abs(dev).toFixed(1)} %.`, `Outside the ±${METHOD.weighTolerance * 100} % tolerance: stock A, and B with it, will be ${dev > 0 ? "stronger (high)" : "weaker (low)"} than the task's strength. Adjust with the spatula before recording.`));
      }
      return next({ massRecorded: round(a.value, 4) }, ...fb, ok(`Mass recorded: ${a.value.toFixed(4)} g.`));
    }
    case "tipIntoBeaker": {
      if (s.massRecorded === null) return same(refuse("Record the mass before transferring the salt."));
      if (s.boatUsed) return same(info("The salt is already in the beaker."));
      const n = need("beaker");
      if (n) return same(n);
      const res = s.boatSolidG * METHOD.residue.boat;
      return {
        state: {
          ...s,
          lastAction: a.type,
          boatOn: false,
          boatUsed: true,
          boatResidueG: res,
          boatSolidG: 0,
          beaker: { ...s.beaker, solidG: s.beaker.solidG + s.boatSolidG - res },
          bench: addWaste(s.bench, "boat"),
          dirty: addDirty(s, "beaker"),
        },
        feedback: [info("Salt tipped into the beaker. A few grains cling to the boat — wash them in with purified water.")],
      };
    }
    case "rinseBoat": {
      if (!s.boatUsed) return same(refuse("Tip the salt into the beaker first."));
      if (s.transferred) return same(refuse("The beaker's contents are already in the flask."));
      if (s.boatRinsed) return same(info("The boat is already washed into the beaker."));
      if (!s.bench.out.includes("boat")) return same(refuse("The boat is already in the bin — those grains are lost."));
      const back = s.boatResidueG * METHOD.rinseRecovery.boat;
      return next({ boatRinsed: true, boatResidueG: s.boatResidueG - back, beaker: { ...s.beaker, solidG: s.beaker.solidG + back, water: s.beaker.water + METHOD.rinseMl.boat } }, ok("Boat washed into the beaker with the wash bottle."));
    }

    // ── Wash bottle / beaker ─────────────────────────────────────────────
    case "addWater": {
      if (a.target === "beaker") {
        if (a.amount !== "portion") return same(refuse("Add water to the beaker in portions."));
        const n = need("beaker");
        if (n) return same(n);
        if (s.transferred) return same(refuse("The solution is already in the flask."));
        if (s.beaker.water + METHOD.beakerPortionMl > METHOD.beakerMaxMl) return same(refuse(`Dissolve in a portion only — about 30–40 mL. More leaves no room in the flask for the rinses.`));
        return next({ beaker: { ...s.beaker, water: s.beaker.water + METHOD.beakerPortionMl }, dirty: addDirty(s, "beaker") }, info(`${METHOD.beakerPortionMl} mL of purified water added to the beaker.`));
      }
      if (!isFlask(a.target)) return same();
      const key = FLASK_KEY[a.target];
      const f = s[key];
      if (a.target === "flask-a" && !s.transferred) return same(refuse("Transfer the dissolved salt into flask A first."));
      if (a.target === "flask-a" && !s.funnelRemoved) return same(refuse("Rinse the beaker, rod and funnel into the flask, then lift the funnel out before making up."));
      if (a.target === "flask-b" && s.aliquotMl === null) return same(refuse("Pipette the aliquot of stock into flask B first."));
      if (f.stoppered) return same(refuse(`Take the stopper out of ${FLASK_NAME[a.target]} first.`));
      const before = flaskMl(f);
      let water = f.water;
      let fills = f.fills;
      if (a.amount === "fill") {
        if (before >= METHOD.flaskMl - 3) return same(refuse("You are near the mark: add the last water in small portions, then dropwise."));
        const gap = round(1.4 + rand(s.seed, 81, a.target === "flask-a" ? 1 : 2, f.fills) * 1.0, 2);
        water += METHOD.flaskMl - gap - before;
        fills += 1;
      } else if (a.amount === "squirt") water += METHOD.squirtMl;
      else if (a.amount === "drop") water += METHOD.dropMl;
      else if (a.amount === "drops5") water += 5 * METHOD.dropMl;
      else return same();
      const nf: FlaskState = { ...f, water, fills, inversions: 0 };
      const after = flaskMl(nf);
      const fb: Feedback[] = [];
      const final = a.amount !== "fill";
      if (final && f.solidG > METHOD.solidThresholdG) {
        fb.push(mistake("made-up-before-dissolved", 5, `Making ${FLASK_NAME[a.target]} up to the mark with crystals still undissolved.`, "Crystals take up more room than the same salt dissolved: once they dissolve the volume shrinks below the mark, so the solution ends up slightly stronger (high) than calculated. Dissolve completely — swirl — before the final adjustment."));
      }
      if (meniscusPosition(after, METHOD.flaskMl, METHOD.meniscusBandMl) === "above" && meniscusPosition(before, METHOD.flaskMl, METHOD.meniscusBandMl) !== "above") {
        fb.push(
          mistake(
            a.target === "flask-a" ? "flask-a-over-mark" : "flask-b-over-mark",
            8,
            `The meniscus in ${FLASK_NAME[a.target]} is above the mark.`,
            `Extra water dilutes the solution, so ${a.target === "flask-a" ? "stock A (and B made from it)" : "solution B"} is weaker (low) than calculated. Pouring some out does not help — the solute goes with it. Discard and prepare it again, or the error stays in your result.`,
          ),
        );
      }
      const word = a.amount === "fill" ? "Filled with purified water to just below the neck." : a.amount === "squirt" ? "A short squirt from the wash bottle." : a.amount === "drop" ? "One drop." : "Five drops.";
      return { state: { ...s, [key]: nf, lastAction: a.type }, feedback: [...fb, info(word)] };
    }
    case "stir": {
      const n = need("rod", "beaker");
      if (n) return same(n);
      if (s.transferred) return same(refuse("The solution is already in the flask."));
      if (s.beaker.water <= 0) return same(refuse("Add a portion of purified water to the beaker first."));
      const solid = s.beaker.solidG * METHOD.stirLeft;
      const left = solid < METHOD.solidThresholdG ? 0 : solid;
      const dissolved = s.beaker.dissolvedG + s.beaker.solidG - left;
      return next({ beaker: { ...s.beaker, solidG: left, dissolvedG: dissolved }, dirty: addDirty(s, "rod") }, info(left > 0 ? "Stirred for 30 s." : "Stirred for 30 s: no crystals left — a clear solution."));
    }

    // ── Funnel, transfer, rinses ─────────────────────────────────────────
    case "placeFunnel": {
      const n = need("funnel", "flask-a");
      if (n) return same(n);
      if (s.funnelIn) return same(info("The funnel is already in flask A."));
      if (s.funnelRemoved) return same(refuse("The transfer is finished — make up to volume now."));
      return next({ funnelIn: true }, info("Funnel in the neck of flask A."));
    }
    case "transfer": {
      const n = need("beaker", "rod", "flask-a");
      if (n) return same(n);
      if (!s.funnelIn) return same(refuse("Put the funnel in flask A first — pouring into a narrow neck without one spills."));
      if (s.transferred) return same(info("Already transferred. Rinse the beaker, rod and funnel into the flask."));
      if (s.beaker.water <= 0) return same(refuse("Dissolve the salt in a portion of water first."));
      const R = METHOD.residue;
      const left = R.beaker + R.rod + R.funnel;
      const { water, dissolvedG, solidG } = s.beaker;
      const total = dissolvedG + solidG;
      const fb: Feedback[] = [];
      if (solidG > METHOD.solidThresholdG) fb.push(warn("Crystals went into the flask with the liquid. Dissolve them (swirl) before the final make-up to the mark."));
      return {
        state: {
          ...s,
          lastAction: a.type,
          transferred: true,
          beaker: { water: 0, dissolvedG: 0, solidG: 0 },
          residue: { beaker: total * R.beaker, rod: total * R.rod, funnel: total * R.funnel },
          flaskA: { ...s.flaskA, water: water * (1 - left), dissolvedG: dissolvedG * (1 - left), solidG: solidG * (1 - left) },
          dirty: addDirty(s, "flask-a", "funnel"),
        },
        feedback: [...fb, info("Poured down the rod into flask A through the funnel. Solution still clings to the beaker, rod and funnel — rinse each into the flask.")],
      };
    }
    case "rinseInto": {
      if (!s.transferred) return same(refuse("Transfer the solution first."));
      if (!s.funnelIn) return same(refuse("The funnel is out — rinse through the funnel, before you lift it out."));
      const item = a.item;
      if (!["beaker", "rod", "funnel"].includes(item)) return same();
      const ml = METHOD.rinseMl[item];
      if (flaskMl(s.flaskA) + ml > METHOD.flaskMl - 8) return same(refuse("The flask is too full for more rinses."));
      const back = s.residue[item] * METHOD.rinseRecovery[item];
      return next(
        {
          residue: { ...s.residue, [item]: s.residue[item] - back },
          rinses: { ...s.rinses, [item]: s.rinses[item] + 1 },
          flaskA: { ...s.flaskA, water: s.flaskA.water + ml, dissolvedG: s.flaskA.dissolvedG + back },
        },
        ok(`${item === "beaker" ? "Beaker" : item === "rod" ? "Rod" : "Funnel"} rinsed into the flask with about ${ml} mL of purified water.`),
      );
    }
    case "removeFunnel": {
      if (!s.funnelIn) return same(info("The funnel is not in the flask."));
      const fb: Feedback[] = [];
      if (s.transferred) {
        const skipped: string[] = [];
        if (!s.boatRinsed) skipped.push("the weighing boat");
        if (s.rinses.beaker < METHOD.minBeakerRinses) skipped.push(`the beaker (${s.rinses.beaker} of ${METHOD.minBeakerRinses} rinses)`);
        if (s.rinses.rod < 1) skipped.push("the rod");
        if (s.rinses.funnel < 1) skipped.push("the funnel");
        if (skipped.length) {
          const lost = s.residue.beaker + s.residue.rod + s.residue.funnel + (s.boatRinsed ? 0 : s.boatResidueG);
          const pct = s.massRecorded ? (lost / s.massRecorded) * 100 : 0;
          fb.push(mistake("transfer-not-quantitative", 6, `Not rinsed into the flask: ${skipped.join(", ")}.`, `About ${pct.toFixed(2)} % of the salt stayed behind, so stock A — and B made from it — is weaker (low) than your recorded mass says.`));
        }
      }
      return next({ funnelIn: false, funnelRemoved: s.transferred ? true : s.funnelRemoved }, ...fb, info("Funnel lifted out, its tip touched to the inside of the neck."));
    }

    // ── Volumetric flasks ────────────────────────────────────────────────
    case "swirl": {
      if (!isFlask(a.flask)) return same();
      const key = FLASK_KEY[a.flask];
      const f = s[key];
      if (flaskMl(f) <= 0) return same(refuse("The flask is empty."));
      if (f.stoppered) return same(refuse("Stoppered — invert it to mix instead."));
      return next({ [key]: { ...f, dissolvedG: f.dissolvedG + f.solidG, solidG: 0 } } as Partial<SolutionPrepState>, info(f.solidG > METHOD.solidThresholdG ? "Swirled until every crystal dissolved." : "Swirled."));
    }
    case "stopper": {
      if (!isFlask(a.flask)) return same();
      const key = FLASK_KEY[a.flask];
      const f = s[key];
      if (f.stoppered === a.on) return same(info(a.on ? "Already stoppered." : "The stopper is already out."));
      if (a.on && flaskMl(f) <= 0) return same(refuse("The flask is empty."));
      return next({ [key]: { ...f, stoppered: a.on } } as Partial<SolutionPrepState>, info(a.on ? `${FLASK_NAME[a.flask]} stoppered.` : `Stopper out of ${FLASK_NAME[a.flask]}.`));
    }
    case "invert": {
      if (!isFlask(a.flask)) return same();
      const key = FLASK_KEY[a.flask];
      const f = s[key];
      if (!f.stoppered) return same(refuse("Stopper the flask before inverting it."));
      const inv = f.inversions + METHOD.inversionsPerPress;
      const nf = { ...f, inversions: inv, dissolvedG: f.dissolvedG + f.solidG, solidG: 0 };
      return next({ [key]: nf } as Partial<SolutionPrepState>, info(inv >= METHOD.inversionsNeeded ? `Inverted and swirled ${inv} times — uniform.` : `Inverted ${inv} times, holding the stopper.`));
    }
    case "label": {
      if (!isFlask(a.flask)) return same();
      const key = FLASK_KEY[a.flask];
      const f = s[key];
      if (a.flask === "flask-a" && !s.funnelRemoved) return same(refuse("Make the stock up to volume before labelling it."));
      if (a.flask === "flask-b" && s.aliquotMl === null) return same(refuse("Prepare solution B before labelling it."));
      if (f.labelled) return same(info("Already labelled."));
      const at = flaskMeniscus(f);
      if (at === "empty") return same(refuse("The flask is empty."));
      if (f.fills === 0) return same(refuse("Make it up to the mark first."));
      const fb: Feedback[] = [];
      if (at === "below") {
        fb.push(mistake(a.flask === "flask-a" ? "flask-a-below-mark" : "flask-b-below-mark", 6, `${FLASK_NAME[a.flask]} labelled with the meniscus below the mark.`, `Less than 100.0 mL of solution: ${a.flask === "flask-a" ? "stock A (and B made from it) is" : "solution B is"} stronger (high) than calculated. Make up to the mark before labelling.`));
      }
      if (a.flask === "flask-b" && !flaskMixed(f)) {
        fb.push(mistake("flask-b-not-mixed", 6, "Flask B labelled without being stoppered and inverted.", "The water added at the mark floats on top: B is not uniform, and a sample from the top is weaker (low) than its label."));
      }
      const text = a.flask === "flask-a" ? `A · NaCl ${t.stockText}` : `B · NaCl ${t.diluteText} (1 in 10 of A)`;
      return next({ [key]: { ...f, labelled: true, labelledAt: at } } as Partial<SolutionPrepState>, ...fb, ok(`Labelled: ${text} · date · your initials · "for practice — not for use".`));
    }
    case "discard": {
      if (!isFlask(a.flask)) return same();
      if (a.flask === "flask-a") {
        if (!s.transferred) return same(refuse("There is nothing in flask A to discard."));
        if (s.aliquotMl !== null || s.pipette.ml > 0) return same(refuse("Solution B was made from this stock — discard B (and empty the pipette) first."));
        if (s.results !== null) return same(refuse("The results are recorded. Empty the flask at clean-up."));
        return {
          state: {
            ...s,
            lastAction: a.type,
            flaskA: emptyFlask(),
            massRecorded: null,
            boatOn: false,
            tareG: 0,
            boatSolidG: 0,
            boatUsed: false,
            boatResidueG: 0,
            boatRinsed: false,
            beaker: { water: 0, dissolvedG: 0, solidG: 0 },
            funnelIn: false,
            transferred: false,
            residue: { beaker: 0, rod: 0, funnel: 0 },
            rinses: { beaker: 0, rod: 0, funnel: 0 },
            funnelRemoved: false,
            // A boat still on the bench is reused (it was emptied); one already binned must be replaced from the cabinet.
            bench: addWaste({ ...s.bench, pending: s.bench.pending.filter((x) => x !== "boat") }, "discarded-a"),
          },
          feedback: [info("Stock A discarded. Weigh a fresh portion and prepare it again — mistakes already made stay on the record.")],
        };
      }
      if (s.aliquotMl === null) return same(refuse("There is nothing in flask B to discard."));
      if (s.results !== null) return same(refuse("The results are recorded. Empty the flask at clean-up."));
      return {
        state: { ...s, lastAction: a.type, flaskB: emptyFlask(), aliquotMl: null, bench: addWaste(s.bench, "discarded-b") },
        feedback: [info("Solution B discarded. Pipette a fresh aliquot of A and make it up again.")],
      };
    }
    case "empty": {
      if (!isFlask(a.flask)) return same();
      if (s.results === null) return same(refuse("Record and verify the results before emptying the flasks."));
      const key = FLASK_KEY[a.flask];
      if (flaskMl(s[key]) <= 0) return same(info("Already empty."));
      return {
        state: { ...s, lastAction: a.type, [key]: { ...emptyFlask(), labelled: s[key].labelled }, bench: addWaste(s.bench, a.flask === "flask-a" ? "surplus-a" : "surplus-b") },
        feedback: [info(`${FLASK_NAME[a.flask]} emptied into a waste beaker — take it to the waste station.`)],
      };
    }

    // ── Bulb pipette with filler ─────────────────────────────────────────
    case "pipetteRinse": {
      const n = need("pipette");
      if (n) return same(n);
      if (!s.flaskA.labelled) return same(refuse("Prepare, mix and label stock A first."));
      if (s.flaskA.stoppered) return same(refuse("Take the stopper out of flask A first."));
      if (s.pipette.ml > 0) return same(refuse("The pipette is full — deliver or discard its contents first."));
      if (s.aliquotMl !== null) return same(info("The aliquot is already in flask B."));
      return next(
        { flaskA: withdraw(s.flaskA, 2), pipette: { ...s.pipette, stockRinsed: true, at: "flask-a" }, dirty: addDirty(s, "pipette"), bench: addWaste(s.bench, "pipette-rinse") },
        ok("With the filler, about 2 mL of stock drawn up, rolled round the pipette to wet its walls, and run to waste."),
      );
    }
    case "pipetteDraw": {
      if (a.method === "mouth") {
        return same(mistake("mouth-pipetting", 10, "Mouth pipetting attempted — refused.", "Never pipette by mouth: liquid can reach the mouth (toxic, corrosive or infectious material in other labs). Always use the pipette filler."));
      }
      if (a.method !== "filler") return same();
      if (s.calcV1 === null) return same(refuse("Calculate V₁ (C₁V₁ = C₂V₂) in the notebook first."));
      const n = need("pipette", "flask-b");
      if (n) return same(n);
      if (!s.flaskA.labelled) return same(refuse("Prepare, mix and label stock A first."));
      if (s.flaskA.stoppered) return same(refuse("Take the stopper out of flask A first."));
      if (s.aliquotMl !== null) return same(refuse("Flask B already has its aliquot."));
      if (s.flaskA.solidG > METHOD.solidThresholdG) return same(refuse("Crystals are still undissolved in flask A — mix it first."));
      const fb: Feedback[] = [];
      let bench = s.bench;
      if (s.pipette.ml > 0) bench = addWaste(bench, "pipette-rinse"); // the old contents run to waste
      const vol = round(METHOD.pipetteMl + 0.6 + rand(s.seed, 91, s.pipette.draws) * 0.6, 2);
      let c = trueConcentrationGPerMl(s.flaskA.water, s.flaskA.dissolvedG, 0);
      if (!flaskMixed(s.flaskA)) {
        fb.push(mistake("flask-a-not-mixed", 6, "Aliquot drawn from flask A before it was stoppered and inverted.", "The water added at the mark sits on top until mixed: the aliquot comes from a weaker layer, so B is weaker (low) than calculated."));
        c *= METHOD.unmixedTopFactor;
      }
      if (!s.pipette.stockRinsed) {
        fb.push(mistake("pipette-not-rinsed", 4, "Pipette not rinsed with the stock first.", "The water film left from washing dilutes the aliquot by about 1 %, so B is weaker (low) than calculated."));
        c *= METHOD.wetPipetteFactor;
      }
      return next(
        {
          flaskA: withdraw(s.flaskA, vol),
          pipette: { ml: vol, naclG: vol * c, stockRinsed: true, at: "flask-a", draws: s.pipette.draws + 1 },
          dirty: addDirty(s, "pipette"),
          bench,
        },
        ...fb,
        info("Stock drawn up with the filler to above the mark. Wipe the outside, then run it down to the mark."),
      );
    }
    case "pipetteDrain": {
      if (s.pipette.ml <= 0) return same(refuse("The pipette is empty."));
      const x = a.amount === "little" ? METHOD.pipetteLittleMl : a.amount === "drop" ? METHOD.pipetteDropMl : NaN;
      if (!Number.isFinite(x)) return same();
      if (s.pipette.ml - x < METHOD.pipetteMl - 0.5) return same(refuse("Too low — draw up again."));
      const ml = round(s.pipette.ml - x, 3);
      return next({ pipette: { ...s.pipette, ml, naclG: (s.pipette.naclG * ml) / s.pipette.ml }, bench: addWaste(s.bench, "pipette-rinse") }, info(a.amount === "little" ? "Let a little run out, tip against the waste beaker." : "One drop released."));
    }
    case "pipetteDeliver": {
      if (s.pipette.ml <= 0) return same(refuse("Draw up the stock first."));
      const n = need("flask-b");
      if (n) return same(n);
      if (s.aliquotMl !== null) return same(refuse("Flask B already has its aliquot."));
      if (s.flaskB.stoppered) return same(refuse("Take the stopper out of flask B first."));
      if (a.style !== "touch" && a.style !== "blow") return same();
      const fb: Feedback[] = [];
      const off = s.pipette.ml - METHOD.pipetteMl;
      if (Math.abs(off) > METHOD.pipetteToleranceMl) {
        fb.push(mistake("pipette-not-at-mark", 5, `Delivered with the meniscus ${off > 0 ? "above" : "below"} the pipette's mark.`, `The aliquot is ${off > 0 ? "more" : "less"} than 10.00 mL, so B is ${off > 0 ? "stronger (high)" : "weaker (low)"} than calculated. Run the meniscus exactly to the mark first.`));
      }
      let vol = s.pipette.ml;
      if (a.style === "blow") {
        fb.push(mistake("pipette-blown-out", 3, "The last drop was blown out of the pipette.", "A bulb pipette is calibrated TO DELIVER with the tip touched to the glass and the final drop left in it. Blowing it out adds about 0.02 mL, so B is slightly stronger (high)."));
        vol += METHOD.blowOutMl;
      }
      const nacl = (s.pipette.naclG * vol) / s.pipette.ml;
      const B = s.flaskB;
      return next(
        {
          flaskB: { ...B, water: B.water + vol - nacl * DISSOLVED_ML_PER_G, dissolvedG: B.dissolvedG + nacl, inversions: 0 },
          pipette: { ...s.pipette, ml: 0, naclG: 0, at: "flask-b" },
          aliquotMl: round(vol, 3),
          dirty: addDirty(s, "flask-b"),
        },
        ...fb,
        ok("Aliquot delivered into flask B: tip against the inside of the neck, drained, held 3 s."),
      );
    }
  }
  return same();
}

// ── Steps, instruments, guidance ─────────────────────────────────────────

const STEP_DONE: Record<string, (s: SolutionPrepState) => boolean> = {
  plan: (s) => s.identified && s.planned,
  calculate: (s) => s.calcMass !== null,
  collect: (s) => STORED_IDS.every((id) => s.retrievedEver.includes(id)),
  weigh: (s) => s.massRecorded !== null,
  dissolve: (s) => s.transferred || (s.beaker.water > 0 && s.boatUsed && s.beaker.solidG <= METHOD.solidThresholdG),
  transfer: (s) => s.funnelRemoved,
  makeupA: (s) => s.flaskA.labelled || s.results !== null,
  dilutionCalc: (s) => s.calcV1 !== null,
  dilute: (s) => s.flaskB.labelled || s.results !== null,
  record: (s) => s.results !== null,
  cleanup: cleanupDone,
};

const CONTROLLERS: ControllerDef[] = [
  {
    id: "notebook",
    name: "Lab notebook",
    equipment: ["notebook"],
    actions: ["identify", "plan", "calcMass", "calcDilution", "recordResults", "worked"],
    brief: "The task, your plan and every calculation. Wrong figures are refused with the reason.",
    howTo: ["Read which measure the task uses: % w/v, mg/mL or mol/L.", "Enter each calculation before you weigh or pipette."],
    nearby: ["balance", "pipette"],
  },
  {
    id: "balance",
    name: "Analytical balance",
    equipment: ["balance", "boat", "spatula", "nacl"],
    actions: ["placeBoat", "tare", "addSolid", "removeSolid", "recordMass", "tipIntoBeaker"],
    brief: "Weigh the salt in a tared boat; record exactly what the display shows.",
    howTo: ["Boat on the pan, doors closed, then tare to 0.0000 g.", "Scoops to get close, small scoops and taps to finish."],
    nearby: ["notebook", "beaker"],
  },
  {
    id: "beaker",
    name: "Beaker and stirring rod",
    equipment: ["beaker", "rod"],
    actions: ["tipIntoBeaker", "rinseBoat", "addWater", "stir", "transfer"],
    brief: "Dissolve the salt in a portion of purified water, then pour it into flask A down the rod.",
    howTo: ["About 30 mL of water, then stir until no crystals remain.", "Pour down the rod into the funnel."],
    nearby: ["water", "flask-a", "balance"],
  },
  {
    id: "water",
    name: "Wash bottle (purified water)",
    equipment: ["water"],
    actions: ["addWater", "rinseBoat", "rinseInto"],
    brief: "Purified water for dissolving, for rinsing everything into the flask, and for making up.",
    howTo: ["Rinse the boat into the beaker, then the beaker, rod and funnel into the flask.", "Make up the last millilitres dropwise."],
    nearby: ["beaker", "flask-a", "flask-b"],
  },
  {
    id: "flask-a",
    name: "Volumetric flask A (stock)",
    equipment: ["flask-a", "funnel"],
    actions: ["placeFunnel", "transfer", "rinseInto", "removeFunnel", "addWater", "swirl", "stopper", "invert", "label", "discard", "empty"],
    brief: "Quantitative transfer, then make up to the mark, mix and label.",
    howTo: ["Fill to just below the neck, then add drops until the bottom of the meniscus sits on the mark, at eye level.", "Stopper, invert about ten times, label."],
    nearby: ["beaker", "water", "pipette"],
  },
  {
    id: "pipette",
    name: "Bulb pipette, 10 mL, with filler",
    equipment: ["pipette"],
    actions: ["stopper", "pipetteRinse", "pipetteDraw", "pipetteDrain", "pipetteDeliver"],
    brief: "Rinse it with stock, draw up above the mark, run down to the mark, deliver into flask B.",
    howTo: ["Filler only — never by mouth.", "Read the bottom of the meniscus on the mark at eye level; touch the tip to the neck to deliver."],
    nearby: ["flask-a", "flask-b"],
  },
  {
    id: "flask-b",
    name: "Volumetric flask B (dilution)",
    equipment: ["flask-b"],
    actions: ["addWater", "swirl", "stopper", "invert", "label", "discard", "empty"],
    brief: "Receives the 10 mL aliquot; make up to the mark, mix and label.",
    howTo: ["Fill to just below the neck, then dropwise to the mark.", "Stopper, invert about ten times, label."],
    nearby: ["pipette", "water"],
  },
  ...KIT.controllers,
];

const THR = METHOD.solidThresholdG;

/** Learning mode's flask pointer: water while clearly short; silent near the mark (the student's judgement). */
function makeUpPointer(fid: FlaskId, f: FlaskState): Suggestion | null {
  if (!f.stoppered) {
    if (f.solidG > THR) return { controller: fid, action: "swirl" };
    if (f.fills === 0 && flaskMl(f) < METHOD.flaskMl - 3) return { controller: fid, action: "addWater" };
    // From here the meniscus is near the mark: below, at or over it is for the student to see and decide.
    return null;
  }
  if (!flaskMixed(f)) return { controller: fid, action: "invert" };
  return { controller: fid, action: "label" };
}

/**
 * Learning mode: the next correct move as an instrument and a control — never a value. It goes
 * quiet while the balance reads near the target (recording or adjusting is the student's call),
 * while a meniscus is near a mark, and at every assessed choice it can only ring the whole choice.
 */
function suggest(s: SolutionPrepState): Suggestion | null {
  const to = (controller: string, action: string): Suggestion => ({ controller, action });
  const fetch = (item: string): Suggestion => {
    const cab = cabinetOf(item);
    return s.bench.open === cab ? to(cab, "retrieve") : to(cab, "cabinet");
  };
  if (!s.identified) return to("notebook", "identify");
  if (!s.planned) return to("notebook", "plan");
  if (s.calcMass === null) return to("notebook", "calcMass");
  const missing = STORED_IDS.find((id) => !s.retrievedEver.includes(id));
  if (missing) return fetch(missing);
  if (s.massRecorded === null) {
    if (!s.bench.out.includes("boat")) return fetch("boat");
    if (!s.boatOn) return to("balance", "placeBoat");
    if (s.tareG === 0 && s.boatSolidG === 0) return to("balance", "tare");
    const v = balanceReading(s);
    if (v < s.calcMass * 0.95) return to("balance", "addSolid");
    if (v > s.calcMass * 1.05) return to("balance", "removeSolid");
    return null;
  }
  if (!s.transferred) {
    if (!s.boatUsed) return to("balance", "tipIntoBeaker");
    if (!s.boatRinsed && s.bench.out.includes("boat")) return to("beaker", "rinseBoat");
    if (s.beaker.water < 30) return to("beaker", "addWater");
    if (s.beaker.solidG > THR) return to("beaker", "stir");
    if (!s.funnelIn) return to("flask-a", "placeFunnel");
    return to("beaker", "transfer");
  }
  if (!s.funnelRemoved) {
    if (s.rinses.beaker < METHOD.minBeakerRinses || s.rinses.rod < 1 || s.rinses.funnel < 1) return to("flask-a", "rinseInto");
    return to("flask-a", "removeFunnel");
  }
  if (!s.flaskA.labelled && s.results === null) return makeUpPointer("flask-a", s.flaskA);
  if (s.calcV1 === null) return to("notebook", "calcDilution");
  if (s.aliquotMl === null) {
    if (s.flaskA.stoppered) return to("pipette", "stopper");
    if (s.pipette.ml <= 0) return to("pipette", s.pipette.stockRinsed ? "pipetteDraw" : "pipetteRinse");
    if (s.pipette.ml > METHOD.pipetteMl + 0.3) return to("pipette", "pipetteDrain");
    return null; // the meniscus is near the pipette's mark — the student reads it
  }
  if (!s.flaskB.labelled && s.results === null) return makeUpPointer("flask-b", s.flaskB);
  if (s.results === null) return to("notebook", "recordResults");
  // clean-up
  if (flaskMl(s.flaskA) > 0) return to("flask-a", "empty");
  if (flaskMl(s.flaskB) > 0) return to("flask-b", "empty");
  // the sink takes waste only with the tap running, so the tap goes on before disposal
  const sinkWaste = s.bench.pending.some((id) => KIT.wasteById.get(id)?.stream === "sink");
  if (s.bench.pending.length) return sinkWaste && !s.bench.tap ? to("sink", "tap") : to("waste-station", "dispose");
  if (s.dirty.some((id) => s.bench.out.includes(id))) return s.bench.tap ? to("sink", "rinse") : to("sink", "tap");
  if (s.bench.tap) return to("sink", "tap");
  const away = STORED_IDS.find((id) => s.bench.out.includes(id));
  if (away) {
    const cab = cabinetOf(away);
    return s.bench.open === cab ? to(cab, "return") : to(cab, "cabinet");
  }
  if (s.bench.open) return to(s.bench.open, "cabinet");
  return null;
}

// ── Observations and report ─────────────────────────────────────────────────

const conc = (x: number, unit: string) => (Number.isFinite(x) ? `${fourSf(x)} ${unit}` : "—");
const pct = (x: number) => (Number.isFinite(x) ? `${x >= 0 ? "+" : ""}${x.toFixed(2)} %` : "—");

function observations(s: SolutionPrepState): ObservationSection[] {
  const t = taskOf(s);
  const rec = recordedConcentrations(s);
  const tru = assayOf(s);
  const done = s.results !== null;
  return [
    {
      title: "Task and plan",
      rows: [
        { label: "Task", value: `100.0 mL of NaCl ${t.stockText} (A), then 100.0 mL of ${t.diluteText} (B) by dilution — teaching values`, source: "recorded" },
        { label: "Mass calculated", value: s.calcMass !== null ? `${s.calcMass.toFixed(4)} g` : "—", source: "recorded" },
        { label: "V₁ calculated", value: s.calcV1 !== null ? `${s.calcV1.toFixed(2)} mL` : "—", source: "recorded" },
      ],
    },
    {
      title: "Weighing and transfer",
      rows: [
        { label: "Mass recorded (balance display)", value: s.massRecorded !== null ? `${s.massRecorded.toFixed(4)} g` : "—", source: "recorded" },
        { label: "Rinses into flask A", value: s.transferred ? `boat ${s.boatRinsed ? "✓" : "✗"} · beaker ×${s.rinses.beaker} · rod ×${s.rinses.rod} · funnel ×${s.rinses.funnel}` : "—", source: "observed" },
        { label: "Flask A meniscus when labelled", value: s.flaskA.labelledAt ?? "—", source: "observed" },
        { label: "Flask B meniscus when labelled", value: s.flaskB.labelledAt ?? "—", source: "observed" },
      ],
    },
    {
      title: "Results",
      rows: [
        { label: "A — your result", value: done ? conc(s.results!.a, t.unit) : "—", source: "recorded" },
        { label: "B — your result", value: done ? conc(s.results!.b, t.unit) : "—", source: "recorded" },
        { label: "A — simulated assay of the flask", value: done ? conc(tru.a, t.unit) : "—", source: "calculated" },
        { label: "B — simulated assay of the flask", value: done ? conc(tru.b, t.unit) : "—", source: "calculated" },
        { label: "A — your figure from the record, check", value: done ? conc(rec.a, t.unit) : "—", source: "calculated" },
      ],
    },
    {
      title: "Clean-up",
      rows: [
        { label: "Waste", value: s.bench.disposed.length ? s.bench.disposed.map((d) => `${KIT.wasteById.get(d.id)?.name ?? d.id} → ${d.stream}`).join("; ") : "—", source: "observed" },
        { label: "Bench", value: cleanupDone(s) ? "Rinsed, returned, cabinets closed, tap off" : "Not finished", source: "observed" },
      ],
    },
  ];
}

function report(s: SolutionPrepState): ExperimentReport {
  const t = taskOf(s);
  const u = t.unit;
  const rec = recordedConcentrations(s);
  const tru = assayOf(s);
  const m = s.massRecorded;
  const massExpr = u === "% w/v" ? `${t.stockText} = 0.900 g/100 mL × 100.0 mL` : u === "mg/mL" ? `9.00 mg/mL × 100.0 mL = 900.0 mg` : `0.1500 mol/L × 0.1000 L × ${NACL_MR} g/mol`;
  const aExpr =
    m === null ? "—" : u === "% w/v" ? `${m.toFixed(4)} g ÷ 100.0 mL × 100` : u === "mg/mL" ? `${(m * 1000).toFixed(1)} mg ÷ 100.0 mL` : `${m.toFixed(4)} g ÷ (${NACL_MR} g/mol × 0.1000 L)`;
  const devA = deviationPercent(rec.a, t.stock);
  const devB = deviationPercent(rec.b, t.dilute);
  const gapA = deviationPercent(tru.a, rec.a);
  const gapB = deviationPercent(tru.b, rec.b);
  const viewed = (Object.keys(s.worked) as CalcId[]).filter((k) => s.worked[k]);
  return {
    headline: `NaCl stock A ${conc(rec.a, u)} and dilution B ${conc(rec.b, u)} (target ${t.stockText} / ${t.diluteText})`,
    calculations: [
      { label: "Mass of NaCl for A", expression: `m = ${massExpr}`, result: `${targetMassG(s).toFixed(4)} g` },
      { label: "Stock A, from your recorded mass", expression: `C_A = ${aExpr}`, result: conc(rec.a, u) },
      { label: "Volume of stock for B (C₁V₁ = C₂V₂)", expression: `V₁ = ${t.diluteText} × 100.0 mL ÷ ${t.stockText}`, result: `${targetV1Ml(s).toFixed(2)} mL` },
      { label: "Solution B, from your stock", expression: `C_B = ${conc(rec.a, u)} × 10.00 mL ÷ 100.0 mL`, result: conc(rec.b, u) },
      { label: "Deviation of A from the target", expression: `(${conc(rec.a, u)} − ${t.stockText}) ÷ ${t.stockText} × 100`, result: pct(devA) },
      { label: "Deviation of B from the target", expression: `(${conc(rec.b, u)} − ${t.diluteText}) ÷ ${t.diluteText} × 100`, result: pct(devB) },
    ],
    outcome: [
      { label: "A within the weighing tolerance (±2 %)", value: `${conc(rec.a, u)} (${pct(devA)})`, verdict: Number.isFinite(devA) && Math.abs(devA) <= METHOD.weighTolerance * 100 ? "pass" : "fail" },
      { label: "A — what an assay would find (simulated)", value: `${conc(tru.a, u)} (${pct(gapA)} vs your result)`, verdict: Number.isFinite(gapA) && Math.abs(gapA) <= 0.3 ? "pass" : "fail" },
      { label: "B — what an assay would find (simulated)", value: `${conc(tru.b, u)} (${pct(gapB)} vs your result)`, verdict: Number.isFinite(gapB) && Math.abs(gapB) <= 0.3 ? "pass" : "fail" },
      { label: "Waste segregated and bench cleaned", value: cleanupDone(s) ? "Done" : "Not finished", verdict: cleanupDone(s) ? "pass" : "fail" },
      { label: "Worked solutions viewed", value: viewed.length ? viewed.map((k) => `${k} (${s.worked[k] === "practical" ? "Practical: −4" : "Learning: free"})`).join(", ") : "None", verdict: "info" },
    ],
    learning: [
      "Your result is calculated from what you recorded; the simulated assay shows what is really in the flask. Technique errors — skipped rinses, water past the mark, an unmixed flask — open a gap between the two that no calculation can see.",
      "A volumetric flask and a bulb pipette are for exact volumes; cylinders and beakers are not.",
      "Water past the mark cannot be taken back: the solute would leave with it. The honest fix is to prepare the solution again.",
    ],
  };
}

// ── Definition ───────────────────────────────────────────────────────────────

export const SOLUTION_PREP: ExperimentDefinition<SolutionPrepState, SolutionPrepAction> = {
  meta: LABS["solution-preparation"],
  principle: [
    "A solution's strength can be stated in several measures: % w/v is grams per 100 mL, mg/mL is milligrams per millilitre, and mol/L is moles of solute per litre (mass ÷ Mr ÷ volume in litres). Read which one the task uses before you calculate.",
    "A standard solution is made by weighing the solute accurately, dissolving it completely in part of the solvent, transferring it QUANTITATIVELY to a volumetric flask — rinsing everything it touched into the flask — and making up to the mark at eye level, then mixing by inversion.",
    "A dilution follows C₁V₁ = C₂V₂: the amount of solute in the aliquot (C₁V₁) is the amount in the diluted solution (C₂V₂). A 1 in 10 dilution takes 10.00 mL of stock to 100.0 mL.",
    "Class A glassware sets the precision: a 100 mL volumetric flask ±0.08 mL, a 10 mL bulb pipette ±0.02 mL, but a 100 mL measuring cylinder only about ±0.5–1 mL.",
    "Report what you made, not what you aimed for: the concentration comes from the mass you recorded and the volumes of the glassware you used.",
    "Teaching values: the task strengths, the ±2 % weighing tolerance and the transfer-loss figures are this lab's teaching values. 0.900 % w/v is the strength of normal saline, but this is a practice solution — never for use.",
  ],
  safety: [
    "Sodium chloride is low-hazard, but wear a lab coat and safety glasses whenever glassware and solutions are in use.",
    "Pipette with a filler only — never by mouth.",
    "Hold the stopper firmly while inverting a volumetric flask; report and clear broken glass into the sharps/broken-glass container, never the bin.",
    "Drug-free NaCl solution may go to the sink with the tap running (this lab's rule); every other waste goes to its labelled container. Diluting a waste never makes it sink-safe.",
    "This is a practice preparation, labelled 'for practice — not for use', and never given to anyone.",
  ],
  equipment: [
    { id: "notebook", name: "Lab notebook", description: "The task card and your calculations and results.", use: "Identify the solute, plan the glassware, enter each calculation, record and verify the results." },
    { id: "balance", name: "Analytical balance", description: "An electronic balance with a draught shield, reading to 0.1 mg.", use: "Weighs the NaCl in a tared boat.", spec: "Readability 0.0001 g, capacity 220 g" },
    { id: "water", name: "Wash bottle (purified water)", description: "A squeeze bottle of purified water.", use: "Dissolving, rinsing everything into the flask, and making up to volume dropwise." },
    { id: "boat", name: "Weighing boat", description: "A disposable anti-static plastic boat.", use: "Holds the salt on the pan; tared first; single-use." },
    { id: "spatula", name: "Spatula", description: "A stainless-steel spatula.", use: "Moves the salt between the jar and the boat. Excess is never returned to the jar." },
    { id: "nacl", name: "Sodium chloride (reagent jar)", description: SOLUTE_LABEL, use: "The solute. Read the label against the task." },
    { id: "beaker", name: "Beaker, 100 mL", description: "A borosilicate beaker.", use: "The salt is dissolved here in a portion of purified water." },
    { id: "rod", name: "Glass stirring rod", description: "A glass rod.", use: "Stirs the salt into solution and guides the pour into the funnel." },
    { id: "funnel", name: "Small glass funnel", description: "A short-stem funnel that fits the flask's neck.", use: "Quantitative transfer into flask A; rinsed into the flask, then lifted out." },
    { id: "flask-a", name: "Volumetric flask A, 100 mL", description: "One-mark Class A volumetric flask with a stopper.", use: "The stock (solution A) is made up to its mark.", spec: "Class A, 100 mL ± 0.08 mL at 20 °C" },
    { id: "flask-b", name: "Volumetric flask B, 100 mL", description: "One-mark Class A volumetric flask with a stopper.", use: "The 1 in 10 dilution (solution B) is made up to its mark.", spec: "Class A, 100 mL ± 0.08 mL at 20 °C" },
    { id: "pipette", name: "Bulb pipette, 10 mL, with filler", description: "One-mark Class A bulb (volumetric) pipette, to deliver, with a pipette filler.", use: "Transfers exactly 10.00 mL of stock A into flask B.", spec: "Class A, 10 mL ± 0.02 mL, TD", safety: "Filler only — never by mouth." },
    ...KIT.equipment,
  ],
  materials: [
    { id: "nacl", name: "Sodium chloride (NaCl)", detail: `AR grade, Mr ${NACL_MR} g/mol; white crystalline solid, freely soluble in water`, hazard: "Not classified as hazardous (GHS)." },
    { id: "water", name: "Purified water", detail: "Solvent and diluent" },
  ],
  steps: [
    { id: "plan", title: "Read the task and plan", objective: "Read the task card: note the measure the strength is given in, identify the solute and its Mr, and choose the glassware for each volume.", hints: ["The jar's label and the task must name the same substance.", "The final volumes need Class A volumetric glassware: a flask for 100.0 mL, a bulb pipette for the 10 mL aliquot."], focus: ["notebook", "nacl"] },
    {
      id: "calculate",
      title: "Calculate the mass",
      objective: "Calculate the mass of NaCl for 100.0 mL of the stock, from the measure the task uses, and enter it in the notebook.",
      hints: [
        `Variables: the stock's concentration C and its measure (from the task), the volume V = 100.0 mL, and — for mol/L only — Mr(NaCl) = ${NACL_MR} g/mol.`,
        "Formula: % w/v → m = C × V ÷ 100; mg/mL → m(mg) = C × V; mol/L → m = C × V(L) × Mr.",
        `Substitution: 0.900 % w/v → 0.900 g/100 mL × 100.0 mL = 0.9000 g. 9.00 mg/mL → 9.00 mg/mL × 100.0 mL = 900.0 mg = 0.9000 g. 0.1500 mol/L → 0.1500 mol/L × 0.1000 L × ${NACL_MR} g/mol = 0.8766 g.`,
      ],
      focus: ["notebook"],
    },
    { id: "collect", title: "Collect the apparatus", objective: "Take the boat, spatula, NaCl, beaker, rod, funnel, both volumetric flasks and the pipette out of their cabinets.", hints: ["Instruments are in the apparatus cabinet, glassware in the glassware cupboard, the salt in the reagent cabinet.", "Open a cabinet, take out each item, close it."], focus: ["cabinet-glass", "cabinet-instruments", "cabinet-reagents"] },
    { id: "weigh", title: "Weigh the salt", objective: "Tare the boat, weigh the calculated mass within ±2 %, and record exactly what the display shows.", hints: ["Boat on → doors closed → tare → add salt.", "Scoops to get close, small scoops and taps to finish; take a little off if you overshoot.", "Record every digit the display shows — the result is calculated from it."], focus: ["balance", "boat", "spatula", "nacl"] },
    { id: "dissolve", title: "Dissolve", objective: "Tip the salt into the beaker, wash the boat in, add about 30 mL of purified water and stir until no crystals remain.", hints: ["A portion of water only — the rinses need room in the flask.", "Keep stirring until the panel shows no crystals."], focus: ["beaker", "rod", "water"] },
    { id: "transfer", title: "Transfer quantitatively", objective: "Funnel in flask A, pour the solution down the rod, then rinse the beaker (at least twice), the rod and the funnel into the flask before lifting the funnel out.", hints: ["Solution left on any surface never reaches the flask.", "Beaker twice or three times, rod once, funnel once — then lift the funnel out."], focus: ["flask-a", "funnel", "beaker", "water"] },
    { id: "makeupA", title: "Make up stock A", objective: "Fill to just below the neck, then add water dropwise until the bottom of the meniscus sits on the mark. Stopper, invert about ten times, and label.", hints: ["Dissolve every crystal before the final adjustment.", "Near the mark use single drops, reading at eye level.", "Over the mark? It cannot be poured back — discard and prepare it again."], focus: ["flask-a", "water"] },
    {
      id: "dilutionCalc",
      title: "Calculate the dilution",
      objective: "Use C₁V₁ = C₂V₂ to find the volume of stock A for 100.0 mL of solution B, and enter it in the notebook.",
      hints: ["Variables: C₁ = stock strength, C₂ = strength of B (both from the task, same measure), V₂ = 100.0 mL.", "Formula: V₁ = C₂ × V₂ ÷ C₁.", "Substitution: for example 0.0900 % w/v × 100.0 mL ÷ 0.900 % w/v = 10.00 mL — the same 1 in 10 in every measure."],
      focus: ["notebook"],
    },
    { id: "dilute", title: "Pipette and make up B", objective: "Rinse the pipette with stock, draw up with the filler, run down to the mark, deliver into flask B, make up to the mark, mix and label.", hints: ["Filler only. Rinse with a little stock first.", "Bottom of the meniscus on the pipette's mark at eye level; touch the tip to the neck to deliver — do not blow out."], focus: ["pipette", "flask-b", "flask-a"], safety: "Never pipette by mouth." },
    {
      id: "record",
      title: "Record and verify",
      objective: "Calculate both concentrations from YOUR recorded mass and the glassware volumes, to 4 significant figures, and record them.",
      hints: ["Variables: your recorded mass m, V_A = 100.0 mL, V₁ = 10.00 mL, V₂ = 100.0 mL.", "Formula: C_A from m and V_A in the task's measure; C_B = C_A × V₁ ÷ V₂.", "Substitution: e.g. 0.9036 g ÷ 100.0 mL × 100 = 0.9036 % w/v; × 10.00 mL ÷ 100.0 mL = 0.09036 % w/v."],
      focus: ["notebook"],
    },
    { id: "cleanup", title: "Clean up", objective: "Empty both flasks, dispose of every waste in its correct stream, rinse the glassware and spatula at the sink, return everything, close the cabinets and turn the tap off.", hints: ["Turn the tap on first. A boat that held only NaCl is non-hazardous solid waste; drug-free NaCl solution may go to the sink.", "Rinse, then return each item to its own cabinet."], focus: ["waste-station", "sink", "cabinet-glass"] },
  ],
  controllers: CONTROLLERS,
  questions: [
    { id: "q1", kind: "calculation", prompt: "What mass of NaCl is needed for 250.0 mL of a 0.900 % w/v solution?", options: ["0.225 g", "2.25 g", "22.5 g", "0.900 g"], answer: 1, explanation: "0.900 g per 100 mL × 250.0 mL ÷ 100 = 2.25 g." },
    { id: "q2", kind: "calculation", prompt: `0.900 % w/v NaCl (Mr ${NACL_MR}) is how many mol/L?`, options: ["0.0154 mol/L", "0.154 mol/L", "1.54 mol/L", "0.900 mol/L"], answer: 1, explanation: "9.00 g/L ÷ 58.44 g/mol = 0.154 mol/L (154 mmol/L)." },
    { id: "q3", kind: "calculation", prompt: "How much 5.00 mg/mL stock makes 50.0 mL of a 0.500 mg/mL solution?", options: ["0.500 mL", "5.00 mL", "10.0 mL", "50.0 mL"], answer: 1, explanation: "V₁ = C₂V₂ ÷ C₁ = 0.500 × 50.0 ÷ 5.00 = 5.00 mL." },
    { id: "q4", kind: "design", prompt: "Why are the beaker, rod and funnel rinsed into the volumetric flask?", options: ["To cool the solution", "So that all the weighed solute reaches the flask (quantitative transfer)", "To sterilise the glassware", "To dilute the solution to the right strength"], answer: 1, explanation: "Solution clinging to any surface is solute lost; the rinses carry it into the flask." },
    { id: "q5", kind: "interpretation", prompt: "You added one drop too many and the meniscus is above the mark. The solution is…", options: ["Correct — the tolerance covers it", "Stronger than labelled", "Weaker than labelled; discard and prepare it again", "Fixed by pouring a drop out"], answer: 2, explanation: "Extra water dilutes it. Pouring out removes solute too, so the only honest fix is to remake it." },
    { id: "q6", kind: "viva", prompt: "Why is the bulb pipette rinsed with the stock solution before the aliquot is taken?", options: ["To warm it", "The water film left from washing would dilute the aliquot", "To calibrate it", "It is not necessary"], answer: 1, explanation: "Rinsing replaces the water film with stock, so the aliquot has the stock's concentration." },
    { id: "q7", kind: "design", prompt: "Why is the stock made up in a volumetric flask rather than a measuring cylinder?", options: ["It is faster", "A Class A flask is accurate to ±0.08 mL in 100 mL; a cylinder only to about ±0.5–1 mL", "Cylinders cannot hold salt solutions", "A flask can be heated"], answer: 1, explanation: "The flask's tolerance is several times tighter, so the concentration is known precisely." },
    { id: "q8", kind: "interpretation", prompt: "Your recorded mass gives exactly the target strength, but you skipped the rinses. An assay of the flask would show…", options: ["Exactly the target", "A higher concentration", "A lower concentration than your calculation", "No change, because the mass was right"], answer: 2, explanation: "The calculation uses the mass weighed, but part of it stayed in the beaker, rod and funnel." },
  ],
  initial,
  apply,
  suggest,
  stepComplete: (s, id) => STEP_DONE[id]?.(s) ?? false,
  benchComplete: (s) => Object.values(STEP_DONE).every((f) => f(s)),
  observations,
  report,
};

// ── Visual for the room (contract.ts SolutionPrepVisual) ────────────────────

function flaskVisual(f: FlaskState): FlaskVisual {
  return { ml: round(flaskMl(f), 3), meniscus: flaskMeniscus(f), stoppered: f.stoppered, mixed: flaskMixed(f), labelled: f.labelled, tint: 0 };
}

export function solutionPrepVisual(s: SolutionPrepState): SolutionPrepVisual {
  const t = taskOf(s);
  const beakerMl = solutionVolumeMl(s.beaker.water, s.beaker.dissolvedG, s.beaker.solidG);
  return {
    common: KIT.visual(s.bench, s.lastAction === "rinse" ? s.lastRinse : null),
    balance: { reading: balanceReading(s), boatOn: s.boatOn },
    boatSolidG: round(s.boatSolidG, 4),
    beakerMl: round(beakerMl, 2),
    beakerSolidG: round(s.beaker.solidG, 4),
    stirring: s.lastAction === "stir",
    funnelIn: s.funnelIn ? "flask-a" : null,
    flaskA: flaskVisual(s.flaskA),
    flaskB: flaskVisual(s.flaskB),
    pipette: { ml: round(s.pipette.ml, 3), over: s.pipette.ml > 0 ? "flask-a" : s.lastAction === "pipetteDeliver" ? "flask-b" : null },
    labels: {
      solute: SOLUTE_LABEL,
      flaskA: s.flaskA.labelled ? `A · NaCl ${t.stockText}` : "",
      flaskB: s.flaskB.labelled ? `B · NaCl ${t.diluteText}` : "",
    },
  };
}

/** The method's status for the catalogue (copied there by the integrator). */
export const PROCEDURE: { status: "verified" | "referenced_simulation" | "proposed"; sources: { label: string; url: string }[]; assumptions: string[] } = {
  status: "referenced_simulation",
  sources: [
    { label: "PubChem — Sodium chloride (CID 5234): molecular weight 58.44 g/mol, GHS classification", url: "https://pubchem.ncbi.nlm.nih.gov/compound/Sodium-Chloride" },
    { label: "DWK Kimble KIMAX volumetric flask, Class A, 100 mL — ±0.08 mL to contain (ASTM E288)", url: "https://www.dwk.com/kimble-kimax-volumetric-flask-class-a-tc-and-td-100-ml-28026-100?switch=US" },
    { label: "ISO 648:2008 — Laboratory glassware: single-volume pipettes (catalogue entry, Standards Council of Canada)", url: "https://scc-ccn.ca/standardsdb/standards/8145522" },
    { label: "NIH Drain Discharge Guide (2020; Appendix B lists sodium chloride as approved for drain disposal; dilution is not a route to the drain)", url: "https://nems.nih.gov/Documents/NIH_Drain_Discharge_Guide.pdf" },
    { label: "USDA ARS — Acceptable drain disposal procedures (dilute salts of listed low-toxicity cations and anions, incl. Na⁺ and Cl⁻)", url: "https://www.ars.usda.gov/northeast-area/docs/she/acceptable-drain-disposal-procedures" },
    { label: "Millero, F. J. (1971) The molal volumes of electrolytes. Chem. Rev. 71, 147–176 (apparent molar volume of NaCl)", url: "https://doi.org/10.1021/cr60270a001" },
  ],
  assumptions: [
    "The method (weigh, dissolve in a portion, quantitative transfer, make up to the mark, mix by inversion; C₁V₁ = C₂V₂ with a bulb pipette) is the standard volumetric technique taught in pharmaceutics and analytical practicals; it has not been checked against a named University of Karachi manual or by a named teacher.",
    "Task strengths (0.900 % w/v, 9.00 mg/mL, 0.1500 mol/L and their 1 in 10 dilutions) and the ±2 % weighing tolerance are teaching values.",
    "Transfer losses (0.5 % on the boat, 3 % in the beaker, 0.5 % each on rod and funnel) and rinse recoveries are teaching values chosen so skipped rinses visibly lower the result.",
    "A water-wet pipette dilutes the aliquot by 1 %, an unmixed flask's top layer is 2 % weak, and a blown-out pipette adds 0.02 mL — teaching values.",
    "Temperature is not modelled: dissolving 0.9 g of NaCl in 30 mL of water cools it by well under 1 °C, and all glassware is taken to be at its 20 °C calibration temperature.",
    "Drug-free NaCl solutions go to the sink with the tap running (NIH approved list); this is the lab's stated rule and institutions may require collection instead. The NaCl-only weighing boat is non-hazardous solid waste.",
  ],
};
