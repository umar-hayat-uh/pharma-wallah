"use client";

import { Lightbulb, ShieldAlert } from "lucide-react";
import type { ExperimentDefinition } from "@/lib/virtual-labs/engine/types";
import type { Run } from "@/lib/virtual-labs/engine/machine";
import { Btn } from "./ui";

/** The procedure: every step with its state, the current objective, hints on request and safety. */
export function ProcedurePanel<S, A>({ def, run, stepId, onHint, equipmentNames, inspected, onFocus }: { def: ExperimentDefinition<S, A>; run: Run<S>; stepId: string; onHint(stepId: string): void; equipmentNames: Record<string, string>; inspected?: string[]; onFocus?(id: string): void }) {
  return (
    <ol className="vl-list space-y-1.5" aria-label="Procedure">
      {def.steps.map((st, i) => {
        const done = def.stepComplete(run.s, st.id);
        const current = st.id === stepId;
        const shown = run.hints[st.id] ?? 0;
        return (
          <li key={st.id} aria-current={current ? "step" : undefined} className={`rounded-xl border px-3 py-2 ${current ? "border-brandBlue/40 bg-brandBlue/[0.04]" : "border-transparent"}`}>
            <div className="flex items-start gap-2">
              <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${done ? "bg-brandGreen text-white" : current ? "bg-brandBlue text-white" : "bg-[#16181d]/[0.07] text-[#4a4f57]"}`}>{done ? "✓" : i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${done && !current ? "text-[#4a4f57]" : "text-[#16181d]"}`}>{st.title}</p>
                {current && (
                  <div className="mt-1 space-y-2 text-sm text-[#3a3f47]">
                    <p>{st.objective}</p>
                    {st.id === "inspect" && inspected && (
                      <ul className="vl-list flex flex-wrap gap-1.5" aria-label="Items to inspect">
                        {st.focus.map((id) => (
                          <li key={id}>
                            <button type="button" onClick={() => onFocus?.(id)} className={`rounded-full border px-2 py-1 text-xs font-medium ${inspected.includes(id) ? "border-brandGreen/40 bg-brandGreen/10 text-[#137a52]" : "border-[#16181d]/15 bg-white hover:border-brandBlue/50"}`}>
                              {inspected.includes(id) ? "✓ " : ""}
                              {equipmentNames[id] ?? id}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {st.safety && (
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
                        {shown === 0 ? "Show a hint" : "Another hint"}
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
  );
}
