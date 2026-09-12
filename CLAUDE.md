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
| **Calculation tools** | 89 standalone pharmacy calculators under `/calculation-tools/<tool>` |
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
npm run mobile:build   # regenerate routes + static export of the 89 calculators -> mobile/out
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
  only the 89 calculators, uses `output: "export"`, and has no API routes or middleware, so it
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
    all ~170 routes.
14. **A page's bespoke CSS goes in a namespaced stylesheet next to its components**, imported by
    the page's client component (`landing.css` under `.pw-landing`), never in `globals.css`.
    `globals.css` is loaded by every route; three of its rules (`html{scroll-behavior:smooth}`,
    `ul/li` list styling, `input{background:#fff!important}`) will fight a bespoke page, so
    neutralise them inside your namespace rather than editing them.

---

## 7. Current Project State

### Current Branch / Focus
- Branch: **`main`** (the only branch; also the PR target). The working tree is **NOT clean** — a
  large body of work is staged but uncommitted (the whole `.claude/` system, `mobile/`, `android/`,
  the landing-page redesign, the header/MegaMenu, the shared calculator UI kit, and the AdSense
  scaffolding). **Nothing here has been committed yet; don't assume `git log` reflects the tree.**
- Focus: **monetisation (AdSense) and the shared calculator UI kit**, on top of expanding the
  calculation-tools catalogue.
- Typography: the site is now single-typeface (**Outfit**, variable) across web and APK.

### Recently Completed
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
- **Shared calculator UI kit migration** (uncommitted). `src/components/calculators/` holds a new
  kit — `CalculatorShell` / `CalcSection` / `FieldGrid`, `NumberField` / `SelectField`,
  `ResultCard`, `FormulaNote`, `CalcAbout`, `AdSlot` — and **3 of 89** tools are migrated to it
  (`gfr-calculator`, `therapeutic-index-calculator`, `CorrectedCalciumCalculator`). Migrating a
  tool also gives it a sticky-`aside` ad slot for free.
- **AdSense**: plumbing done, ad-unit IDs outstanding (Phase 4.6).

### Partially Implemented
- **Course catalogue (largest gap).** `src/lib/courses/registry.ts` registers **4 subjects**, but
  `src/lib/courses/subjects/` holds **14 files** and `public/content/` holds markdown for **10+
  subjects**. Nine subject files are dead code *and use a different data shape* (`*_META` +
  `*Units` + `*_DIFF_BADGE`) than the registry's `SubjectMeta` interface. A tenth,
  `natural-toxins.ts`, *is* in `SubjectMeta` shape but is still not registered.
- **Calculation tools hub.** 89 tool directories exist; the `allTools` array lists **78**
  (re-counted 2026-09-12; this file previously said 84). Six of the remainder are deliberately
  linked from `src/app/clinical/dose-calculators/page.tsx` instead. **Five —
  `AntagonismSimulator`, `EmaxModelCalculator`, `drug-half-life-calculator`,
  `OsmolarGapCalculator`, `OpioidConversionCalculator` — are reachable by URL but linked from
  nowhere on the web.** All 89 ship in the Android app, so they are reachable there.
- **Spotting.** Histology has 17 lessons + a test; pathology has 16 lessons + a test;
  powder-microscopy has only 3 lessons + a test.
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
8. **Streaks may be permanently zero.** `progress.current_streak` / `longest_streak` are selected
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

11. **The three landing-page ad bands are invisible until slots are configured.** `AdBand` passes
    `NEXT_PUBLIC_ADSENSE_SLOT_HOME_1/2/3`; with none set, `AdSlot` renders nothing in production and
    the band removes itself. Set them to monetise the home page.
12. **Radix `NavigationMenuViewportItem` is not a `forwardRef` component**, so React 18 logs
    "Function components cannot be given refs" once per mega-menu open in development. It is a
    library-internal warning, harmless, and not fixable from this repo.

### Technical Debt
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

### 2026-09-12 — New ADME landing page (GSAP), shadcn mega menu, header refresh

**Completed**
- **`/` is a new landing page** structured as ADME — what happens to a drug after you take it.
  Four stations, each with exactly one idea so no two sections animate alike: **01 Absorption** a
  rail of notes that travels sideways while the section is pinned; **02 Distribution** a discipline
  index whose rows sweep a gradient and float a preview tile that trails the cursor; **03
  Metabolism** a pinned, scrubbed MCQ answered across three scroll beats (timer runs down, wrong
  option shakes red, right one pops green, explanation rises, card is dealt away); **04 Elimination**
  a DrawSVG dial and a counting scoreboard. Plus a preloader, a molecular lattice that repels the
  pointer, a headline whose last word cycles, an SVG "spine" a molecule rides the length of the
  page, a ScrambleText AI answer, magnetic buttons, and a fixed ADME progress rail.
