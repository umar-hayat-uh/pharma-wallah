import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Carr's index and Hausner ratio from bulk and tapped density (Aulton, powder flow; Martin, micromeritics).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["aulton6", "martin8"],
  related: [
    { slug: "porosity-calculator", name: "Porosity Calculator", why: "Combine the same bulk density with the true density to get the bed porosity." },
  ],
};
