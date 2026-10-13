import type { CalcEducation } from "@/components/calculators";

/**
 * Sources for this calculator (references only — no worked example yet).
 * Beer–Lambert law, ε = A/(bc) (Harris). The A260/A280 ratio and the 50/40 µg/mL nucleic-acid factors are not covered by the registry.
 * Citing a source for the method does not mean this tool has been validated against it.
 */
export const LEARN: CalcEducation = {
  refs: ["harris10"],
  related: [
    { slug: "uv-spectrum-plotter", name: "UV-Vis Spectrum Plotter", why: "Find λmax from a full spectrum before reading a single absorbance." },
  ],
};
