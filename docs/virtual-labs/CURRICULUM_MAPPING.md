# Virtual Labs: curriculum mapping

Checked on 2026-10-20. The machine-readable version is `src/lib/virtual-labs/curriculum.ts`. The briefing of each lab
prints its summary and sources, and the landing card shows its status badge.

## 1. Status ladder

| Status | Meaning | Badge text |
| --- | --- | --- |
| `proposed` | We believe the experiment belongs in the curriculum, but no source has been checked | Proposed |
| `source_verified` | The practical appears, in the words quoted below, in the practical list of the named official document | Syllabus source verified |
| `faculty_reviewed` | A **named** faculty member has reviewed this simulation's content against their practical | Faculty reviewed |
| `published` | Faculty-reviewed and released as reviewed teaching material | Published |

**Current state: all four experiments are `source_verified` at the University of Karachi (UoK). None is
`faculty_reviewed`.** `source_verified` does **not** mean the university endorses the simulation. It does not mean a
faculty member has reviewed it. `scripts/virtual-labs.test.mts` asserts that no experiment claims
`faculty_reviewed`, and that a `source_verified` experiment has at least one source.

## 2. Source documents

| Document | URL | Notes |
| --- | --- | --- |
| UoK Pharm. Chemistry practical syllabus | https://www.uok.edu.pk/syllabus/pchem.pdf | "Pharm-D Courses (Through Department of Pharmaceutical Chemistry)". **No date or version printed.** PDF metadata 2024-11-05 |
| UoK Pharmaceutics | https://www.uok.edu.pk/syllabus/pceutics.pdf | No printed date; metadata 2024-11-05 |
| UoK Pharmacology | https://www.uok.edu.pk/syllabus/pcology.pdf | No printed date; metadata 2024-11-05 |
| UoK Pharmacognosy | https://www.uok.edu.pk/syllabus/pcgnosy.pdf | No printed date; metadata 2024-11-05 |
| HEC Pharm-D curriculum (2025) | https://www.hec.gov.pk/english/services/universities/RevisedCurricula/Documents/2024-2025/Pharm.D.pdf | Cover letter HEC/NCRC/PHARMACY/2025/7953, 3 September 2025. "CURRICULUM FOR DOCTOR OF PHARMACY (PHARM. D) (2025)". The cover letter says the detailed contents come from the Pharmacy Council of Pakistan and are "attached at Annex-A as reference only" |

How to read the references below:
- Page numbers are **PDF page numbers** (1-indexed).
- Each UoK file opens with a year × semester table of course codes on PDF p. 1. Year and semester are taken from
  that table, as printed.
- **The HEC document prints no course codes.** Its Scheme of Studies and its course-content section also name
  courses differently.

## 3. Per experiment

### 3.1 Assay of citric acid by acid–base titration (Pharmaceutical Chemistry)

| | |
| --- | --- |
| Status | **source_verified** (UoK and HEC) |
| Course (as printed) | **PHC-607 "Pharmaceutical Analysis – I (Practical)"**, Cr. Hrs. 3 |
| Year / semester (as printed) | Fourth Year, 1st Semester (pchem.pdf p. 1 table; body under "Fourth Professional", "FIRST SEMESTER") |
| Page | pchem.pdf **PDF p. 5** |
| URL | https://www.uok.edu.pk/syllabus/pchem.pdf |

Verbatim entry:
> "1. Assay of pharmaceutical compounds based on chemical methods
> Acid base titration, oxidation-reduction titration, complexometric titration, gravimetric, solvent extraction, and
> gasometric methods. …"

**HEC cross-mapping**:
- Course: "Pharmaceutical Chemistry IIIA: Pharmaceutical Analysis I". The Scheme lists it as "Pharmaceutical
  Analysis-I", **Semester V**, 3+1 (PDF p. 14).
- Practical list on **PDF p. 47** (printed p. 14): "1. Acid-Base titration of a chemical substance used in
  Pharmaceuticals."

**Caveats**
- **The syllabus names no sample.** Neither UoK nor HEC names citric acid, sodium bicarbonate, boric acid or
  aspirin for an acid–base assay. **Citric acid is our illustrative choice.**
