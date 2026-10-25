/**
 * Babylon.js apparatus for the Pharmaceutics room (2026-10-25): the Simple Syrup station
 * ported from the three.js room, and the instruments of the three shortlisted experiments
 * (solution preparation & dilution, physical properties of liquids, solubility &
 * dissolution). Real dimensions in metres; every model is procedural.
 *
 * What a model shows comes only from the experiment's visual object: a level, a reading or
 * a position the engine has already decided. Nothing here computes a result — the few
 * mappings (a heap's size from its mass, a column's height from its temperature) only
 * turn a number the engine produced into a drawing of it.
 *
 * Parts that move or change are tagged `dyn` (or sit under a node tagged dyn), so the
 * runtime's static merge leaves them alone; everything else is merged per material.
 */
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreateLathe } from "@babylonjs/core/Meshes/Builders/latheBuilder";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import type { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { labelCanvas, lcdCanvas } from "../art/canvas";
import { heightForVolume, radiusAt, type Profile } from "../vessel";
import { canvasTexture, dyn, type Kit } from "./kit";

const T = 0.0016; // glass wall thickness
export const inset = (p: Profile, t = T): Profile => p.map(([r, y], i) => [Math.max(0, r - t), i === 0 ? y + t : y]);

/** Tag a node so the static merge leaves every mesh under it alone (it moves or hides). */
export function dynNode<N extends TransformNode>(n: N): N {
  n.metadata = { ...(n.metadata ?? {}), dyn: true };
  return n;
}

/** Transparent liquid: no reflections over its alpha, so a faint tint is not washed out. */
export function liquidMaterial(k: Kit, name: string, hex = "#dcefff", alpha = 0.34) {
  const m = new PBRMaterial(name, k.scene);
  m.albedoColor = Color3.FromHexString(hex).toLinearSpace();
  m.roughness = 0.03;
  m.metallic = 0;
  m.alpha = alpha;
  m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  m.indexOfRefraction = 1.33;
  m.useRadianceOverAlpha = false;
  m.useSpecularOverAlpha = false;
  return m;
}

const sRGB = (rgb: [number, number, number]) => new Color3(rgb[0], rgb[1], rgb[2]).toLinearSpace();

/**
 * A fillable vessel: a shell turned from the outer + inner profile (glass unless another
 * material is given), and a liquid body rebuilt for a volume (or a height) — quantised so
 * a steady stream does not rebuild it every frame. The liquid's level is the height that
 * volume reaches in this inner profile (`heightForVolume`, shared with the other engine).
 */
export function fillable(k: Kit, parent: TransformNode, outer: Profile | null, inner: Profile, o: { shell?: PBRMaterial; hex?: string; alpha?: number; tess?: number } = {}) {
  const tess = o.tess ?? 48;
  const shell = outer ? k.lathe([...outer, ...[...inner].reverse()], o.shell ?? k.m.glass, parent, tess) : null;
  if (shell) shell.alphaIndex = 2;
  const mat = liquidMaterial(k, `liq${parent.uniqueId}`, o.hex, o.alpha);
  let liquid: Mesh | null = null;
  let lastH = -1;
  let surface = inner[0][1];
  const top = inner[inner.length - 1][1];
  const build = (h: number) => {
    const hq = Math.round(h * 20000) / 20000; // 0.05 mm
    if (hq === lastH) return;
    lastH = hq;
    liquid?.dispose();
    liquid = null;
    surface = Math.max(inner[0][1], Math.min(top, hq));
    if (hq <= inner[0][1] + 0.0003) return;
    const pts: Vector3[] = [new Vector3(0, inner[0][1] + 0.0005, 0)];
    for (const [r, y] of inner) {
      if (y >= surface) break;
      pts.push(new Vector3(Math.max(0, r - 0.0004), y + 0.0005, 0));
    }
    pts.push(new Vector3(Math.max(0, radiusAt(inner, surface) - 0.0004), surface, 0), new Vector3(0, surface, 0));
    liquid = CreateLathe(`liquid${parent.uniqueId}`, { shape: pts, tessellation: Math.min(40, tess), sideOrientation: Mesh.DOUBLESIDE }, k.scene);
    liquid.material = mat;
    liquid.parent = parent;
    liquid.isPickable = false;
    liquid.alphaIndex = 1;
    dyn(liquid);
  };
  return {
    shell,
    mat,
    surfaceY: () => surface,
    setVolume(ml: number) {
      build(ml > 0.02 ? heightForVolume(inner, ml) : 0);
    },
    setHeight(h: number) {
      build(h);
    },
    /** sRGB colour and opacity, applied at once (the syrup room's behaviour). */
    setColour(rgb: [number, number, number], alpha: number) {
      mat.albedoColor = sRGB(rgb);
      mat.alpha = alpha;
    },
    dispose() {
      liquid?.dispose();
      mat.dispose();
    },
  };
}
export type Fillable = ReturnType<typeof fillable>;

/** A canvas texture that is redrawn in place when its text changes. */
export function liveTexture(k: Kit, canvas: HTMLCanvasElement, name: string) {
  const tex = canvasTexture(k.scene, canvas, name, k.q);
  k.textures.push(tex);
  return tex;
}

/** A label whose text the experiment decides (solute jar, flask labels): redrawn on change. */
export function liveLabel(k: Kit, w: number, h: number, accent = "#1C7BD9") {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const tex = liveTexture(k, c, `liveLabel${k.scene.textures.length}`);
  const mat = new PBRMaterial(`liveLabelMat${tex.uniqueId}`, k.scene);
  mat.albedoTexture = tex;
  mat.roughness = 0.72;
  let last = "";
  return {
    mat,
    set(title: string, lines: string[]) {
      const key = `${title}|${lines.join("|")}`;
      if (key === last) return;
      last = key;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(labelCanvas(title, lines, { w, h, accent }), 0, 0);
      tex.update(true, false);
    },
  };
}

/** An instrument display: lines of text on a dark ground, redrawn only when they change. */
export function display(k: Kit, w: number, h: number, o: { bg?: string; fg?: string; lines?: number } = {}) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const tex = liveTexture(k, c, `display${k.scene.textures.length}`);
  const mat = new PBRMaterial(`displayMat${tex.uniqueId}`, k.scene);
  mat.albedoTexture = tex;
  mat.unlit = true;
  let last = "";
  const bg = o.bg ?? "#14211b";
  const fg = o.fg ?? "#9df2b8";
  const draw = (lines: string[]) => {
    const key = lines.join("|");
    if (key === last) return false;
    last = key;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fg;
    ctx.textAlign = "right";
    const n = Math.max(1, lines.length);
    const lh = h / n;
    lines.forEach((l, i) => {
      // as large as the line allows, but never wider than the screen
      let size = Math.round(lh * 0.66);
      ctx.font = `600 ${size}px 'Courier New', ui-monospace, monospace`;
      const wide = ctx.measureText(l).width;
      if (wide > w * 0.9) size = Math.floor((size * w * 0.9) / wide);
      ctx.font = `600 ${size}px 'Courier New', ui-monospace, monospace`;
      ctx.fillText(l, w * 0.95, lh * i + lh * 0.5 + size * 0.36);
    });
    tex.update(true, false);
    return true;
  };
  draw([""]);
  return { mat, draw };
}

/** A small printed patch on glassware (white enamel). */
function enamel(k: Kit, parent: TransformNode, r: number, h: number, arc: number, y: number, title: string, lines: string[]) {
  const mat = k.texMat(labelCanvas(title, lines, { w: 384, h: 200, accent: "#5f6b78" }), 0.5);
  return k.labelArc(r + 0.0003, h, arc, mat, parent, y);
}

// ── Weighing ────────────────────────────────────────────────────────────────

/**
 * Analytical balance (0.1 mg) for the Pharmaceutics weighing station: housing, sloped
 * fascia with its own LCD, levelling feet and bubble, pan, and a draught shield. Unlike the
 * chemistry balance it carries no boat of its own: the boat, the pycnometer and the dish
 * are separate pieces of equipment the room stands on `pan`.
 */