- **The old home sections are no longer rendered** — `Hero`, `Companies`, `Courses`, `Features`,
  `ContactForm`. They remain on disk, unreferenced. The Science Fair `OfficialLaunchBanner` is kept.
- **Proper shadcn mega menu.** The hand-rolled dropdown (no roving focus, no arrow keys, no
  `aria-expanded`, and a footer strip that read "Press Esc to close") is replaced by Radix
  NavigationMenu: a featured gradient tile, a three-column destination grid and a footer row of
  real links, with one shared viewport that morphs between panels.
- **Header refresh.** Deterministic height (76px → 64px on scroll instead of padding-driven),
  backdrop blur when scrolled, retracts on scroll-down and returns on scroll-up, gradient underline
  on hover, pill CTAs, and shadcn `Button` for every control.
- **The header's in-flow spacer was 20px too short** (`h-[64px] lg:h-[68px]` under an ~88px bar), so
  the top of every page on the site rendered behind the nav. Now matched to the real height.
- **Footer wordmark** — the outlined PHARMAWALLAH that closes the storyboard, rising out of its own
  mask on first view.

**Files**
- `src/components/Home/landing/` (new) — `LandingPage.tsx` (orchestrator), `useLandingMotion.ts`
  (every timeline), `landing.css` (scoped styles), `data.ts` (copy), `art.tsx` (inline SVG),
  `LandingHero.tsx`, `Station{Absorption,Distribution,Metabolism,Elimination}.tsx`, `AiGuide.tsx`,
  `CloseCta.tsx`, `Chrome.tsx` (preloader / rail / preview / ad band), `MagneticCta.tsx`,
  `StationTop.tsx`.
- `src/app/page.tsx` — renders `LandingPage` for the non-clinical branch.
- `src/components/ui/navigation-menu.tsx` (new) — shadcn NavigationMenu.
- `src/components/Layout/Header/MegaMenu.tsx` (new), `Navigation/menuMeta.tsx` (new — the submenu
  icon/tint/description table, extracted so the desktop menu and the mobile drawer share one copy),
  `Header/index.tsx` (rewritten nav + CTAs + shell, mobile drawer untouched).
- `src/components/Layout/Footer/Wordmark.tsx` (new), `Footer/index.tsx` (renders it).
- `tailwind.config.ts` — registered `tailwindcss-animate`, which was a devDependency the config had
  never loaded, so every shadcn `animate-in` / `data-[state=open]:` class compiled to nothing.
- Installed `gsap@3.15.0` and `@radix-ui/react-navigation-menu@1.2.22`.

**Architecture & Decisions**
- **GSAP is scoped to this one page.** `CLAUDE.md` §6 rule 13 says framer-motion is the site's
  motion library; that still holds everywhere else. The landing page's pinning, scrubbing,
  DrawSVG, MotionPath, SplitText and ScrambleText have no framer-motion equivalent, and the user
  asked for GSAP explicitly. **Nothing outside `src/components/Home/landing/` imports gsap** — the
  footer wordmark deliberately uses IntersectionObserver + CSS so the library does not load on all
  ~170 routes. Keep it that way.
- **All motion lives in one hook** (`useLandingMotion`), inside `gsap.matchMedia(root)` with
  desktop / touch / reduced-motion branches. `mm.revert()` on unmount kills every tween, trigger,
  Draggable and SplitText — a surviving pinned ScrollTrigger would break the next route.
- **A scoped stylesheet, not Tailwind**, for the page's bespoke parts (masked line reveals,
  `-webkit-text-stroke` numerals, the spine, the deck). Everything is namespaced under
  `.pw-landing`; shared controls still come from `src/components/ui`.
- **Ads are never animated and never inside a pinned or transformed parent**, and the band paints
  above every decorative layer. `AdBand` renders nothing in production without a slot id, so an
  unconfigured slot leaves no empty strip.
- The next card in the deck carries a **real second question**. The prototype left it blank, which
  reads as a broken card the moment the answered one is dealt away.

**Verification**
- `npx tsc --noEmit` → **0 errors** (matches the §9 baseline).
- Exercised the running dev server with headless Chrome over CDP at **1440×900** and **390×844**:
  full-page scroll sweep, both mega-menu panels, the mobile drawer, and `prefers-reduced-motion:
  reduce`. **No exceptions and no console errors**; the only warnings are the pre-existing
  `next/image` LCP notice for the logo and the AdSense `data-nscript` notice.
- Reduced motion verified to skip the preloader, reveal every element, mark the answer, render the
  AI text unscrambled and draw the dial at 82%.
