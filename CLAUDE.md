# PharmaWallah — Project Entry Point

> **Read this file first.** It is the index to the persistent project intelligence in `.claude/`.
> Keeping that system current is a **core project requirement**, not optional documentation.

---

## 1. Project Overview

**PharmaWallah** — an AI-assisted pharmacy education platform for pharmacy students (Pakistan-first,
Doctor-of-Pharmacy curriculum) plus a **clinical decision-support sub-brand** served on the
`clinical.*` subdomain for practising pharmacists.

The product is unusually broad for its size. Six distinct pillars share one Next.js app:

| Pillar | What it is |
| --- | --- |
| **Calculation tools** | 104 standalone pharmacy calculators under `/calculation-tools/<tool>` (2026-09-13) |
| **Courses & MCQ bank** | Semester → subject → unit markdown lessons + per-subject MCQ banks |
| **Spotting labs** | Histology / pathology / powder-microscopy slide lessons + timed identification tests |
| **Simulations** | 8 interactive wet-lab simulations (titration, disk diffusion, UV, staining, …) |
| **Tournament** | Entry-code-gated science-fair competition with server-authoritative scoring + leaderboard |
| **Clinical subdomain** | Drug finder, interaction checkers, AMR surveillance, ADR, encyclopedia, literature search |

Cross-cutting: Supabase auth, a progress/streak dashboard, a Q&A community, an AI chat tutor,
a prescription reader, and a PWA shell.

### Verified stack (installed versions, read from `node_modules/*/package.json`)

| Package | Installed | Notes |
| --- | --- | --- |
| `next` | **14.2.35** | App Router. **Not** Next 15/16 — `cookies()`/`headers()` are sync-compatible here |
| `react` / `react-dom` | **18.3.1** | |
| `typescript` | **5.9.3** | `strict: true`, `noEmit`, path alias `@/*` → `./src/*` |
| `tailwindcss` | **3.4.19** | v3, JS config at `tailwind.config.ts`, `darkMode: "class"` |
| `mongoose` | **9.3.3** | |
| `mongodb` (native driver) | **6.x** | Used *separately* from mongoose — see Known Gotchas |
| `@supabase/supabase-js` | **2.108.2** | |
| `@supabase/ssr` | **0.12.0** | |
| `@upstash/redis` | **1.38.1** | REST-based, safe in serverless |
| `@upstash/ratelimit` | **2.0.8** | |
| `ai` / `@ai-sdk/google` | **6.0.178** / **3.0.72** | Vercel AI SDK — used only by the prescription reader |
| `@google/generative-ai` | **0.24.1** | Direct Gemini SDK — used by the chat tutor |
| `framer-motion` | **11.18.2** | Animation on nearly every page |
| `lucide-react` | 0.575.x | The icon library. `@iconify/react` also present but marginal |
| `recharts` / `three` / `konva` | 3.7.0 / 0.185.1 / 9.3.22 | Charts / molecule viewer / canvas simulations |
| `next-auth` | 4.24.13 | **Installed but never imported — dead dependency.** Auth is Supabase |
| `@capacitor/core` / `cli` / `android` | **8.5.2** | Wraps `mobile/out` as an offline Android app |
| `openchemlib` | **9.25.0** | Added 2026-09-16 (user choice). Cheminformatics for `/molecular-lab` only: SMILES/MOL parsing, 2D layout, 3D conformers + MMFF94, MCS. Lazy, in a Web Worker (§6 rule 18) |
| `@techstark/opencv-js` | **4.12.0-release.1** | Added 2026-09-16 (user choice). OpenCV.js with embedded WASM, 10.8 MB — used **only** by the colony counter, emitted as a static asset (MEMORY gotcha 89) |

Runtime: **Node v24.19.0**, **pnpm 10.28.1** (declared `packageManager`), npm 12.0.2.

### Commands that actually exist

```bash
npm run dev      # next dev
npm run build    # next build   — REQUIRES a populated .env, see Known Issues
npm run start    # next start
npm run lint     # next lint    — NOT CONFIGURED, see Known Issues
npx tsc --noEmit # type-check   — the only reliable static check today
node --test scripts/tlc-rf.test.mts scripts/colony-counter.test.mts   # 41 unit tests for two tools only
node --test scripts/molecular-lab.test.mts                             # 21 unit tests, Molecular Lab
node scripts/build-molecule-library.mts   # regenerate the Molecular Lab library from PubChem (network)
```

```bash
npm run mobile:build   # regenerate routes + static export of the 98 calculators -> mobile/out
npm run mobile:sync    # mobile:build + `cap sync android`
npm run mobile:open    # open the native project in Android Studio
```

`npm run predeploy` / `npm run deploy` (gh-pages) are **stale and cannot work** — the app has API
routes and middleware, so it can never be statically exported to `out/`. (The Android app sidesteps
this with a *second* Next project root, `mobile/` — see §5.)

---

## 2. Start Here

| File | What it's for | Read it when |
| --- | --- | --- |
| `CLAUDE.md` (this file) | Entry point, stack, rules, current state, work log | Always, first |
| `.claude/PROTOCOL.md` | The mandatory step-by-step workflow | Every task. Executed, not skimmed |
| `.claude/MEMORY.md` | Durable facts: architecture decisions, invariants, gotchas | Before touching data, auth, or caching |
| `.claude/PROJECT_MAP.md` | "Where is X implemented?" | Before searching the repo by hand |
| `.claude/ROADMAP.md` | Reconciled feature status and what to build next | Starting new work, or asked "what's next" |
| `.claude/SKILLS.md` | Index of reusable procedures | Before inventing an approach |
| `.claude/skills/<name>/SKILL.md` | One procedure, deeply repo-specific | When its trigger matches |
| `.claude/history/YYYY-MM.md` | Archived work-log entries | Rarely — only for older context |

### Short workflows

**Understand a feature** → `.claude/PROJECT_MAP.md` to find the files → read those files →
`.claude/skills/analyze-feature/SKILL.md` if it spans subsystems.

**Continue development** → `.claude/PROTOCOL.md` → `.claude/ROADMAP.md` §Recommended Next Feature →
the matching domain skill → implement → verify against §4 baselines → knowledge sync.

**Fix a bug** → `.claude/skills/debug-issue/SKILL.md` → reproduce → `.claude/MEMORY.md` §Known
Gotchas (a large share of bugs here are already-known traps) → fix → verify → knowledge sync.

---

## 3. Source-of-Truth Rule

**Current code beats documentation, always.** If this file, `MEMORY.md`, `PROJECT_MAP.md`,
`ROADMAP.md`, or a skill disagrees with the code:

1. **Verify** against the code — read it, don't assume.
2. **Follow the code.**
3. **Correct the stale doc as part of that same task**, before reporting done.

A doc that is wrong is worse than a doc that is missing, because it will be trusted.

---

## 4. "follow protocol"

When the user says **"follow protocol"** (or "follow the protocol"), that is an instruction to
**read `.claude/PROTOCOL.md` and execute its numbered steps for the task at hand** — not to
acknowledge that a protocol exists. Do the steps. Report in the protocol's `## Report` format.

---

## 5. Architecture Summary

### Routing and shells
- Next.js **App Router**, all under `src/app/`.
- Three top-level route surfaces:
  - `src/app/(site)/…` — the main student-facing site (route group, no URL segment).
  - `src/app/clinical/…` — the clinical sub-brand.
  - `src/app/api/…` — route handlers **and, unusually, plain data modules** (see Gotchas).
- A **fourth, separate Next.js project root**: `mobile/` — the offline Android app. It contains
  only the 98 calculators, uses `output: "export"`, and has no API routes or middleware, so it
  *can* be statically exported (the main app cannot). Its pages are generated one-line re-exports
  of the real tool files, so calculators are never duplicated. Capacitor packages `mobile/out`
  into the APK. See `.claude/skills/android-app-capacitor/SKILL.md`.
- `src/app/layout.tsx` is the single root layout. It reads the `x-subdomain` request header
  (set by middleware) to switch metadata and pass `isClinicalSubdomain` into `AppShell`.
- `src/middleware.ts` does two jobs: hostname-based `clinical.` subdomain tagging, and auth
  gating for a **small explicit allowlist** of protected paths.

### Auth
- **Supabase Auth** (`@supabase/ssr`), cookie-based. There is no NextAuth despite the dependency.
- Browser: `createClient()` from `src/lib/supabase.ts`, consumed via `useSupabaseUser()`.
- Server: `createServerSupabaseClient()` from `src/lib/supabase-server.ts` (anon key + user cookies).
- Service role: `createServiceSupabaseClient()` (same file) or the `supabaseAdmin` singleton in
  `src/lib/supabase-admin.ts`. **Both bypass RLS.**

### Authorization — two different models coexist
This is the single most important architectural fact in the repo.

1. **Route-enforced** (progress, tournament, admin): the handler authenticates with the *user*
   client, then does all data access with the **service-role** client. RLS is bypassed, so the
   `.eq("user_id", user.id)` / ownership filter **in the handler is the only thing protecting the
   data**. Drop the filter and you leak every user's rows.
2. **RLS-enforced** (Q&A community, AMR): the handler uses only the anon/user client, so Postgres
   RLS policies decide what is visible. Those policies live in the Supabase dashboard and are
   **not in this repo**.

Admin authorization is a **hardcoded email allowlist**, duplicated in three files.

### Data stores — three of them
- **Supabase Postgres** — auth, `progress` + child tables, Q&A (`questions`/`answers`/`votes`),
  tournament (`entry_codes`, `tournament_registrations`, `tournament_scores`,
  `tournament_leaderboard_best` view, `claim_tournament_attempt` RPC), `amr_surveillance`, and
  the clinical literature caches (`pubmed_cache`, `medlineplus_cache`, `clinicaltrials_cache`).
- **MongoDB** — two separate connections to two separate databases (see Gotchas). Used purely as
  a **cache and content store** for external drug data and for unit comments.
- **Upstash Redis** — rate limiting, progress cache, tournament attempt sessions, leaderboard cache.
  Every use is designed to **degrade gracefully** if Redis is absent, except the tournament paths.

### External integrations
RxNorm, openFDA, DailyMed, MedlinePlus, PubMed (NCBI E-utilities), ClinicalTrials.gov — all in
`src/lib/api/*.ts`, all wrapped by a route under `src/app/api/clinical/` or `src/app/api/drugs/`.
Google **Gemini** powers the chat tutor, prescription reader, histology evaluation, and colony
counting. **Resend** sends the contact form email.

### Content
Course lesson prose is **markdown on disk** in `public/content/<subject>/<unit>.md` (69 files),
plus a smaller `src/content/` tree. Subject/unit metadata is **TypeScript**, in
`src/lib/courses/subjects/`, registered through `src/lib/courses/registry.ts`.

---

## 6. Engineering Rules

These are conventions **observed in the code**, not aspirations.

1. **Path alias `@/`** for everything under `src/`. The two `lib/mongodb` imports that use
   relative `../../../../lib/mongodb` are the root-level client — that is deliberate, not a typo.
2. **Route handlers return `NextResponse.json(...)`** with an explicit status. Errors use
   `{ error: "message" }`. Several routes define a local `errorResponse(message, status)` helper.
3. **Validate and clamp every query param.** The established pattern (`src/app/api/qa/questions/route.ts`)
   parses, checks `Number.isFinite`, and clamps against a `MAX_*` constant declared at module top.
4. **Never trust a client-supplied score, answer, or authorization claim.** The tournament is the
   reference implementation: answers are checked server-side, the running score lives in Redis, and
   `submit-score` reads the score from Redis rather than the request body.
5. **Strip answer keys before sending question data to the browser** (`toPublicMCQ` /
   `toPublicFlashcard` in `src/app/api/tournament/game-questions/route.ts`).
6. **Rate-limit anything anonymous or expensive.** Use the shared limiters, not ad-hoc ones.
7. **Caches fail open, never closed.** Redis read/write failures are logged and the code falls
   through to Postgres. `checkLimit()` in `src/lib/rateLimit.ts` explicitly returns success on error.
8. **Partial failures degrade a section, not the page.** See the `Promise.allSettled` + `unwrap`
   pattern in `GET /api/progress`.
9. **Mongoose models guard against hot-reload recompilation**: `models.X || model("X", schema)`.
10. **Client components are the default for pages** — nearly every page starts with `"use client"`.
    Server-side work happens in route handlers and `src/actions/lesson.ts`.
11. **Comments explain *why*.** The existing code has genuinely good rationale comments. Match that
    density; don't strip them, and don't add noise.
12. **Tailwind uses the project's brand tokens** (`brandBlue`, `brandGreen`, `clinicalPrimary`, …)
    from `tailwind.config.ts`. Spotting/test pages instead use local hex design-token constants.
