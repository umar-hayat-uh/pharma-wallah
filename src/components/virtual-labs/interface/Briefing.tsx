"use client";

import { AlertTriangle, BookOpen, Clock, Compass, FlaskConical, GraduationCap, ShieldCheck, Target, Timer } from "lucide-react";
import type { ExperimentDefinition, LabMode } from "@/lib/virtual-labs/engine/types";
import { HINT_CAP, HINT_COST } from "@/lib/virtual-labs/engine/machine";
import { Btn, CURRICULUM_LABEL, CURRICULUM_TONE, Pill } from "./ui";
import { PROCEDURE_LABEL, PROCEDURE_TONE } from "@/lib/virtual-labs/labels";

/**
 * The concise pre-lab briefing: what, why, how safely, with what — then the two mode
 * cards (2026-10-21). Both open the same room and the same engine; only guidance and
 * scoring differ, and the cards say how.
 */
export function Briefing({ def, onStart, webgl, resume }: { def: ExperimentDefinition<unknown, unknown>; onStart(mode: LabMode, threeD: boolean): void; webgl: boolean | null; resume: { mode: LabMode; done: number; total: number; onResume(): void } | null }) {
  const { meta } = def;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-brandBlue">{meta.labName}</p>
      <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[#16181d] [overflow-wrap:anywhere] sm:text-4xl">{meta.experimentTitle}</h1>
      <p className="mt-3 max-w-3xl text-[17px] leading-relaxed text-[#3a3f47]">{meta.summary}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Pill tone="neutral"><Clock className="h-3.5 w-3.5" aria-hidden />About {meta.minutes} min</Pill>
        <Pill tone="neutral"><GraduationCap className="h-3.5 w-3.5" aria-hidden />{meta.difficulty}</Pill>
        <Pill tone={CURRICULUM_TONE[meta.curriculum.status]}>{CURRICULUM_LABEL[meta.curriculum.status]}</Pill>
        {meta.procedure && <Pill tone={PROCEDURE_TONE[meta.procedure.status]}>{PROCEDURE_LABEL[meta.procedure.status]}</Pill>}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card icon={<Target className="h-5 w-5" />} title="Objectives">
          <ul className="vl-bullets space-y-1">{meta.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
        </Card>
        <Card icon={<BookOpen className="h-5 w-5" />} title="Principle">
          <div className="space-y-2">{def.principle.map((p) => <p key={p}>{p}</p>)}</div>
        </Card>
        <Card icon={<ShieldCheck className="h-5 w-5" />} title="Safety" tone="amber">
          <ul className="vl-bullets space-y-1">{def.safety.map((s) => <li key={s}>{s}</li>)}</ul>
        </Card>
        <Card icon={<FlaskConical className="h-5 w-5" />} title="Apparatus and materials">
          <ul className="vl-list grid gap-x-4 gap-y-1 sm:grid-cols-2">{def.equipment.map((e) => <li key={e.id}>{e.name}</li>)}</ul>
          <p className="mt-3 text-sm text-[#4a4f57]">{def.materials.map((m) => m.name).join(" · ")}</p>
        </Card>
      </div>

      <div className="mt-4 rounded-2xl border border-[#16181d]/10 bg-white p-5 text-sm leading-relaxed text-[#3a3f47]">
        <p className="font-semibold text-[#16181d]">Curriculum</p>
        <p className="mt-1">{meta.curriculum.summary}</p>
        {meta.curriculum.sources.length > 0 && (
          <ul className="vl-list mt-2 space-y-1">
            {meta.curriculum.sources.map((s) => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-brandBlue underline-offset-2 hover:underline">{s.label}</a> — {s.basis}
              </li>
            ))}
          </ul>
        )}
        {meta.procedure && (
          <>
            <p className="mt-4 font-semibold text-[#16181d]">Method and assumptions</p>
            <p className="mt-1">{PROCEDURE_LABEL[meta.procedure.status]}. Values marked simulated come from a documented teaching model, not real experimental or patient data. Completing this simulation does not qualify anyone for unsupervised laboratory work.</p>
            {meta.procedure.assumptions.length > 0 && <ul className="vl-bullets mt-2 space-y-1">{meta.procedure.assumptions.map((a) => <li key={a}>{a}</li>)}</ul>}
            {meta.procedure.sources.length > 0 && (
              <ul className="vl-list mt-2 space-y-1">
                {meta.procedure.sources.map((s) => (
                  <li key={s.label}><a href={s.url} target="_blank" rel="noreferrer" className="font-medium text-brandBlue underline-offset-2 hover:underline">{s.label}</a></li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {webgl === false && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          This browser cannot show 3D graphics, so the lab opens as a 2D bench plan: select a piece of equipment to operate it, exactly as in the room.
        </p>
      )}

      {resume && (
        <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-brandBlue/30 bg-brandBlue/[0.04] p-4">
          <p className="flex-1 text-sm text-[#16181d]">
            <strong>Your bench is still set up</strong> — {resume.mode === "learning" ? "Learning" : "Practical"} mode, {resume.done} of {resume.total} objectives done.
          </p>
          <Btn variant="primary" onClick={resume.onResume}>Resume</Btn>
        </div>
      )}

      <h2 className="mt-8 text-lg font-bold text-[#16181d]">{resume ? "Or start again" : "Choose how to do it"}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <ModeCard
          icon={<Compass className="h-5 w-5" />}
          title="Learning Mode"
          line="Learn by operating the equipment with guided support."
          points={["The next instrument is marked, and the right control on it", "Hints, theory and safety notes, free of charge", "You still do every operation yourself"]}
          onClick={() => onStart("learning", webgl !== false)}
        />
        <ModeCard
          icon={<Timer className="h-5 w-5" />}
          title="Practical Mode"
          line="Perform the experiment independently and test your skills."
          points={["Find and operate the equipment on your own", `Hints are available but cost ${HINT_COST} marks each (up to ${HINT_CAP})`, "Scored on technique, readings and the assessment"]}
          onClick={() => onStart("practical", webgl !== false)}
        />
      </div>
      {webgl !== false && (
        <p className="mt-3 text-sm text-[#4a4f57]">
          The lab opens full screen.{" "}
          <button type="button" className="font-semibold text-brandBlue underline-offset-2 hover:underline" onClick={() => onStart("learning", false)}>
            Prefer a 2D bench plan?
          </button>{" "}
          (for slower devices or screen readers; Learning mode — switch modes in the lab menu).
        </p>
      )}
      <p className="mt-3 text-xs text-[#4a4f57]">Simulated practice: results come from teaching models and illustrative data described on this page. Nothing you enter is sent anywhere unless you are signed in, in which case your completion is added to your progress.</p>
    </div>
  );
}

function ModeCard({ icon, title, line, points, onClick }: { icon: React.ReactNode; title: string; line: string; points: string[]; onClick(): void }) {
  return (
    <button type="button" onClick={onClick} className="group flex h-full flex-col rounded-2xl border border-[#16181d]/12 bg-white p-5 text-left transition hover:border-brandBlue/60 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandBlue">
      <span className="flex items-center gap-2 text-base font-bold text-[#16181d]">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brandBlue/10 text-brandBlue" aria-hidden>{icon}</span>
        {title}
      </span>
      <span className="mt-2 text-[15px] text-[#3a3f47]">{line}</span>
      <ul className="vl-bullets mt-3 space-y-1 text-sm text-[#4a4f57]">{points.map((p) => <li key={p}>{p}</li>)}</ul>
      <span className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brandBlue px-4 text-[15px] font-semibold text-white group-hover:bg-[#1667b8]">Enter the lab</span>
    </button>
  );
}

function Card({ icon, title, children, tone }: { icon: React.ReactNode; title: string; children: React.ReactNode; tone?: "amber" }) {
  return (
    <section className={`rounded-2xl border p-5 text-[15px] leading-relaxed text-[#3a3f47] ${tone === "amber" ? "border-amber-200 bg-amber-50/60" : "border-[#16181d]/10 bg-white"}`}>
      <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-[#16181d]">
        <span className={tone === "amber" ? "text-amber-700" : "text-brandBlue"} aria-hidden>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
