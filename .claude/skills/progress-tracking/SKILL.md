# Progress Tracking & Dashboard

## Purpose
Record and display user learning progress — unit visits, flashcards, quiz attempts, spotting
lessons, streaks, and the activity feed — without breaking data isolation or the caching contract.

## Trigger Examples
- "track progress on this new page"
- "the dashboard shows nothing / stale data"
- "add a new progress event type"
- "why is the streak zero?"

## Read First
1. `src/lib/progress-server.ts` — `applyProgressEvent()` is the single write path.
2. `src/lib/activityQueue.ts` — the client-side batching queue.
3. `.claude/MEMORY.md` §4 (the progress tree and its invariants).

## Architecture Context

### The write path
```
client action
  └─ queueActivity({ type, ... })          src/lib/activityQueue.ts
       ├─ flush at 8 events, or every 8s, or on beforeunload/visibilitychange (sendBeacon)
       └─ POST /api/progress/batch  →  applyProgressEvent() per event
                                         (single-event POST /api/progress uses the same function)
```
Both routes funnel through `applyProgressEvent()` deliberately, so the batched and single paths can
never drift.

### The read path
```
useProgress()                              src/hooks/useProgress.ts
  ├─ module-scope cache, 20s stale time, de-dupes concurrent fetches into one in-flight promise
  └─ GET /api/progress
       ├─ auth (user client) → rate limit (20/10s per user)
       ├─ Redis  progress:v1:{userId}   TTL 45s   → X-Cache: HIT
       └─ service-role client, Promise.allSettled over 5 child queries, partial failures → []
```

### The data tree
```
progress (one row per user; created on demand by applyProgressEvent)
  ├─ unit_progress       upsert onConflict "progress_id, unit_id"
  ├─ flashcard_progress  upsert onConflict "progress_id, category"
  ├─ quiz_attempts       INSERT ONLY (a history)
  └─ spotting_progress   upsert onConflict "progress_id, lesson_id"
activity_log             keyed by user_id, NOT progress_id
```

### Event types and their required fields
| `type` | Required | Also used |
| --- | --- | --- |
| `unit` | `unitId` | `unitTitle`, `subject`, `semester` |
| `flashcard` | `category` | `correct` (boolean) |
| `quiz` | `quizId`, numeric `score`, numeric `total` | `subject`, `timeTakenMin` |
| `spotting` | `lessonId` | `category`, `lessonTitle` |
| `activity` | — | `label`, `href` |
All types optionally take `timeSpentMin`, which is added to `progress.total_time_spent_min`.

Every non-`activity` event **also** writes a human-readable `activity_log` row (e.g.
`Quiz: Biochemistry – 8/10`). That label is what the dashboard feed renders — not the raw type.

## Procedure

### Tracking from a new page
Use the existing hook/component rather than calling fetch directly:
```tsx
"use client";
import { useTracker } from "@/hooks/useTracker";
// or <UnitTracker ... /> from "@/components/UnitTracker"
```
If you need a raw event, use `queueActivity({ type: "unit", unitId, unitTitle, subject, semester })`
from `src/lib/activityQueue.ts`. **Do not** `fetch("/api/progress", { method: "POST" })` directly —
that bypasses batching and hits the 10/10s write limiter fast.

### Adding a new event type
1. Extend the `type` union in `ProgressEventPayload` (`src/lib/progress-server.ts`).
2. Add a `validateEvent()` case that rejects missing required fields with
   `ProgressEventValidationError` (it maps to 400, not 500).
3. Add a `switch` case performing the insert/upsert. Use `upsert` + `onConflict` **only if the
   composite unique constraint exists in Supabase** — ask the user; the schema is not in the repo.
4. Add a human-readable entry to the `activityLabel` map.
5. Extend the `ProgressData` type in `src/hooks/useProgress.ts` and the `EMPTY` object.
6. Add the new table to the `Promise.allSettled` block and `payload` in `GET /api/progress`.
7. Derive it in `src/components/dashboard/dashboard-data.ts` and render it in
   `src/components/dashboard/Sections.tsx` (verify by feeding fixtures to `DashboardView`).

### Debugging "the dashboard is empty"
In this order:
1. Is the user authenticated? Anonymous → 401 and `useProgress` returns nothing.
2. Did the queue flush? It waits up to **8 seconds** — navigate away or wait.
3. Is the read cached? `progress:v1:{userId}` lives **45 seconds**. Check the `X-Cache` header.
4. Did a child query fail? Partial failures log `[progress GET] <table> query error` and return
   `[]` — the page renders, the section is empty. **Check the server log.**
5. Does the `progress` row exist? It is created on the first event, not at signup.

## Files Usually Involved
- `src/lib/progress-server.ts`, `src/lib/activityQueue.ts`, `src/lib/redis.ts`, `src/lib/rateLimit.ts`
- `src/app/api/progress/route.ts`, `src/app/api/progress/batch/route.ts`
- `src/hooks/{useProgress,useTracker,useSupabaseUser}.ts`, `src/components/UnitTracker.tsx`
- `src/components/dashboard/*`

## Security Checks
- [ ] **`.eq("user_id", user.id)` on every service-role query** — these routes bypass RLS entirely.
- [ ] `progress_id` resolved from the authenticated user, **never** accepted from the client.
- [ ] `activity_log` filtered by `user_id`.
- [ ] Cache key includes the user id (`progress:v1:{userId}`) — a shared key would serve one user's
      progress to another.
- [ ] Rate limiter keyed by `user.id`.
- [ ] Validation failures return 400 via `ProgressEventValidationError`, not 500.

## Validation
`validateEvent()` is the gate; extend it for any new type. It deliberately mirrors the NOT NULL
columns in the Supabase schema.

## Tests & Verification
```bash
npm run dev
# trigger an action, wait ~8s or navigate away, then:
curl -s -D- "localhost:3000/api/progress"      # check X-Cache and the payload
```
Reload `/dashboard` and confirm the feed shows the human-readable label. Remember the 45s cache and
the 8s flush. Verify isolation by signing in as a second user. **No tests exist.**

## Common Failure Modes
- **Tracking before the session resolves.** Fixed in `useTracker` (events are held), but anything
  that bypasses it and reads `user` in a mount effect will silently drop — MEMORY gotcha 59.
- **Clearing `completed`.** Only send `completed: true`; a plain visit must omit the column.
- **Testing immediately** and concluding it is broken — 8s flush + 45s cache.
- **Dropping the `user_id` filter** on a service-role query.
- **Adding an event type but not the read side** — it writes and never displays.
- **`upsert` with `onConflict` where no unique constraint exists** → duplicate rows.
- **Calling `/api/progress` directly in a loop** → 429 from the 10/10s write limiter.
- **Expecting `current_streak`/`longest_streak` to update.** Nothing in this repo writes them;
  either a Postgres trigger does, or they are permanently 0. ⚠ Unverified.
- **Forgetting `invalidateProgressCache(user.id)`** after a write.
- **Confusing `activity_log` (user_id) with the child tables (progress_id).**

## Do Not
- Do not bypass `applyProgressEvent()` — it is the single write path on purpose.
- Do not POST directly where `queueActivity` is appropriate.
- Do not cache progress under a key lacking the user id.
- Do not use `supabaseAdmin` here; these routes use `createServiceSupabaseClient()`.

## Update Project Knowledge
New event type or table → `.claude/MEMORY.md` §4. If it needs a Supabase column or constraint, say
so explicitly in the report — you cannot apply it.
