/*
 * Molecular Lab — the molecule graph.
 *
 * This is the single source of truth for an editable structure. The 2D editor
 * draws it, the 3D view is generated from it (conformer.ts), the information
 * panel is computed from it, and undo/redo stores snapshots of it. Nothing else
 * keeps its own copy of atoms or bonds, so 2D and 3D can never disagree.
 *
 * Every function here is pure: it takes a graph and returns a new one. The
 * graph is plain JSON (it is autosaved and exported as-is).
 *
 * Coordinates are 2D drawing coordinates in *bond lengths* (1 = one standard
 * bond), y pointing down like the screen. 3D coordinates are not stored on the
 * atoms: they belong to a generated conformer that is tied to a structure
 * signature (see `structureKey`), so a stale 3D model is detectable instead of
 * silently wrong.
 *
 * Hydrogens follow the convention every chemistry editor uses: `h: null` means
 * "fill the remaining valence automatically"; a number is the student's own
 * choice and is never changed behind their back. Breaking a bond fixes the
 * hydrogens on both ends, so the break shows up as incomplete valence (a
 * radical) instead of being quietly healed.
 */

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type BondOrder = 1 | 2 | 3 | "ar";
export type BondStereo = "none" | "wedge" | "hash";

export interface LabAtom {
  id: number;
  el: string;
  x: number;
  y: number;
  charge: number;
  /** null = automatic (implicit) hydrogens; a number = set by the student. */
  h: number | null;
}

export interface LabBond {
  id: number;
  a: number;
  b: number;
  order: BondOrder;
  /** Wedge/hash point from `a` (narrow end) to `b`. */
  stereo: BondStereo;
}

export interface MolGraph {
  atoms: LabAtom[];
  bonds: LabBond[];
  nextId: number;
}

export type AtomValence = "ok" | "under" | "over" | "unknown";

export interface AtomReport {
  id: number;
  el: string;
  /** Sum of bond orders (aromatic bonds resolved to 1 or 2). */
  bondSum: number;
  hydrogens: number;
  hydrogensAuto: boolean;
  /** bondSum + hydrogens + |lone-pair-free adjustments| — what the atom uses. */
  used: number;
  /** Valences that are normal for this element at this charge (empty = no rule). */
  allowed: number[];
  status: AtomValence;
  neighbours: number[];
}

export type MolStatus = "empty" | "valid" | "incomplete" | "invalid";

export interface MolReport {
  status: MolStatus;
  atoms: Map<number, AtomReport>;
  fragments: number;
  /** Aromatic bonds that cannot be drawn as alternating single/double bonds. */
  aromaticUnresolved: number[];
  /** Resolved order of every bond (aromatic → 1 or 2 when resolvable). */
  orders: Map<number, number>;
}

export interface ElementWeights {
  get(symbol: string): { atomicWeight: number } | undefined;
}

// ─── CONSTRUCTION ───────────────────────────────────────────────────────────

export function emptyGraph(): MolGraph {
  return { atoms: [], bonds: [], nextId: 1 };
}

export function atomById(g: MolGraph, id: number): LabAtom | undefined {
  return g.atoms.find((a) => a.id === id);
}

export function bondById(g: MolGraph, id: number): LabBond | undefined {
  return g.bonds.find((b) => b.id === id);
}

export function bondBetween(g: MolGraph, a: number, b: number): LabBond | undefined {
  return g.bonds.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
}

export function neighboursOf(g: MolGraph, id: number): number[] {
  const out: number[] = [];
  for (const b of g.bonds) {
    if (b.a === id) out.push(b.b);
    else if (b.b === id) out.push(b.a);
  }
  return out;
}

export function addAtom(g: MolGraph, el: string, x: number, y: number): { graph: MolGraph; id: number } {
  const id = g.nextId;
  return {
    graph: { ...g, atoms: [...g.atoms, { id, el, x, y, charge: 0, h: null }], nextId: id + 1 },
    id,
  };
}

/**
 * Connects two atoms. If they are already bonded, the existing bond takes the
 * requested order instead — drawing over a bond is how editors change it.
 */
