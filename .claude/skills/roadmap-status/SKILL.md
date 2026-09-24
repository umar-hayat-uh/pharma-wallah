# Roadmap Status

## Purpose
Reconcile `.claude/ROADMAP.md` and `CLAUDE.md` §7 against what the code actually does, and keep the
status markers honest.

## Trigger Examples
- "what's the status of X?"
- "update the roadmap"
- "what's done and what isn't?"
- the knowledge-sync step after finishing a feature

## Read First
1. `.claude/ROADMAP.md`
2. `CLAUDE.md` §7 Current Project State
3. `git log --oneline -10`

## Architecture Context
This repo's statuses go stale in one specific direction: **files get written but never wired in**.
Nine course subjects, two calculators, and several models exist with nothing reaching them. So the
governing rule here is not bureaucratic — it is the actual failure mode:

> **Never mark something complete because a file exists.** Complete means the behaviour works end
> to end, from a link a user can click.

## Procedure
1. **Re-derive status from code, not from the roadmap.** For each item, ask: is it *reachable*?
2. **Verification commands that settle the common questions:**
   ```bash
   # Course subjects: how many are registered vs how many exist?
   grep -A8 "export const SUBJECTS" src/lib/courses/registry.ts
   ls src/lib/courses/subjects/*.ts | wc -l

   # Calculators: directories vs hub registry entries
   ls -d "src/app/(site)/calculation-tools/(tools)/"*/ | sed 's|.*/(tools)/||;s|/$||' | sort > /tmp/dirs
   grep -oE 'slug: "[^"]+"' "src/app/(site)/calculation-tools/tool-index.ts" \
     | sed 's|slug: "||;s|"$||' | sort -u > /tmp/reg
   comm -23 /tmp/dirs /tmp/reg    # exist but not on the hub
   comm -13 /tmp/dirs /tmp/reg    # on the hub but no page (broken links)

   # Is a module actually imported anywhere?
   grep -rl "<module-name>" src --include="*.ts" --include="*.tsx"

   # Spotting lesson counts per category
   ls -d "src/app/(site)/spotting/histology/lessons/"*/ | wc -l
   ls -d "src/app/(site)/spotting/pathology/"*/ | wc -l
   ls -d "src/app/(site)/spotting/powder-microscopy/lessons/"*/ | wc -l
   ```
3. **Apply the status legend strictly:**
   - ✅ **Implemented** — works end to end, reachable through the UI.
   - 🟡 **Partial** — works for some cases; or built but not reachable.
   - 🔵 **In Progress** — actively being worked on right now.
   - ⚪ **Not Started**.
   - 🔴 **Blocked** — waiting on the user or an external system. Say what on.
   - ⚠ **Needs Verification** — cannot be confirmed from the repo. Use this for anything depending
     on the Supabase schema or RLS policies, which are **not version-controlled**.
4. **Keep the six required fields** per feature: `Status / Existing implementation / Remaining work /
   Important files / Dependencies / Notes`.
5. **Re-derive `Recommended Next Feature`** if the previous one is done or no longer makes sense,
   with the reasoning — see `.claude/skills/next-feature/SKILL.md` for the priority order.
6. **Update `CLAUDE.md` §7 to match.** The two must never disagree: `Recently Completed`,
   `In Progress`, `Partially Implemented`, `Next Recommended`, `Known Issues`, `Technical Debt`.

## Files Usually Involved
- `.claude/ROADMAP.md`, `CLAUDE.md` §7
- `src/lib/courses/registry.ts`
- `src/app/(site)/calculation-tools/tool-index.ts`

## Security Checks
Security debt belongs in the roadmap too, and must not be quietly downgraded. Currently tracked in
Phase 5: unauthenticated/unthrottled Gemini routes; the unversioned Supabase schema and RLS
policies; the in-memory comments rate limiter.

## Validation
Every status change must cite what you checked — a command, a file, a commit. "I believe it's done"
is not a status.

## Tests & Verification
No tests exist and lint does not run, so "verified" here means: you read the registry, you traced
the import, or you loaded the page with `npm run dev`. Say which.

## Common Failure Modes
- **Marking ✅ because the directory exists.** The defining mistake in this repo.
- **Missing that content already ships but is unreachable** (`content/` for unregistered
  subjects).
- **Letting `ROADMAP.md` and `CLAUDE.md` §7 drift apart.**
- **Marking something ✅ that depends on an unverified Supabase table or policy** — that is ⚠.
- **Dropping a `Blocked` item's reason**, so the next session cannot tell what to unblock.

## Do Not
- Do not mark work complete that you have not confirmed is reachable.
- Do not delete a Known Issue because it is inconvenient — move it, or record why it is resolved.
- Do not invent phases. Phases here follow the project's actual arc.

## Update Project Knowledge
This skill *is* the update. Finish by confirming `.claude/ROADMAP.md` and `CLAUDE.md` §7 tell the
same story, and add a Work Log entry if the reconciliation changed anything material.
