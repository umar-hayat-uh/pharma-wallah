import type * as OpenCV from "@techstark/opencv-js";
import type { Circle, Colony, DetectionResult, DetectionSettings, DetectionStep, QualityIssue, RGBABuffer } from "./types";

/**
 * Colony detection with classical computer vision (OpenCV.js). Pure: it takes
 * the OpenCV module as an argument and touches no DOM, so the same code runs in
 * the Web Worker, on the main thread as a fallback, and under `node --test`.
 *
 *   1 prepare   RGBA → processing copy (≤ PROCESSING_MAX px), quality checks
 *   2 plate     Hough circle on a small copy → contour fallback → circular mask
 *               (shrunk by RIM so the dish wall is never counted)
 *   3 colonies  Lab colour space; background by morphological closing/opening on
 *               a small copy (so lighting gradients cancel); signal = brightness
 *               difference in the chosen polarity + colour difference; blur;
 *               Otsu (on plate pixels only) or adaptive threshold, with a noise
 *               floor; opening/closing; distance transform → local maxima →
 *               watershed, only for regions that look like touching colonies;
 *               contours → area, perimeter, circularity, box → filters
 *   4 results   back to original-image pixels, reading order
 *
 * Every Mat is registered with `track` and deleted in `finally` — OpenCV.js
 * memory lives in the WASM heap and is never garbage-collected.
 */

export type CV = typeof OpenCV;
type Mat = OpenCV.Mat;

export const PROCESSING_MAX = 1600;
/** Fraction of the plate radius masked off at the wall. */
export const RIM = 0.06;

export const DEFAULT_SETTINGS: DetectionSettings = {
  polarity: "auto",
  method: "auto",
  sensitivity: 50,
  minDiameter: 0.006,
  maxDiameter: 0.1,
  minCircularity: 0.3,
  blur: 1,
  morphology: 1,
  watershed: true,
};

export class ColonyDetectionError extends Error {}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const odd = (n: number) => {
  const r = Math.max(1, Math.round(n));
  return r % 2 === 1 ? r : r + 1;
};

/** Histogram of an 8-bit Mat over the pixels where `mask` is non-zero. */
function maskedHistogram(values: Uint8Array, mask: Uint8Array): { hist: Float64Array; n: number } {
  const hist = new Float64Array(256);
  let n = 0;
  for (let i = 0; i < values.length; i++) {
    if (!mask[i]) continue;
    hist[values[i]]++;
    n++;
  }
  return { hist, n };
}

function quantile(hist: Float64Array, n: number, q: number): number {
  const target = n * q;
  let acc = 0;
  for (let v = 0; v < 256; v++) {
    acc += hist[v];
    if (acc >= target) return v;
  }
  return 255;
}

function otsu(hist: Float64Array, n: number): number {
  let sumAll = 0;
  for (let t = 0; t < 256; t++) sumAll += t * hist[t];
  let wB = 0;
  let sumB = 0;
  let best = -1;
  let threshold = 0;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = n - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const between = wB * wF * (sumB / wB - (sumAll - sumB) / wF) ** 2;
    if (between > best) {
      best = between;
      threshold = t;
    }
  }
  return threshold;
}

/** Median absolute deviation, as a sigma estimate. */
function robustSigma(hist: Float64Array, n: number, median: number): number {
  const dev = new Float64Array(256);
  for (let v = 0; v < 256; v++) dev[Math.abs(v - median)] += hist[v];
  return Math.max(1, 1.4826 * quantile(dev, n, 0.5));
}

/**
 * Finds the dish in a grey image. Returns a circle in that image's pixels, or
 * null — the caller then asks the student to place it.
 */
