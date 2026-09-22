"use client";

import { useEffect, useId, useState } from "react";
import { ChevronRight, Download, Minus, Plus, Trash2 } from "lucide-react";
import { ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NumberField, SelectField } from "../NumberField";
import { calculatorHref, readQuery, toNumber } from "../lab-math";
import type { LabReportSection } from "../LabReport";
import { calibrationFromQuery, loadCalibration, precise } from "./calibration-store";

/* ─── Chart palette ──────────────────────────────────────────────────────── */

/**
 * Literal colours, shared by the Recharts graphs and the print figure.
 * Validated with the dataviz palette script (light surface): all pass; amber↔green
 * sits in the CVD 6–8 floor band, so the unknown is also a diamond and every
 * graph carries a legend — identity is never colour alone.
 */
export const CHART = {
  primary: "#1C7BD9",
  line: "#16A34A",
  accent: "#D97706",
  grid: "#E2E8F0",
  axis: "#94A3B8",
  tick: "#64748B",
  ink: "#0F172A",
} as const;

export const AXIS_TICK = { fontSize: 11, fill: CHART.tick } as const;

/* ─── Validation for signed values ───────────────────────────────────────── */

/**
 * The kit's `fieldError` rejects negatives, which is right for a mass but wrong
 * for an intercept, an absorbance after blank correction or a log value.
 */
export function numericError(
  raw: string,
  { show, allowNegative = true, allowZero = true, required = true }: { show: boolean; allowNegative?: boolean; allowZero?: boolean; required?: boolean },
): string | undefined {
  if (raw.trim() === "") return required && show ? "Required." : undefined;
  const value = toNumber(raw);
  if (value === null) return "Enter a number.";
  if (value < 0 && !allowNegative) return "Cannot be negative.";
  if (value === 0 && !allowZero) return "Cannot be zero.";
  return undefined;
}

/* ─── Calibration equation input ─────────────────────────────────────────── */

export const CONCENTRATION_UNITS = ["µg/mL", "mg/mL", "mg/L", "µg/L", "g/L", "% w/v", "µM", "mM", "M"];

/**
 * Intercept a and slope b of Y = a + bX, with an import from the Calibration
 * Curve Calculator. Controlled: the page owns the strings.
 */
export function CalibrationFields({
  intercept,
  slope,
  unit,
  onIntercept,
  onSlope,
  onUnit,
  show,
  units = CONCENTRATION_UNITS,
  title,
  readFromUrl = true,
}: {
  intercept: string;
  slope: string;
  unit: string;
  onIntercept: (value: string) => void;
  onSlope: (value: string) => void;
  onUnit: (value: string) => void;
  show: boolean;
  units?: string[];
  /** e.g. "Aqueous phase" when a page has more than one equation. */
  title?: string;
  /** Only one CalibrationFields per page should consume the hand-off link. */
  readFromUrl?: boolean;
}) {
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!readFromUrl) return;
    const fromLink = calibrationFromQuery(readQuery());
    if (!fromLink) return;
    onIntercept(fromLink.intercept);
    onSlope(fromLink.slope);
    if (fromLink.unit && units.includes(fromLink.unit)) onUnit(fromLink.unit);
    setStatus("Calibration line received from the Calibration Curve Calculator.");
    // Once, on arrival. The setters are stable state setters from the page.
  }, []);

  const importSaved = () => {
    const saved = loadCalibration();
    if (!saved) {
      setStatus("No calibration saved on this device yet — calculate one in the Calibration Curve Calculator first.");
      return;
    }
    onIntercept(precise(saved.intercept));
    onSlope(precise(saved.slope));
    const unitNote = saved.unit && units.includes(saved.unit) ? saved.unit : null;
    if (unitNote) onUnit(unitNote);
    setStatus(
      `Imported Y = ${precise(saved.intercept)} + ${precise(saved.slope)}X${saved.r2 !== null ? ` (R² = ${saved.r2.toFixed(4)}, n = ${saved.n})` : ""}${unitNote ? `; X unit set to ${unitNote}` : ""}.`,
    );
  };

  const slopeValue = toNumber(slope);
  const a = toNumber(intercept);

  return (
    <div className="space-y-3">
      {title && <p className="text-sm font-semibold text-foreground">{title}</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField
          label="Intercept (a)"
          value={intercept}
          onChange={onIntercept}
          unit="AU"
          error={numericError(intercept, { show })}
        />
        <NumberField
          label="Slope (b)"
          value={slope}
          onChange={onSlope}
          unit={`AU/(${unit})`}
          error={numericError(slope, { show, allowZero: false })}
          hint={slopeValue !== null && slopeValue < 0 ? "A negative slope is unusual for absorbance — check the sign." : undefined}
        />
        <SelectField label="Concentration unit (X)" value={unit} onChange={onUnit} options={units} />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="rounded-lg border border-l-[3px] border-l-primary bg-muted/60 px-3 py-2 font-mono text-[13px] text-foreground">
          Y = {a === null ? "a" : intercept.trim()} + {slopeValue === null ? "b" : slope.trim()}X
          <span className="ml-2 text-muted-foreground">(Y = absorbance, X = conc. in {unit})</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={importSaved}>
            <Download />
            Import saved calibration
          </Button>
          <Button type="button" variant="ghost" size="sm" asChild>
            <a href={calculatorHref("calibration-curve-calculator", {})}>Open calibration tool</a>
          </Button>
        </div>
      </div>
      <p aria-live="polite" className="min-h-[1rem] text-xs text-muted-foreground">{status}</p>
    </div>
  );
}

