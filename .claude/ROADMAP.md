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

1. **The content is already written and already shipping.** `public/content/` contains markdown for
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
  `public/content/`. A missing file surfaces as a broken unit page, not a build error.
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
  - Five tools (`AntagonismSimulator`, `EmaxModelCalculator`, `drug-half-life-calculator`,
    `OsmolarGapCalculator`, `OpioidConversionCalculator`) are **reachable only by typed URL on the
    web** — add them to `tool-index.ts`, or to the clinical hub. All five already ship in the Android
    app. Audited 2026-09-13: `OsmolarGapCalculator` is complete and correct (best to list);
    `OpioidConversionCalculator` is **not clinically safe** (one ×3 IV factor for every opioid) — keep it
    unlisted; `drug-half-life-calculator` is only partly working.
  - **Formula faults found by the 2026-09-13 hub audit** — see CLAUDE.md §7 Known Issues 15.
  - Delete the dead legacy registry `src/app/api/calculators.tsx` (419 lines, zero importers).
  - 🔄 Migrate older tools to the shared kit (`src/components/calculators/`) — **85 of 104 done
    (2026-09-13)**, each verified number-for-number against `5dbe98c`; 17 left as of 2026-09-16 (tracker Phase 2).
    Migration keeps formulas, so the ~70 suspected faults it found are still live — tracker
    "Suspected maths issues"; the clinical-only opioid tools and creatinine staging are the priority.
