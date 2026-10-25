/**
 * Room 2 — the Pharmaceutics laboratory, in Babylon.js (2026-10-25). ONE room serves every
 * Pharmaceutics experiment (`ctx.experiment`): Simple Syrup, and the owner's three
 * shortlisted practicals — solution preparation & dilution, physical properties of
 * liquids, solubility & dissolution. The three.js room (../three/rooms/pharmaceutics.ts)
 * is kept for `?engine=three` and rollback.
 *
 * Layout, 10 × 8 m (x east, z toward the student), in zones the student can name:
 *   1 Preparation & weighing ....... west wall: analytical balance on a granite slab
 *   2 Volumetric measurement ....... central island, front: flasks, pipette, beaker
 *                                    (also the Simple Syrup station, where it always was)
 *   3 Physical-property measurements north-east bench: water bath, viscometer, capillary
 *   4 Solubility & dissolution ..... east bench: dissolution tester, UV–Vis, drying oven
 *   5 Storage ...................... east wall: glassware, apparatus and reagent cabinets
 *   6 Washing ...................... north-west: sink with a swan-neck tap, drying rack
 *   7 Waste ........................ north wall: four segregated, labelled containers
 * plus a fume cupboard (a static, labelled fixture — no current procedure needs it).
 *
 * The room only DRAWS: it reads the experiment's visual object (contract.ts for the three
 * shortlisted ones, syrupVisual() for the syrup) and never computes a result. Stored
 * apparatus stands in its cabinet until the engine says it is out, then at its place on
 * the bench (or on the balance, in the bath, in the oven, in the sink being rinsed).
 */
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { bench, coatHook, extinguisher, eyewash, firstAid, footprint, fumeHood, island, lin, roomShell, stool, wallUnits, canvasTexture, type Kit } from "./kit";
import {
  analyticalBalance,
  beaker,
  bulbPipette10,
  capillaryRise,
  carboy,
  cuvette,
  dispensingBottle,
  dissolutionTester,
  dryingOven,
  dynNode,
  evaporatingDish,
  filterSyringe,
  glassFunnel,
  glassRod,
  hotPlate,
  liveLabel,
  measuringCylinder,
  ostwaldViscometer,
  pipetteRack,
  powderJar,
  pycnometer,
  reagentBottle,
  samplingSyringe,
  smallStand,
  spatula,
  spectrophotometer,
  stopperedConical,
  stopwatch,
  tabletPot,
  thermometer,
  topPanBalance,
  tubeClamp,
  tubeRack,
  volumetricFlask,
  washBottle,
  waterBath,
  weighingBoat,
} from "./pharmaceuticsApparatus";
import { Atlas, BLUE, CHARCOAL, MINT, desiccator, dryingRack, hangingBoard, labelCanvas, packCabinet, plateCanvas, posterCanvas, posterLandscape, signCanvas, sinkUnit, storageCabinet, towelAndSoap, wasteStation, windowUnit, zoneCanvas, type Cabinet, type Cell, type SignKind } from "./pharmaceuticsFixtures";
import type { BBuildContext, BInteractive, BRoomBuild } from "./types";
import type { Collider, Pose } from "../three/types";
import type { CommonVisual } from "@/lib/virtual-labs/experiments/pharmaceutics/common";
import type { LiquidPropertiesVisual, SolubilityDissolutionVisual, SolutionPrepVisual } from "@/lib/virtual-labs/experiments/pharmaceutics/contract";

/** Bench-top height used by every room. */
const TOP = 0.91;
/** Front strip of the island: the volumetric zone, and the Simple Syrup station. */
const Z0 = -0.6 + 0.48;
const FLOOR_NORMAL = "/models/virtual-labs/environments/textures/interior_tiles_nor_gl_1k.webp";
const WALL_NORMAL = "/models/virtual-labs/environments/textures/beige_wall_001_nor_gl_1k.webp";

type CabinetId = "cabinet-glass" | "cabinet-instruments" | "cabinet-reagents";
type ExperimentKey = "simple-syrup" | "solution-preparation" | "liquid-properties" | "solubility-dissolution";
const EXPERIMENTS: ExperimentKey[] = ["simple-syrup", "solution-preparation", "liquid-properties", "solubility-dissolution"];

/** Mirrors syrupVisual() (experiments/syrup.ts). Rename a field there, rename it here. */
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

/** A place in the room: a position and a facing (labels face local +z). */
interface Spot {
  x: number;
  y: number;
  z: number;
  ry: number;
}
const westTop = (z: number, dx = 0): Spot => ({ x: -4.58 + dx, y: TOP, z, ry: Math.PI / 2 });
const eastTop = (z: number, dx = 0): Spot => ({ x: 4.58 + dx, y: TOP, z, ry: -Math.PI / 2 });
const islandTop = (x: number, dz = 0): Spot => ({ x, y: TOP, z: Z0 + dz, ry: 0 });
const northTop = (x: number, dz = 0): Spot => ({ x, y: TOP, z: -3.58 + dz, ry: 0 });
const FACE_WEST: [number, number] = [1, 0]; // close-up from the room side of the west bench
const FACE_EAST: [number, number] = [-1, 0];

type FocusOpts = { dir?: [number, number]; dist?: number; lift?: number; target?: [number, number, number] };

