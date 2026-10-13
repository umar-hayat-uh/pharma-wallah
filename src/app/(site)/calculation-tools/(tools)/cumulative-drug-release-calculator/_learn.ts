import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Calibration line to concentration, then cumulative release corrected for withdrawn samples.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["uspDissolution", "harris10"],
  related: [
    {
      slug: "dissolution-calculator",
      name: "Dissolution Calculator",
      why: "The same absorbance → concentration → % release workflow for a dissolution run.",
    },
    {
      slug: "calibration-curve-calculator",
      name: "Calibration Curve Calculator",
      why: "Fits the least-squares line this calculator reads concentrations from.",
    },
  ],
};
