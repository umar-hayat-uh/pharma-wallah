import type { DetectedSpot, DetectionOptions, DetectionResult, PixelBuffer, Point, SpotPolarity } from "./types";

/**
 * Automatic TLC spot detection with conventional image processing. Pure — no
 * DOM, no canvas, no runtime imports — so it runs the same in the browser, the
 * Android WebView and `node --test`.
 *
 * Pipeline:
 *   1. area-average down to ≤ MAX_PIXELS (a spot is tens of pixels across even then)
 *   2. estimate the plate's local background colour with a large box mean, twice —
 *      the second pass ignores pixels the first pass flagged, so a big spot does
 *      not drag its own background towards itself
 *   3. per-pixel signal = luminance difference (in the chosen polarity) + colour
 *      shift away from the grey axis — iodine-brown, ninhydrin-purple and dye spots
 *      are not simply "dark"
 *   4. light smoothing; threshold from the image's own noise (median + t·MAD),
 *      with `t` set by the sensitivity slider and an absolute floor
 *   5. hysteresis: a region is kept if any pixel clears the high threshold and it
 *      grows through the low one, so the centroid sees the whole spot
 *   6. morphological opening, and removal of long horizontal/vertical runs — the
 *      pencil baseline and solvent-front lines — before labelling
 *   7. 8-connected components → filters (size, aspect, fill, border contact)
 *   8. signal-weighted centroid (the densest point, where a student would measure)
 *
 * Detection is a suggestion. The analyzer shows every result as unconfirmed.
 */

/** Detection works on at most this many pixels; larger buffers are area-averaged first. */
export const MAX_PIXELS = 650_000;

const DEFAULT_MAX_SPOTS = 24;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Area-average by an integer factor. Transparent pixels stay transparent (alpha is averaged too). */
export function downsample(buffer: PixelBuffer, factor: number): PixelBuffer {
  if (factor <= 1) return buffer;
  const width = Math.max(1, Math.floor(buffer.width / factor));
  const height = Math.max(1, Math.floor(buffer.height / factor));
  const out = new Uint8ClampedArray(width * height * 4);
  const src = buffer.data;
  const count = factor * factor;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let dy = 0; dy < factor; dy++) {
        let i = ((y * factor + dy) * buffer.width + x * factor) * 4;
        for (let dx = 0; dx < factor; dx++, i += 4) {
          r += src[i];
          g += src[i + 1];
          b += src[i + 2];
          a += src[i + 3];
        }
      }
      const o = (y * width + x) * 4;
      out[o] = r / count;
      out[o + 1] = g / count;
      out[o + 2] = b / count;
      out[o + 3] = a / count;
    }
  }
  return { data: out, width, height };
}

/**
 * Means of several channels over a (2r+1)² window, counting only pixels where
 * `weight` is 1. Integral images keep it O(N) whatever the radius, and the
 * count integral is shared by every channel. Where a window holds no weighted
 * pixel, `fallback` is used.
 */
function maskedBoxMeans(
  channels: Float32Array[],
  weight: Uint8Array,
  width: number,
  height: number,
  radius: number,
  fallback: number,
): Float32Array[] {
  const stride = width + 1;
  const size = stride * (height + 1);
  const cnt = new Float64Array(size);
  for (let y = 0; y < height; y++) {
    let row = 0;
    for (let x = 0; x < width; x++) {
      row += weight[y * width + x];
      const o = (y + 1) * stride + x + 1;
      cnt[o] = cnt[o - stride] + row;
    }
  }
  const sum = new Float64Array(size);
  return channels.map((values) => {
    for (let y = 0; y < height; y++) {
      let row = 0;
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (weight[i]) row += values[i];
        const o = (y + 1) * stride + x + 1;
        sum[o] = sum[o - stride] + row;
      }
    }
    const out = new Float32Array(width * height);
    for (let y = 0; y < height; y++) {
      const top = Math.max(0, y - radius) * stride;
      const bottom = Math.min(height, y + radius + 1) * stride;
      for (let x = 0; x < width; x++) {
        const x0 = Math.max(0, x - radius);
        const x1 = Math.min(width, x + radius + 1);
        const n = cnt[bottom + x1] - cnt[top + x1] - cnt[bottom + x0] + cnt[top + x0];
        out[y * width + x] =
          n > 0 ? (sum[bottom + x1] - sum[top + x1] - sum[bottom + x0] + sum[top + x0]) / n : fallback;
      }
    }
    return out;
  });
}

/**
 * Separable square dilation (any pixel on) or erosion (every pixel on) of a
 * binary mask, from running prefix sums. Cells beyond the image count as "off"
 * for dilation and "on" for erosion, so erosion does not eat everything that
 * touches an edge.
 */
