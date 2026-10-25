/**
 * The Pharmaceutics room on Babylon.js (2026-10-25) — static checks.
 *
 *   node --test scripts/vlab-pharmaceutics-room.test.mts
 *
 * The room is browser code (Babylon, canvases), so it is checked by READING its source,
 * never by importing it: every equipment id the contract and the experiments rely on must
 * be registered as interactive by the builder of the experiment that uses it; Babylon
 * must stay inside babylon/ and load lazily; no shadow maps (MEMORY 249). Rendering itself
 * is verified in headless Chrome (see the virtual-labs skill), not here.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { readFileSync, readdirSync, statSync } from "node:fs";

register("./lib/ts-resolve.mjs", import.meta.url);

const C = await import("../src/lib/virtual-labs/experiments/pharmaceutics/contract.ts");
const SX = await import("../src/lib/virtual-labs/experiments/syrup.ts");

const ROOT = new URL("..", import.meta.url).pathname;
const VL = ROOT + "src/components/virtual-labs/";
const read = (p: string) => readFileSync(p, "utf8");
const ROOM = read(VL + "babylon/pharmaceutics.ts");
const ROOM_FILES = readdirSync(VL + "babylon").filter((n) => n.startsWith("pharmaceutics")).map((n) => VL + "babylon/" + n);

/** The source of one top-level function, up to the next top-level declaration. */
function body(src: string, name: string) {
  const start = src.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `function ${name} not found in babylon/pharmaceutics.ts`);
  const rest = src.slice(start + 1);
  const next = rest.search(/\n(?:export )?(?:function|class|const|interface|type) /);
  return src.slice(start, next < 0 ? undefined : start + 1 + next);
}
const regIds = (src: string) => new Set([...src.matchAll(/\breg\(\s*["']([^"']+)["']/g)].map((m) => m[1]));

const BUILDERS: Record<string, string> = {
  "solution-preparation": "buildSolutionPrep",
  "liquid-properties": "buildLiquidProperties",
  "solubility-dissolution": "buildSolubilityDissolution",
};

test("pharmaceutics room: every contract FIXTURE is registered, by the shared fixture registration", () => {
  const fx = regIds(body(ROOM, "registerFixtures"));
  for (const id of C.FIXTURES) assert.ok(fx.has(id), `fixture "${id}" is not registered in registerFixtures()`);
});

test("pharmaceutics room: each shortlisted experiment registers its fixed and stored equipment and the fixtures", () => {
  assert.deepEqual(Object.keys(BUILDERS).sort(), [...C.PHARMACEUTICS_EXPERIMENTS].sort());
  for (const exp of C.PHARMACEUTICS_EXPERIMENTS) {
    const src = body(ROOM, BUILDERS[exp]);
    const ids = regIds(src);
    const plan = C.EQUIPMENT_PLAN[exp];
    for (const id of plan.fixed) assert.ok(ids.has(id), `${exp}: fixed item "${id}" is not registered`);
    for (const id of Object.keys(plan.stored)) {
      assert.ok(ids.has(id), `${exp}: stored item "${id}" is not registered`);
      // a stored item must be put in the cabinet the contract names
      const add = new RegExp(`store\\.add\\(\\s*["']${id}["'][^;]*["']${plan.stored[id]}["']`);
      assert.match(src, add, `${exp}: "${id}" is not stored in ${plan.stored[id]}`);
    }
    assert.match(src, /registerFixtures\(/, `${exp}: does not register the shared fixtures`);
    // exactly one registration per id (one node per id — MEMORY 225)
    const all = [...src.matchAll(/\breg\(\s*["']([^"']+)["']/g)].map((m) => m[1]);
    assert.equal(all.length, new Set(all).size, `${exp}: an id is registered twice`);
    for (const id of ids) assert.ok(plan.fixed.includes(id) || id in plan.stored, `${exp}: "${id}" is registered but not in the contract's plan`);
  }
});

test("pharmaceutics room: Simple Syrup keeps every equipment id the three.js room made selectable", () => {
  const threeIds = new Set([...read(VL + "three/rooms/pharmaceutics.ts").matchAll(/\br\.interactive\(\s*["']([^"']+)["']/g)].map((m) => m[1]));
  const syrup = regIds(body(ROOM, "buildSyrup"));
  assert.ok(threeIds.size >= 10, `parsed only ${threeIds.size} three.js ids`);
  for (const id of threeIds) assert.ok(syrup.has(id), `syrup: "${id}" is selectable in the three.js room but not in the Babylon room`);
  for (const e of SX.SYRUP.equipment) assert.ok(syrup.has(e.id), `syrup: equipment "${e.id}" is not registered`);
  for (const c of SX.SYRUP.controllers) assert.ok(c.equipment.some((e: string) => syrup.has(e)), `syrup controller ${c.id} has no selectable equipment`);
  // unknown or empty experiment → the syrup room
  assert.match(ROOM, /:\s*"simple-syrup";/);
});

test("pharmaceutics room: SyrupVisualLike matches what syrupVisual() returns", () => {
  const v = SX.syrupVisual(SX.SYRUP.initial(7));
  const iface = ROOM.match(/export interface SyrupVisualLike \{([\s\S]*?)\n\}/);
  assert.ok(iface, "SyrupVisualLike not found");
  const fields = [...iface[1].matchAll(/^\s*([a-zA-Z]+)\??:/gm)].map((m) => m[1]);
  assert.ok(fields.length >= 14);
  for (const f of fields) assert.ok(f in v, `SyrupVisualLike.${f} is not produced by syrupVisual()`);
});

test("pharmaceutics room: no shadow maps, no point lights (MEMORY 249, low-end budget)", () => {
  for (const f of ROOM_FILES) {
    const src = read(f);
    assert.ok(!/ShadowGenerator|shadowGenerator/.test(src), `${f.slice(ROOT.length)} uses a shadow generator`);
    assert.ok(!/PointLight|SpotLight/.test(src), `${f.slice(ROOT.length)} adds a point/spot light`);
  }
  assert.match(ROOM, /casters:\s*\[\]/);
});

test("pharmaceutics room: Babylon stays inside babylon/ and the room loads lazily", () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = dir + (dir.endsWith("/") ? "" : "/") + n;
      return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx|mts|js|jsx)$/.test(n) ? [p] : [];
    });
  const re = /^\s*(import|export)\s+(type\s+)?(?:[^;'"]*?\s+from\s+)?["']([^"']+)["']/gms;
  for (const f of walk(ROOT + "src")) {
    if (f.startsWith(VL + "babylon/")) continue;
    for (const m of read(f).matchAll(re)) {
      assert.ok(!m[3].startsWith("@babylonjs/"), `${f.slice(ROOT.length)}: ${m[0].trim()}`);
      if (/(^|\/)babylon\//.test(m[3])) assert.ok(!!m[2], `${f.slice(ROOT.length)}: static import of the babylon folder`);
    }
  }
  // the room's own files: Babylon modules only, three.js only as types
  for (const f of ROOM_FILES)
    for (const m of read(f).matchAll(re)) {
      if (/three/.test(m[3])) assert.ok(m[2] && m[3] === "../three/types", `${f.slice(ROOT.length)}: ${m[0].trim()}`);
    }
  const vp = read(VL + "Viewport.tsx");
  assert.match(vp, /pharmaceutics:\s*\(\)\s*=>\s*import\(\s*["']\.\/babylon\/pharmaceutics["']\s*\)/, "pharmaceutics is not a lazily loaded Babylon room");
  assert.match(vp, /pharmaceutics:\s*\(\)\s*=>\s*import\(\s*["']\.\/three\/rooms\/pharmaceutics["']\s*\)/, "the three.js rollback room is gone");
});

test("pharmaceutics room: the five waste containers and the sink stream follow the contract", () => {
  const fx = read(VL + "babylon/pharmaceuticsFixtures.ts");
  for (const t of ["AQUEOUS", "ORGANIC", "CHEMICAL SOLID", "SOLID", "GLASS & SHARPS"]) assert.ok(fx.includes(`"${t}"`), `waste header ${t} missing`);
  assert.match(fx, /"chemical-solid"/);
  // the stream is shown only while the tap is on
  assert.match(fx, /stream\.setEnabled\(on\)/);
});
