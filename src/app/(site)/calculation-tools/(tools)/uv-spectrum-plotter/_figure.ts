/**
 * Self-contained SVG figures for the UV-Vis Spectrum Plotter, plus the PNG and
 * CSV download helpers.
 *
 * Why the figure is drawn from the data instead of cloning Recharts' <svg>:
 * the same markup has to work in three places — the lab card PNG (drawn into
 * an <img>, which cannot see the page's CSS), the printout iframe, and the
 * chart PNG download. Recharts' output leans on classes, inherited fonts and
 * interaction layers (tooltip cursor, active dot) that do not survive that
 * trip. Drawing from the numbers gives literal colours, an explicit
 * font-family, and exactly the same axes and curve every time.
 */

import { formatSig } from "@/components/calculators";
import { calibrationXDomain, niceTicks, tickDecimals, valueDomain, type Peak, type Point, type Regression } from "./_math";

export const FIGURE_WIDTH = 720;
export const FIGURE_HEIGHT = 420;

const INK = "#0F172A";
const MUTED = "#64748B";
const GRID = "#E2E8F0";
const BLUE = "#2563EB";
const BLUE_DARK = "#1D4ED8";
const GREEN = "#16A34A";
const GREEN_LIGHT = "#4ADE80";
const AMBER = "#D97706";

const MARGIN = { top: 28, right: 24, bottom: 56, left: 70 };

export type CurveKind = "linear" | "monotone";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const r2 = (value: number) => Math.round(value * 100) / 100;

type Frame = {
  sx: (x: number) => number;
  sy: (y: number) => number;
  body: string[];
};

function frame(
  xDomain: [number, number],
  yDomain: [number, number],
  xLabel: string,
  yLabel: string,
): Frame {
  const plotW = FIGURE_WIDTH - MARGIN.left - MARGIN.right;
  const plotH = FIGURE_HEIGHT - MARGIN.top - MARGIN.bottom;
  const xSpan = xDomain[1] - xDomain[0] || 1;
  const ySpan = yDomain[1] - yDomain[0] || 1;
  const sx = (x: number) => r2(MARGIN.left + ((x - xDomain[0]) / xSpan) * plotW);
  const sy = (y: number) => r2(MARGIN.top + plotH - ((y - yDomain[0]) / ySpan) * plotH);

  const body: string[] = [];
  const xTicks = niceTicks(xDomain[0], xDomain[1], 7);
  const yTicks = niceTicks(yDomain[0], yDomain[1], 5);
  const xDec = tickDecimals(xTicks);
  const yDec = tickDecimals(yTicks);

  body.push(`<rect x="0" y="0" width="${FIGURE_WIDTH}" height="${FIGURE_HEIGHT}" fill="#FFFFFF"/>`);
  yTicks.forEach((tick) => {
    const y = sy(tick);
    body.push(`<line x1="${MARGIN.left}" y1="${y}" x2="${FIGURE_WIDTH - MARGIN.right}" y2="${y}" stroke="${GRID}" stroke-width="1"/>`);
    body.push(`<text x="${MARGIN.left - 8}" y="${y + 4}" text-anchor="end" font-size="12" fill="${MUTED}" font-family="sans-serif">${tick.toFixed(yDec)}</text>`);
  });
  xTicks.forEach((tick) => {
    const x = sx(tick);
    body.push(`<line x1="${x}" y1="${MARGIN.top}" x2="${x}" y2="${FIGURE_HEIGHT - MARGIN.bottom}" stroke="${GRID}" stroke-width="1" stroke-dasharray="3 3"/>`);
    body.push(`<text x="${x}" y="${FIGURE_HEIGHT - MARGIN.bottom + 20}" text-anchor="middle" font-size="12" fill="${MUTED}" font-family="sans-serif">${tick.toFixed(xDec)}</text>`);
  });
  // Axes
  body.push(`<line x1="${MARGIN.left}" y1="${FIGURE_HEIGHT - MARGIN.bottom}" x2="${FIGURE_WIDTH - MARGIN.right}" y2="${FIGURE_HEIGHT - MARGIN.bottom}" stroke="${MUTED}" stroke-width="1.2"/>`);
  body.push(`<line x1="${MARGIN.left}" y1="${MARGIN.top}" x2="${MARGIN.left}" y2="${FIGURE_HEIGHT - MARGIN.bottom}" stroke="${MUTED}" stroke-width="1.2"/>`);
  body.push(`<text x="${MARGIN.left + plotW / 2}" y="${FIGURE_HEIGHT - 14}" text-anchor="middle" font-size="13" font-weight="600" fill="${INK}" font-family="sans-serif">${escapeXml(xLabel)}</text>`);
  body.push(`<text x="18" y="${MARGIN.top + plotH / 2}" text-anchor="middle" font-size="13" font-weight="600" fill="${INK}" font-family="sans-serif" transform="rotate(-90 18 ${MARGIN.top + plotH / 2})">${escapeXml(yLabel)}</text>`);

  return { sx, sy, body };
}

