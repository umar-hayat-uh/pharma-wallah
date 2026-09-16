/*
 * Molecular Lab — rings, aromaticity and functional groups.
 *
 * Deterministic graph rules, run on the same graph the student is editing, so
 * "Analyze Structure" answers for the structure on screen — including one the
 * student has just broken. The rules cover the groups a Pharm-D organic
 * chemistry course names; anything they do not recognise is simply not
 * highlighted (never guessed). scripts/molecular-lab.test.mts checks the
 * aromaticity rule against OpenChemLib on the library molecules.
 */

import { analyse, type MolGraph, type MolReport } from "./graph";

export type GroupId =
  | "carboxylic-acid"
  | "carboxylate"
  | "ester"
  | "amide"
  | "aldehyde"
  | "ketone"
  | "hydroxyl"
  | "phenol"
  | "ether"
  | "amine"
  | "ammonium"
  | "nitro"
  | "nitrile"
  | "halogen"
  | "thiol"
  | "sulfonamide"
  | "alkene"
  | "alkyne"
  | "aromatic-ring";

export interface GroupInfo {
  name: string;
  /** One or two sentences — what the group is, then why a pharmacist cares. */
  explain: string;
}

export const GROUP_INFO: Record<GroupId, GroupInfo> = {
  "carboxylic-acid": {
    name: "Carboxylic acid",
    explain: "A carbonyl carbon that also carries an –OH (–COOH). It is weakly acidic (pKa about 3–5), so it is mostly ionised at blood pH, which raises water solubility.",
  },
  carboxylate: {
    name: "Carboxylate",
    explain: "The ionised form of a carboxylic acid (–COO⁻). Salts of acidic drugs, such as sodium salts, contain it.",
  },
  ester: {
    name: "Ester",
    explain: "An ester contains a carbonyl group attached to an oxygen-containing substituent (–COO–R). Esterases in the body hydrolyse it, which is why many prodrugs are esters.",
  },
  amide: {
    name: "Amide",
    explain: "A carbonyl carbon bonded to nitrogen (–CONR₂). The bond is planar and much harder to hydrolyse than an ester; peptide bonds are amides.",
  },
  aldehyde: {
    name: "Carbonyl — aldehyde",
    explain: "A carbonyl group (C=O) at the end of a chain, with at least one hydrogen on the carbonyl carbon. It is easily oxidised to a carboxylic acid.",
  },
  ketone: {
    name: "Carbonyl — ketone",
    explain: "A carbonyl group (C=O) whose carbon is bonded to two other carbons. The oxygen accepts hydrogen bonds.",
  },
  hydroxyl: {
    name: "Hydroxyl (alcohol)",
    explain: "An –OH on a saturated carbon. It donates and accepts hydrogen bonds, making a molecule more water-soluble.",
  },
  phenol: {
    name: "Hydroxyl (phenol)",
    explain: "An –OH directly on an aromatic ring. The ring makes it weakly acidic (pKa about 10), more acidic than an alcohol.",
  },
  ether: {
    name: "Ether",
    explain: "An oxygen bonded to two carbons (C–O–C). It accepts hydrogen bonds but cannot donate them, and is chemically quite unreactive.",
  },
  amine: {
    name: "Amino (amine)",
    explain: "A nitrogen with single bonds to carbon or hydrogen and no carbonyl next to it. Most amines are basic and protonated at blood pH — the basis of many drug salts.",
  },
  ammonium: {
    name: "Ammonium (charged nitrogen)",
    explain: "A nitrogen carrying four bonds and a positive charge. A permanent charge like this limits passage across membranes, including the blood–brain barrier.",
  },
  nitro: {
    name: "Nitro",
    explain: "An –NO₂ group, strongly electron-withdrawing. It is drawn with a formal positive charge on N and a negative charge on one O.",
  },
  nitrile: {
    name: "Nitrile",
    explain: "A carbon triple-bonded to nitrogen (–C≡N). It is linear and polar.",
  },
  halogen: {
    name: "Halogen",
    explain: "F, Cl, Br or I bonded to carbon. Halogens increase lipophilicity and can block sites of metabolism.",
  },
  thiol: {
    name: "Thiol",
    explain: "An –SH group, the sulfur analogue of an alcohol. It is easily oxidised to a disulfide (–S–S–).",
  },
  sulfonamide: {
    name: "Sulfonamide",
    explain: "A sulfonyl group bonded to nitrogen (–SO₂N<). It is the key group of the sulfa antibacterials and thiazide diuretics.",
  },
  alkene: {
    name: "Alkene (C=C)",
    explain: "A carbon–carbon double bond outside an aromatic ring. Rotation about it is restricted, which gives rise to E/Z isomers.",
  },
  alkyne: {
    name: "Alkyne (C≡C)",
    explain: "A carbon–carbon triple bond. The two carbons and their neighbours lie in a straight line.",
  },
  "aromatic-ring": {
    name: "Aromatic ring",
    explain: "A flat ring whose π electrons (4n + 2 of them) are shared around the whole ring, like benzene. Aromatic rings are stable and often stack against drug targets.",
  },
};

