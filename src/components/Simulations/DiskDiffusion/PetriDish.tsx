"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: the plate
// ============================================================
//
// The one surface the whole experiment happens on. It draws in REAL
// MILLIMETRES: the viewBox is centred on the plate and one user unit is one
// millimetre, so the 24 mm spacing rule, the 15 mm edge margin and the 6 mm
// disk are the same numbers in the model, in the geometry and on a ruler held
// to the screen. Nothing here decides anything — the parent owns the state and
// receives pointer positions already converted to millimetres.

import React, { useCallback, useRef } from "react";

import {
  COVERAGE_GRID,
  isCoverageCellOnPlate,
} from "./engine";
import {
  DISK_DIAMETER_MM,
  EDGE_MARGIN_MM,
  PLATE_RADIUS_MM,
  ANTIBIOTIC_BY_ID,
} from "./data";
import type { DiskPlacement, Measurement, Organism } from "./types";

export interface Caliper {
  a: { x: number; y: number };
  b: { x: number; y: number };
}

export interface PetriDishProps {
  organism: Organism | null;
  agarPoured: boolean;
  /** Coverage cells the swab has touched (row * GRID + col). */
  coveredCells: number[];
  /** 0 before incubation, 1 once the lawn has grown in. */
  lawnDensity: number;
  placements: DiskPlacement[];
  /** True zone diameters — only passed once the plate has been incubated. */
  zones: Record<string, number>;
  /** 0–1 animation of the zones appearing. */
  zoneReveal: number;
  measurements: Record<string, Measurement>;
  /** Disk the student is working with; drawn with a focus ring. */
  activeDiskId?: string | null;
  /** Show the ±15 mm edge margin and spacing guides while placing disks. */
  showPlacementGuides?: boolean;
  /** Show the swab-coverage overlay while inoculating. */
  showCoverage?: boolean;
  caliper?: Caliper | null;
  /** 1 = whole plate. Zooms about the active disk when there is one. */
  zoom?: number;
  interactive?: boolean;
  cursor?: string;
  ariaLabel?: string;
  onPointerDownMm?: (p: { x: number; y: number }, e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerMoveMm?: (p: { x: number; y: number }, e: React.PointerEvent<SVGSVGElement>) => void;
  onPointerUpMm?: (p: { x: number; y: number }, e: React.PointerEvent<SVGSVGElement>) => void;
  /** Called when a disk itself is activated by click or keyboard. */
  onDiskActivate?: (antibioticId: string) => void;
}

const CELL_MM = (PLATE_RADIUS_MM * 2) / COVERAGE_GRID;

/**
 * How near a calliper end a pointer must land to grab it, in millimetres.
 * On a 320 px plate one millimetre is about 3.3 px, so 7 mm is roughly a 46 px
 * target — the smallest that is comfortable with a fingertip.
 */
export const CALIPER_GRAB_MM = 7;

/** The viewBox always spans the dish plus a 3 mm rim, divided by the zoom. */
function spanFor(zoom: number) {
  return ((PLATE_RADIUS_MM + 3) * 2) / zoom;
}

/**
 * Convert a screen point inside the (square) plate element to millimetres.
 *
 * Exported because the disk tray drops a disk from outside the SVG's own
 * pointer events and must land on exactly the same millimetre the plate would
 * have reported — one conversion, used by both.
 */
export function plateMmFromClient(
  rect: DOMRect,
  clientX: number,
  clientY: number,
  zoom = 1,
  focus?: { x: number; y: number } | null,
): { x: number; y: number } {
  const span = spanFor(zoom);
  const cx = focus && zoom > 1 ? focus.x : 0;
  const cy = focus && zoom > 1 ? focus.y : 0;
  return {
    x: cx - span / 2 + ((clientX - rect.left) / rect.width) * span,
    y: cy - span / 2 + ((clientY - rect.top) / rect.height) * span,
  };
}

export default function PetriDish({
  organism,
  agarPoured,
  coveredCells,
  lawnDensity,
  placements,
  zones,
  zoneReveal,
  measurements,
  activeDiskId,
  showPlacementGuides,
  showCoverage,
  caliper,
  zoom = 1,
  interactive = false,
  cursor,
  ariaLabel,
  onPointerDownMm,
  onPointerMoveMm,
  onPointerUpMm,
  onDiskActivate,
}: PetriDishProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  /**
   * Screen → millimetres.
   *
   * Uses the element's own box rather than `getScreenCTM()`: the plate sits
   * inside animated, transformed parents in places, and the CTM then reports a
   * matrix mid-animation. The box plus the current viewBox is stable.
   */
  const toMm = useCallback(
    (clientX: number, clientY: number) => {
      const el = svgRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      const fx = activeDiskId ? placements.find((p) => p.antibioticId === activeDiskId) : null;
      return plateMmFromClient(rect, clientX, clientY, zoom, fx);
    },
    [zoom, activeDiskId, placements],
  );

  const span = spanFor(zoom);
  const focus = activeDiskId && zoom > 1 ? placements.find((p) => p.antibioticId === activeDiskId) : null;
  const viewBox = `${(focus?.x ?? 0) - span / 2} ${(focus?.y ?? 0) - span / 2} ${span} ${span}`;

  const covered = new Set(coveredCells);
  const lawnColor = organism?.lawnColor ?? "#cfe3c6";

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className="w-full h-full select-none"
      style={{ touchAction: interactive ? "none" : undefined, cursor }}
      role="img"
      aria-label={
        ariaLabel ??
        `Petri dish${agarPoured ? " with Mueller-Hinton agar" : ", empty"}${
          placements.length ? `, ${placements.length} antibiotic disks placed` : ""
        }`
      }
      onPointerDown={
        interactive && onPointerDownMm
          ? (e) => {
              (e.currentTarget as SVGSVGElement).setPointerCapture?.(e.pointerId);
              onPointerDownMm(toMm(e.clientX, e.clientY), e);
            }
          : undefined
      }
      onPointerMove={
        interactive && onPointerMoveMm
          ? (e) => onPointerMoveMm(toMm(e.clientX, e.clientY), e)
          : undefined
      }
      onPointerUp={
        interactive && onPointerUpMm
          ? (e) => onPointerUpMm(toMm(e.clientX, e.clientY), e)
          : undefined
      }
      onPointerCancel={
        interactive && onPointerUpMm
          ? (e) => onPointerUpMm(toMm(e.clientX, e.clientY), e)
          : undefined
      }
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="dd-rim" cx="42%" cy="35%" r="62%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="60%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
        <radialGradient id="dd-agar" cx="40%" cy="36%" r="64%">
          <stop offset="0%" stopColor={agarPoured ? "#fbf6dd" : "#f8fafc"} />
          <stop offset="55%" stopColor={agarPoured ? "#f2ead0" : "#f1f5f9"} />
          <stop offset="100%" stopColor={agarPoured ? "#e6dcb4" : "#e2e8f0"} />
        </radialGradient>
        <linearGradient id="dd-glare" x1="18%" y1="12%" x2="58%" y2="48%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <clipPath id="dd-agar-clip">
          <circle cx="0" cy="0" r={PLATE_RADIUS_MM} />
        </clipPath>
        <filter id="dd-plate-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.18" />
        </filter>
        {/* The lawn is painted as coverage cells so the model and the picture
            agree, but a bare grid reads as pixel artefacts at the rim rather
            than as bacterial growth. Blurring the cells (and not the dashed
            "not reached yet" overlay, which must stay precise) dissolves the
            grid into something organic without changing what is measured. */}
        <filter id="dd-lawn-soften" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
      </defs>

      {/* Dish */}
      <circle cx="0" cy="0" r={PLATE_RADIUS_MM + 3} fill="url(#dd-rim)" stroke="#94a3b8" strokeWidth="0.6" filter="url(#dd-plate-shadow)" />
      <circle cx="0" cy="0" r={PLATE_RADIUS_MM} fill="url(#dd-agar)" />

      {!agarPoured && (
        <text x="0" y="1.5" fontSize="4.5" textAnchor="middle" fill="#94a3b8" fontFamily="inherit" fontWeight="600">
          Empty dish — no agar
        </text>
      )}

      <g clipPath="url(#dd-agar-clip)">
        {/* Lawn — the covered cells, faint while swabbing, solid once grown */}
        {agarPoured && organism && covered.size > 0 && (
          <g opacity={0.25 + lawnDensity * 0.72} filter="url(#dd-lawn-soften)">
            {Array.from(covered).map((key) => {
              const row = Math.floor(key / COVERAGE_GRID);
              const col = key % COVERAGE_GRID;
              if (!isCoverageCellOnPlate(row, col)) return null;
              return (
                <rect
                  key={key}
                  x={-PLATE_RADIUS_MM + col * CELL_MM}
                  y={-PLATE_RADIUS_MM + row * CELL_MM}
                  width={CELL_MM + 0.4}
                  height={CELL_MM + 0.4}
                  fill={lawnColor}
                />
              );
            })}
          </g>
        )}

        {/* Grown lawn texture — colonies are only suggested, the lawn is confluent */}
        {lawnDensity > 0.6 && organism && (
          <g opacity={(lawnDensity - 0.6) * 1.2}>
            {Array.from({ length: 90 }, (_, i) => {
              const a = i * 2.39996;
              const r = Math.sqrt(i / 90) * (PLATE_RADIUS_MM - 1);
              return (
                <circle
                  key={i}
                  cx={r * Math.cos(a)}
                  cy={r * Math.sin(a)}
                  r={0.5 + ((i * 7) % 5) * 0.12}
                  fill={organism.color}
                  fillOpacity="0.14"
                />
              );
            })}
          </g>
        )}

        {/* Zones of inhibition — clear agar cut out of the lawn */}
        {placements.map((p) => {
          const diameter = zones[p.antibioticId];
          if (!diameter) return null;
          const r = (diameter / 2) * Math.max(0, Math.min(1, zoneReveal));
          if (r <= DISK_DIAMETER_MM / 2) return null;
          return (
            <g key={`${p.antibioticId}-zone`}>
              <circle cx={p.x} cy={p.y} r={r} fill="url(#dd-agar)" />
              <circle cx={p.x} cy={p.y} r={r} fill="#f7f1d8" fillOpacity="0.55" />
              <circle cx={p.x} cy={p.y} r={r} fill="none" stroke="rgba(100,116,139,0.45)" strokeWidth="0.35" />
            </g>
          );
        })}

        {/* Coverage overlay while inoculating — shows what the swab has reached */}
        {showCoverage && agarPoured && (
          <g pointerEvents="none">
            {Array.from({ length: COVERAGE_GRID * COVERAGE_GRID }, (_, key) => {
              const row = Math.floor(key / COVERAGE_GRID);
              const col = key % COVERAGE_GRID;
              if (!isCoverageCellOnPlate(row, col) || covered.has(key)) return null;
              return (
                <rect
                  key={key}
                  x={-PLATE_RADIUS_MM + col * CELL_MM + 0.5}
                  y={-PLATE_RADIUS_MM + row * CELL_MM + 0.5}
                  width={CELL_MM - 1}
                  height={CELL_MM - 1}
                  rx="0.6"
                  fill="none"
                  stroke="#1C7BD9"
                  strokeWidth="0.25"
                  strokeDasharray="0.8 0.8"
                  opacity="0.5"
                />
              );
            })}
          </g>
        )}
      </g>

      {/* Placement guides */}
      {showPlacementGuides && agarPoured && (
        <g pointerEvents="none">
          <circle
            cx="0"
            cy="0"
            r={PLATE_RADIUS_MM - EDGE_MARGIN_MM}
            fill="none"
            stroke="#1C7BD9"
            strokeWidth="0.5"
            strokeDasharray="2 2"
            opacity="0.7"
          />
          <text x="0" y={-(PLATE_RADIUS_MM - EDGE_MARGIN_MM) - 1.6} fontSize="3.2" textAnchor="middle" fill="#1C7BD9" fontFamily="inherit" fontWeight="700">
            keep disks inside · 15 mm margin
          </text>
        </g>
      )}

      {/* Disks */}
      {placements.map((p) => {
        const antibiotic = ANTIBIOTIC_BY_ID[p.antibioticId];
        const color = antibiotic?.color ?? "#1C7BD9";
        const isActive = activeDiskId === p.antibioticId;
        const measured = measurements[p.antibioticId];
        return (
          <g key={p.antibioticId}>
            {isActive && (
              <circle cx={p.x} cy={p.y} r={DISK_DIAMETER_MM / 2 + 2.5} fill="none" stroke="#1C7BD9" strokeWidth="0.8" strokeDasharray="1.6 1.2" />
            )}
            <g
              role={onDiskActivate ? "button" : undefined}
              tabIndex={onDiskActivate ? 0 : undefined}
              aria-label={
                onDiskActivate
                  ? `${antibiotic?.name ?? p.antibioticId} ${antibiotic?.diskContent ?? ""}${measured ? `, measured ${measured.recorded} millimetres` : ", not yet measured"}`
                  : undefined
              }
              style={{ cursor: onDiskActivate ? "pointer" : undefined, outline: "none" }}
              onClick={onDiskActivate ? () => onDiskActivate(p.antibioticId) : undefined}
              onKeyDown={
                onDiskActivate
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onDiskActivate(p.antibioticId);
                      }
                    }
                  : undefined
              }
            >
              <circle cx={p.x} cy={p.y} r={DISK_DIAMETER_MM / 2} fill="#ffffff" stroke={color} strokeWidth="0.7" />
              <text
                x={p.x}
                y={p.y + 0.9}
                fontSize="2.6"
                textAnchor="middle"
                fill={color}
                fontWeight="800"
                fontFamily="inherit"
                pointerEvents="none"
              >
                {p.antibioticId}
              </text>
            </g>
            {measured && !isActive && (
              <g pointerEvents="none">
                <rect x={p.x - 6} y={p.y + 4.2} width="12" height="4.4" rx="2.2" fill={color} />
                <text x={p.x} y={p.y + 7.4} fontSize="2.6" textAnchor="middle" fill="#ffffff" fontWeight="800" fontFamily="inherit">
                  {measured.recorded} mm
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Calliper */}
      {caliper && (
        <g pointerEvents="none">
          <line x1={caliper.a.x} y1={caliper.a.y} x2={caliper.b.x} y2={caliper.b.y} stroke="#1C7BD9" strokeWidth="0.6" strokeDasharray="2 1.2" />
          {[caliper.a, caliper.b].map((pt, i) => (
            <g key={i}>
              {/* Matches CALIPER_GRAB_MM below, so what looks grabbable is. */}
              <circle cx={pt.x} cy={pt.y} r={CALIPER_GRAB_MM} fill="#1C7BD9" fillOpacity="0.1" />
              <circle cx={pt.x} cy={pt.y} r="3.4" fill="#ffffff" stroke="#1C7BD9" strokeWidth="1" />
              <circle cx={pt.x} cy={pt.y} r="1.1" fill="#1C7BD9" />
            </g>
          ))}
          <text
            x={(caliper.a.x + caliper.b.x) / 2}
            y={(caliper.a.y + caliper.b.y) / 2 - 3}
            fontSize="3.4"
            textAnchor="middle"
            fill="#1C7BD9"
            fontWeight="800"
            fontFamily="inherit"
          >
            {Math.round(Math.hypot(caliper.b.x - caliper.a.x, caliper.b.y - caliper.a.y))} mm
          </text>
        </g>
      )}

      {/* Glass */}
      <g pointerEvents="none">
        <circle cx="0" cy="0" r={PLATE_RADIUS_MM} fill="url(#dd-glare)" clipPath="url(#dd-agar-clip)" />
        <circle cx="0" cy="0" r={PLATE_RADIUS_MM} fill="none" stroke="rgba(15,23,42,0.08)" strokeWidth="1.6" />
      </g>
    </svg>
  );
}
