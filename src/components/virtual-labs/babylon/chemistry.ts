/**
 * Room 1 — Pharmaceutical Chemistry (analytical) laboratory, 9 × 8 m, in Babylon.js
 * (2026-10-22). Same layout, equipment ids, colliders and spawn as the three.js room it
 * replaces (../three/rooms/chemistry.ts, kept for `?engine=three` and for rollback):
 * central island = titration station; west wall = balance table; north wall = perimeter
 * bench with sink and a fume cupboard; east = glassware cupboard and reagent storage.
 *
 * What the room animates is only what the experiment state says happened: a single drop
 * falling from the jet and rippling the flask when the reading rises by a drop's worth, a
 * stream while the stopcock is held open, and the flask easing to the colour the engine
 * computes (titrationVisual) — never a colour change the engine has not counted.
 */
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { coatHook, dyn, extinguisher, eyewash, firstAid, footprint, fumeHood, glassCabinet, island, roomShell, stool, wallUnits, wasteBin, bench, type Kit } from "./kit";
import { analyticalBalance, beaker, bulbPipette, burette, conicalFlask, dropperBottle, glassFunnel, glassRod, hdpeBottle, labNotebook, retortStand, sampleJar, spatula, volumetricFlask, washBottle, whiteTile } from "./apparatus";
import type { BBuildContext, BInteractive, BRoomBuild } from "./types";
import type { Collider, Pose } from "../three/types";

/** Bench-top height used by every room. */
const TOP = 0.91;

/** Mirrors titrationVisual() — see the experiment. Rename a field there, rename it here. */
export interface TitrationVisualLike {
  buretteLevel: number | null;
  bubble: boolean;
  funnelIn: boolean;
  flaskVolume: number;
  flaskColour: [number, number, number, number];
  volFlaskVolume: number;
  boatOn: boolean;
  sampleOnBoat: number;
  balance: { value: number; stable: boolean };
  doorsClosed: boolean;
  tile: boolean;
  flowing?: boolean;
}

/** Close-up framed from the node's own bounding box, as the three.js RoomBuilder does. */
function interactive(list: BInteractive[], id: string, label: string, node: TransformNode, o: { dir?: [number, number]; dist?: number; lift?: number; target?: [number, number, number] } = {}) {
  node.computeWorldMatrix(true);
  for (const c of node.getChildMeshes()) c.computeWorldMatrix(true);
  const { min, max } = node.getHierarchyBoundingVectors(true, (m) => m.isEnabled());
  const c = o.target ? new Vector3(...o.target) : min.add(max).scale(0.5);
  const size = max.subtract(min);
  const span = Math.max(size.x, size.y, size.z);
  const dist = o.dist ?? Math.max(0.35, span * 1.6);
  const [dx, dz] = o.dir ?? [0, 1];
  const len = Math.hypot(dx, dz) || 1;
  const focus: Pose = {
    pos: [c.x + (dx / len) * dist, c.y + (o.lift ?? Math.max(0.08, span * 0.35)), c.z + (dz / len) * dist],
    target: [c.x, c.y, c.z],
  };
  list.push({ id, label, node, focus });
}

/** Glassware on the cupboard shelves: what "choose the apparatus" chooses from. */
function stockShelves(k: Kit, shelf: TransformNode, y: number, i: number) {
  const row = k.node(shelf, 0, y, 0);
  const at = (n: TransformNode, x: number, z = -0.04) => n.position.set(x, 0, z);
  if (i === 0) {
    at(beaker(k, row).node, -0.32);
    at(beaker(k, row).node, -0.22, 0.06);
    at(conicalFlask(k, row).node, -0.06);
    at(conicalFlask(k, row).node, 0.06, 0.05);
  } else if (i === 1) {
    at(volumetricFlask(k, row).node, -0.3);
    at(volumetricFlask(k, row).node, -0.18, 0.04);
    // measuring cylinders: hexagonal foot, graduated tube, pouring lip
    for (const x of [0.02, 0.12, 0.22]) {
      const c = k.node(row, x, 0, -0.03);
      k.cyl(0.03, 0.032, 0.012, k.m.glass, c, 0, 0.006, 0, 6);
      k.cyl(0.0145, 0.0145, 0.25, k.m.glass, c, 0, 0.137, 0, 24, { cap: false });
      k.torus(0.0155, 0.0015, k.m.glass, c, 0, 0.262, 0, 20);
    }
  } else if (i === 2) {
    // burettes lying on the shelf, and a spare stand rod
    for (const z of [-0.08, 0.0]) {
      const b = k.cyl(0.0068, 0.0068, 0.82, k.m.glass, row, 0, 0.012, z, 20, { cap: false });
      b.rotation.z = Math.PI / 2;
    }
    for (const x of [-0.25, -0.1, 0.05]) at(glassFunnel(k, row), x, 0.09);
  } else {
    for (const x of [-0.3, -0.15, 0.0, 0.15, 0.3]) {
      const p = k.node(row, x, 0, -0.02);
      k.lathe([[0, 0], [0.025, 0], [0.026, 0.004], [0.026, 0.06], [0.014, 0.075], [0.009, 0.08]], k.m.amber, p, 24);
      k.cyl(0.0105, 0.0105, 0.014, k.m.plasticDark, p, 0, 0.087, 0, 12);
    }
  }
}

