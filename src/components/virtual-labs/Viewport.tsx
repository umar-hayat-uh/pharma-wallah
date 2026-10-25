"use client";

/**
 * The 3D viewport. Loaded only through next/dynamic (ssr: false) from LabExperience, and
 * it loads only the current lab's room module — so three.js never reaches a page's first
 * load, and one lab never downloads the other three rooms.
 *
 * Commands arrive as props with a counter (`n`), because next/dynamic does not forward
 * refs (MEMORY gotcha 220).
 *
 * Two rooms run on Babylon.js: Pharmaceutical Chemistry (since 2026-10-22) and
 * Pharmaceutics (since 2026-10-25, one room for Simple Syrup and the three shortlisted
 * experiments) — docs/virtual-labs/BABYLON_MIGRATION.md. Pharmacology and Pharmacognosy
 * stay on three.js. Babylon is loaded only for a Babylon room. `?engine=three` opens the
 * original three.js room (comparison and rollback); `?engine=webgl` / `?engine=webgpu`
 * force Babylon's engine. Both runtimes expose the same methods, so nothing else can tell.
 */
import { useEffect, useRef } from "react";
import { roomOf, type ExperimentId } from "@/lib/virtual-labs/catalog";
import type { DisciplineId } from "@/lib/virtual-labs/engine/types";
import { LabRuntime, type RuntimeStats } from "./three/runtime";
import type { BuildContext, Insets, Quality, RoomBuild } from "./three/types";
import type { MaterialLib } from "./three/materials";

type Builder = (m: MaterialLib, ctx: BuildContext) => RoomBuild;
// The Babylon builder type lives in the lazy chunk; only its shape is named here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type BRoomBuilderLike = (ctx: any) => any;

/** What Viewport drives — LabRuntime (three.js) and BabylonLabRuntime both provide it. */
interface RuntimeLike {
  setVisual(v: unknown): void;
  setHighlight(ids: string[]): void;
  setInsets(i: Insets): void;
  setPaused(p: boolean): void;
  setMoveInput(x: number, z: number): void;
  focusOn(id: string): void;
  exitFocus(): void;
  resetView(instant?: boolean): void;
  where(id: string): { x: number; y: number; hit: boolean } | null;
  moving(): boolean;
  stats(): RuntimeStats;
  measure(ms?: number): Promise<RuntimeStats>;
  dispose(): void;
}

/**
 * Rooms are keyed by DISCIPLINE (one room per lab), never by experiment: the room builds
 * itself for `experiment` (MEMORY 248). A room listed in BABYLON_ROOMS is drawn by
 * Babylon.js; the three.js loader stays as the `?engine=three` rollback.
 */
const BABYLON_ROOMS: Partial<Record<DisciplineId, () => Promise<BRoomBuilderLike>>> = {
  "pharmaceutical-chemistry": () => import("./babylon/chemistry").then((x) => x.buildChemistry as BRoomBuilderLike),
  pharmaceutics: () => import("./babylon/pharmaceutics").then((x) => x.buildPharmaceutics as BRoomBuilderLike),
};

const ROOMS: Record<DisciplineId, () => Promise<Builder>> = {
  "pharmaceutical-chemistry": () => import("./three/rooms/chemistry").then((x) => x.buildChemistry),
  pharmaceutics: () => import("./three/rooms/pharmaceutics").then((x) => x.buildPharmaceutics),
  pharmacology: () => import("./three/rooms/pharmacology").then((x) => x.buildPharmacology),
  pharmacognosy: () => import("./three/rooms/pharmacognosy").then((x) => x.buildPharmacognosy),
};

