import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (Linear body-weight scaling of a dose and dose ÷ stock concentration for the volume.)
 * Sources only in this pass: no worked example, mistakes or limitations yet.
 * Each id is a REFERENCES entry in src/lib/content/references.ts.
 */
export const LEARN: CalcEducation = {
  refs: ["ansel16"],
  related: [
    {
      slug: "serial-diluation",
      name: "Serial Dose Calculator",
      why: "Plans the dilution chain when the animal dose is too small to measure from the stock.",
    },
  ],
  guide: { slug: "dose-calculations", title: "Pharmaceutical Dose Calculations: Units, Body Weight and Body Surface Area" },
};
