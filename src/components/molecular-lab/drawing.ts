/*
 * Molecular Lab — the 2D structure drawing, as plain shapes.
 *
 * One function turns the graph into lines, polygons and labels (in bond-length
 * units). The editor renders them as SVG elements; the exporter writes the
 * same shapes as an SVG file. So the exported picture is the one on screen.
 *
 * Conventions follow the skeletal formulae of the course notes: carbons are
 * vertices (optionally labelled), heteroatoms carry their hydrogens ("OH",
 * "H₂N"), ring double bonds sit inside the ring, wedges widen away from the
 * stereocentre.
 */

import { analyse, chargeLabel, type MolGraph, type MolReport } from "./graph";
import { findRings } from "./groups";

export interface Line {
  kind: "line";
  bond: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
}

export interface Poly {
  kind: "poly";
  bond: number;
  points: [number, number][];
}

export type BondShape = Line | Poly;

export interface AtomLabel {
  atom: number;
  x: number;
  y: number;
  el: string;
  /** Hydrogen text, e.g. "H" or "H₂"; placed before or after the symbol. */
  hText: string;
  hBefore: boolean;
  charge: string;
  visible: boolean;
  color: string;
  /** Unfilled or exceeded valence — drawn with a marker. */
  flag: "under" | "over" | null;
}

export interface Drawing {
  shapes: BondShape[];
  labels: AtomLabel[];
  report: MolReport;
}

/** Element colours for the drawing — Jmol hues, darkened to read on white and on navy. */
export const ELEMENT_COLOR: Record<string, string> = {
  C: "var(--ml-ink)",
  H: "var(--ml-ink-2)",
  N: "#2F5BEA",
  O: "#E0342B",
  F: "#1E9E4A",
  Cl: "#1E9E4A",
  Br: "#A5422A",
  I: "#7B3FA8",
  S: "#C28A00",
  P: "#E06A00",
  B: "#D9774A",
  Si: "#8A7B55",
};

/** Plain colours for exported files, where CSS variables do not exist. */
export const EXPORT_COLOR: Record<string, string> = { ...ELEMENT_COLOR, C: "#1A1F2B", H: "#4A5568" };

const SUB = "₀₁₂₃₄₅₆₇₈₉";
const sub = (n: number) => String(n).split("").map((d) => SUB[Number(d)]).join("");

export const LABEL_GAP = 0.3;

