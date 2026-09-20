"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: results
// ============================================================
//
// What the experiment produced, and what it means. The plate and the table are
// linked in both directions: selecting a row highlights its disk, and tapping
// a disk selects its row.
//
// Category is never signalled by colour alone — every result carries its
// letter, its full wording and an icon, so the table survives being printed in
// greyscale or read by someone who cannot distinguish the tones.

import React from "react";
import { AlertCircle, CheckCircle2, Download, HelpCircle, MinusCircle } from "lucide-react";

import PetriDish from "./PetriDish";
import { ANTIBIOTIC_BY_ID } from "./data";
import { interpretZone, type Interpretation } from "./engine";
import type { DiskPlacement, InterpretationCategory, Measurement, Organism } from "./types";

export interface ResultsDashboardProps {
  organism: Organism;
  placements: DiskPlacement[];
  measurements: Record<string, Measurement>;
  zones: Record<string, number>;
  interpretationSystemId: string;
  selectedDiskId: string | null;
  onSelectDisk: (id: string) => void;
  /** Conditions, for the experiment summary. */
  summary: { label: string; value: string }[];
  onDownloadReport: () => void;
  downloading?: boolean;
}

const CATEGORY_STYLE: Record<
  InterpretationCategory,
  { icon: React.ComponentType<{ className?: string }>; text: string; chip: string; row: string }
> = {
  S: {
    icon: CheckCircle2,
    text: "text-brandGreen",
    chip: "bg-brandGreen/[0.12] text-brandGreen",
    row: "border-brandGreen/30",
  },
  I: {
    icon: AlertCircle,
    text: "text-amber-600",
    chip: "bg-amber-100 text-amber-700",
    row: "border-amber-300",
  },
  R: {
    icon: MinusCircle,
    text: "text-red-600",
    chip: "bg-red-100 text-red-700",
    row: "border-red-300",
  },
  NI: {
    icon: HelpCircle,
    text: "text-slate-500",
    chip: "bg-slate-100 text-slate-600",
    row: "border-slate-300",
  },
};

function ResultRow({
  placement,
  measurement,
  result,
  selected,
  onSelect,
}: {
  placement: DiskPlacement;
  measurement?: Measurement;
  result: Interpretation;
  selected: boolean;
  onSelect: () => void;
}) {
  const antibiotic = ANTIBIOTIC_BY_ID[placement.antibioticId];
  const style = CATEGORY_STYLE[result.category];
  const Icon = style.icon;

  return (
    <tr
      className={`cursor-pointer border-l-4 transition-colors ${selected ? "bg-brandBlue/[0.05]" : "hover:bg-slate-50"} ${style.row}`}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-selected={selected}
    >
      <td className="py-3 pl-3 pr-2">
        <span
          className="inline-grid h-8 w-8 place-items-center rounded-full border-2 text-[10px] font-black"
          style={{ borderColor: antibiotic?.color, color: antibiotic?.color }}
        >
          {placement.antibioticId}
        </span>
      </td>
      <td className="py-3 pr-3">
        <span className="block text-sm font-bold text-slate-900">{antibiotic?.name}</span>
        <span className="block text-[11px] text-slate-500">
          {antibiotic?.diskContent} · {antibiotic?.className}
        </span>
      </td>
      <td className="py-3 pr-3 tabular-nums">
        <span className="text-base font-black text-slate-900">
          {measurement ? `${measurement.recorded} mm` : "—"}
        </span>
        {measurement && !measurement.throughCentre && (
          <span className="block text-[10.5px] font-semibold text-amber-600">measured off-centre</span>
        )}
      </td>
      <td className="py-3 pr-3 text-[12px] tabular-nums text-slate-600">
        {result.criteria ? (
          <>
            S ≥ {result.criteria.susceptible}
            <span className="block">R ≤ {result.criteria.resistant}</span>
          </>
        ) : (
          <span className="text-slate-400">none for this pair</span>
        )}
      </td>
      <td className="py-3 pr-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-extrabold ${style.chip}`}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {result.category === "NI" ? "—" : result.category}
        </span>
        <span className={`mt-1 block text-[11px] font-bold ${style.text}`}>{result.label}</span>
      </td>
    </tr>
  );
}

export default function ResultsDashboard({
  organism,
  placements,
  measurements,
  zones,
  interpretationSystemId,
  selectedDiskId,
  onSelectDisk,
  summary,
  onDownloadReport,
  downloading,
}: ResultsDashboardProps) {
  const results = placements.map((p) => {
    const measurement = measurements[p.antibioticId];
    const diameter = measurement?.recorded ?? zones[p.antibioticId] ?? 0;
    return {
      placement: p,
      measurement,
      result: interpretZone(interpretationSystemId, p.antibioticId, organism, diameter),
    };
  });
  const system = results[0]?.result.system;

  return (
    <div className="space-y-4">
      {/* Experiment summary */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 mb-3">
          Experiment summary
        </p>
        <p className="text-lg font-extrabold italic text-slate-900">{organism.name}</p>
        <p className="text-[12px] font-semibold text-slate-500 mb-3">{organism.strain}</p>
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {summary.map((item) => (
            <div key={item.label} className="flex justify-between gap-3 border-b border-slate-100 pb-1.5">
              <dt className="text-[12.5px] text-slate-500">{item.label}</dt>
              <dd className="text-[12.5px] font-bold text-slate-800 text-right">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Plate + table */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 mb-3">
            The finished plate
          </p>
          <div className="mx-auto aspect-square w-full max-w-[280px]">
            <PetriDish
              organism={organism}
              agarPoured
              coveredCells={[]}
              lawnDensity={1}
              placements={placements}
              zones={zones}
              zoneReveal={1}
              measurements={measurements}
              activeDiskId={selectedDiskId}
              onDiskActivate={onSelectDisk}
              ariaLabel={`Finished plate of ${organism.name} with ${placements.length} antibiotic disks and their zones of inhibition. Select a disk to highlight its result.`}
            />
          </div>
          <p className="mt-2 text-center text-[12px] text-slate-500">
            Tap a disk to highlight its row.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <caption className="sr-only">
                Susceptibility results for {organism.name}: antibiotic, measured zone diameter, criteria
                applied and the reported category.
              </caption>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  {["Disk", "Antibiotic", "Diameter", "Criteria", "Report"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="py-2.5 pl-3 pr-3 text-[10.5px] font-bold uppercase tracking-wider text-slate-500 first:pl-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => (
                  <ResultRow
                    key={r.placement.antibioticId}
                    placement={r.placement}
                    measurement={r.measurement}
                    result={r.result}
                    selected={selectedDiskId === r.placement.antibioticId}
                    onSelect={() => onSelectDisk(r.placement.antibioticId)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {system && (
            <div className="border-t border-slate-100 bg-amber-50 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                About these criteria — {system.label}
              </p>
              <p className="text-[12.5px] text-amber-900 leading-relaxed">{system.sourceNote}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onDownloadReport}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-xl bg-brandBlue px-4 py-2.5 text-sm font-bold text-white transition-opacity enabled:hover:opacity-90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
        >
          <Download className="h-4 w-4" aria-hidden />
          {downloading ? "Preparing…" : "Download the lab report"}
        </button>
      </div>
    </div>
  );
}
