import { TEAM_AUTHOR } from "@/lib/content/governance";
import type { Guide } from "@/lib/guides/types";

/*
 * DRAFT. Every number below was recomputed in Python on 2026-10-13. Plates,
 * retention times and peak widths are invented for teaching.
 */

export const guide: Guide = {
  slug: "chromatography-rf-and-resolution",
  title: "Chromatography Calculations: Rf Value, Resolution and Plate Number",
  description:
    "Rf in TLC, retention factor k, selectivity α, plate number N, plate height and resolution Rs, with the Purnell equation, worked examples and practice.",
  category: "Pharmaceutical Analysis",
  objectives: [
    "Measure and calculate Rf values correctly on a TLC or paper chromatogram, and compare a spot with a reference.",
    "Calculate the retention factor k and the selectivity factor α from retention times.",
    "Calculate the plate number N from peak width at the base or at half height, and the plate height H.",
    "Calculate the resolution Rs between two peaks and explain what Rs = 1.5 means.",
    "Use the Purnell equation to predict how efficiency, retention and selectivity change resolution.",
  ],
  intro: [
    "Every chromatographic method separates a mixture by letting its components share their time between a stationary phase and a mobile phase. A component that prefers the stationary phase moves slowly; one that prefers the mobile phase moves quickly. The calculations in this guide turn that idea into numbers you can compare: how far a spot travelled on a plate, how long a peak was retained in a column, how sharp it is, and whether two neighbouring peaks are truly apart.",
    "Thin-layer chromatography (TLC) is the first technique most Pharm-D students meet, in identification tests and in following a reaction. Column methods such as HPLC and GC follow, with system-suitability figures — plate number, resolution, tailing — printed on every chromatogram. The arithmetic for both is short. The skill is in measuring the right distances and times, and in knowing what each number can and cannot tell you.",
    "All plates, chromatograms and figures here are invented for teaching. Any acceptance limit for a real method (a minimum resolution or plate number, for example) comes from that method's monograph or validation protocol.",
  ],
  terms: [
    { term: "Origin (baseline)", definition: "The pencil line on a TLC plate where the samples are spotted. All distances are measured from it." },
    { term: "Solvent front", definition: "The furthest point the mobile phase reached, marked as soon as the plate is taken out of the tank." },
    { term: "Rf (retardation factor)", definition: "Distance moved by the spot ÷ distance moved by the solvent front, both from the origin. It lies between 0 and 1." },
    { term: "Retention time (tR)", definition: "The time from injection to the top of a peak." },
    { term: "Dead time (tM)", definition: "The time an unretained substance takes to pass through the column; the time the mobile phase itself takes." },
    { term: "Retention factor (k)", definition: "(tR − tM) ÷ tM: how much longer a component spends in the stationary phase than in the mobile phase." },
    { term: "Selectivity factor (α)", definition: "k₂ ÷ k₁ for two neighbouring peaks, with peak 2 the later one, so α ≥ 1." },
    { term: "Plate number (N)", definition: "A measure of column efficiency: how narrow a peak is compared with how long it was retained." },
    { term: "Plate height (H)", definition: "Column length ÷ N. Smaller H means a more efficient column." },
    { term: "Resolution (Rs)", definition: "The separation between two peak tops divided by their average width at the base." },
  ],
  sections: [
    {
      id: "rf-values",
      heading: "Rf values in thin-layer and paper chromatography",
      blocks: [
        {
          kind: "p",
          text: "On a plate, every substance has the same time to move: the time the solvent took to climb. So instead of a time, you compare distances. The Rf value divides the distance travelled by the substance by the distance travelled by the solvent, both measured from the origin line, which makes it independent of how far you let the plate run.",
        },
        {
          kind: "formula",
          expr: "Rf = distance from origin to the centre of the spot ÷ distance from origin to the solvent front",
          where: [
            { sym: "distance to the spot", meaning: "measured to the centre (or densest point) of the spot, cm" },
            { sym: "distance to the front", meaning: "measured to the solvent front line, cm, in the same lane" },
          ],
          note: "Rf has no unit and cannot be greater than 1. A value above 1 means a measurement or marking error.",
        },
        {
          kind: "p",
          text: "Rf depends on the plate, the solvent, the temperature, the chamber saturation and how much was spotted, so a literature Rf is only a rough guide. Identification is much more reliable when the unknown and a reference substance are run side by side on the same plate. Their ratio, sometimes written Rx or Rst, cancels most of the plate-to-plate variation.",
        },
        {
          kind: "example",
          title: "Rf values and comparison with a reference",
          problem:
            "On one silica plate the solvent front is 8.0 cm from the origin. The sample gives two spots, centred 2.4 cm and 5.6 cm from the origin. A reference substance run in the next lane travels 2.5 cm. Calculate the Rf values and the ratio of the first spot to the reference.",
          steps: [
            "Spot 1: Rf = 2.4 ÷ 8.0 = 0.30.",
            "Spot 2: Rf = 5.6 ÷ 8.0 = 0.70.",
            "Reference: Rf = 2.5 ÷ 8.0 = 0.31.",
            "Ratio to reference = 2.4 ÷ 2.5 = 0.96.",
          ],
          answer: "Rf 0.30 and 0.70; spot 1 travelled 0.96 times as far as the reference.",
          note: "Close agreement with a co-spotted reference supports, but does not prove, identity: two different substances can share an Rf in one solvent system.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Polarity only on a stated system",
          text: "On normal-phase silica with a fairly non-polar solvent, more polar compounds are held back and have lower Rf values. On a reversed-phase plate the order is reversed. A low or high Rf describes the compound on that plate with that solvent, not the compound in general.",
        },
      ],
    },
    {
      id: "retention",
      heading: "Retention in column chromatography: tR, k and α",
      blocks: [
        {
          kind: "p",
          text: "In a column the distance is fixed, so components are compared by time. The raw retention time includes the time any molecule needs just to be carried through by the mobile phase, so the retention factor k subtracts that dead time and expresses what is left as a multiple of it. Because k is a ratio, it does not change with flow rate the way tR does.",
        },
        {
          kind: "formula",
          expr: "k = (tR − tM) ÷ tM     α = k₂ ÷ k₁",
          where: [
            { sym: "tR", meaning: "retention time of the peak, min" },
            { sym: "tM", meaning: "dead time (an unretained marker), min" },
            { sym: "k₁, k₂", meaning: "retention factors of the earlier and later peaks" },
          ],
        },
        {
          kind: "example",
          title: "Retention factors and selectivity",
          problem: "An unretained marker elutes at 1.20 min. Two neighbouring peaks elute at 4.80 and 5.40 min. Find k for each and α.",
          steps: [
            "k₁ = (4.80 − 1.20) ÷ 1.20 = 3.00.",
            "k₂ = (5.40 − 1.20) ÷ 1.20 = 3.50.",
            "α = 3.50 ÷ 3.00 = 1.17.",
          ],
          answer: "k₁ = 3.00, k₂ = 3.50, α = 1.17.",
          note: "α = 1 would mean the two components are retained equally and cannot be separated on this system, however efficient the column.",
        },
      ],
    },
    {
      id: "plate-number",
      heading: "Column efficiency: plate number N and plate height H",
      blocks: [
        {
          kind: "p",
          text: "A peak spreads as it travels, and an efficient column keeps that spreading small. The plate number compares the retention time with the peak's width: a peak that is narrow for how long it was retained gives a high N. Width can be measured at the base, between the tangents drawn on each side of the peak, or at half the peak height, which is easier to read accurately; the two forms use different constants.",
        },
        {
          kind: "formula",
          expr: "N = 16 × (tR ÷ W)²     N = 5.54 × (tR ÷ W½)²     H = L ÷ N",
          where: [
            { sym: "W", meaning: "peak width at the base (between tangents), same time unit as tR" },
            { sym: "W½", meaning: "peak width at half height, same time unit as tR" },
            { sym: "L", meaning: "column length" },
            { sym: "H", meaning: "plate height, in the unit of L" },
          ],
          note: "Both constants assume a symmetrical (Gaussian) peak. For a tailing peak the two forms disagree, which is itself a warning sign.",
        },
        {
          kind: "example",
          title: "Plate number and plate height",
          problem:
            "On a 150 mm column a peak elutes at 5.40 min with a base width of 0.30 min and a width at half height of 0.18 min. Calculate N both ways, and H from the base-width value.",
          steps: [
            "From base width: N = 16 × (5.40 ÷ 0.30)² = 16 × 18.0² = 5184.",
            "From half-height width: N = 5.54 × (5.40 ÷ 0.18)² = 5.54 × 30.0² = 4986.",
            "H = 150 mm ÷ 5184 = 0.0289 mm = 28.9 µm.",
          ],
          answer: "N ≈ 5180 (base) or 4990 (half height); H ≈ 29 µm.",
          note: "The two answers differ by about 4% because real peaks are not perfect Gaussians and widths are read by hand. Report which method you used.",
        },
      ],
    },
    {
      id: "resolution",
      heading: "Resolution between two peaks",
      blocks: [
        {
          kind: "p",
          text: "Two peaks can be far apart in time and still overlap if they are broad, or close together and still separate if they are sharp. Resolution captures both: the gap between the peak tops divided by the average base width.",
        },
        {
          kind: "formula",
          expr: "Rs = 2 × (tR₂ − tR₁) ÷ (W₁ + W₂)     Rs = 1.18 × (tR₂ − tR₁) ÷ (W½,₁ + W½,₂)",
          where: [
            { sym: "tR₁, tR₂", meaning: "retention times of the earlier and later peaks" },
            { sym: "W₁, W₂", meaning: "base widths of the two peaks, same time unit" },
            { sym: "W½,₁, W½,₂", meaning: "widths at half height" },
          ],
        },
        {
          kind: "example",
          title: "Resolution from a chromatogram",
          problem:
            "Peaks elute at 4.80 and 5.40 min with base widths 0.28 and 0.30 min (half-height widths 0.165 and 0.18 min). Calculate Rs by both formulas.",
          steps: [
            "Base widths: Rs = 2 × (5.40 − 4.80) ÷ (0.28 + 0.30) = 1.20 ÷ 0.58 = 2.07.",
            "Half-height widths: Rs = 1.18 × 0.60 ÷ (0.165 + 0.18) = 0.708 ÷ 0.345 = 2.05.",
          ],
          answer: "Rs ≈ 2.1 by either method.",
        },
        {
          kind: "table",
          caption: "What a resolution value means for two equal, symmetrical peaks",
          head: ["Rs", "What you see"],
          rows: [
            ["below 1.0", "Peaks visibly merged; areas cannot be measured separately with confidence"],
            ["1.0", "Two tops visible; the valley between them is still about 27% of the peak height"],
            ["1.5", "Essentially baseline separation for equal-sized Gaussian peaks (valley about 2% of the peak height)"],
            ["2.0 and above", "Clear baseline between the peaks, with a margin for small changes in the system"],
          ],
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Unequal peaks need more",
          text: "The 1.5 rule of thumb assumes two peaks of similar size and good shape. A small impurity next to a large main peak, or a tailing peak, needs a higher resolution to be measured accurately. The minimum resolution for a real method is written into its monograph or system-suitability requirement.",
        },
      ],
    },
    {
      id: "purnell",
      heading: "Improving resolution: the Purnell equation",
      blocks: [
        {
          kind: "p",
          text: "Resolution can also be written in terms of the three things a chromatographer can change: efficiency (N), retention (k) and selectivity (α). This is the Purnell form of the resolution equation. Textbooks print it in slightly different but closely related forms; the one below uses k of the later-eluting peak.",
        },
        {
          kind: "formula",
          expr: "Rs = (√N ÷ 4) × [(α − 1) ÷ α] × [k₂ ÷ (1 + k₂)]",
          where: [
            { sym: "N", meaning: "plate number of the column" },
            { sym: "α", meaning: "selectivity factor, k₂ ÷ k₁" },
            { sym: "k₂", meaning: "retention factor of the later-eluting peak" },
          ],
        },
        {
          kind: "example",
          title: "Predicting resolution, and what to change",
          problem: "A column gives N = 10 000 for a pair of peaks with k₂ = 2.5 and α = 1.10. Predict Rs, and the plate number needed for Rs = 1.5 with the same k₂ and α.",
          steps: [
            "Efficiency term: √10 000 ÷ 4 = 100 ÷ 4 = 25.0.",
            "Selectivity term: (1.10 − 1) ÷ 1.10 = 0.0909.",
            "Retention term: 2.5 ÷ 3.5 = 0.714.",
            "Rs = 25.0 × 0.0909 × 0.714 = 1.62.",
            "For Rs = 1.5: √N = 1.5 × 4 ÷ (0.0909 × 0.714) = 92.4, so N = 92.4² ≈ 8540.",
          ],
          answer: "Rs ≈ 1.62; about 8540 plates would just give 1.5.",
        },
        {
          kind: "table",
          caption: "Effect of each change, starting from N = 10 000, k₂ = 2.5, α = 1.10 (Rs = 1.62)",
          head: ["Change", "New Rs", "Comment"],
          rows: [
            ["Double N to 20 000", "2.30", "Only √2 better, for twice the column length or a much finer packing"],
            ["Quadruple N to 40 000", "3.25", "Four times the plates to double the resolution"],
            ["Raise k₂ to 5", "1.89", "Helps, but at the cost of longer run times"],
            ["Raise k₂ to 10", "2.07", "The retention term approaches 1, so further gains are small"],
            ["Raise α to 1.20", "2.98", "A small change in selectivity has the largest effect"],
          ],
        },
        {
          kind: "p",
          text: "The table explains a piece of practical wisdom: when two peaks overlap, change the selectivity first (the mobile-phase composition, pH or the type of stationary phase), because that moves the peaks apart. Adding plates only makes them narrower, and the gain grows with the square root of N.",
        },
      ],
    },
  ],
  mistakes: [
    "Measuring Rf distances from the bottom edge of the plate instead of from the origin line.",
    "Measuring to the leading edge of a spot instead of its centre, or to where the solvent front was guessed after it dried.",
    "Reporting an Rf above 1, which is impossible and means a measurement or marking error.",
    "Treating an Rf match with a literature value as proof of identity, instead of co-spotting a reference on the same plate.",
    "Using tR instead of tR − tM when calculating k.",
    "Using the constant 16 with a half-height width, or 5.54 with a base width.",
    "Mixing units, such as retention times in minutes and peak widths in seconds.",
    "Assuming Rs = 1.5 is always enough, even for a small impurity beside a large peak or for tailing peaks.",
  ],
  practice: [
    {
      q: "The solvent front is 7.5 cm from the origin and a spot is centred 3.9 cm from the origin. What is its Rf?",
      answer: "Rf = 0.52.",
      working: ["Rf = 3.9 ÷ 7.5 = 0.52."],
    },
    {
      q: "A compound has Rf 0.35 in a system. If the solvent front travels 9.0 cm, how far from the origin should you expect its spot?",
      answer: "About 3.2 cm (3.15 cm).",
      working: ["Distance to spot = Rf × distance to front.", "= 0.35 × 9.0 = 3.15 cm."],
    },
    {
      q: "With tM = 1.10 min, a peak elutes at 6.60 min. What is its retention factor?",
      answer: "k = 5.0.",
      working: ["k = (6.60 − 1.10) ÷ 1.10 = 5.50 ÷ 1.10 = 5.0."],
    },
    {
      q: "With tM = 1.10 min, two peaks elute at 3.30 and 3.74 min. Calculate k for each and the selectivity factor.",
      answer: "k₁ = 2.00, k₂ = 2.40, α = 1.20.",
      working: ["k₁ = (3.30 − 1.10) ÷ 1.10 = 2.00.", "k₂ = (3.74 − 1.10) ÷ 1.10 = 2.40.", "α = 2.40 ÷ 2.00 = 1.20."],
    },
    {
      q: "On a 250 mm column a peak elutes at 8.0 min with a base width of 0.40 min. Calculate N and H.",
      answer: "N = 6400; H ≈ 39 µm.",
      working: ["N = 16 × (8.0 ÷ 0.40)² = 16 × 20² = 6400.", "H = 250 mm ÷ 6400 = 0.0391 mm = 39.1 µm."],
    },
    {
      q: "Two peaks elute at 7.10 and 7.60 min with base widths 0.42 and 0.46 min. Calculate the resolution and comment.",
      answer: "Rs ≈ 1.14: two tops visible but not baseline-separated.",
      working: [
        "Rs = 2 × (7.60 − 7.10) ÷ (0.42 + 0.46) = 1.00 ÷ 0.88 = 1.14.",
        "This is below about 1.5, so for equal peaks the valley does not return to the baseline.",
      ],
    },
    {
      q: "Use the Purnell equation to predict Rs for N = 6400, k₂ = 4.0 and α = 1.15.",
      answer: "Rs ≈ 2.09.",
      working: [
        "Efficiency term = √6400 ÷ 4 = 80 ÷ 4 = 20.",
        "Selectivity term = 0.15 ÷ 1.15 = 0.1304.",
        "Retention term = 4.0 ÷ 5.0 = 0.80.",
        "Rs = 20 × 0.1304 × 0.80 = 2.09.",
      ],
    },
    {
      q: "A column with N = 5000 gives Rs = 1.0 for a pair of peaks. If only the plate number is changed, how many plates are needed for Rs = 1.5?",
      answer: "About 11 250 plates.",
      working: [
        "Rs is proportional to √N, so N is proportional to Rs².",
        "N(new) = 5000 × (1.5 ÷ 1.0)² = 5000 × 2.25 = 11 250.",
      ],
    },
  ],
  limitations: [
    "All plates, chromatograms and figures are invented for teaching and are not taken from any monograph method.",
    "The plate-number and resolution formulas assume symmetrical, Gaussian peaks. Tailing factor, asymmetry and the corrections used for non-Gaussian peaks are not covered.",
    "Minimum resolution, plate number and other system-suitability limits are set by each method's monograph or validation protocol and are not given here.",
    "The van Deemter equation, gradient elution and quantitation by peak area are outside the scope of this guide.",
  ],
  refs: ["harris10"],
  relatedTools: [
    {
      slug: "rf-value-calculator",
      name: "TLC Rf Analyzer",
      why: "Its 'Enter distances' tab calculates Rf = spot distance ÷ solvent-front distance for one or several spots and warns when a value exceeds 1. Its polarity labels assume normal-phase silica.",
    },
    {
      slug: "chromatographic-resolution-calculator",
      name: "Chromatographic Resolution Calculator",
      why: "Calculates Rs = 2(tR₂ − tR₁) ÷ (W₁ + W₂) from peak data, or from N, k and α with the same Purnell form used in this guide.",
    },
  ],
  relatedGuides: ["accuracy-precision-recovery", "beer-lambert-and-uv-spectrophotometry"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
