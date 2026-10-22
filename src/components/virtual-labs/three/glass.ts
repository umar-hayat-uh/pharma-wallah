/**
 * Laboratory glassware, turned on a lathe from real dimensions (metres). A vessel keeps
 * its INNER profile so a liquid can be rebuilt for any volume: V(h) = ∫ π r(y)² dy,
 * solved numerically, so "28.55 mL in a 250 mL conical flask" sits at the height it
 * would in the real flask and a burette meniscus lines up with its graduations.
 */
import * as THREE from "three";
import type { MaterialLib } from "./materials";
import { cachedGeo, cyl, mesh } from "./kit";
import { graduationTexture, labelTexture } from "./textures";
import { heightForVolume, radiusAt, type Profile } from "../vessel";

export { heightForVolume };

const lathe = (p: Profile, seg = 48) => new THREE.LatheGeometry(p.map(([r, y]) => new THREE.Vector2(r, y)), seg);

/** A liquid body filling an inner profile to height h (with a flat surface). */
function liquidGeometry(p: Profile, h: number) {
  const pts: Profile = [[0, p[0][1] + 0.0005]];
  for (const [r, y] of p) {
    if (y >= h) break;
    pts.push([Math.max(0, r - 0.0004), y + 0.0005]);
  }
  pts.push([Math.max(0, radiusAt(p, h) - 0.0004), h], [0, h]);
  return lathe(pts, 40);
}

export function liquidMaterial(color = 0xdff1ff, opacity = 0.4) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.05, transparent: true, opacity, envMapIntensity: 1, depthWrite: false });
}

/** A fillable vessel: outer glass, inner profile, and a setter for volume and colour. */
export function makeVessel(m: MaterialLib, outer: Profile, inner: Profile, key: string) {
  const group = new THREE.Group();
  const glass = new THREE.Mesh(cachedGeo(`vessel:${key}`, () => lathe([...outer, ...[...inner].reverse()])), m.glass);
  glass.castShadow = true;
  glass.renderOrder = 2;
  group.add(glass);
  const liquidMat = liquidMaterial();
  const liquid = new THREE.Mesh(new THREE.BufferGeometry(), liquidMat);
  liquid.renderOrder = 1;
  liquid.visible = false;
  group.add(liquid);
  let lastMl = -1;
  return {
    group,
    liquidMat,
    setVolume(ml: number) {
      const v = Math.round(ml * 100) / 100;
      if (v === lastMl) return;
      lastMl = v;
      liquid.visible = v > 0.05;
      if (!liquid.visible) return;
      liquid.geometry.dispose();
      liquid.geometry = liquidGeometry(inner, heightForVolume(inner, v));
    },
    setColour(rgb: [number, number, number], opacity: number) {
      liquidMat.color.setRGB(rgb[0], rgb[1], rgb[2], THREE.SRGBColorSpace);
      liquidMat.opacity = opacity;
    },
    dispose() {
      liquid.geometry.dispose();
      liquidMat.dispose();
    },
  };
}

// Real-dimension profiles (outer; inner is offset by the wall thickness)
const T = 0.0016;
const inset = (p: Profile, t = T): Profile => p.map(([r, y], i) => [Math.max(0, r - t), i === 0 ? y + t : y]);

export function conicalFlask(m: MaterialLib) {
  const outer: Profile = [[0, 0], [0.04, 0], [0.043, 0.006], [0.04, 0.03], [0.021, 0.105], [0.016, 0.118], [0.016, 0.145], [0.0185, 0.15]];
  const v = makeVessel(m, outer, inset(outer.slice(0, 7)), "conical250");
  return v;
}

export function beaker(m: MaterialLib, size: 150 | 250 = 150) {
  const r = size === 150 ? 0.0295 : 0.035;
  const h = size === 150 ? 0.09 : 0.12;
  const outer: Profile = [[0, 0], [r - 0.003, 0], [r, 0.004], [r, h], [r + 0.003, h + 0.003]];
  const v = makeVessel(m, outer, inset(outer.slice(0, 4)), `beaker${size}`);
  // spout ring + printed graduations
  const grad = new THREE.Mesh(
    new THREE.CylinderGeometry(r + 0.0003, r + 0.0003, h * 0.7, 32, 1, true, -0.5, 1.0),
    new THREE.MeshStandardMaterial({ map: graduationTexture({ from: 0, to: size === 150 ? 100 : 200, minor: size === 150 ? 10 : 25, major: 50, labelEvery: 50, h: 512 }), transparent: true, alphaTest: 0.3, roughness: 0.6 }),
  );
  grad.position.y = h * 0.42;
  v.group.add(grad);
  return v;
}

