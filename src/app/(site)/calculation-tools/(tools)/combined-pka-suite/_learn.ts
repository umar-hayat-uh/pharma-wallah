import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Ka ↔ pKa, Henderson–Hasselbalch % ionised, and weak-acid pH ≈ ½(pKa − log C).)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["martin8", "harris10"],
  related: [
    {
      slug: "ph-pka-relationship-calculator",
      name: "pH–pKa Calculator (Henderson–Hasselbalch)",
      why: "Solves the Henderson–Hasselbalch equation for pH, pKa or the ratio.",
    },
  ],
};
