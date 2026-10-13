import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in the examples and practice answers was
 * recomputed in Python before drafting. Powders are "Powder A", "Powder B"…
 * and every mass, volume and density is illustrative.
 *
 * The flow-character scale reproduced here is the one widely printed in
 * pharmaceutics texts (originating with Carr) and in the pharmacopoeial powder-
 * flow chapter; the pharmacopoeial chapter is not yet in the reference
 * registry, so a reviewer must confirm the bands against it before publishing.
 * Examples avoid band edges so the linked calculator and this table agree.
 *
 * Not linked: powder-flowability-calculator — its classification bands
 * contradict its own printed scale (recorded in the redesign tracker).
 */
export const guide: Guide = {
  slug: "powder-flow-and-micromeritics",
  title: "Powder Flow and Micromeritics: Bulk and Tapped Density, Carr's Index, Hausner Ratio and Porosity",
  description:
    "Calculate bulk and tapped density, Carr's compressibility index, Hausner ratio, porosity and angle of repose, and read what they say about powder flow.",
  category: "Pharmaceutics",
  objectives: [
    "Distinguish true, bulk and tapped density, and explain what each one includes and excludes.",
    "Calculate bulk and tapped density from a tapped-cylinder test, and from them Carr's compressibility index and the Hausner ratio.",
    "Convert between Carr's index and the Hausner ratio, and classify flow using the standard scale.",
    "Calculate the porosity of a powder bed or a tablet from densities or volumes.",
    "Calculate the angle of repose and explain what it adds to density-based measures.",
    "Explain why flow matters for die filling, capsule filling and dose uniformity, and what changes flow.",
  ],
  intro: [
    "Micromeritics is the science of small particles: their size, shape, surface area and how they pack. For a pharmacist it answers practical questions. Will this powder flow evenly from a hopper into a tablet die? Will each capsule receive the same fill weight? How much space will a dose of powder take up? Uneven flow means uneven fill weights, and uneven fill weights mean uneven doses.",
    "Most of these questions are answered with a few simple measurements: the mass of powder in a graduated cylinder before and after tapping, its true density, and the shape of the heap it forms. From those come bulk and tapped density, Carr's compressibility index, the Hausner ratio, porosity and the angle of repose. The arithmetic is short; the skill is knowing what each number means and which volume goes where.",
    "Every powder, mass and density in this guide is illustrative. The numbers are chosen to show the method clearly, not to describe any real excipient or product.",
  ],
  terms: [
    {
      term: "True density (ρtrue)",
      definition:
        "Mass divided by the volume of the solid material only, excluding the pores inside particles and the spaces between them. Usually measured by gas (helium) pycnometry.",
    },
    {
      term: "Bulk density (ρb)",
      definition:
        "Mass divided by the volume the loosely poured powder occupies, including the voids between particles. Also called poured or apparent bulk density.",
    },
    {
      term: "Tapped density (ρt)",
      definition:
        "Mass divided by the volume after the cylinder has been mechanically tapped until the volume stops changing. Always at least as large as bulk density.",
    },
    {
      term: "Carr's compressibility index (CI)",
      definition:
        "The percentage by which a powder bed's volume shrinks on tapping: (V₀ − Vt) ÷ V₀ × 100. A high value means a cohesive powder that packs on standing and flows poorly.",
    },
    {
      term: "Hausner ratio (HR)",
      definition:
        "Tapped density divided by bulk density (equivalently V₀ ÷ Vt). A value close to 1 indicates good flow.",
    },
    {
      term: "Porosity (ε)",
      definition:
        "The fraction (or percentage) of a bed's or tablet's total volume that is empty space: ε = 1 − ρapparent ÷ ρtrue.",
    },
    {
      term: "Angle of repose (θ)",
      definition:
        "The angle between the horizontal and the side of a cone of powder poured onto a flat surface. Smaller angles mean freer flow.",
    },
    {
      term: "Glidant",
      definition:
        "An excipient added in small amounts, such as colloidal silica or talc, to reduce friction between particles and improve flow.",
    },
  ],
  sections: [
    {
      id: "densities",
      heading: "Three densities, three volumes",
      blocks: [
        {
          kind: "p",
          text: "Density is always mass ÷ volume. What changes between true, bulk and tapped density is the volume. Picture 50 g of powder poured gently into a cylinder: the reading on the side includes the solid, the pores inside particles and the air gaps between particles. Tap the cylinder and particles settle into some of those gaps, so the reading falls. The solid itself has not changed — only how tightly it is packed.",
        },
        {
          kind: "formula",
          expr: "ρb = m ÷ V₀;   ρt = m ÷ Vt;   ρtrue = m ÷ Vsolid",
          where: [
            { sym: "m", meaning: "mass of powder, g" },
            { sym: "V₀", meaning: "unsettled (poured) volume, mL" },
            { sym: "Vt", meaning: "final tapped volume, mL" },
            { sym: "Vsolid", meaning: "volume of the solid material alone, mL (or cm³), from pycnometry" },
          ],
          note: "Because Vsolid < Vt ≤ V₀, it always follows that ρtrue > ρt ≥ ρb. If your numbers break that order, a volume has gone in the wrong place.",
        },
        {
          kind: "p",
          text: "Bulk density matters every time powder is measured by volume: a tablet die or a capsule body is filled by volume, so the mass that lands in it is volume × the density at which the powder is packed. A powder whose bulk density varies from moment to moment gives tablets or capsules whose weights vary too.",
        },
      ],
    },
    {
      id: "carr-hausner",
      heading: "Carr's compressibility index and the Hausner ratio",
      blocks: [
        {
          kind: "p",
          text: "A free-flowing powder is already well packed when poured, so tapping changes its volume very little. A cohesive powder forms an open, fluffy structure that collapses on tapping. Both Carr's index and the Hausner ratio measure that collapse, and they carry the same information in different forms.",
        },
        {
          kind: "formula",
          expr: "CI (%) = (V₀ − Vt) ÷ V₀ × 100 = (ρt − ρb) ÷ ρt × 100",
          where: [
            { sym: "V₀, Vt", meaning: "unsettled and tapped volumes of the same mass, mL" },
            { sym: "ρb, ρt", meaning: "bulk and tapped density, g/mL" },
          ],
          note: "Note the denominator: V₀ (the larger volume) or ρt (the larger density). Dividing by the wrong one is the commonest error.",
        },
        {
          kind: "formula",
          expr: "HR = ρt ÷ ρb = V₀ ÷ Vt;   HR = 100 ÷ (100 − CI);   CI = 100 × (1 − 1 ÷ HR)",
          where: [{ sym: "HR", meaning: "Hausner ratio, dimensionless (≥ 1)" }],
        },
        {
          kind: "table",
          caption:
            "Flow character from Carr's index and Hausner ratio — the scale widely reproduced in pharmaceutics texts and the pharmacopoeial powder-flow chapter (bands to be confirmed by the reviewer against that chapter)",
          head: ["Carr's index (%)", "Hausner ratio", "Flow character"],
          rows: [
            ["≤ 10", "1.00–1.11", "Excellent"],
            ["11–15", "1.12–1.18", "Good"],
            ["16–20", "1.19–1.25", "Fair"],
            ["21–25", "1.26–1.34", "Passable"],
            ["26–31", "1.35–1.45", "Poor"],
            ["32–37", "1.46–1.59", "Very poor"],
            ["> 38", "> 1.60", "Very, very poor"],
          ],
        },
        {
          kind: "example",
          title: "Example 1: from a tapped-cylinder test",
          problem:
            "50.0 g of Powder A is poured into a 250 mL cylinder and reads 100 mL. After tapping the volume settles at 84 mL. Calculate bulk density, tapped density, Carr's index and Hausner ratio, and classify the flow.",
          steps: [
            "ρb = 50.0 g ÷ 100 mL = 0.500 g/mL.",
            "ρt = 50.0 g ÷ 84 mL = 0.5952 g/mL.",
            "CI = (100 − 84) ÷ 100 × 100 = 16.0%. Check with densities: (0.5952 − 0.500) ÷ 0.5952 × 100 = 16.0%.",
            "HR = 100 ÷ 84 = 1.190. Check: 100 ÷ (100 − 16) = 1.190.",
            "CI 16% and HR 1.19 both fall in the 'Fair' band.",
          ],
          answer: "ρb = 0.500 g/mL; ρt = 0.595 g/mL; CI = 16.0%; HR = 1.19; fair flow.",
        },
        {
          kind: "example",
          title: "Example 2: from densities only",
          problem: "Powder B has a bulk density of 0.42 g/mL and a tapped density of 0.60 g/mL. Find CI and HR and classify the flow.",
          steps: [
            "CI = (0.60 − 0.42) ÷ 0.60 × 100 = 0.18 ÷ 0.60 × 100 = 30.0%.",
            "HR = 0.60 ÷ 0.42 = 1.429.",
            "CI 30% (26–31) and HR 1.43 (1.35–1.45): 'Poor'.",
          ],
          answer: "CI = 30.0%; HR = 1.43; poor flow.",
          note: "A powder like this would usually need granulation or a glidant before it could be filled reliably by volume.",
        },
      ],
    },
    {
      id: "porosity",
      heading: "Porosity of a powder bed and of a tablet",
      blocks: [
        {
          kind: "p",
          text: "Porosity is the fraction of a volume that is empty. For a powder bed, the 'apparent' density is the bulk or tapped density; for a tablet it is the tablet's mass divided by its geometric volume. In both cases the true density is the reference, because it describes a volume with no empty space at all.",
        },
        {
          kind: "formula",
          expr: "ε = 1 − ρapparent ÷ ρtrue = (Vbulk − Vsolid) ÷ Vbulk",
          where: [
            { sym: "ε", meaning: "porosity, as a fraction (× 100 for %)" },
            { sym: "ρapparent", meaning: "bulk or tapped density of a bed, or a tablet's apparent density, g/cm³" },
            { sym: "ρtrue", meaning: "true density of the solid, g/cm³" },
            { sym: "Vbulk, Vsolid", meaning: "total volume of the bed or tablet, and volume of solid alone" },
          ],
          note: "1 − ε is the solid fraction (sometimes called relative density). 1 mL = 1 cm³.",
        },
        {
          kind: "example",
          title: "Example 3: porosity of a powder bed before and after tapping",
          problem: "Powder C has a true density of 1.52 g/cm³, a bulk density of 0.48 g/mL and a tapped density of 0.60 g/mL. Find the bed porosity in each state.",
          steps: [
            "Poured bed: ε = 1 − 0.48 ÷ 1.52 = 1 − 0.3158 = 0.6842, i.e. 68.4%.",
            "Tapped bed: ε = 1 − 0.60 ÷ 1.52 = 1 − 0.3947 = 0.6053, i.e. 60.5%.",
          ],
          answer: "68.4% poured; 60.5% tapped.",
          note: "Tapping removed about 8 percentage points of empty space. Most of the bed is still air, which is normal for a fine powder.",
        },
        {
          kind: "example",
          title: "Example 4: porosity of a flat-faced tablet",
          problem:
            "A flat-faced cylindrical tablet weighs 0.400 g, has a diameter of 10.0 mm and a thickness of 4.0 mm. The true density of the blend is 1.55 g/cm³. Find the tablet's porosity.",
          steps: [
            "Convert to cm: radius 0.50 cm, thickness 0.40 cm.",
            "Volume = π × r² × h = π × 0.50² × 0.40 = 0.3142 cm³.",
            "Apparent density = 0.400 g ÷ 0.3142 cm³ = 1.273 g/cm³.",
            "ε = 1 − 1.273 ÷ 1.55 = 1 − 0.8214 = 0.1786, i.e. 17.9%.",
          ],
          answer: "About 17.9% porosity (solid fraction about 0.82).",
          note: "Tablet porosity affects how fast water gets in, and so disintegration and dissolution.",
        },
      ],
    },
    {
      id: "angle-of-repose",
      heading: "Angle of repose",
      blocks: [
        {
          kind: "p",
          text: "Pour powder through a funnel onto a flat surface and it forms a cone. Cohesive powders build steep cones; free-flowing ones spread out. The angle of the cone's side, measured from the horizontal, is the angle of repose. It measures friction between particles in a moving bed, which complements the packing information from density.",
        },
        {
          kind: "formula",
          expr: "tan θ = h ÷ r;   θ = tan⁻¹(h ÷ r)",
          where: [
            { sym: "θ", meaning: "angle of repose, degrees" },
            { sym: "h", meaning: "height of the cone, cm" },
            { sym: "r", meaning: "radius of the cone's base, cm (half the measured diameter)" },
          ],
          note: "Use radius, not diameter. Set your calculator to degrees for tan⁻¹.",
        },
        {
          kind: "example",
          title: "Example 5: angle of repose",
          problem: "Powder D forms a cone 2.5 cm high with a base radius of 4.0 cm. Find the angle of repose.",
          steps: ["tan θ = 2.5 ÷ 4.0 = 0.625.", "θ = tan⁻¹(0.625) = 32.0°."],
          answer: "About 32.0°.",
          note: "On the scale printed in the same pharmacopoeial chapter, roughly 31–35° is described as good flow; angles above about 40° suggest the powder may hang up and need help to flow. Confirm the bands against the chapter before using them in a report.",
        },
      ],
    },
    {
      id: "improving-flow",
      heading: "What changes powder flow",
      blocks: [
        {
          kind: "list",
          items: [
            "Particle size: fine particles (below roughly 100 µm) have large surface area relative to their mass, so cohesive forces dominate and flow worsens.",
            "Particle shape: smooth, rounded particles roll past one another; needles and flakes interlock.",
            "Moisture: adsorbed water forms liquid bridges between particles; too much moisture makes a powder sticky, very dry powders can become electrostatically charged.",
            "Granulation: binding fine particles into larger, denser granules is the main way to turn a poor-flowing blend into one that fills dies evenly.",
            "Glidants: small amounts of colloidal silica or talc coat particles and reduce friction.",
          ],
        },
        {
          kind: "callout",
          tone: "note",
          title: "One test is not enough",
          text: "Carr's index, Hausner ratio and angle of repose each capture a different aspect of flow, and each depends on how the test is done (cylinder size, tapping rate, funnel height). Compare powders only when they were tested the same way, and report the method with the number.",
        },
      ],
    },
  ],
  mistakes: [
    "Dividing by the wrong volume or density in Carr's index. It is (V₀ − Vt) ÷ V₀, or (ρt − ρb) ÷ ρt — the larger volume, or the larger density.",
    "Inverting the Hausner ratio. HR = ρt ÷ ρb (always ≥ 1). A value below 1 means the two densities were swapped.",
    "Mixing up which volume goes with which density: the bigger volume (before tapping) gives the smaller density (bulk).",
    "Using bulk density in place of true density in the porosity formula, or vice versa. ε = 1 − ρapparent ÷ ρtrue, with the true density on the bottom.",
    "Using the cone's diameter instead of its radius for the angle of repose, which roughly halves tan θ.",
    "Forgetting units when calculating a tablet's volume: mixing mm and cm gives a volume 1000 times wrong.",
    "Treating a classification as precise. A Carr's index of 15.4% is near a band edge; report the number, not just the label.",
  ],
  practice: [
    {
      q: "40 g of Powder E occupies 80 mL poured and 70 mL tapped. Calculate ρb, ρt, CI and HR, and classify the flow.",
      answer: "ρb = 0.500 g/mL; ρt = 0.571 g/mL; CI = 12.5%; HR = 1.14; good flow.",
      working: [
        "ρb = 40 ÷ 80 = 0.500 g/mL.",
        "ρt = 40 ÷ 70 = 0.5714 g/mL.",
        "CI = (80 − 70) ÷ 80 × 100 = 12.5%.",
        "HR = 80 ÷ 70 = 1.143.",
        "CI 11–15% and HR 1.12–1.18: good flow.",
      ],
    },
    {
      q: "Powder F has ρb = 0.35 g/mL and ρt = 0.50 g/mL. Calculate CI and HR.",
      answer: "CI = 30.0%; HR = 1.43 (poor flow).",
      working: [
        "CI = (0.50 − 0.35) ÷ 0.50 × 100 = 30.0%.",
        "HR = 0.50 ÷ 0.35 = 1.4286.",
      ],
    },
    {
      q: "A powder has a Hausner ratio of 1.25. What is its Carr's index?",
      answer: "20.0%.",
      working: [
        "CI = 100 × (1 − 1 ÷ HR).",
        "= 100 × (1 − 1 ÷ 1.25) = 100 × (1 − 0.80) = 20.0%.",
      ],
    },
    {
      q: "A powder has a true density of 1.40 g/cm³ and a bulk density of 0.56 g/mL. What is the porosity of the poured bed?",
      answer: "60.0%.",
      working: ["ε = 1 − 0.56 ÷ 1.40 = 1 − 0.40 = 0.60.", "As a percentage: 60.0%."],
    },
    {
      q: "A powder bed occupies 25 mL; the solid material in it occupies 9.5 mL. What is the porosity?",
      answer: "62.0%.",
      working: ["ε = (Vbulk − Vsolid) ÷ Vbulk.", "= (25 − 9.5) ÷ 25 = 15.5 ÷ 25 = 0.62, i.e. 62.0%."],
    },
    {
      q: "A capsule-filling cavity of 0.50 mL is filled with a blend whose tapped density is 0.62 g/mL. What fill mass would you expect if the blend packs to its tapped density?",
      answer: "About 0.310 g (310 mg).",
      working: ["Mass = volume × density.", "= 0.50 mL × 0.62 g/mL = 0.310 g."],
    },
    {
      q: "Powder G forms a cone 3.0 cm high with a base diameter of 12.0 cm. Find the angle of repose.",
      answer: "About 26.6°.",
      working: [
        "Radius = 12.0 ÷ 2 = 6.0 cm.",
        "tan θ = 3.0 ÷ 6.0 = 0.5.",
        "θ = tan⁻¹(0.5) = 26.57°.",
      ],
    },
    {
      q: "Adding a glidant lowers a blend's Carr's index from 24% to 14%. Calculate the Hausner ratio before and after, and say how the flow class changes.",
      answer: "HR 1.32 before (passable) and 1.16 after (good).",
      working: [
        "HR = 100 ÷ (100 − CI).",
        "Before: 100 ÷ 76 = 1.316 — CI 21–25%, HR 1.26–1.34: passable.",
        "After: 100 ÷ 86 = 1.163 — CI 11–15%, HR 1.12–1.18: good.",
      ],
    },
  ],
  limitations: [
    "Every powder and value here is illustrative. Real excipients' densities depend on grade, particle size, moisture and supplier.",
    "Bulk and tapped density depend on the method: cylinder size, how the powder is poured, the number and height of taps. The pharmacopoeia describes standard methods; results from different methods should not be compared directly.",
    "The flow-character bands are descriptive, not acceptance limits. Whether a blend is good enough is decided by how it performs on the actual machine.",
    "These tests describe bulk behaviour. They do not measure particle size distribution, shear strength or flow through a specific hopper, which need other methods (sieve analysis, shear cells, flow-through-an-orifice).",
  ],
  refs: ["aulton6", "martin8"],
  relatedTools: [
    {
      slug: "compressibility-index-calculator",
      name: "Compressibility Index Calculator",
      why: "Computes ρb = m ÷ V₀, ρt = m ÷ Vt, CI = (V₀ − Vt) ÷ V₀ × 100 and HR = V₀ ÷ Vt from cylinder readings, as in Examples 1–2. Read its CI and HR values against the table in this guide; its labels can differ from the table at exact band edges.",
    },
    {
      slug: "porosity-calculator",
      name: "Porosity Calculator",
      why: "Uses ε = (1 − ρbulk ÷ ρtrue) × 100 or (Vtotal − Vsolid) ÷ Vtotal × 100, the two porosity formulas taught here.",
    },
    {
      slug: "density-calculator",
      name: "Density Calculator",
      why: "Calculates true, bulk or tapped density as mass ÷ volume. Leave the optional container fields blank for the standard definitions used in this guide.",
    },
  ],
  relatedGuides: ["compounding-and-formula-scaling", "dissolution-testing-and-drug-release", "accuracy-precision-recovery"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
