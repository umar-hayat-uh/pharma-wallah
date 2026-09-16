"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Eye, Lightbulb, Minus, Plus, RotateCcw, Scissors, Sparkles, Trash2 } from "lucide-react";
import {
  atomById,
  bondById,
  chargeLabel,
  subscriptFormula,
  typicalValence,
  type BondOrder,
  type BondStereo,
  type FormulaInfo,
  type MolGraph,
  type MolReport,
} from "./graph";
import { GROUP_INFO, type FoundGroup } from "./groups";
import { answerFor, type LearningTask, type TaskResult } from "./learning";
import { ELEMENT_NOTE, elementInfo } from "./ElementPicker";
import { formatMeasure, type MeasureKind } from "./measure";
import type { Selection } from "./Editor2D";
import { Segmented } from "./ui";

// ─── STATUS ─────────────────────────────────────────────────────────────────

export function statusText(report: MolReport, experiment: boolean): { title: string; body: string } {
  switch (report.status) {
    case "empty":
      return { title: "Empty canvas", body: "Add an atom or load a molecule to begin." };
    case "valid":
      return {
        title: "Valid structure",
        body: report.fragments > 1 ? `Every atom has a normal valence. The drawing has ${report.fragments} separate fragments.` : "Every atom has a normal valence.",
      };
    case "incomplete":
      return {
        title: "Incomplete",
        body: experiment
          ? "Some atoms have unfilled valence — fine for an experiment, but not a stable compound."
          : "Structure incomplete — check the highlighted atoms' bonds.",
      };
    case "invalid":
      return {
        title: "Potentially invalid",
        body: report.aromaticUnresolved.length
          ? "Some aromatic bonds cannot be drawn as alternating single and double bonds."
          : "This modification may create an unusual chemical structure.",
      };
  }
}