- Other routes (`/calculation-tools`) re-checked for header regressions — none.
- **NOT verified: `npm run build`.** The user's `npm run dev` was running throughout and the two
  destroy each other's `.next` (Known Issue 10). No tests exist; lint is not configured.

**Remaining**
- Run `npm run build` with the dev server stopped.
- Set `NEXT_PUBLIC_ADSENSE_SLOT_HOME_1/2/3` or the three landing ad bands stay hidden in production.

**Next**
- Decide whether to delete the now-unrendered `src/components/Home/{Hero,Companies,Courses,Features,ContactForm}`.

---

### 2026-09-12 — Google AdSense wired up and placed

**Completed**
- **The AdSense loader is live.** The publisher ID `ca-pub-9553986083846603` is now set as
  `NEXT_PUBLIC_ADSENSE_CLIENT`, which is the master switch the root layout was already gated on —
  so `adsbygoogle.js` now loads on the site (and did not before).
- **`public/ads.txt`** authorises the publisher, so AdSense will not report "Earnings at risk".
- **Ads are now placed on 5 surfaces / 7 slots.** New in this task: **every one of the 89
  calculator pages**, the calculator hub, the course subject listing, and the end of every course
  lesson. The three home-page bands and the migrated calculators' `aside` slot already existed.
- **All 89 calculators got a placement from a single new file**, not 89 edits —
  `src/app/(site)/calculation-tools/(tools)/layout.tsx`.
- **The Android app stays ad-free, and this is now proven** — zero occurrences of `ca-pub-…`,
  `adsbygoogle`, `googlesyndication` or `data-ad-client` anywhere in `mobile/out`.

**Files**
- `.env` — the `NEXT_PUBLIC_ADSENSE_*` block: the publisher ID plus seven slot variables, all
  documented inline, all blank for now. *(Gitignored — see Remaining.)*
- `public/ads.txt` — **new**.
- `src/app/(site)/calculation-tools/(tools)/layout.tsx` — **new**; footer band under all 89 tools.
- `src/components/course/UnitPageClient.tsx` — lesson ad, after the PDF button, before comments.
- `src/app/(site)/calculation-tools/CalculationToolsClient.tsx` — hub band above the categories.
- `src/app/(site)/courses/[subjectSlug]/page.tsx` — band below the unit grid.
- `.claude/skills/adsense-monetization/SKILL.md` — **new** skill; `.claude/SKILLS.md` registers it.

**Architecture & Decisions**
- **The `(tools)` route-group layout is the lever for "all 89 calculators".** A web `layout.tsx`
  can never reach the APK, because `scripts/generate-mobile-routes.mjs` re-exports the **page
  component only**. That makes it the right place for a web-only concern — and a trap for anything
  the app also needs. Recorded as `MEMORY.md` gotcha 28.
- **Placement constraints, all deliberate:** no ad inside a `framer-motion`/transformed parent (it
  breaks AdSense viewability measurement — gotcha 29); the lesson ad sits **outside** `printRef` so
  `PdfDownloadButton` cannot rasterise it into the downloaded PDF; and every placement is gated on
  content existing, because AdSense forbids ads on an empty page (gotcha 30).
- **Excluded surfaces, on purpose:** auth pages, `/dashboard`, `/admin`, tournament play,
  `/leaderboard`, the timed spotting and MCQ tests, the simulations, and the AI tools. Thin,
  private, or timed pages — disruptive at best, a policy risk at worst.
- **Recommendation: leave Auto ads OFF.** Auto ads inject into precisely the surfaces excluded
  above and ignore the code's decisions. The manual placements are the deliberate version.
- **Kept the existing inline `process.env.NEXT_PUBLIC_ADSENSE_SLOT_*` idiom** rather than
  introducing a central `AD_SLOTS` map, to match the three already-migrated calculators and avoid
  churning files that are mid-migration.
- No new dependency, no new component: every placement is the existing `AdSlot`.

**Verification**
- `npx tsc --noEmit` → **0 errors** (matches baseline).
- Exercised against the user's running dev server. `ca-pub-9553986083846603` present in the HTML of
  every page checked (the loader now renders); ad placements counted per page:
  `/` → 3, `/calculation-tools` → 1, `/calculation-tools/gfr-calculator` → 2 (aside + new footer),
  `/calculation-tools/animal-dose` → 1 (**proves the layout covers unmigrated tools**),
  `/courses/pharmaceutical-biochemistry` → 1, `.../unit2-carbohydrates` → 1.
  All 200. `/ads.txt` → **200**.
- Confirmed **0** placements on `/mcqs-bank`, `/tournament/play`, `/simulations`; `/dashboard`
  still 307s to sign-in.
