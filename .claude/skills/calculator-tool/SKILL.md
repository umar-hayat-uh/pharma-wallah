# Calculator Tool

## Purpose
Add or modify one of the 104 pharmacy calculation tools, and make sure it is actually reachable
from the hub (98 are registered on it).

**Improving a tool that already works** — units, examples, the step-by-step working, a graph,
mobile behaviour — is `.claude/skills/calculator-refinement/SKILL.md`. This skill owns creating,
registering and the medical-safety rules; that one owns quality.

## Trigger Examples
- "add a Cockcroft-Gault calculator"
- "the X calculator gives the wrong answer"
- "this calculator isn't showing up"
- "add a unit toggle to the BSA calculator"

## Read First
- The closest existing tool under `src/app/(site)/calculation-tools/(tools)/`. For a clinical
  bedside calculator, `bmi-calculator/page.tsx` is the cleanest reference.
- `src/app/(site)/calculation-tools/tool-index.ts` — the hub registry (`HUB_SUBJECTS`).

## Architecture Context

```
src/app/(site)/calculation-tools/
  page.tsx                     server page: hero, start-here card, app band
  HubCatalogue.tsx             client island: search, subject rail, the index
  tool-index.ts                ← THE REGISTRY: HUB_SUBJECTS[].tools[] = { name, slug, desc }
  (tools)/                     route group — adds no URL segment
    bmi-calculator/page.tsx    → /calculation-tools/bmi-calculator
    AnionGapCalculator/page.tsx→ /calculation-tools/AnionGapCalculator
```

**104 tool directories exist; `tool-index.ts` lists 98** (re-counted 2026-09-20 by parsing the
file; the "93" recorded here before that was stale — MEMORY gotcha 142). Six of the difference are deliberately linked
from `src/app/clinical/dose-calculators/page.tsx` instead (vancomycin-auc, tpn, renal-dosing-adjuster,
OpioidMMECalculator, reconstitution-calculator, GeriatricDosingCalculator). **Five are linked from
nowhere** — `AntagonismSimulator`, `EmaxModelCalculator`, `drug-half-life-calculator`,
`OsmolarGapCalculator`, `OpioidConversionCalculator` — a tracked roadmap item.

**Directory naming is inconsistent and that is the status quo**: some `kebab-case`, some
`PascalCase`. The directory name *is* the URL. Match the neighbouring tool rather than imposing a
convention; renaming breaks existing links.

**Most tools are one large self-contained `"use client"` file** (typically 1000–1900 lines) with
their own types, presets, calculation logic, and UI. **A shared kit now exists** in
`src/components/calculators/` (shell, fields, result card, `AdSlot`, lab-record layer), and every
new tool should use it. Older tools are migrated one at a time.

**`src/app/api/calculators.tsx` is a dead 419-line legacy registry with zero importers.** Editing
it changes nothing on screen.

## Procedure

### 1. Create the page
```
src/app/(site)/calculation-tools/(tools)/<tool-slug>/page.tsx
```
Start from the closest existing tool. The established structure, in order:
```tsx
"use client";
import React, { useState, useMemo, useCallback } from "react";
import { Calculator, /* … */ } from "lucide-react";

// ─── STRICT TYPES & INTERFACES ───────────────────────────────
export type SomeUnit = "mg" | "g";
export interface SomeCategory { label: string; risk: string; badgeColor: string; /* … */ }

// ─── CONSTANTS / PRESETS / REFERENCE RANGES ──────────────────
const PRESETS: PatientPreset[] = [ /* … */ ];

// ─── PURE CALCULATION ────────────────────────────────────────
// keep the maths separate from the JSX and memoised

export default function Page() {
  const [input, setInput] = useState("");
  const result = useMemo(() => compute(input), [input]);
  // inputs → result card → interpretation → formula/reference section
}
```
Existing tools commonly include: unit toggles, clinical presets, a copy-to-clipboard button, a
reset, a formula/reference disclosure, and an interpretation band with clinical significance.

### 2. Register it on the hub — one entry
In `src/app/(site)/calculation-tools/tool-index.ts`, inside the right subject's `tools` array:
```ts
{ name: "Cockcroft-Gault Calculator", slug: "cockcroft-gault-calculator", desc: "CrCl by Cockcroft–Gault from age, weight and SCr" },
```
Tools are nested in their subject, so a tool can no longer be registered without a category (the
old `allTools` + `categories[].toolNames` join is gone). `desc` is shown **and searched**: say what
the tool computes, from its code, in ≤ ~75 characters. Counts on the hub are derived — never type one.
The slug must be a real `(tools)/<slug>/page.tsx`; check with the `comm` recipe in `roadmap-status`.

