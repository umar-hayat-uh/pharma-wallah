/**
 * Dissolution rate constant from a practical sheet's corrected readings.
 *
 * This reproduces the table a Pharm-D student fills in during the dissolution
 * practical — midpoint, dC/dt, Cs − C and *two* separate k columns — rather
 * than a generic Noyes–Whitney or Higuchi model. The two k columns are kept
 * apart deliberately (see `kRate` / `kMidpoint`): the sheet computes both and
 * reports the average of the midpoint one.
 *
 * Pure — no React, no DOM, no I/O — so it ships inside the offline Android app
 * and can be checked on its own with `node --test scripts/dissolution-rate.test.mts`.
 * Imports reach past the `lab-analysis` barrel because that barrel pulls in
 * React UI (MEMORY.md gotcha 69).
 */

import { formatScientific, toNumber } from "@/components/calculators/lab-math";
import { duplicateIndexes, fail, ok, type Checked } from "@/components/calculators/lab-analysis/math";

export const MIN_OBSERVATIONS = 2;
export const MAX_OBSERVATIONS = 30;

export type ObservationCells = { time: string; reading: string };

/**
 * Which rows the reported average covers.
 *
 * `sheet` reproduces the supplied practical table: the average there is the
 * mean of the interior rows only — the first observation is left out (at t = 0
 * the reading is 0, so its midpoint is merely half of the first reading) and so
 * is the last (whose midpoint repeats the previous row's by the sheet's own
 * convention). `all` averages every row that has a value. Both are offered
 * because the two answers differ, and a silent choice between them would be a
 * substitution the student cannot see.
 */
export type AverageBasis = "sheet" | "all";

export type Notation = "scientific" | "decimal";

export type RowAnalysis = {
  index: number;
  /** Entered values, kept as typed for printing a lab record verbatim. */
  timeRaw: string;
  readingRaw: string;
  time: number;
  reading: number;
  /** (C₁ + C₂) / 2 — of this row and the next, or of the previous and this on the final row. */
  midpoint: number;
  midpointFrom: { a: number; b: number; /** true on the final row, which looks backwards. */ backwards: boolean };
  /** (C₂ − C₁) / (t₂ − t₁). Null on the final row: there is no following time point. */
  rate: Checked<number> | null;
  rateFrom: { deltaC: number; deltaT: number } | null;
  /** Cs − C, using this row's corrected reading (not the midpoint). */
  csMinusC: number;
  /** k = x / y with x = dC/dt. Null on the final row. */
  kRate: Checked<number> | null;
  /** k = x / y with x = midpoint. */
  kMidpoint: Checked<number>;
  /** Per-row observations worth showing beside the row — never a reason to drop it. */
  flags: string[];
};

export type AverageResult = {
  value: number;
  /** Row indexes actually averaged. */
  indexes: number[];
  /** Rows inside the chosen range that had no value (Cs − C = 0). */
  skipped: number[];
};

export type DissolutionRateAnalysis = {
  /** Keyed `${rowIndex}:time` / `${rowIndex}:reading`. */
  cellErrors: Record<string, string>;
  csError?: string;
  /** Reasons the table cannot be calculated at all. */
  blocking: string[];
  cs: number | null;
  /** Null until the saturation concentration and every observation are valid. */
  rows: RowAnalysis[] | null;
  average: Checked<AverageResult> | null;
  warnings: string[];
  notes: string[];
};

/* ─── Display ────────────────────────────────────────────────────────────── */

/**
 * A decimal string that keeps `sig` significant figures without ever slipping
 * into an exponent — 8.77352e-5 prints as "0.0000877352", the way the practical
 * sheet writes it. (`formatSig` in the kit switches to scientific below 1e-4,
 * which is exactly the range every value in this table lives in.)
 */
export function formatDecimal(value: number, sig = 6, trimZeros = false): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const rounded = Number(value.toPrecision(sig));
  if (rounded === 0) return "0";
  const decimals = Math.min(20, Math.max(0, sig - 1 - Math.floor(Math.log10(Math.abs(rounded)))));
  const text = rounded.toFixed(decimals);
  // Significant-figure columns keep their trailing zeros ("0.000311630" is six
  // figures); Cs − C does not, because "3.500000000" is just noise next to Cs.
  return (trimZeros && text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text).replace(/^-/, "−");
}

