/**
 * Babylon.js building kit for the Pharmaceutical Chemistry room (2026-10-22, the one lab
 * migrated off three.js — docs/virtual-labs/BABYLON_MIGRATION.md). PBR materials, the
 * shared canvas artwork (../art/canvas.ts) as textures, primitive helpers and furniture.
 *
 * Performance model: the room is built from many small parts (drawer fronts, handles,
 * shelf brackets) because that is what makes it read as a laboratory, and the runtime
 * then MERGES every static part per material (`mergeStatics` in runtime.ts) — so the
 * whole room costs about one draw call per material, not one per part. Parts that move
 * or change are tagged `dyn` and left alone. Decorative bottle rows are thin instances.
 *
 * The scene is right-handed (`scene.useRightHandedSystem`), so the room uses the same
 * coordinates as the three.js rooms: x east, y up, z south (toward the student).
 */
import type { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreateLathe } from "@babylonjs/core/Meshes/Builders/latheBuilder";
import { CreatePlane } from "@babylonjs/core/Meshes/Builders/planeBuilder";
import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateTorus } from "@babylonjs/core/Meshes/Builders/torusBuilder";
import { CreateTube } from "@babylonjs/core/Meshes/Builders/tubeBuilder";
import { CreateCapsule } from "@babylonjs/core/Meshes/Builders/capsuleBuilder";
// side-effect import: without it thinInstanceAdd is a silent stub and the bottle rows vanish
import "@babylonjs/core/Meshes/thinInstanceMesh";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { DynamicTexture } from "@babylonjs/core/Materials/Textures/dynamicTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { ICanvas } from "@babylonjs/core/Engines/ICanvas";
import { floorCanvas, labelCanvas, mulberry, posterCanvas, signCanvas, wallCanvas, type SignKind } from "../art/canvas";
import type { Profile } from "../vessel";
import type { Collider, Quality } from "../three/types";
import { QUALITY } from "../quality";

export type V3 = [number, number, number];

/** Hex sRGB → linear (PBR albedo is linear). */
export const lin = (hex: string) => Color3.FromHexString(hex).toLinearSpace();

