/**
 * Procedural canvas textures for the labs: bottle labels, safety signs, instrument
 * displays, posters and surfaces. All original artwork drawn at runtime — nothing here is
 * copied from another product — so no texture needs a licence and none costs a download.
 * Sign layouts follow the ISO 7010 colour/shape conventions (blue circle = mandatory,
 * red-bordered circle = prohibition, yellow triangle = warning, green square = safe
 * condition) and the GHS diamond for chemical hazards; the pictograms are simplified.
 */
import * as THREE from "three";

const FONT = "Outfit, 'Segoe UI', Roboto, Arial, sans-serif";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  return { c, ctx };
}

function tex(c: HTMLCanvasElement, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** A white pharmacy/reagent label: title, lines, optional hazard diamond. */
export function labelTexture(title: string, lines: string[] = [], opts: { accent?: string; hazard?: "corrosive" | "irritant" | "harmful" | null; w?: number; h?: number } = {}) {
  const w = opts.w ?? 512;
  const h = opts.h ?? 320;
  const { c, ctx } = canvas(w, h);
  ctx.fillStyle = "#fbfbf7";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = opts.accent ?? "#1C7BD9";
  ctx.fillRect(0, 0, w, h * 0.16);
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${Math.round(h * 0.085)}px ${FONT}`;
  ctx.fillText("PharmaWallah Lab", w * 0.05, h * 0.115);
  ctx.fillStyle = "#16181d";
  const titleSize = Math.round(h * (title.length > 22 ? 0.105 : 0.13));
  ctx.font = `700 ${titleSize}px ${FONT}`;
  wrap(ctx, title, w * 0.05, h * 0.32, w * (opts.hazard ? 0.62 : 0.9), titleSize * 1.1, 2);
  ctx.font = `400 ${Math.round(h * 0.075)}px ${FONT}`;
  ctx.fillStyle = "#3a3f47";
  lines.forEach((l, i) => ctx.fillText(l, w * 0.05, h * (0.62 + i * 0.11)));
  if (opts.hazard) ghsDiamond(ctx, w * 0.82, h * 0.42, h * 0.2, opts.hazard);
  ctx.strokeStyle = "#c9ced6";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  return tex(c);
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number, maxLines: number) {
  const words = text.split(" ");
  let line = "";
  let n = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y + n * lh);
      line = word;
      if (++n >= maxLines) return;
    } else line = test;
  }
  ctx.fillText(line, x, y + n * lh);
}

function ghsDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, kind: "corrosive" | "irritant" | "harmful") {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
  ctx.strokeStyle = "#d4161c";
  ctx.lineWidth = r * 0.12;
  ctx.strokeRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
  ctx.restore();
  ctx.fillStyle = "#111";
  if (kind === "corrosive") {
    // GHS05 (simplified): two tilted test tubes dripping onto a surface (left) and a hand (right)
    const tube = (x: number, rot: number) => {
      ctx.save();
      ctx.translate(x, cy - r * 0.32);
      ctx.rotate(rot);
      ctx.fillRect(-r * 0.07, -r * 0.2, r * 0.14, r * 0.3);
      ctx.restore();
    };
    tube(cx - r * 0.24, -0.55);
    tube(cx + r * 0.24, 0.55);
    for (const [dx, dy] of [[-0.18, -0.02], [-0.14, 0.08], [0.18, -0.02], [0.14, 0.08]]) {
      ctx.beginPath();
      ctx.arc(cx + dx * r, cy + dy * r, r * 0.035, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillRect(cx - r * 0.42, cy + r * 0.2, r * 0.32, r * 0.1); // surface
    ctx.beginPath(); // hand
    ctx.ellipse(cx + r * 0.25, cy + r * 0.25, r * 0.17, r * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx - r * 0.3, cy + r * 0.2, r * 0.05, r * 0.05); // etched notches
    ctx.fillRect(cx + r * 0.18, cy + r * 0.2, r * 0.05, r * 0.05);
    ctx.fillStyle = "#111";
  } else {
    ctx.font = `900 ${Math.round(r * 0.95)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.fillText("!", cx, cy + r * 0.33);
    ctx.textAlign = "start";
  }
}

export type SignKind = "goggles" | "coat" | "gloves" | "no-food" | "eyewash" | "first-aid" | "extinguisher" | "hot" | "exit" | "flame";

/** ISO-7010-style safety sign with a caption. */
export function signTexture(kind: SignKind, caption: string) {
  const { c, ctx } = canvas(384, 512);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 384, 512);
  const cx = 192;
  const cy = 190;
  const mandatory = kind === "goggles" || kind === "coat" || kind === "gloves";
  const safe = kind === "eyewash" || kind === "first-aid" || kind === "exit";
  ctx.lineCap = "round";
  if (mandatory) {
    ctx.fillStyle = "#1f5fbf";
    ctx.beginPath();
    ctx.arc(cx, cy, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = "#fff";
    ctx.lineWidth = 16;
    if (kind === "goggles") {
      ctx.beginPath();
      ctx.ellipse(cx - 52, cy, 42, 32, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 52, cy, 42, 32, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.stroke();
    } else if (kind === "coat") {
      ctx.beginPath();
      ctx.moveTo(cx - 60, cy - 80);
      ctx.lineTo(cx - 95, cy + 90);
      ctx.lineTo(cx + 95, cy + 90);
      ctx.lineTo(cx + 60, cy - 80);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#1f5fbf";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 80);
      ctx.lineTo(cx, cy + 90);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(cx - 55, cy - 30, 110, 120, 30);
      ctx.fill();
      for (let i = 0; i < 4; i++) ctx.fillRect(cx - 52 + i * 28, cy - 95, 22, 80);
    }
  } else if (safe) {
    ctx.fillStyle = "#14864a";
    ctx.fillRect(42, 40, 300, 300);
    ctx.fillStyle = "#fff";
    if (kind === "first-aid") {
      ctx.fillRect(cx - 30, cy - 100, 60, 200);
      ctx.fillRect(cx - 100, cy - 30, 200, 60);
    } else if (kind === "eyewash") {
      ctx.beginPath();
      ctx.ellipse(cx, cy + 20, 70, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#14864a";
      ctx.beginPath();
      ctx.arc(cx, cy + 20, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 10;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 40, cy - 110);
        ctx.lineTo(cx + i * 25, cy - 40);
        ctx.stroke();
      }
    } else {
      ctx.font = `800 110px ${FONT}`;
      ctx.textAlign = "center";
      ctx.fillText("EXIT", cx, cy + 40);
      ctx.textAlign = "start";
    }
  } else if (kind === "no-food") {
    ctx.strokeStyle = "#d4161c";
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.arc(cx, cy, 135, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.moveTo(cx - 40, cy - 70);
    ctx.lineTo(cx + 40, cy - 70);
    ctx.lineTo(cx + 28, cy + 70);
    ctx.lineTo(cx - 28, cy + 70);
    ctx.fill();
    ctx.strokeStyle = "#d4161c";
    ctx.beginPath();
    ctx.moveTo(cx - 95, cy - 95);
    ctx.lineTo(cx + 95, cy + 95);
    ctx.stroke();
  } else if (kind === "extinguisher") {
    ctx.fillStyle = "#d4161c";
    ctx.fillRect(42, 40, 300, 300);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.roundRect(cx - 35, cy - 70, 70, 170, 20);
    ctx.fill();
    ctx.fillRect(cx - 12, cy - 105, 24, 40);
    ctx.lineWidth = 12;
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 95);
    ctx.quadraticCurveTo(cx + 90, cy - 100, cx + 80, cy - 20);
    ctx.stroke();
  } else {
    // warning triangle: hot surface / flame
    ctx.fillStyle = "#f6c400";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 18;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx, cy - 145);
    ctx.lineTo(cx + 165, cy + 130);
    ctx.lineTo(cx - 165, cy + 130);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#111";
    if (kind === "hot") {
      ctx.lineWidth = 10;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 35, cy + 70);
        ctx.bezierCurveTo(cx + i * 35 - 20, cy + 30, cx + i * 35 + 20, cy, cx + i * 35, cy - 40);
        ctx.stroke();
      }
      ctx.fillRect(cx - 80, cy + 80, 160, 14);
    } else {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 60);
      ctx.bezierCurveTo(cx + 70, cy + 10, cx + 40, cy + 100, cx, cy + 100);
      ctx.bezierCurveTo(cx - 40, cy + 100, cx - 70, cy + 10, cx, cy - 60);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#16181d";
  ctx.font = `700 34px ${FONT}`;
  ctx.textAlign = "center";
  const words = caption.toUpperCase().split(" ");
  const half = Math.ceil(words.length / 2);
  const l1 = words.length > 2 ? words.slice(0, half).join(" ") : caption.toUpperCase();
  const l2 = words.length > 2 ? words.slice(half).join(" ") : "";
  ctx.fillText(l1, cx, 410);
  if (l2) ctx.fillText(l2, cx, 452);
  return tex(c);
}

