# Calculator inventory and accuracy

> Part of the AdSense remediation of 2026-10-12. Statuses: **CONFIRMED · POTENTIAL · NOT VERIFIED ·
> FIXED · BLOCKED**. The per-tool table (106 rows) is generated — see
> [`adsense-content-inventory.md`](adsense-content-inventory.md) (regenerate with
> `node scripts/content-inventory.mjs`). This file explains the counts and the accuracy work.

## 1. Count reconciliation

Public pages showed 106, 105, 95 and 94. Every one of those numbers came from the code; they
counted different things, and some had gone stale.

| Definition | Count | Source of truth | How verified |
| --- | --- | --- | --- |
| Calculator routes (`(tools)/<slug>/page.tsx`) | **106** | the directory itself | `ls` + `content-inventory.mjs` |
| Registered on the hub (`HUB_SUBJECTS`) — entries | 100 | `tool-index.ts` | parsed |
| Registered on the hub — unique tools | **95** | `HUB_TOOL_COUNT` | 5 tools are deliberately listed under two subjects |
| Registered but not on the hub (`UNLISTED_TOOLS`) | 11 | `tool-index.ts` | 6 are linked from `/clinical/dose-calculators`; 5 had no inbound link |
| Every route registered somewhere | 95 + 11 = **106** | `CALCULATOR_COUNT` (new) | peer session `pharma-wallah-da` checked every dir has an entry and vice versa |
| In the Android app | **106** | `mobile/app/_data/tool-registry.ts`; generator re-exports every dir | `unzip -l` on the published APK v1.5 → 106 `calculation-tools/*/index.html` |
| Available offline in the app | **106** | `ONLINE_ONLY_SLUGS` is empty | ad-05 capture with all non-local requests failed (MEMORY 195). Three tools link to an external source page; those links say "needs a connection" offline (`SourceLink`) |
| Duplicates | **0** | — | `serial-diluation` (Serial **Dose**) and `serial-dilution-calculator` are different tools; the misspelt slugs `serial-diluation` and `pedriatic-calculator` are kept because they are live URLs |
| Deprecated / unavailable | **0** | — | live crawl: every calculator route returns 200 |
| Not strictly calculators (simulators/plotters in the collection) | 5 | — | `antagonism-simulator`, `dose-response-curve-generator`, `uv-spectrum-plotter`, `tablet-disintegration-dissolution-profile-plotter`, `drug-excipient-compatibility-predictor`. They are interactive tools that compute; counted as calculators, which is how the site presents them |

**Where each old figure came from (CONFIRMED, now FIXED by `pharma-wallah-da`):** home 106 =
hub-unique + unlisted (correct); hub 94/95 = unique hub tools (correct for "in this index", wrong
as a site total); About 94/95 = `HUB_TOOL_COUNT` used as a site total; calculator guide 95 =
`HUB_TOOL_COUNT`; Download 105 = a typed constant that went stale when the 106th tool shipped.
**Rule now:** "calculators" on the site means `CALCULATOR_COUNT` (106); the hub may say "95 in this
index" because that is what it lists. Both are derived, never typed.

## 2. The 2026-10-12 accuracy and teaching pass

### What "meets the standard" means
A shared, typed teaching section (`CalcLearn`, `src/components/calculators/CalcLearn.tsx`) adds to
the formula panel and FAQ every tool already had: a **worked example** whose figures equal what the
calculator itself prints for the same inputs (traced through the page's code, including its
rounding) **and** were recomputed independently in Python; **common mistakes** specific to the
calculation; **assumptions and limitations**; **references** from the verified registry
(`src/lib/content/references.ts`); related tools; and, where one exists, a guide.

### Tools brought to the standard: 21 of 106

