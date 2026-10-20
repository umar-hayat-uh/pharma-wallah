/**
 * Room 4 — Pharmacognosy laboratory, 9 × 7.5 m.
 * Central island = microscopy and slide-preparation station; north = a row of student
 * microscopes; east = herbarium cabinet; west = crude-drug specimen shelves.
 */
import * as THREE from "three";
import type { MaterialLib } from "../materials";
import type { BuildContext, RoomBuild } from "../types";
import { box, coatHook, cyl, extinguisher, eyewashStation, firstAid, mesh, rbox, roomShell, wasteBin } from "../kit";
import { dropperBottle } from "../glass";
import { compoundMicroscope, slide, spiritLamp, storageJar } from "../instruments";
import { labelTexture, mulberry } from "../textures";
import { RoomBuilder, TOP } from "./helpers";

export interface CloveVisualLike {
  sample: string | null;
  slideStage: number;
  onStage: boolean;
  light: boolean;
  mag: 4 | 10 | 40;
}

export function buildPharmacognosy(m: MaterialLib, _ctx: BuildContext): RoomBuild {
  const r = new RoomBuilder(m);
  const shell = roomShell(m, { w: 9, d: 7.5, windowsOn: "north", accent: "green" });
  r.root.add(shell.group);
  const leaf = new THREE.MeshStandardMaterial({ color: 0x3f8a52, roughness: 0.7 });
  const fennel = new THREE.MeshStandardMaterial({ color: 0x8c8a4a, roughness: 0.95 });
  const cinnamon = new THREE.MeshStandardMaterial({ color: 0x9a5a32, roughness: 0.95 });
  const stalk = new THREE.MeshStandardMaterial({ color: 0x6e4a33, roughness: 0.95 });

  r.island(3.4, 0, -0.5, "wood", 61);
  // north bench with a row of student microscopes under the windows
  r.bench({ w: 6.4, top: "wood", backsplash: true, seed: 63 }, -0.2, -3.35);
  for (let i = 0; i < 5; i++) {
    const sc = compoundMicroscope(m);
    sc.set({ mag: 10, light: false });
    r.place(sc.group, -2.8 + i * 1.3, TOP, -3.35, Math.PI);
  }
  // herbarium cabinet (wood)
  const herb = new THREE.Group();
  herb.add(mesh(box(1.2, 2.0, 0.6), m.wood, 0, 1.0, 0));
  for (let row = 0; row < 6; row++)
    for (let col = 0; col < 2; col++) {
      herb.add(mesh(rbox(0.56, 0.3, 0.02, 0.004), m.wood, -0.29 + col * 0.58, 0.2 + row * 0.32, 0.305, false));
      herb.add(mesh(box(0.1, 0.02, 0.02), m.chrome, -0.29 + col * 0.58, 0.28 + row * 0.32, 0.32, false));
    }
  r.furniture(herb, 4.1, -0.6, 1.2, 0.6, -Math.PI / 2);
  // specimen shelves of crude drugs (decorative jars, instanced feel via a few draws)
  const shelf = new THREE.Group();
  shelf.add(mesh(box(2.4, 1.9, 0.38), m.cabinet, 0, 0.95, 0));
  const fills = [cinnamon, fennel, stalk, m.powderBrown, leaf, m.powderWhite];
  const rng = mulberry(65);
  for (const y of [0.45, 0.9, 1.35]) {
    shelf.add(mesh(box(2.3, 0.02, 0.32), m.cabinetDoor, 0, y - 0.01, 0.02, false));
    for (let i = 0; i < 9; i++) {
      const j = new THREE.Group();
      j.add(mesh(cyl(0.05, 0.05, 0.16, 20), m.glass, 0, 0.08, 0, false));
      j.add(mesh(cyl(0.046, 0.046, 0.11, 18), fills[Math.floor(rng() * fills.length)], 0, 0.06, 0, false));
      j.add(mesh(cyl(0.052, 0.052, 0.02, 20), m.plasticDark, 0, 0.17, 0, false));
      j.position.set(-1.05 + i * 0.26, y, 0.05);
      shelf.add(j);
    }
  }
  r.furniture(shelf, -4.2, 0.4, 2.4, 0.38, Math.PI / 2);
  // potted plant (a living specimen; simple and original)
  const plant = new THREE.Group();
  plant.add(mesh(cyl(0.16, 0.12, 0.3, 24), new THREE.MeshStandardMaterial({ color: 0xc8b9a6, roughness: 0.8 }), 0, 0.15, 0));
  for (let i = 0; i < 14; i++) {
    const lf = mesh(new THREE.SphereGeometry(0.09, 10, 6), leaf, 0, 0, 0);
    lf.scale.set(0.45, 0.12, 1);
    lf.position.set(Math.cos(i * 2.3) * 0.12, 0.42 + (i % 5) * 0.08, Math.sin(i * 2.3) * 0.12);
    lf.rotation.set(0.4, i * 2.3, 0.3);
    plant.add(lf);
  }
  r.furniture(plant, 3.9, 2.9, 0.4, 0.4);
  r.furniture(eyewashStation(m), 3.4, -3.6, 0.3, 0.3);
  r.furniture(extinguisher(m), -2.6, 3.6, 0.25, 0.25, Math.PI);
  r.place(firstAid(m), -1.6, 1.6, 3.67, Math.PI);
  r.place(coatHook(m), -0.6, 0, 3.67, Math.PI);
  r.furniture(wasteBin(m, m.accentGreen), 2.6, 1.6, 0.34, 0.34);
  r.stools([-0.8, 0.8], 0.6);

  r.sign("flame", "Naked flame", 1.4, 1.7, 3.72, Math.PI);
  r.sign("gloves", "Wear gloves", 1.9, 1.7, 3.72, Math.PI);
  r.poster("Powder microscopy", ["Mount a needle-tip of powder", "Chloral hydrate clears; warm gently", "Coverslip at 45° — no air bubbles", "Low power first; fine focus at 40×"], 4.45, 1.6, 1.4, -Math.PI / 2, "#21B67A");
  r.poster("Clove — Syzygium aromaticum", ["Dried flower buds", "Oil glands in parenchyma", "Triangular pollen grains", "Cluster crystals · no starch"], 4.45, 1.6, 2.3, -Math.PI / 2);

  // ── microscopy station (front of the island) ──
  const z0 = -0.5 + 0.45;
  const scope = compoundMicroscope(m);
  r.place(scope.group, 0.2, TOP, z0 - 0.05);
  const prep = slide(m);
  const PREP_AT: [number, number, number] = [-0.32, TOP + 0.009, z0 + 0.12];
  const tile = mesh(rbox(0.16, 0.008, 0.12, 0.003), m.tileWhite, 0, 0, 0);
  r.place(tile, -0.32, TOP + 0.004, z0 + 0.12);
  r.place(prep.group, ...PREP_AT);
  const slideBox = new THREE.Group();
  slideBox.add(mesh(rbox(0.1, 0.035, 0.085, 0.004), m.plasticGrey, 0, 0.0175, 0));
  slideBox.add(mesh(box(0.08, 0.002, 0.07), new THREE.MeshStandardMaterial({ map: labelTexture("Microscope slides", ["76 × 26 mm"], { w: 384, h: 220 }) }), 0, 0.036, 0, false));
  r.place(slideBox, -0.62, TOP, z0 - 0.02);
  const coverBox = new THREE.Group();
  coverBox.add(mesh(rbox(0.05, 0.02, 0.05, 0.003), m.plasticWhite, 0, 0.01, 0));
  coverBox.add(mesh(box(0.04, 0.002, 0.04), new THREE.MeshStandardMaterial({ map: labelTexture("Coverslips", ["22 × 22 mm"], { w: 256, h: 200 }) }), 0, 0.021, 0, false));
  r.place(coverBox, -0.62, TOP, z0 + 0.1);
  const reagents = new THREE.Group();
  const ch = dropperBottle(m, "Chloral hydrate", ["Clearing reagent"], "harmful");
  const wa = dropperBottle(m, "Water", ["Purified"]);
  wa.position.x = 0.06;
  const io = dropperBottle(m, "Iodine N/50", ["Starch test"], "irritant");
  io.position.x = 0.12;
  reagents.add(ch, wa, io);
  r.place(reagents, -1.0, TOP, z0 - 0.04);
  const lamp = spiritLamp(m);
  r.place(lamp, 0.62, TOP, z0 + 0.08);
  const tools = new THREE.Group();
  tools.add(mesh(rbox(0.16, 0.006, 0.06, 0.002), m.plasticWhite, 0, 0.003, 0));
  const needle = mesh(cyl(0.0012, 0.0012, 0.13, 6), m.chrome, 0, 0.012, -0.012, false);
  needle.rotation.z = Math.PI / 2;
  tools.add(needle);
  tools.add(mesh(box(0.05, 0.012, 0.012), m.wood, -0.055, 0.012, -0.012, false));
  const spat = mesh(box(0.13, 0.002, 0.008), m.brushed, 0, 0.009, 0.014, false);
  tools.add(spat);
  r.place(tools, -0.05, TOP, z0 + 0.15);
  const blot = mesh(box(0.1, 0.002, 0.07), new THREE.MeshStandardMaterial({ color: 0xf6f1e7, roughness: 1 }), 0, 0, 0);
  r.place(blot, 0.45, TOP + 0.001, z0 + 0.17);
  // crude-drug jars on the bench (the four the student chooses between)
  const jars = new THREE.Group();
  const defs: [string, string[], THREE.Material][] = [
    ["Clove, powdered", ["Caryophylli flos · PG-07"], m.powderBrown],
    ["Clove stalks, powdered", ["PG-08"], stalk],
    ["Cinnamon bark, powdered", ["PG-03"], cinnamon],
    ["Fennel fruit, powdered", ["PG-11"], fennel],
  ];
  defs.forEach(([t, l, fill], i) => {
    const j = storageJar(m, t, l, fill);
    j.scale.setScalar(0.8);
    j.position.set(i * 0.1, 0, 0);
    jars.add(j);
  });
  r.place(jars, 0.95, TOP, z0 - 0.1);

  r.interactive("microscope", "Compound microscope", scope.group, { dist: 0.6, lift: 0.18, target: [0.2, TOP + 0.2, z0 - 0.04] });
  r.interactive("slides", "Microscope slides", slideBox, { dist: 0.3, lift: 0.18 });
  r.interactive("coverslips", "Coverslips", coverBox, { dist: 0.3, lift: 0.18 });
  r.interactive("chloral", "Reagent bottles", reagents, { dist: 0.35, lift: 0.1 });
  r.interactive("jars", "Crude-drug sample jars", jars, { dist: 0.5, lift: 0.12 });
  r.interactive("lamp", "Spirit lamp", lamp, { dist: 0.3, lift: 0.12 });
  r.interactive("needle", "Mounted needle and spatula", tools, { dist: 0.28, lift: 0.18 });
  r.interactive("blotting", "Blotting paper", blot, { dist: 0.28, lift: 0.18 });

  return {
    root: r.root,
    interactives: r.interactives,
    colliders: r.colliders,
    bounds: shell.bounds,
    spawn: { pos: [0.15, 1.62, 1.45], target: [0.1, 0.95, -0.25] },
    apply(raw) {
      const v = raw as CloveVisualLike;
      prep.set(Math.floor(v.slideStage));
      prep.group.visible = v.slideStage > 0;
      if (v.onStage) {
        if (prep.group.parent !== scope.slideHolder) {
          scope.slideHolder.add(prep.group);
          prep.group.position.set(0, 0, 0);
        }
      } else if (prep.group.parent !== r.root) {
        r.root.add(prep.group);
        prep.group.position.set(...PREP_AT);
      }
      scope.set({ mag: v.mag, light: v.light });
      return false;
    },
  };
}