/* ─── Count stepper ──────────────────────────────────────────────────────── */

export function CountStepper({
  label,
  value,
  min,
  max,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label id={id} className="text-[13px] font-medium text-foreground/90">{label}</Label>
      <div role="group" aria-labelledby={id} className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" aria-label={`Fewer — ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>
          <Minus />
        </Button>
        <output aria-live="polite" className="grid h-11 min-w-[3.5rem] place-items-center rounded-xl border bg-background px-3 text-lg font-semibold tabular-nums">
          {value}
        </output>
        <Button type="button" variant="outline" size="icon" aria-label={`More — ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}>
          <Plus />
        </Button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ─── Editable data table ────────────────────────────────────────────────── */

export type TableRow = { id: number; cells: Record<string, string> };

export type TableColumn = {
  key: string;
  header: string;
  unit?: string;
  placeholder?: string;
  /** A derived, read-only cell. Receives the row index. */
  computed?: (rowIndex: number) => string;
  /**
   * Width override for this column's input. The default fits an absorbance;
   * a practical whose readings run to ten or eleven digits (a dissolution
   * corrected reading, 0.000877352) clips inside it, and a student cannot
   * check a value they cannot see.
   */
  inputClass?: string;
};

/**
 * Rows of numeric inputs — standards, time points, replicate readings.
 *
 * Inputs are `type="text"` with a decimal keypad rather than `type="number"`:
 * a number input reports "" for "0.5a", so the page could never tell a student
 * their entry is not a number. The table scrolls sideways on a phone; the page
 * never does.
 */
export function DataTable({
  caption,
  columns,
  rows,
  onCell,
  onRemove,
  onAdd,
  addLabel = "Add row",
  minRows = 1,
  maxRows = 30,
  rowHeader,
  cellError,
  rowMessage,
}: {
  caption: string;
  columns: TableColumn[];
  rows: TableRow[];
  onCell: (id: number, key: string, value: string) => void;
  onRemove?: (id: number) => void;
  onAdd?: () => void;
  addLabel?: string;
  minRows?: number;
  maxRows?: number;
  /** First column label for each row, e.g. "Std 1". */
  rowHeader?: (rowIndex: number) => string;
  cellError?: (rowIndex: number, key: string) => string | undefined;
  /** A message under the row — a validation problem or an invalid result. */
  rowMessage?: (rowIndex: number) => { tone: "error" | "warning"; text: string } | undefined;
}) {
  const span = columns.length + (rowHeader ? 1 : 0) + (onRemove ? 1 : 0);
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-max border-collapse text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-blue-50/80">
            <tr>
              {rowHeader && <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-foreground">#</th>}
              {columns.map((column) => (
                <th key={column.key} scope="col" className="whitespace-nowrap px-2 py-2 text-left align-bottom text-xs font-semibold text-foreground">
                  {column.header}
                  {/* The unit on its own line keeps a two-column table inside a 390px screen. */}
                  {column.unit && <span className="block font-mono text-[11px] font-normal text-muted-foreground">({column.unit})</span>}
                </th>
              ))}
              {onRemove && <th scope="col" className="w-12 px-2 py-2"><span className="sr-only">Remove</span></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const message = rowMessage?.(rowIndex);
              return (
                <RowFragment key={row.id}>
                  <tr className="border-t align-top">
                    {rowHeader && (
                      <th scope="row" className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold text-muted-foreground">
                        {rowHeader(rowIndex)}
                      </th>
                    )}
                    {columns.map((column) => {
                      if (column.computed) {
                        return (
                          <td key={column.key} className="whitespace-nowrap px-2 py-3 font-medium tabular-nums text-foreground">
                            {column.computed(rowIndex)}
                          </td>
                        );
                      }
                      const error = cellError?.(rowIndex, column.key);
                      const label = `${rowHeader ? rowHeader(rowIndex) : `Row ${rowIndex + 1}`} — ${column.header}${column.unit ? ` (${column.unit})` : ""}`;
                      return (
                        <td key={column.key} className="px-1.5 py-1.5">
                          <Input
                            type="text"
                            inputMode="decimal"
                            autoComplete="off"
                            aria-label={label}
                            aria-invalid={error ? true : undefined}
                            title={error}
                            value={row.cells[column.key] ?? ""}
                            placeholder={column.placeholder}
                            onChange={(event) => onCell(row.id, column.key, event.target.value)}
                            className={cn(
                              "h-10 rounded-lg px-2.5 text-sm",
                              column.inputClass ?? "w-[6.5rem]",
                              error && "border-destructive bg-red-50/60 focus-visible:border-destructive focus-visible:ring-destructive/15",
                            )}
                          />
                        </td>
                      );
                    })}
                    {onRemove && (
                      <td className="px-1.5 py-1.5">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${rowHeader ? rowHeader(rowIndex) : `row ${rowIndex + 1}`}`}
                          disabled={rows.length <= minRows}
                          onClick={() => onRemove(row.id)}
                        >
                          <Trash2 />
                        </Button>
                      </td>
                    )}
                  </tr>
                  {message && (
                    <tr>
                      <td colSpan={span} className={cn("px-3 pb-2 text-xs font-medium", message.tone === "error" ? "text-destructive" : "text-amber-700")}>
                        {message.text}
                      </td>
                    </tr>
                  )}
                </RowFragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {onAdd && (
        <Button type="button" variant="outline" className="w-full border-dashed" onClick={onAdd} disabled={rows.length >= maxRows}>
          <Plus />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

function RowFragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/* ─── Chart frame ────────────────────────────────────────────────────────── */

/**
 * A card holding one responsive graph. The height is set by the box, the width
 * by the container — no fixed desktop width anywhere, so the chart reflows from
 * a 320px phone to a desktop column.
 */
export function ChartPanel({
  title,
  children,
  footer,
  className,
  heightClass = "h-72 sm:h-[22rem]",
}: {
  title: string;
  children: React.ReactElement;
  footer?: React.ReactNode;
  className?: string;
  heightClass?: string;
}) {
  return (
    <Card className={cn("overflow-hidden rounded-2xl border-border/80", className)}>
      <p className="border-b px-4 py-3 text-sm font-semibold text-foreground sm:px-5">{title}</p>
      <div className={cn("w-full bg-gradient-to-b from-white to-green-50/30 px-1 pt-3 sm:px-3", heightClass)}>
        {/* initialDimension: without it Recharts 3 renders once at −1×−1 and logs a
            size warning before the container has been measured. */}
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 320, height: 280 }}>
          {children}
        </ResponsiveContainer>
      </div>
      {footer && <div className="border-t px-4 py-3 text-xs text-muted-foreground sm:px-5">{footer}</div>}
    </Card>
  );
}