export function addBond(g: MolGraph, a: number, b: number, order: BondOrder = 1, stereo: BondStereo = "none"): { graph: MolGraph; id: number } | null {
  if (a === b || !atomById(g, a) || !atomById(g, b)) return null;
  const existing = bondBetween(g, a, b);
  if (existing) {
    const graph = {
      ...g,
      bonds: g.bonds.map((x) =>
        x.id === existing.id ? { ...x, order, stereo, ...(stereo !== "none" ? { a, b } : {}) } : x,
      ),
    };
    return { graph, id: existing.id };
  }
  const id = g.nextId;
  return { graph: { ...g, bonds: [...g.bonds, { id, a, b, order, stereo }], nextId: id + 1 }, id };
}

/** Adds an atom bonded to `from`, placed in the most open direction. */
export function addBondedAtom(g: MolGraph, from: number, el: string, order: BondOrder = 1, at?: { x: number; y: number }): { graph: MolGraph; id: number } | null {
  const origin = atomById(g, from);
  if (!origin) return null;
  const pos = at ?? openPosition(g, from);
  const added = addAtom(g, el, pos.x, pos.y);
  const bonded = addBond(added.graph, from, added.id, order);
  return bonded ? { graph: bonded.graph, id: added.id } : null;
}

// ─── EDITING ────────────────────────────────────────────────────────────────

export function setBondOrder(g: MolGraph, bondId: number, order: BondOrder): MolGraph {
  return {
    ...g,
    // A wedge only means something on a single bond.
    bonds: g.bonds.map((b) => (b.id === bondId ? { ...b, order, stereo: order === 1 ? b.stereo : "none" } : b)),
  };
}

export function setBondStereo(g: MolGraph, bondId: number, stereo: BondStereo, from?: number): MolGraph {
  return {
    ...g,
    bonds: g.bonds.map((b) => {
      if (b.id !== bondId) return b;
      const flip = from !== undefined && from === b.b;
      return { ...b, order: 1, stereo, a: flip ? b.b : b.a, b: flip ? b.a : b.b };
    }),
  };
}

export function deleteItems(g: MolGraph, atomIds: Iterable<number>, bondIds: Iterable<number> = []): MolGraph {
  const atoms = new Set(atomIds);
  const bonds = new Set(bondIds);
  return {
    ...g,
    atoms: g.atoms.filter((a) => !atoms.has(a.id)),
    bonds: g.bonds.filter((b) => !bonds.has(b.id) && !atoms.has(b.a) && !atoms.has(b.b)),
  };
}

/**
 * Homolytic cleavage, for teaching: the bond is removed, both atoms keep the
 * hydrogens they had (so each is left one bond short — a radical), and the
 * smaller side is nudged away so the break is visible. The status panel then
 * reports incomplete valence rather than the structure quietly healing.
 */
export function breakBond(g: MolGraph, bondId: number): MolGraph {
  const bond = bondById(g, bondId);
  if (!bond) return g;
  const report = analyse(g);
  const hA = report.atoms.get(bond.a)?.hydrogens ?? 0;
  const hB = report.atoms.get(bond.b)?.hydrogens ?? 0;
  let next: MolGraph = {
    ...g,
    atoms: g.atoms.map((a) => (a.id === bond.a ? { ...a, h: hA } : a.id === bond.b ? { ...a, h: hB } : a)),
    bonds: g.bonds.filter((b) => b.id !== bondId),
  };
  const sideA = fragmentOf(next, bond.a);
  const sideB = fragmentOf(next, bond.b);
  if (!sideA.has(bond.b)) {
    const moving = sideA.size <= sideB.size ? sideA : sideB;
    const anchor = atomById(g, moving === sideA ? bond.b : bond.a)!;
    const mover = atomById(g, moving === sideA ? bond.a : bond.b)!;
    const len = Math.hypot(mover.x - anchor.x, mover.y - anchor.y) || 1;
    const dx = ((mover.x - anchor.x) / len) * 0.45;
    const dy = ((mover.y - anchor.y) / len) * 0.45;
    next = moveAtoms(next, moving, dx, dy);
  }
  return next;
}

export function moveAtoms(g: MolGraph, ids: Iterable<number>, dx: number, dy: number): MolGraph {
  const set = new Set(ids);
  return { ...g, atoms: g.atoms.map((a) => (set.has(a.id) ? { ...a, x: a.x + dx, y: a.y + dy } : a)) };
}

