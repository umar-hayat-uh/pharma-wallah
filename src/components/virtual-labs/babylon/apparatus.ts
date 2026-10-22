/**
 * Babylon.js apparatus for the citric-acid assay, modelled from real dimensions (metres):
 * Class A burette with a PTFE stopcock and graduations, Fisher-type double burette clamp
 * on a retort stand, 250 mL conical flask, 100 mL volumetric flask with its calibration
 * ring at the height that actually holds 100 mL, 20 mL bulb pipette with a three-valve
 * filler, analytical balance (0.1 mg) with sliding draught-shield doors and its own LCD,
 * anti-static weighing boat, amber indicator dropper bottles, an HDPE bottle for the
 * sodium hydroxide (NaOH etches glass, so volumetric alkali is kept in polyethylene), a
 * wide-mouth jar of the crystalline sample, an LDPE wash bottle, a funnel, a white tile
 * and the lab notebook.
 *
 * Every vessel keeps its inner profile, and its liquid is rebuilt from the volume through
 * the shared `heightForVolume` — a level the student sees is the level that volume makes.
 * Parts that move or change are tagged `dyn` so the static merge leaves them alone.
 */
import type { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreateLathe } from "@babylonjs/core/Meshes/Builders/latheBuilder";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Mesh as MeshClass } from "@babylonjs/core/Meshes/mesh";
import { graduationCanvas, labelCanvas, lcdCanvas } from "../art/canvas";
import { heightForVolume, radiusAt, type Profile } from "../vessel";
import { canvasTexture, dyn, type Kit } from "./kit";

const T = 0.0016; // glass wall thickness
const inset = (p: Profile, t = T): Profile => p.map(([r, y], i) => [Math.max(0, r - t), i === 0 ? y + t : y]);

function liquidMat(k: Kit, name: string, hex = "#dcefff", alpha = 0.34) {
  const m = new PBRMaterial(name, k.scene);
  m.albedoColor = Color3.FromHexString(hex).toLinearSpace();
  m.roughness = 0.03;
  m.metallic = 0;
  m.alpha = alpha;
  m.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;
  m.indexOfRefraction = 1.33;
  // Glass keeps its reflections at full strength over its low alpha; a liquid must not, or
  // a faint phenolphthalein pink is washed out to white by the room reflected on top of it.
  m.useRadianceOverAlpha = false;
  m.useSpecularOverAlpha = false;
  return m;
}

/**
 * A fillable vessel: glass from the outer + inner profile, and a liquid body rebuilt for
 * each volume (quantised to 0.01 mL so a steady stream does not rebuild every frame).
 */
