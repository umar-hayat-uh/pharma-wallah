"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, FileDown, Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "./parts";
import { categoryOf, toolName } from "../_data/catalog";
import { snapshotCalculator } from "../_lib/snapshot";
import { addHistory } from "../_lib/store";
import { exportEntries, type ExportFormat } from "../_lib/export";

/**
 * The chrome around an open calculator: breadcrumb, Save, Print and Export.
 *
 * WHY IT SITS HERE. The calculator itself is the website's component,
 * re-exported one line at a time (see scripts/generate-desktop-routes.mjs), and
 * none of the 104 knows this application exists. Everything desktop-specific —
 * recording a calculation, printing it, writing a file — therefore lives in the
 * frame and reads the calculator through the DOM it has already rendered.
 * That is what lets all 104 gain these three buttons without a single edit to
 * a file the website and the Android app share.
 */
export function ToolFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const slug = pathname.replace(/^\/calculation-tools\//, "").replace(/\/$/, "");
  const content = useRef<HTMLDivElement>(null);
  const { flash, toast } = useToast();
  const [busy, setBusy] = useState(false);

  const category = slug ? categoryOf(slug) : undefined;
  const name = slug ? toolName(slug) : "Calculator";

  /** Reads what is on screen and writes it to the local history file. */
  const save = useCallback(async () => {
    const snapshot = snapshotCalculator(content.current);
    if (!snapshot) {
      flash("Nothing to save — this page has no calculator on it.");
      return;
    }
    if (snapshot.results.length === 0) {
      flash("No result on screen yet. Fill the inputs in, then save.");
      return;
    }
    setBusy(true);
    try {
      await addHistory({
        calculator: snapshot.calculator || name,
        slug,
        inputs: snapshot.inputs,
        results: snapshot.results,
        formula: snapshot.formula,
      });
      flash("Saved to history on this computer.");
    } catch {
      flash("The calculation could not be saved.");
    } finally {
      setBusy(false);
    }
  }, [flash, name, slug]);

  /** Exports the calculation on screen without saving it first. */
  const exportNow = useCallback(
    async (format: ExportFormat) => {
      const snapshot = snapshotCalculator(content.current);
      if (!snapshot || snapshot.results.length === 0) {
        flash("No result on screen yet — there is nothing to export.");
        return;
      }
      setBusy(true);
      try {
        const where = await exportEntries(
          [
            {
              id: "preview",
              savedAt: new Date().toISOString(),
              calculator: snapshot.calculator || name,
              slug,
              inputs: snapshot.inputs,
              results: snapshot.results,
              formula: snapshot.formula,
            },
          ],
          format,
        );
        flash(`${format.toUpperCase()} written to ${where}.`);
      } catch (error) {
        flash(error instanceof Error ? error.message : "The export failed.");
      } finally {
        setBusy(false);
      }
    },
    [flash, name, slug],
  );

  return (
    <div>
      <div
        data-print="hide"
        className="sticky top-0 z-30 border-b border-border/80 bg-background/95 px-8 py-3"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
            <Link
              href="/calculation-tools/"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Calculators
            </Link>
            {category && (
              <>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                <span className="truncate text-muted-foreground">{category.label}</span>
              </>
            )}
          </nav>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => void save()} disabled={busy}>
              <Save />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => void exportNow("pdf")} disabled={busy}>
              <FileDown />
              PDF
            </Button>
            <Button size="sm" variant="outline" onClick={() => void exportNow("txt")} disabled={busy}>
              <FileDown />
              Text
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* The calculator renders its own CalculatorShell inside here; this div
          is only a handle for the DOM snapshot above. */}
      <div ref={content}>{children}</div>

      {toast}
    </div>
  );
}
