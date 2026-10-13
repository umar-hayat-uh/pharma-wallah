import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Sigmoid Emax (Hill) equation.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["rowland5"],
  related: [
    {
      slug: "emax-model-calculator",
      name: "Emax Model Calculator",
      why: "Predicts the effect at a single concentration with the same equation.",
    },
  ],
};
