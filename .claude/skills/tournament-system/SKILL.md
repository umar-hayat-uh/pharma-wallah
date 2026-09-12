# Tournament System

## Purpose
Work on the entry-code science-fair competition without breaking its server-authoritative scoring
or its anti-cheat guarantees.

## Trigger Examples
- "add a new tournament game"
- "the leaderboard is wrong / stale"
- "a code says no attempts left"
- "add questions to the tournament bank"
- "admin can't approve registrations"

## Read First
1. `.claude/MEMORY.md` §2 (tournament decisions) and §4 (tables, keys, limits).
2. `src/app/api/tournament/check-answer/route.ts` and `submit-score/route.ts` — the anti-cheat core.
3. `src/lib/tournament-redis.ts`, `src/lib/leaderboard-data.ts`.

## Architecture Context

### The flow, end to end
```
/tournament/play  →  POST /api/tournament/register     (IP limited 5/10min)
                          ↓  status 'pending'
     admin  →  GET  /api/admin/registrations           (ADMIN_EMAILS allowlist)
            →  POST /api/admin/registrations/approve   → mints an 8-char entry_code
                          ↓
player     →  GET  /api/tournament/validate-code?code= (Redis-cached 300s)
           →  GET  /api/tournament/game-questions      → rpc claim_tournament_attempt
                                                       → questions WITHOUT the answer key
           →  POST /api/tournament/check-answer  (per answer, grades server-side,
                                                  accumulates in a Redis session)
           →  POST /api/tournament/submit-score  (reads the score FROM REDIS, ignores the body)
                          ↓
              tournament_scores → view tournament_leaderboard_best → Redis 30s → /leaderboard
```

### The three guarantees — do not weaken any of them
1. **The answer key never reaches the browser.** `toPublicMCQ` / `toPublicFlashcard` in
   `game-questions/route.ts` strip it. Banks live server-side in `src/lib/tournament-data/`.
2. **Grading is server-side.** `check-answer` compares against `MCQ_BANK` / `FLASHCARD_BANK` and
   increments `correctCount` in the Redis session
   `tournament:attempt:{code}:{game}:{attemptNumber}` (20 min TTL). It also rejects a repeat
   `questionId` with 409.
3. **The submitted score comes from Redis.** `submit-score` reads the session and **ignores any
   score in the request body**. No session → 400 with a clear message, not a zero score.

### Attempt claiming is atomic
`game-questions` calls `supabase.rpc("claim_tournament_attempt", { p_code, p_game_type })`. This
replaced a racy "count scores, compare to `max_retries`" check. Errors are signalled through
message content: `INVALID_CODE` → 401, `CODE_USED` / `NO_ATTEMPTS_LEFT` → 403.
**The RPC is defined in Supabase, not in this repo.**

### Entry types
`solo_single`, `solo_pass`, `team_single`, `team_pass`. Games and `max_retries` derive from the
type — and those maps are **duplicated** in `admin/codes/route.ts` (`ENTRY_DEFAULTS`) and
`admin/registrations/approve/route.ts` (`GAMES_MAP` + `RETRIES_MAP`). Change one, change both.
Allowed attempts = `max_retries + 1`; `submit-score` sets `is_used` on the last one.

### Public by design
Tournament play, games, and `/leaderboard` are deliberately **not** in `PROTECTED_PATHS` —
participants authenticate with an entry code, not an account, and spectators must be able to watch
the leaderboard. Protection is the entry code plus IP rate limiting. **Do not "fix" this.**

## Procedure

### Adding questions to a bank
Edit `src/lib/tournament-data/mcq-bank.ts` or `flashcard-bank.ts`. Keep ids unique and stable —
`check-answer` looks up by id and the Redis session stores ids. **Never source tournament questions
from `src/app/api/mcq-data/*`**, which ships answers to the client.

