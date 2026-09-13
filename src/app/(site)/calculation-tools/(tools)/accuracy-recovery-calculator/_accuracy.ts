/**
 * Accuracy & % recovery: validation, per-trial recovery and replicate
 * statistics, kept apart from the page so the maths can be checked on its own.
 * Pure — ships inside the offline Android app.
 *
 * Imports the kit's pure modules by path (not the barrel files), so this file
 * pulls in no React and can be run directly in Node to hand-check the numbers.
 */

import { formatFixed, toNumber } from "@/components/calculators/lab-math";
import { fail, mean, ok, sampleSD, sum, type Checked } from "@/components/calculators/lab-analysis/math";

export const MIN_TRIALS = 1;
export const MAX_TRIALS = 20;

/**
 * One unit for both columns. Theoretical and found are always in the same unit,
 * so no conversion ever happens — and none can happen silently.
 */
export const AMOUNT_UNITS = ["mg", "µg", "g", "mL", "µL", "µg/mL", "mg/mL", "%", "IU"];

/* ─── Validation ─────────────────────────────────────────────────────────── */

/** `show` is false until Calculate is pressed, so an untouched form is not a wall of red. */
export function theoreticalError(raw: string, show: boolean): string | undefined {
  if (raw.trim() === "") return show ? "Required." : undefined;
  const value = toNumber(raw);
  if (value === null) return "Enter a number.";
  if (value < 0) return "A theoretical amount cannot be negative.";
  if (value === 0) return "Theoretical amount must be greater than zero — % recovery would divide by zero.";
  return undefined;
}

/** Zero is allowed (a genuine 0% recovery) but warned about by the analysis. */
export function foundError(raw: string, show: boolean): string | undefined {
  if (raw.trim() === "") return show ? "Required." : undefined;
  const value = toNumber(raw);
  if (value === null) return "Enter a number.";
  if (value < 0) return "An amount found cannot be negative.";
  return undefined;
}

/* ─── One trial ──────────────────────────────────────────────────────────── */

export type Trial = {
  theoretical: number;
  found: number;
  /** (found / theoretical) × 100 */
  recovery: number;
  /** [(found − theoretical) / theoretical] × 100 — signed. */
  percentError: number;
  /** found − theoretical, in the amount unit — signed. */
  difference: number;
  /** |found − theoretical|, in the amount unit. */
  absoluteError: number;
  /** |100 − % recovery|, in percentage points. */
  fromHundred: number;
};

/** Callers guarantee theoretical > 0 (validated above). */
export function computeTrial(theoretical: number, found: number): Trial {
  const recovery = (found / theoretical) * 100;
  const difference = found - theoretical;
  return {
    theoretical,
    found,
    recovery,
    percentError: (difference / theoretical) * 100,
    difference,
    absoluteError: Math.abs(difference),
    fromHundred: Math.abs(100 - recovery),
  };
}

function trialWarnings(trial: Trial, prefix: string): string[] {
  if (trial.found === 0) return [`${prefix}0% recovery — nothing was found; check the analysis.`];
  if (trial.recovery > 100) {
    return [`${prefix}recovery is above 100% (${formatFixed(trial.recovery, 2)}%) — found more than theoretical; check weighing, dilution or calculation.`];
  }
  return [];
}

/* ─── Acceptance range (optional) ────────────────────────────────────────── */

export type Range = { lower: number; upper: number };

export type RangeAnalysis = {
  lowerError?: string;
  upperError?: string;
  /** Null unless both limits are entered and valid. */
  range: Range | null;
  note?: string;
};

export function analyseRange(lowerRaw: string, upperRaw: string): RangeAnalysis {
  const check = (raw: string) => {
    if (raw.trim() === "") return undefined;
    const value = toNumber(raw);
    if (value === null) return "Enter a number.";
    if (value < 0) return "A recovery limit cannot be negative.";
    return undefined;
  };
  const lowerError = check(lowerRaw);
  let upperError = check(upperRaw);
  const lower = toNumber(lowerRaw);
  const upper = toNumber(upperRaw);

  const lowerBlank = lowerRaw.trim() === "";
  const upperBlank = upperRaw.trim() === "";
  if (lowerBlank !== upperBlank) {
    return { lowerError, upperError, range: null, note: "Enter both limits to check the results against a range." };
  }
  if (lowerError || upperError || lower === null || upper === null) return { lowerError, upperError, range: null };
  if (!(lower < upper)) {
    upperError = "The upper limit must be greater than the lower limit.";
    return { lowerError, upperError, range: null };
  }
  return { range: { lower, upper } };
}

