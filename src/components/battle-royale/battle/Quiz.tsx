"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { AnswerPayload, PublicQuestion } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";
import { SubmitButton } from "./WordBlock";
import type { DraftHandle } from "./types";

type Key = "A" | "B" | "C" | "D";

/**
 * Round 3. Choose, then lock in — a single tap would make a slip final.
 * Keys 1–4 or A–D choose; Enter locks in.
 */
export const Quiz = forwardRef<DraftHandle, { question: PublicQuestion; disabled: boolean; onSubmit: (a: AnswerPayload) => void }>(
  function Quiz({ question, disabled, onSubmit }, ref) {
    const [choice, setChoice] = useState<Key | null>(null);
    useEffect(() => setChoice(null), [question.id]);
    useImperativeHandle(ref, () => ({ draft: () => (choice ? { choice } : null) }), [choice]);

    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (disabled || e.metaKey || e.ctrlKey || e.altKey) return;
        const map: Record<string, Key> = { "1": "A", "2": "B", "3": "C", "4": "D", a: "A", b: "B", c: "C", d: "D" };
        const k = map[e.key.toLowerCase()];
        if (k) setChoice(k);
        else if (e.key === "Enter" && choice) onSubmit({ choice });
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [choice, disabled, onSubmit]);

    return (
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#1C7BD9]">Final quiz · {question.points} points</p>
        <h2 className="mt-2 text-2xl font-bold leading-snug text-[#16181d] sm:text-3xl">{question.prompt}</h2>

        <div role="radiogroup" aria-label="Options" className="mt-8 grid gap-3 sm:grid-cols-2">
          {(question.options ?? []).map((o) => {
            const on = choice === o.key;
            return (
              <button
                key={o.key}
                type="button"
                role="radio"
                aria-checked={on}
                disabled={disabled}
                onClick={() => setChoice(o.key)}
                className={cn(
                  "flex min-h-16 items-center gap-4 rounded-2xl border-2 bg-white px-4 py-3 text-left text-[16px] font-semibold transition-[border-color,background-color,transform] active:scale-[0.99]",
                  on ? "border-[#1C7BD9] bg-[#1C7BD9]/[0.06]" : "border-[#16181d]/10 hover:border-[#16181d]/25",
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-bold",
                    on ? "bg-[#1C7BD9] text-white" : "bg-[#16181d]/[0.06] text-[#16181d]/70",
                  )}
                >
                  {o.key}
                </span>
                {o.text}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end">
          <SubmitButton disabled={disabled || !choice} onClick={() => choice && onSubmit({ choice })} label="Lock in" />
        </div>
      </div>
    );
  },
);
