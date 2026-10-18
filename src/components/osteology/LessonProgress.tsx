"use client";

import { useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { useTracker } from "@/hooks/useTracker";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { cn } from "@/lib/utils";
import { doneId, lessonId, recordView, setCompleted, useOsteoProgress, type LessonKind } from "./progress-store";

/**
 * Records the visit (this device always; the account when signed in) and offers an
 * explicit "Mark as complete". Completion is never inferred from scrolling.
 */
export function LessonProgress({ kind, slug, name }: { kind: LessonKind; slug: string; name: string }) {
  const { trackSpotting } = useTracker();
  const { user } = useSupabaseUser();
  const progress = useOsteoProgress();
  const done = !!progress.completed[`${kind}:${slug}`];
  const href = `/osteology-lab/${kind === "bone" ? "bones" : "joints"}/${slug}`;

  useEffect(() => {
    recordView(kind, slug, name);
    trackSpotting({ lessonId: lessonId(kind, slug), category: "osteology", lessonTitle: `${name} (Osteology Lab)`, href });
  }, [kind, slug, name, href, trackSpotting]);

  function toggle() {
    setCompleted(kind, slug, !done);
    if (!done) {
      trackSpotting({ lessonId: doneId(kind, slug), category: "osteology-done", lessonTitle: `${name} — completed (Osteology Lab)`, href });
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={done}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandBlue",
          done ? "bg-brandGreen text-white" : "border border-[#16181d]/15 bg-white text-[#16181d] hover:border-brandGreen",
        )}
      >
        {done ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
        {done ? "Completed" : "Mark as complete"}
      </button>
      <span className="text-xs text-[#5b616b]">
        {user ? "Saved to your account and this device." : "Saved on this device. Sign in to keep it across devices."}
      </span>
    </div>
  );
}
