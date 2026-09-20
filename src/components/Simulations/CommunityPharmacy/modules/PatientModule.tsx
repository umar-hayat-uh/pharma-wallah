"use client";

// ============================================================
// Zone A — the patient side of the counter
// ============================================================
//
// The queue, the person at the window, and their record.
//
// What is shown is deliberately limited to what a pharmacist needs to make
// this decision: age, weight where it matters, allergies, conditions, current
// medicines and the relevant history. Nothing else about the patient exists in
// the data, which is the point — a record is not a biography.

import React from "react";
import { AlertTriangle, CalendarClock, ClipboardList, Scale, Users } from "lucide-react";

import type { Patient, Scenario, ScenarioTemplate } from "../types";
import { Callout, KeyValue, Panel, RiskChip, EmptyNote } from "../kit";
import { PatientFigure } from "../environment/objects";
import { creatinineClearance } from "../data/patients";
import { TIER_COPY } from "../data/scenarios";

/** The person at the window, as a compact card for the left column. */
export function PatientCard({ scenario, compact }: { scenario: Scenario; compact?: boolean }) {
  const p = scenario.patient;
  return (
    <Panel
      eyebrow={`Patient #${String(scenario.caseNumber).padStart(3, "0")}`}
      title={p.name}
      description={`${p.ageLabel} · ${p.sex === "female" ? "Female" : "Male"}${p.weightKg ? ` · ${p.weightKg} kg` : ""}`}
      actions={p.allergies.length > 0 ? <RiskChip level="caution">Allergies on record</RiskChip> : undefined}
    >
      <div className="cph-arrive flex items-start gap-3">
        <PatientFigure {...p.avatar} name={p.name} size={compact ? 56 : 64} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-relaxed text-slate-600">{p.chiefComplaint}</p>
        </div>
      </div>
    </Panel>
  );
}

