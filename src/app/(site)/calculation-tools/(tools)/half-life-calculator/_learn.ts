import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (t½ = 0.693/kₑ, kₑ = CL/Vd, and kₑ from two concentrations.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["shargel8", "rowland5"],
  related: [
    {
      slug: "accumulation-index-calculator",
      name: "Accumulation Index Calculator",
      why: "What the half-life means for accumulation on repeated dosing.",
    },
  ],
  guide: { slug: "pharmacokinetic-parameters", title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability" },
};
