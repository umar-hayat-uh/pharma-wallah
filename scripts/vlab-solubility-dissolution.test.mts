/**
 * Pharmaceutics — Solubility & Dissolution Studies (2026-10-25).
 *
 *   node --test scripts/vlab-solubility-dissolution.test.mts
 *
 * The science (paracetamol's published solubility, the conversions, the teaching models), a
 * careful student completing BOTH activities through the run machine by operating the
 * equipment (cabinets, cleanup included), each mistake recorded once with the result moving
 * the stated way, bypass attempts, Learning-mode suggestions at every state, the profile chart
 * built only from recorded samples, the room's visual against the contract, and RoboPharma.
 * Expected numbers were worked independently (by hand / Python) from the cited data.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/ts-resolve.mjs", import.meta.url);

const M = await import("../src/lib/virtual-labs/engine/machine.ts");
const P = await import("../src/lib/virtual-labs/calculations/pharmaceutics.ts");
const C = await import("../src/lib/virtual-labs/calculations/solubilityDissolution.ts");
const X = await import("../src/lib/virtual-labs/experiments/pharmaceutics/solubilityDissolution.ts");
const { tutorMessage } = await import("../src/lib/virtual-labs/tutor.ts");
const { EQUIPMENT_PLAN, FIXTURES } = await import("../src/lib/virtual-labs/experiments/pharmaceutics/contract.ts");

const DEF = X.SOLUBILITY_DISSOLUTION;
const near = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} expected ${b} ± ${tol}, got ${a}`);

/** Learning mode's pointer must name a real controller and an action it performs, and nothing else. */
function checkSuggestion(def: any, s: any) {
  const sug = def.suggest(s);
  if (sug === null) return;
  assert.deepEqual(Object.keys(sug).sort(), ["action", "controller"], `a suggestion carries no value: ${JSON.stringify(sug)}`);
  const c = def.controllers.find((x: any) => x.id === sug.controller);
  assert.ok(c, `suggest() names an unknown controller "${sug.controller}"`);
  assert.ok(c.actions.includes(sug.action), `suggest() points at "${sug.action}", which ${c.id} cannot do`);
}

/**
 * Drive the definition like a student in the room: before every physical action, SELECT an
 * instrument that performs it (as LabExperience does on a tap). `at` names the equipment
 * explicitly (cabinets: the cabinet whose door is meant). Every state's suggestion is checked.
 */
function driver(def: any, seed = 7, mode: "learning" | "practical" = "learning") {
  let run = M.createRun(def, seed, mode);
  const states: any[] = [run.s];
  const act = (action: any, at?: string) => {
    if (action.type !== "inspect" && !run.submitted) {
      const via = M.controllersForAction(def, action);
      if (!via.length) throw new Error(`no instrument in ${def.meta.id} can perform "${action.type}"`);
      const equip = at ?? (["cabinet", "retrieve", "return"].includes(action.type) ? cabinetOf(action) : via[0].equipment[0]);
      if (run.active !== M.controllerForEquipment(def, equip)?.id) run = M.reduceRun(def, run, { type: "operate", equipment: equip });
    }
    run = M.reduceRun(def, run, { type: "act", action });
    checkSuggestion(def, run.s);
    states.push(run.s);
    return run;
  };
  return { get run() { return run; }, get s() { return run.s; }, states, act, msg: (m: any) => (run = M.reduceRun(def, run, m)) };
}

function cabinetOf(a: any): string {
  if (a.type === "cabinet") return a.cabinet;
  return X.KIT.storedById.get(a.item)!.cabinet;
}

type D = ReturnType<typeof driver>;
const ok = (d: D, msg: string) => assert.ok(!d.run.last.some((f: any) => f.kind === "error"), `${msg}: ${d.run.last.map((f: any) => f.text).join(" | ")}`);

function fetch(d: D, ...items: string[]) {
  for (const it of items) {
    if (d.s.bench.out.includes(it)) continue;
    const cab = X.KIT.storedById.get(it)!.cabinet;
    if (d.s.bench.open !== cab) d.act({ type: "cabinet", cabinet: cab, open: true });
    d.act({ type: "retrieve", item: it });
    ok(d, `retrieve ${it}`);
  }
}

interface Opts {
  seed?: number;
  mode?: "learning" | "practical";
  scoops?: number;
  hours?: number;
  bathC?: number;
  warm?: boolean;
  ovenC?: number;
  weighHot?: boolean;
  mediumMl?: number;
  startEarly?: boolean;
  rpm?: number;
  skipReplaceAt?: number; // nominal time whose sample is not replaced
  lateAt?: number; // sample this nominal time 1 min late
  missAt?: number; // skip this time point entirely
  noBlank?: boolean;
  dfFor?: (nominal: number) => number;
  stopAfter?: "solubility" | "run" | "measure";
}

