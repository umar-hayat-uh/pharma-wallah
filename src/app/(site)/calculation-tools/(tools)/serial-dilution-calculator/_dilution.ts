/**
 * Pure dilution maths for the Serial Dilution Calculator.
 *
 * No imports and no I/O on purpose: this ships inside the offline Android app,
 * and it can be exercised directly with `node` (type stripping) to hand-check
 * numbers without a test framework. Every volume here is in mL and every
 * concentration is in its family's base unit (mg/mL or mM); the page converts
 * at the edges.
 */

/* ─── Units ──────────────────────────────────────────────────────────────── */

export type ConcUnit = "mg/mL" | "g/L" | "µg/mL" | "%" | "M" | "mM" | "µM";
export type ConcFamily = "mass" | "molar";

/**
 * Mass/volume concentrations convert through mg/mL, molar ones through mM.
 * "%" is % w/v — grams per 100 mL — so 1 % = 10 mg/mL.
 */
export const CONC_UNITS: Record<ConcUnit, { family: ConcFamily; toBase: number; label: string }> = {
  "mg/mL": { family: "mass", toBase: 1, label: "mg/mL" },
  "g/L": { family: "mass", toBase: 1, label: "g/L" },
  "µg/mL": { family: "mass", toBase: 1e-3, label: "µg/mL" },
  "%": { family: "mass", toBase: 10, label: "% w/v" },
  M: { family: "molar", toBase: 1e3, label: "M" },
  mM: { family: "molar", toBase: 1, label: "mM" },
  "µM": { family: "molar", toBase: 1e-3, label: "µM" },
};

export const CONC_UNIT_LIST: ConcUnit[] = ["mg/mL", "g/L", "µg/mL", "%", "M", "mM", "µM"];

export const isConcUnit = (value: unknown): value is ConcUnit =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(CONC_UNITS, value);

export const toBase = (value: number, unit: ConcUnit) => value * CONC_UNITS[unit].toBase;
export const fromBase = (base: number, unit: ConcUnit) => base / CONC_UNITS[unit].toBase;
export const sameFamily = (a: ConcUnit, b: ConcUnit) => CONC_UNITS[a].family === CONC_UNITS[b].family;

/** The unit a person would naturally read this concentration in. */
export function readableUnit(base: number, family: ConcFamily): ConcUnit {
  if (family === "mass") return base >= 1 ? "mg/mL" : "µg/mL";
  if (base >= 1000) return "M";
  return base >= 1 ? "mM" : "µM";
}

/**
 * A concentration in the student's own unit while that stays readable
 * (0.01 – 100,000), otherwise in the family's readable unit — so a tube at
 * 0.0001 mg/mL is shown as 0.1 µg/mL rather than in scientific notation.
 */
export function displayConc(base: number, preferred: ConcUnit): { value: number; unit: ConcUnit } {
  const value = fromBase(base, preferred);
  if (value >= 0.01 && value < 1e5) return { value, unit: preferred };
  const unit = readableUnit(base, CONC_UNITS[preferred].family);
  return { value: fromBase(base, unit), unit };
}

/** µL below 1 mL, mL otherwise — the unit you would set on a pipette. */
export function practicalVolume(ml: number): { value: number; unit: "µL" | "mL" } {
  return ml < 1 ? { value: ml * 1000, unit: "µL" } : { value: ml, unit: "mL" };
}

/** "Reaches the target" means within 0.5 % of it. */
export const REL_TOL = 0.005;
export const relClose = (a: number, b: number, tol = REL_TOL) => Math.abs(a - b) <= tol * Math.abs(b);

/* ─── Dilution chain ─────────────────────────────────────────────────────── */

export type ChainStep = { factor: number; finalMl: number };

export type Tube = {
  /** 1-based tube number: T1, T2, … */
  number: number;
  factor: number;
  startBase: number;
  endBase: number;
  /** Volume taken from the stock (T1) or from the previous tube. */
  transferMl: number;
  diluentMl: number;
  /** Volume made up in the tube before the next tube takes its transfer. */
  preparedMl: number;
  /** Volume left once the next tube has taken its transfer. */
  remainingMl: number;
};

export type Chain = {
  tubes: Tube[];
  overallFactor: number;
  stockMl: number;
  totalDiluentMl: number;
  finalBase: number;
  /** A tube that does not hold enough to supply the next one (keep-full OFF only). */
  shortfalls: { tube: number; needMl: number; hasMl: number }[];
};

/**
 * Each tube i is diluted 1:X_i from the tube before it (T1 from the stock).
 *
 * keepFull OFF — every tube is made up to its final volume, and the next tube's
 *   transfer is then taken out of it, leaving V_i − transfer_{i+1}.
 * keepFull ON  — every tube must still hold V_i after giving up that transfer,
 *   so it is prepared at V_i + transfer_{i+1}. That makes the volumes depend on
 *   the tube after, so they are worked out backwards from the last tube.
 */
