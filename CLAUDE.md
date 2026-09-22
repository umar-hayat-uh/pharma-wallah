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
  `src/lib/courses/subjects/` holds **14 files** and `public/content/` holds markdown for **10+
  subjects**. Nine subject files are dead code *and use a different data shape* (`*_META` +
  `*Units` + `*_DIFF_BADGE`) than the registry's `SubjectMeta` interface. A tenth,
  `natural-toxins.ts`, *is* in `SubjectMeta` shape but is still not registered.
- **Calculation tools hub.** 105 tool directories exist; `HUB_SUBJECTS` in
  `src/app/(site)/calculation-tools/tool-index.ts` lists **99** across 10 categories (re-counted
  2026-09-22 by parsing the file: Pharmaceutical Chemistry 16, Clinical & Hospital Pharmacy 18,
  Pharmaceutics **17**, Biopharmaceutics & PK 14, Pharmaceutical Analysis 10, Unit Conversion 6,
  Pharmacology 6, Microbiology 6, Pharmaceutical Engineering 4, Physiology 2 — Pharmaceutics gained
  the Dissolution Rate Constant Calculator on 2026-09-22; the previously recorded "93" was stale). Six of the remainder are deliberately
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
21. **The iOS app has never been compiled, run or installed.** `ios/` was created, configured and
    synced from a Linux machine, which Capacitor 8 supports because it uses Swift Package Manager
    — but Xcode is what turns it into an app, and no Mac was available. Everything downstream of
    `cap sync` is therefore **unproven**: the build itself, the launch-screen handover, the
    keyboard accessory bar, the share sheet, `capacitor://localhost` as a secure origin, and any
    App Store submission. **Owner action:** run `npm run ios:open` on a Mac and build once.
20. **The landing page advertises the wrong calculator count.** `STATS.calculators` in
    `src/components/Home/landing/data.ts` is **97**; there are **104** tool directories and **98**
    registered on the hub. The hero ruler, timecode and pillar copy all derive from that constant,
    so `/` currently tells visitors "97 tools" while `/calculation-tools` and the Android app both
    say 104. The file's own comment says these numbers must never be rounded "for effect" because a
    pharmacy student will check — the same argument applies to their being stale. **One-line fix**
    (`calculators: 104`), deliberately not made here: it is user-visible product copy and was outside
    this task's scope. It matters now because the figure is about to be used in marketing —
    see `.claude/BRAND_KIT.md` §8.
19. **The pharmacy counter's clinical content has not been reviewed by a pharmacist.** The ten
    cases, 31 medicine monographs, counselling points, interaction findings and dose ranges in
    `src/components/Simulations/CommunityPharmacy/data/` were written as teaching values and are
    internally consistent and unit-tested, but nobody qualified has read them. Every screen says
    "educational use only" and names the limitation. **Owner action before this is used with
    students:** have a pharmacist read `data/medicines.ts` and `data/scenarios.ts`.
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

### 2026-09-22 — iOS target added: offline calculators app via Capacitor (`ios/`)

Session `pharma-wallah-9d`, "follow protocol" + a 34-section user specification. Two peer sessions
were live in the same tree throughout (`-92` a new calculator, `-b8` the Tauri desktop target);
file ownership was agreed by message before any shared file was touched.

**Completed**
- **`ios/` exists and is committed** — a Capacitor 8 Xcode project wrapping the *same*
  `mobile/out` bundle the APK wraps. 105 calculators plus the hub, no login, no API, no account.
  20 files tracked; the copied web bundle and the generated configs are not.
- **It was scaffolded and is maintained entirely on Linux.** Capacitor 8 uses the **SPM** template
  (`ios-spm-template.tar.gz`), not CocoaPods, so `cap add ios` and `cap sync ios` are pure Node.
  Only compiling needs a Mac. This is the fact that made the whole target deliverable here.
- **Brand icon and launch screen generated, not placeholder.** New
  `scripts/generate-ios-assets.mjs` un-mattes the mark out of `public/icons/icon-1.png`, writes a
  1024² opaque white-ground `AppIcon-512@2x.png`, and composes a flat-brandBlue launch screen
  carrying the mark on a white plate, "PharmaWallah" and "Offline Pharmaceutical Calculator Suite"
  **set in Outfit** — librsvg finds the real brand face through a fontconfig file the script
  writes. Capacitor's default icon and splash are gone.
- **Info.plist made App-Store-honest**: display name `PharmaWallah` (iOS truncates the home-screen
  label at ~12 characters, so the Android name would not fit), `armv7` → `arm64`,
  `ITSAppUsesNonExemptEncryption = false`, and **zero permission usage keys** — the app asks for
  nothing.
- **Keyboard fixed for iOS specifically.** Every calculator input is `type="number"
  inputMode="decimal"`, which on iOS is the 12-key pad — **and that pad has no return key**. New
  `mobile/app/_components/NativeShell.tsx` turns on Capacitor's accessory bar and re-centres a
  focused field that lands under the keyboard. It returns early unless
  `Capacitor.getPlatform() === "ios"`, so Android is untouched.
- **Download/Print → Share in the packaged apps.** `LabActions` now offers the platform share
  sheet: the lab-record card is drawn to a canvas, written to `Directory.Cache` and handed to
  iOS/Android via `@capacitor/share`. Nothing is uploaded. New
  `src/components/calculators/native-share.ts`; `LabReport` gained `reportPngDataUrl` by
  extracting the canvas step out of `downloadReportPng` (no behaviour change to the website).
- **The three calculators that link out no longer mislead offline.** New shared `SourceLink`
  renders a plain anchor on the website; in the app it says "opens a web page", and while the
  device is offline it stops being a link and says it needs a connection.
  `qt-interval-calculator`, `reconstitution-calculator`, `renal-dosing-adjuster`.
- **`npm run ios:build` / `ios:sync` / `ios:open` / `ios:assets`** added alongside the `mobile:*`
  scripts. `ios:build` is an alias of `mobile:build` — there is one bundle, not two.

**Files**
- New: `ios/` (20 tracked files), `scripts/generate-ios-assets.mjs`,
  `mobile/app/_components/NativeShell.tsx`, `src/components/calculators/{native-share.ts,SourceLink.tsx}`,
  `.claude/skills/ios-app-capacitor/SKILL.md`.
- Edited: `capacitor.config.ts` (`ios` block, `server.iosScheme`, `plugins.Keyboard`),
  `package.json` (4 scripts + 3 plugin dependencies), `pnpm-lock.yaml`, `.gitignore`,
  `.vercelignore`, `mobile/app/layout.tsx` (mount + a derived description), `mobile/README.md`
  (rewritten to cover both platforms), `src/components/calculators/{LabReport.tsx,index.ts}`,
  three tool pages, `.claude/SKILLS.md`.

**Architecture & Decisions**
- **One bundle, two platforms.** iOS was added as a Capacitor *platform*, not a second project.
  `mobile/out` is copied into both native projects, so a calculator fixed once is fixed in three
  places. The alternative — an iOS-specific export — would have duplicated the thing this repo has
  worked hardest to keep single.
- **Brand tokens over the spec's hexes.** The brief names #2563EB/#4ADE80; the product is
  #1C7BD9/#21B67A. Same call the Molecular Lab, the pharmacy counter and the calculator-refinement
  skill made, and here it is load-bearing rather than cosmetic: the native launch screen, the
  WKWebView background and the web splash must be the *same* blue or startup flashes.
- **`ios.contentInset: "never"`.** The web layer already pads with `env(safe-area-inset-*)` under
  `viewportFit: cover`; WKWebView's default automatic inset would double every one of those gaps.
- **`server.iosScheme` pinned to `capacitor`** and commented: the origin is what `localStorage` is
  keyed to, so changing it later would silently empty every student's Recent and Saved list.
- **Scope was put to the user and narrowed deliberately.** The brief also asks for calculation
  history, a Pharmaceutical Values browser and export — all of which live in the shared `mobile/`
  layer and would change Android too. The user chose "iOS target only", and separately chose to
  install the three Capacitor plugins. Both choices are recorded here because the brief's §13/§8
  remain unbuilt by decision, not by oversight.
- **The icon is opaque and inset to 700/1024 px**; the splash artwork fits a centred 1257 px box
  because `scaleAspectFill` on a square shows only ~46% of the width on a 19.5:9 iPhone. Both
  constants are derived in the script's comments rather than tuned by eye.

**Verification**
- `npx tsc --noEmit` → **0 errors** (whole repo, shared tree, after the install).
- `npm run mobile:build` → exit 0. **106 HTML pages** under `mobile/out/calculation-tools/`
  (105 tools + hub), CSS **88,734 bytes** (healthy — ~10 kB is the silent Tailwind failure,
  gotcha 23), shared JS 88.3 kB.
- `npx cap sync ios` → exit 0, **3 Capacitor plugins found**, `Package.swift` rewritten.
  `npx cap sync android` → exit 0, same 3 plugins.
- **Android regression:** `./gradlew assembleDebug` with the three new plugins — see §9.
- Bundle audit: **0** files matching the JWT-shaped secret pattern, **0** ad strings in
  `mobile/out`. External origins in the chunks were read in context and are all inert — Next's own
  font-preconnect constants, jsPDF's unreachable `pdfobject` CDN string, and library error-message
  URLs. Only **one** clickable external anchor existed across the tool sources; it and the two
  data-driven ones now go through `SourceLink`.
- `Info.plist` parses with `plistlib` and reports **zero** `*UsageDescription` keys.
- The generated icon was rendered **under a real iOS superellipse mask** and read — nothing
  clipped. The splash was **cropped to a 19.5:9 iPhone's aspect-fill** and read — nothing cropped,
  type legible, Outfit confirmed by comparing letterforms against a fallback render.
- **NOT verified, and cannot be from this machine:** anything that needs Xcode. No compile, no
  Simulator, no device, no archive, no App Store upload. The share sheet, the keyboard accessory
  bar, `capacitor://localhost` as a secure origin and the launch screen on real hardware are all
  **unexercised**. `npm run build` (web) was not re-run — no web-only file changed except the
  three tool pages and the shared kit, which the mobile build compiles. Lint is not configured;
  the `node --test` suites cover none of this.

**Remaining**
- **Someone with a Mac must run `npm run ios:open` and build once.** That is the only outstanding
  step, and until it happens the target is unproven.
- Commit (the protocol forbids it here). The tree also carries two peer sessions' work.
- Calculation history, a Pharmaceutical Values browser and CSV/PDF export are **not built** — the
  user scoped them out of this task.
- No Apple Developer team, bundle provisioning or App Store Connect record exists yet.

**Next**
- Open the project in Xcode on a Mac, run it on a simulator, and check the three things only a
  device can show: the launch-screen handover, the keyboard accessory bar, and the share sheet.

### 2026-09-22 — Windows desktop target: Tauri 2, fully offline (`desktop/` + `src-tauri/`)

Session `pharma-wallah-b8`, "follow protocol" + a 30-section user specification. Three peer
sessions were live in the same tree throughout (`-92` dissolution-rate calculator, `-9d` iOS
Capacitor target, `-6c`); file ownership was agreed by message before any shared file was touched.

**Completed**
- **A third build target.** `desktop/` is a new Next project root (a sibling of `mobile/`) that
  statically exports the calculators plus six desktop-only sections; `src-tauri/` wraps that export
  in a Windows program. The website, `mobile/` and `android/` are untouched.
- **Every calculator ships.** `scripts/generate-desktop-routes.mjs` emits a one-line re-export per
  tool directory, exactly as the Android generator does, so the calculators live in exactly one
  place and all three targets compile the same file. 105 tools in this build (104 + session 92's
  new dissolution-rate calculator, picked up automatically).
- **Six sections around them**: a Dashboard whose figures are *counted, never typed*; the calculator
  index grouped by the shared registry's ten real categories; a **searchable values library** (212
  rows); a **formula reference** (40 formulas, every symbol defined, each linked to its calculator);
  a **unit converter**; **calculation history**; and Settings.
- **Save / Print / Export on all 105 calculators without editing one of them.** `ToolFrame` reads
  the calculation out of the rendered DOM through four anchors the shared kit guarantees (the `h1`,
  labelled inputs, the `aria-live` result card, the FormulaNote panel) — see Architecture.
- **Export is local**: PDF (jsPDF, lazily imported), CSV (RFC 4180, BOM so Excel reads UTF-8) and
  text, written by a Rust command into Documents\PharmaWallah, or through an object-URL download in
  a browser. Printing is the WebView's own dialog, with a print stylesheet that drops the chrome.
