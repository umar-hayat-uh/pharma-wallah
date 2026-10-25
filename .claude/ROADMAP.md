# ROADMAP — PharmaWallah

Status legend: ✅ Implemented · 🟡 Partial · 🔵 In Progress · ⚪ Not Started · 🔴 Blocked · ⚠ Needs Verification

> **Never mark something complete because a file exists.** Complete means the expected behaviour
> works end to end. Several items below are 🟡 precisely because the files exist but nothing
> reaches them.

---

## Current Development Focus

**Site-wide redesign (Phase 4.7)** — Phase 0 done; auth pages (P8) redesigned 2026-09-13; other
families wait on the user's choice of direction; see `.claude/redesign-tracker.md`. Alongside it: broadening the **content and tool
catalogue** — wiring the content that already exists into the navigation that users see.

## Current Phase

**Phase 4 — Catalogue completion & consolidation.**
Phases 1–3 (platform foundation, learning core, tournament + clinical sub-brand) are shipped and
working. Phase 4 is about closing the gap between *assets that exist in the repo* and *assets a
user can actually reach*, and paying down the duplication that accumulated while building fast.

## Recommended Next Feature

### Register the remaining course subjects → `/courses`

**Why this one, ahead of everything else:**

1. **The content is already written and already shipping.** `content/` (moved out of `public/` on 2026-09-23) contains markdown for
   10+ subjects — advanced-pharmacognosy, hospital-pharmacy, industrial-pharmacy, industrial-
   pharmacy-2, pharmaceutical-analysis, pharmaceutical-technology, natural-toxins and more — and it
   is deployed to production right now. Users cannot reach any of it.
2. **Highest value per unit of risk in the repo.** No new data model, no new auth surface, no new
   external dependency. It is registry plumbing plus a shape conversion.
3. **It unblocks two other features.** `/mcqs-bank` and the dashboard's subject list both key off
   subject slugs, so registered subjects immediately widen those too.
4. **It removes the repo's largest block of dead code** — nine unused subject files — rather than
   adding more.

**What it actually takes:**
- Nine files in `src/lib/courses/subjects/` use an old triplet shape (`*_META` + `*Units` +
  `*_DIFF_BADGE`) that `registry.ts` cannot consume. Each must be converted to export one
  `SubjectMeta` (see `src/lib/courses/types.ts`, and `biochemistry.ts` as the reference).
- `natural-toxins.ts` is already in the right shape — it only needs adding to `SUBJECTS`. **Start
  there**: it is a one-line change that proves the whole path end to end before touching the nine.
- For each subject, verify every `CourseUnit.contentFile` resolves to a real file under
  `content/`. A missing file surfaces as a broken unit page, not a build error.
- Follow `.claude/skills/course-content-system/SKILL.md`.

**Do not** start by converting all nine. Ship `natural-toxins` first, load `/courses` and its unit
pages, confirm progress tracking records a visit, then batch the rest.

---

## Phase 1 — Platform foundation ✅

### Next.js App Router shell, theming, PWA
- **Status:** ✅ Implemented
- **Existing implementation:** `src/app/layout.tsx` + `src/components/AppShell.tsx`; `next-themes`
  with `darkMode: "class"`; **the PWA was removed on 2026-09-12** in favour of the Android app;
  `@vercel/analytics` + `@vercel/speed-insights` mounted.
- **Remaining work:** None.
- **Important files:** `src/app/layout.tsx`, `next.config.mjs`, `tailwind.config.ts`, `public/manifest.json`
- **Dependencies:** —
- **Notes:** `public/sw.js` is generated; never hand-edit.

### Marketing landing page (`/`) and site chrome
- **Status:** ✅ Implemented (rebuilt 2026-09-13)
- **Existing implementation:** `src/components/Home/landing/` — "The Index" as a whiteboard explainer
  video: marker annotations drawn on by scroll with a pen on the stroke (scroll-only playback; the
  timeline bar was removed 2026-09-13), a countdown leader, a computed worked-example
  card and a highlighter pillar index — and no ad placements, by decision. Site chrome restyled to match:
  header with reading progress and ink CTAs, mega menu, and footer. The Science Fair launch strip and
  launch dialog were unmounted on 2026-09-13 (event over); the hero meta strip was removed the same day.
  Black button/tab/phone surfaces now use the brand gradient (user rule, 2026-09-13).
- **Important files:** `src/components/Home/landing/{LandingPage,useIndexMotion,landing.css,data,Marks}`,
  `src/components/Layout/Header/{index,MegaMenu}.tsx`, `src/components/Layout/Footer/index.tsx`,
  `src/components/LaunchPopup.tsx`, `src/components/Home/tournament/index.tsx`
- **Notes:** GSAP is confined to the landing directory — see
  `.claude/skills/landing-page-motion/SKILL.md`. The previous home sections are dead but retained.

### Supabase authentication
- **Status:** ✅ Implemented
- **Existing implementation:** Email/password + OAuth via `@supabase/ssr`. Sign-in, sign-up, OTP
  verification, forgot/update password pages all exist. Callback at `/api/auth/callback`. Client
  state via `useSupabaseUser()`.
- **Remaining work:** None for the happy path.
- **Important files:** `src/lib/supabase*.ts`, `src/middleware.ts`, `src/app/(site)/{signin,signup,verify-otp,forgot-password,update-password}/`
- **Dependencies:** Supabase project (not in repo)
- **Notes:** `next-auth` is installed but unused — remove it during cleanup. UI redesigned 2026-09-13
  on `src/components/auth/AuthKit.tsx` (redesign P8). Open: sign-in ignores middleware's `?redirect=`
  (tracker F17) — a logic change needing approval.

### Clinical subdomain routing
- **Status:** ✅ Implemented
- **Existing implementation:** `src/middleware.ts` detects `host` starting with `clinical.`, sets
  `x-subdomain`; `layout.tsx` switches metadata and `AppShell` chrome.
- **Remaining work:** None functionally. Note the clinical pages remain reachable at
  `/clinical/...` on the main domain — by design, but worth a deliberate decision if the brands
  should be separated harder.
- **Important files:** `src/middleware.ts`, `src/app/layout.tsx`
- **Dependencies:** DNS + host config (outside the repo)

---

