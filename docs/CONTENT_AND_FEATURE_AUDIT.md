# Content and feature audit

> AdSense remediation, 2026-10-12. Statuses: CONFIRMED · POTENTIAL · NOT VERIFIED · FIXED · BLOCKED.
> Counts are measured from the repository's data, not from page copy.

## 1. Courses (notes)

| Measure | Count | Source |
| --- | --- | --- |
| Registered subjects (pages) | **4** — Pharmaceutical Biochemistry, Physiology, Physical Pharmacy, Pharmaceutical Organic Chemistry | `src/lib/courses/registry.ts` |
| Semesters covered | **1** (all four are Semester 1) | subject metadata |
| Published units | **22** | registry; every unit's markdown exists |
| Units ending in a questions/review section | 12 of 22 | headings in `content/*.md` |
| Subject files written but not registered | 10 (9 in an older data shape) | `src/lib/courses/subjects/` — CLAUDE.md "Partially implemented" |

| # | Finding | Status | Action |
| --- | --- | --- | --- |
| C1 | `/courses` hero claimed "1 Semesters · Complete Curriculum", "4+ Modules · High-Yield Subjects", "HEC & Pharmacy · Standardized Syllabus" and "clinical notes … board finals, licensure preparation" | CONFIRMED · FIXED | Cards now derived: "4 subjects published so far", "22 units of study notes", "Sem 1 semester covered"; lede says the notes cover the subjects published so far, each with an MCQ bank. HEC alignment is not documented anywhere in the repo, so the claim was removed rather than kept |
| C2 | Search placeholder suggested "Pharmacology", which has no notes | CONFIRMED · FIXED | "Biochemistry, Physiology" |
| C3 | Lesson accuracy and originality | NOT VERIFIED | the 22 units were not re-read for accuracy in this pass; they need a subject-expert read (manual list) |
| C4 | Every advertised unit opens | CONFIRMED | local crawl: all 22 unit URLs 200 with content (1,389–3,670+ words each) |

## 2. MCQ bank

| Bank | Semester | Declared | Records | Invalid answer keys | Missing explanations | Repeated question text |
| --- | --- | --- | --- | --- | --- | --- |
| Pharmaceutical Biochemistry | 1 | 150 | 150 | 0 | 0 | 1 |
| Pharmaceutical Organic Chemistry | 1 | 120 | 120 | 0 | 0 | 0 |
| Physical Pharmacy | 1 (also listed under 4) | 180 | 180 | 0 | 0 | 6 |
| Physiology & Histology I | 1 | 210 | 210 | 0 | 0 | 0 |
| **Total** | | **660** | **660** | **0** | **0** | **7** |

Method: each bank imported and checked (every `correctAnswer` matches an option id, every question
has text and an explanation, every unit label is declared). **The "660 questions" claim is
substantiated.** "Two semesters" is technically true only because Physical Pharmacy is listed
under Semester 1 and Semester 4 (the Semester 4 page canonicalises to Semester 1).

| # | Finding | Status | Action |
| --- | --- | --- | --- |
| Q1 | 7 questions repeat another question's text within the same bank | CONFIRMED | not changed (content edit, owner/author); listed for the authors |
| Q2 | `QUESTION_COUNT = 660` is typed in `mcqs-bank/page.tsx` | CONFIRMED · POTENTIAL drift | correct today; derive it if a bank is added (the comment says so) |
| Q3 | Scoring, navigation, reset, report download | NOT VERIFIED | not exercised in a browser in this pass |

## 3. Calculators

See `CALCULATOR_INVENTORY_AND_ACCURACY.md`. In short: 106 calculator pages; 21 now carry a verified
worked example, mistakes, limitations and references; 54 have recorded formula faults, of which the
clinical ones in that file's §3 are serious and need the owner's decision.

## 4. Guides — the content gap and what filled it

Before this pass, the only long-form, server-rendered teaching text was the 22 course units. The
calculators — the site's main product — explained a formula and answered an FAQ, but nothing taught
the *family* of calculations behind them. Five guides were added under `/guides`, each filling a
gap no existing page covered:

