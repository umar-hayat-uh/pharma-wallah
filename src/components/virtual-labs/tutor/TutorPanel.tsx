"use client";

/**
 * RoboPharma's panel: a small avatar that opens a compact speech card. Bottom-right (the phone joystick
 * is bottom-left), above the controller sheet (it follows the shell's insets), so it never covers the instrument
 * being operated. Collapsed it is only the 56 px avatar. All words come from `tutorMessage`.
 */
import { useEffect, useState } from "react";
import { Eye, Lightbulb, ShieldAlert, X } from "lucide-react";
import type { TutorMessage } from "@/lib/virtual-labs/tutor";
import { RoboPharma } from "./RoboPharma";

export function TutorPanel({
  msg,
  bottom,
  right,
  reducedMotion,
  onShow,
  onHint,
}: {
  msg: TutorMessage;
  bottom: number;
  right: number;
  reducedMotion: boolean;
  onShow(id: string): void;
  onHint(stepId: string): void;
}) {
  const [open, setOpen] = useState(true);
  // a new mistake or refusal re-opens the card: that is when the student needs it
  useEffect(() => {
    if (msg.mood === "warning" || msg.mood === "thinking") setOpen(true);
  }, [msg.mood, msg.title, msg.lines]);

  return (
    <div className="pointer-events-none absolute z-20 flex flex-row-reverse items-end gap-2" style={{ bottom: bottom + 8, right: right + 8, maxWidth: "min(360px, calc(100% - 16px))" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Hide RoboPharma" : "Ask RoboPharma"}
        className="pointer-events-auto shrink-0 rounded-full bg-white/90 p-1 shadow-md ring-1 ring-brandBlue/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brandBlue"
      >
        <RoboPharma mood={msg.mood} size={48} animate={!reducedMotion} />
      </button>
      {open && (
        <section aria-live="polite" aria-label="RoboPharma says" className="vl-scroll pointer-events-auto max-h-[38vh] min-w-0 flex-1 overflow-y-auto rounded-2xl rounded-br-sm border border-brandBlue/15 bg-white p-3 text-sm shadow-lg">
          <div className="flex items-start gap-2">
            <p className={`flex-1 font-bold leading-snug ${msg.mood === "warning" ? "text-amber-800" : "text-[#16181d]"}`}>{msg.title}</p>
            <button type="button" onClick={() => setOpen(false)} className="-m-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-[#16181d]/5" aria-label="Collapse">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          {msg.lines.map((l, i) => (
            <p key={i} className="mt-1 text-[#3a3f47]">{l}</p>
          ))}
          {msg.hint?.revealed.map((h, i) => (
            <p key={`h${i}`} className="mt-1.5 flex gap-1.5 text-[#1a4f86]"><Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{h}</p>
          ))}
          {msg.safety && (
            <p className="mt-2 flex gap-1.5 text-xs text-amber-800"><ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{msg.safety}</p>
          )}
          {(msg.target || (msg.hint && msg.hint.shown < msg.hint.total)) && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {msg.target && (
                <button type="button" onClick={() => onShow(msg.target!)} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-brandGreen/10 px-2.5 text-xs font-semibold text-[#137a52] hover:bg-brandGreen/20">
                  <Eye className="h-3.5 w-3.5" aria-hidden />Show me
                </button>
              )}
              {msg.hint && msg.hint.shown < msg.hint.total && (
                <button type="button" onClick={() => onHint(msg.hint!.stepId)} className="inline-flex min-h-8 items-center gap-1 rounded-full bg-brandBlue/10 px-2.5 text-xs font-semibold text-brandBlue hover:bg-brandBlue/20">
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                  Hint {msg.hint.shown + 1}/{msg.hint.total}{msg.hint.cost ? ` (−${msg.hint.cost} marks)` : ""}
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
