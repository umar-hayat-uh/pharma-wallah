import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (mg ↔ mmol ↔ mEq through molecular weight and valence.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["ansel16", "bipmSI"],
};
