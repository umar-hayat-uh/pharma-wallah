import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Weight-based (mg/kg) dosing arithmetic: Stoklosa & Ansel. The historical Young's/Clark's/Fried's rules are not claimed as sourced here.
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["ansel16"],
  guide: { slug: "dose-calculations", title: "Pharmaceutical Dose Calculations: Units, Body Weight and Body Surface Area" },
};