export function computeChain(c1Base: number, steps: ChainStep[], keepFull: boolean): Chain {
  const n = steps.length;
  const prepared: number[] = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const next = i + 1 < n ? prepared[i + 1] / steps[i + 1].factor : 0;
    prepared[i] = keepFull ? steps[i].finalMl + next : steps[i].finalMl;
  }

  const tubes: Tube[] = [];
  const shortfalls: Chain["shortfalls"] = [];
  let start = c1Base;
  let overall = 1;
  let totalDiluent = 0;
  for (let i = 0; i < n; i++) {
    const { factor } = steps[i];
    const transferMl = prepared[i] / factor;
    const diluentMl = prepared[i] - transferMl;
    const nextTransfer = i + 1 < n ? prepared[i + 1] / steps[i + 1].factor : 0;
    const remainingMl = prepared[i] - nextTransfer;
    if (remainingMl < -1e-9 * prepared[i]) {
      shortfalls.push({ tube: i + 1, needMl: nextTransfer, hasMl: prepared[i] });
    }
    const endBase = start / factor;
    tubes.push({ number: i + 1, factor, startBase: start, endBase, transferMl, diluentMl, preparedMl: prepared[i], remainingMl });
    overall *= factor;
    totalDiluent += diluentMl;
    start = endBase;
  }

  return {
    tubes,
    overallFactor: overall,
    stockMl: tubes.length ? tubes[0].transferMl : 0,
    totalDiluentMl: totalDiluent,
    finalBase: start,
    shortfalls,
  };
}

/* ─── Desired final concentration ────────────────────────────────────────── */

export type TargetResult =
  | { kind: "reached"; tube: number }
  /** Falls between tube `above` (0 = the stock) and tube `below`. */
  | { kind: "between"; above: number; below: number }
  /** Still above the target after the last tube. */
  | { kind: "beyond" };

export function analyseTarget(chain: Chain, targetBase: number): TargetResult {
  for (let i = 0; i < chain.tubes.length; i++) {
    if (relClose(chain.tubes[i].endBase, targetBase)) return { kind: "reached", tube: i + 1 };
  }
  for (let i = 0; i < chain.tubes.length; i++) {
    if (chain.tubes[i].endBase < targetBase) return { kind: "between", above: i, below: i + 1 };
  }
  return { kind: "beyond" };
}

/**
 * Steps of a uniform 1:X series needed to get from c1 down to the target.
 * `exact` is true when that many steps land within 0.5 % of the target.
 */
export function stepsToTarget(c1Base: number, targetBase: number, factor: number): { steps: number; exact: boolean } {
  const k = Math.log(c1Base / targetBase) / Math.log(factor);
  const rounded = Math.max(1, Math.round(k));
  if (relClose(c1Base / Math.pow(factor, rounded), targetBase)) return { steps: rounded, exact: true };
  return { steps: Math.max(1, Math.ceil(k)), exact: false };
}

/** The uniform per-step factor that reaches the target in exactly n steps. */
export const exactFactor = (overall: number, steps: number) => Math.pow(overall, 1 / steps);

/* ─── Reverse calculation: splitting a dilution that is too large ────────── */

/**
 * Smallest number of equal 1:X steps (each tube made up to vMl) whose transfer
 * vMl ÷ X is at least the minimum pipettable volume. 1 means no split is needed;
 * null means impossible (minimum ≥ final volume) or more than 20 steps.
 */
export function minimumSteps(overall: number, vMl: number, minMl: number): number | null {
  const maxFactor = vMl / minMl;
  if (!(maxFactor > 1)) return null;
  if (overall <= maxFactor * (1 + 1e-9)) return 1;
  const n = Math.ceil(Math.log(overall) / Math.log(maxFactor) - 1e-9);
  return n <= 20 ? n : null;
}

/** Factors a student can make up without a calculator. */
export const CONVENIENT_FACTORS = [1000, 500, 250, 200, 100, 50, 40, 25, 20, 10, 5, 4, 2];

/**
 * A plan built only from convenient factors whose product is EXACTLY the
 * overall factor, each transfer still ≥ the minimum. Tries `fromSteps` steps,
 * then one more. Among valid plans, the one whose smallest transfer is largest.
 * Returns factors largest-first, or null — never an approximate plan.
 */
export function convenientPlan(overall: number, vMl: number, minMl: number, fromSteps: number): number[] | null {
  const maxFactor = vMl / minMl;
  const allowed = CONVENIENT_FACTORS.filter((x) => x <= maxFactor * (1 + 1e-9));
  if (allowed.length === 0) return null;

  for (let m = Math.max(1, fromSteps); m <= Math.min(fromSteps + 1, 6); m++) {
    const found: { plan: number[] | null } = { plan: null };
    const pick: number[] = [];
    const walk = (start: number, product: number) => {
      if (pick.length === m) {
        if (relClose(product, overall, 1e-9) && (!found.plan || pick[0] < found.plan[0])) found.plan = pick.slice();
        return;
      }
      for (let i = start; i < allowed.length; i++) {
        const next = product * allowed[i];
        if (next > overall * (1 + 1e-9)) continue;
        // allowed is descending: if even repeating this factor cannot reach the
        // target, every smaller one falls shorter still.
        if (next * Math.pow(allowed[i], m - pick.length - 1) < overall * (1 - 1e-9)) break;
        pick.push(allowed[i]);
        walk(i, next);
        pick.pop();
      }
    };
    walk(0, 1);
    if (found.plan) return found.plan;
  }
  return null;
}
