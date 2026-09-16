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
| 1 Pages | **in progress** — P1 hub, P7 dashboard and P8 auth done; the rest wait for a direction | |
| 2 Calculators | **in progress** 2026-09-13 — session `pharma-wallah-3d` (was `-a8` before the reboot) owns all remaining tools except 14 Pharm-Chem/Pharmaceutics ones held by `pharma-wallah-9c` (was `-4d`); F16 fixed in `CalculatorShell`. Originals for before/after checks: commit `5dbe98c` | Do not start a batch without checking with 3d |

## Chosen directions

| Family | Representative page | Direction chosen | Rider |
| --- | --- | --- | --- |
| Calculation-tools hub | `/calculation-tools` | **01 The Index + 03 search** (user, 2026-09-13: "update the UI of /calculation-tools using top-design … make it fast" — recommendation taken, no number given) | Speed was the other half of the brief: server-rendered, readable without JS |
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
| F12 | `/calculation-tools` | Hero says **"86+ Calculators"** — 86 is the hub list; 97 tools exist (6 clinical-only, 5 orphans). Every card shows the same generic icon | `allTools.length` | P1 hub — **fixed 2026-09-13** (count derived from `tool-index.ts`; icons replaced by a one-line description per tool) |
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

### P1 · Calculation-tools hub — **done 2026-09-13** (direction 01 + 03)
| Status | Page | File | Notes |
| --- | --- | --- | --- |
| [x] done | `/calculation-tools` | `calculation-tools/{page.tsx,HubCatalogue.tsx,hub.css,tool-index.ts}` (`CalculationToolsClient.tsx` deleted) | ads `_LIST` kept above the sections (plain div, hidden on no results); F12 fixed; 93 tools; verified 1440/390, reduced motion, JS disabled |
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
| [x] done | `/about-us` | rebuilt 2026-09-16 | **Not the P9 static-page language** — the user asked for an intro/character-select screen and a GSAP-heavy page, so it is its own treatment: a dark roster stage, a scrubbed word-by-word quote, a chapter rail. 31 CDP assertions pass; build 111 kB first load. Removed 3 fabricated figures and 48 dead social buttons |
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
| [x] done 2026-09-13 | `/encyclopedia` | `components/encyclopedia/*` | direct user request ("update the UI with top-design"), no mockup round; reference-desk cover + result index + monograph reader; search API rebuilt |
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
| [ ] todo | `/clinical/encyclopedia` | (880) | same `/api/search` as `/encyclopedia` — reuse `components/encyclopedia/Monograph` under the clinical identity |
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
| 7 | [x] `pH-pka-relationship-calculator` | 504 | hub | done 2026-09-13 (9c, before/after numbers match) | C2 |
| 8 | [x] `molarity-calculator` | 576 | hub | done 2026-09-13 (9c, before/after numbers match) | C2 |
| 9 | [x] `combined-pka-suite` | 654 | hub | done 2026-09-13 (9c, before/after numbers match) | C2 |
| 10 | [x] `percentage-solution-calculator` | 729 | hub | done 2026-09-13 (9c, before/after numbers match) | C2 |
| 11 | [x] `normality-calculator` | 740 | hub | done 2026-09-13 (9c, before/after numbers match) | C3 |
| 12 | [x] `ppm-ppb-calculator` | 819 | hub | done 2026-09-13 (9c, before/after numbers match) | C3 |
| 13 | [x] `molecular-weight-finder` | 910 | hub | done 2026-09-13 (9c, before/after numbers match) | C3 |
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
| 23 | [x] `powder-flowability-calculator` | 309 | hub | done 2026-09-13 (3d/R1, before/after numbers match) | C4 |
| 24 | [x] `density-calculator` | 348 | hub | done 2026-09-13 (3d/R1, before/after numbers match) | C5 |
| 25 | [x] `porosity-calculator` | 375 | hub | done 2026-09-13 (3d/R1, before/after numbers match) | C5 |
| 26 | [x] `compressibility-index-calculator` | 380 | hub | done 2026-09-13 (3d/R1, before/after numbers match) | C5 |
| 27 | [x] `isotonicity-calculator` | 426 | hub | done 2026-09-13 (3d/R1, before/after numbers match) | C5 |
| 28 | [x] `content-uniformity-calculator` | 441 | hub | done 2026-09-13 (3d/R1, before/after numbers match) | C5 |
| 29 | [x] `drug-excipient-compatibility-predictor` | 532 | hub | done 2026-09-13 (9c, before/after numbers match) | C6 |
| 30 | [x] `tablet-disintegration-dissolution-profile-plotter` | 538 | hub | done 2026-09-13 (9c, before/after numbers match) | C6 |
| 31 | [x] `sterile-dose-volume` | 650 | hub | done 2026-09-13 (9c, before/after numbers match) | C6 |
| 32 | [x] `surface-area-particle-size-calculator` | 653 | hub | done 2026-09-13 (9c, before/after numbers match) | C6 |
| 33 | [x] `osmolarity-calculators` | 1092 | hub | done 2026-09-13 (9c, before/after numbers match) | C6 |
| 34 | [ ] `osmolality-calculators` | 1196 | hub | todo | C7 |
| 35 | [x] `relative-density-bottle-calculator` | 504 | hub | done (pre-existing) | — |
| | **Biopharmaceutics & Pharmacokinetics** — 12 tools | | | | |
| 36 | [x] `volume-distribution-calculator` | 247 | hub | done 2026-09-13 (3d/R2, before/after numbers match) | C7 |
| 37 | [x] `clearance-calculator` | 319 | hub | done 2026-09-13 (3d/R2, before/after numbers match) | C7 |
| 38 | [x] `ke-calculator` | 325 | hub | done 2026-09-13 (3d/R2, before/after numbers match) | C7 |
| 39 | [x] `order-kinetics-calculator` | 358 | hub | done 2026-09-13 (3d/R2, before/after numbers match) | C7 |
| 40 | [x] `bioavailability-calculator` | 382 | hub | done 2026-09-13 (3d/R2, before/after numbers match) | C8 |
| 41 | [x] `auc-estimator` | 447 | hub | done 2026-09-13 (3d/R2, before/after numbers match) | C8 |
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
| 52 | [x] `serial-diluation` | 1920 | hub | done 2026-09-14 (4b, 359/359 values match) | C10 |
| 53 | [x] `therapeutic-index-calculator` | 296 | hub | done (pre-existing) | — |
| | **Pharmaceutical Analysis** — 8 tools | | | | |
| 54 | [x] `percent-purity-calculator` | 245 | hub | done 2026-09-13 (3d/R3, before/after numbers match) | C10 |
| 55 | [x] `chromatographic-resolution-calculator` | 249 | hub | done 2026-09-13 (3d/R3, before/after numbers match) | C10 |
| 56 | [x] `uv-analyzer-tool` | 259 | hub | done 2026-09-13 (3d/R3, before/after numbers match) | C10 |
| 57 | [x] `rf-value-calculator` | 265 | hub | done 2026-09-13 (3d/R3, before/after numbers match) | C10 |
| 58 | [x] `law-absorbance-calculator` | 327 | hub | done 2026-09-13 (3d/R3, before/after numbers match) | C11 |
| 59 | [x] `ash-value-calculator` | 453 | hub | done 2026-09-13 (3d/R3, before/after numbers match) | C11 |
| 60 | [x] `uv-spectrum-plotter` | 173 | hub | done (pre-existing) | — |
| 61 | [x] `percentage-recovery-calculator` | 599 | hub | done (pre-existing) | — |
| | **Physiology** — 2 tools | | | | |
| 62 | [x] `wbc-count-calculator` | 508 | hub | done (pre-existing) | — |
| 63 | [x] `rbc-count-calculator` | 512 | hub | done (pre-existing) | — |
| | **Microbiology** — 6 tools | | | | |
| 64 | [x] `LogReductionCalculator` | 233 | hub | done 2026-09-13 (3d/R3, before/after numbers match) | C11 |
| 65 | [x] `zone-of-inhibition-calculator` | 289 | hub | done 2026-09-13 (3d/R3, before/after numbers match) | C11 |
| 66 | [x] `sterilization-calculator` | 292 | hub | done 2026-09-13 (3d/R3, before/after numbers match) | C11 |
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
| 78 | [x] `child-pugh-calculator` | 895 | hub | done 2026-09-13 (3d/R4, before/after numbers match) | C13 |
| 79 | [x] `anti-coagulation-risk-calculator` | 904 | hub | done 2026-09-13 (3d/R4, before/after numbers match) | C14 |
| 80 | [x] `InsulinSensitivityCalculator` | 931 | hub | done 2026-09-13 (3d/R4, before/after numbers match) | C14 |
| 81 | [x] `bsa-calculator` | 940 | hub | done 2026-09-13 (3d/R4, before/after numbers match) | C14 |
| 82 | [x] `creatinine-calculator` | 974 | hub | done 2026-09-13 (3d/R4, before/after numbers match) | C14 |
| 83 | [x] `qt-interval-calculator` | 1059 | hub | done 2026-09-13 (3d/R4, before/after numbers match) | C14 |
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
| 93 | [x] `EmaxModelCalculator` | 225 | ORPHAN | done 2026-09-13 (3d/R5, before/after numbers match) | C16 |
| 94 | [ ] `AntagonismSimulator` | 268 | ORPHAN | todo | C16 |
| 95 | [x] `OsmolarGapCalculator` | 371 | ORPHAN | done 2026-09-13 (9c, before/after numbers match) | C16 |
| 96 | [ ] `OpioidConversionCalculator` | 382 | ORPHAN | todo | C16 |
| 97 | [x] `drug-half-life-calculator` | 432 | ORPHAN | done 2026-09-13 (3d/R2, before/after numbers match) | C17 |