| Guide | Why it was a gap | Links to calculators |
| --- | --- | --- |
| Dilution and Concentration Calculations | 6 solution-prep calculators, no single explanation of units, C₁V₁ = C₂V₂, serial dilution, alligation | dilution, serial dilution, mg/mL ↔ molarity, mass–molarity |
| Pharmaceutical Dose Calculations | unit errors are the commonest calculation error; no page taught dimensional analysis | BSA, IV drip rate, reconstitution |
| Zero-, First- and Second-Order Kinetics in Drug Stability | the stability and order-kinetics tools assume the theory | stability kinetics, order kinetics, kₑ |
| Accuracy, Precision and Percentage Recovery | analysis tools report SD/RSD/R² without explaining them | accuracy & recovery, % recovery, calibration curve, Beer–Lambert |
| Pharmacokinetic Parameters | PK tools exist, the end-to-end analysis of a data set did not | kₑ, volume of distribution, clearance, bioavailability |

Each has objectives, key terms, 5–8 worked examples, 7–8 practice questions with full working,
common mistakes, limitations and references from the verified registry. Every number was
recomputed in Python. Tools with a recorded fault on the path a guide uses were **not** linked.
Status: "Checked by the PharmaWallah team. Not yet independently reviewed by a pharmacist." — true,
and shown on each guide.

## 5. Pharmacopedia (drug encyclopedia) and flashcards

| # | Finding | Status | Action |
| --- | --- | --- | --- |
| P1 | `/encyclopedia` shows DrugBank monograph text verbatim (12,673 drugs), attributed to DrugBank on the page | CONFIRMED | licence **NOT VERIFIED** (Known Issue 16). DrugBank's detailed data is generally licensed for non-commercial use. The page has no ads (deliberately). Owner must confirm the licence before monetising pages that show it — see manual list |
| P2 | Encyclopedia records are not individual URLs | CONFIRMED | search results render client-side, so no thin per-drug pages are indexed — nothing to noindex |
| P3 | Interaction totals capped at 100, products/synonyms at 5 | CONFIRMED (recorded, Known Issue 0b) | already stated on screen |
| P4 | Flashcards are hand-written data in `flash-cards/page.tsx` (MOA, classification, side effects, PK, PD, indications) | CONFIRMED | source not recorded; accuracy NOT VERIFIED in this pass |

## 6. Labs, spotting, interactive tools

| # | Finding | Status |
| --- | --- | --- |
| L1 | 8 simulations, Molecular Lab, Pharmacy Counter, Compounding Lab, Antibiogram, ADR Detective all 200 | CONFIRMED (crawl) — interactions not exercised in this pass |
| L2 | Powder microscopy has no images; its test is replaced by a notice (noindexed) | CONFIRMED (recorded, Known Issue 23) |
| L3 | Simulation pages have little server-rendered prose | POTENTIAL — see TECHNICAL_SEO_AUDIT S11 |

## 7. AI Guide, Prescription Reader, Community

| # | Finding | Status |
| --- | --- | --- |
| A1 | AI Guide and Prescription Reader send user text/images to Google Gemini; Gemini key is free tier, 5 requests/minute for the whole site | CONFIRMED (Known Issue 0c) — capacity, not content |
| A2 | `POST /api/scan-colonies` is an orphaned, unauthenticated Gemini endpoint | CONFIRMED (Known Issue 17) — owner decision |
| A3 | Community requires `supabase/migrations/20260920_community.sql` to have been applied | live crawl: `/community` 200 — appears applied |

## 8. App availability claims

Verified facts (APK): `com.pharmawallah.calculators` v1.5 (versionCode 6), minSdk 24 (Android 7.0),
targetSdk 36, 9,595,463 bytes, 106 calculator pages + the guide; permissions: `INTERNET` only (no
camera, storage or location). Offline: proven by a capture with every non-local request failed
(MEMORY 195); the TLC analyser and colony counter process images on the device. **iOS** compiles in
CI (unsigned) but has never been run and has no installable build. **Windows**: the Rust half has
never been compiled; there is no installer. Download page, calculator guide and CTAs were made
consistent by session `pharma-wallah-da` — see the changelog.
