/**
 * Worked steps and lab-record sections for the partition coefficient tool.
 * One description feeds the on-screen step blocks, Copy, the PNG card and the
 * printout, so the filed record cannot disagree with the screen.
 *
 * Display formatting only — every value arrives at full precision from
 * `_partition.ts` and is rounded here, at the last moment.
 */

import { formatScientific, formatSig } from "@/components/calculators/lab-math";
import type { LabReportSection } from "@/components/calculators/LabReport";
import { equationABX, num, paren } from "@/components/calculators/lab-analysis/format";
import type { Checked } from "@/components/calculators/lab-analysis/math";
import type { GroupResult, PartitionAnalysis, PhResult, Regression } from "./_partition";

export type Step = { label: string; lines: string[]; error?: string };

/** A computed value in a worked step (6 s.f.), with a true minus sign. */
export const n6 = (value: number) => num(value).replace(/^-/, "−");
/** A value in a table or tile (4 s.f.). */
export const n4 = (value: number) => formatSig(value, 4).replace(/^-/, "−");
/** [H+] and 1/[H+] span orders of magnitude — always scientific. */
export const sci = (value: number, sig = 3) => formatScientific(value, sig);

/** What a table cell shows for a value that could not be calculated. */
export const NOT_CALCULABLE = "⚠ not calculable";

export function cell(value: Checked<number> | null, format: (v: number) => string = n4): string {
  return value?.ok ? format(value.value) : NOT_CALCULABLE;
}

/** "10^(−4.5)" — the pH exactly as the student typed it. */
const powerOfMinusPh = (ph: PhResult) => `10^(−${ph.pHText})`;
const powerOfPh = (ph: PhResult) => `10^(${ph.pHText})`;

/* ─── The nine steps of the practical sheet, for one experimental group ──── */

export function phLevelSteps(ph: PhResult): Step[] {
  const { average, reciprocal, used, excluded, hydrogen } = ph;
  const n = used.length;
  const total = used.reduce((acc, u) => acc + u.logD, 0);

  const averageStep: Step = {
    label: `Average log D at pH ${ph.pHText}`,
    lines: ["Average log D = Σ(log D) / number of groups"],
  };
  if (average.ok) {
    averageStep.lines.push(
      `Average log D = [${used.map((u) => paren(u.logD)).join(" + ")}] / ${n}`,
      `Average log D = ${n6(total)} / ${n} = ${n6(average.value)}`,
      `Groups used: ${used.map((u) => u.label).join(", ")} (n = ${n})`,
    );
  } else {
    averageStep.error = average.error;
  }
  excluded.forEach((x) => averageStep.lines.push(`Excluded ${x.label}: ${x.reason}`));

  const reciprocalStep: Step = {
    label: "1/log D (reciprocal of average log D — not 1/D)",
    lines: ["1/log D = 1 / average log D"],
  };
  if (average.ok && reciprocal?.ok) {
    reciprocalStep.lines.push(`1/log D = 1 / ${paren(average.value)} = ${n6(reciprocal.value)}`);
  } else {
    reciprocalStep.error = reciprocal && !reciprocal.ok ? reciprocal.error : "1/log D cannot be calculated: average log D is not available.";
  }

  return [
    averageStep,
    reciprocalStep,
    {
      label: "Hydrogen ion concentration [H+]",
      lines: ["[H+] = 10^(−pH)", `[H+] = ${powerOfMinusPh(ph)} = ${sci(hydrogen.h, 6)} mol/L`],
    },
    {
      label: "1/[H+]",
      lines: ["1/[H+] = 1 / [H+] = 10^(pH)", `1/[H+] = 1 / ${sci(hydrogen.h, 6)} = ${powerOfPh(ph)} = ${sci(hydrogen.inverse, 6)} L/mol`],
    },
  ];
}

