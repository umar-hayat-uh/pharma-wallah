"use client";

import { CheckCircle2, PlayCircle } from "lucide-react";
import { useLabProgress } from "@/lib/virtual-labs/progress";

/** "Completed · Merit (best 82 %)" / "Started" — this device's record, no account needed. */
export function LabProgressBadge({ id }: { id: string }) {
  const store = useLabProgress();
  const r = store[id];
  if (!r) return null;
  if (r.best)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brandGreen/12 px-2.5 py-0.5 text-xs font-semibold text-[#137a52]">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
        Completed · {r.best.grade} (best {r.best.overall}%)
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brandBlue/10 px-2.5 py-0.5 text-xs font-semibold text-brandBlue">
      <PlayCircle className="h-3.5 w-3.5" aria-hidden />
      Started
    </span>
  );
}
