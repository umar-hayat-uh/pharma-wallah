/**
 * Curriculum mapping per experiment (checked 2026-10-20 against the documents below;
 * full quotes, page numbers and caveats in docs/virtual-labs/CURRICULUM_MAPPING.md).
 *
 * `source_verified` means the practical appears in that document's practical list, in
 * the words quoted. It does NOT mean the University endorses this simulation, nor that a
 * faculty member has reviewed it — no experiment is `faculty_reviewed` yet. Course codes
 * are copied exactly as printed in the UoK syllabus PDFs; the HEC document prints none.
 */
import type { CurriculumRef } from "./engine/types";

const UOK = {
  pchem: "https://www.uok.edu.pk/syllabus/pchem.pdf",
  pceutics: "https://www.uok.edu.pk/syllabus/pceutics.pdf",
  pcology: "https://www.uok.edu.pk/syllabus/pcology.pdf",
  pcgnosy: "https://www.uok.edu.pk/syllabus/pcgnosy.pdf",
};
const HEC = "https://www.hec.gov.pk/english/services/universities/RevisedCurricula/Documents/2024-2025/Pharm.D.pdf";

export const CURRICULUM: Record<
  "acid-base-titration" | "solution-preparation" | "liquid-properties" | "solubility-dissolution" | "simple-syrup" | "dose-response" | "powdered-clove",
  CurriculumRef