/** Activity A to constant mass and the two calculations. */
function solubility(d: D, o: Opts) {
  fetch(d, "flask");
  d.act({ type: "dispenseWater" });
  ok(d, "water");
  fetch(d, "boat", "spatula", "drug");
  d.act({ type: "placeBoat" });
  d.act({ type: "tare" });
  for (let i = 0; i < (o.scoops ?? 4); i++) d.act({ type: "addDrug" });
  d.act({ type: "drugToFlask" });
  ok(d, "drug in");
  d.act({ type: "stopper" }, "flask");
  d.act({ type: "flaskToBath" }, "flask");
  ok(d, "in bath");
  d.act({ type: "bathSet", c: o.bathC ?? 25 });
  d.act({ type: "shake", on: true });
  let h = o.hours ?? 24;
  for (const step of [12, 4, 1]) while (h >= step) (d.act({ type: "waitHours", hours: step }), (h -= step));
  fetch(d, "dish", "pipette");
  d.act({ type: "dishOnBalance" });
  d.act({ type: "recordMass", value: X.balanceReading(d.s) });
  ok(d, "empty dish");
  fetch(d, "syringe-filter");
  if (o.warm !== false) d.act({ type: "warmFilter" });
  d.act({ type: "filter" });
  if (d.s.filtrateGPerMl === null) return; // refused (no excess solid)
  d.act({ type: "pipetteToDish" });
  ok(d, "aliquot");
  d.act({ type: "ovenSet", c: o.ovenC ?? 105 });
  d.act({ type: "dishToOven" });
  d.act({ type: "dry", hours: 2 });
  for (let i = 0; i < 6 && !X.constantMass(d.s); i++) {
    if (d.s.dish.where !== "oven") (d.act({ type: "dishToOven" }), d.act({ type: "dry", hours: 1 }));
    d.act({ type: "removeDish" });
    if (!o.weighHot) d.act({ type: "cool" });
    d.act({ type: "dishOnBalance" });
    d.act({ type: "recordMass", value: X.balanceReading(d.s) });
    ok(d, "weighing");
  }
  assert.ok(X.constantMass(d.s), "dried to constant mass");
  const e = X.expected(d.s);
  d.act({ type: "calcSolubility", gPer100: +e.gPer100!.toFixed(3), mgPerMl: +e.mgPerMl!.toFixed(2) });
  ok(d, "calc solubility");
  const e2 = X.expected(d.s);
  d.act({ type: "calcParts", parts: +e2.parts!.toFixed(1), term: e2.term });
  ok(d, "calc parts");
}

function waitTo(d: D, t: number) {
  for (const step of [5, 1, 0.5]) while (d.s.vessel.t + step <= t + 1e-9) d.act({ type: "waitMin", minutes: step });
}

/** Activity B through the run, measurement and interpretation. */
function dissolution(d: D, o: Opts) {
  d.act({ type: "activity", activity: "dissolution" });
  fetch(d, "cylinder", "medium");
  const ml = o.mediumMl ?? 900;
  for (let i = 0; i < Math.floor(ml / 100); i++) d.act({ type: "pourMedium", ml: 100 });
  for (let i = 0; i < Math.round((ml % 100) / 10); i++) d.act({ type: "pourMedium", ml: 10 });
  d.act({ type: "readCylinder", value: d.s.cyl.ml });
  d.act({ type: "mediumToVessel" });
  ok(d, "vessel filled");
  d.act({ type: "testerTemp", c: 37 });
  d.act({ type: "testerRpm", rpm: o.rpm ?? 50 });
  d.act({ type: "waitMin", minutes: o.startEarly ? 1 : 5 });
  if (!o.startEarly) while (Math.abs(d.s.vessel.tempC - 37) > 0.4) d.act({ type: "waitMin", minutes: 5 });
  d.act({ type: "verify", tempC: +d.s.vessel.tempC.toFixed(1), rpm: d.s.vessel.rpm });
  ok(d, "verify");
  d.act({ type: "calcSink", volumeMl: +X.expected(d.s).sinkMl!.toFixed(1) });
  ok(d, "sink");
  fetch(d, "tablets", "sampler", "tubes");
  d.act({ type: "dropTablet" });
  ok(d, "tablet");
  for (const p of X.METHOD.schedule) {
    if (p === o.missAt) continue;
    waitTo(d, p + (p === o.lateAt ? 1 : 0));
    d.act({ type: "withdraw" });
    ok(d, `sample ${p}`);
    if (p !== o.skipReplaceAt) d.act({ type: "replace" });
  }
  if (o.missAt === 45) waitTo(d, 48);
  d.act({ type: "stopTest" });
  ok(d, "stop");
  if (o.stopAfter === "run") return;
  fetch(d, "cuvette");
  if (!o.noBlank) d.act({ type: "blank" });
  for (let i = 0; i < d.s.samples.length; i++) {
    d.act({ type: "dilute", factor: o.dfFor ? o.dfFor(d.s.samples[i].nominal) : 50 });
    d.act({ type: "loadSample" });
    d.act({ type: "recordAbs", value: X.spectroDisplay(d.s) });
    ok(d, `read ${i}`);
  }
  if (o.stopAfter === "measure") return;
  const e = X.expected(d.s);
  if (e.q !== null) d.act({ type: "calcDissolved", percent: +e.q.toFixed(1) });
  ok(d, "calc dissolved");
  const truth = e.q === null ? "not-determinable" : C.meetsS1Unit(e.q, X.METHOD.q) ? "meets" : "fails";
  d.act({ type: "verdict", verdict: truth });
  ok(d, "verdict");
}

