/**
 * The Pharmaceutics room's fixtures (2026-10-25): the three storage cabinets the apparatus
 * is taken from and returned to, the sink with its swan-neck tap, the segregated waste
 * station, zone boards and wall notices — plus a texture ATLAS, so every static label,
 * sign and notice in the room shares one texture and one material (and, after the
 * runtime's static merge, one draw call) instead of one texture each.
 */
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VertexBuffer } from "@babylonjs/core/Buffers/buffer";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { labelCanvas, posterCanvas, signCanvas, type SignKind } from "../art/canvas";
import { canvasTexture, dyn, lin, type Kit } from "./kit";
import { dynNode, liquidMaterial } from "./pharmaceuticsApparatus";

const FONT = "Outfit, 'Segoe UI', Roboto, Arial, sans-serif";
export const BLUE = "#1C7BD9";
export const MINT = "#21B67A";
export const CHARCOAL = "#2b2f35";

type Rect = [number, number, number, number]; // u0, v0, u1, v1

/** Remap a mesh's 0–1 UVs into one cell of an atlas. */
function remapUV(mesh: Mesh, r: Rect) {
  const uv = mesh.getVerticesData(VertexBuffer.UVKind);
  if (!uv) return;
  for (let i = 0; i < uv.length; i += 2) {
    uv[i] = r[0] + uv[i] * (r[2] - r[0]);
    uv[i + 1] = r[1] + uv[i + 1] * (r[3] - r[1]);
  }
  mesh.setVerticesData(VertexBuffer.UVKind, uv);
}

/** A cell of an atlas: which page, and its UV rectangle there. */
export interface Cell {
  page: number;
  r: Rect;
}

/**
 * Canvases holding many pictures, packed in rows; a new 2048² page is started when one is
 * full. `add()` draws a canvas into the next cell; `panel()`/`arc()` make a mesh showing a
 * cell. Half resolution on Low. Call `finish()` once everything is drawn (uploads once).
 */
export class Atlas {
  private pages: { ctx: CanvasRenderingContext2D; tex: ReturnType<typeof canvasTexture>; mat: PBRMaterial }[] = [];
  private x = 0;
  private y = 0;
  private row = 0;
  private s: number;
  constructor(private k: Kit, private name: string, private size = 2048, private rough = 0.72) {
    this.s = k.q === "low" ? 0.5 : 1;
    this.newPage();
  }
  private newPage() {
    const k = this.k;
    const c = document.createElement("canvas");
    c.width = c.height = this.size * this.s;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    const tex = canvasTexture(k.scene, c, `${this.name}${this.pages.length}`, k.q);
    tex.wrapU = tex.wrapV = Texture.CLAMP_ADDRESSMODE;
    k.textures.push(tex);
    const mat = new PBRMaterial(`${this.name}${this.pages.length}Mat`, k.scene);
    mat.albedoTexture = tex;
    mat.roughness = this.rough;
    mat.metallic = 0;
    this.pages.push({ ctx, tex, mat });
    this.x = this.y = this.row = 0;
  }
  /** Draw `src` scaled to w × h atlas pixels into the next free cell. */
  add(src: HTMLCanvasElement, w = src.width, h = src.height): Cell {
    const pad = 10;
    if (this.x + w > this.size) {
      this.x = 0;
      this.y += this.row + pad;
      this.row = 0;
    }
    if (this.y + h > this.size) this.newPage();
    const s = this.s;
    const page = this.pages.length - 1;
    this.pages[page].ctx.drawImage(src, this.x * s, this.y * s, w * s, h * s);
    const r: Rect = [this.x / this.size, 1 - (this.y + h) / this.size, (this.x + w) / this.size, 1 - this.y / this.size];
    this.x += w + pad;
    this.row = Math.max(this.row, h);
    return { page, r };
  }
  /** A flat panel facing +z showing `src` (see Kit.panel for the orientation). */
  panel(w: number, h: number, src: HTMLCanvasElement | Cell, parent: TransformNode | null, x = 0, y = 0, z = 0, px?: [number, number]) {
    const cell = src instanceof HTMLCanvasElement ? this.add(src, px?.[0], px?.[1]) : src;
    const p = this.k.panel(w, h, this.pages[cell.page].mat, parent, x, y, z);
    remapUV(p, cell.r);
    return p;
  }
  /** A label wrapped round a cylinder, facing +z. */
  arc(radius: number, h: number, arcRad: number, src: HTMLCanvasElement | Cell, parent: TransformNode | null, y: number, px?: [number, number]) {
    const cell = src instanceof HTMLCanvasElement ? this.add(src, px?.[0], px?.[1]) : src;
    const m = this.k.labelArc(radius, h, arcRad, this.pages[cell.page].mat, parent, y);
    remapUV(m, cell.r);
    return m;
  }
  get pageCount() {
    return this.pages.length;
  }
  finish() {
    for (const p of this.pages) p.tex.update(true, false);
  }
}

