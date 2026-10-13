import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (D = exposure time ÷ log₁₀(N₀/N), first-order microbial death.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["aulton6"],
  related: [
    {
      slug: "f-value-calculator",
      name: "F-Value Calculator",
      why: "F = D × log reduction, and F₀ at 121 °C.",
    },
    {
      slug: "log-reduction-calculator",
      name: "Log Reduction Calculator",
      why: "Log reduction and percent kill from before/after counts.",
    },
  ],
};