function cleanup(d: D) {
  for (const id of [...d.s.bench.pending]) {
    const w = X.KIT.wasteById.get(id)!;
    d.act({ type: "dispose", waste: id, stream: w.stream });
    ok(d, `dispose ${id}`);
  }
  d.act({ type: "ovenSet", c: 0 });
  d.act({ type: "bathSet", c: 0 });
  d.act({ type: "testerTemp", c: 0 });
  for (const it of [...d.s.bench.out]) {
    const cab = X.KIT.storedById.get(it)!.cabinet;
    if (d.s.bench.open !== cab) d.act({ type: "cabinet", cabinet: cab, open: true });
    d.act({ type: "return", item: it });
    ok(d, `return ${it}`);
  }
  if (d.s.bench.open) d.act({ type: "cabinet", cabinet: d.s.bench.open, open: false });
}

function careful(o: Opts = {}) {
  const d = driver(DEF, o.seed ?? 7, o.mode ?? "learning");
  solubility(d, o);
  if (o.stopAfter === "solubility") return d;
  dissolution(d, o);
  if (o.stopAfter) return d;
  cleanup(d);
  return d;
}

const ids = (d: D) => d.run.mistakes.map((m: any) => m.id);

// ── Science ────────────────────────────────────────────────────────────────

test("paracetamol solubility: published values exactly, van 't Hoff between, NaN outside", () => {
  assert.equal(C.paracetamolSolubility(25), 14.9);
  assert.equal(C.paracetamolSolubility(30), 17.39);
  assert.equal(C.paracetamolSolubility(20), 12.78);
  near(C.paracetamolSolubility(22), 13.5977, 1e-3); // ln Cs linear in 1/T between 20 and 25 °C (Python)
  assert.ok(C.paracetamolSolubility(22) > 12.78 && C.paracetamolSolubility(22) < 14.9);
  assert.ok(Number.isNaN(C.paracetamolSolubility(37)), "no extrapolation outside 0–30 °C");
  assert.ok(Number.isNaN(C.paracetamolSolubility(NaN)));
  const fit = C.vantHoffFit(C.PARACETAMOL_SOLUBILITY_WATER);
  near(fit.dHkJPerMol, 20.32, 0.05); // endothermic
  assert.ok(fit.r2 > 0.99);
});

test("conversions: g/kg water → g/100 mL, parts of solvent, USP term; invalid input", () => {
  near(C.gPerKgToGPer100Ml(14.9, P.WATER_DENSITY[25]), 1.46379, 1e-4);
  near(X.trueSolubilityGPer100(25), 1.46379, 1e-4);
  assert.ok(X.trueSolubilityGPer100(30) > X.trueSolubilityGPer100(25) && X.trueSolubilityGPer100(25) > X.trueSolubilityGPer100(20));
  near(P.partsSolvent(1.46379), 68.32, 0.01);
  assert.equal(P.solubilityTerm(68.3), "Sparingly soluble"); // as the BP/USP describe paracetamol in water
  assert.ok(Number.isNaN(C.gPerKgToGPer100Ml(-1, 1)));
  assert.ok(Number.isNaN(C.gPerKgToGPer100Ml(14.9, 0)));
  near(P.gravimetricSolubility(0.1464, 10), 1.464, 1e-12);
});

test("approach to saturation, constant mass, sink condition", () => {
  near(C.approachSaturation(0, 1, 2.5, 2.5), 1 - Math.exp(-1), 1e-12);
  near(C.approachSaturation(1.2, 1, 100, 2.5), 1, 1e-12, "supersaturated relaxes down");
  assert.ok(Number.isNaN(C.approachSaturation(0, 1, -1, 2.5)));
  assert.ok(C.isConstantMass(42.1234, 42.1238));
  assert.ok(C.isConstantMass(42.1234, 42.1239)); // exactly 0.5 mg
  assert.ok(!C.isConstantMass(42.1234, 42.1241));
  near(C.saturationVolumeMl(500, 14.638), 34.158, 0.001);
  near(C.sinkRatio(900, 500, 14.638), 26.348, 0.001);
  assert.ok(Number.isNaN(C.saturationVolumeMl(500, 0)));
});

test("release model: k with speed and temperature, first-order step, units", () => {
  near(C.releaseRateConstant(0.12, 50, 37), 0.12, 1e-12);
  near(C.releaseRateConstant(0.12, 200, 37), 0.24, 1e-12); // k ∝ rpm^0.5
  near(C.releaseRateConstant(0.12, 50, 32), 0.105679, 1e-5); // Ea 20 kJ/mol (Python)
  assert.equal(C.releaseRateConstant(0.12, 0, 37), 0);
  assert.ok(Number.isNaN(C.releaseRateConstant(0.12, -5, 37)));
  near(C.stepFirstOrder(0, 1, 0.1, Math.LN2 / 0.1), 0.5, 1e-12);
  assert.equal(C.stepFirstOrder(1, 1, 0.1, 5), 1);
  near(P.firstOrderRelease(30, 0.12), 100 * (1 - Math.exp(-3.6)), 1e-9);
});