export function findPlate(cv: CV, gray: Mat, track: <T extends { delete(): void }>(m: T) => T): Circle | null {
  const minDim = Math.min(gray.cols, gray.rows);
  const k = Math.min(1, 420 / Math.max(gray.cols, gray.rows));
  const small = track(new cv.Mat());
  cv.resize(gray, small, new cv.Size(Math.round(gray.cols * k), Math.round(gray.rows * k)), 0, 0, cv.INTER_AREA);
  const blurred = track(new cv.Mat());
  cv.medianBlur(small, blurred, 5);
  const sMin = Math.min(small.cols, small.rows);

  // Hough: the dish wall is the strongest large circle in a bench photo.
  const circles = track(new cv.Mat());
  cv.HoughCircles(blurred, circles, cv.HOUGH_GRADIENT, 1.5, sMin, 120, 38, Math.round(sMin * 0.25), Math.round(sMin * 0.56));
  for (let i = 0; i < circles.cols; i++) {
    const x = circles.data32F[i * 3];
    const y = circles.data32F[i * 3 + 1];
    const r = circles.data32F[i * 3 + 2];
    // Centre on the photo, and at most a sliver of the dish outside it.
    const outside = Math.max(0, r - x, r - y, x + r - small.cols, y + r - small.rows);
    if (x > 0 && y > 0 && x < small.cols && y < small.rows && outside < r * 0.15) {
      return { x: x / k, y: y / k, r: r / k };
    }
  }

  // Fallback: the largest near-circular bright or dark region.
  for (const type of [cv.THRESH_BINARY, cv.THRESH_BINARY_INV]) {
    const bin = track(new cv.Mat());
    cv.threshold(blurred, bin, 0, 255, type + cv.THRESH_OTSU);
    const contours = track(new cv.MatVector());
    const hierarchy = track(new cv.Mat());
    cv.findContours(bin, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
    let bestArea = 0;
    let best: Circle | null = null;
    for (let i = 0; i < contours.size(); i++) {
      const c = contours.get(i);
      const area = cv.contourArea(c);
      if (area > bestArea) {
        const { center, radius } = cv.minEnclosingCircle(c);
        const fill = area / (Math.PI * radius * radius);
        if (radius >= sMin * 0.25 && fill >= 0.78) {
          bestArea = area;
          best = { x: center.x / k, y: center.y / k, r: radius / k };
        }
      }
      c.delete();
    }
    if (best && best.r <= minDim * 0.62) return best;
  }
  return null;
}

/** A binary max-heap of pixel indices keyed by distance, for the flooding step. */
class MaxHeap {
  private keys: number[] = [];
  private items: number[] = [];
  get size() {
    return this.items.length;
  }
  push(key: number, item: number) {
    const keys = this.keys;
    const items = this.items;
    let i = items.length;
    keys.push(key);
    items.push(item);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (keys[parent] >= key) break;
      keys[i] = keys[parent];
      items[i] = items[parent];
      i = parent;
    }
    keys[i] = key;
    items[i] = item;
  }
  pop(): number {
    const keys = this.keys;
    const items = this.items;
    const top = items[0];
    const lastKey = keys.pop()!;
    const lastItem = items.pop()!;
    const n = items.length;
    if (n > 0) {
      let i = 0;
      for (;;) {
        let child = 2 * i + 1;
        if (child >= n) break;
        if (child + 1 < n && keys[child + 1] > keys[child]) child++;
        if (keys[child] <= lastKey) break;
        keys[i] = keys[child];
        items[i] = items[child];
        i = child;
      }
      keys[i] = lastKey;
      items[i] = lastItem;
    }
    return top;
  }
}

type Region = {
  area: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  sumX: number;
  sumY: number;
  boundary: number;
  touchesRim: boolean;
  split: boolean;
};

