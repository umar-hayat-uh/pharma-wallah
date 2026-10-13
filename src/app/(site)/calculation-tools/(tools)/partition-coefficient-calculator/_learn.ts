import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Distribution coefficient D = C(organic)/C(aqueous) (Martin, distribution phenomena); concentration from a least-squares calibration line (Harris).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["martin8", "harris10"],
  related: [
    { slug: "ph-pka-relationship-calculator", name: "pH–pKa Calculator (Henderson–Hasselbalch)", why: "The ionised fraction at each pH is what makes log D change along the series." },
  ],
};