## Phase 2 — Learning core 🟡

### Calculation tools
- **Status:** 🟡 Partial
- **Existing implementation:** 104 tool directories under
  `src/app/(site)/calculation-tools/(tools)/`, each a `"use client"` page. Hub with search and 10
  categories (Physiology added 2026-09-13) driven by `HUB_SUBJECTS` in `tool-index.ts`. ✅ 2026-09-13:
  hub rebuilt as a server-rendered, searchable index (every tool with a one-line description of what it
  computes; readable before hydration). ✅ 2026-09-13: eight laboratory tools (theoretical/percentage
  yield, percentage recovery, WBC/RBC count, density bottle, UV-Vis spectrum plotter, serial
  dilution) built on the shared kit with a lab-record card (copy / PNG / print). ✅ 2026-09-13: six
  analytical-practical tools (calibration curve, dissolution, accuracy & % recovery, dialysis/diffusion,
  cumulative drug release, partition/distribution coefficient) on the new `lab-analysis` layer — Recharts
  graphs, practical-sheet methods, step-by-step workings, calibration hand-off between tools.
  ✅ 2026-09-16: **TLC Rf Analyzer** (`rf-value-calculator`) — Rf from a plate photo on the device
  (rotate/crop/perspective, baseline/front lines, spot detection, cm calibration, saved analyses),
  with the old distance calculator as a second tab. ✅ 2026-09-16: **Colony Counter & CFU
  Calculator** (`cfu-calculator`) — OpenCV.js colony detection in a Web Worker, review with
  add/remove/undo, CFU/mL from the verified count; replaces the Gemini photo scan. Both verified
  offline in the APK build; 41 `node --test` unit tests.
- **Remaining work:**
  - Validate the colony counter and TLC detector on **real** plate photos (only synthetic fixtures
    exist) — add them to `test-data/colony-counter/fixtures.json` with who counted them and how.
  - Five tools (`antagonism-simulator`, `emax-model-calculator`, `drug-half-life-calculator`,
    `osmolar-gap-calculator`, `opioid-conversion-calculator`) are **reachable only by typed URL on the
    web** — add them to `tool-index.ts`, or to the clinical hub. All five already ship in the Android
    app. Audited 2026-09-13: `osmolar-gap-calculator` is complete and correct (best to list);
    `opioid-conversion-calculator` is **not clinically safe** (one ×3 IV factor for every opioid) — keep it
    unlisted; `drug-half-life-calculator` is only partly working.
  - **Formula faults found by the 2026-09-13 hub audit** — see CLAUDE.md §7 Known Issues 15.
  - ✅ 2026-09-22: **Dissolution Rate Constant Calculator** (`dissolution-rate-constant-calculator`) —
    reproduces a dissolution practical sheet's own table (midpoint, dC/dt, Cs − C and **two separate**
    k columns), four Recharts graphs, scientific ⇄ decimal notation, 28 unit tests. Registered on the
    hub (Pharmaceutics) and in the Android catalogue → **105 directories, 99 on the hub**. Open owner
    decision: whether the reported average covers the interior rows (the sheet's own answer, and the
    default) or all of them — both are on screen as a labelled switch.
  - ✅ 2026-10-08: **Drug Stability Kinetics Calculator** (`stability-kinetics-calculator`) — the
    Procaine HCl / 50 °C practical: absorbance → % remaining, zero/first/second-order regressions,
    order by highest R², k, t½ and t90 (C₀ = 100 %), four graphs, Graph Analysis card, residuals, Steps 1–10
    lab record, opens pre-filled with the practical, 26 unit tests.
    Registered on the hub (Pharmaceutics) and in the Android catalogue → **106 directories, 100 hub
    entries (95 unique)**.
  - Delete the dead legacy registry `src/app/api/calculators.tsx` (419 lines, zero importers).
  - ✅ Migrate older tools to the shared kit (`src/components/calculators/`) — **COMPLETE 2026-09-20,
    104 of 104**, each verified number-for-number against its pre-migration page. Tracker Phase 2 is
    closed. Verify with
    `grep -rL "@/components/calculators" "src/app/(site)/calculation-tools/(tools)"/*/page.tsx` (empty).
  - 🔄 **Decide the calculator formula fixes — now the top calculator item.** Migration kept every
    formula, so ~80 suspected faults are still live (the 2026-09-13 batch plus ~10 more found on
    2026-09-20). They are *stated on screen* on the affected pages but not corrected. Priority order:
    `opioid-conversion-calculator` (fentanyl patch read as mg → 2500 MME) and `opioid-mme-calculator`
    (tramadol/hydromorphone factors, patch rate divided by frequency), then
    `ed50-td50-ld50-calculator` (inverted probit slope, ED50 = LD50, no TD50), then
    `creatinine-calculator` staging and `mixing-time-estimator` (60×). Tracker →
    "Suspected maths issues". **Owner decision: this is logic work, not migration.**
- **Important files:** `src/app/(site)/calculation-tools/tool-index.ts`, `(tools)/<slug>/page.tsx`, `src/app/clinical/dose-calculators/page.tsx`
- **Dependencies:** —
- **Notes:** ✅ 2026-10-08: a universal **how-to-use guide** (`src/components/calculator-guide/`, web
  `/calculation-tools/how-to-use`, app `/how-to-use/`) linked from the hub, every tool, the header and the
  app. Its copy depends on measured kit behaviour (MEMORY 190) — re-check it when the kit changes.
  Adding a directory does **not** add a card on the web hub (`tool-index.ts` lists 95 of 106). Every tool carries the educational disclaimer from the `(tools)` layout (web) and `MobileShell` (APK) since 2026-09-13.
  Registry + category are both required. Six tools are intentionally clinical-hub-only, not
  orphans. **The Android app consumes these same files** — keep every tool free of `@/` imports
  and `fetch`, or it breaks offline. See `.claude/skills/android-app-capacitor/SKILL.md`.

### Courses & unit lessons
- **Status:** 🟡 Partial — **this is the recommended next feature**
- **Existing implementation:** Registry-driven subject/unit routing, markdown lessons rendered via
  `src/actions/lesson.ts` + `src/lib/courses/content.ts`, prev/next unit navigation from
  `getUnit()`, per-unit comments, per-unit progress tracking.
