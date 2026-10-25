/**
 * Virtual Labs — Pharmaceutics: Physical Properties of Liquids (2026-10-25).
 *
 *   node --test scripts/vlab-liquid-properties.test.mts
 *
 * The reference data and their temperature relations (normal, boundary, invalid, units),
 * then the experiment driven through the run machine like a student in the room: a careful
 * student completes all three activities and the clean-up with no mistakes and results within
 * the acceptance bands of the cited values; each mistake is recorded once and moves its result
 * the right way; the equipment gate refuses bypasses; Learning's pointer never reveals a value,
 * a choice or a timing judgement; the room's visual matches the contract; RoboPharma follows
 * suggest() in Learning and names no target in Practical.
 *
 * Expected reference values were worked independently (Python / by hand from the cited
 * formulas), not read back from the functions.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/ts-resolve.mjs", import.meta.url);

const M = await import("../src/lib/virtual-labs/engine/machine.ts");
const L = await import("../src/lib/virtual-labs/calculations/liquidProperties.ts");
const P = await import("../src/lib/virtual-labs/calculations/pharmaceutics.ts");
const X = await import("../src/lib/virtual-labs/experiments/pharmaceutics/liquidProperties.ts");
const C = await import("../src/lib/virtual-labs/experiments/pharmaceutics/contract.ts");
const { tutorMessage } = await import("../src/lib/virtual-labs/tutor.ts");
const DEF = X.LIQUID_PROPERTIES;

const near = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} expected ${b} ± ${tol}, got ${a}`);

/** Learning's pointer must name a real controller and an action that controller performs (or be null). */
function checkSuggestion(def: any, s: any) {
  const sug = def.suggest(s);
  if (sug === null) return;
  const c = def.controllers.find((x: any) => x.id === sug.controller);
  assert.ok(c, `suggest() names an unknown controller "${sug.controller}"`);
  assert.ok(c.actions.includes(sug.action), `suggest() points at "${sug.action}", which ${c.id} cannot do`);
}

/**
 * Never reveal: a pointer carries no value or option; it never points at starting/stopping the
 * stopwatch or at a worked solution; and it points at "let it flow" only while the meniscus is
 * at least 2 s from the next mark (closer, judging the crossing is the student's skill).
 */
const NEVER = new Set(["startWatch", "stopWatch", "solution"]);
function checkNoReveal(s: any) {
  const sug = DEF.suggest(s);
  if (sug === null) return;
  assert.deepEqual(Object.keys(sug).sort(), ["action", "controller"], "a suggestion carries no value or option");
  assert.ok(!NEVER.has(sug.action), `suggest() pointed at ${sug.action}`);
  if (sug.action === "flow") {
    const t = s.visc.t10 / 10;
    const mark = s.visc.start10 === null ? s.visc.tu : s.visc.tl;
    assert.ok(mark - t >= 2 - 1e-9, `flow suggested ${(mark - t).toFixed(2)} s before a mark`);
  }
}

/** Drive a definition like a student in the room: select the instrument, then act (copied from virtual-labs.test.mts). */
function driver(def: any, seed = 7, mode: "learning" | "practical" = "learning") {
  let run = M.createRun(def, seed, mode);
  const states: any[] = [];
  const act = (action: any) => {
    if (action.type !== "inspect" && !run.submitted) {
      const via = M.controllersForAction(def, action);
      if (!via.length) throw new Error(`no instrument in ${def.meta.id} can perform "${action.type}"`);
      if (!via.some((c: any) => c.id === run.active)) run = M.reduceRun(def, run, { type: "operate", equipment: via[0].equipment[0] });
    }
    run = M.reduceRun(def, run, { type: "act", action });
    checkSuggestion(def, run.s);
    checkNoReveal(run.s);
    states.push(run);
    return run;
  };
  return { get run() { return run; }, get s() { return run.s; }, act, states, msg: (m: any) => (run = M.reduceRun(def, run, m)) };
}
type D = ReturnType<typeof driver>;

const errs = (d: D) => d.run.last.filter((f: any) => f.kind === "error");
const count = (d: D, id: string) => d.run.mistakes.filter((m: any) => m.id === id).length;
/** Act and require the bench to accept it (no refusal). */
function must(d: D, a: any) {
  const r = d.act(a);
  assert.equal(errs(d).length, 0, `${a.type} refused: ${errs(d).map((f: any) => f.text).join(" | ")}`);
  return r;
}

// ── 1. Reference data and helpers ──────────────────────────────────────────

test("water: tables interpolate linearly, refuse outside 15–30 °C", () => {
  assert.equal(L.waterDensity(25), 0.99705);
  near(L.waterDensity(22), 0.99821 + (0.99705 - 0.99821) * 0.4, 1e-12);
  near(L.waterViscosity(27.5), (0.89 + 0.7972) / 2, 1e-12);
  near(L.waterSurfaceTension(18), 73.49 + (72.74 - 73.49) * 0.6, 1e-12);
  assert.equal(L.waterDensity(15), 0.9991);
  assert.ok(Number.isNaN(L.waterDensity(14.9)));
  assert.ok(Number.isNaN(L.waterDensity(30.1)));
  assert.ok(Number.isNaN(L.waterDensity(NaN)));
});

