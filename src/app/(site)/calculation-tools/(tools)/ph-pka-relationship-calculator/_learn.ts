import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Henderson–Hasselbalch, ionised fractions and buffer capacity (Martin, buffered systems; Harris, acid–base equilibria).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["martin8", "harris10"],
  related: [
    { slug: "combined-pka-suite", name: "Combined pKa Suite", why: "Convert Ka to pKa and get % ionised directly at a given pH." },
  ],
};