// ── canvases ───────────────────────────────────────────────────────────────

/** Zone board: a numbered colour block and the zone's name. 1024 × 192. */
export function zoneCanvas(n: number, title: string, sub: string, accent: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 192;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1024, 192);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 192, 192);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 120px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(String(n), 96, 140);
  ctx.textAlign = "left";
  ctx.fillStyle = "#1d2127";
  let size = 60;
  ctx.font = `700 ${size}px ${FONT}`;
  const wide = ctx.measureText(title).width;
  if (wide > 780) size = Math.floor((size * 780) / wide);
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.fillText(title, 222, 92);
  ctx.fillStyle = "#59616c";
  ctx.font = `500 34px ${FONT}`;
  ctx.fillText(sub, 224, 148);
  ctx.fillStyle = accent;
  ctx.fillRect(192, 182, 832, 10);
  return c;
}

/** A plate: coloured band with white title, one line below. */
export function plateCanvas(title: string, line: string, accent: string, w = 768, h = 220) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, w, h * 0.56);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 ${Math.round(h * 0.25)}px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText(title, w / 2, h * 0.38);
  ctx.fillStyle = "#1d2127";
  ctx.font = `600 ${Math.round(h * 0.17)}px ${FONT}`;
  ctx.fillText(line, w / 2, h * 0.83);
  ctx.strokeStyle = "#c9ced6";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, w - 6, h - 6);
  return c;
}

export { labelCanvas, posterCanvas, signCanvas, type SignKind };

// ── storage cabinets ───────────────────────────────────────────────────────

export interface Slot {
  /** World position and facing of an item stored here. */
  pos: Vector3;
  ry: number;
}

/**
 * Tall storage cabinet (1.0 × 2.0 × 0.45 m) with two hinged door leaves — glazed for
 * glassware, solid for apparatus, louvred for reagents — four shelves (the bottom one tall
 * enough for a 1000 mL cylinder), a name plate, and anchors for the stored items.
 */