test("ethanol: Lange's density, CRC viscosity (Andrade), Jasper surface tension", () => {
  assert.equal(L.ethanolDensity(25), 0.78522);
  near(L.ethanolDensity(20), 0.78945, 1e-12);
  near(L.ethanolViscosity(25), 1.074, 1e-12);
  // B = ln(1.074/0.694) / (1/298.15 − 1/323.15) = 1682.9 K (worked by hand)
  near(L.ETHANOL_ANDRADE_B, 1682.9, 0.2);
  near(L.ethanolViscosity(20), 1.183, 0.002); // CRC lists ~1.19 at 20 °C
  assert.ok(L.ethanolViscosity(22) > L.ethanolViscosity(25), "viscosity falls as temperature rises");
  near(L.ethanolSurfaceTension(25), 21.97, 1e-9);
  near(L.ethanolSurfaceTension(20), 22.386, 1e-9);
  assert.ok(Number.isNaN(L.ethanolSurfaceTension(31)));
});

test("glycerol–water 50 % w/w: Volk & Kähler density, Cheng viscosity reproduce the tabulated 20 °C values", () => {
  near(L.glycerolWaterDensity(0.5, 20), 1.1263, 0.0003); // CRC / Bosart & Snoddy: 1.1263 g/mL
  near(L.glycerolWaterViscosity(0.5, 20), 6.0, 0.02); // Segur & Oberstar: 6.00 mPa·s
  near(L.glycerolWaterViscosity(0.5, 25), 5.004, 0.002);
  near(L.glycerolWaterDensity(0.5, 25), 1.12363, 0.0001);
  // limits: pure water end (w = 0) is water's viscosity by Cheng's own water formula
  near(L.glycerolWaterViscosity(0, 25), 0.8927, 0.001);
  near(L.glycerolWaterDensity(0, 25), 0.99705, 0.0002);
  assert.ok(Number.isNaN(L.glycerolWaterDensity(1.1, 25)));
  assert.ok(Number.isNaN(L.glycerolWaterViscosity(0.5, -1)));
  near(L.glycerolSurfaceTension(18), 70.0, 1e-9);
  near(L.glycerolSurfaceTension(25), 70.0 * (71.97 / L.waterSurfaceTension(18)), 1e-9);
});

test("liquidData, kinematic viscosity and flow time: units and invalid input", () => {
  const w = L.liquidData("water", 25);
  assert.deepEqual(w, { rho: 0.99705, eta: 0.89, gamma: 71.97 });
  near(L.kinematicViscosity(0.89, 0.99705), 0.89263, 1e-5); // mPa·s ÷ g/mL = mm²/s
  near(L.flowTime(0.89263, 0.0089), 100.3, 0.05); // s
  assert.ok(Number.isNaN(L.kinematicViscosity(0, 1)));
  assert.ok(Number.isNaN(L.flowTime(1, 0)));
  for (const l of L.LIQUIDS) assert.ok(Number.isNaN(L.liquidData(l, 40).rho), `${l} outside the data range`);
});

test("helpers: mixing rule, concordance, % difference, tilt", () => {
  near(L.mixedKinematic(4, 1, 0), 4, 1e-12);
  near(L.mixedKinematic(4, 1, 1), 1, 1e-12);
  near(L.mixedKinematic(4, 1, 0.5), 2, 1e-12); // geometric mean
  assert.ok(Number.isNaN(L.mixedKinematic(4, 1, 1.2)));
  assert.deepEqual(L.concordant([100.1, 100.3, 100.2])?.set, [100.1, 100.3, 100.2]);
  near(L.concordant([99, 100.1, 100.3, 100.2])!.mean, 100.2, 1e-9);
  assert.equal(L.concordant([100, 100.6, 100.2]), null);
  assert.equal(L.concordant([100, 100.1]), null);
  near(L.percentDifference(1.02, 1), 2, 1e-9);
  assert.ok(Number.isNaN(L.percentDifference(1, 0)));
  near(L.readingAlongTilt(10, 60), 20, 1e-9);
  assert.ok(Number.isNaN(L.readingAlongTilt(10, 90)));
});

test("ethanol rises less than water because of its real γ and ρ (h = 2γ/ρgr)", () => {
  const hw = P.capillaryRiseHeight(71.97, 0.99705, 0.25);
  const he = P.capillaryRiseHeight(21.97, 0.78522, 0.25);
  near(hw, 58.885, 0.01); // 2 × 0.07197 / (997.05 × 9.80665 × 0.00025) m
  near(he, 22.825, 0.01);
  near(he / hw, (21.97 / 0.78522) / (71.97 / 0.99705), 1e-9);
});

// ── 2. The careful student ─────────────────────────────────────────────────

