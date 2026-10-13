import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Beer–Lambert law and least-squares calibration with R² and SE of slope (Harris).
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["harris10"],
  related: [
    { slug: "calibration-curve-calculator", name: "Calibration Curve Calculator", why: "Read an unknown's concentration back off the calibration line." },
  ],
};
