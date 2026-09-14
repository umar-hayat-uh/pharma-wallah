import type { PixelBuffer, Rect } from "./types";

/**
 * A synthetic TLC photograph, drawn from numbers. Pure — no DOM.
 *
 * Two uses: the "Try a sample plate" button (so a student can learn the tool
 * before running a plate, with no bundled photo and no download), and the
 * ground truth for `scripts/tlc-rf.test.mts`, which checks detection and Rf
 * against the positions the spots were drawn at.
 *
 * The photo has what real ones have: a bench around the plate, uneven lighting,
 * sensor noise, a pencil baseline through the origin spots, a faint solvent-front
 * line, and spots of different colours, sizes and strengths (one tailing).
 */

export type SampleSpot = { x: number; y: number; rx: number; ry: number; color: [number, number, number]; strength: number };

export type SamplePlate = {
  buffer: PixelBuffer;
  /** Plate rectangle inside the photo. */
  plate: Rect;
  /** In photo pixels. */
  baselineY: number;
  solventFrontY: number;
  spots: SampleSpot[];
};

/** Deterministic PRNG (mulberry32), so every sample and test run is identical. */
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

export function createSamplePlate(seed = 7): SamplePlate {
  const width = 900;
  const height = 1300;
  const plate: Rect = { x: 170, y: 110, width: 560, height: 1080 };
  const baselineY = plate.y + plate.height - 150; // 1040
  const solventFrontY = plate.y + 110; // 220
  const run = baselineY - solventFrontY; // 820
  const at = (rf: number) => baselineY - rf * run;

  const lane = (k: number) => plate.x + (plate.width * (k + 1)) / 4;
  const spots: SampleSpot[] = [
    // Lane 1 — reference: one purple spot, Rf 0.30
    { x: lane(0), y: at(0.3), rx: 26, ry: 22, color: [118, 52, 140], strength: 0.72 },
    // Lane 2 — mixture: brown spot Rf 0.30, faint orange spot Rf 0.68 (tailing a little)
    { x: lane(1), y: at(0.3), rx: 24, ry: 21, color: [120, 78, 40], strength: 0.62 },
    { x: lane(1), y: at(0.68), rx: 22, ry: 30, color: [214, 120, 40], strength: 0.5 },
    // Lane 3 — second reference: dark spot Rf 0.68
    { x: lane(2), y: at(0.68), rx: 25, ry: 22, color: [60, 60, 72], strength: 0.66 },
  ];

  const random = rng(seed);
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4;
      const inPlate = x >= plate.x && x < plate.x + plate.width && y >= plate.y && y < plate.y + plate.height;
      // Light falls off towards the bottom-right, as under a desk lamp.
      const light = 1 - 0.14 * ((x / width) * 0.6 + (y / height) * 0.4);
      let r: number;
      let g: number;
      let b: number;
      if (inPlate) {
        r = 246 * light;
        g = 245 * light;
        b = 238 * light;
        // Pencil baseline (through the origin) and a fainter solvent-front mark.
        const px = x - plate.x;
        if (px > 18 && px < plate.width - 18) {
          if (Math.abs(y - baselineY) <= 1) {
            r *= 0.62;
            g *= 0.62;
            b *= 0.64;
          } else if (Math.abs(y - solventFrontY) <= 1) {
            r *= 0.8;
            g *= 0.8;
            b *= 0.82;
          }
        }
        for (let k = 0; k < spots.length; k++) {
          const s = spots[k];
          const dx = (x - s.x) / s.rx;
          const dy = (y - s.y) / s.ry;
          const d2 = dx * dx + dy * dy;
          if (d2 > 2.4) continue;
          // Soft-edged disc: flat core, smooth fall-off, like a real spot.
          const a = s.strength * Math.exp(-Math.pow(d2, 1.6) * 1.1);
          r = r * (1 - a) + s.color[0] * light * a;
          g = g * (1 - a) + s.color[1] * light * a;
          b = b * (1 - a) + s.color[2] * light * a;
        }
      } else {
        // Wooden bench.
        const grain = 10 * Math.sin(y / 9 + Math.sin(x / 40) * 2);
        r = (118 + grain) * light;
        g = (92 + grain * 0.8) * light;
        b = (70 + grain * 0.6) * light;
      }
      const noise = (random() - 0.5) * 9;
      data[o] = r + noise;
      data[o + 1] = g + noise;
      data[o + 2] = b + noise;
      data[o + 3] = 255;
    }
  }

  return { buffer: { data, width, height }, plate, baselineY, solventFrontY, spots };
}
