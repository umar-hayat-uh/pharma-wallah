import type { Guide } from "@/lib/guides/types";
import { TEAM_AUTHOR } from "@/lib/content/governance";

/**
 * DRAFT (2026-10-13). Every number in this guide was recomputed in Python
 * before it was written here. The patients are invented. The guide teaches how
 * the estimates are calculated and why they differ; it deliberately gives no
 * drug-dosing advice.
 *
 * Reviewer note: the CKD-EPI 2021 and MDRD equations are taught here but their
 * primary papers are not yet in src/lib/content/references.ts — see
 * content/briefs/renal-function-estimation.md, "Sources a reviewer must supply".
 */
export const guide: Guide = {
  slug: "renal-function-estimation",
  title: "Estimating Renal Function: Creatinine Clearance, eGFR and Why They Differ",
  description:
    "How to calculate creatinine clearance (measured and Cockcroft–Gault) and eGFR (CKD-EPI 2021, MDRD), what each one estimates, and why the numbers disagree.",
  category: "Clinical & Hospital Pharmacy",
  objectives: [
    "Explain what glomerular filtration rate (GFR) is and why serum creatinine is used to estimate it.",
    "Calculate a measured creatinine clearance from a timed urine collection.",
    "Calculate an estimated creatinine clearance with the Cockcroft–Gault equation, including unit conversion of serum creatinine.",
    "Calculate eGFR with the CKD-EPI 2021 equation and the MDRD equation, and convert an indexed eGFR to mL/min for an individual.",
    "Explain why Cockcroft–Gault and eGFR give different numbers for the same patient, especially in older, lighter patients.",
  ],
  intro: [
    "Many drugs leave the body through the kidneys, so pharmacists constantly need a number that describes how well a patient's kidneys are working. The true measure is the glomerular filtration rate (GFR): the volume of plasma filtered by all the glomeruli per minute. Measuring GFR directly needs an injected marker and timed samples, so in everyday practice it is estimated from serum creatinine.",
    "Two families of estimates are in common use. Creatinine clearance (CrCl), measured from a urine collection or estimated with the Cockcroft–Gault equation, gives mL/min for that patient. Estimated GFR (eGFR), from equations such as CKD-EPI 2021 and MDRD, gives mL/min per 1.73 m² of body surface area and is what laboratories usually report. They are not the same quantity, and for some patients they differ widely.",
    "This guide shows how to calculate each estimate and explains why they disagree. It is educational. Which estimate to use for a particular drug, and what dose to give, is decided from that drug's validated references and product information and by clinical judgement — not from this guide.",
  ],
  terms: [
    {
      term: "Glomerular filtration rate (GFR)",
      definition: "The volume of plasma filtered by the glomeruli per unit time, in mL/min. The best overall index of kidney function.",
    },
    {
      term: "Creatinine",
      definition: "A breakdown product of creatine in muscle, produced at a fairly steady rate, filtered freely and also partly secreted by the tubules. Its serum level rises as GFR falls.",
    },
    {
      term: "Serum creatinine (Scr)",
      definition: "Creatinine concentration in serum. Reported in mg/dL or µmol/L; 1 mg/dL = 88.4 µmol/L.",
    },
    {
      term: "Creatinine clearance (CrCl)",
      definition: "The volume of plasma cleared of creatinine per minute (mL/min). Because some creatinine is secreted, it somewhat overestimates true GFR.",
    },
    {
      term: "Cockcroft–Gault equation",
      definition: "A 1976 equation that estimates CrCl in mL/min from age, body weight, sex and serum creatinine.",
    },
    {
      term: "eGFR",
      definition: "Estimated GFR from an equation using serum creatinine, age and sex (and sometimes other markers), reported per 1.73 m² of body surface area.",
    },
    {
      term: "Indexed vs non-indexed",
      definition: "An indexed value (mL/min/1.73 m²) is scaled to a standard body size so patients can be compared. A non-indexed value (mL/min) describes the individual's actual kidneys.",
    },
    {
      term: "Body surface area (BSA)",
      definition: "An estimate of body size in m². The Mosteller formula is BSA = √(height in cm × weight in kg / 3600).",
    },
    {
      term: "Steady-state creatinine",
      definition: "A creatinine level that is stable over days. All the estimating equations assume it; they are unreliable while kidney function is changing quickly.",
    },
  ],
  sections: [
    {
      id: "why-creatinine",
      heading: "Why creatinine is used — and its weak points",
      blocks: [
        {
          kind: "p",
          text: "Creatinine is made by muscle at a roughly constant rate and removed almost entirely by the kidneys. When filtration falls, creatinine is removed more slowly and its serum level rises until production and removal balance again at a higher level. So serum creatinine moves in the opposite direction to GFR.",
        },
        {
          kind: "p",
          text: "The relationship is inverse and curved, not straight: halving GFR roughly doubles a stable serum creatinine. This means a small rise in creatinine from a low value (say 0.6 to 0.9 mg/dL) can represent a large loss of filtration, while the same 0.3 mg/dL rise from a high value represents much less.",
        },
        {
          kind: "list",
          items: [
            "Muscle mass: an older, frail or amputated patient makes less creatinine, so a 'normal-looking' level can hide reduced function. A very muscular patient can have a high level with normal kidneys.",
            "Tubular secretion: some creatinine is secreted as well as filtered, so creatinine clearance is higher than true GFR, more so as kidney function declines.",
            "Diet and some drugs can change creatinine production or secretion without changing GFR.",
            "Changing function: in acute kidney injury creatinine lags behind the true GFR; no equation based on one creatinine value is valid then.",
          ],
        },
      ],
    },
    {
      id: "measured-crcl",
      heading: "Measured creatinine clearance from a urine collection",
      blocks: [
        {
          kind: "p",
          text: "Creatinine clearance can be measured with a timed urine collection (usually 24 hours) and one serum creatinine. It applies the general clearance idea: the amount excreted per minute divided by the plasma concentration.",
        },
        {
          kind: "formula",
          expr: "CrCl = (Ucr × V) / (Scr × t)",
          where: [
            { sym: "CrCl", meaning: "creatinine clearance (mL/min)" },
            { sym: "Ucr", meaning: "urine creatinine concentration (mg/dL)" },
            { sym: "V", meaning: "urine volume collected (mL)" },
            { sym: "Scr", meaning: "serum creatinine (mg/dL, same unit as Ucr)" },
            { sym: "t", meaning: "collection time (min); 24 h = 1440 min" },
          ],
          note: "Ucr and Scr must be in the same unit so that they cancel. An incomplete collection — the commonest error — makes CrCl falsely low.",
        },
        {
          kind: "example",
          title: "A 24-hour collection",
          problem: "A patient collects 1440 mL of urine in 24 h. Urine creatinine is 90 mg/dL and serum creatinine 1.2 mg/dL. Calculate CrCl.",
          steps: [
            "t = 24 h × 60 = 1440 min.",
            "CrCl = (Ucr × V) / (Scr × t) = (90 × 1440) ÷ (1.2 × 1440).",
            "CrCl = 129 600 ÷ 1728 = 75.0 mL/min.",
          ],
          answer: "CrCl = 75 mL/min.",
        },
      ],
    },
    {
      id: "cockcroft-gault",
      heading: "Estimated creatinine clearance: the Cockcroft–Gault equation",
      blocks: [
        {
          kind: "p",
          text: "Cockcroft and Gault derived an equation that estimates creatinine clearance without a urine collection. Its logic is visible in its terms: creatinine production falls with age and rises with body weight (a proxy for muscle mass), and is lower in women.",
        },
        {
          kind: "formula",
          expr: "CrCl (mL/min) = [(140 − age) × weight] / (72 × Scr)     × 0.85 if female",
          where: [
            { sym: "age", meaning: "age in years" },
            { sym: "weight", meaning: "body weight in kg" },
            { sym: "Scr", meaning: "serum creatinine in mg/dL" },
          ],
          note: "If creatinine is reported in µmol/L, divide by 88.4 first to get mg/dL. The result is not indexed to body surface area.",
        },
        {
          kind: "example",
          title: "Cockcroft–Gault for a 60-year-old man",
          problem: "A man aged 60 years weighs 72 kg. His serum creatinine is 1.1 mg/dL. Estimate his CrCl.",
          steps: [
            "(140 − 60) × 72 = 80 × 72 = 5760.",
            "72 × 1.1 = 79.2.",
            "CrCl = 5760 ÷ 79.2 = 72.7 mL/min.",
          ],
          answer: "Estimated CrCl ≈ 72.7 mL/min.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Which weight?",
          text: "Cockcroft–Gault was published with body weight, but for patients who are obese, very thin or oedematous, references and institutions differ on whether to use actual, ideal or adjusted body weight. The choice can change the result substantially. Follow the reference used for the drug in question.",
        },
        {
          kind: "example",
          title: "Converting serum creatinine units",
          problem: "A laboratory reports serum creatinine as 97 µmol/L. Convert it for use in the Cockcroft–Gault equation.",
          steps: ["Scr (mg/dL) = Scr (µmol/L) ÷ 88.4.", "97 ÷ 88.4 = 1.097 mg/dL."],
          answer: "Scr ≈ 1.10 mg/dL.",
          note: "Putting 97 straight into the equation would give a CrCl about 88 times too low.",
        },
      ],
    },
    {
      id: "egfr",
      heading: "eGFR: the CKD-EPI 2021 and MDRD equations",
      blocks: [
        {
          kind: "p",
          text: "The eGFR equations were built to estimate measured GFR (not creatinine clearance) and to classify chronic kidney disease. They use serum creatinine, age and sex, and give a result already scaled to a standard body surface area of 1.73 m². The CKD-EPI 2021 equation is the race-free version; the older MDRD equation is still met in textbooks and older reports.",
        },
        {
          kind: "formula",
          expr: "CKD-EPI 2021: eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(−1.200) × 0.9938^age × 1.012 (if female)",
          where: [
            { sym: "eGFR", meaning: "estimated GFR (mL/min/1.73 m²)" },
            { sym: "Scr", meaning: "serum creatinine (mg/dL)" },
            { sym: "κ", meaning: "0.7 for women, 0.9 for men" },
            { sym: "α", meaning: "−0.241 for women, −0.302 for men" },
            { sym: "min(x, 1), max(x, 1)", meaning: "the smaller / larger of x and 1, so only one of the two creatinine terms differs from 1" },
          ],
        },
        {
          kind: "formula",
          expr: "MDRD: eGFR = 175 × Scr^(−1.154) × age^(−0.203) × 0.742 (if female)",
          note: "The original MDRD equation also contained a race coefficient. The race-free CKD-EPI 2021 equation was introduced partly to remove race from GFR estimation.",
        },
        {
          kind: "example",
          title: "CKD-EPI 2021 for the same 60-year-old man",
          problem: "Use the man from the Cockcroft–Gault example (60 years, serum creatinine 1.1 mg/dL). Calculate his eGFR by CKD-EPI 2021.",
          steps: [
            "Male: κ = 0.9, α = −0.302. Scr/κ = 1.1 ÷ 0.9 = 1.222.",
            "min(1.222, 1) = 1, so the α term is 1. max(1.222, 1) = 1.222, and 1.222^(−1.200) = 0.7860.",
            "Age term: 0.9938^60 = 0.6886.",
            "eGFR = 142 × 1 × 0.7860 × 0.6886 = 76.9 mL/min/1.73 m².",
            "For comparison, MDRD gives 175 × 1.1^(−1.154) × 60^(−0.203) = 68.3 mL/min/1.73 m².",
          ],
          answer: "eGFR (CKD-EPI 2021) ≈ 76.9 mL/min/1.73 m²; Cockcroft–Gault CrCl ≈ 72.7 mL/min.",
          note: "For a middle-aged man of average size the two families agree reasonably well.",
        },
        {
          kind: "formula",
          expr: "Non-indexed GFR (mL/min) = eGFR (mL/min/1.73 m²) × BSA / 1.73          BSA = √(height × weight / 3600)",
          where: [
            { sym: "BSA", meaning: "body surface area (m²), Mosteller formula" },
            { sym: "height", meaning: "cm" },
            { sym: "weight", meaning: "kg" },
          ],
          note: "Removing the 1.73 m² scaling converts the laboratory's eGFR into a figure for this patient's actual body size.",
        },
      ],
    },
    {
      id: "why-differ",
      heading: "Why Cockcroft–Gault and eGFR give different answers",
      blocks: [
        {
          kind: "p",
          text: "The two families answer different questions with different inputs, so it is not surprising that they disagree. The differences are largest at the extremes: the very old, the very small, the very large and the very muscular.",
        },
        {
          kind: "table",
          caption: "How the two families of estimates differ",
          head: ["Feature", "Cockcroft–Gault", "eGFR (CKD-EPI 2021, MDRD)"],
          rows: [
            ["What it estimates", "Creatinine clearance", "Glomerular filtration rate"],
            ["Units", "mL/min", "mL/min/1.73 m²"],
            ["Body size", "Includes weight", "No weight; scaled to 1.73 m²"],
            ["Age effect", "Linear: (140 − age)", "Exponential: 0.9938^age (CKD-EPI) or age^(−0.203) (MDRD)"],
            ["Typical use", "Many older drug-dosing studies", "CKD detection and staging; laboratory reports"],
          ],
        },
        {
          kind: "example",
          title: "An 85-year-old, 48 kg woman",
          problem:
            "An 85-year-old woman weighs 48 kg and is 155 cm tall. Serum creatinine is 1.0 mg/dL. Calculate her Cockcroft–Gault CrCl, her CKD-EPI 2021 eGFR, and the eGFR converted to mL/min.",
          steps: [
            "Cockcroft–Gault: (140 − 85) × 48 ÷ (72 × 1.0) × 0.85 = 2640 ÷ 72 × 0.85 = 31.2 mL/min.",
            "CKD-EPI 2021, female: κ = 0.7, Scr/κ = 1.0 ÷ 0.7 = 1.429; max term = 1.429^(−1.200) = 0.6518; min term = 1.",
            "Age term: 0.9938^85 = 0.5894.",
            "eGFR = 142 × 0.6518 × 0.5894 × 1.012 = 55.2 mL/min/1.73 m².",
            "BSA = √(155 × 48 ÷ 3600) = √2.067 = 1.438 m².",
            "Non-indexed eGFR = 55.2 × 1.438 ÷ 1.73 = 45.9 mL/min.",
          ],
          answer: "CrCl ≈ 31 mL/min; eGFR ≈ 55 mL/min/1.73 m² (≈ 46 mL/min for her body size).",
          note: "The same blood test puts her near 31 by one method and 55 by another. Converting eGFR to mL/min narrows the gap but does not close it, because the two equations also treat age differently.",
        },
        {
          kind: "p",
          text: "Three effects produce the gap in that example. First, her small body: Cockcroft–Gault uses her 48 kg directly, while the eGFR is scaled to a 1.73 m² adult. Second, age: (140 − age) falls proportionally faster at old age than 0.9938^age does. Third, the equations were developed in different populations with different creatinine assays — Cockcroft–Gault predates the standardised creatinine methods that the modern eGFR equations assume.",
        },
        {
          kind: "callout",
          tone: "caution",
          title: "Not a dosing guide",
          text: "Because the estimates differ, a renal dose band from one cannot simply be applied to a number from the other. Which estimate a drug's dosing information is based on, and what dose follows, must be checked in validated, drug-specific references and decided with clinical judgement.",
        },
      ],
    },
  ],
  mistakes: [
    "Entering serum creatinine in µmol/L into an equation written for mg/dL. Divide µmol/L by 88.4 first.",
    "Treating eGFR (mL/min/1.73 m²) and CrCl (mL/min) as the same number. They estimate different quantities in different units.",
    "Forgetting the 0.85 factor for women in Cockcroft–Gault, or the female terms (κ, α and 1.012) in CKD-EPI 2021.",
    "Using a single creatinine value when kidney function is changing quickly (for example acute kidney injury). The equations assume a stable creatinine.",
    "Reading a 'normal' creatinine in a frail elderly patient as normal kidney function. Low muscle mass lowers creatinine production.",
    "Using a 24-hour urine collection without checking it was complete. A missed void makes CrCl falsely low.",
    "Applying adult equations to children. Paediatric estimates use different equations.",
    "Rounding serum creatinine heavily before calculation. Because the relationship is curved, small changes at low values move the estimate a lot.",
  ],
  practice: [
    {
      q: "A serum creatinine is reported as 132.6 µmol/L. What is it in mg/dL?",
      answer: "1.5 mg/dL",
      working: ["Scr (mg/dL) = 132.6 ÷ 88.4.", "= 1.50 mg/dL."],
    },
    {
      q: "Estimate CrCl by Cockcroft–Gault for a 45-year-old man weighing 80 kg with serum creatinine 1.2 mg/dL.",
      answer: "≈ 88.0 mL/min",
      working: ["(140 − 45) × 80 = 95 × 80 = 7600.", "72 × 1.2 = 86.4.", "CrCl = 7600 ÷ 86.4 = 87.96 mL/min."],
    },
    {
      q: "Estimate CrCl by Cockcroft–Gault for a 70-year-old woman weighing 60 kg with serum creatinine 0.9 mg/dL.",
      answer: "≈ 55.1 mL/min",
      working: [
        "(140 − 70) × 60 = 4200.",
        "72 × 0.9 = 64.8; 4200 ÷ 64.8 = 64.81 mL/min.",
        "× 0.85 for a woman = 55.09 mL/min.",
      ],
    },
    {
      q: "A 24-hour urine collection gives 1800 mL with creatinine 120 mg/dL. Serum creatinine is 1.5 mg/dL. Calculate the measured CrCl.",
      answer: "100 mL/min",
      working: ["t = 1440 min.", "CrCl = (120 × 1800) ÷ (1.5 × 1440) = 216 000 ÷ 2160 = 100 mL/min."],
    },
    {
      q: "Calculate the CKD-EPI 2021 eGFR for a 50-year-old woman with serum creatinine 0.6 mg/dL.",
      answer: "≈ 109 mL/min/1.73 m²",
      working: [
        "Female: κ = 0.7, α = −0.241. Scr/κ = 0.6 ÷ 0.7 = 0.857, which is below 1.",
        "min term = 0.857^(−0.241) = 1.0378; max term = 1.",
        "Age term = 0.9938^50 = 0.7327.",
        "eGFR = 142 × 1.0378 × 0.7327 × 1.012 = 109.3 mL/min/1.73 m².",
      ],
    },
    {
      q: "Calculate the CKD-EPI 2021 eGFR for a 70-year-old man with serum creatinine 2.0 mg/dL.",
      answer: "≈ 35.2 mL/min/1.73 m²",
      working: [
        "Male: κ = 0.9. Scr/κ = 2.0 ÷ 0.9 = 2.222.",
        "min term = 1; max term = 2.222^(−1.200) = 0.3836.",
        "Age term = 0.9938^70 = 0.6470.",
        "eGFR = 142 × 0.3836 × 0.6470 = 35.2 mL/min/1.73 m².",
      ],
    },
    {
      q: "A laboratory reports eGFR = 60 mL/min/1.73 m² for a patient with BSA 1.5 m². What is the non-indexed GFR?",
      answer: "≈ 52.0 mL/min",
      working: ["Non-indexed = eGFR × BSA ÷ 1.73.", "= 60 × 1.5 ÷ 1.73 = 52.0 mL/min."],
    },
    {
      q: "Calculate the MDRD eGFR for a 60-year-old man with serum creatinine 1.5 mg/dL.",
      answer: "≈ 47.7 mL/min/1.73 m²",
      working: [
        "1.5^(−1.154) = 0.6263.",
        "60^(−0.203) = 0.4355.",
        "eGFR = 175 × 0.6263 × 0.4355 = 47.7 mL/min/1.73 m².",
      ],
    },
  ],
  limitations: [
    "Every creatinine-based equation assumes stable kidney function and average creatinine production for the patient's age and sex. Extremes of muscle mass, amputation, malnutrition, pregnancy and acute illness make them unreliable.",
    "The equations here are for adults. Children, and some special populations, need different equations.",
    "Cystatin C-based equations and directly measured GFR exist for situations where creatinine misleads; they are not covered here.",
    "This guide does not give drug doses. Renal dose adjustment uses the drug's validated references and product information, the estimate those were based on, and clinical judgement.",
  ],
  refs: ["cockcroftGault1976", "mosteller1987", "shargel8", "rowland5"],
  relatedTools: [
    {
      slug: "gfr-calculator",
      name: "GFR Calculator",
      why: "Calculates eGFR with the CKD-EPI 2021 equation (κ, α, 0.9938^age, 1.012 for women) and the MDRD equation exactly as written in this guide.",
    },
  ],
  relatedGuides: ["pharmacokinetic-parameters", "dose-calculations", "multiple-dosing-and-steady-state"],
  meta: { author: TEAM_AUTHOR, review: { status: "draft" }, updated: "2026-10-13" },
};
