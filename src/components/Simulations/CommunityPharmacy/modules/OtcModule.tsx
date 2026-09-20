"use client";

// ============================================================
// Minor ailment consultation: WWHAM, red flags, and the decision
// ============================================================
//
// The whole value of this workflow is that the student assesses before they
// reach for a product. So the shelf is not reachable until the assessment and
// the decision are recorded — the flow enforces it, not a warning message.
//
// The red-flag list is the same eighteen items in every case, so a student
// cannot infer the answer from which flags are offered. They have to read the
// history.

import React from "react";
import { Stethoscope } from "lucide-react";

import type { OtcCase, Patient, WwhamField } from "../types";
import { Button, Callout, Choice, Panel, RiskChip } from "../kit";
import { RED_FLAGS } from "../data/constants";
import { WWHAM_LABELS } from "../engine/counselling";
import { PatientFigure } from "../environment/objects";

export function ComplaintCard({ otc, patient }: { otc: OtcCase; patient: Patient }) {
  return (
    <Panel eyebrow="No prescription" title="What they have come in for">
      <div className="flex items-start gap-3">
        <PatientFigure {...patient.avatar} name={patient.name} size={52} className="shrink-0" />
        <div className="cph-speech min-w-0 flex-1 px-3.5 py-3">
          <p className="text-[14px] leading-relaxed text-slate-800">{otc.complaint}</p>
        </div>
      </div>
      <Callout level="review" title="Assess before you reach for anything">
        The request is for a product. Your job is to establish whether a product is the right answer at all.
      </Callout>
    </Panel>
  );
}

export function WwhamPanel({
  otc,
  answers,
  onAnswer,
  patient,
}: {
  otc: OtcCase;
  answers: { field: WwhamField; optionId: string }[];
  onAnswer: (field: WwhamField, optionId: string) => void;
  patient: Patient;
}) {
  return (
    <div className="space-y-3">
      <Callout level="review" title="WWHAM is the floor, not the ceiling">
        Ask all five. The question that gets skipped is usually the one carrying the red flag.
      </Callout>

      {otc.wwham.map((q, index) => {
        const answer = answers.find((a) => a.field === q.field);
        const previousAnswered = index === 0 || answers.some((a) => a.field === otc.wwham[index - 1].field);
        if (!previousAnswered) return null;
        return (
          <Panel key={q.field} eyebrow={WWHAM_LABELS[q.field]} title={q.prompt}>
            {answer ? (
              <div className="flex items-start gap-3">
                <PatientFigure {...patient.avatar} name={patient.name} size={40} className="shrink-0" />
                <div className="cph-speech min-w-0 flex-1 px-3.5 py-3">
                  <p className="text-[13.5px] leading-relaxed text-slate-800">
                    {(q.options.find((o) => o.id === answer.optionId) || { text: "" }).text}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-2 text-[12px] leading-relaxed text-slate-500">
                  Choose the answer that matches what this patient is telling you.
                </p>
                <div className="space-y-2" role="radiogroup" aria-label={q.prompt}>
                  {q.options.map((o) => (
                    <Choice key={o.id} selected={false} onSelect={() => onAnswer(q.field, o.id)} title={o.text} />
                  ))}
                </div>
              </>
            )}
          </Panel>
        );
      })}
    </div>
  );
}

export function RedFlagPanel({
  marked,
  onToggle,
  onConfirm,
  confirmed,
}: {
  marked: string[];
  onToggle: (id: string) => void;
  onConfirm: () => void;
  confirmed: boolean;
}) {
  return (
    <div className="space-y-3">
      <Callout level="caution" title="Mark only what is actually in this history">
        Referring someone who did not need it has a cost too — their time, the clinic's, and their trust in you next
        time. Marking none is a valid and often correct answer.
      </Callout>

      <Panel eyebrow="Referral criteria" title="Red flags present in this presentation">
        <div className="grid gap-1.5 sm:grid-cols-2">
          {RED_FLAGS.map((f) => (
            <Choice key={f.id} multi selected={marked.indexOf(f.id) !== -1} disabled={confirmed} onSelect={() => onToggle(f.id)} title={f.label} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button onClick={onConfirm} disabled={confirmed}>
            {confirmed ? "Recorded" : `Record ${marked.length} red flag${marked.length === 1 ? "" : "s"}`}
          </Button>
          <span className="text-[12px] text-slate-500">
            {marked.length === 0 ? "Nothing marked — that is an answer, not a blank." : `${marked.length} marked.`}
          </span>
        </div>
      </Panel>
    </div>
  );
}

export function DecisionPanel({
  decided,
  onDecide,
}: {
  decided: "self-care" | "refer" | null;
  onDecide: (outcome: "self-care" | "refer") => void;
}) {
  return (
    <div className="space-y-3">
      <Panel eyebrow="The decision" title="Is this a pharmacy supply or a referral?">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onDecide("self-care")}
            aria-pressed={decided === "self-care"}
            className={`rounded-2xl border-2 px-4 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
              decided === "self-care" ? "border-brandGreen bg-brandGreen/[0.08]" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className="block text-[15px] font-bold text-slate-900">Self-care is appropriate</span>
            <span className="mt-1 block text-[12.5px] leading-relaxed text-slate-500">
              Supply a pharmacy medicine with advice, and say when to come back.
            </span>
          </button>
          <button
            type="button"
            onClick={() => onDecide("refer")}
            aria-pressed={decided === "refer"}
            className={`rounded-2xl border-2 px-4 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 ${
              decided === "refer" ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
              <Stethoscope className="h-4 w-4 text-rose-500" /> Refer to a doctor
            </span>
            <span className="mt-1 block text-[12.5px] leading-relaxed text-slate-500">
              This needs medical assessment. Say how urgently, and help them get there.
            </span>
          </button>
        </div>
        {decided && (
          <Callout level="review" title="Recorded">
            You can still supply something alongside a referral where it helps — rehydration solution, for example. The
            next step lets you choose, or supply nothing.
          </Callout>
        )}
      </Panel>
    </div>
  );
}

/** Supplying (or deliberately not supplying) a product. */
export function OtcProductPanel({
  chosenId,
  onChoose,
  shelf,
  decided,
}: {
  chosenId: string | null;
  onChoose: (medicineId: string | null) => void;
  shelf: React.ReactNode;
  decided: "self-care" | "refer" | null;
}) {
  return (
    <div className="space-y-3">
      {decided === "refer" && (
        <Callout level="caution" title="You have decided to refer">
          Supplying nothing is a legitimate and often correct choice here. Choose a product only if it genuinely helps
          while the patient gets seen.
        </Callout>
      )}
      {shelf}
      <Panel eyebrow="Supply" title="What leaves the counter">
        <div className="flex flex-wrap items-center gap-2">
          <RiskChip level={chosenId ? "ok" : "review"}>{chosenId ? "One product selected" : "Nothing selected yet"}</RiskChip>
          <Button variant="secondary" size="sm" onClick={() => onChoose(null)}>
            Supply nothing
          </Button>
        </div>
      </Panel>
    </div>
  );
}