/** A seven-segment-style LCD. Returns the texture and a redraw function. */
export function lcdTexture(w = 512, h = 160, bg = "#1d2b22", fg = "#9df2b8") {
  const { c, ctx } = canvas(w, h);
  const t = tex(c);
  let last = "";
  const draw = (text: string, sub = "") => {
    const key = `${text}|${sub}`;
    if (key === last) return;
    last = key;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fg;
    ctx.font = `600 ${Math.round(h * 0.62)}px 'Courier New', ui-monospace, monospace`;
    ctx.textAlign = "right";
    ctx.fillText(text, w * 0.94, h * 0.72);
    if (sub) {
      ctx.font = `600 ${Math.round(h * 0.18)}px ${FONT}`;
      ctx.textAlign = "left";
      ctx.fillText(sub, w * 0.05, h * 0.25);
    }
    t.needsUpdate = true;
  };
  draw("");
  return { texture: t, draw };
}

/** Procedural sheet-vinyl floor: large pale tiles with subtle mottling. */
export function floorTexture(tint = "#dfe5e8") {
  const { c, ctx } = canvas(1024, 1024);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, 1024, 1024);
  const rng = mulberry(42);
  for (let i = 0; i < 9000; i++) {
    const g = 200 + Math.floor(rng() * 40);
    ctx.fillStyle = `rgba(${g - 30},${g - 20},${g - 15},0.10)`;
    ctx.fillRect(rng() * 1024, rng() * 1024, 2 + rng() * 5, 2 + rng() * 5);
  }
  ctx.strokeStyle = "rgba(120,130,140,0.35)";
  ctx.lineWidth = 3;
  for (let i = 0; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 512, 0);
    ctx.lineTo(i * 512, 1024);
    ctx.moveTo(0, i * 512);
    ctx.lineTo(1024, i * 512);
    ctx.stroke();
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Gentle wall-paint noise so large walls do not read as flat CG. */
export function wallTexture(tint = "#f3f5f6") {
  const { c, ctx } = canvas(512, 512);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, 512, 512);
  const rng = mulberry(7);
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(0,0,0,${0.012 + rng() * 0.018})`;
    ctx.fillRect(rng() * 512, rng() * 512, 1 + rng() * 3, 1 + rng() * 3);
  }
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** A poster: title + body lines. Original teaching content only. */
export function posterTexture(title: string, lines: string[], accent = "#1C7BD9") {
  const { c, ctx } = canvas(600, 800);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 600, 800);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, 600, 120);
  ctx.fillStyle = "#fff";
  ctx.font = `700 44px ${FONT}`;
  wrap(ctx, title, 36, 75, 540, 48, 1);
  ctx.fillStyle = "#22262d";
  ctx.font = `400 30px ${FONT}`;
  lines.forEach((l, i) => wrap(ctx, l, 36, 190 + i * 74, 530, 34, 2));
  ctx.fillStyle = "#8a9099";
  ctx.font = `500 22px ${FONT}`;
  ctx.fillText("PharmaWallah Virtual Labs", 36, 770);
  return tex(c);
}

/** Tiny deterministic RNG for texture noise. */
export function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Burette/cylinder graduation strip: majors every `major` units with numbers. */
export function graduationTexture(opts: { from: number; to: number; minor: number; major: number; labelEvery: number; h?: number; flip?: boolean }) {
  const h = opts.h ?? 2048;
  const w = 128;
  const { c, ctx } = canvas(w, h);
  ctx.clearRect(0, 0, w, h);
  const span = opts.to - opts.from;
  ctx.fillStyle = "#1b1f26";
  ctx.strokeStyle = "#1b1f26";
  ctx.font = `600 34px ${FONT}`;
  const steps = Math.round(span / opts.minor);
  for (let i = 0; i <= steps; i++) {
    const v = opts.from + i * opts.minor;
    const frac = (v - opts.from) / span;
    const y = opts.flip ? frac * (h - 40) + 20 : (1 - frac) * (h - 40) + 20;
    const isMajor = Math.abs(v / opts.major - Math.round(v / opts.major)) < 1e-6;
    ctx.lineWidth = isMajor ? 4 : 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(isMajor ? 60 : 30, y);
    ctx.stroke();
    if (Math.abs(v / opts.labelEvery - Math.round(v / opts.labelEvery)) < 1e-6) ctx.fillText(String(Math.round(v * 10) / 10), 66, y + 12);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
