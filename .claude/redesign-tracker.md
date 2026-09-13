# Site-wide redesign tracker — top-design pass

> **Resume here.** If you are a new session continuing this job, skip Phase 0 and continue from the
> first unticked batch below. Rules of the job live in the original brief (CLAUDE.md §8 work log,
> 2026-09-13 "redesign Phase 0" entry) — the short version is at the bottom of this file.

Started 2026-09-13 by session `pharma-wallah-f6`. Status values: `todo` · `direction pending` ·
`in progress` · `done` · `blocked (reason)`.

## Phase status

| Phase | Status | Notes |
| --- | --- | --- |
| 0.1 Inventory + this tracker | **done** 2026-09-13 | 106 page files outside `(tools)` + `src/app/contact`, `src/app/not-found.tsx`; 97 calculators |
| 0.2 Shared page kit | **done** 2026-09-13 | `src/components/page-kit/` — not yet used by any page |
| 0.3 Mockup directions | **waiting for the user** | Published: https://claude.ai/code/artifact/34024bf6-5a9b-4ebe-ac03-592176f77609 (source: session scratchpad, not in repo). No family may roll out before its direction is chosen |
| 1 Pages | blocked (direction pending) | |
| 2 Calculators | **in progress** 2026-09-13, session `pharma-wallah-a8` — all 81 remaining tools, parallel agents by category; F16 fixed in `CalculatorShell` | Do not start a batch without checking with a8 |

## Chosen directions

| Family | Representative page | Direction chosen | Rider |
| --- | --- | --- | --- |
| Calculation-tools hub | `/calculation-tools` | — (recommended 01 The Index + 03 search) | — |
| Courses | `/courses/pharmaceutical-biochemistry` | — (recommended 01 Syllabus ledger + 03 MCQ column; F7 decision) | — |
| Spotting | `/spotting/histology/lessons/kidney` | — (recommended 01 The plate + 03 atlas rail; pathology template decision) | — |
| Simulations | `/simulations/titration` | — (recommended 01 Lab notebook + 03 pre-lab sheet) | — |
| Auth | `/signin` | **01 What an account keeps** (user: "redesign the auth pages", no number → recommendation taken; one-line reverse) | **Theme is the blue→green gradient, never black** (applies site-wide — `page-kit/brand.ts`) |
| Dashboard | `/dashboard` | **01 next-up + 02 syllabus coverage, rebuilt** (user: "completely rebuild", GSAP + shadcn, no header/footer) | XP/levels removed; `/` redirects signed-in users here |

## Measured faults found during Phase 0 (fix inside the owning family's batch)

These were found by measuring the real pages, not by reading docs. Each is UI/copy/link-level and
belongs to the batch that redesigns that page, unless marked otherwise.