export function setAtomPositions(g: MolGraph, positions: Map<number, { x: number; y: number }>): MolGraph {
  return { ...g, atoms: g.atoms.map((a) => (positions.has(a.id) ? { ...a, ...positions.get(a.id)! } : a)) };
}

export function setElement(g: MolGraph, ids: Iterable<number>, el: string): MolGraph {
  const set = new Set(ids);
  // A new element starts with automatic hydrogens: a hydrogen count chosen for
  // carbon means nothing for chlorine.
  return { ...g, atoms: g.atoms.map((a) => (set.has(a.id) ? { ...a, el, h: null } : a)) };
}

export function setCharge(g: MolGraph, id: number, charge: number): MolGraph {
  const c = Math.max(-4, Math.min(4, Math.round(charge)));
  return { ...g, atoms: g.atoms.map((a) => (a.id === id ? { ...a, charge: c } : a)) };
}

export function setHydrogens(g: MolGraph, id: number, h: number | null): MolGraph {
  const value = h === null ? null : Math.max(0, Math.min(8, Math.round(h)));
  return { ...g, atoms: g.atoms.map((a) => (a.id === id ? { ...a, h: value } : a)) };
}

/** +1 / −1 hydrogen, starting from what the atom currently shows. */
export function stepHydrogens(g: MolGraph, id: number, delta: 1 | -1): MolGraph {
  const current = analyse(g).atoms.get(id)?.hydrogens ?? 0;
  return setHydrogens(g, id, Math.max(0, current + delta));
}

// ─── TEMPLATES ──────────────────────────────────────────────────────────────

export type RingKind = 3 | 4 | 5 | 6 | 7 | "benzene";

/**
 * Adds a ring: fused onto a bond, spiro on an atom, or free at a point. A
 * benzene ring is drawn as alternating single/double bonds (the Kekulé form
 * the rest of the site's lessons use); aromaticity is still perceived.
 */
export function addRing(g: MolGraph, kind: RingKind, target: { bond: number } | { atom: number } | { x: number; y: number }): { graph: MolGraph; atomIds: number[] } {
  const size = kind === "benzene" ? 6 : kind;
  const doubles = kind === "benzene";
  const R = 1 / (2 * Math.sin(Math.PI / size)); // circumradius for unit bonds
  let graph = g;
  const ids: number[] = [];

  if ("bond" in target) {
    const bond = bondById(g, target.bond);
    if (!bond) return { graph: g, atomIds: [] };
    const p = atomById(g, bond.a)!;
    const q = atomById(g, bond.b)!;
    // Build on the side of the bond with fewer atoms.
    const mx = (p.x + q.x) / 2;
    const my = (p.y + q.y) / 2;
    const bl = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    let nx = -(q.y - p.y) / bl;
    let ny = (q.x - p.x) / bl;
    if (sideCount(g, mx, my, nx, ny) > sideCount(g, mx, my, -nx, -ny)) {
      nx = -nx;
      ny = -ny;
    }
    const apothem = R * Math.cos(Math.PI / size);
    const cx = mx + nx * apothem * bl;
    const cy = my + ny * apothem * bl;
    const start = Math.atan2(p.y - cy, p.x - cx);
    const dir = cross(q.x - p.x, q.y - p.y, cx - p.x, cy - p.y) > 0 ? 1 : -1;
    ids.push(bond.a, bond.b);
    for (let i = 2; i < size; i++) {
      const ang = start + (dir * 2 * Math.PI * i) / size;
      const added = addAtom(graph, "C", cx + R * bl * Math.cos(ang), cy + R * bl * Math.sin(ang));
      graph = added.graph;
      ids.push(added.id);
    }
  } else if ("atom" in target) {
    const atom = atomById(g, target.atom);
    if (!atom) return { graph: g, atomIds: [] };
    const out = openDirection(g, atom.id);
    const cx = atom.x + out.x * R;
    const cy = atom.y + out.y * R;
    const start = Math.atan2(atom.y - cy, atom.x - cx);
    ids.push(atom.id);
    for (let i = 1; i < size; i++) {
      const ang = start + (2 * Math.PI * i) / size;
      const added = addAtom(graph, "C", cx + R * Math.cos(ang), cy + R * Math.sin(ang));
      graph = added.graph;
      ids.push(added.id);
    }
  } else {
    for (let i = 0; i < size; i++) {
      const ang = -Math.PI / 2 + (2 * Math.PI * i) / size + (size % 2 === 0 ? Math.PI / size : 0);
      const added = addAtom(graph, "C", target.x + R * Math.cos(ang), target.y + R * Math.sin(ang));
      graph = added.graph;
      ids.push(added.id);
    }
  }

  for (let i = 0; i < size; i++) {
    const a = ids[i];
    const b = ids[(i + 1) % size];
    const existing = bondBetween(graph, a, b);
    if (existing) continue;
    // Alternate from the fused bond so a fused benzene keeps a sensible pattern.
    const wantDouble = doubles && i % 2 === 1;
    const res = addBond(graph, a, b, wantDouble ? 2 : 1);
    if (res) graph = res.graph;
  }
  if (doubles && "bond" in target) {
    // A benzene fused onto an existing single bond: make that bond double only
    // if neither end already carries a double bond.
    const fused = bondById(graph, target.bond)!;
    const busy = (id: number) => graph.bonds.some((b) => b.id !== fused.id && (b.a === id || b.b === id) && b.order === 2);
    if (fused.order === 1 && !busy(fused.a) && !busy(fused.b)) graph = setBondOrder(graph, fused.id, 2);
  }
  return { graph, atomIds: ids };
}

