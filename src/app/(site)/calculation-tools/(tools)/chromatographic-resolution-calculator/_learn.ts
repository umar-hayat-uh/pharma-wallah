import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Rs = 2(t₂ − t₁)/(w₁ + w₂) and the Purnell form in N, α and k.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["harris10"],
  related: [
    {
      slug: "rf-value-calculator",
      name: "TLC Rf Analyzer",
      why: "Retention in planar chromatography, measured as Rf.",
    },
  ],
};
