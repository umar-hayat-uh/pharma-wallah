// ============================================================
// PharmaWallah — Disk Diffusion Lab: the simulation model
// ============================================================
//
// Pure functions only. Nothing here imports React or touches the DOM, so the
// experiment's behaviour is separable from how it is drawn — and every number
// the student sees can be traced back to one of these.
//
// This is an EDUCATIONAL model. It reproduces the direction and rough size of
// the effects a student needs to understand (inoculum density, agar depth,
// lawn uniformity, disk spacing) from a table of base zone diameters. It is
// not a pharmacodynamic model and it is not clinically validated.

import {
  ANTIBIOTIC_BY_ID,
  DISK_DIAMETER_MM,
  EDGE_MARGIN_MM,
  INTERPRETATION_SYSTEMS,
  MIN_DISK_SPACING_MM,
  PLATE_RADIUS_MM,
} from "./data";
import type {
  AgarDepth,
  DiskPlacement,
  InterpretationCategory,
  InterpretationSystem,
  Organism,
  TurbidityBand,
  ZoneCriteria,
} from "./types";

// ─── Deterministic pseudo-randomness ────────────────────────

/**
 * A 32-bit string hash (FNV-1a) turned into a number in [0, 1).
 *
 * The experiment needs variation — two runs of the same plate should not give
 * byte-identical millimetres — but it must also be reproducible, so a student
 * who re-measures gets the same zone and a teacher can reproduce a result from
 * its seed. Hashing (seed + organism + antibiotic) gives both.
 */
export function seededUnit(key: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // >>> 0 first so the sign bit does not make the ratio negative.
  return ((h >>> 0) % 100000) / 100000;
}

/** A fresh seed for one experiment. */
export function newExperimentSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Condition factors ──────────────────────────────────────

/**
 * Inoculum density. More organisms in the path of the diffusing drug means
 * growth reaches closer to the disk, so a heavy suspension shrinks the zone
 * and a light one inflates it. The direction is the lesson; the magnitude is
 * chosen to be visible rather than measured.
 */
export function inoculumFactor(turbidity: TurbidityBand): number {
  if (turbidity === "heavy") return 0.88;
  if (turbidity === "light") return 1.1;
  return 1;
}

/**
 * Agar depth. The drug diffuses in three dimensions: a thin layer lets it
 * spread further sideways (falsely large zones), a thick one holds it back.
 */
export function agarDepthFactor(depth: AgarDepth): number {
  if (depth === "thin") return 1.07;
  if (depth === "thick") return 0.93;
  return 1;
}

/**
 * Lawn uniformity, expressed as the fraction of the agar surface the swab
 * actually covered. A patchy lawn does not produce a crisp circular edge, so
 * the apparent zone reads larger and less reliably the worse the coverage is.
 */
export function coverageFactor(coverage: number): number {
  if (coverage >= 0.85) return 1;
  return 1 + (0.85 - Math.max(0, coverage)) * 0.3;
}

export interface ZoneConditions {
  turbidity: TurbidityBand;
  agarDepth: AgarDepth;
  /** 0–1 fraction of the agar surface covered by the swab. */
  coverage: number;
  seed: string;
}

/**
 * The inhibition-zone diameter this plate would show for one antibiotic, in
 * whole millimetres.
 *
 * A base value of 0 means the organism is not inhibited at all: the result is
 * the 6 mm disk itself, and no amount of technique variation invents a zone.
 */
export function computeZone(
  organism: Organism,
  antibioticId: string,
  conditions: ZoneConditions,
): number {
  const base = organism.baseZones[antibioticId] ?? 0;
  if (base <= 0) return DISK_DIAMETER_MM;

  const antibiotic = ANTIBIOTIC_BY_ID[antibioticId];
  const variability = antibiotic?.variability ?? 1;
  const jitter =
    (seededUnit(`${conditions.seed}:${organism.id}:${antibioticId}`) - 0.5) *
    2 *
    variability;

  const value =
    base *
      inoculumFactor(conditions.turbidity) *
      agarDepthFactor(conditions.agarDepth) *
      coverageFactor(conditions.coverage) +
    jitter;

  // Never smaller than the disk, never larger than fits on a 90 mm plate.
  return Math.round(Math.min(PLATE_RADIUS_MM - 3, Math.max(DISK_DIAMETER_MM, value)));
}

// ─── Interpretation ─────────────────────────────────────────

export interface Interpretation {
  category: InterpretationCategory;
  /** The words to print — they differ between interpretation systems. */
  label: string;
  /** The thresholds used, or null when the pair has no criteria. */
  criteria: ZoneCriteria | null;
  system: InterpretationSystem;
}

