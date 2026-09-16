/*
 * Molecular Lab — MDL molfile (V2000) reading and writing.
 *
 * Written here rather than delegated to OpenChemLib because the lab needs to
 * know exactly which file atom became which graph atom (a PubChem 3D record's
 * coordinates are kept as the molecule's conformer), and OpenChemLib is free to
 * reorder atoms. V3000 files are handed to OpenChemLib by the caller.
 */

import { analyse, kekulize, type BondOrder, type LabAtom, type LabBond, type MolGraph } from "./graph";
import type { Vec3 } from "./measure";

export interface ParsedMolfile {
  name: string;
  atoms: { el: string; x: number; y: number; z: number; charge: number; radical: number }[];
  bonds: { a: number; b: number; order: number; stereo: number }[];
  is3D: boolean;
}

export class MolfileError extends Error {}

const CHARGE_CODE: Record<number, number> = { 0: 0, 1: 3, 2: 2, 3: 1, 4: 0, 5: -1, 6: -2, 7: -3 };

/** Reads the first record of a molfile or SDF. Throws MolfileError when it is not V2000. */
export function parseMolfileV2000(text: string): ParsedMolfile {
  const lines = text.replace(/\r/g, "").split("\n");
  if (lines.length < 4) throw new MolfileError("File is too short to be a molfile.");
  const counts = lines[3];
  if (/V3000/.test(counts)) throw new MolfileError("V3000");
  const nAtoms = parseInt(counts.slice(0, 3), 10);
  const nBonds = parseInt(counts.slice(3, 6), 10);
  if (!Number.isFinite(nAtoms) || !Number.isFinite(nBonds) || nAtoms < 0 || nBonds < 0) {
    throw new MolfileError("The counts line could not be read.");
  }
  if (lines.length < 4 + nAtoms + nBonds) throw new MolfileError("The file ends before all atoms and bonds are listed.");

  const atoms: ParsedMolfile["atoms"] = [];
  let is3D = /3D/i.test(lines[1] ?? "");
  let anyZ = false;
  for (let i = 0; i < nAtoms; i++) {
    const l = lines[4 + i];
    const x = parseFloat(l.slice(0, 10));
    const y = parseFloat(l.slice(10, 20));
    const z = parseFloat(l.slice(20, 30));
    const el = l.slice(31, 34).trim();
    const chg = parseInt(l.slice(36, 39), 10) || 0;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !el) throw new MolfileError(`Atom ${i + 1} could not be read.`);
    if (Math.abs(z || 0) > 1e-4) anyZ = true;
    atoms.push({ el: normaliseSymbol(el), x, y, z: Number.isFinite(z) ? z : 0, charge: CHARGE_CODE[chg] ?? 0, radical: 0 });
  }
  if (anyZ) is3D = true;
  else if (is3D && !anyZ) is3D = false;

  const bonds: ParsedMolfile["bonds"] = [];
  for (let i = 0; i < nBonds; i++) {
    const l = lines[4 + nAtoms + i];
    const a = parseInt(l.slice(0, 3), 10) - 1;
    const b = parseInt(l.slice(3, 6), 10) - 1;
    const order = parseInt(l.slice(6, 9), 10);
    const stereo = parseInt(l.slice(9, 12), 10) || 0;
    if (!(a >= 0 && a < nAtoms && b >= 0 && b < nAtoms)) throw new MolfileError(`Bond ${i + 1} refers to a missing atom.`);
    bonds.push({ a, b, order, stereo });
  }

  // The properties block overrides atom-block charges when present.
  let sawChg = false;
  for (let i = 4 + nAtoms + nBonds; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("M  END") || l.startsWith("$$$$")) break;
    const m = l.match(/^M {2}(CHG|RAD)\s*(\d+)(.*)$/);
    if (!m) continue;
    const nums = m[3].trim().split(/\s+/).map(Number);
    if (m[1] === "CHG" && !sawChg) {
      sawChg = true;
      for (const at of atoms) at.charge = 0;
    }
    for (let k = 0; k + 1 < nums.length; k += 2) {
      const at = atoms[nums[k] - 1];
      if (!at) continue;
      if (m[1] === "CHG") at.charge = nums[k + 1];
      else at.radical = nums[k + 1];
    }
  }

  return { name: (lines[0] ?? "").trim(), atoms, bonds, is3D };
}

