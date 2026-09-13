/**
 * Pure analysis for the UV-Vis Spectrum Plotter: paste parsing, row
 * validation, λmax, peak detection with topographic prominence, and
 * least-squares calibration.
 *
 * No React, no DOM — this file ships inside the offline Android app and is
 * the part a student's lab record depends on, so it stays small and checkable.
 * Every number is computed from the values exactly as the student entered
 * them: nothing is smoothed, interpolated or rounded before analysis.
 */

import { toNumber } from "@/components/calculators";

/* ─── Table rows ─────────────────────────────────────────────────────────── */

/** One editable table row. Both cells stay strings so a half-typed value is visible. */
export type DataRow = { id: number; x: string; y: string };

let nextRowId = 1;
export const newRowId = () => nextRowId++;
export const blankRow = (): DataRow => ({ id: newRowId(), x: "", y: "" });

/** Hard ceiling on table size — a pasted instrument export can run to thousands of lines. */
export const MAX_ROWS = 1500;

export type RowStatus =
  | { kind: "ok" }
  /** Both cells blank — ignored silently, so a freshly added row is not shouted at. */
  | { kind: "empty" }
  | { kind: "invalid"; xBad: boolean; yBad: boolean; message: string };

/**
 * Classifies one row. `xRule` decides whether a parsed x value is acceptable
 * (wavelength must be > 0; concentration must be ≥ 0).
 */
export function rowStatus(row: DataRow, xRule: (value: number) => string | null, xName: string, yName: string): RowStatus {
  const xRaw = row.x.trim();
  const yRaw = row.y.trim();
  if (xRaw === "" && yRaw === "") return { kind: "empty" };
  const x = toNumber(xRaw);
  const y = toNumber(yRaw);
  const problems: string[] = [];
  let xBad = false;
  let yBad = false;
  if (xRaw === "") { xBad = true; problems.push(`${xName} missing`); }
  else if (x === null) { xBad = true; problems.push(`${xName} is not a number`); }
  else {
    const rule = xRule(x);
    if (rule) { xBad = true; problems.push(rule); }
  }
  if (yRaw === "") { yBad = true; problems.push(`${yName} missing`); }
  else if (y === null) { yBad = true; problems.push(`${yName} is not a number`); }
  if (!xBad && !yBad) return { kind: "ok" };
  return { kind: "invalid", xBad, yBad, message: problems.join("; ") };
}

export const wavelengthRule = (value: number) => (value > 0 ? null : "wavelength must be greater than 0");
export const concentrationRule = (value: number) => (value >= 0 ? null : "concentration cannot be negative");

/* ─── Paste parsing ──────────────────────────────────────────────────────── */

export type PasteResult = {
  rows: { x: string; y: string }[];
  /** 1-based line numbers of non-blank lines that could not be read as two numbers. */
  skipped: number[];
  /** Lines that parsed but were dropped because the table would exceed MAX_ROWS. */
  truncated: number;
};

/**
 * Reads two numeric columns from pasted text. Accepts comma, tab, semicolon or
 * whitespace separators — "250, 0.412", "250\t0.412", "250 0.412", "250;0.412".
 * A line whose first two fields are not both numbers (a header such as
 * "nm,Abs", a unit line, an instrument banner) is skipped and reported by line
 * number rather than silently dropped. Extra columns after the second are ignored.
 *
 * Comma is always a separator, never a decimal mark: "0,412" is two fields.
 */
export function parsePaste(text: string, room: number): PasteResult {
  const rows: { x: string; y: string }[] = [];
  const skipped: number[] = [];
  let truncated = 0;
  const lines = text.split(/\r\n|\r|\n/);
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim();
    if (line === "") continue;
    // Empty fields are kept: "250,,0.41" has a missing column, not two columns.
    const fields = line.split(/\s*[,;\t]\s*|\s+/);
    if (fields.length < 2 || toNumber(fields[0]) === null || toNumber(fields[1]) === null) {
      skipped.push(index + 1);
      continue;
    }
    if (rows.length >= room) {
      truncated++;
      continue;
    }
    rows.push({ x: fields[0], y: fields[1] });
  }
  return { rows, skipped, truncated };
}

