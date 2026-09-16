"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Maximize, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  clamp,
  clampPoint,
  distance,
  fitView,
  imageToScreen,
  normaliseRect,
  screenToImage,
  zoomAt,
  type ViewTransform,
} from "./geometry";
import { formatPx, formatRf } from "./rf";
import type { PlateAnalysis, Point, Quad, Rect, TLCSpot } from "./types";

/**
 * The plate on screen: a <canvas> for the image and an <svg> for everything
 * drawn on top of it (lines, spots, crop box, corner handles).
 *
 * The stage owns only the view (zoom and pan). Every value it reports back is
 * already in working-image pixels — converted with `screenToImage` at the one
 * place a pointer position enters — so zooming never changes an Rf.
 *
 * Gestures, chosen for a phone held in one hand at the bench:
 *   - two fingers: pinch to zoom and move the plate, in every tool
 *   - one finger on a line, spot or handle: drag it
 *   - one finger elsewhere: depends on the tool (place a line, add a spot,
 *     draw a crop box) and otherwise pans
 *   - mouse wheel: zoom at the cursor
 * Handles are keyboard-focusable; arrow keys nudge by 1 px (Shift: 10 px).
 */

export type StageTool = "pan" | "rotate" | "crop" | "perspective" | "baseline" | "front" | "spot";

const BASELINE = "#1c7ad9";
const FRONT = "#16a34a";
const SPOT = "#b45309";
const SPOT_PENDING = "#64748b";
const TAP_SLOP = 8;

type Gesture =
  | { kind: "pan"; start: Point; view0: ViewTransform; moved: boolean; tapAction: "spot" | "deselect" | null }
  | { kind: "drag"; target: string; grab: Point }
  | { kind: "cropdraw"; anchor: Point }
  | { kind: "pinch"; d0: number; mid0: Point; view0: ViewTransform };

