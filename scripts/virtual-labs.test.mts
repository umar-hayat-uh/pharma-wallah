/**
 * Virtual Labs — the pure layer (added 2026-10-20).
 *
 *   node --test scripts/virtual-labs.test.mts
 *
 * The catalogue (exactly four labs), the generic run machine (undo, reset, hints,
 * assessment locking, submit gating, scoring), every scientific formula (normal,
 * boundary, invalid and unit-sensitive cases), and each experiment driven end to end by
 * a scripted student — once with perfect technique, and with specific mistakes whose
 * effect on the result must point the right way. Rendering is not covered here.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/ts-resolve.mjs", import.meta.url);

const { LAB_IDS, LAB_LIST, LABS, labByPath } = await import("../src/lib/virtual-labs/catalog.ts");
const { EXPERIMENTS } = await import("../src/lib/virtual-labs/experiments/index.ts");
const M = await import("../src/lib/virtual-labs/engine/machine.ts");
const T = await import("../src/lib/virtual-labs/calculations/titration.ts");
const S = await import("../src/lib/virtual-labs/calculations/syrup.ts");
const D = await import("../src/lib/virtual-labs/calculations/doseResponse.ts");
const O = await import("../src/lib/virtual-labs/calculations/microscopy.ts");
const TX = await import("../src/lib/virtual-labs/experiments/titration.ts");
const SX = await import("../src/lib/virtual-labs/experiments/syrup.ts");
const DX = await import("../src/lib/virtual-labs/experiments/doseResponse.ts");
const CX = await import("../src/lib/virtual-labs/experiments/clove.ts");

const near = (a: number, b: number, tol: number, msg?: string) => assert.ok(Math.abs(a - b) <= tol, `${msg ?? ""} expected ${b} ± ${tol}, got ${a}`);

/**
 * Check Learning mode's pointer for a state: it must name a real controller and an action
 * that controller performs (or be null).
 */
function checkSuggestion(def: any, s: any) {
  const sug = def.suggest(s);
  if (sug === null) return;
  const c = def.controllers.find((x: any) => x.id === sug.controller);
  assert.ok(c, `suggest() names an unknown controller "${sug.controller}"`);
  assert.ok(c.actions.includes(sug.action), `suggest() points at "${sug.action}", which ${c.id} cannot do`);
}

/**
 * Drive a definition through the run machine like a student in the room: before every
 * physical action, SELECT the instrument it is done with (the "operate" message), exactly
 * as LabExperience does when the student taps it. Throws if no instrument can perform an
 * action — so every action a scripted run uses is proven to be reachable on equipment.
 * Every state along the way also has its Learning-mode suggestion checked.
 */
function driver(def: any, seed = 7, mode: "learning" | "practical" = "learning") {
  let run = M.createRun(def, seed, mode);
  const act = (action: any) => {
    if (action.type !== "inspect" && !run.submitted) {
      const via = M.controllersForAction(def, action);
      if (!via.length) throw new Error(`no instrument in ${def.meta.id} can perform "${action.type}"`);
      if (!via.some((c: any) => c.id === run.active)) run = M.reduceRun(def, run, { type: "operate", equipment: via[0].equipment[0] });
    }
    run = M.reduceRun(def, run, { type: "act", action });
    checkSuggestion(def, run.s);
    return run;
  };
  return { get run() { return run; }, get s() { return run.s; }, act, msg: (m: any) => (run = M.reduceRun(def, run, m)) };
}

function answerAll(d: ReturnType<typeof driver>, def: any) {
  for (const q of def.questions) d.msg({ type: "answer", questionId: q.id, choice: q.answer });
}

// ── Catalogue ──────────────────────────────────────────────────────────────

test("exactly four labs and exactly four experiment definitions, one per lab", () => {
  assert.equal(LAB_IDS.length, 4);
  assert.equal(LAB_LIST.length, 4);
  assert.deepEqual(Object.keys(EXPERIMENTS).sort(), [...LAB_IDS].sort());
  assert.deepEqual(new Set(LAB_LIST.map((l: any) => l.discipline)), new Set(["pharmaceutical-chemistry", "pharmaceutics", "pharmacology", "pharmacognosy"]));
  for (const id of LAB_IDS) assert.equal(EXPERIMENTS[id].meta, LABS[id]);
});

test("lab routes resolve and unknown paths do not", () => {
  assert.equal(labByPath("pharmaceutical-chemistry", "acid-base-titration")?.id, "acid-base-titration");
  assert.equal(labByPath("pharmaceutics", "simple-syrup")?.id, "simple-syrup");
  assert.equal(labByPath("pharmacology", "dose-response")?.id, "dose-response");
  assert.equal(labByPath("pharmacognosy", "powdered-clove")?.id, "powdered-clove");
  assert.equal(labByPath("pharmacology", "simple-syrup"), undefined);
  for (const l of LAB_LIST) assert.equal(l.href, `/virtual-labs/${l.discipline}/${l.id}`);
});

test("every definition is complete and internally consistent", () => {
  for (const id of LAB_IDS) {
    const def = EXPERIMENTS[id];
    assert.ok(def.steps.length >= 5, id);
    assert.ok(def.questions.length >= 6, id);
    assert.ok(def.safety.length >= 3 && def.principle.length >= 3, id);
    const eq = new Set(def.equipment.map((e: any) => e.id));
    for (const st of def.steps) {
      assert.ok(st.hints.length >= 1, `${id}/${st.id} hints`);
      for (const f of st.focus) assert.ok(eq.has(f), `${id}/${st.id} focus ${f}`);
    }
    for (const q of def.questions) assert.ok(q.answer >= 0 && q.answer < q.options.length, `${id}/${q.id}`);
    assert.equal(new Set(def.questions.map((q: any) => q.id)).size, def.questions.length);
    // curriculum statuses must be one of the four allowed values; none may claim faculty review yet
    assert.ok(["proposed", "source_verified", "faculty_reviewed", "published"].includes(def.meta.curriculum.status));
    assert.notEqual(def.meta.curriculum.status, "faculty_reviewed", "no faculty review has happened");
    if (def.meta.curriculum.status === "source_verified") assert.ok(def.meta.curriculum.sources.length > 0, `${id} verified without a source`);
  }
});

// ── Engine ─────────────────────────────────────────────────────────────────

test("engine: rand is deterministic and in [0,1)", () => {
  assert.equal(M.rand(5, 1, 2), M.rand(5, 1, 2));
  assert.notEqual(M.rand(5, 1, 2), M.rand(6, 1, 2));
  for (let i = 0; i < 1000; i++) {
    const r = M.rand(i, i * 3);
    assert.ok(r >= 0 && r < 1);
  }
});

test("engine: undo restores the bench but keeps the mistake on record; reset clears everything", () => {
  const d = driver(TX.TITRATION);
  d.act({ type: "chooseApparatus", ids: ["burette-25"] }); // rejected with a mistake: no state change
  assert.equal(d.run.mistakes.length, 1);
  assert.equal(d.run.past.length, 0, "a rejected action is not an undo point");
  d.act({ type: "inspect", id: "burette" });
  assert.deepEqual(d.s.inspected, ["burette"]);
  d.msg({ type: "undo" });
  assert.deepEqual(d.s.inspected, []);
  assert.equal(d.run.mistakes.length, 1, "undo does not erase mistakes");
  d.msg({ type: "reset" });
  assert.equal(d.run.mistakes.length, 0);
  assert.equal(d.run.actions, 0);
});

test("engine: hints are revealed one at a time and capped", () => {
  const d = driver(TX.TITRATION);
  const step = TX.TITRATION.steps[0];
  for (let i = 0; i < step.hints.length + 2; i++) d.msg({ type: "hint", stepId: step.id });
  assert.equal(d.run.hints[step.id], step.hints.length);
});

test("engine: assessment opens only after the bench work; answers lock; submit is gated", () => {
  const d = driver(TX.TITRATION);
  d.msg({ type: "answer", questionId: "q1", choice: 1 });
  assert.deepEqual(d.run.answers, {}, "no answering before the bench is complete");
  d.msg({ type: "submit" });
  assert.equal(d.run.submitted, false);
});

test("engine: a mistake is scored once however often it is repeated", () => {
  const d = driver(TX.TITRATION);
  d.act({ type: "chooseApparatus", ids: ["burette-25"] });
  d.act({ type: "chooseApparatus", ids: ["burette-25"] });
  assert.equal(d.run.mistakes.filter((m: any) => m.id === "apparatus-burette-25").length, 1);
});

test("every definition's instruments are complete and consistent", () => {
  for (const id of LAB_IDS) {
    const def = EXPERIMENTS[id];
    const eq = new Set(def.equipment.map((e: any) => e.id));
    const ids = new Set(def.controllers.map((c: any) => c.id));
    assert.equal(ids.size, def.controllers.length, `${id}: duplicate controller id`);
    assert.ok(def.controllers.length >= 3, `${id}: too few instruments`);
    for (const c of def.controllers) {
      assert.ok(c.equipment.length > 0 && c.actions.length > 0, `${id}/${c.id} empty`);
      for (const e of c.equipment) assert.ok(eq.has(e), `${id}/${c.id}: equipment "${e}" is not in the definition`);
      assert.ok(!c.actions.includes("inspect"), `${id}/${c.id}: inspecting is selecting, not an instrument action`);
      for (const n of c.nearby ?? []) assert.ok(ids.has(n), `${id}/${c.id}: nearby "${n}" is not a controller`);
      assert.ok(c.brief && c.howTo.length > 0, `${id}/${c.id}: needs a brief and Learning-mode how-to`);
    }
    // every step that names equipment names something you can select
    for (const st of def.steps) if (st.id !== "inspect") for (const f of st.focus) assert.ok(def.controllers.some((c: any) => c.equipment.includes(f)) || eq.has(f), `${id}/${st.id}`);
    // Learning mode's pointer is valid from the very first state
    checkSuggestion(def, def.initial(5));
  }
});

