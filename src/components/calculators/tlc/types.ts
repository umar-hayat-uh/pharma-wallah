/**
 * Types for the offline TLC Rf Analyzer.
 *
 * Every coordinate in these types is in WORKING-IMAGE pixels — the image after
 * rotation, crop or perspective correction — never in CSS/screen pixels. The
 * stage converts pointer positions with `screenToImage` before anything is
 * stored, so zooming or resizing the view can never change an Rf value.
 *
 * This file holds types only. The pure modules beside it (`rf.ts`,
 * `geometry.ts`, `spots.ts`, `plate.ts`) import from it with `import type`,
 * which is erased at runtime — that is what lets `node --test` run them
 * directly (scripts/tlc-rf.test.mts) without a bundler or a test framework.
 */

export type Point = { x: number; y: number };

/** Four plate corners, always ordered top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Point, Point, Point, Point];

export type Rect = { x: number; y: number; width: number; height: number };

export type TLCSpot = {
  id: string;
  name: string;
  x: number;
  y: number;
  /** 0–1, only for spots found by automatic detection. */
  confidence?: number;
  /**
   * Included in the results. Detected spots start unconfirmed — detection is a
   * suggestion, and only the student's confirmed positions produce an Rf.
   * Spots placed or moved by hand are accepted.
   */
  accepted: boolean;
  /** Approximate radius in working-image pixels, for drawing the detected outline. */
  radius?: number;
  source: "auto" | "manual";
};

/** Pixel-level input for the pure detectors: RGBA, row-major, like ImageData. */
export type PixelBuffer = { data: Uint8ClampedArray; width: number; height: number };

/**
 * Which spots to look for. Iodine, ninhydrin, dragendorff and visible dyes are
 * darker or coloured against the plate; UV-fluorescent spots on a dark UV photo
 * are lighter. "any" catches both at the cost of more false positives.
 */
export type SpotPolarity = "dark" | "light" | "any";

export type DetectionOptions = {
  /** 0 (only strong spots) – 100 (faint spots too). */
  sensitivity: number;
  polarity: SpotPolarity;
  /** Upper bound on the spots returned, strongest first. */
  maxSpots?: number;
};

export type DetectedSpot = {
  x: number;
  y: number;
  radius: number;
  area: number;
  confidence: number;
};

export type DetectionResult = {
  spots: DetectedSpot[];
  /** Pixel-space scale used internally, reported for the record. */
  processedWidth: number;
  processedHeight: number;
};

export type RfInput = {
  baselineY: number | null | undefined;
  solventFrontY: number | null | undefined;
  spotY: number;
};

export type RfResult = {
  /** |baseline − spot|, in the same unit as the inputs. */
  compoundDistance: number;
  /** |baseline − solvent front|. */
  solventDistance: number;
  /**
   * Signed along the direction of development: negative when the spot sits
   * below the baseline, above 1 when it is past the front. `null` only when the
   * lines themselves make a ratio meaningless (missing, or zero distance).
   */
  rf: number | null;
  valid: boolean;
  /** Why no Rf could be calculated. */
  error?: string;
  /** Rf was calculated but should be checked. */
  warning?: string;
};

export type RfRow = {
  spot: TLCSpot;
  index: number;
  result: RfResult;
  /** Compound distance in cm, when a physical calibration is set. */
  distanceCm: number | null;
};

export type PlateAnalysis = {
  /** Errors that stop every Rf (missing or inverted lines). */
  errors: string[];
  /** Per-plate cautions (short run, spots out of range). */
  warnings: string[];
  solventDistancePx: number | null;
  pixelsPerCm: number | null;
  rows: RfRow[];
};

/** Everything a saved analysis needs to reopen, stored only on the device. */
export type SavedAnalysis = {
  id: string;
  name: string;
  createdAt: number;
  width: number;
  height: number;
  baselineY: number | null;
  solventFrontY: number | null;
  spots: TLCSpot[];
  calibrationCm: string;
  decimals: 2 | 3;
  /** JPEG of the working (corrected) plate. */
  image: Blob;
  /** Small JPEG data URL for the list. */
  thumbnail: string;
};

export type TLCPreferences = {
  decimals: 2 | 3;
  sensitivity: number;
  polarity: SpotPolarity;
};