/** Close-up framed from the node's own bounding box, as the chemistry room does. */
function interactive(list: BInteractive[], id: string, label: string, node: TransformNode, o: FocusOpts = {}) {
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

const put = (n: TransformNode, s: Spot) => {
  n.position.set(s.x, s.y, s.z);
  n.rotation.y = s.ry;
  return n;
};

/** World position of a point given in a node's own coordinates. */
function worldOf(node: TransformNode, local: Vector3) {
  // parents first: a child's world matrix is built from its parent's current one
  const chain: TransformNode[] = [];
  for (let p: TransformNode | null = node; p; p = p.parent as TransformNode | null) chain.unshift(p);
  for (const p of chain) p.computeWorldMatrix(true);
  return Vector3.TransformCoordinates(local, node.getWorldMatrix());
}
const spotAt = (node: TransformNode, local: Vector3, ry = node.rotation.y): Spot => {
  const w = worldOf(node, local);
  return { x: w.x, y: w.y, z: w.z, ry };
};

// ── shared room ─────────────────────────────────────────────────────────────

interface Shared {
  k: Kit;
  root: TransformNode;
  atlas: Atlas;
  list: BInteractive[];
  colliders: Collider[];
  balance: ReturnType<typeof analyticalBalance>;
  bath: ReturnType<typeof waterBath>;
  tester: ReturnType<typeof dissolutionTester>;
  spectro: ReturnType<typeof spectrophotometer>;
  oven: ReturnType<typeof dryingOven>;
  cabinets: Record<CabinetId, Cabinet>;
  sink: ReturnType<typeof sinkUnit>;
  waste: ReturnType<typeof wasteStation>;
  /** label materials from the atlas: a static label's mesh is made with `atlas.arc/panel`. */
  label: (title: string, lines: string[], o?: Parameters<typeof labelCanvas>[2]) => Cell;
}

function buildShared(k: Kit, root: TransformNode, experiment: ExperimentKey): Shared {
  const { m } = k;
  const colliders: Collider[] = [];
  const atlas = new Atlas(k, "pharmAtlas", 2048);
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

  // warm white walls; on Medium/High the CC0 tile and plaster normal maps give the floor
  // real seams and the walls a painted texture (the floor's own grid lines are dropped then,
  // so the two never disagree)
  m.wall.albedoColor = lin("#fdf8f0");
  // the charcoal epoxy tops mirrored the HDRI's window as a large white blur: duller here
  m.epoxyTop.roughness = 0.55;
  m.epoxyTop.environmentIntensity = 0.45;
  m.epoxyTop.specularIntensity = 0.45;
  if (k.q !== "low") {
    const fn = new Texture(FLOOR_NORMAL, k.scene);
    fn.uScale = 6;
    fn.vScale = 5;
    fn.wAng = Math.PI / 4;
    fn.level = 0.6;
    m.floor.bumpTexture = fn;
    m.floor.albedoTexture?.dispose();
    const vinyl = canvasTexture(k.scene, vinylCanvas(), "pharmFloor", k.q);
    vinyl.uScale = 3;
    vinyl.vScale = 2.5;
    m.floor.albedoTexture = vinyl;
    const wn = new Texture(WALL_NORMAL, k.scene);
    wn.uScale = 4;
    wn.vScale = 2;
    wn.level = 0.35;
    m.wall.bumpTexture = wn;
    k.textures.push(fn, wn, vinyl);
  }
  const shell = roomShell(k, root, { w: 10, d: 8 });
  void shell;

  // ── furniture ──
  furniture(island(k, root, 3.6, "epoxy", 21), 0, -0.6, 3.6, 1.5);
  for (const x of [-1.0, 1.0]) furniture(stool(k, root), x, 0.6, 0.36, 0.36);
  // 1 · weighing: white resin bench (contrast for powders), granite anti-vibration slab
  furniture(bench(k, root, { w: 2.6, top: "white", backsplash: true }), -4.625, -0.7, 2.6, 0.75, Math.PI / 2);
  const granite = k.node(root);
  const graniteMat = m.darkMetal.clone("granite");
  graniteMat.metallic = 0;
  graniteMat.roughness = 0.35;
  graniteMat.albedoColor = lin("#3b3f45");
  k.box(0.5, 0.03, 0.42, graniteMat, granite, -4.6, TOP + 0.015, -1.25);
  const balance = analyticalBalance(k, root);
  place(balance.node, -4.6, TOP + 0.03, -1.25, Math.PI / 2);
  place(desiccator(k, root), -4.62, TOP, -1.85);
  // 6 · washing: drainer bench + sink unit, drying rack and towels on the wall
  furniture(bench(k, root, { w: 1.7, top: "epoxy", backsplash: true }), -4.1, -3.625, 1.7, 0.75);
  const sink = sinkUnit(k, root);
  furniture(sink.node, -2.65, -3.625, 1.2, 0.75);
  place(dryingRack(k, root), -3.95, 1.6, -3.98);
  place(towelAndSoap(k, root), -2.3, 1.35, -3.93);
  // 7 · waste
  const waste = wasteStation(k, atlas, root);
  furniture(waste.node, -1.1, -3.75, 1.9, 0.5);
  // fume cupboard (static, labelled)
  furniture(fumeHood(k, root, 1.5), 0.6, -3.575, 1.5, 0.85);
  atlas.panel(0.66, 0.19, plateCanvas("FUME CUPBOARD", "Not used in these practicals · sash closed", CHARCOAL, 768, 220), root, 0.6, 2.6, -3.97, [512, 147]);
  // 3 · physical properties: epoxy bench, wall units with task light over it
  furniture(bench(k, root, { w: 3.4, top: "epoxy", backsplash: true }), 3.25, -3.625, 3.4, 0.75);
  place(wallUnits(k, root, 3.0), 3.3, 0, -3.82);
  const bath = waterBath(k, root);
  place(bath.node, 2.45, TOP, -3.6);
  // 4 · solubility & dissolution: white bench along the east wall
  // charcoal epoxy: white powders, tablets and clear glass read against it
  furniture(bench(k, root, { w: 4.0, top: "epoxy", backsplash: true }), 4.625, -1.25, 4.0, 0.75, -Math.PI / 2);
  const tester = dissolutionTester(k, root);
  place(tester.node, 4.6, TOP, -2.5, -Math.PI / 2);
  const spectro = spectrophotometer(k, root);
  place(spectro.node, 4.62, TOP, -1.3, -Math.PI / 2);
  const oven = dryingOven(k, root);
  place(oven.node, 4.66, TOP, -0.05, -Math.PI / 2);
  // open shelf above the east bench
  const shelf = k.node(root, 4.86, 1.92, -1.9, -Math.PI / 2);
  k.box(1.6, 0.02, 0.26, m.resinWhiteTop, shelf, 0, 0, 0);
  for (const x of [-0.75, 0.75]) k.box(0.02, 0.12, 0.24, m.brushed, shelf, x, -0.07, 0);
  k.bottleRow(k.node(shelf, 0, 0, 0), 12, 1.4, 0.18, [0.01], 33);
  // 5 · storage: three cabinets on the east wall
  const cabinets = {} as Record<CabinetId, Cabinet>;
  const cab = (id: CabinetId, kind: "glass" | "solid" | "vented", title: string, line: string, accent: string, z: number) => {
    const c = storageCabinet(k, atlas, root, kind, plateCanvas(title, line, accent, 768, 220));
    furniture(c.node, 4.775, z, 1.0, 0.45, -Math.PI / 2);
    cabinets[id] = c;
    return c;
  };
  const glassCab = cab("cabinet-glass", "glass", "GLASSWARE", "Clean, dry glassware only", BLUE, 1.35);
  cab("cabinet-instruments", "solid", "APPARATUS", "Small apparatus & instruments", CHARCOAL, 2.42);
  const reagentCab = cab("cabinet-reagents", "vented", "REAGENTS", "Ventilated · keep closed", MINT, 3.49);
  // decor stock on the top shelves (stored equipment is packed below it)
  const top = glassCab.anchor(0, 1.49, -0.02);
  for (let i = 0; i < 6; i++) {
    const n = k.node(top, -0.38 + i * 0.15, 0, 0);
    if (i % 2) k.lathe([[0, 0], [0.032, 0], [0.034, 0.004], [0.032, 0.03], [0.016, 0.1], [0.013, 0.12]], m.glass, n, 24);
    else k.lathe([[0, 0], [0.03, 0], [0.033, 0.004], [0.033, 0.09], [0.036, 0.093]], m.glass, n, 24);
  }
  k.bottleRow(reagentCab.anchor(0, 1.49, -0.02), 7, 0.85, 0.2, [0], 41);
  // 1 · the weighing bench's wall; west window away from the balance (draughts)
  windowUnit(k, root, -4.975, 1.75, 2.3, Math.PI / 2);
  // safety: eyewash by the sink, extinguisher and first aid by the door
  furniture(eyewash(k, root), -4.78, -2.6, 0.3, 0.3, Math.PI / 2);
  furniture(extinguisher(k, root), -2.6, 3.82, 0.25, 0.25, Math.PI);
  place(firstAid(k, root), -1.7, 1.6, 3.93, Math.PI);
  place(coatHook(k, root), -2.2, 0, 3.96, Math.PI);

  // ── zone boards (1.6 m wide, readable across the room) and notices ──
  const ZW = 1.6;
  const ZH = 0.3;
  const zone = (n: number, title: string, sub: string, accent: string) => atlas.add(zoneCanvas(n, title, sub, accent), 800, 150);
  const z1 = zone(1, "Preparation & weighing", "Analytical balance · weighing boats · spatulas", BLUE);
  const z2 = zone(2, "Volumetric measurement & dilution", "Volumetric flasks · pipettes · beakers", MINT);
  const z3 = zone(3, "Physical-property measurements", "Density · viscosity · surface tension", BLUE);
  const z4 = zone(4, "Solubility & dissolution", "Dissolution tester · UV–Vis · drying oven", MINT);
  const z5 = zone(5, "Storage", "Return every item where you found it", CHARCOAL);
  const z6 = zone(6, "Washing", "Tap water, then purified water", BLUE);
  const z7 = zone(7, "Waste", "Segregate · label · never the sink", "#C8202A");
  const board = (r: typeof z1, x: number, y: number, z: number, ry: number) => {
    const g = k.node(root, x, y, z, ry);
    k.box(ZW + 0.04, ZH + 0.04, 0.012, m.plasticWhite, g, 0, 0, -0.006);
    atlas.panel(ZW, ZH, r, g, 0, 0, 0.0008);
  };
  board(z1, -4.975, 2.5, -0.7, Math.PI / 2);
  hangingBoard(k, atlas, root, z2, 0, 2.5, -0.6);
  board(z3, 3.25, 2.58, -3.975, 0);
  board(z4, 4.975, 2.5, -1.4, -Math.PI / 2);
  board(z5, 4.975, 2.45, 2.42, -Math.PI / 2);
  board(z6, -3.5, 2.5, -3.975, 0);
  board(z7, -1.1, 2.5, -3.975, 0);
  const sign = (kind: SignKind, caption: string, x: number, y: number, z: number, ry: number) => {
    const g = k.node(root, x, y, z, ry);
    k.box(0.27, 0.36, 0.006, m.plasticWhite, g, 0, 0, -0.003);
    atlas.panel(0.26, 0.347, signCanvas(kind, caption), g, 0, 0, 0.0005, [240, 320]);
  };
  sign("goggles", "Eye protection must be worn", -4.975, 1.7, -3.05, Math.PI / 2);
  sign("eyewash", "Eye wash station", -4.975, 1.7, -2.6, Math.PI / 2);
  sign("coat", "Wear a lab coat", -1.2, 1.7, 3.975, Math.PI);
  sign("gloves", "Wear gloves", -0.8, 1.7, 3.975, Math.PI);
  sign("no-food", "No eating or drinking", -0.4, 1.7, 3.975, Math.PI);
  sign("extinguisher", "Fire extinguisher", -2.6, 1.45, 3.975, Math.PI);
  sign("hot", "Hot surfaces", 4.975, 1.75, -0.55, -Math.PI / 2);
  const poster = (title: string, lines: string[], x: number, y: number, z: number, ry: number, accent?: string) => {
    const g = k.node(root, x, y, z, ry);
    k.box(0.62, 0.82, 0.008, m.brushed, g, 0, 0, -0.004);
    atlas.panel(0.6, 0.8, posterCanvas(title, lines, accent), g, 0, 0, 0.0008, [420, 560]);
  };
  poster("Weighing technique", ["Level the balance; check the bubble", "Close the doors; tare the boat", "Add the last milligrams slowly", "Record every digit shown"], -4.975, 1.55, -1.75, Math.PI / 2);
  if (experiment === "simple-syrup")
    poster("Simple Syrup", ["Sucrose 85 g per 100 mL", "≈ 64.7 % w/w · density ≈ 1.31 g/mL", "Self-preserving: too little free water for microbes", "Make up to volume only when cool"], -4.975, 1.55, 0.25, Math.PI / 2, MINT);
  else poster("Making up to volume", ["Dissolve completely first", "Last millilitres from a wash bottle", "Bottom of the meniscus on the mark, at eye level", "Stopper and invert to mix"], -4.975, 1.55, 0.25, Math.PI / 2, MINT);
  poster("Dissolution test", ["Medium de-aerated, 37 ± 0.5 °C", "Paddle 25 ± 2 mm above the vessel bottom", "Sample midway, ≥ 1 cm from the wall", "Filter every sample at once"], 4.975, 1.65, 0.42, -Math.PI / 2);
  const leave = k.node(root, 0.6, 1.55, 3.975, Math.PI);
  atlas.panel(0.9, 0.34, posterLandscape("Before you leave", ["Every item back in its cabinet", "Tap off · bench wiped dry", "Waste in the right container", "Wash your hands"], BLUE), leave, 0, 0, 0.0008, [770, 294]);

  const label = (title: string, lines: string[], o: Parameters<typeof labelCanvas>[2] = {}) => atlas.add(labelCanvas(title, lines, { w: 512, h: 320, ...o }), 512, 320);
  return { k, root, atlas, list: [], colliders, balance, bath, tester, spectro, oven, cabinets, sink, waste, label };
}

/** Plain sheet-vinyl floor (no grid: the tile seams come from the normal map). */
function vinylCanvas() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#d4dbe0";
  ctx.fillRect(0, 0, 512, 512);
  let a = 99;
  const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 4000; i++) {
    const g = 190 + Math.floor(rnd() * 40);
    ctx.fillStyle = `rgba(${g - 30},${g - 20},${g - 15},0.09)`;
    ctx.fillRect(rnd() * 512, rnd() * 512, 2 + rnd() * 4, 2 + rnd() * 4);
  }
  return c;
}