function vessel(k: Kit, parent: TransformNode, outer: Profile, inner: Profile) {
  const glass = k.lathe([...outer, ...[...inner].reverse()], k.m.glass, parent, 48);
  glass.alphaIndex = 2;
  const mat = liquidMat(k, `liq${parent.uniqueId}`);
  let liquid: Mesh | null = null;
  let last = -1;
  let surfaceY = inner[0][1];
  const target = new Color3();
  const current = new Color3(0.86, 0.94, 1).toLinearSpace();
  let alphaTarget = mat.alpha;
  return {
    glass,
    mat,
    surfaceY: () => surfaceY,
    setVolume(ml: number) {
      const v = Math.round(ml * 100) / 100;
      if (v === last) return;
      last = v;
      liquid?.dispose();
      liquid = null;
      if (v <= 0.05) {
        surfaceY = inner[0][1];
        return;
      }
      const h = heightForVolume(inner, v);
      surfaceY = h;
      const pts: Vector3[] = [new Vector3(0, inner[0][1] + 0.0005, 0)];
      for (const [r, y] of inner) {
        if (y >= h) break;
        pts.push(new Vector3(Math.max(0, r - 0.0004), y + 0.0005, 0));
      }
      pts.push(new Vector3(Math.max(0, radiusAt(inner, h) - 0.0004), h, 0), new Vector3(0, h, 0));
      liquid = CreateLathe(`liquid${parent.uniqueId}`, { shape: pts, tessellation: 40, sideOrientation: MeshClass.DOUBLESIDE }, k.scene);
      liquid.material = mat;
      liquid.parent = parent;
      liquid.isPickable = false;
      liquid.alphaIndex = 1;
      dyn(liquid);
    },
    /** Set the liquid's sRGB colour and opacity; returns true if it should animate there. */
    setColour(rgb: [number, number, number], alpha: number) {
      target.set(rgb[0], rgb[1], rgb[2]).toLinearSpaceToRef(target);
      alphaTarget = alpha;
      return !target.equalsWithEpsilon(current, 0.002) || Math.abs(mat.alpha - alphaTarget) > 0.002;
    },
    /** Ease toward the target colour; returns true while still changing. */
    stepColour(dt: number) {
      const f = Math.min(1, dt * 5);
      Color3.LerpToRef(current, target, f, current);
      mat.albedoColor.copyFrom(current);
      mat.alpha += (alphaTarget - mat.alpha) * f;
      return !target.equalsWithEpsilon(current, 0.002) || Math.abs(mat.alpha - alphaTarget) > 0.002;
    },
    snapColour() {
      current.copyFrom(target);
      mat.albedoColor.copyFrom(current);
      mat.alpha = alphaTarget;
    },
    dispose() {
      liquid?.dispose();
      mat.dispose();
    },
  };
}

/** A small printed patch (white enamel marking) on glassware. */
function enamel(k: Kit, parent: TransformNode, r: number, h: number, arc: number, y: number, title: string, lines: string[]) {
  const mat = k.texMat(labelCanvas(title, lines, { w: 384, h: 200, accent: "#5f6b78" }), 0.5);
  return k.labelArc(r + 0.0003, h, arc, mat, parent, y);
}

export function conicalFlask(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  const outer: Profile = [[0, 0], [0.04, 0], [0.043, 0.006], [0.04, 0.03], [0.021, 0.105], [0.016, 0.118], [0.016, 0.145], [0.0185, 0.15]];
  const v = vessel(k, g, outer, inset(outer.slice(0, 7)));
  enamel(k, g, 0.0405, 0.016, 0.8, 0.02, "250 mL", ["Borosilicate 3.3"]);
  return { node: g, ...v };
}

export function volumetricFlask(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  // A 100 mL Class A flask: 54 mm bulb, 12 mm-bore neck, 170 mm tall. Sized so the bulb
  // and neck below the mark hold 100 mL — the three.js model's bulb held ~350 mL, which
  // put its "100 mL" ring inside the bulb (found by the 2026-10-22 test).
  const outer: Profile = [[0, 0], [0.0227, 0], [0.0262, 0.007], [0.0271, 0.0262], [0.0227, 0.0455], [0.0105, 0.063], [0.0072, 0.07], [0.0072, 0.165], [0.0082, 0.17]];
  const inner = inset(outer.slice(0, 8));
  const v = vessel(k, g, outer, inner);
  // calibration ring at the height that holds exactly 100 mL in this profile
  const markY = heightForVolume(inner, 100);
  const ring = k.torus(0.0074, 0.0006, k.m.plasticDark, g, 0, markY, 0, 40);
  ring.scaling.y = 0.4;
  enamel(k, g, 0.0273, 0.016, 1.0, 0.024, "100 mL  A", ["20 °C  ±0.10 mL"]);
  k.cyl(0.0082, 0.0068, 0.02, k.m.accentBlue, g, 0, 0.178, 0, 20); // PP stopper
  k.cyl(0.0105, 0.0105, 0.004, k.m.accentBlue, g, 0, 0.189, 0, 20);
  return { node: g, ...v, markY };
}