export function StatusCard({ graph, report, experiment, onFocusAtom }: { graph: MolGraph; report: MolReport; experiment: boolean; onFocusAtom: (id: number) => void }) {
  const s = statusText(report, experiment);
  const issues = Array.from(report.atoms.values()).filter((a) => a.status === "under" || a.status === "over");
  return (
    <section className="ml-card" aria-live="polite">
      <div className="ml-status" data-state={report.status}>
        <span className="ml-status-dot" aria-hidden="true" />
        <div style={{ minWidth: 0 }}>
          <strong>{s.title}</strong>
          <p>{s.body}</p>
          {issues.length > 0 && (
            <ul className="ml-issues">
              {issues.slice(0, 5).map((a) => {
                const atom = atomById(graph, a.id)!;
                const name = elementInfo(a.el)?.name.toLowerCase() ?? a.el;
                return (
                  <li key={a.id}>
                    <button type="button" onClick={() => onFocusAtom(a.id)}>
                      {a.status === "over"
                        ? `⚠ This ${name}${atom.charge ? ` (${chargeLabel(atom.charge)})` : ""} has an unusual valence: ${a.used} bonds.`
                        : `⚠ This ${name} has ${a.used} of ${Math.min(...a.allowed.filter((v) => v > a.used))} bonds — unfilled valence.`}
                    </button>
                  </li>
                );
              })}
              {issues.length > 5 && <li>…and {issues.length - 5} more.</li>}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── SELECTION ──────────────────────────────────────────────────────────────

export interface SelectionActions {
  setOrder: (bond: number, order: BondOrder) => void;
  setStereo: (bond: number, stereo: BondStereo) => void;
  breakBond: (bond: number) => void;
  deleteSelection: () => void;
  setCharge: (atom: number, charge: number) => void;
  setHydrogens: (atom: number, h: number | null) => void;
  changeElement: (atom: number) => void;
  clearSelection: () => void;
}

const ORDER_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "Single" },
  { value: "2", label: "Double" },
  { value: "3", label: "Triple" },
  { value: "ar", label: "Aromatic" },
];

const toOrder = (v: string): BondOrder => (v === "ar" ? "ar" : (Number(v) as 1 | 2 | 3));

export function SelectionCard({ graph, report, selection, actions, coords }: { graph: MolGraph; report: MolReport; selection: Selection; actions: SelectionActions; coords?: { x: number; y: number; z: number } | null }) {
  const { atoms, bonds } = selection;
  if (!atoms.length && !bonds.length) {
    return (
      <section className="ml-card">
        <h3>Selection</h3>
        <p className="ml-muted">Tap an atom or a bond (Select tool, key 1) to see its properties and change it.</p>
      </section>
    );
  }
  if (atoms.length + bonds.length > 1) {
    return (
      <section className="ml-card">
        <h3>Selection</h3>
        <p style={{ fontWeight: 600 }}>
          {atoms.length} atom{atoms.length === 1 ? "" : "s"}, {bonds.length} bond{bonds.length === 1 ? "" : "s"}
        </p>
        <p className="ml-muted">Drag a selected atom to move them together.</p>
        <div className="ml-optrow" style={{ marginTop: 10 }}>
          <button type="button" className="ml-btn ml-btn--danger" onClick={actions.deleteSelection}>
            <Trash2 /> Delete
          </button>
          <button type="button" className="ml-btn" onClick={actions.clearSelection}>
            Clear selection
          </button>
        </div>
      </section>
    );
  }
  if (atoms.length === 1) {
    const atom = atomById(graph, atoms[0]);
    const r = report.atoms.get(atoms[0]);
    if (!atom || !r) return null;
    const info = elementInfo(atom.el);
    const typical = typicalValence(atom.el);
    const neighbours = r.neighbours.map((id) => atomById(graph, id)?.el).filter(Boolean);
    return (
      <section className="ml-card">
        <h3>Atom properties</h3>
        <div className="ml-propgrid">
          <span className="ml-elem" style={{ color: `var(--ml-ink)` }}>
            {atom.el}
            {atom.charge ? <sup style={{ fontSize: 11 }}>{chargeLabel(atom.charge)}</sup> : null}
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{info?.name ?? atom.el}</div>
            <div className="ml-muted">Atomic number {info?.atomicNumber ?? "—"}</div>
          </div>
          <button type="button" className="ml-btn ml-btn--sm" style={{ marginLeft: "auto" }} onClick={() => actions.changeElement(atom.id)}>
            Change
          </button>
        </div>
        <dl className="ml-rows">
          <dt>Formal charge</dt>
          <dd>
            <span className="ml-stepper">
              <button type="button" className="ml-btn ml-btn--sm ml-btn--icon" aria-label="Decrease charge" onClick={() => actions.setCharge(atom.id, atom.charge - 1)}>
                <Minus />
              </button>
              <output aria-live="polite">{atom.charge > 0 ? `+${atom.charge}` : atom.charge < 0 ? `−${-atom.charge}` : "0"}</output>
              <button type="button" className="ml-btn ml-btn--sm ml-btn--icon" aria-label="Increase charge" onClick={() => actions.setCharge(atom.id, atom.charge + 1)}>
                <Plus />
              </button>
            </span>
          </dd>
          <dt>Hydrogens</dt>
          <dd>
            <span className="ml-stepper">
              <button type="button" className="ml-btn ml-btn--sm ml-btn--icon" aria-label="Remove a hydrogen" disabled={r.hydrogens === 0} onClick={() => actions.setHydrogens(atom.id, r.hydrogens - 1)}>
                <Minus />
              </button>
              <output aria-live="polite">{r.hydrogens}</output>
              <button type="button" className="ml-btn ml-btn--sm ml-btn--icon" aria-label="Add a hydrogen" onClick={() => actions.setHydrogens(atom.id, r.hydrogens + 1)}>
                <Plus />
              </button>
            </span>
          </dd>
          <dt>Hydrogen mode</dt>
          <dd>
            {r.hydrogensAuto ? (
              "Automatic"
            ) : (
              <button type="button" className="ml-btn ml-btn--sm" onClick={() => actions.setHydrogens(atom.id, null)}>
                <RotateCcw /> Set by you — reset
              </button>
            )}
          </dd>
          <dt>Connected to</dt>
          <dd>{neighbours.length ? neighbours.join(", ") : "nothing"}</dd>
          <dt>Bonds used</dt>
          <dd>
            {r.bondSum} + {r.hydrogens} H = {r.used}
          </dd>
          <dt>Usual valence</dt>
          <dd>{r.allowed.length ? r.allowed.join(" or ") : "no rule"}</dd>
          <dt>Status</dt>
          <dd style={{ color: r.status === "ok" ? "var(--ml-green-ink)" : r.status === "unknown" ? undefined : r.status === "over" ? "var(--ml-red)" : "var(--ml-amber)" }}>
            {r.status === "ok" ? "Normal" : r.status === "over" ? "Unusual valence" : r.status === "under" ? "Unfilled valence" : "Not checked"}
          </dd>
          {coords && (
            <>
              <dt>3D position</dt>
              <dd className="ml-mono">
                {coords.x.toFixed(2)}, {coords.y.toFixed(2)}, {coords.z.toFixed(2)} Å
              </dd>
            </>
          )}
        </dl>
        {(ELEMENT_NOTE[atom.el] || typical) && (
          <p className="ml-explain">
            <Lightbulb size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "-2px" }} />
            {ELEMENT_NOTE[atom.el] ?? `Typical neutral valence: ${typical}.`}
          </p>
        )}
        <div className="ml-optrow" style={{ marginTop: 10 }}>
          <button type="button" className="ml-btn ml-btn--danger" onClick={actions.deleteSelection}>
            <Trash2 /> Delete atom
          </button>
        </div>
      </section>
    );
  }
  const bond = bondById(graph, bonds[0]);
  if (!bond) return null;
  const a = atomById(graph, bond.a)!;
  const b = atomById(graph, bond.b)!;
  const resolved = report.orders.get(bond.id);
  const symbol = bond.order === 3 ? "≡" : bond.order === 2 ? "=" : bond.order === "ar" ? "⋯" : "—";
  const explain =
    bond.order === 1
      ? "A single bond is one shared pair of electrons (a σ bond). The atoms can rotate around it."
      : bond.order === 2
        ? "A double bond is one σ and one π bond. It is shorter and stronger than a single bond, and rotation around it is blocked."
        : bond.order === 3
          ? "A triple bond is one σ and two π bonds — the shortest and strongest of the three; the atoms around it lie in a line."
          : "An aromatic bond is part of a ring whose π electrons are shared around the whole ring — between a single and a double bond.";
  return (
    <section className="ml-card">
      <h3>Bond properties</h3>
      <p style={{ fontWeight: 700, fontSize: 18 }}>
        {a.el} {symbol} {b.el}
      </p>
      <div style={{ marginTop: 8 }}>
        <Segmented label="Bond order" value={String(bond.order)} options={ORDER_OPTIONS} onChange={(v) => actions.setOrder(bond.id, toOrder(v))} />
      </div>
      {bond.order === 1 && (
        <div className="ml-optrow">
          <button type="button" className="ml-opt" aria-pressed={bond.stereo === "none"} onClick={() => actions.setStereo(bond.id, "none")}>
            Plain
          </button>
          <button type="button" className="ml-opt" aria-pressed={bond.stereo === "wedge"} onClick={() => actions.setStereo(bond.id, "wedge")}>
            Wedge (toward you)
          </button>
          <button type="button" className="ml-opt" aria-pressed={bond.stereo === "hash"} onClick={() => actions.setStereo(bond.id, "hash")}>
            Dashed (away)
          </button>
        </div>
      )}
      {bond.order === "ar" && resolved !== 1.5 && <p className="ml-muted">Drawn aromatic; counted as {resolved === 2 ? "double" : "single"} in the alternating pattern.</p>}
      <p className="ml-explain">{explain}</p>
      <div className="ml-optrow" style={{ marginTop: 10 }}>
        <button type="button" className="ml-btn" onClick={() => actions.breakBond(bond.id)} title="Remove the bond but keep both atoms' hydrogens">
          <Scissors /> Break bond
        </button>
        <button type="button" className="ml-btn ml-btn--danger" onClick={actions.deleteSelection}>
          <Trash2 /> Delete bond
        </button>
      </div>
    </section>
  );
}