function wrap(body: string[], clipId: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${FIGURE_WIDTH}" height="${FIGURE_HEIGHT}" viewBox="0 0 ${FIGURE_WIDTH} ${FIGURE_HEIGHT}" font-family="sans-serif">` +
    `<defs><clipPath id="${clipId}"><rect x="${MARGIN.left}" y="${MARGIN.top - 4}" width="${FIGURE_WIDTH - MARGIN.left - MARGIN.right}" height="${FIGURE_HEIGHT - MARGIN.top - MARGIN.bottom + 8}"/></clipPath></defs>` +
    body.join("") +
    `</svg>`
  );
}

/**
 * Monotone cubic path in pixel space — the same algorithm as d3's
 * curveMonotoneX, which is what Recharts' `type="monotone"` uses, so the
 * figure matches the on-screen chart. Tangents are limited so the curve never
 * rises above or dips below the neighbouring readings (Steffen, 1990).
 */
export function monotonePath(px: { x: number; y: number }[]): string {
  const n = px.length;
  if (n < 3) return linearPath(px);
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = px[i + 1].x - px[i].x;
    slopes.push(h === 0 ? 0 : (px[i + 1].y - px[i].y) / h);
  }
  const tangents: number[] = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const h0 = px[i].x - px[i - 1].x;
    const h1 = px[i + 1].x - px[i].x;
    const s0 = slopes[i - 1];
    const s1 = slopes[i];
    const p = h0 + h1 === 0 ? 0 : (s0 * h1 + s1 * h0) / (h0 + h1);
    tangents[i] = (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
  }
  tangents[0] = (3 * slopes[0] - tangents[1]) / 2;
  tangents[n - 1] = (3 * slopes[n - 2] - tangents[n - 2]) / 2;

  let d = `M${r2(px[0].x)},${r2(px[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = (px[i + 1].x - px[i].x) / 3;
    d += `C${r2(px[i].x + dx)},${r2(px[i].y + dx * tangents[i])},${r2(px[i + 1].x - dx)},${r2(px[i + 1].y - dx * tangents[i + 1])},${r2(px[i + 1].x)},${r2(px[i + 1].y)}`;
  }
  return d;
}

function linearPath(px: { x: number; y: number }[]): string {
  return px.map((p, i) => `${i === 0 ? "M" : "L"}${r2(p.x)},${r2(p.y)}`).join("");
}

/* ─── Spectrum figure ────────────────────────────────────────────────────── */

export function spectrumSvg({
  points,
  xDomain,
  lambdaMax,
  peaks,
  curve,
}: {
  /** Sorted readings inside the window being drawn. */
  points: Point[];
  xDomain: [number, number];
  lambdaMax: Point[];
  peaks: Peak[];
  curve: CurveKind;
}): string {
  const yDomain = valueDomain(points.map((p) => p.y));
  const f = frame(xDomain, yDomain, "Wavelength (nm)", "Absorbance (AU)");
  const px = points.map((p) => ({ x: f.sx(p.x), y: f.sy(p.y) }));
  // Duplicate wavelengths make a smoothed curve meaningless; fall back to segments.
  const hasDuplicates = points.some((p, i) => i > 0 && p.x === points[i - 1].x);
  const d = curve === "monotone" && !hasDuplicates ? monotonePath(px) : linearPath(px);

  f.body.push(`<g clip-path="url(#uv-plot)">`);
  f.body.push(`<path d="${d}" fill="none" stroke="${BLUE}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`);
  px.forEach((p) => f.body.push(`<circle cx="${p.x}" cy="${p.y}" r="2.8" fill="${BLUE}"/>`));
  peaks.forEach((peak) => {
    // The λmax ring already marks that reading; a second marker would collide with its label.
    if (lambdaMax.some((point) => point.x === peak.point.x)) return;
    const x = f.sx(peak.point.x);
    const y = f.sy(peak.point.y);
    f.body.push(`<path d="M${x},${r2(y - 9)}L${r2(x - 5)},${r2(y - 16)}L${r2(x + 5)},${r2(y - 16)}Z" fill="${GREEN}"/>`);
  });
  f.body.push(`</g>`);

  lambdaMax.forEach((point, index) => {
    const x = f.sx(point.x);
    const y = f.sy(point.y);
    if (x < MARGIN.left - 1 || x > FIGURE_WIDTH - MARGIN.right + 1) return;
    f.body.push(`<line x1="${x}" y1="${y}" x2="${x}" y2="${FIGURE_HEIGHT - MARGIN.bottom}" stroke="${BLUE_DARK}" stroke-width="1" stroke-dasharray="4 3"/>`);
    f.body.push(`<circle cx="${x}" cy="${y}" r="6.5" fill="#FFFFFF" stroke="${BLUE_DARK}" stroke-width="2.2"/>`);
    f.body.push(`<circle cx="${x}" cy="${y}" r="2.6" fill="${GREEN_LIGHT}"/>`);
    // Only the first tie gets a text label, so several tied points do not overprint.
    if (index === 0) {
      const anchor = x > FIGURE_WIDTH - 140 ? "end" : x < MARGIN.left + 70 ? "start" : "middle";
      const label = `λmax ${point.xRaw} nm${lambdaMax.length > 1 ? ` (+${lambdaMax.length - 1} tied)` : ""}`;
      f.body.push(`<text x="${x}" y="${r2(y - 22)}" text-anchor="${anchor}" font-size="13" font-weight="700" fill="${BLUE_DARK}" font-family="sans-serif">${escapeXml(label)}</text>`);
    }
  });

  return wrap(f.body, "uv-plot");
}