export function groupSteps(ph: PhResult, group: GroupResult, unit: string): Step[] {
  const { aqEquation: aq, orgEquation: org } = ph;
  const count = ph.replicates;

  const concentrationStep = (
    symbol: "Caq" | "CoP",
    label: string,
    meanAbs: number,
    eq: { a: number; b: number },
    value: Checked<number>,
  ): Step => ({
    label,
    lines: [
      `Equation: ${equationABX(eq.a, eq.b)}`,
      `${symbol} = (Y − a) / b`,
      `${symbol} = (${paren(meanAbs)} − ${paren(eq.a)}) / ${paren(eq.b)}`,
      ...(value.ok ? [`${symbol} = ${n6(meanAbs - eq.a)} / ${paren(eq.b)} = ${n6(value.value)} ${unit}`] : []),
    ],
    error: value.ok ? undefined : value.error,
  });

  const { caq, cop, d, logD } = group;

  const dStep: Step = { label: "Distribution coefficient D", lines: ["D = CoP / Caq"] };
  if (caq.ok && cop.ok) {
    dStep.lines.push(`D = ${n6(cop.value)} / ${paren(caq.value)}`);
    if (d?.ok) dStep.lines.push(`D = ${n6(d.value)} (no unit — the concentration units cancel)`);
    else if (d && !d.ok) dStep.error = d.error;
  } else {
    dStep.error = "D cannot be calculated until Caq and CoP are both available.";
  }

  const logStep: Step = { label: "log D", lines: ["log D = log10(D)"] };
  if (d?.ok) logStep.lines.push(`log D = log10(${paren(d.value)})`);
  if (logD?.ok) logStep.lines[logStep.lines.length - 1] += ` = ${n6(logD.value)}`;
  else logStep.error = logD && !logD.ok ? logD.error : "log D cannot be calculated because D is not available.";

  return [
    {
      label: "Average absorbance",
      lines: [
        `Āaq = (${group.aqReadings.map((r) => paren(r)).join(" + ")}) / ${count} = ${n6(group.meanAq)} AU`,
        `Āorg = (${group.orgReadings.map((r) => paren(r)).join(" + ")}) / ${count} = ${n6(group.meanOrg)} AU`,
      ],
    },
    concentrationStep("Caq", "Concentration in the aqueous phase, Caq", group.meanAq, aq, caq),
    concentrationStep(
      "CoP",
      ph.sameEquation ? "Concentration in the organic phase, CoP (same equation as the aqueous phase)" : "Concentration in the organic phase, CoP (organic-phase equation)",
      group.meanOrg,
      org,
      cop,
    ),
    dStep,
    logStep,
    ...phLevelSteps(ph),
  ];
}

/* ─── Tables ─────────────────────────────────────────────────────────────── */

/** The spec's group-level table. pH-level values appear on the first row of each pH only. */
export function groupTable(results: PhResult[], unit: string): { columns: string[]; rows: string[][] } {
  const rows: string[][] = [];
  results.forEach((ph) => {
    ph.groups.forEach((g, i) => {
      const first = i === 0;
      rows.push([
        ph.pHText,
        g.label,
        `${n4(g.meanAq)} / ${n4(g.meanOrg)}`,
        cell(g.caq),
        cell(g.cop),
        cell(g.d),
        cell(g.logD),
        first ? cell(ph.average) : "",
        first ? cell(ph.reciprocal) : "",
        first ? sci(ph.hydrogen.h) : "",
        first ? sci(ph.hydrogen.inverse) : "",
      ]);
    });
  });
  return {
    columns: ["pH", "Group", "Avg abs aq / org (AU)", `Caq (${unit})`, `CoP (${unit})`, "D", "log D", "Average log D", "1/log D", "[H+] (mol/L)", "1/[H+] (L/mol)"],
    rows,
  };
}

export function phTable(results: PhResult[]): { columns: string[]; rows: string[][] } {
  return {
    columns: ["pH", "Average log D", "1/log D", "[H+] (mol/L)", "1/[H+] (L/mol)"],
    rows: results.map((ph) => [ph.pHText, cell(ph.average), cell(ph.reciprocal), sci(ph.hydrogen.h), sci(ph.hydrogen.inverse)]),
  };
}

/* ─── Regression ─────────────────────────────────────────────────────────── */

export const GRAPHS = {
  ph: { title: "Graph 1 — pH vs log D", xLabel: "pH", xTerm: "pH" },
  inverse: { title: "Graph 2 — 1/[H+] vs log D", xLabel: "1/[H+] (L/mol)", xTerm: "1/[H+]" },
} as const;

export type GraphKind = keyof typeof GRAPHS;

/** "log D = −0.2385·(pH) + 0.8021" */
export function regressionEquation(kind: GraphKind, slope: number, intercept: number, sig = 4): string {
  const m = formatSig(slope, sig).replace(/^-/, "−");
  const c = formatSig(Math.abs(intercept), sig);
  return `log D = ${m}·(${GRAPHS[kind].xTerm}) ${intercept < 0 ? "−" : "+"} ${c}`;
}

