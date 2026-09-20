"use client";

// ============================================================
// Counselling the patient, and answering what they ask
// ============================================================
//
// Eight checkpoints, then whatever the patient wants to know.
//
// Each checkpoint mixes the statements that belong with plausible ones that do
// not, so choosing well is a judgement rather than picking the only sentence on
// screen. Feedback arrives as soon as a checkpoint is confirmed — the student
// finds out at the counter, which is when it is still useful.

import React, { useMemo, useState } from "react";
import { Check, MessageCircle, X } from "lucide-react";

import type { CounsellingSelection, CounsellingTopic, DialogueTurn, Medicine, Patient } from "../types";
import { Button, Callout, Choice, Panel, RiskChip } from "../kit";
import { COUNSELLING_TOPICS } from "../data/constants";
import { PatientFigure } from "../environment/objects";
import { DIALOGUE_DIMENSIONS, gradeTopic, topicOptions } from "../engine/counselling";
import { hashString, makeRng } from "../engine/rng";
import { cn } from "@/lib/utils";

export function CounsellingCheckpoints({
  m,
  seed,
  selections,
  done,
  onChange,
  onConfirm,
}: {
  m: Medicine;
  seed: number;
  selections: CounsellingSelection[];
  done: CounsellingTopic[];
  onChange: (topic: CounsellingTopic, chosen: string[]) => void;
  onConfirm: (topic: CounsellingTopic) => void;
}) {
  const [openTopic, setOpenTopic] = useState<CounsellingTopic>(COUNSELLING_TOPICS[0].id);

  return (
    <div className="space-y-3">
      <Callout level="review" title="Say the things that matter, and nothing that is untrue">
        Every checkpoint has more than one statement that belongs, and at least one that sounds right and is not.
      </Callout>

      <div className="flex flex-wrap gap-1.5">
        {COUNSELLING_TOPICS.map((t) => {
          const complete = done.indexOf(t.id) !== -1;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setOpenTopic(t.id)}
              aria-pressed={openTopic === t.id}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue",
                openTopic === t.id
                  ? "border-brandBlue bg-brandBlue text-white"
                  : complete
                    ? "border-brandGreen/40 bg-brandGreen/[0.08] text-emerald-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              {complete && <Check className="h-3 w-3" strokeWidth={3} />}
              {t.label}
            </button>
          );
        })}
      </div>

      {COUNSELLING_TOPICS.filter((t) => t.id === openTopic).map((t) => (
        <Checkpoint
          key={t.id}
          topic={t.id}
          label={t.label}
          question={t.question}
          m={m}
          seed={seed}
          chosen={(selections.find((s) => s.topic === t.id) || { chosen: [] }).chosen}
          confirmed={done.indexOf(t.id) !== -1}
          onChange={(chosen) => onChange(t.id, chosen)}
          onConfirm={() => onConfirm(t.id)}
        />
      ))}
    </div>
  );
}

