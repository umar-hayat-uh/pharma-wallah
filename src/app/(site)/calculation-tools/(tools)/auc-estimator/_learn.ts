import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Linear trapezoidal AUC, extrapolation by Cₙ/kₑ, and AUC = F·Dose/CL.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["gibaldi", "shargel8"],
  related: [
    {
      slug: "bioavailability-calculator",
      name: "Bioavailability Calculator",
      why: "Uses two AUCs to give relative or absolute bioavailability.",
    },
    {
      slug: "clearance-calculator",
      name: "Clearance Calculator",
      why: "Clearance from dose ÷ AUC — the same relationship in reverse.",
    },
  ],
  guide: { slug: "pharmacokinetic-parameters", title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability" },
};