function morph(mask: Uint8Array, width: number, height: number, radius: number, dilate: boolean): Uint8Array {
  const size = radius * 2 + 1;
  const rows = new Uint8Array(mask.length);
  const prefixRow = new Int32Array(width + 1);
  for (let y = 0; y < height; y++) {
    const base = y * width;
    for (let x = 0; x < width; x++) prefixRow[x + 1] = prefixRow[x] + mask[base + x];
    for (let x = 0; x < width; x++) {
      const lo = x - radius < 0 ? 0 : x - radius;
      const hi = x + radius + 1 > width ? width : x + radius + 1;
      const ones = prefixRow[hi] - prefixRow[lo];
      rows[base + x] = dilate ? (ones > 0 ? 1 : 0) : ones + size - (hi - lo) === size ? 1 : 0;
    }
  }
  const out = new Uint8Array(mask.length);
  const prefixCol = new Int32Array(height + 1);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) prefixCol[y + 1] = prefixCol[y] + rows[y * width + x];
    for (let y = 0; y < height; y++) {
      const lo = y - radius < 0 ? 0 : y - radius;
      const hi = y + radius + 1 > height ? height : y + radius + 1;
      const ones = prefixCol[hi] - prefixCol[lo];
      out[y * width + x] = dilate ? (ones > 0 ? 1 : 0) : ones + size - (hi - lo) === size ? 1 : 0;
    }
  }
  return out;
}

function open(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  return morph(morph(mask, width, height, radius, false), width, height, radius, true);
}

function close(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  return morph(morph(mask, width, height, radius, true), width, height, radius, false);
}

/** Clears runs of set pixels longer than `minRow` along rows and `minCol` along columns. */
function removeLongRuns(mask: Uint8Array, width: number, height: number, minRow: number, minCol: number): void {
  const lines = new Uint8Array(mask.length);
  for (let y = 0; y < height; y++) {
    let start = -1;
    for (let x = 0; x <= width; x++) {
      const on = x < width && mask[y * width + x] === 1;
      if (on && start < 0) start = x;
      if (!on && start >= 0) {
        if (x - start >= minRow) for (let k = start; k < x; k++) lines[y * width + k] = 1;
        start = -1;
      }
    }
  }
  for (let x = 0; x < width; x++) {
    let start = -1;
    for (let y = 0; y <= height; y++) {
      const on = y < height && mask[y * width + x] === 1;
      if (on && start < 0) start = y;
      if (!on && start >= 0) {
        if (y - start >= minCol) for (let k = start; k < y; k++) lines[k * width + x] = 1;
        start = -1;
      }
    }
  }
  for (let i = 0; i < mask.length; i++) if (lines[i]) mask[i] = 0;
}

/** Median and MAD of `values` where `valid`, via a 0.25-wide histogram (values are 0–~450). */
function robustStats(values: Float32Array, valid: Uint8Array): { median: number; mad: number } {
  const BIN = 0.25;
  const BINS = 2048;
  const hist = new Uint32Array(BINS);
  let n = 0;
  for (let i = 0; i < values.length; i++) {
    if (!valid[i]) continue;
    hist[Math.min(BINS - 1, Math.max(0, Math.floor(values[i] / BIN)))]++;
    n++;
  }
  if (n === 0) return { median: 0, mad: 0 };
  const quantile = (h: Uint32Array, q: number) => {
    const target = n * q;
    let acc = 0;
    for (let b = 0; b < h.length; b++) {
      acc += h[b];
      if (acc >= target) return (b + 0.5) * BIN;
    }
    return (h.length - 0.5) * BIN;
  };
  const median = quantile(hist, 0.5);
  const dev = new Uint32Array(BINS);
  for (let b = 0; b < BINS; b++) {
    if (!hist[b]) continue;
    const d = Math.abs((b + 0.5) * BIN - median);
    dev[Math.min(BINS - 1, Math.floor(d / BIN))] += hist[b];
  }
  return { median, mad: quantile(dev, 0.5) };
}

function signalOf(dL: number, chroma: number, polarity: SpotPolarity): number {
  if (polarity === "dark") return dL >= -chroma ? Math.max(0, dL) + chroma : 0;
  if (polarity === "light") return -dL >= -chroma ? Math.max(0, -dL) + chroma : 0;
  return Math.abs(dL) + chroma;
}

type Component = {
  area: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  sumW: number;
  sumWX: number;
  sumWY: number;
  maxS: number;
  touchesBorder: boolean;
};