13. **`lucide-react` for icons, `framer-motion` for motion.** Don't introduce a third of either.
    **One documented exception:** the landing page (`src/components/Home/landing/`) uses **GSAP**
    for scroll pinning, scrubbing and the SVG plugins framer-motion has no equivalent for. GSAP is
    confined to that directory — nothing else in `src/` may import it, or a ~70 KB library lands on
    all ~170 routes. *(`/about-us` was a fourth exception for a few hours on 2026-09-16; the page was
    rebuilt the same day without GSAP, so it no longer is.)*
    **Third exception (2026-09-14, user request): `(tools)/serial-diluation/_useBenchMotion.ts`**, same lazy `import("gsap")` pattern, no ScrollTrigger. **Second exception (2026-09-13, user request): `src/components/dashboard/`**,
    which loads GSAP with a dynamic `import()` after first paint (`useDashboardMotion.ts`). The landing page also loads two scoped faces via `next/font` (JetBrains Mono
    for instrument labels, Caveat for marker annotations); Outfit remains the only site-wide face.
14. **A page's bespoke CSS goes in a namespaced stylesheet next to its components**, imported by
    the page's client component (`landing.css` under `.pw-idx`), never in `globals.css`.
    `globals.css` is loaded by every route; three of its rules (`html{scroll-behavior:smooth}`,
    `ul/li` list styling, `input{background:#fff!important}`) will fight a bespoke page, so
    neutralise them inside your namespace rather than editing them.
15. **No black grounds — the theme is the blue→green brand gradient** (user rule, 2026-09-13).
    Strong surfaces use `BRAND_SURFACE` / `BRAND_BUTTON` from `src/components/page-kit/brand.ts`
    (gradient + a navy scrim that makes white text pass contrast). Ink stays a text colour.
16. **No `backdrop-filter` on anything `position: fixed`** — it re-blurs scrolling content every
    frame and was measured as the main scroll-lag source (`MEMORY.md` gotcha 51).
17. **OpenCV.js is confined to `src/components/calculators/colony/`** (2026-09-16, user choice over
    plain TypeScript). It is 10.8 MB: load it only through `colony/opencv.ts` (static asset + worker),
    never import it from anything another page loads.
18. **OpenChemLib and 3Dmol are confined to `src/components/molecular-lab/`** (2026-09-16). Both are loaded
    with dynamic `import()` (OpenChemLib inside `chem.worker.ts`, main-thread fallback in `chem-tasks.ts`);
    nothing else may import them. Chemistry that can be computed from the graph (formula, weight, valence,
    groups) is computed in `graph.ts`/`groups.ts`, never by an AI model and never by waiting for the library.

---

## 7. Current Project State

### Current Branch / Focus
- **2026-09-16:** the tree was clean at `cfda61a about us`; session `pharma-wallah-2a`'s TLC analyzer,
  colony counter, app redesign and **APK v1.3** are uncommitted on top of it (see §8).
- Branch: **`main`** (the only branch; also the PR target). Historically the working tree was **NOT clean** — a
  large body of work is staged but uncommitted (the whole `.claude/` system, `mobile/`, `android/`,
  the landing-page redesign, the header/MegaMenu, the shared calculator UI kit, and the AdSense
  scaffolding). The user committed a snapshot as `12adf1b New changes` (2026-09-13 16:46), but sessions
  kept working after it — **don't assume `git log` reflects the tree.**
- Focus: **site-wide redesign with the `top-design` skill** — a multi-session job tracked in
  **`.claude/redesign-tracker.md`** (read it first if continuing). Phase 0 is done and **waiting for
  the user to pick a direction per page family** (preview artifact linked from the tracker). No
  family may be rolled out before its direction is chosen.
- **Two Claude sessions may be working in the tree at once** (it happened on 2026-09-13) — check
  `git status` and `ListAgents` before editing a shared directory. `MEMORY.md` §8 gotcha 46.
- Typography: the site is now single-typeface (**Outfit**, variable) across web and APK.

### Recently Completed
- **Molecular Lab (2026-09-16)** — `/molecule-viewer` became `/molecular-lab` (308 redirect): draw
  molecules from scratch or open them from an 83-molecule PubChem-verified library, PubChem search or a
  file; edit atoms, bonds, charges and hydrogens with undo/redo; 2D, 3D and split views kept in sync from
  one molecule graph; formula/weight/validation, functional groups, 3D measurements, Learning and
  Experiment modes, compare, export (PNG/SVG/MOL/SDF/SMILES/JSON), My Molecules + session restore, and a
  phone layout with bottom sheets. Proteins open view-only. See the §8 entry and the `molecular-lab` skill.