/** Advance the meniscus with the coarse-to-fine controls until it is within 0.1 s of `target` s. */
function flowTo(d: D, target: number) {
  for (const step of [30, 5, 1, 0.2]) while (d.s.visc.t10 / 10 + step <= target + 0.1 + 1e-9) must(d, { type: "flow", seconds: step });
}
/** One timed run, started and stopped at the marks the student sees. */
function timeRun(d: D, opts: { lateStartS?: number } = {}) {
  must(d, { type: "viscDraw" });
  flowTo(d, d.s.visc.tu + (opts.lateStartS ?? 0));
  must(d, { type: "startWatch" });
  flowTo(d, d.s.visc.tl);
  must(d, { type: "stopWatch" });
  // the student reads the stopwatch — from the room's visual, not from state
  must(d, { type: "recordTime", value: X.liquidPropertiesVisual(d.s).stopwatch.seconds });
}
function timeUntilConcordant(d: D, l: string) {
  for (let i = 0; i < 8 && X.meanTime(d.s, l) === null; i++) timeRun(d);
  assert.ok(X.meanTime(d.s, l) !== null, `${l}: no concordant times`);
}
function getOut(d: D, cabinet: string, items: string[]) {
  must(d, { type: "cabinet", cabinet, open: true });
  for (const it of items) must(d, { type: "retrieve", item: it });
}

interface Opts {
  mode?: "learning" | "practical";
  seed?: number;
  wetEmpty?: boolean;
  carryover?: boolean;
  noWipeWater?: boolean;
  hotStopperWater?: boolean;
  ethanolMl?: number;
  wetViscometer?: boolean;
  lateStart?: boolean;
  dirtyCapillary?: boolean;
  tilted?: boolean;
  /** stop after the bench readings of this activity */
  stopAfter?: "density" | "viscosity" | "surface";
}

const exact = (d: D, k: string) => X.calcExpected(d.s, k);

function carefulRun(o: Opts = {}) {
  const d = driver(DEF, o.seed ?? 11, o.mode ?? "learning");
  // Setup
  must(d, { type: "setBath", c: 25 });
  getOut(d, "cabinet-instruments", ["thermometer", "stopwatch"]);
  must(d, { type: "thermoIn" });
  must(d, { type: "wait", minutes: 10 });
  must(d, { type: "recordBathTemp", value: X.liquidPropertiesVisual(d.s).bathC });
  getOut(d, "cabinet-glass", ["pycnometer", "viscometer", "pipette", "capillary", "beaker"]);
  getOut(d, "cabinet-reagents", ["sample-water", "sample-ethanol", "sample-glycerol"]);

  // A. Density
  if (o.wetEmpty) {
    must(d, { type: "tap", on: true });
    must(d, { type: "rinse", item: "pycnometer" });
    must(d, { type: "tap", on: false });
  }
  must(d, { type: "pycWeigh" });
  must(d, { type: "recordMass", value: X.liquidPropertiesVisual(d.s).balance.reading });
  for (const l of ["water", "ethanol", "glycerol"]) {
    if (d.s.pyc.content) must(d, { type: "pycEmpty" });
    if (d.s.pyc.residue && !(o.carryover && l === "ethanol")) {
      if (d.s.pyc.residue === "glycerol") {
        must(d, { type: "tap", on: true });
        must(d, { type: "rinse", item: "pycnometer" });
        must(d, { type: "tap", on: false });
      }
      if (l === "glycerol") must(d, { type: "pycRinseWith", liquid: "glycerol" }); // the other correct route
      else must(d, { type: "pycDry" });
    }
    must(d, { type: "pycFill", liquid: l });
    must(d, { type: "pycToBath" });
    if (!(o.hotStopperWater && l === "water")) must(d, { type: "wait", minutes: 10 });
    must(d, { type: "pycStopper" });
    if (!(o.noWipeWater && l === "water")) must(d, { type: "pycWipe" });
    must(d, { type: "pycWeigh" });
    must(d, { type: "recordMass", value: X.liquidPropertiesVisual(d.s).balance.reading });
  }
  for (const k of X.CALC_KEYS.density) must(d, { type: "calc", key: k, value: Number(exact(d, k).toFixed(4)) });
  if (o.stopAfter === "density") return d;

  // B. Viscosity
  must(d, { type: "selectActivity", activity: "viscosity" });
  for (const l of ["water", "ethanol", "glycerol"]) {
    if (d.s.visc.charge) must(d, { type: "viscEmpty" });
    if (d.s.visc.residue && !(o.wetViscometer && l === "ethanol")) must(d, { type: "viscDry" });
    must(d, { type: "viscClamp" });
    must(d, { type: "viscCharge", liquid: l, ml: l === "ethanol" && o.ethanolMl ? o.ethanolMl : 10 });
    must(d, { type: "wait", minutes: 10 });
    if (o.lateStart && l === "ethanol") timeRun(d, { lateStartS: 2 });
    timeUntilConcordant(d, l);
  }
  for (const k of X.CALC_KEYS.viscosity) must(d, { type: "calc", key: k, value: Number(exact(d, k).toFixed(3)) });
  if (o.stopAfter === "viscosity") return d;

  // C. Surface tension
  must(d, { type: "selectActivity", activity: "surface" });
  if (!o.dirtyCapillary) {
    must(d, { type: "tap", on: true });
    must(d, { type: "rinse", item: "capillary" });
    must(d, { type: "tap", on: false });
  }
  if (!o.tilted) must(d, { type: "capAlign" });
  for (const l of ["water", "ethanol", "glycerol"]) {
    if (d.s.cap.dipped) must(d, { type: "capLift" });
    if (d.s.beaker.liquid) must(d, { type: "beakerEmpty" });
    must(d, { type: "beakerFill", liquid: l });
    must(d, { type: "beakerToBath" });
    must(d, { type: "wait", minutes: 10 });
    must(d, { type: "capDip" });
    must(d, { type: "recordRise", value: Math.round(d.s.cap.readMm * 10) / 10 }); // read to 0.1 mm on the magnified scale
  }
  must(d, { type: "capLift" });
  must(d, { type: "beakerEmpty" });
  must(d, { type: "capDiscard" });
  for (const k of X.CALC_KEYS.surface) must(d, { type: "calc", key: k, value: Number(exact(d, k).toFixed(2)) });
  if (o.stopAfter === "surface") return d;

  // Clean-up
  must(d, { type: "pycEmpty" });
  must(d, { type: "viscEmpty" });
  must(d, { type: "thermoOut" });
  must(d, { type: "tap", on: true });
  must(d, { type: "rinse", item: "pycnometer" });
  must(d, { type: "rinse", item: "viscometer" });
  // the tap stays on: sink-safe waste goes down only with running water
  const STREAM: Record<string, string> = { water: "sink", ethanol: "organic", glycerol: "aqueous" };
  for (const w of [...d.s.bench.pending]) must(d, { type: "dispose", waste: w, stream: w === "capillary-used" ? "glass" : STREAM[w.split("-")[1]] });
  must(d, { type: "tap", on: false });
  for (const cab of ["cabinet-glass", "cabinet-instruments", "cabinet-reagents"]) {
    must(d, { type: "cabinet", cabinet: cab, open: true });
    for (const it of d.s.bench.out.filter((x: string) => C.EQUIPMENT_PLAN["liquid-properties"].stored[x] === cab)) must(d, { type: "return", item: it });
  }
  must(d, { type: "cabinet", cabinet: "cabinet-reagents", open: false });
  return d;
}

