/**
 * PHARMACEUTICS — "Solubility & Dissolution Studies" (owner's shortlist, 2026-10-25): ONE
 * module, TWO activities, in the existing Pharmaceutics room.
 *
 *  A. Equilibrium solubility of paracetamol in purified water at 25 °C (shake-flask,
 *     gravimetric): excess solid, 24 h shaking in a thermostatic bath, a pre-warmed syringe
 *     filter, a 10.00 mL aliquot evaporated and dried to constant mass at 105 °C. The true
 *     value comes from PUBLISHED DATA (Granberg & Rasmuson 1999) — never a made-up number.
 *  B. Dissolution of a paracetamol 500 mg tablet MODELLED ON the USP Acetaminophen Tablets
 *     monograph (Apparatus 2, 50 rpm, 900 mL pH 5.8 phosphate buffer, 37.0 ± 0.5 °C, 30 min,
 *     UV at ~243 nm, Q = 80 %). Release is a SIMULATED first-order teaching model whose rate
 *     constant depends on paddle speed and temperature; absorbances carry seeded noise.
 *     One vessel is not a pharmacopoeial test, and the lab never claims compliance.
 *
 * Order: solubility first. The student's own solubility result is needed for the sink-
 * condition check (USP ⟨1092⟩: medium ≥ 3 × the volume the dose would saturate) that must be
 * passed before the tablet goes in — the reason a formulator measures solubility before
 * designing a dissolution test.
 *
 * Mistakes carry through: sampling before equilibrium or filtering cold makes the solubility
 * low; a wrong bath temperature moves it along the published curve; a cold or fast vessel,
 * an unreplaced sample, a skipped blank or a reading above the linear range each move the
 * dissolution figures in the direction the consequence states.
 */
import type { ControllerDef, EquipmentDef, ExperimentDefinition, ExperimentReport, Feedback, LabMode, ObservationSection, Suggestion } from "../../engine/types";
import { fmt, info, mistake, ok, rand, refuse, round, warn } from "../../engine/machine";
import { LABS } from "../../catalog";
import { WATER_DENSITY, cumulativeDissolved, gravimetricSolubility, partsSolvent, solubilityTerm, uncorrectedPercent } from "../../calculations/pharmaceutics";
import {
  approachSaturation,
  displayedAbsorbance,
  gPerKgToGPer100Ml,
  isConstantMass,
  meetsS1Unit,
  paracetamolSolubility,
  releaseRateConstant,
  sampleConcentrationMgPerMl,
  samplingTolerance,
  saturationVolumeMl,
  sinkRatio,
  stepFirstOrder,
} from "../../calculations/solubilityDissolution";
import { commonKit, isCommonAction, type BenchCommon, type CommonAction } from "./common";
import { EQUIPMENT_PLAN, type SolubilityActivity, type SolubilityDissolutionVisual } from "./contract";

// ── Method (every teaching value is labelled) ─────────────────────────────

export const METHOD = {
  drug: "Paracetamol (acetaminophen), C₈H₉NO₂",
  // A — solubility
  waterMl: 50,
  /** Density of the purified water dispensed at room temperature (≈ 22 °C, CRC table), g/mL. */
  waterDensityRoom: 0.9978,
  protocolC: 25,
  bathOptions: [20, 25, 30] as const,
  /** Laboratory air temperature — TEACHING VALUE. */
  roomC: 22,
  /** Teaching protocol: 24 h of shaking with excess solid present (Baka et al. 2008 use 24 h). */
  equilibrationH: 24,
  /** Approach-to-saturation time constants — TEACHING VALUES. */
  tauShakenH: 2.5,
  tauStillH: 15,
  boatG: 0.4120,
  aliquotMl: 10,
  filterDrawMl: 12,
  /** Fraction of the excess above the room-temperature solubility that crystallises in a cold syringe/filter — TEACHING VALUE. */
  coldFilterLoss: 0.5,
  ovenOptions: [60, 105, 180] as const,
  ovenProtocolC: 105,
  /** Ph. Eur. "dried to constant mass": consecutive weighings within 0.5 mg. */
  constantMassG: 0.0005,
  /** A warm dish reads low (convection, buoyancy) — TEACHING VALUE, g. */
  hotOffsetG: 0.003,
  /** Paracetamol melts (≈ 169 °C) and partly decomposes/sublimes when overheated — one-off TEACHING loss fraction at 180 °C. */
  meltLossFraction: 0.03,
  // B — dissolution
  doseMg: 500,
  mediumMl: 900,
  /** USP ⟨711⟩: the stated volume ± 1 %. */
  mediumTolMl: 9,
  sampleMl: 5,
  testerTempOptions: [25, 32, 37, 40] as const,
  targetC: 37,
  tempTolC: 0.5,
  heatTauMin: 6,
  coolTauMin: 30,
  rpmOptions: [25, 50, 75, 100] as const,
  protocolRpm: 50,
  /** First-order release constant at 50 rpm and 37 °C — TEACHING VALUE (≈ 97 % in 30 min). */
  kRef: 0.12,
  /** Disintegration lag before release starts — TEACHING VALUE, min. */
  lagMin: 0.5,
  schedule: [5, 10, 15, 20, 30, 45] as const,
  qTimeMin: 30,
  q: 80,
  /** After this many minutes past a time point without a sample, the point is missed — TEACHING VALUE. */
  lateMaxMin: 2,
  /** Calibration line A = slope·C(µg/mL) + intercept at ~243 nm, 1 cm — TEACHING VALUES (a real test uses USP Acetaminophen RS in the same medium). */
  slope: 0.065,
  intercept: 0.002,
  /** Upper end of the validated linear range — TEACHING VALUE. */
  linearMax: 1.0,
  /** Medium + cuvette absorbance not removed when no blank is run — TEACHING VALUE. */
  noBlankOffset: 0.04,
  absNoise: 0.004,
  dilutions: [1, 10, 25, 50, 100] as const,
  /** Tolerances for the student's arithmetic. */
  calcRelTol: 0.005,
};

/**
 * How far the METHOD is checked (LabMeta.procedure shape). `referenced_simulation`: every
 * condition is taken from a cited source and every simplification is listed, but no named
 * person has reviewed the procedure — so it is not "verified".
 */
export const PROCEDURE = {
  status: "referenced_simulation" as "verified" | "referenced_simulation" | "proposed",
  sources: [
    { label: "Granberg R.A., Rasmuson Å.C. Solubility of paracetamol in pure solvents. J. Chem. Eng. Data 1999; 44: 1391–1395 (water: 12.78 g/kg at 20 °C, 14.90 at 25 °C, 17.39 at 30 °C; preheated syringe; residue dried at 105 °C)", url: "https://doi.org/10.1021/je990124v" },
    { label: "USP 35 — Acetaminophen Tablets, Dissolution: pH 5.8 phosphate buffer 900 mL, Apparatus 2 at 50 rpm, 30 min, UV ~243 nm, Q = 80 % (as reproduced by drugfuture.com)", url: "https://www.drugfuture.com/Pharmacopoeia/USP35/data/v35300/usp35nf30s0_m200.html" },
    { label: "Dissolution Technologies Q&A (May 2013): sink condition = medium at least 3 × the volume that the dose would saturate (USP ⟨1092⟩)", url: "https://dissolutiontech.com/DTresour/201305Articles/DT201305_QA.html" },
    { label: "Sartorius — loss on drying: Ph. Eur. constant mass = two consecutive weighings within 0.5 mg (USP: 0.50 mg per g)", url: "https://www.sartorius.com/products/weighing/lab-weighing-resources/loss-on-drying" },
  ],
  assumptions: [
    "Saturated-solution density taken as that of water at the bath temperature, to convert g/kg water into g/100 mL (error < 1 %).",
    "Approach to saturation is exponential (τ 2.5 h shaken, 15 h unshaken); 24 h of shaking is the teaching protocol. The published data used ≥ 72 h.",
    "A cold (room-temperature) syringe filter crystallises half of the excess above the 22 °C solubility — a teaching value.",
    "Drying: free water leaves in the first hour at 105 °C; the last ~30 mg of moisture then falls ×0.08 per hour. Dish assumed already dried to constant mass empty.",
    "Dissolution release is SIMULATED: first order, k = 0.12 min⁻¹ at 50 rpm and 37 °C, k ∝ rpm^0.5, Arrhenius term with Ea 20 kJ/mol, lag 0.5 min, content 98.5–101 % of label (seeded).",
    "Calibration line A = 0.065·C(µg/mL) + 0.002 at ~243 nm, linear to A = 1.0; above it the display falls below the line. Teaching values, not a validated method.",
    "One vessel; the medium is assumed deaerated. The acceptance check (unit ≥ Q + 5 % = 85 %) is modelled on USP ⟨711⟩ S1 for a single unit — never a compliance claim.",
  ],
};

// ── Cabinets and waste ────────────────────────────────────────────────────

const STORED_NAMES: Record<string, string> = {
  spatula: "Spatula",
  boat: "Weighing boat",
  "syringe-filter": "Syringe and 0.45 µm membrane filter",
  sampler: "Dissolution sampling syringe (cannula filter)",
  cuvette: "Quartz cuvette (1 cm)",
  flask: "Stoppered conical flask (100 mL)",
  pipette: "10 mL bulb pipette and filler",
  dish: "Evaporating dish",
  cylinder: "1000 mL measuring cylinder",
  tubes: "Sample tubes and dilution flasks",
  drug: "Paracetamol powder (jar)",
  tablets: "Paracetamol 500 mg tablets",
  medium: "pH 5.8 phosphate buffer (deaerated)",
};

const PLAN = EQUIPMENT_PLAN["solubility-dissolution"];

/** Items that are used up (disposed as waste) rather than returned. */
const CONSUMABLE: Record<string, string> = { "drug-boat": "boat", "used-filter": "syringe-filter" };

const DRUG_WHY = "It contains dissolved drug. Pharmaceutical waste is chemical waste (NIH Waste Disposal Guide): every drug-containing liquid goes to labelled aqueous chemical waste, never the drain — and diluting it does not make it sink-safe.";
const SOLID_WHY = "It carries paracetamol. Drug-bearing solids (powder, boats that held drug, filters, dried residue) go to chemical / pharmaceutical solid waste, not the general bin.";

export const KIT = commonKit({
  stored: Object.entries(PLAN.stored).map(([id, cabinet]) => ({ id, name: STORED_NAMES[id] ?? id, cabinet })),
  waste: [
    // Drug-bearing solids → chemical/pharmaceutical solid waste; drug-bearing liquids → aqueous
    // chemical waste (hazardous: never a drain). NIH: pharmaceutical waste is chemical waste.
    { id: "drug-boat", name: "Used weighing boat (paracetamol dust)", stream: "chemical-solid", why: SOLID_WHY, hazardous: true },
    { id: "used-filter", name: "Used syringe and membrane filter (drug-bearing)", stream: "chemical-solid", why: SOLID_WHY, hazardous: true },
    { id: "filtrate-left", name: "Leftover saturated paracetamol filtrate", stream: "aqueous", why: DRUG_WHY, hazardous: true },
    { id: "suspension", name: "Saturated paracetamol suspension (flask)", stream: "aqueous", why: DRUG_WHY, hazardous: true },
    { id: "dish-residue", name: "Dried paracetamol residue (scraped from the dish)", stream: "chemical-solid", why: SOLID_WHY, hazardous: true },
    { id: "cannula-filters", name: "Used cannula filter tips (drug-bearing)", stream: "chemical-solid", why: SOLID_WHY, hazardous: true },
    { id: "vessel", name: "Spent dissolution medium with dissolved paracetamol (≈ 900 mL)", stream: "aqueous", why: `Phosphate buffer ${DRUG_WHY.charAt(0).toLowerCase()}${DRUG_WHY.slice(1)}`, hazardous: true },
    { id: "samples", name: "Sample tubes, dilutions and cuvette rinsings", stream: "aqueous", why: DRUG_WHY, hazardous: true },
  ],
});

export const WASTE_IDS = KIT.cfg.waste.map((w) => w.id);

// ── State and actions ─────────────────────────────────────────────────────

export type CalcId = "solubility" | "parts" | "sink" | "dissolved";
export const CALC_IDS: CalcId[] = ["solubility", "parts", "sink", "dissolved"];

export interface Weighing {
  /** The value the student recorded, g. */
  g: number;
  /** Cumulative oven hours when it was weighed (0 = the empty dish). */
  ovenH: number;
  hot: boolean;
}

export interface DissolutionSample {
  /** Scheduled time point, min. */
  nominal: number;
  /** Actual withdrawal time, min. */
  t: number;
  /** True concentration in the vessel when withdrawn, mg/mL (never shown). */
  cTrue: number;
  replaced: boolean;
  late: boolean;
  /** Dilution factor applied before reading (null = not yet diluted). */
  df: number | null;
  /** The absorbance the student recorded. */
  absRecorded: number | null;
  /** Whether the instrument had been blanked when it was read. */
  blanked: boolean;
}

