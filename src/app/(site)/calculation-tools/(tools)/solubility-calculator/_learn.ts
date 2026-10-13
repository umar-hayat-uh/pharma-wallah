import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Normality and gram equivalent weight (Beckett & Stenlake). Cited for the concept only — the page's own S = N × G.W ÷ 10 scaling is a recorded fault.
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["beckettStenlake1"],
  related: [
    { slug: "normality-calculator", name: "Normality Calculator", why: "Get normality and equivalent weight from a weighed amount first." },
  ],
};
