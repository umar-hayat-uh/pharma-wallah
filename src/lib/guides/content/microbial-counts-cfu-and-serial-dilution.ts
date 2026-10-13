import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * Counting Microbes: CFU/mL, Plate Counts and Serial Dilution.
 *
 * DRAFT (2026-10-13): not listed, not in the sitemap. Every figure in the
 * examples, tables and practice answers was recomputed with python3 on
 * 2026-10-13 before it was written here. Counts are illustrative; they are not
 * acceptance limits for any product. The 30–300 counting range is presented as
 * a common practical range, not a rule — a reviewer should attach the
 * laboratory standard the course follows (see content/briefs/).
 */
export const guide: Guide = {
  slug: "microbial-counts-cfu-and-serial-dilution",
  title: "Counting Microbes: CFU/mL, Plate Counts and Serial Dilution",
  description:
    "How to plan a ten-fold serial dilution, choose a countable plate and turn a colony count into CFU/mL or CFU/g, with worked examples and practice.",
  category: "Pharmaceutical Microbiology",

  objectives: [
    "Explain what a colony-forming unit is and why a plate count estimates viable organisms rather than total cells.",
    "Plan a ten-fold serial dilution and state the dilution of the sample in every tube and on every plate.",
    "Calculate CFU/mL or CFU/g from a colony count, the dilution and the volume plated.",
    "Choose which plates to count, average replicate plates, and report a result when no colonies grow.",
    "Express counts in scientific notation and as log₁₀ values, and recognise when a count is too low or too high to trust.",
  ],

  intro: [
    "A microbiology practical rarely asks you to count bacteria directly. A culture or a contaminated sample may hold millions of organisms in every millilitre, far too many to see or count. Instead you dilute the sample by known amounts, spread a known volume of a dilution on agar, incubate, and count the colonies that grow. Each colony is assumed to have started from one viable unit, so the count, scaled back up by the dilution and the volume, estimates how many viable units were in the original sample.",
    "The scaling is simple multiplication and division, but it is easy to lose track of. Students mix up the dilution in a tube with the dilution on the plate, forget that 0.1 mL was plated rather than 1 mL, or count a plate that holds too few colonies to mean anything. This guide sets out the bookkeeping step by step: what a CFU is, how to plan a serial dilution, the CFU formula, which plates to count, and how to report the answer.",
    "The counts in the examples are illustrative values chosen for practising the arithmetic. They are not microbial limits for any product. Real limits and methods come from the pharmacopoeia and from your laboratory's own procedures.",
  ],

  terms: [
    {
      term: "Colony-forming unit (CFU)",
      definition:
        "Whatever gave rise to one visible colony: a single cell, a pair, a chain or a clump. Because clumps count as one, a plate count estimates viable units, not individual cells.",
    },
    {
      term: "Viable count",
      definition:
        "A count of organisms able to grow and form colonies under the test conditions. Dead cells, and living cells that cannot grow on that medium or at that temperature, are not counted.",
    },
    {
      term: "Dilution (as a fraction)",
      definition:
        "The fraction of the original sample present in a liquid: 10⁻³ means one-thousandth of the original concentration. A smaller fraction is a more dilute liquid.",
    },
    {
      term: "Dilution factor",
      definition:
        "The reciprocal of the dilution: a 10⁻³ dilution has a dilution factor of 1000. Multiplying by the dilution factor is the same as dividing by the dilution fraction.",
    },
    {
      term: "Serial dilution",
      definition:
        "A series of dilutions in which each tube is made from the one before it. Ten-fold steps (1 mL into 9 mL, or 0.1 mL into 0.9 mL) are the usual choice for plate counts.",
    },
    {
      term: "Volume plated",
      definition:
        "The volume of a dilution spread on or poured with the agar, usually 0.1 mL for a spread plate and 1 mL for a pour plate.",
    },
    {
      term: "Countable range",
      definition:
        "The band of colony numbers per plate that is counted reliably. A commonly used practical range is about 30 to 300 colonies on a standard Petri dish; your laboratory procedure sets the range it uses.",
    },
    {
      term: "TNTC and limit of detection",
      definition:
        "TNTC means too numerous to count. The limit of detection is the smallest count the method can report: the CFU/mL that a single colony on the plate would represent.",
    },
  ],

  sections: [
    {
      id: "what-a-cfu-is",
      heading: "What a plate count actually measures",
      blocks: [
        {
          kind: "p",
          text: "When a viable organism lands on a nutrient agar surface and is incubated, it divides repeatedly until the pile of cells is large enough to see: a colony. If the organisms are well separated, each colony marks one place where growth started. Counting colonies therefore counts the starting points, and those starting points are called colony-forming units.",
        },
        {
          kind: "p",
          text: "Two consequences follow. First, a plate count is always an estimate of viable units, never of every cell present. Two cells stuck together form one colony; a cell that is alive but cannot grow on the chosen medium forms none. Second, the count only makes sense if the colonies are separate. On a crowded plate colonies merge, compete for nutrients and hide each other, so the count comes out too low. On a nearly empty plate, chance dominates: a plate expected to hold 5 colonies might easily show 2 or 9. That is why plates are diluted into a countable range before they are counted.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Write CFU, not cells",
          text: "Report results as CFU/mL (for liquids) or CFU/g (for solids), never as cells/mL. The unit reminds the reader that clumps, chains and non-growing cells were not counted individually.",
        },
      ],
    },
    {
      id: "planning-the-dilution",
      heading: "Planning a ten-fold serial dilution",
      blocks: [
        {
          kind: "p",
          text: "A dense culture might hold around 10⁷ to 10⁹ CFU/mL. To bring that down to a few hundred colonies on a plate you need a total dilution in the region of 10⁻⁵ to 10⁻⁷, which cannot be made accurately in one step. A serial dilution reaches it in small, measurable steps. The usual step is ten-fold: 1 mL of the previous tube into 9 mL of sterile diluent (or 0.1 mL into 0.9 mL), mixed well before the next transfer.",
        },
        {
          kind: "formula",
          expr: "Dilution in tube n = (dilution of one step)ⁿ      Dilution on the plate = dilution in the tube × volume plated (mL)",
          where: [
            { sym: "one step", meaning: "volume transferred ÷ (volume transferred + volume of diluent); 1 mL into 9 mL gives 1/10 = 10⁻¹" },
            { sym: "n", meaning: "number of equal steps from the original sample" },
            { sym: "volume plated", meaning: "mL of that tube put on the plate" },
          ],
          note: "The second line is only a bookkeeping shortcut: plating 0.1 mL of a 10⁻⁵ tube puts the same amount of sample on the plate as plating 1 mL of a 10⁻⁶ tube.",
        },
        {
          kind: "table",
          caption: "A six-tube ten-fold series, plating 0.1 mL from each tube, for a culture of about 2 × 10⁷ CFU/mL",
          head: ["Tube", "Dilution in tube", "Sample on the plate (0.1 mL)", "Expected colonies"],
          rows: [
            ["1", "10⁻¹", "10⁻² mL", "about 200,000 (TNTC)"],
            ["2", "10⁻²", "10⁻³ mL", "about 20,000 (TNTC)"],
            ["3", "10⁻³", "10⁻⁴ mL", "about 2000 (TNTC)"],
            ["4", "10⁻⁴", "10⁻⁵ mL", "about 200 (countable)"],
            ["5", "10⁻⁵", "10⁻⁶ mL", "about 20 (too few)"],
            ["6", "10⁻⁶", "10⁻⁷ mL", "about 2 (too few)"],
          ],
        },
        {
          kind: "p",
          text: "The table shows why a series is plated rather than a single tube: only one tube lands in the countable range, and you rarely know in advance which one it will be. Plating several consecutive dilutions, usually in duplicate, makes sure at least one plate is countable.",
        },
        {
          kind: "example",
          title: "Example 1: Planning the series",
          problem:
            "You suspect a culture contains about 5 × 10⁶ CFU/mL and want roughly 50 colonies on a spread plate of 0.1 mL. Which tube of a ten-fold series should you plate from?",
          steps: [
            "Colonies expected = CFU/mL × dilution in tube × volume plated.",
            "50 = 5 × 10⁶ × d × 0.1, so d = 50 ÷ (5 × 10⁶ × 0.1) = 1 × 10⁻⁴.",
            "That is tube 4 of a ten-fold series (10⁻⁴). Plate tubes 3, 4 and 5 as well, in case the estimate is wrong.",
          ],
          answer: "Plate the 10⁻⁴ tube, with the 10⁻³ and 10⁻⁵ tubes either side.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Errors carry down the series",
          text: "Each tube inherits any error in the tubes before it. Mix every tube thoroughly before the next transfer, use a fresh sterile pipette or tip each time, and work quickly enough that organisms do not settle or start to grow in the diluent.",
        },
      ],
    },
    {
      id: "cfu-formula",
      heading: "From colonies to CFU/mL",
      blocks: [
        {
          kind: "p",
          text: "Once the plates are incubated and counted, the count is scaled back up to the original sample. Dividing by the dilution undoes the dilution; dividing by the volume plated turns \"colonies in 0.1 mL\" into \"colonies per mL\".",
        },
        {
          kind: "formula",
          expr: "CFU/mL = colonies counted ÷ (dilution of the tube plated × volume plated in mL)",
          where: [
            { sym: "colonies counted", meaning: "colonies on the plate, or the mean of replicate plates of the same dilution" },
            { sym: "dilution", meaning: "the fraction of original sample in the tube plated, e.g. 10⁻⁴ = 0.0001" },
            { sym: "volume plated", meaning: "mL of that tube put on the plate" },
          ],
          note: "Written with a dilution factor instead: CFU/mL = colonies × dilution factor ÷ volume plated. The two forms give the same answer.",
        },
        {
          kind: "example",
          title: "Example 2: A spread plate",
          problem:
            "0.1 mL of the 10⁻⁴ dilution of a culture is spread on nutrient agar. After incubation the plate has 156 colonies. What is the viable count of the culture?",
          steps: [
            "Dilution × volume plated = 10⁻⁴ × 0.1 mL = 10⁻⁵ mL of original culture on the plate.",
            "CFU/mL = 156 ÷ 10⁻⁵ = 15,600,000 CFU/mL.",
            "In scientific notation: 1.56 × 10⁷ CFU/mL; as a log value, log₁₀(1.56 × 10⁷) = 7.19.",
          ],
          answer: "1.56 × 10⁷ CFU/mL (log₁₀ 7.19).",
        },
        {
          kind: "example",
          title: "Example 3: Replicate pour plates",
          problem:
            "1 mL of the 10⁻⁵ dilution is pour-plated in duplicate, giving 212 and 236 colonies. The 10⁻⁶ plates show 25 and 19 colonies. Report the count.",
          steps: [
            "The 10⁻⁶ plates are below the countable range, so use the 10⁻⁵ pair.",
            "Mean count = (212 + 236) ÷ 2 = 224 colonies.",
            "CFU/mL = 224 ÷ (10⁻⁵ × 1 mL) = 22,400,000 CFU/mL.",
          ],
          answer: "2.24 × 10⁷ CFU/mL.",
          note: "Check that the plates agree with the dilution: the 10⁻⁶ plates, about ten times fewer, are what the 10⁻⁵ result predicts. When two dilutions are both in range, follow the averaging rule in your laboratory procedure.",
        },
      ],
    },
    {
      id: "solids-and-zero-counts",
      heading: "Solid samples, low counts and zero counts",
      blocks: [
        {
          kind: "p",
          text: "Tablets, powders and creams cannot be pipetted, so the first step is to disperse a weighed amount in a measured volume of diluent. Weighing 10 g of sample into 90 mL of diluent gives a 1 in 10 suspension: each mL contains the organisms from 0.1 g of sample, so the suspension is the 10⁻¹ dilution of the solid. From there the series continues exactly as for a liquid, and the answer is in CFU/g.",
        },
        {
          kind: "example",
          title: "Example 4: CFU per gram of a powder",
          problem:
            "10 g of a powder is dispersed in 90 mL of diluent (10⁻¹). 1 mL of that is added to 9 mL of diluent (10⁻²), and 1 mL of the 10⁻² tube is pour-plated, giving 47 colonies. What is the count per gram?",
          steps: [
            "10 g of sample in 10 + 90 = 100 parts of suspension: 10 ÷ 100 = 0.1, so the first suspension is 10⁻¹.",
            "The second tube is 10⁻¹ × 10⁻¹ = 10⁻².",
            "CFU/g = 47 ÷ (10⁻² × 1 mL) = 4700 CFU/g.",
          ],
          answer: "4.7 × 10³ CFU/g.",
          note: "The 1 in 10 step assumes the 10 g and 90 mL together behave as 100 mL of suspension, the usual convention for this preparation. 47 colonies is above the 30-colony mark, but close to it, so the result carries more chance error than a plate of 150.",
        },
        {
          kind: "p",
          text: "A plate with no colonies does not mean the sample contained no organisms; it means fewer than the method could detect. The limit of detection is what one colony would have meant. If 1 mL of undiluted sample gives no colonies, one colony would have been 1 ÷ (1 × 1 mL) = 1 CFU/mL, so the result is reported as less than 1 CFU/mL. If the lowest dilution plated was 10⁻¹ (1 mL), the result is less than 10 CFU/mL, or less than 10 CFU/g for a 1 in 10 solid suspension.",
        },
        {
          kind: "example",
          title: "Example 5: Reporting a zero count",
          problem:
            "1 mL of an undiluted oral liquid is pour-plated in duplicate. Neither plate grows any colonies. How is the result reported?",
          steps: [
            "Zero cannot be multiplied up into a count, so work out what one colony would represent.",
            "One colony ÷ (dilution 1 × 1 mL) = 1 CFU/mL.",
            "Report the result as below that limit.",
          ],
          answer: "Less than 1 CFU/mL (no colonies detected).",
        },
        {
          kind: "list",
          items: [
            "Too many colonies (TNTC or confluent growth): do not estimate a number. Use a more dilute plate.",
            "Too few colonies (below the lower end of the range): the result is uncertain. Use a less dilute plate if one is available; if not, report the count with a note that it is outside the counting range.",
            "Spreaders (a colony that spreads across the plate) and contaminated plates are recorded and excluded according to the laboratory procedure, not quietly counted.",
          ],
        },
      ],
    },
    {
      id: "reporting",
      heading: "Reporting: scientific notation, significant figures and logs",
      blocks: [
        {
          kind: "p",
          text: "Plate counts carry a lot of natural variation, so it is misleading to report every digit a calculator gives. A count of 156 colonies does not justify an answer of 15,600,000 CFU/mL written in full, as if the last zeros were known. Write it in scientific notation with two or three significant figures: 1.56 × 10⁷ CFU/mL, or 1.6 × 10⁷ if your procedure rounds to two.",
        },
        {
          kind: "p",
          text: "Microbiologists also report counts as log₁₀ values because counts span many orders of magnitude. 1.56 × 10⁷ CFU/mL is log₁₀ 7.19. Logs make comparisons easy: a change from log 7.19 to log 4.19 is a fall of exactly 3 logs, a thousand-fold reduction. This is the same scale used for log reduction and D-values in sterilization (see the sterilization kinetics guide).",
        },
        {
          kind: "table",
          caption: "One count written several ways",
          head: ["Written as", "Value"],
          rows: [
            ["Plain number", "15,600,000 CFU/mL"],
            ["Scientific notation (3 s.f.)", "1.56 × 10⁷ CFU/mL"],
            ["Scientific notation (2 s.f.)", "1.6 × 10⁷ CFU/mL"],
            ["log₁₀ value", "7.19"],
          ],
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Methods and limits come from the pharmacopoeia",
          text: "Microbial enumeration of pharmaceutical products follows an official, validated method, with its own media, incubation conditions, counting rules and acceptance criteria. This guide teaches the arithmetic behind a plate count. It does not replace the official method or your laboratory's procedure.",
        },
      ],
    },
  ],

  mistakes: [
    "Dividing by the dilution of the tube but forgetting the volume plated, which makes a 0.1 mL spread plate ten times too low.",
    "Confusing the dilution fraction with the dilution factor: dividing by 10⁴ when you should divide by 10⁻⁴ gives an answer 10⁸ times too small.",
    "Counting a plate outside the countable range when a plate inside it is available.",
    "Adding dilution steps instead of multiplying them: four ten-fold steps are 10⁻⁴, not 1 in 40.",
    "Reporting a zero count as \"0 CFU/mL\" instead of \"less than\" the limit of detection.",
    "Forgetting that 10 g in 90 mL is already a 10⁻¹ dilution of a solid sample, so the final answer is ten times too low.",
    "Writing the answer with every digit (15,600,000) as if it were exact, or calling it cells/mL instead of CFU/mL.",
    "Not mixing each tube before the next transfer, so organisms settle and every later tube is wrong.",
  ],

  practice: [
    {
      q: "1 mL of a 10⁻³ dilution is pour-plated and gives 87 colonies. What is the count in the original sample?",
      answer: "8.7 × 10⁴ CFU/mL (87,000 CFU/mL).",
      working: [
        "Dilution × volume plated = 10⁻³ × 1 mL = 10⁻³ mL.",
        "CFU/mL = 87 ÷ 10⁻³ = 87,000 CFU/mL = 8.7 × 10⁴ CFU/mL.",
      ],
    },
    {
      q: "0.1 mL of a 10⁻⁶ dilution is spread on agar and gives 132 colonies. What is the viable count?",
      answer: "1.32 × 10⁹ CFU/mL.",
      working: [
        "Dilution × volume plated = 10⁻⁶ × 0.1 mL = 10⁻⁷ mL.",
        "CFU/mL = 132 ÷ 10⁻⁷ = 1,320,000,000 CFU/mL = 1.32 × 10⁹ CFU/mL.",
      ],
    },
    {
      q: "You transfer 0.5 mL into 4.5 mL of diluent, and repeat the same step three more times from each new tube. What is the dilution in the fourth tube?",
      answer: "10⁻⁴ (a dilution factor of 10,000).",
      working: [
        "One step = 0.5 ÷ (0.5 + 4.5) = 0.5 ÷ 5 = 0.1 = 10⁻¹.",
        "Four steps = (10⁻¹)⁴ = 10⁻⁴.",
      ],
    },
    {
      q: "1 mL of sample is added to 99 mL of diluent, then 1 mL of that is added to 9 mL. What is the dilution in the second tube?",
      answer: "10⁻³.",
      working: [
        "First step = 1 ÷ (1 + 99) = 1/100 = 10⁻².",
        "Second step = 1 ÷ (1 + 9) = 1/10 = 10⁻¹.",
        "Total = 10⁻² × 10⁻¹ = 10⁻³ (multiply, never add).",
      ],
    },
    {
      q: "Spread plates (0.1 mL) give: 10⁻⁴ dilution, 380 and 410 colonies; 10⁻⁵ dilution, 41 and 35 colonies. Which plates do you use, and what is the count?",
      answer: "Use the 10⁻⁵ pair; 3.8 × 10⁷ CFU/mL.",
      working: [
        "The 10⁻⁴ plates are above the upper end of the countable range (about 300), so they are not used.",
        "Mean of the 10⁻⁵ plates = (41 + 35) ÷ 2 = 38 colonies.",
        "CFU/mL = 38 ÷ (10⁻⁵ × 0.1) = 38 ÷ 10⁻⁶ = 38,000,000 CFU/mL = 3.8 × 10⁷ CFU/mL.",
      ],
    },
    {
      q: "A suspension is thought to contain about 5 × 10⁶ CFU/mL. You will spread 0.1 mL. Which dilution should give about 50 colonies?",
      answer: "The 10⁻⁴ dilution.",
      working: [
        "Colonies = CFU/mL × dilution × volume plated.",
        "d = 50 ÷ (5 × 10⁶ × 0.1) = 50 ÷ 500,000 = 10⁻⁴.",
      ],
    },
    {
      q: "10 g of a cream is dispersed in 90 mL of diluent, and 1 mL of this suspension is pour-plated in duplicate. Neither plate grows. How is the result reported?",
      answer: "Less than 10 CFU/g.",
      working: [
        "10 g in 90 mL is a 1 in 10 suspension, i.e. 10⁻¹ of the solid.",
        "One colony would represent 1 ÷ (10⁻¹ × 1 mL) = 10 CFU/g.",
        "No colonies grew, so the count is below that limit: less than 10 CFU/g.",
      ],
    },
    {
      q: "A culture contains 2.4 × 10⁶ CFU/mL. What is that as a log₁₀ value? And if a different liquid contains 340 CFU/mL, how many CFU are in a 250 mL bottle?",
      answer: "log₁₀ 6.38; 8.5 × 10⁴ CFU in the bottle.",
      working: [
        "log₁₀(2.4 × 10⁶) = log₁₀ 2.4 + 6 = 0.38 + 6 = 6.38.",
        "CFU in the bottle = 340 CFU/mL × 250 mL = 85,000 CFU = 8.5 × 10⁴ CFU.",
      ],
    },
  ],

  limitations: [
    "A plate count estimates viable, culturable units under one set of conditions. Organisms that cannot grow on the medium, at that temperature or in that time are missed, and clumps are counted as one.",
    "Plate counts carry substantial chance variation, especially at low numbers; a single plate is a rough estimate. Replicates and the counting range reduce, but do not remove, that uncertainty.",
    "The 30–300 range used here is a common practical convention, not a universal rule. Official methods state their own counting ranges, averaging rules and acceptance criteria, and those take precedence.",
    "This guide covers the calculation for coursework and practicals. Testing of pharmaceutical products must follow the pharmacopoeial method and the laboratory's validated procedure.",
  ],

  refs: ["ansel16", "aulton6", "bipmSI"],

  relatedTools: [
    {
      slug: "cfu-calculator",
      name: "Colony Counter & CFU Calculator",
      why: "Applies CFU/mL = colonies ÷ (dilution × volume plated) to a count you have checked, exactly as in Examples 2 and 3; its photo counter is an estimate you must review marker by marker.",
    },
    {
      slug: "serial-dilution-calculator",
      name: "Serial Dilution Calculator",
      why: "Plans the ten-fold series and multiplies the step factors to give the dilution in every tube, as in the planning section.",
    },
  ],

  relatedGuides: ["dilution-and-concentration", "sterilization-kinetics-d-value-f-value"],

  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
