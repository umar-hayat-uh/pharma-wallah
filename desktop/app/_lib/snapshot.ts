"use client";

/**
 * Reads the calculation currently on screen, straight out of the DOM.
 *
 * WHY THIS SHAPE. The 104 calculators are the website's own components,
 * re-exported into this project one line at a time. Recording history "properly"
 * would mean every one of them calling a desktop-only hook — 104 edits to files
 * three build targets share, for a feature only one of them has. Instead the
 * desktop chrome reads what the calculator has already rendered, which works
 * for every tool that uses the shared kit without any of them knowing this
 * app exists.
 *
 * The kit gives four stable anchors, and they are the only things assumed here:
 *   h1                        — the calculator's name (CalculatorShell)
 *   labelled input / select   — the inputs (NumberField, SelectField)
 *   [aria-live="polite"]      — the result card (ResultCard)
 *   button[aria-controls]     — the "how this is calculated" panel (FormulaNote)
 *
 * A tool that renders its result some other way (the TLC photo analyzer, the
 * colony counter) simply yields no results, and the caller says so rather than
 * saving an empty record.
 */

export type Snapshot = {
  calculator: string;
  inputs: { label: string; value: string }[];
  results: { label: string; value: string }[];
  formula?: string;
};

/** Collapses runs of whitespace; `textContent` has no line structure to keep. */
function tidy(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

/** The visible label for a form control, however the kit happened to attach it. */
function labelFor(el: HTMLInputElement | HTMLSelectElement, root: HTMLElement): string {
  const aria = el.getAttribute("aria-label");
  if (aria) return tidy(aria);

  if (el.id) {
    // `useId()` produces ids containing ":" — invalid in a CSS selector unless
    // escaped, so match by attribute value rather than by `#id`.
    const explicit = root.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (explicit) return tidy(explicit.textContent);
  }

  const wrapping = el.closest("label");
  if (wrapping) return tidy(wrapping.textContent);

  // Last resort: the kit puts the Label immediately above the control's row.
  const previous = el.closest("div")?.parentElement?.querySelector("label");
  return tidy(previous?.textContent) || "Value";
}

/**
 * The unit shown beside a number field.
 *
 * NumberField renders either a static suffix `<span>` inside the relative
 * wrapper, or a `<select>` sibling whose aria-label ends in " unit".
 */
function unitFor(el: HTMLInputElement, root: HTMLElement): string {
  const wrapper = el.parentElement;
  const suffix = wrapper?.querySelector("span.pointer-events-none");
  if (suffix) return tidy(suffix.textContent);

  const label = labelFor(el, root);
  const selects = Array.from(root.querySelectorAll("select"));
  const unitSelect = selects.find((s) => s.getAttribute("aria-label") === `${label} unit`);
  if (unitSelect) {
    const option = unitSelect.selectedOptions[0];
    return tidy(option?.textContent);
  }
  return "";
}

function readInputs(root: HTMLElement): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const seen = new Set<string>();

  for (const el of Array.from(root.querySelectorAll<HTMLInputElement>("input"))) {
    if (el.type === "hidden" || el.type === "checkbox" || el.type === "radio") continue;
    if (el.disabled) continue;
    const value = el.value.trim();
    if (!value) continue;
    const label = labelFor(el, root);
    const unit = unitFor(el, root);
    const key = `${label}|${value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, value: unit ? `${value} ${unit}` : value });
  }

  for (const el of Array.from(root.querySelectorAll<HTMLSelectElement>("select"))) {
    if (el.disabled) continue;
    const aria = el.getAttribute("aria-label") ?? "";
    // Unit pickers are already folded into their number field above.
    if (aria.endsWith(" unit")) continue;
    const label = labelFor(el, root);
    const value = tidy(el.selectedOptions[0]?.textContent);
    if (!value) continue;
    const key = `${label}|${value}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, value });
  }

  return out;
}

/**
 * ResultCard's rendered text, as lines: label, value, then unit and
 * interpretation. The empty state writes an em dash where the value goes —
 * that is how "no result yet" is told apart from a result.
 */
function readResults(root: HTMLElement): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];

  for (const node of Array.from(root.querySelectorAll<HTMLElement>('[aria-live="polite"]'))) {
    const lines = (node.innerText ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length < 2) continue; // LabReport's one-line status strip.

    const [label, value, ...rest] = lines;
    if (value === "—" || value === "-") continue; // the kit's "nothing yet" state
    const detail = rest.join(" · ");
    out.push({ label, value: detail ? `${value} — ${detail}` : value });
  }

  return out;
}

/** The FormulaNote panel's text, whether it is open or closed. */
function readFormula(root: HTMLElement): string | undefined {
  for (const button of Array.from(root.querySelectorAll<HTMLElement>("button[aria-controls]"))) {
    if (!/calculated|formula/i.test(button.textContent ?? "")) continue;
    const id = button.getAttribute("aria-controls");
    if (!id) continue;
    const panel = root.querySelector(`[id="${CSS.escape(id)}"]`);
    // `textContent`, not `innerText`: Collapse keeps the panel in the DOM but
    // sets visibility:hidden when closed, and innerText returns "" for that.
    const text = tidy(panel?.textContent);
    if (text) return text.length > 600 ? `${text.slice(0, 600)}…` : text;
  }
  return undefined;
}

/**
 * Snapshots the calculator inside `root` (the content pane).
 * Returns null when there is no calculator there at all.
 */
export function snapshotCalculator(root: HTMLElement | null): Snapshot | null {
  if (!root) return null;
  const heading = root.querySelector("h1");
  if (!heading) return null;

  return {
    calculator: tidy(heading.textContent) || "Calculator",
    inputs: readInputs(root),
    results: readResults(root),
    formula: readFormula(root),
  };
}