export interface FoundGroup {
  key: string;
  id: GroupId;
  atoms: number[];
  bonds: number[];
}

// ─── RINGS ──────────────────────────────────────────────────────────────────

/** Smallest rings (up to 8 atoms), deduplicated. Enough for drug-sized molecules. */
export function findRings(g: MolGraph, maxSize = 8): number[][] {
  const seen = new Set<string>();
  const rings: number[][] = [];
  for (const bond of g.bonds) {
    const ring = shortestRing(g, bond.a, bond.b, bond.id, maxSize);
    if (!ring) continue;
    const key = [...ring].sort((a, b) => a - b).join(",");
    if (seen.has(key)) continue;
    seen.add(key);
    rings.push(ring);
  }
  return rings.sort((a, b) => a.length - b.length);
}

function shortestRing(g: MolGraph, from: number, to: number, skipBond: number, maxSize: number): number[] | null {
  const prev = new Map<number, number>([[from, -1]]);
  let frontier = [from];
  for (let depth = 1; depth < maxSize && frontier.length; depth++) {
    const next: number[] = [];
    for (const id of frontier) {
      for (const b of g.bonds) {
        if (b.id === skipBond) continue;
        const other = b.a === id ? b.b : b.b === id ? b.a : null;
        if (other === null || prev.has(other)) continue;
        prev.set(other, id);
        if (other === to) {
          const path: number[] = [];
          let cur: number = other;
          while (cur !== -1) {
            path.push(cur);
            cur = prev.get(cur)!;
          }
          return path;
        }
        next.push(other);
      }
    }
    frontier = next;
  }
  return null;
}

function ringBonds(g: MolGraph, ring: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const bond = g.bonds.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    if (bond) out.push(bond.id);
  }
  return out;
}

/**
 * Hückel-style perception on the resolved (Kekulé) bond orders:
 * - a ring whose bonds are all drawn aromatic is aromatic;
 * - a 6-ring is aromatic when every atom has a double bond to an atom of this
 *   ring or of a fused aromatic ring (benzene, pyridine, naphthalene);
 * - a 5-ring is aromatic when it has two ring double bonds and the fifth atom
 *   is N, O or S (pyrrole, furan, thiophene, imidazole).
 * Iterates so fused systems (indole, purine) are found from their parts.
 */
