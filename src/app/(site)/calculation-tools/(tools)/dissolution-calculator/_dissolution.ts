/**
 * Dissolution practical: validation, the practical-sheet correction and the
 * drug-release arithmetic, kept apart from the page so the maths can be run
 * and checked on its own.
 *
 * Imports the shared layer's pure files directly (not the lab-analysis index,
 * which also re-exports React parts) so this module stays React-free.
 * Pure — ships inside the offline Android app.
 */

import { fieldError, toNumber } from "@/components/calculators/lab-math";
import {
  concentrationFromAbsorbance,
  firstNonIncreasing,
  mean,
  parseReplicates,
  sum,
} from "@/components/calculators/lab-analysis/math";
import { num, paren } from "@/components/calculators/lab-analysis/format";

export const MIN_TIME_POINTS = 2;
export const MAX_TIME_POINTS = 30;
export const MIN_READINGS = 1;
export const MAX_READINGS = 6;
export const DEFAULT_READINGS = 4;
export const DEFAULT_TIMES = ["0", "10", "20", "30", "40", "50", "60"];

/** Cell key of the k-th replicate column (0-based k → "b1"). */
export const readingKey = (k: number) => `b${k + 1}`;

/* ─── Units ──────────────────────────────────────────────────────────────── */

/**
 * Only mass-per-volume units: the amount dissolved is a mass (mg), which a
 * molar or % w/v concentration cannot give without a molar mass or another
 * assumption this practical does not make.
 */
export const DISSOLUTION_UNITS = ["µg/mL", "mg/mL", "mg/L", "µg/L", "g/L"];

/**
 * Concentration unit → mg/mL, with the factor written as a student writes it.
 * The page prints this as its own step: a unit is never changed silently.
 */
export const TO_MG_PER_ML: Record<string, { factor: number; factorText: string; reason: string }> = {
  "µg/mL": { factor: 0.001, factorText: "× 0.001 mg/µg", reason: "1 mg = 1000 µg" },
  "mg/mL": { factor: 1, factorText: "× 1", reason: "already in mg/mL" },
  "mg/L": { factor: 0.001, factorText: "× 0.001 L/mL", reason: "1 L = 1000 mL" },
  "µg/L": { factor: 1e-6, factorText: "× 0.001 mg/µg × 0.001 L/mL", reason: "1 mg = 1000 µg and 1 L = 1000 mL" },
  "g/L": { factor: 1, factorText: "× 1000 mg/g × 0.001 L/mL", reason: "1 g = 1000 mg and 1 L = 1000 mL" },
};

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type TimePointCells = {
  time: string;
  /** Only the visible replicate columns, B1…Bn. */
  readings: string[];
};

export type DissolutionInput = {
  labelClaim: string;
  mediumVolume: string;
  sampleVolume: string;
  dilutionFactor: string;
  intercept: string;
  slope: string;
  unit: string;
  rows: TimePointCells[];
  /** False until Calculate is pressed: empty fields are not flagged before that. */
  show: boolean;
};

export type TimePointResult = {
  time: number;
  /** Readings exactly as typed, for the lab record. */
  readingsText: string[];
  readings: number[];
  sumAbsorbance: number;
  averageAbsorbance: number;
  /** X = (Y − a) / b, before the dilution factor. */
  calibrationX: number;
  /** C = X × DF. */
  concentration: number;
  /** Null at the first time point: there was no earlier withdrawal. */
  previousCorrected: number | null;
  correctionFactor: number;
  corrected: number;
  correctedMgPerMl: number;
  amountMg: number;
  percentRelease: number;
};

export type DissolutionResult = {
  /** Given values as typed (printed on the record) … */
  text: { labelClaim: string; mediumVolume: string; sampleVolume: string; dilutionFactor: string; intercept: string; slope: string };
  /** … and parsed, at full precision. */
  labelClaim: number;
  mediumVolume: number;
  sampleVolume: number;
  dilutionFactor: number;
  intercept: number;
  slope: number;
  unit: string;
  /** Vs / V */
  ratio: number;
  conversion: { factor: number; factorText: string; reason: string };
  readingsPerPoint: number;
  points: TimePointResult[];
};

export type DissolutionField = "labelClaim" | "mediumVolume" | "sampleVolume" | "dilutionFactor";