export function detectSpots(input: PixelBuffer, options: DetectionOptions): DetectionResult {
  const factor = Math.max(1, Math.ceil(Math.sqrt((input.width * input.height) / MAX_PIXELS)));
  const buffer = downsample(input, factor);
  const { width, height, data } = buffer;
  const N = width * height;
  const empty: DetectionResult = { spots: [], processedWidth: width, processedHeight: height };
  if (width < 16 || height < 16) return empty;

  const sensitivity = Math.min(1, Math.max(0, options.sensitivity / 100));

  // ── 1. Channels and the valid-pixel mask (rotation leaves transparent corners).
  const R = new Float32Array(N);
  const G = new Float32Array(N);
  const B = new Float32Array(N);
  const valid = new Uint8Array(N);
  let validCount = 0;
  for (let i = 0, p = 0; i < N; i++, p += 4) {
    R[i] = data[p];
    G[i] = data[p + 1];
    B[i] = data[p + 2];
    if (data[p + 3] > 200) {
      valid[i] = 1;
      validCount++;
    }
  }
  if (validCount < N * 0.05) return empty;

  const minDim = Math.min(width, height);
  const bgRadius = Math.round(Math.min(90, Math.max(8, minDim / 9)));

  // ── 2–3. Background, then signal; second background pass without strong outliers.
  const computeSignal = (weight: Uint8Array, polarity: SpotPolarity) => {
    const [bgR, bgG, bgB] = maskedBoxMeans([R, G, B], weight, width, height, bgRadius, 255);
    const signal = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      if (!valid[i]) continue;
      const dr = bgR[i] - R[i];
      const dg = bgG[i] - G[i];
      const db = bgB[i] - B[i];
      const dL = 0.299 * dr + 0.587 * dg + 0.114 * db;
      const chroma = Math.sqrt((dr - dL) * (dr - dL) + (dg - dL) * (dg - dL) + (db - dL) * (db - dL));
      signal[i] = signalOf(dL, chroma, polarity);
    }
    return signal;
  };

  // The outlier pass uses both polarities: a bright spot must not lift the
  // background either, or the plate around it reads as a dark ring.
  let signal: Float32Array = computeSignal(valid, "any");
  {
    const first = robustStats(signal, valid);
    const cut = first.median + 4 * Math.max(1.5, 1.4826 * first.mad);
    const quiet = new Uint8Array(N);
    for (let i = 0; i < N; i++) quiet[i] = valid[i] && signal[i] < cut ? 1 : 0;
    signal = computeSignal(quiet, options.polarity);
  }

  // ── 4. Smooth (3×3 or larger on big buffers) and threshold from the noise.
  const smoothRadius = Math.max(1, Math.round(minDim / 500));
  signal = maskedBoxMeans([signal], valid, width, height, smoothRadius, 0)[0];
  for (let i = 0; i < N; i++) if (!valid[i]) signal[i] = 0;

  const stats = robustStats(signal, valid);
  const noise = Math.max(1, 1.4826 * stats.mad);
  const highThreshold = Math.max(stats.median + lerp(13, 3.5, sensitivity) * noise, lerp(26, 7, sensitivity));
  const lowThreshold = Math.max(stats.median + 0.5 * (highThreshold - stats.median), highThreshold * 0.45);

  // ── 5–6. Low mask, clean-up, pencil-line removal.
  const band = Math.max(2, Math.round(minDim * 0.01));
  let mask: Uint8Array = new Uint8Array(N);
  for (let y = band; y < height - band; y++) {
    for (let x = band; x < width - band; x++) {
      const i = y * width + x;
      mask[i] = valid[i] && signal[i] > lowThreshold ? 1 : 0;
    }
  }
  removeLongRuns(mask, width, height, Math.max(24, Math.round(width * 0.3)), Math.max(24, Math.round(height * 0.45)));
  mask = open(mask, width, height, 1);
  mask = close(mask, width, height, 1);

  // ── 7. Connected components (8-connected), with an explicit stack.
  const labels = new Int32Array(N);
  const stack = new Int32Array(N);
  const components: Component[] = [];
  for (let start = 0; start < N; start++) {
    if (!mask[start] || labels[start]) continue;
    const label = components.length + 1;
    const c: Component = {
      area: 0,
      minX: width,
      maxX: 0,
      minY: height,
      maxY: 0,
      sumW: 0,
      sumWX: 0,
      sumWY: 0,
      maxS: 0,
      touchesBorder: false,
    };
    let top = 0;
    stack[top++] = start;
    labels[start] = label;
    while (top > 0) {
      const i = stack[--top];
      const x = i % width;
      const y = (i - x) / width;
      const s = signal[i];
      const w = s - lowThreshold + 1;
      c.area++;
      c.sumW += w;
      c.sumWX += w * x;
      c.sumWY += w * y;
      if (s > c.maxS) c.maxS = s;
      if (x < c.minX) c.minX = x;
      if (x > c.maxX) c.maxX = x;
      if (y < c.minY) c.minY = y;
      if (y > c.maxY) c.maxY = y;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const j = ny * width + nx;
          if (!valid[j]) c.touchesBorder = true;
          if (mask[j] && !labels[j]) {
            labels[j] = label;
            stack[top++] = j;
          }
        }
      }
      if (x <= band || y <= band || x >= width - band - 1 || y >= height - band - 1) c.touchesBorder = true;
    }
    components.push(c);
  }

  const minArea = Math.max(6, Math.round(N * lerp(1.2e-4, 1.5e-5, sensitivity)));
  const maxArea = N * 0.08;

  let spots: DetectedSpot[] = [];
  for (let k = 0; k < components.length; k++) {
    const c = components[k];
    if (c.maxS < highThreshold || c.area < minArea || c.area > maxArea || c.touchesBorder) continue;
    const bw = c.maxX - c.minX + 1;
    const bh = c.maxY - c.minY + 1;
    if (bw > width * 0.45) continue;
    const aspect = bw / bh;
    // Horizontal smears are pencil lines or plate edges; tailing spots are vertical, so allow more height.
    if (aspect > 3.5 || aspect < 1 / 6) continue;
    const fill = c.area / (bw * bh);
    if (fill < 0.25) continue;

    const contrast = Math.min(1, c.maxS / (highThreshold * 2.5));
    const roundness = Math.min(1, Math.max(0, (fill - 0.25) / 0.5));
    const elongation = Math.max(aspect, 1 / aspect);
    const shape = Math.min(1, Math.max(0, 1 - (elongation - 1) / 4));
    const confidence = Math.round((0.5 * contrast + 0.3 * roundness + 0.2 * shape) * 100) / 100;

    spots.push({
      x: c.sumWX / c.sumW,
      y: c.sumWY / c.sumW,
      radius: Math.max(bw, bh) / 2,
      area: c.area,
      confidence,
    });
  }

  spots = mergeClose(spots);
  spots.sort((a, b) => b.confidence - a.confidence);
  spots = spots.slice(0, options.maxSpots ?? DEFAULT_MAX_SPOTS);

  // Back to the caller's pixel grid. A block of `factor` pixels has its centre at +(factor−1)/2.
  const offset = (factor - 1) / 2;
  return {
    spots: spots.map((s) => ({
      x: s.x * factor + offset,
      y: s.y * factor + offset,
      radius: s.radius * factor,
      area: s.area * factor * factor,
      confidence: s.confidence,
    })),
    processedWidth: width,
    processedHeight: height,
  };
}

