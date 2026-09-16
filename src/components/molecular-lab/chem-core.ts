/*
 * Molecular Lab — the OpenChemLib bridge.
 *
 * Everything that needs a real cheminformatics toolkit goes through here:
 * reading SMILES and V3000 files, laying out a 2D drawing, generating and
 * force-field minimising 3D coordinates, writing SMILES, and finding the
 * common substructure of two molecules. The functions take the OpenChemLib
 * module as an argument so the same code runs in the worker, on the main
 * thread as a fallback, and in `node --test`.
 *
 * What stays out of here, deliberately: formula, molecular weight, valence and
 * functional groups are computed from the graph in graph.ts / groups.ts, so the
 * information panel never waits for a 1 MB library.
 */

import type * as OCLNS from "openchemlib";
import { analyse, type MolGraph } from "./graph";
import { MolfileError, graphFromMolfile, parseMolfileV2000, type Conformer3D } from "./molfile";

export type OCL = typeof OCLNS;
type Molecule = OCLNS.Molecule;

export type ChemErrorCode = "aromatic" | "parse" | "empty" | "conformer" | "too-large";

// No constructor parameter properties: `node --test` strips types and rejects them.
export class ChemError extends Error {
  code: ChemErrorCode;
  constructor(code: ChemErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

/** Editable structures are capped: beyond this the lab opens a 3D-only view. */
export const MAX_EDITABLE_ATOMS = 250;

interface Built {
  mol: Molecule;
  /** OpenChemLib atom index → graph atom id. */
  ids: number[];
}

/**
 * Builds an OpenChemLib molecule with the graph's heavy atoms (and any H the
 * student drew as an atom). Implicit hydrogens are left implicit, but every
 * atom whose hydrogen count differs from OpenChemLib's default is pinned with
 * an abnormal valence, so a deliberately incomplete atom stays incomplete.
 */
export function buildMolecule(ocl: OCL, g: MolGraph): Built {
  const report = analyse(g);
  if (report.aromaticUnresolved.length) {
    throw new ChemError("aromatic", "The aromatic bonds cannot be arranged as alternating single and double bonds.");
  }
  const M = ocl.Molecule;
  const mol = new M(g.atoms.length, g.bonds.length);
  const index = new Map<number, number>();
  const ids: number[] = [];
  for (const a of g.atoms) {
    const z = M.getAtomicNoFromLabel(a.el);
    if (!z) throw new ChemError("parse", `Unknown element ${a.el}.`);
    const i = mol.addAtom(z);
    // OpenChemLib's y axis already points down, like the screen (its molfile
    // writer negates it) — negating here would mirror every stereocentre.
    mol.setAtomX(i, a.x);
    mol.setAtomY(i, a.y);
    if (a.charge) mol.setAtomCharge(i, a.charge);
    mol.setAtomMapNo(i, i + 1, false);
    index.set(a.id, i);
    ids.push(a.id);
  }
  for (const b of g.bonds) {
    const i = mol.addBond(index.get(b.a)!, index.get(b.b)!);
    const order = report.orders.get(b.id)!;
    let type = order === 3 ? M.cBondTypeTriple : order === 2 ? M.cBondTypeDouble : M.cBondTypeSingle;
    if (order === 1 && b.stereo === "wedge") type = M.cBondTypeUp;
    if (order === 1 && b.stereo === "hash") type = M.cBondTypeDown;
    mol.setBondType(i, type);
  }
  mol.ensureHelperArrays(M.cHelperNeighbours);
  for (const a of g.atoms) {
    const i = index.get(a.id)!;
    const want = report.atoms.get(a.id)!.hydrogens;
    let have = mol.getImplicitHydrogens(i);
    if (have === want) continue;
    // OpenChemLib folds charge into abnormal valence differently per element;
    // converge on the wanted count instead of predicting it.
    let valence = report.atoms.get(a.id)!.used;
    for (let k = 0; k < 6 && have !== want; k++) {
      valence = Math.max(0, valence + (want - have));
      mol.setAtomAbnormalValence(i, valence);
      mol.ensureHelperArrays(M.cHelperNeighbours);
      have = mol.getImplicitHydrogens(i);
    }
  }
  return { mol, ids };
}

// ─── READING ────────────────────────────────────────────────────────────────

export interface Loaded {
  graph: MolGraph;
  conformer: Conformer3D | null;
}

export function fromSmiles(ocl: OCL, smiles: string): Loaded {
  let mol: Molecule;
  try {
    mol = ocl.Molecule.fromSmiles(smiles.trim());
  } catch {
    throw new ChemError("parse", "We couldn't interpret this structure.");
  }
  return fromOclMolecule(ocl, mol);
}

function fromOclMolecule(ocl: OCL, mol: Molecule): Loaded {
  if (mol.getAllAtoms() === 0) throw new ChemError("empty", "The structure has no atoms.");
  if (mol.getAllAtoms() > MAX_EDITABLE_ATOMS * 3) throw new ChemError("too-large", "This structure is too large to edit.");
  mol.inventCoordinates();
  const parsed = parseMolfileV2000(mol.toMolfile());
  const out = graphFromMolfile({ ...parsed, is3D: false });
  if (out.graph.atoms.length > MAX_EDITABLE_ATOMS) throw new ChemError("too-large", "This structure is too large to edit.");
  return { graph: out.graph, conformer: null };
}

/**
 * Reads a molfile / SDF. V2000 is read by molfile.ts so a 3D file's own
 * coordinates survive as the conformer; V3000 goes through OpenChemLib.
 */
export function fromMolfile(ocl: OCL, text: string): Loaded & { needsLayout: boolean } {
  try {
    const parsed = parseMolfileV2000(text);
    if (!parsed.atoms.length) throw new ChemError("empty", "The file has no atoms.");
    const out = graphFromMolfile(parsed);
    if (out.graph.atoms.length > MAX_EDITABLE_ATOMS) throw new ChemError("too-large", "This structure is too large to edit.");
    if (out.needsLayout) {
      const laid = layout2D(ocl, out.graph);
      return { graph: laid, conformer: out.conformer, needsLayout: false };
    }
    return { graph: out.graph, conformer: out.conformer, needsLayout: false };
  } catch (err) {
    if (err instanceof ChemError) throw err;
    if (!(err instanceof MolfileError && err.message === "V3000")) {
      throw new ChemError("parse", err instanceof Error ? err.message : "We couldn't interpret this structure.");
    }
  }
  let mol: Molecule;
  try {
    mol = ocl.Molecule.fromMolfile(text);
  } catch {
    throw new ChemError("parse", "We couldn't interpret this structure.");
  }
  return { ...fromOclMolecule(ocl, mol), needsLayout: false };
}

// ─── 2D LAYOUT ──────────────────────────────────────────────────────────────

/**
 * A clean 2D drawing of the same structure. Stereo is read from the current
 * drawing first and redrawn as wedges that mean the same thing in the new
 * layout.
 */
export function layout2D(ocl: OCL, g: MolGraph): MolGraph {
  if (!g.atoms.length) return g;
  const { mol, ids } = buildMolecule(ocl, g);
  const M = ocl.Molecule;
  mol.ensureHelperArrays(M.cHelperParities);
  mol.inventCoordinates();
  const pos = new Map<number, { x: number; y: number }>();
  for (let i = 0; i < ids.length; i++) pos.set(ids[i], { x: mol.getAtomX(i), y: mol.getAtomY(i) });
  const avg = mol.getAverageBondLength(true) || 1;

  const stereo = new Map<string, { from: number; kind: "wedge" | "hash" }>();
  for (let b = 0; b < mol.getAllBonds(); b++) {
    const t = mol.getBondType(b);
    if (t !== M.cBondTypeUp && t !== M.cBondTypeDown) continue;
    const a0 = ids[mol.getBondAtom(0, b)];
    const a1 = ids[mol.getBondAtom(1, b)];
    stereo.set([a0, a1].sort((x, y) => x - y).join("-"), { from: a0, kind: t === M.cBondTypeUp ? "wedge" : "hash" });
  }
  return {
    ...g,
    atoms: g.atoms.map((a) => {
      const p = pos.get(a.id)!;
      return { ...a, x: p.x / avg, y: p.y / avg };
    }),
    bonds: g.bonds.map((b) => {
      const s = stereo.get([b.a, b.b].sort((x, y) => x - y).join("-"));
      if (!s) return b.stereo === "none" ? b : { ...b, stereo: "none" };
      const flip = s.from !== b.a;
      return { ...b, stereo: s.kind, a: flip ? b.b : b.a, b: flip ? b.a : b.b };
    }),
  };
}

// ─── 3D ─────────────────────────────────────────────────────────────────────

export interface ConformerResult {
  conformer: Conformer3D;
  minimised: boolean;
}

/**
 * Generates 3D coordinates: OpenChemLib's torsion-library conformer generator
 * (which adds every hydrogen), then an MMFF94s+ minimisation. Atoms the force
 * field has no parameters for keep the generator's geometry, and the result
 * says so.
 */
export function generateConformer(ocl: OCL, g: MolGraph, seed = 42): ConformerResult {
  if (!g.atoms.length) throw new ChemError("empty", "Nothing to show in 3D yet.");
  const { mol, ids } = buildMolecule(ocl, g);
  const M = ocl.Molecule;
  mol.ensureHelperArrays(M.cHelperParities);
  let out: Molecule | null = null;
  try {
    out = new ocl.ConformerGenerator(seed).getOneConformerAsMolecule(mol);
  } catch {
    out = null;
  }
  if (!out) throw new ChemError("conformer", "3D visualization isn't available for this structure.");

  let minimised = false;
  try {
    const ff = new ocl.ForceFieldMMFF94(out, "MMFF94s+");
    minimised = ff.minimise({ maxIts: 4000 }) === 0;
  } catch {
    minimised = false;
  }

  out.ensureHelperArrays(M.cHelperNeighbours);
  const n = out.getAllAtoms();
  const parent: number[] = new Array(n).fill(-1);
  const self: boolean[] = new Array(n).fill(false);
  for (let i = 0; i < n; i++) {
    const map = out.getAtomMapNo(i);
    if (map > 0) {
      parent[i] = ids[map - 1];
      self[i] = true;
    }
  }
  for (let i = 0; i < n; i++) {
    if (parent[i] !== -1) continue;
    // A generated hydrogen belongs to the atom it is bonded to.
    for (let k = 0; k < out.getAllConnAtoms(i); k++) {
      const p = parent[out.getConnAtom(i, k)];
      if (p !== -1) {
        parent[i] = p;
        break;
      }
    }
  }
  if (parent.some((p) => p === -1)) throw new ChemError("conformer", "3D visualization isn't available for this structure.");

  const atoms: Conformer3D["atoms"] = [];
  for (let i = 0; i < n; i++) {
    const pos = { x: out.getAtomX(i), y: out.getAtomY(i), z: out.getAtomZ(i) };
    if (![pos.x, pos.y, pos.z].every(Number.isFinite)) throw new ChemError("conformer", "3D visualization isn't available for this structure.");
    atoms.push({ el: out.getAtomLabel(i), parent: parent[i], self: self[i], pos, charge: out.getAtomCharge(i) || undefined });
  }
  const bonds: Conformer3D["bonds"] = [];
  for (let b = 0; b < out.getAllBonds(); b++) {
    bonds.push({ a: out.getBondAtom(0, b), b: out.getBondAtom(1, b), order: Math.max(1, out.getBondOrder(b)) });
  }
  return { conformer: { atoms, bonds }, minimised };
}

// ─── WRITING / COMPARING ────────────────────────────────────────────────────

export function toSmiles(ocl: OCL, g: MolGraph): string {
  if (!g.atoms.length) return "";
  const { mol } = buildMolecule(ocl, g);
  mol.ensureHelperArrays(ocl.Molecule.cHelperParities);
  // Map numbers would otherwise be written as [C:1].
  for (let i = 0; i < mol.getAllAtoms(); i++) mol.setAtomMapNo(i, 0, false);
  return mol.toIsomericSmiles();
}

/** Canonical identity (OpenChemLib ID code) — equal for the same structure however it is drawn. */
export function idCode(ocl: OCL, g: MolGraph): string {
  if (!g.atoms.length) return "";
  const { mol } = buildMolecule(ocl, g);
  for (let i = 0; i < mol.getAllAtoms(); i++) mol.setAtomMapNo(i, 0, false);
  mol.ensureHelperArrays(ocl.Molecule.cHelperParities);
  return mol.getIDCode();
}

export interface CommonResult {
  /** Graph atom ids of each molecule that belong to the largest shared substructure. */
  a: number[];
  b: number[];
  /** Shared bonds ÷ bonds of the larger molecule (0–1). */
  score: number;
}

export function commonSubstructure(ocl: OCL, ga: MolGraph, gb: MolGraph): CommonResult {
  if (!ga.atoms.length || !gb.atoms.length || !ga.bonds.length || !gb.bonds.length) return { a: [], b: [], score: 0 };
  const A = buildMolecule(ocl, ga);
  const B = buildMolecule(ocl, gb);
  const bigFirst = ga.bonds.length >= gb.bonds.length;
  const mcs = new ocl.MCS();
  mcs.set(bigFirst ? A.mol : B.mol, bigFirst ? B.mol : A.mol);
  const common = mcs.getMCS();
  if (!common) return { a: [], b: [], score: 0 };
  const score = mcs.getScore();
  const match = (built: Built) => {
    const frag = common.getCompactCopy();
    frag.setFragment(true);
    const s = new ocl.SSSearcher();
    s.setFragment(frag);
    s.setMolecule(built.mol);
    s.findFragmentInMolecule();
    const list = s.getMatchList()[0] ?? [];
    return list.filter((i) => i >= 0 && i < built.ids.length).map((i) => built.ids[i]);
  };
  return { a: match(A), b: match(B), score };
}

/** OpenChemLib's aromatic atoms, by graph id — used by the tests to check groups.ts. */
export function oclAromaticAtoms(ocl: OCL, g: MolGraph): number[] {
  const { mol, ids } = buildMolecule(ocl, g);
  mol.ensureHelperArrays(ocl.Molecule.cHelperRings);
  return ids.filter((_, i) => mol.isAromaticAtom(i));
}