// ── the shared bench mechanics: cabinets, sink, waste ──────────────────────

interface StoredItem {
  id: string;
  node: TransformNode;
  cabinet: CabinetId;
  home: Spot;
  slot?: TransformNode;
}

/**
 * Apparatus that lives in a cabinet. `place()` stands each item where the engine says it
 * is: in its cabinet slot, being rinsed under the tap, at a special place the experiment
 * names (on the balance, in the bath …), or at its home on the bench. Items are placed in
 * the order they were added, so an item placed relative to another (the funnel in a flask)
 * is added after it.
 */
class Storage {
  items: StoredItem[] = [];
  constructor(private s: Shared) {}
  add(id: string, node: TransformNode, cabinet: CabinetId, home: Spot) {
    put(node, home);
    this.items.push({ id, node, cabinet, home });
    return node;
  }
  /** Measure every item and pack each cabinet; call once all items are added. */
  pack(size: Record<string, { w: number; h: number; d?: number }>) {
    for (const id of Object.keys(this.s.cabinets) as CabinetId[]) {
      const mine = this.items.filter((x) => x.cabinet === id);
      const slots = packCabinet(this.s.cabinets[id], mine.map((x) => ({ id: x.id, ...(size[x.id] ?? { w: 0.1, h: 0.15 }) })));
      for (const it of mine) it.slot = slots.get(it.id);
    }
  }
  place(c: CommonVisual, where: (id: string) => Spot | null) {
    for (const it of this.items) {
      if (!c.out.includes(it.id) && it.slot) {
        const w = worldOf(it.slot, Vector3.Zero());
        put(it.node, { x: w.x, y: w.y, z: w.z, ry: -Math.PI / 2 });
      } else if (c.rinsing === it.id) {
        put(it.node, spotAt(this.s.sink.node, this.s.sink.rinse, 0));
      } else put(it.node, where(it.id) ?? it.home);
    }
  }
  isHome(c: CommonVisual, id: string) {
    return c.out.includes(id) && c.rinsing !== id;
  }
}