/** Legend chips below a chart — always shown for two or more series. */
export function ChartLegend({ items }: { items: { label: string; color: string; shape: "dot" | "line" | "diamond" | "dash" | "bar" }[] }) {
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            aria-hidden
            className={cn(
              item.shape === "dot" && "h-2.5 w-2.5 rounded-full",
              item.shape === "diamond" && "h-2.5 w-2.5 rotate-45",
              item.shape === "line" && "h-0.5 w-4",
              item.shape === "bar" && "h-2.5 w-2.5 rounded-sm",
              item.shape === "dash" && "h-0 w-4 border-t-2 border-dashed bg-transparent",
            )}
            style={item.shape === "dash" ? { borderColor: item.color } : { background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </span>
  );
}

type TooltipField = { key: string; label: string; format: (value: number) => string };

/**
 * Tooltip content reading named fields off the hovered datum, so X and Y are
 * both labelled with their units whatever the chart type.
 */
export function makeTooltip(fields: TooltipField[]) {
  function LabTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: Record<string, unknown>; name?: unknown }> }) {
    if (!active || !payload || payload.length === 0) return null;
    const datum = payload[0]?.payload;
    if (!datum) return null;
    const series = typeof datum.series === "string" ? datum.series : undefined;
    return (
      <div className="rounded-lg border bg-white px-3 py-2 text-xs shadow-md">
        {series && <p className="mb-1 font-semibold text-foreground">{series}</p>}
        {fields.map((field) => {
          const value = datum[field.key];
          if (typeof value !== "number" || !Number.isFinite(value)) return null;
          return (
            <p key={field.key} className="flex justify-between gap-4 tabular-nums">
              <span className="text-muted-foreground">{field.label}</span>
              <span className="font-semibold text-foreground">{field.format(value)}</span>
            </p>
          );
        })}
      </div>
    );
  }
  return LabTooltip;
}

