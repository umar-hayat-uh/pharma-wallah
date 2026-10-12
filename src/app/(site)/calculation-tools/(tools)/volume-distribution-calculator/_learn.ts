import type { CalcEducation } from "@/components/calculators";

/**
 * Teaching content for the volume of distribution calculator. The worked
 * example includes the back-extrapolation to C₀ from two post-distribution
 * samples, because the page asks for C₀ but cannot measure it. Figures match
 * what the page prints for Dose 500, C₀ 12.5, weight 64 (Vd to 2 dp, L/kg to
 * 3 dp) and were recomputed in Python. The page's drug presets are not used:
 * most do not reproduce the Vd printed beside them.
 */
export const LEARN: CalcEducation = {
  workedExample: {
    title: "Vd from an IV bolus, with C₀ found by back-extrapolation",
    scenario:
      "A 64 kg volunteer in a teaching study receives 500 mg of Drug X as an IV bolus. Plasma levels are 10.0 mg/L at 2 h and 6.4 mg/L at 6 h, both on the log-linear elimination phase. Find C₀, then the volume of distribution in L and L/kg.",
    given: [
      { label: "Dose (IV bolus)", value: "500 mg" },
      { label: "C at 2 h", value: "10.0 mg/L" },
      { label: "C at 6 h", value: "6.4 mg/L" },
      { label: "Body weight", value: "64 kg" },
    ],
    steps: [
      { label: "Elimination rate constant", working: "kₑ = ln(C₁ ÷ C₂) ÷ (t₂ − t₁) = ln(10.0 ÷ 6.4) ÷ 4 h = 0.1116 h⁻¹" },
      { label: "Back-extrapolate to t = 0", working: "C₀ = C₁ × e^(kₑ·t₁) = C₁ × (C₁ ÷ C₂)^(t₁ ÷ (t₂ − t₁)) = 10.0 × 1.5625^0.5 = 12.5 mg/L" },
      { label: "Volume of distribution", working: "Vd = Dose ÷ C₀ = 500 mg ÷ 12.5 mg/L = 40.00 L" },
      { label: "Per kilogram", working: "Vd = 40.00 L ÷ 64 kg = 0.625 L/kg" },
    ],
    answer: "Vd = 40.00 L (0.625 L/kg) — the calculator's 'Total Body Water' band.",
    interpretation:
      "To give 12.5 mg/L, the 500 mg behaves as if it were dissolved in 40 L — close to total body water for a 64 kg adult (about 0.6 L/kg). It also gives the loading dose for a target level: 40 L × 15 mg/L = 600 mg. It does not say where the drug actually is: Vd is an apparent volume, and a value like this is equally consistent with a drug spread through body water or one partly bound in tissue and partly in plasma. Illustrative values for an educational calculation.",
  },
  mistakes: [
    "Using a level drawn some time after the dose as C₀. Concentration has already fallen, so Dose ÷ C overestimates Vd; back-extrapolate the log-linear line to t = 0.",
    "Mixing units: a level reported in µg/L or ng/mL must be converted to mg/L first (1 ng/mL = 0.001 mg/L), or Vd is out by a factor of 1000.",
    "Using an oral dose. After oral dosing only the fraction F reaches the circulation and absorption overlaps distribution, so Dose ÷ C₀ is not Vd.",
    "Extrapolating from samples taken during the distribution phase. Early points of a two-compartment drug lie above the elimination line and give a C₀ that is too high and a Vd that is too small.",
    "Leaving body weight blank for a real patient. The L/kg figure then uses the 70 kg default, and the band can change.",
    "Reading Vd as a physical place. A Vd of 500 L does not mean the patient holds 500 L; it means the drug is held outside plasma.",
  ],
  limitations: [
    "Assumes a one-compartment model with instantaneous distribution; for multi-compartment drugs Dose ÷ C₀ gives the initial (central) volume, not Vss or Varea.",
    "Assumes linear pharmacokinetics and an IV bolus with complete availability.",
    "Vd changes with oedema, ascites, obesity, pregnancy, age and protein binding; a population figure may not fit an individual.",
    "The distribution bands are broad teaching categories, not drug-specific or diagnostic ranges.",
  ],
  refs: ["shargel8", "rowland5"],
  related: [
    {
      slug: "ke-calculator",
      name: "Ke Calculator",
      why: "Combine this Vd with clearance to get kₑ = CL ÷ Vd, or go from dose and C₀ straight to kₑ.",
    },
    {
      slug: "vancomycin-auc-calculator",
      name: "Vancomycin AUC Calculator",
      why: "See Vd used in dosing: it assumes a population 0.7 L/kg rather than measuring it.",
    },
  ],
  guide: {
    slug: "pharmacokinetic-parameters",
    title: "Pharmacokinetic Parameters: AUC, Clearance, Half-Life and Bioavailability",
  },
};