Categories: `pharma-chem`, `unit-conversion`, `pharmaceutics`, biopharmaceutics/PK, pharmacology,
pharmaceutical analysis, `physiology`, microbiology, pharmaceutical engineering, clinical & hospital
pharmacy. A new subject on the web is just a new `HUB_SUBJECTS` entry (no icon — the hub is
typographic); the app needs `CATEGORY_ICONS` in `mobile/app/_components/ToolHub.tsx` (falls back to a
generic icon if missing).

**(c) Android catalogue:** add the slug to `TOOL_NAMES` and a `CATEGORIES[].slugs` in
`mobile/app/_data/tool-registry.ts` (optional `SHORT_NAME_OVERRIDES` for a long name). Forgetting
it is not fatal — the app shows unclaimed slugs under "More Tools" — but it lands uncategorised.

### 2b. Laboratory tools — build on the lab-record layer
For any tool whose output a student writes into a lab record (yield, recovery, counts, dilutions,
spectra), copy `(tools)/theoretical-yield-calculator/page.tsx`. The pattern:
- `CalculatorShell` with `aside` = `CalcAbout` + `<AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />`.
- `ModeSwitch` for modes; `NumberField` / `SelectField` / `TextField`; `LabNotice` for assumptions.
- Inputs are strings; parse with `toNumber` (rejects "12abc" and ""). Validate with
  `fieldError(raw, { show: submitted, allowZero?, required? })`.
- Results derive from inputs in `useMemo` (never copied into state). Build **one**
  `LabReportData` in `useMemo`: numbered sections Given data → formula → substitution → result;
  print given values **as typed**, computed values with `formatSig`/`formatFixed`.
- `LabActions` gives Calculate (sets `submitted`, scrolls to the card) / Reset / Copy / Download
  card / Print; extra buttons go in as children.
- Molecular weights: never infer. Offer `molarMassFromFormula` as a suggestion the student applies.
- Cross-tool hand-off: `calculatorHref(slug, params)` + `readQuery()` in `useEffect`.
- A chart in the card: pass `figure.svg` as self-contained SVG (see `MEMORY.md` gotcha 36).
- Big tools may split into underscore-prefixed siblings (`_math.ts`) in the same directory.

### 2c. Analytical practicals — calibration lines, replicates, regression, graphs
For a tool that turns absorbance readings into concentrations, averages replicates, fits a line or
plots a practical's graph, copy `(tools)/calibration-curve-calculator/` and build on
`@/components/calculators/lab-analysis` (see `.claude/PROJECT_MAP.md`). The pattern:
- Maths in a pure `_<tool>.ts` that imports `lab-analysis/math` + `format` directly (gotcha 69), so it
  can be hand-checked with `npx tsx`. Return `Checked<T>` — an explanation, never NaN/Infinity.
- `CalibrationFields` for Y = a + bX (one per page reads the hand-off link; gotcha 68). `DataTable` for
  rows (text inputs with a decimal keypad, so "0.2a" is caught), `CountStepper` for replicate count —
  every visible replicate is required. `numericError` for signed values (`fieldError` rejects negatives).
- Reproduce the method on the student's practical sheet exactly; an alternative method is a labelled
  `ModeSwitch` option, never a silent substitute (gotcha 67). Show every unit conversion as a step.
- Graphs: Recharts inside `ChartPanel` (ResponsiveContainer 100%/100% in a fixed-height box), colours from
  `CHART`, `makeTooltip`, `ChartLegend` for ≥ 2 series, `niceAxis`/`tickLabel` for axes. The same data
  goes to `chartSvg` for `LabReportData.figure`.
- On screen: `StatTiles` + `ResultTable` + graph + `StepBlock` per row (or `FormulaNote` + `ReportSteps`).
  Don't render the whole `LabReport` card — `LabActions` still gives Copy / PNG / Print from it.
- Verify: Node hand-checks against an independent computation (e.g. covariance for a regression), then
  CDP at 390 and 1440 (hydration, example, NaN/Infinity scan, overflow in `main`, tabs, Copy, Reset).

