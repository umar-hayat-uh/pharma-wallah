import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Scaling factor = desired ÷ master quantity, applied to every ingredient.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["ansel16"],
};