export function detectColonies(
  cv: CV,
  input: RGBABuffer,
  settings: DetectionSettings,
  options: { plate?: Circle | null; onStep?: (step: DetectionStep) => void } = {},
): DetectionResult {
  const started = Date.now();
  const mats: { delete(): void }[] = [];
  const track = <T extends { delete(): void }>(m: T): T => {
    mats.push(m);
    return m;
  };
  const step = options.onStep ?? (() => {});

  try {
    // ── 1. Prepare ─────────────────────────────────────────────────────────
    step(1);
    if (input.width < 16 || input.height < 16) throw new ColonyDetectionError("This image is too small to analyse.");
    const src = track(new cv.Mat(input.height, input.width, cv.CV_8UC4));
    src.data.set(input.data);
    const scale = Math.min(1, PROCESSING_MAX / Math.max(input.width, input.height));
    let rgba = src;
    if (scale < 1) {
      rgba = track(new cv.Mat());
      cv.resize(src, rgba, new cv.Size(Math.round(input.width * scale), Math.round(input.height * scale)), 0, 0, cv.INTER_AREA);
    }
    const W = rgba.cols;
    const H = rgba.rows;
    const N = W * H;
    const rgb = track(new cv.Mat());
    cv.cvtColor(rgba, rgb, cv.COLOR_RGBA2RGB);
    const gray = track(new cv.Mat());
    cv.cvtColor(rgb, gray, cv.COLOR_RGB2GRAY);

    const quality = new Set<QualityIssue>();
    if (Math.min(input.width, input.height) < 480) quality.add("low-resolution");

    // ── 2. Plate ───────────────────────────────────────────────────────────
    step(2);
    let plate: Circle | null = options.plate ? { x: options.plate.x * scale, y: options.plate.y * scale, r: options.plate.r * scale } : null;
    const plateFound = plate !== null || (plate = findPlate(cv, gray, track)) !== null;
    if (!plate) {
      quality.add("no-plate");
      plate = { x: W / 2, y: H / 2, r: Math.min(W, H) * 0.45 };
    }
    const inner = plate.r * (1 - RIM);
    const mask = track(cv.Mat.zeros(H, W, cv.CV_8UC1));
    cv.circle(mask, new cv.Point(Math.round(plate.x), Math.round(plate.y)), Math.max(1, Math.round(inner)), new cv.Scalar(255), -1);
    // Copies, not views: a Mat's .data is a view into the WASM heap and goes
    // empty when a later allocation grows the heap (MEMORY gotcha 87).
    const maskData = mask.data.slice();

    {
      const { hist, n } = maskedHistogram(gray.data, maskData);
      if (n === 0) throw new ColonyDetectionError("The plate area is outside the image. Select the plate again.");
      const mean = hist.reduce((s, c, v) => s + c * v, 0) / n;
      if (mean < 45) quality.add("too-dark");
      if (mean > 228) quality.add("too-bright");
      const med3 = track(new cv.Mat());
      cv.medianBlur(gray, med3, 3);
      let noise = 0;
      const g = gray.data;
      const m3 = med3.data;
      for (let i = 0; i < N; i++) if (maskData[i]) noise += Math.abs(g[i] - m3[i]);
      if (noise / n > 7) quality.add("noisy");
    }

    // ── 3. Colonies ────────────────────────────────────────────────────────
    step(3);
    const sensitivity = Math.min(1, Math.max(0, settings.sensitivity / 100));
    const plateD = plate.r * 2;
    const minD = Math.max(2, settings.minDiameter * plateD);
    const maxD = Math.max(minD * 1.5, settings.maxDiameter * plateD);
    const minArea = Math.max(4, Math.PI * (minD / 2) ** 2);
    const maxArea = Math.PI * (maxD / 2) ** 2;

    const lab = track(new cv.Mat());
    cv.cvtColor(rgb, lab, cv.COLOR_RGB2Lab);
    const channels = track(new cv.MatVector());
    cv.split(lab, channels);
    const L = track(channels.get(0));
    const A = track(channels.get(1));
    const B = track(channels.get(2));

    // Background on a small copy. Pixels off the plate are filled with the
    // agar's median first, so the dark bench does not bleed into the rim.
    const f = 4;
    const smallSize = new cv.Size(Math.max(1, Math.round(W / f)), Math.max(1, Math.round(H / f)));
    const smallMask = track(new cv.Mat());
    cv.resize(mask, smallMask, smallSize, 0, 0, cv.INTER_NEAREST);
    const notSmallMask = track(new cv.Mat());
    cv.bitwise_not(smallMask, notSmallMask);
    const kd = odd(Math.max(3, (maxD * 1.4) / f));
    const kernelBg = track(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(kd, kd)));
    const full = new cv.Size(W, H);

    const background = (channel: Mat, op: number | "median"): Mat => {
      const small = track(new cv.Mat());
      cv.resize(channel, small, smallSize, 0, 0, cv.INTER_AREA);
      const { hist, n } = maskedHistogram(small.data, smallMask.data);
      small.setTo(new cv.Scalar(quantile(hist, n, 0.5)), notSmallMask);
      const filtered = track(new cv.Mat());
      if (op === "median") cv.medianBlur(small, filtered, Math.min(kd, 255));
      else cv.morphologyEx(small, filtered, op, kernelBg);
      const smooth = track(new cv.Mat());
      cv.GaussianBlur(filtered, smooth, new cv.Size(kd, kd), 0);
      const out = track(new cv.Mat());
      cv.resize(smooth, out, full, 0, 0, cv.INTER_LINEAR);
      return out;
    };

    const darkSig = track(new cv.Mat());
    cv.subtract(background(L, cv.MORPH_CLOSE), L, darkSig);
    const lightSig = track(new cv.Mat());
    cv.subtract(L, background(L, cv.MORPH_OPEN), lightSig);
    const dA = track(new cv.Mat());
    cv.absdiff(A, background(A, "median"), dA);
    const dB = track(new cv.Mat());
    cv.absdiff(B, background(B, "median"), dB);
    const chroma = track(new cv.Mat());
    cv.addWeighted(dA, 1, dB, 1, 0, chroma);

    // Automatic polarity: whichever direction has the stronger tail on the plate.
    const strength = (m: Mat) => {
      const { hist, n } = maskedHistogram(m.data, maskData);
      return quantile(hist, n, 0.995) - quantile(hist, n, 0.5);
    };
    const polarity: "dark" | "light" =
      settings.polarity === "auto" ? (strength(darkSig) >= strength(lightSig) ? "dark" : "light") : settings.polarity;

    let signal = track(new cv.Mat());
    cv.addWeighted(polarity === "dark" ? darkSig : lightSig, 1, chroma, 0.8, 0, signal);
    const notMask = track(new cv.Mat());
    cv.bitwise_not(mask, notMask);
    signal.setTo(new cv.Scalar(0), notMask);
    if (settings.blur > 0) {
      const blurred = track(new cv.Mat());
      const kb = 2 * Math.round(settings.blur) + 1;
      cv.GaussianBlur(signal, blurred, new cv.Size(kb, kb), 0);
      signal = blurred;
    }

    const stats = maskedHistogram(signal.data, maskData);
    const median = quantile(stats.hist, stats.n, 0.5);
    const sigma = robustSigma(stats.hist, stats.n, median);
    const p99 = quantile(stats.hist, stats.n, 0.99);
    if (p99 - median < 10) quality.add("low-contrast");
    // The floor keeps a blank plate blank: noise alone never reaches it.
    const floor = Math.max(median + lerp(9, 3.5, sensitivity) * sigma, lerp(26, 9, sensitivity));

    // Lighting that the background step could not flatten shows up as a wide
    // spread in the background itself; adaptive thresholding copes better then.
    const method: "otsu" | "adaptive" = settings.method === "adaptive" ? "adaptive" : "otsu";
    const bin = track(new cv.Mat());
    if (method === "otsu") {
      const t = Math.max(floor, otsu(stats.hist, stats.n) * lerp(1.3, 0.7, sensitivity));
      cv.threshold(signal, bin, Math.min(254, t), 255, cv.THRESH_BINARY);
    } else {
      const block = odd(Math.max(15, maxD * 2.5));
      cv.adaptiveThreshold(signal, bin, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, block, -lerp(10, 3, sensitivity));
      const floorBin = track(new cv.Mat());
      cv.threshold(signal, floorBin, Math.min(254, floor * 0.8), 255, cv.THRESH_BINARY);
      cv.bitwise_and(bin, floorBin, bin);
    }
    cv.bitwise_and(bin, mask, bin);

    // Opening removes specks; its radius never exceeds a third of the smallest colony.
    const morphR = Math.min(Math.round(settings.morphology), Math.floor(minD / 3));
    if (morphR >= 1) {
      const kernel = track(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(2 * morphR + 1, 2 * morphR + 1)));
      cv.morphologyEx(bin, bin, cv.MORPH_OPEN, kernel);
      cv.morphologyEx(bin, bin, cv.MORPH_CLOSE, kernel);
    }

    const labels = track(new cv.Mat());
    const ccStats = track(new cv.Mat());
    const centroids = track(new cv.Mat());
    const nLabels = cv.connectedComponentsWithStats(bin, labels, ccStats, centroids, 8, cv.CV_32S);
    const areas: number[] = [];
    for (let i = 1; i < nLabels; i++) {
      const a = ccStats.intAt(i, cv.CC_STAT_AREA);
      if (a >= minArea && a <= maxArea) areas.push(a);
    }
    areas.sort((a, b) => a - b);
    const typicalArea = areas.length ? areas[Math.floor(areas.length / 2)] : minArea * 4;
    const typicalR = Math.sqrt(typicalArea / Math.PI);

    const lab32 = labels.data32S.slice();
    const binData = bin.data.slice();
    let coverageCount = 0;
    for (let i = 0; i < N; i++) if (binData[i]) coverageCount++;
    const coverage = coverageCount / Math.max(1, stats.n);

    // ── Watershed, only where a region looks like several colonies ──────────
    let regionLabels: Int32Array = lab32;
    let splitGroups = 0;
    // Watershed markers that came from a split region (for the "split" flag on a colony).
    const splitMarkers = new Set<number>();
    if (settings.watershed && nLabels > 1) {
      const dist = track(new cv.Mat());
      cv.distanceTransform(bin, dist, cv.DIST_L2, 5);
      const kp = odd(Math.max(3, typicalR * 1.2));
      const dmax = track(new cv.Mat());
      cv.dilate(dist, dmax, track(cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(kp, kp))));
      const d = dist.data32F.slice();
      const dm = dmax.data32F.slice();
      const minPeak = Math.max(1.5, typicalR * 0.45);
      const peaks = track(cv.Mat.zeros(H, W, cv.CV_8UC1));
      const pk = peaks.data;
      for (let i = 0; i < N; i++) if (d[i] >= minPeak && d[i] >= dm[i] - 1e-3) pk[i] = 255;
      const peakLabels = track(new cv.Mat());
      const nPeaks = cv.connectedComponents(peaks, peakLabels, 8, cv.CV_32S);
      const pl = peakLabels.data32S.slice();

      // Peaks per region, and each region's deepest point.
      const peaksIn = new Map<number, Set<number>>();
      const depth = new Float32Array(nLabels);
      for (let i = 0; i < N; i++) {
        const r = lab32[i];
        if (!r) continue;
        if (d[i] > depth[r]) depth[r] = d[i];
        if (pl[i]) {
          let set = peaksIn.get(r);
          if (!set) peaksIn.set(r, (set = new Set()));
          set.add(pl[i]);
        }
      }
      // A peak counts only if it is a real lobe (at least half as deep as the region's centre).
      const peakDepth = new Float32Array(nPeaks);
      for (let i = 0; i < N; i++) if (pl[i] && d[i] > peakDepth[pl[i]]) peakDepth[pl[i]] = d[i];

      const toSplit = new Set<number>();
      peaksIn.forEach((set, r) => {
        const lobes = Array.from(set).filter((p) => peakDepth[p] >= depth[r] * 0.5);
        const area = ccStats.intAt(r, cv.CC_STAT_AREA);
        if (lobes.length >= 2 && area >= typicalArea * 1.4 && area <= maxArea * 4) {
          toSplit.add(r);
          peaksIn.set(r, new Set(lobes));
        }
      });

      if (toSplit.size > 0) {
        splitGroups = toSplit.size;
        // Region labels for the whole image: unsplit regions keep one label;
        // each lobe of a split region gets its own and floods its share.
        const out = new Int32Array(N);
        let next = 1;
        const regionLabel = new Int32Array(nLabels);
        for (let r = 1; r < nLabels; r++) if (!toSplit.has(r)) regionLabel[r] = next++;
        const lobeLabel = new Int32Array(nPeaks);
        toSplit.forEach((r) =>
          peaksIn.get(r)!.forEach((p) => {
            lobeLabel[p] = next;
            splitMarkers.add(next++);
          }),
        );
        const heap = new MaxHeap();
        for (let i = 0; i < N; i++) {
          const r = lab32[i];
          if (!r) continue;
          if (!toSplit.has(r)) out[i] = regionLabel[r];
          else if (pl[i] && lobeLabel[pl[i]]) {
            out[i] = lobeLabel[pl[i]];
            heap.push(d[i], i);
          }
        }
        // Marker-controlled watershed on the inverted distance map (Meyer
        // flooding): the deepest unlabelled pixel next to a lobe joins it, so
        // the boundary settles in the waist between colonies. cv.watershed is
        // not used here because it floods on the photo's local colour
        // differences, and a colony's flat interior gives it nothing to follow.
        while (heap.size > 0) {
          const i = heap.pop();
          const label = out[i];
          const x = i % W;
          const r = lab32[i];
          const neighbours = [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W];
          for (const j of neighbours) {
            if (j < 0 || j >= N || out[j] || lab32[j] !== r) continue;
            out[j] = label;
            heap.push(d[j], j);
          }
        }
        // Clear the pixels where two lobes meet, so touching colonies stay apart.
        const sep = out.slice();
        for (let i = 0; i < N; i++) {
          const l = out[i];
          if (!splitMarkers.has(l)) continue;
          const x = i % W;
          if (
            (x > 0 && out[i - 1] && out[i - 1] !== l) ||
            (x < W - 1 && out[i + 1] && out[i + 1] !== l) ||
            (i >= W && out[i - W] && out[i - W] !== l) ||
            (i < N - W && out[i + W] && out[i + W] !== l)
          ) {
            sep[i] = 0;
          }
        }
        regionLabels = sep;
      }
    }

    // ── Measure regions (area, box, centroid, boundary length) ──────────────
    const regions = new Map<number, Region>();
    const rimR2 = (inner - 1.5) ** 2;
    for (let i = 0; i < N; i++) {
      const r = regionLabels[i];
      if (!r) continue;
      const x = i % W;
      const y = (i - x) / W;
      let g = regions.get(r);
      if (!g) {
        g = { area: 0, minX: x, maxX: x, minY: y, maxY: y, sumX: 0, sumY: 0, boundary: 0, touchesRim: false, split: splitMarkers.has(r) };
        regions.set(r, g);
      }
      g.area++;
      g.sumX += x;
      g.sumY += y;
      if (x < g.minX) g.minX = x;
      if (x > g.maxX) g.maxX = x;
      if (y < g.minY) g.minY = y;
      if (y > g.maxY) g.maxY = y;
      // 4-neighbour boundary pixels, counted for the perimeter.
      if (x === 0 || x === W - 1 || y === 0 || y === H - 1 || regionLabels[i - 1] !== r || regionLabels[i + 1] !== r || regionLabels[i - W] !== r || regionLabels[i + W] !== r) {
        g.boundary++;
        if ((x - plate.x) ** 2 + (y - plate.y) ** 2 >= rimR2) g.touchesRim = true;
      }
    }

    const found: Omit<Colony, "id">[] = [];
    let rejected = 0;
    let oversized = 0;
    regions.forEach((g) => {
      const w = g.maxX - g.minX + 1;
      const h = g.maxY - g.minY + 1;
      // Boundary pixels trace a chain about 0.9× the true perimeter's length per pixel on a disc; the +π keeps
      // tiny regions from reading as better than circles.
      const perimeter = g.boundary * 1.12 + Math.PI;
      const circularity = Math.min(1, (4 * Math.PI * g.area) / (perimeter * perimeter));
      const aspect = Math.max(w, h) / Math.min(w, h);
      const ok =
        g.area >= minArea &&
        g.area <= maxArea &&
        !g.touchesRim &&
        aspect <= 4 &&
        (g.area < 30 || circularity >= settings.minCircularity);
      if (!ok) {
        rejected++;
        if (g.area > maxArea) oversized++;
        return;
      }
      found.push({
        x: (g.sumX / g.area + 0.5) / scale,
        y: (g.sumY / g.area + 0.5) / scale,
        box: { x: g.minX / scale, y: g.minY / scale, width: w / scale, height: h / scale },
        source: "auto",
        area: g.area / (scale * scale),
        circularity: Math.round(circularity * 100) / 100,
        split: g.split || undefined,
      });
    });
    if (oversized > 0 && oversized >= Math.max(1, found.length * 0.1)) quality.add("large-region");

    // ── 4. Results in reading order ─────────────────────────────────────────
    step(4);
    const band = Math.max(4, (typicalR * 3) / scale);
    found.sort((a, b) => Math.floor(a.y / band) - Math.floor(b.y / band) || a.x - b.x);

    return {
      colonies: found,
      plate: { x: plate.x / scale, y: plate.y / scale, r: plate.r / scale },
      plateFound,
      polarity,
      method,
      quality: Array.from(quality),
      coverage,
      splitGroups,
      rejected,
      processingScale: scale,
      ms: Date.now() - started,
    };
  } finally {
    for (let i = mats.length - 1; i >= 0; i--) {
      try {
        mats[i].delete();
      } catch {
        // Already freed (a Mat taken from a MatVector shares nothing, but be defensive).
      }
    }
  }
}
