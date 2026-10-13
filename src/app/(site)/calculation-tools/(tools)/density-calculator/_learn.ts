import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (True, bulk and tapped density = mass ÷ volume.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["martin8", "aulton6"],
  related: [
    {
      slug: "compressibility-index-calculator",
      name: "Compressibility Index Calculator",
      why: "Carr's index and Hausner ratio from the bulk and tapped volumes.",
    },
    {
      slug: "porosity-calculator",
      name: "Porosity Calculator",
      why: "Porosity from true and bulk density.",
    },
  ],
};