export function getInterpretationSystem(id: string): InterpretationSystem {
  return (
    INTERPRETATION_SYSTEMS.find((s) => s.id === id) ?? INTERPRETATION_SYSTEMS[0]
  );
}

/**
 * Turn a measured diameter into a reportable category.
 *
 * "NI" — no interpretive criteria — is a real and important answer, not an
 * error state. Several organism/agent pairs simply cannot be read by disk
 * diffusion, and the lab says so rather than inventing a threshold.
 */
export function interpretZone(
  systemId: string,
  antibioticId: string,
  organism: Organism,
  diameterMm: number,
): Interpretation {
  const system = getInterpretationSystem(systemId);
  const criteria = system.criteria[antibioticId]?.[organism.group] ?? null;

  if (!criteria) {
    return { category: "NI", label: "No interpretive criteria", criteria: null, system };
  }
  if (diameterMm >= criteria.susceptible) {
    return { category: "S", label: system.categoryLabels.S, criteria, system };
  }
  if (diameterMm <= criteria.resistant) {
    return { category: "R", label: system.categoryLabels.R, criteria, system };
  }
  return { category: "I", label: system.categoryLabels.I, criteria, system };
}

// ─── Disk placement rules ───────────────────────────────────

export type PlacementProblem = "off-agar" | "too-close-to-edge" | "too-close" | "occupied";

export interface PlacementCheck {
  ok: boolean;
  problem?: PlacementProblem;
  /** The disk that the candidate clashes with, when that is the problem. */
  conflictId?: string;
  /** Centre-to-centre distance to the nearest neighbour, in mm. */
  nearestMm?: number;
}

/**
 * Is this a legal spot for a disk?
 *
 * Both rules exist for the same reason — a zone must be a complete, separate
 * circle to be measurable. Too near the rim and the zone runs off the agar;
 * too near a neighbour and the two merge.
 */
export function checkPlacement(
  candidate: { x: number; y: number },
  existing: DiskPlacement[],
  ignoreId?: string,
): PlacementCheck {
  const radial = Math.hypot(candidate.x, candidate.y);
  if (radial > PLATE_RADIUS_MM) return { ok: false, problem: "off-agar" };
  if (radial > PLATE_RADIUS_MM - EDGE_MARGIN_MM) {
    return { ok: false, problem: "too-close-to-edge" };
  }

  let nearest = Number.POSITIVE_INFINITY;
  let conflictId: string | undefined;
  for (const disk of existing) {
    if (disk.antibioticId === ignoreId) continue;
    const d = Math.hypot(candidate.x - disk.x, candidate.y - disk.y);
    if (d < nearest) {
      nearest = d;
      conflictId = disk.antibioticId;
    }
  }
  if (nearest < MIN_DISK_SPACING_MM) {
    return { ok: false, problem: "too-close", conflictId, nearestMm: nearest };
  }
  return { ok: true, nearestMm: Number.isFinite(nearest) ? nearest : undefined };
}

/**
 * Evenly spaced positions for `count` disks on the plate — used by the
 * "arrange for me" helper and as the starting layout in practice mode.
 * The radius is the midpoint between the centre and the edge margin, which
 * keeps every pair comfortably past the minimum spacing up to six disks.
 */
export function defaultDiskLayout(count: number): { x: number; y: number }[] {
  if (count <= 1) return [{ x: 0, y: 0 }];
  const r = (PLATE_RADIUS_MM - EDGE_MARGIN_MM) * 0.82;
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
  });
}

// ─── Lawn coverage ──────────────────────────────────────────

/** How finely the swab's path is tracked across the plate. */
export const COVERAGE_GRID = 16;

export interface CoverageReport {
  /** 0–1 fraction of the agar cells the swab touched. */
  fraction: number;
  /** How many distinct streak orientations were used (the target is 3). */
  orientations: number;
  /** Was the rim pass done? */
  rimPass: boolean;
  uniform: boolean;
}

/**
 * Score the lawn from the cells the swab actually touched.
 *
 * Coverage alone is not enough: a student can scrub one half of the plate to
 * 60% and stop. Three orientations plus a rim pass is the technique being
 * taught, so all three are reported and `uniform` requires all three.
 */