export interface SolubilityDissolutionState {
  seed: number;
  activity: SolubilityActivity;
  bench: BenchCommon;
  /** Last item rinsed (for the room's rinse animation). */
  lastRinse: string | null;
  // A — solubility
  boat: { on: boolean; tared: boolean; drugG: number; scoops: number };
  flask: { waterMl: number; waterG: number; drugG: number; dissolvedG: number; stoppered: boolean; inBath: boolean };
  bath: { setC: number; shaking: boolean };
  /** Hours shaken at the current set-point since the last change (drug added, temperature changed). */
  eqH: number;
  totalH: number;
  filterWarm: boolean;
  syringeMl: number;
  /** Concentration of the filtrate, g/mL (null before filtering). */
  filtrateGPerMl: number | null;
  sampledAt: { setC: number; eqH: number } | null;
  dish: { emptyG: number; where: "bench" | "balance" | "oven"; liquidMl: number; residueG: number; moistureG: number; hot: boolean; ovenH: number };
  oven: { setC: number };
  ovenTooHot: boolean;
  emptyRecorded: number | null;
  /** Weighings after drying, in order. */
  weighings: Weighing[];
  // calculations
  calc: Record<CalcId, { attempts: number; worked: boolean }>;
  calcSol: { gPer100: number; mgPerMl: number } | null;
  calcParts: { parts: number; term: string } | null;
  sinkMl: number | null;
  qPercent: number | null;
  verdict: "meets" | "fails" | "not-determinable" | null;
  // B — dissolution
  cyl: { ml: number; read: number | null };
  vessel: {
    ml: number;
    filled: boolean;
    tempC: number;
    setC: number;
    rpm: number;
    verified: { tempC: number; rpm: number } | null;
    tabletIn: boolean;
    running: boolean;
    stopped: boolean;
    /** Minutes since the tablet went in. */
    t: number;
    /** Fraction of the LABEL CLAIM released so far. */
    released: number;
    removedMg: number;
    pendingReplace: boolean;
    startC: number | null;
    startRpm: number | null;
  };
  /** Released fraction can reach at most this (tablet content as a fraction of label, seeded). */
  content: number;
  samples: DissolutionSample[];
  missed: number[];
  spectro: { blanked: boolean; cuvette: "none" | "blank" | "sample" };
}

export type SolubilityDissolutionAction =
  | { type: "inspect"; id: string }
  | CommonAction
  | { type: "activity"; activity: SolubilityActivity }
  // balance
  | { type: "placeBoat" }
  | { type: "tare" }
  | { type: "addDrug" }
  | { type: "drugToFlask" }
  | { type: "dishOnBalance" }
  | { type: "recordMass"; value: number }
  // flask, water, bath
  | { type: "dispenseWater" }
  | { type: "stopper" }
  | { type: "flaskToBath" }
  | { type: "bathSet"; c: number }
  | { type: "shake"; on: boolean }
  | { type: "waitHours"; hours: number }
  | { type: "warmFilter" }
  | { type: "filter" }
  | { type: "pipetteToDish" }
  // oven
  | { type: "ovenSet"; c: number }
  | { type: "dishToOven" }
  | { type: "dry"; hours: number }
  | { type: "removeDish" }
  | { type: "cool" }
  // calculations (lab notebook)
  | { type: "calcSolubility"; gPer100: number; mgPerMl: number }
  | { type: "calcParts"; parts: number; term: string }
  | { type: "calcSink"; volumeMl: number }
  | { type: "calcDissolved"; percent: number }
  | { type: "verdict"; verdict: "meets" | "fails" | "not-determinable" }
  /** `mode` is the run's mode, passed by the panel: Practical needs a wrong attempt first. */
  | { type: "worked"; calc: CalcId; mode: LabMode }
  // dissolution
  | { type: "pourMedium"; ml: number }
  | { type: "readCylinder"; value: number }
  | { type: "mediumToVessel" }
  | { type: "testerTemp"; c: number }
  | { type: "testerRpm"; rpm: number }
  | { type: "waitMin"; minutes: number }
  | { type: "verify"; tempC: number; rpm: number }
  | { type: "dropTablet" }
  | { type: "withdraw" }
  | { type: "replace" }
  | { type: "stopTest" }
  | { type: "dilute"; factor: number }
  | { type: "blank" }
  | { type: "loadSample" }
  | { type: "recordAbs"; value: number };

// ── Derived quantities (pure; the panels and the room read these) ─────────

const rhoWater = (c: number) => WATER_DENSITY[c] ?? WATER_DENSITY[25];

/** True equilibrium solubility at a bath temperature, g/100 mL solution (from the published data). */
export function trueSolubilityGPer100(c: number): number {
  return gPerKgToGPer100Ml(paracetamolSolubility(c), rhoWater(c));
}

export const solidG = (s: SolubilityDissolutionState) => Math.max(0, round(s.flask.drugG - s.flask.dissolvedG, 4));
/** Excess solid visible in the flask (what the flask drawing shows). */
export const excessVisible = (s: SolubilityDissolutionState) => solidG(s) > 0.01;

export function balanceReading(s: SolubilityDissolutionState): number {
  if (s.dish.where === "balance") return round(s.dish.emptyG + s.dish.residueG + s.dish.moistureG - (s.dish.hot ? METHOD.hotOffsetG : 0), 4);
  if (s.boat.on) return round(METHOD.boatG + s.boat.drugG - (s.boat.tared ? METHOD.boatG : 0), 4);
  return 0;
}

/** The weighings that count toward constant mass (after drying, at distinct oven times). */
export function constantMass(s: SolubilityDissolutionState): boolean {
  const w = s.weighings;
  if (w.length < 2) return false;
  const [a, b] = w.slice(-2);
  return b.ovenH > a.ovenH && isConstantMass(a.g, b.g, METHOD.constantMassG);
}

/** Residue from the student's OWN recorded masses, g. */
export function recordedResidue(s: SolubilityDissolutionState): number | null {
  if (s.emptyRecorded === null || !constantMass(s)) return null;
  return round(s.weighings[s.weighings.length - 1].g - s.emptyRecorded, 4);
}

/** The expected answer to each calculation, from the student's own data (null until its inputs exist). */
export function expected(s: SolubilityDissolutionState) {
  const r = recordedResidue(s);
  const g100 = r === null ? null : gravimetricSolubility(r, METHOD.aliquotMl);
  const parts = s.calcSol ? partsSolvent(s.calcSol.gPer100) : null;
  const sink = s.calcSol ? saturationVolumeMl(METHOD.doseMg, s.calcSol.mgPerMl) : null;
  const rows = profile(s);
  const qRow = rows.find((x) => x.nominal === METHOD.qTimeMin) ?? null;
  return {
    residueG: r,
    gPer100: g100,
    mgPerMl: g100 === null ? null : g100 * 10,
    parts,
    term: parts === null ? null : solubilityTerm(parts),
    sinkMl: sink,
    sinkRatio: s.calcSol ? sinkRatio(METHOD.mediumMl, METHOD.doseMg, s.calcSol.mgPerMl) : null,
    q: qRow ? qRow.corrected : null,
    qRow,
  };
}

/** What the spectrophotometer displays for one sample at its current dilution (NaN = OVER). */
export function sampleAbsorbance(s: SolubilityDissolutionState, i: number, df: number | null = s.samples[i]?.df ?? null): number {
  const x = s.samples[i];
  if (!x || df === null) return NaN;
  const cUg = (x.cTrue * 1000) / df;
  const noise = (rand(s.seed, 300 + i, df) - 0.5) * METHOD.absNoise;
  const lin = METHOD.slope * cUg + METHOD.intercept + (s.spectro.blanked ? 0 : METHOD.noBlankOffset) + noise;
  const d = displayedAbsorbance(lin, METHOD.linearMax);
  return Number.isFinite(d) ? round(d, 3) : NaN;
}

/** The sample the spectrophotometer works on next: the first withdrawn and not yet recorded. */
export const nextToMeasure = (s: SolubilityDissolutionState) => s.samples.findIndex((x) => x.absRecorded === null);

/** The spectrophotometer's display: a number, "OVER", or nothing. */
export function spectroDisplay(s: SolubilityDissolutionState): number | "OVER" | null {
  if (s.spectro.cuvette === "blank") return 0;
  if (s.spectro.cuvette !== "sample") return null;
  const a = sampleAbsorbance(s, nextToMeasure(s));
  return Number.isFinite(a) ? a : "OVER";
}

/**
 * The dissolution profile — built ONLY from samples whose absorbance the student recorded.
 * Concentration comes from the stated calibration line; % dissolved uses the protocol's
 * sampling correction (volume replaced → `replace: true`), with the uncorrected value beside it.
 */
export function profile(s: SolubilityDissolutionState) {
  const rec = s.samples.filter((x) => x.absRecorded !== null);
  const conc = rec.map((x) => sampleConcentrationMgPerMl(x.absRecorded!, METHOD.slope, METHOD.intercept, x.df!));
  const cum = cumulativeDissolved(rec.map((x, i) => ({ t: x.t, c: conc[i] })), METHOD.mediumMl, METHOD.sampleMl, METHOD.doseMg, true);
  return rec.map((x, i) => ({
    nominal: x.nominal,
    t: x.t,
    a: x.absRecorded!,
    df: x.df!,
    cMgPerMl: conc[i],
    uncorrected: uncorrectedPercent(conc[i], METHOD.mediumMl, METHOD.doseMg),
    corrected: cum[i]?.percent ?? NaN,
    mg: cum[i]?.mg ?? NaN,
  }));
}

/** Model truth: % of label released by time t (min) under the protocol's conditions — the report compares with it. */
export function modelPercentAt(s: SolubilityDissolutionState, tMin: number): number {
  const k = releaseRateConstant(METHOD.kRef, METHOD.protocolRpm, METHOD.targetC);
  return 100 * s.content * (1 - Math.exp(-k * Math.max(0, tMin - METHOD.lagMin)));
}

export const vesselConcentration = (s: SolubilityDissolutionState) =>
  s.vessel.ml > 0 ? Math.max(0, s.vessel.released * METHOD.doseMg - s.vessel.removedMg) / s.vessel.ml : 0;

const allPointsDone = (s: SolubilityDissolutionState) => METHOD.schedule.every((p) => s.samples.some((x) => x.nominal === p) || s.missed.includes(p));
const qMissed = (s: SolubilityDissolutionState) => s.missed.includes(METHOD.qTimeMin);
const allMeasured = (s: SolubilityDissolutionState) => s.samples.every((x) => x.absRecorded !== null);
/** The wastes this run must dispose of (no samples taken → no sample waste or filter tips). */
export const requiredWaste = (s: SolubilityDissolutionState) => WASTE_IDS.filter((w) => s.samples.length > 0 || (w !== "samples" && w !== "cannula-filters"));

/** The worked solution for a calculation, written with the student's own numbers. */
export function workedSolution(s: SolubilityDissolutionState, calc: CalcId): string[] {
  const e = expected(s);
  switch (calc) {
    case "solubility": {
      if (e.residueG === null || s.emptyRecorded === null) return ["Dry the residue to constant mass first — the worked solution uses your weighings."];
      const last = s.weighings[s.weighings.length - 1].g;
      return [
        `Residue = final mass − empty dish = ${last.toFixed(4)} g − ${s.emptyRecorded.toFixed(4)} g = ${e.residueG.toFixed(4)} g`,
        `Solubility = residue ÷ aliquot × 100 = ${e.residueG.toFixed(4)} g ÷ ${METHOD.aliquotMl.toFixed(2)} mL × 100 = ${fmt(e.gPer100!, 3)} g/100 mL`,
        `In mg/mL: ${fmt(e.gPer100!, 3)} g/100 mL × 1000 mg/g ÷ 100 mL = ${fmt(e.mgPerMl!, 2)} mg/mL`,
      ];
    }
    case "parts": {
      if (!s.calcSol || e.parts === null) return ["Calculate the solubility first."];
      return [
        `Parts of solvent per part of solute ≈ 100 mL ÷ ${s.calcSol.gPer100.toFixed(3)} g = ${fmt(e.parts, 1)} mL per g`,
        `USP descriptive terms: 30 to 100 parts = "Sparingly soluble"; 10 to 30 = "Soluble"; 100 to 1000 = "Slightly soluble".`,
        `${fmt(e.parts, 1)} parts → ${e.term}.`,
      ];
    }
    case "sink": {
      if (!s.calcSol || e.sinkMl === null) return ["Calculate the solubility first — the sink check uses it."];
      return [
        `Volume the whole dose would saturate = dose ÷ solubility = ${METHOD.doseMg} mg ÷ ${s.calcSol.mgPerMl.toFixed(2)} mg/mL = ${fmt(e.sinkMl, 1)} mL`,
        `Sink ratio = ${METHOD.mediumMl} mL ÷ ${fmt(e.sinkMl, 1)} mL = ${fmt(e.sinkRatio!, 1)} (needs ≥ 3)`,
        "Your value is at 25 °C in water; paracetamol (pKa ≈ 9.5) is un-ionised at pH 5.8 and more soluble at 37 °C, so this is a conservative check.",
      ];
    }
    case "dissolved": {
      const rows = profile(s);
      const i = rows.findIndex((x) => x.nominal === METHOD.qTimeMin);
      if (i < 0) return ["Record the 30-minute sample's absorbance first."];
      const r = rows[i];
      const earlier = rows.slice(0, i);
      const sumC = earlier.reduce((t, x) => t + x.cMgPerMl, 0);
      return [
        `C(30 min) = (A − ${METHOD.intercept}) ÷ ${METHOD.slope} × dilution ÷ 1000 = (${r.a.toFixed(3)} − ${METHOD.intercept}) ÷ ${METHOD.slope} × ${r.df} ÷ 1000 = ${r.cMgPerMl.toFixed(4)} mg/mL`,
        `Amount = C·V₀ + v·ΣC(earlier) = ${r.cMgPerMl.toFixed(4)} mg/mL × ${METHOD.mediumMl} mL + ${METHOD.sampleMl} mL × ${sumC.toFixed(4)} mg/mL = ${r.mg.toFixed(1)} mg`,
        `% dissolved = ${r.mg.toFixed(1)} mg ÷ ${METHOD.doseMg} mg × 100 = ${r.corrected.toFixed(1)} % (uncorrected ${r.uncorrected.toFixed(1)} %)`,
      ];
    }
  }
}

// ── Initial state ─────────────────────────────────────────────────────────

