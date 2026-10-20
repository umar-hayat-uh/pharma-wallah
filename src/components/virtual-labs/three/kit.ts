/**
 * Modular room kit — original procedural models (no downloaded meshes), true to scale
 * in metres: bench tops at 0.90 m, 0.75 m deep; wall shelves at 1.25–1.85 m; 3.0 m
 * ceilings. Every builder returns plain THREE objects plus the floor-plane collider the
 * walker must not enter. Geometry is cached by key and shared; repeated decorative items
 * (reagent bottles, ceiling panels) are instanced.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { MaterialLib } from "./materials";
import type { Collider } from "./types";
import { mulberry, posterTexture, signTexture, type SignKind } from "./textures";

const geoCache = new Map<string, THREE.BufferGeometry>();
export function cachedGeo<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  if (!geoCache.has(key)) geoCache.set(key, make());
  return geoCache.get(key) as T;
}
export function disposeKitCache() {
  geoCache.forEach((g) => g.dispose());
  geoCache.clear();
}

export const rbox = (w: number, h: number, d: number, r = 0.01, seg = 3) =>
  cachedGeo(`rb:${w}:${h}:${d}:${r}:${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, r));
export const box = (w: number, h: number, d: number) => cachedGeo(`b:${w}:${h}:${d}`, () => new THREE.BoxGeometry(w, h, d));
export const cyl = (rt: number, rb: number, h: number, seg = 32) => cachedGeo(`c:${rt}:${rb}:${h}:${seg}`, () => new THREE.CylinderGeometry(rt, rb, h, seg));

export function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0, shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = shadow;
  m.receiveShadow = true;
  return m;
}

/** Collider for a box of footprint w × d centred at (x, z), rotated by 0/90/180/270°. */
export function footprint(x: number, z: number, w: number, d: number, rotY = 0, pad = 0.28): Collider {
  const quarter = Math.round(rotY / (Math.PI / 2)) % 2 !== 0;
  const hw = (quarter ? d : w) / 2 + pad;
  const hd = (quarter ? w : d) / 2 + pad;
  return { minX: x - hw, maxX: x + hw, minZ: z - hd, maxZ: z + hd };
}

// ── Shell ──────────────────────────────────────────────────────────────────

export interface ShellOpts {
  w: number; // x extent
  d: number; // z extent
  h?: number;
  windowsOn?: "north" | "east" | "west" | null;
  accent?: "blue" | "green";
}