export function analyticalBalance(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.22, 0.07, 0.36, m.plasticWhite, g, 0, 0.035, 0);
  k.box(0.22, 0.03, 0.05, m.plasticGrey, g, 0, 0.085, 0.13);
  for (const [x, z] of [[-0.09, -0.15], [0.09, -0.15], [-0.09, 0.15], [0.09, 0.15]]) k.cyl(0.01, 0.012, 0.008, m.plasticDark, g, x, -0.002, z, 12);
  k.cyl(0.008, 0.008, 0.003, m.chrome, g, 0.085, 0.071, -0.12, 16);
  k.cyl(0.006, 0.006, 0.003, m.glass, g, 0.085, 0.0725, -0.12, 16);
  const lcd = lcdCanvas(512, 140);
  const tex = liveTexture(k, lcd.canvas, "pharmBalanceLcd");
  const lcdMat = new PBRMaterial("pharmBalanceLcdMat", k.scene);
  lcdMat.albedoTexture = tex;
  lcdMat.unlit = true;
  // the display on a sloped fascia in FRONT of the housing (nothing overlaps the digits)
  const fascia = k.node(g, 0, 0.09, 0.19);
  fascia.rotation.x = -0.35;
  k.box(0.2, 0.04, 0.006, m.plasticDark, fascia, 0, 0, -0.004);
  dyn(k.panel(0.13, 0.034, lcdMat, fascia, 0, 0, 0.0002));
  for (const [x, mat] of [[-0.085, m.accentBlue], [0.085, m.plasticGrey]] as const) k.cyl(0.008, 0.008, 0.006, mat, fascia, x, 0, 0.002, 16).rotation.x = Math.PI / 2;
  k.cyl(0.045, 0.045, 0.004, m.chrome, g, 0, 0.1, -0.03, 40);
  k.cyl(0.008, 0.008, 0.03, m.chrome, g, 0, 0.085, -0.03, 12);
  k.torus(0.05, 0.003, m.plasticGrey, g, 0, 0.092, -0.03, 40);
  // draught shield: back and front glass, top, frame and sliding side doors
  k.box(0.2, 0.2, 0.004, m.glass, g, 0, 0.19, -0.17);
  k.box(0.2, 0.2, 0.004, m.glass, g, 0, 0.19, 0.08);
  k.box(0.2, 0.004, 0.25, m.glass, g, 0, 0.29, -0.045);
  for (const x of [-0.1, 0.1]) for (const z of [-0.17, 0.08]) k.box(0.008, 0.2, 0.008, m.plasticGrey, g, x, 0.19, z);
  for (const z of [-0.17, 0.08]) k.box(0.2, 0.008, 0.008, m.plasticGrey, g, 0, 0.292, z);
  for (const x of [-0.101, 0.101]) {
    k.box(0.004, 0.19, 0.24, m.glass, g, x, 0.19, -0.045);
    k.box(0.006, 0.05, 0.012, m.plasticGrey, g, x + (x < 0 ? -0.004 : 0.004), 0.19, 0.055);
  }
  return {
    node: g,
    /** Where a weighed item stands, in the balance's own coordinates. */
    pan: new Vector3(0, 0.102, -0.03),
    set(text: string, sub = "") {
      if (lcd.draw(text, sub)) tex.update(true);
    },
  };
}

/** Anti-static weighing boat and the solid heaped on it. */
export function weighingBoat(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  const shell = CreateCylinder("boat", { diameterTop: 0.07, diameterBottom: 0.05, height: 0.012, tessellation: 4, cap: Mesh.CAP_START }, k.scene);
  shell.material = k.m.plasticWhite;
  shell.parent = g;
  shell.position.y = 0.006;
  shell.rotation.y = Math.PI / 4;
  shell.isPickable = false;
  const heap = dyn(k.lathe([[0, 0], [0.018, 0], [0.012, 0.004], [0.005, 0.008], [0, 0.009]], k.m.powderWhite, g, 24));
  heap.position.y = 0.001;
  heap.setEnabled(false);
  return {
    node: g,
    set(grams: number) {
      heap.setEnabled(grams > 0.001);
      heap.scaling.setAll(Math.max(0.3, Math.min(1.4, Math.cbrt(grams))));
    },
  };
}

/** Wide-mouth powder jar with a printed label (static text) — reagents and the syrup's sucrose. */
export function powderJar(k: Kit, parent: TransformNode, labelMat: PBRMaterial | null, o: { r?: number; h?: number; fill?: PBRMaterial; cap?: PBRMaterial } = {}) {
  const r = o.r ?? 0.045;
  const h = o.h ?? 0.13;
  const g = k.node(parent);
  const outer: Profile = [[0, 0], [r - 0.004, 0], [r, 0.006], [r, h - 0.012], [r - 0.006, h - 0.004], [r - 0.008, h]];
  k.lathe([...outer, ...[...inset(outer.slice(0, 5), 0.002)].reverse()], k.m.glass, g, 40).alphaIndex = 2;
  k.lathe([[0, 0.003], [r - 0.003, 0.003], [r - 0.003, h * 0.62], [r * 0.6, h * 0.7], [0, h * 0.72]], o.fill ?? k.m.powderWhite, g, 32);
  k.cyl(r - 0.005, r - 0.005, 0.024, o.cap ?? k.m.plasticWhite, g, 0, h + 0.012, 0, 32);
  if (labelMat) k.labelArc(r + 0.0005, h * 0.45, 2.2, labelMat, g, h * 0.45);
  return g;
}

/** Reagent bottle (glass or amber, narrow neck, screw cap) with a label; the cap can come off. */
export function reagentBottle(k: Kit, parent: TransformNode, labelMat: PBRMaterial | null, o: { amber?: boolean; liquid?: string; scale?: number } = {}) {
  const g = k.node(parent);
  const s = o.scale ?? 1;
  const outer: Profile = [[0, 0], [0.036, 0], [0.04, 0.006], [0.04, 0.13], [0.03, 0.155], [0.015, 0.165], [0.015, 0.18]].map(([r, y]) => [r * s, y * s]) as Profile;
  const v = fillable(k, g, outer, inset(outer.slice(0, 6)), { shell: o.amber ? k.m.amber : k.m.glass, hex: o.liquid ?? "#e4f2ff", alpha: 0.3, tess: 36 });
  v.setVolume(250 * s * s * s * 0.8);
  const cap = dynNode(k.node(g, 0, 0.192 * s, 0));
  k.cyl(0.018 * s, 0.018 * s, 0.028 * s, k.m.plasticDark, cap, 0, 0, 0, 24);
  if (labelMat) k.labelArc(0.0405 * s, 0.075 * s, 2.2, labelMat, g, 0.07 * s);
  return {
    node: g,
    dispose: () => v.dispose(),
    /** Cap off (lying beside the bottle) while the bottle is in use. */
    open(on: boolean) {
      cap.position.set(on ? 0.06 * s : 0, on ? 0.009 * s : 0.192 * s, on ? 0.02 : 0);
      cap.rotation.z = on ? Math.PI / 2 : 0;
    },
  };
}

// ── Glassware ───────────────────────────────────────────────────────────────

/** Griffin beaker of the given capacity, with printed graduations. */
export function beaker(k: Kit, parent: TransformNode, size: 50 | 100 | 150 | 250) {
  const g = k.node(parent);
  const dims = { 50: [0.021, 0.06, 40, 10], 100: [0.025, 0.07, 80, 20], 150: [0.0295, 0.09, 100, 10], 250: [0.035, 0.12, 200, 25] } as const;
  const [r, h, to, minor] = dims[size];
  const outer: Profile = [[0, 0], [r - 0.003, 0], [r, 0.004], [r, h], [r + 0.003, h + 0.003]];
  const inner = inset(outer.slice(0, 4));
  const v = fillable(k, g, outer, inner);
  const gm = k.texMat(gradCanvas({ from: 0, to, minor, major: to / 2 >= 50 ? 50 : 10, labelEvery: to / 2 >= 50 ? 50 : 10, w: 128, h: 512 }), 0.6, true);
  const y0 = heightForVolume(inner, 0.01);
  const yTo = heightForVolume(inner, to);
  const strip = (yTo - y0) * (512 / (512 - 40));
  k.labelArc(r + 0.0004, strip, 0.9, gm, g, (y0 + yTo) / 2);
  const lip = k.box(0.012, 0.004, 0.01, k.m.glass, g, 0, h + 0.002, r + 0.003);
  lip.rotation.x = -0.4;
  return { node: g, r, h, ...v };
}

/** Graduated measuring cylinder (100 or 1000 mL) on a hexagonal foot. */
export function measuringCylinder(k: Kit, parent: TransformNode, capacity: 100 | 1000) {
  const g = k.node(parent);
  const big = capacity === 1000;
  const r = big ? 0.033 : 0.0145;
  const h = big ? 0.41 : 0.26;
  const foot = big ? 0.014 : 0.012;
  const outer: Profile = [[0, foot], [r, foot], [r, h], [r + 0.004, h + 0.004]];
  const inner = inset(outer.slice(0, 3));
  const v = fillable(k, g, outer, inner);
  k.cyl(big ? 0.068 : 0.04, big ? 0.07 : 0.042, foot, k.m.glass, g, 0, foot / 2, 0, 6);
  const y0 = heightForVolume(inner, 0.0001);
  const yFull = heightForVolume(inner, capacity);
  const gh = 2048;
  const gm = k.texMat(gradCanvas({ from: 0, to: capacity, minor: big ? 10 : 1, major: big ? 50 : 5, labelEvery: big ? 100 : 10, w: 128, h: gh }), 0.5, true);
  k.labelArc(r + 0.0004, (yFull - y0) * (gh / (gh - 40)), 1.2, gm, g, (yFull + y0) / 2);
  k.torus(r + 0.0012, 0.0012, k.m.glass, g, 0, h + 0.003, 0, 28);
  return { node: g, ...v };
}