| # | Page | Fault | Evidence | Owner batch |
| --- | --- | --- | --- | --- |
| F1 | `/spotting` | Pathology "Study Lessons" link **404s** — `lessonPath: "/spotting/pathology/lessons "` has a trailing space | `curl …/spotting/pathology/lessons%20` → 404 | P4 spotting |
| F2 | `/spotting` | Every category card says **8 lessons**; hero says **24+ total**. Repo has 17 histology (16 in the nav + 1 orphan), 15 pathology, 3 powder = **35** | `ls` of lesson dirs; hard-coded `lessonCount: 8` | P4 spotting |
| F3 | `/spotting/histology/lessons/simple-columnar-epithelium` | **Orphan** — not in `HISTOLOGY_LESSONS`, linked from nowhere; the only histology lesson not on the template | `grep -rl simple-columnar-epithelium src` → only itself | P4 spotting |
| F4 | `/spotting/pathology/*` | 15 lesson pages are **copy-pasted ~550-line files** (diff between two = ~220 lines, all data) — not a template. Emoji + gradient per page | `diff lipoma fibroadenoma` | P4 spotting (template extraction = UI refactor; data untouched) |
| F5 | histology lessons | Sidebar lesson list renders **globals.css bullets**; "Inner (Visceral) Layer" definition row mis-laid in the kidney theory | screenshot | P4 spotting |
| F6 | `/courses/[subject]` (all 4) | Start banner reads **"Unit 1: Unit 1: …"** — titles already carry the prefix; the card chip "Unit N" repeats it again | `page.tsx` `Unit 1: {units[0].title}` | P2 courses |
| F7 | `/courses/[subject]` (all 4) | **Read times are hand-typed and understated up to 2.3×** vs the markdown (200 wpm). Organic Chem U2 says 16 min, 7,524 words ≈ 37 min; subject total 57 → ≈111 min; Biochem 69 → ≈86 (17,328 words) | `wc -w public/content/**` | P2 courses — decision needed: derive from word count (data change in `subjects/*.ts`) or relabel |
| F8 | `/dashboard` sidebar + search | **All 12 course links 404** (`/courses/sem-1/<slug>` — route is `/courses/<slug>`, and 8 of the 12 subjects are not registered). **2 quick links 404**: `/pharmacovigilance`, `/adverse-reaction-sleuth` | `curl` → 404 ×14 | P7 dashboard (use `SUBJECTS` from the registry) |
| F9 | `/dashboard` | Weekly chart + XP read `recentActivity`, which the API caps at **20 rows** — a busy day shows ≤20 and wipes the previous six days; activity XP tops out at 200 | `api/progress/route.ts:67 .limit(20)` | P7 dashboard — **logic, not UI: ask before changing** |
| F10 | `/dashboard` | Day bucketing uses `toISOString()` (UTC) — study between 00:00–05:00 PKT counts toward yesterday | `page.tsx` weeklyData / studiedToday | P7 dashboard — logic: ask |
| F11 | `/dashboard` | "7-Day Streak" achievement and "streak at risk" notice read `current_streak`, which nothing writes (Known Issue 8). "Night Owl" = >1000 min total, "Lab Rat" = 5 units — names don't match rules | `page.tsx` achievements | P7 dashboard — copy is UI; rules are logic: ask |
| F12 | `/calculation-tools` | Hero says **"86+ Calculators"** — 86 is the hub list; 97 tools exist (6 clinical-only, 5 orphans). Every card shows the same generic icon | `allTools.length` | P1 hub |
| F13 | whole site | **Dark mode is effectively unreachable**: `ThemeToggler.tsx` exists but the header doesn't mount it, `defaultTheme="light"`; only the dashboard's own button toggles `html.dark` (not persisted). Pages with `dark:` styles: dashboard (6), clinical/resources (31), mcqs subject (1) | `grep ThemeToggler` | note only — keep existing `dark:` styles; don't add a toggle without asking |
| F16 | migrated calculators | **Possible double top gap**: `CalculatorShell` pads `var(--calc-top-offset)` = 5rem for the fixed header, but the header already renders an in-flow spacer (`h-[64px] lg:h-[76px]`) | code reading; **not yet confirmed on screen** | P1/Phase 2 — told session `pharma-wallah-08`, which owns `CalculatorShell.tsx` right now |
| F17 | `/signin` | Middleware redirects to `/signin?redirect=<path>`; sign-in ignores it and always `router.push("/dashboard")`; OAuth callback doesn't carry it either | `middleware.ts:87`, `signin/page.tsx:35` | P8 auth — **logic: ask** (must validate same-origin paths — open-redirect risk) |
| F18 | courses / MCQ bank | `SubjectMeta.hasMcq` is read by nothing (false for 2 subjects that do have banks of 180 and 120). MCQ bank unit labels differ from course unit titles (Biochem U1, U3), so any course↔bank join must use the unit **number** | `grep hasMcq`; `mcq-data/*.ts` | P2 courses |
| F19 | `/simulations/titration` | **Overshoot warning can never fire**: the interval sets `endpointReached` as soon as volume ≥ expected (steps of 0.1 mL), so volume never exceeds expected + 0.5 | `titration/page.tsx:728–745` | P5 simulations — **logic: ask** |
| F14 | docs | CLAUDE.md §7 says **21 of 97** calculators use the kit — measured **16** | `grep -l @/components/calculators` | knowledge sync (done) |
| F15 | docs | CLAUDE.md §7 says pathology has **16** lessons — measured **15** (+ index + test) | `ls` | knowledge sync (done) |

