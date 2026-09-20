"use client";

// ============================================================
// Before the counter: what the student can do here
// ============================================================
//
// Every card on this screen does something real. Where a route is a drill
// rather than a full encounter it says so on the card, because a student who
// thinks they completed a case when they skipped the assessment has learned
// the wrong thing about their own competence.

import React, { useMemo, useState } from "react";
import {
  Boxes,
  CircleHelp,
  ClipboardList,
  FlaskConical,
  LineChart,
  PlayCircle,
  RotateCcw,
  Stethoscope,
  Tag,
} from "lucide-react";

import type { CaseResult, ScenarioTemplate, Stage } from "./types";
import { Button, Panel, RiskChip } from "./kit";
import { SCENARIOS, TIER_COPY } from "./data/scenarios";
import { PATIENT_INDEX } from "./data/patients";
import { COMPETENCIES } from "./data/constants";
import { PatientFigure } from "./environment/objects";
import { cn } from "@/lib/utils";

interface HomeAction {
  id: string;
  label: string;
  blurb: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}

export function HomeScreen({
  results,
  onStart,
  onDrill,
  onOpenPanel,
  onReset,
  nextCaseNumber,
  resumable,
  onResume,
  onDiscardSession,
}: {
  results: CaseResult[];
  onStart: (templateId: string) => void;
  onDrill: (templateId: string, stage: Stage) => void;
  onOpenPanel: (panel: "inventory" | "references" | "help") => void;
  onReset: () => void;
  nextCaseNumber: number;
  /** A case interrupted by a reload, if there is one. */
  resumable: { scenario: { title: string; caseNumber: number } | null; stage: string } | null;
  onResume: () => void;
  onDiscardSession: () => void;
}) {
  const [showPerformance, setShowPerformance] = useState(false);

  const completedIds = useMemo(() => results.map((r) => r.templateId), [results]);
  const nextCase = useMemo(() => SCENARIOS.find((s) => completedIds.indexOf(s.id) === -1) || SCENARIOS[0], [completedIds]);
  const nextOtc = useMemo(
    () => SCENARIOS.filter((s) => s.kind === "otc").find((s) => completedIds.indexOf(s.id) === -1) || SCENARIOS.filter((s) => s.kind === "otc")[0],
    [completedIds],
  );
  const rxForDrill = useMemo(() => SCENARIOS.filter((s) => s.kind === "rx")[0], []);

  const actions: HomeAction[] = [];

  if (resumable && resumable.scenario) {
    actions.push({
      id: "continue",
      label: "Continue your case",
      blurb: `${resumable.scenario.title} — picked up where you left off.`,
      icon: RotateCcw,
      primary: true,
      onClick: onResume,
    });
  }

  actions.push(
    {
      id: "start",
      label: "Start a new case",
      blurb: `Next up: ${nextCase.title}. The whole encounter, end to end.`,
      icon: PlayCircle,
      primary: !resumable,
      onClick: () => onStart(nextCase.id),
    },
    {
      id: "otc",
      label: "Minor ailment consultation",
      blurb: "Someone walks in without a prescription. Assess, then decide whether it is yours to treat.",
      icon: Stethoscope,
      onClick: () => onStart(nextOtc.id),
    },
    {
      id: "dispensing",
      label: "Dispensing drill",
      blurb: "Shelf, batch, quantity, tray, label and final check only.",
      icon: Tag,
      badge: "Drill",
      onClick: () => onDrill(rxForDrill.id, "selection"),
    },
    {
      id: "counselling",
      label: "Counselling drill",
      blurb: "Straight to the eight checkpoints and the patient's questions.",
      icon: ClipboardList,
      badge: "Drill",
      onClick: () => onDrill(rxForDrill.id, "counselling"),
    },
    {
      id: "inventory",
      label: "Inventory and expiry",
      blurb: "Stock levels, batches, reorder points and the date check — without a patient waiting.",
      icon: Boxes,
      onClick: () => onOpenPanel("inventory"),
    },
    {
      id: "references",
      label: "Reference desk",
      blurb: "Drug information, contraindications and counselling points for everything on the shelves.",
      icon: FlaskConical,
      onClick: () => onOpenPanel("references"),
    },
    {
      id: "performance",
      label: "My performance",
      blurb: results.length ? `${results.length} case${results.length === 1 ? "" : "s"} completed.` : "Nothing completed yet.",
      icon: LineChart,
      onClick: () => setShowPerformance((v) => !v),
      disabled: false,
    },
    {
      id: "help",
      label: "How the counter works",
      blurb: "The workflow, what is scored and what is not.",
      icon: CircleHelp,
      onClick: () => onOpenPanel("help"),
    },
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-brandBlue/[0.08] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brandBlue">
          <Stethoscope className="h-3.5 w-3.5" aria-hidden />
          Community pharmacy · simulation lab
        </p>
        <h1 className="mt-3 text-[28px] font-extrabold leading-[1.08] tracking-[-0.02em] text-slate-900 sm:text-[38px]">
          Stand behind the counter.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
          Receive a prescription, read the patient's record, run the clinical checks yourself, pick the right pack from
          the right batch, label it, counsel the person in front of you and write the record. Ten cases, from a routine
          course of antibiotics to the ones that belong to a doctor rather than a pharmacist.
        </p>
      </header>

      {/* What you can do */}
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={a.onClick}
              disabled={a.disabled}
              className={cn(
                "group flex h-full w-full flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2",
                a.primary
                  ? "border-brandBlue bg-brandBlue text-white hover:bg-[#1668b8]"
                  : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_30px_-22px_rgba(15,23,42,0.6)]",
              )}
            >
              <span className="flex w-full items-start justify-between gap-2">
                <a.icon className={cn("h-5 w-5", a.primary ? "text-white" : "text-brandBlue")} />
                {a.badge && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]",
                      a.primary ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {a.badge}
                  </span>
                )}
              </span>
              <span className={cn("text-[14.5px] font-bold leading-tight", a.primary ? "text-white" : "text-slate-900")}>{a.label}</span>
              <span className={cn("text-[12.5px] leading-relaxed", a.primary ? "text-white/85" : "text-slate-500")}>{a.blurb}</span>
            </button>
          </li>
        ))}
      </ul>

      {resumable && resumable.scenario && (
        <p className="mt-3 text-[12.5px] text-slate-500">
          An unfinished case is saved in this browser.{" "}
          <button
            type="button"
            onClick={onDiscardSession}
            className="font-bold text-slate-700 underline underline-offset-2 hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
          >
            Discard it
          </button>
          .
        </p>
      )}

      {/* Performance */}
      {showPerformance && (
        <div className="cph-enter mt-6">
          <PerformanceHistory results={results} onReset={onReset} />
        </div>
      )}

      {/* The case ladder */}
      <section className="mt-10">
        <h2 className="text-[19px] font-extrabold leading-tight text-slate-900">Cases</h2>
        <p className="mt-1 text-[13.5px] leading-relaxed text-slate-600">
          Take them in any order. Each one generates from a fixed seed, so a case can be replayed exactly and discussed
          with a tutor afterwards.
        </p>

        <ul className="mt-5 space-y-3">
          {SCENARIOS.map((template) => (
            <CaseRow
              key={template.id}
              template={template}
              result={results.filter((r) => r.templateId === template.id).slice(-1)[0]}
              onStart={() => onStart(template.id)}
            />
          ))}
        </ul>
      </section>

      <p className="mt-10 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[12.5px] leading-relaxed text-slate-500">
        <strong className="text-slate-700">For educational use only.</strong> Every patient, prescription, batch number
        and price here is fictional. Doses, interactions and counselling points are teaching values chosen to make the
        workflow learnable — they do not replace the current formulary, the product literature, or the judgement of a
        registered pharmacist.
      </p>

      <p className="mt-3 text-[12px] text-slate-400">Next case number: {String(nextCaseNumber).padStart(4, "0")}</p>
    </div>
  );
}

