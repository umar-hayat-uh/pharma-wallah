# Calculator Refinement

## Purpose
Bring an existing calculator up to the **PharmaWallah Calculator Refinement Standard** — the
user's global brief of 2026-09-22. The kit migration made all 104 tools *consistent*
(`MEMORY.md` gotcha 131); this standard makes them *teach*.

The whole brief reduces to one sentence, and it is the test every decision is judged against:

> **"I know exactly what to enter → I press Calculate → I immediately see the answer → I can see
> how it was calculated."**

A refined calculator teaches the student while calculating. It is not a black box that emits a
number, and it is not scientific software that has to be learned before it can be used.

## Trigger Examples
- "refine the dissolution calculator"
- "apply the refinement standard to the analysis tools"
- "add unit dropdowns / a graph / a working section to X"
- "this calculator doesn't show how it got the answer"
- "make the calculators consistent with the global instructions"

## Read First
- **This file, then `calculator-tool`** — that skill owns *creating and registering* a tool, the
  hub registry, the Android catalogue and the medical-safety rules. This one owns *quality*.
- The tool's own `page.tsx`, and its `_math.ts` sibling if it has one.
- `src/components/calculators/index.ts` — what the kit already gives you (§Kit mapping below).
- `.claude/redesign-tracker.md` → "Suspected maths issues found during Phase 2" — **check whether
  the tool you are about to refine is on that list before you touch its numbers.**
- `CLAUDE.md` §7 Known Issue 15 — ~70 recorded formula faults. Fixing one is logic work: **ask.**

---

## Architecture Context

### The standard, as the page reads top to bottom

Two families, two orders. Both exist in the repo today; pick by how the student supplies data.

#### Family A — formula tools (1–6 inputs, answer is instant)
Reference: `(tools)/bmi-calculator/page.tsx`.

```
ModeSwitch (only if there are real modes)
ResultCard              ← result FIRST, with an `empty` hint before there is input
Enter data              CalcSection + FieldGrid + NumberField/SelectField
  example chips + Reset
Working / Calculation   ResultRow list or FormulaNote → the substitution
Interpretation          ResultCard `interpretation`, or a band table
Working Formula         FormulaNote + Formula + "Where:" variable list
How it works / Learn more   CalcAbout + CalcList (aside) + CalcFaq
```
Result-first is deliberate and is **not** a violation of the brief's §8: on a phone, putting the
answer above the fields is the only way it is visible without scrolling past every input.
The result updates live as the student types — there is nothing to press.

#### Family B — experimental-data tools (a table of readings, a graph, a record)
Reference: `(tools)/calibration-curve-calculator/page.tsx`.

```
Enter data              CalcSection → NumberField / DataTable (+ CountStepper)
  example chips
[ Calculate ]  [ Reset ] [ Copy ] [ Download card ] [ Print ]   ← LabActions
Results                 StatTiles (+ ResultTable)
Graph                   ChartPanel (Recharts) — tabs if more than ~2 graphs
Calculation breakdown   FormulaNote → ReportSteps (given → formula → substitution → result)
Working Formula         FormulaNote + Formula + variable list
How it works            CalcAbout / CalcList / CalcFaq
```
Here **Calculate is real**: it sets `submitted` (which turns validation on), builds the
`LabReportData`, and scrolls to the result. Do not make a table-driven tool live-update — a
half-typed row must not flash a wrong answer, and `submitted` is what stops it.

---

### Kit mapping — what exists, and what you must build

Check this table before writing anything. Most of the brief is already built.

