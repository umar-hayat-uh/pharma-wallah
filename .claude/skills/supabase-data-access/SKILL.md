# Supabase Data Access

## Purpose
Read and write Supabase Postgres correctly in PharmaWallah — picking the right client, keeping
data isolation intact, and not assuming a schema that is not in this repo.

## Trigger Examples
- "add a column to the dashboard payload"
- "why does this query return nothing / everything?"
- "write a query against `questions`"
- "should this use the service role?"

## Read First
**`.claude/MEMORY.md` §3 Authorization rules — CRITICAL, mandatory.** Then §4 for the table map.

## Architecture Context

### Four ways to get a client
| Function / export | File | Key | RLS |
| --- | --- | --- | --- |
| `createClient()` | `src/lib/supabase.ts` | anon | yes — **browser only** |
| `createClient()` | `src/lib/supabase-server.ts` | anon | yes — re-exported browser client; used server-side only by `/api/clinical/amr` (a quirk, don't copy) |
| `createServerSupabaseClient()` | `src/lib/supabase-server.ts` | anon + user cookies | **yes** |
| `createServiceSupabaseClient()` | `src/lib/supabase-server.ts` | service role | **NO — bypassed** |
| `supabaseAdmin` (singleton) | `src/lib/supabase-admin.ts` | service role | **NO — bypassed** |

### The two authorization models

**Model A — authenticate with the user client, then read/write with the service-role client.**
Used by `/api/progress*`, `/api/tournament/*`, `/api/admin/*`.

```ts
const userSupabase = await createServerSupabaseClient();
const { data: { user }, error } = await userSupabase.auth.getUser();
if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const supabase = await createServiceSupabaseClient();   // ← RLS GONE FROM HERE
const { data } = await supabase.from("progress").select("*").eq("user_id", user.id);
//                                                          ^^^^^^^^^^^^^^^^^^^^^^
//                          THIS FILTER IS THE ONLY THING PROTECTING OTHER USERS' DATA
```

**Model B — anon/user client only; Postgres RLS decides.**
Used by all `/api/qa/*` and `/api/clinical/amr`. **Those policies are not in this repository.**

## Procedure
1. **Pick the model deliberately.** Per-user data behind a route that must work reliably → Model A.
   Community content with existing policies → Model B. Write down which you chose and why.
2. **If Model A: write the ownership filter first, before the rest of the query.** Make it the
   habit, not an afterthought.
3. **Resolve ownership server-side.** For the progress tree, the chain is
   `user.id → progress.id → child table.progress_id`. Never accept a `progress_id` from the client.
4. **Check the table actually exists.** The schema is not in this repo. Known tables:
   `progress`, `unit_progress`, `flashcard_progress`, `quiz_attempts`, `spotting_progress`,
   `activity_log`, `questions`, `answers`, `votes`, `profiles`, `entry_codes`,
   `tournament_registrations`, `tournament_scores`, `tournament_leaderboard_best` (view),
   `amr_surveillance`, `pubmed_cache`, `medlineplus_cache`, `clinicaltrials_cache`.
   RPC: `claim_tournament_attempt(p_code, p_game_type)`.
   **Anything else must be confirmed with the user — you cannot create it.**
5. **Use the established query idioms:**
   ```ts
   .maybeSingle()        // 0-or-1 expected; does NOT throw on 0 rows
   .single()             // exactly 1 expected; errors on 0
   .range(offset, offset + limit - 1)
   .order("created_at", { ascending: false })
   .contains("tags", [tag])                    // array column
   .in("target_id", ids)
   .upsert(row, { onConflict: "progress_id, unit_id" })   // needs a real unique constraint
   .select("id, title, profiles!left (display_name, avatar_url)", { count: "exact" })
   ```
6. **Upserts depend on composite unique constraints** that exist only in the database. If the
   constraint is missing, `onConflict` silently produces duplicate inserts. Existing ones:
   `(progress_id, unit_id)`, `(progress_id, category)`, `(progress_id, lesson_id)`.
7. **Handle errors explicitly.** Every `{ data, error }` must check `error` — log it server-side
   and return a generic message to the client.
8. **Invalidate the cache** after a write to cached data (`invalidateProgressCache(user.id)`,
   `invalidateLeaderboardCache()`).
9. **No transactions.** PostgREST gives you none. The approve flow in
   `admin/registrations/approve/route.ts` does **manual compensation** (delete the orphaned code if
   the second write fails). Follow that pattern for multi-step writes.

## Files Usually Involved
- `src/lib/supabase-server.ts`, `src/lib/supabase.ts`, `src/lib/supabase-admin.ts`
- `src/lib/progress-server.ts`, `src/lib/leaderboard-data.ts`
- `src/app/api/{progress,qa,tournament,admin}/**/route.ts`

## Security Checks
- [ ] Service-role query has an ownership filter tied to the authenticated user.
- [ ] Ownership resolved server-side; no client id trusted.
- [ ] Model not switched from anon to service-role to silence a permissions error.
- [ ] `supabaseAdmin` / `createServiceSupabaseClient` never imported from a client component.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` never exposed, logged, or placed in a `NEXT_PUBLIC_*` var.
- [ ] Admin routes check `ADMIN_EMAILS` in addition to being authenticated.

## Validation
- Every `{ data, error }` destructure checks `error`.
- Pagination clamped against a `MAX_*`.
- Enums checked against an allow-list.
- `votes` writes populate **both** `target_id`/`target_type` **and** `question_id`/`answer_id` —
  see the comment in `src/app/api/qa/votes/route.ts`.

## Tests & Verification
```bash
npx tsc --noEmit
npm run dev
curl -s -i "localhost:3000/api/<route>"
```
Verify isolation by hand: sign in as user A, create data, sign in as user B, confirm B cannot see
or modify it. **No tests exist** — this manual check is the only isolation verification available.

## Common Failure Modes
- **Omitting the ownership filter on a service-role query.** Silent full-table exposure — the most
  serious mistake possible in this repo.
- **Assuming RLS protects a service-role route.** It does not.
- **Switching a Model-B route to service role to "fix" a 403** — removes its only protection.
- **`.single()` on a possibly-absent row** → an error where `.maybeSingle()` was wanted.
- **Assuming a table, column, constraint, view, or policy exists.** The schema is untracked.
- **Expecting `upsert` to dedupe** without the composite unique constraint in the database.
- **Forgetting cache invalidation** — the write lands but the UI shows stale data for 30–45s.
- **Expecting atomicity across two writes.** There are no transactions.

## Do Not
- Do not create migrations — you cannot apply them. Ask the user for schema changes.
- Do not drop, reset, or destructively alter anything. Production is read-only by default.
- Do not add a new service-role usage without an explicit ownership filter in the same commit.

## Update Project Knowledge
New table, column, constraint, view, or RPC → record it in `.claude/MEMORY.md` §4 **and** tell the
user it needs applying in the Supabase dashboard, since the schema is not version-controlled.
