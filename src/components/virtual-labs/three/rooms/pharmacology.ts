/**
 * Room 3 — Pharmacology teaching laboratory, 9 × 7.5 m.
 * Central island = the isolated-tissue (organ bath) station with its recorder;
 * perimeter = sink bench, data desk, drug refrigerator and storage.
 */
import * as THREE from "three";
import type { MaterialLib } from "../materials";
import type { BuildContext, RoomBuild } from "../types";
import { box, coatHook, cyl, extinguisher, eyewashStation, firstAid, mesh, rbox, roomShell, storageCabinet, wallUnits, wasteBin } from "../kit";
import { dropperBottle, reagentBottle } from "../glass";
import { micropipette, organBathRig, recorder } from "../instruments";
import { RoomBuilder, TOP } from "./helpers";

export interface DoseVisualLike {
  bathFilled: boolean;
  tempC: number;
  aeration: boolean;
  thermostat: boolean;
  tissue: boolean;
  tension: boolean;
  trace: number[];
  pending: boolean;
  washed: boolean;
}

export function buildPharmacology(m: MaterialLib, _ctx: BuildContext): RoomBuild {
  const r = new RoomBuilder(m);
  const shell = roomShell(m, { w: 9, d: 7.5, windowsOn: "east", accent: "blue" });
  r.root.add(shell.group);

  r.island(3.6, -0.2, -0.7, "epoxy", 41);
  r.bench({ w: 5.2, top: "epoxy", backsplash: true, sink: true, seed: 43 }, -0.9, -3.35);
  r.place(wallUnits(m, 4.6), -1.2, 0, -3.57);
  r.furniture(storageCabinet(m, 1.0, 45), -4.2, -1.0, 1.0, 0.45, Math.PI / 2);
  r.furniture(storageCabinet(m, 1.0, 47), -4.2, 0.1, 1.0, 0.45, Math.PI / 2);
  // data desk with a PC
  const desk = new THREE.Group();
  desk.add(mesh(rbox(1.4, 0.03, 0.7, 0.005), m.resinWhiteTop, 0, 0.74, 0));
  for (const x of [-0.65, 0.65]) desk.add(mesh(box(0.04, 0.73, 0.64), m.brushed, x, 0.365, 0));
  desk.add(mesh(rbox(0.55, 0.34, 0.03, 0.008), m.plasticDark, 0, 1.0, -0.2));
  desk.add(mesh(box(0.5, 0.29, 0.002), m.screen, 0, 1.0, -0.184, false));
  desk.add(mesh(rbox(0.42, 0.015, 0.14, 0.004), m.plasticGrey, 0, 0.76, 0.05));
  r.furniture(desk, -3.6, 2.4, 1.4, 0.7, Math.PI / 2);
  r.furniture(eyewashStation(m), 2.2, -3.6, 0.3, 0.3);
  r.furniture(extinguisher(m), -2.6, 3.6, 0.25, 0.25, Math.PI);
  r.place(firstAid(m), -1.6, 1.6, 3.67, Math.PI);
  r.place(coatHook(m), -0.6, 0, 3.67, Math.PI);
  r.furniture(wasteBin(m, m.yellow), 2.8, -3.0, 0.34, 0.34);
  r.stools([-1.0, 0.6], 0.45);

  r.sign("gloves", "Wear gloves", 1.2, 1.7, 3.72, Math.PI);
  r.sign("goggles", "Eye protection must be worn", 1.7, 1.7, 3.72, Math.PI);
  r.sign("no-food", "No eating or drinking", 1.0, 1.7, -3.72, 0);
  r.poster("Graded dose–response", ["Response rises with concentration to Emax", "EC50: half-maximal concentration (potency)", "Emax: maximum effect (efficacy)", "Log axis → sigmoid curve"], 4.45, 1.6, -1.2, -Math.PI / 2);
  r.poster("The 3Rs", ["Replace — use simulations and non-animal methods", "Reduce — fewest animals for a valid result", "Refine — minimise suffering", "Real tissue work needs ethical approval"], 4.45, 1.6, -0.2, -Math.PI / 2, "#21B67A");

  // ── organ bath station ──
  const z0 = -0.7 + 0.45;
  const rig = organBathRig(m);
  r.place(rig.group, -0.75, TOP, z0 - 0.02);
  const rec = recorder(m);
  r.place(rec.group, 0.55, TOP, z0 - 0.05, -0.15);
  const rack = new THREE.Group();
  rack.add(mesh(rbox(0.3, 0.03, 0.09, 0.006), m.plasticWhite, 0, 0.015, 0));
  ["10⁻⁶ M", "10⁻⁵ M", "10⁻⁴ M", "10⁻³ M"].forEach((lab, i) => {
    const b = dropperBottle(m, "Agonist stock", [lab, "SIMULATED"]);
    b.position.set(-0.105 + i * 0.07, 0.03, 0);
    b.scale.setScalar(0.85);
    rack.add(b);
  });
  r.place(rack, -1.45, TOP, z0 + 0.02);
  const pip = micropipette(m);
  r.place(pip, -1.15, TOP + 0.02, z0 + 0.14);
  pip.rotation.z = Math.PI / 2 - 0.15;
  const pss = reagentBottle(m, "Physiological salt solution", ["Tyrode-type · 37 °C", "Aerated"], { scale: 1.6 });
  const pssStand = new THREE.Group();
  pssStand.add(mesh(cyl(0.006, 0.006, 0.35, 12), m.chrome, 0, 0.175, 0));
  pssStand.add(mesh(rbox(0.16, 0.012, 0.16, 0.004), m.darkMetal, 0, 0.006, 0));
  pssStand.add(mesh(rbox(0.16, 0.01, 0.16, 0.004), m.brushed, 0, 0.35, 0));
  pss.position.y = 0.355;
  pssStand.add(pss);
  r.place(pssStand, -0.25, TOP, z0 - 0.2);
  const tissueTarget: [number, number, number] = [-0.75, TOP + 0.3, z0 - 0.02];

  r.interactive("organ-bath", "Organ bath (20 mL)", rig.parts.bath, { target: tissueTarget, dist: 0.5, lift: 0.08 });
  r.interactive("tissue", "Tissue strip (simulated)", rig.parts.tissue, { target: [-0.75, TOP + 0.26, z0 - 0.02], dist: 0.28, lift: 0.04 });
  r.interactive("transducer", "Isotonic transducer", rig.parts.transducer, { dist: 0.35, lift: 0.05 });
  r.interactive("thermostat", "Thermostatic circulator", rig.parts.circulator, { dist: 0.6, lift: 0.2 });
  r.interactive("aerator", "Aeration line", rig.parts.air, { dist: 0.45, lift: 0.05 });
  r.interactive("recorder", "Recorder", rec.group, { dist: 0.75, lift: 0.0, target: [0.55, TOP + 0.23, z0 - 0.05], dir: [0.15, 1] });
  r.interactive("stock", "Agonist stock solutions", rack, { dist: 0.38, lift: 0.12 });
  r.interactive("micropipette", "Micropipette", pip, { dist: 0.35, lift: 0.15 });
  r.interactive("pss", "Physiological salt solution", pssStand, { dist: 0.6, lift: 0.1 });

  let aerating = false;
  return {
    root: r.root,
    interactives: r.interactives,
    colliders: r.colliders,
    bounds: shell.bounds,
    spawn: { pos: [-0.25, 1.62, 1.35], target: [-0.25, 1.0, -0.45] },
    apply(raw) {
      const v = raw as DoseVisualLike;
      const last = v.trace.length ? v.trace[v.trace.length - 1] : 0;
      aerating = rig.set({ bathFilled: v.bathFilled, tempC: v.tempC, aeration: v.aeration, thermostat: v.thermostat, tissue: v.tissue, tension: v.tension, contraction: v.washed ? 0 : last });
      rec.set(v.trace, v.pending);
      return aerating;
    },
    tick(t) {
      rig.tick(t);
    },
  };
}