/** "3, 7, 12" — or "3, 7, 12 and 9 more" once the list gets long. */
export function listNumbers(values: (number | string)[], limit = 8): string {
  if (values.length <= limit) return values.join(", ");
  return `${values.slice(0, limit).join(", ")} and ${values.length - limit} more`;
}

/* ─── Valid points ───────────────────────────────────────────────────────── */

export type Point = {
  x: number;
  y: number;
  /** The cells exactly as typed, for the report and CSV ("0.410" stays "0.410"). */
  xRaw: string;
  yRaw: string;
  /** 1-based position in the table as the student sees it. */
  rowNumber: number;
};

export type TableSummary = {
  statuses: RowStatus[];
  /** Valid points sorted by x; ties keep table order. The table itself is never reordered. */
  points: Point[];
  invalidRows: number[];
  emptyRows: number;
};

export function summariseTable(
  rows: DataRow[],
  xRule: (value: number) => string | null,
  xName: string,
  yName: string,
): TableSummary {
  const statuses: RowStatus[] = [];
  const points: Point[] = [];
  const invalidRows: number[] = [];
  let emptyRows = 0;
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const status = rowStatus(row, xRule, xName, yName);
    statuses.push(status);
    if (status.kind === "empty") emptyRows++;
    else if (status.kind === "invalid") invalidRows.push(index + 1);
    else {
      points.push({
        x: toNumber(row.x) as number,
        y: toNumber(row.y) as number,
        xRaw: row.x.trim(),
        yRaw: row.y.trim(),
        rowNumber: index + 1,
      });
    }
  }
  // Array.prototype.sort is stable, so equal x values keep their table order.
  points.sort((a, b) => a.x - b.x);
  return { statuses, points, invalidRows, emptyRows };
}

/** x values that occur more than once, each listed once, ascending. */
export function duplicateXs(sorted: Point[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].x === sorted[i - 1].x && out[out.length - 1] !== sorted[i].x) out.push(sorted[i].x);
  }
  return out;
}

/* ─── Spectrum ───────────────────────────────────────────────────────────── */

export type Peak = { index: number; point: Point; prominence: number };

export type SpectrumAnalysis = {
  points: Point[];
  lambdaMax: Point[];
  maxAbsorbance: number;
  xMin: number;
  xMax: number;
  /** The spacing between readings when every gap is the same, otherwise null. */
  step: number | null;
};

/** Absolute tolerance for "the steps are uniform" — absorbs 200.1 − 200.0 = 0.0999…94. */
const STEP_TOLERANCE = 1e-6;

export function analyseSpectrum(points: Point[]): SpectrumAnalysis | null {
  if (points.length === 0) return null;
  let maxAbsorbance = -Infinity;
  for (let i = 0; i < points.length; i++) if (points[i].y > maxAbsorbance) maxAbsorbance = points[i].y;
  // Exact equality on purpose: the values are as entered, and a tie is a tie.
  const lambdaMax = points.filter((point) => point.y === maxAbsorbance);

  let step: number | null = null;
  if (points.length >= 2) {
    const first = points[1].x - points[0].x;
    let uniform = first > 0;
    for (let i = 2; i < points.length && uniform; i++) {
      if (Math.abs(points[i].x - points[i - 1].x - first) > STEP_TOLERANCE) uniform = false;
    }
    step = uniform ? first : null;
  }

  return {
    points,
    lambdaMax,
    maxAbsorbance,
    xMin: points[0].x,
    xMax: points[points.length - 1].x,
    step,
  };
}