<!-- 97 tools at the start (104 after the six analytical-practical tools + master formula); 81 to migrate.
     State at the 2026-09-13 safe stop: 85 of 104 on the kit. Still to migrate (19): animal-dose,
     AntagonismSimulator, cfu-calculator, dose-response-curve-generator, drug-receptor-binding-affinity-tool,
     drying-rate, ed50-td50-ld50-calculator, GeriatricDosingCalculator, heat-transfer-area,
     mixing-time-estimator, OpioidConversionCalculator, OpioidMMECalculator, osmolality-calculators (9c),
     reconstitution-calculator, renal-dosing-adjuster, reynolds-number, serial-diluation, tpn,
     vancomycin-auc-calculator. Before-captures for animal-dose, R6's five and R5's four were taken but
     lived in a /tmp scratchpad — re-capture from 5dbe98c. -->

## Suspected maths issues found during Phase 2 (NOT fixed — owner decision; fixing is logic work)

Found by the migration agents while comparing each original (`5dbe98c`) with its migrated page.
Migration keeps the maths byte-identical, so **every item below is still live on the site and in
the APK**. Items under "NOT migrated" were found by reading/driving the original only. This list
supersedes nothing in CLAUDE.md Known Issue 15 (a separate hub audit) — the two overlap and agree.
Batches labelled A* ran in session `pharma-wallah-a8`, R* in `pharma-wallah-3d` (same session after
the reboot). pharma-wallah-9c's 14 tools report their own list.

