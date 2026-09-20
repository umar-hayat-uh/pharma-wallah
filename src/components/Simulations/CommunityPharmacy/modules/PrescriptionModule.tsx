"use client";

// ============================================================
// The prescription: viewer, prescriber, and transcription
// ============================================================
//
// The viewer is a real viewer — zoom, rotate, and a full-screen reading mode —
// because interpreting handwriting at the size it was written is part of the
// task. The transcription step asks the student to write down what they read
// before any product is chosen, which is where a mis-read strength is caught.

import React, { useState } from "react";
import { FileText, Maximize2, RotateCw, Stethoscope, ZoomIn, ZoomOut } from "lucide-react";

import type { Prescription, RxItem, TranscriptionEntry } from "../types";
import { Button, Callout, Dialog, Field, KeyValue, Panel, inputClass } from "../kit";
import { FREQUENCIES } from "../data/constants";
import { formatDate } from "../engine/dates";
import { requiredQuantity } from "../engine/clinical";

// ─── The paper ───────────────────────────────────────────────────────────────

function RxPaper({ prescription, scale, rotation }: { prescription: Prescription; scale: number; rotation: number }) {
  return (
    <div className="overflow-auto rounded-xl bg-slate-100 p-4">
      <div
        className="cph-rx mx-auto w-full max-w-[420px] px-5 py-5 transition-transform"
        style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, transformOrigin: "top center" }}
      >
        <div className="flex items-start justify-between gap-3 border-b border-dashed border-[#ded5bd] pb-3">
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#26303f]">{prescription.prescriber.clinic}</p>
            <p className="text-[11px] text-[#6b6450]">{prescription.prescriber.name} · {prescription.prescriber.qualification}</p>
          </div>
          <p className="shrink-0 text-[11px] text-[#6b6450]">{formatDate(prescription.date)}</p>
        </div>
        <p className="mt-4 text-[26px] font-bold leading-none text-[#26303f]">℞</p>
        <div className="cph-rx-hand mt-2 space-y-1.5 text-[15px] leading-relaxed">
          {prescription.handwritten.map((line, i) => (
            <p key={i} className={prescription.legibility === "poor" ? "opacity-80" : undefined}>
              {line}
            </p>
          ))}
        </div>
        <div className="mt-6 border-t border-dashed border-[#ded5bd] pt-2">
          <p className="text-[10.5px] text-[#6b6450]">Reg. {prescription.prescriber.registration}</p>
        </div>
      </div>
    </div>
  );
}

export function PrescriptionViewer({ prescription }: { prescription: Prescription }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [full, setFull] = useState(false);

  const controls = (
    <div className="flex flex-wrap items-center gap-1.5">
      <Button size="sm" variant="secondary" onClick={() => setScale((s) => Math.max(0.6, Math.round((s - 0.2) * 10) / 10))} aria-label="Zoom out">
        <ZoomOut className="h-3.5 w-3.5" />
      </Button>
      <span className="min-w-[46px] text-center text-[12px] font-bold tabular-nums text-slate-500">{Math.round(scale * 100)}%</span>
      <Button size="sm" variant="secondary" onClick={() => setScale((s) => Math.min(2.4, Math.round((s + 0.2) * 10) / 10))} aria-label="Zoom in">
        <ZoomIn className="h-3.5 w-3.5" />
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setRotation((r) => (r + 90) % 360)} aria-label="Rotate 90 degrees">
        <RotateCw className="h-3.5 w-3.5" />
      </Button>
      <Button size="sm" variant="secondary" onClick={() => setFull(true)} aria-label="Open full screen">
        <Maximize2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );

  return (
    <>
      <Panel eyebrow="Scanned prescription" title={prescription.id} actions={controls}>
        <RxPaper prescription={prescription} scale={scale} rotation={rotation} />
        {prescription.legibility !== "clear" && (
          <p className="mt-3 text-[12px] leading-relaxed text-slate-500">
            Handwriting noted as <strong>{prescription.legibility}</strong>. If you cannot read a word with certainty,
            the answer is to ring the prescriber, not to guess the most likely drug.
          </p>
        )}
      </Panel>

      <Dialog open={full} onClose={() => setFull(false)} title={`Prescription ${prescription.id}`} description="Pinch or use the buttons to read it at size." wide>
        <div className="mb-3">{controls}</div>
        <RxPaper prescription={prescription} scale={scale} rotation={rotation} />
      </Dialog>
    </>
  );
}