/** Graduation strip that is NOT squeezed: the canvas keeps the strip's own proportions. */
export function gradCanvas(o: { from: number; to: number; minor: number; major: number; labelEvery: number; w: number; h: number; unit?: string }) {
  const c = document.createElement("canvas");
  c.width = o.w;
  c.height = o.h;
  const ctx = c.getContext("2d")!;
  const span = o.to - o.from;
  const steps = Math.round(span / o.minor);
  ctx.fillStyle = "#1b1f26";
  ctx.strokeStyle = "#1b1f26";
  ctx.font = `600 ${Math.round(o.w * 0.24)}px Outfit, Arial, sans-serif`;
  for (let i = 0; i <= steps; i++) {
    const v = o.from + i * o.minor;
    const y = (1 - (v - o.from) / span) * (o.h - 40) + 20;
    const major = Math.abs(v / o.major - Math.round(v / o.major)) < 1e-6;
    ctx.lineWidth = major ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(major ? o.w * 0.45 : o.w * 0.25, y);
    ctx.stroke();
    if (Math.abs(v / o.labelEvery - Math.round(v / o.labelEvery)) < 1e-6) ctx.fillText(String(Math.round(v)), o.w * 0.5, y + o.w * 0.09);
  }
  return c;
}

/** The 100 mL Class A volumetric flask profile (same as the chemistry room's: the mark lies in the neck). */
const VOL_OUTER: Profile = [[0, 0], [0.0227, 0], [0.0262, 0.007], [0.0271, 0.0262], [0.0227, 0.0455], [0.0105, 0.063], [0.0072, 0.07], [0.0072, 0.165], [0.0082, 0.17]];

/**
 * 100 mL Class A volumetric flask: calibration ring at the height that holds exactly 100 mL,
 * a concave meniscus whose LOWEST point is drawn below, at or above the ring exactly as the
 * engine reports it (`FlaskVisual.meniscus`), a PP stopper that can come off, and a label
 * the student writes (text from the experiment).
 */
export function volumetricFlask(k: Kit, parent: TransformNode, labelAccent = "#1C7BD9") {
  const g = k.node(parent);
  const inner = inset(VOL_OUTER.slice(0, 8));
  const v = fillable(k, g, VOL_OUTER, inner, { hex: "#a9d0f2", alpha: 0.5 });
  const markY = heightForVolume(inner, 100);
  const ring = k.torus(0.0074, 0.0006, k.m.plasticDark, g, 0, markY, 0, 40);
  ring.scaling.y = 0.4;
  enamel(k, g, 0.0273, 0.016, 1.0, 0.012, "100 mL  A", ["20 °C  ±0.10 mL"]);
  const rIn = 0.0056; // neck bore
  const bowl = 0.35 * rIn;
  const lm = liquidMaterial(k, `flaskMen${g.uniqueId}`, "#bcd9f2", 0.6);
  const meniscus = dyn(k.sphere(rIn, lm, g, 0, 0, 0, 16, 0.5));
  meniscus.rotation.x = Math.PI;
  meniscus.scaling.y = 0.35;
  meniscus.alphaIndex = 1;
  const band = dyn(k.torus(rIn - 0.0002, 0.0009, k.m.plasticDark, g, 0, 0, 0, 24));
  band.scaling.y = 0.5;
  const stopper = dynNode(k.node(g, 0, 0, 0));
  k.cyl(0.0082, 0.0068, 0.02, k.m.accentBlue, stopper, 0, 0.178, 0, 20);
  k.cyl(0.0105, 0.0105, 0.004, k.m.accentBlue, stopper, 0, 0.189, 0, 20);
  const label = liveLabel(k, 384, 220, labelAccent);
  const labelMesh = dyn(k.labelArc(0.0272, 0.022, 1.5, label.mat, g, 0.03));
  labelMesh.setEnabled(false);
  return {
    node: g,
    markY,
    neckTop: 0.17,
    dispose: v.dispose,
    set(f: { ml: number; meniscus: "empty" | "below" | "at" | "above"; stoppered: boolean; labelled: boolean }, text: string) {
      // The drawing follows the engine's verdict: "at" sits ON the ring, "below"/"above"
      // are drawn visibly off it — never a level that reads differently from the verdict.
      let ml = f.ml;
      if (f.meniscus === "empty") ml = 0;
      else if (f.meniscus === "at") ml = 100;
      else if (f.meniscus === "below") ml = Math.min(ml, 99.85);
      else ml = Math.max(ml, 100.15);
      v.setVolume(ml);
      const h = ml > 0.02 ? heightForVolume(inner, ml) : 0;
      const inNeck = h > 0.071;
      meniscus.setEnabled(inNeck);
      band.setEnabled(inNeck);
      if (inNeck) {
        // the liquid's flat top is at the reading; the bowl dips to it from the wall
        meniscus.position.y = h + bowl;
        band.position.y = h + bowl * 0.5;
      }
      stopper.position.set(f.stoppered ? 0 : 0.045, f.stoppered ? 0 : -0.176, f.stoppered ? 0 : 0.03);
      stopper.rotation.z = f.stoppered ? 0 : Math.PI / 2;
      labelMesh.setEnabled(f.labelled);
      if (f.labelled) label.set(text || "Solution", ["Prepared in the lab", "Volumetric, 100 mL"]);
    },
  };
}

/** 250 mL conical flask with a ground-glass stopper and undissolved solid at the bottom. */
export function stopperedConical(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  const outer: Profile = [[0, 0], [0.04, 0], [0.043, 0.006], [0.04, 0.03], [0.021, 0.105], [0.016, 0.118], [0.016, 0.145], [0.0185, 0.15]];
  const v = fillable(k, g, outer, inset(outer.slice(0, 7)));
  enamel(k, g, 0.0405, 0.016, 0.8, 0.02, "250 mL", ["Borosilicate 3.3"]);
  const stopper = dynNode(k.node(g, 0, 0, 0));
  k.cyl(0.0148, 0.0128, 0.024, k.m.glass, stopper, 0, 0.151, 0, 20);
  k.cyl(0.006, 0.006, 0.012, k.m.glass, stopper, 0, 0.169, 0, 12);
  k.sphere(0.011, k.m.glass, stopper, 0, 0.18, 0, 14).scaling.y = 0.5;
  const solid = dyn(k.lathe([[0, 0], [0.036, 0], [0.026, 0.004], [0.012, 0.007], [0, 0.008]], k.m.powderWhite, g, 28));
  solid.position.y = 0.0018;
  solid.setEnabled(false);
  return {
    node: g,
    dispose: v.dispose,
    set(o: { waterMl: number; solidG: number; stoppered: boolean }) {
      v.setVolume(o.waterMl);
      // the excess solid the student judges saturation by: a clear white heap, growing with the mass
      solid.setEnabled(o.solidG > 0.002);
      const sp = Math.min(1, 0.55 + o.solidG * 0.3);
      solid.scaling.set(sp, Math.min(3, 0.6 + o.solidG * 1.4), sp);
      stopper.position.set(o.stoppered ? 0 : 0.06, o.stoppered ? 0 : -0.15, o.stoppered ? 0 : 0.02);
      stopper.rotation.z = o.stoppered ? 0 : Math.PI / 2;
    },
  };
}

/**
 * 10 mL Class A bulb pipette with a three-valve rubber filler. The liquid is drawn from
 * the volume in the pipette's own bore, so 10 mL reaches the etched ring on the upper stem.
 * `held(true)` stands it upright (tip down) for delivery; otherwise it lies on its side.
 */
