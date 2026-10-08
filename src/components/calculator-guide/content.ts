/**
 * The words of the "How to use PharmaWallah Calculators" guide, as data.
 *
 * Kept apart from the layout so a new section, rule or error can be added
 * without touching JSX, and so the website and the app read one copy.
 *
 * Every statement here was checked against the calculators themselves
 * (2026-10-08, 106 tool pages), because a guide that promises a button the
 * screen doesn't have is worse than no guide:
 *   - Results update as you type on nearly every tool. Only the lab-practical
 *     tools (the ones with a lab-record card, `LabActions`) have a Calculate
 *     button, and on those it reveals the errors or the finished card.
 *   - Reset exists on 103 of 106 tools.
 *   - "How this is calculated" (FormulaNote) is on every tool, closed by default.
 *   - Unit dropdowns on ~35 tools, graphs on ~35, "Try an example" on ~48,
 *     mode tabs (ModeSwitch) on ~53, "(optional)" in a label on ~21.
 *   - There is no required-field asterisk. A tool says what it still needs in
 *     its empty result card instead (84 tools).
 * Re-check these before changing the copy.
 */

/** Where the guide is being shown. The two differ only in navigation. */
export type GuidePlatform = "web" | "app";

export type GuideCategory = { id: string; label: string; href: string };

export type GuideFacts = {
  platform: GuidePlatform;
  /** Counted by the caller from its own registry, never typed here. */
  toolCount: number;
  /** The real categories, in the order the caller shows them. */
  categories: GuideCategory[];
  /** Where "Start calculating" goes: the hub on the web, home in the app. */
  hubHref: string;
};

// ─── SECTION INDEX ──────────────────────────────────────────────────────────

export const SECTIONS = [
  { id: "before-you-start", label: "Before you start" },
  { id: "choose", label: "1 · Choose a calculator" },
  { id: "screen", label: "2 · The calculator screen" },
  { id: "enter", label: "3 · Enter your values" },
  { id: "units", label: "4 · Units" },
  { id: "inputs", label: "5 · Required and optional" },
  { id: "calculate", label: "6 · Getting the result" },
  { id: "result", label: "7 · Read the result" },
  { id: "formula", label: "8 · The formula" },
  { id: "tables", label: "9 · Tables" },
  { id: "graphs", label: "10 · Graphs" },
  { id: "reset", label: "11 · Reset" },
  { id: "errors", label: "12 · Common errors" },
  { id: "website", label: "On the website" },
  { id: "app", label: "On the app" },
  { id: "lab-workflow", label: "Lab workflow" },
  { id: "verify", label: "Verify your result" },
  { id: "quick-start", label: "Quick start" },
] as const;

// ─── BEFORE YOU START ───────────────────────────────────────────────────────

export const HAVE_READY = [
  "Your experimental or observed values",
  "The unit each value was recorded in",
  "Any constants your manual gives you",
  "Sample or drug details, if the calculation needs them",
  "Instrument readings, if you took any",
  "How many decimal places or significant figures are expected",
];

export const CHECKLIST = [
  "Check the practical or the question",
  "Identify every value it needs",
  "Confirm each unit",
  "Enter the values carefully",
  "Read the result",
  "Verify it before you use it",
];

// ─── ENTER YOUR VALUES ──────────────────────────────────────────────────────

export type InputRule = { title: string; body: string; good?: string; bad?: string };

export const INPUT_RULES: InputRule[] = [
  {
    title: "Numbers only in number boxes",
    body: "The unit is shown beside the box or chosen from its dropdown, so type the number alone.",
    good: "25",
    bad: "25 mg",
  },
  {
    title: "Pick the unit you recorded",
    body: "If a box has a unit dropdown, choose the unit your value was measured in. The calculator converts for you.",
    good: "500 + mg",
  },
  {
    title: "Don't mix units yourself",
    body: "Where a box has a fixed unit and no dropdown, convert your value to that unit before typing it.",
    bad: "2 L in a box labelled mL",
  },
  {
    title: "Check the decimal point",
    body: "0.5, 5 and 50 differ tenfold each. One slipped point changes the answer by the same amount.",
    good: "0.5 ≠ 5 ≠ 50",
  },
  {
    title: "Keep your raw values",
    body: "Enter what you observed. Only transform a value (average it, convert it) when your practical tells you to.",
  },
];

// ─── REQUIRED / OPTIONAL ────────────────────────────────────────────────────

/**
 * The real signals a calculator gives, in place of the coloured dots a generic
 * guide would invent: there is no required-field marker in this product.
 */
