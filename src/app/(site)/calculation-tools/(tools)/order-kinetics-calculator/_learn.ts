import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the First-Order vs Zero-Order Kinetics tool. The worked
 * example uses Compare mode; recomputed independently in Python:
 * 0.693 / 0.15 = 4.62 h, 80 e^(−0.6) = 43.90 mg/L, 80 e^(−1.2) = 24.10 mg/L,
 * 80 / 5 = 16.0 h. The page prints the same figures. The mixed (Michaelis–Menten)
 * curve is kept out of the example: it is a coarse step-by-step estimate.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "the same starting level, two elimination models",
    scenario:
      "Illustrative values. A drug reaches 80 mg/L in plasma at time zero. Compare what happens if it is eliminated by first-order kinetics with kₑ = 0.15 h⁻¹, or by zero-order kinetics at a constant 5 mg/L per hour. Choose Compare and enter C₀ = 80, kₑ = 0.15 and Vmax = 5.",
    given: [
      { label: "Initial concentration C₀", value: "80 mg/L" },
      { label: "First-order rate constant kₑ", value: "0.15 h⁻¹" },
      { label: "Zero-order rate (Vmax)", value: "5 mg/L/h" },
    ],
    steps: [
      {
        label: "First-order half-life t½ = 0.693 / kₑ",
        working: "t½ = 0.693 / 0.15 = 4.62 h",
      },
      {
        label: "First-order concentration C = C₀ · e^(−kₑt)",
        working: "t = 4 h: 80 × e^(−0.6) = 43.90 mg/L\nt = 8 h: 80 × e^(−1.2) = 24.10 mg/L",
      },
      {
        label: "Zero-order concentration C = C₀ − k₀t",
        working: "t = 4 h: 80 − 5 × 4 = 60.00 mg/L\nt = 8 h: 80 − 5 × 8 = 40.00 mg/L",
      },
      {
        label: "Zero-order time to eliminate = C₀ / k₀",
        working: "80 / 5 = 16.0 h",
      },
    ],
    answer: "First-order: t½ = 4.62 h (43.90 mg/L at 4 h). Zero-order: 60.00 mg/L at 4 h, all gone by 16.0 h.",
    interpretation:
      "In the first 4 h the first-order drug loses 36.10 mg/L but the zero-order drug only 20 mg/L, because first-order removes a fixed fraction (high at high concentration) while zero-order removes a fixed amount. Later the order reverses: first-order slows as the level falls, so it never quite reaches zero in this model (2.19 mg/L at 24 h), while the zero-order line hits zero at 16 h. A half-life only exists for the first-order curve.",
  },
  mistakes: [
    "Quoting a half-life for zero-order elimination. Under zero-order kinetics the time to halve the concentration depends on the starting level (t½ = C₀ / 2k₀), so it is not a constant of the drug.",
    "Mixing time units — a kₑ in min⁻¹ entered as if it were h⁻¹ makes the half-life 60 times too short. This tool works in hours throughout.",
    "Using log10 where the equation needs the natural log. C = C₀ · e^(−kt) gives ln C versus t a slope of −k; on a log10 plot the slope is −k / 2.303.",
    "Confusing the units of the two rate constants: first-order k is in time⁻¹, zero-order k₀ in concentration per time (here mg/L/h).",
    "Reading the mixed (Michaelis–Menten) curve as a prediction. Here it is stepped only at the listed sampling times, which can be up to 12 h apart, so it can fall too fast.",
  ],
  limitations: [
    "The model is one compartment after a single dose: no absorption phase, no distribution phase and no further dosing.",
    "The half-life uses 0.693 as an approximation of ln 2 (0.6931…), which is the convention in most pharmacy texts.",
    "The Michaelis–Menten curve uses simple Euler steps between the sampling times shown, so it is a qualitative picture rather than an exact solution.",
    "The same zero-, first- and second-order mathematics describes drug degradation in a product, but stability shelf-life work uses % drug remaining and its own temperature conditions.",
  ],
  refs: ["shargel8", "rowland5", "martin8"],
  related: [
    {
      slug: "stability-kinetics-calculator",
      name: "Drug Stability Kinetics Calculator",
      why: "Decides the order from real stability data by comparing the three linear plots.",
    },
    {
      slug: "accumulation-index-calculator",
      name: "Accumulation Index Calculator",
      why: "Takes a first-order half-life on to repeated dosing.",
    },
  ],
  guide: { slug: "reaction-kinetics-drug-stability", title: "Zero-, First- and Second-Order Kinetics in Drug Stability" },
};
