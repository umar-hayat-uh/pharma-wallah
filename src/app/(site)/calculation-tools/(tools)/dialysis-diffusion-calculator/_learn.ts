import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Calibration line, B = (C₂/C₁)(1 + V₂/V₁), least-squares ln(1 − B) vs t.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["martin8", "harris10"],
  related: [
    {
      slug: "calibration-curve-calculator",
      name: "Calibration Curve Calculator",
      why: "Fits the calibration line that turns absorbance into C₂.",
    },
  ],
};
