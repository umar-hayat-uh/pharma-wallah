import { createCanvas } from "../tlc/canvas";
import { formatDilution, formatPlain, formatScientific } from "./cfu";
import type { Circle, Colony } from "./types";

/**
 * Exports for the colony counter, drawn and written on the device. The
 * original image is never modified — the annotated copy is a new canvas.
 */

export type ExportSummary = {
  finalCount: number;
  autoCount: number;
  manualCount: number;
  removedCount: number;
  dilution: number | null;
  volumeMl: number | null;
  cfuPerMl: number | null;
  sample: string;
};

export function exportDate(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function annotatedFileName(date = new Date()): string {
  return `pharmawallah-colony-count-${exportDate(date)}`;
}

/** The plate with every active marker, its number, and a footer with the count (and CFU when valid). */
export function drawAnnotatedPlate(
  source: HTMLCanvasElement,
  colonies: Colony[],
  plate: Circle | null,
  summary: ExportSummary,
  maxDimension = 2400,
): HTMLCanvasElement {
  const scale = Math.min(1, maxDimension / Math.max(source.width, source.height));
  const w = Math.round(source.width * scale);
  const h = Math.round(source.height * scale);
  const unit = Math.max(1, Math.min(w, h) / 700);
  const footer = Math.round(64 * unit);
  const canvas = createCanvas(w, h + footer);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This device could not create an image canvas.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, w, h);

  if (plate) {
    ctx.save();
    ctx.setLineDash([8 * unit, 6 * unit]);
    ctx.lineWidth = 2 * unit;
    ctx.strokeStyle = "#4ade80";
    ctx.beginPath();
    ctx.arc(plate.x * scale, plate.y * scale, plate.r * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.font = `700 ${Math.round(10 * unit)}px Outfit, system-ui, sans-serif`;
  ctx.textBaseline = "alphabetic";
  colonies.forEach((c, index) => {
    const colour = c.source === "manual" ? "#16a34a" : "#2563eb";
    const x = c.box.x * scale - 2 * unit;
    const y = c.box.y * scale - 2 * unit;
    const bw = Math.max(6 * unit, c.box.width * scale) + 4 * unit;
    const bh = Math.max(6 * unit, c.box.height * scale) + 4 * unit;
    ctx.lineWidth = 2.5 * unit;
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.strokeRect(x, y, bw, bh);
    ctx.lineWidth = 1.5 * unit;
    ctx.strokeStyle = colour;
    ctx.strokeRect(x, y, bw, bh);
    const label = String(index + 1);
    const lw = ctx.measureText(label).width + 6 * unit;
    ctx.fillStyle = colour;
    ctx.fillRect(x, y - 13 * unit, lw, 13 * unit);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, x + 3 * unit, y - 3 * unit);
  });

  // Footer on the brand gradient.
  const gradient = ctx.createLinearGradient(0, h, canvas.width, canvas.height);
  gradient.addColorStop(0, "#2563eb");
  gradient.addColorStop(1, "#16a34a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, h, canvas.width, footer);
  ctx.fillStyle = "rgba(15,23,42,0.35)";
  ctx.fillRect(0, h, canvas.width, footer);
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(20 * unit)}px Outfit, system-ui, sans-serif`;
  const left = `Final verified count: ${summary.finalCount}`;
  ctx.fillText(left, 16 * unit, h + footer * 0.36);
  ctx.font = `500 ${Math.round(12 * unit)}px Outfit, system-ui, sans-serif`;
  const cfu =
    summary.cfuPerMl !== null && summary.dilution !== null && summary.volumeMl !== null
      ? `${formatScientific(summary.cfuPerMl)} CFU/mL · dilution ${formatDilution(summary.dilution)} · ${summary.volumeMl} mL plated · `
      : "";
  ctx.fillText(`${cfu}PharmaWallah Colony Counter · ${exportDate()} · verify counts visually`, 16 * unit, h + footer * 0.74);
  return canvas;
}

export function resultText(summary: ExportSummary): string {
  const lines = [
    "PharmaWallah",
    "Colony Counter & CFU Calculator",
    `Date: ${exportDate()}`,
    ...(summary.sample.trim() ? [`Sample: ${summary.sample.trim()}`] : []),
    "",
    "Final colony count:",
    String(summary.finalCount),
    `(automatically detected ${summary.autoCount}, manually added ${summary.manualCount}, removed ${summary.removedCount})`,
    "",
    "Dilution:",
    summary.dilution !== null ? formatDilution(summary.dilution) : "—",
    "",
    "Volume plated:",
    summary.volumeMl !== null ? `${summary.volumeMl} mL` : "—",
    "",
    "CFU/mL:",
    summary.cfuPerMl !== null ? `${formatScientific(summary.cfuPerMl)} (${formatPlain(summary.cfuPerMl)})` : "—",
    "",
    "Formula:",
    "CFU/mL = colonies ÷ (dilution × volume plated)",
    "",
    "Detection:",
    "Computer vision + manual verification",
    "",
    "Note:",
    "Automated colony detection is an estimate and should be visually verified.",
  ];
  return lines.join("\n");
}

/** Web only — the Android WebView ignores blob downloads (MEMORY gotcha 40). */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
