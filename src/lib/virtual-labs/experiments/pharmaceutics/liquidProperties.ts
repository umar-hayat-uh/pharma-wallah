/**
 * PHARMACEUTICS — Physical Properties of Liquids (owner's shortlist, 2026-10-25): ONE module,
 * THREE connected activities, all at 25.0 °C in the thermostatic water bath —
 *   A. density and specific gravity with a pycnometer (specific-gravity bottle),
 *   B. relative viscosity with an Ostwald U-tube viscometer,
 *   C. surface tension by capillary rise.
 * Samples: purified water (the reference in every activity), absolute ethanol, and a
 * 50 % w/w glycerol–water mixture. Reference data and their sources:
 * calculations/liquidProperties.ts. Method equations (tested): calculations/pharmaceutics.ts.
 *
 * ORDER (decided, 2026-10-25): A first, then B, then C.
 *  - A must come first because B and C are calculated with the sample densities, and this
 *    module uses the densities the student MEASURED in A — so a density error carries through
 *    to the viscosity and the surface tension, as it would at the bench ("connected").
 *  - B before C has no scientific reason. It is fixed because the run machine's step pointer
 *    (`currentStepId`: objectives, hints, hint costs and RoboPharma all follow it) walks the
 *    steps in one order; a free B/C order would show the student the wrong step. Making it
 *    free needs a change to engine/machine.ts (shared) — recorded in the report to the lead.
 * The activity selector (notebook) moves the module from one activity to the next and refuses,
 * with that reason, an activity whose prerequisite is not finished.
 *
 * TEMPERATURE: 25 °C, the temperature USP <841> Specific Gravity uses for the bottle method.
 * The room is 22 °C (an air-conditioned lab — a heating-only bath must be set above room
 * temperature). Items warm towards the bath; a measurement taken more than 0.15 °C from the
 * set-point is a mistake, and the reading itself is taken at the item's true temperature
 * (documented temperature relations, never an arbitrary offset), so the error moves the result.
 *
 * Everything here is PURE. Simulated readings are labelled simulated on screen.
 */
import type { ControllerDef, EquipmentDef, ExperimentDefinition, ExperimentReport, Feedback, LabMode, ObservationSection, StepDef, Suggestion } from "../../engine/types";
import { fmt, info, mistake, ok, rand, refuse, round, warn } from "../../engine/machine";
import { LABS } from "../../catalog";
import { capillaryRiseHeight, capillaryRiseTension, ostwaldViscosity, pycnometer, relativeCapillaryTension, WATER_DENSITY, WATER_SURFACE_TENSION, WATER_VISCOSITY } from "../../calculations/pharmaceutics";
import { GLYCEROL_MASS_FRACTION, LIQUIDS, concordant, flowTime, kinematicViscosity, liquidData, mixedKinematic, percentDifference, readingAlongTilt, type Liquid } from "../../calculations/liquidProperties";
import { commonKit, isCommonAction, type BenchCommon, type CabinetId, type CommonAction, type StoredItem, type WasteItem } from "./common";
import { EQUIPMENT_PLAN, type LiquidActivity, type LiquidPropertiesVisual } from "./contract";

export type { Liquid } from "../../calculations/liquidProperties";

/**
 * The method and the simulation's TEACHING VALUES. The reference data are published (see the
 * calculations module); the numbers below describe this virtual apparatus and are stated as
 * teaching values on screen where a student meets them.
 */
export const METHOD = {
  tempC: 25,
  roomC: 22,
  setpoints: [20, 25, 30, 37] as const,
  /** An item counts as at the bath temperature within ±0.15 °C (teaching tolerance). */
  eqTolC: 0.15,
  /** First-order approach to temperature, minutes (teaching values). */
  bathTauMin: 2,
  itemTauMin: 2.5,
  airTauMin: 8,
  waitOptionsMin: [1, 5, 10] as const,
  /** Pycnometer: nominal 25 mL; undrained liquid left inside a wet bottle; bath water clinging outside. */
  pycNominalMl: 25,
  pycResidueMl: 0.3,
  wetOutsideG: 0.04,
  /** Ostwald viscometer constant C (mm²/s²) — gives about 100 s for water at 25 °C. */
  viscC: 0.0089,
  viscResidueMl: 0.15,
  chargeOptionsMl: [5, 8, 10] as const,
  /** Flow time changes by this fraction per mL of charge different from water's (teaching value: a larger charge lowers the driving head). */
  chargeEffectPerMl: 0.03,
  /** Meniscus starts this many seconds (plus up to 1 s) above the upper mark after it is released. */
  leadS: 3,
  /** Start/stop within this many seconds of the meniscus crossing a mark counts as on the mark. */
  markTolS: 0.3,
  /** Human reaction scatter on a hand-held stopwatch, ± s (teaching value). */
  reactionS: 0.15,
  /** Concordance: three consecutive times within 0.5 s (teaching criterion). */
  concordanceS: 0.5,
  flowStepsS: [0.2, 1, 5, 30] as const,
  /** Capillary bore radius, mm (the relative method does not need it — it cancels). */
  capRadiusMm: 0.25,
  /** A greasy, uncleaned bore: contact angle (teaching value). */
  dirtyThetaDeg: 30,
  /** The holder as it comes out of the cabinet: this far off vertical. */
  tiltDeg: 15,
  riseTolMm: 0.3,
  beakerMl: 30,
  /** Transcription tolerances for digital instruments. */
  massTolG: 0.00015,
  timeTolS: 0.006,
  tempTolC: 0.05,
  /** Calculation checks against the student's own data. */
  calcTol: { sg: 0.0005, rho: 0.0005, etaRel: 0.005, gammaRel: 0.005 },
  /** Acceptance bands for the result against the cited reference value, % (teaching bands). */
  acceptPct: { sg: 0.3, rho: 0.3, eta: 2, gamma: 2 },
};

export const LIQUID_NAME: Record<Liquid, string> = {
  water: "purified water",
  ethanol: "ethanol (absolute)",
  glycerol: `glycerol–water ${Math.round(GLYCEROL_MASS_FRACTION * 100)} % w/w`,
};
export const SAMPLE_ID: Record<Liquid, string> = { water: "sample-water", ethanol: "sample-ethanol", glycerol: "sample-glycerol" };
const SAMPLES: Liquid[] = ["ethanol", "glycerol"];

export const ACTIVITIES: { id: LiquidActivity; name: string; short: string }[] = [
  { id: "density", name: "A · Density and specific gravity (pycnometer)", short: "Density" },
  { id: "viscosity", name: "B · Viscosity (Ostwald viscometer)", short: "Viscosity" },
  { id: "surface", name: "C · Surface tension (capillary rise)", short: "Surface tension" },
];

export type CalcKey = "sg-ethanol" | "rho-ethanol" | "sg-glycerol" | "rho-glycerol" | "eta-ethanol" | "eta-glycerol" | "gamma-water" | "gamma-ethanol" | "gamma-glycerol";
export const CALC_KEYS: Record<LiquidActivity, CalcKey[]> = {
  density: ["sg-ethanol", "rho-ethanol", "sg-glycerol", "rho-glycerol"],
  viscosity: ["eta-ethanol", "eta-glycerol"],
  surface: ["gamma-water", "gamma-ethanol", "gamma-glycerol"],
};
export const CALC_LABEL: Record<CalcKey, { label: string; unit: string; dp: number }> = {
  "sg-ethanol": { label: "Specific gravity of ethanol (25/25 °C)", unit: "", dp: 4 },
  "rho-ethanol": { label: "Density of ethanol at 25 °C", unit: "g/mL", dp: 4 },
  "sg-glycerol": { label: "Specific gravity of glycerol–water (25/25 °C)", unit: "", dp: 4 },
  "rho-glycerol": { label: "Density of glycerol–water at 25 °C", unit: "g/mL", dp: 4 },
  "eta-ethanol": { label: "Viscosity of ethanol at 25 °C", unit: "mPa·s", dp: 3 },
  "eta-glycerol": { label: "Viscosity of glycerol–water at 25 °C", unit: "mPa·s", dp: 3 },
  "gamma-water": { label: "Surface tension of water at 25 °C (absolute, capillary check)", unit: "mN/m", dp: 2 },
  "gamma-ethanol": { label: "Surface tension of ethanol at 25 °C", unit: "mN/m", dp: 2 },
  "gamma-glycerol": { label: "Surface tension of glycerol–water at 25 °C", unit: "mN/m", dp: 2 },
};
const activityOf = (k: CalcKey): LiquidActivity => (k.startsWith("eta") ? "viscosity" : k.startsWith("gamma") ? "surface" : "density");
const liquidOf = (k: CalcKey): Liquid => (k.endsWith("ethanol") ? "ethanol" : k.endsWith("water") ? "water" : "glycerol");

// ── The shared bench: cabinets, sink, waste ─────────────────────────────────

const PLAN = EQUIPMENT_PLAN["liquid-properties"];
const STORED_NAMES: Record<string, string> = {
  thermometer: "Digital thermometer",
  stopwatch: "Stopwatch",
  pycnometer: "Pycnometer (25 mL)",
  viscometer: "Ostwald viscometer",
  pipette: "10 mL pipette and filler",
  capillary: "Capillary tube on a scaled holder",
  beaker: "50 mL beaker",
  "sample-water": "Purified water",
  "sample-ethanol": "Ethanol (absolute)",
  "sample-glycerol": "Glycerol–water 50 % w/w",
};
const STORED: StoredItem[] = Object.entries(PLAN.stored).map(([id, cabinet]) => ({ id, name: STORED_NAMES[id] ?? id, cabinet: cabinet as CabinetId }));

/**
 * Waste per vessel and liquid (docs/virtual-labs/PHARMACEUTICS_REFERENCE_DATA.md §6):
 *  - Ethanol, at any strength → non-halogenated organic waste, hazardous (never a drain): flash
 *    point 13 °C (NIOSH Pocket Guide, https://www.cdc.gov/niosh/npg/npgd0262.html); "Ethanol cannot
 *    be disposed of down the drain at any concentration" (West Chester University EHS, Ethanol
 *    Purchase and Use Procedures, 2022) — the strictest rule, taught as the default; local rules may differ.
 *  - Glycerol–water 50 % w/w → aqueous chemical waste, NOT hazardous (not ignitable or toxic) but
 *    not on the NIH Drain Discharge Guide's approved list, so "managed as chemical waste"
 *    (https://nems.nih.gov/Documents/NIH_Drain_Discharge_Guide.pdf). Collected, not sunk.
 *  - Purified water → sink, with the tap running (the shared kit refuses it with the tap off).
 *  - Used or broken capillary → broken glass & sharps.
 * Dilution is never a route to the sink.
 */
const VESSEL_NAME = { pyc: "pycnometer", visc: "viscometer", beaker: "beaker" } as const;
type VesselKey = keyof typeof VESSEL_NAME;
const WASTE_WHY: Record<Liquid, { stream: WasteItem["stream"]; why: string; hazardous: boolean }> = {
  water: { stream: "sink", hazardous: false, why: "Purified water is the one waste in this practical that is sink-safe." },
  ethanol: { stream: "organic", hazardous: true, why: "Ethanol is a flammable solvent (flash point 13 °C): it is collected as non-halogenated organic waste at any strength — never a drain, and diluting it does not make it sink-safe." },
  glycerol: { stream: "aqueous", hazardous: false, why: "The glycerol–water mixture is not ignitable or toxic, but it is not on the approved drain-disposal list, so it is collected as aqueous chemical waste, not sunk." },
};
export const wasteId = (v: VesselKey, l: Liquid) => `${v}-${l}`;
const WASTE: WasteItem[] = [
  ...(Object.keys(VESSEL_NAME) as VesselKey[]).flatMap((v) =>
    LIQUIDS.map((l) => ({ id: wasteId(v, l), name: `${LIQUID_NAME[l][0].toUpperCase()}${LIQUID_NAME[l].slice(1)} from the ${VESSEL_NAME[v]}`, ...WASTE_WHY[l] })),
  ),
  { id: "capillary-used", name: "Used capillary tube", stream: "glass", hazardous: false, why: "A used glass capillary is a sharp: broken glass & sharps container." },
];
export const KIT = commonKit({ stored: STORED, waste: WASTE });

// ── State ───────────────────────────────────────────────────────────────────

export interface LiquidPropertiesState {
  seed: number;
  inspected: string[];
  bench: BenchCommon;
  lastRinse: string | null;
  activity: LiquidActivity;
  minute: number;
  bath: { set: number | null; c: number; thermo: boolean; checked: number | null };
  /** Pycnometer: what is in it, what film is left inside, and the liquid mass captured when stoppered. */
  pyc: { content: Liquid | null; residue: Liquid | null; carry: Liquid | null; inBath: boolean; since: number; tempC: number; stoppered: boolean; liquidG: number; wetOutside: boolean; onBalance: boolean };
  visc: {
    clamped: boolean;
    charge: Liquid | null;
    chargeMl: number;
    residue: Liquid | null;
    carry: Liquid | null;
    since: number;
    tempC: number;
    flowing: boolean;
    /** Simulated time since release, tenths of a second (integers — no drift). */
    t10: number;
    /** Seconds after release at which the meniscus crosses the upper and lower marks (this run). */
    tu: number;
    tl: number;
    start10: number | null;
    stop10: number | null;
    display: number | null;
    trial: number;
  };
  cap: { vertical: boolean; dipped: Liquid | null; thetaDeg: number; riseMm: number; readMm: number; discarded: boolean };
  beaker: { liquid: Liquid | null; inBath: boolean; since: number; tempC: number };
  /** The bottle most recently poured from (the room shows it in hand). */
  inUse: Liquid | null;
  dens: { empty: number | null; filled: Partial<Record<Liquid, number>> };
  chargeRef: number | null;
  times: Record<Liquid, number[]>;
  rise: Partial<Record<Liquid, number>>;
  calc: Partial<Record<CalcKey, number>>;
  attempts: Partial<Record<CalcKey, number>>;
  solutions: CalcKey[];
}