/** Register the fixtures the shortlisted experiments share (contract FIXTURES). */
function registerFixtures(s: Shared, reg: (id: string, label: string, node: TransformNode, o?: FocusOpts) => void, notebookAt: Spot, notebookTitle: string) {
  const { k } = s;
  reg("cabinet-glass", "Glassware cupboard", s.cabinets["cabinet-glass"].node, { dir: [-1, 0], dist: 1.7, lift: -0.1, target: [4.775, 1.05, 1.35] });
  reg("cabinet-instruments", "Apparatus cabinet", s.cabinets["cabinet-instruments"].node, { dir: [-1, 0], dist: 1.7, lift: -0.1, target: [4.775, 1.05, 2.42] });
  reg("cabinet-reagents", "Reagent cabinet", s.cabinets["cabinet-reagents"].node, { dir: [-1, 0], dist: 1.7, lift: -0.1, target: [4.775, 1.05, 3.49] });
  reg("sink", "Sink and tap", s.sink.node, { dist: 0.95, lift: 0.4, target: [-2.85, 0.98, -3.6] });
  reg("waste-station", "Waste station", s.waste.node, { dist: 2.0, lift: 0.45, target: [-1.1, 0.75, -3.75] });
  const nb = labNotebook(k, s.root, notebookTitle);
  put(nb, notebookAt);
  reg("notebook", "Lab notebook", nb, { dist: 0.45, lift: 0.3 });
}

/** Clipboard, results sheet, pen and calculator. */
function labNotebook(k: Kit, parent: TransformNode, title: string) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.24, 0.006, 0.32, m.wood, g, 0, 0.003, 0);
  const sheet = k.texMat(labelCanvas(title, ["Name · Date · Batch", "Readings", "Calculation", "Result · Conclusion"], { w: 512, h: 680, accent: "#21B67A" }), 0.9);
  const paper = k.panel(0.215, 0.29, sheet, g, 0, 0.0065, 0.008);
  paper.rotation.x = -Math.PI / 2;
  k.box(0.09, 0.012, 0.035, m.chrome, g, 0, 0.012, -0.145);
  const pen = k.cyl(0.0045, 0.0045, 0.14, m.accentBlue, g, 0.135, 0.006, 0.02, 12);
  pen.rotation.x = Math.PI / 2;
  pen.rotation.y = 0.15;
  const calc = k.node(g, -0.2, 0, 0.02, 0.15);
  k.box(0.08, 0.014, 0.16, m.plasticDark, calc, 0, 0.007, 0);
  k.box(0.06, 0.002, 0.03, m.screen, calc, 0, 0.0145, -0.05);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) k.box(0.011, 0.003, 0.009, r === 4 && c === 3 ? m.accentBlue : m.plasticGrey, calc, -0.0225 + c * 0.015, 0.015, -0.01 + r * 0.016);
  return g;
}

interface Experiment {
  apply(raw: unknown, t: number): boolean;
  tick?(t: number, dt: number): boolean;
  dispose?(): void;
}

/**
 * The common part of apply() for the three shortlisted experiments: cabinet doors, stored
 * items, the tap and the stream, the waste levels. Returns true while something animates.
 */
function commonApply(s: Shared, store: Storage, c: CommonVisual, first: boolean, where: (id: string) => Spot | null) {
  let busy = false;
  for (const id of Object.keys(s.cabinets) as CabinetId[]) {
    busy = s.cabinets[id].setOpen(c.open === id) || busy;
    if (first) s.cabinets[id].snap();
  }
  store.place(c, where);
  let toY: number | null = null;
  const rinsed = c.rinsing ? store.items.find((x) => x.id === c.rinsing) : null;
  if (rinsed) toY = rinsed.node.getHierarchyBoundingVectors(true, (m) => m.isEnabled()).max.y - s.sink.node.position.y;
  if (s.sink.set(c.tap, toY)) busy = true;
  s.waste.set(c.waste);
  return busy && !first ? true : c.tap;
}

function commonTick(s: Shared, t: number, dt: number) {
  let busy = false;
  for (const id of Object.keys(s.cabinets) as CabinetId[]) busy = s.cabinets[id].step(dt) || busy;
  return s.sink.step(t) || busy;
}

/** Idle the fixed instruments an experiment does not use (they are still in the room). */
function idle(s: Shared, use: { balance?: boolean; bath?: boolean; tester?: boolean; spectro?: boolean; oven?: boolean }) {
  if (!use.balance) s.balance.set("0.0000 g");
  if (!use.bath) s.bath.off();
  if (!use.tester) s.tester.off();
  if (!use.spectro) s.spectro.off();
  if (!use.oven) s.oven.off();
  s.sink.set(false, null);
  s.waste.set({ aqueous: 0, organic: 0, "chemical-solid": 0, solid: 0, glass: 0 });
}

// ── Simple Syrup (ported from the three.js room: same ids, places, close-ups) ─

