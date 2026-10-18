"use client";

/**
 * The 3D viewer as pages use it: a lazily loaded three.js canvas (next/dynamic, no SSR)
 * framed by large, labelled controls that work by touch — views, zoom, reset, landmarks
 * and, for paired bones, right/left. Everything a student needs is also reachable
 * without the canvas (the landmark list beside it), so a phone that cannot run WebGL,
 * or a slow connection, still gets the lesson.
 */
import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import { Box, Eye, EyeOff, FlipHorizontal2, Loader2, Minus, Plus, RefreshCw, RotateCcw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { CREDIT_LINE } from "@/lib/osteology/attribution";
import type { Viewer3DProps, ViewDir, ViewerCommand } from "./Viewer3D";

const Viewer3D = dynamic(() => import("./Viewer3D"), { ssr: false });

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

type Props = Omit<Viewer3DProps, "defaultView" | "reducedMotion" | "onError" | "onProgress" | "onReady" | "command"> & {
  views: ViewDir[];
  /** Model size, shown before the student chooses to load on a slow connection. */
  sizeLabel: string;
  /** Short instruction under the canvas. */
  hint?: string;
  /** Paired bone: offer Right / Left. */
  sidePicker?: boolean;
  onMirrorChange?: (mirror: boolean) => void;
  onToggleLandmarks?: () => void;
  onReady?: (parts: string[]) => void;
  /** Shown instead of the canvas when 3D is unavailable. */
  fallback: ReactNode;
  className?: string;
  /** Height of the canvas area. */
  heightClass?: string;
};

export function ModelViewer({
  views, sizeLabel, hint, sidePicker, onMirrorChange, onToggleLandmarks, fallback, className, heightClass,
  ...viewer
}: Props) {
  const [command, setCommand] = useState<ViewerCommand | null>(null);
  type Cmd = ViewerCommand extends infer C ? (C extends ViewerCommand ? Omit<C, "n"> : never) : never;
  const send = (c: Cmd) => setCommand((prev) => ({ ...c, n: (prev?.n ?? 0) + 1 }) as ViewerCommand);
  const reduced = usePrefersReducedMotion();
  const [support, setSupport] = useState<"unknown" | "yes" | "no">("unknown");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  // Save-Data / 2G: ask before downloading a model.
  const [consent, setConsent] = useState(true);

  useEffect(() => {
    setSupport(webglAvailable() ? "yes" : "no");
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") setConsent(false);
  }, []);

  const defaultView = views[0]?.dir ?? [0, 0, 1];

  if (support === "no") {
    return (
      <div className={cn("rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900", className)}>
        <p className="flex items-center gap-2 font-semibold">
          <TriangleAlert className="h-4 w-4" aria-hidden /> 3D is not available in this browser
        </p>
        <p className="mt-1">Your browser cannot draw 3D graphics (WebGL). Everything below works without it.</p>
        <div className="mt-3">{fallback}</div>
      </div>
    );
  }

  return (
    <div className={cn("pw-osteo-viewer flex flex-col", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-[#16181d]/10 bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#eef2f6_70%)]",
          heightClass ?? "h-[58svh] min-h-[320px] max-h-[640px]",
        )}
        role="region"
        aria-label="Interactive 3D model. Drag with one finger to rotate, pinch to zoom; use the buttons below for set views."
      >
        {consent && support === "yes" ? (
          <Viewer3D
            key={attempt}
            command={command}
            {...viewer}
            defaultView={defaultView}
            reducedMotion={reduced}
            onProgress={setProgress}
            onReady={(parts) => {
              setStatus("ready");
              viewer.onReady?.(parts);
            }}
            onError={(msg) => {
              setError(msg);
              setStatus("error");
            }}
          />
        ) : null}

        {!consent && (
          <div className="absolute inset-0 grid place-items-center p-6 text-center">
            <div>
              <p className="text-sm text-[#4a4f57]">You are on a slow or data-saving connection.</p>
              <button
                type="button"
                onClick={() => setConsent(true)}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brandBlue px-4 text-sm font-semibold text-white"
              >
                <Box className="h-4 w-4" aria-hidden /> Load the 3D model ({sizeLabel})
              </button>
            </div>
          </div>
        )}

        {consent && status === "loading" && (
          <div className="absolute inset-0 grid place-items-center" aria-live="polite">
            <div className="flex flex-col items-center gap-3 text-sm text-[#4a4f57]">
              <Loader2 className="h-6 w-6 animate-spin text-brandBlue motion-reduce:animate-none" aria-hidden />
              <span>Loading 3D model{progress > 0 ? ` · ${Math.round(progress * 100)}%` : ""}</span>
              <span className="h-1 w-40 overflow-hidden rounded-full bg-[#16181d]/10">
                <span className="block h-full bg-brandBlue transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
              </span>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 grid place-items-center bg-white/90 p-6 text-center" role="alert">
            <div className="max-w-xs">
              <TriangleAlert className="mx-auto h-6 w-6 text-amber-600" aria-hidden />
              <p className="mt-2 text-sm text-[#16181d]">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setStatus("loading");
                  setProgress(0);
                  setAttempt((a) => a + 1);
                }}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#16181d]/15 bg-white px-4 text-sm font-semibold"
              >
                <RefreshCw className="h-4 w-4" aria-hidden /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Zoom + reset float on the canvas: thumb-reachable on a phone. */}
        {status === "ready" && (
          <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
            <IconButton label="Zoom in" onClick={() => send({ kind: "zoom", factor: 0.75 })}><Plus className="h-5 w-5" /></IconButton>
            <IconButton label="Zoom out" onClick={() => send({ kind: "zoom", factor: 1.33 })}><Minus className="h-5 w-5" /></IconButton>
            <IconButton label="Reset view" onClick={() => send({ kind: "reset" })}><RotateCcw className="h-5 w-5" /></IconButton>
          </div>
        )}
      </div>

      {/* View buttons: labelled, not icon-only. */}
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Set view">
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            disabled={status !== "ready"}
            onClick={() => send({ kind: "view", dir: v.dir })}
            className="min-h-11 rounded-xl border border-[#16181d]/12 bg-white px-3.5 text-sm font-medium text-[#16181d] shadow-sm transition hover:border-brandBlue/50 hover:text-brandBlue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandBlue disabled:opacity-40"
          >
            {v.label}
          </button>
        ))}
        {onToggleLandmarks && (
          <button
            type="button"
            onClick={onToggleLandmarks}
            aria-pressed={viewer.showLandmarks}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandBlue",
              viewer.showLandmarks ? "bg-brandBlue text-white" : "border border-brandBlue/40 bg-white text-brandBlue",
            )}
          >
            {viewer.showLandmarks ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            {viewer.showLandmarks ? "Hide landmarks" : "Show landmarks"}
          </button>
        )}
        {sidePicker && onMirrorChange && (
          <div className="inline-flex overflow-hidden rounded-xl border border-[#16181d]/12" role="group" aria-label="Which side">
            {(["Right", "Left"] as const).map((side) => {
              const active = (side === "Left") === !!viewer.mirror;
              return (
                <button
                  key={side}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onMirrorChange(side === "Left")}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-1.5 px-3.5 text-sm font-semibold",
                    active ? "bg-[#16181d] text-white" : "bg-white text-[#16181d]",
                  )}
                >
                  {side === "Left" && <FlipHorizontal2 className="h-4 w-4" aria-hidden />}
                  {side} bone
                </button>
              );
            })}
          </div>
        )}
      </div>

      {hint && <p className="mt-2 text-sm text-[#4a4f57]">{hint}</p>}
      <p className="mt-1 text-[11px] leading-snug text-[#6b7079]">
        {CREDIT_LINE}{" "}
        <a href="/osteology-lab/about#credits" className="underline underline-offset-2">Credits &amp; licence</a>
      </p>
    </div>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-xl border border-[#16181d]/12 bg-white/95 text-[#16181d] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandBlue"
    >
      {children}
    </button>
  );
}