export function createMats(scene: Scene, q: Quality) {
  const mk = (name: string, hex: string, roughness: number, metallic = 0) => {
    const m = new PBRMaterial(name, scene);
    m.albedoColor = lin(hex);
    m.roughness = roughness;
    m.metallic = metallic;
    return m;
  };
  const unlit = (name: string, hex: string) => {
    const m = mk(name, hex, 1);
    m.unlit = true;
    return m;
  };
  // Borosilicate glass: alpha-blended PBR whose reflections and highlights stay at full
  // strength over the low alpha (Babylon's radiance/specular-over-alpha), drawn back faces
  // first so the far wall of a flask shows through the near one. No refraction pass — it
  // needs an extra render target every frame and reads no better at bench distance.
  const glass = mk("glass", "#f2f8fc", 0.035);
  glass.alpha = q === "low" ? 0.3 : 0.16;
  glass.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  glass.indexOfRefraction = 1.47;
  glass.backFaceCulling = false;
  glass.separateCullingPass = q !== "low";
  glass.environmentIntensity = 1.35;

  const epoxy = mk("epoxyTop", "#2b2f35", 0.3);
  const resin = mk("resinWhiteTop", "#eceff1", 0.32);
  if (q === "high") for (const m of [epoxy, resin]) {
    m.clearCoat.isEnabled = true;
    m.clearCoat.intensity = 0.55;
    m.clearCoat.roughness = 0.18;
  }

  const m = {
    glass,
    amber: mk("amberGlass", "#7a3f0c", 0.12),
    hdpe: mk("hdpe", "#f1f2ee", 0.48),
    ldpe: (() => {
      const l = mk("ldpe", "#eef3f5", 0.38);
      l.alpha = 0.82;
      l.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
      return l;
    })(),
    epoxyTop: epoxy,
    resinWhiteTop: resin,
    cabinet: mk("cabinet", "#e6eaee", 0.55),
    cabinetDoor: mk("cabinetDoor", "#f5f7f8", 0.42),
    plinth: mk("plinth", "#2b2f35", 0.6),
    skirting: mk("skirting", "#5f6b78", 0.6),
    ceiling: mk("ceiling", "#f6f7f8", 0.95),
    wallAccent: mk("wallAccent", "#dbe9f6", 0.9),
    dado: mk("dado", "#e2e9ef", 0.6),
    accentBlue: mk("accentBlue", "#1c7bd9", 0.42),
    accentGreen: mk("accentGreen", "#21b67a", 0.42),
    steel: mk("steel", "#c9ced3", 0.26, 0.9),
    brushed: mk("brushed", "#b4bac0", 0.4, 0.85),
    chrome: mk("chrome", "#f2f4f6", 0.08, 1),
    darkMetal: mk("darkMetal", "#3a3f46", 0.45, 0.6),
    enamel: mk("enamel", "#2f4f6f", 0.38, 0.2),
    plasticWhite: mk("plasticWhite", "#f4f5f6", 0.38),
    plasticGrey: mk("plasticGrey", "#8d949c", 0.5),
    plasticDark: mk("plasticDark", "#2b2f35", 0.45),
    ptfe: mk("ptfe", "#fbfbf8", 0.55),
    rubber: mk("rubber", "#1f2226", 0.85),
    rubberRed: mk("rubberRed", "#b3262a", 0.6),
    red: mk("red", "#c8202a", 0.42),
    yellow: mk("yellow", "#f2c200", 0.5),
    greenSafety: mk("greenSafety", "#14864a", 0.5),
    wood: mk("wood", "#a77f57", 0.6),
    tileWhite: mk("tileWhite", "#ffffff", 0.15),
    paper: mk("paper", "#fdfdfb", 0.85),
    powderWhite: mk("powderWhite", "#ffffff", 0.95),
    screen: mk("screen", "#0f1a24", 0.3, 0.2),
    lightPanel: unlit("lightPanel", "#ffffff"),
    window: unlit("window", "#d6ebff"),
    water: (() => {
      const w = mk("water", "#d9eefc", 0.03);
      w.alpha = 0.32;
      w.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
      return w;
    })(),
  };
  // the floor and walls carry the shared procedural artwork as albedo
  const tex = (c: HTMLCanvasElement, name: string, u: number, v: number) => {
    const t = canvasTexture(scene, c, name, q);
    t.uScale = u;
    t.vScale = v;
    return t;
  };
  const floor = mk("floor", "#ffffff", 0.55);
  floor.albedoTexture = tex(floorCanvas("#cdd6dc"), "floorArt", 6, 5);
  const wall = mk("wall", "#ffffff", 0.92);
  wall.albedoTexture = tex(wallCanvas(), "wallArt", 4, 2);
  return { ...m, floor, wall };
}

export type Mats = ReturnType<typeof createMats>;

/** Wrap one of the shared canvases as a mip-mapped texture. */
export function canvasTexture(scene: Scene, c: HTMLCanvasElement, name: string, q: Quality, alpha = false) {
  const t = new DynamicTexture(name, c as unknown as ICanvas, scene, true, Texture.TRILINEAR_SAMPLINGMODE);
  t.hasAlpha = alpha;
  t.anisotropicFilteringLevel = QUALITY[q].anisotropy;
  t.wrapU = t.wrapV = Texture.WRAP_ADDRESSMODE;
  t.update(true, false); // straight alpha: the PBR material does not expect premultiplied
  return t;
}

/** Tag a mesh as changing at run time: the static merge leaves it as it is. */
export function dyn<T extends Mesh>(m: T): T {
  m.metadata = { ...(m.metadata ?? {}), dyn: true };
  return m;
}

/**
 * The primitive helpers every model is built from. Each places a mesh under a parent at
 * a local position and returns it; nothing is pickable until the runtime registers it.
 */
export class Kit {
  readonly textures: Texture[] = [];
  private n = 0;
  constructor(readonly scene: Scene, readonly q: Quality, readonly m: Mats) {}

  private put(mesh: Mesh, mat: PBRMaterial, parent: TransformNode | null, x: number, y: number, z: number) {
    mesh.material = mat;
    mesh.position.set(x, y, z);
    mesh.parent = parent;
    mesh.isPickable = false;
    return mesh;
  }
  private id(k: string) {
    return `${k}${this.n++}`;
  }