/* ─── Calibration figure ─────────────────────────────────────────────────── */

export type UnknownPoint = { label: string; c: number; a: number };

export function calibrationSvg({
  points,
  fit,
  unknowns,
  unitLabel,
  equation,
}: {
  points: Point[];
  fit: Regression | null;
  unknowns: UnknownPoint[];
  unitLabel: string;
  equation: string | null;
}): string {
  const xs = points.map((p) => p.x).concat(unknowns.map((u) => u.c));
  const ys = points.map((p) => p.y).concat(unknowns.map((u) => u.a));
  if (fit) ys.push(fit.slope * fit.xMin + fit.intercept, fit.slope * fit.xMax + fit.intercept);
  const xDomain = calibrationXDomain(xs);
  const yDomain = valueDomain(ys);
  const f = frame(xDomain, yDomain, `Concentration (${unitLabel})`, "Absorbance (AU)");

  f.body.push(`<g clip-path="url(#uv-cal)">`);
  if (fit) {
    const lineAt = (c: number) => ({ x: f.sx(c), y: f.sy(fit.slope * c + fit.intercept) });
    const a = lineAt(fit.xMin);
    const b = lineAt(fit.xMax);
    // Dashed where the line is extended past the standards to reach an unknown.
    const lo = Math.min(fit.xMin, ...unknowns.map((u) => u.c));
    const hi = Math.max(fit.xMax, ...unknowns.map((u) => u.c));
    if (lo < fit.xMin) {
      const e = lineAt(lo);
      f.body.push(`<line x1="${e.x}" y1="${e.y}" x2="${a.x}" y2="${a.y}" stroke="${GREEN}" stroke-width="1.6" stroke-dasharray="5 4"/>`);
    }
    if (hi > fit.xMax) {
      const e = lineAt(hi);
      f.body.push(`<line x1="${b.x}" y1="${b.y}" x2="${e.x}" y2="${e.y}" stroke="${GREEN}" stroke-width="1.6" stroke-dasharray="5 4"/>`);
    }
    f.body.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${GREEN}" stroke-width="2.4" stroke-linecap="round"/>`);
  }
  points.forEach((p) => {
    f.body.push(`<circle cx="${f.sx(p.x)}" cy="${f.sy(p.y)}" r="5" fill="${BLUE}" stroke="#FFFFFF" stroke-width="1.5"/>`);
  });
  unknowns.forEach((u) => {
    const x = f.sx(u.c);
    const y = f.sy(u.a);
    f.body.push(`<path d="M${x},${r2(y - 8)}L${r2(x + 8)},${y}L${x},${r2(y + 8)}L${r2(x - 8)},${y}Z" fill="${AMBER}" stroke="#FFFFFF" stroke-width="1.5"/>`);
    f.body.push(`<text x="${r2(x + 11)}" y="${r2(y - 9)}" font-size="12" font-weight="600" fill="${AMBER}" font-family="sans-serif">${escapeXml(u.label)}</text>`);
  });
  f.body.push(`</g>`);

  if (equation) {
    f.body.push(`<rect x="${MARGIN.left + 10}" y="${MARGIN.top + 8}" width="${Math.min(420, 30 + equation.length * 7.4)}" height="${fit && fit.r2 !== null ? 44 : 26}" rx="6" fill="#FFFFFF" stroke="${GRID}"/>`);
    f.body.push(`<text x="${MARGIN.left + 20}" y="${MARGIN.top + 26}" font-size="13" font-weight="700" fill="${INK}" font-family="sans-serif">${escapeXml(equation)}</text>`);
    if (fit && fit.r2 !== null) {
      f.body.push(`<text x="${MARGIN.left + 20}" y="${MARGIN.top + 44}" font-size="12" fill="${MUTED}" font-family="sans-serif">R² = ${fit.r2.toFixed(4)} · n = ${fit.n}${fit.throughOrigin ? " · forced through origin" : ""}</text>`);
    }
  }

  return wrap(f.body, "uv-cal");
}