export function volumetricFlask(m: MaterialLib) {
  const outer: Profile = [[0, 0], [0.034, 0], [0.039, 0.012], [0.042, 0.04], [0.036, 0.07], [0.012, 0.095], [0.0085, 0.105], [0.0085, 0.235], [0.0095, 0.24]];
  const inner = inset(outer.slice(0, 8));
  const v = makeVessel(m, outer, inner, "vol100");
  // calibration mark: the height that holds exactly 100 mL in this profile
  const markY = heightForVolume(inner, 100);
  const ring = mesh(new THREE.TorusGeometry(0.0087, 0.00035, 6, 40), new THREE.MeshBasicMaterial({ color: 0x1b1f26 }), 0, markY, 0, false);
  ring.rotation.x = Math.PI / 2;
  v.group.add(ring);
  const stopper = mesh(cyl(0.0095, 0.008, 0.02, 20), m.plasticWhite, 0, 0.248, 0);
  stopper.name = "stopper";
  v.group.add(stopper);
  return { ...v, markY };
}

/** 50 mL burette: graduated length 0.60 m from the 0 mark (top) to the 50 mark. */
export function burette(m: MaterialLib) {
  const group = new THREE.Group();
  const tipY = 0;
  const stopY = 0.09;
  const zeroY = 0.86;
  const fiftyY = 0.26;
  const rIn = 0.0052;
  const tube = mesh(cyl(0.0068, 0.0068, 0.82, 28), m.glass, 0, 0.5, 0);
  tube.renderOrder = 2;
  group.add(tube);
  const tip = mesh(cyl(0.0068, 0.0016, 0.07, 20), m.glass, 0, 0.035, 0);
  group.add(tip);
  // PTFE stopcock: barrel + blue key
  group.add(mesh(cyl(0.009, 0.009, 0.03, 20), m.glass, 0, stopY, 0));
  const key = new THREE.Group();
  const barrel = mesh(cyl(0.006, 0.006, 0.05, 16), m.plasticWhite, 0, 0, 0);
  barrel.rotation.z = Math.PI / 2;
  key.add(barrel);
  key.add(mesh(new THREE.BoxGeometry(0.008, 0.028, 0.012), m.accentBlue, 0.03, 0, 0));
  key.position.y = stopY;
  group.add(key);
  // graduations: a decal on a slightly larger open cylinder facing the student
  const gradTex = graduationTexture({ from: 0, to: 50, minor: 0.1, major: 1, labelEvery: 5, h: 4096, flip: true });
  const extra = (0.86 - 0.26) / 50; // m per mL
  const decal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0072, 0.0072, zeroY - fiftyY + 40 * extra * 0.02, 32, 1, true, -0.55, 1.1),
    new THREE.MeshStandardMaterial({ map: gradTex, transparent: true, alphaTest: 0.25, roughness: 0.5 }),
  );
  decal.position.y = (zeroY + fiftyY) / 2;
  group.add(decal);
  // liquid column from the stopcock up to the meniscus
  const liqMat = liquidMaterial(0xeef6ff, 0.5);
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(rIn, rIn, 1, 20), liqMat);
  liquid.visible = false;
  group.add(liquid);
  const meniscus = mesh(new THREE.SphereGeometry(rIn, 20, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), liqMat, 0, 0, 0, false);
  meniscus.scale.y = 0.35;
  meniscus.visible = false;
  group.add(meniscus);
  const bubble = mesh(new THREE.SphereGeometry(0.0013, 10, 8), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, transparent: true, opacity: 0.85 }), 0.0005, 0.03, 0.001, false);
  bubble.visible = false;
  group.add(bubble);
  const funnel = new THREE.Group();
  funnel.add(mesh(new THREE.CylinderGeometry(0.032, 0.006, 0.05, 28, 1, true), m.glass, 0, 0.05, 0));
  funnel.add(mesh(cyl(0.004, 0.004, 0.05, 12), m.glass, 0, 0.005, 0));
  funnel.position.y = 0.9;
  funnel.visible = false;
  group.add(funnel);
  const tipLiquid = mesh(cyl(0.0012, 0.0012, 0.08, 8), liqMat, 0, 0.05, 0, false);
  tipLiquid.visible = false;
  group.add(tipLiquid);
  return {
    group,
    key,
    zeroY,
    fiftyY,
    /** Y of a reading (mL) on this burette. */
    yOf: (ml: number) => zeroY - ml * extra,
    set(level: number | null, opts: { bubble: boolean; funnel: boolean; flowing: boolean }) {
      liquid.visible = meniscus.visible = level !== null;
      tipLiquid.visible = level !== null && !opts.bubble;
      bubble.visible = level !== null && opts.bubble;
      funnel.visible = opts.funnel;
      key.rotation.x = opts.flowing ? Math.PI / 2 : 0;
      if (level === null) return;
      const top = zeroY - level * extra;
      const bottom = stopY + 0.015;
      liquid.scale.y = Math.max(0.001, top - bottom);
      liquid.position.y = (top + bottom) / 2;
      meniscus.position.y = top;
    },
  };
}