## A9 — Pharmacokinetics
- bioequivalence-calculator: alpha select is ignored (z = 1.645 always). Uses arithmetic ratio + CV-derived SE, not log-transformed GMR with t; "power" = 100 − 2×CV. (Stale-state verdict bug that ignored Cmax on first load WAS fixed — render bug.)
- half-life-calculator: concentration method double-converts time for minutes/days (6 min → 179.96 "min", should be 3.00); interpretation bands assume hours for any unit.
- loading-dose-calculator: example Vd values are L/kg but used as total L (vancomycin 20×0.7 = 14 mg); weight-based dose always equals plain dose; ">5000 very large" band unreachable (">1000" checked first); digoxin example is mcg but labelled mg.
- maintenance-dose-calculator: without half-life, time-to-steady-state assumes Vd = 50 L for every drug; q8h classed "Twice daily" (≤12 band); several example Cl/targets implausible or mcg.

## A14 — Clinical
- AnionGapCalculator: interpretation low <6 / elevated >12 contradicts page's own normal 8–12; "Elevated AG metabolic acidosis" printed without checking bicarbonate.
- pedriatic-calculator: mg/kg mode always says "Appropriate" (even 0 mg); amoxicillin/prednisolone presets are mg/kg/DAY but field is single dose; diphenhydramine preset uses Young's rule despite 1.25 mg/kg note; Fried's rule (infants) applied at any age.
- bmi-calculator: healthy range + weight-change always WHO 18.5–24.9 even in Asian mode; IBW equations run below 60 in (Hamwi −7.7 kg at 100 cm) and AdjBW builds on it; lbs rounded to 0.1 kg before BMI.

