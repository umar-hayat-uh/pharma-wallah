import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Stepwise dilution, C₁V₁ = C₂V₂ per tube and volume to withdraw (Stoklosa & Ansel). The animal dose itself is not covered.
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["ansel16"],
  related: [
    { slug: "animal-dose", name: "Animal Weight-Based Dose Calculator", why: "Work out the dose the dilution chain has to deliver." },
  ],
  guide: { slug: "dilution-and-concentration", title: "Dilution and Concentration Calculations" },
};