test("careful student: all three activities and the clean-up, no mistakes, results within the cited bands", () => {
  const d = carefulRun();
  assert.deepEqual(d.run.mistakes, [], `mistakes: ${d.run.mistakes.map((m: any) => m.id).join(", ")}`);
  for (const st of DEF.steps) assert.ok(DEF.stepComplete(d.s, st.id), `step ${st.id} not complete`);
  assert.ok(DEF.benchComplete(d.s));
  assert.equal(DEF.suggest(d.s), null, "nothing left to point at");
  const rows = X.resultsTable(d.s);
  for (const r of rows) for (const p of ["sg", "rho", "eta", "gamma"] as const) if (r[p].pass !== null) assert.ok(r[p].pass, `${r.liquid} ${p}: ${r[p].value} vs ${r[p].ref} (${r[p].diff?.toFixed(2)} %)`);
  // the numbers themselves, against independently worked reference values
  near(d.s.calc["sg-ethanol"], 0.78522 / 0.99705, 0.0006);
  near(d.s.calc["rho-glycerol"], 1.12363, 0.0006);
  near(d.s.calc["eta-ethanol"], 1.074, 1.074 * 0.01);
  near(d.s.calc["eta-glycerol"], 5.004, 5.004 * 0.01);
  near(d.s.calc["gamma-water"], 71.97, 71.97 * 0.01);
  near(d.s.calc["gamma-ethanol"], 21.97, 21.97 * 0.02);
  near(d.s.calc["gamma-glycerol"], 68.97, 68.97 * 0.02);
  // ethanol's lower rise follows from its real γ and ρ
  assert.ok(d.s.rise.ethanol < 0.4 * d.s.rise.water);
  // waste went to the right streams; nothing hazardous to the sink
  assert.deepEqual(d.s.bench.pending, []);
  for (const w of d.s.bench.disposed) {
    if (w.id.endsWith("ethanol")) assert.equal(w.stream, "organic");
    if (w.id.endsWith("glycerol")) assert.equal(w.stream, "aqueous");
  }
  assert.ok(d.s.bench.disposed.some((w: any) => w.id === "capillary-used" && w.stream === "glass"));
  // the report reads from the student's data
  const answered = DEF.questions.reduce((r: any, q: any) => M.reduceRun(DEF, r, { type: "answer", questionId: q.id, choice: q.answer }), d.run);
  const subm = M.reduceRun(DEF, answered, { type: "submit" });
  assert.ok(subm.submitted);
  const rep = M.finalReport(DEF, subm);
  assert.equal(rep.technique, 100);
  assert.equal(rep.assessment.percent, 100);
  assert.ok(rep.experiment.outcome.filter((o: any) => o.verdict === "fail").length === 0);
  assert.ok(rep.experiment.calculations.every((c: any) => c.result !== "—"));
  assert.match(JSON.stringify(rep.experiment.calculations), /mPa·s/);
  assert.match(JSON.stringify(rep.observations), /Simulated/);
});

