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
| Where's the list of calculators shown on the hub? | `allTools` + `categories` in `src/app/(site)/calculation-tools/CalculationToolsClient.tsx` |
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
| **Advertising (AdSense)** | `src/components/calculators/AdSlot.tsx` (the only placement component), the loader in `src/app/layout.tsx`, `public/ads.txt`, `src/app/(site)/calculation-tools/(tools)/layout.tsx` (band under all 89 tools), `AdBand` in `src/components/Home/landing/Chrome.tsx` |
| Subdomain + auth gating | `src/middleware.ts` |
| Build / PWA config | `next.config.mjs` |
| Design tokens | `tailwind.config.ts`, `src/app/globals.css`, `src/Style/` |
| Header / footer / nav | `src/components/Layout/Header/`, `src/components/Layout/Footer/` |
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
| Sign in / sign up / OTP / password reset pages | `src/app/(site)/{signin,signup,verify-otp,forgot-password,update-password}/page.tsx` |

---

## Progress tracking & dashboard

| Piece | File |
| --- | --- |
| Page | `src/app/(site)/dashboard/page.tsx` |
| UI | `src/components/dashboard/{DashboardMain,DashboardSidebar,DashboardTabs,DashboardErrorBoundary}.tsx`, `dashboard-shared.ts` |
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

## Calculation tools (89 calculators)

| Piece | File |
| --- | --- |
| Hub page | `src/app/(site)/calculation-tools/page.tsx` |
| **Hub registry (`allTools` + `categories`)** | `src/app/(site)/calculation-tools/CalculationToolsClient.tsx` |
| One tool | `src/app/(site)/calculation-tools/(tools)/<tool-slug>/page.tsx` |
| Clinical-only tool hub | `src/app/clinical/dose-calculators/page.tsx`, `src/app/clinical/calculators/page.tsx` |
| **Dead legacy registry — do not edit** | `src/app/api/calculators.tsx` |
| **Web-only wrapper for all 89 tools** | `src/app/(site)/calculation-tools/(tools)/layout.tsx` — never reaches the APK |
| **Android app catalogue (all 89)** | `mobile/app/_data/tool-registry.ts` |
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
| Disk diffusion | `src/components/Simulations/DiskDiffusion/{DiskDiffusionSim.tsx,diskDiffusionData.ts}` |
| Lab guide | `src/app/(site)/simulations/lab-guide/page.tsx` |
| Antibiogram simulator | `src/app/(site)/antibiogram-simulator/page.tsx`, `src/components/AntibiogramSimulator.tsx` |
| Compounding lab | `src/app/(site)/compounding-lab/page.tsx`, `src/components/ExtemporaneousCompoundingLab.tsx` |
| **AI colony counting** | `src/app/api/scan-colonies/route.ts` |
| Molecule viewer (3Dmol/three) | `src/app/(site)/molecule-viewer/page.tsx`, `src/components/MoleculeViewer.tsx` |

---

## Clinical subdomain

| Piece | File |
| --- | --- |
| Landing | `src/app/clinical/page.tsx` |
| Drug–drug interactions | `src/app/clinical/drug-drug-interaction/page.tsx` → `src/app/api/clinical/drug-drug-interactions/route.ts` |
| Drug–food interactions | `src/app/clinical/drug-food-interaction/page.tsx` → `src/app/api/clinical/drug-food-interactions/route.ts` |
| AMR surveillance | `src/app/clinical/amr/page.tsx` → `src/app/api/clinical/amr/route.ts`; `src/lib/amr/{constants,utils}.ts`; `src/types/amr.ts`; `src/components/Clinical/amr/` |
| ADR | `src/app/clinical/adr/page.tsx` |
| Encyclopedia | `src/app/clinical/encyclopedia/page.tsx`, `src/app/(site)/encyclopedia/page.tsx` |
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
| Chat tutor | `src/app/api/chat/route.ts` | `@google/generative-ai` | `SYSTEM_PROMPT` at top; rebuilds alternating user/model history |
| Prescription reader | `src/app/api/prescription-reader-v2/route.ts` | `ai` + `@ai-sdk/google` | `runtime = 'edge'`, `maxDuration = 60`, `streamText`, model `gemini-2.5-flash` |
| Histology evaluation | `src/app/api/evaluate-histology/route.ts` | raw fetch | Grades free-text observations; **has a `NEXT_PUBLIC_GEMINI_API_KEY` fallback that should be removed** |
| Colony counting | `src/app/api/scan-colonies/route.ts` | raw fetch | `GEMINI_MODEL` env override, defaults `gemini-2.5-flash` |
| Chat UI | `src/app/(site)/ai-guide/page.tsx`, `src/app/(site)/mentor/page.tsx` | — | |
| Prescription UI | `src/app/(site)/prescription-reader/page.tsx` | — | |