/**
 * Local maxima, excluding the two endpoints, with topographic prominence.
 *
 * A point is a peak when it rises above its left neighbour and the level it
 * reaches then falls on the right. A flat top (several equal readings) counts
 * once, at its first point; a flat run that reaches the last reading is an
 * endpoint and is not a peak.
 *
 * Prominence = height − max(left base, right base), where each base is the
 * lowest reading between the peak and the nearest strictly higher reading on
 * that side (or the edge of the data if there is none) — the same definition
 * as scipy.signal.peak_prominences.
 *
 * Expects points sorted by wavelength with no duplicate wavelengths.
 */
export function findPeaks(points: Point[], minProminence: number): Peak[] {
  const n = points.length;
  const peaks: Peak[] = [];
  if (n < 3) return peaks;
  const a = points.map((point) => point.y);

  let i = 1;
  while (i < n - 1) {
    if (a[i] > a[i - 1]) {
      let end = i;
      while (end + 1 < n && a[end + 1] === a[i]) end++;
      if (end < n - 1 && a[end + 1] < a[i]) {
        const height = a[i];
        let leftMin = height;
        for (let k = i - 1; k >= 0; k--) {
          if (a[k] > height) break;
          if (a[k] < leftMin) leftMin = a[k];
        }
        let rightMin = height;
        for (let k = i + 1; k < n; k++) {
          if (a[k] > height) break;
          if (a[k] < rightMin) rightMin = a[k];
        }
        const prominence = height - Math.max(leftMin, rightMin);
        if (prominence >= minProminence) peaks.push({ index: i, point: points[i], prominence });
      }
      i = end + 1;
    } else {
      i++;
    }
  }
  return peaks;
}

/* ─── Calibration ────────────────────────────────────────────────────────── */

export type Regression = {
  n: number;
  slope: number;
  intercept: number;
  /** 1 − SSres/SStot with SStot about the mean, in both fit types. Null when every A is identical. */
  r2: number | null;
  ssRes: number;
  ssTot: number;
  /** Residual standard deviation s(y/x). Null when there are no degrees of freedom left. */
  sResidual: number | null;
  seSlope: number | null;
  /** Always null for a fit forced through the origin (the intercept is fixed, not estimated). */
  seIntercept: number | null;
  throughOrigin: boolean;
  xMin: number;
  xMax: number;
};

export function linearRegression(points: Point[], throughOrigin: boolean): Regression | null {
  const n = points.length;
  if (n < 2) return null;
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumXY = 0;
  let xMin = Infinity;
  let xMax = -Infinity;
  for (let i = 0; i < n; i++) {
    const { x, y } = points[i];
    sumX += x; sumY += y; sumXX += x * x; sumXY += x * y;
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;
  let sxx = 0;
  let sxy = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i++) {
    const dx = points[i].x - meanX;
    const dy = points[i].y - meanY;
    sxx += dx * dx; sxy += dx * dy; ssTot += dy * dy;
  }

  let slope: number;
  let intercept: number;
  if (throughOrigin) {
    if (sumXX === 0) return null;
    slope = sumXY / sumXX;
    intercept = 0;
  } else {
    // Every standard at the same concentration: the slope is undefined.
    if (sxx === 0) return null;
    slope = sxy / sxx;
    intercept = meanY - slope * meanX;
    // Exact data leaves round-off like 3e-17; report that as the zero it is.
    if (Math.abs(intercept) < 1e-12 * Math.max(1, Math.abs(meanY))) intercept = 0;
  }

  let ssRes = 0;
  for (let i = 0; i < n; i++) {
    const residual = points[i].y - (slope * points[i].x + intercept);
    ssRes += residual * residual;
  }

  const dof = throughOrigin ? n - 1 : n - 2;
  const sResidual = dof > 0 ? Math.sqrt(ssRes / dof) : null;
  const seSlope = sResidual === null ? null : throughOrigin ? sResidual / Math.sqrt(sumXX) : sResidual / Math.sqrt(sxx);
  const seIntercept = sResidual === null || throughOrigin ? null : sResidual * Math.sqrt(sumXX / (n * sxx));

  return {
    n,
    slope,
    intercept,
    r2: ssTot > 0 ? 1 - ssRes / ssTot : null,
    ssRes,
    ssTot,
    sResidual,
    seSlope,
    seIntercept,
    throughOrigin,
    xMin,
    xMax,
  };
}

