/**
 * Room 2 — Pharmaceutics (compounding) laboratory, 9 × 7.5 m, green accent.
 * Central compounding bench = the syrup station; north = sink bench; east = storage
 * and a pharmacy refrigerator; west = dispensing shelves.
 */
import * as THREE from "three";
import type { MaterialLib } from "../materials";
import type { BuildContext, RoomBuild } from "../types";
import { box, coatHook, cyl, extinguisher, eyewashStation, firstAid, mesh, rbox, reagentBottles, roomShell, storageCabinet, wallUnits, wasteBin } from "../kit";
import { beaker, glassRod, makeVessel, measuringCylinder, reagentBottle, thermometer, washBottle } from "../glass";
import { hotPlate, labNotebook, storageJar, topPanBalance } from "../instruments";
import { labelTexture } from "../textures";
import { RoomBuilder, TOP } from "./helpers";

export interface SyrupVisualLike {
  boatOn: boolean;
  sucroseOnBoat: number;
  balance: number;
  cylinderMl: number;
  cylinderSyrup: boolean;
  beakerMl: number;
  beakerSolid: number;
  tempC: number;
  heating: boolean;
  onHotplate: boolean;
  stirring: boolean;
  yellow: number;
  bottleFilled: boolean;
  labelled: boolean;
  setpoint?: number;
}

