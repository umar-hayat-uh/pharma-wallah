/**
 * Partition / distribution coefficient: validation and every calculation of
 * the Pharm-D practical sheet, kept apart from the page so the maths can be
 * checked on its own. Pure — ships inside the offline Android app.
 *
 * The sheet's workflow, per experimental group (B1, B2, …) at one pH:
 *   Ā = mean of the replicate absorbances, for each phase
 *   C = (Ā − a) / b, with the calibration line that phase was read against
 *   D = CoP / Caq, log D = log10(D)
 * and per pH:
 *   average log D = Σ(log D) / number of groups, 1/log D = 1 / average log D
 *   [H+] = 10^(−pH), 1/[H+] = 10^(pH)
 *
 * Imports come from the pure modules directly (not the lab-analysis index,
 * which also re-exports React parts) so this file runs under plain Node.
 */

import { toNumber } from "@/components/calculators/lab-math";
import {
  concentrationFromAbsorbance,
  fail,
  linearFit,
  mean,
  ok,
  type Checked,
  type LinearFit,
  type Point,
} from "@/components/calculators/lab-analysis/math";

export const MIN_REPLICATES = 2;
export const MAX_REPLICATES = 10;
export const DEFAULT_REPLICATES = 3;
export const MIN_PH = 0;
export const MAX_PH = 14;

/* ─── Input model (strings, exactly as typed) ────────────────────────────── */

export type EquationCells = { intercept: string; slope: string };

export type ExperimentalGroupInput = {
  id: number;
  /**
   * Always MAX_REPLICATES long; only the first `replicates` are read. Lowering
   * the replicate count and raising it again gives the readings back instead
   * of silently discarding them.
   */
  aqueous: string[];
  organic: string[];
};

export type PhGroupInput = {
  id: number;
  pH: string;
  aqueous: EquationCells;
  organic: EquationCells;
  /** True: the organic phase is read against the aqueous-phase equation. */
  sameEquation: boolean;
  replicates: number;
  groups: ExperimentalGroupInput[];
};

/* ─── Single calculations ────────────────────────────────────────────────── */

export type Equation = { a: number; b: number };

/** D = C(organic phase) / C(aqueous phase). */
export function distributionCoefficient(caq: number, cop: number): Checked<number> {
  if (caq === 0) return fail("D cannot be calculated: Caq = 0 (division by zero).");
  return ok(cop / caq);
}

/**
 * log D = log10(D). A concentration at or below zero is not a physical result
 * (the mean absorbance is at or below the intercept), so log D is refused when
 * either phase is ≤ 0 — including the case where both are negative and their
 * ratio would happen to be positive.
 */
export function logDistribution(caq: number, cop: number, d: Checked<number>): Checked<number> {
  if (!d.ok) return fail(`log D cannot be calculated: ${d.error.replace(/^D cannot be calculated: /, "")}`);
  if (caq <= 0 || cop <= 0 || d.value <= 0) {
    return fail("log D cannot be calculated because D must be greater than 0 (Caq and CoP must both be positive).");
  }
  return ok(Math.log10(d.value));
}

/** Average log D = Σ(log D) / number of groups. */
export function averageLogD(values: number[]): Checked<number> {
  const value = mean(values);
  if (value === null) return fail("Average log D cannot be calculated: no experimental group at this pH has a valid log D.");
  return ok(value);
}

/**
 * 1/log D = 1 / average log D — the practical sheet's column. Deliberately NOT
 * 1/D. The zero test allows for round-off: log D values of +0.3 and −0.3
 * average to ~1e-17 in floating point, and 1/1e-17 is not a result.
 */
export function reciprocalOfAverageLogD(average: number, values: number[] = []): Checked<number> {
  const scale = Math.max(1, ...values.map((v) => Math.abs(v)));
  if (average === 0 || Math.abs(average) <= 1e-12 * scale) {
    return fail("1/log D cannot be calculated: average log D = 0 (division by zero).");
  }
  return ok(1 / average);
}

/** [H+] = 10^(−pH) mol/L and 1/[H+] = 10^(pH) L/mol. */
export function hydrogenIon(pH: number): { h: number; inverse: number } {
  return { h: Math.pow(10, -pH), inverse: Math.pow(10, pH) };
}

/* ─── Regression on a graph ──────────────────────────────────────────────── */

export type Regression =
  | { status: "fit"; fit: LinearFit }
  | { status: "two-points"; message: string }
  | { status: "not-possible"; message: string };

/**
 * A line is only fitted when it can say something: ≥ 3 points spanning ≥ 2
 * distinct x values. Two points always give R² = 1, so no statistic is shown
 * for them rather than a meaningless perfect fit.
 */
