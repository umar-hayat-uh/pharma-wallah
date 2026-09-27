# Battle Royale

## Purpose
Work on the Pharma Fest "Battle Royale" event (`/battle-royale`) without weakening its
server-authoritative game engine, its Game Code identity model, or its admin roles.

## Trigger Examples
- "add questions / change scoring / change the rounds"
- "a player can't start / says already played"
- "the leaderboard is wrong", "freeze / finalise results"
- "add an admin", "emails aren't sending"

## Read First
1. `.claude/MEMORY.md` gotchas 171–179.
2. `supabase/migrations/20260928_battle_royale_v2.sql` — the current engine (v1 file holds the tables); the SQL is the source of truth.
3. `src/lib/battle-royale/server.ts` (error map, token, admin check) and `schemas.ts`.

## Architecture Context
- **Not the old tournament.** `br_*` tables only; nothing in `tournament_*`/`entry_codes`/Redis.
- **Flow (v2):** register → Player ID emailed (no code) → pay at desk → admin "Approve & issue code"
  (`br_issue_code`: paid + checked in + unique 6-char code, shown only on the admin slip, never
  emailed) → station takes the code alone, which is consumed → battle → status/leaderboard.
  Re-issuing a code resumes the same attempt on a new station; the old code and cookie die.
- **Offline-first station:** `br_start_attempt` returns the whole battle without answers (word grid
  + list, boards with shuffled Column B, MCQs). The station saves it in localStorage and submits
  one round at a time (`br_submit_round`, idempotent). Round window = previous round's server
  arrival + the round's time + `sync_grace_seconds`; later = 0 for the round.
- **Round 1 is a word search** generated in SQL (`br_make_wordsearch`, 8 directions); positions stay
  server-side and `br_ws_path_spells` verifies each claimed path.
- **Scoring:** correctness only (no speed bonus in v2). Ranking: total, R3, server-measured battle time.
- **Security:** RLS on, no policies; EXECUTE on `br_*` functions revoked from anon/authenticated.
  Route handlers use the service client. Admins = rows in `br_admins` (`admin` | `desk`).
- **Closing:** freeze (sets `leaderboard_frozen_at`, closes the arena) → finalise (Top N winners)
  → notify. Finalise refuses an unfrozen board.

## Procedure
- New setting → column in `br_settings` + `SettingsRow`/`toPublicSettings` + `settingsSchema` + form.
- Engine change → edit the v2 SQL, re-run it (idempotent; it ends with `notify pgrst`), extend
  `scripts/battle-royale-engine.test.sql`, run it on a throwaway Postgres.
- Every Zod transform must accept its own output (gotcha 171); `node --test scripts/battle-royale.test.mts`.

## Local test stack (no Docker)
1. `initdb` a cluster in the scratchpad (`/usr/lib/postgresql/16/bin`), `-k ''` (socket path too long),
   create roles `anon`, `authenticated`, `service_role bypassrls`, `authenticator` and a stub
   `auth.users`; apply the migration + question seed.
2. PostgREST static binary with `jwt-secret`; mint anon/service_role HS256 JWTs.
3. A Node proxy on :54321: `/rest/v1/*` → PostgREST, `/auth/v1/user` → fake users by bearer token.
4. Copy the tree (rsync, no `.env`), `.env.local` pointing at the proxy, `RESEND_API_KEY=` and
   Upstash vars blank; `next dev` on its own port. Sign an admin in with the cookie
   `sb-localhost-auth-token=base64-<base64url session JSON>`.

## Security Checks
- [ ] No score, participant or time accepted from a request body (schemas are `.strict()`).
- [ ] Every admin route starts with `adminGuard(role)`; every admin page with `adminForPage`.
- [ ] Public payloads never include email, phone or Game Code (leaderboard, check-in, results).
- [ ] New `br_*` function → the revoke/grant loop at the end of the migration covers it (re-run).

## Do Not
- Run the engine test or demo seed against the real Supabase project.
- Send real email from a test stack (blank `RESEND_API_KEY`).
- Label winners before finalising.
