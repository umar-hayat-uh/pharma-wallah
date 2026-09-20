"use client";

// ============================================================
// After the case: what happened, and what to take from it
// ============================================================
//
// A score on its own teaches a student to feel good or bad, not to practise
// differently. So every error here carries the reason it matters, and the
// debrief opens with the most serious thing rather than with a percentage.

import React from "react";
import { ArrowRight, Award, CheckCircle2, Clock, Home, RotateCcw } from "lucide-react";

import type { CompetencyId, Finding, PerformanceReport, Scenario } from "./types";
import { Button, Callout, Panel, RiskChip } from "./kit";
import { RISK_BANDS, concernLabel } from "./data/constants";
import { DialogueSummary } from "./modules/CounsellingModule";
import { cn } from "@/lib/utils";

/** Which competencies a drill legitimately reports on. */
const DRILL_COMPETENCIES: Record<string, CompetencyId[]> = {
  selection: ["medicine-selection", "dose-verification"],
  counselling: ["counselling", "communication"],
};

export function Debrief({
  report,
  scenario,
  identified,
  missed,
  dialogueAnswers,
  drill,
  onHome,
  onReplay,
  onNext,
  hasNext,
}: {
  report: PerformanceReport;
  scenario: Scenario;
  identified: Finding[];
  missed: Finding[];
  dialogueAnswers: { turnId: string; optionId: string }[];
  drill: string | null;
  onHome: () => void;
  onReplay: () => void;
  onNext: () => void;
  hasNext: boolean;
}) {
  const allowed = drill ? DRILL_COMPETENCIES[drill] : null;
  const competencies = report.competencies.filter((c) => c.max > 0 && (!allowed || allowed.indexOf(c.id) !== -1));
  const overall = competencies.length ? Math.round(competencies.reduce((s, c) => s + c.percent, 0) / competencies.length) : 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Case {String(report.caseNumber).padStart(4, "0")} · complete
        </p>
        <h1 className="mt-2 text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-slate-900 sm:text-[32px]">
          {report.scenarioTitle}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RiskChip level={report.criticalMissed ? "critical" : overall >= 80 ? "ok" : "review"}>{overall}% overall</RiskChip>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] font-bold text-slate-600">
            <Clock className="h-3 w-3" /> {report.minutesTaken} min
          </span>
          {drill && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11.5px] font-bold text-slate-500">
              Drill — earlier steps were completed for you
            </span>
          )}
        </div>
      </header>

      {/* The most serious thing first. */}
      {report.criticalMissed && (
        <div className="mt-5">
          <Callout level="critical" title="Something in this case would have reached the patient">
            A critical problem was not caught. Read it below before the percentages — the score is the least important
            thing on this page.
          </Callout>
        </div>
      )}

      {/* Competencies */}
      <Panel className="mt-5" eyebrow="Performance" title="Competencies this case exercised">
        <ul className="space-y-3">
          {competencies.map((c) => (
            <li key={c.id}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-semibold text-slate-700">{c.label}</span>
                <span className="text-[13px] font-extrabold tabular-nums text-slate-900">{c.percent}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-700", c.percent >= 80 ? "bg-brandGreen" : c.percent >= 60 ? "bg-amber-400" : "bg-rose-500")}
                  style={{ width: `${c.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
        {report.competencies.some((c) => c.max === 0) && (
          <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
            Competencies this case did not exercise are left out rather than scored as zero.
          </p>
        )}
      </Panel>

      {/* What went wrong, and why it matters */}
      <Panel className="mt-4" eyebrow="Learning points" title={report.errors.length ? `${report.errors.length} thing${report.errors.length === 1 ? "" : "s"} to take away` : "Nothing went wrong"}>
        {report.errors.length === 0 ? (
          <Callout level="ok" title="A clean encounter">
            Nothing in this case was missed, mis-selected or left undocumented.
          </Callout>
        ) : (
          <ul className="space-y-3">
            {report.errors.map((e) => (
              <li key={e.id} className={cn("rounded-xl border px-3.5 py-3", RISK_BANDS[e.severity].surface)}>
                <div className="flex flex-wrap items-center gap-2">
                  <RiskChip level={e.severity} />
                  <span className="text-[13.5px] font-bold">{e.title}</span>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed">{e.detail}</p>
                <p className="mt-2 rounded-lg bg-white/60 px-3 py-2 text-[12.5px] leading-relaxed">
                  <strong>Why it matters:</strong> {e.learningPoint}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* What went right */}
      {report.strengths.length > 0 && (
        <Panel className="mt-4" eyebrow="Done well" title="What you got right">
          <ul className="space-y-2">
            {report.strengths.map((s) => (
              <li key={s} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brandGreen" />
                {s}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {/* The answer key, in full, now that it can do no harm */}
      {scenario.findings.length > 0 && (
        <Panel className="mt-4" eyebrow="The case" title="Everything that was in this prescription">
          <ul className="space-y-3">
            {scenario.findings.map((f) => {
              const found = identified.indexOf(f) !== -1;
              return (
                <li key={f.id} className="rounded-xl border border-slate-200 px-3.5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskChip level={f.severity} />
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em]",
                        found ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800",
                      )}
                    >
                      {found ? "You found it" : "Missed"}
                    </span>
                    <span className="text-[11.5px] text-slate-400">{concernLabel(f.checkId, f.concernId)}</span>
                  </div>
                  <p className="mt-1.5 text-[13.5px] font-bold leading-snug text-slate-900">{f.title}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{f.detail}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
                    <strong>Action:</strong> {f.action}
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">{f.learningPoint}</p>
                </li>
              );
            })}
          </ul>
          {missed.length === 0 && (
            <p className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-emerald-700">
              <Award className="h-4 w-4" /> Every problem in this case was identified.
            </p>
          )}
        </Panel>
      )}

      {/* The conversation */}
      {scenario.dialogue.length > 0 && (
        <Panel className="mt-4" eyebrow="At the window" title="How you answered the patient">
          <DialogueSummary turns={scenario.dialogue} answers={dialogueAnswers} />
          <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
            Responses are judged on accuracy, safety, communication, professionalism and completeness. An answer can be
            factually right and still fail on two of those.
          </p>
        </Panel>
      )}

      {/* The case can be reproduced exactly. */}
      <p className="mt-4 text-[11.5px] text-slate-400">
        Case seed {scenario.seed} · template <code className="font-mono">{scenario.templateId}</code>. The same seed
        reproduces this case exactly, so it can be replayed and discussed.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onHome}>
          <Home className="h-4 w-4" /> Back to the pharmacy
        </Button>
        <Button variant="secondary" onClick={onReplay}>
          <RotateCcw className="h-4 w-4" /> Replay this case
        </Button>
        {hasNext && (
          <Button onClick={onNext}>
            Next case <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