export type LiquidPropertiesAction =
  | CommonAction
  | { type: "inspect"; id: string }
  | { type: "selectActivity"; activity: LiquidActivity }
  | { type: "calc"; key: CalcKey; value: number }
  | { type: "solution"; key: CalcKey; mode: LabMode }
  | { type: "setBath"; c: number }
  | { type: "thermoIn" }
  | { type: "thermoOut" }
  | { type: "wait"; minutes: number }
  | { type: "recordBathTemp"; value: number }
  | { type: "pycWeigh" }
  | { type: "recordMass"; value: number }
  | { type: "pycFill"; liquid: Liquid }
  | { type: "pycRinseWith"; liquid: Liquid }
  | { type: "pycToBath" }
  | { type: "pycStopper" }
  | { type: "pycWipe" }
  | { type: "pycEmpty" }
  | { type: "pycDry" }
  | { type: "viscClamp" }
  | { type: "viscCharge"; liquid: Liquid; ml: number }
  | { type: "viscDraw" }
  | { type: "flow"; seconds: number }
  | { type: "startWatch" }
  | { type: "stopWatch" }
  | { type: "recordTime"; value: number }
  | { type: "viscEmpty" }
  | { type: "viscDry" }
  | { type: "beakerFill"; liquid: Liquid }
  | { type: "beakerToBath" }
  | { type: "beakerEmpty" }
  | { type: "capAlign" }
  | { type: "capDip" }
  | { type: "recordRise"; value: number }
  | { type: "capLift" }
  | { type: "capDiscard" };

// ── Derived quantities (the room and the panels read these; they never compute) ──

/** The pycnometer's own (seeded) mass with stopper, g, and true volume, mL. Unknown to the student; both cancel. */
export function pycBottle(seed: number) {
  return { massG: round(20.5 + rand(seed, 31) * 2, 4), volumeMl: METHOD.pycNominalMl + (rand(seed, 32) - 0.5) * 0.06 };
}

/** What the analytical balance displays with the pycnometer on the pan (g, 4 dp), or 0. */
export function balanceReading(s: LiquidPropertiesState): number {
  if (!s.pyc.onBalance) return 0;
  const b = pycBottle(s.seed);
  let m = b.massG;
  if (s.pyc.content) m += s.pyc.liquidG;
  else if (s.pyc.residue) m += METHOD.pycResidueMl * liquidData(s.pyc.residue, METHOD.roomC).rho;
  if (s.pyc.wetOutside) m += METHOD.wetOutsideG;
  const key = s.pyc.content ? LIQUIDS.indexOf(s.pyc.content) : 9;
  const noise = (Math.floor(rand(s.seed, 33, key) * 3) - 1) * 0.0001;
  return round(m + noise, 4);
}

const equilibrated = (s: LiquidPropertiesState, tC: number) => s.bath.set !== null && Math.abs(tC - s.bath.set) <= METHOD.eqTolC;

/** Where the meniscus is relative to the next timing mark, for the magnified 2D view. */
export function timingView(s: LiquidPropertiesState): { mark: "upper" | "lower" | null; offsetMm: number } {
  const v = s.visc;
  if (!v.flowing) return { mark: null, offsetMm: 0 };
  const t = v.t10 / 10;
  const T = v.tl - v.tu;
  // In the narrow stems above and below the bulb the meniscus moves fast — that is why the
  // marks are etched there. Teaching geometry: 750 mm of stem-equivalent travel over the run.
  const speed = 750 / Math.max(T, 1);
  const mark = t <= (v.tu + v.tl) / 2 ? "upper" : "lower";
  const at = mark === "upper" ? v.tu : v.tl;
  // positive = meniscus still ABOVE the mark
  return { mark, offsetMm: (at - t) * speed };
}

/** Liquid level in the timing bulb, contract scale: 0 above the upper mark … 1 below the lower mark. Upper mark at 0.1, lower at 0.9. */
function viscLevel(s: LiquidPropertiesState): number {
  const v = s.visc;
  if (!v.charge) return 1;
  if (!v.flowing) return 1; // drained back into the lower bulb
  const t = v.t10 / 10;
  if (t <= v.tu) return 0.1 * (t / Math.max(v.tu, 0.1));
  return Math.min(1, 0.1 + 0.8 * ((t - v.tu) / Math.max(v.tl - v.tu, 0.1)));
}

export function stopwatchSeconds(s: LiquidPropertiesState): { running: boolean; seconds: number } {
  const v = s.visc;
  const running = v.start10 !== null && v.stop10 === null;
  return { running, seconds: running ? (v.t10 - v.start10!) / 10 : v.display ?? 0 };
}

export function liquidPropertiesVisual(s: LiquidPropertiesState): LiquidPropertiesVisual {
  const sw = stopwatchSeconds(s);
  return {
    common: KIT.visual(s.bench, s.lastRinse),
    activity: s.activity,
    sample: s.inUse ? SAMPLE_ID[s.inUse] : null,
    bathC: round(s.bath.c, 1),
    balance: { reading: balanceReading(s) },
    pycnometer: {
      content: s.pyc.content ? (SAMPLE_ID[s.pyc.content] as "sample-water" | "sample-ethanol" | "sample-glycerol") : "empty",
      onBalance: s.pyc.onBalance,
      stoppered: s.pyc.stoppered,
      dried: !s.pyc.content && s.pyc.residue === null,
    },
    viscometer: { inBath: s.visc.clamped, charged: !!s.visc.charge, level: viscLevel(s), flowing: s.visc.flowing },
    stopwatch: { running: sw.running, seconds: round(sw.seconds, 2) },
    capillary: { dipped: !!s.cap.dipped, riseMm: s.cap.dipped ? round(s.cap.riseMm, 2) : 0, tiltDeg: s.cap.vertical ? 0 : METHOD.tiltDeg },
    beakerMl: s.beaker.liquid ? METHOD.beakerMl : 0,
  };
}

// ── Results from the student's own data ─────────────────────────────────────

const RHO_W = WATER_DENSITY[METHOD.tempC];
const ETA_W = WATER_VISCOSITY[METHOD.tempC];
const GAMMA_W = WATER_SURFACE_TENSION[METHOD.tempC];

export function meanTime(s: LiquidPropertiesState, l: Liquid): number | null {
  return concordant(s.times[l], 3, METHOD.concordanceS)?.mean ?? null;
}

/** The value each calculation must give from the student's OWN recorded data (NaN until the data exist). */
export function calcExpected(s: LiquidPropertiesState, key: CalcKey): number {
  const l = liquidOf(key);
  const { empty, filled } = s.dens;
  const pyc = empty !== null && filled.water !== undefined && filled[l] !== undefined ? pycnometer(empty, filled[l]!, filled.water!, RHO_W) : null;
  // B and C use the density the student calculated in A (accepted within tolerance), else the one their masses give.
  const rho = s.calc[`rho-${l}` as CalcKey] ?? pyc?.density ?? NaN;
  switch (activityOf(key)) {
    case "density":
      return pyc ? (key.startsWith("sg") ? pyc.sg : pyc.density) : NaN;
    case "viscosity": {
      const tw = meanTime(s, "water");
      const tl = meanTime(s, l);
      return tw !== null && tl !== null ? ostwaldViscosity(rho, tl, RHO_W, tw, ETA_W) : NaN;
    }
    case "surface": {
      const hw = s.rise.water;
      const hl = s.rise[l];
      // Water: ABSOLUTE, from the stated bore radius — the check that the capillary is clean and
      // vertical. A dirty or tilted capillary affects every liquid alike, so it cancels in the
      // relative method; only an absolute value shows it.
      if (key === "gamma-water") return hw !== undefined ? capillaryRiseTension(RHO_W, hw, METHOD.capRadiusMm, 0) : NaN;
      return hw !== undefined && hl !== undefined ? relativeCapillaryTension(rho, hl, RHO_W, hw, GAMMA_W) : NaN;
    }
  }
}

function calcCorrect(key: CalcKey, value: number, expected: number) {
  const t = METHOD.calcTol;
  if (!Number.isFinite(value) || !Number.isFinite(expected)) return false;
  if (key.startsWith("sg")) return Math.abs(value - expected) <= t.sg;
  if (key.startsWith("rho")) return Math.abs(value - expected) <= t.rho;
  if (key.startsWith("eta")) return Math.abs(value - expected) <= t.etaRel * expected;
  return Math.abs(value - expected) <= t.gammaRel * expected;
}

/** The cited reference value at 25 °C for a calculation (for the % difference in the report). */
export function referenceFor(key: CalcKey): number {
  const d = liquidData(liquidOf(key), METHOD.tempC);
  if (key.startsWith("sg")) return d.rho / RHO_W;
  if (key.startsWith("rho")) return d.rho;
  if (key.startsWith("eta")) return d.eta;
  return d.gamma;
}

/**
 * The worked solution for a calculation, written with the student's OWN numbers: variables →
 * formula → substitution with units → result. Shown in Learning at any time; in Practical only
 * after one wrong attempt, and recorded (and scored) when it is opened.
 */
export function workedSolution(s: LiquidPropertiesState, key: CalcKey): { lines: string[]; result: string } | null {
  const l = liquidOf(key);
  const name = LIQUID_NAME[l];
  const value = calcExpected(s, key);
  if (!Number.isFinite(value)) return null;
  const dp = CALC_LABEL[key].dp;
  const { empty, filled } = s.dens;
  switch (activityOf(key)) {
    case "density": {
      const sg = pycnometer(empty!, filled[l]!, filled.water!, RHO_W).sg;
      const lines = [
        `Variables: m₁ (empty, dry pycnometer) = ${empty!.toFixed(4)} g; m₂ (filled with water) = ${filled.water!.toFixed(4)} g; m₃ (filled with ${name}) = ${filled[l]!.toFixed(4)} g; ρ(water, 25 °C) = ${RHO_W} g/mL.`,
        "Formula: SG(25/25 °C) = (m₃ − m₁) ÷ (m₂ − m₁) — the same bottle volume at the same temperature, so the volume cancels; SG has no unit.",
        `Substitution: SG = (${filled[l]!.toFixed(4)} g − ${empty!.toFixed(4)} g) ÷ (${filled.water!.toFixed(4)} g − ${empty!.toFixed(4)} g) = ${(filled[l]! - empty!).toFixed(4)} g ÷ ${(filled.water! - empty!).toFixed(4)} g = ${sg.toFixed(4)}`,
      ];
      if (key.startsWith("rho")) lines.push(`Density: ρ = SG × ρ(water, 25 °C) = ${sg.toFixed(4)} × ${RHO_W} g/mL = ${value.toFixed(4)} g/mL`);
      return { lines, result: key.startsWith("rho") ? `${value.toFixed(dp)} g/mL` : value.toFixed(dp) };
    }
    case "viscosity": {
      const tw = meanTime(s, "water")!;
      const tl = meanTime(s, l)!;
      const rho = s.calc[`rho-${l}` as CalcKey] ?? pycnometer(empty!, filled[l]!, filled.water!, RHO_W).density;
      return {
        lines: [
          `Variables: t(water) = ${tw.toFixed(2)} s and t(${name}) = ${tl.toFixed(2)} s (means of three concordant times); ρ(${name}) = ${rho.toFixed(4)} g/mL (your activity A); ρ(water) = ${RHO_W} g/mL; η(water, 25 °C) = ${ETA_W} mPa·s.`,
          "Formula: η₁ ÷ η₂ = (ρ₁ t₁) ÷ (ρ₂ t₂), same viscometer, same charge volume, same temperature → η = η(water) × (ρ t) ÷ (ρ(water) t(water)).",
          `Substitution: η = ${ETA_W} mPa·s × (${rho.toFixed(4)} g/mL × ${tl.toFixed(2)} s) ÷ (${RHO_W} g/mL × ${tw.toFixed(2)} s) — g/mL and s cancel, leaving mPa·s.`,
        ],
        result: `${value.toFixed(dp)} mPa·s`,
      };
    }
    case "surface": {
      const hw = s.rise.water!;
      if (key === "gamma-water") {
        return {
          lines: [
            `Variables: h(water) = ${hw.toFixed(1)} mm = ${(hw / 1000).toFixed(5)} m; r = ${METHOD.capRadiusMm} mm = ${(METHOD.capRadiusMm / 1000).toFixed(5)} m (stated on the holder); ρ(water) = ${RHO_W} g/mL = ${(RHO_W * 1000).toFixed(2)} kg/m³; g = 9.80665 m/s²; θ ≈ 0 on clean glass.`,
            "Formula: γ = ρ g h r ÷ (2 cos θ) = ρ g h r ÷ 2 for θ = 0 — in SI units this gives N/m; × 1000 for mN/m.",
            `Substitution: γ = ${(RHO_W * 1000).toFixed(2)} kg/m³ × 9.80665 m/s² × ${(hw / 1000).toFixed(5)} m × ${(METHOD.capRadiusMm / 1000).toFixed(5)} m ÷ 2 = ${(value / 1000).toFixed(5)} N/m = ${value.toFixed(2)} mN/m`,
          ],
          result: `${value.toFixed(dp)} mN/m`,
        };
      }
      const hl = s.rise[l]!;
      const rho = s.calc[`rho-${l}` as CalcKey] ?? pycnometer(empty!, filled[l]!, filled.water!, RHO_W).density;
      return {
        lines: [
          `Variables: h(water) = ${hw.toFixed(1)} mm and h(${name}) = ${hl.toFixed(1)} mm in the same capillary; ρ(${name}) = ${rho.toFixed(4)} g/mL (your activity A); ρ(water) = ${RHO_W} g/mL; γ(water, 25 °C) = ${GAMMA_W} mN/m.`,
          "Formula: γ = ρ g h r ÷ (2 cos θ). Same capillary (same r), clean glass (θ ≈ 0) → γ₁ ÷ γ₂ = (ρ₁ h₁) ÷ (ρ₂ h₂) → γ = γ(water) × (ρ h) ÷ (ρ(water) h(water)).",
          `Substitution: γ = ${GAMMA_W} mN/m × (${rho.toFixed(4)} g/mL × ${hl.toFixed(1)} mm) ÷ (${RHO_W} g/mL × ${hw.toFixed(1)} mm) — g/mL and mm cancel, leaving mN/m.`,
        ],
        result: `${value.toFixed(dp)} mN/m`,
      };
    }
  }
}

