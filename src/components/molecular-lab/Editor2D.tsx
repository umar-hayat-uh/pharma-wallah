"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  addAtom,
  addBond,
  addBondedAtom,
  addGroup,
  addRing,
  atomById,
  bondById,
  bounds,
  breakBond,
  deleteItems,
  moveAtoms,
  setBondOrder,
  setBondStereo,
  setCharge,
  setElement,
  stepHydrogens,
  type BondOrder,
  type BondStereo,
  type GroupKind,
  type MolGraph,
  type MolReport,
  type RingKind,
} from "./graph";
import { atomsInRect, buildDrawing, hitAtom, hitBond } from "./drawing";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type Tool = "select" | "atom" | "bond" | "ring" | "group" | "charge" | "hydrogen" | "erase" | "break";

export interface ToolOptions {
  element: string;
  order: BondOrder;
  stereo: BondStereo;
  ring: RingKind;
  group: GroupKind;
  chargeSign: 1 | -1;
  hSign: 1 | -1;
  multi: boolean;
}

export interface Selection {
  atoms: number[];
  bonds: number[];
}

export const EMPTY_SELECTION: Selection = { atoms: [], bonds: [] };

export interface Editor2DHandle {
  fit: () => void;
  zoom: (factor: number) => void;
}

interface Props {
  graph: MolGraph;
  report: MolReport;
  tool: Tool;
  opts: ToolOptions;
  selection: Selection;
  highlight: Selection | null;
  showCarbons: boolean;
  /** Taps toggle atom/bond selection whatever the tool (Learning Mode questions). */
  pickMode?: boolean;
  readOnly?: boolean;
  /** Changing this re-fits the view (a new molecule was loaded). */
  fitKey: string;
  label: string;
  onSelect: (s: Selection) => void;
  onCommit: (g: MolGraph, label: string, from?: MolGraph) => void;
  onPreview: (g: MolGraph) => void;
  onNotice: (text: string, tone?: "info" | "warn") => void;
}

interface View {
  s: number;
  tx: number;
  ty: number;
}

type Gesture =
  | { kind: "none" }
  | { kind: "pending"; id: number; sx: number; sy: number; atom: number | null; bond: number | null; button: number; shift: boolean }
  | { kind: "pan"; id: number; lx: number; ly: number }
  | { kind: "move"; id: number; base: MolGraph; atoms: number[]; wx: number; wy: number; moved: boolean }
  | { kind: "bond"; id: number; from: number; x: number; y: number; target: number | null; free: boolean }
  | { kind: "marquee"; id: number; x1: number; y1: number; x2: number; y2: number; add: boolean }
  | { kind: "pinch"; d0: number; s0: number; cx0: number; cy0: number; tx0: number; ty0: number };

const DEFAULT_SCALE = 44;
const MIN_SCALE = 12;
const MAX_SCALE = 160;

// ─── COMPONENT ──────────────────────────────────────────────────────────────