/** The same value in the notation the student chose. Display only. */
export function formatValue(value: number, notation: Notation, sig = 6): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  return notation === "decimal"
    ? formatDecimal(value, sig)
    : formatScientific(value, sig).replace(/^-/, "−");
}

/** A value inside a substitution line, with a typographic minus. */
export function signed(raw: string): string {
  const text = raw.trim().replace(/^-/, "−");
  return text.startsWith("−") ? `(${text})` : text;
}

/* ─── Analysis ───────────────────────────────────────────────────────────── */

/**
 * Validate the sheet and compute every column.
 *
 * `show` is the Calculate-pressed flag: empty fields are only reported as
 * missing once the student has asked for an answer.
 */
export function analyseDissolutionRate(
  csRaw: string,
  observations: ObservationCells[],
  basis: AverageBasis,
  show: boolean,
): DissolutionRateAnalysis {
  const cellErrors: Record<string, string> = {};
  const warnings: string[] = [];
  const notes: string[] = [];
  const blocking: string[] = [];

  // ── Saturation concentration ──
  const cs = toNumber(csRaw);
  let csError: string | undefined;
  if (csRaw.trim() === "") {
    if (show) csError = "Required.";
  } else if (cs === null) csError = "Enter a number.";
  else if (cs === 0) csError = "Cs cannot be zero — Cs − C would be the whole of −C and k would change sign.";
  else if (cs < 0) csError = "Cs must be greater than zero.";

  // ── The observation table ──
  const times: number[] = [];
  const readings: number[] = [];
  observations.forEach((row, index) => {
    const time = toNumber(row.time);
    const reading = toNumber(row.reading);

    if (row.time.trim() === "") {
      if (show) cellErrors[`${index}:time`] = "Required.";
    } else if (time === null) cellErrors[`${index}:time`] = "Enter a number.";
    else if (time < 0) cellErrors[`${index}:time`] = "Time cannot be negative.";

    if (row.reading.trim() === "") {
      if (show) cellErrors[`${index}:reading`] = "Required.";
    } else if (reading === null) cellErrors[`${index}:reading`] = "Enter a number.";

    if (time !== null && reading !== null) {
      times.push(time);
      readings.push(reading);
    }
  });

  const complete =
    cs !== null && csError === undefined && times.length === observations.length && Object.keys(cellErrors).length === 0;

  if (observations.length < MIN_OBSERVATIONS) {
    blocking.push(`At least ${MIN_OBSERVATIONS} observations are needed — a midpoint and a rate each need two readings.`);
  }

  if (!complete || blocking.length > 0) {
    return { cellErrors, csError, blocking, cs, rows: null, average: null, warnings, notes };
  }

  // ── Data checks that do not stop the calculation, but must not pass silently ──
  duplicateIndexes(times).forEach((index) => {
    cellErrors[`${index}:time`] = "Duplicate time point.";
    warnings.push(
      `Row ${index + 1} repeats the time ${times[index]} entered earlier. Where two rows share a time, t₂ − t₁ = 0 and dC/dt cannot be calculated.`,
    );
  });
  const outOfOrder: number[] = [];
  for (let i = 1; i < times.length; i++) if (times[i] < times[i - 1]) outOfOrder.push(i);
  if (outOfOrder.length > 0) {
    warnings.push(
      `Time runs backwards at row${outOfOrder.length > 1 ? "s" : ""} ${outOfOrder.map((i) => i + 1).join(", ")}. Sort the observations into time order — a negative t₂ − t₁ flips the sign of dC/dt. The values below are calculated from the rows exactly as entered.`,
    );
  }

  const n = times.length;
  const rows: RowAnalysis[] = times.map((time, index) => {
    const reading = readings[index];
    const last = index === n - 1;

    // The sheet's convention: every row averages with the NEXT reading, except
    // the final observation, which has none and averages with the PREVIOUS one.
    // That makes the last midpoint a repeat of the second-to-last row's.
    const partner = last ? readings[index - 1] : readings[index + 1];
    const midpoint = last ? (partner + reading) / 2 : (reading + partner) / 2;

    let rate: Checked<number> | null = null;
    let rateFrom: RowAnalysis["rateFrom"] = null;
    if (!last) {
      const deltaC = readings[index + 1] - reading;
      const deltaT = times[index + 1] - time;
      rateFrom = { deltaC, deltaT };
      rate = deltaT === 0
        ? fail("t₂ − t₁ = 0, so dC/dt would divide by zero. Two rows share this time.")
        : ok(deltaC / deltaT);
    }

    const csMinusC = (cs as number) - reading;
    const zeroDenominator = csMinusC === 0;

    const kRate: Checked<number> | null = rate === null
      ? null
      : !rate.ok
        ? fail(rate.error)
        : zeroDenominator
          ? fail("Cs − C = 0, so k = x / y would divide by zero. The reading has reached the saturation concentration.")
          : ok(rate.value / csMinusC);

    const kMidpoint: Checked<number> = zeroDenominator
      ? fail("Cs − C = 0, so k = x / y would divide by zero. The reading has reached the saturation concentration.")
      : ok(midpoint / csMinusC);

    const flags: string[] = [];
    if (rate?.ok && rate.value < 0) flags.push("Negative rate detected — review experimental variability.");
    if (csMinusC < 0) flags.push("C is above Cs, so Cs − C is negative — check the saturation concentration and the reading's units.");
    if (last) flags.push("Final observation: no following time point, so dC/dt is not defined. The midpoint uses the previous reading.");

    return {
      index,
      timeRaw: observations[index].time.trim(),
      readingRaw: observations[index].reading.trim(),
      time,
      reading,
      midpoint,
      midpointFrom: { a: last ? partner : reading, b: last ? reading : partner, backwards: last },
      rate,
      rateFrom,
      csMinusC,
      kRate,
      kMidpoint,
      flags,
    };
  });

  // ── Notes the student should read before trusting the table ──
  if (rows.some((row) => row.rate?.ok && row.rate.value < 0)) {
    warnings.push("Negative rate detected — review experimental variability. Negative values are kept in the table and in the graphs; nothing has been removed.");
  }
  if (rows.some((row) => row.csMinusC < 0)) {
    warnings.push("At least one corrected reading is greater than Cs, so Cs − C is negative and k changes sign with it.");
  }
  if (rows.some((row) => !row.kMidpoint.ok)) {
    warnings.push("At least one row has Cs − C = 0, so its k cannot be calculated. Those rows are shown as “—” and are left out of the average.");
  }
  notes.push(
    "Cs − C uses the row's own corrected reading, not its midpoint — that is how the practical sheet is laid out.",
  );
  notes.push(
    "The final row's midpoint is (C previous + C current) / 2, the sheet's convention for an observation with no following reading.",
  );

  return { cellErrors, csError, blocking, cs, rows, average: averageK(rows, basis), warnings, notes };
}

