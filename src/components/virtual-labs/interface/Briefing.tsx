"use client";

import { AlertTriangle, BookOpen, Clock, FlaskConical, GraduationCap, ShieldCheck, Target } from "lucide-react";
import type { ExperimentDefinition } from "@/lib/virtual-labs/engine/types";
import { Btn, CURRICULUM_LABEL, CURRICULUM_TONE, Pill } from "./ui";

/** The concise pre-lab briefing: what, why, how safely, with what — then into the room. */
export function Briefing({ def, onStart, webgl, onStart2D }: { def: ExperimentDefinition<unknown, unknown>; onStart(): void; webgl: boolean | null; onStart2D(): void }) {
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
      </div>

      {webgl === false && (
        <p className="mt-6 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          This browser cannot show 3D graphics. You can still do the whole experiment in the 2D lab, where every piece of equipment and every step is a control in the panels.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {webgl !== false && (
          <Btn variant="primary" onClick={onStart} className="min-h-12 px-6 text-base">
            Enter the 3D lab
          </Btn>
        )}
        <Btn variant={webgl === false ? "primary" : "secondary"} onClick={onStart2D} className="min-h-12 px-6 text-base">
          Use the 2D lab instead
        </Btn>
      </div>
      <p className="mt-3 text-xs text-[#4a4f57]">Simulated practice: results come from teaching models and illustrative data described on this page. Nothing you enter is sent anywhere unless you are signed in, in which case your completion is added to your progress.</p>
    </div>
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