test("spectrophotometry: calibration both ways, dilution, display beyond the linear range", () => {
  near(C.absorbanceFor(10, 0.065, 0.002), 0.652, 1e-12);
  near(C.concentrationFromAbsorbance(0.652, 0.065, 0.002), 10, 1e-12);
  near(C.sampleConcentrationMgPerMl(0.652, 0.065, 0.002, 50), 0.5, 1e-12); // 10 µg/mL × 50 = 500 µg/mL
  assert.ok(Number.isNaN(C.sampleConcentrationMgPerMl(0.652, 0.065, 0.002, 0.5)));
  assert.equal(C.displayedAbsorbance(0.8), 0.8);
  near(C.displayedAbsorbance(1.5), 1.48, 1e-12); // below the line
  assert.ok(Number.isNaN(C.displayedAbsorbance(3.2)), "OVER");
  assert.equal(C.samplingTolerance(5), 0.25);
  near(C.samplingTolerance(45), 0.9, 1e-12);
  assert.ok(C.meetsS1Unit(85, 80) && !C.meetsS1Unit(84.9, 80));
});

test("both sampling corrections agree with the vessel's mass balance", () => {
  // the shared function, both forms, on the same three samples (hand-worked in pharmaceutics-lab.test)
  const s = [{ t: 5, c: 0.1 }, { t: 10, c: 0.2 }, { t: 15, c: 0.25 }];
  assert.deepEqual(P.cumulativeDissolved(s, 900, 5, 250, true).map((x: any) => +x.mg.toFixed(6)), [90, 180.5, 226.5]);
  assert.deepEqual(P.cumulativeDissolved(s, 900, 5, 250, false).map((x: any) => +x.mg.toFixed(6)), [90, 179.5, 224]);
  // and the careful run: corrected amounts equal the model's released mass (±noise)
  const d = careful({ stopAfter: "measure" });
  for (const r of X.profile(d.s)) near(r.corrected, X.modelPercentAt(d.s, r.t), 0.8, `corrected % at ${r.t} min`);
});

// ── The careful student ───────────────────────────────────────────────────

test("careful student: both activities, by the equipment, no mistakes, results within tolerance", () => {
  const d = careful();
  assert.deepEqual(d.run.mistakes, [], `mistakes: ${ids(d).join(", ")}`);
  for (const st of DEF.steps) assert.ok(DEF.stepComplete(d.s, st.id), `step ${st.id} complete`);
  assert.ok(DEF.benchComplete(d.s));
  // solubility vs the published 25 °C value, converted
  near(d.s.calcSol!.gPer100, X.trueSolubilityGPer100(25), 0.003, "solubility g/100 mL");
  assert.equal(d.s.calcParts!.term, "Sparingly soluble");
  // dissolution: Q at 30 min vs the model truth
  near(d.s.qPercent!, X.modelPercentAt(d.s, 30), 1.0, "Q (corrected)");
  assert.equal(d.s.verdict, "meets");
  // every reading in range, every sample replaced, everything back in its cabinet
  assert.ok(X.profile(d.s).every((r: any) => r.a <= X.METHOD.linearMax));
  assert.equal(d.s.bench.out.length, 0);
  assert.equal(d.s.bench.pending.length, 0);
  assert.deepEqual([...d.s.bench.disposed.map((x: any) => x.id)].sort(), [...X.WASTE_IDS].sort());
  for (const q of DEF.questions) d.msg({ type: "answer", questionId: q.id, choice: q.answer });
  d.msg({ type: "submit" });
  assert.ok(d.run.submitted);
  const r = M.finalReport(DEF, d.run);
  assert.equal(r.technique, 100);
  assert.equal(r.assessment.percent, 100);
  assert.ok(r.experiment.calculations.every((c: any) => c.result !== "—"));
  assert.ok(r.experiment.learning.some((l: string) => /SIMULATED/.test(l)), "report states its limitations");
});

test("no drug waste is ever accepted by the sink; the wrong stream is refused and scored", () => {
  const d = careful({ stopAfter: "solubility" });
  const before = d.s;
  d.act({ type: "dispose", waste: "suspension", stream: "sink" });
  assert.equal(d.s, before, "refused: state unchanged");
  assert.ok(ids(d).includes("waste-hazard-to-sink"));
  d.act({ type: "dispose", waste: "suspension", stream: "solid" });
  assert.ok(ids(d).includes("waste-wrong-stream"));
  assert.ok(d.s.bench.pending.includes("suspension"));
  for (const w of X.KIT.cfg.waste) assert.ok(w.hazardous && w.stream !== "sink" && w.stream !== "solid", `${w.id} is drug-bearing: chemical waste only`);
});

