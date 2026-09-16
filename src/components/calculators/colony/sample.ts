import type { Circle, Point, RGBABuffer } from "./types";

/**
 * A synthetic agar-plate photograph, drawn from numbers. Pure — no DOM.
 *
 * Used for "Try a sample plate" (no bundled photo, no download) and as ground
 * truth in scripts/colony-counter.test.mts. It has what real photos have: a
 * bench and a label outside the dish, a bright rim, uneven lighting, sensor
 * noise, colonies of different sizes, and touching pairs that a plain
 * connected-component count would merge.
 *
 * It is a development fixture, not validation data: an algorithm tuned to
 * pass on it has only been shown to work on it.
 */

export type SampleColony = Point & { r: number };

export type SampleVariant = "light" | "dark";

export type SamplePlateSpec = {
  seed?: number;
  size?: number;
  count?: number;
  touchingPairs?: number;
  variant?: SampleVariant;
};

export type SamplePlate = {
  buffer: RGBABuffer;
  plate: Circle;
  colonies: SampleColony[];
  /** How many of `colonies` were drawn touching another one. */
  touching: number;
};

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSamplePlate({
  seed = 11,
  size = 1000,
  count = 60,
  touchingPairs = 6,
  variant = "light",
}: SamplePlateSpec = {}): SamplePlate {
  const random = rng(seed);
  const W = size;
  const H = size;
  const plate: Circle = { x: W * 0.5, y: H * 0.51, r: size * 0.42 };
  const inner = plate.r * 0.9;

  // ── Colonies: rejection sampling keeps them apart, then touching pairs are added.
  const colonies: SampleColony[] = [];
  const minR = size * 0.006;
  const maxR = size * 0.015;
  const fits = (c: SampleColony, gap: number) =>
    Math.hypot(c.x - plate.x, c.y - plate.y) + c.r < inner &&
    colonies.every((o) => Math.hypot(o.x - c.x, o.y - c.y) > o.r + c.r + gap);
  let tries = 0;
  while (colonies.length < count - touchingPairs * 2 && tries++ < 20000) {
    const angle = random() * Math.PI * 2;
    const dist = Math.sqrt(random()) * inner;
    const c = { x: plate.x + Math.cos(angle) * dist, y: plate.y + Math.sin(angle) * dist, r: minR + random() * (maxR - minR) };
    if (fits(c, size * 0.012)) colonies.push(c);
  }
  let touching = 0;
  tries = 0;
  while (touching < touchingPairs * 2 && tries++ < 20000) {
    const angle = random() * Math.PI * 2;
    const dist = Math.sqrt(random()) * inner;
    const r1 = minR * 1.3 + random() * (maxR - minR * 1.3);
    const r2 = minR * 1.3 + random() * (maxR - minR * 1.3);
    const a = { x: plate.x + Math.cos(angle) * dist, y: plate.y + Math.sin(angle) * dist, r: r1 };
    const dir = random() * Math.PI * 2;
    // Overlap by ~15% of the smaller radius: touching, with a visible waist.
    const d = r1 + r2 - Math.min(r1, r2) * 0.3;
    const b = { x: a.x + Math.cos(dir) * d, y: a.y + Math.sin(dir) * d, r: r2 };
    const pairFits =
      [a, b].every((c) => Math.hypot(c.x - plate.x, c.y - plate.y) + c.r < inner) &&
      colonies.every((o) => [a, b].every((c) => Math.hypot(o.x - c.x, o.y - c.y) > o.r + c.r + size * 0.012));
    if (pairFits) {
      colonies.push(a, b);
      touching += 2;
    }
  }

  // ── Palette.
  const agar = variant === "light" ? [196, 170, 112] : [168, 38, 42]; // nutrient agar / blood agar
  const colonyColour = variant === "light" ? [246, 238, 214] : [70, 22, 26];
  const bench = [58, 64, 74];

  const data = new Uint8ClampedArray(W * H * 4);
  // A small spatial index so each pixel only checks nearby colonies.
  const CELL = 32;
  const grid = new Map<number, SampleColony[]>();
  for (const c of colonies) {
    for (let gy = Math.floor((c.y - c.r - 3) / CELL); gy <= Math.floor((c.y + c.r + 3) / CELL); gy++) {
      for (let gx = Math.floor((c.x - c.r - 3) / CELL); gx <= Math.floor((c.x + c.r + 3) / CELL); gx++) {
        const key = gy * 10000 + gx;
        const list = grid.get(key);
        if (list) list.push(c);
        else grid.set(key, [c]);
      }
    }
  }

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      // Lamp from the top-left.
      const light = 1.06 - 0.16 * ((x / W) * 0.5 + (y / H) * 0.5);
      const d = Math.hypot(x - plate.x, y - plate.y);
      let r: number;
      let g: number;
      let b: number;
      if (d > plate.r + 3) {
        [r, g, b] = bench;
        // A paper label on the bench, which must not be counted.
        if (x > W * 0.04 && x < W * 0.26 && y > H * 0.02 && y < H * 0.1) {
          [r, g, b] = [236, 236, 230];
          if ((y % 14 < 3 && x % 9 < 6) || (x > W * 0.06 && x < W * 0.08 && y > H * 0.04 && y < H * 0.07)) [r, g, b] = [40, 40, 60];
        }
      } else if (d > plate.r - 5) {
        // The dish wall: a bright, slightly uneven rim.
        const v = 225 + 20 * Math.sin((Math.atan2(y - plate.y, x - plate.x) * 3) % Math.PI);
        [r, g, b] = [v, v, v];
      } else {
        [r, g, b] = agar;
        // The agar is slightly darker towards the wall.
        const edge = Math.max(0, (d - plate.r * 0.8) / (plate.r * 0.2));
        r *= 1 - 0.08 * edge;
        g *= 1 - 0.08 * edge;
        b *= 1 - 0.08 * edge;
        const near = grid.get(Math.floor(y / CELL) * 10000 + Math.floor(x / CELL));
        if (near) {
          for (const c of near) {
            const t = Math.hypot(x - c.x, y - c.y) / c.r;
            if (t > 1.15) continue;
            // Domed colony: solid core, soft edge, a hint of a highlight.
            const alpha = t < 0.85 ? 1 : Math.max(0, (1.15 - t) / 0.3);
            const dome = 1 + 0.06 * (1 - Math.min(1, t));
            r = r * (1 - alpha) + colonyColour[0] * dome * alpha;
            g = g * (1 - alpha) + colonyColour[1] * dome * alpha;
            b = b * (1 - alpha) + colonyColour[2] * dome * alpha;
          }
        }
      }
      const noise = (random() - 0.5) * 10;
      data[o] = r * light + noise;
      data[o + 1] = g * light + noise;
      data[o + 2] = b * light + noise;
      data[o + 3] = 255;
    }
  }

  return { buffer: { data, width: W, height: H }, plate, colonies, touching };
}
