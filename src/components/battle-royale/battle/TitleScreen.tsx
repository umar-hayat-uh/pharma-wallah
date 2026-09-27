"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, CircleAlert, Play, RotateCcw } from "lucide-react";
import { BRAND_SURFACE } from "@/components/page-kit";
import { Crest } from "../ui";
import { CredentialsForm, type Credentials } from "../CredentialsForm";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import { shortName } from "@/lib/battle-royale/format";
import type { BattleState } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

export type BootStep = { label: string; done: boolean };

/**
 * The game's title screen — its landing and loading screen in one.
 *
 * It has three faces, and the event wordmark never moves between them, so the
 * station always looks like the same game:
 *   boot   — a progress bar and a checklist that track real work (reaching the
 *            server, verifying the player, drawing the questions, syncing the
 *            clock). Nothing is faked to look busy; each line ticks when the
 *            thing it names has happened.
 *   gate   — "Enter the arena": Player ID + Game Code.
 *   ready  — the player's card, the three rounds, and one big Start button
 *            (Enter works too). The first question is not served until Start,
 *            so reading this screen costs no time.
 */
export function TitleScreen({
  mode,
  steps,
  state,
  error,
  busy,
  onEnter,
  onStart,
  lastIdentifier,
}: {
  mode: "boot" | "gate" | "ready";
  steps: BootStep[];
  state: BattleState | null;
  error: string | null;
  busy: boolean;
  onEnter: (c: Credentials) => void;
  onStart: () => void;
  lastIdentifier?: string;
}) {
  const reduce = useReducedMotion();
  const startRef = useRef<HTMLButtonElement>(null);
  const done = steps.filter((s) => s.done).length;
  const progress = steps.length ? done / steps.length : 0;
  const resumed = Boolean(state && (state.answeredCount > 0 || state.question));

  useEffect(() => {
    if (mode === "ready") startRef.current?.focus();
  }, [mode]);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden text-white" style={{ background: BRAND_SURFACE }}>
      <div className="br-grid" aria-hidden="true" />
      <div className="br-sheen" aria-hidden="true" />

      <div className="relative flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href={BR_BASE} className="inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Battle Royale
        </Link>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/75">Pharma Fest · Gaming Arena</span>
      </div>

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 pb-12 sm:px-8">
        {/* The wordmark: identical on every face of the screen. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center"
        >
          <Crest size={84} />
          <p className="mt-5 text-sm font-semibold tracking-wide text-white/85">PharmaWallah</p>
          <h1 className="mt-1 text-[clamp(3rem,11vw,7rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.03em]">
            Battle Royale
          </h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.32em] text-white/85 sm:text-sm">
            Register · Play · Score · Dominate
          </p>
        </motion.div>

        <div className="mt-10 w-full max-w-md">
          {mode === "boot" && (
            <div role="status" aria-live="polite">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
                <div className="br-bar h-full rounded-full bg-white" style={{ transform: `scaleX(${Math.max(0.06, progress)})` }} />
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {steps.map((s, i) => {
                  const current = !s.done && steps.slice(0, i).every((p) => p.done);
                  return (
                    <li key={s.label} className={cn("flex items-center gap-2.5", s.done ? "text-white" : current ? "text-white/90" : "text-white/45")}>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/40">
                        {s.done ? <Check className="h-3 w-3" /> : current ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> : null}
                      </span>
                      {s.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {mode === "gate" && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-3xl border border-white/25 bg-[#061224]/30 p-6 sm:p-7"
            >
              <p className="text-xl font-bold">Enter the arena</p>
              <p className="mt-1 text-sm text-white/80">Checked in at the desk? Enter your Player ID and Game Code to begin.</p>
              {error && (
                <p role="alert" className="mt-4 flex gap-2 rounded-xl bg-white px-3.5 py-3 text-sm font-medium text-red-700">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> {error}
                </p>
              )}
              <div className="mt-5">
                <CredentialsForm tone="inverse" onSubmit={onEnter} busy={busy} busyLabel="Verifying…" submitLabel="Enter the arena" autoFocus defaultIdentifier={lastIdentifier} />
              </div>
              <p className="mt-4 text-center text-xs text-white/70">
                Not registered? <Link href={`${BR_BASE}/register`} className="font-semibold underline">Register</Link> or visit the desk.
              </p>
            </motion.div>
          )}

          {mode === "ready" && state && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <p className="text-sm text-white/80">Player</p>
              <p className="text-2xl font-bold">{shortName(state.participant.name)}</p>
              <p className="font-mono text-sm text-white/85">{state.participant.code}</p>

              <ol className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-2 text-left">
                {ROUNDS.map((r, i) => (
                  <li
                    key={r.no}
                    className={cn(
                      "rounded-2xl border px-3 py-3",
                      state.round > r.no || state.status === "completed"
                        ? "border-white/20 bg-white/5 text-white/60"
                        : state.round === r.no
                          ? "border-white/60 bg-white/15"
                          : "border-white/25 bg-white/[0.06]",
                    )}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/75">Round {r.no}</p>
                    <p className="mt-0.5 text-[13px] font-semibold leading-tight">{r.name}</p>
                    <p className="mt-1 text-[11px] text-white/70">{state.roundSizes[i]} {i === 1 ? (state.roundSizes[i] === 1 ? "board" : "boards") : "questions"}</p>
                  </li>
                ))}
              </ol>

              <button
                ref={startRef}
                type="button"
                onClick={onStart}
                disabled={busy}
                className="mt-8 inline-flex h-16 items-center gap-3 rounded-2xl bg-white px-10 text-lg font-extrabold uppercase tracking-[0.08em] text-[#0f4f8f] shadow-[0_18px_40px_-16px_rgba(6,18,36,.8)] transition-transform duration-300 ease-out-expo hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 active:scale-[0.98] disabled:opacity-60"
              >
                {resumed ? <RotateCcw className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                {resumed ? "Resume battle" : "Press start"}
              </button>
              <p className="mt-4 text-xs text-white/75">
                {resumed
                  ? "Your battle was saved. Any question whose timer ran out while you were away has been recorded."
                  : "One attempt · answers are final · every question has its own timer"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
