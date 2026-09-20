# PROJECT MAP — PharmaWallah

"Where is this implemented?" Only meaningful entry points are listed. Paths are repo-relative.

---

## Quick lookup

| Question | Answer |
| --- | --- |
| Where is auth enforced? | `src/middleware.ts` (`PROTECTED_PATHS`) + per-route `auth.getUser()` |
| How do I get the logged-in user on the server? | `createServerSupabaseClient()` — `src/lib/supabase-server.ts` |
| How do I get the logged-in user in a client component? | `useSupabaseUser()` — `src/hooks/useSupabaseUser.ts` |
| How do I bypass RLS (carefully)? | `createServiceSupabaseClient()` — same file. Read `MEMORY.md` §3 first |
| Who is an admin? | Hardcoded `ADMIN_EMAILS` in the three `src/app/api/admin/**/route.ts` files |
| Where's the Mongo connection? | `src/lib/mongodb.ts` (mongoose → `pharmawallah`) **and** `lib/mongodb.tsx` (native → `pharmacopedia`) |
| Where's Redis / rate limiting? | `src/lib/redis.ts` + `src/lib/rateLimit.ts` (progress); `src/lib/tournament-redis.ts` (tournament) |
| Where is the DB schema? | **Not in this repo.** Supabase dashboard only — see `MEMORY.md` §8 gotcha 2 |
| How do I add a calculator? | `.claude/skills/calculator-tool/SKILL.md` |
| Where is the Android app? | `mobile/` (second Next project) + `android/` — see `.claude/skills/android-app-capacitor/SKILL.md` |
| How do I add a course subject? | `.claude/skills/course-content-system/SKILL.md` |
| Where's the list of calculators shown on the hub? | `HUB_SUBJECTS` in `src/app/(site)/calculation-tools/tool-index.ts` |
| Where's the subject registry? | `src/lib/courses/registry.ts` |
| Where does lesson markdown live? | `public/content/<subject>/<unit>.md` (69 files); also `src/content/` |
| How is progress recorded? | `src/lib/activityQueue.ts` → `/api/progress/batch` → `applyProgressEvent()` |
| Where are Gemini prompts? | Inline in each AI route under `src/app/api/` — see the AI table below |
| Where are external drug/literature API clients? | `src/lib/api/*.ts` |
| Where are the brand colours? | `tailwind.config.ts` (`brandBlue`, `brandGreen`, `clinical*`) |
| Where is the clinical subdomain detected? | `src/middleware.ts` → `x-subdomain` header → `src/app/layout.tsx` |
| How do I add an ad? | `<AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_*} />` — `.claude/skills/adsense-monetization/SKILL.md` |

---

## Cross-cutting infrastructure

| Concern | Files |
| --- | --- |
| Root layout, theming, PWA manifest, analytics | `src/app/layout.tsx`, `src/components/AppShell.tsx`, `public/manifest.json` |
| **Advertising (AdSense)** | `src/components/calculators/AdSlot.tsx` (the only placement component), the loader in `src/app/layout.tsx`, `public/ads.txt`, `src/app/(site)/calculation-tools/(tools)/layout.tsx` (nav strip + band under every tool). The home landing has no placement. |
| Subdomain + auth gating | `src/middleware.ts` |
| Build / PWA config | `next.config.mjs` |
| Design tokens | `tailwind.config.ts`, `src/app/globals.css`, `src/Style/` |
| Loading screens | `src/components/loading/PharmaLoader.tsx` + `pharma-loader.css` (shared mark), `src/app/loading.tsx` (website route loading), `mobile/app/_components/StartupSplash.tsx` (Android splash) |
| Header / footer / nav | `src/components/Layout/Header/` (reading-progress hairline, Android "Get the app" CTA `AppCta`, `.pw-brand-btn` in `index.tsx`; desktop layout from `xl`), `src/components/Layout/Footer/` (one responsive grid on the brand gradient) |
| Favicon / app icons | `src/app/favicon.ico`, `src/app/icon.png`, `src/app/apple-icon.png` (Next file convention; generated from `public/icons/icon-512x512.png` — `MEMORY.md` gotcha 58) |
| Science Fair launch dialog (site-wide, 24h dismissal) | `src/components/LaunchPopup.tsx`, mounted by `src/components/AppShell.tsx` |
| Desktop mega menu | `src/components/Layout/Header/MegaMenu.tsx` (Radix NavigationMenu) + `Navigation/menuMeta.tsx` (icons/tints/descriptions, shared with the mobile drawer) |
| Footer wordmark | `src/components/Layout/Footer/Wordmark.tsx` |
| shadcn/ui primitives | `src/components/ui/{button,card,badge,input,label,navigation-menu,separator,alert,progress,tabs}.tsx` (the last four dependency-free), `cn()` in `src/lib/utils.ts`, tokens in `src/app/globals.css` — **shared with the Android app** |
| 404 | `src/app/not-found.tsx`, `src/components/NotFound/` |

---

## Authentication & accounts

