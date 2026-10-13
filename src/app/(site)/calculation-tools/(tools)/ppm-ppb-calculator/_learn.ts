import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Mass concentration and parts-per notation (IUPAC Gold Book); SI prefixes for mg/µg/ng per litre (SI Brochure).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["iupacGoldBook", "bipmSI"],
  guide: { slug: "dilution-and-concentration", title: "Dilution and Concentration Calculations" },
};
