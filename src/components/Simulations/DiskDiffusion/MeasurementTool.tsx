"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: the measurement tool
// ============================================================
//
// The student measures; the lab does not measure for them. The calliper's
// length is shown live as it is dragged, but the plate's true zone diameter is
// never displayed before a reading is recorded — otherwise the exercise is
// reading a number off the screen rather than reading a plate.
//
// Keyboard nudging exists for the same reason the buttons do in every other
// stage: a drag-only measurement tool is unusable without a pointer.

import React from "react";
import { Crosshair, Minus, Plus, RotateCcw, Ruler, Save } from "lucide-react";

import { ANTIBIOTIC_BY_ID, DISK_DIAMETER_MM } from "./data";
import { MEASUREMENT_TOLERANCE_MM } from "./engine";
import type { DiskPlacement, Measurement } from "./types";

export interface MeasurementToolProps {
  placements: DiskPlacement[];
  measurements: Record<string, Measurement>;
  selectedDiskId: string | null;
  /** Live calliper length in mm, or null when no disk is selected. */
  caliperMm: number | null;
  zoom: number;
  onSelectDisk: (id: string) => void;
  onRecord: () => void;
  onClear: (id: string) => void;
  onZoomChange: (zoom: number) => void;
  onCentreCaliper: () => void;
  /** Nudge the calliper ends apart or together by one millimetre. */
  onNudge: (deltaMm: number) => void;
}

const BTN =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition-colors enabled:hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2";

export default function MeasurementTool({
  placements,
  measurements,
  selectedDiskId,
  caliperMm,
  zoom,
  onSelectDisk,
  onRecord,
  onClear,
  onZoomChange,
  onCentreCaliper,
  onNudge,
}: MeasurementToolProps) {
  const selected = selectedDiskId ? ANTIBIOTIC_BY_ID[selectedDiskId] : null;
  const recorded = selectedDiskId ? measurements[selectedDiskId] : undefined;
  const done = placements.filter((p) => p.antibioticId in measurements).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-baseline justify-between gap-2 mb-2.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">
            Zones to measure
          </p>
          <p className="text-[11px] font-bold tabular-nums text-slate-500" aria-live="polite">
            {done} / {placements.length} recorded
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-3">
          {placements.map((p) => {
            const a = ANTIBIOTIC_BY_ID[p.antibioticId];
            const m = measurements[p.antibioticId];
            const isSelected = selectedDiskId === p.antibioticId;
            return (
              <button
                key={p.antibioticId}
                type="button"
                aria-pressed={isSelected}
                aria-label={`${a?.name ?? p.antibioticId}${m ? `, recorded ${m.recorded} millimetres` : ", not yet measured"}`}
                onClick={() => onSelectDisk(p.antibioticId)}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
                  isSelected ? "border-brandBlue bg-brandBlue/[0.05]" : m ? "border-brandGreen/40 bg-brandGreen/[0.05]" : "border-dashed border-slate-300 hover:border-slate-400"
                }`}
              >
                <span
                  className="grid h-8 w-8 place-items-center rounded-full border-2 text-[10px] font-black"
                  style={{ borderColor: a?.color, color: a?.color }}
                >
                  {p.antibioticId}
                </span>
                <span className={`text-[11px] font-bold tabular-nums ${m ? "text-brandGreen" : "text-slate-400"}`}>
                  {m ? `${m.recorded} mm` : "—"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 mb-2.5">
          Calliper
        </p>

        {!selected ? (
          <p className="text-sm text-slate-500 leading-relaxed">
            Choose a disk above, or tap one on the plate, to bring the calliper to it.
          </p>
        ) : (
          <>
            <p className="text-sm font-extrabold text-slate-900">{selected.name}</p>
            <p className="text-[12px] text-slate-500 mb-3">{selected.diskContent} disk</p>

            {/* Live reading */}
            <div className="rounded-2xl border border-brandBlue/25 bg-brandBlue/[0.05] p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brandBlue mb-1">
                Diameter across the calliper
              </p>
              <p className="text-4xl font-black tabular-nums text-brandBlue" aria-live="polite">
                {caliperMm === null ? "—" : Math.round(caliperMm)}
                <span className="ml-1 text-lg font-bold">mm</span>
              </p>
              <p className="mt-1 text-[11.5px] text-slate-600">
                includes the {DISK_DIAMETER_MM} mm disk
              </p>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" className={BTN} onClick={() => onNudge(-1)} aria-label="Narrow the calliper by one millimetre">
                <Minus className="h-4 w-4" aria-hidden />
                Narrower
              </button>
              <button type="button" className={BTN} onClick={() => onNudge(1)} aria-label="Widen the calliper by one millimetre">
                <Plus className="h-4 w-4" aria-hidden />
                Wider
              </button>
              <button type="button" className={BTN} onClick={onCentreCaliper}>
                <Crosshair className="h-4 w-4" aria-hidden />
                Centre on disk
              </button>
              <button
                type="button"
                className={BTN}
                onClick={() => selectedDiskId && onClear(selectedDiskId)}
                disabled={!recorded}
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                Clear reading
              </button>
            </div>

            <button
              type="button"
              onClick={onRecord}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brandBlue px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
            >
              <Save className="h-4 w-4" aria-hidden />
              {recorded ? "Record again" : "Record measurement"}
            </button>

            {recorded && (
              <p
                className={`mt-2 rounded-xl px-3 py-2 text-[12.5px] leading-relaxed ${
                  recorded.throughCentre && recorded.errorMm <= MEASUREMENT_TOLERANCE_MM
                    ? "bg-brandGreen/[0.08] text-brandGreen font-semibold"
                    : "bg-amber-50 text-amber-900"
                }`}
              >
                {recorded.throughCentre && recorded.errorMm <= MEASUREMENT_TOLERANCE_MM
                  ? `${recorded.recorded} mm recorded, measured through the disk centre.`
                  : !recorded.throughCentre
                    ? `${recorded.recorded} mm recorded, but the calliper line missed the disk centre — that is a chord, not a diameter. Centre it and measure again.`
                    : `${recorded.recorded} mm recorded. Check the point where growth stops completely, at the widest part of the zone, and measure again if you want to revise it.`}
              </p>
            )}
          </>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="zone-zoom" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">
            <Ruler className="h-4 w-4" aria-hidden />
            Zoom
          </label>
          <span className="text-sm font-bold tabular-nums text-slate-700">{zoom.toFixed(1)}×</span>
        </div>
        <input
          id="zone-zoom"
          type="range"
          min={1}
          max={3}
          step={0.25}
          value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="mt-2 w-full accent-brandBlue"
        />
        <p className="mt-1.5 text-[12px] text-slate-500 leading-relaxed">
          Zooming magnifies the plate around the selected disk. It does not change the measurement —
          the calliper reads in millimetres either way.
        </p>
      </div>
    </div>
  );
}
