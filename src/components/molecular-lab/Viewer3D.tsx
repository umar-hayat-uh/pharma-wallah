"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Vec3 } from "./measure";

/*
 * The 3D view — 3Dmol.js, the renderer the Molecule Viewer already used, now
 * bundled from node_modules (lazy chunk, this route only) instead of loaded
 * from 3dmol.org at runtime.
 *
 * It draws a model it is given and reports picks; it never edits anything.
 * For an editable molecule the model is the generated/PubChem conformer and
 * `parents` maps each 3D atom (including hydrogens) back to its graph atom.
 */

export type Style3D = "ballStick" | "stick" | "sphere" | "line" | "cartoon";
export type ColorScheme3D = "element" | "chain" | "spectrum" | "ss";
export type Surface3D = "none" | "vdw" | "sas" | "ses";

export interface Model3D {
  key: string;
  text: string;
  format: string;
  /** 3D atom index → graph atom id (editable molecules only). */
  parents?: number[];
  /** True for the 3D atom that *is* its graph atom (false for its added hydrogens). */
  isSelf?: boolean[];
  positions?: Vec3[];
  elements?: string[];
  charges?: (number | undefined)[];
  /** Graph bonds with the 3D atom indices they join, for bond picking and highlights. */
  bonds?: { id: number; a: number; b: number }[];
}

export interface PickedAtom {
  index: number;
  elem: string;
  x: number;
  y: number;
  z: number;
  label: string;
}

export interface MeasureOverlay {
  picks: number[];
  lines: { a: Vec3; b: Vec3 }[];
  labels: { at: Vec3; text: string }[];
}

export interface Viewer3DHandle {
  reset: () => void;
  center: () => void;
  zoom: (factor: number) => void;
  rotate: (deg: number, axis: "x" | "y") => void;
  png: () => string | null;
}

