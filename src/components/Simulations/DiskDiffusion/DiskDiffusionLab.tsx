"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab
// Kirby-Bauer antibiotic susceptibility test
// ============================================================
//
// The page shell: one lab with two halves. Theory explains and demonstrates;
// the simulation is where the student does it. They share one interpretation
// setting and one set of "try it here" links, so moving between them keeps the
// context rather than restarting it.
//
// Replaces the original single-file `DiskDiffusionSim.tsx`. Everything that
// lab did is still here — clinical cases, the plate and incubator artwork, the
// pre-lab questions, the PDF report — with the procedure, the measurement and
// the interpretation rebuilt around what the student does rather than what
// they watch.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BookOpen, FlaskConical, GraduationCap, Microscope, Wrench } from "lucide-react";

import SimulationWorkspace from "./SimulationWorkspace";
import TheorySection from "./TheorySection";
import { useLabMachine } from "./useLabMachine";
import { useTracker } from "@/hooks/useTracker";
import type { LabMode, LabStage, LabView, TheoryTab } from "./types";

const MODE_COPY: Record<LabMode, { label: string; blurb: string; Icon: React.ComponentType<{ className?: string }> }> = {
  guided: {
    label: "Guided",
    Icon: GraduationCap,
    blurb: "Each stage explains what to do and why, and feedback arrives as you work.",
  },
  practice: {
    label: "Free practice",
    Icon: Wrench,
    blurb: "The same bench with the hints turned down. Work through it on your own and check at the end.",
  },
};

export default function DiskDiffusionLab() {
  const [view, setView] = useState<LabView>("theory");
  const [theoryTab, setTheoryTab] = useState<TheoryTab>("principle");
  const { state, dispatch, organism, coverage, tryPlaceDisk } = useLabMachine("guided");
  const { trackActivity, trackQuiz } = useTracker();
  const pathname = usePathname();
  const simRef = useRef<HTMLDivElement>(null);

  // Record that the lab was opened, once per mount. Tracking goes through
  // useTracker so it is batched with everything else the student does — never
  // a raw fetch (see the progress-tracking skill).
  const openedRef = useRef(false);
  useEffect(() => {
    if (openedRef.current) return;
    openedRef.current = true;
    trackActivity({
      type: "simulation",
      label: "Opened: Disk Diffusion (Kirby-Bauer) lab",
      href: pathname,
    });
  }, [trackActivity, pathname]);

  /** Theory → simulation, landing on the stage that rehearses what was read. */
  const goToStage = useCallback(
    (stage: LabStage) => {
      setView("simulation");
      dispatch({ type: "go", stage });
      // The stage may be locked — the machine refuses silently, and the
      // student lands on the bench at whatever stage they had reached.
      requestAnimationFrame(() => {
        simRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
    },
    [dispatch],
  );

  const reviewGuide = useCallback(() => {
    setView("theory");
    setTheoryTab("guide");
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }, []);

  const handleComplete = useCallback(
    ({ techniquePercent, organismName }: { techniquePercent: number; organismName: string }) => {
      trackActivity({
        type: "simulation",
        label: `Completed: Disk diffusion on ${organismName} — technique ${techniquePercent}%`,
        href: pathname,
      });
    },
    [trackActivity, pathname],
  );

  const handlePreLab = useCallback(
    (score: number, total: number) => {
      trackQuiz({
        quizId: "sim:disk-diffusion-prelab",
        subject: "Microbiology",
        score,
        total,
      });
    },
    [trackQuiz],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Lab header */}
        <header className="mb-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-brandBlue/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brandBlue">
            <Microscope className="h-3.5 w-3.5" aria-hidden />
            Microbiology · virtual laboratory
          </p>
          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
            Disk diffusion method
            <span className="block text-lg sm:text-xl lg:text-2xl font-bold text-slate-500 mt-1">
              Kirby-Bauer antibiotic susceptibility test
            </span>
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] text-slate-600 leading-relaxed">
            Work through the whole procedure — prepare and standardise the inoculum, pour and inoculate
            the plate, apply the disks, incubate, read the zones, measure them yourself and interpret
            what you measured. Read the theory first or go straight to the bench.
          </p>
        </header>

        {/* View + mode */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-2xl border border-slate-200 bg-white p-1"
            role="tablist"
            aria-label="Lab view"
          >
            {(
              [
                ["theory", "Theory", BookOpen],
                ["simulation", "Simulation", FlaskConical],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
                  view === id ? "bg-brandBlue text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </button>
            ))}
          </div>

          <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1" role="radiogroup" aria-label="Simulation mode">
            {(Object.keys(MODE_COPY) as LabMode[]).map((mode) => {
              const { label, Icon } = MODE_COPY[mode];
              const active = state.mode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => dispatch({ type: "set-mode", mode })}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
                    active ? "bg-brandGreen/[0.12] text-brandGreen" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {state.mode === "practice" && view === "simulation" && (
          <p className="mb-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-600 leading-relaxed">
            {MODE_COPY.practice.blurb} The required practical steps are still required — you cannot
            measure a plate you never inoculated.
          </p>
        )}

        {/* The lab */}
        {view === "theory" ? (
          <TheorySection
            tab={theoryTab}
            onTabChange={setTheoryTab}
            interpretationSystemId={state.interpretationSystemId}
            onInterpretationSystemChange={(id) => dispatch({ type: "set-interpretation", systemId: id })}
            onTryInSimulation={goToStage}
            onPreLabComplete={handlePreLab}
          />
        ) : (
          <div ref={simRef} className="scroll-mt-24">
            <SimulationWorkspace
              state={state}
              dispatch={dispatch}
              organism={organism}
              coverage={coverage}
              tryPlaceDisk={tryPlaceDisk}
              onReviewGuide={reviewGuide}
              onComplete={handleComplete}
            />
          </div>
        )}

        {/* Standing disclaimer — this is a teaching model, not a clinical tool. */}
        <p className="mt-8 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[12.5px] text-slate-500 leading-relaxed">
          For educational use only. The plate is driven by a teaching model, and the interpretive
          criteria shipped with it are configurable teaching values — not a clinical standard. Real
          susceptibility interpretation depends on the guideline in force, the organism, the
          antimicrobial agent, the disk content and the testing conditions.
        </p>
      </div>
    </div>
  );
}