// ─── MOLECULE ───────────────────────────────────────────────────────────────

export function MoleculeCard({ name, graph, formula, report, smiles, onCopy, iupac }: { name: string; graph: MolGraph; formula: FormulaInfo; report: MolReport; smiles: string | null; onCopy: (text: string) => void; iupac?: string | null }) {
  const orders = { 1: 0, 2: 0, 3: 0, ar: 0 } as Record<string, number>;
  for (const b of graph.bonds) orders[String(b.order)]++;
  const els = Object.keys(formula.counts).sort((x, y) => (x === "C" ? -1 : y === "C" ? 1 : x === "H" ? -1 : y === "H" ? 1 : x.localeCompare(y)));
  return (
    <section className="ml-card">
      <h3>Molecular information</h3>
      <p className="ml-muted" style={{ fontWeight: 600, color: "var(--ml-ink-2)" }}>{name}</p>
      {iupac && <p className="ml-muted">{iupac}</p>}
      <p className="ml-formula" aria-label={`Molecular formula ${formula.formula || "none"}`}>
        {formula.formula ? subscriptFormula(formula.formula) : "—"}
        {formula.charge ? <sup style={{ fontSize: 14 }}>{chargeLabel(formula.charge)}</sup> : null}
      </p>
      <p className="ml-mw">
        Molecular weight <b>{formula.mw ? formula.mw.toFixed(2) : "0.00"}</b> g/mol
        {formula.unknownMass.length ? ` (excludes ${formula.unknownMass.join(", ")})` : ""}
      </p>
      {els.length > 0 && (
        <div className="ml-counts" aria-label="Atom counts">
          {els.map((e) => (
            <span key={e} className="ml-count">
              {e}
              <span>{formula.counts[e]}</span>
            </span>
          ))}
        </div>
      )}
      <dl className="ml-rows">
        <dt>Atoms (with H)</dt>
        <dd>{formula.totalAtoms}</dd>
        <dt>Heavy atoms</dt>
        <dd>{formula.heavyAtoms}</dd>
        <dt>Hydrogens</dt>
        <dd>{formula.hydrogens}</dd>
        <dt>Bonds drawn</dt>
        <dd>{graph.bonds.length}</dd>
        <dt>Single · double · triple · aromatic</dt>
        <dd>
          {orders["1"]} · {orders["2"]} · {orders["3"]} · {orders.ar}
        </dd>
        <dt>Net formal charge</dt>
        <dd>{formula.charge > 0 ? `+${formula.charge}` : formula.charge < 0 ? `−${-formula.charge}` : "0"}</dd>
        <dt>Fragments</dt>
        <dd>{report.fragments}</dd>
      </dl>
      {graph.atoms.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="ml-subhead" style={{ marginTop: 0, display: "flex", alignItems: "center" }}>
            SMILES
            {smiles && (
              <button type="button" className="ml-btn ml-btn--sm ml-btn--ghost" style={{ marginLeft: "auto" }} onClick={() => onCopy(smiles)} aria-label="Copy SMILES">
                <Copy /> Copy
              </button>
            )}
          </div>
          <p className="ml-mono">{smiles ?? (report.aromaticUnresolved.length ? "Not available — resolve the aromatic bonds first." : "Calculating…")}</p>
        </div>
      )}
      <p className="ml-muted" style={{ marginTop: 10 }}>
        Formula and weight are counted from the structure on screen (IUPAC 2021 atomic weights), hydrogens included.
      </p>
    </section>
  );
}

