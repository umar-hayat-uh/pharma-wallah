/**
 * Every source PharmaWallah's educational pages may cite, in one place.
 *
 * Pages cite by id (`refs: ["shargel8", "ichQ1E"]`), never by free text, so a
 * citation cannot be invented inline: an id that is not in this table fails the
 * type-check. Add a source here only after checking its edition, year and
 * publisher against the publisher's own listing or the issuing body's site, and
 * record how in `checked` — that line is what a reviewer reads before trusting
 * it (see docs/content-review-policy.md).
 *
 * A `url` is given only where the address is the issuing body's own and stable.
 * Textbooks carry no URL: a retailer link is not a source, and a page number we
 * have not opened ourselves is not given at all.
 *
 * Plain data, no "use client": imported by server pages, client calculators and
 * the offline apps alike.
 */

export type Reference = {
  /** Vancouver-style citation as printed on the page. */
  citation: string;
  url?: string;
  /** What the source supports on our pages, in a few words. */
  supports: string;
  /** How and when the bibliographic details were confirmed. Not printed. */
  checked: string;
};

export const REFERENCES = {
  // ── Textbooks ───────────────────────────────────────────────────────────
  shargel8: {
    citation:
      "Ducharme MP, Shargel L, editors. Shargel and Yu's Applied Biopharmaceutics & Pharmacokinetics. 8th ed. New York: McGraw Hill; 2022.",
    supports: "Pharmacokinetic parameters: kₑ, t½, clearance, volume of distribution, AUC, bioavailability, dosing.",
    checked: "2026-10-12, McGraw Hill Professional product listing (ISBN 9781260142990).",
  },
  rowland5: {
    citation:
      "Rowland and Tozer's Clinical Pharmacokinetics and Pharmacodynamics: Concepts and Applications. 5th ed. Philadelphia: Wolters Kluwer; 2019.",
    supports: "Clearance, volume, half-life, accumulation and loading/maintenance dose concepts.",
    checked: "2026-10-12, publisher (LWW) listing and library catalogues; 5th edition, 2019.",
  },
  martin8: {
    citation:
      "Sinko PJ, editor. Martin's Physical Pharmacy and Pharmaceutical Sciences. 8th ed. Philadelphia: Wolters Kluwer; 2023.",
    supports: "Reaction kinetics and drug stability, solutions and concentration, isotonicity, dissolution, micromeritics.",
    checked: "2026-10-12, LWW listing (ISBN 9781975174835, February 2023).",
  },
  aulton6: {
    citation:
      "Aulton ME, Taylor KMG, editors. Aulton's Pharmaceutics: The Design and Manufacture of Medicines. 6th ed. Edinburgh: Elsevier; 2022.",
    supports: "Dissolution, powder flow, dosage-form design and pharmaceutical calculations in context.",
    checked: "2026-10-12, Elsevier Health listing (ISBN 9780702081545; copyright 2022, published May 2021).",
  },
  ansel16: {
    citation:
      "Stockton SJ. Stoklosa and Ansel's Pharmaceutical Calculations. 16th ed. Philadelphia: Wolters Kluwer; 2021.",
    supports: "Dilution, percentage strength, ratio strength, dose and infusion-rate calculations, isotonicity (NaCl equivalents).",
    checked: "2026-10-12, library catalogue and publisher history (16th edition renamed 'Stoklosa and Ansel's', 2021).",
  },
  connors: {
    citation:
      "Connors KA, Amidon GL, Stella VJ. Chemical Stability of Pharmaceuticals: A Handbook for Pharmacists. 2nd ed. New York: Wiley; 1986.",
    supports: "Zero-, first- and second-order kinetics applied to drug degradation; shelf-life estimation.",
    checked: "Standard citation of the 2nd edition (Wiley, 1986); edition and year are the ones the book is cited under.",
  },
  gibaldi: {
    citation: "Gibaldi M, Perrier D. Pharmacokinetics. 2nd ed. New York: Marcel Dekker; 1982.",
    supports: "Compartmental pharmacokinetics, AUC by the trapezoidal rule, moment analysis.",
    checked: "Standard citation of the 2nd edition (Marcel Dekker, 1982).",
  },

  harris10: {
    citation: "Harris DC, Lucy CA. Quantitative Chemical Analysis. 10th ed. New York: W. H. Freeman (Macmillan Learning); 2019.",
    supports: "Least-squares calibration, residuals, mean/standard deviation, systematic vs random error, Beer–Lambert law.",
    checked: "2026-10-12, university bookstore listing of the 10th edition (W. H. Freeman, publication date 13 December 2019; Lucy added as co-author).",
  },

  vogel5: {
    citation:
      "Furniss BS, Hannaford AJ, Smith PWG, Tatchell AR. Vogel's Textbook of Practical Organic Chemistry. 5th ed. Harlow: Longman Scientific & Technical; 1989.",
    supports: "Theoretical and percentage yield, limiting reagent, recrystallisation losses.",
    checked: "Standard citation of the 5th edition (Longman, 1989), the current edition of the text.",
  },
  beckettStenlake1: {
    citation:
      "Beckett AH, Stenlake JB. Practical Pharmaceutical Chemistry, Part 1. 4th ed. London: Athlone Press; 1988.",
    supports: "Titrimetric assays: equivalence factors, percentage purity, standardisation.",
    checked: "Standard citation of Part 1, 4th edition (Athlone Press, 1988).",
  },

  // ── Guidelines and standards ────────────────────────────────────────────
  ichQ2R2: {
    citation:
      "International Council for Harmonisation. ICH Q2(R2): Validation of Analytical Procedures. Step 4, adopted 1 November 2023.",
    url: "https://www.ich.org/page/quality-guidelines",
    supports: "Definitions of accuracy, precision, linearity, range; recovery as a measure of accuracy.",
    checked: "2026-10-12, Step 4 date confirmed from the guideline's document history (PMDA/EMA copies).",
  },
  ichQ1AR2: {
    citation:
      "International Council for Harmonisation. ICH Q1A(R2): Stability Testing of New Drug Substances and Products. 2003.",
    url: "https://www.ich.org/page/quality-guidelines",
    supports: "Accelerated (40 °C) and long-term storage conditions; what stability studies are for.",
    checked: "ICH quality-guidelines page; Q1A(R2) Step 4 February 2003.",
  },
  ichQ1E: {
    citation: "International Council for Harmonisation. ICH Q1E: Evaluation for Stability Data. 2003.",
    url: "https://www.ich.org/page/quality-guidelines",
    supports: "Regression analysis of stability data and the limits of extrapolating shelf life.",
    checked: "ICH quality-guidelines page; Q1E Step 4 February 2003.",
  },
  fdaDissolution1997: {
    citation:
      "U.S. Food and Drug Administration. Guidance for Industry: Dissolution Testing of Immediate Release Solid Oral Dosage Forms. Rockville (MD): FDA; August 1997.",
    supports: "Dissolution specifications (Q values), profile comparison and the f2 similarity factor.",
    checked: "Standard citation of the August 1997 FDA guidance (still listed by FDA).",
  },
  mooreFlanner1996: {
    citation:
      "Moore JW, Flanner HH. Mathematical comparison of dissolution profiles. Pharm Technol. 1996;20(6):64–74.",
    supports: "Difference (f1) and similarity (f2) factors.",
    checked: "Standard citation of the original f1/f2 paper.",
  },
  uspDissolution: {
    citation: "United States Pharmacopeia–National Formulary. General Chapter <711> Dissolution. Rockville (MD): USP.",
    supports: "Apparatus, sampling and the S1–S3 acceptance stages.",
    checked: "Chapter number and title as published in USP–NF; current official text not reproduced.",
  },
  uspUniformity: {
    citation: "United States Pharmacopeia–National Formulary. General Chapter <905> Uniformity of Dosage Units. Rockville (MD): USP.",
    supports: "Content uniformity and the acceptance value.",
    checked: "Chapter number and title as published in USP–NF.",
  },
  uspValidation: {
    citation: "United States Pharmacopeia–National Formulary. General Chapter <1225> Validation of Compendial Procedures. Rockville (MD): USP.",
    supports: "Accuracy (recovery), precision, linearity and range.",
    checked: "Chapter number and title as published in USP–NF.",
  },
  uspOsmolality: {
    citation: "United States Pharmacopeia–National Formulary. General Chapter <785> Osmolality and Osmolarity. Rockville (MD): USP.",
    supports: "Osmolarity, osmolality and tonicity of parenteral and ophthalmic preparations.",
    checked: "Chapter number and title as published in USP–NF.",
  },
  bipmSI: {
    citation: "Bureau International des Poids et Mesures. The International System of Units (SI Brochure). 9th ed. Sèvres: BIPM; 2019.",
    url: "https://www.bipm.org/en/publications/si-brochure",
    supports: "The mole, SI prefixes and unit conversion.",
    checked: "BIPM publications page; 9th edition, 2019.",
  },
  iupacGoldBook: {
    citation: "International Union of Pure and Applied Chemistry. Compendium of Chemical Terminology (the 'Gold Book').",
    url: "https://goldbook.iupac.org/",
    supports: "Definitions: amount concentration (molarity), mass concentration, rate constant, half-life.",
    checked: "IUPAC's own online edition.",
  },

  // ── Anatomy (Osteology & Arthrology Lab, 2026-10-18) ───────────────────
  graysStudents5: {
    citation: "Drake RL, Vogl AW, Mitchell AWM. Gray's Anatomy for Students. 5th ed. Philadelphia: Elsevier; 2023.",
    supports: "Bones of the limbs, pelvis, vertebral column and thorax; joint classification, ligaments and movements.",
    checked: "2026-10-18, Elsevier Health UK/EU listings (ISBN 9780323934237, date of publication 03/2023).",
  },
  moore9: {
    citation: "Moore KL, Dalley AF, Agur AMR. Moore's Clinically Oriented Anatomy. 9th ed. Philadelphia: Wolters Kluwer; 2023.",
    supports: "Limb joints and their ligaments, movements, and clinical correlations of bones and joints.",
    checked: "2026-10-18, university library catalogue (c2023; ISBN 9781975154127 and others) and retailer listings of the 9th edition.",
  },
  ta2: {
    citation: "Federative International Programme for Anatomical Terminology (FIPAT). Terminologia Anatomica. 2nd ed. FIPAT.library.dal.ca; 2019.",
    url: "https://fipat.library.dal.ca/TA2",
    supports: "Official English anatomical terms for bones, bone features, joints and ligaments.",
    checked: "2026-10-18, FIPAT's own TA2 page (published online 2019, adopted by IFAA 2020).",
  },
  zAnatomy: {
    citation: "Kervyn G, Zielinski M, Vinent L, et al. Z-Anatomy: the libre 3D atlas of anatomy. Models derived from BodyParts3D, The Database Center for Life Science (CC BY-SA 2.1 JP). CC BY-SA 4.0.",
    url: "https://www.z-anatomy.com/",
    supports: "The 3D bone, ligament and joint models, and the position of every 3D landmark marker.",
    checked: "2026-10-18, the Z-Anatomy model repository's License.txt (github.com/Z-Anatomy/Models-of-human-anatomy).",
  },

  // ── Primary literature ──────────────────────────────────────────────────
  cockcroftGault1976: {
    citation: "Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum creatinine. Nephron. 1976;16(1):31–41.",
    supports: "The Cockcroft–Gault creatinine-clearance estimate.",
    checked: "Standard citation of the original paper.",
  },
  mosteller1987: {
    citation: "Mosteller RD. Simplified calculation of body-surface area. N Engl J Med. 1987;317(17):1098.",
    supports: "The Mosteller body-surface-area formula.",
    checked: "Standard citation of the original letter.",
  },
} as const satisfies Record<string, Reference>;

export type ReferenceId = keyof typeof REFERENCES;

export function getReferences(ids: readonly ReferenceId[]): Reference[] {
  return ids.map((id) => REFERENCES[id]);
}