/** Fragments of one spot (a ring-shaped or split spot) closer than their radii become one. */
function mergeClose(spots: DetectedSpot[]): DetectedSpot[] {
  const out = spots.slice().sort((a, b) => b.area - a.area);
  for (let i = 0; i < out.length; i++) {
    for (let j = out.length - 1; j > i; j--) {
      const a = out[i];
      const b = out[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) < Math.max(a.radius, b.radius) * 0.9) {
        const area = a.area + b.area;
        out[i] = {
          x: (a.x * a.area + b.x * b.area) / area,
          y: (a.y * a.area + b.y * b.area) / area,
          radius: Math.max(a.radius, b.radius),
          area,
          confidence: Math.max(a.confidence, b.confidence),
        };
        out.splice(j, 1);
      }
    }
  }
  return out;
}

/**
 * Numbering order students expect: lane by lane from the left, and within a
 * lane from the baseline upwards (largest y first). Points within
 * `laneTolerance` pixels horizontally of a lane's first point share that lane.
 * Returns indices into `points`.
 */
export function laneOrder(points: Point[], laneTolerance: number): number[] {
  const byX = points.map((p, i) => ({ p, i })).sort((a, b) => a.p.x - b.p.x);
  const lanes: { x: number; members: { p: Point; i: number }[] }[] = [];
  for (let k = 0; k < byX.length; k++) {
    const item = byX[k];
    const lane = lanes[lanes.length - 1];
    if (lane && item.p.x - lane.x <= laneTolerance) lane.members.push(item);
    else lanes.push({ x: item.p.x, members: [item] });
  }
  const order: number[] = [];
  lanes.forEach((lane) => {
    lane.members.sort((a, b) => b.p.y - a.p.y).forEach((m) => order.push(m.i));
  });
  return order;
}
