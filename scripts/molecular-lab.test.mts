/**
 * Tests for Molecular Lab's chemistry layer.
 *
 *   node --test scripts/molecular-lab.test.mts
 *
 * No framework: Node's type stripping plus a resolve hook so the app's
 * extensionless imports work (scripts/lib/ts-resolve.mjs). OpenChemLib runs
 * from node_modules, so parsing, layout, 3D and SMILES are the real engine.
 */
import { register } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";

register("./lib/ts-resolve.mjs", import.meta.url);

const OCL = await import("openchemlib");
OCL.Resources.registerFromNodejs();
const G = await import("../src/components/molecular-lab/graph.ts");
const groupsMod = await import("../src/components/molecular-lab/groups.ts");
const core = await import("../src/components/molecular-lab/chem-core.ts");
const mf = await import("../src/components/molecular-lab/molfile.ts");
const learn = await import("../src/components/molecular-lab/learning.ts");
const meas = await import("../src/components/molecular-lab/measure.ts");
const hist = await import("../src/components/molecular-lab/history.ts");
const { LIBRARY } = await import("../src/components/molecular-lab/library-data.ts");
const { ELEMENT_MAP } = await import("../src/app/(site)/calculation-tools/(tools)/molecular-weight-finder/_elements.ts");

const info = (g: any) => G.formulaInfo(g, ELEMENT_MAP);
const smiles = (s: string) => core.fromSmiles(OCL, s).graph;
const canon = (s: string) => OCL.Molecule.fromSmiles(s).getIDCode();

// ─── Building from scratch ──────────────────────────────────────────────────

test("atoms: C, O, N placed alone get implicit hydrogens", () => {
  let g = G.emptyGraph();
  g = G.addAtom(g, "C", 0, 0).graph;
  assert.equal(info(g).formula, "CH4");
  g = G.addAtom(g, "O", 3, 0).graph;
  g = G.addAtom(g, "N", 6, 0).graph;
  assert.equal(info(g).formula, "CH9NO"); // CH4 + H2O + NH3
  assert.equal(G.analyse(g).status, "valid");
  assert.equal(G.analyse(g).fragments, 3);
});

test("bonds: C–C, C=C, C≡C give ethane, ethene, ethyne", () => {
  let g = G.addAtom(G.emptyGraph(), "C", 0, 0).graph;
  const r = G.addBondedAtom(g, 1, "C")!;
  g = r.graph;
  const bond = g.bonds[0].id;
  assert.equal(info(g).formula, "C2H6");
  g = G.setBondOrder(g, bond, 2);
  assert.equal(info(g).formula, "C2H4");
  g = G.setBondOrder(g, bond, 3);
  assert.equal(info(g).formula, "C2H2");
  assert.equal(info(g).mw.toFixed(2), "26.04");
});

test("ethanol drawn by hand matches PubChem formula and weight", () => {
  let g = G.addAtom(G.emptyGraph(), "C", 0, 0).graph;
  g = G.addBondedAtom(g, 1, "C")!.graph;
  const c2 = g.atoms[1].id;
  g = G.addBondedAtom(g, c2, "O")!.graph;
  const f = info(g);
  assert.equal(f.formula, "C2H6O");
  assert.ok(Math.abs(f.mw - 46.07) < 0.01, `mw ${f.mw}`);
  assert.equal(groupsMod.findGroups(g).map((x) => x.id).join(), "hydroxyl");
});

test("delete bond and delete atom", () => {
  let g = smiles("CCO");
  const co = g.bonds.find((b) => g.atoms.find((a) => a.id === b.b)?.el === "O" || g.atoms.find((a) => a.id === b.a)?.el === "O")!;
  const noBond = G.deleteItems(g, [], [co.id]);
  assert.equal(noBond.bonds.length, 1);
  assert.equal(info(noBond).formula, "C2H8O"); // ethane + water
  const o = g.atoms.find((a) => a.el === "O")!;
  g = G.deleteItems(g, [o.id]);
  assert.equal(g.atoms.length, 2);
  assert.equal(g.bonds.length, 1);
  assert.equal(info(g).formula, "C2H6");
});

test("break bond keeps hydrogens: radicals, reported incomplete, never healed", () => {
  const g = smiles("CC");
  const broken = G.breakBond(g, g.bonds[0].id);
  const r = G.analyse(broken);
  assert.equal(r.status, "incomplete");
  assert.equal(info(broken).formula, "C2H6");
  assert.ok(Array.from(r.atoms.values()).every((a) => a.status === "under" && a.hydrogens === 3));
  // Smaller side was moved apart.
  const [a, b] = broken.atoms;
  assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > 1.3);
});

