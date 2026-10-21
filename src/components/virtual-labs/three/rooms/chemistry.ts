/**
 * Room 1 — Pharmaceutical Chemistry (analytical) laboratory, 9 × 8 m.
 * Central island = titration station; west wall = balance table; north wall =
 * perimeter bench with sink and a fume cupboard; east = reagent storage.
 */
import * as THREE from "three";
import type { MaterialLib } from "../materials";
import type { BuildContext, RoomBuild } from "../types";
import { coatHook, extinguisher, eyewashStation, firstAid, fumeHood, mesh, rbox, roomShell, storageCabinet, wallUnits, wasteBin } from "../kit";
import { beaker, bulbPipette, burette, conicalFlask, dropperBottle, glassFunnel, reagentBottle, volumetricFlask, washBottle } from "../glass";
import { analyticalBalance, labNotebook, retortStand, whiteTile } from "../instruments";
import { RoomBuilder, TOP } from "./helpers";

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

export function buildChemistry(m: MaterialLib, _ctx: BuildContext): RoomBuild {
  const r = new RoomBuilder(m);
  const shell = roomShell(m, { w: 9, d: 8, windowsOn: "west", accent: "blue" });
  r.root.add(shell.group);

  // ── furniture ──
  r.island(3.4, 0, -0.9, "epoxy", 3);
  r.bench({ w: 6, top: "epoxy", backsplash: true, sink: true, seed: 5 }, -0.6, -3.6);
  r.place(wallUnits(m, 5.2), -1.0, 0, -3.82);
  r.furniture(fumeHood(m, 1.5), 3.6, -3.55, 1.5, 0.85);
  r.bench({ w: 1.6, top: "white" }, -3.9, -1.1, Math.PI / 2); // balance table
  // the glassware cupboard is where the apparatus is chosen (2026-10-21)
  const cupboard = r.furniture(storageCabinet(m, 1.0, 9), 4.2, 0.2, 1.0, 0.45, -Math.PI / 2);
  r.furniture(storageCabinet(m, 1.0, 11), 4.2, 1.3, 1.0, 0.45, -Math.PI / 2);
  r.stools([-1.5, 1.5], 0.25);
  r.furniture(eyewashStation(m), 2.6, -3.85, 0.3, 0.3);
  r.furniture(extinguisher(m), -2.6, 3.85, 0.25, 0.25, Math.PI);
  r.place(firstAid(m), -1.8, 1.6, 3.92, Math.PI);
  r.place(coatHook(m), -3.4, 0, 3.92, Math.PI);
  r.furniture(wasteBin(m, m.yellow), 2.0, -3.0, 0.34, 0.34);
  r.furniture(wasteBin(m, m.accentBlue), 1.6, -3.0, 0.34, 0.34);

  r.sign("goggles", "Eye protection must be worn", -1.2, 1.7, 3.97, Math.PI);
  r.sign("coat", "Wear a lab coat", -0.7, 1.7, 3.97, Math.PI);
  r.sign("no-food", "No eating or drinking", 0.8, 1.7, -3.97, 0);
  r.sign("eyewash", "Eye wash station", 2.6, 1.65, -3.97, 0);
  r.poster("Acid–base indicators", ["Phenolphthalein: colourless 8.2 → pink 10.0", "Methyl orange: red 3.1 → yellow 4.4", "Bromothymol blue: yellow 6.0 → blue 7.6", "Weak acid + strong base: alkaline end-point"], 4.45, 1.6, -1.6, -Math.PI / 2);
  r.poster("Reading a burette", ["Eye level with the meniscus", "Read the bottom of the curve", "Two decimal places: 23.45 mL", "Remove the funnel before reading"], 4.45, 1.6, -2.5, -Math.PI / 2, "#21B67A");

  // ── titration station (front of the island, facing +z) ──
  const z0 = -0.9 + 0.5;
  const stand = r.place(retortStand(m), 0, TOP, z0 - 0.05);
  const bur = burette(m);
  r.place(bur.group, 0, TOP + 0.235, z0 + 0.035);
  // the tile waits beside the stand until the student slides it under the flask
  const TILE_AWAY: [number, number] = [-0.22, z0 + 0.16];
  const tile = r.place(whiteTile(m), TILE_AWAY[0], TOP, TILE_AWAY[1]);
  const flask = conicalFlask(m);
  r.place(flask.group, 0, TOP + 0.008, z0 + 0.03);
  const vol = volumetricFlask(m);
  r.place(vol.group, -0.5, TOP, z0);
  const pip = bulbPipette(m);
  r.place(pip, -0.95, TOP + 0.025, z0 + 0.12);
  pip.rotation.z = Math.PI / 2; // lying on its rack
  const indicators = new THREE.Group();
  indicators.add(dropperBottle(m, "Phenolphthalein", ["pH 8.2–10.0"]));
  const mo = dropperBottle(m, "Methyl orange", ["pH 3.1–4.4"]);
  mo.position.x = 0.06;
  const btb = dropperBottle(m, "Bromothymol blue", ["pH 6.0–7.6"]);
  btb.position.x = 0.12;
  indicators.add(mo, btb);
  r.place(indicators, 0.38, TOP, z0 - 0.05);
  const sample = reagentBottle(m, "Citric acid monohydrate", ["Sample CA-01 · for assay", "C₆H₈O₇·H₂O  Mr 210.14"], { hazard: "irritant" });
  r.place(sample, 0.72, TOP, z0 - 0.08);
  const titrant = reagentBottle(m, "Sodium hydroxide 0.1 M", ["Standardised: 0.1012 M", "Volumetric solution"], { hazard: "corrosive", accent: "#C8202A" });
  r.place(titrant, 0.95, TOP, z0 - 0.08);
  const wash = r.place(washBottle(m), 0.42, TOP, z0 + 0.12);
  r.place(glassFunnel(m), -0.25, TOP, z0 + 0.1);
  const b1 = beaker(m, 250);
  r.place(b1.group, -1.25, TOP, z0 - 0.05);
  b1.setVolume(60);
  const notebook = r.place(labNotebook(m, "Assay of citric acid"), 1.35, TOP, z0 + 0.05, -0.2);
  // pipette rack (simple)
  r.place(mesh(rbox(0.24, 0.02, 0.06, 0.006), m.plasticGrey, 0, 0, 0), -0.95, TOP + 0.01, z0 + 0.12);

  // ── balance table ──
  const bal = analyticalBalance(m);
  r.place(bal.group, -3.85, TOP, -1.1, Math.PI / 2);

  // ── interactives (ids match the experiment's equipment ids) ──
  r.interactive("stand", "Retort stand and clamp", stand, { dir: [0.5, 1], dist: 0.9 });
  // frames the burette's lower half and the flask beneath it — the titration itself
  r.interactive("burette", "Burette, 50 mL", bur.group, { dir: [0.18, 1], dist: 0.85, lift: 0.12, target: [0, TOP + 0.42, z0 + 0.035] });
  r.interactive("tile", "White tile", tile, { dist: 0.45 });
  r.interactive("conical-flask", "Conical flask, 250 mL", flask.group, { dist: 0.38, lift: 0.12 });
  r.interactive("vol-flask", "Volumetric flask, 100 mL", vol.group, { dist: 0.5 });
  r.interactive("pipette", "Bulb pipette, 20 mL", pip, { dist: 0.5, lift: 0.2 });
  r.interactive("indicator", "Indicator bottles", indicators, { dist: 0.35, lift: 0.1 });
  r.interactive("sample", "Sample CA-01 — citric acid monohydrate", sample, { dist: 0.35, lift: 0.06 });
  r.interactive("titrant", "Sodium hydroxide 0.1 M", titrant, { dist: 0.35, lift: 0.06 });
  r.interactive("balance", "Analytical balance", bal.group, { dir: [1, 0], dist: 0.55, lift: 0.22 });
  r.interactive("wash-bottle", "Wash bottle", wash, { dist: 0.35 });
  r.interactive("cupboard", "Glassware cupboard", cupboard, { dir: [-1, 0], dist: 1.6, lift: -0.1, target: [4.2, 1.15, 0.2] });
  r.interactive("notebook", "Lab notebook", notebook, { dist: 0.45, lift: 0.3 });

  return {
    root: r.root,
    interactives: r.interactives,
    colliders: r.colliders,
    bounds: shell.bounds,
    spawn: { pos: [0.3, 1.62, 1.3], target: [0, 0.98, -0.5] },
    apply(raw) {
      const v = raw as TitrationVisualLike;
      bur.set(v.buretteLevel, { bubble: v.bubble, funnel: v.funnelIn, flowing: !!v.flowing });
      flask.setVolume(v.flaskVolume);
      flask.setColour([v.flaskColour[0], v.flaskColour[1], v.flaskColour[2]], v.flaskColour[3]);
      vol.setVolume(v.volFlaskVolume);
      bal.set({ boatOn: v.boatOn, sampleG: v.sampleOnBoat, display: `${v.balance.value.toFixed(4)} g`, stable: v.balance.stable, doorsClosed: v.doorsClosed });
      tile.position.set(v.tile ? 0 : TILE_AWAY[0], TOP, v.tile ? z0 + 0.03 : TILE_AWAY[1]);
      return false;
    },
    dispose() {
      flask.dispose();
      vol.dispose();
      b1.dispose();
    },
  };
}