export function bulbPipette10(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  const body = dynNode(k.node(g));
  const outer: Profile = [[0.0011, 0], [0.0026, 0.012], [0.0034, 0.115], [0.0078, 0.135], [0.0081, 0.17], [0.0078, 0.205], [0.0035, 0.222], [0.0035, 0.42], [0.0037, 0.425]];
  const inner: Profile = [[0.0005, 0.001], [0.0012, 0.012], [0.0016, 0.115], [0.0062, 0.135], [0.0065, 0.17], [0.0062, 0.205], [0.0021, 0.222], [0.0021, 0.42]];
  const v = fillable(k, body, outer, inner, { hex: "#bcd9f2", alpha: 0.55, tess: 20 });
  const markY = heightForVolume(inner, 10);
  k.torus(0.0036, 0.0005, m.plasticDark, body, 0, markY, 0, 20).scaling.y = 0.6;
  k.torus(0.0081, 0.0007, m.accentBlue, body, 0, 0.17, 0, 24); // colour-code band (10 mL)
  k.sphere(0.02, m.rubberRed, body, 0, 0.475, 0, 18);
  k.cyl(0.0055, 0.0055, 0.035, m.rubberRed, body, 0, 0.44, 0, 12);
  k.cyl(0.0055, 0.0075, 0.028, m.rubberRed, body, 0, 0.502, 0, 12);
  k.sphere(0.006, m.rubberRed, body, 0.009, 0.43, 0, 10);
  return {
    node: g,
    markY,
    dispose: v.dispose,
    setVolume: v.setVolume,
    /** Upright for delivery (tip at the node's origin), or lying along x on the bench. */
    held(on: boolean) {
      body.rotation.z = on ? 0 : -Math.PI / 2;
      body.position.set(on ? 0 : -0.24, on ? 0 : 0.012, 0);
    },
  };
}

/** A grey pipette rack (two saddles) for a pipette lying along x. */
export function pipetteRack(k: Kit, parent: TransformNode, len = 0.5) {
  const g = k.node(parent);
  k.box(len, 0.012, 0.05, k.m.plasticGrey, g, 0, 0.006, 0);
  for (const x of [-len * 0.35, len * 0.35]) k.box(0.02, 0.02, 0.045, k.m.plasticGrey, g, x, 0.016, 0);
  return g;
}

export function glassRod(k: Kit, parent: TransformNode, len = 0.25) {
  return k.cyl(0.003, 0.003, len, k.m.glass, parent, 0, 0, 0, 12);
}

export function glassFunnel(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  k.lathe([[0.0035, 0], [0.004, 0.045], [0.006, 0.048], [0.034, 0.088], [0.0355, 0.09]], k.m.glass, g, 32);
  return g;
}

export function spatula(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.16, 0.002, 0.008, m.steel, g, 0, 0.002, 0);
  k.box(0.025, 0.0015, 0.012, m.steel, g, 0.09, 0.002, 0);
  k.box(0.07, 0.008, 0.012, m.plasticDark, g, -0.11, 0.005, 0);
  return g;
}

export function washBottle(k: Kit, parent: TransformNode, labelMat: PBRMaterial | null = null) {
  const { m } = k;
  const g = k.node(parent);
  k.lathe([[0, 0], [0.034, 0], [0.036, 0.008], [0.036, 0.14], [0.028, 0.158], [0.016, 0.163]], m.ldpe, g, 32);
  k.cyl(0.018, 0.018, 0.022, m.plasticWhite, g, 0, 0.172, 0, 20);
  k.tube([[0, 0.18, 0], [0, 0.205, 0], [0.012, 0.222, 0], [0.05, 0.226, 0], [0.072, 0.21, 0]], 0.0025, m.plasticWhite, g, 8);
  if (labelMat) k.labelArc(0.0365, 0.05, 2, labelMat, g, 0.08);
  return g;
}

/** Glass thermometer (0–110 °C): red spirit column whose top stands at the temperature. */
export function thermometer(k: Kit, parent: TransformNode, scaleMat?: PBRMaterial) {
  const g = k.node(parent);
  k.cyl(0.0035, 0.0035, 0.28, k.m.glass, g, 0, 0.14, 0, 12);
  k.sphere(0.0045, k.m.red, g, 0, 0.003, 0, 12);
  const column = dyn(k.cyl(0.0011, 0.0011, 1, k.m.red, g, 0, 0, 0, 8));
  if (scaleMat) k.labelArc(0.0037, 0.11 * 2.2 * (512 / 472), 1.2, scaleMat, g, 0.02 + 55 * 0.0022);
  return {
    node: g,
    /** 0 °C at 20 mm, 100 °C at 240 mm — the scale printed on the stem uses the same rule. */
    set(tempC: number) {
      const h = 0.02 + Math.max(0, Math.min(110, tempC)) * 0.0022;
      column.scaling.y = h;
      column.position.y = h / 2;
    },
  };
}

/** Porcelain evaporating dish (tared): the solution in it and the residue left after drying. */
export function evaporatingDish(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  const outer: Profile = [[0, 0], [0.024, 0], [0.034, 0.006], [0.041, 0.018], [0.045, 0.03], [0.046, 0.034]];
  const inner: Profile = [[0, 0.003], [0.022, 0.003], [0.031, 0.008], [0.038, 0.019], [0.0425, 0.031], [0.043, 0.034]];
  const v = fillable(k, g, outer, inner, { shell: k.m.tileWhite, hex: "#d6ebfa", alpha: 0.5, tess: 36 });
  k.box(0.01, 0.004, 0.012, k.m.tileWhite, g, 0.046, 0.032, 0); // pouring lip
  const residue = dyn(k.lathe([[0, 0], [0.026, 0], [0.018, 0.0015], [0, 0.002]], k.m.powderWhite, g, 28));
  residue.position.y = 0.0032;
  residue.setEnabled(false);
  return {
    node: g,
    dispose: v.dispose,
    set(ml: number, residueG: number) {
      v.setVolume(ml);
      residue.setEnabled(residueG > 0.0005);
      residue.scaling.set(Math.min(1.2, 0.5 + residueG * 2), Math.min(3, 0.6 + residueG * 6), Math.min(1.2, 0.5 + residueG * 2));
    },
  };
}

// ── Physical properties of liquids ─────────────────────────────────────────

/**
 * 25 mL pycnometer (Gay-Lussac specific-gravity bottle) with a ground stopper bored by a
 * capillary — filled to the top, the excess leaves through the bore. Drops on the outside
 * show it has not been wiped dry.
 */
export function pycnometer(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  const outer: Profile = [[0, 0], [0.017, 0], [0.019, 0.004], [0.02, 0.03], [0.017, 0.05], [0.008, 0.062], [0.0055, 0.066], [0.0055, 0.078], [0.0062, 0.08]];
  const inner = inset(outer.slice(0, 8), 0.0013);
  const v = fillable(k, g, outer, inner, { hex: "#d9ecfb", alpha: 0.4, tess: 36 });
  enamel(k, g, 0.02, 0.012, 0.9, 0.017, "25 mL", ["Pycnometer"]);
  const stopper = dynNode(k.node(g));
  k.cyl(0.0058, 0.0048, 0.022, k.m.glass, stopper, 0, 0.085, 0, 18);
  k.cyl(0.0068, 0.0068, 0.004, k.m.glass, stopper, 0, 0.098, 0, 18);
  k.cyl(0.0006, 0.0006, 0.026, k.m.plasticDark, stopper, 0, 0.087, 0, 6); // the capillary bore
  const drops = dynNode(k.node(g));
  for (const [a, y] of [[0.4, 0.02], [1.6, 0.035], [2.5, 0.012], [3.6, 0.03], [4.8, 0.022], [5.5, 0.04]]) k.sphere(0.0016, k.m.water, drops, Math.cos(a) * 0.0198, y, Math.sin(a) * 0.0198, 8);
  const tints: Record<string, [string, number]> = { "sample-water": ["#dcefff", 0.38], "sample-ethanol": ["#eef6ff", 0.32], "sample-glycerol": ["#f4efd8", 0.5] };
  return {
    node: g,
    dispose: v.dispose,
    set(o: { content: string; stoppered: boolean; dried: boolean }) {
      const full = o.content !== "empty";
      v.setHeight(full ? 0.08 : 0);
      if (full) {
        const [hex, a] = tints[o.content] ?? tints["sample-water"];
        v.mat.albedoColor = Color3.FromHexString(hex).toLinearSpace();
        v.mat.alpha = a;
      }
      stopper.position.set(o.stoppered ? 0 : 0.035, o.stoppered ? 0 : -0.079, o.stoppered ? 0 : 0.015);
      stopper.rotation.z = o.stoppered ? 0 : Math.PI / 2;
      drops.setEnabled(full && !o.dried);
    },
  };
}

/**
 * Ostwald U-tube viscometer. Left arm: capillary, then the timing bulb between two etched
 * marks; right arm: the wide tube with the lower reservoir bulb. `level` 0 puts the
 * meniscus just above the upper mark (drawn up), 1 just below the lower mark.
 */
