import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Mass ↔ volume of a liquid through its density.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["ansel16"],
  related: [
    {
      slug: "mass-conversion-calculator",
      name: "Mass Conversion Calculator",
      why: "Converts the mass into mg, g, kg or other units first.",
    },
  ],
};
