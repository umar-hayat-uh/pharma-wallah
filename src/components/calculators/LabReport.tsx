"use client";

import { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Calculator, Check, Copy, Download, Printer, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IS_MOBILE_APP } from "./lab-math";

/* ─── Data model ─────────────────────────────────────────────────────────── */

export type LabReportRow = { label: string; value: string; unit?: string };

export type LabReportSection = {
  title: string;
  rows?: LabReportRow[];
  /** Prose lines — assumptions, a laboratory instruction, a reading of the result. */
  lines?: string[];
  /** Formula or substitution lines, set in monospace. */
  formulas?: string[];
  table?: { columns: string[]; rows: string[][] };
};

/**
 * One laboratory calculation, described once and rendered three ways: on
 * screen, as plain text for the clipboard, and as a PNG / printout for a lab
 * record. Keeping a single description is what stops the downloaded card from
 * drifting out of step with what the student saw.
 */
export type LabReportData = {
  title: string;
  /** e.g. "Chemistry / Preparation Lab". */
  context?: string;
  /** Optional sample / experiment name entered by the student. */
  sample?: string;
  result: { label: string; value: string; unit?: string };
  sections: LabReportSection[];
  warnings?: string[];
  notes?: string[];
  /**
   * A chart to include in the PNG and printout. The markup must be
   * self-contained: literal colours, no CSS variables — an SVG drawn into an
   * <img> cannot see the page's stylesheet.
   */
  figure?: { svg: string; width: number; height: number; caption?: string };
};

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* ─── On-screen card ─────────────────────────────────────────────────────── */

