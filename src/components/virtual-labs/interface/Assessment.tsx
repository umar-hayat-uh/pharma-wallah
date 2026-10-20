"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { ExperimentDefinition } from "@/lib/virtual-labs/engine/types";
import type { Run } from "@/lib/virtual-labs/engine/machine";
import { Btn } from "./ui";

const KIND = { design: "Experimental design", interpretation: "Interpretation", viva: "Viva", calculation: "Calculation" } as const;

/** Viva and interpretation questions with immediate feedback. The first answer counts. */
export function Assessment<S, A>({ def, run, onAnswer, onSubmit }: { def: ExperimentDefinition<S, A>; run: Run<S>; onAnswer(qid: string, choice: number): void; onSubmit(): void }) {
  const answered = Object.keys(run.answers).length;
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-brandBlue">Assessment</p>
        <h2 className="mt-1 text-2xl font-extrabold text-[#16181d]">Viva and interpretation</h2>
        <p className="mt-1 text-sm text-[#4a4f57]">Your first answer to each question counts. The explanation appears as soon as you answer.</p>
      </div>
      {def.questions.map((q, i) => {
        const chosen = run.answers[q.id];
        const locked = chosen !== undefined;
        return (
          <fieldset key={q.id} className="rounded-2xl border border-[#16181d]/10 bg-white p-4">
            <legend className="sr-only">Question {i + 1}</legend>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8a9099]">
              {i + 1}. {KIND[q.kind]}
            </p>
            <p className="mt-1 font-semibold text-[#16181d]">{q.prompt}</p>
            <div className="mt-3 grid gap-1.5">
              {q.options.map((o, k) => {
                const isRight = k === q.answer;
                const isChosen = k === chosen;
                return (
                  <button
                    key={o}
                    type="button"
                    disabled={locked}
                    onClick={() => onAnswer(q.id, k)}
                    className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                      locked ? (isRight ? "border-brandGreen bg-brandGreen/10" : isChosen ? "border-red-300 bg-red-50" : "border-[#16181d]/10 opacity-70") : "border-[#16181d]/12 hover:border-brandBlue/50"
                    }`}
                  >
                    {locked && isRight && <CheckCircle2 className="h-4 w-4 shrink-0 text-brandGreen" aria-label="Correct answer" />}
                    {locked && isChosen && !isRight && <XCircle className="h-4 w-4 shrink-0 text-red-600" aria-label="Your answer" />}
                    <span>{o}</span>
                  </button>
                );
              })}
            </div>
            {locked && (
              <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${chosen === q.answer ? "bg-brandGreen/10 text-[#137a52]" : "bg-amber-50 text-amber-900"}`} aria-live="polite">
                {chosen === q.answer ? "Correct. " : "Not quite. "}
                {q.explanation}
              </p>
            )}
          </fieldset>
        );
      })}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#16181d]/10 bg-white p-4">
        <p className="text-sm text-[#4a4f57]">{answered} of {def.questions.length} answered</p>
        <Btn variant="primary" onClick={onSubmit} disabled={answered < def.questions.length}>Submit and see results</Btn>
      </div>
    </div>
  );
}