export function buildChemistry({ kit: k }: BBuildContext): BRoomBuild {
  const { m } = k;
  const root = k.node(null);
  const colliders: Collider[] = [];
  const list: BInteractive[] = [];
  const furniture = (n: TransformNode, x: number, z: number, w: number, d: number, ry = 0) => {
    n.parent = root;
    n.position.set(x, 0, z);
    n.rotation.y = ry;
    colliders.push(footprint(x, z, w, d, ry, 0.05));
    return n;
  };
  const place = (n: TransformNode, x: number, y: number, z: number, ry = 0) => {
    n.parent = root;
    n.position.set(x, y, z);
    n.rotation.y = ry;
    return n;
  };

  const shell = roomShell(k, root, { w: 9, d: 8, windowsOn: "west" });

  // ── furniture ──
  furniture(island(k, root, 3.4, "epoxy", 3), 0, -0.9, 3.4, 1.5);
  furniture(bench(k, root, { w: 6, top: "epoxy", backsplash: true, sink: true }), -0.6, -3.6, 6, 0.75);
  place(wallUnits(k, root, 5.2), -1.0, 0, -3.82);
  furniture(fumeHood(k, root, 1.5), 3.6, -3.55, 1.5, 0.85);
  furniture(bench(k, root, { w: 1.6, top: "white" }), -3.9, -1.1, 1.6, 0.75, Math.PI / 2); // balance table
  // the glassware cupboard is where the apparatus is chosen (2026-10-21)
  const cupboard = furniture(glassCabinet(k, root, 1.0, (s, y, i) => stockShelves(k, s, y, i)), 4.2, 0.2, 1.0, 0.45, -Math.PI / 2);
  furniture(
    glassCabinet(k, root, 1.0, (s, y) => k.bottleRow(k.node(s, 0, y - 0.01, 0), 6, 0.8, 0.25, [0], 11 + Math.round(y * 10))),
    4.2, 1.3, 1.0, 0.45, -Math.PI / 2,
  );
  for (const x of [-1.5, 1.5]) furniture(stool(k, root), x, 0.25, 0.36, 0.36);
  furniture(eyewash(k, root), 2.6, -3.85, 0.3, 0.3);
  furniture(extinguisher(k, root), -2.6, 3.85, 0.25, 0.25, Math.PI);
  place(firstAid(k, root), -1.8, 1.6, 3.92, Math.PI);
  place(coatHook(k, root), -3.4, 0, 3.92, Math.PI);
  furniture(wasteBin(k, root, m.yellow), 2.0, -3.0, 0.34, 0.34);
  furniture(wasteBin(k, root, m.accentBlue), 1.6, -3.0, 0.34, 0.34);

  k.sign("goggles", "Eye protection must be worn", root, -1.2, 1.7, 3.97, Math.PI);
  k.sign("coat", "Wear a lab coat", root, -0.7, 1.7, 3.97, Math.PI);
  k.sign("no-food", "No eating or drinking", root, 0.8, 1.7, -3.97, 0);
  k.sign("eyewash", "Eye wash station", root, 2.6, 1.65, -3.97, 0);
  k.sign("extinguisher", "Fire extinguisher", root, -2.6, 1.5, 3.97, Math.PI);
  k.poster("Acid–base indicators", ["Phenolphthalein: colourless 8.2 → pink 10.0", "Methyl orange: red 3.1 → yellow 4.4", "Bromothymol blue: yellow 6.0 → blue 7.6", "Weak acid + strong base: alkaline end-point"], root, 4.45, 1.6, -1.6, -Math.PI / 2);
  k.poster("Reading a burette", ["Eye level with the meniscus", "Read the bottom of the curve", "Two decimal places: 23.45 mL", "Remove the funnel before reading"], root, 4.45, 1.6, -2.5, -Math.PI / 2, "#21B67A");

  // ── titration station (front of the island, facing +z) ──
  const z0 = -0.9 + 0.5;
  // the rod stands behind the flask; the clamp arm reaches forward to the burette
  const STAND_Z = z0 - 0.135;
  const ROD_Z = STAND_Z - 0.06;
  const BUR_Z = z0 + 0.035;
  const stand = place(retortStand(k, root, BUR_Z - ROD_Z), 0, TOP, STAND_Z);
  // the jet sits 15 mm inside the neck of the flask on its tile, as it should
  const BUR_Y = TOP + 0.138;
  const bur = burette(k, root, k.q);
  place(bur.node, 0, BUR_Y, BUR_Z);
  const TILE_AWAY: [number, number] = [-0.22, z0 + 0.16];
  const tile = place(whiteTile(k, root), TILE_AWAY[0], TOP, TILE_AWAY[1]);
  const flask = conicalFlask(k, root);
  place(flask.node, 0, TOP, z0 + 0.03);
  const vol = volumetricFlask(k, root);
  place(vol.node, -0.5, TOP, z0);
  const pip = place(bulbPipette(k, root), -0.75, TOP, z0 + 0.12);
  const indicators = place(k.node(root), 0.38, TOP, z0 - 0.05);
  dropperBottle(k, indicators, "Phenolphthalein", ["pH 8.2–10.0"]);
  dropperBottle(k, indicators, "Methyl orange", ["pH 3.1–4.4"]).position.x = 0.06;
  dropperBottle(k, indicators, "Bromothymol blue", ["pH 6.0–7.6"]).position.x = 0.12;
  const sample = place(sampleJar(k, root, "Citric acid monohydrate", ["Sample CA-01 · for assay", "C₆H₈O₇·H₂O  Mr 210.14"]), 0.72, TOP, z0 - 0.08);
  const titrant = place(hdpeBottle(k, root, "Sodium hydroxide 0.1 M", ["Standardised: 0.1012 M", "Volumetric solution"]), 0.95, TOP, z0 - 0.08);
  const wash = place(washBottle(k, root), 0.42, TOP, z0 + 0.12);
  place(glassFunnel(k, root), -0.3, TOP, z0 - 0.1);
  const b1 = beaker(k, root);
  place(b1.node, -1.25, TOP, z0 - 0.05);
  b1.setVolume(60);
  b1.setColour([0.86, 0.94, 1], 0.3);
  b1.snapColour();
  const rod = glassRod(k, b1.node, 0.22);
  rod.position.set(0.012, 0.1, 0);
  rod.rotation.z = -0.22;
  const notebook = place(labNotebook(k, root, "Assay of citric acid"), 1.35, TOP, z0 + 0.05, -0.2);

  // ── balance table ──
  const bal = analyticalBalance(k, root);
  place(bal.node, -3.85, TOP, -1.1, Math.PI / 2);
  place(spatula(k, root), -3.72, TOP, -0.78, 0.5);

  // ── interactives (ids match the experiment's equipment ids) ──
  interactive(list, "stand", "Retort stand and clamp", stand, { dir: [0.5, 1], dist: 0.9 });
  // frames the stopcock, the jet and the flask beneath it — what the student watches while
  // titrating (the reading itself is taken in the burette's 2D panel)
  interactive(list, "burette", "Burette, 50 mL", bur.node, { dir: [0.18, 1], dist: 0.62, lift: 0.1, target: [0, TOP + 0.24, BUR_Z] });
  interactive(list, "tile", "White tile", tile, { dist: 0.45 });
  interactive(list, "conical-flask", "Conical flask, 250 mL", flask.node, { dist: 0.38, lift: 0.12 });
  interactive(list, "vol-flask", "Volumetric flask, 100 mL", vol.node, { dist: 0.5 });
  interactive(list, "pipette", "Bulb pipette, 20 mL", pip, { dist: 0.5, lift: 0.2 });
  interactive(list, "indicator", "Indicator bottles", indicators, { dist: 0.35, lift: 0.1 });
  interactive(list, "sample", "Sample CA-01 — citric acid monohydrate", sample, { dist: 0.35, lift: 0.06 });
  interactive(list, "titrant", "Sodium hydroxide 0.1 M", titrant, { dist: 0.35, lift: 0.06 });
  interactive(list, "balance", "Analytical balance", bal.node, { dir: [1, 0], dist: 0.55, lift: 0.22 });
  interactive(list, "wash-bottle", "Wash bottle", wash, { dist: 0.35 });
  interactive(list, "cupboard", "Glassware cupboard", cupboard, { dir: [-1, 0], dist: 1.6, lift: -0.1, target: [4.2, 1.15, 0.2] });
  interactive(list, "notebook", "Lab notebook", notebook, { dist: 0.45, lift: 0.3 });

  // ── animation parts ──
  // the titrant is colourless whatever colour the flask has turned
  const drop = dyn(k.sphere(0.0022, m.water, root, 0, 0, 0, 10));
  drop.scaling.y = 1.25;
  drop.setEnabled(false);
  const ripple = dyn(k.torus(0.01, 0.0008, m.glass, root, 0, 0, 0, 28));
  ripple.setEnabled(false);
  const stream = dyn(k.cyl(0.0009, 0.0009, 1, m.water, root, 0, 0, 0, 8, { cap: false }));
  stream.setEnabled(false);
  const tipWorld = () => bur.node.getAbsolutePosition().add(bur.tipLocal);
  const surfaceWorld = () => flask.node.getAbsolutePosition().y + flask.surfaceY();

  let lastLevel: number | null = null;
  let first = true;
  let dropT = -1;
  let rippleT = -1;
  let colourMoving = false;

  return {
    root,
    interactives: list,
    colliders,
    bounds: shell.bounds,
    spawn: { pos: [0.3, 1.62, 1.3], target: [0, 0.98, -0.5] },
    casters: [stand, bur.node, flask.node, vol.node, pip, indicators, sample, titrant, wash, b1.node, notebook, bal.node, tile],
    apply(raw) {
      const v = raw as TitrationVisualLike;
      bur.set(v.buretteLevel, { bubble: v.bubble, funnel: v.funnelIn, flowing: !!v.flowing });
      flask.node.position.y = TOP + (v.tile ? 0.008 : 0);
      tile.position.set(v.tile ? 0 : TILE_AWAY[0], TOP, v.tile ? z0 + 0.03 : TILE_AWAY[1]);
      flask.setVolume(v.flaskVolume);
      vol.setVolume(v.volFlaskVolume);
      bal.set({ boatOn: v.boatOn, sampleG: v.sampleOnBoat, display: `${v.balance.value.toFixed(4)} g`, stable: v.balance.stable, doorsClosed: v.doorsClosed });
      colourMoving = flask.setColour([v.flaskColour[0], v.flaskColour[1], v.flaskColour[2]], v.flaskColour[3]);
      if (first) {
        flask.snapColour();
        colourMoving = false;
      }
      // a single drop: the reading rose by less than a fifth of a millilitre with the tap shut
      const rose = v.buretteLevel !== null && lastLevel !== null ? v.buretteLevel - lastLevel : 0;
      if (!first && !v.flowing && rose > 0 && rose < 0.2 && v.flaskVolume > 0) dropT = 0;
      lastLevel = v.buretteLevel;
      first = false;
      // a stream from the jet to the surface while the stopcock is held open
      const flowing = !!v.flowing && v.buretteLevel !== null;
      stream.setEnabled(flowing);
      if (flowing) {
        const top = tipWorld().y;
        const bottom = surfaceWorld();
        stream.scaling.y = Math.max(0.001, top - bottom);
        stream.position.set(0, (top + bottom) / 2, BUR_Z);
      }
      return dropT >= 0 || colourMoving;
    },
    tick(_t, dt) {
      let busy = false;
      if (dropT >= 0) {
        const tip = tipWorld();
        const fall = Math.max(0.01, tip.y - surfaceWorld());
        const dur = Math.sqrt((2 * fall) / 9.81) + 0.06; // a short hang at the jet, then free fall
        dropT += dt;
        const ft = Math.max(0, dropT - 0.06);
        drop.setEnabled(true);
        drop.position.set(tip.x, tip.y - 0.0022 - 0.5 * 9.81 * ft * ft, tip.z);
        if (dropT >= dur) {
          dropT = -1;
          drop.setEnabled(false);
          rippleT = 0;
        } else busy = true;
      }
      if (rippleT >= 0) {
        rippleT += dt;
        const f = rippleT / 0.35;
        ripple.setEnabled(f < 1);
        ripple.position.set(0, surfaceWorld() + 0.0005, BUR_Z - 0.005);
        ripple.scaling.set(0.4 + f * 1.6, 1, 0.4 + f * 1.6);
        if (f >= 1) rippleT = -1;
        else busy = true;
      }
      if (colourMoving) colourMoving = flask.stepColour(dt);
      return busy || colourMoving;
    },
    dispose() {
      flask.dispose();
      vol.dispose();
      b1.dispose();
    },
  };
}

