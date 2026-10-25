/**
 * Virtual Labs — Pharmaceutics: solution preparation & dilution (2026-10-25).
 *
 *   node --test scripts/vlab-solution-preparation.test.mts
 *
 * The science (normal, boundary, invalid, unit-sensitive), a careful student driven through the
 * run machine by selecting each instrument (cabinets and clean-up included) for all three task
 * measures, every technique mistake recorded once and moving the result the right way, the
 * equipment gate, the shared bench rules, Learning mode's pointer and RoboPharma. Expected numbers
 * were worked by hand, not read back from the code.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/ts-resolve.mjs", import.meta.url);

const M = await import("../src/lib/virtual-labs/engine/machine.ts");
const C = await import("../src/lib/virtual-labs/calculations/solutionPrep.ts");
const SP = await import("../src/lib/virtual-labs/experiments/pharmaceutics/solutionPrep.ts");
const K = await import("../src/lib/virtual-labs/experiments/pharmaceutics/common.ts");
const { EQUIPMENT_PLAN } = await import("../src/lib/virtual-labs/experiments/pharmaceutics/contract.ts");
const { tutorMessage } = await import("../src/lib/virtual-labs/tutor.ts");

const DEF = SP.SOLUTION_PREP;
const PLAN = EQUIPMENT_PLAN["solution-preparation"];
const near = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} expected ${b} ± ${tol}, got ${a}`);
const rel = (a: number, b: number) => (a - b) / b;

/** Seeds giving each task measure (found once, deterministically). */
const SEED: Record<string, number> = {};
for (let seed = 1; Object.keys(SEED).length < 3 && seed < 500; seed++) {
  const t = DEF.initial(seed).task;
  SEED[t] ??= seed;
}

// ── Science ────────────────────────────────────────────────────────────────

test("science: mass for a concentration in each measure (normal, unit-sensitive)", () => {
  near(C.massForConcentration("% w/v", 0.9, 100), 0.9, 1e-12); // 0.900 g per 100 mL
  near(C.massForConcentration("mg/mL", 9, 100), 0.9, 1e-12); // 900 mg
  near(C.massForConcentration("mol/L", 0.15, 100), 0.8766, 1e-12); // 0.15 × 0.1 × 58.44
  near(C.massForConcentration("% w/v", 0.9, 250), 2.25, 1e-12);
  // the same number means very different amounts in different measures
  near(C.massForConcentration("mg/mL", 0.9, 100), 0.09, 1e-12);
  near(C.massForConcentration("mol/L", 0.9, 100), 5.2596, 1e-9);
});

test("science: concentration from mass round-trips; g/mL conversions", () => {
  near(C.concentrationFromMass("% w/v", 0.9036, 100), 0.9036, 1e-12);
  near(C.concentrationFromMass("mg/mL", 0.9036, 100), 9.036, 1e-12);
  near(C.concentrationFromMass("mol/L", 0.9, 100), 0.154004, 1e-6); // normal saline ≈ 154 mmol/L
  for (const u of ["% w/v", "mg/mL", "mol/L"] as const) near(C.concentrationFromMass(u, C.massForConcentration(u, 0.5, 100), 100), 0.5, 1e-12, u);
  near(C.fromGPerMl("% w/v", 0.009), 0.9, 1e-12);
  near(C.fromGPerMl("mg/mL", 0.009), 9, 1e-12);
  near(C.fromGPerMl("mol/L", 0.009), 0.154004, 1e-6);
});

test("science: boundary and invalid inputs give NaN, never a throw", () => {
  assert.ok(Number.isNaN(C.massForConcentration("% w/v", 0, 100)));
  assert.ok(Number.isNaN(C.massForConcentration("% w/v", -1, 100)));
  assert.ok(Number.isNaN(C.massForConcentration("mg/mL", 1, 0)));
  assert.ok(Number.isNaN(C.massForConcentration("mol/L", 0.1, 100, 0)));
  assert.ok(Number.isNaN(C.massForConcentration("mol/L", NaN, 100)));
  assert.ok(Number.isNaN(C.concentrationFromMass("% w/v", 1, 0)));
  assert.ok(Number.isNaN(C.concentrationFromMass("mol/L", -1, 100)));
  assert.equal(C.concentrationFromMass("% w/v", 0, 100), 0, "no solute is a valid 0");
  assert.ok(Number.isNaN(C.fromGPerMl("mg/mL", -0.1)));
  assert.ok(Number.isNaN(C.solutionVolumeMl(-1, 0, 0)));
  assert.ok(Number.isNaN(C.deviationPercent(1, 0)));
  assert.equal(C.withinRelative(1, 0, 0.1), false);
});

test("science: crystals occupy more volume than the same salt dissolved (contraction ≈ 0.178 mL/g)", () => {
  near(C.SOLID_ML_PER_G, 1 / 2.165, 1e-12);
  near(C.DISSOLVED_ML_PER_G, 16.6 / 58.44, 1e-12);
  near(C.solutionVolumeMl(99, 1, 0), 99.2841, 1e-4);
  near(C.solutionVolumeMl(99, 0, 1), 99.4619, 1e-4);
  const contraction = C.solutionVolumeMl(99, 0, 1) - C.solutionVolumeMl(99, 1, 0);
  near(contraction, 0.1778, 1e-4);
  near(C.trueConcentrationGPerMl(99.744, 0.9, 0), 0.9 / (99.744 + 0.9 * 0.28405), 1e-9);
});