### 3. Clinical-only tools
If the tool belongs to the clinical sub-brand rather than the student catalogue, link it from
`src/app/clinical/dose-calculators/page.tsx` instead, and leave it out of `tool-index.ts`.

### 4. Medical safety
**Every tool already gets the "For educational purposes only" card** (`CalcDisclaimer`) — from
`(tools)/layout.tsx` on the web and `mobile/app/_components/MobileShell.tsx` in the APK. Do not add
it to the page, or it renders twice. Clinical dosing tools may additionally carry a data-source
disclaimer (`src/components/MedicalDisclaimerBanner.tsx`). Show the formula and the reference so
the number is checkable.

### 5. A scaling / formulation tool
Copy `(tools)/master-formula-calculator/`: maths in a pure underscore sibling (`_scale.ts`), dynamic
ingredient rows keyed by a `useRef` counter, a result that appears after the first Calculate and then
stays live, and a `FormulaNote` titled "Calculation Details" with one worked line per row. Never
multiply a concentration (`%`) or a `q.s.` row (`MEMORY.md` gotcha 54). Convert a batch quantity
only within its unit family.

### 5b. An image-analysis tool (photo in, measurement out)
Two exist (2026-09-16): the TLC Rf Analyzer (`src/components/calculators/tlc/`) and the Colony
Counter (`src/components/calculators/colony/`). Copy their split:
1. **Pure modules, no DOM, `import type` only** — maths (`rf.ts`, `cfu.ts`), geometry, the detector,
   a **synthetic-image generator with known ground truth** (`sample.ts`), and validation metrics.
   Test them with `node --test scripts/<tool>.test.mts` (see `testing-verification`).
2. **Everything stored in image pixels.** One stage component owns zoom/pan and converts pointers
   once with `screenToImage` against the stage's padding box (MEMORY gotcha 96). Rf/counts must not
   change with zoom — assert that in the browser test.
3. **Heavy work in a Web Worker** via `new Worker(new URL("./x.worker.ts", import.meta.url))`, with
   a main-thread fallback. Resize to a processing copy (TLC ≤ 650 k px, colonies ≤ 1600 px) and map
   results back.
4. **Detection is a suggestion.** Detected items start unconfirmed/removable; the result uses only
   what the student kept. Never show a fake confidence score for classical CV.
5. **Offline and private by construction:** no `fetch`, no API route, no CDN. A large library
   (OpenCV.js) goes in as a `new URL(…)` static asset (MEMORY gotcha 89). Say on screen that the
   image stays on the device.
6. **Inputs:** a gallery input with the explicit type list and a camera input with exactly
   `accept="image/*" capture="environment"` (gotcha 91). Hide Download/Print in the APK.
7. **Verify** with a generated PNG of the synthetic image through the real file input, in headless
   Chrome at 390 and 1440, with CPU throttling for timing, `window.Worker = undefined` for the
   fallback, and the airplane-mode check from `android-app-capacitor`.

### 6. Migrating an old tool onto the kit (Phase 2 — **COMPLETE 2026-09-20, 104/104**; kept as the procedure for any new legacy page)
Proven on ~60 tools on 2026-09-13. The goal is **easier to use, identical numbers**.
1. **Before numbers from the original.** First check whether HEAD *is* the original:
   `git diff 5dbe98c HEAD -- "src/app/(site)/calculation-tools/(tools)/<slug>/page.tsx"`. If that is
   empty, no session has touched the file and you can capture straight from the live page — this was
   true for all 17 tools finished on 2026-09-20 (MEMORY gotcha 132). Only if it differs do you need
   `git show "5dbe98c:<path>"` into `src/app/migration-before/<label>-<slug>/page.tsx` (outside
   `(site)`/`(tools)`), and you must **delete that directory immediately** (gotcha 76). Either way,
   drive 3–10 input sets (typical, another unit/mode, an edge) and record every displayed number.
   Prefer the tool's own presets as input sets: one click each, and they exercise the real bands.
   Where the output is a *chart* rather than a figure (`dose-response-curve-generator`), transcribe
   the original generator into a scratch `.mts`, import the extracted `_x.ts`, and deep-compare the
   arrays — 5,134 values compared, 0 differences, is a far stronger check than a screenshot.