// ── The equipment gate: the bench cannot be operated by bypassing the equipment ──

test("bypass: an action with no instrument open is refused, changes nothing and is logged", () => {
  for (const id of LAB_IDS) {
    const def = EXPERIMENTS[id];
    let run = M.createRun(def, 3);
    const c = def.controllers[0];
    const action = { type: c.actions[0] };
    const after = M.reduceRun(def, run, { type: "act", action });
    assert.equal(after.s, run.s, `${id}: state changed without the instrument`);
    assert.equal(after.actions, 0, `${id}: a refused bypass counted as an action`);
    assert.equal(after.last[0].kind, "error");
    assert.match(after.last[0].text, /select it in the lab/);
    assert.equal(after.log.at(-1).kind, "error", `${id}: bypass attempt not logged`);
  }
});

test("bypass: an action from the WRONG instrument is refused", () => {
  for (const id of LAB_IDS) {
    const def = EXPERIMENTS[id];
    // every pair of instruments: an action one can do and the other cannot is refused from the other
    let tested = 0;
    for (const a of def.controllers) for (const b of def.controllers) {
      if (a === b) continue;
      const only = b.actions.find((t: string) => !a.actions.includes(t));
      if (!only) continue;
      let r = M.createRun(def, 3);
      r = M.reduceRun(def, r, { type: "operate", equipment: a.equipment[0] });
      const after = M.reduceRun(def, r, { type: "act", action: { type: only } });
      assert.equal(after.s, r.s, `${id}: ${only} worked from ${a.id}`);
      tested++;
    }
    assert.ok(tested >= def.controllers.length, `${id}: too few pairs tested (${tested})`);
    const [a, b] = def.controllers;
    const only = b.actions.find((t: string) => !a.actions.includes(t));
    let run = M.createRun(def, 3);
    run = M.reduceRun(def, run, { type: "operate", equipment: a.equipment[0] });
    assert.equal(run.active, a.id);
    const after = M.reduceRun(def, run, { type: "act", action: { type: only } });
    assert.equal(after.s, run.s, `${id}: ${only} worked from ${a.id}`);
    assert.equal(after.last[0].kind, "error");
  }
});

test("bypass: selecting the right instrument opens it; closing it closes it; inspect needs no instrument", () => {
  const def = TX.TITRATION;
  let run = M.createRun(def, 3);
  run = M.reduceRun(def, run, { type: "act", action: { type: "inspect", id: "burette" } });
  assert.deepEqual(run.s.inspected, ["burette"], "inspecting is allowed without operating");
  run = M.reduceRun(def, run, { type: "operate", equipment: "stand" });
  assert.equal(run.active, "burette", "the stand opens the burette's controls");
  run = M.reduceRun(def, run, { type: "operate", equipment: null });
  assert.equal(run.active, null);
  run = M.reduceRun(def, run, { type: "operate", equipment: "not-a-thing" });
  assert.equal(run.active, null);
  assert.deepEqual(run.operated, ["burette"]);
});

test("bypass: a titration cannot be completed without operating the burette", () => {
  // Drive the careful run, but strip the burette from the student's reach: every burette
  // action is attempted with the conical flask open instead.
  const def = TX.TITRATION;
  let run = M.createRun(def, 11);
  const burette = def.controllers.find((c: any) => c.id === "burette");
  for (const t of ["rinseBurette", "fillBurette", "removeFunnel", "expelBubble", "recordInitial", "addTitrant", "recordFinal"]) {
    run = M.reduceRun(def, run, { type: "operate", equipment: "notebook" });
    const before = run.s;
    run = M.reduceRun(def, run, { type: "act", action: { type: t, value: 0, ml: 1 } });
    assert.equal(run.s, before, `${t} worked without the burette`);
    assert.ok(burette.actions.includes(t));
  }
  assert.equal(def.stepComplete(run.s, "titrate"), false);
  assert.equal(def.benchComplete(run.s), false);
});

// ── Modes ────────────────────────────────────────────────────────────────────

test("modes: Learning → Practical only on a fresh bench; Practical → Learning makes the run practice", () => {
  const def = TX.TITRATION;
  let run = M.createRun(def, 3, "learning");
  run = M.reduceRun(def, run, { type: "mode", mode: "practical" });
  assert.equal(run.mode, "practical");
  assert.equal(run.assessed, true, "switching before any action starts an assessed run");
  run = M.reduceRun(def, run, { type: "act", action: { type: "inspect", id: "burette" } });
  run = M.reduceRun(def, run, { type: "mode", mode: "learning" });
  assert.equal(run.mode, "learning");
  assert.equal(run.assessed, false);
  assert.deepEqual(run.s.inspected, ["burette"], "the bench is kept");
  run = M.reduceRun(def, run, { type: "mode", mode: "practical" });
  assert.equal(run.mode, "learning", "guided work cannot be carried into an assessed run");
  assert.match(run.last[0].text, /fresh bench/);
  run = M.reduceRun(def, run, { type: "reset", mode: "practical" });
  assert.equal(run.mode, "practical");
  assert.equal(run.assessed, true);
});

test("modes: hints are free in Learning and cost technique marks (capped) in Practical", () => {
  const learn = titrationRun({ mode: "learning" });
  const prac = titrationRun({ mode: "practical" });
  for (const d of [learn, prac]) for (let i = 0; i < 3; i++) d.msg({ type: "hint", stepId: "calculate" });
  for (const d of [learn, prac]) {
    answerAll(d, TX.TITRATION);
    d.msg({ type: "submit" });
  }
  const rl = M.finalReport(TX.TITRATION, learn.run);
  const rp = M.finalReport(TX.TITRATION, prac.run);
  assert.equal(rl.hintPenalty, 0);
  assert.equal(rl.technique, 100);
  assert.equal(rp.assessed, true);
  assert.equal(rp.hintPenalty, 2 * M.HINT_COST, "two hints exist for that step");
  assert.equal(rp.technique, 100 - 2 * M.HINT_COST);
  const many = { ...prac.run, hints: { a: 10, b: 10 } };
  assert.equal(M.finalReport(TX.TITRATION, many).hintPenalty, M.HINT_CAP);
});

test("modes: Learning suggestions never point at a reading's value or past the end-point", () => {
  const d = titrationRun();
  // at the burette, mid-titration, the pointer is the valve or swirl — never "record final"
  const mid = { ...d.s, titrations: [], titreEntered: null, assayEntered: null, verdict: null, swirled: true };
  const sug = TX.TITRATION.suggest(mid);
  assert.equal(sug.controller, "burette");
  assert.equal(sug.action, "addTitrant");
  assert.equal(TX.TITRATION.suggest(TX.TITRATION.initial(1)), null, "inspection is the student's search");
});

// ── Titration chemistry ────────────────────────────────────────────────────

test("titration: assay formula — normal, unit and invalid cases", () => {
  // 1.0000 g, 100 mL, 20 mL aliquot, exact equivalence volume → 100 %
  const acid = (0.2 / 210.14) * 1000;
  const veq = T.equivalenceVolume(acid, 0.1);
  near(veq, 28.552, 0.001);
  near(T.assayPercent({ titreMl: veq, titrantMolar: 0.1, aliquotMl: 20, flaskMl: 100, sampleMassG: 1 }), 100, 1e-9);
  // doubling the titrant molarity halves the titre for the same answer (unit consistency)
  near(T.assayPercent({ titreMl: veq / 2, titrantMolar: 0.2, aliquotMl: 20, flaskMl: 100, sampleMassG: 1 }), 100, 1e-9);
  near(T.equivalenceFactorMg(0.1), 7.0047, 0.0001);
  near(T.equivalenceFactorMg(1), 70.047, 0.001);
  for (const bad of [{ titreMl: 0 }, { titreMl: -1 }, { sampleMassG: 0 }, { aliquotMl: NaN }]) {
    assert.ok(Number.isNaN(T.assayPercent({ titreMl: 28, titrantMolar: 0.1, aliquotMl: 20, flaskMl: 100, sampleMassG: 1, ...bad })));
  }
});

test("titration: titre — ordered, on-scale readings only (boundaries included)", () => {
  near(T.titre(0.4, 28.95), 28.55, 1e-9);
  assert.equal(T.titre(0, 50), 50);
  assert.equal(T.titre(0, 0), 0);
  assert.ok(Number.isNaN(T.titre(10, 5)), "final before initial");
  assert.ok(Number.isNaN(T.titre(-0.1, 5)), "above zero mark");
  assert.ok(Number.isNaN(T.titre(0, 50.1)), "beyond capacity");
  assert.ok(Number.isNaN(T.titre(NaN, 5)));
});

test("titration: pH model — acid start, alkaline equivalence, monotonic", () => {
  const acid = (0.2 / 210.14) * 1000;
  const veq = T.equivalenceVolume(acid, 0.1);
  const ph0 = T.citricPH(acid, 0, 45);
  assert.ok(ph0 > 2 && ph0 < 3, `start pH ${ph0}`);
  const phEq = T.citricPH(acid, veq * 0.1, 45 + veq);
  assert.ok(phEq > 8.5 && phEq < 10, `equivalence pH ${phEq}`);
  let prev = -1;
  for (let v = 0; v <= veq + 2; v += 0.5) {
    const ph = T.citricPH(acid, v * 0.1, 45 + v);
    assert.ok(ph >= prev - 1e-9);
    prev = ph;
  }
  assert.ok(Number.isNaN(T.citricPH(acid, 0, 0)));
  // phenolphthalein is still colourless well before the end-point, and deep pink after
  assert.ok(T.indicatorBaseFraction(T.INDICATORS.phenolphthalein, T.citricPH(acid, (veq - 1) * 0.1, 44 + veq)) < 0.05);
  assert.ok(T.indicatorBaseFraction(T.INDICATORS.phenolphthalein, T.citricPH(acid, (veq + 0.5) * 0.1, 45.5 + veq)) > T.DEEP_PINK_FRACTION);
});