// ─── FUNCTIONAL GROUPS ──────────────────────────────────────────────────────

export function GroupsCard({ groups, analysed, active, onAnalyse, onPick }: { groups: FoundGroup[]; analysed: boolean; active: string | null; onAnalyse: () => void; onPick: (key: string | null) => void }) {
  const current = groups.find((g) => g.key === active);
  return (
    <section className="ml-card">
      <h3>
        Functional groups
        <button type="button" className="ml-btn ml-btn--sm" onClick={onAnalyse}>
          <Sparkles /> {analysed ? "Re-analyze" : "Analyze structure"}
        </button>
      </h3>
      {!analysed ? (
        <p className="ml-muted">Find and highlight the groups in the structure on screen.</p>
      ) : groups.length === 0 ? (
        <p className="ml-muted">No recognised functional groups in this structure.</p>
      ) : (
        <>
          <div className="ml-groups">
            {groups.map((g) => (
              <button key={g.key} type="button" className="ml-group" aria-pressed={active === g.key} onClick={() => onPick(active === g.key ? null : g.key)}>
                {GROUP_INFO[g.id].name}
                <small>{g.atoms.length} atoms</small>
              </button>
            ))}
          </div>
          {current && (
            <div className="ml-explain" aria-live="polite">
              <b>{GROUP_INFO[current.id].name}.</b> {GROUP_INFO[current.id].explain}
            </div>
          )}
        </>
      )}
    </section>
  );
}

