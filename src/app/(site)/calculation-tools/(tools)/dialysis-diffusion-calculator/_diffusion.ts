/**
 * Dialysis membrane / diffusion practical: validation, the per-row calculation
 * sequence and the ln(1 − B) vs time regression, kept apart from the page so
 * the maths can be checked on its own. Pure — ships inside the offline Android app.
 *
 * The sequence is the Pharm-D practical sheet's, step for step, and nothing
 * else is added to it:
 *
 *   Time → Absorbance → C2 = (Y − a)/b → C2/C1 → VF = 1 + V2/V1
 *        → B = (C2/C1) × VF → 1 − B → ln(1 − B) → graph → slope (→ k = −slope)
 *
 * Naming trap: the calibration slope is "b" and the practical's computed
 * quantity is "B". They are unrelated; every label says which one it means.
 */

import { toNumber, fieldError } from "@/components/calculators";
import {
  concentrationFromAbsorbance,
  fail,
  firstNonIncreasing,
  linearFit,
  numericError,
  ok,
  type Checked,
  type LinearFit,
  type Point,
} from "@/components/calculators/lab-analysis";

export const MIN_ROWS = 2;
export const MAX_ROWS = 30;

export type TimeUnit = "min" | "s";
export type Interpretation = "k" | "slope";

/** The exact wording the practical method asks for. */
export const LN_ERROR = "ln(1 − B) cannot be calculated because 1 − B must be greater than 0.";

export type TimeCells = { time: string; abs: string };

/* ─── Single-step functions ──────────────────────────────────────────────── */

/** Step 1, either direction. Shown as a step on screen, never applied silently. */
export const minutesToSeconds = (minutes: number): number => minutes * 60;
export const secondsToMinutes = (seconds: number): number => seconds / 60;

/** Step 4: VF = 1 + V2/V1. */
export function volumeFactor(v1: number, v2: number): Checked<number> {
  if (v1 === 0) return fail("V1 is 0, so V2/V1 would divide by zero.");
  return ok(1 + v2 / v1);
}

export type RowCalculation = {
  /** Step 2: C2 = (Y − a) / b, in the calibration's X unit. */
  c2: number;
  /** Step 3: C2/C1, unitless. */
  ratio: number;
  /** Step 5: B = (C2/C1) × VF. */
  B: number;
  /** Step 6: 1 − B. */
  oneMinusB: number;
  /** Step 7: ln(1 − B), or null when 1 − B ≤ 0. */
  lnValue: number | null;
  /** LN_ERROR when lnValue is null. */
  error?: string;
};

/** Steps 2–7 for one absorbance. VF is passed in because it is the same for every row. */
export function calculateRow(y: number, a: number, b: number, c1: number, vf: number): Checked<RowCalculation> {
  const conc = concentrationFromAbsorbance(y, a, b);
  if (!conc.ok) return conc;
  if (c1 === 0) return fail("C1 is 0, so C2/C1 would divide by zero.");
  const c2 = conc.value;
  const ratio = c2 / c1;
  const B = ratio * vf;
  const oneMinusB = 1 - B;
  if (!Number.isFinite(B)) return fail("B is too large to calculate — check C1, V1 and V2.");
  // ln is only defined for a positive argument. B ≥ 1 means the receptor
  // reading is at or past the equilibrium the volume correction predicts.
  if (!(oneMinusB > 0)) return ok({ c2, ratio, B, oneMinusB, lnValue: null, error: LN_ERROR });
  return ok({ c2, ratio, B, oneMinusB, lnValue: Math.log(oneMinusB) });
}

/* ─── Whole practical ────────────────────────────────────────────────────── */

export type RowResult = RowCalculation & {
  index: number;
  timeMin: number;
  timeSec: number;
  absorbance: number;
  /** Y < a: C2 is negative. Calculated, but flagged. */
  warning?: string;
};

export type DiffusionAnalysis = {
  fieldErrors: { a?: string; b?: string; c1?: string; v1?: string; v2?: string };
  /** Keyed `${rowIndex}:time` / `${rowIndex}:abs`. */
  cellErrors: Record<string, string>;
  /** Null until every input and every row is valid. */
  vf: number | null;
  rows: RowResult[] | null;
  /** Rows that entered the regression, in entry order. */
  used: RowResult[];
  excluded: { index: number; reason: string }[];
  /** Null when there are rows but too few valid ones; the reason is in regressionError. */
  fit: LinearFit | null;
  regressionError?: string;
  points: Point[];
  warnings: string[];
  notes: string[];
};

