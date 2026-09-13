"use client";

import { useId, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { ClipboardPaste, Plus, Trash2, Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MAX_ROWS, blankRow, listNumbers, newRowId, parsePaste, type DataRow, type RowStatus } from "./_math";

export const EASE = [0.16, 1, 0.3, 1] as const;

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

/* ─── Editable two-column table ──────────────────────────────────────────── */

/**
 * The data table shared by both modes: edit cells, add and delete rows, clear
 * with undo, and paste a block of two-column text.
 *
 * Cells are text inputs with a decimal keypad rather than type="number": a
 * number input reports "" for an unparseable entry, which would make a typo
 * look like an empty cell instead of being flagged.
 */
export function DataTable({
  rows,
  onRowsChange,
  statuses,
  xLabel,
  yLabel,
  xPlaceholder,
  yPlaceholder,
  pasteExample,
}: {
  rows: DataRow[];
  /** Every structural change goes through here, so the parent can clear an "example loaded" flag. */
  onRowsChange: (rows: DataRow[]) => void;
  statuses: RowStatus[];
  xLabel: string;
  yLabel: string;
  xPlaceholder: string;
  yPlaceholder: string;
  pasteExample: string;
}) {
  const [backup, setBackup] = useState<DataRow[] | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteMode, setPasteMode] = useState<"replace" | "append">("replace");
  const [importMessage, setImportMessage] = useState("");
  const pasteId = useId();

  const change = (next: DataRow[]) => {
    setBackup(null);
    onRowsChange(next);
  };

  const updateCell = (id: number, key: "x" | "y", value: string) =>
    change(rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const filledRows = rows.filter((row) => row.x.trim() !== "" || row.y.trim() !== "").length;

  const clear = () => {
    setBackup(rows);
    onRowsChange([blankRow()]);
    setImportMessage("");
  };

  const importRows = () => {
    // Replacing drops the current table, so all MAX_ROWS are available.
    const keep = pasteMode === "append" ? rows.filter((row) => row.x.trim() !== "" || row.y.trim() !== "") : [];
    const result = parsePaste(pasteText, MAX_ROWS - keep.length);
    const imported = result.rows.map((row) => ({ id: newRowId(), x: row.x, y: row.y }));
    const parts = [`Imported ${imported.length} row${imported.length === 1 ? "" : "s"}`];
    if (result.skipped.length > 0) {
      parts.push(
        `skipped ${result.skipped.length} line${result.skipped.length === 1 ? "" : "s"} (line${result.skipped.length === 1 ? "" : "s"} ${listNumbers(result.skipped)}) that did not start with two numbers`,
      );
    } else {
      parts.push("skipped 0 lines");
    }
    let message = `${parts.join(", ")}.`;
    if (result.truncated > 0) message += ` ${result.truncated} further rows were not imported — the table holds at most ${MAX_ROWS} rows.`;
    if (imported.length === 0) {
      setImportMessage(`${message} The table was left unchanged.`);
      return;
    }
    change([...keep, ...imported]);
    setImportMessage(message);
    setPasteText("");
  };

  const incomplete = statuses.filter((status) => status.kind === "invalid").length;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border">
        <div className="max-h-[26rem] overflow-y-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              {xLabel} and {yLabel} readings. {rows.length} rows.
            </caption>
            <thead className="sticky top-0 z-10 bg-gradient-to-r from-blue-50 to-green-50/70 backdrop-blur">
              <tr>
                <th scope="col" className="w-10 px-2 py-2.5 text-left text-xs font-semibold text-muted-foreground">#</th>
                <th scope="col" className="px-2 py-2.5 text-left text-xs font-semibold text-foreground">{xLabel}</th>
                <th scope="col" className="px-2 py-2.5 text-left text-xs font-semibold text-foreground">{yLabel}</th>
                <th scope="col" className="w-12 px-1 py-2.5"><span className="sr-only">Delete</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const status = statuses[index];
                const invalid = status?.kind === "invalid" ? status : null;
                const errorId = `${pasteId}-row-${row.id}`;
                return (
                  <tr key={row.id} className={cx("border-t align-top", invalid && "bg-red-50/60")}>
                    <td className="px-2 pt-4 text-xs tabular-nums text-muted-foreground">{index + 1}</td>
                    <td className="px-1.5 py-1.5">
                      <CellInput
                        value={row.x}
                        onChange={(value) => updateCell(row.id, "x", value)}
                        placeholder={xPlaceholder}
                        label={`${xLabel}, row ${index + 1}`}
                        bad={Boolean(invalid?.xBad)}
                        describedBy={invalid ? errorId : undefined}
                      />
                    </td>
                    <td className="px-1.5 py-1.5">
                      <CellInput
                        value={row.y}
                        onChange={(value) => updateCell(row.id, "y", value)}
                        placeholder={yPlaceholder}
                        label={`${yLabel}, row ${index + 1}`}
                        bad={Boolean(invalid?.yBad)}
                        describedBy={invalid ? errorId : undefined}
                      />
                      {invalid && (
                        <p id={errorId} className="mt-1 text-[11px] leading-snug text-red-700">
                          Not plotted: {invalid.message}.
                        </p>
                      )}
                    </td>
                    <td className="px-1 py-1.5">
                      <button
                        type="button"
                        onClick={() => change(rows.length === 1 ? [blankRow()] : rows.filter((r) => r.id !== row.id))}
                        aria-label={`Delete row ${index + 1}`}
                        className={cx("grid h-11 w-11 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600", FOCUS)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {incomplete > 0 && (
        <p role="status" className="text-xs font-medium text-red-700">
          {incomplete} incomplete row{incomplete === 1 ? " is" : "s are"} not plotted.
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button
          variant="outline"
          className="border-dashed"
          disabled={rows.length >= MAX_ROWS}
          onClick={() => change([...rows, blankRow()])}
        >
          <Plus />
          Add row
        </Button>
        <Button
          variant="outline"
          onClick={() => setPasteOpen((open) => !open)}
          aria-expanded={pasteOpen}
          aria-controls={`${pasteId}-paste`}
        >
          <ClipboardPaste />
          Paste bulk data
        </Button>
        <Button variant="outline" disabled={filledRows === 0} onClick={clear} className="col-span-2 sm:col-span-1">
          <X />
          Clear data
        </Button>
      </div>

      {backup && (
        <div role="status" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-sm text-amber-900">
          <span>Cleared {backup.length} row{backup.length === 1 ? "" : "s"}.</span>
          <Button
            variant="outline"
            size="sm"
            className="h-11 bg-white"
            onClick={() => {
              onRowsChange(backup);
              setBackup(null);
            }}
          >
            <Undo2 />
            Undo
          </Button>
        </div>
      )}

      {pasteOpen && (
        <MotionConfig reducedMotion="user">
          <motion.div
            id={`${pasteId}-paste`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="space-y-3 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-3.5"
          >
            <div className="space-y-1.5">
              <Label htmlFor={`${pasteId}-text`}>Paste two columns — {xLabel} then {yLabel}</Label>
              <textarea
                id={`${pasteId}-text`}
                value={pasteText}
                onChange={(event) => setPasteText(event.target.value)}
                rows={6}
                spellCheck={false}
                placeholder={pasteExample}
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 font-mono text-sm leading-relaxed transition-[border-color,box-shadow] duration-300 hover:border-foreground/25 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                One reading per line. Separate the columns with a comma, tab, semicolon or space — copying two
                columns from Excel works. Header lines are skipped. Extra columns are ignored.
              </p>
            </div>
            <fieldset className="flex flex-wrap gap-2">
              <legend className="sr-only">When importing</legend>
              {(["replace", "append"] as const).map((option) => (
                <label
                  key={option}
                  className={cx(
                    "flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm transition-colors",
                    pasteMode === option ? "border-blue-300 bg-white text-foreground" : "bg-background/60 text-muted-foreground",
                  )}
                >
                  <input
                    type="radio"
                    name={`${pasteId}-mode`}
                    className="h-4 w-4 accent-blue-600"
                    checked={pasteMode === option}
                    onChange={() => setPasteMode(option)}
                  />
                  {option === "replace" ? "Replace the table" : "Append to the table"}
                </label>
              ))}
            </fieldset>
            <Button onClick={importRows} disabled={pasteText.trim() === ""} className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto">
              Import rows
            </Button>
          </motion.div>
        </MotionConfig>
      )}
      <p aria-live="polite" className={cx("text-xs leading-relaxed", importMessage ? "text-foreground" : "sr-only")}>
        {importMessage}
      </p>
    </div>
  );
}

function CellInput({
  value,
  onChange,
  placeholder,
  label,
  bad,
  describedBy,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  bad: boolean;
  describedBy?: string;
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={label}
      aria-invalid={bad || undefined}
      aria-describedby={describedBy}
      className={cx(
        "h-11 w-full min-w-0 rounded-lg border bg-background px-2.5 text-[15px] tabular-nums transition-[border-color,box-shadow] duration-300",
        "placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-4",
        bad
          ? "border-red-500 focus-visible:border-red-600 focus-visible:ring-red-500/15"
          : "border-input hover:border-foreground/25 focus-visible:border-ring focus-visible:ring-ring/15",
      )}
    />
  );
}

/* ─── Small controls ─────────────────────────────────────────────────────── */

/** An on/off switch with a 44px target and the ARIA switch role. */
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx("flex min-h-[48px] w-full items-center gap-3 rounded-xl border bg-background px-3.5 py-2 text-left transition-colors hover:border-blue-200", FOCUS)}
    >
      <span
        aria-hidden
        className={cx(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-gradient-to-r from-blue-600 to-green-400" : "bg-slate-300",
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        {description && <span className="block text-xs leading-snug text-muted-foreground">{description}</span>}
      </span>
    </button>
  );
}

/** A compact toolbar button: icon plus a label that stays visible from `sm` up. */
export function ToolButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={disabled} className="h-11 min-w-[44px] px-3" aria-label={label}>
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

export function StatTiles({ tiles }: { tiles: { label: string; value: string; unit?: string; note?: string; featured?: boolean }[] }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {tiles.map((tile, index) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: EASE }}
            className={cx(
              "min-w-0 rounded-[20px] border p-3.5",
              tile.featured ? "border-blue-600 text-white shadow-sm shadow-blue-600/20" : "bg-card",
            )}
            style={tile.featured ? { backgroundImage: "linear-gradient(135deg, #2563EB 0%, #2563EB 55%, #22C55E 130%)" } : undefined}
          >
            <p className={cx("text-[11px] font-semibold uppercase tracking-[0.12em]", tile.featured ? "text-white/80" : "text-muted-foreground")}>
              {tile.label}
            </p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-1.5 break-words">
              <span className={cx("text-2xl font-extrabold leading-tight tracking-tight tabular-nums", tile.featured ? "text-white" : "text-foreground")}>
                {tile.value}
              </span>
              {tile.unit && <span className={cx("text-sm font-semibold", tile.featured ? "text-white/85" : "text-blue-600")}>{tile.unit}</span>}
            </p>
            {tile.note && <p className={cx("mt-0.5 text-[11px] leading-snug", tile.featured ? "text-white/80" : "text-muted-foreground")}>{tile.note}</p>}
          </motion.div>
        ))}
      </div>
    </MotionConfig>
  );
}

export function ExampleChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("min-h-[44px] rounded-full border bg-background px-4 py-2 text-xs font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50", FOCUS)}
    >
      {label}
    </button>
  );
}

/** A plain list of warning lines, without <ul>/<li> (globals.css restyles those). */
export function WarningList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div role="list" className="space-y-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3">
      {items.map((item) => (
        <p role="listitem" key={item} className="flex gap-2 text-sm leading-relaxed text-amber-900">
          <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
          <span>{item}</span>
        </p>
      ))}
    </div>
  );
}
