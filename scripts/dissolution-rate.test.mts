/**
 * Tests for the Dissolution Rate Constant Calculator's pure layer.
 *
 *   node --test scripts/dissolution-rate.test.mts
 *
 * No test framework is installed in this repo; Node runs TypeScript with its
 * built-in type stripping, and `scripts/lib/ts-resolve.mjs` resolves both the
 * extensionless relative imports and the project's `@/` alias.
 *
 * The anchor for every numeric assertion is the supplied practical sheet
 * (Cs = 3.5, seven observations): each column, each worked substitution, and
 * the reported average of 0.000291833.
 */
import { register } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";

register("./lib/ts-resolve.mjs", import.meta.url);

const M = await import("../src/app/(site)/calculation-tools/(tools)/dissolution-rate-constant-calculator/_dissolution-rate.ts");

// ─── The supplied practical data ────────────────────────────────────────────

const CS = "3.5";
const SHEET: [string, string][] = [
  ["0", "0"],
  ["10", "0.000877352"],
  ["20", "0.001009193"],
  ["30", "0.001005587"],
  ["40", "0.001013718"],
  ["50", "0.001167060"],
  ["60", "0.000942714"],
];

const cells = (pairs: [string, string][]) => pairs.map(([time, reading]) => ({ time, reading }));

function analyse(basis: "sheet" | "all" = "sheet", pairs = SHEET, cs = CS) {
  return M.analyseDissolutionRate(cs, cells(pairs), basis, true);
}

/** Value of a Checked<number>, asserting it succeeded. */
function value(checked: any, what: string): number {
  assert.ok(checked && checked.ok, `${what} should be calculable: ${checked?.error}`);
  return checked.value;
}

/** The mean out of a Checked<AverageResult>. */
function averaged(checked: any, what: string): number {
  assert.ok(checked && checked.ok, `${what} should be calculable: ${checked?.error}`);
  return checked.value.value;
}