const initial = (seed: number): SolubilityDissolutionState => ({
  seed,
  activity: "solubility",
  bench: KIT.initial(),
  lastRinse: null,
  boat: { on: false, tared: false, drugG: 0, scoops: 0 },
  flask: { waterMl: 0, waterG: 0, drugG: 0, dissolvedG: 0, stoppered: false, inBath: false },
  bath: { setC: 0, shaking: false },
  eqH: 0,
  totalH: 0,
  filterWarm: false,
  syringeMl: 0,
  filtrateGPerMl: null,
  sampledAt: null,
  dish: { emptyG: round(40 + rand(seed, 11) * 6, 4), where: "bench", liquidMl: 0, residueG: 0, moistureG: 0, hot: false, ovenH: 0 },
  oven: { setC: 0 },
  ovenTooHot: false,
  emptyRecorded: null,
  weighings: [],
  calc: { solubility: { attempts: 0, worked: false }, parts: { attempts: 0, worked: false }, sink: { attempts: 0, worked: false }, dissolved: { attempts: 0, worked: false } },
  calcSol: null,
  calcParts: null,
  sinkMl: null,
  qPercent: null,
  verdict: null,
  cyl: { ml: 0, read: null },
  vessel: { ml: 0, filled: false, tempC: METHOD.roomC, setC: 0, rpm: 0, verified: null, tabletIn: false, running: false, stopped: false, t: 0, released: 0, removedMg: 0, pendingReplace: false, startC: null, startRpm: null },
  content: round(0.985 + rand(seed, 21) * 0.025, 4),
  samples: [],
  missed: [],
  spectro: { blanked: false, cuvette: "none" },
});

// ── Physics steps ─────────────────────────────────────────────────────────

function soakHours(s: SolubilityDissolutionState, hours: number): SolubilityDissolutionState {
  const f = s.flask;
  const inBath = f.inBath && s.bath.setC > 0;
  const tC = inBath ? s.bath.setC : METHOD.roomC;
  const shaken = inBath && s.bath.shaking;
  const cap = Math.min(f.drugG, (paracetamolSolubility(tC) / 1000) * f.waterG);
  const dissolvedG = f.waterG > 0 && f.drugG > 0 ? approachSaturation(f.dissolvedG, cap, hours, shaken ? METHOD.tauShakenH : METHOD.tauStillH) : f.dissolvedG;
  return {
    ...s,
    flask: { ...f, dissolvedG: round(dissolvedG, 5) },
    eqH: shaken && f.stoppered ? s.eqH + hours : s.eqH,
    totalH: s.totalH + hours,
  };
}

/** Advance the dissolution vessel by `minutes` (0.05-min steps): temperature, then release. */
function advanceVessel(s: SolubilityDissolutionState, minutes: number): SolubilityDissolutionState {
  const v = { ...s.vessel };
  const steps = Math.round(minutes * 20);
  const dt = 0.05;
  for (let i = 0; i < steps; i++) {
    if (v.filled) {
      const target = v.setC > 0 ? v.setC : METHOD.roomC;
      const tau = target > v.tempC ? METHOD.heatTauMin : METHOD.coolTauMin;
      v.tempC += (target - v.tempC) * (1 - Math.exp(-dt / tau));
    }
    if (v.running && !v.stopped) {
      if (v.t + dt > METHOD.lagMin) {
        const k = releaseRateConstant(METHOD.kRef, v.rpm, v.tempC);
        v.released = stepFirstOrder(v.released, s.content, k, Math.min(dt, v.t + dt - METHOD.lagMin));
      }
      v.t = round(v.t + dt, 2);
    }
  }
  v.tempC = round(v.tempC, 3);
  return { ...s, vessel: v };
}

// ── apply ─────────────────────────────────────────────────────────────────

function inUse(s: SolubilityDissolutionState) {
  return (item: string) => {
    switch (item) {
      case "flask":
        return s.flask.waterMl > 0 || s.flask.drugG > 0;
      case "dish":
        return s.dish.residueG > 0 || s.dish.liquidMl > 0 || s.dish.where !== "bench";
      case "tubes":
        return s.samples.length > 0 && !s.bench.disposed.some((d) => d.id === "samples");
      case "cuvette":
        return s.spectro.cuvette !== "none";
      case "cylinder":
        return s.cyl.ml > 0;
      case "sampler":
        return s.vessel.running && !s.vessel.stopped;
      case "syringe-filter":
        return s.syringeMl > 0;
      case "boat":
        return s.boat.on || s.boat.drugG > 0;
      default:
        return false;
    }
  };
}

/** Clear the physical state a disposed waste came from. */
function afterDispose(s: SolubilityDissolutionState, waste: string): SolubilityDissolutionState {
  let out = s;
  const consumed = CONSUMABLE[waste];
  if (consumed) out = { ...out, bench: { ...out.bench, out: out.bench.out.filter((x) => x !== consumed) } };
  switch (waste) {
    case "suspension":
      return { ...out, flask: { waterMl: 0, waterG: 0, drugG: 0, dissolvedG: 0, stoppered: false, inBath: false }, bath: { ...out.bath, shaking: false } };
    case "filtrate-left":
      return { ...out, syringeMl: 0 };
    case "dish-residue":
      return { ...out, dish: { ...out.dish, residueG: 0, moistureG: 0, liquidMl: 0, where: "bench", hot: false } };
    case "vessel":
      return { ...out, vessel: { ...out.vessel, ml: 0, filled: false, tabletIn: false, rpm: 0 } };
    case "samples":
      return { ...out, spectro: { ...out.spectro, cuvette: "none" } };
    case "drug-boat":
      return { ...out, boat: { on: false, tared: false, drugG: 0, scoops: 0 } };
    default:
      return out;
  }
}

const relClose = (a: number, b: number, rel = METHOD.calcRelTol, abs = 0) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= Math.max(Math.abs(b) * rel, abs);

const CALC_NAMES: Record<CalcId, string> = { solubility: "solubility", parts: "parts of solvent and descriptive term", sink: "sink-condition check", dissolved: "% dissolved at 30 min" };

function wrongCalc(s: SolubilityDissolutionState, calc: CalcId, text: string, consequence: string) {
  return {
    state: { ...s, calc: { ...s.calc, [calc]: { ...s.calc[calc], attempts: s.calc[calc].attempts + 1 } } },
    feedback: [mistake(`calc-${calc}`, 4, text, consequence), info("Check the hints for this step. A worked solution is available now.")],
  };
}

