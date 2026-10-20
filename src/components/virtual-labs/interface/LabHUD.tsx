"use client";

import Link from "next/link";
import { ArrowLeft, Compass, Footprints, HelpCircle, Pause, RotateCcw, Settings2 } from "lucide-react";
import type { QualityPref } from "@/lib/virtual-labs/progress";

/** The top bar: title, objective, progress, mode, quality, help and pause. */
export function LabHUD(p: {
  title: string;
  stepTitle: string;
  objective: string;
  done: number;
  total: number;
  stepNumber: number;
  mode: "guided" | "free";
  onMode(m: "guided" | "free"): void;
  quality: QualityPref;
  onQuality(q: QualityPref): void;
  is3D: boolean;
  onResetView(): void;
  onHelp(): void;
  onPause(): void;
}) {
  const pct = Math.round((p.done / p.total) * 100);
  return (
    <header className="vl-noprint border-b border-[#16181d]/10 bg-white">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 sm:px-4">
        <Link href="/virtual-labs" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-[#3a3f47] hover:bg-[#16181d]/5" aria-label="Back to all virtual labs">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Labs</span>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#16181d] sm:text-base">{p.title}</p>
          <p className="hidden truncate text-xs text-[#4a4f57] sm:block" aria-live="polite">
            <span className="font-semibold text-brandBlue">{p.stepTitle}:</span> {p.objective}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {p.is3D && (
            <div className="flex rounded-xl bg-[#16181d]/[0.05] p-0.5" role="group" aria-label="Navigation mode">
              <button type="button" onClick={() => p.onMode("guided")} aria-pressed={p.mode === "guided"} className={`inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold ${p.mode === "guided" ? "bg-white text-brandBlue shadow-sm" : "text-[#4a4f57]"}`}>
                <Compass className="h-3.5 w-3.5" aria-hidden /><span className="sr-only sm:not-sr-only">Guided</span>
              </button>
              <button type="button" onClick={() => p.onMode("free")} aria-pressed={p.mode === "free"} className={`inline-flex min-h-9 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold ${p.mode === "free" ? "bg-white text-brandBlue shadow-sm" : "text-[#4a4f57]"}`}>
                <Footprints className="h-3.5 w-3.5" aria-hidden /><span className="sr-only sm:not-sr-only">Walk</span>
              </button>
            </div>
          )}
          {p.is3D && (
            <label className="relative hidden items-center md:flex" title="Graphics quality">
              <Settings2 className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-[#4a4f57]" aria-hidden />
              <span className="sr-only">Graphics quality</span>
              <select value={p.quality} onChange={(e) => p.onQuality(e.target.value as QualityPref)} className="h-9 rounded-lg border border-[#16181d]/12 bg-white pl-7 pr-2 text-xs font-semibold">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          )}
          {p.is3D && (
            <button type="button" onClick={p.onResetView} className="grid h-9 w-9 place-items-center rounded-lg text-[#3a3f47] hover:bg-[#16181d]/5" aria-label="Reset view" title="Reset view">
              <RotateCcw className="h-4 w-4" aria-hidden />
            </button>
          )}
          <button type="button" onClick={p.onHelp} className="grid h-9 w-9 place-items-center rounded-lg text-[#3a3f47] hover:bg-[#16181d]/5" aria-label="Controls and help" title="Controls and help">
            <HelpCircle className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" onClick={p.onPause} className="grid h-9 w-9 place-items-center rounded-lg text-[#3a3f47] hover:bg-[#16181d]/5" aria-label="Pause" title="Pause">
            <Pause className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
      {/* phones: the objective gets its own full-width line — it is the instruction they need */}
      <p className="px-3 pb-2 text-[13px] leading-snug text-[#3a3f47] sm:hidden" aria-live="polite">
        <span className="font-semibold text-brandBlue">
          Step {p.stepNumber} of {p.total} · {p.stepTitle}:
        </span>{" "}
        {p.objective}
      </p>
      <div className="h-1 bg-[#16181d]/[0.06]" role="progressbar" aria-label="Procedure progress" aria-valuemin={0} aria-valuemax={p.total} aria-valuenow={p.done}>
        <div className="h-full bg-brandGreen transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </header>
  );
}