| Tool | Worked example (inputs → printed answer) | Recorded faults avoided by the example |
| --- | --- | --- |
| dilution-calculator | 20 % → 0.05 % w/v, 250 mL → V₁ 0.6250 mL, diluent 249.3750 mL | no V₂ ≥ V₁ check (recorded) |
| serial-dilution-calculator | 1000 µg/mL, 5 × 1:2, 4 mL tubes → 500…31.25 µg/mL, 1:32 | — |
| molarity-calculator | 250 mL of 0.2 M NaHCO₃ (84.01) → 4.2005 g | purity/sg validation (recorded) |
| percentage-solution-calculator | 150 mL of 3.8 % w/v → 5.7 g | no unit conversion; g − mL solvent (recorded; explained in the section) |
| isotonicity-calculator | phenylephrine 1 % + BKC 0.01 % → add 0.578 g NaCl/100 mL | mM → % ignores MW (recorded) |
| percentage-recovery-calculator | 12.5 mg in, 11.55 mg out → 92.40 % | — |
| accuracy-recovery-calculator | 3 levels → mean 99.46 %, SD 1.079, RSD 1.08 % | — |
| calibration-curve-calculator | 5 standards → m 0.0397, c 0.0012, R² 0.9995, unknown 12.87 µg/mL | — |
| dissolution-calculator | 4 time points, volume correction → 36.10 / 56.61 / 68.03 / 74.44 % | — |
| order-kinetics-calculator | C₀ 80, kₑ 0.15 h⁻¹ → t½ 4.62 h; zero-order 16.0 h | mixed-kinetics mode (recorded) |
| ke-calculator | 500 mg, C₀ 12.5 mg/L, CL 5 L/h → kₑ 0.1250 h⁻¹, t½ 5.54 h | — |
| clearance-calculator | 400 mg / AUC 64 → 6.250 L/h | organ-function bands (see §3) |
| bioavailability-calculator | AUC route → F 60.0 % | "estimate from dose" mode (recorded) |
| loading-dose-calculator | 8 mg/L × 35 L ÷ 0.8 → 350.0 mg | L/kg presets used as L; mcg labelled mg (recorded) |
| bsa-calculator | 165 cm, 60 kg, 250 mg/m² → 1.658 m², 414.6 mg | 0.1 mg table rounding (recorded) |
| percent-purity, law-absorbance, volume-distribution, maintenance-dose, percentage-yield, iv-drip-rate | written by `pharma-wallah-da` with the same method | see that session's notes in the changelog |

**No formula was changed.** Where tracing found a fault, it was recorded, kept out of the example,
and — where a student could hit it — named in the tool's mistakes or limitations.

### New faults found by this pass (CONFIRMED, not fixed — owner decision)