/** The results table: each sample's three properties from the student's calculations, against the cited value. */
export function resultsTable(s: LiquidPropertiesState) {
  return LIQUIDS.map((l) => {
    const ref = liquidData(l, METHOD.tempC);
    const row = (key: CalcKey | null, refValue: number, accept: number) => {
      const value = key ? s.calc[key] ?? null : refValue;
      const diff = value !== null && key ? percentDifference(value, refValue) : null;
      return { value, ref: refValue, diff, pass: diff === null ? null : Math.abs(diff) <= accept };
    };
    return {
      liquid: l,
      name: LIQUID_NAME[l],
      // water is the reference: its values are the table's, not measured
      rho: row(l === "water" ? null : (`rho-${l}` as CalcKey), ref.rho, METHOD.acceptPct.rho),
      sg: row(l === "water" ? null : (`sg-${l}` as CalcKey), ref.rho / RHO_W, METHOD.acceptPct.sg),
      eta: row(l === "water" ? null : (`eta-${l}` as CalcKey), ref.eta, METHOD.acceptPct.eta),
      gamma: row(`gamma-${l}` as CalcKey, ref.gamma, METHOD.acceptPct.gamma),
    };
  });
}

// ── Temperature over time ───────────────────────────────────────────────────

function advance(s: LiquidPropertiesState, minutes: number): LiquidPropertiesState {
  const dt = 0.25;
  const room = METHOD.roomC;
  let c = s.bath.c;
  let { tempC: pT } = s.pyc;
  let vT = s.visc.tempC;
  let bT = s.beaker.tempC;
  const k = (tau: number) => 1 - Math.exp(-dt / tau);
  for (let t = 0; t < minutes - 1e-9; t += dt) {
    c += ((s.bath.set ?? room) - c) * k(METHOD.bathTauMin);
    if (s.pyc.content && !s.pyc.stoppered) pT += ((s.pyc.inBath ? c : room) - pT) * k(s.pyc.inBath ? METHOD.itemTauMin : METHOD.airTauMin);
    if (s.visc.charge) vT += ((s.visc.clamped ? c : room) - vT) * k(s.visc.clamped ? METHOD.itemTauMin : METHOD.airTauMin);
    if (s.beaker.liquid) bT += ((s.beaker.inBath ? c : room) - bT) * k(s.beaker.inBath ? METHOD.itemTauMin : METHOD.airTauMin);
  }
  return {
    ...s,
    minute: s.minute + minutes,
    bath: { ...s.bath, c: round(c, 3) },
    pyc: { ...s.pyc, tempC: round(pT, 3) },
    visc: { ...s.visc, tempC: round(vT, 3) },
    beaker: { ...s.beaker, tempC: round(bT, 3) },
  };
}

/** A measurement taken away from the set-point: the reading is real for that temperature, and the result moves. */
function notEquilibrated(s: LiquidPropertiesState, what: string, l: Liquid, tC: number): Feedback {
  const cold = tC < (s.bath.set ?? METHOD.tempC);
  const dir = cold
    ? "Colder than 25 °C, the liquid is denser, more viscous and has a higher surface tension than at 25 °C, so this reading is high"
    : "Warmer than 25 °C, the liquid is less dense, less viscous and has a lower surface tension than at 25 °C, so this reading is low";
  const carry = l === "water" ? `${dir}. Water is the reference, so every sample result calculated against it comes out ${cold ? "low" : "high"}.` : `${dir}, and so is the result calculated from it.`;
  return mistake("not-equilibrated", 5, `${what} at ${tC.toFixed(1)} °C — not yet at the bath's 25.0 °C.`, `${carry} Leave every item in the bath until it has reached the set-point (about 10 minutes) before measuring.`);
}

// ── The experiment ──────────────────────────────────────────────────────────

const initial = (seed: number): LiquidPropertiesState => ({
  seed,
  inspected: [],
  bench: KIT.initial(),
  lastRinse: null,
  activity: "density",
  minute: 0,
  bath: { set: null, c: METHOD.roomC, thermo: false, checked: null },
  pyc: { content: null, residue: null, carry: null, inBath: false, since: 0, tempC: METHOD.roomC, stoppered: false, liquidG: 0, wetOutside: false, onBalance: false },
  visc: { clamped: false, charge: null, chargeMl: 0, residue: null, carry: null, since: 0, tempC: METHOD.roomC, flowing: false, t10: 0, tu: 0, tl: 0, start10: null, stop10: null, display: null, trial: 0 },
  cap: { vertical: false, dipped: null, thetaDeg: 0, riseMm: 0, readMm: 0, discarded: false },
  beaker: { liquid: null, inBath: false, since: 0, tempC: METHOD.roomC },
  inUse: null,
  dens: { empty: null, filled: {} },
  chargeRef: null,
  times: { water: [], ethanol: [], glycerol: [] },
  rise: {},
  calc: {},
  attempts: {},
  solutions: [],
});

export const densityDone = (s: LiquidPropertiesState) => CALC_KEYS.density.every((k) => s.calc[k] !== undefined);
export const viscosityDone = (s: LiquidPropertiesState) => CALC_KEYS.viscosity.every((k) => s.calc[k] !== undefined);
export const surfaceDone = (s: LiquidPropertiesState) => CALC_KEYS.surface.every((k) => s.calc[k] !== undefined) && s.cap.discarded;
const canSelect = (s: LiquidPropertiesState, a: LiquidActivity) => (a === "density" ? true : a === "viscosity" ? densityDone(s) : densityDone(s) && viscosityDone(s));

/** Whether a stored item may go back in its cabinet (the shared kit asks). */
function inUse(s: LiquidPropertiesState, item: string): boolean {
  switch (item) {
    case "pycnometer":
      return !!s.pyc.content || s.pyc.inBath || s.pyc.residue === "glycerol";
    case "viscometer":
      return !!s.visc.charge || s.visc.clamped || s.visc.residue === "glycerol";
    case "beaker":
      return !!s.beaker.liquid || s.beaker.inBath;
    case "capillary":
      return true; // single-use: it goes to the glass waste, not back in the cupboard
    case "thermometer":
      return s.bath.thermo;
    default:
      return false;
  }
}

/** Drying with warm air removes water and ethanol; glycerol does not evaporate and must be rinsed out first. */
function dryVessel(residue: Liquid | null, name: string): Feedback | null {
  if (residue === null) return refuse(`The ${name} is already clean and dry.`);
  if (residue === "glycerol") return refuse(`Glycerol does not evaporate — rinse the ${name} out with water at the sink first, then dry it.`);
  return null;
}

