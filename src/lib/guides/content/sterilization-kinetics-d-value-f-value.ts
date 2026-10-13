import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * Sterilization Kinetics: D-Value, z-Value, F₀ and Log Reduction.
 *
 * DRAFT (2026-10-13): not listed, not in the sitemap. Every figure in the
 * examples, tables and practice answers was recomputed with python3 on
 * 2026-10-13. All D-values, temperatures and cycle times are illustrative
 * values for practising the arithmetic; none is a validated cycle. Real
 * sterilization cycles are designed and validated by the manufacturer against
 * the pharmacopoeia and the regulator's requirements. The sterilization
 * standards themselves are not yet in the reference registry — see
 * content/briefs/sterilization-kinetics-d-value-f-value.md.
 *
 * `sterilization-calculator` is deliberately not linked (recorded fault: it
 * labels F₀ ≥ 12 as the 12-log botulinum cycle).
 */
export const guide: Guide = {
  slug: "sterilization-kinetics-d-value-f-value",
  title: "Sterilization Kinetics: D-Value, z-Value, F₀ and Log Reduction",
  description:
    "Log reduction, D-value, z-value, lethal rate and F₀ explained from first-order death kinetics, with worked examples on survivor data and heat profiles.",
  category: "Pharmaceutical Microbiology",

  objectives: [
    "Explain why microbial death by heat is treated as first-order, and what a straight survivor curve on a log scale means.",
    "Calculate a log reduction and percent kill from counts before and after a treatment.",
    "Calculate a D-value from survivor data, and the time needed for a given log reduction.",
    "Calculate a z-value from D-values at two temperatures, and use it to find D at another temperature.",
    "Calculate the lethal rate at a temperature and the F₀ delivered by a hold or by a recorded temperature profile.",
    "Explain sterility assurance level and why sterility is stated as a probability.",
  ],

  intro: [
    "Sterilization is the one process in pharmacy where you can never check the result directly. Testing every unit would destroy the batch, and a sterility test on a sample can only detect gross contamination. Instead, sterility is assured by knowing how fast the process kills microorganisms and running it long enough that survival becomes vanishingly unlikely. The numbers that describe that killing rate are the D-value, the z-value and the F-value.",
    "All three come from one observation: when a population of microorganisms is exposed to a constant lethal condition, the same fraction dies in each equal interval of time. That is first-order kinetics, the same mathematics as drug degradation or radioactive decay, but microbiologists write it in base-10 logarithms rather than natural logarithms. Once you see that, every formula in this guide is a rearrangement of the same straight line.",
    "The organisms, D-values and temperatures in the examples are illustrative values for practising the arithmetic. They are not a design for any real cycle. Real sterilization processes are developed and validated by the manufacturer, with measured resistance data, biological indicators and temperature mapping, against pharmacopoeial and regulatory requirements.",
  ],

  terms: [
    {
      term: "Log reduction",
      definition:
        "How many powers of ten a treatment reduces a population by: log₁₀(N₀ ÷ N). A 1-log reduction kills 90%, a 3-log reduction 99.9%, a 6-log reduction 99.9999%.",
    },
    {
      term: "Survivor curve",
      definition:
        "A plot of log₁₀ of the surviving count against exposure time. Under first-order kinetics it is a straight line falling with time.",
    },
    {
      term: "D-value (decimal reduction time)",
      definition:
        "The exposure time at a stated temperature that reduces the population by one log, i.e. kills 90%. Written with its temperature, e.g. D₁₂₁ = 1.5 min. It is specific to the organism, the temperature and the medium.",
    },
    {
      term: "z-value",
      definition:
        "The temperature change, in °C, that changes the D-value ten-fold. A z-value of 10 °C means raising the temperature by 10 °C makes killing ten times faster.",
    },
    {
      term: "Lethal rate (L)",
      definition:
        "How many minutes at the reference temperature one minute at temperature T is worth: L = 10^((T − T_ref) ÷ z).",
    },
    {
      term: "F-value and F₀",
      definition:
        "The lethality of a process expressed as equivalent minutes at a reference temperature. F₀ is the moist-heat convention: reference 121 °C and z = 10 °C.",
    },
    {
      term: "Bioburden",
      definition:
        "The number of viable microorganisms on or in a product before it is sterilized.",
    },
    {
      term: "Sterility assurance level (SAL)",
      definition:
        "The probability that a single unit is non-sterile after the process. An SAL of 10⁻⁶ means no more than a one-in-a-million chance of a surviving organism in a unit.",
    },
    {
      term: "Biological indicator",
      definition:
        "A carrier holding a known number of resistant spores with a known D-value, placed in a load to show that the process delivered the expected lethality.",
    },
  ],

  sections: [
    {
      id: "first-order-death",
      heading: "First-order death and log reduction",
      blocks: [
        {
          kind: "p",
          text: "Suppose a population of spores is held at a constant lethal temperature, and in the first minute 90% of them die. First-order kinetics says that in the next minute 90% of the survivors die too, and so on. The number killed each minute keeps falling, but the fraction killed stays the same. After one minute 10% remain, after two 1%, after three 0.1%. Each equal time interval removes one more power of ten, which is why the log of the count falls in a straight line.",
        },
        {
          kind: "formula",
          expr: "log₁₀ N = log₁₀ N₀ − t ÷ D      or      N = N₀ × 10^(−t ÷ D)",
          where: [
            { sym: "N₀", meaning: "count before treatment (CFU, or CFU per unit or per carrier)" },
            { sym: "N", meaning: "count surviving after exposure time t, in the same unit" },
            { sym: "t", meaning: "exposure time at constant temperature (min)" },
            { sym: "D", meaning: "D-value at that temperature (min)" },
          ],
          note: "This is the base-10 form of first-order kinetics. The natural-log rate constant is k = 2.303 ÷ D.",
        },
        {
          kind: "formula",
          expr: "Log reduction = log₁₀(N₀ ÷ N)      Percent kill = (1 − N ÷ N₀) × 100%",
          where: [
            { sym: "N₀, N", meaning: "counts before and after, in the same unit and corrected for dilution" },
          ],
        },
        {
          kind: "table",
          caption: "Log reduction and percent kill",
          head: ["Log reduction", "Fraction surviving", "Percent kill"],
          rows: [
            ["1", "1 in 10", "90%"],
            ["2", "1 in 100", "99%"],
            ["3", "1 in 1000", "99.9%"],
            ["4", "1 in 10,000", "99.99%"],
            ["5", "1 in 100,000", "99.999%"],
            ["6", "1 in 1,000,000", "99.9999%"],
          ],
        },
        {
          kind: "p",
          text: "Percentages hide the differences that matter. 99.9% and 99.9999% look almost identical, but the second leaves a thousand times fewer survivors. That is why disinfection and sterilization are always discussed in logs.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Real curves are not always straight",
          text: "Some survivor curves show a \"shoulder\" at the start (little killing at first) or a \"tail\" at the end (a resistant fraction that dies slowly). The single D-value model ignores both, which is one reason real cycles are validated by measurement rather than calculated alone.",
        },
      ],
    },
    {
      id: "d-value",
      heading: "The D-value",
      blocks: [
        {
          kind: "p",
          text: "Rearranging the survivor equation gives the D-value directly from two counts and the time between them. Every D-value only means something together with its temperature and the organism it was measured on: the same spores have a long D-value at 110 °C and a short one at 121 °C.",
        },
        {
          kind: "formula",
          expr: "D = t ÷ (log₁₀ N₀ − log₁₀ N)      t needed = D × (log₁₀ N₀ − log₁₀ N)",
          where: [
            { sym: "D", meaning: "decimal reduction time at the test temperature (min)" },
            { sym: "t", meaning: "exposure time at that temperature (min)" },
            { sym: "N₀, N", meaning: "counts before and after (same unit)" },
          ],
        },
        {
          kind: "example",
          title: "Example 1: D-value from survivor counts",
          problem:
            "A spore suspension containing 1.0 × 10⁶ CFU/mL is held at 121 °C for 6 minutes. The surviving count is 2.5 × 10³ CFU/mL. What is D₁₂₁?",
          steps: [
            "Log reduction = log₁₀(1.0 × 10⁶ ÷ 2.5 × 10³) = log₁₀ 400 = 2.602.",
            "D = t ÷ log reduction = 6 ÷ 2.602 = 2.306 min.",
          ],
          answer: "D₁₂₁ ≈ 2.31 min.",
          note: "In practice D is found from several time points, by fitting a straight line to log₁₀ N against t: D is −1 ÷ slope. Two points are used here only to show the arithmetic.",
        },
        {
          kind: "p",
          text: "Because counts can never be zero on a log scale, very small surviving numbers are treated as probabilities. If a load starts with 100 organisms per unit and the process delivers an 8-log reduction, the expected survivors are 100 × 10⁻⁸ = 10⁻⁶ per unit: on average, one unit in a million carries one survivor. That is the meaning of a sterility assurance level of 10⁻⁶.",
        },
        {
          kind: "formula",
          expr: "Log reduction required = log₁₀ N₀ − log₁₀ SAL      Time required = D × log reduction required",
          where: [
            { sym: "N₀", meaning: "bioburden per unit before sterilization" },
            { sym: "SAL", meaning: "target probability of a non-sterile unit, e.g. 10⁻⁶" },
          ],
        },
        {
          kind: "example",
          title: "Example 2: Time to reach an SAL of 10⁻⁶",
          problem:
            "A product carries a bioburden of 100 CFU per unit. Assume the most resistant organism present has D₁₂₁ = 1.5 min. How long at 121 °C would give an SAL of 10⁻⁶?",
          steps: [
            "Log reduction required = log₁₀ 100 − log₁₀ 10⁻⁶ = 2 − (−6) = 8.",
            "Time = D × 8 = 1.5 × 8 = 12 min.",
            "Check: N = 100 × 10^(−12 ÷ 1.5) = 100 × 10⁻⁸ = 10⁻⁶ per unit.",
          ],
          answer: "12 minutes of lethality at 121 °C (an F₀ of 12 min under these assumptions).",
          note: "Illustrative only. A real cycle's bioburden and resistance data are measured, and the cycle is validated by the manufacturer.",
        },
      ],
    },
    {
      id: "z-value",
      heading: "The z-value: how temperature changes D",
      blocks: [
        {
          kind: "p",
          text: "Plot log₁₀ D against temperature and, over a working range, you get another straight line, falling as the temperature rises. The z-value is the number of degrees needed to move D by a factor of ten. For many bacterial spores in moist heat a z-value of about 10 °C is used, which is the assumption built into F₀.",
        },
        {
          kind: "formula",
          expr: "z = (T₂ − T₁) ÷ (log₁₀ D₁ − log₁₀ D₂)      D at T = D_ref × 10^((T_ref − T) ÷ z)",
          where: [
            { sym: "D₁, D₂", meaning: "D-values (min) measured at temperatures T₁ and T₂ (°C), with T₂ > T₁" },
            { sym: "z", meaning: "°C for a ten-fold change in D" },
            { sym: "D_ref", meaning: "D-value at the reference temperature T_ref" },
          ],
        },
        {
          kind: "example",
          title: "Example 3: z-value from two D-values",
          problem: "A spore preparation has D₁₁₀ = 18 min and D₁₂₁ = 1.6 min. What is its z-value?",
          steps: [
            "T₂ − T₁ = 121 − 110 = 11 °C.",
            "log₁₀ 18 − log₁₀ 1.6 = 1.2553 − 0.2041 = 1.0512.",
            "z = 11 ÷ 1.0512 = 10.46 °C.",
          ],
          answer: "z ≈ 10.5 °C.",
        },
      ],
    },
    {
      id: "f-value",
      heading: "Lethal rate and F₀",
      blocks: [
        {
          kind: "p",
          text: "A real autoclave load does not jump to 121 °C and stay there. It heats up, holds, and cools down, and every minute above about 100 °C contributes some killing. The lethal rate converts each minute at temperature T into the equivalent number of minutes at the reference temperature. Adding those up over the whole cycle gives the F-value. With a reference of 121 °C and z = 10 °C, the result is called F₀.",
        },
        {
          kind: "formula",
          expr: "L = 10^((T − 121) ÷ z)      F₀ = Σ (L × Δt)",
          where: [
            { sym: "L", meaning: "lethal rate: equivalent minutes at 121 °C per minute at T" },
            { sym: "T", meaning: "measured product temperature (°C)" },
            { sym: "z", meaning: "10 °C for F₀" },
            { sym: "Δt", meaning: "interval between temperature readings (min)" },
          ],
          note: "Some texts take the reference as 121.1 °C (250 °F); then L at 121 °C is about 0.975 rather than 1. Use the convention your course or method states.",
        },
        {
          kind: "table",
          caption: "Lethal rates with z = 10 °C and a 121 °C reference",
          head: ["Temperature", "Lethal rate L", "Minutes needed for F₀ = 1 min"],
          rows: [
            ["110 °C", "0.0794", "12.6"],
            ["115 °C", "0.251", "3.98"],
            ["118 °C", "0.501", "2.00"],
            ["121 °C", "1.000", "1.00"],
            ["124 °C", "1.995", "0.501"],
            ["127 °C", "3.98", "0.251"],
          ],
        },
        {
          kind: "example",
          title: "Example 4: A hold at a lower temperature",
          problem: "A load is held at 115 °C for 20 minutes. With z = 10 °C, how much F₀ does the hold deliver?",
          steps: [
            "L = 10^((115 − 121) ÷ 10) = 10^(−0.6) = 0.2512.",
            "F₀ = 0.2512 × 20 = 5.02 min.",
          ],
          answer: "F₀ ≈ 5.0 min: 20 minutes at 115 °C is worth only about 5 minutes at 121 °C.",
        },
        {
          kind: "example",
          title: "Example 5: F₀ from a recorded temperature profile",
          problem:
            "A probe in the coldest part of a load records these temperatures every 2 minutes: 105, 112, 118, 121, 121, 121, 121, 121, 116 and 108 °C. Estimate F₀ (z = 10 °C) by summing L × Δt.",
          steps: [
            "Lethal rates: 105 °C → 0.0251; 112 °C → 0.1259; 118 °C → 0.5012; each 121 °C reading → 1.0000; 116 °C → 0.3162; 108 °C → 0.0501.",
            "Sum of L = 0.0251 + 0.1259 + 0.5012 + 5 × 1.0000 + 0.3162 + 0.0501 = 6.0185.",
            "F₀ = Σ L × Δt = 6.0185 × 2 min = 12.04 min.",
          ],
          answer: "F₀ ≈ 12.0 min.",
          note: "The heat-up and cool-down readings add about 2 minutes of F₀ beyond the five 121 °C readings. Summing rectangles is the simplest method; validated systems integrate the profile from many more readings.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Know which target you are quoting",
          text: "Two different conventions are often confused. The food-canning \"12D\" concept applies 12 D-values of Clostridium botulinum spores, about 12 × 0.21 = 2.52 min at 121 °C. The pharmaceutical \"overkill\" approach is commonly described as a 12-log reduction of a resistant indicator with D₁₂₁ of at least 1 min, i.e. F₀ of at least 12 min. They are not the same target, and neither is a substitute for a validated cycle.",
        },
      ],
    },
    {
      id: "validation",
      heading: "From calculation to a validated cycle",
      blocks: [
        {
          kind: "p",
          text: "The calculations in this guide are the design language of sterilization, not the proof of it. A manufacturer establishes a cycle by measuring the bioburden of the product, identifying resistant organisms, mapping temperatures in the loaded chamber to find the coldest point, challenging the cycle with biological indicators of known D-value and population, and repeating the runs. The sterilizer then records the F₀ actually delivered to each load.",
        },
        {
          kind: "list",
          items: [
            "D and z depend on the organism, the medium it is in, and the type of heat. Values for moist heat do not apply to dry heat, which uses a different reference temperature and z-value.",
            "F₀ is calculated from the product temperature at the slowest-heating point, not the chamber setting.",
            "The single-D model assumes a straight survivor curve. Shoulders and tails are found by measurement.",
            "Pharmacopoeias set out the reference conditions and the expectations for validation; follow them, not a textbook example.",
          ],
        },
      ],
    },
  ],

  mistakes: [
    "Using natural logarithms (ln) where the formula needs log₁₀. A D-value is defined in base-10 logs.",
    "Quoting a D-value without its temperature, or using a D-value measured at one temperature for a hold at another.",
    "Dividing the wrong way round in the z-value: z = ΔT ÷ Δlog D, not Δlog D ÷ ΔT.",
    "Getting the sign of the lethal-rate exponent wrong: temperatures below 121 °C give L less than 1, not more.",
    "Counting only the hold at 121 °C and ignoring the lethality of heat-up and cool-down, or counting the chamber temperature instead of the product temperature.",
    "Confusing F₀ ≥ 12 min (overkill) with the 12D botulinum concept (about 2.52 min).",
    "Putting a zero surviving count into log₁₀(N₀ ÷ N). Use the detection limit and report the reduction as \"greater than\".",
    "Treating a calculated F₀ as proof of sterility. A cycle is sterilizing only when it has been validated.",
  ],

  practice: [
    {
      q: "A suspension of 1 × 10⁶ spores is held at 121 °C for 10 min and 1 × 10² survive. What are the log reduction and D₁₂₁?",
      answer: "4-log reduction; D₁₂₁ = 2.5 min.",
      working: [
        "Log reduction = log₁₀(10⁶ ÷ 10²) = log₁₀ 10⁴ = 4.",
        "D = 10 min ÷ 4 = 2.5 min.",
      ],
    },
    {
      q: "Spores with D₁₂₁ = 0.8 min are present at 10⁵ per unit. How long at 121 °C to reach an SAL of 10⁻⁶?",
      answer: "8.8 min.",
      working: [
        "Log reduction needed = log₁₀ 10⁵ − log₁₀ 10⁻⁶ = 5 − (−6) = 11.",
        "Time = 0.8 × 11 = 8.8 min.",
      ],
    },
    {
      q: "An organism has D₁₁₁ = 20 min and D₁₂₁ = 2.0 min. What is its z-value?",
      answer: "z = 10 °C.",
      working: [
        "ΔT = 121 − 111 = 10 °C.",
        "log₁₀ 20 − log₁₀ 2 = 1.3010 − 0.3010 = 1.",
        "z = 10 ÷ 1 = 10 °C.",
      ],
    },
    {
      q: "D₁₂₁ = 1.5 min and z = 10 °C. What is the D-value at 116 °C?",
      answer: "D₁₁₆ ≈ 4.74 min.",
      working: [
        "D at T = D_ref × 10^((T_ref − T) ÷ z) = 1.5 × 10^((121 − 116) ÷ 10).",
        "10^0.5 = 3.162, so D₁₁₆ = 1.5 × 3.162 = 4.743 min.",
      ],
    },
    {
      q: "A load is held at 115 °C for 30 min. With z = 10 °C, what F₀ does the hold deliver?",
      answer: "F₀ ≈ 7.54 min.",
      working: [
        "L = 10^((115 − 121) ÷ 10) = 10^(−0.6) = 0.2512.",
        "F₀ = 0.2512 × 30 = 7.536 min.",
      ],
    },
    {
      q: "A disinfectant test starts with 3.2 × 10⁶ CFU and 45 CFU survive. What are the log reduction and the percent kill?",
      answer: "Log reduction 4.85; percent kill 99.9986%.",
      working: [
        "N₀ ÷ N = 3.2 × 10⁶ ÷ 45 = 71,111.",
        "Log reduction = log₁₀ 71,111 = 4.85.",
        "Percent kill = (1 − 45 ÷ 3,200,000) × 100 = 99.9986%.",
      ],
    },
    {
      q: "A biological indicator carries 10⁶ spores with D₁₂₁ = 1.8 min. How many minutes at 121 °C reduce it to a probability of 10⁻⁶ survivors (a 12-log reduction)?",
      answer: "21.6 min.",
      working: [
        "Log reduction = log₁₀ 10⁶ − log₁₀ 10⁻⁶ = 12.",
        "Time = 1.8 × 12 = 21.6 min.",
      ],
    },
    {
      q: "Product temperatures are recorded every minute: 118, 121, 121 and 119 °C. Estimate F₀ (z = 10 °C) by summing L × Δt.",
      answer: "F₀ ≈ 3.13 min.",
      working: [
        "L(118) = 10^(−0.3) = 0.5012; L(121) = 1; L(119) = 10^(−0.2) = 0.6310.",
        "Σ L = 0.5012 + 1 + 1 + 0.6310 = 3.1321.",
        "F₀ = 3.1321 × 1 min = 3.13 min.",
      ],
    },
  ],

  limitations: [
    "The single-D, constant-z model is an idealisation. Real survivor curves can have shoulders and tails, and z is only approximately constant over a limited temperature range.",
    "D- and z-values depend on the organism, its growth history and the medium or surface it is in. The values in this guide are illustrative, not data for any product.",
    "F₀ applies to moist heat with a 121 °C reference and z = 10 °C. Dry heat, gas and radiation sterilization use different reference conditions and measures.",
    "Sterilization cycles must be developed and validated by the manufacturer under the applicable pharmacopoeia and regulations. Nothing in this guide is a cycle that may be used on a product.",
  ],

  refs: ["aulton6", "martin8", "iupacGoldBook"],

  relatedTools: [
    {
      slug: "d-value-calculator",
      name: "D-Value Calculator",
      why: "Computes D = t ÷ log₁₀(N₀ ÷ N) from a starting count, a surviving count and the exposure time, as in Example 1.",
    },
    {
      slug: "f-value-calculator",
      name: "F-Value Calculator",
      why: "Multiplies D (at the process temperature) by the log reduction and converts it to F₀ with 10^((T − 121) ÷ z), as in the lethal-rate section. Its lethal-rate table uses the 121.1 °C reference, so it shows 0.975 at 121 °C.",
    },
    {
      slug: "log-reduction-calculator",
      name: "Log Reduction Calculator",
      why: "Gives log₁₀(N₀ ÷ N) and percent kill, as in the first section. Use it for the arithmetic only: its \"meets sterilization criteria\" band is not a sterility standard.",
    },
  ],

  relatedGuides: ["microbial-counts-cfu-and-serial-dilution", "reaction-kinetics-drug-stability"],

  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
