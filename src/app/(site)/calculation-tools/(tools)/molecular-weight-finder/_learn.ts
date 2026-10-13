import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Molar mass as the sum of atomic weights (IUPAC Gold Book); the mole and g/mol (SI Brochure).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["iupacGoldBook", "bipmSI"],
  related: [
    { slug: "mg-ml-to-molarity-calculator", name: "mg/mL ↔ Molarity Calculator", why: "Use the molecular weight to turn a mass concentration into molarity." },
  ],
};