function Checkpoint({
  topic,
  label,
  question,
  m,
  seed,
  chosen,
  confirmed,
  onChange,
  onConfirm,
}: {
  topic: CounsellingTopic;
  label: string;
  question: string;
  m: Medicine;
  seed: number;
  chosen: string[];
  confirmed: boolean;
  onChange: (chosen: string[]) => void;
  onConfirm: () => void;
}) {
  // Seeded from the case and the topic, so the order is stable across renders
  // and reproducible for a given case — never `Math.random()`.
  const options = useMemo(() => topicOptions(m, topic, makeRng(seed ^ hashString(topic))), [m, topic, seed]);
  const grade = confirmed ? gradeTopic(m, topic, chosen) : null;

  return (
    <Panel eyebrow={label} title={question} description={`About ${m.brand} ${m.strength}.`}>
      <div className="space-y-2">
        {options.map((option) => {
          const picked = chosen.indexOf(option) !== -1;
          const isRight = m.counselling[topic].points.indexOf(option) !== -1;
          return (
            <div key={option} className="relative">
              <Choice
                multi
                selected={picked}
                disabled={confirmed}
                onSelect={() => onChange(picked ? chosen.filter((c) => c !== option) : chosen.concat(option))}
                title={option}
                className={cn(
                  confirmed && isRight && "border-emerald-300 bg-emerald-50",
                  confirmed && picked && !isRight && "border-rose-300 bg-rose-50",
                )}
              />
              {confirmed && (isRight || picked) && (
                <span className="pointer-events-none absolute right-3 top-3">
                  {isRight ? <Check className="h-4 w-4 text-emerald-600" strokeWidth={3} /> : <X className="h-4 w-4 text-rose-600" strokeWidth={3} />}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {!confirmed ? (
        <Button className="mt-3" onClick={onConfirm} disabled={chosen.length === 0}>
          Say this to the patient
        </Button>
      ) : (
        <div className="mt-3 space-y-2">
          {grade && grade.wrong.length > 0 && (
            <Callout level="critical" title="You told the patient something that is not right">
              A wrong statement leaves the pharmacy with them and gets acted on. The statements marked in red above do
              not belong to this medicine.
            </Callout>
          )}
          {grade && grade.missed.length > 0 && (
            <Callout level="caution" title={`${grade.missed.length} point${grade.missed.length === 1 ? "" : "s"} not covered`}>
              The statements marked in green are the ones that belong here. Omitting one is not neutral — it is advice
              the patient now does not have.
            </Callout>
          )}
          {grade && grade.wrong.length === 0 && grade.missed.length === 0 && (
            <Callout level="ok" title="Complete and accurate">
              Everything that belongs on this checkpoint was covered, and nothing that does not.
            </Callout>
          )}
        </div>
      )}
    </Panel>
  );
}

// ─── The consultation window ─────────────────────────────────────────────────

export function PatientDialogue({
  turns,
  patient,
  answers,
  onAnswer,
}: {
  turns: DialogueTurn[];
  patient: Patient;
  answers: { turnId: string; optionId: string }[];
  onAnswer: (turnId: string, optionId: string) => void;
}) {
  if (turns.length === 0) return null;

  return (
    <div className="space-y-4">
      {turns.map((turn, index) => {
        const answer = answers.find((a) => a.turnId === turn.id);
        const chosen = answer ? turn.options.find((o) => o.id === answer.optionId) : undefined;
        const previousAnswered = index === 0 || answers.some((a) => a.turnId === turns[index - 1].id);
        if (!previousAnswered) return null;

        return (
          <Panel key={turn.id} eyebrow={`At the consultation window · ${index + 1} of ${turns.length}`} title={undefined}>
            <div className="flex items-start gap-3">
              <PatientFigure {...patient.avatar} name={patient.name} size={44} className="shrink-0" />
              <div className="cph-speech min-w-0 flex-1 px-3.5 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brandBlue">{patient.name} asks</p>
                <p className="mt-1 text-[14px] leading-relaxed text-slate-800">{turn.question}</p>
              </div>
            </div>

            <div className="mt-3 space-y-2" role="radiogroup" aria-label="Your response">
              {turn.options.map((option) => (
                <Choice
                  key={option.id}
                  selected={answer ? answer.optionId === option.id : false}
                  disabled={!!answer}
                  onSelect={() => onAnswer(turn.id, option.id)}
                  title={option.text}
                  className={cn(
                    answer && option.scores.accuracy + option.scores.safety >= 4 && "border-emerald-300 bg-emerald-50",
                    answer && answer.optionId === option.id && option.scores.safety === 0 && "border-rose-300 bg-rose-50",
                  )}
                />
              ))}
            </div>

            {chosen && (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                  <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">How that answer reads</p>
                  <ul className="mt-2 space-y-1.5">
                    {DIALOGUE_DIMENSIONS.map((d) => {
                      const v = chosen.scores[d.id];
                      return (
                        <li key={d.id} className="flex items-center gap-2.5">
                          <span className="w-[112px] shrink-0 text-[12px] font-semibold text-slate-600">{d.label}</span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <span
                              className={cn("block h-full rounded-full", v === 2 ? "bg-brandGreen" : v === 1 ? "bg-amber-400" : "bg-rose-500")}
                              style={{ width: `${(v / 2) * 100}%` }}
                            />
                          </span>
                          <span className="w-[62px] shrink-0 text-right text-[11.5px] font-bold text-slate-500">
                            {v === 2 ? "Good" : v === 1 ? "Partial" : "Poor"}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <Callout level={chosen.scores.safety === 0 ? "critical" : chosen.scores.accuracy === 2 ? "ok" : "caution"} icon={MessageCircle} title="Why">
                  {chosen.feedback}
                </Callout>
              </div>
            )}
          </Panel>
        );
      })}
    </div>
  );
}

/** A compact read-out of how the conversation went, for the debrief. */
export function DialogueSummary({ turns, answers }: { turns: DialogueTurn[]; answers: { turnId: string; optionId: string }[] }) {
  return (
    <ul className="space-y-2">
      {turns.map((turn) => {
        const answer = answers.find((a) => a.turnId === turn.id);
        const option = answer ? turn.options.find((o) => o.id === answer.optionId) : undefined;
        const total = option ? DIALOGUE_DIMENSIONS.reduce((s, d) => s + option.scores[d.id], 0) : 0;
        const percent = Math.round((total / 10) * 100);
        return (
          <li key={turn.id} className="rounded-xl border border-slate-200 px-3.5 py-3">
            <p className="text-[12.5px] italic leading-relaxed text-slate-500">“{turn.question}”</p>
            {option ? (
              <>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-800">{option.text}</p>
                <div className="mt-2">
                  <RiskChip level={percent >= 85 ? "ok" : percent >= 60 ? "review" : "critical"}>{percent}%</RiskChip>
                </div>
              </>
            ) : (
              <p className="mt-1.5 text-[12.5px] text-slate-400">Not answered.</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
