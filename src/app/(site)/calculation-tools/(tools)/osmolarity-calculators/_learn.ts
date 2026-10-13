import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Σ(c × i) osmolarity and mOsmol/L of IV fluids (USP <785>; Stoklosa & Ansel, electrolyte solutions). The TPN rule-of-thumb factors and serum formula are NOT covered by these sources.
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["uspOsmolality", "ansel16"],
  related: [
    { slug: "osmolality-calculators", name: "Osmolality Calculator", why: "Per kilogram of water instead of per litre of solution — what an osmometer measures." },
  ],
};