| Brief asks for | Use | Notes |
| --- | --- | --- |
| Labelled input, unit beside it, hint, error | `NumberField` | `units={[…]}` renders a native `<select>` beside the field; `unit="mg"` is a static suffix. `inputMode="decimal"` gives Android a keypad. |
| Dropdown | `SelectField` | Native `<select>` on purpose — OS picker on Android, no JS, no dependency in the APK. |
| Free-text (sample name, formula) | `TextField` | |
| Section headings ("Enter data", "Results") | `CalcSection` + `FieldGrid` | One column on a phone, two from `sm`. Never a fixed multi-column grid. |
| Result card | `ResultCard` | `label` / `value` / `unit` / `interpretation` / `tone` / `empty`. Does **not** wrap long values and uppercases the label. |
| Supporting figures | `ResultRow`, `StatTiles` | |
| Calculate · Reset · Copy · Download · Print | `LabActions` | Download and Print are hidden in the APK (`IS_MOBILE_APP`). `report` may be `null` — the buttons disable themselves. |
| Copy result as a sentence | `ResultCard`'s own copy button, or `reportToText` | |
| Download report (inputs + formula + working + result + graph) | `LabReportData` → `downloadReportPng` / `printReport` | `figure.svg` carries the graph into the PNG and the print sheet. |
| Editable observation table, + Add row, delete | `DataTable` (+ `nextRowId`, `makeRows`) | Text inputs with a decimal keypad, so `0.2a` is caught rather than parsed. |
| Fixed-but-variable replicate count | `CountStepper` | Every visible replicate is required. |
| Load example | `ExampleChips`, or local chips | 68 of 104 tools already have some example affordance; only 6 use `ExampleChips`. |
| Graph | `ChartPanel` + Recharts + `CHART` / `AXIS_TICK` / `makeTooltip` / `ChartLegend` / `niceAxis` / `tickLabel` | `ChartPanel` passes `initialDimension`, which silences gotcha 70's console noise. A raw `ResponsiveContainer` does not. |
| Graph in the printed report | `chartSvg` → `LabReportData.figure` | Self-contained SVG; `MEMORY.md` gotcha 36. |
| Scientific notation | `formatScientific` (`2.92 × 10⁻⁴`, real superscripts) | |
| Auto notation for very large/small | `formatSig` | Switches to scientific at ≥ 1e9 or < 1e-4; groups thousands otherwise. |
| Fixed decimals | `formatFixed` | |
| Parse a typed value | `toNumber` | Rejects `""` and `"12abc"`. **Never** `parseFloat` — it reads `12abc` as 12. |
| Validation message | `fieldError` (positive quantities) · `numericError` (signed values) | `fieldError` rejects negatives, which is wrong for an intercept, a log or a blank-corrected absorbance — use `numericError` there. |
| Inline warning / assumption | `LabNotice` | |
| "Never NaN" result | `Checked<T>` (`ok` / `fail`) from `lab-analysis/math` | Return an explanation, never `NaN`/`Infinity`. |
| Formula + variable definitions | `FormulaNote` + `Formula` | Content stays in the DOM when collapsed, so crawlers still read it. |
| "How it works" / "Learn more" | `CalcAbout`, `CalcList`, `CalcFaq` | `CalcAbout` + `AdSlot` go in `CalculatorShell`'s `aside`. |
| Educational-purposes disclaimer | **Already mounted** by `(tools)/layout.tsx` and the APK shell | Adding `CalcDisclaimer` to a page renders it twice. |
| Cross-tool hand-off | `calculatorHref(slug, params)` + `readQuery()` | |

#### Gaps — you build these yourself
- **Unit tables exist only for mass, volume and amount** (`MASS_TO_G`, `VOLUME_TO_ML`,
  `AMOUNT_TO_MOL` in `lab-math.ts`). Concentration, time, temperature, pressure and length have
  **no shared table**. `CONCENTRATION_UNITS` in `lab-analysis/parts.tsx` is a *label list*, not a
  converter. If you write a conversion table that a second tool will want, put it in
  `lab-math.ts` — it is the file that already ships to the APK.
- **Temperature is not a scale factor.** °C/°F/K need an offset, so it cannot join the
  `×factor` tables without special-casing. Write it as a pair of functions, not a constant.
- **Tabs for multiple graphs** — no kit component. Build it locally as a `ModeSwitch`
  (a radiogroup) or an `aria-pressed` chip row; do not add `@radix-ui/react-tabs`, it is not
  installed and would land in the APK.
- **A decimal-places / notation toggle** — no kit component. Local state + `formatSig` /
  `formatFixed` / `formatScientific`.
- **Reset confirmation** ("Clear all entered data?") — no kit component. Only worth it when a
  table of typed readings would be lost; never for a three-field form.

#### One bundle caution
`@/components/calculators/lab-analysis/parts.tsx` imports **Recharts at module scope**, so
importing `ExampleChips` or `DataTable` from that barrel may pull Recharts into a tool that has no
graph. A tool that only wants example chips should build them locally (most already do). If you
need to know for certain, `npm run build` and read the route's first-load size against the
baseline in `CLAUDE.md` §9 — do not reason about tree-shaking. Related: gotcha 69 — a pure maths
module must import `lab-analysis/math` and `lab-analysis/format` directly, never the barrel.

---

## Procedure

### 1. Read the tool and decide the family
Family A or B (above). Then write down, in one line each: what the student is holding when they
open this page, what they type, and what number they need. If the tool cannot answer that, its
problem is not layout.

### 2. Check the maths before you move any pixels
```bash
grep -n -A6 "<slug>" .claude/redesign-tracker.md      # is it on the suspected-faults list?
```
- **The refinement standard changes presentation, not arithmetic.** A number that is on the
  tracker's list, or that you find to be wrong, is **reported** — in the tracker and in your
  report — not quietly corrected. `MEMORY.md` gotcha 78, `CLAUDE.md` Known Issue 15.
- A **render** bug (stale result left on screen, `NaN`, a frozen tab, a unit selector that does
  nothing) may be fixed, and you say so explicitly.
