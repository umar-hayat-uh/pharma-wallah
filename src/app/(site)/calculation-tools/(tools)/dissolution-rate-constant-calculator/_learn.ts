import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (dC/dt divided by the saturation difference Cs − C (Noyes–Whitney driving force).)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["martin8", "aulton6"],
  related: [
    {
      slug: "dissolution-calculator",
      name: "Dissolution Calculator",
      why: "Builds the corrected concentrations and % release from the same run.",
    },
  ],
};