export interface ViewportProps {
  labId: ExperimentId;
  quality: Quality;
  reducedMotion: boolean;
  visual: unknown;
  highlight: string[];
  focusCmd: { n: number; id: string | null } | null;
  resetCmd: number;
  move: { x: number; z: number };
  insets: Insets;
  /** Tab hidden / app backgrounded: stop rendering. */
  paused: boolean;
  onHover(id: string | null): void;
  onSelect(id: string): void;
  onFocusChange(id: string | null): void;
  onError(message: string): void;
  onReady(): void;
  onProgress(f: number): void;
  onSlow?(): void;
}

declare global {
  interface Window {
    /** Exposed for the performance panel and automated checks: read-only stats. */
    __vlab?: { stats: () => RuntimeStats & { engine?: string }; measure: (ms?: number) => Promise<RuntimeStats>; focus: (id: string | null) => void; reset: () => void; where: (id: string) => { x: number; y: number; hit: boolean } | null; moving: () => boolean };
  }
}

export default function Viewport(p: ViewportProps) {
  const host = useRef<HTMLDivElement>(null);
  const rt = useRef<RuntimeLike | null>(null);
  const cb = useRef(p);
  cb.current = p;

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    if (!el) return;
    const callbacks = {
      quality: p.quality,
      reducedMotion: p.reducedMotion,
      onHover: (id: string | null) => cb.current.onHover(id),
      onSelect: (id: string) => cb.current.onSelect(id),
      onFocusChange: (id: string | null) => cb.current.onFocusChange(id),
      onError: (m: string) => cb.current.onError(m),
      onProgress: (f: number) => cb.current.onProgress(f),
      onReady: () => cb.current.onReady(),
      onSlow: () => cb.current.onSlow?.(),
    };
    const attach = (runtime: RuntimeLike) => {
      rt.current = runtime;
      runtime.setVisual(cb.current.visual);
      runtime.setHighlight(cb.current.highlight);
      runtime.setInsets(cb.current.insets);
      runtime.setPaused(cb.current.paused);
      // camera-only hooks for the performance panel and automated screenshots
      window.__vlab = { stats: () => runtime.stats(), measure: (ms) => runtime.measure(ms), focus: (id) => (id ? runtime.focusOn(id) : runtime.exitFocus()), reset: () => runtime.resetView(true), where: (id) => runtime.where(id), moving: () => runtime.moving() };
    };
    const engineParam = new URLSearchParams(window.location.search).get("engine");
    const room = roomOf(p.labId);
    const babylonRoom = BABYLON_ROOMS[room];
    if (babylonRoom && engineParam !== "three") {
      let pending: { dispose(): void } | null = null;
      Promise.all([import("./babylon/runtime"), babylonRoom()])
        .then(async ([{ BabylonLabRuntime }, build]) => {
          if (cancelled) return;
          const runtime = await BabylonLabRuntime.create(el, build, { ...callbacks, experiment: p.labId, engine: engineParam === "webgpu" || engineParam === "webgl" ? engineParam : "auto" });
          pending = runtime;
          if (cancelled) return runtime.dispose();
          attach(runtime);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          const msg = e instanceof Error ? e.message : "";
          if (/chunk|fetch|import/i.test(msg)) cb.current.onError("The 3D laboratory failed to download. Check your connection and try again.");
          else cb.current.onError(/webgl|context/i.test(msg) ? "This browser could not start 3D graphics (WebGL)." : "The 3D laboratory could not start on this device.");
        });
      return () => {
        cancelled = true;
        (rt.current ?? pending)?.dispose();
        rt.current = null;
        delete window.__vlab;
      };
    }
    ROOMS[room]()
      .then((build) => {
        if (cancelled) return;
        try {
          attach(new LabRuntime(el, build, { ...callbacks, experiment: p.labId }));
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

  const { top, right, bottom, left } = p.insets;
  useEffect(() => {
    rt.current?.setInsets({ top, right, bottom, left });
  }, [top, right, bottom, left]);

  useEffect(() => {
    rt.current?.setPaused(p.paused);
  }, [p.paused]);

  return <div ref={host} className="absolute inset-0" />;
}
