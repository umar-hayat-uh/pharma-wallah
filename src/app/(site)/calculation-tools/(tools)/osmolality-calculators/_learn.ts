import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Σ(c × i) osmolality and the osmolality/osmolarity distinction (USP <785>; Martin, colligative properties). The serum, urine, plasma and whole-blood clinical formulas are NOT covered by these sources.
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["uspOsmolality", "martin8"],
  related: [
    { slug: "osmolarity-calculators", name: "Osmolarity Calculator", why: "The same particle count per litre of solution rather than per kilogram of water." },
  ],
};