export function regressionFor(points: Point[]): Regression {
  const distinct = new Set(points.map((p) => p.x)).size;
  if (points.length < 2 || distinct < 2) {
    return {
      status: "not-possible",
      message:
        points.length === 0
          ? "No valid log D values to plot yet."
          : "Regression is not possible: every point has the same x value. Add experimental groups at a different pH.",
    };
  }
  if (points.length < 3) {
    return { status: "two-points", message: "Only two points: a line through two points always has R² = 1 — add more data before reading a trend." };
  }
  const fit = linearFit(points);
  if (!fit.ok) return { status: "not-possible", message: fit.error };
  return { status: "fit", fit: fit.value };
}

/* ─── Whole-page analysis ────────────────────────────────────────────────── */

export type GroupResult = {
  id: number;
  label: string;
  aqReadings: string[];
  orgReadings: string[];
  meanAq: number;
  meanOrg: number;
  caq: Checked<number>;
  cop: Checked<number>;
  d: Checked<number> | null;
  logD: Checked<number> | null;
};

export type PhResult = {
  id: number;
  /** 1-based position on the page. */
  index: number;
  pHText: string;
  pH: number;
  aqEquation: Equation;
  orgEquation: Equation;
  sameEquation: boolean;
  replicates: number;
  groups: GroupResult[];
  /** Groups whose log D entered the average. */
  used: { label: string; logD: number }[];
  excluded: { label: string; reason: string }[];
  average: Checked<number>;
  reciprocal: Checked<number> | null;
  hydrogen: { h: number; inverse: number };
};

export type PartitionAnalysis = {
  /** `${phId}:pH`, `${groupId}:${readingIndex}:aq` / `:org`. */
  cellErrors: Record<string, string>;
  /** Null until every visible input is valid. */
  results: PhResult[] | null;
  warnings: string[];
  /** Group-level log D points: x = pH, and x = 1/[H+]. */
  points: { ph: Point[]; inverse: Point[] };
  averagePoints: { ph: Point[]; inverse: Point[] };
  regression: { ph: Regression; inverse: Regression } | null;
};

/** B1, B2, … numbered continuously across every pH group on the page. */
export function groupLabels(phGroups: PhGroupInput[]): Record<number, string> {
  const labels: Record<number, string> = {};
  let n = 0;
  phGroups.forEach((ph) => ph.groups.forEach((group) => {
    n += 1;
    labels[group.id] = `B${n}`;
  }));
  return labels;
}

function readingError(raw: string, show: boolean): string | undefined {
  if (raw.trim() === "") return show ? "Required." : undefined;
  return toNumber(raw) === null ? "Enter a number." : undefined;
}

export function pHError(raw: string, show: boolean): string | undefined {
  if (raw.trim() === "") return show ? "Required." : undefined;
  const value = toNumber(raw);
  if (value === null) return "Enter a number.";
  if (value < MIN_PH || value > MAX_PH) return `pH must be between ${MIN_PH} and ${MAX_PH}.`;
  return undefined;
}

function parseEquation(cells: EquationCells): Equation | null {
  const a = toNumber(cells.intercept);
  const b = toNumber(cells.slope);
  return a === null || b === null || b === 0 ? null : { a, b };
}

function concentration(meanAbs: number, eq: Equation, phase: "Caq" | "CoP"): Checked<number> {
  const c = concentrationFromAbsorbance(meanAbs, eq.a, eq.b);
  return c.ok ? c : fail(`${phase} cannot be calculated: ${c.error}`);
}