/** The full record — opened from the control panel or the assessment stage. */
export function PatientProfile({ patient }: { patient: Patient }) {
  const crcl = creatinineClearance(patient);
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <PatientFigure {...patient.avatar} name={patient.name} size={72} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-extrabold leading-tight text-slate-900">{patient.name}</h3>
          <p className="mt-0.5 text-[13px] text-slate-500">
            {patient.ageLabel} · {patient.sex === "female" ? "Female" : "Male"}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{patient.chiefComplaint}</p>
        </div>
      </div>

      <Panel title="Measurements" eyebrow="Recorded today">
        <div className="grid gap-x-6 sm:grid-cols-2">
          <KeyValue k="Weight" v={patient.weightKg ? `${patient.weightKg} kg` : "Not recorded"} />
          <KeyValue k="Height" v={patient.heightCm ? `${patient.heightCm} cm` : "Not recorded"} />
          <KeyValue k="Serum creatinine" v={patient.serumCreatinine ? `${patient.serumCreatinine} mg/dL` : "Not recorded"} />
          <KeyValue
            k="Creatinine clearance"
            v={crcl ? `${crcl} mL/min` : patient.ageYears < 18 ? "Not applicable under 18" : "Cannot be calculated"}
          />
        </div>
        {!patient.weightKg && (
          <Callout level="review" title="No weight recorded">
            A dose that depends on body weight cannot be verified without one. Asking for it is part of the check, not an
            optional extra.
          </Callout>
        )}
      </Panel>

      <Panel title="Allergies" eyebrow="Drug allergy record" actions={patient.allergies.length ? <RiskChip level="caution" /> : <RiskChip level="ok">None recorded</RiskChip>}>
        {patient.allergies.length === 0 ? (
          <EmptyNote>
            No allergies are recorded. That is not the same as "no allergies" — confirm it with the patient before you
            rely on it.
          </EmptyNote>
        ) : (
          <ul className="space-y-2.5">
            {patient.allergies.map((a) => (
              <li key={a.label} className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold text-rose-900">{a.label}</p>
                    <p className="mt-0.5 text-[12.5px] leading-relaxed text-rose-800">
                      {a.reaction} · {a.severity} reaction
                    </p>
                    <p className="mt-1 text-[11.5px] font-medium text-rose-700">
                      Classes covered: {a.classes.join(", ")}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Current medicines" eyebrow="Including anything bought privately">
        {patient.currentMedicines.length === 0 ? (
          <EmptyNote>No regular medicines recorded.</EmptyNote>
        ) : (
          <ul className="space-y-1.5">
            {patient.currentMedicines.map((m) => (
              <li key={m.label} className="rounded-lg border border-slate-200 px-3 py-2">
                <p className="text-[13.5px] font-semibold text-slate-900">{m.label}</p>
                <p className="mt-0.5 text-[11.5px] text-slate-500">{m.therapeuticClasses.join(" · ")}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Conditions and history" eyebrow="Previous pharmacy records">
        {patient.conditions.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {patient.conditions.map((c) => (
              <span key={c} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[12px] font-semibold text-slate-700">
                {c}
              </span>
            ))}
          </div>
        )}
        <ul className="space-y-1.5">
          {patient.history.map((h) => (
            <li key={h} className="flex gap-2 text-[13px] leading-relaxed text-slate-600">
              <ClipboardList className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              {h}
            </li>
          ))}
        </ul>
        {patient.pregnancy === "pregnant" || patient.pregnancy === "breastfeeding" ? (
          <Callout level="caution" title={patient.pregnancy === "pregnant" ? "Pregnant" : "Breastfeeding"}>
            Check every item against pregnancy and breastfeeding advice before supplying.
          </Callout>
        ) : null}
      </Panel>
    </div>
  );
}

/** The waiting queue. One patient is at the window; the rest are counted. */
export function QueuePanel({
  scenario,
  waiting,
  onOpenProfile,
}: {
  scenario: Scenario | null;
  waiting: ScenarioTemplate[];
  onOpenProfile: () => void;
}) {
  return (
    <div className="space-y-3">
      {scenario ? (
        <div className="rounded-xl border border-brandBlue/30 bg-brandBlue/[0.05] px-3.5 py-3">
          <div className="flex items-start gap-3">
            <PatientFigure {...scenario.patient.avatar} name={scenario.patient.name} size={44} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brandBlue">At the window</p>
              <p className="text-[14px] font-bold leading-tight text-slate-900">{scenario.patient.name}</p>
              <p className="mt-0.5 text-[12.5px] text-slate-600">{scenario.patient.ageLabel}</p>
            </div>
            <button
              type="button"
              onClick={onOpenProfile}
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue"
            >
              Profile
            </button>
          </div>
        </div>
      ) : (
        <EmptyNote>Nobody is at the counter. Start a case from the home screen.</EmptyNote>
      )}

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
          <Users className="h-3.5 w-3.5" /> Waiting · {waiting.length}
        </p>
        <ul className="space-y-1.5">
          {waiting.slice(0, 4).map((t, i) => (
            <li key={t.id} className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-slate-600">
                {TIER_COPY[t.tier] ? TIER_COPY[t.tier].label : t.tier}
              </span>
              <CalendarClock className="h-3.5 w-3.5 shrink-0 text-slate-300" />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-[11.5px] leading-snug text-slate-400">
          The queue is a teaching device — cases are taken one at a time, and nobody is timed out of a safety check.
        </p>
      </div>
    </div>
  );
}

/** A small, always-visible summary of what the patient brings to the checks. */
export function PatientRiskStrip({ patient }: { patient: Patient }) {
  const crcl = creatinineClearance(patient);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {patient.allergies.map((a) => (
        <RiskChip key={a.label} level="caution">
          {a.label}
        </RiskChip>
      ))}
      {patient.weightKg && (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] font-bold text-slate-600">
          <Scale className="h-3 w-3" /> {patient.weightKg} kg
        </span>
      )}
      {crcl !== null && crcl < 60 && <RiskChip level="review">CrCl {crcl} mL/min</RiskChip>}
      {patient.currentMedicines.length > 0 && (
        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11.5px] font-bold text-slate-600">
          {patient.currentMedicines.length} current medicine{patient.currentMedicines.length === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
