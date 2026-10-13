import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Mass unit conversion through milligrams.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["bipmSI", "ansel16"],
  guide: { slug: "dose-calculations", title: "Pharmaceutical Dose Calculations: Units, Body Weight and Body Surface Area" },
};