/**
 * Inclusive, with a round-off allowance: 49/50 × 100 can land a hair beside
 * 98 in floating point, and a limit the student typed must not be missed by 1e-14.
 */
export const withinRange = (value: number, range: Range) => {
  const tolerance = 1e-9 * Math.max(1, Math.abs(value));
  return value >= range.lower - tolerance && value <= range.upper + tolerance;
};

/* ─── Mode 1: basic practical ────────────────────────────────────────────── */

export type BasicAnalysis = {
  theoreticalError?: string;
  foundError?: string;
  trial: Trial | null;
  warnings: string[];
};

export function analyseBasic(theoreticalRaw: string, foundRaw: string, show: boolean): BasicAnalysis {
  const tError = theoreticalError(theoreticalRaw, show);
  const fError = foundError(foundRaw, show);
  const theoretical = toNumber(theoreticalRaw);
  const found = toNumber(foundRaw);
  if (tError || fError || theoretical === null || found === null) {
    return { theoreticalError: tError, foundError: fError, trial: null, warnings: [] };
  }
  const trial = computeTrial(theoretical, found);
  return { trial, warnings: trialWarnings(trial, "") };
}

/* ─── Mode 2: replicates ─────────────────────────────────────────────────── */

export type TrialCells = { theoretical: string; found: string };

export type ReplicateStats = {
  n: number;
  sumRecovery: number;
  meanRecovery: number;
  /** (xᵢ − x̄)² for each trial's % recovery. */
  squaredDeviations: number[];
  sumSquaredDeviations: number;
  /** Sample SD (n − 1) of the % recovery values, in %. */
  sd: Checked<number>;
  /** (SD / mean) × 100. */
  rsd: Checked<number>;
  sumPercentError: number;
  meanPercentError: number;
  sumAbsoluteError: number;
  /** In the amount unit. */
  meanAbsoluteError: number;
  /** |100 − mean % recovery|, in percentage points. */
  meanFromHundred: number;
};

export type ReplicateAnalysis = {
  /** Keyed `${rowIndex}:theoretical` / `${rowIndex}:found`. */
  cellErrors: Record<string, string>;
  /** Per-row result as soon as that row is valid — for the live table column. */
  rowTrials: (Trial | null)[];
  /** Null until every visible trial is valid. */
  trials: Trial[] | null;
  stats: ReplicateStats | null;
  warnings: string[];
  notes: string[];
};

export function replicateStats(trials: Trial[]): ReplicateStats {
  const recoveries = trials.map((t) => t.recovery);
  const n = trials.length;
  const meanRecovery = mean(recoveries) ?? 0;
  const squaredDeviations = recoveries.map((r) => (r - meanRecovery) ** 2);
  const sd = sampleSD(recoveries);
  const sdChecked: Checked<number> =
    sd === null ? fail("Not defined for a single trial (sample SD needs n ≥ 2).") : ok(sd);
  const rsd: Checked<number> = !sdChecked.ok
    ? fail(sdChecked.error)
    : meanRecovery === 0
      ? fail("Mean % recovery is 0, so %RSD = (SD / mean) × 100 would divide by zero.")
      : ok((sdChecked.value / meanRecovery) * 100);
  const sumPercentError = sum(trials.map((t) => t.percentError));
  const sumAbsoluteError = sum(trials.map((t) => t.absoluteError));
  return {
    n,
    sumRecovery: sum(recoveries),
    meanRecovery,
    squaredDeviations,
    sumSquaredDeviations: sum(squaredDeviations),
    sd: sdChecked,
    rsd,
    sumPercentError,
    meanPercentError: sumPercentError / n,
    sumAbsoluteError,
    meanAbsoluteError: sumAbsoluteError / n,
    meanFromHundred: Math.abs(100 - meanRecovery),
  };
}