test("science: meniscus position at the mark boundaries; deviation; 4 s.f. checks", () => {
  assert.equal(C.meniscusPosition(0, 100, 0.025), "empty");
  assert.equal(C.meniscusPosition(99.97, 100, 0.025), "below");
  assert.equal(C.meniscusPosition(99.98, 100, 0.025), "at");
  assert.equal(C.meniscusPosition(100.02, 100, 0.025), "at");
  assert.equal(C.meniscusPosition(100.03, 100, 0.025), "above");
  near(C.deviationPercent(0.9036, 0.9), 0.4, 1e-9);
  near(C.deviationPercent(0.8766, 0.9), -2.6, 1e-9);
  assert.equal(C.withinRelative(0.9036, 0.90364, 0.001), true);
  assert.equal(C.withinRelative(0.904, 0.9036, 0.001), true);
  assert.equal(C.withinRelative(0.91, 0.9036, 0.001), false);
  assert.equal(C.fourSf(0.09036), "0.09036");
  assert.equal(C.fourSf(0.9), "0.9000");
});

test("tasks: each states its measure; the dilution is 1 in 10 in every measure", () => {
  assert.deepEqual(Object.keys(SEED).sort(), ["mgml", "molar", "pct"]);
  for (const id of ["pct", "mgml", "molar"]) {
    const s = DEF.initial(SEED[id]);
    const t = SP.taskOf(s);
    assert.ok(t.stockText.includes(t.unit) && t.diluteText.includes(t.unit));
    near(SP.targetV1Ml(s), 10, 1e-12, id);
  }
  near(SP.targetMassG(DEF.initial(SEED.pct)), 0.9, 1e-12);
  near(SP.targetMassG(DEF.initial(SEED.mgml)), 0.9, 1e-12);
  near(SP.targetMassG(DEF.initial(SEED.molar)), 0.8766, 1e-12);
});

// ── Driver ─────────────────────────────────────────────────────────────────

/** The equipment a student taps to perform each action (the right instrument for its target). */
function equipmentFor(a: any): string {
  switch (a.type) {
    case "cabinet":
      return a.cabinet;
    case "retrieve":
    case "return":
      return PLAN.stored[a.item];
    case "tap":
    case "rinse":
      return "sink";
    case "dispose":
      return "waste-station";
    case "identify":
    case "plan":
    case "calcMass":
    case "calcDilution":
    case "recordResults":
    case "worked":
      return "notebook";
    case "placeBoat":
    case "tare":
    case "addSolid":
    case "removeSolid":
    case "recordMass":
    case "tipIntoBeaker":
      return "balance";
    case "rinseBoat":
    case "stir":
    case "transfer":
      return "beaker";
    case "addWater":
      return a.target;
    case "rinseInto":
    case "placeFunnel":
    case "removeFunnel":
      return "flask-a";
    case "swirl":
    case "stopper":
    case "invert":
    case "label":
    case "discard":
    case "empty":
      return a.flask;
    default:
      return "pipette";
  }
}

/** Learning mode's pointer must be valid and must not reveal a judgement at this state. */
function checkSuggestion(s: any) {
  const sug = DEF.suggest(s);
  if (sug === null) return;
  assert.deepEqual(Object.keys(sug).sort(), ["action", "controller"], "a suggestion carries no value");
  const c = DEF.controllers.find((x: any) => x.id === sug.controller);
  assert.ok(c, `unknown controller ${sug.controller}`);
  assert.ok(c.actions.includes(sug.action), `${c.id} cannot ${sug.action}`);
  assert.ok(sug.action !== "worked" && sug.action !== "discard", `suggest pointed at ${sug.action}`);
  // near the weighing target: recording, adding or removing is the student's judgement
  if (s.calcMass !== null && s.massRecorded === null && s.boatOn && s.tareG > 0) {
    const v = SP.balanceReading(s);
    if (Math.abs(v - s.calcMass) <= 0.05 * s.calcMass) assert.equal(sug, null, `suggest at reading ${v}`);
  }
  // a meniscus near a mark is read by the student: never "add water" or "stopper" there
  for (const [fid, f] of [["flask-a", s.flaskA], ["flask-b", s.flaskB]] as const) {
    if (!f.stoppered && f.fills > 0 && !f.labelled) assert.ok(!(sug.controller === fid && ["addWater", "stopper", "label"].includes(sug.action)), `${fid}: ${sug.action} near the mark`);
  }
  if (s.pipette.ml > 0 && s.pipette.ml <= 10.3) assert.equal(sug, null, "pipette near its mark");
  assert.notEqual(sug.action, "recordMass", "recording a reading is never suggested");
}

function driver(seed: number, mode: "learning" | "practical" = "learning") {
  let run = M.createRun(DEF, seed, mode);
  const states: any[] = [run.s];
  const act = (action: any) => {
    const eq = equipmentFor(action);
    const ctrl = M.controllerForEquipment(DEF, eq);
    assert.ok(ctrl, `no controller opens ${eq}`);
    assert.ok(ctrl.actions.includes(action.type), `${ctrl.id} (opened by ${eq}) cannot ${action.type}`);
    if (run.active !== ctrl.id) run = M.reduceRun(DEF, run, { type: "operate", equipment: eq });
    run = M.reduceRun(DEF, run, { type: "act", action });
    states.push(run.s);
    checkSuggestion(run.s);
    // RoboPharma follows Learning mode's pointer exactly, and points at nothing in Practical
    const quiet = run.last.every((f: any) => !f.mistake && f.kind !== "warn" && f.kind !== "error");
    if (quiet && !DEF.benchComplete(run.s) && run.actions > 0) {
      const msg = tutorMessage(DEF, run);
      if (mode === "practical") assert.equal(msg.target, null, "the tutor points at nothing in Practical");
      else {
        const sug = DEF.suggest(run.s);
        if (sug) assert.equal(msg.target, DEF.controllers.find((c: any) => c.id === sug.controller).equipment[0]);
      }
    }
    return run;
  };
  return { get run() { return run; }, get s() { return run.s as any; }, states, act, msg: (m: any) => (run = M.reduceRun(DEF, run, m)) };
}

type D = ReturnType<typeof driver>;

/** The student's own arithmetic for the results (independent of the experiment's code). */
function myResults(s: any) {
  const m = s.massRecorded;
  const unit = SP.taskOf(s).unit;
  const a = unit === "% w/v" ? m : unit === "mg/mL" ? (m * 1000) / 100 : m / 58.44 / 0.1;
  return { a, b: (a * 10) / 100 };
}