export function beaker(k: Kit, parent: TransformNode, size: 250 = 250) {
  const g = k.node(parent);
  const r = 0.035;
  const h = 0.12;
  const outer: Profile = [[0, 0], [r - 0.003, 0], [r, 0.004], [r, h], [r + 0.003, h + 0.003]];
  const v = vessel(k, g, outer, inset(outer.slice(0, 4)));
  const gm = k.texMat(graduationCanvas({ from: 0, to: 200, minor: 25, major: 50, labelEvery: 50, h: 512 }), 0.6, true);
  k.labelArc(r + 0.0004, h * 0.7, 1.0, gm, g, h * 0.42);
  // pouring lip
  const lip = k.box(0.012, 0.004, 0.01, k.m.glass, g, 0, h + 0.002, r + 0.003);
  lip.rotation.x = -0.4;
  void size;
  return { node: g, ...v };
}

/** 50 mL burette: graduated length 0.60 m from the 0 mark (top) to the 50 mark. */
export function burette(k: Kit, parent: TransformNode, q: "low" | "medium" | "high") {
  const { m } = k;
  const g = k.node(parent);
  const stopY = 0.09;
  const zeroY = 0.86;
  const fiftyY = 0.26;
  const rIn = 0.0052;
  const perMl = (zeroY - fiftyY) / 50;
  const tube = k.cyl(0.0068, 0.0068, 0.82, m.glass, g, 0, 0.5, 0, 28, { cap: false });
  tube.alphaIndex = 2;
  k.torus(0.0071, 0.0012, m.glass, g, 0, 0.91, 0, 24); // fire-polished rim
  k.cyl(0.0068, 0.0016, 0.07, m.glass, g, 0, 0.035, 0, 20); // tapered jet
  // PTFE stopcock: glass barrel, white plug, blue key
  const barrel = k.cyl(0.0085, 0.0085, 0.032, m.glass, g, 0, stopY, 0, 20);
  barrel.rotation.z = Math.PI / 2;
  const key = k.node(g, 0, stopY, 0);
  const plug = k.cyl(0.0055, 0.0055, 0.05, m.ptfe, key, 0, 0, 0, 16);
  plug.rotation.z = Math.PI / 2;
  k.box(0.006, 0.03, 0.012, m.accentBlue, key, 0.028, 0, 0);
  k.cyl(0.007, 0.007, 0.004, m.accentBlue, key, -0.027, 0, 0, 16).rotation.z = Math.PI / 2; // retaining nut
  for (const c of key.getChildMeshes()) dyn(c as Mesh);
  // graduations: 0.1 mL minor, 1 mL major, numbered every 5 — printed on the front arc.
  // The canvas keeps a 20 px margin top and bottom, so the strip is a little taller than
  // the 0.60 m of scale and the 0 and 50 marks land exactly on zeroY and fiftyY.
  const gh = q === "low" ? 2048 : 4096;
  const strip = (zeroY - fiftyY) * (gh / (gh - 40));
  const gmat = k.texMat(graduationCanvas({ from: 0, to: 50, minor: 0.1, major: 1, labelEvery: 5, h: gh, flip: true }), 0.5, true);
  k.labelArc(0.0071, strip, 1.1, gmat, g, (zeroY + fiftyY) / 2);
  const print = k.texMat(labelCanvas("50 mL  A", ["0.1 mL  20 °C", "Ex 30 s"], { w: 384, h: 200, accent: "#5f6b78" }), 0.5);
  k.labelArc(0.0071, 0.03, 1.2, print, g, 0.885);
  // liquid column + concave meniscus whose LOWEST point is the reading
  // faintly tinted so the column — and so the level — shows against a pale room
  const lm = liquidMat(k, "buretteLiquid", "#bfdcf5", 0.55);
  const liquid = dyn(k.cyl(rIn, rIn, 1, lm, g, 0, 0, 0, 20, { cap: false }));
  liquid.alphaIndex = 1;
  const bowl = 0.35 * rIn;
  const meniscus = dyn(k.sphere(rIn, lm, g, 0, 0, 0, 16, 0.5));
  meniscus.rotation.x = Math.PI; // the lower hemisphere: a bowl dipping at the centre
  meniscus.scaling.y = 0.35;
  meniscus.alphaIndex = 1;
  const band = dyn(k.torus(rIn - 0.0002, 0.0011, m.plasticDark, g, 0, 0, 0, 24)); // the dark meniscus line
  band.scaling.y = 0.5;
  const tipLiquid = dyn(k.cyl(0.0012, 0.0012, 0.08, lm, g, 0, 0.05, 0, 8));
  const bubble = dyn(k.sphere(0.0016, m.tileWhite, g, 0.0005, 0.03, 0.001, 10));
  // filling funnel sitting in the top
  const funnel = k.node(g, 0, 0.9, 0);
  k.lathe([[0.004, -0.02], [0.004, 0.03], [0.006, 0.032], [0.032, 0.075], [0.033, 0.078]], m.glass, funnel, 28);
  for (const c of funnel.getChildMeshes()) dyn(c as Mesh);
  return {
    node: g,
    tipLocal: new Vector3(0, -0.002, 0),
    set(level: number | null, o: { bubble: boolean; funnel: boolean; flowing: boolean }) {
      const filled = level !== null;
      liquid.setEnabled(filled);
      meniscus.setEnabled(filled);
      band.setEnabled(filled);
      tipLiquid.setEnabled(filled && !o.bubble);
      bubble.setEnabled(filled && o.bubble);
      funnel.setEnabled(o.funnel);
      key.rotation.x = o.flowing ? Math.PI / 2 : 0;
      if (!filled) return;
      const reading = zeroY - level * perMl;
      const top = reading + bowl;
      const bottom = stopY + 0.015;
      liquid.scaling.y = Math.max(0.001, top - bottom);
      liquid.position.y = (top + bottom) / 2;
      meniscus.position.y = top;
      band.position.y = reading + bowl * 0.5;
    },
  };
}