test("charge: N+ takes four bonds, O− one; carbon with 5 bonds is flagged, not fixed", () => {
  let g = smiles("CN");
  const n = g.atoms.find((a) => a.el === "N")!;
  g = G.setCharge(g, n.id, 1);
  assert.equal(info(g).formula, "CH6N");
  assert.equal(info(g).charge, 1);
  let o = smiles("CO");
  const oa = o.atoms.find((a) => a.el === "O")!;
  o = G.setCharge(o, oa.id, -1);
  assert.equal(info(o).formula, "CH3O");
  let c = G.addAtom(G.emptyGraph(), "C", 0, 0).graph;
  c = G.setHydrogens(c, 1, 5);
  const rep = G.analyse(c);
  assert.equal(rep.status, "invalid");
  assert.equal(rep.atoms.get(1)!.status, "over");
  assert.equal(info(c).formula, "CH5");
});

test("undo / redo every operation, and a drag is one step", () => {
  let h = hist.initHistory(G.emptyGraph());
  const steps: any[] = [];
  let g = G.addAtom(G.emptyGraph(), "C", 0, 0).graph;
  steps.push(g);
  g = G.addBondedAtom(g, 1, "O")!.graph;
  steps.push(g);
  g = G.setBondOrder(g, g.bonds[0].id, 2);
  steps.push(g);
  g = G.setCharge(g, 1, 1);
  steps.push(g);
  g = G.setElement(g, [2], "N");
  steps.push(g);
  for (const s of steps) h = hist.historyReducer(h, { type: "commit", graph: s, label: "x" });
  const base = h.present;
  h = hist.historyReducer(h, { type: "preview", graph: G.moveAtoms(base, [1], 0.1, 0) });
  h = hist.historyReducer(h, { type: "preview", graph: G.moveAtoms(base, [1], 0.5, 0) });
  h = hist.historyReducer(h, { type: "commit", graph: G.moveAtoms(base, [1], 1, 0), label: "move", from: base });
  assert.equal(h.past.length, 6);
  h = hist.historyReducer(h, { type: "undo" });
  assert.equal(h.present, base);
  for (let i = steps.length - 2; i >= 0; i--) {
    h = hist.historyReducer(h, { type: "undo" });
    assert.equal(h.present, steps[i]);
  }
  h = hist.historyReducer(h, { type: "undo" });
  assert.equal(h.present.atoms.length, 0);
  for (let i = 0; i < steps.length; i++) {
    h = hist.historyReducer(h, { type: "redo" });
    assert.equal(h.present, steps[i]);
  }
});

test("formula after modifications: C=N+ iminium is CH4N", () => {
  let g = G.addAtom(G.emptyGraph(), "C", 0, 0).graph;
  g = G.addBondedAtom(g, 1, "N", 2)!.graph;
  g = G.setCharge(g, 2, 1);
  assert.equal(info(g).formula, "CH4N");
});

// ─── Aromaticity and rings ──────────────────────────────────────────────────

test("aromatic bonds kekulize: benzene, pyridine, pyrrole", () => {
  for (const [el, formula, nH] of [["C", "C6H6", 0], ["N", "C5H5N", 0]] as const) {
    let g = G.addRing(G.emptyGraph(), 6, { x: 0, y: 0 }).graph;
    g = { ...g, bonds: g.bonds.map((b) => ({ ...b, order: "ar" as const })) };
    if (el === "N") g = G.setElement(g, [g.atoms[0].id], "N");
    assert.equal(info(g).formula, formula);
    assert.equal(G.analyse(g).atoms.get(g.atoms[0].id)!.hydrogens, el === "N" ? nH : 1);
  }
  let p = G.addRing(G.emptyGraph(), 5, { x: 0, y: 0 }).graph;
  p = { ...p, bonds: p.bonds.map((b) => ({ ...b, order: "ar" as const })) };
  p = G.setElement(p, [p.atoms[0].id], "N");
  assert.equal(info(p).formula, "C4H5N");
  // An impossible aromatic chain is reported, not guessed.
  let bad = G.addAtom(G.emptyGraph(), "C", 0, 0).graph;
  bad = G.addBondedAtom(bad, 1, "C", "ar")!.graph;
  bad = G.addBondedAtom(bad, 2, "C", "ar")!.graph;
  assert.equal(G.analyse(bad).status, "invalid");
  assert.equal(mf.graphToMolfile(bad, "x"), null);
});

test("benzene ring template is Kekulé and fusing a ring onto a bond shares it", () => {
  let g = G.addRing(G.emptyGraph(), "benzene", { x: 0, y: 0 }).graph;
  assert.equal(info(g).formula, "C6H6");
  const fused = G.addRing(g, "benzene", { bond: g.bonds[0].id }).graph;
  assert.equal(fused.atoms.length, 10);
  assert.equal(groupsMod.aromaticRings(fused).length, 2);
});