// ── Mistakes: recorded once, and the result moves the stated way ──────────

test("solubility mistakes move the result the way their consequence says", () => {
  const base = careful({ stopAfter: "solubility" }).s.calcSol!.gPer100;

  const early = careful({ stopAfter: "solubility", hours: 4 });
  assert.equal(ids(early).filter((x: string) => x === "sampled-before-equilibrium").length, 1);
  assert.ok(early.s.calcSol!.gPer100 < base - 0.01, "sampling early reads LOW");

  const hot = careful({ stopAfter: "solubility", bathC: 30 });
  assert.ok(ids(hot).includes("wrong-bath-temperature"));
  assert.ok(hot.s.calcSol!.gPer100 > base + 0.1, "30 °C reads HIGH against 25 °C");
  const cold = careful({ stopAfter: "solubility", bathC: 20 });
  assert.ok(cold.s.calcSol!.gPer100 < base - 0.1, "20 °C reads LOW");

  const unwarmed = careful({ stopAfter: "solubility", warm: false });
  assert.ok(ids(unwarmed).includes("filter-not-warmed"));
  assert.ok(unwarmed.s.calcSol!.gPer100 < base - 0.02, "cold filter reads LOW");

  const weighedHot = careful({ stopAfter: "solubility", weighHot: true });
  assert.equal(ids(weighedHot).filter((x: string) => x === "weighed-hot").length, 1, "scored once however often repeated");
  assert.ok(weighedHot.s.calcSol!.gPer100 < base, "a hot dish reads LOW");

  const scorched = careful({ stopAfter: "solubility", ovenC: 180 });
  assert.equal(ids(scorched).filter((x: string) => x === "oven-too-hot").length, 1);
  assert.ok(scorched.s.calcSol!.gPer100 < base - 0.01, "decomposition reads LOW");
});

test("no excess solid: sampling is refused with the mistake; adding more powder and re-equilibrating recovers", () => {
  const d = driver(DEF, 7);
  solubility(d, { scoops: 1 }); // ≈ 0.45 g < the ≈ 0.74 g that dissolves in 50 mL at 25 °C
  assert.ok(!X.excessVisible(d.s), "all dissolved");
  assert.equal(d.s.filtrateGPerMl, null, "no sample taken");
  assert.equal(ids(d).filter((x: string) => x === "no-excess-solid").length, 1);
  assert.equal(DEF.suggest(d.s)?.action === "filter", false, "Learning mode does not point past the judgement");
  // recovery: dish off the pan, more powder, equilibrate again, sample
  d.act({ type: "dishOnBalance" });
  assert.equal(d.s.dish.where, "bench");
  d.act({ type: "placeBoat" });
  d.act({ type: "tare" });
  for (let i = 0; i < 3; i++) d.act({ type: "addDrug" });
  d.act({ type: "drugToFlask" });
  assert.equal(d.s.eqH, 0, "adding powder restarts equilibration");
  d.act({ type: "stopper" }, "flask");
  d.act({ type: "waitHours", hours: 24 });
  assert.ok(X.excessVisible(d.s));
  d.act({ type: "filter" });
  ok(d, "filter after recovery");
  assert.ok(d.s.filtrateGPerMl! > 0.0146 - 1e-4);
});

test("dissolution mistakes move Q the way their consequence says", () => {
  const base = careful({ stopAfter: "measure" });
  const q = (d: D) => X.expected(d.s).q!;
  const b = q(base);

  const early = careful({ stopAfter: "measure", startEarly: true });
  assert.ok(ids(early).includes("started-before-37"));
  assert.ok(X.profile(early.s)[0].corrected < X.profile(base.s)[0].corrected - 2, "cold start: early points LOW");

  const fast = careful({ stopAfter: "measure", rpm: 100 });
  assert.ok(ids(fast).includes("wrong-speed"));
  assert.ok(X.profile(fast.s)[0].corrected > X.profile(base.s)[0].corrected + 5, "100 rpm reads HIGH");
  const slow = careful({ stopAfter: "measure", rpm: 25 });
  assert.ok(q(slow) < b - 2, "25 rpm reads LOW");

  const unreplaced = careful({ stopAfter: "measure", skipReplaceAt: 5 });
  assert.equal(ids(unreplaced).filter((x: string) => x === "not-replaced").length, 1);
  assert.ok(q(unreplaced) > b, "unreplaced volume reads HIGH");

  const late = careful({ stopAfter: "measure", lateAt: 30 });
  assert.ok(ids(late).includes("late-sample"));
  assert.ok(q(late) > b, "a late 30-min sample reads HIGH");

  const blank = careful({ stopAfter: "measure", noBlank: true });
  assert.equal(ids(blank).filter((x: string) => x === "no-blank").length, 1);
  assert.ok(q(blank) > b + 3, "no blank reads HIGH");

  const over = careful({ stopAfter: "measure", dfFor: (p) => (p >= 20 ? 25 : 50) });
  assert.equal(ids(over).filter((x: string) => x === "above-linear-range").length, 1);
  assert.ok(q(over) < b, "above the linear range reads LOW");

  const big = careful({ stopAfter: "measure", mediumMl: 950 });
  assert.ok(ids(big).includes("medium-volume"));
  assert.ok(q(big) < b - 3, "950 mL calculated as 900 reads LOW");

  const missed = careful({ missAt: 30 });
  assert.ok(ids(missed).includes("missed-sample"));
  assert.equal(X.expected(missed.s).q, null);
  assert.equal(missed.s.verdict, "not-determinable");
  assert.ok(DEF.benchComplete(missed.s), "a run with a missed Q point can still be finished and reported");
});