- `npm run mobile:build` → **passed**: 94 static pages, 90 HTML files, 7.7 MB, stylesheet
  **96,034 bytes** (not the ~10 KB silent-failure size). **Ad-leak check: 0 files** for each of
  `ca-pub-9553986083846603`, `adsbygoogle`, `googlesyndication`, `data-ad-client`. Secret re-check
  (`SUPABASE_SERVICE_ROLE`, `MONGODB_URI`, `UPSTASH`, `GEMINI_API_KEY`, `RESEND_API_KEY`, `eyJ`) →
  **0 each**. The mobile build tree-shakes `AdSlot` to a component that returns `null`; only the
  env-var *name* survives as a dead expression.
- **NOT verified:** `npm run build` (web) was **not run** — the user's dev server is up and the two
  corrupt each other (§7 Known Issue 10). **No real ad was ever rendered** — that needs ad-unit IDs
  from the AdSense dashboard, which only the user can create. Nothing was opened in a browser, so
  there is no visual check of any placement at any breakpoint or in dark mode. No tests exist; lint
  is not configured.

**Remaining**
- **Create the ad units in AdSense → Ads → By ad unit** and fill in the seven
  `NEXT_PUBLIC_ADSENSE_SLOT_*` values. Until then production renders **no** ads (only the loader).
- **Add all eight `NEXT_PUBLIC_ADSENSE_*` variables to Vercel** — `.env` is gitignored, so the
  deployed site currently has no publisher ID at all.
- Confirm Auto ads are off in the dashboard.
- Run `npm run build` with dev stopped (outstanding from the three previous entries).

**Follow-up (same day) — AdSense answered "Couldn't verify your site".**
Diagnosed against the live site, not locally: `curl https://www.pharmawallah.com/` returned **zero**
occurrences of `ca-pub-…`, `adsbygoogle` or `googlesyndication`. Two causes, both fixed in
`src/app/layout.tsx`:
- **The publisher ID lived only in `.env`, which is gitignored**, so Vercel never received it and
  the env-gated loader rendered nothing on the deployed site. The ID is now a **hardcoded constant
  with an env override** — it is a public identifier (it is in `/ads.txt` and in every page's
  source), and site verification plus Auto ads both require it on the live site, so it must not
  depend on a dashboard variable being set.
- **The loader was `strategy="afterInteractive"` in `<body>`.** That is injected by the Next runtime
  after hydration, so a crawler reading the raw HTML may never see it. Now `beforeInteractive`,
  which puts it in the server-rendered `<head>` — where AdSense asks for it.
- Also added `<meta name="google-adsense-account">` via `generateMetadata` on both the site and
  clinical branches, as an independent second verification path.

`/ads.txt` was **already live and correct** at `https://www.pharmawallah.com/ads.txt`.

Verified in the real production build (`npm run build` + `next start`): `pagead2.googlesyndication.com`,
`google-adsense-account` and `ca-pub-9553986083846603` all resolve **INSIDE `<head>`**, on `/`,
`/calculation-tools/animal-dose`, `/courses/pharmaceutical-biochemistry` and `/terms`.

Also cleared up a non-defect: the home page renders **no** ad bands in production, and that is
intentional — `AdBand` in `Chrome.tsx` returns `null` when its slot ID is unset, so no empty tinted
strip appears between sections. It will start rendering when `NEXT_PUBLIC_ADSENSE_SLOT_HOME_*` are
filled in.

**Domain note:** the apex `pharmawallah.com` **307-redirects to `www.pharmawallah.com`**. Both serve
`/ads.txt` (200). Worth knowing if verification keeps failing — point AdSense at the www host.

**Next**
- Push, wait for the Vercel deploy, confirm `curl -s https://www.pharmawallah.com/ | grep -c ca-pub`
  returns non-zero, then click **Verify** in AdSense.
- Then fill in the ad-unit IDs and confirm a real ad renders on `/calculation-tools/animal-dose`.

---

### 2026-09-12 — Outfit as the site's single typeface

**Completed**
- **The whole product now renders in Outfit** — website, clinical subdomain and the Android app.
  Outfit is loaded as a **variable** font, so `font-extrabold` / `font-black` are real weights
  rather than the synthesised ones the old four-weight Poppins produced.
- **Removed every competing typeface.** Poppins (global), DM Sans (`DrugCard`, lab guide),
  Inter (histology spotting test, `MoleculeViewer`), IBM Plex Sans (drug finder), Fraunces and
  Playfair Display (display headings), and the `-apple-system` / `system-ui` / `Arial` stacks
  hard-coded in two calculator stylesheets, three SVG scenes and the PDF export.
  Three Google Fonts `@import`s shrank to JetBrains Mono only; one dropped entirely.
- **`font-sans` no longer escapes the site font.** `theme.extend.fontFamily.sans` now leads with
  `var(--font-outfit)`; previously the ~10 pages with `font-sans` on their root element silently
  rendered in system-ui, overriding the `<body>` font.
