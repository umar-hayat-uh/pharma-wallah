import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (USP <905> acceptance value AV = |M − X̄| + k·s.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["uspUniformity"],
};
