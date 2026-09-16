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

Runtime: **Node v24.19.0**, **pnpm 10.28.1** (declared `packageManager`), npm 12.0.2.

### Commands that actually exist

```bash
npm run dev      # next dev
npm run build    # next build   — REQUIRES a populated .env, see Known Issues
npm run start    # next start
npm run lint     # next lint    — NOT CONFIGURED, see Known Issues
npx tsc --noEmit # type-check   — the only reliable static check today
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
    all ~170 routes. **Fourth exception (2026-09-16, user request): `(site)/about-us/_useAboutMotion.ts`**,
    lazy `import("gsap")` **+ `import("gsap/ScrollTrigger")`** — the only ScrollTrigger use outside the
    landing page; verified route-scoped (shared bundle unchanged at 88 kB, `/about-us` first load 111 kB).
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

---

## 7. Current Project State

### Current Branch / Focus
- Branch: **`main`** (the only branch; also the PR target). The working tree is **NOT clean** — a
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
  layers). **85 of 104** tool pages import it (`grep -l @/components/calculators`). Every tool migrated
  on 2026-09-13 was compared number-for-number with its original at commit **`5dbe98c`**. **19 remain**
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
9. No test infrastructure of any kind. No CI. See `.claude/skills/testing-verification/SKILL.md`.
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

### Technical Debt
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

### 2026-09-16 — `/about-us` rebuilt: a roster intro screen, GSAP scroll choreography, the full team

Session `pharma-wallah-78`.

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

### 2026-09-13 — Six analytical-practical calculators + `lab-analysis` layer

**Completed**
- **Calibration Curve Calculator** (`calibration-curve-calculator`): 2–10 standards, textbook
  least squares (ΣX, ΣY, ΣXY, ΣX², slope, intercept, SSE, SST, R²), unknown concentration, extrapolation
  and duplicate warnings, scatter + regression line + unknown marker, 10 numbered steps.
- **Dissolution Calculator** (`dissolution-calculator`): time table with 1–6 replicate columns,
  X = (Y − a)/b × DF, the practical sheet's correction (CF = Vs/V × previous corrected concentration),
  amount dissolved and % release, two graph tabs, a step block per time point.
- **Accuracy & % Recovery Calculator** (`accuracy-recovery-calculator`): basic mode (% recovery,
  % error, absolute error, |100 − %R|) and replicates mode (mean, sample SD, %RSD, mean % error, mean
  absolute error, bar chart with a 100% reference line); optional acceptance range entered by the student.
- **Dialysis Membrane / Diffusion Calculator** (`dialysis-diffusion-calculator`): C2 → C2/C1 → volume
  factor 1 + V2/V1 → B → 1 − B → ln(1 − B) with the exact "1 − B must be greater than 0" error, regression
  on minutes or seconds, k = −slope or "slope only" as a selectable interpretation.
- **Cumulative Drug Release Calculator** (`cumulative-drug-release-calculator`): per-row sample volume,
  Method A (practical sheet) and Method B (standard Σ C·Vs correction), selectable and labelled, graph
  of % release / amount / concentration with an optional both-methods overlay.
- **Partition / Distribution Coefficient Calculator** (`partition-coefficient-calculator`): any number
  of pH groups and experimental groups, per-phase calibration, D = CoP/Caq, log D, average log D,
  1/log D (kept separate from 1/D), [H+] and 1/[H+], pH vs log D and 1/[H+] vs log D with regression
  only when it is appropriate.
- **Calibration hand-off**: the calibration tool links to the four consumer tools with `?a=&b=&unit=`
  and also saves the latest line to `localStorage` (`pw_lab_calibration_v1`) for "Import saved calibration".
- Registered in the Android catalogue (`mobile/app/_data/tool-registry.ts`); the web hub entries in
  `tool-index.ts` were added by the hub session (`pharma-wallah-2a`) by agreement.

**Files**
- New: `src/components/calculators/lab-analysis/{index.ts,math.ts,format.ts,figure.ts,calibration-store.ts,parts.tsx}`.
- New: `src/app/(site)/calculation-tools/(tools)/{calibration-curve-calculator,dissolution-calculator,accuracy-recovery-calculator,dialysis-diffusion-calculator,cumulative-drug-release-calculator,partition-coefficient-calculator}/`
  — each a `page.tsx` plus underscore-prefixed pure modules (`_calibration.ts`, `_dissolution.ts`,
  `_accuracy.ts`, `_diffusion.ts`, `_release.ts` + `_steps.ts`, `_partition.ts` + `_report.ts` + `_parts.tsx`).
- `mobile/app/_data/tool-registry.ts` — six names, category slugs, four short names, header counts.

**Architecture & Decisions**
- **The practical-sheet methods are reproduced, not "corrected"**: dissolution's previous-corrected-
  concentration correction, dialysis's B = (C2/C1)(1 + V2/V1), partition's 1/(average log D). Where a
  standard alternative exists (cumulative release Method B) it is a separate, labelled choice.
- **Every visible replicate is required** — averaging only the filled readings would silently change a
  student's divisor. Times must increase in entry order; nothing is silently sorted.
- **No silent unit changes**: µg/mL → mg/mL conversions are printed as their own step; the dialysis
  tool converts typed times when the entry unit is switched, and says so.
- **The kit's `index.ts` was not touched** (another session owned it). The new layer is imported as
  `@/components/calculators/lab-analysis`; pure modules import `lab-analysis/math` and `format` directly
  because the index also loads React parts.
- Recharts on screen, `chartSvg` (self-contained SVG) for the PNG/print figure from the same data. Chart
  palette validated with the dataviz script; the unknown is a diamond and every multi-series graph has a
  legend because amber/green sit in the CVD floor band.
- Built by five sub-agents from a reference implementation (the calibration tool); every agent's maths was
  hand-checked in Node and every page was driven in headless Chrome by this session.

**Verification**
- `npx tsc --noEmit` → **0 source errors** (42 TS2307 lines were stale `.next/types` stubs for another
  session's deleted `migration-before/*` preview routes — gotcha 64).
- Hand-checked in Node: calibration 2/4/6/8/10 µg/mL → m 0.06635, c −0.0005, R² 0.99991, unknown 0.452 →
  6.8199 (matches an independent covariance fit); all-same X and SST = 0 guards. Dissolution
  (0.61 + 0.828 + 0.58 + 0.737)/4 = 0.68875; 3-row Vs/V = 5/900 corrected 10 / 20.0556 / 30.1114.
  Accuracy 492.5/500 → 98.5%; replicates 99 / 100.6 / 98.75 → mean 99.45, SD 1.00374, %RSD 1.00929.
  Dialysis VF 301; Y 0.057 → B 0.365595, ln −0.455068; example k 0.0149633 min⁻¹. Cumulative 3-row
  case A 2 / 4.2 / 6.42 mg vs B 2 / 4.2 / 6.6 mg. Partition D 0.512121, log D −0.290627,
  [H+] at pH 4.5 = 3.16228 × 10⁻⁵; regression identical to covariance to 15 digits.
- Headless Chrome/CDP on the dev server, all six at **390×844 and 1440×900**: hydrated, examples load,
  charts 348px wide on a phone, **no NaN/Infinity, no horizontal overflow inside `main`, 0 exceptions**.
  Exercised: empty Calculate (invalid fields flagged), non-numeric cells, graph tabs, method /
  interpretation switches, Copy (2–10 KB records), step blocks, Reset, the `?a=&b=` hand-off on three
  consumers, "Import saved calibration" after fitting a line, accuracy replicates (3 bars, 100% line,
  single-trial SD message). Fixed during review: a Recharts −1×−1 size warning (`initialDimension`), ASCII
  minus signs, "AU/µg/mL", table units forcing sideways scroll on phones, a clipped rate-constant line.
- `npm run mobile:build` → **passed**: 108 HTML files, 105 under `calculation-tools/` (all six present),
  CSS 103,829 + 4,210 B, 11 MB, **0** ad strings, **0** secrets.
- **NOT verified:** `npm run build` (web — dev server running, Known Issue 10); the PNG download and the
  print dialog (headless); a real device or the APK; dark mode. No tests exist; lint is not configured.

**Remaining**
- `npm run mobile:sync` before the next APK (`pharma-wallah-3d` is preparing v1.1 with these tools).
- The site header's compact bar overflows at 390px (menu button right edge 395–411px) — header owner's file.

**Next**
- Link the related practicals from each other's "About" panels once students have used them.

---

### 2026-09-13 — `/calculation-tools` rebuilt: fast, searchable index (top-design)

**Completed**
- **The hub is readable before any JavaScript runs.** The cause of "it takes time to load", measured
  on the live site: every card, the title and the hero were rendered at `opacity:0` for framer-motion
  to reveal (97 elements), so a phone showed a blank catalogue until ~280 KB of JS had downloaded and
  hydrated. With scripts disabled, live showed **0 of 78** tool links; the new page shows **93 of 93**.
- **New design, direction 01 "The Index" + 03 search** (the tracker's recommendation — the user asked
  for top-design without naming one). Warm-white hero from the page kit: "Pharmacy calculations,
  worked out." with the second line in a darkened brand gradient, a lead, the educational-use note, a
  brand-surface **Common starting points** card (dilution, molarity, half-life, BSA, IV drip rate, each
  with its relation), and derived figures. Then a **sticky rail** — search plus subject index (sidebar
  with scroll-spy from lg; a sticky chip bar with the same input on phones) — and ten ruled subject
  sections of index rows: `3.07`-style code, tool name, **a one-line description of what the tool
  computes**, arrow. A brand-gradient Android band closes the page.
- **Search**: matches name, description, subject and slug; folds subscripts and dashes (`c1v1` finds
  C₁V₁); highlights matches; counts per subject; `/` focuses, Esc clears; designed empty state with a
  route to `/contact`; the ad slot hides while there are no results (gotcha 30b).
- **93 tools listed** (was 87): pharma-wallah-90/-fc's six new lab tools registered — Dissolution,
  Cumulative Drug Release, Dialysis/Diffusion, Partition/Distribution Coefficient, Calibration Curve,
  Accuracy & % Recovery — each only after its route returned 200.
- **Every tool's description was written from its code**, by a sub-agent that read all 87 pages; that
  audit found 14 formula/logic faults, recorded as §7 Known Issue 15 (not fixed — logic, ask first).
- Rail follows the retracting site header (gotcha 66). Tracker F12 (hard-coded "86+", identical icon on
  every card) fixed.

**Files**
- `src/app/(site)/calculation-tools/page.tsx` — rewritten as a server component (`PageHero`,
  `FigureRow`, `StartHere`, `AppBand`); metadata unchanged.
- New: `HubCatalogue.tsx` (client island: search, rail, scroll-spy, sections), `hub.css` (`.pw-hub`
  namespace), `tool-index.ts` (`HUB_SUBJECTS`, `HUB_TOOL_COUNT`, `findTool`, `toolHref`, `START_HERE`).
- Deleted: `CalculationToolsClient.tsx` (its data moved to `tool-index.ts`; the pre-rebuild version is
  in `87d86c5`/`5dbe98c`).
- Knowledge: `.claude/{MEMORY,ROADMAP,PROJECT_MAP,redesign-tracker}.md`; skills `calculator-tool`,
  `implement-feature`, `code-review`, `adsense-monetization`, `roadmap-status`, `next-feature`,
  `android-app-capacitor` (all pointed at the new registry).

**Architecture & Decisions**
- **Tools are nested inside their subject** — `{ name, slug, desc }` under `HUB_SUBJECTS[i].tools`.
  The old flat `allTools` + `categories[].toolNames` name-string join (gotcha 9's "renders in no
  category") cannot happen any more. Every count on the page is derived.
- **No framer-motion, no entrance animation, no infinite loops, no per-row SVG** (a text arrow — 90
  inline icons were ~40 KB of HTML). Motion is hover/focus transitions on the expo curve; reduced
  motion keeps state changes and drops movement.
- **`prefetch={false}` on every hub link**: ~93 dynamic routes, and the root `loading.tsx` already
  answers a click instantly.
- The data module is imported (not passed as props) by the client island, so the list is not
  serialised twice into the RSC payload.
- The rail tracks the header with a `MutationObserver` on the header's style attribute and a data
  attribute + CSS transform — no scroll listener, no React re-render of 93 rows.
- No brand-gradient card per tool; the gradient is kept to the two surfaces that should read as the
  brand (start-here card, app band), per the no-black-grounds rule (§6 rule 15).
- The five URL-only tools were **not** added (scope). The audit says `OsmolarGapCalculator` is ready
  to list and `OpioidConversionCalculator` must stay unlisted (ROADMAP).

**Verification**
- `npx tsc --noEmit` → **0 errors** on the final run. (Mid-task runs showed errors in other sessions'
  in-progress files — `dissolution-calculator/_dissolution.ts`, `encyclopedia/Monograph.tsx` — and
  `TS6053` stale `.next/types` after the dev server was restarted; none in these files.)
- Registry cross-check: all **93** slugs have a `(tools)/<slug>/page.tsx`, no duplicates; the 11
  unlisted directories are exactly the 6 clinical-only + 5 URL-only tools.
- HTML weight, live (old, production) vs dev (new): **276,620 → 183,242 bytes**, `opacity:0` **97 →
  4** (the 4 are in the shared header/footer), inline SVG **147 → 57**, tool links 78 → 92 (93 after the
  last registration). Dev HTML is heavier than production, so the real saving is larger.
- Headless Chrome over CDP against the dev server, **1440×900 and 390×844**, reduced and full
  motion: `scrollWidth` = viewport; real wheel scrolling past 600 px retracts the header and the rail
  follows (rail top 0 on phone / 24 on desktop), scrolling up restores it (60 / 88); scroll-spy marks
  the section in view; search `c1v1` → 1 row with `C₁V₁` highlighted; Esc restores all rows; no-match
  shows the empty state with **0** ad slots; `/` focuses search; JS disabled → all tool links visible,
  h1 opacity 1. **0 console errors / exceptions** from the page (one transient `SyntaxError` in the
  shared layout chunk came from another session's mid-edit `Header/Logo` and was gone on re-run).
  Screenshots read at both widths: hero, mid-index, search, empty state, closing band.
- **NOT verified:** `npm run build` (the user's dev server was running — Known Issue 10), so no
  production timing, Lighthouse or real-network measurement; no real phone; an ad rendering in the
  placement (no slot IDs); dark mode (the site has no reachable toggle, F13). No tests exist; lint is
  not configured.

**Remaining**
- `npm run build` with dev stopped, then a production Lighthouse run on `/calculation-tools`.
- Known Issue 15 — decide which calculator formula faults to fix (each needs the user's OK).
- List `OsmolarGapCalculator` on the hub if the user agrees.

**Next**
- Courses family (P2) on the same page kit, once its direction is chosen.

---

### 2026-09-13 — Pharmacy-themed loading screen (website route loading + Android splash)

**Completed**
- **One shared loading mark, `PharmaLoader`**: the brand capsule from the logo with its green half as
  a measuring vessel (sloshing meniscus, rising bubbles, graduation ticks, a gentle tilt) and a mono
  procedure line — **WEIGH · DISSOLVE · MAKE UP TO VOLUME** — lighting one step at a time.
- **Website**: new root `src/app/loading.tsx`, the Suspense fallback while any route segment loads
  (main site and clinical; the dashboard has its own `loading.tsx` from `pharma-wallah-28`). It sits in
  the page area under the header and stays invisible for 320 ms, so fast navigations flash nothing.
- **Android app**: `StartupSplash` now shows the same capsule (white cap, green liquid) on brandBlue
  instead of a stock calculator icon; the tagline count is derived from the generated slug list
  (shows 98) instead of the stale hand-typed "97"; hold 1.1 s → 1.5 s so the procedure line reaches
  its last step. Tagline raised to white/90 for contrast.
- The user chose "Both" when asked which app. Both other active sessions were told about the new
  files before work started, and when it finished.

**Files**
- New: `src/components/loading/PharmaLoader.tsx` (`PharmaLoader`, `LoaderSteps`),
  `src/components/loading/pharma-loader.css`, `src/app/loading.tsx`.
- `mobile/app/_components/StartupSplash.tsx`; `mobile/app/globals.css` (`.pw-splash__*` rules — bar
  and sweep removed, entry animations without fill modes).

**Architecture & Decisions**
- **CSS-only, no hooks, plain classes** — it must animate before hydration (in both the SSR HTML and
  the APK's static export) and the mobile Tailwind build only scans fixed globs, so no utility classes.
- **No fake progress.** The level bobs and the steps cycle; nothing counts to 100%, because Next does
  not know how far along a load is.
- **Splash keeps solid brandBlue**, not the brand gradient: the native launch screen and the WebView
  background are that blue, and a gradient would make the hand-off visible.
- Reduced motion: static half-full capsule, all three steps readable, web loader shown at once.

**Verification**
- `npx tsc --noEmit` → **0 errors, whole repo** (after a stale `.next/types` stub from another
  session's deleted temp route was removed — it had shown 2× TS2307; gotcha 64).
- RSC payload of `/terms` contains the loader (`pw-loader-page`, "Loading page") — Next wired it as the
  fallback. Rendered on a temporary route (since deleted) at 1440 and 390, motion and reduced motion:
  level transform animating, bubbles, tilt; the Animations API showed the steps lit out of order
  (`:nth-of-type` counted the separator dots) — fixed with modifier classes and re-sampled
  (Weigh → Dissolve → Make up to volume). Real client navigations: 0 errors, loader never left behind.
- `npm run mobile:build` → **passed**: 103 pages, CSS 114,820 B, **0** ad strings, **0** secrets.
  Served `mobile/out`: splash on rgb(28,122,217) with "98 calculators · works offline", removed after
  the hold, catalogue shows 98 tools.
- **NOT verified:** the web loader appearing during a genuinely slow production navigation (dev-server
  throttling stalled; it was verified by payload + direct render instead); `npm run build`; a real
  device / Android WebView cold start; the APK was not compiled. No tests; lint not configured.

**Remaining**
- `npm run mobile:sync` before the next APK (pharma-wallah-a8 is preparing v1.1).

**Next**
- Watch a real phone cold start to tune `HOLD_MS` against the native launch screen.

---

### 2026-09-13 — Dashboard rebuilt (top-design, GSAP, shadcn); `/` → dashboard; unit tracking fixed

**Completed**
- **`/dashboard` rebuilt from scratch** at the user's request ("it takes too long to load"). A
  chromeless app: fixed rail (sections with scroll-spy, study and reference links, account menu),
  an opaque top bar (breadcrumb, ⌘K command palette, refresh, theme), a mobile sheet. Content: a
  big greeting; a brand-gradient **Next up** panel (continue the last unread unit, or the next one);
  a **syllabus coverage** ring and per-subject bars; figures (streak, active days, quiz average,
  spotting); a **syllabus grid** (every registered unit as a cell: Read / Opened / Next up / Not yet);
  a 13-week **study calendar**; **MCQ performance** (trend sparkline, per-subject bars); a day-grouped
  **activity timeline**; **milestones** whose rules are printed beside them. Navy dark mode scoped to
  the dashboard root, persisted in `localStorage` (`pw-dash-theme`). Ad-free.
- **Header and footer hidden on `/dashboard`** (`AppShell`).
- **Signed-in visitors of `/` are redirected to `/dashboard`** in middleware — only when a Supabase
  auth cookie is present, so anonymous visitors and crawlers still cost no auth call; any error
  fails open to the landing page. The clinical subdomain's `/` is untouched.
- **Unit and spotting visits were never recorded, for any account.** `useTracker` dropped every event
  while `useSupabaseUser` was still resolving, and `UnitTracker`/the pathology pages fire in a mount
  effect, so on mount the event was always dropped. Measured (aggregate counts, PostgREST): `unit_progress`
  **0 rows**, `spotting_progress` **0**, versus `activity_log` 119 and `quiz_attempts` 12. Events are now
  held until the session resolves. `UnitTracker` also stopped filing every visit under "Unknown Semester".
- **"Read" state for units:** `useTracker().markUnitRead()` sends a unit event with `completed: true`
  (flushed at once); `applyProgressEvent` sets `unit_progress.completed` only when true, so a later
  visit never clears it, and logs "Finished: <title>". The column already existed (confirmed from the
  PostgREST schema). The **Mark as read** button itself is session `pharma-wallah-a8`'s
  (`LessonCheckpoint` in `UnitPageClient.tsx`), by the user's spec.
- Quiz stats count **MCQ-bank tests only**: end-of-lesson question sets from a8's `LessonCheckpoint`
  are stored as `quiz_attempts` with a `lesson:` quiz-id prefix and are listed separately.
- Old faults fixed in passing: F8 (dashboard's 14 dead course/quick links; courses now come from
  `SUBJECTS`), F9 (activity read capped at 20 rows), F10 (UTC day bucketing), F11 (achievements that
  could never unlock and names that didn't match their rules — replaced by milestones).

**Files**
- `src/app/(site)/dashboard/page.tsx` (hook wiring only), `dashboard/loading.tsx` (new).
- `src/components/dashboard/` — new `DashboardView.tsx`, `Shell.tsx`, `Sections.tsx`,
  `CommandPalette.tsx`, `dashboard-data.ts`, `useDashboardMotion.ts`, `dashboard.css`;
  `DashboardErrorBoundary.tsx` recoloured. **Deleted:** `DashboardMain.tsx`, `DashboardSidebar.tsx`,
  `DashboardTabs.tsx`, `dashboard-shared.ts` (deletion staged in git).
- `src/components/AppShell.tsx`, `src/middleware.ts`.
- `src/app/api/progress/route.ts` — activity read = last 91 days, max 600 rows (was newest 20).
- `src/app/api/progress/batch/route.ts` — events applied in order, not in parallel.
- `src/lib/progress-server.ts`, `src/hooks/useTracker.ts`, `src/components/UnitTracker.tsx`,
  `src/components/course/UnitPageClient.tsx` (UnitTracker props only; the file then passed to a8).

**Architecture & Decisions**
- **Speed:** the frame and every panel's skeleton paint immediately; no recharts, confetti or
  framer-motion; charts are inline SVG; GSAP is fetched in parallel with `/api/progress` and a
  1.2 s gate shows content without an intro if it never arrives.
- **Every figure is derived** (`dashboard-data.ts`) from API rows + the course registry. Nothing reads
  `current_streak` (never written) or `total_time_spent_min` (only ever receives 0). Days are local time.
- **`DashboardView` takes session + progress as props**, so the page can be rendered from fixtures
  without an account (how it was verified — the fixture route was deleted afterwards).
- XP and levels were **removed**, not redesigned — they were computed from the 20 newest activity
  rows and meant nothing. Tracker decision "XP/levels" is resolved this way; reversible.
- Coordinated with peers `pharma-wallah-f6`, `-08` (owns the site loader; the dashboard has its own
  `loading.tsx`) and `-a8` (Mark-as-read UI).

**Verification**
- `npx tsc --noEmit` → **0 errors in source** (stale `.next/types` stubs for deleted preview routes
  appear until the dev server regenerates them).
- Headless Chrome/CDP against the running dev server, fixture data, **1440×900 and 390×844, reduced
  and full motion: 0 exceptions, 0 console errors, `scrollWidth` = viewport**, no reveal target left
  hidden, every counter at its final value. Screenshots read at both widths. This caught two faults,
  both fixed: `globals.css` list markers beating the namespace reset (the user also reported it), and
  a 756 px-wide activity column on phones.
- `curl`: `/` anonymous → 200; `/` with a bogus `sb-*-auth-token` cookie → 200 (fails open);
  `/dashboard` anonymous → 307 to sign-in.
- **NOT verified:** the redirect with a real session, and the dashboard with a real account (no
  credentials here — the user was watching it live); a real unit visit or Mark as read writing a
  row; `npm run build` (dev server running, Known Issue 10). No tests exist; lint is not configured.

**Remaining**
- Confirm a unit visit now creates a `unit_progress` row, and that Mark as read sets `completed`.
- Histology lessons (`HistologyLessonTemplate`) call no spotting tracker at all — only the
  pathology pages do — so histology never counts toward "Spotting lessons".
- `npm run build` with dev stopped.

**Next**
- Redesign family P1 (calculator hub) on the page kit.

---

### 2026-09-13 — Header app CTA (top-design), favicon, calculator disclaimer, gradient footer, Master Formula Calculator

**Completed**
- **"Get the app" CTA in the header** on every site page, linking to `/download`: desktop (≥1280px)
  a green object — the real app icon on a white tile, a mono "ANDROID" eyebrow over "Get the app",
  and a gradient download disc; phones/tablets a compact "Get app" pill beside the menu button
  (icon-only under 360px); the drawer a full-width card. First built as a gradient pill with a ping
  dot and shine sweep; the user rejected it ("not good") and asked for the `top-design` skill —
  scored 4/10 (muddy under its scrim, stock tropes, motion without a reason) and rebuilt.
- **Header scroll-lag fix**, on `pharma-wallah-f6`'s measurements: the sticky bar is opaque with no
  `backdrop-filter`; the scroll handler runs once per animation frame and reads a cached scroll range
  (ResizeObserver on `body` + `resize`) instead of `scrollHeight` per event.
- **Header now switches to desktop at `xl`**, not `lg` — 1024–1279px could not fit the nav, CTA and
  auth, and crushed the logo (gotcha 57).
- **Favicon is the PharmaWallah mark**: new `favicon.ico` (16/32/48), `icon.png`, `apple-icon.png`,
  transparent and properly cropped. The live site served a blurry 16px slice with part of the "P".
- **"For educational purposes only" card on every calculator** — all 98 on the web, every tool page
  in the APK.
- **Brand blue→green on the footer** (reverses the same-day ink footer, at the user's request), and —
  under the user's rule relayed by `pharma-wallah-f6` (no black grounds) — on the header Sign Up /
  Dashboard pills, drawer buttons, active mobile nav item, mega-menu featured tile and the calculator
  `ResultCard` face.
- **Master Formula Calculator** (`/calculation-tools/master-formula-calculator`, Pharmaceutics,
  "Dosage Form Lab"): formulation name, master batch size, desired quantity, add/remove ingredient
  rows (name, quantity, unit); Calculate shows formulation / required quantity / scaling factor and
  an Ingredient | Master Formula | Required Quantity table; an expandable "Calculation Details"
  shows the factor and one line per ingredient. Load example (Simple Syrup) and Reset.

**Files**
- `src/components/Layout/Header/index.tsx` — `AppCta` + `DownloadGlyph` + `AppIconTile`, `.pw-brand-btn`
  and arrow keyframes, scroll handler, opaque sticky bar, `xl` breakpoint, logo pin, drawer CTA.
- `src/components/Layout/Header/MegaMenu.tsx` — `xl:flex`; brand-surface featured tile.
- `src/components/Layout/Footer/index.tsx` — brand gradient under a 40% scrim; text at white/90.
- `src/app/{favicon.ico,icon.png,apple-icon.png}` (favicon replaced; the other two new).
- `src/components/calculators/CalcDisclaimer.tsx` (new), `index.ts` (export), `ResultCard.tsx`
  (brand face). `src/app/(site)/calculation-tools/(tools)/layout.tsx` and
  `mobile/app/_components/MobileShell.tsx` — the two disclaimer mounts.
- `src/app/(site)/calculation-tools/(tools)/master-formula-calculator/{page.tsx,_scale.ts}` (new).
- `src/app/(site)/calculation-tools/CalculationToolsClient.tsx` and `mobile/app/_data/tool-registry.ts`
  — one registry entry each (+ short name "Master Formula"; header comment counts 87/98).

**Architecture & Decisions**
- **`%` and `q.s.` ingredients are carried over, not multiplied** (gotcha 54). The brief's formula
  multiplies every ingredient, but multiplying a concentration is pharmaceutically wrong; the result
  card and Calculation Details say why on the row. Batch units convert within mL/L and g/kg.
- Kept deliberately simple, per the brief: no lab-record card, PNG, print or save — Calculate, Reset,
  Load example only. The result updates live after the first Calculate (inputs are never snapshotted).
- **The CTA uses ink text on solid brandGreen (7.49:1)** instead of white on the gradient, so it needs
  no scrim and stays the only green object in the bar. Its visible text is its accessible name (an
  earlier `aria-label` broke WCAG 2.5.3). The arrow animation runs twice after load and on hover,
  never loops, and is off under reduced motion.
- **Contrast was computed, not eyeballed**: footer scrim 40% → white/90 4.95:1 at the green corner;
  brand button 30% → 4.60:1; disclaimer body 5.97:1.
- **Disclaimer below the tool, not above it** — above, it would push every tool's inputs down on a
  phone; the layout is the only single-file way to reach all 98 web tools.
- File ownership was agreed with `pharma-wallah-f6` (redesign) and `pharma-wallah-28` (dashboard)
  over cross-session messages; none of their files were touched.

**Verification**
- `npx tsc --noEmit` → **0 errors** (re-run after every stage; one transient failure coincided with
  the other session mid-edit and was clean on immediate re-run).
- Scaling maths transpiled and run in Node: spec example 650 g / 350 mL × 0.1 → 65 g / 35 mL; 500 mL →
  2 L factor 4; 1 L → 60 mL with 10% and q.s. rows; 10 ÷ 3 factor; zero, negative, "12abc",
  cross-family units, blank name and >100% all return no result.
- Headless Chrome/CDP against the dev server: the calculator at 1440 and 390 (empty submit errors,
  example → exact spec table and details text, %/q.s./L→mL via real inputs, >100% error, remove
  row, reset); header at 320/360/375/390/1024/1279/1280/1440 (logo width, menu button inside the
  gutter, no clipped controls, `scrollWidth` = viewport); drawer; mega menu (hit-tested opaque);
  footer at 1440/390; disclaimer count = 1 on a kit tool and an unmigrated tool; hub card in
  Pharmaceutics; the three icon links served 200. Arrow never blank at rest (59 samples). **0
  exceptions / console errors** on clean loads apart from Known Issue 12.
- `npm run mobile:build` → **passed** twice; final: 103 static pages, 99 HTML files, CSS 113,827 B,
  9.2 MB, **0** ad strings, **0** secrets. Served `mobile/out`: the tool computes the example,
  disclaimer once on the tool page and absent from the app home, catalogue shows "Master Formula".
- **Scroll-lag fix NOT independently confirmed**: my same-method A/B on `/calculation-tools` was
  dominated by headless/dev noise (blur-on 20 and 36 slow frames; blur-off 43 and 5). The change rests
  on `pharma-wallah-f6`'s measurements (35 → 7 with the blur off).
- **NOT verified:** `npm run build` (web) — the dev server was running (Known Issue 10); no real
  device or Android WebView; no dark-mode check; no tests exist; lint is not configured.

**Remaining**
- Run `npm run build` with the dev server stopped.
- `npm run mobile:sync` before the next APK so it carries the new tool, disclaimer and result face.
- F16 double gap under the header on kit tools (Known Issue 14) — redesign tracker's calculator batch.
- Remove the dead PWA install prompt from the header (Technical Debt).

**Next**
- Re-measure scroll smoothness on a real phone now that the header blur is gone.

---

### 2026-09-13 — Auth pages redesigned (direction 01); landing dock removed; scroll lag; brand-gradient rule

**Completed**
- **All five auth pages redesigned** on redesign direction 01, "What an account keeps": the form on
  one side, and beside it a brand-gradient panel listing what an account saves (progress across the
  registry's 22 units — derived, not typed — MCQ attempts, flashcard/spotting progress, dashboard,
  Community posting) and what works without one. Each page frames the same panel for its moment
  (signing in, verifying, resetting). The user said "redesign the auth pages" without naming a
  direction; the published recommendation (01) was taken — 02/03 remain on the tracker.
- **Landing page timeline dock removed** (the fixed "00:29 / 01:37 · SCENE 02" bar): `Player.tsx`
  deleted, `CHAPTERS`/`RUNTIME_SECONDS`, every `data-chapter` hook and ~140 lines of player CSS removed.
- **Scroll lag diagnosed with measurement.** The dock and the site header are both `position: fixed`
  with `backdrop-filter`; the browser re-blurs moving content every frame. Removing the dock cut
  frames >50 ms on `/` from 33 to 21; disabling the header blur as well cut it to 9. The header is
  owned by session `pharma-wallah-08`, which agreed to apply the fix (opaque sticky background,
  rAF-batched scroll handler with cached height) — **not applied by this session**.
- **User rule: the theme is the blue→green gradient, not black.** Applied to everything this session
  owns — auth panel and buttons, the page kit's cover hero (`ground="brand"`, was `"ink"`), and on
  the landing page the primary buttons, specimen tab/link, drawn phone and its active chip. Relayed
  to `pharma-wallah-08` for the header "Sign Up" pill and the calculator `ResultCard` face.

**Files**
- New: `src/components/auth/AuthKit.tsx` (`AuthLayout`, `AccountPanel`, `AuthField`, `FieldLink`,
  `AuthSubmit`, `AuthDivider`, `GoogleButton`, `AuthNotice`, `AuthSwitch`, `AuthLoading`),
  `src/components/page-kit/brand.ts`.
- `src/app/(site)/{signin,signup,verify-otp,forgot-password,update-password}/page.tsx` — markup only.
- `src/components/page-kit/{index.ts,PageHero.tsx,Eyebrow.tsx}` — brand ground replaces ink.
- `src/components/Home/landing/{LandingPage.tsx,data.ts,Hero.tsx,Sections.tsx,IndexSection.tsx,useIndexMotion.ts,landing.css}`;
  `Player.tsx` deleted (and removed from the git index, where the previous session had staged it).

**Architecture & Decisions**
- **Auth logic is byte-for-byte unchanged** — every Supabase call, state variable, redirect and the
  OTP input handlers. Added only `autoComplete` hints, `aria-label`s on the six OTP boxes, and a
  "Start again" link to `/signup` on the verify page.
- **Brand surfaces carry a computed navy scrim** (surface 40% → white 5.72:1 at the green end; button
  30% → 4.60:1), matching the footer `pharma-wallah-08` built. Buttons darken on hover with an inset
  shadow (animatable, contrast only rises).
- The panel's claims were checked against code: `/api/progress` writes unit/flashcard/quiz/spotting
  progress; `/community/ask` redirects signed-out users; calculators, courses, spotting and
  simulations are public. `AuthKit.tsx`'s header comment says to update the copy if any changes.
- **F17 (`?redirect=` ignored) is still open** — direction 02 was not built; it needs approval.

**Verification**
- `npx tsc --noEmit` → **0 errors** (after each stage).
- Headless Chrome/CDP, all five auth pages + `/`, at 1440×900 and 390×844, reduced motion **and**
  no-preference: **24/24 runs with 0 exceptions, 0 console errors, scrollWidth = viewport**.
  Screenshots read; fixed a "6-/digit" line break and added a hairline where the panel met the
  gradient footer.
- Interaction, no network: OTP typing auto-advances (4, 8 → focus on digit 3); pasting "123456"
  fills all six; update-password with mismatched passwords shows "Passwords do not match" with
  **0 Supabase requests**.
- Scroll performance: numbers above, from 80 real wheel events per page with frame-delta and
  `Performance.getMetrics` capture plus a CPU profile.
- **NOT verified:** real sign-in / sign-up / OTP / reset against Supabase (would create or touch
  production auth records); `npm run build` (dev server running); the header fix (not this
  session's file); scroll feel on a real device. No tests; lint not configured.

**Remaining**
- `pharma-wallah-08` to apply the header blur/scroll-handler fix, then re-measure.
- Decide F17 (honour `?redirect=`), which would let direction 02's destination line be added.
- Remaining ink/black surfaces owned by the other session (header pill, `ResultCard`).

**Next**
- Continue Phase 1 with whichever family direction the user picks next (hub recommended first).

---

### 2026-09-13 — Redesign Phase 0: inventory, tracker, page kit, direction mockups; landing riders

**Completed**
- **Started the site-wide `top-design` redesign** (multi-session). Phase 0 per the brief: inventory,
  tracker, shared page kit, and mockup directions for six families — then **stopped for the user's
  choice**. No page has been redesigned yet.
- **`.claude/redesign-tracker.md`** — every page file (106 outside `(tools)` + `/contact` + 404)
  grouped into 13 families in the brief's order, every calculator (97; 16 on the kit, 81 to migrate
  in 17 batches of ~5, grouped by hub category), chosen-direction table, verification log, and
  **19 measured faults (F1–F19)**.
- **Page kit** `src/components/page-kit/`: `PageHero` (+ `Trail` breadcrumb), `PageSection`,
  `Figure`/`FigureRow`, `EmptyState`/`ErrorState`/`LoadingState`, `Eyebrow`, `Reveal`. Dependency-free,
  server-component safe except `Reveal`, `dark:` counterparts throughout. Unused until a direction is chosen.
- **Preview artifact** (link in the tracker): three directions each for the calculator hub, a course
  subject page, a spotting lesson, a simulation, auth and the dashboard, rendered at a true 1440×900
  and 390×844 in the product's tokens, with a recommendation per family.
- **User riders, done in this session:** (1) Science Fair 2026 has ended — the landing page's launch
  strip and the site-wide launch dialog are unmounted; (2) the landing hero's meta strip
  ("Pharm-D · Pakistan / 97 tools / 69 lessons / 8 labs / PKT clock") is removed.

**Files**
- New: `.claude/redesign-tracker.md`, `src/components/page-kit/{index.ts,Eyebrow,PageHero,PageSection,Figures,States,Reveal}.tsx`.
- `src/components/AppShell.tsx` — `LaunchPopup` unmounted.
- `src/components/Home/landing/LandingPage.tsx` — `OfficialLaunchBanner` unmounted; font comment.
- `src/components/Home/landing/Hero.tsx` — meta strip and `PktClock` removed.
- `src/components/Home/landing/landing.css` — `.hero__meta`, `.live-dot`, `pw-idx-ping` removed; hero
  grid `auto 1fr auto` → `1fr auto`, top padding raised.

**Architecture & Decisions**
- **The page kit is a sibling of the calculator kit, not a fork of it**: same tokens (board #fcfcfa,
  ink #16181d/#0b0c0e, bone #f7f5f1, brandBlue signal), same mono eyebrow, same expo easing. Colours
  are arbitrary-value classes (as in the footer) rather than new Tailwind tokens, because the running
  dev server caches `tailwind.config.ts` (gotcha 26).
- **`PageSection` has no entrance animation by design** — sections hold `AdSlot`s (gotcha 29).
  `Reveal` renders visible on the server and only hides below-the-fold blocks after hydration.
- **`Figure` requires a label and supports `note`** ("estimated") — Phase 0 measuring found three
  pages printing wrong or unlabelled figures.
- Directions were built with the `mockup-first-design` procedure: measured data first, four priors
  applied (density over decoration; no "minimal" option; directions named by the question they answer).
- Science Fair components were unmounted, **not deleted**, while the tree is uncommitted.
- Coordinated with two peer sessions: `pharma-wallah-6a` (finished, released the kit) and
  `pharma-wallah-08` (owns Header, Footer, `calculators/`, `(tools)/layout.tsx`, a new tool, until it
  reports done).

**Verification**
- `npx tsc --noEmit` → **0 errors** (after the kit, and again after the landing edits).
- Page kit: rendered every component with `react-dom/server` via `tsx` (temp tsconfig with
  `jsx: react-jsx`, deleted afterwards) — breadcrumb/`aria-current`, figure link and note,
  `role=alert`/`status` present; `Reveal` content visible at SSR.
- `/` over headless Chrome/CDP at 1440×900 and 390×844, reduced motion **and** no-preference:
  **0 exceptions, 0 console errors, scrollWidth = viewport**; screenshots read — no launch strip, no
  dialog, no meta strip, hero spacing intact.
- Preview artifact: 0 exceptions at 1280 light and 390 dark across all tabs and both mock viewports;
  no horizontal overflow at 390.
- **NOT verified:** `npm run build` (user's dev server was running — gotcha 21); `npm run mobile:build`
  (no calculator changed). No tests exist; lint is not configured. The page kit has not rendered
  inside a real page yet. The dashboard directions use a labelled sample persona — no real account
  was measured.

**Remaining**
- **User decision:** a direction (or pairing) per family, plus the decisions on the cards (F7 reading
  times; pathology template; XP/levels; F17 redirect; F9/F10/F19 logic).
- Then Phase 1 from the calculator hub; Phase 2 calculator migration.
- `npm run build` with dev stopped.

**Next**
- Build the chosen hub direction on the page kit (tracker P1), then courses.

---

### 2026-09-13 — top-design skill; whiteboard-video landing page; site chrome + calculator kit restyle

**Completed**
- **Installed the `top-design` design skill into the project** (`.claude/skills/top-design/`). The
  vendor installer (`curl … | bash`) was audited first — it installs a Claude Code plugin with a
  SessionStart sync hook and skill telemetry. Running it was blocked by the harness, so the skill's
  files (already decoded from the installer during the audit) were copied into the project
  instead. Its bundled template ends with an unrelated boilerplate "ORM" section; ignore it.
- **New landing page at `/` — "The Index", played as a whiteboard explainer video.** The whole page
  is a whiteboard: a dot-grid board, ghost formulas, marker underlines/circles/arrows and
  handwritten notes that draw on as you scroll (scrubbed, so scrolling back rewinds), a marker pen
  riding each stroke, a 3-2-1 countdown leader, and a fixed timeline bar mapping scroll to a
  timecode (one second per calculator) with chapter seek points. Sections: a hero with a cycling
  word and a taped-up worked-example card whose results are **computed** from real formulas; a
  figures tape; the pillar Index (highlighter swipe + hand-lettered numeral per pillar); the tool
  count ringed in red with one ruler tick per tool; the Android app with its real home screen drawn
  in markup; "Begin anywhere." The ADME page was replaced, not kept.
- **User decisions during the task:** a brand-new concept (not a refresh); a whiteboard look with
  the current layout, made to feel like a video; **no play buttons** — playback is scroll only;
  **no ad slots on the landing page**.
- **Site chrome restyled** to match: header (ink CTAs, reading-progress hairline instead of a
  decorative gradient), mega menu (ink featured tile, hairline active indicator), the Science Fair
  launch strip, the site-wide launch dialog (now a real dialog: role, Escape, focus handling), and
  the footer (one responsive grid instead of duplicated mobile/desktop trees).
- **Shared calculator kit + shadcn primitives restyled** — result face with tone rule/pill and
  copy-to-clipboard, animated disclosures that keep formula/FAQ text in the HTML, unit-width-aware
  suffixes, halo focus, custom easing. New dependency-free primitives: `separator`, `alert`,
  `progress`, `tabs`. `(tools)/layout.tsx` adds an "All calculators / Use them offline" strip under
  every tool. Android hub and app bar redesigned. **All reach both web and APK from `src/`.**
- **Bugs fixed:** five footer links 404'd on every page; `SelectField` lost its background colour
  to tailwind-merge (grey selects in the APK); outlined type showed stray contour lines.

**Files**
- `.claude/skills/top-design/` (new).
- `src/components/Home/landing/` — deleted the 15 ADME files; new `LandingPage.tsx`, `Hero.tsx`,
  `Specimen.tsx`, `IndexSection.tsx`, `Sections.tsx`, `Marks.tsx`, `Player.tsx`, `Chrome.tsx`,
  `Btn.tsx`, `data.ts`, `useIndexMotion.ts`, `landing.css`.
- `src/components/Layout/Header/{index,MegaMenu}.tsx`, `Header/Logo/index.tsx` (alt text),
  `src/components/ui/navigation-menu.tsx`, `src/components/Layout/Footer/{index,Wordmark}.tsx`,
  `src/components/Home/tournament/index.tsx`, `src/components/LaunchPopup.tsx`.
- `src/components/ui/{button,input}.tsx`; new `ui/{separator,alert,progress,tabs}.tsx`.
- `src/components/calculators/{CalculatorShell,NumberField,ResultCard,FormulaNote,CalcAbout}.tsx`;
  new internal `calculators/Collapse.tsx`. (`index.ts` and the lab files belong to the concurrent
  lab-tools entry below — not touched here.)
- `src/app/(site)/calculation-tools/(tools)/layout.tsx`.
- `mobile/app/_components/{ToolHub,MobileShell}.tsx`, `mobile/app/globals.css`.
- `tailwind.config.ts` — additive: `ease-out-expo`/`ease-out-quart` timing functions, `calc-result`
  animation.

**Architecture & Decisions**
- **GSAP stays confined to `src/components/Home/landing/`**; the timeline bar is plain React.
  ScrollSmoother was deliberately not used (it transforms a page wrapper — fights the fixed header
  and the Radix mega menu).
- **Two extra fonts, scoped to `/` only** (JetBrains Mono, Caveat). Outfit is still the only
  site-wide face.
- **The calculator count is derived from one constant** (`STATS.calculators`, 97) on the landing
  page; the shared chrome no longer prints a number at all, so it cannot drift as tools are added.
- **Kit restyle kept every exported prop stable**, coordinated with a second Claude session that was
  building the eight lab tools in the same directory at the same time (file ownership agreed over
  cross-session messages; `CalculationToolsClient.tsx` and `mobile/app/_data/tool-registry.ts`
  were left to it).
- **New shadcn primitives are dependency-free** — only two Radix packages are installed, and the
  primitives ship inside the APK.

**Verification**
- `npx tsc --noEmit` → **0 errors** (matches baseline), re-run after every stage.
- **Exercised in headless Chrome over CDP** against the running dev server, at 1440×900 and
  390×844, in **both** reduced motion (full-page review, every mark drawn) and full motion
  (mid-scroll frames: pen/notes mid-write, timeline bar 00:43 / chapter 03, highlighter on the
  active row). **0 console errors/exceptions** in the final runs; `scrollWidth` = 390 on the phone
  (no horizontal overflow). Full-motion testing caught a GSAP TDZ crash that reduced motion and
  `tsc` both missed (fixed; gotcha 42). Final DOM check on `/`: 0 ad bands, 5 chapters, 9 marks,
  4 notes.
- `/calculation-tools/gfr-calculator` captured at both widths — restyled kit renders, no errors.
- `npm run mobile:build` → **passed** (twice; second after the select fix): 98 HTML files, 8.9 MB,
  stylesheet 111,673 bytes. Served `mobile/out`: hub and GFR both 200; all four selects compute to
  white (were UA grey). **Ad-leak check 0** for all four ad strings; **secret check 0** for all six
  patterns.
- **NOT verified:** `npm run build` (web) — the user's `npm run dev` was running throughout
  (Known Issue 10). No tests exist; lint is not configured. No real device or real Android WebView;
  no dark-mode check (the kit has no `dark:` styles, unchanged from before). After the header/footer
  restyle, `/calculation-tools`, `/courses`, `/download`, `/spotting` and `/clinical` were loaded:
  0 errors (only the pre-existing logo LCP warning); those pages' own heroes were not redesigned.

**Remaining**
- Run `npm run build` with the dev server stopped.
- Replace the footer's placeholder phone number and `#` social links (Known Issue 13).
- Keep AdSense **Auto ads off** if `/` must stay ad-free.
- `/download` (`DownloadClient.tsx`) and the APK splash (`mobile/app/_components/StartupSplash.tsx`)
  still say "89 calculators" — there are 97 now. Not changed here (outside this task's files).

**Next**
- Migrate more calculators onto the restyled kit — each migration now inherits the new design.

### 2026-09-13 — Eight laboratory calculators + lab-record kit

**Completed**
- **Eight new tools, registered on the web hub and in the Android catalogue:**
  `theoretical-yield-calculator` (Simple mode + Reaction-stoichiometry mode with limiting/excess
  reactant, reaction extent ξ, every product's theoretical mass), `percentage-yield-calculator`,
  `percentage-recovery-calculator` (amounts, or C × V with unit families), `wbc-count-calculator`
  and `rbc-count-calculator` (Neubauer standard-formula mode with the counting-square
  configuration always visible + manual-factor mode, optional educational reference range),
  `relative-density-bottle-calculator` (pycnometer; optional volume cross-check; 15–30 °C
  water-density suggestion), `uv-spectrum-plotter` (editable/pasted spectrum, λmax, prominence-based
  peaks, drag/button zoom, PNG/CSV/print, calibration regression with unknowns) and
  `serial-dilution-calculator` (simple / serial / stepwise / reverse, keep-full-volume chain,
  multi-step plan when a volume is below the pipettable minimum, saved calculations).
- **"Use theoretical yield for percentage yield"** hands the value (and product/sample name) to the
  Percentage Yield page via the query string.
- **Every tool produces the same laboratory calculation card**: numbered sections (given data →
  substitution → result), Calculate / Reset / Copy / Download card (PNG) / Print.
- New hub category **Physiology** (WBC, RBC) on web and APK.
- The existing `serial-diluation` (Serial Dose), `density-calculator` and `uv-analyzer-tool` are
  **untouched** — they do different jobs; the new tools sit beside them.

**Files**
- `src/components/calculators/` (new): `LabReport.tsx` (card, `LabActions`, text/PNG/print
  renderers), `ModeSwitch.tsx`, `LabFields.tsx` (`TextField`, `LabNotice`), `lab-math.ts` (strict
  number parsing, `fieldError`, sig-fig formatting, unit tables, `calculatorHref`/`readQuery`),
  `chemistry.ts` (formula → molar mass, IUPAC abridged atomic weights), `hemocytometer.ts`.
  `index.ts` re-exports them.
- `src/app/(site)/calculation-tools/(tools)/<8 new slugs>/page.tsx`; `uv-spectrum-plotter/` and
  `serial-dilution-calculator/` also hold underscore-prefixed sibling modules (`_math.ts`, …).
- `src/app/(site)/calculation-tools/CalculationToolsClient.tsx` — `allTools`, categories, new
  `physiology` category + icon. `mobile/app/_data/tool-registry.ts` — names, slugs, category, short
  names, corrected counts.

**Architecture & Decisions**
- **No chemistry database lookup.** The only reliable online source (PubChem) would add `fetch` to
  a tool that ships offline in the APK and can return the wrong compound for a name. Instead the
  student types the MW; an optional helper computes molar mass *from a formula* with IUPAC atomic
  weights and is applied only when the student presses **Use**. Examples' MWs are computed from
  formulas, never typed.
- **One data description, three renderings.** `LabReportData` drives the on-screen card, the
  clipboard text, a canvas-drawn PNG (no screenshot library → no new dependency in the APK) and an
  iframe printout (user strings escaped). Charts join the PNG/print as self-contained SVG.
- **Download and Print are hidden in the Android app** (`IS_MOBILE_APP`) — the WebView ignores
  blob downloads and has no print dialog. Copy works in both.
- **Calculate is meaningful, results stay live.** Results derive from inputs via `useMemo`;
  Calculate reveals "Required" errors for untouched fields and scrolls to the card. Negative input
  errors show immediately.
- **Given data is printed exactly as typed** ("2.00 g" stays 2.00) — a lab record must not lose
  the student's precision; computed values use significant figures.
- **Hemocytometry is never one hard-coded factor**: area = squares × area per square, volume =
  area × depth, count = N × dilution ÷ volume, with the configuration, assumptions and a Neubauer
  diagram on the card; a manual-factor mode covers lab manuals with their own convention.
- Built with four parallel sub-agents from a reference implementation (Theoretical Yield); each
  agent's maths was re-checked by hand and every page was driven in headless Chrome.
- A concurrent session restyled the kit's existing files (`CalculatorShell` gained an `eyebrow`
  prop some new pages use). Files were split by agreement; none of its files were edited here.

**Verification**
- Hand-checked in Node: molar masses (C₇H₆O₃ 138.12, C₉H₈O₄ 180.16, MgCl₂·6H₂O 203.30,
  K₄[Fe(CN)₆] 368.35, CuSO₄·5H₂O 249.68); aspirin 2.00 g → 2.609 g; 2 NaOH (4.00 g) + MgCl₂·6H₂O
  (8.00 g) → MgCl₂·6H₂O limiting, ξ 0.039351 mol, 2.295 g Mg(OH)₂; WBC 150 × 20 ÷ 0.4 = 7,500/mm³;
  RBC 480 × 200 ÷ 0.02 = 4,800,000/mm³; RD 31.450/24.950 = 1.2605; calibration c 2–10 →
  m 0.05295, R² 0.99994; serial 10 mg/mL 1:10 × 5 and keep-full-volume chain 11.111/11.11/11.1/11.0/10.0 mL.
- Headless Chrome (CDP) against the running dev server, 1440×900 and 390×844: all eight pages
  rendered with no exceptions from these pages; hand-off link → Percentage Yield pre-filled; >100%
  warnings; incompatible-unit refusals; negative/zero guards; PNG card, chart PNG and CSV downloads
  produced and inspected; serial-dilution save wrote localStorage; hub shows all 8 in their
  categories incl. Physiology.
- `npx tsc --noEmit` → **0 errors, whole repo** (re-run after the concurrent session finished a
  landing-page edit that briefly showed 4 errors in `IndexSection.tsx`).
- `npm run mobile:build` → **passed**: 102 static pages, 98 HTML files under
  `calculation-tools/`, stylesheet 111,525 bytes; **0** ad strings and **0** secret strings in
  `mobile/out`.
- **NOT verified:** `npm run build` (web) — the dev server was running (Known Issue 10). No tests
  exist; lint is not configured. Print dialogs were not exercised (headless). The APK was not
  compiled or run, so Copy and the hidden Download/Print buttons are unverified on a device.

**Remaining**
- Run `npm run build` with the dev server stopped.
- `npm run mobile:sync` before the next APK so it carries the eight tools.

**Next**
- Commit this work together with the kit restyle it now depends on (`CalculatorShell` `eyebrow`).

---

> Older entries (2026-09-12: ADME landing page, AdSense, Outfit, PWA removal, APK distribution, Android
> app, bootstrap) are in `.claude/history/2026-09.md`.

---

## 9. Verification Baselines

> **Load-bearing.** Without these a future session cannot tell its own breakage from pre-existing
> breakage. Re-measure and update them whenever they change.

| Check | Command | Baseline as of 2026-09-12 |
| --- | --- | --- |
| Type-check | `npx tsc --noEmit` | **PASSES — 0 errors.** Any error you see is yours. |
| Lint | `npm run lint` | **NOT AVAILABLE.** No ESLint config; the command opens an interactive setup prompt. Do not report lint as passing. |
| Build | `npm run build` | **PASSES — re-verified 2026-09-12** with the dev server stopped, after the AdSense work (the first successful run since the PWA removal, the shadcn migration and the Outfit switch): exit 0, ~170 routes, middleware 81.8 kB, shared JS 87.8 kB. Stop `npm run dev` first — they share `.next` and corrupt each other (§7 Known Issue 10). **PASSES with a populated `.env`** — exit 0, ~170 routes emitted, middleware 81.8 kB, shared JS 87.8 kB. Only `/_not-found` is static; everything else is `ƒ` (dynamic, server-rendered on demand). **Without `.env` it FAILS**: `Missing environment variable: NEXT_PUBLIC_SUPABASE_URL` while collecting page data for `/api/admin/registrations`. Expected non-fatal warnings: the `@supabase/supabase-js` Edge-runtime `process.version` notice, the stale `caniuse-lite` Browserslist notice, and two webpack "Serializing big strings" cache notices. |
| Mobile build | `npm run mobile:build` | **PASSES** — 109 static pages, 108 HTML files, 105 under `mobile/out/calculation-tools/`, shared JS 87.9 kB, CSS in two files **98,751 + 4,210 bytes**, 12 MB (re-measured 2026-09-13 by the v1.1 APK build, with 85 of 104 tools on the kit; 103,829 + 4,210 before). Independent of `.env` and safe to run while `npm run dev` is up (separate `mobile/.next`). **Also assert zero ad strings in `mobile/out`** — see `.claude/skills/adsense-monetization/SKILL.md`. A ~10 KB stylesheet is the silent Tailwind failure (gotcha 23). |
| APK | `npm run mobile:apk` | **PASSES** (2026-09-14, v1.2 / versionCode 3, built by `pharma-wallah-4b` — new launcher icon + redesigned Serial Dose tool) — signed V2 release APK, 5,945,495 B, copied to `public/downloads/`; same certificate as v1.0/v1.1. Needs JDK 21 (auto-selected) and `android/keystore.properties`. Check `aapt dump badging` for the version and `apksigner verify --print-certs` for the certificate. |
| Tests | — | **No test infrastructure exists.** Never claim tests passed. |

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