- **Icons are the PharmaWallah mark, not Tauri's.** `scripts/generate-desktop-icons.mjs` builds
  seven PNGs and a 7-size `icon.ico` from `public/icons/icon-512x512.png`; the ICO container is
  assembled by hand because sharp cannot write one and an icon library would be a dependency with
  nothing else to do.
- **`npm run desktop:audit`** is a new, load-bearing check: it reads the built export and fails on
  an ad network, analytics, a Supabase/Mongo/Upstash/Gemini client, a CDN script, a secret-shaped
  string, or **any remote `src=`/`href=` subresource in the emitted HTML**. It is wired into
  `tauri:build` between the frontend build and the Rust build.

**Files**
- New `desktop/` — `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`,
  `README.md`, `app/{globals.css,layout.tsx,page.tsx,favicon.ico}`, six section pages,
  `app/calculation-tools/{page,layout}.tsx`, `app/_components/` (11 files), `app/_data/`
  (`catalog.ts`, `values.ts`, `formulas.ts`, `units.ts`), `app/_lib/`
  (`bridge.ts`, `store.ts`, `snapshot.ts`, `export.ts`).
- New `src-tauri/` — `Cargo.toml`, `build.rs`, `tauri.conf.json`, `capabilities/default.json`,
  `src/{main,lib}.rs`, `icons/` (8 files), `.gitignore`.
- New `scripts/{generate-desktop-routes,generate-desktop-icons,audit-desktop-offline}.mjs`.
- Root, additive only: `package.json` (7 scripts + `@tauri-apps/cli` devDependency),
  `.gitignore`, `.vercelignore`, `tsconfig.json` (`exclude` += `desktop`, `src-tauri`).
- Knowledge: this file (§1, §7, §8, §9), `.claude/MEMORY.md` (gotchas 148–151),
  `.claude/PROJECT_MAP.md`, `.claude/ROADMAP.md`.

**Architecture & Decisions**
- **The calculators needed no change at all, and that was verifiable up front.** A grep for
  `fetch(`, `axios`, `XMLHttpRequest`, `sendBeacon`, `EventSource`, `WebSocket` and remote `<img>`
  across all 104 tool pages *and* the shared kit returns **zero hits** — the pillar was already
  pure-local. The spec's "audit and remove network dependencies" work therefore turned out to be
  proving the property rather than changing anything, which is why `desktop:audit` exists.
- **`NEXT_PUBLIC_IS_MOBILE_APP=true` is set by the desktop build too.** It is the flag the shared
  kit already understands for "packaged, offline, ad-free", and setting it is what keeps AdSlot
  silent and `calculatorHref` trailing-slashed **without a single edit to `src/`**. The cost is that
  it also hides the kit's own Download/Print buttons, which is why the desktop frame provides its
  own. `NEXT_PUBLIC_ADSENSE_CLIENT` is blanked as a second line of defence.
- **History is captured from the DOM, deliberately.** Recording it "properly" would mean 104 tool
  pages calling a desktop-only hook — 104 edits to files three targets share, for one target's
  feature. Reading the rendered result instead gives every calculator Save/Print/Export for free and
  degrades honestly: a tool with no standard result card (the TLC analyzer, the colony counter)
  says "no result on screen yet" rather than saving an empty record.
- **No Tauri plugins, and no `@tauri-apps/api` package.** `withGlobalTauri` means the frontend
  reaches Rust through `window.__TAURI__`, so the desktop bundle needs **no new npm dependency** and
  the same build runs in a plain browser (where `isTauri()` is false and everything falls back to
  localStorage) — which is the only reason this could be verified at all without a Rust toolchain.
  `capabilities/default.json` grants `core:default` and nothing else: no shell, no fs plugin, no
  network, no updater, no dialog. The four app commands are constrained individually in `lib.rs` —
  `export_save` rejects any path separator, `..`, leading dot or unexpected extension outside the
  three it writes, so it can only ever write inside one folder.
- **Storage is one JSON file, not SQLite.** The spec allows either; the data is a single capped list
  and a database engine would be a dependency with nothing to do. The write is temp-file-then-rename,
  so a power cut cannot truncate a student's history.
- **Brand tokens over the spec's palette.** The spec names #2563EB/#4ADE80; the product is
  #1C7BD9/#21B67A, and the spec also says to keep the existing design language. Same call the
  Molecular Lab, the pharmacy counter and the calculator-refinement skill made.
- **The values library is sourced, not typed.** Every row is computed from data already verified in
  this repo (IUPAC 2021 atomic weights; the 83-molecule PubChem-verified Molecular Lab library),
  transcribed from a named calculator's own reference table, or an exactly-defined SI constant — and
  **every row prints its source on screen**. Where a value could not be sourced it is absent.
- **The rail collapses to icons below 1100 px rather than reflowing to a phone layout** (spec §17:
  this is a desktop program, not a responsive website).

**Verification**
- `npx tsc --noEmit -p desktop/tsconfig.json` → **0 errors**.
- `npm run desktop:build` → **exit 0**, 116 static pages, 114 HTML files, 105 tool routes,
  **shared JS 88.2 kB**, CSS **78,704 + 1,014 bytes** (checked against gotcha 23's ~10 kB silent
  failure), export 21.3 MB — 10.8 MB of which is OpenCV.js for the colony counter.
- `npm run desktop:audit` → **PASSED**: 397 files scanned, **0 remote subresources in the emitted
  HTML**, no ad network, no analytics, no API client, no secrets. Three findings were investigated
  and proved benign rather than suppressed wholesale (an `AIza…` run inside OpenCV's base64 WASM —
  the same false positive as gotcha 90; jsPDF's unreachable `pdfobject` CDN string; and Next's own
  `fonts.googleapis.com` preconnect constant). Each is an explicit, documented exception scoped to
  one file *and* one rule, so the same pattern elsewhere still fails the build.
- **Driven in headless Chrome with every non-local request failed at the network layer**
  (`Fetch.failRequest`, the closest a Linux box gets to pulling the cable): **25/25 checks pass, 0
  console errors, and ZERO application requests left the machine.** Exercised end to end: dashboard
  figures derived (105), index lists and filters, a calculator computing from typed input with no
  NaN/Infinity anywhere, **Save → history entry with inputs, results and formula captured from the
  DOM**, persistence across navigation and reload, **TXT and PDF export both producing a file**,
  delete, values search finding paracetamol at 151.16 g/mol with its PubChem source line, mass
  conversion (250 mg = 0.25 g), formulas rendering with symbol definitions, settings, and no
  horizontal overflow at **1400×900 or 1000×650** with the rail collapsing under 1100 px.
- Screenshots read at 1400×900; they caught one defect no assertion saw — `type="search"` drew
  Chrome's own clear button beside ours, so the field showed two X marks. Fixed.
- ICO container verified structurally (7 entries, PNG payloads, last entry ending exactly at EOF)
  and by `file`, which reports "MS Windows icon resource - 7 icons".
- Built in an **isolated copy** of the tree (peers' dev servers own the shared `.next`, Known Issue
  10). At build time session 9d's in-flight `src/components/calculators/native-share.ts` imported
  two Capacitor packages that were not yet installed, which breaks *every* calculator build target;
  those two files were reverted to HEAD **in the build copy only**. Their install has since landed
  and `tsc` is clean against the live tree.
- **NOT verified, and this is the important part: nothing Rust was compiled or run.** There is no
  Rust toolchain on this machine (`cargo`, `rustc`, `rustup` all absent) and the host is Linux, so
  `Cargo.toml`, `tauri.conf.json`, `capabilities/default.json` and `src/lib.rs` are **unbuilt and
  untested** — they are written to the Tauri 2 template's shape but no compiler has seen them. No
  `.exe` and no installer exists. The Tauri storage and export paths (`store_load`, `store_save`,
  `store_path`, `export_save`) have never executed; only their localStorage/object-URL fallbacks
  were exercised. Also not verified: a real Windows machine, WebView2, the print dialog, the NSIS
  installer, and dark mode (still unreachable site-wide). `npm run lint` does not run in this repo.

**Remaining**
- **Build the installer.** No Windows machine needed: `.github/workflows/desktop-windows.yml`
  (the repo's first and only CI workflow) builds it on a `windows-latest` runner — push, then
  Actions → "Windows desktop app" → Run workflow, and download the artifact. Locally on
  Windows it is `pnpm install`, rustup, `pnpm tauri:build`. Output:
  `src-tauri/target/release/bundle/nsis/PharmaWallah_1.0.0_x64-setup.exe`.
  Expect to fix small Rust/config errors on that first compile — see the honesty note above.
- Commit (the protocol forbids it here). The tree also carries two peers' work.
- If `tauri dev` rejects the config, the one key to suspect is `app.security.devCsp`.
- 21.3 MB of export, 10.8 MB of it OpenCV.js for one calculator. If installer size matters, that is
  the thing to look at first — but it is a working offline tool, so it was kept (spec §26).

**Next**
- Run `pnpm tauri:build` on a Windows machine and install the result.

### 2026-09-22 — Dissolution Rate Constant Calculator (new tool, 105th)

Session `cb572d28`, "follow protocol" + a 19-section user specification carrying a real practical
sheet (Cs = 3.5, seven corrected readings) and its expected answers.

**Completed**
- New `/calculation-tools/dissolution-rate-constant-calculator`, registered on the hub under
  Pharmaceutics and in the Android catalogue. It reproduces the supplied practical table rather
  than substituting a generic dissolution-kinetics model: **Time | Corrected Reading | Midpoint |
  dC/dt | Cs − C | k = x/y (x = dC/dt) | k = x/y (x = midpoint)**, then the mean of the last column.
- **The two k columns are kept apart**, as the spec demands — different numerators, separate
  columns, named in their headers, and a note on screen saying they are two calculations and not
  two roundings of one.
- The sheet's conventions are reproduced exactly: the final row's midpoint looks **backwards**
  ((C previous + C current) / 2, making it a repeat of the row above), the final row's dC/dt is
  **—** because there is no following time point, and **Cs − C uses the row's own corrected
  reading, never its midpoint**.
- Four Recharts graphs with the spec's titles (concentration, midpoint, dC/dt with a zero rule and
  visible negatives, k with the average as a labelled reference line), a scientific ⇄ decimal
  notation toggle, editable rows with Add / Delete / Clear / Load example / Calculate, and the
  lab-record Copy / PNG / Print through `LabActions`.
- Validation per the spec: Cs numeric and non-zero, numeric times and readings, duplicate times
  flagged (and their dC/dt refuses to divide by zero), out-of-order times flagged while the rows
  are still calculated **as entered**, Cs − C = 0 handled, and a negative dC/dt shown with the
  spec's own wording — "Negative rate detected — review experimental variability." Nothing is
  deleted, re-sorted or absolute-valued.

**Files**
- New `src/app/(site)/calculation-tools/(tools)/dissolution-rate-constant-calculator/`:
  `_dissolution-rate.ts` (pure: validation, the seven columns, the average, display formatting) and
  `page.tsx` (kit UI, four graphs, worked steps, lab record).
- New `scripts/dissolution-rate.test.mts` — 28 unit tests.
- `src/app/(site)/calculation-tools/tool-index.ts`, `mobile/app/_data/tool-registry.ts` — one entry each.
- `src/components/calculators/lab-analysis/parts.tsx` — `TableColumn.inputClass`, an **optional**
  per-column input width (default unchanged, so no existing tool moves).
- `scripts/lib/ts-resolve.mjs` — now also resolves the `@/` alias, so a pure module that imports a
  kit sibling that way can still be tested under `node --test`. Relative handling untouched.

**Architecture & Decisions**
- **The spec contradicts itself about the average, and the calculator says so instead of choosing
  silently.** §8 asks for "the mean of all midpoint-based k values", but the expected answer it
  states twice (0.000291833) is the mean of only **five** of the seven — t = 10…50. Measured: mean
  of all seven is 0.000269425; of t = 10–60, 0.000293440; of t = 0–50, 0.000264084. Only the
  interior five give 0.000291833 exactly. So "Average over" is a labelled `ModeSwitch` with
  **Practical sheet rows** (interior only) as the default — it reproduces the stated expected
  output — and **All observations** beside it, with the reason on screen. This is the
  `calculator-tool` skill's rule (gotcha 67): an alternative method is an option, never a silent
  substitute. **Owner decision** if the sheet's average was meant to cover all seven.
- **Brand tokens, not the spec's palette.** §16 names #2563EB/#4ADE80 but also says to use the
  existing design system; the site's are #1C7BD9/#21B67A. Same call as the Molecular Lab and the
  pharmacy counter.