/** Floor, ceiling with light panels, four walls with windows, skirting, door. */
export function roomShell(m: MaterialLib, o: ShellOpts) {
  const h = o.h ?? 3;
  const g = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.d), m.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(o.w, o.d), m.ceiling);
  ceil.rotation.x = Math.PI / 2;
  ceil.position.y = h;
  g.add(ceil);

  const wall = (len: number, x: number, z: number, ry: number, mat: THREE.Material) => {
    const wm = new THREE.Mesh(new THREE.PlaneGeometry(len, h), mat);
    wm.position.set(x, h / 2, z);
    wm.rotation.y = ry;
    wm.receiveShadow = true;
    g.add(wm);
    const sk = mesh(box(len, 0.12, 0.02), m.skirting, x, 0.06, z, false);
    sk.rotation.y = ry;
    sk.translateZ(0.011);
    g.add(sk);
  };
  const accentMat = o.accent === "green" ? new THREE.MeshStandardMaterial({ color: 0xdff3ea, roughness: 0.9 }) : m.wallAccent;
  wall(o.w, 0, -o.d / 2, 0, m.wall); // north
  wall(o.w, 0, o.d / 2, Math.PI, accentMat); // south (behind the spawn)
  wall(o.d, -o.w / 2, 0, Math.PI / 2, m.wall); // west
  wall(o.d, o.w / 2, 0, -Math.PI / 2, m.wall); // east

  // a pale lower-wall panel (wipeable laboratory finish) so walls are not one flat plane
  const dado = new THREE.MeshStandardMaterial({ color: o.accent === "green" ? 0xe4efe9 : 0xe2e9ef, roughness: 0.6 });
  for (const [len, x, z, ry] of [
    [o.w, 0, -o.d / 2 + 0.006, 0],
    [o.w, 0, o.d / 2 - 0.006, Math.PI],
    [o.d, -o.w / 2 + 0.006, 0, Math.PI / 2],
    [o.d, o.w / 2 - 0.006, 0, -Math.PI / 2],
  ] as [number, number, number, number][]) {
    const pnl = mesh(box(len, 1.05, 0.004), dado, x, 0.645, z, false);
    pnl.rotation.y = ry;
    g.add(pnl);
  }
  // a band of brand colour at dado height on every wall
  const bandMat = o.accent === "green" ? m.accentGreen : m.accentBlue;
  for (const [len, x, z, ry] of [
    [o.w, 0, -o.d / 2 + 0.012, 0],
    [o.w, 0, o.d / 2 - 0.012, Math.PI],
    [o.d, -o.w / 2 + 0.012, 0, Math.PI / 2],
    [o.d, o.w / 2 - 0.012, 0, -Math.PI / 2],
  ] as [number, number, number, number][]) {
    const b = mesh(box(len, 0.05, 0.004), bandMat, x, 2.25, z, false);
    b.rotation.y = ry;
    g.add(b);
  }

  // windows: emissive panes with frames and mullions
  if (o.windowsOn) {
    const along = o.windowsOn === "north" ? o.w : o.d;
    const count = Math.max(2, Math.floor(along / 2.6));
    for (let i = 0; i < count; i++) {
      const t = -along / 2 + (along / count) * (i + 0.5);
      const win = new THREE.Group();
      win.add(mesh(box(1.6, 1.3, 0.02), m.window, 0, 0, 0, false));
      for (const dx of [-0.81, 0.81]) win.add(mesh(box(0.04, 1.36, 0.06), m.plasticWhite, dx, 0, 0.02, false));
      for (const dy of [-0.66, 0, 0.66]) win.add(mesh(box(1.66, 0.04, 0.06), m.plasticWhite, 0, dy, 0.02, false));
      win.add(mesh(box(0.03, 1.3, 0.05), m.plasticWhite, 0, 0, 0.02, false));
      if (o.windowsOn === "north") win.position.set(t, 1.75, -o.d / 2 + 0.02);
      else {
        win.position.set(o.windowsOn === "east" ? o.w / 2 - 0.02 : -o.w / 2 + 0.02, 1.75, t);
        win.rotation.y = o.windowsOn === "east" ? -Math.PI / 2 : Math.PI / 2;
      }
      g.add(win);
    }
  }

  // door on the south wall
  const door = new THREE.Group();
  door.add(mesh(box(1.0, 2.1, 0.05), m.cabinet, 0, 1.05, 0, false));
  door.add(mesh(box(0.35, 0.5, 0.06), m.window, 0.15, 1.55, 0, false));
  door.add(mesh(box(0.14, 0.025, 0.05), m.chrome, -0.36, 1.0, 0.04, false));
  door.position.set(-o.w / 2 + 1.3, 0, o.d / 2 - 0.03);
  door.rotation.y = Math.PI;
  g.add(door);

  // ceiling light panels — one instanced mesh
  const cols = Math.max(2, Math.round(o.w / 2.4));
  const rows = Math.max(2, Math.round(o.d / 2.4));
  const panels = new THREE.InstancedMesh(box(1.2, 0.03, 0.6), m.lightPanel, cols * rows);
  const mtx = new THREE.Matrix4();
  let k = 0;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      mtx.makeTranslation(-o.w / 2 + (o.w / cols) * (i + 0.5), h - 0.02, -o.d / 2 + (o.d / rows) * (j + 0.5));
      panels.setMatrixAt(k++, mtx);
    }
  g.add(panels);
  return { group: g, bounds: { minX: -o.w / 2 + 0.35, maxX: o.w / 2 - 0.35, minZ: -o.d / 2 + 0.35, maxZ: o.d / 2 - 0.35 } as Collider, h };
}

// ── Furniture ─────────────────────────────────────────────────────────────

export interface BenchOpts {
  w: number;
  d?: number;
  top?: "epoxy" | "white" | "wood";
  shelf?: boolean; // reagent shelf above the bench (island benches)
  backsplash?: boolean;
  sink?: boolean;
  seed?: number;
}

