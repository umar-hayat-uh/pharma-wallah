"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  Atom,
  BookOpen,
  Columns2,
  Copy,
  Crosshair,
  Download,
  Eraser,
  FilePlus2,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  Hexagon,
  Info,
  Library,
  Maximize2,
  Minus,
  MoreHorizontal,
  MousePointer2,
  PanelRightClose,
  PanelRightOpen,
  Pause,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  RotateCw,
  Ruler,
  Save,
  Scissors,
  Search,
  Settings2,
  Shapes,
  Sparkles,
  SquareDashed,
  Trash2,
  Undo2,
  Wand2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { ELEMENT_MAP } from "@/app/(site)/calculation-tools/(tools)/molecular-weight-finder/_elements";
import Editor2D, { EMPTY_SELECTION, type Editor2DHandle, type Selection, type Tool, type ToolOptions } from "./Editor2D";
import Viewer3D, { type ColorScheme3D, type MeasureOverlay, type Model3D, type PickedAtom, type Style3D, type Surface3D, type Viewer3DHandle } from "./Viewer3D";
import {
  analyse,
  atomById,
  bondById,
  breakBond as breakBondOp,
  deleteItems,
  emptyGraph,
  formulaInfo,
  GROUP_LABELS,
  isMolGraph,
  sameStructure,
  setBondOrder,
  setBondStereo,
  setCharge as setChargeOp,
  setHydrogens as setHydrogensOp,
  setElement,
  structureKey,
  subscriptFormula,
  type BondOrder,
  type GroupKind,
  type MolGraph,
  type RingKind,
} from "./graph";
import { findGroups } from "./groups";
import { answerFor, checkEdit, checkSelection, generateTasks, type LearningTask, type TaskResult } from "./learning";
import { MEASURE_ATOMS, measure as measureValue, type MeasureKind } from "./measure";
import { historyReducer, initHistory } from "./history";
import { ChemFailure, cleanLayout, loadMolfile, loadSmiles, makeConformer, smilesOf } from "./chem";
import type { Conformer3D } from "./molfile";
import { conformerToMolfile, graphToMolfile, toSdf } from "./molfile";
import { conformerModel } from "./model3d";
import { entryById, examples, type LibraryEntry } from "./library";
import { fetchMeshClasses, fetchPdb, fetchPubChemSdf, type PubChemHit } from "./pubchem";
import { clearSession, readSession, saveMolecule, writeSession, type MolSource, type SavedMolecule, type SessionSnapshot } from "./storage";
import { downloadBlob, downloadText, drawingSvg, fileSafeName, projectJson, svgToPngBlob } from "./export";
import { ConfirmDialog, IconButton, Segmented, Sheet, ToolButton } from "./ui";
import { ElementPicker, PeriodicTable, elementInfo } from "./ElementPicker";
import { GroupsCard, LearningCard, MeasureCard, MoleculeCard, PharmaCard, SelectionCard, StatusCard, statusText, type MeasureResult, type SelectionActions } from "./panels";
import { LibraryPanel, SavedPanel } from "./LibraryPanel";
import { ComparePanel } from "./ComparePanel";
import "./lab.css";

// ─── TYPES ──────────────────────────────────────────────────────────────────

type ViewMode = "2d" | "3d" | "split";
type LabMode = "build" | "learn" | "experiment";
type SheetId = "element" | "ptable" | "bond" | "more" | "info" | "library" | "export" | "saved" | "display" | "learn" | "compare" | "tools" | "ring" | "group" | null;

interface Doc {
  name: string;
  source: MolSource | null;
  /** The structure as loaded — what Reset returns to and "modified" compares against. */
  original: MolGraph | null;
  iupac: string | null;
  mesh: string[] | null;
  meshLoading: boolean;
  savedId: string | null;
  fitKey: string;
}

interface ViewOnly {
  name: string;
  text: string;
  format: string;
  key: string;
  isProtein: boolean;
}

interface ConfState {
  key: string;
  conformer: Conformer3D | null;
  /** The structure the conformer was generated for (bond ids map through it). */
  graph: MolGraph | null;
  source: "pubchem" | "file" | "generated" | null;
  minimised: boolean | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string;
}

interface Toast {
  id: number;
  text: string;
  tone: "info" | "warn" | "error" | "ok";
  undo?: boolean;
}

