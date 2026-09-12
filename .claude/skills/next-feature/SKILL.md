# Next Feature

## Purpose
Decide what to build next in PharmaWallah, grounded in the reconciled roadmap and the actual state
of the code — not in what sounds exciting.

## Trigger Examples
- "what should we build next?"
- "continue where we stopped"
- "follow protocol and continue"
- "what's the next logical step?"

## Read First
1. `CLAUDE.md` §7 Current Project State — especially `Next Recommended` and `Partially Implemented`.
2. `.claude/ROADMAP.md` — `Current Phase` and `Recommended Next Feature`, then the phase sections.
3. `git log --oneline -10` — where work actually stopped, in the user's own words.
4. `git status --short` — anything mid-flight.

## Architecture Context
PharmaWallah's feature surface is essentially complete; the gap is between **assets that exist in
the repo** and **assets a user can reach**. Phase 4 (catalogue completion & consolidation) is the
current phase for that reason. High-value work here is usually *wiring*, not *building*.

## Procedure
1. **Check git state first.** If the tree is dirty, the answer is "finish what's in progress" —
   say so and stop. `git log -5` often names the thread better than any doc
   (e.g. `cology-calcs-added` → the calculator catalogue).
2. **Read `ROADMAP.md` §Recommended Next Feature.** It carries the reasoning, not just the name.
3. **Reconcile it against the code before recommending it.** The roadmap can go stale. Verify:
   - Is it still unimplemented? (`ls` the directory, `grep` the registry)
   - Did a recent commit already do part of it?
   - Is it blocked on something only the user can do (a Supabase migration, an env var, a decision)?
4. **Apply this project's priority order** when the roadmap's top item no longer fits:
   1. **Finish what's half-done** — partial features have the best value-per-risk here, because
      the content or code already exists and only needs wiring.
   2. **Unblock users** — something reachable-but-broken, or written-but-unreachable.
   3. **Reduce duplication that causes bugs** — the admin allowlist in three files, the entry-type
      maps in two.
   4. **Harden what spends money or exposes data** — the four unauthenticated Gemini routes.
   5. **Then** new features.
5. **Size it honestly.** Say whether it is a one-liner, an afternoon, or a project, and what the
   risky part is.
6. **Recommend exactly one thing**, with the reasoning in two or three sentences, plus the first
   concrete step. Do not present a menu unless the user asked to choose.
7. **If the user says go**, switch to `.claude/PROTOCOL.md` and `implement-feature`.

## Files Usually Involved
- `.claude/ROADMAP.md`, `CLAUDE.md` §7
- `src/lib/courses/registry.ts` (the current top item lives here)
- `src/app/(site)/calculation-tools/CalculationToolsClient.tsx`

## Security Checks
When ranking, weight security debt honestly. Currently the two that matter:
- Four Gemini routes are unauthenticated and unthrottled — open, billable endpoints.
- The Supabase schema and every RLS policy exist in exactly one place, with no backup or review
  trail.

## Validation
Before recommending, verify the item is genuinely not done:
```bash
grep -n "SUBJECTS" src/lib/courses/registry.ts          # course registration status
ls src/lib/courses/subjects/ | wc -l                     # 14 files vs 4 registered
ls -d "src/app/(site)/calculation-tools/(tools)/"*/ | wc -l
```

## Tests & Verification
Recommending changes nothing, so nothing to run. Do not claim anything was verified.

## Common Failure Modes
- **Recommending something already done** because the roadmap was not reconciled against the code.
- **Recommending a rewrite** when the repo's real need is wiring existing assets.
- **Ignoring a dirty working tree** and starting something new on top of it.
- **Treating a file's existence as completion** — nine subject files exist and none are reachable.
- **Recommending work blocked on the user** (a Supabase migration) without saying it is blocked.

## Do Not
- Do not start implementing during a "what's next" question — recommend, then wait.
- Do not hand back an exhaustive survey. One recommendation, with reasoning.
- Do not invent roadmap items that contradict `ROADMAP.md` without explaining why it is stale.

## Update Project Knowledge
If reconciliation shows the roadmap is stale, **fix `.claude/ROADMAP.md` and `CLAUDE.md` §7 now**,
as part of answering — do not just mention it.
