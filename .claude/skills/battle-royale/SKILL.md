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
1. `.claude/MEMORY.md` gotchas 171–175.
2. `supabase/migrations/20260927_battle_royale.sql` — §9 is the engine; it is the source of truth.
3. `src/lib/battle-royale/server.ts` (error map, token, admin check) and `schemas.ts`.

## Architecture Context
- **Not the old tournament.** `br_*` tables only; nothing in `tournament_*`/`entry_codes`/Redis.
- **Identity:** public Player ID (`BR-YYYY-NNNN`, sequential, shown on the board) + private 6-char
  Game Code. Starting a battle sets an httpOnly `br_attempt` cookie; Postgres stores only its
  SHA-256. Resuming on another device rotates the token (the old one dies).
- **Engine in SQL:** `br_start_attempt`, `br_serve` (starts the question's timer — idempotent),
  `br_answer` (grades, applies timer + 2 s grace, records, advances), `br_state` (expires timed-out
  questions). Answers are the ledger; `br_recount` rebuilds totals from them. One live attempt per
  participant (partial unique index); `br_void_attempt` frees it.
- **Answer key** leaves the server only in `br_answer`'s result, after recording.
- **Scoring:** points per question (per pair on matching boards) + linear speed bonus
  (`br_settings.speed_bonus_max`) for fully correct answers. Ranking: total, R3, time.
- **Security:** RLS on, no policies; EXECUTE on `br_*` functions revoked from anon/authenticated.
  Route handlers use the service client. Admins = rows in `br_admins` (`admin` | `desk`).
- **Closing:** freeze (sets `leaderboard_frozen_at`, closes the arena) → finalise (Top N winners)
  → notify. Finalise refuses an unfrozen board.

## Procedure
- New setting → column in `br_settings` + `SettingsRow`/`toPublicSettings` + `settingsSchema` + form.
- Engine change → edit the SQL, re-run the file (idempotent), extend
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