export function buildDrawing(g: MolGraph, opts: { showCarbons?: boolean; report?: MolReport } = {}): Drawing {
  const report = opts.report ?? analyse(g);
  const pos = new Map(g.atoms.map((a) => [a.id, a]));
  const degree = new Map<number, number>();
  for (const a of g.atoms) degree.set(a.id, 0);
  for (const b of g.bonds) {
    degree.set(b.a, (degree.get(b.a) ?? 0) + 1);
    degree.set(b.b, (degree.get(b.b) ?? 0) + 1);
  }

  // In a one- or two-atom fragment (methane, ethyne) a bare line means
  // nothing, so its carbons are written out.
  const tiny = (id: number) => {
    const d = degree.get(id) ?? 0;
    if (d !== 1) return d === 0;
    const bond = g.bonds.find((x) => x.a === id || x.b === id)!;
    return (degree.get(bond.a === id ? bond.b : bond.a) ?? 0) === 1;
  };

  const labels: AtomLabel[] = g.atoms.map((a) => {
    const r = report.atoms.get(a.id)!;
    const visible = a.el !== "C" || !!opts.showCarbons || a.charge !== 0 || tiny(a.id) || r.status === "over" || !r.hydrogensAuto;
    // Hydrogens go on the side away from the bonds.
    let sx = 0;
    for (const n of r.neighbours) sx += pos.get(n)!.x - a.x;
    const hBefore = r.neighbours.length > 0 && sx > 0.2;
    const hText = visible && r.hydrogens > 0 ? `H${r.hydrogens > 1 ? sub(r.hydrogens) : ""}` : "";
    return {
      atom: a.id,
      x: a.x,
      y: a.y,
      el: a.el,
      hText,
      hBefore,
      charge: chargeLabel(a.charge),
      visible,
      color: ELEMENT_COLOR[a.el] ?? "#6B4FA0",
      flag: r.status === "under" || r.status === "over" ? r.status : null,
    };
  });
  const labelled = new Set(labels.filter((l) => l.visible).map((l) => l.atom));

  // Ring centres, for putting inner double-bond lines on the right side.
  const rings = findRings(g, 8);
  const ringCentreForBond = new Map<number, { x: number; y: number; size: number }>();
  for (const ring of rings) {
    const cx = ring.reduce((s, id) => s + pos.get(id)!.x, 0) / ring.length;
    const cy = ring.reduce((s, id) => s + pos.get(id)!.y, 0) / ring.length;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i];
      const c = ring[(i + 1) % ring.length];
      const bond = g.bonds.find((b) => (b.a === a && b.b === c) || (b.a === c && b.b === a));
      if (!bond) continue;
      const prev = ringCentreForBond.get(bond.id);
      // Prefer the smaller ring (and, for fused bonds, the one drawn first).
      if (!prev || ring.length < prev.size) ringCentreForBond.set(bond.id, { x: cx, y: cy, size: ring.length });
    }
  }

  const shapes: BondShape[] = [];
  for (const b of g.bonds) {
    const A = pos.get(b.a)!;
    const B = pos.get(b.b)!;
    const len = Math.hypot(B.x - A.x, B.y - A.y);
    if (len < 1e-6) continue;
    const ux = (B.x - A.x) / len;
    const uy = (B.y - A.y) / len;
    const nx = -uy;
    const ny = ux;
    // Trim the ends that carry a label so the line stops short of the text.
    const ta = labelled.has(b.a) ? Math.min(LABEL_GAP, len * 0.35) : 0;
    const tb = labelled.has(b.b) ? Math.min(LABEL_GAP, len * 0.35) : 0;
    const x1 = A.x + ux * ta;
    const y1 = A.y + uy * ta;
    const x2 = B.x - ux * tb;
    const y2 = B.y - uy * tb;
    const order = b.order;

    if (order === 1 && b.stereo === "wedge") {
      const w = 0.13;
      shapes.push({ kind: "poly", bond: b.id, points: [[x1, y1], [x2 + nx * w, y2 + ny * w], [x2 - nx * w, y2 - ny * w]] });
      continue;
    }
    if (order === 1 && b.stereo === "hash") {
      const steps = 7;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const w = 0.02 + 0.12 * t;
        const cx = x1 + (x2 - x1) * t;
        const cy = y1 + (y2 - y1) * t;
        shapes.push({ kind: "line", bond: b.id, x1: cx + nx * w, y1: cy + ny * w, x2: cx - nx * w, y2: cy - ny * w });
      }
      continue;
    }
    if (order === 1) {
      shapes.push({ kind: "line", bond: b.id, x1, y1, x2, y2 });
      continue;
    }
    if (order === 3) {
      const d = 0.13;
      shapes.push({ kind: "line", bond: b.id, x1, y1, x2, y2 });
      shapes.push({ kind: "line", bond: b.id, x1: x1 + nx * d, y1: y1 + ny * d, x2: x2 + nx * d, y2: y2 + ny * d });
      shapes.push({ kind: "line", bond: b.id, x1: x1 - nx * d, y1: y1 - ny * d, x2: x2 - nx * d, y2: y2 - ny * d });
      continue;
    }

    // Double or aromatic.
    const ring = ringCentreForBond.get(b.id);
    const dashed = order === "ar";
    const d = 0.17;
    let side = 0;
    if (ring) {
      side = (ring.x - A.x) * nx + (ring.y - A.y) * ny > 0 ? 1 : -1;
    } else {
      const da = degree.get(b.a) ?? 0;
      const db = degree.get(b.b) ?? 0;
      if (da >= 2 && db >= 2) {
        // Offset towards the side with more substituents.
        let s = 0;
        for (const id of [b.a, b.b]) {
          for (const nb of g.bonds) {
            const other = nb.a === id ? nb.b : nb.b === id ? nb.a : null;
            if (other === null || other === b.a || other === b.b) continue;
            const o = pos.get(other)!;
            s += (o.x - A.x) * nx + (o.y - A.y) * ny;
          }
        }
        side = s >= 0 ? 1 : -1;
      }
    }
    if (side === 0) {
      // Centred pair (C=O, terminal C=C).
      const h = d / 2;
      shapes.push({ kind: "line", bond: b.id, x1: x1 + nx * h, y1: y1 + ny * h, x2: x2 + nx * h, y2: y2 + ny * h });
      shapes.push({ kind: "line", bond: b.id, x1: x1 - nx * h, y1: y1 - ny * h, x2: x2 - nx * h, y2: y2 - ny * h, dashed });
    } else {
      shapes.push({ kind: "line", bond: b.id, x1, y1, x2, y2 });
      // The inner line is shortened at unlabelled ends so it reads as a ring bond.
      const sa = labelled.has(b.a) ? 0 : 0.14;
      const sb = labelled.has(b.b) ? 0 : 0.14;
      shapes.push({
        kind: "line",
        bond: b.id,
        x1: x1 + ux * sa + nx * d * side,
        y1: y1 + uy * sa + ny * d * side,
        x2: x2 - ux * sb + nx * d * side,
        y2: y2 - uy * sb + ny * d * side,
        dashed,
      });
    }
  }

  return { shapes, labels, report };
}

/** The whole drawing's extent, including label room. */
export function drawingBounds(d: Drawing): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (!d.labels.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const l of d.labels) {
    minX = Math.min(minX, l.x - 0.5); maxX = Math.max(maxX, l.x + 0.5);
    minY = Math.min(minY, l.y - 0.5); maxY = Math.max(maxY, l.y + 0.5);
  }
  return { minX, minY, maxX, maxY };
}

// ─── HIT TESTING ────────────────────────────────────────────────────────────

export function hitAtom(g: MolGraph, x: number, y: number, radius: number): number | null {
  let best: number | null = null;
  let bestD = radius;
  for (const a of g.atoms) {
    const d = Math.hypot(a.x - x, a.y - y);
    if (d < bestD) {
      bestD = d;
      best = a.id;
    }
  }
  return best;
}

export function hitBond(g: MolGraph, x: number, y: number, radius: number): number | null {
  const pos = new Map(g.atoms.map((a) => [a.id, a]));
  let best: number | null = null;
  let bestD = radius;
  for (const b of g.bonds) {
    const A = pos.get(b.a)!;
    const B = pos.get(b.b)!;
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0.15, Math.min(0.85, ((x - A.x) * dx + (y - A.y) * dy) / len2));
    const d = Math.hypot(A.x + dx * t - x, A.y + dy * t - y);
    if (d < bestD) {
      bestD = d;
      best = b.id;
    }
  }
  return best;
}

export function atomsInRect(g: MolGraph, x1: number, y1: number, x2: number, y2: number): number[] {
  const [lx, hx] = x1 < x2 ? [x1, x2] : [x2, x1];
  const [ly, hy] = y1 < y2 ? [y1, y2] : [y2, y1];
  return g.atoms.filter((a) => a.x >= lx && a.x <= hx && a.y >= ly && a.y <= hy).map((a) => a.id);
}