- **Monospace is the one deliberate exception** — JetBrains Mono and `font-mono` stay on instrument
  readouts, SMILES strings and codes, where monospacing is functional.

**Files**
- `src/app/layout.tsx`, `mobile/app/layout.tsx` — `Outfit` variable font; `font.variable` added to
  `<html>` so `--font-outfit` is available to CSS.
- `tailwind.config.ts` — `fontFamily.sans` → `["var(--font-outfit)", ...defaultTheme.fontFamily.sans]`
  (inherited by `mobile/tailwind.config.ts`, which spreads the base `extend`).
- `src/app/(site)/simulations/lab-guide/page.tsx`, `.../spotting/histology/test/page.tsx`,
  `.../drug-finder/page.tsx`, `.../prescription-reader/page.tsx`,
  `.../calculation-tools/(tools)/{animal-dose,serial-diluation}/page.tsx`.
- `src/components/{DrugCard,MoleculeViewer,PharmaWallahQuiz}.tsx`,
  `src/components/Simulations/DiskDiffusion/DiskDiffusionSim.tsx`, `src/components/course/AuthCTA.tsx`,
  `src/app/(site)/simulations/titration/page.tsx` — SVG `<text>` labels now `fontFamily="inherit"`.
- `src/components/Documentation/TypographyConfiguration.tsx` — the docs snippet said Poppins.

**Architecture & Decisions**
- **Two application points, not one.** The `<body>` class sets the document font; the `<html>`
  variable feeds Tailwind's `sans` and the pages that legitimately name their own stack. Either
  alone leaves a gap.
- **SVG labels use `fontFamily="inherit"`** rather than `var(--font-outfit)` — `var()` in a
  presentation attribute is not reliably substituted, `inherit` always is.
- **Display serifs were converted on the user's explicit instruction** (Playfair Display on the lab
  guide, Fraunces on the histology test). Those two pages lose their editorial serif contrast; that
  was the choice made, not an oversight.
- **The contact-form email template keeps `'Segoe UI', sans-serif`** — it is an email, not the site,
  and mail clients do not load webfonts reliably.
- **`MoleculeViewer`'s 3Dmol atom labels keep `font: 'Arial'`** — those are drawn to a WebGL canvas
  by 3Dmol, which needs a real family name, and `next/font` hashes Outfit's family
  (`__Outfit_ed3508`). Left as-is deliberately.

**Verification**
- `npx tsc --noEmit` → **0 errors** (matches baseline).
- `npm run mobile:build` → **passed**: 94 static pages, 90 HTML files, 7.7 MB, stylesheet
  **93,056 bytes** (not the ~10 KB silent-failure size). Verified in the export: `--font-outfit`
  is defined, `.font-sans` resolves to it, Outfit `.woff2` files are self-hosted, **zero**
  occurrences of "Poppins".