function makeUp(d: D, fid: "flask-a" | "flask-b", how: { over?: boolean; below?: boolean; noMix?: boolean; dissolve?: boolean }) {
  const f = () => (fid === "flask-a" ? d.s.flaskA : d.s.flaskB);
  if (how.dissolve !== false && f().solidG > 0) d.act({ type: "swirl", flask: fid });
  d.act({ type: "addWater", target: fid, amount: "fill" });
  while (SP.flaskMl(f()) < 99.4) d.act({ type: "addWater", target: fid, amount: "squirt" });
  if (!how.below) {
    let n = 0;
    while (SP.flaskMeniscus(f()) === "below" && n++ < 40) d.act({ type: "addWater", target: fid, amount: "drop" });
    assert.equal(SP.flaskMeniscus(f()), "at");
    if (how.over) d.act({ type: "addWater", target: fid, amount: "drops5" });
  }
  d.act({ type: "stopper", flask: fid, on: true });
  if (!how.noMix) for (let i = 0; i < 2; i++) d.act({ type: "invert", flask: fid });
  d.act({ type: "label", flask: fid });
}

interface Opts {
  seed?: number;
  mode?: "learning" | "practical";
  noTare?: boolean;
  overweigh?: boolean;
  noRinse?: boolean;
  undissolved?: boolean;
  overA?: boolean;
  belowA?: boolean;
  noMixA?: boolean;
  noPipetteRinse?: boolean;
  pipetteHigh?: boolean;
  blow?: boolean;
  overB?: boolean;
  belowB?: boolean;
  noMixB?: boolean;
  stopBeforeResults?: boolean;
  noCleanup?: boolean;
}

/** A student working through the whole practical by selecting each instrument; flags inject one mistake. */
function runLab(o: Opts = {}) {
  const d = driver(o.seed ?? SEED.pct, o.mode);
  d.act({ type: "identify", choice: "nacl" });
  d.act({ type: "plan", stock: "flask", aliquot: "pipette" });
  const target = SP.targetMassG(d.s);
  d.act({ type: "calcMass", value: Number(target.toFixed(4)) });
  // collect everything, cabinet by cabinet
  for (const cab of ["cabinet-instruments", "cabinet-reagents", "cabinet-glass"]) {
    d.act({ type: "cabinet", cabinet: cab, open: true });
    for (const [item, where] of Object.entries(PLAN.stored)) if (where === cab) d.act({ type: "retrieve", item });
    d.act({ type: "cabinet", cabinet: cab, open: false });
  }
  // weigh
  d.act({ type: "placeBoat" });
  if (!o.noTare) d.act({ type: "tare" });
  const offset = o.noTare ? d.s.boatMassG : 0; // an untared student aims at boat + target on the display
  const goal = target * (o.overweigh ? 1.05 : 1);
  for (let i = 0; i < 300; i++) {
    const net = SP.balanceReading(d.s) - offset;
    const gap = goal - net;
    if (o.overweigh ? net > goal : Math.abs(gap) <= 0.004 * target) break;
    if (gap < 0) d.act({ type: "removeSolid" });
    else d.act({ type: "addSolid", amount: gap > 0.36 ? "scoop" : gap > 0.07 ? "small" : "tap" });
  }
  d.act({ type: "recordMass", value: SP.balanceReading(d.s) });
  // dissolve
  d.act({ type: "tipIntoBeaker" });
  if (!o.noRinse) d.act({ type: "rinseBoat" });
  for (let i = 0; i < 3; i++) d.act({ type: "addWater", target: "beaker", amount: "portion" });
  if (!o.undissolved) for (let i = 0; i < 3; i++) d.act({ type: "stir" });
  // quantitative transfer
  d.act({ type: "placeFunnel" });
  d.act({ type: "transfer" });
  if (!o.noRinse) for (const item of ["beaker", "beaker", "beaker", "rod", "funnel"]) d.act({ type: "rinseInto", item });
  d.act({ type: "removeFunnel" });
  makeUp(d, "flask-a", { over: o.overA, below: o.belowA, noMix: o.noMixA, dissolve: !o.undissolved });
  // dilution
  d.act({ type: "calcDilution", value: 10 });
  d.act({ type: "stopper", flask: "flask-a", on: false });
  if (!o.noPipetteRinse) d.act({ type: "pipetteRinse" });
  d.act({ type: "pipetteDraw", method: "filler" });
  const stopAt = o.pipetteHigh ? 10.4 : 10.3; // high: delivered 0.2–0.4 mL above the mark
  while (d.s.pipette.ml > stopAt) d.act({ type: "pipetteDrain", amount: "little" });
  if (!o.pipetteHigh) while (d.s.pipette.ml > 10.015) d.act({ type: "pipetteDrain", amount: "drop" });
  d.act({ type: "pipetteDeliver", style: o.blow ? "blow" : "touch" });
  makeUp(d, "flask-b", { over: o.overB, below: o.belowB, noMix: o.noMixB });
  if (o.stopBeforeResults) return d;
  const r = myResults(d.s);
  d.act({ type: "recordResults", a: Number(r.a.toPrecision(4)), b: Number(r.b.toPrecision(4)) });
  if (o.noCleanup) return d;
  cleanup(d);
  return d;
}

function cleanup(d: D) {
  d.act({ type: "empty", flask: "flask-a" });
  d.act({ type: "empty", flask: "flask-b" });
  d.act({ type: "tap", on: true }); // the sink accepts sink-safe waste only with water running
  for (const id of [...d.s.bench.pending]) d.act({ type: "dispose", waste: id, stream: SP.KIT.wasteById.get(id).stream });
  for (const id of [...d.s.dirty]) d.act({ type: "rinse", item: id });
  d.act({ type: "tap", on: false });
  for (const cab of ["cabinet-glass", "cabinet-instruments", "cabinet-reagents"]) {
    const items = d.s.bench.out.filter((x: string) => PLAN.stored[x] === cab);
    if (!items.length) continue;
    d.act({ type: "cabinet", cabinet: cab, open: true });
    for (const item of items) d.act({ type: "return", item });
    d.act({ type: "cabinet", cabinet: cab, open: false });
  }
}

