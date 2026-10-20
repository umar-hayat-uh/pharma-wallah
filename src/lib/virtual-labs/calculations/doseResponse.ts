/**
 * Graded dose–response model for the Pharmacology lab.
 *
 * The response follows the Hill (sigmoid Emax) equation:
 *     E = Emax · Cⁿ / (EC50ⁿ + Cⁿ)
 * where C is the agonist's molar concentration in the organ bath. The parameters used
 * by the lab are TEACHING VALUES chosen to give a textbook-shaped curve across the
 * permitted concentration range; they are not measured data from any animal or tissue.
 */

export function hill(c: number, emax: number, ec50: number, n = 1): number {
  if (!(c >= 0) || !(emax >= 0) || !(ec50 > 0) || !(n > 0)) return NaN;
  if (c === 0) return 0;
  const r = (c / ec50) ** n;
  return (emax * r) / (1 + r);
}

/** Concentration that gives fraction `f` (0–1) of Emax — the inverse Hill equation. */
export function concentrationFor(f: number, ec50: number, n = 1): number {
  if (!(f > 0 && f < 1) || !(ec50 > 0) || !(n > 0)) return NaN;
  return ec50 * (f / (1 - f)) ** (1 / n);
}

/** Volume of stock (µL) to add to a bath of `bathMl` to reach `cBath` M, from a stock of `cStock` M. */
export function stockVolumeUl(cBath: number, bathMl: number, cStock: number): number {
  if (!(cBath > 0) || !(bathMl > 0) || !(cStock > 0)) return NaN;
  return ((cBath * bathMl) / cStock) * 1000;
}

export interface Point {
  c: number; // M
  e: number; // response, any unit
}

export interface HillFit {
  emax: number;
  ec50: number;
  logEc50: number;
  n: number;
  r2: number;
}

/**
 * Least-squares Hill fit by grid search over log EC50 and n, with Emax solved exactly
 * for each pair (E is linear in Emax). Robust and dependency-free; resolution 0.01 log
 * unit, 0.05 in n — finer than a student can read from a graph.
 */
export function fitHill(points: Point[]): HillFit | null {
  const pts = points.filter((p) => p.c > 0 && Number.isFinite(p.e));
  if (pts.length < 3) return null;
  const meanE = pts.reduce((t, p) => t + p.e, 0) / pts.length;
  const ssTot = pts.reduce((t, p) => t + (p.e - meanE) ** 2, 0);
  let best: HillFit | null = null;
  let bestSs = Infinity;
  const logs = pts.map((p) => Math.log10(p.c));
  const lo = Math.min(...logs) - 1;
  const hi = Math.max(...logs) + 1;
  for (let le = lo; le <= hi + 1e-9; le += 0.01) {
    for (let n = 0.5; n <= 2.5 + 1e-9; n += 0.05) {
      const g = pts.map((p) => hill(p.c, 1, 10 ** le, n));
      const gg = g.reduce((t, x) => t + x * x, 0);
      if (gg === 0) continue;
      const emax = g.reduce((t, x, i) => t + x * pts[i].e, 0) / gg;
      const ss = pts.reduce((t, p, i) => t + (p.e - emax * g[i]) ** 2, 0);
      if (ss < bestSs) {
        bestSs = ss;
        best = { emax, ec50: 10 ** le, logEc50: le, n, r2: ssTot > 0 ? 1 - ss / ssTot : 1 };
      }
    }
  }
  return best;
}

/** Response expressed as % of the largest response recorded. */
export function percentOfMax(e: number, maxE: number): number {
  if (!(maxE > 0) || !Number.isFinite(e)) return NaN;
  return (e / maxE) * 100;
}

/** Format a molar concentration as "3 × 10⁻⁷ M". */
export function molarLabel(c: number): string {
  if (!(c > 0)) return "—";
  const exp = Math.floor(Math.log10(c) + 1e-9);
  const mant = Math.round((c / 10 ** exp) * 10) / 10;
  const sup = String(exp).replace(/-/g, "⁻").replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+d]);
  return `${mant === 1 ? "" : `${mant} × `}10${sup} M`;
}