const Editor2D = forwardRef<Editor2DHandle, Props>(function Editor2D(props, ref) {
  const { graph, report, tool, opts, selection, highlight, showCarbons, pickMode, readOnly, fitKey, label } = props;
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>({ s: DEFAULT_SCALE, tx: 200, ty: 200 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [gesture, setGesture] = useState<Gesture>({ kind: "none" });
  const [hover, setHover] = useState<{ atom: number | null; bond: number | null }>({ atom: null, bond: null });
  const pointers = useRef(new Map<number, { x: number; y: number; type: string }>());
  const lastSize = useRef({ w: 0, h: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const gestureRef = useRef(gesture);
  gestureRef.current = gesture;
  // Latest props for pointer handlers without re-binding them.
  const live = useRef(props);
  live.current = props;

  const drawing = useMemo(() => buildDrawing(graph, { showCarbons, report }), [graph, showCarbons, report]);

  // ─── VIEW ─────────────────────────────────────────────────────────────────

  const fit = useCallback(() => {
    const el = svgRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const b = bounds(live.current.graph);
    if (!b || !w || !h) {
      setView({ s: DEFAULT_SCALE, tx: w / 2, ty: h / 2 });
      return;
    }
    const bw = b.maxX - b.minX + 2.4;
    const bh = b.maxY - b.minY + 2.4;
    const s = Math.max(MIN_SCALE, Math.min(62, w / bw, h / bh));
    setView({ s, tx: w / 2 - ((b.minX + b.maxX) / 2) * s, ty: h / 2 - ((b.minY + b.maxY) / 2) * s });
  }, []);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    setView((v) => {
      const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, v.s * factor));
      const k = s / v.s;
      return { s, tx: cx - (cx - v.tx) * k, ty: cy - (cy - v.ty) * k };
    });
  }, []);

  useImperativeHandle(ref, () => ({
    fit,
    zoom: (factor: number) => {
      const el = svgRef.current;
      if (el) zoomAt(factor, el.clientWidth / 2, el.clientHeight / 2);
    },
  }), [fit, zoomAt]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const prev = lastSize.current;
      const next = { w: el.clientWidth, h: el.clientHeight };
      if (next.w === prev.w && next.h === prev.h) return;
      lastSize.current = next;
      // Keep the drawing centred when the pane changes size (split view, panel toggle).
      if (prev.w && prev.h) setView((v) => ({ ...v, tx: v.tx + (next.w - prev.w) / 2, ty: v.ty + (next.h - prev.h) / 2 }));
      setSize(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (size.w && size.h) fit();
    // Re-fit only for a new document or the first measurement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, size.w > 0 && size.h > 0]);

  // Wheel zoom needs a non-passive listener to stop the page scrolling.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const toWorld = useCallback((clientX: number, clientY: number) => {
    const el = svgRef.current!;
    const r = el.getBoundingClientRect();
    const v = viewRef.current;
    return { x: (clientX - r.left - v.tx) / v.s, y: (clientY - r.top - v.ty) / v.s, sx: clientX - r.left, sy: clientY - r.top };
  }, []);

  // Finger-sized, but never half a bond or more: at small zoom a 22 px radius
  // would make the middle of every bond count as an atom.
  const hitRadius = (type: string) => Math.min((type === "touch" ? 22 : 13) / viewRef.current.s, 0.4);

  // ─── ACTIONS ──────────────────────────────────────────────────────────────

  const toggleSel = useCallback((atom: number | null, bond: number | null, additive: boolean) => {
    const { selection: sel, onSelect } = live.current;
    if (atom === null && bond === null) {
      if (!additive) onSelect({ atoms: [], bonds: [] });
      return;
    }
    if (!additive) {
      onSelect(atom !== null ? { atoms: [atom], bonds: [] } : { atoms: [], bonds: [bond!] });
      return;
    }
    if (atom !== null) {
      const has = sel.atoms.includes(atom);
      onSelect({ ...sel, atoms: has ? sel.atoms.filter((a) => a !== atom) : [...sel.atoms, atom] });
    } else {
      const has = sel.bonds.includes(bond!);
      onSelect({ ...sel, bonds: has ? sel.bonds.filter((b) => b !== bond) : [...sel.bonds, bond!] });
    }
  }, []);

  const tap = useCallback((wx: number, wy: number, atom: number | null, bond: number | null, shift: boolean) => {
    const p = live.current;
    const g = p.graph;
    const o = p.opts;
    if (p.readOnly) return;
    if (p.pickMode || p.tool === "select") {
      toggleSel(atom, bond, shift || o.multi || !!p.pickMode);
      return;
    }
    const commit = (next: MolGraph | null | undefined, text: string) => {
      if (next && next !== g) p.onCommit(next, text);
    };
    switch (p.tool) {
      case "atom": {
        if (atom !== null) {
          const a = atomById(g, atom)!;
          if (a.el === o.element) commit(addBondedAtom(g, atom, o.element)?.graph, `Added ${o.element}`);
          else commit(setElement(g, [atom], o.element), `Changed ${a.el} to ${o.element}`);
        } else if (bond === null) {
          commit(addAtom(g, o.element, wx, wy).graph, `Added ${o.element}`);
        } else {
          p.onNotice("Tap empty space to place an atom, or tap an atom to attach one.");
        }
        return;
      }
      case "bond": {
        if (bond !== null) {
          const b = bondById(g, bond)!;
          if (o.stereo !== "none") {
            const flip = b.stereo === o.stereo;
            commit(setBondStereo(g, bond, o.stereo, flip ? b.b : b.a), flip ? "Flipped stereo bond" : `Set ${o.stereo} bond`);
          } else if ((o.order === 1 || b.order === o.order) && b.order !== "ar") {
            // The plain bond tool (or the tool matching the bond) cycles the
            // order — tap, tap, tap: single → double → triple → single.
            const nextOrder: BondOrder = b.order === 1 ? 2 : b.order === 2 ? 3 : 1;
            commit(setBondOrder(g, bond, nextOrder), "Changed bond order");
          } else {
            commit(setBondOrder(g, bond, o.order), "Changed bond order");
          }
          return;
        }
        if (atom !== null) {
          const r = addBondedAtom(g, atom, "C", o.stereo !== "none" ? 1 : o.order);
          if (!r) return;
          let next = r.graph;
          if (o.stereo !== "none") {
            const nb = next.bonds[next.bonds.length - 1];
            next = setBondStereo(next, nb.id, o.stereo, atom);
          }
          commit(next, "Added bond");
          return;
        }
        const a1 = addAtom(g, "C", wx - 0.43, wy + 0.25);
        const a2 = addAtom(a1.graph, "C", wx + 0.43, wy - 0.25);
        const b = addBond(a2.graph, a1.id, a2.id, o.stereo !== "none" ? 1 : o.order, o.stereo);
        commit(b?.graph, "Added bond");
        return;
      }
      case "ring": {
        const target = bond !== null ? { bond } : atom !== null ? { atom } : { x: wx, y: wy };
        commit(addRing(g, o.ring, target).graph, o.ring === "benzene" ? "Added benzene ring" : `Added ${o.ring}-membered ring`);
        return;
      }
      case "group": {
        commit(addGroup(g, atom, o.group, { x: wx, y: wy }).graph, "Added group");
        return;
      }
      case "charge": {
        if (atom === null) {
          p.onNotice("Tap an atom to change its charge.");
          return;
        }
        const a = atomById(g, atom)!;
        commit(setCharge(g, atom, a.charge + o.chargeSign), "Changed charge");
        return;
      }
      case "hydrogen": {
        if (atom === null) {
          p.onNotice("Tap an atom to add or remove a hydrogen.");
          return;
        }
        commit(stepHydrogens(g, atom, o.hSign), o.hSign > 0 ? "Added hydrogen" : "Removed hydrogen");
        return;
      }
      case "erase": {
        if (atom !== null) commit(deleteItems(g, [atom]), "Deleted atom");
        else if (bond !== null) commit(deleteItems(g, [], [bond]), "Deleted bond");
        return;
      }
      case "break": {
        if (bond === null) {
          p.onNotice("Tap a bond to break it.");
          return;
        }
        commit(breakBond(g, bond), "Broke bond");
        p.onNotice("Bond removed. The resulting structure may have incomplete valence.", "warn");
        return;
      }
    }
  }, [toggleSel]);

  // ─── POINTERS ─────────────────────────────────────────────────────────────

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const el = svgRef.current!;
    el.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });

    if (pointers.current.size === 2) {
      // Second finger: whatever the first was doing becomes a pinch.
      const g = gestureRef.current;
      if (g.kind === "move" && g.moved) live.current.onPreview(g.base);
      const [p1, p2] = Array.from(pointers.current.values());
      const r = el.getBoundingClientRect();
      const v = viewRef.current;
      setGesture({
        kind: "pinch",
        d0: Math.hypot(p1.x - p2.x, p1.y - p2.y) || 1,
        s0: v.s,
        cx0: (p1.x + p2.x) / 2 - r.left,
        cy0: (p1.y + p2.y) / 2 - r.top,
        tx0: v.tx,
        ty0: v.ty,
      });
      return;
    }
    if (pointers.current.size > 2) return;

    const w = toWorld(e.clientX, e.clientY);
    const rad = hitRadius(e.pointerType);
    const atom = hitAtom(live.current.graph, w.x, w.y, rad);
    const bond = atom === null ? hitBond(live.current.graph, w.x, w.y, Math.min(rad, 0.3)) : null;
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setGesture({ kind: "pan", id: e.pointerId, lx: e.clientX, ly: e.clientY });
      return;
    }
    setGesture({ kind: "pending", id: e.pointerId, sx: e.clientX, sy: e.clientY, atom, bond, button: e.button, shift: e.shiftKey || e.metaKey || e.ctrlKey });
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY, type: e.pointerType });
    const g = gestureRef.current;
    const p = live.current;
    const w = toWorld(e.clientX, e.clientY);

    if (g.kind === "none" && e.pointerType === "mouse") {
      const rad = hitRadius("mouse");
      const atom = hitAtom(p.graph, w.x, w.y, rad);
      const bond = atom === null ? hitBond(p.graph, w.x, w.y, Math.min(rad, 0.3)) : null;
      if (atom !== hover.atom || bond !== hover.bond) setHover({ atom, bond });
      return;
    }

    if (g.kind === "pinch") {
      const pts = Array.from(pointers.current.values());
      if (pts.length < 2) return;
      const [p1, p2] = pts;
      const r = svgRef.current!.getBoundingClientRect();
      const d = Math.hypot(p1.x - p2.x, p1.y - p2.y) || 1;
      const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, g.s0 * (d / g.d0)));
      const cx = (p1.x + p2.x) / 2 - r.left;
      const cy = (p1.y + p2.y) / 2 - r.top;
      const k = s / g.s0;
      setView({ s, tx: cx - (g.cx0 - g.tx0) * k, ty: cy - (g.cy0 - g.ty0) * k });
      return;
    }
    if (g.kind === "pending" && e.pointerId === g.id) {
      const slop = e.pointerType === "touch" ? 10 : 5;
      if (Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < slop) return;
      const start = toWorld(g.sx, g.sy);
      const drawTool = p.tool === "atom" || p.tool === "bond";
      if (p.readOnly || g.button !== 0) {
        setGesture({ kind: "pan", id: g.id, lx: e.clientX, ly: e.clientY });
      } else if (!p.pickMode && drawTool && g.atom !== null) {
        setGesture({ kind: "bond", id: g.id, from: g.atom, x: w.x, y: w.y, target: null, free: e.shiftKey });
      } else if (!p.pickMode && p.tool === "select" && g.atom !== null) {
        const inSel = p.selection.atoms.includes(g.atom);
        setGesture({ kind: "move", id: g.id, base: p.graph, atoms: inSel ? p.selection.atoms : [g.atom], wx: start.x, wy: start.y, moved: false });
      } else if (p.tool === "select" && g.atom === null && g.bond === null && (e.pointerType === "mouse" || p.opts.multi)) {
        setGesture({ kind: "marquee", id: g.id, x1: start.x, y1: start.y, x2: w.x, y2: w.y, add: g.shift || p.opts.multi });
      } else {
        setGesture({ kind: "pan", id: g.id, lx: g.sx, ly: g.sy });
      }
      return;
    }
    if (g.kind === "pan" && e.pointerId === g.id) {
      const dx = e.clientX - g.lx;
      const dy = e.clientY - g.ly;
      setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
      setGesture({ ...g, lx: e.clientX, ly: e.clientY });
      return;
    }
    if (g.kind === "move" && e.pointerId === g.id) {
      p.onPreview(moveAtoms(g.base, g.atoms, w.x - g.wx, w.y - g.wy));
      if (!g.moved) setGesture({ ...g, moved: true });
      return;
    }
    if (g.kind === "bond" && e.pointerId === g.id) {
      const target = hitAtom(p.graph, w.x, w.y, hitRadius(e.pointerType));
      setGesture({ ...g, x: w.x, y: w.y, target: target === g.from ? null : target, free: e.shiftKey });
      return;
    }
    if (g.kind === "marquee" && e.pointerId === g.id) {
      setGesture({ ...g, x2: w.x, y2: w.y });
    }
  };

  const bondEnd = (g: Extract<Gesture, { kind: "bond" }>) => {
    const from = atomById(live.current.graph, g.from);
    if (!from) return { x: g.x, y: g.y };
    if (g.target !== null) {
      const t = atomById(live.current.graph, g.target)!;
      return { x: t.x, y: t.y };
    }
    if (g.free) return { x: g.x, y: g.y };
    // One standard bond length, at the nearest 30°.
    const ang = Math.round(Math.atan2(g.y - from.y, g.x - from.x) / (Math.PI / 6)) * (Math.PI / 6);
    return { x: from.x + Math.cos(ang), y: from.y + Math.sin(ang) };
  };

  const endPointer = (e: React.PointerEvent<SVGSVGElement>, cancelled: boolean) => {
    pointers.current.delete(e.pointerId);
    const g = gestureRef.current;
    const p = live.current;
    if (g.kind === "pinch") {
      if (pointers.current.size === 0) setGesture({ kind: "none" });
      return;
    }
    if (!("id" in g) || g.id !== e.pointerId) return;
    setGesture({ kind: "none" });
    if (cancelled) {
      if (g.kind === "move" && g.moved) p.onPreview(g.base);
      return;
    }
    if (g.kind === "pending") {
      const w = toWorld(g.sx, g.sy);
      tap(w.x, w.y, g.atom, g.bond, g.shift);
      return;
    }
    if (g.kind === "move" && g.moved) {
      const w = toWorld(e.clientX, e.clientY);
      p.onCommit(moveAtoms(g.base, g.atoms, w.x - g.wx, w.y - g.wy), g.atoms.length > 1 ? "Moved atoms" : "Moved atom", g.base);
      return;
    }
    if (g.kind === "bond") {
      const end = bondEnd(g);
      const graph = p.graph;
      const o = p.opts;
      const el = p.tool === "atom" ? o.element : "C";
      const order: BondOrder = p.tool === "bond" && o.stereo === "none" ? o.order : 1;
      if (g.target !== null) {
        let next = addBond(graph, g.from, g.target, order)?.graph;
        if (next && p.tool === "bond" && o.stereo !== "none") {
          const b = next.bonds.find((x) => (x.a === g.from && x.b === g.target) || (x.b === g.from && x.a === g.target))!;
          next = setBondStereo(next, b.id, o.stereo, g.from);
        }
        if (next) p.onCommit(next, "Connected atoms");
      } else {
        const r = addBondedAtom(graph, g.from, el, order, end);
        if (!r) return;
        let next = r.graph;
        if (p.tool === "bond" && o.stereo !== "none") next = setBondStereo(next, next.bonds[next.bonds.length - 1].id, o.stereo, g.from);
        p.onCommit(next, "Added bond");
      }
      return;
    }
    if (g.kind === "marquee") {
      const ids = atomsInRect(p.graph, g.x1, g.y1, g.x2, g.y2);
      const set = new Set(ids);
      const bonds = p.graph.bonds.filter((b) => set.has(b.a) && set.has(b.b)).map((b) => b.id);
      if (g.add) {
        p.onSelect({ atoms: Array.from(new Set([...p.selection.atoms, ...ids])), bonds: Array.from(new Set([...p.selection.bonds, ...bonds])) });
      } else p.onSelect({ atoms: ids, bonds });
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  const selAtoms = new Set(selection.atoms);
  const selBonds = new Set(selection.bonds);
  const hlAtoms = new Set(highlight?.atoms ?? []);
  const hlBonds = new Set(highlight?.bonds ?? []);
  const pos = new Map(graph.atoms.map((a) => [a.id, a]));
  const stroke = 0.045;
  const fs = 0.42;

  const bondPath = (id: number) => {
    const b = graph.bonds.find((x) => x.id === id);
    if (!b) return null;
    const A = pos.get(b.a)!;
    const B = pos.get(b.b)!;
    return { x1: A.x, y1: A.y, x2: B.x, y2: B.y };
  };

  const g = gesture;
  const preview = g.kind === "bond" ? { from: pos.get(g.from), to: bondEnd(g) } : null;

  return (
    <svg
      ref={svgRef}
      className="ml-canvas2d"
      data-tool={pickMode ? "select" : tool}
      data-panning={g.kind === "pan" || g.kind === "pinch"}
      role="img"
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endPointer(e, false)}
      onPointerCancel={(e) => endPointer(e, true)}
      onPointerLeave={() => setHover({ atom: null, bond: null })}
      onContextMenu={(e) => e.preventDefault()}
    >
      <g transform={`translate(${view.tx} ${view.ty}) scale(${view.s})`}>
        {/* Underlays: highlight, selection, hover */}
        {Array.from(hlBonds).map((id) => {
          const p = bondPath(id);
          return p && <line key={`hb${id}`} {...p} className="ml-bond-hl" strokeWidth={0.34} strokeLinecap="round" />;
        })}
        {Array.from(selBonds).map((id) => {
          const p = bondPath(id);
          return p && <line key={`sb${id}`} {...p} className="ml-bond-sel" strokeWidth={0.34} strokeLinecap="round" />;
        })}
        {hover.bond !== null && !selBonds.has(hover.bond) && (() => {
          const p = bondPath(hover.bond);
          return p && <line {...p} stroke="var(--ml-blue-soft)" strokeWidth={0.3} strokeLinecap="round" />;
        })()}
        {graph.atoms.map((a) =>
          hlAtoms.has(a.id) ? <circle key={`ha${a.id}`} cx={a.x} cy={a.y} r={0.36} className="ml-hl" strokeWidth={0.03} /> : null,
        )}
        {graph.atoms.map((a) =>
          selAtoms.has(a.id) ? <circle key={`sa${a.id}`} cx={a.x} cy={a.y} r={0.34} className="ml-atom-sel" strokeWidth={0.035} /> : null,
        )}
        {hover.atom !== null && !selAtoms.has(hover.atom) && pos.get(hover.atom) && (
          <circle cx={pos.get(hover.atom)!.x} cy={pos.get(hover.atom)!.y} r={0.32} className="ml-atom-hover" />
        )}

        {/* Bonds */}
        <g stroke="var(--ml-ink)" fill="var(--ml-ink)" strokeWidth={stroke} strokeLinecap="round">
          {drawing.shapes.map((s, i) =>
            s.kind === "line" ? (
              <line key={i} data-bond={s.bond} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} strokeDasharray={s.dashed ? "0.09 0.08" : undefined} />
            ) : (
              <polygon key={i} data-bond={s.bond} points={s.points.map((pt) => pt.join(",")).join(" ")} stroke="none" />
            ),
          )}
        </g>

        {/* Atoms */}
        {drawing.labels.map((l) => {
          const half = 0.15 * l.el.length;
          return (
            <g key={l.atom} data-atom={l.atom} data-el={l.el}>
              {/* A zero-size anchor at the atom, so every atom (skeletal carbons too) has a DOM position. */}
              <circle cx={l.x} cy={l.y} r={0} fill="none" />
              {l.flag && <circle cx={l.x} cy={l.y} r={0.4} className={l.flag === "under" ? "ml-flag-under" : "ml-flag-over"} strokeWidth={0.035} />}
              {l.visible ? (
                <>
                  <circle cx={l.x} cy={l.y} r={0.24} fill="var(--ml-canvas)" />
                  <text x={l.x} y={l.y + fs * 0.36} fontSize={fs} fontWeight={600} textAnchor="middle" fill={l.color}>
                    {l.el}
                  </text>
                  {l.hText && (
                    <text x={l.hBefore ? l.x - half - 0.02 : l.x + half + 0.02} y={l.y + fs * 0.36} fontSize={fs} fontWeight={600} textAnchor={l.hBefore ? "end" : "start"} fill={l.color}>
                      {l.hText}
                    </text>
                  )}
                  {l.charge && (
                    <text x={l.x + half + (l.hText && !l.hBefore ? 0.26 * l.hText.length : 0) + 0.04} y={l.y - 0.16} fontSize={fs * 0.66} fontWeight={700} fill={l.color}>
                      {l.charge}
                    </text>
                  )}
                </>
              ) : null}
            </g>
          );
        })}

        {/* Drag previews */}
        {preview?.from && (
          <line x1={preview.from.x} y1={preview.from.y} x2={preview.to.x} y2={preview.to.y} stroke="var(--ml-blue)" strokeWidth={0.06} strokeDasharray="0.12 0.08" strokeLinecap="round" />
        )}
        {g.kind === "bond" && g.target === null && (
          <circle cx={bondEnd(g).x} cy={bondEnd(g).y} r={0.14} fill="var(--ml-blue)" opacity={0.6} />
        )}
        {g.kind === "marquee" && (
          <rect
            x={Math.min(g.x1, g.x2)}
            y={Math.min(g.y1, g.y2)}
            width={Math.abs(g.x2 - g.x1)}
            height={Math.abs(g.y2 - g.y1)}
            fill="var(--ml-blue-soft)"
            stroke="var(--ml-blue)"
            strokeWidth={0.03}
            strokeDasharray="0.1 0.08"
          />
        )}
      </g>
    </svg>
  );
});

export default Editor2D;