/** Retort stand with boss head and a double burette clamp reaching to the burette. */
export function retortStand(k: Kit, parent: TransformNode, reach: number) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.17, 0.014, 0.24, m.enamel, g, 0, 0.007, 0);
  for (const [x, z] of [[-0.07, -0.1], [0.07, -0.1], [-0.07, 0.1], [0.07, 0.1]]) k.cyl(0.008, 0.008, 0.004, m.rubber, g, x, -0.001, z, 10);
  k.cyl(0.0065, 0.0065, 0.75, m.chrome, g, 0, 0.385, -0.06, 16);
  k.cyl(0.011, 0.011, 0.02, m.darkMetal, g, 0, 0.022, -0.06, 16); // rod boss in the base
  // boss head and clamp arm, holding the burette `reach` metres in front of the rod
  const c = k.node(g, 0, 0.62, -0.06);
  k.box(0.032, 0.032, 0.032, m.darkMetal, c, 0, 0, 0);
  k.cyl(0.004, 0.004, 0.03, m.chrome, c, 0.028, 0, 0, 10).rotation.z = Math.PI / 2;
  k.sphere(0.007, m.darkMetal, c, 0.045, 0, 0, 10);
  const arm = k.cyl(0.005, 0.005, reach - 0.02, m.chrome, c, 0, 0, (reach - 0.02) / 2 + 0.01, 12);
  arm.rotation.x = Math.PI / 2;
  // Fisher-type double clamp: two sprung V-jaws with rubber faces either side of the tube
  for (const s of [-1, 1]) {
    k.box(0.006, 0.026, 0.026, m.accentBlue, c, s * 0.0105, 0, reach);
    k.box(0.002, 0.02, 0.018, m.rubber, c, s * 0.007, 0, reach);
  }
  k.box(0.03, 0.008, 0.012, m.accentBlue, c, 0, 0.012, reach - 0.012);
  return g;
}

export function whiteTile(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  k.box(0.15, 0.008, 0.15, k.m.tileWhite, g, 0, 0.004, 0);
  return g;
}

