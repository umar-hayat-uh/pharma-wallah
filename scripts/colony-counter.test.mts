/**
 * Tests for the Colony Counter & CFU Calculator's pure modules.
 *
 *   node --test scripts/colony-counter.test.mts
 *
 * Like scripts/tlc-rf.test.mts: no framework, Node's type stripping, and
 * modules that import each other only with `import type`. The detector tests
 * run the real OpenCV.js build from node_modules against synthetic plates
 * (src/components/calculators/colony/sample.ts) whose colony positions are
 * known. They show the pipeline works on those plates — nothing more.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";

import {
  calculateCfu,
  countWarning,
  formatDilution,
  formatPlain,
  formatScientific,
  parseDilution,
  parseVolume,
} from "../src/components/calculators/colony/cfu.ts";
import { DEFAULT_SETTINGS, detectColonies, type CV } from "../src/components/calculators/colony/detect.ts";
import { createSamplePlate } from "../src/components/calculators/colony/sample.ts";
import { compareCounts, matchDetections } from "../src/components/calculators/colony/validation.ts";

// ── CFU ─────────────────────────────────────────────────────────────────────

test("89 colonies, 10⁻⁴, 0.1 mL → 8,900,000 CFU/mL", () => {
  const r = calculateCfu({ colonies: 89, dilution: 0.0001, volumeMl: 0.1 });
  assert.ok(r.ok);
  assert.equal(r.cfuPerMl, 8_900_000);
  assert.equal(formatPlain(r.cfuPerMl), "8,900,000");
  assert.equal(formatScientific(r.cfuPerMl), "8.9 × 10⁶");
});

test("50 colonies, 10⁻³, 1 mL → 50,000 CFU/mL", () => {
  const r = calculateCfu({ colonies: 50, dilution: 0.001, volumeMl: 1 });
  assert.ok(r.ok);
  assert.equal(r.cfuPerMl, 50_000);
  assert.equal(formatScientific(r.cfuPerMl), "5 × 10⁴");
});

test("floating-point dust is removed (123 colonies, 10⁻⁵, 0.1 mL)", () => {
  const r = calculateCfu({ colonies: 123, dilution: 1e-5, volumeMl: 0.1 });
  assert.ok(r.ok);
  assert.equal(r.cfuPerMl, 123_000_000);
  assert.equal(formatScientific(r.cfuPerMl), "1.23 × 10⁸");
});

test("0 colonies is a valid count; negative, fractional, zero dilution and zero volume are not", () => {
  const zero = calculateCfu({ colonies: 0, dilution: 0.01, volumeMl: 0.1 });
  assert.ok(zero.ok);
  assert.equal(zero.cfuPerMl, 0);
  assert.equal(calculateCfu({ colonies: -1, dilution: 0.01, volumeMl: 0.1 }).ok, false);
  assert.equal(calculateCfu({ colonies: 2.5, dilution: 0.01, volumeMl: 0.1 }).ok, false);
  const d = calculateCfu({ colonies: 10, dilution: 0, volumeMl: 0.1 });
  assert.equal(d.ok, false);
  assert.match(!d.ok ? d.error : "", /valid dilution/);
  const v = calculateCfu({ colonies: 10, dilution: 0.01, volumeMl: 0 });
  assert.equal(!v.ok && v.error, "Volume plated must be greater than 0.");
  assert.equal(calculateCfu({ colonies: 10, dilution: 2, volumeMl: 1 }).ok, false);
});

test("dilution parsing: decimals, e-notation, powers of ten, 1/x; factors rejected", () => {
  assert.equal(parseDilution("0.0001").value, 0.0001);
  assert.equal(parseDilution("1e-4").value, 0.0001);
  assert.equal(parseDilution("10^-4").value, 0.0001);
  assert.equal(parseDilution("10⁻⁴").value, 0.0001);
  assert.equal(parseDilution("10-6").value, 0.000001);
  assert.equal(parseDilution("2.5 × 10^-3").value, 0.0025);
  assert.equal(parseDilution("1/1000").value, 0.001);
  assert.equal(parseDilution("1").value, 1);
  assert.match(parseDilution("10000").error ?? "", /fraction/);
  assert.match(parseDilution("0").error ?? "", /greater than 0/);
  assert.match(parseDilution("abc").error ?? "", /valid dilution/);
  assert.match(parseDilution("").error ?? "", /Enter a dilution/);
  assert.equal(formatDilution(0.0001), "10⁻⁴");
  assert.equal(formatDilution(0.0025), "2.5 × 10⁻³");
});

test("volume parsing", () => {
  assert.equal(parseVolume("0.1").value, 0.1);
  assert.equal(parseVolume(".01").value, 0.01);
  assert.equal(parseVolume("0").error, "Volume plated must be greater than 0.");
  assert.equal(parseVolume("-1").error, "Enter a number in mL.");
});

test("countability warnings at <30 and >300, none in between", () => {
  assert.equal(countWarning(29)?.kind, "low");
  assert.equal(countWarning(30), null);
  assert.equal(countWarning(300), null);
  assert.equal(countWarning(301)?.kind, "high");
  assert.match(countWarning(5)!.text, /depends on the laboratory method and protocol/);
});

test("scientific formatting rounds across a decade", () => {
  assert.equal(formatScientific(9_999_000), "1 × 10⁷");
  assert.equal(formatScientific(0.00042), "4.2 × 10⁻⁴");
  assert.equal(formatScientific(5), "5");
});

// ── Validation metrics ─────────────────────────────────────────────────────

test("matching: precision, recall, F1", () => {
  const truth = [
    { x: 0, y: 0, r: 5 },
    { x: 100, y: 0, r: 5 },
    { x: 200, y: 0, r: 5 },
    { x: 300, y: 0, r: 5 },
  ];
  const detected = [
    { x: 2, y: 1 },
    { x: 101, y: -2 },
    { x: 199, y: 0 },
    { x: 150, y: 80 }, // false positive
  ];
  const m = matchDetections(truth, detected);
  assert.equal(m.truePositives, 3);
  assert.equal(m.falsePositives, 1);
  assert.equal(m.falseNegatives, 1);
  assert.equal(m.precision, 0.75);
  assert.equal(m.recall, 0.75);
  assert.equal(m.f1, 0.75);
  assert.equal(m.absoluteError, 0);
  const c = compareCounts(52, 49);
  assert.equal(c.absoluteError, 3);
  assert.ok(Math.abs((c.percentError ?? 0) - 5.769) < 0.01);
  assert.equal(c.precision, null);
});

// ── Detection (real OpenCV.js) ─────────────────────────────────────────────

let cvPromise: Promise<CV> | null = null;
function loadCv(): Promise<CV> {
  if (!cvPromise) {
    const require = createRequire(import.meta.url);
    const mod = require("@techstark/opencv-js") as CV | Promise<CV>;
    cvPromise = new Promise<CV>((resolve) => {
      // The Emscripten module is thenable; never resolve a promise with it directly.
      const m = mod as CV & { then?: (cb: (x: CV) => void) => void; Mat?: unknown };
      if (m instanceof Promise) (m as Promise<CV>).then((x) => resolve(x));
      else if (typeof m.then === "function") m.then((x) => { delete (x as { then?: unknown }).then; resolve(x); });
      else resolve(m);
    });
  }
  return cvPromise;
}

for (const variant of ["light", "dark"] as const) {
  test(`${variant} colonies: plate found, count within 5%, touching pairs split, label and rim ignored`, async () => {
    const cv = await loadCv();
    const sample = createSamplePlate({ variant, seed: variant === "light" ? 11 : 23 });
    const result = detectColonies(cv, sample.buffer, DEFAULT_SETTINGS);
    assert.ok(result.plateFound, "plate not found");
    assert.ok(Math.hypot(result.plate.x - sample.plate.x, result.plate.y - sample.plate.y) < sample.plate.r * 0.05, `plate centre ${JSON.stringify(result.plate)}`);
    assert.ok(Math.abs(result.plate.r - sample.plate.r) < sample.plate.r * 0.08, `plate radius ${result.plate.r} vs ${sample.plate.r}`);
    assert.equal(result.polarity, variant);

    const m = matchDetections(sample.colonies, result.colonies);
    console.log(`  ${variant}: expected ${m.expected}, detected ${m.detected}, TP ${m.truePositives}, FP ${m.falsePositives}, FN ${m.falseNegatives}, split groups ${result.splitGroups}, ${result.ms} ms`);
    assert.ok((m.percentError ?? 100) <= 5, `count error ${m.percentError}%`);
    assert.ok((m.precision ?? 0) >= 0.95, `precision ${m.precision}`);
    assert.ok((m.recall ?? 0) >= 0.95, `recall ${m.recall}`);
    assert.ok(result.splitGroups >= 4, `only ${result.splitGroups} touching groups split`);
    // Nothing detected outside the dish (the label) or on its wall.
    for (const c of result.colonies) {
      assert.ok(Math.hypot(c.x - sample.plate.x, c.y - sample.plate.y) < sample.plate.r * 0.94, `detection on the rim/bench at ${c.x},${c.y}`);
    }
  });
}

test("a plate with no colonies gives no detections", async () => {
  const cv = await loadCv();
  const sample = createSamplePlate({ count: 0, touchingPairs: 0, seed: 5 });
  const result = detectColonies(cv, sample.buffer, DEFAULT_SETTINGS);
  assert.ok(result.plateFound);
  assert.equal(result.colonies.length, 0, JSON.stringify(result.colonies.slice(0, 3)));
});

test("a supplied plate circle is used as given, and a large photo is processed at ≤1600 px", async () => {
  const cv = await loadCv();
  const sample = createSamplePlate({ size: 2000, count: 40, touchingPairs: 3, seed: 3 });
  const result = detectColonies(cv, sample.buffer, DEFAULT_SETTINGS, { plate: sample.plate });
  assert.equal(result.processingScale, 0.8);
  assert.ok(Math.abs(result.plate.r - sample.plate.r) < 1);
  const m = matchDetections(sample.colonies, result.colonies);
  assert.ok((m.recall ?? 0) >= 0.9 && (m.precision ?? 0) >= 0.9, JSON.stringify(m));
});

test("an image with no dish reports no-plate instead of failing", async () => {
  const cv = await loadCv();
  const w = 400;
  const data = new Uint8ClampedArray(w * w * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 90 + ((i / 4) % w) / 10;
    data[i + 1] = 90;
    data[i + 2] = 95;
    data[i + 3] = 255;
  }
  const result = detectColonies(cv, { data, width: w, height: w }, DEFAULT_SETTINGS);
  assert.equal(result.plateFound, false);
  assert.ok(result.quality.includes("no-plate"));
  assert.ok(result.quality.includes("low-resolution"));
});

test("steps are reported in order", async () => {
  const cv = await loadCv();
  const sample = createSamplePlate({ size: 500, count: 10, touchingPairs: 0 });
  const steps: number[] = [];
  detectColonies(cv, sample.buffer, DEFAULT_SETTINGS, { onStep: (s) => steps.push(s) });
  assert.deepEqual(steps, [1, 2, 3, 4]);
});

// ── Fixtures (test-data/colony-counter/fixtures.json) ──────────────────────

type SyntheticFixture = {
  id: string;
  variant: "light" | "dark";
  seed: number;
  size?: number;
  count: number;
  touchingPairs: number;
  minPrecision: number;
  minRecall: number;
};
const fixtures = JSON.parse(readFileSync(new URL("../test-data/colony-counter/fixtures.json", import.meta.url), "utf8")) as {
  synthetic: SyntheticFixture[];
};

for (const f of fixtures.synthetic) {
  test(`fixture ${f.id}: precision ≥ ${f.minPrecision}, recall ≥ ${f.minRecall}`, async () => {
    const cv = await loadCv();
    const sample = createSamplePlate(f);
    const result = detectColonies(cv, sample.buffer, DEFAULT_SETTINGS);
    const m = matchDetections(sample.colonies, result.colonies);
    console.log(
      `  ${f.id}: expected ${m.expected}, automatic ${m.detected}, correct ${m.truePositives}, FP ${m.falsePositives}, FN ${m.falseNegatives}, ` +
        `abs error ${m.absoluteError}, ${m.percentError?.toFixed(1)}%, P ${m.precision?.toFixed(3)}, R ${m.recall?.toFixed(3)}, F1 ${m.f1?.toFixed(3)}`,
    );
    assert.ok((m.precision ?? 0) >= f.minPrecision, `precision ${m.precision}`);
    assert.ok((m.recall ?? 0) >= f.minRecall, `recall ${m.recall}`);
  });
}
