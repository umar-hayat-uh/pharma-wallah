import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Cockcroft–Gault CrCl only (dose-reduction rules and Beers alerts are not covered by the registry).)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["cockcroftGault1976"],
  related: [
    {
      slug: "creatinine-calculator",
      name: "Creatinine Calculator",
      why: "Cockcroft–Gault with actual, ideal and adjusted body weight.",
    },
  ],
};
