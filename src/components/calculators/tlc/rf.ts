import type { PlateAnalysis, RfInput, RfResult, RfRow, TLCSpot } from "./types";

/**
 * Rf maths for the TLC analyzer. Pure: no React, no DOM, no runtime imports —
 * exercised directly by `node --test scripts/tlc-rf.test.mts`.
 *
 *   Rf = distance travelled by the compound ÷ distance travelled by the solvent front
 *
 * Both distances are measured from the baseline in working-image pixels. Pixels
 * are a perfectly good unit: Rf is a ratio, so the unit cancels, and a physical
 * calibration is only needed to *report* distances in cm.
 *
 * Image y grows downwards and a plate is developed upwards, so the solvent front
 * sits at a smaller y than the baseline.
 */

/** Below this separation a one-pixel placement error moves Rf by more than ~3%. */
export const SHORT_RUN_PX = 30;

const EPSILON = 1e-9;

export const RANGE_WARNING = "Check the spot and solvent-front positions.";

function isNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Rf for one spot.
 *
 * `compoundDistance` and `solventDistance` are absolute distances, as they
 * would be read off a ruler. `rf` itself is signed along the direction of
 * development — (baseline − spot) ÷ (baseline − front) — so a spot marked
 * below the baseline gives a negative Rf instead of silently looking like a
 * real one. With the lines the right way round and the spot between them, the
 * two definitions agree exactly.
 *
 * `valid` means "trustworthy": false for a missing or inverted line (no Rf)
 * and for an Rf outside 0–1 (Rf still returned, so the student can see what is
 * wrong, together with a warning).
 */
export function calculateRf({ baselineY, solventFrontY, spotY }: RfInput): RfResult {
  if (!isNumber(baselineY)) {
    return { compoundDistance: 0, solventDistance: 0, rf: null, valid: false, error: "Set the baseline (origin line)." };
  }
  if (!isNumber(solventFrontY)) {
    return {
      compoundDistance: Math.abs(baselineY - spotY),
      solventDistance: 0,
      rf: null,
      valid: false,
      error: "Set the solvent front.",
    };
  }

  const compoundDistance = Math.abs(baselineY - spotY);
  const solventDistance = Math.abs(baselineY - solventFrontY);

  if (!(solventDistance > 0)) {
    return { compoundDistance, solventDistance, rf: null, valid: false, error: "Please set a valid solvent front." };
  }
  if (solventFrontY > baselineY) {
    return {
      compoundDistance,
      solventDistance,
      rf: null,
      valid: false,
      error:
        "The solvent front is below the baseline. Move the lines, or rotate the image 180° if the plate is upside down.",
    };
  }

  const rf = (baselineY - spotY) / (baselineY - solventFrontY);

  if (rf > 1 + EPSILON) {
    return {
      compoundDistance,
      solventDistance,
      rf,
      valid: false,
      warning: `This spot is beyond the solvent front. ${RANGE_WARNING}`,
    };
  }
  if (rf < -EPSILON) {
    return {
      compoundDistance,
      solventDistance,
      rf,
      valid: false,
      warning: `This spot is below the baseline. ${RANGE_WARNING}`,
    };
  }

  // Clamp the float dust either side of the bounds so an on-the-line spot reads 0 or 1, not -0.
  return { compoundDistance, solventDistance, rf: Math.min(1, Math.max(0, rf)), valid: true };
}

/** Parses the optional "known solvent-front distance" in cm. Blank is not an error. */
export function parseCalibrationCm(raw: string): { value: number | null; error?: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null };
  if (!/^[+]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(trimmed)) return { value: null, error: "Enter a number." };
  const value = Number(trimmed);
  if (!Number.isFinite(value)) return { value: null, error: "Enter a number." };
  if (value <= 0) return { value: null, error: "Must be greater than zero." };
  if (value > 100) return { value: null, error: "A TLC run longer than 100 cm is not plausible." };
  return { value };
}

/** Pixels per cm from the solvent-front distance in pixels and the same distance measured in cm. */
export function pixelsPerCm(solventDistancePx: number, knownCm: number): number | null {
  if (!(solventDistancePx > 0) || !(knownCm > 0)) return null;
  return solventDistancePx / knownCm;
}

/**
 * The whole plate: plate-level errors and warnings, plus one row per accepted
 * spot. Rows keep each spot's position in the full list, so "Spot 3" in the
 * table is the marker numbered 3 on the image even when spot 2 is unconfirmed.
 */
export function analyzePlate({
  baselineY,
  solventFrontY,
  spots,
  calibrationCm,
}: {
  baselineY: number | null;
  solventFrontY: number | null;
  spots: TLCSpot[];
  calibrationCm?: number | null;
}): PlateAnalysis {
  const errors: string[] = [];
  const warnings: string[] = [];

  const probe = calculateRf({ baselineY, solventFrontY, spotY: baselineY ?? 0 });
  if (probe.error) errors.push(probe.error);

  const linesOk = !probe.error;
  const solventDistancePx = linesOk ? probe.solventDistance : null;
  const ppc = solventDistancePx !== null && calibrationCm ? pixelsPerCm(solventDistancePx, calibrationCm) : null;

  if (solventDistancePx !== null && solventDistancePx < SHORT_RUN_PX) {
    warnings.push(
      `The baseline and solvent front are only ${Math.round(solventDistancePx)} px apart. Zoom in and place them precisely — at this size a one-pixel error changes Rf noticeably.`,
    );
  }

  const rows: RfRow[] = [];
  spots.forEach((spot, index) => {
    if (!spot.accepted) return;
    const result = calculateRf({ baselineY, solventFrontY, spotY: spot.y });
    rows.push({
      spot,
      index,
      result,
      distanceCm: ppc !== null && linesOk ? result.compoundDistance / ppc : null,
    });
  });

  const outOfRange = rows.filter((row) => row.result.warning).length;
  if (outOfRange > 0) {
    warnings.push(
      `${outOfRange === 1 ? "One spot is" : `${outOfRange} spots are`} outside Rf 0–1. ${RANGE_WARNING}`,
    );
  }

  return { errors, warnings, solventDistancePx, pixelsPerCm: ppc, rows };
}

/** Rf to fixed decimals, never "-0.00". */
export function formatRf(rf: number | null, decimals: 2 | 3 = 2): string {
  if (rf === null || !Number.isFinite(rf)) return "—";
  const text = rf.toFixed(decimals);
  return Number(text) === 0 ? (0).toFixed(decimals) : text;
}

/** Pixel distances are shown whole: a centroid's sub-pixel digits are noise. The Rf uses the unrounded value. */
export function formatPx(px: number | null): string {
  if (px === null || !Number.isFinite(px)) return "—";
  return `${Math.round(px)} px`;
}

export function formatCm(cm: number | null): string {
  if (cm === null || !Number.isFinite(cm)) return "—";
  const text = cm.toFixed(2);
  return `${Number(text) === 0 ? "0.00" : text} cm`;
}

/** The plain-language band the distance-entry calculator has always shown. */
export function describeRf(rf: number): string {
  if (rf < 0.1) return "Very polar – strongly retained";
  if (rf < 0.3) return "Polar – good for separation";
  if (rf < 0.7) return "Medium polarity – typical range";
  if (rf < 0.9) return "Non‑polar – fast moving";
  return "Very non‑polar – near solvent front";
}