  node(parent: TransformNode | null, x = 0, y = 0, z = 0, ry = 0) {
    const t = new TransformNode(this.id("n"), this.scene);
    t.parent = parent;
    t.position.set(x, y, z);
    t.rotation.y = ry;
    return t;
  }

  box(w: number, h: number, d: number, mat: PBRMaterial, parent: TransformNode | null, x = 0, y = 0, z = 0) {
    return this.put(CreateBox(this.id("b"), { width: w, height: h, depth: d }, this.scene), mat, parent, x, y, z);
  }

  cyl(rTop: number, rBot: number, h: number, mat: PBRMaterial, parent: TransformNode | null, x = 0, y = 0, z = 0, tess = 24, o: { cap?: boolean } = {}) {
    const c = CreateCylinder(this.id("c"), { diameterTop: rTop * 2, diameterBottom: rBot * 2, height: h, tessellation: tess, cap: o.cap === false ? Mesh.NO_CAP : Mesh.CAP_ALL }, this.scene);
    return this.put(c, mat, parent, x, y, z);
  }

  /**
   * A solid of revolution from a [radius, y] profile (bottom up). Opaque solids get both
   * faces (an outer-only profile's winding is not guaranteed to face out); glass gets one,
   * because its material already draws back faces then front faces — doubling the
   * geometry as well drew every glass surface twice and made it read twice as opaque.
   */
  lathe(p: Profile, mat: PBRMaterial, parent: TransformNode | null, tess = 48, x = 0, y = 0, z = 0) {
    const side = mat.backFaceCulling ? Mesh.DOUBLESIDE : Mesh.FRONTSIDE;
    const l = CreateLathe(this.id("l"), { shape: p.map(([r, yy]) => new Vector3(r, yy, 0)), tessellation: tess, sideOrientation: side }, this.scene);
    return this.put(l, mat, parent, x, y, z);
  }

  sphere(r: number, mat: PBRMaterial, parent: TransformNode | null, x = 0, y = 0, z = 0, seg = 16, slice = 1) {
    return this.put(CreateSphere(this.id("s"), { diameter: r * 2, segments: seg, slice }, this.scene), mat, parent, x, y, z);
  }

  torus(r: number, thick: number, mat: PBRMaterial, parent: TransformNode | null, x = 0, y = 0, z = 0, tess = 32) {
    return this.put(CreateTorus(this.id("t"), { diameter: r * 2, thickness: thick, tessellation: tess }, this.scene), mat, parent, x, y, z);
  }

  capsule(r: number, h: number, mat: PBRMaterial, parent: TransformNode | null, x = 0, y = 0, z = 0) {
    return this.put(CreateCapsule(this.id("k"), { radius: r, height: h, tessellation: 20, subdivisions: 4 }, this.scene), mat, parent, x, y, z);
  }

  tube(path: V3[], r: number, mat: PBRMaterial, parent: TransformNode | null, tess = 12) {
    const t = CreateTube(this.id("u"), { path: path.map((p) => new Vector3(...p)), radius: r, tessellation: tess, cap: Mesh.CAP_ALL }, this.scene);
    return this.put(t, mat, parent, 0, 0, 0);
  }

  /** A textured material for one canvas (labels, signs, posters). */
  texMat(c: HTMLCanvasElement, rough = 0.7, alpha = false) {
    const t = canvasTexture(this.scene, c, this.id("tx"), this.q, alpha);
    this.textures.push(t);
    const mat = new PBRMaterial(this.id("tm"), this.scene);
    mat.albedoTexture = t;
    mat.roughness = rough;
    mat.metallic = 0;
    if (alpha) {
      mat.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHATEST;
      mat.alphaCutOff = 0.35;
      mat.useAlphaFromAlbedoTexture = true;
    }
    return mat;
  }

  /** A flat panel facing +z (toward the student), the canvas reading the right way round. */
  panel(w: number, h: number, mat: PBRMaterial, parent: TransformNode | null, x = 0, y = 0, z = 0) {
    // CreatePlane's front faces -z and its u runs along +x. Turning it round to face +z
    // would mirror the text, so it keeps its orientation and shows its back face instead.
    const p = CreatePlane(this.id("p"), { width: w, height: h, sideOrientation: Mesh.BACKSIDE }, this.scene);
    return this.put(p, mat, parent, x, y, z);
  }