export function evaluateCoverage(
  covered: Set<number>,
  orientations: Set<number>,
  rimPass: boolean,
): CoverageReport {
  let inPlate = 0;
  for (let row = 0; row < COVERAGE_GRID; row += 1) {
    for (let col = 0; col < COVERAGE_GRID; col += 1) {
      if (isCoverageCellOnPlate(row, col)) inPlate += 1;
    }
  }
  const fraction = inPlate === 0 ? 0 : covered.size / inPlate;
  return {
    fraction,
    orientations: orientations.size,
    rimPass,
    uniform: fraction >= 0.85 && orientations.size >= 3 && rimPass,
  };
}

/** Is a coverage cell inside the circular agar surface? */
export function isCoverageCellOnPlate(row: number, col: number): boolean {
  const cell = 2 / COVERAGE_GRID;
  const x = -1 + (col + 0.5) * cell;
  const y = -1 + (row + 0.5) * cell;
  return Math.hypot(x, y) <= 0.97;
}

/** Bucket a stroke's direction into one of three 60° orientations. */
export function orientationBucket(dx: number, dy: number): number {
  const deg = ((Math.atan2(dy, dx) * 180) / Math.PI + 180) % 180;
  return Math.floor(deg / 60);
}

// ─── Measurement quality ────────────────────────────────────

/** How far off-centre a caliper line may sit and still be a diameter, in mm. */
export const CENTRE_TOLERANCE_MM = 2.5;
/** Reading within this of the true value is treated as correct. */
export const MEASUREMENT_TOLERANCE_MM = 2;

export interface MeasurementCheck {
  errorMm: number;
  throughCentre: boolean;
  accurate: boolean;
}

/**
 * Compare a student's caliper reading with the plate's true zone.
 *
 * The line's perpendicular distance from the disk centre is checked as well as
 * the length: measuring a chord instead of the diameter is the mistake this
 * catches, and it reads short without looking obviously wrong.
 */
export function checkMeasurement(
  a: { x: number; y: number },
  b: { x: number; y: number },
  centre: { x: number; y: number },
  trueDiameter: number,
): MeasurementCheck {
  const recorded = Math.hypot(b.x - a.x, b.y - a.y);
  const lineLength = recorded || 1;
  // Perpendicular distance from the disk centre to the line through a and b.
  const offCentre =
    Math.abs(
      (b.x - a.x) * (a.y - centre.y) - (a.x - centre.x) * (b.y - a.y),
    ) / lineLength;
  const errorMm = Math.abs(recorded - trueDiameter);
  const throughCentre = offCentre <= CENTRE_TOLERANCE_MM;
  return {
    errorMm,
    throughCentre,
    accurate: throughCentre && errorMm <= MEASUREMENT_TOLERANCE_MM,
  };
}

// ─── Technique score ────────────────────────────────────────

export interface TechniqueInput {
  turbidity: TurbidityBand;
  agarDepth: AgarDepth;
  coverage: CoverageReport;
  diskCount: number;
  spacingViolations: number;
  measurements: { errorMm: number; throughCentre: boolean }[];
  expectedMeasurements: number;
}

export interface TechniqueScore {
  /** 0–100. Procedure, not marks for the "right" answer. */
  percent: number;
  parts: { label: string; earned: number; possible: number; note: string }[];
}

/**
 * Score the *technique*, never the organism's susceptibility pattern — a
 * resistant isolate is a correct result, not a failure. Each part explains
 * itself so the completion screen can teach rather than just grade.
 */
export function scoreTechnique(input: TechniqueInput): TechniqueScore {
  const parts: TechniqueScore["parts"] = [];

  parts.push({
    label: "Inoculum standardised",
    earned: input.turbidity === "standard" ? 20 : 8,
    possible: 20,
    note:
      input.turbidity === "standard"
        ? "Matched to the turbidity standard before swabbing."
        : `Swabbed a ${input.turbidity} suspension — the zones on this plate are ${input.turbidity === "heavy" ? "smaller" : "larger"} than a standardised inoculum would give.`,
  });

  parts.push({
    label: "Agar depth",
    earned: input.agarDepth === "standard" ? 10 : 4,
    possible: 10,
    note:
      input.agarDepth === "standard"
        ? "Poured to an even 4 mm."
        : `Poured ${input.agarDepth} — diffusion, and so the zones, shifted with it.`,
  });

  const coverEarned = input.coverage.uniform
    ? 25
    : Math.round(Math.min(0.85, input.coverage.fraction) / 0.85 * 18);
  parts.push({
    label: "Confluent lawn",
    earned: coverEarned,
    possible: 25,
    note: input.coverage.uniform
      ? "Even lawn from three orientations plus a rim pass."
      : `${Math.round(input.coverage.fraction * 100)}% of the surface covered across ${input.coverage.orientations} of 3 orientations${input.coverage.rimPass ? "" : ", rim not swabbed"}.`,
  });

  const spacingEarned = Math.max(0, 20 - input.spacingViolations * 5);
  parts.push({
    label: "Disk placement",
    earned: input.diskCount >= 4 ? spacingEarned : Math.round(spacingEarned / 2),
    possible: 20,
    note:
      input.spacingViolations === 0
        ? `${input.diskCount} disks placed, all correctly spaced.`
        : `${input.spacingViolations} placement${input.spacingViolations === 1 ? "" : "s"} rejected for spacing or edge distance.`,
  });

  const good = input.measurements.filter(
    (m) => m.throughCentre && m.errorMm <= MEASUREMENT_TOLERANCE_MM,
  ).length;
  const expected = Math.max(1, input.expectedMeasurements);
  parts.push({
    label: "Zone measurement",
    earned: Math.round((good / expected) * 25),
    possible: 25,
    note: `${good} of ${input.expectedMeasurements} zones measured within ${MEASUREMENT_TOLERANCE_MM} mm, through the disk centre.`,
  });

  const earned = parts.reduce((s, p) => s + p.earned, 0);
  const possible = parts.reduce((s, p) => s + p.possible, 0);
  return { percent: Math.round((earned / possible) * 100), parts };
}

