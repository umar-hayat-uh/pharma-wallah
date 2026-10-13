import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Percentage strength (w/v, w/w, v/v) and ratio strength conversions (Stoklosa & Ansel).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["ansel16"],
  guide: { slug: "dilution-and-concentration", title: "Dilution and Concentration Calculations" },
};
