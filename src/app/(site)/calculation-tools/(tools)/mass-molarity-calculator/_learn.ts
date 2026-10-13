import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (M = (mass ÷ molar mass) ÷ volume.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["iupacGoldBook", "bipmSI"],
  related: [
    {
      slug: "molarity-calculator",
      name: "Molarity Calculator",
      why: "Also works backwards to the mass needed for a target molarity.",
    },
  ],
  guide: { slug: "dilution-and-concentration", title: "Dilution and Concentration Calculations" },
};
