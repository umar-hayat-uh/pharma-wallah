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
      slug: "dose-response-curve-generator",
      name: "Dose–Response Curve Generator",
      why: "Plots and compares several Emax curves on linear and log axes.",
    },
  ],
};