function buildSyrup(s: Shared, reg: (id: string, label: string, node: TransformNode, o?: FocusOpts) => void): Experiment {
  const { k, root, atlas } = s;
  const { m } = k;
  idle(s, {});
  const at = (n: TransformNode, x: number, y: number, z: number, ry = 0) => put(n, { x, y, z, ry });
  const bal = topPanBalance(k, root);
  at(bal.node, -1.1, TOP, Z0);
  const jar = powderJar(k, root, null, { r: 0.05, h: 0.14 });
  atlas.arc(0.0505, 0.063, 2.2, s.label("Sucrose", ["Pharmaceutical grade", "C₁₂H₂₂O₁₁"], { h: 300 }), jar, 0.075);
  at(jar, -1.5, TOP, Z0 - 0.08);
  const plate = hotPlate(k, root);
  at(plate.node, 0, TOP, Z0);
  const bk = beaker(k, root, 150);
  const solid = dynNode(k.node(bk.node));
  const solidMesh = k.cyl(0.026, 0.028, 1, m.powderWhite, solid, 0, 0, 0, 28);
  // the rod in the beaker turns while stirring; an invisible 24 mm sleeve takes the taps
  // (a 3 mm rod is too thin for a finger) — as in the three.js room
  const rodPivot = dynNode(k.node(bk.node));
  const rod = glassRod(k, rodPivot, 0.25);
  rod.position.set(0, 0.08, 0);
  rod.rotation.z = 0.35;
  const grip = k.cyl(0.012, 0.012, 0.25, m.glass, rodPivot, 0, 0.08, 0, 8);
  grip.rotation.z = 0.35;
  grip.visibility = 0;
  const therm = thermometer(k, bk.node);
  therm.node.position.set(-0.015, 0.005, 0.012);
  therm.node.rotation.z = -0.18;
  dynNode(therm.node);
  const cyl = measuringCylinder(k, root, 100);
  at(cyl.node, 0.55, TOP, Z0);
  const water = carboy(k, root, null);
  atlas.arc(0.1105, 0.1, 2.0, s.label("Purified water", ["For compounding"], { h: 240 }), water, 0.17);
  at(water, 1.15, TOP, Z0 - 0.1);
  const wash = washBottle(k, root);
  atlas.arc(0.0365, 0.05, 2, s.label("Purified water", ["Wash bottle"], { h: 220 }), wash, 0.08);
  at(wash, 0.85, TOP, Z0 + 0.12);
  const bottleLabel = s.label("Syrup (Simple Syrup)", ["For practice — not for use", "Store in a cool place"], { accent: "#21B67A" });
  const bottle = dispensingBottle(k, root);
  const blabel = atlas.arc(0.0365, 0.06, 2.0, bottleLabel, bottle.node, 0.06);
  blabel.metadata = { dyn: true };
  at(bottle.node, 1.5, TOP, Z0 + 0.05);
  const boats = k.node(root);
  for (let i = 0; i < 4; i++) k.box(0.08, 0.004, 0.08, m.plasticWhite, boats, 0, i * 0.005, 0);
  at(boats, -0.75, TOP, Z0 + 0.1);
  const notebook = labNotebook(k, root, "Batch record — Simple Syrup");
  at(notebook, -0.45, TOP, Z0 - 0.02, 0.15);

  const placeBeaker = (onPlate: boolean) => bk.node.position.set(onPlate ? 0 : 0.27, TOP + (onPlate ? 0.098 : 0), onPlate ? Z0 - 0.04 : Z0 + 0.06);
  placeBeaker(false);
  reg("balance", "Top-pan balance", bal.node, { dist: 0.45, lift: 0.22 });
  reg("boat", "Weighing boats", boats, { dist: 0.35, lift: 0.18 });
  reg("sucrose", "Sucrose jar", jar, { dist: 0.4, lift: 0.1 });
  reg("hotplate", "Hot plate", plate.node, { dist: 0.5, lift: 0.25 });
  // the beaker moves between the bench and the plate: frame the midpoint from far enough
  // back that both places are in view (as the three.js room does)
  const beakerFrame: FocusOpts = { dist: 0.62, lift: 0.22, target: [0.135, TOP + 0.12, Z0 - 0.01] };
  reg("beaker", "Beaker, 150 mL", bk.node, beakerFrame);
  reg("rod", "Glass stirring rod", rodPivot, beakerFrame);
  reg("cylinder", "Measuring cylinder, 100 mL", cyl.node, { dist: 0.5, lift: 0.08 });
  reg("water", "Purified water", water, { dist: 0.6, lift: 0.15 });
  reg("bottle", "Dispensing bottle", bottle.node, { dist: 0.35, lift: 0.08 });
  reg("notebook", "Lab notebook", notebook, { dist: 0.45, lift: 0.3 });

  let stirring = false;
  return {
    apply(raw) {
      const v = raw as SyrupVisualLike;
      bal.set({ boatOn: v.boatOn, sampleG: v.sucroseOnBoat, display: v.balance.toFixed(2) });
      plate.set({ heating: v.heating, setpoint: v.setpoint ?? (v.heating ? 60 : 0) });
      placeBeaker(v.onHotplate);
      bk.setVolume(v.beakerMl);
      const y = v.yellow;
      bk.setColour([1 - 0.05 * y, 0.97 - 0.25 * y, 0.9 - 0.6 * y], 0.38 + 0.25 * y);
      solidMesh.setEnabled(v.beakerSolid > 0.3);
      const h = Math.min(0.03, 0.002 + v.beakerSolid * 0.0004);
      solidMesh.scaling.y = h;
      solidMesh.position.y = 0.003 + h / 2;
      therm.set(v.tempC);
      cyl.setVolume(v.cylinderMl);
      cyl.setColour(v.cylinderSyrup ? [1, 0.98, 0.93] : [0.88, 0.95, 1], v.cylinderSyrup ? 0.55 : 0.35);
      bottle.setVolume(v.bottleFilled ? 95 : 0);
      bottle.setColour([1, 0.95, 0.85], 0.6);
      blabel.setEnabled(v.labelled);
      stirring = v.stirring && (v.beakerMl > 0 || v.beakerSolid > 0);
      return stirring;
    },
    tick(t) {
      if (stirring) rodPivot.rotation.y = t * 3.2;
      return stirring;
    },
    dispose() {
      bk.dispose();
      cyl.dispose();
      bottle.dispose();
    },
  };
}

// ── Pharmaceutical solution preparation & dilution ─────────────────────────

function buildSolutionPrep(s: Shared, reg: (id: string, label: string, node: TransformNode, o?: FocusOpts) => void): Experiment {
  const { k, root, atlas } = s;
  idle(s, { balance: true });
  const store = new Storage(s);
  // fixed: the analytical balance (west) and a purified-water wash bottle on the island
  reg("balance", "Analytical balance (0.1 mg)", s.balance.node, { dir: FACE_WEST, dist: 0.55, lift: 0.22 });
  const water = washBottle(k, root);
  atlas.arc(0.0365, 0.05, 2, s.label("Purified water", ["Wash bottle"], { h: 220 }), water, 0.08);
  put(water, islandTop(0.62, 0.06));
  reg("water", "Purified water (wash bottle)", water, { dist: 0.4, lift: 0.12 });
  // stored — weighing things at the balance, the rest in the volumetric zone
  const boat = weighingBoat(k, root);
  store.add("boat", boat.node, "cabinet-instruments", westTop(-0.72));
  const spat = spatula(k, root);
  store.add("spatula", spat, "cabinet-instruments", { ...westTop(-0.5, 0.05), ry: Math.PI / 2 + 0.4 });
  const solute = liveLabel(k, 512, 320);
  const jar = powderJar(k, root, solute.mat);
  store.add("nacl", jar, "cabinet-reagents", westTop(-0.2));
  const bk = beaker(k, root, 100);
  store.add("beaker", bk.node, "cabinet-glass", islandTop(-0.95));
  const flaskA = volumetricFlask(k, root);
  store.add("flask-a", flaskA.node, "cabinet-glass", islandTop(-0.3));
  const flaskB = volumetricFlask(k, root, "#21B67A");
  store.add("flask-b", flaskB.node, "cabinet-glass", islandTop(0.2));
  const funnel = glassFunnel(k, root);
  store.add("funnel", funnel, "cabinet-glass", islandTop(-0.6, 0.1));
  const pip = bulbPipette10(k, root);
  pip.held(false);
  const PIP_HOME = islandTop(-0.05, 0.17);
  store.add("pipette", pip.node, "cabinet-glass", PIP_HOME);
  put(pipetteRack(k, root), { ...PIP_HOME, x: PIP_HOME.x + 0.01 });
  const rodNode = dynNode(k.node(root));
  const rodPivot = dynNode(k.node(rodNode));
  const rod = glassRod(k, rodPivot, 0.25);
  const grip = k.cyl(0.012, 0.012, 0.25, k.m.glass, rodPivot, 0, 0, 0, 8);
  grip.visibility = 0;
  store.add("rod", rodNode, "cabinet-glass", islandTop(-0.95, 0.14));
  const solid = k.cyl(0.022, 0.0225, 1, k.m.powderWhite, bk.node, 0, 0, 0, 24);
  solid.metadata = { dyn: true };
  store.pack({ boat: { w: 0.08, h: 0.03 }, spatula: { w: 0.2, h: 0.02 }, nacl: { w: 0.1, h: 0.16 }, beaker: { w: 0.07, h: 0.08 }, "flask-a": { w: 0.06, h: 0.2 }, "flask-b": { w: 0.06, h: 0.2 }, funnel: { w: 0.08, h: 0.1 }, pipette: { w: 0.52, h: 0.03, d: 0.05 }, rod: { w: 0.26, h: 0.02, d: 0.03 } });

  // close-ups framed at the bench place
  reg("boat", "Weighing boat", boat.node, { dir: FACE_WEST, dist: 0.3, lift: 0.18 });
  reg("spatula", "Spatula", spat, { dir: FACE_WEST, dist: 0.3, lift: 0.2 });
  reg("nacl", "Solute (labelled jar)", jar, { dir: FACE_WEST, dist: 0.38, lift: 0.08 });
  reg("beaker", "Beaker, 100 mL", bk.node, { dist: 0.38, lift: 0.14 });
  reg("rod", "Glass stirring rod", rodNode, { dist: 0.4, lift: 0.2, target: [-0.95, TOP + 0.05, Z0 + 0.07] });
  reg("funnel", "Glass funnel", funnel, { dist: 0.35, lift: 0.12 });
  reg("flask-a", "Volumetric flask A, 100 mL", flaskA.node, { dist: 0.19, lift: 0.0, target: [-0.3, TOP + flaskA.markY, Z0] });
  reg("flask-b", "Volumetric flask B, 100 mL", flaskB.node, { dist: 0.19, lift: 0.0, target: [0.2, TOP + flaskB.markY, Z0] });
  reg("pipette", "Bulb pipette, 10 mL", pip.node, { dist: 0.55, lift: 0.18, target: [PIP_HOME.x, TOP + 0.05, PIP_HOME.z] });
  registerFixtures(s, reg, { ...islandTop(1.35, 0.05), ry: -0.2 }, "Solution preparation & dilution");

  let first = true;
  let stirring = false;
  return {
    apply(raw) {
      const v = raw as SolutionPrepVisual;
      const c = v.common;
      s.balance.set(`${v.balance.reading.toFixed(4)} g`);
      solute.set(v.labels.solute || "Solute", ["Analytical reagent", "Keep container closed"]);
      boat.set(v.boatSolidG);
      bk.setVolume(v.beakerMl);
      solid.setEnabled(v.beakerSolidG > 0.001);
      const h = Math.min(0.014, 0.0012 + v.beakerSolidG * 0.004);
      solid.scaling.y = h;
      solid.position.y = 0.0018 + h / 2;
      flaskA.set(v.flaskA, v.labels.flaskA);
      flaskB.set(v.flaskB, v.labels.flaskB);
      pip.setVolume(v.pipette.ml);
      const beakerHome = store.isHome(c, "beaker");
      const flaskNode = (id: "flask-a" | "flask-b") => (id === "flask-a" ? flaskA.node : flaskB.node);
      const busy = commonApply(s, store, c, first, (id) => {
        if (id === "boat" && v.balance.boatOn) return spotAt(s.balance.node, s.balance.pan, Math.PI / 2);
        if (id === "funnel" && v.funnelIn === "flask-a") return spotAt(flaskA.node, new Vector3(0, 0.17 - 0.035, 0), 0);
        if (id === "pipette" && v.pipette.over) return spotAt(flaskNode(v.pipette.over), new Vector3(0, 0.12, 0), 0);
        if (id === "rod" && beakerHome) return spotAt(bk.node, new Vector3(0, 0, 0), 0);
        return null;
      });
      pip.held(!!v.pipette.over && store.isHome(c, "pipette"));
      // the rod rests in the beaker when both are on the bench, otherwise it lies flat
      const inBeaker = beakerHome && store.isHome(c, "rod");
      rod.position.set(0, inBeaker ? 0.075 : 0.004, 0);
      rod.rotation.set(0, 0, inBeaker ? 0.35 : Math.PI / 2);
      grip.position.copyFrom(rod.position);
      grip.rotation.copyFrom(rod.rotation);
      stirring = inBeaker && v.stirring;
      if (!stirring) rodPivot.rotation.y = 0;
      first = false;
      return busy || stirring;
    },
    tick(t, dt) {
      if (stirring) rodPivot.rotation.y = t * 3.2;
      return commonTick(s, t, dt) || stirring;
    },
    dispose() {
      bk.dispose();
      flaskA.dispose();
      flaskB.dispose();
      pip.dispose();
    },
  };
}