export function PrescriberCard({ prescription }: { prescription: Prescription }) {
  return (
    <Panel eyebrow="Prescriber" title={prescription.prescriber.name} description={prescription.prescriber.qualification}>
      <div className="grid gap-x-6 sm:grid-cols-2">
        <KeyValue k="Clinic" v={prescription.prescriber.clinic} />
        <KeyValue k="Registration" v={prescription.prescriber.registration} />
        <KeyValue k="Date written" v={formatDate(prescription.date)} />
        <KeyValue k="Items" v={prescription.items.length} />
      </div>
      <p className="mt-3 flex gap-2 text-[12px] leading-relaxed text-slate-500">
        <Stethoscope className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        Every intervention on this prescription goes back to this prescriber. Their details belong in the record.
      </p>
    </Panel>
  );
}

// ─── Transcription ───────────────────────────────────────────────────────────

/**
 * Write down what is on the paper, before any product is touched.
 *
 * Nothing is auto-filled. The whole value of the step is that the student has
 * to read the four facts separately — drug, strength, frequency, quantity —
 * rather than recognising the prescription as a familiar shape.
 */
export function TranscriptionForm({
  items,
  entries,
  onChange,
  onSubmit,
  submitted,
}: {
  items: RxItem[];
  entries: TranscriptionEntry[];
  onChange: (itemId: string, patch: Partial<TranscriptionEntry>) => void;
  onSubmit: () => void;
  submitted: boolean;
}) {
  return (
    <div className="space-y-4">
      <Callout level="review" title="Read it, then write it">
        Do not copy from memory of what these prescriptions usually say. Read the drug, the strength, the frequency and
        the quantity as four separate facts.
      </Callout>

      {items.map((item, index) => {
        const entry = entries.find((e) => e.itemId === item.id);
        if (!entry) return null;
        return (
          <Panel key={item.id} eyebrow={`Item ${index + 1} of ${items.length}`} title="Transcribe this item">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Drug (generic name)">
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    value={entry.drug}
                    placeholder="e.g. Amoxicillin"
                    onChange={(e) => onChange(item.id, { drug: e.target.value })}
                  />
                )}
              </Field>
              <Field label="Strength">
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    value={entry.strength}
                    placeholder="e.g. 500 mg"
                    onChange={(e) => onChange(item.id, { strength: e.target.value })}
                  />
                )}
              </Field>
              <Field label="Dose per administration" hint="Units taken each time — capsules, tablets or mL.">
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    inputMode="decimal"
                    value={entry.doseUnits}
                    placeholder="e.g. 1"
                    onChange={(e) => onChange(item.id, { doseUnits: e.target.value })}
                  />
                )}
              </Field>
              <Field label="Frequency">
                {(id) => (
                  <select id={id} className={inputClass} value={entry.frequencyCode} onChange={(e) => onChange(item.id, { frequencyCode: e.target.value })}>
                    <option value="">Select…</option>
                    {FREQUENCIES.map((f) => (
                      <option key={f.code} value={f.code}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Quantity written" hint="What the prescriber asked for — not what you think it should be.">
                {(id) => (
                  <input
                    id={id}
                    className={inputClass}
                    inputMode="numeric"
                    value={entry.quantity}
                    placeholder="e.g. 21"
                    onChange={(e) => onChange(item.id, { quantity: e.target.value })}
                  />
                )}
              </Field>
              <div className="flex items-end">
                <p className="text-[12px] leading-relaxed text-slate-500">
                  As written: <span className="font-semibold text-slate-700">{item.written}</span>
                </p>
              </div>
            </div>
          </Panel>
        );
      })}

      <Button onClick={onSubmit} className="w-full sm:w-auto">
        {submitted ? "Update transcription" : "Record transcription"}
      </Button>
    </div>
  );
}

/** The transcribed order, shown alongside later stages as a reference. */
export function OrderSummary({ items, entries }: { items: RxItem[]; entries: TranscriptionEntry[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const entry = entries.find((e) => e.itemId === item.id);
        const required = requiredQuantity(item);
        return (
          <li key={item.id} className="rounded-xl border border-slate-200 px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold leading-snug text-slate-900">
                  {entry && entry.drug ? `${entry.drug} ${entry.strength}` : item.written}
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  {item.doseUnits} per dose · {item.frequencyCode} · {item.durationDays} days
                  {required !== null ? ` · ${required} units needed` : " · as needed"}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