const RINGS: { value: RingKind; label: string }[] = [
  { value: "benzene", label: "Benzene" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
  { value: 7, label: "7" },
];

const BOND_CHOICES: { order: BondOrder; stereo: "none" | "wedge" | "hash"; label: string; tip: string }[] = [
  { order: 1, stereo: "none", label: "—", tip: "Single bond" },
  { order: 2, stereo: "none", label: "=", tip: "Double bond" },
  { order: 3, stereo: "none", label: "≡", tip: "Triple bond" },
  { order: "ar", stereo: "none", label: "Ar", tip: "Aromatic bond" },
  { order: 1, stereo: "wedge", label: "◀", tip: "Wedge bond (toward you)" },
  { order: 1, stereo: "hash", label: "┊", tip: "Dashed bond (away from you)" },
];

const newDoc = (name = "Untitled molecule"): Doc => ({ name, source: null, original: null, iupac: null, mesh: null, meshLoading: false, savedId: null, fitKey: `d${Date.now()}` });
const idleConf: ConfState = { key: "", conformer: null, graph: null, source: null, minimised: null, status: "idle", error: "" };

const RAW_FORMATS: Record<string, string> = { pdb: "pdb", ent: "pdb", cif: "mmcif", mmcif: "mmcif", mol2: "mol2", xyz: "xyz" };

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function MolecularLab() {
  const [hist, dispatch] = useReducer(historyReducer, emptyGraph(), initHistory);
  const graph = hist.present;
  const report = useMemo(() => analyse(graph), [graph]);
  const formula = useMemo(() => formulaInfo(graph, ELEMENT_MAP, report), [graph, report]);
  const key = useMemo(() => structureKey(graph), [graph]);

  const [doc, setDoc] = useState<Doc>(() => newDoc());
  const [viewOnly, setViewOnly] = useState<ViewOnly | null>(null);
  const [started, setStarted] = useState(false);
  const [tool, setTool] = useState<Tool>("select");
  const [opts, setOpts] = useState<ToolOptions>({ element: "C", order: 1, stereo: "none", ring: "benzene", group: "OH", chargeSign: 1, hSign: 1, multi: false });
  const [view, setView] = useState<ViewMode>("2d");
  const [mode, setMode] = useState<LabMode>("build");
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
  const [style3d, setStyle3d] = useState<Style3D>("ballStick");
  const [labels3d, setLabels3d] = useState<"none" | "element" | "residue">("none");
  const [colorScheme, setColorScheme] = useState<ColorScheme3D>("element");
  const [surface, setSurface] = useState<Surface3D>("none");
  const [showCarbons, setShowCarbons] = useState(false);
  const [spin, setSpin] = useState(false);
  const [liveUpdate, setLiveUpdate] = useState(true);
  const [conf, setConf] = useState<ConfState>(idleConf);
  const [groupsOn, setGroupsOn] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [taskIndex, setTaskIndex] = useState(0);
  const [taskResults, setTaskResults] = useState<Record<string, TaskResult>>({});
  const [revealed, setRevealed] = useState(false);
  const [measureKind, setMeasureKind] = useState<MeasureKind | null>(null);
  const [picks, setPicks] = useState<PickedAtom[]>([]);
  const [measures, setMeasures] = useState<(MeasureResult & { points: PickedAtom[] })[]>([]);
  const [sheet, setSheet] = useState<SheetId>(null);
  const [confirm, setConfirm] = useState<null | "clear" | "reset" | "new">(null);
  const [restore, setRestore] = useState<SessionSnapshot | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [smiles, setSmiles] = useState<string | null>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [elementTarget, setElementTarget] = useState<number | null>(null);

  const editorRef = useRef<Editor2DHandle>(null);
  const viewerRef = useRef<Viewer3DHandle>(null);
  const toastTimer = useRef<number | null>(null);
  const loadToken = useRef(0);
  const measureId = useRef(0);

  const modified = doc.original ? !sameStructure(doc.original, graph) : false;
  const hasStructure = graph.atoms.length > 0;
  const editable = !viewOnly;
  const experiment = mode === "experiment";

  // ─── NOTICES ──────────────────────────────────────────────────────────────

  const notify = useCallback((text: string, tone: Toast["tone"] = "info", undo = false) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, tone, undo });
    toastTimer.current = window.setTimeout(() => setToast(null), tone === "error" || undo ? 6500 : 3800);
  }, []);
  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  // ─── LAYOUT ───────────────────────────────────────────────────────────────

  // Below 1100px the information panel is a drawer over the canvas: start closed.
  useEffect(() => {
    if (window.matchMedia("(max-width: 1099px)").matches) setPanelOpen(false);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  // Split view needs room; on phones 2D and 3D are separate tabs.
  useEffect(() => {
    if (isNarrow && view === "split") setView("2d");
  }, [isNarrow, view]);
  useEffect(() => {
    if (viewOnly && view !== "3d") setView("3d");
  }, [viewOnly, view]);

  // ─── HISTORY ──────────────────────────────────────────────────────────────

  const commit = useCallback(
    (next: MolGraph, label: string, from?: MolGraph) => {
      dispatch({ type: "commit", graph: next, label, from });
      setStarted(true);
      const r = analyse(next);
      // One gentle nudge when an edit makes something unusual — never a block.
      const before = from ? analyse(from) : report;
      const worse = r.status === "invalid" && before.status !== "invalid";
      if (worse && !experiment) notify("⚠ This modification may create an unusual chemical structure. You can undo it.", "warn", true);
    },
    [report, experiment, notify],
  );
  const preview = useCallback((next: MolGraph) => dispatch({ type: "preview", graph: next }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  // Drop selected ids that no longer exist.
  useEffect(() => {
    setSelection((s) => {
      const atoms = s.atoms.filter((id) => atomById(graph, id));
      const bonds = s.bonds.filter((id) => bondById(graph, id));
      return atoms.length === s.atoms.length && bonds.length === s.bonds.length ? s : { atoms, bonds };
    });
  }, [graph]);

  // ─── DOCUMENTS ────────────────────────────────────────────────────────────

  const resetDerived = () => {
    setSelection(EMPTY_SELECTION);
    setGroupsOn(false);
    setActiveGroup(null);
    setMeasureKind(null);
    setPicks([]);
    setMeasures([]);
    setRevealed(false);
    setSmiles(null);
  };

  const openDocument = useCallback(
    (g: MolGraph, d: Partial<Doc> & { name: string }, conformer: Conformer3D | null, conformerSource: ConfState["source"] = null) => {
      dispatch({ type: "replace", graph: g, label: `Opened ${d.name}` });
      setDoc({ ...newDoc(d.name), ...d, original: d.original === undefined ? g : d.original });
      setViewOnly(null);
      setStarted(true);
      resetDerived();
      setConf(conformer ? { key: structureKey(g), conformer, graph: g, source: conformerSource, minimised: null, status: "ready", error: "" } : idleConf);
      setTool("select");
      setSheet(null);
    },
    [],
  );

  const fail = useCallback((err: unknown, fallback: string) => {
    const message = err instanceof ChemFailure || err instanceof Error ? err.message : fallback;
    notify(message || fallback, "error");
  }, [notify]);

  const openEntry = useCallback(
    async (e: LibraryEntry) => {
      const token = ++loadToken.current;
      setBusy(`Loading ${e.name}…`);
      try {
        const r = await loadSmiles(e.smiles);
        if (token !== loadToken.current) return;
        openDocument(r.graph, { name: e.name, source: { kind: "library", ref: e.id, cid: e.cid }, iupac: e.iupac, mesh: e.categories.includes("pharmaceutical") || e.mesh.length ? e.mesh : null }, null);
        if (mode === "learn") setTasks(generateTasks(r.graph));
      } catch (err) {
        fail(err, "We couldn't interpret this structure.");
      } finally {
        if (token === loadToken.current) setBusy(null);
      }
    },
    [openDocument, fail, mode],
  );

  const openPubChem = useCallback(
    async (hit: PubChemHit) => {
      const token = ++loadToken.current;
      setBusy(`Loading ${hit.title} from PubChem…`);
      try {
        const sdf = await fetchPubChemSdf(hit.cid);
        if (token !== loadToken.current) return;
        let r: Awaited<ReturnType<typeof loadMolfile>>;
        try {
          r = await loadMolfile(sdf.text);
        } catch (err) {
          if (err instanceof ChemFailure && err.code === "too-large") {
            setViewOnly({ name: hit.title, text: sdf.text, format: "sdf", key: `pc${hit.cid}`, isProtein: false });
            dispatch({ type: "replace", graph: emptyGraph(), label: "" });
            setDoc({ ...newDoc(hit.title), source: { kind: "pubchem", cid: hit.cid } });
            resetDerived();
            setStarted(true);
            setSheet(null);
            notify("This molecule is too large to edit — it is open in the 3D view only.", "info");
            return;
          }
          throw err;
        }
        if (token !== loadToken.current) return;
        openDocument(r.graph, { name: hit.title, source: { kind: "pubchem", cid: hit.cid }, meshLoading: true }, r.conformer, r.conformer ? "pubchem" : null);
        fetchMeshClasses(hit.cid)
          .then((mesh) => token === loadToken.current && setDoc((d) => ({ ...d, mesh, meshLoading: false })))
          .catch(() => token === loadToken.current && setDoc((d) => ({ ...d, mesh: null, meshLoading: false })));
      } catch (err) {
        fail(err, "PubChem could not be reached.");
      } finally {
        if (token === loadToken.current) setBusy(null);
      }
    },
    [openDocument, fail, notify],
  );

  const openRaw = useCallback((name: string, text: string, format: string, isProtein: boolean) => {
    loadToken.current++;
    dispatch({ type: "replace", graph: emptyGraph(), label: "" });
    setDoc(newDoc(name));
    setViewOnly({ name, text, format, key: `raw${Date.now()}`, isProtein });
    setStyle3d(isProtein ? "cartoon" : "ballStick");
    setLabels3d("none");
    setSurface("none");
    // A grey cartoon hides the chain's path; rainbow runs N- to C-terminus.
    setColorScheme(isProtein ? "spectrum" : "element");
    resetDerived();
    setStarted(true);
    setSheet(null);
  }, []);

  const openPdb = useCallback(
    async (id: string) => {
      setBusy(`Fetching ${id.toUpperCase()} from RCSB PDB…`);
      try {
        const text = await fetchPdb(id);
        openRaw(id.toUpperCase(), text, "pdb", true);
      } catch (err) {
        fail(err, "The PDB entry could not be loaded.");
      } finally {
        setBusy(null);
      }
    },
    [openRaw, fail],
  );

  const openFile = useCallback(
    async (file: File) => {
      if (file.size > 20 * 1024 * 1024) {
        notify("That file is larger than 20 MB.", "error");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const base = file.name.replace(/\.[^.]+$/, "");
      setBusy(`Reading ${file.name}…`);
      try {
        const text = await file.text();
        if (RAW_FORMATS[ext]) {
          openRaw(file.name, text, RAW_FORMATS[ext], ext !== "xyz" && ext !== "mol2");
          return;
        }
        if (ext === "json") {
          const data = JSON.parse(text);
          if (data?.format !== "pharmawallah-molecular-lab" || !isMolGraph(data.graph)) throw new Error("This JSON file is not a Molecular Lab project.");
          openDocument(data.graph, { name: String(data.name || base), source: data.source ?? { kind: "file", ref: file.name }, original: data.graph }, null);
          return;
        }
        if (ext === "smi" || ext === "smiles" || ext === "txt") {
          const line = text.split(/\r?\n/).find((l) => l.trim())?.trim().split(/\s+/)[0] ?? "";
          const r = await loadSmiles(line);
          openDocument(r.graph, { name: base, source: { kind: "file", ref: file.name } }, null);
          return;
        }
        try {
          const r = await loadMolfile(text);
          openDocument(r.graph, { name: text.split(/\r?\n/)[0]?.trim() || base, source: { kind: "file", ref: file.name } }, r.conformer, r.conformer ? "file" : null);
        } catch (err) {
          if (err instanceof ChemFailure && err.code === "too-large") {
            openRaw(file.name, text, "sdf", false);
            notify("This structure is too large to edit — it is open in the 3D view only.");
            return;
          }
          throw err;
        }
      } catch (err) {
        fail(err, "We couldn't interpret this structure.");
      } finally {
        setBusy(null);
      }
    },
    [openDocument, openRaw, fail, notify],
  );

  const openSaved = useCallback(
    (m: SavedMolecule) => {
      openDocument(m.graph, { name: m.name, source: m.source, savedId: m.id, original: m.graph }, null);
      setSheet(null);
    },
    [openDocument],
  );

  const startNew = useCallback(() => {
    loadToken.current++;
    dispatch({ type: "replace", graph: emptyGraph(), label: "New molecule" });
    setDoc(newDoc());
    setViewOnly(null);
    setConf(idleConf);
    resetDerived();
    setStarted(true);
    setTool("atom");
    setOpts((o) => ({ ...o, element: "C" }));
    setView((v) => (v === "3d" ? "2d" : v));
    setConfirm(null);
    setTasks([]);
    notify("Blank canvas — tap anywhere to place a carbon. Choose another element from the picker.");
  }, [notify]);

  const requestNew = () => {
    if (hasStructure && (modified || !doc.original)) setConfirm("new");
    else startNew();
  };

  const clearCanvas = () => {
    commit(emptyGraph(), "Cleared canvas");
    setConfirm(null);
  };

  const resetStructure = () => {
    if (doc.original) commit(doc.original, "Reset to original");
    setConfirm(null);
  };

  // ─── RESTORE / AUTOSAVE / DEEP LINKS ──────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const example = params.get("example");
    const smi = params.get("smiles");
    const cid = params.get("cid");
    if (example && entryById(example)) {
      openEntry(entryById(example)!);
      return;
    }
    if (smi) {
      setBusy("Loading structure…");
      loadSmiles(smi.slice(0, 2000))
        .then((r) => openDocument(r.graph, { name: params.get("name")?.slice(0, 80) || "Structure from link" }, null))
        .catch((err) => fail(err, "We couldn't interpret this structure."))
        .finally(() => setBusy(null));
      return;
    }
    if (cid && /^\d{1,10}$/.test(cid)) {
      openPubChem({ cid: Number(cid), title: params.get("name")?.slice(0, 80) || `CID ${cid}`, formula: "", mw: NaN, smiles: "" });
      return;
    }
    const s = readSession();
    if (s && s.graph.atoms.length) setRestore(s);
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!started || viewOnly || restore) return;
    const t = window.setTimeout(() => {
      if (!graph.atoms.length && !doc.original) clearSession();
      else writeSession({ name: doc.name, graph, original: doc.original, source: doc.source, savedAt: new Date().toISOString() });
    }, 700);
    return () => window.clearTimeout(t);
  }, [graph, doc.name, doc.original, doc.source, started, viewOnly, restore]);

  // ─── 3D ───────────────────────────────────────────────────────────────────

  const wants3D = !viewOnly && hasStructure && (view !== "2d" || measureKind !== null || sheet === "export");
  useEffect(() => {
    if (!wants3D || conf.key === key) return;
    if (!liveUpdate && conf.status !== "idle" && conf.key) return;
    let cancelled = false;
    setConf((c) => ({ ...c, status: "loading", error: "" }));
    const t = window.setTimeout(() => {
      makeConformer(graph)
        .then((r) => {
          if (!cancelled) setConf({ key, conformer: r.conformer, graph, source: "generated", minimised: r.minimised, status: "ready", error: "" });
        })
        .catch((err) => {
          if (!cancelled) setConf({ key, conformer: null, graph: null, source: null, minimised: null, status: "error", error: err instanceof Error ? err.message : "3D visualization isn't available for this structure." });
        });
    }, 350);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
    // `graph` is represented by `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wants3D, key, liveUpdate, conf.key]);

  const updateNow = () => {
    setConf((c) => ({ ...c, key: "", status: "idle" }));
  };

  const conformerFresh = conf.status === "ready" && conf.key === key && conf.conformer !== null;
  const model: Model3D | null = useMemo(() => {
    if (viewOnly) return { key: viewOnly.key, text: viewOnly.text, format: viewOnly.format };
    if (!conf.conformer || !conf.graph || !hasStructure) return null;
    // A stale conformer (Live 3D off) is still drawn, with an "Update 3D" button.
    return conformerModel(conf.conformer, conf.graph, conf.key, doc.name);
    // The name only labels the SDF record; renaming must not rebuild the model.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewOnly, conf.conformer, conf.graph, conf.key, hasStructure]);

  const pickAtom3D = useCallback(
    (a: PickedAtom) => {
      if (measureKind) {
        // Computed outside any state updater: StrictMode runs updaters twice.
        if (picks.some((p) => p.index === a.index)) {
          setPicks(picks.filter((p) => p.index !== a.index));
          return;
        }
        const next = [...picks, a];
        if (next.length === MEASURE_ATOMS[measureKind]) {
          const value = measureValue(measureKind, next)!;
          measureId.current += 1;
          const id = measureId.current;
          setMeasures((m) => [...m, { id, kind: measureKind, value, atoms: next.map((p) => p.label), points: next }]);
          setPicks([]);
        } else setPicks(next);
        return;
      }
      if (viewOnly || !model?.parents) return;
      const parent = model.parents[a.index];
      if (parent === undefined || !atomById(graph, parent)) return;
      if (mode === "learn" || opts.multi) {
        setSelection((s) => (s.atoms.includes(parent) ? { ...s, atoms: s.atoms.filter((x) => x !== parent) } : { ...s, atoms: [...s.atoms, parent] }));
      } else setSelection({ atoms: [parent], bonds: [] });
    },
    [measureKind, picks, viewOnly, model, graph, mode, opts.multi],
  );

  const pickBond3D = useCallback(
    (id: number) => {
      if (measureKind || !bondById(graph, id)) return;
      setSelection(mode === "learn" || opts.multi ? (s) => ({ ...s, bonds: s.bonds.includes(id) ? s.bonds.filter((b) => b !== id) : [...s.bonds, id] }) : { atoms: [], bonds: [id] });
    },
    [measureKind, graph, mode, opts.multi],
  );

  const measureOverlay: MeasureOverlay | null = useMemo(() => {
    if (!measureKind && !measures.length) return null;
    const lines: MeasureOverlay["lines"] = [];
    const labels: MeasureOverlay["labels"] = [];
    const pt = (p: PickedAtom) => ({ x: p.x, y: p.y, z: p.z });
    for (const m of measures) {
      for (let i = 0; i + 1 < m.points.length; i++) lines.push({ a: pt(m.points[i]), b: pt(m.points[i + 1]) });
      const at = m.points.reduce((s, p) => ({ x: s.x + p.x / m.points.length, y: s.y + p.y / m.points.length, z: s.z + p.z / m.points.length }), { x: 0, y: 0, z: 0 });
      labels.push({ at, text: m.kind === "distance" ? `${m.value.toFixed(2)} Å` : `${m.value.toFixed(1)}°` });
    }
    return { picks: picks.map((p) => p.index), lines, labels };
  }, [measureKind, measures, picks]);

  // Measurements belong to one set of coordinates.
  useEffect(() => {
    setMeasures([]);
    setPicks([]);
  }, [model?.key]);

  // ─── ANALYSIS ─────────────────────────────────────────────────────────────

  const groups = useMemo(() => (groupsOn ? findGroups(graph, report) : []), [groupsOn, graph, report]);
  const task = mode === "learn" ? tasks[taskIndex] : undefined;

  const highlight: Selection | null = useMemo(() => {
    if (task && revealed) return answerFor(task);
    if (task?.kind === "make-double" && taskResults[task.key] !== "correct") return { atoms: [], bonds: [task.bond] };
    const g = groups.find((x) => x.key === activeGroup);
    return g ? { atoms: g.atoms, bonds: g.bonds } : null;
  }, [task, revealed, taskResults, groups, activeGroup]);

  useEffect(() => {
    if (!hasStructure) {
      setSmiles(null);
      return;
    }
    let live = true;
    const t = window.setTimeout(() => {
      smilesOf(graph)
        .then((s) => live && setSmiles(s))
        .catch(() => live && setSmiles(null));
    }, 400);
    return () => {
      live = false;
      window.clearTimeout(t);
    };
  }, [graph, hasStructure]);

  // Edit tasks are checked after every change.
  useEffect(() => {
    if (!task || task.kind === "select-atoms" || task.kind === "select-ring" || task.kind === "select-bond") return;
    const r = checkEdit(task, graph);
    if (r === "correct" && taskResults[task.key] !== "correct") {
      setTaskResults((t) => ({ ...t, [task.key]: "correct" }));
      notify("✓ Correct", "ok");
    }
  }, [graph, task, taskResults, notify]);

  const startLearning = () => {
    setMode("learn");
    const t = generateTasks(graph);
    setTasks(t);
    setTaskIndex(0);
    setTaskResults({});
    setRevealed(false);
    setSelection(EMPTY_SELECTION);
    setTool("select");
    setSheet(isNarrow ? "learn" : null);
    if (!isNarrow) setPanelOpen(true);
    if (!hasStructure) notify("Load a molecule first — tasks are written for the structure on screen.");
  };

  const checkTask = () => {
    if (!task) return;
    const r = checkSelection(task, selection.atoms, selection.bonds);
    setTaskResults((t) => ({ ...t, [task.key]: r }));
    if (r === "correct") notify("✓ Correct", "ok");
  };

  const moveTask = (d: number) => {
    setTaskIndex((i) => Math.max(0, Math.min(tasks.length - 1, i + d)));
    setRevealed(false);
    setSelection(EMPTY_SELECTION);
  };

  // ─── SELECTION ACTIONS ────────────────────────────────────────────────────

  const deleteSelection = useCallback(() => {
    if (!selection.atoms.length && !selection.bonds.length) return;
    const n = selection.atoms.length + selection.bonds.length;
    commit(deleteItems(graph, selection.atoms, selection.bonds), selection.atoms.length ? (n > 1 ? "Deleted selection" : "Deleted atom") : "Deleted bond");
    setSelection(EMPTY_SELECTION);
  }, [selection, graph, commit]);

  const actions: SelectionActions = {
    setOrder: (bond, order) => commit(setBondOrder(graph, bond, order), "Changed bond order"),
    setStereo: (bond, stereo) => commit(stereo === "none" ? setBondStereo(graph, bond, "none") : setBondStereo(graph, bond, stereo), "Changed bond stereo"),
    breakBond: (bond) => {
      commit(breakBondOp(graph, bond), "Broke bond");
      setSelection(EMPTY_SELECTION);
      notify("Bond removed. The resulting structure may have incomplete valence.", "warn", true);
    },
    deleteSelection,
    setCharge: (atom, charge) => commit(setChargeOp(graph, atom, charge), "Changed charge"),
    setHydrogens: (atom, h) => commit(setHydrogensOp(graph, atom, h), h === null ? "Automatic hydrogens" : "Changed hydrogens"),
    changeElement: (atom) => {
      setElementTarget(atom);
      setSheet("element");
    },
    clearSelection: () => setSelection(EMPTY_SELECTION),
  };

  const pickElement = (symbol: string) => {
    if (elementTarget !== null && atomById(graph, elementTarget)) {
      const before = atomById(graph, elementTarget)!.el;
      if (before !== symbol) commit(setElement(graph, [elementTarget], symbol), `Changed ${before} to ${symbol}`);
      setElementTarget(null);
    } else {
      setOpts((o) => ({ ...o, element: symbol }));
      setTool("atom");
    }
    setSheet(null);
  };

  const chooseTool = (t: Tool) => {
    setTool(t);
    if (t !== "select") setMeasureKind(null);
    if (isNarrow) setSheet(null);
  };

  // ─── SAVE / EXPORT ────────────────────────────────────────────────────────

  const save = () => {
    if (!hasStructure) {
      notify("Nothing to save yet.");
      return;
    }
    const rec = saveMolecule({ id: doc.savedId ?? undefined, name: doc.name, graph, source: doc.source });
    if (!rec) {
      notify("Saving failed — this browser is blocking local storage.", "error");
      return;
    }
    setDoc((d) => ({ ...d, savedId: rec.id }));
    notify(`Saved “${rec.name}” to My Molecules on this device.`, "ok");
  };

  const copyText = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify(`${what} copied.`, "ok");
    } catch {
      notify("Copying is blocked in this browser.", "error");
    }
  };

  const base = fileSafeName(doc.name);
  const exports = {
    png2d: async () => {
      try {
        downloadBlob(await svgToPngBlob(drawingSvg(graph, { showCarbons, title: doc.name, scale: 56 })), `${base}-2d.png`);
      } catch (err) {
        fail(err, "PNG export failed.");
      }
    },
    svg2d: () => downloadText(drawingSvg(graph, { showCarbons, title: doc.name }), `${base}.svg`, "image/svg+xml"),
    png3d: () => {
      const uri = viewerRef.current?.png();
      if (!uri) {
        notify("Open the 3D view first.", "warn");
        return;
      }
      fetch(uri)
        .then((r) => r.blob())
        .then((b) => downloadBlob(b, `${base}-3d.png`))
        .catch((err) => fail(err, "PNG export failed."));
    },
    mol: () => {
      const text = graphToMolfile(graph, doc.name);
      if (!text) notify("Resolve the aromatic bonds before exporting a MOL file.", "error");
      else downloadText(text, `${base}.mol`, "chemical/x-mdl-molfile");
    },
    sdf: () => {
      if (!conformerFresh || !conf.conformer) {
        notify("The 3D coordinates are not ready yet.", "warn");
        return;
      }
      const source = conf.source === "pubchem" ? "PubChem 3D conformer" : conf.source === "file" ? "imported file" : `OpenChemLib conformer${conf.minimised ? ", MMFF94s+ minimised" : ""}`;
      downloadText(toSdf(conformerToMolfile(conf.conformer, doc.name), { NAME: doc.name, FORMULA: formula.formula, COORDINATES: source }), `${base}-3d.sdf`, "chemical/x-mdl-sdfile");
    },
    smiles: () => smiles && downloadText(`${smiles} ${doc.name}\n`, `${base}.smi`, "chemical/x-daylight-smiles"),
    json: () => downloadText(projectJson(doc.name, graph, doc.source), `${base}.molecular-lab.json`, "application/json"),
    raw: () => viewOnly && downloadText(viewOnly.text, fileSafeName(viewOnly.name) + (viewOnly.format === "pdb" ? ".pdb" : viewOnly.format === "sdf" ? ".sdf" : `.${viewOnly.format}`), "text/plain"),
  };

  // ─── KEYBOARD ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (sheet || confirm || restore) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
        return;
      }
      if (mod || e.altKey) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selection.atoms.length || selection.bonds.length) {
          e.preventDefault();
          deleteSelection();
        }
        return;
      }
      if (e.key === "Escape") {
        setSelection(EMPTY_SELECTION);
        setMeasureKind(null);
        setPicks([]);
        setTool("select");
        return;
      }
      if (!editable) return;
      if (e.key === "1") setTool("select");
      else if (e.key === "2") setTool("atom");
      else if (e.key === "3") setTool("bond");
      else if (e.key === "4") setTool("ring");
      else if (e.key === "5") setTool("erase");
      else if (["c", "n", "o", "s", "h", "f", "p"].includes(e.key.toLowerCase()) && !e.shiftKey) {
        const el = e.key.toUpperCase();
        if (selection.atoms.length && !selection.bonds.length) {
          commit(setElement(graph, selection.atoms, el), `Changed to ${el}`);
        } else {
          setOpts((o) => ({ ...o, element: el }));
          setTool("atom");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ─── RENDER HELPERS ───────────────────────────────────────────────────────

  const status = statusText(report, experiment);
  const lastLabel = hist.label;
  const selectedAtom = selection.atoms.length === 1 && !selection.bonds.length ? atomById(graph, selection.atoms[0]) : null;
  const selectedBond = selection.bonds.length === 1 && !selection.atoms.length ? bondById(graph, selection.bonds[0]) : null;
  const selfCoords = useMemo(() => {
    if (!selectedAtom || !conformerFresh || !conf.conformer) return null;
    const a = conf.conformer.atoms.find((x) => x.self && x.parent === selectedAtom.id);
    return a ? a.pos : null;
  }, [selectedAtom, conformerFresh, conf.conformer]);

  const measureBasis = viewOnly
    ? "Coordinates from the loaded file."
    : conf.source === "pubchem"
      ? "Coordinates: PubChem's computed 3D conformer."
      : conf.source === "file"
        ? "Coordinates: the imported file."
        : `Coordinates: generated by OpenChemLib${conf.minimised ? " and minimised with the MMFF94s+ force field" : " (force-field minimisation unavailable for this structure)"} — one reasonable conformer, not a crystal structure.`;
  const canMeasure = Boolean(viewOnly) || (conformerFresh && view !== "2d");

  const pickMode = mode === "learn" && !!task && (task.kind === "select-atoms" || task.kind === "select-ring" || task.kind === "select-bond");

  const editor = (
    <div className="ml-pane">
      {view === "split" && <span className="ml-pane-tag">2D editor</span>}
      <Editor2D
        ref={editorRef}
        graph={graph}
        report={report}
        tool={tool}
        opts={opts}
        selection={selection}
        highlight={highlight}
        showCarbons={showCarbons}
        pickMode={pickMode}
        fitKey={doc.fitKey}
        label={`2D structure of ${doc.name}: ${formula.formula || "empty"}`}
        onSelect={setSelection}
        onCommit={commit}
        onPreview={preview}
        onNotice={(text, tone) => notify(text, tone ?? "info", tone === "warn")}
      />
      {experiment && <p className="ml-banner">Experiment Mode allows you to modify structures freely. Modified structures may not represent chemically valid compounds.</p>}
      {!isNarrow && hasStructure && editable && (
        <p className="ml-hint">
          {pickMode
            ? "Tap atoms or bonds to select your answer, then press Check."
            : tool === "select"
              ? "Click to select · drag an atom to move · drag empty space to box-select · Alt-drag or wheel to pan/zoom"
              : tool === "atom"
                ? `Click empty space to place ${opts.element} · click an atom to attach · drag from an atom to draw a bond`
                : tool === "bond"
                  ? "Click a bond to change it · drag from an atom to another to connect · Shift frees the angle"
                  : "Esc returns to Select"}
        </p>
      )}
      <div className="ml-cam" role="toolbar" aria-label="2D view controls">
        <IconButton icon={<ZoomIn />} label="Zoom in" onClick={() => editorRef.current?.zoom(1.25)} />
        <IconButton icon={<ZoomOut />} label="Zoom out" onClick={() => editorRef.current?.zoom(0.8)} />
        <IconButton icon={<Maximize2 />} label="Fit structure to view" onClick={() => editorRef.current?.fit()} />
      </div>
      {!hasStructure && started && !busy && (
        <div className="ml-overlay" style={{ pointerEvents: "none" }}>
          <p className="ml-muted" style={{ pointerEvents: "none" }}>
            {tool === "atom" ? `Tap anywhere to place ${elementInfo(opts.element)?.name ?? opts.element}.` : "Choose Atom or Bond and tap the canvas to start drawing."}
          </p>
        </div>
      )}
    </div>
  );

  const viewer = (
    <div className="ml-pane">
      {view === "split" && <span className="ml-pane-tag">3D model</span>}
      <Viewer3D
        ref={viewerRef}
        model={model}
        fitKey={viewOnly ? viewOnly.key : doc.fitKey}
        style={style3d}
        colorScheme={viewOnly ? colorScheme : "element"}
        surface={viewOnly ? surface : "none"}
        labels={labels3d}
        spin={spin}
        selectedAtoms={viewOnly ? [] : selection.atoms}
        selectedBonds={viewOnly ? [] : selection.bonds}
        highlightAtoms={viewOnly ? [] : highlight?.atoms ?? []}
        highlightBonds={viewOnly ? [] : highlight?.bonds ?? []}
        measure={measureOverlay}
        onPickAtom={pickAtom3D}
        onPickBond={pickBond3D}
        onError={(m) => notify(m, "error")}
      />
      {!viewOnly && hasStructure && conf.status === "loading" && (
        <span className="ml-badge ml-badge--tr">
          <span className="ml-spin" aria-hidden="true" /> {conf.conformer ? "Updating 3D…" : "Generating 3D…"}
        </span>
      )}
      {!viewOnly && hasStructure && !liveUpdate && conf.key !== key && conf.status !== "loading" && (
        <button type="button" className="ml-btn ml-btn--primary ml-badge ml-badge--tr" onClick={updateNow}>
          Update 3D
        </button>
      )}
      {!viewOnly && hasStructure && conf.status === "error" && conf.key === key && (
        <div className="ml-overlay">
          <div className="ml-note" role="alert">
            <h3>3D visualization isn&apos;t available for this structure.</h3>
            <p>{conf.error && conf.error !== "3D visualization isn't available for this structure." ? conf.error : "The 3D generator could not place these atoms. Check the highlighted valence problems, or undo the last change."}</p>
            <div className="ml-optrow" style={{ justifyContent: "center", marginTop: 10 }}>
              <button type="button" className="ml-btn" onClick={undo} disabled={!hist.past.length}>
                <Undo2 /> Undo
              </button>
              <button type="button" className="ml-btn" onClick={updateNow}>
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
      {!viewOnly && !hasStructure && started && (
        <div className="ml-overlay">
          <p className="ml-muted">The 3D model appears once there is a structure.</p>
        </div>
      )}
      {measureKind && (
        <span className="ml-badge ml-badge--bl">
          <Ruler size={13} /> Tap {MEASURE_ATOMS[measureKind] - picks.length} more atom{MEASURE_ATOMS[measureKind] - picks.length === 1 ? "" : "s"} for the {measureKind}
        </span>
      )}
      {(model || viewOnly) && (
        <div className="ml-cam" role="toolbar" aria-label="3D view controls">
          <IconButton icon={<RotateCcw />} label="Rotate left" onClick={() => viewerRef.current?.rotate(-30, "y")} />
          <IconButton icon={<RotateCw />} label="Rotate right" onClick={() => viewerRef.current?.rotate(30, "y")} />
          <IconButton icon={<ZoomIn />} label="Zoom in" onClick={() => viewerRef.current?.zoom(1.25)} />
          <IconButton icon={<ZoomOut />} label="Zoom out" onClick={() => viewerRef.current?.zoom(0.8)} />
          <IconButton icon={<Crosshair />} label="Center molecule" onClick={() => viewerRef.current?.center()} />
          <IconButton icon={<Maximize2 />} label="Reset camera" onClick={() => viewerRef.current?.reset()} />
          <IconButton icon={spin ? <Pause /> : <Play />} label={spin ? "Stop auto-rotate" : "Auto-rotate"} pressed={spin} onClick={() => setSpin((s) => !s)} />
        </div>
      )}
      {!isNarrow && !measureKind && (model || viewOnly) && (
        <p className="ml-hint">Drag to rotate · scroll or right-drag to zoom · Ctrl-drag to pan · {viewOnly ? "use Measure to pick atoms" : "click an atom or bond to select"}</p>
      )}
    </div>
  );

  // ─── CONTEXT BAR ──────────────────────────────────────────────────────────

  const contextBar = editable && !pickMode && (selectedAtom || selectedBond || selection.atoms.length + selection.bonds.length > 1) && (
    <div className="ml-context" role="toolbar" aria-label="Selection actions">
      {selectedAtom && (
        <>
          <span className="ml-context-label">
            {elementInfo(selectedAtom.el)?.name ?? selectedAtom.el}
            {selectedAtom.charge ? ` ${selectedAtom.charge > 0 ? "+" : "−"}${Math.abs(selectedAtom.charge) > 1 ? Math.abs(selectedAtom.charge) : ""}` : ""}
          </span>
          <button type="button" className="ml-btn ml-btn--sm" onClick={() => actions.changeElement(selectedAtom.id)}>
            <Atom /> Element
          </button>
          <span className="ml-sep" aria-hidden="true" />
          <IconButton className="ml-btn--sm" icon={<Minus />} label="Decrease charge" onClick={() => actions.setCharge(selectedAtom.id, selectedAtom.charge - 1)} />
          <span className="ml-context-label" style={{ padding: 0 }}>Charge</span>
          <IconButton className="ml-btn--sm" icon={<Plus />} label="Increase charge" onClick={() => actions.setCharge(selectedAtom.id, selectedAtom.charge + 1)} />
          <span className="ml-sep" aria-hidden="true" />
          <IconButton className="ml-btn--sm" icon={<Minus />} label="Remove hydrogen" onClick={() => actions.setHydrogens(selectedAtom.id, Math.max(0, (report.atoms.get(selectedAtom.id)?.hydrogens ?? 0) - 1))} />
          <span className="ml-context-label" style={{ padding: 0 }}>H {report.atoms.get(selectedAtom.id)?.hydrogens ?? 0}</span>
          <IconButton className="ml-btn--sm" icon={<Plus />} label="Add hydrogen" onClick={() => actions.setHydrogens(selectedAtom.id, (report.atoms.get(selectedAtom.id)?.hydrogens ?? 0) + 1)} />
          <span className="ml-sep" aria-hidden="true" />
        </>
      )}
      {selectedBond && (
        <>
          {(
            [
              [1, "Single"],
              [2, "Double"],
              [3, "Triple"],
              ["ar", "Aromatic"],
            ] as [BondOrder, string][]
          ).map(([o, l]) => (
            <button key={String(o)} type="button" className="ml-btn ml-btn--sm" aria-pressed={selectedBond.order === o} onClick={() => actions.setOrder(selectedBond.id, o)}>
              {l}
            </button>
          ))}
          <span className="ml-sep" aria-hidden="true" />
          <button type="button" className="ml-btn ml-btn--sm" onClick={() => actions.breakBond(selectedBond.id)}>
            <Scissors /> Break
          </button>
        </>
      )}
      {!selectedAtom && !selectedBond && <span className="ml-context-label">{selection.atoms.length + selection.bonds.length} selected</span>}
      <button type="button" className="ml-btn ml-btn--sm ml-btn--danger" onClick={deleteSelection}>
        <Trash2 /> Delete
      </button>
    </div>
  );

  // ─── TOOL LISTS ───────────────────────────────────────────────────────────

  const toolRail = (
    <>
      <h2>Selection</h2>
      <div className="ml-toolgrid">
        <ToolButton icon={<MousePointer2 />} label="Select" tip="Select and move atoms and bonds" kbd="1" pressed={tool === "select" && !opts.multi} onClick={() => { chooseTool("select"); setOpts((o) => ({ ...o, multi: false })); }} disabled={!editable} />
        <ToolButton icon={<SquareDashed />} label="Multiple" tip="Select several atoms and bonds (tap to add, drag a box)" pressed={tool === "select" && opts.multi} onClick={() => { chooseTool("select"); setOpts((o) => ({ ...o, multi: !o.multi || tool !== "select" })); }} disabled={!editable} />
      </div>
      <h2>Structure</h2>
      <div className="ml-toolgrid">
        <ToolButton icon={<Atom />} label={`Atom · ${opts.element}`} tip={`Add atom (${elementInfo(opts.element)?.name ?? opts.element}); tap an atom to change its element`} kbd="2" pressed={tool === "atom"} onClick={() => chooseTool("atom")} disabled={!editable} />
        <ToolButton icon={<Library />} label="Element…" tip="Choose the element to draw" onClick={() => { setElementTarget(null); setSheet("element"); }} disabled={!editable} />
        <ToolButton icon={<Minus />} label="Bond" tip="Draw bond / change bond order" kbd="3" pressed={tool === "bond"} onClick={() => chooseTool("bond")} disabled={!editable} />
        <ToolButton icon={<Hexagon />} label="Ring" tip="Add a ring (tap empty space, an atom or a bond)" kbd="4" pressed={tool === "ring"} onClick={() => chooseTool("ring")} disabled={!editable} />
        <ToolButton icon={<Shapes />} label="Group" tip="Attach a functional group to an atom" pressed={tool === "group"} onClick={() => chooseTool("group")} disabled={!editable} />
        <ToolButton icon={<Plus />} label="Charge" tip="Tap an atom to add a positive (or negative) charge" pressed={tool === "charge"} onClick={() => chooseTool("charge")} disabled={!editable} />
        <ToolButton icon={<span style={{ fontWeight: 800, width: 17, textAlign: "center" }}>H</span>} label="Hydrogen" tip="Tap an atom to add or remove a hydrogen" pressed={tool === "hydrogen"} onClick={() => chooseTool("hydrogen")} disabled={!editable} />
        <ToolButton icon={<Scissors />} label="Break" tip="Break a bond (keeps each atom's hydrogens)" pressed={tool === "break"} onClick={() => chooseTool("break")} disabled={!editable} />
        <ToolButton icon={<Eraser />} label="Delete" tip="Delete atoms and bonds you tap" kbd="5" pressed={tool === "erase"} onClick={() => chooseTool("erase")} disabled={!editable} />
      </div>
      {tool === "bond" && (
        <div className="ml-optrow" role="group" aria-label="Bond type">
          {BOND_CHOICES.map((b) => (
            <button key={b.tip} type="button" className="ml-opt" title={b.tip} aria-label={b.tip} aria-pressed={opts.order === b.order && opts.stereo === b.stereo} onClick={() => setOpts((o) => ({ ...o, order: b.order, stereo: b.stereo }))}>
              {b.label}
            </button>
          ))}
        </div>
      )}
      {tool === "ring" && (
        <div className="ml-optrow" role="group" aria-label="Ring type">
          {RINGS.map((r) => (
            <button key={String(r.value)} type="button" className="ml-opt" aria-pressed={opts.ring === r.value} onClick={() => setOpts((o) => ({ ...o, ring: r.value }))} aria-label={r.value === "benzene" ? "Benzene ring" : `${r.value}-membered ring`}>
              {r.label}
            </button>
          ))}
        </div>
      )}
      {tool === "group" && (
        <div className="ml-optrow" role="group" aria-label="Functional group">
          {(Object.keys(GROUP_LABELS) as GroupKind[]).map((gk) => (
            <button key={gk} type="button" className="ml-opt" aria-pressed={opts.group === gk} onClick={() => setOpts((o) => ({ ...o, group: gk }))} title={GROUP_LABELS[gk]}>
              {GROUP_LABELS[gk].split("  ")[1] ?? gk}
            </button>
          ))}
        </div>
      )}
      {tool === "charge" && (
        <div className="ml-optrow" role="group" aria-label="Charge direction">
          <button type="button" className="ml-opt" aria-pressed={opts.chargeSign === 1} onClick={() => setOpts((o) => ({ ...o, chargeSign: 1 }))}>
            + Positive
          </button>
          <button type="button" className="ml-opt" aria-pressed={opts.chargeSign === -1} onClick={() => setOpts((o) => ({ ...o, chargeSign: -1 }))}>
            − Negative
          </button>
        </div>
      )}
      {tool === "hydrogen" && (
        <div className="ml-optrow" role="group" aria-label="Hydrogen">
          <button type="button" className="ml-opt" aria-pressed={opts.hSign === 1} onClick={() => setOpts((o) => ({ ...o, hSign: 1 }))}>
            + Add H
          </button>
          <button type="button" className="ml-opt" aria-pressed={opts.hSign === -1} onClick={() => setOpts((o) => ({ ...o, hSign: -1 }))}>
            − Remove H
          </button>
        </div>
      )}
      <h2>Analysis</h2>
      <div className="ml-toolgrid">
        <ToolButton icon={<Sparkles />} label="Groups" tip="Analyze structure: find functional groups" pressed={groupsOn} onClick={() => { setGroupsOn(true); setPanelOpen(true); if (isNarrow) setSheet("info"); }} disabled={!hasStructure} />
        <ToolButton icon={<Wand2 />} label="Clean up" tip="Redraw the structure with a clean 2D layout" onClick={async () => {
          try {
            const g = await cleanLayout(graph);
            commit(g, "Cleaned layout");
            editorRef.current?.fit();
          } catch (err) {
            fail(err, "The layout could not be cleaned.");
          }
        }} disabled={!hasStructure || !editable} />
        <ToolButton icon={<Ruler />} label="Measure" tip="Measure distances and angles in 3D" pressed={measureKind !== null} onClick={() => {
          if (view === "2d") setView(isNarrow ? "3d" : "split");
          setMeasureKind((k) => (k ? null : "distance"));
          setPicks([]);
          setPanelOpen(true);
          if (isNarrow) setSheet("info");
        }} disabled={!hasStructure && !viewOnly} />
        <ToolButton icon={<Info />} label="Details" tip="Molecular information" onClick={() => (isNarrow ? setSheet("info") : setPanelOpen((p) => !p))} />
      </div>
      <h2>Modes</h2>
      <div className="ml-toolgrid">
        <ToolButton wide icon={<GraduationCap />} label="Learning mode" tip="Learning Mode: interactive tasks about this molecule" pressed={mode === "learn"} onClick={() => (mode === "learn" ? setMode("build") : startLearning())} disabled={!editable} />
        <ToolButton wide icon={<FlaskConical />} label="Experiment mode" tip="Experiment Mode: modify freely without warnings" pressed={mode === "experiment"} onClick={() => setMode((m) => (m === "experiment" ? "build" : "experiment"))} disabled={!editable} />
        <ToolButton icon={<Columns2 />} label="Compare" tip="Compare two molecules" onClick={() => setSheet("compare")} />
        <ToolButton icon={<Settings2 />} label="Display" tip="Display settings" onClick={() => setSheet("display")} />
      </div>
    </>
  );

  const displaySettings = (
    <div>
      <p className="ml-subhead" style={{ marginTop: 0 }}>3D style</p>
      <Segmented<Style3D>
        label="3D style"
        value={style3d}
        onChange={setStyle3d}
        options={[
          { value: "ballStick", label: "Ball & stick" },
          { value: "sphere", label: "Space filling" },
          { value: "stick", label: "Stick" },
          { value: "line", label: "Wireframe" },
          ...(viewOnly?.isProtein ? [{ value: "cartoon" as Style3D, label: "Cartoon" }] : []),
        ]}
      />
      <p className="ml-subhead">Labels</p>
      <Segmented
        label="3D labels"
        value={labels3d}
        onChange={setLabels3d}
        options={[
          { value: "none", label: "Hide labels" },
          { value: "element", label: "Element labels", disabled: Boolean(viewOnly) },
          ...(viewOnly?.isProtein ? [{ value: "residue" as const, label: "Residues" }] : []),
        ]}
      />
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, fontWeight: 600 }}>
        <input type="checkbox" checked={showCarbons} onChange={(e) => setShowCarbons(e.target.checked)} style={{ width: 18, height: 18 }} />
        Show carbon labels in 2D (C—C—O instead of skeletal)
      </label>
      <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, fontWeight: 600 }}>
        <input type="checkbox" checked={liveUpdate} onChange={(e) => setLiveUpdate(e.target.checked)} style={{ width: 18, height: 18 }} />
        Update 3D automatically after each edit
      </label>
      {viewOnly && (
        <>
          <p className="ml-subhead">Colour</p>
          <Segmented<ColorScheme3D>
            label="Colour scheme"
            value={colorScheme}
            onChange={setColorScheme}
            options={[
              { value: "element", label: "Element (CPK)" },
              { value: "chain", label: "Chain" },
              { value: "spectrum", label: "Rainbow" },
              { value: "ss", label: "Secondary structure" },
            ]}
          />
          <p className="ml-subhead">Surface</p>
          <Segmented<Surface3D>
            label="Surface"
            value={surface}
            onChange={setSurface}
            options={[
              { value: "none", label: "Off" },
              { value: "vdw", label: "VDW" },
              { value: "sas", label: "SAS" },
              { value: "ses", label: "SES" },
            ]}
          />
        </>
      )}
      <p className="ml-muted" style={{ marginTop: 12 }}>Atoms are coloured by element (CPK colours): carbon grey, oxygen red, nitrogen blue, sulfur yellow, halogens green.</p>
    </div>
  );

  const exportSheet = (
    <div className="ml-list">
      {viewOnly ? (
        <>
          <button type="button" className="ml-item" onClick={exports.png3d}>
            <span className="ml-item-main"><span className="ml-item-title">PNG image — 3D view</span><span className="ml-item-sub">The current 3D view</span></span>
          </button>
          <button type="button" className="ml-item" onClick={exports.raw}>
            <span className="ml-item-main"><span className="ml-item-title">Original file</span><span className="ml-item-sub">{viewOnly.format.toUpperCase()}, as loaded</span></span>
          </button>
        </>
      ) : !hasStructure ? (
        <p className="ml-muted">Draw or load a structure to export it.</p>
      ) : (
        <>
          <button type="button" className="ml-item" onClick={exports.png2d}>
            <span className="ml-item-main"><span className="ml-item-title">PNG image — 2D structure</span><span className="ml-item-sub">High-resolution, white background</span></span>
          </button>
          <button type="button" className="ml-item" onClick={exports.svg2d}>
            <span className="ml-item-main"><span className="ml-item-title">SVG — 2D structure</span><span className="ml-item-sub">Scalable, for reports and slides</span></span>
          </button>
          <button type="button" className="ml-item" onClick={exports.png3d} disabled={view === "2d"}>
            <span className="ml-item-main"><span className="ml-item-title">PNG image — 3D view</span><span className="ml-item-sub">{view === "2d" ? "Open the 3D view first" : "The current 3D view"}</span></span>
          </button>
          <button type="button" className="ml-item" onClick={exports.mol} disabled={report.aromaticUnresolved.length > 0}>
            <span className="ml-item-main"><span className="ml-item-title">MOL file (V2000)</span><span className="ml-item-sub">2D coordinates — opens in ChemDraw, MarvinSketch, RDKit</span></span>
          </button>
          <button type="button" className="ml-item" onClick={exports.sdf} disabled={!conformerFresh}>
            <span className="ml-item-main"><span className="ml-item-title">SDF file — 3D</span><span className="ml-item-sub">{conformerFresh ? "3D coordinates with all hydrogens" : conf.status === "loading" ? "Generating 3D coordinates…" : conf.status === "error" ? "No 3D model for this structure" : "Preparing 3D coordinates…"}</span></span>
          </button>
          <button type="button" className="ml-item" onClick={exports.smiles} disabled={!smiles}>
            <span className="ml-item-main"><span className="ml-item-title">SMILES</span><span className="ml-item-sub ml-mono">{smiles ?? "Not available"}</span></span>
          </button>
          <button type="button" className="ml-item" onClick={exports.json}>
            <span className="ml-item-main"><span className="ml-item-title">Molecular Lab project (JSON)</span><span className="ml-item-sub">Re-open it here later, with your hydrogens and layout</span></span>
          </button>
        </>
      )}
    </div>
  );

  const infoPanel = (
    <>
      {viewOnly ? (
        <section className="ml-card">
          <h3>3D view only</h3>
          <p style={{ fontWeight: 700 }}>{viewOnly.name}</p>
          <p className="ml-muted">{viewOnly.isProtein ? "Proteins and large structures open for viewing: styles, colour schemes, surfaces and measurements work; editing does not." : "This structure is too large (or has no bond information) for the editor."}</p>
          <button type="button" className="ml-btn ml-btn--sm" style={{ marginTop: 8 }} onClick={() => setSheet("display")}>
            <Settings2 /> Display options
          </button>
        </section>
      ) : (
        <>
          {mode === "learn" && (
            <LearningCard
              tasks={tasks}
              index={taskIndex}
              results={taskResults}
              revealed={revealed}
              selectionCount={selection.atoms.length + selection.bonds.length}
              onCheck={checkTask}
              onReveal={() => setRevealed((r) => !r)}
              onNext={() => moveTask(1)}
              onPrev={() => moveTask(-1)}
              onExit={() => {
                setMode("build");
                setRevealed(false);
              }}
            />
          )}
          <StatusCard graph={graph} report={report} experiment={experiment} onFocusAtom={(id) => setSelection({ atoms: [id], bonds: [] })} />
          {mode !== "learn" && <SelectionCard graph={graph} report={report} selection={selection} actions={actions} coords={selfCoords} />}
          <MoleculeCard name={doc.name} graph={graph} formula={formula} report={report} smiles={smiles} iupac={modified ? null : doc.iupac} onCopy={(t) => copyText(t, "SMILES")} />
        </>
      )}
      {(measureKind !== null || measures.length > 0 || view !== "2d") && (
        <MeasureCard
          kind={measureKind}
          picks={picks.map((p) => p.label)}
          results={measures}
          available={canMeasure}
          basis={measureBasis}
          onKind={(k) => {
            setMeasureKind(k);
            setPicks([]);
          }}
          onClear={() => {
            setMeasures([]);
            setPicks([]);
          }}
          onStop={() => {
            setMeasureKind(null);
            setPicks([]);
          }}
        />
      )}
      {!viewOnly && (
        <GroupsCard
          groups={groups}
          analysed={groupsOn}
          active={activeGroup}
          onAnalyse={() => {
            setGroupsOn(true);
            setActiveGroup(null);
          }}
          onPick={setActiveGroup}
        />
      )}
      {doc.source?.cid && !viewOnly && <PharmaCard name={doc.name} cid={doc.source.cid} mesh={doc.mesh} loading={doc.meshLoading} modified={modified} />}
    </>
  );

  const exampleList = examples();

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="pw-mlab">
      {/* Top bar */}
      <header className="ml-top">
        <div className="ml-brand">
          <span className="ml-brand-mark" aria-hidden="true">
            <Atom size={20} />
          </span>
          <div>
            <h1 className="ml-brand-title">Molecular Lab</h1>
            <p className="ml-brand-sub">Build • Explore • Manipulate • Understand</p>
          </div>
        </div>
        {(hasStructure || viewOnly || started) && (
          <input
            className="ml-name"
            value={viewOnly ? viewOnly.name : doc.name}
            onChange={(e) => (viewOnly ? setViewOnly({ ...viewOnly, name: e.target.value }) : setDoc((d) => ({ ...d, name: e.target.value })))}
            aria-label="Molecule name"
            maxLength={80}
          />
        )}
        {modified && <span className="ml-modified ml-desktop-only">Modified</span>}
        {mode !== "build" && <span className="ml-modified ml-desktop-only" style={{ color: "var(--ml-blue-ink)", background: "var(--ml-blue-soft)" }}>{mode === "learn" ? "Learning mode" : "Experiment mode"}</span>}
        <span className="ml-top-spacer" />
        <div className="ml-top-group ml-desktop-only">
          <button type="button" className="ml-btn" onClick={() => setSheet("library")} aria-label="Search molecules" title="Search molecules">
            <Search /> <span className="ml-btn-label">Search</span>
          </button>
          <Segmented<ViewMode>
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: "2d", label: "2D", disabled: Boolean(viewOnly) },
              { value: "3d", label: "3D" },
              { value: "split", label: "Split", disabled: Boolean(viewOnly) },
            ]}
          />
        </div>
        <div className="ml-top-group">
          <IconButton icon={<Undo2 />} label="Undo (Ctrl+Z)" onClick={undo} disabled={!hist.past.length} />
          <IconButton icon={<Redo2 />} label="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!hist.future.length} />
        </div>
        <div className="ml-top-group ml-desktop-only">
          <button type="button" className="ml-btn ml-btn--primary" onClick={requestNew} aria-label="New Molecule" title="New Molecule">
            <FilePlus2 /> <span className="ml-btn-label">New Molecule</span>
          </button>
          <IconButton icon={<Save />} label="Save molecule (Ctrl+S)" onClick={save} disabled={!hasStructure} />
          <IconButton icon={<FolderOpen />} label="My Molecules" onClick={() => setSheet("saved")} />
          <IconButton icon={<Download />} label="Export" onClick={() => setSheet("export")} disabled={!hasStructure && !viewOnly} />
          <IconButton className="ml-panel-toggle" icon={panelOpen ? <PanelRightClose /> : <PanelRightOpen />} label={panelOpen ? "Hide information panel" : "Show information panel"} onClick={() => setPanelOpen((p) => !p)} />
        </div>
      </header>

      {/* Phone: large 2D / 3D switch */}
      <div className="ml-viewbar">
        <Segmented<ViewMode>
          large
          label="View"
          value={view === "split" ? "2d" : view}
          onChange={setView}
          options={[
            { value: "2d", label: "2D", disabled: Boolean(viewOnly) },
            { value: "3d", label: "3D" },
          ]}
        />
        <IconButton icon={<Search />} label="Search molecules" onClick={() => setSheet("library")} />
      </div>

      <div className="ml-body" data-panel={panelOpen ? "open" : "closed"}>
        <nav className="ml-tools" aria-label="Tools">
          {toolRail}
        </nav>

        <main className="ml-stage" data-view={view} aria-busy={Boolean(busy)}>
          {view !== "3d" && editor}
          {view !== "2d" && viewer}
          {contextBar}
          {busy && (
            <div className="ml-overlay">
              <div className="ml-note" role="status">
                <span className="ml-spin" style={{ display: "inline-block", marginBottom: 6 }} aria-hidden="true" />
                <p>{busy}</p>
              </div>
            </div>
          )}
          {!started && !busy && !hasStructure && !viewOnly && (
            <div className="ml-empty">
              <div className="ml-empty-card">
                <div className="ml-empty-mark" aria-hidden="true">
                  <Atom size={34} />
                </div>
                <h2>Build Your Molecule</h2>
                <p>Draw a structure, load a molecule, or start experimenting.</p>
                <div className="ml-empty-actions">
                  <button type="button" className="ml-btn ml-btn--primary" onClick={startNew}>
                    <FilePlus2 /> New Molecule
                  </button>
                  <button type="button" className="ml-btn" onClick={() => setSheet("library")}>
                    <Search /> Search Molecules
                  </button>
                  <button type="button" className="ml-btn" onClick={() => document.getElementById("ml-examples")?.querySelector("button")?.focus()}>
                    <BookOpen /> Explore Examples
                  </button>
                </div>
                <div className="ml-examples" id="ml-examples" role="group" aria-label="Example molecules">
                  {exampleList.map((e) => (
                    <button key={e.id} type="button" className="ml-chip" onClick={() => openEntry(e)}>
                      {e.name} <small>{subscriptFormula(e.formula)}</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {toast && (
            <div className="ml-toast" data-tone={toast.tone} role="status" key={toast.id}>
              <span style={{ flex: 1 }}>{toast.text}</span>
              {toast.undo && hist.past.length > 0 && (
                <button
                  type="button"
                  className="ml-btn ml-btn--sm"
                  onClick={() => {
                    undo();
                    setToast(null);
                  }}
                >
                  <Undo2 /> Undo
                </button>
              )}
            </div>
          )}
        </main>

        <aside className="ml-panel" aria-label="Properties and molecular information">
          {infoPanel}
        </aside>
      </div>

      {/* Desktop status bar */}
      <footer className="ml-statusbar" aria-live="polite">
        {viewOnly ? (
          <span>
            <b>{viewOnly.name}</b> — 3D view only ({viewOnly.format.toUpperCase()}); editing and formula need a small molecule
          </span>
        ) : (
          <>
        <span>
          Atoms: <b>{formula.totalAtoms}</b>
        </span>
        <span>
          Bonds: <b>{graph.bonds.length}</b>
        </span>
        <span>
          Formula: <b>{formula.formula ? subscriptFormula(formula.formula) : "—"}</b>
        </span>
        <span>
          MW: <b>{formula.mw.toFixed(2)}</b> g/mol
        </span>
        <span>
          <span className="ml-status-dot" style={{ display: "inline-block", marginRight: 6, verticalAlign: "0", background: report.status === "valid" ? "var(--ml-green)" : report.status === "empty" ? "var(--ml-border-strong)" : report.status === "incomplete" ? "var(--ml-amber)" : "var(--ml-red)" }} />
          {status.title}
        </span>
          </>
        )}
        <span className="ml-last">{lastLabel}</span>
      </footer>

      {/* Phone: summary strip + bottom action bar */}
      <button type="button" className="ml-summary" onClick={() => setSheet(mode === "learn" ? "learn" : "info")} aria-label="Open molecular information">
        <span className="ml-status" data-state={report.status}>
          <span className="ml-status-dot" aria-hidden="true" />
        </span>
        <b>{formula.formula ? subscriptFormula(formula.formula) : viewOnly ? viewOnly.name : "No structure"}</b>
        <span>{hasStructure ? `${formula.mw.toFixed(2)} g/mol · ${status.title}` : ""}</span>
        <Info size={18} style={{ marginLeft: "auto", flexShrink: 0, color: "var(--ml-ink-3)" }} />
      </button>
      <nav className="ml-bottom" aria-label="Drawing tools">
        <button type="button" aria-pressed={tool === "select"} onClick={() => chooseTool("select")} disabled={!editable}>
          <MousePointer2 /> Select
        </button>
        <button type="button" aria-pressed={tool === "atom"} onClick={() => { setElementTarget(null); setTool("atom"); setSheet("element"); }} disabled={!editable}>
          <span className="ml-el-dot">{opts.element}</span>
          <Atom /> Atom
        </button>
        <button type="button" aria-pressed={tool === "bond"} onClick={() => { setTool("bond"); setSheet("bond"); }} disabled={!editable}>
          <Minus /> Bond
        </button>
        <button
          type="button"
          aria-pressed={tool === "erase"}
          onClick={() => {
            if (selection.atoms.length || selection.bonds.length) deleteSelection();
            else chooseTool(tool === "erase" ? "select" : "erase");
          }}
          disabled={!editable}
        >
          <Trash2 /> Delete
        </button>
        <button type="button" aria-pressed={sheet === "more"} onClick={() => setSheet("more")}>
          <MoreHorizontal /> More
        </button>
      </nav>

      {/* ── Sheets ── */}
      <Sheet open={sheet === "element"} title={elementTarget !== null ? "Change element" : "Select Element"} onClose={() => { setSheet(null); setElementTarget(null); }}>
        <ElementPicker value={elementTarget !== null ? atomById(graph, elementTarget)?.el ?? "" : opts.element} onPick={pickElement} onMore={() => setSheet("ptable")} />
      </Sheet>
      <Sheet open={sheet === "ptable"} title="Periodic Table" size="wide" onClose={() => { setSheet(null); setElementTarget(null); }}>
        <PeriodicTable value={elementTarget !== null ? atomById(graph, elementTarget)?.el ?? "" : opts.element} onPick={pickElement} />
      </Sheet>
      <Sheet open={sheet === "bond"} title="Bond type" onClose={() => setSheet(null)}>
        <p className="ml-muted" style={{ marginBottom: 10 }}>Tap an atom to grow a bond from it, drag from one atom to another to connect them, or tap a bond to change it.</p>
        <div className="ml-menu">
          {BOND_CHOICES.map((b) => (
            <button key={b.tip} type="button" aria-pressed={opts.order === b.order && opts.stereo === b.stereo} onClick={() => { setOpts((o) => ({ ...o, order: b.order, stereo: b.stereo })); setTool("bond"); setSheet(null); }}>
              <span style={{ fontSize: 22, fontWeight: 800 }}>{b.label}</span>
              {b.tip}
            </button>
          ))}
        </div>
      </Sheet>
      <Sheet open={sheet === "ring"} title="Ring" onClose={() => setSheet(null)}>
        <div className="ml-menu">
          {RINGS.map((r) => (
            <button key={String(r.value)} type="button" aria-pressed={tool === "ring" && opts.ring === r.value} onClick={() => { setOpts((o) => ({ ...o, ring: r.value })); setTool("ring"); setSheet(null); }}>
              <Hexagon />
              {r.value === "benzene" ? "Benzene" : `${r.value}-membered`}
            </button>
          ))}
        </div>
      </Sheet>
      <Sheet open={sheet === "group"} title="Functional group" onClose={() => setSheet(null)}>
        <p className="ml-muted" style={{ marginBottom: 10 }}>Choose a group, then tap the atom to attach it to.</p>
        <div className="ml-menu">
          {(Object.keys(GROUP_LABELS) as GroupKind[]).map((gk) => (
            <button key={gk} type="button" aria-pressed={tool === "group" && opts.group === gk} onClick={() => { setOpts((o) => ({ ...o, group: gk })); setTool("group"); setSheet(null); }}>
              <span style={{ fontWeight: 800 }}>{GROUP_LABELS[gk].split("  ")[1]}</span>
              {GROUP_LABELS[gk].split("  ")[0]}
            </button>
          ))}
        </div>
      </Sheet>
      <Sheet open={sheet === "more"} title="More" onClose={() => setSheet(null)}>
        <p className="ml-subhead" style={{ marginTop: 0 }}>Build</p>
        <div className="ml-menu">
          <button type="button" onClick={() => setSheet("ring")} disabled={!editable} aria-pressed={tool === "ring"}><Hexagon />Ring</button>
          <button type="button" onClick={() => setSheet("group")} disabled={!editable} aria-pressed={tool === "group"}><Shapes />Group</button>
          <button type="button" onClick={() => { setOpts((o) => ({ ...o, chargeSign: 1 })); chooseTool("charge"); }} disabled={!editable} aria-pressed={tool === "charge" && opts.chargeSign === 1}><Plus />Positive charge</button>
          <button type="button" onClick={() => { setOpts((o) => ({ ...o, chargeSign: -1 })); chooseTool("charge"); }} disabled={!editable} aria-pressed={tool === "charge" && opts.chargeSign === -1}><Minus />Negative charge</button>
          <button type="button" onClick={() => { setOpts((o) => ({ ...o, hSign: 1 })); chooseTool("hydrogen"); }} disabled={!editable} aria-pressed={tool === "hydrogen" && opts.hSign === 1}><span style={{ fontWeight: 800 }}>+H</span>Add hydrogen</button>
          <button type="button" onClick={() => { setOpts((o) => ({ ...o, hSign: -1 })); chooseTool("hydrogen"); }} disabled={!editable} aria-pressed={tool === "hydrogen" && opts.hSign === -1}><span style={{ fontWeight: 800 }}>−H</span>Remove hydrogen</button>
          <button type="button" onClick={() => chooseTool("break")} disabled={!editable} aria-pressed={tool === "break"}><Scissors />Break bond</button>
          <button type="button" onClick={() => { setOpts((o) => ({ ...o, multi: !o.multi })); chooseTool("select"); }} disabled={!editable} aria-pressed={opts.multi}><SquareDashed />Select multiple</button>
          <button type="button" onClick={() => setSheet("ptable")} disabled={!editable}><Library />Periodic table</button>
        </div>
        <p className="ml-subhead">Analyse & learn</p>
        <div className="ml-menu">
          <button type="button" onClick={() => { setGroupsOn(true); setSheet("info"); }} disabled={!hasStructure}><Sparkles />Analyze structure</button>
          <button type="button" onClick={() => setSheet("info")}><Info />Molecular info</button>
          <button type="button" onClick={() => { setView("3d"); setMeasureKind("distance"); setPicks([]); setSheet("info"); }} disabled={!hasStructure && !viewOnly}><Ruler />Measure</button>
          <button type="button" onClick={startLearning} disabled={!editable} aria-pressed={mode === "learn"}><GraduationCap />Learning mode</button>
          <button type="button" onClick={() => { setMode((m) => (m === "experiment" ? "build" : "experiment")); setSheet(null); }} disabled={!editable} aria-pressed={mode === "experiment"}><FlaskConical />Experiment mode</button>
          <button type="button" onClick={() => setSheet("compare")}><Columns2 />Compare</button>
        </div>
        <p className="ml-subhead">Molecule</p>
        <div className="ml-menu">
          <button type="button" onClick={requestNew}><FilePlus2 />New molecule</button>
          <button type="button" onClick={() => setSheet("library")}><Search />Search & library</button>
          <button type="button" onClick={() => { save(); setSheet(null); }} disabled={!hasStructure}><Save />Save</button>
          <button type="button" onClick={() => setSheet("saved")}><FolderOpen />My Molecules</button>
          <button type="button" onClick={() => setSheet("export")} disabled={!hasStructure && !viewOnly}><Download />Export</button>
          <button type="button" onClick={() => setSheet("display")}><Settings2 />Display</button>
          <button type="button" onClick={async () => {
            setSheet(null);
            try {
              commit(await cleanLayout(graph), "Cleaned layout");
              editorRef.current?.fit();
            } catch (err) {
              fail(err, "The layout could not be cleaned.");
            }
          }} disabled={!hasStructure || !editable}><Wand2 />Clean up drawing</button>
          <button type="button" onClick={() => { setSheet(null); setConfirm("reset"); }} disabled={!modified}><RotateCcw />Reset</button>
          <button type="button" onClick={() => { setSheet(null); setConfirm("clear"); }} disabled={!hasStructure}><Trash2 />Clear canvas</button>
        </div>
      </Sheet>
      <Sheet open={sheet === "info"} title="Molecular information" onClose={() => setSheet(null)}>
        <div style={{ display: "grid", gap: 10 }}>{infoPanel}</div>
      </Sheet>
      <Sheet open={sheet === "learn"} title="Learning mode" onClose={() => setSheet(null)}>
        {mode === "learn" ? (
          <LearningCard
            tasks={tasks}
            index={taskIndex}
            results={taskResults}
            revealed={revealed}
            selectionCount={selection.atoms.length + selection.bonds.length}
            onCheck={() => {
              checkTask();
            }}
            onReveal={() => {
              setRevealed((r) => !r);
              setSheet(null);
            }}
            onNext={() => moveTask(1)}
            onPrev={() => moveTask(-1)}
            onExit={() => {
              setMode("build");
              setSheet(null);
            }}
          />
        ) : (
          <button type="button" className="ml-btn ml-btn--primary" onClick={startLearning}>
            Start learning mode
          </button>
        )}
        <p className="ml-muted" style={{ marginTop: 10 }}>Close this sheet to answer on the structure, then open it again from the bar at the bottom to check.</p>
      </Sheet>
      <Sheet open={sheet === "library"} title="Search molecules" onClose={() => setSheet(null)}>
        <LibraryPanel handlers={{ openEntry, openPubChem, openPdb, openFile, openSaved }} busy={Boolean(busy)} />
      </Sheet>
      <Sheet open={sheet === "saved"} title="My Molecules" onClose={() => setSheet(null)}>
        <SavedPanel onOpen={openSaved} currentId={doc.savedId} />
      </Sheet>
      <Sheet open={sheet === "export"} title="Export" onClose={() => setSheet(null)}>
        {exportSheet}
        {hasStructure && smiles && (
          <button type="button" className="ml-btn ml-btn--block" style={{ marginTop: 10 }} onClick={() => copyText(smiles, "SMILES")}>
            <Copy /> Copy SMILES
          </button>
        )}
      </Sheet>
      <Sheet open={sheet === "display"} title="Display" onClose={() => setSheet(null)}>
        {displaySettings}
      </Sheet>
      <Sheet open={sheet === "compare"} title="Compare molecules" size="wide" onClose={() => setSheet(null)}>
        <ComparePanel current={{ name: doc.name, graph }} />
      </Sheet>

      <ConfirmDialog open={confirm === "clear"} title="Clear current structure?" body="Every atom and bond is removed. You can still undo it." confirm="Clear" onConfirm={clearCanvas} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm === "new"} title="Start a new molecule?" body="The current structure is not saved. It stays in your undo history only until you draw something new." confirm="Start new" onConfirm={startNew} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm === "reset"} title="Reset to the original structure?" body={`Your changes to ${doc.name} are replaced by the structure as it was loaded. You can undo this.`} confirm="Reset" onConfirm={resetStructure} onCancel={() => setConfirm(null)} />
      <ConfirmDialog
        open={restore !== null}
        title="Restore previous session?"
        body={restore ? `“${restore.name}” — ${restore.graph.atoms.length} atoms, last edited ${new Date(restore.savedAt).toLocaleString()}.` : ""}
        confirm="Restore"
        onConfirm={() => {
          const s = restore!;
          openDocument(s.graph, { name: s.name, source: s.source, original: s.original, iupac: null }, null);
          setRestore(null);
          notify("Session restored.", "ok");
        }}
        onCancel={() => {
          setRestore(null);
          clearSession();
        }}
      />
      <span className="sr-only-ml" aria-live="polite">
        {hist.label}
      </span>
    </div>
  );
}