/** 20 mL bulb pipette lying on its rack, with a three-valve filler fitted. */
export function bulbPipette(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  const p = k.node(g);
  k.cyl(0.0035, 0.0012, 0.14, m.glass, p, 0, 0.07, 0, 16);
  k.capsule(0.011, 0.092, m.glass, p, 0, 0.2, 0);
  k.cyl(0.0035, 0.0035, 0.2, m.glass, p, 0, 0.36, 0, 16);
  k.torus(0.0037, 0.0005, m.plasticDark, p, 0, 0.38, 0, 24);
  k.torus(0.0112, 0.0006, m.accentGreen, p, 0, 0.2, 0, 24); // colour code band
  // pipette filler: rubber bulb with three ball valves (A, S, E)
  k.sphere(0.022, m.rubberRed, p, 0, 0.5, 0, 20);
  k.cyl(0.006, 0.006, 0.04, m.rubberRed, p, 0, 0.465, 0, 12);
  k.cyl(0.006, 0.008, 0.03, m.rubberRed, p, 0, 0.53, 0, 12);
  k.sphere(0.0065, m.rubberRed, p, 0.009, 0.45, 0, 10);
  p.rotation.z = Math.PI / 2;
  p.position.y = 0.025;
  // rack
  k.box(0.24, 0.016, 0.06, m.plasticGrey, g, -0.2, 0.008, 0);
  for (const x of [-0.3, -0.1]) k.box(0.02, 0.026, 0.05, m.plasticGrey, g, x, 0.02, 0);
  return g;
}

export function dropperBottle(k: Kit, parent: TransformNode, title: string, lines: string[]) {
  const { m } = k;
  const g = k.node(parent);
  k.lathe([[0, 0], [0.022, 0], [0.024, 0.004], [0.024, 0.06], [0.014, 0.075], [0.009, 0.08]], m.amber, g, 32);
  k.cyl(0.0105, 0.0105, 0.014, m.plasticDark, g, 0, 0.087, 0, 16);
  k.capsule(0.0075, 0.03, m.rubber, g, 0, 0.11, 0);
  k.labelArc(0.0246, 0.04, 2.2, k.texMat(labelCanvas(title, lines, { w: 384, h: 240 }), 0.7), g, 0.032);
  return g;
}

/** Wide-mouth jar of a crystalline solid (the assay sample). */
export function sampleJar(k: Kit, parent: TransformNode, title: string, lines: string[]) {
  const { m } = k;
  const g = k.node(parent);
  const outer: Profile = [[0, 0], [0.036, 0], [0.04, 0.006], [0.04, 0.1], [0.034, 0.112], [0.03, 0.115], [0.03, 0.128]];
  k.lathe([...outer, ...[...inset(outer.slice(0, 6), 0.002)].reverse()], m.glass, g, 40).alphaIndex = 2;
  k.lathe([[0, 0.003], [0.037, 0.003], [0.037, 0.06], [0.026, 0.07], [0, 0.072]], m.powderWhite, g, 32); // crystals
  k.cyl(0.033, 0.033, 0.02, m.plasticWhite, g, 0, 0.136, 0, 32);
  k.labelArc(0.0405, 0.06, 2.2, k.label(title, lines, { hazard: "irritant" }), g, 0.055);
  return g;
}

/** HDPE reagent bottle (volumetric NaOH): opaque white plastic with a screw cap. */
export function hdpeBottle(k: Kit, parent: TransformNode, title: string, lines: string[]) {
  const { m } = k;
  const g = k.node(parent);
  k.lathe([[0, 0], [0.036, 0], [0.04, 0.008], [0.04, 0.135], [0.032, 0.158], [0.016, 0.168], [0.016, 0.18]], m.hdpe, g, 40);
  k.cyl(0.019, 0.019, 0.026, m.red, g, 0, 0.19, 0, 24);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    k.box(0.002, 0.022, 0.003, m.red, g, Math.cos(a) * 0.0195, 0.19, Math.sin(a) * 0.0195).rotation.y = -a;
  }
  k.labelArc(0.0405, 0.08, 2.2, k.label(title, lines, { hazard: "corrosive", accent: "#C8202A" }), g, 0.07);
  return g;
}