interface Props {
  model: Model3D | null;
  fitKey: string;
  style: Style3D;
  colorScheme?: ColorScheme3D;
  surface?: Surface3D;
  labels: "none" | "element" | "residue";
  spin: boolean;
  /** Graph ids (editable) or 3D indices (view-only) to mark. */
  selectedAtoms: number[];
  selectedBonds: number[];
  highlightAtoms: number[];
  highlightBonds: number[];
  measure: MeasureOverlay | null;
  onPickAtom: (atom: PickedAtom) => void;
  onPickBond: (bondId: number) => void;
  onReady?: () => void;
  onError?: (message: string) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Lib = any;
type Viewer = any;

let libPromise: Promise<Lib> | null = null;
function load3Dmol(): Promise<Lib> {
  if (!libPromise) {
    libPromise = import("3dmol").then((m: any) => (m.createViewer ? m : m.default));
    libPromise.catch(() => {
      libPromise = null;
    });
  }
  return libPromise;
}

/**
 * 3Dmol's zoomTo fits the model to the view's height; in a tall, narrow pane
 * (split view, phones) the sides are cut off. Zoom out by the aspect ratio.
 */
function fitView(v: Viewer, host: HTMLElement) {
  v.zoomTo();
  const w = host.clientWidth;
  const h = host.clientHeight;
  // Softened: the full ratio over-corrects (measured in split view).
  if (w && h && w < h) v.zoom(Math.pow(w / h, 0.75));
}

function cssVar(el: HTMLElement, name: string, fallback: string) {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  return v || fallback;
}

const Viewer3D = forwardRef<Viewer3DHandle, Props>(function Viewer3D(props, ref) {
  const { model, fitKey, style, colorScheme = "element", surface = "none", labels, spin, selectedAtoms, selectedBonds, highlightAtoms, highlightBonds, measure } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer>(null);
  const libRef = useRef<Lib>(null);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState(0);
  const live = useRef(props);
  live.current = props;
  const lastFit = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      const v = viewerRef.current;
      if (!v || !hostRef.current) return;
      fitView(v, hostRef.current);
      v.render();
    },
    center: () => {
      const v = viewerRef.current;
      if (!v) return;
      v.center({}, 250);
    },
    zoom: (factor) => viewerRef.current?.zoom(factor, 150),
    rotate: (deg, axis) => viewerRef.current?.rotate(deg, axis, 200),
    png: () => viewerRef.current?.pngURI() ?? null,
  }), []);

  // ─── INIT ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;
    load3Dmol()
      .then((lib) => {
        if (cancelled) return;
        libRef.current = lib;
        const viewer = lib.createViewer(host, {
          backgroundColor: cssVar(host, "--ml-canvas", "#ffffff"),
          antialias: true,
          cartoonQuality: 8,
        });
        viewerRef.current = viewer;
        viewer.render();
        setReady(true);
        live.current.onReady?.();
      })
      .catch(() => live.current.onError?.("The 3D viewer could not be loaded. Check your connection and reload."));
    return () => {
      cancelled = true;
      try {
        viewerRef.current?.clear?.();
      } catch {
        // viewer already torn down
      }
      viewerRef.current = null;
    };
  }, []);

  // Follow the site theme (the `dark` class on <html>).
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme((t) => t + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    const v = viewerRef.current;
    const host = hostRef.current;
    if (!v || !host) return;
    v.setBackgroundColor(cssVar(host, "--ml-canvas", "#ffffff"));
    v.render();
  }, [ready, theme]);

  // Until the student touches the view, a resize (a pane appearing, split
  // view, the panel closing) refits the model — it was fitted to whatever
  // size the pane had when the model arrived.
  const untouched = useRef(true);
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !ready) return;
    const touch = () => {
      untouched.current = false;
    };
    const ro = new ResizeObserver(() => {
      const v = viewerRef.current;
      if (!v) return;
      v.resize();
      if (untouched.current && v.getModel()) fitView(v, host);
      v.render();
    });
    ro.observe(host);
    host.addEventListener("pointerdown", touch);
    host.addEventListener("wheel", touch, { passive: true });
    return () => {
      ro.disconnect();
      host.removeEventListener("pointerdown", touch);
      host.removeEventListener("wheel", touch);
    };
  }, [ready]);

  // Two-finger pinch zooms and two-finger drag pans. 3Dmol itself only
  // zooms with two fingers (three pan), so two-finger gestures are handled
  // here and kept away from its canvas; one finger still rotates.
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !ready) return;
    let last: { d: number; cx: number; cy: number } | null = null;
    const read = (e: TouchEvent) => {
      const [a, b] = [e.touches[0], e.touches[1]];
      return { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1, cx: (a.clientX + b.clientX) / 2, cy: (a.clientY + b.clientY) / 2 };
    };
    const onStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        last = read(e);
        e.stopPropagation();
      }
    };
    const onMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !last) return;
      e.preventDefault();
      e.stopPropagation();
      const now = read(e);
      const v = viewerRef.current;
      if (v) {
        v.zoom(now.d / last.d);
        v.translate(now.cx - last.cx, now.cy - last.cy);
        v.render();
      }
      last = now;
    };
    const onEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) last = null;
    };
    host.addEventListener("touchstart", onStart, { capture: true, passive: true });
    host.addEventListener("touchmove", onMove, { capture: true, passive: false });
    host.addEventListener("touchend", onEnd, { capture: true, passive: true });
    host.addEventListener("touchcancel", onEnd, { capture: true, passive: true });
    return () => {
      host.removeEventListener("touchstart", onStart, true);
      host.removeEventListener("touchmove", onMove, true);
      host.removeEventListener("touchend", onEnd, true);
      host.removeEventListener("touchcancel", onEnd, true);
    };
  }, [ready]);

  // ─── MODEL ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const v = viewerRef.current;
    if (!v || !ready) return;
    v.removeAllModels();
    v.removeAllSurfaces();
    if (!model) {
      v.render();
      return;
    }
    try {
      v.addModel(model.text, model.format, { keepH: true });
    } catch {
      live.current.onError?.("3D visualization isn't available for this structure.");
      return;
    }
    v.setClickable({}, true, (atom: any) => {
      live.current.onPickAtom({ index: atom.index, elem: atom.elem, x: atom.x, y: atom.y, z: atom.z, label: atom.resn ? `${atom.elem}${atom.serial} ${atom.resn} ${atom.resi}` : `${atom.elem}${atom.index + 1}` });
    });
    if (lastFit.current !== fitKey && hostRef.current) {
      v.resize();
      fitView(v, hostRef.current);
      lastFit.current = fitKey;
      untouched.current = true;
    }
    v.render();
    // Styles are applied by the next effect.
  }, [ready, model, fitKey]);

  useEffect(() => {
    const v = viewerRef.current;
    const lib = libRef.current;
    if (!v || !ready || !model) return;
    const colour: any = {};
    if (colorScheme === "chain") colour.colorscheme = "chainHetatm";
    if (colorScheme === "spectrum") colour.color = "spectrum";
    if (colorScheme === "ss") colour.colorscheme = "ssJmol";
    if (style === "cartoon") {
      v.setStyle({ hetflag: false }, { cartoon: { thickness: 1.2, ...colour } });
      v.setStyle({ hetflag: true }, { stick: { radius: 0.14, ...colour } });
    } else {
      const spec: any = {};
      if (style === "ballStick") {
        spec.stick = { radius: 0.13, ...colour };
        spec.sphere = { scale: 0.27, ...colour };
      } else if (style === "stick") spec.stick = { radius: 0.2, ...colour };
      else if (style === "sphere") spec.sphere = { scale: 1, ...colour };
      else spec.line = { linewidth: 2, ...colour };
      v.setStyle({}, spec);
    }
    v.removeAllSurfaces();
    if (surface !== "none" && lib) {
      const type = { vdw: lib.SurfaceType.VDW, sas: lib.SurfaceType.SAS, ses: lib.SurfaceType.SES }[surface];
      v.addSurface(type, { opacity: 0.7, color: "white" });
    }
    v.render();
  }, [ready, model, style, colorScheme, surface]);

  // ─── OVERLAYS ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const v = viewerRef.current;
    const host = hostRef.current;
    if (!v || !ready || !host) return;
    v.removeAllShapes();
    v.removeAllLabels();
    if (!model) {
      v.render();
      return;
    }
    const select = cssVar(host, "--ml-select", "#1c7bd9");
    const high = cssVar(host, "--ml-highlight", "#21b67a");
    const ink = cssVar(host, "--ml-ink", "#1a1f2b");
    const surfaceCol = cssVar(host, "--ml-surface", "#ffffff");
    const positions = model.positions;
    const parents = model.parents;
    const sphereR = style === "sphere" ? 1.9 : 0.62;

    const indicesFor = (ids: number[]) => {
      if (!parents) return ids; // view-only: ids are already 3D indices
      const set = new Set(ids);
      const out: number[] = [];
      // Mark the atom itself, not the hydrogens that belong to it.
      parents.forEach((p, i) => {
        if (set.has(p) && model.isSelf?.[i]) out.push(i);
      });
      return out;
    };

    const atomPos = (i: number): Vec3 | null => {
      if (positions?.[i]) return positions[i];
      const a = v.getModel()?.selectedAtoms({ index: i })?.[0];
      return a ? { x: a.x, y: a.y, z: a.z } : null;
    };

    const mark = (idx: number[], color: string, opacity: number) => {
      for (const i of idx) {
        const p = atomPos(i);
        if (p) v.addSphere({ center: p, radius: sphereR, color, opacity });
      }
    };
    const markBonds = (ids: number[], color: string) => {
      for (const id of ids) {
        const b = model.bonds?.find((x) => x.id === id);
        if (!b || !positions) continue;
        v.addCylinder({ start: positions[b.a], end: positions[b.b], radius: 0.3, color, opacity: 0.5, fromCap: 1, toCap: 1 });
      }
    };

    mark(indicesFor(highlightAtoms), high, 0.4);
    markBonds(highlightBonds, high);
    mark(indicesFor(selectedAtoms), select, 0.45);
    markBonds(selectedBonds, select);

    // Invisible, clickable sleeves over the bonds make bonds selectable in 3D.
    if (model.bonds && positions && style !== "sphere") {
      for (const b of model.bonds) {
        v.addCylinder({
          start: positions[b.a],
          end: positions[b.b],
          radius: 0.2,
          color: select,
          opacity: 0.01,
          clickable: true,
          callback: () => live.current.onPickBond(b.id),
        });
      }
    }

    if (measure) {
      mark(measure.picks, "#f59e0b", 0.5);
      for (const l of measure.lines) {
        v.addCylinder({ start: l.a, end: l.b, radius: 0.05, color: "#f59e0b", dashed: true, dashLength: 0.18, gapLength: 0.12, fromCap: 1, toCap: 1 });
      }
      for (const l of measure.labels) {
        v.addLabel(l.text, { position: l.at, backgroundColor: "#7c4a03", backgroundOpacity: 0.9, fontColor: "#ffffff", fontSize: 13, borderRadius: 4, inFront: true });
      }
    }

    if (labels === "residue") {
      v.addResLabels({}, { fontSize: 11, fontColor: ink, backgroundColor: surfaceCol, backgroundOpacity: 0.8, showBackground: true });
    } else if (labels === "element" && model.elements && positions) {
      model.elements.forEach((el, i) => {
        if (el === "H") return;
        v.addLabel(el, { position: positions[i], fontSize: 11, fontColor: ink, backgroundColor: surfaceCol, backgroundOpacity: 0.7, inFront: true, alignment: "center" });
      });
    }
    // Formal charges are always labelled — they are part of the structure.
    model.charges?.forEach((c, i) => {
      if (!c || !positions) return;
      const text = `${Math.abs(c) > 1 ? Math.abs(c) : ""}${c > 0 ? "+" : "−"}`;
      v.addLabel(text, { position: positions[i], fontSize: 14, fontColor: "#ffffff", backgroundColor: c > 0 ? "#1c5fd0" : "#c2362c", backgroundOpacity: 0.95, borderRadius: 8, inFront: true, alignment: "bottomLeft" });
    });
    v.render();
  }, [ready, model, style, labels, selectedAtoms, selectedBonds, highlightAtoms, highlightBonds, measure, theme]);

  useEffect(() => {
    const v = viewerRef.current;
    if (!v || !ready) return;
    if (spin) v.spin("y", 0.6);
    else v.spin(false);
  }, [spin, ready, model]);

  return <div ref={hostRef} className="ml-canvas3d" role="img" aria-label="Interactive 3D model. Drag to rotate, pinch or scroll to zoom." />;
});

export default Viewer3D;
