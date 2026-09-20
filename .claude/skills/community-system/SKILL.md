# Community System

## Purpose
Work on the Reddit-shaped community: spaces, posts, nested comments, voting,
saves, karma and moderation. Covers the schema that is **not** in the Supabase
dashboard by default, how to change it safely, and how to verify SQL locally.

## Trigger Examples
- "add X to the community"
- "comments are in the wrong order"
- "voting is off by one"
- "add a new space"
- "the community pages 500"

## Read First
- `supabase/migrations/20260920_community.sql` — the whole schema, RLS and seed.
- `src/lib/community/pure.ts` — validation, normalisation, comment-tree building.
- `src/lib/community/server.ts` — `ensureMember`, `loadVotes`, error shape.
- `src/app/api/community/posts/route.ts` — the reference route (feed + create).
- `.claude/MEMORY.md` §3 — the authorization model. The community is **Model B**.

## Architecture Context

Eight tables, all `community_*`, all created by the one migration:

```
community_members      (user_id PK → auth.users, handle, karma, counts)
community_spaces       (slug, name, icon, accent, flairs[], rules[])   -- seeded, read-only via RLS
community_posts        (space_id, user_id, kind, title, body, score, hot_rank, accepted_comment_id)
community_comments     (post_id, parent_id, user_id, body, depth, score)
community_votes        (user_id, target_type, target_id, value ±1)     PK (user_id,target_type,target_id)
community_saves        (user_id, post_id)                              private by RLS
community_memberships  (user_id, space_id)
community_reports      (reporter_id, target_type, target_id, reason)   insert+own-read only
```

**Authors are `community_members`, not `profiles`.** The community FKs to its
own member table on purpose: `profiles` is not version-controlled, so the
community must not break if it changes. `ensureMember()` creates the row on a
member's first write — call it in **every** write route before inserting.

### What the database owns, not the app
Do not reimplement any of these in TypeScript; they are triggers/functions:

| Thing | Where |
| --- | --- |
| `score` / `up_count` / `down_count` | recomputed by `community_apply_vote_counts()` on any vote change |
| `post_karma` / `comment_karma` | same trigger, summed from the author's rows |
| `comment_count`, `post_count`, `member_count`, `reply_count` | counter triggers |
| `hot_rank` | `community_posts_touch_rank()` on insert or score change |
| comment `depth`, cross-post reply refusal | `community_comments_set_depth()` |
| cast / switch / toggle-off vote logic | `community_vote()` RPC |
| a page of roots + all descendants | `community_comment_tree()` RPC |

**Voting is server-authoritative.** The client sends a *direction*; the RPC
decides what that means and returns the stored score. `useCommunityVote`
predicts optimistically and then overwrites its prediction with the response.
Never accept a score or a delta from the browser.

## Procedure

### Changing the schema
1. **You cannot apply DDL.** No `DATABASE_URL` exists and PostgREST cannot run
   DDL — the user must paste SQL into the Supabase SQL editor. Say so explicitly.
2. Add to `supabase/migrations/` as a **new** dated file; do not rewrite an
   applied one. Keep it idempotent (`if not exists`, `drop policy if exists`).
3. **Verify it locally before handing it over** — see below. This is not
   optional: a migration that errors halfway leaves the schema in a split state.
4. New table → **write its RLS policies in the same file**. A table with RLS
   enabled and no policy is invisible; one without RLS is world-writable.

### Verifying SQL locally (no network, no Supabase)
Postgres 16 server binaries are on this machine at `/usr/lib/postgresql/16/bin`.

```bash
export PATH=/usr/lib/postgresql/16/bin:$PATH
PGDATA=<scratchpad>/pgdata
initdb -D "$PGDATA" -U postgres --auth=trust
# The socket path must be SHORT — a scratchpad path exceeds the 107-byte limit.
mkdir -p /tmp/cpgsock
pg_ctl -D "$PGDATA" -o "-k /tmp/cpgsock -p 55432 -c listen_addresses=''" -l pg.log start
psql -h /tmp/cpgsock -p 55432 -U postgres -c "create database ctest;"
```