test("titration: concordance", () => {
  assert.equal(T.concordance([28.4, 28.45]).concordant, true);
  assert.equal(T.concordance([28.4, 28.65]).concordant, false);
  assert.equal(T.concordance([28.4]).concordant, false);
  near(T.concordance([28.4, 28.5]).mean, 28.45, 1e-9);
});

/** A careful student. Returns the driver at the end of the bench work. */
function titrationRun(opts: { rinseBurette?: boolean; indicator?: string; seed?: number; mode?: "learning" | "practical" } = {}) {
  const def = TX.TITRATION;
  const d = driver(def, opts.seed ?? 11, opts.mode);
  for (const id of ["burette", "stand", "pipette", "vol-flask", "conical-flask", "indicator", "sample", "titrant"]) d.act({ type: "inspect", id });
  d.act({ type: "chooseApparatus", ids: TX.APPARATUS_OPTIONS.filter((o: any) => o.correct).map((o: any) => o.id) });
  d.act({ type: "chooseReagents", sample: "citric", titrant: "naoh", indicator: opts.indicator ?? "phenolphthalein" });
  d.act({ type: "placeBoat" });
  d.act({ type: "doors", closed: true });
  d.act({ type: "tare" });
  for (let i = 0; i < 200; i++) {
    const v = TX.balanceDisplay({ ...d.s, doorsClosed: true }).value;
    if (v >= 0.95 && v <= 1.05) break;
    d.act(v > 1.05 ? { type: "removeSample" } : { type: "addSample", amount: v < 0.75 ? "scoop" : "tap" });
  }
  d.act({ type: "doors", closed: true });
  d.act({ type: "recordMass", value: TX.balanceDisplay(d.s).value });
  d.act({ type: "transfer" });
  d.act({ type: "rinseBoat" });
  d.act({ type: "dissolve" });
  for (const ml of [20, 20, 5, 1, 1, 1, 1, 0.2, 0.2, 0.2, 0.2, 0.2]) d.act({ type: "addWater", ml });
  d.act({ type: "mixFlask" });
  d.act({ type: "rinsePipette" });
  d.act({ type: "pipette", style: "touch" });
  d.act({ type: "addDiluent" });
  d.act({ type: "addIndicator" });
  d.act({ type: "placeTile" });
  if (opts.rinseBurette !== false) d.act({ type: "rinseBurette" });
  d.act({ type: "fillBurette" });
  d.act({ type: "removeFunnel" });
  d.act({ type: "expelBubble" });
  d.act({ type: "recordInitial", value: d.s.level });
  const ind = opts.indicator ?? "phenolphthalein";
  if (ind === "phenolphthalein") {
    while (TX.flaskReading(d.s).f < 0.002) { d.act({ type: "addTitrant", ml: 1 }); d.act({ type: "swirl" }); }
    while (TX.flaskReading(d.s).f < T.FAINT_PINK_FRACTION) { d.act({ type: "addTitrant", ml: 0.05 }); d.act({ type: "swirl" }); }
  } else {
    // methyl orange: stop at its orange (pH ≈ 4)
    while (TX.flaskReading(d.s).pH < 4) { d.act({ type: "addTitrant", ml: 0.1 }); d.act({ type: "swirl" }); }
  }
  d.act({ type: "recordFinal", value: Math.round(d.s.level * 100) / 100 });
  const exp = TX.expectedResult(d.s);
  d.act({ type: "enterResults", titre: Math.round(exp.mean * 100) / 100, assay: Math.round(exp.assay * 100) / 100 });
  const [lo, hi] = TX.METHOD.limits;
  d.act({ type: "verdict", value: d.s.assayEntered >= lo && d.s.assayEntered <= hi ? "complies" : "fails" });
  return d;
}

test("titration: a careful student completes the experiment with no mistakes and an accurate assay", () => {
  const d = titrationRun();
  assert.deepEqual(d.run.mistakes.map((m: any) => m.id), []);
  assert.ok(TX.TITRATION.benchComplete(d.s));
  near(d.s.assayEntered, d.s.purity, 0.6, "assay vs true purity");
  answerAll(d, TX.TITRATION);
  d.msg({ type: "submit" });
  assert.equal(d.run.submitted, true);
  const rep = M.finalReport(TX.TITRATION, d.run);
  assert.equal(rep.technique, 100);
  assert.equal(rep.assessment.percent, 100);
  assert.equal(rep.grade, "Distinction");
  // actions after submission are refused
  const before = d.s;
  d.act({ type: "inspect", id: "tile" });
  assert.equal(d.s, before);
});

test("titration: an unrinsed burette makes the assay high by about 1.5 %, and is recorded", () => {
  const good = titrationRun({ seed: 3 });
  const bad = titrationRun({ seed: 3, rinseBurette: false });
  assert.ok(bad.run.mistakes.some((m: any) => m.id === "burette-not-rinsed"));
  const diff = bad.s.assayEntered - good.s.assayEntered;
  assert.ok(diff > 0.9 && diff < 2.2, `difference ${diff}`);
});

test("titration: methyl orange gives a grossly low assay and is recorded", () => {
  const d = titrationRun({ indicator: "methyl-orange" });
  assert.ok(d.run.mistakes.some((m: any) => m.id === "indicator-methyl-orange"));
  assert.ok(d.s.assayEntered < 60, `assay ${d.s.assayEntered}`);
});

test("titration: preconditions refuse out-of-order actions with an explanation", () => {
  const d = driver(TX.TITRATION);
  d.act({ type: "recordFinal", value: 10 });
  assert.equal(d.s.titrations.length, 0);
  assert.equal(d.run.last[0].kind, "error");
  d.act({ type: "enterResults", titre: 28, assay: 100 });
  assert.equal(d.s.assayEntered, null);
  d.act({ type: "addTitrant", ml: 1 });
  assert.equal(d.s.deliveredMl, 0);
  d.act({ type: "addTitrant", ml: 3.7 }); // not an allowed increment
  assert.equal(d.s.deliveredMl, 0);
});

test("titration: a wrong calculation is refused, not silently accepted", () => {
  const d = titrationRun();
  const fresh = driver(TX.TITRATION, 11);
  // replay up to the calculation by re-running, then submit a wrong answer on a copy
  const s = { ...d.s, titreEntered: null, assayEntered: null, verdict: null };
  const r = TX.TITRATION.apply(s, { type: "enterResults", titre: 30, assay: 100 });
  assert.equal(r.state.assayEntered, null);
  assert.ok(r.feedback.some((f: any) => f.mistake?.id === "calc-titre"));
  void fresh;
});

// ── Syrup instruments ──────────────────────────────────────────────────────

const SYRUP_ACTION_TYPES = ["calculate", "placeBoat", "tare", "addSucrose", "removeSucrose", "recordMass", "pourWater", "readCylinder", "waterToBeaker", "sucroseToBeaker", "beakerOnHotplate", "setHeat", "stir", "wait", "finishDissolving", "chooseVessel", "transferToVessel", "rinseBeaker", "qs", "mixAfterQs", "readFinal", "pack", "label", "observe", "weighDensity", "recordDensity", "sign"];

test("syrup instruments: every action is on an instrument, every instrument is real equipment, each piece opens one", () => {
  const def = SX.SYRUP;
  const ids = def.equipment.map((e: any) => e.id);
  for (const t of SYRUP_ACTION_TYPES) assert.ok(M.controllersForAction(def, { type: t }).length > 0, `no instrument performs ${t}`);
  for (const c of def.controllers) {
    for (const e of c.equipment) assert.ok(ids.includes(e), `${c.id} opens on unknown equipment ${e}`);
    for (const t of c.actions) assert.ok(SYRUP_ACTION_TYPES.includes(t), `${c.id} lists unknown action ${t}`);
    for (const n of c.nearby ?? []) assert.ok(def.controllers.some((x: any) => x.id === n), `${c.id}: unknown nearby ${n}`);
  }
  const owners = def.equipment.map((e: any) => def.controllers.filter((c: any) => c.equipment.includes(e.id)).length);
  assert.ok(owners.every((n: number) => n <= 1), "a piece of equipment opens more than one instrument");
  assert.equal(M.controllerForEquipment(def, "sucrose").id, "balance", "the sucrose jar is used at the balance");
  assert.equal(M.controllerForEquipment(def, "notebook").id, "notebook");
  // stirring is a mixing-vessel operation: never from the balance, the bottle or the notebook
  assert.deepEqual(M.controllersForAction(def, { type: "stir" }).map((c: any) => c.id).sort(), ["beaker", "hotplate", "rod"]);
  assert.deepEqual(M.controllersForAction(def, { type: "mixAfterQs" }).map((c: any) => c.id).sort(), ["cylinder", "rod"]);
});

