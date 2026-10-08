"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  CircleAlert,
  Globe,
  RefreshCw,
  Search,
  Star,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND_SURFACE } from "@/components/page-kit/brand";
import type { GuideCategory } from "./content";

/*
 * Generic sketches of a calculator, not screenshots of one.
 *
 * They borrow the real kit's shapes (the dashed empty result card, the brand
 * result face, the "How this is calculated" disclosure) so a student recognises
 * them on a real tool, but every label is a placeholder — "Input value",
 * "Result" — so nothing here can be taken for a specific calculator's output.
 * Each one is a single `role="img"` with a description; the parts inside are
 * hidden from screen readers so they don't read out as working controls.
 */

// ─── SHARED PIECES ──────────────────────────────────────────────────────────

const reveal = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
} as const;

/** The paper every illustration sits on. */
export function Sketch({
  label,
  children,
  className,
}: {
  /** What the picture shows, for screen readers. */
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure
      role="img"
      aria-label={label}
      className={cn(
        "pw-guide-paper relative overflow-hidden rounded-2xl border border-border/80 p-4 sm:p-5",
        className,
      )}
    >
      <div aria-hidden="true">{children}</div>
    </figure>
  );
}

/** A non-interactive look-alike of the kit's NumberField. */
export function MockField({
  label,
  value,
  unit,
  unitSelect,
  state = "normal",
  message,
  typing,
}: {
  label: string;
  value?: string;
  unit?: string;
  /** Draw the unit as a dropdown rather than a fixed suffix. */
  unitSelect?: boolean;
  state?: "normal" | "focus" | "error";
  message?: string;
  /** Show a blinking caret after the value. */
  typing?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[12.5px] font-medium text-foreground/85">{label}</p>
      <div className="flex gap-2">
        <div
          className={cn(
            "flex h-10 flex-1 items-center rounded-lg border bg-card px-3 text-[15px] font-medium text-foreground",
            state === "focus" && "border-primary ring-2 ring-primary/15",
            state === "error" && "border-red-500 ring-2 ring-red-500/15",
            state === "normal" && "border-border",
          )}
        >
          {value ? <span>{value}</span> : <span className="text-muted-foreground/70">Enter value</span>}
          {typing && <span className="pw-guide-caret ml-0.5 h-5 w-[2px] bg-primary" />}
          {unit && !unitSelect && <span className="ml-auto text-sm text-muted-foreground">{unit}</span>}
        </div>
        {unit && unitSelect && (
          <div className="flex h-10 min-w-[5.5rem] items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground">
            {unit}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      {message && (
        <p className={cn("text-xs", state === "error" ? "text-red-600" : "text-muted-foreground")}>{message}</p>
      )}
    </div>
  );
}

/** The brand result face, generic. */
export function MockResult({
  value = "12.45",
  unit = "mg/mL",
  label = "Result",
  interpretation = "What the number means, in words",
  compact,
}: {
  value?: string;
  unit?: string;
  label?: string;
  interpretation?: string;
  compact?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl text-white" style={{ background: BRAND_SURFACE }}>
      <span className="absolute inset-x-0 top-0 h-1 bg-white/60" />
      <div className={cn("px-5", compact ? "py-4" : "py-5")}>
        <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/85">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {label}
        </p>
        <p className={cn("mt-2 font-bold tracking-[-0.03em]", compact ? "text-3xl" : "text-4xl")}>
          {value}
          <span className="ml-2 text-base font-semibold text-white/85">{unit}</span>
        </p>
        {interpretation && (
          <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-medium">{interpretation}</span>
        )}
      </div>
    </div>
  );
}

/** The dashed card a calculator shows before it has enough input. */
export function MockEmptyResult({ text = "Enter the values above to see the result." }: { text?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-5 text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function MockFormulaBar({ open }: { open?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="h-4 w-4" />
        </span>
        <span className="flex-1 text-sm font-semibold text-foreground">How this is calculated</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground", open && "rotate-180")} />
      </div>
      {open && (
        <div className="border-t border-border/70 px-4 py-3 font-mono text-sm text-foreground">Result = A × B ÷ C</div>
      )}
    </div>
  );
}

function MockButton({
  children,
  icon: Icon,
  primary,
  pressed,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
  primary?: boolean;
  pressed?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold",
        primary ? "bg-primary text-white" : "border border-border bg-card text-foreground",
        pressed && "pw-guide-press",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </span>
  );
}

/** A numbered marker used by the annotated screen and its legend. */
export function Callout({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={cn(
        "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-[11px] font-bold text-white shadow-[0_0_0_3px_rgba(255,255,255,.95)]",
        className,
      )}
    >
      {n}
    </span>
  );
}

// ─── FLOWS ──────────────────────────────────────────────────────────────────

/**
 * A row of steps joined by arrows. It wraps instead of scrolling, so a long
 * flow on a phone becomes two or three short lines rather than overflowing.
 */
export function FlowStrip({
  steps,
  label,
  tone = "light",
}: {
  steps: { label: string; icon?: LucideIcon }[];
  label: string;
  tone?: "light" | "brand";
}) {
  return (
    <div role="img" aria-label={label}>
      <ol aria-hidden="true" className="flex flex-wrap items-center gap-x-1.5 gap-y-2 sm:gap-x-2">
        {steps.map(({ label: step, icon: Icon }, i) => (
          <Fragment key={step}>
            <motion.li
              {...reveal}
              transition={{ ...reveal.transition, delay: i * 0.08 }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold sm:px-3.5 sm:py-2.5 sm:text-sm",
                tone === "brand"
                  ? "bg-white/15 text-white ring-1 ring-inset ring-white/25"
                  : "border border-border/80 bg-card text-foreground shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
              )}
            >
              {Icon ? (
                <Icon className={cn("h-4 w-4", tone === "brand" ? "text-white" : "text-primary")} />
              ) : (
                <span className={cn("font-mono text-[11px]", tone === "brand" ? "text-white/75" : "text-primary")}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
              {step}
            </motion.li>
            {i < steps.length - 1 && (
              <li className={cn(tone === "brand" ? "text-white/70" : "text-primary/60")}>
                <ArrowRight className="h-4 w-4" />
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </div>
  );
}

// ─── STEP 1: CHOOSE ─────────────────────────────────────────────────────────

export function ChooseSketch({ categories }: { categories: GuideCategory[] }) {
  return (
    <Sketch label="A search box above a row of calculator categories, with one category selected.">
      <div className="flex h-11 items-center gap-2.5 rounded-xl border border-primary bg-card px-3.5 ring-2 ring-primary/15">
        <Search className="h-4 w-4 text-primary" />
        <span className="text-[15px] text-foreground">dilution</span>
        <span className="pw-guide-caret h-5 w-[2px] bg-primary" />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {categories.slice(0, 8).map((c, i) => (
          <span
            key={c.id}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              i === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground",
            )}
          >
            {c.label}
          </span>
        ))}
      </div>
      <div className="mt-3 grid gap-2">
        {["Calculator name", "Another calculator"].map((name, i) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-3.5 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
              <Calculator className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">One line on what it works out</p>
            </div>
            {i === 0 && <ArrowRight className="h-4 w-4 text-primary" />}
          </div>
        ))}
      </div>
    </Sketch>
  );
}

// ─── STEP 2: THE SCREEN ─────────────────────────────────────────────────────

export const ANATOMY = [
  { n: 1, title: "Title", body: "The calculator's name and its subject." },
  { n: 2, title: "What it calculates", body: "One or two lines under the title. Read this first." },
  { n: 3, title: "Mode tabs", body: "On some calculators. Each tab works out something different." },
  { n: 4, title: "Try an example", body: "On many calculators. Fills in sample values so you can see how it works." },
  { n: 5, title: "Input boxes", body: "Where your values go. Hints sit under some boxes." },
  { n: 6, title: "Units", body: "Fixed beside the box, or a dropdown you choose from." },
  { n: 7, title: "Result", body: "The answer, its unit and what it means." },
  { n: 8, title: "Calculate and Reset", body: "Reset is on almost every calculator. Calculate only appears on lab-practical tools." },
  { n: 9, title: "Table and graph", body: "On calculators that take several readings." },
  { n: 10, title: "How this is calculated", body: "The formula and the working. Closed until you open it." },
  { n: 11, title: "Notes and warnings", body: "Limits of the method, and the educational-use notice." },
];

/**
 * A whole generic calculator with numbered markers. On a phone the markers sit
 * at the left edge of each part, so nothing overlaps the content.
 */
export function AnatomySketch() {
  return (
    <Sketch label="An annotated sketch of a calculator screen with eleven numbered parts: title, description, mode tabs, example button, input boxes, units, result, calculate and reset buttons, table and graph, the formula panel, and notes.">
      <div className="space-y-3.5">
        <Row n={1}>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Subject</p>
          <p className="text-xl font-bold tracking-[-0.02em] text-foreground">Calculator title</p>
        </Row>
        <Row n={2}>
          <p className="text-sm text-muted-foreground">A short line saying what this calculator works out.</p>
        </Row>
        <Row n={3}>
          <div className="inline-flex rounded-xl bg-muted p-1 text-xs font-semibold">
            <span className="rounded-lg bg-card px-3 py-1.5 text-foreground shadow-sm">Mode A</span>
            <span className="px-3 py-1.5 text-muted-foreground">Mode B</span>
          </div>
        </Row>
        <Row n={4}>
          <span className="inline-flex rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            Try an example
          </span>
        </Row>
        <div className="rounded-xl border border-border/80 bg-card p-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Row n={5}>
              <MockField label="Input value" value="25" unit="mL" />
            </Row>
            <Row n={6}>
              <MockField label="Another value" value="500" unit="mg" unitSelect />
            </Row>
          </div>
        </div>
        <Row n={7}>
          <MockResult compact />
        </Row>
        <Row n={8}>
          <div className="flex flex-wrap gap-2">
            <MockButton icon={Calculator} primary>
              Calculate
            </MockButton>
            <MockButton icon={RefreshCw}>Reset</MockButton>
          </div>
        </Row>
        <Row n={9}>
          <div className="grid grid-cols-[1fr_1.2fr] gap-2">
            <div className="space-y-1 rounded-lg border border-border/80 bg-card p-2">
              {[0, 1, 2].map((r) => (
                <div key={r} className="h-2.5 rounded bg-muted" />
              ))}
            </div>
            <svg viewBox="0 0 100 44" className="h-full w-full rounded-lg border border-border/80 bg-card">
              <path d="M8 36 L30 28 L52 22 L74 14 L94 8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
            </svg>
          </div>
        </Row>
        <Row n={10}>
          <MockFormulaBar />
        </Row>
        <Row n={11}>
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Notes, limits and the educational-use notice.
          </p>
        </Row>
      </div>
    </Sketch>
  );
}

function Row({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <Callout n={n} className="mt-0.5" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** The tour's smaller version of AnatomySketch: four parts, in reading order. */
export function MiniScreenSketch() {
  return (
    <Sketch label="A simplified calculator screen with four numbered parts: the title and description, an input box with its unit, the result, and the How this is calculated panel.">
      <div className="space-y-3">
        <Row n={1}>
          <p className="text-lg font-bold tracking-[-0.02em] text-foreground">Calculator title</p>
          <p className="text-xs text-muted-foreground">What this calculator works out.</p>
        </Row>
        <Row n={2}>
          <MockField label="Input value" value="500" unit="mg" unitSelect />
        </Row>
        <Row n={3}>
          <MockResult compact interpretation="" />
        </Row>
        <Row n={4}>
          <MockFormulaBar />
        </Row>
      </div>
    </Sketch>
  );
}

// ─── STEP 3–5: INPUTS ───────────────────────────────────────────────────────

export function RawToInputSketch() {
  return (
    <Sketch label="A value written in a lab notebook, its unit identified, then typed into a calculator box with that unit selected.">
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1.3fr]">
        <div className="rounded-xl border border-border/80 bg-[#fffdf5] p-3 font-mono text-sm text-foreground">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Notebook</p>
          <p className="mt-1">Reading 1 = 500 mg</p>
        </div>
        <ArrowRight className="mx-auto hidden h-4 w-4 text-primary/60 sm:block" />
        <div className="rounded-xl border border-border/80 bg-card p-3 text-sm">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground">Unit</p>
          <p className="mt-1 font-semibold text-foreground">mg</p>
        </div>
        <ArrowRight className="mx-auto hidden h-4 w-4 text-primary/60 sm:block" />
        <MockField label="Input value" value="500" unit="mg" unitSelect state="focus" />
      </div>
    </Sketch>
  );
}

export function UnitDropdownSketch() {
  const units = ["mg/mL", "g/L", "µg/mL", "%"];
  return (
    <Sketch label="A concentration box containing 5, with its unit dropdown open showing mg per mL, g per L, microgram per mL and percent; mg per mL is ticked.">
      <MockField label="Concentration" value="5" unit="mg/mL" unitSelect />
      <motion.div
        {...reveal}
        className="ml-auto mt-1.5 w-44 overflow-hidden rounded-xl border border-border bg-card shadow-[0_12px_30px_-14px_rgba(15,23,42,.35)]"
      >
        {units.map((u, i) => (
          <div
            key={u}
            className={cn(
              "flex items-center justify-between px-3.5 py-2 text-sm",
              i === 0 ? "bg-primary/10 font-semibold text-primary" : "text-foreground",
            )}
          >
            {u}
            {i === 0 && <Check className="h-4 w-4" />}
          </div>
        ))}
      </motion.div>
    </Sketch>
  );
}

export function FieldKindsSketch() {
  return (
    <Sketch label="Three kinds of box: a needed value, a value labelled optional, and a calculated value shown in grey that you do not type.">
      <div className="space-y-3">
        <MockField label="Initial concentration" value="" message="Needed: the result waits for this." />
        <MockField label="Temperature (optional)" value="" message="Leave blank if you don't have it." />
        <div className="space-y-1.5">
          <p className="text-[12.5px] font-medium text-foreground/85">Rate constant</p>
          <div className="flex h-10 items-center rounded-lg bg-muted px-3 text-[15px] font-semibold text-foreground">
            0.0213
            <span className="ml-auto text-xs font-medium text-muted-foreground">calculated</span>
          </div>
        </div>
      </div>
    </Sketch>
  );
}

// ─── STEP 6: CALCULATE ──────────────────────────────────────────────────────

export function CalculateSketch() {
  return (
    <Sketch label="Two ways a result appears. Left: on most calculators the result card fills in as you type. Right: on lab-practical calculators you press Calculate and the result card appears below.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2.5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary">Most calculators · live</p>
          <MockField label="Input value" value="2.5" typing state="focus" />
          <MockResult compact value="5.00" interpretation="" label="Updates as you type" />
        </div>
        <div className="space-y-2.5">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-emerald-700">Lab-practical tools · button</p>
          <div className="flex gap-2">
            <MockButton icon={Calculator} primary pressed>
              Calculate
            </MockButton>
            <MockButton icon={RefreshCw}>Reset</MockButton>
          </div>
          <MockResult compact interpretation="" label="Appears after Calculate" />
        </div>
      </div>
    </Sketch>
  );
}

export function ErrorFieldSketch() {
  return (
    <Sketch label="An input box outlined in red with the message: must be greater than zero.">
      <MockField label="Volume" value="0" unit="mL" state="error" message="Must be greater than 0." />
    </Sketch>
  );
}

// ─── STEP 7: RESULT ─────────────────────────────────────────────────────────

export function ResultSketch() {
  return (
    <Sketch label="A result card showing 12.45 milligrams per millilitre with a line explaining what the number means, and the four things to check marked beside it.">
      <div className="grid gap-4 sm:grid-cols-[1.2fr_1fr] sm:items-center">
        <MockResult />
        <ul className="grid gap-2 text-sm">
          {["The number", "Its unit", "Decimal places", "Does it make sense?"].map((t) => (
            <li key={t} className="flex items-center gap-2 text-foreground">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                <Check className="h-3 w-3" />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Sketch>
  );
}

// ─── STEP 8: FORMULA ────────────────────────────────────────────────────────

export function FormulaSketch() {
  const vars = [
    { s: "A", d: "your first input" },
    { s: "B", d: "your second input" },
    { s: "C", d: "your third input" },
  ];
  return (
    <Sketch label="The How this is calculated panel opened, showing Result equals A times B divided by C, with each letter matched to an input.">
      <MockFormulaBar open />
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {vars.map(({ s, d }) => (
          <div key={s} className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-card px-3 py-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
              {s}
            </span>
            <span className="text-xs text-muted-foreground">= {d}</span>
          </div>
        ))}
      </div>
    </Sketch>
  );
}

// ─── STEP 9: TABLE ──────────────────────────────────────────────────────────

export function TableSketch() {
  const rows = [
    ["0", "0.850", "100%"],
    ["10", "0.790", "93%"],
    ["20", "0.730", "86%"],
  ];
  return (
    <Sketch label="A three-row table with columns Time, Reading and Calculated value. The calculated column is filled in by the calculator.">
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card">
        <div className="grid grid-cols-3 bg-muted/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span>Time</span>
          <span>Reading</span>
          <span>Calculated</span>
        </div>
        {rows.map((r, i) => (
          <motion.div
            key={r[0]}
            {...reveal}
            transition={{ ...reveal.transition, delay: 0.1 + i * 0.12 }}
            className="grid grid-cols-3 border-t border-border/70 px-3 py-2 font-mono text-sm text-foreground"
          >
            <span>{r[0]}</span>
            <span>{r[1]}</span>
            <span className="font-semibold text-primary">{r[2]}</span>
          </motion.div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">You fill the first two columns. The calculator fills the last.</p>
    </Sketch>
  );
}

// ─── STEP 10: GRAPH ─────────────────────────────────────────────────────────

/** Axes, points and a fitted line that draws itself once, on scroll. */
export function GraphSketch() {
  const pts = [
    [40, 150],
    [80, 128],
    [120, 112],
    [160, 88],
    [200, 70],
    [240, 46],
  ];
  return (
    <Sketch label="A graph with the independent variable on the x-axis and the dependent variable on the y-axis, six data points, a fitted straight line, and its equation and R squared value.">
      <svg viewBox="0 0 280 200" className="h-auto w-full" fontFamily="inherit">
        <line x1="30" y1="170" x2="268" y2="170" stroke="currentColor" className="text-border" strokeWidth="1.5" />
        <line x1="30" y1="170" x2="30" y2="14" stroke="currentColor" className="text-border" strokeWidth="1.5" />
        <text x="149" y="192" textAnchor="middle" fontSize="10" className="fill-muted-foreground">
          X-axis · independent variable (unit)
        </text>
        <text x="12" y="92" textAnchor="middle" fontSize="10" transform="rotate(-90 12 92)" className="fill-muted-foreground">
          Y-axis · dependent (unit)
        </text>
        <motion.path
          d="M36 158 L256 38"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="5 4"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
        {pts.map(([x, y], i) => (
          <motion.circle
            key={x}
            cx={x}
            cy={y}
            r="4.5"
            className="fill-emerald-500"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.3 }}
          />
        ))}
        <rect x="40" y="14" width="124" height="36" rx="8" className="fill-card" stroke="currentColor" strokeOpacity="0.15" />
        <text x="50" y="29" fontSize="10" className="fill-foreground" fontFamily="monospace">
          y = mx + c
        </text>
        <text x="50" y="43" fontSize="10" className="fill-foreground" fontFamily="monospace">
          R² = how well it fits
        </text>
      </svg>
    </Sketch>
  );
}

// ─── STEP 11: RESET ─────────────────────────────────────────────────────────

export function ResetSketch() {
  return (
    <Sketch label="Before and after pressing Reset: filled boxes and a result become empty boxes and an empty result card.">
      <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-2">
          <MockField label="Input value" value="25" />
          <MockResult compact value="12.45" interpretation="" />
        </div>
        <div className="flex justify-center">
          <MockButton icon={RefreshCw} pressed>
            Reset
          </MockButton>
        </div>
        <div className="space-y-2">
          <MockField label="Input value" />
          <MockEmptyResult />
        </div>
      </div>
    </Sketch>
  );
}

// ─── PLATFORMS ──────────────────────────────────────────────────────────────

export function BrowserSketch() {
  return (
    <Sketch label="A browser window showing the calculators page with a search box, then a selected calculator with input boxes and a result.">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_18px_40px_-28px_rgba(15,23,42,.5)]">
        <div className="flex items-center gap-2 border-b border-border/70 bg-muted/60 px-3 py-2">
          <span className="flex gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </span>
          <span className="flex flex-1 items-center gap-1.5 truncate rounded-md bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
            <Globe className="h-3 w-3" />
            pharmawallah.com/calculation-tools
          </span>
        </div>
        <div className="grid gap-3 p-3.5 sm:grid-cols-[0.9fr_1.4fr]">
          <div className="space-y-2">
            <div className="flex h-8 items-center gap-2 rounded-lg border border-border px-2.5 text-xs text-muted-foreground">
              <Search className="h-3.5 w-3.5" />
              Search calculators
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn("h-7 rounded-lg", i === 1 ? "bg-primary/15 ring-1 ring-primary/30" : "bg-muted")}
              />
            ))}
          </div>
          <div className="space-y-2.5">
            <MockField label="Input value" value="25" unit="mL" />
            <MockResult compact interpretation="" />
          </div>
        </div>
      </div>
    </Sketch>
  );
}

export function PhoneSketch() {
  return (
    <Sketch label="A phone showing the PharmaWallah Calculators app: a search box and a calculator card, then a calculator with a value, a unit and its result." className="flex justify-center">
      <div className="flex flex-wrap justify-center gap-4">
        <PhoneFrame>
          <div className="px-3 pb-3 pt-4 text-white" style={{ background: BRAND_SURFACE }}>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/85">PharmaWallah</p>
            <p className="mt-0.5 text-sm font-bold">Calculators</p>
            <div className="mt-2.5 flex h-8 items-center gap-2 rounded-lg bg-white/95 px-2.5 text-[11px] text-slate-500">
              <Search className="h-3.5 w-3.5" />
              Search calculator
            </div>
          </div>
          <div className="space-y-2 p-2.5">
            {["Calculator name", "Another calculator"].map((n, i) => (
              <div key={n} className="flex items-center gap-2 rounded-lg border border-border/80 bg-card px-2.5 py-2">
                <Calculator className="h-3.5 w-3.5 text-primary" />
                <span className="flex-1 truncate text-[11px] font-semibold text-foreground">{n}</span>
                <Star className={cn("h-3.5 w-3.5", i === 0 ? "fill-amber-300 text-amber-400" : "text-muted-foreground")} />
              </div>
            ))}
          </div>
        </PhoneFrame>
        <PhoneFrame>
          <div className="flex items-center gap-2 px-3 py-2.5 text-white" style={{ background: BRAND_SURFACE }}>
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            <span className="truncate text-[11px] font-semibold">Calculator name</span>
          </div>
          <div className="space-y-2.5 p-2.5 text-[11px]">
            <div className="flex gap-1.5">
              <div className="flex h-8 flex-1 items-center rounded-md border border-primary px-2 text-xs font-medium">25</div>
              <div className="flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs">
                mL <ChevronDown className="h-3 w-3" />
              </div>
            </div>
            <div className="rounded-lg px-2.5 py-2.5 text-white" style={{ background: BRAND_SURFACE }}>
              <p className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-white/85">Result</p>
              <p className="text-lg font-bold">12.45</p>
            </div>
          </div>
        </PhoneFrame>
      </div>
    </Sketch>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[9.5rem] overflow-hidden rounded-[1.4rem] border-[5px] border-slate-800 bg-[#f6f8fb] shadow-[0_18px_40px_-24px_rgba(15,23,42,.6)]">
      <div className="mx-auto mt-1 h-1 w-10 rounded-full bg-slate-800" />
      <div className="mt-1 min-h-[14rem]">{children}</div>
    </div>
  );
}

// ─── LAB WORKFLOW ───────────────────────────────────────────────────────────

/** The main picture of the guide: a numbered vertical path from bench to record. */
export function LabWorkflowSketch({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <Sketch label={`The laboratory workflow in ${steps.length} steps: ${steps.map((s) => s.title).join(", then ")}.`}>
      <ol className="relative grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <motion.li
            key={s.title}
            {...reveal}
            transition={{ ...reveal.transition, delay: i * 0.05 }}
            className="relative flex gap-3 rounded-xl border border-border/80 bg-card p-3.5"
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold",
                i === steps.length - 1 ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary",
              )}
            >
              {i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-foreground">{s.title}</span>
              <span className="block text-xs leading-relaxed text-muted-foreground">{s.body}</span>
            </span>
          </motion.li>
        ))}
      </ol>
    </Sketch>
  );
}

// ─── VERIFY ─────────────────────────────────────────────────────────────────

export function VerifySketch() {
  const part = "flex min-h-[4.5rem] flex-1 flex-col items-center justify-center rounded-xl px-3 py-3 text-center text-sm font-semibold";
  return (
    <Sketch label="Calculator result plus student verification equals a reliable calculation.">
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <div className={cn(part, "border border-border/80 bg-card text-foreground")}>
          <Calculator className="mb-1 h-5 w-5 text-primary" />
          Calculator result
        </div>
        <span className="text-center text-2xl font-light text-muted-foreground">+</span>
        <div className={cn(part, "border border-border/80 bg-card text-foreground")}>
          <Check className="mb-1 h-5 w-5 text-emerald-600" />
          Your verification
        </div>
        <span className="text-center text-2xl font-light text-muted-foreground">=</span>
        <div className={cn(part, "text-white")} style={{ background: BRAND_SURFACE }}>
          <Star className="mb-1 h-5 w-5" />
          A reliable answer
        </div>
      </div>
    </Sketch>
  );
}

