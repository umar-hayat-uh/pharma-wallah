// ============================================================
// Deterministic variation
// ============================================================
//
// Cases vary between runs but are reproducible: everything random here is
// driven by an explicit seed, never by `Math.random()`. That matters twice —
// a `Math.random()` call during render is a hydration mismatch (this repo has
// already shipped that bug once, in the zone-of-inhibition dish), and a case a
// student cannot replay is a case a tutor cannot discuss with them.
//
// The seed is printed on the case card and in the performance report, so a run
// can be reproduced exactly.

/** mulberry32 — small, fast, good enough for shuffling a shelf. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32-bit hash of a string, for seeding from an id. */
export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Fisher–Yates against a supplied generator. Returns a new array. */
export function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/** Integer in [min, max]. */
export function randomInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}