function apply(s: SolubilityDissolutionState, a: SolubilityDissolutionAction): { state: SolubilityDissolutionState; feedback: Feedback[] } {
  const same = (...fb: Feedback[]) => ({ state: s, feedback: fb });
  const next = (patch: Partial<SolubilityDissolutionState>, ...fb: Feedback[]) => ({ state: { ...s, ...patch }, feedback: fb });
  const need = (...items: string[]) => KIT.need(s.bench, ...items);

  if (a.type === "inspect") return same();

  if (isCommonAction(a)) {
    const r = KIT.apply(s.bench, a, { inUse: inUse(s) });
    if (!r.changed) return same(...r.feedback);
    let st: SolubilityDissolutionState = { ...s, bench: r.bench };
    if (a.type === "rinse") st = { ...st, lastRinse: a.item };
    if (a.type === "dispose") st = afterDispose(st, a.waste);
    return { state: st, feedback: r.feedback };
  }

  const v = s.vessel;

  switch (a.type) {
    case "activity":
      if (a.activity !== "solubility" && a.activity !== "dissolution") return same();
      if (a.activity === s.activity) return same(info(`You are already on the ${a.activity} activity.`));
      return next(
        { activity: a.activity },
        info(a.activity === "dissolution" ? "Dissolution study. The tablet can go in only after the sink-condition check, which uses your solubility result." : "Solubility investigation."),
      );

    // ── A: weighing the drug ──
    case "placeBoat": {
      const n = need("boat");
      if (n) return same(n);
      if (s.dish.where === "balance") return same(refuse("Take the dish off the pan first."));
      if (s.boat.on) {
        if (s.boat.drugG > 0) return same(refuse("The boat holds powder — tip it into the flask first."));
        return next({ boat: { ...s.boat, on: false, tared: false } }, info("Empty boat taken off the pan."));
      }
      return next({ boat: { ...s.boat, on: true } }, info("Weighing boat on the pan. Tare it before adding powder."));
    }
    case "tare":
      if (!s.boat.on) return same(refuse("Place the empty weighing boat on the pan, then tare."));
      if (s.boat.drugG > 0) return same(refuse("Tare with the empty boat only."));
      return next({ boat: { ...s.boat, tared: true } }, ok("Tared: 0.0000 g."));
    case "addDrug": {
      const n = need("boat", "spatula", "drug");
      if (n) return same(n);
      if (!s.boat.on) return same(refuse("Place a weighing boat on the pan first."));
      const g = round(0.35 + rand(s.seed, 31, s.boat.scoops) * 0.2, 4);
      return next({ boat: { ...s.boat, drugG: round(s.boat.drugG + g, 4), scoops: s.boat.scoops + 1 } });
    }
    case "drugToFlask": {
      const n = need("flask");
      if (n) return same(n);
      if (s.boat.drugG <= 0) return same(refuse("Weigh some paracetamol onto the boat first."));
      if (s.flask.waterMl <= 0) return same(refuse("Put the measured purified water in the flask first, then add the powder to it."));
      const fb: Feedback[] = [info(`${s.boat.drugG.toFixed(4)} g of paracetamol tipped into the flask.`)];
      if (s.flask.inBath && s.eqH > 0) fb.push(warn("Adding powder restarts the equilibration: the 24 h count starts again."));
      return {
        state: {
          ...s,
          flask: { ...s.flask, drugG: round(s.flask.drugG + s.boat.drugG, 4), stoppered: false },
          boat: { ...s.boat, drugG: 0, on: false, tared: false, scoops: 0 },
          eqH: 0,
          bench: KIT.produce(s.bench, "drug-boat"),
        },
        feedback: fb,
      };
    }

    // ── A: flask, water, bath ──
    case "dispenseWater": {
      const n = need("flask");
      if (n) return same(n);
      if (s.flask.waterMl > 0) return same(refuse("The flask already holds its 50 mL of water."));
      return next({ flask: { ...s.flask, waterMl: METHOD.waterMl, waterG: round(METHOD.waterMl * METHOD.waterDensityRoom, 3) } }, ok(`${METHOD.waterMl}.0 mL of purified water dispensed into the conical flask.`));
    }
    case "stopper": {
      const n = need("flask");
      if (n) return same(n);
      if (s.flask.waterMl <= 0) return same(refuse("Nothing in the flask to stopper yet."));
      return next({ flask: { ...s.flask, stoppered: !s.flask.stoppered } }, info(s.flask.stoppered ? "Stopper removed." : "Flask stoppered."));
    }
    case "flaskToBath": {
      const n = need("flask");
      if (n) return same(n);
      if (s.flask.inBath) return same(info("The flask is already clamped in the bath."));
      if (s.flask.drugG <= 0) return same(refuse("Add the paracetamol to the water first."));
      if (!s.flask.stoppered) return same(refuse("Stopper the flask first — an open flask in a shaking bath splashes and evaporates."));
      return next({ flask: { ...s.flask, inBath: true } }, ok("Flask clamped in the thermostatic shaking bath."));
    }
    case "bathSet": {
      if (a.c !== 0 && !(METHOD.bathOptions as readonly number[]).includes(a.c)) return same();
      if (a.c === s.bath.setC) return same(info(a.c ? `The bath is already set to ${a.c} °C.` : "The bath is already off."));
      const fb: Feedback[] = [info(a.c ? `Bath set to ${a.c}.0 °C.` : "Bath heater off.")];
      if (s.eqH > 0 && s.flask.inBath) fb.push(warn("Changing the temperature changes the solubility: the equilibration count starts again."));
      return next({ bath: { ...s.bath, setC: a.c, shaking: a.c === 0 ? false : s.bath.shaking }, eqH: s.flask.inBath ? 0 : s.eqH }, ...fb);
    }
    case "shake":
      if (a.on && s.bath.setC === 0) return same(refuse("Switch the bath on and set its temperature first."));
      if (a.on === s.bath.shaking) return same();
      return next({ bath: { ...s.bath, shaking: a.on } }, info(a.on ? "Shaker on: the flask is swirling steadily." : "Shaker off."));
    case "waitHours": {
      if (![1, 4, 12, 24].includes(a.hours)) return same();
      if (!s.flask.inBath) return same(refuse("Clamp the stoppered flask in the bath first — then let time pass."));
      const after = soakHours(s, a.hours);
      return { state: after, feedback: [info(`${a.hours} h passed (${after.totalH} h in total, ${after.eqH} h shaken at the current setting).`)] };
    }
    case "warmFilter": {
      const n = need("syringe-filter");
      if (n) return same(n);
      if (s.bath.setC === 0) return same(refuse("The bath is off — there is nothing to warm the syringe and filter to."));
      if (s.filterWarm) return same(info("The syringe and filter are already at the bath temperature."));
      return next({ filterWarm: true }, ok(`Syringe and filter held in the bath for 10 min: now at ${s.bath.setC} °C.`));
    }
    case "filter": {
      const n = need("syringe-filter");
      if (n) return same(n);
      if (s.filtrateGPerMl !== null) return same(refuse("You already have the filtered sample — this syringe filter is single-use."));
      if (!s.flask.inBath || s.flask.drugG <= 0) return same(refuse("Sample from the flask while it stands in the bath at temperature."));
      if (!excessVisible(s)) {
        return same(
          mistake(
            "no-excess-solid",
            8,
            "Tried to sample a flask with no undissolved solid left.",
            "Without excess solid the solution is not saturated — 'it all dissolved' is not equilibrium, it only shows you added too little. A sample now would read LOW. Add more powder and equilibrate again.",
          ),
        );
      }
      const fb: Feedback[] = [];
      const setC = s.bath.setC;
      let ratio = s.flask.dissolvedG / s.flask.waterG;
      if (s.eqH < METHOD.equilibrationH) {
        fb.push(mistake("sampled-before-equilibrium", 8, `Sampled after only ${s.eqH} h of shaking at this setting.`, `The protocol needs ${METHOD.equilibrationH} h with excess solid. Before equilibrium the solution is still below saturation, so the solubility comes out LOW.`));
      }
      if (setC !== METHOD.protocolC) {
        fb.push(mistake("wrong-bath-temperature", 6, `Equilibrated at ${setC} °C instead of ${METHOD.protocolC} °C.`, `Paracetamol's solubility rises with temperature, so the result is ${setC > METHOD.protocolC ? "HIGH" : "LOW"} against the ${METHOD.protocolC} °C value it is meant to measure.`));
      }
      if (!s.filterWarm && setC > METHOD.roomC) {
        const roomRatio = paracetamolSolubility(METHOD.roomC) / 1000;
        if (ratio > roomRatio) ratio = roomRatio + (ratio - roomRatio) * (1 - METHOD.coldFilterLoss);
        fb.push(mistake("filter-not-warmed", 4, "Filtered through a syringe and filter at room temperature.", `The saturated solution cools in the cold syringe and some paracetamol crystallises on the membrane, so the filtrate — and the solubility — read LOW. Pre-warm them to the bath temperature (${setC} °C).`));
      }
      const gPerMl = gPerKgToGPer100Ml(ratio * 1000, rhoWater(setC)) / 100;
      return {
        state: { ...s, syringeMl: METHOD.filterDrawMl, filtrateGPerMl: gPerMl, sampledAt: { setC, eqH: s.eqH }, bench: KIT.produce(s.bench, "used-filter") },
        feedback: [...fb, ok(`About ${METHOD.filterDrawMl} mL of clear saturated solution drawn and filtered.`)],
      };
    }
    case "pipetteToDish": {
      const n = need("pipette", "dish");
      if (n) return same(n);
      if (s.filtrateGPerMl === null || s.syringeMl < METHOD.aliquotMl) return same(refuse("Filter the saturated solution first."));
      if (s.emptyRecorded === null) return same(refuse("Weigh the empty dish and record its mass first — you cannot weigh it empty afterwards."));
      if (s.dish.liquidMl > 0 || s.dish.residueG > 0) return same(refuse("The dish already holds the aliquot."));
      const residueG = round(s.filtrateGPerMl * METHOD.aliquotMl, 6);
      return {
        state: {
          ...s,
          syringeMl: s.syringeMl - METHOD.aliquotMl,
          dish: { ...s.dish, where: "bench", liquidMl: METHOD.aliquotMl, residueG, moistureG: round(METHOD.aliquotMl * 0.997, 4), hot: false },
          bench: KIT.produce(s.bench, "filtrate-left", "suspension"),
        },
        feedback: [ok(`${METHOD.aliquotMl.toFixed(2)} mL of filtrate pipetted into the dish.`)],
      };
    }

    // ── A: oven and weighing ──
    case "ovenSet":
      if (a.c !== 0 && !(METHOD.ovenOptions as readonly number[]).includes(a.c)) return same();
      if (a.c === s.oven.setC) return same();
      return next({ oven: { setC: a.c } }, a.c >= 160 ? warn(`At ${a.c} °C paracetamol (m.p. ≈ 169 °C) melts and decomposes.`) : info(a.c ? `Oven set to ${a.c} °C.` : "Oven off."));
    case "dishToOven": {
      const n = need("dish");
      if (n) return same(n);
      if (s.dish.liquidMl <= 0 && s.dish.residueG <= 0) return same(refuse("Pipette the aliquot into the dish first."));
      if (s.dish.where === "oven") return same(info("The dish is already in the oven."));
      return next({ dish: { ...s.dish, where: "oven" } }, info("Dish on the oven shelf."));
    }
    case "dry": {
      if (![1, 2].includes(a.hours)) return same();
      if (s.dish.where !== "oven") return same(refuse("Put the dish in the oven first."));
      if (s.oven.setC === 0) return same(refuse("Switch the oven on and set its temperature."));
      const c = s.oven.setC;
      let { moistureG, residueG } = s.dish;
      const evap = c >= 180 ? 40 : c >= 105 ? 12 : 4;
      const decay = c >= 180 ? 0.03 : c >= 105 ? 0.08 : 0.35;
      for (let h = 0; h < a.hours; h++) {
        if (moistureG > 0.03) moistureG = Math.max(0.03, moistureG - evap);
        else moistureG *= decay;
      }
      // Melting and partial decomposition: a one-off loss the first time it is overheated.
      if (c >= 180 && !s.ovenTooHot) residueG *= 1 - METHOD.meltLossFraction;
      const fb: Feedback[] = [info(`Dried ${a.hours} h at ${c} °C.`)];
      if (c >= 180 && !s.ovenTooHot) fb.push(mistake("oven-too-hot", 6, `Dried at ${c} °C.`, "Above its melting point (≈ 169 °C) paracetamol melts, decomposes and partly sublimes: residue is lost and the solubility comes out LOW. Dry at 105 °C."));
      return {
        state: { ...s, ovenTooHot: s.ovenTooHot || c >= 180, dish: { ...s.dish, moistureG: round(moistureG, 6), residueG: round(residueG, 6), liquidMl: moistureG > 0.5 ? s.dish.liquidMl : 0, ovenH: s.dish.ovenH + a.hours } },
        feedback: fb,
      };
    }
    case "removeDish":
      if (s.dish.where !== "oven") return same(refuse("The dish is not in the oven."));
      return next({ dish: { ...s.dish, where: "bench", hot: s.oven.setC > 40 } }, info(s.oven.setC > 40 ? "Dish out of the oven — it is hot." : "Dish out of the oven."));
    case "cool":
      if (s.dish.where === "oven") return same(refuse("Take the dish out of the oven first."));
      if (!s.dish.hot) return same(info("The dish is already at room temperature."));
      return next({ dish: { ...s.dish, hot: false } }, ok("Cooled for 30 min in the desiccator beside the oven: at room temperature, kept dry."));
    case "dishOnBalance": {
      const n = need("dish");
      if (n) return same(n);
      if (s.boat.on) return same(refuse("Take the weighing boat off the pan first."));
      if (s.dish.where === "balance") return next({ dish: { ...s.dish, where: "bench" } }, info("Dish taken off the pan."));
      if (s.dish.where === "oven") return same(refuse("Take the dish out of the oven first."));
      return next({ dish: { ...s.dish, where: "balance" } }, info("Dish on the analytical balance; doors closed."));
    }
    case "recordMass": {
      if (s.dish.where !== "balance") return same(refuse("Put the dish on the balance to weigh it."));
      const shown = balanceReading(s);
      if (!Number.isFinite(a.value) || Math.abs(a.value - shown) > 0.00006) {
        return same(mistake("misread-balance", 3, `You wrote ${fmt(a.value, 4)} g; the display reads ${shown.toFixed(4)} g.`, "Record exactly what the balance shows, to 0.1 mg."));
      }
      const empty = s.dish.liquidMl <= 0 && s.dish.residueG <= 0;
      if (empty) {
        if (s.emptyRecorded !== null) return same(info("The empty dish mass is already recorded."));
        return next({ emptyRecorded: round(a.value, 4) }, ok(`Empty dish: ${a.value.toFixed(4)} g.`));
      }
      if (s.dish.ovenH === 0 || s.dish.liquidMl > 0) return same(refuse("The dish still holds liquid — evaporate and dry it in the oven before weighing."));
      if (s.weighings.some((w) => w.ovenH === s.dish.ovenH)) return same(refuse("You have already weighed it at this stage — dry it further, cool it, then weigh again."));
      const fb: Feedback[] = [];
      if (s.dish.hot) fb.push(mistake("weighed-hot", 5, "Weighed the dish while still hot.", "A warm dish sets up convection currents and reads LOW, so the residue and the solubility come out low. Cool it in the desiccator first."));
      const st: SolubilityDissolutionState = { ...s, weighings: [...s.weighings, { g: round(a.value, 4), ovenH: s.dish.ovenH, hot: s.dish.hot }] };
      if (constantMass(st)) {
        return { state: { ...st, bench: KIT.produce(st.bench, "dish-residue") }, feedback: [...fb, ok(`${a.value.toFixed(4)} g — within 0.5 mg of the previous weighing: dried to constant mass.`)] };
      }
      const prev = s.weighings[s.weighings.length - 1];
      return { state: st, feedback: [...fb, info(prev ? `${a.value.toFixed(4)} g recorded. Differs from the last weighing by ${(Math.abs(a.value - prev.g) * 1000).toFixed(1)} mg — not yet constant.` : `${a.value.toFixed(4)} g recorded. Dry again and re-weigh to show constant mass.`)] };
    }

    // ── Calculations (lab notebook) ──
    case "calcSolubility": {
      if (s.calcSol) return same(info("Solubility already calculated."));
      const e = expected(s);
      if (e.gPer100 === null) return same(refuse("Dry the residue to constant mass first — the calculation uses your weighings."));
      if (!relClose(a.gPer100, e.gPer100, METHOD.calcRelTol, 0.002)) return wrongCalc(s, "solubility", `${fmt(a.gPer100, 3)} g/100 mL does not follow from your weighings.`, "Solubility (g/100 mL) = residue (g) ÷ aliquot (mL) × 100, with residue = final mass − empty dish.");
      if (!relClose(a.mgPerMl, e.mgPerMl!, METHOD.calcRelTol, 0.02)) return wrongCalc(s, "solubility", `${fmt(a.mgPerMl, 2)} mg/mL is not the same solubility in mg/mL.`, "g/100 mL × 1000 mg/g ÷ 100 mL = g/100 mL × 10 = mg/mL.");
      return next({ calcSol: { gPer100: round(a.gPer100, 4), mgPerMl: round(a.mgPerMl, 3) } }, ok(`Solubility ${a.gPer100.toFixed(3)} g/100 mL = ${a.mgPerMl.toFixed(2)} mg/mL.`));
    }
    case "calcParts": {
      if (s.calcParts) return same(info("Already classified."));
      const e = expected(s);
      if (e.parts === null) return same(refuse("Calculate the solubility first."));
      if (!relClose(a.parts, e.parts, 0.01)) return wrongCalc(s, "parts", `${fmt(a.parts, 1)} parts of solvent is not right for ${s.calcSol!.gPer100.toFixed(3)} g/100 mL.`, "Parts of solvent per part of solute ≈ 100 mL ÷ (g dissolved in 100 mL).");
      if (a.term !== e.term) return wrongCalc(s, "parts", `"${a.term}" is not the USP term for ${fmt(e.parts, 1)} parts.`, "Read the USP table by parts of solvent: 30 to 100 parts is 'Sparingly soluble'; 10 to 30 'Soluble'; 100 to 1000 'Slightly soluble'.");
      return next({ calcParts: { parts: round(a.parts, 2), term: a.term } }, ok(`${a.parts.toFixed(1)} parts of water per part of paracetamol: ${a.term}.`));
    }
    case "calcSink": {
      if (s.sinkMl !== null) return same(info("The sink check is already done."));
      const e = expected(s);
      if (e.sinkMl === null) return same(refuse("You need your solubility result first — finish the solubility activity."));
      if (!relClose(a.volumeMl, e.sinkMl, 0.01)) return wrongCalc(s, "sink", `${fmt(a.volumeMl, 1)} mL is not the volume your solubility gives for a ${METHOD.doseMg} mg dose.`, "Volume the dose would saturate = dose (mg) ÷ solubility (mg/mL).");
      return next({ sinkMl: round(a.volumeMl, 2) }, ok(`The dose would saturate ${a.volumeMl.toFixed(1)} mL; ${METHOD.mediumMl} mL is ${e.sinkRatio!.toFixed(1)} times that — sink conditions hold (≥ 3).`));
    }
    case "calcDissolved": {
      if (s.qPercent !== null) return same(info("Already calculated."));
      if (!v.stopped || !allMeasured(s)) return same(refuse("Finish the test and record every sample's absorbance first."));
      const e = expected(s);
      if (e.q === null) return same(refuse("There is no 30-minute sample — Q cannot be calculated. Record your verdict."));
      if (!relClose(a.percent, e.q, 0, 0.3)) return wrongCalc(s, "dissolved", `${fmt(a.percent, 1)} % does not follow from your recorded absorbances.`, "Corrected amount at sample n = Cₙ·V₀ + v·Σ(earlier C); % = amount ÷ label claim × 100.");
      return next({ qPercent: round(a.percent, 2) }, ok(`${a.percent.toFixed(1)} % of the label claim dissolved at ${METHOD.qTimeMin} min (corrected).`));
    }
    case "verdict": {
      if (s.verdict) return same(info("Verdict recorded."));
      const e = expected(s);
      if (!v.stopped || !allMeasured(s)) return same(refuse("Finish the test and its measurements first."));
      if (e.q !== null && s.qPercent === null) return same(refuse("Calculate the % dissolved at 30 min first."));
      const truth = e.q === null ? "not-determinable" : meetsS1Unit(e.q, METHOD.q) ? "meets" : "fails";
      if (a.verdict !== truth) {
        return same(mistake("verdict", 4, "That verdict does not follow from your result.", `The teaching criterion is one unit ≥ Q + 5 % = ${METHOD.q + 5} % at ${METHOD.qTimeMin} min. Compare your corrected % with it; with no 30-min sample, Q cannot be assessed.`));
      }
      return next({ verdict: a.verdict }, ok("Verdict recorded."));
    }
    case "worked": {
      if (!CALC_IDS.includes(a.calc)) return same();
      const c = s.calc[a.calc];
      if (c.worked) return same(info("The worked solution is already open."));
      if (a.mode === "practical" && c.attempts === 0) return same(refuse("Practical mode: make one attempt of your own first — the worked solution opens after a wrong attempt."));
      const st = { ...s, calc: { ...s.calc, [a.calc]: { ...c, worked: true } } };
      if (a.mode === "practical") {
        return { state: st, feedback: [mistake(`worked-${a.calc}`, 3, `Worked solution shown for the ${CALC_NAMES[a.calc]}.`, "Practical mode: the calculation is credited as demonstrated, not as your own (−3 technique marks, like a hint).")] };
      }
      return { state: st, feedback: [info("Worked solution shown (Learning mode: no marks lost).")] };
    }

    // ── B: medium ──
    case "pourMedium": {
      const n = need("cylinder", "medium");
      if (n) return same(n);
      if (v.filled) return same(refuse("The vessel is already filled."));
      if (![100, 50, 10, 5, -5, -10].includes(a.ml)) return same();
      return next({ cyl: { ml: Math.max(0, Math.min(1000, s.cyl.ml + a.ml)), read: null } });
    }
    case "readCylinder": {
      const n = need("cylinder");
      if (n) return same(n);
      if (s.cyl.ml <= 0) return same(refuse("Pour the medium into the cylinder first."));
      if (!Number.isFinite(a.value) || Math.abs(a.value - s.cyl.ml) > 2.5) return same(mistake("misread-cylinder", 3, `${fmt(a.value, 0)} mL does not match the meniscus.`, "Read the bottom of the meniscus at eye level, to half a 10 mL division."));
      return next({ cyl: { ...s.cyl, read: round(a.value, 0) } }, ok(`${a.value.toFixed(0)} mL measured.`));
    }
    case "mediumToVessel": {
      const n = need("cylinder");
      if (n) return same(n);
      if (v.filled) return same(info("The vessel is already filled."));
      if (s.cyl.read === null) return same(refuse("Read and record the cylinder volume first."));
      const fb: Feedback[] = [];
      const ml = s.cyl.ml;
      if (Math.abs(ml - METHOD.mediumMl) > METHOD.mediumTolMl) {
        fb.push(mistake("medium-volume", 5, `${ml} mL of medium in the vessel instead of ${METHOD.mediumMl} ± ${METHOD.mediumTolMl} mL.`, `Every result is calculated with ${METHOD.mediumMl} mL, so ${ml > METHOD.mediumMl ? "more medium dilutes the drug and the % dissolved comes out LOW" : "less medium concentrates the drug and the % dissolved comes out HIGH"}.`));
      }
      return { state: { ...s, cyl: { ml: 0, read: null }, vessel: { ...v, ml, filled: true, tempC: METHOD.roomC } }, feedback: [...fb, ok(`${ml} mL of buffer poured into the vessel.`)] };
    }

    // ── B: tester ──
    case "testerTemp":
      if (a.c !== 0 && !(METHOD.testerTempOptions as readonly number[]).includes(a.c)) return same();
      if (a.c > 0 && !v.filled) return same(refuse("Fill the vessel first — never heat an empty water bath vessel."));
      return next({ vessel: { ...v, setC: a.c } }, info(a.c ? `Bath set to ${a.c}.0 °C.` : "Bath heater off."));
    case "testerRpm":
      if (a.rpm !== 0 && !(METHOD.rpmOptions as readonly number[]).includes(a.rpm)) return same();
      return next({ vessel: { ...v, rpm: a.rpm } }, info(a.rpm ? `Paddle speed set to ${a.rpm} rpm.` : "Paddle speed cleared."));
    case "waitMin": {
      if (![0.5, 1, 5].includes(a.minutes)) return same();
      if (!v.filled) return same(refuse("Nothing is running yet — fill the vessel first."));
      const after = advanceVessel(s, a.minutes);
      const fb: Feedback[] = [];
      if (v.running && !v.stopped) {
        const missed = [...after.missed];
        for (const p of METHOD.schedule) {
          if (after.vessel.t > p + METHOD.lateMaxMin && !missed.includes(p) && !after.samples.some((x) => x.nominal === p)) {
            missed.push(p);
            fb.push(mistake("missed-sample", 6, `The ${p}-min sample was missed.`, p === METHOD.qTimeMin ? "The 30-min point is the one Q is judged at: without it the test cannot be assessed and must be repeated." : "The profile loses a point: its shape (and the time to reach Q) is less certain."));
          }
        }
        return { state: { ...after, missed }, feedback: [...fb, info(`Timer ${after.vessel.t.toFixed(1)} min.`)] };
      }
      return { state: after, feedback: [info(`${a.minutes} min passed. Medium ${after.vessel.tempC.toFixed(1)} °C.`)] };
    }
    case "verify": {
      if (!v.filled) return same(refuse("Fill the vessel first."));
      if (v.rpm === 0 || v.setC === 0) return same(refuse("Set the temperature and the paddle speed first."));
      if (!Number.isFinite(a.tempC) || Math.abs(a.tempC - round(v.tempC, 1)) > 0.15 || a.rpm !== v.rpm) {
        return same(mistake("misread-thermometer", 3, `${fmt(a.tempC, 1)} °C / ${fmt(a.rpm, 0)} rpm does not match the instruments.`, "Read the thermometer in the vessel and the tachometer exactly; verification is a record of what they show."));
      }
      return next({ vessel: { ...v, verified: { tempC: round(a.tempC, 1), rpm: a.rpm } } }, ok(`Verified: medium ${a.tempC.toFixed(1)} °C, paddle ${a.rpm} rpm.`));
    }
    case "dropTablet": {
      const n = need("tablets");
      if (n) return same(n);
      if (v.tabletIn) return same(info("The tablet is already in."));
      if (!v.filled) return same(refuse("Fill the vessel with medium first."));
      if (v.rpm === 0 || v.setC === 0) return same(refuse("Set the temperature and the paddle speed first."));
      if (s.sinkMl === null) return same(refuse("Check sink conditions first (lab notebook) — the check uses your solubility result."));
      const fb: Feedback[] = [];
      const T = v.tempC;
      if (!v.verified || Math.abs(v.verified.tempC - round(T, 1)) > 0.15 || v.verified.rpm !== v.rpm) {
        fb.push(mistake("not-verified", 3, "Started without verifying the temperature and speed just before the test.", "The record cannot show the run met 37.0 ± 0.5 °C and 50 rpm; any deviation (HIGH or LOW) would go unnoticed."));
      }
      if (T < METHOD.targetC - METHOD.tempTolC) {
        fb.push(mistake("started-before-37", 6, `Tablet dropped at ${T.toFixed(1)} °C.`, "In cooler medium the drug diffuses more slowly, so early time points — and possibly Q — read LOW."));
      } else if (T > METHOD.targetC + METHOD.tempTolC) {
        fb.push(mistake("medium-too-hot", 5, `Tablet dropped at ${T.toFixed(1)} °C.`, "Above 37.5 °C release is faster than under the specified conditions: the profile reads HIGH."));
      }
      if (v.rpm !== METHOD.protocolRpm) {
        fb.push(mistake("wrong-speed", 6, `Paddle at ${v.rpm} rpm instead of ${METHOD.protocolRpm}.`, `Faster stirring thins the diffusion layer: ${v.rpm > METHOD.protocolRpm ? "release is faster and the % dissolved reads HIGH" : "release is slower and the % dissolved reads LOW"}.`));
      }
      return {
        state: { ...s, vessel: { ...v, tabletIn: true, running: true, t: 0, released: 0, startC: round(T, 1), startRpm: v.rpm } },
        feedback: [...fb, ok("Tablet dropped; it sinks to the bottom and the paddle turns. Timer started.")],
      };
    }
    case "withdraw": {
      const n = need("sampler", "tubes");
      if (n) return same(n);
      if (!v.running || v.stopped) return same(refuse("The test is not running."));
      const due = METHOD.schedule.find((p) => !s.samples.some((x) => x.nominal === p) && !s.missed.includes(p));
      if (due === undefined) return same(refuse("Every scheduled sample is taken."));
      const tol = samplingTolerance(due);
      if (v.t < due - tol) return same(refuse(`Too early — the next sample is due at ${due} min (timer ${v.t.toFixed(1)} min).`));
      const fb: Feedback[] = [];
      let samples = s.samples;
      let ml = v.ml;
      if (v.pendingReplace) {
        fb.push(mistake("not-replaced", 5, "Took a sample without replacing the last one's 5 mL.", `The vessel now holds less than ${METHOD.mediumMl} mL, but the protocol's correction assumes it was topped up: later concentrations are higher and the % dissolved reads HIGH.`));
      }
      const late = v.t - due > tol;
      if (late) fb.push(mistake("late-sample", 3, `The ${due}-min sample was taken at ${v.t.toFixed(1)} min.`, "More drug has dissolved by then: that point reads HIGH against its scheduled time, and Q may be overstated."));
      const c = vesselConcentration(s);
      samples = [...samples, { nominal: due, t: v.t, cTrue: c, replaced: false, late, df: null, absRecorded: null, blanked: false }];
      ml = round(ml - METHOD.sampleMl, 3);
      return {
        state: { ...s, samples, vessel: { ...v, ml, removedMg: v.removedMg + c * METHOD.sampleMl, pendingReplace: true }, bench: KIT.produce(s.bench, "cannula-filters") },
        feedback: [...fb, ok(`${METHOD.sampleMl} mL withdrawn through the cannula filter at ${v.t.toFixed(1)} min (sample ${samples.length}).`)],
      };
    }
    case "replace": {
      const n = need("sampler", "medium");
      if (n) return same(n);
      if (!v.pendingReplace) return same(refuse("There is no withdrawn volume to replace."));
      const samples = s.samples.map((x, i) => (i === s.samples.length - 1 ? { ...x, replaced: true } : x));
      return next({ samples, vessel: { ...v, ml: round(v.ml + METHOD.sampleMl, 3), pendingReplace: false } }, ok(`${METHOD.sampleMl} mL of fresh medium at 37 °C added back.`));
    }
    case "stopTest": {
      if (!v.running) return same(refuse("The test has not started."));
      if (v.stopped) return same(info("Already stopped."));
      if (!allPointsDone(s)) return same(refuse(`The protocol runs to ${METHOD.schedule[METHOD.schedule.length - 1]} min — keep sampling.`));
      let bench = KIT.produce(s.bench, "vessel");
      if (s.samples.length > 0 && allMeasured(s)) bench = KIT.produce(bench, "samples");
      return next({ vessel: { ...v, stopped: true, rpm: 0, pendingReplace: false }, bench }, ok("Paddle stopped. Test finished."));
    }

    // ── B: spectrophotometer ──
    case "dilute": {
      const n = need("tubes", "pipette");
      if (n) return same(n);
      if (!(METHOD.dilutions as readonly number[]).includes(a.factor)) return same();
      const i = nextToMeasure(s);
      if (i < 0) return same(refuse("No sample is waiting to be measured."));
      const samples = s.samples.map((x, j) => (j === i ? { ...x, df: a.factor } : x));
      return next({ samples, spectro: { ...s.spectro, cuvette: s.spectro.cuvette === "sample" ? "none" : s.spectro.cuvette } }, info(a.factor === 1 ? `Sample ${i + 1}: used undiluted.` : `Sample ${i + 1}: diluted 1 in ${a.factor} with medium.`));
    }
    case "blank": {
      const n = need("cuvette", "medium");
      if (n) return same(n);
      return next({ spectro: { blanked: true, cuvette: "blank" } }, ok("Cuvette filled with medium: absorbance zeroed at 243 nm."));
    }
    case "loadSample": {
      const n = need("cuvette");
      if (n) return same(n);
      const i = nextToMeasure(s);
      if (i < 0) return same(refuse("No sample is waiting to be measured."));
      if (s.samples[i].df === null) return same(refuse(`Prepare sample ${i + 1} for reading first (dilute it, or use it undiluted).`));
      return next({ spectro: { ...s.spectro, cuvette: "sample" } }, info(`Cuvette rinsed and filled with sample ${i + 1}.`));
    }
    case "recordAbs": {
      if (s.spectro.cuvette !== "sample") return same(refuse("Load the sample cuvette first."));
      const i = nextToMeasure(s);
      const shown = sampleAbsorbance(s, i);
      if (!Number.isFinite(shown)) return same(refuse("The display reads OVER — the sample is too concentrated to read. Dilute it further."));
      if (!Number.isFinite(a.value) || Math.abs(a.value - shown) > 0.0015) {
        return same(mistake("misread-absorbance", 3, `${fmt(a.value, 3)} does not match the display.`, "Record the absorbance exactly as displayed, to 0.001."));
      }
      const fb: Feedback[] = [];
      if (!s.spectro.blanked) fb.push(mistake("no-blank", 5, "Read the sample without blanking on medium.", "The buffer and cuvette's own absorbance is added to every reading, so concentrations and % dissolved read HIGH."));
      if (shown > METHOD.linearMax) fb.push(mistake("above-linear-range", 5, `Recorded A = ${shown.toFixed(3)}, above the calibrated range (≤ ${METHOD.linearMax.toFixed(1)}).`, "Above the linear range the reading falls below Beer's law, so this concentration reads LOW. Dilute further and read again."));
      const samples = s.samples.map((x, j) => (j === i ? { ...x, absRecorded: round(a.value, 3), blanked: s.spectro.blanked } : x));
      const st: SolubilityDissolutionState = { ...s, samples, spectro: { ...s.spectro, cuvette: "none" } };
      const done = samples.every((x) => x.absRecorded !== null);
      return {
        state: done && v.stopped ? { ...st, bench: KIT.produce(st.bench, "samples") } : st,
        feedback: [...fb, ok(`Sample ${i + 1}: A = ${a.value.toFixed(3)} recorded.`)],
      };
    }
  }
  return same();
}

