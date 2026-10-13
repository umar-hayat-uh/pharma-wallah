import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (kₑ = 0.693/t½, accumulation, peak/trough and time to steady state on multiple dosing.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["rowland5", "shargel8"],
  related: [
    {
      slug: "half-life-calculator",
      name: "Half-Life Calculator",
      why: "t½ from kₑ, from CL and Vd, or from two concentrations.",
    },
    {
      slug: "accumulation-index-calculator",
      name: "Accumulation Index Calculator",
      why: "The accumulation ratio on its own, with its interpretation bands.",
    },
  ],
  guide: { slug: "pharmacokinetic-parameters", title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability" },
};
