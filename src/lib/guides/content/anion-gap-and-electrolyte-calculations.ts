import { TEAM_AUTHOR } from "@/lib/content/governance";
import type { Guide } from "@/lib/guides/types";

/*
 * DRAFT. Every number below was recomputed in Python on 2026-10-13 with the
 * same formulas and constants as the four linked calculators (anion gap with
 * 2.5 × (4 − albumin); calcium + 0.8 × (4 − albumin); sodium + 0.016 ×
 * (glucose − 100); 2Na + glucose/18 + BUN/2.8 + ethanol/4.6). All laboratory
 * values are invented. Educational interpretation only — no treatment advice.
 *
 * Deliberately NOT linked: osmolality-calculators and osmolarity-calculators
 * (recorded fault: their serum osmolar gap is always 0; TPN factors 10× high).
 */

export const guide: Guide = {
  slug: "anion-gap-and-electrolyte-calculations",
  title: "Anion Gap, Osmolar Gap and Corrected Electrolytes",
  description:
    "Anion gap and its albumin correction, albumin-corrected calcium, glucose-corrected sodium, calculated osmolality and the osmolar gap, with unit conversions.",
  category: "Clinical Pharmacy",
  objectives: [
    "Calculate the anion gap from sodium, chloride and bicarbonate, and correct it for a low albumin.",
    "Calculate an albumin-corrected total calcium in mg/dL and in mmol/L.",
    "Calculate a glucose-corrected sodium and explain why two different factors are taught.",
    "Calculate serum osmolality from sodium, glucose and urea, and the osmolar gap from a measured value.",
    "Convert glucose, urea, calcium and albumin between conventional and SI units.",
    "Explain why every one of these figures is an estimate that is read against the laboratory's own reference interval.",
  ],
  intro: [
    "A routine biochemistry report lists a handful of measured values: sodium, potassium, chloride, bicarbonate, urea, glucose, calcium, albumin. A few simple calculations on those numbers reveal things none of them shows on its own — an unmeasured acid, an unmeasured solute such as an alcohol, or a calcium that only looks low because the protein that carries it is low.",
    "These calculations are short, and pharmacists meet them constantly in case discussions, ward rounds and clinical pharmacy examinations. Their traps are in the units (mg/dL versus mmol/L, urea versus blood urea nitrogen) and in treating an estimate as if it were a measurement.",
    "This guide is about the arithmetic and what each figure means. All laboratory values are invented, and the guide gives no treatment advice. Reference intervals and decision thresholds differ between laboratories and analysers; a real result is always read against the interval on the report that produced it and in the context of the whole patient.",
  ],
  terms: [
    { term: "Electroneutrality", definition: "In any body fluid the total positive charge equals the total negative charge. The anion gap relies on this." },
    { term: "Anion gap (AG)", definition: "Measured cations minus measured anions, usually Na⁺ − (Cl⁻ + HCO₃⁻). It estimates the anions that are not routinely measured." },
    { term: "Unmeasured anions", definition: "Negatively charged species not on the routine panel: mainly albumin, plus phosphate, sulfate and organic acids such as lactate and ketoacids." },
    { term: "Ionised calcium", definition: "The free, physiologically active fraction of plasma calcium. A large part of total calcium is bound to albumin." },
    { term: "Osmolality", definition: "Osmoles of solute per kilogram of water (mOsm/kg). It is what an osmometer measures in serum." },
    { term: "Osmolarity", definition: "Osmoles of solute per litre of solution (mOsm/L). It is what a formula calculates; the two are close in serum but not identical." },
    { term: "Osmolar gap", definition: "Measured osmolality minus calculated osmolality. A large gap suggests solutes in the blood that the formula does not include." },
    { term: "BUN", definition: "Blood urea nitrogen: urea expressed as the mass of its nitrogen, in mg/dL. Many laboratories report urea itself instead." },
  ],
  sections: [
    {
      id: "anion-gap",
      heading: "The anion gap",
      blocks: [
        {
          kind: "p",
          text: "Plasma is electrically neutral, but the routine panel measures only the main cation (sodium) and the two main anions (chloride and bicarbonate). Their difference is not zero; it is filled by negatively charged substances that are not measured, chiefly albumin. If an extra acid such as lactic acid or a ketoacid builds up, its hydrogen ions are buffered by bicarbonate, bicarbonate falls, and the acid's anion takes its place in the 'gap', which widens.",
        },
        {
          kind: "formula",
          expr: "AG = Na⁺ − (Cl⁻ + HCO₃⁻)",
          where: [
            { sym: "Na⁺, Cl⁻, HCO₃⁻", meaning: "serum concentrations, mmol/L (numerically the same as mEq/L for these monovalent ions)" },
            { sym: "AG", meaning: "anion gap, mmol/L" },
          ],
          note: "Some laboratories add potassium to the cations: AG = (Na⁺ + K⁺) − (Cl⁻ + HCO₃⁻). This gives a higher figure, so compare a result only with an interval calculated the same way.",
        },
        {
          kind: "example",
          title: "Calculating the anion gap",
          problem: "Na⁺ 140, Cl⁻ 104, HCO₃⁻ 24 and K⁺ 4.0 mmol/L. Calculate the anion gap with and without potassium.",
          steps: [
            "Without K⁺: AG = 140 − (104 + 24) = 140 − 128 = 12 mmol/L.",
            "With K⁺: AG = (140 + 4.0) − (104 + 24) = 16 mmol/L.",
          ],
          answer: "12 mmol/L without potassium; 16 mmol/L with it.",
          note: "The same blood gives two different 'anion gaps' depending on the formula, which is exactly why the formula must match the reference interval.",
        },
        {
          kind: "p",
          text: "Because albumin is the largest unmeasured anion, a low albumin lowers the anion gap and can hide an accumulating acid. A widely used correction adds about 2.5 mmol/L to the gap for each 1 g/dL that albumin falls below a reference value, commonly taken as 4.0 g/dL.",
        },
        {
          kind: "formula",
          expr: "Corrected AG = AG + 2.5 × (4.0 − albumin)",
          where: [
            { sym: "albumin", meaning: "serum albumin, g/dL (divide g/L by 10)" },
            { sym: "4.0", meaning: "the reference albumin assumed by the formula, g/dL; some sources use a different value" },
          ],
        },
        {
          kind: "example",
          title: "A gap hidden by low albumin",
          problem: "Na⁺ 140, Cl⁻ 108, HCO₃⁻ 22 mmol/L, albumin 2.0 g/dL. Calculate the anion gap and the albumin-corrected gap.",
          steps: [
            "AG = 140 − (108 + 22) = 10 mmol/L.",
            "Corrected AG = 10 + 2.5 × (4.0 − 2.0) = 10 + 5.0 = 15 mmol/L.",
          ],
          answer: "AG 10 mmol/L; corrected AG 15 mmol/L.",
          note: "The uncorrected value looks unremarkable; corrected for the low albumin, it is noticeably higher. The correction is an approximation derived from population data, not a measurement.",
        },
      ],
    },
    {
      id: "corrected-calcium",
      heading: "Albumin-corrected calcium",
      blocks: [
        {
          kind: "p",
          text: "Most laboratories report total calcium, which includes calcium bound to albumin. When albumin is low, total calcium falls even if the free, ionised calcium the body actually responds to is unchanged. The traditional correction adds back about 0.8 mg/dL of calcium for each 1 g/dL of albumin below 4.0 g/dL.",
        },
        {
          kind: "formula",
          expr: "Corrected Ca (mg/dL) = measured Ca (mg/dL) + 0.8 × [4.0 − albumin (g/dL)]",
          where: [
            { sym: "measured Ca", meaning: "total serum calcium, mg/dL" },
            { sym: "albumin", meaning: "serum albumin, g/dL" },
          ],
          note: "The SI equivalent is approximately corrected Ca (mmol/L) = Ca (mmol/L) + 0.02 × [40 − albumin (g/L)].",
        },
        {
          kind: "example",
          title: "Corrected calcium in conventional and SI units",
          problem:
            "(a) Total calcium 7.6 mg/dL, albumin 2.4 g/dL. (b) The same patient's results reported in SI units: calcium 1.90 mmol/L, albumin 24 g/L. Calculate the corrected calcium for each.",
          steps: [
            "(a) Corrected Ca = 7.6 + 0.8 × (4.0 − 2.4) = 7.6 + 1.28 = 8.88 mg/dL.",
            "(b) Convert first: 1.90 mmol/L ÷ 0.2495 = 7.62 mg/dL; 24 g/L ÷ 10 = 2.4 g/dL.",
            "Corrected Ca = 7.62 + 0.8 × 1.6 = 8.90 mg/dL, which is 8.90 × 0.2495 = 2.22 mmol/L.",
            "Check with the SI form: 1.90 + 0.02 × (40 − 24) = 1.90 + 0.32 = 2.22 mmol/L.",
          ],
          answer: "(a) 8.88 mg/dL; (b) 2.22 mmol/L (8.90 mg/dL).",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "An estimate, not a measurement",
          text: "Corrected calcium is derived from population averages and can disagree with a measured ionised calcium, especially in very sick patients, in kidney disease and with abnormal pH. Where the true calcium status matters, laboratories measure ionised calcium directly; many also print their own correction formula, which may differ from this one.",
        },
      ],
    },
    {
      id: "corrected-sodium",
      heading: "Glucose-corrected sodium",
      blocks: [
        {
          kind: "p",
          text: "Glucose is an effective osmole: when it is very high it draws water out of cells into the plasma, diluting the sodium. The measured sodium can therefore be low even though the body's sodium balance is not. The corrected sodium estimates what the sodium would be if the glucose were normal.",
        },
        {
          kind: "formula",
          expr: "Corrected Na⁺ = measured Na⁺ + 0.016 × (glucose − 100)",
          where: [
            { sym: "measured Na⁺", meaning: "serum sodium, mmol/L" },
            { sym: "glucose", meaning: "serum glucose, mg/dL (multiply mmol/L by 18)" },
            { sym: "0.016", meaning: "mmol/L of sodium per mg/dL of glucose: 1.6 mmol/L for each 100 mg/dL above 100" },
          ],
          note: "A later study (Hillier and colleagues) proposed 0.024 (2.4 per 100 mg/dL), particularly at very high glucose. Both factors are taught; state which one you used.",
        },
        {
          kind: "example",
          title: "Correcting sodium with both factors",
          problem: "Measured Na⁺ 128 mmol/L, glucose 600 mg/dL (33.3 mmol/L). Calculate the corrected sodium with each factor.",
          steps: [
            "Glucose above 100 = 600 − 100 = 500 mg/dL.",
            "With 0.016: 128 + 0.016 × 500 = 128 + 8.0 = 136.0 mmol/L.",
            "With 0.024: 128 + 0.024 × 500 = 128 + 12.0 = 140.0 mmol/L.",
          ],
          answer: "136 mmol/L (0.016) or 140 mmol/L (0.024).",
          note: "The measured sodium of 128 largely reflects the high glucose: both corrected values are much closer to the usual range. The two factors differ by 4 mmol/L here, and the gap widens as glucose rises.",
        },
      ],
    },
    {
      id: "osmolar-gap",
      heading: "Calculated osmolality and the osmolar gap",
      blocks: [
        {
          kind: "p",
          text: "Almost all the osmotic activity of serum comes from sodium with its accompanying anions, glucose and urea. Doubling sodium accounts for the anions; glucose and urea are converted from mass units to millimoles. An osmometer measures the true osmolality. If the measured value is clearly higher than the calculated one, something else is dissolved in the serum, and alcohols are the classic cause.",
        },
        {
          kind: "formula",
          expr: "Calculated osmolality = 2 × Na⁺ + glucose ÷ 18 + BUN ÷ 2.8     Osmolar gap = measured − calculated",
          where: [
            { sym: "Na⁺", meaning: "serum sodium, mmol/L" },
            { sym: "glucose", meaning: "mg/dL; ÷ 18 converts to mmol/L (MW 180, and 1 dL = 0.1 L)" },
            { sym: "BUN", meaning: "blood urea nitrogen, mg/dL; ÷ 2.8 converts to mmol/L (2 nitrogens × 14 = 28)" },
          ],
          note: "In SI units the formula is simply 2 × Na⁺ + glucose + urea, all in mmol/L. Several variants exist (some multiply sodium by 1.86, some add ethanol); compare a gap only with a threshold derived from the same formula.",
        },
        {
          kind: "table",
          caption: "Conversion factors used in these calculations",
          head: ["Analyte", "Conventional unit", "To mmol/L", "Basis"],
          rows: [
            ["Glucose", "mg/dL", "÷ 18", "MW 180.16 ÷ 10"],
            ["BUN (urea nitrogen)", "mg/dL", "÷ 2.8", "2 N × 14.0 = 28.0, ÷ 10"],
            ["Urea (whole molecule)", "mg/dL", "÷ 6.0", "MW 60.06 ÷ 10"],
            ["Calcium", "mg/dL", "× 0.2495 (÷ 4.008)", "Atomic weight 40.08 ÷ 10"],
            ["Ethanol", "mg/dL", "÷ 4.6", "MW 46.07 ÷ 10"],
            ["Albumin", "g/dL", "× 10 gives g/L", "Not converted to mmol/L in these formulas"],
          ],
        },
        {
          kind: "example",
          title: "A normal gap",
          problem: "Na⁺ 140 mmol/L, glucose 100 mg/dL, BUN 15 mg/dL, measured osmolality 290 mOsm/kg. Calculate the osmolality and the gap.",
          steps: [
            "2 × Na⁺ = 280.",
            "Glucose term = 100 ÷ 18 = 5.56.",
            "BUN term = 15 ÷ 2.8 = 5.36.",
            "Calculated = 280 + 5.56 + 5.36 = 290.9 mOsm/kg.",
            "Gap = 290 − 290.9 = −0.9 mOsm/kg.",
          ],
          answer: "Calculated 290.9; gap about −1 mOsm/kg.",
          note: "A small negative gap is ordinary: the formula is an estimate and the measurement has its own error.",
        },
        {
          kind: "example",
          title: "A gap explained by ethanol",
          problem:
            "Same sodium, glucose and BUN as above, but the measured osmolality is 320 mOsm/kg and the blood ethanol is 150 mg/dL. Calculate the gap without and with an ethanol term.",
          steps: [
            "Without ethanol: gap = 320 − 290.9 = 29.1 mOsm/kg.",
            "Ethanol term = 150 ÷ 4.6 = 32.6 mOsm/kg.",
            "With ethanol: calculated = 290.9 + 32.6 = 323.5; gap = 320 − 323.5 = −3.5 mOsm/kg.",
          ],
          answer: "29.1 mOsm/kg without ethanol; −3.5 mOsm/kg once ethanol is included.",
          note: "The measured ethanol accounts for the whole gap. Had the gap stayed large after adding ethanol, another unmeasured solute would need to be considered.",
        },
      ],
    },
    {
      id: "reading-results",
      heading: "Reading the results responsibly",
      blocks: [
        {
          kind: "list",
          items: [
            "Each figure here is derived from other measurements, so it carries their errors added together. Small differences from a threshold mean little.",
            "Reference intervals for the anion gap vary noticeably between analysers and laboratories, partly because methods measure chloride and bicarbonate differently. Use the interval of the laboratory that reported the electrolytes.",
            "Formula variants (with or without potassium, 0.016 or 0.024, different osmolality equations) give different numbers from the same blood. Always state the formula you used.",
            "A calculation can suggest a question to ask; it cannot diagnose. Interpretation belongs to the clinical team with the whole picture in front of them.",
          ],
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Educational use only",
          text: "This guide teaches how the figures are calculated and what they represent. It is not a guide to diagnosing or treating any patient, and none of its examples describes a real case.",
        },
      ],
    },
  ],
  mistakes: [
    "Using urea in mg/dL as if it were BUN. Urea mg/dL ÷ 6.0 gives mmol/L; BUN mg/dL ÷ 2.8 gives mmol/L. Mixing them roughly doubles or halves the urea term.",
    "Putting glucose in mmol/L into a formula that expects mg/dL (or the reverse), for sodium correction or osmolality.",
    "Using albumin in g/L in a formula written for g/dL, which makes the correction ten times too large.",
    "Comparing an anion gap calculated with potassium against an interval calculated without it, or the reverse.",
    "Forgetting the albumin correction when albumin is low, so a raised gap is missed.",
    "Treating corrected calcium as if it were a measured ionised calcium.",
    "Mixing the 0.016 and 0.024 sodium factors, or not stating which was used.",
    "Reading an osmolar gap without considering ethanol, which is a common cause of a raised gap and is not in the basic formula.",
  ],
  practice: [
    {
      q: "Na⁺ 136, Cl⁻ 100, HCO₃⁻ 26 mmol/L. What is the anion gap (without potassium)?",
      answer: "10 mmol/L.",
      working: ["AG = 136 − (100 + 26) = 136 − 126 = 10 mmol/L."],
    },
    {
      q: "Na⁺ 138, Cl⁻ 112, HCO₃⁻ 16 mmol/L, albumin 3.0 g/dL. Calculate the anion gap and the albumin-corrected gap.",
      answer: "AG 10 mmol/L; corrected 12.5 mmol/L.",
      working: ["AG = 138 − (112 + 16) = 10 mmol/L.", "Corrected AG = 10 + 2.5 × (4.0 − 3.0) = 12.5 mmol/L."],
    },
    {
      q: "Total calcium 8.0 mg/dL, albumin 3.0 g/dL. Calculate the albumin-corrected calcium.",
      answer: "8.8 mg/dL.",
      working: ["Corrected Ca = 8.0 + 0.8 × (4.0 − 3.0) = 8.0 + 0.8 = 8.8 mg/dL."],
    },
    {
      q: "Calcium 2.05 mmol/L and albumin 30 g/L. Calculate the corrected calcium in mmol/L by converting to conventional units.",
      answer: "About 2.25 mmol/L (9.02 mg/dL).",
      working: [
        "Ca = 2.05 ÷ 0.2495 = 8.22 mg/dL; albumin = 30 ÷ 10 = 3.0 g/dL.",
        "Corrected Ca = 8.22 + 0.8 × (4.0 − 3.0) = 9.02 mg/dL.",
        "In SI: 9.02 × 0.2495 = 2.25 mmol/L (the SI form, 2.05 + 0.02 × 10, gives the same 2.25).",
      ],
    },
    {
      q: "Measured Na⁺ 132 mmol/L, glucose 400 mg/dL. Calculate the corrected sodium with 0.016 and with 0.024.",
      answer: "136.8 mmol/L (0.016); 139.2 mmol/L (0.024).",
      working: [
        "Glucose above 100 = 300 mg/dL.",
        "0.016: 132 + 0.016 × 300 = 132 + 4.8 = 136.8 mmol/L.",
        "0.024: 132 + 0.024 × 300 = 132 + 7.2 = 139.2 mmol/L.",
      ],
    },
    {
      q: "Na⁺ 138 mmol/L, glucose 95 mg/dL, BUN 12 mg/dL, measured osmolality 340 mOsm/kg, no ethanol detected. Calculate the osmolality and the osmolar gap.",
      answer: "Calculated 285.6 mOsm/kg; gap 54.4 mOsm/kg.",
      working: [
        "2 × 138 = 276; glucose term 95 ÷ 18 = 5.28; BUN term 12 ÷ 2.8 = 4.29.",
        "Calculated = 276 + 5.28 + 4.29 = 285.6 mOsm/kg.",
        "Gap = 340 − 285.6 = 54.4 mOsm/kg: a large gap, pointing to an unmeasured solute that the formula does not include.",
      ],
    },
    {
      q: "In SI units: Na⁺ 142, glucose 5.0 and urea 6.0 mmol/L; measured osmolality 301 mOsm/kg. Calculate the osmolality and the gap.",
      answer: "Calculated 295 mOsm/kg; gap 6 mOsm/kg.",
      working: ["Calculated = 2 × 142 + 5.0 + 6.0 = 295 mOsm/kg.", "Gap = 301 − 295 = 6 mOsm/kg."],
    },
    {
      q: "A blood ethanol of 230 mg/dL is measured. How much does it add to the calculated osmolality?",
      answer: "About 50 mOsm/kg.",
      working: ["Ethanol term = 230 ÷ 4.6 = 50 mOsm/kg."],
    },
  ],
  limitations: [
    "All laboratory values are invented for teaching. Nothing here is advice on diagnosing, monitoring or treating any patient.",
    "Reference intervals and thresholds are deliberately not given as rules; they differ between laboratories, analysers and formulas.",
    "Each correction (2.5 for albumin, 0.8 for calcium, 0.016 or 0.024 for sodium, 4.6 for ethanol) is an empirical approximation, and other values appear in the literature.",
    "Acid–base analysis beyond the anion gap (blood gases, the delta ratio, compensation) and the causes of each abnormality are outside the scope of this guide.",
  ],
  refs: ["uspOsmolality", "bipmSI"],
  relatedTools: [
    {
      slug: "anion-gap-calculator",
      name: "Anion Gap Calculator",
      why: "Calculates Na⁺ − (Cl⁻ + HCO₃⁻) with the optional 2.5 × (4 − albumin) correction used here. Its interpretation bands are fixed (6 and 12 mmol/L); read your result against your laboratory's own interval instead.",
    },
    {
      slug: "corrected-calcium-calculator",
      name: "Corrected Calcium Calculator",
      why: "Applies Ca + 0.8 × (4 − albumin), converting mmol/L calcium and g/L albumin first, exactly as in the worked example.",
    },
    {
      slug: "sodium-correction-calculator",
      name: "Sodium Correction Calculator",
      why: "Applies the 0.016 factor to glucose in mg/dL or mmol/L (× 18). It does not offer 0.024, so work that one by hand.",
    },
    {
      slug: "osmolar-gap-calculator",
      name: "Osmolar Gap Calculator",
      why: "Calculates 2Na⁺ + glucose ÷ 18 + BUN ÷ 2.8, with an optional ethanol ÷ 4.6 term, and the gap from a measured osmolality. Enter BUN, not urea.",
    },
  ],
  relatedGuides: ["dilution-and-concentration", "dose-calculations"],
  meta: {
    author: TEAM_AUTHOR,
    review: { status: "draft" },
    updated: "2026-10-13",
  },
};