const ids = (d: D) => d.run.mistakes.map((m: any) => m.id);
const once = (d: D, id: string) => assert.equal(ids(d).filter((x: string) => x === id).length, 1, `${id} recorded once (got ${ids(d).join(", ") || "none"})`);
const careful = runLab();

// ── The careful student ────────────────────────────────────────────────────

test("a careful student completes every measure with no mistakes and an accurate result", () => {
  for (const id of ["pct", "mgml", "molar"]) {
    const d = runLab({ seed: SEED[id] });
    assert.deepEqual(ids(d), [], `${id}: ${ids(d).join(", ")}`);
    assert.ok(DEF.benchComplete(d.s), `${id}: bench not complete`);
    for (const st of DEF.steps) assert.ok(DEF.stepComplete(d.s, st.id), `${id}/${st.id}`);
    const s = d.s;
    const t = SP.taskOf(s);
    const rec = SP.recordedConcentrations(s);
    const tru = SP.assayOf(s);
    // weighed within the stated tolerance; record follows the student's own mass
    assert.ok(Math.abs(C.deviationPercent(rec.a, t.stock)) <= 2, `${id}: A off target`);
    near(rec.b, rec.a / 10, 1e-12);
    // what is really in the flasks matches the record closely (only the tiny rinse residues are lost)
    assert.ok(Math.abs(rel(tru.a, rec.a)) < 0.002, `${id}: A gap ${rel(tru.a, rec.a)}`);
    assert.ok(Math.abs(rel(tru.b, rec.b)) < 0.003, `${id}: B gap ${rel(tru.b, rec.b)}`);
    // clean-up: nothing pending, nothing out, nothing dirty, tap off, cabinets shut
    assert.deepEqual(s.bench.pending, []);
    assert.deepEqual(s.bench.out, []);
    assert.deepEqual(s.dirty, []);
    assert.equal(s.bench.tap, false);
    assert.equal(s.bench.open, null);
    assert.ok(s.bench.disposed.some((x: any) => x.id === "boat" && x.stream === "solid"));
    assert.ok(s.bench.disposed.some((x: any) => x.id === "surplus-a" && x.stream === "sink"));
    // report uses the student's values, with units and deviation
    const rep = DEF.report(s);
    assert.ok(rep.outcome.filter((x: any) => x.verdict !== "info").every((x: any) => x.verdict === "pass"), `${id}: ${JSON.stringify(rep.outcome)}`);
    assert.ok(rep.calculations.every((c: any) => /mL|g|mol|%/.test(c.expression)), "every expression shows units");
    assert.ok(rep.calculations.some((c: any) => c.label.startsWith("Deviation of A")));
    // assessment and submit
    for (const q of DEF.questions) d.msg({ type: "answer", questionId: q.id, choice: q.answer });
    d.msg({ type: "submit" });
    assert.equal(d.run.submitted, true);
    const fr = M.finalReport(DEF, d.run);
    assert.equal(fr.technique, 100);
    assert.equal(fr.assessment.percent, 100);
  }
});

test("the bench is not complete until clean-up is finished", () => {
  const d = runLab({ noCleanup: true });
  assert.equal(DEF.stepComplete(d.s, "record"), true);
  assert.equal(DEF.benchComplete(d.s), false);
  d.msg({ type: "submit" });
  assert.equal(d.run.submitted, false);
});

// ── Mistakes: recorded once, result moves the right way ───────────────────

test("not taring: recorded once; the recorded mass and reported concentration are far too high", () => {
  const d = runLab({ noTare: true, noCleanup: true });
  once(d, "not-tared");
  const rec = SP.recordedConcentrations(d.s);
  const tru = SP.assayOf(d.s);
  assert.ok(rec.a > tru.a * 1.5, `reported ${rec.a} vs true ${tru.a}`);
});

test("weighing outside ±2 %: recorded once; A and B are high", () => {
  const d = runLab({ overweigh: true, noCleanup: true });
  once(d, "weight-out-of-tolerance");
  const t = SP.taskOf(d.s);
  assert.ok(C.deviationPercent(SP.assayOf(d.s).a, t.stock) > 3);
  assert.ok(C.deviationPercent(SP.assayOf(d.s).b, t.dilute) > 3);
});

test("skipping the rinses: recorded once; A is low against the record (≈ 4 %)", () => {
  const d = runLab({ noRinse: true, noCleanup: true });
  once(d, "transfer-not-quantitative");
  const gap = rel(SP.assayOf(d.s).a, SP.recordedConcentrations(d.s).a);
  assert.ok(gap < -0.03 && gap > -0.06, `gap ${gap}`);
});

test("making up over undissolved crystals: recorded once; A ends up slightly high", () => {
  const d = runLab({ undissolved: true, noCleanup: true });
  assert.ok(d.run.log.some((l: any) => /Crystals went into the flask/.test(l.text)), "the transfer warns");
  once(d, "made-up-before-dissolved");
  assert.equal(d.s.flaskA.solidG, 0, "inversion dissolved them");
  const gainOverCareful = rel(SP.assayOf(d.s).a, SP.assayOf(careful.s).a);
  assert.ok(gainOverCareful > 0.001 && gainOverCareful < 0.003, `gain ${gainOverCareful}`);
});

test("water past the mark in A: recorded once; A and B are low", () => {
  const d = runLab({ overA: true, noCleanup: true });
  once(d, "flask-a-over-mark");
  assert.equal(d.s.flaskA.labelledAt, "above");
  assert.ok(rel(SP.assayOf(d.s).a, SP.recordedConcentrations(d.s).a) < -0.002);
  assert.ok(rel(SP.assayOf(d.s).b, SP.recordedConcentrations(d.s).b) < -0.002);
});