- **Remaining work:** Only **4 of 14** subjects are registered. Nine subject files use an
  incompatible shape and need converting; `natural-toxins.ts` needs only registering. Verify every
  `contentFile` resolves.
- **Important files:** `src/lib/courses/registry.ts`, `src/lib/courses/types.ts`, `src/lib/courses/subjects/*.ts`, `content/`
- **Dependencies:** None
- **Notes:** Content for the unregistered subjects is already written and deployed.

### MCQ bank
- **Status:** 🟡 Partial
- **Existing implementation:** Semester → subject → quiz pages with four question banks
  (`src/app/api/mcq-data/`), scoring, explanations, and quiz attempts written to `quiz_attempts`.
- **Remaining work:** Banks exist for 4 subjects only — expands automatically as subjects are
  registered. Several `mcqs-bank` pages still render an "under construction" state for unbacked
  subjects; confirm the fallback is graceful once more subjects land.
- **Important files:** `src/app/(site)/mcqs-bank/`, `src/app/api/mcq-data/*.ts`, `src/lib/mcq-utils.ts`
- **Dependencies:** Course subject registry
- **Notes:** These banks ship answers to the client. Acceptable for self-study; **never** reuse
  them as a tournament source.

### Spotting labs
- **Status:** 🟡 Partial
- **Existing implementation:** Histology 17 lessons + timed test; pathology 16 lessons + test;
  powder microscopy 3 lessons + test. Shared `HistologyLessonTemplate`. AI grading of free-text
  observations via `/api/evaluate-histology`. Progress recorded to `spotting_progress`.
- **Remaining work:** Powder microscopy has only 3 lessons (digitalis, nux-vomica, senna) against
  17/16 for the other two categories — the obvious content gap. `HistologyLessonTemplate` contains
  an under-construction branch; confirm which lessons still hit it.
- **Important files:** `src/app/(site)/spotting/`, `src/components/spotting/HistologyLessonTemplate/index.tsx`, `src/app/api/evaluate-histology/route.ts`
- **Dependencies:** `GEMINI_API_KEY` for grading
- **Notes:** The histology test's `SLIDE_DATA` is inline in the test page, separate from the lesson
  pages — adding a lesson does **not** add it to the test.

### Molecular Lab
- **Status:** ✅ Implemented (2026-09-16, session `pharma-wallah-b9`) — verified in headless Chrome at
  1440/768/412/390/360 px and by 21 unit tests; **not** on a real phone.