- Capture the before numbers for 3–10 input sets first, the same way the migration did
  (`calculator-tool` §6). If the refinement changes a displayed number you did not intend, that
  capture is the only thing that will catch it.

### 3. Inputs (brief §2–§4)
Every field: clear label · unit shown, not typed · a hint where the source of the value is not
obvious ("from the practical sheet", "measured at 243 nm") · a placeholder holding a realistic
example value · validation.

**Unit handling is the trap.** The rule, in full:
1. Keep one **canonical** internal unit per quantity (grams, millilitres, moles — the kit's
   tables are already canonical). Convert **on read**, once, in the `useMemo` that computes.
2. Changing a unit selector **must not** rewrite the typed number and **must not** re-convert an
   already-converted value. Double conversion is the classic bug in this repo's calculators and
   it is invisible — the number is merely wrong.
3. Changing a unit **never clears data** (brief §23).
4. Decide, and state on screen, which behaviour you chose: does `50 mg/mL → µg/mL` renumber the
   field to `50000`, or keep `50` and reinterpret it? Either is defensible; silently doing one
   while the student assumes the other is not. The existing tools keep the number and reinterpret.
5. Show the unit **in the result**, always. A bare number is not an answer.
6. Where a conversion is itself interesting (`500 µg/mL = 0.5 mg/mL`), print it as a
   `ResultRow` rather than making the student do it.

### 4. Calculate and results (brief §7, §8)
One primary button, or none (Family A). Never two things that both look like "calculate".
The result goes in a `ResultCard`, not inside a table. `aria-live` is already handled by the card.

### 5. The working (brief §9, §10, §15, §17) — the part that makes it a teaching tool
Show three lines per step, in this order, and never fewer:
```
dC/dt = (C₂ − C₁) / (t₂ − t₁)        ← the formula, symbolic
dC/dt = (0.000877 − 0) / 10          ← the substitution, with the student's own numbers
dC/dt = 8.7735 × 10⁻⁵                ← the result of that step, with its unit
```
- **Full precision internally, rounding only at the point of display.** Never feed a rounded
  intermediate into the next step (`MEMORY.md`: rounding accumulation is a recorded failure mode).
- `ReportSteps` renders exactly this shape from a `LabReportData`, so the on-screen working, the
  copied text, the PNG and the print sheet are one source.
- "Where:" — define **every** symbol, in plain language, with its unit.
- **Never silently repair experimental data** (brief §17). A negative rate, a non-monotonic
  release curve or a duplicate reading gets a `LabNotice` warning **and the calculated value is
  still shown**. `firstNonIncreasing` and `duplicateIndexes` in `lab-analysis/math.ts` find these.

### 6. Graphs (brief §11–§13)
Add one **only where the shape of the data means something** — time courses, release profiles,
regression, dose–response, spectra. A graph of a single computed number is noise.
- `ChartPanel` (fixed-height box, `ResponsiveContainer` at 100%/100%), colours from `CHART`,
  axes labelled **with units**, `makeTooltip` for exact values on hover *and tap*, `ChartLegend`
  whenever there are ≥ 2 series.
- Identity is never colour alone — the palette was validated for colour-vision deficiency and the
  unknown point is also a diamond (see the comment on `CHART`). Keep that when adding a series.
- Negative values and auto-scaling: use `niceAxis`, do not hard-code a domain from `0`.
- More than two graphs → tabs, not a vertical stack.
- Mirror the graph into `chartSvg` so the downloaded and printed record carries it.

### 7. Mobile (brief §19) — the tool is used standing up, one-handed, in a lab
- `FieldGrid`, never a fixed multi-column grid.
- Tables scroll **inside their own container** (`overflow-x-auto`); the page itself must not
  scroll horizontally. Assert `scrollWidth === innerWidth` at 390.
- Touch targets ≥ 44 px on coarse pointers; the kit's inputs already are.
- The tool ships inside the APK too (gotcha 18) — check the phone width before you call it done.

### 8. Design (brief §20)
- **Use the project's brand tokens, not the hexes in the brief.** The brief names `#2563EB` /
  `#4ADE80`; the product is `#1C7BD9` / `#21B67A` (`tailwind.config.ts`, `.claude/BRAND_KIT.md`),
  and `CHART.primary` is already `#1C7BD9`. Molecular Lab and the pharmacy counter took the same
  decision for the same reason. Using the brief's blue would put a second, near-identical blue on
  a page that already carries the brand one.
- The brief's "minimal shadows, few gradients" is about decoration **a page adds for itself**. It
  does **not** mean stripping the liquid-glass `ResultCard` / `ModeSwitch` — the user asked for
  that specifically on 2026-09-20, it is shared kit, and one edit there reaches all 104 tools and
  the APK (gotcha 136). Kit-level visual changes are a separate, deliberate decision.