export type DissolutionAnalysis = {
  fieldErrors: Partial<Record<DissolutionField, string>>;
  /** Keyed `${rowIndex}:time` / `${rowIndex}:b1` … */
  cellErrors: Record<string, string>;
  /** One problem per row, shown under the row in the time-point table. */
  rowErrors: Record<number, string>;
  rowWarnings: Record<number, string>;
  /** Live average absorbance per row, null until that row's readings are valid. */
  averages: (number | null)[];
  /** b = 0, or a unit this tool cannot turn into mg. */
  calibrationError: string | null;
  /** Null until every input is valid. */
  result: DissolutionResult | null;
  warnings: string[];
  notes: string[];
};

/* ─── Analysis ───────────────────────────────────────────────────────────── */

export function analyseDissolution(input: DissolutionInput): DissolutionAnalysis {
  const { show } = input;
  const fieldErrors: DissolutionAnalysis["fieldErrors"] = {};
  const cellErrors: Record<string, string> = {};
  const rowErrors: Record<number, string> = {};
  const rowWarnings: Record<number, string> = {};
  const warnings: string[] = [];
  const notes: string[] = [];

  // ── Tablet / medium ──
  const labelClaimError = fieldError(input.labelClaim, { show });
  const mediumError = fieldError(input.mediumVolume, { show });
  let sampleError = fieldError(input.sampleVolume, { show });
  const dfError = fieldError(input.dilutionFactor, { show });

  const labelClaim = toNumber(input.labelClaim);
  const mediumVolume = toNumber(input.mediumVolume);
  const sampleVolume = toNumber(input.sampleVolume);
  const dilutionFactor = toNumber(input.dilutionFactor);

  if (!sampleError && !mediumError && sampleVolume !== null && mediumVolume !== null && sampleVolume >= mediumVolume) {
    sampleError = "Must be less than the dissolution medium volume (V).";
  }
  if (labelClaimError) fieldErrors.labelClaim = labelClaimError;
  if (mediumError) fieldErrors.mediumVolume = mediumError;
  if (sampleError) fieldErrors.sampleVolume = sampleError;
  if (dfError) fieldErrors.dilutionFactor = dfError;

  if (!dfError && dilutionFactor !== null && dilutionFactor < 1) {
    warnings.push(`The dilution factor is ${input.dilutionFactor.trim()}, below 1 — that means the sample was concentrated, not diluted. Check the value.`);
  }

  // ── Calibration ──
  const intercept = toNumber(input.intercept);
  const slope = toNumber(input.slope);
  let calibrationError: string | null = null;
  if (slope === 0) {
    const check = concentrationFromAbsorbance(0, intercept ?? 0, 0);
    calibrationError = check.ok ? null : check.error;
  }
  const conversion = TO_MG_PER_ML[input.unit];
  if (!conversion) {
    calibrationError = `The concentration unit "${input.unit}" cannot be converted to mg/mL here. Choose a mass-per-volume unit.`;
  }

  // ── Time-point table ──
  const times: (number | null)[] = [];
  const averages: (number | null)[] = [];
  const parsedReadings: (number[] | null)[] = [];

  input.rows.forEach((row, index) => {
    const time = toNumber(row.time);
    if (row.time.trim() === "") {
      if (show) cellErrors[`${index}:time`] = "Required.";
    } else if (time === null) cellErrors[`${index}:time`] = "Enter a number.";
    else if (time < 0) cellErrors[`${index}:time`] = "Cannot be negative.";
    times.push(time !== null && time >= 0 ? time : null);

    row.readings.forEach((raw, k) => {
      if (raw.trim() === "") {
        if (show) cellErrors[`${index}:${readingKey(k)}`] = "Required.";
      } else if (toNumber(raw) === null) cellErrors[`${index}:${readingKey(k)}`] = "Enter a number.";
    });

    // Every visible replicate is required: averaging only the filled ones would
    // silently change the divisor of the student's mean.
    const readings = parseReplicates(row.readings, "B");
    parsedReadings.push(readings.ok ? readings.value : null);
    averages.push(readings.ok ? mean(readings.value) : null);
  });

  // Times must rise in the order entered. Rows are never re-sorted: the
  // correction depends on which sample came before which.
  const timed: { index: number; value: number }[] = [];
  times.forEach((value, index) => {
    if (value !== null) timed.push({ index, value });
  });
  const offender = firstNonIncreasing(timed.map((t) => t.value));
  if (offender !== -1) {
    const { index } = timed[offender];
    const previous = timed[offender - 1];
    cellErrors[`${index}:time`] = `Must be later than the previous time point (${num(previous.value)} min).`;
  }

  input.rows.forEach((row, index) => {
    const keys = ["time", ...row.readings.map((_, k) => readingKey(k))];
    for (let i = 0; i < keys.length; i++) {
      const message = cellErrors[`${index}:${keys[i]}`];
      if (message) {
        rowErrors[index] = `${keys[i] === "time" ? "Time" : keys[i].toUpperCase()}: ${message}`;
        break;
      }
    }
    const average = averages[index];
    if (!rowErrors[index] && average !== null && intercept !== null && average < intercept) {
      rowWarnings[index] = "Average absorbance is below the intercept a, so this concentration comes out negative.";
    }
  });

  const complete =
    Object.keys(fieldErrors).length === 0 &&
    Object.keys(cellErrors).length === 0 &&
    calibrationError === null &&
    labelClaim !== null &&
    mediumVolume !== null &&
    sampleVolume !== null &&
    dilutionFactor !== null &&
    intercept !== null &&
    slope !== null &&
    input.rows.length > 0 &&
    times.every((t) => t !== null) &&
    parsedReadings.every((r) => r !== null);

  if (!complete || !conversion) {
    return { fieldErrors, cellErrors, rowErrors, rowWarnings, averages, calibrationError, result: null, warnings, notes };
  }

  // ── Calculations, at full precision ──
  const ratio = sampleVolume! / mediumVolume!;
  const points: TimePointResult[] = [];
  let previousCorrected: number | null = null;

  for (let i = 0; i < input.rows.length; i++) {
    const readings = parsedReadings[i]!;
    const averageAbsorbance = averages[i]!;
    const x = concentrationFromAbsorbance(averageAbsorbance, intercept!, slope!);
    if (!x.ok) {
      // Unreachable after the b = 0 check above; kept so a NaN can never leak.
      return { fieldErrors, cellErrors, rowErrors, rowWarnings, averages, calibrationError: x.error, result: null, warnings, notes };
    }
    const concentration = x.value * dilutionFactor!;
    // Practical-sheet correction: the first sample has no earlier withdrawal;
    // after that CF = (Vs / V) × the previous CORRECTED concentration.
    const correctionFactor: number = previousCorrected === null ? 0 : ratio * previousCorrected;
    const corrected: number = concentration + correctionFactor;
    const correctedMgPerMl = corrected * conversion.factor;
    const amountMg = correctedMgPerMl * mediumVolume!;
    const percentRelease = (amountMg / labelClaim!) * 100;

    points.push({
      time: times[i]!,
      readingsText: input.rows[i].readings.map((r) => r.trim()),
      readings,
      sumAbsorbance: sum(readings),
      averageAbsorbance,
      calibrationX: x.value,
      concentration,
      previousCorrected,
      correctionFactor,
      corrected,
      correctedMgPerMl,
      amountMg,
      percentRelease,
    });
    previousCorrected = corrected;
  }

  const negativeTimes = points.filter((p) => p.concentration < 0).map((p) => num(p.time));
  if (negativeTimes.length > 0) {
    warnings.push(`Negative concentration at ${negativeTimes.join(", ")} min: the average absorbance is below the intercept a. Check the blank and the readings.`);
  }
  const overTimes = points.filter((p) => p.percentRelease > 100).map((p) => num(p.time));
  if (overTimes.length > 0) {
    warnings.push(`% drug release exceeds 100% of the label claim at ${overTimes.join(", ")} min — check readings, dilution factor and units.`);
  }
  if (dilutionFactor !== 1) {
    notes.push(
      "The dilution factor is applied at the concentration step (C = X × DF). Every later step is linear in C, so applying it after the correction would give exactly the same amounts and % release.",
    );
  }
  notes.push("Correction method: practical-sheet (previous corrected concentration). Values are rounded for display only; every step uses full precision.");

  return {
    fieldErrors,
    cellErrors,
    rowErrors,
    rowWarnings,
    averages,
    calibrationError: null,
    result: {
      text: {
        labelClaim: input.labelClaim.trim(),
        mediumVolume: input.mediumVolume.trim(),
        sampleVolume: input.sampleVolume.trim(),
        dilutionFactor: input.dilutionFactor.trim(),
        intercept: input.intercept.trim(),
        slope: input.slope.trim(),
      },
      labelClaim: labelClaim!,
      mediumVolume: mediumVolume!,
      sampleVolume: sampleVolume!,
      dilutionFactor: dilutionFactor!,
      intercept: intercept!,
      slope: slope!,
      unit: input.unit,
      ratio,
      conversion,
      readingsPerPoint: input.rows[0]?.readings.length ?? 0,
      points,
    },
    warnings,
    notes,
  };
}

