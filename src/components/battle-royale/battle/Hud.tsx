"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Crest } from "../ui";
import { ROUNDS } from "@/lib/battle-royale/constants";
import { secondsLeft } from "@/lib/battle-royale/format";
import type { BattleState } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

/**
 * The top bar during play: who is playing, which round, how far through it,
 * the running score (the server's total, never a client tally) and the clock.
 */
export function Hud({ state, timer }: { state: BattleState; timer?: React.ReactNode }) {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const onChange = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const size = state.roundSizes[state.round - 1];
  const round = ROUNDS[state.round - 1];

  return (
    <header className="sticky top-0 z-20 border-b border-[#16181d]/10 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <Crest size={34} className="hidden sm:inline-flex" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#16181d]">
            Round {state.round} · {round.name}
          </p>
          <div className="mt-1.5 flex items-center gap-1" aria-label={`Question ${Math.min(state.index + 1, size)} of ${size}`}>
            {Array.from({ length: size }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  i < state.index ? "bg-[#21B67A]" : i === state.index ? "bg-[#1C7BD9]" : "bg-[#16181d]/10",
                )}
              />
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#16181d]/50">Score</p>
          <p className="text-xl font-extrabold leading-none text-[#16181d]" aria-live="polite">{state.totalScore}</p>
        </div>
        {timer}
        <button
          type="button"
          onClick={toggleFull}
          className="hidden h-10 w-10 items-center justify-center rounded-xl border border-[#16181d]/10 text-[#16181d]/60 hover:text-[#16181d] sm:flex"
          aria-label={full ? "Exit full screen" : "Full screen"}
        >
          {full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

/**
 * A ring that empties towards the server's deadline. `onExpire` fires once,
 * when the displayed time reaches zero.
 */
export function Timer({
  deadline,
  total,
  clockOffset,
  onExpire,
  paused,
}: {
  deadline: string;
  total: number;
  clockOffset: number;
  onExpire: () => void;
  paused?: boolean;
}) {
  const [left, setLeft] = useState(() => secondsLeft(deadline, clockOffset));
  useEffect(() => {
    if (paused) return;
    let fired = false;
    const tick = () => {
      const s = secondsLeft(deadline, clockOffset);
      setLeft(s);
      if (s <= 0 && !fired) {
        fired = true;
        onExpire();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [deadline, clockOffset, onExpire, paused]);

  const r = 18;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.min(1, left / total) : 0;
  const urgent = left <= 5;
  return (
    <div className="relative h-12 w-12 shrink-0" role="timer" aria-label={`${left} seconds left`}>
      <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="#16181d" strokeOpacity=".1" strokeWidth="4" />
        <circle
          className="br-ring"
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={urgent ? "#dc2626" : left <= total / 3 ? "#f59e0b" : "#1C7BD9"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
        />
      </svg>
      <span className={cn("absolute inset-0 flex items-center justify-center text-sm font-extrabold", urgent ? "text-red-600" : "text-[#16181d]")}>
        {left}
      </span>
    </div>
  );
}
