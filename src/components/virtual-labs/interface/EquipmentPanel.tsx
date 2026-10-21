"use client";

import { Eye, ShieldAlert } from "lucide-react";
import type { EquipmentDef } from "@/lib/virtual-labs/engine/types";

/**
 * The equipment guide (Help → Equipment guide): what each item is, how it is used here,
 * and a "Show me" that moves the camera to it. It never selects or operates anything —
 * the student does that in the room (2026-10-21 upgrade).
 */
export function EquipmentPanel({ equipment, inspected, onSelect, actionLabel = "Show me" }: { equipment: EquipmentDef[]; selected?: string | null; inspected: string[]; onSelect(id: string): void; actionLabel?: string }) {
  return (
    <ul className="vl-list space-y-2" aria-label="Equipment">
      {equipment.map((x) => (
        <li key={x.id} className="rounded-xl border border-[#16181d]/10 p-3">
          <div className="flex items-start gap-2">
            <p className="flex-1 font-semibold text-[#16181d]">
              {x.name}
              {inspected.includes(x.id) && <span className="ml-1 text-xs font-medium text-[#137a52]">✓ inspected</span>}
            </p>
            <button type="button" onClick={() => onSelect(x.id)} className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full border border-[#16181d]/12 px-2.5 text-xs font-semibold hover:border-brandBlue/50 hover:text-brandBlue">
              <Eye className="h-3.5 w-3.5" aria-hidden />
              {actionLabel}
            </button>
          </div>
          <p className="mt-1 text-sm text-[#3a3f47]">{x.description}</p>
          <p className="mt-1 text-sm"><span className="font-semibold">Here: </span>{x.use}</p>
          {x.spec && <p className="mt-1 font-mono text-xs text-[#4a4f57]">{x.spec}</p>}
          {x.safety && (
            <p className="mt-1 flex gap-1.5 text-xs text-amber-900">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              {x.safety}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