| Piece | File |
| --- | --- |
| Browser Supabase client | `src/lib/supabase.ts` |
| Server + service-role clients | `src/lib/supabase-server.ts` |
| Service-role singleton (`supabaseAdmin`) | `src/lib/supabase-admin.ts` |
| Client-side user hook | `src/hooks/useSupabaseUser.ts` |
| OAuth / magic-link callback | `src/app/api/auth/callback/route.ts` |
| Route gating | `src/middleware.ts` → `PROTECTED_PATHS` |
| Sign in / sign up / OTP / password reset pages | `src/app/(site)/{signin,signup,verify-otp,forgot-password,update-password}/page.tsx` (logic) |
| Shared auth page frame (layout, brand panel, fields, buttons) | `src/components/auth/AuthKit.tsx` |
| Brand gradient surfaces (no black grounds) | `src/components/page-kit/brand.ts` |

---

## Progress tracking & dashboard

| Piece | File |
| --- | --- |
| Page | `src/app/(site)/dashboard/page.tsx` |
| UI (props-only view) | `src/components/dashboard/DashboardView.tsx` → `Shell.tsx` (rail, top bar, sheet, account), `Sections.tsx` (panels), `CommandPalette.tsx` (⌘K) |
| Every derived figure (streak, coverage, next-up, milestones) | `src/components/dashboard/dashboard-data.ts` |
| Dashboard motion (lazy GSAP) + styles | `src/components/dashboard/useDashboardMotion.ts`, `dashboard.css` (`.pw-dash`) |
| Signed-in `/` → `/dashboard`; no header/footer there | `src/middleware.ts`, `src/components/AppShell.tsx` |
| "Mark as read" event | `useTracker().markUnitRead` → `unit_progress.completed` |
| Read + single-write API | `src/app/api/progress/route.ts` |
| Batched-write API | `src/app/api/progress/batch/route.ts` |
| **Shared write logic + validation** | `src/lib/progress-server.ts` → `applyProgressEvent()`, `ProgressEventValidationError` |
| Client batching queue | `src/lib/activityQueue.ts` |
| Client read hook (module-scope cache, 20s stale) | `src/hooks/useProgress.ts` |
| Page-visit tracker | `src/hooks/useTracker.ts`, `src/components/UnitTracker.tsx` |
| Cache keys / TTL | `src/lib/redis.ts` → `progressCacheKey()`, `PROGRESS_CACHE_TTL_SECONDS` |
| Rate limiters | `src/lib/rateLimit.ts` |
| Authorization point | Inside both progress routes: `auth.getUser()` then `.eq("user_id", user.id)` on a **service-role** client |
| Tables | `progress`, `unit_progress`, `flashcard_progress`, `quiz_attempts`, `spotting_progress`, `activity_log` |

---

## Tournament (entry-code competition)

| Piece | File |
| --- | --- |
| Home-page promo section | `src/components/Home/tournament/index.tsx` (**there is no `/tournament` landing page — `/tournament` itself 404s; entry is `/tournament/play`**) |
| Game picker | `src/app/(site)/tournament/games/page.tsx` |
| Play shell + registration + per-game | `src/app/(site)/tournament/play/page.tsx` (registration form lives here), `play/[game]/page.tsx`, `play/snake/page.tsx` |
| Leaderboard page | `src/app/(site)/leaderboard/page.tsx` (public — not gated) |
| Admin console | `src/app/(site)/admin/tournament/page.tsx` |
| Leaderboard UI | `src/components/tournament/LeaderboardClient.tsx` |
| Register API | `src/app/api/tournament/register/route.ts` |
| Validate code API | `src/app/api/tournament/validate-code/route.ts` |
| Serve questions (answers stripped) | `src/app/api/tournament/game-questions/route.ts` |
| **Grade one answer (server-side)** | `src/app/api/tournament/check-answer/route.ts` |
| **Submit score (reads Redis, not body)** | `src/app/api/tournament/submit-score/route.ts` |
| Leaderboard API | `src/app/api/tournament/leaderboard/route.ts` |
| Leaderboard data + cache | `src/lib/leaderboard-data.ts` |
| Question banks (**server-only**) | `src/lib/tournament-data/mcq-bank.ts`, `flashcard-bank.ts` |
| Redis client + limiters | `src/lib/tournament-redis.ts` |
| Snake game engine | `src/lib/game-engine/`, `src/components/games/snake/` |
| Admin: mint codes | `src/app/api/admin/codes/route.ts` |
| Admin: list registrations | `src/app/api/admin/registrations/route.ts` |
| Admin: approve → mint code | `src/app/api/admin/registrations/approve/route.ts` |
| Authorization point | `requireAdmin()` in `admin/codes/route.ts`; inline `ADMIN_EMAILS` check in the other two |
| Tables / view / RPC | `entry_codes`, `tournament_registrations`, `tournament_scores`, `tournament_leaderboard_best` (view), `claim_tournament_attempt` (RPC) |

---

## Calculation tools (104 calculators)