test("labelling A below the mark: recorded once; A is high", () => {
  const d = runLab({ belowA: true, noCleanup: true });
  once(d, "flask-a-below-mark");
  assert.ok(rel(SP.assayOf(d.s).a, SP.recordedConcentrations(d.s).a) > 0.001);
});

test("pipetting from an unmixed A: recorded once; B is low (≈ 2 %)", () => {
  const d = runLab({ noMixA: true, noCleanup: true });
  once(d, "flask-a-not-mixed");
  near(rel(SP.assayOf(d.s).b, SP.assayOf(careful.s).b), -0.02, 0.004);
});

test("not rinsing the pipette with stock: recorded once; B is low (≈ 1 %)", () => {
  const d = runLab({ noPipetteRinse: true, noCleanup: true });
  once(d, "pipette-not-rinsed");
  near(rel(SP.assayOf(d.s).b, SP.assayOf(careful.s).b), -0.01, 0.003);
});

test("delivering above the pipette's mark: recorded once; B is high", () => {
  const d = runLab({ pipetteHigh: true, noCleanup: true });
  once(d, "pipette-not-at-mark");
  assert.ok(rel(SP.assayOf(d.s).b, SP.recordedConcentrations(d.s).b) > 0.008);
});

test("blowing out the pipette: recorded once; B is slightly high", () => {
  const d = runLab({ blow: true, noCleanup: true });
  once(d, "pipette-blown-out");
  assert.ok(SP.assayOf(d.s).b > SP.assayOf(careful.s).b);
});

test("water past the mark in B: recorded once; B is low", () => {
  const d = runLab({ overB: true, noCleanup: true });
  once(d, "flask-b-over-mark");
  assert.ok(rel(SP.assayOf(d.s).b, SP.recordedConcentrations(d.s).b) < -0.002);
});

test("labelling B below the mark: recorded once; B is high", () => {
  const d = runLab({ belowB: true, noCleanup: true });
  once(d, "flask-b-below-mark");
  assert.ok(rel(SP.assayOf(d.s).b, SP.recordedConcentrations(d.s).b) > 0.001);
});

test("not mixing B: recorded once; a sample of B is low (≈ 2 %)", () => {
  const d = runLab({ noMixB: true, noCleanup: true });
  once(d, "flask-b-not-mixed");
  near(rel(SP.assayOf(d.s).b, SP.assayOf(careful.s).b), -0.02, 0.004);
});

test("refused choices are recorded once and change nothing: solute, glassware, mouth pipetting, transcription", () => {
  const d = driver(SEED.pct);
  let before = d.s;
  d.act({ type: "identify", choice: "kcl" });
  d.act({ type: "identify", choice: "na-only" });
  assert.equal(d.s, before);
  once(d, "solute-identification");
  d.act({ type: "identify", choice: "nacl" });
  before = d.s;
  d.act({ type: "plan", stock: "cylinder", aliquot: "pipette" });
  assert.equal(d.s, before);
  once(d, "wrong-glassware");
  assert.match(d.run.mistakes.find((m: any) => m.id === "wrong-glassware").consequence, /imprecise/);

  const e = runLab({ stopBeforeResults: true });
  const mid = e.s;
  e.act({ type: "pipetteDraw", method: "mouth" }); // B already has its aliquot; mouth pipetting is refused before anything else
  assert.equal(e.s, mid);
  once(e, "mouth-pipetting");

  const f = driver(SEED.pct);
  f.act({ type: "identify", choice: "nacl" });
  f.act({ type: "plan", stock: "flask", aliquot: "pipette" });
  f.act({ type: "calcMass", value: 0.9 });
  for (const item of ["boat", "spatula"]) {
    f.act({ type: "cabinet", cabinet: "cabinet-instruments", open: true });
    f.act({ type: "retrieve", item });
  }
  f.act({ type: "cabinet", cabinet: "cabinet-reagents", open: true });
  f.act({ type: "retrieve", item: "nacl" });
  f.act({ type: "placeBoat" });
  f.act({ type: "tare" });
  f.act({ type: "addSolid", amount: "scoop" });
  const s0 = f.s;
  f.act({ type: "recordMass", value: SP.balanceReading(f.s) + 0.001 });
  assert.equal(f.s, s0);
  once(f, "mass-transcription");
});

// ── Calculations, hints and worked solutions ─────────────────────────────

test("a wrong calculation is refused with an explanation and counted as an attempt", () => {
  const d = driver(SEED.molar);
  d.act({ type: "identify", choice: "nacl" });
  d.act({ type: "plan", stock: "flask", aliquot: "pipette" });
  d.act({ type: "calcMass", value: 0.9 }); // used % w/v arithmetic on a mol/L task
  assert.equal(d.s.calcMass, null);
  assert.equal(d.s.attempts.mass, 1);
  once(d, "calc-mass");
  assert.match(d.run.mistakes[0].consequence, /high/, "0.9 g > 0.8766 g: the stock would be too strong");
  d.act({ type: "calcMass", value: 0.8766 });
  near(d.s.calcMass, 0.8766, 1e-9);
  d.act({ type: "calcDilution", value: 1 });
  assert.equal(d.s.calcV1, null);
  once(d, "calc-dilution");
  d.act({ type: "calcDilution", value: 10.0 });
  assert.equal(d.s.calcV1, 10);
});

test("results are checked against the student's own record, not the target", () => {
  const d = runLab({ seed: SEED.pct, stopBeforeResults: true });
  const t = SP.taskOf(d.s);
  const mine = myResults(d.s);
  if (Math.abs(rel(mine.a, t.stock)) > 0.001) {
    d.act({ type: "recordResults", a: t.stock, b: t.dilute });
    assert.equal(d.s.results, null, "target values are refused when the weighed mass differs");
    once(d, "calc-results");
  }
  d.act({ type: "recordResults", a: Number(mine.a.toPrecision(4)), b: Number(mine.b.toPrecision(4)) });
  assert.ok(d.s.results);
});

