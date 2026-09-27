"use client";

import { useEffect, useRef, useState } from "react";
import { CloudOff, Maximize2, Minimize2 } from "lucide-react";
import { Crest } from "../ui";
import { ROUNDS } from "@/lib/battle-royale/constants";
import { remaining } from "./station";
import { cn } from "@/lib/utils";

/**
 * The top bar during play: which round, how far through it, the score the
 * server has confirmed so far (never a client tally), the clock, and whether
 * this station has unsynced answers.
 */
export function Hud({
  round,
  index,
  size,
  score,
  pending,
  timer,
}: {
  round: 1 | 2 | 3;
  index: number;
  size: number;
  score: number;
  pending: number;
  timer?: React.ReactNode;
}) {
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
  const r = ROUNDS[round - 1];

  return (
    <header className="sticky top-0 z-20 border-b border-[#16181d]/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <Crest size={34} className="hidden sm:inline-flex" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#16181d]">
            Round {round} · {r.name}
            {pending > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                <CloudOff className="h-3 w-3" /> {pending} round{pending === 1 ? "" : "s"} syncing
              </span>
            )}
          </p>
          <div className="mt-1.5 flex items-center gap-1" aria-label={`Item ${Math.min(index + 1, size)} of ${size}`}>
            {Array.from({ length: size }, (_, i) => (
              <span
                key={i}
                className={cn("h-1.5 flex-1 rounded-full", i < index ? "bg-[#21B67A]" : i === index ? "bg-[#1C7BD9]" : "bg-[#16181d]/10")}
              />
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#16181d]/50">Score</p>
          <p className="text-xl font-extrabold leading-none text-[#16181d]" aria-live="polite">{score}</p>
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
 * A ring that empties as the device timer runs down. `onExpire` fires once.
 * This clock only decides when the station stops taking input; the server
 * applies its own window when the round arrives.
 */
export function Timer({ startedAt, total, onExpire }: { startedAt: number; total: number; onExpire: () => void }) {
  const [left, setLeft] = useState(() => remaining(startedAt, total));
  const fire = useRef(onExpire);
  fire.current = onExpire;
  useEffect(() => {
    let fired = false;
    const tick = () => {
      const s = remaining(startedAt, total);
      setLeft(s);
      if (s <= 0 && !fired) {
        fired = true;
        fire.current();
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [startedAt, total]);

  const r = 18;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.min(1, left / total) : 0;
  const urgent = left <= 5;
  const label = left >= 60 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}` : String(left);
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
      <span className={cn("absolute inset-0 flex items-center justify-center font-extrabold", left >= 60 ? "text-[11px]" : "text-sm", urgent ? "text-red-600" : "text-[#16181d]")}>
        {label}
      </span>
    </div>
  );
}
