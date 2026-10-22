/**
 * three.js wrappers around the shared canvas artwork in `../art/canvas.ts` (split out on
 * 2026-10-22 so the Babylon.js chemistry room draws the same labels, signs and displays).
 */
import * as THREE from "three";
import { floorCanvas, graduationCanvas, labelCanvas, lcdCanvas, posterCanvas, signCanvas, wallCanvas, type SignKind } from "../art/canvas";

export { mulberry, type SignKind } from "../art/canvas";

function tex(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** A white pharmacy/reagent label: title, lines, optional hazard diamond. */
export function labelTexture(...a: Parameters<typeof labelCanvas>) {
  return tex(labelCanvas(...a));
}

/** ISO-7010-style safety sign with a caption. */
export function signTexture(kind: SignKind, caption: string) {
  return tex(signCanvas(kind, caption));
}

/** A seven-segment-style LCD. Returns the texture and a redraw function. */
export function lcdTexture(...a: Parameters<typeof lcdCanvas>) {
  const lcd = lcdCanvas(...a);
  const t = tex(lcd.canvas);
  const draw = (text: string, sub = "") => {
    if (lcd.draw(text, sub)) t.needsUpdate = true;
  };
  return { texture: t, draw };
}

/** Procedural sheet-vinyl floor: large pale tiles with subtle mottling. */
export function floorTexture(tint = "#dfe5e8") {
  const t = tex(floorCanvas(tint));
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Gentle wall-paint noise so large walls do not read as flat CG. */
export function wallTexture(tint = "#f3f5f6") {
  const t = tex(wallCanvas(tint));
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** A poster: title + body lines. Original teaching content only. */
export function posterTexture(title: string, lines: string[], accent = "#1C7BD9") {
  return tex(posterCanvas(title, lines, accent));
}

/** Burette/cylinder graduation strip: majors every `major` units with numbers. */
export function graduationTexture(opts: Parameters<typeof graduationCanvas>[0]) {
  const t = new THREE.CanvasTexture(graduationCanvas(opts));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
