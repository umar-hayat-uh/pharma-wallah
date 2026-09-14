import type { Point, Quad, Rect } from "./types";

/**
 * Coordinate systems and plane geometry for the TLC analyzer. Pure — no DOM.
 *
 * Two coordinate systems exist on screen:
 *   - image:  pixels of the working image (what every stored value uses)
 *   - screen: CSS pixels relative to the stage's top-left corner
 * related by a uniform scale and a translation:  screen = image × scale + offset.
 * Only these two functions cross between them; nothing else multiplies by the
 * zoom level.
 */

export type ViewTransform = { scale: number; offsetX: number; offsetY: number };

export const MIN_ZOOM_FACTOR = 0.5; // relative to "fit"
export const MAX_ZOOM_FACTOR = 12;

export function screenToImage(point: Point, view: ViewTransform): Point {
  return { x: (point.x - view.offsetX) / view.scale, y: (point.y - view.offsetY) / view.scale };
}

export function imageToScreen(point: Point, view: ViewTransform): Point {
  return { x: point.x * view.scale + view.offsetX, y: point.y * view.scale + view.offsetY };
}

/** The view that shows the whole image centred in the stage with a margin. */
export function fitView(imageWidth: number, imageHeight: number, stageWidth: number, stageHeight: number, margin = 16): ViewTransform {
  const availableW = Math.max(1, stageWidth - margin * 2);
  const availableH = Math.max(1, stageHeight - margin * 2);
  const scale = Math.max(1e-4, Math.min(availableW / imageWidth, availableH / imageHeight));
  return {
    scale,
    offsetX: (stageWidth - imageWidth * scale) / 2,
    offsetY: (stageHeight - imageHeight * scale) / 2,
  };
}

/** Zooms by `factor` keeping the image point under `anchor` (screen) fixed, within [fit×MIN, fit×MAX]. */
export function zoomAt(view: ViewTransform, factor: number, anchor: Point, fitScale: number): ViewTransform {
  const scale = clamp(view.scale * factor, fitScale * MIN_ZOOM_FACTOR, fitScale * MAX_ZOOM_FACTOR);
  const imagePoint = screenToImage(anchor, view);
  return { scale, offsetX: anchor.x - imagePoint.x * scale, offsetY: anchor.y - imagePoint.y * scale };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampPoint(point: Point, width: number, height: number): Point {
  return { x: clamp(point.x, 0, width), y: clamp(point.y, 0, height) };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Size of the canvas that holds a `width × height` image rotated by `degrees` without clipping. */
export function rotatedBounds(width: number, height: number, degrees: number): { width: number; height: number } {
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));
  // Round away float dust first, so 90° gives exactly h × w rather than h+1.
  return {
    width: Math.max(1, Math.ceil(round6(width * cos + height * sin))),
    height: Math.max(1, Math.ceil(round6(width * sin + height * cos))),
  };
}

function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/** Normalises a rectangle drawn in any direction and keeps it inside the image. */
export function normaliseRect(a: Point, b: Point, width: number, height: number): Rect {
  const p = clampPoint(a, width, height);
  const q = clampPoint(b, width, height);
  return { x: Math.min(p.x, q.x), y: Math.min(p.y, q.y), width: Math.abs(p.x - q.x), height: Math.abs(p.y - q.y) };
}

/**
 * Orders four arbitrary points as top-left, top-right, bottom-right, bottom-left.
 * Uses the sum/difference rule, which is exact for any convex quadrilateral that
 * is not rotated by close to 45° — true of a photographed plate.
 */
export function orderQuad(points: Point[]): Quad {
  const bySum = [...points].sort((a, b) => a.x + a.y - (b.x + b.y));
  const byDiff = [...points].sort((a, b) => a.x - a.y - (b.x - b.y));
  return [bySum[0], byDiff[byDiff.length - 1], bySum[bySum.length - 1], byDiff[0]];
}

/** True when the quad is convex and its corners run clockwise on screen (TL → TR → BR → BL). */
export function isConvexClockwise(quad: Quad): boolean {
  for (let i = 0; i < 4; i++) {
    const a = quad[i];
    const b = quad[(i + 1) % 4];
    const c = quad[(i + 2) % 4];
    const cross = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    // y points down, so a clockwise turn on screen has a positive cross product.
    if (cross <= 0) return false;
  }
  return true;
}

export function quadArea(quad: Quad): number {
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    const a = quad[i];
    const b = quad[(i + 1) % 4];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/**
 * Output size for a perspective-corrected plate: the longer of each pair of
 * opposite edges, so no direction is shrunk, capped at `maxDimension`.
 */
export function rectifiedSize(quad: Quad, maxDimension: number): { width: number; height: number } {
  const [tl, tr, br, bl] = quad;
  let width = Math.max(distance(tl, tr), distance(bl, br));
  let height = Math.max(distance(tl, bl), distance(tr, br));
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));
  return { width, height };
}

/**
 * The 3×3 homography H (row-major, h33 = 1) that maps each `from[i]` to `to[i]`.
 * Solves the standard 8-equation linear system by Gaussian elimination with
 * partial pivoting. Returns null for a degenerate quad (three corners in a line).
 *
 * This replaces OpenCV's getPerspectiveTransform: OpenCV.js is a ~9 MB file,
 * which would more than double the offline app for one 8×8 solve.
 */
export function computeHomography(from: Quad, to: Quad): number[] | null {
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = from[i];
    const { x: u, y: v } = to[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }

  const n = 8;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(A[row][col]) > Math.abs(A[pivot][col])) pivot = row;
    }
    if (Math.abs(A[pivot][col]) < 1e-10) return null;
    const swap = A[col];
    A[col] = A[pivot];
    A[pivot] = swap;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = A[row][col] / A[col][col];
      if (factor === 0) continue;
      for (let k = col; k <= n; k++) A[row][k] -= factor * A[col][k];
    }
  }

  const h: number[] = [];
  for (let i = 0; i < n; i++) h.push(A[i][n] / A[i][i]);
  h.push(1);
  return h.every(Number.isFinite) ? h : null;
}

export function applyHomography(h: number[], point: Point): Point {
  const w = h[6] * point.x + h[7] * point.y + h[8];
  return { x: (h[0] * point.x + h[1] * point.y + h[2]) / w, y: (h[3] * point.x + h[4] * point.y + h[5]) / w };
}
