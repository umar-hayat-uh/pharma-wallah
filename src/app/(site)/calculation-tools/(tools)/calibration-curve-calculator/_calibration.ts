/**
 * Calibration curve: validation and least-squares analysis of the standards
 * table, kept apart from the page so the maths can be checked on its own.
 * Pure — ships inside the offline Android app.
 */

import { toNumber } from "@/components/calculators";
import {
  concentrationFromAbsorbance,
  duplicateIndexes,
  linearFit,
  type Checked,
  type LinearFit,
  type Point,
} from "@/components/calculators/lab-analysis";

export const MIN_STANDARDS = 2;
export const MAX_STANDARDS = 10;

export type StandardCells = { conc: string; abs: string };

export type CalibrationAnalysis = {
  /** Keyed `${rowIndex}:conc` / `${rowIndex}:abs`. */
  cellErrors: Record<string, string>;
  /** Null until every standard is valid. */
  points: Point[] | null;
  fit: Checked<LinearFit> | null;
  unknownError?: string;
  unknown: { absorbance: number; concentration: Checked<number>; outsideRange: boolean } | null;
  warnings: string[];
  notes: string[];
};

export function analyseCalibration(rows: StandardCells[], unknownRaw: string, show: boolean): CalibrationAnalysis {
  const cellErrors: Record<string, string> = {};
  const warnings: string[] = [];
  const notes: string[] = [];
  const points: Point[] = [];

  rows.forEach((row, index) => {
    const x = toNumber(row.conc);
    const y = toNumber(row.abs);

    if (row.conc.trim() === "") {
      if (show) cellErrors[`${index}:conc`] = "Required.";
    } else if (x === null) cellErrors[`${index}:conc`] = "Enter a number.";
    else if (x < 0) cellErrors[`${index}:conc`] = "Concentration cannot be negative.";

    if (row.abs.trim() === "") {
      if (show) cellErrors[`${index}:abs`] = "Required.";
    } else if (y === null) cellErrors[`${index}:abs`] = "Enter a number.";

    if (x !== null && y !== null) points.push({ x, y });
  });

  const complete = points.length === rows.length && Object.keys(cellErrors).length === 0;
  const unknownValue = toNumber(unknownRaw);
  const unknownError = unknownRaw.trim() !== "" && unknownValue === null ? "Enter a number." : undefined;

  if (!complete) {
    return { cellErrors, points: null, fit: null, unknown: null, unknownError, warnings, notes };
  }

  // Data checks that do not stop the fit but must not pass silently.
  points.forEach((point, index) => {
    if (point.y < 0) warnings.push(`Standard ${index + 1} has a negative absorbance (${point.y}). Check the blank correction.`);
  });
  const pairKeys = points.map((p) => `${p.x}|${p.y}`);
  duplicateIndexes(pairKeys.map((key) => pairKeys.indexOf(key))).forEach((index) => {
    warnings.push(`Standard ${index + 1} repeats an earlier standard exactly (same concentration and absorbance) — check for a copied row.`);
  });
  const repeatedX = duplicateIndexes(points.map((p) => p.x)).filter((index) => !pairKeys.slice(0, index).includes(pairKeys[index]));
  if (repeatedX.length > 0) {
    notes.push(
      `Standard${repeatedX.length > 1 ? "s" : ""} ${repeatedX.map((i) => i + 1).join(", ")} share a concentration with an earlier standard. Each reading is fitted as its own point (replicate standards).`,
    );
  }

  const fit = linearFit(points);
  if (fit.ok) {
    if (fit.value.r2 === null) {
      warnings.push("Every absorbance is identical, so SST = Σ(y − ȳ)² = 0 and R² cannot be calculated.");
    }
    if (fit.value.slope < 0) warnings.push("The slope is negative — absorbance falls as concentration rises. Check that X and Y are not swapped.");
    if (points.length === 2) notes.push("With only two standards the line passes through both points exactly, so SSE = 0 and R² = 1 by construction. Use at least 5 standards in a practical.");
  }

  let unknown: CalibrationAnalysis["unknown"] = null;
  if (fit.ok && unknownValue !== null) {
    const { slope, intercept, xMin, xMax } = fit.value;
    const concentration =
      slope === 0
        ? ({ ok: false, error: "The slope m is 0, so X = (Y − c) / m would divide by zero." } as const)
        : concentrationFromAbsorbance(unknownValue, intercept, slope);
    const outsideRange = concentration.ok && (concentration.value < xMin || concentration.value > xMax);
    if (concentration.ok && outsideRange) {
      warnings.push("The unknown lies outside the range of the standards. The result is an extrapolation — dilute or concentrate the sample so it falls within the curve.");
    }
    if (concentration.ok && concentration.value < 0) {
      warnings.push("The calculated unknown concentration is negative: its absorbance is below the intercept.");
    }
    unknown = { absorbance: unknownValue, concentration, outsideRange };
  }

  return { cellErrors, points, fit, unknown, unknownError, warnings, notes };
}
