/**
 * Tests for the Drug Stability Kinetics Calculator's pure layer.
 *
 *   node --test scripts/stability-kinetics.test.mts
 *
 * The anchor is the Procaine HCl practical sheet (50 °C, A₀ = 0.597, six
 * readings). Every regression is checked against an independent computation
 * written here (covariance form), not against the module's own sums.
 */
import { register } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";

register("./lib/ts-resolve.mjs", import.meta.url);

const M = await import("../src/app/(site)/calculation-tools/(tools)/stability-kinetics-calculator/_stability-kinetics.ts");

const A0 = "0.597";
const SHEET: [string, string][] = [
  ["5", "0.470"],
  ["10", "0.425"],
  ["15", "0.398"],
  ["20", "0.371"],
  ["25", "0.325"],
  ["30", "0.299"],
];

const cells = (pairs: [string, string][]) => pairs.map(([time, absorbance]) => ({ time, absorbance }));
const analyse = (pairs = SHEET, a0 = A0, temp = "50") => M.analyseStability(a0, temp, cells(pairs), true);

const close = (actual: number, expected: number, tol = 1e-9) =>
  assert.ok(Math.abs(actual - expected) <= tol * Math.max(1, Math.abs(expected)), `${actual} ≠ ${expected}`);

/** Independent least squares: covariance / variance, R² as the squared correlation. */
function reference(x: number[], y: number[]) {
  const n = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  const slope = sxy / sxx;
  return { slope, intercept: my - slope * mx, r2: (sxy * sxy) / (sxx * syy) };
}

const fitOf = (a: ReturnType<typeof analyse>, order: "zero" | "first" | "second") => {
  const f = a.fits!.find((x) => x.order === order)!.result;
  assert.ok(f.ok);
  return f.value;
};

// ─── % remaining ────────────────────────────────────────────────────────────

test("% remaining matches the sheet's expected values to two decimals", () => {
  const a = analyse();
  assert.deepEqual(a.rows!.map((r) => r.percent.toFixed(2)), ["78.73", "71.19", "66.67", "62.14", "54.44", "50.08"]);
});

test("% remaining is (At / A0) × 100 at full precision, and moves with A0", () => {
  const a = analyse();
  close(a.rows![0].percent, (0.47 / 0.597) * 100);
  const b = analyse(SHEET, "0.5");
  close(b.rows![0].percent, 94);
});

test("ln and 1/x columns are derived from the unrounded % remaining", () => {
  const r = analyse().rows![3];
  close(r.lnPercent, Math.log((0.371 / 0.597) * 100));
  close(r.inversePercent, 1 / ((0.371 / 0.597) * 100));
});

// ─── Regression ─────────────────────────────────────────────────────────────

test("all three fits agree with an independent covariance computation", () => {
  const a = analyse();
  const t = a.rows!.map((r) => r.time);
  const ys = {
    zero: a.rows!.map((r) => r.percent),
    first: a.rows!.map((r) => r.lnPercent),
    second: a.rows!.map((r) => r.inversePercent),
  };
  for (const order of ["zero", "first", "second"] as const) {
    const ref = reference(t, ys[order]);
    const f = fitOf(a, order);
    close(f.fit.slope, ref.slope);
    close(f.fit.intercept, ref.intercept);
    close(f.fit.r2 as number, ref.r2);
  }
});

test("k = −slope for zero and first order, +slope for second", () => {
  const a = analyse();
  close(fitOf(a, "zero").k, -fitOf(a, "zero").fit.slope);
  close(fitOf(a, "first").k, -fitOf(a, "first").fit.slope);
  close(fitOf(a, "second").k, fitOf(a, "second").fit.slope);
  assert.ok(fitOf(a, "zero").k > 0 && fitOf(a, "first").k > 0 && fitOf(a, "second").k > 0);
});

test("the sheet's data are zero order — chosen by R², not assumed first order", () => {
  const a = analyse();
  assert.equal(a.best!.order, "zero");
  assert.equal(a.runnerUp, "first");
  assert.equal(fitOf(a, "zero").fit.r2!.toFixed(4), "0.9927");
  assert.equal(fitOf(a, "first").fit.r2!.toFixed(4), "0.9902");
  assert.equal(fitOf(a, "second").fit.r2!.toFixed(4), "0.9789");
  close(a.margin!, fitOf(a, "zero").fit.r2! - fitOf(a, "first").fit.r2!);
});

test("a close R² race is warned about, not hidden", () => {
  const a = analyse();
  assert.ok(a.warnings.some((w) => w.includes("almost equally well")));
});

test("exact first-order data are identified as first order", () => {
  const k = 0.03;
  const pairs: [string, string][] = [0, 10, 20, 30, 40, 50].map((t) => [String(t), String(0.6 * Math.exp(-k * t))]);
  const a = analyse(pairs, "0.6");
  assert.equal(a.best!.order, "first");
  close(a.best!.k, k, 1e-9);
  close(a.best!.fit.r2 as number, 1, 1e-12);
});

test("exact second-order data are identified as second order", () => {
  const k = 0.0005;
  const pairs: [string, string][] = [0, 10, 20, 30, 40, 50].map((t) => [String(t), String(0.6 / (100 * (1 / 100 + k * t)))]);
  const a = analyse(pairs, "0.6");
  assert.equal(a.best!.order, "second");
  close(a.best!.k, k, 1e-9);
});