export function TLCStage({
  canvas,
  tool,
  rotationPreview = 0,
  baselineY,
  solventFrontY,
  spots,
  selectedId,
  cropRect,
  quad,
  analysis,
  decimals,
  measuring,
  onBaseline,
  onFront,
  onSpotMove,
  onSpotAdd,
  onSelect,
  onCropChange,
  onQuadChange,
  className,
}: {
  canvas: HTMLCanvasElement;
  tool: StageTool;
  /** Degrees; drawn live while the fine-rotation slider moves, applied by the parent. */
  rotationPreview?: number;
  baselineY: number | null;
  solventFrontY: number | null;
  spots: TLCSpot[];
  selectedId: string | null;
  cropRect: Rect | null;
  quad: Quad | null;
  analysis: PlateAnalysis;
  decimals: 2 | 3;
  /** False while preparing the image: lines and spots are hidden and inert. */
  measuring: boolean;
  onBaseline: (y: number) => void;
  onFront: (y: number) => void;
  onSpotMove: (id: string, point: Point) => void;
  onSpotAdd: (point: Point) => void;
  onSelect: (id: string | null) => void;
  onCropChange: (rect: Rect) => void;
  onQuadChange: (quad: Quad) => void;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [view, setView] = useState<ViewTransform>({ scale: 1, offsetX: 0, offsetY: 0 });
  const fitScale = useRef(1);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  // The latest props for the native wheel listener and the gesture handlers.
  const viewRef = useRef(view);
  viewRef.current = view;

  const W = canvas.width;
  const H = canvas.height;

  // ── Size ────────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    // The padding box: the canvas and overlay sit inside the stage's border.
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

  // A new image (or a new stage size) starts from "fit to screen".
  const fit = useCallback(() => {
    if (!size.width || !size.height) return;
    const next = fitView(W, H, size.width, size.height);
    fitScale.current = next.scale;
    setView(next);
  }, [W, H, size.width, size.height]);

  useEffect(() => {
    fit();
  }, [canvas, fit]);

  // ── Draw the image ──────────────────────────────────────────────────────
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
      // Past 3× the pixels are shown as pixels, so a spot's edge is not smeared.
      ctx.imageSmoothingEnabled = view.scale < 3;
      if (rotationPreview) {
        ctx.translate(W / 2, H / 2);
        ctx.rotate((rotationPreview * Math.PI) / 180);
        ctx.drawImage(canvas, -W / 2, -H / 2);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        ctx.drawImage(canvas, 0, 0);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [canvas, view, size, rotationPreview, W, H]);

  // ── Wheel zoom (native listener: React's is passive and cannot preventDefault) ──
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = box.getBoundingClientRect();
      const x = event.clientX - rect.left - box.clientLeft;
      const y = event.clientY - rect.top - box.clientTop;
      const factor = Math.exp(-event.deltaY * (event.deltaMode === 1 ? 0.05 : 0.0018));
      setView((v) => zoomAt(v, factor, { x, y }, fitScale.current));
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, []);

  const zoomBy = (factor: number) =>
    setView((v) => zoomAt(v, factor, { x: size.width / 2, y: size.height / 2 }, fitScale.current));

  // ── Pointer handling ────────────────────────────────────────────────────
  // Relative to the padding box, the same origin the canvas and overlay use.
  const local = (event: React.PointerEvent): Point => {
    const box = boxRef.current!;
    const rect = box.getBoundingClientRect();
    return { x: event.clientX - rect.left - box.clientLeft, y: event.clientY - rect.top - box.clientTop };
  };
  const toImage = (p: Point) => screenToImage(p, viewRef.current);

  const positionOf = (target: string): Point | null => {
    if (target === "baseline") return baselineY === null ? null : { x: 0, y: baselineY };
    if (target === "front") return solventFrontY === null ? null : { x: 0, y: solventFrontY };
    if (target.startsWith("spot:")) {
      const s = spots.find((sp) => sp.id === target.slice(5));
      return s ? { x: s.x, y: s.y } : null;
    }
    if (target.startsWith("quad:") && quad) return quad[Number(target.slice(5))];
    if (target.startsWith("crop:") && cropRect) {
      const c = target.slice(5);
      if (c === "move") return { x: cropRect.x, y: cropRect.y };
      return {
        x: c.includes("r") ? cropRect.x + cropRect.width : cropRect.x,
        y: c.includes("b") ? cropRect.y + cropRect.height : cropRect.y,
      };
    }
    return null;
  };

  const applyDrag = (target: string, p: Point) => {
    const q = clampPoint(p, W, H);
    if (target === "baseline") onBaseline(q.y);
    else if (target === "front") onFront(q.y);
    else if (target.startsWith("spot:")) onSpotMove(target.slice(5), q);
    else if (target.startsWith("quad:") && quad) {
      const next = [...quad] as Quad;
      next[Number(target.slice(5))] = q;
      onQuadChange(next);
    } else if (target.startsWith("crop:") && cropRect) {
      const c = target.slice(5);
      if (c === "move") {
        onCropChange({
          ...cropRect,
          x: clamp(p.x, 0, W - cropRect.width),
          y: clamp(p.y, 0, H - cropRect.height),
        });
      } else {
        // Drag one corner; the opposite corner stays put.
        const fixed = {
          x: c.includes("r") ? cropRect.x : cropRect.x + cropRect.width,
          y: c.includes("b") ? cropRect.y : cropRect.y + cropRect.height,
        };
        onCropChange(normaliseRect(fixed, q, W, H));
      }
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const p = local(event);
    pointers.current.set(event.pointerId, p);
    boxRef.current?.setPointerCapture(event.pointerId);

    if (pointers.current.size === 2) {
      const [a, b] = Array.from(pointers.current.values());
      gesture.current = {
        kind: "pinch",
        d0: Math.max(1, distance(a, b)),
        mid0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        view0: viewRef.current,
      };
      return;
    }
    if (pointers.current.size > 2) return;

    const handle = (event.target as Element).closest<SVGElement>("[data-drag]");
    const target = handle?.dataset.drag;
    if (target) {
      const at = positionOf(target);
      const img = toImage(p);
      gesture.current = { kind: "drag", target, grab: at ? { x: img.x - at.x, y: img.y - at.y } : { x: 0, y: 0 } };
      if (target.startsWith("spot:")) onSelect(target.slice(5));
      return;
    }

    const img = toImage(p);
    const inside = img.x >= 0 && img.y >= 0 && img.x <= W && img.y <= H;
    if (measuring && inside && (tool === "baseline" || tool === "front")) {
      // Place the line where the finger lands, then keep dragging it.
      (tool === "baseline" ? onBaseline : onFront)(clamp(img.y, 0, H));
      gesture.current = { kind: "drag", target: tool, grab: { x: 0, y: 0 } };
      return;
    }
    if (tool === "crop" && inside) {
      gesture.current = { kind: "cropdraw", anchor: clampPoint(img, W, H) };
      return;
    }
    gesture.current = {
      kind: "pan",
      start: p,
      view0: viewRef.current,
      moved: false,
      tapAction: measuring && tool === "spot" && inside ? "spot" : "deselect",
    };
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
    const img = toImage(p);
    if (g.kind === "drag") {
      applyDrag(g.target, { x: img.x - g.grab.x, y: img.y - g.grab.y });
      return;
    }
    if (g.kind === "cropdraw") {
      onCropChange(normaliseRect(g.anchor, img, W, H));
    }
  };

  const endPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    const g = gesture.current;
    if (g?.kind === "pan" && !g.moved && event.type === "pointerup") {
      if (g.tapAction === "spot") onSpotAdd(clampPoint(toImage(local(event)), W, H));
      else onSelect(null);
    }
    // Lifting one finger of a pinch must not turn the other into a drag.
    gesture.current = pointers.current.size === 0 ? null : g?.kind === "pinch" ? null : g;
  };

  const nudge = (target: string) => (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 1;
    const delta: Record<string, Point> = {
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
    };
    const d = delta[event.key];
    if (!d) return;
    const at = positionOf(target);
    if (!at) return;
    event.preventDefault();
    applyDrag(target, { x: at.x + d.x, y: at.y + d.y });
  };

  // ── Overlay geometry (screen pixels) ───────────────────────────────────
  const S = (p: Point) => imageToScreen(p, view);
  const left = S({ x: 0, y: 0 }).x;
  const right = S({ x: W, y: 0 }).x;
  const lineLeft = Math.max(left, 0);
  const lineRight = Math.min(right, size.width);
  const by = baselineY !== null ? S({ x: 0, y: baselineY }).y : null;
  const fy = solventFrontY !== null ? S({ x: 0, y: solventFrontY }).y : null;
  // The solvent run is drawn just left of the plate, where it cannot cover a lane.
  const runX = clamp(left - 16, 14, size.width - 14);
  // Distance and Rf pills collide when lanes are close, so they are shown for
  // the selected spot only — or for every spot when there are just one or two.
  const accepted = spots.filter((s) => s.accepted).length;
  const showPills = (id: string) => accepted <= 2 || id === selectedId;

  const cursor =
    tool === "baseline" || tool === "front"
      ? "cursor-row-resize"
      : tool === "spot" || tool === "crop"
        ? "cursor-crosshair"
        : "cursor-grab active:cursor-grabbing";

  return (
    <div
      ref={boxRef}
      className={cn(
        "relative touch-none select-none overflow-hidden rounded-2xl border border-border/80 bg-[#eef1f5]",
        cursor,
        className,
      )}
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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="TLC plate image. Use the tools to mark the baseline, solvent front and spots."
      />

      {size.width > 0 && (
        <svg className="absolute inset-0 h-full w-full overflow-visible" width={size.width} height={size.height}>
          {/* ── Prepare: crop box ─────────────────────────────────── */}
          {tool === "crop" && cropRect && (
            <CropOverlay rect={cropRect} S={S} width={size.width} height={size.height} nudge={nudge} />
          )}

          {/* ── Prepare: perspective corners ──────────────────────── */}
          {tool === "perspective" && quad && <QuadOverlay quad={quad} S={S} nudge={nudge} />}

          {/* ── Measure ───────────────────────────────────────────── */}
          {measuring && (
            <>
              {by !== null && fy !== null && analysis.solventDistancePx !== null && (
                <g pointerEvents="none">
                  <line x1={runX} x2={runX} y1={by} y2={fy} stroke={FRONT} strokeWidth={2} />
                  <path d={`M${runX - 5} ${fy + 8} L${runX} ${fy} L${runX + 5} ${fy + 8}`} fill="none" stroke={FRONT} strokeWidth={2} />
                  <g transform={`rotate(-90 ${runX} ${(by + fy) / 2})`}>
                    <Pill centred x={runX} y={(by + fy) / 2} text={formatPx(analysis.solventDistancePx)} fill={FRONT} />
                  </g>
                </g>
              )}

              {spots.map((spot, index) => {
                if (by === null) return null;
                const p = S(spot);
                const row = analysis.rows.find((r) => r.index === index);
                if (!spot.accepted || !row) return null;
                return (
                  <g key={`run-${spot.id}`} pointerEvents="none">
                    <line x1={p.x} x2={p.x} y1={by} y2={p.y} stroke={SPOT} strokeWidth={1.5} strokeDasharray="5 4" />
                    {showPills(spot.id) && (
                      <Pill x={p.x + 6} y={(by + p.y) / 2} text={formatPx(row.result.compoundDistance)} fill={SPOT} small />
                    )}
                  </g>
                );
              })}

              {fy !== null && (
                <MeasureLine
                  id="front"
                  y={fy}
                  x1={lineLeft}
                  x2={lineRight}
                  colour={FRONT}
                  label="Solvent front"
                  dashed
                  labelAbove
                  onKeyDown={nudge("front")}
                />
              )}
              {by !== null && (
                <MeasureLine
                  id="baseline"
                  y={by}
                  x1={lineLeft}
                  x2={lineRight}
                  colour={BASELINE}
                  label="Baseline / Origin"
                  onKeyDown={nudge("baseline")}
                />
              )}

              {spots.map((spot, index) => {
                const p = S(spot);
                const row = analysis.rows.find((r) => r.index === index);
                const selected = spot.id === selectedId;
                const colour = spot.accepted ? SPOT : SPOT_PENDING;
                const r = clamp((spot.radius ?? 0) * view.scale, 11, 60);
                const rfValue = row && row.result.rf !== null ? `Rf ${formatRf(row.result.rf, decimals)}` : null;
                const rfText = showPills(spot.id) ? rfValue : null;
                return (
                  <g
                    key={spot.id}
                    data-drag={`spot:${spot.id}`}
                    tabIndex={0}
                    role="button"
                    aria-label={`${spot.name}${spot.accepted ? "" : " (not confirmed)"}${rfValue ? `, ${rfValue}` : ""}. Drag or use arrow keys to move.`}
                    onKeyDown={nudge(`spot:${spot.id}`)}
                    onFocus={() => onSelect(spot.id)}
                    className="cursor-move outline-none [&:focus-visible_.focus-ring]:opacity-100"
                  >
                    <circle cx={p.x} cy={p.y} r={Math.max(r, 24)} fill="transparent" />
                    <circle
                      className="focus-ring opacity-0"
                      cx={p.x}
                      cy={p.y}
                      r={r + 6}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                    {selected && <circle cx={p.x} cy={p.y} r={r + 5} fill="none" stroke={colour} strokeOpacity={0.35} strokeWidth={6} />}
                    <circle cx={p.x} cy={p.y} r={r} fill="none" stroke="#fff" strokeWidth={4} />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={r}
                      fill="none"
                      stroke={colour}
                      strokeWidth={2}
                      strokeDasharray={spot.accepted ? undefined : "4 3"}
                    />
                    <circle cx={p.x} cy={p.y} r={2.5} fill={colour} />
                    <g transform={`translate(${p.x + r * 0.7 + 2} ${p.y - r * 0.7 - 2})`}>
                      <rect x={0} y={-11} rx={11} width={rfText ? 26 + rfText.length * 6.6 : 22} height={22} fill={colour} />
                      <text x={11} y={4.5} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#fff">
                        {index + 1}
                      </text>
                      {rfText && (
                        <text x={24} y={4.5} fontSize={11.5} fontWeight={600} fill="#fff">
                          {rfText}
                        </text>
                      )}
                    </g>
                  </g>
                );
              })}
            </>
          )}
        </svg>
      )}

      {/* Zoom controls: thumb-sized, bottom-right, clear of the lines' labels on the left. */}
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
        <StageButton label="Fit to screen" onClick={fit}>
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

function Pill({
  x,
  y,
  text,
  fill,
  small,
  centred,
}: {
  x: number;
  y: number;
  text: string;
  fill: string;
  small?: boolean;
  /** Centre the pill on x instead of starting it there. */
  centred?: boolean;
}) {
  const h = small ? 18 : 20;
  const w = text.length * (small ? 6.4 : 7) + 12;
  const left = centred ? x - w / 2 : x;
  return (
    <g>
      <rect x={left} y={y - h / 2} width={w} height={h} rx={h / 2} fill={fill} />
      <text x={left + w / 2} y={y + (small ? 4 : 4.5)} textAnchor="middle" fontSize={small ? 11 : 12} fontWeight={600} fill="#fff">
        {text}
      </text>
    </g>
  );
}

function MeasureLine({
  id,
  y,
  x1,
  x2,
  colour,
  label,
  dashed,
  labelAbove,
  onKeyDown,
}: {
  id: "baseline" | "front";
  y: number;
  x1: number;
  x2: number;
  colour: string;
  label: string;
  dashed?: boolean;
  labelAbove?: boolean;
  onKeyDown: (event: React.KeyboardEvent) => void;
}) {
  const knobX = x2 - 26;
  const labelW = label.length * 6.9 + 16;
  const labelY = labelAbove ? y - 22 : y + 22;
  return (
    <g
      data-drag={id}
      tabIndex={0}
      role="slider"
      aria-label={`${label} line`}
      aria-orientation="vertical"
      aria-valuenow={Math.round(y)}
      onKeyDown={onKeyDown}
      className="cursor-row-resize outline-none [&:focus-visible_.focus-ring]:opacity-100"
    >
      {/* A wide invisible stroke: the whole line is a 32 px touch target. */}
      <line x1={x1} x2={x2} y1={y} y2={y} stroke="transparent" strokeWidth={32} />
      <line className="focus-ring opacity-0" x1={x1} x2={x2} y1={y} y2={y} stroke="#2563eb" strokeOpacity={0.3} strokeWidth={10} />
      <line x1={x1} x2={x2} y1={y} y2={y} stroke="#fff" strokeWidth={4} />
      <line x1={x1} x2={x2} y1={y} y2={y} stroke={colour} strokeWidth={2} strokeDasharray={dashed ? "9 6" : undefined} />
      <g transform={`translate(${Math.max(x1, 0) + 64} ${labelY})`}>
        <rect x={0} y={-11} width={labelW} height={22} rx={6} fill={colour} />
        <text x={8} y={4.5} fontSize={12} fontWeight={600} fill="#fff">
          {label}
        </text>
      </g>
      {/* The knob: an obvious thing to grab on a phone. */}
      <circle cx={knobX} cy={y} r={15} fill="#fff" stroke={colour} strokeWidth={2} />
      <path d={`M${knobX - 5} ${y - 3} L${knobX} ${y - 8} L${knobX + 5} ${y - 3} M${knobX - 5} ${y + 3} L${knobX} ${y + 8} L${knobX + 5} ${y + 3}`} fill="none" stroke={colour} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

function Handle({
  id,
  p,
  label,
  onKeyDown,
  text,
}: {
  id: string;
  p: Point;
  label: string;
  onKeyDown: (event: React.KeyboardEvent) => void;
  text?: string;
}) {
  return (
    <g
      data-drag={id}
      tabIndex={0}
      role="button"
      aria-label={`${label}. Drag or use arrow keys to move.`}
      onKeyDown={onKeyDown}
      className="cursor-move outline-none [&:focus-visible_.focus-ring]:opacity-100"
    >
      <circle cx={p.x} cy={p.y} r={24} fill="transparent" />
      <circle className="focus-ring opacity-0" cx={p.x} cy={p.y} r={20} fill="none" stroke="#2563eb" strokeWidth={3} />
      <circle cx={p.x} cy={p.y} r={14} fill="#fff" fillOpacity={0.9} stroke="#1c7ad9" strokeWidth={3} />
      <circle cx={p.x} cy={p.y} r={3} fill="#1c7ad9" />
      {text && (
        <text x={p.x} y={p.y - 22} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff" stroke="#1c7ad9" strokeWidth={3} paintOrder="stroke">
          {text}
        </text>
      )}
    </g>
  );
}

function CropOverlay({
  rect,
  S,
  width,
  height,
  nudge,
}: {
  rect: Rect;
  S: (p: Point) => Point;
  width: number;
  height: number;
  nudge: (target: string) => (event: React.KeyboardEvent) => void;
}) {
  const a = S({ x: rect.x, y: rect.y });
  const b = S({ x: rect.x + rect.width, y: rect.y + rect.height });
  const corners: [string, Point, string][] = [
    ["tl", a, "Top-left crop corner"],
    ["tr", { x: b.x, y: a.y }, "Top-right crop corner"],
    ["br", b, "Bottom-right crop corner"],
    ["bl", { x: a.x, y: b.y }, "Bottom-left crop corner"],
  ];
  return (
    <g>
      <path
        d={`M0 0H${width}V${height}H0Z M${a.x} ${a.y}V${b.y}H${b.x}V${a.y}Z`}
        fill="rgba(15,23,42,0.45)"
        fillRule="evenodd"
        pointerEvents="none"
      />
      <rect
        data-drag="crop:move"
        x={a.x}
        y={a.y}
        width={Math.max(0, b.x - a.x)}
        height={Math.max(0, b.y - a.y)}
        fill="transparent"
        stroke="#fff"
        strokeWidth={2}
        className="cursor-move"
      />
      {[1, 2].map((k) => (
        <g key={k} pointerEvents="none" stroke="#fff" strokeOpacity={0.5}>
          <line x1={a.x + ((b.x - a.x) * k) / 3} x2={a.x + ((b.x - a.x) * k) / 3} y1={a.y} y2={b.y} />
          <line y1={a.y + ((b.y - a.y) * k) / 3} y2={a.y + ((b.y - a.y) * k) / 3} x1={a.x} x2={b.x} />
        </g>
      ))}
      {corners.map(([c, p, label]) => (
        <Handle key={c} id={`crop:${c}`} p={p} label={label} onKeyDown={nudge(`crop:${c}`)} />
      ))}
    </g>
  );
}

const QUAD_LABELS = ["Top-left", "Top-right", "Bottom-right", "Bottom-left"];
const QUAD_SHORT = ["TL", "TR", "BR", "BL"];

function QuadOverlay({
  quad,
  S,
  nudge,
}: {
  quad: Quad;
  S: (p: Point) => Point;
  nudge: (target: string) => (event: React.KeyboardEvent) => void;
}) {
  const pts = quad.map(S);
  return (
    <g>
      <polygon
        points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="rgba(28,122,217,0.12)"
        stroke="#1c7ad9"
        strokeWidth={2}
        strokeDasharray="7 5"
        pointerEvents="none"
      />
      {pts.map((p, i) => (
        <Handle
          key={i}
          id={`quad:${i}`}
          p={p}
          label={`${QUAD_LABELS[i]} plate corner`}
          text={QUAD_SHORT[i]}
          onKeyDown={nudge(`quad:${i}`)}
        />
      ))}
    </g>
  );
}
