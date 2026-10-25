/**
 * Pharmaceutics lab — the pure science for the three shortlisted experiments (2026-10-25).
 *
 *   node --test scripts/pharmaceutics-lab.test.mts
 *
 * Every expected value below was worked by hand from the formula and the cited constant,
 * not read back from the function.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/ts-resolve.mjs", import.meta.url);
const P = await import("../src/lib/virtual-labs/calculations/pharmaceutics.ts");
const near = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} expected ${b} ± ${tol}, got ${a}`);

test("sig figs", () => {
  assert.equal(P.sigFig(0.0123456, 3), 0.0123);
  assert.equal(P.sigFig(12345, 2), 12000);
  assert.equal(P.sigFig(0, 3), 0);
});

test("solution preparation: mass, %, molarity, mass for molarity", () => {
  assert.equal(P.massConcentration(500, 100), 5); // 500 mg in 100 mL = 5 mg/mL
  near(P.percentWv(0.9, 100), 0.9, 1e-12); // normal saline
  near(P.molarity(5.844, 58.44, 100), 1.0, 1e-12); // NaCl
  near(P.massForMolarity(0.1, 58.44, 250), 1.461, 1e-9);
  assert.ok(Number.isNaN(P.massConcentration(5, 0)));
  assert.ok(Number.isNaN(P.molarity(-1, 58.44, 100)));
  assert.ok(Number.isNaN(P.massForMolarity(0.1, 0, 250)));
});

test("dilution: C1V1 = C2V2, refuses concentrating, serial stages", () => {
  assert.equal(P.dilutionStockVolume(10, 1, 100), 10); // 10 mL of 10 mg/mL to 100 mL → 1 mg/mL
  assert.equal(P.dilutionStockVolume(5, 5, 50), 50);
  assert.ok(Number.isNaN(P.dilutionStockVolume(1, 2, 100)));
  assert.ok(Number.isNaN(P.dilutionStockVolume(1, 0.5, 0)));
  P.serialDilution(100, [10, 10, 10]).forEach((c, i) => near(c, [10, 1, 0.1][i], 1e-12));
  assert.deepEqual(P.serialDilution(100, [0.5]), []);
  assert.equal(P.dilutionFactor(1, 10), 10);
  assert.ok(Number.isNaN(P.dilutionFactor(20, 10)));
});

test("density, specific gravity, pycnometer", () => {
  assert.equal(P.density(25.0, 20.0), 1.25);
  near(P.specificGravity(1.26, P.WATER_DENSITY[20]), 1.26 / 0.99821, 1e-12);
  // glycerol-like: empty 20.000, water-filled 44.958 (24.958 g water at 20 °C → 25.003 mL), sample 51.462
  const r = P.pycnometer(20.0, 51.462, 44.958, P.WATER_DENSITY[20]);
  near(r.sg, 31.462 / 24.958, 1e-12);
  near(r.density, (31.462 / 24.958) * 0.99821, 1e-12);
  near(r.volumeMl, 24.958 / 0.99821, 1e-12);
  assert.ok(Number.isNaN(P.pycnometer(20, 19, 44.958, 0.99821).sg));
});

test("Ostwald viscometer: relative to water, same temperature", () => {
  // equal density and time → water's viscosity back
  near(P.ostwaldViscosity(0.99821, 100, 0.99821, 100, P.WATER_VISCOSITY[20]), 1.0016, 1e-12);
  // ethanol-ish: ρ 0.789, t 151 s vs water 0.99821, 100 s → 1.0016 × 0.789×151/(0.99821×100)
  near(P.ostwaldViscosity(0.789, 151, 0.99821, 100, 1.0016), 1.0016 * (0.789 * 151) / (0.99821 * 100), 1e-12);
  assert.ok(Number.isNaN(P.ostwaldViscosity(0.789, 0, 0.99821, 100, 1.0016)));
});

test("capillary rise: water at 20 °C in r = 0.25 mm rises ≈ 59.4 mm and gives back 72.74 mN/m", () => {
  const h = P.capillaryRiseHeight(72.74, 0.99821, 0.25);
  // h = 2γ/(ρ g r) = 2·0.07274 / (998.21·9.80665·0.00025) m
  near(h, (2 * 0.07274) / (998.21 * 9.80665 * 0.00025) * 1000, 1e-9);
  near(h, 59.44, 0.01);
  near(P.capillaryRiseTension(0.99821, h, 0.25), 72.74, 1e-9);
  near(P.relativeCapillaryTension(0.789, 22.6, 0.99821, 59.44, 72.74), 72.74 * (0.789 * 22.6) / (0.99821 * 59.44), 1e-12);
  assert.ok(Number.isNaN(P.capillaryRiseTension(1, 10, 0.25, 90)));
  assert.ok(Number.isNaN(P.capillaryRiseTension(1, -1, 0.25)));
});

test("solubility: gravimetric and USP descriptive terms", () => {
  near(P.gravimetricSolubility(0.36, 10), 3.6, 1e-12);
  assert.equal(P.solubilityTerm(0.5), "Very soluble");
  assert.equal(P.solubilityTerm(1), "Freely soluble");
  assert.equal(P.solubilityTerm(29.9), "Soluble");
  assert.equal(P.solubilityTerm(30), "Sparingly soluble");
  assert.equal(P.solubilityTerm(10000), "Practically insoluble");
  near(P.partsSolvent(3.6), 27.78, 0.01);
});

test("water constants match NIST WebBook (IAPWS-95/2008) and IAPWS 2014 to the stated precision", () => {
  // Reference values re-derived 2026-10-25 (docs/virtual-labs/PHARMACEUTICS_REFERENCE_DATA.md §1).
  const rho = { 15: 0.999103, 20: 0.998207, 25: 0.997048, 30: 0.995649 };
  const eta = { 15: 1.13757, 20: 1.00160, 25: 0.890022, 30: 0.797222 };
  // IAPWS R1-76(2014): σ = 235.8 τ^1.256 (1 − 0.625 τ), τ = 1 − T/647.096
  const sigma = (t: number) => { const tau = 1 - (t + 273.15) / 647.096; return 235.8 * tau ** 1.256 * (1 - 0.625 * tau); };
  for (const t of [15, 20, 25, 30] as const) {
    near(P.WATER_DENSITY[t], rho[t], 0.5e-5, `ρ ${t} °C`);
    near(P.WATER_VISCOSITY[t], eta[t], 0.5e-4, `η ${t} °C`);
    near(P.WATER_SURFACE_TENSION[t], sigma(t), 0.005, `γ ${t} °C`);
  }
});

test("USP 5.30: every boundary goes to the less-soluble term", () => {
  const edges: [number, string][] = [
    [0.999, "Very soluble"], [1, "Freely soluble"], [9.99, "Freely soluble"], [10, "Soluble"],
    [30, "Sparingly soluble"], [99.9, "Sparingly soluble"], [100, "Slightly soluble"],
    [1000, "Very slightly soluble"], [9999, "Very slightly soluble"], [10000, "Practically insoluble"],
  ];
  for (const [p, term] of edges) assert.equal(P.solubilityTerm(p), term, `${p} parts`);
  // Paracetamol ≈ 1.4 g/100 mL at 25 °C (Yalkowsky; Granberg & Rasmuson 14.90 g/kg) → ≈ 71 parts → sparingly soluble
  // (derived from the data; the pharmacopoeial description was not re-checked — see PHARMACEUTICS_REFERENCE_DATA.md §4.1).
  assert.equal(P.solubilityTerm(P.partsSolvent(1.4)), "Sparingly soluble");
});

test("dissolution: USP paracetamol tablet conditions, worked by hand", () => {
  // 500 mg tablet, 900 mL, 5 mL withdrawn and replaced at 10, 20, 30 min.
  // Q10 = 0.30·900 = 270; Q20 = 0.45·900 + 5·0.30 = 406.5; Q30 = 0.50·900 + 5·(0.30+0.45) = 453.75 mg → 90.75 %
  const r = P.cumulativeDissolved([{ t: 10, c: 0.30 }, { t: 20, c: 0.45 }, { t: 30, c: 0.50 }], 900, 5, 500, true);
  assert.deepEqual(r.map((x) => +x.mg.toFixed(6)), [270, 406.5, 453.75]);
  near(r[2].percent, 90.75, 1e-9);
  // Without replacement: Q30 = 0.50·890 + 3.75 = 448.75 mg
  near(P.cumulativeDissolved([{ t: 10, c: 0.30 }, { t: 20, c: 0.45 }, { t: 30, c: 0.50 }], 900, 5, 500, false)[2].mg, 448.75, 1e-9);
  // Volume would run out → refused
  assert.deepEqual(P.cumulativeDissolved([{ t: 1, c: 0.1 }, { t: 2, c: 0.1 }, { t: 3, c: 0.1 }], 10, 5, 100, false), []);
});

test("dissolution: sampling corrections, with and without replacement", () => {
  const s = [{ t: 5, c: 0.1 }, { t: 10, c: 0.2 }, { t: 15, c: 0.25 }];
  // replace: Q1 = 0.1·900 = 90; Q2 = 0.2·900 + 5·0.1 = 180.5; Q3 = 0.25·900 + 5·(0.1+0.2) = 226.5
  const r = P.cumulativeDissolved(s, 900, 5, 250, true);
  assert.deepEqual(r.map((x) => +x.mg.toFixed(6)), [90, 180.5, 226.5]);
  near(r[2].percent, 90.6, 1e-9);
  // no replacement: Q2 = 0.2·895 + 0.5 = 179.5; Q3 = 0.25·890 + 1.5 = 224
  const n = P.cumulativeDissolved(s, 900, 5, 250, false);
  assert.deepEqual(n.map((x) => +x.mg.toFixed(6)), [90, 179.5, 224]);
  near(P.uncorrectedPercent(0.25, 900, 250), 90, 1e-9);
  assert.deepEqual(P.cumulativeDissolved([{ t: 10, c: 0.1 }, { t: 5, c: 0.2 }], 900, 5, 250, true), []);
  near(P.firstOrderRelease(Math.LN2 / 0.1, 0.1), 50, 1e-9);
});

test("RoboPharma follows the engine: target = suggest()'s instrument; Practical names none; feedback first", async () => {
  const M = await import("../src/lib/virtual-labs/engine/machine.ts");
  const { SYRUP } = await import("../src/lib/virtual-labs/experiments/syrup.ts");
  const { tutorMessage } = await import("../src/lib/virtual-labs/tutor.ts");
  const run = M.createRun(SYRUP, 7, "learning");
  const intro = tutorMessage(SYRUP, run, true);
  assert.match(intro.title, /RoboPharma/);
  const msg = tutorMessage(SYRUP, run);
  const sug = SYRUP.suggest(run.s);
  const ctrl = sug && SYRUP.controllers.find((c: any) => c.id === sug.controller);
  assert.equal(msg.target, ctrl ? ctrl.equipment[0] : SYRUP.steps[0].focus[0] ?? null);
  assert.equal(msg.hint?.cost, 0);
  const practical = tutorMessage(SYRUP, M.createRun(SYRUP, 7, "practical"));
  assert.equal(practical.target, null);
  assert.equal(practical.hint?.cost, M.HINT_COST);
  // a refused action (nothing open) is what the robot talks about next
  const refused = M.reduceRun(SYRUP, run, { type: "act", action: { type: "tare" } as any });
  const r = tutorMessage(SYRUP, refused);
  assert.equal(r.mood, "thinking");
  assert.equal(r.lines[0], refused.last[0].text);
});
