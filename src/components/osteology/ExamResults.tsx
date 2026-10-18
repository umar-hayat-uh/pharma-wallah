"use client";

/**
 * After an exam: score and percentage, right/wrong/blank, weak areas by bone, joint,
 * landmark and question type (each linked to its lesson), and every station reviewed
 * with the student's answer, the correct one and why.
 */
import { useState } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPE_LABEL, type QType } from "@/lib/osteology/exam-config";
import { QuestionCard, type ClientQuestion } from "./QuestionCard";
import type { ExamResult } from "./ExamRunner";

export function ExamResults({ result, questions, title, onRestart }: { result: ExamResult; questions: ClientQuestion[]; title: string; onRestart: () => void }) {
  const [filter, setFilter] = useState<"missed" | "all">("missed");
  const pct = result.total ? Math.round((result.correct / result.total) * 100) : 0;
  const blank = result.total - result.attempted;
  const wrong = result.attempted - result.correct;
  const items = result.items.filter((it) => filter === "all" || !it.isCorrect);
  const mins = Math.floor(result.timeTakenSec / 60);
  const secs = result.timeTakenSec % 60;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#16181d]/10 bg-white p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6b7079]">{title} · results</p>
        <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-3">
          <p className="text-5xl font-bold tracking-tight">{result.marks}<span className="text-2xl text-[#6b7079]"> / {result.maxMarks}</span></p>
          <p className="text-2xl font-semibold text-brandBlue">{pct}%</p>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Correct" value={result.correct} tone="text-brandGreen" />
          <Stat label="Incorrect" value={wrong} tone="text-red-600" />
          <Stat label="Unanswered" value={blank} />
          <Stat label="Time used" value={`${mins}:${String(secs).padStart(2, "0")}`} />
        </dl>
        <p className="mt-4 text-sm text-[#4a4f57]">
          {result.late
            ? "This paper was submitted after its time limit, so it is marked but not saved to your history."
            : result.recorded
              ? "Saved to your account's exam history."
              : result.signedIn
                ? "Saved on this device (this paper had already been recorded)."
                : "Saved on this device. Sign in to keep exam history across devices."}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onRestart} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brandBlue px-5 font-semibold text-white">
            <RotateCcw className="h-4 w-4" aria-hidden /> Another exam
          </button>
          <Link href="/osteology-lab/progress" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#16181d]/15 px-5 font-semibold">My progress</Link>
        </div>
      </section>

      {(result.weak.topics.length > 0 || result.weak.types.length > 0) && (
        <section aria-labelledby="weak-h" className="rounded-2xl border border-[#16181d]/10 bg-white p-6">
          <h2 id="weak-h" className="text-lg font-bold">What to revise</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-[#5b616b]">By bone and joint</h3>
              <ul className="pw-osteo-list mt-2 space-y-2">
                {result.weak.topics.slice(0, 8).map((t) => (
                  <li key={t.key} className="flex items-center justify-between gap-3">
                    {t.href ? <Link href={t.href} className="font-semibold text-brandBlue underline-offset-2 hover:underline">{t.label}</Link> : <span>{t.label}</span>}
                    <span className="text-sm text-[#5b616b]">{t.wrong} of {t.asked} missed</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#5b616b]">By question type</h3>
              <ul className="pw-osteo-list mt-2 space-y-2">
                {result.weak.types.map((t) => (
                  <li key={t.key} className="flex items-center justify-between gap-3">
                    <span>{TYPE_LABEL[t.key as QType] ?? t.key}</span>
                    <span className="text-sm text-[#5b616b]">{t.wrong} of {t.asked} missed</span>
                  </li>
                ))}
              </ul>
              {result.weak.landmarks.length > 0 && (
                <>
                  <h3 className="mt-4 text-sm font-semibold text-[#5b616b]">Landmarks you missed</h3>
                  <p className="mt-1 text-sm">{result.weak.landmarks.join(" · ")}</p>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="review-h">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="review-h" className="text-lg font-bold">Review</h2>
          <div className="inline-flex overflow-hidden rounded-xl border border-[#16181d]/12" role="group" aria-label="Which stations to show">
            {(["missed", "all"] as const).map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("min-h-11 px-4 text-sm font-semibold", filter === f ? "bg-[#16181d] text-white" : "bg-white")}>
                {f === "missed" ? `Missed (${result.total - result.correct})` : `All (${result.total})`}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-4">
          {items.map((it) => (
            <QuestionCard
              key={it.index}
              q={questions[it.index] ?? it}
              chosen={it.chosen}
              onChoose={() => {}}
              disabled
              feedback={{ correct: it.isCorrect, answer: it.answer, explanation: it.explanation, learnHref: it.learnHref }}
              heading={<span className="text-sm text-[#5b616b]">Station {it.index + 1}{it.chosen === null ? " · not answered" : ""}</span>}
            />
          ))}
          {items.length === 0 && <p className="rounded-2xl bg-[#effaf4] p-6 text-center font-semibold text-[#0f5132]">Nothing missed — every station correct.</p>}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[#6b7079]">{label}</dt>
      <dd className={cn("mt-1 text-2xl font-bold tabular-nums", tone)}>{value}</dd>
    </div>
  );
}