- No black grounds (`CLAUDE.md` §6 rule 15). Tailwind opacity modifiers only work on the theme
  scale — `/62` generates nothing and renders full ink (gotcha 97).

---

## Files Usually Involved
- `src/app/(site)/calculation-tools/(tools)/<slug>/page.tsx` — the tool.
- `src/app/(site)/calculation-tools/(tools)/<slug>/_math.ts` — pure maths, if it is big enough to
  hand-check with `npx tsx`.
- `src/components/calculators/` — the kit. **Changing anything here reaches 104 tools + the APK.**
- `src/components/calculators/lab-analysis/` — tables, charts, regression, the print figure.
- `.claude/redesign-tracker.md` — where a suspected formula fault is recorded.

## Security Checks
A calculator is client-side and touches no data store, so the surface is the one in
`calculator-tool`: no key or `NEXT_PUBLIC_*` credential in the page, no unvalidated input into
`dangerouslySetInnerHTML`, and any API route it calls does its own auth and rate limiting. A
refinement adds one more: **Copy, Download card and Print put the student's typed values into the
clipboard, a PNG and a print sheet** — make sure the report carries only what they entered and
what was computed from it, never a page URL with a query string you did not intend to share.

## Validation checklist (brief §16)
- [ ] Empty field → a hint, never `NaN`, never `0` treated as a real reading.
- [ ] Non-numeric (`12abc`) → rejected by `toNumber`, message shown.
- [ ] Zero where zero is invalid; negative where negative is meaningless.
- [ ] Division by zero handled explicitly, with a sentence that says which quantity is the problem.
- [ ] Duplicate observations / missing rows in a table flagged.
- [ ] Unit conversion applied **exactly once**.
- [ ] Rounding only at display; intermediates kept at full precision.
- [ ] Messages are plain English ("Please enter a valid concentration."), never a type name or a
      stack trace.
- [ ] An unusual-but-real result is **warned about and still shown**.

## Tests & Verification
```bash
npx tsc --noEmit                    # baseline 0 errors (CLAUDE.md §9)
node --test scripts/<tool>.test.mts # only if the tool has a pure module worth testing
npm run dev                         # then drive the page
```
Then, in the browser — this is the part that actually proves the refinement:
1. The **same inputs give the same numbers** as before the refinement (your step-2 capture).
2. Every unit in every dropdown, changed one at a time; the result changes by exactly the factor
   it should, and the unit shown with the result changes with it.
3. Load example → Calculate → the working reads as three lines per step → Copy → paste and read it.
4. Empty, zero, negative, non-numeric, and one deliberately absurd value.
5. 1440×900 **and 390×844**: 0 console errors, 0 exceptions, `scrollWidth === innerWidth`,
   and **read the 390 screenshot** — every real defect found in this repo's calculator work was
   found by looking at a screenshot, not by an assertion.
6. If the tool is in the APK, check it in `mobile/out` as well (`android-app-capacitor`).

`npm run lint` does not run in this repo, and there is no test framework beyond the five
`node --test` files. Report honestly.

## Common Failure Modes
- **Double unit conversion.** The number is wrong and nothing looks wrong.
- **Rounding an intermediate**, then using it. Shows up as a last-digit drift the student cannot
  reproduce by hand — which is exactly what these tools are for.
- **A unit selector wired to state but not to the maths.** Two tools shipped like this
  (`DensityConversionCalculator`, `heat-transfer-area`). Changing the unit does nothing.
- **"Fixing" a formula during a presentation pass.** Record it; ask.
- **A graph added because the section exists.** If it carries no information, leave it out (§11).
- **Silently normalising experimental data** so the curve looks nice.
- **Adding `CalcDisclaimer`** — already mounted twice over.
- **Editing the kit to solve one tool's problem** — it reaches 104 tools and the APK.
- **A raw `ResponsiveContainer`** instead of `ChartPanel` → console noise (gotcha 70).
- **`parseFloat`** anywhere near a student's typed value.

## Do Not
- Do not change a displayed number as a side effect of a layout change.
- Do not use the brief's `#2563EB` / `#4ADE80`; use the brand tokens.
- Do not strip the shared kit's glass, motion or gradient to satisfy §20.
- Do not add a dependency (tabs, charts, maths) — Recharts, lucide-react and framer-motion are
  what this project has, and everything here ships inside an 8.9 MB APK.
- Do not rename a tool directory; it is the URL.
- Do not refine a tool and leave its hub `desc` describing something else.

## Update Project Knowledge
Refining a single tool is routine. **Do** update:
- `.claude/redesign-tracker.md` — any formula fault found, with evidence.
- `CLAUDE.md` §7 Known Issue 15 — if the fault is serious enough to mislead clinically.
- **This skill** — if you build something the kit was missing (a unit table, a graph-tab
  component, a notation toggle), move it out of §Gaps and into the mapping table, and say where
  it lives.