  /**
   * A label wrapped round a cylinder (bottle, flask), centred on +z. Babylon's arc starts
   * at +x and runs toward -z, so it is turned by 3π/2 − arc/2 to face the student.
   */
  labelArc(r: number, h: number, arcRad: number, mat: PBRMaterial, parent: TransformNode | null, y: number) {
    const c = CreateCylinder(this.id("a"), { diameter: r * 2, height: h, tessellation: 32, arc: arcRad / (Math.PI * 2), enclose: false, cap: Mesh.NO_CAP, sideOrientation: Mesh.FRONTSIDE }, this.scene);
    c.rotation.y = (3 * Math.PI) / 2 - arcRad / 2;
    return this.put(c, mat, parent, 0, y, 0);
  }

  label(title: string, lines: string[], o: Parameters<typeof labelCanvas>[2] = {}) {
    return this.texMat(labelCanvas(title, lines, o), 0.72);
  }

  sign(kind: SignKind, caption: string, parent: TransformNode | null, x: number, y: number, z: number, ry: number) {
    const g = this.node(parent, x, y, z, ry);
    this.box(0.31, 0.41, 0.006, this.m.plasticWhite, g, 0, 0, -0.003);
    this.panel(0.3, 0.4, this.texMat(signCanvas(kind, caption), 0.6), g, 0, 0, 0.0005);
    return g;
  }

  poster(title: string, lines: string[], parent: TransformNode | null, x: number, y: number, z: number, ry: number, accent?: string) {
    const g = this.node(parent, x, y, z, ry);
    this.box(0.62, 0.82, 0.008, this.m.brushed, g, 0, 0, -0.004); // aluminium frame
    this.panel(0.6, 0.8, this.texMat(posterCanvas(title, lines, accent), 0.75), g, 0, 0, 0.0008);
    return g;
  }

  /**
   * Thin-instanced decorative bottles on a shelf: one draw call per part however many
   * bottles there are. Amber glass and HDPE are drawn opaque — at shelf distance they
   * read the same, and it keeps dozens of bottles out of the transparency sort.
   */
  bottleRow(parent: TransformNode, count: number, spanX: number, spanZ: number, shelfYs: number[], seed: number) {
    const rng = mulberry(seed);
    const body = this.lathe([[0, 0], [0.032, 0], [0.034, 0.004], [0.034, 0.1], [0.028, 0.118], [0.014, 0.128], [0.014, 0.14]], this.m.amber, parent, 20);
    const white = this.lathe([[0, 0], [0.03, 0], [0.033, 0.006], [0.033, 0.11], [0.022, 0.125], [0.013, 0.13], [0.013, 0.14]], this.m.hdpe, parent, 20);
    const cap = this.cyl(0.016, 0.016, 0.022, this.m.plasticDark, parent, 0, 0, 0, 14);
    const lab = this.cyl(0.0345, 0.0345, 0.05, this.m.paper, parent, 0, 0, 0, 16, { cap: false });
    const parts = [body, white, cap, lab];
    for (const p of parts) p.metadata = { dyn: true };
    const per = Math.ceil(count / shelfYs.length);
    const mtx = (x: number, y: number, z: number, s: number, ry: number) => Matrix.Compose(new Vector3(s, s, s), Quaternion.RotationAxis(Vector3.Up(), ry), new Vector3(x, y, z));
    for (let i = 0; i < count; i++) {
      const y = shelfYs[i % shelfYs.length] + 0.01;
      const x = -spanX / 2 + (spanX * (Math.floor(i / shelfYs.length) + 0.5)) / per + (rng() - 0.5) * 0.02;
      const z = (rng() - 0.5) * spanZ * 0.4;
      const s = 0.8 + rng() * 0.5;
      const ry = (rng() - 0.5) * 0.6;
      (rng() > 0.45 ? body : white).thinInstanceAdd(mtx(x, y, z, s, ry));
      lab.thinInstanceAdd(mtx(x, y + 0.055 * s, z, s, ry));
      cap.thinInstanceAdd(mtx(x, y + 0.15 * s, z, s, ry));
    }
    for (const p of parts) if (!p.hasThinInstances) p.setEnabled(false);
    return parts;
  }
}

// ── Room shell and furniture ─────────────────────────────────────────────────