export const FIELD_SIGNALS = [
  {
    kind: "needed" as const,
    title: "Needed",
    body: "Most boxes are needed. Until they are filled, the result card stays empty and says which values it is waiting for.",
    sample: "Initial concentration",
  },
  {
    kind: "optional" as const,
    title: "Optional",
    body: "Some labels end in “(optional)”. Leave them blank and the calculator still works. Fill them in to get an extra result or a more precise one.",
    sample: "Temperature (optional)",
  },
  {
    kind: "calculated" as const,
    title: "Calculated for you",
    body: "Intermediate values, such as a converted unit or a percentage for each row, are worked out and shown. You don't type them.",
    sample: "Rate constant",
  },
];

// ─── COMMON ERRORS ──────────────────────────────────────────────────────────

export type GuideError = { problem: string; fix: string; checks?: string[] };

export const COMMON_ERRORS: GuideError[] = [
  {
    problem: "The result card stays empty",
    fix: "A value it needs is still blank. The empty card says which ones.",
  },
  {
    problem: "A box turns red",
    fix: "The value isn't allowed there, for example a zero you divide by, or a negative mass. Read the message under the box.",
  },
  {
    problem: "The number looks wrong",
    fix: "Usually it's a unit. Check the dropdown matches what you recorded.",
    checks: ["Input values", "Units", "Decimal points", "The formula", "Any conversion the practical expects"],
  },
  {
    problem: "The graph looks odd",
    fix: "Look at the table that feeds it.",
    checks: ["Rows in the right order", "No missing observation", "X and Y values not swapped", "Units"],
  },
  {
    problem: "You're on the wrong mode",
    fix: "Many calculators have tabs at the top that change what is worked out. Check the right one is selected.",
  },
];

// ─── RULES AND WORKFLOWS ────────────────────────────────────────────────────

export const GOLDEN_RULES = [
  "Read the practical or question first.",
  "Identify every variable it needs.",
  "Use the correct units.",
  "Enter values carefully.",
  "Check the formula and working.",
  "Review the result and its unit.",
  "Record your final answer clearly.",
];

export const GOLDEN_FLOW = ["Read", "Prepare", "Enter", "Calculate", "Check", "Record"];

export const LAB_WORKFLOW = [
  { title: "Experiment", body: "Perform the practical." },
  { title: "Record observations", body: "Write readings down as you take them, with units." },
  { title: "Organise the data", body: "One row per time point, sample or replicate." },
  { title: "Open the calculator", body: "The one that matches your practical." },
  { title: "Enter values and units", body: "Exactly as recorded." },
  { title: "Read the result", body: "Value, unit and interpretation." },
  { title: "Review the formula", body: "Open “How this is calculated”." },
  { title: "Check the graph and table", body: "Where the calculator draws them." },
  { title: "Record in your practical", body: "Your answer, its unit and the working." },
];

export const FOLLOW_SOURCES = [
  "Your practical manual",
  "Your course instructions",
  "Your instructor's requirements",
  "Laboratory SOPs",
  "Your institution's guidelines",
];

export const QUICK_START = [
  "Choose your calculator",
  "Read what it calculates",
  "Gather your values",
  "Enter the values",
  "Select the correct units",
  "Watch the result appear, or press Calculate",
  "Review the result and its unit",
  "Check the formula and your data",
  "Record your answer",
];

// ─── WEBSITE VS APP ─────────────────────────────────────────────────────────

/**
 * Only what each surface really has (checked 2026-10-08). The calculators are
 * the same files on both, so everything inside a calculator is identical; the
 * differences are all in the surroundings. Change a row only after checking
 * `LabReport.tsx`, `MobileShell.tsx` and `ToolHub.tsx`.
 */
export const COMPARISON: { feature: string; web: string; app: string }[] = [
  { feature: "Every calculator", web: "✓", app: "✓" },
  { feature: "Search", web: "✓", app: "✓" },
  { feature: "Inputs, units, results, tables, graphs", web: "✓", app: "✓ (same calculators)" },
  { feature: "Formula and working", web: "✓", app: "✓" },
  { feature: "Reset", web: "✓", app: "✓" },
  { feature: "Copy a lab-record result", web: "✓", app: "✓" },
  { feature: "Download or print the lab-record card", web: "✓", app: "Share instead" },
  { feature: "Works with no internet", web: "—", app: "✓" },
  { feature: "Saved and recent calculators", web: "—", app: "✓" },
  { feature: "Account needed", web: "No", app: "No" },
];