/** Equal to `digits` significant figures, the way the sheet prints. */
function closeTo(actual: number, expected: number, digits = 6, what = "value") {
  const tolerance = Math.abs(expected) * Math.pow(10, -(digits - 1)) * 0.5;
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${what}: expected ≈ ${expected}, got ${actual} (tolerance ${tolerance})`,
  );
}

// ─── Midpoint ───────────────────────────────────────────────────────────────

test("midpoint is the mean of this reading and the next", () => {
  const rows = analyse().rows!;
  closeTo(rows[0].midpoint, (0 + 0.000877352) / 2, 12, "midpoint at t=0");
  assert.equal(rows[0].midpoint, 0.000438676);
  // 1-ULP float dust makes a strict compare against the decimal literal fail,
  // so the check is on the printed figure the student actually reads.
  closeTo(rows[1].midpoint, (0.000877352 + 0.001009193) / 2, 12, "midpoint at t=10");
  assert.equal(M.formatDecimal(rows[1].midpoint, 7), "0.0009432725");
});

test("the final row's midpoint looks backwards, per the sheet's convention", () => {
  const rows = analyse().rows!;
  const last = rows[rows.length - 1];
  assert.equal(last.midpointFrom.backwards, true);
  closeTo(last.midpoint, (0.001167060 + 0.000942714) / 2, 12, "midpoint at t=60");
  assert.equal(M.formatDecimal(last.midpoint, 7), "0.001054887");
  // It is therefore a repeat of the previous row's midpoint.
  assert.equal(last.midpoint, rows[rows.length - 2].midpoint);
});

// ─── dC/dt ──────────────────────────────────────────────────────────────────

test("dC/dt is (C₂ − C₁) / (t₂ − t₁) for every interval", () => {
  const rows = analyse().rows!;
  closeTo(value(rows[0].rate, "rate at t=0"), 8.77352e-5, 6, "dC/dt at t=0");
  closeTo(value(rows[1].rate, "rate at t=10"), 1.31841e-5, 6, "dC/dt at t=10");
  closeTo(value(rows[2].rate, "rate at t=20"), (0.001005587 - 0.001009193) / 10, 10, "dC/dt at t=20");
});

test("the final row has no dC/dt and no k from it", () => {
  const rows = analyse().rows!;
  const last = rows[rows.length - 1];
  assert.equal(last.rate, null);
  assert.equal(last.kRate, null);
  assert.equal(last.rateFrom, null);
});

test("a negative rate is kept, flagged, never removed", () => {
  const rows = analyse().rows!;
  const negative = rows.filter((r) => r.rate?.ok && r.rate.value < 0);
  assert.equal(negative.length, 2, "t = 20 and t = 50 fall");
  for (const row of negative) {
    assert.ok(row.flags.some((f) => f.startsWith("Negative rate detected")), "row carries the warning");
    assert.ok(value(row.kRate, "k from a negative rate") < 0, "k stays negative");
  }
  assert.ok(analyse().warnings.some((w) => w.startsWith("Negative rate detected")));
});

// ─── Cs − C ─────────────────────────────────────────────────────────────────

test("Cs − C uses the row's corrected reading, not its midpoint", () => {
  const rows = analyse().rows!;
  assert.equal(rows[0].csMinusC, 3.5);
  closeTo(rows[1].csMinusC, 3.5 - 0.000877352, 12, "Cs − C at t=10");
  assert.equal(M.formatDecimal(rows[1].csMinusC, 10), "3.499122648");
  assert.equal(M.formatDecimal(rows[2].csMinusC, 10), "3.498990807");
  // Not the midpoint — the two differ, and mixing them up is the classic error here.
  assert.notEqual(rows[1].csMinusC, 3.5 - rows[1].midpoint);
});

// ─── The two k columns ──────────────────────────────────────────────────────

test("k = (dC/dt) / (Cs − C) matches the sheet", () => {
  const rows = analyse().rows!;
  closeTo(value(rows[0].kRate, "k at t=0"), 2.50672e-5, 6, "k(dC/dt) at t=0");
  closeTo(value(rows[1].kRate, "k at t=10"), 3.76783e-6, 6, "k(dC/dt) at t=10");
  assert.ok(value(rows[2].kRate, "k at t=20") < 0, "stays negative at t=20");
});

test("k = midpoint / (Cs − C) matches every row of the sheet", () => {
  const rows = analyse().rows!;
  const expected = [0.000125336, 0.000269574, 0.000287909, 0.000288555, 0.000311630, 0.000301497];
  expected.forEach((want, index) => {
    closeTo(value(rows[index].kMidpoint, `k(midpoint) row ${index}`), want, 6, `k(midpoint) at t=${rows[index].time}`);
  });
  // The final row has one too, from the backward midpoint.
  assert.ok(rows[6].kMidpoint.ok);
});

test("the two k columns are different numbers and never substituted for each other", () => {
  const rows = analyse().rows!;
  for (const row of rows.slice(0, 6)) {
    assert.notEqual(value(row.kRate, "k(dC/dt)"), value(row.kMidpoint, "k(midpoint)"));
  }
});

// ─── Average ────────────────────────────────────────────────────────────────

test("the sheet basis reproduces the reported average of 0.000291833", () => {
  const average = averaged(analyse("sheet").average, "average");
  closeTo(average, 0.000291833, 6, "average k");
  assert.equal(M.formatDecimal(average, 6), "0.000291833");
  assert.equal(M.formatValue(average, "scientific", 6), "2.91833 × 10⁻⁴");
});

test("the sheet basis averages the interior rows only", () => {
  const result = analyse("sheet").average as any;
  assert.deepEqual(result.value.indexes, [1, 2, 3, 4, 5]);
  assert.deepEqual(result.value.skipped, []);
});

test("the all-rows basis is a different, also-correct number", () => {
  const rows = analyse().rows!;
  const all = averaged(analyse("all").average, "average over all rows");
  const byHand = rows.reduce((total, row) => total + (row.kMidpoint as any).value, 0) / rows.length;
  closeTo(all, byHand, 12, "average over all rows");
  assert.notEqual(all, averaged(analyse("sheet").average, "sheet average"));
});

test("the average is derived, not stored — editing a reading moves it", () => {
  const edited = SHEET.map((pair, index) => (index === 3 ? ([pair[0], "0.002"] as [string, string]) : pair));
  const before = averaged(analyse("sheet").average, "before");
  const after = averaged(analyse("sheet", edited).average, "after");
  assert.notEqual(before, after);
});

test("the sheet basis explains itself rather than silently averaging two rows", () => {
  const two = analyse("sheet", [["0", "0"], ["10", "0.0008"]]);
  assert.equal(two.average?.ok, false);
  assert.match((two.average as any).error, /All observations/);
  // "All observations" still answers for the same two rows.
  const allTwo = M.analyseDissolutionRate(CS, cells([["0", "0"], ["10", "0.0008"]]), "all", true);
  assert.deepEqual((allTwo.average as any).value.indexes, [0, 1]);
  assert.ok(averaged(allTwo.average, "all over two rows") > 0);
});

test("a row with no k is left out of the average and named", () => {
  // Cs − C = 0 on the third row.
  const data: [string, string][] = [["0", "0"], ["10", "0.5"], ["20", "3.5"], ["30", "1"], ["40", "1.2"]];
  const analysis = M.analyseDissolutionRate("3.5", cells(data), "all", true);
  const rows = analysis.rows!;
  assert.equal(rows[2].kMidpoint.ok, false);
  assert.match((rows[2].kMidpoint as any).error, /divide by zero/);
  const average = analysis.average as any;
  assert.deepEqual(average.value.skipped, [2]);
  assert.ok(!average.value.indexes.includes(2));
  assert.ok(analysis.warnings.some((w: string) => w.includes("Cs − C = 0")));
});

// ─── Validation ─────────────────────────────────────────────────────────────

test("Cs must be a non-zero number", () => {
  assert.equal(M.analyseDissolutionRate("", cells(SHEET), "sheet", true).csError, "Required.");
  assert.equal(M.analyseDissolutionRate("3.5a", cells(SHEET), "sheet", true).csError, "Enter a number.");
  assert.match(M.analyseDissolutionRate("0", cells(SHEET), "sheet", true).csError!, /cannot be zero/);
  assert.match(M.analyseDissolutionRate("-1", cells(SHEET), "sheet", true).csError!, /greater than zero/);
  assert.equal(M.analyseDissolutionRate("0", cells(SHEET), "sheet", true).rows, null);
});

test("missing and non-numeric cells are reported, and stop the table", () => {
  const holed = SHEET.map((pair, index) => (index === 2 ? ([pair[0], ""] as [string, string]) : pair));
  const analysis = M.analyseDissolutionRate(CS, cells(holed), "sheet", true);
  assert.equal(analysis.cellErrors["2:reading"], "Required.");
  assert.equal(analysis.rows, null);

  const bad = SHEET.map((pair, index) => (index === 1 ? ([pair[0], "0.5x"] as [string, string]) : pair));
  assert.equal(M.analyseDissolutionRate(CS, cells(bad), "sheet", true).cellErrors["1:reading"], "Enter a number.");
});

test("an untouched form is not a wall of red until Calculate is pressed", () => {
  const empty = M.analyseDissolutionRate("", cells([["", ""], ["", ""]]), "sheet", false);
  assert.deepEqual(empty.cellErrors, {});
  assert.equal(empty.csError, undefined);
});

test("a duplicate time point is flagged and its dC/dt refuses to divide by zero", () => {
  const dup: [string, string][] = [["0", "0"], ["10", "0.001"], ["10", "0.0012"], ["20", "0.0013"]];
  const analysis = M.analyseDissolutionRate(CS, cells(dup), "all", true);
  assert.equal(analysis.cellErrors["2:time"], "Duplicate time point.");
  assert.ok(analysis.warnings.some((w) => w.includes("t₂ − t₁ = 0")));
  const rows = analysis.rows!;
  assert.equal(rows[1].rate?.ok, false);
  assert.match((rows[1].rate as any).error, /divide by zero/);
  assert.equal(rows[1].kRate?.ok, false);
  // The midpoint column is unaffected — it never divides by Δt.
  assert.ok(rows[1].kMidpoint.ok);
});

test("times running backwards are flagged, and the rows are still calculated as entered", () => {
  const unordered: [string, string][] = [["0", "0"], ["20", "0.001"], ["10", "0.0012"], ["30", "0.0013"]];
  const analysis = M.analyseDissolutionRate(CS, cells(unordered), "all", true);
  assert.ok(analysis.warnings.some((w) => w.includes("Time runs backwards")));
  assert.equal(analysis.rows!.length, 4, "nothing was dropped or re-sorted");
  assert.equal(analysis.rows![0].reading, 0);
  assert.equal(analysis.rows![2].time, 10);
});

test("a reading above Cs gives a negative Cs − C, flagged not hidden", () => {
  const over: [string, string][] = [["0", "0"], ["10", "4"], ["20", "4.2"]];
  const analysis = M.analyseDissolutionRate("3.5", cells(over), "all", true);
  const rows = analysis.rows!;
  assert.ok(rows[1].csMinusC < 0);
  assert.ok(rows[1].flags.some((f) => f.includes("above Cs")));
  assert.ok(analysis.warnings.some((w) => w.includes("greater than Cs")));
  assert.ok(rows[1].kMidpoint.ok, "still calculated, just negative");
});

test("fewer than two observations is blocked with a reason", () => {
  const one = M.analyseDissolutionRate(CS, cells([["0", "0"]]), "all", true);
  assert.equal(one.rows, null);
  assert.equal(one.blocking.length, 1);
  assert.match(one.blocking[0], /At least 2 observations/);
});

// ─── Formatting ─────────────────────────────────────────────────────────────

test("decimal notation never slips into an exponent", () => {
  assert.equal(M.formatDecimal(8.77352e-5, 6), "0.0000877352");
  assert.equal(M.formatDecimal(0.000125336, 6), "0.000125336");
  assert.equal(M.formatDecimal(0, 6), "0");
  assert.equal(M.formatDecimal(-1.03058e-7, 6), "−0.000000103058");
});

test("significant-figure columns keep trailing zeros; Cs − C trims them", () => {
  // 0.000311630 is six figures — the trailing zero carries information.
  assert.equal(M.formatDecimal(0.00031162997, 6), "0.000311630");
  // Cs − C is printed beside Cs, where "3.500000000" is noise.
  assert.equal(M.formatDecimal(3.5, 10, true), "3.5");
  assert.equal(M.formatDecimal(3.499122648, 10, true), "3.499122648");
  assert.equal(M.formatDecimal(3.5, 10), "3.500000000");
});

test("scientific notation is written the way a lab notebook writes it", () => {
  assert.equal(M.formatValue(8.77352e-5, "scientific", 6), "8.77352 × 10⁻⁵");
  assert.equal(M.formatValue(1.31841e-5, "scientific", 6), "1.31841 × 10⁻⁵");
  assert.equal(M.formatValue(2.50672e-5, "scientific", 6), "2.50672 × 10⁻⁵");
  assert.equal(M.formatValue(0, "scientific", 6), "0");
  assert.match(M.formatValue(-3.606e-7, "scientific", 6), /^−3\.60600 × 10⁻⁷$/);
});

test("both notations describe the same number", () => {
  const rows = analyse().rows!;
  for (const row of rows) {
    const k = (row.kMidpoint as any).value as number;
    const decimal = Number(M.formatDecimal(k, 6).replace("−", "-"));
    const scientific = Number(M.formatValue(k, "scientific", 6).replace("−", "-").replace(" × 10", "e").replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => "⁻⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c) === 0 ? "-" : String("⁻⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c) - 1)));
    closeTo(decimal, scientific, 6, "the two notations agree");
  }
});

// ─── Precision ──────────────────────────────────────────────────────────────

test("intermediate values are not rounded before the next step", () => {
  // k from the *unrounded* midpoint, not from its 6-figure display string.
  const rows = analyse().rows!;
  const row = rows[1];
  const fromDisplay = Number(M.formatDecimal(row.midpoint, 6)) / row.csMinusC;
  const actual = value(row.kMidpoint, "k(midpoint)");
  assert.notEqual(actual, fromDisplay, "rounding first would give a different number");
  assert.equal(actual, row.midpoint / row.csMinusC);
});

test("the averaged range is defined independently of the data", () => {
  assert.deepEqual(M.averagedRange(7, "sheet"), [1, 2, 3, 4, 5]);
  assert.deepEqual(M.averagedRange(7, "all"), [0, 1, 2, 3, 4, 5, 6]);
  assert.deepEqual(M.averagedRange(2, "sheet"), []);
  assert.deepEqual(M.averagedRange(3, "sheet"), [1]);
});