/** Collider for a box of footprint w × d centred at (x, z), rotated by 0/90/180/270°. */
export function footprint(x: number, z: number, w: number, d: number, rotY = 0, pad = 0.28): Collider {
  const quarter = Math.round(rotY / (Math.PI / 2)) % 2 !== 0;
  const hw = (quarter ? d : w) / 2 + pad;
  const hd = (quarter ? w : d) / 2 + pad;
  return { minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd };
}

/** Floor, ceiling with light panels, walls with a wipeable dado, brand band, windows, door. */
export function roomShell(k: Kit, root: TransformNode, o: { w: number; d: number; h?: number; windowsOn?: "west" }) {
  const { m } = k;
  const h = o.h ?? 3;
  const floor = CreatePlane("floor", { width: o.w, height: o.d }, k.scene);
  floor.rotation.x = Math.PI / 2;
  floor.material = m.floor;
  floor.parent = root;
  floor.isPickable = false;
  k.box(o.w, 0.02, o.d, m.ceiling, root, 0, h + 0.01, 0);
  const walls: [number, number, number, number, Mats[keyof Mats]][] = [
    [o.w, 0, -o.d / 2, 0, m.wall],
    [o.w, 0, o.d / 2, Math.PI, m.wallAccent],
    [o.d, -o.w / 2, 0, Math.PI / 2, m.wall],
    [o.d, o.w / 2, 0, -Math.PI / 2, m.wall],
  ];
  for (const [len, x, z, ry, mat] of walls) {
    const g = k.node(root, x, 0, z, ry);
    k.box(len, h, 0.04, mat as PBRMaterial, g, 0, h / 2, -0.02);
    k.box(len, 1.05, 0.006, m.dado, g, 0, 0.645, 0.003);
    k.box(len, 0.05, 0.006, m.accentBlue, g, 0, 2.25, 0.004);
    k.box(len, 0.12, 0.02, m.skirting, g, 0, 0.06, 0.01);
  }
  if (o.windowsOn === "west") {
    const count = Math.max(2, Math.floor(o.d / 2.6));
    for (let i = 0; i < count; i++) {
      const t = -o.d / 2 + (o.d / count) * (i + 0.5);
      const g = k.node(root, -o.w / 2 + 0.02, 1.75, t, Math.PI / 2);
      k.box(1.6, 1.3, 0.02, m.window, g);
      for (const dx of [-0.81, 0.81]) k.box(0.04, 1.36, 0.06, m.plasticWhite, g, dx, 0, 0.02);
      for (const dy of [-0.66, 0, 0.66]) k.box(1.66, 0.04, 0.06, m.plasticWhite, g, 0, dy, 0.02);
      k.box(0.03, 1.3, 0.05, m.plasticWhite, g, 0, 0, 0.02);
      k.box(1.7, 0.03, 0.12, m.plasticWhite, g, 0, -0.68, 0.05); // sill
    }
  }
  const door = k.node(root, -o.w / 2 + 1.3, 0, o.d / 2 - 0.03, Math.PI);
  k.box(1.0, 2.1, 0.05, m.cabinet, door, 0, 1.05, 0);
  k.box(1.08, 0.05, 0.07, m.plasticWhite, door, 0, 2.125, 0);
  k.box(0.35, 0.5, 0.06, m.window, door, 0.15, 1.55, 0);
  k.box(0.14, 0.025, 0.05, m.chrome, door, -0.36, 1.0, 0.04);
  k.box(0.6, 0.15, 0.01, m.accentGreen, door, 0, 2.3, 0.03); // exit-sign housing colour
  const cols = Math.max(2, Math.round(o.w / 2.4));
  const rows = Math.max(2, Math.round(o.d / 2.4));
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const x = -o.w / 2 + (o.w / cols) * (i + 0.5);
      const z = -o.d / 2 + (o.d / rows) * (j + 0.5);
      k.box(1.24, 0.03, 0.64, m.brushed, root, x, h - 0.012, z);
      k.box(1.2, 0.01, 0.6, m.lightPanel, root, x, h - 0.03, z);
    }
  return { bounds: { minX: -o.w / 2 + 0.35, maxX: o.w / 2 - 0.35, minZ: -o.d / 2 + 0.35, maxZ: o.d / 2 - 0.35 } as Collider, h };
}

export interface BenchOpts {
  w: number;
  d?: number;
  top?: "epoxy" | "white";
  backsplash?: boolean;
  sink?: boolean;
}