/* ─── Average ────────────────────────────────────────────────────────────── */

/** The row indexes a basis covers, before any are dropped for a missing value. */
export function averagedRange(rowCount: number, basis: AverageBasis): number[] {
  if (basis === "all") return Array.from({ length: rowCount }, (_, i) => i);
  // The interior rows: everything except the first and the last.
  return Array.from({ length: Math.max(0, rowCount - 2) }, (_, i) => i + 1);
}

/**
 * Mean of the midpoint-based k column over the chosen rows.
 *
 * Calculated from the values this module produced — never a stored constant —
 * so editing any reading moves it.
 */
export function averageK(rows: RowAnalysis[], basis: AverageBasis): Checked<AverageResult> {
  const range = averagedRange(rows.length, basis);
  if (range.length === 0) {
    return fail(
      "The practical-sheet average covers the rows between the first and the last, and there are none with fewer than three observations. Switch to “All observations”, or add another time point.",
    );
  }
  const indexes = range.filter((i) => rows[i].kMidpoint.ok);
  const skipped = range.filter((i) => !rows[i].kMidpoint.ok);
  if (indexes.length === 0) return fail("None of the rows in this range has a k value, so no average can be calculated.");
  let total = 0;
  for (const i of indexes) total += (rows[i].kMidpoint as { ok: true; value: number }).value;
  return ok({ value: total / indexes.length, indexes, skipped });
}
