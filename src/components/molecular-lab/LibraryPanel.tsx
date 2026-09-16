"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileUp, Search, Trash2 } from "lucide-react";
import { CATEGORIES, categoryCounts, entriesIn, searchLibrary, type LibraryEntry } from "./library";
import { classifyQuery, searchPubChem, type PubChemHit } from "./pubchem";
import { subscriptFormula } from "./graph";
import { deleteSaved, listSaved, type SavedMolecule } from "./storage";

/*
 * Search and the example library. The library answers instantly and offline;
 * PubChem is asked only when the student presses Search (or the library has
 * nothing), so typing does not fire a request per keystroke.
 */

export interface LibraryHandlers {
  openEntry: (e: LibraryEntry) => void;
  openPubChem: (hit: PubChemHit) => void;
  openPdb: (id: string) => void;
  openFile: (file: File) => void;
  openSaved: (m: SavedMolecule) => void;
}

export function LibraryPanel({ handlers, initialQuery = "", busy }: { handlers: LibraryHandlers; initialQuery?: string; busy: boolean }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("pharmaceutical");
  const [remote, setRemote] = useState<{ q: string; hits: PubChemHit[] } | null>(null);
  const [remoteState, setRemoteState] = useState<"idle" | "loading" | "error">("idle");
  const [remoteError, setRemoteError] = useState("");
  const [pdb, setPdb] = useState("");
  const abort = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const counts = useMemo(() => categoryCounts(), []);
  const local = useMemo(() => searchLibrary(query), [query]);
  const trimmed = query.trim();

  useEffect(() => () => abort.current?.abort(), []);

  const runRemote = async () => {
    if (!trimmed) return;
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setRemoteState("loading");
    setRemoteError("");
    try {
      const hits = await searchPubChem(trimmed, ctrl.signal);
      setRemote({ q: trimmed, hits });
      setRemoteState("idle");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setRemoteState("error");
      setRemoteError(err instanceof Error ? err.message : "PubChem could not be reached.");
    }
  };

  const kind = trimmed ? classifyQuery(trimmed) : "name";
  const list = trimmed ? local : entriesIn(category);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runRemote();
        }}
      >
        <div className="ml-field">
          <label className="ml-search" style={{ flex: 1 }}>
            <Search aria-hidden="true" />
            <span className="sr-only-ml">Search molecules</span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setRemote(null);
              }}
              placeholder="Name, formula (C9H8O4) or PubChem CID"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
            />
          </label>
          <button type="submit" className="ml-btn ml-btn--primary" style={{ minHeight: 44 }} disabled={!trimmed || remoteState === "loading"}>
            Search
          </button>
        </div>
      </form>

      {!trimmed && (
        <div className="ml-cats" role="group" aria-label="Categories">
          {CATEGORIES.filter((c) => counts.get(c.id)).map((c) => (
            <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label} <span style={{ opacity: 0.6 }}>{counts.get(c.id)}</span>
            </button>
          ))}
        </div>
      )}
      {!trimmed && <p className="ml-muted" style={{ marginBottom: 8 }}>{CATEGORIES.find((c) => c.id === category)?.basis}</p>}

      {trimmed && <p className="ml-subhead">In the PharmaWallah library</p>}
      {list.length > 0 ? (
        <ul className="ml-list">
          {list.map((e) => (
            <li key={e.id}>
              <button type="button" className="ml-item" onClick={() => handlers.openEntry(e)} disabled={busy}>
                <span className="ml-item-main">
                  <span className="ml-item-title">{e.name}</span>
                  <span className="ml-item-sub">
                    {subscriptFormula(e.formula)} · {e.mw.toFixed(2)} g/mol
                  </span>
                </span>
                <span className="ml-item-go">Open in Molecular Lab</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        trimmed && <p className="ml-muted">No library molecule matches — search PubChem below.</p>
      )}

      {trimmed && (
        <>
          <p className="ml-subhead">PubChem {kind === "cid" ? "compound ID" : kind === "formula" ? "formula search" : "name search"}</p>
          {remoteState === "loading" && <p className="ml-muted">Searching PubChem…</p>}
          {remoteState === "error" && <p className="ml-err">{remoteError}</p>}
          {remoteState === "idle" && !remote && (
            <button type="button" className="ml-btn ml-btn--block" onClick={runRemote}>
              Search PubChem for “{trimmed}”
            </button>
          )}
          {remote && remote.q === trimmed && remoteState === "idle" && (
            remote.hits.length ? (
              <ul className="ml-list">
                {remote.hits.map((h) => (
                  <li key={h.cid}>
                    <button type="button" className="ml-item" onClick={() => handlers.openPubChem(h)} disabled={busy}>
                      <span className="ml-item-main">
                        <span className="ml-item-title">{h.title}</span>
                        <span className="ml-item-sub">
                          {subscriptFormula(h.formula)} · {Number.isFinite(h.mw) ? `${h.mw.toFixed(2)} g/mol` : ""} · CID {h.cid}
                        </span>
                      </span>
                      <span className="ml-item-go">Open in Molecular Lab</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ml-muted">PubChem has no compound for “{trimmed}”.</p>
            )
          )}
        </>
      )}

      <p className="ml-subhead">Proteins and files</p>
      <form
        className="ml-field"
        onSubmit={(e) => {
          e.preventDefault();
          if (pdb.trim()) handlers.openPdb(pdb.trim());
        }}
      >
        <input value={pdb} onChange={(e) => setPdb(e.target.value)} placeholder="PDB ID, e.g. 1CRN" aria-label="RCSB PDB ID" maxLength={4} autoCapitalize="characters" />
        <button type="submit" className="ml-btn" disabled={!pdb.trim() || busy}>
          Open protein
        </button>
      </form>
      <p className="ml-muted" style={{ marginTop: 4 }}>
        Proteins open in the 3D view only (cartoon, surfaces, chains) — they are too large to edit.
      </p>
      <button type="button" className="ml-btn ml-btn--block" style={{ marginTop: 10 }} onClick={() => fileRef.current?.click()} disabled={busy}>
        <FileUp /> Import a file (MOL, SDF, SMILES, lab JSON, PDB, CIF, MOL2, XYZ)
      </button>
      <input
        ref={fileRef}
        type="file"
        hidden
        accept=".mol,.sdf,.smi,.smiles,.txt,.json,.pdb,.ent,.cif,.mmcif,.mol2,.xyz"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handlers.openFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function SavedPanel({ onOpen, currentId }: { onOpen: (m: SavedMolecule) => void; currentId: string | null }) {
  const [items, setItems] = useState<SavedMolecule[]>([]);
  useEffect(() => setItems(listSaved()), []);
  if (!items.length) {
    return <p className="ml-muted">Nothing saved yet. Use Save to keep a structure on this device.</p>;
  }
  return (
    <>
      <p className="ml-muted" style={{ marginBottom: 8 }}>
        Saved in this browser only — clearing site data removes them.
      </p>
      <ul className="ml-list">
        {items.map((m) => (
          <li key={m.id} style={{ display: "flex", gap: 6 }}>
            <button type="button" className="ml-item" onClick={() => onOpen(m)}>
              <span className="ml-item-main">
                <span className="ml-item-title">
                  {m.name}
                  {m.id === currentId ? " (open)" : ""}
                </span>
                <span className="ml-item-sub">
                  {m.graph.atoms.length} atoms · modified {new Date(m.modified).toLocaleString()}
                </span>
              </span>
            </button>
            <button
              type="button"
              className="ml-btn ml-btn--icon ml-btn--danger"
              style={{ minHeight: 52 }}
              aria-label={`Delete ${m.name}`}
              onClick={() => {
                deleteSaved(m.id);
                setItems(listSaved());
              }}
            >
              <Trash2 />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