export function aromaticRings(g: MolGraph, report: MolReport = analyse(g)): number[][] {
  const rings = findRings(g, 7);
  const aromatic = new Set<number>();
  const doublePartner = new Map<number, number[]>();
  for (const b of g.bonds) {
    if (report.orders.get(b.id) === 2) {
      if (!doublePartner.has(b.a)) doublePartner.set(b.a, []);
      if (!doublePartner.has(b.b)) doublePartner.set(b.b, []);
      doublePartner.get(b.a)!.push(b.b);
      doublePartner.get(b.b)!.push(b.a);
    }
  }
  const el = new Map(g.atoms.map((a) => [a.id, a.el]));
  const bondMap = new Map(g.bonds.map((b) => [b.id, b]));

  let changed = true;
  const inAromatic = new Set<number>();
  while (changed) {
    changed = false;
    rings.forEach((ring, idx) => {
      if (aromatic.has(idx)) return;
      const bonds = ringBonds(g, ring);
      if (bonds.length !== ring.length) return;
      const members = new Set(ring);
      let ok = false;
      if (bonds.every((id) => bondMap.get(id)!.order === "ar")) ok = true;
      else if (ring.length === 6) {
        ok = ring.every((id) => (doublePartner.get(id) ?? []).some((p) => members.has(p) || inAromatic.has(p)));
        // Exclude a ring whose only doubles are to exocyclic atoms of other
        // rings unless those rings are themselves aromatic (handled above).
        const internal = bonds.filter((id) => report.orders.get(id) === 2).length;
        if (internal === 0) ok = false;
      } else if (ring.length === 5) {
        const internal = bonds.filter((id) => report.orders.get(id) === 2).length;
        const withDouble = ring.filter((id) => (doublePartner.get(id) ?? []).some((p) => members.has(p) || inAromatic.has(p)));
        const rest = ring.filter((id) => !withDouble.includes(id));
        ok = internal >= 1 && withDouble.length === 4 && rest.length === 1 && ["N", "O", "S"].includes(el.get(rest[0])!) && (doublePartner.get(rest[0]) ?? []).length === 0;
      }
      if (ok) {
        aromatic.add(idx);
        ring.forEach((id) => inAromatic.add(id));
        changed = true;
      }
    });
  }
  return rings.filter((_, i) => aromatic.has(i));
}

// ─── FUNCTIONAL GROUPS ──────────────────────────────────────────────────────