// ── Steps, controllers, suggest ───────────────────────────────────────────

const dried = (s: SolubilityDissolutionState) => constantMass(s);

const STEP_DONE: Record<string, (s: SolubilityDissolutionState) => boolean> = {
  saturate: (s) => (s.flask.waterMl > 0 && s.flask.drugG > 0 && s.flask.inBath) || s.sampledAt !== null,
  equilibrate: (s) => s.sampledAt !== null || (s.eqH >= METHOD.equilibrationH && excessVisible(s)),
  "sample-sol": (s) => s.dish.liquidMl > 0 || s.dish.ovenH > 0,
  dry: (s) => dried(s),
  "calc-solubility": (s) => s.calcSol !== null,
  "calc-parts": (s) => s.calcParts !== null,
  medium: (s) => s.vessel.filled || s.vessel.tabletIn || s.vessel.stopped,
  conditions: (s) => s.vessel.tabletIn || s.vessel.stopped || (s.vessel.verified !== null && s.vessel.setC > 0 && s.vessel.rpm > 0),
  "calc-sink": (s) => s.sinkMl !== null,
  run: (s) => s.vessel.stopped,
  measure: (s) => s.vessel.stopped && allMeasured(s),
  "calc-dissolved": (s) => s.qPercent !== null || (s.vessel.stopped && allMeasured(s) && qMissed(s)),
  interpret: (s) => s.verdict !== null,
  cleanup: (s) =>
    s.bench.pending.length === 0 &&
    requiredWaste(s).every((w) => s.bench.disposed.some((d) => d.id === w)) &&
    s.bench.out.length === 0 &&
    s.bench.open === null &&
    !s.bench.tap &&
    s.oven.setC === 0 &&
    s.bath.setC === 0 &&
    s.vessel.setC === 0,
};