function apply(s: LiquidPropertiesState, a: LiquidPropertiesAction): { state: LiquidPropertiesState; feedback: Feedback[] } {
  const same = (...fb: Feedback[]) => ({ state: s, feedback: fb });
  const next = (patch: Partial<LiquidPropertiesState>, ...fb: Feedback[]) => ({ state: { ...s, ...patch }, feedback: fb });
  const need = (...items: string[]) => KIT.need(s.bench, ...items);
  const inActivity = (act: LiquidActivity) =>
    s.activity === act ? null : refuse(`That belongs to ${ACTIVITIES.find((x) => x.id === act)!.name}. Select it in the lab notebook first.`);

  if (isCommonAction(a)) {
    if (a.type === "rinse") {
      const holding: Record<string, Liquid | null> = { pycnometer: s.pyc.content, viscometer: s.visc.charge, beaker: s.beaker.liquid };
      const held = holding[a.item] ?? null;
      if (held === "ethanol") return same(mistake("waste-hazard-to-sink", 8, `Tried to rinse the ${a.item} at the sink while it still held ethanol.`, "Refused: that would pour ethanol down the drain. Empty it into the waste first (non-halogenated organic waste), then rinse."));
      if (held) return same(refuse(`Empty the ${a.item} into the waste first — rinsing it now would pour ${LIQUID_NAME[held]} down the sink.`));
      if (a.item === "viscometer" && s.visc.clamped) return same(refuse("Unclamp the viscometer from the bath before rinsing it (empty it first)."));
      if (a.item === "capillary" && s.cap.dipped) return same(refuse("Lift the capillary out of the beaker first."));
    }
    if (a.type === "return" && a.item === "thermometer" && s.bath.thermo) return same(refuse("Take the thermometer out of the bath first."));
    if (a.type === "return" && a.item === "viscometer" && (s.visc.clamped || s.visc.charge)) return same(refuse("Empty and unclamp the viscometer first."));
    if (a.type === "return" && a.item === "capillary") return same(refuse("A used capillary is single-use: discard it into the broken glass & sharps container, do not put it back."));
    const r = KIT.apply(s.bench, a, { inUse: (it) => inUse(s, it) });
    if (!r.changed) return same(...r.feedback);
    let bench = r.bench;
    const patch: Partial<LiquidPropertiesState> = {};
    if (a.type === "rinse") {
      patch.lastRinse = a.item;
      // Rinsed glass is clean but WET with water until it is dried.
      if (a.item === "pycnometer") patch.pyc = { ...s.pyc, residue: "water" };
      if (a.item === "viscometer") patch.visc = { ...s.visc, residue: "water" };
    }
    if (a.type === "dispose" && a.waste === "capillary-used") bench = { ...bench, out: bench.out.filter((x) => x !== "capillary") };
    return { state: { ...s, ...patch, bench }, feedback: r.feedback };
  }

  switch (a.type) {
    case "inspect":
      return s.inspected.includes(a.id) ? same() : next({ inspected: [...s.inspected, a.id] });

    // ── Notebook ─────────────────────────────────────────────────────────
    case "selectActivity": {
      if (a.activity === s.activity) return same(info(`${ACTIVITIES.find((x) => x.id === a.activity)!.name} is already selected.`));
      if (!canSelect(s, a.activity)) {
        return same(
          refuse(
            a.activity === "viscosity"
              ? "Finish activity A first: the viscosity is calculated with the densities you measure there (η = η(water) × ρt ÷ ρ(water)t(water))."
              : densityDone(s)
                ? "Finish activity B first — the activities run A → B → C, and the procedure panel follows that order."
                : "Finish activity A first: the surface tension is calculated with the densities you measure there (γ = γ(water) × ρh ÷ ρ(water)h(water)).",
          ),
        );
      }
      return next({ activity: a.activity }, ok(`${ACTIVITIES.find((x) => x.id === a.activity)!.name}: selected.`));
    }

    case "calc": {
      if (!(a.key in CALC_LABEL)) return same();
      if (s.calc[a.key] !== undefined) return same(info("That result is already recorded."));
      const expected = calcExpected(s, a.key);
      if (!Number.isFinite(expected)) return same(refuse("Record the readings this calculation needs first."));
      if (!calcCorrect(a.key, a.value, expected)) {
        const attempts = { ...s.attempts, [a.key]: (s.attempts[a.key] ?? 0) + 1 };
        const act = activityOf(a.key);
        return next(
          { attempts },
          mistake(`calc-${act}`, 3, `${fmt(a.value, CALC_LABEL[a.key].dp)}${CALC_LABEL[a.key].unit ? ` ${CALC_LABEL[a.key].unit}` : ""} does not follow from your readings.`, "Check the formula and the units, then try again — your recorded readings are in the notebook. The worked solution opens after a wrong attempt."),
        );
      }
      return next({ calc: { ...s.calc, [a.key]: round(a.value, 6) } }, ok(`${CALC_LABEL[a.key].label}: ${fmt(a.value, CALC_LABEL[a.key].dp)}${CALC_LABEL[a.key].unit ? ` ${CALC_LABEL[a.key].unit}` : ""} recorded.`));
    }

    case "solution": {
      if (!(a.key in CALC_LABEL)) return same();
      if (s.solutions.includes(a.key)) return same(info("The worked solution is already open."));
      if (!Number.isFinite(calcExpected(s, a.key))) return same(refuse("Record the readings this calculation needs first."));
      if (a.mode === "practical" && (s.attempts[a.key] ?? 0) < 1) return same(refuse("Practical mode: the worked solution opens only after your first attempt at this calculation."));
      const solutions = [...s.solutions, a.key];
      if (a.mode === "practical") {
        return next({ solutions }, mistake(`worked-solution-${a.key}`, 3, `Worked solution opened for: ${CALC_LABEL[a.key].label}.`, "Practical mode: using a worked solution costs 3 technique marks (as a hint does) and is listed in your report."));
      }
      return next({ solutions }, info("Worked solution shown. In Learning mode it is free; your report lists it."));
    }

    // ── Bath and thermometer ─────────────────────────────────────────────
    case "setBath": {
      if (!(METHOD.setpoints as readonly number[]).includes(a.c)) return same();
      if (a.c !== METHOD.tempC) {
        return same(mistake("bath-setpoint", 2, `Bath set to ${a.c} °C.`, `Refused: this method is carried out at ${METHOD.tempC}.0 °C (USP <841> uses 25 °C for specific gravity) — every property changes with temperature, and the reference values are for 25 °C.`));
      }
      if (s.bath.set === a.c) return same(info("The bath is already set to 25.0 °C."));
      return next({ bath: { ...s.bath, set: a.c } }, ok("Bath set to 25.0 °C. It is heating from room temperature (22 °C)."));
    }
    case "thermoIn": {
      const n = need("thermometer");
      if (n) return same(n);
      if (s.bath.thermo) return same(info("The thermometer is already in the bath."));
      return next({ bath: { ...s.bath, thermo: true } }, ok("Thermometer probe in the bath."));
    }
    case "thermoOut":
      if (!s.bath.thermo) return same(refuse("The thermometer is not in the bath."));
      return next({ bath: { ...s.bath, thermo: false } }, ok("Thermometer out of the bath."));
    case "wait": {
      if (!(METHOD.waitOptionsMin as readonly number[]).includes(a.minutes)) return same();
      return { state: advance(s, a.minutes), feedback: [info(`${a.minutes} min pass.`)] };
    }
    case "recordBathTemp": {
      if (!s.bath.thermo) return same(refuse("Put the thermometer in the bath to read its temperature."));
      const shown = round(s.bath.c, 1);
      if (Math.abs(a.value - shown) > METHOD.tempTolC) return same(mistake("transcription", 2, `You wrote ${fmt(a.value, 1)} °C; the thermometer reads ${shown.toFixed(1)} °C.`, "Record exactly what the instrument shows."));
      if (s.bath.set === null || Math.abs(s.bath.c - s.bath.set) > 0.1) return same(info(`${shown.toFixed(1)} °C — the bath is not steady at its set-point yet. Wait, then read again.`));
      return next({ bath: { ...s.bath, checked: round(a.value, 1) } }, ok(`Bath temperature ${a.value.toFixed(1)} °C recorded — steady at the set-point.`));
    }

    // ── A. Pycnometer ────────────────────────────────────────────────────
    case "pycWeigh": {
      const n = inActivity("density") ?? need("pycnometer");
      if (n) return same(n);
      if (s.pyc.onBalance) return same(info("The pycnometer is already on the pan."));
      if (s.pyc.inBath) return same(refuse("The pycnometer is still in the bath."));
      if (s.pyc.content && !s.pyc.stoppered) return same(refuse("Equilibrate it in the bath and insert the capillary stopper before weighing — the stopper sets the volume."));
      const fb: Feedback[] = [];
      if (!s.pyc.content && s.pyc.residue) {
        fb.push(mistake("pyc-wet-empty", 5, `"Empty" pycnometer weighed while wet with ${LIQUID_NAME[s.pyc.residue]}.`, "The empty mass m₁ is too high by the liquid left inside, so every (m − m₁) is too small by the same amount: the specific gravities are pushed away from 1 — ethanol's comes out low, the glycerol mixture's high. Weigh it clean and dry."));
      }
      if (s.pyc.content && s.pyc.wetOutside) {
        fb.push(
          mistake(
            "pyc-not-wiped",
            3,
            "Weighed with bath water still on the outside of the bottle.",
            s.pyc.content === "water"
              ? "The water-filled mass m₂ is too high, so (m₂ − m₁) is too large and both specific gravities come out low. Wipe the bottle dry after stoppering."
              : "This filled mass is too high, so this sample's specific gravity and density come out high. Wipe the bottle dry after stoppering.",
          ),
        );
      }
      return next({ pyc: { ...s.pyc, onBalance: true } }, ...fb, info("Pycnometer on the pan, doors closed. Read the display when it is stable."));
    }
    case "recordMass": {
      if (!s.pyc.onBalance) return same(refuse("Put the pycnometer on the balance first."));
      const shown = balanceReading(s);
      const which = s.pyc.content;
      if (which === null ? s.dens.empty !== null : s.dens.filled[which] !== undefined) return same(info("That mass is already recorded."));
      if (Math.abs(a.value - shown) > METHOD.massTolG) return same(mistake("transcription", 2, `You wrote ${fmt(a.value, 4)} g; the balance reads ${shown.toFixed(4)} g.`, "Record exactly what the instrument shows."));
      const dens = which === null ? { ...s.dens, empty: shown } : { ...s.dens, filled: { ...s.dens.filled, [which]: shown } };
      return next({ dens, pyc: { ...s.pyc, onBalance: false } }, ok(`${which === null ? "Empty, dry pycnometer" : `Pycnometer + ${LIQUID_NAME[which]}`}: ${shown.toFixed(4)} g recorded.`));
    }
    case "pycFill": {
      const n = inActivity("density") ?? need("pycnometer", SAMPLE_ID[a.liquid]);
      if (n) return same(n);
      if (s.pyc.content) return same(refuse(`The pycnometer already holds ${LIQUID_NAME[s.pyc.content]}.`));
      if (s.pyc.onBalance) return same(refuse("Take the pycnometer off the balance first."));
      if (s.dens.empty === null) return same(refuse("Weigh the empty, dry pycnometer first — every mass is taken against it."));
      if (a.liquid !== "water" && s.dens.filled.water === undefined) return same(refuse("Fill with purified water first: it is the reference for specific gravity."));
      if (s.dens.filled[a.liquid] !== undefined) return same(info(`${LIQUID_NAME[a.liquid]} is already weighed.`));
      const fb: Feedback[] = [];
      const carry = s.pyc.residue && s.pyc.residue !== a.liquid ? s.pyc.residue : null;
      if (carry) {
        const up = liquidData(carry, METHOD.tempC).rho > liquidData(a.liquid, METHOD.tempC).rho;
        fb.push(
          mistake(
            "pyc-carryover",
            6,
            `Filled with ${LIQUID_NAME[a.liquid]} while the pycnometer was still wet with ${LIQUID_NAME[carry]}.`,
            `The ${LIQUID_NAME[carry]} left inside mixes with the sample, pulling its density towards that of ${LIQUID_NAME[carry]}: ${a.liquid === "water" ? "the reference mass m₂ is wrong, and every specific gravity with it" : `this sample's density and SG come out ${up ? "high" : "low"}`}. Dry the bottle, or rinse it with two small portions of the next liquid, before filling.`,
          ),
        );
      }
      return next(
        { inUse: a.liquid, pyc: { ...s.pyc, content: a.liquid, carry, residue: null, inBath: false, stoppered: false, tempC: METHOD.roomC, liquidG: 0, wetOutside: false } },
        ...fb,
        ok(`Filled to overflowing with ${LIQUID_NAME[a.liquid]} (at room temperature, 22 °C).`),
      );
    }
    case "pycRinseWith": {
      const n = need("pycnometer", SAMPLE_ID[a.liquid]);
      if (n) return same(n);
      if (s.pyc.content) return same(refuse("Empty the pycnometer first."));
      return next(
        { inUse: a.liquid, pyc: { ...s.pyc, residue: a.liquid }, bench: KIT.produce(s.bench, wasteId("pyc", a.liquid)) },
        ok(`Rinsed with two small portions of ${LIQUID_NAME[a.liquid]} — the film inside is now the next liquid itself. The rinsings go to the waste.`),
      );
    }
    case "pycToBath": {
      const n = inActivity("density");
      if (n) return same(n);
      if (!s.pyc.content) return same(refuse("Fill the pycnometer first."));
      if (s.pyc.stoppered) return same(refuse("It is already stoppered — the volume is set."));
      if (s.pyc.inBath) return same(info("The pycnometer is already in the bath."));
      return next({ pyc: { ...s.pyc, inBath: true, since: s.minute } }, ok("Pycnometer standing in the bath up to its neck."));
    }
    case "pycStopper": {
      const n = inActivity("density");
      if (n) return same(n);
      if (!s.pyc.content) return same(refuse("Fill the pycnometer first."));
      if (s.pyc.stoppered) return same(info("Already stoppered."));
      if (s.bath.checked === null) return same(refuse("Check the bath temperature with the thermometer and record it before the first measurement."));
      const l = s.pyc.content;
      const T = s.pyc.tempC;
      const fb: Feedback[] = [];
      if (!s.pyc.inBath || !equilibrated(s, T)) fb.push(notEquilibrated(s, `Pycnometer stoppered with ${LIQUID_NAME[l]}`, l, T));
      const V = pycBottle(s.seed).volumeMl;
      const rv = METHOD.pycResidueMl;
      const liquidG = s.pyc.carry ? rv * liquidData(s.pyc.carry, T).rho + (V - rv) * liquidData(l, T).rho : V * liquidData(l, T).rho;
      return next(
        { pyc: { ...s.pyc, stoppered: true, inBath: false, liquidG, wetOutside: s.pyc.inBath } },
        ...fb,
        ok(`Capillary stopper inserted: the excess ${LIQUID_NAME[l]} is expelled through the bore, so the bottle holds exactly its volume at ${T.toFixed(1)} °C. Lifted out of the bath${s.pyc.inBath ? " — the outside is wet" : ""}.`),
      );
    }
    case "pycWipe":
      if (!s.pyc.stoppered) return same(refuse("Stopper the pycnometer first."));
      if (!s.pyc.wetOutside) return same(info("The outside is already dry."));
      return next({ pyc: { ...s.pyc, wetOutside: false } }, ok("Outside wiped dry with a lint-free tissue (without warming the bottle in your hand)."));
    case "pycEmpty": {
      if (!s.pyc.content) return same(refuse("The pycnometer is empty."));
      if (s.pyc.onBalance && s.dens.filled[s.pyc.content] === undefined) return same(refuse("Record the mass before you take it off the balance."));
      // Emptying before weighing is allowed: it is how a student starts a filling again.
      const l = s.pyc.content;
      return next(
        { pyc: { ...s.pyc, content: null, residue: l, carry: null, inBath: false, stoppered: false, wetOutside: false, onBalance: false, liquidG: 0 }, bench: KIT.produce(s.bench, wasteId("pyc", l)) },
        ok(`Emptied into a waste beaker — take it to the waste station. A film of ${LIQUID_NAME[l]} stays inside.`),
      );
    }
    case "pycDry": {
      const n = need("pycnometer");
      if (n) return same(n);
      if (s.pyc.content) return same(refuse("Empty the pycnometer first."));
      const d = dryVessel(s.pyc.residue, "pycnometer");
      if (d) return same(d);
      return next({ pyc: { ...s.pyc, residue: null } }, ok("Drained and dried in a current of warm air, then allowed to cool to room temperature."));
    }

    // ── B. Ostwald viscometer + stopwatch ───────────────────────────────
    case "viscClamp": {
      const n = inActivity("viscosity") ?? need("viscometer");
      if (n) return same(n);
      if (s.visc.clamped) return same(info("The viscometer is already clamped in the bath."));
      return next({ visc: { ...s.visc, clamped: true, since: s.minute } }, ok("Viscometer clamped vertically in the bath, timing bulb below the water surface."));
    }
    case "viscCharge": {
      const n = inActivity("viscosity") ?? need("viscometer", "pipette", SAMPLE_ID[a.liquid]);
      if (n) return same(n);
      if (!(METHOD.chargeOptionsMl as readonly number[]).includes(a.ml)) return same();
      if (!s.visc.clamped) return same(refuse("Clamp the viscometer vertically in the bath first, then charge it through the wide arm."));
      if (s.visc.charge) return same(refuse(`The viscometer already holds ${LIQUID_NAME[s.visc.charge]}.`));
      if (a.liquid !== "water" && meanTime(s, "water") === null) return same(refuse("Time purified water first (three concordant times): it is the reference in this viscometer."));
      if (meanTime(s, a.liquid) !== null) return same(info(`${LIQUID_NAME[a.liquid]} already has three concordant times.`));
      const fb: Feedback[] = [];
      const carry = s.visc.residue && s.visc.residue !== a.liquid ? s.visc.residue : null;
      if (carry) {
        const nuC = kinematicViscosity(liquidData(carry, METHOD.tempC).eta, liquidData(carry, METHOD.tempC).rho);
        const nuL = kinematicViscosity(liquidData(a.liquid, METHOD.tempC).eta, liquidData(a.liquid, METHOD.tempC).rho);
        fb.push(
          mistake(
            "viscometer-wet",
            5,
            `Charged with ${LIQUID_NAME[a.liquid]} while the viscometer was wet with ${LIQUID_NAME[carry]}.`,
            `The residue mixes into the charge and pulls its flow time towards that of ${LIQUID_NAME[carry]}: ${a.liquid === "water" ? "the reference time is wrong, and every viscosity with it" : `this sample's viscosity comes out ${nuC > nuL ? "high" : "low"}`}. Clean and dry the viscometer between liquids.`,
          ),
        );
      }
      let chargeRef = s.chargeRef;
      if (a.liquid === "water") chargeRef = a.ml;
      else if (chargeRef !== null && a.ml !== chargeRef) {
        fb.push(
          mistake(
            "visc-volume-mismatch",
            6,
            `Charged ${a.ml} mL of ${LIQUID_NAME[a.liquid]}; water was ${chargeRef} mL.`,
            `The flow time depends on the driving head, which depends on how much liquid is in the viscometer. ${a.ml > chargeRef ? "More liquid lowers the head, the flow is slower and the viscosity comes out high" : "Less liquid raises the head, the flow is faster and the viscosity comes out low"}. Charge exactly the same volume as for water.`,
          ),
        );
      }
      return next(
        { inUse: a.liquid, chargeRef, visc: { ...s.visc, charge: a.liquid, chargeMl: a.ml, carry, residue: null, since: s.minute, tempC: METHOD.roomC, flowing: false, t10: 0, start10: null, stop10: null, display: null } },
        ...fb,
        ok(`${a.ml} mL of ${LIQUID_NAME[a.liquid]} pipetted into the wide arm (at room temperature, 22 °C).`),
      );
    }
    case "viscDraw": {
      const n = inActivity("viscosity") ?? need("viscometer", "pipette");
      if (n) return same(n);
      if (!s.visc.charge) return same(refuse("Charge the viscometer first."));
      if (s.visc.display !== null) return same(refuse("Record the stopwatch time before the next run."));
      if (s.bath.checked === null) return same(refuse("Check the bath temperature with the thermometer and record it before the first measurement."));
      const l = s.visc.charge;
      const T = s.visc.tempC;
      const fb: Feedback[] = [];
      if (!equilibrated(s, T)) fb.push(notEquilibrated(s, `Flow timed with ${LIQUID_NAME[l]}`, l, T));
      const d = liquidData(l, T);
      let nu = kinematicViscosity(d.eta, d.rho);
      if (s.visc.carry) {
        const c = liquidData(s.visc.carry, T);
        nu = mixedKinematic(nu, kinematicViscosity(c.eta, c.rho), METHOD.viscResidueMl / s.visc.chargeMl);
      }
      const head = s.chargeRef !== null && l !== "water" ? 1 + METHOD.chargeEffectPerMl * (s.visc.chargeMl - s.chargeRef) : 1;
      const T_run = flowTime(nu, METHOD.viscC) * head;
      const tu = METHOD.leadS + rand(s.seed, 51, LIQUIDS.indexOf(l), s.visc.trial);
      return next(
        { visc: { ...s.visc, flowing: true, t10: 0, tu, tl: tu + T_run, start10: null, stop10: null, display: null } },
        ...fb,
        ok("Liquid drawn up above the upper mark with the filler, then released. Watch the meniscus."),
      );
    }
    case "flow": {
      if (!s.visc.flowing) return same(refuse("Draw the liquid up and release it first."));
      if (!(METHOD.flowStepsS as readonly number[]).includes(a.seconds)) return same();
      return next({ visc: { ...s.visc, t10: s.visc.t10 + Math.round(a.seconds * 10) } });
    }
    case "startWatch": {
      const n = need("stopwatch");
      if (n) return same(n);
      if (!s.visc.flowing) return same(refuse("Release the liquid first, then start the watch as the meniscus passes the upper mark."));
      if (s.visc.start10 !== null) return same(info("The stopwatch is already running."));
      const t = s.visc.t10 / 10;
      const fb: Feedback[] = [];
      if (Math.abs(t - s.visc.tu) > METHOD.markTolS) {
        fb.push(
          mistake(
            "timing-off-mark",
            3,
            `Stopwatch started ${t < s.visc.tu ? "before" : "after"} the meniscus reached the upper mark.`,
            t < s.visc.tu ? "Starting early adds time: this run's flow time — and the viscosity from it — comes out high." : "Starting late loses time: this run's flow time — and the viscosity from it — comes out low. Discard runs that do not agree.",
          ),
        );
      }
      return next({ visc: { ...s.visc, start10: s.visc.t10 } }, ...fb, ok("Stopwatch running."));
    }
    case "stopWatch": {
      const n = need("stopwatch");
      if (n) return same(n);
      if (s.visc.start10 === null || s.visc.stop10 !== null) return same(refuse("The stopwatch is not running."));
      const t = s.visc.t10 / 10;
      const v = s.visc;
      const fb: Feedback[] = [];
      if (Math.abs(t - v.tl) > METHOD.markTolS) {
        fb.push(
          mistake(
            "timing-off-mark",
            3,
            `Stopwatch stopped ${t < v.tl ? "before" : "after"} the meniscus reached the lower mark.`,
            t < v.tl ? "Stopping early loses time: this run's flow time — and the viscosity from it — comes out low." : "Stopping late adds time: this run's flow time — and the viscosity from it — comes out high. Discard runs that do not agree.",
          ),
        );
      }
      const reaction = (rand(s.seed, 61, LIQUIDS.indexOf(v.charge!), v.trial) - 0.5) * 2 * METHOD.reactionS;
      const display = round(Math.max(0, (v.t10 - v.start10!) / 10 + reaction), 2);
      return next({ visc: { ...v, stop10: v.t10, display, flowing: false } }, ...fb, ok("Stopwatch stopped. Read the time and record it."));
    }
    case "recordTime": {
      const v = s.visc;
      if (v.display === null || !v.charge) return same(refuse("Time a run first."));
      if (Math.abs(a.value - v.display) > METHOD.timeTolS) return same(mistake("transcription", 2, `You wrote ${fmt(a.value, 2)} s; the stopwatch reads ${v.display.toFixed(2)} s.`, "Record exactly what the instrument shows."));
      const times = { ...s.times, [v.charge]: [...s.times[v.charge], v.display] };
      const c = concordant(times[v.charge], 3, METHOD.concordanceS);
      const fb = [ok(`${v.display.toFixed(2)} s recorded for ${LIQUID_NAME[v.charge]} (run ${times[v.charge].length}).`)];
      if (times[v.charge].length >= 3) fb.push(c ? ok(`Three concordant times — mean ${c.mean.toFixed(2)} s.`) : warn(`Your last three times differ by more than ${METHOD.concordanceS} s. Time another run.`));
      return next({ times, visc: { ...v, display: null, start10: null, stop10: null, t10: 0, trial: v.trial + 1 } }, ...fb);
    }
    case "viscEmpty": {
      if (!s.visc.charge) return same(refuse("The viscometer is empty."));
      if (s.visc.display !== null) return same(refuse("Record the stopwatch time first."));
      const l = s.visc.charge;
      return next(
        { visc: { ...s.visc, charge: null, chargeMl: 0, carry: null, residue: l, clamped: false, flowing: false, t10: 0, start10: null, stop10: null, display: null }, bench: KIT.produce(s.bench, wasteId("visc", l)) },
        ok(`Unclamped and drained into a waste beaker — take it to the waste station. ${LIQUID_NAME[l][0].toUpperCase()}${LIQUID_NAME[l].slice(1)} still wets the capillary.`),
      );
    }
    case "viscDry": {
      const n = need("viscometer");
      if (n) return same(n);
      if (s.visc.charge) return same(refuse("Empty the viscometer first."));
      if (s.visc.clamped) return same(refuse("Unclamp it from the bath first."));
      const d = dryVessel(s.visc.residue, "viscometer");
      if (d) return same(d);
      return next({ visc: { ...s.visc, residue: null } }, ok("Air drawn through with the filler and warm-air dried; cooled to room temperature."));
    }

    // ── C. Capillary rise ────────────────────────────────────────────────
    case "beakerFill": {
      const n = inActivity("surface") ?? need("beaker", SAMPLE_ID[a.liquid]);
      if (n) return same(n);
      if (s.beaker.liquid) return same(refuse(`The beaker already holds ${LIQUID_NAME[s.beaker.liquid]}.`));
      if (a.liquid !== "water" && s.rise.water === undefined) return same(refuse("Measure purified water first: it is the reference for the relative method."));
      if (s.rise[a.liquid] !== undefined) return same(info(`${LIQUID_NAME[a.liquid]} is already measured.`));
      return next({ inUse: a.liquid, beaker: { liquid: a.liquid, inBath: false, since: s.minute, tempC: METHOD.roomC } }, ok(`About ${METHOD.beakerMl} mL of ${LIQUID_NAME[a.liquid]} poured into the beaker.`));
    }
    case "beakerToBath": {
      const n = inActivity("surface");
      if (n) return same(n);
      if (!s.beaker.liquid) return same(refuse("Fill the beaker first."));
      if (s.beaker.inBath) return same(info("The beaker is already in the bath."));
      return next({ beaker: { ...s.beaker, inBath: true, since: s.minute } }, ok("Beaker standing in the bath on its support."));
    }
    case "beakerEmpty": {
      if (!s.beaker.liquid) return same(refuse("The beaker is empty."));
      if (s.cap.dipped) return same(refuse("Lift the capillary out first."));
      const l = s.beaker.liquid;
      return next({ beaker: { liquid: null, inBath: false, since: s.minute, tempC: METHOD.roomC }, bench: KIT.produce(s.bench, wasteId("beaker", l)) }, ok("Beaker lifted out and emptied into a waste beaker — take it to the waste station."));
    }
    case "capAlign": {
      const n = need("capillary");
      if (n) return same(n);
      if (s.cap.vertical) return same(info("The holder is already vertical."));
      return next({ cap: { ...s.cap, vertical: true } }, ok("Holder adjusted until the capillary hangs parallel to the plumb line: vertical."));
    }
    case "capDip": {
      const n = inActivity("surface") ?? need("capillary", "beaker");
      if (n) return same(n);
      if (s.cap.discarded) return same(refuse("The capillary has been discarded."));
      if (s.cap.dipped) return same(info("The capillary is already in the liquid."));
      if (!s.beaker.liquid || !s.beaker.inBath) return same(refuse("Stand the beaker of liquid in the bath first."));
      if (s.bath.checked === null) return same(refuse("Check the bath temperature with the thermometer and record it before the first measurement."));
      const l = s.beaker.liquid;
      const T = s.beaker.tempC;
      const fb: Feedback[] = [];
      if (!equilibrated(s, T)) fb.push(notEquilibrated(s, `Capillary rise read in ${LIQUID_NAME[l]}`, l, T));
      const clean = s.bench.rinsed.includes("capillary");
      const theta = clean ? 0 : METHOD.dirtyThetaDeg;
      if (!clean) {
        fb.push(mistake("capillary-dirty", 6, "Capillary used without cleaning it first.", `Grease and dust in the bore stop the liquid wetting the glass: the contact angle is no longer ≈ 0°, so the rise falls by the factor cos θ and the surface tension calculated from it comes out low (water's absolute value about ${Math.round((1 - Math.cos((METHOD.dirtyThetaDeg * Math.PI) / 180)) * 100)} % low here). The relative results are right only if every liquid meets the dirty glass at the same angle, which nothing guarantees. Clean the capillary (detergent, water, purified water) before use.`));
      }
      if (!s.cap.vertical) {
        fb.push(mistake("capillary-tilted", 4, `Capillary read while ${METHOD.tiltDeg}° off vertical.`, "The liquid still rises to the same vertical height, but along a slanted tube the scale reads a longer column: the rise — and water's absolute surface tension — come out high (relative results cancel only if every reading is slanted alike). Set the holder vertical against the plumb line."));
      }
      const d = liquidData(l, T);
      const h = capillaryRiseHeight(d.gamma, d.rho, METHOD.capRadiusMm, theta);
      const read = s.cap.vertical ? h : readingAlongTilt(h, METHOD.tiltDeg);
      return next(
        { cap: { ...s.cap, dipped: l, thetaDeg: theta, riseMm: h, readMm: read } },
        ...fb,
        ok("Capillary wetted by drawing the liquid up and down, then dipped to the zero of the scale. Read the bottom of the meniscus."),
      );
    }
    case "recordRise": {
      if (!s.cap.dipped) return same(refuse("Dip the capillary into the liquid first."));
      const l = s.cap.dipped;
      if (s.rise[l] !== undefined) return same(info("That rise is already recorded."));
      if (!Number.isFinite(a.value) || Math.abs(a.value - s.cap.readMm) > METHOD.riseTolMm) {
        return same(mistake("misread-rise", 3, `${fmt(a.value, 1)} mm does not match the meniscus on the scale.`, "Read the bottom of the meniscus against the millimetre scale, with your eye level with it, from the zero at the liquid surface."));
      }
      return next({ rise: { ...s.rise, [l]: round(a.value, 2) } }, ok(`Rise of ${LIQUID_NAME[l]}: ${a.value.toFixed(1)} mm recorded.`));
    }
    case "capLift":
      if (!s.cap.dipped) return same(refuse("The capillary is not in the liquid."));
      return next({ cap: { ...s.cap, dipped: null } }, ok("Capillary lifted out and drained."));
    case "capDiscard": {
      const n = need("capillary");
      if (n) return same(n);
      if (s.cap.discarded) return same(info("Already discarded."));
      if (s.cap.dipped) return same(refuse("Lift the capillary out first."));
      if (LIQUIDS.some((l) => s.rise[l] === undefined)) return same(refuse("Measure all three liquids before discarding the capillary — the relative method needs the same capillary for each."));
      return next({ cap: { ...s.cap, discarded: true }, bench: KIT.produce(s.bench, "capillary-used") }, ok("Capillary removed from its holder. Take it to the broken glass & sharps container."));
    }
  }
}

