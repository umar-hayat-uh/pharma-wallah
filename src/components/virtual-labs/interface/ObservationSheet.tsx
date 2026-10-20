"use client";

import type { ObservationSection } from "@/lib/virtual-labs/engine/types";
import type { LogEntry } from "@/lib/virtual-labs/engine/machine";

const SOURCE = { recorded: "you recorded", calculated: "calculated", observed: "observed" } as const;

/** The laboratory notebook: what has been recorded so far, plus the bench log. */
export function ObservationSheet({ sections, log }: { sections: ObservationSection[]; log: LogEntry[] }) {
  return (
    <div className="space-y-4">
      {sections.map((sec) => (
        <section key={sec.title} className="rounded-2xl border border-[#16181d]/10 bg-white">
          <h3 className="border-b border-[#16181d]/10 px-4 py-2 text-sm font-bold text-[#16181d]">{sec.title}</h3>
          <dl className="divide-y divide-[#16181d]/[0.06]">
            {sec.rows.map((r, i) => (
              <div key={`${r.label}-${i}`} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-3 px-4 py-2 text-sm">
                <dt className="text-[#4a4f57]">{r.label}</dt>
                <dd className="min-w-0 [overflow-wrap:anywhere]">
                  <span className="font-medium tabular-nums text-[#16181d]">{r.value}</span>
                  <span className="ml-1.5 text-[11px] uppercase tracking-wide text-[#8a9099]">{SOURCE[r.source]}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <section className="rounded-2xl border border-[#16181d]/10 bg-white">
        <h3 className="border-b border-[#16181d]/10 px-4 py-2 text-sm font-bold text-[#16181d]">Bench log</h3>
        {log.length === 0 ? (
          <p className="px-4 py-3 text-sm text-[#4a4f57]">Nothing yet.</p>
        ) : (
          <ol className="vl-list max-h-64 space-y-1 overflow-y-auto px-4 py-3 text-xs" aria-label="Bench log">
            {log
              .slice()
              .reverse()
              .slice(0, 40)
              .map((l, i) => (
                <li key={`${l.at}-${i}`} className={l.kind === "error" ? "text-red-700" : l.kind === "warn" ? "text-amber-800" : l.kind === "ok" ? "text-[#137a52]" : "text-[#3a3f47]"}>
                  <span className="mr-1 font-mono text-[#8a9099]">#{l.at}</span>
                  {l.text}
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
  );
}
