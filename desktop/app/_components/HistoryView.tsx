"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FileDown, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, PageHeader, SearchField, useToast } from "./parts";
import { toolHref } from "../_data/catalog";
import {
  clearHistory,
  deleteHistory,
  getHistory,
  getSettings,
  subscribe,
  updateHistory,
  type HistoryEntry,
} from "../_lib/store";
import { exportEntries, type ExportFormat } from "../_lib/export";

/**
 * Saved calculations (spec §12).
 *
 * Everything lives in one local file (or localStorage, in a browser) — see
 * _lib/store.ts. Entries survive a restart, can be deleted one at a time or all
 * at once, and can be exported as PDF, CSV or plain text without any server
 * being involved.
 */
export function HistoryView() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(true);
  const [busy, setBusy] = useState(false);
  const { flash, toast } = useToast();

  useEffect(() => {
    let live = true;
    const sync = () => {
      void getHistory().then((list) => {
        if (live) setEntries(list);
      });
    };
    sync();
    void getSettings().then((settings) => {
      if (live) setConfirmDelete(settings.confirmBeforeDelete);
    });
    const unsubscribe = subscribe(sync);
    return () => {
      live = false;
      unsubscribe();
    };
  }, []);

  const filtered = useMemo(() => {
    if (!entries) return [];
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) =>
      [
        entry.calculator,
        entry.note ?? "",
        ...entry.inputs.map((input) => `${input.label} ${input.value}`),
        ...entry.results.map((result) => `${result.label} ${result.value}`),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [entries, query]);

  const exportAll = useCallback(
    async (format: ExportFormat) => {
      if (filtered.length === 0) {
        flash("There is nothing to export.");
        return;
      }
      setBusy(true);
      try {
        const where = await exportEntries(filtered, format);
        flash(`${filtered.length} ${filtered.length === 1 ? "calculation" : "calculations"} written to ${where}.`);
      } catch (error) {
        flash(error instanceof Error ? error.message : "The export failed.");
      } finally {
        setBusy(false);
      }
    },
    [filtered, flash],
  );

  if (entries === null) {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-8">
        <PageHeader eyebrow="Saved" title="Calculation history" />
        <p className="text-sm text-muted-foreground">Reading saved calculations…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-8 py-8">
      <PageHeader
        eyebrow="Saved"
        title="Calculation history"
        lead="Every calculation you saved, kept in a file on this computer. Nothing is uploaded, and nothing is shared between user accounts."
      >
        <Button variant="outline" size="sm" disabled={busy || filtered.length === 0} onClick={() => void exportAll("pdf")}>
          <FileDown />
          PDF
        </Button>
        <Button variant="outline" size="sm" disabled={busy || filtered.length === 0} onClick={() => void exportAll("csv")}>
          <FileDown />
          CSV
        </Button>
        <Button variant="outline" size="sm" disabled={busy || filtered.length === 0} onClick={() => void exportAll("txt")}>
          <FileDown />
          Text
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer />
          Print
        </Button>
      </PageHeader>

      {entries.length === 0 ? (
        <EmptyState
          title="No saved calculations yet"
          body="Open a calculator, fill it in, and press Save in the bar above it. What you saved appears here, and stays here after the application is closed."
          action={
            <Button asChild>
              <Link href="/calculation-tools/">Browse calculators</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-5">
            <SearchField
              value={query}
              onChange={setQuery}
              label="Search saved calculations"
              placeholder="Search by calculator, input or result…   (press /)"
            />
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13px] text-muted-foreground" aria-live="polite">
              {filtered.length === entries.length
                ? `${entries.length} saved ${entries.length === 1 ? "calculation" : "calculations"}.`
                : `${filtered.length} of ${entries.length} shown.`}
            </p>

            {confirmClear ? (
              <span className="flex items-center gap-2" data-print="hide">
                <span className="text-[13px] font-medium text-foreground">
                  Delete all {entries.length}? This cannot be undone.
                </span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    void clearHistory().then(() => flash("History cleared."));
                    setConfirmClear(false);
                  }}
                >
                  Delete all
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmClear(false)}>
                  Cancel
                </Button>
              </span>
            ) : (
              <Button size="sm" variant="outline" data-print="hide" onClick={() => setConfirmClear(true)}>
                <Trash2 />
                Clear all
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title={`Nothing matches “${query.trim()}”`}
              body="Clear the search to see every saved calculation."
            />
          ) : (
            <ul className="space-y-3">
              {filtered.map((entry) => (
                <li key={entry.id}>
                  <HistoryCard
                    entry={entry}
                    confirmDelete={confirmDelete}
                    onFlash={flash}
                    busy={busy}
                    setBusy={setBusy}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {toast}
    </div>
  );
}

function HistoryCard({
  entry,
  confirmDelete,
  onFlash,
  busy,
  setBusy,
}: {
  entry: HistoryEntry;
  confirmDelete: boolean;
  onFlash: (message: string) => void;
  busy: boolean;
  setBusy: (value: boolean) => void;
}) {
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState(entry.note ?? "");

  const remove = () => {
    void deleteHistory(entry.id).then(() => onFlash("Calculation deleted."));
  };

  const exportOne = async (format: ExportFormat) => {
    setBusy(true);
    try {
      const where = await exportEntries([entry], format);
      onFlash(`${format.toUpperCase()} written to ${where}.`);
    } catch (error) {
      onFlash(error instanceof Error ? error.message : "The export failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-2xl border border-border/80 bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            {entry.calculator}
          </h2>
          <p className="mt-0.5 font-mono text-[11.5px] text-muted-foreground">
            {new Date(entry.savedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2" data-print="hide">
          <Button asChild size="sm" variant="outline">
            <Link href={toolHref(entry.slug)}>Open calculator</Link>
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void exportOne("pdf")}>
            <FileDown />
            PDF
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => void exportOne("txt")}>
            <FileDown />
            Text
          </Button>
          {asking || !confirmDelete ? (
            asking ? (
              <>
                <Button size="sm" variant="destructive" onClick={remove}>
                  Delete
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAsking(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={remove} aria-label="Delete this calculation">
                <Trash2 />
              </Button>
            )
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAsking(true)}
              aria-label="Delete this calculation"
            >
              <Trash2 />
            </Button>
          )}
        </div>
      </div>

      {entry.results.length > 0 && (
        <dl className="mt-4 space-y-1.5">
          {entry.results.map((result, index) => (
            <div key={`${result.label}-${index}`} className="flex flex-wrap items-baseline gap-x-3">
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                {result.label}
              </dt>
              <dd className="text-[17px] font-semibold tabular-nums tracking-[-0.02em] text-foreground">
                {result.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {entry.inputs.length > 0 && (
        <div className="mt-4 border-t border-border/70 pt-3">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            Inputs
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1">
            {entry.inputs.map((input, index) => (
              <li key={`${input.label}-${index}`} className="text-[13px] text-muted-foreground">
                <span className="text-foreground/80">{input.label}</span>{" "}
                <span className="font-medium tabular-nums text-foreground">= {input.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {entry.formula && (
        <details className="mt-3">
          <summary className="cursor-pointer text-[13px] font-medium text-muted-foreground hover:text-foreground">
            Formula and working
          </summary>
          <p className="mt-2 rounded-lg border border-border/70 border-l-[3px] border-l-primary bg-muted/60 px-3.5 py-3 font-mono text-[12.5px] leading-relaxed text-foreground">
            {entry.formula}
          </p>
        </details>
      )}

      <div className="mt-4" data-print="hide">
        <label
          htmlFor={`note-${entry.id}`}
          className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground"
        >
          Note
        </label>
        <input
          id={`note-${entry.id}`}
          value={note}
          placeholder="Add a note — which practical, which patient case…"
          onChange={(event) => setNote(event.target.value)}
          onBlur={() => {
            if (note !== (entry.note ?? "")) void updateHistory(entry.id, { note });
          }}
          className="mt-1.5 h-10 w-full rounded-lg border border-input bg-background px-3 text-[13px] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
        />
      </div>
    </article>
  );
}