// ── Steps, controllers, suggestion ──────────────────────────────────────────

const has = (s: LiquidPropertiesState, k: CalcKey) => s.calc[k] !== undefined;
const STEP_DONE: Record<string, (s: LiquidPropertiesState) => boolean> = {
  setup: (s) => s.bath.checked !== null,
  "density-empty": (s) => s.dens.empty !== null,
  "density-water": (s) => s.dens.filled.water !== undefined,
  "density-samples": (s) => SAMPLES.every((l) => s.dens.filled[l] !== undefined),
  "density-calc": densityDone,
  "viscosity-water": (s) => meanTime(s, "water") !== null,
  "viscosity-samples": (s) => SAMPLES.every((l) => meanTime(s, l) !== null),
  "viscosity-calc": viscosityDone,
  "surface-water": (s) => s.rise.water !== undefined,
  "surface-samples": (s) => SAMPLES.every((l) => s.rise[l] !== undefined),
  "surface-calc": (s) => CALC_KEYS.surface.every((k) => has(s, k)),
  cleanup: (s) => surfaceDone(s) && KIT.allDisposed(s.bench) && s.bench.out.length === 0 && !s.bench.tap && s.bench.open === null,
};

const CONTROLLERS: ControllerDef[] = [
  {
    id: "notebook",
    name: "Lab notebook",
    equipment: ["notebook"],
    actions: ["selectActivity", "calc", "solution"],
    brief: "Choose the activity, keep the data tables, and calculate each result from your own readings.",
    howTo: ["Activities run A → B → C: B and C use the densities you measure in A.", "Each calculation has hints, and a worked solution."],
    nearby: ["bath", "balance"],
  },
  {
    id: "bath",
    name: "Thermostatic water bath",
    equipment: ["water-bath", "thermometer"],
    actions: ["setBath", "thermoIn", "thermoOut", "wait", "recordBathTemp"],
    brief: "Holds every liquid at 25.0 °C. Set it, check it with the thermometer, and give each item time to reach it.",
    howTo: ["Set 25 °C; put the thermometer probe in.", "Record the temperature once it is steady.", "Leave each item in the bath about 10 minutes before measuring."],
    nearby: ["pycnometer", "viscometer", "capillary"],
  },
  {
    id: "balance",
    name: "Analytical balance",
    equipment: ["balance"],
    actions: ["pycWeigh", "recordMass"],
    brief: "Weighs the pycnometer — empty and dry, then filled with each liquid — to 0.1 mg.",
    howTo: ["Bottle on the pan, doors closed.", "Record the stable reading."],
    nearby: ["pycnometer", "notebook"],
  },
  {
    id: "pycnometer",
    name: "Pycnometer",
    equipment: ["pycnometer"],
    actions: ["pycFill", "pycRinseWith", "pycToBath", "pycStopper", "pycWipe", "pycEmpty", "pycDry", "wait"],
    brief: "A 25 mL specific-gravity bottle whose capillary stopper sets its volume exactly.",
    howTo: ["Fill to overflowing, stand it in the bath, wait.", "Insert the stopper, wipe the outside, weigh.", "Between liquids: dry it, or rinse with the next liquid."],
    nearby: ["balance", "bath"],
  },
  {
    id: "viscometer",
    name: "Ostwald viscometer",
    equipment: ["viscometer", "pipette"],
    actions: ["viscClamp", "viscCharge", "viscDraw", "viscEmpty", "viscDry", "wait"],
    brief: "A U-tube viscometer: the time a fixed volume takes to flow between two marks is proportional to its kinematic viscosity.",
    howTo: ["Clamp it vertically in the bath; charge the SAME volume every time.", "Equilibrate, then draw the liquid above the upper mark and release.", "Clean and dry it between liquids."],
    nearby: ["stopwatch", "bath"],
  },
  {
    id: "stopwatch",
    name: "Stopwatch",
    equipment: ["stopwatch"],
    actions: ["flow", "startWatch", "stopWatch", "recordTime", "viscDraw"],
    brief: "Time the meniscus from the upper mark to the lower mark. Three concordant times per liquid.",
    howTo: ["Watch the magnified mark; start as the meniscus passes it.", "Stop as it passes the lower mark, then record the time."],
    nearby: ["viscometer"],
  },
  {
    id: "capillary",
    name: "Capillary rise apparatus",
    equipment: ["capillary", "beaker"],
    actions: ["beakerFill", "beakerToBath", "beakerEmpty", "capAlign", "capDip", "recordRise", "capLift", "capDiscard", "wait"],
    brief: "A clean, vertical glass capillary dipped into the liquid: the height it rises gives the surface tension.",
    howTo: ["Clean it first; set the holder vertical.", "Beaker of liquid in the bath; dip to the zero; read the meniscus in mm."],
    nearby: ["bath"],
  },
  ...KIT.controllers,
];

