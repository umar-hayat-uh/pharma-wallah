/*
 * Molecular Lab — Learning Mode tasks.
 *
 * Tasks are generated from the molecule on screen (never from a fixed answer
 * key), so they work for any library molecule or a student's own drawing, and
 * a task is only offered when the molecule can actually answer it.
 * Checking is pure: selection tasks compare the selected ids with the answer;
 * edit tasks inspect the graph after the student's change.
 */

import { analyse, atomById, bondById, type MolGraph } from "./graph";
import { aromaticRings, findGroups } from "./groups";

export type LearningTask =
  | { key: string; kind: "select-atoms"; prompt: string; hint: string; answer: number[] }
  | { key: string; kind: "select-ring"; prompt: string; hint: string; rings: number[][] }
  | { key: string; kind: "select-bond"; prompt: string; hint: string; bonds: number[] }
  | { key: string; kind: "make-double"; prompt: string; hint: string; bond: number; atoms: [number, number] }
  | { key: string; kind: "remove-atoms"; prompt: string; hint: string; atoms: number[] }
  | { key: string; kind: "add-element"; prompt: string; hint: string; el: string; baseline: number };

export type TaskResult = "correct" | "partial" | "wrong" | "pending";

const ELEMENT_NAMES: Record<string, string> = { O: "oxygen", N: "nitrogen", S: "sulfur", Cl: "chlorine", F: "fluorine" };

export function generateTasks(g: MolGraph): LearningTask[] {
  const report = analyse(g);
  const tasks: LearningTask[] = [];
  const count = (el: string) => g.atoms.filter((a) => a.el === el).length;

  for (const el of ["O", "N"]) {
    const ids = g.atoms.filter((a) => a.el === el).map((a) => a.id);
    if (!ids.length) continue;
    tasks.push({
      key: `select-${el}`,
      kind: "select-atoms",
      prompt: `Identify the ${ELEMENT_NAMES[el]} atoms.`,
      hint: `Select every ${el} atom — there ${ids.length === 1 ? "is 1" : `are ${ids.length}`}. Tap each one, then check.`,
      answer: ids,
    });
  }

  const groups = findGroups(g, report);
  const rings = aromaticRings(g, report);
  const ringBondIds = new Set(groups.filter((x) => x.id === "aromatic-ring").flatMap((x) => x.bonds));

  const carbonyls = g.bonds.filter((b) => {
    const els = [atomById(g, b.a)?.el, atomById(g, b.b)?.el].sort().join("");
    return report.orders.get(b.id) === 2 && els === "CO";
  });
  const plainDoubles = g.bonds.filter((b) => report.orders.get(b.id) === 2 && !ringBondIds.has(b.id));
  if (carbonyls.length) {
    tasks.push({
      key: "bond-carbonyl",
      kind: "select-bond",
      prompt: carbonyls.length === 1 ? "Find the C=O double bond." : "Find a C=O double bond.",
      hint: "A carbonyl is a carbon double-bonded to an oxygen — look for the doubled line to an O.",
      bonds: carbonyls.map((b) => b.id),
    });
  } else if (plainDoubles.length) {
    tasks.push({
      key: "bond-double",
      kind: "select-bond",
      prompt: "Find the double bond.",
      hint: "A double bond is drawn as two parallel lines.",
      bonds: plainDoubles.map((b) => b.id),
    });
  }

  if (rings.length) {
    tasks.push({
      key: "ring-aromatic",
      kind: "select-ring",
      prompt: rings.length === 1 ? "Identify the aromatic ring." : "Identify one of the aromatic rings.",
      hint: `Select all ${rings[0].length} atoms of a flat ring with alternating double bonds, then check.`,
      rings,
    });
  }

  // A C–C single bond whose carbons both still carry a hydrogen can become C=C
  // without breaking valence.
  const candidate = g.bonds.find((b) => {
    if (b.order !== 1 || b.stereo !== "none" || ringBondIds.has(b.id)) return false;
    const a = report.atoms.get(b.a);
    const c = report.atoms.get(b.b);
    return a?.el === "C" && c?.el === "C" && a.hydrogens >= 1 && c.hydrogens >= 1 && a.status === "ok" && c.status === "ok";
  });
  if (candidate) {
    tasks.push({
      key: `make-double-${candidate.id}`,
      kind: "make-double",
      prompt: "Change the highlighted single bond to a double bond.",
      hint: "Select the highlighted bond, then choose Double in the bond toolbar.",
      bond: candidate.id,
      atoms: [candidate.a, candidate.b],
    });
  }

  const hydroxyl = groups.find((x) => x.id === "hydroxyl" || x.id === "phenol");
  if (hydroxyl) {
    const o = hydroxyl.atoms.find((id) => atomById(g, id)?.el === "O")!;
    tasks.push({
      key: `remove-oh-${o}`,
      kind: "remove-atoms",
      prompt: "Remove the hydroxyl group.",
      hint: "The hydroxyl is an O with an H, single-bonded to carbon. Select its oxygen and delete it.",
      atoms: [o],
    });
  }

  tasks.push({
    key: "add-N",
    kind: "add-element",
    prompt: "Add a nitrogen atom.",
    hint: "Choose N from the element picker, then tap an atom to attach it (or tap empty space).",
    el: "N",
    baseline: count("N"),
  });

  return tasks;
}

