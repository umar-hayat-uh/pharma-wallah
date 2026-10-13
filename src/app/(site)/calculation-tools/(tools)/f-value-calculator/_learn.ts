import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (F = D × log reduction and F₀ = F × 10^((T − Tref)/z).)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["aulton6"],
  related: [
    {
      slug: "d-value-calculator",
      name: "D-Value Calculator",
      why: "Measures the D-value this calculation needs.",
    },
    {
      slug: "sterilization-calculator",
      name: "Sterilization Calculator",
      why: "F₀ for a hold at constant temperature.",
    },
  ],
};