const EQUIPMENT: EquipmentDef[] = [
  { id: "notebook", name: "Lab notebook", description: "Your notebook: the activity selector, the data tables and the calculations.", use: "Select activities A → B → C and calculate each result from your own readings." },
  { id: "water-bath", name: "Thermostatic water bath", description: "A stirred water bath with a heater and controller.", use: "Holds the pycnometer, the viscometer and the capillary beaker at 25.0 °C.", spec: "Stability ±0.1 °C; heating only (set it above room temperature)" },
  { id: "thermometer", name: "Digital thermometer", description: "A probe thermometer reading to 0.1 °C.", use: "Confirms the bath has reached and holds 25.0 °C." },
  { id: "balance", name: "Analytical balance", description: "An electronic balance with draught-shield doors.", use: "Weighs the pycnometer empty and filled.", spec: "Readability 0.1 mg, capacity 220 g" },
  { id: "pycnometer", name: "Pycnometer (specific-gravity bottle), 25 mL", description: "A glass bottle with a ground-in stopper pierced by a fine capillary; filled to overflowing, the stopper expels the excess so the volume is exact.", use: "Weighed empty and dry, then filled with water and with each sample, all at 25 °C." },
  { id: "viscometer", name: "Ostwald viscometer", description: "A glass U-tube with a capillary between a timing bulb (two etched marks) and a lower reservoir bulb.", use: "The same volume of water and of each sample is timed between the marks at 25 °C." },
  { id: "pipette", name: "10 mL graduated pipette and filler", description: "Delivers the viscometer charge; the filler draws the liquid up into the timing bulb.", use: "Charge the same volume of each liquid; draw the liquid above the upper mark." },
  { id: "stopwatch", name: "Stopwatch", description: "A hand-held digital stopwatch reading to 0.01 s.", use: "Times the flow between the marks." },
  { id: "capillary", name: "Capillary tube on a scaled holder", description: "A uniform-bore glass capillary clamped beside a millimetre scale, with a plumb line to set it vertical.", use: "Dipped into each liquid; the rise is read in mm.", spec: `Bore radius about ${METHOD.capRadiusMm} mm (the relative method does not need it)` },
  { id: "beaker", name: "Beaker, 50 mL", description: "A small beaker that stands in the bath.", use: "Holds the liquid the capillary dips into." },
  { id: "sample-water", name: "Purified water", description: "The reference liquid in every activity.", use: "Its properties at 25 °C are tabulated (CRC, IAPWS)." },
  { id: "sample-ethanol", name: "Ethanol (absolute)", description: "Anhydrous ethanol, ≥ 99.5 %.", use: "A less dense, slightly more viscous liquid with a much lower surface tension than water.", safety: "Highly flammable: no flames or hot surfaces nearby; keep the bottle closed." },
  { id: "sample-glycerol", name: "Glycerol–water 50 % w/w", description: "Equal masses of glycerol and purified water.", use: "A denser, about five times more viscous liquid, with a surface tension a little below water's." },
  ...KIT.equipment,
];

/** Which cabinet holds an item, and the pointer to get it out. */
function fetch(s: LiquidPropertiesState, item: string): Suggestion | null {
  if (s.bench.out.includes(item)) return null;
  const cab = PLAN.stored[item] as CabinetId | undefined;
  if (!cab) return null;
  return s.bench.open === cab ? { controller: cab, action: "retrieve" } : { controller: cab, action: "cabinet" };
}

/** The next correct move for a wet vessel: rinse glycerol out at the sink, then dry. */
function cleanVessel(s: LiquidPropertiesState, residue: Liquid | null, dryCtrl: string, dryAction: string): Suggestion | null {
  if (residue === null) return null;
  if (residue === "glycerol") return s.bench.tap ? { controller: "sink", action: "rinse" } : { controller: "sink", action: "tap" };
  return { controller: dryCtrl, action: dryAction };
}

/**
 * Learning mode's pointer: an instrument and a control, never a value. It points at reading
 * fields only once the reading is there to be taken (as the other labs do); it NEVER points at
 * starting or stopping the stopwatch, and it goes quiet within 2 s of a timing mark, so judging
 * the crossing stays the student's skill. Choices (set-point, charge volume, waste stream) are
 * pointed at as a group of controls, never as an option.
 */
