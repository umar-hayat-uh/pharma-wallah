# Virtual Labs: curriculum mapping

Checked on 2026-10-20 (the four original labs) and 2026-10-25 (the three Pharmaceutics experiments, §3.5–3.7). The machine-readable version is `src/lib/virtual-labs/curriculum.ts`. The briefing of each lab
prints its summary and sources, and the landing card shows its status badge.

## 1. Status ladder

| Status | Meaning | Badge text |
| --- | --- | --- |
| `proposed` | We believe the experiment belongs in the curriculum, but no source has been checked | Proposed |
| `source_verified` | The practical appears, in the words quoted below, in the practical list of the named official document | Syllabus source verified |
| `faculty_reviewed` | A **named** faculty member has reviewed this simulation's content against their practical | Faculty reviewed |
| `published` | Faculty-reviewed and released as reviewed teaching material | Published |

**Current state: all seven experiments are `source_verified` at the University of Karachi (UoK). None is
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
| UoK Pharm-D course catalogue | https://www.uok.edu.pk/syllabus/pharmd.pdf | "Catalogue 2024-25", 77 pages, metadata 2024-11-01. **Not linked from the UoK syllabus index** (which lists only `pceutics`, `pchem`, `pcology`, `pcgnosy`, `pprac` for pharmacy); reached by URL on 2026-10-25. Used only to corroborate semesters. **There is no separate UoK physical-pharmacy syllabus**: PHT-414 / PHT-502 are inside `pceutics.pdf` |
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

### 3.5–3.7 The three Pharmaceutics experiments (owner's shortlist, 2026-10-25)

Checked on 2026-10-25 by the scientific/curriculum checker. Same rules as above: PDF page numbers, course codes and
year/semester as printed. **UoK has no separate physical-pharmacy syllabus.** Its Physical Pharmacy courses
(PHT-414 theory, PHT-502 lab) are in `pceutics.pdf`, and the density, viscosity and surface-tension practicals are
in the Pharmaceutical Chemistry file (`pchem.pdf`, PHC-406). The labs file all three under the course label
"Physical Pharmacy". That label is ours. As §3.7 shows, at UoK the dissolution half belongs to other courses.

**Where the UoK courses sit** (pceutics.pdf p. 1 and pchem.pdf p. 1 tables, corroborated by the 2024-25 catalogue):

| Course (as printed) | Year / semester (as printed) | Catalogue (pharmd.pdf p. 3–4) |
| --- | --- | --- |
| PHT-502 "Physical Pharmacy (Lab)" | Third Year, 2nd Semester | "Pharm.D. Third Professional", "Second Semester" |
| PHC-406 "Physical Chemistry – I (Practical)", Cr. Hrs. 2 | Second Year, 2nd Semester | "Fourth Semester" |
| PHT-605 "Industrial Pharmacy (Lab) Unit Operations" | Fourth Year, 1st Semester | listed as "PHT-604 … Industrial Pharmacy (Lab)", Fourth Professional, second semester — **the catalogue swaps 604/605** |
| PHT-614 "Pharmaceutical Technology (Lab)" | Fourth Year, 2nd Semester | Fourth Professional, Second Semester |
| PHT-701 "Pharmaceutics-Biopharmaceutics & Pharmacokinetics Lab" | Fifth Year, 1st Semester | Fifth Professional, First Semester |

A second catalogue discrepancy: it lists "PHT-501 Pharmaceutics - Physical Pharmacy" (theory, Third Professional,
first semester), but `pceutics.pdf` p. 1 calls PHT-501 "Pharmaceutics- Microbiology (Lab)". Nothing below depends on PHT-501.

**HEC semesters.** Unlike the pharmacology case (§3.3), the Scheme of Studies names these courses the same way the
content section does:
- **"Physical Pharmacy - I", SEMESTER I, 3+1** (PDF p. 13, printed p. 5; repeated on PDF p. 37). Content section:
  "Pharmaceutics-IA: Physical Pharmacy I".
- **"Physical Pharmacy - II", SEMESTER II.** Content section: "Pharmaceutics-IB: Physical Pharmacy II".
- The Semester I and Semester II designations are therefore **printed**, not inferred.

#### 3.5 Pharmaceutical solution preparation & dilution (`solution-preparation`)

| | |
| --- | --- |
| Status | **source_verified** (UoK and HEC) |
| Course (as printed) | **PHT-502 "Physical Pharmacy (Lab)"**, Cr. Hrs. 3 |
| Year / semester (as printed) | Third Year, 2nd Semester |
| Page | pceutics.pdf **PDF p. 12**. The course heading and its first line are at the foot of p. 11 |
| URL | https://www.uok.edu.pk/syllabus/pceutics.pdf |