/* ─── Stat tiles ─────────────────────────────────────────────────────────── */

export type StatTile = { label: string; value: string; unit?: string; note?: string; featured?: boolean };

export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={cn(
            "min-w-0 rounded-xl border px-3.5 py-3",
            tile.featured ? "border-blue-200 bg-gradient-to-br from-blue-50 to-green-50" : "bg-card",
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{tile.label}</p>
          <p className="mt-1 break-words text-lg font-bold leading-tight tabular-nums text-foreground sm:text-xl">
            {tile.value}
            {tile.unit && <span className="ml-1 font-mono text-xs font-normal text-muted-foreground">{tile.unit}</span>}
          </p>
          {tile.note && <p className="mt-0.5 text-xs text-muted-foreground">{tile.note}</p>}
        </div>
      ))}
    </div>
  );
}

/* ─── Step-by-step disclosure ────────────────────────────────────────────── */

/**
 * One expandable block of worked steps (a time point, a group). Native
 * <details>: keyboard and screen-reader support for free, content stays in the
 * HTML, and it works without JavaScript in the static APK export.
 */
export function StepBlock({
  title,
  badge,
  steps,
  defaultOpen = false,
}: {
  title: string;
  badge?: { text: string; tone: "ok" | "error" | "warning" };
  steps: { label: string; lines: string[]; error?: string }[];
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group rounded-xl border bg-card [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex min-h-[48px] cursor-pointer list-none items-center gap-2.5 px-3.5 py-2.5 text-sm font-semibold text-foreground">
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
        <span className="flex-1">{title}</span>
        {badge && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              badge.tone === "ok" && "bg-emerald-100 text-emerald-800",
              badge.tone === "error" && "bg-red-100 text-red-800",
              badge.tone === "warning" && "bg-amber-100 text-amber-800",
            )}
          >
            {badge.text}
          </span>
        )}
      </summary>
      <ol className="space-y-3 border-t px-3.5 py-3">
        {steps.map((step, index) => (
          <li key={index} className="!m-0 list-none !pl-0">
            <p className="text-xs font-semibold text-muted-foreground">
              <span className="mr-1.5 tabular-nums text-blue-600">{index + 1}.</span>
              {step.label}
            </p>
            {step.lines.map((line, lineIndex) => (
              <p key={lineIndex} className="mt-1 overflow-x-auto whitespace-pre rounded-md bg-muted px-2.5 py-1.5 font-mono text-[12.5px] leading-relaxed text-foreground">
                {line}
              </p>
            ))}
            {step.error && <p className="mt-1 text-xs font-medium text-destructive">{step.error}</p>}
          </li>
        ))}
      </ol>
    </details>
  );
}