/**
 * The coverage cells a full sweep at `angleDeg` would touch.
 *
 * This is the keyboard and touch alternative to dragging the swab: it paints
 * the same cells a complete pass in that orientation would, so a student who
 * cannot drag still performs — and is scored on — the same three-orientation
 * technique.
 */
export function sweepCells(angleDeg: number): number[] {
  const rad = (angleDeg * Math.PI) / 180;
  const cells = new Set<number>();
  // Walk a dense grid of points and rotate each into the sweep's frame; a point
  // is on a streak when it falls within a band of the parallel lines.
  const step = 0.02;
  for (let u = -1; u <= 1; u += step) {
    for (let v = -1; v <= 1; v += step) {
      if (Math.hypot(u, v) > 0.97) continue;
      // Distance across the streak direction, banded so the passes are stripes.
      const across = -u * Math.sin(rad) + v * Math.cos(rad);
      const band = (across + 1) / 0.115;
      if (band % 1 > 0.62) continue;
      const col = Math.min(COVERAGE_GRID - 1, Math.floor(((u + 1) / 2) * COVERAGE_GRID));
      const row = Math.min(COVERAGE_GRID - 1, Math.floor(((v + 1) / 2) * COVERAGE_GRID));
      if (isCoverageCellOnPlate(row, col)) cells.add(row * COVERAGE_GRID + col);
    }
  }
  return Array.from(cells);
}

/** The ring of cells the rim pass picks up. */
export function rimCells(): number[] {
  const cells: number[] = [];
  for (let row = 0; row < COVERAGE_GRID; row += 1) {
    for (let col = 0; col < COVERAGE_GRID; col += 1) {
      if (!isCoverageCellOnPlate(row, col)) continue;
      const cell = 2 / COVERAGE_GRID;
      const x = -1 + (col + 0.5) * cell;
      const y = -1 + (row + 0.5) * cell;
      if (Math.hypot(x, y) > 0.72) cells.push(row * COVERAGE_GRID + col);
    }
  }
  return cells;
}

/** Cells under a swab of radius `radiusMm` centred at a point, in mm space. */
export function cellsUnderSwab(x: number, y: number, radiusMm: number): number[] {
  const cells: number[] = [];
  const unitX = x / PLATE_RADIUS_MM;
  const unitY = y / PLATE_RADIUS_MM;
  const unitR = radiusMm / PLATE_RADIUS_MM;
  const span = Math.ceil((unitR * COVERAGE_GRID) / 2) + 1;
  const centreCol = Math.floor(((unitX + 1) / 2) * COVERAGE_GRID);
  const centreRow = Math.floor(((unitY + 1) / 2) * COVERAGE_GRID);
  for (let row = centreRow - span; row <= centreRow + span; row += 1) {
    for (let col = centreCol - span; col <= centreCol + span; col += 1) {
      if (row < 0 || col < 0 || row >= COVERAGE_GRID || col >= COVERAGE_GRID) continue;
      if (!isCoverageCellOnPlate(row, col)) continue;
      const cell = 2 / COVERAGE_GRID;
      const cx = -1 + (col + 0.5) * cell;
      const cy = -1 + (row + 0.5) * cell;
      if (Math.hypot(cx - unitX, cy - unitY) <= unitR) cells.push(row * COVERAGE_GRID + col);
    }
  }
  return cells;
}
