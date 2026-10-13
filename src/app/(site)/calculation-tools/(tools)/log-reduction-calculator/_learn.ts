import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Log reduction = log₁₀(N₀/Nₜ) and percent reduction.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["aulton6"],
  related: [
    {
      slug: "d-value-calculator",
      name: "D-Value Calculator",
      why: "Divides exposure time by this log reduction to give the D-value.",
    },
  ],
};