function normaliseSymbol(s: string) {
  if (s === "D" || s === "T") return "H";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export interface GraphFromFile {
  graph: MolGraph;
  /** 3D coordinates of every file atom, keyed back to graph atoms, when the file is 3D. */
  conformer: Conformer3D | null;
  /** True when the file had no usable 2D drawing (a 3D file) — the caller should lay it out. */
  needsLayout: boolean;
}

/**
 * Turns a parsed molfile into an editable graph. Explicit hydrogens become the
 * heavy atom's hydrogen count (automatic when it matches the usual valence),
 * except hydrogens bonded to other hydrogens or standing alone, which stay as
 * atoms.
 */
export function graphFromMolfile(p: ParsedMolfile): GraphFromFile {
  const isFoldableH = (i: number) => {
    const a = p.atoms[i];
    if (a.el !== "H" || a.charge !== 0) return false;
    const partners = p.bonds.filter((b) => b.a === i || b.b === i);
    if (partners.length !== 1 || partners[0].order !== 1) return false;
    const other = partners[0].a === i ? partners[0].b : partners[0].a;
    return p.atoms[other].el !== "H";
  };

  const keep: number[] = [];
  const idOf = new Map<number, number>();
  let nextId = 1;
  for (let i = 0; i < p.atoms.length; i++) {
    if (isFoldableH(i)) continue;
    keep.push(i);
    idOf.set(i, nextId++);
  }

  // Scale drawing coordinates to one bond length and flip y for the screen.
  const heavyBonds = p.bonds.filter((b) => idOf.has(b.a) && idOf.has(b.b));
  const lengths = heavyBonds.map((b) => Math.hypot(p.atoms[b.a].x - p.atoms[b.b].x, p.atoms[b.a].y - p.atoms[b.b].y)).filter((l) => l > 1e-6);
  const avg = lengths.length ? lengths.reduce((s, l) => s + l, 0) / lengths.length : 1;

  const explicitH = new Map<number, number>();
  for (const b of p.bonds) {
    if (isFoldableH(b.a)) explicitH.set(b.b, (explicitH.get(b.b) ?? 0) + 1);
    else if (isFoldableH(b.b)) explicitH.set(b.a, (explicitH.get(b.a) ?? 0) + 1);
  }

  const atoms: LabAtom[] = keep.map((i) => {
    const a = p.atoms[i];
    return { id: idOf.get(i)!, el: a.el, x: a.x / avg, y: -a.y / avg, charge: a.charge, h: explicitH.get(i) ?? 0 };
  });
  const bonds: LabBond[] = heavyBonds.map((b) => {
    const order: BondOrder = b.order === 2 ? 2 : b.order === 3 ? 3 : b.order === 4 ? "ar" : 1;
    const stereo = b.order === 1 && b.stereo === 1 ? "wedge" : b.order === 1 && b.stereo === 6 ? "hash" : "none";
    return { id: nextId++, a: idOf.get(b.a)!, b: idOf.get(b.b)!, order, stereo };
  });
  let graph: MolGraph = { atoms, bonds, nextId };

  // A file with no hydrogens at all is using implicit hydrogens throughout
  // (most 2D files); one with hydrogens has stated every one of them.
  const fileHasH = p.atoms.some((a) => a.el === "H");
  const auto = analyse({ ...graph, atoms: graph.atoms.map((a) => ({ ...a, h: null })) });
  graph = {
    ...graph,
    atoms: graph.atoms.map((a) => {
      if (!fileHasH) return { ...a, h: p.atoms[keep[a.id - 1]]?.radical ? Math.max(0, auto.atoms.get(a.id)!.hydrogens - 1) : null };
      return a.h === auto.atoms.get(a.id)!.hydrogens ? { ...a, h: null } : a;
    }),
  };

  let conformer: GraphFromFile["conformer"] = null;
  if (p.is3D) {
    const parentOf = (i: number) => {
      if (idOf.has(i)) return idOf.get(i)!;
      const b = p.bonds.find((x) => x.a === i || x.b === i)!;
      return idOf.get(b.a === i ? b.b : b.a)!;
    };
    conformer = {
      atoms: p.atoms.map((a, i) => ({ el: a.el, parent: parentOf(i), self: idOf.has(i), pos: { x: a.x, y: a.y, z: a.z }, charge: a.charge })),
      bonds: p.bonds.map((b) => ({ a: b.a, b: b.b, order: b.order === 4 ? 1 : b.order })),
    };
  }
  return { graph, conformer, needsLayout: p.is3D || (lengths.length === 0 && atoms.length > 1) };
}

// ─── WRITING ────────────────────────────────────────────────────────────────

const pad = (s: string | number, n: number) => String(s).padStart(n, " ");
const fx = (v: number) => pad(v.toFixed(4), 10);

function header(name: string, dim: "2D" | "3D") {
  return [name.slice(0, 80), `  PharmaWL      ${dim}`, "Molecular Lab — pharmawallah.com"];
}

function propertyLines(charges: [number, number][], radicals: [number, number][]) {
  const out: string[] = [];
  for (const [tag, list] of [["CHG", charges], ["RAD", radicals]] as const) {
    for (let i = 0; i < list.length; i += 8) {
      const chunk = list.slice(i, i + 8);
      out.push(`M  ${tag}${pad(chunk.length, 3)}${chunk.map(([a, v]) => `${pad(a, 4)}${pad(v, 4)}`).join("")}`);
    }
  }
  return out;
}

/**
 * The drawing as a 2D V2000 molfile, hydrogens implicit. Aromatic bonds are
 * written in their Kekulé form (V2000 bond type 4 is for queries only).
 * Returns null if the aromatic bonds have no Kekulé form.
 */
export function graphToMolfile(g: MolGraph, name: string): string | null {
  const kek = kekulize(g);
  if (!kek) return null;
  const report = analyse(g);
  const index = new Map(g.atoms.map((a, i) => [a.id, i + 1]));
  const lines = header(name, "2D");
  // Chiral flag set when wedges are drawn: the configuration shown is absolute,
  // not relative (readers otherwise treat L-alanine as "either enantiomer").
  const chiral = g.bonds.some((b) => b.stereo !== "none") ? 1 : 0;
  lines.push(`${pad(g.atoms.length, 3)}${pad(g.bonds.length, 3)}  0  0${pad(chiral, 3)}  0  0  0  0  0999 V2000`);
  const charges: [number, number][] = [];
  const radicals: [number, number][] = [];
  for (const a of g.atoms) {
    const r = report.atoms.get(a.id)!;
    // An atom whose hydrogens the student fixed below the usual valence is a
    // radical; say so, or every reader would refill its hydrogens.
    const missing = r.status === "under" ? Math.min(...r.allowed.filter((v) => v > r.used)) - r.used : 0;
    // The valence field (vvv) fixes hydrogens for any other override.
    const valence = !r.hydrogensAuto && !missing ? (r.used === 0 ? 15 : r.used) : 0;
    lines.push(`${fx(a.x)}${fx(-a.y)}${fx(0)} ${a.el.padEnd(3, " ")} 0  0  0  0  0${pad(valence, 3)}  0  0  0  0  0  0`);
    if (a.charge) charges.push([index.get(a.id)!, a.charge]);
    if (missing === 1) radicals.push([index.get(a.id)!, 2]);
    else if (missing === 2) radicals.push([index.get(a.id)!, 3]);
  }
  for (const b of g.bonds) {
    const order = b.order === "ar" ? kek.get(b.id)! : b.order;
    const stereo = b.stereo === "wedge" ? 1 : b.stereo === "hash" ? 6 : 0;
    lines.push(`${pad(index.get(b.a)!, 3)}${pad(index.get(b.b)!, 3)}${pad(order, 3)}${pad(stereo, 3)}`);
  }
  lines.push(...propertyLines(charges, radicals), "M  END");
  return lines.join("\n") + "\n";
}

export interface Conformer3D {
  /** `parent` is the graph atom an atom belongs to; `self` marks the graph atom itself (not one of its hydrogens). */
  atoms: { el: string; parent: number; self: boolean; pos: Vec3; charge?: number }[];
  bonds: { a: number; b: number; order: number }[];
}

/** A 3D conformer (all hydrogens explicit) as a V2000 record. */
export function conformerToMolfile(c: Conformer3D, name: string): string {
  const lines = header(name, "3D");
  // 3D coordinates fix the configuration absolutely.
  lines.push(`${pad(c.atoms.length, 3)}${pad(c.bonds.length, 3)}  0  0  1  0  0  0  0  0999 V2000`);
  const charges: [number, number][] = [];
  c.atoms.forEach((a, i) => {
    lines.push(`${fx(a.pos.x)}${fx(a.pos.y)}${fx(a.pos.z)} ${a.el.padEnd(3, " ")} 0  0  0  0  0  0  0  0  0  0  0  0`);
    if (a.charge) charges.push([i + 1, a.charge]);
  });
  for (const b of c.bonds) lines.push(`${pad(b.a + 1, 3)}${pad(b.b + 1, 3)}${pad(b.order, 3)}  0`);
  lines.push(...propertyLines(charges, []), "M  END");
  return lines.join("\n") + "\n";
}

export function toSdf(molfile: string, fields: Record<string, string> = {}): string {
  const extra = Object.entries(fields).map(([k, v]) => `> <${k}>\n${v}\n`).join("\n");
  return `${molfile}${extra ? `${extra}\n` : ""}$$$$\n`;
}