| Piece | File |
| --- | --- |
| Hub page | `src/app/(site)/calculation-tools/page.tsx` |
| **Hub registry (`HUB_SUBJECTS`, tools nested per subject)** | `src/app/(site)/calculation-tools/tool-index.ts` |
| Hub search, subject rail, scroll-spy (client island) | `src/app/(site)/calculation-tools/HubCatalogue.tsx` + `hub.css` (`.pw-hub`) |
| One tool | `src/app/(site)/calculation-tools/(tools)/<tool-slug>/page.tsx` |
| Clinical-only tool hub | `src/app/clinical/dose-calculators/page.tsx`, `src/app/clinical/calculators/page.tsx` |
| **Dead legacy registry — do not edit** | `src/app/api/calculators.tsx` |
| **Web-only wrapper for every tool** | `src/app/(site)/calculation-tools/(tools)/layout.tsx` — never reaches the APK |
| **Android app catalogue (all 104)** | `mobile/app/_data/tool-registry.ts` |
| **Shared calculator kit** | `src/components/calculators/` — shell, fields, result card, `AdSlot`, and the lab layer below. **All 104 tool pages import it** (complete 2026-09-20) |
| Liquid-glass surfaces | `src/components/calculators/ResultCard.tsx` and `ModeSwitch.tsx` — transform-only `animate-calc-sheen` / `animate-calc-tide` layers behind the content; keyframes are in `tailwind.config.ts`. `ModeSwitch` uses `backdrop-saturate` on fine pointers only and a pre-saturated fill under `[@media(hover:none)]`. Reaches the APK, which re-exports the real tool pages |
| Pure maths siblings (`_x.ts` next to a large tool page) | `dose-response-curve-generator/_curves.ts` (Hill curves), `ed50-td50-ld50-calculator/_probit.ts` (probit regression), `OpioidMMECalculator/_mme.ts`, `GeriatricDosingCalculator/_geriatric.ts`, `vancomycin-auc-calculator/_vanco.ts` (1-compartment PK + dose optimiser), `tpn/_tpn.ts` (admixture engine), `osmolality-calculators/_osmolality.ts` (5 calculators), `reconstitution-calculator/_recon.ts` (11-drug database), `animal-dose/_animal.ts`, `renal-dosing-adjuster/_renal.ts` (20-drug database + CrCl/CKD-EPI/KDIGO). Each is DOM-free and hand-checkable with `node` |
| Calculator disclaimer ("educational purposes only") | `src/components/calculators/CalcDisclaimer.tsx`, mounted only in `(tools)/layout.tsx` (web) and `mobile/app/_components/MobileShell.tsx` (APK) |
| Master Formula Calculator (Dosage Form Lab) | `src/app/(site)/calculation-tools/(tools)/master-formula-calculator/` — `page.tsx` + pure `_scale.ts` (`%`/`q.s.` not scaled) |
| **Shared page kit** (non-calculator pages) | `src/components/page-kit/` — `PageHero`/`Trail`, `PageSection`, `Figure`/`FigureRow`, `EmptyState`/`ErrorState`/`LoadingState`, `Eyebrow`, `Reveal` (2026-09-13; not yet used by a page) |
| **Site-wide redesign tracker** | `.claude/redesign-tracker.md` — every page and calculator, batch status, chosen directions, measured faults F1–F19 |
| **Lab-record card (copy / PNG / print)** | `src/components/calculators/LabReport.tsx` (`LabReport`, `LabActions`, `reportToText`, `downloadReportPng`, `printReport`) |
| **Analytical-practical layer** (calibration line, replicates, regression, graphs) | `src/components/calculators/lab-analysis/` — `math.ts` (`linearFit` with textbook sums, `concentrationFromAbsorbance`, `sampleSD`, `parseReplicates`), `format.ts` (typographic minus, equations), `figure.ts` (`chartSvg` for PNG/print), `calibration-store.ts` (hand-off: `?a=&b=&unit=` + `localStorage` `pw_lab_calibration_v1`), `parts.tsx` (`CalibrationFields`, `DataTable`, `ChartPanel`, `StepBlock`, `ReportSteps`, `ResultTable`, `CHART` palette). Not re-exported from the kit's `index.ts` |
| **TLC Rf Analyzer** (`/calculation-tools/rf-value-calculator`, 2026-09-16) | Page `(tools)/rf-value-calculator/page.tsx` (tabs) + `_DistanceMode.tsx` (the original distance calculator, lazy). Analyzer in `src/components/calculators/tlc/`: pure `rf.ts` (`calculateRf`, `analyzePlate`), `geometry.ts` (screen↔image, homography), `spots.ts` (detector), `plate.ts` (plate finder), `sample.ts` (synthetic plate), `storage.ts` (IndexedDB saves), `canvas.ts` (decode/rotate/crop/warp/annotate), `detection.ts` + `detect.worker.ts`, `report.ts`; UI `TLCAnalyzer.tsx`, `TLCStage.tsx`, `TLCUploader.tsx`, `TLCResults.tsx`. Tests: `scripts/tlc-rf.test.mts` |
| **Colony Counter & CFU Calculator** (`/calculation-tools/cfu-calculator`, 2026-09-16) | Page `(tools)/cfu-calculator/page.tsx`. `src/components/calculators/colony/`: `detect.ts` (OpenCV pipeline, pure — takes `cv`), `opencv.ts` (asset URL + thenable-safe `waitForCv`), `colony.worker.ts`, `client.ts` (worker → main-thread fallback), `cfu.ts` (CFU maths/format/parse), `sample.ts`, `validation.ts` (P/R/F1), `export.ts` (annotated PNG, text result), UI `ColonyCounter.tsx`, `ColonyStage.tsx`. Tests: `scripts/colony-counter.test.mts` + `test-data/colony-counter/fixtures.json`. Dev metrics panel: `?validate=1` |
| Analytical-practical tools | `(tools)/{calibration-curve-calculator,dissolution-calculator,accuracy-recovery-calculator,dialysis-diffusion-calculator,cumulative-drug-release-calculator,partition-coefficient-calculator}/` — `page.tsx` + pure `_*.ts` maths; the calibration tool is the reference implementation |
| Lab helpers | `lab-math.ts` (parsing, `fieldError`, sig figs, units, `calculatorHref`), `ModeSwitch.tsx`, `LabFields.tsx`, `chemistry.ts` (formula → molar mass), `hemocytometer.ts` |
| **Reference lab tool** (copy this) | `(tools)/theoretical-yield-calculator/page.tsx` |
| Theoretical → percentage yield hand-off | `calculatorHref("percentage-yield-calculator", …)` in theoretical-yield; `readQuery()` in percentage-yield |
| Multi-file tools | `(tools)/uv-spectrum-plotter/_*.ts(x)`, `(tools)/serial-dilution-calculator/_*.ts` |
| Android app home screen | `mobile/app/_components/ToolHub.tsx` |
| Android route generator | `scripts/generate-mobile-routes.mjs` |