test("careful student in Practical: same bench, same result, no hint penalty", () => {
  const d = carefulRun({ mode: "practical", seed: 23 });
  assert.deepEqual(d.run.mistakes, []);
  assert.ok(DEF.benchComplete(d.s));
  assert.ok(d.run.assessed);
});

// ── 3. Each mistake: recorded once, result moves the right way ─────────────

const base = carefulRun({ stopAfter: "surface" });
const val = (d: D, k: string) => d.s.calc[k];

test("pyc-wet-empty: m₁ too high → ethanol SG low, glycerol SG high", () => {
  const d = carefulRun({ wetEmpty: true, stopAfter: "density" });
  assert.equal(count(d, "pyc-wet-empty"), 1);
  assert.ok(val(d, "sg-ethanol") < val(base, "sg-ethanol"));
  assert.ok(val(d, "sg-glycerol") > val(base, "sg-glycerol"));
});

test("pyc-carryover: water left in the bottle pulls ethanol's density up", () => {
  const d = carefulRun({ carryover: true, stopAfter: "density" });
  assert.equal(count(d, "pyc-carryover"), 1);
  assert.ok(val(d, "rho-ethanol") > val(base, "rho-ethanol") + 0.002);
});

test("pyc-not-wiped: bath water on the outside of the water-filled bottle → both SGs low", () => {
  const d = carefulRun({ noWipeWater: true, stopAfter: "density" });
  assert.equal(count(d, "pyc-not-wiped"), 1);
  assert.ok(val(d, "sg-ethanol") < val(base, "sg-ethanol"));
  assert.ok(val(d, "sg-glycerol") < val(base, "sg-glycerol"));
});

test("not-equilibrated: water stoppered cold (denser) → m₂ high → sample SGs low", () => {
  const d = carefulRun({ hotStopperWater: true, stopAfter: "density" });
  assert.equal(count(d, "not-equilibrated"), 1);
  assert.match(d.run.mistakes.find((m: any) => m.id === "not-equilibrated").consequence, /comes out low/);
  assert.ok(val(d, "sg-ethanol") < val(base, "sg-ethanol"));
  assert.ok(val(d, "sg-glycerol") < val(base, "sg-glycerol"));
});

test("visc-volume-mismatch: less ethanol than water → faster flow → viscosity low", () => {
  const d = carefulRun({ ethanolMl: 8, stopAfter: "viscosity" });
  assert.equal(count(d, "visc-volume-mismatch"), 1);
  assert.ok(val(d, "eta-ethanol") < val(base, "eta-ethanol") * 0.97);
});

test("viscometer-wet: water left in it thins the ethanol charge → viscosity low", () => {
  const d = carefulRun({ wetViscometer: true, stopAfter: "viscosity" });
  assert.equal(count(d, "viscometer-wet"), 1);
  assert.ok(val(d, "eta-ethanol") < val(base, "eta-ethanol"));
});

test("timing-off-mark: a late start is recorded once and that run is short", () => {
  const d = carefulRun({ lateStart: true, stopAfter: "viscosity" });
  assert.equal(count(d, "timing-off-mark"), 1);
  const times = d.s.times.ethanol;
  assert.ok(times[0] < Math.min(...times.slice(-3)) - 1.5, "the late-started run is about 2 s short");
  assert.ok(X.meanTime(d.s, "ethanol") !== null, "further concordant runs replace it");
});

test("capillary-dirty: contact angle > 0 → water's absolute surface tension low", () => {
  const d = carefulRun({ dirtyCapillary: true, stopAfter: "surface" });
  assert.equal(count(d, "capillary-dirty"), 1);
  assert.ok(val(d, "gamma-water") < val(base, "gamma-water") * 0.9);
  assert.equal(X.resultsTable(d.s)[0].gamma.pass, false);
});

test("capillary-tilted: a slanted scale reads a longer column → water's absolute surface tension high", () => {
  const d = carefulRun({ tilted: true, stopAfter: "surface" });
  assert.equal(count(d, "capillary-tilted"), 1);
  assert.ok(val(d, "gamma-water") > val(base, "gamma-water") * 1.02);
});

test("bath set-point other than 25 °C is refused and recorded; misreads are refused and recorded", () => {
  const d = driver(DEF, 3);
  d.act({ type: "setBath", c: 37 });
  assert.equal(d.s.bath.set, null);
  assert.equal(count(d, "bath-setpoint"), 1);
  d.act({ type: "setBath", c: 30 });
  assert.equal(count(d, "bath-setpoint"), 1, "scored once");
  must(d, { type: "setBath", c: 25 });
  getOut(d, "cabinet-instruments", ["thermometer"]);
  must(d, { type: "thermoIn" });
  d.act({ type: "recordBathTemp", value: 99 });
  assert.equal(count(d, "transcription"), 1);
  // reading before the bath is steady is refused (not a mistake): it is not at the set-point yet
  d.act({ type: "recordBathTemp", value: X.liquidPropertiesVisual(d.s).bathC });
  assert.equal(d.s.bath.checked, null);
});

