# Deployment & Environment

## Purpose
Build, configure, and ship PharmaWallah — and understand why the build behaves the way it does.

## Trigger Examples
- "the build is failing"
- "how do I deploy this?"
- "add a new environment variable"
- "a stale page is being served" / leftover service worker
- "set this up on a fresh machine"

## Read First
- `CLAUDE.md` §9 Verification Baselines.
- `.claude/MEMORY.md` §6 (env var names) and §7 (deployment reality).
- `next.config.mjs`, `package.json`.

## Architecture Context

### The scripts that exist
```bash
npm run dev      # next dev
npm run build    # next build    — REQUIRES a populated .env
npm run start    # next start
npm run lint     # next lint     — BROKEN: no ESLint config, opens an interactive prompt
npx tsc --noEmit # the only reliable static check
```
`npm run predeploy` / `npm run deploy` push `out/` to gh-pages. **They cannot work**: there is no
`output: "export"`, and the app has API routes and middleware, so a static export is impossible.
Treat them as dead.

Package manager: **pnpm 10.28.1** is declared in `packageManager`. Runtime: Node v24.19.0.

### Why the build needs `.env`
`src/lib/supabase-server.ts` validates env vars at **module scope**:
```ts
const getEnv = (key: string) => { const v = process.env[key]; if (!v) throw new Error(`Missing environment variable: ${key}`); return v; };
const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL');
```
That executes during Next's "Collecting page data" phase, so `npm run build` fails with
`Missing environment variable: NEXT_PUBLIC_SUPABASE_URL` at `/api/admin/registrations`.
`src/lib/supabase-admin.ts` and the root `lib/mongodb.tsx` throw at module scope too.
(Making this lazy is a tracked `ROADMAP.md` Phase 5 item.)

### Environment variables — names only, never values
**Required to build and run:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `MONGODB_URI`, `MONGODB_USER`, `MONGODB_USER_PASSWORD`.

**Required for the tournament** (`Redis.fromEnv()` throws without them):
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.

**Feature-specific:** `GEMINI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `RESEND_API_KEY`,
`OPENFDA_API_KEY`, `CLOUDINARY_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.

**Optional, with code-level fallbacks:** `GEMINI_MODEL`, `NCBI_API_KEY`, `NCBI_CONTACT_EMAIL`.

**Must stay unset:** `NEXT_PUBLIC_GEMINI_API_KEY` — read as a fallback at
`evaluate-histology/route.ts:17`; setting it would publish the key to every browser.

`.env` and `.env*.local` are gitignored. **Never commit, print, or quote a value.**

### PWA — removed
There is no PWA. `next-pwa` was uninstalled on 2026-09-12 because the offline experience is now the
real Android app (`mobile/` + `android/`), and a service worker on top of it only added a
stale-cache failure mode and an "Install app" prompt competing with the APK.

`public/sw.js` is now a **hand-written self-destructing worker** that unregisters itself and clears
its caches — necessary because past visitors still had the generated worker installed, and deleting
the file would not have released them. `src/components/ServiceWorkerCleanup.tsx` repeats the job
from the page. Both, plus the unreferenced `public/manifest.json`, can be deleted after traffic has
cycled through a release or two.

Builds no longer touch `public/sw.js` or emit `public/workbox-*.js`, so those no longer show up in
`git status` after a build.

### Images
`images.unoptimized: true`. Remote hosts are allow-listed in `next.config.mjs` `remotePatterns` —
currently only `upload.wikimedia.org` and `princetonlibrary.org`. A new external image host must be
added there or `next/image` refuses it.

### Hosting
Vercel is the evident target (`@vercel/analytics`, `@vercel/speed-insights`, and `getClientIp()`
reading `x-forwarded-for`). There is **no `vercel.json`** — configuration is presumably in the
Vercel dashboard. There is **no CI**.

The `clinical.*` subdomain requires a DNS record and a domain alias on the host; middleware does
the rest.

## Procedure

### Fresh setup
```bash
pnpm install
# create .env with the required names above — get values from the user, never invent them
npm run dev
```

### Diagnosing a build failure
1. Does `.env` exist and contain the six required names? That is the most common cause.
2. `npx tsc --noEmit` — baseline 0 errors. An error here is a real type problem.
3. Read the failure's route path. A "Collecting page data" error on an `/api/...` route is almost
   always module-scope env validation, not your change.
4. Compare warnings against the known-benign list below before reporting them as new.

### Known-benign build warnings — do not report as new
- `@supabase/supabase-js` uses `process.version`, unsupported in the Edge Runtime. (The one edge
  route, `prescription-reader-v2`, doesn't use Supabase.)
- `caniuse-lite is outdated` / `browsers data is 8 months old` (Browserslist).
- Two webpack `Serializing big strings` cache notices.

### Adding an environment variable
1. Read it **server-side only** unless the browser genuinely needs it.
2. **Never prefix a secret with `NEXT_PUBLIC_`.**
3. Prefer a **lazy** read inside the function that needs it, so the build stays env-independent.
4. Provide a graceful fallback if the feature can degrade (`src/lib/redis.ts` is the model).
5. Record the **name** in `.claude/MEMORY.md` §6 and tell the user to add it to the host.

## Files Usually Involved
- `next.config.mjs`, `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`
- `src/lib/{supabase-server,supabase-admin,redis,tournament-redis,mongodb}.ts`, root `lib/mongodb.tsx`
- `.env` (gitignored), `.gitignore`
- `public/sw.js` (hand-written self-destruct; no longer generated)

## Security Checks
- [ ] No secret in a `NEXT_PUBLIC_*` variable.
- [ ] `.env` never committed — check `git status` before any commit.
- [ ] No env **value** in a log, comment, doc, commit message, or report.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` reachable only from server code.
- [ ] Production treated as read-only by default.

## Validation
Before saying the build is fine:
```bash
npx tsc --noEmit && echo "TSC OK"
npm run build && echo "BUILD OK"
git status --short          # public/sw.js no longer changes after a build (no PWA)
```

## Tests & Verification
**No tests exist. `npm run lint` does not run** (no ESLint config; it exits 0 having linted
nothing). Never report either as passing.

## Common Failure Modes
- **Debugging a build failure that is just a missing `.env`.**
- **Reporting a benign baseline warning as new breakage.**
- **Using `npm run deploy`** — a dead gh-pages script.
- **Adding `output: "export"`** to make the deploy script work — it would break every API route and
  the middleware.
- **Setting `NEXT_PUBLIC_GEMINI_API_KEY`.**
- **Adding module-scope env validation to a new lib file**, breaking the build for anyone without
  that variable.
- **Adding a remote image host** without updating `remotePatterns`.
- **Mixing `npm` and `pnpm`** — `packageManager` declares pnpm; the lockfile is `pnpm-lock.yaml`.

## Do Not
- Do not commit `.env`.
- Do not print env values, even partially.
- Do not add `output: "export"`.
- Do not install packages or change the package manager without asking.
- Do not deploy, commit, or push unless the user asks.

## Update Project Knowledge
New env var → its **name** in `.claude/MEMORY.md` §6, plus a note that the user must add it to the
host. If any baseline changes (type-check count, build result, lint becoming available), update
`CLAUDE.md` §9 in the same task.
