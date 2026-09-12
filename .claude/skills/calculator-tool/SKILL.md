# Calculator Tool

## Purpose
Add or modify one of the 89 pharmacy calculation tools, and make sure it is actually reachable from
the hub.

## Trigger Examples
- "add a Cockcroft-Gault calculator"
- "the X calculator gives the wrong answer"
- "this calculator isn't showing up"
- "add a unit toggle to the BSA calculator"

## Read First
- The closest existing tool under `src/app/(site)/calculation-tools/(tools)/`. For a clinical
  bedside calculator, `bmi-calculator/page.tsx` is the cleanest reference.
- `src/app/(site)/calculation-tools/CalculationToolsClient.tsx` — the hub registry.

## Architecture Context

```
src/app/(site)/calculation-tools/
  page.tsx                     server page, metadata only
  CalculationToolsClient.tsx   ← THE REGISTRY: allTools[] + categories[]
  (tools)/                     route group — adds no URL segment
    bmi-calculator/page.tsx    → /calculation-tools/bmi-calculator
    AnionGapCalculator/page.tsx→ /calculation-tools/AnionGapCalculator
```

**89 tool directories exist; `allTools` lists 84.** Six of the difference are deliberately linked
from `src/app/clinical/dose-calculators/page.tsx` instead (vancomycin-auc, tpn, renal-dosing-adjuster,
OpioidMMECalculator, reconstitution-calculator, GeriatricDosingCalculator). **Two are linked from
nowhere** — `OsmolarGapCalculator` and `OpioidConversionCalculator` — a tracked roadmap item.

**Directory naming is inconsistent and that is the status quo**: some `kebab-case`, some
`PascalCase`. The directory name *is* the URL. Match the neighbouring tool rather than imposing a
convention; renaming breaks existing links.

**Each tool is one large self-contained `"use client"` file** (typically 1000–1900 lines) with its
own types, presets, calculation logic, and UI. There is **no shared calculator layout or shared
input component**. Copying the nearest tool is the actual convention, not laziness.

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

### 2. Register it on the hub — **two edits, both required**
In `src/app/(site)/calculation-tools/CalculationToolsClient.tsx`:
```ts
// (a) add to allTools, under the right category comment block
{ name: "Cockcroft-Gault Calculator", link: "/calculation-tools/cockcroft-gault-calculator" },

// (b) add the SAME name string to the matching categories[].toolNames array
```
**Both are mandatory.** `allTools` alone makes it searchable but it renders in no category.
The name strings must match **exactly** — they are the join key.

Categories: `pharma-chem`, `unit-conversion`, `pharmaceutics`, biopharmaceutics/PK, pharmacology,
pharmaceutical analysis, microbiology, pharmaceutical engineering, clinical & hospital pharmacy.

### 3. Clinical-only tools
If the tool belongs to the clinical sub-brand rather than the student catalogue, link it from
`src/app/clinical/dose-calculators/page.tsx` instead, and leave it out of `allTools`.

### 4. Medical safety
Clinical dosing tools must carry a disclaimer. `src/components/MedicalDisclaimerBanner.tsx` exists
for this. Show the formula and the reference so the number is checkable.

## Files Usually Involved
- `src/app/(site)/calculation-tools/(tools)/<slug>/page.tsx`
- `src/app/(site)/calculation-tools/CalculationToolsClient.tsx` ← the registry
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
- **Adding to `allTools` but not to a `categories[].toolNames`** → invisible in every category.
- **Name-string mismatch between the two arrays** → same result.
- **Editing `src/app/api/calculators.tsx`** — dead code, no effect.
- **Renaming a tool directory** — breaks the URL and every existing link.
- **Double unit conversion.**
- **`NaN` rendered** because an empty input was parsed without a guard.
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
