"use client";

/**
 * Local file export (spec §20). Nothing here contacts a server.
 *
 * Inside the packaged app a Rust command writes the bytes into a
 * "PharmaWallah" folder in the user's Documents directory and returns the full
 * path, which the caller shows. In a browser (development and verification)
 * the same bytes go through an object URL download instead, so the code path
 * can be exercised without compiling Rust.
 *
 * PDF uses jsPDF, which is already a dependency of this repo and runs entirely
 * in the renderer. It is loaded with a dynamic import so the ~350 kB only
 * arrives when somebody actually exports a PDF — the dashboard and the
 * calculators never pay for it.
 */

import { invoke, isTauri } from "./bridge";
import type { HistoryEntry } from "./store";

export type ExportFormat = "txt" | "csv" | "pdf";

/** Windows forbids \ / : * ? " < > | in a file name. */
function safeName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ").trim().slice(0, 80) || "report";
}

function stamp(iso: string): string {
  // 2026-09-22T14:05:09.123Z → 2026-09-22_1405
  return `${iso.slice(0, 10)}_${iso.slice(11, 13)}${iso.slice(14, 16)}`;
}

/* ── Renderers ─────────────────────────────────────────────────────────── */

export function entryToText(entry: HistoryEntry): string {
  const lines: string[] = [
    "PharmaWallah",
    "Calculation Report",
    "",
    `Calculator:  ${entry.calculator}`,
    `Saved:       ${new Date(entry.savedAt).toLocaleString()}`,
    "",
  ];

  if (entry.inputs.length) {
    lines.push("Inputs:");
    for (const input of entry.inputs) lines.push(`  ${input.label} = ${input.value}`);
    lines.push("");
  }

  if (entry.formula) {
    lines.push("Formula:", `  ${entry.formula}`, "");
  }

  if (entry.results.length) {
    lines.push("Result:");
    for (const result of entry.results) lines.push(`  ${result.label}: ${result.value}`);
    lines.push("");
  }

  if (entry.note) lines.push("Note:", `  ${entry.note}`, "");

  lines.push(
    "Educational use only. Verify every value against your own reference",
    "before it is used for a patient.",
  );

  return lines.join("\n");
}

/** RFC 4180 quoting: double the quotes, wrap anything with a separator. */
function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function entriesToCsv(entries: HistoryEntry[]): string {
  const header = ["Saved", "Calculator", "Inputs", "Formula", "Result", "Note"];
  const rows = entries.map((entry) =>
    [
      new Date(entry.savedAt).toLocaleString(),
      entry.calculator,
      entry.inputs.map((i) => `${i.label} = ${i.value}`).join("; "),
      entry.formula ?? "",
      entry.results.map((r) => `${r.label}: ${r.value}`).join("; "),
      entry.note ?? "",
    ].map(csvCell).join(","),
  );
  // A leading BOM so Excel on Windows opens UTF-8 (µ, ², ×) correctly.
  return `﻿${[header.map(csvCell).join(","), ...rows].join("\r\n")}\r\n`;
}

async function entriesToPdf(entries: HistoryEntry[]): Promise<Uint8Array> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  const page = (needed: number) => {
    if (y + needed <= doc.internal.pageSize.getHeight() - margin) return;
    doc.addPage();
    y = margin;
  };

  const write = (text: string, size: number, style: "normal" | "bold" = "normal") => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    // jsPDF's built-in fonts are WinAnsi: characters such as µ and ² have no
    // glyph and render as a box. Replace the ones the calculators actually
    // produce rather than shipping an embedded font into the installer.
    const safe = text
      .replace(/µ/g, "u")
      .replace(/×/g, "x")
      .replace(/·/g, "-")
      .replace(/₀|⁰/g, "0").replace(/₁|¹/g, "1").replace(/₂|²/g, "2").replace(/₃|³/g, "3")
      .replace(/₄|⁴/g, "4").replace(/₅|⁵/g, "5").replace(/₆|⁶/g, "6").replace(/₇|⁷/g, "7")
      .replace(/₈|⁸/g, "8").replace(/₉|⁹/g, "9")
      .replace(/[^\x20-\x7E\n]/g, "");
    for (const line of doc.splitTextToSize(safe, width) as string[]) {
      page(size + 6);
      doc.text(line, margin, y);
      y += size + 4;
    }
  };

  write("PharmaWallah", 20, "bold");
  write("Calculation Report", 11);
  y += 8;

  entries.forEach((entry, index) => {
    if (index > 0) {
      y += 10;
      page(24);
      doc.setDrawColor(210);
      doc.line(margin, y, margin + width, y);
      y += 16;
    }
    write(entry.calculator, 14, "bold");
    write(new Date(entry.savedAt).toLocaleString(), 9);
    y += 6;

    if (entry.inputs.length) {
      write("Inputs", 10, "bold");
      for (const input of entry.inputs) write(`${input.label} = ${input.value}`, 10);
      y += 4;
    }
    if (entry.formula) {
      write("Formula", 10, "bold");
      write(entry.formula, 10);
      y += 4;
    }
    if (entry.results.length) {
      write("Result", 10, "bold");
      for (const result of entry.results) write(`${result.label}: ${result.value}`, 12, "bold");
      y += 4;
    }
    if (entry.note) {
      write("Note", 10, "bold");
      write(entry.note, 10);
    }
  });

  y += 16;
  write("Educational use only. Verify every value against your own reference before use.", 8);

  return new Uint8Array(doc.output("arraybuffer") as ArrayBuffer);
}

/* ── Writing ───────────────────────────────────────────────────────────── */

const MIME: Record<ExportFormat, string> = {
  txt: "text/plain;charset=utf-8",
  csv: "text/csv;charset=utf-8",
  pdf: "application/pdf",
};

async function write(filename: string, bytes: Uint8Array, format: ExportFormat): Promise<string> {
  if (isTauri()) {
    // Vec<u8> over the IPC bridge: a plain number array is what serde expects.
    const path = await invoke<string>("export_save", {
      filename,
      bytes: Array.from(bytes),
    });
    return path ?? "the export folder";
  }

  const blob = new Blob([bytes as BlobPart], { type: MIME[format] });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoked on the next frame so the download has taken the reference.
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return "your Downloads folder";
}

/**
 * Exports one or more history entries. Returns the location to show the user.
 * Throws only if rendering fails; the caller reports that as a message.
 */
export async function exportEntries(
  entries: HistoryEntry[],
  format: ExportFormat,
): Promise<string> {
  if (entries.length === 0) throw new Error("There is nothing to export.");

  const base =
    entries.length === 1
      ? `PharmaWallah ${safeName(entries[0].calculator)} ${stamp(entries[0].savedAt)}`
      : `PharmaWallah calculations ${stamp(new Date().toISOString())}`;

  const encoder = new TextEncoder();

  if (format === "pdf") {
    return write(`${base}.pdf`, await entriesToPdf(entries), "pdf");
  }
  if (format === "csv") {
    return write(`${base}.csv`, encoder.encode(entriesToCsv(entries)), "csv");
  }
  const text = entries.map(entryToText).join("\n\n------------------------------\n\n");
  return write(`${base}.txt`, encoder.encode(text), "txt");
}
