"use client";

import { useEffect, useMemo, useState } from "react";
import Editor2D, { EMPTY_SELECTION, type ToolOptions } from "./Editor2D";
import Viewer3D, { type Model3D } from "./Viewer3D";
import { analyse, formulaInfo, structureKey, subscriptFormula, type MolGraph } from "./graph";
import { findGroups, GROUP_INFO } from "./groups";
import { allEntries, searchLibrary, type LibraryEntry } from "./library";
import { commonOf, loadSmiles, makeConformer } from "./chem";
import { conformerModel } from "./model3d";
import { ELEMENT_MAP } from "@/app/(site)/calculation-tools/(tools)/molecular-weight-finder/_elements";
import { listSaved } from "./storage";

/*
 * Compare Molecules: the current structure beside a second one. Atoms outside
 * their largest common substructure (OpenChemLib MCS) are highlighted — the
 * structural difference, computed rather than described.
 */

interface Side {
  name: string;
  graph: MolGraph;
}

const NO_OPTS: ToolOptions = { element: "C", order: 1, stereo: "none", ring: 6, group: "OH", chargeSign: 1, hSign: 1, multi: false };
const noop = () => {};

export function ComparePanel({ current }: { current: Side }) {
  const [other, setOther] = useState<Side | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [common, setCommon] = useState<{ a: number[]; b: number[]; score: number } | null>(null);
  const [show3D, setShow3D] = useState(false);
  const [models, setModels] = useState<[Model3D | null, Model3D | null]>([null, null]);

  const pick = async (e: LibraryEntry) => {
    setLoading(true);
    setError("");
    try {
      const r = await loadSmiles(e.smiles);
      setOther({ name: e.name, graph: r.graph });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load that molecule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCommon(null);
    if (!other || !current.graph.atoms.length) return;
    let live = true;
    commonOf(current.graph, other.graph)
      .then((c) => live && setCommon(c))
      .catch(() => live && setCommon({ a: [], b: [], score: 0 }));
    return () => {
      live = false;
    };
  }, [current.graph, other]);

  useEffect(() => {
    if (!show3D || !other) return;
    let live = true;
    setModels([null, null]);
    const sides = [current, other];
    Promise.all(sides.map((s) => makeConformer(s.graph).then((c) => conformerModel(c.conformer, s.graph, structureKey(s.graph), s.name)).catch(() => null))).then(
      ([a, b]) => live && setModels([a, b]),
    );
    return () => {
      live = false;
    };
    // `current` is rebuilt by the parent on every render; its graph is what matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show3D, current.graph, other]);

  const matches = query.trim() ? searchLibrary(query).slice(0, 8) : [];
  const saved = useMemo(() => listSaved().slice(0, 6), []);

  const column = (side: Side, inCommon: number[] | undefined, model: Model3D | null, key: string) => {
    const report = analyse(side.graph);
    const f = formulaInfo(side.graph, ELEMENT_MAP, report);
    const groups = Array.from(new Set(findGroups(side.graph, report).map((g) => GROUP_INFO[g.id].name)));
    const commonSet = new Set(inCommon ?? []);
    const diff = inCommon ? side.graph.atoms.filter((a) => !commonSet.has(a.id)).map((a) => a.id) : [];
    return (
      <div style={{ minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{side.name}</p>
        <div style={{ position: "relative", height: 200, border: "1px solid var(--ml-border)", borderRadius: 12, overflow: "hidden", marginTop: 6 }}>
          <Editor2D
            graph={side.graph}
            report={report}
            tool="select"
            opts={NO_OPTS}
            selection={EMPTY_SELECTION}
            highlight={{ atoms: diff, bonds: [] }}
            showCarbons={false}
            readOnly
            fitKey={`${key}:${side.graph.nextId}`}
            label={`2D structure of ${side.name}`}
            onSelect={noop}
            onCommit={noop}
            onPreview={noop}
            onNotice={noop}
          />
        </div>
        {show3D && (
          <div style={{ position: "relative", height: 200, border: "1px solid var(--ml-border)", borderRadius: 12, overflow: "hidden", marginTop: 6 }}>
            {model ? (
              <Viewer3D model={model} fitKey={model.key} style="ballStick" labels="none" spin={false} selectedAtoms={[]} selectedBonds={[]} highlightAtoms={diff} highlightBonds={[]} measure={null} onPickAtom={noop} onPickBond={noop} />
            ) : (
              <p className="ml-muted" style={{ padding: 12 }}>Generating 3D…</p>
            )}
          </div>
        )}
        <dl className="ml-rows">
          <dt>Formula</dt>
          <dd>{subscriptFormula(f.formula) || "—"}</dd>
          <dt>Molecular weight</dt>
          <dd>{f.mw.toFixed(2)} g/mol</dd>
          <dt>Atoms (with H)</dt>
          <dd>{f.totalAtoms}</dd>
          <dt>Heavy atoms</dt>
          <dd>{f.heavyAtoms}</dd>
          <dt>Bonds</dt>
          <dd>{side.graph.bonds.length}</dd>
          <dt>Groups</dt>
          <dd>{groups.length ? groups.join(", ") : "none"}</dd>
        </dl>
      </div>
    );
  };

  return (
    <div>
      {!current.graph.atoms.length && <p className="ml-err">Load or draw a molecule first — it becomes the left side of the comparison.</p>}
      <p className="ml-subhead" style={{ marginTop: 0 }}>Compare with</p>
      <input className="ml-name" style={{ maxWidth: "none", width: "100%", border: "1px solid var(--ml-border)", minHeight: 44 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search the library, e.g. paracetamol" aria-label="Molecule to compare with" />
      <div className="ml-optrow">
        {(matches.length ? matches : allEntries().filter((e) => ["aspirin", "salicylic-acid", "paracetamol", "ibuprofen", "morphine", "codeine"].includes(e.id))).map((e) => (
          <button key={e.id} type="button" className="ml-chip" onClick={() => pick(e)} disabled={loading}>
            {e.name}
          </button>
        ))}
        {!query &&
          saved.map((m) => (
            <button key={m.id} type="button" className="ml-chip" onClick={() => setOther({ name: m.name, graph: m.graph })}>
              {m.name} <small>saved</small>
            </button>
          ))}
      </div>
      {error && <p className="ml-err">{error}</p>}
      {loading && <p className="ml-muted">Loading…</p>}
      {other && current.graph.atoms.length > 0 && (
        <>
          <div className="ml-optrow" style={{ justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <p className="ml-muted" style={{ flex: 1, minWidth: 200 }}>
              {common
                ? common.a.length
                  ? `Shared core: ${common.a.length} atoms (${Math.round(common.score * 100)}% of bonds). Highlighted atoms are not part of it.`
                  : "No shared substructure found."
                : "Finding the shared substructure…"}
            </p>
            <button type="button" className="ml-btn ml-btn--sm" aria-pressed={show3D} onClick={() => setShow3D((s) => !s)}>
              {show3D ? "Hide 3D" : "Show 3D"}
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 8 }}>
            {column(current, common?.a, models[0], "a")}
            {column(other, common?.b, models[1], "b")}
          </div>
        </>
      )}
    </div>
  );
}