/** A laboratory bench: base cabinets, drawers, handles, a solid top, optional shelf and sink. */
export function bench(m: MaterialLib, o: BenchOpts) {
  const d = o.d ?? 0.75;
  const g = new THREE.Group();
  const topMat = o.top === "white" ? m.resinWhiteTop : o.top === "wood" ? m.woodTop : m.epoxyTop;
  // plinth and carcass
  g.add(mesh(box(o.w - 0.04, 0.1, d - 0.08), m.plasticDark, 0, 0.05, -0.02, false));
  g.add(mesh(box(o.w - 0.02, 0.76, d - 0.04), m.cabinet, 0, 0.48, -0.01));
  const units = Math.max(1, Math.round(o.w / 0.6));
  const uw = (o.w - 0.04) / units;
  for (let i = 0; i < units; i++) {
    const x = -o.w / 2 + 0.02 + uw * (i + 0.5);
    const drawer = i % 3 === 0;
    if (drawer) {
      for (let r = 0; r < 3; r++) {
        g.add(mesh(rbox(uw - 0.02, 0.22, 0.02, 0.004), m.cabinetDoor, x, 0.24 + r * 0.24, d / 2 - 0.02, false));
        g.add(mesh(box(uw * 0.4, 0.015, 0.02), m.chrome, x, 0.31 + r * 0.24, d / 2 + 0.005, false));
      }
    } else {
      g.add(mesh(rbox(uw - 0.02, 0.7, 0.02, 0.004), m.cabinetDoor, x, 0.48, d / 2 - 0.02, false));
      g.add(mesh(box(0.015, 0.14, 0.02), m.chrome, x + uw / 2 - 0.06, 0.72, d / 2 + 0.005, false));
    }
  }
  // top
  g.add(mesh(rbox(o.w, 0.035, d, 0.008), topMat, 0, 0.8925, 0));
  if (o.backsplash) g.add(mesh(box(o.w, 0.12, 0.015), topMat, 0, 0.97, -d / 2 + 0.008));
  if (o.sink) {
    const s = new THREE.Group();
    s.add(mesh(box(0.5, 0.012, 0.4), m.darkMetal, 0, 0.912, 0, false));
    s.add(mesh(cyl(0.012, 0.012, 0.3, 12), m.chrome, 0, 1.06, -0.17));
    const spout = mesh(cyl(0.01, 0.01, 0.18, 12), m.chrome, 0, 1.2, -0.09);
    spout.rotation.x = Math.PI / 2;
    s.add(spout);
    s.position.x = o.w / 2 - 0.45;
    g.add(s);
  }
  if (o.shelf) {
    const sh = new THREE.Group();
    for (const x of [-o.w / 2 + 0.05, o.w / 2 - 0.05]) sh.add(mesh(box(0.04, 0.85, 0.04), m.brushed, x, 1.33, 0));
    for (const y of [1.3, 1.65]) sh.add(mesh(rbox(o.w - 0.04, 0.02, 0.28, 0.005), m.resinWhiteTop, 0, y, 0));
    sh.add(reagentBottles(m, Math.round(o.w * 9), o.w - 0.2, 0.2, [1.3, 1.65], o.seed ?? 1));
    g.add(sh);
  }
  return g;
}

/** Decorative reagent bottles as ONE instanced mesh per material (glass caps + bodies). */
export function reagentBottles(m: MaterialLib, count: number, spanX: number, spanZ: number, shelfYs: number[], seed: number) {
  const g = new THREE.Group();
  const rng = mulberry(seed);
  const bodyGeo = cachedGeo("bottleBody", () => {
    const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(0.032, 0), new THREE.Vector2(0.034, 0.004), new THREE.Vector2(0.034, 0.1), new THREE.Vector2(0.028, 0.118), new THREE.Vector2(0.014, 0.128), new THREE.Vector2(0.014, 0.14)];
    return new THREE.LatheGeometry(pts, 20);
  });
  const capGeo = cyl(0.016, 0.016, 0.022, 14);
  const labelGeo = cachedGeo("bottleLabel", () => new THREE.CylinderGeometry(0.0345, 0.0345, 0.05, 20, 1, true, -0.9, 1.8));
  const bodies = new THREE.InstancedMesh(bodyGeo, m.amberGlass, count);
  const clear = new THREE.InstancedMesh(bodyGeo, m.glass, count);
  const caps = new THREE.InstancedMesh(capGeo, m.plasticDark, count);
  const labels = new THREE.InstancedMesh(labelGeo, m.paper, count);
  const mtx = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3(1, 1, 1);
  let nb = 0;
  let nc = 0;
  for (let i = 0; i < count; i++) {
    const y = shelfYs[i % shelfYs.length] + 0.01;
    const x = -spanX / 2 + (spanX * (Math.floor(i / shelfYs.length) + 0.5)) / Math.ceil(count / shelfYs.length) + (rng() - 0.5) * 0.02;
    const z = (rng() - 0.5) * spanZ * 0.4;
    const sc = 0.8 + rng() * 0.5;
    s.set(sc, sc, sc);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (rng() - 0.5) * 0.6);
    mtx.compose(new THREE.Vector3(x, y, z), q, s);
    if (rng() > 0.45) bodies.setMatrixAt(nb++, mtx);
    else clear.setMatrixAt(nc++, mtx);
    labels.setMatrixAt(i, mtx.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.055, 0)));
    caps.setMatrixAt(i, mtx.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.15, 0)));
  }
  bodies.count = nb;
  clear.count = nc;
  for (const im of [bodies, clear, caps, labels]) {
    im.castShadow = true;
    g.add(im);
  }
  return g;
}