function sameSet(a: Iterable<number>, b: Iterable<number>) {
  const x = new Set(a);
  const y = new Set(b);
  if (x.size !== y.size) return false;
  for (const v of Array.from(x)) if (!y.has(v)) return false;
  return true;
}

/** For selection tasks. `partial` means "right so far, keep going". */
export function checkSelection(task: LearningTask, atoms: number[], bonds: number[]): TaskResult {
  switch (task.kind) {
    case "select-atoms": {
      if (!atoms.length) return bonds.length ? "wrong" : "pending";
      if (sameSet(atoms, task.answer) && bonds.length === 0) return "correct";
      const answer = new Set(task.answer);
      return atoms.every((a) => answer.has(a)) && bonds.length === 0 ? "partial" : "wrong";
    }
    case "select-ring": {
      if (!atoms.length) return bonds.length ? "wrong" : "pending";
      if (task.rings.some((r) => sameSet(r, atoms))) return "correct";
      return task.rings.some((r) => atoms.every((a) => r.includes(a))) ? "partial" : "wrong";
    }
    case "select-bond": {
      // Picking atoms for a bond question is an answer too — a wrong one.
      if (!bonds.length) return atoms.length ? "wrong" : "pending";
      return bonds.length === 1 && task.bonds.includes(bonds[0]) ? "correct" : "wrong";
    }
    default:
      return "pending";
  }
}

/** For edit tasks, evaluated after every change to the structure. */
export function checkEdit(task: LearningTask, g: MolGraph): TaskResult {
  switch (task.kind) {
    case "make-double": {
      const bond = bondById(g, task.bond);
      if (!bond) return "wrong";
      return bond.order === 2 ? "correct" : "pending";
    }
    case "remove-atoms":
      return task.atoms.every((id) => !atomById(g, id)) ? "correct" : "pending";
    case "add-element":
      return g.atoms.filter((a) => a.el === task.el).length > task.baseline ? "correct" : "pending";
    default:
      return "pending";
  }
}

/** Ids to highlight when the student asks to see the answer. */
export function answerFor(task: LearningTask): { atoms: number[]; bonds: number[] } {
  switch (task.kind) {
    case "select-atoms": return { atoms: task.answer, bonds: [] };
    case "select-ring": return { atoms: task.rings[0], bonds: [] };
    case "select-bond": return { atoms: [], bonds: task.bonds.slice(0, 1) };
    case "make-double": return { atoms: [], bonds: [task.bond] };
    case "remove-atoms": return { atoms: task.atoms, bonds: [] };
    case "add-element": return { atoms: [], bonds: [] };
  }
}