test("calculation steps have three hints: variables, formula, substitution with units", () => {
  for (const id of ["calculate", "dilutionCalc", "record"]) {
    const st = DEF.steps.find((x: any) => x.id === id);
    assert.equal(st.hints.length, 3, id);
    assert.match(st.hints[0], /^Variables/);
    assert.match(st.hints[1], /^Formula/);
    assert.match(st.hints[2], /^Substitution/);
    assert.match(st.hints[2], /mL/);
  }
  for (const st of DEF.steps) assert.ok(st.hints.length >= 2, `${st.id} needs progressive hints`);
});

test("worked solution: free any time in Learning; in Practical only after an attempt, and it costs marks", () => {
  // Learning: free, before any attempt
  const l = driver(SEED.pct, "learning");
  l.act({ type: "worked", calc: "mass", mode: "learning" });
  assert.equal(l.s.worked.mass, "learning");
  assert.deepEqual(ids(l), []);
  assert.ok(SP.workedSolution(l.s, "mass").some((x: string) => /0\.9000 g/.test(x)));
  // Practical: refused before an attempt
  const p = driver(SEED.molar, "practical");
  p.act({ type: "identify", choice: "nacl" });
  p.act({ type: "plan", stock: "flask", aliquot: "pipette" });
  const before = p.s;
  p.act({ type: "worked", calc: "mass", mode: "practical" });
  assert.equal(p.s, before);
  assert.equal(p.s.worked.mass, null);
  p.act({ type: "calcMass", value: 0.9 });
  p.act({ type: "worked", calc: "mass", mode: "practical" });
  assert.equal(p.s.worked.mass, "practical");
  once(p, "worked-solution-mass");
  assert.equal(p.run.mistakes.find((m: any) => m.id === "worked-solution-mass").weight, 4);
  assert.ok(SP.workedSolution(p.s, "mass").some((x: string) => /0\.8766 g/.test(x) && /mol\/L/.test(x)));
  // undo does not erase the record
  p.msg({ type: "undo" });
  once(p, "worked-solution-mass");
});

// ── Remake ─────────────────────────────────────────────────────────────────

test("A made up past the mark can be discarded and remade: the result is accurate, the mistake stays", () => {
  const d = driver(SEED.pct);
  // run the careful procedure to the over-filled stock by hand
  const full = runLab({ overA: true, stopBeforeResults: true });
  assert.ok(ids(full).includes("flask-a-over-mark"));
  // the same, but discard A before pipetting and redo it
  d.act({ type: "identify", choice: "nacl" });
  d.act({ type: "plan", stock: "flask", aliquot: "pipette" });
  d.act({ type: "calcMass", value: 0.9 });
  for (const cab of ["cabinet-instruments", "cabinet-reagents", "cabinet-glass"]) {
    d.act({ type: "cabinet", cabinet: cab, open: true });
    for (const [item, where] of Object.entries(PLAN.stored)) if (where === cab) d.act({ type: "retrieve", item });
    d.act({ type: "cabinet", cabinet: cab, open: false });
  }
  const prepareA = (over: boolean) => {
    d.act({ type: "placeBoat" });
    d.act({ type: "tare" });
    for (let i = 0; i < 300 && Math.abs(0.9 - SP.balanceReading(d.s)) > 0.0036; i++) {
      const gap = 0.9 - SP.balanceReading(d.s);
      d.act(gap < 0 ? { type: "removeSolid" } : { type: "addSolid", amount: gap > 0.36 ? "scoop" : gap > 0.07 ? "small" : "tap" });
    }
    d.act({ type: "recordMass", value: SP.balanceReading(d.s) });
    d.act({ type: "tipIntoBeaker" });
    d.act({ type: "rinseBoat" });
    for (let i = 0; i < 3; i++) d.act({ type: "addWater", target: "beaker", amount: "portion" });
    for (let i = 0; i < 3; i++) d.act({ type: "stir" });
    d.act({ type: "placeFunnel" });
    d.act({ type: "transfer" });
    for (const item of ["beaker", "beaker", "rod", "funnel"]) d.act({ type: "rinseInto", item });
    d.act({ type: "removeFunnel" });
    makeUp(d, "flask-a", { over });
  };
  prepareA(true);
  once(d, "flask-a-over-mark");
  d.act({ type: "discard", flask: "flask-a" });
  assert.equal(d.s.massRecorded, null);
  assert.ok(d.s.bench.pending.includes("discarded-a"));
  // the used boat is reused (it was emptied) — or replaced if binned
  prepareA(false);
  once(d, "flask-a-over-mark");
  assert.equal(d.s.flaskA.labelledAt, "at");
  near(rel(SP.assayOf(d.s).a, SP.recordedConcentrations(d.s).a), 0, 0.002);
});

// ── The equipment gate (bypass) ───────────────────────────────────────────

test("bypass: no action works without its instrument open; nor from the wrong instrument", () => {
  const d = runLab({ stopBeforeResults: true });
  const base = d.run;
  const attempts: [string | null, any][] = [
    [null, { type: "recordResults", a: 1, b: 0.1 }],
    ["balance", { type: "recordResults", a: 1, b: 0.1 }],
    ["notebook", { type: "addWater", target: "flask-b", amount: "drop" }],
    ["balance", { type: "pipetteDraw", method: "filler" }],
    ["pipette", { type: "dispose", waste: "pipette-rinse", stream: "sink" }],
    ["sink", { type: "retrieve", item: "beaker" }],
    ["notebook", { type: "tap", on: true }],
  ];
  for (const [eq, action] of attempts) {
    let r = M.reduceRun(DEF, base, { type: "operate", equipment: eq });
    const after = M.reduceRun(DEF, r, { type: "act", action });
    assert.equal(after.s, r.s, `${action.type} worked from ${eq}`);
    assert.equal(after.last[0].kind, "error");
    assert.match(after.last[0].text, /select it in the lab/);
  }
});

