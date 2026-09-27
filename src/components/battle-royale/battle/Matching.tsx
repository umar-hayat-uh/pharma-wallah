"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { X } from "lucide-react";
import type { BoardPlan } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";
import { SubmitButton } from "./SubmitButton";
import type { DraftHandle } from "./types";

// One colour per Column A item, so a pair reads as a pair without lines —
// which is what lets the two columns stack on a phone.
const PAIR_COLOURS = ["#1C7BD9", "#21B67A", "#8b5cf6", "#f59e0b", "#e11d48", "#0891b2", "#65a30d", "#c026d3"];

/**
 * Round 2. Tap an item in Column A, then its partner in Column B. A Column B
 * item can only belong to one pair: choosing it again moves it. Every pair is
 * graded on its own, so a board submitted half-done still scores what's right.
 */
export const Matching = forwardRef<DraftHandle, { question: BoardPlan; disabled: boolean; onSubmit: (a: { matches: string[] }) => void }>(
  function Matching({ question, disabled, onSubmit }, ref) {
    const left = question.left ?? [];
    const right = question.right ?? [];
    const [pairs, setPairs] = useState<(string | null)[]>(() => left.map(() => null));
    const [active, setActive] = useState<number | null>(0);

    useEffect(() => {
      setPairs(left.map(() => null));
      setActive(0);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [question.id]);

    const matches = pairs.map((p) => p ?? "");
    const complete = pairs.every(Boolean);
    useImperativeHandle(ref, () => ({ draft: () => (pairs.some(Boolean) ? { matches } : null) }), [pairs, matches]);

    const chooseRight = (text: string) => {
      if (disabled || active === null) return;
      setPairs((prev) => {
        const next = prev.map((p) => (p === text ? null : p));
        next[active] = text;
        // Jump to the next unpaired Column A item.
        const following = next.findIndex((p, i) => !p && i > active);
        const any = next.findIndex((p) => !p);
        setActive(following >= 0 ? following : any >= 0 ? any : null);
        return next;
      });
    };
    const clear = (i: number) => {
      if (disabled) return;
      setPairs((prev) => prev.map((p, k) => (k === i ? null : p)));
      setActive(i);
    };

    const ownerOf = (text: string) => pairs.findIndex((p) => p === text);

    return (
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#1C7BD9]">Column matching · {left.length} pairs</p>
        <h2 className="mt-2 text-2xl font-bold leading-snug text-[#16181d] sm:text-3xl">{question.prompt}</h2>
        <p className="mt-2 text-sm text-[#16181d]/60">Select an item in Column A, then its match in Column B.</p>

        <div className="mt-6 grid gap-5 md:grid-cols-2 md:gap-8">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#16181d]/55">Column A</p>
            <ul className="space-y-2">
              {left.map((item, i) => {
                const colour = PAIR_COLOURS[i % PAIR_COLOURS.length];
                const isActive = active === i;
                return (
                  <li key={item} className="flex items-stretch gap-2">
                    <button
                      type="button"
                      onClick={() => !disabled && setActive(i)}
                      disabled={disabled}
                      aria-pressed={isActive}
                      className={cn(
                        "flex min-h-12 flex-1 items-center gap-3 rounded-xl border bg-white px-3 py-2 text-left text-[15px] font-semibold transition-shadow",
                        isActive ? "border-transparent ring-[3px]" : "border-[#16181d]/15",
                      )}
                      style={isActive ? ({ ["--tw-ring-color" as string]: colour } as React.CSSProperties) : undefined}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: colour }}>
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        {item}
                        {pairs[i] && <span className="mt-0.5 block text-xs font-medium text-[#16181d]/55">→ {pairs[i]}</span>}
                      </span>
                    </button>
                    {pairs[i] && (
                      <button
                        type="button"
                        onClick={() => clear(i)}
                        disabled={disabled}
                        aria-label={`Unpair ${item}`}
                        className="flex w-10 items-center justify-center rounded-xl border border-[#16181d]/10 text-[#16181d]/50 hover:text-[#16181d]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#16181d]/55">Column B</p>
            <ul className="space-y-2">
              {right.map((item) => {
                const owner = ownerOf(item);
                const colour = owner >= 0 ? PAIR_COLOURS[owner % PAIR_COLOURS.length] : null;
                return (
                  <li key={item}>
                    <button
                      type="button"
                      onClick={() => chooseRight(item)}
                      disabled={disabled || active === null}
                      className={cn(
                        "flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-[15px] font-medium transition-colors",
                        colour ? "bg-white" : "border-[#16181d]/15 bg-white hover:border-[#1C7BD9]/50 hover:bg-[#1C7BD9]/[0.03]",
                      )}
                      style={colour ? { borderColor: colour, background: `${colour}0f` } : undefined}
                    >
                      <span
                        className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold", colour ? "text-white" : "border-2 border-dashed border-[#16181d]/20")}
                        style={colour ? { background: colour } : undefined}
                      >
                        {owner >= 0 ? owner + 1 : ""}
                      </span>
                      <span className="min-w-0 flex-1">{item}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <p className="mr-auto text-sm text-[#16181d]/60">
            {pairs.filter(Boolean).length} of {left.length} paired
          </p>
          <SubmitButton disabled={disabled || !complete} onClick={() => onSubmit({ matches })} label="Submit board" />
        </div>
      </div>
    );
  },
);
