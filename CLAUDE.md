# PharmaWallah — Project Entry Point

> **Read this file first.** It is the index to the persistent project intelligence in `.claude/`.
> Keeping that system current is a **core project requirement**, not optional documentation.

---

## 1. Project Overview

**PharmaWallah** — an AI-assisted pharmacy education platform for pharmacy students (Pakistan-first,
Doctor-of-Pharmacy curriculum) plus a **clinical decision-support sub-brand** served on the
`clinical.*` subdomain for practising pharmacists.

The product is unusually broad for its size. Seven distinct pillars share one Next.js app:

| Pillar | What it is |
| --- | --- |
| **Calculation tools** | 106 standalone pharmacy calculators under `/calculation-tools/<tool>` (re-counted 2026-10-08) |
| **Courses & MCQ bank** | Semester → subject → unit markdown lessons + per-subject MCQ banks |
| **Spotting labs** | Histology / pathology / powder-microscopy slide lessons + timed identification tests |
| **Virtual Labs** | `/virtual-labs`: 4 3D labs, one complete experiment each — titration assay, Simple Syrup, dose–response, powdered clove microscopy (replaced the 8 legacy `/simulations` labs, 2026-10-20) |
| **Osteology Lab** | `/osteology-lab`: 22 bones + 17 joints in 3D (Z-Anatomy), spotting, viva, server-marked mock practicals (added 2026-10-18) |
| **Tournament** | Entry-code-gated science-fair competition with server-authoritative scoring + leaderboard |
| **Clinical subdomain** | Drug finder, interaction checkers, AMR surveillance, ADR, encyclopedia, literature search |