// ── Physical properties of liquids ──────────────────────────────────────────

function buildLiquidProperties(s: Shared, reg: (id: string, label: string, node: TransformNode, o?: FocusOpts) => void): Experiment {
  const { k, root, atlas } = s;
  idle(s, { balance: true, bath: true });
  const store = new Storage(s);
  reg("balance", "Analytical balance (0.1 mg)", s.balance.node, { dir: FACE_WEST, dist: 0.55, lift: 0.22 });
  reg("water-bath", "Thermostatic water bath", s.bath.node, { dist: 0.8, lift: 0.38, target: [2.45, TOP + 0.2, -3.6] });
  const BATH = s.bath.node;
  // the viscometer's stand stays on the bench; the bath has its own clamp
  const stand = smallStand(k, root, 0.33);
  put(stand, northTop(1.85, 0.02));
  tubeClamp(k, BATH, s.bath.viscometer.x, s.bath.viscometer.y + 0.255 + 0.0, s.bath.viscometer.z, 0.13);
  // the clamp's jaws (x 0, z −0.05 on the stand) hold the viscometer's wide arm (+16 mm in x)
  const STAND_SPOT = spotAt(stand, new Vector3(-0.016, 0.33 - 0.255, -0.05), 0);
  const BATH_VISC = spotAt(BATH, s.bath.viscometer.add(new Vector3(-0.016, 0, 0)), 0);
  const visc = ostwaldViscometer(k, root);
  store.add("viscometer", visc.node, "cabinet-glass", STAND_SPOT);
  const therm = thermometer(k, root);
  store.add("thermometer", therm.node, "cabinet-instruments", spotAt(BATH, s.bath.thermometer, 0));
  tubeClamp(k, BATH, s.bath.thermometer.x, 0.33, s.bath.thermometer.z, 0.06);
  const watch = stopwatch(k, root);
  store.add("stopwatch", watch.node, "cabinet-instruments", northTop(3.0, 0.24));
  const cap = capillaryRise(k, root);
  const CAP_HOME = northTop(3.3, -0.02);
  store.add("capillary", cap.node, "cabinet-glass", CAP_HOME);
  const bk = beaker(k, root, 50);
  // turned so its own printed scale faces sideways, away from the mm scale
  const CAP_BEAKER = spotAt(cap.node, cap.beakerSpot, Math.PI / 2);
  store.add("beaker", bk.node, "cabinet-glass", CAP_BEAKER);
  const pip = bulbPipette10(k, root);
  pip.held(false);
  const PIP_HOME = northTop(3.75, 0.24);
  store.add("pipette", pip.node, "cabinet-glass", PIP_HOME);
  put(pipetteRack(k, root), { ...PIP_HOME, x: PIP_HOME.x + 0.01 });
  const pyc = pycnometer(k, root);
  store.add("pycnometer", pyc.node, "cabinet-glass", northTop(3.85, -0.03));
  const bottles: Record<string, ReturnType<typeof reagentBottle>> = {};
  const sample = (id: string, title: string, lines: string[], hex: string) => {
    const b = reagentBottle(k, root, null, { liquid: hex });
    atlas.arc(0.0405, 0.075, 2.2, s.label(title, lines), b.node, 0.07);
    bottles[id] = b;
    return b.node;
  };
  store.add("sample-water", sample("sample-water", "Purified water", ["Reference liquid", "Ph. Eur. / USP grade"], "#e4f2ff"), "cabinet-reagents", northTop(4.2, -0.05));
  store.add("sample-ethanol", sample("sample-ethanol", "Ethanol 96 %", ["Highly flammable", "Keep away from flames"], "#f0f7ff"), "cabinet-reagents", northTop(4.43, -0.05));
  store.add("sample-glycerol", sample("sample-glycerol", "Glycerol–water mixture", ["Sample for testing", "Viscous — mix before use"], "#f4efd8"), "cabinet-reagents", northTop(4.66, -0.05));
  store.pack({ viscometer: { w: 0.06, h: 0.32 }, thermometer: { w: 0.3, h: 0.02, d: 0.03 }, stopwatch: { w: 0.08, h: 0.05 }, capillary: { w: 0.14, h: 0.3 }, beaker: { w: 0.05, h: 0.07 }, pipette: { w: 0.52, h: 0.03, d: 0.05 }, pycnometer: { w: 0.05, h: 0.1 }, "sample-water": { w: 0.085, h: 0.21 }, "sample-ethanol": { w: 0.085, h: 0.21 }, "sample-glycerol": { w: 0.085, h: 0.21 } });

  reg("viscometer", "Ostwald viscometer", visc.node, { dist: 0.38, lift: 0.05, target: [STAND_SPOT.x - 0.016, TOP + 0.17, STAND_SPOT.z] });
  reg("thermometer", "Thermometer", therm.node, { dist: 0.5, lift: 0.15 });
  reg("stopwatch", "Stopwatch", watch.node, { dist: 0.22, lift: 0.2 });
  reg("capillary", "Capillary-rise apparatus", cap.node, { dist: 0.17, lift: 0.01, target: [CAP_HOME.x, TOP + 0.075, CAP_HOME.z - 0.02] });
  reg("beaker", "Beaker, 50 mL", bk.node, { dist: 0.3, lift: 0.1 });
  reg("pipette", "Bulb pipette, 10 mL", pip.node, { dist: 0.55, lift: 0.18, target: [PIP_HOME.x, TOP + 0.05, PIP_HOME.z] });
  reg("pycnometer", "Pycnometer, 25 mL", pyc.node, { dist: 0.26, lift: 0.08 });
  reg("sample-water", "Purified water (reference)", bottles["sample-water"].node, { dist: 0.38, lift: 0.08 });
  reg("sample-ethanol", "Ethanol 96 %", bottles["sample-ethanol"].node, { dist: 0.38, lift: 0.08 });
  reg("sample-glycerol", "Glycerol–water mixture", bottles["sample-glycerol"].node, { dist: 0.38, lift: 0.08 });
  registerFixtures(s, reg, { ...islandTop(1.35, 0.05), ry: -0.2 }, "Physical properties of liquids");

  let first = true;
  return {
    apply(raw) {
      const v = raw as LiquidPropertiesVisual;
      const c = v.common;
      s.balance.set(`${v.balance.reading.toFixed(4)} g`);
      s.bath.set(v.bathC);
      therm.set(store.isHome(c, "thermometer") ? v.bathC : 22);
      // a stored thermometer lies down; out, it stands in the bath clamp
      therm.node.rotation.z = c.out.includes("thermometer") ? 0 : Math.PI / 2;
      watch.set(v.stopwatch.running, v.stopwatch.seconds);
      pyc.set(v.pycnometer);
      visc.set(v.viscometer);
      bk.setVolume(v.beakerMl);
      for (const [id, b] of Object.entries(bottles)) b.open(v.sample === id && store.isHome(c, id));
      const busy = commonApply(s, store, c, first, (id) => {
        if (id === "pycnometer" && v.pycnometer.onBalance) return spotAt(s.balance.node, s.balance.pan, Math.PI / 2);
        if (id === "viscometer" && v.viscometer.inBath) return BATH_VISC;
        return null;
      });
      // surface tension: the scale's 0 sits on the beaker's liquid surface
      const both = store.isHome(c, "capillary") && store.isHome(c, "beaker");
      const surface = both && v.beakerMl > 0.05 ? bk.node.position.y + bk.surfaceY() - cap.node.position.y : null;
      cap.set({ dipped: v.capillary.dipped, riseMm: v.capillary.riseMm, tiltDeg: v.capillary.tiltDeg ?? 0, surfaceY: surface });
      first = false;
      return busy;
    },
    tick(t, dt) {
      return commonTick(s, t, dt);
    },
    dispose() {
      bk.dispose();
      pip.dispose();
      pyc.dispose();
      visc.dispose();
      cap.dispose();
      for (const b of Object.values(bottles)) b.dispose();
    },
  };
}

