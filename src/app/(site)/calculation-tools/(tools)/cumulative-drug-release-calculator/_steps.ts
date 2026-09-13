/**
 * Worked steps for one time point, written out with every substitution. One
 * builder feeds the on-screen StepBlocks and the lab record (Copy / PNG /
 * Print), so the two cannot disagree. Display rounding only — every number is
 * formatted from the full-precision values in `_release.ts`.
 */

import { num, paren } from "@/components/calculators/lab-analysis/format";
import type { Method, PointCells, ReleaseResult } from "./_release";

export type Step = { label: string; lines: string[] };

/** How each unit becomes mg/mL, written as a student would justify it. */
export const UNIT_CONVERSION: Record<string, { factor: string; reason: string }> = {
  "µg/mL": { factor: "0.001", reason: "1 µg = 0.001 mg" },
  "mg/mL": { factor: "1", reason: "already mg/mL" },
  "mg/L": { factor: "0.001", reason: "1 L = 1000 mL" },
  "µg/L": { factor: "0.000001", reason: "1 µg = 0.001 mg and 1 L = 1000 mL" },
  "g/L": { factor: "1", reason: "1 g/L = 1000 mg / 1000 mL" },
};

export function pointSteps(result: ReleaseResult, method: Method, n: number, cells: PointCells, replicates: number): Step[] {
  const { volume: V, intercept: a, slope: b, dilution: DF, unit: u, labelClaim } = result;
  const p = result.points[n];
  const row = result.methods[method][n];
  const conv = UNIT_CONVERSION[u];
  const typed = cells.readings.slice(0, replicates).map((r) => r.trim());
  const Vtext = num(V);
  const steps: Step[] = [];

  steps.push({
    label: "Average absorbance",
    lines:
      typed.length === 1
        ? [`Ȳ = ${typed[0]} AU (single reading)`]
        : [
            `Ȳ = (${typed.map((_, k) => `B${k + 1}`).join(" + ")}) / ${typed.length}`,
            `Ȳ = (${typed.map((t) => paren(t)).join(" + ")}) / ${typed.length}`,
            `Ȳ = ${num(p.readings.reduce((total, r) => total + r, 0))} / ${typed.length} = ${num(p.average)} AU`,
          ],
  });

  steps.push({
    label: "Concentration from the calibration curve",
    lines: [
      "C = (Y − a) / b",
      `C = (${num(p.average)} − ${paren(a)}) / ${paren(b)}`,
      `C = ${paren(p.average - a)} / ${paren(b)} = ${num(p.cRaw)} ${u}`,
    ],
  });

  steps.push({
    label: "Apply the dilution factor",
    lines: ["Actual C = C × dilution factor", `Actual C = ${paren(p.cRaw)} × ${num(DF)} = ${num(p.c)} ${u}`],
  });

  steps.push({
    label: "Convert to mg/mL",
    lines: [`C = ${paren(p.c)} ${u} × ${conv.factor} = ${num(p.cMg)} mg/mL   (${conv.reason})`],
  });

  if (method === "A") {
    if (n === 0) {
      steps.push({
        label: "Correction (Method A)",
        lines: [
          "First sample: nothing has been withdrawn yet, so CF = 0.",
          `Corrected C = C = ${num(row.correctedConc)} ${u}`,
          "Correction amount = 0 mg",
        ],
      });
    } else {
      const prev = result.points[n - 1];
      const prevCorr = result.methods.A[n - 1].correctedConc;
      steps.push({
        label: "Correction (Method A)",
        lines: [
          "CF = (Vs of previous sample / V) × previous corrected C",
          `CF = (${num(prev.vs)} / ${Vtext}) × ${paren(prevCorr)} = ${num(row.correctionConc!)} ${u}`,
          "Corrected C = C + CF",
          `Corrected C = ${paren(p.c)} + ${paren(row.correctionConc!)} = ${num(row.correctedConc)} ${u}`,
          "Correction amount = CF × conversion × V",
          `Correction amount = ${paren(row.correctionConc!)} ${u} × ${conv.factor} × ${Vtext} mL = ${num(row.correctionMg)} mg`,
        ],
      });
    }
    steps.push({
      label: "Cumulative amount released",
      lines: [
        "Cumulative amount = Corrected C × V",
        `Cumulative amount = ${paren(row.correctedConc * result.factor)} mg/mL × ${Vtext} mL = ${num(row.cumulativeMg)} mg`,
      ],
    });
  } else {
    steps.push({
      label: "Correction (Method B)",
      lines:
        n === 0
          ? ["First sample: no earlier sample has removed any drug.", "Correction amount = 0 mg"]
          : [
              "Correction amount = Σ (Cᵢ × Vsᵢ) of every earlier sample",
              `Correction amount = ${row.terms.map((t) => `(${num(t.cMg)} mg/mL × ${num(t.vs)} mL)`).join(" + ")}`,
              ...(row.terms.length > 1 ? [`Correction amount = ${row.terms.map((t) => paren(t.amount)).join(" + ")}`] : []),
              `Correction amount = ${num(row.correctionMg)} mg`,
            ],
    });
    const inVessel = p.cMg * V;
    steps.push({
      label: "Cumulative amount released",
      lines: [
        "Cumulative amount = C × V + correction amount",
        `Cumulative amount = (${paren(p.cMg)} mg/mL × ${Vtext} mL) + ${paren(row.correctionMg)} mg`,
        `Cumulative amount = ${paren(inVessel)} + ${paren(row.correctionMg)} = ${num(row.cumulativeMg)} mg`,
      ],
    });
  }

  steps.push({
    label: "Cumulative % drug release",
    lines: [
      "% Release = (Cumulative amount / label claim) × 100",
      `% Release = (${paren(row.cumulativeMg)} / ${num(labelClaim)}) × 100 = ${num(row.percent)} %`,
    ],
  });

  return steps;
}