---

## Q&A community

| Piece | File |
| --- | --- |
| Question list | `src/app/(site)/community/page.tsx` |
| Ask | `src/app/(site)/community/ask/page.tsx` |
| Question detail / answer | `src/app/(site)/community/question/[id]/page.tsx`, `[id]/answer/page.tsx` |
| UI | `src/components/community/` |
| Questions API | `src/app/api/qa/questions/route.ts`, `questions/[id]/route.ts` |
| Answers API | `src/app/api/qa/answers/route.ts` |
| Votes API | `src/app/api/qa/votes/route.ts` |
| Vote hook | `src/hooks/useVote.ts` |
| Authorization | **RLS-enforced** — anon/user client only. Policies live in Supabase, not here |
| Tables | `questions`, `answers`, `votes`, `profiles` |

---

## Search, drugs & misc

| Piece | File |
| --- | --- |
| Full-text search (Mongo `pharmacopedia`) | `src/app/api/search/route.ts` |
| Autocomplete | `src/app/api/autocomplete/route.ts`, `src/components/AutocompleteSearch.tsx` |
| Drug finder UI | `src/app/(site)/drug-finder/page.tsx`, `src/components/{DrugSearch,DrugCard}.tsx` |
| Contact form → Resend | `src/app/api/contact/route.ts`, `src/app/contact/page.tsx`, `src/components/Home/ContactForm/` |
| Blog (MDX) | `markdown/blog/*.mdx`, `src/components/SharedComponent/Blog/` |
| Home page sections | `src/components/Home/{Hero,Features,Courses,Mentor,Companies,tournament}/` |
| Static pages | `src/app/(site)/{about-us,careers,faqs,privacy,terms,documentation,books-library,pw}/page.tsx` |
| Toast context (misfiled under api/) | `src/app/api/contex/ToasetContex.tsx` |
| Shared types | `src/types/*.ts` |

---

## Dead or orphaned code (do not build on)

| Path | Status |
| --- | --- |
| `src/app/api/calculators.tsx` | 419 lines, zero importers — superseded by `allTools` in `CalculationToolsClient.tsx` |
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
| Mobile shell / app bar | `mobile/app/layout.tsx`, `mobile/app/_components/MobileShell.tsx` |
| Home screen (search + categories) | `mobile/app/_components/ToolHub.tsx` |
| Catalogue of all 89 tools | `mobile/app/_data/tool-registry.ts` |
| Route generator (re-exports the real tools) | `scripts/generate-mobile-routes.mjs` |
| Generated, gitignored | `mobile/app/calculation-tools/<slug>/`, `mobile/app/_generated/`, `mobile/out/` |
| shadcn/ui components | `mobile/components/ui/`, `mobile/components.json`, `mobile/lib/utils.ts` |
| Mobile design tokens | `mobile/app/globals.css` (`--primary` = brandBlue) |
| Release APK build | `scripts/build-apk.sh` (`npm run mobile:apk`) |
| Release signing | `android/app/build.gradle`, `android/keystore.properties` (gitignored) |
| Public download page | `src/app/(site)/download/{page,DownloadClient}.tsx` |
| Setup + commands | `mobile/README.md` |