Verbatim entries (one paragraph of the PHT-502 list):
> "Determination of particle size, angle of repose of powders. Preparation of buffer solutions and isotonic solution.
> …
> Drug stability experiments, preparation of stock solution (dilution method)."

**HEC cross-mapping (verified)**:
- Course: "Pharmaceutics-IA: Physical Pharmacy I", Practical. Scheme: **Semester I**.
- Practical list on **PDF p. 75** (printed p. 42):
  > "2. Preparation of Solutions, Dilutions, and Construction of Standard Curve.
  > 3. Understanding different expressions of concentration like Molarity (M), Normality (N), Percentage, etc."
- The theory on PDF p. 74 includes: "Solutions: Types, concentration expressions, ideal and real solutions, colligative
  properties".

**Caveats**
- Neither document names a solute, a strength or a volume. The solutes, strengths and glassware are our illustrative choice.
- UoK frames stock-solution preparation within "Drug stability experiments". HEC frames it with the "Construction of
  Standard Curve". The lab teaches the preparation and dilution step common to both.

#### 3.6 Physical properties of liquids: density/specific gravity, viscosity, surface tension (`liquid-properties`)

| | |
| --- | --- |
| Status | **source_verified** at UoK (all three properties). HEC lists **viscosity only** |
| Courses (as printed) | **PHC-406 "Physical Chemistry – I (Practical)"** (pchem.pdf **PDF p. 8**); **PHT-502 "Physical Pharmacy (Lab)"** (pceutics.pdf **PDF p. 12**) |
| Year / semester (as printed) | PHC-406: Second Year, 2nd Semester. PHT-502: Third Year, 2nd Semester |
| URLs | https://www.uok.edu.pk/syllabus/pchem.pdf · https://www.uok.edu.pk/syllabus/pceutics.pdf |

Verbatim, PHC-406 (under "Second Professional"):
> "1. Determination of specific gravity of liquids/syrups using an Ostwald pycnometer.
> 2. Determination of the viscosity of a liquid by Ostwald viscometer.
> 3. Determination of the percent composition of a mixture of ethanol and water by viscometric method.
> 4. Determination of the parachor value of an organic liquid.
> 5. Determination of the surface tension of a pure liquid by the drop count method.
> 6. Determination of the percentage composition of mixture of ethanol and water by surface tension method."

Verbatim, PHT-502:
> "Determination of percentage composition of solutions by specific gravity method.
> Partition-coefficient, surface tensions, viscosity."

**HEC cross-mapping (viscosity only)**:
- Course: "Pharmaceutics-IB: Physical Pharmacy II", Practical. Scheme: **Semester II**.
- On **PDF p. 76** (printed p. 43): "3. Rheology: i. Determination of the viscosity of different systems."
- Surface tension appears in HEC **theory only**, same page: "1. Surface and Interfacial Phenomena: i. Surface and
  interfacial tension."
- **No HEC practical names density, specific gravity, a pycnometer or surface tension.** All 124 pages were searched for
  "density", "specific gr", "pycno", "surface tension", "capillar", "drop count" and "stalagmo".

**Caveats**
- **UoK prescribes the drop-count (stalagmometer) method for surface tension, not capillary rise.** The lab's
  capillary-rise method is our choice. It measures the same property and uses the same relative-to-water logic, but it
  is not the printed method. A reviewer may ask for a drop-count variant.
- UoK names an "Ostwald pycnometer" and an "Ostwald viscometer". The lab uses a specific-gravity bottle (pycnometer) and
  a U-tube capillary viscometer.
- The sample liquids (ethanol, 50 % w/w glycerol) are our choice. Ethanol–water appears in UoK PHC-406 items 3 and 6.
  Glycerol is not named.

#### 3.7 Solubility (gravimetric) & dissolution (paddle) (`solubility-dissolution`)

| | |
| --- | --- |
| Status | **source_verified**. Both halves are quoted, but **in different courses**, and **neither is in UoK's Physical Pharmacy lab** |
| Solubility — UoK | **PHC-406 "Physical Chemistry – I (Practical)"**, Second Year, 2nd Semester, pchem.pdf **PDF p. 8** |
| Dissolution — UoK | **PHT-701 "Pharmaceutics-Biopharmaceutics & Pharmacokinetics Lab"**, Fifth Year, 1st Semester, pceutics.pdf **PDF p. 7**. Also PHT-614 (PDF p. 13) and PHT-605 (PDF p. 5) |

Verbatim, PHC-406:
> "8. Determination of solubility of benzoic acid over a range of temperatures and calculation of its heat of
> solution.
> 9. Determination of the mutual solubility curve of phenol and water."