- Dev server (the user's, left running): `/drug-finder`, `/simulations/lab-guide`,
  `/spotting/histology/test`, `/pw`, `/calculation-tools/animal-dose` all **200**. Grepped each
  page's compiled chunk: `var(--font-outfit)` present; DM Sans, Playfair Display, Fraunces and
  Inter all gone; JetBrains Mono still present where intended.
- Tailwind config change verified **outside** the dev server with
  `npx tailwindcss -c tailwind.config.ts …` → `.font-sans{font-family:var(--font-outfit),…}`.
  The running dev server serves a cached config and needs a restart to show it (new gotcha 26).
- **NOT verified:** `npm run build` (web) was **not run** — the user's dev server is up and the two
  corrupt each other (§7 Known Issue 10). No tests exist; lint is not configured. **Nothing was
  opened in a browser** — no visual check of the new face at any breakpoint or in dark mode.

**Remaining**
- Restart `npm run dev` to pick up the Tailwind config change.
- Run `npm run build` with dev stopped (still outstanding from the two previous entries).
- `npm run mobile:sync` before the next APK, so the app's bundled assets carry Outfit.

**Next**
- Create the signing key and cut the first APK release.

---

### 2026-09-12 — Remove the PWA

**Completed**
- `next-pwa` uninstalled and unwrapped from `next.config.mjs`. The offline experience is now the
  Android app, and a service worker on top of it only added a stale-cache failure mode and an
  "Install app" prompt competing with the APK.
- **Released existing visitors properly.** `public/sw.js` was committed and installed in every past
  visitor's browser; deleting it would have left them on a cached copy of the site indefinitely,
  because a 404 does not reliably unregister a worker. It is now a hand-written self-destructing
  worker that unregisters itself, clears its caches and reloads open tabs.
  `src/components/ServiceWorkerCleanup.tsx` repeats the job from the page for browsers whose cached
  `sw.js` never revalidates.
- Dropped both `manifest: "/manifest.json"` references from the root layout.

**Files**
- `next.config.mjs` — PWA wrapper removed. `public/sw.js` — replaced (71,925 → 1,337 bytes).
- `public/workbox-6a9ee36a.js` — deleted. `src/components/ServiceWorkerCleanup.tsx` — new.
- `src/app/layout.tsx` — mounts the cleanup component, manifest links dropped.
- `package.json` / `pnpm-lock.yaml` — `next-pwa` removed.

**Architecture & Decisions**
- The teardown files are **deliberately temporary**; recorded under §7 Technical Debt with the
  condition for deleting them.
- `public/manifest.json` left on disk but unreferenced, so nothing 404s if something external still
  requests it.

**Verification**
- `npx tsc --noEmit` → **0 errors**. `/download` still 200 on the dev server.
- **`npm run build` NOT run** — the user's dev server is up and the two corrupt each other
  (§7 Known Issue 10). This must pass before pushing.

**Remaining**
- Run `npm run build` with dev stopped — still never verified in this session.

**Next**
- Create the signing key and cut the first APK release.

---

### 2026-09-12 — APK distribution, shadcn/ui, grid home screen

**Completed**
- **Direct APK distribution ("Option A") is wired end to end.** `npm run mobile:apk` preflights the
  JDK/SDK, warns on a missing signing key, then builds a signed release APK. Release signing reads
  `android/keystore.properties` (gitignored) or `PW_KEYSTORE_*` env vars; without either, Gradle
  emits an unsigned APK and the script fails loudly instead of handing over an uninstallable file.
- **`/download` page** on the public site — offline pitch, install steps including the "unknown
  apps" warning, and honest limits (manual updates, calculators only, no iOS). Linked from the
  footer so it is not another orphan page. Points at
  `releases/latest/download/pharmawallah-calculators.apk`, which needs no edit per release.
- **shadcn/ui adopted in the mobile app** — Card, Button, Input, Badge in `mobile/components/ui/`,
  tokens in `mobile/app/globals.css` with `--primary` = brandBlue.
- **Home screen rebuilt as a 3-column card grid** (4 on `sm`, 6 on `lg`) with category headers,
  counts, and shortened card labels via `toolShortName()`.

**Files**
- `android/app/build.gradle` — conditional release `signingConfigs`.
- `android/keystore.properties.example` (new); `.gitignore` — `keystore.properties`, `*.jks`, `*.keystore`.
- `scripts/build-apk.sh` (new); `package.json` — `mobile:apk`.
- `src/app/(site)/download/{page,DownloadClient}.tsx` (new);
  `src/components/Layout/Footer/index.tsx` — "Android App" link.
- `mobile/components/ui/{card,button,input,badge}.tsx`, `mobile/lib/utils.ts`,
  `mobile/components.json` (new).
- `mobile/app/globals.css` (new), `mobile/tailwind.config.ts`, `mobile/postcss.config.mjs`,
  `mobile/app/_components/ToolHub.tsx` (rewritten), `mobile/app/_data/tool-registry.ts`,
  `mobile/app/layout.tsx`, `mobile/app/_components/MobileShell.tsx`, `mobile/tsconfig.json`
  (`@mobile/*` alias), `mobile/README.md`.
- Installed `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`,
  and `tailwindcss-animate` (dev).

**Architecture & Decisions**
- **The mobile app owns its `globals.css`** instead of importing the web one. Verified safe: no
  calculator uses any custom class defined there.
- **`@mobile/*` alias** for mobile-local imports, because `@/*` already points at `../src`.
- **Distribution is GitHub Releases, not Vercel.** Vercel never builds or serves the APK; a ~12 MB
  binary in `public/` would enter git history every release.

**Verification**
- **Found and fixed two silent Tailwind failures.** `next build mobile` runs with cwd at the repo
  root, so (a) Tailwind auto-loaded the *web* config, and (b) `content` globs written relative to
  `mobile/` matched nothing. Both produced a **green build with a ~10 KB stylesheet** — the earlier
  builds this session were shipping an under-styled app. Fixed by naming the config in
  `mobile/postcss.config.mjs` and writing repo-root-relative globs with an `existsSync` guard that
  throws. Stylesheet is now **96,567 bytes**; guard confirmed to fire from a wrong cwd.
- `npm run mobile:build` → passed, 94 static pages. Served `mobile/out`: 9 grid sections, **89**
  cards, short labels correct, shadcn and calculator classes both present in the CSS.
- `npm run mobile:sync` → APK assets refreshed (90 tool pages, 96,567-byte CSS).
- `npx tsc --noEmit` → **0 errors**.
- `/download` exercised against the running dev server → **200**, all content present, footer link
  resolves.
- `npm run mobile:apk` preflight → correctly refuses with the JDK install instruction.
- **NOT verified:** no APK was ever compiled (no JDK), so the Gradle signing config is written but
  **unexercised**. `npm run build` (web) still not re-run — the dev server is up. No tests exist;
  lint is not configured.

**Remaining**
- Install a JDK, run `npm run mobile:apk`, confirm the signing config works.
- Re-run `npm run build` with dev stopped.
- Replace the default Capacitor launcher icon and splash screen.

**Next**
- Create the signing key and cut the v1.0 GitHub release.

---

### 2026-09-12 — Offline Android app (Capacitor), calculators only

**Completed**
- The 89 calculators now build as a standalone, fully offline Android app. `npm run mobile:build`
  emits a static export to `mobile/out`; `npm run mobile:sync` packages it into `android/`.
- The app opens on a searchable catalogue of **all 89** tools — 11 more than the web hub lists,
  including the five that are reachable on the web only by typing a URL.
- Added an app bar with a working back button: the calculators contain no navigation of their own
  (zero `next/link` imports across all 89), so without it a tool was a dead end on mobile.
- The CFU Calculator — the only tool that needs a network — is badged "Needs internet", refuses to
  scan when offline with an explanation, and keeps its manual entry path working.

**Files**
- `mobile/` (new project root) — `next.config.mjs` (`output: "export"`, `externalDir`),
  `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`,
  `app/calculation-tools/page.tsx`, `app/_components/{MobileShell,ToolHub,useOnlineStatus}`,
  `app/_data/tool-registry.ts`, `README.md`.
- `scripts/generate-mobile-routes.mjs` (new) — emits the 89 re-export pages + `tool-slugs.ts`.
- `capacitor.config.ts` (new), `android/` (new, generated by `cap add`).
- `package.json` — added `mobile:routes` / `mobile:build` / `mobile:sync` / `mobile:open`.
- `.gitignore` — ignore `mobile/{.next,out,next-env.d.ts}`, `mobile/app/_generated/`,
  `mobile/app/calculation-tools/*/`.
- `src/app/(site)/calculation-tools/(tools)/cfu-calculator/page.tsx` — **the only web file
  changed**: offline guard + `SCAN_API_BASE` from `NEXT_PUBLIC_API_BASE_URL` (empty on the web, so
  web behaviour is unchanged).
- Installed `@capacitor/core`, `@capacitor/android` (deps), `@capacitor/cli` (dev) — all 8.5.2.

**Architecture & Decisions**
- **A second Next.js project root rather than converting the main app.** The main app has API
  routes and middleware and can never be statically exported; `mobile/` has neither and can.
- **Calculators are never duplicated.** `scripts/generate-mobile-routes.mjs` emits a one-line
  `export { default } from "@/app/(site)/…/page"` per tool, so both builds compile the same file.
  This is only possible because all 89 are `"use client"` and import nothing but `react`,
  `lucide-react`, `recharts` and `framer-motion` — a property that must now be preserved.
- **The mobile catalogue cannot silently lose a tool.** Any generated slug that no category claims
  renders under an automatic "More Tools" group — the opposite of the web hub, where forgetting to
  register a tool makes it unreachable (`MEMORY.md` §8 gotcha 9).
- **No `next-pwa` in the mobile build.** The bundle is already local inside the APK; a service
  worker would only add a stale-cache failure mode.
- Corrected a documentation error: `allTools` holds **78** entries, not the 84 claimed here and in
  `MEMORY.md`. Five tools are web-orphans, not two.

**Verification**
- `npm run mobile:build` → **passed**, 94 static pages, 90 HTML files under `calculation-tools/`,
  7.9 MB, shared JS 87.9 kB.
- Served `mobile/out` over `python3 -m http.server` and exercised it: hub 200 with **89** tool
  links rendered, deep links 200, both former web-orphans 200, back link present on a tool page,
  "Needs internet" badge appears exactly once.
- **Security:** grepped the built bundle for `SUPABASE_SERVICE_ROLE`, `MONGODB_URI`, `UPSTASH`,
  `GEMINI_API_KEY`, `RESEND_API_KEY`, `supabase.co`, `eyJ` → **0 hits each**. The only external
  origin baked in is `https://pharmawallah.com`. `next build mobile` reads env from `mobile/`, not
  the repo root, so the root `.env` is never loaded.
- `npx tsc --noEmit` → **0 errors** (matches baseline).
- `npx cap sync android` → succeeded; 90 HTML files present in `android/app/src/main/assets/public`.
- **`npm run build` (web) — NOT successfully verified.** Two attempts both collided with the user's
  running `npm run dev` over the shared `.next` directory and failed with `PageNotFoundError:
  /_document` and 46 `Cannot find module '…/.next/…'` errors. Zero errors referenced any changed
  file. **Must be re-run with the dev server stopped.** This also broke the user's dev session
  mid-task; recorded as Known Issue 10 and `MEMORY.md` §8 gotcha 21 so it is not repeated.
- No tests exist; lint is not configured. Neither was run. The APK was **not** compiled — no JDK.

**Remaining**
- Re-run `npm run build` with dev stopped.

**Follow-up (same day)** — caught before it shipped: the root `tsconfig.json` swallowed
`mobile/app/**`, whose generated imports are gitignored, so a fresh clone (i.e. **Vercel**) failed
the type-check and would have broken the entire web deploy. Fixed by excluding `mobile`/`android`
in `tsconfig.json` and adding `.vercelignore`. Verified by deleting the generated files and
re-running `npx tsc --noEmit` → 0 errors.
- Install JDK 21 to produce an actual APK; replace the default launcher icon and splash.

**Next**
- Surface the five web-orphan calculators on the web hub — `mobile/app/_data/tool-registry.ts`
  already has their correct names and categories to copy from.

---

### 2026-09-12 — Bootstrap persistent project intelligence

**Completed**
- Analyzed the repository end to end: routing, auth, authorization, all three data stores, external
  integrations, content pipeline, and build tooling.
- Established verification baselines by running the checks (results below).
- Created the `.claude/` intelligence system and this entry point.

**Files**
- Created `CLAUDE.md`, `.claude/{MEMORY,PROJECT_MAP,ROADMAP,PROTOCOL,SKILLS}.md`,
  `.claude/history/`, and 20 skills under `.claude/skills/`.
- **No application code was modified.**

**Architecture & Decisions**
- Documented the **dual authorization model** (service-role routes vs RLS routes) as the repo's
  most dangerous footgun, and made it CRITICAL in `MEMORY.md`.
- Recorded that the Supabase schema is not version-controlled — future sessions must not assume a
  table/policy exists because code references it.
- Chose 20 skills: the 8 required workflow skills plus 12 covering the subsystems that actually
  exist here (API conventions, Supabase access, caching, tournament, progress, calculators,
  courses, clinical/external APIs, Gemini, spotting, UI conventions, deployment/env).

**Verification**
- `npx tsc --noEmit` → **exit 0, 0 errors**.
- `npm run lint` → **cannot run**; no ESLint config, `next lint` prompts for setup. No baseline.
- `npm run build` → **exit 0** with a populated `.env` (~170 routes). Fails without `.env` — see §9.
- Tests → **none exist**. No framework, no test files, no CI.

**Remaining**
- None for this task.

**Next**
- Register the remaining course subjects (`.claude/ROADMAP.md` §Recommended Next Feature).

---

## 9. Verification Baselines

> **Load-bearing.** Without these a future session cannot tell its own breakage from pre-existing
> breakage. Re-measure and update them whenever they change.

| Check | Command | Baseline as of 2026-09-12 |
| --- | --- | --- |
| Type-check | `npx tsc --noEmit` | **PASSES — 0 errors.** Any error you see is yours. |
| Lint | `npm run lint` | **NOT AVAILABLE.** No ESLint config; the command opens an interactive setup prompt. Do not report lint as passing. |
| Build | `npm run build` | **PASSES — re-verified 2026-09-12** with the dev server stopped, after the AdSense work (the first successful run since the PWA removal, the shadcn migration and the Outfit switch): exit 0, ~170 routes, middleware 81.8 kB, shared JS 87.8 kB. Stop `npm run dev` first — they share `.next` and corrupt each other (§7 Known Issue 10). **PASSES with a populated `.env`** — exit 0, ~170 routes emitted, middleware 81.8 kB, shared JS 87.8 kB. Only `/_not-found` is static; everything else is `ƒ` (dynamic, server-rendered on demand). **Without `.env` it FAILS**: `Missing environment variable: NEXT_PUBLIC_SUPABASE_URL` while collecting page data for `/api/admin/registrations`. Expected non-fatal warnings: the `@supabase/supabase-js` Edge-runtime `process.version` notice, the stale `caniuse-lite` Browserslist notice, and two webpack "Serializing big strings" cache notices. |
| Mobile build | `npm run mobile:build` | **PASSES** — 94 static pages, 90 HTML files under `mobile/out/calculation-tools/`, 7.7 MB, shared JS 87.9 kB, stylesheet **96,034 bytes** (re-measured 2026-09-12 after the AdSense work; grew from 93,056 with the calculator UI kit's classes). Independent of `.env` and safe to run while `npm run dev` is up (separate `mobile/.next`). **Also assert zero ad strings in `mobile/out`** — see `.claude/skills/adsense-monetization/SKILL.md`. |
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