### Adding a new game type
1. Add the bank under `src/lib/tournament-data/`.
2. Extend `GameType` in `game-questions/route.ts` and `check-answer/route.ts`.
3. Add a `toPublicX()` stripper and a grading branch in `check-answer`.
4. Add the game to the relevant `entry_type` lists in **both** admin route maps.
5. Add the key to `LeaderboardData` in `src/lib/leaderboard-data.ts` (currently
   `"mcq" | "flashcard" | "spotting"`) and to its `EMPTY` object and slicing.
6. Build the play UI under `src/app/(site)/tournament/play/`.
7. Confirm the Supabase `game_type` column accepts the new value — **ask the user if a CHECK
   constraint or enum needs changing.**

### Adding an admin
Edit `ADMIN_EMAILS` in **all three** `src/app/api/admin/**/route.ts` files. (Consolidating this is
a tracked `ROADMAP.md` Phase 4 item.)

### Debugging "no attempts left"
Check `entry_codes.is_used` and `max_retries`, then `tournament_scores` rows for that code and
game. Remember `tournament:code:{CODE}` is cached for 300s — a manual DB reset will not be visible
until you `redis.del` that key. `submit-score` already deletes it on the final attempt.

## Files Usually Involved
- `src/app/api/tournament/{register,validate-code,game-questions,check-answer,submit-score,leaderboard}/route.ts`
- `src/app/api/admin/{codes,registrations,registrations/approve}/route.ts`
- `src/lib/{tournament-redis,leaderboard-data}.ts`, `src/lib/tournament-data/*.ts`
- `src/app/(site)/tournament/play/`, `src/app/(site)/leaderboard/page.tsx`
- `src/components/tournament/LeaderboardClient.tsx`, `src/lib/game-engine/`

## Security Checks
- [ ] Answer keys stripped from every question payload.
- [ ] Grading server-side only.
- [ ] Score read from the Redis session, never from the request body.
- [ ] Repeat `questionId` within an attempt rejected (409).
- [ ] Attempt number claimed by the RPC, not computed in JS.
- [ ] Every anonymous endpoint IP rate limited.
- [ ] Admin routes check `ADMIN_EMAILS`.
- [ ] The approve flow still compensates (deletes the orphaned code) if the second write fails.

## Validation
- `code` normalised with `.trim().toUpperCase()` before any lookup — codes are uppercase.
- `entry_type` validated against the known set; unknown → 400.
- Required fields checked on register and submit.

## Tests & Verification
```bash
npm run dev
curl -s "localhost:3000/api/tournament/validate-code?code=TESTCODE"
```
Then play a full round in the browser: validate → fetch questions → answer several → submit →
check `/leaderboard`. **Requires real Upstash env vars** — `Redis.fromEnv()` throws without them.
The leaderboard caches 30s. No tests exist.

## Common Failure Modes
- **"Simplifying" submit-score to accept a client score.** That is the exploit the design prevents.
- **Sourcing questions from the client-side MCQ banks**, leaking answers.
- **Adding a game to one admin map but not the other.**
- **Forgetting the new game key in `LeaderboardData`/`EMPTY`** — scores save but never appear.
- **Re-adding `/leaderboard` to `PROTECTED_PATHS`** — breaks public spectating.
- **Debugging a stale code without clearing `tournament:code:{CODE}`.**
- **Assuming `claim_tournament_attempt` exists** in a fresh Supabase project. It does not — it is
  not in the repo.
- **Reusing a question id** — the Redis session dedupes by id, so a duplicate becomes ungradeable.

## Do Not
- Do not weaken any of the three guarantees.
- Do not make tournament play require an account.
- Do not add a `redis` null-guard in the tournament files — it is never null there.
- Do not edit `tournament_scores` directly in production to "fix" a leaderboard.

## Update Project Knowledge
New game type, table, RPC, or Redis key → `.claude/MEMORY.md` §2/§4. New route →
`.claude/PROJECT_MAP.md`. If a Supabase change is required, say so explicitly in the report — the
schema is not version-controlled.
