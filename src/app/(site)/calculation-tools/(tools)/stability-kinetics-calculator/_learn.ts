import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Zero/first/second-order degradation and shelf-life terms (Connors; Martin), least-squares fitting and R² (Harris), accelerated conditions and regression of stability data (ICH Q1A(R2), Q1E).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["connors", "martin8", "harris10", "ichQ1AR2", "ichQ1E"],
  guide: { slug: "reaction-kinetics-drug-stability", title: "Zero-, First- and Second-Order Kinetics in Drug Stability" },
};