test("calculation: a wrong answer is a mistake (once per activity) and counts an attempt", () => {
  // the run as it stood with every density reading recorded and no calculation yet
  let run = atDensityCalcs("learning");
  run = M.reduceRun(DEF, run, { type: "act", action: { type: "calc", key: "sg-ethanol", value: 0.5 } });
  run = M.reduceRun(DEF, run, { type: "act", action: { type: "calc", key: "sg-glycerol", value: 0.5 } });
  assert.equal(run.mistakes.filter((m: any) => m.id === "calc-density").length, 1);
  assert.equal(run.s.attempts["sg-ethanol"], 1);
  assert.equal(run.s.calc["sg-ethanol"], undefined);
});

// ── 4. Worked solutions ─────────────────────────────────────────────────────

function atDensityCalcs(mode: "learning" | "practical") {
  const d = carefulRun({ stopAfter: "density", mode });
  const last = d.states.findLast((r: any) => Object.keys(r.s.calc).length === 0);
  return M.reduceRun(DEF, { ...last, active: null }, { type: "operate", equipment: "notebook" });
}

test("worked solution: free and available any time in Learning; shows variables, formula, substitution with units", () => {
  let run = atDensityCalcs("learning");
  run = M.reduceRun(DEF, run, { type: "act", action: { type: "solution", key: "rho-ethanol", mode: "learning" } });
  assert.ok(run.s.solutions.includes("rho-ethanol"));
  assert.equal(run.mistakes.length, 0);
  const ws = X.workedSolution(run.s, "rho-ethanol");
  assert.match(ws.lines[0], /^Variables:.*g/);
  assert.match(ws.lines[1], /^Formula:/);
  assert.match(ws.lines[2], /^Substitution:.* g/);
  assert.match(ws.result, /g\/mL$/);
  for (const k of [...X.CALC_KEYS.density]) assert.ok(X.workedSolution(run.s, k), k);
});

test("worked solution in Practical: refused before an attempt; after a wrong attempt it opens and costs 3 marks", () => {
  let run = atDensityCalcs("practical");
  const before = run.s;
  run = M.reduceRun(DEF, run, { type: "act", action: { type: "solution", key: "sg-ethanol", mode: "practical" } });
  assert.equal(run.s, before, "refused");
  run = M.reduceRun(DEF, run, { type: "act", action: { type: "calc", key: "sg-ethanol", value: 0.9 } });
  run = M.reduceRun(DEF, run, { type: "act", action: { type: "solution", key: "sg-ethanol", mode: "practical" } });
  assert.ok(run.s.solutions.includes("sg-ethanol"));
  const m = run.mistakes.find((x: any) => x.id === "worked-solution-sg-ethanol");
  assert.equal(m?.weight, 3);
  run = M.reduceRun(DEF, run, { type: "act", action: { type: "solution", key: "sg-ethanol", mode: "practical" } });
  assert.equal(run.mistakes.filter((x: any) => x.id === "worked-solution-sg-ethanol").length, 1);
});

// ── 5. Waste and the sink ───────────────────────────────────────────────────

test("waste: ethanol never goes down the sink (refused, heavy mistake); glycerol to the sink is the wrong stream", () => {
  const d = carefulRun({ stopAfter: "density" });
  must(d, { type: "pycEmpty" }); // the glycerol mixture; the ethanol was emptied earlier in the run
  // purified water to the sink is refused while the tap is off (shared kit rule)
  d.act({ type: "dispose", waste: "pyc-water", stream: "sink" });
  assert.ok(d.s.bench.pending.includes("pyc-water"));
  assert.match(d.run.last[0].text, /tap on/i);
  const s0 = d.s;
  d.act({ type: "dispose", waste: "pyc-glycerol", stream: "sink" });
  assert.equal(d.s, s0, "refused");
  assert.equal(count(d, "waste-wrong-stream"), 1);
  assert.ok(d.s.bench.pending.includes("pyc-ethanol"));
  d.act({ type: "dispose", waste: "pyc-ethanol", stream: "sink" });
  assert.equal(count(d, "waste-hazard-to-sink"), 1);
  assert.ok(d.s.bench.pending.includes("pyc-ethanol"), "still pending");
  must(d, { type: "dispose", waste: "pyc-ethanol", stream: "organic" });
  must(d, { type: "dispose", waste: "pyc-glycerol", stream: "aqueous" });
});

test("waste: rinsing a viscometer that still holds ethanol is refused as ethanol-to-sink", () => {
  const d = carefulRun({ stopAfter: "density" });
  must(d, { type: "selectActivity", activity: "viscosity" });
  must(d, { type: "viscClamp" });
  must(d, { type: "viscCharge", liquid: "water", ml: 10 });
  must(d, { type: "wait", minutes: 10 });
  timeUntilConcordant(d, "water");
  must(d, { type: "viscEmpty" });
  must(d, { type: "viscDry" });
  must(d, { type: "viscClamp" });
  must(d, { type: "viscCharge", liquid: "ethanol", ml: 10 });
  must(d, { type: "tap", on: true });
  const s0 = d.s;
  d.act({ type: "rinse", item: "viscometer" });
  assert.equal(d.s, s0);
  assert.equal(count(d, "waste-hazard-to-sink"), 1);
});

