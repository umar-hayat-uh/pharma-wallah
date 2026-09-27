"use client";

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from "react";
import { Delete, RotateCcw } from "lucide-react";
import type { AnswerPayload, PublicQuestion } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";
import type { DraftHandle } from "./types";

/**
 * Round 1. The scrambled letters are tiles; tapping one moves it into the next
 * empty slot, tapping a placed letter sends it back. Each tile is used once
 * (tracked by index, so a word with two As works). A keyboard can type too:
 * a letter takes the first unused matching tile, Backspace undoes the last.
 */
export const WordBlock = forwardRef<DraftHandle, { question: PublicQuestion; disabled: boolean; onSubmit: (a: AnswerPayload) => void }>(
  function WordBlock({ question, disabled, onSubmit }, ref) {
    const letters = question.letters ?? [];
    const length = question.length ?? letters.length;
    const [picked, setPicked] = useState<number[]>([]);

    useEffect(() => setPicked([]), [question.id]);

    const word = picked.map((i) => letters[i]).join("");
    useImperativeHandle(ref, () => ({ draft: () => (picked.length ? { word } : null) }), [picked.length, word]);

    const pick = useCallback(
      (i: number) => {
        if (disabled) return;
        setPicked((p) => (p.includes(i) || p.length >= length ? p : [...p, i]));
      },
      [disabled, length],
    );
    const unpick = (slot: number) => !disabled && setPicked((p) => p.filter((_, k) => k !== slot));

    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if (disabled || e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.key === "Backspace") {
          e.preventDefault();
          setPicked((p) => p.slice(0, -1));
        } else if (e.key === "Enter") {
          if (picked.length === length) onSubmit({ word });
        } else if (/^[a-z]$/i.test(e.key)) {
          const ch = e.key.toUpperCase();
          const idx = letters.findIndex((l, i) => l === ch && !picked.includes(i));
          if (idx >= 0) pick(idx);
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [disabled, letters, length, onSubmit, pick, picked, word]);

    const tile =
      "flex h-12 w-10 items-center justify-center rounded-xl text-xl font-extrabold uppercase sm:h-14 sm:w-12 sm:text-2xl";

    return (
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#1C7BD9]">Spell the word · {length} letters</p>
        <h2 className="mt-2 text-2xl font-bold leading-snug text-[#16181d] sm:text-3xl">{question.prompt}</h2>

        {/* Slots */}
        <div className="mt-8 flex flex-wrap justify-center gap-1.5 sm:gap-2" aria-label={`Your answer: ${word || "empty"}`}>
          {Array.from({ length }, (_, slot) => {
            const i = picked[slot];
            const filled = i !== undefined;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => filled && unpick(slot)}
                disabled={!filled || disabled}
                aria-label={filled ? `Remove ${letters[i]}` : `Empty slot ${slot + 1}`}
                className={cn(
                  tile,
                  filled
                    ? "bg-[#1C7BD9] text-white shadow-[0_6px_14px_-8px_rgba(28,123,217,.9)]"
                    : "border-2 border-dashed border-[#16181d]/15 bg-white",
                )}
              >
                {filled ? letters[i] : ""}
              </button>
            );
          })}
        </div>

        {/* Tiles */}
        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-2.5">
          {letters.map((l, i) => {
            const used = picked.includes(i);
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={used || disabled}
                aria-label={`Letter ${l}`}
                className={cn(
                  tile,
                  "border border-[#16181d]/15 bg-white text-[#16181d] shadow-[0_2px_0_rgba(22,24,29,.08)] transition-[transform,opacity] duration-200 hover:-translate-y-0.5 active:scale-95",
                  used && "pointer-events-none opacity-20",
                )}
              >
                {l}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPicked((p) => p.slice(0, -1))}
            disabled={!picked.length || disabled}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#16181d]/15 bg-white px-4 text-sm font-semibold disabled:opacity-40"
          >
            <Delete className="h-4 w-4" /> Undo
          </button>
          <button
            type="button"
            onClick={() => setPicked([])}
            disabled={!picked.length || disabled}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#16181d]/15 bg-white px-4 text-sm font-semibold disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" /> Clear
          </button>
          <SubmitButton disabled={disabled || picked.length !== length} onClick={() => onSubmit({ word })} />
        </div>
      </div>
    );
  },
);

export function SubmitButton({ disabled, onClick, label = "Submit" }: { disabled: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-12 min-w-[9rem] items-center justify-center rounded-xl bg-[#1C7BD9] px-6 text-[15px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(28,123,217,.9)] transition-[filter,transform] hover:brightness-110 active:scale-[0.98] disabled:bg-[#16181d]/15 disabled:text-[#16181d]/45 disabled:shadow-none"
    >
      {label}
    </button>
  );
}