test("aromatic perception agrees with OpenChemLib on every library molecule", () => {
  for (const e of LIBRARY) {
    const g = smiles(e.smiles);
    const mine = new Set(groupsMod.aromaticRings(g).flat());
    const theirs = new Set(core.oclAromaticAtoms(OCL, g));
    assert.deepEqual([...mine].sort((a, b) => a - b), [...theirs].sort((a, b) => a - b), e.name);
  }
});

// ─── Library round trips ────────────────────────────────────────────────────

test("every library molecule: formula and weight match PubChem, valid, SMILES round-trips", () => {
  assert.ok(LIBRARY.length >= 80);
  for (const e of LIBRARY) {
    const g = smiles(e.smiles);
    const f = info(g);
    assert.equal(f.formula, e.formula.replace(/[+-]$/, ""), e.name);
    assert.ok(Math.abs(f.mw - e.mw) < 0.05, `${e.name}: ${f.mw} vs ${e.mw}`);
    assert.equal(G.analyse(g).status, "valid", e.name);
    assert.equal(canon(core.toSmiles(OCL, g)), canon(e.smiles), `${e.name} SMILES`);
    // MOL export reads back to the same structure.
    const mol = mf.graphToMolfile(g, e.name)!;
    assert.equal(OCL.Molecule.fromMolfile(mol).getIDCode(), canon(e.smiles), `${e.name} MOL`);
  }
});

test("known molecular weights: aspirin 180.16, paracetamol 151.16, caffeine 194.19", () => {
  const byId = (id: string) => LIBRARY.find((e: any) => e.id === id)!;
  assert.equal(info(smiles(byId("aspirin").smiles)).mw.toFixed(2), "180.16");
  assert.ok(Math.abs(info(smiles(byId("paracetamol").smiles)).mw - 151.16) < 0.01);
  assert.ok(Math.abs(info(smiles(byId("caffeine").smiles)).mw - 194.19) < 0.01);
});

test("functional groups on aspirin, paracetamol, nitrobenzene, sulfamethoxazole", () => {
  const ids = (s: string) => new Set(groupsMod.findGroups(smiles(s)).map((x) => x.id));
  assert.deepEqual([...ids("CC(=O)OC1=CC=CC=C1C(=O)O")].sort(), ["aromatic-ring", "carboxylic-acid", "ester"]);
  assert.deepEqual([...ids("CC(=O)NC1=CC=C(O)C=C1")].sort(), ["amide", "aromatic-ring", "phenol"]);
  assert.ok(ids("C1=CC=C(C=C1)[N+](=O)[O-]").has("nitro"));
  assert.ok(ids("CC1=CC(=NO1)NS(=O)(=O)C2=CC=C(C=C2)N").has("sulfonamide"));
});

test("stereo survives layout, SMILES and 3D (L-alanine stays L)", () => {
  const s = "C[C@@H](C(=O)O)N";
  const g = smiles(s);
  assert.equal(canon(core.toSmiles(OCL, g)), canon(s));
  const laid = core.layout2D(OCL, G.moveAtoms(g, [g.atoms[0].id], 0.3, 0.2));
  assert.equal(canon(core.toSmiles(OCL, laid)), canon(s));
  const c = core.generateConformer(OCL, g).conformer;
  const back = OCL.Molecule.fromMolfile(mf.conformerToMolfile(c, "ala"));
  back.ensureHelperArrays(OCL.Molecule.cHelperParities);
  assert.equal(back.getIDCode(), canon(s));
});

// ─── 3D ─────────────────────────────────────────────────────────────────────

test("2D → 3D: conformer has every hydrogen, maps to graph atoms, sensible bond lengths", () => {
  const g = smiles("CCO");
  const { conformer, minimised } = core.generateConformer(OCL, g);
  assert.equal(conformer.atoms.length, 9);
  assert.ok(minimised);
  const selfs = conformer.atoms.filter((a) => a.self);
  assert.deepEqual(selfs.map((a) => a.parent).sort(), g.atoms.map((a) => a.id).sort());
  const cIdx = conformer.atoms.findIndex((a) => a.self && a.el === "C" && conformer.bonds.some((b) => (b.a === conformer.atoms.indexOf(a) || b.b === conformer.atoms.indexOf(a)) && conformer.atoms[b.a === conformer.atoms.indexOf(a) ? b.b : b.a].el === "O"));
  const oIdx = conformer.atoms.findIndex((a) => a.el === "O");
  const d = meas.distance(conformer.atoms[cIdx].pos, conformer.atoms[oIdx].pos);
  assert.ok(d > 1.38 && d < 1.46, `C–O ${d}`);
  // Adding an –OH in 2D changes the 3D model: ethylene glycol has 10 atoms.
  const g2 = G.addGroup(g, g.atoms[0].id, "OH").graph;
  assert.notEqual(G.structureKey(g2), G.structureKey(g));
  assert.equal(core.generateConformer(OCL, g2).conformer.atoms.length, 10);
});