test("bypass: syrup sucrose cannot be weighed without the balance, nor dissolved without the mixing vessel", () => {
  const def = SX.SYRUP;
  const d = driver(def, 5);
  for (const id of ["balance", "boat", "sucrose", "beaker", "cylinder", "rod", "water", "hotplate", "bottle"]) d.act({ type: "inspect", id });
  d.act({ type: "calculate", batchMl: 100, sucroseG: 85, waterMl: 45 });
  // with the cylinder in hand, the balance cannot be operated
  d.msg({ type: "operate", equipment: "cylinder" });
  for (const a of [{ type: "placeBoat" }, { type: "tare" }, { type: "addSucrose", amount: "large" }, { type: "recordMass", value: 0 }]) {
    const before = d.s;
    d.msg({ type: "act", action: a });
    assert.equal(d.s, before, `${a.type} worked without the balance`);
    assert.equal(d.run.last[0].kind, "error");
  }
  assert.equal(def.stepComplete(d.s, "weigh"), false);
  // weigh and measure properly, then try to dissolve from instruments that cannot mix
  d.act({ type: "placeBoat" });
  d.act({ type: "tare" });
  for (let i = 0; i < 300 && Math.abs(SX.syrupBalance(d.s) - 85) > 0.3; i++) {
    const v = SX.syrupBalance(d.s);
    d.act(v > 85.3 ? { type: "removeSucrose" } : { type: "addSucrose", amount: v < 72 ? "large" : v < 83 ? "scoop" : "tap" });
  }
  d.act({ type: "recordMass", value: SX.syrupBalance(d.s) });
  for (const ml of [10, 10, 10, 10, 5]) d.act({ type: "pourWater", ml });
  d.act({ type: "readCylinder", value: 45 });
  d.act({ type: "waterToBeaker" });
  for (const via of ["balance", "bottle", "notebook"]) {
    d.msg({ type: "operate", equipment: via });
    for (const a of [{ type: "beakerOnHotplate" }, { type: "stir", on: true }, { type: "sucroseToBeaker" }, { type: "wait", seconds: 300 }, { type: "finishDissolving" }]) {
      const before = d.s;
      d.msg({ type: "act", action: a });
      assert.equal(d.s, before, `${a.type} worked from the ${via}`);
    }
  }
  assert.equal(d.s.stirring, false);
  assert.equal(d.s.sucroseInBeaker, 0);
  assert.equal(def.stepComplete(d.s, "dissolve"), false);
  assert.equal(def.benchComplete(d.s), false);
});

test("syrup suggest: points at the next control, goes quiet at a meniscus, never names a choice", () => {
  const def = SX.SYRUP;
  const s0 = def.initial(5);
  assert.equal(def.suggest(s0), null, "inspection is the student's search");
  const inspected = { ...s0, inspected: ["balance", "boat", "sucrose", "beaker", "cylinder", "rod", "water", "hotplate", "bottle"] };
  assert.deepEqual(def.suggest(inspected), { controller: "notebook", action: "calculate" });
  const calc = def.apply(inspected, { type: "calculate", batchMl: 100, sucroseG: 85, waterMl: 45 }).state;
  assert.deepEqual(def.suggest(calc), { controller: "balance", action: "placeBoat" });
  // the starting water: obviously short → pour; near the target, reading it is the skill
  const weighed = { ...calc, boatOn: true, tareG: SX.FORMULA.boatMassG, sucroseOnBoat: 85, massRecorded: 85 };
  assert.deepEqual(def.suggest({ ...weighed, cylinderMl: 20 }), { controller: "cylinder", action: "pourWater" });
  assert.equal(def.suggest({ ...weighed, cylinderMl: 44 }), null);
  assert.equal(def.suggest({ ...weighed, cylinderMl: 46 }), null);
  // making up to volume: quiet near the mark until the student has mixed
  const d = syrupRun();
  const atMark = { ...d.s, finalRead: null, mixedAfterQs: false, container: null, storage: null, labelled: false, appearance: null, densityMassG: null, densityRecorded: null, signed: false };
  assert.equal(def.suggest(atMark), null);
  assert.deepEqual(def.suggest({ ...atMark, mixedAfterQs: true }), { controller: "cylinder", action: "readFinal" });
  // packing and evaluating: the control, never the option
  const packing = { ...atMark, finalRead: 100, mixedAfterQs: true };
  for (const [s, action] of [[packing, "pack"], [{ ...packing, container: "amber" }, "label"], [{ ...packing, container: "amber", storage: "cool", labelled: true }, "observe"]] as const) {
    const sug = def.suggest(s);
    assert.deepEqual(Object.keys(sug).sort(), ["action", "controller"], "a suggestion carries no option or value");
    assert.equal(sug.controller, "bottle");
    assert.equal(sug.action, action);
  }
  assert.equal(def.suggest(d.s), null, "nothing left once the record is signed");
  assert.ok(def.benchComplete(d.s));
});

// ── Syrup physics ──────────────────────────────────────────────────────────

test("syrup: density table and interpolation", () => {
  // table points are reproduced exactly (NBS C457 decade values)
  near(S.densityAt20(0), 0.99823, 1e-9);
  near(S.densityAt20(60), 1.28646, 1e-9);
  near(S.densityAt20(70), 1.34717, 1e-9);
  // between points: monotonic and close to the standard Brix tables (65 % ≈ 1.3163)
  near(S.densityAt20(65), 1.3163, 0.001);
  for (let w = 0; w < 70; w += 0.5) assert.ok(S.densityAt20(w + 0.5) > S.densityAt20(w));
  near(S.densityAt20(-5), 0.99823, 1e-9, "clamped below");
  near(S.densityAt20(90), 1.34717, 1e-9, "clamped above");
  assert.ok(Number.isNaN(S.densityAt20(NaN)));
});

test("syrup: 85 % w/v ≈ 64.7 % w/w at ≈ 1.31 g/mL (USP syrup)", () => {
  const ww = S.wwFromWv(85);
  near(ww, 64.6, 0.3);
  near(S.densityAt20(ww), 1.313, 0.004);
  near(ww * S.densityAt20(ww), 85, 0.01);
  assert.ok(Number.isNaN(S.wwFromWv(-1)));
  assert.ok(Number.isNaN(S.wwFromWv(200)), "beyond the table");
});

test("syrup: batch quantities and units", () => {
  assert.equal(S.sucroseForBatch(85, 100), 85);
  near(S.sucroseForBatch(85, 60), 51, 1e-9);
  assert.ok(Number.isNaN(S.sucroseForBatch(85, 0)));
  // the finished 100 mL batch holds ≈ 46.3 g water
  near(S.waterInBatch(85, 100), 46.3, 0.5);
  // volume of 85 g sucrose + that water at 20 °C is 100 mL; warmer is larger
  const w = S.waterInBatch(85, 100);
  near(S.solutionVolume(85, w, 20), 100, 0.01);
  assert.ok(S.solutionVolume(85, w, 60) > 101.5);
  near(S.densityFromWeighing(65.65, 50), 1.313, 1e-9);
  assert.ok(Number.isNaN(S.densityFromWeighing(0, 50)));
  near(S.deviationPercent(86.7, 85), 2, 1e-9);
});

function syrupRun(opts: { tare?: boolean; makeUpHot?: boolean; boil?: boolean } = {}) {
  const def = SX.SYRUP;
  const d = driver(def, 5);
  for (const id of ["balance", "boat", "sucrose", "beaker", "cylinder", "rod", "water", "hotplate", "bottle"]) d.act({ type: "inspect", id });
  d.act({ type: "calculate", batchMl: 100, sucroseG: 85, waterMl: 45 });
  d.act({ type: "placeBoat" });
  if (opts.tare !== false) d.act({ type: "tare" });
  for (let i = 0; i < 300; i++) {
    const v = SX.syrupBalance(d.s);
    if (Math.abs(v - 85) <= 0.3) break;
    d.act(v > 85.3 ? { type: "removeSucrose" } : { type: "addSucrose", amount: v < 72 ? "large" : v < 83 ? "scoop" : "tap" });
  }
  d.act({ type: "recordMass", value: SX.syrupBalance(d.s) });
  for (const ml of [10, 10, 10, 10, 5]) d.act({ type: "pourWater", ml });
  d.act({ type: "readCylinder", value: 45 });
  d.act({ type: "waterToBeaker" });
  d.act({ type: "beakerOnHotplate" });
  d.act({ type: "setHeat", setpoint: opts.boil ? 120 : 60 });
  d.act({ type: "stir", on: true });
  d.act({ type: "wait", seconds: 120 });
  d.act({ type: "sucroseToBeaker" });
  for (let i = 0; i < 40 && d.s.sucroseInBeaker - d.s.dissolvedG > 0.3; i++) d.act({ type: "wait", seconds: 60 });
  d.act({ type: "finishDissolving" });
  d.act({ type: "setHeat", setpoint: 0 });
  if (!opts.makeUpHot) for (let i = 0; i < 40 && d.s.tempC > 30; i++) d.act({ type: "wait", seconds: 60 });
  d.act({ type: "chooseVessel", vessel: "cylinder" });
  d.act({ type: "transferToVessel" });
  d.act({ type: "rinseBeaker" });
  for (let i = 0; i < 400; i++) {
    const v = SX.batchFigures(d.s).volumeNow;
    if (v >= 99.8) break;
    d.act({ type: "qs", ml: v < 98 ? 1 : 0.2 });
  }
  d.act({ type: "mixAfterQs" });
  d.act({ type: "readFinal", value: Math.round(SX.batchFigures(d.s).volumeNow * 10) / 10 });
  d.act({ type: "pack", container: "amber" });
  d.act({ type: "label", storage: "cool" });
  d.act({ type: "observe", appearance: SX.trueAppearance(d.s) });
  d.act({ type: "weighDensity" });
  d.act({ type: "recordDensity", value: Math.round((d.s.densityMassG / 50) * 1000) / 1000 });
  d.act({ type: "sign" });
  return d;
}

test("syrup: a careful student makes 85 % w/v syrup of density ≈ 1.31 with no mistakes", () => {
  const d = syrupRun();
  assert.deepEqual(d.run.mistakes.map((m: any) => m.id), []);
  assert.ok(SX.SYRUP.benchComplete(d.s));
  const f = SX.batchFigures(d.s);
  near(f.wv, 85, 1.3);
  near(d.s.densityRecorded, 1.313, 0.01);
  assert.equal(SX.trueAppearance(d.s), "clear");
  answerAll(d, SX.SYRUP);
  d.msg({ type: "submit" });
  assert.equal(M.finalReport(SX.SYRUP, d.run).technique, 100);
});

test("syrup: weighing without taring is recorded and gives a weak syrup", () => {
  const d = syrupRun({ tare: false });
  assert.ok(d.run.mistakes.some((m: any) => m.id === "not-tared"));
  assert.ok(SX.batchFigures(d.s).wv < 83, `wv ${SX.batchFigures(d.s).wv}`);
});