/** 20 mL bulb pipette. */
export function bulbPipette(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.0035, 0.0012, 0.14, 16), m.glass, 0, 0.07, 0));
  const bulb = mesh(new THREE.CapsuleGeometry(0.011, 0.07, 8, 20), m.glass, 0, 0.2, 0);
  g.add(bulb);
  g.add(mesh(cyl(0.0035, 0.0035, 0.2, 16), m.glass, 0, 0.36, 0));
  const mark = mesh(new THREE.TorusGeometry(0.0037, 0.0003, 6, 24), new THREE.MeshBasicMaterial({ color: 0x1b1f26 }), 0, 0.38, 0, false);
  mark.rotation.x = Math.PI / 2;
  g.add(mark);
  // pipette filler (bulb) on top
  g.add(mesh(new THREE.SphereGeometry(0.022, 20, 14), m.red, 0, 0.5, 0));
  return g;
}

export function measuringCylinder(m: MaterialLib, capacity: 50 | 100 = 100) {
  const r = capacity === 100 ? 0.0145 : 0.0115;
  const h = capacity === 100 ? 0.26 : 0.2;
  const outer: Profile = [[0, 0.012], [r, 0.012], [r, h], [r + 0.004, h + 0.004]];
  const v = makeVessel(m, outer, inset(outer.slice(0, 3)), `cyl${capacity}`);
  // hexagonal foot
  v.group.add(mesh(new THREE.CylinderGeometry(0.04, 0.042, 0.012, 6), m.glass, 0, 0.006, 0));
  const inner = inset(outer.slice(0, 3));
  const y0 = heightForVolume(inner, 0.0001);
  const yFull = heightForVolume(inner, capacity);
  const grad = new THREE.Mesh(
    new THREE.CylinderGeometry(r + 0.0004, r + 0.0004, yFull - y0, 32, 1, true, -0.6, 1.2),
    new THREE.MeshStandardMaterial({ map: graduationTexture({ from: 0, to: capacity, minor: 1, major: 5, labelEvery: 10, h: 2048, flip: false }), transparent: true, alphaTest: 0.25, roughness: 0.5 }),
  );
  grad.position.y = (yFull + y0) / 2;
  v.group.add(grad);
  return v;
}

/** Reagent bottle with a printed label (screw cap). */
export function reagentBottle(m: MaterialLib, title: string, lines: string[] = [], opts: { amber?: boolean; hazard?: "corrosive" | "irritant" | "harmful" | null; accent?: string; scale?: number } = {}) {
  const g = new THREE.Group();
  const s = opts.scale ?? 1;
  const outer: Profile = [[0, 0], [0.036, 0], [0.04, 0.006], [0.04, 0.13], [0.03, 0.155], [0.015, 0.165], [0.015, 0.18]];
  const body = mesh(cachedGeo("reagentBottle", () => lathe(outer, 40)), opts.amber ? m.amberGlass : m.glass, 0, 0, 0);
  g.add(body);
  g.add(mesh(cyl(0.018, 0.018, 0.028, 24), m.plasticDark, 0, 0.192, 0));
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0405, 0.0405, 0.075, 40, 1, true, -1.1, 2.2),
    new THREE.MeshStandardMaterial({ map: labelTexture(title, lines, { hazard: opts.hazard ?? null, accent: opts.accent }), roughness: 0.7 }),
  );
  label.position.y = 0.07;
  g.add(label);
  g.scale.setScalar(s);
  return g;
}

