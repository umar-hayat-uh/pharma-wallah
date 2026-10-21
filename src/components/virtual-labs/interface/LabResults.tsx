"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Printer, RotateCcw, XCircle } from "lucide-react";
import type { FinalReport } from "@/lib/virtual-labs/engine/machine";
import type { LabMeta, LabMode } from "@/lib/virtual-labs/engine/types";
import { ObservationSheet } from "./ObservationSheet";
import { Btn, Pill } from "./ui";

/** The results summary and printable report — every figure comes from the run itself. */
export function LabResults({ meta, report, seed, onRetry }: { meta: LabMeta; report: FinalReport; seed: number; onRetry(mode?: LabMode): void }) {
  const r = report;
  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      <div className="vl-report rounded-3xl border border-[#16181d]/10 bg-white p-5 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-brandBlue">Results summary · {meta.labName}</p>
        <h2 className="mt-1 text-2xl font-extrabold text-[#16181d] sm:text-3xl">{meta.experimentTitle}</h2>
        <p className="mt-2 text-lg font-semibold text-[#16181d]">{r.experiment.headline}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Overall" value={`${r.overall}%`} sub={r.grade} strong />
          <Stat label="Technique" value={`${r.technique}/100`} sub={`${r.mistakes.length} mistake${r.mistakes.length === 1 ? "" : "s"}`} />
          <Stat label="Assessment" value={`${r.assessment.correct}/${r.assessment.total}`} sub={`${r.assessment.percent}%`} />
          <Stat label="Hints used" value={String(r.hintsUsed)} sub={r.hintPenalty ? `−${r.hintPenalty} technique` : "no penalty"} />
        </div>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#8a9099]">
          <Pill tone={r.assessed ? "blue" : "neutral"}>{r.assessed ? "Practical mode — independent run" : "Learning mode — practice"}</Pill>
          Run seed {seed} · simulated practice, not an assessed university practical.
        </p>
      </div>

      <Block title="Outcome">
        <ul className="vl-list divide-y divide-[#16181d]/[0.06]">
          {r.experiment.outcome.map((o) => (
            <li key={o.label} className="flex items-center gap-3 py-2 text-sm">
              {o.verdict === "pass" ? <CheckCircle2 className="h-4 w-4 shrink-0 text-brandGreen" aria-label="Pass" /> : o.verdict === "fail" ? <XCircle className="h-4 w-4 shrink-0 text-red-600" aria-label="Outside" /> : <span className="h-4 w-4 shrink-0" />}
              <span className="flex-1 text-[#4a4f57]">{o.label}</span>
              <span className="font-semibold tabular-nums text-[#16181d]">{o.value}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Calculations">
        <ul className="vl-list space-y-2">
          {r.experiment.calculations.map((c) => (
            <li key={c.label} className="rounded-xl bg-[#16181d]/[0.03] px-3 py-2 text-sm">
              <span className="font-semibold">{c.label}: </span>
              <span className="font-mono text-[13px] text-[#3a3f47]">{c.expression}</span>
              <span className="font-semibold"> = {c.result}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title={`Technique — ${r.mistakes.length ? "what to improve" : "no mistakes recorded"}`}>
        {r.mistakes.length === 0 ? (
          <p className="text-sm text-[#137a52]">Every step was performed correctly.</p>
        ) : (
          <ul className="vl-list space-y-2">
            {r.mistakes.map((m) => (
              <li key={m.id} className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-sm text-amber-950">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  {m.consequence} <span className="text-xs text-amber-800">(−{m.weight})</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <Block title="Your answers">
        <ul className="vl-list space-y-2">
          {r.questions.map((q) => (
            <li key={q.id} className="rounded-xl border border-[#16181d]/10 px-3 py-2 text-sm">
              <p className="font-semibold">{q.prompt}</p>
              <p className="mt-1">
                <Pill tone={q.right ? "green" : "red"}>{q.right ? "Correct" : "Incorrect"}</Pill> <span className="text-[#3a3f47]">You: {q.chosen}</span>
                {!q.right && <span className="text-[#3a3f47]"> · Answer: {q.correct}</span>}
              </p>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Learning points">
        <ul className="vl-bullets space-y-1 text-sm text-[#3a3f47]">{r.experiment.learning.map((l) => <li key={l}>{l}</li>)}</ul>
      </Block>

      <Block title="Observation sheet">
        <ObservationSheet sections={r.observations} log={[]} />
      </Block>

      <div className="vl-noprint flex flex-wrap gap-3">
        <Btn variant="primary" onClick={() => onRetry()}>
          <RotateCcw className="h-4 w-4" aria-hidden />Retry with a new sample
        </Btn>
        {!r.assessed && <Btn onClick={() => onRetry("practical")}>Now try it in Practical mode</Btn>}
        <Btn onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden />Print or save as PDF
        </Btn>
        <Link href="/virtual-labs" className="inline-flex min-h-11 items-center rounded-xl px-4 font-semibold text-brandBlue hover:bg-brandBlue/5">All labs</Link>
      </div>
    </div>
  );
}

function Stat({ label, value, sub, strong }: { label: string; value: string; sub: string; strong?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${strong ? "border-brandGreen/40 bg-brandGreen/[0.06]" : "border-[#16181d]/10"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a9099]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#16181d]">{value}</p>
      <p className="text-xs text-[#4a4f57]">{sub}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="vl-report rounded-2xl border border-[#16181d]/10 bg-white p-4 sm:p-5">
      <h3 className="mb-3 text-base font-bold text-[#16181d]">{title}</h3>
      {children}
    </section>
  );
}