export function storageCabinet(k: Kit, atlas: Atlas, parent: TransformNode, kind: "glass" | "solid" | "vented", plate: HTMLCanvasElement) {
  const { m } = k;
  const g = k.node(parent);
  const W = 1.0;
  const D = 0.45;
  const H = 2.0;
  k.box(W, H, 0.02, m.cabinet, g, 0, H / 2, -D / 2 + 0.01);
  k.box(W - 0.04, H - 0.12, 0.004, m.wallAccent, g, 0, H / 2 + 0.02, -D / 2 + 0.022); // interior back
  for (const x of [-W / 2 + 0.01, W / 2 - 0.01]) k.box(0.02, H, D, m.cabinet, g, x, H / 2, 0);
  k.box(W, 0.1, D - 0.02, m.plinth, g, 0, 0.05, -0.01);
  k.box(W + 0.02, 0.05, D + 0.02, m.cabinet, g, 0, H + 0.025, 0);
  const SHELVES = [0.1, 0.62, 1.06, 1.48];
  for (const y of SHELVES) k.box(W - 0.04, 0.02, D - 0.04, m.cabinetDoor, g, 0, y, 0);
  k.box(W - 0.04, 0.02, D - 0.04, m.cabinetDoor, g, 0, 1.9, 0);
  atlas.panel(0.6, 0.17, plate, g, 0, H - 0.04, D / 2 + 0.012, [512, 147]);
  // door leaves on hinges at the two front edges
  const leaves: TransformNode[] = [];
  for (const s of [-1, 1]) {
    const hinge = dynNode(k.node(g, (s * W) / 2 - s * 0.012, 0, D / 2 + 0.002));
    const lw = W / 2 - 0.016;
    const cx = -s * (lw / 2);
    const leafH = H - 0.18;
    const cy = 0.11 + leafH / 2;
    if (kind === "glass") {
      k.box(lw - 0.06, leafH - 0.06, 0.006, m.glass, hinge, cx, cy, 0.008).alphaIndex = 3;
      for (const dx of [-lw / 2 + 0.015, lw / 2 - 0.015]) k.box(0.03, leafH, 0.022, m.plasticWhite, hinge, cx + dx, cy, 0.011);
      for (const dy of [-leafH / 2 + 0.015, leafH / 2 - 0.015]) k.box(lw, 0.03, 0.022, m.plasticWhite, hinge, cx, cy + dy, 0.011);
    } else {
      k.box(lw, leafH, 0.02, m.cabinetDoor, hinge, cx, cy, 0.01);
      if (kind === "vented") for (let i = 0; i < 6; i++) k.box(lw * 0.6, 0.012, 0.004, m.plasticDark, hinge, cx, 0.3 + i * 0.03, 0.021);
    }
    k.box(0.012, 0.16, 0.014, m.steel, hinge, -s * (lw - 0.04), 1.05, 0.03); // handle
    leaves.push(hinge);
  }
  // shelf anchors (cabinet-local, items stand on the shelf top)
  const anchor = (x: number, y: number, z: number) => k.node(g, x, y, z);
  let cur = 0;
  let open = 0;
  return {
    node: g,
    shelves: SHELVES.map((y, i) => ({ y: y + 0.01, clear: (i < 3 ? SHELVES[i + 1] : 1.9) - y - 0.03 })),
    width: W - 0.08,
    depth: D - 0.08,
    anchor,
    setOpen(on: boolean) {
      open = on ? 1 : 0;
      return Math.abs(cur - open) > 0.001;
    },
    snap() {
      cur = open;
      this.pose();
    },
    pose() {
      // left leaf swings out to −x, right to +x: −θ / +θ about its hinge (gotcha: right-handed)
      leaves[0].rotation.y = -cur * 1.8;
      leaves[1].rotation.y = cur * 1.8;
    },
    step(dt: number) {
      if (Math.abs(cur - open) <= 0.001) return false;
      cur += (open - cur) * Math.min(1, dt * 7);
      if (Math.abs(cur - open) <= 0.001) cur = open;
      this.pose();
      return cur !== open;
    },
  };
}
export type Cabinet = ReturnType<typeof storageCabinet>;

/**
 * Pack items onto a cabinet's shelves, tallest first, left to right, front row then back
 * row. Returns cabinet-local anchors. Sizes are the items' footprints along x and heights.
 */
export function packCabinet(cab: Cabinet, items: { id: string; w: number; h: number; d?: number }[]) {
  const out = new Map<string, TransformNode>();
  const rows = cab.shelves.map((s) => ({ ...s, x: [-cab.width / 2, -cab.width / 2] }));
  const sorted = [...items].sort((a, b) => b.h - a.h);
  for (const it of sorted) {
    let placed = false;
    // eye-level shelves first (what the student sees when the door opens); the tall bottom
    // compartment last, unless the item only fits there
    for (const si of [2, 1, 3, 0]) {
      if (placed) break;
      const r = rows[si];
      if (it.h > r.clear) continue;
      for (let row = 0; row < 2 && !placed; row++) {
        if (r.x[row] + it.w > cab.width / 2) continue;
        const x = r.x[row] + it.w / 2;
        const z = row === 0 ? cab.depth / 2 - (it.d ?? 0.1) / 2 - 0.02 : -cab.depth / 2 + (it.d ?? 0.1) / 2 + 0.02;
        r.x[row] += it.w + 0.025;
        out.set(it.id, cab.anchor(x, r.y, z));
        placed = true;
      }
    }
    if (!placed) out.set(it.id, cab.anchor(0, cab.shelves[3].y, 0)); // never happens with the room's lists
  }
  return out;
}