/** Dropper bottle (indicator / mountant). */
export function dropperBottle(m: MaterialLib, title: string, lines: string[] = [], hazard: "corrosive" | "irritant" | "harmful" | null = null) {
  const g = new THREE.Group();
  const outer: Profile = [[0, 0], [0.022, 0], [0.024, 0.004], [0.024, 0.06], [0.014, 0.075], [0.009, 0.08]];
  g.add(mesh(cachedGeo("dropperBody", () => lathe(outer, 32)), m.amberGlass, 0, 0, 0));
  g.add(mesh(cyl(0.01, 0.01, 0.012, 16), m.plasticDark, 0, 0.086, 0));
  g.add(mesh(new THREE.CapsuleGeometry(0.007, 0.02, 6, 12), m.rubber, 0, 0.11, 0));
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0245, 0.0245, 0.04, 32, 1, true, -1.1, 2.2),
    new THREE.MeshStandardMaterial({ map: labelTexture(title, lines, { hazard, w: 384, h: 240 }), roughness: 0.7 }),
  );
  label.position.y = 0.032;
  g.add(label);
  return g;
}

export function glassFunnel(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.035, 0.005, 0.045, 32, 1, true), m.glass, 0, 0.065, 0));
  g.add(mesh(cyl(0.004, 0.0035, 0.045, 12), m.glass, 0, 0.022, 0));
  return g;
}

export function washBottle(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.035, 0.035, 0.15, 28), new THREE.MeshPhysicalMaterial({ color: 0xf2f6f8, roughness: 0.35, transparent: true, opacity: 0.85 }), 0, 0.075, 0));
  g.add(mesh(cyl(0.016, 0.02, 0.03, 20), m.plasticWhite, 0, 0.165, 0));
  const nozzle = mesh(cyl(0.003, 0.003, 0.12, 8), m.plasticWhite, 0.03, 0.2, 0);
  nozzle.rotation.z = -1.0;
  g.add(nozzle);
  const lab = mesh(new THREE.CylinderGeometry(0.0355, 0.0355, 0.05, 28, 1, true, -1, 2), new THREE.MeshStandardMaterial({ map: labelTexture("Purified water", ["Wash bottle"], { w: 384, h: 220 }), roughness: 0.7 }), 0, 0.08, 0, false);
  g.add(lab);
  return g;
}

export function weighBoat(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.012, 4, 1, true), m.plasticWhite, 0, 0.006, 0).rotateY(Math.PI / 4));
  g.add(mesh(new THREE.BoxGeometry(0.04, 0.001, 0.04), m.plasticWhite, 0, 0.0005, 0));
  const heap = mesh(new THREE.ConeGeometry(0.02, 0.012, 20), m.powderWhite, 0, 0.007, 0, false);
  heap.name = "heap";
  heap.visible = false;
  g.add(heap);
  return g;
}

export function glassRod(m: MaterialLib) {
  const r = mesh(cyl(0.003, 0.003, 0.25, 12), m.glass, 0, 0, 0);
  r.rotation.z = Math.PI / 2 - 0.05;
  return r;
}

export function thermometer(m: MaterialLib) {
  const g = new THREE.Group();
  g.add(mesh(cyl(0.0035, 0.0035, 0.28, 12), m.glass, 0, 0.14, 0));
  g.add(mesh(new THREE.SphereGeometry(0.0045, 12, 10), m.red, 0, 0.003, 0));
  const column = mesh(cyl(0.0011, 0.0011, 1, 8), m.red, 0, 0, 0, false);
  column.name = "column";
  g.add(column);
  return {
    group: g,
    set(tempC: number) {
      const h = 0.02 + Math.max(0, Math.min(110, tempC)) * 0.0022;
      column.scale.y = h;
      column.position.y = h / 2;
    },
  };
}
