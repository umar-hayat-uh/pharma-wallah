import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Test/reference ratio of AUC and Cmax against the 80–125% acceptance limits.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["shargel8"],
  related: [
    {
      slug: "auc-estimator",
      name: "AUC Estimator",
      why: "Calculates the AUC values a bioequivalence comparison starts from.",
    },
    {
      slug: "bioavailability-calculator",
      name: "Bioavailability Calculator",
      why: "Relative bioavailability from the same test and reference AUCs.",
    },
  ],
};
