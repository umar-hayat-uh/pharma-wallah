import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Cockcroft–Gault creatinine clearance (the CKD-EPI 2021 half is not covered by the registry).)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["cockcroftGault1976"],
  related: [
    {
      slug: "gfr-calculator",
      name: "GFR Calculator",
      why: "eGFR by CKD-EPI 2021 or MDRD, with KDIGO staging — a different quantity from CrCl.",
    },
  ],
};