export function analyseReplicates(rows: TrialCells[], show: boolean): ReplicateAnalysis {
  const cellErrors: Record<string, string> = {};
  const warnings: string[] = [];
  const notes: string[] = [];

  const rowTrials = rows.map((row, index) => {
    const tError = theoreticalError(row.theoretical, show);
    const fError = foundError(row.found, show);
    if (tError) cellErrors[`${index}:theoretical`] = tError;
    if (fError) cellErrors[`${index}:found`] = fError;
    const theoretical = toNumber(row.theoretical);
    const found = toNumber(row.found);
    if (theoreticalError(row.theoretical, true) || foundError(row.found, true) || theoretical === null || found === null) return null;
    return computeTrial(theoretical, found);
  });

  // Every visible row is required: averaging only the filled rows would
  // silently change n, the divisor of the student's mean.
  const complete = rowTrials.every((trial) => trial !== null) && Object.keys(cellErrors).length === 0;
  if (!complete || rowTrials.length === 0) {
    return { cellErrors, rowTrials, trials: null, stats: null, warnings, notes };
  }

  const trials = rowTrials as Trial[];
  trials.forEach((trial, index) => warnings.push(...trialWarnings(trial, `Trial ${index + 1}: `)));

  if (trials.some((t) => t.theoretical !== trials[0].theoretical)) {
    notes.push(
      "The theoretical amounts differ between trials, so the mean absolute error averages errors made at different levels. Compare trials by % recovery, which is independent of the level.",
    );
  }

  return { cellErrors, rowTrials, trials, stats: replicateStats(trials), warnings, notes };
}

/* ─── Accuracy summary ───────────────────────────────────────────────────── */

/**
 * A plain-language reading of the result. It states only what was calculated —
 * no acceptance criterion is invented; a range is judged only when the student
 * enters one from their practical or monograph.
 */
export function accuracySummary({
  recovery,
  label,
  rsd,
  n,
  range,
  trialsWithin,
}: {
  /** % recovery, or mean % recovery. */
  recovery: number;
  label: "Recovery" | "Mean recovery";
  rsd?: Checked<number>;
  n?: number;
  range: Range | null;
  /** Trials inside the range (replicates only). */
  trialsWithin?: number;
}): string[] {
  const lines: string[] = [];
  const gap = Math.abs(100 - recovery);
  const direction =
    formatFixed(gap, 2) === "0.00"
      ? "equal to the theoretical amount (to two decimal places)"
      : recovery < 100
        ? `${formatFixed(gap, 2)} percentage points below the theoretical amount (${label === "Mean recovery" ? "found values are lower than theoretical on average" : "less was found than expected"})`
        : `${formatFixed(gap, 2)} percentage points above the theoretical amount (${label === "Mean recovery" ? "found values are higher than theoretical on average" : "more was found than expected"})`;
  lines.push(`${label} ${formatFixed(recovery, 2)}% — ${direction}.`);

  if (rsd && n !== undefined) {
    lines.push(
      rsd.ok
        ? `Replicate precision: %RSD ${formatFixed(rsd.value, 2)}% across ${n} trials.`
        : `Replicate precision: %RSD cannot be stated — ${rsd.error.charAt(0).toLowerCase()}${rsd.error.slice(1)}`,
    );
  }

  if (range) {
    const limits = `${formatFixed(range.lower, 2)}–${formatFixed(range.upper, 2)}%`;
    const inside = withinRange(recovery, range);
    const side = recovery < range.lower ? "below the lower limit" : "above the upper limit";
    lines.push(
      inside
        ? `The ${label.toLowerCase()} lies within the acceptance range you entered (${limits}).`
        : `The ${label.toLowerCase()} lies outside the acceptance range you entered (${limits}) — ${side}.`,
    );
    if (trialsWithin !== undefined && n !== undefined) {
      lines.push(`${trialsWithin} of ${n} trial${n === 1 ? "" : "s"} lie within ${limits}.`);
    }
  }
  return lines;
}
