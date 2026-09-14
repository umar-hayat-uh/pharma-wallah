/**
 * Tests for the TLC Rf Analyzer's pure modules.
 *
 *   node --test scripts/tlc-rf.test.mts
 *
 * No test framework is installed in this repo; Node 24 runs TypeScript with its
 * built-in type stripping, and the modules under test import each other only
 * with `import type`, so they load without a bundler. The `.mts` extension keeps
 * this file out of the root tsconfig's `**\/*.ts` include (the explicit `.ts`
 * import specifiers below would otherwise fail `tsc`).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { analyzePlate, calculateRf, formatCm, formatRf, parseCalibrationCm, pixelsPerCm } from "../src/components/calculators/tlc/rf.ts";
import {
  applyHomography,
  computeHomography,
  fitView,
  imageToScreen,
  orderQuad,
  rotatedBounds,
  screenToImage,
  zoomAt,
} from "../src/components/calculators/tlc/geometry.ts";
import { detectSpots, laneOrder } from "../src/components/calculators/tlc/spots.ts";
import { detectPlate } from "../src/components/calculators/tlc/plate.ts";
import { createSamplePlate } from "../src/components/calculators/tlc/sample.ts";
import type { PixelBuffer, Quad, TLCSpot } from "../src/components/calculators/tlc/types.ts";

const close = (actual: number | null, expected: number, tolerance = 1e-9) => {
  assert.ok(actual !== null, "expected a number, got null");
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} is not within ${tolerance} of ${expected}`);
};

const spot = (id: string, y: number, accepted = true): TLCSpot => ({ id, name: `Spot ${id}`, x: 100, y, accepted, source: "manual" });

// ── Rf ───────────────────────────────────────────────────────────────────────

test("worked example: baseline 500, front 150, spot 290 → 210 / 350 = 0.60", () => {
  const r = calculateRf({ baselineY: 500, solventFrontY: 150, spotY: 290 });
  assert.equal(r.compoundDistance, 210);
  assert.equal(r.solventDistance, 350);
  close(r.rf, 0.6);
  assert.equal(r.valid, true);
  assert.equal(formatRf(r.rf), "0.60");
  assert.equal(formatRf(r.rf, 3), "0.600");
});

test("multiple spots keep their numbering and order", () => {
  const plate = analyzePlate({
    baselineY: 500,
    solventFrontY: 150,
    spots: [spot("1", 380), spot("2", 290, false), spot("3", 220)],
  });
  assert.deepEqual(plate.errors, []);
  assert.equal(plate.solventDistancePx, 350);
  assert.equal(plate.rows.length, 2, "the unconfirmed spot is not in the results");
  assert.equal(plate.rows[0].index, 0);
  assert.equal(plate.rows[1].index, 2, "spot 3 keeps its marker number");
  close(plate.rows[0].result.rf, 120 / 350);
  close(plate.rows[1].result.rf, 280 / 350);
  assert.equal(formatRf(plate.rows[0].result.rf), "0.34");
  assert.equal(formatRf(plate.rows[1].result.rf), "0.80");
});

test("Rf = 0 on the baseline and Rf = 1 on the front, both valid", () => {
  const zero = calculateRf({ baselineY: 500, solventFrontY: 150, spotY: 500 });
  assert.equal(zero.rf, 0);
  assert.equal(zero.valid, true);
  assert.equal(formatRf(zero.rf), "0.00");
  const one = calculateRf({ baselineY: 500, solventFrontY: 150, spotY: 150 });
  assert.equal(one.rf, 1);
  assert.equal(one.valid, true);
});

test("zero solvent distance is rejected", () => {
  const r = calculateRf({ baselineY: 300, solventFrontY: 300, spotY: 200 });
  assert.equal(r.rf, null);
  assert.equal(r.valid, false);
  assert.equal(r.error, "Please set a valid solvent front.");
});

test("a solvent front below the baseline is rejected", () => {
  const r = calculateRf({ baselineY: 150, solventFrontY: 500, spotY: 290 });
  assert.equal(r.rf, null);
  assert.equal(r.valid, false);
  assert.match(r.error ?? "", /below the baseline/);
});

test("a spot beyond the front is shown with a warning, not hidden", () => {
  const r = calculateRf({ baselineY: 500, solventFrontY: 150, spotY: 100 });
  close(r.rf, 400 / 350);
  assert.equal(r.valid, false);
  assert.match(r.warning ?? "", /beyond the solvent front/);
  assert.match(r.warning ?? "", /Check the spot and solvent-front positions\./);
  const plate = analyzePlate({ baselineY: 500, solventFrontY: 150, spots: [spot("1", 100)] });
  assert.equal(plate.rows[0].result.rf !== null, true);
  assert.equal(plate.warnings.length, 1);
});

test("a spot below the baseline gives a negative Rf and a warning", () => {
  const r = calculateRf({ baselineY: 500, solventFrontY: 150, spotY: 535 });
  close(r.rf, -0.1);
  assert.equal(r.compoundDistance, 35);
  assert.equal(r.valid, false);
  assert.match(r.warning ?? "", /below the baseline/);
});

test("missing baseline or front gives an error and no Rf", () => {
  const noBaseline = calculateRf({ baselineY: null, solventFrontY: 150, spotY: 290 });
  assert.equal(noBaseline.rf, null);
  assert.match(noBaseline.error ?? "", /baseline/);
  const noFront = calculateRf({ baselineY: 500, solventFrontY: undefined, spotY: 290 });
  assert.equal(noFront.rf, null);
  assert.equal(noFront.error, "Set the solvent front.");
  const plate = analyzePlate({ baselineY: null, solventFrontY: null, spots: [spot("1", 290)] });
  assert.equal(plate.errors.length, 1);
  assert.equal(plate.rows[0].result.rf, null);
  assert.equal(plate.solventDistancePx, null);
});

test("physical calibration: 350 px = 6 cm", () => {
  close(pixelsPerCm(350, 6), 350 / 6);
  const plate = analyzePlate({
    baselineY: 500,
    solventFrontY: 150,
    spots: [spot("1", 360)],
    calibrationCm: 6,
  });
  close(plate.pixelsPerCm, 58.333333333, 1e-6);
  // 140 px ÷ 58.33 px/cm = 2.40 cm, Rf 0.40
  close(plate.rows[0].distanceCm, 2.4, 1e-9);
  assert.equal(formatCm(plate.rows[0].distanceCm), "2.40 cm");
  assert.equal(formatRf(plate.rows[0].result.rf), "0.40");
  // Calibration never changes the ratio.
  const uncalibrated = analyzePlate({ baselineY: 500, solventFrontY: 150, spots: [spot("1", 360)] });
  assert.equal(uncalibrated.rows[0].distanceCm, null);
  assert.equal(uncalibrated.rows[0].result.rf, plate.rows[0].result.rf);
});

test("calibration input parsing", () => {
  assert.deepEqual(parseCalibrationCm(""), { value: null });
  assert.equal(parseCalibrationCm("6").value, 6);
  assert.equal(parseCalibrationCm(" 7.5 ").value, 7.5);
  assert.equal(parseCalibrationCm("0").error, "Must be greater than zero.");
  assert.equal(parseCalibrationCm("-3").error, "Enter a number.");
  assert.equal(parseCalibrationCm("6cm").error, "Enter a number.");
  assert.equal(pixelsPerCm(0, 6), null);
});

test("a short run is flagged", () => {
  const plate = analyzePlate({ baselineY: 120, solventFrontY: 100, spots: [] });
  assert.equal(plate.errors.length, 0);
  assert.equal(plate.warnings.length, 1);
});

// ── Geometry ─────────────────────────────────────────────────────────────────

test("screen ↔ image round-trip survives fit and zoom", () => {
  const fit = fitView(2000, 3000, 390, 520);
  const view = zoomAt(fit, 3.7, { x: 120, y: 333 }, fit.scale);
  const p = { x: 812.25, y: 1999.5 };
  const back = screenToImage(imageToScreen(p, view), view);
  close(back.x, p.x, 1e-9);
  close(back.y, p.y, 1e-9);
  // The anchor stays under the finger while zooming.
  const before = screenToImage({ x: 120, y: 333 }, fit);
  const after = screenToImage({ x: 120, y: 333 }, view);
  close(after.x, before.x, 1e-9);
  close(after.y, before.y, 1e-9);
});

test("Rf is independent of zoom: the same screen marks give the same Rf at any scale", () => {
  const view = { scale: 0.25, offsetX: 30, offsetY: 12 };
  const img = (sy: number) => screenToImage({ x: 0, y: sy }, view).y;
  const r1 = calculateRf({ baselineY: img(137), solventFrontY: img(49.5), spotY: img(102) }).rf;
  const zoomed = zoomAt(view, 5, { x: 10, y: 90 }, 0.25);
  const toZoomed = (sy: number) => imageToScreen({ x: 0, y: img(sy) }, zoomed).y;
  const again = (sy: number) => screenToImage({ x: 0, y: toZoomed(sy) }, zoomed).y;
  const r2 = calculateRf({ baselineY: again(137), solventFrontY: again(49.5), spotY: again(102) }).rf;
  close(r2, r1 as number, 1e-12);
});

test("rotated bounds are exact at right angles", () => {
  assert.deepEqual(rotatedBounds(400, 900, 90), { width: 900, height: 400 });
  assert.deepEqual(rotatedBounds(400, 900, 180), { width: 400, height: 900 });
});

test("homography maps a skewed plate onto a rectangle", () => {
  const from: Quad = [
    { x: 102, y: 80 },
    { x: 510, y: 120 },
    { x: 540, y: 980 },
    { x: 60, y: 940 },
  ];
  const to: Quad = [
    { x: 0, y: 0 },
    { x: 480, y: 0 },
    { x: 480, y: 900 },
    { x: 0, y: 900 },
  ];
  const h = computeHomography(from, to);
  assert.ok(h);
  for (let i = 0; i < 4; i++) {
    const p = applyHomography(h, from[i]);
    close(p.x, to[i].x, 1e-6);
    close(p.y, to[i].y, 1e-6);
  }
  assert.equal(computeHomography([from[0], from[0], from[2], from[3]], to), null, "degenerate quad");
  const shuffled = orderQuad([from[2], from[0], from[3], from[1]]);
  assert.deepEqual(shuffled, from);
});

// ── Detection ────────────────────────────────────────────────────────────────

const crop = (buffer: PixelBuffer, x0: number, y0: number, w: number, h: number): PixelBuffer => {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const from = ((y0 + y) * buffer.width + x0) * 4;
    data.set(buffer.data.subarray(from, from + w * 4), y * w * 4);
  }
  return { data, width: w, height: h };
};

test("finds the plate on the bench", () => {
  const sample = createSamplePlate();
  const factor = 3;
  const small: PixelBuffer = { data: new Uint8ClampedArray(0), width: 0, height: 0 };
  // Nearest-neighbour shrink is enough for an outline.
  small.width = Math.floor(sample.buffer.width / factor);
  small.height = Math.floor(sample.buffer.height / factor);
  small.data = new Uint8ClampedArray(small.width * small.height * 4);
  for (let y = 0; y < small.height; y++) {
    for (let x = 0; x < small.width; x++) {
      const s = (y * factor * sample.buffer.width + x * factor) * 4;
      small.data.set(sample.buffer.data.subarray(s, s + 4), (y * small.width + x) * 4);
    }
  }
  const found = detectPlate(small);
  assert.ok(found, "plate not found");
  const [tl, , br] = found.quad.map((p) => ({ x: p.x * factor, y: p.y * factor }));
  const { plate } = sample;
  assert.ok(Math.abs(tl.x - plate.x) < 20 && Math.abs(tl.y - plate.y) < 20, `TL ${JSON.stringify(tl)}`);
  assert.ok(
    Math.abs(br.x - (plate.x + plate.width)) < 20 && Math.abs(br.y - (plate.y + plate.height)) < 20,
    `BR ${JSON.stringify(br)}`,
  );
});

test("a plain grey image has no plate", () => {
  const data = new Uint8ClampedArray(200 * 200 * 4).fill(128);
  assert.equal(detectPlate({ data, width: 200, height: 200 }), null);
});

test("detects every drawn spot on the sample plate, and the Rf values match", () => {
  const sample = createSamplePlate();
  const { plate } = sample;
  const buffer = crop(sample.buffer, plate.x, plate.y, plate.width, plate.height);
  const result = detectSpots(buffer, { sensitivity: 60, polarity: "dark" });

  assert.equal(result.spots.length, sample.spots.length, `found ${JSON.stringify(result.spots)}`);
  const baselineY = sample.baselineY - plate.y;
  const frontY = sample.solventFrontY - plate.y;
  for (const truth of sample.spots) {
    const tx = truth.x - plate.x;
    const ty = truth.y - plate.y;
    const match = result.spots.find((s) => Math.hypot(s.x - tx, s.y - ty) < 12);
    assert.ok(match, `no detection near (${tx}, ${ty})`);
    const expected = (baselineY - ty) / (baselineY - frontY);
    const got = calculateRf({ baselineY, solventFrontY: frontY, spotY: match.y }).rf as number;
    // Centroid within a few pixels on an 820 px run → Rf within 0.01.
    assert.ok(Math.abs(got - expected) < 0.01, `Rf ${got} vs ${expected}`);
  }
});

test("no spots on a blank plate, and a pencil line alone is not a spot", () => {
  const w = 400;
  const h = 700;
  const data = new Uint8ClampedArray(w * h * 4);
  let seed = 3;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const noise = (seed / 0x7fffffff - 0.5) * 8;
      const line = Math.abs(y - 600) <= 1 && x > 20 && x < 380 ? 0.6 : 1;
      const o = (y * w + x) * 4;
      data[o] = 240 * line + noise;
      data[o + 1] = 240 * line + noise;
      data[o + 2] = 232 * line + noise;
      data[o + 3] = 255;
    }
  }
  const result = detectSpots({ data, width: w, height: h }, { sensitivity: 100, polarity: "dark" });
  assert.deepEqual(result.spots, []);
});

test("light (fluorescent) spots are found only with light polarity", () => {
  const w = 300;
  const h = 500;
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot(x - 150, y - 250);
      const a = d < 20 ? 1 : d < 26 ? (26 - d) / 6 : 0;
      const o = (y * w + x) * 4;
      data[o] = 40 + 150 * a;
      data[o + 1] = 45 + 190 * a;
      data[o + 2] = 90 + 150 * a;
      data[o + 3] = 255;
    }
  }
  const buffer = { data, width: w, height: h };
  assert.equal(detectSpots(buffer, { sensitivity: 50, polarity: "dark" }).spots.length, 0);
  const light = detectSpots(buffer, { sensitivity: 50, polarity: "light" }).spots;
  assert.equal(light.length, 1);
  close(light[0].x, 150, 1);
  close(light[0].y, 250, 1);
});

test("lane order: left to right, baseline upwards within a lane", () => {
  const order = laneOrder(
    [
      { x: 305, y: 400 },
      { x: 100, y: 600 },
      { x: 298, y: 700 },
      { x: 102, y: 300 },
    ],
    30,
  );
  assert.deepEqual(order, [1, 3, 2, 0]);
});
