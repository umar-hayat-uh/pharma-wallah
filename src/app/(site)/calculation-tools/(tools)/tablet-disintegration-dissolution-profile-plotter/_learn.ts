import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * USP <711> Q-based acceptance; f₂ similarity (Moore & Flanner 1996; FDA 1997 IR dissolution guidance).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["uspDissolution", "fdaDissolution1997", "mooreFlanner1996"],
  related: [
    { slug: "dissolution-calculator", name: "Dissolution Calculator", why: "Turn absorbance readings into the % dissolved values this plotter needs." },
  ],
};