/** Tall storage cabinet with glass doors and bottles inside. */
export function storageCabinet(m: MaterialLib, w = 1.0, seed = 3) {
  const g = new THREE.Group();
  const d = 0.45;
  g.add(mesh(box(w, 2.0, d), m.cabinet, 0, 1.0, 0));
  for (const y of [0.55, 1.0, 1.45]) g.add(mesh(box(w - 0.06, 0.02, d - 0.06), m.cabinetDoor, 0, y, 0.0, false));
  g.add(reagentBottles(m, 18, w - 0.15, 0.25, [0.56, 1.01, 1.46], seed));
  for (const x of [-w / 4, w / 4]) {
    g.add(mesh(box(w / 2 - 0.03, 1.85, 0.012), m.glass, x, 1.0, d / 2 + 0.005, false));
    g.add(mesh(box(0.015, 0.16, 0.02), m.chrome, x + (x < 0 ? w / 4 - 0.05 : -w / 4 + 0.05), 1.05, d / 2 + 0.02, false));
  }
  g.add(mesh(box(w, 0.04, d + 0.02), m.cabinet, 0, 2.02, 0));
  return g;
}

/** Fume cupboard: carcass, sash window, baffle, light, airflow monitor. */
export function fumeHood(m: MaterialLib, w = 1.5) {
  const g = new THREE.Group();
  const d = 0.85;
  g.add(mesh(box(w, 0.86, d), m.cabinet, 0, 0.43, 0));
  g.add(mesh(rbox(w, 0.035, d, 0.006), m.resinWhiteTop, 0, 0.88, 0));
  g.add(mesh(box(0.06, 1.5, d), m.cabinetDoor, -w / 2 + 0.03, 1.65, 0));
  g.add(mesh(box(0.06, 1.5, d), m.cabinetDoor, w / 2 - 0.03, 1.65, 0));
  g.add(mesh(box(w, 0.06, d), m.cabinetDoor, 0, 2.38, 0));
  g.add(mesh(box(w - 0.1, 1.5, 0.03), m.cabinet, 0, 1.65, -d / 2 + 0.03));
  g.add(mesh(box(w - 0.12, 0.7, 0.012), m.glass, 0, 1.45, d / 2 - 0.05, false));
  g.add(mesh(box(w - 0.1, 0.05, 0.05), m.cabinetDoor, 0, 1.1, d / 2 - 0.05, false));
  g.add(mesh(box(w - 0.1, 0.32, 0.06), m.cabinetDoor, 0, 2.18, d / 2 - 0.03, false));
  const lamp = mesh(box(w - 0.4, 0.03, 0.12), m.lightPanel, 0, 2.31, 0, false);
  g.add(lamp);
  g.add(mesh(box(0.14, 0.08, 0.02), m.screen, w / 2 - 0.2, 2.18, d / 2 + 0.005, false));
  return g;
}