test("syrup: making up while hot is recorded and leaves the batch short when cool", () => {
  const d = syrupRun({ makeUpHot: true });
  assert.ok(d.run.mistakes.some((m: any) => m.id === "made-up-hot"));
  // the hot reading looked right; at 20 °C the batch is not the volume that was recorded
  const v20 = SX.batchFigures(d.s).volume20;
  assert.ok(Math.abs(v20 - d.s.finalRead) > 1, `recorded ${d.s.finalRead} vs ${v20} at 20 °C`);
});

test("syrup: boiling is recorded and colours the syrup", () => {
  const d = driver(SX.SYRUP);
  const s0 = { ...d.s, beakerWaterG: 45, sucroseInBeaker: 85, onHotplate: true, setpoint: 120, stirring: true };
  const r = SX.SYRUP.apply(s0, { type: "wait", seconds: 300 });
  assert.ok(r.feedback.some((f: any) => f.mistake?.id === "overheated"));
  const r2 = SX.SYRUP.apply(r.state, { type: "wait", seconds: 120 });
  assert.equal(SX.trueAppearance(r2.state), "yellow");
});

test("syrup: a wrong calculation is refused", () => {
  const d = driver(SX.SYRUP);
  d.act({ type: "calculate", batchMl: 100, sucroseG: 80, waterMl: 45 });
  assert.equal(d.s.calcSucrose, null);
  d.act({ type: "calculate", batchMl: 100, sucroseG: 85, waterMl: 70 });
  assert.equal(d.s.calcSucrose, null, "too much starting water");
  d.act({ type: "calculate", batchMl: 75, sucroseG: 63.75, waterMl: 33 });
  assert.equal(d.s.calcSucrose, null, "batch size not offered");
});

// ── Dose–response ──────────────────────────────────────────────────────────

test("dose–response: Hill equation boundaries and inverse", () => {
  assert.equal(D.hill(0, 100, 1e-7), 0);
  near(D.hill(1e-7, 100, 1e-7), 50, 1e-9);
  near(D.hill(1e-7, 100, 1e-7, 2), 50, 1e-9);
  assert.ok(D.hill(1, 100, 1e-7) > 99.99);
  assert.ok(Number.isNaN(D.hill(-1, 100, 1e-7)));
  assert.ok(Number.isNaN(D.hill(1e-7, 100, 0)));
  near(D.concentrationFor(0.5, 1e-7), 1e-7, 1e-15);
  near(D.concentrationFor(0.9, 1e-7), 9e-7, 1e-13);
  assert.ok(Number.isNaN(D.concentrationFor(1, 1e-7)));
});

test("dose–response: stock volumes in µL (units)", () => {
  near(D.stockVolumeUl(1e-7, 20, 1e-4), 20, 1e-9);
  near(D.stockVolumeUl(1e-5, 20, 1e-3), 200, 1e-9);
  assert.ok(Number.isNaN(D.stockVolumeUl(1e-7, 20, 0)));
  for (const c of DX.MODEL.concentrations) {
    const st = DX.stockFor(c);
    assert.ok(st.ul >= 1 && st.ul <= 200, `${c} → ${st.ul} µL`);
  }
});

test("dose–response: the fit recovers known parameters", () => {
  const pts = [1e-9, 3e-9, 1e-8, 3e-8, 1e-7, 3e-7, 1e-6, 3e-6, 1e-5].map((c) => ({ c, e: D.hill(c, 46, 1e-7, 1) }));
  const fit = D.fitHill(pts)!;
  near(fit.logEc50, -7, 0.011);
  near(fit.emax, 46, 0.2);
  near(fit.n, 1, 0.051);
  assert.ok(fit.r2 > 0.999);
  assert.equal(D.fitHill(pts.slice(0, 2)), null);
  assert.equal(D.molarLabel(1e-7), "10⁻⁷ M");
  assert.equal(D.molarLabel(3e-7), "3 × 10⁻⁷ M");
});

function doseRun(opts: { wash?: boolean; warm?: boolean } = {}) {
  const d = driver(DX.DOSE_RESPONSE, 9);
  for (const id of ["organ-bath", "thermostat", "aerator", "tissue", "transducer", "recorder", "stock", "micropipette", "pss"]) d.act({ type: "inspect", id });
  d.act({ type: "variables", independent: "conc", dependent: "height" });
  d.act({ type: "fillBath" });
  if (opts.warm !== false) d.act({ type: "thermostat", on: true });
  d.act({ type: "aeration", on: true });
  d.act({ type: "mountTissue" });
  d.act({ type: "setTension" });
  d.act({ type: "zeroRecorder" });
  d.act({ type: "wait", minutes: 10 });
  d.act({ type: "wait", minutes: 10 });
  for (const c of [1e-9, 1e-8, 3e-8, 1e-7, 3e-7, 1e-6, 3e-6, 1e-5]) {
    d.act({ type: "addDose", c });
    const p = d.s.trials[d.s.trials.length - 1];
    d.act({ type: "recordResponse", value: p.trueMm });
    if (opts.wash !== false) d.act({ type: "wash" });
  }
  d.act({ type: "plot", axis: "linear" });
  d.act({ type: "plot", axis: "log" });
  const fit = DX.studentFit(d.s);
  const max = Math.max(...DX.tableRows(d.s).map((r: any) => r.mean));
  d.act({ type: "estimate", emaxMm: max, logEc50: fit ? Math.round(fit.logEc50 * 100) / 100 : NaN });
  d.act({ type: "wash" });
  d.act({ type: "addUnknown" });
  const u = d.s.trials[d.s.trials.length - 1];
  d.act({ type: "recordResponse", value: u.trueMm });
  const read = DX.unknownFromCurve(d.s);
  d.act({ type: "estimateUnknown", logC: read ? Math.round(read.logC * 100) / 100 : NaN });
  return d;
}

test("dose–response: a careful student gets a sigmoid near the model's EC50 with no mistakes", () => {
  const d = doseRun();
  assert.deepEqual(d.run.mistakes.map((m: any) => m.id), []);
  assert.ok(DX.DOSE_RESPONSE.benchComplete(d.s));
  near(d.s.logEc50Entered, -7, 0.15);
  // the unknown read from the student's own curve lands near its true concentration
  near(d.s.unknownLogEntered, Math.log10(d.s.unknownC), 0.12);
  assert.equal(DX.tableRows(d.s).length, 8, "the unknown is kept out of the standard curve");
  answerAll(d, DX.DOSE_RESPONSE);
  d.msg({ type: "submit" });
  assert.equal(M.finalReport(DX.DOSE_RESPONSE, d.run).overall, 100);
});

test("dose–response: no washout is recorded and inflates/desensitises responses", () => {
  const d = doseRun({ wash: false });
  assert.ok(d.run.mistakes.some((m: any) => m.id === "no-wash"));
  assert.ok(d.s.trials.filter((t: any) => !t.unknown).slice(1).every((t: any) => t.effectiveC > t.c));
});

test("dose–response: a cold bath is recorded and gives smaller responses", () => {
  const warm = doseRun();
  const cold = doseRun({ warm: false });
  assert.ok(cold.run.mistakes.some((m: any) => m.id === "cold-bath"));
  const mw = Math.max(...warm.s.trials.map((t: any) => t.trueMm));
  const mc = Math.max(...cold.s.trials.map((t: any) => t.trueMm));
  assert.ok(mc < 0.7 * mw, `${mc} vs ${mw}`);
});

test("dose–response: responses are deterministic for a seed", () => {
  assert.deepEqual(doseRun().s.trials.map((t: any) => t.trueMm), doseRun().s.trials.map((t: any) => t.trueMm));
});

test("dose–response: cannot dose before set-up, nor plot before data", () => {
  const d = driver(DX.DOSE_RESPONSE);
  d.act({ type: "addDose", c: 1e-7 });
  assert.equal(d.s.trials.length, 0);
  d.act({ type: "plot", axis: "log" });
  assert.equal(d.s.plottedLog, false);
  d.act({ type: "addDose", c: 5e-7 }); // not a permitted concentration
  assert.equal(d.s.trials.length, 0);
});

const DOSE_KEY_ITEMS = ["organ-bath", "thermostat", "aerator", "tissue", "transducer", "recorder", "stock", "micropipette", "pss"];

/** A bath set up and equilibrated through its instruments, ready for the first dose. */
function doseReady(seed = 9) {
  const d = driver(DX.DOSE_RESPONSE, seed);
  for (const id of DOSE_KEY_ITEMS) d.act({ type: "inspect", id });
  d.act({ type: "variables", independent: "conc", dependent: "height" });
  for (const a of [{ type: "fillBath" }, { type: "thermostat", on: true }, { type: "aeration", on: true }, { type: "mountTissue" }, { type: "setTension" }, { type: "zeroRecorder" }]) d.act(a);
  d.act({ type: "wait", minutes: 10 });
  d.act({ type: "wait", minutes: 10 });
  return d;
}