export function ostwaldViscometer(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  const L = -0.016;
  const R = 0.016;
  const left = k.node(g, L, 0, 0);
  const leftOuter: Profile = [[0.0034, 0.03], [0.0034, 0.112], [0.0042, 0.12], [0.0086, 0.13], [0.0086, 0.168], [0.0042, 0.178], [0.0034, 0.186], [0.0034, 0.3]];
  const leftInner: Profile = [[0.0007, 0.03], [0.0007, 0.112], [0.0028, 0.12], [0.0072, 0.13], [0.0072, 0.168], [0.0028, 0.178], [0.0026, 0.186], [0.0026, 0.3]];
  k.lathe([...leftOuter, ...[...leftInner].reverse()], m.glass, left, 24).alphaIndex = 2;
  const UPPER = 0.183;
  const LOWER = 0.116;
  for (const y of [UPPER, LOWER]) k.torus(0.0037, 0.0006, m.plasticDark, left, 0, y, 0, 20).scaling.y = 0.5;
  // the U-bend and the wide arm with its reservoir bulb
  k.tube([[L, 0.032, 0], [L, 0.014, 0], [L * 0.5, 0.004, 0], [0, 0.002, 0], [R * 0.5, 0.004, 0], [R, 0.014, 0], [R, 0.026, 0]], 0.0034, m.glass, g, 12);
  k.sphere(0.0135, m.glass, g, R, 0.045, 0, 20);
  k.cyl(0.0055, 0.0055, 0.235, m.glass, g, R, 0.18, 0, 20, { cap: false });
  k.cyl(0.0058, 0.0058, 0.022, m.rubber, g, R, 0.255, 0, 16); // where the clamp holds it
  enamel(k, g, 0.0057, 0.03, 1.6, 0.21, "Ostwald", ["U-tube"]);
  // liquid: the charge sits in the reservoir; the left arm fills to `level`
  const lm = liquidMaterial(k, `visc${g.uniqueId}`, "#b7d6f3", 0.62);
  const reservoir = dyn(k.sphere(0.0118, lm, g, R, 0.042, 0, 16));
  reservoir.scaling.y = 0.75;
  const bend = dyn(k.tube([[L, 0.032, 0], [L, 0.014, 0], [L * 0.5, 0.004, 0], [0, 0.002, 0], [R * 0.5, 0.004, 0], [R, 0.014, 0], [R, 0.03, 0]], 0.0018, lm, g, 8));
  const col = fillable(k, left, null, leftInner, { hex: "#b7d6f3", alpha: 0.62, tess: 20 });
  const band = dyn(k.torus(0.0026, 0.0007, m.plasticDark, left, 0, 0, 0, 16));
  band.scaling.y = 0.5;
  return {
    node: g,
    clampY: 0.255,
    dispose() {
      col.dispose();
      lm.dispose();
    },
    set(o: { charged: boolean; level: number }) {
      reservoir.setEnabled(o.charged);
      bend.setEnabled(o.charged);
      // contract: level 0.1 is the upper mark, 0.9 the lower mark (0 above it, 1 drained below)
      const y = UPPER + ((Math.max(0, Math.min(1, o.level)) - 0.1) / 0.8) * (LOWER - UPPER);
      col.setHeight(o.charged ? y : 0);
      band.setEnabled(o.charged);
      band.position.y = y;
      const r = radiusAt(leftInner, y);
      band.scaling.x = band.scaling.z = Math.max(0.3, r / 0.0026);
    },
  };
}

/** A millimetre scale canvas whose proportions match the plate it is printed on. */
export function mmScaleCanvas(toMm: number, w: number, h: number, margin: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fbfaf4";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#16181d";
  ctx.strokeStyle = "#16181d";
  ctx.font = `700 ${Math.round(w * 0.2)}px Outfit, Arial, sans-serif`;
  for (let mm = 0; mm <= toMm; mm++) {
    const y = h - margin - (mm / toMm) * (h - 2 * margin);
    const major = mm % 5 === 0;
    ctx.lineWidth = mm % 10 === 0 ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(mm % 10 === 0 ? w * 0.42 : major ? w * 0.3 : w * 0.18, y);
    ctx.stroke();
    if (mm % 10 === 0) ctx.fillText(String(mm), w * 0.48, y + w * 0.07);
  }
  ctx.font = `600 ${Math.round(w * 0.13)}px Outfit, Arial, sans-serif`;
  ctx.fillText("mm", w * 0.55, margin * 0.75);
  return c;
}

/**
 * Capillary-rise apparatus: a stand with a sliding millimetre scale and a glass capillary
 * clipped in front of it. The scale's 0 is set to the liquid surface in the beaker below,
 * so the top of the drawn column stands exactly at `riseMm` on the scale.
 */
export function capillaryRise(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.13, 0.012, 0.13, m.darkMetal, g, 0, 0.006, 0);
  k.cyl(0.005, 0.005, 0.3, m.chrome, g, 0, 0.162, -0.05, 12);
  k.box(0.04, 0.02, 0.025, m.darkMetal, g, 0, 0.24, -0.04); // boss holding the scale carrier
  const TO = 50;
  const W = 0.024;
  const PX_W = 256;
  const PX_H = 1600;
  const MARGIN = 40;
  const L = TO / 1000;
  const H = (L * PX_H) / (PX_H - 2 * MARGIN);
  const scale = dynNode(k.node(g, 0, 0, -0.024));
  k.box(W + 0.004, H + 0.004, 0.004, m.plasticGrey, scale, 0, 0, -0.003);
  k.cyl(0.002, 0.002, 0.25, m.chrome, scale, 0, H / 2 + 0.125, -0.006, 8); // carrier rod through the boss
  k.panel(W, H, k.texMat(mmScaleCanvas(TO, PX_W, PX_H, MARGIN), 0.6), scale, 0, 0, 0);
  const zeroLocal = -H / 2 + MARGIN * (H / PX_H); // the 0 mm line, relative to the plate centre
  // the holder (scale + capillary) pivots about the point where the tube meets the surface,
  // so a holder that is not set vertical leans as a whole
  const tilt = dynNode(k.node(g, 0.004, 0, -0.016));
  scale.parent = tilt;
  scale.position.set(-0.004, 0, -0.008);
  // the capillary in two clips, just in front of the scale
  const tube = dynNode(k.node(tilt, 0, 0, 0));
  k.cyl(0.0014, 0.0014, 0.11, m.glass, tube, 0, 0.055, 0, 10, { cap: false });
  for (const y of [0.075, 0.1]) k.box(0.012, 0.004, 0.006, m.plasticDark, tube, 0, y, -0.003);
  const lm = liquidMaterial(k, `capCol${g.uniqueId}`, "#7fb4e6", 0.85);
  const column = dyn(k.cyl(0.0007, 0.0007, 1, lm, tube, 0, 0, 0, 8));
  const band = dyn(k.torus(0.0008, 0.0004, m.plasticDark, tube, 0, 0, 0, 10));
  return {
    node: g,
    /** Where the beaker stands on the base. */
    beakerSpot: new Vector3(0.004, 0.012, -0.016),
    dispose: () => lm.dispose(),
    /** `surfaceY`: the liquid surface in the stand's own coordinates (null: no beaker under it). */
    set(o: { dipped: boolean; riseMm: number; surfaceY: number | null; tiltDeg?: number }) {
      const s = o.surfaceY ?? 0.06;
      const a = ((o.tiltDeg ?? 0) * Math.PI) / 180;
      tilt.position.y = s;
      tilt.rotation.z = -a;
      scale.position.y = -zeroLocal; // 0 mm on the liquid surface
      // dipped: the open end 8 mm below the surface; raised: 20 mm above it
      tube.position.y = o.dipped && o.surfaceY !== null ? -0.008 : 0.02;
      // riseMm is the true VERTICAL rise; along a leaning tube the column is longer
      const rise = o.dipped && o.surfaceY !== null ? Math.max(0, o.riseMm) / 1000 / Math.max(0.2, Math.cos(a)) : 0;
      const bottom = 0.0; // the tube's open end, tube-local
      const topLocal = -tube.position.y + rise; // surface + rise, tube-local
      const show = o.dipped && o.surfaceY !== null;
      column.setEnabled(show);
      band.setEnabled(show && rise > 0.0005);
      if (show) {
        const len = Math.max(0.0005, topLocal - bottom);
        column.scaling.y = len;
        column.position.y = bottom + len / 2;
        band.position.y = topLocal;
      }
    },
  };
}

/**
 * Thermostatic water bath of the viscometry kind: glass-walled, so the timing marks of a
 * viscometer (and a flask's contents) can be watched through the side, on a steel base
 * with a stainless frame, the controller at its right-hand end showing the bath
 * temperature, and a support rod with clamps at the back. Anchors are bath-local.
 */
