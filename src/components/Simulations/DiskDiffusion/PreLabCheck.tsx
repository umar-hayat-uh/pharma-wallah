"use client";

// ============================================================
// PharmaWallah — Disk Diffusion Lab: pre-lab knowledge check
// ============================================================
//
// Four questions, carried over from the original simulation's gate. It is no
// longer a gate: a student can go straight to the bench. Answering is how the
// lab records something for the progress dashboard, and every answer explains
// itself whether it was right or wrong.

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, RotateCcw, X } from "lucide-react";

import { PRE_LAB_QUESTIONS } from "./data";

export interface PreLabCheckProps {
  /** Fired once, when the last question has been answered. */
  onComplete?: (score: number, total: number) => void;
}

export default function PreLabCheck({ onComplete }: PreLabCheckProps) {
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const total = PRE_LAB_QUESTIONS.length;
  const answered = Object.keys(answers).length;
  const score = PRE_LAB_QUESTIONS.filter((q) => answers[q.id] === q.correctIndex).length;

  /**
   * Functional update, and completion detected in an effect rather than here.
   *
   * Answering two questions inside one tick — easy on a touch screen, and what
   * a scripted run does — used to make both handlers close over the same
   * `answers`, so the second overwrote the first and only one answer survived.
   * Reporting the score from inside the updater instead would break the other
   * rule: StrictMode runs updaters twice (MEMORY.md gotcha 103).
   */
  const answer = (questionId: string, index: number) => {
    setAnswers((prev) => (questionId in prev ? prev : { ...prev, [questionId]: index }));
  };

  const reportedRef = useRef(false);
  useEffect(() => {
    if (reportedRef.current || Object.keys(answers).length !== total) return;
    reportedRef.current = true;
    onComplete?.(score, total);
  }, [answers, score, total, onComplete]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="prelab-body"
        className="flex w-full items-center justify-between gap-3 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-inset"
      >
        <span>
          <span className="block text-base font-extrabold text-slate-900">Pre-lab check</span>
          <span className="block text-sm text-slate-600 mt-0.5">
            Four questions on the things that most often go wrong. Optional — the bench is open either way.
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {answered > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11.5px] font-bold tabular-nums text-slate-600">
              {score}/{total}
            </span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
          />
        </span>
      </button>

      {open && (
        <div id="prelab-body" className="border-t border-slate-100 p-5 space-y-4">
          {PRE_LAB_QUESTIONS.map((q, qi) => {
            const chosen = answers[q.id];
            const done = chosen !== undefined;
            return (
              <fieldset key={q.id} className="rounded-2xl border border-slate-200 p-4">
                <legend className="px-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Question {qi + 1} of {total}
                </legend>
                <p className="text-sm font-bold text-slate-900 mb-3">{q.question}</p>
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => {
                    const isCorrect = oi === q.correctIndex;
                    const isChosen = chosen === oi;
                    const tone = !done
                      ? "border-slate-200 hover:border-slate-300"
                      : isCorrect
                        ? "border-brandGreen bg-brandGreen/[0.07]"
                        : isChosen
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 opacity-60";
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={done}
                        onClick={() => answer(q.id, oi)}
                        className={`flex items-center gap-2.5 rounded-xl border-2 p-2.5 text-left text-[13.5px] font-semibold text-slate-800 transition-colors disabled:cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${tone}`}
                      >
                        {done && isCorrect && <Check className="h-4 w-4 shrink-0 text-brandGreen" aria-hidden />}
                        {done && isChosen && !isCorrect && <X className="h-4 w-4 shrink-0 text-red-500" aria-hidden />}
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
                {done && (
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-[12.5px] text-slate-700 leading-relaxed">
                    {q.explanation}
                  </p>
                )}
              </fieldset>
            );
          })}

          {answered > 0 && (
            <button
              type="button"
              onClick={() => {
                reportedRef.current = false;
                setAnswers({});
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2"
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