test("undiluted samples read OVER and cannot be recorded", () => {
  const d = careful({ stopAfter: "run" });
  fetch(d, "cuvette");
  d.act({ type: "blank" });
  d.act({ type: "dilute", factor: 1 });
  d.act({ type: "loadSample" });
  assert.equal(X.spectroDisplay(d.s), "OVER");
  d.act({ type: "recordAbs", value: 3 });
  assert.equal(d.run.last[0].kind, "error");
  assert.equal(d.s.samples[0].absRecorded, null);
});

test("calculations: wrong attempt scored; worked solution — any time in Learning, after one attempt in Practical (−3)", () => {
  const learn = careful({ stopAfter: "solubility" });
  // Learning: worked solution before any attempt is allowed and free
  const L = driver(DEF, 7, "learning");
  solubility(L, {});
  assert.ok(L.s.calc.solubility.attempts === 0);
  const p = driver(DEF, 7, "practical");
  // drive the practical run to the calculation without answering it
  const o: Opts = {};
  fetch(p, "flask");
  p.act({ type: "dispenseWater" });
  fetch(p, "boat", "spatula", "drug");
  p.act({ type: "placeBoat" }); p.act({ type: "tare" });
  for (let i = 0; i < 4; i++) p.act({ type: "addDrug" });
  p.act({ type: "drugToFlask" }); p.act({ type: "stopper" }, "flask"); p.act({ type: "flaskToBath" }, "flask");
  p.act({ type: "bathSet", c: 25 }); p.act({ type: "shake", on: true }); p.act({ type: "waitHours", hours: 24 });
  fetch(p, "dish", "pipette", "syringe-filter");
  p.act({ type: "dishOnBalance" }); p.act({ type: "recordMass", value: X.balanceReading(p.s) });
  p.act({ type: "warmFilter" }); p.act({ type: "filter" }); p.act({ type: "pipetteToDish" });
  p.act({ type: "ovenSet", c: 105 }); p.act({ type: "dishToOven" }); p.act({ type: "dry", hours: 2 });
  for (let i = 0; i < 6 && !X.constantMass(p.s); i++) {
    if (p.s.dish.where !== "oven") (p.act({ type: "dishToOven" }), p.act({ type: "dry", hours: 1 }));
    p.act({ type: "removeDish" }); p.act({ type: "cool" }); p.act({ type: "dishOnBalance" });
    p.act({ type: "recordMass", value: X.balanceReading(p.s) });
  }
  void o;
  assert.deepEqual(p.run.mistakes, []);
  p.act({ type: "worked", calc: "solubility", mode: "practical" });
  assert.equal(p.run.last[0].kind, "error", "Practical: refused before an attempt");
  assert.equal(p.s.calc.solubility.worked, false);
  p.act({ type: "calcSolubility", gPer100: 9.99, mgPerMl: 99.9 });
  assert.deepEqual(ids(p), ["calc-solubility"]);
  assert.equal(p.s.calc.solubility.attempts, 1);
  assert.equal(p.s.calcSol, null, "a wrong answer is not recorded");
  p.act({ type: "worked", calc: "solubility", mode: "practical" });
  assert.ok(p.s.calc.solubility.worked);
  assert.deepEqual(ids(p), ["calc-solubility", "worked-solubility"]);
  const lines = X.workedSolution(p.s, "solubility");
  assert.ok(lines.length === 3 && lines.every((l: string) => /mL|g/.test(l)), "worked solution substitutes with units");
  const e = X.expected(p.s);
  assert.ok(lines[1].includes(e.gPer100!.toFixed(3)), "with the student's own numbers");
  const r = M.finalReport(DEF, p.run);
  assert.equal(r.technique, 100 - 4 - 3);
  // Learning: free, any time
  L.act({ type: "worked", calc: "solubility", mode: "learning" });
  assert.ok(L.s.calc.solubility.worked);
  assert.deepEqual(L.run.mistakes, []);
  void learn;
  // each calculation step has the three-rung hint ladder
  for (const id of ["calc-solubility", "calc-parts", "calc-sink", "calc-dissolved"]) {
    const st = DEF.steps.find((x: any) => x.id === id)!;
    assert.equal(st.hints.length, 3, id);
    assert.match(st.hints[0], /^Variables/);
    assert.match(st.hints[1], /^Formula/);
    assert.match(st.hints[2], /^Substitute/);
  }
});

// ── Bypass ────────────────────────────────────────────────────────────────

