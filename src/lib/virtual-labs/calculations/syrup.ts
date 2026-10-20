/**
 * Sucrose-solution physics for the Pharmaceutics lab (Simple Syrup).
 *
 * Density of aqueous sucrose at 20 °C against % w/w: the decade values of NBS Circular
 * C457 (Snyder & Hammond, 1946, public domain —
 * https://nvlpubs.nist.gov/nistpubs/Legacy/circ/nbscircular457.pdf), interpolated with a
 * quadratic through the three nearest points (error well under 0.001 g/mL, far inside
 * what the lab resolves). Units: g, mL, g/mL, °C, % w/w (g/100 g), % w/v (g/100 mL).
 */

export const SUCROSE_DENSITY_20C: [number, number][] = [
  [0, 0.99823],
  [10, 1.03814],
  [20, 1.08096],
  [30, 1.12698],
  [40, 1.17645],
  [50, 1.22957],
  [60, 1.28646],
  [70, 1.34717],
];

/** Density (g/mL, 20 °C) of a sucrose solution of `ww` % w/w. Clamped to 0–70 %. */
export function densityAt20(ww: number): number {
  if (!Number.isFinite(ww)) return NaN;
  const t = SUCROSE_DENSITY_20C;
  const x = Math.min(t[t.length - 1][0], Math.max(t[0][0], ww));
  // three nearest table points (Lagrange quadratic)
  let i = Math.round(x / 10) - 1;
  i = Math.max(0, Math.min(t.length - 3, i));
  const [[x0, y0], [x1, y1], [x2, y2]] = [t[i], t[i + 1], t[i + 2]];
  return (
    (y0 * (x - x1) * (x - x2)) / ((x0 - x1) * (x0 - x2)) +
    (y1 * (x - x0) * (x - x2)) / ((x1 - x0) * (x1 - x2)) +
    (y2 * (x - x0) * (x - x1)) / ((x2 - x0) * (x2 - x1))
  );
}

/**
 * Volume (mL) of a solution of `sucroseG` dissolved in `waterG`, at temperature `tC`.
 * A syrup expands about 0.05 % per °C (teaching value, the order of a concentrated
 * sugar solution's volumetric expansion coefficient) — which is why it is made up to
 * volume only after cooling.
 */
export const SYRUP_EXPANSION_PER_C = 0.0005;
export function solutionVolume(sucroseG: number, waterG: number, tC = 20): number {
  if (sucroseG < 0 || waterG <= 0) return NaN;
  const total = sucroseG + waterG;
  const ww = (sucroseG / total) * 100;
  return (total / densityAt20(ww)) * (1 + SYRUP_EXPANSION_PER_C * (tC - 20));
}

/** % w/w for a target % w/v, solving w·ρ(w) = wv (bisection; monotonic). */
export function wwFromWv(wv: number): number {
  if (!(wv >= 0)) return NaN;
  let lo = 0;
  let hi = 70;
  if (hi * densityAt20(hi) < wv) return NaN; // beyond the table
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (mid * densityAt20(mid) < wv) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Sucrose (g) for a batch: concentration in g per 100 mL × batch volume. */
export function sucroseForBatch(gPer100mL: number, batchMl: number): number {
  if (!(gPer100mL > 0) || !(batchMl > 0)) return NaN;
  return (gPer100mL * batchMl) / 100;
}

/** Water (g) a batch ends up containing once made up to volume at 20 °C. */
export function waterInBatch(gPer100mL: number, batchMl: number): number {
  const ww = wwFromWv(gPer100mL);
  const total = (batchMl * densityAt20(ww));
  return total - sucroseForBatch(gPer100mL, batchMl);
}

/** Density from a weighed volume. */
export function densityFromWeighing(massG: number, volumeMl: number): number {
  if (!(massG > 0) || !(volumeMl > 0)) return NaN;
  return massG / volumeMl;
}

/** Percentage deviation of a measured quantity from its target. */
export function deviationPercent(actual: number, target: number): number {
  if (!(target > 0) || !Number.isFinite(actual)) return NaN;
  return ((actual - target) / target) * 100;
}