- The method is an illustrative scaled-down teaching procedure. It is not a UoK practical-manual procedure and not
  the pharmacopoeial method ([EXPERIMENT_CATALOG §1](EXPERIMENT_CATALOG.md#1-assay-of-citric-acid-by-acidbase-titration)).
- Related UoK items that are not this practical:
  - PHC-508 Pharmaceutical Analysis - I (theory, "Titrimetric methods");
  - PHC-304 Organic and Inorganic Chemistry (Practical), which names aspirin for functional-group estimation;
  - PHC-503 Physical Chemistry II (Practical), heat of neutralisation.

### 3.2 Preparation and evaluation of Simple Syrup (Pharmaceutics)

| | |
| --- | --- |
| Status | **source_verified** (UoK names "simple syrups"; HEC names "Syrups") |
| Course (as printed) | **PHT-402 "Pharmaceutical Dosage Forms (Lab)"**, Cr. Hrs. 3 |
| Year / semester (as printed) | Second Year, 2nd Semester (pceutics.pdf p. 1 table) |
| Page | pceutics.pdf **PDF p. 10** |
| URL | https://www.uok.edu.pk/syllabus/pceutics.pdf |

Verbatim entry:
> "Practical Elaborating Theory Course
> Preparation of simple syrups, emulsions. Ointments, lotions, throat paints, glycerites, linimints, sprits,
> poultices, granules."

Also at UoK: **PHT-706 "Prescription Pharmacy (Lab)"** (Fifth Year, 2nd Semester), PDF p. 15: "Preparation and
dispensing of: / Syrups, Mixtures, …".

Related practicals that support the density step:
- PHC-406 Physical Chemistry – I (Practical), pchem PDF p. 8: "Determination of specific gravity of liquids/syrups
  using an Ostwald pycnometer";
- PHT-502 Physical Pharmacy (Lab), pceutics PDF p. 12: "Determination of percentage composition of solutions by
  specific gravity method".

**HEC cross-mapping**:
- Course: "Pharmaceutics-IIA: Drug Delivery Systems and Formulation Science-I", **Semester III**, 3+1 (PDF p. 13).
- Practical on **PDF p. 78** (printed p. 45): "3. Liquid Dosage Forms for Oral and External Use: Aromatic water,
  Syrups, Spirits, …".
- HEC does not say "simple syrup".

**Caveats**
- The formula is illustrative: the USP proportions (850 g sucrose to 1000 mL), heated method. It has not been checked
  against a UoK practical manual.

### 3.3 Graded dose–response curve (Pharmacology)

| | |
| --- | --- |
| Status | **source_verified at UoK**; HEC has **related topics only** |
| Course (as printed) | **PHL-612 "Pharmacology (Lab)"**, Cr. Hrs. 3. The p. 1 table lists it as "Pharmacology Lab - II" |
| Year / semester (as printed) | Fourth Year, 2nd Semester (body under "SECOND SEMESTER", "Fourth Professional") |
| Page | pcology.pdf **PDF p. 13** |
| URL | https://www.uok.edu.pk/syllabus/pcology.pdf |

Verbatim entry:
> "13. To identify unknown concentration of acetylcholine from graded dose-response curves."

**Why the lab includes an unknown-concentration step.** The UoK item is about *identifying an unknown concentration*
from the curve, not only about drawing it. After the student analyses the standard curve, they add test sample U,
record its response and read its concentration off their own curve. The hidden concentration lies between
10^-7.4 and 10^-6.6 M.

**HEC cross-mapping (related topics only)**:
- Course: "Pharmacology & Therapeutics-1A" (naming as printed, PDF p. 112).
  - Theory, PDF p. 113 (printed p. 80): "Median effective dose (ED50), and Therapeutic Index. Efficacy vs Potency,
    drug tolerance and dependence, dose-response relationships."
  - Practical, same page: preparing Ringer's, Tyrode's and Kreb's solutions; "6. Demonstrate stimulant drug effects
    (acetylcholine, barium chloride) on rabbit intestine"; "7. Demonstrate depressant drug effects (atropine) on
    rabbit intestine".
- **No HEC practical mentions a graded or log dose–response curve, EC50, or guinea-pig ileum.** All 124 pages were
  searched.
- **Semester mapping caveat.** The Scheme names the courses "Pharmacology and Therapeutics-I … -IV" (Semester III for
  -I). The content section names them "IA / IB / IIA / IIB". **Mapping 1A to Semester III is the researcher's
  inference.** The document does not state it.

**Caveats**
- **UoK names no tissue.** The neighbouring items 9–10 in the same course use the frog rectus abdominis. Rabbit
  intestine appears in a different course (PHL-510). Guinea-pig ileum is not named anywhere.
- The lab models a generic "ileum-type" smooth-muscle strip and says it is simulated.
- No citable EC50 for acetylcholine on guinea-pig ileum was found. The lab's EC50 (1 × 10⁻⁷ M) is a **teaching
  parameter**, not a literature value.
- Textbook definitions of potency and efficacy (Rang & Dale, Katzung, Goodman & Gilman) were **not** verified, because
  no accessible copy was found. The curriculum support for the concepts is:
  - UoK PHL-409: "potency, efficacy, … dose response curve";
  - HEC P&T-1A: "Efficacy vs Potency".

### 3.4 Microscopical identification of powdered clove (Pharmacognosy)

| | |
| --- | --- |
| Status | **source_verified at UoK**; HEC has **related topics only** |
| Course (as printed) | **PHG-411 "Pharmacognosy Lab-I"**, Cr. Hrs. 3 (p. 1 table: "PHG-411 Pharmacognosy (Lab)-I") |
| Year / semester (as printed) | Second Year, 1st Semester ("FIRST SEMESTER / Second Professional") |
| Page | pcgnosy.pdf **PDF p. 2** |
| URL | https://www.uok.edu.pk/syllabus/pcgnosy.pdf |

Verbatim entry:
> "2. Microscopic Examination of Natural Products
> Powdered Drug Examination
> Bark: Cinnamomum zeylanicum.
> Seed: Strychnos nux-vomica.
> Flower bud: Eugenia caryophyllus. …"

The same course also lists section cutting and phytochemical examination of *Eugenia caryophyllus* (PDF p. 3). Its
book list includes Jackson & Snowdon, *Atlas of Microscopy of Medicinal Plants, Culinary Herbs and Spices*. That book
is one of the sources of the lab's reference characters.

**HEC cross-mapping (related topics only)**:
- Course: "Pharmacognosy-IA (Basic-I)", **Semester III**, 3+1 (PDF pp. 98–99).
  - CLO 5: "Perform practical skills like section cutting and powder drug microscopy in the lab."
  - Practical: "ii. Powder microscopy of crude drugs: Microscopic evaluation of powdered crude drugs and their
    comparison with the standard monographs."
- **No drug is named** for powder microscopy. Clove appears only in "Pharmacognosy-IB (Basic-II)" theory (PDF p. 100,
  "Phenolic volatile oils: Clove, Thyme").

**Caveats**
- The microscope view is a schematic illustration, not photomicrographs.
- One reference photograph (CC BY-SA, Wikimedia Commons) is shown labelled "not yet confirmed by our reviewer".
- The science caveats on the reference characters are in
  [EXPERIMENT_CATALOG §4](EXPERIMENT_CATALOG.md#4-microscopical-identification-of-powdered-clove).

## 4. Summary table

| Lab | Status | UoK course (as printed) | UoK year / sem | UoK page | HEC |
| --- | --- | --- | --- | --- | --- |
| Acid–base titration | source_verified | PHC-607 Pharmaceutical Analysis – I (Practical) | 4th yr, 1st sem | pchem p. 5 | Verified: Pharmaceutical Analysis I, Sem V, p. 47 |
| Simple Syrup | source_verified | PHT-402 Pharmaceutical Dosage Forms (Lab) | 2nd yr, 2nd sem | pceutics p. 10 | Verified ("Syrups"): DDS & Formulation Science-I, Sem III, p. 78 |
| Dose–response | source_verified | PHL-612 Pharmacology (Lab) | 4th yr, 2nd sem | pcology p. 13 | Related topic only (P&T-1A; semester inferred) |
| Powdered clove | source_verified | PHG-411 Pharmacognosy Lab-I | 2nd yr, 1st sem | pcgnosy p. 2 | Related topic only (Pharmacognosy Basic-I, Sem III; no drug named) |

## 5. How a status is raised

| From → to | Who | What is required | Code change |
| --- | --- | --- | --- |
| `proposed` → `source_verified` | Anyone | Open the official document, quote the practical-list entry verbatim, and record the course code as printed, the year and semester as printed, the PDF page and the URL | Add a `sources` entry in `curriculum.ts` (label, URL, verbatim basis); set `status`; update this file |
| `source_verified` → `faculty_reviewed` | **A named faculty member** of the relevant department | They review the simulation itself (method, figures, mistakes and their consequences, questions, reference characters) against their own practical, and agree to be named. Record the reviewer's name, department, institution and date, plus any corrections they asked for and confirmation that the corrections were made | Set `status`; add the reviewer to the summary and this file. **Update the test** in `scripts/virtual-labs.test.mts`, which currently asserts no experiment is `faculty_reviewed`, in the same change, citing the review |
| `faculty_reviewed` → `published` | The owner | Owner sign-off after the review corrections are live | Set `status`; update this file |

Rules:
- A status is only ever raised by the person who did the check it names.
- `faculty_reviewed` **requires a named reviewer.** An anonymous or assumed review does not count.
- Never raise a status to make a page look more authoritative. If a source is withdrawn or changes, lower the status.
- For the clove lab, a reviewer should also confirm or reject the Commons reference photograph. Set its manifest row
  to `approved` only if they confirm it ([ASSET_LICENSES](ASSET_LICENSES.md)).