function suggest(s: LiquidPropertiesState): Suggestion | null {
  const to = (controller: string, action: string): Suggestion => ({ controller, action });
  const first = (...xs: (Suggestion | null)[]) => xs.find((x) => x !== null) ?? null;

  // Setup: bath to 25 °C, thermometer in, steady, recorded.
  if (s.bath.checked === null) {
    if (s.bath.set !== METHOD.tempC) return to("bath", "setBath");
    const f = fetch(s, "thermometer");
    if (f) return f;
    if (!s.bath.thermo) return to("bath", "thermoIn");
    if (Math.abs(s.bath.c - METHOD.tempC) > 0.1) return to("bath", "wait");
    return to("bath", "recordBathTemp");
  }

  // A. Density
  if (!densityDone(s)) {
    if (s.activity !== "density") return to("notebook", "selectActivity");
    const f = fetch(s, "pycnometer");
    if (f) return f;
    if (s.dens.empty === null) {
      if (s.pyc.onBalance) return to("balance", "recordMass");
      return first(cleanVessel(s, s.pyc.residue, "pycnometer", "pycDry"), to("balance", "pycWeigh"));
    }
    const l = LIQUIDS.find((x) => s.dens.filled[x] === undefined);
    if (l) {
      if (s.pyc.content && s.pyc.content !== l) return to("pycnometer", "pycEmpty");
      if (!s.pyc.content) {
        const g = fetch(s, SAMPLE_ID[l]);
        if (g) return g;
        if (s.pyc.residue && s.pyc.residue !== l) return cleanVessel(s, s.pyc.residue, "pycnometer", "pycDry");
        return to("pycnometer", "pycFill");
      }
      if (!s.pyc.stoppered) {
        if (!s.pyc.inBath) return to("pycnometer", "pycToBath");
        if (!equilibrated(s, s.pyc.tempC)) return to("pycnometer", "wait");
        return to("pycnometer", "pycStopper");
      }
      if (s.pyc.wetOutside) return to("pycnometer", "pycWipe");
      return s.pyc.onBalance ? to("balance", "recordMass") : to("balance", "pycWeigh");
    }
    return to("notebook", "calc");
  }

  // B. Viscosity
  if (!viscosityDone(s)) {
    if (s.activity !== "viscosity") return to("notebook", "selectActivity");
    for (const item of ["viscometer", "pipette", "stopwatch"]) {
      const f = fetch(s, item);
      if (f) return f;
    }
    const l = LIQUIDS.find((x) => meanTime(s, x) === null);
    if (l) {
      const v = s.visc;
      if (v.charge && v.charge !== l) return v.display !== null ? to("stopwatch", "recordTime") : to("viscometer", "viscEmpty");
      if (!v.charge) {
        const clean = !v.clamped && v.residue && v.residue !== l ? cleanVessel(s, v.residue, "viscometer", "viscDry") : null;
        if (clean) return clean;
        if (!v.clamped) return to("viscometer", "viscClamp");
        const g = fetch(s, SAMPLE_ID[l]);
        if (g) return g;
        return to("viscometer", "viscCharge");
      }
      if (v.display !== null) return to("stopwatch", "recordTime");
      if (!v.flowing) return equilibrated(s, v.tempC) ? to("viscometer", "viscDraw") : to("viscometer", "wait");
      const t = v.t10 / 10;
      if (v.start10 === null) {
        if (t < v.tu - 2) return to("stopwatch", "flow");
        // the upper mark is close or passed: whether to start is the student's judgement
        return t > v.tu + 2 ? to("stopwatch", "viscDraw") : null;
      }
      return t < v.tl - 2 ? to("stopwatch", "flow") : null;
    }
    return to("notebook", "calc");
  }

  // C. Surface tension
  if (!CALC_KEYS.surface.every((k) => has(s, k)) || !s.cap.discarded) {
    if (s.activity !== "surface") return to("notebook", "selectActivity");
    for (const item of ["capillary", "beaker"]) {
      const f = fetch(s, item);
      if (f) return f;
    }
    const l = LIQUIDS.find((x) => s.rise[x] === undefined);
    if (l) {
      if (!s.cap.dipped && !s.bench.rinsed.includes("capillary")) return s.bench.tap ? to("sink", "rinse") : to("sink", "tap");
      if (!s.cap.vertical) return to("capillary", "capAlign");
      if (s.cap.dipped && s.cap.dipped !== l) return to("capillary", "capLift");
      if (s.beaker.liquid && s.beaker.liquid !== l) return to("capillary", "beakerEmpty");
      if (!s.beaker.liquid) {
        const g = fetch(s, SAMPLE_ID[l]);
        if (g) return g;
        return to("capillary", "beakerFill");
      }
      if (!s.beaker.inBath) return to("capillary", "beakerToBath");
      if (!s.cap.dipped) return equilibrated(s, s.beaker.tempC) ? to("capillary", "capDip") : to("capillary", "wait");
      return to("capillary", "recordRise");
    }
    if (s.cap.dipped) return to("capillary", "capLift");
    if (!s.cap.discarded) return to("capillary", "capDiscard");
    return to("notebook", "calc");
  }

  // Clean-up
  if (s.pyc.content) return to("pycnometer", "pycEmpty");
  if (s.visc.charge) return to("viscometer", "viscEmpty");
  if (s.beaker.liquid) return to("capillary", "beakerEmpty");
  if (s.bench.pending.length) {
    // sink-safe waste goes down only with the tap running
    const sinkWaste = s.bench.pending.some((w) => KIT.wasteById.get(w)?.stream === "sink");
    if (sinkWaste && !s.bench.tap) return to("sink", "tap");
    return to("waste-station", "dispose");
  }
  if (s.bath.thermo) return to("bath", "thermoOut");
  if (s.bench.out.includes("pycnometer") && s.pyc.residue === "glycerol") return s.bench.tap ? to("sink", "rinse") : to("sink", "tap");
  if (s.bench.out.includes("viscometer") && s.visc.residue === "glycerol") return s.bench.tap ? to("sink", "rinse") : to("sink", "tap");
  if (s.bench.tap) return to("sink", "tap");
  const back = s.bench.out[0];
  if (back) {
    const cab = PLAN.stored[back] as CabinetId;
    return s.bench.open === cab ? to(cab, "return") : to(cab, "cabinet");
  }
  if (s.bench.open) return to(s.bench.open, "cabinet");
  return null;
}

const CALC_HINTS = {
  density: [
    "Variables: m₁ = empty dry bottle, m₂ = bottle + water, m₃ = bottle + sample (all g, all at 25 °C); ρ(water, 25 °C) = 0.99705 g/mL.",
    "Formula: SG(25/25 °C) = (m₃ − m₁) ÷ (m₂ − m₁), dimensionless; density ρ = SG × ρ(water, 25 °C), in g/mL.",
    "Substitution: put your three masses in grams into (m₃ − m₁) ÷ (m₂ − m₁) — the grams cancel; then multiply by 0.99705 g/mL. Report SG to 4 decimal places.",
  ],
  viscosity: [
    "Variables: mean flow times t (s) of water and the sample; the sample's density ρ from activity A (g/mL); ρ(water) = 0.99705 g/mL; η(water, 25 °C) = 0.8900 mPa·s.",
    "Formula: η = η(water) × (ρ · t) ÷ (ρ(water) · t(water)) — valid for the same viscometer, the same charge volume and the same temperature.",
    "Substitution: η = 0.8900 mPa·s × (ρ g/mL × t s) ÷ (0.99705 g/mL × t(water) s); g/mL and s cancel and the answer is in mPa·s.",
  ],
  surface: [
    "Variables: rises h (mm) of water and each sample in the same capillary; the bore radius r = 0.25 mm (for water's absolute check); the sample's density ρ from activity A (g/mL); ρ(water) = 0.99705 g/mL; γ(water, 25 °C) = 71.97 mN/m.",
    "Formula: γ = ρ g h r ÷ (2 cos θ) — for water use it directly with θ = 0 (SI units); for the samples, the same r and θ cancel: γ = γ(water) × (ρ · h) ÷ (ρ(water) · h(water)).",
    "Substitution: water — γ = 997.05 kg/m³ × 9.80665 m/s² × h(m) × 0.00025 m ÷ 2, × 1000 for mN/m; samples — γ = 71.97 mN/m × (ρ g/mL × h mm) ÷ (0.99705 g/mL × h(water) mm).",
  ],
};

const STEPS: StepDef[] = [
  { id: "setup", title: "Set and check the bath", objective: "Set the water bath to 25 °C, put the thermometer in, and record the temperature once it is steady.", hints: ["The method temperature is 25 °C — the bath only heats, and the room is 22 °C.", "Get the thermometer from the apparatus cabinet; wait until the reading stops changing."], focus: ["water-bath", "thermometer", "cabinet-instruments"] },
  { id: "density-empty", title: "A · Weigh the empty pycnometer", objective: "Take the pycnometer from the glassware cupboard and weigh it clean, dry and stoppered.", hints: ["Every mass in activity A is taken against this one.", "Do not rinse it before weighing — it must be dry."], focus: ["cabinet-glass", "pycnometer", "balance"] },
  { id: "density-water", title: "A · Pycnometer with water", objective: "Fill with purified water, equilibrate in the bath, stopper, wipe the outside, weigh and record.", hints: ["Fill to overflowing; the stopper sets the volume.", "Leave it about 10 minutes in the bath before stoppering.", "Bath water on the outside adds mass — wipe it off."], focus: ["pycnometer", "water-bath", "balance", "sample-water"], safety: "Handle the bottle by the neck: a warm hand expands the liquid out through the stopper." },
  { id: "density-samples", title: "A · Pycnometer with each sample", objective: "Empty the bottle, dry it or rinse it with the next liquid, then repeat for ethanol and the glycerol mixture.", hints: ["A wet bottle carries the last liquid into the next one.", "Glycerol does not evaporate: rinse it out with water, then dry."], focus: ["pycnometer", "water-bath", "balance", "sample-ethanol", "sample-glycerol"], safety: "Ethanol is highly flammable: no flames or hot plates nearby; pour it away only into organic waste." },
  { id: "density-calc", title: "A · Specific gravity and density", objective: "Calculate the specific gravity (25/25 °C) and the density at 25 °C of ethanol and of the glycerol mixture.", hints: CALC_HINTS.density, focus: ["notebook"] },
  { id: "viscosity-water", title: "B · Time water in the viscometer", objective: "Select activity B, clamp the viscometer in the bath, charge it, equilibrate, and record three concordant flow times for water.", hints: ["Clamp it vertical, then charge it with the pipette — remember the volume.", "Start the watch as the meniscus passes the upper mark, stop at the lower mark.", `Concordant: three times within ${METHOD.concordanceS} s.`], focus: ["notebook", "viscometer", "pipette", "stopwatch", "water-bath"] },
  { id: "viscosity-samples", title: "B · Time each sample", objective: "Clean and dry the viscometer, charge the same volume of each sample, equilibrate, and record three concordant times for each.", hints: ["Same volume as for water, or the head changes.", "Glycerol is slow — about five times water's time."], focus: ["viscometer", "pipette", "stopwatch", "sample-ethanol", "sample-glycerol"] },
  { id: "viscosity-calc", title: "B · Viscosity", objective: "Calculate the viscosity of ethanol and of the glycerol mixture at 25 °C.", hints: CALC_HINTS.viscosity, focus: ["notebook"] },
  { id: "surface-water", title: "C · Capillary rise of water", objective: "Select activity C, clean the capillary, set it vertical, dip it into water in the bath and read the rise.", hints: ["Clean it at the sink before the first use.", "Use the plumb line to make it vertical.", "Read the bottom of the meniscus against the mm scale."], focus: ["notebook", "capillary", "beaker", "sink", "sample-water"] },
  { id: "surface-samples", title: "C · Capillary rise of each sample", objective: "Empty and refill the beaker with each sample, equilibrate, dip and read the rise; then discard the capillary.", hints: ["Ethanol rises much less than water — its surface tension is less than a third of water's.", "The capillary is single-use glass: it goes to the sharps container."], focus: ["capillary", "beaker", "sample-ethanol", "sample-glycerol"], safety: "Glass capillaries break into sharp splinters: handle gently, dispose of as sharps." },
  { id: "surface-calc", title: "C · Surface tension", objective: "Calculate water's surface tension from the stated bore radius (the capillary check), then ethanol's and the glycerol mixture's relative to water.", hints: CALC_HINTS.surface, focus: ["notebook"] },
  { id: "cleanup", title: "Clean up", objective: "Empty every vessel into the right waste, return the apparatus, turn off the tap and close the cabinets.", hints: ["Ethanol → non-halogenated organic waste; glycerol mixture → aqueous waste; water → sink; capillary → sharps.", "Rinse glycerol out of the glassware before putting it away."], focus: ["waste-station", "sink", "cabinet-glass", "cabinet-instruments", "cabinet-reagents"] },
];

function observations(s: LiquidPropertiesState): ObservationSection[] {
  const g = (x: number | undefined | null, dp: number, unit: string) => (x === undefined || x === null ? "—" : `${x.toFixed(dp)} ${unit}`);
  return [
    {
      title: "Conditions",
      rows: [
        { label: "Bath temperature (thermometer)", value: s.bath.checked !== null ? `${s.bath.checked.toFixed(1)} °C` : "—", source: "recorded" },
        { label: "Samples", value: `${LIQUIDS.map((l) => LIQUID_NAME[l]).join(", ")}`, source: "recorded" },
        { label: "Readings", value: "Simulated readings from published property data (teaching model)", source: "observed" },
      ],
    },
    {
      title: "A · Pycnometer masses",
      rows: [
        { label: "m₁ empty, dry", value: g(s.dens.empty, 4, "g"), source: "recorded" },
        ...LIQUIDS.map((l) => ({ label: `Filled with ${LIQUID_NAME[l]}`, value: g(s.dens.filled[l], 4, "g"), source: "recorded" as const })),
      ],
    },
    {
      title: "B · Flow times (Ostwald)",
      rows: [
        { label: "Charge volume", value: s.chargeRef !== null ? `${s.chargeRef} mL` : "—", source: "recorded" },
        ...LIQUIDS.map((l) => ({ label: LIQUID_NAME[l], value: s.times[l].length ? `${s.times[l].map((t) => t.toFixed(2)).join(", ")} s${meanTime(s, l) !== null ? ` — mean ${meanTime(s, l)!.toFixed(2)} s` : ""}` : "—", source: "recorded" as const })),
      ],
    },
    {
      title: "C · Capillary rise",
      rows: LIQUIDS.map((l) => ({ label: LIQUID_NAME[l], value: g(s.rise[l], 1, "mm"), source: "recorded" as const })),
    },
  ];
}

