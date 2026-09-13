/**
 * Self-contained SVG charts for the lab record's PNG card and printout.
 *
 * The on-screen graphs are Recharts, but a Recharts <svg> cannot be reused
 * there: the PNG painter draws the figure through an <img>, which sees no page
 * CSS (MEMORY.md gotcha 36). So the same series are drawn again here with
 * literal colours, an explicit font-family and an xmlns — from the same data,
 * so the card cannot disagree with the screen.
 */

import type { Point } from "./math";

export const FIGURE_WIDTH = 720;
export const FIGURE_HEIGHT = 420;

export type FigureSeries = {
  name: string;
  points: Point[];
  kind: "points" | "line" | "line-points";
  color: string;
  dashed?: boolean;
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);
}

/* ─── Axis scaling ───────────────────────────────────────────────────────── */

function niceStep(span: number, target: number): number {
  const raw = span / target;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / magnitude;
  const factor = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return factor * magnitude;
}

/**
 * A padded, round-numbered domain and its ticks. Shared with the Recharts
 * graphs so the screen and the printout use the same axis.
 */
export function niceAxis(
  values: number[],
  { includeZero = false, target = 6, integer = false }: { includeZero?: boolean; target?: number; integer?: boolean } = {},
): { domain: [number, number]; ticks: number[] } {
  const finite = values.filter((v) => Number.isFinite(v));
  let lo = finite.length ? Math.min(...finite) : 0;
  let hi = finite.length ? Math.max(...finite) : 1;
  if (includeZero) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  if (lo === hi) {
    const pad = lo === 0 ? 1 : Math.abs(lo) * 0.1;
    lo -= pad;
    hi += pad;
  }
  // Trial numbers and counts never want a 1.5 tick.
  const step = integer ? Math.max(1, Math.round(niceStep(hi - lo, target))) : niceStep(hi - lo, target);
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step * 1e-9; v += step) ticks.push(Number(v.toFixed(12)));
  return { domain: [ticks[0], ticks[ticks.length - 1]], ticks };
}

/** Tick label: enough decimals to tell neighbouring ticks apart, scientific for huge/tiny. */
export function tickLabel(value: number, ticks: number[]): string {
  const step = ticks.length > 1 ? Math.abs(ticks[1] - ticks[0]) : Math.abs(value) || 1;
  const maxAbs = Math.max(...ticks.map((t) => Math.abs(t)));
  if (maxAbs >= 1e5 || (maxAbs > 0 && maxAbs < 1e-3)) return value === 0 ? "0" : value.toExponential(1);
  const decimals = Math.max(0, Math.min(6, -Math.floor(Math.log10(step) + 1e-9)));
  return value.toFixed(decimals);
}

/* ─── SVG ────────────────────────────────────────────────────────────────── */

export function chartSvg({
  xLabel,
  yLabel,
  series,
  includeZeroY = false,
  integerX = false,
  referenceY,
}: {
  xLabel: string;
  yLabel: string;
  series: FigureSeries[];
  includeZeroY?: boolean;
  /** Whole-number x ticks, e.g. trial numbers. */
  integerX?: boolean;
  /** A horizontal reference line, e.g. 100% recovery. */
  referenceY?: { value: number; label: string };
}): string {
  const W = FIGURE_WIDTH;
  const H = FIGURE_HEIGHT;
  const m = { top: 24, right: 24, bottom: 62, left: 78 };
  const pw = W - m.left - m.right;
  const ph = H - m.top - m.bottom;
  const font = "Outfit, 'Segoe UI', Helvetica, Arial, sans-serif";

  const xs = series.flatMap((s) => s.points.map((p) => p.x));
  const ys = series.flatMap((s) => s.points.map((p) => p.y));
  if (referenceY) ys.push(referenceY.value);
  const xAxis = niceAxis(xs, { integer: integerX });
  const yAxis = niceAxis(ys, { includeZero: includeZeroY });

  const sx = (x: number) => m.left + ((x - xAxis.domain[0]) / (xAxis.domain[1] - xAxis.domain[0])) * pw;
  const sy = (y: number) => m.top + ph - ((y - yAxis.domain[0]) / (yAxis.domain[1] - yAxis.domain[0])) * ph;
  const f = (n: number) => n.toFixed(2);

  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${font}">`);
  out.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

  xAxis.ticks.forEach((t) => {
    out.push(`<line x1="${f(sx(t))}" y1="${m.top}" x2="${f(sx(t))}" y2="${m.top + ph}" stroke="#e2e8f0" stroke-dasharray="3 3"/>`);
    out.push(`<text x="${f(sx(t))}" y="${m.top + ph + 18}" font-size="11" fill="#64748b" text-anchor="middle">${escapeXml(tickLabel(t, xAxis.ticks))}</text>`);
  });
  yAxis.ticks.forEach((t) => {
    out.push(`<line x1="${m.left}" y1="${f(sy(t))}" x2="${m.left + pw}" y2="${f(sy(t))}" stroke="#e2e8f0" stroke-dasharray="3 3"/>`);
    out.push(`<text x="${m.left - 8}" y="${f(sy(t) + 4)}" font-size="11" fill="#64748b" text-anchor="end">${escapeXml(tickLabel(t, yAxis.ticks))}</text>`);
  });
  out.push(`<rect x="${m.left}" y="${m.top}" width="${pw}" height="${ph}" fill="none" stroke="#94a3b8"/>`);

  if (referenceY) {
    const y = f(sy(referenceY.value));
    out.push(`<line x1="${m.left}" y1="${y}" x2="${m.left + pw}" y2="${y}" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="6 4"/>`);
    out.push(`<text x="${m.left + pw - 4}" y="${Number(y) - 6}" font-size="11" fill="#15803d" text-anchor="end">${escapeXml(referenceY.label)}</text>`);
  }

  series.forEach((s) => {
    if (s.points.length === 0) return;
    if (s.kind !== "points" && s.points.length > 1) {
      const d = s.points.map((p, i) => `${i ? "L" : "M"}${f(sx(p.x))},${f(sy(p.y))}`).join(" ");
      out.push(`<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2.2"${s.dashed ? ' stroke-dasharray="6 4"' : ""}/>`);
    }
    if (s.kind !== "line") {
      s.points.forEach((p) => out.push(`<circle cx="${f(sx(p.x))}" cy="${f(sy(p.y))}" r="4.5" fill="${s.color}" stroke="#ffffff" stroke-width="1.5"/>`));
    }
  });

  out.push(`<text x="${m.left + pw / 2}" y="${H - 16}" font-size="13" fill="#0f172a" text-anchor="middle">${escapeXml(xLabel)}</text>`);
  out.push(`<text transform="translate(18 ${m.top + ph / 2}) rotate(-90)" font-size="13" fill="#0f172a" text-anchor="middle">${escapeXml(yLabel)}</text>`);

  // Legend, top-left inside the plot.
  let lx = m.left + 12;
  series.forEach((s) => {
    const w = 26 + s.name.length * 6.4;
    const ly = m.top + 16;
    if (s.kind === "points") out.push(`<circle cx="${lx + 6}" cy="${ly - 4}" r="4" fill="${s.color}"/>`);
    else out.push(`<line x1="${lx}" y1="${ly - 4}" x2="${lx + 14}" y2="${ly - 4}" stroke="${s.color}" stroke-width="2.2"${s.dashed ? ' stroke-dasharray="4 3"' : ""}/>`);
    out.push(`<text x="${lx + 20}" y="${ly}" font-size="11" fill="#334155">${escapeXml(s.name)}</text>`);
    lx += w;
  });

  out.push("</svg>");
  return out.join("");
}