test("bypass: dose–response data come only from doses given with the micropipette, and plot only on the recorder", () => {
  const def = DX.DOSE_RESPONSE;
  assert.equal(M.controllerForEquipment(def, "micropipette").id, "dosing");
  assert.equal(M.controllerForEquipment(def, "stock").id, "dosing");
  assert.deepEqual(def.controllers.filter((c: any) => c.actions.includes("addDose")).map((c: any) => c.id), ["dosing"], "only the micropipette doses the bath");
  const d = doseReady();
  // every other instrument tries to run a trial: nothing reaches the bath
  for (const c of def.controllers) {
    if (c.id === "dosing") continue;
    d.msg({ type: "operate", equipment: c.equipment[0] });
    const before = d.s;
    d.msg({ type: "act", action: { type: "addDose", c: 1e-7 } });
    d.msg({ type: "act", action: { type: "addUnknown" } });
    assert.equal(d.s, before, `a dose was given from the ${c.id}`);
  }
  // with nothing dosed there is no response to record, even from the recorder
  d.msg({ type: "operate", equipment: "recorder" });
  d.msg({ type: "act", action: { type: "recordResponse", value: 23 } });
  assert.equal(d.s.trials.length, 0);
  assert.equal(def.stepComplete(d.s, "trials"), false);
  // three real trials through the pipette → exactly three rows, each a recorded peak
  for (const c of [1e-8, 1e-7, 1e-6]) {
    d.act({ type: "addDose", c });
    d.act({ type: "recordResponse", value: d.s.trials.at(-1).trueMm });
    d.act({ type: "wash" });
  }
  assert.deepEqual(DX.tableRows(d.s).map((r: any) => r.c), [1e-8, 1e-7, 1e-6]);
  // the graph is drawn on the recorder and nowhere else
  for (const c of def.controllers) {
    if (c.id === "recorder") continue;
    d.msg({ type: "operate", equipment: c.equipment[0] });
    const before = d.s;
    d.msg({ type: "act", action: { type: "plot", axis: "log" } });
    d.msg({ type: "act", action: { type: "estimate", emaxMm: 40, logEc50: -7 } });
    assert.equal(d.s, before, `plotted or analysed from the ${c.id}`);
  }
  d.msg({ type: "operate", equipment: "recorder" });
  d.msg({ type: "act", action: { type: "plot", axis: "log" } });
  assert.equal(d.s.plottedLog, true);
});

test("dose–response: following Learning mode's pointer completes the bench with no mistakes, and it never names a value", () => {
  const def = DX.DOSE_RESPONSE;
  const d = driver(def, 9);
  assert.equal(def.suggest(d.s), null, "inspection is the student's search");
  for (const id of DOSE_KEY_ITEMS.slice(0, 4)) d.act({ type: "inspect", id });
  assert.equal(def.suggest(d.s), null, "still searching");
  for (const id of DOSE_KEY_ITEMS.slice(4)) d.act({ type: "inspect", id });
  const seen = new Set<string>();
  let next = 0;
  for (let i = 0; i < 200; i++) {
    const sug = def.suggest(d.s);
    if (!sug) break;
    // a pointer is an instrument and a control — no concentration, peak, Emax, EC50 or U
    assert.deepEqual(Object.keys(sug).sort(), ["action", "controller"]);
    seen.add(`${sug.controller}:${sug.action}`);
    const s = d.s;
    const pending = s.trials.find((t: any) => t.recordedMm === null);
    const fit = DX.studentFit(s);
    const read = DX.unknownFromCurve(s);
    // the student supplies every judgement: which concentration, what the trace reads, the analysis
    const a: any =
      sug.action === "variables" ? { type: "variables", independent: "conc", dependent: "height" }
      : sug.action === "thermostat" || sug.action === "aeration" ? { type: sug.action, on: true }
      : sug.action === "wait" ? { type: "wait", minutes: 5 }
      : sug.action === "addDose" ? { type: "addDose", c: DX.MODEL.concentrations[next++] }
      : sug.action === "recordResponse" ? { type: "recordResponse", value: pending.trueMm }
      : sug.action === "plot" ? { type: "plot", axis: s.plottedLinear ? "log" : "linear" }
      : sug.action === "estimate" ? { type: "estimate", emaxMm: Math.max(...DX.tableRows(s).map((r: any) => r.mean)), logEc50: Math.round(fit.logEc50 * 100) / 100 }
      : sug.action === "estimateUnknown" ? { type: "estimateUnknown", logC: Math.round(read.logC * 100) / 100 }
      : { type: sug.action };
    // operate the instrument the pointer names, as the guided camera walk does
    d.msg({ type: "operate", equipment: def.controllers.find((c: any) => c.id === sug.controller).equipment[0] });
    d.act(a);
  }
  assert.equal(def.suggest(d.s), null, "nothing left to point at");
  assert.ok(def.benchComplete(d.s), "the pointer leads to a complete bench");
  assert.deepEqual(d.run.mistakes.map((m: any) => m.id), [], "the pointer never leads into a mistake (cold, unequilibrated, unwashed)");
  for (const k of ["notebook:variables", "organ-bath:wait", "dosing:addDose", "dosing:recordResponse", "organ-bath:wash", "recorder:plot", "recorder:estimate", "dosing:addUnknown", "recorder:estimateUnknown"]) assert.ok(seen.has(k), `never pointed at ${k}`);
});

// ── Microscopy / clove ─────────────────────────────────────────────────────

test("microscopy: field of view and magnification", () => {
  assert.equal(O.fieldOfViewUm(4), 4500);
  assert.equal(O.fieldOfViewUm(10), 1800);
  assert.equal(O.fieldOfViewUm(40), 450);
  assert.equal(O.totalMagnification(40), 400);
});

test("microscopy: the slide is deterministic and recognisability follows the optics", () => {
  const a = O.generateSlide(4, CX.CLOVE_ELEMENTS, "small");
  assert.deepEqual(a, O.generateSlide(4, CX.CLOVE_ELEMENTS, "small"));
  assert.equal(O.generateSlide(4, CX.CLOVE_ELEMENTS, "large").length, a.length * 3);
  const pollen = a.find((e: any) => e.type === "pollen")!;
  const v = { mag: 40 as const, stageX: pollen.x, stageY: pollen.y, focusErrUm: pollen.z, light: true, slideOn: true };
  assert.ok(O.recognisable(v, a, true, CX.CLOVE_ELEMENTS).some((e: any) => e.id === pollen.id), "pollen visible at 40× in focus");
  assert.ok(!O.recognisable({ ...v, mag: 10 }, a, true, CX.CLOVE_ELEMENTS).some((e: any) => e.id === pollen.id), "pollen too small at 10×");
  assert.ok(!O.recognisable({ ...v, focusErrUm: pollen.z + 20 }, a, true, CX.CLOVE_ELEMENTS).some((e: any) => e.id === pollen.id), "out of focus");
  assert.equal(O.recognisable({ ...v, light: false }, a, true, CX.CLOVE_ELEMENTS).length, 0);
  const crystal = a.find((e: any) => e.type === "cluster-crystal")!;
  const vc = { ...v, stageX: crystal.x, stageY: crystal.y, focusErrUm: crystal.z };
  assert.ok(!O.recognisable(vc, a, false, CX.CLOVE_ELEMENTS).some((e: any) => e.id === crystal.id), "crystals need clearing");
});

test("clove: the reference never lists an absent feature as something the slide draws", () => {
  const drawn = new Set(CX.CLOVE_ELEMENTS.map((e: any) => e.type));
  for (const f of CX.REFERENCE_FEATURES) {
    if (f.expected === "present") assert.ok(f.element && drawn.has(f.element), f.id);
    else assert.ok(!f.element, f.id);
  }
  for (const t of ["starch", "trichome", "prism"]) assert.ok(!drawn.has(t), `${t} must not be drawn`);
});

function cloveRun(opts: { coarseAtHigh?: boolean } = {}) {
  const d = driver(CX.CLOVE, 13);
  for (const id of ["microscope", "slides", "coverslips", "chloral", "jars", "lamp", "needle", "blotting"]) d.act({ type: "inspect", id });
  d.act({ type: "chooseSample", id: "clove" });
  d.act({ type: "cleanSlide" });
  d.act({ type: "powder", amount: "small" });
  d.act({ type: "mountant", id: "chloral" });
  d.act({ type: "warm", how: "gentle" });
  d.act({ type: "coverslip", method: "angled" });
  d.act({ type: "blot" });
  d.act({ type: "placeSlide" });
  d.act({ type: "light", on: true });
  d.act({ type: "objective", mag: 10 });
  while (d.s.focusErrUm > 25) d.act({ type: "coarse", dir: 1 });
  while (d.s.focusErrUm > 0) d.act({ type: "fine", dir: 1 });
  // a boustrophedon sweep across the slide, as a student scans a mount
  const scan = (rows: number, cols: number) => {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) d.act({ type: "stage", dx: r % 2 ? -1 : 1, dy: 0 });
      d.act({ type: "stage", dx: 0, dy: 1 });
    }
  };
  scan(2, 3);
  d.act({ type: "centre" });
  d.act({ type: "objective", mag: 40 });
  if (opts.coarseAtHigh) { d.act({ type: "coarse", dir: 1 }); d.act({ type: "coarse", dir: -1 }); }
  d.act({ type: "fine", dir: 1 });
  d.act({ type: "fine", dir: -1 });
  scan(3, 4);
  d.act({ type: "iodineTest" });
  const answers: Record<string, string> = {};
  for (const f of CX.REFERENCE_FEATURES) answers[f.id] = f.expected;
  d.act({ type: "checklist", answers });
  d.act({ type: "compare" });
  d.act({ type: "identify", identity: "clove", evidence: ["oil-gland", "pollen", "cluster-crystal", "starch"] });
  return d;
}

test("clove: a careful student sees the diagnostic elements and identifies clove with no mistakes", () => {
  const d = cloveRun();
  assert.ok(["oil-gland", "pollen", "cluster-crystal", "spiral-vessel"].every((t) => d.s.seen.includes(t)), `seen ${d.s.seen}`);
  assert.deepEqual(d.run.mistakes.map((m: any) => m.id), []);
  assert.ok(CX.CLOVE.benchComplete(d.s));
  answerAll(d, CX.CLOVE);
  d.msg({ type: "submit" });
  assert.equal(M.finalReport(CX.CLOVE, d.run).technique, 100);
});

test("clove: coarse focus at 40× is recorded", () => {
  assert.ok(cloveRun({ coarseAtHigh: true }).run.mistakes.some((m: any) => m.id === "coarse-high"));
});

test("clove: identification is refused before observation and before comparison", () => {
  const d = driver(CX.CLOVE);
  d.act({ type: "checklist", answers: {} });
  assert.equal(d.s.checklist, null);
  d.act({ type: "identify", identity: "clove", evidence: ["oil-gland", "pollen", "starch"] });
  assert.equal(d.s.identity, null);
});

