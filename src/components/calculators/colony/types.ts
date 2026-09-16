/**
 * Types for the offline Colony Counter & CFU Calculator.
 *
 * Coordinates are in ORIGINAL-IMAGE pixels unless a name says otherwise. The
 * detector works on a smaller processing copy and scales its results back
 * before they reach React, so a marker, a manual colony and the exported image
 * all share one coordinate system.
 *
 * Types only — the pure modules beside this file import it with `import type`,
 * which is erased at runtime, so `node --test` can load them directly.
 */

export type Point = { x: number; y: number };

export type Circle = { x: number; y: number; r: number };

export type Box = { x: number; y: number; width: number; height: number };

export type ColonySource = "auto" | "manual";

export type Colony = {
  id: string;
  /** Centroid. */
  x: number;
  y: number;
  /** Bounding box of the detected region; a manual colony gets a small square. */
  box: Box;
  source: ColonySource;
  /** Only for detected colonies. Measured, not a confidence score. */
  area?: number;
  circularity?: number;
  /** True when watershed split this colony off a touching group. */
  split?: boolean;
};

export type RGBABuffer = { data: Uint8ClampedArray; width: number; height: number };

export type ThresholdMethod = "auto" | "otsu" | "adaptive";

/** Which colonies to look for, relative to the agar. */
export type ColonyPolarity = "auto" | "dark" | "light";

export type DetectionSettings = {
  polarity: ColonyPolarity;
  method: ThresholdMethod;
  /** 0 (fewer, stronger detections) – 100 (more permissive). */
  sensitivity: number;
  /** Colony diameter limits as fractions of the plate's diameter. */
  minDiameter: number;
  maxDiameter: number;
  /** 0–1. 0 keeps every shape. */
  minCircularity: number;
  /** 0 none – 3 strong. */
  blur: number;
  /** 0 none – 3 strong. */
  morphology: number;
  watershed: boolean;
};

export type QualityIssue =
  | "low-resolution"
  | "too-dark"
  | "too-bright"
  | "low-contrast"
  | "noisy"
  | "no-plate"
  | "large-region";

export type DetectionStep = 1 | 2 | 3 | 4;

export type DetectionResult = {
  colonies: Omit<Colony, "id">[];
  /** The plate that was analysed (detected or supplied), original pixels. */
  plate: Circle;
  plateFound: boolean;
  /** The polarity actually used — "auto" resolved. */
  polarity: "dark" | "light";
  method: "otsu" | "adaptive";
  quality: QualityIssue[];
  /** Foreground fraction of the plate, 0–1. */
  coverage: number;
  /** Regions that watershed split into more than one colony. */
  splitGroups: number;
  /** Candidates removed by the size/shape filters. */
  rejected: number;
  processingScale: number;
  ms: number;
};

/** One plate in a CFU calculation. An array of these is the future multi-plate input. */
export type PlateCount = {
  colonies: number;
  /** Dilution as a fraction: 10⁻⁴ → 0.0001. */
  dilution: number;
  volumeMl: number;
};

export type ValidationMatch = {
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  expected: number;
  detected: number;
  absoluteError: number;
  percentError: number | null;
  precision: number | null;
  recall: number | null;
  f1: number | null;
};