test("bypass refused: no instrument open, the wrong instrument, items still in cabinets, the tablet before the sink check", () => {
  let run = M.createRun(DEF, 7);
  run = M.reduceRun(DEF, run, { type: "act", action: { type: "dispenseWater" } });
  assert.equal(run.actions, 0, "refused with nothing open");
  run = M.reduceRun(DEF, run, { type: "operate", equipment: "oven" });
  run = M.reduceRun(DEF, run, { type: "act", action: { type: "filter" } });
  assert.equal(run.actions, 0, "the oven cannot filter");
  run = M.reduceRun(DEF, run, { type: "operate", equipment: "water" });
  const s0 = run.s;
  run = M.reduceRun(DEF, run, { type: "act", action: { type: "dispenseWater" } });
  assert.equal(run.s, s0, "the flask is still in the cupboard");
  assert.match(run.last[0].text, /Glassware cupboard/);
  // the tablet waits for the sink check, which waits for the solubility
  const d = driver(DEF, 7);
  d.act({ type: "activity", activity: "dissolution" });
  fetch(d, "cylinder", "medium", "tablets");
  for (let i = 0; i < 9; i++) d.act({ type: "pourMedium", ml: 100 });
  d.act({ type: "readCylinder", value: 900 });
  d.act({ type: "mediumToVessel" });
  d.act({ type: "testerTemp", c: 37 }); d.act({ type: "testerRpm", rpm: 50 });
  d.act({ type: "calcSink", volumeMl: 34.2 });
  assert.equal(d.s.sinkMl, null);
  d.act({ type: "dropTablet" });
  assert.equal(d.s.vessel.tabletIn, false);
  assert.match(d.run.last[0].text, /sink/);
  // a wet dish cannot be recorded as "dried"; returning a full flask is refused
  const w = careful({ stopAfter: "solubility" });
  const before = w.s;
  w.act({ type: "return", item: "flask" });
  assert.equal(w.s, before, "the flask still holds the suspension");
});

// ── Learning mode never reveals ───────────────────────────────────────────

test("suggest(): a pointer only, valid at every state of the scripted runs, silent at every judgement", () => {
  for (const o of [{}, { hours: 4 }, { rpm: 100 }, { lateAt: 30 }, { noBlank: true }] as Opts[]) {
    const d = careful(o);
    for (const s of d.states) checkSuggestion(DEF, s);
    assert.equal(DEF.suggest(d.s), null, "nothing left once cleaned up");
  }
  const d = careful({ stopAfter: "run" });
  fetch(d, "cuvette");
  d.act({ type: "blank" });
  assert.equal(DEF.suggest(d.s)?.action, "dilute", "points at the dilution control, never a factor");
  d.act({ type: "dilute", factor: 50 });
  d.act({ type: "loadSample" });
  assert.equal(DEF.suggest(d.s), null, "judging a displayed absorbance is the student's");
  // excess judgement: a boat with powder on it, and an equilibrated flask with no solid
  const w = driver(DEF, 7);
  fetch(w, "flask");
  w.act({ type: "dispenseWater" });
  fetch(w, "boat", "spatula", "drug");
  w.act({ type: "placeBoat" }); w.act({ type: "tare" }); w.act({ type: "addDrug" });
  assert.equal(DEF.suggest(w.s), null, "how much is excess is not prompted");
  // a cylinder near the mark: the meniscus is theirs
  const c = careful({ stopAfter: "solubility" });
  c.act({ type: "activity", activity: "dissolution" });
  fetch(c, "cylinder", "medium");
  for (let i = 0; i < 9; i++) c.act({ type: "pourMedium", ml: 100 });
  assert.equal(DEF.suggest(c.s), null);
});

// ── The chart, the visual, the tutor ──────────────────────────────────────

test("the profile (chart data) is exactly the recorded samples, in order", () => {
  const d = careful({ stopAfter: "run" });
  assert.equal(X.profile(d.s).length, 0, "nothing plotted before anything is recorded");
  fetch(d, "cuvette");
  d.act({ type: "blank" });
  for (let i = 0; i < 3; i++) {
    d.act({ type: "dilute", factor: 50 });
    d.act({ type: "loadSample" });
    d.act({ type: "recordAbs", value: X.spectroDisplay(d.s) });
  }
  const rows = X.profile(d.s);
  const rec = d.s.samples.filter((x: any) => x.absRecorded !== null);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map((r: any) => [r.t, r.a, r.df]), rec.map((x: any) => [x.t, x.absRecorded, x.df]));
  rows.forEach((r: any, i: number) => near(r.cMgPerMl, ((rec[i].absRecorded - 0.002) / 0.065) * 50 / 1000, 1e-12));
  rows.forEach((r: any) => assert.ok(r.corrected >= r.uncorrected, "correction adds drug removed earlier"));
});