// ── Solubility & dissolution ────────────────────────────────────────────────

function buildSolubilityDissolution(s: Shared, reg: (id: string, label: string, node: TransformNode, o?: FocusOpts) => void): Experiment {
  const { k, root, atlas } = s;
  idle(s, { balance: true, bath: true, tester: true, spectro: true, oven: true });
  const store = new Storage(s);
  reg("balance", "Analytical balance (0.1 mg)", s.balance.node, { dir: FACE_WEST, dist: 0.55, lift: 0.22 });
  reg("water-bath", "Thermostatic water bath", s.bath.node, { dist: 0.8, lift: 0.38, target: [2.45, TOP + 0.2, -3.6] });
  reg("tester", "Dissolution tester (paddle)", s.tester.node, { dir: FACE_EAST, dist: 0.85, lift: 0.08, target: [4.58, TOP + 0.3, -2.5] });
  reg("spectro", "UV–Vis spectrophotometer", s.spectro.node, { dir: FACE_EAST, dist: 0.6, lift: 0.3, target: [4.6, TOP + 0.1, -1.3] });
  reg("oven", "Drying oven", s.oven.node, { dir: FACE_EAST, dist: 0.85, lift: 0.12, target: [4.62, TOP + 0.27, -0.05] });
  const water = washBottle(k, root);
  atlas.arc(0.0365, 0.05, 2, s.label("Purified water", ["Wash bottle"], { h: 220 }), water, 0.08);
  put(water, eastTop(-1.62, -0.17));
  reg("water", "Purified water (wash bottle)", water, { dir: FACE_EAST, dist: 0.4, lift: 0.12 });

  const spat = spatula(k, root);
  store.add("spatula", spat, "cabinet-instruments", { ...westTop(-0.5, 0.05), ry: Math.PI / 2 + 0.4 });
  const boat = weighingBoat(k, root);
  store.add("boat", boat.node, "cabinet-instruments", westTop(-0.72));
  const drug = powderJar(k, root, null);
  atlas.arc(0.0455, 0.058, 2.2, s.label("Drug substance", ["Powder · for solubility work", "Weigh in a fume-free area"], { hazard: "harmful" }), drug, 0.058);
  store.add("drug", drug, "cabinet-reagents", westTop(-0.2));
  const filt = filterSyringe(k, root);
  store.add("syringe-filter", filt.node, "cabinet-instruments", eastTop(0.5, -0.17));
  const sampler = samplingSyringe(k, root);
  store.add("sampler", sampler, "cabinet-instruments", eastTop(-2.2, -0.2));
  const cuv = cuvette(k, root);
  const CUV_HOME = eastTop(-0.92, -0.1);
  store.add("cuvette", cuv, "cabinet-instruments", CUV_HOME);
  const flask = stopperedConical(k, root);
  store.add("flask", flask.node, "cabinet-glass", eastTop(0.32, -0.02));
  const pip = bulbPipette10(k, root);
  pip.held(false);
  const PIP_HOME = eastTop(0.5, 0.16);
  store.add("pipette", pip.node, "cabinet-glass", PIP_HOME);
  put(pipetteRack(k, root), { ...PIP_HOME, z: PIP_HOME.z - 0.01 });
  const dish = evaporatingDish(k, root);
  store.add("dish", dish.node, "cabinet-glass", eastTop(-0.62, -0.06));
  const cyl = measuringCylinder(k, root, 1000);
  store.add("cylinder", cyl.node, "cabinet-glass", eastTop(-3.0, -0.15));
  const tubes = tubeRack(k, root);
  store.add("tubes", tubes.node, "cabinet-glass", eastTop(-1.98, 0.08));
  const tabs = tabletPot(k, root);
  atlas.arc(0.0335, 0.045, 2.2, s.label("Tablets", ["Test product · for dissolution"], { h: 240 }), tabs, 0.042);
  store.add("tablets", tabs, "cabinet-reagents", eastTop(-1.72, 0.1));
  const medium = carboy(k, root, null, k.m.accentGreen);
  atlas.arc(0.1105, 0.1, 2.0, s.label("Dissolution medium", ["Buffer · de-aerated", "Warm to 37 °C before use"], { accent: MINT }), medium, 0.17);
  store.add("medium", medium, "cabinet-reagents", eastTop(-3.02, 0.14));
  // a cuvette rack at the cuvette's home
  const rack = k.node(root);
  k.box(0.06, 0.02, 0.03, k.m.plasticWhite, rack, 0, 0.01, 0);
  put(rack, CUV_HOME);
  store.pack({ spatula: { w: 0.2, h: 0.02 }, boat: { w: 0.08, h: 0.03 }, drug: { w: 0.1, h: 0.16 }, "syringe-filter": { w: 0.16, h: 0.03, d: 0.04 }, sampler: { w: 0.32, h: 0.03, d: 0.04 }, cuvette: { w: 0.03, h: 0.06 }, flask: { w: 0.1, h: 0.2 }, pipette: { w: 0.52, h: 0.03, d: 0.05 }, dish: { w: 0.1, h: 0.05 }, cylinder: { w: 0.15, h: 0.43, d: 0.15 }, tubes: { w: 0.23, h: 0.11, d: 0.06 }, tablets: { w: 0.08, h: 0.13 }, medium: { w: 0.23, h: 0.4, d: 0.23 } });

  reg("spatula", "Spatula", spat, { dir: FACE_WEST, dist: 0.3, lift: 0.2 });
  reg("boat", "Weighing boat", boat.node, { dir: FACE_WEST, dist: 0.3, lift: 0.18 });
  reg("drug", "Drug powder (jar)", drug, { dir: FACE_WEST, dist: 0.38, lift: 0.08 });
  reg("syringe-filter", "Syringe with membrane filter", filt.node, { dir: FACE_EAST, dist: 0.3, lift: 0.16 });
  reg("sampler", "Sampling syringe with cannula filter", sampler, { dir: FACE_EAST, dist: 0.42, lift: 0.22 });
  reg("cuvette", "Quartz cuvette", cuv, { dir: FACE_EAST, dist: 0.22, lift: 0.07 });
  reg("flask", "Stoppered conical flask, 250 mL", flask.node, { dir: FACE_EAST, dist: 0.38, lift: 0.1 });
  reg("pipette", "Bulb pipette, 10 mL", pip.node, { dir: FACE_EAST, dist: 0.55, lift: 0.18, target: [PIP_HOME.x, TOP + 0.05, PIP_HOME.z] });
  reg("dish", "Evaporating dish (tared)", dish.node, { dir: FACE_EAST, dist: 0.28, lift: 0.18 });
  reg("cylinder", "Measuring cylinder, 1000 mL", cyl.node, { dir: FACE_EAST, dist: 0.7, lift: 0.05 });
  reg("tubes", "Sample tubes", tubes.node, { dir: FACE_EAST, dist: 0.35, lift: 0.12 });
  reg("tablets", "Tablets (container)", tabs, { dir: FACE_EAST, dist: 0.3, lift: 0.1 });
  reg("medium", "Dissolution medium (carboy)", medium, { dir: FACE_EAST, dist: 0.6, lift: 0.1 });
  registerFixtures(s, reg, { ...islandTop(1.35, 0.05), ry: -0.2 }, "Solubility & dissolution");

  const BATH_FLASK = spotAt(s.bath.node, s.bath.flask, 0);
  let first = true;
  let shake = false;
  let shakeT = 0;
  let spinning = false;
  return {
    apply(raw) {
      const v = raw as SolubilityDissolutionVisual;
      const c = v.common;
      s.balance.set(`${v.balance.reading.toFixed(4)} g`);
      s.bath.set(v.bathC);
      s.oven.set(v.ovenC);
      spinning = s.tester.set(v.tester);
      s.spectro.set(v.spectro.cuvetteIn, v.spectro.reading);
      tubes.set(v.tubes);
      flask.set(v.flask);
      filt.set(v.syringeMl);
      dish.set(v.dish.ml, v.dish.residueG);
      const busy = commonApply(s, store, c, first, (id) => {
        if (id === "flask" && v.flask.inBath) return BATH_FLASK;
        if (id === "dish" && v.dish.inOven) return spotAt(s.oven.node, s.oven.shelf, -Math.PI / 2);
        if (id === "dish" && v.dish.onBalance) return spotAt(s.balance.node, s.balance.pan, Math.PI / 2);
        if (id === "cuvette" && v.spectro.cuvetteIn) return spotAt(s.spectro.node, s.spectro.cell, -Math.PI / 2);
        return null;
      });
      shake = v.flask.inBath && v.flask.shaking && store.isHome(c, "flask");
      first = false;
      return busy || shake || spinning;
    },
    tick(t, dt) {
      let busy = commonTick(s, t, dt);
      if (shake) {
        shakeT += dt;
        flask.node.position.x = BATH_FLASK.x + Math.sin(shakeT * 2 * Math.PI * 2) * 0.008;
        busy = true;
      }
      if (s.tester.step(dt)) busy = true;
      return busy;
    },
    dispose() {
      flask.dispose();
      pip.dispose();
      dish.dispose();
      cyl.dispose();
      tubes.dispose();
      s.tester.dispose();
    },
  };
}