- **Important files:** `src/app/(site)/calculation-tools/tool-index.ts`, `(tools)/<slug>/page.tsx`, `src/app/clinical/dose-calculators/page.tsx`
- **Dependencies:** —
- **Notes:** Adding a directory does **not** add a card on the web hub (`tool-index.ts` lists 93 of 104). Every tool carries the educational disclaimer from the `(tools)` layout (web) and `MobileShell` (APK) since 2026-09-13.
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
- **Important files:** `src/lib/courses/registry.ts`, `src/lib/courses/types.ts`, `src/lib/courses/subjects/*.ts`, `public/content/`
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
  that receives the graph as data (optional, spec'd as later); a link from `/encyclopedia` monographs
  ("Open in Molecular Lab" — the page already accepts `?smiles=&name=` and `?cid=`); progress tracking
  (`useTracker`) is not wired.
- **Important files:** `src/components/molecular-lab/`, `scripts/build-molecule-library.mts`
- **Dependencies:** `openchemlib` 9.25.0 (new), `3dmol` 2.5.5 (now bundled); PubChem and RCSB from the browser.

### Simulations
- **Status:** ✅ Implemented
- **Existing implementation:** 8 labs (titration, buffer, dilution, disk diffusion, UV, staining,
  organic ID, lab guide) plus the antibiogram simulator, compounding lab, and **Molecular Lab**
  (`/molecular-lab`, 2026-09-16 — replaced the Molecule Viewer; see below).
  Canvas work via `konva`/`react-konva`, 3D via `three`/`3dmol`.
- **Remaining work:** None outstanding. The simulations hub page has an under-construction branch —
  verify it is not shown for shipped labs.
- **Important files:** `src/app/(site)/simulations/`, `src/components/Simulations/`
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
  `evaluate-histology/route.ts:17`. **None of the AI routes are rate limited or authenticated** —
  they are open, billable endpoints. See Phase 5.
- **Important files:** `src/app/api/{chat,prescription-reader-v2,evaluate-histology,scan-colonies}/route.ts`
- **Dependencies:** `GEMINI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`

### Q&A community
- **Status:** ✅ Implemented
- **Existing implementation:** Ask, answer, vote, tag filtering, pagination with clamped limits,
  per-user vote highlighting, author profiles via a `profiles` join.
- **Remaining work:** ⚠ **Needs verification** — this is the only feature relying on RLS, and the
  policies are not in the repo. Confirm in the Supabase dashboard that `questions`, `answers`,
  `votes`, and `profiles` have policies that prevent editing others' rows.
- **Important files:** `src/app/api/qa/`, `src/app/(site)/community/`, `src/hooks/useVote.ts`
- **Dependencies:** Supabase RLS policies (external)

---

## Phase 4 — Catalogue completion & consolidation 🔵 (current)

### Register remaining course subjects
- **Status:** ⚪ Not Started — **recommended next**
- **Remaining work:** See §Recommended Next Feature above.
- **Important files:** `src/lib/courses/registry.ts`, `src/lib/courses/subjects/`
- **Dependencies:** None

### Surface the unlinked calculators
- **Status:** 🟡 Partial — done on Android, **still outstanding on the web**.
- **Remaining work:** Add `AntagonismSimulator`, `EmaxModelCalculator`,
  `drug-half-life-calculator`, `OsmolarGapCalculator` and `OpioidConversionCalculator` to
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
- **Status:** ✅ Released — **v1.3 (versionCode 4), 2026-09-16**, signed, published at
  `public/downloads/pharmawallah-calculators.apk` (v1.1 2026-09-13, v1.2 2026-09-14 before it).
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
  - Optional: an iOS target (`@capacitor/ios`) — the same `mobile/out` bundle would work.
- **Important files:** `mobile/README.md`, `mobile/next.config.mjs`,
  `mobile/app/_data/tool-registry.ts`, `scripts/generate-mobile-routes.mjs`, `capacitor.config.ts`
- **Dependencies:** JDK 21 (installed) and `~/Android/Sdk`.
- **Notes:** The app is offline by construction — the whole bundle lives in the APK. Since v1.3 no
  tool needs a connection (`ONLINE_ONLY_SLUGS` is empty); OpenCV.js (10.8 MB) ships inside it.

---

## Phase 4.6 — Monetisation (Google AdSense) 🟡

### Ad placements across the site
- **Status:** 🟡 Loader + verification tag now in `<head>` on every page and not env-dependent;
  `ads.txt` live. **Blocked on two things only the account owner can do:** passing AdSense site
  verification (needs the current code deployed), and creating the ad units so their IDs can be
  set. No ad unit renders until then.
- **Existing implementation:** `src/components/calculators/AdSlot.tsx` is the single placement
  component. `src/app/layout.tsx` renders the `adsbygoogle.js` loader, but only when
  `NEXT_PUBLIC_ADSENSE_CLIENT` is set. `public/ads.txt` authorises the publisher.
  Publisher ID: `ca-pub-9553986083846603` (a public identifier, also in `ads.txt`).
- **Placements (4 surfaces):** the calculator hub, every calculator page via
  `src/app/(site)/calculation-tools/(tools)/layout.tsx`, each migrated calculator's
  sticky `aside`, the course subject listing, and the end of every course lesson.
- **Deliberately excluded:** auth pages, the dashboard, `/admin`, tournament play and the
  leaderboard, timed spotting and MCQ tests, the simulations, and the AI tools — thin, private,
  or timed surfaces where an ad is disruptive or a policy risk.
- **Remaining work:**
  - Create the ad units in **AdSense → Ads → By ad unit** and fill in
    `NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR`, `_CALCULATOR_FOOTER`, `_LESSON`, `_LIST`. Any left
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
  `mobile/out`. Privacy and terms already disclose AdSense cookies.

---

## Phase 4.7 — Site-wide redesign (top-design) 🔵

### Bring every page and calculator to the 2026-09-13 design standard
- **Status:** 🔵 In Progress — Phase 0 done (inventory, tracker, page kit, directions published);
  **blocked on the user's choice of direction per family**. No page redesigned yet.
- **Existing implementation:** `.claude/redesign-tracker.md` (the plan and status of record),
  `src/components/page-kit/`.
- **Remaining work:** Phase 1 pages in order hub → courses → MCQ → spotting → simulations → community →
  dashboard → auth → static → tools → tournament → clinical → admin; Phase 2 migrates 81 calculators
  onto the calculator kit with before/after output capture.
- **Notes:** UI only. Logic faults found while measuring (tracker F9, F10, F17, F19) need approval.

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
- **Status:** ⚪ Not Started
- **Remaining work:** `/api/chat`, `/api/prescription-reader-v2`, `/api/evaluate-histology`,
  `/api/scan-colonies` are unauthenticated, unthrottled, and cost money per call. Apply the
  existing Upstash limiter pattern; consider requiring a session.
- **Important files:** those four routes, `src/lib/tournament-redis.ts` (`checkRateLimit` helper)
- **Dependencies:** Upstash
- **Notes:** Highest-risk open issue in the app after the missing schema.

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