function CaseRow({ template, result, onStart }: { template: ScenarioTemplate; result?: CaseResult; onStart: () => void }) {
  const patient = PATIENT_INDEX[template.patientId];
  const tier = TIER_COPY[template.tier];
  return (
    <li>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:border-slate-300">
        {patient && <PatientFigure {...patient.avatar} name={patient.name} size={44} className="shrink-0" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {tier ? tier.label : template.tier}
            </span>
            {template.kind === "otc" && (
              <span className="rounded-full border border-brandGreen/30 bg-brandGreen/[0.08] px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-emerald-700">
                No prescription
              </span>
            )}
            {result && (
              <RiskChip level={result.criticalMissed ? "critical" : result.overallPercent >= 80 ? "ok" : "review"}>
                {result.overallPercent}%
              </RiskChip>
            )}
          </div>
          <p className="mt-1 text-[14px] font-bold leading-tight text-slate-900">{template.title}</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-slate-500">{template.brief}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-[11.5px] text-slate-400 sm:block">~{template.expectedMinutes} min</span>
          <Button variant={result ? "secondary" : "primary"} size="sm" onClick={onStart}>
            {result ? "Replay" : "Start"}
          </Button>
        </div>
      </div>
    </li>
  );
}

function PerformanceHistory({ results, onReset }: { results: CaseResult[]; onReset: () => void }) {
  const averages = useMemo(() => {
    return COMPETENCIES.map((c) => {
      const scores = results.map((r) => (r.competencies.find((x) => x.id === c.id) || { percent: -1 }).percent).filter((p) => p >= 0);
      return { id: c.id, label: c.label, percent: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null };
    });
  }, [results]);

  if (results.length === 0) {
    return (
      <Panel eyebrow="My performance" title="Nothing completed yet">
        <p className="text-[13px] leading-relaxed text-slate-600">
          Finish a case and your competency profile appears here. It is kept in this browser only — nothing is sent
          anywhere.
        </p>
      </Panel>
    );
  }

  return (
    <Panel
      eyebrow="My performance"
      title={`${results.length} case${results.length === 1 ? "" : "s"} completed`}
      actions={
        <Button size="sm" variant="ghost" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" /> Clear progress
        </Button>
      }
    >
      <ul className="space-y-2.5">
        {averages.map((a) => (
          <li key={a.id} className="flex items-center gap-3">
            <span className="w-[150px] shrink-0 text-[12.5px] font-semibold text-slate-600">{a.label}</span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              {a.percent !== null && (
                <span
                  className={cn("block h-full rounded-full", a.percent >= 80 ? "bg-brandGreen" : a.percent >= 60 ? "bg-amber-400" : "bg-rose-500")}
                  style={{ width: `${a.percent}%` }}
                />
              )}
            </span>
            <span className="w-[54px] shrink-0 text-right text-[12.5px] font-bold tabular-nums text-slate-700">
              {a.percent === null ? "—" : `${a.percent}%`}
            </span>
          </li>
        ))}
      </ul>

      <h4 className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Recent cases</h4>
      <ul className="mt-2 space-y-1.5">
        {results
          .slice()
          .reverse()
          .slice(0, 6)
          .map((r) => (
            <li key={`${r.caseNumber}-${r.templateId}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
              <span className="min-w-0 text-[12.5px] font-semibold text-slate-800">
                #{String(r.caseNumber).padStart(3, "0")} {r.scenarioTitle}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[11.5px] text-slate-400">{r.minutesTaken} min</span>
                <RiskChip level={r.criticalMissed ? "critical" : r.overallPercent >= 80 ? "ok" : "review"}>{r.overallPercent}%</RiskChip>
              </span>
            </li>
          ))}
      </ul>
    </Panel>
  );
}
