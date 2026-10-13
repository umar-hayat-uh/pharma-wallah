import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Reconstitution with powder displacement, dose volume and infusion rate (Stoklosa & Ansel).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["ansel16"],
  related: [
    { slug: "sterile-dose-volume", name: "Sterile Dose Volume Calculator", why: "Once the vial is made up, the volume to draw for a single dose." },
  ],
  guide: { slug: "dose-calculations", title: "Pharmaceutical Dose Calculations: Units, Body Weight and Body Surface Area" },
};