// ─── LEARNING ───────────────────────────────────────────────────────────────

const RESULT_TEXT: Record<TaskResult, string> = {
  correct: "✓ Correct",
  wrong: "Try again.",
  partial: "Right so far — keep going.",
  pending: "",
};

export function LearningCard({
  tasks,
  index,
  results,
  revealed,
  onCheck,
  onReveal,
  onNext,
  onPrev,
  onExit,
  selectionCount,
}: {
  tasks: LearningTask[];
  index: number;
  results: Record<string, TaskResult>;
  revealed: boolean;
  onCheck: () => void;
  onReveal: () => void;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
  selectionCount: number;
}) {
  const task = tasks[index];
  if (!task) {
    return (
      <section className="ml-card">
        <h3>Learning mode</h3>
        <p className="ml-muted">Load or draw a molecule to get tasks about it.</p>
      </section>
    );
  }
  const result = results[task.key] ?? "pending";
  const isSelect = task.kind === "select-atoms" || task.kind === "select-ring" || task.kind === "select-bond";
  const done = Object.values(results).filter((r) => r === "correct").length;
  const answer = answerFor(task);
  return (
    <section className="ml-card">
      <h3>
        Learning mode
        <button type="button" className="ml-btn ml-btn--sm ml-btn--ghost" onClick={onExit}>
          Exit
        </button>
      </h3>
      <div className="ml-progress" aria-label={`Task ${index + 1} of ${tasks.length}, ${done} correct`}>
        {tasks.map((t, i) => (
          <i key={t.key} data-done={results[t.key] === "correct"} data-current={i === index} />
        ))}
      </div>
      <div className="ml-task">
        <p className="ml-muted">
          Task {index + 1} of {tasks.length}
        </p>
        <p className="ml-task-q">{task.prompt}</p>
        <p className="ml-muted" style={{ marginTop: 4 }}>
          {task.hint}
        </p>
        {result !== "pending" && (
          <p className="ml-result" data-r={result} role="status">
            {RESULT_TEXT[result]}
          </p>
        )}
        {revealed && (answer.atoms.length > 0 || answer.bonds.length > 0) && <p className="ml-muted" style={{ marginTop: 6 }}>The answer is highlighted in green.</p>}
        <div className="ml-optrow" style={{ marginTop: 10 }}>
          {isSelect && (
            <button type="button" className="ml-btn ml-btn--primary" onClick={onCheck} disabled={selectionCount === 0}>
              <Check /> Check
            </button>
          )}
          {!isSelect && result !== "correct" && <span className="ml-muted">Make the change — it is checked automatically.</span>}
          {task.kind !== "add-element" && (
            <button type="button" className="ml-btn" onClick={onReveal} aria-pressed={revealed}>
              <Eye /> {revealed ? "Hide answer" : "Show answer"}
            </button>
          )}
        </div>
      </div>
      <div className="ml-optrow" style={{ marginTop: 10, justifyContent: "space-between" }}>
        <button type="button" className="ml-btn ml-btn--sm" onClick={onPrev} disabled={index === 0}>
          Previous
        </button>
        <span className="ml-muted">
          {done} of {tasks.length} correct
        </span>
        <button type="button" className="ml-btn ml-btn--sm" onClick={onNext} disabled={index >= tasks.length - 1}>
          Next task
        </button>
      </div>
    </section>
  );
}

// ─── MEASURE ────────────────────────────────────────────────────────────────

export interface MeasureResult {
  id: number;
  kind: MeasureKind;
  value: number;
  atoms: string[];
}

