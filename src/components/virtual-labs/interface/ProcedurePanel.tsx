"use client";

import { Eye, Lightbulb, ShieldAlert } from "lucide-react";
import type { ExperimentDefinition, LabMode } from "@/lib/virtual-labs/engine/types";
import { HINT_CAP, HINT_COST, type Run } from "@/lib/virtual-labs/engine/machine";
import { Btn } from "./ui";

/**
 * The objectives. Progress is DERIVED from the experiment state (`stepComplete`) — nothing
 * here can tick a step or operate an instrument.
 *
 * Learning: every step with its objective, safety note and hints; on the inspection step a
 * "Show me" for each item, which only moves the camera — the student still selects it.
 * Practical: a compact checklist of step titles; hints are available but cost marks.
 */
export function ProcedurePanel<S, A>({ def, run, stepId, onHint, equipmentNames, inspected, onShow, mode }: { def: ExperimentDefinition<S, A>; run: Run<S>; stepId: string; onHint(stepId: string): void; equipmentNames: Record<string, string>; inspected?: string[]; onShow?(id: string): void; mode: LabMode }) {
  const learning = mode === "learning";
  const hintsUsed = Object.values(run.hints).reduce((a, b) => a + b, 0);
  return (
    <div>
      {!learning && (
        <p className="mb-2 text-xs text-[#4a4f57]">
          Find and operate the equipment yourself. Hints cost {HINT_COST} technique marks each (up to {HINT_CAP}){run.assessed && hintsUsed > 0 ? ` — ${Math.min(HINT_CAP, hintsUsed * HINT_COST)} so far` : ""}.
        </p>
      )}
      <ol className="vl-list space-y-1" aria-label={learning ? "Procedure" : "Objectives"}>
        {def.steps.map((st, i) => {
          const done = def.stepComplete(run.s, st.id);
          const current = st.id === stepId;
          const shown = run.hints[st.id] ?? 0;
          return (
            <li key={st.id} aria-current={current ? "step" : undefined} className={`rounded-xl border px-2.5 ${learning ? "py-2" : "py-1.5"} ${current ? "border-brandBlue/40 bg-brandBlue/[0.04]" : "border-transparent"}`}>
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${done ? "bg-brandGreen text-white" : current ? "bg-brandBlue text-white" : "bg-[#16181d]/[0.07] text-[#4a4f57]"}`}>{done ? "✓" : i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${done && !current ? "text-[#4a4f57]" : "text-[#16181d]"}`}>{st.title}</p>
                  {current && (
                    <div className="mt-1 space-y-2 text-sm text-[#3a3f47]">
                      {learning && <p>{st.objective}</p>}
                      {learning && st.id === "inspect" && inspected && (
                        <ul className="vl-list flex flex-wrap gap-1.5" aria-label="Items to find">
                          {st.focus.map((id) => (
                            <li key={id}>
                              <button type="button" onClick={() => onShow?.(id)} className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-2 text-xs font-medium ${inspected.includes(id) ? "border-brandGreen/40 bg-brandGreen/10 text-[#137a52]" : "border-[#16181d]/15 bg-white hover:border-brandBlue/50"}`} aria-label={`${inspected.includes(id) ? "Inspected" : "Show me"}: ${equipmentNames[id] ?? id}`}>
                                {inspected.includes(id) ? "✓" : <Eye className="h-3 w-3" aria-hidden />}
                                {equipmentNames[id] ?? id}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      {learning && st.safety && (
                        <p className="flex gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
                          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                          {st.safety}
                        </p>
                      )}
                      {shown > 0 && (
                        <ul className="vl-list space-y-1" aria-live="polite">
                          {st.hints.slice(0, shown).map((h) => (
                            <li key={h} className="flex gap-1.5 rounded-lg bg-brandBlue/[0.06] px-2 py-1.5 text-xs text-[#1b4f86]">
                              <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}
                      {shown < st.hints.length && (
                        <Btn size="sm" variant="soft" onClick={() => onHint(st.id)}>
                          <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                          {shown === 0 ? "Hint" : "Another hint"}
                          {!learning && run.assessed && <span className="text-xs font-normal">(−{HINT_COST})</span>}
                        </Btn>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