export function waterBath(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  const W = 0.5;
  const D = 0.3;
  const H = 0.27;
  k.box(W + 0.02, 0.025, D + 0.02, m.steel, g, 0, 0.0125, 0);
  k.box(W - 0.01, 0.006, D - 0.01, m.brushed, g, 0, 0.028, 0); // tank floor
  for (const [w, d, x, z] of [[W, 0.006, 0, -D / 2], [W, 0.006, 0, D / 2], [0.006, D, -W / 2, 0], [0.006, D, W / 2, 0]] as const) {
    const pane = k.box(w, H - 0.025, d, m.glass, g, x, 0.025 + (H - 0.025) / 2, z);
    pane.alphaIndex = 3;
  }
  for (const x of [-W / 2, W / 2]) for (const z of [-D / 2, D / 2]) k.box(0.014, H, 0.014, m.steel, g, x, H / 2, z);
  k.box(W + 0.014, 0.012, 0.014, m.steel, g, 0, H, -D / 2);
  k.box(W + 0.014, 0.012, 0.014, m.steel, g, 0, H, D / 2);
  for (const x of [-W / 2, W / 2]) k.box(0.014, 0.012, D, m.steel, g, x, H, 0);
  const water = k.box(W - 0.012, 0.002, D - 0.012, liquidMaterial(k, "bathSurface", "#bfe0f6", 0.28), g, 0, H - 0.035, 0);
  water.alphaIndex = 1;
  k.box(W - 0.014, H - 0.065, D - 0.014, liquidMaterial(k, "bathBody", "#cfe8f8", 0.1), g, 0, 0.03 + (H - 0.065) / 2, 0).alphaIndex = 0;
  k.box(0.05, 0.012, D - 0.04, m.steel, g, W / 2 - 0.04, 0.05, 0); // heater/stirrer guard
  // controller at the right-hand end, facing the student
  const panel = k.node(g, W / 2 + 0.07, 0, 0);
  k.box(0.13, 0.3, D, m.plasticWhite, panel, 0, 0.15, 0);
  k.box(0.13, 0.012, D, m.accentBlue, panel, 0, 0.3, 0);
  const disp = display(k, 384, 128);
  dyn(k.panel(0.1, 0.034, disp.mat, panel, 0, 0.23, D / 2 + 0.001));
  k.cyl(0.014, 0.014, 0.012, m.plasticDark, panel, -0.025, 0.16, D / 2 + 0.006, 20).rotation.x = Math.PI / 2;
  k.box(0.012, 0.012, 0.004, m.accentGreen, panel, 0.03, 0.17, D / 2 + 0.002);
  k.box(0.012, 0.012, 0.004, m.red, panel, 0.03, 0.15, D / 2 + 0.002);
  // support rod and cross-bar at the back
  k.cyl(0.006, 0.006, 0.55, m.chrome, g, -0.17, 0.3, -D / 2 - 0.02, 12);
  k.box(0.38, 0.01, 0.01, m.chrome, g, 0, 0.47, -D / 2 - 0.02);
  return {
    node: g,
    waterY: H - 0.035,
    floorY: 0.031,
    /** bath-local anchors */
    viscometer: new Vector3(-0.15, 0.04, -0.03),
    thermometer: new Vector3(0.17, 0.06, -0.09),
    flask: new Vector3(0.07, 0.031, 0.02),
    set(tempC: number) {
      disp.draw([`${tempC.toFixed(1)} °C`]);
    },
    off() {
      disp.draw(["OFF"]);
    },
  };
}

/** Clamp holding a vertical tube at a given height (static, part of a stand or the bath). */
export function tubeClamp(k: Kit, parent: TransformNode, x: number, y: number, z: number, reach = 0.05) {
  const { m } = k;
  const c = k.node(parent, x, y, z);
  k.box(0.022, 0.022, 0.022, m.darkMetal, c, 0, 0, -reach);
  const arm = k.cyl(0.004, 0.004, reach, m.chrome, c, 0, 0, -reach / 2, 10);
  arm.rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) {
    k.box(0.005, 0.02, 0.02, m.accentBlue, c, s * 0.009, 0, 0);
    k.box(0.002, 0.016, 0.014, m.rubber, c, s * 0.0065, 0, 0);
  }
  return c;
}

/** Retort stand with a clamp at `clampY`, for the viscometer when it is out of the bath. */
export function smallStand(k: Kit, parent: TransformNode, clampY: number) {
  const g = k.node(parent);
  k.box(0.14, 0.012, 0.2, k.m.enamel, g, 0, 0.006, -0.04);
  k.cyl(0.0055, 0.0055, 0.5, k.m.chrome, g, 0, 0.26, -0.1, 12);
  tubeClamp(k, g, 0, clampY, -0.05, 0.05);
  return g;
}

/** Digital stopwatch: case, lanyard loop, buttons and a display that reads m:ss.s. */
export function stopwatch(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  const face = k.node(g, 0, 0.026, 0);
  face.rotation.x = -Math.PI / 2 + 0.5; // propped on its stand, face up toward the student
  k.box(0.064, 0.078, 0.016, m.plasticDark, face, 0, 0, 0);
  k.box(0.056, 0.07, 0.002, m.accentBlue, face, 0, 0, 0.0085);
  const disp = display(k, 384, 160, { bg: "#cfd8c6", fg: "#141814" });
  dyn(k.panel(0.048, 0.022, disp.mat, face, 0, 0.012, 0.0098));
  for (const [x, mat] of [[-0.016, m.plasticWhite], [0.016, m.red]] as const) k.cyl(0.006, 0.006, 0.004, mat, face, x, -0.02, 0.01, 14).rotation.x = Math.PI / 2;
  k.torus(0.008, 0.002, m.chrome, face, 0, 0.044, 0, 14).rotation.x = Math.PI / 2;
  const dot = dyn(k.box(0.004, 0.004, 0.001, m.red, face, -0.018, 0.026, 0.0102));
  return {
    node: g,
    set(running: boolean, seconds: number) {
      const s = Math.max(0, seconds);
      const min = Math.floor(s / 60);
      disp.draw([`${min}:${(s - min * 60).toFixed(1).padStart(4, "0")}`]);
      dot.setEnabled(running);
    },
  };
}

// ── Solubility and dissolution ─────────────────────────────────────────────

/**
 * Single-vessel paddle dissolution tester (USP apparatus 2 layout): heated bath, a
 * hemispherical-bottomed 1000 mL vessel, the paddle 25 mm above the bottom turning at the
 * set speed while running, the head's display (temperature, speed, time) and the tablet
 * at the bottom shrinking with the fraction still undissolved.
 */
export function dissolutionTester(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.44, 0.08, 0.5, m.plasticWhite, g, 0, 0.04, 0);
  k.box(0.44, 0.012, 0.5, m.plasticGrey, g, 0, 0.084, 0);
  // acrylic bath
  const acrylic = k.box(0.38, 0.2, 0.38, m.glass, g, 0, 0.19, 0.03);
  acrylic.alphaIndex = 3;
  k.box(0.37, 0.17, 0.37, liquidMaterial(k, "testerBath", "#cfe8f8", 0.16), g, 0, 0.175, 0.03).alphaIndex = 1;
  // vessel plate
  const plate = k.node(g, 0, 0.29, 0.03);
  for (const [w, d, x, z] of [[0.4, 0.13, 0, 0.135], [0.4, 0.13, 0, -0.135], [0.135, 0.14, 0.133, 0], [0.135, 0.14, -0.133, 0]]) k.box(w, 0.012, d, m.plasticWhite, plate, x, 0, z);
  // the 1000 mL vessel, hanging from its flange in the plate
  const vesselNode = k.node(g, 0, 0.29 - 0.185, 0.03);
  const outer: Profile = [[0, 0], [0.0193, 0.0038], [0.0354, 0.0146], [0.0462, 0.0309], [0.05, 0.05], [0.05, 0.185], [0.06, 0.188], [0.06, 0.192]];
  const v = fillable(k, vesselNode, outer, inset(outer.slice(0, 6), 0.002), { hex: "#a8cdef", alpha: 0.5 });
  // column and head
  k.box(0.07, 0.62, 0.07, m.plasticWhite, g, 0, 0.39, -0.21);
  const head = k.node(g, 0, 0.66, -0.05);
  k.box(0.36, 0.11, 0.33, m.plasticWhite, head, 0, 0, 0);
  k.box(0.36, 0.012, 0.33, m.accentBlue, head, 0, -0.06, 0);
  const fascia = k.node(head, 0, 0.0, 0.168);
  const disp = display(k, 512, 220);
  dyn(k.panel(0.16, 0.068, disp.mat, fascia, -0.06, 0.004, 0.0006));
  for (let i = 0; i < 4; i++) k.box(0.018, 0.012, 0.004, i === 0 ? m.accentGreen : m.plasticGrey, fascia, 0.06 + (i % 2) * 0.03, 0.018 - Math.floor(i / 2) * 0.026, 0.002);
  // paddle: shaft from the head down to 25 mm above the vessel's bottom
  const bottomY = 0.29 - 0.185 + 0.002;
  const bladeBottom = bottomY + 0.025;
  const paddle = dynNode(k.node(g, 0, 0, 0.03));
  const shaftTop = 0.6;
  k.cyl(0.0048, 0.0048, shaftTop - (bladeBottom + 0.019), m.steel, paddle, 0, (shaftTop + bladeBottom + 0.019) / 2, 0, 12);
  k.box(0.075, 0.019, 0.004, m.plasticDark, paddle, 0, bladeBottom + 0.0095, 0); // PTFE-coated blade
  k.cyl(0.009, 0.009, 0.012, m.chrome, g, 0, 0.6, 0.03, 14); // chuck
  // temperature probe
  k.cyl(0.003, 0.003, 0.16, m.steel, g, 0.035, 0.2, 0.055, 8);
  const tablet = dyn(k.cyl(0.005, 0.005, 0.0045, k.m.powderWhite, g, 0, bottomY + 0.0026, 0.03, 18));
  tablet.setEnabled(false);
  let spin = 0;
  let omega = 0;
  return {
    node: g,
    dispose: v.dispose,
    set(o: { mediumMl: number; tempC: number; rpm: number; running: boolean; tabletIn: boolean; remaining: number; elapsedMin: number }) {
      v.setVolume(o.mediumMl);
      disp.draw([`${o.tempC.toFixed(1)} °C`, `${Math.round(o.rpm)} rpm`, `${o.elapsedMin.toFixed(1)} min`]);
      const rem = Math.max(0, Math.min(1, o.remaining));
      tablet.setEnabled(o.tabletIn && rem > 0.004);
      const s = Math.cbrt(rem);
      tablet.scaling.set(s, Math.max(0.2, s), s);
      omega = o.running ? (o.rpm * Math.PI * 2) / 60 : 0;
      return omega > 0;
    },
    off() {
      disp.draw(["", "STANDBY", ""]);
      omega = 0;
    },
    step(dt: number) {
      if (!omega) return false;
      spin = (spin + omega * dt) % (Math.PI * 2);
      paddle.rotation.y = spin;
      return true;
    },
  };
}

