# Molecular Lab

## Purpose
Change or extend `/molecular-lab` — the 2D/3D molecule editor that replaced the Molecule Viewer
(2026-09-16) — without breaking the one rule everything depends on: **the molecule graph is the only
copy of the structure.**

## Trigger Examples
- "add a tool / group / ring template to Molecular Lab"
- "the formula / weight / hydrogens are wrong for X"
- "add a molecule or a category to the library"
- "3D doesn't update / measurement is off / a new export format"
- "Molecule Viewer" anything (the old route redirects here)

## Read First
- `src/components/molecular-lab/graph.ts` — types, every edit operation, valence, kekulisation, formula.
- `src/components/molecular-lab/MolecularLab.tsx` — state, conformer lifecycle, loading, layout.
- `CLAUDE.md` §6 rule 18 and `.claude/MEMORY.md` gotchas 98–105.

## Architecture Context

```
user action ─► graph.ts op (pure) ─► history commit ─► analyse() ─► 2D (drawing.ts → Editor2D)
                                                      ├► formula / groups / learning (sync, no library)
                                                      └► structureKey changed? ─► worker: conformer
                                                                                   └► model3d.ts → Viewer3D
```

| File | Role |
| --- | --- |
| `graph.ts` | `MolGraph` (atoms `{id, el, x, y, charge, h}`, bonds `{id, a, b, order, stereo}`), pure edits, `analyse()` (valence per atom, status, Kekulé orders), `formulaInfo()`, `structureKey()` |
| `groups.ts` | rings, aromaticity (Hückel rules on Kekulé orders), functional groups + explanations |
| `learning.ts` | task generation from the molecule on screen, `checkSelection` / `checkEdit` |
| `measure.ts` | distance / angle / dihedral |
| `history.ts` | undo/redo reducer; `preview` during a drag, one `commit` with `from` at the end |
| `molfile.ts` | own V2000 reader/writer (keeps file-atom → graph-atom mapping for PubChem 3D records) |
| `chem-core.ts` | the OpenChemLib bridge: SMILES/V3000 in, 2D layout, conformer + MMFF94s+, SMILES out, MCS |
| `chem-tasks.ts` / `chem.worker.ts` / `chem.ts` | worker protocol, worker, page client with main-thread fallback |
| `drawing.ts` | the 2D drawing as shapes — used by the editor **and** SVG/PNG export |
| `Editor2D.tsx` | SVG editor: tools, pointer/pinch/wheel, hit testing (`data-atom` / `data-bond` hooks) |
| `Viewer3D.tsx` | 3Dmol (npm, lazy), picks, highlights, measurement overlay, two-finger pan, aspect fit |
| `library.ts` + `library-data.ts` | example library (**generated** — see below) and local search |
| `pubchem.ts` | PubChem / RCSB fetches, straight from the browser |
| `storage.ts` | My Molecules + autosave session (localStorage) |
| `panels.tsx`, `ElementPicker.tsx`, `LibraryPanel.tsx`, `ComparePanel.tsx`, `ui.tsx`, `lab.css` | UI |

### Invariants
- **Hydrogens:** `h: null` = automatic; a number = the student's choice, never changed silently.
  `breakBond` fixes both ends' counts (homolytic → "incomplete"); `deleteItems` does not.
- **Never block, never auto-fix.** Unusual structures are reported (`status: "invalid" | "incomplete"`)
  with an Undo toast. Experiment Mode only mutes the toast.
- **Deterministic chemistry only.** Formula/weight/valence/groups come from `graph.ts`/`groups.ts`
  with the IUPAC weights in `molecular-weight-finder/_elements.ts`. No AI.
- **3D is derived.** A conformer is stored with the `structureKey` and the graph it was made from;
  a mismatch shows "Updating 3D…"/"Update 3D", never a silently wrong model. Measurements are only
  offered on a fresh conformer and say where the coordinates came from.
- **Pharmacology is kept apart** (`PharmaCard`) and hidden once the structure is modified.
- **View-only mode** (proteins, mol2/xyz/cif, >250 heavy atoms) keeps the old viewer's cartoon,
  colour schemes and surfaces; editing is disabled.

## Procedure

### Adding an edit operation
1. Write it in `graph.ts` as a pure function returning a new graph. No React.
2. Call it from `Editor2D.tap()` (tool) or `MolecularLab` `actions` (panel) through `commit(next, label)`.
3. Add a test in `scripts/molecular-lab.test.mts` (formula before/after, undo via `historyReducer`).

### Adding a functional group
Add the id to `GroupId`, a `GROUP_INFO` entry (name + one or two sentences), and the rule in
`findGroups`. Test it on a real molecule's SMILES.

### Adding library molecules or categories
Edit `WANT` (and `MESH` for a new pharmacological category) in
`scripts/build-molecule-library.mts`, then run `node scripts/build-molecule-library.mts` (needs
network, ~2 min). It **refuses to write** if the lab's formula or weight disagrees with PubChem.
Never hand-edit `library-data.ts`. Drug categories come only from PubChem's MeSH Pharmacological
Classification; structural categories only from the lab's own rules.

## Files Usually Involved
`src/components/molecular-lab/*`, `src/app/(site)/molecular-lab/page.tsx`,
`scripts/molecular-lab.test.mts`, `scripts/build-molecule-library.mts`, `next.config.mjs` (redirect).

## Common Pitfalls
- OpenChemLib's y axis points down — don't negate it (mirrors every stereocentre). Gotcha 98.
- OpenChemLib does not kekulise delocalised bonds: always go through `buildMolecule`. Gotcha 99.
- Don't set state or make ids inside a `setState` updater (StrictMode runs it twice). Gotcha 103.
- Keep `openchemlib` and `3dmol` behind dynamic imports; never import them from a module another
  route loads (CLAUDE.md §6 rule 18).
- Pure modules import each other extensionlessly; tests load them through `scripts/lib/ts-resolve.mjs`,
  and Node's type stripping rejects constructor parameter properties. Gotcha 101.

## Security Checks
- [ ] No API route: PubChem/RCSB are called from the browser with the student's query only.
- [ ] Imported files are parsed, never executed; JSON projects are validated with `isMolGraph`.
- [ ] Nothing leaves the device except those lookups; saved molecules are localStorage only.

## Tests & Verification
```bash
npx tsc --noEmit
node --test scripts/molecular-lab.test.mts      # 21 tests, ~12 s, real OpenChemLib
```
Then drive the page (headless Chrome over CDP worked well): load a library molecule, split view,
select an atom and a bond, change charge/order, undo/redo, analyse groups, measure in 3D, learning
task, every export, save, reload → restore, and a 360/390/412 px touch pass. Use the `data-atom` /
`data-bond` attributes to find screen positions. Wait for sheets to stop animating before tapping.

## Done Criteria
Types clean, the test file passes, the change exercised in a browser at desktop and phone widths,
and `CLAUDE.md` / `MEMORY.md` updated if an invariant moved.