export function buildPharmaceutics(m: MaterialLib, _ctx: BuildContext): RoomBuild {
  const r = new RoomBuilder(m);
  const shell = roomShell(m, { w: 9, d: 7.5, windowsOn: "north", accent: "green" });
  r.root.add(shell.group);

  // ── furniture ──
  r.island(3.6, 0, -0.6, "white", 21);
  r.bench({ w: 5, top: "white", backsplash: true, sink: true, seed: 23 }, -1.2, -3.35);
  r.place(wallUnits(m, 2.0), -3.0, 0, -3.57);
  r.bench({ w: 2.4, top: "white", backsplash: true, seed: 25 }, -4.1, 0.4, Math.PI / 2);
  const shelves = new THREE.Group();
  for (const y of [1.35, 1.75]) shelves.add(mesh(rbox(2.2, 0.025, 0.28, 0.005), m.resinWhiteTop, 0, y, 0));
  shelves.add(reagentBottles(m, 22, 2.0, 0.2, [1.36, 1.76], 27));
  r.place(shelves, -4.35, 0, 0.4, Math.PI / 2);
  r.furniture(storageCabinet(m, 1.0, 29), 4.2, -1.2, 1.0, 0.45, -Math.PI / 2);
  // pharmacy refrigerator
  const fridge = new THREE.Group();
  fridge.add(mesh(rbox(0.7, 1.8, 0.7, 0.03), m.plasticWhite, 0, 0.9, 0));
  fridge.add(mesh(box(0.62, 1.1, 0.012), m.glass, 0, 1.15, 0.352, false));
  fridge.add(mesh(box(0.03, 0.5, 0.03), m.chrome, 0.26, 1.15, 0.37, false));
  const fl = mesh(box(0.34, 0.12, 0.005), new THREE.MeshStandardMaterial({ map: labelTexture("Pharmacy refrigerator", ["2–8 °C · monitored"], { w: 512, h: 180 }), roughness: 0.7 }), 0, 1.82, 0.356, false);
  fridge.add(fl);
  r.furniture(fridge, 4.15, 0.3, 0.7, 0.7, -Math.PI / 2);
  r.furniture(eyewashStation(m), 1.8, -3.6, 0.3, 0.3);
  r.furniture(extinguisher(m), -2.6, 3.6, 0.25, 0.25, Math.PI);
  r.place(firstAid(m), -1.8, 1.6, 3.67, Math.PI);
  r.place(coatHook(m), -3.4, 0, 3.67, Math.PI);
  r.furniture(wasteBin(m, m.accentGreen), 2.6, -3.0, 0.34, 0.34);
  r.stools([-1.0, 1.0], 0.55);

  r.sign("coat", "Wear a lab coat", -1.2, 1.7, 3.72, Math.PI);
  r.sign("gloves", "Wear gloves", -0.7, 1.7, 3.72, Math.PI);
  r.sign("hot", "Hot surface", 0.6, 1.7, -3.72, 0);
  r.sign("no-food", "No eating or drinking", 1.1, 1.7, -3.72, 0);
  r.poster("Simple Syrup", ["Sucrose 85 g per 100 mL", "≈ 64.7 % w/w · density ≈ 1.31 g/mL", "Self-preserving: too little free water for microbes", "Make up to volume only when cool"], 4.45, 1.6, 1.6, -Math.PI / 2, "#21B67A");
  r.poster("Weighing technique", ["Level and zero the balance", "Tare the empty container", "Add, then fine-tune with small amounts", "Record every digit shown"], 4.45, 1.6, 2.5, -Math.PI / 2);

  // decor on the west bench: mortar and pestle, ointment slab
  const mortar = new THREE.Group();
  mortar.add(mesh(new THREE.SphereGeometry(0.08, 28, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), m.tileWhite, 0, 0.08, 0));
  const pestle = mesh(new THREE.CapsuleGeometry(0.014, 0.14, 6, 12), m.tileWhite, 0.02, 0.12, 0);
  pestle.rotation.z = 0.5;
  mortar.add(pestle);
  r.place(mortar, -4.0, TOP, -0.2);
  r.place(mesh(rbox(0.3, 0.012, 0.3, 0.003), m.tileWhite, 0, 0, 0), -4.0, TOP + 0.006, 0.6);

  // ── syrup station (front of the island, facing +z) ──
  const z0 = -0.6 + 0.48;
  const bal = topPanBalance(m);
  r.place(bal.group, -1.1, TOP, z0);
  const jar = storageJar(m, "Sucrose", ["Pharmaceutical grade", "C₁₂H₂₂O₁₁"], m.powderWhite);
  r.place(jar, -1.5, TOP, z0 - 0.08);
  const plate = hotPlate(m);
  r.place(plate.group, 0, TOP, z0);
  const bk = beaker(m, 150);
  const solid = mesh(new THREE.CylinderGeometry(0.026, 0.028, 1, 28), m.powderWhite, 0, 0, 0, false);
  bk.group.add(solid);
  const rod = glassRod(m);
  // A 3 mm glass rod is too thin to tap with a finger. An invisible 24 mm sleeve along it
  // takes the taps (the raycaster ignores material visibility); it draws nothing.
  const rodGrip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.25, 8), new THREE.MeshBasicMaterial({ visible: false }));
  rod.add(rodGrip);
  const rodPivot = new THREE.Group();
  rod.position.set(0.0, 0.08, 0);
  rod.rotation.set(0, 0, 0.35);
  rodPivot.add(rod);
  bk.group.add(rodPivot);
  const therm = thermometer(m);
  therm.group.position.set(-0.015, 0.005, 0.012);
  therm.group.rotation.z = -0.18;
  bk.group.add(therm.group);
  r.root.add(bk.group);
  const cylinder = measuringCylinder(m, 100);
  r.place(cylinder.group, 0.55, TOP, z0);
  const carboy = new THREE.Group();
  carboy.add(mesh(cyl(0.11, 0.11, 0.32, 32), new THREE.MeshPhysicalMaterial({ color: 0xeaf4fb, roughness: 0.25, transparent: true, opacity: 0.55 }), 0, 0.16, 0));
  carboy.add(mesh(cyl(0.035, 0.035, 0.05, 20), m.accentBlue, 0, 0.345, 0));
  carboy.add(mesh(box(0.03, 0.03, 0.05), m.accentBlue, 0, 0.04, 0.12));
  carboy.add(mesh(new THREE.CylinderGeometry(0.111, 0.111, 0.1, 32, 1, true, -1, 2), new THREE.MeshStandardMaterial({ map: labelTexture("Purified water", ["For compounding"], { w: 512, h: 240 }), roughness: 0.7 }), 0, 0.17, 0, false));
  r.place(carboy, 1.15, TOP, z0 - 0.1);
  const wash = r.place(washBottle(m), 0.85, TOP, z0 + 0.12);
  // dispensing bottle with its fill and label
  const bottle = makeVessel(m, [[0, 0], [0.032, 0], [0.036, 0.006], [0.036, 0.11], [0.022, 0.135], [0.012, 0.142], [0.012, 0.155]], [[0, 0.002], [0.0335, 0.002], [0.0345, 0.11], [0.02, 0.134], [0.0105, 0.14]], "dispBottle");
  (bottle.group.children[0] as THREE.Mesh).material = m.amberGlass;
  bottle.group.add(mesh(cyl(0.014, 0.014, 0.022, 20), m.plasticDark, 0, 0.165, 0));
  const blabel = mesh(new THREE.CylinderGeometry(0.0365, 0.0365, 0.06, 32, 1, true, -1, 2), new THREE.MeshStandardMaterial({ map: labelTexture("Syrup (Simple Syrup)", ["For practice — not for use", "Store in a cool place"], { accent: "#21B67A" }), roughness: 0.7 }), 0, 0.06, 0, false);
  bottle.group.add(blabel);
  r.place(bottle.group, 1.5, TOP, z0 + 0.05);
  const boats = new THREE.Group();
  for (let i = 0; i < 4; i++) boats.add(mesh(box(0.08, 0.004, 0.08), m.plasticWhite, 0, i * 0.005, 0, false));
  r.place(boats, -0.75, TOP, z0 + 0.1);
  // the batch record: the formula is calculated here first and the record signed here last
  const notebook = r.place(labNotebook(m, "Batch record — Simple Syrup"), -0.45, TOP, z0 - 0.02, 0.15);

  // ── interactives ──
  r.interactive("balance", "Top-pan balance", bal.group, { dist: 0.45, lift: 0.22 });
  r.interactive("boat", "Weighing boats", boats, { dist: 0.35, lift: 0.18 });
  r.interactive("sucrose", "Sucrose jar", jar, { dist: 0.4, lift: 0.1 });
  r.interactive("hotplate", "Hot plate", plate.group, { dist: 0.5, lift: 0.25 });
  // The beaker (and the rod in it) moves between the bench (x 0.27) and the hot plate
  // (x 0), but a focus pose is fixed when it is registered — so frame the midpoint from
  // far enough back that both places are in view. Framing the plate alone left the rod
  // off-screen while the beaker stood on the bench.
  const beakerFrame = { dist: 0.62, lift: 0.22, target: [0.135, TOP + 0.12, z0 - 0.01] as [number, number, number] };
  r.interactive("beaker", "Beaker, 150 mL", bk.group, beakerFrame);
  r.interactive("rod", "Glass stirring rod", rodPivot, beakerFrame);
  r.interactive("cylinder", "Measuring cylinder, 100 mL", cylinder.group, { dist: 0.5, lift: 0.08 });
  r.interactive("water", "Purified water", carboy, { dist: 0.6, lift: 0.15 });
  r.interactive("bottle", "Dispensing bottle", bottle.group, { dist: 0.35, lift: 0.08 });
  r.interactive("notebook", "Lab notebook", notebook, { dist: 0.45, lift: 0.3 });
  void wash;

  let stirring = false;
  const placeBeaker = (onPlate: boolean) => bk.group.position.set(onPlate ? 0 : 0.27, TOP + (onPlate ? 0.098 : 0), onPlate ? z0 - 0.04 : z0 + 0.06);
  placeBeaker(false);
  return {
    root: r.root,
    interactives: r.interactives,
    colliders: r.colliders,
    bounds: shell.bounds,
    spawn: { pos: [-0.3, 1.66, 1.75], target: [-0.3, 0.95, -0.25] },
    apply(raw) {
      const v = raw as SyrupVisualLike;
      bal.set({ boatOn: v.boatOn, sampleG: v.sucroseOnBoat, display: v.balance.toFixed(2) });
      plate.set({ heating: v.heating, setpoint: v.setpoint ?? (v.heating ? 60 : 0) });
      placeBeaker(v.onHotplate);
      bk.setVolume(v.beakerMl);
      const y = v.yellow;
      bk.setColour([1 - 0.05 * y, 0.97 - 0.25 * y, 0.9 - 0.6 * y], 0.38 + 0.25 * y);
      solid.visible = v.beakerSolid > 0.3;
      const h = Math.min(0.03, 0.002 + v.beakerSolid * 0.0004);
      solid.scale.y = h;
      solid.position.y = 0.003 + h / 2;
      therm.set(v.tempC);
      cylinder.setVolume(v.cylinderMl);
      cylinder.setColour(v.cylinderSyrup ? [1, 0.98, 0.93] : [0.88, 0.95, 1], v.cylinderSyrup ? 0.55 : 0.35);
      bottle.setVolume(v.bottleFilled ? 95 : 0);
      bottle.setColour([1, 0.95, 0.85], 0.6);
      blabel.visible = v.labelled;
      stirring = v.stirring && (v.beakerMl > 0 || v.beakerSolid > 0);
      return stirring;
    },
    tick(t) {
      if (stirring) rodPivot.rotation.y = t * 3.2;
    },
    dispose() {
      bk.dispose();
      cylinder.dispose();
      bottle.dispose();
      rodGrip.geometry.dispose();
      (rodGrip.material as THREE.Material).dispose();
    },
  };
}