Stub the Supabase-only objects first (`auth.users`, a settable `auth.uid()`,
and the legacy `questions`/`answers`/`profiles` if the backfill is involved),
then run the migration with `-v ON_ERROR_STOP=1`. Run it **twice** to prove
idempotency.

To test RLS you must leave superuser — it bypasses RLS silently:
```sql
create role authed nologin nobypassrls;
grant usage on schema public, auth to authed;
grant select, insert, update, delete on all tables in schema public to authed;
set role authed;
```
Then assert that a member cannot update/delete another member's post (expect
`UPDATE 0`, not an error), cannot insert a row authored as someone else
(expect a policy violation), and cannot see another member's votes or saves.

### Adding a space
Spaces are seeded, and `community_spaces` has **no insert policy** — so they
cannot be created from the app, deliberately. Add one with an `insert … on
conflict (slug) do update` block in a new migration. Keep it pharmacy-scoped:
the community is for pharmacy students and pharmacists, and every space maps to
something in the syllabus or the job.

`icon` must be a name present in `SPACE_ICONS` in
`src/components/community/kit.tsx`, or it silently falls back to
`MessageSquare` — add the lucide import there in the same change.

### Adding a route
Copy `src/app/api/community/posts/route.ts`. Non-negotiable order:
auth → rate limit (`communityWriteLimiter` / `communityVoteLimiter` /
`communityReadLimiter`) → parse → validate and clamp → `ensureMember` →
write with an ownership filter → `NextResponse.json`.

## Gotchas

1. **`round(double precision, int)` does not exist in Postgres.** Do the
   arithmetic in `numeric` and cast back — this broke `community_hot_rank` on
   its first run.
2. **Karma is only recomputed by the vote trigger.** Any path that writes a
   `score` directly (a backfill, a manual fix) must follow it with a karma
   recompute, or authors show 0 karma despite scoring posts.
3. **A superuser bypasses RLS**, so an RLS test run as `postgres` passes
   whatever the policies say. Always `set role` to a `nobypassrls` role.
4. **RLS is row-level, not column-level.** An `update` policy scoped to the owner still lets that
   owner write *every column of their own row* through a direct PostgREST call. Score, karma,
   counters, `hot_rank`, `is_pinned` and `is_locked` are protected by the BEFORE UPDATE guard
   triggers (`community_posts_guard`, `_comments_guard`, `_members_guard`), not by RLS. **A new
   database-owned column must be added to the matching `*_guard()` function**, or a member can set
   it themselves. Test it from a `nobypassrls` role: the tampering UPDATE reports a row changed but
   the values must come back unchanged, while a legitimate title/body edit must still apply.

5. **PostgREST returns an embed as an object *or* a one-element array**
   depending on the relationship. Always normalise with `firstOf()`.
6. **`.or()` takes a comma-delimited filter string**, so unescaped commas or
   parens in a member's search text are parsed as extra filters. The feed
   strips `,()*` before interpolating.
7. **Soft delete, never hard**, for posts and comments — a hard delete
   collapses every reply underneath. The API blanks the body and drops the
   author instead.
8. **`useSearchParams` forces a CSR bailout**, so every community page wraps
   its client component in `<Suspense>`. Without it the build fails.
9. **The feed's `space` filter is `.eq("community_spaces.slug", …)` on an
   `!inner` embed** — on a non-inner join it silently returns everything.
9. Legacy `/community/question/<id>` URLs resolve through
   `community_posts.legacy_question_id`. Do not drop that column; it is the
   only link between an old shared URL and its new post.

## Verification
- `node --test scripts/community.test.mts` — 19 tests over the pure layer
  (tree building, link safety, tag normalisation, clamping, guards).
- `npx tsc --noEmit` — must stay at 0.
- The migration, run twice against a local Postgres, plus the RLS assertions.
- **Routes and pages need a live Supabase with the migration applied**; until
  the user runs it, every community page renders its error boundary. Do not
  claim the UI was exercised unless it actually was.