const CONTROLLERS: ControllerDef[] = [
  {
    id: "notebook",
    name: "Lab notebook",
    equipment: ["notebook"],
    actions: ["activity", "calcSolubility", "calcParts", "calcSink", "calcDissolved", "verdict", "worked"],
    brief: "Choose the activity, do each calculation from your own readings, and record the verdict.",
    howTo: ["Solubility first: the sink check needs it.", "Each calculation has hints and a worked solution."],
    nearby: ["balance", "tester"],
  },
  {
    id: "balance",
    name: "Analytical balance",
    equipment: ["balance", "boat", "spatula", "drug"],
    actions: ["placeBoat", "tare", "addDrug", "drugToFlask", "dishOnBalance", "recordMass"],
    brief: "Weigh the excess paracetamol in a tared boat; weigh the dish empty and after drying.",
    howTo: ["Boat on, tare, then scoop powder.", "Record dish masses to 0.1 mg, doors closed."],
    nearby: ["flask", "dish", "oven"],
  },
  { id: "water", name: "Purified water dispenser", equipment: ["water"], actions: ["dispenseWater"], brief: `Dispense ${METHOD.waterMl} mL of purified water into the conical flask.`, howTo: ["Flask under the dispenser, press once."], nearby: ["flask"] },
  {
    id: "flask",
    name: "Stoppered conical flask",
    equipment: ["flask"],
    actions: ["dispenseWater", "drugToFlask", "stopper", "flaskToBath"],
    brief: "Water first, then excess paracetamol; stopper it and clamp it in the bath.",
    howTo: ["Solid must still be visible at the end — that is what makes it saturated."],
    nearby: ["water-bath", "balance"],
  },
  {
    id: "water-bath",
    name: "Thermostatic shaking water bath",
    equipment: ["water-bath"],
    actions: ["flaskToBath", "bathSet", "shake", "waitHours", "warmFilter"],
    brief: `Hold the flask at ${METHOD.protocolC} °C with shaking until equilibrium.`,
    howTo: [`Set ${METHOD.protocolC} °C, shaker on, then let time pass.`, "Warm the syringe and filter here before sampling."],
    nearby: ["flask", "syringe"],
  },
  {
    id: "syringe",
    name: "Syringe filter",
    equipment: ["syringe-filter"],
    actions: ["warmFilter", "filter"],
    brief: "Draw the clear saturated solution and filter it at the bath temperature.",
    howTo: ["Pre-warm, then filter about 12 mL."],
    nearby: ["water-bath", "pipette"],
  },
  { id: "pipette", name: "10 mL bulb pipette", equipment: ["pipette"], actions: ["pipetteToDish", "dilute"], brief: "Transfer exactly 10.00 mL of filtrate into the weighed dish; dilute dissolution samples.", howTo: ["Filler on, draw to the mark, deliver and touch off."], nearby: ["dish"] },
  { id: "dish", name: "Evaporating dish", equipment: ["dish"], actions: ["dishOnBalance", "pipetteToDish", "dishToOven", "cool"], brief: "Weighed empty, holds the aliquot, dried to constant mass.", howTo: ["Weigh it empty before anything goes in."], nearby: ["balance", "oven"] },
  {
    id: "oven",
    name: "Drying oven and desiccator",
    equipment: ["oven"],
    actions: ["ovenSet", "dishToOven", "dry", "removeDish", "cool"],
    brief: `Evaporate and dry at ${METHOD.ovenProtocolC} °C; cool in the desiccator before each weighing.`,
    howTo: ["Dry, cool, weigh — repeat until two weighings agree within 0.5 mg."],
    nearby: ["balance", "dish"],
  },
  {
    id: "cylinder",
    name: "1000 mL measuring cylinder",
    equipment: ["cylinder", "medium"],
    actions: ["pourMedium", "readCylinder", "mediumToVessel"],
    brief: `Measure ${METHOD.mediumMl} mL of pH 5.8 buffer and pour it into the vessel.`,
    howTo: ["Pour close to the mark, then in small portions.", "Read the bottom of the meniscus at eye level."],
    nearby: ["tester"],
  },
  {
    id: "tester",
    name: "Dissolution tester (paddle)",
    equipment: ["tester", "tablets"],
    actions: ["testerTemp", "testerRpm", "waitMin", "verify", "dropTablet", "replace", "stopTest"],
    brief: `${METHOD.mediumMl} mL at ${METHOD.targetC}.0 ± ${METHOD.tempTolC} °C, ${METHOD.protocolRpm} rpm; drop the tablet and time the samples.`,
    howTo: ["Wait for the medium to reach temperature, then verify.", "Samples at 5, 10, 15, 20, 30 and 45 min."],
    nearby: ["sampler", "notebook"],
  },
  {
    id: "sampler",
    name: "Sampling syringe",
    equipment: ["sampler", "tubes"],
    actions: ["withdraw", "replace", "waitMin"],
    brief: `Withdraw ${METHOD.sampleMl} mL at each time point through the cannula filter, and replace it with warm medium.`,
    howTo: ["Withdraw on time, midway between paddle and surface.", "Replace the volume at once."],
    nearby: ["tester", "spectro"],
  },
  {
    id: "spectro",
    name: "UV-Vis spectrophotometer (243 nm)",
    equipment: ["spectro", "cuvette"],
    actions: ["blank", "dilute", "loadSample", "recordAbs"],
    brief: "Blank on medium, then read each sample in turn.",
    howTo: [`Calibrated to A = ${METHOD.linearMax.toFixed(1)}; dilute above it.`, "Record each absorbance to 0.001."],
    nearby: ["sampler", "notebook"],
  },
  ...KIT.controllers,
];

/** Which cabinet holds an item, and the move that gets it out. */
function getOut(s: SolubilityDissolutionState, ...items: string[]): Suggestion | null {
  for (const id of items) {
    const it = KIT.storedById.get(id);
    if (it && !s.bench.out.includes(id)) return { controller: it.cabinet, action: s.bench.open === it.cabinet ? "retrieve" : "cabinet" };
  }
  return null;
}

/**
 * Learning mode: the next correct move — an instrument and a control, never a value. It goes
 * quiet (null) where the move IS the judgement being learned: how much powder is "excess",
 * whether solid remains after equilibration, the meniscus at 900 mL, and a displayed
 * absorbance the student must judge against the calibration range before recording.
 */
function suggest(s: SolubilityDissolutionState): Suggestion | null {
  const to = (controller: string, action: string): Suggestion => ({ controller, action });
  const v = s.vessel;
  const solDone = s.calcParts !== null;

  if (!solDone) {
    if (s.activity !== "solubility") return to("notebook", "activity");
    if (s.sampledAt === null) {
      if (s.flask.waterMl === 0) return getOut(s, "flask") ?? to("water", "dispenseWater");
      // A weighing in progress: guide the mechanics, never the amount.
      if (s.boat.drugG > 0) return null; // how much is "excess" (add more, or tip it in) is the student's call
      if (s.boat.on && s.flask.drugG > 0 && excessVisible(s)) return to("balance", "placeBoat"); // clear the pan
      if (s.boat.on) return s.boat.tared ? to("balance", "addDrug") : to("balance", "tare");
      if (s.flask.drugG === 0) return getOut(s, "boat", "spatula", "drug") ?? to("balance", "placeBoat");
      if (!s.flask.inBath) return s.flask.stoppered ? to("flask", "flaskToBath") : to("flask", "stopper");
      if (!s.flask.stoppered) return to("flask", "stopper");
      if (s.bath.setC !== METHOD.protocolC) return to("water-bath", "bathSet");
      if (!s.bath.shaking) return to("water-bath", "shake");
      if (s.eqH < METHOD.equilibrationH) return to("water-bath", "waitHours");
      if (!excessVisible(s)) return null; // is there solid left? — the student must look, and decide
      if (s.emptyRecorded === null) return getOut(s, "dish") ?? (s.dish.where === "balance" ? to("balance", "recordMass") : to("balance", "dishOnBalance"));
      if (!s.filterWarm) return getOut(s, "syringe-filter") ?? to("water-bath", "warmFilter");
      return getOut(s, "syringe-filter") ?? to("syringe", "filter");
    }
    if (s.emptyRecorded === null) return null; // filtered before taring the dish: their recovery to plan
    if (s.dish.liquidMl === 0 && s.dish.ovenH === 0 && s.weighings.length === 0) return getOut(s, "pipette", "dish") ?? to("pipette", "pipetteToDish");
    if (!dried(s)) {
      const weighedHere = s.weighings.some((w) => w.ovenH === s.dish.ovenH);
      if (s.dish.where === "oven") {
        if (s.oven.setC !== METHOD.ovenProtocolC) return to("oven", "ovenSet");
        return weighedHere || s.dish.ovenH === 0 || s.dish.liquidMl > 0 ? to("oven", "dry") : to("oven", "removeDish");
      }
      if (s.dish.ovenH === 0 || s.dish.liquidMl > 0 || weighedHere) return s.oven.setC !== METHOD.ovenProtocolC ? to("oven", "ovenSet") : to("oven", "dishToOven");
      if (s.dish.hot) return to("oven", "cool");
      if (s.dish.where !== "balance") return to("balance", "dishOnBalance");
      return to("balance", "recordMass");
    }
    if (!s.calcSol) return to("notebook", "calcSolubility");
    return to("notebook", "calcParts");
  }

  // B — dissolution
  if (!v.stopped) {
    if (s.activity !== "dissolution") return to("notebook", "activity");
    if (!v.filled) {
      const f = getOut(s, "cylinder", "medium");
      if (f) return f;
      if (s.cyl.read === null) return s.cyl.ml === 0 || Math.abs(s.cyl.ml - METHOD.mediumMl) > 50 ? to("cylinder", "pourMedium") : null; // the meniscus is theirs to judge
      return to("cylinder", "mediumToVessel");
    }
    if (!v.tabletIn) {
      if (v.setC !== METHOD.targetC) return to("tester", "testerTemp");
      if (v.rpm !== METHOD.protocolRpm) return to("tester", "testerRpm");
      if (Math.abs(v.tempC - METHOD.targetC) > METHOD.tempTolC) return to("tester", "waitMin");
      if (!v.verified || Math.abs(v.verified.tempC - round(v.tempC, 1)) > 0.15) return to("tester", "verify");
      if (s.sinkMl === null) return to("notebook", "calcSink");
      return getOut(s, "tablets") ?? to("tester", "dropTablet");
    }
    if (v.pendingReplace) return getOut(s, "medium") ?? to("sampler", "replace");
    const due = METHOD.schedule.find((p) => !s.samples.some((x) => x.nominal === p) && !s.missed.includes(p));
    if (due === undefined) return to("tester", "stopTest");
    if (v.t >= due - samplingTolerance(due)) return getOut(s, "sampler", "tubes") ?? to("sampler", "withdraw");
    return to("tester", "waitMin");
  }
  if (!allMeasured(s)) {
    if (!s.spectro.blanked) return getOut(s, "cuvette", "medium") ?? to("spectro", "blank");
    const i = nextToMeasure(s);
    if (s.samples[i].df === null) return getOut(s, "pipette") ?? to("spectro", "dilute"); // which dilution is theirs
    if (s.spectro.cuvette !== "sample") return to("spectro", "loadSample");
    return null; // read the display and judge it against the range
  }
  if (s.qPercent === null && !qMissed(s)) return to("notebook", "calcDissolved");
  if (s.verdict === null) return to("notebook", "verdict");

  // clean-up
  if (s.bench.pending.length) return to("waste-station", "dispose");
  if (s.oven.setC !== 0) return to("oven", "ovenSet");
  if (s.bath.setC !== 0) return to("water-bath", "bathSet");
  if (v.setC !== 0) return to("tester", "testerTemp");
  if (s.bench.tap) return to("sink", "tap");
  const back = s.bench.out[0];
  if (back) {
    const cab = KIT.storedById.get(back)!.cabinet;
    return to(cab, s.bench.open === cab ? "return" : "cabinet");
  }
  if (s.bench.open) return to(s.bench.open, "cabinet");
  return null;
}

// ── Observations and report ───────────────────────────────────────────────