- **Full precision throughout, rounding only at the point of printing**, so the notation toggle
  cannot change an answer — asserted by a test that computes k from the *displayed* string and
  proves it differs.
- The midpoint-based k divides a concentration by a concentration and therefore carries **no
  unit** as the sheet writes it. That is stated in "How the calculator works" rather than quietly
  corrected.
- No new dependency, no API route, no data store — it ships in the offline APK like every other tool.

**Verification**
- `npx tsc --noEmit` → **0 errors** (whole repo; matches the §9 baseline).
- `node --test scripts/dissolution-rate.test.mts` → **28 pass, 0 fail**: every column against the
  supplied sheet, the backward final midpoint, the two k columns proven different row by row, the
  average against 0.000291833 and against each rejected range, division-by-zero paths, duplicate
  and backwards times, a reading above Cs, both notations, and that intermediates are not rounded.
- Headless Chrome over CDP against an isolated dev server on :3211 — **56/56 at 1440×900** and
  **14/14 at 390×844 with touch**, 0 console errors in both. Driven for real: the example chip
  fills the sheet; the table prints 8.77352 × 10⁻⁵, 2.50672 × 10⁻⁵, 3.76783 × 10⁻⁶, Cs − C of
  3.499122648 and 3.498990807, "—" on the final row's two rate columns; the headline average reads
  2.91833 × 10⁻⁴ and, in decimal, 0.000291833; the k column reads 0.000125336 / 0.000269574 /
  0.000287909 / 0.000288555 / 0.000311630 / 0.000301497; switching to All observations moves it to
  0.000269425 and back; four graphs draw 7 / 7 / 6 / 7 points with both reference lines; no
  NaN/Infinity; no horizontal page overflow at either width and the wide table scrolls in its own box.
- **Screenshots read at both widths**, and they caught two things no assertion did: `Cs − C` printed
  as "3.500000000" (trailing-zero noise beside Cs — now trimmed for that column only, while the
  significant-figure columns keep theirs), and the corrected-reading inputs **clipped** their own
  values at the kit's fixed `w-[6.5rem]` (hence `TableColumn.inputClass`).
- **NOT verified:** a real phone or tablet; iOS Safari; screen readers; the print dialog; dark mode
  (still unreachable site-wide, tracker F13); the APK (not rebuilt). `npm run lint` does not run in
  this repo.

**Remaining**
- Commit (the protocol forbids it here). Three peer sessions were live in the tree throughout —
  an iOS Capacitor target, a Tauri desktop target, and a kit `SourceLink` — so commit selectively.
- Owner decision: whether the reported average should cover all seven rows instead of the
  interior five (the switch is already on screen either way).

**Next**
- Have a pharmaceutics demonstrator check the tool against a filled practical sheet other than the
  one supplied, then decide the averaging convention.

---

### 2026-09-22 — Calculator refinement standard written up as a skill