export type GroupKind = "CH3" | "OH" | "NH2" | "COOH" | "CHO" | "NO2" | "CN" | "OCH3" | "Cl";

export const GROUP_LABELS: Record<GroupKind, string> = {
  CH3: "Methyl  –CH₃",
  OH: "Hydroxyl  –OH",
  NH2: "Amino  –NH₂",
  COOH: "Carboxyl  –COOH",
  CHO: "Aldehyde  –CHO",
  NO2: "Nitro  –NO₂",
  CN: "Nitrile  –C≡N",
  OCH3: "Methoxy  –OCH₃",
  Cl: "Chloro  –Cl",
};

/** Attaches a functional group to an atom (or places it free when `atom` is null). */
export function addGroup(g: MolGraph, atom: number | null, kind: GroupKind, at?: { x: number; y: number }): { graph: MolGraph; atomIds: number[] } {
  let graph = g;
  const ids: number[] = [];
  const first = (el: string) => {
    if (atom !== null && atomById(graph, atom)) {
      const r = addBondedAtom(graph, atom, el);
      if (!r) return null;
      graph = r.graph;
      return r.id;
    }
    const r = addAtom(graph, el, at?.x ?? 0, at?.y ?? 0);
    graph = r.graph;
    return r.id;
  };
  const branch = (from: number, el: string, order: BondOrder = 1) => {
    const r = addBondedAtom(graph, from, el, order);
    if (!r) return from;
    graph = r.graph;
    ids.push(r.id);
    return r.id;
  };
  const head = (el: string) => {
    const id = first(el);
    if (id !== null) ids.push(id);
    return id;
  };

  switch (kind) {
    case "CH3": head("C"); break;
    case "OH": head("O"); break;
    case "NH2": head("N"); break;
    case "Cl": head("Cl"); break;
    case "COOH": { const c = head("C"); if (c !== null) { branch(c, "O", 2); branch(c, "O"); } break; }
    case "CHO": { const c = head("C"); if (c !== null) branch(c, "O", 2); break; }
    case "NO2": {
      // Drawn with its formal charges, as PubChem and the pharmacopoeias do —
      // a neutral N(=O)=O would be pentavalent nitrogen.
      const n = head("N");
      if (n !== null) {
        branch(n, "O", 2);
        const o = branch(n, "O");
        graph = setCharge(graph, n, 1);
        graph = setCharge(graph, o, -1);
      }
      break;
    }
    case "CN": { const c = head("C"); if (c !== null) branch(c, "N", 3); break; }
    case "OCH3": { const o = head("O"); if (o !== null) branch(o, "C"); break; }
  }
  return { graph, atomIds: ids };
}

// ─── GEOMETRY HELPERS ───────────────────────────────────────────────────────

function cross(ax: number, ay: number, bx: number, by: number) {
  return ax * by - ay * bx;
}

function sideCount(g: MolGraph, mx: number, my: number, nx: number, ny: number) {
  let n = 0;
  for (const a of g.atoms) {
    const d = (a.x - mx) * nx + (a.y - my) * ny;
    if (d > 0.1 && Math.hypot(a.x - mx, a.y - my) < 2.5) n++;
  }
  return n;
}