/** UV–Vis spectrophotometer: body, sloped display, keypad and a sample compartment with a lid. */
export function spectrophotometer(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.44, 0.15, 0.36, m.plasticWhite, g, 0, 0.075, 0);
  k.box(0.44, 0.01, 0.36, m.plasticGrey, g, 0, 0.005, 0);
  // display and keypad on the front face
  const fascia = k.node(g, -0.08, 0.08, 0.18);
  k.box(0.24, 0.085, 0.004, m.plasticDark, fascia, 0, 0, 0.002);
  const disp = display(k, 512, 200, { bg: "#0f1f2e", fg: "#a8dcff" });
  dyn(k.panel(0.12, 0.047, disp.mat, fascia, -0.045, 0.008, 0.0085));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) k.box(0.016, 0.012, 0.004, r === 2 && c === 2 ? m.accentGreen : m.plasticGrey, fascia, 0.045 + c * 0.022, 0.025 - r * 0.02, 0.009);
  // sample compartment
  k.box(0.13, 0.004, 0.13, m.plasticDark, g, 0.13, 0.152, -0.02);
  k.box(0.022, 0.03, 0.022, m.darkMetal, g, 0.13, 0.137, -0.02); // cell holder
  const lid = k.node(g, 0.13, 0.152, -0.085);
  lid.rotation.x = -1.2;
  k.box(0.14, 0.012, 0.14, m.plasticGrey, lid, 0, 0.006, 0.07);
  return {
    node: g,
    cell: new Vector3(0.13, 0.122, -0.02),
    set(cuvetteIn: boolean, reading: number | null) {
      disp.draw(cuvetteIn && reading !== null ? ["Abs", reading.toFixed(3)] : cuvetteIn ? ["Abs", "-----"] : ["Insert", "cell"]);
    },
    off() {
      disp.draw(["", "STANDBY"]);
    },
  };
}

/** Quartz cuvette, 10 mm path, with frosted sides and its liquid. */
export function cuvette(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  k.box(0.0125, 0.045, 0.0125, k.m.glass, g, 0, 0.0225, 0).alphaIndex = 2;
  for (const s of [-1, 1]) k.box(0.0006, 0.04, 0.0124, k.m.plasticWhite, g, s * 0.0063, 0.024, 0);
  k.box(0.0104, 0.03, 0.0104, k.m.water, g, 0, 0.017, 0).alphaIndex = 1;
  k.box(0.014, 0.006, 0.014, k.m.plasticDark, g, 0, 0.048, 0);
  return g;
}

/** Bench-top drying oven: cabinet, glazed door, shelf, controller display. */
export function dryingOven(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  const W = 0.56;
  const H = 0.52;
  const D = 0.5;
  k.box(W, H, 0.02, m.plasticWhite, g, 0, H / 2, -D / 2 + 0.01);
  for (const s of [-1, 1]) k.box(0.02, H, D, m.plasticWhite, g, (s * (W - 0.02)) / 2, H / 2, 0);
  k.box(W, 0.03, D, m.plasticWhite, g, 0, 0.015, 0);
  k.box(W, 0.03, D, m.plasticWhite, g, 0, H - 0.015, 0);
  k.box(W - 0.04, H - 0.06, 0.004, m.steel, g, 0, H / 2, -D / 2 + 0.024); // steel liner
  k.box(W - 0.06, 0.004, D - 0.08, m.chrome, g, 0, 0.2, -0.01); // wire shelf
  for (const x of [-0.18, -0.06, 0.06, 0.18]) k.box(0.003, 0.004, D - 0.08, m.steel, g, x, 0.203, -0.01);
  // door: frame and window, controller strip below
  const door = k.node(g, 0, 0, D / 2);
  k.box(W, 0.1, 0.03, m.plasticWhite, door, 0, 0.47, 0.015);
  k.box(W, 0.16, 0.03, m.plasticWhite, door, 0, 0.11, 0.015);
  for (const s of [-1, 1]) k.box(0.08, 0.26, 0.03, m.plasticWhite, door, s * (W / 2 - 0.04), 0.32, 0.015);
  k.box(W - 0.16, 0.26, 0.006, m.glass, door, 0, 0.32, 0.02);
  k.box(0.02, 0.18, 0.025, m.steel, door, W / 2 - 0.015, 0.32, 0.045);
  const disp = display(k, 384, 128, { bg: "#1a1f26", fg: "#ffb37a" });
  dyn(k.panel(0.1, 0.034, disp.mat, door, -0.12, 0.1, 0.031));
  k.cyl(0.014, 0.014, 0.012, m.plasticDark, door, 0.06, 0.1, 0.034, 18).rotation.x = Math.PI / 2;
  k.box(0.01, 0.01, 0.004, m.red, door, 0.12, 0.1, 0.032);
  return {
    node: g,
    shelf: new Vector3(0, 0.204, 0.02),
    set(tempC: number) {
      disp.draw([`${Math.round(tempC)} °C`]);
    },
    off() {
      disp.draw(["OFF"]);
    },
  };
}

/** Plastic syringe with a membrane filter at the tip; the plunger and liquid follow the volume. */
export function filterSyringe(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  const body = k.node(g, 0, 0.012, 0);
  body.rotation.z = -Math.PI / 2; // lying along +x, tip toward +x
  const barrel = k.cyl(0.0085, 0.0085, 0.085, m.ldpe, body, 0, 0.0425, 0, 18, { cap: false });
  barrel.alphaIndex = 2;
  k.box(0.034, 0.003, 0.014, m.ldpe, body, 0, 0.001, 0); // finger flange
  k.cyl(0.002, 0.0035, 0.012, m.ldpe, body, 0, 0.091, 0, 10);
  k.cyl(0.0125, 0.0125, 0.008, m.plasticWhite, body, 0, 0.101, 0, 22); // 25 mm membrane filter
  k.cyl(0.0015, 0.0025, 0.012, m.plasticWhite, body, 0, 0.111, 0, 8);
  const plunger = dynNode(k.node(body));
  k.cyl(0.0078, 0.0078, 0.006, m.rubber, plunger, 0, 0, 0, 16);
  k.box(0.003, 0.09, 0.012, m.plasticWhite, plunger, 0, -0.045, 0);
  k.cyl(0.011, 0.011, 0.003, m.plasticWhite, plunger, 0, -0.09, 0, 16);
  const liquid = dyn(k.cyl(0.0078, 0.0078, 1, liquidMaterial(k, `syr${g.uniqueId}`, "#cfe5f8", 0.55), body, 0, 0, 0, 14));
  const FULL = 0.075; // 10 mL of barrel
  return {
    node: g,
    set(ml: number) {
      const len = Math.max(0, Math.min(10, ml)) * (FULL / 10);
      plunger.position.y = 0.083 - len;
      liquid.setEnabled(len > 0.0005);
      liquid.scaling.y = Math.max(0.0005, len);
      liquid.position.y = 0.083 - len / 2;
    },
  };
}

