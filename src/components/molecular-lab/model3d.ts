import type { MolGraph } from "./graph";
import { conformerToMolfile, type Conformer3D } from "./molfile";
import type { Model3D } from "./Viewer3D";

/**
 * Turns a conformer into what the 3D view draws, keeping the mapping from
 * every 3D atom back to the graph so picks and highlights line up.
 */
export function conformerModel(c: Conformer3D, g: MolGraph, key: string, name: string): Model3D {
  const selfIndex = new Map<number, number>();
  c.atoms.forEach((a, i) => {
    if (a.self) selfIndex.set(a.parent, i);
  });
  const bonds: Model3D["bonds"] = [];
  for (const b of g.bonds) {
    const ia = selfIndex.get(b.a);
    const ib = selfIndex.get(b.b);
    if (ia !== undefined && ib !== undefined) bonds.push({ id: b.id, a: ia, b: ib });
  }
  return {
    key,
    text: conformerToMolfile(c, name),
    format: "sdf",
    parents: c.atoms.map((a) => a.parent),
    isSelf: c.atoms.map((a) => a.self),
    positions: c.atoms.map((a) => a.pos),
    elements: c.atoms.map((a) => a.el),
    charges: c.atoms.map((a) => a.charge),
    bonds,
  };
}