export function washBottle(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.lathe([[0, 0], [0.034, 0], [0.036, 0.008], [0.036, 0.14], [0.028, 0.158], [0.016, 0.163]], m.ldpe, g, 32);
  k.cyl(0.018, 0.018, 0.022, m.plasticWhite, g, 0, 0.172, 0, 20);
  k.tube([[0, 0.18, 0], [0, 0.205, 0], [0.012, 0.222, 0], [0.05, 0.226, 0], [0.072, 0.21, 0]], 0.0025, m.plasticWhite, g, 8);
  k.labelArc(0.0365, 0.05, 2, k.label("Purified water", ["Wash bottle"], { w: 384, h: 220 }), g, 0.08);
  return g;
}

export function glassFunnel(k: Kit, parent: TransformNode) {
  const g = k.node(parent);
  k.lathe([[0.0035, 0], [0.004, 0.045], [0.006, 0.048], [0.034, 0.088], [0.0355, 0.09]], k.m.glass, g, 32);
  return g;
}

export function glassRod(k: Kit, parent: TransformNode, len = 0.25) {
  return k.cyl(0.003, 0.003, len, k.m.glass, parent, 0, 0, 0, 12);
}

export function spatula(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.16, 0.002, 0.008, m.steel, g, 0, 0.002, 0);
  k.box(0.025, 0.0015, 0.012, m.steel, g, 0.09, 0.002, 0);
  k.box(0.07, 0.008, 0.012, m.plasticDark, g, -0.11, 0.005, 0);
  return g;
}