test("bypass: every action type the run uses is reachable on an instrument; each piece opens one controller", () => {
  const eq = new Set(DEF.equipment.map((e: any) => e.id));
  for (const c of DEF.controllers) for (const e of c.equipment) assert.ok(eq.has(e), `${c.id}: ${e}`);
  const opened = new Map<string, string>();
  for (const c of DEF.controllers) for (const e of c.equipment) if (!opened.has(e)) opened.set(e, c.id);
  for (const id of [...PLAN.fixed, ...Object.keys(PLAN.stored), "notebook", "sink", "waste-station", "cabinet-glass", "cabinet-instruments", "cabinet-reagents"]) {
    assert.ok(opened.has(id), `${id} opens nothing`);
    assert.ok(eq.has(id), `${id} is not equipment`);
  }
  // every equipment id is one the contract lists (fixed, stored or a fixture)
  for (const e of eq) assert.ok([...PLAN.fixed, ...Object.keys(PLAN.stored), "notebook", "sink", "waste-station", "cabinet-glass", "cabinet-instruments", "cabinet-reagents"].includes(e), `${e} not in the contract`);
});

// ── Shared bench rules (common.ts) ────────────────────────────────────────

test("bench rules: an item must be retrieved before use, from its own open cabinet", () => {
  const d = driver(SEED.pct);
  d.act({ type: "identify", choice: "nacl" });
  d.act({ type: "plan", stock: "flask", aliquot: "pipette" });
  d.act({ type: "calcMass", value: 0.9 });
  let s0 = d.s;
  d.act({ type: "placeBoat" });
  assert.equal(d.s, s0);
  assert.match(d.run.last[0].text, /Get the Weighing boat from the Apparatus cabinet/);
  d.act({ type: "retrieve", item: "boat" });
  assert.equal(d.s, s0, "the cabinet is shut");
  d.act({ type: "cabinet", cabinet: "cabinet-glass", open: true });
  s0 = d.s;
  d.act({ type: "retrieve", item: "boat" });
  assert.equal(d.s, s0, "the boat is not in the glassware cupboard");
  d.act({ type: "cabinet", cabinet: "cabinet-instruments", open: true });
  d.act({ type: "retrieve", item: "boat" });
  d.act({ type: "placeBoat" });
  d.act({ type: "tare" });
  s0 = d.s;
  d.act({ type: "addSolid", amount: "scoop" });
  assert.equal(d.s, s0, "no spatula, no salt");
  assert.match(d.run.last[0].text, /Spatula/);
});

test("bench rules: waste goes only to its stream; hazardous waste is never accepted by the sink", () => {
  // In this practical: a used boat offered to the sink is refused and recorded
  const d = runLab({ noCleanup: true });
  assert.ok(d.s.bench.pending.includes("boat"));
  const s0 = d.s;
  d.act({ type: "dispose", waste: "boat", stream: "sink" });
  assert.equal(d.s, s0);
  once(d, "waste-wrong-stream");
  // dilute NaCl is classified sink-safe (not hazardous), with a reason
  for (const id of ["surplus-a", "surplus-b", "pipette-rinse"]) {
    const w = SP.KIT.wasteById.get(id);
    assert.equal(w.stream, "sink");
    assert.equal(w.hazardous, false);
    assert.match(w.why, /drain-disposal/);
  }
  assert.equal(SP.KIT.wasteById.get("boat").stream, "solid", "an NaCl-only boat is not pharmaceutical waste");
  // sink-safe waste is refused while the tap is off, accepted with it running
  const e = runLab({ noCleanup: true });
  e.act({ type: "empty", flask: "flask-a" });
  const s1 = e.s;
  e.act({ type: "dispose", waste: "surplus-a", stream: "sink" });
  assert.equal(e.s, s1, "tap off: refused");
  assert.equal(e.run.mistakes.length, 0, "a refusal, not a mistake");
  e.act({ type: "tap", on: true });
  e.act({ type: "dispose", waste: "surplus-a", stream: "sink" });
  assert.ok(e.s.bench.disposed.some((x: any) => x.id === "surplus-a" && x.stream === "sink"));
  assert.ok([...SP.KIT.wasteById.values()].every((w: any) => !(w.hazardous && w.stream === "sink")), "nothing hazardous is routed to the sink");
  // the kit itself: a hazardous waste offered to the sink is refused with the heavier mistake
  const kit = K.commonKit({ stored: [], waste: [{ id: "solvent", name: "Ethanol waste", stream: "organic", hazardous: true, why: "Flammable." }] });
  const b = kit.produce(kit.initial(), "solvent");
  const r = kit.apply(b, { type: "dispose", waste: "solvent", stream: "sink" });
  assert.equal(r.changed, false);
  assert.equal(r.bench, b);
  assert.equal(r.feedback[0].mistake.id, "waste-hazard-to-sink");
  assert.equal(kit.apply(b, { type: "dispose", waste: "solvent", stream: "organic" }).changed, true);
});

test("bench rules: dirty glassware must be rinsed before it is put away; full vessels cannot be rinsed", () => {
  const d = runLab({ noCleanup: true });
  d.act({ type: "tap", on: true });
  let s0 = d.s;
  d.act({ type: "rinse", item: "flask-a" });
  assert.equal(d.s, s0, "flask A still holds solution");
  d.act({ type: "cabinet", cabinet: "cabinet-glass", open: true });
  s0 = d.s;
  d.act({ type: "return", item: "beaker" });
  assert.equal(d.s, s0);
  assert.match(d.run.last[0].text, /Rinse the beaker/);
  d.act({ type: "rinse", item: "beaker" });
  d.act({ type: "return", item: "beaker" });
  assert.ok(!d.s.bench.out.includes("beaker"));
  s0 = d.s;
  d.act({ type: "rinse", item: "nacl" });
  assert.equal(d.s, s0, "reagent jars are never wetted");
});

// ── Learning mode, RoboPharma, visual ───────────────────────────────────────

