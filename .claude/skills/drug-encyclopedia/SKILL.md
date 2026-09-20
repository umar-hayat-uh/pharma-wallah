# Drug Encyclopedia

## Purpose

Change `/encyclopedia` — the search desk over the DrugBank import and the tabbed drug record it
opens — without silently dropping data, mis-stating a count, or putting a megabyte of chemistry
on a page whose job is search.

## Trigger Examples

- "the encyclopedia page is bad / redesign it"
- "show more of the drug data", "why doesn't it show X for this drug?"
- "add the 3D structure", "make the structure interactive"
- "the drug search is slow / wrong / returns nothing for <name>"
- Anything under `src/components/encyclopedia/` or `src/app/api/search/route.ts`

## Read First

- `CLAUDE.md` §6 rule 18 — OpenChemLib/3Dmol confinement, and the **one** exception this page owns.
- `.claude/MEMORY.md` gotchas **73, 74** (search params, DrugBank prose) and **115–119** (capped
  list fields, invisible fields, allow-lists, the focus trap, the 3Dmol hydrogen filter).
- `.claude/MEMORY.md` gotchas **30, 51, 66, 97** — `globals.css` fighting the page, no
  `backdrop-filter` on sticky bars, the retracting header, Tailwind opacity scale.
- `.claude/skills/molecular-lab/SKILL.md` if you are touching the 3D.

## Architecture Context

**Data.** MongoDB database `pharmacopedia`, three **non-overlapping** collections —
`drugsdata`, `drugsdata_0`, `drugsdata_1` — **12,673 drugs**. Reached through the *root* native
client `lib/mongodb.tsx`, never the mongoose one (`MEMORY.md` gotcha 5).

**Route.** `GET /api/search` unions the three collections in one aggregate, ranks, paginates, then
hydrates only that page's documents. Shared with `/clinical/encyclopedia`, so its response shape
`{ success, data, pagination, searchQuery }` **must not change**. Anonymous, so it is clamped
(`q` 80, `page` ≤ 500, `limit` ≤ 20) and rate-limited (`drugSearchLimiter`, fails open).

**Page.** `src/app/(site)/encyclopedia/page.tsx` is a **server** component (metadata, URL params,
Suspense-streamed figures) wrapping `EncyclopediaClient`. State lives in the URL
(`?q=&page=&drug=`): typing replaces the history entry, opening a drug pushes one.

**Shape of the page.**
- The search bar is **always mounted** — hero band while idle (`data-open`), sticky once searching.
  One input, never re-parented (gotcha 118).
- Results are a hairline-ruled ledger with a numeral gutter, left; the record, right. Desktop
  auto-opens the first result; phones show the list first and the record replaces it.
- A record is a **tab strip of eight sections**, each tab printing what it holds. One section on
  screen at a time. **Nothing inside a section is folded, sliced or allow-listed.**

**How full the data actually is** (measured 2026-09-20, all three collections — re-measure, don't
trust this table if you are about to make a claim on screen):

| Field | Records holding it | Cap |
| --- | --- | --- |
| `smiles` | 9,404 / 12,673 | — |
| `description` | 7,989 | — |
| `pharmacodynamics.indication` | 3,760 | up to 7,703 chars |
| `interactions.drug_interactions` | 4,417 | **100** |
| `products` | 4,274 | **5** |
| `synonyms` | 9,707 | **5** |
| `classification.substituents` | 6,994 | up to 91 |
| `properties.monoisotopic_mass` | 9,036 | — |
| `properties.calculated_properties` | ~9,036 | 25 distinct kinds |

## Procedure

1. **Measure before you design or claim.** Write a throwaway script against `pharmacopedia`
   (read `.env` for `MONGODB_USER` / `MONGODB_USER_PASSWORD`; the cluster host is hardcoded in
   `lib/mongodb.tsx`), run it, **delete it**. Never print a count on screen you have not counted.
2. **Adding a field to the record?** Add it to `types.ts` if missing, render it in the right tab,
   and update that tab's `count`. The count is what tells the reader the data exists.
3. **Removing or withholding a field?** Only for a measured reason, and the page must **say so**
   where the field would have been. `UNRELIABLE_KINDS` is the pattern.
4. **Adding a tab?** Add to the `TabId` union, the `tabs` array (with `count` + `unit`), and the
   panel branch. A tab whose data is absent must not appear at all.
5. **Touching the search?** Keep the response shape; `/clinical/encyclopedia` still reads it.
   Re-check `q.length === 2` (prefix-only) and the three British-name aliases.
6. **Touching the 3D?** Reuse `molecular-lab`'s `chem.ts` → `model3d.ts` → `Viewer3D`. Keep it
   behind `next/dynamic`. Then **prove** the shared chunks are still clean (see Validation).
7. Match the existing rationale-comment density (`CLAUDE.md` §6 rule 11).

## Files Usually Involved