/** Unit vector pointing away from an atom's existing bonds. */
export function openDirection(g: MolGraph, id: number): { x: number; y: number } {
  const atom = atomById(g, id);
  if (!atom) return { x: 1, y: 0 };
  const nbrs = neighboursOf(g, id).map((n) => atomById(g, n)!).filter(Boolean);
  if (nbrs.length === 0) return { x: Math.cos(-Math.PI / 6), y: Math.sin(-Math.PI / 6) };
  const angles = nbrs.map((n) => Math.atan2(n.y - atom.y, n.x - atom.x)).sort((a, b) => a - b);
  if (angles.length === 1) {
    // Zig-zag: 120° from the only bond, turning away from the neighbour's own neighbours.
    const n = nbrs[0];
    const back = angles[0];
    const options = [back + (2 * Math.PI) / 3, back - (2 * Math.PI) / 3];
    const beyond = neighboursOf(g, n.id).filter((x) => x !== id).map((x) => atomById(g, x)!);
    let best = options[0];
    let bestScore = -Infinity;
    for (const ang of options) {
      const px = atom.x + Math.cos(ang);
      const py = atom.y + Math.sin(ang);
      const score = Math.min(9, ...beyond.map((b) => Math.hypot(b.x - px, b.y - py)), ...g.atoms.filter((a) => a.id !== id).map((a) => Math.hypot(a.x - px, a.y - py)));
      if (score > bestScore) {
        bestScore = score;
        best = ang;
      }
    }
    return { x: Math.cos(best), y: Math.sin(best) };
  }
  // Largest angular gap between existing bonds.
  let bestGap = -1;
  let bestAngle = 0;
  for (let i = 0; i < angles.length; i++) {
    const a = angles[i];
    const b = i + 1 < angles.length ? angles[i + 1] : angles[0] + 2 * Math.PI;
    if (b - a > bestGap) {
      bestGap = b - a;
      bestAngle = a + (b - a) / 2;
    }
  }
  return { x: Math.cos(bestAngle), y: Math.sin(bestAngle) };
}

export function openPosition(g: MolGraph, id: number): { x: number; y: number } {
  const atom = atomById(g, id)!;
  const d = openDirection(g, id);
  return { x: atom.x + d.x, y: atom.y + d.y };
}

export function bounds(g: MolGraph): { minX: number; minY: number; maxX: number; maxY: number } | null {
  if (!g.atoms.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const a of g.atoms) {
    minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x);
    minY = Math.min(minY, a.y); maxY = Math.max(maxY, a.y);
  }
  return { minX, minY, maxX, maxY };
}

// ─── CONNECTIVITY ───────────────────────────────────────────────────────────