Verbatim, PHT-701 (item 1, "To classify 4 Model drugs into respective classes of "Biopharmaceutics Classification
System""):
> "b. Construction of pH-Solubility profile of 4 model drugs at pH 1.2, 4.5 and 6.8
> …
> e. Determination of "dissolution rate" of 4 model drugs in 30 mins by USP method I and II"

Verbatim, PHT-614 "Pharmaceutical Technology (Lab)", Fourth Year, 2nd Semester, item 1:
> "c. Perform dissolution testing by USP method I and II"

Verbatim, PHT-605 "Industrial Pharmacy (Lab) Unit Operations", Fourth Year, 1st Semester:
> "10. Tablets tests: Disintegration, dissolution, friability, hardness and thickness tests."

USP "method II" is the paddle apparatus that this lab uses.

**HEC cross-mapping**:
- Solubility, **verified**. "Pharmaceutics-IA: Physical Pharmacy I", Practical, **Semester I**, **PDF p. 75** (printed
  p. 42): "4. Study of different Solubility determination techniques with emphasis on solubility enhancement."
- Dissolution in the same course is **theory only**, PDF p. 74: "iii. Dissolution and Permeation: Definition and
  concepts, types, Factors affecting dissolution and permeation, Noyes-Whitney equation".
- Dissolution practical, **verified, other course**. "Pharmaceutics-IVB: Industrial Pharmacy-II", Practical (Scheme:
  "Industrial Pharmacy - II", **Semester VIII**), **PDF p. 87** (printed p. 54): "9. Single Point Dissolution Test:
  Single Point Dissolution test to evaluate tablet performance."
- Also: "Pharmaceutics-VIIA: Pharmaceutical Technology I" (Semester IX), PDF p. 95: "4. Determination and comparison of
  dissolution profiles"
- Also: Biopharmaceutics and Pharmacokinetics-I (Semester VII), PDF p. 89: "5. Noyes-Whitney Equation Application:
  Study the effect of Noyes-Whitney's equation parameters on the percentage drug release."

**Caveats**
- **Paracetamol is our illustrative choice.** UoK names benzoic acid for solubility and "4 model drugs" for
  dissolution. HEC names no drug for either.
- UoK's solubility practical is temperature-dependent (heat of solution), and it is not stated to be gravimetric.
  The lab's gravimetric single-temperature determination is our method choice.
- Filing the experiment under the "Physical Pharmacy" label fits HEC's solubility item (Physical Pharmacy I). It does
  **not** fit UoK, where PHT-502 lists neither solubility nor dissolution. The briefing should not imply that UoK
  teaches dissolution in Physical Pharmacy.
- The dissolution conditions are those of the USP *Acetaminophen Tablets* monograph (see
  [PHARMACEUTICS_REFERENCE_DATA](PHARMACEUTICS_REFERENCE_DATA.md)). No Pakistani syllabus prescribes them.

## 4. Summary table

| Lab | Status | UoK course (as printed) | UoK year / sem | UoK page | HEC |
| --- | --- | --- | --- | --- | --- |
| Acid–base titration | source_verified | PHC-607 Pharmaceutical Analysis – I (Practical) | 4th yr, 1st sem | pchem p. 5 | Verified: Pharmaceutical Analysis I, Sem V, p. 47 |
| Simple Syrup | source_verified | PHT-402 Pharmaceutical Dosage Forms (Lab) | 2nd yr, 2nd sem | pceutics p. 10 | Verified ("Syrups"): DDS & Formulation Science-I, Sem III, p. 78 |
| Dose–response | source_verified | PHL-612 Pharmacology (Lab) | 4th yr, 2nd sem | pcology p. 13 | Related topic only (P&T-1A; semester inferred) |
| Powdered clove | source_verified | PHG-411 Pharmacognosy Lab-I | 2nd yr, 1st sem | pcgnosy p. 2 | Related topic only (Pharmacognosy Basic-I, Sem III; no drug named) |
| Solution preparation & dilution | source_verified | PHT-502 Physical Pharmacy (Lab) | 3rd yr, 2nd sem | pceutics p. 12 | Verified: Physical Pharmacy I, Sem I, p. 75 |
| Physical properties of liquids | source_verified | PHC-406 Physical Chemistry – I (Practical); PHT-502 | 2nd yr, 2nd sem; 3rd yr, 2nd sem | pchem p. 8; pceutics p. 12 | Viscosity only: Physical Pharmacy II, Sem II, p. 76 |
| Solubility & dissolution | source_verified (different courses) | PHC-406 (solubility); PHT-701, PHT-614 (dissolution) | 2nd yr, 2nd sem; 5th yr, 1st sem; 4th yr, 2nd sem | pchem p. 8; pceutics pp. 7, 13 | Solubility: Physical Pharmacy I, Sem I, p. 75; dissolution: Industrial Pharmacy-II, Sem VIII, p. 87 |

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