/** Analytical balance (0.1 mg): housing, LCD, keys, pan, draught shield, boat, sample heap. */
export function analyticalBalance(k: Kit, parent: TransformNode) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.22, 0.07, 0.36, m.plasticWhite, g, 0, 0.035, 0);
  k.box(0.22, 0.04, 0.08, m.plasticGrey, g, 0, 0.09, 0.14);
  for (const [x, z] of [[-0.09, -0.15], [0.09, -0.15], [-0.09, 0.15], [0.09, 0.15]]) k.cyl(0.01, 0.012, 0.008, m.plasticDark, g, x, -0.002, z, 12); // levelling feet
  // level bubble
  k.cyl(0.008, 0.008, 0.003, m.chrome, g, 0.085, 0.071, -0.12, 16);
  k.cyl(0.006, 0.006, 0.003, m.glass, g, 0.085, 0.0725, -0.12, 16);
  // display on a sloped fascia; its own canvas is redrawn only when the reading changes
  const lcd = lcdCanvas(512, 140);
  const tex = canvasTexture(k.scene, lcd.canvas, "balanceLcd", k.q);
  k.textures.push(tex);
  const lcdMat = new PBRMaterial("balanceLcdMat", k.scene);
  lcdMat.albedoTexture = tex;
  lcdMat.unlit = true;
  const fascia = k.node(g, 0, 0.105, 0.178);
  fascia.rotation.x = -0.35;
  k.box(0.2, 0.04, 0.006, m.plasticDark, fascia, 0, 0, -0.004);
  k.panel(0.13, 0.034, lcdMat, fascia, 0, 0, 0.0002);
  for (const [x, mat] of [[-0.085, m.accentBlue], [0.085, m.plasticGrey]] as const) k.cyl(0.008, 0.008, 0.006, mat, fascia, x, 0, 0.002, 16).rotation.x = Math.PI / 2;
  // pan
  k.cyl(0.045, 0.045, 0.004, m.chrome, g, 0, 0.1, -0.03, 40);
  k.cyl(0.008, 0.008, 0.03, m.chrome, g, 0, 0.085, -0.03, 12);
  k.torus(0.05, 0.003, m.plasticGrey, g, 0, 0.092, -0.03, 40); // pan shield ring
  // draught shield: frame, back and front glass, top, sliding side doors
  const shield = k.node(g);
  k.box(0.2, 0.2, 0.004, m.glass, shield, 0, 0.19, -0.17);
  k.box(0.2, 0.2, 0.004, m.glass, shield, 0, 0.19, 0.08);
  k.box(0.2, 0.004, 0.25, m.glass, shield, 0, 0.29, -0.045);
  for (const x of [-0.1, 0.1]) for (const z of [-0.17, 0.08]) k.box(0.008, 0.2, 0.008, m.plasticGrey, shield, x, 0.19, z);
  for (const z of [-0.17, 0.08]) k.box(0.2, 0.008, 0.008, m.plasticGrey, shield, 0, 0.292, z);
  const doors: TransformNode[] = [];
  for (const x of [-0.101, 0.101]) {
    const d = k.node(shield, x, 0.19, -0.045);
    k.box(0.004, 0.19, 0.24, m.glass, d, 0, 0, 0);
    k.box(0.006, 0.05, 0.012, m.plasticGrey, d, x < 0 ? -0.004 : 0.004, 0, 0.1);
    for (const c of d.getChildMeshes()) dyn(c as Mesh);
    doors.push(d);
  }
  // anti-static diamond weighing boat and the sample heap on it
  const boat = k.node(g, 0, 0.103, -0.03);
  const shell = CreateCylinder("boat", { diameterTop: 0.07, diameterBottom: 0.05, height: 0.012, tessellation: 4, cap: MeshClass.CAP_START }, k.scene);
  shell.material = m.plasticWhite;
  shell.parent = boat;
  shell.position.y = 0.006;
  shell.rotation.y = Math.PI / 4;
  shell.isPickable = false;
  dyn(shell);
  const heap = dyn(k.lathe([[0, 0], [0.018, 0], [0.012, 0.004], [0.005, 0.008], [0, 0.009]], m.powderWhite, boat, 24));
  heap.position.y = 0.001;
  return {
    node: g,
    set(v: { boatOn: boolean; sampleG: number; display: string; stable: boolean; doorsClosed: boolean }) {
      boat.setEnabled(v.boatOn);
      heap.setEnabled(v.sampleG > 0.001);
      heap.scaling.setAll(Math.max(0.3, Math.min(1.4, Math.cbrt(v.sampleG))));
      if (lcd.draw(v.display, v.stable ? "● stable" : "○ unstable — close the doors")) tex.update(true);
      for (const d of doors) d.position.z = v.doorsClosed ? -0.045 : -0.2;
    },
  };
}

export function labNotebook(k: Kit, parent: TransformNode, title: string) {
  const { m } = k;
  const g = k.node(parent);
  k.box(0.24, 0.006, 0.32, m.wood, g, 0, 0.003, 0); // clipboard
  const sheet = k.texMat(labelCanvas(title, ["Name · Date · Batch", "Readings", "Calculation", "Result · Conclusion"], { w: 512, h: 680, accent: "#21B67A" }), 0.9);
  const paper = k.panel(0.215, 0.29, sheet, g, 0, 0.0065, 0.008);
  paper.rotation.x = -Math.PI / 2;
  paper.rotation.y = 0;
  k.box(0.09, 0.012, 0.035, m.chrome, g, 0, 0.012, -0.145);
  const pen = k.cyl(0.0045, 0.0045, 0.14, m.accentBlue, g, 0.135, 0.006, 0.02, 12);
  pen.rotation.x = Math.PI / 2;
  pen.rotation.y = 0.15;
  // scientific calculator beside it
  const calc = k.node(g, -0.2, 0, 0.02, 0.15);
  k.box(0.08, 0.014, 0.16, m.plasticDark, calc, 0, 0.007, 0);
  k.box(0.06, 0.002, 0.03, m.screen, calc, 0, 0.0145, -0.05);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) k.box(0.011, 0.003, 0.009, r === 4 && c === 3 ? m.accentBlue : m.plasticGrey, calc, -0.0225 + c * 0.015, 0.015, -0.01 + r * 0.016);
  return g;
}