/** Dissolution sampling syringe: 20 mL barrel, long stainless cannula and a cannula filter. */
export function samplingSyringe(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  const body = k.node(g, 0, 0.012, 0);
  body.rotation.z = -Math.PI / 2;
  k.cyl(0.0105, 0.0105, 0.09, m.ldpe, body, 0, 0.045, 0, 18, { cap: false }).alphaIndex = 2;
  k.box(0.04, 0.003, 0.016, m.ldpe, body, 0, 0.001, 0);
  k.cyl(0.0098, 0.0098, 0.006, m.rubber, body, 0, 0.02, 0, 16);
  k.box(0.003, 0.05, 0.014, m.plasticWhite, body, 0, -0.008, 0);
  k.cyl(0.0012, 0.0012, 0.2, m.steel, body, 0, 0.19, 0, 8);
  k.cyl(0.0035, 0.0035, 0.014, m.plasticWhite, body, 0, 0.29, 0, 10);
  return g;
}

/** Rack of eight sample tubes; the first `filled` hold a sample. */
export function tubeRack(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.22, 0.008, 0.05, m.plasticWhite, g, 0, 0.004, 0);
  k.box(0.22, 0.008, 0.05, m.accentBlue, g, 0, 0.07, 0);
  for (const x of [-0.105, 0.105]) k.box(0.008, 0.07, 0.05, m.plasticWhite, g, x, 0.037, 0);
  const lm = liquidMaterial(k, `tubes${g.uniqueId}`, "#cfe5f8", 0.6);
  const fills: Mesh[] = [];
  for (let i = 0; i < 8; i++) {
    const x = -0.0875 + i * 0.025;
    k.cyl(0.0075, 0.0075, 0.1, m.glass, g, x, 0.058, 0, 14, { cap: false }).alphaIndex = 2;
    k.sphere(0.0075, m.glass, g, x, 0.008, 0, 10, 0.5).rotation.x = Math.PI;
    const f = dyn(k.cyl(0.0064, 0.0064, 0.05, lm, g, x, 0.033, 0, 12));
    f.setEnabled(false);
    fills.push(f);
  }
  return {
    node: g,
    dispose: () => lm.dispose(),
    set(n: number) {
      fills.forEach((f, i) => f.setEnabled(i < n));
    },
  };
}

/** HDPE tablet container with a few tablets visible through the open neck. */
export function tabletPot(k: Kit, parent: TransformNode, labelMat: PBRMaterial | null = null) {
  const { m } = k;
  const g = k.node(parent);
  k.lathe([[0, 0], [0.031, 0], [0.033, 0.006], [0.033, 0.075], [0.026, 0.085], [0.02, 0.088], [0.02, 0.098]], m.hdpe, g, 32);
  k.cyl(0.023, 0.023, 0.018, m.accentGreen, g, 0, 0.106, 0, 24);
  if (labelMat) k.labelArc(0.0335, 0.045, 2.2, labelMat, g, 0.04);
  for (const [x, z] of [[0.05, 0.0], [0.062, 0.012]]) k.cyl(0.0052, 0.0052, 0.0045, m.powderWhite, g, x, 0.0023, z, 18);
  return g;
}

/** 5 L carboy with a tap near the bottom (purified water for the syrup; dissolution medium). */
export function carboy(k: Kit, parent: TransformNode, labelMat: PBRMaterial | null, capMat?: PBRMaterial) {
  const { m } = k;
  const g = k.node(parent);
  k.lathe([[0, 0], [0.1, 0], [0.11, 0.012], [0.11, 0.25], [0.09, 0.29], [0.035, 0.31], [0.035, 0.33]], m.ldpe, g, 36).alphaIndex = 2;
  const w = k.lathe([[0, 0.004], [0.104, 0.004], [0.104, 0.22], [0, 0.22]], liquidMaterial(k, `carboy${g.uniqueId}`, "#d3e9fa", 0.35), g, 32);
  w.alphaIndex = 1;
  k.cyl(0.037, 0.037, 0.04, capMat ?? m.accentBlue, g, 0, 0.345, 0, 24);
  k.box(0.024, 0.024, 0.04, capMat ?? m.accentBlue, g, 0, 0.04, 0.115);
  k.cyl(0.006, 0.006, 0.03, m.plasticWhite, g, 0, 0.03, 0.135, 10);
  if (labelMat) k.labelArc(0.1105, 0.1, 2.0, labelMat, g, 0.16);
  return g;
}

// ── Simple Syrup station (ported from the three.js room) ────────────────────

/** Top-pan balance (0.01 g) with its own boat and sucrose heap — the syrup's balance. */
export function topPanBalance(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.2, 0.06, 0.28, m.plasticWhite, g, 0, 0.03, 0);
  const lcd = lcdCanvas(512, 140);
  const tex = liveTexture(k, lcd.canvas, "syrupBalanceLcd");
  const lcdMat = new PBRMaterial("syrupBalanceLcdMat", k.scene);
  lcdMat.albedoTexture = tex;
  lcdMat.unlit = true;
  dyn(k.panel(0.12, 0.03, lcdMat, g, 0, 0.045, 0.1412));
  k.box(0.16, 0.006, 0.16, m.brushed, g, 0, 0.065, -0.03);
  const boat = dynNode(k.node(g, 0, 0.07, -0.03));
  k.box(0.08, 0.002, 0.08, m.plasticWhite, boat, 0, 0, 0);
  const heap = dyn(k.cyl(0, 0.035, 0.03, m.powderWhite, boat, 0, 0.016, 0, 24));
  return {
    node: g,
    set(v: { boatOn: boolean; sampleG: number; display: string }) {
      boat.setEnabled(v.boatOn);
      heap.setEnabled(v.sampleG > 0.05);
      heap.scaling.setAll(Math.max(0.2, Math.min(1.3, Math.cbrt(v.sampleG / 85))));
      if (lcd.draw(v.display, "g")) tex.update(true);
    },
  };
}

/** Hot plate: LCD set-point, a red lamp while heating, and the plate glowing above 100 °C. */
export function hotPlate(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.2, 0.09, 0.3, m.plasticWhite, g, 0, 0.045, 0);
  const topMat = new PBRMaterial("hotplateTop", k.scene);
  topMat.albedoColor = Color3.FromHexString("#f1f2f2").toLinearSpace();
  topMat.roughness = 0.25;
  dyn(k.box(0.18, 0.008, 0.18, topMat, g, 0, 0.094, -0.04));
  for (const x of [-0.05, 0.05]) k.cyl(0.017, 0.017, 0.02, m.plasticDark, g, x, 0.045, 0.15, 24).rotation.x = Math.PI / 2;
  const ledMat = new PBRMaterial("hotplateLed", k.scene);
  ledMat.albedoColor = Color3.FromHexString("#330000").toLinearSpace();
  ledMat.roughness = 0.4;
  dyn(k.sphere(0.004, ledMat, g, 0, 0.07, 0.151, 10));
  const disp = display(k, 256, 96, { bg: "#1a1f26", fg: "#ffb37a" });
  dyn(k.panel(0.06, 0.022, disp.mat, g, 0, 0.045, 0.1512));
  return {
    node: g,
    set(v: { heating: boolean; setpoint: number }) {
      ledMat.emissiveColor = v.heating ? Color3.FromHexString("#ff2200") : Color3.Black();
      topMat.emissiveColor = v.heating && v.setpoint >= 100 ? Color3.FromHexString("#2a0800").toLinearSpace() : Color3.Black();
      disp.draw([v.heating ? `${v.setpoint}°` : "OFF"]);
    },
  };
}

/** Amber dispensing bottle: its fill and the label that appears once it is labelled. */
export function dispensingBottle(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  const outer: Profile = [[0, 0], [0.032, 0], [0.036, 0.006], [0.036, 0.11], [0.022, 0.135], [0.012, 0.142], [0.012, 0.155]];
  const inner: Profile = [[0, 0.002], [0.0335, 0.002], [0.0345, 0.11], [0.02, 0.134], [0.0105, 0.14]];
  // translucent amber (the three.js room's amber glass is 78 % opaque), so the fill shows
  const amber = new PBRMaterial("amberTranslucent", k.scene);
  amber.albedoColor = Color3.FromHexString("#8a4a12").toLinearSpace();
  amber.roughness = 0.08;
  amber.alpha = 0.7;
  amber.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  amber.backFaceCulling = false;
  const v = fillable(k, g, outer, inner, { shell: amber });
  k.cyl(0.014, 0.014, 0.022, k.m.plasticDark, g, 0, 0.165, 0, 20);
  return { node: g, ...v };
}

/** Purified-water and other dynamic textures need a typed handle in the room. */
export type { DynamicTexture };