// ── sink and tap ────────────────────────────────────────────────────────────

/**
 * Sink base unit with a sit-on stainless top: a deep bowl, a ribbed drainer, a tall
 * swan-neck laboratory tap with wrist-action levers, and a water stream that runs only
 * while the tap is on. `rinse` is where an item being rinsed stands (sink-local).
 */
export function sinkUnit(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  const W = 1.2;
  const D = 0.75;
  // carcass: plinth, sides, back, doors — hollow, so the bowl can sink into it
  k.box(W - 0.06, 0.1, D - 0.1, m.plinth, g, 0, 0.05, -0.03);
  for (const x of [-W / 2 + 0.01, W / 2 - 0.01]) k.box(0.02, 0.76, D - 0.04, m.cabinet, g, x, 0.48, -0.01);
  k.box(W - 0.02, 0.76, 0.02, m.cabinet, g, 0, 0.48, -D / 2 + 0.02);
  k.box(W - 0.02, 0.02, D - 0.04, m.cabinet, g, 0, 0.11, -0.01);
  for (const x of [-W / 4, W / 4]) {
    k.box(W / 2 - 0.02, 0.7, 0.02, m.cabinetDoor, g, x, 0.48, D / 2 - 0.02);
    k.box(0.012, 0.14, 0.012, m.steel, g, x + (x < 0 ? W / 4 - 0.06 : -W / 4 + 0.06), 0.7, D / 2 + 0.006);
  }
  // stainless top with the bowl opening (bowl on the left, drainer on the right)
  const BX = -0.2;
  const BW = 0.5;
  const BD = 0.4;
  const top = 0.893;
  const th = 0.035;
  k.box(W, th, (D - BD) / 2 + 0.03, m.steel, g, 0, top, -D / 2 + ((D - BD) / 2 + 0.03) / 2);
  k.box(W, th, (D - BD) / 2 - 0.03, m.steel, g, 0, top, D / 2 - ((D - BD) / 2 - 0.03) / 2);
  k.box(BX - BW / 2 + W / 2, th, BD, m.steel, g, (-W / 2 + BX - BW / 2) / 2, top, 0.03);
  k.box(W / 2 - (BX + BW / 2), th, BD, m.steel, g, (W / 2 + BX + BW / 2) / 2, top, 0.03);
  const depth = 0.22;
  const floorY = top - depth;
  k.box(BW, 0.006, BD, m.brushed, g, BX, floorY, 0.03);
  for (const s of [-1, 1]) k.box(0.006, depth, BD, m.brushed, g, BX + (s * BW) / 2, floorY + depth / 2, 0.03);
  for (const s of [-1, 1]) k.box(BW, depth, 0.006, m.brushed, g, BX, floorY + depth / 2, 0.03 + (s * BD) / 2);
  k.cyl(0.03, 0.03, 0.004, m.chrome, g, BX, floorY + 0.004, 0.03, 18); // waste outlet
  k.cyl(0.012, 0.012, 0.005, m.darkMetal, g, BX, floorY + 0.006, 0.03, 12);
  for (let i = 0; i < 7; i++) k.box(0.36, 0.006, 0.012, m.brushed, g, 0.3, top + 0.02, -0.12 + i * 0.045); // drainer ribs
  k.box(W, 0.14, 0.015, m.steel, g, 0, top + 0.07, -D / 2 + 0.008); // upstand
  // swan-neck tap rising from the back deck
  const tx = BX;
  const tz = -0.25;
  k.cyl(0.02, 0.024, 0.04, m.chrome, g, tx, top + 0.035, tz, 18);
  const OUT = new Vector3(tx, top + 0.29, 0.0);
  k.tube([[tx, top + 0.03, tz], [tx, top + 0.3, tz], [tx, top + 0.39, tz + 0.04], [tx, top + 0.41, tz + 0.12], [tx, top + 0.38, tz + 0.21], [tx, top + 0.33, tz + 0.245], [tx, OUT.y + 0.008, OUT.z]], 0.011, m.chrome, g, 14);
  k.cyl(0.0085, 0.0085, 0.025, m.chrome, g, tx, OUT.y + 0.012, OUT.z, 14); // anti-splash nozzle
  const levers: TransformNode[] = [];
  for (const s of [-1, 1]) {
    k.cyl(0.011, 0.011, 0.04, m.chrome, g, tx + s * 0.075, top + 0.035, tz, 12);
    const lv = dynNode(k.node(g, tx + s * 0.075, top + 0.06, tz));
    k.box(0.012, 0.012, 0.13, s < 0 ? m.accentBlue : m.red, lv, 0, 0, 0.065);
    levers.push(lv);
  }
  // the stream and the splash ring
  const wm = liquidMaterial(k, "tapStream", "#cfe8fb", 0.6);
  const stream = dyn(k.cyl(0.0045, 0.0045, 1, wm, g, OUT.x, 0, OUT.z, 10, { cap: false }));
  stream.setEnabled(false);
  const splash = dyn(k.torus(0.02, 0.003, wm, g, OUT.x, floorY + 0.006, OUT.z, 20));
  splash.setEnabled(false);
  let on = false;
  let bottom = floorY;
  return {
    node: g,
    outlet: OUT,
    floorY,
    rinse: new Vector3(OUT.x, floorY + 0.004, OUT.z),
    dispose: () => wm.dispose(),
    /** `toY`: where the stream lands (the bowl, or the top of the item under it), sink-local. */
    set(tapOn: boolean, toY: number | null) {
      on = tapOn;
      bottom = toY ?? floorY;
      stream.setEnabled(on);
      splash.setEnabled(on);
      for (const lv of levers) lv.rotation.y = on ? (lv === levers[0] ? 0.9 : -0.9) : 0;
      const len = Math.max(0.01, OUT.y - bottom);
      stream.scaling.y = len;
      stream.position.y = bottom + len / 2;
      splash.position.y = bottom + 0.003;
      return on;
    },
    step(t: number) {
      if (!on) return false;
      const w = 1 + Math.sin(t * 47) * 0.12 + Math.sin(t * 31) * 0.06;
      stream.scaling.x = stream.scaling.z = w;
      const f = (t * 3) % 1;
      splash.scaling.set(0.5 + f, 1, 0.5 + f);
      return true;
    },
  };
}