2. **Rebuild the page on the kit**, result-first: `CalculatorShell` (eyebrow = hub category) with
   `aside` = `CalcAbout` + `AdSlot` last; `ModeSwitch` for methods; `ResultCard` with an `empty` hint;
   inputs in `CalcSection`/`FieldGrid` with units, hints and errors; example chips + Reset; a
   "Working" `ResultRow` list with the substitution; the old chart/table, responsive; `FormulaNote`;
   `CalcFaq`. Results live via `useMemo`; never render NaN/Infinity/-0. Remove `pt-20` wrappers, emoji
   headers, fake badges and any in-page disclaimer. Large tools: pure maths into `_math.ts`.
3. **The maths is copied, not corrected.** Same constants, rounding and bands. A formula that looks
   wrong goes into the tracker's "Suspected maths issues" list with evidence (gotcha 78). A stale value
   left on screen from earlier inputs is a render bug and may be fixed — say so.
4. **After numbers** from `/calculation-tools/<slug>` with the same inputs must match exactly; then
   1440×900 and 390×844 (0 exceptions, `scrollWidth === innerWidth`, read the 390 screenshot) and
   `npx tsc --noEmit | grep <slug>` empty. Parallel headless runs need `--remote-debugging-port=0` (gotcha 77).
5. Tick the tool's row in the tracker (only one session edits the tracker at a time).
Kit gaps met so far — build them locally in the page: tables (`overflow-x-auto`), chip radio groups
(`aria-pressed`), checkboxes, range/CI bars, two result tiles side by side. `ResultCard` doesn't wrap
long values and uppercases its label.

## Files Usually Involved
- `src/app/(site)/calculation-tools/(tools)/<slug>/page.tsx`
- `src/app/(site)/calculation-tools/tool-index.ts` ← the registry
- `src/app/clinical/dose-calculators/page.tsx` (clinical hub)
- `src/components/MedicalDisclaimerBanner.tsx`

## Security Checks
Calculators are client-side and touch no data store, so the surface is small:
- [ ] No API key, secret, or `NEXT_PUBLIC_*` credential in the page.
- [ ] No unvalidated user input passed to `dangerouslySetInnerHTML`.
- [ ] If the tool calls an API route, that route does its own auth and rate limiting.

## Validation
Input handling is the real risk in a calculator:
- [ ] Non-numeric input does not produce `NaN` on screen — guard and show a hint.
- [ ] Division by zero handled explicitly.
- [ ] Negative and zero values rejected where physically meaningless (weight, height, volume).
- [ ] Unit conversions applied **once** — double conversion is the classic bug here.
- [ ] Rounding stated and consistent; don't show 14 decimal places of clinical dose.
- [ ] Out-of-range values flagged rather than silently computed.

## Tests & Verification
```bash
npx tsc --noEmit
npm run dev
```
Then, in the browser:
1. `/calculation-tools` → the card appears **in its category** and in search.
2. Open it; enter a value with a **known correct answer** and confirm the output. Verify the
   arithmetic by hand — there are no tests to catch a wrong formula.
3. Toggle every unit and confirm the result changes correctly.
4. Enter empty, zero, negative, and non-numeric input.
5. Check light and dark mode, and a narrow viewport.

**No tests exist.** A calculator producing a confidently wrong clinical number is the worst failure
mode in this app — verify the maths by hand against a published example.

## Common Failure Modes
- **Adding the directory and expecting the card to appear.** Registry edit required.
- **A `slug` with no matching directory** → a 404 row on the hub. Only register a tool whose page renders.
- **Editing `src/app/api/calculators.tsx`** — dead code, no effect.
- **Renaming a tool directory** — breaks the URL and every existing link.
- **Double unit conversion.**
- **`NaN` rendered** because an empty input was parsed without a guard.
- **Adding `CalcDisclaimer` inside a page** — it is already mounted by the layout and the app shell.
- **Scaling a percentage ingredient** in a formula tool — 10% stays 10% at any batch size.
- **Rounding intermediate values** and accumulating error — round only for display.

## Do Not
- Do not build a shared calculator framework as a side effect of adding one tool. (Consolidation is
  a separate, tracked roadmap item.)
- Do not rename existing tool directories.
- Do not omit the formula and reference — students and pharmacists need to check the number.
- Do not ship a clinical dosing tool without a disclaimer.

## Update Project Knowledge
A new tool is routine — no doc update needed beyond the registry. **Do** update
`CLAUDE.md` §7 and `.claude/ROADMAP.md` if you change the registered-vs-existing tool counts, and
`.claude/PROJECT_MAP.md` if you add a genuinely new pattern (e.g. the first shared component).