- **`/about-us` rebuilt simple (2026-09-16)** — replaces the same day's GSAP roster-stage version at the
  user's request: page-kit hero, story, six "what we make" cards, and **20 team cards** in six groups
  with `Reveal` scroll animations, then (same day) leadership feature cards + **flip cards** under
  sticky group labels (no photos — added and removed at the user's request), and a 17-person roster in 4 groups
  (Leadership, Research & content creation, Year representatives, Marketing). No GSAP, no stylesheet.
- **TLC Rf Analyzer (2026-09-16)** — `/calculation-tools/rf-value-calculator` now calculates Rf from a
  photo of the plate, entirely on the device: rotate / crop / perspective, draggable baseline and
  solvent front, local spot detection with confirm/move/add/rename/delete, cm calibration, 2 or 3
  decimals, lab-record Copy/PNG/Print, saved analyses in IndexedDB. The old distance calculator is the
  second tab. See the §8 entry.
- **Offline Colony Counter & CFU Calculator (2026-09-16)** — `/calculation-tools/cfu-calculator`
  rebuilt: OpenCV.js (bundled, in a Web Worker) finds the dish and the colonies, separates touching
  ones, and the student reviews every marker (add / remove / undo / redo) before CFU/mL is calculated
  from the verified count. Replaces the Gemini photo scan; `/api/scan-colonies` is now orphaned (Known
  Issue 17).
- **Android app v1.3 published (2026-09-16)** — both camera tools, a redesigned home screen (animated
  space hero, Recent/Saved, bottom navigation, category views) and a star in every tool's app bar.
  `public/downloads/pharmawallah-calculators.apk` replaced (5.9 → 8.9 MB); `/download` updated.
  **Commit and deploy it.**
- **Android launcher icon is now the PharmaWallah mark (2026-09-14)** — it was still Capacitor's "X"
  in v1.0 and v1.1. Adaptive icon (white + mark + Android 13 monochrome layer) and legacy icons at all
  densities; Capacitor's unused placeholder splash PNGs deleted. **Not in the published APK yet** —
  needs the next release build. See the §8 entry.
- **Android app v1.1 published (2026-09-13)** — signed APK rebuilt with today's calculator migrations and
  the six new lab tools, replacing `public/downloads/pharmawallah-calculators.apk` (installs as an update
  over 1.0). **Commit it with the version bumps and deploy.** Session 9c also moved 13 more tools onto
  the kit. See the §8 entry.
- **`/encyclopedia` redesigned (2026-09-13)** — a search desk and monograph reader (top-design), and
  a rebuilt `/api/search`: correct totals and pagination across all three drug collections,
  identifier + British-name search, clamped/rate-limited/CDN-cacheable. Hero figures now counted
  (12,673 drugs, not "17.4k+"). See the §8 entry.
- **Six analytical-practical calculators (2026-09-13)** — Calibration Curve, Dissolution, Accuracy &
  % Recovery, Dialysis Membrane / Diffusion, Cumulative Drug Release (two correction methods) and
  Partition / Distribution Coefficient, each reproducing the Pharm-D practical-sheet method with a
  Recharts graph, step-by-step workings and the lab-record Copy/PNG/Print. New shared layer
  `src/components/calculators/lab-analysis/`; a calibration line hands off to the four consumer tools.
- **`/calculation-tools` rebuilt as a fast, searchable index (2026-09-13)** — server-rendered and
  readable before hydration (the old page hid all 97 cards until JS ran), a sticky search and subject
  rail with scroll-spy, a one-line "what it computes" for every tool, and 93 tools (six new lab tools
  registered). The registry moved to `tool-index.ts`. See the §8 entry.
- **Pharmacy-themed loading screen (2026-09-13)** — shared `PharmaLoader` (capsule as a measuring
  vessel + "weigh · dissolve · make up to volume"): the website's root `loading.tsx` and the Android
  app's startup splash, CSS-only.
- **Dashboard rebuilt (2026-09-13)** — chromeless app with lazy GSAP, derived figures, Read/Opened
  syllabus grid, ⌘K palette; signed-in `/` redirects to it; **unit/spotting visits were never being
  recorded (fixed)**; units gain an explicit Mark-as-read state. See the §8 entry.
- **Header app CTA, favicon, calculator disclaimer, gradient footer, Master Formula Calculator
  (2026-09-13).** A prominent "Get the app" CTA in the header (redesigned with `top-design`: solid
  brand green, the real app icon, an arrow that drops into its tray), header scroll-lag fix (no
  backdrop blur, rAF-batched handler), a proper PharmaWallah favicon set, an "educational purposes
  only" card under every calculator on web and APK, the brand gradient on the footer, header pills,
  mega-menu tile and calculator result face, and a new Dosage Form Lab tool that scales any master
  formula (98 tools).
- **Redesign Phase 0 (2026-09-13)** — inventory + tracker (106 page files, 97 calculators, 19
  measured faults F1–F19), a dependency-free **page kit** in `src/components/page-kit/` (not yet
  used by any page), and a published preview of three directions for six families.
- **Science Fair 2026 banners removed (2026-09-13)** — the landing launch strip and the site-wide
  launch dialog are unmounted (files kept); the landing hero's meta strip (counts + PKT clock) is gone.
- **Design pass with the `top-design` skill (2026-09-13).** New landing page — "The Index" played as
  a whiteboard explainer video (scroll-scrubbed marker annotations, a pen on the stroke, a
  scroll-driven timeline bar, no play button and no ads, by decision). Header, mega menu, launch
  strip, launch dialog and footer restyled to match. The shared calculator kit and shadcn
  primitives restyled — one change reaches the web *and* the APK, because the app imports
  `src/components/*` directly. Five 404 footer links fixed; a select-background bug fixed.
- **Eight laboratory tools (2026-09-13)**: Theoretical Yield (with limiting-reactant stoichiometry),
  Percentage Yield, Percentage Recovery, WBC Count, RBC Count, Density & Relative Density Bottle,
  UV-Vis Spectrum Plotter and Serial Dilution. Built on the shared kit plus a new **lab-record
  layer** (`LabReport` / `LabActions`: copy, PNG card, print) and a new **Physiology** hub category.
- **Google AdSense is wired up** — publisher ID `ca-pub-9553986083846603` set, loader live,
  `public/ads.txt` added, 7 placements across 5 surfaces including all 89 calculators via
  `src/app/(site)/calculation-tools/(tools)/layout.tsx`. The APK stays provably ad-free.
  **No ad renders yet** — the ad-unit IDs are still blank. See `.claude/ROADMAP.md` Phase 4.6.
- **Outfit is the site's single typeface** — replaces Poppins plus five other faces that
  individual pages had hard-coded. Monospace readouts are the only remaining exception.
- **Android app (Capacitor)** — an offline, calculators-only APK target. New `mobile/` Next project
  (static export of all 89 tools), `android/` native project, `scripts/generate-mobile-routes.mjs`.
- `8a59495 cology-calcs-added` — added the Animal Weight-Based Dose and Serial Dose calculators and
  substantially reworked `CalculationToolsClient.tsx` (the tool registry/hub).
- `84befff completed-clinical` / `6b475c1 new-tools-clinical` — the `clinical.*` sub-brand pages.
- `de13a36 optimized-sci-fair-tournament` / `6626383 snake-game` — tournament hardening and games.

### In Progress
- **Shared calculator UI kit migration — paused at a safe stop (2026-09-13).** `src/components/calculators/`
  holds the kit (`CalculatorShell` / `CalcSection` / `FieldGrid`, `NumberField` / `SelectField`,
  `ResultCard`, `FormulaNote`, `CalcAbout`, `AdSlot`, `ModeSwitch`, the lab-record and `lab-analysis`
  layers). **87 of 104** tool pages import it (`grep -L @/components/calculators`, measured 2026-09-16). Every tool migrated
  on 2026-09-13 was compared number-for-number with its original at commit **`5dbe98c`**. **17 remain**
  — listed in `.claude/redesign-tracker.md` Phase 2, with the procedure in
  `.claude/skills/calculator-tool/SKILL.md` ("Migrating an old tool"). Migration keeps the maths, so
  the **suspected formula faults** the agents found are still live — see the tracker's
  "Suspected maths issues" section and Known Issue 15.
- **AdSense**: plumbing done, ad-unit IDs outstanding (Phase 4.6).

### Partially Implemented
- **Course catalogue (largest gap).** `src/lib/courses/registry.ts` registers **4 subjects**, but
  `src/lib/courses/subjects/` holds **14 files** and `public/content/` holds markdown for **10+
  subjects**. Nine subject files are dead code *and use a different data shape* (`*_META` +
  `*Units` + `*_DIFF_BADGE`) than the registry's `SubjectMeta` interface. A tenth,
  `natural-toxins.ts`, *is* in `SubjectMeta` shape but is still not registered.
- **Calculation tools hub.** 104 tool directories exist; `HUB_SUBJECTS` in
  `src/app/(site)/calculation-tools/tool-index.ts` lists **93** (cross-checked slug-by-slug 2026-09-13
  after the hub rebuild). Six of the remainder are deliberately
  linked from `src/app/clinical/dose-calculators/page.tsx` instead. **Five —
  `AntagonismSimulator`, `EmaxModelCalculator`, `drug-half-life-calculator`,
  `OsmolarGapCalculator`, `OpioidConversionCalculator` — are reachable by URL but linked from
  nowhere on the web.** Every tool directory ships in the Android app, so they are reachable there.
- **Spotting.** Histology has 17 lessons (16 in `HISTOLOGY_LESSONS`; `simple-columnar-epithelium`
  is an orphan) + a test; pathology has **15** lessons (copy-pasted pages, not a template) + a test;
  powder-microscopy has only 3 lessons + a test. The `/spotting` hub prints "8 lessons" per category
  and "24+" in total, and its pathology link 404s (trailing space) — tracker F1/F2.
- **AdSense.** The loader and the `google-adsense-account` meta tag are now in `<head>` on every
  page unconditionally (the publisher ID is a hardcoded constant, env-overridable), and `ads.txt`
  is live. But every `NEXT_PUBLIC_ADSENSE_SLOT_*` is blank, so **no ad unit renders yet** — only
  Auto ads could, once the site is approved. Slot IDs must come from the AdSense dashboard, and
  should be set in **Vercel** as well as `.env` (which is gitignored). See
  `.claude/skills/adsense-monetization/SKILL.md`.

### Next Recommended
**Register the remaining course subjects.** See `.claude/ROADMAP.md` for the reasoning and the
exact steps — the content is already written and shipped in `public/content/`, so this converts
existing dead assets into working pages at the lowest risk-per-value ratio in the repo.

### Known Issues
0. **Measured UI/logic faults from redesign Phase 0 live in `.claude/redesign-tracker.md` (F1–F19)**,
   each assigned to the batch that fixes it. The ones that are *logic*, and need the user's approval:
   the dashboard reads activity capped at 20 rows and buckets days in UTC (F9/F10); sign-in ignores
   middleware's `?redirect=` (F17); the titration sim's overshoot warning is unreachable (F19). The
   dashboard's 12 course links and 2 quick links all 404 (F8).
1. **`npm run lint` is not configured.** There is no `.eslintrc*` / `eslint.config.*` anywhere, so
   `next lint` drops into its interactive "How would you like to configure ESLint?" setup prompt
   and exits without linting. **There is no working lint baseline.**
2. **`npm run build` fails without a populated `.env`.** `src/lib/supabase-server.ts` validates env
   vars at *module scope*, so Next's "Collecting page data" phase throws
   `Error: Missing environment variable: NEXT_PUBLIC_SUPABASE_URL` at `/api/admin/registrations`.
3. **`NEXT_PUBLIC_GEMINI_API_KEY` is read as a fallback** in `src/app/api/evaluate-histology/route.ts:17`.
   Any `NEXT_PUBLIC_*` value is shipped to the browser. That variable is **not** in the current
   `.env` (so nothing is leaking today), but the fallback should be deleted so it cannot be.
4. **The Supabase schema is not in the repo.** No `.sql`, no migrations directory. Tables, the
   `tournament_leaderboard_best` view, the `claim_tournament_attempt` RPC, and every RLS policy
   exist only in the Supabase dashboard. Code comments reference a `migration.sql` that is absent.
5. **`src/app/api/clinical/amr/route.ts:33` uses the browser client server-side** —
   `createClient()` (i.e. `createBrowserClient`) rather than `createServerSupabaseClient()`.
   It works because it is an anonymous read, but it is inconsistent and confusing.
6. **Edge-runtime build warning**: `@supabase/supabase-js` uses `process.version`, unsupported in
   the Edge runtime. Warning only; the one edge route (`prescription-reader-v2`) doesn't use Supabase.
7. **`caniuse-lite` is ~8 months stale** — build prints a Browserslist warning.
8. **Streaks may be permanently zero.** *(The dashboard no longer reads these columns — since
   2026-09-13 it derives the streak from `activity_log` days. The note stands for the columns.)* `progress.current_streak` / `longest_streak` are selected
   and returned by `GET /api/progress`, but **nothing in the codebase ever writes them** —
   `applyProgressEvent()` updates only `last_active_at`, `total_time_spent_min`, and `updated_at`.
   Either a Postgres trigger maintains them (the schema isn't in the repo, so this is unverified)
   or the dashboard's streak display is dead. ⚠ Verify in the Supabase dashboard.
9. No test framework and no CI. The only tests are 62 `node --test` unit tests for the TLC, colony and
   Molecular Lab modules (§1 commands). See `.claude/skills/testing-verification/SKILL.md`.
10. **`npm run build` and `npm run dev` fight over `.next`.** Running a production build while a dev
    server is up wipes dev's compiled chunks — the browser then 404s every
    `/_next/static/chunks/*.js` while `GET /` still returns 200, so the site renders as unstyled
    HTML, *and* the build fails with dozens of `Cannot find module '…/.next/server/app/…/page.js'`
    or `PageNotFoundError: /_document`. Neither symptom is a code defect. **Stop the dev server
    before building**; recover with `rm -rf .next && npm run dev`. (`npm run mobile:build` is safe
    to run alongside dev — it writes to `mobile/.next`.)

11. **The home landing page has no ad placements** (removed at the user's request, 2026-09-13), so
    `NEXT_PUBLIC_ADSENSE_SLOT_HOME_1/2/3` are now unused. Only Auto ads, if enabled in the AdSense
    dashboard, could still put an ad on `/` — keep Auto ads off if the home page must stay ad-free.
12. **Radix `NavigationMenuViewportItem` is not a `forwardRef` component**, so React 18 logs
    "Function components cannot be given refs" once per mega-menu open in development. It is a
    library-internal warning, harmless, and not fixable from this repo.
13. **Footer placeholders.** The footer's phone number (`+92 300 1234567`) looks like a placeholder
    and all four social links point at `#`. Both were carried over unchanged in the 2026-09-13
    footer redesign — they need real values from the owner. The old footer's "Weekly Updates" email
    box had **no submit handler** (typing an address did nothing); it was removed rather than
    restyled. Wire a real newsletter endpoint before bringing it back.
14. ~~Kit calculators show a double gap under the header (F16).~~ **Fixed 2026-09-13**: `CalculatorShell`
    no longer pads its top by `--calc-top-offset` (the header's in-flow spacer already clears the fixed
    header); the variable now only offsets the sticky aside. Header→title 141px → 62px at 1440.
15. **Calculator formula faults found by the 2026-09-13 hub audit** — **confirmed by the migration
    agents' before/after runs for most of these, plus ~60 more**, all listed per tool in
    `.claude/redesign-tracker.md` → "Suspected maths issues found during Phase 2". The most serious
    extra ones: `OpioidConversionCalculator` (fentanyl patch dose taken as mg → 25 = 2500 MME; no
    cross-tolerance reduction), `OpioidMMECalculator` (tramadol 0.1 and hydromorphone 4 vs CDC 2022's
    0.2/5; rotation to a patch halves the rate), `creatinine-calculator` (CKD stage from Cockcroft-Gault
    not eGFR), `drying-rate` (page freezes when initial = final moisture), `DensityConversionCalculator`
    (unit selectors do nothing), `half-life-calculator` (minutes/days double-converted),
    `osmolarity-calculators` (TPN factors per-% on g/L inputs → 10× high), `ppm-ppb-calculator`
    (mg/L→M ignores molecular weight). The hub
    audit's original list (a sub-agent read every hub tool's maths while writing its description;
    **none fixed**):
    `solubility-calculator` (unit labels off by 10–1000×); `heat-formation-calculator` (actually
    computes heat of *solution*, van't Hoff); `StrengthConversionCalculator` (w/v in g gives 10000 g/mL
    for 1%); `surface-area-particle-size-calculator` (specific surface area 1000× too high);
    `content-uniformity-calculator` (AV correct only when label claim = 100; stage 2 unreachable);
    `auc-estimator` (the "clearance" method is empty); `ed50-td50-ld50-calculator` (probit sign
    inverted, so slope/χ² are wrong; ED50 copies LD50; no TD50); `mixing-time-estimator` (mixing time
    60× too long); `sterilization-calculator` (F₀ ≥ 12 mislabelled as the 12-log botulinum cycle);
    `zone-of-inhibition-calculator` (one fixed cut-off for every drug, ignores its inputs);
    `heat-transfer-area` (unit selector does nothing); `sterile-dose-volume` (dose and concentration
    units not reconciled); stray "[citation:N]" text in the tablet dissolution plotter, sterilization
    and log-reduction pages. These pages are being migrated to the kit by another session, and
    migration keeps the maths, so the faults survive it. Fixing them is logic work: ask first.

16. **DrugBank licensing is unverified.** `/encyclopedia` shows DrugBank's full pharmacology text
    (indication, mechanism, interactions, products) on a site that runs AdSense. DrugBank's detailed
    data is, to our knowledge, licensed for non-commercial use, with commercial use needing a
    licence. Nothing in the repo records which licence the `pharmacopedia` import is under. **Owner
    decision** — check before monetising those pages.

17. **`POST /api/scan-colonies` is an orphaned, unauthenticated, un-rate-limited Gemini endpoint.**
    Since 2026-09-16 the CFU tool counts colonies on the device and nothing on the site calls it — but
    APK v1.0–1.2 already installed on phones still do. Anyone can spend the Gemini key through it.
    **Owner decision:** delete it (old apps' scan button then fails with an error message; their manual
    entry still works), or add the shared Upstash limiter until old installs are gone.

18. **The colony counter and the TLC spot detector are verified only on synthetic images.** Their
    tests use generated plates with known positions (`test-data/colony-counter/fixtures.json`,
    `tlc/sample.ts`); no real agar or TLC photo has been measured. Both tools say detection is an
    estimate and make every marker editable. Add real photos with manual counts before quoting any
    accuracy.

### Technical Debt
- **Two image stages duplicate their gesture code** (`tlc/TLCStage.tsx`, `colony/ColonyStage.tsx`:
  pinch, wheel, tap slop, padding-box pointer mapping). Extract a shared hook before a third image tool
  (MEMORY gotcha 96).
- **`NEXT_PUBLIC_API_BASE_URL` in `mobile/next.config.mjs` has no reader** since the CFU tool went
  on-device (2026-09-16); `ONLINE_ONLY_SLUGS` is empty. Keep or remove together with Known Issue 17.
- **The header still carries the PWA install prompt** (`useInstallPrompt`, the "Install App" banner
  and button in `src/components/Layout/Header/index.tsx`). `beforeinstallprompt` can no longer fire
  — the PWA and its manifest link were removed on 2026-09-12 — so all of it is dead. The Android
  CTA replaced its purpose; delete it together with the other PWA teardown files.
- **Dead since 2026-09-13:** `src/components/LaunchPopup.tsx` and `OfficialLaunchBanner` in
  `src/components/Home/tournament/index.tsx` — unmounted when Science Fair 2026 ended. Delete once
  the tree is committed, or re-mount for the next event.
- **The ADME landing page files were deleted on 2026-09-13** when "The Index" replaced it; they are
  recoverable from git at `5dbe98c` (`src/components/Home/landing/`).
- **`src/components/Home/{Hero,Companies,Courses,Features,ContactForm}/` are no longer rendered.**
  The ADME landing page replaced them on 2026-09-12; they were kept so the change is reversible.
  `ContactForm` was the home page's only entry to `POST /api/contact` (Resend) — decide whether that
  lead channel moves somewhere else before deleting it.
- **Admin allowlist duplicated in 3 files** (`src/app/api/admin/codes/route.ts`,
  `.../registrations/route.ts`, `.../registrations/approve/route.ts`), each with its own
  `const ADMIN_EMAILS = [...]`. Adding an admin means editing three files. Should be one module,
  ideally a DB role.
- **Two MongoDB clients, two databases** — `src/lib/mongodb.ts` (mongoose → `pharmawallah`) and
  `lib/mongodb.tsx` (native driver → `pharmacopedia`, with the **cluster hostname hardcoded**).
- **`src/app/api/` holds non-route data modules**: `calculators.tsx`, `data.tsx`, `semester-data.tsx`,
  `team-members.tsx`, `physiology-data.ts`, `biochemistry-data.ts`, `contex/ToasetContex.tsx`,
  `mcq-data/*.ts`. Only `semester-data`, `team-members`, and `mcq-data/*` are actually imported —
  `calculators.tsx` (419 lines), `data.tsx`, `physiology-data.ts`, `biochemistry-data.ts` are dead.
- **Dead dependencies**: `next-auth`, `next-cloudinary`, `next-mdx-remote` — zero importers.
- **Temporary PWA teardown files**: `public/sw.js` (self-destructing worker),
  `src/components/ServiceWorkerCleanup.tsx`, and the now-unreferenced `public/manifest.json`.
  Delete all three once traffic has cycled through a release or two.
- **In-memory rate limiter** in `src/app/api/comments/route.ts` (a module-scope `Map`) — resets on
  every cold start and is per-instance. Should use the Upstash limiter like everything else.
- **Module-scope env validation** in `supabase-server.ts` / `supabase-admin.ts` / root
  `lib/mongodb.tsx` is what makes the build env-dependent (Known Issue 2). Lazy-init would fix it.
- **Calculator pages are large single files** (1000–1900 lines each, `"use client"`, no shared
  layout or shared input components across 89 tools).

### Important Recent Decisions
- **Server-authoritative tournament scoring.** Answers are graded in `check-answer`, the score
  accumulates in a Redis session, and `submit-score` ignores any client-sent score. Do not
  "simplify" this.
- **`/leaderboard` was deliberately removed from `PROTECTED_PATHS`** — a public science-fair
  leaderboard must not redirect anonymous spectators to `/signin`. The reason is in the middleware
  comment; don't re-add it.
- **Tournament play pages are intentionally public** — participants authenticate with an entry
  code, not an account.
- **Drug Finder (RxNorm) and Adverse Effects (openFDA) are kept fully decoupled** end to end —
  separate routes, separate lib clients, separate Mongo models. This is stated explicitly in
  `src/lib/models/DrugFinderCache.ts`.
- **Middleware only calls Supabase when the path is protected**, to avoid a network round trip on
  every public tournament page view.

---

## 8. Work Log

> Newest first. Never paste source code here. Archive entries older than ~10 into
> `.claude/history/YYYY-MM.md`.

### 2026-09-16 — Molecule Viewer → Molecular Lab (build, edit and explore molecules in 2D and 3D)

Session `pharma-wallah-b9`, "follow protocol", user spec (62 sections).

**Completed**
- `/molecular-lab` replaces `/molecule-viewer` (permanent 308 redirect in `next.config.mjs`, query kept;
  header menu, mega-menu meta and dashboard link renamed). The old 1,034-line `MoleculeViewer.tsx` is
  removed; its features (PDB/PubChem/file import, cartoon, colour schemes, surfaces, residue labels,
  distance, screenshot) live on in the lab's **view-only 3D mode**.
- **Editor:** draw from a blank canvas (tap to place, tap an atom to grow a chain, drag between atoms),
  elements from a searchable picker (common 10 + full 118-element periodic table), bonds
  single/double/triple/aromatic/wedge/hash (tap a bond to cycle), rings 3–7 + benzene (free, spiro,
  fused), groups (OH, NH₂, COOH, CHO, NO₂, CN, OCH₃, CH₃, Cl), charge ±, hydrogens ±/automatic, delete,
  **break bond** (homolytic: hydrogens kept, reported as incomplete), move, box/multi select, clean-up
  layout, undo/redo (one step per drag), contextual toolbars, keyboard shortcuts.
- **Chemistry:** formula (Hill), molecular weight (IUPAC 2021 weights from the MW calculator's table),
  counts, charge, fragments, SMILES; valence validation (valid / incomplete / potentially invalid) with
  clickable atom issues and an Undo toast — never blocked, never auto-fixed; kekulisation of drawn
  aromatic bonds; aromaticity and 19 functional groups with short explanations and highlighting.
- **3D:** conformer generated in a Web Worker (OpenChemLib + MMFF94s+), or PubChem's own 3D record;
  kept in step with the drawing by a structure key ("Updating 3D…", optional manual "Update 3D");
  ball-and-stick / space-filling / stick / wireframe, labels, charges, selection and group highlights,
  clickable atoms **and bonds**, distance/angle/dihedral (labelled with the coordinates' source),
  rotate/zoom/center/reset/auto-rotate buttons, two-finger pinch + pan.
- **Learning Mode** (tasks generated from the molecule, checked, answer on request), **Experiment
  Mode**, **Compare** (side-by-side 2D/3D, MCS difference highlighted), **library** of 83 molecules in
  11 categories, PubChem search by name/formula/CID, PDB IDs, file import (MOL/SDF/SMILES/JSON/PDB/CIF/
  MOL2/XYZ), **export** PNG/SVG (2D), PNG (3D), MOL, 3D SDF, SMILES, project JSON, **My Molecules**
  (localStorage), autosave + "Restore previous session?", deep links `?example=`, `?smiles=&name=`, `?cid=`.
- **Responsive:** desktop three-pane + status bar; tablet one-column rail, drawer panel, icon top bar;
  phone 2D/3D tabs, bottom bar (Select · Atom · Bond · Delete · More), bottom sheets, 44 px touch
  targets on coarse pointers. Dark-mode tokens (navy, §6 rule 15).

**Files**
- New `src/components/molecular-lab/` (24 files — see PROJECT_MAP), `src/app/(site)/molecular-lab/page.tsx`
  (server page with metadata). Deleted `src/app/(site)/molecule-viewer/page.tsx`, `src/components/MoleculeViewer.tsx`.
- New `scripts/molecular-lab.test.mts`, `scripts/build-molecule-library.mts`, `scripts/lib/ts-resolve.mjs`.
- `next.config.mjs` (redirect), `package.json` / `pnpm-lock.yaml` (`openchemlib@9.25.0`),
  `Header/Navigation/{menuData,menuMeta}.tsx`, `dashboard/dashboard-data.ts`.
- Knowledge: this file (§1, §6 rule 18, §7, §9), `.claude/{MEMORY (gotchas 98–105, testing), PROJECT_MAP,
  ROADMAP, SKILLS}.md`, new skill `molecular-lab`, `testing-verification` skill.

**Architecture & Decisions**
- **One molecule graph** (`graph.ts`) is the only copy of the structure; 2D, 3D, panels and history all
  derive from it. 3D coordinates are not stored on atoms but on a conformer tagged with the structure
  key it was generated for.
- **OpenChemLib** chosen by the user over RDKit.js / hand-written (it is the only single library here
  that also generates 3D coordinates). It runs in a worker; formula, weight, valence and groups are the
  lab's own deterministic code so the panel never waits for 1 MB of JS. **3Dmol** kept (it was the
  existing renderer) but now bundled from npm instead of loaded from 3dmol.org.
- Own V2000 reader/writer so a PubChem 3D record's coordinates map back to graph atoms.
- **No server route**: PubChem and RCSB are called from the browser, as the old viewer did.
- **Library is generated, never typed**: identity/formula/weight/SMILES from PubChem, drug classes only
  from PubChem's MeSH Pharmacological Classification (drug list only), structural categories from the
  lab's rules; the generator refuses to write if the lab disagrees with PubChem. Tetracycline and
  atropine have no MeSH class on their records and sit in "Other" (gotcha 105).
- Brand colours are the site's tokens (#1C7BD9 → #21B67A), not the spec's #2563EB/#4ADE80 — the spec
  also says to follow the existing identity.
- Pharmacological classes are shown in their own card, sourced, and hidden once the structure changes.
- Not done, by decision: cloud save (needs a Supabase table), AI tutor (spec'd as optional/later),
  progress tracking.

**Verification**
- `npx tsc --noEmit` → **0 errors**.
- `node --test scripts/molecular-lab.test.mts` → **21 pass, 0 fail** (real OpenChemLib): drawing C/O/N,
  C–C/C=C/C≡C, delete/break, charge and valence flags, undo/redo of every operation, kekulisation,
  aromaticity **identical to OpenChemLib on all 83 library molecules**, every library formula/weight =
  PubChem and SMILES + MOL round trips, stereo kept through layout/SMILES/3D, conformer mapping and bond
  lengths (C–O 1.38–1.46 Å, H–O–H 100–110°), radicals in 3D, SDF import, bad input, learning tasks.
  The TLC/colony files were not re-run (untouched).
- `npm run build` in an **isolated copy** of the tree (the dev server on :3000 was not this session's
  and was left running) → **exit 0**; `/molecular-lab` 59.5 kB / **148 kB first load**; shared JS
  88.4 kB; OpenChemLib, `resources.<hash>.json` (1.35 MB) and 3Dmol (578 KB) in lazy chunks only.
- Headless Chrome (CDP), dev **and** `next start`: desktop 1440×900 **44/44** (empty state, aspirin,
  split view, atom/bond selection + context bar, charge + undo/redo, triple bond → warning → toast
  undo, groups + highlight, PubChem MeSH card, 3D distance by clicking atoms, learning correct/wrong/
  reveal, all six exports downloaded and parsed, save, blank canvas → CH₄ → C₂H₆ → C₂H₄ → C₂H₂, drag
  to draw C–O, drag-move, Delete key, 12× undo / 7× redo, element search, 118-element table, PubChem
  "metoprolol", PDB 1CRN view-only, reload → restore, dark mode, 308 redirect); phones 360/390/412
  **23/23 each** (no overflow, bottom bar, element sheet, tap to build, bond cycling, context bar,
  delete, undo, search, 3D tab, two-finger pinch without page scroll, More sheet, learning, info
  sheet); tablet 768×1024 **9/9**; **0 console errors**. Worker and `window.Worker = undefined` fallback
  both render 3D in production. Screenshots read (they caught a cropped 3D fit, truncated rail labels,
  a tablet top bar overflow, a drawer covering the canvas, bond taps read as atom taps, duplicated
  measurements — all fixed).
- **NOT verified:** a real phone or tablet, iOS Safari, a real mouse/trackpad feel, screen readers,
  large-molecule performance on a low-end device, the print/share paths, `npm run mobile:build` (the
  lab is not in the APK). No test framework; lint is not configured.

**Remaining**
- Commit (not done — the protocol forbids it; note the new files were already **staged by someone
  else** during the session).
- "Open in Molecular Lab" link from `/encyclopedia` monographs (the lab already accepts `?smiles=`).
- Cloud save and progress tracking — owner decisions.

**Next**
- Try the lab on a real phone (drawing, pinch, bottom sheets), then add the encyclopedia link.

---

### 2026-09-16 — `/about-us` roster edits, flip cards, team photos (top-design pass)

Session `pharma-wallah-46`, follow-up requests on the page below.

**Completed**
- Roster (user): removed the Content strategy group and its three members (Abdul Wahab, Jalal bin
  Junaid, Jazil bin Kashef) and Romana Abbbas; merged "Design & outreach" + "Digital marketing
  ambassadors" into one **Marketing** group; added **Kashef Latif** (Research & Content Creator).
  Team is now **18** in 4 groups (Saman Hamza added later, Research & Content Creator).
- Photos: seven user-supplied photos/captioned stickers were added and then **all removed at the
  user's request** the same session — every card shows its monogram again. The `photo` /
  `photoStyle` support in `team.ts` and `_Plate.tsx` is kept for when real portraits exist.
- Layout (top-design): leadership as two large feature cards (description visible, gradient hairline
  on hover); every other group is a sticky numbered label column beside a grid of **flip cards** —
  front: 72 px monogram plate, `NN.NN` code, name, role; back: brand surface with the role description.
  Turns on hover (hover-capable devices only), keyboard `:focus-visible`, or tap (touch).

**Files**
- `src/lib/team.ts` (roster, `photo` + `photoStyle` on `RosterEntry`/`TeamMember`, groups);
  `src/app/(site)/about-us/page.tsx` (Team section, `LeadCard`); new `FlipCard.tsx` (client),
  `_Plate.tsx`. No image files remain (`public/images/team/` deleted).

**Verification**
- `npx tsc --noEmit` → 0 errors. CDP against the user's dev server (:3000), 1440 and 390: no overflow;
  17 cards; 4 groups in order; 0 images after the removal; none left hidden after scrolling; keyboard focus
  flips a card (`matrix3d(-1…)`) and blur turns it back; tap flips and a second tap unflips; 0 console
  errors. Screenshots read. **Headless Chrome reports `hover: none`** (even with media emulation), so
  mouse-hover flipping was verified only by reading the generated CSS rule, not by a hover.
- **NOT run:** `npm run build` — the user's `next dev` was running on :3000 (Known Issue 10).

### 2026-09-16 — `/about-us` rebuilt again: simple cards + scroll reveals; four new team members

Session `pharma-wallah-46`.

**Completed**
- User: "make me new about us page, smooth simple page with scroll animations — current one is bad —
  cards with description, no photo", plus four people in two groups. The GSAP roster-stage page (entry
  below) is **replaced**: `PageHero` (display) with derived figures (20 team · 93 calculators · 22
  units), an "Our story" split, six "What we make" link cards, **the team as cards grouped by role**
  (monogram plate, name, role, a one-line description of what the role does), and a brand-surface
  closing card (Contact / Work with us). Cards and headings lift in with the page kit's `Reveal`
  (staggered 0/70/140 ms per row); cards lift on hover.
- **New members** in `src/lib/team.ts`: Kinza Zafar, Farwah Perwaiz → role "Digital Marketing
  Ambassador", new group **Digital marketing ambassadors**; Syeda Khoula, Neha Shah → role "Research &
  Content Creator", filed in the existing research group, relabelled **Research & content creation**.
  Team is now 20.

**Files**
- `src/app/(site)/about-us/page.tsx` — rewritten (server component, Tailwind + page kit only).
- Deleted: `about.css`, `RosterStage.tsx`, `TeamRegister.tsx`, `AboutMotion.tsx`, `_useAboutMotion.ts`
  (recoverable from `cfda61a`).
- `src/lib/team.ts` — four roster lines, `marketing` group, two role mappings, `ROLE_NOTE` →
  `TeamMember.description`; removed `TEAM_CAMPUS_COUNT` and `TEAM_ROLES` (only the old page read them).
- Knowledge: this file (§6 rule 13, §7, §9, archive), `.claude/MEMORY.md` (85, 86, new 97),
  `.claude/PROJECT_MAP.md`, `.claude/redesign-tracker.md`, `.claude/history/2026-09.md`.

**Architecture & Decisions**
- **Descriptions describe the role, not the person** — there are no verified bios; per-person copy
  would be invented. A role without a `ROLE_NOTE` falls back to its group blurb, so no card is blank.
- **Campuses are no longer printed.** The roster's default ("University of Karachi") was never in the
  original team data, and nobody gave one for the four new members, so the page states nothing about it.
- **No GSAP → §6 rule 13's fourth exception is gone.** Motion is `Reveal` (IntersectionObserver + CSS
  transition): everything is visible in the server HTML, only below-fold blocks animate, reduced motion
  shows everything at once.
- Group order: Leadership, Content strategy, Research & content creation, Year representatives,
  Design & outreach, Digital marketing ambassadors.

**Verification**
- `npx tsc --noEmit` → 0 errors. `npm run build` (dev stopped) → exit 0; `/about-us` **773 B / 106 kB**
  first load (was 5.37 kB / 111 kB); shared JS 88.3 kB unchanged.
- Headless Chrome/CDP on `next dev`, 1440×900, 390×844 and 390 reduced motion — **20/20 checks pass**:
  no horizontal overflow; 20 cards, each with a description; six group headings in order; no list
  bullets (gotcha 30b); 35 below-fold blocks hidden at load and 0 left after scrolling; 0 hidden under
  reduced motion; JavaScript disabled → 20 cards, none hidden; 0 console errors.
  Screenshots read: hero, story, pillars, leadership, research, marketing (both widths), closing.
- Caught by screenshot and fixed: group blurbs rendered full ink — `/58` and `/62` are off Tailwind's
  opacity scale and generate no class (gotcha 97).
- **NOT verified:** a real device; dark mode (no reachable toggle, F13). No tests cover it; lint is not
  configured.

**Remaining**
- `PageHero`'s lead uses `text-[#16181d]/62`, which generates nothing — every kit hero lead renders
  full ink instead of muted. One-token fix in the shared kit; not changed here (affects every kit page).
- Still open from the previous version: "Romana Abbbas" spelling; real campuses per member.
- `package.json` / `pnpm-lock.yaml` gained `openchemlib@9.25.0` (unstaged, 17:10) — **not this
  session**; left untouched.

**Next**
- Change `PageHero`'s `/62` to `/60` and re-screenshot the kit pages.

### 2026-09-16 — TLC Rf Analyzer; offline Colony Counter (OpenCV.js); Android app redesign; APK v1.3

Session `pharma-wallah-2a`. Three user requests, "follow protocol", built in this order.

**Completed**
- **TLC Rf Analyzer** (`/calculation-tools/rf-value-calculator`, user spec). A student photographs
  (or uploads) a plate and gets every Rf on the device: rotate 90° / straighten, crop, perspective
  correction (Find plate places the four corners automatically when it can), tap-to-place draggable
  baseline and solvent front, local spot detection (sensitivity, dark/light/either) with detected
  spots unconfirmed until the student confirms them, add/move/rename/delete spots, pinch/scroll zoom
  and pan, keyboard nudging, measurement overlay (run and per-spot distances), results in px with
  optional cm calibration, 2/3 decimals, warnings for spots past the front or below the baseline
  (value shown, never hidden), lab-record Copy/PNG/Print, annotated-plate PNG, saved analyses and
  "Clear local data" in IndexedDB/localStorage, a synthetic sample plate. "Enter distances" is the
  original calculator, unchanged, in a lazy second tab.
- **The pure layer was already written** by session `pharma-wallah-d0` (2026-09-14:
  `src/components/calculators/tlc/{rf,geometry,spots,plate,sample,storage,canvas,detection}.ts`, the
  worker and `scripts/tlc-rf.test.mts`) but never wired to a page. It was kept as found; this session
  added the UI (`TLCAnalyzer`, `TLCStage`, `TLCUploader`, `TLCResults`, `report.ts`).
- **Offline Colony Counter & CFU Calculator** (`/calculation-tools/cfu-calculator`, user spec). The
  user chose **bundled OpenCV.js** over plain TypeScript when asked (10.8 MB). Pipeline: Hough plate
  detection with a contour fallback and a rim mask; Lab colour background correction; Otsu (on plate
  pixels) or adaptive threshold with a noise floor; opening/closing; distance transform → lobes →
  watershed flooding, only where a region clearly has two lobes; area, circularity, aspect and rim
  filters; quality, density and countability warnings. Review: Pan vs Add modes, tap to select,
  Remove, Undo/Redo (also ⌘Z / Delete), manual plate circle, Reset with confirmation, advanced
  settings with an explicit Reanalyze. Count panel (auto / added / removed / final). CFU/mL =
  colonies ÷ (dilution × volume) with 10⁻¹…10⁻⁷ and volume presets, custom inputs (`1e-4`, `10^-4`,
  `1/10000`; a dilution *factor* is rejected with guidance), scientific + plain results, calculation
  details. Annotated PNG and text result (web), Copy (both). Manual count entry without an image.
  Developer validation panel at `?validate=1` (precision/recall/F1 against known positions, error
  against an expected count, and metrics from the student's corrections). Replaces the Gemini scan.
- **Android app home redesigned** (user request mid-task: "simple, professional, easy to navigate,
  lots of animations, floating space stuff"). See Architecture.
- **APK v1.3** built and published; `/download` updated (version, size, a camera-tools highlight, a
  count that was a stale "97", and the now-false "CFU photo scan needs a connection" line).
- The user's running dev server was stopped at their request at the start of the session.

**Files**
- `src/app/(site)/calculation-tools/(tools)/rf-value-calculator/{page,_DistanceMode}.tsx`.
- `src/components/calculators/tlc/{TLCAnalyzer,TLCStage,TLCUploader,TLCResults}.tsx`, `report.ts` (new).
- `src/app/(site)/calculation-tools/(tools)/cfu-calculator/page.tsx` (rewritten, 673 → 125 lines).
- `src/components/calculators/colony/` (new): `types, cfu, detect, opencv, client, sample, validation,
  export`.ts, `colony.worker.ts`, `ColonyCounter.tsx`, `ColonyStage.tsx`.
- `scripts/colony-counter.test.mts`, `test-data/colony-counter/{fixtures.json,README.md}` (new).
- `src/components/ui/tabs.tsx` — `TabsContent forceMount` (additive).
- `src/app/(site)/calculation-tools/tool-index.ts` — two names/descriptions.
- `mobile/app/_components/{ToolHub,MobileShell}.tsx` (rewritten), `{SpaceHero,BottomNav,parts}.tsx`,
  `useLibrary.ts`, `mobile/app/_data/catalogue.ts` (new); `mobile/app/_data/tool-registry.ts` (names,
  `ONLINE_ONLY_SLUGS` emptied); `mobile/app/globals.css` (motion).
- `package.json` / `pnpm-lock.yaml` — `@techstark/opencv-js@4.12.0-release.1`.
- `android/app/build.gradle` (versionCode 4 / 1.3), `src/app/(site)/download/DownloadClient.tsx`,
  `public/downloads/pharmawallah-calculators.apk`.
- Knowledge: this file (§1, §6 rule 17, §7, §9, archive), `.claude/MEMORY.md` (testing section,
  gotchas 87–96), `.claude/PROJECT_MAP.md`, `.claude/ROADMAP.md` (Android section corrected — it
  still said "APK never compiled"), `.claude/redesign-tracker.md` (rows 57/67; 17 left, measured),
  skills `calculator-tool` (5b image tools), `android-app-capacitor`, `testing-verification`;
  `.claude/history/2026-09.md`.

**Architecture & Decisions**
- **No image leaves the device, no CDN, no API.** OpenCV.js is a webpack static asset
  (`new URL(…, import.meta.url)`), loaded with `importScripts` in a worker, with a `<script>`
  main-thread fallback — the page itself never loads it when the worker works. Only this tool loads
  it (§6 rule 17). Measured at 6× CPU throttle: worker 1.5–2.0 s including OpenCV start; main-thread
  fallback 6.6 s (dev) / 10.8 s (prod).
- **`cv.watershed` is not used for the split**: it floods on local colour differences and let lobes
  swallow each other; the flood runs on the distance map in `detect.ts` (MEMORY gotcha 88). OpenCV
  Mat views are copied after allocations (gotcha 87) — the "supplied plate" path found 0 colonies
  until that fix.
- **The final verified count is the only CFU input**; automatic detection is a starting point. No
  confidence score is shown for classical CV. The old page's water/food/urine "acceptable" bands and
  its dilution chart were dropped — no stated source, and the chart was wrong (tracker note).
- **App home**: no app bar on `/` — an animated brand-gradient "space" hero (navy scrim, not black —
  §6 rule 15) holds the greeting and search; Recent, the two camera tools, colour-coded subject tiles,
  common starting points and Saved below; a fixed opaque bottom bar (Home / Browse / Saved); category
  lists with one-line descriptions borrowed from the web registry; views in the URL hash so Android
  back works. Motion is CSS transform/opacity only, paused when the hero is off screen, off under
  reduced motion. Tool pages keep an app bar with a star; opening a tool records it in Recent. Both
  lists live only in localStorage.
- **`/api/scan-colonies` left in place** — APK v1.0–1.2 on phones still call it. Known Issue 17.
- The two stages duplicate their gesture code (gotcha 96) — recorded as debt, not refactored.

**Verification**
- `npx tsc --noEmit` → 0 errors; `npx tsc --noEmit -p mobile/tsconfig.json` → 0 errors.
- `node --test scripts/tlc-rf.test.mts scripts/colony-counter.test.mts` → **41 pass, 0 fail**,
  including CFU (89 / 10⁻⁴ / 0.1 mL → 8,900,000 = 8.9 × 10⁶; 50 / 10⁻³ / 1 mL → 50,000; float dust),
  parsing, warnings, metrics, and the real OpenCV detector on five synthetic plates (30–250 colonies,
  light and dark agar): precision 1.00, recall 0.93–0.99, plate found, label and rim ignored.
- `npm run build` → exit 0 (§9). `npm run mobile:build` → exit 0 (§9). `npm run mobile:apk` → exit 0;
  `aapt` versionCode 4 / 1.3; `apksigner` V2, certificate identical to v1.2; published file identical to
  the build output; opencv and both tool pages inside the APK. Secret scan: one false positive (gotcha
  90), no real secret; 0 ad strings; nothing references `scan-colonies`.
- Headless Chrome (CDP), driving the real file inputs with generated PNGs:
  - **TLC**, 390×844 touch and 1440×900 mouse, dev and `next start`: 37–38 checks each, 0 fail — taps
    land within 0.5 px of the intended image y; detection finds all 4 spots and Rf = 0.30/0.30/0.68/0.68,
    the drawn truth; Rf unchanged after pinch/zoom; drag → 0.50; beyond-front warning with value;
    calibration 6 cm; rename; delete; front-below-baseline error; keyboard nudge; save → reopen;
    Find plate + perspective (549×1055 from a 560×1080 plate) + undo; rotate; crop; non-image
    rejected; tab switch keeps state; no overflow; 0 console errors.
  - **Colony counter**, 390 and 1440, dev and prod, worker and `window.Worker = undefined`, light and
    dark fixtures: 31 checks each, 0 fail — spec copy, manual CFU, preview never auto-analyses,
    progress steps 1–3 seen at 6× throttle, 59/60 markers, select → Remove → count −1, Add → Manual #1,
    panning in Add mode adds nothing, undo/redo, pinch, CFU follows the verified count, reanalyze,
    reset confirmation, manual plate, save result, no overflow, 0 console errors. Validation panel:
    P 100%, R 98.3%, F1 99.2% on the light fixture.
  - **APK export served locally with every non-local request failed** (airplane mode): TLC 37/37,
    colony 31/31 (OpenCV in the worker), app home 24/24 (hero, search `c1v1`, category via hash,
    star → Saved badge, back button, Browse lists 104, tool app bar sticks, star toggles, Recent,
    Saved view, 0 external requests), and reduced motion stops the animations.
  - Screenshots read: TLC stage (caught label collisions, a run pill over lane 1, a 1 px border
    offset — fixed), colony review and 400% zoom, app home/search/category/browse/tool/saved (caught
    a glyph behind the "Works offline" badge — fixed).
- **NOT verified:** a real Android phone (install over v1.2, camera capture, performance, memory with
  a 12 MP photo); real TLC or agar photographs (only synthetic ones); iOS; print dialog; dark mode.
  No test framework; lint is not configured.
- **Collateral:** the user restarted `npm run dev` at 16:29 and this session's production build at
  ~16:48 broke its chunks (all `/_next/static/chunks/*` 404). Not restarted by this session — recover
  with `rm -rf .next && npm run dev` (gotcha 93).

**Remaining**
- **Commit and deploy** (APK, lockfile and all of the above) — not committed, as the protocol requires.
- Install v1.3 on a phone and try both camera tools with real plates.
- Owner decision on `/api/scan-colonies` (Known Issue 17).
- Real-photo fixtures for both detectors (Known Issue 18).

**Next**
- Photograph a few real TLC and agar plates, count them by hand, and add them to the fixtures.

---

### 2026-09-16 — `/about-us` rebuilt: a roster intro screen, GSAP scroll choreography, the full team

Session `pharma-wallah-78`. **Superseded the same day** by the simple card page above — the files
named here are deleted (recoverable from `cfda61a`).

**Completed**
- **`/about-us` rebuilt from scratch** (user: "make me a new about page where all the team members are
  there… award type", then "make it more like an intro screen — have you seen the RE6 loading screen",
  then "use proper scroll animations and gsap heavy page"). The page now opens on a **roster select
  screen**: brand-navy stage, letterbox rails, grain/scanlines/vignette/beam, one member lit at
  portrait scale with a HUD (entry code, group, role, campus), a full-bleed filmstrip of all 16, and a
  dwell timer. It plays itself until the first interaction, then is driven by pointer, click or
  ← → / Home / End with roving tabindex.
- **All 16 team members are on the page twice**: on the stage, and in the **register** below — a
  typeset ruled list (index code, monogram plate, name at display size, role, table-of-contents leader,
  campus) grouped into five role groups with a filter that renumbers 01…n. Rows are not links, because
  there is nothing to link to; the old page faked it with **48 dead social buttons with no accessible
  name**, all removed.
- **GSAP scroll choreography** (`_useAboutMotion.ts`, 8 pieces): the stage recedes on scrub; figures
  count up; the role band's conveyor follows scroll velocity and direction; **the origin quote is read
  out a word at a time, scrubbed to scroll**; the pillar index and the register deal in, batched; the
  closing wordmark and grid parallax; a fixed chapter rail whose fill tracks the page and whose ticks
  light per chapter.
- **The page had no metadata at all** (it was `"use client"`, so it could not export any) — it now has
  a title, description and canonical.
- **Fabricated figures removed.** The old stats strip claimed "120+ study resources, 30+ course
  modules, 4k+ students reached"; none was measured and none is derivable. Replaced by three figures
  imported from the registries: 16 team (`TEAM.length`), 93 calculators (`HUB_TOOL_COUNT`), 22 units
  (summed from `SUBJECTS`). Counts that cannot be derived are written in words.

**Files**
- New `src/lib/team.ts` — the roster, **moved out of `src/app/api/team-members.tsx`** (deleted; it was
  a data module in the route tree, MEMORY gotcha 6, and the about page was its only importer). Group,
  monogram, per-person gradient angle, id, campus count and role list are all derived from one
  `ROSTER` array.
- New under `src/app/(site)/about-us/`: `about.css` (namespaced `.pw-about`), `RosterStage.tsx`,
  `TeamRegister.tsx`, `AboutMotion.tsx`, `_useAboutMotion.ts`. `page.tsx` rewritten as a **server
  component**.
- `CLAUDE.md` §6 rule 13 — GSAP's fourth documented exception.

**Architecture & Decisions**
- **The stage is the brand gradient under an 88%/74% navy scrim, not black.** The user's no-black-grounds
  rule (§6 rule 15) and a cinematic select screen are in tension; the heavier scrim is how both are kept.
  If the user wants true black, that is a rule change and their call.
- **The closing band uses the same stage ground, not `BRAND_SURFACE`** — the site footer below is
  already a brand gradient at that weight and the two ran together into one wash. The page now bookends
  dark → bright → dark.
- **No photographs.** `teamMembers.imgSrc` pointed at three stock portraits shared between sixteen
  people; the field was dropped, monograms are derived from names. Add a `photo` field to `ROSTER` when
  real portraits exist.
- **Groups replace the old Production/Marketing split**, which filed the founder with the research
  collectors. Mapping is role → group, with an unmapped role falling into a "Team" bucket that only
  renders when it has members, so a new role can never make someone disappear.
- Role typos fixed in the roster copy: "Collecter" → "Collector"; "third/second year representative" →
  title case; "Jazil bin kashef" → "Jazil bin Kashef" (matching "Jalal bin Junaid").

**Verification**
- `npx tsc --noEmit` → **0 errors**.
- `npm run build` (dev server stopped, `.next` cleared) → **exit 0**, 251 routes. `/about-us` is
  **5.37 kB / 111 kB first load** — lighter than `/calculation-tools` (118 kB), `/courses` (145 kB) and
  `/spotting` (141 kB). **Shared JS still 88 kB**, and `grep gsap` over both shared chunks returns
  **0** — GSAP lives in its own 52 K + 44 K lazy chunks, so rule 13's concern does not apply.
- Headless Chrome/CDP, **33 assertions, all passing**, at 1440×900 and 390×844, full motion and
  reduced motion: no horizontal overflow at either width; 16 rows and 16 tiles; stage auto-advances
  (Entry 01 → 02) and stops on choice; tile 12 selects Syed Tanzeel Ali; one `aria-selected`; ArrowRight
  → Entry 13; roving tabindex = 1; the stage link jumps to a row and focuses it; **the quote scrubs
  word-by-word (last word 0.14 → 1)**; the chapter rail switches on past the stage and off before the
  footer; pillar and register rows all settle visible; filter → 6 rows renumbered 01–06 with nothing
  left hidden; **0 console errors or exceptions in every run**.
- Reduced motion: every CSS animation off, quote fully inked, no auto-advance, rail hidden, **nothing
  left invisible**.
- **JavaScript disabled**: every team name and the quote are in the server HTML.
- Screenshots read at both widths for the stage, figures, origin, pillars, register and closing band.
- **A regression got through and the user caught it**: swapping the hero CSS band for the stage deleted
  the figure-strip rules that lived inside it, and the figures rendered as a column of loose text.
  `tsc`, the build, 29 behavioural assertions and three screenshots all passed, because none of them
  photographed that strip or asserted its geometry. Fixed, and two guards added: a class-name diff
  between the TSX and the stylesheet (it now reports **0 missing, 0 dead**), and an assertion on the
  strip's `display`, column count and shared top edge. MEMORY gotcha 82.
- **NOT verified:** a real device or a real mobile browser; dark mode (the site still has no reachable
  toggle, tracker F13); Lighthouse or real-network timing; scroll feel on a low-end phone. No tests
  exist; lint is not configured.

**Remaining**
- The footer's placeholder phone number and `#` social links still stand (Known Issue 13) — the new
  page deliberately adds no social links rather than repeating them.
- `/mentor` and `/careers` are still the old framer-motion pages; `/about-us` now links to `/careers`.
- The founding year is not recorded anywhere in the repo, so the page does not state one.

**Next**
- Ask the user whether "Romana Abbbas" is the correct spelling, and whether real team photographs exist.
- Decide whether the stage may go darker than the 88% navy scrim: a true black ground would read more
  like the reference the user gave, but it would break §6 rule 15, which is their own rule.

### 2026-09-14 — Android launcher icon replaced with the PharmaWallah mark

Session `pharma-wallah-5d`.

**Completed**
- The user reported the app "is currently using capacitor icon" — confirmed: every
  `mipmap-*/ic_launcher*.png` was Capacitor's blue "X" on a grid, and `cap sync` never replaces them.
  Now the PharmaWallah mark (capsule over open book) on white: adaptive foreground at 5 densities,
  a **monochrome** layer (Android 13 themed icons, new), legacy square and round icons for API 24–25.
- Deleted Capacitor's unreferenced placeholders: 11 `drawable*/splash.png` (the "X" splash, unused since
  the launch theme moved to `launch_screen.xml`), `drawable-v24/ic_launcher_foreground.xml` and
  `drawable/ic_launcher_background.xml` (nothing references them; the adaptive icon uses the mipmap
  PNG and `@color/ic_launcher_background`). No splash-screen plugin is installed.
- The Android 12+ system splash and `launch_screen.xml` draw `@mipmap/ic_launcher`, so they show the
  new mark without changes.

**Files**
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher{,_round}.xml` — `<monochrome>` added.
- `android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}/ic_launcher{,_round,_foreground}.png`
  replaced; `ic_launcher_monochrome.png` new.
- Deleted the 13 placeholder drawables above (staged with `git rm`).
- Knowledge: `.claude/MEMORY.md` gotcha 80, `.claude/skills/android-app-capacitor/SKILL.md` ("Launcher
  icon"), `.claude/ROADMAP.md`.

**Architecture & Decisions**
- **White ground, not the brand gradient**: the mark is blue + green, and it matches the "real app
  icon on a white tile" already used by the header CTA and `/download`.
- Source is `public/icons/icon-1.png` (largest copy of the mark), un-matted to alpha; sized by the
  farthest opaque pixel (30 dp of the 33 dp safe radius), because the book's corners — not its width —
  are what a circular mask clips. The generator was a throwaway script; the method and constants
  are in the skill.
- **No version bump and no release APK**: `mobile:build` snapshots the tree, and peers `pharma-wallah-4b`
  (Serial Dose) and `-d0` (Rf value / TLC) are rewriting tools that ship in the app.

**Verification**
- All `res/**/*.xml` and the manifest parse.
- `./gradlew assembleDebug` (JDK 21, existing synced assets) → **exit 0**. `aapt dump badging` →
  `application-icon-*: res/mipmap-anydpi-v26/ic_launcher.xml`; resource table has `ic_launcher`,
  `_round`, `_foreground`, `_monochrome` and no `drawable/splash`. The packaged PNGs were unzipped and
  looked at on brandBlue at mdpi/xhdpi/xxxhdpi; the foreground was checked under circle, rounded-square
  and squircle masks and the monochrome layer under a tint — nothing clipped.
- **NOT verified:** the icon on a real launcher or emulator (no device); `npx tsc --noEmit` / web build
  (no TypeScript or web file changed). No tests exist; lint is not configured.

**Remaining**
- **Build and publish the next APK** (bump to `versionCode 3` / `1.2`, `DownloadClient.tsx`) once peers
  report a safe point — until then phones keep the Capacitor icon.

**Next**
- `npm run mobile:apk` after 4b and d0 finish, then install over v1.1 on a phone to see the icon.

### 2026-09-14 — Serial Dose calculator (`serial-diluation`) redesigned: kit + shadcn + lazy GSAP bench rack

Session `pharma-wallah-4b`.

**Completed**
- `/calculation-tools/serial-diluation` (hub: Pharmacology → "Serial Dose Calculator") rebuilt with top-design on the
  calculator kit and shadcn primitives: result first (dose in the syringe, ±5% tone), three figures, inputs with
  worked-example chips, a **bench rack** (stock beaker → tubes → syringe; liquid height = volume, colour depth =
  log concentration), an editable step list, Copy/PNG/Print record (`LabActions`) plus the kept bench-sheet PDF,
  Working, FAQ, CalcAbout + AdSlot. Emoji, the 800-line inline CSS and the print-only sheet are gone.
- GSAP (dynamic import, this route only): a drop travels each transfer into the next tube, the syringe draws up,
  the rack scrolls to follow on phones; runs on first view, ~0.5 s after the plan changes, and on Replay. Off under
  reduced motion; nothing hidden before hydration.
- Now stated on screen (numbers unchanged): the six-tube auto-plan cap and its shortfall, and "empty or 0 aliquot uses 1 mL".

**Files**
- `src/app/(site)/calculation-tools/(tools)/serial-diluation/` — `page.tsx` (rewritten); new `_math.ts` (maths copied
  verbatim), `_report.ts`, `_pdf.ts`, `_BenchRack.tsx`, `_useBenchMotion.ts`.

**Architecture & Decisions**
- Maths untouched. Render-level fixes: tube inputs bind to the typed value (clearing no longer snaps to 0); PDF
  writes "C0" (Helvetica had no subscript glyph) and drops the CDN fallback (jsPDF is installed); PDF button hidden in
  the APK like the kit's Download card. Copy now uses the kit's record text instead of the old custom text.

**Verification**
- Before numbers from the live original (HEAD = `5dbe98c` for this file), 16 cases (4 presets, aliquot 0/empty/0.5,
  stock too dilute, 6-tube cap, invalid, 1:1, odd factors, edit/add/remove tube, edits surviving an input change):
  **359/359 displayed values identical** after the rewrite.
- Headless Chrome 1440×900 and 390×844, reduced and full motion: 0 exceptions, `scrollWidth` = viewport, no NaN;
  screenshots read. Motion sampled (arcs draw in sequence, drop moves, phone rack scrolls 0 → 224 px, replay after an
  edit, added row slides in). Copy → full record; PDF → 10.8 KB `application/pdf`.
- `npx tsc --noEmit` → 0 errors in this tool (the only source errors are in another session's in-progress
  `src/components/calculators/tlc/spots.ts`).
- **NOT verified:** `npm run build`, `npm run mobile:build` / the APK (left to `pharma-wallah-5d`'s v1.2 build), print dialog, real device.

**Remaining**
- Maths quirks recorded in the tracker (R7), not fixed.

### 2026-09-13 — Android app v1.1 published; 13 more calculators on the kit (9c's share of Phase 2)

Session `pharma-wallah-4d`, renamed `pharma-wallah-9c` after the machine reboot mid-task.

**Completed**
- **Signed APK v1.1 built and published** at the user's request ("make a new apk build and update it
  with the current one so that i can deploy it"): `public/downloads/pharmawallah-calculators.apk`
  replaced (v1.0, 5,086,898 B → v1.1, 5,922,832 B). It carries every calculator migrated today (85 of
  104 on the kit) and the six new lab tools. Same signing certificate as v1.0, so it installs as an
  update over the existing app. `/download` now says Version 1.1 · 5.6 MB.
- **13 calculators migrated onto `@/components/calculators`** under the agreement with
  `pharma-wallah-3d` (its entry below describes the method): `pH-pka-relationship-calculator`,
  `molarity-calculator`, `combined-pka-suite`, `OsmolarGapCalculator`,
  `drug-excipient-compatibility-predictor`, `tablet-disintegration-dissolution-profile-plotter`,
  `sterile-dose-volume`, `percentage-solution-calculator`, `normality-calculator`,
  `ppm-ppb-calculator`, `molecular-weight-finder`, `surface-area-particle-size-calculator`,
  `osmolarity-calculators`. Result first, live results, labelled units/hints/errors, example chips,
  a Working section, formula note, FAQ. **`osmolality-calculators` was not started** (the user asked
  to stop and deploy) and is still the original.
- Render/state bugs fixed along the way (the maths is unchanged): a result from the previous mode left on
  screen (six tools); `surface-area-particle-size-calculator` crashed when a sieve opening was edited
  (strings concatenated in the interpolation); `molecular-weight-finder` printed 22.99 for `NaXx`
  (its error was overwritten by a later state update) and never laid out its periodic table
  (`grid-cols-18` is not a Tailwind class); `percentage-solution-calculator` labelled v/v results "g".
- Suspected formula faults (~40 across the 13) are **recorded, not fixed**, under the 9c heading in the
  tracker's maths-issue section; the worst are in Known Issue 15.

**Files**
- 13 tool directories under `src/app/(site)/calculation-tools/(tools)/`; new underscore siblings
  `tablet-…/_profile.ts`, `molecular-weight-finder/{_elements,_formula}.ts`,
  `surface-area-…/_psd.ts`, `osmolarity-calculators/_math.ts`. Deleted the dead
  `molarity-calculator/components/MolarityCalculator.tsx` (zero importers across `src`, `mobile`, `scripts`).
- `android/app/build.gradle` — `versionCode 2`, `versionName "1.1"`.
- `src/app/(site)/download/DownloadClient.tsx` — `APP_VERSION` 1.1, `APK_SIZE` 5.6 MB.
- `public/downloads/pharmawallah-calculators.apk` — replaced.

**Architecture & Decisions**
- **The build waited for two conditions**: this session's last agent had finished verifying its tool, and
  `pharma-wallah-3d` reported that none of its pages were mid-rewrite and `migration-before/` was
  empty. `npm run mobile:build` snapshots whatever is on disk, so a half-written page would ship.
- The headless-Chrome driver used for before/after checks now lets Chrome pick its debugging port
  (`--remote-debugging-port=0` + `DevToolsActivePort`): a random port from a 500-wide range once attached
  one agent's run to another's browser (gotcha material for anyone running parallel CDP checks).

**Verification**
- Per tool: before/after numbers identical for 3+ input sets per mode (originals from the live page, or
  from `5dbe98c` for the four edited before the reboot), 1440 and 390 screenshots read, 0 exceptions,
  no horizontal overflow, `tsc` clean for the slug.
- `npx tsc --noEmit` → **0 errors outside `.next/types`** immediately before the build (the stale
  `.next/types/app/migration-before/*` stubs remain until the dev server regenerates, gotcha 64).
- `npm run mobile:apk` → **exit 0**: 109 static pages, Gradle `BUILD SUCCESSFUL`. `aapt dump badging` →
  `versionCode='2' versionName='1.1'`; `apksigner verify` → V2 signature, certificate SHA-256
  identical to the v1.0 APK in HEAD. `cmp` build output = published file.
- `mobile/out`: 108 HTML files (105 under `calculation-tools/`), CSS 98,751 + 4,210 B, 12 M;
  **0** ad strings (4 patterns), **0** secrets (7 patterns).
- Dev server: `/downloads/pharmawallah-calculators.apk` → 200, `application/vnd.android.package-archive`,
  `Content-Length: 5922832`; `/download` renders "1.1".
- **NOT verified:** the APK on a real phone or emulator (install, update over v1.0, cold start);
  `npm run build` for the web (dev server running, Known Issue 10). No tests exist; lint is not configured.

**Remaining**
- **Commit and deploy** `public/downloads/pharmawallah-calculators.apk` with the two version bumps —
  the file ships with the site.
- `osmolality-calculators` and 3d's 18 untouched tools (tracker Phase 2).
- Install v1.1 over v1.0 on a phone to confirm the update path.

**Next**
- Run `npm run build` with the dev server stopped before pushing.

### 2026-09-13 — Calculator kit migration (Phase 2, safe stop at 85/104); end-of-lesson questions + Mark as read; F16

Session `pharma-wallah-a8`, renamed `pharma-wallah-3d` after a machine reboot mid-task.

**Completed**
- **Answer to the user's question "have we updated all the calculators?": no** — 17 of 98 were on
  the kit at the start. This session migrated or re-verified **49 tools** with parallel sub-agents
  (a8: Pharm-Chem 6, Unit Conversion 6, PK 4, Clinical 4; 3d after the reboot: Pharmaceutics 6, PK 7,
  Analysis/Micro 9, Clinical 6, Pharmacology 1). `pharma-wallah-9c` (was `-4d`) took 14 more by
  agreement. **85 of 104** now use the kit; 19 remain (tracker Phase 2). Stopped at the user's request
  ("safe stop now") so the tree could be deployed today.
- **Every migrated tool shows the same numbers as its original**: the original page from `5dbe98c`
  was served on a temporary route and driven with the same 3–10 input sets as the new page. Layout is
  result-first, live results (no Calculate button), labelled units/hints/errors, example chips, Working
  section, FormulaNote, FAQ, CalcAbout + AdSlot aside; no in-page disclaimer; nothing rendered as
  NaN/Infinity.
- **~70 suspected formula faults recorded, none changed** (maths is sacred during migration) — per tool
  in the tracker; headline ones in Known Issue 15. Also fixed along the way, as render bugs: `auc-estimator`
  crashed on any edit (sorted React state in place), several stale-result displays, a `Math.random()`
  hydration mismatch in the zone-of-inhibition dish.
- **F16 fixed** — the double gap under the header on every kit tool (Known Issue 14).
- **End-of-lesson block on every course unit** (user spec): 5 optional questions from that unit's MCQ
  bank with instant feedback, score, "Try 5 more"; **Mark as read** (never gated on the questions);
  next-unit link (primary once read). Signed-out: questions work, button becomes "Sign in to mark as
  read". The data layer (`markUnitRead`, `completed` column, visits no longer dropped) is
  `pharma-wallah-28`'s — see the dashboard entry.
- **v1.1 APK not built by this session** — built and published by `pharma-wallah-9c` after this session
  confirmed the tree safe ("3d SAFE"); see the "Android app v1.1" entry above.

**Files**
- `src/components/calculators/CalculatorShell.tsx` (top padding removed), `src/app/globals.css` (comment).
- New: `src/components/course/LessonCheckpoint.tsx`, `src/lib/courses/lesson-questions.ts`.
- `src/components/course/UnitPageClient.tsx` (mounts `LessonCheckpoint` outside `printRef`, before the ad).
- `src/hooks/useProgress.ts` — `clearProgressCache()` export.
- 49 tool pages under `src/app/(site)/calculation-tools/(tools)/` (some with `_math.ts` siblings).
- `.claude/redesign-tracker.md` (Phase 2 ticks, ownership, maths-issue section, verification row),
  `.claude/MEMORY.md` (gotchas 76–79), `.claude/skills/calculator-tool/SKILL.md` (migration procedure),
  `.claude/PROJECT_MAP.md`, `.claude/ROADMAP.md`.

**Architecture & Decisions**
- **Lesson ↔ question join is an explicit table**, not unit number: the Organic Chemistry bank has
  units 3 and 4 swapped relative to the course (checked against the markdown). Banks load by dynamic
  `import()` only when the student opens the questions (90–160 KB each).
- **Lesson sets are recorded as `quiz_attempts` with a `lesson:` quiz-id prefix**; the dashboard
  excludes them from MCQ stats (28's change).
- **`clearProgressCache()` after Mark as read** — `useProgress` caches for 20 s per tab, so a dashboard
  opened straight after would still say "Opened".
- **Migration rules** (now in the skill): originals from `5dbe98c`; a temp route under
  `src/app/migration-before/<label>-<slug>/` (outside `(site)`/`(tools)`, so the mobile route generator
  never sees it), deleted right after capture; a formula that looks wrong is reported, not fixed; a
  stale-state render bug may be fixed if stated.
- **Coordination**: up to six sessions were live (hub, encyclopedia, dashboard, lab tools, 9c, this).
  File ownership agreed by message; the tracker was edited only by this session.

**Verification**
- `npx tsc --noEmit` → **0 errors in source**; the only errors are stale `.next/types` stubs for the
  deleted `migration-before/*` routes (gotcha 64).
- Per tool: before/after numbers identical (evidence was in session scratchpads — the reboot wiped the
  a8-era files; the tracker records which tools passed); new page at 1440×900 and 390×844 with 0
  exceptions and no horizontal overflow; the 390 screenshot read. `rf-value-calculator` re-checked by
  hand after a CDP port collision (0.40/0.75/0.05/0.36 both pages).
- Lesson block: headless Chrome, signed out, two biochemistry units and one organic chemistry unit at
  390 and 1440 — load questions, answer, feedback, score, new set, sign-in and next links; 0 exceptions.
- `npm run mobile:build` by `pharma-wallah-fc` mid-migration → passed (105 tool pages, 0 ad strings,
  0 secrets).
- **NOT verified:** Mark as read while signed in (no credentials; needs one click by the user);
  `npm run build` (dev server running); the APK (9c's build). No tests exist; lint is not configured.

**Remaining**
- 19 tools to migrate (tracker Phase 2 comment lists them); the clinical-only six carry the most
  serious faults — decide the formula fixes before or together with their migration.
- Owner decisions: every item in the tracker's maths-issue section; `auc-estimator`'s empty
  "Clearance (multiple doses)" mode (kept as "Not available yet").

**Next**
- Fix the serious clinical formula faults (opioid conversion/MME, creatinine staging) — logic work, ask first.

### 2026-09-13 — `/encyclopedia` redesigned (top-design): search desk + monograph reader; drug search API rebuilt

**Completed**
- **`/encyclopedia` rebuilt** at the user's request ("update the UI using top-design — fast, reliable,
  premium"). A brand-gradient cover where the search is the hero (display "Look up a drug.", a large
  field with a loading sweep, `/` and ⌘K to focus, common-drug chips); live figures counted from the
  database; below it a **result index** beside a **monograph reader** — taxonomy trail, display name,
  status/type/state tags, an identifier strip with copy (DrugBank, CAS, UNII, formula, mass), a 2D
  structure plate, an "at a glance" strip (first sentences of indication, mechanism, half-life,
  protein binding), then numbered sections: Overview, Pharmacodynamics, Pharmacokinetics,
  Interactions (filterable; every interaction opens that drug), Products, Chemistry (SMILES, measured
  vs predicted properties), Classification (kingdom → direct parent ladder), Names & references
  (PubMed links). A sticky contents rail with scroll-spy from xl; chips below it. Idle state explains
  what a monograph holds and every way to search, each with a working example.
- State lives in the URL (`?q=&page=&drug=`) — shareable monographs; typing replaces history, opening
  a drug pushes it, so the phone back button returns from a monograph to its list.
- **The search API was wrong, not just slow** (measured against the live data): a one-letter query
  crashed the client into "Failed to fetch results"; `total` counted one of three collections
  ("aspirin" said 0 while showing 2); results weren't ranked across collections and page 2 skipped
  rows; the placeholder promised CAS/UNII search that didn't exist; "paracetamol" found nothing; no
  param clamping, no rate limit. All fixed — see decisions.
- **Hero figures were fabricated-looking and wrong**: "17.4k+ drugs, 50k+ interactions, 100k+ products,
  200+ categories" → measured **12,673 drugs, 4,398 approved, 9,404 small molecules, 3,269 biotech**
  (interaction/product lists are capped samples, so they are no longer totalled).

**Files**
- `src/app/(site)/encyclopedia/page.tsx` — now a **server** page: metadata (it had none), URL params,
  Suspense-streamed figures. The 12-card carousel and its resize listener are gone.
- New `src/components/encyclopedia/`: `EncyclopediaClient.tsx`, `EncyclopediaFigures.tsx` (server,
  `unstable_cache` 24 h), `encyclopedia.css` (namespaced `.pw-enc`); `Monograph.tsx`, `prose.tsx`,
  `useDrugSearch.ts`, `types.ts` (these four were first captured mid-task in commit `12adf1b`).
- `src/app/api/search/route.ts` — rewritten; `src/lib/rateLimit.ts` — appended `drugSearchLimiter`.
- **Untouched:** `src/components/{DrugSearch,DrugCard}.tsx` and `src/types/drugs.ts` — still used by
  `/clinical/encyclopedia`, whose contract with `/api/search` is unchanged.

**Architecture & Decisions**
- **One `$unionWith` aggregate** over the three non-overlapping collections: project to small fields,
  rank, `$sort` (case-insensitive collation), `$facet` total + page, then hydrate only the page's
  documents by `_id`. Medians over 3 runs, direct to Atlas: "in" 1,641 → 637 ms, "Morphine" 785 →
  506 ms, "me" 2,095 → 1,565 ms; specific names unchanged (~200 ms). **Two-character queries match
  name prefixes only** (they were thousands of mid-word matches). Exact identifiers (DrugBank ID, CAS,
  UNII) and three verified British aliases rank 100; an exact synonym 90; prefix 80; contains 60.
- Clamped `q` (80), `page` (≤500), `limit` (≤20); **40 req/10 s per IP** via the shared Upstash
  limiter (fails open); `Cache-Control: public, s-maxage=86400, stale-while-revalidate` — the dataset
  is a static import, so the CDN can answer repeat searches.
- **Client search hook**: AbortController per request (a slow "me" can no longer overwrite
  "metformin"), 260 ms typing pause / 0 ms for committed searches, a 40-entry in-memory cache
  (a revisit measured 152 ms), previous results dimmed instead of a skeleton flash, 429/500 messages
  with Retry.
- **DrugBank text is parsed to React nodes, never HTML** (citations stripped, drug mentions linked,
  bold sub-headings, bullets) — MEMORY gotcha 74. External links are protocol-checked.
- **No framer-motion, no GSAP, no carousel.** Motion is CSS transform/opacity with the expo curve,
  all off under reduced motion; no `backdrop-filter`. Structure images are a lazy plain `<img>` from
  NIH CACTUS with a reserved square (no layout shift) and a designed failure state.
- The side rails stick at a fixed offset rather than following the retracting header (gotcha 66) —
  they are side columns, so the gap is harmless; nothing pins under the header's edge.
- No mockup round: the user asked for this page directly with top-design, as with the auth pages.
  Brand gradient cover per the no-black-grounds rule; dark tokens are navy (dark mode is still
  unreachable site-wide, F13).
- Ad-free, as before.

**Verification**
- `npx tsc --noEmit` → **0 errors in source**. The final run lists 42 errors, all in stale
  `.next/types` stubs for another session's `src/app/migration-before/` preview routes (gotcha 64).
- API, against the dev server and live data: aspirin/50-78-2 → Acetylsalicylic acid; paracetamol →
  Acetaminophen; lignocaine → Lidocaine; salbutamol → Albuterol first; DB00331 / 657-24-9 /
  9100L32L2N → Metformin; "a" → empty result with pagination; "me" pages 1, 2, 164, 165 contiguous;
  `limit=abc&page=-4` → defaults; `limit=99999` → 20. Found and fixed during this: omitted `limit`
  returned 1 row (gotcha 73).
- Headless Chrome/CDP, **1440×900 and 390×844, reduced and full motion: 0 exceptions, 0 console
  errors, `scrollWidth` = viewport** in every run. Driven: idle state and streamed figures; one-letter
  hint; typed search → ranked rows with match notes and auto-opened monograph (desktop); interaction
  click opens that drug and updates the URL; history back restores the previous monograph; phone tap
  → monograph → back button → list; deep link `?q=Morphine&drug=DB00295` → all 8 sections, identifiers,
  structure loaded, 7 in-text drug links, **no citation markers left**; interaction filter (61/100);
  folds on Metformin (256 → 479 px); a sparse record (3 sections); a 70-character IUPAC name (steps
  down to 33.6 px, no overflow); a biotech record (no plate, product table scrolls in its own box);
  no-results state. Screenshots read at both widths; they caught the leaked `[Label,F…]` citations,
  duplicated contents chips at xl, and `globals.css` code styling on the SMILES box — all fixed.
- Prose cleaner exercised with `tsx` + `react-dom/server` on real citation/mention shapes.
- `/clinical/encyclopedia` → 200; its `DrugSearch` contract (`success, data, pagination,
  searchQuery`) confirmed.
- **NOT verified:** `npm run build` (dev server running — Known Issue 10); the CDN cache and the rate
  limiter on Vercel; the page in a real mobile browser; dark mode (unreachable); a Mongo outage path
  (figures hide by code reading, not by test). No tests exist; lint is not configured.

**Remaining**
- `/clinical/encyclopedia` still runs the old `DrugSearch`/`DrugCard` UI — reuse `Monograph` there
  (tracker P12).
- Delete `DrugSearch`, `DrugCard` and `src/types/drugs.ts` once the clinical page moves over.
- Decide the DrugBank licensing question (Known Issue 16).

**Next**
- Run `npm run build` with the dev server stopped, then measure `/api/search` response times on the
  deployed site (CDN hits vs misses).

---

> Older entries are in `.claude/history/2026-09.md`: 2026-09-13 (six analytical-practical calculators, calculation-tools hub rebuild, loading screen, dashboard rebuild, header app CTA +
> Master Formula, auth pages, redesign Phase 0, top-design landing page, eight laboratory tools) and
> 2026-09-12 (ADME landing page, AdSense, Outfit, PWA removal, APK distribution, Android app,
> bootstrap).

---

## 9. Verification Baselines

> **Load-bearing.** Without these a future session cannot tell its own breakage from pre-existing
> breakage. Re-measure and update them whenever they change.

| Check | Command | Baseline (last re-measured 2026-09-16) |
| --- | --- | --- |
| Type-check | `npx tsc --noEmit` | **PASSES — 0 errors** (2026-09-16). Any error you see is yours. The app project: `npx tsc --noEmit -p mobile/tsconfig.json` → 0 errors (needs a generated `mobile/app/_generated`, i.e. one `npm run mobile:build`). |
| Lint | `npm run lint` | **NOT AVAILABLE.** No ESLint config; the command opens an interactive setup prompt. Do not report lint as passing. |
| Build | `npm run build` | **PASSES — re-verified 2026-09-16 after Molecular Lab** (in an isolated copy of the tree, dev server left up): exit 0, shared JS **88.4 kB**, middleware 81.9 kB, `/molecular-lab` 59.5 kB / 148 kB first load, `resources.<hash>.json` 1.35 MB in `static/media`. The build also prints several `Dynamic server usage` stack traces (tournament leaderboard, DailyMed, AMR routes) — logged by those handlers, non-fatal, not new. **Before that** (again after the simple `/about-us`: exit 0, shared JS 88.3 kB, `/about-us` 106 kB first load). Earlier the same day: exit 0 in ~2.5 min, 252 route lines, shared JS **88.3 kB**, middleware 81.9 kB; `/calculation-tools/rf-value-calculator` 184 kB and `/cfu-calculator` 183 kB first load; `.next/static/media/opencv.<hash>.js` 10.8 MB emitted as an asset. Same expected warnings as below. **Earlier (2026-09-12):** with the dev server stopped, after the AdSense work (the first successful run since the PWA removal, the shadcn migration and the Outfit switch): exit 0, ~170 routes, middleware 81.8 kB, shared JS 87.8 kB. Stop `npm run dev` first — they share `.next` and corrupt each other (§7 Known Issue 10). **PASSES with a populated `.env`** — exit 0, ~170 routes emitted, middleware 81.8 kB, shared JS 87.8 kB. Only `/_not-found` is static; everything else is `ƒ` (dynamic, server-rendered on demand). **Without `.env` it FAILS**: `Missing environment variable: NEXT_PUBLIC_SUPABASE_URL` while collecting page data for `/api/admin/registrations`. Expected non-fatal warnings: the `@supabase/supabase-js` Edge-runtime `process.version` notice, the stale `caniuse-lite` Browserslist notice, and two webpack "Serializing big strings" cache notices. |
| Mobile build | `npm run mobile:build` | **PASSES (2026-09-16, ~2 min)** — 105 HTML files under `mobile/out/calculation-tools/`, home `/` 125 kB first load, shared JS 88.2 kB, CSS **113,194 bytes**, `mobile/out` 22 MB (OpenCV.js is 10.8 MB of it). Secret scan: use the JWT-shaped pattern (gotcha 90). **Earlier (v1.1):** 109 static pages, 108 HTML files, 105 under `mobile/out/calculation-tools/`, shared JS 87.9 kB, CSS in two files **98,751 + 4,210 bytes**, 12 MB (re-measured 2026-09-13 by the v1.1 APK build, with 85 of 104 tools on the kit; 103,829 + 4,210 before). Independent of `.env` and safe to run while `npm run dev` is up (separate `mobile/.next`). **Also assert zero ad strings in `mobile/out`** — see `.claude/skills/adsense-monetization/SKILL.md`. A ~10 KB stylesheet is the silent Tailwind failure (gotcha 23). |
| APK | `npm run mobile:apk` | **PASSES (2026-09-16, v1.3 / versionCode 4, ~2.5 min)** — signed V2 release APK **9,347,799 B** (8.9 MB), same certificate SHA-256 `afe4c18e…5b03` as v1.2; published file byte-identical to the Gradle output. **Earlier:** (2026-09-14, v1.2 / versionCode 3, built by `pharma-wallah-4b` — new launcher icon + redesigned Serial Dose tool) — signed V2 release APK, 5,945,495 B, copied to `public/downloads/`; same certificate as v1.0/v1.1. Needs JDK 21 (auto-selected) and `android/keystore.properties`. Check `aapt dump badging` for the version and `apksigner verify --print-certs` for the certificate. |
| Tests | `node --test scripts/tlc-rf.test.mts scripts/colony-counter.test.mts` · `node --test scripts/molecular-lab.test.mts` | **41 pass, 0 fail** (2026-09-16; 21 TLC + 20 colony, ~10 s) · **21 pass, 0 fail** (2026-09-16, Molecular Lab, ~12 s, real OpenChemLib). These cover three features' pure modules only — there is no framework, no CI, and nothing else is tested. Report them by name. |

---

## 10. Continuous Maintenance

Updating project intelligence is **part of finishing the work**, not a follow-up task.

After every meaningful change, before reporting done:

1. **`CLAUDE.md`** — add a Work Log entry; update §7 Current Project State; update §9 Baselines if
   a check's result changed.
2. **`.claude/ROADMAP.md`** — move the status markers you actually earned. A file existing is not
   "✅ Implemented".
3. **`.claude/PROJECT_MAP.md`** — add genuinely new entry points; remove ones you deleted.
4. **`.claude/MEMORY.md`** — add durable facts, invariants, and any trap that cost you time.
   Never secrets.
5. **`.claude/skills/`** — if the task taught a reusable procedure, create or update a skill.
   If a skill's steps were wrong, fix the skill.

If you discover a bug, security issue, or debt and are not fixing it now, **record it** under
§7 Known Issues / Technical Debt or in the roadmap. Don't let it evaporate.
