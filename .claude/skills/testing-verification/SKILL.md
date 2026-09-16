# Testing & Verification

## Purpose
Verify a change to PharmaWallah honestly, and know exactly what this repo can and cannot prove.

## Trigger Examples
- "verify this works"
- "run the tests"
- "did that break anything?"
- the verification step of every implementation task

## Read First
`CLAUDE.md` §9 Verification Baselines. Those numbers are load-bearing — without them you cannot
tell your breakage from pre-existing breakage.

## Architecture Context — READ THIS BEFORE CLAIMING ANYTHING

**There is no test framework and no CI in this repository.**

- No Jest, Vitest, Playwright, Cypress, or any other framework.
- No `test` script in `package.json`.
- No `.github/` directory and no CI of any kind.
- **The only tests** are two `node --test` files for pure calculator modules (2026-09-14/16):
  ```bash
  node --test scripts/tlc-rf.test.mts scripts/colony-counter.test.mts   # 41 tests, ~10 s
  ```
  They load `src/` TypeScript through Node 24's type stripping, which works only because the
  modules under test import each other with `import type` and explicit `.ts` specifiers are
  confined to the `.mts` test files (the root `tsconfig` does not include `.mts`). The colony tests
  run the real OpenCV.js from `node_modules` against synthetic plates
  (`test-data/colony-counter/fixtures.json`).

**Therefore never write "tests pass" or "test suite clean" about the repo.** Name what ran: "the 41
TLC/colony unit tests pass". Nothing else in the codebase is covered.

**Pattern for a new pure module:** keep it free of runtime imports (types only), write
`scripts/<tool>.test.mts` with `node:test` + `node:assert/strict`, and import with the `.ts`
extension.

**`npm run lint` also does not work.** There is no `.eslintrc*` or `eslint.config.*` anywhere, so
`next lint` drops into its interactive *"How would you like to configure ESLint?"* prompt and exits
**0** without linting a single file. **Exit code 0 here means nothing ran, not "no problems."**
Never report lint as passing. (Configuring it is `ROADMAP.md` Phase 5.)

## Procedure

### 1. Type-check — the one reliable static check
```bash
npx tsc --noEmit
```
**Baseline: exit 0, zero errors.** Any error is yours. `tsconfig.json` has `strict: true`, so this
catches a meaningful amount.

### 2. Build
```bash
npm run build
```
**Baseline: passes with a populated `.env`** (~170 routes, middleware 81.8 kB, shared JS 87.8 kB;
only `/_not-found` is static, everything else is `ƒ` dynamic).

**Without `.env` it fails** with `Missing environment variable: NEXT_PUBLIC_SUPABASE_URL` while
collecting page data for `/api/admin/registrations` — that is the module-scope env validation in
`src/lib/supabase-server.ts`, not your change. Check `.env` exists before debugging a build failure.

Expected non-fatal warnings, present at baseline — **do not report them as new**:
- `@supabase/supabase-js` uses `process.version`, unsupported in the Edge Runtime.
- `caniuse-lite` is outdated (Browserslist notice).
- Two webpack "Serializing big strings" cache notices.

Note: every build regenerates `public/sw.js` and `public/workbox-*.js`. Expect them in `git status`.

### 3. Run it and actually look
```bash
npm run dev
```
This is the **only way to verify behaviour** in this repo. Load the page you changed; hit the
endpoint. For an API route:
```bash
curl -s -i localhost:3000/api/<route>?<params>
```
Note that PWA/service-worker behaviour is disabled in development by design.

### 4. Targeted manual checks by area
| Changed | Check |
| --- | --- |
| A route handler | `curl` it: happy path, missing param → 400, unauthenticated → 401, hammer it → 429 |
| Auth / middleware | Load a protected path (`/dashboard`) logged out → redirect to `/signin?redirect=…`; and logged in |
| Progress | Trigger an action, wait ~8s for `activityQueue` to flush (or navigate away), reload `/dashboard`. Remember `GET /api/progress` caches for **45s** |
| Tournament | Validate a code, play, submit; confirm the score came from the Redis session. Leaderboard caches for **30s** |
| A calculator | Load `/calculation-tools`, find the card, open the tool, enter a known value, check the number |
| A course subject | `/courses` → subject → unit; confirm the markdown renders and prev/next work |
| Clinical / external API | Hit it twice: first `source: "rxnorm"`/live, second should be `source: "cache"` |
| UI | Check light **and** dark (`darkMode: "class"`), and a narrow viewport |

### 5. Report honestly
State what you ran and what it returned. **State explicitly what you did not verify.** For example:

> `npx tsc --noEmit` → 0 errors. `npm run build` → passed. I did not load the page in a browser.
> No tests exist in this repo and lint is not configured, so neither was run.

## Files Usually Involved
- `CLAUDE.md` §9 (baselines — update if a result changes)
- `package.json` (the real script list)

## Security Checks
- Remove any temporary debug logging before reporting done.
- Never paste an env value, token, cookie, or user email into output, a log, or the report.
- Do not disable auth or a rate limit to make manual testing easier and then forget to restore it.

## Validation
"Verified" means you observed the new behaviour, not that the code compiled. Compilation is
necessary and nowhere near sufficient.

## Tests & Verification
As above: type-check works, build works, manual exercise works. **Tests do not exist. Lint does not
run.**

## Common Failure Modes
- **Claiming tests passed.** There are none.
- **Claiming lint passed** because it exited 0. It never ran.
- **Reporting a pre-existing build warning as new.** Compare against §9.
- **Debugging a build failure that was just a missing `.env`.**
- **Testing progress immediately** and seeing nothing — the client queue flushes on an 8s timer and
  the GET is cached for 45s.
- **Testing the leaderboard immediately** after a score — 30s cache.
- **Testing a tournament route with no Upstash env vars** — `Redis.fromEnv()` throws at import.
- **Alarm at `public/sw.js` appearing in the diff.** It is generated.

## Do Not
- Do not invent a command. Only `dev`, `build`, `start`, `lint` (broken), and `npx tsc --noEmit`
  exist. `predeploy`/`deploy` are dead gh-pages scripts that cannot work.
- Do not install a test framework without asking.
- Do not overstate. Under-claiming is always safer than a false "verified".

## Update Project Knowledge
If any baseline changes — type-check error count, build result, or lint becoming available —
**update `CLAUDE.md` §9 in the same task.** A stale baseline actively misleads the next session.