/* ─── Worked steps ───────────────────────────────────────────────────────── */

export type WorkedStep = { label: string; lines: string[] };

/**
 * The worked calculation for one time point, written the way the practical
 * sheet writes it. Shared by the on-screen disclosures and the lab record.
 */
export function timePointSteps(result: DissolutionResult, index: number): WorkedStep[] {
  const p = result.points[index];
  const u = result.unit;
  const t = result.text;
  const n = p.readings.length;
  const first = p.previousCorrected === null;
  const symbols = p.readings.map((_, k) => `B${k + 1}`).join(" + ");
  const noConversion = u === "mg/mL";

  const steps: WorkedStep[] = [
    {
      label: "Average absorbance",
      lines: [
        `Average Y = (${symbols}) / ${n}`,
        // A lone reading already sits inside the brackets; only a sum needs its negatives bracketed.
        `Average Y = (${p.readingsText.map((r) => (n > 1 ? paren(r) : r)).join(" + ")}) / ${n}`,
        `Average Y = ${num(p.sumAbsorbance)} / ${n} = ${num(p.averageAbsorbance)} AU`,
      ],
    },
    {
      label: "Concentration from the calibration equation",
      lines: [
        "X = (Y − a) / b",
        `X = (${num(p.averageAbsorbance)} − ${paren(t.intercept)}) / ${paren(t.slope)}`,
        `X = ${num(p.averageAbsorbance - result.intercept)} / ${paren(t.slope)} = ${num(p.calibrationX)} ${u}`,
      ],
    },
    {
      label: "Dilution factor",
      lines:
        result.dilutionFactor === 1
          ? ["C = X × DF", `C = ${num(p.calibrationX)} × 1 = ${num(p.concentration)} ${u}  (DF = 1: measured undiluted)`]
          : ["C = X × DF", `C = ${num(p.calibrationX)} × ${t.dilutionFactor} = ${num(p.concentration)} ${u}`],
    },
    {
      label: "Correction factor",
      lines: first
        ? ["First time point: no previous withdrawal, so CF = 0", `CF = 0 ${u}`]
        : [
            "CF = (Vs / V) × previous corrected concentration",
            `CF = (${t.sampleVolume} / ${t.mediumVolume}) × ${num(p.previousCorrected!)}`,
            `CF = ${num(result.ratio)} × ${num(p.previousCorrected!)} = ${num(p.correctionFactor)} ${u}`,
          ],
    },
    {
      label: "Corrected concentration",
      lines: first
        ? ["First time point: corrected concentration = concentration", `Corrected C = ${num(p.corrected)} ${u}`]
        : [
            "Corrected C = current concentration + correction factor",
            `Corrected C = ${num(p.concentration)} + ${paren(p.correctionFactor)} = ${num(p.corrected)} ${u}`,
          ],
    },
    {
      label: "Amount dissolved",
      lines: [
        "Amount dissolved = corrected concentration × dissolution medium volume",
        noConversion
          ? "Unit: the concentration is already in mg/mL, so no conversion is needed"
          : `Unit conversion (${result.conversion.reason}): ${num(p.corrected)} ${u} ${result.conversion.factorText} = ${num(p.correctedMgPerMl)} mg/mL`,
        noConversion
          ? `Amount = ${num(p.corrected)} mg/mL × ${t.mediumVolume} mL = ${num(p.amountMg)} mg`
          : `Amount = ${num(p.corrected)} ${u} ${result.conversion.factorText} × ${t.mediumVolume} mL = ${num(p.amountMg)} mg`,
      ],
    },
    {
      label: "% Drug release",
      lines: [
        "% Drug release = (Amount dissolved / Label claim) × 100",
        `% Drug release = (${num(p.amountMg)} / ${t.labelClaim}) × 100 = ${num(p.percentRelease)} %`,
      ],
    },
  ];
  return steps;
}