/* ─── Equation text ──────────────────────────────────────────────────────── */

export function equationText(fit: Regression): string {
  const slope = formatSig(fit.slope, 4);
  if (fit.throughOrigin || fit.intercept === 0) return `A = ${slope}c`;
  const sign = fit.intercept < 0 ? "−" : "+";
  return `A = ${slope}c ${sign} ${formatSig(Math.abs(fit.intercept), 4)}`;
}

/* ─── Downloads ──────────────────────────────────────────────────────────── */

export function slug(value: string, fallback: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || fallback;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Rasterises a self-contained SVG at 2× onto a white canvas, with a title line
 * above it, and downloads the PNG.
 */
export async function downloadSvgAsPng(svg: string, title: string, fileName: string): Promise<void> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  const scale = 2;
  const titleHeight = 44;
  const canvas = document.createElement("canvas");
  canvas.width = FIGURE_WIDTH * scale;
  canvas.height = (FIGURE_HEIGHT + titleHeight) * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, FIGURE_WIDTH, FIGURE_HEIGHT + titleHeight);
  ctx.fillStyle = INK;
  ctx.font = "600 16px sans-serif";
  ctx.textBaseline = "middle";
  let text = title;
  // Keep a long sample name inside the image rather than running off the edge.
  while (ctx.measureText(text).width > FIGURE_WIDTH - 40 && text.length > 4) text = `${text.slice(0, -2)}…`;
  ctx.fillText(text, 20, titleHeight / 2 + 4);
  ctx.drawImage(image, 0, titleHeight, FIGURE_WIDTH, FIGURE_HEIGHT);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG export failed");
  downloadBlob(blob, fileName);
}

/** One CSV comment line: strip line breaks so a pasted name cannot start a data row. */
export function csvComment(label: string, value: string): string {
  return `# ${label}: ${value.replace(/[\r\n]+/g, " ").trim() || "not recorded"}`;
}
