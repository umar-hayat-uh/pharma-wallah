"use client";

/**
 * The 3D viewport. Loaded only through next/dynamic (ssr: false) from LabExperience, and
 * it loads only the current lab's room module — so three.js never reaches a page's first
 * load, and one lab never downloads the other three rooms.
 *
 * Commands arrive as props with a counter (`n`), because next/dynamic does not forward
 * refs (MEMORY gotcha 220).
 */
import { useEffect, useRef } from "react";
import type { LabId } from "@/lib/virtual-labs/catalog";
import { LabRuntime, type RuntimeStats } from "./three/runtime";
import type { BuildContext, Quality, RoomBuild } from "./three/types";
import type { MaterialLib } from "./three/materials";

type Builder = (m: MaterialLib, ctx: BuildContext) => RoomBuild;

const ROOMS: Record<LabId, () => Promise<Builder>> = {
  "acid-base-titration": () => import("./three/rooms/chemistry").then((x) => x.buildChemistry),
  "simple-syrup": () => import("./three/rooms/pharmaceutics").then((x) => x.buildPharmaceutics),
  "dose-response": () => import("./three/rooms/pharmacology").then((x) => x.buildPharmacology),
  "powdered-clove": () => import("./three/rooms/pharmacognosy").then((x) => x.buildPharmacognosy),
};

export interface ViewportProps {
  labId: LabId;
  quality: Quality;
  reducedMotion: boolean;
  visual: unknown;
  highlight: string[];
  focusCmd: { n: number; id: string | null } | null;
  resetCmd: number;
  move: { x: number; z: number };
  onHover(id: string | null): void;
  onSelect(id: string): void;
  onFocusChange(id: string | null): void;
  onError(message: string): void;
  onReady(): void;
  onProgress(f: number): void;
}

declare global {
  interface Window {
    /** Exposed for the performance panel and automated checks: read-only stats. */
    __vlab?: { stats: () => RuntimeStats; measure: (ms?: number) => Promise<RuntimeStats>; focus: (id: string | null) => void; reset: () => void };
  }
}

export default function Viewport(p: ViewportProps) {
  const host = useRef<HTMLDivElement>(null);
  const rt = useRef<LabRuntime | null>(null);
  const cb = useRef(p);
  cb.current = p;

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    if (!el) return;
    ROOMS[p.labId]()
      .then((build) => {
        if (cancelled) return;
        try {
          const runtime = new LabRuntime(el, build, {
            quality: p.quality,
            reducedMotion: p.reducedMotion,
            onHover: (id) => cb.current.onHover(id),
            onSelect: (id) => cb.current.onSelect(id),
            onFocusChange: (id) => cb.current.onFocusChange(id),
            onError: (m) => cb.current.onError(m),
            onProgress: (f) => cb.current.onProgress(f),
            onReady: () => cb.current.onReady(),
          });
          rt.current = runtime;
          runtime.setVisual(cb.current.visual);
          runtime.setHighlight(cb.current.highlight);
          // camera-only hooks for the performance panel and automated screenshots
          window.__vlab = { stats: () => runtime.stats(), measure: (ms) => runtime.measure(ms), focus: (id) => (id ? runtime.focusOn(id) : runtime.exitFocus()), reset: () => runtime.resetView(true) };
        } catch (e) {
          cb.current.onError(e instanceof Error && /WebGL/i.test(e.message) ? "This browser could not start 3D graphics (WebGL)." : "The 3D laboratory could not start on this device.");
        }
      })
      .catch(() => cb.current.onError("The 3D laboratory failed to download. Check your connection and try again."));
    return () => {
      cancelled = true;
      rt.current?.dispose();
      rt.current = null;
      delete window.__vlab;
    };
    // the runtime is rebuilt only when the lab or the quality tier changes
  }, [p.labId, p.quality, p.reducedMotion]);

  useEffect(() => {
    rt.current?.setVisual(p.visual);
  }, [p.visual]);

  useEffect(() => {
    rt.current?.setHighlight(p.highlight);
  }, [p.highlight]);

  useEffect(() => {
    if (!p.focusCmd || !rt.current) return;
    if (p.focusCmd.id) rt.current.focusOn(p.focusCmd.id);
    else rt.current.exitFocus();
  }, [p.focusCmd]);

  useEffect(() => {
    if (p.resetCmd) rt.current?.resetView();
  }, [p.resetCmd]);

  useEffect(() => {
    rt.current?.setMoveInput(p.move.x, p.move.z);
  }, [p.move.x, p.move.z]);

  return <div ref={host} className="absolute inset-0" />;
}