/** Laboratory bench: plinth, carcass, drawer stacks and doors with bar pulls, solid top. */
export function bench(k: Kit, parent: TransformNode, o: BenchOpts) {
  const { m } = k;
  const d = o.d ?? 0.75;
  const g = k.node(parent);
  const top = o.top === "white" ? m.resinWhiteTop : m.epoxyTop;
  k.box(o.w - 0.06, 0.1, d - 0.1, m.plinth, g, 0, 0.05, -0.03);
  k.box(o.w - 0.02, 0.76, d - 0.04, m.cabinet, g, 0, 0.48, -0.01);
  const units = Math.max(1, Math.round(o.w / 0.6));
  const uw = (o.w - 0.04) / units;
  const pull = (x: number, y: number, len: number, vertical: boolean) => {
    k.box(vertical ? 0.012 : len, vertical ? len : 0.012, 0.012, m.steel, g, x, y, d / 2 + 0.016);
    for (const s of [-1, 1]) k.box(0.008, 0.008, 0.016, m.steel, g, x + (vertical ? 0 : (s * len) / 2.4), y + (vertical ? (s * len) / 2.4 : 0), d / 2 + 0.006);
  };
  for (let i = 0; i < units; i++) {
    const x = -o.w / 2 + 0.02 + uw * (i + 0.5);
    if (i % 3 === 0) {
      for (let r = 0; r < 3; r++) {
        k.box(uw - 0.02, 0.22, 0.02, m.cabinetDoor, g, x, 0.24 + r * 0.24, d / 2 - 0.02);
        pull(x, 0.31 + r * 0.24, uw * 0.4, false);
      }
    } else {
      k.box(uw - 0.02, 0.7, 0.02, m.cabinetDoor, g, x, 0.48, d / 2 - 0.02);
      pull(x + uw / 2 - 0.06, 0.7, 0.14, true);
    }
  }
  k.box(o.w, 0.035, d, top, g, 0, 0.8925, 0);
  k.box(o.w, 0.008, 0.012, m.plinth, g, 0, 0.874, d / 2 - 0.004); // drip edge
  if (o.backsplash) k.box(o.w, 0.12, 0.015, top, g, 0, 0.97, -d / 2 + 0.008);
  if (o.sink) {
    const s = k.node(g, o.w / 2 - 0.45, 0, 0);
    k.box(0.52, 0.012, 0.42, m.steel, s, 0, 0.913, 0);
    k.box(0.46, 0.006, 0.36, m.darkMetal, s, 0, 0.917, 0);
    k.cyl(0.02, 0.02, 0.02, m.chrome, s, 0, 0.92, 0.0, 16);
    // gooseneck laboratory tap with two lever handles
    k.cyl(0.014, 0.016, 0.04, m.chrome, s, 0, 0.93, -0.17, 16);
    k.tube([[0, 0.93, -0.17], [0, 1.18, -0.17], [0, 1.25, -0.12], [0, 1.22, -0.06], [0, 1.15, -0.05]], 0.009, m.chrome, s);
    for (const dx of [-0.07, 0.07]) {
      k.cyl(0.01, 0.01, 0.04, m.chrome, s, dx, 0.94, -0.17, 12);
      k.box(0.012, 0.01, 0.08, dx < 0 ? m.accentBlue : m.red, s, dx, 0.965, -0.14);
    }
  }
  return g;
}

/**
 * A back-to-back island: two benches, a central service spine (sockets and gas/vacuum
 * taps) and a two-tier reagent shelf of thin-instanced bottles.
 */