| File | What it owns |
| --- | --- |
| `src/app/(site)/encyclopedia/page.tsx` | Server page: metadata, URL params, streamed figures |
| `src/components/encyclopedia/EncyclopediaClient.tsx` | Search bar, result ledger, URL ⇄ state, header-follow |
| `src/components/encyclopedia/Monograph.tsx` | The tabbed record — masthead, at-a-glance, eight panels |
| `src/components/encyclopedia/StructurePlate.tsx` | 2D ⇄ 3D switch, Molecular Lab hand-off |
| `src/components/encyclopedia/Structure3D.tsx` | Conformer from SMILES + `Viewer3D`; hydrogen filter |
| `src/components/encyclopedia/prose.tsx` | DrugBank markup → React nodes (never HTML) |
| `src/components/encyclopedia/useDrugSearch.ts` | Abort-per-request, 40-entry cache, retry |
| `src/components/encyclopedia/EncyclopediaFigures.tsx` | Server, `unstable_cache` 24 h counts |
| `src/components/encyclopedia/encyclopedia.css` | All of the page's styling, scoped `.pw-enc` |
| `src/app/api/search/route.ts` | The union aggregate, ranking, clamping, rate limit |

## Security Checks

- **DrugBank prose is external data — render it as React nodes, never `dangerouslySetInnerHTML`**
  (`prose.tsx`, gotcha 74).
- **External links are protocol-checked** (`safeUrl` allows only http/https) and carry
  `rel="noopener noreferrer"`.
- **Mongo regex input is escaped** in `/api/search` — keep the `replace(/[.*+?^${}()|[\]\\]/g, ...)`.
- **Every query param clamped** against a `MAX_*` constant; `Number(null)` is `0`, not `NaN`
  (gotcha 73).
- **The route is anonymous** — the shared `drugSearchLimiter` must stay, and must keep failing open.
- No secrets: the page reads nothing from `process.env`.

## Validation

- `npx tsc --noEmit` → 0 errors.
- `npm run build` → exit 0, and **`/encyclopedia` first load ≈ 113 kB, shared JS ≈ 88.5 kB.**
- **The chunk proof, every time the 3D is touched:**
  ```bash
  grep -c -i "openchemlib\|3dmol\|GLViewer" .next/static/chunks/<each shared chunk>.js   # expect 0
  ```
  The shared chunks are the ones the build prints under "First Load JS shared by all".

## Tests & Verification

There is **no test framework and no CI**; lint is not configured. Verification here means driving
the page.

- Build and serve from an **isolated copy of the tree** (`node_modules` symlinked) on a spare port.
  Two other sessions commonly have `npm run dev` up on the real tree and a build wipes their
  `.next` (Known Issue 10).
- Assert every count **against the API payload for that drug**, not against a fixture — fetch
  `/api/search?q=<name>` inside the page and compare with the rendered DOM.
- Tab counts render a visually-hidden unit, so read `.pw-enc-tabs__n`'s **first child**, not its
  `textContent`, or `Number()` gives `NaN`.
- A CDP `verify` expression must return a **boolean**; returning a DOM node fails with
  "Object reference chain is too long".
- The 3D canvas is WebGL — `getContext` on it returns null. Prove it is not blank by **screenshotting
  the plate and decoding the PNG back inside the page** (expect ink > 2 % and > 40 distinct colours).
- Check 390×844: `scrollWidth === clientWidth`, the tab strip scrolls rather than clipping, the
  products table scrolls **inside `.pw-enc-tablewrap`**, and the record replaces the list.
- **Read the screenshots.** On the 2026-09-20 pass they caught a squat 3D stage, a missing glyph and
  a 270 px hole in the masthead — none of which any assertion saw.

## Common Failure Modes

- **The search input loses focus on the second character** — you re-parented it between the idle and
  active branches. One input (gotcha 118).
- **Lists grow bullets and left padding** — `globals.css` `ul:not(.prose ul)` has specificity (0,1,2)
  and beats `.pw-enc ul`. Neutralise with the same `:not()` (gotcha 30).
- **A focused input gets an indigo ring** — `globals.css` again; override inside `.pw-enc`.
- **A sticky bar leaves a strip of scrolling content above it** — the site header retracts; copy the
  `MutationObserver` on `header.fixed.top-0` (gotcha 66).
- **The page scroll-lags** — you put `backdrop-filter` on the sticky bar (gotcha 51). Keep it opaque.
- **A count on screen disagrees with the list under it** — you counted with a different predicate
  than you rendered with. Derive both from the same array.
- **`text-[#…]/62` renders full-strength** — off Tailwind's opacity scale (gotcha 97).
- **The 3D re-fits the previous molecule** — the `Model3D.key` did not change. The hydrogen filter
  appends `:heavy` for exactly this reason.

## Do Not

- **Do not print `interactions.total_count`, `products.length` or `synonyms.length` as a total.**
  They are capped samples (gotcha 115). Say what the cap is.
- **Do not add an allow-list over DrugBank's property kinds.** Render everything, exclude by named
  exception, and show the exception (gotcha 117).
- **Do not re-introduce truncation** — no "Continue reading", no "show first 12". The tabs are the
  mechanism for keeping a record readable.
- **Do not import OpenChemLib or 3Dmol anywhere else**, and do not un-lazy `Structure3D`.
- **Do not change `/api/search`'s response shape** — `/clinical/encyclopedia` shares it.
- **Do not edit `globals.css`** to make this page work.
- **Do not build in the real tree** while another session's dev server is up.

## Update Project Knowledge

After any change here: `CLAUDE.md` §7/§8 and §9 (if the bundle moved), `.claude/MEMORY.md` for any
new trap or re-measured figure, `.claude/PROJECT_MAP.md` if files moved, and **this skill** if a
step above turned out to be wrong.