export function analysePartition(phGroups: PhGroupInput[], show: boolean): PartitionAnalysis {
  const cellErrors: Record<string, string> = {};
  const warnings: string[] = [];
  const labels = groupLabels(phGroups);
  let complete = true;

  phGroups.forEach((ph) => {
    const e = pHError(ph.pH, show);
    if (e) cellErrors[`${ph.id}:pH`] = e;
    if (e || ph.pH.trim() === "") complete = false;
    if (!parseEquation(ph.aqueous)) complete = false;
    if (!ph.sameEquation && !parseEquation(ph.organic)) complete = false;
    ph.groups.forEach((group) => {
      for (let i = 0; i < ph.replicates; i++) {
        const aq = readingError(group.aqueous[i] ?? "", show);
        const org = readingError(group.organic[i] ?? "", show);
        if (aq) cellErrors[`${group.id}:${i}:aq`] = aq;
        if (org) cellErrors[`${group.id}:${i}:org`] = org;
        if (toNumber(group.aqueous[i] ?? "") === null || toNumber(group.organic[i] ?? "") === null) complete = false;
      }
    });
  });

  const empty = { ph: [], inverse: [] };
  if (!complete) return { cellErrors, results: null, warnings, points: empty, averagePoints: empty, regression: null };

  const results: PhResult[] = phGroups.map((ph, phIndex) => {
    const pH = toNumber(ph.pH)!;
    const aqEquation = parseEquation(ph.aqueous)!;
    const orgEquation = ph.sameEquation ? aqEquation : parseEquation(ph.organic)!;

    const groups: GroupResult[] = ph.groups.map((group) => {
      const label = labels[group.id];
      const aqReadings = group.aqueous.slice(0, ph.replicates).map((v) => v.trim());
      const orgReadings = group.organic.slice(0, ph.replicates).map((v) => v.trim());
      const meanAq = mean(aqReadings.map((v) => toNumber(v)!))!;
      const meanOrg = mean(orgReadings.map((v) => toNumber(v)!))!;
      const caq = concentration(meanAq, aqEquation, "Caq");
      const cop = concentration(meanOrg, orgEquation, "CoP");
      const d = caq.ok && cop.ok ? distributionCoefficient(caq.value, cop.value) : null;
      const logD = caq.ok && cop.ok && d ? logDistribution(caq.value, cop.value, d) : null;

      if (caq.ok && caq.value <= 0) {
        warnings.push(`${label} (pH ${ph.pH.trim()}): Caq is ${caq.value === 0 ? "zero" : "negative"} — the mean aqueous absorbance is ${caq.value === 0 ? "equal to" : "below"} the intercept a. Check the blank and the calibration line.`);
      }
      if (cop.ok && cop.value <= 0) {
        warnings.push(`${label} (pH ${ph.pH.trim()}): CoP is ${cop.value === 0 ? "zero" : "negative"} — the mean organic absorbance is ${cop.value === 0 ? "equal to" : "below"} the intercept a. Check the blank and the calibration line.`);
      }
      return { id: group.id, label, aqReadings, orgReadings, meanAq, meanOrg, caq, cop, d, logD };
    });

    const used: PhResult["used"] = [];
    const excluded: PhResult["excluded"] = [];
    groups.forEach((g) => {
      if (g.logD?.ok) used.push({ label: g.label, logD: g.logD.value });
      else excluded.push({ label: g.label, reason: g.logD && !g.logD.ok ? g.logD.error : g.d && !g.d.ok ? g.d.error : !g.caq.ok ? g.caq.error : !g.cop.ok ? g.cop.error : "log D not available." });
    });
    const values = used.map((u) => u.logD);
    const average = averageLogD(values);
    const reciprocal = average.ok ? reciprocalOfAverageLogD(average.value, values) : null;

    if (excluded.length > 0 && used.length > 0) {
      warnings.push(`pH ${ph.pH.trim()}: average log D uses ${used.length} of ${groups.length} groups — ${excluded.map((x) => x.label).join(", ")} excluded because log D could not be calculated.`);
    }
    if (!average.ok) warnings.push(`pH ${ph.pH.trim()}: no experimental group has a valid log D, so average log D and 1/log D cannot be calculated.`);

    return {
      id: ph.id,
      index: phIndex + 1,
      pHText: ph.pH.trim(),
      pH,
      aqEquation,
      orgEquation,
      sameEquation: ph.sameEquation,
      replicates: ph.replicates,
      groups,
      used,
      excluded,
      average,
      reciprocal,
      hydrogen: hydrogenIon(pH),
    };
  });

  // Two pH groups at the same pH are not merged: the student entered them as
  // separate experiments, and merging would change their averages silently.
  const seen = new Map<number, number>();
  results.forEach((r) => {
    const first = seen.get(r.pH);
    if (first !== undefined) {
      warnings.push(`pH groups ${first} and ${r.index} both have pH ${r.pHText}. They are summarised separately — put the experimental groups in one pH group if they belong to the same average.`);
    } else seen.set(r.pH, r.index);
  });

  const points = { ph: [] as Point[], inverse: [] as Point[] };
  const averagePoints = { ph: [] as Point[], inverse: [] as Point[] };
  results.forEach((r) => {
    r.used.forEach((u) => {
      points.ph.push({ x: r.pH, y: u.logD });
      points.inverse.push({ x: r.hydrogen.inverse, y: u.logD });
    });
    if (r.average.ok) {
      averagePoints.ph.push({ x: r.pH, y: r.average.value });
      averagePoints.inverse.push({ x: r.hydrogen.inverse, y: r.average.value });
    }
  });

  return {
    cellErrors,
    results,
    warnings,
    points,
    averagePoints,
    regression: { ph: regressionFor(points.ph), inverse: regressionFor(points.inverse) },
  };
}