test("a radical keeps its hydrogen count in 3D", () => {
  const g = smiles("CC");
  const broken = G.breakBond(g, g.bonds[0].id);
  const { conformer } = core.generateConformer(OCL, broken);
  assert.equal(conformer.atoms.filter((a) => a.el === "H").length, 6);
});

test("measurements: distance, angle and dihedral on known geometry", () => {
  const o = { x: 0, y: 0, z: 0 };
  assert.equal(meas.distance(o, { x: 3, y: 4, z: 0 }), 5);
  assert.ok(Math.abs(meas.angle({ x: 1, y: 0, z: 0 }, o, { x: 0, y: 1, z: 0 }) - 90) < 1e-9);
  const d = meas.dihedral({ x: 1, y: 0, z: 0 }, o, { x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 1 });
  assert.ok(Math.abs(Math.abs(d) - 90) < 1e-9, `dihedral ${d}`);
  assert.equal(meas.measure("angle", [o, o]), null);
  // Water from MMFF: H–O–H near 104–106°.
  const w = core.generateConformer(OCL, smiles("O")).conformer;
  const oi = w.atoms.findIndex((a) => a.el === "O");
  const hs = w.atoms.map((a, i) => i).filter((i) => w.atoms[i].el === "H");
  const ang = meas.angle(w.atoms[hs[0]].pos, w.atoms[oi].pos, w.atoms[hs[1]].pos);
  assert.ok(ang > 100 && ang < 110, `H-O-H ${ang}`);
});

// ─── Files ──────────────────────────────────────────────────────────────────

test("PubChem-style 3D SDF: hydrogens fold into counts and the coordinates are kept", () => {
  const g = smiles("CC(=O)O");
  const c = core.generateConformer(OCL, g).conformer;
  const text = mf.toSdf(mf.conformerToMolfile(c, "acetic acid"));
  const loaded = core.fromMolfile(OCL, text);
  assert.equal(loaded.graph.atoms.length, 4);
  assert.ok(loaded.graph.atoms.every((a) => a.h === null));
  assert.equal(info(loaded.graph).formula, "C2H4O2");
  assert.equal(loaded.conformer!.atoms.length, 8);
  assert.equal(loaded.conformer!.atoms.filter((a) => a.self).length, 4);
});

test("bad input fails with a message, not a crash", () => {
  assert.throws(() => core.fromSmiles(OCL, "C1CC(("), /interpret/);
  assert.throws(() => core.fromMolfile(OCL, "not a molfile"), (e: any) => e.code === "parse");
  assert.equal(G.isMolGraph({ atoms: [{ id: 1, el: "C", x: 0, y: 0, charge: 0, h: null }], bonds: [{ id: 2, a: 1, b: 9, order: 1, stereo: "none" }], nextId: 3 }), false);
});

// ─── Learning ───────────────────────────────────────────────────────────────

test("learning tasks on paracetamol: generated, checked, answers revealable", () => {
  const g = smiles("CC(=O)NC1=CC=C(O)C=C1");
  const tasks = learn.generateTasks(g);
  const kinds = tasks.map((t) => t.kind);
  for (const k of ["select-atoms", "select-bond", "select-ring", "remove-atoms", "add-element"]) assert.ok(kinds.includes(k as any), k);
  // Paracetamol has no C–C single bond whose carbons both carry H, so no such task.
  assert.ok(!kinds.includes("make-double"));
  const oxy = tasks.find((t) => t.key === "select-O")!;
  const os = g.atoms.filter((a) => a.el === "O").map((a) => a.id);
  assert.equal(learn.checkSelection(oxy, [os[0]], []), "partial");
  assert.equal(learn.checkSelection(oxy, os, []), "correct");
  assert.equal(learn.checkSelection(oxy, [g.atoms[0].id], []), "wrong");
  const ring = tasks.find((t) => t.kind === "select-ring")!;
  assert.equal(learn.checkSelection(ring, learn.answerFor(ring).atoms, []), "correct");
  const propanol = smiles("CCCO");
  const dbl = learn.generateTasks(propanol).find((t) => t.kind === "make-double") as any;
  assert.ok(dbl);
  assert.equal(learn.checkEdit(dbl, propanol), "pending");
  assert.equal(learn.checkEdit(dbl, G.setBondOrder(propanol, dbl.bond, 2)), "correct");
  const oh = tasks.find((t) => t.kind === "remove-atoms") as any;
  assert.equal(learn.checkEdit(oh, G.deleteItems(g, oh.atoms)), "correct");
  const addN = tasks.find((t) => t.kind === "add-element")!;
  assert.equal(learn.checkEdit(addN, G.addBondedAtom(g, g.atoms[0].id, "N")!.graph), "correct");
});