export function island(k: Kit, parent: TransformNode, w: number, top: "epoxy" | "white", seed: number) {
  const { m } = k;
  const g = k.node(parent);
  const front = bench(k, g, { w, top });
  front.position.z = 0.375;
  const back = bench(k, g, { w, top });
  back.position.z = -0.375;
  back.rotation.y = Math.PI;
  // service spine
  k.box(w, 0.16, 0.12, m.cabinet, g, 0, 0.99, 0);
  for (let x = -w / 2 + 0.35; x < w / 2 - 0.2; x += 0.9) {
    k.box(0.08, 0.08, 0.004, m.plasticWhite, g, x, 0.99, 0.062);
    k.box(0.05, 0.012, 0.004, m.plasticDark, g, x, 0.99, 0.065);
    k.cyl(0.008, 0.008, 0.03, m.yellow, g, x + 0.2, 0.99, 0.07, 12).rotation.x = Math.PI / 2;
  }
  // shelf
  for (const x of [-w / 2 + 0.05, w / 2 - 0.05]) k.box(0.04, 0.85, 0.04, m.brushed, g, x, 1.33, 0);
  for (const y of [1.3, 1.65]) {
    k.box(w - 0.04, 0.02, 0.28, m.resinWhiteTop, g, 0, y, 0);
    k.box(w - 0.04, 0.04, 0.006, m.brushed, g, 0, y + 0.02, 0.14); // bottle rail
  }
  k.bottleRow(g, Math.round(w * 9), w - 0.2, 0.2, [1.3, 1.65], seed);
  return g;
}

export function wallUnits(k: Kit, parent: TransformNode, w: number) {
  const { m } = k;
  const g = k.node(parent);
  k.box(w, 0.7, 0.35, m.cabinet, g, 0, 1.95, 0);
  const n = Math.max(1, Math.round(w / 0.6));
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (w / n) * (i + 0.5);
    k.box(w / n - 0.02, 0.66, 0.02, m.cabinetDoor, g, x, 1.95, 0.18);
    k.box(0.012, 0.12, 0.012, m.steel, g, x + w / n / 2 - 0.06, 1.75, 0.2);
  }
  k.box(w, 0.03, 0.3, m.lightPanel, g, 0, 1.585, 0.02); // under-cabinet task light
  return g;
}

/** Fume cupboard: carcass, sash, baffle, light, airflow monitor and a service valve. */
export function fumeHood(k: Kit, parent: TransformNode, w = 1.5) {
  const { m } = k;
  const g = k.node(parent);
  const d = 0.85;
  k.box(w, 0.86, d, m.cabinet, g, 0, 0.43, 0);
  k.box(w, 0.035, d, m.resinWhiteTop, g, 0, 0.88, 0);
  k.box(0.06, 1.5, d, m.cabinetDoor, g, -w / 2 + 0.03, 1.65, 0);
  k.box(0.06, 1.5, d, m.cabinetDoor, g, w / 2 - 0.03, 1.65, 0);
  k.box(w, 0.06, d, m.cabinetDoor, g, 0, 2.38, 0);
  k.box(w - 0.1, 1.5, 0.03, m.cabinet, g, 0, 1.65, -d / 2 + 0.03);
  for (const y of [1.2, 1.55, 1.9]) k.box(w - 0.12, 0.012, 0.02, m.plasticGrey, g, 0, y, -d / 2 + 0.05); // baffle slots
  k.box(w - 0.12, 0.7, 0.012, m.glass, g, 0, 1.45, d / 2 - 0.05);
  k.box(w - 0.1, 0.05, 0.05, m.cabinetDoor, g, 0, 1.1, d / 2 - 0.05);
  k.box(w - 0.1, 0.32, 0.06, m.cabinetDoor, g, 0, 2.18, d / 2 - 0.03);
  k.box(w - 0.4, 0.03, 0.12, m.lightPanel, g, 0, 2.31, 0);
  k.box(0.14, 0.08, 0.02, m.screen, g, w / 2 - 0.2, 2.18, d / 2 + 0.005);
  k.box(0.02, 0.02, 0.006, m.accentGreen, g, w / 2 - 0.24, 2.19, d / 2 + 0.016);
  return g;
}