## A4 — Unit conversion
- **StrengthConversionCalculator (SERIOUS):** mass unit "g" factor is 10000 where it should be 0.01 → answers 1,000,000× wrong (0.9% → "9000 g/g"; 2% v/v → "16,000,000 g/L"). w/w labelled "mg/mg" (should be mg/g). v/v step multiplies by density — questionable both directions.
- **DensityConversionCalculator (SERIOUS):** mass/volume unit selectors are labels only (100 mg water → "100.00 mL"; kg/L never change the number). Caution line added; maths unchanged.
- Mass/VolumeConversion: "conversion factor" line inverted ("1 mg = 1000 g"); "significant figures" control is actually decimal places.
- VolumeConversion: tsp = 4.92892 mL in converter vs 5 mL in equivalents table (explained in FAQ).
- TemperatureConversion: storage bands have gaps (−15 to 2 °C, 8 to 15 °C → "Special storage"); freezer ≤ −15 °C contradicts page's USP −25 to −10 °C; 37 °C labelled "Excessive heat".
- ElectrolyteConversion: phosphate as PO₄³⁻ MW 94.97 valence 3 — clinically dosed as mmol P (30.97), avg charge ~1.8 → misleading mEq/mg.

## A1 — Pharmaceutical chemistry
- solubility-calculator: "mg/mL" = g/L × 1000 (should be ×1); "mol/L" divides by gram-equivalent weight (always N/10); S = N × G.W / 10 gives g/100 mL, labelled g/L; bands applied to the number in the chosen unit; "sig figs" are decimals.
- heat-formation-calculator: actually van't Hoff enthalpy of solution, not heat of formation; temps must be > 0 in entered unit (0 °C rejected); at ΔH = 0 badge "Exothermic" vs band "endothermic".
- HeatOfNeutralizationCalculator: molar ΔH = +ΔQ/n (positive for warming) vs reference table's −57.9 convention; at ΔQ = 0 "Exothermic" + "heat absorbed".
- dilution-calculator: C₁/C₂ modes don't check V₂ ≥ V₁.

## R1 — Pharmaceutics
- powder-flowability-calculator: bands (<15 Good, <25 Passable, <31 Poor) contradict the page's own scale (16–20 Fair, >25 Poor); samples mislabelled ("Excellent" 0.45/0.55 → 18.18% Fair).
- density-calculator: tapped mode subtracts a "container volume" (non-standard); bulk mode can print negative density (now flagged).
- porosity-calculator: <10% classed "Non-porous" but scale says "Very Low".
- compressibility-index-calculator: Hausner scale (<1.18 Excellent) contradicts table (1.00–1.11) and "Target <1.25"; "USP ≤20% good" vs Passable band at 20%.
- isotonicity-calculator: mM conversion ×0.001 regardless of MW (150 mM = 0.15%); osmolality scaled from 0.9% not computed; alternatives = NaCl ÷ E.
- **content-uniformity-calculator (SERIOUS for a USP test):** AV computed in label units not % of label (label 250 mg compared with L1 = 15 → too lenient); k always 2.4 (USP 2.0 for n = 30); Stage 2 "all units 75–125%" never checked; Stage 2 needs ≥24 units typed, failed Stage 1 shows FAIL instead of "go to Stage 2".

