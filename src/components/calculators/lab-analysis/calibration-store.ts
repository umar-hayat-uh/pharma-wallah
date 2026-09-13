/**
 * Passing a calibration line from the Calibration Curve Calculator to the
 * tools that consume one (dissolution, cumulative release, dialysis,
 * partition coefficient).
 *
 * Two routes, because students arrive both ways:
 *  - A link from the calibration tool carries the line in the query string
 *    (`calculatorHref` + `readQuery`, MEMORY.md gotcha 38).
 *  - A student who opens the dissolution tool directly can import the last
 *    line they calculated, kept in localStorage on this device.
 *
 * Nothing is applied automatically from storage: the student presses a button
 * and sees the values land in the a and b fields, where they stay editable.
 */

import { toNumber } from "../lab-math";

export type SavedCalibration = {
  /** Intercept a (the calibration tool's c). Kept at full precision. */
  intercept: number;
  /** Slope b (the calibration tool's m). */
  slope: number;
  r2: number | null;
  /** Concentration unit of X, exactly as the student chose it. */
  unit: string;
  n: number;
  savedAt: string;
};

const STORAGE_KEY = "pw_lab_calibration_v1";

export function saveCalibration(calibration: SavedCalibration): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(calibration));
  } catch {
    // Private mode or storage disabled — the query-string hand-off still works.
  }
}

export function loadCalibration(): SavedCalibration | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SavedCalibration>;
    if (typeof parsed.intercept !== "number" || !Number.isFinite(parsed.intercept)) return null;
    if (typeof parsed.slope !== "number" || !Number.isFinite(parsed.slope)) return null;
    return {
      intercept: parsed.intercept,
      slope: parsed.slope,
      r2: typeof parsed.r2 === "number" ? parsed.r2 : null,
      unit: typeof parsed.unit === "string" ? parsed.unit : "",
      n: typeof parsed.n === "number" ? parsed.n : 0,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
    };
  } catch {
    return null;
  }
}

/** Query-string keys used by the hand-off link. */
export const CALIBRATION_QUERY = { intercept: "a", slope: "b", unit: "unit" } as const;

/** Full-precision string for a URL or a field — never a display-rounded value. */
export function precise(value: number): string {
  return String(Number(value.toPrecision(12)));
}

export function calibrationFromQuery(query: URLSearchParams): { intercept: string; slope: string; unit: string | null } | null {
  const a = query.get(CALIBRATION_QUERY.intercept);
  const b = query.get(CALIBRATION_QUERY.slope);
  if (a === null || b === null || toNumber(a) === null || toNumber(b) === null) return null;
  return { intercept: a, slope: b, unit: query.get(CALIBRATION_QUERY.unit) };
}