export function LabReport({ data, className }: { data: LabReportData; className?: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        aria-label={`${data.title} — laboratory calculation card`}
        className={cn("overflow-hidden rounded-[20px] border bg-card shadow-sm", className)}
      >
        <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-600 to-green-400 px-5 py-5 text-white sm:px-6">
          {/* A faint graph-paper grid: the card is a lab record, and should read as one. */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <div className="relative">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
              PharmaWallah Academia · Lab record
            </p>
            <h2 className="mt-1 text-lg font-bold leading-tight tracking-tight sm:text-xl">{data.title}</h2>
            {(data.context || data.sample) && (
              <p className="mt-0.5 text-sm text-white/85">
                {[data.context, data.sample && `Sample: ${data.sample}`].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </header>

        <div className="border-b bg-gradient-to-br from-blue-50/70 via-card to-green-50/60 px-5 py-5 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {data.result.label}
          </p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <span className="text-4xl font-extrabold leading-none tracking-tight tabular-nums text-foreground sm:text-5xl">
              {data.result.value}
            </span>
            {data.result.unit && (
              <span className="text-lg font-semibold text-blue-600">{data.result.unit}</span>
            )}
          </p>
        </div>

        {data.warnings && data.warnings.length > 0 && (
          <div className="space-y-2 px-5 pt-5 sm:px-6">
            {data.warnings.map((warning) => (
              <p
                key={warning}
                role="alert"
                className="flex gap-2.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-900"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span>{warning}</span>
              </p>
            ))}
          </div>
        )}

        <div className="divide-y">
          {data.sections.map((section, index) => (
            <div key={`${index}-${section.title}`} className="px-5 py-4 sm:px-6">
              <h3 className="flex items-baseline gap-2.5 text-[15px] font-semibold text-foreground">
                <span className="text-xs font-bold tabular-nums text-blue-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.title}
              </h3>

              <div className="mt-2 space-y-2 pl-0 sm:pl-7">
                {section.rows && section.rows.length > 0 && (
                  <div>
                    {section.rows.map((row, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="flex items-baseline justify-between gap-4 border-b border-dashed py-2 last:border-b-0"
                      >
                        <span className="text-sm text-muted-foreground">{row.label}</span>
                        <span className="text-right text-sm font-semibold tabular-nums text-foreground">
                          {row.value}
                          {row.unit && <span className="ml-1 font-normal text-muted-foreground">{row.unit}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {section.formulas?.map((formula, formulaIndex) => (
                  <p
                    key={formulaIndex}
                    className="overflow-x-auto whitespace-pre rounded-lg bg-muted px-3 py-2 font-mono text-[13px] leading-relaxed text-foreground"
                  >
                    {formula}
                  </p>
                ))}

                {section.table && (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full min-w-max border-collapse text-sm">
                      <thead className="bg-blue-50/80">
                        <tr>
                          {section.table.columns.map((column) => (
                            <th
                              key={column}
                              scope="col"
                              className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-foreground"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="whitespace-nowrap px-3 py-2 tabular-nums text-foreground">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {section.lines?.map((line, lineIndex) => (
                  <p key={lineIndex} className="text-sm leading-relaxed text-muted-foreground">
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {data.notes && data.notes.length > 0 && (
          <div className="space-y-1.5 border-t bg-muted/40 px-5 py-4 sm:px-6">
            {data.notes.map((note) => (
              <p key={note} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-green-500" />
                <span>{note}</span>
              </p>
            ))}
          </div>
        )}
      </motion.section>
    </MotionConfig>
  );
}

/* ─── Actions ────────────────────────────────────────────────────────────── */

/**
 * Calculate / Reset / Copy / Download / Print.
 *
 * Download and Print are hidden inside the Android app rather than shown and
 * broken: the WebView ignores `<a download>` on a blob URL and has no print
 * dialog without a native plugin. Copy works in both.
 */
export function LabActions({
  report,
  onCalculate,
  onReset,
  fileName,
  className,
  children,
}: {
  report: LabReportData | null;
  onCalculate?: () => void;
  onReset: () => void;
  /** Without extension. Defaults to a slug of the report title. */
  fileName?: string;
  className?: string;
  /** Extra actions, e.g. "Use for percentage yield" or "Save calculation". */
  children?: React.ReactNode;
}) {
  const [status, setStatus] = useState<string>("");

  const flash = (message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 2200);
  };

  const name = fileName ?? slugify(report?.title ?? "lab-result");

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {onCalculate && (
          <Button onClick={onCalculate} className="col-span-2 bg-blue-600 hover:bg-blue-700 sm:col-span-1">
            <Calculator />
            Calculate
          </Button>
        )}
        <Button variant="outline" onClick={onReset}>
          <RefreshCw />
          Reset
        </Button>
        <Button
          variant="outline"
          disabled={!report}
          onClick={async () => {
            if (!report) return;
            const ok = await copyText(reportToText(report));
            flash(ok ? "Result copied to the clipboard." : "Copy failed — select the card text instead.");
          }}
        >
          {status.startsWith("Result copied") ? <Check /> : <Copy />}
          Copy
        </Button>
        {!IS_MOBILE_APP && (
          <>
            <Button
              variant="outline"
              disabled={!report}
              onClick={async () => {
                if (!report) return;
                try {
                  await downloadReportPng(report, name);
                  flash("Result card downloaded.");
                } catch {
                  flash("The card could not be drawn. Try Print instead.");
                }
              }}
            >
              <Download />
              Download card
            </Button>
            <Button variant="outline" disabled={!report} onClick={() => report && printReport(report)}>
              <Printer />
              Print
            </Button>
          </>
        )}
        {children}
      </div>
      <p aria-live="polite" className="min-h-[1rem] text-xs text-muted-foreground">
        {status}
      </p>
    </div>
  );
}

/* ─── Plain text ─────────────────────────────────────────────────────────── */

export function reportToText(data: LabReportData): string {
  const out: string[] = [];
  out.push(`PharmaWallah Academia — ${data.title}`);
  if (data.context) out.push(data.context);
  if (data.sample) out.push(`Sample: ${data.sample}`);
  out.push(`Date: ${new Date().toLocaleString()}`);
  out.push("");
  out.push(`${data.result.label}: ${data.result.value}${data.result.unit ? ` ${data.result.unit}` : ""}`);

  data.warnings?.forEach((warning) => out.push(`WARNING: ${warning}`));

  data.sections.forEach((section, index) => {
    out.push("");
    out.push(`${index + 1}. ${section.title}`);
    section.rows?.forEach((row) => out.push(`   ${row.label}: ${row.value}${row.unit ? ` ${row.unit}` : ""}`));
    section.formulas?.forEach((formula) => out.push(`   ${formula}`));
    if (section.table) {
      out.push(`   ${section.table.columns.join(" | ")}`);
      section.table.rows.forEach((row) => out.push(`   ${row.join(" | ")}`));
    }
    section.lines?.forEach((line) => out.push(`   ${line}`));
  });

  if (data.notes?.length) {
    out.push("");
    out.push("Notes");
    data.notes.forEach((note) => out.push(`   - ${note}`));
  }
  return out.join("\n");
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API is unavailable on plain http and in some WebViews.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "lab-result";
}

/* ─── PNG ────────────────────────────────────────────────────────────────── */

const CARD_WIDTH = 900;
const PAD = 44;
const INK = "#0F172A";
const MUTED = "#64748B";
const RULE = "#E2E8F0";
const BLUE = "#2563EB";
const GREEN = "#4ADE80";

/**
 * Draws the report onto a canvas directly rather than screenshotting the DOM.
 * A screenshot library would add a dependency to the APK bundle and inherits
 * every quirk of the page it captures; drawing from the data is deterministic
 * and always the same width, which is what a lab record wants.
 */
export async function downloadReportPng(data: LabReportData, fileName: string): Promise<void> {
  const figure = data.figure ? await loadSvg(data.figure.svg) : null;
  const scale = 2;

  // Pass 1 measures, pass 2 paints — text wrapping decides the height.
  const measureCanvas = document.createElement("canvas");
  const height = paintReport(measureCanvas.getContext("2d")!, data, figure, false);

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH * scale;
  canvas.height = Math.ceil(height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);
  paintReport(ctx, data, figure, true);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Canvas export failed");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

function paintReport(
  ctx: CanvasRenderingContext2D,
  data: LabReportData,
  figure: HTMLImageElement | null,
  draw: boolean,
): number {
  const sans = getComputedStyle(document.body).fontFamily || "sans-serif";
  const mono = "ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace";
  const inner = CARD_WIDTH - PAD * 2;
  let y = 0;

  const font = (size: number, weight = 400, family = sans) => {
    ctx.font = `${weight} ${size}px ${family}`;
  };
  const text = (value: string, x: number, baseline: number, color: string, align: CanvasTextAlign = "left") => {
    if (!draw) return;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(value, x, baseline);
  };
  const wrap = (value: string, width: number): string[] => {
    const lines: string[] = [];
    for (const paragraph of value.split("\n")) {
      let line = "";
      for (const word of paragraph.split(/(\s+)/)) {
        const candidate = line + word;
        if (ctx.measureText(candidate).width > width && line.trim() !== "") {
          lines.push(line.trimEnd());
          line = word.trimStart();
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }
    return lines;
  };
  const box = (x: number, top: number, w: number, h: number, r: number, fill: string, stroke?: string) => {
    if (!draw) return;
    ctx.beginPath();
    ctx.moveTo(x + r, top);
    ctx.arcTo(x + w, top, x + w, top + h, r);
    ctx.arcTo(x + w, top + h, x, top + h, r);
    ctx.arcTo(x, top + h, x, top, r);
    ctx.arcTo(x, top, x + w, top, r);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };
  const rule = (top: number, dashed = false) => {
    if (!draw) return;
    ctx.beginPath();
    ctx.setLineDash(dashed ? [4, 4] : []);
    ctx.strokeStyle = RULE;
    ctx.lineWidth = 1;
    // Dashed rules separate rows, which are indented under the section number.
    ctx.moveTo(dashed ? PAD + 30 : PAD, top + 0.5);
    ctx.lineTo(CARD_WIDTH - PAD, top + 0.5);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Header band
  const headerHeight = 124;
  if (draw) {
    ctx.fillStyle = "#FAFAF9";
    ctx.fillRect(0, 0, CARD_WIDTH, 100000);
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0);
    gradient.addColorStop(0, BLUE);
    gradient.addColorStop(0.55, BLUE);
    gradient.addColorStop(1, GREEN);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_WIDTH, headerHeight);
  }
  font(12, 700);
  text("PHARMAWALLAH ACADEMIA  ·  LAB RECORD", PAD, 38, "rgba(255,255,255,0.85)");
  font(28, 800);
  text(data.title, PAD, 76, "#FFFFFF");
  font(14, 500);
  const meta = [data.context, data.sample && `Sample: ${data.sample}`].filter(Boolean).join("  ·  ");
  if (meta) text(meta, PAD, 102, "rgba(255,255,255,0.9)");
  font(13, 500);
  text(new Date().toLocaleString(), CARD_WIDTH - PAD, 38, "rgba(255,255,255,0.9)", "right");
  y = headerHeight + 36;

  // Result
  font(12, 700);
  text(data.result.label.toUpperCase(), PAD, y, MUTED);
  y += 50;
  font(46, 800);
  text(data.result.value, PAD, y, INK);
  if (data.result.unit) {
    const valueWidth = ctx.measureText(data.result.value).width;
    font(22, 600);
    text(data.result.unit, PAD + valueWidth + 12, y, BLUE);
  }
  y += 28;

  // Warnings
  if (data.warnings?.length) {
    font(14, 500);
    for (const warning of data.warnings) {
      const lines = wrap(warning, inner - 32);
      const h = lines.length * 21 + 22;
      box(PAD, y, inner, h, 10, "#FFFBEB", "#F59E0B");
      lines.forEach((line, i) => text(line, PAD + 16, y + 26 + i * 21, "#92400E"));
      y += h + 10;
    }
    y += 6;
  }

  // Sections
  data.sections.forEach((section, index) => {
    rule(y);
    y += 32;
    font(12, 800);
    text(String(index + 1).padStart(2, "0"), PAD, y, BLUE);
    font(17, 700);
    text(section.title, PAD + 30, y, INK);
    y += 14;

    section.rows?.forEach((row, rowIndex) => {
      font(14, 400);
      const labelLines = wrap(row.label, inner * 0.55);
      const lineCount = labelLines.length;
      const top = y + 22;
      labelLines.forEach((line, i) => text(line, PAD + 30, top + i * 20, MUTED));
      font(14, 700);
      const value = row.unit ? `${row.value} ${row.unit}` : row.value;
      text(value, CARD_WIDTH - PAD, top, INK, "right");
      y += lineCount * 20 + 14;
      if (rowIndex < (section.rows?.length ?? 0) - 1) rule(y - 4, true);
    });

    section.formulas?.forEach((formula) => {
      font(14, 500, mono);
      const lines = wrap(formula, inner - 30 - 28);
      const h = lines.length * 21 + 18;
      y += 10;
      box(PAD + 30, y, inner - 30, h, 8, "#F1F5F9");
      lines.forEach((line, i) => text(line, PAD + 44, y + 24 + i * 21, INK));
      y += h;
    });

    if (section.table) {
      y += 12;
      const { columns, rows } = section.table;
      const available = inner - 30;
      let size = 13;
      let widths: number[] = [];
      // Shrink the type until the widest cells fit; never below 9px.
      const measureColumns = (fontSize: number) =>
        columns.map((column, c) => {
          font(fontSize, 700);
          let widest = ctx.measureText(column).width;
          font(fontSize, 400);
          for (const row of rows) widest = Math.max(widest, ctx.measureText(row[c] ?? "").width);
          return widest + 20;
        });
      for (; size >= 9; size -= 1) {
        widths = measureColumns(size);
        if (widths.reduce((a, b) => a + b, 0) <= available || size === 9) break;
      }
      const total = widths.reduce((a, b) => a + b, 0);
      const stretch = total < available ? available / total : 1;
      widths = widths.map((w) => w * stretch);
      const rowHeight = size + 16;

      box(PAD + 30, y, available, rowHeight, 6, "#EFF6FF");
      let x = PAD + 30;
      font(size, 700);
      columns.forEach((column, c) => {
        text(column, x + 10, y + rowHeight / 2 + size / 2.8, INK);
        x += widths[c];
      });
      y += rowHeight;
      rows.forEach((row) => {
        x = PAD + 30;
        font(size, 400);
        row.forEach((cell, c) => {
          text(cell, x + 10, y + rowHeight / 2 + size / 2.8, INK);
          x += widths[c];
        });
        if (draw) {
          ctx.strokeStyle = RULE;
          ctx.beginPath();
          ctx.moveTo(PAD + 30, y + 0.5);
          ctx.lineTo(PAD + 30 + available, y + 0.5);
          ctx.stroke();
        }
        y += rowHeight;
      });
    }

    section.lines?.forEach((line) => {
      font(14, 400);
      const lines = wrap(line, inner - 30);
      y += 8;
      lines.forEach((part) => {
        y += 20;
        text(part, PAD + 30, y, MUTED);
      });
    });

    y += 18;
  });

  // Figure
  if (data.figure && figure) {
    rule(y);
    y += 20;
    const width = inner;
    const height = (data.figure.height / data.figure.width) * width;
    if (draw) {
      box(PAD, y, width, height, 10, "#FFFFFF", RULE);
      ctx.drawImage(figure, PAD, y, width, height);
    }
    y += height + 8;
    if (data.figure.caption) {
      font(13, 500);
      y += 16;
      text(data.figure.caption, PAD, y, MUTED);
    }
    y += 16;
  }

  // Notes
  if (data.notes?.length) {
    rule(y);
    y += 8;
    font(13, 400);
    data.notes.forEach((note) => {
      wrap(note, inner - 16).forEach((line, i) => {
        y += 19;
        if (i === 0 && draw) {
          ctx.fillStyle = "#22C55E";
          ctx.beginPath();
          ctx.arc(PAD + 3, y - 4.5, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        text(line, PAD + 16, y, MUTED);
      });
    });
    y += 16;
  }

  // Footer
  rule(y);
  y += 30;
  font(12, 500);
  text("Generated with PharmaWallah Academia · pharmawallah.com", PAD, y, MUTED);
  text("Educational use — verify against your laboratory manual", CARD_WIDTH - PAD, y, MUTED, "right");
  return y + 28;
}

/* ─── Print ──────────────────────────────────────────────────────────────── */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Prints a clean, black-on-white record through a hidden iframe, so the site
 * header, ads and the input form never end up on the page a student files.
 * Every user-entered string is escaped; only the chart SVG (generated by the
 * page itself) is inserted as markup.
 */
export function printReport(data: LabReportData): void {
  const e = escapeHtml;
  const sections = data.sections
    .map((section, index) => {
      const rows = (section.rows ?? [])
        .map((row) => `<tr><td>${e(row.label)}</td><td class="v">${e(row.value)}${row.unit ? ` ${e(row.unit)}` : ""}</td></tr>`)
        .join("");
      const formulas = (section.formulas ?? []).map((f) => `<pre>${e(f)}</pre>`).join("");
      const table = section.table
        ? `<table class="grid"><thead><tr>${section.table.columns.map((c) => `<th>${e(c)}</th>`).join("")}</tr></thead><tbody>${section.table.rows
            .map((row) => `<tr>${row.map((cell) => `<td>${e(cell)}</td>`).join("")}</tr>`)
            .join("")}</tbody></table>`
        : "";
      const lines = (section.lines ?? []).map((line) => `<p>${e(line)}</p>`).join("");
      return `<section><h3><span>${String(index + 1).padStart(2, "0")}</span>${e(section.title)}</h3>${
        rows ? `<table class="rows">${rows}</table>` : ""
      }${formulas}${table}${lines}</section>`;
    })
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${e(data.title)}</title><style>
    @page { margin: 16mm; }
    body { font-family: ${getComputedStyle(document.body).fontFamily || "sans-serif"}; color: #0f172a; margin: 0; }
    .band { border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-bottom: 14px; }
    .eyebrow { font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: #2563eb; font-weight: 700; }
    h1 { font-size: 22px; margin: 4px 0 2px; }
    .meta { font-size: 12px; color: #475569; }
    .result { font-size: 12px; text-transform: uppercase; letter-spacing: .12em; color: #475569; margin-top: 8px; }
    .value { font-size: 34px; font-weight: 800; margin: 2px 0 10px; }
    .value small { font-size: 16px; color: #2563eb; margin-left: 6px; }
    .warn { border: 1px solid #f59e0b; background: #fffbeb; color: #92400e; padding: 8px 10px; border-radius: 6px; font-size: 12px; margin: 6px 0; }
    section { border-top: 1px solid #e2e8f0; padding: 8px 0; break-inside: avoid; }
    h3 { font-size: 14px; margin: 2px 0 6px; } h3 span { color: #2563eb; font-size: 11px; margin-right: 8px; }
    table { border-collapse: collapse; width: 100%; font-size: 12px; }
    .rows td { padding: 3px 0; border-bottom: 1px dashed #e2e8f0; } .rows td.v { text-align: right; font-weight: 600; }
    .grid th, .grid td { border: 1px solid #cbd5e1; padding: 4px 6px; text-align: left; } .grid th { background: #eff6ff; }
    pre { background: #f1f5f9; padding: 6px 8px; border-radius: 4px; font-size: 12px; white-space: pre-wrap; margin: 4px 0; }
    p { font-size: 12px; color: #334155; margin: 4px 0; }
    figure { margin: 10px 0; } figure svg { width: 100%; height: auto; } figcaption { font-size: 11px; color: #475569; }
    footer { border-top: 1px solid #e2e8f0; margin-top: 10px; padding-top: 6px; font-size: 10px; color: #64748b; }
  </style></head><body>
    <div class="band"><div class="eyebrow">PharmaWallah Academia · Lab record</div><h1>${e(data.title)}</h1>
    <div class="meta">${[data.context, data.sample && `Sample: ${data.sample}`, new Date().toLocaleString()]
      .filter(Boolean)
      .map((part) => e(String(part)))
      .join(" · ")}</div></div>
    <div class="result">${e(data.result.label)}</div>
    <div class="value">${e(data.result.value)}${data.result.unit ? `<small>${e(data.result.unit)}</small>` : ""}</div>
    ${(data.warnings ?? []).map((w) => `<div class="warn">${e(w)}</div>`).join("")}
    ${sections}
    ${data.figure ? `<figure>${data.figure.svg}${data.figure.caption ? `<figcaption>${e(data.figure.caption)}</figcaption>` : ""}</figure>` : ""}
    ${(data.notes ?? []).map((n) => `<p>• ${e(n)}</p>`).join("")}
    <footer>Generated with PharmaWallah Academia · pharmawallah.com · Educational use — verify against your laboratory manual.</footer>
  </body></html>`;

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  if (!doc || !frame.contentWindow) {
    frame.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  const win = frame.contentWindow;
  // Give the webfont a moment so the printout is not in the fallback face.
  window.setTimeout(() => {
    win.focus();
    win.print();
    window.setTimeout(() => frame.remove(), 1000);
  }, 250);
}