function report(s: LiquidPropertiesState): ExperimentReport {
  const rows = resultsTable(s);
  const calcs = (Object.keys(CALC_LABEL) as CalcKey[]).map((k) => {
    const ws = workedSolution(s, k);
    return { label: CALC_LABEL[k].label, expression: ws ? ws.lines[ws.lines.length - 1].replace(/^(Substitution|Density): /, "") : "—", result: s.calc[k] !== undefined ? `${s.calc[k]!.toFixed(CALC_LABEL[k].dp)}${CALC_LABEL[k].unit ? ` ${CALC_LABEL[k].unit}` : ""}` : "—" };
  });
  const outcome: ExperimentReport["outcome"] = [];
  const item0 = (label: string, r: (typeof rows)[number]) =>
    outcome.push({ label: `${label} — ${r.name}`, value: r.gamma.value === null ? "—" : `${r.gamma.value.toFixed(2)} mN/m vs ${r.gamma.ref.toFixed(2)} mN/m (${r.gamma.diff! >= 0 ? "+" : ""}${r.gamma.diff!.toFixed(1)} %)`, verdict: r.gamma.pass === null ? "info" : r.gamma.pass ? "pass" : "fail" });
  item0("Surface tension 25 °C (absolute check)", rows[0]);
  for (const r of rows.filter((x) => x.liquid !== "water")) {
    const item = (label: string, v: { value: number | null; ref: number; diff: number | null; pass: boolean | null }, dp: number, unit: string) =>
      outcome.push({
        label: `${label} — ${r.name}`,
        value: v.value === null ? "—" : `${v.value.toFixed(dp)}${unit} vs ${v.ref.toFixed(dp)}${unit} (${v.diff! >= 0 ? "+" : ""}${v.diff!.toFixed(1)} %)`,
        verdict: v.pass === null ? "info" : v.pass ? "pass" : "fail",
      });
    item("Specific gravity 25/25 °C", r.sg, 4, "");
    item("Density 25 °C", r.rho, 4, " g/mL");
    item("Viscosity 25 °C", r.eta, 3, " mPa·s");
    item("Surface tension 25 °C", r.gamma, 2, " mN/m");
  }
  if (s.solutions.length) outcome.push({ label: "Worked solutions opened", value: s.solutions.map((k) => CALC_LABEL[k].label).join("; "), verdict: "info" });
  return {
    headline: `Physical properties of liquids at ${METHOD.tempC} °C — ${[densityDone(s), viscosityDone(s), surfaceDone(s)].filter(Boolean).length} of 3 activities complete`,
    calculations: calcs,
    outcome,
    learning: [
      "Density (g/mL) is mass per volume; specific gravity is the ratio of a liquid's density to water's at a stated temperature (here 25/25 °C), so it has no unit. Both change with temperature, which is why the temperature is always stated.",
      "The Ostwald method compares kinematic viscosities (η/ρ): it assumes Newtonian, laminar flow, the same volume and temperature for every liquid, and flow times long enough to neglect the kinetic-energy correction.",
      "Capillary rise gives γ = ρghr/(2 cos θ). Measured against water in the same clean capillary, r and θ ≈ 0 cancel; ethanol rises far less because its surface tension is less than a third of water's, only partly offset by its lower density.",
      "Limitations: readings are simulated from published data (teaching model); the glycerol mixture's surface tension is a teaching estimate (unverified: published values conflict); published ethanol viscosities differ by about 3 %; the pycnometer's glass expansion and air buoyancy are neglected, as is the meniscus-volume correction to capillary rise.",
    ],
  };
}

export const LIQUID_PROPERTIES: ExperimentDefinition<LiquidPropertiesState, LiquidPropertiesAction> = {
  meta: LABS["liquid-properties"],
  principle: [
    "Density ρ = m/V (g/mL). Specific gravity is the density of a liquid divided by the density of water at a stated temperature — 25/25 °C here (USP <841>) — so it has no unit. A pycnometer holds exactly the same volume each time it is filled and stoppered, so SG = (m₃ − m₁)/(m₂ − m₁) without knowing that volume, and ρ = SG × ρ(water, 25 °C).",
    "Viscosity is resistance to flow. In an Ostwald U-tube viscometer the time t for a fixed volume to flow between two marks is proportional to the kinematic viscosity η/ρ, so against water in the same viscometer at the same temperature, η = η(water) × ρt / ρ(water)t(water). The method assumes a Newtonian liquid in laminar flow and a flow time long enough that the kinetic-energy correction is negligible.",
    "Surface tension draws a wetting liquid up a narrow glass tube until the weight of the column balances it: γ = ρghr/(2 cos θ). In the same clean capillary (same r, θ ≈ 0), γ = γ(water) × ρh / ρ(water)h(water).",
    "All three properties change with temperature — density and surface tension fall slowly, viscosity falls steeply (about 2 % per °C for water) — so every liquid is measured at 25.0 °C in a thermostatic bath, after it has had time to reach that temperature.",
    "The three activities are connected: the densities measured in A are used to calculate the viscosities in B and the surface tensions in C, so an error in A carries through.",
    "Simulated readings, generated from published property data (CRC Handbook, IAPWS, Jasper 1972, Volk & Kähler 2018, Cheng 2008). Apparatus constants are teaching values.",
  ],
  safety: [
    "Ethanol is highly flammable (flash point 13 °C): no flames or hot plates near it, keep its bottle closed, and dispose of it only into the non-halogenated organic waste — never the sink.",
    "No fume hood is needed for the tens of millilitres of ethanol used here: ethanol's exposure limit is high (NIOSH REL 1000 ppm) and the guidance found recommends a hood for heating or for volumes above about 500 mL — work in a well-ventilated room, away from flames and hot plates, with the bottle capped. Evaporation is never a disposal route.",
    "Glass capillaries and the viscometer's capillary are fragile: handle gently; broken or used glass goes to the sharps container.",
    "Wipe spills at once — glycerol solutions make the floor slippery.",
    "A simulation: it does not authorise unsupervised work with these materials in a real laboratory.",
  ],
  equipment: EQUIPMENT,
  materials: [
    { id: "sample-water", name: "Purified water", detail: "Reference liquid" },
    { id: "sample-ethanol", name: "Ethanol, absolute (≥ 99.5 %)", detail: "C₂H₅OH", hazard: "Highly flammable liquid and vapour" },
    { id: "sample-glycerol", name: "Glycerol–water 50 % w/w", detail: "Glycerol (C₃H₈O₃) and purified water, equal masses" },
  ],
  steps: STEPS,
  controllers: CONTROLLERS,
  questions: [
    { id: "q1", kind: "viva", prompt: "Why does specific gravity have no unit, while density does?", options: ["Specific gravity is measured in kg/m³", "It is a ratio of two densities (sample ÷ water) at stated temperatures, so the units cancel", "Because water's density is exactly 1", "Because the pycnometer has no volume"], answer: 1, explanation: "SG = ρ(sample)/ρ(water) at stated temperatures; it equals the density in g/mL only approximately, because water's density at 25 °C is 0.99705 g/mL, not 1." },
    { id: "q2", kind: "design", prompt: "Why must every liquid be equilibrated in the 25 °C bath before it is measured?", options: ["To sterilise it", "Density, viscosity and surface tension all change with temperature — viscosity by about 2 % per °C", "So the balance reads faster", "Only the viscosity depends on temperature"], answer: 1, explanation: "All three properties depend on temperature; the result is only meaningful at the stated temperature." },
    { id: "q3", kind: "interpretation", prompt: "The pycnometer was still wet with water when you filled it with ethanol. Your ethanol density will be…", options: ["Too low", "Too high — the water left inside raises the mixture's density", "Unaffected", "Exactly 1"], answer: 1, explanation: "Carry-over pulls the result towards the residue's density; water is denser than ethanol." },
    { id: "q4", kind: "design", prompt: "In the Ostwald method, why must water and the sample be charged with the same volume?", options: ["To save sample", "The driving head — and so the flow time — depends on the volume in the viscometer", "Because the pipette is 10 mL", "It does not matter"], answer: 1, explanation: "The equation η₁/η₂ = ρ₁t₁/ρ₂t₂ holds only for the same viscometer, the same charge and the same temperature." },
    { id: "q5", kind: "calculation", prompt: "Water flows in 100.0 s and a liquid of density 0.800 g/mL in 150.0 s in the same viscometer at 25 °C (η water 0.890 mPa·s, ρ water 0.997 g/mL). Its viscosity is about…", options: ["1.34 mPa·s", "1.07 mPa·s", "0.74 mPa·s", "1.67 mPa·s"], answer: 1, explanation: "η = 0.890 × (0.800 × 150.0)/(0.997 × 100.0) = 1.07 mPa·s." },
    { id: "q6", kind: "interpretation", prompt: "Ethanol rises much less than water in the same capillary mainly because…", options: ["It is denser", "Its surface tension is less than a third of water's", "It is more viscous", "It evaporates"], answer: 1, explanation: "h = 2γ cos θ/(ρgr): γ falls from 72 to 22 mN/m while ρ falls only to 0.79 g/mL, so h falls to about 39 % of water's." },
    { id: "q7", kind: "viva", prompt: "A greasy capillary gives a surface tension that is…", options: ["High, because the column is longer", "Low, because the liquid no longer wets the glass (θ > 0) and rises less", "Unaffected", "Negative"], answer: 1, explanation: "The rise is proportional to cos θ; θ > 0 lowers it." },
    { id: "q8", kind: "viva", prompt: "Where does the used ethanol go?", options: ["Down the sink with plenty of water", "Into the non-halogenated organic waste container", "Into the sharps container", "It can be left to evaporate on the bench"], answer: 1, explanation: "Flammable solvents never go to a drain; they are collected as organic waste." },
  ],
  initial,
  apply,
  suggest,
  stepComplete: (s, id) => STEP_DONE[id]?.(s) ?? false,
  benchComplete: (s) => Object.values(STEP_DONE).every((f) => f(s)),
  observations,
  report,
};

/**
 * How far the METHOD is checked (types.ts `LabMeta.procedure`). Referenced simulation: the
 * methods follow named pharmacopoeial and textbook procedures and the readings are generated
 * from cited property data, but no named instructor has reviewed this procedure, and several
 * apparatus constants are teaching values.
 */
export const PROCEDURE = {
  status: "referenced_simulation" as const,
  sources: [
    { label: "USP–NF General Chapter <841> Specific Gravity (pycnometer method, 25 °C)", url: "https://www.uspnf.com/" },
    { label: "Ph. Eur. 2.2.9 Capillary viscometer method", url: "https://www.edqm.eu/en/european-pharmacopoeia" },
    { label: "Sinko, Martin's Physical Pharmacy and Pharmaceutical Sciences — viscosity (capillary viscometers) and interfacial phenomena (capillary rise)", url: "https://shop.lww.com/Martin-s-Physical-Pharmacy-and-Pharmaceutical-Sciences/p/9781975107161" },
    { label: "IAPWS releases: viscosity (2008) and surface tension (2014) of ordinary water", url: "https://www.iapws.org/release.html" },
    { label: "Volk & Kähler (2018), density of aqueous glycerol solutions, Exp. Fluids 59:75", url: "https://doi.org/10.1007/s00348-018-2527-y" },
    { label: "Cheng (2008), viscosity of glycerol–water mixtures, Ind. Eng. Chem. Res. 47:3285", url: "https://doi.org/10.1021/ie071349z" },
    { label: "Jasper (1972), surface tension of pure liquid compounds, J. Phys. Chem. Ref. Data 1:841", url: "https://doi.org/10.1063/1.3253106" },
    { label: "Ethanol density (Lange's Handbook, 10th ed.), as tabulated", url: "https://www.chemeurope.com/en/encyclopedia/Ethanol_(data_page).html" },
    { label: "NIOSH Pocket Guide: ethyl alcohol (REL 1000 ppm; flash point 55 °F)", url: "https://www.cdc.gov/niosh/npg/npgd0262.html" },
    { label: "NIH Drain Discharge Guide (2020): only approved chemicals to the drain; dilution prohibited", url: "https://nems.nih.gov/Documents/NIH_Drain_Discharge_Guide.pdf" },
    { label: "West Chester University EHS, Ethanol Purchase and Use Procedures (2022): no drain disposal at any concentration; hood above ~500 mL", url: "https://wcupa.edu/_information/AFA/Facilities/environmental-health-safety/documents/lab_research_safety/updated-programs-aug-2022/Ethanol%20Purchase%20and%20Use%20Procedures-2.pdf" },
    { label: "CRC Handbook, 95th ed. (ethanol viscosity 1.074 mPa·s and surface tension 21.97 mN/m at 25 °C), via PubChem CID 702", url: "https://pubchem.ncbi.nlm.nih.gov/compound/702" },
  ],
  assumptions: [
    "All measurements at 25.0 °C; the room is 22 °C, so the heating-only bath must be set above it.",
    "Readings are simulated from published property data; apparatus constants (viscometer constant 0.0089 mm²/s², capillary radius 0.25 mm, residue volumes, time constants, ±0.15 s reaction scatter) are teaching values.",
    "Ostwald method: Newtonian liquids, laminar flow, kinetic-energy and end corrections neglected; a different charge volume changes the flow time by 3 % per mL (teaching value).",
    "Capillary rise: uniform bore, contact angle ≈ 0 on clean glass, meniscus-volume correction (≈ r/3) neglected; a dirty bore is modelled as θ = 30°.",
    "Pycnometer: glass expansion and air buoyancy neglected (both cancel to well under 0.1 % in the ratio).",
    "Glycerol–water 50 % w/w surface tension is a teaching estimate (70.0 mN/m at 18 °C, scaled with water's temperature coefficient); an UNVERIFIED teaching estimate — published values conflict (about 61–71 mN/m).",
    "Ethanol viscosity: sources conflict by about 3 % at 25 °C (CRC 1.074 mPa·s; CHERIC 1.040). This module uses CRC (via PubChem CID 702), with the Andrade equation through CRC's 25 and 50 °C values for other temperatures.",
    "Curriculum: the UoK syllabus prescribes surface tension by the DROP-COUNT (stalagmometer) method. This module uses capillary rise (the room's apparatus); the relative principle — compare with water in the same apparatus at the same temperature — is the same.",
    "Waste: ethanol is never sunk at any strength (the strictest published rule, taught as the default; local rules may differ); the glycerol mixture is collected as aqueous chemical waste.",
    "Order A → B → C: B and C use the densities measured in A.",
  ],
};