A seventh surface is not a pillar but a **target**: `desktop/` + `src-tauri/` package the
calculators as an offline Windows program (Tauri 2). See `desktop/README.md`.

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
| `@capacitor/core` / `cli` / `android` / `ios` | **8.5.2** | Wraps `mobile/out` as an offline Android **and iOS** app. iOS uses the SPM template, so `cap add`/`cap sync ios` run on Linux; only compiling needs Xcode |
| `@capacitor/share` / `filesystem` / `keyboard` | **8.0.2** / **8.1.3** / **8.0.5** | Added 2026-09-22 (user choice). Share sheet for the lab-record card, and the iOS keyboard accessory bar. Both apps only — the website never loads them |
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
node --test scripts/community.test.mts                                 # 19 unit tests, community pure layer
node --test scripts/ai-guide.test.mts                                  # 34 unit tests, AI Guide pure layer
node --test scripts/dissolution-rate.test.mts                          # 28 unit tests, Dissolution Rate Constant
node --test scripts/split-for-ads.test.mts                             # 6 unit tests, lesson ad spacing
node --test scripts/battle-royale.test.mts                             # 23 unit tests, Battle Royale schemas/format/station/titles
node --test scripts/stability-kinetics.test.mts                        # 26 unit tests, Drug Stability Kinetics
node --test scripts/virtual-labs.test.mts                              # 42 unit tests, Virtual Labs (engine, science, 4 scripted runs, manifest)
node --test scripts/osteology.test.mts                                 # 17 unit tests, Osteology Lab (content, assets, questions, token)
node scripts/build-molecule-library.mts   # regenerate the Molecular Lab library from PubChem (network)
```

```bash
npm run mobile:build   # regenerate routes + static export of every calculator -> mobile/out
npm run mobile:sync    # mobile:build + `cap sync android`
npm run mobile:open    # open the native project in Android Studio
npm run ios:sync       # mobile:build + `cap sync ios`   — runs on Linux (SPM, no CocoaPods)
npm run ios:open       # open the Xcode project          — macOS only
npm run ios:assets     # regenerate the iOS icon + launch screen from the brand mark
```

```bash
npm run desktop:build  # regenerate routes + static export of the calculators -> desktop/out
npm run desktop:audit  # prove the built desktop bundle cannot reach the network
npm run desktop:icons  # regenerate src-tauri/icons from the PharmaWallah mark
npm run tauri:dev      # run the Windows app against a live Next dev server (needs Rust)
npm run tauri:build    # routes -> export -> audit -> Windows installer (RUN ON WINDOWS)
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
| `.claude/BRAND_KIT.md` | Brand & content brief: colours, type, logo, voice, publishable figures | Writing marketing/social copy, or any user-facing count |
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
Course lesson prose is **markdown on disk** in `content/<subject>/<unit>.md` (69 files; repo root, **not** `public/` — server-read only since 2026-09-23),
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
18. **OpenChemLib and 3Dmol live in `src/components/molecular-lab/`, with exactly one other consumer**
    (2026-09-16; exception added 2026-09-20 at the user's request). Both are loaded
    with dynamic `import()` (OpenChemLib inside `chem.worker.ts`, main-thread fallback in `chem-tasks.ts`);
    nothing else may import them **except `src/components/encyclopedia/Structure3D.tsx`**, the drug card's
    3D structure, which reuses `Viewer3D`, `chem.ts` and `model3d.ts` rather than re-implementing them.
    That file is itself behind `next/dynamic` in `StructurePlate.tsx` and only mounts when the reader
    presses "3D", so `/encyclopedia` first load stays at 113 kB and the shared chunks stay clean —
    **verified by grepping the built shared chunks for both libraries (0 hits)**. Any *third* consumer
    needs the same proof before it lands. Chemistry that can be computed from the graph (formula, weight, valence,
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
- **There are now FOUR build targets, not two**: the website (`src/`), the Android app
  (`mobile/` + `android/`), an iOS target in progress (`ios/`, session `pharma-wallah-9d`), and the
  **Windows desktop app** (`desktop/` + `src-tauri/`, Tauri 2, added 2026-09-22). All of them
  compile the same calculator files; none of them may be broken by a change to `src/`.
- **Up to four Claude sessions have worked in this tree at once** (2026-09-22). Check `git status`
  and `ListAgents`, and announce which shared files you are taking, before editing one.

### Recently Completed
- **3D Virtual Labs (2026-10-20)** — `/virtual-labs`: four plain-three.js rooms (Pharm Chem, Pharmaceutics, Pharmacology,
  Pharmacognosy), one complete experiment each, a pure typed engine, every 3D action also a panel control (2D lab), mobile
  layout. Legacy `/simulations` (8 labs) and `/compounding-lab` removed with 308s. All four UoK syllabus-verified (PHC-607,
  PHT-402, PHL-612, PHG-411); **none faculty-reviewed; not deployed; not tested on a real phone/GPU.** See §8.
- **ad-09 Virtual Osteology Lab reel + lab mobile fixes (2026-10-18, later)** — 30 s reel with the lab's own 3D models drawn
  live by three.js (outside the repo); lessons no longer overflow phones; exam clock fixed. See §8.
- **Virtual Osteology & Arthrology Lab (2026-10-18)** — `/osteology-lab`: 22 bones and all 17 joints of the brief
  in 3D from Z-Anatomy (repeatable Blender pipeline, landmark markers at Z-Anatomy's own anchors), lessons,
  articulation explorer, spotting (191 renders, no X-rays), viva + skeleton identification, 8 timed mock exams marked
  server-side, progress via existing tables. Content fact-checked in a second pass (33 fixes). **Not deployed; not
  reviewed by a named anatomy teacher; no specimen photographs.** See §8.
- **ad-08 "One Platform" reel (2026-10-17)** — 20 s, white ground, the first ad animated with **GSAP** (vendored in the
  kit, frame-exact via `tl.seek`); Dilution, Kinetics, Calibration Curve and Dissolution on their own examples, chart
  lines redrawn from the charts' own SVG; new transition types and a new "swipe" cut sound. Outside the repo. See §8.
- **AdSense remediation, phases 1–5 (2026-10-13)** — audit, kebab-case URLs with 301s, per-page metadata, noindex
  table, ad units off by default, consent banner, bylines, Sources on 76 calculators, 25 draft guides, board
  privacy, privacy v3.2 / terms v1.2. **Owner: see `HUMAN_TODO.md`.** See §8.
- **AdSense remediation (2026-10-12, with session `pharma-wallah-da`)** — teaching sections on 21 calculators,
  five guides at `/guides`, `/editorial-policy`, honest counts and claims site-wide, JSON-LD, podium order fixed,
  Terms/Privacy reconciled. **Clinical dosing errors found, not fixed — owner decision.** Reports in `docs/`. See §8.
- **ad-07 Dose + Dilution reel (2026-10-11)**: 40 s, the Animal Weight-Based Dose and Serial Dose calculators
  ("Dose Calculation" / "Animal Dose Dilution" in the owner's brief), both typed into in the real app export,
  rendered with an original music bed. Outside the repo. See §8.
- **ad-06 Biopharmaceutics calculators reel (2026-10-11)**: 36 s, the whole Biopharm & PK collection, six real
  calculators driven in the app export (every figure re-derived), white end card, timed voice-over script.
  Outside the repo. See §8.
- **ad-05 "No Internet? No Problem." (2026-10-11)**: the offline-app reel from the owner's brief, plus a
  cover poster and a timed voice-over script. Every app screen was captured with the browser **offline**,
  so the "works offline" claim is now proven (MEMORY 195). Outside the repo. See §8.
- **`reel-ads` skill + ad-04 (2026-10-10)** — the owner's reel brief is now a skill (`.claude/skills/reel-ads/`), with the
  brand overrides spelled out; ad-04 "Stop Calculating the Hard Way" (25 s) uses real app frames captured by driving
  the app export. Videos stay outside the repo. See §8.
- **"How to use the calculators" guide + APK v1.5 + two ad videos (2026-10-08)** — one shared guide
  (`src/components/calculator-guide/`) at `/calculation-tools/how-to-use` on the web and `/how-to-use/`
  in the app: an 8-step tour plus a full guide written against what the calculators *actually* do
  (results are live; Calculate exists only on the 17 lab-record tools — MEMORY 190). Linked from the hub,
  every calculator, the header menu, the sitemap, the app's tool bar (?) and a first-use card on the app
  home. **APK v1.5 built and verified** (same certificate, 106 tools + guide) — **commit and deploy it.**
  Two 9:16 ads, kept **outside the repo** at `~/personal/pharmawallah-marketing/video/` (owner: not to go live). See §8.
- **Drug Stability Kinetics Calculator (2026-10-08)** — `/calculation-tools/stability-kinetics-calculator`,
  the Procaine HCl / 50 °C practical: absorbance → % remaining, three regressions, order by highest R²
  (the sheet's data are **zero** order, narrowly), k, t½, t90, four graphs, Steps 1–10. Same day, the user's
  "final prompt": opens pre-filled, Graph Analysis card, transformed-data table, residuals, 2-point minimum. See §8.
- **Battle Royale fixes (2026-09-30)** — full names on the board; certificates found by picking your name
  (no Player ID or email); ranking is now total then **shorter time**; Top-10 SQL in
  `supabase/queries/battle_royale_top10.sql`. **Owner: run `supabase/migrations/20260930_battle_royale_ranking.sql`,
  then Unfinalise → Finalise** (the new order swaps 10th/11th). See §8.
- **Battle Royale polish (2026-09-29)** — live top-3 podium on the home page (under the hero) and the
  leaderboard; `/battle-royale` is a three-button game menu; downloadable e-certificates (gold
  Achievement for the Top N once final, Participation for everyone) and performance titles; the home
  hero now fits one screen with the calculator buttons. See §8. Later the same day: an admin
  **Close tournament** button (public site → leaderboard + My result only). **Owner: run
  `supabase/migrations/20260929_battle_royale_closed.sql`.**
- **Battle Royale event app (2026-09-27, v2 same day)** — `/battle-royale`: register → pay at desk →
  admin issues a single-use Game Code → offline-first station (word search, matching, quiz) → live
  leaderboard (Upstash-cached). **Blocked on the owner running the SQL (v1 + v2, or
  `supabase/battle_royale_setup.sql`).** See §8.
- **Ads: 3–5 per content page, lesson files no longer public (2026-09-23/24)** — see the §8
  entry. Lessons 3–5, calculators 3, hub 4, spotting lessons 2–3; thin pages none. Every lesson
  with inline code was failing to hydrate (react-markdown 10) — fixed. **Deployed (`8527e56`) and
  verified live 2026-09-24**; waiting on the AdSense re-review.
- **AdSense "Low value content" rejection addressed in code (2026-09-23)** — every page now has
  its own title, description and absolute www canonical (173 of 216 live pages shared one title);
  `robots.txt` and `sitemap.xml` exist (217 URLs, derived); the clinical subdomain's duplicate copy
  of the site canonicalises to www; 9 broken internal links fixed; fake phone numbers, `#` social
  links, "Coming Soon" MCQ cards, the template's `/documentation` page and the duplicate `/mentor`
  page removed; the contact and careers forms actually send now; FAQ and privacy policy rewritten
  to be true; inflated figures corrected; the community feed (broken in production by a PostgREST
  ambiguity) fixed. **Not yet deployed. Owner steps remain** — see the §8 entry.
- **iOS app target added (2026-09-22)** — `ios/`, a Capacitor 8 Xcode project wrapping the *same*
  `mobile/out` bundle the APK wraps: 105 calculators, no login, no API, no account. Scaffolded and
  synced **on Linux** (Capacitor 8 uses SPM, not CocoaPods); brand icon and Outfit-set launch
  screen generated by `scripts/generate-ios-assets.mjs`; `Info.plist` asks for **no permissions**;
  the iOS decimal keypad gets an accessory bar so it can be dismissed; and the packaged apps trade
  Download/Print for a native **Share** of the lab-record card. **Never compiled** — that needs a
  Mac. See the §8 entry and the `ios-app-capacitor` skill.
- **Windows desktop app added (2026-09-22)** — a third packaged target, `desktop/` (Next static
  export) wrapped by `src-tauri/` (Tauri 2). Fully offline: no API, no auth, no cloud, no ad
  network, self-hosted fonts, and `npm run desktop:audit` fails the build if any of that changes.
  Ships all 105 calculators plus a dashboard, a 212-row searchable values library, 40 formulas, a
  unit converter, local calculation history and PDF/CSV/text export. **The Rust half has never been
  compiled** — there is no Rust toolchain on this machine and the host is Linux, so no installer
  exists yet. See the §8 entry and `desktop/README.md`.
- **`/pharmacy-counter` rebuilt as the Community Pharmacy Simulation Lab (2026-09-20)** — the old
  1,529-line six-step click-through with XP, combos and a countdown is replaced by a counter a
  student works at: fourteen gated stages (plus a ten-stage minor-ailment path), **ten clinical
  checks the student performs rather than acknowledges** (the finding is unreadable until a verdict
  is recorded), blocking findings that genuinely stop a supply, a shelf with batches and expiry that
  depletes as you dispense, a label printer, eight counselling checkpoints, patient questions scored
  on five dimensions, bench calculators, a reference desk, an intervention record, a till, and a
  debrief that reports six competencies with a learning point on every error. Ten cases across six
  tiers. Pure `data/` + `engine/` layer with **47 unit tests**. See the §8 entry and the
  `pharmacy-counter` skill.
- **Books Library removed, AI Guide rebuilt in its place (2026-09-20)** — the library linked scanned
  copies of commercial textbooks (and 38 of its 39 links were `"#"` anyway); it is deleted, its 35
  cover scans with it, and `/books-library` 308s to `/ai-guide`. The guide now streams answers, has
  five study modes, saved conversations, stop/regenerate/copy, real markdown styling, page metadata,
  and a panel pointing at the nine resources we actually own. **`/api/chat` is now rate limited,
  validated and clamped** — it was the app's largest unauthenticated money exposure. See the §8 entry.
- **Calculator kit migration COMPLETE (2026-09-20)** — all **104 of 104** tool pages import
  `@/components/calculators`; `grep -rL "@/components/calculators" src/app/(site)/calculation-tools/(tools)/*/page.tsx`
  returns nothing. The last 17 were migrated by session `pharma-wallah-86` with before/after CDP
  captures on every tool — **every displayed number is identical** to the pre-migration page. Phase 2
  of the redesign tracker is closed. The maths was copied, not corrected: ~10 further formula faults
  were found, are **stated on screen** on the affected pages, and are listed in the tracker
  (Known Issue 15 still applies).
- **Liquid-glass result cards and mode tabs (2026-09-20, user request)** — `ResultCard` and
  `ModeSwitch` in the shared kit, so it reaches all 104 calculators *and* the APK. Transform-only
  light layers (`calc-sheen`, `calc-tide` in `tailwind.config.ts`), a specular rim, and a
  brand-tinted `ModeSwitch` track so the selected pane reads as glass. Touch devices drop
  `backdrop-filter` via `[@media(hover:none)]` and get the same look from a pre-saturated fill —
  see MEMORY gotcha 51 and the note below.
- **Disk Diffusion Lab rebuilt (2026-09-20)** — `/simulations/disk-diffusion` is now Theory (Principle ·
  Materials · **illustrated nine-step Lab Guide** · Interpretation · Safety) plus a simulation the
  student *performs*: standardise the inoculum, choose an agar depth, swab the plate with live coverage
  scoring, place 4–6 disks under enforced 24 mm/15 mm rules, incubate, then **measure every zone with a
  draggable calliper** before any diameter is revealed. Interpretive criteria are configurable data with
  a stated source, and "no interpretive criteria" is a real answer. Mistakes explain themselves instead
  of blocking. See the §8 entry and the `lab-simulation` skill.
- **`/encyclopedia` redesigned again (2026-09-20)** — the user said the page was "bad", and asked for
  **all** of the search's information "easy to understand and read" without feeling overwhelming, plus a
  **3D structure in the drug card**. The full-screen brand cover is gone: the search is a bar that is
  always on screen (hero band while idle, slim sticky control once searching, one input that is never
  remounted). A record is now a **tabbed card** — eight sections, each tab printing how much it holds,
  one section on screen at a time — and **nothing inside a section is folded, sliced or allow-listed any
  more**. The structure plate carries a **2D ⇄ 3D switch**: the 3D conformer is generated on the device
  from the record's own SMILES (OpenChemLib in a worker, 3Dmol to draw) and loads only on demand. See the
  §8 entry for the six categories of data the old page was silently dropping.
- **Community rebuilt as a Reddit-shaped, pharmacy-scoped system (2026-09-20)** — 12 pharmacy spaces,
  posts in four kinds (discussion / question / link / image), nested comments to depth 8 with
  collapse, hot/new/top/rising sorting, search and filters, saves, karma, join/leave, accepted
  answers, reporting, and legacy-URL redirects. **Blocked on one owner action:** run
  `supabase/migrations/20260920_community.sql` in the Supabase SQL editor — until then every
  `/community` route shows its error boundary. See the §8 entry and the `community-system` skill.
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
- **AdSense**: plumbing done, ad-unit IDs outstanding (Phase 4.6).
- **Calculator refinement standard (2026-09-22)**: the user's 25-section brief is written up as
  `.claude/skills/calculator-refinement/SKILL.md`. **No calculator has been refined yet** — the
  procedure exists, the work does not. Starting point measured over the 104 tool pages: 35 have a
  unit selector, 37 a graph, 15 a lab record, 9 an editable table, 3 scientific notation.

### Partially Implemented
- **Course catalogue (largest gap).** `src/lib/courses/registry.ts` registers **4 subjects**, but
  `src/lib/courses/subjects/` holds **14 files** and `content/` holds markdown for **10+
  subjects**. Nine subject files are dead code *and use a different data shape* (`*_META` +
  `*Units` + `*_DIFF_BADGE`) than the registry's `SubjectMeta` interface. A tenth,
  `natural-toxins.ts`, *is* in `SubjectMeta` shape but is still not registered.
- **Calculation tools hub.** 106 tool directories exist; `HUB_SUBJECTS` in
  `src/app/(site)/calculation-tools/tool-index.ts` lists **95 unique tools** (100 entries — re-counted 2026-10-08 after the Drug Stability Kinetics Calculator joined Pharmaceutics, now 18; was 94/99 — five tools appear under two subjects, MEMORY 165; corrected 2026-09-23) across 10 categories (re-counted
  2026-09-22 by parsing the file: Pharmaceutical Chemistry 16, Clinical & Hospital Pharmacy 18,
  Pharmaceutics **17**, Biopharmaceutics & PK 14, Pharmaceutical Analysis 10, Unit Conversion 6,
  Pharmacology 6, Microbiology 6, Pharmaceutical Engineering 4, Physiology 2 — Pharmaceutics gained
  the Dissolution Rate Constant Calculator on 2026-09-22; the previously recorded "93" was stale). Six of the remainder are deliberately
  linked from `src/app/clinical/dose-calculators/page.tsx` instead. **Five —
  `antagonism-simulator`, `emax-model-calculator`, `drug-half-life-calculator`,
  `osmolar-gap-calculator`, `opioid-conversion-calculator` — are reachable by URL but linked from
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
exact steps — the content is already written and sits in `content/`, so this converts
existing dead assets into working pages at the lowest risk-per-value ratio in the repo.

### Known Issues
22. **AdSense re-review needs owner steps the code cannot do (2026-09-23).** (a) Deploy. ~~(b) apex → www redirect was a 307~~ — **fixed 2026-09-24**, now 308.
    (c) Submit `https://www.pharmawallah.com/sitemap.xml` in Google Search Console and wait for a
    recrawl before requesting review. (d) **Replicated content** (Publisher Policies): `/encyclopedia`
    and `/clinical/encyclopedia` show DrugBank's text verbatim (Known Issue 16), . ~~The unregistered
    subjects' markdown under `public/content/` was publicly served~~ — **fixed 2026-09-23**: moved
    to `content/`, no longer reachable (at the user's direction). (e) "Consistent presence" and "user interest" are traffic and site-age
    signals; no code change moves them.
23. **Powder microscopy has no images at all** — `public/images/spotting/powder/` never existed.
    Since 2026-09-23 the three text lessons render without images, the five lessons that had no
    page are gone from the index, and the test is replaced by a "being rebuilt" notice (noindexed).
    Needs real slide photographs.
21. **The iOS app compiles, but has never been *run* or installed.** ✅ 2026-09-22: the
    `.github/workflows/ios-app.yml` job went green on `macos-latest` — Simulator (Debug) **and**
    the arm64 device slice (Release, unsigned) both built, in 5m22s, with the offline bundle inside
    and no permissions requested. So "does it build?" is answered: **yes**. What is still unproven
    is everything a compile cannot show — the launch-screen handover, the keyboard accessory bar,
    the share sheet, `capacitor://localhost` as a secure origin, and behaviour on real hardware.
    The Simulator `.app` is downloadable from the run's artifacts; running it needs a Mac. A signed
    `.ipa` (device install, TestFlight, App Store) additionally needs a **paid Apple Developer
    account**, which does not exist — the workflow's closing comment names the secrets and steps.
0c. **The Gemini API key is on the free tier: 5 requests per minute for the whole project.**
   Measured 2026-09-20 against `/api/chat`; the 6th call in a minute returns `429 … quotaValue: "5"`
   with a ~50 s retry delay. This is a **site-wide ceiling shared by every visitor**, not a per-user
   limit, and it binds long before our own rate limits. `/api/chat` reports it as a 503 with "try
   again in about a minute", but the AI Guide cannot carry real concurrent traffic until the owner
   enables billing. **Owner decision.** The other three Gemini routes share the same quota.
0b. **`interactions.total_count` is not a total, and neither are the products or synonym lists**
   (measured 2026-09-20 across all three collections). `total_count` equals the stored
   `drug_interactions` length on all 4,479 records that have it, and both cap at exactly **100**;
   products cap at **5**, synonyms at **5**. `/encyclopedia` now says so on screen. Anything else that
   reports these as totals (or sums them into a hero figure) would be wrong — the old hero's
   "50k+ interactions, 100k+ products" was exactly that mistake.
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
4. **The Supabase schema is (almost entirely) not in the repo.** Tables, the
   `tournament_leaderboard_best` view, the `claim_tournament_attempt` RPC, and every RLS policy
   exist only in the Supabase dashboard. Code comments reference a `migration.sql` that is absent.
   **One exception since 2026-09-20:** `supabase/migrations/20260920_community.sql` holds the whole
   community schema, including its RLS policies — the only versioned SQL in the project. It is
   **not applied**; the owner must paste it into the Supabase SQL editor (no `DATABASE_URL` exists
   and PostgREST cannot run DDL, so no session can apply it).
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
9. No test framework and no CI. The only tests are 81 `node --test` unit tests for the TLC, colony,
   Molecular Lab and community modules (§1 commands). See `.claude/skills/testing-verification/SKILL.md`.
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
13. ~~Footer placeholders~~ **Fixed 2026-09-23**: phone removed, only the real Instagram link kept.
    Original note: the footer's phone number (`+92 300 1234567`) looks like a placeholder
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
    extra ones: `opioid-conversion-calculator` (fentanyl patch dose taken as mg → 25 = 2500 MME; no
    cross-tolerance reduction), `opioid-mme-calculator` (tramadol 0.1 and hydromorphone 4 vs CDC 2022's
    0.2/5; rotation to a patch halves the rate), `creatinine-calculator` (CKD stage from Cockcroft-Gault
    not eGFR), `drying-rate` (page freezes when initial = final moisture), `density-conversion-calculator`
    (unit selectors do nothing), `half-life-calculator` (minutes/days double-converted),
    `osmolarity-calculators` (TPN factors per-% on g/L inputs → 10× high), `ppm-ppb-calculator`
    (mg/L→M ignores molecular weight). The hub
    audit's original list (a sub-agent read every hub tool's maths while writing its description;
    **none fixed**):
    `solubility-calculator` (unit labels off by 10–1000×); `heat-formation-calculator` (actually
    computes heat of *solution*, van't Hoff); `strength-conversion-calculator` (w/v in g gives 10000 g/mL
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

### 2026-10-20 — 3D Virtual Pharmacy Laboratories (replacing the legacy simulations)

"Follow protocol" + the owner's 16-page brief (4 labs × 1 experiment, research assets and curriculum, remove the old
simulations). Asked mid-task: scope = remove `/simulations` + `/compounding-lab`, keep osteology/pharmacy counter/
antibiogram/molecular lab; "use more agents"; "everything mobile responsive — our users are on mobiles".

**Completed**
- **Four labs** at `/virtual-labs/<discipline>/<experiment>`: citric-acid assay by NaOH titration (pH charge-balance model,
  phenolphthalein end-point, analytical balance with draught shield, volumetric flask, pipette, burette read by the student);
  Simple Syrup (NBS C457 density table, solubility, heat damage, made-up-hot error, batch record); graded dose–response on a
  simulated organ bath (Hill teaching model, washout/temperature/aeration effects, linear + log plots, EC50 read-off, unknown
  sample per UoK PHL-612); powdered clove microscopy (to-scale schematic eyepiece, FN 18 optics, chloral clearing, checklist,
  CC BY-SA reference photo). Landing page with room thumbnails, progress, curriculum badges, credits.
- **Engine** `src/lib/virtual-labs/`: typed definitions, `reduceRun` (undo keeps mistakes, hints free, answers lock, submit
  gated), deterministic seeds, results report. **Rooms** `src/components/virtual-labs/three/`: shared runtime (walk + collision,
  picking, close-ups, guided camera, quality tiers, on-demand render, disposal), procedural kit/glassware/instruments.
- Research by agents: UoK + HEC PDFs read and quoted; Poly Haven/Sketchfab/Smithsonian/NIH/BlendKit/Commons assets checked
  per asset. Docs: `docs/virtual-labs/*` (9 files). Skill `virtual-labs`; MEMORY 223–234.

**Architecture & Decisions** — plain three.js (no R3F, per the osteology skill; no new dependency). Only CC0 maps + 1 HDRI
(Medium/High) + one CC BY-SA photo ship; everything modelled procedurally (no licensable burette/balance/organ bath exists).
Methods/limits that are teaching values are labelled as such (e.g. 0.1 M citric acid method vs Ph. Eur. 1 M). Progress via
existing tables only (`trackActivity`/`trackQuiz`, localStorage `pw-vlabs:v1`).

**Verification** — `node --test scripts/virtual-labs.test.mts` 42/0; all suites 315/0 after the removal (+3 since). `npx tsc
--noEmit` 0. `npm run build` exit 0: lab pages 198–202 kB first load, shared 88.8 kB, middleware 82.5 kB; three.js in no
route's first load. Headless Chrome (SwiftShader): **all four labs completed end to end at 1440 and 390 px (touch)**, reading
instruments from the rendered page; 0 console errors, 0 overflow; 360 px sweep 0 overflow. Perf in
`docs/virtual-labs/TESTING.md` (software rendering only: 2–3 fps, load 7–35 s — not representative of a GPU). **NOT
verified:** a real phone/Safari/GPU, signed-in progress rows, WebGL-disabled browser, faculty review. Lint not configured.

**Remaining** — faculty review per lab; real clove photomicrographs; deploy + phone check; re-run `node scripts/gen-lastmod.mjs`
after committing (the 5 new paths have no git date yet). **Next** — commit, deploy, open one lab on a real phone.

### 2026-10-18 (later) — Osteology Lab mobile fixes + ad-09 "Virtual Osteology Lab" reel

User: lesson and test pages "breaking on mobile"; then the owner's 30-second reel brief for the lab; mid-task "why
download, just use something else, do HTML" (the scratchpad holding Blender had been wiped by a session restart).

**Mobile (in the repo)** — reproduced at 360/320 px: every bone/joint lesson was 200–300 px wider than the screen (a table
in a grid item without `min-w-0`), "Metacarpophalangeal" overflowed 320 px, and the exam countdown froze while moving
between stations (its interval was keyed on `run`, which changes on every answer). Fixed: `Card` gets `min-w-0`; long
titles hyphenate; attachments/ligaments are stacked cards below `sm` (tables from `sm` up); the clock is keyed on the
paper's token; a double full stop in articulations. Verified on `next start`: all 39 lessons at 360 and 320 px →
0 overflow; spotting (10 questions) and the 30-station exam stay within the screen; timer 15:00 → 14:54 after 6 s of
rapid navigation; screenshots read. `tsc` 0 errors; `npm run build` exit 0 (shared 88.7 kB, middleware 82.5 kB);
osteology tests 17/17. My earlier "0 overflow at 390 px" was a false pass (MEMORY 221).

**ad-09** (outside the repo, `~/personal/pharmawallah-marketing/video/ad-09/`) — 30 s, 1080×1920, 30 fps: dark hook
(humerus · scapula · femur · knee) → light sweep → brand lockup → "EXPLORE IN 3D / IDENTIFY LANDMARKS" with five
Z-Anatomy labels on the anterior humerus → "UNDERSTAND ARTICULATIONS" (shoulder, glenoid labrum) → deck of real lab
screens (spotting, shoulder lesson, viva, exam) → phone (drag, tap a landmark, joint lesson) → end card. **The 3D is the
lab's own GLBs drawn live with three.js** — bundled once into `_kit/vendor/three/` with the repo's esbuild (no install,
no Blender); labels are projected from Z-Anatomy anchors and shown only when visible, in anatomical columns. App screens
captured from a local production build. **The lab is not deployed**, so the end card says "coming soon" / "follow for
updates". Kit change: `render.mjs` adds SwiftShader flags and waits on an optional `window.READY` (older ads unaffected).
Verified: stills read around every beat (caught: canvas hidden by a seeked `fromTo`, invisible gradient subtitle, bones
over headlines, labels crossing the bone, a ripple showing early — all fixed, MEMORY 222); `ffprobe` h264 1080×1920
30/1, 30.0 s (+aac); −13.7 LUFS; ten frames pulled from the MP4 and read. **Not verified:** the music was never listened
to (no audio output); no voice recorded (no TTS — script in `voiceover.srt` + README); not seen in Instagram/TikTok or on
a phone.

### 2026-10-18 — Virtual Osteology & Arthrology Lab (`/osteology-lab`)

"Follow protocol" + the owner's master brief (it arrived **truncated at §14**, mid-"student dashboard"; built to
everything up to there). Mid-task, at the user's request: removed the lab's top tab strip, and removed Antibiogram
Simulator from the Resources menu (the page itself still exists; the clinical footer still links it).

**Completed**
- **Assets — Z-Anatomy first, as asked.** Z-Anatomy ships one `.blend`, no GLB. A committed, repeatable pipeline
  (`scripts/osteology/`, portable Blender 4.2 headless — not a project dependency) exports 22 bone models, 17 joint
  models (bones + capsule + named ligaments, discs, labra, menisci as separate meshes) and the full skeleton
  (decimated, 2.2 MB). Nothing missing from any spec. **Landmark markers are Z-Anatomy's own**: the leader-line end of
  each label, unmodified (MEMORY 214). 191 Cycles renders for spotting (never X-rays), published under content-hash
  names. Licence CC BY-SA 4.0 + BodyParts3D, credited under every viewer and on `/osteology-lab/about#credits`.
- **Content**: 22 bones and all 17 joints in the brief (radioulnar proximal/distal separately; first vs 2nd–5th CMC;
  knee articulations; talocrural vs foot joints; pubic symphysis as secondary cartilaginous). 5 writing agents, then
  5 independent fact-check agents: **33 corrections** (e.g. levator scapulae insertion, glenohumeral ligament
  attachments, posterior talofibular ligament direction); every MCQ key and siding rule checked.
- **Pages**: lab home, bone library + 22 lessons (viewer + searchable landmark list, side switch, views, landmark
  fly-to), articulation explorer + 17 joint lessons (highlight any bone/ligament, frame it, hide capsule), spotting
  practice, viva trainer (354 questions, revise list) + skeleton viva (find/explore), 8 mock-exam presets, progress,
  about. Phone bottom bar; WebGL/Save-Data/error fallbacks; reduced motion.
- **Integrity**: questions generated server-side from content + assets, deterministic from a seed; HMAC-signed
  token (key derived from the service-role key — no new env var); `/check` refuses exam tokens; grading and history
  only in `/submit`; rate limited. Progress via existing tables only (MEMORY 217).

**Files** — new: `src/lib/osteology/**`, `src/components/osteology/**`, `src/app/(site)/osteology-lab/**`,
`src/app/api/osteology/{session,check,submit}/route.ts`, `scripts/osteology/**`, `scripts/osteology.test.mts`,
`public/models/osteology/` (40 GLB, 8.8 MB), `public/images/osteology/spotting/` (191 WebP, 2.9 MB),
`.claude/skills/osteology-lab/`. Edited: `src/lib/content/references.ts` (+4 verified sources), `src/lib/rateLimit.ts`
(`osteologyLimiter`), `src/lib/indexing.ts`, `src/app/sitemap.ts`, header `menuData.tsx`/`menuMeta.tsx`,
`scripts/lib/ts-resolve.mjs` (JSON imports in tests).

**Architecture & Decisions** — plain `three` (installed) instead of React Three Fiber: no new dependency. Brand
`#1C7BD9`/`#21B67A` instead of the brief's `#2563EB`/`#4ADE80` (MEMORY 194). Typical vertebra = L3, typical rib = 6th
(the only ones Z-Anatomy labels). Exam presets are a typed file, not an admin screen (no table exists) and are
labelled "not an official format". Spotting/exam/viva/progress noindexed; lessons indexable.

**Verification** — `npx tsc --noEmit` 0 errors. **17/17** osteology tests; all 12 suites **276 pass, 0 fail**.
`npm run build` exit 0, shared 88.7 kB (+0.1), middleware 82.5 kB; three.js in lazy chunks only (0 pages load it
eagerly). Headless Chrome (software WebGL) on `next start` and dev at 390 and 1440 px: models load, landmark
fly-to, joint highlight/frame/capsule, mesh tap-picking, spotting check→feedback, exam start→answer→flag→refresh→
resume→end early→results, viva reveal/revise, skeleton find/explore, 0 console errors, 0 overflow. API: forged token
401, exam token on /check 403, oversize/malformed 400, no key in public payloads. Found and fixed along the way:
Blender `.001` name clashes (taps hit nothing), global list CSS, stale exam clock, scroll-to-hero. **NOT verified:**
a real phone or Safari; signed-in exam history written to Supabase (no test account used); dark mode; lint (not
configured). The final build includes every change, the last being that wrong skeleton taps are no longer painted green.

**Remaining** — specimen photographs; a named anatomy reviewer (`bylines.ts`); movement animations; syllabus match;
the brief's sections after §14. **Next** — commit (assets are 11.7 MB of binaries), deploy, try it on a phone.

### 2026-10-17 — Public contact email → shayan@pharmawallah.com

Owner: "update email for info, use shayan@pharmawallah.com". The site's one public address (`support@`, unified on
2026-10-12) is now `shayan@pharmawallah.com` in the footer, /contact, /about-us, /careers, /terms and /privacy.
`HUMAN_TODO.md` now asks for confirmation that this inbox receives mail. **Not changed:** the /contact and /careers
forms still deliver to `RECIPIENT_EMAIL` in `src/app/api/contact/route.ts` (a gmail address), and the admin
allowlists are untouched. Verification: `npx tsc --noEmit` exit 0, 0 errors; no `support@` remains in `src/`.
Not loaded in a browser. Privacy/terms version numbers were not bumped for a contact-address change.

### 2026-10-17 — ad-08 "One Platform. A Whole Pharmacy Lab." (GSAP reel)

"follow protocol" + the owner's 20-second, five-scene brief; asks: a different transition sound and transition type,
GSAP-like visuals made with GSAP, every element carefully aligned.

**Completed** (outside the repo, `~/personal/pharmawallah-marketing/video/ad-08/`)
- `ad-08.mp4` (music) and `ad-08-no-music.mp4`, 20 s, white ground. Hook (workspace, line icons drawn, formula chips,
  four real result cards) → phone rises, cards snap into a 2×2 orbit → the screen grows into a showcase card →
  Dilution, First-Order vs Zero-Order Kinetics, Calibration Curve, Dissolution, each under its real name in blue
  → "ONE PLATFORM. / ENDLESS POSSIBILITIES." grid that flies into the phone → column shutter → end card (mark,
  PHARMAWALLAH, tagline, phone on the real Dilution screen, EXPLORE FREE CALCULATORS, pharmawallah.com, "For study and practice").
- **GSAP**: one paused timeline, `render(t)` = `tl.seek(t)`, so it is still frame-exact. gsap 3.15 + DrawSVG, MotionPath
  and CustomEase are copied into `_kit/vendor/gsap/` (no npm). New transition types: magnet assemble, container
  transform, 3D carousel, deck deal, column shutter. None of the kit's eight styles is used.
- **Sound**: `music.mjs` gains `"cutSound": "swipe"` (a rising glass swipe and ping on the cut), `"snaps"`, and a
  `"bright"` style. These are opt-in: ad-07's bed regenerates byte-identical (md5).
- `capture.mjs` loads each tool on its own example chip from the app export. Each chart is shot with its marks
  hidden, and the marks are exported as the chart's own SVG, so DrawSVG redraws the real line over the real axes.

**Figures** — asserted on the captured pages, re-derived in Python: V₂ = 25.0000 (solvent 20.0000); t½ 6.93 h,
zero order 10.0 h; m 0.06635, c −0.0005, R² 0.9999, 6.82 µg/mL; 97.90 % at 60 min, 489.5 mg, 543.9 µg/mL.

**Architecture & Decisions** — Brand `#1C7BD9`/`#21B67A` used in place of the brief's `#2563EB`/`#4ADE80` (skill
override). "Half-Life & Kinetics" → the First-Order vs Zero-Order Kinetics Tool, because the Half-Life Calculator
has no graph and every card must show a real name. Each app capture is scaled by one factor (0.575) on the 90 px
margin grid. No count and no app claim are printed; the CTA is the website.

**Verification** — Stills read around every cut. They caught and led to fixes for: a wrapped headline mask leaking
its chars (MEMORY 212t), an empty card at the morph hand-off, a phone peeking at the bottom, and arcs crossing the
headline. `ffprobe`: h264 1080×1920 30/1, 20.0 s (+aac). −13.9 LUFS. The spectrogram shows the groove running to
the end. Eight frames pulled from the MP4 and read. **The music was never listened to.** I have not seen it inside
Instagram/TikTok or on a phone. No repo code changed, so tsc/build were not affected and were not re-run.

**Next** — the owner reviews ad-08.

### 2026-10-13 — AdSense remediation, phased (audit → technical → trust → content → verification)

User brief (5 phases, commit after each) + mid-task "also update the privacy policy and terms". Commits:
`2ed77ea` (P1), `49ebe5d` + `241643d` (P2), `35284b1` (P3), `4fa1cee` (P4), P5 (this entry). Not pushed.

**Completed**
- **P1** `AUDIT.md`: route-by-route crawl of a production build (unique words, titles, descriptions, OG,
  placeholder language, raw vs rendered). Found 46 pages with the home page's OG tags, 23 mixed-case URLs,
  70 thin indexable pages, 26 pages (all course units) whose content arrived only via JS streaming, and
  labelled empty ad boxes on every content page in production.
- **P2** `pageMeta()` (title/description/canonical/OG together, fitted to 60 / 120–160 chars); 23 calculator
  slugs → kebab-case with exact-match 301s in middleware and app/desktop slug migration; units read markdown
  synchronously; `src/lib/indexing.ts` noindex table feeding metadata + sitemap; sitemap lastmod from git;
  `ads.txt` exactly one line; ad units behind `NEXT_PUBLIC_ADS_ENABLED`, label removed; Organization JSON-LD
  site-wide, breadcrumbs on courses.
- **P3** bylines registry + neutral note (replacing "not independently reviewed"); Sources on 76/106 calculators;
  About "how it works"; EEA/UK/CH consent banner gating the loader; Battle Royale board first names only + opt-out
  + exact-name certificate search; `/community-guidelines`; privacy v3.2 and terms v1.2.
- **P4** ~230-word home intro (server slot); unfinished wording removed; AUC "Multiple doses — not available"
  mode removed; 25 draft guides + 25 briefs (status draft, unpublished); unit → guide links.
- **P5** final build + crawl: 185 indexable = 185 in sitemap, 0 noindex in sitemap, 0 duplicate titles/
  descriptions, 0 home OG, 0 mixed-case, 0 JS-only, 0 ad elements (built with dummy slot IDs set), loader on
  every page; `HUMAN_TODO.md`; `docs/AUDIT-after-2026-10-13.md`.

**Architecture & Decisions** — no formula changed. `/contact`, `/faqs`, `/careers` kept indexable though thin
(trust pages). The University of Karachi is presented as an address only. The consent banner is basic, not a
certified CMP (HUMAN_TODO). A crawl caught layout `robots` inheritance noindexing all units — fixed (MEMORY 205).
The clinical dosing errors from 2026-10-12 remain an owner decision.

**Verification** — `tsc` 0 errors (web, mobile, desktop). 259 tests pass, 0 fail (11 suites). Builds exit 0,
shared 88.6 kB, middleware 82.5 kB (+0.6: slug map, consent). `mobile:build` exit 0, 0 ad strings, no mixed-case
paths. Consent: DE without cookie → no loader + banner; PK → loader; DE + granted → loader. Board API returns first
names; partial name search → none; code without name → 400. NOT verified: Search Console, real EEA traffic,
the privacy migration on Supabase, a phone, Safari.

### 2026-10-12 — AdSense "low value content" remediation, two briefs (with session `pharma-wallah-da`)

"follow protocol" + a first remediation brief, then mid-task a "second-pass full-site audit" brief. Split by
message with peer session `pharma-wallah-da` (counts, hero, download/app claims, Terms/Privacy, nav, 6 tools);
this session (`-95`) took teaching content, guides, governance, structured data, podium, courses/MCQ claims,
clinical audit, SEO/domains, crawls and the reports.

**Completed**
- **Teaching layer**: `CalcLearn` + `_learn.ts` on 21 calculators (worked example equal to the page's own output
  and re-derived in Python, mistakes, limitations, references, related tools). **Five server-rendered guides**
  under `/guides` (dilution, dose calculations, kinetics, accuracy/recovery, PK), each with worked examples and
  practice questions. Citation registry (`references.ts`, 23 sources checked against publisher listings).
- **Trust**: `/editorial-policy`; a provenance line + "Report an error" on every calculator; review labels that
  cannot claim a review that did not happen; contact form prefills the subject (da).
- **Claims**: one `CALCULATOR_COUNT` (106) everywhere (da); Download page Android-only (da); hero h1 no longer
  concatenates and no longer says "The whole Pharm-D" (da); `/courses` "Complete Curriculum / HEC
  Standardized Syllabus / 4+ Modules" → derived 4 subjects · 22 units · Sem 1; Terms v1.1 and Privacy v3.1 (da),
  plus Privacy no longer claims ads are live and discloses the pathology test's Gemini marking.
- **Podium**: written in rank order (it listed the runner-up first in its text); deterministic tie-break; tests.
- **SEO**: JSON-LD (Organization/WebSite on `/`, BreadcrumbList on 106 tools and guides, Article on guides);
  sitemap + guides + editorial policy, − two closed-event soft-redirect pages; clinical links off `academia.`.
- **Audit**: live and local crawls, 660 MCQs validated, APK inspected, 12 clinical tools audited (read-only).

**Files** — see `docs/ADSENSE_REMEDIATION_CHANGELOG.md` (both sessions, file by file).

**Architecture & Decisions**
- No formula, data, env, DNS or hosting change. **Clinical dosing errors were found and NOT fixed** — vancomycin
  AUC/MIC target, renal apixaban tiers, pip-tazo band, geriatric renal rule, MME rotation, fentanyl patch
  (`docs/CALCULATOR_INVENTORY_AND_ACCURACY.md` §3). Owner decision.
- No ads added to new pages. The `academia.` → www redirect left to Vercel (MEMORY 201).
- The first brief's `adsense-remediation-audit.md` / `adsense-educational-content.md` were folded into
  `ADSENSE_FULL_AUDIT_REPORT.md` and `CONTENT_AND_FEATURE_AUDIT.md` rather than written twice.

**Verification**
- `npx tsc --noEmit` 0 errors; `-p mobile/tsconfig.json` 0. Tests **256 pass, 0 fail** (11 suites; +7
  content-governance, +4 ranking). `npm run build` (isolated copy of the final combined tree) exit 0, shared
  88.6 kB, middleware 81.9 kB. `npm run mobile:build` exit 0, 0 ad strings. Local production crawl: 241 routes,
  240 × 200 + `/dashboard` 307, 0 soft redirects, 228 sitemap URLs all 200, 113 pages with JSON-LD. Headless
  Chrome 1440/390 on 13 pages (both sessions): 0 overflow, 0 console errors; screenshots read.
- NOT verified: Search Console, AdSense account, real phone, Safari, dark mode, a real contact email, MCQ
  scoring, the APK rebuilt with today's content. Lint is not configured.

**Remaining** — `docs/ADSENSE_MANUAL_VERIFICATION.md`. **Next** — owner decides on the clinical tools, then
commit both sessions' work as one unit, deploy, resubmit the sitemap.


### 2026-10-11 — ad-07 "Dose Calculation + Animal Dose Dilution" reel

"follow protocol. use the skill" + the owner's 40-second, five-scene brief for two calculators.

**Completed** (all outside the repo, `~/personal/pharmawallah-marketing/video/ad-07/`)
- **Tools, mapped from the brief's names**: "Dose Calculation" → Animal Weight-Based Dose Calculator,
  "Animal Dose Dilution" → Serial Dose Calculator (both Pharmacology, one workflow). Headlines keep the brief's
  words; every on-screen tool name is the real one.
- `ad-07.mp4` (with music) and `ad-07-no-music.mp4`, 40 s. Hook: handwritten dose working → beat drop → the phone.
  Dose: real keystrokes, result card floats out (empty → 0.0143 → **0.1786 mg**), scroll to the Working.
  The card swells into a ring that opens on a 2.5 → 0.25 → 0.09 mg/mL tube graphic. Dilution: real keystrokes,
  result + stat tiles, the dilution formula, the bench plan, "Into the syringe" in green. Then two phones joined
  by an energy line with the names cut on the beat, and a white end card with the app home, GET THE
  PHARMAWALLAH APP NOW (4.4 s on screen) and the footer.
- `capture.mjs` types each tool's **own defaults** over CDP into the app export, one frame per keystroke.
  `crop.py` cuts the cards; `cues.json` drives the original tech-style music.

**Figures** — from the real pure modules (`_animal.ts`, `_math.ts`) in Node, re-derived in Python, and asserted
on the captured pages: 500 mg / 70 kg → 25 g → 0.1786 mg (178.57 µg, 7.143 mg/kg), 0.1786 mL at 1.0 mg/mL;
Carprofen 25 mg in 10 mL → 2.5 → 0.25 → 0.09 mg/mL, 0.1 mL = 0.009 mg (9 µg), 1:27.778×, within ±5%.

**Architecture & Decisions**
- Brief overrides per the skill: brand `#1C7BD9`/`#21B67A` (not `#2563EB`/`#4ADE80`), Outfit, no black ground
  (navy only as a scrim), CTA says **Android** (`pharmawallah.com/download`). Built on the kit, not Remotion
  (no new dependency). The brief's 40 s kept, over the skill's 18–24 s guideline, because the owner asked for it.
- Animal Dose scales linearly and its own page says it is for following the method: the ad claims no accuracy,
  labels the values "illustrative · the calculator's own default values", and carries "follow your approved
  protocol". No animal imagery.
- Supporting text reads "Animal Weight-Based Dose + Serial Dose", not the brief's labels, so a student can find
  the tools.

**Verification**
- Stills at every cut and mid-beat, read; fixed: clipped "?" glyphs, a sheen escaping the logo tile, near-empty
  frames before the iris, a headline ghost under scene 3. Capture defects found and fixed: smooth scroll and
  beyond-viewport clipping (MEMORY 197).
- `ffprobe`: h264 1080×1920 30/1, 40.0 s (+ aac on the music file); `ebur128` −14.0 LUFS; spectrogram shows the
  groove through the CTA. Seven frames pulled from the MP4 and read. **The music was never listened to** (no
  audio output here). Not seen inside Instagram/TikTok or on a phone. No repo code changed: tsc/build not re-run.

**Next** — the owner reviews ad-07 (post `-no-music` if using in-app audio).

### 2026-10-11 — ad-06 Biopharmaceutics calculators reel

"Follow protocol, use the skill" + the owner's "Biopharmaceutics Calculators Promotional Reel" brief (six scenes,
30–40 s, real interfaces, verified tools only, voice-over, sound design, thumbnail, README).

**Completed** (all outside the repo, `~/personal/pharmawallah-marketing/video/ad-06/`)
- 36 s, 1080×1920, 30 fps, six beats on the brief's storyboard: formula hook on a deep-navy (scrimmed gradient)
  ground with the real Half-Life screen assembling from flying strips → logo + six real result/graph cards →
  "Enter your data / Calculate with ease / Visualize your results / Explore more" over real keystrokes in
  Half-Life (Cl & Vd), Bioavailability and Clearance, the first- vs zero-order plot drawing itself, then the
  category list and all 14 hub tool names → the Dialysis Membrane practical typed, Calculate tapped, R² and k
  popping, scrolled to its real ln(1 − B) graph → "Built for pharmacy students" with pharmacy line icons →
  white end card (logo, "YOUR CALCULATIONS. SIMPLIFIED.", Explore Biopharmaceutics Calculators,
  PHARMAWALLAH.COM, "Visit now. Start exploring.", Free / No sign-up / Also in the Android app), 4.5 s.
- `capture.mjs` drives the app export (`mobile/out`) and records what each tool printed in `marks.json`;
  `crop.py` makes the card crops; `cues.json` → original tech-style bed (−14.1 LUFS);
  `VOICEOVER.md` + `voiceover.srt` (timed, **not recorded** — no TTS here); `README.md`; `cover.png`.

**Figures** — each printed by the real calculator and re-derived independently: t½ = 0.693 × 100 ÷ 8.66 =
8.00 h; F = (72/100) ÷ (100/100) = 72.0 %; CL = 500 ÷ 125 = 4.000 L/h; first/zero-order on the tool's defaults;
Dialysis sheet (the tool's own "Minutes, C1 = 1000 µg/mL" example) slope −0.01496 min⁻¹, intercept −0.000999,
R² 0.9997, k 0.01496 min⁻¹ = 0.0002494 s⁻¹ (Python least squares, same inputs).

**Architecture & Decisions**
- Brief overrides per the skill: brand `#1C7BD9`/`#21B67A` (not `#2563EB`/`#4ADE80`), Outfit, no black ground
  (the "dark" scenes are the navy-scrimmed gradient); kit, not Remotion (no new dependency).
- **Only fault-free paths are demonstrated** (MEMORY 196): AUC Estimator, Bioequivalence, Loading and
  Maintenance Dose appear as names only. Half-Life is shown via Cl & Vd — the kₑ route would have flashed a red
  validation error mid-typing, and its concentration method has a recorded fault.
- **No count on screen**: the app's category view says 16, the web hub lists 14.
- 36 s rather than the skill's 18–24 s: the brief asked for 30–40 s explicitly.
- Taken as `ad-06` because session `pharma-wallah-e0` created `ad-05` the same minute (agreed by message).

**Verification**
- Stills read at every beat and around every cut (3.95/4.15, 8.95/9.15, 19.4/19.62, 26.95/27.2, 31.45/31.75);
  they caught "MEET PHARMAWALLAH" wrapping over its subtitle and a card (fixed) and the kₑ error flash (method changed).
- Full render: `ad-06.mp4` (h264 1080×1920 30/1 + aac) and `ad-06-no-music.mp4`, both 36.0 s (`ffprobe`); eight frames
  pulled from the MP4 and read; `cover.png` = the end card at 35 s. **Each file is 116 MB (~26 Mbps)** — the kit's
  full-frame film grain, scaled by the camera every frame, is uncompressible: the grain-free white end card is
  1.2 MB per 4 s vs 11–19 MB elsewhere. Owner asked about the grain; removing it for ad-06 is the fix if wanted.
- Music checked by spectrogram (groove runs to ~35 s, no silent CTA) and `ebur128` (−14.1 LUFS). **Never listened to**
  — no audio output here. Not verified: inside the Instagram/TikTok UI, on a real phone. No repo code changed:
  `tsc`/build not affected and not re-run.

**Next** — the owner reviews ad-06, records the voice-over from `VOICEOVER.md`, and posts it.

### 2026-10-11 — ad-05 "No Internet? No Problem." (offline-app reel)

"follow protocol, use the skill" + the owner's "Offline Calculator App — Promotional Reel" brief (4 scenes,
20–25 s, real recordings only, a cover frame "NO INTERNET? NO PROBLEM.").

**Completed** (all outside the repo, `~/personal/pharmawallah-marketing/video/ad-05/`)
- **24 s, 1080×1920, 30 fps**, CUTS 3.8 · 8.5 · 16.5: an illustrated lab bench (notebook, the Procaine practical
  sheet, a flask) and a generic phone switching Wi-Fi and mobile data off → "NO INTERNET IN THE LAB?" → the real
  app home rising with light trails, "YOUR CALCULATORS. EVEN OFFLINE." → three real calculators sliding across
  the phone: **Dilution** (typed, live result), **Percentage Yield** (typed, Calculate tapped, the lab record),
  **Stability Kinetics** (Calculate tapped, the result card), under "CALCULATE." / "CHECK YOUR RESULTS." /
  "GET BACK TO WORK." → iris into a white/blue end card: "BUILT FOR PHARM-D STUDENTS.", the logo,
  "DOWNLOAD PHARMAWALLAH CALCULATORS", "Your pharmacy calculation companion.", `pharmawallah.com/download`.
- **Offline is proven, not drawn.** `capture.mjs` fails every non-local request and switches the browser fully
  offline before typing. Each result is asserted on the offline page. 0 external requests attempted. The
  "Offline" pill in each app bar is the app's own indicator (MEMORY 195).
- Figures, each the tool's own example and re-derived in Python: V₂ = 25 mL (solvent 20 mL); yield 84.71 %;
  Procaine HCl zero order, R² 0.9927, k 1.1314 % min⁻¹, t90 8.839 min.
- `cover.png` (from `poster.html`), `vo.srt` (the brief's voice-over, timed), `cues.json` + an original tech bed.

**Architecture & Decisions** — brief overrides as the skill says (brand hexes, Outfit, no black ground). There is
**no Play Store listing**, so the CTA is the live `/download` page (200; serves the 9,595,463 B v1.5 APK). There is
**no TTS on this machine**, so the voice-over is a script, not audio. The "student in a lab" is drawn as a bench,
not a person: no stock footage or invented people. Scene 1's phone is labelled in the source as an illustration.
Peer session `pharma-wallah-95` (ad-06) worked alongside; it shared the :4719 server, and the doc edits were sequenced by message.

**Verification** — `ad-05.mp4` (with music) and `ad-05-no-music.mp4`: h264 1080×1920 30/1, 24.0 s, aac,
−13.7 LUFS integrated. Ten frames pulled **from the MP4** and read; the chips settle on 25 mL, 20 mL, 84.71 % and
8.839 min. Stills read at every cut and mid-transition. Seven defects were caught and fixed: a doubled-ghost
gradient headline, a greyed gradient (text-shadow), a blank app bar over the panned result pages, a headline that
never exited under `sceneOuts`, and (from the owner's screenshot) an overlapping "Mobile data" tile label, the
bench not covering the frame's bottom edge, and a preview that showed past the frame. No repo code changed, so
`tsc`/build were unaffected and not re-run. Music **never listened to** (no audio output here). Not verified:
inside the Instagram/TikTok UI, a real phone.

**Next** — the owner reviews ad-05, records or adds the voice-over, and posts it (no-music file + in-app audio if preferred).

### 2026-10-10 — `reel-ads` skill + ad-04 "Stop Calculating the Hard Way"

"follow protocol" + the owner's reel-ad design brief → "setup this ads reels skill"; mid-task, a 25 s
reel spec for the calculators app.

**Completed**
- **New skill `.claude/skills/reel-ads/`** — `SKILL.md` (the procedure on the existing out-of-repo kit)
  and `BRIEF.md` (the owner's brief, verbatim). Registered in `SKILLS.md`; MEMORY 194; PROJECT_MAP.
  It names where the brief is **overridden and why**: brand `#1C7BD9`/`#21B67A` (not `#2563EB`/`#4ADE80`),
  Outfit (not Inter/Manrope), no black/navy ground, Android-only CTA (iOS/Windows apps were never shipped),
  offline = the Android app only, the kit not Remotion (no new dependency).
- **ad-04** (outside the repo, `~/personal/pharmawallah-marketing/video/ad-04/`): 25 s, 1080×1920, 30 fps.
  Notebook-and-calculator hook with a freeze → phone reveal with light trails → **real app frames**
  (typing into the Calibration Curve Calculator keystroke by keystroke, the real Calculate tap, the real
  graph) → rotating phone among real app cards on a deep-navy gradient → icon, "YOUR CALCULATIONS. ONE APP.",
  GET PHARMAWALLAH, pharmawallah.com. `capture.mjs` drives the app export over CDP to make the frames.
  Figures: the tool's own Paracetamol 243 nm example + unknown 0.452 AU → m 0.06635, c −0.0005, R² 0.9999,
  6.82 µg/mL (re-derived in Python).

**Architecture & Decisions** — the owner's restated hexes and "dark navy" were mapped to the brand
tokens and the navy-scrimmed gradient (CLAUDE.md §6 rule 15); "offline" is claimed for the Android app
only. Caveat (OFL, the brand's handwriting face) added to the kit for the notebook.

**Verification** — stills read at every cut and mid-beat; three defects found and fixed (camera island
over the app bar, scene-4 cards showing before the cut, an iris ghost). Full render (~17 min): `ad-04.mp4`
h264 1080×1920 30/1, 25.0 s, silent (the renderer's default); `ad-04-with-music.mp4` adds aac, −14.0 LUFS.
Eight frames pulled from the MP4 and read. The spectrogram caught the groove stopping at the 20 s impact
(a near-silent CTA) — the kit's `music.mjs` gained opt-in `grooveUntil` / `hits` cue fields (ads 01–03
unaffected, they don't set them). Music **never listened to** (no audio output here).
No repo code changed: `tsc`/build not affected and not re-run.

**Next** — the owner reviews ad-04 (post the `-no-music` file if using in-app audio).

### 2026-10-08 — "How to use the calculators" guide, APK v1.5, two ad videos

"follow protocol" + a 25-section brief for a universal, beginner-friendly calculator guide (web + app). Later
the same session: "app updated?" → build APK v1.5 (user: yes); an ad video (user: calculators + guide, 9:16,
~20 s); "visuals look bland"; a second ad "for this calculator we created" (taken as the Drug Stability
Kinetics Calculator); music — user asked for phonk or Montagem Gloria.

**Completed**
- **One guide, two surfaces.** `src/components/calculator-guide/` renders `/calculation-tools/how-to-use`
  (web) and `/how-to-use/` (app). An 8-step quick tour (Back / Next / Skip / Start calculating, "1 / 8",
  arrow keys, swipe, reduced motion) and the full guide: before you start, 12 steps, website, app, an
  honest website-vs-app table, 7 golden rules, the lab workflow, verification (with a clinical warning)
  and a quick-start cheat sheet. Illustrations are generic sketches on grid paper, never screenshots.
- **Written against the real UI, not the brief's assumptions** (MEMORY 190): results appear as you type;
  Calculate exists only on the 17 lab-record tools; no required-field asterisk (the empty result card says
  what is missing). Categories, counts and hub links come from each surface's registry.
- **Entry points**: hub hero link, "How to use" under every calculator (`(tools)/layout.tsx`), header
  Calculation Tools menu, sitemap; in the app a ? in every tool's bar and a "New here?" card on Home that
  shows until the first calculator is opened (Recent empty), then shrinks to a link — no new storage.
- **APK v1.5** (versionCode 6) built, signed and copied to `public/downloads/`; `/download` says 1.5.
  Built from the tree as it stood, so it also carries the peer session's uncommitted stability-kinetics edits.
- **Ads** — moved out of the repo the same day at the owner's request, to
  `/home/umar-hayat/personal/pharmawallah-marketing/video/` (README there; `/marketing/video/` gitignored here): a kit (`_kit/kit.css`, `kit.js`: aurora ground, drifting molecule and
  formula motifs, word-by-word reveals, glass, sheens, bursts, diagonal wipes, camera push), a
  frame-exact renderer (`render.mjs`, CDP → ffmpeg) and an **original synthesised phonk bed**
  (`_kit/music.mjs`: cowbell riff, gliding distorted 808, clap, hat rolls, plus whooshes/clicks/chimes/
  riser/impact placed from each ad's `cues.json`, mastered to −14 LUFS). `ad-01` (calculators + guide,
  20 s) and `ad-02` (Drug Stability Kinetics, 22 s; every figure from `analyseStability()` on the sheet).
  Each renders with music and as `-no-music`.

**Files**
- New: `src/components/calculator-guide/{CalculatorGuide,GuideTour,illustrations}.tsx`, `content.ts`,
  `guide.css`, `index.ts`; `src/app/(site)/calculation-tools/how-to-use/page.tsx`; `mobile/app/how-to-use/page.tsx`;
  `.gitignore` (`/marketing/video/`).
- Edited: `(tools)/layout.tsx`, `calculation-tools/page.tsx`, `menuData.tsx`, `menuMeta.tsx`, `sitemap.ts`,
  `mobile/app/_components/{MobileShell,ToolHub}.tsx`, `mobile/tailwind.config.ts`, `android/app/build.gradle`,
  `download/DownloadClient.tsx`, `public/downloads/pharmawallah-calculators.apk`.
- Knowledge: this file, `.claude/{MEMORY (190–193), PROJECT_MAP, BRAND_KIT}.md`.

**Architecture & Decisions**
- **A page, not a modal**: no dialog primitive exists; an inline tour needs no focus trap and behaves the
  same in the WebView. No new dependency.
- **The app guide lives at `mobile/app/how-to-use/`** — the route generator wipes `calculation-tools/`
  subfolders, and `MobileShell` needed `isGuide` to give it a back bar (MEMORY 191).
- **Music**: Montagem Gloria is a commercial track, so it is not embedded. The bed is original; the
  `-no-music` file is for adding licensed trending audio inside Instagram/TikTok.
- Dark mode not built: neither the site nor the app has a reachable dark theme (semantic tokens used).
  The desktop (Tauri) target does not get the guide yet.

**Verification**
- `npx tsc --noEmit` → **0 errors**. `npm run mobile:build` (isolated copy) → exit 0, see §9.
- Dev server (isolated copy, :3241) + headless Chrome over CDP at 1440×900 and 390×844 (touch): all 18
  sections present; tour Next ×8, Back, ←, Skip (focus lands on Quick start), "Start calculating" on the
  last step; **0 overflow, 0 console errors** at both widths. Own title + www canonical; the guide link is
  on the hub, a calculator page, the header and the sitemap. Screenshots read; they caught a tour that
  jumped in height, a graph label collision and a dash in a sample result — fixed.
- App export served statically, 390×844 touch: first-use card shown with empty Recent and replaced by a
  link after opening a tool; ? in the tool bar (star kept); guide has a back bar, no star, no disclaimer;
  swipe advances the tour; back returns Home; 0 overflow, 0 console errors. Screenshots read.
- APK: `aapt` → versionCode 6 / 1.5; `apksigner` SHA-256 equal to the v1.4 file's; 106 tools + guide inside.
- Videos: `ffprobe` → 1080×1920, 30 fps, h264 + aac; stills and frames from the final MP4s read; music
  checked by spectrogram and `ebur128` (−14.0 LUFS, −1.5 dBTP). **The music was never listened to** —
  there is no audio output here; listen before posting.
- **NOT verified:** `npm run build` for the website was not re-run by this session (the user stopped it;
  the peer session reports exit 0 with these changes present); a real phone; the APK installed on a device;
  dark mode. Lint is not configured.

**Remaining**
- Commit and deploy (the protocol forbids it here): the APK must ship with the site.
- The owner posts the **no-music** versions; the ads are outside the repo and never committed.

**Next**
- Deploy, then post `ad-01`, and point the first-use traffic at the guide.

---

> Older entries are in `.claude/history/2026-10.md`: 2026-10-08 (Drug Stability Kinetics Calculator); and `.claude/history/2026-09.md`: 2026-09-30 (Battle Royale names/certificates/ranking), 2026-09-29 (Battle Royale podium, certificates, close button), 2026-09-27 (Battle Royale v1/v2), 2026-09-23/24 (ads per page, lesson files), 2026-09-23 (AdSense quality pass), 2026-09-22 (iOS target, Windows desktop target), 2026-09-22 (Dissolution Rate Constant Calculator, calculator-refinement skill), 2026-09-20 (brand kit), 2026-09-13/20 (pharmacy counter, calculator migration finish, disk diffusion, AI Guide, encyclopedia, community, Molecular Lab, about-us, TLC/colony, APK v1.1–1.3), 2026-09-13 (six analytical-practical calculators, calculation-tools hub rebuild, loading screen, dashboard rebuild, header app CTA +
> Master Formula, auth pages, redesign Phase 0, top-design landing page, eight laboratory tools) and
> 2026-09-12 (ADME landing page, AdSense, Outfit, PWA removal, APK distribution, Android app,
> bootstrap).

---

## 9. Verification Baselines

> **Load-bearing.** Without these a future session cannot tell its own breakage from pre-existing
> breakage. Re-measure and update them whenever they change.

| Check | Command | Baseline (last re-measured 2026-09-16) |
| --- | --- | --- |
| Type-check | `npx tsc --noEmit` | **PASSES — 0 errors, re-measured 2026-09-20** after the calculator migration finished (104/104 on the kit). The 4 transient errors a peer recorded in `(tools)/opioid-mme-calculator/page.tsx:229-231` were a `Set` spread needing `downlevelIteration` (gotcha 37) during that migration and are **fixed** — use `Array.from(...)`, not a spread, in this tsconfig. Any error you see now is yours. The app project: `npx tsc --noEmit -p mobile/tsconfig.json` → 0 errors (needs a generated `mobile/app/_generated`, i.e. one `npm run mobile:build`). |
| Lint | `npm run lint` | **NOT AVAILABLE.** No ESLint config; the command opens an interactive setup prompt. Do not report lint as passing. |
| Build | `npm run build` | **PASSES — re-verified 2026-10-20** after the Virtual Labs (exit 0, shared JS 88.8 kB, middleware 82.5 kB, lab pages 198–202 kB first load; three.js only in async chunks). **2026-10-18** after the Osteology Lab (exit 0, shared JS 88.7 kB, middleware 82.5 kB; lesson pages ~184 kB first load; three.js only in lazy chunks). **2026-10-08** after the Drug Stability Kinetics Calculator (exit 0, shared JS 88.6 kB, middleware 81.9 kB, the tool 14.9 kB / 287 kB first load after the same-day refinement). **2026-09-30** after the Battle Royale certificate search (exit 0, shared JS 88.6 kB, middleware 81.9 kB). **2026-09-29** after the Battle Royale podium/certificates work (isolated copy): exit 0, shared JS **88.6 kB**, middleware **81.9 kB**, `/` 223 kB first load. **Earlier: PASSES — re-verified 2026-09-20 after the calculator migration finished** (isolated copy of the tree; peers had agreed not to build in the shared root): exit 0, shared JS **88.5 kB**, middleware **81.9 kB**. All 104 calculators then swept against `next start` at 1440×900 and 390×844 — 104/104 HTTP 200, hydrated, **0 exceptions, 0 console errors, 0 horizontal overflow**. **Also 2026-09-20 after the AI Guide rebuild** (isolated copy; the peer dev server on :3000 was left alone): exit 0, shared JS **88.5 kB** (unchanged), `/ai-guide` **9.7 kB / 150 kB first load**, `/books-library` no longer emitted. **Also 2026-09-20, after the Disk Diffusion Lab rebuild** (in an isolated copy of the tree — two peer `next dev` servers were running on the shared root and had already corrupted its `.next`, MEMORY gotcha 126): exit 0, **277 route lines**, shared JS **88.5 kB**, middleware 81.9 kB, `/simulations/disk-diffusion` 49.1 kB / **241 kB first load**; jsPDF confirmed absent from the page chunk and present in its own, so the report no longer rides in the first load. One extra expected warning: `buffer-lab`'s ambiguous `duration-[2000ms]` class. **Earlier the same day: PASSES — after the `/encyclopedia` redesign** (in an isolated copy of the tree, the peer sessions' dev servers left alone): exit 0, shared JS **88.5 kB**, `/encyclopedia` **16.3 kB / 113 kB first load**, `/molecular-lab` 60.2 kB / 149 kB. OpenChemLib (1.09 MB) and 3Dmol (568 KB) are lazy chunks only — grep the built shared chunks for both and expect **0 hits** before shipping any new 3D consumer. Two 404s on `/_vercel/insights` and `/_vercel/speed-insights` appear under `next start` locally; they come from `Analytics` / `SpeedInsights` in `src/app/layout.tsx` and only resolve on Vercel — not a defect. **Earlier: PASSES — 2026-09-16 after Molecular Lab** (in an isolated copy of the tree, dev server left up): exit 0, shared JS **88.4 kB**, middleware 81.9 kB, `/molecular-lab` 59.5 kB / 148 kB first load, `resources.<hash>.json` 1.35 MB in `static/media`. The build also prints several `Dynamic server usage` stack traces (tournament leaderboard, DailyMed, AMR routes) — logged by those handlers, non-fatal, not new. **Before that** (again after the simple `/about-us`: exit 0, shared JS 88.3 kB, `/about-us` 106 kB first load). Earlier the same day: exit 0 in ~2.5 min, 252 route lines, shared JS **88.3 kB**, middleware 81.9 kB; `/calculation-tools/rf-value-calculator` 184 kB and `/cfu-calculator` 183 kB first load; `.next/static/media/opencv.<hash>.js` 10.8 MB emitted as an asset. Same expected warnings as below. **Earlier (2026-09-12):** with the dev server stopped, after the AdSense work (the first successful run since the PWA removal, the shadcn migration and the Outfit switch): exit 0, ~170 routes, middleware 81.8 kB, shared JS 87.8 kB. Stop `npm run dev` first — they share `.next` and corrupt each other (§7 Known Issue 10). **PASSES with a populated `.env`** — exit 0, ~170 routes emitted, middleware 81.8 kB, shared JS 87.8 kB. Only `/_not-found` is static; everything else is `ƒ` (dynamic, server-rendered on demand). **Without `.env` it FAILS**: `Missing environment variable: NEXT_PUBLIC_SUPABASE_URL` while collecting page data for `/api/admin/registrations`. Expected non-fatal warnings: the `@supabase/supabase-js` Edge-runtime `process.version` notice, the stale `caniuse-lite` Browserslist notice, and two webpack "Serializing big strings" cache notices. |
| Mobile build | `npm run mobile:build` | **PASSES (2026-10-08)** after the calculator guide (isolated copy): exit 0, `/how-to-use` 18.7 kB / 162 kB, shared JS **88.3 kB**, main CSS **92,719 B** (+4 kB: the guide's utilities, via the new `calculator-guide` glob), **0** ad strings. **Earlier: PASSES (2026-09-22, ~3 min)** — re-measured after the iOS target landed and the three Capacitor plugins were installed: exit 0, **106 HTML files** under `mobile/out/calculation-tools/` (105 tools + the hub), CSS **88,734 bytes**, shared JS **88.3 kB**; **0** files match the JWT-shaped secret pattern and **0** contain an ad string. This one export now feeds three native targets — `cap sync android`, `cap sync ios` and the Tauri desktop build. **Earlier: PASSES (2026-09-20, ~2 min)** — after the calculator migration and the liquid-glass kit change: exit 0, **108 HTML files**, 106 entries under `mobile/out/calculation-tools/`, CSS **84,243 + 4,210 bytes**. The glass ships to the APK: `calcSheen`/`calcTide` and the `[@media(hover:none)]` phone path are all present in the exported CSS, and the export renders at 390 px with `backdrop-filter: none`. **Earlier (2026-09-16, ~2 min)** — 105 HTML files under `mobile/out/calculation-tools/`, home `/` 125 kB first load, shared JS 88.2 kB, CSS **113,194 bytes**, `mobile/out` 22 MB (OpenCV.js is 10.8 MB of it). Secret scan: use the JWT-shaped pattern (gotcha 90). **Earlier (v1.1):** 109 static pages, 108 HTML files, 105 under `mobile/out/calculation-tools/`, shared JS 87.9 kB, CSS in two files **98,751 + 4,210 bytes**, 12 MB (re-measured 2026-09-13 by the v1.1 APK build, with 85 of 104 tools on the kit; 103,829 + 4,210 before). Independent of `.env` and safe to run while `npm run dev` is up (separate `mobile/.next`). **Also assert zero ad strings in `mobile/out`** — see `.claude/skills/adsense-monetization/SKILL.md`. A ~10 KB stylesheet is the silent Tailwind failure (gotcha 23). |
| iOS compile | `.github/workflows/ios-app.yml` (Actions → "iOS app" → Run workflow) | **PASSES — first ever run 2026-09-22, `macos-latest`, 5m22s, commit `5b8788e`, conclusion `success`, every step green.** Builds twice with no Apple account and no secrets: **Simulator** (Debug, `-sdk iphonesimulator`) and the **arm64 device slice** (Release, `-sdk iphoneos`, `CODE_SIGNING_ALLOWED=NO`), and uploads `App.app` as the `pharmawallah-ios-simulator-app` artifact. Two guards run before the compile and are part of the baseline: `Info.plist` must request **no permissions**, and **≥100** calculator pages must be in the synced bundle. Needs the committed shared scheme `ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme` (MEMORY gotcha 159). **This is a compile baseline only** — no signed `.ipa`, and the app has still never been *run* (§7 Known Issue 21). Do not report the iOS app as tested on a device. |
| iOS sync | `npm run ios:sync` (i.e. `cap sync ios`) | **PASSES (2026-09-22, ~4 s after the build)** — exit 0 on **Linux**; Capacitor 8 uses the SPM template so no CocoaPods is involved. Reports **3 Capacitor plugins for ios** (`@capacitor/filesystem@8.1.3`, `@capacitor/keyboard@8.0.5`, `@capacitor/share@8.0.2`) and rewrites `ios/App/CapApp-SPM/Package.swift`. Also assert: `Info.plist` parses with `plistlib` and has **zero** `*UsageDescription` keys, and `ios/App/App/public/calculation-tools` holds one `index.html` per tool. **There is no iOS build baseline** — compiling needs Xcode on macOS and has never been done (§7 Known Issue 21). Do not report the iOS app as building. |
| APK | `npm run mobile:apk` | **PASSES (2026-10-08, v1.5 / versionCode 6)** — signed V2 release APK **9,595,463 B (9.2 MB)**, certificate SHA-256 `afe4c18e…5b03` **identical to v1.4 (checked against `git show HEAD:` of the old file)**, so it installs as an update; 106 tool pages + `how-to-use/index.html` inside. **Earlier: PASSES (2026-09-20, v1.4 / versionCode 5, ~2 min)** — signed V2 release APK **9,369,674 B (8.9 MB)**, certificate SHA-256 `afe4c18e…5b03` **unchanged from v1.3**, so it installs as an update; published file byte-identical to the Gradle output; 104 tool pages inside. **Earlier (2026-09-16, v1.3 / versionCode 4, ~2.5 min)** — signed V2 release APK **9,347,799 B** (8.9 MB), same certificate SHA-256 `afe4c18e…5b03` as v1.2; published file byte-identical to the Gradle output. **Earlier:** (2026-09-14, v1.2 / versionCode 3, built by `pharma-wallah-4b` — new launcher icon + redesigned Serial Dose tool) — signed V2 release APK, 5,945,495 B, copied to `public/downloads/`; same certificate as v1.0/v1.1. Needs JDK 21 (auto-selected) and `android/keystore.properties`. Check `aapt dump badging` for the version and `apksigner verify --print-certs` for the certificate. |
| Tests | `node --test scripts/pharmacy-counter.test.mts` · `node --test scripts/tlc-rf.test.mts scripts/colony-counter.test.mts` · `node --test scripts/molecular-lab.test.mts` · `node --test scripts/community.test.mts` · `node --test scripts/ai-guide.test.mts` · `node --test scripts/dissolution-rate.test.mts` · `node --test scripts/split-for-ads.test.mts` · `node --test scripts/battle-royale.test.mts` · `node --test scripts/stability-kinetics.test.mts` · `node --test scripts/content-governance.test.mts` | **47 pass, 0 fail** (2026-09-20, Community Pharmacy pure layer, ~0.5 s — case-data integrity, the check grader, verification truths, labels, expiry, inventory, the calculators, scoring) · **41 pass, 0 fail** (2026-09-16; 21 TLC + 20 colony, ~10 s) · **21 pass, 0 fail** (2026-09-16, Molecular Lab, ~12 s, real OpenChemLib) · **19 pass, 0 fail** (2026-09-20, community pure layer, <1 s) · **34 pass, 0 fail** (2026-09-20, AI Guide pure layer — request clamps, Gemini history rules, NDJSON framing, study modes — <1 s). · **28 pass, 0 fail** (2026-09-22, Dissolution Rate Constant pure layer — every column of the supplied practical sheet, both k columns proven distinct, the average against 0.000291833 and against each rejected averaging range, division-by-zero paths, duplicate/backwards times, both notations — <1 s). · **6 pass, 0 fail** (2026-09-24, lesson ad spacing — heading-only breaks, never inside a code fence, word-count gaps, lossless over all 69 lesson files, <1 s). · **23 pass, 0 fail** (2026-09-30, Battle Royale — display helpers, schema round-trips, station, titles, certificate search input). · **26 pass, 0 fail** (2026-10-08, Drug Stability Kinetics — % remaining against the sheet, residuals, the two-point tie, all three fits against an independent covariance computation, order selection on exact zero/first/second-order data, k/t½/t90 per order, k ≤ 0, validation, interpretation, <1 s). **8 pass, 0 fail** (2026-10-13, content governance — incl. drafts, and the publish-only-with-reviewer rule). Battle Royale is **29** since 2026-10-13 (+2 name privacy). **17 pass, 0 fail** (2026-10-18, Osteology Lab — content completeness, every zName against the exported models, GLB node names, assets on disk, question determinism/keys/answers, presets fill, grading, token tamper). **42 pass, 0 fail** (2026-10-20, Virtual Labs — catalogue, engine, all four sciences, scripted runs, asset manifest). Total across all suites: **318**. These cover eleven features' pure modules only — there is no framework, no CI, and nothing else is tested. Report them by name. **The community's SQL is verified separately** by running its migration twice against a throwaway local Postgres 16 and asserting RLS from a `nobypassrls` role — see the `community-system` skill. |

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
