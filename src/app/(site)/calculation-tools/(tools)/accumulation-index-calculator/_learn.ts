import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Accumulation ratio R = 1/(1 − e^(−kτ)) on repeated dosing, with k = 0.693/t½.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["rowland5", "shargel8"],
  related: [
    {
      slug: "drug-half-life-calculator",
      name: "Drug Half-Life Calculator (Multiple Dose)",
      why: "Adds peak, trough and time to steady state for the same dosing interval.",
    },
    {
      slug: "maintenance-dose-calculator",
      name: "Maintenance Dose Calculator",
      why: "Turns a target steady-state concentration into a dose for the interval.",
    },
  ],
  guide: { slug: "pharmacokinetic-parameters", title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability" },
};
