"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Maximize, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { clamp, distance, fitView, imageToScreen, screenToImage, zoomAt, type ViewTransform } from "../tlc/geometry";
import type { Circle, Colony, Point } from "./types";

/**
 * The plate on screen: <canvas> for the photo, <svg> for the markers and the
 * plate outline. Same view model as the TLC stage (MEMORY gotcha 96): every
 * value reported back is in image pixels, converted once where the pointer
 * enters, so markers stay on their colonies at any zoom.
 *
 * Modes, so panning never creates a colony by accident:
 *   pan   one finger drags the plate; a tap selects a marker
 *   add   a tap adds a colony; one finger still pans if it moves
 *   plate drag the centre or the edge handle to fit the dish
 * Two fingers always pinch-zoom; the mouse wheel zooms at the cursor.
 */

export type StageMode = "pan" | "add" | "plate";

const MARKER = "#2563eb";
const MANUAL = "#16a34a";
const SELECTED = "#f59e0b";
const TAP_SLOP = 8;
/** Extra touch area around each marker, in screen pixels. */
const HIT_PAD = 10;

type Gesture =
  | { kind: "pan"; start: Point; view0: ViewTransform; moved: boolean; colony: string | null }
  | { kind: "plate"; handle: "centre" | "edge"; grab: Point }
  | { kind: "pinch"; d0: number; mid0: Point; view0: ViewTransform };