Naming is inconsistent by design-drift: some directories are `kebab-case`, others `PascalCase`
(`AnionGapCalculator`). Match whatever the neighbouring tool does; the URL is the directory name.

---

## Courses, units & MCQ bank

| Piece | File |
| --- | --- |
| Course list | `src/app/(site)/courses/page.tsx` |
| Subject page | `src/app/(site)/courses/[subjectSlug]/page.tsx` |
| Unit page | `src/app/(site)/courses/[subjectSlug]/[unit]/page.tsx` |
| **Subject registry** | `src/lib/courses/registry.ts` (`SUBJECTS`, `getSubject`, `getUnit`, `getSemesters`) |
| Subject shape | `src/lib/courses/types.ts` (`SubjectMeta`, `CourseUnit`) |
| Per-subject metadata | `src/lib/courses/subjects/*.ts` — **only 4 of 14 are registered** |
| Markdown loader (content.ts) | `src/lib/courses/content.ts` |
| Server action: read a lesson file | `src/actions/lesson.ts` → `getLessonContent()` |
| Markdown → HTML | `src/utils/markdownToHtml.ts`, `src/lib/markdown.ts`, `src/utils/markdown.ts` |
| Lesson prose | `public/content/<subject>/<unit>.md`, `src/content/` |
| **End-of-lesson block** (5 optional questions, Mark as read, next unit) | `src/components/course/LessonCheckpoint.tsx`, mounted in `src/components/course/UnitPageClient.tsx` |
| Lesson ↔ MCQ-bank unit table (explicit, not by number) | `src/lib/courses/lesson-questions.ts` |
| Slug helpers + MCQ types | `src/lib/mcq-utils.ts` |
| MCQ bank pages | `src/app/(site)/mcqs-bank/page.tsx`, `[semesterSlug]/page.tsx`, `[semesterSlug]/[subject]/page.tsx` |
| **MCQ question data (ships to client)** | `src/app/api/mcq-data/*.ts` |
| MCQ UI | `src/components/Mcq/`, `src/components/PharmaWallahQuiz.tsx` |
| Unit comments API | `src/app/api/comments/route.ts` (Mongo + Supabase auth) |
| Flashcards | `src/app/(site)/flash-cards/page.tsx`, `flash-cards/sample/` |
| Semester metadata | `src/app/api/semester-data.tsx` |

---

## Spotting labs (histology / pathology / powder microscopy)

| Piece | File |
| --- | --- |
| Hub + shared layout | `src/app/(site)/spotting/page.tsx`, `spotting/layout.tsx` |
| Histology lesson index | `src/app/(site)/spotting/histology/lessons/page.tsx` |
| One histology lesson (17) | `src/app/(site)/spotting/histology/lessons/<slide>/page.tsx` |
| **Shared lesson template** | `src/components/spotting/HistologyLessonTemplate/index.tsx` |
| Histology timed test | `src/app/(site)/spotting/histology/test/page.tsx` (`SLIDE_DATA` inline) |
| Pathology lessons (16) + test | `src/app/(site)/spotting/pathology/<condition>/page.tsx`, `pathology/test/` |
| Powder microscopy (3) + test | `src/app/(site)/spotting/powder-microscopy/lessons/<drug>/`, `powder-microscopy/test/` |
| **AI grading of written observations** | `src/app/api/evaluate-histology/route.ts` |
| Slide images | `public/images/spotting/<category>/` |
| Image zoom | `src/components/ui/ImageZoom.tsx` |

