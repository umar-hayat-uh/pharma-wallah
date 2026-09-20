"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: the illustrated Lab Guide
// ============================================================
//
// The walk-through a student reads before touching the simulation: one step at
// a time, each with a diagram, an explanation, the practical note that stops
// the commonest mistake, and a link straight into the stage that rehearses it.
//
// The whole guide is in the DOM at once and steps are shown or hidden, so the
// text is searchable and the browser's find-in-page works — only the current
// step is visible and the rest are `hidden`, which also keeps them out of the
// accessibility tree.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

import { GUIDE_STEPS } from "./data";
import { GUIDE_FIGURES } from "./illustrations";
import type { LabStage } from "./types";

export interface LabGuideProps {
  /** Jump into the simulation at the stage a step rehearses. */
  onTryInSimulation?: (stage: LabStage) => void;
  /** Open the guide on a particular step (used by the completion screen). */
  initialStep?: number;
}

export default function LabGuide({ onTryInSimulation, initialStep = 0 }: LabGuideProps) {
  const [index, setIndex] = useState(Math.min(initialStep, GUIDE_STEPS.length - 1));
  const reduceMotion = useReducedMotion();
  const headingRef = useRef<HTMLHeadingElement>(null);
  /** Don't steal focus on first paint — only when the student moves a step. */
  const hasMoved = useRef(false);

  const go = useCallback((next: number) => {
    setIndex((current) => {
      const clamped = Math.max(0, Math.min(GUIDE_STEPS.length - 1, next));
      if (clamped !== current) hasMoved.current = true;
      return clamped;
    });
  }, []);

  useEffect(() => {
    if (hasMoved.current) headingRef.current?.focus();
  }, [index]);

  const step = GUIDE_STEPS[index];
  const Figure = GUIDE_FIGURES[step.id];
  const progress = ((index + 1) / GUIDE_STEPS.length) * 100;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      {/* Progress */}
      <div className="px-4 sm:px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            Lab guide
          </p>
          <p className="text-xs font-semibold text-slate-500" aria-live="polite">
            Step {index + 1} of {GUIDE_STEPS.length}
          </p>
        </div>

        <div
          className="h-1.5 rounded-full bg-slate-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={GUIDE_STEPS.length}
          aria-label="Lab guide progress"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-brandBlue to-brandGreen"
            style={{ width: `${progress}%`, transition: reduceMotion ? "none" : "width 320ms cubic-bezier(0.22,1,0.36,1)" }}
          />
        </div>

        {/* Step rail — a direct jump to any step, and the only place the whole
            procedure is visible at once. Scrolls horizontally on a phone. */}
        <div className="mt-3 -mx-1 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="Lab guide steps">
          {GUIDE_STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-controls={`guide-panel-${s.id}`}
              onClick={() => go(i)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
                i === index
                  ? "bg-brandBlue text-white"
                  : i < index
                    ? "bg-brandGreen/12 text-brandGreen"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              <span className="tabular-nums">{i + 1}</span>
              <span className="sr-only">{`: ${s.title}`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step body */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step.id}
            id={`guide-panel-${step.id}`}
            role="tabpanel"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-5 lg:grid-cols-2 lg:gap-8 items-start"
          >
            {/* Illustration */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
              {Figure ? (
                <Figure alt={step.illustrationAlt} />
              ) : (
                <p className="text-sm text-slate-500">{step.illustrationAlt}</p>
              )}
            </div>

            {/* Text */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brandBlue text-sm font-black text-white tabular-nums">
                  {index + 1}
                </span>
                <h3
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight focus-visible:outline-none"
                >
                  {step.title}
                </h3>
              </div>

              <p className="text-[15px] font-semibold text-slate-700 leading-relaxed mb-3">
                {step.summary}
              </p>

              {step.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-sm text-slate-600 leading-relaxed mb-3">
                  {paragraph}
                </p>
              ))}

              <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <Lightbulb className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" aria-hidden />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    Practical note
                  </p>
                  <p className="text-sm text-amber-900 leading-relaxed mt-0.5">{step.practicalNote}</p>
                </div>
              </div>

              {step.stage && onTryInSimulation && (
                <button
                  type="button"
                  onClick={() => onTryInSimulation(step.stage as LabStage)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-brandBlue/25 bg-brandBlue/[0.06] px-4 py-2.5 text-sm font-bold text-brandBlue transition-colors hover:bg-brandBlue/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
                >
                  Try it in the simulation
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-4 sm:px-6 py-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 transition-colors enabled:hover:border-slate-300 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
          <span className="sr-only"> step</span>
        </button>

        <p className="hidden sm:block text-xs font-semibold text-slate-500 text-center truncate px-2">
          {step.title}
        </p>

        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === GUIDE_STEPS.length - 1}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-4 py-2 text-sm font-bold text-white transition-opacity enabled:hover:opacity-90 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
        >
          Next
          <span className="sr-only"> step</span>
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