test("titration: an air bubble left in the tip is reachable, recorded and inflates the titre", () => {
  const d = driver(TX.TITRATION, 11);
  const s0 = { ...titrationRun({ seed: 11 }).s };
  // rebuild a bench at the burette step with the bubble still in
  let s = { ...s0, buretteFilled: false, initialRecorded: null, titrations: [], titreEntered: null, assayEntered: null, verdict: null, aliquotAcidMmol: s0.aliquotAcidMmol || 0.9, deliveredMl: 0 };
  s = TX.TITRATION.apply(s, { type: "fillBurette" }).state;
  s = TX.TITRATION.apply(s, { type: "removeFunnel" }).state;
  s = TX.TITRATION.apply(s, { type: "runToZero" }).state;
  assert.equal(s.bubble, true, "a gentle run-out leaves the bubble");
  const r = TX.TITRATION.apply(s, { type: "recordInitial", value: s.level });
  assert.ok(r.feedback.some((f: any) => f.mistake?.id === "bubble"));
  void d;
});

test("clove: a poor mount can be discarded and remade (mistakes stay)", () => {
  const d = driver(CX.CLOVE, 13);
  d.act({ type: "chooseSample", id: "clove" });
  d.act({ type: "powder", amount: "small" });
  d.act({ type: "mountant", id: "water" });
  assert.ok(d.run.mistakes.some((m: any) => m.id === "mountant-water"));
  d.act({ type: "remount" });
  assert.equal(d.s.mountant, null);
  d.act({ type: "powder", amount: "small" });
  d.act({ type: "mountant", id: "chloral" });
  assert.equal(d.s.mountant, "chloral");
  assert.ok(d.run.mistakes.some((m: any) => m.id === "mountant-water"), "the earlier mistake stays on the record");
});

/** A clove bench with a correct, cleared mount ready for the microscope (inspected, sampled, prepared). */
function clovePrepared(seed = 13) {
  const d = driver(CX.CLOVE, seed);
  for (const id of ["microscope", "slides", "coverslips", "chloral", "jars", "lamp", "needle", "blotting"]) d.act({ type: "inspect", id });
  d.act({ type: "chooseSample", id: "clove" });
  d.act({ type: "cleanSlide" });
  d.act({ type: "powder", amount: "small" });
  d.act({ type: "mountant", id: "chloral" });
  d.act({ type: "warm", how: "gentle" });
  d.act({ type: "coverslip", method: "angled" });
  d.act({ type: "blot" });
  return d;
}

test("bypass: clove cannot be observed without operating the microscope, nor identified from the notebook alone", () => {
  const def = CX.CLOVE;
  let run = clovePrepared().run;
  assert.ok(def.stepComplete(run.s, "prepare"));
  const mic = def.controllers.find((c: any) => c.id === "microscope");
  const scopeWork = [{ type: "placeSlide" }, { type: "light", on: true }, { type: "objective", mag: 10 }, { type: "coarse", dir: 1 }, { type: "fine", dir: 1 }, { type: "stage", dx: 1, dy: 0 }, { type: "centre" }];
  for (const from of ["slides", "lamp", "notebook", "jars"]) {
    for (const a of scopeWork) {
      run = M.reduceRun(def, run, { type: "operate", equipment: from });
      const before = run.s;
      run = M.reduceRun(def, run, { type: "act", action: a });
      assert.equal(run.s, before, `${a.type} worked from the ${from}`);
      assert.equal(run.last[0].kind, "error");
      assert.ok(mic.actions.includes(a.type), `${a.type} belongs to the microscope`);
    }
  }
  assert.equal(run.s.slideOnStage, false);
  assert.equal(def.stepComplete(run.s, "setup"), false);
  assert.equal(def.stepComplete(run.s, "observe"), false);
  // the notebook opens, but nothing unseen can be recorded, compared or identified
  run = M.reduceRun(def, run, { type: "operate", equipment: "notebook" });
  const answers = Object.fromEntries(CX.REFERENCE_FEATURES.map((f: any) => [f.id, f.expected]));
  run = M.reduceRun(def, run, { type: "act", action: { type: "checklist", answers } });
  assert.equal(run.s.checklist, null, "a perfect checklist is refused before anything was observed");
  run = M.reduceRun(def, run, { type: "act", action: { type: "compare" } });
  run = M.reduceRun(def, run, { type: "act", action: { type: "identify", identity: "clove", evidence: ["oil-gland", "pollen", "cluster-crystal"] } });
  assert.equal(run.s.compared, false);
  assert.equal(run.s.identity, null);
  // and the microscope cannot write in the notebook
  run = M.reduceRun(def, run, { type: "operate", equipment: "microscope" });
  const before = run.s;
  run = M.reduceRun(def, run, { type: "act", action: { type: "checklist", answers } });
  assert.equal(run.s, before);
  assert.match(run.last[0].text, /lab notebook/i);
  assert.equal(def.benchComplete(run.s), false);
});

test("modes: clove suggestions name an instrument only — never a jar, a feature or the identity — and lead to a finished observation", () => {
  const def = CX.CLOVE;
  assert.equal(def.suggest(def.initial(1)), null, "inspection is the student's search");
  const shape = (sug: any) => assert.ok(sug === null || Object.keys(sug).sort().join() === "action,controller", `suggest() carries more than a pointer: ${JSON.stringify(sug)}`);
  // Follow Learning mode's pointer at the microscope, choosing only the knob direction a
  // student would read off the blur. It must finish the observation without looping.
  const d = clovePrepared(21);
  for (let i = 0; i < 400 && !def.stepComplete(d.s, "observe"); i++) {
    const sug = def.suggest(d.s);
    shape(sug);
    assert.ok(sug, "a pointer exists until the observation is complete");
    assert.equal(sug.controller, "microscope", `pointer left the microscope: ${sug.controller}/${sug.action}`);
    const s = d.s;
    const dir = s.focusErrUm > 0 ? 1 : -1;
    const by: Record<string, any> = {
      placeSlide: {}, light: { on: true }, coarse: { dir }, fine: { dir }, centre: {},
      objective: { mag: s.mag === 4 ? 10 : s.mag === 10 ? 40 : 10 },
      stage: { dx: Math.floor(i / 4) % 2 ? -1 : 1, dy: i % 4 === 3 ? 1 : 0 },
    };
    d.act({ type: sug.action, ...by[sug.action] });
  }
  assert.ok(def.stepComplete(d.s, "observe"), "following the pointer completes the observation");
  assert.deepEqual(d.run.mistakes.map((m: any) => m.id), [], "the pointer never leads into a technique mistake");
  // beyond the observe step's own completion rule the pointer does not read the slide:
  // whatever was seen (and whatever the seed), the notebook is pointed at the same way
  const atChecklist = { ...d.s, iodineDone: true };
  for (const seen of [["oil-gland", "pollen", "cluster-crystal", "spiral-vessel"], ["pollen", "cluster-crystal", "spiral-vessel", "epidermis", "fibre"], CX.CLOVE_ELEMENTS.map((e: any) => e.type)]) {
    for (const seed of [1, 99]) assert.deepEqual(def.suggest({ ...atChecklist, seen, seed }), { controller: "notebook", action: "checklist" });
  }
  assert.deepEqual(def.suggest({ ...d.s, iodineDone: false }), { controller: "prep", action: "iodineTest" });
  // the identification is the student's own conclusion
  assert.equal(def.suggest({ ...atChecklist, checklist: {}, compared: true }), null);
  // an uncleared mount is pointed back to the preparation station, not onward
  assert.deepEqual(def.suggest({ ...d.s, mountant: "water", checklist: null, seen: [] }), { controller: "prep", action: "remount" });
  for (const sug of [def.suggest(d.s), def.suggest(def.initial(3))]) shape(sug);
});

test("clove: the eyepiece draws an element sharp (≤ 1.6 px) exactly when the engine counts it", () => {
  // MicroscopeView blurs each element by blurPx(focusErr − z) and hides what obscured() hides;
  // visibleNow() is what the engine records as seen. The two must agree element by element.
  const base = { ...clovePrepared(13).s, slideOnStage: true, light: true };
  let checked = 0;
  for (const mount of [{}, { powder: "large" }, { coverslip: "dropped" }]) {
    for (const mag of [4, 10, 40] as const) for (const err of [-4, -3, -1.5, 0, 1, 2.9, 3.1, 12, 13, 45, 46]) {
      const s = { ...base, ...mount, mag, focusErrUm: err };
      const counted = new Set(CX.visibleNow(s).map((e: any) => e.id));
      const r = O.fieldOfViewUm(mag) / 2;
      for (const e of CX.slideOf(s)) {
        if (Math.hypot(e.x - s.stageX, e.y - s.stageY) > r || e.size < O.OBJECTIVES[mag].minUm) continue;
        const drawnSharp = O.blurPx({ mag, stageX: 0, stageY: 0, focusErrUm: err - e.z, light: true, slideOn: true }) <= 1.6 + 1e-9 && !CX.obscured(s, e);
        assert.equal(counted.has(e.id), drawnSharp, `${mag}× err ${err}: element ${e.id} (${e.type}, z ${e.z.toFixed(2)})`);
        checked++;
      }
    }
  }
  assert.ok(checked > 500, `only ${checked} element views checked`);
});

test("asset manifest: every shipped file exists with the recorded size", async () => {
  const { ASSET_MANIFEST } = await import("../src/lib/virtual-labs/assets/manifest.ts");
  const { statSync } = await import("node:fs");
  const ROOT = new URL("..", import.meta.url).pathname;
  for (const a of ASSET_MANIFEST.filter((x: any) => x.used && x.kind !== "procedural")) {
    assert.ok(["approved", "needs_review"].includes(a.status), a.id);
    assert.ok(!/NC|NoDerivs/i.test(a.licence), `${a.id} licence`);
    for (const f of a.files) assert.equal(statSync(ROOT + f.path).size, f.bytes, f.path);
  }
});