---

## Simulations (interactive labs)

| Piece | File |
| --- | --- |
| Hub | `src/app/(site)/simulations/page.tsx` |
| Titration / buffer / UV / staining / organic-ID | `src/app/(site)/simulations/<lab>/page.tsx` |
| Dilution lab | `src/components/Simulations/DilutionLab/DilutionLabSim.tsx` |
| Disk diffusion lab (Theory + simulation) | `src/app/(site)/simulations/disk-diffusion/page.tsx` → `src/components/Simulations/DiskDiffusion/DiskDiffusionLab.tsx` |
| — pure model: zones, placement rules, coverage, technique score | `DiskDiffusion/{engine.ts,data.ts,types.ts}` |
| — stage machine and every rule about what is allowed | `DiskDiffusion/useLabMachine.ts` |
| — Theory: Principle · Materials · Lab Guide · Interpretation · Safety | `DiskDiffusion/{TheorySection,LabGuide,illustrations,PreLabCheck}.tsx` |
| — bench: layout, plate interaction, incubation and growth timers | `DiskDiffusion/{SimulationWorkspace,stages,PetriDish,equipment}.tsx` |
| — measurement, results, completion, PDF | `DiskDiffusion/{MeasurementTool,ResultsDashboard,CompletionScreen}.tsx`, `report.ts` |
| Lab guide | `src/app/(site)/simulations/lab-guide/page.tsx` |
| **Community Pharmacy Simulation Lab** | `/pharmacy-counter` → `src/components/Simulations/CommunityPharmacy/` |
| ↳ page (server, metadata, resolves the pharmacy's date) | `src/app/(site)/pharmacy-counter/page.tsx` |
| ↳ shell (three zones, persistence, tracking) | `CommunityPharmacy/CommunityPharmacyLab.tsx` |
| ↳ state machine (the whole encounter) | `CommunityPharmacy/useCounterMachine.ts` |
| ↳ stage order + gating | `CommunityPharmacy/engine/flow.ts` |
| ↳ the answer key (cases and their findings) | `CommunityPharmacy/data/scenarios.ts` |
| ↳ shelf catalogue, patients, fixed vocabulary | `CommunityPharmacy/data/{medicines,patients,constants}.ts` |
| ↳ pure model (checks, quantities, verification, labels, scoring) | `CommunityPharmacy/engine/*.ts` |
| ↳ what a check shows (evidence, never the answer) | `CommunityPharmacy/engine/evidence.ts` |
| ↳ screens | `CommunityPharmacy/{HomeScreen,StageView,Debrief,Chrome}.tsx` |
| ↳ workflow modules | `CommunityPharmacy/modules/{Patient,Prescription,Checks,Dispensing,Counselling,Otc,Support}Module*.tsx` |
| ↳ drawn pharmacy (packs, shelves, equipment) | `CommunityPharmacy/environment/objects.tsx` |
| ↳ bespoke surfaces (namespaced `.pw-cph`) | `CommunityPharmacy/pharmacy.css` |
| ↳ tests | `scripts/pharmacy-counter.test.mts` |
| Antibiogram simulator | `src/app/(site)/antibiogram-simulator/page.tsx`, `src/components/AntibiogramSimulator.tsx` |
| Compounding lab | `src/app/(site)/compounding-lab/page.tsx`, `src/components/ExtemporaneousCompoundingLab.tsx` |
| ~~AI colony counting~~ | `src/app/api/scan-colonies/route.ts` — **no caller since 2026-09-16** (the CFU tool counts on the device); still called by APK v1.0–1.2 on phones. Unauthenticated, not rate-limited — see CLAUDE.md Known Issue 17 |
| Molecular Lab (was Molecule Viewer; `/molecule-viewer` 308-redirects via `next.config.mjs`) | `src/app/(site)/molecular-lab/page.tsx` → `src/components/molecular-lab/MolecularLab.tsx` |
| — molecule graph, valence, formula, undo | `molecular-lab/{graph,history}.ts` |
| — rings, aromaticity, functional groups, learning tasks, measurements | `molecular-lab/{groups,learning,measure}.ts` |
| — OpenChemLib (SMILES/MOL in, 2D layout, 3D conformer, SMILES out, MCS) | `molecular-lab/chem-core.ts`, worker `chem.worker.ts` + `chem-tasks.ts`, client `chem.ts` |
| — V2000 molfile read/write | `molecular-lab/molfile.ts` |
| — 2D editor / drawing / export | `molecular-lab/{Editor2D.tsx,drawing.ts,export.ts}` |
| — 3D view (3Dmol, npm) | `molecular-lab/{Viewer3D.tsx,model3d.ts}` |
| — library (generated), PubChem/PDB, saved molecules | `molecular-lab/{library.ts,library-data.ts,pubchem.ts,storage.ts}`; generator `scripts/build-molecule-library.mts` |
| — panels, pickers, compare | `molecular-lab/{panels,ElementPicker,LibraryPanel,ComparePanel,ui}.tsx`, `lab.css` |
| — tests | `scripts/molecular-lab.test.mts` (+ `scripts/lib/ts-resolve.mjs`) |

---

## Clinical subdomain

| Piece | File |
| --- | --- |
| Landing | `src/app/clinical/page.tsx` |
| Drug–drug interactions | `src/app/clinical/drug-drug-interaction/page.tsx` → `src/app/api/clinical/drug-drug-interactions/route.ts` |
| Drug–food interactions | `src/app/clinical/drug-food-interaction/page.tsx` → `src/app/api/clinical/drug-food-interactions/route.ts` |
| AMR surveillance | `src/app/clinical/amr/page.tsx` → `src/app/api/clinical/amr/route.ts`; `src/lib/amr/{constants,utils}.ts`; `src/types/amr.ts`; `src/components/Clinical/amr/` |
| ADR | `src/app/clinical/adr/page.tsx` |
| Encyclopedia (clinical) | `src/app/clinical/encyclopedia/page.tsx` — still the old `DrugSearch`/`DrugCard` pair |
| Literature resources | `src/app/clinical/resources/page.tsx`, `resources/[source]/page.tsx` |
| Dose calculators hub | `src/app/clinical/dose-calculators/page.tsx` |
| Interaction datasets (seed) | `src/data/drug-drug-interactions.json`, `src/data/Drug to Food interactions Dataset.json`; loaders `src/lib/drug-{drug,food}-interactions.ts` |
| Shared clinical UI | `src/components/Clinical/`, `src/components/ClinalHospitalPharmacy/`, `src/components/MedicalDisclaimerBanner.tsx` |

---

## External API clients & their routes

| Source | Client | Route |
| --- | --- | --- |
| RxNorm (NLM) | `src/lib/api/rxnorm.ts` | `src/app/api/drugs/finder/route.ts` (+ `finder/suggest/`) |
| openFDA | `src/lib/api/openfda.ts` | `src/app/api/drugs/adverse-effects/route.ts` (+ `suggest/`) |
| DailyMed | `src/lib/api/dailymed.ts` | `src/app/api/clinical/dailymed/route.ts` (+ `suggest/`) |
| MedlinePlus | `src/lib/api/medlineplus.ts` | `src/app/api/clinical/medlineplus/route.ts` |
| PubMed (NCBI) | `src/lib/api/pubmed.ts` | `src/app/api/clinical/pubmed/route.ts` |
| ClinicalTrials.gov | `src/lib/api/clinicaltrials.ts` | `src/app/api/clinical/clinicaltrials/route.ts` |
| Cache-key hashing (shared) | `src/lib/api/cacheKey.ts` → `buildCacheKey(namespace, params)` | — |

Mongo cache models: `src/lib/models/{DrugFinderCache,AdverseEffectCache,DrugDrugInteraction,DrugFoodInteraction}.ts`.
Supabase cache tables: `pubmed_cache`, `medlineplus_cache`, `clinicaltrials_cache`.

---

## AI (Google Gemini)

| Feature | Route | SDK | Notes |
| --- | --- | --- | --- |
| Chat tutor | `src/app/api/chat/route.ts` | `@google/generative-ai` | **Streams NDJSON; rate limited; input clamped** (2026-09-20). Prompt in `src/lib/ai-guide/prompt.ts`, clamps + history rules in `src/lib/ai-guide/pure.ts` |
| Prescription reader | `src/app/api/prescription-reader-v2/route.ts` | `ai` + `@ai-sdk/google` | `runtime = 'edge'`, `maxDuration = 60`, `streamText`, model `gemini-2.5-flash` |
| Histology evaluation | `src/app/api/evaluate-histology/route.ts` | raw fetch | Grades free-text observations; **has a `NEXT_PUBLIC_GEMINI_API_KEY` fallback that should be removed** |
| Colony counting (**orphaned**) | `src/app/api/scan-colonies/route.ts` | raw fetch | No web caller since 2026-09-16; old APKs only. `GEMINI_MODEL` env override |
| Chat UI | `src/app/(site)/ai-guide/page.tsx` (server, metadata) → `src/components/ai-guide/AIGuideClient.tsx` | — | Study modes, saved threads, streaming, stop/regenerate/copy |
| Chat UI internals | `src/components/ai-guide/{Markdown,useChatStream,useThreads}.tsx/.ts`, `ai-guide.css` | — | Markdown styling is bespoke — `prose*` generates nothing here (MEMORY gotcha 127) |
| Chat pure layer | `src/lib/ai-guide/{pure,modes,prompt,resources,types}.ts` | — | Tested by `scripts/ai-guide.test.mts` (34) |
| Mentor page | `src/app/(site)/mentor/page.tsx` | — | Static; does not call `/api/chat` |
| Prescription UI | `src/app/(site)/prescription-reader/page.tsx` | — | |

---

## Community (Reddit-shaped)

Rebuilt 2026-09-20; replaced the flat Q&A. Schema is **not** applied automatically —
`supabase/migrations/20260920_community.sql` must be run in the Supabase SQL editor.

| Piece | File |
| --- | --- |
| Schema + RLS + seed + backfill | `supabase/migrations/20260920_community.sql` |
| Feed page | `src/app/(site)/community/page.tsx` → `src/components/community/pages/CommunityHome.tsx` |
| Space | `src/app/(site)/community/s/[slug]/page.tsx` → `pages/SpaceView.tsx` |
| Post + thread | `src/app/(site)/community/post/[id]/page.tsx` → `pages/PostView.tsx` |
| Composer | `src/app/(site)/community/submit/page.tsx` → `pages/Submit.tsx` |
| Spaces index | `src/app/(site)/community/spaces/page.tsx` → `pages/SpacesIndex.tsx` |
| Saved | `src/app/(site)/community/saved/page.tsx` → `pages/SavedView.tsx` |
| Legacy redirects | `community/ask/`, `community/question/[id]/`, `.../answer/` (resolve via `legacy_question_id`) |
| Shell / rails | `src/components/community/CommunityShell.tsx` |
| Feed list | `src/components/community/Feed.tsx`, `PostCard.tsx` |
| Nested comments | `src/components/community/CommentThread.tsx` |
| Vote rail | `src/components/community/VoteControl.tsx` |
| Save / share / report / menu | `src/components/community/PostActions.tsx` |
| Icons, avatar, markdown, time | `src/components/community/kit.tsx` |
| Vote hook (server-authoritative) | `src/hooks/useCommunityVote.ts` |
| Pure logic (tested) | `src/lib/community/pure.ts` |
| Server helpers (`ensureMember`) | `src/lib/community/server.ts` |
| Types / limits | `src/lib/community/types.ts`, `constants.ts` |
| Feed + create API | `src/app/api/community/posts/route.ts` |
| Post read/edit/delete | `src/app/api/community/posts/[id]/route.ts` |
| Comments | `src/app/api/community/posts/[id]/comments/route.ts`, `comments/[id]/route.ts` |
| Vote | `src/app/api/community/vote/route.ts` (calls the `community_vote` RPC) |
| Save / accept answer | `posts/[id]/save/route.ts`, `posts/[id]/accept/route.ts` |
| Spaces / membership | `spaces/route.ts`, `membership/route.ts` |
| Report / me | `report/route.ts`, `me/route.ts` |
| Tests | `scripts/community.test.mts` (17) |
| Authorization | **RLS-enforced (Model B)** — anon/user client only. Policies ARE in the repo, in the migration |
| Tables | `community_members`, `_spaces`, `_posts`, `_comments`, `_votes`, `_saves`, `_memberships`, `_reports` |

### Legacy Q&A (data kept, UI gone)

| Piece | File |
| --- | --- |
| Questions API | `src/app/api/qa/questions/route.ts`, `questions/[id]/route.ts` |
| Answers / votes API | `src/app/api/qa/answers/route.ts`, `votes/route.ts` |
| Tables | `questions`, `answers`, `votes`, `profiles` — **untouched**, copied into the new tables |
| Status | No UI calls these any more. Kept so the backfill is reversible; delete once the community is proven in production |

---

## Search, drugs & misc

| Piece | File |
| --- | --- |
| Drug search API (Mongo `pharmacopedia`, 3 collections as one set) | `src/app/api/search/route.ts` (limiter `drugSearchLimiter` in `src/lib/rateLimit.ts`) |
| Encyclopedia `/encyclopedia` | `src/app/(site)/encyclopedia/page.tsx` (server: metadata, URL params, streamed figures) → `src/components/encyclopedia/` — `EncyclopediaClient.tsx` (always-present search bar + result ledger + URL state), `Monograph.tsx` (the **tabbed** drug card: masthead, at-a-glance, eight sections), `StructurePlate.tsx` (2D ⇄ 3D switch, lazy-loads the 3D), `Structure3D.tsx` (conformer from SMILES + the lab's `Viewer3D` — the **only** consumer of OpenChemLib/3Dmol outside `molecular-lab/`, §6 rule 18), `prose.tsx` (DrugBank text cleaner), `useDrugSearch.ts`, `EncyclopediaFigures.tsx` (server, daily-cached counts), `types.ts`, `encyclopedia.css` |
| Autocomplete | `src/app/api/autocomplete/route.ts`, `src/components/AutocompleteSearch.tsx` |
| Drug finder UI | `src/app/(site)/drug-finder/page.tsx` (self-contained — it does **not** use `DrugSearch`/`DrugCard`, which only `/clinical/encyclopedia` imports) |
| Contact form → Resend | `src/app/api/contact/route.ts`, `src/app/contact/page.tsx`, `src/components/Home/ContactForm/` |
| Blog (MDX) | `markdown/blog/*.mdx`, `src/components/SharedComponent/Blog/` |
| **Landing page (`/`)** | `src/components/Home/landing/` — `LandingPage.tsx` composes it, `useIndexMotion.ts` holds every GSAP tween, `landing.css` the scoped `.pw-idx` styles, `data.ts` the copy, figures and chapters |
| Landing page sections | `src/components/Home/landing/{Hero,Specimen,IndexSection,Sections,Chrome,Btn}.tsx`; marker annotations `Marks.tsx`; scroll timeline bar `Player.tsx` |
| **Unused** home sections | `src/components/Home/{Hero,Features,Courses,Mentor,Companies,ContactForm}/` — replaced 2026-09-12, still on disk, rendered nowhere |
| Home page promo strip | `src/components/Home/tournament/` (`OfficialLaunchBanner`, still rendered) |
| **About / the team (`/about-us`)** | `src/app/(site)/about-us/` — `page.tsx` (server: hero, story, pillars, leadership `LeadCard`s, grouped team), `FlipCard.tsx` (client flip card), `_Plate.tsx` (monogram, or a `photo` if the roster ever sets one) |
| **Team roster (data)** | `src/lib/team.ts` — one `ROSTER` array; groups, monograms, gradient angles, ids and card descriptions (`ROLE_NOTE`) are derived. Was `src/app/api/team-members.tsx` (deleted 2026-09-16) |
| Static pages | `src/app/(site)/{careers,faqs,privacy,terms,documentation,pw}/page.tsx` |
| Toast context (misfiled under api/) | `src/app/api/contex/ToasetContex.tsx` |
| Shared types | `src/types/*.ts` |

---

## Dead or orphaned code (do not build on)

| Path | Status |
| --- | --- |
| `src/app/api/calculators.tsx` | 419 lines, zero importers — superseded by `tool-index.ts` |
| `src/app/api/data.tsx`, `physiology-data.ts`, `biochemistry-data.ts` | Zero importers |
| `src/lib/courses/subjects/*-data.ts` (9 files) | Zero importers; incompatible `*_META`/`*Units` shape |
| `src/lib/courses/subjects/natural-toxins.ts` | Correct `SubjectMeta` shape, but not in the `SUBJECTS` array |
| `src/lib/models/Review.ts`, `src/lib/models/userProgress.ts` | Models with no route; progress moved to Supabase |
| `/api/reviews` in `PROTECTED_PATHS` | Route does not exist |
| `(tools)/OsmolarGapCalculator`, `(tools)/OpioidConversionCalculator` | Pages exist, linked from nowhere **on the web**; both ship on the Android app |
| `next-auth`, `next-cloudinary`, `next-mdx-remote` | Installed, zero importers |
| `npm run predeploy` / `deploy` | gh-pages scripts that cannot work (no static export) |

---

## Android app (Capacitor)

Offline, calculators-only. A **second Next.js project root** — the main app cannot be statically
exported. See `.claude/skills/android-app-capacitor/SKILL.md`.

| Piece | File |
| --- | --- |
| Capacitor config (`webDir: mobile/out`) | `capacitor.config.ts` |
| Native Android project | `android/` (committed; build output + copied assets gitignored) |
| Mobile Next config (`output: "export"`) | `mobile/next.config.mjs` |
| Mobile shell / tool app bar (star, Recent) | `mobile/app/layout.tsx`, `mobile/app/_components/MobileShell.tsx` (no bar on the home screen) |
| Home screen (hash views: home / `#browse` / `#saved` / `#cat/<id>`) | `mobile/app/_components/ToolHub.tsx`, `SpaceHero.tsx` (animated hero + search), `BottomNav.tsx`, `parts.tsx` (category icons/hues, `ToolRow`, `ToolChip`) |
| Recent / Saved (localStorage) | `mobile/app/_components/useLibrary.ts` |
| Assembled catalogue + search | `mobile/app/_data/catalogue.ts` (descriptions borrowed from `tool-index.ts`) |
| Ambient motion (`.pw-space`, `.pw-star`, `.pw-rise`…) | `mobile/app/globals.css` |
| Catalogue of every tool (names, categories) | `mobile/app/_data/tool-registry.ts` |
| Route generator (re-exports the real tools) | `scripts/generate-mobile-routes.mjs` |
| Generated, gitignored | `mobile/app/calculation-tools/<slug>/`, `mobile/app/_generated/`, `mobile/out/` |
| shadcn/ui components | **none of its own** — `@/*` → `../src/*`, so the app uses `src/components/ui/` and `src/components/calculators/` |
| Mobile design tokens | `mobile/app/globals.css` (`--primary` = brandBlue) |
| Release APK build | `scripts/build-apk.sh` (`npm run mobile:apk`) |
| Release signing | `android/app/build.gradle`, `android/keystore.properties` (gitignored) |
| Public download page | `src/app/(site)/download/{page,DownloadClient}.tsx` |
| Setup + commands | `mobile/README.md` |