/* ─── Axes ───────────────────────────────────────────────────────────────── */

const clean = (value: number) => Number(value.toFixed(10));

function niceStep(span: number, target: number): number {
  const raw = span / target;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / magnitude;
  const factor = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return factor * magnitude;
}

/** Round-numbered ticks inside [lo, hi]. */
export function niceTicks(lo: number, hi: number, target = 6): number[] {
  if (!(hi > lo)) return [clean(lo)];
  const step = niceStep(hi - lo, target);
  const ticks: number[] = [];
  const first = Math.ceil(lo / step - 1e-9);
  for (let k = first; k * step <= hi + step * 1e-9 && ticks.length < 50; k++) ticks.push(clean(k * step));
  return ticks;
}

/**
 * A padded, round-numbered value axis. Starts at 0 when every value is
 * non-negative — an absorbance axis that starts at 0.39 exaggerates noise into
 * a band — and leaves headroom for the λmax label.
 */
export function valueDomain(values: number[]): [number, number] {
  let lo = Math.min(0, ...values);
  let hi = Math.max(...values);
  if (!(hi > lo)) hi = lo + 1;
  const span = hi - lo;
  hi += span * 0.14;
  if (lo < 0) lo -= span * 0.06;
  const step = niceStep(hi - lo, 5);
  // A finer step below zero, so a little baseline noise does not drop the axis by a whole major tick.
  const lowStep = niceStep(hi - lo, 20);
  return [clean(Math.floor(lo / lowStep) * lowStep), clean(Math.ceil(hi / step) * step)];
}

/** A concentration axis that includes 0 and ends on a round tick just past the data. */
export function calibrationXDomain(xs: number[]): [number, number] {
  const lo = Math.min(0, ...xs);
  const hi = Math.max(...xs);
  const top = hi > lo ? hi + (hi - lo) * 0.04 : lo + 1;
  const ticks = niceTicks(lo, top, 6);
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
  return [clean(Math.floor(lo / step) * step), clean(Math.ceil(top / step) * step)];
}

/** Decimal places that make ticks at this spacing read cleanly. */
export function tickDecimals(ticks: number[]): number {
  // Ticks are already cleaned to 10 decimals, so their shortest string form is exact.
  let decimals = 0;
  for (let i = 0; i < ticks.length; i++) {
    const fraction = String(ticks[i]).split(".")[1];
    if (fraction && fraction.length > decimals) decimals = fraction.length;
  }
  return Math.min(decimals, 6);
}

/* ─── Illustrative example ───────────────────────────────────────────────── */

/**
 * NOT measured data. A synthetic single-band spectrum (Gaussian band at
 * 275 nm, ~0.8 A) plus a weaker band near 240 nm and a small flat baseline,
 * sampled every 5 nm from 220 to 320 nm and rounded to 3 decimals. It exists
 * only to show what the plotter does; the UI labels it as illustrative.
 */
export const EXAMPLE_SPECTRUM: { x: string; y: string }[] = (() => {
  const out: { x: string; y: string }[] = [];
  for (let wl = 220; wl <= 320; wl += 5) {
    const main = 0.8 * Math.exp(-Math.pow((wl - 275) / 14, 2) / 2);
    const minor = 0.3 * Math.exp(-Math.pow((wl - 240) / 7, 2) / 2);
    out.push({ x: String(wl), y: (main + minor + 0.02).toFixed(3) });
  }
  return out;
})();

/** Illustrative standards — a clean, nearly linear series for demonstrating the fit. */
export const EXAMPLE_STANDARDS: { x: string; y: string }[] = [
  { x: "2", y: "0.105" },
  { x: "4", y: "0.212" },
  { x: "6", y: "0.318" },
  { x: "8", y: "0.421" },
  { x: "10", y: "0.530" },
];