// ── waste station ───────────────────────────────────────────────────────────

/**
 * Segregated waste station: aqueous and non-halogenated organic waste in translucent HDPE
 * jerrycans on a spill tray (the level shows), a pedal bin with its lid up for
 * non-hazardous solids, and a broken-glass box for glass and sharps — each under a
 * colour-coded header, with a notice saying what goes where.
 */
export function wasteStation(k: Kit, atlas: Atlas, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  // aqueous · organic · chemical solid · non-hazardous solid · glass & sharps
  const X = [-0.78, -0.46, -0.08, 0.34, 0.74];
  const COLORS = ["#1C7BD9", "#E07B00", "#7B3FB5", "#5f6b78", "#C8202A"];
  const TITLES: [string, string][] = [
    ["AQUEOUS", "Aqueous chemical waste"],
    ["ORGANIC", "Non-halogenated organic"],
    ["CHEMICAL SOLID", "Chemical / pharmaceutical"],
    ["SOLID", "Non-hazardous solid"],
    ["GLASS & SHARPS", "Broken glass & sharps"],
  ];
  // wall headers and the board behind them
  k.box(1.9, 0.8, 0.012, m.plasticWhite, g, 0, 1.38, -0.2);
  TITLES.forEach(([t, line], i) => atlas.panel(0.31, 0.089, plateCanvas(t, line, COLORS[i], 768, 220), g, X[i], 1.66, -0.192, [512, 147]));
  atlas.panel(
    1.1,
    0.42,
    posterLandscape("Waste — choose the right container", [
      "Nothing hazardous goes down the sink.",
      "Drug solutions → aqueous.  Ethanol, glycerol mixtures → organic.",
      "Drug powder, drug-bearing filters, residues → chemical solid.",
      "Clean paper, tissues → solid.  Capillaries, broken glass → sharps.",
      "Label, close and never overfill (¾ full).",
    ]),
    g,
    0,
    1.25,
    -0.192,
    [880, 336],
  );
  // spill tray with two 10 L jerrycans
  k.box(0.68, 0.04, 0.36, m.plasticDark, g, -0.62, 0.02, 0);
  const liquids: Mesh[] = [];
  const jerry = (x: number, cap: PBRMaterial, hex: string, label: HTMLCanvasElement) => {
    const j = k.node(g, x, 0.04, 0);
    const shell = k.box(0.26, 0.34, 0.2, m.ldpe, j, 0, 0.17, 0);
    shell.alphaIndex = 2;
    k.box(0.06, 0.03, 0.2, m.ldpe, j, -0.06, 0.355, 0).alphaIndex = 2; // handle
    k.cyl(0.024, 0.024, 0.03, cap, j, 0.07, 0.36, 0, 18);
    atlas.panel(0.18, 0.11, label, j, 0, 0.2, 0.1012, [512, 320]);
    const lq = dyn(k.box(0.248, 1, 0.188, liquidMaterial(k, `waste${x}`, hex, 0.55), j, 0, 0, 0));
    lq.alphaIndex = 1;
    liquids.push(lq);
  };
  jerry(X[0], m.accentBlue, "#9fc6ea", labelCanvas("Aqueous chemical waste", ["Drug & salt solutions", "Keep closed"], { accent: COLORS[0], hazard: "harmful" }));
  jerry(X[1], m.yellow, "#f0d9a6", labelCanvas("Non-halogenated organic waste", ["Ethanol, glycerol mixtures", "No halogenated solvents"], { accent: COLORS[1], hazard: "harmful" }));
  // chemical / pharmaceutical solid waste: wide-mouth HDPE drum, purple lid hinged open
  const drum = k.node(g, X[2], 0, 0);
  k.cyl(0.13, 0.125, 0.42, m.hdpe, drum, 0, 0.21, 0, 28, { cap: false });
  k.cyl(0.125, 0.125, 0.01, m.hdpe, drum, 0, 0.005, 0, 28);
  k.torus(0.132, 0.008, m.hdpe, drum, 0, 0.42, 0, 28);
  const purple = m.accentBlue.clone("purpleLid");
  purple.albedoColor = lin("#7B3FB5");
  const dlid = k.node(drum, 0, 0.425, -0.13);
  dlid.rotation.x = -1.4;
  k.cyl(0.138, 0.138, 0.022, purple, dlid, 0, 0, 0.13, 28);
  atlas.panel(0.17, 0.106, labelCanvas("Chemical / pharmaceutical solid waste", ["Drug powder, filters, residues", "For incineration"], { accent: COLORS[2], hazard: "harmful" }), drum, 0, 0.24, 0.131, [512, 320]);
  const chem = dyn(k.cyl(0.122, 0.12, 1, m.powderWhite, drum, 0, 0, 0, 20));
  // pedal bin, lid up
  const bin = k.node(g, X[3], 0, 0);
  k.cyl(0.15, 0.13, 0.5, m.plasticGrey, bin, 0, 0.25, 0, 28, { cap: false });
  k.cyl(0.13, 0.13, 0.01, m.plasticGrey, bin, 0, 0.005, 0, 28);
  const lid = k.node(bin, 0, 0.5, -0.15);
  lid.rotation.x = -1.35;
  k.cyl(0.155, 0.155, 0.02, m.plasticGrey, lid, 0, 0, 0.15, 28);
  k.box(0.1, 0.015, 0.05, m.plasticDark, bin, 0, 0.012, 0.15); // pedal
  atlas.panel(0.16, 0.1, labelCanvas("Non-hazardous solid waste", ["Boats, papers, tissues, gloves"], { accent: COLORS[2] }), bin, 0, 0.3, 0.151, [512, 320]);
  const solid = dyn(k.cyl(0.128, 0.122, 1, m.paper, bin, 0, 0, 0, 20));
  // broken glass box
  const box = k.node(g, X[4], 0, 0);
  k.box(0.3, 0.42, 0.006, m.plasticWhite, box, 0, 0.21, 0.13);
  atlas.panel(0.29, 0.4, boxCanvas(), box, 0, 0.21, 0.1335, [384, 512]);
  for (const s of [-1, 1]) k.box(0.006, 0.42, 0.26, m.plasticWhite, box, s * 0.15, 0.21, 0);
  k.box(0.3, 0.42, 0.006, m.plasticWhite, box, 0, 0.21, -0.13);
  k.box(0.3, 0.006, 0.26, m.plasticWhite, box, 0, 0.003, 0);
  for (const s of [-1, 1]) {
    const flap = k.box(0.3, 0.006, 0.12, m.plasticWhite, box, 0, 0.42, s * 0.19);
    flap.rotation.x = s * 0.5;
  }
  const shards = dyn(k.box(0.288, 1, 0.248, m.glass, box, 0, 0, 0));
  shards.alphaIndex = 2;
  const level = (n: number) => (n <= 0 ? 0.04 : Math.min(0.85, 0.16 + 0.13 * n));
  return {
    node: g,
    dispose() {
      for (const l of liquids) (l.material as PBRMaterial).dispose();
    },
    /** Disposals per stream; the sink's count draws nothing. */
    set(w: { aqueous: number; organic: number; "chemical-solid"?: number; solid: number; glass: number }) {
      const hc = 0.4 * level(w["chemical-solid"] ?? 0);
      chem.scaling.y = hc;
      chem.position.y = 0.01 + hc / 2;
      [w.aqueous, w.organic].forEach((n, i) => {
        const h = 0.32 * level(n);
        liquids[i].scaling.y = h;
        liquids[i].position.y = 0.01 + h / 2;
      });
      const hs = 0.42 * level(w.solid);
      solid.scaling.y = hs;
      solid.position.y = 0.02 + hs / 2;
      const hg = 0.38 * level(w.glass);
      shards.scaling.y = hg;
      shards.position.y = 0.01 + hg / 2;
    },
  };
}

