/**
 * Pure maths shared by the analytical-practical calculators: calibration
 * curve, dissolution, cumulative release, dialysis/diffusion, accuracy and
 * partition coefficient.
 *
 * Rules every function here follows, because they are the rules of a lab record:
 *  - Full precision in, full precision out. Nothing here rounds; the UI rounds
 *    for display only.
 *  - A calculation that is mathematically undefined (a zero denominator, the
 *    log of a non-positive number) returns an explanation, never NaN/Infinity.
 *  - No formula is added that the practical method does not use.
 *
 * No I/O and no React — this file ships inside the offline Android app.
 */

import { toNumber } from "../lab-math";

export type Point = { x: number; y: number };

/** A value, or the reason it could not be calculated. */
export type Checked<T> = { ok: true; value: T } | { ok: false; error: string };

export const ok = <T,>(value: T): Checked<T> => ({ ok: true, value });
export const fail = <T,>(error: string): Checked<T> => ({ ok: false, error });

/* ─── Least-squares straight line ────────────────────────────────────────── */

export type LinearFit = {
  n: number;
  sumX: number;
  sumY: number;
  sumXY: number;
  sumX2: number;
  meanX: number;
  meanY: number;
  /** nΣxy − (Σx)(Σy) */
  slopeNumerator: number;
  /** nΣx² − (Σx)² — zero when every x is the same. */
  denominator: number;
  slope: number;
  intercept: number;
  /** Σ(y − ŷ)² */
  sse: number;
  /** Σ(y − ȳ)² */
  sst: number;
  /** 1 − SSE/SST. Null when SST = 0 (every y identical), where R² is undefined. */
  r2: number | null;
  /** ŷ for each input point, in input order. */
  predicted: number[];
  xMin: number;
  xMax: number;
};

/**
 * Ordinary least squares, written with the textbook sums so every step can be
 * shown to a student exactly as their practical sheet writes it:
 *
 *   m = [nΣxy − (Σx)(Σy)] / [nΣx² − (Σx)²]
 *   c = [Σy − mΣx] / n
 *   R² = 1 − Σ(y − ŷ)² / Σ(y − ȳ)²
 */
export function linearFit(points: Point[]): Checked<LinearFit> {
  const n = points.length;
  if (n < 2) return fail("At least two points are needed to fit a straight line.");

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let xMin = Infinity;
  let xMax = -Infinity;
  for (let i = 0; i < n; i++) {
    const { x, y } = points[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
  }

  const slopeNumerator = n * sumXY - sumX * sumY;
  const denominator = n * sumX2 - sumX * sumX;
  // Compare against the scale of the terms, not against exact zero: identical
  // x values such as 0.1, 0.1, 0.1 leave a round-off residue like 1e-17.
  if (Math.abs(denominator) <= 1e-12 * Math.max(1, n * sumX2)) {
    return fail("Every X value is the same, so nΣx² − (Σx)² = 0 and the slope cannot be calculated. Enter at least two different X values.");
  }

  const slope = slopeNumerator / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const meanX = sumX / n;
  const meanY = sumY / n;

  let sse = 0;
  let sst = 0;
  const predicted: number[] = [];
  for (let i = 0; i < n; i++) {
    const yHat = slope * points[i].x + intercept;
    predicted.push(yHat);
    sse += (points[i].y - yHat) ** 2;
    sst += (points[i].y - meanY) ** 2;
  }

  return ok({
    n, sumX, sumY, sumXY, sumX2, meanX, meanY,
    slopeNumerator, denominator, slope, intercept,
    sse, sst,
    r2: sst > 0 ? 1 - sse / sst : null,
    predicted, xMin, xMax,
  });
}

/* ─── Calibration equation ───────────────────────────────────────────────── */

/**
 * X from Y on a straight-line calibration, written as the practical sheets
 * write it: Y = a + bX, so X = (Y − a) / b.
 * (The Calibration Curve Calculator's Y = mX + c is the same line: a = c, b = m.)
 */
export function concentrationFromAbsorbance(y: number, a: number, b: number): Checked<number> {
  if (b === 0) return fail("The calibration slope b is 0, so X = (Y − a) / b would divide by zero.");
  return ok((y - a) / b);
}

/* ─── Replicates and descriptive statistics ──────────────────────────────── */

export function sum(values: number[]): number {
  let total = 0;
  for (let i = 0; i < values.length; i++) total += values[i];
  return total;
}

export function mean(values: number[]): number | null {
  return values.length === 0 ? null : sum(values) / values.length;
}

/** Sample standard deviation (n − 1). Null for fewer than two values. */
export function sampleSD(values: number[]): number | null {
  const n = values.length;
  if (n < 2) return null;
  const m = sum(values) / n;
  let ss = 0;
  for (let i = 0; i < n; i++) ss += (values[i] - m) ** 2;
  return Math.sqrt(ss / (n - 1));
}

/**
 * Replicate readings typed as strings → numbers, or which one is wrong.
 * Every visible replicate field is required: averaging only the filled ones
 * would silently change the divisor of a student's mean.
 */
export function parseReplicates(raw: string[], label = "Reading"): Checked<number[]> {
  const values: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].trim() === "") return fail(`${label} ${i + 1} is empty.`);
    const value = toNumber(raw[i]);
    if (value === null) return fail(`${label} ${i + 1} is not a number.`);
    values.push(value);
  }
  if (values.length === 0) return fail(`Enter at least one ${label.toLowerCase()}.`);
  return ok(values);
}

/** Strictly increasing, e.g. sampling times. Returns the index of the first offender, or −1. */
export function firstNonIncreasing(values: number[]): number {
  for (let i = 1; i < values.length; i++) if (!(values[i] > values[i - 1])) return i;
  return -1;
}

/** Indexes of values that repeat an earlier value exactly. */
export function duplicateIndexes(values: number[]): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  values.forEach((value, index) => {
    if (seen.has(value)) out.push(index);
    seen.add(value);
  });
  return out;
}
