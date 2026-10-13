import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the Porosity Calculator. Both examples were traced
 * through the page's own code path — interpret((1 − ρbulk/ρtrue) × 100) for the
 * density method and interpret(((Vt − Vs)/Vt) × 100) for the volume method,
 * printed with fixed(…, 2) for porosity and fixed(…, 4) for the fractions — and
 * recomputed independently in Python:
 *   density 1.48 / 0.68 → 54.05 %, void 0.5405, solid 0.4595 (High Porosity)
 *   volume 0.283 / 0.240 → 15.19 %, void 0.1519, solid 0.8481 (Low Porosity)
 * Neither lands in the < 10 % band, whose "Non-porous" label is a recorded fault.
 * Martin (micromeritics) and Aulton (powders, compaction) cover the method;
 * citing them does not mean this tool has been validated against them.
 */
export const LEARN: CalcEducation = {
  whenToUse: [
    "A micromeritics practical gives you the helium-pycnometer (true) density of a powder and its poured bulk density, and asks for the porosity of the powder bed.",
    "You have measured a tablet's diameter and thickness, weighed it, and want its porosity to explain why it disintegrates faster or slower than another batch.",
    "Comparing granules before and after a change in granulation or compression force, where a drop in porosity points to a denser, harder product.",
    "Checking a reported porosity in a lab record: entering the two densities or volumes shows whether the stated figure follows from them.",
  ],
  workedExample: {
    title: "porosity of a granule bed from its densities",
    scenario:
      "Granules prepared for tableting have a true density of 1.48 g/mL (helium pycnometer). A weighed sample poured gently into a measuring cylinder gives a bulk density of 0.68 g/mL. What is the porosity of the bed? (Illustrative values for a practical.)",
    given: [
      { label: "True density, ρ_true", value: "1.48 g/mL" },
      { label: "Bulk density, ρ_bulk", value: "0.68 g/mL" },
      { label: "Calculator mode", value: "Density Method" },
    ],
    steps: [
      { label: "Write the equation", working: "ε = (1 − ρ_bulk ÷ ρ_true) × 100%" },
      { label: "Ratio of the densities (the solid fraction)", working: "0.68 ÷ 1.48 = 0.4595" },
      { label: "Porosity", working: "ε = (1 − 0.4595) × 100 = 54.05 %" },
      { label: "Void and solid fractions", working: "Void fraction = 54.05 ÷ 100 = 0.5405\nSolid fraction = 1 − 0.5405 = 0.4595" },
    ],
    answer: "Porosity ε = 54.05 % (void fraction 0.5405, solid fraction 0.4595).",
    interpretation:
      "The calculator prints 54.05 % and classes it as High Porosity. Just over half of the bed's volume is air — mostly the spaces between granules, because a poured bulk density counts those voids. Tapping the cylinder would raise the bulk density and lower this figure, so always state which bulk density you used.",
  },
  extraExample: {
    title: "porosity of a compressed tablet from its volumes",
    scenario:
      "A flat-faced tablet measures 10.0 mm in diameter and 3.60 mm thick, weighs 0.360 g, and is made from a blend with a true density of 1.50 g/cm³. What is its porosity? (Illustrative values for a practical.)",
    given: [
      { label: "Total (bulk) volume, V_total", value: "π × 0.50² × 0.360 cm³ = 0.2827 → entered as 0.283 mL" },
      { label: "Solid volume, V_solid", value: "0.360 g ÷ 1.50 g/cm³ = 0.240 mL" },
      { label: "Calculator mode", value: "Volume Method" },
    ],
    steps: [
      { label: "Tablet volume from its dimensions (1 cm³ = 1 mL)", working: "V_total = π r² h = π × (0.50 cm)² × 0.360 cm = 0.2827 cm³ ≈ 0.283 mL" },
      { label: "Volume of the solid alone", working: "V_solid = mass ÷ true density = 0.360 ÷ 1.50 = 0.240 mL" },
      { label: "Write the equation", working: "ε = (V_total − V_solid) ÷ V_total × 100%" },
      { label: "Substitute", working: "ε = (0.283 − 0.240) ÷ 0.283 × 100 = 0.043 ÷ 0.283 × 100 = 15.19 %" },
      { label: "Void and solid fractions", working: "Void fraction = 0.1519\nSolid fraction = 1 − 0.1519 = 0.8481" },
    ],
    answer: "Porosity ε = 15.19 % (void fraction 0.1519, solid fraction 0.8481).",
    interpretation:
      "The calculator prints 15.19 % and classes it as Low Porosity, a typical range for a compressed tablet. Rounding V_total to 0.283 mL matters: with the unrounded 0.2827 mL the porosity is 15.12 %, so carry enough figures from your measurements. A solid fraction of 0.85 is also called the tablet's relative density.",
  },
  refs: ["martin8", "aulton6"],
  related: [
    { slug: "density-calculator", name: "Density Calculator", why: "Work out the true or bulk density from a mass and a volume before entering them here." },
    { slug: "powder-flowability-calculator", name: "Powder Flowability Calculator", why: "Use the same bulk density with the tapped density to judge how the powder flows." },
  ],
};
