"use client";

import { Eye, ShieldAlert } from "lucide-react";
import type { EquipmentDef } from "@/lib/virtual-labs/engine/types";
import { Btn } from "./ui";

/**
 * Equipment details and the accessible route to every piece of equipment: each item is a
 * button that inspects it (and, in 3D, flies the camera to its close-up).
 */
export function EquipmentPanel({ equipment, selected, inspected, onSelect, onClose }: { equipment: EquipmentDef[]; selected: string | null; inspected: string[]; onSelect(id: string): void; onClose(): void }) {
  const e = equipment.find((x) => x.id === selected);
  return (
    <div className="space-y-4">
      {e ? (
        <article className="rounded-2xl border border-brandBlue/30 bg-white p-4" aria-live="polite">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brandBlue">Inspecting</p>
          <h3 className="mt-1 text-lg font-bold text-[#16181d]">{e.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[#3a3f47]">{e.description}</p>
          <p className="mt-2 text-sm leading-relaxed"><span className="font-semibold">In this experiment: </span>{e.use}</p>
          {e.spec && <p className="mt-2 rounded-lg bg-[#16181d]/[0.04] px-2 py-1.5 font-mono text-xs text-[#3a3f47]">{e.spec}</p>}
          {e.safety && (
            <p className="mt-2 flex gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-900">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {e.safety}
            </p>
          )}
          <Btn size="sm" variant="ghost" className="mt-2" onClick={onClose}>Close</Btn>
        </article>
      ) : (
        <p className="text-sm text-[#4a4f57]">Select any highlighted item in the room — or a button below — to inspect it.</p>
      )}
      <ul className="vl-list grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2" aria-label="Equipment">
        {equipment.map((x) => (
          <li key={x.id}>
            <button type="button" onClick={() => onSelect(x.id)} aria-pressed={selected === x.id} className={`flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${selected === x.id ? "border-brandBlue bg-brandBlue/5" : "border-[#16181d]/10 bg-white hover:border-brandBlue/40"}`}>
              <Eye className={`h-4 w-4 shrink-0 ${inspected.includes(x.id) ? "text-brandGreen" : "text-[#8a9099]"}`} aria-hidden />
              <span className="min-w-0 flex-1">{x.name}</span>
              {inspected.includes(x.id) && <span className="sr-only">(inspected)</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