Session `9ac71ea2`, "follow protocol" + a 25-section user brief ("PharmaWallah Calculator — Global
Refinement Instructions"), with the explicit instruction **"for now just create this skill."** No
calculator was changed.

**Completed**
- New `.claude/skills/calculator-refinement/SKILL.md` (~300 lines). It is the brief translated into
  this repo: not a restatement, but a mapping of each requirement onto the component or helper that
  already delivers it, plus an honest list of what the kit does **not** have.
- **Every claim in it was read from source**, not from documentation: the kit's exports and their
  props (`NumberField`'s `units=` select, `ResultCard`'s `empty`/`interpretation`, `LabActions`'
  Calculate/Reset/Copy/Download/Print and its `IS_MOBILE_APP` gating), the parsers and formatters
  (`toNumber`, `fieldError`, `numericError`, `formatSig`/`formatFixed`/`formatScientific`), the
  analytical layer (`DataTable`, `CountStepper`, `ChartPanel`, `CHART`, `chartSvg`, `Checked<T>`),
  and the two real on-screen orders, taken from `bmi-calculator` and `calibration-curve-calculator`.
- **Starting point measured, not estimated** (counted over the 104 tool pages): 35 have a unit
  selector, 37 import Recharts, 15 build a lab record, 9 use `DataTable`, 6 use `ExampleChips`
  (68 have some example affordance), 3 ever print scientific notation.

**Files**
- New `.claude/skills/calculator-refinement/SKILL.md`.
- `.claude/SKILLS.md` — domain-skill row + a composing stack.
- `.claude/skills/calculator-tool/SKILL.md` — a pointer at the top: that skill owns creating,
  registering and medical safety; this one owns quality. **Two stale counts corrected** while
  there: "97 pharmacy calculation tools" → 104 (98 registered), and "`tool-index.ts` lists 93" →
  98 (gotcha 142). The same "97" in `.claude/SKILLS.md`'s row was corrected too.
- `.claude/ROADMAP.md` — new Phase 4.7 item (⚪ not started), and **a stale line corrected**: it
  still said Phase 2 "migrates 81 calculators", which finished 104/104 on 2026-09-20.
- `.claude/MEMORY.md` — gotchas 143 (the `lab-analysis` barrel imports Recharts at module scope)
  and 144 (there is no unit conversion beyond mass/volume/amount, and temperature cannot join it).
- This file — §7 In Progress, this entry.

**Architecture & Decisions**
- **Two families, not one layout.** The brief's §21 order (inputs → Calculate → result) is how the
  experimental-data tools already work; the formula tools put the result *first*, which is the only
  way the answer is visible on a phone without scrolling past every field. The skill names both and
  says which applies when, rather than forcing one order onto 104 tools.
- **Brand tokens over the brief's hexes.** The brief names #2563EB/#4ADE80; the product is
  #1C7BD9/#21B67A and `CHART.primary` is already the brand blue. Same decision the Molecular Lab and
  the pharmacy counter took, for the same reason — a second near-identical blue on a brand page.
- **§20's "minimal shadows, few gradients" does not mean stripping the liquid glass.** The user
  asked for that specifically on 2026-09-20; it is shared kit and one edit there reaches all 104
  tools and the APK (gotcha 136). The skill scopes §20 to decoration a page adds for itself, and
  flags kit-level visual change as a separate, deliberate decision.
- **The refinement is presentation; the maths is not in scope.** The skill's step 2 sends the
  refiner to the tracker's suspected-faults list *before* touching anything, and requires a
  before/after number capture. A render bug (stale result, NaN, dead unit selector) may be fixed and
  must be stated; a formula may not.
- **The brief's §3 and §23 conflict in practice** — "automatically convert when the unit changes"
  against "do not unexpectedly erase data". The skill resolves it into a five-point rule (one
  canonical internal unit, convert once on read, never rewrite the typed value, never clear, state
  the choice on screen), because double conversion is this repo's classic silent calculator bug.

**Verification**
- Skill content checked against source for every named export, prop and file path.
- Counts produced by `grep -rl` over `src/app/(site)/calculation-tools/(tools)`; the tool-directory
  count (104) matches `MEMORY.md` gotcha 131.
- Section order conformed to the house order documented at the foot of `.claude/SKILLS.md`.
- **Not run, because no product code changed:** `npx tsc --noEmit`, `npm run build`,
  `npm run mobile:build`, the `node --test` suites, no browser pass. Lint does not run in this repo.
- **Not verified:** whether importing `ExampleChips` actually lands Recharts in a tool's bundle —
  the module-scope import is a fact, the tree-shaking outcome is not, and the skill says to measure
  it with a build rather than reason about it.

**Remaining**
- No calculator has been refined. The standard is unapplied to all 104.
- The kit gaps the skill lists (unit tables beyond mass/volume/amount, temperature, graph tabs, a
  notation toggle) are not built — the first tool that needs one builds it, in `lab-math.ts`.
- Commit (the protocol forbids it here). The tree also carries the previous session's uncommitted
  `.claude/BRAND_KIT.md`, `CLAUDE.md` and `.claude/MEMORY.md` changes.

**Next**
- Pick one tool from each family and refine it as the worked reference — `dissolution-calculator`
  (family B: table → calculations → result → graph, and the brief's own worked example) and one
  short formula tool — then measure how much of the standard the skill actually carried.

### 2026-09-20 — Brand & content brief for social media (`.claude/BRAND_KIT.md`)

Session `afbe3f0b`, "follow protocol". User is commissioning social media content (image posts)
from a separate Claude on the web and needed a self-contained brief so that model knows the colour
scheme, typeface, logo, voice and — critically — which numbers it is allowed to state.

**Completed**
- New `.claude/BRAND_KIT.md`, written to be pasted whole into a fresh model with no repo access.
  Eleven sections: what the product is, audience, voice (with an explicit do/don't list), the full
  colour system, typography, logo construction and usage, visual language, **publishable figures**,
  a "never claim this" section, post formats and series ideas, and a short copy-paste summary.
- **Every value was read from source, not from documentation**: brand tokens and the clinical
  palette from `tailwind.config.ts`; the gradient, the two navy scrim strengths and their measured
  WCAG ratios from `src/components/page-kit/brand.ts`; Outfit from `src/app/layout.tsx`; the six
  pillar colours and their marketing lines from `src/components/Home/landing/data.ts`; the story
  copy from `/about-us`; the mark described by actually rendering `public/icons/icon-512x512.png`
  and the wordmark by extracting the base64 raster out of `public/images/logo/logo.svg`.
- **Counts re-measured rather than copied**: 104 tool directories, **98** on the hub across 10
  categories (parsed from `tool-index.ts`), 69 lesson markdown files, 8 simulations, 3 spotting
  disciplines, 12 seeded community spaces (counted in the migration), an 83-molecule library, 5 AI
  Guide modes, APK v1.4 / 8.9 MB / 104 tools, 18 team members.
- Found the live **Instagram handle** in the codebase — `@pharmawallah_com`, linked from
  `PharmaWallahQuiz.tsx` — and recorded it, since the user is about to run social accounts.
- §9's "never claim" section encodes the project's real legal exposure: educational-use-only, the
  unreviewed clinical content (Known Issue 19), the known formula faults (Known Issue 15) and the
  copyright position that removed the books library.

**Files**
- New `.claude/BRAND_KIT.md`.
- `CLAUDE.md` — §2 doc index row, §7 hub count corrected **93 → 98** with the per-category
  breakdown (Source-of-Truth rule; the 93 was stale), new Known Issue 20, this entry.
- `.claude/MEMORY.md` — one new gotcha (derived marketing counts live in two places and drift).

**Architecture & Decisions**
- **A file, not an artifact.** The deliverable's job is to be pasted into another chat, so a
  markdown file in the repo beats a rendered page; it also version-controls alongside the tokens it
  documents, which is what stops it going stale the way the 93 did.
- **It lives in `.claude/`** because that is where this project keeps durable reference material and
  `CLAUDE.md` §2 is its index — the brand kit is now discoverable from the entry point.
- **Figures are quarantined into one section (§8)** with an instruction that nothing outside it may
  be stated. A model writing marketing copy will invent "trusted by thousands" unless told plainly
  where the boundary is.
- **No product code changed.** The stale landing-page constant was recorded, not fixed — it is
  user-visible copy and the user should make that call.

**Verification**
- Every hex, count and string in the brief was read back from the file that defines it; the two
  logo assets were opened and looked at rather than described from the work log.
- Discrepancy found and reported: landing `STATS.calculators` = 97 vs 104 real / 98 hub
  (Known Issue 20), and §7's recorded hub count of 93 was wrong (corrected).
- The DrugBank figures (12,673 drugs and its splits) are carried over from the 2026-09-13 measured
  entry; they were **not** re-measured here — that needs a live Mongo read.
- **Not run, because no code changed:** `npx tsc --noEmit`, `npm run build`, no browser pass.
  Lint is not configured in this repo; no test covers documentation.

**Remaining**
- Decide whether to set `calculators: 104` in `src/components/Home/landing/data.ts` so the homepage
  and the marketing agree (Known Issue 20).
- The footer still carries a placeholder phone number and four `#` social links (Known Issue 13) —
  worth fixing before driving traffic from Instagram.
- No brand assets were exported for the designer (no PNG logo on transparent, no colour swatch
  sheet). `logo.svg` is the white lockup only; a colour lockup does not exist in the repo.

**Next**
- Export a small asset pack (colour + white logo PNGs, the 512px mark, a swatch card) so the social
  designer has files as well as hex values.

---

### 2026-09-20 — `/pharmacy-counter` rebuilt as the Community Pharmacy Simulation Lab

Session `pharma-wallah-4a`, "follow protocol" + a 34-section user specification. The old page was a
single 1,529-line client component: six hard-coded cases, a six-step click-through (intake →
transcribe → answer one DUR alert → pick a bottle → tick labels → answer a counselling MCQ), an XP
bar, combo streak, level-up modal and a countdown that scored zero stars on timeout. It is replaced
by a counter a student actually works at.

**Completed**
- **The whole community-pharmacy workflow, as fourteen gated stages**: arrival → receive →
  assess → interpret → ten clinical safety checks → intervention → select → batch → quantity →
  dispense → label → final verification → counsel → document → payment → debrief. A separate
  ten-stage path for minor ailments: complaint → WWHAM → red flags → decision → product →
  counsel → document → payment. Exactly **one primary action** is on screen at any moment.
- **Ten clinical checks the student performs, rather than an alert they acknowledge.** Each check
  lays out the evidence — the patient's recorded allergy *classes* beside the product's classes,
  the current medicines' interaction tags beside the new item's, the prescribed dose beside the
  usual range and this patient's weight and creatinine clearance — and asks for a verdict. **The
  real finding is not readable until a verdict is on record.** Concern lists are identical in
  every case, so the options never hint at which case this is.
- **Blocking findings actually block.** A critical allergy or a contraindicated combination cannot
  be dispensed past; the only way forward is to record an intervention (contact the prescriber, or
  refuse). A standing banner says why, and the tray refuses to fill.
- **Errors produce a professional review, not "Wrong!"** Ticking a verification line that is not
  true is refused with what to re-check ("the tray holds 400/80 mg; the prescription says
  800/160 mg"). Nothing is scored until the case is submitted, so a corrected mistake costs nothing.
- **Ten cases across six tiers**, carrying the old page's clinical content forward and adding to it:
  sulfa allergy on co-trimoxazole (with a look-alike 400/80 pack on the shelf), nitrate + PDE5,
  clarithromycin + atorvastatin, a paediatric suspension dosed at 47 mg/kg/day against a 20–40
  range, a four-finding warfarin case (co-trimoxazole, an NSAID, CKD-3 and an unadjusted renal
  dose), a clean prescription where "no concern" is the right answer, a quantity that equals a pack
  rather than the course, and three minor-ailment consultations including two referrals.
- **A shelf with real inventory.** 31 products across ten bays, each with batches, expiry months,
  reorder levels and prices. Dispensing depletes stock and it persists between cases. An expiry
  dashboard opens with 3 expired / 31 expiring soon / 31 in date, and an expired batch can be
  discarded.
- **Label printer** with a live preview, auxiliary-label selection from the product's own warnings
  mixed with plausible wrong ones, and directions checked against the prescription.
- **Eight counselling checkpoints** per product, each mixing statements that belong with ones that
  do not, feedback at the counter, then patient questions scored on accuracy, safety, communication,
  professionalism and completeness — separately, so an answer can be right and still unprofessional.
- **Bench calculators** (quantity, days' supply, weight-based dose, Clark's/Young's/BSA,
  Cockcroft-Gault, BMI/BSA, C₁V₁, %w/v, drip rate, unit conversion), each showing its working and
  returning nothing rather than a number it cannot justify.
- **Reference desk, intervention record** (copy/print), **till**, **patient queue**, **drills** for
  dispensing and counselling, **My performance** across cases, and **Continue your case** after a
  reload.
- **Debrief that teaches**: six competencies (ones the case did not exercise are left out, not
  scored zero), every error with a `learningPoint`, what was done well, the full answer key, and the
  case seed so a run can be reproduced and discussed with a tutor.

**Files**
- New `src/components/Simulations/CommunityPharmacy/` (34 files — see PROJECT_MAP): `types.ts`,
  `data/{constants,medicines,patients,scenarios}.ts`,
  `engine/{rng,dates,scenario,inventory,clinical,evidence,counselling,calculators,pos,flow,scoring}.ts`,
  `useCounterMachine.ts`, `CommunityPharmacyLab.tsx`, `Chrome.tsx`, `StageView.tsx`,
  `HomeScreen.tsx`, `Debrief.tsx`, `kit.tsx`, `environment/objects.tsx`, `modules/*` (7),
  `pharmacy.css`, `index.ts`.
- `src/app/(site)/pharmacy-counter/page.tsx` — now a **server** page with metadata (it had none),
  resolving the pharmacy's date once and passing it down. Deleted `PharmacyCounterContent.tsx`.
- New `scripts/pharmacy-counter.test.mts` (47 tests).
- Knowledge: this file (§7, §8, §9), `.claude/MEMORY.md` (gotchas 137–141),
  `.claude/PROJECT_MAP.md`, `.claude/SKILLS.md`, `.claude/redesign-tracker.md`, new skill
  `pharmacy-counter`.

**Architecture & Decisions**
- **The model is pure and tested.** `data/` and `engine/` import no React and touch no DOM; every
  number the student sees comes from a function there. Same split as the disk-diffusion lab, and the
  reason 47 unit tests could be written at all.
- **The answer key is gated in one place** — the `record-check` reducer case adds a finding's id to
  `revealed`. Nothing else may read `scenario.findings` for display.
- **Gamification removed, deliberately.** XP, levels, the combo streak, the star rating and the
  countdown are gone: the specification asks for a professional environment and says not to reduce
  the debrief to a score, and a timer on a safety check teaches the opposite of the lesson. Elapsed
  time is reported, never counted down. **Reversible** if the user wants the game back, but it is a
  product decision, not an oversight.
- **Brand tokens over the spec's palette.** The spec names #2563EB/#4ADE80; the site's are
  #1C7BD9/#21B67A, and the spec also says to use the PharmaWallah visual language. Same call the
  Molecular Lab made (§8, 2026-09-16).
- **No drags anywhere.** Everything is a button or an input, so the whole encounter is completable
  from the keyboard and works on a phone. The disk-diffusion lab paid for the alternative twice
  (gotchas 121, 122).
- **Deterministic, not identical.** Shelf order, dialogue order and WWHAM order come from a seeded
  mulberry32; the seed is printed in the debrief. No `Math.random()` anywhere.
- **Phones get a different order, not a smaller copy**: the workstation is first, the patient is one
  tap away on the bottom bar, the primary action is pinned above it, and the drawers are sheets.
- **No new dependency, no API route, no AI call, no telemetry** beyond the two `useTracker` rows
  (opened, completed) every learning surface writes. Nothing the student enters leaves the browser.

**Verification**
- `npx tsc --noEmit` → **0 errors** (whole repo).
- `node --test scripts/pharmacy-counter.test.mts` → **47 pass, 0 fail** (~0.5 s): case-data
  integrity (every finding's `concernId` exists in its check; every patient, product and decoy id
  resolves; every medicine has all eight counselling topics with at least one right and one wrong
  statement), quantities and PRN, the check grader's six outcomes including *right concern against
  the wrong item*, blocking findings, all nine verification truths, label issues, month-based expiry,
  inventory immutability, nine calculators against worked examples, counselling and red-flag
  scoring, seeded reproducibility, stage gating, and the debrief.
- `npm run build` → **exit 0** in an isolated copy of the tree (three peer dev servers were live —
  gotcha 126). `/pharmacy-counter` **87.7 kB / 250 kB first load**; shared JS **88.5 kB** and
  middleware **81.9 kB**, both unchanged. The usual `Dynamic server usage` traces (tournament,
  DailyMed, AMR) are pre-existing.
- Headless Chrome over CDP against an isolated dev server on :3222 — **173 assertions, 0 failures,
  0 console errors** in every run: the full prescription workflow end to end at **1440, 768 and
  390** (34 each, with touch emulation on the phone); the teaching paths at 1440 (22) — no finding
  leaks before a verdict, the finding appears marked "You did not record this" and "Blocks supply"
  once one is recorded, every finding needs its own decision, dispensing is refused while a blocker
  is unresolved, the hold lifts after contacting the prescriber, and ticking an untrue line raises
  "Review required", names the mismatch, avoids the word "wrong" and **refuses the tick**; the OTC
  referral path at 1440 and 390 (14 each) — supplying to a patient who needed referral is reported
  as critical and scores below 60%; accessibility and motion (11) — keyboard start, Enter on the
  primary action, focus ring, 0 unlabelled buttons, dialog focus + Escape, no animation and nothing
  invisible under `prefers-reduced-motion`; drills, reload-and-continue and the inventory drawer
  (10).
- **Screenshots were read at both widths, and caught four defects no assertion saw**: every stage
  change popped a modal over the workstation (gotcha 139); the label preview rendered white-on-black
  because `globals.css` styles every `pre` as a code block (gotcha 137); the primary action was red
  for most of a difficult case; and the phone led with the patient card instead of the task.
- **NOT verified:** a real phone or tablet; iOS Safari; screen readers (the markup was built for
  them — roles, labels, `aria-current`, focus management — but no AT was run); dark mode (still
  unreachable site-wide, tracker F13); print output; the APK (this page is not in it). `npm run
  lint` does not run in this repo.

**Remaining**
- Commit (the protocol forbids it here). The tree also carries three peer sessions' work.
- The clinical content is written for teaching and has not been reviewed by a pharmacist. Before
  this is put in front of students, someone qualified should read `data/medicines.ts` and
  `data/scenarios.ts` — see §7 Known Issues.
- First load is 250 kB. The drawers (calculators, reference desk, inventory) could be
  `next/dynamic`; not done, to avoid destabilising a verified build.

**Next**
- Have a pharmacist read the ten cases and the counselling points, then add cases 11+ — the scenario
  format is data, so a new case is a patient, a prescription and its findings.

### 2026-09-20 — Calculator kit migration finished (104/104); full validation sweep; liquid-glass kit

Session `pharma-wallah-86`, "follow protocol". Three peer sessions were live in the same tree
throughout (`-a1` encyclopedia, `-82` disk diffusion, `-2f` community, `-4a` pharmacy counter);
file ownership was agreed by message before any shared file was touched.

**Completed**
- **The last 17 calculators migrated onto `@/components/calculators`**, closing Phase 2 of the
  redesign tracker: `heat-transfer-area`, `reynolds-number`, `drying-rate`, `mixing-time-estimator`,
  `AntagonismSimulator`, `drug-receptor-binding-affinity-tool`, `dose-response-curve-generator`,
  `ed50-td50-ld50-calculator`, `OpioidConversionCalculator`, `OpioidMMECalculator`,
  `GeriatricDosingCalculator`, `vancomycin-auc-calculator`, `tpn`, `osmolality-calculators`,
  `reconstitution-calculator`, `animal-dose`, `renal-dosing-adjuster`.
  **104 of 104 tool pages now import the kit** (measured, not assumed).
- **Every migrated tool returns byte-identical numbers.** Before/after captured in headless Chrome
  for 3–10 input sets per tool (86 comparisons in total), plus a Node harness for
  `dose-response-curve-generator` that compared **5,134 curve values** against the original's
  generator — 0 differences.
- **Validation sweep over all 104 calculators** against a production build: 0 non-200, 0 hydration
  failures, 0 page exceptions, 0 console errors, 0 horizontal overflow, at 1440×900 **and** 390×844.
- **Liquid glass** on `ResultCard` and `ModeSwitch` (user request), reaching every calculator and
  the APK; verified in the real `mobile/out` export at 390 px.

**Files**
- 17 tool pages under `src/app/(site)/calculation-tools/(tools)/`, plus new pure siblings:
  `dose-response-curve-generator/_curves.ts`, `ed50-td50-ld50-calculator/_probit.ts`,
  `OpioidMMECalculator/_mme.ts`, `GeriatricDosingCalculator/_geriatric.ts`,
  `vancomycin-auc-calculator/_vanco.ts`, `tpn/_tpn.ts`, `osmolality-calculators/_osmolality.ts`,
  `reconstitution-calculator/_recon.ts`, `animal-dose/_animal.ts`, `renal-dosing-adjuster/_renal.ts`.
- `src/components/calculators/ResultCard.tsx`, `src/components/calculators/ModeSwitch.tsx`,
  `tailwind.config.ts` (`calc-sheen`, `calc-tide` keyframes).
- Knowledge: this file, `.claude/redesign-tracker.md` (17 rows ticked, Phase 2 closed, a new
  maths-issue section), `.claude/MEMORY.md`, `.claude/PROJECT_MAP.md`, `.claude/ROADMAP.md`.

**Architecture & Decisions**
- **"Before" came from HEAD, not `5dbe98c`.** All 17 files were byte-identical between the two
  (`git diff 5dbe98c HEAD -- <path>` empty for each), because no earlier session had touched them —
  so the `migration-before/` temp-route dance (gotcha 76) was unnecessary and was skipped.
- **The maths was copied, never corrected** (gotcha 78). ~10 further faults were found and are now
  **stated on screen** on the page that carries them, with the number left unchanged — the worst are
  the fentanyl-patch MME (25 mcg/h → 2500 MME), the inverted probit slope in the ED50 tool, and the
  60× mixing time. Full list in the tracker.
- **Render bugs fixed, and stated:** stale results left on screen after invalid input (3 tools), and
  an **infinite loop in `drying-rate`** when initial = final moisture, which froze the tab.
- **Big tools split into a pure `_x.ts` sibling**, so a 1,000–2,250 line page became a readable page
  plus hand-checkable maths. `_recon.ts` and `_renal.ts` carry their drug databases (11 and 20 drugs)
  extracted verbatim by script rather than retyped.
- **Liquid glass:** transform-only layers on the compositor, never `backdrop-filter` on anything
  fixed. `ModeSwitch` does use `backdrop-saturate` on desktop — a pixel-diff proved the vibrancy is
  visible (max channel delta 91) and is *not* a no-op — but touch devices drop the filter entirely
  and get the same look from a pre-saturated fill, so the APK pays nothing.

**Verification**
- `npx tsc --noEmit` → **0 errors**.
- `npm run build` → **exit 0** in an isolated copy of the tree (peers agreed not to build in the
  shared tree; Known Issue 10). Shared JS **88.5 kB**, middleware **81.9 kB**.
- `npm run mobile:build` → **exit 0**; 108 HTML files, 106 entries under `mobile/out/calculation-tools/`,
  CSS **84,243 + 4,210 bytes** (not the ~10 kB silent-Tailwind-failure size, gotcha 23).
- Sweep of all 104 calculators against `next start`, at 1440×900 and 390×844: 104/104 HTTP 200,
  hydrated, 0 exceptions, 0 console errors, 0 overflow. (`rf-value-calculator` has no `aria-live`
  result card — it is the TLC photo analyzer with a bespoke stage, expected. One "undefined" hit in
  `dialysis-diffusion-calculator` is legitimate prose: "ln(1 − B) is undefined".)
- Glass verified in the **real APK export** served from `mobile/out` at 390 px:
  `backdrop-filter: none`, pre-saturated fill, sheen still animating, 0 console errors, no overflow.
- **NOT verified:** a real Android device or emulator; iOS; dark mode (still unreachable, F13); a
  real mouse/trackpad feel; no APK was rebuilt or published (version still 1.3). Lint is not
  configured. The 62 existing `node --test` files were not re-run — they cover TLC, colony and
  Molecular Lab only, none of which this session touched.

**APK v1.4 published (same session, user request)**
- `versionCode 5` / `versionName "1.4"`; `npm run mobile:apk` → `BUILD SUCCESSFUL`, signed V2 release
  APK **9,369,674 B (8.9 MB)**, copied to `public/downloads/pharmawallah-calculators.apk` and
  **byte-identical** to the Gradle output (`cmp`).
- Certificate SHA-256 `afe4c18e…5b03` — **identical to the committed v1.3**, so it installs as an
  update rather than a new app.
- Contains **104 tool pages** (`assets/public/calculation-tools/*/index.html`), i.e. every migrated
  calculator plus the liquid-glass kit.
- Ad-free confirmed: `adsbygoogle` / `ca-pub-` / `googlesyndication` → **0 files** in `mobile/out`;
  `AdSlot` returns `null` under `IS_MOBILE_APP`, and 0 ad placeholders appear in the exported HTML.
  (A bare `NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR` **string** appears in 104 bundles — that is the unset
  env-var name, not an ad. Don't let it fail a naive grep.) Secret scan: 0 JWT-shaped, 0 service-role
  or API keys.
- `src/app/(site)/download/DownloadClient.tsx` → `APP_VERSION "1.4"`; `APK_SIZE` stays "8.9 MB";
  `APP_TOOL_COUNT` already 104.

**Remaining**
- Commit (the protocol forbids it without the user asking) — this now includes the **binary**
  `public/downloads/pharmawallah-calculators.apk` and the two version bumps, then deploy.
- Install v1.4 over v1.3 on a real phone to confirm the update path and the glass on a real GPU.
- Owner decisions: every item in the tracker's maths-issue sections, including this session's ~10.
- The 5 orphan tools (`AntagonismSimulator`, `EmaxModelCalculator`, `drug-half-life-calculator`,
  `OsmolarGapCalculator`, `OpioidConversionCalculator`) are now on the kit but still linked from
  nowhere on the web — registering them in `tool-index.ts` is a one-line-each change, deliberately
  not made here.
- An APK release build would be needed to ship the glass to phones.

**Next**
- Decide the formula fixes, starting with the two opioid tools — they are the ones that can produce a
  dangerous number.

### 2026-09-20 — Disk Diffusion Lab rebuilt: illustrated Lab Guide + a simulation the student performs

Session `pharma-wallah`, "follow protocol", user spec (20 sections).

**Completed**
- `/simulations/disk-diffusion` is now **one lab with two halves**, Theory and Simulation, sharing one
  interpretation setting and linked both ways by "Try it in the simulation" buttons that open the exact
  stage a passage describes. The old 1,339-line `DiskDiffusionSim.tsx` (tutorial slides → gated quiz →
  7 watch-mostly steps) is replaced.
- **Theory** has five sub-sections: Principle, Materials, **Lab Guide**, Interpretation, Safety & notes.
  The Lab Guide is a **nine-step illustrated stepper** (prepare inoculum → Mueller-Hinton plate →
  standardise turbidity → inoculate → apply disks → incubate → observe zones → measure → interpret),
  each step with a drawn SVG diagram, explanation, practical note, prev/next, a jump rail and a progress
  bar. The four pre-lab questions survive as an **optional** collapsible check (it no longer gates the
  bench) and record a `quiz_attempts` row.
- **The student now performs the experiment.** Ten explicit stages (`intro … completed`); a stage only
  unlocks when its prerequisites are genuinely met, in both modes. Prepare and **standardise the
  inoculum** against a turbidity standard; choose an **agar depth**; **swab the plate by dragging**
  (or three orientation buttons + a rim pass) with live coverage scoring; **place 4–6 disks** by tap or
  drag with 24 mm spacing and 15 mm edge rules enforced; **incubate** (door, load, temperature,
  duration); watch the zones appear; **measure each zone yourself with a draggable calliper** and record
  it; interpret; finish.
- **Measurement is the student's, not the lab's.** The true diameter is never shown before a reading is
  recorded. The calliper checks both length *and* whether the line passes through the disk centre, so
  measuring a chord is caught and explained. Zoom 1–3×, nudge buttons and "centre on disk" are the
  keyboard/touch route.
- **Mistakes teach instead of blocking.** Heavy or light inoculum, thin or thick agar, a patchy lawn,
  disks too close or too near the rim, an off-centre or wrong-edge measurement each produce a specific
  explanation of what it does to the result — and the experiment continues.
- **Interpretation is configuration, not doctrine.** Criteria live per antibiotic per organism group in
  `data.ts`, with two selectable reporting systems (S/I/R and the increased-exposure wording). Every
  place a category is shown names the system and carries a note that real interpretation depends on the
  standard in force, the organism, the agent, the disk content and the conditions. Pairs with no
  criteria report **"no interpretive criteria"** rather than inventing a threshold.
- **Results dashboard** (conditions summary, plate ↔ table linked in both directions, category shown as
  letter + wording + icon, never colour alone) and a **completion screen** scoring *technique*, not the
  isolate's susceptibility. Restart and "Review lab guide" work without a reload.
- Progress tracking wired for the first time (`useTracker`): an activity row on open and on completion,
  a quiz attempt for the pre-lab check. The old `index.ts` claimed this existed; it never did.

**Files**
- New `src/components/Simulations/DiskDiffusion/`: `types.ts`, `data.ts`, `engine.ts`,
  `useLabMachine.ts`, `illustrations.tsx`, `equipment.tsx`, `PetriDish.tsx`, `LabGuide.tsx`,
  `PreLabCheck.tsx`, `TheorySection.tsx`, `stages.tsx`, `SimulationWorkspace.tsx`,
  `MeasurementTool.tsx`, `ResultsDashboard.tsx`, `CompletionScreen.tsx`, `report.ts`,
  `DiskDiffusionLab.tsx`; `index.ts` rewritten.
- Deleted `DiskDiffusionSim.tsx` (replaced) and `diskDiffusionData.ts` (dead — exported only through an
  `index.ts` nothing imported; its organisms, antibiotics and questions live on in `data.ts`).
- `src/app/(site)/simulations/disk-diffusion/page.tsx` (metadata + new component),
  `src/app/(site)/simulations/page.tsx` (hub card description — it promised "interpret CLSI
  breakpoints", which is exactly the claim this rebuild stops making).
- Knowledge: this file, `.claude/{MEMORY.md (gotchas 120–126), PROJECT_MAP.md, ROADMAP.md, SKILLS.md}`,
  new skill `.claude/skills/lab-simulation/`.

**Architecture & Decisions**
- **The model is pure and separate.** `engine.ts` and `data.ts` import no React and touch no DOM, so
  zone size, placement legality, lawn coverage and the technique score can be reasoned about — and one
  day tested — without rendering. `useLabMachine.ts` owns every rule about what is allowed; the
  components only present and dispatch.
- **The plate is drawn in real millimetres.** `PetriDish` uses a viewBox where one user unit is one
  millimetre, so "24 mm apart", the 15 mm margin and the 6 mm disk are the same numbers in the model,
  in the geometry and under a ruler held to the screen. One exported conversion (`plateMmFromClient`)
  serves both the SVG's own pointer events and the tray's drag-and-drop.
- **Zones are deterministic but not identical run to run**: base diameter × inoculum factor × agar-depth
  factor × coverage factor, plus a jitter hashed from (seed, organism, antibiotic). The seed is printed
  in the summary and the PDF, so a result is reproducible. A base of 0 stays 0 — technique variation
  never invents a zone out of intrinsic resistance.
- **No new dependencies.** framer-motion, lucide-react, Tailwind brand tokens and jsPDF only; jsPDF is
  now a lazy `import()`, so it is in its own chunk instead of the first load as it was before.
- **Every drag has a non-drag route** (sweep buttons, tap-to-place, calliper nudge/centre), because a
  lab is used on phones and a drag-only interface excludes keyboard and assistive-technology users.
- Scoring is deliberately **technique, not susceptibility** — the old version's XP/grade rewarded
  reaching the end, which implies a resistant isolate is a worse result than a susceptible one.

**Verification**
- `npx tsc --noEmit` → **0 errors in this lab.** The run also reports 4 errors in
  `(tools)/OpioidMMECalculator/page.tsx:229-231` (a `Set` spread needing `downlevelIteration`, gotcha 37)
  — another session's in-flight file, not this work, so tsc is **not** at the §9 zero baseline right now.
- `npm run build` in an **isolated copy** of the tree (two peer `next dev` servers were running on the
  shared root — see below) → **exit 0**, 277 route lines, shared JS **88.5 kB**, middleware 81.9 kB,
  `/simulations/disk-diffusion` **49.1 kB / 241 kB first load**. jsPDF confirmed absent from the page
  chunk and present in its own. Only the expected pre-existing warnings (Edge `process.version`,
  stale `caniuse-lite`, webpack big-strings, and `buffer-lab`'s ambiguous `duration-[2000ms]` class).
- Headless Chrome over CDP against an isolated dev server, **145 assertions, all passing**:
  - **Theory 22/22** — five tabs; nine guide steps each with figure, heading and practical note;
    Next disabled on the last step; Previous works; criteria table has a row per antibiotic and 17
    dashes where a pair has no criteria; switching the reporting system changes the note and the
    wording; the pre-lab check records all four answers with explanations.
  - **Simulation 50/50 at 1440** — locked stages unreachable; Continue blocked at every gate; turbidity
    disabled before the suspension exists; drag-to-swab paints the lawn; three sweeps + rim reach 100%;
    four disks place; a disk 4 mm from a neighbour is refused **with the spacing explanation** and does
    not land; one past the 15 mm margin is refused with the edge explanation; a legal fifth lands at the
    plate centre; incubation gated on load-then-close-door; zones drawn; **the calliper reads exactly
    25 mm for a 25 mm span** (geometry verified against the mm grid); an off-centre line is called out as
    "a chord, not a diameter"; all five zones recorded; results table complete with criteria and source
    note; completion screen; restart clears the bench.
  - **Responsive 63/63** — phone 390 (touch), tablet 768 (touch), desktop reduced-motion. Full
    experiment completed by **synthetic touch** on both touch widths; no horizontal overflow at any
    stage at any width; the wide criteria table scrolls in its own box, not the page; swabbing does not
    pan the page; reduced motion reveals the zones at once.
  - **Accessibility 10/10** — every control in the tab order is labelled and shows a focus indicator;
    the Lab Guide is keyboard reachable; **a confluent lawn is achievable with the keyboard alone**;
    one h1; every `role="img"` SVG in the lab carries a title or label; categories carry letter +
    wording + icon, not colour alone.
  - **0 console errors and 0 exceptions in every run.**
- Screenshots read at 1440, 768 and 390. They caught three things the assertions did not: the lawn
  rendering as a visible grid of squares at the rim (the coverage cells — now softened with a blur),
  the measured "20 mm" chip colliding with the calliper readout on the disk being measured (now hidden
  while that disk is active), and calliper handles too small for a fingertip (now a 7 mm ≈ 46 px grab
  ring). A copy bug was also caught by reading the screen: the growth summary said "the rest show
  growth right up to the disk edge" when every disk had produced a zone.
- **Five real defects were found and fixed during verification**, all by driving the page rather than by
  reading it: the pre-lab check dropped all but one answer when several were answered in the same tick
  (stale closure in a non-functional `setState`); the plate scrolled out of view because a sticky grid
  item with `items-start` has no travel; tapping a disk in the tray selected then immediately
  deselected it (pointerdown/click fighting); a tap near an existing disk grabbed it instead of
  reporting the spacing error; and the growth copy above. See MEMORY gotchas 120–126.
- **NOT verified:** a real phone or tablet, iOS Safari, a real screen reader, the print/PDF dialog
  (the PDF path is exercised only as far as the lazy import), dark mode (still unreachable site-wide,
  tracker F13), and signed-in progress tracking (no credentials — the `useTracker` calls are wired and
  type-check, but no row was observed in Supabase). No test framework covers this lab; `npm run lint`
  is not configured. The lab is web-only and is not in the APK.

**Remaining**
- Commit (not done — the protocol forbids it). Note the tree also holds two other sessions' uncommitted
  work (the community system, encyclopedia, and 17 calculator migrations); only the files listed above
  are this session's.
- The same Theory + Lab Guide + performed-procedure shape would suit the other seven simulations; the
  new `lab-simulation` skill records how.
- Owner decision: whether the teaching criteria should be replaced with a licensed, citable table
  before this is used for assessment rather than practice.

**Next**
- Try the lab on a real phone — the drag-to-swab and calliper drag are the two things synthetic touch
  cannot really judge.

---

### 2026-09-20 — Books Library removed (copyright); AI Guide rebuilt as its replacement

Session `7189144b`, "follow protocol". User: "remove Book library and replace with AI guide (already
available) enhance it. Book library has issue of copyright and such".

**Completed**
- **`/books-library` is gone**, with its 39 entries and **35 scanned cover images (14 MB)**. It
  linked Google-Drive copies of Tortora, Guyton, Ross & Wilson, Lippincott, Remington and the rest —
  material we hold no licence to distribute, on a site that runs AdSense. Worth knowing for the
  decision: **38 of the 39 "Read" buttons pointed at `"#"`** — only one book had a real link, so the
  page was mostly non-functional as well as unlicensable. Everything is recoverable from git.
- **`/books-library` → `/ai-guide` as a permanent 308** in `next.config.mjs`, so bookmarks, the
  Android app's links and anything indexed land on the replacement rather than a 404.
- **Navigation updated in five places.** Footer and MegaMenu already carried an "AI Guide" row, so
  the Books row was removed there rather than relabelled (it would have duplicated); the header
  menu and the dashboard's Reference links became "AI Guide" entries. The unrendered
  `Home/Features` card was removed too, along with its fabricated "150+ Textbook Titles" ticker stat.
- **The AI Guide was rebuilt to earn the promotion**, not merely inherit the link:
  - **Answers stream.** Measured on a 3,414-character answer: first text at 6.7 s, complete at
    10.2 s, in 17 chunks. The bounded win is honest — `gemini-2.5-flash` is a thinking model and
    most of that 6.7 s is deliberation before any token exists.
  - **Five study modes** — Explain, Quiz me, Compare, Calculate, Clinical — each with its own
    starters and its own prompt directive. A mode crosses the wire as an **id**; the server maps it
    to text, so a client can never supply prompt content.
  - **Saved conversations** in localStorage: rename, delete, clear all, restore on reload, titled
    from the first question. The UI states it is per-device and not synced.
  - **Stop, Regenerate, Copy**, a thinking indicator, a streaming caret, and a partial answer kept
    (and labelled) when a stream is cut short.
  - **Markdown is actually styled now** — see the gotcha below.
  - **A "Study material on PharmaWallah" panel** listing the nine real pages we own, and the line
    "We don't host textbook scans — those aren't ours to give away." The same list is generated into
    the system prompt, so the model recommends real routes instead of inventing them.
  - **The prompt forbids reproducing textbook passages** or claiming to source a book — the
    copyright concern encoded where it can actually bite.
  - **The page has metadata for the first time.** It was `"use client"` from line 1, so it could
    never export a title, description or canonical.

**Security — `/api/chat` was the app's biggest money exposure and is now fixed**
- It was **unauthenticated, un-rate-limited and unvalidated** (`Array.isArray` and nothing more) on
  a paid Gemini endpoint. Now: anonymous **8 / 5 min by IP**, signed-in **30 / 5 min by user id**,
  and the body is validated and clamped (30 turns, 8k chars per message, 24k total) **before** any
  call is made. Unknown roles are dropped, so a client-supplied `system` turn cannot reach the model.
- **The key is on the Gemini free tier — 5 requests per minute for the entire project** (measured,
  not assumed). That ceiling binds long before our limits do; an upstream 429 now maps to a **503**
  with "try again in about a minute" instead of a generic failure. **Owner decision: enable billing
  if the guide is to carry the traffic the Books Library link used to send it.**

**Files**
- Deleted: `src/app/(site)/books-library/page.tsx`, `public/images/books/` (35 files).
- New: `src/lib/ai-guide/{types,pure,modes,prompt,resources}.ts`;
  `src/components/ai-guide/{AIGuideClient,Markdown}.tsx`, `{useChatStream,useThreads}.ts`,
  `ai-guide.css`; `scripts/ai-guide.test.mts`.
- Rewritten: `src/app/api/chat/route.ts`, `src/app/(site)/ai-guide/page.tsx` (now a server page).
- Edited: `next.config.mjs` (1 redirect), `Layout/Footer`, `Layout/Header/MegaMenu`,
  `Layout/Header/Navigation/menuData`, `dashboard/dashboard-data.ts`, `Home/Features/index.tsx`.
- Knowledge: this file, `.claude/{MEMORY (127-130), PROJECT_MAP, ROADMAP}.md`, skill
  `ai-gemini-integration` (its "none of the four routes is rate limited" line was now wrong).

**Architecture & Decisions**
- **The replacement is a tutor plus a signpost, not another reading room.** Rehosting the same books
  elsewhere would carry the same problem; the guide explains in its own words and points at material
  we own.
- **Pure layer in `src/lib/ai-guide/`, UI in `src/components/ai-guide/`** — the shape the community
  established. It is what makes the deterministic half testable at all.
- **NDJSON, not plain text, for the stream.** Once the 200 header has gone out there is no other way
  to report a mid-answer failure, and a quota or safety stop is exactly when that happens.
- **`clientIpFrom()` is four lines duplicated from `tournament-redis`, deliberately.** That module
  calls `Redis.fromEnv()` at module scope and throws without Upstash; `/api/chat` must keep working
  on `GEMINI_API_KEY` alone, with rate limiting degrading to off like every other cache here.
- **Thinking left on.** A `thinkingConfig` budget would cut the 6.7 s, but the installed SDK (0.24.1)
  does not type one and less deliberation is the wrong trade for Calculate mode. Recorded in the
  route so it is not "optimised" blindly.
- **localStorage, not Supabase, for history** — a conversations table would need schema and RLS, and
  the schema is not in this repo (Known Issue 4). Cloud sync is an owner decision.
- `rehype-raw` is not used, so model output can never inject HTML; `javascript:`/`data:` hrefs
  render as plain text; internal links become in-app `next/link` chips.

**Verification**
- `npx tsc --noEmit` → **0 errors** (whole repo, matching the §9 baseline).
- `node --test scripts/ai-guide.test.mts` → **34 pass, 0 fail**: the clamps (including the
  regression where a lone oversized question returned the whole array), Gemini's start-on-user and
  alternation rules, NDJSON round-trip **with a chunk boundary deliberately split mid-JSON**,
  markdown newlines surviving the framing, malformed lines skipped, mode-id rejection of injected
  text, and an assertion that the prompt can never again name `/books-library`.
- `npm run build` → **exit 0** in an isolated copy (a peer session owns `.next` on :3000 — Known
  Issue 10). `/ai-guide` **9.7 kB / 150 kB first load**; **shared JS 88.5 kB, unchanged**;
  `/books-library` absent from the route table.
- **Headless Chrome (CDP), dev and `next start`: 28/28 desktop + 28/28 markdown-and-phone, 0 console
  errors.** Driven for real: a live question end to end (question echoed, thinking indicator,
  streamed answer, Copy, Regenerate), thread saved → reload → restored, rename and delete through
  the rail with localStorage re-read to confirm, mode switching swapping the starter set, the
  resource panel's 9 links all in-app, phone drawer open/close, and a wide table scrolling inside
  its own box at 390 px with no page overflow.
- **API exercised directly**: five malformed bodies all rejected **400 before any Gemini call**; the
  anonymous limiter observed blocking at **429**; the upstream free-tier quota observed as a **503**
  with the intended message.
- **Screenshots read at 1440 and 390** — and they caught the one real defect assertions missed: the
  empty state opened scrolled past its own heading, because the auto-scroll effect also fires on
  mount (MEMORY gotcha 130). Fixed and re-verified.
- **NOT verified:** a real phone or tablet; iOS Safari; screen readers; the signed-in path and its
  30/5-min limiter (no test credentials — the anonymous path was exercised instead); behaviour on
  Vercel's Edge/CDN; dark mode (still unreachable site-wide, tracker F13). Lint is not configured.

**Remaining**
- **Commit** (the protocol forbids it here). The tree also carries other sessions' uncommitted work
  — community, encyclopedia, DiskDiffusion and several calculators — so commit selectively.
- Owner decision: **Gemini billing**, given the 5/min project ceiling.
- Cloud-synced chat history needs a Supabase table; not creatable from a session.
- `src/components/community/` may share the dead-`prose` fault (gotcha 127) — unchecked, not mine.

**Next**
- Decide on Gemini billing, then open `/ai-guide` on a real phone and ask it a calculation.

---

### 2026-09-20 — `/encyclopedia` redesigned: the whole record, tabbed; 3D structure in the drug card

Session `pharma-wallah-a1`, "follow protocol" + `top-design`. Two riders arrived mid-task and both
shipped in this pass: **"show all the information that is given by the search … easy to understand and
read and does not feel overwhelming"**, then **"add the 3d structure in the drug card"**.

**Completed**
- **The page is a tool again.** The old full-screen brand cover (display headline, lead, chips and four
  figures) had to be scrolled past on every visit. The search is now a bar that is always present: it
  sits inside the hero band while nothing has been searched and becomes a slim **sticky** control the
  moment it has. It is **one input across both states**, never remounted, so focus survives the second
  character; it follows the retracting site header via the `MutationObserver` trick (gotcha 66).
- **A record is a tabbed card, not one endless scroll.** Eight sections — Overview, Pharmacology,
  Kinetics, Interactions, Products, Chemistry, Classification, Names & references — each tab printing
  what it holds ("Interactions 102", "Chemistry 26"), one on screen at a time. Above them a masthead
  (name at display scale, status, identifier ledger) and an **At a glance** row of four one-sentence
  answers, so something true is readable before any tab is opened.
- **Six categories of data the old page dropped are now shown** (measured against the live database,
  not assumed):
  1. **Interactions: 12 → all 100.** The old page sliced to 12 behind "Show all".
  2. **Predicted properties: 8 of an allow-listed 17 → all of them.** Seven kinds were being discarded
     for ~8,700 records each — `Monoisotopic Weight`, `InChI`, `SMILES`, `Ghose Filter`, `Polarizability`,
     `Refractivity`, `MDDR-Like Rule`.
  3. **`classification.substituents` — never rendered at all.** 6,994 records hold them, up to 91 each.
  4. **`properties.monoisotopic_mass` — never rendered.** 9,036 records hold it.
  5. **`products[].approved` — never rendered.** 6,188 of 7,032 products in one collection are flagged.
  6. **Alternative parents were cut at 16**; synonym `language`, and prose over 900 characters (behind
     "Continue reading") are all shown in full now.
- **3D structure in the drug card.** The plate has a 2D ⇄ 3D switch. 3D generates a conformer from the
  record's own SMILES on the device (OpenChemLib in a Web Worker, 3Dmol to draw), with ball-and-stick /
  stick / space-filling, hydrogens on/off, spin, zoom, fit and reset, and a line stating it is a
  generated conformer, not a measured crystal structure. Biotech records (3,269 of 12,673 have no
  SMILES) say *why* there is no structure instead of showing an empty box.
- **"Open in Molecular Lab"** from every structure plate — the hand-off `CLAUDE.md` has wanted since
  2026-09-16.
- **Honest counts.** `interactions.total_count` was measured and is **not** a true total: it equals the
  stored list length on all 4,479 records and caps at exactly 100. The page says "the import stores at
  most 100 per drug, so DrugBank lists more" rather than implying completeness. Products say the same
  about their cap of five, synonyms about theirs.

**Files**
- `src/components/encyclopedia/EncyclopediaClient.tsx`, `Monograph.tsx`, `encyclopedia.css` — rewritten.
- New: `src/components/encyclopedia/StructurePlate.tsx` (2D/3D switch, lazy), `Structure3D.tsx`
  (conformer + `Viewer3D`, the documented second consumer of OpenChemLib/3Dmol).
- Unchanged: `prose.tsx`, `useDrugSearch.ts`, `EncyclopediaFigures.tsx`, `types.ts`,
  `src/app/(site)/encyclopedia/page.tsx`, `src/app/api/search/route.ts`.
- Knowledge: this file (§6 rule 18, §7, §8, §9), `.claude/MEMORY.md` (gotchas 115–118),
  `.claude/PROJECT_MAP.md`, `.claude/SKILLS.md`, new skill `drug-encyclopedia`.

**Architecture & Decisions**
- **Tabs are how "everything" and "not overwhelming" are reconciled.** Progressive disclosure by
  *section* rather than by truncation: the reader chooses what to read, but nothing is hidden from them
  and every tab states its size up front.
- **One field is still withheld, and the page says so.** DrugBank's "Traditional IUPAC Name" is wrong
  for many drugs in this import (Morphine's reads "dexamethasone phosphate"). Showing it would mislead,
  so Chemistry names it, explains it, and points at the reliable IUPAC Name. **Reversible in one line**
  (`UNRELIABLE_KINDS` in `Monograph.tsx`) if the owner disagrees.
- **3D reuses the lab's `Viewer3D`** rather than a second renderer, but strictly view-only — no picking,
  measuring or editing. `Structure3D` owns one thing the lab does not: a hydrogens-off mode, done by
  filtering the V2000 record (3Dmol cannot hide atoms in a parsed model).
- **No new API route and no new package.** The 2D depiction is still NIH CACTUS; 3D is computed locally.

**Verification**
- `npx tsc --noEmit` → **0 errors** in an isolated copy of the tree at HEAD + these changes. In the
  live tree it reports 2 errors, both in `heat-transfer-area` and `reynolds-number`, which session
  `pharma-wallah-86` is mid-migration on — **not from this work**, confirmed by reverting only those two
  files to HEAD in the isolated copy.
- `npm run build` → **exit 0**. `/encyclopedia` **16.3 kB / 113 kB first load**; shared JS **88.5 kB**
  (baseline 88.4 kB, unchanged). **OpenChemLib (1.09 MB) and 3Dmol (568 KB) grepped for in every shared
  chunk: 0 hits** — both are lazy chunks, and `resources.<hash>.json` (1.35 MB) stays a lazy asset.
- Headless Chrome (CDP), **dev and `next start`**: desktop 1440×900 **54/54**, phone 390×844 **21/21**,
  0 console errors. Every tab count was asserted **against the API payload for that drug** (100
  interactions, 25 property rows, 8 substituents, 5 alternative parents, 40 name/reference entries),
  the 3,434-character toxicity field was measured on screen (3,292 chars rendered), the interaction
  filter was driven with a term taken from the data, the 2D image was confirmed drawn (CACTUS 200 in
  1.6 s) and the 3D canvas was confirmed **non-blank by decoding a screenshot of it** (ink 4.95 % of the
  plate, 172 distinct colours). Reduced motion: nothing left invisible. Biotech (Adalimumab) degrades
  with an explanation.
- **Screenshots read at both widths**, and they caught three things assertions did not: the 3D stage was
  squat (198 px tall inside a 1:1 frame → frame is now 3:4 in 3D mode, stage 311 px, molecule visibly
  larger), `MMFF94s⁺` rendered as a stray glyph in Outfit (now plain text), and an attempt to anchor the
  identifier ledger to the foot of the masthead put a 270 px hole in the middle of the column — reverted.
- **Isolation:** all of the above ran in a copy of the tree under this session's scratchpad with
  `node_modules` symlinked, on port 3007. **`.next` in the real tree was never touched**, so the two
  peer sessions' dev servers were unaffected (Known Issue 10).
- **NOT verified:** a real phone or tablet; iOS Safari; a real mouse/trackpad feel; screen readers;
  conformer generation time on a low-end device; dark mode (still unreachable site-wide, tracker F13);
  `/clinical/encyclopedia`, which is untouched and still runs the old `DrugSearch`/`DrugCard`. No test
  framework covers this page; lint is not configured.

**Remaining**
- Commit (the protocol forbids it here). Note the working tree also carries two **other** sessions'
  in-progress work — community, DiskDiffusion and five calculator tools — so commit selectively.
- `/clinical/encyclopedia` could now reuse `Monograph` (tracker P12).
- DrugBank licensing for an ad-supported site is still an owner decision (Known Issue 16).

**Next**
- Open a record on a real phone and try the 3D switch — pinch, spin, and how long the conformer takes.

---

### 2026-09-20 — Community rebuilt as a Reddit-shaped, pharmacy-scoped system

Session `db8f4631`, "follow protocol". User: "enhance my community functionality by a mile… proper
high end community functionality system", then "Like reddit", then "Should be related to pharmacy".
Two decisions taken by the user up front: **full Reddit model in new tables** (over extending
`questions`/`answers`, or a UI-only pass), and **posts with an optional Question type** (over pure
Reddit, or staying strict Q&A).

**Completed**
- **`supabase/migrations/20260920_community.sql`** — the first SQL ever committed to this repo.
  Eight `community_*` tables, 13 indexes, 8 triggers/functions, 24 RLS policies, 12 seeded pharmacy
  spaces, and a non-destructive backfill of the existing Q&A. Idempotent and additive: `questions`,
  `answers`, `votes` and `profiles` are read, never altered. **The owner must run it** — see Remaining.
- **Spaces** (the "subreddits"), seeded from what a Pharm-D student actually studies: Pharmacology,
  Pharmaceutics, Clinical Pharmacy, Pharmaceutical Chemistry, Pharmacognosy, Pharmaceutical Analysis,
  Calculations, Hospital & Community Practice, Exams & Study, Career & Licensing, Lab & Spotting,
  General. Each carries its own icon, accent, flair list and rules (the clinical ones carry
  de-identification rules; Calculations requires showing working).
- **Posts** in four kinds — discussion, question, link, image — with flair, tags, save, share,
  report, edit, soft delete, pin and lock. A Question post additionally gets an **accepted answer**
  (asker only) and an "Unanswered" feed filter.
- **Nested comments** to depth 8, with collapse (taking the subtree with it), a clickable thread
  line, inline reply, inline edit, soft delete that keeps replies readable, and top/new/old sorting.
- **Feed**: hot / new / top / rising, `top` with a day–all-time range, plus filters for space, tag,
  kind, unanswered and full-text search, infinite scroll with a keyboard-reachable Load-more, and a
  card/compact density toggle remembered per reader. All feed state lives in the **URL**, so a sort
  or a search is shareable and the back button steps through it.
- **Karma**, member profiles with handles, join/leave spaces, a private Saved list, and a moderation
  report queue with a fixed reason list.
- **Legacy URLs keep working.** `/community/ask` and `/community/question/:id/answer` are 308s in
  `next.config.mjs`; `/community/question/<old id>` is a server component that resolves the old id
  through `community_posts.legacy_question_id` and forwards to the new post.

**Files**
- New: `supabase/migrations/20260920_community.sql`; `src/lib/community/{constants,types,pure,server}.ts`;
  `src/app/api/community/**` (11 routes); `src/components/community/{kit,VoteControl,PostActions,PostCard,Feed,CommunityShell,CommentThread}.tsx`
  and `components/community/pages/{CommunityHome,SpaceView,SpacesIndex,SavedView,Submit,PostView}.tsx`;
  `src/hooks/useCommunityVote.ts`; `scripts/community.test.mts`.
- Rewritten: `src/app/(site)/community/page.tsx`, `error.tsx`; new routes `s/[slug]`, `post/[id]`,
  `submit`, `spaces`, `saved`; `question/[id]/page.tsx` became a redirect.
- Appended: `src/lib/rateLimit.ts` (three community limiters). Edited: `next.config.mjs` (2 redirects).
- Deleted: `src/components/community/ActionsMenu.tsx`, `src/hooks/useVote.ts` (both community-only,
  zero importers after the rebuild).
- Knowledge: this file, `.claude/{MEMORY (106–114), PROJECT_MAP, SKILLS}.md`, new skill
  `community-system`.

**Architecture & Decisions**
- **The community owns its own member table.** Posts/comments/votes FK to `community_members`, not
  `profiles`, because `profiles`' shape is not version-controlled and PostgREST embedding needs a
  real FK. `ensureMember()` creates the row on a member's first write.
- **The database owns every derived number** — score, up/down counts, karma, comment/post/member
  counts, hot rank, comment depth. Triggers *recompute* rather than increment, so a double-fire or a
  manual edit cannot drift a counter.
- **Voting is server-authoritative** (§6 rule 4). The browser posts a direction; the `community_vote`
  RPC decides cast/switch/toggle-off and returns the stored score, which the hook uses to overwrite
  its own optimistic guess. The retired `useVote` trusted its arithmetic with no way back.
- **Model B throughout** (MEMORY §3): anon client + cookies, RLS enforced. Unlike the rest of the
  app, **these policies are in the repo**, in the migration.
- **Soft delete** for posts and comments, so a thread does not collapse when one line is removed.
- **Markdown via react-markdown with no `rehype-raw`**, so a member cannot inject HTML; links are
  forced to `noopener` and non-http(s) hrefs are stripped; body images render as links, not embeds.
- **Spaces are not user-creatable** — `community_spaces` has a read policy and no insert policy, so
  even a crafted request cannot add one.
- Not done, by decision: image uploads (no hosting — image posts take a URL), notifications,
  a moderator UI (reports are read in the Supabase dashboard), and cross-posting.

**Verification**
- `npx tsc --noEmit` → **0 errors** (whole repo, after a peer session fixed 5 unrelated Recharts
  errors of its own — see Notes).
- `node --test scripts/community.test.mts` → **19 pass, 0 fail**: comment-tree nesting, sibling
  ordering, accepted-answer float, orphan retention, deleted-comment blanking, viewer flags, link
  scheme rejection (`javascript:`, `data:`, `vbscript:`, `file:`), tag normalisation, clamping,
  UUID/sort/kind guards, PostgREST embed normalisation.
- **The migration was run for real** against a throwaway **local Postgres 16** cluster
  (`/usr/lib/postgresql/16/bin`, no network, no Docker), with `auth.users`/`auth.uid()` and the
  legacy tables stubbed: applied clean, **run twice to prove idempotency** (no duplicate rows), and
  the backfill verified — legacy tags routed to the right spaces, an email-derived display name
  filled in, counters maintained by trigger. Behaviour tested: vote cast → switch → toggle-off
  returning the right score each time, karma recomputed, depth capped at 8, `reply_count`,
  cross-post reply refused, and the comment-tree RPC returning roots + all 13 descendants in one call.
  **RLS was tested from a `nobypassrls` role** (a superuser silently bypasses RLS): cross-member
  update and delete both affect 0 rows, a forged `user_id` insert raises a policy violation, another
  member's votes are invisible, own insert succeeds.
- **Four defects were caught during verification and fixed**, three of them only findable by
  actually running things:
  1. `round(double precision, int)` does not exist in Postgres — the hot-rank function failed on its
     first real run. Arithmetic moved to `numeric`.
  2. Backfilled scores produced **zero karma**, because karma only moves when the vote trigger
     fires. The migration now ends with a karma recompute pass.
  3. **The comment New/Old sorts did nothing.** The RPC uses `sort` only to choose *which* roots to
     load; the tree builder then re-sorted by score unconditionally, so all three tabs rendered the
     same order. `buildCommentTree` now takes the sort, with the accepted answer still pinned first.
     Two regression tests cover it.
  4. **A privilege hole: RLS is row-level, not column-level.** The `update` policies let a member
     edit *their own row* — which through a direct PostgREST call (bypassing the route handlers
     entirely) meant they could set their own `score`, `post_karma`, `view_count` or `is_pinned`.
     Closed with BEFORE UPDATE guard triggers that restore every database-owned column from `OLD`
     unless the session is privileged. Verified from a `nobypassrls` role: tampering is silently
     reverted, while a legitimate title/body edit, the view-counter RPC and a real vote all still
     work. See MEMORY gotcha 115 — **any new user-writable table needs the same treatment.**
- `npm run build` → **exit 0** in an **isolated copy** of the tree (a peer session's `next dev` owns
  `.next` on :3000 — Known Issue 10). All community pages and **11 API routes** emitted; shared JS
  **88.5 kB** (baseline 88.4), middleware 81.9 kB unchanged. `next start` on :3100: `/community`,
  `/submit`, `/spaces`, `/saved`, `/s/pharmacology` and `/post/<uuid>` all **200 with no server
  exception**, and `/community/ask` forwards to `/community/submit?kind=question`.
- **Community first-load JS is 219–228 kB**, against ~106 kB for a page-kit page — `react-markdown`
  plus `remark-gfm` is most of it. Acceptable for the richest interactive surface on the site, but
  it is the heaviest route family in the app; if it needs to come down, lazy-load the Markdown
  renderer (bodies are the only thing that needs it) before touching anything else.
- **Two self-inflicted verification traps caught and corrected mid-task**, worth knowing for the
  next isolated build: an `rsync` without `--delete` left deleted page files in the build copy, so
  an early run "verified" routes that no longer exist; and two builds briefly shared one `.next`,
  which failed with `rm: cannot remove '.next/server/app'`. Sync with `--delete`, and never run two
  builds against the same tree.
- **NOT verified:** anything requiring the live database — no post, comment, vote, save, join or
  report has been exercised end to end, because the migration is not applied and production reads
  were blocked in this session. No browser/CDP pass, no screenshots, no phone, no dark mode. Lint is
  not configured.

**Remaining**
- **The owner must run `supabase/migrations/20260920_community.sql` in the Supabase SQL editor.**
  Until then every `/community` route renders its error boundary. Nothing else is blocking.
- After applying it, walk one post end to end (post → comment → reply → vote → accept → save).
- Image uploads, notifications and a moderator UI are open decisions.
- The legacy `/api/qa/*` routes and `questions`/`answers`/`votes` tables are now unused by the UI —
  delete once the community is proven in production.

**Next**
- Apply the migration, then exercise the flow signed in and confirm karma and counters move.

---

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
| Type-check | `npx tsc --noEmit` | **PASSES — 0 errors, re-measured 2026-09-20** after the calculator migration finished (104/104 on the kit). The 4 transient errors a peer recorded in `(tools)/OpioidMMECalculator/page.tsx:229-231` were a `Set` spread needing `downlevelIteration` (gotcha 37) during that migration and are **fixed** — use `Array.from(...)`, not a spread, in this tsconfig. Any error you see now is yours. The app project: `npx tsc --noEmit -p mobile/tsconfig.json` → 0 errors (needs a generated `mobile/app/_generated`, i.e. one `npm run mobile:build`). |
| Lint | `npm run lint` | **NOT AVAILABLE.** No ESLint config; the command opens an interactive setup prompt. Do not report lint as passing. |
| Build | `npm run build` | **PASSES — re-verified 2026-09-20 after the calculator migration finished** (isolated copy of the tree; peers had agreed not to build in the shared root): exit 0, shared JS **88.5 kB**, middleware **81.9 kB**. All 104 calculators then swept against `next start` at 1440×900 and 390×844 — 104/104 HTTP 200, hydrated, **0 exceptions, 0 console errors, 0 horizontal overflow**. **Also 2026-09-20 after the AI Guide rebuild** (isolated copy; the peer dev server on :3000 was left alone): exit 0, shared JS **88.5 kB** (unchanged), `/ai-guide` **9.7 kB / 150 kB first load**, `/books-library` no longer emitted. **Also 2026-09-20, after the Disk Diffusion Lab rebuild** (in an isolated copy of the tree — two peer `next dev` servers were running on the shared root and had already corrupted its `.next`, MEMORY gotcha 126): exit 0, **277 route lines**, shared JS **88.5 kB**, middleware 81.9 kB, `/simulations/disk-diffusion` 49.1 kB / **241 kB first load**; jsPDF confirmed absent from the page chunk and present in its own, so the report no longer rides in the first load. One extra expected warning: `buffer-lab`'s ambiguous `duration-[2000ms]` class. **Earlier the same day: PASSES — after the `/encyclopedia` redesign** (in an isolated copy of the tree, the peer sessions' dev servers left alone): exit 0, shared JS **88.5 kB**, `/encyclopedia` **16.3 kB / 113 kB first load**, `/molecular-lab` 60.2 kB / 149 kB. OpenChemLib (1.09 MB) and 3Dmol (568 KB) are lazy chunks only — grep the built shared chunks for both and expect **0 hits** before shipping any new 3D consumer. Two 404s on `/_vercel/insights` and `/_vercel/speed-insights` appear under `next start` locally; they come from `Analytics` / `SpeedInsights` in `src/app/layout.tsx` and only resolve on Vercel — not a defect. **Earlier: PASSES — 2026-09-16 after Molecular Lab** (in an isolated copy of the tree, dev server left up): exit 0, shared JS **88.4 kB**, middleware 81.9 kB, `/molecular-lab` 59.5 kB / 148 kB first load, `resources.<hash>.json` 1.35 MB in `static/media`. The build also prints several `Dynamic server usage` stack traces (tournament leaderboard, DailyMed, AMR routes) — logged by those handlers, non-fatal, not new. **Before that** (again after the simple `/about-us`: exit 0, shared JS 88.3 kB, `/about-us` 106 kB first load). Earlier the same day: exit 0 in ~2.5 min, 252 route lines, shared JS **88.3 kB**, middleware 81.9 kB; `/calculation-tools/rf-value-calculator` 184 kB and `/cfu-calculator` 183 kB first load; `.next/static/media/opencv.<hash>.js` 10.8 MB emitted as an asset. Same expected warnings as below. **Earlier (2026-09-12):** with the dev server stopped, after the AdSense work (the first successful run since the PWA removal, the shadcn migration and the Outfit switch): exit 0, ~170 routes, middleware 81.8 kB, shared JS 87.8 kB. Stop `npm run dev` first — they share `.next` and corrupt each other (§7 Known Issue 10). **PASSES with a populated `.env`** — exit 0, ~170 routes emitted, middleware 81.8 kB, shared JS 87.8 kB. Only `/_not-found` is static; everything else is `ƒ` (dynamic, server-rendered on demand). **Without `.env` it FAILS**: `Missing environment variable: NEXT_PUBLIC_SUPABASE_URL` while collecting page data for `/api/admin/registrations`. Expected non-fatal warnings: the `@supabase/supabase-js` Edge-runtime `process.version` notice, the stale `caniuse-lite` Browserslist notice, and two webpack "Serializing big strings" cache notices. |
| Mobile build | `npm run mobile:build` | **PASSES (2026-09-22, ~3 min)** — re-measured after the iOS target landed and the three Capacitor plugins were installed: exit 0, **106 HTML files** under `mobile/out/calculation-tools/` (105 tools + the hub), CSS **88,734 bytes**, shared JS **88.3 kB**; **0** files match the JWT-shaped secret pattern and **0** contain an ad string. This one export now feeds three native targets — `cap sync android`, `cap sync ios` and the Tauri desktop build. **Earlier: PASSES (2026-09-20, ~2 min)** — after the calculator migration and the liquid-glass kit change: exit 0, **108 HTML files**, 106 entries under `mobile/out/calculation-tools/`, CSS **84,243 + 4,210 bytes**. The glass ships to the APK: `calcSheen`/`calcTide` and the `[@media(hover:none)]` phone path are all present in the exported CSS, and the export renders at 390 px with `backdrop-filter: none`. **Earlier (2026-09-16, ~2 min)** — 105 HTML files under `mobile/out/calculation-tools/`, home `/` 125 kB first load, shared JS 88.2 kB, CSS **113,194 bytes**, `mobile/out` 22 MB (OpenCV.js is 10.8 MB of it). Secret scan: use the JWT-shaped pattern (gotcha 90). **Earlier (v1.1):** 109 static pages, 108 HTML files, 105 under `mobile/out/calculation-tools/`, shared JS 87.9 kB, CSS in two files **98,751 + 4,210 bytes**, 12 MB (re-measured 2026-09-13 by the v1.1 APK build, with 85 of 104 tools on the kit; 103,829 + 4,210 before). Independent of `.env` and safe to run while `npm run dev` is up (separate `mobile/.next`). **Also assert zero ad strings in `mobile/out`** — see `.claude/skills/adsense-monetization/SKILL.md`. A ~10 KB stylesheet is the silent Tailwind failure (gotcha 23). |
| iOS sync | `npm run ios:sync` (i.e. `cap sync ios`) | **PASSES (2026-09-22, ~4 s after the build)** — exit 0 on **Linux**; Capacitor 8 uses the SPM template so no CocoaPods is involved. Reports **3 Capacitor plugins for ios** (`@capacitor/filesystem@8.1.3`, `@capacitor/keyboard@8.0.5`, `@capacitor/share@8.0.2`) and rewrites `ios/App/CapApp-SPM/Package.swift`. Also assert: `Info.plist` parses with `plistlib` and has **zero** `*UsageDescription` keys, and `ios/App/App/public/calculation-tools` holds one `index.html` per tool. **There is no iOS build baseline** — compiling needs Xcode on macOS and has never been done (§7 Known Issue 21). Do not report the iOS app as building. |
| APK | `npm run mobile:apk` | **PASSES (2026-09-20, v1.4 / versionCode 5, ~2 min)** — signed V2 release APK **9,369,674 B (8.9 MB)**, certificate SHA-256 `afe4c18e…5b03` **unchanged from v1.3**, so it installs as an update; published file byte-identical to the Gradle output; 104 tool pages inside. **Earlier (2026-09-16, v1.3 / versionCode 4, ~2.5 min)** — signed V2 release APK **9,347,799 B** (8.9 MB), same certificate SHA-256 `afe4c18e…5b03` as v1.2; published file byte-identical to the Gradle output. **Earlier:** (2026-09-14, v1.2 / versionCode 3, built by `pharma-wallah-4b` — new launcher icon + redesigned Serial Dose tool) — signed V2 release APK, 5,945,495 B, copied to `public/downloads/`; same certificate as v1.0/v1.1. Needs JDK 21 (auto-selected) and `android/keystore.properties`. Check `aapt dump badging` for the version and `apksigner verify --print-certs` for the certificate. |
| Tests | `node --test scripts/pharmacy-counter.test.mts` · `node --test scripts/tlc-rf.test.mts scripts/colony-counter.test.mts` · `node --test scripts/molecular-lab.test.mts` · `node --test scripts/community.test.mts` · `node --test scripts/ai-guide.test.mts` · `node --test scripts/dissolution-rate.test.mts` | **47 pass, 0 fail** (2026-09-20, Community Pharmacy pure layer, ~0.5 s — case-data integrity, the check grader, verification truths, labels, expiry, inventory, the calculators, scoring) · **41 pass, 0 fail** (2026-09-16; 21 TLC + 20 colony, ~10 s) · **21 pass, 0 fail** (2026-09-16, Molecular Lab, ~12 s, real OpenChemLib) · **19 pass, 0 fail** (2026-09-20, community pure layer, <1 s) · **34 pass, 0 fail** (2026-09-20, AI Guide pure layer — request clamps, Gemini history rules, NDJSON framing, study modes — <1 s). · **28 pass, 0 fail** (2026-09-22, Dissolution Rate Constant pure layer — every column of the supplied practical sheet, both k columns proven distinct, the average against 0.000291833 and against each rejected averaging range, division-by-zero paths, duplicate/backwards times, both notations — <1 s). These cover seven features' pure modules only — there is no framework, no CI, and nothing else is tested. Report them by name. **The community's SQL is verified separately** by running its migration twice against a throwaway local Postgres 16 and asserting RLS from a `nobypassrls` role — see the `community-system` skill. |

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