export function findGroups(g: MolGraph, report: MolReport = analyse(g)): FoundGroup[] {
  const atoms = new Map(g.atoms.map((a) => [a.id, a]));
  const order = (bondId: number) => report.orders.get(bondId) ?? 1;
  const bondsOf = new Map<number, { bond: number; other: number; order: number }[]>();
  for (const a of g.atoms) bondsOf.set(a.id, []);
  for (const b of g.bonds) {
    bondsOf.get(b.a)!.push({ bond: b.id, other: b.b, order: order(b.id) });
    bondsOf.get(b.b)!.push({ bond: b.id, other: b.a, order: order(b.id) });
  }
  const H = (id: number) => report.atoms.get(id)?.hydrogens ?? 0;
  const E = (id: number) => atoms.get(id)?.el;
  const aroRings = aromaticRings(g, report);
  const aroAtoms = new Set(aroRings.flat());
  const found: FoundGroup[] = [];
  const push = (id: GroupId, atomIds: number[], bondIds: number[]) => {
    found.push({ key: `${id}:${[...atomIds].sort((a, b) => a - b).join(",")}`, id, atoms: atomIds, bonds: bondIds });
  };

  // Carbonyl carbons: C with a double bond to O that is not in an aromatic ring.
  const carbonylO = new Map<number, { o: number; bond: number }>();
  for (const a of g.atoms) {
    if (a.el !== "C") continue;
    const dO = bondsOf.get(a.id)!.find((x) => x.order === 2 && E(x.other) === "O");
    if (dO) carbonylO.set(a.id, { o: dO.other, bond: dO.bond });
  }
  const usedO = new Set<number>();
  const usedN = new Set<number>();

  for (const [c, { o, bond }] of Array.from(carbonylO)) {
    const singles = bondsOf.get(c)!.filter((x) => x.order === 1);
    const oSingle = singles.filter((x) => E(x.other) === "O");
    const nSingle = singles.filter((x) => E(x.other) === "N");
    const cSingle = singles.filter((x) => E(x.other) === "C");
    usedO.add(o);
    if (oSingle.length === 1 && nSingle.length === 0) {
      const o2 = oSingle[0].other;
      usedO.add(o2);
      const o2Carbons = bondsOf.get(o2)!.filter((x) => x.other !== c && E(x.other) === "C");
      if (atoms.get(o2)!.charge < 0 || atoms.get(o)!.charge < 0) push("carboxylate", [c, o, o2], [bond, oSingle[0].bond]);
      else if (H(o2) > 0) push("carboxylic-acid", [c, o, o2], [bond, oSingle[0].bond]);
      else if (o2Carbons.length) push("ester", [c, o, o2, o2Carbons[0].other], [bond, oSingle[0].bond, o2Carbons[0].bond]);
    } else if (nSingle.length >= 1 && oSingle.length === 0) {
      for (const n of nSingle) {
        usedN.add(n.other);
        push("amide", [c, o, n.other], [bond, n.bond]);
      }
    } else if (oSingle.length === 0 && nSingle.length === 0) {
      if (cSingle.length >= 2) push("ketone", [c, o], [bond]);
      else if (H(c) >= 1) push("aldehyde", [c, o], [bond]);
    }
  }

  for (const a of g.atoms) {
    // Hydrogens the student drew as atoms count like implicit ones.
    const all = bondsOf.get(a.id)!;
    const nb = all.filter((x) => E(x.other) !== "H");
    const hydrogens = H(a.id) + (all.length - nb.length);
    if (a.el === "O" && !usedO.has(a.id) && !aroAtoms.has(a.id)) {
      const carbons = nb.filter((x) => x.order === 1 && E(x.other) === "C");
      if (nb.length === 1 && carbons.length === 1 && hydrogens >= 1 && a.charge === 0) {
        push(aroAtoms.has(carbons[0].other) ? "phenol" : "hydroxyl", [a.id, carbons[0].other], [carbons[0].bond]);
      } else if (nb.length === 2 && carbons.length === 2 && a.charge === 0) {
        push("ether", [a.id, carbons[0].other, carbons[1].other], [carbons[0].bond, carbons[1].bond]);
      }
    }
    if (a.el === "N" && !usedN.has(a.id) && !aroAtoms.has(a.id)) {
      const hasMultiple = nb.some((x) => x.order > 1);
      const nextToCarbonyl = nb.some((x) => carbonylO.has(x.other));
      const nextToO = nb.some((x) => E(x.other) === "O");
      const nextToSO2 = nb.some((x) => E(x.other) === "S");
      if (a.charge > 0 && nextToO) {
        const os = nb.filter((x) => E(x.other) === "O");
        if (os.length === 2) push("nitro", [a.id, ...os.map((x) => x.other)], os.map((x) => x.bond));
      } else if (!hasMultiple && !nextToCarbonyl && !nextToO && !nextToSO2 && nb.some((x) => E(x.other) === "C")) {
        const partners = nb.filter((x) => E(x.other) === "C");
        push(a.charge > 0 ? "ammonium" : "amine", [a.id, ...partners.map((x) => x.other)], partners.map((x) => x.bond));
      }
    }
    if (a.el === "N" && a.charge === 0) {
      const os = nb.filter((x) => E(x.other) === "O" && x.order === 2);
      if (os.length === 2) push("nitro", [a.id, ...os.map((x) => x.other)], os.map((x) => x.bond));
    }
    if (a.el === "C") {
      const triN = nb.find((x) => x.order === 3 && E(x.other) === "N");
      if (triN) push("nitrile", [a.id, triN.other], [triN.bond]);
      const halos = nb.filter((x) => ["F", "Cl", "Br", "I"].includes(E(x.other)!));
      for (const hx of halos) push("halogen", [hx.other, a.id], [hx.bond]);
    }
    if (a.el === "S") {
      const carbons = nb.filter((x) => E(x.other) === "C" && x.order === 1);
      if (nb.length === 1 && carbons.length === 1 && hydrogens >= 1) push("thiol", [a.id, carbons[0].other], [carbons[0].bond]);
      const oxo = nb.filter((x) => E(x.other) === "O" && x.order === 2);
      const ns = nb.filter((x) => E(x.other) === "N" && x.order === 1);
      if (oxo.length === 2 && ns.length >= 1) {
        push("sulfonamide", [a.id, ...oxo.map((x) => x.other), ns[0].other], [...oxo.map((x) => x.bond), ns[0].bond]);
      }
    }
  }

  const aroBondSet = new Set(aroRings.flatMap((r) => ringBonds(g, r)));
  for (const b of g.bonds) {
    if (E(b.a) !== "C" || E(b.b) !== "C" || aroBondSet.has(b.id)) continue;
    const o = order(b.id);
    if (o === 2) push("alkene", [b.a, b.b], [b.id]);
    if (o === 3) push("alkyne", [b.a, b.b], [b.id]);
  }

  for (const ring of aroRings) push("aromatic-ring", ring, ringBonds(g, ring));

  return found;
}