export function fragmentOf(g: MolGraph, start: number): Set<number> {
  const seen = new Set<number>([start]);
  const stack = [start];
  while (stack.length) {
    const id = stack.pop()!;
    for (const n of neighboursOf(g, id)) {
      if (!seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return seen;
}

export function fragmentCount(g: MolGraph): number {
  const seen = new Set<number>();
  let count = 0;
  for (const a of g.atoms) {
    if (seen.has(a.id)) continue;
    count++;
    fragmentOf(g, a.id).forEach((id) => seen.add(id));
  }
  return count;
}

/** Smallest ring through a bond (atom ids in order), or null if acyclic. */
export function ringThroughBond(g: MolGraph, bondId: number, maxSize = 8): number[] | null {
  const bond = bondById(g, bondId);
  if (!bond) return null;
  // BFS from a to b without using the bond itself.
  const prev = new Map<number, number>([[bond.a, -1]]);
  let frontier = [bond.a];
  for (let depth = 0; depth < maxSize && frontier.length; depth++) {
    const next: number[] = [];
    for (const id of frontier) {
      for (const b of g.bonds) {
        if (b.id === bondId) continue;
        const other = b.a === id ? b.b : b.b === id ? b.a : null;
        if (other === null || prev.has(other)) continue;
        prev.set(other, id);
        if (other === bond.b) {
          const path = [other];
          let cur = id;
          while (cur !== -1) {
            path.push(cur);
            cur = prev.get(cur)!;
          }
          return path.reverse();
        }
        next.push(other);
      }
    }
    frontier = next;
  }
  return null;
}

// ─── VALENCE ────────────────────────────────────────────────────────────────

/**
 * Normal valences of the neutral element. `h` is used to fill implicit
 * hydrogens (lowest first); `allowed` decides whether a valence is "unusual".
 * Elements not listed (metals, noble gases…) get no implicit hydrogens and no
 * warnings — the lab does not pretend to know their bonding.
 */
const VALENCE: Record<string, { h: number[]; allowed: number[]; family: "c" | "n" | "b" | "h" }> = {
  H: { h: [1], allowed: [1], family: "h" },
  B: { h: [3], allowed: [3], family: "b" },
  C: { h: [4], allowed: [4], family: "c" },
  Si: { h: [4], allowed: [4], family: "c" },
  N: { h: [3], allowed: [3], family: "n" },
  P: { h: [3, 5], allowed: [3, 5], family: "n" },
  As: { h: [3, 5], allowed: [3, 5], family: "n" },
  O: { h: [2], allowed: [2], family: "n" },
  S: { h: [2, 4, 6], allowed: [2, 4, 6], family: "n" },
  Se: { h: [2, 4, 6], allowed: [2, 4, 6], family: "n" },
  F: { h: [1], allowed: [1], family: "n" },
  Cl: { h: [1], allowed: [1, 3, 5, 7], family: "n" },
  Br: { h: [1], allowed: [1, 3, 5], family: "n" },
  I: { h: [1], allowed: [1, 3, 5, 7], family: "n" },
};

/**
 * Charge shifts valence the way isoelectronic reasoning predicts: N⁺ and O⁻
 * behave like C and F (4 and 1 bonds); C⁺ and C⁻ both have three bonds; B⁻
 * has four.
 */
export function valencesFor(el: string, charge: number): { h: number[]; allowed: number[] } {
  const v = VALENCE[el];
  if (!v) return { h: [], allowed: [] };
  const shift = (list: number[]) => {
    const out = list
      .map((n) => {
        switch (v.family) {
          case "n": return n + charge;
          case "c": return n - Math.abs(charge);
          case "b": return n - charge;
          case "h": return n - Math.abs(charge);
        }
      })
      .filter((n) => n >= 0);
    return Array.from(new Set(out)).sort((a, b) => a - b);
  };
  return { h: shift(v.h), allowed: shift(v.allowed) };
}

export function typicalValence(el: string): number | null {
  return VALENCE[el]?.h[0] ?? null;
}

function numericOrder(o: BondOrder) {
  return o === "ar" ? 1.5 : o;
}

/**
 * Chooses single/double for every aromatic bond so that each aromatic carbon
 * gets exactly one double bond; N, P, O and S may take one or none (pyridine
 * vs pyrrole nitrogen). Returns null when no such pattern exists.
 */
export function kekulize(g: MolGraph): Map<number, 1 | 2> | null {
  const aromatic = g.bonds.filter((b) => b.order === "ar");
  const result = new Map<number, 1 | 2>();
  if (!aromatic.length) return result;

  const atomMap = new Map(g.atoms.map((a) => [a.id, a]));
  // Atoms that already carry a double/triple bond outside the aromatic set
  // (e.g. a ring C=O) cannot take another.
  const saturated = new Set<number>();
  for (const b of g.bonds) {
    if (b.order === 2 || b.order === 3) {
      saturated.add(b.a);
      saturated.add(b.b);
    }
  }
  const aroAtoms = new Set<number>();
  for (const b of aromatic) {
    aroAtoms.add(b.a);
    aroAtoms.add(b.b);
  }
  const must = new Set<number>();
  const may = new Set<number>();
  for (const id of Array.from(aroAtoms)) {
    if (saturated.has(id)) continue;
    const atom = atomMap.get(id)!;
    const single = g.bonds.filter((b) => b.a === id || b.b === id).reduce((s, b) => s + (b.order === "ar" ? 1 : numericOrder(b.order)), 0);
    const { h } = valencesFor(atom.el, atom.charge);
    const target = h[0];
    if (target === undefined) continue;
    const hydrogens = atom.h ?? 0;
    const free = target - single - hydrogens;
    if (free <= 0) continue;
    if (atom.h !== null) {
      // Hydrogens fixed by the student: the atom needs a double bond exactly
      // when one bond is left over.
      if (free === 1) must.add(id);
    } else if (atom.el === "C" || atom.el === "B" || atom.el === "Si") {
      // An aromatic carbon always carries one ring double bond (its remaining
      // valence goes to an automatic hydrogen).
      must.add(id);
    } else {
      // N, P, O, S with automatic hydrogens: pyridine-type or pyrrole-type.
      may.add(id);
    }
  }

  const used = new Set<number>();
  const doubles = new Set<number>();
  const order = [...aromatic];
  const bondsOf = new Map<number, LabBond[]>();
  for (const b of order) {
    for (const id of [b.a, b.b]) {
      if (!bondsOf.has(id)) bondsOf.set(id, []);
      bondsOf.get(id)!.push(b);
    }
  }
  const pending = Array.from(must);
  let steps = 0;

  const solve = (i: number): boolean => {
    if (++steps > 200000) return false;
    while (i < pending.length && used.has(pending[i])) i++;
    if (i === pending.length) return true;
    const id = pending[i];
    for (const b of bondsOf.get(id) ?? []) {
      const other = b.a === id ? b.b : b.a;
      if (used.has(other) || !(must.has(other) || may.has(other))) continue;
      used.add(id);
      used.add(other);
      doubles.add(b.id);
      if (solve(i + 1)) return true;
      used.delete(id);
      used.delete(other);
      doubles.delete(b.id);
    }
    return false;
  };
  if (!solve(0)) return null;
  for (const b of aromatic) result.set(b.id, doubles.has(b.id) ? 2 : 1);
  return result;
}

/** Everything the panels need about validity, computed in one pass. */
export function analyse(g: MolGraph): MolReport {
  const kek = kekulize(g);
  const orders = new Map<number, number>();
  const unresolved: number[] = [];
  for (const b of g.bonds) {
    if (b.order === "ar") {
      if (kek) orders.set(b.id, kek.get(b.id)!);
      else {
        orders.set(b.id, 1.5);
        unresolved.push(b.id);
      }
    } else orders.set(b.id, b.order);
  }

  const sums = new Map<number, number>();
  const nbrs = new Map<number, number[]>();
  for (const a of g.atoms) {
    sums.set(a.id, 0);
    nbrs.set(a.id, []);
  }
  for (const b of g.bonds) {
    const o = orders.get(b.id)!;
    sums.set(b.a, (sums.get(b.a) ?? 0) + o);
    sums.set(b.b, (sums.get(b.b) ?? 0) + o);
    nbrs.get(b.a)?.push(b.b);
    nbrs.get(b.b)?.push(b.a);
  }

  const atoms = new Map<number, AtomReport>();
  let anyOver = false;
  let anyUnder = false;
  for (const a of g.atoms) {
    // 1.5 sums only happen when aromaticity could not be resolved; round up so
    // the atom is not handed a phantom hydrogen.
    const bondSum = Math.ceil(sums.get(a.id)! - 1e-9);
    const { h, allowed } = valencesFor(a.el, a.charge);
    let hydrogens: number;
    if (a.h !== null) hydrogens = a.h;
    else {
      const target = h.find((v) => v >= bondSum);
      hydrogens = target === undefined ? 0 : target - bondSum;
    }
    const used = bondSum + hydrogens;
    let status: AtomValence;
    if (!allowed.length) status = "unknown";
    else if (allowed.includes(used)) status = "ok";
    else if (used > allowed[allowed.length - 1]) status = "over";
    else status = "under";
    if (status === "over") anyOver = true;
    if (status === "under") anyUnder = true;
    atoms.set(a.id, { id: a.id, el: a.el, bondSum, hydrogens, hydrogensAuto: a.h === null, used, allowed, status, neighbours: nbrs.get(a.id)! });
  }

  let status: MolStatus;
  if (!g.atoms.length) status = "empty";
  else if (anyOver || unresolved.length) status = "invalid";
  else if (anyUnder) status = "incomplete";
  else status = "valid";

  return { status, atoms, fragments: fragmentCount(g), aromaticUnresolved: unresolved, orders };
}

// ─── FORMULA ────────────────────────────────────────────────────────────────

export interface FormulaInfo {
  counts: Record<string, number>;
  /** Hill-order formula, e.g. "C9H8O4". */
  formula: string;
  mw: number;
  /** Atoms including implicit hydrogens. */
  totalAtoms: number;
  heavyAtoms: number;
  hydrogens: number;
  charge: number;
  /** Elements that have no atomic weight in the table (their mass is left out). */
  unknownMass: string[];
}

export function hillOrder(counts: Record<string, number>): string[] {
  const els = Object.keys(counts).filter((e) => counts[e] > 0);
  if (counts.C) {
    return ["C", ...(counts.H ? ["H"] : []), ...els.filter((e) => e !== "C" && e !== "H").sort()];
  }
  return els.sort();
}

export function formulaInfo(g: MolGraph, weights: ElementWeights, report: MolReport = analyse(g)): FormulaInfo {
  const counts: Record<string, number> = {};
  let hydrogens = 0;
  let charge = 0;
  for (const a of g.atoms) {
    counts[a.el] = (counts[a.el] ?? 0) + 1;
    const h = report.atoms.get(a.id)?.hydrogens ?? 0;
    hydrogens += h;
    charge += a.charge;
  }
  if (hydrogens) counts.H = (counts.H ?? 0) + hydrogens;
  const order = hillOrder(counts);
  const formula = order.map((e) => (counts[e] > 1 ? `${e}${counts[e]}` : e)).join("");
  let mw = 0;
  const unknownMass: string[] = [];
  for (const e of order) {
    const w = weights.get(e)?.atomicWeight;
    if (w === undefined) unknownMass.push(e);
    else mw += w * counts[e];
  }
  const heavyAtoms = g.atoms.filter((a) => a.el !== "H").length;
  return { counts, formula, mw, totalAtoms: order.reduce((s, e) => s + counts[e], 0), heavyAtoms, hydrogens: counts.H ?? 0, charge, unknownMass };
}

/** "C9H8O4" → "C₉H₈O₄" */
export function subscriptFormula(formula: string): string {
  const sub = "₀₁₂₃₄₅₆₇₈₉";
  return formula.replace(/\d/g, (d) => sub[Number(d)]);
}

export function chargeLabel(charge: number): string {
  if (!charge) return "";
  const n = Math.abs(charge);
  return `${n > 1 ? n : ""}${charge > 0 ? "+" : "−"}`;
}

/**
 * A string that changes whenever the 3D structure would change: elements,
 * charges, hydrogens and bonds. Moving atoms in 2D does not change it —
 * unless a wedge/hash bond is present, because then 2D geometry decides the
 * stereochemistry.
 */
export function structureKey(g: MolGraph): string {
  const hasStereo = g.bonds.some((b) => b.stereo !== "none");
  const atoms = g.atoms
    .map((a) => `${a.id}:${a.el}:${a.charge}:${a.h ?? "a"}${hasStereo ? `@${a.x.toFixed(2)},${a.y.toFixed(2)}` : ""}`)
    .join("|");
  const bonds = g.bonds.map((b) => `${b.a}-${b.b}:${b.order}:${b.stereo}`).join("|");
  return `${atoms}#${bonds}`;
}

/** Cheap structural equality for "has the student changed the loaded molecule?" */
export function sameStructure(a: MolGraph, b: MolGraph): boolean {
  const strip = (g: MolGraph) => structureKey({ ...g, atoms: g.atoms.map((x) => ({ ...x, x: 0, y: 0 })) });
  return strip(a) === strip(b);
}

export function isMolGraph(value: unknown): value is MolGraph {
  if (!value || typeof value !== "object") return false;
  const v = value as MolGraph;
  if (!Array.isArray(v.atoms) || !Array.isArray(v.bonds) || !Number.isFinite(v.nextId)) return false;
  const ids = new Set<number>();
  for (const a of v.atoms) {
    if (!a || !Number.isFinite(a.id) || typeof a.el !== "string" || !/^[A-Z][a-z]?$/.test(a.el) || !Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(a.charge)) return false;
    if (a.h !== null && !Number.isFinite(a.h)) return false;
    ids.add(a.id);
  }
  for (const b of v.bonds) {
    if (!b || !ids.has(b.a) || !ids.has(b.b) || ![1, 2, 3, "ar"].includes(b.order) || !["none", "wedge", "hash"].includes(b.stereo)) return false;
  }
  return true;
}