## Changes made outside the phase plan (user riders, 2026-09-13)

- **Science Fair 2026 is over**: the landing launch strip (`OfficialLaunchBanner`, mounted in
  `Home/landing/LandingPage.tsx`) and the site-wide launch dialog (`LaunchPopup`, mounted in
  `AppShell.tsx`) are **unmounted**. Both component files are kept on disk, now dead. The
  `pw_launch_banner_dismissed_at` localStorage preset in the verification recipe is no longer needed.
- **Hero meta strip removed** from the landing page ("Pharm-D · Pakistan / 97 tools / 69 lessons /
  8 labs / PKT clock"): `Hero.tsx` markup + `PktClock`, `.hero__meta`/`.live-dot`/`pw-idx-ping` CSS;
  hero grid is now `1fr auto`, top padding raised to compensate.
- Concurrent session `pharma-wallah-08` (2026-09-13) owns, until it reports done: Header, Footer,
  `app/layout.tsx` icons, `calculators/` (new `CalcDisclaimer`, `CalculatorShell`), `(tools)/layout.tsx`,
  a new `master-formula-calculator` tool (→ 98 tools, 87 in `allTools`), and one-entry registry appends.
  Re-count the calculator table below when it lands.

- **User rule (2026-09-13): no black grounds.** The theme is the brand blue→green gradient;
  strong surfaces use `BRAND_SURFACE` / `BRAND_BUTTON` (`src/components/page-kit/brand.ts`).
  This overrides the brief's "warm ink" grounds for every remaining family. Ink is text only.
- **Landing timeline dock removed (2026-09-13)** at the user's request — also the page's biggest
  scroll cost. Header blur fix handed to `pharma-wallah-08` (MEMORY gotcha 51).

## Phase 1 — Pages

Order is the brief's. `dark` = file already has `dark:` classes (keep them). `ads` = carries an
AdSense placement (preserve; never inside an animated parent). `no-ads` = deliberately ad-free.

### P1 · Calculation-tools hub — direction pending
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/calculation-tools` | `calculation-tools/CalculationToolsClient.tsx` (372) | ads `_LIST` before the category sections; F12 |
| [ ] todo | calculator footer strip | `calculation-tools/(tools)/layout.tsx` | ads `_CALCULATOR_FOOTER`; web-only (gotcha 28) |

### P2 · Courses — direction pending
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/courses` | `courses/page.tsx` (388) | |
| [ ] todo | `/courses/[subjectSlug]` ×4 | `courses/[subjectSlug]/page.tsx` (143, server) | ads `_LIST` below grid; F6, F7 |
| [ ] todo | `/courses/[subjectSlug]/[unit]` ×22 | `components/course/UnitPageClient.tsx` (283) | ads `_LESSON` outside `printRef` (gotcha 30a) |

### P3 · MCQ bank — follows the Courses direction
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/mcqs-bank` | `mcqs-bank/page.tsx` (324) | |
| [ ] todo | `/mcqs-bank/[semesterSlug]` | `mcqs-bank/[semesterSlug]/page.tsx` (245) | |
| [ ] todo | `/mcqs-bank/[semesterSlug]/[subject]` | (1774) | timed test — no-ads; dark(1) |

### P4 · Spotting — direction pending (42 page files)
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/spotting` hub | `spotting/page.tsx` (277) | F1, F2 |
| [ ] todo | histology lesson template → 16 lessons | `components/spotting/HistologyLessonTemplate/index.tsx` (694) | one file restyles 16 pages; F5 |
| [ ] todo | `/spotting/histology/lessons` index | (197) | |
| [ ] todo | `simple-columnar-epithelium` | (275, not on template) | F3 |
| [ ] todo | `/spotting/histology/test` | (1737) | timed — no-ads; local stain palette by convention |
| [ ] todo | `/spotting/pathology/lessons` index | (450) | |
| [ ] todo | 15 pathology lessons | `pathology/<slug>/page.tsx` (~553 each) | F4 |
| [ ] todo | `/spotting/pathology/test` | (1083) | timed — no-ads |
| [ ] todo | `/spotting/powder-microscopy/lessons` index + 3 lessons | (262 + ~277 ×3) | same shape as pathology |
| [ ] todo | `/spotting/powder-microscopy/test` | (974) | timed — no-ads |

### P5 · Simulations — direction pending
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/simulations` index | `simulations/page.tsx` (191, server) | no-ads |
| [ ] todo | titration | (1569) | tutorial → quiz → 4 steps |
| [ ] todo | staining-lab | (636) | tutorial → quiz → 5 steps |
| [ ] todo | buffer-lab | (1377) | |
| [ ] todo | organic-id-lab | (1143) | |
| [ ] todo | uv-lab | (1455) | |
| [ ] todo | lab-guide (bleeding time) | (1352) | |
| [ ] todo | dilution-lab | `components/Simulations/DilutionLab/DilutionLabSim` | |
| [ ] todo | disk-diffusion | `components/Simulations/DiskDiffusion/DiskDiffusionSim` | |

### P6 · Community — follows the Courses direction
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/community` | (595) + `error.tsx` | RLS-enforced data — UI only |
| [ ] todo | `/community/ask` | (216) | |
| [ ] todo | `/community/question/[id]` | (488) | |
| [ ] todo | `/community/question/[id]/answer` | (235) | |

### P7 · Dashboard — **done 2026-09-13** (session `pharma-wallah-28`)
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [x] done | `/dashboard` | `dashboard/page.tsx` + `components/dashboard/{DashboardView,Shell,Sections,CommandPalette,dashboard-data,useDashboardMotion}` | navy dark mode scoped to root; no ads; F8–F11 fixed; verified from fixtures at 1440/390 × reduce/no-pref |

### P8 · Auth — **done 2026-09-13** (direction 01, shared `src/components/auth/AuthKit.tsx`)
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [x] done | `/signin` | markup only | `?message=` notice verified; F17 still open (redirect ignored) |
| [x] done | `/signup` | markup only | |
| [x] done | `/forgot-password` | markup only | |
| [x] done | `/update-password` | markup only | mismatch path verified, 0 auth requests |
| [x] done | `/verify-otp` | markup only | auto-advance + paste verified |

### P9 · Static pages — follows the Courses/hub language
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/about-us` | (396) | |
| [ ] todo | `/faqs` | (246) | |
| [ ] todo | `/careers` | (206) | |
| [ ] todo | `/mentor` | (343) | |
| [ ] todo | `/terms` | (312) | discloses AdSense — keep wording |
| [ ] todo | `/privacy` | (273) | discloses AdSense — keep wording |
| [ ] todo | `/documentation` | `components/Documentation/*` | |
| [ ] todo | `/download` | `download/DownloadClient.tsx` (178) | **fix stale "89 calculators" — derive** |
| [ ] todo | `/contact` | `src/app/contact/page.tsx` (235) | outside `(site)` |
| [ ] todo | 404 | `src/app/not-found.tsx` + `components/NotFound` | |
| [ ] todo | APK splash (not a web page) | `mobile/app/_components/StartupSplash.tsx` | **fix stale "89" — derive** |

### P10 · Tools
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/drug-finder` | (280) | |
| [ ] todo | `/encyclopedia` | (219) | |
| [ ] todo | `/molecule-viewer` | `components/MoleculeViewer.tsx` | 3Dmol canvas labels stay Arial (by decision) |
| [ ] todo | `/prescription-reader` | (333) | AI tool — no-ads |
| [ ] todo | `/pharmacy-counter` | dynamic component | |
| [ ] todo | `/compounding-lab` | `components/ExtemporaneousCompoundingLab.tsx` | |
| [ ] todo | `/antibiogram-simulator` | `components/AntibiogramSimulator.tsx` | |
| [ ] todo | `/adr-detective` | (945) | |
| [ ] todo | `/ai-guide` | (381) | AI tool — no-ads |
| [ ] todo | `/books-library` | (1665) | |
| [ ] todo | `/flash-cards` | (3216) | |
| [ ] todo | `/flash-cards/sample` | (456) | |
| [ ] todo | `/pw` quiz | `components/PharmaWallahQuiz.tsx` | |

### P11 · Tournament + leaderboard — scoring untouched
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/tournament/games` | (286) | no-ads |
| [ ] todo | `/tournament/play` | (576) | entry-code gated; no-ads |
| [ ] todo | `/tournament/play/[game]` | (500) | server-authoritative scoring — UI only |
| [ ] todo | `/tournament/play/snake` | `components/games/snake/*` | |
| [ ] todo | `/leaderboard` | `components/tournament/LeaderboardClient.tsx` (179) | public by decision; no-ads |

### P12 · Clinical sub-brand — own identity, same craft
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/clinical` landing | `components/Clinical/ClinicalLandingPage.tsx` | |
| [ ] todo | `/clinical/about` | (1045) | |
| [ ] todo | `/clinical/adr` | (308) | |
| [ ] todo | `/clinical/amr` | `components/Clinical/amr/*` | |
| [ ] todo | `/clinical/calculators` | (164) | |
| [ ] todo | `/clinical/dose-calculators` | (159) | links the 6 clinical-only tools |
| [ ] todo | `/clinical/drug-drug-interaction` | (615) | |
| [ ] todo | `/clinical/drug-food-interaction` | (742) | |
| [ ] todo | `/clinical/encyclopedia` | (880) | |
| [ ] todo | `/clinical/resources` | (472) | dark(31) keep |
| [ ] todo | `/clinical/resources/[source]` | (36) + components | |

### P13 · Admin — last
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [ ] todo | `/admin/tournament` | (473) | no-ads; authorization untouched |

## Phase 2 — Calculators (migrate onto `@/components/calculators`)

Each tool: capture outputs for 3 input sets (incl. an edge case) over CDP **before**, migrate,
re-run — **results must match exactly**. Record the pairs in the tool's row below (or in a
`### Batch Cn evidence` section). Imports allowed: react, lucide-react, recharts, framer-motion,
`@/components/ui`, `@/components/calculators`. After each batch: `npm run mobile:build`, CSS not
~10 KB, HTML count unchanged (98), 0 ad strings, 0 secrets.

`DValueCalculator` and `SodiumCorrectionCalculator` are already on the kit and carry the **user's
own uncommitted edits** — do not touch without asking.

| # | Tool (directory = URL) | Lines | Reached from | Status | Batch |
| --- | --- | --- | --- | --- | --- |
| | **Pharmaceutical Chemistry** — 16 tools | | | | |
| 1 | [x] `mass-molarity-calculator` | 222 | hub | done 2026-09-13 (a8/A1, before/after numbers match) | C1 |
| 2 | [x] `mg-ml-to-molarity-calculator` | 240 | hub | done 2026-09-13 (a8/A1, before/after numbers match) | C1 |
| 3 | [x] `solubility-calculator` | 384 | hub | done 2026-09-13 (a8/A1, before/after numbers match) | C1 |
| 4 | [x] `dilution-calculator` | 388 | hub | done 2026-09-13 (a8/A1, before/after numbers match) | C1 |
| 5 | [x] `heat-formation-calculator` | 474 | hub | done 2026-09-13 (a8/A1, before/after numbers match) | C1 |
| 6 | [x] `HeatOfNeutralizationCalculator` | 493 | hub | done 2026-09-13 (a8/A1, before/after numbers match) | C2 |
| 7 | [ ] `pH-pka-relationship-calculator` | 504 | hub | todo | C2 |
| 8 | [ ] `molarity-calculator` | 576 | hub | todo | C2 |
| 9 | [ ] `combined-pka-suite` | 654 | hub | todo | C2 |
| 10 | [ ] `percentage-solution-calculator` | 729 | hub | todo | C2 |
| 11 | [ ] `normality-calculator` | 740 | hub | todo | C3 |
| 12 | [ ] `ppm-ppb-calculator` | 819 | hub | todo | C3 |
| 13 | [ ] `molecular-weight-finder` | 910 | hub | todo | C3 |
| 14 | [x] `percentage-yield-calculator` | 348 | hub | done (pre-existing) | — |
| 15 | [x] `theoretical-yield-calculator` | 853 | hub | done (pre-existing) | — |
| 16 | [x] `serial-dilution-calculator` | 1108 | hub | done (pre-existing) | — |
| | **Unit Conversion** — 6 tools | | | | |
| 17 | [x] `MassConversionCalculator` | 370 | hub | done 2026-09-13 (a8/A4, before/after numbers match) | C3 |
| 18 | [x] `VolumeConversionCalculator` | 380 | hub | done 2026-09-13 (a8/A4, before/after numbers match) | C3 |
| 19 | [x] `TemperatureConversionCalculator` | 429 | hub | done 2026-09-13 (a8/A4, before/after numbers match) | C4 |
| 20 | [x] `StrengthConversionCalculator` | 437 | hub | done 2026-09-13 (a8/A4, before/after numbers match) | C4 |
| 21 | [x] `ElectrolyteConversionCalculator` | 467 | hub | done 2026-09-13 (a8/A4, before/after numbers match) | C4 |
| 22 | [x] `DensityConversionCalculator` | 512 | hub | done 2026-09-13 (a8/A4, before/after numbers match) | C4 |
| | **Pharmaceutics** — 13 tools | | | | |
| 23 | [ ] `powder-flowability-calculator` | 309 | hub | todo | C4 |
| 24 | [ ] `density-calculator` | 348 | hub | todo | C5 |
| 25 | [ ] `porosity-calculator` | 375 | hub | todo | C5 |
| 26 | [ ] `compressibility-index-calculator` | 380 | hub | todo | C5 |
| 27 | [ ] `isotonicity-calculator` | 426 | hub | todo | C5 |
| 28 | [ ] `content-uniformity-calculator` | 441 | hub | todo | C5 |
| 29 | [ ] `drug-excipient-compatibility-predictor` | 532 | hub | todo | C6 |
| 30 | [ ] `tablet-disintegration-dissolution-profile-plotter` | 538 | hub | todo | C6 |
| 31 | [ ] `sterile-dose-volume` | 650 | hub | todo | C6 |
| 32 | [ ] `surface-area-particle-size-calculator` | 653 | hub | todo | C6 |
| 33 | [ ] `osmolarity-calculators` | 1092 | hub | todo | C6 |
| 34 | [ ] `osmolality-calculators` | 1196 | hub | todo | C7 |
| 35 | [x] `relative-density-bottle-calculator` | 504 | hub | done (pre-existing) | — |
| | **Biopharmaceutics & Pharmacokinetics** — 12 tools | | | | |
| 36 | [ ] `volume-distribution-calculator` | 247 | hub | todo | C7 |
| 37 | [ ] `clearance-calculator` | 319 | hub | todo | C7 |
| 38 | [ ] `ke-calculator` | 325 | hub | todo | C7 |
| 39 | [ ] `order-kinetics-calculator` | 358 | hub | todo | C7 |
| 40 | [ ] `bioavailability-calculator` | 382 | hub | todo | C8 |
| 41 | [ ] `auc-estimator` | 447 | hub | todo | C8 |
| 42 | [x] `bioequivalence-calculator` | 509 | hub | done 2026-09-13 (a8/A9, before/after numbers match) | C8 |
| 43 | [x] `half-life-calculator` | 535 | hub | done 2026-09-13 (a8/A9, before/after numbers match) | C8 |
| 44 | [x] `loading-dose-calculator` | 538 | hub | done 2026-09-13 (a8/A9, before/after numbers match) | C8 |
| 45 | [x] `maintenance-dose-calculator` | 567 | hub | done 2026-09-13 (a8/A9, before/after numbers match) | C9 |
| 46 | [x] `AccumulationIndexCalculator` | 249 | hub | done (pre-existing) | — |
| 47 | [x] `MeanResidenceTimeCalculator` | 262 | hub | done (pre-existing) | — |
| | **Pharmacology** — 6 tools | | | | |
| 48 | [ ] `drug-receptor-binding-affinity-tool` | 386 | hub | todo | C9 |
| 49 | [ ] `ed50-td50-ld50-calculator` | 459 | hub | todo | C9 |
| 50 | [ ] `dose-response-curve-generator` | 468 | hub | todo | C9 |
| 51 | [ ] `animal-dose` | 1380 | hub | todo | C9 |
| 52 | [ ] `serial-diluation` | 1920 | hub | todo | C10 |
| 53 | [x] `therapeutic-index-calculator` | 296 | hub | done (pre-existing) | — |
| | **Pharmaceutical Analysis** — 8 tools | | | | |
| 54 | [ ] `percent-purity-calculator` | 245 | hub | todo | C10 |
| 55 | [ ] `chromatographic-resolution-calculator` | 249 | hub | todo | C10 |
| 56 | [ ] `uv-analyzer-tool` | 259 | hub | todo | C10 |
| 57 | [ ] `rf-value-calculator` | 265 | hub | todo | C10 |
| 58 | [ ] `law-absorbance-calculator` | 327 | hub | todo | C11 |
| 59 | [ ] `ash-value-calculator` | 453 | hub | todo | C11 |
| 60 | [x] `uv-spectrum-plotter` | 173 | hub | done (pre-existing) | — |
| 61 | [x] `percentage-recovery-calculator` | 599 | hub | done (pre-existing) | — |
| | **Physiology** — 2 tools | | | | |
| 62 | [x] `wbc-count-calculator` | 508 | hub | done (pre-existing) | — |
| 63 | [x] `rbc-count-calculator` | 512 | hub | done (pre-existing) | — |
| | **Microbiology** — 6 tools | | | | |
| 64 | [ ] `LogReductionCalculator` | 233 | hub | todo | C11 |
| 65 | [ ] `zone-of-inhibition-calculator` | 289 | hub | todo | C11 |
| 66 | [ ] `sterilization-calculator` | 292 | hub | todo | C11 |
| 67 | [ ] `cfu-calculator` | 673 | hub | todo | C12 |
| 68 | [x] `FValueCalculator` | 314 | hub | done (pre-existing) | — |
| 69 | [x] `DValueCalculator` | 321 | hub | done (pre-existing) | — |
| | **Pharmaceutical Engineering** — 4 tools | | | | |
| 70 | [ ] `heat-transfer-area` | 223 | hub | todo | C12 |
| 71 | [ ] `drying-rate` | 264 | hub | todo | C12 |
| 72 | [ ] `reynolds-number` | 270 | hub | todo | C12 |
| 73 | [ ] `mixing-time-estimator` | 318 | hub | todo | C12 |
| | **Clinical & Hospital Pharmacy** — 13 tools | | | | |
| 74 | [x] `AnionGapCalculator` | 218 | hub | done 2026-09-13 (a8/A14, before/after numbers match) | C13 |
| 75 | [x] `iv-drip-rate-calculator` | 679 | hub | done 2026-09-13 (a8/A14, before/after numbers match) | C13 |
| 76 | [x] `pedriatic-calculator` | 821 | hub | done 2026-09-13 (a8/A14, before/after numbers match) | C13 |
| 77 | [x] `bmi-calculator` | 881 | hub | done 2026-09-13 (a8/A14, before/after numbers match) | C13 |
| 78 | [ ] `child-pugh-calculator` | 895 | hub | todo | C13 |
| 79 | [ ] `anti-coagulation-risk-calculator` | 904 | hub | todo | C14 |
| 80 | [ ] `InsulinSensitivityCalculator` | 931 | hub | todo | C14 |
| 81 | [ ] `bsa-calculator` | 940 | hub | todo | C14 |
| 82 | [ ] `creatinine-calculator` | 974 | hub | todo | C14 |
| 83 | [ ] `qt-interval-calculator` | 1059 | hub | todo | C14 |
| 84 | [x] `SodiumCorrectionCalculator` | 239 | hub | done (pre-existing) | — |
| 85 | [x] `CorrectedCalciumCalculator` | 241 | hub | done (pre-existing) | — |
| 86 | [x] `gfr-calculator` | 488 | hub | done (pre-existing) | — |
| | **Clinical-only (linked from /clinical/dose-calculators)** — 6 tools | | | | |
| 87 | [ ] `OpioidMMECalculator` | 883 | clinical | todo | C15 |
| 88 | [ ] `GeriatricDosingCalculator` | 1050 | clinical | todo | C15 |
| 89 | [ ] `vancomycin-auc-calculator` | 1163 | clinical | todo | C15 |
| 90 | [ ] `tpn` | 1175 | clinical | todo | C15 |
| 91 | [ ] `reconstitution-calculator` | 1315 | clinical | todo | C15 |
| 92 | [ ] `renal-dosing-adjuster` | 2249 | clinical | todo | C16 |
| | **Orphans (linked from nowhere on the web)** — 5 tools | | | | |
| 93 | [ ] `EmaxModelCalculator` | 225 | ORPHAN | todo | C16 |
| 94 | [ ] `AntagonismSimulator` | 268 | ORPHAN | todo | C16 |
| 95 | [ ] `OsmolarGapCalculator` | 371 | ORPHAN | todo | C16 |
| 96 | [ ] `OpioidConversionCalculator` | 382 | ORPHAN | todo | C16 |
| 97 | [ ] `drug-half-life-calculator` | 432 | ORPHAN | todo | C17 |

<!-- 97 tools, 81 to migrate in 17 batches -->

## Verification log

| Date | Batch | tsc | CDP 1440/390 × reduce/no-pref | overflow | mobile:build | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-13 | Phase 0 kit | 0 errors | no page uses the kit; server-rendered every component with `react-dom/server` via tsx (breadcrumb `aria-current`, linked figure, note, `role=alert`/`status`, Reveal visible at SSR) | — | not run (no calculator changed) | |
| 2026-09-13 | Landing riders (Science Fair strip + dialog unmounted; hero meta strip removed) | 0 errors | `/` at 1440 + 390 × reduce + no-preference: 0 exceptions, 0 console errors, scrollWidth = viewport; screenshots read | none | not run (landing is web-only) | |
| 2026-09-13 | P8 auth + landing dock + brand rule | 0 errors | 5 auth pages + `/` × 1440/390 × reduce/no-pref: 24/24 clean; screenshots read; OTP + mismatch interactions driven | none | not run (no calculator changed) | preview artifact watch reported "not found" — it may have been deleted |
| 2026-09-13 | Preview artifact | — | local file at 1280 light + 390 dark, every tab × both mock viewports: 0 exceptions, no overflow; screenshots read, two copy/visual faults fixed before publishing | none | — | |

## Short rules (from the brief)

- UI only. No change to data fetching, route handlers, auth/authorization, tournament scoring,
  progress tracking. If a UI change needs a logic change → stop and ask.
- Preserve every AdSense placement and exclusion; never an `AdSlot` inside an animated/transformed parent.
- GSAP only in `src/components/Home/landing/`. Everything else: framer-motion or CSS.
- One signature moment per family at most. No purple→blue gradients, no blurred blobs.
- Keep existing `dark:` support. Clinical keeps its identity.
- Verify every batch: `npx tsc --noEmit` 0 errors; CDP 1440×900 + 390×844, reduced motion on and
  off, exceptions + console errors, `scrollWidth`; `captureBeyondViewport`; preset
  `pw_launch_banner_dismissed_at`. Never `npm run build` while dev runs.
- Stop at batch boundaries. Don't commit or push unless asked.