/** Tall glass-fronted cabinet; `fill` puts its shelves' contents in. */
export function glassCabinet(k: Kit, parent: TransformNode, w = 1.0, fill?: (shelf: TransformNode, y: number, i: number) => void) {
  const { m } = k;
  const g = k.node(parent);
  const d = 0.45;
  k.box(w, 2.0, 0.02, m.cabinet, g, 0, 1.0, -d / 2 + 0.01);
  for (const x of [-w / 2 + 0.01, w / 2 - 0.01]) k.box(0.02, 2.0, d, m.cabinet, g, x, 1.0, 0);
  k.box(w, 0.08, d, m.cabinet, g, 0, 0.04, 0);
  k.box(w, 0.04, d + 0.02, m.cabinet, g, 0, 2.02, 0);
  [0.12, 0.55, 1.0, 1.45].forEach((y, i) => {
    k.box(w - 0.04, 0.02, d - 0.04, m.cabinetDoor, g, 0, y, 0);
    if (fill) fill(g, y + 0.01, i);
  });
  for (const x of [-w / 4, w / 4]) {
    k.box(w / 2 - 0.02, 1.86, 0.008, m.glass, g, x, 1.03, d / 2 + 0.004);
    for (const dx of [-(w / 4) + 0.012, w / 4 - 0.012]) k.box(0.024, 1.88, 0.02, m.plasticWhite, g, x + dx, 1.03, d / 2 + 0.006);
    for (const y of [0.09, 1.97]) k.box(w / 2 - 0.02, 0.024, 0.02, m.plasticWhite, g, x, y, d / 2 + 0.006);
    k.box(0.012, 0.16, 0.012, m.steel, g, x + (x < 0 ? w / 4 - 0.05 : -w / 4 + 0.05), 1.05, d / 2 + 0.024);
  }
  return g;
}

export function stool(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.cyl(0.18, 0.17, 0.06, m.plasticDark, g, 0, 0.66, 0, 28);
  k.cyl(0.025, 0.025, 0.5, m.chrome, g, 0, 0.38, 0, 12);
  k.torus(0.17, 0.022, m.chrome, g, 0, 0.3, 0, 32);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = k.box(0.3, 0.025, 0.04, m.plasticDark, g, Math.cos(a) * 0.15, 0.05, -Math.sin(a) * 0.15);
    leg.rotation.y = a;
    k.cyl(0.02, 0.02, 0.03, m.rubber, g, Math.cos(a) * 0.29, 0.02, -Math.sin(a) * 0.29, 10);
  }
  return g;
}

export function wasteBin(k: Kit, parent: TransformNode, mat: PBRMaterial) {
  const g = k.node(parent);
  k.cyl(0.16, 0.14, 0.5, mat, g, 0, 0.25, 0, 24);
  k.cyl(0.17, 0.17, 0.03, k.m.plasticDark, g, 0, 0.51, 0, 24);
  k.box(0.08, 0.02, 0.04, k.m.plasticDark, g, 0, 0.53, 0.12);
  return g;
}

export function eyewash(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.cyl(0.02, 0.02, 1.0, m.greenSafety, g, 0, 0.5, 0, 12);
  k.cyl(0.16, 0.12, 0.08, m.greenSafety, g, 0, 1.04, 0, 24);
  for (const x of [-0.05, 0.05]) k.cyl(0.02, 0.02, 0.05, m.yellow, g, x, 1.1, 0, 12);
  k.box(0.06, 0.25, 0.02, m.yellow, g, 0.18, 1.0, 0); // push flag
  return g;
}

export function extinguisher(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.cyl(0.08, 0.08, 0.5, m.red, g, 0, 0.55, 0, 24);
  k.sphere(0.08, m.red, g, 0, 0.8, 0, 16, 0.5);
  k.cyl(0.02, 0.02, 0.08, m.darkMetal, g, 0, 0.88, 0, 12);
  k.box(0.14, 0.02, 0.03, m.darkMetal, g, 0.03, 0.93, 0);
  k.tube([[0.03, 0.88, 0], [0.09, 0.8, 0.04], [0.09, 0.5, 0.08]], 0.008, m.rubber, g);
  k.box(0.06, 0.12, 0.004, m.paper, g, 0, 0.58, 0.081);
  return g;
}

export function firstAid(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.42, 0.32, 0.14, m.greenSafety, g);
  k.box(0.06, 0.18, 0.004, m.plasticWhite, g, 0, 0, 0.071);
  k.box(0.18, 0.06, 0.004, m.plasticWhite, g, 0, 0, 0.071);
  return g;
}

export function coatHook(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.5, 0.04, 0.03, m.brushed, g, 0, 1.75, 0);
  k.capsule(0.05, 0.9, m.plasticWhite, g, -0.08, 1.3, 0.05).scaling.set(1.8, 1, 0.8);
  k.capsule(0.05, 0.9, m.plasticWhite, g, 0.08, 1.3, 0.05).scaling.set(1.8, 1, 0.8);
  return g;
}

/** Safety-sign kinds re-exported for the room. */
export type { SignKind };
