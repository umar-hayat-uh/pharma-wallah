"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useOsteoProgress } from "./progress-store";

/** "Continue where you left off" — shown only once there is something to continue. */
export function ContinueLearning() {
  const p = useOsteoProgress();
  const last = p.viewed[0];
  if (!last) return null;
  const href = `/osteology-lab/${last.kind === "bone" ? "bones" : "joints"}/${last.slug}`;
  const done = Object.keys(p.completed).length;
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-brandBlue/25 bg-brandBlue/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-brandBlue">Continue learning</p>
        <p className="mt-1 text-lg font-bold">{last.name}</p>
        <p className="text-sm text-[#4a4f57]">{done} lesson{done === 1 ? "" : "s"} completed on this device</p>
      </div>
      <Link href={href} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brandBlue px-5 font-semibold text-white">
        Resume <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}