> = {
  // The three shortlisted Pharmaceutics experiments (2026-10-25), checked page by page on
  // 2026-10-25 against pceutics.pdf, pchem.pdf and the HEC PDF (docs/virtual-labs/CURRICULUM_MAPPING.md §3.5–3.7).
  "solution-preparation": {
    status: "source_verified",
    summary:
      "Listed in the UoK Pharm-D practical syllabus (PHT-502 Physical Pharmacy (Lab), 3rd year, 2nd semester: “preparation of stock solution (dilution method)”) and in HEC Physical Pharmacy I (Semester I: “Preparation of Solutions, Dilutions”). The solutes and strengths used here are our illustrative choice. Not faculty-reviewed.",
    sources: [
      { label: "UoK — PHT-502 Physical Pharmacy (Lab), pceutics.pdf p. 12 (course heading p. 11)", url: UOK.pceutics, basis: "“Preparation of buffer solutions and isotonic solution. … Drug stability experiments, preparation of stock solution (dilution method).”" },
      { label: "HEC Pharm-D curriculum (2025) — Physical Pharmacy I (Practical), Semester I, PDF p. 75", url: HEC, basis: "“2. Preparation of Solutions, Dilutions, and Construction of Standard Curve. 3. Understanding different expressions of concentration like Molarity (M), Normality (N), Percentage, etc.”" },
    ],
  },
  "liquid-properties": {
    status: "source_verified",
    summary:
      "Listed in the UoK Pharm-D practical syllabus (PHC-406 Physical Chemistry – I (Practical), 2nd year, 2nd semester: specific gravity by pycnometer, viscosity by Ostwald viscometer, surface tension; PHT-502 Physical Pharmacy (Lab): “surface tensions, viscosity”). UoK names the drop-count method for surface tension, not capillary rise, and HEC lists only viscosity. Not faculty-reviewed.",
    sources: [
      { label: "UoK — PHC-406 Physical Chemistry – I (Practical), pchem.pdf p. 8", url: UOK.pchem, basis: "“1. Determination of specific gravity of liquids/syrups using an Ostwald pycnometer. 2. Determination of the viscosity of a liquid by Ostwald viscometer. … 5. Determination of the surface tension of a pure liquid by the drop count method.”" },
      { label: "UoK — PHT-502 Physical Pharmacy (Lab), pceutics.pdf p. 12", url: UOK.pceutics, basis: "“Determination of percentage composition of solutions by specific gravity method. Partition-coefficient, surface tensions, viscosity.”" },
      { label: "HEC Pharm-D curriculum (2025) — Physical Pharmacy II (Practical), Semester II, PDF p. 76", url: HEC, basis: "“3. Rheology: i. Determination of the viscosity of different systems.” (No density or surface-tension practical is listed.)" },
    ],
  },
  "solubility-dissolution": {
    status: "source_verified",
    summary:
      "Solubility is listed in UoK PHC-406 (2nd year, 2nd semester: solubility of benzoic acid) and HEC Physical Pharmacy I (“Solubility determination techniques”); dissolution by USP paddle/basket is listed in UoK PHT-701 (5th year, 1st semester) and PHT-614, not in UoK's Physical Pharmacy lab. Paracetamol is our illustrative choice. Not faculty-reviewed.",
    sources: [
      { label: "UoK — PHC-406 Physical Chemistry – I (Practical), pchem.pdf p. 8", url: UOK.pchem, basis: "“8. Determination of solubility of benzoic acid over a range of temperatures and calculation of its heat of solution.”" },
      { label: "UoK — PHT-701 Biopharmaceutics & Pharmacokinetics Lab, pceutics.pdf p. 7", url: UOK.pceutics, basis: "“b. Construction of pH-Solubility profile of 4 model drugs at pH 1.2, 4.5 and 6.8 … e. Determination of “dissolution rate” of 4 model drugs in 30 mins by USP method I and II”" },
      { label: "UoK — PHT-614 Pharmaceutical Technology (Lab), pceutics.pdf p. 13", url: UOK.pceutics, basis: "“c. Perform dissolution testing by USP method I and II”" },
      { label: "HEC Pharm-D curriculum (2025) — Physical Pharmacy I (Practical), Semester I, PDF p. 75", url: HEC, basis: "“4. Study of different Solubility determination techniques with emphasis on solubility enhancement.”" },
      { label: "HEC Pharm-D curriculum (2025) — Industrial Pharmacy-II (Practical), Semester VIII, PDF p. 87", url: HEC, basis: "“9. Single Point Dissolution Test: Single Point Dissolution test to evaluate tablet performance.”" },
    ],
  },
  "acid-base-titration": {
    status: "source_verified",
    summary:
      "Listed in the UoK Pharm-D practical syllabus (PHC-607 Pharmaceutical Analysis – I, 4th year, 1st semester: “Acid base titration”). The syllabus names no sample — citric acid is our illustrative choice. Not faculty-reviewed.",
    sources: [
      { label: "UoK — PHC-607 Pharmaceutical Analysis – I (Practical), pchem.pdf p. 5", url: UOK.pchem, basis: "“Assay of pharmaceutical compounds based on chemical methods / Acid base titration, …”" },
      { label: "HEC Pharm-D curriculum (2025) — Pharmaceutical Analysis I, Semester V, PDF p. 47", url: HEC, basis: "“1. Acid-Base titration of a chemical substance used in Pharmaceuticals.”" },
    ],
  },
  "simple-syrup": {
    status: "source_verified",
    summary:
      "Listed in the UoK Pharm-D practical syllabus (PHT-402 Pharmaceutical Dosage Forms Lab, 2nd year, 2nd semester: “Preparation of simple syrups”). The formula used here is illustrative (USP proportions). Not faculty-reviewed.",
    sources: [
      { label: "UoK — PHT-402 Pharmaceutical Dosage Forms (Lab), pceutics.pdf p. 10", url: UOK.pceutics, basis: "“Preparation of simple syrups, …”" },
      { label: "HEC Pharm-D curriculum (2025) — Drug Delivery Systems and Formulation Science-I, Semester III, PDF p. 78", url: HEC, basis: "Practical list includes “Syrups”." },
    ],
  },
  "dose-response": {
    status: "source_verified",
    summary:
      "Listed in the UoK Pharm-D practical syllabus (PHL-612 Pharmacology Lab, 4th year, 2nd semester: identifying an unknown concentration of acetylcholine from graded dose–response curves). The syllabus names no tissue; this lab is a simulation with teaching parameters. Not faculty-reviewed.",
    sources: [
      { label: "UoK — PHL-612 Pharmacology (Lab), pcology.pdf p. 13", url: UOK.pcology, basis: "“13. To identify unknown concentration of acetylcholine from graded dose-response curves.”" },
      { label: "HEC Pharm-D curriculum (2025) — related topic only", url: HEC, basis: "Acetylcholine on rabbit intestine (practical) and “Efficacy vs Potency … dose-response relationships” (theory); no graded-curve practical named." },
    ],
  },
  "powdered-clove": {
    status: "source_verified",
    summary:
      "Listed in the UoK Pharm-D practical syllabus (PHG-411 Pharmacognosy Lab-I, 2nd year, 1st semester: powdered drug examination — flower bud, Eugenia caryophyllus). The microscope view is a schematic illustration. Not faculty-reviewed.",
    sources: [
      { label: "UoK — PHG-411 Pharmacognosy Lab-I, pcgnosy.pdf p. 2", url: UOK.pcgnosy, basis: "“Powdered Drug Examination … Flower bud: Eugenia caryophyllus.”" },
      { label: "HEC Pharm-D curriculum (2025) — related topic only", url: HEC, basis: "Pharmacognosy Basic-I, Semester III: “Powder microscopy of crude drugs” (no drug named)." },
    ],
  },
};