function regressionSection(kind: GraphKind, regression: Regression): LabReportSection {
  const title = `Regression — ${GRAPHS[kind].title}`;
  if (regression.status !== "fit") return { title, lines: [regression.message] };
  const { fit } = regression;
  return {
    title,
    rows: [
      { label: "Points (group log D values)", value: String(fit.n) },
      { label: "Slope (m)", value: n6(fit.slope), unit: kind === "ph" ? "per pH unit" : "per (L/mol)" },
      { label: "Intercept (c)", value: n6(fit.intercept) },
      { label: "R²", value: fit.r2 === null ? "undefined (every log D identical)" : fit.r2.toFixed(4) },
    ],
    formulas: [
      "m = [nΣxy − (Σx)(Σy)] / [nΣx² − (Σx)²]",
      `m = ${n6(fit.slopeNumerator)} / ${n6(fit.denominator)} = ${n6(fit.slope)}`,
      "c = [Σy − mΣx] / n",
      `c = [${n6(fit.sumY)} − ${paren(fit.slope)} × ${paren(fit.sumX)}] / ${fit.n} = ${n6(fit.intercept)}`,
      fit.r2 === null ? "R² is undefined because Σ(y − ȳ)² = 0." : `R² = 1 − Σ(y − ŷ)² / Σ(y − ȳ)² = 1 − ${n6(fit.sse)} / ${n6(fit.sst)} = ${n6(fit.r2)}`,
      regressionEquation(kind, fit.slope, fit.intercept, 6),
    ],
    lines: kind === "inverse" ? ["1/[H+] spans orders of magnitude, so the highest pH carries most of the weight in this straight-line fit."] : undefined,
  };
}

/* ─── Lab record ─────────────────────────────────────────────────────────── */

export function reportSections(analysis: PartitionAnalysis, unit: string): LabReportSection[] {
  const results = analysis.results ?? [];
  const sections: LabReportSection[] = [
    { title: "Summary by pH", table: phTable(results), lines: ["1/log D is the reciprocal of the average log D, as tabulated on the practical sheet — it is not 1/D."] },
    {
      title: "Results by experimental group",
      table: {
        columns: ["pH", "Group", "Āaq (AU)", "Āorg (AU)", `Caq (${unit})`, `CoP (${unit})`, "D", "log D"],
        rows: results.flatMap((ph) => ph.groups.map((g) => [ph.pHText, g.label, n4(g.meanAq), n4(g.meanOrg), cell(g.caq), cell(g.cop), cell(g.d), cell(g.logD)])),
      },
    },
    {
      title: "Calibration equations (Y = a + bX)",
      table: {
        columns: ["pH", "Aqueous phase", "Organic phase"],
        rows: results.map((ph) => [ph.pHText, equationABX(ph.aqEquation.a, ph.aqEquation.b), ph.sameEquation ? "same as aqueous" : equationABX(ph.orgEquation.a, ph.orgEquation.b)]),
      },
      lines: [`Y = absorbance (AU); X = concentration (${unit}).`],
    },
    {
      title: "Absorbance readings",
      table: {
        columns: ["Group", "pH", "Aqueous (AU)", "Organic (AU)"],
        rows: results.flatMap((ph) => ph.groups.map((g) => [g.label, ph.pHText, g.aqReadings.join(", "), g.orgReadings.join(", ")])),
      },
    },
  ];

  results.forEach((ph) => {
    ph.groups.forEach((g) => {
      const formulas: string[] = [];
      groupSteps(ph, g, unit).forEach((step, i) => {
        formulas.push(`${i + 1}. ${step.label}`);
        step.lines.forEach((line) => formulas.push(`   ${line}`));
        if (step.error) formulas.push(`   ⚠ ${step.error}`);
      });
      sections.push({ title: `${g.label} at pH ${ph.pHText} — calculation`, formulas });
    });
  });

  if (analysis.regression) {
    sections.push(regressionSection("ph", analysis.regression.ph), regressionSection("inverse", analysis.regression.inverse));
  }
  return sections;
}

/** The lab card's headline: every pH's average log D, when it fits on one line. */
export function headline(results: PhResult[]): { label: string; value: string } {
  if (results.length <= 3) {
    return {
      label: `Average log D at pH ${results.map((r) => r.pHText).join(" · ")}`,
      value: results.map((r) => (r.average.ok ? formatSig(r.average.value, 3).replace(/^-/, "−") : "—")).join(" · "),
    };
  }
  const valid = results.filter((r) => r.average.ok).map((r) => (r.average.ok ? r.average.value : 0));
  if (valid.length === 0) return { label: "Average log D", value: "—" };
  return {
    label: `Average log D across ${results.length} pH values (range)`,
    value: `${n4(Math.min(...valid))} to ${n4(Math.max(...valid))}`,
  };
}