test("glycerol cannot be dried off — it must be rinsed out first; a used capillary is never put back", () => {
  const d = carefulRun({ stopAfter: "surface" });
  must(d, { type: "pycEmpty" });
  const s0 = d.s;
  d.act({ type: "pycDry" });
  assert.equal(d.s, s0);
  assert.match(d.run.last[0].text, /Glycerol does not evaporate/);
  must(d, { type: "cabinet", cabinet: "cabinet-glass", open: true });
  d.act({ type: "return", item: "capillary" });
  assert.match(d.run.last[0].text, /single-use/);
});

// ── 6. The equipment gate ───────────────────────────────────────────────────

test("bypass: no action without its instrument open; a wrong instrument is refused", () => {
  let run = M.createRun(DEF, 3);
  for (const a of [{ type: "pycFill", liquid: "water" }, { type: "startWatch" }, { type: "recordRise", value: 50 }, { type: "calc", key: "sg-ethanol", value: 0.78 }, { type: "setBath", c: 25 }]) {
    const after = M.reduceRun(DEF, run, { type: "act", action: a });
    assert.equal(after.s, run.s, `${a.type} worked with nothing open`);
    assert.match(after.last[0].text, /select it in the lab/);
  }
  run = M.reduceRun(DEF, run, { type: "operate", equipment: "balance" });
  assert.equal(run.active, "balance");
  for (const a of [{ type: "viscCharge", liquid: "water", ml: 10 }, { type: "recordTime", value: 100 }, { type: "capDip" }, { type: "setBath", c: 25 }]) {
    const after = M.reduceRun(DEF, run, { type: "act", action: a });
    assert.equal(after.s, run.s, `${a.type} worked from the balance`);
  }
  // equipment opens its controller
  for (const [eq, ctrl] of [["pipette", "viscometer"], ["thermometer", "bath"], ["beaker", "capillary"], ["water-bath", "bath"], ["sink", "sink"]]) {
    assert.equal(M.reduceRun(DEF, M.createRun(DEF, 3), { type: "operate", equipment: eq }).active, ctrl, eq);
  }
});

test("bypass: activities run A → B → C, and an activity's apparatus is refused outside it", () => {
  const d = driver(DEF, 3);
  d.act({ type: "selectActivity", activity: "viscosity" });
  assert.equal(d.s.activity, "density");
  assert.match(d.run.last[0].text, /densities you measure/);
  getOut(d, "cabinet-glass", ["viscometer", "capillary"]);
  const s0 = d.s;
  d.act({ type: "viscClamp" });
  assert.equal(d.s, s0);
  d.act({ type: "capAlign" }); // aligning a holder is allowed in any activity (it is preparation)
  const dd = carefulRun({ stopAfter: "density" });
  dd.act({ type: "selectActivity", activity: "surface" });
  assert.equal(dd.s.activity, "density", "C needs B first");
});

test("every action type is reachable on an instrument; every equipment id is in the contract", () => {
  const plan = C.EQUIPMENT_PLAN["liquid-properties"];
  const ids = new Set([...plan.fixed, ...Object.keys(plan.stored), ...C.FIXTURES.filter((f: string) => f !== "notebook" || true)]);
  for (const e of DEF.equipment) assert.ok(ids.has(e.id), `equipment ${e.id} is not in the room's contract`);
  for (const c of DEF.controllers) for (const e of c.equipment) assert.ok(ids.has(e), `${c.id} opens on ${e}`);
  for (const id of [...plan.fixed, ...Object.keys(plan.stored)]) assert.ok(DEF.equipment.some((e: any) => e.id === id), `contract item ${id} missing from the definition`);
  const types = new Set(DEF.controllers.flatMap((c: any) => c.actions));
  for (const t of ["selectActivity", "calc", "solution", "setBath", "thermoIn", "thermoOut", "wait", "recordBathTemp", "pycWeigh", "recordMass", "pycFill", "pycRinseWith", "pycToBath", "pycStopper", "pycWipe", "pycEmpty", "pycDry", "viscClamp", "viscCharge", "viscDraw", "flow", "startWatch", "stopWatch", "recordTime", "viscEmpty", "viscDry", "beakerFill", "beakerToBath", "beakerEmpty", "capAlign", "capDip", "recordRise", "capLift", "capDiscard", "cabinet", "retrieve", "return", "tap", "rinse", "dispose"]) assert.ok(types.has(t), t);
  assert.ok(DEF.steps.length >= 5 && DEF.questions.length >= 6 && DEF.safety.length >= 3 && DEF.principle.length >= 3);
  for (const st of DEF.steps) assert.ok(st.hints.length >= 1);
  for (const st of DEF.steps.filter((x: any) => x.id.endsWith("-calc"))) {
    assert.equal(st.hints.length, 3, `${st.id}: variables → formula → substitution`);
    assert.match(st.hints[0], /^Variables/);
    assert.match(st.hints[1], /^Formula/);
    assert.match(st.hints[2], /^Substitution/);
  }
});

// ── 7. Learning's pointer, the visual, the tutor ────────────────────────────