/* ─── Worked examples ────────────────────────────────────────────────────── */

export function ExampleChips({ items }: { items: { label: string; apply: () => void }[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Load an example data set (you can edit every value)</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.apply}
            className="min-h-[36px] rounded-full border bg-background px-3 py-2 text-xs font-medium transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** The dashed placeholder shown where the lab card will appear. */
export function PendingCard({ submitted, message }: { submitted: boolean; message: string }) {
  return (
    <div className="rounded-[20px] border border-dashed bg-card p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Laboratory calculation card</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {submitted ? "Some values are missing or invalid — check the highlighted fields." : message}
      </p>
    </div>
  );
}

/* ─── Row helpers ────────────────────────────────────────────────────────── */

let rowCounter = 0;
/** Stable React keys for dynamic rows. Module-level so ids never repeat within a session. */
export function nextRowId(): number {
  rowCounter += 1;
  return rowCounter;
}

export function makeRows(values: Record<string, string>[]): TableRow[] {
  return values.map((cells) => ({ id: nextRowId(), cells }));
}

/* ─── Report sections, on screen ─────────────────────────────────────────── */

/**
 * The lab record's numbered sections, for use inside a collapsed
 * "Calculation details" disclosure. The same `LabReportData.sections` feed
 * Copy / Download card / Print, so the steps a student expands on screen are
 * exactly the steps on the filed record.
 */
export function ReportSteps({ sections }: { sections: LabReportSection[] }) {
  return (
    <div className="divide-y">
      {sections.map((section, index) => (
        <div key={`${index}-${section.title}`} className="py-3 first:pt-0 last:pb-0">
          <h3 className="flex items-baseline gap-2.5 text-[14px] font-semibold text-foreground">
            <span className="text-xs font-bold tabular-nums text-blue-600">{String(index + 1).padStart(2, "0")}</span>
            {section.title}
          </h3>
          <div className="mt-2 space-y-2">
            {section.rows?.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-baseline justify-between gap-4 border-b border-dashed py-1.5 last:border-b-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className="text-right text-sm font-semibold tabular-nums text-foreground">
                  {row.value}
                  {row.unit && <span className="ml-1 font-normal text-muted-foreground">{row.unit}</span>}
                </span>
              </div>
            ))}
            {section.formulas?.map((formula, formulaIndex) => (
              <p key={formulaIndex} className="overflow-x-auto whitespace-pre rounded-lg bg-muted px-3 py-2 font-mono text-[12.5px] leading-relaxed text-foreground">
                {formula}
              </p>
            ))}
            {section.table && (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-max border-collapse text-sm">
                  <thead className="bg-blue-50/80">
                    <tr>
                      {section.table.columns.map((column) => (
                        <th key={column} scope="col" className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-foreground">{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="whitespace-nowrap px-3 py-2 tabular-nums text-foreground">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {section.lines?.map((line, lineIndex) => (
              <p key={lineIndex} className="text-sm leading-relaxed text-muted-foreground">{line}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Results table with a sticky first column feel — horizontally scrollable on a phone. */
export function ResultTable({ caption, columns, rows, highlightColumn }: { caption: string; columns: string[]; rows: string[][]; highlightColumn?: number }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-max border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-blue-50/80">
          <tr>
            {columns.map((column, index) => (
              <th key={index} scope="col" className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-foreground">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    "whitespace-nowrap px-3 py-2 tabular-nums text-foreground",
                    cellIndex === highlightColumn && "bg-green-50/70 font-semibold",
                    cell.startsWith("⚠") && "text-destructive",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
