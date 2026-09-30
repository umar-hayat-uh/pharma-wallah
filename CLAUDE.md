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
node --test scripts/split-for-ads.test.mts                             # 6 unit tests, lesson ad spacing
node --test scripts/battle-royale.test.mts                             # 23 unit tests, Battle Royale schemas/format/station/titles
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
- **Calculation tools hub.** 105 tool directories exist; `HUB_SUBJECTS` in
  `src/app/(site)/calculation-tools/tool-index.ts` lists **94 unique tools** (99 entries — five tools appear under two subjects, MEMORY 165; corrected 2026-09-23) across 10 categories (re-counted
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

### 2026-09-30 — Battle Royale: full names, certificates by name, time-first ranking, Top-10 SQL

"follow protocol": leaderboard showed "Umar H." instead of full names; players forget Player IDs, so find
the certificate by picking your name from a dropdown (no email); an SQL to extract the Top 10. Mid-task:
"ranking is not correct — the shorter the time, put them up".

**Completed**
- **Full names on the board, always.** The board shortened names because `br_settings.show_full_names`
  defaults to off; the projection now prints `name` as stored, the admin toggle is gone, and the Upstash
  cache key moved to `v2` so cached "Ayesha K." rows die at deploy. (The station greeting still uses the
  short form — it is not the board.)
- **Certificate by name.** `/battle-royale/status` now leads with a type-to-search dropdown: pick your name
  (university + Player ID shown to tell namesakes apart — the live data has two "Kinza zafar") and the
  score, titles and certificate open with Download PDF / image. Only registered players who finished a
  battle are listed. Player ID + email remains behind a link for the pre-battle tracker and is hidden once
  the tournament is closed. Station finish screen and How to play copy updated to "pick your name".
- **Ranking: total, then shorter battle time** — Round 3 no longer breaks ties. New
  `supabase/migrations/20260930_battle_royale_ranking.sql` (view, index, rule text; idempotent), also
  appended to `supabase/battle_royale_setup.sql`. Tie copy updated on the leaderboard, FAQ and instructions.
- **Top-10 SQL**: `supabase/queries/battle_royale_top10.sql` — rank, Player ID, name, email, phone,
  university, year, student ID, rounds, total, correct, battle time, status, finish time (PKT).

**Files**
- New: `src/app/api/battle-royale/certificates/route.ts`, `src/lib/battle-royale/result.ts`,
  `src/components/battle-royale/{CertificateSearch,ResultView}.tsx`, the migration and query above.
- Edited: `leaderboard.ts`, `status/route.ts` (now uses `readResult`), `types.ts` (`ResultPayload`,
  `CertificateMatch`; `showFullNames` removed), `format.ts` (`certificateQuery`), `server.ts`, `schemas.ts`,
  `admin/settings/route.ts`, `SettingsForm.tsx`, `StatusClient.tsx`, `status/page.tsx`, `instructions/page.tsx`,
  `constants.ts`, `LeaderboardClient.tsx`, `battle/Panels.tsx`, `rateLimit.ts` (`brLookupLimiter`, 60/min/IP),
  `scripts/battle-royale.test.mts` (+1 test).

**Architecture & Decisions**
- **No email check on the name lookup, deliberately**: it returns only what the public board already shows
  (plus titles derived from it). Payment state, email, phone and Game Code stay out (MEMORY 186).
- **The migration does not re-label winners.** On the live data the new order swaps 10th and 11th — Syeda
  Maha Fatima (155, 3:28.8) moves into the Top 10 and syeda mehak (155, 3:50.7) drops out. Who gets the
  prize is the owner's call, so the SQL changes only the order; Unfinalise → Finalise applies it.
- The `show_full_names` column is left in the database, unread (no destructive migration).

**Verification**
- `npx tsc --noEmit` → 0 errors. `node --test scripts/battle-royale.test.mts` → **23 pass**.
- `npm run build` → exit 0, shared JS **88.6 kB**, middleware **81.9 kB** (unchanged); `/battle-royale/status` 162 kB.
- Throwaway Postgres 16: `battle_royale_setup.sql` applied twice, the migration re-run on a finalised board,
  the screenshot's 11 players seeded — the 165s now order 2:40, 2:59, 3:00, 3:45, 4:22, 4:46; the Top-10
  query returns the expected 10 rows.
- Dev server against live Supabase (**GET only**): search by name, multi-word, Player ID prefix, and
  wildcard input (→ nothing); certificate by code (winner design for rank 1), 404/400 paths; full names on
  the board. Headless Chrome at 1440 and 390: type "kinza" → 2 options → keyboard select → Certificate of
  Participation rendered, 0 console errors, 0 overflow. Screenshots read.
- **NOT verified:** the migration on the real Supabase (owner runs it); PDF/PNG download clicks; Safari; a real phone.

**Remaining (owner)** — run `supabase/migrations/20260930_battle_royale_ranking.sql` in the Supabase SQL
editor; then, if the Top 10 should follow the new order, admin → Results → Unfinalise → Finalise. Deploy.

### 2026-09-29 (later) — Battle Royale: "Close tournament" admin button

Same session. User: an admin button that closes registration and arena play and leaves only the
leaderboard public. Asked: certificates still need the result page after closing → user chose
**keep "My result & certificate"** alongside the leaderboard.

**Completed**
- Admin overview → **Close tournament** (red, confirm dialog listing exactly what happens, warns
  when battles are still running) / **Reopen tournament**. Closing sets `event_closed`, turns
  online registration and battles off, and freezes the board (an earlier freeze time is kept).
  Reopening only clears `event_closed`; the switches stay off until someone turns them on.
- While closed: `/battle-royale` becomes "Tournament closed · Thanks for playing" with two buttons
  (Leaderboard, My result) and the podium; `register`, `instructions`, `success` and `battle` (the
  arena) redirect to it; the footer drops its Rules link; the home-page section drops "Join the
  battle" and reads "The final podium"; the result page stops telling unplayed players to go play.
- Server guards: desk registration refused (409), and the settings switches/form refuse to turn
  registration or battles back on while closed ("Reopen the tournament first").

**Files** — new `supabase/migrations/20260929_battle_royale_closed.sql` (one column, also appended
to `supabase/battle_royale_setup.sql`), `admin/CloseTournament.tsx`; edited `server.ts`
(`event_closed` → `eventClosed`, tolerant of an older database), `types.ts`, `schemas.ts`
(`close`/`reopen`), `admin/results` (the two actions + a "run the migration" message),
`admin/settings`, `admin/participants`, `status` route, the admin overview, the menu, register,
instructions, success, battle, leaderboard and status pages, `LeaderboardClient`, `StatusClient`,
`HomeBattleSection`, `sections.tsx` (`EventFooter closed`).

**Architecture & Decisions**
- **A real column, not a derived state.** "Frozen + both switches off" also describes the normal
  verify-before-finalise step, so deriving "closed" from it would hide the site by accident.
- Pages redirect with `redirect()`; under the event's `loading.tsx` that arrives as a streamed
  client redirect (HTTP 200 + `NEXT_REDIRECT`), not a 307 — MEMORY 183.
- The arena is hidden too, so a station reloaded after closing can't finish syncing; the confirm
  dialog says how many battles are still running for exactly that reason.

**Verification**
- `npx tsc --noEmit` → 0 errors; `node --test scripts/battle-royale.test.mts` → 22 pass;
  `npm run build` (isolated copy) → exit 0, shared JS 88.6 kB, middleware 81.9 kB (unchanged).
- Closed mode forced through `getPublicSettings` **in an isolated copy only** (live Supabase,
  read-only; the repo file was never changed), dev server on :3217, Chrome over CDP: register,
  instructions, success and battle all end on `/battle-royale`; the closed menu, the leaderboard
  and the status page render with 0 console errors and 0 overflow at 1440 and 390; no Rules link.
  Screenshots read.
- **NOT verified:** the admin button against a database (needs an admin session and a write — the
  close/reopen actions and the 409 guards are type-checked only); the migration was not run on a
  throwaway Postgres (a single `add column if not exists`); the open-state pages were not re-shot.

**Remaining (owner)** — run `supabase/migrations/20260929_battle_royale_closed.sql` in the
Supabase SQL editor. Until then the site works as before, and pressing Close says which file to run.

### 2026-09-29 — Battle Royale: home-page podium, simple game menu, e-certificates, titles; home hero fits the screen

Session `e85952b5`, "follow protocol" + two reference images (a 1-2-3 trophy podium under spotlights,
a navy/gold certificate). Mid-task the user added: remove the gap between the header and the home
hero and keep the calculator buttons in the first screen.

**Completed**
- **Podium on the home page, under the hero** — live top 3 (2 · 1 · 3 blocks, gold/silver/bronze
  cups, three stage lights on the brand surface), "Join the battle" + "Full leaderboard". Empty places
  read "Your name here". It **retires itself** 14 days after `br_settings.event_date`, and renders
  nothing if the event tables can't be read. The same `Podium` replaces the three cards on
  `/battle-royale/leaderboard` (TV mode gets the large size).
- **`/battle-royale` is a game main menu now**: three big buttons — Register · Play · My result — plus
  Leaderboard / How to play links, the podium, three steps, three rounds and "What you can win" with the
  title list. The five-tab `EventNav` is gone: sub-pages get one "← Battle Royale menu" link. The five
  info cards, six-step list and FAQ left the landing (the FAQ lives on the instructions page).
- **Instructions → "How to play"**: 12 sections + side menu → 7 plain sections; fixed stale v1 copy
  that told players to re-enter their Player ID on another station (v2 = desk re-issues a code).
- **Titles** (`src/lib/battle-royale/titles.ts`): Flawless, Precision Master (≥90%), Speed Demon (≤½
  the allowed time with ≥60%), Quiz Master / Match Maker / Word Hunter (a perfect round), Sharp
  Shooter (≥75%), Battle Tested (everyone). Shown on the station's finish screen, the result page
  and the certificate.
- **E-certificates**: `/battle-royale/status` → "My result & certificate". After the battle, Player
  ID + email shows score, rank, every title with its reason, and a certificate drawn on a canvas
  (preview, **PDF** via lazy jsPDF, **PNG**). Two designs: **Certificate of Achievement** (gold title,
  gold swoosh and frame, gold medal carrying "2nd PLACE") for the Top N once results are final;
  **Certificate of Participation** (brand blue→green medal) for everyone else, available the moment the
  battle ends. Both carry the name in a script face, university, score, accuracy, headline title,
  date, Player ID and the PharmaWallah mark. The station's finish screen now tells the player where to
  get it.
- **Home hero fits one screen**: top padding cut from ~144 px to ~12–28 px, and the headline is also
  capped by viewport height, so headline + lede + both calculator buttons are visible at 1366×700 and
  1920×920. Phones unchanged.

**Files**
- New: `src/lib/battle-royale/titles.ts`, `src/components/battle-royale/{Podium.tsx,podium.css,HomeBattleSection.tsx}`,
  `src/components/battle-royale/certificate/{draw.ts,Certificate.tsx}`.
- Rewritten: `(site)/battle-royale/page.tsx`, `instructions/page.tsx`, `EventNav.tsx`, `StatusClient.tsx`.
- Edited: `api/battle-royale/status/route.ts` (+titles, +certificate, selects `university`,
  `public_plan`, `round_results`), `lib/battle-royale/types.ts` (`StatusPayload.titles/certificate`,
  `CertificateData`), `status/page.tsx`, `LeaderboardClient.tsx`, `battle/Panels.tsx`, `SuccessCard.tsx`,
  `src/app/page.tsx`, `Home/landing/LandingPage.tsx` (`battle` slot), `Home/landing/landing.css` (hero),
  `scripts/battle-royale.test.mts` (+5 tests).

**Architecture & Decisions**
- **Titles are absolute, never rank-based**, so a participation certificate downloaded straight after
  playing can't become wrong as others play. Placing only appears on the winner certificate, which
  waits for finalising (the skill's "don't label winners before finalising").
- **No schema change.** Titles derive from `br_scores` + the attempt's `public_plan`/`round_results`.
  The certificate is generated in the browser from the status payload — nothing stored or uploaded;
  it stays behind the existing Player ID + email check and rate limiter.
- **Canvas, not SVG** — an SVG rasterised through `<img>` drops web fonts. Great Vibes (name) is loaded
  with `next/font` inside `Certificate.tsx` only; Outfit's family is read from `--font-outfit`.
- **No forged signatures**: the sign-off is the date and "PharmaWallah" (organisation) in script.
- The home section is a server component streamed in `<Suspense fallback={null}>` through a `battle`
  slot on the client `LandingPage`, so a slow Supabase read never delays the hero.

**Verification**
- `npx tsc --noEmit` → 0 errors. `node --test scripts/battle-royale.test.mts` → **22 pass** (17 + 5 titles).
- On the user's dev server (live Supabase, **read-only**; three real rows on the board), Chrome over CDP:
  home at 1920×920, 1366×700, 1440×900 (hero + buttons in view) and the podium at 1440 and 390;
  `/battle-royale` at 1440 and 390; leaderboard 1440; instructions and status 390 — **0 console errors,
  0 horizontal overflow** everywhere. Screenshots read; they caught the podium hugging the left edge
  (a list reset overriding `mx-auto`, MEMORY 181) — fixed.
- Both certificate designs rendered through a temporary route (deleted) and read: fonts, logo,
  medal, text fit.
- `npm run build` (isolated copy; the user's dev server was left running) → **exit 0**, shared JS
  **88.6 kB**, middleware **81.9 kB** (both unchanged); `/` 223 kB, `/battle-royale` 107 kB,
  `/battle-royale/status` 160 kB first load (jsPDF stays a lazy chunk).
- **NOT verified:** a real status lookup end to end (no participant's email to use, and production was
  kept read-only) — the route change is type-checked only; the PDF/PNG downloads (buttons rendered,
  not clicked); Safari (canvas `letterSpacing` needs Safari 17 — older engines draw unspaced); print;
  dark mode. Lint is not configured.

**Follow-ups the same session (user feedback)**
- **Podium lights**: the side lights were placed against the panel's edges and tilted, so they missed
  blocks 2 and 3. They now sit in a layer as wide as the stage, each centred on its own column and
  pointing straight down (`Podium.tsx`, `podium.css`). Re-screenshotted at 1366 and 390.
- **Round 1 picture** (`RoundVisual` in `sections.tsx`) still drew the v1 letter-blocks game; it is now a
  miniature word search — a 7×5 letter grid with ASPIRIN found and the word list (menu and How to play).

**Remaining**
- Look up one real player on `/battle-royale/status` and download both formats.
- No certificate verification page (the certificate prints the Player ID and the event URL only).

**Next**
- After finalising results, open a Top-10 player's result page and check the gold certificate shows the place.

### 2026-09-27 — Battle Royale event app (`/battle-royale`)

Session `pharma-wallah-af`, "follow protocol" + the event PDF + a 39-section spec. User decisions:
**Battle Royale** name (PDF), **online + desk registration**, **letter-block** Round 1, **zod +
react-hook-form** added; later "always show the registration form".

**Completed**
- Landing, register, success (printable), instructions (rules/scoring from settings), check-in,
  results, live leaderboard with TV mode, and the **arena**: a game title/loading screen that tracks
  real boot steps → Player ID + Game Code gate → Press Start → 3-2-1 → round intros → Word Block /
  Column Matching / Final Quiz with per-question server timers → feedback → finish. Route
  `loading.tsx` is a branded loading screen.
- Admin (`admin`/`desk` roles in `br_admins`): overview + live switches, participants (filters,
  drawer, desk registration, payment, check-in, slot, disqualify, reset attempt, final status,
  emails), sessions, questions, results (freeze → finalise → notify), email log with resend, settings.
- Six Resend emails, all logged; a failed send never undoes a registration.

**Architecture & Decisions** — see MEMORY 171–175 and the `battle-royale` skill. Game engine is
plpgsql (grading, timers, totals); browser never sends a score, a participant id or a time; answer
key revealed only after recording; brand tokens used over the spec's hexes.

**Verification**
- `npx tsc --noEmit` → 0 errors. `node --test scripts/battle-royale.test.mts` → **12 pass**.
- Migration + seeds applied twice (idempotent) on a throwaway Postgres 16;
  `scripts/battle-royale-engine.test.sql` → all assertions pass, anon/authenticated locked out.
- Local Supabase stand-in (PostgREST + proxy): API e2e **64/64**; headless Chrome full battle
  **20/20 at 390 touch, 19/19 at 1440, 19/19 reduced motion**; edge paths (timeout, partial
  auto-submit, reload-resume, device takeover) **10/10**; public pages + form registration **21/21**
  at both widths; admin pages by role **15/15**; 0 console errors. Screenshots read.
- Bugs found and fixed by those runs: online registration always failed (MEMORY 171), correct-count
  disagreed with question count on matching boards, Player ID wiped after a wrong code, HUD jumped
  a round on feedback, a smuggled `score` field was silently accepted (now 400).
- `npm run build` (isolated copy, dummy Resend key — `/api/contact` needs one at build) → exit 0.
- **NOT verified:** real Supabase, real Resend delivery, a real phone, print dialog, dark mode.

**Remaining (owner)** — run the migration + question seed in Supabase, add yourself to
`br_admins`, set event date/venue in admin Settings, turn on "Battles can start" on the day.
Have a pharmacist read the question seed. Until the migration runs, submitting the form fails.

### 2026-09-27 (later) — Battle Royale v2: desk-issued single-use codes, offline station, word search

Same session. User: code given only by the admin after payment approval and usable once; fewer API
calls and questions kept on the device for bad internet; leaderboard in Upstash; Round 1 as a word
search like a reference image; a flow map of every screen. Decisions (asked): code-only entry;
no device timing trusted (no speed bonus, server-measured tie time); word list shown; flow map.

**Completed** — `supabase/migrations/20260928_battle_royale_v2.sql` (idempotent upgrade; v1 codes
cleared unless used; per-round engine; word-search generator; `notify pgrst`), rewritten station
(`battle/BattleApp.tsx`, `station.ts`, `WordSearch.tsx`), routes `battle/submit` + `status` (check-in,
results, serve, answer removed; old pages redirect), Upstash leaderboard cache (20 s, invalidated on
finish/admin actions, fails open), admin Approve & issue code + printable slip + re-issue, emails
without codes, `supabase/battle_royale_setup.sql` regenerated (v1+v2+questions+2 admins).
Flow map: https://claude.ai/artifact/HDPyC8TJ1f3UUzuLqjfKNy

**Verification** — tsc 0 errors; `node --test scripts/battle-royale.test.mts` **17 pass**; engine v2
SQL suite passes (forged word path refused, late round = 0, idempotent retry, single-use codes,
re-issue resumes); setup file applied twice to a fresh DB; API e2e **35/35**; browser battles
**13/13 desktop (tap-tap + mouse drag), 13/13 phone (touch drag), 15/15 offline** (round queued,
reload offline, synced on reconnect). Bugs found and fixed by these runs: drag dropped by a
state race (MEMORY 178), code slip wiped by a remount (176), stale PostgREST cache (177), crash on
a v1 database (179 — the user hit it). `npm run build` → see §9. **Not verified:** real Upstash,
real Supabase, real Resend, a physical phone.

**Remaining (owner)** — run the v2 migration (or the setup file on a fresh project); create the
admin accounts, then the admin grant at the bottom of the setup file.

### 2026-09-23/24 — Lesson files out of `public/`; 3–5 ads per content page (continuation)

Session `pharma-wallah-b5`, "follow protocol — yesterday got cut off, pick it up and finish". The
2026-09-23 session below got two more requests after its report and was cut off mid-verification
(its `npm run mobile:build` was killed, exit 137). The code was already written; this session
reconstructed the plan from that transcript, verified it, fixed one defect it exposed, and synced
the docs.

**The two requests** (user, 2026-09-23): *"these files are like the content lessons so no need to
show them"* (the `public/content/` markdown), and *"every page should show at least 4–5 ads"*.
Asked how, the user chose **"4–5 on content pages"**: dense on pages with real content, none on
sign-in, dashboard, 404, timed tests, tournament, simulations and AI tools, which Google's policy
forbids ads on and which the review is judged against.

**Completed**
- **`public/content/` → `content/`** (69 files, `git mv`, staged). The markdown is no longer served
  raw at `/content/…` (verified 404), which removes both the unstyled duplicates of every lesson
  and the publicly reachable textbook-derived drafts for the ten unregistered subjects. Lessons
  still render: `src/lib/courses/content.ts` reads from the new root, and Next's file tracing
  bundles all 69 into the unit route. The visitor-facing "Place `public/content/…`" message on a
  missing lesson now says "This lesson isn't available right now".
- **Ad placements** (full table in the `adsense-monetization` skill), measured on a dev server:
  course lessons **3–5** (22/22 published units checked), calculators **3**, the calculator hub
  **4**, histology and pathology lessons **3**, powder-microscopy lessons **2**, the spotting hub,
  flash cards and course subject listings **1**; `/signin` and `/encyclopedia` **0**.
- **In-content lesson ads are spaced by word count, not by position.** New pure
  `src/lib/ads/split-for-ads.ts` cuts the markdown only at `##`/`###` headings outside fenced
  code, at most 4 times, at least 350 words apart and never in the last 150 words, so ads never
  outnumber content. On a 21,000 px lesson the 5 ads land ~4,000 px apart.
- **`src/lib/adsense.ts`**: the publisher ID in one place. `AdSlot` used to read only
  `NEXT_PUBLIC_ADSENSE_CLIENT`, so **no ad unit could render in production unless that variable
  was also set in Vercel** even with slot IDs filled in; it now shares the layout's hardcoded
  default. It is `undefined` in the packaged apps, so the literal never reaches them.
- **Ads never reach a student's PDF or printout**: every `AdSlot` carries
  `data-html2canvas-ignore` and `print:hidden`.
- **Fixed (pre-existing, found while verifying): every lesson with inline code failed to
  hydrate.** react-markdown 10 does not pass `inline` to the `code` renderer, so each
  `` `-NH₂` `` rendered as a dark `<pre>` block inside a `<p>` (MEMORY 169). Now `pre` owns the
  block style and `code` is an inline chip. This mattered twice over: the pages were visibly wrong,
  and a hydration failure re-renders the whole tree, including freshly placed ads.

**Files**
- Moved: `public/content/**` → `content/**` (69). New: `src/lib/adsense.ts`,
  `src/lib/ads/split-for-ads.ts`, `scripts/split-for-ads.test.mts`.
- Edited: `src/lib/courses/{content,types}.ts`, `src/components/course/{UnitPageClient,MarkdownRenderer}.tsx`,
  `src/components/calculators/{AdSlot,CalcAbout}.tsx`, `src/app/layout.tsx`, `src/app/robots.ts`
  (comment), `HubCatalogue.tsx`, `HistologyLessonTemplate/index.tsx`, the 15 pathology lesson
  pages, the 3 powder lessons, `spotting/page.tsx`, `flash-cards/page.tsx`.
- Knowledge: this file (§5, §7, §9), `.claude/{MEMORY (168–170), PROJECT_MAP, ROADMAP,
  redesign-tracker}.md`, skills `adsense-monetization`, `course-content-system`, `roadmap-status`.

**Architecture & Decisions**
- **One new, optional slot variable**: `NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR_INLINE`, falling back to
  `_CALCULATOR`, so no extra ad unit has to be created unless separate reporting is wanted.
- **`/encyclopedia` got no ads, deliberately** — its DrugBank text is the replicated content the
  Publisher Policies name (Known Issue 16/22).
- **Flash cards get one ad, below the grid**: the grid is inside animated containers, where an ad
  breaks viewability (gotcha 29).

**Verification**
- `npx tsc --noEmit` → **0 errors**. `node --test scripts/split-for-ads.test.mts` → **6 pass**
  (including a lossless split of all 69 real lesson files); community 19 and AI Guide 34 still pass.
- `npm run build` (isolated copy) → **exit 0**, shared JS **88.6 kB**, middleware **81.9 kB**
  (both unchanged); lesson route 271 kB first load.
- `npm run mobile:build` → **exit 0**, CSS 84,566 + 4,210 B; **0 files** in `mobile/out` contain
  `ca-pub`, `adsbygoogle`, `googlesyndication`, `data-ad-client` or the publisher number.
- `npm run desktop:build` + `desktop:audit` → **PASSED** (402 files, 0 remote subresources, no ad
  network).
- Dev server (isolated, :3217): the placement counts above; 22/22 lesson units 200 with content;
  `/content/industrial-pharmacy/…md` → **404**. Headless Chrome on three lessons: **0 console
  errors** after the markdown fix (3 hydration errors before), 0 `<pre>` inside `<p>`, inline code
  grey, fenced blocks dark. Screenshots read: a calculator at 1440 (aside + pre-FAQ ads sit
  cleanly), a lesson at phone width.
- **NOT verified:** a real ad — every slot ID is still blank, so production renders none; the
  lesson PDF export with ads present (`data-html2canvas-ignore` is html2canvas's documented
  attribute, not exercised); a real phone; dark mode. No test framework beyond the pure-layer
  suites; lint is not configured.

**Deployed and verified live (2026-09-24)** — committed by the user as `8527e56`, all five
`NEXT_PUBLIC_ADSENSE_SLOT_*` set in Vercel (units created as **Display ads**, responsive). Live
crawl of www.pharmawallah.com: **236 URLs, 0 non-200**; every indexable page has a www canonical;
sitemap 217 URLs, none non-200 or noindexed; no placeholder/template strings. Real slot IDs are in
the served HTML: lessons 5, calculators 3 (three distinct units), hub 4, pathology 3, powder 2,
sign-in / encyclopedia / dashboard 0. `/content/*.md` → 404. Apex and http now **308** to www
(the owner fixed the Vercel redirect). Community feed and `/api/contact` validation work in
production. No ad has been observed *filling* — that needs AdSense approval.

**Remaining**
- Owner, in AdSense: create ad units and set `NEXT_PUBLIC_ADSENSE_SLOT_LESSON`, `_LIST`,
  `_CALCULATOR`, `_CALCULATOR_FOOTER` (optionally `_CALCULATOR_INLINE`) **in Vercel**. Until then
  every placement renders nothing, which is correct while the review is pending.
- Owner steps in Known Issue 22 before requesting the review.

**Next**
- Deploy, then request the AdSense review once the sitemap has been recrawled.

### 2026-09-23 — AdSense "Low value content" rejection: site-quality pass

Session `pharma-wallah-bb`, "follow protocol". The user pasted AdSense's rejection ("Low value
content") and Google's thin-content, spam and Publisher Policies pages, and asked for everything to
be fixed so AdSense can start. Audited first — a live crawl of all 226 reachable URLs plus a code
sweep — then fixed; two sub-agents took the spotting and clinical sections, on disjoint files.

**Completed**
- **Unique metadata on every page.** 173 of 216 live pages (every calculator, the home page) were
  `<title>PharmaWallah</title>` / "AI-powered pharmacy platform". New `src/lib/seo.ts` + an
  `x-pathname` header from middleware let the root layout describe ~130 client pages it could not
  before; `(tools)/layout.tsx` describes every calculator from the registry. Local crawl after:
  **230 distinct titles of 235 pages** (the 5 repeats are sign-in and query-string variants, both
  handled). Absolute www canonicals everywhere, `metadataBase`, OpenGraph.
- **`robots.txt` and `sitemap.xml`** (both were 404). Sitemap: 217 URLs, derived from the tool,
  course, MCQ and lesson registries. Robots disallows `/api/`, `/admin`, `/dashboard`, `/content/`.
- **Clinical subdomain duplication**: it serves the whole main site; every page on it now
  canonicalises to www, and its `/` to www `/clinical`.
- **`noindex`** on sign-in/up, password pages, the dashboard, the ended tournament and `/pw`,
  community submit/saved, the prescription reader, the four clinical resource search shells,
  semesters and subjects with no MCQ bank, the orphan histology lesson, and the 404 page.
- **9 broken internal links → 0**: histology prev/next chain (4 pages), the spotting hub's
  trailing-space pathology link, four pathology breadcrumbs, five missing powder-microscopy
  lessons, `/dose-calculators`, `/clinical-calculators`, `/drug-tools`, `/tools`, `#tools`, and the
  course unit breadcrumb (`/courses/sem-1` → `/courses#semester-1`).
- **Placeholder and template content removed**: fake phone numbers (footer on 203 pages, contact,
  mentor), `href="#"` social icons (kept only the real Instagram), 41 "Coming Soon" MCQ cards (only
  the 4 subjects with banks are listed), `/documentation` (the purchased template's own docs,
  titled "Featurs | Crypgo"), `/mentor` (a copy of `/contact`), `flash-cards/sample`, the 404 title
  "404 Page | Venus", a mock clinical dashboard with a fabricated patient, a "coming soon" clinical
  card, "Prototype" labels, a developer-facing "add a `videoUrl` prop" message, and "Pakistan's #1
  Pharmacy eLearning Platform" in the header.
- **Forms that faked success now send.** `/contact` and `/careers` waited 1.2 s, said "sent" and
  discarded the message. Both post to `/api/contact`, which gained validation, clamping, HTML
  escaping (it interpolated raw input into email HTML), a 5/10-min IP limiter, and a check of
  Resend's returned `error` (it reported success on failed sends — MEMORY 166).
- **False statements corrected**: FAQ rewritten (Indian exams, "thousands of questions" — there are
  660, "no accounts", "professors", "downloadable PDFs for most material"); privacy policy
  rewritten (said no registration exists and named Google Analytics; now discloses accounts,
  Vercel Analytics, Gemini, Resend, Upstash, and AdSense third-party cookies with Google's opt-out
  links); inflated figures fixed (clinical encyclopedia "17.4K+/50K+/100K+", "17,430+" in two
  places, landing "97 calculators, 69 lessons" → derived 105 / 22, hub "99" → 94 unique, spotting
  "24+ lessons" → 34, MCQ "46 subjects"). Old `vercel.app` domain removed from privacy and terms.
- **Community feed fixed** — it returned "Database error" in production for every request
  (PostgREST `PGRST201`, MEMORY 164) although 12 posts existed. Post pages also get their own title.
- **Middleware** now strips a client-sent `x-subdomain` (MEMORY 163).

**Files**
- New: `src/lib/seo.ts`, `src/lib/mcq-availability.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`.
- Deleted: `(site)/documentation`, `(site)/mentor`, `(site)/flash-cards/sample`,
  `src/components/Documentation/*`, `src/components/Clinical/ClinicalDashboardPreview.tsx`
  (redirects in `next.config.mjs`).
- Edited: `src/middleware.ts`, `src/app/layout.tsx`, `src/app/not-found.tsx`, `(tools)/layout.tsx`,
  `tool-index.ts`, `HubCatalogue.tsx`, footer, header, `contact`, `careers`, `faqs`, `privacy`,
  `terms`, the three MCQ pages, `api/contact`, `lib/rateLimit.ts`, community post routes and page,
  `UnitPageClient.tsx`, landing `data.ts`, flash-cards, DilutionLab PDF footer, DDI lib/route/model
  strings; the spotting tree (sub-agent: hub, powder lessons + test, pathology breadcrumbs,
  histology chain and test, lesson template); the clinical tree (sub-agent: links, stats, mock
  removal, about-page team, DDI copy, footer/hero/navbar).
- Knowledge: this file, `.claude/{MEMORY (162–167), ROADMAP (4.6), PROJECT_MAP}.md`, skill
  `adsense-monetization`.

**Architecture & Decisions**
- **Metadata from the path, centrally**, rather than server wrappers around ~130 client pages. A
  page's own `metadata` still wins (field-by-field merge), so nothing that had metadata changed.
- **noindex, not robots-disallow**, for pages that should stay reachable (MEMORY 162).
- **Empty MCQ subjects are hidden, not deleted** — the syllabus data is untouched; the hub and
  semester pages filter through `mcq-availability.ts`, one list for UI, metadata and sitemap.
- **The careers form lost its file upload**: `/api/contact` sends a plain email; a CV link replaces it.
- **The histology test's missing "keratinised" slide** was re-labelled by the spotting sub-agent to
  what its two existing photos show (non-keratinised). New teaching content — worth a look.
- Not changed, by decision: the DrugBank text and the textbook-derived `public/content/` files
  (owner decisions, Known Issue 22); the ended tournament pages (noindexed, not deleted); ad
  placements themselves.

**Verification**
- `npx tsc --noEmit` → 0 errors (after the build regenerated `.next/types`); `-p mobile/tsconfig.json`
  and `-p desktop/tsconfig.json` → 0 errors.
- `npm run build` → exit 0, shared JS **88.6 kB**, middleware **81.9 kB** (both unchanged);
  `/robots.txt` and `/sitemap.xml` emitted.
- **Local production crawl** (same crawler as the live audit, `next start`): 235 URLs, **235 × 200,
  0 broken**; 230 distinct titles; 0 non-www canonicals; 0 "Coming Soon", "Venus", "Crypgo",
  "Prototype", "#1 Pharmacy", fake phone numbers or `href="#"` on local pages.
- Header-level checks: calculator, MCQ, lesson and clinical-host titles and canonicals; the
  semester-4 Physical Pharmacy page canonicalises to semester 1; a spoofed `x-subdomain` is ignored;
  `/mentor`, `/documentation`, `/flash-cards/sample`, `/books-library` → 308.
- `/api/contact`: empty, bad-email, over-length and non-JSON bodies → 400 each.
- The community fix was verified by running the exact new select against production PostgREST
  (read-only, anon key): rows returned where the old select returns `PGRST201`.
- Screenshots read: MCQ hub, contact, spotting hub, powder lessons (390), empty semester (390),
  clinical landing, careers (390) — they caught four copy errors, all fixed.
- **NOT verified:** the live site (nothing is deployed); a real email through the contact form (it
  would email the team); the community feed rendering in a browser against production; dark mode;
  a real phone. No test framework covers any of this; lint is not configured. `npm run
  mobile:build` was not run (no calculator page changed; the mobile tsconfig passes).

**Remaining**
- Commit and deploy (not done — the protocol forbids committing unasked).
- Owner steps in Known Issue 22, then request the AdSense review.

**Next**
- Deploy, fix the apex redirect in Vercel, submit the sitemap in Search Console, and re-run the
  live crawl before pressing "Request review".

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
- **Android regression:** `cap sync android` then `./gradlew assembleDebug` (JDK 21, ANDROID_HOME set)
  → **BUILD SUCCESSFUL in 4m 24s**, 184 tasks, a fresh 11.5 MB debug APK with all three plugins
  packaged. The plugins do not break the Android target. Note `android/capacitor.settings.gradle`
  and `android/app/capacitor.build.gradle` changed as a result — generated, but they **must be
  committed** or Gradle cannot resolve the plugins (MEMORY gotcha 158).
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

**Follow-up the same session — macOS CI (user asked "can we make the ios app on github actions?")**
- **Yes, and it is wired up.** New `.github/workflows/ios-app.yml` builds on `macos-latest`: it runs
  `pnpm ios:sync`, then compiles for the **Simulator** (Debug) and for the **arm64 device slice**
  (Release, unsigned), and uploads the `.app`. No Apple account, no certificate, no secrets —
  unsigned builds need none of that. `workflow_dispatch` + `ios-v*` tags only, because macOS
  minutes bill at 10x on a private repository.
- **Two product guards gate the compile** rather than being checked after it: `Info.plist` must
  request **no permissions**, and **≥100 calculator pages** must be present in the synced bundle
  (a silent `cap sync` failure otherwise ships an app that builds and shows a blank screen).
- **A missing shared scheme would have failed the first run.** Capacitor's template ships none —
  Xcode writes schemes into gitignored `xcuserdata`, so the project builds on a laptop and not in
  CI. `ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme` is now committed (MEMORY 159).
- **Signing is deliberately not implemented.** An `.ipa` that installs on a phone needs a paid
  Apple Developer account, which does not exist; the workflow ends with a comment block naming the
  four secrets and the four steps to add when it does. An untested signing job that looks
  authoritative is worse than a documented gap.
- **Verified locally, as far as is possible without a Mac:** the workflow parses with PyYAML (12
  steps); every `run` block passes `bash -n`; and the two guard steps were **executed against the
  real tree** — "Info.plist parses and requests no permissions / display name: PharmaWallah" and
  "calculator pages bundled: 106", both exit 0. The heredoc-inside-YAML indentation was checked
  this way rather than assumed (MEMORY 160). **The workflow itself has never run.**

**Outcome — the workflow was run and it went green**
- The user ran it the same day. **`macos-latest`, 5m22s, commit `5b8788e`, conclusion `success`,
  all 13 steps green** (confirmed from the Actions API, not inferred from the artifact link):
  both guards passed, Swift packages resolved, the Simulator build and the unsigned arm64 device
  build both compiled, and `App.app` uploaded. **The iOS app compiles.** Known Issue 21 was
  rewritten accordingly and §9 gained an iOS compile baseline.
- What that does **not** prove: anything needing a running app or a signature. Still unverified —
  the launch-screen handover, the keyboard accessory bar, the share sheet, and any device install.

**Also on 2026-09-22 — `main` broke for ~4 minutes, twice, from partial commits**
- `86049de` pushed `package.json` without `pnpm-lock.yaml`; Vercel installs with
  `--frozen-lockfile` and failed instantly with `ERR_PNPM_OUTDATED_LOCKFILE`. Fixed by `d0381d4`.
- `5b8788e` ("ios app", committed by the user with `git add -A` across a tree three sessions were
  working in) took `src/app/(site)/download/page.tsx` but **not** the `DownloadClient.tsx` that
  exports the `PlatformFile` type it imports, so the Vercel build failed its type-check with
  `Module "./DownloadClient" has no exported member 'PlatformFile'`. Fixed by `302ab2f`.
- Both are the same lesson and it is now MEMORY gotcha 161: **in this repo every push to `main`
  deploys the website, so a commit must be a complete unit.** `npm run build` — not just
  `npx tsc --noEmit` — re-run after `302ab2f`: **exit 0**, full route table, shared JS 88.6 kB,
  middleware 81.9 kB. `main` is green.

**Next**
- Download the `pharmawallah-ios-simulator-app` artifact and run it in a Simulator on a Mac — the
  three things only a running app can show: the launch-screen handover, the keyboard accessory bar,
  and the share sheet.

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

**Committed and pushed (user asked, 2026-09-22)**
- `86049de` — the desktop target, the CI workflow and the four shared root files. Deliberately
  excluded: a peer's live iOS target, `mobile/`, `src/` and `pnpm-lock.yaml`.
- `d0381d4` — **`pnpm-lock.yaml`, fixing a production deploy this session broke.** Holding the
  lockfile back was wrong: every push to `main` deploys the website, Vercel installs with
  `--frozen-lockfile`, and `86049de` added `@tauri-apps/cli` to `package.json`, so the build failed
  with `ERR_PNPM_OUTDATED_LOCKFILE` naming five unresolved specifiers (mine plus the four Capacitor
  packages the iOS session had added). See MEMORY gotcha 152.

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

> Older entries are in `.claude/history/2026-09.md`: 2026-09-22 (calculator-refinement skill), 2026-09-20 (brand kit), 2026-09-13/20 (pharmacy counter, calculator migration finish, disk diffusion, AI Guide, encyclopedia, community, Molecular Lab, about-us, TLC/colony, APK v1.1–1.3), 2026-09-13 (six analytical-practical calculators, calculation-tools hub rebuild, loading screen, dashboard rebuild, header app CTA +
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
| Build | `npm run build` | **PASSES — re-verified 2026-09-30** after the Battle Royale certificate search (exit 0, shared JS 88.6 kB, middleware 81.9 kB). **2026-09-29** after the Battle Royale podium/certificates work (isolated copy): exit 0, shared JS **88.6 kB**, middleware **81.9 kB**, `/` 223 kB first load. **Earlier: PASSES — re-verified 2026-09-20 after the calculator migration finished** (isolated copy of the tree; peers had agreed not to build in the shared root): exit 0, shared JS **88.5 kB**, middleware **81.9 kB**. All 104 calculators then swept against `next start` at 1440×900 and 390×844 — 104/104 HTTP 200, hydrated, **0 exceptions, 0 console errors, 0 horizontal overflow**. **Also 2026-09-20 after the AI Guide rebuild** (isolated copy; the peer dev server on :3000 was left alone): exit 0, shared JS **88.5 kB** (unchanged), `/ai-guide` **9.7 kB / 150 kB first load**, `/books-library` no longer emitted. **Also 2026-09-20, after the Disk Diffusion Lab rebuild** (in an isolated copy of the tree — two peer `next dev` servers were running on the shared root and had already corrupted its `.next`, MEMORY gotcha 126): exit 0, **277 route lines**, shared JS **88.5 kB**, middleware 81.9 kB, `/simulations/disk-diffusion` 49.1 kB / **241 kB first load**; jsPDF confirmed absent from the page chunk and present in its own, so the report no longer rides in the first load. One extra expected warning: `buffer-lab`'s ambiguous `duration-[2000ms]` class. **Earlier the same day: PASSES — after the `/encyclopedia` redesign** (in an isolated copy of the tree, the peer sessions' dev servers left alone): exit 0, shared JS **88.5 kB**, `/encyclopedia` **16.3 kB / 113 kB first load**, `/molecular-lab` 60.2 kB / 149 kB. OpenChemLib (1.09 MB) and 3Dmol (568 KB) are lazy chunks only — grep the built shared chunks for both and expect **0 hits** before shipping any new 3D consumer. Two 404s on `/_vercel/insights` and `/_vercel/speed-insights` appear under `next start` locally; they come from `Analytics` / `SpeedInsights` in `src/app/layout.tsx` and only resolve on Vercel — not a defect. **Earlier: PASSES — 2026-09-16 after Molecular Lab** (in an isolated copy of the tree, dev server left up): exit 0, shared JS **88.4 kB**, middleware 81.9 kB, `/molecular-lab` 59.5 kB / 148 kB first load, `resources.<hash>.json` 1.35 MB in `static/media`. The build also prints several `Dynamic server usage` stack traces (tournament leaderboard, DailyMed, AMR routes) — logged by those handlers, non-fatal, not new. **Before that** (again after the simple `/about-us`: exit 0, shared JS 88.3 kB, `/about-us` 106 kB first load). Earlier the same day: exit 0 in ~2.5 min, 252 route lines, shared JS **88.3 kB**, middleware 81.9 kB; `/calculation-tools/rf-value-calculator` 184 kB and `/cfu-calculator` 183 kB first load; `.next/static/media/opencv.<hash>.js` 10.8 MB emitted as an asset. Same expected warnings as below. **Earlier (2026-09-12):** with the dev server stopped, after the AdSense work (the first successful run since the PWA removal, the shadcn migration and the Outfit switch): exit 0, ~170 routes, middleware 81.8 kB, shared JS 87.8 kB. Stop `npm run dev` first — they share `.next` and corrupt each other (§7 Known Issue 10). **PASSES with a populated `.env`** — exit 0, ~170 routes emitted, middleware 81.8 kB, shared JS 87.8 kB. Only `/_not-found` is static; everything else is `ƒ` (dynamic, server-rendered on demand). **Without `.env` it FAILS**: `Missing environment variable: NEXT_PUBLIC_SUPABASE_URL` while collecting page data for `/api/admin/registrations`. Expected non-fatal warnings: the `@supabase/supabase-js` Edge-runtime `process.version` notice, the stale `caniuse-lite` Browserslist notice, and two webpack "Serializing big strings" cache notices. |
| Mobile build | `npm run mobile:build` | **PASSES (2026-09-22, ~3 min)** — re-measured after the iOS target landed and the three Capacitor plugins were installed: exit 0, **106 HTML files** under `mobile/out/calculation-tools/` (105 tools + the hub), CSS **88,734 bytes**, shared JS **88.3 kB**; **0** files match the JWT-shaped secret pattern and **0** contain an ad string. This one export now feeds three native targets — `cap sync android`, `cap sync ios` and the Tauri desktop build. **Earlier: PASSES (2026-09-20, ~2 min)** — after the calculator migration and the liquid-glass kit change: exit 0, **108 HTML files**, 106 entries under `mobile/out/calculation-tools/`, CSS **84,243 + 4,210 bytes**. The glass ships to the APK: `calcSheen`/`calcTide` and the `[@media(hover:none)]` phone path are all present in the exported CSS, and the export renders at 390 px with `backdrop-filter: none`. **Earlier (2026-09-16, ~2 min)** — 105 HTML files under `mobile/out/calculation-tools/`, home `/` 125 kB first load, shared JS 88.2 kB, CSS **113,194 bytes**, `mobile/out` 22 MB (OpenCV.js is 10.8 MB of it). Secret scan: use the JWT-shaped pattern (gotcha 90). **Earlier (v1.1):** 109 static pages, 108 HTML files, 105 under `mobile/out/calculation-tools/`, shared JS 87.9 kB, CSS in two files **98,751 + 4,210 bytes**, 12 MB (re-measured 2026-09-13 by the v1.1 APK build, with 85 of 104 tools on the kit; 103,829 + 4,210 before). Independent of `.env` and safe to run while `npm run dev` is up (separate `mobile/.next`). **Also assert zero ad strings in `mobile/out`** — see `.claude/skills/adsense-monetization/SKILL.md`. A ~10 KB stylesheet is the silent Tailwind failure (gotcha 23). |
| iOS compile | `.github/workflows/ios-app.yml` (Actions → "iOS app" → Run workflow) | **PASSES — first ever run 2026-09-22, `macos-latest`, 5m22s, commit `5b8788e`, conclusion `success`, every step green.** Builds twice with no Apple account and no secrets: **Simulator** (Debug, `-sdk iphonesimulator`) and the **arm64 device slice** (Release, `-sdk iphoneos`, `CODE_SIGNING_ALLOWED=NO`), and uploads `App.app` as the `pharmawallah-ios-simulator-app` artifact. Two guards run before the compile and are part of the baseline: `Info.plist` must request **no permissions**, and **≥100** calculator pages must be in the synced bundle. Needs the committed shared scheme `ios/App/App.xcodeproj/xcshareddata/xcschemes/App.xcscheme` (MEMORY gotcha 159). **This is a compile baseline only** — no signed `.ipa`, and the app has still never been *run* (§7 Known Issue 21). Do not report the iOS app as tested on a device. |
| iOS sync | `npm run ios:sync` (i.e. `cap sync ios`) | **PASSES (2026-09-22, ~4 s after the build)** — exit 0 on **Linux**; Capacitor 8 uses the SPM template so no CocoaPods is involved. Reports **3 Capacitor plugins for ios** (`@capacitor/filesystem@8.1.3`, `@capacitor/keyboard@8.0.5`, `@capacitor/share@8.0.2`) and rewrites `ios/App/CapApp-SPM/Package.swift`. Also assert: `Info.plist` parses with `plistlib` and has **zero** `*UsageDescription` keys, and `ios/App/App/public/calculation-tools` holds one `index.html` per tool. **There is no iOS build baseline** — compiling needs Xcode on macOS and has never been done (§7 Known Issue 21). Do not report the iOS app as building. |
| APK | `npm run mobile:apk` | **PASSES (2026-09-20, v1.4 / versionCode 5, ~2 min)** — signed V2 release APK **9,369,674 B (8.9 MB)**, certificate SHA-256 `afe4c18e…5b03` **unchanged from v1.3**, so it installs as an update; published file byte-identical to the Gradle output; 104 tool pages inside. **Earlier (2026-09-16, v1.3 / versionCode 4, ~2.5 min)** — signed V2 release APK **9,347,799 B** (8.9 MB), same certificate SHA-256 `afe4c18e…5b03` as v1.2; published file byte-identical to the Gradle output. **Earlier:** (2026-09-14, v1.2 / versionCode 3, built by `pharma-wallah-4b` — new launcher icon + redesigned Serial Dose tool) — signed V2 release APK, 5,945,495 B, copied to `public/downloads/`; same certificate as v1.0/v1.1. Needs JDK 21 (auto-selected) and `android/keystore.properties`. Check `aapt dump badging` for the version and `apksigner verify --print-certs` for the certificate. |
| Tests | `node --test scripts/pharmacy-counter.test.mts` · `node --test scripts/tlc-rf.test.mts scripts/colony-counter.test.mts` · `node --test scripts/molecular-lab.test.mts` · `node --test scripts/community.test.mts` · `node --test scripts/ai-guide.test.mts` · `node --test scripts/dissolution-rate.test.mts` · `node --test scripts/split-for-ads.test.mts` · `node --test scripts/battle-royale.test.mts` | **47 pass, 0 fail** (2026-09-20, Community Pharmacy pure layer, ~0.5 s — case-data integrity, the check grader, verification truths, labels, expiry, inventory, the calculators, scoring) · **41 pass, 0 fail** (2026-09-16; 21 TLC + 20 colony, ~10 s) · **21 pass, 0 fail** (2026-09-16, Molecular Lab, ~12 s, real OpenChemLib) · **19 pass, 0 fail** (2026-09-20, community pure layer, <1 s) · **34 pass, 0 fail** (2026-09-20, AI Guide pure layer — request clamps, Gemini history rules, NDJSON framing, study modes — <1 s). · **28 pass, 0 fail** (2026-09-22, Dissolution Rate Constant pure layer — every column of the supplied practical sheet, both k columns proven distinct, the average against 0.000291833 and against each rejected averaging range, division-by-zero paths, duplicate/backwards times, both notations — <1 s). · **6 pass, 0 fail** (2026-09-24, lesson ad spacing — heading-only breaks, never inside a code fence, word-count gaps, lossless over all 69 lesson files, <1 s). · **23 pass, 0 fail** (2026-09-30, Battle Royale — display helpers, schema round-trips, station, titles, certificate search input). These cover eight features' pure modules only — there is no framework, no CI, and nothing else is tested. Report them by name. **The community's SQL is verified separately** by running its migration twice against a throwaway local Postgres 16 and asserting RLS from a `nobypassrls` role — see the `community-system` skill. |

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