test("visual matches the contract at key states", () => {
  const shape = (v: any) => {
    assert.deepEqual(Object.keys(v).sort(), ["activity", "balance", "bathC", "common", "dish", "flask", "ovenC", "spectro", "syringeMl", "tester", "tubes"]);
    assert.deepEqual(Object.keys(v.flask).sort(), ["inBath", "shaking", "solidG", "stoppered", "waterMl"]);
    assert.deepEqual(Object.keys(v.dish).sort(), ["inOven", "ml", "onBalance", "residueG"]);
    assert.deepEqual(Object.keys(v.tester).sort(), ["elapsedMin", "mediumMl", "remaining", "rpm", "running", "tabletIn", "tempC"]);
    assert.deepEqual(Object.keys(v.spectro).sort(), ["cuvetteIn", "reading"]);
    assert.deepEqual(Object.keys(v.common).sort(), ["open", "out", "rinsing", "tap", "waste"]);
  };
  const v0 = X.solubilityDissolutionVisual(DEF.initial(7));
  shape(v0);
  assert.equal(v0.activity, "solubility");
  assert.equal(v0.tester.remaining, 1);
  assert.equal(v0.spectro.reading, null);
  // every interactive id is in the contract's plan or a fixture
  const allowed = new Set([...EQUIPMENT_PLAN["solubility-dissolution"].fixed, ...Object.keys(EQUIPMENT_PLAN["solubility-dissolution"].stored), ...FIXTURES]);
  for (const id of X.SOLUBILITY_DISSOLUTION_EQUIPMENT_IDS) assert.ok(allowed.has(id), `equipment id "${id}" is not in the contract`);

  const d = driver(DEF, 7);
  solubility(d, { stopAfter: "solubility" });
  const mid = d.states.find((s: any) => s.flask.inBath && s.eqH >= 24)!;
  const vm = X.solubilityDissolutionVisual(mid);
  shape(vm);
  assert.ok(vm.flask.inBath && vm.flask.shaking && vm.flask.stoppered && vm.flask.solidG > 0.3, "excess solid drawn");
  assert.equal(vm.bathC, 25);
  const weighing = d.states.find((s: any) => s.dish.where === "balance" && s.weighings.length === 0 && s.emptyRecorded === null)!;
  assert.equal(X.solubilityDissolutionVisual(weighing).balance.reading, weighing.dish.emptyG, "the LCD shows the dish");

  const r = careful({ stopAfter: "run" });
  const running = r.states.find((s: any) => s.vessel.running && s.samples.length >= 2 && !s.vessel.stopped)!;
  const vr = X.solubilityDissolutionVisual(running);
  shape(vr);
  assert.ok(vr.tester.running && vr.tester.tabletIn && vr.tester.rpm === 50);
  assert.ok(vr.tester.remaining > 0 && vr.tester.remaining < 0.4, "the tablet shrinks with the model");
  assert.ok(vr.tubes >= 2);
  near(vr.tester.mediumMl, 900, 5);
});

test("RoboPharma follows suggest() in Learning and names no target in Practical", () => {
  const d = careful();
  for (const s of d.states) {
    const run = { ...d.run, s, last: [], submitted: false, mode: "learning" as const, assessed: false };
    if (DEF.benchComplete(s)) continue;
    const msg = tutorMessage(DEF, run);
    const sug = DEF.suggest(s);
    const ctrl = sug && DEF.controllers.find((c: any) => c.id === sug.controller);
    const step = DEF.steps.find((x: any) => x.id === M.currentStepId(DEF, s))!;
    assert.equal(msg.target, ctrl ? ctrl.equipment[0] : step.focus[0] ?? null);
    const prac = tutorMessage(DEF, { ...run, mode: "practical", assessed: true });
    assert.equal(prac.target, null);
    assert.equal(prac.hint?.cost, M.HINT_COST);
    for (const l of prac.lines) assert.ok(!/\d+\.\d{2,}/.test(l), "no reading in a Practical line");
  }
});

test("definition is complete: steps, hints, focus ids, controllers cover every action, PROCEDURE labelled", () => {
  assert.ok(DEF.steps.length >= 5 && DEF.questions.length >= 6 && DEF.safety.length >= 3 && DEF.principle.length >= 3);
  const eq = new Set(DEF.equipment.map((e: any) => e.id));
  for (const st of DEF.steps) {
    assert.ok(st.hints.length >= 2, `${st.id} hints`);
    for (const f of st.focus) assert.ok(eq.has(f), `${st.id} focus ${f}`);
  }
  for (const c of DEF.controllers) for (const e of c.equipment) assert.ok(eq.has(e), `${c.id} equipment ${e}`);
  assert.equal(new Set(DEF.questions.map((q: any) => q.id)).size, DEF.questions.length);
  for (const q of DEF.questions) assert.ok(q.answer >= 0 && q.answer < q.options.length);
  assert.equal(X.PROCEDURE.status, "referenced_simulation");
  assert.ok(X.PROCEDURE.sources.every((s: any) => /^https:\/\//.test(s.url)));
  assert.ok(X.PROCEDURE.assumptions.length >= 5);
  assert.ok(DEF.safety.some((l: string) => /UV/.test(l)) && DEF.safety.some((l: string) => /oven/i.test(l)) && DEF.safety.some((l: string) => /37/.test(l)));
});