| Tool | Fault | Input → actual → expected |
| --- | --- | --- |
| isotonicity-calculator | mM converted to % w/v by × 0.001 regardless of molar mass | 278 mM dextrose, E 0.18 → NaCl eq. 0.05 %, "HYPOTONIC" → ≈ 0.90 %, isotonic (recorded in substance; the size of the error is new) |
| dilution-calculator | C₂ mode accepts V₂ < V₁ | C₁ 10, V₁ 50, V₂ 10 → C₂ 50 (a "dilution" that concentrates) → error message |
| molarity-calculator | liquid-mode hint says "volume of pure liquid", formula multiplies by purity | wording contradicts maths |
| clearance-calculator | interpretation bands label organ function from absolute L/h for any drug | CL 0.12 L/h (the page's own digoxin example) → "Severe impairment" → drug-dependent; no organ judgement possible |
| loading-dose-calculator | Reset leaves `doseBasis`; F accepts > 100 % | — |
| AccumulationIndexCalculator | "fraction of steady state after 4 half-lives" computes 1 − e^(−k·τ·4) (4 *doses*) | equals 4 t½ only when τ = t½ |
| order-kinetics-calculator | first-order mode still prints a "time to eliminate" from the hidden Vmax | display only |
| volume-distribution-calculator | presets do not reproduce their labelled Vd (warfarin 0.048 vs 0.14 L/kg; gentamicin 0.009 vs 0.25; digoxin 0.007 vs 7) | found by `pharma-wallah-da` |
| percent-purity-calculator | example chips give 42 % and 776 % purity; grades against a hard-coded 98–102 % | found by `pharma-wallah-da` |

### Recorded faults overall
54 of 106 tools have at least one fault recorded in `.claude/redesign-tracker.md` →
"Suspected maths issues" (CLAUDE.md Known Issue 15). They range from cosmetic to serious; the
serious clinical ones are in §3. Each affected page states its fault on screen. **Fixing them is
logic work that needs the owner's approval** and was not done here.

## 3. Higher-risk clinical tools

See §3 of [`ADSENSE_FULL_AUDIT_REPORT.md`](ADSENSE_FULL_AUDIT_REPORT.md) for the ranked list from
the clinical audit, and the per-tool findings below.

Audit method: a read-only review of 12 tools against their standard sources (CKD-EPI 2021, KDIGO
2024 categories, Cockcroft–Gault 1976, product labels, ASHP/IDSA 2020 vancomycin guideline, CDC 2022
opioid guideline), with every example traced through the code and recomputed in Python. **No
clinical logic was changed in this remediation** — each item below needs the owner's decision
(CLAUDE.md Known Issue 15). Status: all CONFIRMED by code trace; "recorded" = already in the tracker.

| # | Tool | Sev. | Finding | Example (input → page → source) | Fix type |
| --- | --- | --- | --- | --- | --- |
| V1 | vancomycin-auc-calculator | **critical** (new) | Optimises **AUC/MIC** to 400–600; the 2020 guideline target is AUC 400–600 assuming MIC ≤ 1 | 70 kg, CrCl 100, MIC 2 → 1500 mg q8h, AUC ≈ 1051, "Therapeutic" | logic |
| R1 | renal-dosing-adjuster (apixaban) | **critical** (new) | Standard and reduced tiers both span CrCl 15–9999; the age/weight/SCr criteria are never evaluated | 85 y, 55 kg, SCr 1.6 → "5 mg BID"; label → 2.5 mg BID | logic |
| R2 | renal-dosing-adjuster | high (new) | CrCl < 15 tier is the *dialysis* recommendation, applied to every patient | non-dialysis CrCl 12 → 5 mg BID | logic/wording |
| R3 | renal-dosing-adjuster (pip/tazo) | high (new) | 20–49 band → 3.375 g q6h; label band 20–40 → 2.25 g q6h | CrCl 30 → 3.375 g | data |
| O1 | OpioidConversionCalculator | **critical** (recorded) | Fentanyl patch mcg/h read as mg | 25 mcg/h → 2500 MME (CDC ≈ 60) | logic |
| P1 | OpioidMMECalculator | high (recorded; overdose direction new) | Tramadol 0.1 / oral hydromorphone 4 (CDC 2022: 0.2 / 5) | rotate 60 MME −25 % → tramadol 450 mg/day (above the usual 400 mg max) | data |
| E1 | GeriatricDosingCalculator | high (new) | "Renal" rule = dose × CrCl/100 for every drug | metformin, CrCl 25 → 250 mg (label: contraindicated) | logic |
| K1/K2 | clearance-calculator | high (new) | Organ impairment labelled from a raw drug clearance; presets are L/h/kg loaded as L/h | digoxin preset 0.12 → "Severe impairment" | wording + data |
| C1 | creatinine-calculator | high (recorded) | KDIGO G stage taken from Cockcroft–Gault CrCl, not eGFR | 54 y F, 112 kg, SCr 1.4 → "G3a" (eGFR ≈ 45) | logic |
| C2 | creatinine-calculator | medium (new) | Drug-list dose advice at G3a (enoxaparin, DOACs) not in their labels | — | wording |
| L1 | loading-dose-calculator | high (recorded) | L/kg presets used as L; digoxin mcg shown as mg | digoxin → "660 mg" (0.66 mg) | logic |
| L3 | loading-dose-calculator | medium (new) | "Check levels 30 min post-dose" as a universal rule | digoxin needs ≥ 6 h | wording |
| M1 | maintenance-dose-calculator | high (recorded) | Digoxin preset → 1.97 mg/day | typical 0.125–0.25 mg | data |
| T1/T2 | therapeutic-index-calculator | medium (new) | "Known drug" presets are therapeutic ranges, not ED50/TD50; invented "Safe"/"TDM required" bands | — | data + wording |
| G1 | gfr-calculator | medium (new) | eGFR ≥ 90 labelled "Stage G1" without the kidney-damage condition | 30 y M, SCr 0.8 → "Stage G1" | wording |
| D3 | pedriatic-calculator | medium (new) | No cap at the adult dose although the page says "never exceed" | 80 kg, 15 mg/kg → 1200 mg, no flag | logic |

The gfr-calculator's CKD-EPI 2021 and MDRD equations, the creatinine-calculator's Cockcroft–Gault,
IBW and adjusted body weight, and the vancomycin pharmacokinetic equations themselves were found
**correct**. Four of the critical/high items (R1, V1, E1, P1) are linked from the clinical
sub-brand's `/clinical/dose-calculators` page, which is aimed at practising pharmacists.

**Recommended owner decision (BLOCKED on it):** either fix V1, R1, R2, R3, E1, P1 and K1/K2 now, or
— as an interim, reversible step — remove those tools from `/clinical/dose-calculators`, mark them
`noindex`, and put a red "known dosing error, do not use" notice at the top of each until fixed.

## 4. Tests

| Suite | Result | What it covers |
| --- | --- | --- |
| `node --test scripts/content-governance.test.mts` (new) | 7 pass | every guide and `_learn.ts` complete, cites registered sources, links only to existing tools/guides, claims no expert review |
| `node --test scripts/stability-kinetics.test.mts` | 26 pass | Drug Stability Kinetics maths |
| `node --test scripts/dissolution-rate.test.mts` | 28 pass | Dissolution Rate Constant maths |
| `node --test scripts/tlc-rf.test.mts scripts/colony-counter.test.mts` | 41 pass | TLC and colony counter |

**Not covered (NOT VERIFIED by tests):** the other ~100 calculators keep their maths inline in
`page.tsx`, so their worked examples were checked by tracing and Python, not by a regression test.
Extracting each tool's maths into a `_math.ts` with a test is the way to close this; it was not done
because no formula was modified.
