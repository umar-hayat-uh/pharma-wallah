import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Carr's index and Hausner ratio from bulk and tapped volumes.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["aulton6", "martin8"],
  related: [
    {
      slug: "powder-flowability-calculator",
      name: "Powder Flowability Calculator",
      why: "The same flow indices from bulk and tapped densities.",
    },
    {
      slug: "density-calculator",
      name: "Density Calculator",
      why: "Bulk, tapped and true density with container correction.",
    },
  ],
};