test("suggest(): valid and silent at every judgement in every scripted run (checked at each state)", () => {
  // driver() checks every state; here: the specific quiet points are actually reached
  const d = runLab();
  assert.ok(d.states.some((s: any) => s.massRecorded === null && s.boatSolidG > 0 && DEF.suggest(s) === null), "quiet near the weighing target");
  assert.ok(d.states.some((s: any) => s.flaskA.fills > 0 && !s.flaskA.stoppered && !s.flaskA.labelled && DEF.suggest(s) === null), "quiet at A's mark");
  assert.ok(d.states.some((s: any) => s.pipette.ml > 0 && DEF.suggest(s) === null), "quiet at the pipette's mark");
  assert.equal(DEF.suggest(d.s), null, "nothing left to do");
  for (const s of d.states) {
    const sug = DEF.suggest(s);
    if (sug && sug.controller === "waste-station") assert.equal(sug.action, "dispose");
  }
});

test("RoboPharma: points at the suggested instrument in Learning, at nothing in Practical", () => {
  // Learning — the driver asserts this at every quiet state; check one by hand too
  const l = driver(SEED.pct, "learning");
  l.act({ type: "identify", choice: "nacl" });
  const ml = tutorMessage(DEF, l.run);
  assert.equal(DEF.suggest(l.s).controller, "notebook");
  assert.equal(ml.target, "notebook");
  assert.equal(ml.hint.cost, 0);
  // Practical — a whole run through the driver asserts target === null; and hints cost marks
  const p = runLab({ mode: "practical", noCleanup: true });
  const mp = tutorMessage(DEF, p.run);
  assert.equal(mp.target, null);
  assert.equal(mp.hint.cost, M.HINT_COST);
  assert.ok(!mp.lines.join(" ").match(/\d+\.\d{2,} (g|mL)/), "no value in Practical guidance");
  // a mistake makes the robot explain its consequence
  const w = driver(SEED.pct);
  w.act({ type: "identify", choice: "kcl" });
  const mw = tutorMessage(DEF, w.run);
  assert.equal(mw.mood, "warning");
  assert.ok(mw.lines.some((x: string) => /every concentration/.test(x)));
});

test("visual: matches the contract shape and the state at key moments", () => {
  const keys = ["balance", "beakerMl", "beakerSolidG", "boatSolidG", "common", "flaskA", "flaskB", "funnelIn", "labels", "pipette", "stirring"];
  const flaskKeys = ["labelled", "meniscus", "mixed", "ml", "stoppered", "tint"];
  const d = runLab();
  const seen = { tared: false, stirring: false, funnel: false, at: false, pipette: false, labelled: false };
  for (const s of d.states) {
    const v = SP.solutionPrepVisual(s);
    assert.deepEqual(Object.keys(v).sort(), keys);
    assert.deepEqual(Object.keys(v.flaskA).sort(), flaskKeys);
    assert.deepEqual(Object.keys(v.flaskB).sort(), flaskKeys);
    assert.deepEqual(Object.keys(v.balance).sort(), ["boatOn", "reading"]);
    assert.deepEqual(Object.keys(v.pipette).sort(), ["ml", "over"]);
    assert.deepEqual(Object.keys(v.labels).sort(), ["flaskA", "flaskB", "solute"]);
    assert.deepEqual(Object.keys(v.common).sort(), ["open", "out", "rinsing", "tap", "waste"]);
    assert.equal(v.balance.reading, SP.balanceReading(s), "the LCD is the balance reading");
    assert.ok(["empty", "below", "at", "above"].includes(v.flaskA.meniscus));
    if (s.boatOn && s.tareG > 0 && s.boatSolidG === 0) (seen.tared = true), assert.equal(v.balance.reading, 0);
    if (v.stirring) seen.stirring = true;
    if (v.funnelIn === "flask-a") seen.funnel = true;
    if (v.flaskA.meniscus === "at") seen.at = true;
    if (v.pipette.ml > 0) (seen.pipette = true), assert.equal(v.pipette.over, "flask-a");
    if (s.flaskA.labelled) (seen.labelled = true), assert.match(v.labels.flaskA, /NaCl/);
    assert.equal(v.flaskA.tint, 0, "NaCl is colourless");
  }
  assert.deepEqual(seen, { tared: true, stirring: true, funnel: true, at: true, pipette: true, labelled: true });
  // after the careful run: everything returned, bins filled
  const end = SP.solutionPrepVisual(d.s);
  assert.deepEqual(end.common.out, []);
  assert.ok(end.common.waste.solid >= 1 && end.common.waste.sink >= 3);
  assert.equal(end.labels.solute, SP.SOLUTE_LABEL);
});

test("definition: steps, questions, safety and procedure status are complete", () => {
  assert.ok(DEF.steps.length >= 5 && DEF.questions.length >= 6 && DEF.safety.length >= 3 && DEF.principle.length >= 3);
  assert.equal(DEF.meta.id, "solution-preparation");
  const eq = new Set(DEF.equipment.map((e: any) => e.id));
  for (const st of DEF.steps) for (const f of st.focus) assert.ok(eq.has(f), `${st.id}: ${f}`);
  for (const q of DEF.questions) assert.ok(q.answer >= 0 && q.answer < q.options.length);
  const kinds = new Set(DEF.questions.map((q: any) => q.kind));
  for (const k of ["design", "interpretation", "viva", "calculation"]) assert.ok(kinds.has(k), k);
  assert.equal(SP.PROCEDURE.status, "referenced_simulation");
  assert.ok(SP.PROCEDURE.sources.length >= 3 && SP.PROCEDURE.sources.every((x: any) => /^https:\/\//.test(x.url)));
  assert.ok(SP.PROCEDURE.assumptions.some((x: string) => /teaching values/.test(x)));
  assert.ok(DEF.principle.some((p: string) => /Teaching values/.test(p)), "teaching values said on screen");
  // the briefing's equipment list covers the contract's fixtures this experiment uses
  for (const f of ["notebook", "sink", "waste-station"]) assert.ok(eq.has(f));
});
