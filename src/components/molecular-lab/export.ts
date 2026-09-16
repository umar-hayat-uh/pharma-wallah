/*
 * Molecular Lab — export. Every format offered here is produced by code that
 * writes a complete, valid file:
 *   SVG / PNG  — the 2D drawing (drawing.ts), or the 3D view as PNG
 *   MOL        — V2000, 2D coordinates, hydrogens implicit (molfile.ts)
 *   SDF        — V2000 with the 3D coordinates and every hydrogen
 *   SMILES     — OpenChemLib's isomeric SMILES
 *   JSON       — the lab's own project file (re-openable)
 */

import { buildDrawing, drawingBounds, EXPORT_COLOR } from "./drawing";
import type { MolGraph } from "./graph";
import type { MolSource } from "./storage";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** A standalone SVG of the 2D structure. `scale` is pixels per bond. */
export function drawingSvg(g: MolGraph, opts: { scale?: number; showCarbons?: boolean; title?: string } = {}): string {
  const scale = opts.scale ?? 48;
  const d = buildDrawing(g, { showCarbons: opts.showCarbons });
  const b = drawingBounds(d) ?? { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  const pad = 0.6;
  const w = Math.ceil((b.maxX - b.minX + pad * 2) * scale);
  const h = Math.ceil((b.maxY - b.minY + pad * 2) * scale);
  const tx = (x: number) => ((x - b.minX + pad) * scale).toFixed(2);
  const ty = (y: number) => ((y - b.minY + pad) * scale).toFixed(2);
  const ink = EXPORT_COLOR.C;
  const stroke = (scale * 0.042).toFixed(2);
  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif">`);
  if (opts.title) out.push(`<title>${esc(opts.title)}</title>`);
  out.push(`<rect width="100%" height="100%" fill="#ffffff"/>`);
  out.push(`<g stroke="${ink}" stroke-width="${stroke}" stroke-linecap="round" fill="${ink}">`);
  for (const s of d.shapes) {
    if (s.kind === "line") {
      out.push(`<line x1="${tx(s.x1)}" y1="${ty(s.y1)}" x2="${tx(s.x2)}" y2="${ty(s.y2)}"${s.dashed ? ` stroke-dasharray="${(scale * 0.08).toFixed(1)} ${(scale * 0.07).toFixed(1)}"` : ""}/>`);
    } else {
      out.push(`<polygon points="${s.points.map(([x, y]) => `${tx(x)},${ty(y)}`).join(" ")}" stroke="none"/>`);
    }
  }
  out.push(`</g>`);
  const fs = scale * 0.42;
  for (const l of d.labels) {
    if (!l.visible) continue;
    const color = EXPORT_COLOR[l.el] ?? "#6B4FA0";
    const text = l.hBefore ? `${l.hText}${l.el}` : `${l.el}${l.hText}`;
    // Centre the element symbol on the atom; hydrogens extend to one side.
    const anchor = l.hText ? (l.hBefore ? "end" : "start") : "middle";
    const symbolHalf = fs * 0.34 * l.el.length;
    const x = l.hText ? (l.hBefore ? Number(tx(l.x)) + symbolHalf : Number(tx(l.x)) - symbolHalf) : Number(tx(l.x));
    out.push(`<text x="${x.toFixed(2)}" y="${(Number(ty(l.y)) + fs * 0.36).toFixed(2)}" font-size="${fs.toFixed(1)}" font-weight="600" text-anchor="${anchor}" fill="${color}">${esc(text)}${l.charge ? `<tspan dy="${(-fs * 0.45).toFixed(1)}" font-size="${(fs * 0.7).toFixed(1)}">${esc(l.charge)}</tspan>` : ""}</text>`);
  }
  out.push(`</svg>`);
  return out.join("\n");
}

export async function svgToPngBlob(svg: string, pixelRatio = 2): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("The drawing could not be rendered."));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(img.height * pixelRatio));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG export failed."))), "image/png"));
  } finally {
    URL.revokeObjectURL(url);
  }
}

export interface ProjectFile {
  format: "pharmawallah-molecular-lab";
  version: 1;
  name: string;
  source: MolSource | null;
  graph: MolGraph;
  exported: string;
}

export function projectJson(name: string, graph: MolGraph, source: MolSource | null): string {
  const file: ProjectFile = { format: "pharmawallah-molecular-lab", version: 1, name, source, graph, exported: new Date().toISOString() };
  return JSON.stringify(file, null, 2);
}

export function fileSafeName(name: string): string {
  return (name.trim() || "molecule").replace(/[^\w\-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "molecule";
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Some mobile browsers start the download asynchronously.
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function downloadText(text: string, filename: string, type: string): void {
  downloadBlob(new Blob([text], { type }), filename);
}
