import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Amount concentration vs mass concentration (IUPAC Gold Book); the mole and the mg/mL = g/L prefix cancellation (SI Brochure).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["iupacGoldBook", "bipmSI"],
  related: [
    { slug: "molecular-weight-finder", name: "Molecular Weight Finder", why: "Work out the molecular weight from the formula before converting." },
  ],
  guide: { slug: "dilution-and-concentration", title: "Dilution and Concentration Calculations" },
};