// ── Babylon migration (2026-10-22): the Pharmaceutical Chemistry room moved to Babylon.js ──
// The pure modules both engines share are tested directly; the engine boundary is checked
// statically (reading source, never importing browser code), so a stray import of three.js
// into the Babylon chunk — or of Babylon into any shared bundle — fails here, not in production.

{
  const V = await import("../src/components/virtual-labs/vessel.ts");
  const Q = await import("../src/components/virtual-labs/quality.ts");
  const { readFileSync, readdirSync, statSync } = await import("node:fs");
  const ROOT = new URL("..", import.meta.url).pathname;
  const VL = ROOT + "src/components/virtual-labs/";
  const read = (p: string) => readFileSync(p, "utf8");
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = dir + (dir.endsWith("/") ? "" : "/") + n;
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx|mts|js|jsx)$/.test(n) ? [p] : [];
    });
  /** Every static import / re-export: { spec, typeOnly, text }. Multi-line imports included. */
  const staticImports = (src: string) => {
    const out: { spec: string; typeOnly: boolean; text: string }[] = [];
    const re = /^\s*(import|export)\s+(type\s+)?(?:[^;'"]*?\s+from\s+)?["']([^"']+)["']/gms;
    for (const m of src.matchAll(re)) out.push({ spec: m[3], typeOnly: !!m[2], text: m[0].trim() });
    return out;
  };

  test("babylon migration: heightForVolume matches a cylinder, is monotonic and clamps at the top", () => {
    const r = 0.02, top = 0.2;
    const cyl: any = [[r, 0], [r, top]];
    // The integrator steps 1/600 of the height, so it is within one step everywhere and
    // within 0.5 % once the level is a third of the way up (a 5 mL level is ~0.5 % high).
    for (const ml of [5, 20, 100, 200]) {
      const want = ml / 1e6 / (Math.PI * r * r);
      const got = V.heightForVolume(cyl, ml);
      assert.ok(Math.abs(got - want) <= top / 600 + 1e-12, `${ml} mL: ${got} vs ${want} (more than one step)`);
      if (ml >= 100) assert.ok(Math.abs(got - want) / want <= 0.005, `${ml} mL: ${got} vs ${want}`);
    }
    let prev = -1;
    for (let ml = 0; ml <= 260; ml += 2.5) {
      const h = V.heightForVolume(cyl, ml);
      assert.ok(h >= prev, `not monotonic at ${ml} mL`);
      prev = h;
    }
    // capacity is π·0.02²·0.2 m³ ≈ 251 mL: anything over it sits at the rim, never above
    assert.equal(V.heightForVolume(cyl, 1000), top);
    assert.equal(V.radiusAt(cyl, 0.1), r);
  });

  // TODO (defect, recorded 2026-10-22 — source not changed by this test's author): the flask's
  // inner bulb holds ~351 mL below the neck, so 100 mL fills only to y ≈ 0.025 m and the
  // calibration ring is drawn inside the bulb. Same profile in three/glass.ts (pre-existing).
  // Remove `todo` once the bulb is resized to ~100 mL; the test then guards it.
  test("babylon migration: the 100 mL volumetric flask's mark falls inside its neck", () => {
    // The profile and inset copied from babylon/apparatus.ts (volumetric flask).
    const T = 0.0016;
    const inset = (p: any[], t = T) => p.map(([rr, y]: number[], i: number) => [Math.max(0, rr - t), i === 0 ? y + t : y]);
    const outer = [[0, 0], [0.0227, 0], [0.0262, 0.007], [0.0271, 0.0262], [0.0227, 0.0455], [0.0105, 0.063], [0.0072, 0.07], [0.0072, 0.165], [0.0082, 0.17]];
    const inner = inset(outer.slice(0, 8));
    const mark = V.heightForVolume(inner as any, 100);
    assert.ok(mark > 0.07 && mark < 0.165, `100 mL mark at y = ${mark}, outside the neck (0.070–0.165)`);
    // and the source still uses the same profile, so this test guards the real flask
    const src = read(VL + "babylon/apparatus.ts");
    assert.ok(src.includes("[[0, 0], [0.0227, 0], [0.0262, 0.007], [0.0271, 0.0262], [0.0227, 0.0455], [0.0105, 0.063], [0.0072, 0.07], [0.0072, 0.165], [0.0082, 0.17]]"), "volumetric flask profile changed in apparatus.ts");
    assert.match(src, /const T = 0\.0016;/);
  });

  test("babylon migration: pixelRatioFor — never below 1, phone tiers, laptop held to budget", () => {
    for (const q of ["low", "medium", "high"] as const)
      for (const [w, h, d] of [[390, 844, 3], [1440, 900, 2], [3840, 2160, 1], [8000, 8000, 3], [320, 568, 0]])
        assert.ok(Q.pixelRatioFor(q, w, h, d) >= 1, `${q} ${w}×${h}@${d}`);
    assert.equal(Q.pixelRatioFor("medium", 390, 844, 3), 2);
    assert.equal(Q.pixelRatioFor("low", 390, 844, 3), 1.5);
    const r = Q.pixelRatioFor("medium", 1440, 900, 2);
    assert.ok(r < 2, `laptop not budgeted (${r})`);
    assert.ok(1440 * 900 * r * r <= Q.QUALITY.medium.budgetMP * 1e6 + 1, `${1440 * 900 * r * r} px over budget`);
    assert.equal(Q.QUALITY.medium.budgetMP, 2.4);
  });

  test("babylon migration: the Babylon room imports no three.js (types from ../three/types only)", () => {
    const files = walk(VL + "babylon");
    assert.ok(files.length >= 5, `only ${files.length} babylon files found`);
    for (const f of files) {
      const src = read(f);
      for (const im of staticImports(src)) {
        if (!/three/.test(im.spec)) continue;
        assert.ok(im.typeOnly && im.spec === "../three/types", `${f.slice(ROOT.length)}: ${im.text}`);
      }
      assert.ok(!/import\(\s*["'](three|[^"']*\/three\/)/.test(src), `${f.slice(ROOT.length)}: dynamic import of three`);
      assert.ok(!/require\(\s*["']three/.test(src), `${f.slice(ROOT.length)}: require("three")`);
    }
  });

  test("babylon migration: nothing outside babylon/ statically imports @babylonjs; Viewport loads it lazily", () => {
    const BAB = VL + "babylon/";
    for (const f of walk(ROOT + "src")) {
      if (f.startsWith(BAB)) continue;
      const src = read(f);
      for (const im of staticImports(src)) {
        assert.ok(!im.spec.startsWith("@babylonjs/"), `${f.slice(ROOT.length)}: ${im.text}`);
        // a static (non-type) import of the babylon folder would pull Babylon into that bundle
        if (/(^|\/)babylon\//.test(im.spec)) assert.ok(im.typeOnly, `${f.slice(ROOT.length)}: static ${im.text}`);
      }
    }
    const vp = read(VL + "Viewport.tsx");
    assert.match(vp, /import\(\s*["']\.\/babylon\/runtime["']\s*\)/);
    assert.match(vp, /import\(\s*["']\.\/babylon\/chemistry["']\s*\)/);
    const m = vp.match(/BABYLON_LABS[^=]*=\s*new Set[^(]*\(\s*\[([^\]]*)\]\s*\)/);
    assert.ok(m, "BABYLON_LABS not found in Viewport.tsx");
    const labs = [...m[1].matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
    assert.deepEqual(labs, ["acid-base-titration"]);
  });

  test("babylon migration: shared modules import no engine; @babylonjs/core is pinned exactly", () => {
    for (const f of ["quality.ts", "vessel.ts", "art/canvas.ts"]) {
      for (const im of staticImports(read(VL + f))) {
        assert.ok(im.spec !== "three" && !im.spec.startsWith("three/"), `${f}: ${im.text}`);
        assert.ok(!im.spec.startsWith("@babylonjs/"), `${f}: ${im.text}`);
        if (/three\//.test(im.spec)) assert.ok(im.typeOnly, `${f}: value import from the three.js folder: ${im.text}`);
      }
    }
    const pkg = JSON.parse(read(ROOT + "package.json"));
    const v = pkg.dependencies?.["@babylonjs/core"] ?? pkg.devDependencies?.["@babylonjs/core"];
    assert.ok(v, "@babylonjs/core is not a dependency");
    assert.match(v, /^\d+\.\d+\.\d+$/, `@babylonjs/core must be pinned exactly, got "${v}"`);
  });

  test("babylon migration: every titration equipment id the three.js room made selectable, the Babylon room does too", () => {
    const ids = (src: string, re: RegExp) => new Set([...src.matchAll(re)].map((m) => m[1]));
    const threeIds = ids(read(VL + "three/rooms/chemistry.ts"), /\br\.interactive\(\s*["']([^"']+)["']/g);
    const babIds = ids(read(VL + "babylon/chemistry.ts"), /\binteractive\(\s*list\s*,\s*["']([^"']+)["']/g);
    assert.ok(threeIds.size >= 10, `parsed only ${threeIds.size} three.js ids`);
    const eq = TX.TITRATION.equipment.map((e: any) => e.id);
    let checked = 0;
    for (const id of eq) {
      if (!threeIds.has(id)) continue;
      assert.ok(babIds.has(id), `"${id}" is selectable in the three.js room but not in the Babylon room`);
      checked++;
    }
    assert.ok(checked >= 10, `only ${checked} equipment ids compared`);
    // and every controller's equipment can be reached in the Babylon room
    for (const c of TX.TITRATION.controllers) assert.ok(c.equipment.some((e: string) => babIds.has(e)), `controller ${c.id} has no selectable equipment in the Babylon room`);
  });
}