/** Landscape notice (1100 × 420): title band and short lines. */
export function posterLandscape(title: string, lines: string[], accent = CHARCOAL) {
  const c = document.createElement("canvas");
  c.width = 1100;
  c.height = 420;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1100, 420);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 1100, 92);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 50px ${FONT}`;
  ctx.fillText(title, 34, 64);
  ctx.fillStyle = "#1d2127";
  ctx.font = `500 36px ${FONT}`;
  lines.forEach((l, i) => ctx.fillText(l, 34, 158 + i * 72));
  return c;
}

/** Print on the broken-glass box. */
function boxCanvas() {
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#f4efe4";
  ctx.fillRect(0, 0, 384, 512);
  ctx.fillStyle = "#C8202A";
  ctx.fillRect(0, 70, 384, 160);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 64px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillText("BROKEN", 192, 140);
  ctx.fillText("GLASS", 192, 206);
  ctx.fillStyle = "#1d2127";
  ctx.font = `600 34px ${FONT}`;
  ctx.fillText("& sharps only", 192, 290);
  ctx.font = `500 28px ${FONT}`;
  ctx.fillText("Seal when ¾ full", 192, 350);
  return c;
}

// ── room details ────────────────────────────────────────────────────────────

/** A window in a wall facing +z (frame, mullions, sill), drawn as a bright unlit pane. */
export function windowUnit(k: Kit, parent: TransformNode, x: number, y: number, z: number, ry: number, w = 1.6, h = 1.3) {
  const g = k.node(parent, x, y, z, ry);
  k.box(w, h, 0.02, k.m.window, g);
  for (const dx of [-w / 2 - 0.01, w / 2 + 0.01]) k.box(0.04, h + 0.06, 0.06, k.m.plasticWhite, g, dx, 0, 0.02);
  for (const dy of [-h / 2 - 0.01, 0, h / 2 + 0.01]) k.box(w + 0.06, 0.04, 0.06, k.m.plasticWhite, g, 0, dy, 0.02);
  k.box(0.03, h, 0.05, k.m.plasticWhite, g, 0, 0, 0.02);
  k.box(w + 0.1, 0.03, 0.12, k.m.plasticWhite, g, 0, -h / 2 - 0.03, 0.05);
  return g;
}

/** Pegboard drying rack over the sink with glassware drying upside down. */
export function dryingRack(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.9, 0.6, 0.02, m.plasticWhite, g, 0, 0, 0);
  k.box(0.9, 0.04, 0.12, m.plasticWhite, g, 0, -0.32, 0.05); // drip tray
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 8; c++) {
      const x = -0.37 + c * 0.105;
      const y = 0.22 - r * 0.15;
      const peg = k.cyl(0.004, 0.004, 0.09, m.plasticGrey, g, x, y, 0.045, 6);
      peg.rotation.x = Math.PI / 2 - 0.35;
      if ((r + c) % 3 === 0) {
        // an inverted flask or beaker hung on the peg
        const v = k.node(g, x, y - 0.02, 0.07);
        v.rotation.x = Math.PI;
        if (c % 2) k.lathe([[0, 0], [0.028, 0], [0.03, 0.004], [0.026, 0.03], [0.013, 0.07], [0.011, 0.085]], m.glass, v, 20);
        else k.lathe([[0, 0], [0.024, 0], [0.026, 0.004], [0.026, 0.07]], m.glass, v, 20);
      }
    }
  return g;
}

/** Paper-towel dispenser and soap dispenser by the sink. */
export function towelAndSoap(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  k.box(0.3, 0.36, 0.12, k.m.plasticWhite, g, 0, 0, 0);
  k.box(0.22, 0.02, 0.02, k.m.paper, g, 0, -0.19, 0.04);
  k.box(0.26, 0.05, 0.004, k.m.accentGreen, g, 0, 0.12, 0.061);
  k.box(0.08, 0.16, 0.08, k.m.plasticWhite, g, 0.3, -0.05, 0);
  k.box(0.03, 0.02, 0.05, k.m.plasticGrey, g, 0.3, -0.14, 0.03);
  return g;
}

/** Ceiling-hung double-sided zone board over the island. */
export function hangingBoard(k: Kit, atlas: Atlas, parent: TransformNode, rect: Cell, x: number, y: number, z: number) {
  const g = k.node(parent, x, y, z);
  k.box(1.04, 0.2, 0.02, k.m.plasticWhite, g, 0, 0, 0);
  atlas.panel(1.0, 0.1875, rect, g, 0, 0, 0.0105);
  const back = k.node(g, 0, 0, 0, Math.PI);
  atlas.panel(1.0, 0.1875, rect, back, 0, 0, 0.0105);
  for (const dx of [-0.45, 0.45]) k.cyl(0.002, 0.002, 3 - y - 0.1, k.m.chrome, g, dx, (3 - y) / 2 + 0.05, 0, 6);
  return g;
}

/** A desiccator (decor at the weighing station): glass jar, knob lid, porcelain plate, silica gel. */
export function desiccator(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  k.lathe([[0, 0], [0.07, 0], [0.085, 0.02], [0.09, 0.1], [0.1, 0.12], [0.1, 0.13]], k.m.glass, g, 32);
  k.cyl(0.075, 0.07, 0.03, liquidMaterial(k, "silica", "#4a7fd6", 0.9), g, 0, 0.02, 0, 24);
  k.cyl(0.085, 0.085, 0.004, k.m.tileWhite, g, 0, 0.06, 0, 24);
  k.lathe([[0.1, 0], [0.1, 0.015], [0.08, 0.05], [0.03, 0.07], [0.02, 0.075], [0, 0.075]], k.m.glass, g, 32, 0, 0.13, 0);
  k.sphere(0.018, k.m.glass, g, 0, 0.215, 0, 14);
  return g;
}