export function ColonyStage({
  canvas,
  colonies,
  plate,
  mode,
  selectedId,
  onSelect,
  onAdd,
  onPlateChange,
  className,
}: {
  canvas: HTMLCanvasElement;
  colonies: Colony[];
  plate: Circle | null;
  mode: StageMode;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (p: Point) => void;
  onPlateChange: (c: Circle) => void;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState<ViewTransform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const fitScale = useRef(1);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const W = canvas.width;
  const H = canvas.height;

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const width = box.clientWidth;
      const height = box.clientHeight;
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const fit = useCallback(() => {
    if (!size.width || !size.height) return;
    const next = fitView(W, H, size.width, size.height, 8);
    fitScale.current = next.scale;
    setView(next);
  }, [W, H, size.width, size.height]);

  useEffect(() => {
    fit();
  }, [canvas, fit]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !size.width) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const pw = Math.round(size.width * dpr);
    const ph = Math.round(size.height * dpr);
    if (el.width !== pw || el.height !== ph) {
      el.width = pw;
      el.height = ph;
    }
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const frame = requestAnimationFrame(() => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, pw, ph);
      ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, dpr * view.offsetX, dpr * view.offsetY);
      ctx.imageSmoothingEnabled = view.scale < 3;
      ctx.drawImage(canvas, 0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [canvas, view, size]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = box.getBoundingClientRect();
      const p = { x: event.clientX - rect.left - box.clientLeft, y: event.clientY - rect.top - box.clientTop };
      const factor = Math.exp(-event.deltaY * (event.deltaMode === 1 ? 0.05 : 0.0018));
      setView((v) => zoomAt(v, factor, p, fitScale.current));
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = (factor: number) =>
    setView((v) => zoomAt(v, factor, { x: size.width / 2, y: size.height / 2 }, fitScale.current));

  const local = (event: React.PointerEvent): Point => {
    const box = boxRef.current!;
    const rect = box.getBoundingClientRect();
    return { x: event.clientX - rect.left - box.clientLeft, y: event.clientY - rect.top - box.clientTop };
  };
  const toImage = (p: Point) => screenToImage(p, viewRef.current);

  /**
   * Enlarged tap targets overlap on a crowded plate, and the DOM would hand the
   * tap to whichever marker was drawn last. Pick the colony whose centre is
   * nearest the finger among those whose target contains it.
   */
  const nearestColony = (p: Point): string | null => {
    const img = toImage(p);
    const pad = HIT_PAD / viewRef.current.scale;
    let best: string | null = null;
    let bestD = Infinity;
    for (const c of colonies) {
      const b = c.box;
      if (img.x < b.x - pad || img.x > b.x + b.width + pad || img.y < b.y - pad || img.y > b.y + b.height + pad) continue;
      const d = Math.hypot(img.x - c.x, img.y - c.y);
      if (d < bestD) {
        bestD = d;
        best = c.id;
      }
    }
    return best;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const p = local(event);
    pointers.current.set(event.pointerId, p);
    boxRef.current?.setPointerCapture(event.pointerId);
    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      gesture.current = { kind: "pinch", d0: Math.max(1, distance(a, b)), mid0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, view0: viewRef.current };
      return;
    }
    if (pointers.current.size > 2) return;
    const target = (event.target as Element).closest<SVGElement>("[data-handle],[data-colony]");
    const handle = target?.dataset.handle as "centre" | "edge" | undefined;
    if (mode === "plate" && handle && plate) {
      const img = toImage(p);
      gesture.current = {
        kind: "plate",
        handle,
        grab: handle === "centre" ? { x: img.x - plate.x, y: img.y - plate.y } : { x: 0, y: 0 },
      };
      return;
    }
    gesture.current = { kind: "pan", start: p, view0: viewRef.current, moved: false, colony: target?.dataset.colony ? nearestColony(p) : null };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    const p = local(event);
    pointers.current.set(event.pointerId, p);
    const g = gesture.current;
    if (!g) return;
    if (g.kind === "pinch") {
      if (pointers.current.size < 2) return;
      const [a, b] = Array.from(pointers.current.values());
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const zoomed = zoomAt(g.view0, distance(a, b) / g.d0, g.mid0, fitScale.current);
      setView({ ...zoomed, offsetX: zoomed.offsetX + mid.x - g.mid0.x, offsetY: zoomed.offsetY + mid.y - g.mid0.y });
      return;
    }
    if (g.kind === "pan") {
      const dx = p.x - g.start.x;
      const dy = p.y - g.start.y;
      if (!g.moved && Math.hypot(dx, dy) < TAP_SLOP) return;
      g.moved = true;
      setView({ ...g.view0, offsetX: g.view0.offsetX + dx, offsetY: g.view0.offsetY + dy });
      return;
    }
    if (g.kind === "plate" && plate) {
      const img = toImage(p);
      if (g.handle === "centre") {
        onPlateChange({ ...plate, x: clamp(img.x - g.grab.x, 0, W), y: clamp(img.y - g.grab.y, 0, H) });
      } else {
        onPlateChange({ ...plate, r: clamp(distance(img, plate), 20, Math.max(W, H)) });
      }
    }
  };

  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    const g = gesture.current;
    if (g?.kind === "pan" && !g.moved && event.type === "pointerup") {
      const img = toImage(local(event));
      const inside = img.x >= 0 && img.y >= 0 && img.x <= W && img.y <= H;
      if (g.colony) onSelect(g.colony);
      else if (mode === "add" && inside) onAdd(img);
      else onSelect(null);
    }
    gesture.current = pointers.current.size === 0 ? null : g?.kind === "pinch" ? null : g;
  };

  const nudgePlate = (handle: "centre" | "edge") => (event: React.KeyboardEvent) => {
    if (!plate) return;
    const step = event.shiftKey ? 10 : 1;
    const keys: Record<string, Point> = { ArrowUp: { x: 0, y: -step }, ArrowDown: { x: 0, y: step }, ArrowLeft: { x: -step, y: 0 }, ArrowRight: { x: step, y: 0 } };
    const d = keys[event.key];
    if (!d) return;
    event.preventDefault();
    if (handle === "centre") onPlateChange({ ...plate, x: plate.x + d.x, y: plate.y + d.y });
    else onPlateChange({ ...plate, r: Math.max(20, plate.r + (d.x || -d.y)) });
  };

  const S = (p: Point) => imageToScreen(p, view);
  // Numbers are drawn when they have room, and always for a manual or selected colony.
  const smallest = colonies.length ? Math.min(...colonies.map((c) => Math.max(c.box.width, c.box.height))) * view.scale : 0;
  const showNumbers = colonies.length <= 120 || smallest >= 14;

  const cursor = mode === "add" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing";

  return (
    <div
      ref={boxRef}
      className={cn("relative touch-none select-none overflow-hidden rounded-2xl border border-border/80 bg-[#eef1f5]", cursor, className)}
      style={{
        backgroundImage:
          "linear-gradient(45deg,#e4e8ee 25%,transparent 25%),linear-gradient(-45deg,#e4e8ee 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e4e8ee 75%),linear-gradient(-45deg,transparent 75%,#e4e8ee 75%)",
        backgroundSize: "20px 20px",
        backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onContextMenu={(event) => event.preventDefault()}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" role="img" aria-label="Agar plate image with colony markers" />
      {size.width > 0 && (
        <svg className="absolute inset-0 h-full w-full overflow-visible" width={size.width} height={size.height}>
          {plate && (
            <PlateOutline
              plate={plate}
              S={S}
              scale={view.scale}
              editing={mode === "plate"}
              onKeyDown={nudgePlate}
            />
          )}
          {mode !== "plate" &&
            colonies.map((c, index) => {
              const a = S({ x: c.box.x, y: c.box.y });
              const w = Math.max(6, c.box.width * view.scale);
              const h = Math.max(6, c.box.height * view.scale);
              const cx = a.x + (c.box.width * view.scale - w) / 2;
              const cy = a.y + (c.box.height * view.scale - h) / 2;
              const selected = c.id === selectedId;
              const colour = selected ? SELECTED : c.source === "manual" ? MANUAL : MARKER;
              const label = String(index + 1);
              const pad = 2;
              return (
                <g key={c.id} data-colony={c.id} className="cursor-pointer">
                  {/* A generous invisible target around small colonies. */}
                  <rect x={cx - HIT_PAD} y={cy - HIT_PAD} width={w + HIT_PAD * 2} height={h + HIT_PAD * 2} fill="transparent" />
                  <rect x={cx - pad} y={cy - pad} width={w + pad * 2} height={h + pad * 2} rx={2} fill="none" stroke="#fff" strokeOpacity={0.75} strokeWidth={selected ? 4 : 2.5} />
                  <rect x={cx - pad} y={cy - pad} width={w + pad * 2} height={h + pad * 2} rx={2} fill="none" stroke={colour} strokeWidth={selected ? 2.5 : 1.5} />
                  {(showNumbers || selected || c.source === "manual") && (
                    <g transform={`translate(${cx - pad} ${cy - pad - 1})`}>
                      <rect x={0} y={-13} width={label.length * 6.4 + 6} height={13} rx={2} fill={colour} />
                      <text x={3} y={-3} fontSize={10} fontWeight={700} fill="#fff">
                        {label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
        </svg>
      )}

      <div
        className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-md"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <StageButton label="Zoom in" onClick={() => zoomBy(1.4)}>
          <Plus className="h-5 w-5" />
        </StageButton>
        <StageButton label="Zoom out" onClick={() => zoomBy(1 / 1.4)}>
          <Minus className="h-5 w-5" />
        </StageButton>
        <StageButton label="Reset zoom" onClick={fit}>
          <Maximize className="h-[18px] w-[18px]" />
        </StageButton>
      </div>
      <p className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 font-mono text-[10.5px] font-medium tabular-nums text-slate-600 shadow-sm">
        {Math.round((view.scale / (fitScale.current || 1)) * 100)}% · {W}×{H} px
      </p>
    </div>
  );
}

function StageButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center border-b border-border text-slate-700 last:border-b-0 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
    >
      {children}
    </button>
  );
}

function PlateOutline({
  plate,
  S,
  scale,
  editing,
  onKeyDown,
}: {
  plate: Circle;
  S: (p: Point) => Point;
  scale: number;
  editing: boolean;
  onKeyDown: (handle: "centre" | "edge") => (event: React.KeyboardEvent) => void;
}) {
  const c = S(plate);
  const r = plate.r * scale;
  const edge = { x: c.x + r * Math.cos(-Math.PI / 4), y: c.y + r * Math.sin(-Math.PI / 4) };
  return (
    <g>
      {editing && (
        <path
          d={`M-5000 -5000H10000V10000H-5000Z M${c.x - r} ${c.y}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`}
          fill="rgba(15,23,42,0.5)"
          fillRule="evenodd"
          pointerEvents="none"
        />
      )}
      <circle cx={c.x} cy={c.y} r={r} fill="none" stroke="#fff" strokeOpacity={0.8} strokeWidth={editing ? 3 : 2} pointerEvents="none" />
      <circle cx={c.x} cy={c.y} r={r} fill="none" stroke="#4ade80" strokeWidth={editing ? 2 : 1.5} strokeDasharray="8 6" pointerEvents="none" />
      {editing && (
        <>
          <g data-handle="centre" tabIndex={0} role="button" aria-label="Plate centre. Drag or use arrow keys to move." onKeyDown={onKeyDown("centre")} className="cursor-move outline-none">
            <circle cx={c.x} cy={c.y} r={26} fill="transparent" />
            <circle cx={c.x} cy={c.y} r={14} fill="#fff" stroke="#2563eb" strokeWidth={3} />
            <path d={`M${c.x - 6} ${c.y}H${c.x + 6}M${c.x} ${c.y - 6}V${c.y + 6}`} stroke="#2563eb" strokeWidth={2} />
          </g>
          <g data-handle="edge" tabIndex={0} role="button" aria-label="Plate edge. Drag or use arrow keys to resize." onKeyDown={onKeyDown("edge")} className="cursor-nwse-resize outline-none">
            <circle cx={edge.x} cy={edge.y} r={26} fill="transparent" />
            <circle cx={edge.x} cy={edge.y} r={13} fill="#fff" stroke="#16a34a" strokeWidth={3} />
            <path d={`M${edge.x - 5} ${edge.y + 5}L${edge.x + 5} ${edge.y - 5}`} stroke="#16a34a" strokeWidth={2} />
          </g>
        </>
      )}
    </g>
  );
}
