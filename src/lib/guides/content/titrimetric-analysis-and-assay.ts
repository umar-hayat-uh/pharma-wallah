import { TEAM_AUTHOR } from "@/lib/content/governance";
import type { Guide } from "@/lib/guides/types";

/*
 * DRAFT. Every number below was recomputed in Python on 2026-10-13. Molecular
 * weights are rounded standard values; sample weights, burette readings and
 * factors are invented for teaching and are not taken from any monograph.
 *
 * The Percent Purity Calculator is deliberately NOT linked: its example chips
 * produce impossible purities (42% and 776%) and it grades every result
 * against a fixed 98–102% band, while this guide teaches that limits come from
 * the monograph. Link it once those are fixed.
 */

export const guide: Guide = {
  slug: "titrimetric-analysis-and-assay",
  title: "Titrimetric Analysis: Normality, Equivalence Factors and % Purity",
  description:
    "Equivalent weight, normality and molarity, standardisation factors, 'each mL is equivalent to' factors, and % purity by direct and back titration.",
  category: "Pharmaceutical Analysis",
  objectives: [
    "Calculate equivalent weight from molecular weight and n-factor, and convert between normality and molarity.",
    "Standardise a titrant against a primary standard and express the result as a factor (f).",
    "Derive an equivalence factor ('each mL of 0.1 M titrant is equivalent to … mg') from the reaction stoichiometry.",
    "Calculate % purity from a direct titration and from a back titration with a blank.",
    "Explain why the acceptance limits for an assay come from the monograph, not from a general rule.",
  ],
  intro: [
    "Titration is one of the oldest quantitative methods in pharmaceutical analysis and still one of the most common in a Pharm-D practical. You react the drug with a solution of exactly known strength, find the end point with an indicator or a meter, and calculate how much drug must have been present from the volume used.",
    "The chemistry is usually simple; the arithmetic is where marks are lost. Students mix up molarity and normality, forget the standardisation factor, use the wrong mole ratio, or put the sample weight in grams when the equivalence factor is in milligrams. This guide builds the calculation up one piece at a time, then puts the pieces together into the % purity formula used in assay practicals.",
    "Many practical books and lab manuals express titrant strength as normality (N). IUPAC recommends amount concentration (molarity, M) instead, and some pharmacopoeias state titrants in molarity and build the reaction ratio into the equivalence factor. You will meet both, so both are shown. All sample data are invented for teaching.",
  ],
  terms: [
    { term: "Titrant", definition: "The solution of accurately known concentration added from the burette." },
    { term: "End point", definition: "The point at which the indicator changes or the meter reading jumps, taken as the practical estimate of the equivalence point." },
    { term: "n-factor", definition: "The number of reacting units one molecule supplies or accepts: H⁺ ions for an acid, OH⁻ ions for a base, electrons for an oxidising or reducing agent." },
    { term: "Equivalent weight", definition: "Molecular weight ÷ n-factor, in g per equivalent. It is the mass that supplies one mole of reacting units." },
    { term: "Normality (N)", definition: "Equivalents of solute per litre of solution. N = M × n-factor." },
    { term: "Primary standard", definition: "A pure, stable substance that can be weighed accurately and used to find the exact concentration of a titrant, such as potassium hydrogen phthalate for alkali." },
    { term: "Standardisation factor (f)", definition: "Actual concentration ÷ nominal concentration of a titrant. A nominally 0.1 M solution that is really 0.1006 M has f = 1.006." },
    { term: "Equivalence factor (E)", definition: "The mass of drug that reacts with 1 mL of titrant of the nominal strength, usually given in mg per mL." },
    { term: "Back titration", definition: "Adding a known excess of one reagent to the drug, then titrating the unreacted excess with a second titrant." },
    { term: "Blank titration", definition: "The same procedure carried out without the sample, so that the reagent consumption not due to the drug can be subtracted." },
  ],
  sections: [
    {
      id: "equivalents-and-normality",
      heading: "Equivalent weight, normality and molarity",
      blocks: [
        {
          kind: "p",
          text: "Molarity counts molecules; normality counts the reacting units they carry. One mole of sulfuric acid releases two moles of H⁺ in a full neutralisation, so a 0.05 M solution supplies the same amount of acid as a 0.1 M solution of hydrochloric acid. Normality captures that: both are 0.1 N.",
        },
        {
          kind: "formula",
          expr: "Equivalent weight = MW ÷ n     N = M × n     N = mass (g) ÷ [equivalent weight (g/eq) × volume (L)]",
          where: [
            { sym: "MW", meaning: "molecular weight, g/mol" },
            { sym: "n", meaning: "n-factor for the reaction being used" },
            { sym: "M", meaning: "molarity, mol/L" },
            { sym: "N", meaning: "normality, equivalents/L" },
          ],
          note: "The n-factor belongs to the reaction, not to the substance alone. Potassium permanganate has n = 5 when reduced to Mn²⁺ in acid solution, but a different value in neutral or alkaline solution.",
        },
        {
          kind: "table",
          caption: "Common n-factors and equivalent weights (MW rounded)",
          head: ["Substance", "MW (g/mol)", "n-factor and reaction", "Equivalent weight (g/eq)"],
          rows: [
            ["HCl", "36.46", "1 (one H⁺)", "36.46"],
            ["H₂SO₄", "98.08", "2 (two H⁺)", "49.04"],
            ["H₃PO₄", "97.99", "3 (all three H⁺ neutralised)", "32.66"],
            ["NaOH", "40.00", "1 (one OH⁻)", "40.00"],
            ["Ca(OH)₂", "74.09", "2 (two OH⁻)", "37.05"],
            ["Na₂CO₃", "105.99", "2 (to CO₂)", "53.00"],
            ["KMnO₄", "158.03", "5 (MnO₄⁻ → Mn²⁺ in acid)", "31.61"],
            ["K₂Cr₂O₇", "294.18", "6 (Cr₂O₇²⁻ → 2 Cr³⁺)", "49.03"],
          ],
        },
        {
          kind: "example",
          title: "Normality and molarity of sulfuric acid",
          problem: "4.904 g of H₂SO₄ (MW 98.08) is dissolved and made up to 1.000 L. Find the normality and the molarity.",
          steps: [
            "Equivalent weight = 98.08 ÷ 2 = 49.04 g/eq.",
            "N = 4.904 ÷ (49.04 × 1.000) = 0.1000 N.",
            "M = 4.904 ÷ (98.08 × 1.000) = 0.0500 M, which is N ÷ n = 0.1000 ÷ 2.",
          ],
          answer: "0.1000 N, which is 0.0500 M.",
        },
      ],
    },
    {
      id: "standardisation",
      heading: "Standardising a titrant: the factor f",
      blocks: [
        {
          kind: "p",
          text: "Sodium hydroxide absorbs water and carbon dioxide, so a solution made up to be 0.1 M is never exactly 0.1 M. Before it is used in an assay, it is titrated against a weighed primary standard, and its real concentration is expressed as a factor relative to the nominal strength. Every later calculation multiplies the burette volume by this factor.",
        },
        {
          kind: "formula",
          expr: "M(titrant) = [mass of standard (g) ÷ MW of standard] × (mol titrant per mol standard) ÷ V(L)     f = M(actual) ÷ M(nominal)",
          where: [
            { sym: "V", meaning: "volume of titrant used at the end point, in litres" },
            { sym: "f", meaning: "standardisation factor, no unit" },
          ],
        },
        {
          kind: "example",
          title: "Standardising ~0.1 M NaOH with potassium hydrogen phthalate",
          problem:
            "0.5105 g of potassium hydrogen phthalate (KHP, MW 204.22, reacts 1 : 1 with NaOH) needs 24.85 mL of a nominally 0.1 M NaOH solution. Find the actual molarity and the factor.",
          steps: [
            "Moles of KHP = 0.5105 ÷ 204.22 = 0.0024998 mol, so 0.0024998 mol of NaOH reacted.",
            "M(NaOH) = 0.0024998 ÷ 0.02485 L = 0.10059 M.",
            "f = 0.10059 ÷ 0.1 = 1.0059.",
          ],
          answer: "0.1006 M; f = 1.0059.",
          note: "A factor above 1 means the solution is slightly stronger than nominal, so each mL does slightly more work than the label suggests.",
        },
      ],
    },
    {
      id: "equivalence-factor",
      heading: "The equivalence factor: 'each mL is equivalent to …'",
      blocks: [
        {
          kind: "p",
          text: "Pharmacopoeial assays state the result of the stoichiometry once, in a sentence of the form 'each mL of 0.1 M sodium hydroxide is equivalent to x mg of the drug'. You can always derive this number yourself, and you should, because it is the step where a wrong mole ratio silently doubles or halves the answer.",
        },
        {
          kind: "formula",
          expr: "E (mg per mL) = M(nominal) × (mol drug per mol titrant) × MW(drug)",
          where: [
            { sym: "M(nominal)", meaning: "the nominal titrant strength, mol/L, which is also mmol per mL" },
            { sym: "mol drug per mol titrant", meaning: "from the balanced equation" },
            { sym: "MW(drug)", meaning: "molecular weight in g/mol, which is also mg per mmol" },
          ],
        },
        {
          kind: "example",
          title: "Equivalence factor for a monobasic acid",
          problem:
            "A drug with MW 180.16 has one acidic group and reacts 1 : 1 with sodium hydroxide. What mass of drug is equivalent to 1 mL of 0.1 M NaOH?",
          steps: [
            "1 mL of 0.1 M NaOH contains 0.1 mmol of NaOH.",
            "With a 1 : 1 ratio, that reacts with 0.1 mmol of drug.",
            "E = 0.1 mmol × 180.16 mg/mmol = 18.016 mg.",
          ],
          answer: "Each mL of 0.1 M NaOH ≡ 18.02 mg of the drug.",
          note: "If the drug reacted 1 : 2 (one molecule consuming two hydroxide ions), each mL would correspond to half as much drug, 9.008 mg.",
        },
      ],
    },
    {
      id: "percent-purity",
      heading: "% purity from a direct titration",
      blocks: [
        {
          kind: "p",
          text: "Once you have the factor and the equivalence factor, a direct titration needs only one more line. The burette volume times f gives the volume of exactly nominal titrant that would have been used; times E gives the mass of drug that reacted; divided by the mass weighed gives the fraction pure.",
        },
        {
          kind: "formula",
          expr: "% purity = (V × f × E × 100) ÷ W",
          where: [
            { sym: "V", meaning: "titrant volume at the end point, mL" },
            { sym: "f", meaning: "standardisation factor of the titrant" },
            { sym: "E", meaning: "equivalence factor, mg per mL of nominal titrant" },
            { sym: "W", meaning: "mass of sample weighed, mg (the same mass unit as E)" },
          ],
          note: "If a portion of a larger solution is titrated, multiply by the dilution (total volume ÷ aliquot volume) as well.",
        },
        {
          kind: "example",
          title: "Direct titration assay",
          problem:
            "401.2 mg of the drug from the previous example (E = 18.016 mg per mL of 0.1 M NaOH) is dissolved and titrated with the NaOH standardised above (f = 1.0059). The end point is at 22.05 mL. Calculate the % purity.",
          steps: [
            "Volume of exactly 0.1 M NaOH equivalent = 22.05 × 1.0059 = 22.180 mL.",
            "Mass of drug titrated = 22.180 × 18.016 = 399.60 mg.",
            "% purity = 399.60 ÷ 401.2 × 100 = 99.60%.",
          ],
          answer: "99.6% (on the sample as weighed).",
          note: "Entering W as 0.4012 (grams) with E in milligrams gives 99 600%: a sure sign of a unit mismatch, not of an unusually pure sample.",
        },
      ],
    },
    {
      id: "back-titration",
      heading: "Back titration and the blank",
      blocks: [
        {
          kind: "p",
          text: "Some substances react too slowly, or are too insoluble, to titrate directly. Calcium carbonate is a classic case: it is dissolved in a measured excess of acid, and the acid left over is titrated with alkali. The drug's share is the acid that disappeared. Running a blank (the same volume of acid, no sample) and titrating it the same way gives the total acid in alkali units, so the difference between blank and sample is exactly what the sample consumed.",
        },
        {
          kind: "formula",
          expr: "% purity = [(V(blank) − V(sample)) × f × E × 100] ÷ W",
          where: [
            { sym: "V(blank)", meaning: "volume of back-titrant used for the blank, mL" },
            { sym: "V(sample)", meaning: "volume of back-titrant used for the sample, mL" },
            { sym: "f", meaning: "factor of the back-titrant" },
            { sym: "E", meaning: "mg of drug equivalent to 1 mL of nominal titrant" },
          ],
          note: "Because the blank and the sample receive the same volume of the excess reagent, its exact strength cancels out; only the back-titrant's factor is needed.",
        },
        {
          kind: "example",
          title: "Calcium carbonate by back titration",
          problem:
            "200.4 mg of calcium carbonate (MW 100.09; CaCO₃ + 2 HCl) is dissolved in 50.00 mL of about 0.1 M HCl. The excess acid needs 10.20 mL of 0.1 M NaOH (f = 1.000). A blank of 50.00 mL of the same acid needs 50.00 mL of the NaOH. Calculate the % purity.",
          steps: [
            "E = 0.1 mmol HCl per mL × ½ mol CaCO₃ per mol HCl × 100.09 mg/mmol = 5.0045 mg per mL.",
            "Volume consumed by the sample = 50.00 − 10.20 = 39.80 mL.",
            "Mass of CaCO₃ = 39.80 × 1.000 × 5.0045 = 199.18 mg.",
            "% purity = 199.18 ÷ 200.4 × 100 = 99.39%.",
          ],
          answer: "99.4%.",
        },
        {
          kind: "callout",
          tone: "note",
          title: "Where acceptance limits come from",
          text: "Whether 99.4% passes depends on the monograph for that substance, which sets its own limits and often states whether the result is calculated on the dried, anhydrous or 'as is' substance. Limits differ between substances and between pharmacopoeias, so there is no single range that applies to every assay. In a practical, use the limits in your manual and say where they came from.",
        },
      ],
    },
  ],
  mistakes: [
    "Using molarity where normality is needed, or the reverse, for a substance with an n-factor above 1.",
    "Taking the n-factor from the formula alone instead of from the reaction actually used (permanganate in acid versus alkaline solution, phosphoric acid to the first or third end point).",
    "Leaving out the standardisation factor, as if the titrant were exactly its nominal strength.",
    "Using a wrong mole ratio in the equivalence factor, which halves or doubles every result.",
    "Mixing mass units: E in mg per mL with W in grams, or the reverse.",
    "In a back titration, subtracting in the wrong order or forgetting the blank, so the result reflects the excess reagent rather than the drug.",
    "Forgetting the aliquot factor when only part of a made-up solution was titrated.",
    "Quoting a single purity range as if it applied to every substance, instead of the limit in the monograph.",
  ],
  practice: [
    {
      q: "What is the equivalent weight of sodium carbonate (MW 105.99) when it is titrated to carbon dioxide (n = 2)?",
      answer: "53.00 g/eq (52.995).",
      working: ["Equivalent weight = MW ÷ n = 105.99 ÷ 2 = 52.995 g/eq."],
    },
    {
      q: "2.650 g of sodium carbonate is dissolved and made up to 500.0 mL. What is its normality for titration to CO₂?",
      answer: "0.1000 N.",
      working: ["N = mass ÷ (equivalent weight × volume in L).", "N = 2.650 ÷ (52.995 × 0.5000) = 0.1000 N."],
    },
    {
      q: "What is the molarity of a 0.25 N phosphoric acid solution, if the normality refers to neutralisation of all three protons?",
      answer: "0.0833 M.",
      working: ["M = N ÷ n.", "M = 0.25 ÷ 3 = 0.0833 M."],
    },
    {
      q: "0.4084 g of KHP (MW 204.22, 1 : 1 with NaOH) needs 19.62 mL of a nominally 0.1 M NaOH solution. Find the actual molarity and the factor.",
      answer: "0.1019 M; f = 1.0193.",
      working: [
        "Moles of KHP = 0.4084 ÷ 204.22 = 0.0019998 mol.",
        "M = 0.0019998 ÷ 0.01962 L = 0.10193 M.",
        "f = 0.10193 ÷ 0.1 = 1.0193.",
      ],
    },
    {
      q: "A basic drug (MW 285.34) reacts 1 : 1 with hydrochloric acid. What mass of drug is equivalent to 1 mL of 0.1 M HCl?",
      answer: "28.53 mg per mL.",
      working: ["1 mL of 0.1 M HCl = 0.1 mmol HCl ≡ 0.1 mmol drug.", "E = 0.1 × 285.34 = 28.534 mg."],
    },
    {
      q: "250.2 mg of the monobasic acid from the worked example (E = 18.016 mg per mL of 0.1 M NaOH) needs 13.65 mL of NaOH with f = 1.012. Calculate the % purity.",
      answer: "99.47%.",
      working: [
        "Equivalent volume of exactly 0.1 M NaOH = 13.65 × 1.012 = 13.814 mL.",
        "Mass titrated = 13.814 × 18.016 = 248.87 mg.",
        "% purity = 248.87 ÷ 250.2 × 100 = 99.47%.",
      ],
    },
    {
      q: "185.0 mg of calcium carbonate is treated with an excess of about 0.1 M HCl and back titrated with 0.1 M NaOH (f = 0.985). The sample needs 12.35 mL and the blank needs 49.80 mL. Each mL of 0.1 M NaOH (via the acid) is equivalent to 5.0045 mg CaCO₃. Calculate the % purity.",
      answer: "99.79%.",
      working: [
        "Volume consumed by the sample = 49.80 − 12.35 = 37.45 mL.",
        "Corrected for the factor: 37.45 × 0.985 = 36.888 mL of exactly 0.1 M NaOH.",
        "Mass of CaCO₃ = 36.888 × 5.0045 = 184.61 mg.",
        "% purity = 184.61 ÷ 185.0 × 100 = 99.79%.",
      ],
    },
    {
      q: "3.161 g of KMnO₄ (MW 158.03) is made up to 1.000 L for use in acid solution (n = 5). What are its normality and molarity?",
      answer: "0.1000 N; 0.0200 M.",
      working: [
        "Equivalent weight = 158.03 ÷ 5 = 31.606 g/eq.",
        "N = 3.161 ÷ (31.606 × 1.000) = 0.1000 N.",
        "M = 3.161 ÷ 158.03 = 0.0200 M.",
      ],
    },
  ],
  limitations: [
    "All sample weights, burette readings and factors are invented for teaching. They are not results for any real batch or monograph assay.",
    "Only acid–base and simple redox examples are worked. Non-aqueous, complexometric, precipitation and iodometric titrations follow the same arithmetic but have their own chemistry, which is not covered.",
    "The end point is treated as exact. Indicator choice, end-point error and potentiometric detection are not discussed.",
    "Acceptance limits, drying or water corrections and the basis of calculation are set by each monograph and are deliberately not given here.",
  ],
  refs: ["beckettStenlake1", "harris10", "iupacGoldBook"],
  relatedTools: [
    {
      slug: "normality-calculator",
      name: "Normality Calculator",
      why: "Calculates normality from mass, volume and equivalent weight (or MW ÷ n-factor), and the mass needed for a target normality, with the same formulas as this guide. Check the n-factor it suggests against the reaction you are actually using.",
    },
  ],
  relatedGuides: ["dilution-and-concentration", "accuracy-precision-recovery", "beer-lambert-and-uv-spectrophotometry"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