function observations(s: SolubilityDissolutionState): ObservationSection[] {
  const e = expected(s);
  const rows = profile(s);
  return [
    {
      title: "A. Solubility (shake-flask, gravimetric)",
      rows: [
        { label: "Saturation", value: s.flask.drugG > 0 || s.sampledAt ? `${METHOD.waterMl} mL purified water + ${s.flask.drugG.toFixed(3)} g paracetamol` : "—", source: "recorded" },
        { label: "Bath / equilibration", value: s.sampledAt ? `${s.sampledAt.setC} °C, ${s.sampledAt.eqH} h shaking` : s.bath.setC ? `${s.bath.setC} °C, ${s.eqH} h so far` : "—", source: "observed" },
        { label: "Excess solid when sampled", value: s.sampledAt ? "present" : excessVisible(s) ? "present" : s.flask.drugG > 0 ? "none visible" : "—", source: "observed" },
        { label: "Empty dish", value: s.emptyRecorded !== null ? `${s.emptyRecorded.toFixed(4)} g` : "—", source: "recorded" },
        ...s.weighings.map((w, i) => ({ label: `Weighing ${i + 1} (after ${w.ovenH} h drying)`, value: `${w.g.toFixed(4)} g${w.hot ? " — weighed hot" : ""}`, source: "recorded" as const })),
        { label: "Residue (10.00 mL aliquot)", value: e.residueG !== null ? `${e.residueG.toFixed(4)} g` : "—", source: "calculated" },
        { label: "Solubility (your calculation)", value: s.calcSol ? `${s.calcSol.gPer100.toFixed(3)} g/100 mL = ${s.calcSol.mgPerMl.toFixed(2)} mg/mL` : "—", source: "recorded" },
        { label: "Descriptive term", value: s.calcParts ? `${s.calcParts.parts.toFixed(1)} parts → ${s.calcParts.term}` : "—", source: "recorded" },
      ],
    },
    {
      title: "B. Dissolution (SIMULATED release, modelled on USP Acetaminophen Tablets)",
      rows: [
        { label: "Medium", value: s.vessel.filled || s.vessel.tabletIn ? `pH 5.8 phosphate buffer, ${METHOD.mediumMl} mL (protocol)` : "—", source: "recorded" },
        { label: "At the start", value: s.vessel.startC !== null ? `${s.vessel.startC.toFixed(1)} °C, ${s.vessel.startRpm} rpm${s.vessel.verified ? ` (verified ${s.vessel.verified.tempC.toFixed(1)} °C, ${s.vessel.verified.rpm} rpm)` : " (not verified)"}` : "—", source: "observed" },
        { label: "Sink check", value: s.sinkMl !== null ? `dose saturates ${s.sinkMl.toFixed(1)} mL; ratio ${(METHOD.mediumMl / s.sinkMl).toFixed(1)}` : "—", source: "recorded" },
        ...rows.map((r) => ({
          label: `${r.nominal} min${Math.abs(r.t - r.nominal) > 1e-9 ? ` (taken ${r.t.toFixed(1)})` : ""}`,
          value: `A ${r.a.toFixed(3)} (1 in ${r.df}) → ${r.cMgPerMl.toFixed(4)} mg/mL → ${r.corrected.toFixed(1)} % (uncorrected ${r.uncorrected.toFixed(1)} %)`,
          source: "recorded" as const,
        })),
        ...s.missed.map((p) => ({ label: `${p} min`, value: "missed", source: "observed" as const })),
        { label: `Q time (${METHOD.qTimeMin} min), corrected`, value: s.qPercent !== null ? `${s.qPercent.toFixed(1)} %` : qMissed(s) ? "not determinable" : "—", source: "recorded" },
      ],
    },
  ];
}

function report(s: SolubilityDissolutionState): ExperimentReport {
  const e = expected(s);
  const ref = trueSolubilityGPer100(METHOD.protocolC);
  const rows = profile(s);
  const dev = s.calcSol ? ((s.calcSol.gPer100 - ref) / ref) * 100 : null;
  const verdictText = s.verdict === "meets" ? `meets the teaching criterion (≥ ${METHOD.q + 5} %)` : s.verdict === "fails" ? `below ${METHOD.q + 5} % — a real test would continue to stage S2` : s.verdict === "not-determinable" ? "Q not determinable — repeat" : "—";
  return {
    headline: s.calcSol
      ? `Paracetamol: ${s.calcSol.gPer100.toFixed(3)} g/100 mL at ${s.sampledAt?.setC ?? METHOD.protocolC} °C (${s.calcParts?.term ?? "—"}); ${s.qPercent !== null ? `${s.qPercent.toFixed(1)} % dissolved at ${METHOD.qTimeMin} min` : "dissolution not analysed"}`
      : "Solubility not determined",
    calculations: [
      { label: "Residue", expression: "final constant mass (g) − empty dish (g)", result: e.residueG !== null ? `${e.residueG.toFixed(4)} g` : "—" },
      { label: "Solubility", expression: `residue (g) ÷ ${METHOD.aliquotMl.toFixed(2)} mL × 100`, result: e.gPer100 !== null ? `${fmt(e.gPer100, 3)} g/100 mL = ${fmt(e.mgPerMl!, 2)} mg/mL` : "—" },
      { label: "Parts of solvent", expression: "100 mL ÷ solubility (g/100 mL)", result: e.parts !== null ? `${fmt(e.parts, 1)} mL/g → ${e.term}` : "—" },
      { label: "Sink condition", expression: `${METHOD.mediumMl} mL ÷ (${METHOD.doseMg} mg ÷ solubility mg/mL) ≥ 3`, result: e.sinkRatio !== null ? `${fmt(e.sinkRatio, 1)}` : "—" },
      { label: "Sample concentration", expression: `(A − ${METHOD.intercept}) ÷ ${METHOD.slope} (µg/mL) × dilution ÷ 1000`, result: rows.length ? `${rows.length} samples (table)` : "—" },
      { label: "Cumulative % (volume replaced)", expression: `[Cₙ (mg/mL) × ${METHOD.mediumMl} mL + ${METHOD.sampleMl} mL × ΣC(earlier)] ÷ ${METHOD.doseMg} mg × 100`, result: e.q !== null ? `${e.q.toFixed(1)} % at ${METHOD.qTimeMin} min (uncorrected ${e.qRow!.uncorrected.toFixed(1)} %)` : "—" },
    ],
    outcome: [
      { label: `Your solubility vs published (${METHOD.protocolC} °C, Granberg & Rasmuson 1999)`, value: s.calcSol ? `${s.calcSol.gPer100.toFixed(3)} vs ${ref.toFixed(3)} g/100 mL (${dev! >= 0 ? "+" : ""}${dev!.toFixed(1)} %)` : `— vs ${ref.toFixed(3)} g/100 mL`, verdict: dev === null ? "info" : Math.abs(dev) <= 3 ? "pass" : "fail" },
      { label: "Descriptive term", value: s.calcParts?.term ?? "—", verdict: s.calcParts ? (s.calcParts.term === "Sparingly soluble" ? "pass" : "fail") : "info" },
      { label: `% dissolved at ${METHOD.qTimeMin} min (SIMULATED)`, value: s.qPercent !== null ? `${s.qPercent.toFixed(1)} % (teaching model ${modelPercentAt(s, METHOD.qTimeMin).toFixed(1)} %)` : "—", verdict: "info" },
      { label: `Verdict (one unit vs Q + 5 % = ${METHOD.q + 5} %)`, value: verdictText, verdict: s.verdict === "meets" ? "pass" : s.verdict ? "fail" : "info" },
      { label: "Waste segregated", value: `${s.bench.disposed.length} of ${requiredWaste(s).length} wastes disposed correctly`, verdict: requiredWaste(s).every((w) => s.bench.disposed.some((d) => d.id === w)) ? "pass" : "fail" },
    ],
    learning: [
      "Equilibrium solubility needs excess solid present at the end, a controlled temperature and enough time: powder that all dissolves proves only that you added too little.",
      "Paracetamol is 'sparingly soluble' in water (30–100 parts); its solubility rises with temperature (endothermic dissolution, ≈ 20 kJ/mol from the published data).",
      "A dissolution test is meaningful only under sink conditions; the drug removed in each sample must be added back in the calculation, or the % dissolved is understated.",
      "LIMITATIONS: the dissolution data are SIMULATED from a teaching first-order model with seeded noise; one vessel is not a USP test (S1 needs six units); the calibration line and drying model are teaching values; no faculty member has reviewed this procedure.",
    ],
  };
}

// ── Equipment ─────────────────────────────────────────────────────────────

const EQUIPMENT: EquipmentDef[] = [
  { id: "balance", name: "Analytical balance", description: "Enclosed electronic balance with draught-shield doors.", use: "Weighs the excess drug, and the dish empty and after each drying.", spec: "Readability 0.1 mg, capacity 220 g" },
  { id: "water-bath", name: "Thermostatic shaking water bath", description: "Water bath with a set-point and a reciprocating shaker platform.", use: "Holds the saturating flask at 25 °C with shaking; warms the syringe filter.", spec: "±0.1 °C", safety: "Warm water and mains electricity — keep the lid on and hands dry." },
  { id: "water", name: "Purified water dispenser", description: "Bottle-top dispenser on a carboy of purified water, set to 50.0 mL.", use: "Measures the solvent into the conical flask." },
  { id: "oven", name: "Drying oven and desiccator", description: "Fan oven with a set-point; a glass desiccator with silica gel stands beside it.", use: "Evaporates the aliquot and dries the residue to constant mass; the desiccator cools the dish dry.", spec: "Ambient + 10 to 250 °C", safety: "Hot surfaces: use tongs and heat-resistant gloves." },
  { id: "tester", name: "Dissolution tester (USP Apparatus 2, paddle)", description: "Single 1-L vessel in a 37 °C water bath with a paddle, tachometer and thermometer.", use: "Runs the dissolution test at 37.0 ± 0.5 °C and 50 rpm.", spec: "Paddle 25 ± 2 mm above the vessel base", safety: "Keep fingers clear of the turning paddle." },
  { id: "spectro", name: "UV-Vis spectrophotometer", description: "Single-beam instrument set to 243 nm.", use: "Reads each sample's absorbance after blanking on the medium.", safety: "Never open the lamp housing — the deuterium lamp emits UV that harms eyes and skin." },
  { id: "spatula", name: "Spatula", description: "Stainless-steel spatula.", use: "Transfers powder from the jar to the boat." },
  { id: "boat", name: "Weighing boat", description: "Disposable antistatic plastic boat.", use: "Holds the powder on the balance pan." },
  { id: "syringe-filter", name: "Syringe and 0.45 µm membrane filter", description: "20 mL plastic syringe with a hydrophilic membrane filter.", use: "Draws and filters the saturated solution at the bath temperature." },
  { id: "sampler", name: "Dissolution sampling syringe", description: "Glass syringe on a sampling cannula with a 10 µm cannula filter.", use: `Withdraws ${METHOD.sampleMl} mL at each time point, filtered as it is drawn.` },
  { id: "cuvette", name: "Quartz cuvette (1 cm)", description: "Matched quartz cell, transparent in the UV.", use: "Holds the blank and each sample in the spectrophotometer." },
  { id: "flask", name: "Stoppered conical flask (100 mL)", description: "Glass Erlenmeyer flask with a ground-glass stopper.", use: "Holds water and excess drug while it saturates." },
  { id: "pipette", name: "10 mL bulb pipette (Class A) with filler", description: "Volumetric pipette, ±0.02 mL.", use: "Delivers exactly 10.00 mL of filtrate into the dish; makes sample dilutions." },
  { id: "dish", name: "Evaporating dish", description: "Porcelain dish, already dried to constant mass empty.", use: "The aliquot is evaporated and its residue dried and weighed in it." },
  { id: "cylinder", name: "1000 mL measuring cylinder", description: "Graduated cylinder, 10 mL divisions.", use: `Measures ${METHOD.mediumMl} mL of medium.` },
  { id: "tubes", name: "Sample tubes and dilution flasks", description: "Rack of labelled tubes and small volumetric flasks.", use: "Holds each withdrawn sample and its dilution." },
  { id: "drug", name: "Paracetamol powder", description: "Pharmacopoeial-grade paracetamol, white crystalline powder.", use: "The drug whose solubility is measured.", safety: "Avoid inhaling dust; wash hands after handling." },
  { id: "tablets", name: "Paracetamol 500 mg tablets", description: "Immediate-release tablets, label claim 500 mg.", use: "One tablet per vessel." },
  { id: "medium", name: "pH 5.8 phosphate buffer", description: "Deaerated pH 5.8 phosphate buffer (USP), prepared in advance; a portion kept at 37 °C for replacement.", use: "Dissolution medium, blank and diluent." },
  { id: "notebook", name: "Lab notebook", description: "Your record: every reading you recorded is already in it.", use: "Choose the activity, calculate, and record the verdict." },
  ...KIT.equipment,
];

const STEP_HINT_SOL = [
  "Variables: final constant mass m₂ (g), empty dish m₀ (g), aliquot volume V (mL).",
  "Formula: solubility (g/100 mL) = (m₂ − m₀) ÷ V × 100; mg/mL = g/100 mL × 10.",
  "Substitute with units: (m₂ g − m₀ g) ÷ 10.00 mL × 100 = … g/100 mL; then × 10 → … mg/mL.",
];