## R2 — Pharmacokinetics
- drug-half-life-calculator: kₑ rounded to 4 dp before other figures (t½ 2000 h → accumulation 139.39 vs ~120.8 unrounded); peak/trough are mg amounts not concentrations. (Decorative sawtooth replaced by a real chart from the same numbers.)
- auc-estimator: unit selector relabels only (dose/CL mode "ng·h/mL" 1000× wrong); exposure bands ignore unit/drug; extrapolation from last two points only. OLD PAGE CRASHED on any edit (in-place sort of state) — fixed by migration. "Clearance (multiple doses)" mode never had inputs → kept as "Not available yet": owner to decide keep/drop.
- clearance-calculator: per-kg always 70 kg; organ pie chart fixed illustrative numbers.
- bioavailability-calculator: dose estimate uses one textbook F per route; illustrative AUCs = dose × F × 0.5.
- order-kinetics-calculator: mixed-kinetics simulation steps coarsely over gaps up to 12 h → falls too fast.

## R4 — Clinical
- InsulinSensitivityCalculator: "Calculates ~X units" TDD preview ignores lb (180 lb → ~126 vs correct 57.2 when applied).
- **creatinine-calculator:** CKD G-stage taken from Cockcroft-Gault CrCl, not eGFR (eGFR 44.7 labelled G3a because CrCl 57.7); dosing tiers (>50/30–50) misaligned with G bands; age ≥140 → negative CrCl (field warning added only).
- qt-interval-calculator: QRS > 120 adjustment applies even with bundle-branch-block unticked (field now always visible so it's not hidden); default QT 430 @ 70 bpm → 453 "borderline".
- child-pugh / anti-coagulation: old example tags didn't match scores (tags already dropped).
- bsa-calculator: dose uses unrounded BSA, comparison table 3-dp BSA → 0.1 mg differences.

## R3 — Analysis + Microbiology
- percent-purity-calculator: original labelled W in mg but examples only work with W in g, E in g/mEq (label now says g; numbers same).
- chromatographic-resolution: old "HPLC Rs 2.4" chip wrong (actual 2.67) — chips now computed.
- uv-analyzer-tool: "Pure Protein"/"Contaminated" examples read "Protein contamination" (A260/280 < 1.5 band labelling inverted for protein samples).
- rf-value-calculator: Rf > 1 labelled "Very non-polar" instead of invalid (warning added).
- ash-value-calculator: W₃ < W₁ negative ash counts as "within limits"; pass/fail uses ≤15/5/20% while monograph limits are stricter (cellulose ≤0.5% → 2.00% "passes").
- LogReductionCalculator: "≥5 log meets sterilization" contradicts page's own 6-log figure.
- zone-of-inhibition-calculator: one set of cut-offs (≥20 S, 15–19 I, <15 R) for every drug despite the drug-specific CLSI table on the page; example labels contradicted bands.
- sterilization-calculator: "lethality curve" is a flat line; F₀-per-minute table uses ~121.1 °C reference (121 °C → 0.975); standards list (F₀ ≥ 8, ≥2.52) disagrees with result bands (≥6, ≥3); old header formula hard-coded 121/z=10.

## R8 — Clinical-only (NOT migrated; found by reading the original code only, unverified by running)
- **OpioidMMECalculator:** tramadol factor 0.1 (CDC 2022: 0.2); oral hydromorphone 4.0 (CDC 2022: 5; the conversion tool uses 5); rotation TO fentanyl patch divides the 24 h mcg/hr target by a greyed-out frequency (default 2) → patch rate halved; breakthrough dose in mcg/hr labelled "orally q3–4h" (also for IV targets); sleep apnoea/COPD naloxone flag only fires 50–89 MME; renal/hepatic checkbox changes no number; blank dose = 0, negative doses accepted.
- **OpioidConversionCalculator:** fentanyl factor 100/mg with transdermal multiplier 1 and patch dose entered in "mg" → 25 → 2500 MME (code comment admits placeholder); methadone flat factor 4 (real ratio is dose-dependent); every IV/SC dose ×3 (IV hydromorphone 15× oral morphine vs 20× in MME tool); no cross-tolerance reduction applied (100% equianalgesic, only a warning); route corrected one render late after drug change.
- **GeriatricDosingCalculator:** renal rule text says min(1, CrCl/100) but dose floors at 0.2 (<CrCl 20 mismatch), frailty floor 0.15; 33% rule uses 0.333; blank age → 65, age > 140 → negative CrCl silently clamped; digoxin preset 33% rule → 0.08 mg vs note's 0.125 mg max; lorazepam note says 50% but preset selects 33%; apixaban/citalopram/levothyroxine presets keep previous rule; levothyroxine adult dose 0.1 "mg" vs note in mcg.

## R7 — Pharmacology (NOT migrated; before-capture only for animal-dose)
- animal-dose: scales dose linearly by body weight (normalised mg/kg always = adult mg/kg) — standard human↔animal conversion uses BSA/Km factors (rodents ~6–12× more); formatter ignores requested decimals (≥1 → 3 dp; small values lose precision: "0.0001 mg" vs "0.13 µg"); volume-limit warning follows species preset, not entered weight.
- serial-diluation (code reading only): auto-plan caps at 6 tubes → for ~10⁸-fold dilutions the remaining factor is silently dropped; empty/zero default aliquot silently becomes 1 mL. **Measured 2026-09-14 (4b):** planned volumes rounded to 4 dp, so prednisolone delivers 34.999 µg for 35 µg; `fmt` shows a 0.000001 mg target as "0 mg"; the stock-too-dilute summary prints "1:0×"; the ±5% band is the tool's own. The cap and the aliquot fallback are now stated on screen (numbers unchanged).

## R6 — Microbiology + Engineering (NOT migrated; before-captures saved)
- **mixing-time-estimator (SERIOUS):** t = K × (D/d)² × (1/N) × 60 with N already in rev/s → every result 60× too long (1.5 m tank, 0.5 m impeller, 4 rps → 540 s instead of 9 s); power number jumps 0.7 → 5.0 at Re 10,000.
- **drying-rate (CRASH):** initial = final moisture → chart loop never terminates, page freezes; plotted "rate" is cumulative water removed; phase from fixed final-moisture cut-offs; final > initial → negative rates, no warning; stale result on invalid input.
- heat-transfer-area: W/BTU/h selector relabels only (no conversion; area always m²-banded); stale result after alert.
- reynolds-number: Blasius friction factor used in transitional 2000–4000 band; tiny inputs → "Re 0", f 973.38; alert fires on every keystroke for invalid values.
- cfu-calculator: "CFU at different dilutions" chart multiplies the same count by each dilution (doesn't match caption; breaks log scale at 0); message "Too few colonies (>30)" should be <30; "Environmental air" limits row not selectable and "Air Monitoring" example graded against water limits.

## R5 — Pharmacology (only EmaxModelCalculator migrated)
- EmaxModelCalculator: bands compare absolute effect with fixed 50/80% instead of half the entered Emax (Emax 80 at C = EC₅₀ → "Below EC₅₀"); curves capped at 100%; Hill n ≤ 0 accepted.
- **ed50-td50-ld50-calculator (SERIOUS, not migrated):** probit transform only valid for half the probability range → rising dose–response fits a NEGATIVE slope (rat example "Probit = 11.63 − 2.74 log dose", χ² 519 "POOR FIT"); ED₅₀ always = LD₅₀; expected responses logistic not normal; χ² includes 0/100% doses but df excludes them, critical value fixed 9.49; "maximum likelihood" is actually weighted LS; rabbit example CI "0.0–Infinity"; species/route/strain/weight collected but unused.
- AntagonismSimulator (not migrated): "uncompetitive" formula identical to non-competitive, EC₅₀ shift always 1; k_b = 0 → "NaN%"; stale result on invalid input; "[citation:1]" markers in text.
- drug-receptor-binding-affinity-tool (not migrated): Cheng–Prusoff uses the entered [L] as radioligand concentration and also for the drug's occupancy; example affinity labels one band off; stale result after error.
- dose-response-curve-generator (not migrated): log-scale x-axis spans only the EC₅₀ dots (0–1 by default) → most of the curve cut off (display bug).

## 9c — Pharmaceutical Chemistry + Pharmaceutics (session `pharma-wallah-9c`, was `-4d`; osmolality-calculators not started)
- **surface-area-particle-size-calculator (SERIOUS):** SSA 1000× too high (23188 m²/kg vs 23.2); laser mean divides by 100 not the actual total; out-of-range D90 silently falls back to coarsest size; density blank/0 treated as 1.
- **ppm-ppb-calculator (SERIOUS):** mg/L→M ignores MW (factor 1: 250 mg/L → 2.5e-4 M); molar values feed the ppm bands; "other solvent" divides only ppm by density.
- **sterile-dose-volume (SERIOUS):** dose and concentration units never reconciled (mcg dose + mg/mL vial = 1000×); final concentration always labelled mg/mL; volume bands applied in displayed unit (2 mL shown as 2000 µL = "Large"); ">50 excessive" unreachable.
- **osmolarity-calculators (SERIOUS):** TPN inputs labelled g/L but factors per-% (10× high; default 5374 mOsm/L); serum "Advanced" ignores ethanol; serum osmolar gap always 0; buffer pH term unphysical; D5NS preset 560 (usually ~586).
- **molecular-weight-finder:** "10 mg" quick calc is mmol labelled mol (1000×); parser rejects a count after a bracket (Ca(OH)2, (NH4)2SO4) and hydrate dots.
- percentage-solution-calculator: no unit conversion (0.9% of 1 L → "0.009 g"); w/v solvent = solution − solute subtracts g from mL; "sig figs" are decimals.
- normality-calculator: invalid n/MW silently falls back to the last Eq.W; sg/purity checks block solids.
- molarity-calculator: blank sg/purity passes validation; 0% purity divides by zero; sg/purity checks block solid mode.
- pH-pka-relationship-calculator: "relative buffer capacity %" peaks at 57.6%, not 100%.
- combined-pka-suite: ½(pKa − log C) shortcut gives pH 7–15 for very dilute acids; example bands contradict code bands; exactly 50% ionised reads "Protonated"; bases treated as acids.
- tablet-disintegration-dissolution-profile-plotter: Q check needs a point at exactly 30 min (no interpolation); "Meets Q=80%" ignores its own S1 = Q+5% rule.
- drug-excipient-compatibility-predictor: only primary amines linked to lactose (secondary also Maillard); phenol oxidation advice missing; metals never paired with phenol/thiol.
- OsmolarGapCalculator: none.
- Display/state bugs 9c fixed (maths unchanged): previous-mode results left on screen (6 tools); percentage-solution unit labels swapped (v/v "g", w/w "mL"); molecular-weight "NaXx" showed 22.99; surface-area crashed on editing a sieve opening; pH-pka "pKa = ratio" label. Dead `src/components/MolarityCalculator.tsx` removed (no importers).

## Verification log

| Date | Batch | tsc | CDP 1440/390 × reduce/no-pref | overflow | mobile:build | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-13 | Phase 0 kit | 0 errors | no page uses the kit; server-rendered every component with `react-dom/server` via tsx (breadcrumb `aria-current`, linked figure, note, `role=alert`/`status`, Reveal visible at SSR) | — | not run (no calculator changed) | |
| 2026-09-13 | Landing riders (Science Fair strip + dialog unmounted; hero meta strip removed) | 0 errors | `/` at 1440 + 390 × reduce + no-preference: 0 exceptions, 0 console errors, scrollWidth = viewport; screenshots read | none | not run (landing is web-only) | |
| 2026-09-13 | P8 auth + landing dock + brand rule | 0 errors | 5 auth pages + `/` × 1440/390 × reduce/no-pref: 24/24 clean; screenshots read; OTP + mismatch interactions driven | none | not run (no calculator changed) | preview artifact watch reported "not found" — it may have been deleted |
| 2026-09-13 | Preview artifact | — | local file at 1280 light + 390 dark, every tab × both mock viewports: 0 exceptions, no overflow; screenshots read, two copy/visual faults fixed before publishing | none | — | |
| 2026-09-13 | Phase 2 batches A1/A4/A9/A14 (a8), R1–R5 (3d) — 49 tools migrated or re-verified | 0 source errors (only stale `.next/types` stubs for deleted `migration-before/*` routes) | every tool: original from `5dbe98c` served on a temp route vs new page, 3–10 input sets, every result number identical; new page at 1440×900 + 390×844, 0 exceptions, 390 screenshot read | none (scrollWidth = viewport) | not run by 3d (fc: passed 108 HTML / 105 tools, 0 ads, 0 secrets; APK build handed to 9c) | F16 fixed in `CalculatorShell`. Safe stop at the user's request; 18 of 3d's tools untouched |

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