export function analyseDiffusion(input: {
  a: string;
  b: string;
  c1: string;
  v1: string;
  v2: string;
  timeUnit: TimeUnit;
  axis: TimeUnit;
  interpretation: Interpretation;
  rows: TimeCells[];
  show: boolean;
}): DiffusionAnalysis {
  const { timeUnit, axis, interpretation, show } = input;
  const fieldErrors: DiffusionAnalysis["fieldErrors"] = {
    a: numericError(input.a, { show }),
    b: numericError(input.b, { show, allowZero: false }),
    c1: fieldError(input.c1, { show }),
    v1: fieldError(input.v1, { show }),
    v2: fieldError(input.v2, { show, allowZero: true }),
  };
  const cellErrors: Record<string, string> = {};
  const warnings: string[] = [];
  const notes: string[] = [];
  const empty = { vf: null, rows: null, used: [], excluded: [], fit: null, points: [], warnings, notes };

  const times: (number | null)[] = input.rows.map((row, index) => {
    const error = numericError(row.time, { show, allowNegative: false });
    if (error) cellErrors[`${index}:time`] = error;
    const absError = numericError(row.abs, { show });
    if (absError) cellErrors[`${index}:abs`] = absError;
    return error ? null : toNumber(row.time);
  });

  // Times must rise in entry order. Checked across the rows whose time is
  // readable; the table is never re-sorted behind the student's back.
  const known = times.map((t, index) => ({ t, index })).filter((item): item is { t: number; index: number } => item.t !== null);
  const bad = firstNonIncreasing(known.map((item) => item.t));
  if (bad !== -1) {
    const unitText = timeUnit === "min" ? "min" : "s";
    cellErrors[`${known[bad].index}:time`] =
      `Time must be later than the row above (${known[bad - 1].t} ${unitText}). Times must increase from row to row.`;
  }

  const numbers = {
    a: toNumber(input.a),
    b: toNumber(input.b),
    c1: toNumber(input.c1),
    v1: toNumber(input.v1),
    v2: toNumber(input.v2),
  };
  const fieldsOk = Object.values(fieldErrors).every((e) => !e) && Object.values(numbers).every((n) => n !== null);
  const rowsOk =
    Object.keys(cellErrors).length === 0 && input.rows.every((row) => toNumber(row.time) !== null && toNumber(row.abs) !== null);
  if (!fieldsOk || !rowsOk) return { fieldErrors, cellErrors, ...empty };

  const a = numbers.a!;
  const b = numbers.b!;
  const c1 = numbers.c1!;
  const vfChecked = volumeFactor(numbers.v1!, numbers.v2!);
  if (!vfChecked.ok) return { fieldErrors: { ...fieldErrors, v1: vfChecked.error }, cellErrors, ...empty };
  const vf = vfChecked.value;

  const rows: RowResult[] = [];
  for (let index = 0; index < input.rows.length; index++) {
    const entered = toNumber(input.rows[index].time)!;
    const absorbance = toNumber(input.rows[index].abs)!;
    const calc = calculateRow(absorbance, a, b, c1, vf);
    if (!calc.ok) {
      // Only reachable through b = 0 or C1 = 0, which the field checks already stop.
      return { fieldErrors: { ...fieldErrors, b: calc.error }, cellErrors, ...empty };
    }
    rows.push({
      ...calc.value,
      index,
      timeMin: timeUnit === "min" ? entered : secondsToMinutes(entered),
      timeSec: timeUnit === "s" ? entered : minutesToSeconds(entered),
      absorbance,
      warning:
        calc.value.c2 < 0
          ? `Absorbance ${input.rows[index].abs.trim()} is below the intercept a, so C2 is negative. Check the blank correction.`
          : undefined,
    });
  }

  const used = rows.filter((row) => row.lnValue !== null);
  const excluded = rows.filter((row) => row.lnValue === null).map((row) => ({ index: row.index, reason: "ln(1 − B) not defined" }));
  const points = used.map((row) => ({ x: axis === "min" ? row.timeMin : row.timeSec, y: row.lnValue! }));

  rows.forEach((row) => {
    if (row.warning) warnings.push(`Row ${row.index + 1}: ${row.warning}`);
  });

  let fit: LinearFit | null = null;
  let regressionError: string | undefined;
  if (used.length < 2) {
    regressionError = `Only ${used.length} row${used.length === 1 ? " has" : "s have"} a valid ln(1 − B). The regression needs at least 2 rows with 1 − B > 0 and different times.`;
  } else {
    const result = linearFit(points);
    if (result.ok) fit = result.value;
    else regressionError = result.error;
  }

  if (fit) {
    if (fit.r2 === null) warnings.push("Every ln(1 − B) value is identical, so SST = Σ(y − ȳ)² = 0 and R² cannot be calculated.");
    if (interpretation === "k" && fit.slope >= 0) {
      warnings.push("The slope is not negative, so k = −slope is ≤ 0; check the data.");
    }
    if (fit.n === 2) notes.push("With only two points the line passes through both exactly, so R² = 1 by construction.");
  }
  if (excluded.length > 0) {
    notes.push(`${excluded.map((e) => `Row ${e.index + 1}`).join(", ")} excluded from the regression: ln(1 − B) not defined.`);
  }

  return { fieldErrors, cellErrors, vf, rows, used, excluded, fit, regressionError, points, warnings, notes };
}

/**
 * k = −slope under the practical's interpretation, in the axis unit, plus the
 * same k in the other time unit (k per s = k per min ÷ 60).
 */
export function rateConstant(slope: number, axis: TimeUnit): { k: number; kOther: number; unit: string; otherUnit: string } {
  const k = -slope;
  return axis === "min"
    ? { k, kOther: k / 60, unit: "min⁻¹", otherUnit: "s⁻¹" }
    : { k, kOther: k * 60, unit: "s⁻¹", otherUnit: "min⁻¹" };
}