export function MeasureCard({
  kind,
  picks,
  results,
  available,
  basis,
  onKind,
  onClear,
  onStop,
}: {
  kind: MeasureKind | null;
  picks: string[];
  results: MeasureResult[];
  available: boolean;
  basis: string;
  onKind: (k: MeasureKind) => void;
  onClear: () => void;
  onStop: () => void;
}) {
  const need = kind === "distance" ? 2 : kind === "angle" ? 3 : 4;
  return (
    <section className="ml-card">
      <h3>
        Measure (3D)
        {kind && (
          <button type="button" className="ml-btn ml-btn--sm ml-btn--ghost" onClick={onStop}>
            Done
          </button>
        )}
      </h3>
      {!available ? (
        <p className="ml-muted">Measuring needs 3D coordinates. Open the 3D view once the model has been generated — values are never estimated from the 2D drawing.</p>
      ) : (
        <>
          <Segmented<MeasureKind>
            label="Measurement"
            value={kind ?? ("" as MeasureKind)}
            onChange={onKind}
            options={[
              { value: "distance", label: "Distance" },
              { value: "angle", label: "Angle" },
              { value: "dihedral", label: "Dihedral" },
            ]}
          />
          {kind && (
            <p className="ml-muted" style={{ marginTop: 8 }}>
              Tap {need} atoms in the 3D view{picks.length ? ` — picked ${picks.join(" → ")}` : ""}.
            </p>
          )}
          {results.length > 0 && (
            <ul className="ml-list" style={{ marginTop: 8 }}>
              {results.map((r) => (
                <li key={r.id} className="ml-count" style={{ justifyContent: "space-between", display: "flex" }}>
                  <span style={{ color: "var(--ml-ink-2)" }}>
                    {r.kind} {r.atoms.join("–")}
                  </span>
                  <b>{formatMeasure(r.kind, r.value)}</b>
                </li>
              ))}
            </ul>
          )}
          {results.length > 0 && (
            <button type="button" className="ml-btn ml-btn--sm" style={{ marginTop: 8 }} onClick={onClear}>
              Clear measurements
            </button>
          )}
          <p className="ml-muted" style={{ marginTop: 8 }}>
            {basis}
          </p>
        </>
      )}
    </section>
  );
}

// ─── PHARMACOLOGY (kept apart from structure) ───────────────────────────────

export function PharmaCard({ name, cid, mesh, loading, modified }: { name: string; cid: number | null; mesh: string[] | null; loading: boolean; modified: boolean }) {
  const [open, setOpen] = useState(true);
  if (!cid) return null;
  return (
    <section className="ml-card">
      <h3>
        Pharmacological classes
        <button type="button" className="ml-btn ml-btn--sm ml-btn--ghost" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? "Hide" : "Show"}
        </button>
      </h3>
      {open &&
        (modified ? (
          <p className="ml-muted">The structure has been modified, so the classes of {name} no longer describe it. Reset to see them again.</p>
        ) : loading ? (
          <p className="ml-muted">Looking up PubChem…</p>
        ) : mesh && mesh.length ? (
          <>
            <ul className="ml-counts">
              {mesh.map((m) => (
                <li key={m} className="ml-count" style={{ fontWeight: 600 }}>
                  {m}
                </li>
              ))}
            </ul>
            <p className="ml-muted" style={{ marginTop: 8 }}>
              Source: MeSH Pharmacological Classification, via PubChem CID {cid}.
            </p>
          </>
        ) : (
          <p className="ml-muted">PubChem lists no MeSH pharmacological class for CID {cid}.</p>
        ))}
      {open && (
        <div className="ml-optrow" style={{ marginTop: 8 }}>
          <a className="ml-btn ml-btn--sm" href={`https://pubchem.ncbi.nlm.nih.gov/compound/${cid}`} target="_blank" rel="noopener noreferrer">
            PubChem <ExternalLink />
          </a>
          <a className="ml-btn ml-btn--sm" href={`/encyclopedia?q=${encodeURIComponent(name.replace(/\s*\(.*\)$/, ""))}`}>
            Drug encyclopedia
          </a>
        </div>
      )}
    </section>
  );
}