// ─── k, t½, t90 ─────────────────────────────────────────────────────────────

test("zero order: t½ = C0/2k and t90 = 0.1·C0/k with C0 = 100", () => {
  const a = analyse();
  const k = a.best!.k;
  assert.ok(a.derived!.halfLife.ok && a.derived!.t90.ok);
  close(a.derived!.halfLife.value, 100 / (2 * k));
  close(a.derived!.t90.value, 10 / k);
  assert.equal(k.toFixed(4), "1.1314");
  assert.equal(a.derived!.halfLife.value.toFixed(2), "44.19");
  assert.equal(a.derived!.t90.value.toFixed(2), "8.84");
});

test("first order uses the sheet's constants 0.693 and 0.10536", () => {
  const d = M.deriveFromK("first", 0.02);
  assert.ok(d.halfLife.ok && d.t90.ok);
  close(d.halfLife.value, 0.693 / 0.02);
  close(d.t90.value, 0.10536 / 0.02);
});

test("second order: t½ = 1/(kC0); t90 = 1/(90k) − 1/(100k) = 1/(900k)", () => {
  const d = M.deriveFromK("second", 0.0005);
  assert.ok(d.halfLife.ok && d.t90.ok);
  close(d.halfLife.value, 1 / (0.0005 * 100));
  close(d.t90.value, 1 / (900 * 0.0005));
});

test("k ≤ 0 gives an explanation, never a negative or infinite half-life", () => {
  for (const k of [0, -0.1]) {
    const d = M.deriveFromK("first", k);
    assert.equal(d.halfLife.ok, false);
    assert.equal(d.t90.ok, false);
  }
  const rising: [string, string][] = [["5", "0.4"], ["10", "0.45"], ["15", "0.5"]];
  const a = analyse(rising, "0.6");
  assert.ok(a.derived && !a.derived.t90.ok);
});

test("units follow the order and the chosen time unit", () => {
  assert.equal(M.kUnit("zero", "min"), "% min⁻¹");
  assert.equal(M.kUnit("first", "h"), "h⁻¹");
  assert.equal(M.kUnit("second", "min"), "%⁻¹ min⁻¹");
});

test("the trend line back-transforms each order to % remaining", () => {
  const a = analyse();
  const z = fitOf(a, "zero");
  close(M.predictPercent(z, 0)!, z.fit.intercept);
  const f = fitOf(a, "first");
  close(M.predictPercent(f, 10)!, Math.exp(f.fit.intercept + f.fit.slope * 10));
});

// ─── Validation ─────────────────────────────────────────────────────────────

test("A0 must be a positive number", () => {
  assert.ok(analyse(SHEET, "0").a0Error);
  assert.ok(analyse(SHEET, "-1").a0Error);
  assert.ok(analyse(SHEET, "abc").a0Error);
  assert.equal(analyse(SHEET, "0").rows, null);
});

test("zero, negative or non-numeric absorbance is a cell error, not NaN", () => {
  for (const bad of ["0", "-0.1", "0.4a"]) {
    const pairs: [string, string][] = [...SHEET];
    pairs[2] = ["15", bad];
    const a = analyse(pairs);
    assert.ok(a.cellErrors["2:absorbance"], bad);
    assert.equal(a.rows, null);
  }
});

test("fewer than three time points cannot be compared", () => {
  const a = analyse(SHEET.slice(0, 2));
  assert.ok(a.blocking.length > 0);
  assert.equal(a.best, null);
});

test("empty fields are only reported once Calculate has been pressed", () => {
  const quiet = M.analyseStability("", "", cells([["", ""], ["", ""], ["", ""]]), false);
  assert.deepEqual(quiet.cellErrors, {});
  assert.equal(quiet.a0Error, undefined);
  const loud = M.analyseStability("", "", cells([["", ""], ["", ""], ["", ""]]), true);
  assert.equal(loud.a0Error, "Required.");
  assert.equal(Object.keys(loud.cellErrors).length, 6);
});

test("temperature is a condition: it never changes the numbers, but must be numeric", () => {
  const a = analyse(SHEET, A0, "50");
  const b = analyse(SHEET, A0, "25");
  close(a.best!.k, b.best!.k);
  assert.ok(analyse(SHEET, A0, "hot").temperatureError);
});

test("readings above A0 are flagged as > 100 % remaining", () => {
  const a = analyse([["5", "0.7"], ["10", "0.5"], ["15", "0.4"]], "0.6");
  assert.ok(a.warnings.some((w) => w.includes("above A₀")));
});

test("all times equal cannot be fitted", () => {
  const a = analyse([["5", "0.5"], ["5", "0.4"], ["5", "0.3"]], "0.6");
  assert.equal(a.best, null);
  assert.ok(a.blocking.length > 0);
});

// ─── Interpretation ─────────────────────────────────────────────────────────

test("the interpretation fills in the numbers and states it is an accelerated estimate", () => {
  const lines = M.interpretation({
    drug: "Procaine HCl", temperature: "50", order: "zero", r2: "0.9927",
    rateConstant: "1.1314 % min⁻¹", halfLife: "44.19 min", t90: "8.839 min", falling: true,
  });
  assert.ok(lines[0].includes("decreases with increasing time"));
  assert.ok(lines[1].includes("zero order with R² = 0.9927"));
  assert.ok(lines.some((l) => l.includes("8.839 min")));
  assert.ok(lines[lines.length - 1].includes("not the labelled shelf life"));
});
