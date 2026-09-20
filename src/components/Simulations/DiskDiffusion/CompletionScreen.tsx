"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: completion
// ============================================================
//
// What the student actually did, scored on technique rather than on whether
// the isolate turned out susceptible — a resistant result is a correct result.
// Mistakes are listed as what they cost and how to avoid them, never as marks
// taken away.

import React from "react";
import { BookOpen, Check, CircleDashed, RotateCcw, Table2, Trophy } from "lucide-react";

import { MEASUREMENT_TOLERANCE_MM, type TechniqueScore } from "./engine";
import type { FeedbackEntry } from "./types";

export interface CompletionScreenProps {
  score: TechniqueScore;
  checklist: { label: string; done: boolean }[];
  measurementsRecorded: number;
  measurementsExpected: number;
  accurateMeasurements: number;
  /** The warnings raised during the run — the teaching moments. */
  lessons: FeedbackEntry[];
  organismName: string;
  onReviewResults: () => void;
  onReviewGuide: () => void;
  onRepeat: () => void;
}

const ACTION =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2";

export default function CompletionScreen({
  score,
  checklist,
  measurementsRecorded,
  measurementsExpected,
  accurateMeasurements,
  lessons,
  organismName,
  onReviewResults,
  onReviewGuide,
  onRepeat,
}: CompletionScreenProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-brandBlue to-brandGreen px-5 py-5">
          <div className="text-white">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-white/80">
              <Trophy className="h-4 w-4" aria-hidden />
              Experiment complete
            </p>
            <h3 className="mt-1 text-xl font-extrabold">
              Susceptibility test on <span className="italic">{organismName}</span>
            </h3>
          </div>
          <div className="rounded-2xl bg-white/15 px-5 py-3 text-center text-white">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Technique</p>
            <p className="text-3xl font-black tabular-nums">{score.percent}%</p>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            The score is for your technique, not for the organism&apos;s susceptibility pattern — a
            resistant isolate is a correct result, not a failed experiment.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Procedure checklist */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 mb-2.5">
                Procedure
              </p>
              <ul className="!list-none !pl-0 !mb-0 space-y-1.5">
                {checklist.map((item) => (
                  <li
                    key={item.label}
                    className={`!mb-0 flex items-center gap-2 rounded-xl border p-2.5 text-[13px] ${
                      item.done
                        ? "border-brandGreen/30 bg-brandGreen/[0.06] text-brandGreen font-semibold"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {item.done ? (
                      <Check className="h-4 w-4 shrink-0" aria-hidden />
                    ) : (
                      <CircleDashed className="h-4 w-4 shrink-0" aria-hidden />
                    )}
                    {item.label}
                  </li>
                ))}
              </ul>

              <div className="mt-3 rounded-2xl border border-slate-200 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Measurements
                </p>
                <p className="mt-1 text-2xl font-black tabular-nums text-slate-900">
                  {measurementsRecorded} / {measurementsExpected}
                </p>
                <p className="text-[12.5px] text-slate-600 leading-relaxed mt-0.5">
                  {accurateMeasurements} recorded within {MEASUREMENT_TOLERANCE_MM} mm of the plate&apos;s
                  zone edge, measured through the disk centre.
                </p>
              </div>
            </div>

            {/* Score breakdown */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 mb-2.5">
                Where the score came from
              </p>
              <div className="space-y-2">
                {score.parts.map((part) => {
                  const pct = (part.earned / part.possible) * 100;
                  return (
                    <div key={part.label} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[13px] font-bold text-slate-900">{part.label}</p>
                        <p className="text-[12px] font-bold tabular-nums text-slate-600">
                          {part.earned}/{part.possible}
                        </p>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct >= 80 ? "bg-brandGreen" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[12px] text-slate-600 leading-relaxed">{part.note}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Teaching moments */}
          {lessons.length > 0 && (
            <div className="mt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500 mb-2.5">
                What to carry into the next plate
              </p>
              <div className="space-y-2">
                {lessons.map((l) => (
                  <div key={l.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
                    <p className="text-[13px] font-bold text-amber-900">{l.title}</p>
                    <p className="text-[12.5px] text-amber-900/90 leading-relaxed mt-0.5">{l.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className={ACTION} onClick={onReviewResults}>
              <Table2 className="h-4 w-4" aria-hidden />
              Review results
            </button>
            <button type="button" className={ACTION} onClick={onReviewGuide}>
              <BookOpen className="h-4 w-4" aria-hidden />
              Review lab guide
            </button>
            <button
              type="button"
              onClick={onRepeat}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brandBlue px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Repeat experiment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
