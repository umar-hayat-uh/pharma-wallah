import type { PixelBuffer, Point, Quad } from "./types";

/**
 * Optional automatic plate finding. Pure — no DOM, no runtime imports.
 *
 * A silica or cellulose plate is usually the largest bright, near-rectangular
 * region in a photo taken on a bench. So: luminance → Otsu threshold → the
 * largest connected region of the brighter class (then the darker class, for a
 * plate photographed on white paper) → its four extreme corners → accept only
 * if the region really is a convex quadrilateral that it mostly fills.
 *
 * Anything doubtful returns null and the student crops by hand. It is never a
 * required step.
 */

export type PlateDetection = { quad: Quad; confidence: number };

/** The detector works on a small copy; plate outlines need no detail. */
export const PLATE_MAX_DIMENSION = 420;

function otsu(values: Uint8Array, valid: Uint8Array): { threshold: number; separability: number } {
  const hist = new Float64Array(256);
  let n = 0;
  for (let i = 0; i < values.length; i++) {
    if (!valid[i]) continue;
    hist[values[i]]++;
    n++;
  }
  if (n === 0) return { threshold: 128, separability: 0 };
  let sumAll = 0;
  let sqAll = 0;
  for (let t = 0; t < 256; t++) {
    sumAll += t * hist[t];
    sqAll += t * t * hist[t];
  }
  const mean = sumAll / n;
  const totalVariance = sqAll / n - mean * mean;
  let wB = 0;
  let sumB = 0;
  let best = 0;
  let threshold = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = n - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;
    const between = (wB / n) * (wF / n) * (mB - mF) * (mB - mF);
    if (between > best) {
      best = between;
      threshold = t;
    }
  }
  return { threshold, separability: totalVariance > 0 ? best / totalVariance : 0 };
}

/** Largest 4-connected region of `mask`; returns its pixel indices. */
function largestRegion(mask: Uint8Array, width: number): Int32Array {
  const seen = new Uint8Array(mask.length);
  const stack = new Int32Array(mask.length);
  let best = new Int32Array(0);
  const region = new Int32Array(mask.length);
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    let top = 0;
    let size = 0;
    stack[top++] = start;
    seen[start] = 1;
    while (top > 0) {
      const i = stack[--top];
      region[size++] = i;
      const x = i % width;
      const neighbours = [x > 0 ? i - 1 : -1, x < width - 1 ? i + 1 : -1, i - width, i + width];
      for (let k = 0; k < 4; k++) {
        const j = neighbours[k];
        if (j < 0 || j >= mask.length || !mask[j] || seen[j]) continue;
        seen[j] = 1;
        stack[top++] = j;
      }
    }
    if (size > best.length) best = region.slice(0, size);
  }
  return best;
}

function candidate(mask: Uint8Array, width: number, height: number): PlateDetection | null {
  const N = width * height;
  const region = largestRegion(mask, width);
  const fraction = region.length / N;
  if (fraction < 0.06 || fraction > 0.97) return null;

  let tl: Point = { x: 0, y: 0 };
  let tr: Point = { x: 0, y: 0 };
  let br: Point = { x: 0, y: 0 };
  let bl: Point = { x: 0, y: 0 };
  let minSum = Infinity;
  let maxSum = -Infinity;
  let minDiff = Infinity;
  let maxDiff = -Infinity;
  let touchLeft = false;
  let touchRight = false;
  let touchTop = false;
  let touchBottom = false;
  for (let k = 0; k < region.length; k++) {
    const i = region[k];
    const x = i % width;
    const y = (i - x) / width;
    const sum = x + y;
    const diff = x - y;
    if (sum < minSum) {
      minSum = sum;
      tl = { x, y };
    }
    if (sum > maxSum) {
      maxSum = sum;
      br = { x: x + 1, y: y + 1 };
    }
    if (diff > maxDiff) {
      maxDiff = diff;
      tr = { x: x + 1, y };
    }
    if (diff < minDiff) {
      minDiff = diff;
      bl = { x, y: y + 1 };
    }
    if (x === 0) touchLeft = true;
    if (y === 0) touchTop = true;
    if (x === width - 1) touchRight = true;
    if (y === height - 1) touchBottom = true;
  }
  const borderTouches = [touchLeft, touchRight, touchTop, touchBottom].filter(Boolean).length;
  // A region touching three or four edges is the background, not a plate lying on it.
  if (borderTouches >= 3) return null;

  const quad: Quad = [tl, tr, br, bl];
  if (!convexClockwise(quad)) return null;
  const area = polygonArea(quad);
  if (area < N * 0.05) return null;
  const fill = region.length / area;
  if (fill < 0.86 || fill > 1.08) return null;

  return { quad, confidence: Math.min(1, Math.max(0, (fill - 0.86) / 0.12)) };
}

function convexClockwise(quad: Quad): boolean {
  for (let i = 0; i < 4; i++) {
    const a = quad[i];
    const b = quad[(i + 1) % 4];
    const c = quad[(i + 2) % 4];
    if ((b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x) <= 0) return false;
  }
  return true;
}

function polygonArea(quad: Quad): number {
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    const a = quad[i];
    const b = quad[(i + 1) % 4];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

/**
 * Finds the plate in a (small) pixel buffer. The returned quad is in that
 * buffer's pixels, inset by 1% towards its centre so the crop does not keep a
 * sliver of bench along the edge.
 */
export function detectPlate(buffer: PixelBuffer): PlateDetection | null {
  const { width, height, data } = buffer;
  const N = width * height;
  if (width < 24 || height < 24) return null;

  const lum = new Uint8Array(N);
  const valid = new Uint8Array(N);
  for (let i = 0, p = 0; i < N; i++, p += 4) {
    lum[i] = Math.round(0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]);
    valid[i] = data[p + 3] > 200 ? 1 : 0;
  }
  const { threshold, separability } = otsu(lum, valid);
  // Poorly separated histograms (a plate filling the frame, a busy background) are not guessed at.
  if (separability < 0.45) return null;

  const results: PlateDetection[] = [];
  for (const bright of [true, false]) {
    const mask = new Uint8Array(N);
    for (let i = 0; i < N; i++) mask[i] = valid[i] && (bright ? lum[i] > threshold : lum[i] <= threshold) ? 1 : 0;
    const found = candidate(mask, width, height);
    if (found) results.push(found);
  }
  if (results.length === 0) return null;
  results.sort((a, b) => b.confidence - a.confidence);
  const best = results[0];

  const cx = best.quad.reduce((s, p) => s + p.x, 0) / 4;
  const cy = best.quad.reduce((s, p) => s + p.y, 0) / 4;
  const inset = (p: Point): Point => ({ x: p.x + (cx - p.x) * 0.02, y: p.y + (cy - p.y) * 0.02 });
  return {
    quad: [inset(best.quad[0]), inset(best.quad[1]), inset(best.quad[2]), inset(best.quad[3])],
    confidence: Math.round(best.confidence * 100) / 100,
  };
}