export function eyewashStation(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.02, 0.02, 1.0, 12), m.greenSafety, 0, 0.5, 0));
  g.add(mesh(cyl(0.16, 0.12, 0.08, 24), m.greenSafety, 0, 1.04, 0));
  for (const x of [-0.05, 0.05]) g.add(mesh(cyl(0.02, 0.02, 0.05, 12), m.yellow, x, 1.1, 0));
  g.add(mesh(box(0.3, 0.42, 0.01), new THREE.MeshStandardMaterial({ map: signTexture("eyewash", "Eye wash station"), roughness: 0.6 }), 0, 1.6, -0.12, false));
  return g;
}

export function extinguisher(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.08, 0.08, 0.5, 24), m.red, 0, 0.55, 0));
  g.add(mesh(new THREE.SphereGeometry(0.08, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), m.red, 0, 0.8, 0));
  g.add(mesh(cyl(0.02, 0.02, 0.08, 12), m.darkMetal, 0, 0.88, 0));
  g.add(mesh(box(0.14, 0.02, 0.03), m.darkMetal, 0.03, 0.93, 0));
  g.add(mesh(box(0.06, 0.12, 0.012), m.paper, 0, 0.58, 0.081, false));
  g.add(mesh(box(0.3, 0.42, 0.01), new THREE.MeshStandardMaterial({ map: signTexture("extinguisher", "Fire extinguisher"), roughness: 0.6 }), 0, 1.5, -0.1, false));
  return g;
}

export function firstAid(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(rbox(0.42, 0.32, 0.14, 0.02), m.greenSafety, 0, 0, 0));
  g.add(mesh(box(0.06, 0.18, 0.005), m.plasticWhite, 0, 0, 0.072, false));
  g.add(mesh(box(0.18, 0.06, 0.005), m.plasticWhite, 0, 0, 0.072, false));
  return g;
}

/** Wall sign (ISO-style), 0.3 × 0.4 m. */
export function wallSign(kind: SignKind, caption: string) {
  const mat = new THREE.MeshStandardMaterial({ map: signTexture(kind, caption), roughness: 0.6 });
  return mesh(box(0.3, 0.4, 0.008), mat, 0, 0, 0, false);
}

export function poster(title: string, lines: string[], accent?: string) {
  const mat = new THREE.MeshStandardMaterial({ map: posterTexture(title, lines, accent), roughness: 0.75 });
  return mesh(box(0.6, 0.8, 0.006), mat, 0, 0, 0, false);
}

export function stool(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.18, 0.18, 0.06, 28), m.plasticDark, 0, 0.66, 0));
  g.add(mesh(cyl(0.025, 0.025, 0.5, 12), m.chrome, 0, 0.38, 0));
  g.add(mesh(new THREE.TorusGeometry(0.17, 0.012, 8, 32), m.chrome, 0, 0.3, 0).rotateX(Math.PI / 2));
  for (let i = 0; i < 5; i++) {
    const leg = mesh(box(0.3, 0.025, 0.04), m.plasticDark, 0, 0.05, 0);
    leg.rotation.y = (i / 5) * Math.PI * 2;
    leg.translateX(0.15);
    g.add(leg);
  }
  return g;
}

export function wasteBin(m: MaterialLib, color: THREE.Material) {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.16, 0.14, 0.5, 24), color, 0, 0.25, 0));
  g.add(mesh(cyl(0.17, 0.17, 0.03, 24), m.plasticDark, 0, 0.51, 0));
  return g;
}

/** A slim wall-mounted cabinet run above a perimeter bench. */
export function wallUnits(m: MaterialLib, w: number) {
  const g = new THREE.Group();
  g.add(mesh(box(w, 0.7, 0.35), m.cabinet, 0, 1.95, 0));
  const n = Math.max(1, Math.round(w / 0.6));
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (w / n) * (i + 0.5);
    g.add(mesh(rbox(w / n - 0.02, 0.66, 0.02, 0.004), m.cabinetDoor, x, 1.95, 0.18, false));
    g.add(mesh(box(0.015, 0.12, 0.02), m.chrome, x + (w / n) / 2 - 0.06, 1.75, 0.195, false));
  }
  return g;
}

/** Laboratory coat on a wall hook — set dressing near the door. */
export function coatHook(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(box(0.5, 0.04, 0.03), m.brushed, 0, 1.75, 0));
  const coat = mesh(rbox(0.36, 0.9, 0.08, 0.03), m.plasticWhite, 0, 1.3, 0.05);
  g.add(coat);
  return g;
}
