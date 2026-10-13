import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Moles, limiting reagent and theoretical yield (Vogel's practical organic chemistry).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["vogel5"],
  related: [
    { slug: "percentage-yield-calculator", name: "Percentage Yield Calculator", why: "Compare what you actually isolated with this theoretical yield." },
  ],
};
