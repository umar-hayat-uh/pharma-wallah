import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Volume = dose ÷ concentration and % w/v to mg/mL (Stoklosa & Ansel).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["ansel16"],
  related: [
    { slug: "reconstitution-calculator", name: "Reconstitution & IV Compounding Calculator", why: "When the vial is a powder, work out the concentration after reconstitution first." },
  ],
  guide: { slug: "dose-calculations", title: "Pharmaceutical Dose Calculations: Units, Body Weight and Body Surface Area" },
};