- **Existing implementation:** draw from scratch (atoms, bonds 1/2/3/aromatic/wedge/hash, rings, groups,
  charge, hydrogens, break/delete, move, box select), undo/redo, 2D/3D/split with a generated or PubChem
  conformer, formula/MW/counts/validation, functional groups, 3D distance/angle/dihedral, Learning and
  Experiment modes, compare (MCS), 83-molecule PubChem-verified library + PubChem/PDB search, file
  import, PNG/SVG/MOL/SDF/SMILES/JSON export, My Molecules + autosave/restore, phone layout with bottom
  sheets. Proteins and large structures open view-only (the old viewer's features).
- **Remaining work:** cloud save (needs a Supabase table — owner decision); an AI "Molecular Tutor"
  that receives the graph as data (optional, spec'd as later); progress tracking (`useTracker`) is not
  wired. ✅ **Done 2026-09-20:** the `/encyclopedia` hand-off — every structure plate now carries
  "Open in Molecular Lab" (`?smiles=&name=`), and the drug card renders its own lazy 3D conformer by
  reusing `Viewer3D`/`chem.ts`/`model3d.ts` (CLAUDE.md §6 rule 18's one documented exception).
- **Important files:** `src/components/molecular-lab/`, `scripts/build-molecule-library.mts`
- **Dependencies:** `openchemlib` 9.25.0 (new), `3dmol` 2.5.5 (now bundled); PubChem and RCSB from the browser.

### Virtual Osteology & Arthrology Lab
- **Status:** 🟡 Built and verified in headless Chrome (2026-10-18, session `pharma-wallah-06`); **not** on a real
  phone, **not** reviewed by a named anatomy teacher, **not** deployed.
- **Existing implementation:** `/osteology-lab` — 22 bones/bone groups and all 17 joints of the brief
  (9 upper limb, 8 pelvis/lower limb), each a server-rendered lesson with a three.js 3D model exported from
  Z-Anatomy (landmark markers at Z-Anatomy's own anchors; joints with capsule, ligaments, discs as separate meshes),
  side determination, attachments, articulations, viva and exam questions. Spotting practice (191 renders, never
  X-rays), viva trainer + full-skeleton identification, 8 timed mock-exam presets marked server-side, progress
  (device + account via existing tables). 17 unit tests.
- **Remaining work:** real specimen photographs (needs licensed images or the department's own); a named reviewer
  in `bylines.ts`; movement animations; an admin screen for exam presets (today: `exam-config.ts`); syllabus
  matching once the university's outline is available; the brief's sections after §14 (it arrived truncated).
- **Important files:** `src/lib/osteology/`, `src/components/osteology/`, `src/app/(site)/osteology-lab/`,
  `src/app/api/osteology/`, `scripts/osteology/`, skill `osteology-lab`.
- **Dependencies:** none new (`three` 0.185 was already installed). Assets: Z-Anatomy (CC BY-SA 4.0).

### Virtual Labs (3D)
- **Status:** ✅ Implemented 2026-10-20; ✅ **immersive upgrade 2026-10-21** (equipment-driven controllers, Learning /
  Practical modes, full-screen layer, pixel-budget quality tiers — `docs/virtual-labs/UPGRADE_PLAN.md`). **Not deployed.
  Not faculty-reviewed. Not tested on a real phone/GPU.** Verified by the unit tests (`scripts/virtual-labs.test.mts`,
  incl. equipment-gate bypass tests per lab) and by headless Chrome driving all four labs through their 3D equipment
  at 1440 × 900 and 390 × 844 touch.
- **2026-10-22 — Pharmaceutical Chemistry migrated to Babylon.js** (owner's brief; the other three labs stay on
  three.js). 🧪 Experimental: built, unit-tested and driven in headless Chrome; **not on a real phone or GPU**,
  WebGPU path unverified on hardware. `docs/virtual-labs/BABYLON_MIGRATION.md`; rollback `?engine=three` or remove
  the id from `BABYLON_LABS`.
- **Existing implementation:** `/virtual-labs` landing + four 3D rooms (three.js; Pharm Chem on Babylon.js since 2026-10-22, loaded per lab):
  acid–base titration assay of citric acid (Pharmaceutical Chemistry), Simple Syrup preparation and evaluation
  (Pharmaceutics), graded dose–response on a simulated isolated tissue (Pharmacology), powdered clove microscopy
  (Pharmacognosy). Pure experiment engine with undo, hints, technique mistakes that change the result, an
  assessment and a results report; since 2026-10-21 every action is performed on its instrument's controller,
  opened by selecting the equipment (3D, Q/E keyboard, or the 2D bench plan — the no-WebGL fallback);
  progress on the device and via `useTracker`. Curriculum status `source_verified` for all four (UoK PHC-607,
  PHT-402, PHL-612, PHG-411); asset manifest with licences. Skill: `.claude/skills/virtual-labs/`.
- **Remaining work:** faculty review of each lab (a named reviewer before any status rises to
  `faculty_reviewed`); real clove micrographs (the one Commons photo is `needs_review`, the eyepiece view is
  schematic — a CC BY 4.0 candidate showing more elements is recorded in ASSET_RESEARCH.md's 2026-10-21 addendum);
  deploy + phone check; owner decision on the syrup start water (45 mL + 2 mL rinse leaves nothing to make up);
  server-side replay verification of completed runs (scores are labelled practice); possible further experiments
  per lab — **not in this release** (the test pins the catalogue at four).
- **Target set 2026-10-25 (owner's standard, `.claude/skills/pharmawallah-virtual-labs/`)** — all ⬜ Not started:
  split room (`DisciplineId`) from experiment id + one registry-driven route (existing URLs kept); schema fields for
  prerequisites, waste disposal, references, assumptions, `procedureStatus`; **three shortlisted experiments per lab
  — blocked: the owner's shortlist is not recorded**; the other three rooms on Babylon.js; one shared robotic tutor
  built on `suggest()`/hints/feedback.
- **Important files:** `src/lib/virtual-labs/`, `src/components/virtual-labs/`, `src/app/(site)/virtual-labs/`,
  `public/models/virtual-labs/`, `scripts/virtual-labs.test.mts`.
- **Dependencies:** none new (`three` already installed). Assets: Poly Haven CC0, one Wikimedia Commons CC BY-SA 4.0 photo.

### Simulations
- **Status:** ✅ Implemented (what remains after 2026-10-20)
- **Legacy `/simulations` removed 2026-10-20.** The hub and its 8 labs (titration, buffer, dilution, disk
  diffusion, UV, staining, organic ID, lab guide) and `/compounding-lab` were deleted and replaced by the
  Virtual Labs above (`/compounding-lab` redirects to the Simple Syrup lab). Remaining here: the antibiogram
  simulator, the pharmacy counter (below) and **Molecular Lab** (`/molecular-lab`, 2026-09-16 — replaced the
  Molecule Viewer; see above). `.claude/skills/lab-simulation/` is now a redirect stub.
- **The pharmacy counter is now a simulation too (2026-09-20).** `/pharmacy-counter` was rebuilt as
  the **Community Pharmacy Simulation Lab** in the same shape: pure `data/` + `engine/` layer,
  a stage machine (`engine/flow.ts`), presentation separated out, and **47 unit tests**. Fourteen
  gated stages plus a ten-stage minor-ailment path, ten clinical checks the student performs, an
  inventory that depletes, a label printer, counselling and a competency debrief. Ten cases.
  See `.claude/skills/pharmacy-counter/SKILL.md`.
  **Still a single file:** the antibiogram simulator.
- **Remaining work:** the antibiogram simulator is untested and not on the engine shape. (The old
  "convert the seven single-file labs" item is closed — those labs were removed on 2026-10-20, not converted.)
- **Important files:** `src/components/Simulations/CommunityPharmacy/`, `src/app/(site)/antibiogram-simulator/`,
  `src/components/AntibiogramSimulator.tsx`
- **Dependencies:** None. (`/api/scan-colonies` has had no web caller since 2026-09-16.)

### Progress tracking & dashboard
- **Status:** ✅ Implemented
- **Existing implementation:** Batched client queue → `/api/progress/batch` → shared
  `applyProgressEvent()`; Redis-cached reads; streaks, time spent, per-unit/flashcard/quiz/spotting
  progress, and a human-readable activity feed. Rate limited per user. Partial-failure tolerant.
- **Remaining work:** `current_streak` / `longest_streak` columns are read and returned but nothing
  in `applyProgressEvent()` updates them — ⚠ **needs verification**: either a Postgres trigger
  maintains them (schema is not in the repo) or streaks are permanently 0.
- **Important files:** `src/lib/progress-server.ts`, `src/lib/activityQueue.ts`, `src/hooks/useProgress.ts`, `src/app/api/progress/`
- **Dependencies:** Supabase; Redis optional (degrades cleanly)
- **Notes:** Service-role client — the `user_id` filter is the only protection. See `MEMORY.md` §3.

---

## Phase 3 — Tournament & clinical sub-brand ✅

### Battle Royale (Pharma Fest event) 🟡 built, not live
Built and verified on a local Postgres + PostgREST stand-in (2026-09-27). **Blocked on the owner:**
run `supabase/migrations/20260927_battle_royale.sql` and the question seed, add an admin row to
`br_admins`, set `NEXT_PUBLIC_SITE_URL`, set the event date/venue in admin Settings. Never run
against the real Supabase project or with a real Resend send.

### Tournament
- **Status:** ✅ Implemented
- **Existing implementation:** Registration → admin approval → entry code → code validation →
  server-graded play (MCQ, flashcard, spotting, snake) → Redis-session scoring → score submission →
  Redis-cached leaderboard over a Postgres view. Attempt numbers claimed atomically by RPC.
  IP rate limiting on every anonymous endpoint.
- **Remaining work:** None for the event flow. Two debts: entry-type→games/retries maps are
  duplicated across two admin routes, and the admin email allowlist across three.
- **Important files:** `src/app/api/tournament/`, `src/lib/tournament-redis.ts`, `src/lib/leaderboard-data.ts`, `src/lib/tournament-data/`
- **Dependencies:** Upstash Redis is a **hard** dependency here (`Redis.fromEnv()` throws)
- **Notes:** Server-authoritative scoring is load-bearing — read `MEMORY.md` §2 before changing it.
  `/tournament` itself has no page; entry is `/tournament/play`.

### Clinical subdomain tools
- **Status:** ✅ Implemented
- **Existing implementation:** Drug finder (RxNorm), adverse effects (openFDA), drug–drug and
  drug–food interaction checkers, AMR surveillance dashboard, ADR, encyclopedia, literature
  resources (PubMed / DailyMed / MedlinePlus / ClinicalTrials.gov), dose-calculator hub. Mongo and
  Supabase caches in front of every external source.
- **Remaining work:** `src/app/api/clinical/amr/route.ts:33` uses the browser client server-side —
  correct it to `createServerSupabaseClient()` for consistency.
- **Important files:** `src/app/clinical/`, `src/app/api/clinical/`, `src/lib/api/`
- **Dependencies:** MongoDB; Supabase cache tables; `OPENFDA_API_KEY`; optional `NCBI_API_KEY`

### AI features
- **Status:** ✅ Implemented
- **Existing implementation:** Gemini chat tutor with a pharmacy-scoped system prompt and safety
  steering; streaming prescription reader (edge runtime); histology observation grading. Colony
  counting moved on-device (OpenCV.js) on 2026-09-16; its Gemini route `scan-colonies` is now called
  only by APK v1.0–1.2 — delete it once those are retired (owner decision, CLAUDE.md Known Issue 17).
- **Remaining work:** Remove the `NEXT_PUBLIC_GEMINI_API_KEY` fallback in
  `evaluate-histology/route.ts:17`. **`/api/chat` was rate limited, validated and clamped on
  2026-09-20** and is now the pattern to copy; the other three remain open, billable endpoints.
  See Phase 5. Separately, the key is on the **free tier — 5 requests/min for the whole project**
  (measured), which is a product ceiling, not just a security one: enabling billing is an owner
  decision (CLAUDE.md §7 Known Issue 0c).
- **Important files:** `src/app/api/{chat,prescription-reader-v2,evaluate-histology,scan-colonies}/route.ts`
- **Dependencies:** `GEMINI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`

### Community (Reddit-shaped) — replaced the flat Q&A on 2026-09-20
- **Status:** 🟡 Built, **not yet live** — blocked on one owner action.
- **Existing implementation:** 12 pharmacy spaces; posts in four kinds (discussion / question /
  link / image) with flair, tags, save, share, report, edit, soft delete, pin, lock; nested comments
  to depth 8 with collapse and inline reply/edit; accepted answers on Question posts; hot / new /
  top / rising feeds with range, space, tag, kind, unanswered and search filters; infinite scroll;
  card/compact density; karma; join/leave spaces; a private Saved list; a moderation report queue.
  Voting is server-authoritative via the `community_vote` RPC.
- **Remaining work:** 🔴 **The owner must run `supabase/migrations/20260920_community.sql` in the
  Supabase SQL editor.** Nothing else blocks it; until then every `/community` route renders its
  error boundary. Afterwards, walk one post end to end (post → comment → reply → vote → accept →
  save) and confirm karma and counters move. Open decisions: image uploads (none today — image
  posts take a URL), notifications, a moderator UI.
- **Important files:** `supabase/migrations/20260920_community.sql`, `src/lib/community/`,
  `src/app/api/community/`, `src/components/community/`, `src/hooks/useCommunityVote.ts`,
  `scripts/community.test.mts`
- **Dependencies:** the migration above. **Unlike every other feature, its RLS policies ARE in the
  repo** — they ship in that file.

### Legacy Q&A (data retained, UI retired)
- **Status:** 🟤 Superseded
- **Existing implementation:** `questions`, `answers`, `votes` tables and `/api/qa/*` routes are
  untouched and still functional; the migration *copies* them into the community tables rather than
  moving them, so the change is reversible.
- **Remaining work:** delete `/api/qa/*` and the three tables once the community is proven in
  production. Nothing in the UI calls them any more.
- **Important files:** `src/app/api/qa/`

---

## Phase 4 — Catalogue completion & consolidation 🔵 (current)

### Register remaining course subjects
- **Status:** ⚪ Not Started — **recommended next**
- **Remaining work:** See §Recommended Next Feature above.
- **Important files:** `src/lib/courses/registry.ts`, `src/lib/courses/subjects/`
- **Dependencies:** None

### Surface the unlinked calculators
- **Status:** 🟡 Partial — done on Android, **still outstanding on the web**.
- **Remaining work:** Add `antagonism-simulator`, `emax-model-calculator`,
  `drug-half-life-calculator`, `osmolar-gap-calculator` and `opioid-conversion-calculator` to
  their subject in `src/app/(site)/calculation-tools/tool-index.ts`, or to `src/app/clinical/dose-calculators/page.tsx`.
- **Important files:** `src/app/(site)/calculation-tools/tool-index.ts`
- **Dependencies:** None
- **Notes:** Small, safe, immediately visible. Good warm-up task. `mobile/app/_data/tool-registry.ts`
  already has correct display names and categories for all five — copy from there.

### Consolidate the admin allowlist
- **Status:** ⚪ Not Started
- **Remaining work:** Extract `ADMIN_EMAILS` and the shared `requireAdmin()` into one module
  (e.g. `src/lib/admin.ts`); import from all three admin routes. Extract the duplicated
  entry-type → games/retries maps alongside it.
- **Important files:** `src/app/api/admin/**/route.ts`
- **Dependencies:** None
- **Notes:** A DB-backed role would be better long term but is a larger change.

### Delete dead code
- **Status:** ⚪ Not Started
- **Remaining work:** `src/app/api/calculators.tsx`, `data.tsx`, `physiology-data.ts`,
  `biochemistry-data.ts`; `src/lib/models/{Review,userProgress}.ts`; the `/api/reviews` entry in
  `PROTECTED_PATHS`; the `next-auth` / `next-cloudinary` / `next-mdx-remote` dependencies; the
  `predeploy`/`deploy` scripts. Nine subject `-data.ts` files go once converted.
  Also `src/components/Home/{Hero,Companies,Courses,Features,ContactForm}/`, unrendered since the
  landing-page replacement — but `ContactForm` was the home page's only entry to `POST /api/contact`
  (Resend), so decide where that lead channel lives before deleting it.
- **Important files:** See `PROJECT_MAP.md` §Dead or orphaned code
- **Dependencies:** Subject conversion should land first
- **Notes:** Verify zero importers immediately before each deletion — don't trust this list alone.

---

## Phase 4.5 — Android app ✅ (distribution in-repo; Play Store not started)

### Offline calculators APK (Capacitor)
- **Status:** ✅ Built — **v1.5 (versionCode 6), 2026-10-08**, signed with the same key, copied to
  `public/downloads/pharmawallah-calculators.apk`: 106 calculators + the how-to-use guide. 🟡 **Not
  deployed** until committed. (v1.4 2026-09-20, v1.3 2026-09-16, v1.1/v1.2 2026-09-13/14 before it.)
- **Existing implementation:** `mobile/` — a second Next.js project root with `output: "export"`,
  containing all 104 calculators as generated one-line re-exports of the real tool files.
  `capacitor.config.ts` (`webDir: mobile/out`) + `android/` native project. ✅ 2026-09-16: home
  screen redesigned — animated "space" hero with search, Recent and Saved (on the phone), the two
  camera tools featured, colour-coded subject tiles, a bottom bar (Home / Browse / Saved) with
  hash views so Android's back button works, and a star in each tool's app bar.
- **Verified (v1.3):** 104 tool pages, both camera tools and the home screen driven in headless
  Chrome with every non-local request failed (airplane mode) — 0 external requests; APK V2-signed
  with the v1.0 certificate. **Not verified on a real phone.**
- **Remaining work:**
  - Install v1.3 on a real phone: update over v1.2, camera capture in both camera tools, cold start.
  - ~~Replace the default Capacitor launcher icon and splash screen~~ — done (v1.2 onward).
  - A Play Store listing (signing key exists in `android/keystore.properties`).
  - ~~Optional: an iOS target (`@capacitor/ios`)~~ - **done 2026-09-22**, see Phase 4.54.
- **Important files:** `mobile/README.md`, `mobile/next.config.mjs`,
  `mobile/app/_data/tool-registry.ts`, `scripts/generate-mobile-routes.mjs`, `capacitor.config.ts`
- **Dependencies:** JDK 21 (installed) and `~/Android/Sdk`.
- **Notes:** The app is offline by construction — the whole bundle lives in the APK. Since v1.3 no
  tool needs a connection (`ONLINE_ONLY_SLUGS` is empty); OpenCV.js (10.8 MB) ships inside it.

---

## Phase 4.54 - iOS app (Capacitor) 🟡 (compiles in CI; never run on a device, not signed)

### Offline calculators for iPhone/iPad
- **Status:** 🟡 The Xcode project exists, is committed, syncs cleanly and — since 2026-09-22 —
  **compiles**: the macOS CI job went green on its first run (Simulator + unsigned arm64 device
  slice, 5m22s). It has still **never been run or installed**, and there is no signed `.ipa`.
- **Existing implementation:** `ios/` - a Capacitor 8 Xcode project wrapping the *same*
  `mobile/out` bundle the APK wraps (105 calculators + the hub). Capacitor 8 uses **Swift Package
  Manager**, not CocoaPods, so `cap add ios` and `cap sync ios` run on Linux. Brand icon and
  Outfit-set launch screen from `scripts/generate-ios-assets.mjs`; `Info.plist` declares **no
  permissions** and `ITSAppUsesNonExemptEncryption = false`; `ios.contentInset: "never"` so the
  web layer's own safe-area padding is not doubled; Capacitor's keyboard accessory bar turned on
  for iOS only (`mobile/app/_components/NativeShell.tsx`) because the decimal keypad has no return
  key; Download/Print replaced by a native **Share** of the lab-record card.
- **Verified:** `npx tsc --noEmit` 0 errors; `npm run mobile:build` exit 0 (106 HTML pages, CSS
  88,734 B); `cap sync ios` and `cap sync android` both exit 0 and find the 3 plugins; `Info.plist`
  parses with zero `*UsageDescription` keys; 0 secrets and 0 ad strings in the bundle; the icon read
  under a real iOS squircle mask and the splash read at a 19.5:9 aspect-fill crop.
- **CI:** `.github/workflows/ios-app.yml` compiles the app on a `macos-latest` runner — Simulator
  (Debug) **and** the arm64 device slice (Release, unsigned) — gated on two guards: `Info.plist`
  must request no permissions, and ≥100 calculator pages must be bundled. It needs **no Apple
  account and no secrets**, and uploads the `.app` as an artifact. `workflow_dispatch` + `ios-v*`
  tags only, because macOS runners bill at 10x on a private repository. **First run 2026-09-22:
  `success`, 5m22s, all 13 steps green.**
- **Remaining work:**
  - ~~Run the "iOS app" workflow once~~ — **done 2026-09-22, conclusion `success`.** It compiles.
  - Download the `pharmawallah-ios-simulator-app` artifact and run it in a Simulator on a Mac, for
    the things a compile cannot show: the launch-screen handover, the keyboard accessory bar, the
    share sheet.
  - An Apple Developer team, a provisioning profile and an App Store Connect record. None exist.
  - Decide distribution: TestFlight, App Store, or neither for now.
- **Important files:** `ios/App/App/{Info.plist,Assets.xcassets}`, `capacitor.config.ts` (`ios`
  block), `scripts/generate-ios-assets.mjs`, `.claude/skills/ios-app-capacitor/SKILL.md`
- **Dependencies:** macOS + Xcode (not available on the project machine).
- **Notes:** The brief also asked for calculation history, a Pharmaceutical Values browser and
  CSV/PDF export. Those live in the shared `mobile/` layer (so they would change Android too) and
  the user scoped them **out** of the iOS task on 2026-09-22. They are not blocked, just not built.

---

## Phase 4.55 — Windows desktop app (Tauri 2) 🟡 (built, never compiled)

### Offline calculator suite for Windows
- **Status:** 🟡 **Frontend complete and verified; the Rust half has never been compiled.** There is
  no Rust toolchain on the development machine and the host is Linux, so **no `.exe` and no
  installer exist yet**. Everything else works and was driven end to end.
- **Existing implementation:** `desktop/` — a third Next.js project root with `output: "export"`,
  containing all 105 calculators as generated one-line re-exports, plus six desktop-only sections
  (dashboard, calculator index, 212-row searchable values library, 40-formula reference, unit
  converter, calculation history, settings). `src-tauri/` — Tauri 2 shell: four Rust commands, no
  plugins, no networking crate, `core:default` as the only permission.
- **Verified:** `npx tsc --noEmit -p desktop/tsconfig.json` → 0 errors. `npm run desktop:build` →
  exit 0, 116 static pages, shared JS 88.2 kB, CSS 78.7 kB. `npm run desktop:audit` → passed, with
  **0 remote subresources in the emitted HTML**. Driven in headless Chrome with every non-local
  request failed — **25/25 checks, 0 console errors, 0 application requests left the machine**;
  save → reload → history persists → export (TXT and PDF both wrote a file) → delete; no horizontal
  overflow at 1400×900 or 1000×650.
- **Remaining work:**
  - **Compile it.** Easiest route, needing no Windows machine and no local Rust:
    `.github/workflows/desktop-windows.yml` (added 2026-09-22) builds it on a `windows-latest`
    runner — push, then Actions → "Windows desktop app" → Run workflow, and download the
    `pharmawallah-windows-installer` artifact. Locally on Windows it is `pnpm install`, rustup,
    `pnpm tauri:build`. Either way, expect to fix small Rust/config errors on the first compile —
    nothing Rust has been through a compiler. If `tauri dev` rejects the config, suspect
    `app.security.devCsp` first.
  - Install the result on a real Windows machine: WebView2, the window chrome, the print dialog,
    the NSIS installer, and the four Rust commands (store load/save/path, export) which have never
    executed — only their browser fallbacks have.
  - Decide whether 21.3 MB of export (10.8 MB of it OpenCV.js for one calculator) is acceptable.
  - Optional: a code-signing certificate, so Windows SmartScreen does not warn on first run.
- **Important files:** `desktop/README.md`, `desktop/next.config.mjs`, `src-tauri/tauri.conf.json`,
  `src-tauri/src/lib.rs`, `scripts/generate-desktop-routes.mjs`, `scripts/audit-desktop-offline.mjs`
- **Dependencies:** a Rust toolchain (not installed), and Windows to produce a Windows installer.
- **Notes:** Offline is a requirement, not a property — `npm run desktop:audit` is wired into
  `tauri:build` and fails the build on an ad network, analytics, an API client, a CDN script, a
  secret-shaped string or any remote subresource in the HTML.

---

## Phase 4.6 — Monetisation (Google AdSense) 🟡

### Ad placements across the site
- **2026-09-23 — AdSense rejected the site for "Low value content".** Site-quality pass done in
  code (see CLAUDE.md §8 entry of that date): per-page titles/descriptions/canonicals on every
  page, `robots.txt` + `sitemap.xml`, clinical-subdomain duplicates canonicalised to www, 9 broken
  links fixed, placeholder phone/social/"Coming Soon"/template pages removed, fake contact and
  careers forms wired to a real endpoint, false FAQ and privacy-policy statements corrected,
  inflated figures replaced, community feed bug fixed. **Owner steps before re-requesting review:**
  deploy; make the apex→www redirect permanent in Vercel (it is a 307); submit the sitemap in
  Google Search Console and let it recrawl; decide on the DrugBank text (replicated-content policy). The textbook-derived lesson markdown
  is **no longer public** — it moved from `public/content/` to `content/` (read server-side only). Traffic and site age ("consistent
  presence", "user interest") cannot be fixed in code.
- **Status:** 🟡 Loader + verification tag now in `<head>` on every page and not env-dependent;
  `ads.txt` live. **Blocked on two things only the account owner can do:** passing AdSense site
  verification (needs the current code deployed), and creating the ad units so their IDs can be
  set. No ad unit renders until then.
- **Existing implementation:** `src/components/calculators/AdSlot.tsx` is the single placement
  component. `src/app/layout.tsx` renders the `adsbygoogle.js` loader, but only when
  `NEXT_PUBLIC_ADSENSE_CLIENT` is set. `public/ads.txt` authorises the publisher.
  Publisher ID: `ca-pub-9553986083846603` (a public identifier, also in `ads.txt`).
- **Placements (re-planned 2026-09-23, "4–5 on content pages"):** lessons 3–5 (spaced between
  sections by `src/lib/ads/split-for-ads.ts`), calculators 3 (aside, before the FAQ, footer band),
  the calculator hub 4, histology and pathology lessons 3, powder lessons 2, the spotting hub,
  flash cards and course subject listing 1 each. Full table in the `adsense-monetization` skill.
- **Deliberately excluded:** auth pages, the dashboard, `/admin`, tournament play and the
  leaderboard, timed spotting and MCQ tests, the simulations, and the AI tools — thin, private,
  or timed surfaces where an ad is disruptive or a policy risk.
- **Remaining work:**
  - Create the ad units in **AdSense → Ads → By ad unit** and fill in
    `NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR`, `_CALCULATOR_FOOTER`, `_LESSON`, `_LIST` (and optionally `_CALCULATOR_INLINE`, which otherwise reuses `_CALCULATOR`). Any left
    blank simply renders nothing. (`_HOME_1/2/3` are unused since the landing page's ad bands
    were removed on 2026-09-13.)
  - Add the seven `NEXT_PUBLIC_ADSENSE_SLOT_*` variables to the **Vercel** project — `.env` is
    gitignored, so ad units stay blank in production until they are set there. (The publisher ID
    no longer needs this; it is a hardcoded constant with an env override.)
  - Decide on **Auto ads**. Recommendation: leave them **off** and keep the manual placements —
    Auto ads inject into the timed tests, simulations and tournament pages, which is exactly what
    the exclusions above avoid.
  - Migrating more calculators to the UI kit gives each an in-`aside` ad for free.
- **Important files:** `src/components/calculators/AdSlot.tsx`, `src/app/layout.tsx`,
  `public/ads.txt`, `src/app/(site)/calculation-tools/(tools)/layout.tsx`,
  `.claude/skills/adsense-monetization/SKILL.md`
- **Dependencies:** AdSense site approval and the ad-unit IDs — both the user's, not doable here.
- **Notes:** The Android app is deliberately ad-free: `AdSlot` returns `null` when
  `NEXT_PUBLIC_IS_MOBILE_APP` is set, and a web `layout.tsx` never reaches the APK because the
  generated mobile routes re-export only the page component. Verified — zero ad strings in
  `mobile/out`. The privacy policy was rewritten on 2026-09-23 to disclose AdSense's third-party
  cookies with Google's opt-out links, as the Publisher Policies require.

---

## Phase 4.7 — Site-wide redesign (top-design) 🔵

### Bring every page and calculator to the 2026-09-13 design standard
- **Status:** 🔵 In Progress — Phase 0 done (inventory, tracker, page kit, directions published);
  **blocked on the user's choice of direction per family**. No page redesigned yet.
- **Existing implementation:** `.claude/redesign-tracker.md` (the plan and status of record),
  `src/components/page-kit/`.
- **Remaining work:** Phase 1 pages in order hub → courses → MCQ → spotting → simulations → community →
  dashboard → auth → static → tools → tournament → clinical → admin. **Phase 2 (migrate every
  calculator onto the calculator kit) is COMPLETE — 104/104, 2026-09-20**; the "81 calculators"
  figure recorded here before that was stale.
- **Notes:** UI only. Logic faults found while measuring (tracker F9, F10, F17, F19) need approval.

### Calculator refinement standard (the 2026-09-22 brief)
- **Status:** ⚪ Not started — **the procedure exists, no tool has been refined.**
  `.claude/skills/calculator-refinement/SKILL.md` (2026-09-22) encodes the user's 25-section brief
  against what the kit actually provides.
- **Why it is a separate item from Phase 2:** the migration made all 104 tools *consistent*; this
  makes them *teach* — units the student picks rather than types, a loadable example, the
  substitution shown line by line, a graph where the data has a shape, and a record they can copy.
- **Measured starting point (2026-09-22, counted over the 104 tool pages):** 35 have a unit
  selector, 37 draw a Recharts graph, 15 build a lab record (`LabActions`), 9 use an editable
  `DataTable`, 68 have some example/preset affordance, 3 ever print scientific notation.
- **Known gaps in the shared kit:** no unit tables beyond mass/volume/amount, no temperature or
  time conversion, no graph-tab component, no notation/decimals toggle, no reset confirmation.
- **Constraint:** refinement is presentation. The ~70 suspected formula faults
  (`.claude/redesign-tracker.md`, `CLAUDE.md` Known Issue 15) are **not** fixed by it — that is
  logic work and an owner decision.

## Phase 5 — Hardening ⚪

### Configure ESLint
- **Status:** 🔴 Blocked on a decision — **highest-leverage hardening item**
- **Remaining work:** There is no ESLint config, so `npm run lint` opens an interactive setup
  prompt and exits 0 without linting. Add `.eslintrc.json` with `eslint-config-next`, run it,
  **record the resulting problem count as the baseline** in `CLAUDE.md` §9.
- **Important files:** `package.json`, new `.eslintrc.json`
- **Dependencies:** Choosing Strict vs Base — ask the user
- **Notes:** Expect a large first-run count across 438 files. Agreeing the baseline matters more
  than driving it to zero.

### Rate-limit and gate the AI routes
- **Status:** 🟡 Partially Implemented — 1 of 4 done
- **Done (2026-09-20):** `/api/chat` — anonymous 8/5 min by IP, signed-in 30/5 min by user id, body
  validated and clamped (30 turns, 8k chars each, 24k total) **before** any Gemini call, unknown
  roles dropped, upstream quota surfaced as a 503. It is the reference implementation; copy it.
- **Remaining work:** `/api/prescription-reader-v2`, `/api/evaluate-histology`, `/api/scan-colonies`
  are still unauthenticated, unthrottled, and cost money per call. Image payloads make the first
  two the more expensive of the three — bound their input size as well as their rate.
- **Important files:** those three routes; `src/app/api/chat/route.ts` (the pattern),
  `src/lib/rateLimit.ts` (`checkLimit`, fails open)
- **Dependencies:** Upstash
- **Notes:** Was the highest-risk open issue after the missing schema; the chat route was the most
  exposed of the four because it is linked from the home page for signed-out visitors.

### Make the build env-independent
- **Status:** ⚪ Not Started
- **Remaining work:** Move module-scope env validation in `src/lib/supabase-server.ts`,
  `src/lib/supabase-admin.ts`, and root `lib/mongodb.tsx` into lazy initialisation so
  `npm run build` does not require real credentials.
- **Important files:** those three files
- **Dependencies:** None

### Version-control the Supabase schema
- **Status:** ⚪ Not Started
- **Remaining work:** Export tables, the `tournament_leaderboard_best` view, the
  `claim_tournament_attempt` function, and all RLS policies into a `supabase/` directory.
- **Important files:** new `supabase/migrations/`
- **Dependencies:** Supabase dashboard access
- **Notes:** Today the schema exists in exactly one place with no backup and no review trail.
  Arguably the project's largest single risk.

### Replace the in-memory comments rate limiter
- **Status:** ⚪ Not Started
- **Remaining work:** `src/app/api/comments/route.ts` uses a module-scope `Map` — per-instance and
  reset on cold start. Switch to Upstash like every other route.
- **Important files:** `src/app/api/comments/route.ts`
- **Dependencies:** Upstash

### Test infrastructure
- **Status:** ⚪ Not Started
- **Remaining work:** No framework, no tests, no CI. If introduced, start with the pure logic that
  is genuinely testable in isolation: `src/lib/mcq-utils.ts`, `src/lib/api/cacheKey.ts`,
  `normalizeAnswer` in `flashcard-bank.ts`, and `applyProgressEvent()`'s validation branch in
  `progress-server.ts` (its `validateEvent` helper is module-private — test through the exported
  function and assert on `ProgressEventValidationError`).
- **Important files:** —
- **Dependencies:** User decision on framework
- **Notes:** Until then, "verified" means type-check + build + manually exercising the page.
