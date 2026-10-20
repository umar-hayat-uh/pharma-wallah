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

export const CURRICULUM: Record<"acid-base-titration" | "simple-syrup" | "dose-response" | "powdered-clove", CurriculumRef> = {
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