export const SOLUBILITY_DISSOLUTION: ExperimentDefinition<SolubilityDissolutionState, SolubilityDissolutionAction> = {
  meta: LABS["solubility-dissolution"],
  principle: [
    "Equilibrium solubility is the concentration of a saturated solution in contact with excess undissolved solid at a stated temperature. If no solid remains, the solution is not known to be saturated — only that everything you added dissolved.",
    "The shake-flask method agitates excess drug in the solvent at constant temperature until equilibrium, then samples the clear solution at that temperature (a cold syringe can crystallise drug out), and measures it — here gravimetrically, by evaporating an aliquot and drying the residue to constant mass.",
    "Published data (Granberg & Rasmuson, 1999): paracetamol dissolves to 12.78 g/kg water at 20 °C, 14.90 at 25 °C and 17.39 at 30 °C — 'sparingly soluble' in the USP's descriptive terms.",
    "Dissolution is the RATE at which drug leaves a dosage form. This activity is modelled on the USP Acetaminophen Tablets test (paddle, 50 rpm, 900 mL pH 5.8 phosphate buffer at 37 °C, Q = 80 % in 30 min). Samples are filtered, diluted into the calibration range and read at ~243 nm; each withdrawn sample removes drug, which the calculation adds back.",
    "Sink conditions (medium ≥ 3 × the volume the dose would saturate) keep the dissolution rate from being limited by solubility — which is why the solubility is measured first.",
    "SIMULATION: the release profile, absorbance noise, calibration line and drying behaviour are teaching models with stated values. This is not a pharmacopoeial test and makes no compliance claim.",
  ],
  safety: [
    "The drying oven and the dish are hot: use tongs and heat-resistant gloves; cool the dish in the desiccator.",
    "The 37 °C dissolution bath and the shaking water bath hold warm water near mains electricity — keep hands dry and the lids on; keep fingers clear of the turning paddle.",
    "The spectrophotometer's UV lamp harms eyes and skin: never open the lamp housing or look into the sample compartment with the lamp exposed.",
    "Paracetamol powder: avoid raising and inhaling dust; wash hands after handling. Drug-containing liquids go to labelled aqueous chemical waste and drug-bearing solids to chemical solid waste — never the sink or the general bin.",
  ],
  equipment: EQUIPMENT,
  materials: [
    { id: "drug", name: "Paracetamol (acetaminophen)", detail: "C₈H₉NO₂, Mr 151.16; m.p. ≈ 169 °C", hazard: "Harmful if swallowed in quantity; avoid dust." },
    { id: "water", name: "Purified water", detail: "Solvent for the solubility study" },
    { id: "tablets", name: "Paracetamol 500 mg tablets", detail: "Immediate release; label claim 500 mg" },
    { id: "medium", name: "pH 5.8 phosphate buffer", detail: "Dissolution medium, deaerated, 900 mL per vessel" },
  ],
  steps: [
    { id: "saturate", title: "Prepare the saturating flask", objective: `Get the flask, dispense ${METHOD.waterMl} mL of purified water, add an EXCESS of paracetamol, stopper the flask and clamp it in the shaking bath.`, hints: ["Take the flask, boat, spatula and drug jar from their cabinets.", `Expect roughly 0.75 g to dissolve in ${METHOD.waterMl} mL at 25 °C — add clearly more, about twice that.`, "Water first, then the powder; stopper before it goes in the bath."], focus: ["flask", "water", "balance", "drug", "water-bath"] },
    { id: "equilibrate", title: "Equilibrate", objective: `Hold the flask at ${METHOD.protocolC} °C with shaking for ${METHOD.equilibrationH} h. At the end, undissolved solid must still be visible.`, hints: [`Set the bath to ${METHOD.protocolC} °C and turn the shaker on.`, "Time only counts while the flask is shaken at the set temperature.", "No solid left? Then it is NOT saturated — add more powder and equilibrate again."], focus: ["water-bath", "flask"], safety: "Warm water and electricity: keep the lid on, hands dry." },
    { id: "sample-sol", title: "Sample at temperature", objective: "Weigh the empty dish and record it; pre-warm the syringe filter in the bath; filter the saturated solution; pipette 10.00 mL into the dish.", hints: ["Empty dish on the balance first — you cannot weigh it empty later.", "Warm the syringe and filter in the bath so nothing crystallises as you filter.", "Pipette exactly 10.00 mL of filtrate into the weighed dish."], focus: ["dish", "balance", "syringe-filter", "water-bath", "pipette"] },
    { id: "dry", title: "Dry to constant mass", objective: `Evaporate and dry at ${METHOD.ovenProtocolC} °C; cool in the desiccator; weigh. Repeat until two weighings agree within 0.5 mg.`, hints: [`Oven to ${METHOD.ovenProtocolC} °C — above ≈ 169 °C paracetamol melts and decomposes.`, "Always cool in the desiccator before weighing.", "Dry a further hour between weighings; stop when two agree within 0.5 mg."], focus: ["oven", "dish", "balance"], safety: "Hot oven and dish: tongs and heat-resistant gloves." },
    { id: "calc-solubility", title: "Calculate the solubility", objective: "From your weighings, calculate the solubility in g/100 mL and in mg/mL.", hints: STEP_HINT_SOL, focus: ["notebook"] },
    { id: "calc-parts", title: "Classify the solubility", objective: "Calculate the parts of water per part of paracetamol and choose the USP descriptive term.", hints: ["Variables: your solubility S (g per 100 mL).", "Formula: parts of solvent ≈ 100 mL ÷ S (g) — mL of solvent per g of solute; then read the USP table.", "Substitute with units: 100 mL ÷ S g = … mL/g; 30 to 100 → Sparingly soluble, 10 to 30 → Soluble, 100 to 1000 → Slightly soluble."], focus: ["notebook"] },
    { id: "medium", title: "Measure the medium", objective: `Measure ${METHOD.mediumMl} mL of pH 5.8 phosphate buffer in the 1000 mL cylinder, read it, and pour it into the vessel.`, hints: ["Large pours to near the mark, then 5 and 10 mL portions.", "Read the bottom of the meniscus at eye level.", `USP allows the stated volume ± 1 % (${METHOD.mediumMl - METHOD.mediumTolMl}–${METHOD.mediumMl + METHOD.mediumTolMl} mL).`], focus: ["cylinder", "medium", "tester"] },
    { id: "conditions", title: "Set and verify the conditions", objective: `Set ${METHOD.targetC} °C and ${METHOD.protocolRpm} rpm, wait for the medium to reach ${METHOD.targetC}.0 ± ${METHOD.tempTolC} °C, then verify by recording the thermometer and tachometer.`, hints: ["Heat first; the medium takes about 20 minutes to warm from room temperature.", "Verify immediately before the tablet goes in.", "Record exactly what the thermometer and tachometer read."], focus: ["tester"], safety: "Keep fingers clear of the paddle shaft." },
    { id: "calc-sink", title: "Check sink conditions", objective: `Using your solubility (mg/mL), calculate the volume a ${METHOD.doseMg} mg dose would saturate.`, hints: ["Variables: dose D (mg), your solubility S (mg/mL), medium volume V (mL).", "Formula: saturation volume = D ÷ S; sink ratio = V ÷ (D ÷ S), which must be ≥ 3.", `Substitute with units: ${METHOD.doseMg} mg ÷ S mg/mL = … mL; ${METHOD.mediumMl} mL ÷ … mL = … (≥ 3?).`], focus: ["notebook"] },
    { id: "run", title: "Run the test and sample", objective: `Drop the tablet (timer starts). Withdraw ${METHOD.sampleMl} mL at 5, 10, 15, 20, 30 and 45 min, replacing each with warm medium; then stop.`, hints: ["Advance the timer with the wait buttons; sample when it reads the scheduled time.", `Replace each ${METHOD.sampleMl} mL with fresh 37 °C medium straight away.`, "Late or missed points distort the profile — the 30-min point is the one Q is judged at."], focus: ["tester", "sampler", "tablets"] },
    { id: "measure", title: "Measure the samples", objective: `Blank the spectrophotometer on medium, then dilute and read each sample so its absorbance lies within the calibration range (≤ ${METHOD.linearMax.toFixed(1)}).`, hints: ["Blank first, with medium in the cuvette.", `About 0.55 mg/mL at the end × ${METHOD.slope} per µg/mL — work out what dilution keeps A ≤ ${METHOD.linearMax.toFixed(1)}.`, "If the display is above the range or OVER, dilute further before recording."], focus: ["spectro", "cuvette", "tubes"], safety: "UV lamp: keep the housing closed." },
    { id: "calc-dissolved", title: "Calculate % dissolved at 30 min", objective: "From your recorded absorbances, calculate the corrected cumulative % of the label claim dissolved at 30 min.", hints: [`Variables: absorbance A, dilution factor, slope ${METHOD.slope} and intercept ${METHOD.intercept}, V₀ = ${METHOD.mediumMl} mL, v = ${METHOD.sampleMl} mL, label claim ${METHOD.doseMg} mg.`, "Formula: C = (A − b) ÷ m × dilution ÷ 1000 (mg/mL); amount = Cₙ·V₀ + v·Σ(earlier C); % = amount ÷ label × 100.", `Substitute with units: (A − ${METHOD.intercept}) ÷ ${METHOD.slope} µg/mL × DF ÷ 1000 = … mg/mL; … mg/mL × ${METHOD.mediumMl} mL + ${METHOD.sampleMl} mL × … mg/mL = … mg; ÷ ${METHOD.doseMg} mg × 100 = … %.`], focus: ["notebook"] },
    { id: "interpret", title: "Interpret", objective: `Compare the 30-min result with the teaching criterion (one unit ≥ Q + 5 % = ${METHOD.q + 5} %) and record your verdict.`, hints: ["Use the corrected %, not the uncorrected one.", "No 30-min sample means Q cannot be assessed."], focus: ["notebook"] },
    { id: "cleanup", title: "Clean up", objective: "Dispose of every waste in its correct container, switch off the oven, the bath and the tester, and return all apparatus to its cabinet.", hints: ["Drug solutions, suspensions and spent medium go to aqueous chemical waste — never the sink.", "Anything solid that carried the drug (boat, syringe filter, cannula tips, dried residue) goes to chemical solid waste.", "Each item back in the cabinet it came from; close the doors."], focus: ["waste-station", "cabinet-glass", "cabinet-instruments", "cabinet-reagents", "oven", "water-bath", "tester"] },
  ],
  controllers: CONTROLLERS,
  questions: [
    { id: "q1", kind: "design", prompt: "After 2 h of shaking, all the paracetamol you added has dissolved. What does that tell you?", options: ["The solution is saturated", "The solution is not shown to be saturated — add more powder and equilibrate again", "The solubility equals the mass added ÷ volume", "The temperature is too high"], answer: 1, explanation: "Saturation needs excess solid in equilibrium with the solution. Complete dissolution only shows you added too little." },
    { id: "q2", kind: "design", prompt: "Why is the syringe and filter warmed to the bath temperature before sampling?", options: ["To sterilise them", "So the saturated solution does not cool and crystallise in the filter, which would read low", "To speed up filtration only", "It makes no difference"], answer: 1, explanation: "Solubility falls on cooling; a cold filter can deposit drug and lower the filtrate concentration." },
    { id: "q3", kind: "calculation", prompt: "A 10.00 mL aliquot leaves 0.150 g of residue at constant mass. Solubility and USP term?", options: ["1.50 g/100 mL — sparingly soluble", "0.150 g/100 mL — slightly soluble", "15.0 g/100 mL — freely soluble", "1.50 g/100 mL — soluble"], answer: 0, explanation: "0.150 g ÷ 10.00 mL × 100 = 1.50 g/100 mL; 100 ÷ 1.50 = 67 parts → 30 to 100 parts = sparingly soluble." },
    { id: "q4", kind: "viva", prompt: "What are sink conditions in a dissolution test?", options: ["The medium is drained after each sample", "The medium volume is at least about 3 times that needed to saturate the dose", "The tablet sinks to the bottom", "The medium is at 37 °C"], answer: 1, explanation: "Far from saturation, dissolution rate is not limited by solubility (USP ⟨1092⟩ guidance)." },
    { id: "q5", kind: "interpretation", prompt: "You replace each 5 mL sample with fresh medium but forget to correct for drug removed in earlier samples. Your % dissolved will be…", options: ["Too high", "Too low, increasingly so at later times", "Unchanged", "Random"], answer: 1, explanation: "Drug removed in earlier samples is no longer in the vessel; without adding it back, the cumulative amount is understated." },
    { id: "q6", kind: "interpretation", prompt: "The paddle is run at 100 rpm instead of 50 rpm. The release profile will most likely be…", options: ["Slower", "Faster — the diffusion layer is thinner", "Unchanged", "Faster only at the end"], answer: 1, explanation: "Agitation thins the boundary layer (Noyes–Whitney), increasing the dissolution rate; the test then loses its power to discriminate." },
    { id: "q7", kind: "design", prompt: "A sample reads A = 1.85 on an instrument calibrated to 1.0. What should you do?", options: ["Record it — the line can be extended", "Dilute it further so it reads within the calibration range", "Multiply by 2", "Use a 2 cm cell"], answer: 1, explanation: "Outside the validated linear range Beer's law no longer holds; the concentration would read low." },
    { id: "q8", kind: "viva", prompt: "Why is solubility measured BEFORE the dissolution test here?", options: ["It is faster", "To confirm sink conditions in the chosen medium volume", "The USP requires it on every batch", "To calibrate the spectrophotometer"], answer: 1, explanation: "The medium volume must comfortably exceed the volume the dose would saturate; that needs the solubility." },
  ],
  initial,
  suggest,
  apply,
  stepComplete: (s, id) => STEP_DONE[id]?.(s) ?? false,
  benchComplete: (s) => Object.values(STEP_DONE).every((f) => f(s)),
  observations,
  report,
};

/** The ONLY thing the room reads (contract.ts → SolubilityDissolutionVisual). */
export function solubilityDissolutionVisual(s: SolubilityDissolutionState): SolubilityDissolutionVisual {
  const v = s.vessel;
  const disp = spectroDisplay(s);
  return {
    common: KIT.visual(s.bench, s.lastRinse),
    activity: s.activity,
    balance: { reading: balanceReading(s) },
    flask: { waterMl: s.flask.waterMl, solidG: solidG(s), inBath: s.flask.inBath, shaking: s.flask.inBath && s.bath.shaking && s.bath.setC > 0, stoppered: s.flask.stoppered },
    syringeMl: s.syringeMl,
    dish: { ml: s.dish.moistureG > 0.5 ? round(s.dish.moistureG / 0.997, 2) : 0, residueG: s.dish.residueG, inOven: s.dish.where === "oven", onBalance: s.dish.where === "balance" },
    bathC: s.bath.setC || METHOD.roomC,
    ovenC: s.oven.setC || METHOD.roomC,
    tester: {
      mediumMl: v.ml,
      tempC: round(v.tempC, 1),
      rpm: v.running && !v.stopped ? v.rpm : 0,
      running: v.running && !v.stopped,
      tabletIn: v.tabletIn,
      remaining: v.tabletIn ? Math.max(0, round(1 - v.released / s.content, 4)) : 1,
      elapsedMin: v.t,
    },
    tubes: s.samples.length,
    spectro: { cuvetteIn: s.spectro.cuvette !== "none", reading: typeof disp === "number" ? disp : null },
  };
}

/** Bench plan for the 2D lab: every interactive id this experiment uses. */
export const SOLUBILITY_DISSOLUTION_EQUIPMENT_IDS = Array.from(new Set(CONTROLLERS.flatMap((c) => c.equipment)));
