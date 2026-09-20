"use client";

// ============================================================
// The clinical check console, and acting on what it finds
// ============================================================
//
// Ten checks. For each one the student reads the evidence, decides, and
// records a verdict. Only then does the console say what was actually there.
//
// This is the part of the simulation that has to resist being helpful. Showing
// a red banner before the student has looked would turn ten judgements into
// ten acknowledgements, which is exactly the habit that lets a real alert get
// clicked through.

import React, { useMemo, useState } from "react";
import { AlertTriangle, BookOpen, Check, CheckCircle2, ChevronDown, Lock, ShieldQuestion } from "lucide-react";

import type { CheckId, CheckRecord, Finding, InterventionAction, Patient, RxItem, Scenario } from "../types";
import { Button, Callout, Choice, EmptyNote, Field, Panel, RiskChip, inputClass } from "../kit";
import { CHECK_SPECS, RISK_BANDS, concernLabel } from "../data/constants";
import { medicine } from "../data/medicines";
import { evidenceFor } from "../engine/evidence";
import { gradeCheck } from "../engine/clinical";
import { cn } from "@/lib/utils";

// ─── One check ───────────────────────────────────────────────────────────────

function CheckCard({
  checkId,
  scenario,
  records,
  revealed,
  onRecord,
  onClear,
  onOpenReference,
  open,
  onToggle,
}: {
  checkId: CheckId;
  scenario: Scenario;
  records: CheckRecord[];
  revealed: string[];
  onRecord: (verdict: "ok" | "concern", concernId?: string, itemId?: string) => void;
  onClear: () => void;
  onOpenReference: (medicineId: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const spec = CHECK_SPECS.find((c) => c.id === checkId);
  const items: RxItem[] = scenario.prescription ? scenario.prescription.items : [];
  const [itemId, setItemId] = useState(items.length ? items[0].id : "");
  const [concernId, setConcernId] = useState("");

  const item = items.find((i) => i.id === itemId) || items[0] || null;
  const m = item ? medicine(item.medicineId) : undefined;
  const evidence = useMemo(() => evidenceFor(checkId, item, m, scenario.patient), [checkId, item, m, scenario.patient]);

  const mine = records.filter((r) => r.checkId === checkId);
  const recorded = mine.length > 0;
  const grade = recorded ? gradeCheck(checkId, records, scenario.findings) : null;

  // Findings are only readable once a verdict is on record.
  const visible: Finding[] = scenario.findings.filter((f) => f.checkId === checkId && revealed.indexOf(f.id) !== -1);

  if (!spec) return null;

  return (
    <div className={cn("rounded-2xl border transition-colors", recorded ? "border-slate-200 bg-white" : "border-slate-300 bg-white")}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-inset"
      >
        <span
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
            recorded ? "border-brandGreen bg-brandGreen text-white" : "border-slate-300 text-slate-400",
          )}
          aria-hidden
        >
          {recorded ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : <ShieldQuestion className="h-3.5 w-3.5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold leading-tight text-slate-900">{spec.label}</span>
          <span className="mt-0.5 block text-[12.5px] leading-snug text-slate-500">
            {recorded ? summarise(mine) : "No verdict recorded"}
          </span>
        </span>
        <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="cph-enter border-t border-slate-100 px-4 py-4">
          <p className="text-[13.5px] font-semibold leading-snug text-slate-800">{spec.question}</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-slate-500">{spec.howTo}</p>

          {items.length > 1 && (
            <div className="mt-3">
              <Field label="Item being checked">
                {(id) => (
                  <select id={id} className={inputClass} value={itemId} onChange={(e) => setItemId(e.target.value)}>
                    {items.map((i, index) => (
                      <option key={i.id} value={i.id}>
                        Item {index + 1} — {i.written}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            </div>
          )}

          {/* The evidence. Facts only — no verdict. */}
          <div className="mt-4 space-y-3">
            {evidence.blocks.map((block) => (
              <div key={block.heading} className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">{block.heading}</p>
                {block.rows.length === 0 ? (
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">{block.empty}</p>
                ) : (
                  <ul className="mt-1.5 space-y-1.5">
                    {block.rows.map((row) => (
                      <li key={`${row.label}-${row.value}`} className="text-[13px] leading-snug">
                        <span className="font-semibold text-slate-800">{row.label}</span>
                        <span className="text-slate-500"> — {row.value}</span>
                        {row.note && <span className="mt-0.5 block text-[11.5px] text-slate-400">{row.note}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {evidence.lookUp && (
              <p className="flex gap-2 text-[12px] leading-relaxed text-slate-500">
                <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                {evidence.lookUp}
                {m && (
                  <button
                    type="button"
                    onClick={() => onOpenReference(m.id)}
                    className="ml-1 shrink-0 font-bold text-brandBlue underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
                  >
                    Open monograph
                  </button>
                )}
              </p>
            )}
          </div>

          {/* The verdict. */}
          {!recorded ? (
            <div className="mt-4 space-y-2.5">
              <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">Your verdict</p>
              <Button variant="secondary" className="w-full justify-start" onClick={() => onRecord("ok")}>
                <CheckCircle2 className="h-4 w-4 text-brandGreen" /> No concern on this check
              </Button>
              <div className="rounded-xl border border-slate-200 px-3.5 py-3">
                <p className="text-[12.5px] font-semibold text-slate-700">Record a concern</p>
                <div className="mt-2 space-y-1.5" role="radiogroup" aria-label="Concern">
                  {spec.concerns.map((c) => (
                    <Choice key={c.id} selected={concernId === c.id} onSelect={() => setConcernId(c.id)} title={c.label} />
                  ))}
                </div>
                <Button className="mt-3 w-full" disabled={!concernId} onClick={() => onRecord("concern", concernId, item ? item.id : undefined)}>
                  Record this concern
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">You recorded</p>
                <ul className="mt-1.5 space-y-1">
                  {mine.map((r, i) => (
                    <li key={i} className="text-[13px] font-semibold text-slate-800">
                      {r.verdict === "ok" ? "No concern" : concernLabel(checkId, r.concernId || "")}
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {mine[0] && mine[0].verdict === "concern" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={!concernId}
                      onClick={() => onRecord("concern", concernId, item ? item.id : undefined)}
                    >
                      Add another concern
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={onClear}>
                    Re-open this check
                  </Button>
                </div>
              </div>

              {/* Now, and only now, what was actually there. */}
              {visible.length > 0 ? (
                visible.map((f) => {
                  const found = grade ? grade.matched.indexOf(f) !== -1 : false;
                  return (
                    <div key={f.id} className={cn("rounded-xl border px-3.5 py-3", RISK_BANDS[f.severity].surface)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <RiskChip level={f.severity} />
                        <span className="text-[11px] font-bold uppercase tracking-[0.1em]">
                          {found ? "You identified this" : "You did not record this"}
                        </span>
                        {f.blocksDispensing && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.08em]">
                            <Lock className="h-3 w-3" /> Blocks supply
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[13.5px] font-bold leading-snug">{f.title}</p>
                      <p className="mt-1 text-[12.5px] leading-relaxed">{f.detail}</p>
                      <p className="mt-2 text-[12.5px] leading-relaxed">
                        <strong>What to do:</strong> {f.action}
                      </p>
                    </div>
                  );
                })
              ) : (
                <Callout level="ok" title="Nothing found on this check">
                  There is no problem of this kind in this prescription. Running a check that comes back clear is not
                  wasted work — it is the only way to know.
                </Callout>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function summarise(records: CheckRecord[]): string {
  if (records.length === 1 && records[0].verdict === "ok") return "Recorded: no concern";
  const concerns = records.filter((r) => r.verdict === "concern").length;
  return `Recorded: ${concerns} concern${concerns === 1 ? "" : "s"}`;
}

// ─── The console ─────────────────────────────────────────────────────────────

export function CheckConsole({
  scenario,
  records,
  revealed,
  onRecord,
  onClear,
  onOpenReference,
}: {
  scenario: Scenario;
  records: CheckRecord[];
  revealed: string[];
  onRecord: (checkId: CheckId, verdict: "ok" | "concern", concernId?: string, itemId?: string) => void;
  onClear: (checkId: CheckId) => void;
  onOpenReference: (medicineId: string) => void;
}) {
  const [openId, setOpenId] = useState<CheckId | null>(CHECK_SPECS[0].id);
  const done = CHECK_SPECS.filter((s) => records.some((r) => r.checkId === s.id)).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-3">
        <div>
          <p className="text-[13.5px] font-bold text-slate-900">
            {done} of {CHECK_SPECS.length} checks recorded
          </p>
          <p className="mt-0.5 text-[12px] text-slate-500">Every check is run on every prescription, including the routine ones.</p>
        </div>
        <div className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-slate-100">
          <div className="cph-step-line h-full rounded-full transition-[width] duration-500" style={{ width: `${(done / CHECK_SPECS.length) * 100}%` }} />
        </div>
      </div>

      {CHECK_SPECS.map((spec) => (
        <CheckCard
          key={spec.id}
          checkId={spec.id}
          scenario={scenario}
          records={records}
          revealed={revealed}
          open={openId === spec.id}
          onToggle={() => setOpenId(openId === spec.id ? null : spec.id)}
          onRecord={(verdict, concernId, itemId) => {
            onRecord(spec.id, verdict, concernId, itemId);
          }}
          onClear={() => onClear(spec.id)}
          onOpenReference={onOpenReference}
        />
      ))}
    </div>
  );
}

// ─── Acting on the findings ──────────────────────────────────────────────────

const ACTION_COPY: { id: InterventionAction; label: string; detail: string }[] = [
  { id: "contact-prescriber", label: "Contact the prescriber", detail: "Ring the clinic, explain the problem and agree a change." },
  { id: "counsel-and-dispense", label: "Supply with counselling", detail: "The problem is manageable at the counter with specific advice and monitoring." },
  { id: "refuse-supply", label: "Refuse the supply", detail: "This must not be dispensed, and the patient is told why." },
  { id: "dispense-as-written", label: "Dispense as written", detail: "No change needed — the prescription stands." },
];

export function InterventionPanel({
  findings,
  chosen,
  onChoose,
  onFinish,
  patient,
}: {
  findings: Finding[];
  chosen: { findingId: string; action: InterventionAction; note?: string }[];
  onChoose: (findingId: string, action: InterventionAction, note?: string) => void;
  onFinish: () => void;
  patient: Patient;
}) {
  if (findings.length === 0) {
    return (
      <div className="space-y-4">
        <Callout level="ok" title="Nothing to act on">
          The checks found no problems on this prescription for {patient.name}. Move on to selecting the medicine.
        </Callout>
        <Button onClick={onFinish}>Continue</Button>
      </div>
    );
  }

  const allDecided = findings.every((f) => chosen.some((c) => c.findingId === f.id));

  return (
    <div className="space-y-4">
      <Callout level="review" title="Decide what happens to each problem">
        An intervention is a decision plus a record of it. A problem you noticed but did nothing about is worse than one
        you never saw, because the record shows you saw it.
      </Callout>

      {findings.map((f) => {
        const current = chosen.find((c) => c.findingId === f.id);
        return (
          <Panel
            key={f.id}
            eyebrow={<RiskChip level={f.severity} />}
            title={f.title}
            description={f.detail}
          >
            <div className="space-y-2" role="radiogroup" aria-label={`Action for ${f.title}`}>
              {ACTION_COPY.map((a) => (
                <Choice
                  key={a.id}
                  selected={current ? current.action === a.id : false}
                  onSelect={() => onChoose(f.id, a.id, current ? current.note : undefined)}
                  title={a.label}
                  description={a.detail}
                />
              ))}
            </div>
            {f.blocksDispensing && (
              <Callout level="critical" title="This one stops the supply">
                Nothing can be dispensed against this item until the prescriber has been contacted or the supply refused.
              </Callout>
            )}
            <Field label="Note for the record" className="mt-3">
              {(id) => (
                <input
                  id={id}
                  className={inputClass}
                  placeholder="e.g. Spoke to Dr. Toor at 14:20 — changing to nitrofurantoin"
                  value={current && current.note ? current.note : ""}
                  onChange={(e) => onChoose(f.id, current ? current.action : "contact-prescriber", e.target.value)}
                />
              )}
            </Field>
          </Panel>
        );
      })}

      {!allDecided && <EmptyNote>Every problem needs a decision before you can move on.</EmptyNote>}
      <Button onClick={onFinish} disabled={!allDecided}>
        Record these interventions
      </Button>
    </div>
  );
}

/** A standing banner while a blocking finding is unresolved. */
export function BlockBanner({ blockers }: { blockers: Finding[] }) {
  if (blockers.length === 0) return null;
  return (
    <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3.5">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-600" />
        <div className="min-w-0">
          <p className="text-[13.5px] font-bold text-rose-900">
            Supply is on hold <span className="font-normal">· {blockers.length} unresolved problem{blockers.length === 1 ? "" : "s"}</span>
          </p>
          <ul className="mt-1.5 space-y-1">
            {blockers.map((b) => (
              <li key={b.id} className="text-[12.5px] leading-relaxed text-rose-800">
                <strong>{b.title}</strong> — {b.action}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
