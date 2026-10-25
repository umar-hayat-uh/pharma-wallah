/**
 * Pharmaceutics room — shared bench mechanics (cabinets, sink, segregated waste), 2026-10-25.
 *
 *   node --test scripts/vlab-pharmaceutics-common.test.mts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";

register("./lib/ts-resolve.mjs", import.meta.url);
const C = await import("../src/lib/virtual-labs/experiments/pharmaceutics/common.ts");
const K = await import("../src/lib/virtual-labs/experiments/pharmaceutics/contract.ts");

const kit = C.commonKit({
  stored: [
    { id: "beaker", name: "Beaker", cabinet: "cabinet-glass" },
    { id: "spatula", name: "Spatula", cabinet: "cabinet-instruments" },
  ],
  waste: [
    { id: "boat", name: "Used weighing boat", stream: "solid", why: "Non-hazardous solid.", hazardous: false },
    { id: "ethanol", name: "Ethanol residue", stream: "organic", why: "Flammable solvent.", hazardous: true },
  ],
});

test("retrieve needs the right cabinet open; return needs it open and the item empty", () => {
  let b = kit.initial();
  let r = kit.apply(b, { type: "retrieve", item: "beaker" });
  assert.equal(r.changed, false);
  assert.match(r.feedback[0].text, /Glassware cupboard/);
  b = kit.apply(b, { type: "cabinet", cabinet: "cabinet-instruments", open: true }).bench;
  assert.equal(kit.apply(b, { type: "retrieve", item: "beaker" }).changed, false, "wrong cabinet");
  b = kit.apply(b, { type: "cabinet", cabinet: "cabinet-instruments", open: false }).bench;
  b = kit.apply(b, { type: "cabinet", cabinet: "cabinet-glass", open: true }).bench;
  b = kit.apply(b, { type: "retrieve", item: "beaker" }).bench;
  assert.deepEqual(b.out, ["beaker"]);
  assert.equal(kit.need(b, "beaker"), null);
  assert.ok(kit.need(b, "spatula"));
  assert.equal(kit.apply(b, { type: "return", item: "beaker" }, { inUse: () => true }).changed, false, "still holds material");
  b = kit.apply(b, { type: "return", item: "beaker" }).bench;
  assert.deepEqual(b.out, []);
});

test("rinsing needs the tap running and the item out", () => {
  let b = kit.initial();
  b = kit.apply(b, { type: "cabinet", cabinet: "cabinet-glass", open: true }).bench;
  b = kit.apply(b, { type: "retrieve", item: "beaker" }).bench;
  assert.equal(kit.apply(b, { type: "rinse", item: "beaker" }).changed, false);
  b = kit.apply(b, { type: "tap", on: true }).bench;
  b = kit.apply(b, { type: "rinse", item: "beaker" }).bench;
  assert.deepEqual(b.rinsed, ["beaker"]);
  assert.equal(kit.visual(b, "beaker").rinsing, "beaker");
  b = kit.apply(b, { type: "tap", on: false }).bench;
  assert.equal(kit.visual(b, "beaker").rinsing, null, "no water stream with the tap off");
});

test("waste: only produced waste, only its stream; hazardous to the sink is refused with the heavier mistake", () => {
  let b = kit.initial();
  assert.equal(kit.apply(b, { type: "dispose", waste: "ethanol", stream: "organic" }).changed, false, "not produced yet");
  b = kit.produce(b, "ethanol", "boat");
  b = kit.produce(b, "ethanol");
  assert.deepEqual(b.pending, ["ethanol", "boat"], "produce is idempotent");
  const sink = kit.apply(b, { type: "dispose", waste: "ethanol", stream: "sink" });
  assert.equal(sink.changed, false);
  assert.equal(sink.feedback[0].mistake?.id, "waste-hazard-to-sink");
  assert.equal(sink.feedback[0].mistake?.weight, 8);
  const wrong = kit.apply(b, { type: "dispose", waste: "boat", stream: "glass" });
  assert.equal(wrong.feedback[0].mistake?.id, "waste-wrong-stream");
  b = kit.apply(b, { type: "dispose", waste: "ethanol", stream: "organic" }).bench;
  b = kit.apply(b, { type: "dispose", waste: "boat", stream: "solid" }).bench;
  assert.ok(kit.allDisposed(b));
  assert.deepEqual(kit.visual(b).waste, { sink: 0, aqueous: 0, organic: 1, "chemical-solid": 0, solid: 1, glass: 0 });
  assert.equal(kit.produce(b, "boat").pending.length, 0, "disposed waste is not produced again");
});

test("controllers cover every common action and only cabinets that hold something", () => {
  const ids = kit.controllers.map((c: any) => c.id);
  assert.deepEqual(ids, ["cabinet-glass", "cabinet-instruments", "sink", "waste-station"]);
  const actions = new Set(kit.controllers.flatMap((c: any) => c.actions));
  for (const t of C.COMMON_ACTION_TYPES) assert.ok(actions.has(t), t);
});

test("contract: every stored item lives in a real cabinet; no id is both fixed and stored", () => {
  const cabinets = new Set(C.CABINETS.map((c: any) => c.id));
  for (const [exp, plan] of Object.entries(K.EQUIPMENT_PLAN) as [string, any][]) {
    for (const [id, cab] of Object.entries(plan.stored)) assert.ok(cabinets.has(cab as string), `${exp}/${id}`);
    for (const id of plan.fixed) assert.ok(!(id in plan.stored), `${exp}/${id} both fixed and stored`);
    for (const id of [...plan.fixed, ...Object.keys(plan.stored)]) assert.ok(!(K.FIXTURES as readonly string[]).includes(id), `${exp}/${id} shadows a fixture`);
  }
});

test("sink-safe waste goes to the sink only with the tap running", () => {
  const k = C.commonKit({ stored: [], waste: [{ id: "nacl", name: "Surplus sodium chloride solution", stream: "sink", why: "Drug-free, non-hazardous.", hazardous: false }] });
  let b = k.produce(k.initial(), "nacl");
  assert.equal(k.apply(b, { type: "dispose", waste: "nacl", stream: "sink" }).changed, false, "tap off");
  b = k.apply(b, { type: "tap", on: true }).bench;
  b = k.apply(b, { type: "dispose", waste: "nacl", stream: "sink" }).bench;
  assert.ok(k.allDisposed(b));
});

test("a cabinet's controller operates only its own door and contents (engine gate)", async () => {
  const M = await import("../src/lib/virtual-labs/engine/machine.ts");
  const def: any = { controllers: kit.controllers };
  const via = (a: any) => M.controllersForAction(def, a).map((c: any) => c.id);
  assert.deepEqual(via({ type: "cabinet", cabinet: "cabinet-glass", open: true }), ["cabinet-glass"]);
  assert.deepEqual(via({ type: "retrieve", item: "spatula" }), ["cabinet-instruments"]);
  assert.deepEqual(via({ type: "return", item: "beaker" }), ["cabinet-glass"]);
  assert.deepEqual(via({ type: "tap", on: true }), ["sink"]);
});

test("over-cautious streams listed in alsoOk are accepted without a mistake; unknown cabinets are refused", () => {
  const k = C.commonKit({ stored: [], waste: [{ id: "nacl", name: "NaCl solution", stream: "sink", why: "Sink-safe.", hazardous: false, alsoOk: ["aqueous"] }] });
  const b = k.produce(k.initial(), "nacl");
  const r = k.apply(b, { type: "dispose", waste: "nacl", stream: "aqueous" });
  assert.ok(r.changed);
  assert.equal(r.feedback[0].mistake, undefined);
  assert.ok(k.allDisposed(r.bench));
  assert.equal(k.apply(k.initial(), { type: "cabinet", cabinet: "cabinet-x" as any, open: true }).changed, false);
});

test("the run machine stamps the run's own mode on an action's mode field", async () => {
  const M = await import("../src/lib/virtual-labs/engine/machine.ts");
  let seen: string | null = null;
  const def: any = {
    controllers: [{ id: "nb", name: "Notebook", equipment: ["nb"], actions: ["worked"], brief: "", howTo: [""] }],
    steps: [{ id: "a", title: "", objective: "", hints: [], focus: [] }],
    initial: () => ({}),
    apply: (s: any, a: any) => { seen = a.mode; return { state: s, feedback: [] }; },
    stepComplete: () => false,
  };
  let run = M.createRun(def, 1, "practical");
  run = M.reduceRun(def, run, { type: "operate", equipment: "nb" } as any);
  M.reduceRun(def, run, { type: "act", action: { type: "worked", mode: "learning" } });
  assert.equal(seen, "practical");
});