// ── the room ────────────────────────────────────────────────────────────────

export function buildPharmaceutics(ctx: BBuildContext): BRoomBuild {
  const k = ctx.kit;
  const experiment: ExperimentKey = (EXPERIMENTS as string[]).includes(ctx.experiment) ? (ctx.experiment as ExperimentKey) : "simple-syrup";
  const root = k.node(null);
  const s = buildShared(k, root, experiment);
  const list = s.list;
  const reg = (id: string, label: string, node: TransformNode, o: FocusOpts = {}) => interactive(list, id, label, node, o);
  const exp =
    experiment === "solution-preparation" ? buildSolutionPrep(s, reg)
    : experiment === "liquid-properties" ? buildLiquidProperties(s, reg)
    : experiment === "solubility-dissolution" ? buildSolubilityDissolution(s, reg)
    : buildSyrup(s, reg);
  s.atlas.finish();
  // each experiment starts facing its own zone
  const spawn: Pose = {
    "simple-syrup": { pos: [-0.3, 1.66, 1.75], target: [-0.3, 0.95, -0.25] } as Pose,
    "solution-preparation": { pos: [0.3, 1.62, 2.4], target: [0.0, 1.0, -0.8] } as Pose,
    "liquid-properties": { pos: [2.5, 1.62, -1.5], target: [3.0, 1.0, -3.6] } as Pose,
    "solubility-dissolution": { pos: [2.6, 1.62, -1.0], target: [4.6, 1.05, -1.6] } as Pose,
  }[experiment];
  return {
    root,
    interactives: list,
    colliders: s.colliders,
    bounds: { minX: -5 + 0.35, maxX: 5 - 0.35, minZ: -4 + 0.35, maxZ: 4 - 0.35 },
    spawn,
    casters: [], // no shadow maps in the Virtual Labs (MEMORY 249)
    apply: (raw, t) => exp.apply(raw, t),
    tick: (t, dt) => exp.tick?.(t, dt) ?? false,
    dispose() {
      exp.dispose?.();
      s.sink.dispose();
      s.waste.dispose();
    },
  };
}