test("suggest never reveals a value, a choice or a timing judgement at any state of the scripted runs", () => {
  // checkNoReveal runs on every state inside the driver; here: the stopwatch phase specifically
  const d = carefulRun({ stopAfter: "viscosity" });
  let quiet = 0;
  for (const r of d.states) {
    const sug = DEF.suggest(r.s);
    if (r.s.visc.flowing && sug === null) quiet++;
  }
  assert.ok(quiet > 0, "Learning goes quiet near the marks");
  assert.equal(DEF.suggest(DEF.initial(1)).action, "setBath");
});

test("visual matches the contract at key states", () => {
  const d = driver(DEF, 5);
  const shape = (v: any) => {
    assert.deepEqual(Object.keys(v).sort(), ["activity", "balance", "bathC", "beakerMl", "capillary", "common", "pycnometer", "sample", "stopwatch", "viscometer"]);
    assert.deepEqual(Object.keys(v.pycnometer).sort(), ["content", "dried", "onBalance", "stoppered"]);
    assert.deepEqual(Object.keys(v.viscometer).sort(), ["charged", "flowing", "inBath", "level"]);
    assert.deepEqual(Object.keys(v.stopwatch).sort(), ["running", "seconds"]);
    assert.deepEqual(Object.keys(v.capillary).sort(), ["dipped", "riseMm", "tiltDeg"]);
    assert.deepEqual(Object.keys(v.common).sort(), ["open", "out", "rinsing", "tap", "waste"]);
    assert.ok(v.viscometer.level >= 0 && v.viscometer.level <= 1);
    assert.ok(["empty", "sample-water", "sample-ethanol", "sample-glycerol"].includes(v.pycnometer.content));
  };
  let v = X.liquidPropertiesVisual(d.s);
  shape(v);
  assert.equal(v.bathC, 22);
  assert.equal(v.pycnometer.content, "empty");
  assert.equal(v.pycnometer.dried, true);
  const full = carefulRun({ stopAfter: "density" });
  const onPan = full.states.find((r: any) => r.s.pyc.onBalance && r.s.pyc.content === "ethanol");
  v = X.liquidPropertiesVisual(onPan.s);
  shape(v);
  assert.equal(v.pycnometer.content, "sample-ethanol");
  assert.ok(v.balance.reading > 35 && v.balance.reading < 45, `${v.balance.reading}`);
  const visc = carefulRun({ stopAfter: "viscosity" });
  const flowing = visc.states.find((r: any) => r.s.visc.flowing && r.s.visc.start10 !== null);
  v = X.liquidPropertiesVisual(flowing.s);
  shape(v);
  assert.ok(v.viscometer.flowing && v.viscometer.inBath && v.viscometer.charged && v.stopwatch.running);
  assert.ok(v.viscometer.level >= 0.09 && v.viscometer.level <= 0.91, "at or between the marks while timing (start may be up to 0.1 s early)");
  const dipped = base.states.find((r: any) => r.s.cap.dipped === "ethanol");
  v = X.liquidPropertiesVisual(dipped.s);
  shape(v);
  assert.equal(v.activity, "surface");
  assert.equal(v.capillary.dipped, true);
  near(v.capillary.riseMm, 22.8, 0.2);
  assert.equal(v.capillary.tiltDeg, 0, "a vertical holder");
  assert.equal(v.beakerMl, 30);
  assert.equal(v.sample, "sample-ethanol");
});

test("RoboPharma follows suggest() in Learning and names no target in Practical", () => {
  const d = carefulRun({ stopAfter: "density" });
  let checked = 0;
  for (const r of d.states) {
    if (DEF.benchComplete(r.s) || r.last.some((f: any) => f.mistake || f.kind === "error" || f.kind === "warn")) continue;
    const msg = tutorMessage(DEF, r);
    const sug = DEF.suggest(r.s);
    const stepId = M.currentStepId(DEF, r.s);
    const want = sug ? DEF.controllers.find((c: any) => c.id === sug.controller).equipment[0] : DEF.steps.find((x: any) => x.id === stepId).focus[0];
    assert.equal(msg.target, want);
    checked++;
  }
  assert.ok(checked > 20);
  const p = carefulRun({ stopAfter: "density", mode: "practical", seed: 23 });
  for (const r of p.states) {
    const msg = tutorMessage(DEF, r);
    assert.equal(msg.target, null);
    const text = [msg.title, ...msg.lines].join(" ");
    for (const c of DEF.controllers) assert.ok(!text.includes(`Open the ${c.name}`), "Practical names no instrument to open");
  }
  // in Practical a hint costs marks
  const h = tutorMessage(DEF, p.states[3]);
  assert.equal(h.hint?.cost, M.HINT_COST);
});

test("PROCEDURE: referenced simulation with sources and assumptions", () => {
  assert.equal(X.PROCEDURE.status, "referenced_simulation");
  assert.ok(X.PROCEDURE.sources.length >= 5 && X.PROCEDURE.sources.every((s: any) => /^https:\/\//.test(s.url)));
  assert.ok(X.PROCEDURE.assumptions.length >= 5);
  assert.equal(DEF.meta.id, "liquid-properties");
});
