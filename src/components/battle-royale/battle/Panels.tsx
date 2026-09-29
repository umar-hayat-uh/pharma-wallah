"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, CloudOff, Loader2, Trophy, XCircle } from "lucide-react";
import { BRAND_SURFACE } from "@/components/page-kit";
import { Crest } from "../ui";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import { formatDuration, ordinal } from "@/lib/battle-royale/format";
import { allowedMsFromPlan, earnedTitles, perfectRounds } from "@/lib/battle-royale/titles";
import type { BattlePlan, BattleState, RoundNo, RoundResult } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Counts down and calls `onDone` at zero; the number is shown on the button. */
function useAutoAdvance(seconds: number, onDone: () => void, active = true) {
  const [left, setLeft] = useState(seconds);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (!active) return;
    setLeft(seconds);
    const started = Date.now();
    const id = window.setInterval(() => {
      const l = Math.max(0, seconds - Math.floor((Date.now() - started) / 1000));
      setLeft(l);
      if (l === 0) {
        window.clearInterval(id);
        done.current();
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [seconds, active]);
  return left;
}

/** 3 · 2 · 1 · GO before the first round. Skipped under reduced motion. */
export function Countdown({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(3);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (reduce) {
      done.current();
      return;
    }
    const id = window.setInterval(() => setN((v) => v - 1), 700);
    return () => window.clearInterval(id);
  }, [reduce]);
  useEffect(() => {
    if (n < 0) done.current();
  }, [n]);

  return (
    <div className="flex min-h-dvh items-center justify-center text-white" style={{ background: BRAND_SURFACE }} aria-live="assertive">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={n}
          initial={{ opacity: 0, scale: 1.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="text-[clamp(6rem,24vw,14rem)] font-extrabold leading-none tracking-tight"
        >
          {n > 0 ? n : "GO"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/**
 * The card before each round. It starts on its own after a few seconds: the
 * server's window for a round opens when the previous round arrives, so time
 * spent here is time spent from the round's allowance of grace.
 */
export function RoundIntro({ round, plan, score, onBegin }: { round: RoundNo; plan: BattlePlan; score: number; onBegin: () => void }) {
  const reduce = useReducedMotion();
  const r = ROUNDS[round - 1];
  const left = useAutoAdvance(20, onBegin);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), [round]);

  const facts: [string, string][] =
    round === 1
      ? [["Words to find", String(plan.r1.words.length)], ["Timer", `${Math.round(plan.r1.seconds / 60 * 10) / 10} min for the grid`]]
      : round === 2
        ? [["Boards", String(plan.r2.length)], ["Pairs", String(plan.r2.reduce((n, b) => n + b.left.length, 0))]]
        : [["Questions", String(plan.r3.length)], ["Timer", "Per question"]];

  return (
    <motion.section
      key={`intro-${round}`}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mx-auto w-full max-w-2xl px-5 py-12 text-center sm:py-20"
    >
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-[#1C7BD9]">Round {r.no} of 3</p>
      <h2 className="mt-3 text-5xl font-extrabold uppercase tracking-tight text-[#16181d] sm:text-6xl">{r.name}</h2>
      <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-[#16181d]/70">{r.how}</p>
      <dl className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3 text-left">
        {facts.map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-[#16181d]/10 bg-white p-4">
            <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/50">{k}</dt>
            <dd className="mt-1 text-xl font-bold">{v}</dd>
          </div>
        ))}
      </dl>
      {round > 1 && (
        <p className="mt-6 text-sm text-[#16181d]/60">
          Score so far: <strong className="text-[#16181d]">{score}</strong>
        </p>
      )}
      <button
        ref={ref}
        type="button"
        onClick={onBegin}
        className="mt-8 inline-flex h-14 items-center gap-2 rounded-2xl bg-[#1C7BD9] px-10 text-lg font-bold text-white shadow-[0_14px_30px_-14px_rgba(28,123,217,.9)] transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
      >
        Begin round {r.no} <ArrowRight className="h-5 w-5" />
      </button>
      <p className="mt-3 text-xs text-[#16181d]/55">Starts by itself in {left} s.</p>
    </motion.section>
  );
}

/**
 * After a round: the graded result if the server has it, or an honest
 * "saved on this station, syncing" if it doesn't — the player moves on either
 * way. Continues on its own after a while, for the same reason as the intro.
 */
export function RoundEnd({
  round,
  plan,
  result,
  syncing,
  onContinue,
}: {
  round: RoundNo;
  plan: BattlePlan;
  result: RoundResult | null;
  syncing: boolean;
  onContinue: () => void;
}) {
  const left = useAutoAdvance(round === 3 ? 999 : 30, onContinue, round !== 3);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), []);
  const r = ROUNDS[round - 1];

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14" aria-live="polite">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-[#1C7BD9]">Round {round} complete</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{r.name}</h2>
        {result ? (
          <p className="text-4xl font-extrabold text-[#1C7BD9]">+{result.score}</p>
        ) : (
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800">
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CloudOff className="h-4 w-4" />}
            Saved on this station — syncing
          </p>
        )}
      </div>

      {result?.late && (
        <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          This round reached the server after its time window, so it scores 0.
        </p>
      )}

      {result && "found" in result && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#21B67A]/30 bg-white p-4">
            <p className="text-sm font-semibold text-[#0f7a50]">Found · {result.found.length}</p>
            <p className="mt-2 text-sm leading-relaxed">{result.found.join(" · ") || "—"}</p>
          </div>
          <div className="rounded-2xl border border-[#16181d]/10 bg-white p-4">
            <p className="text-sm font-semibold text-[#16181d]/60">Missed · {result.missed.length}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#16181d]/70">{result.missed.join(" · ") || "None — perfect grid!"}</p>
          </div>
        </div>
      )}

      {result && "items" in result && (
        <ul className="mt-6 space-y-2">
          {result.items.map((it) => {
            const board = plan.r2.find((b) => b.id === it.questionId);
            const mcq = plan.r3.find((q) => q.id === it.questionId);
            return (
              <li key={it.questionId} className="rounded-2xl border border-[#16181d]/10 bg-white p-4 text-sm">
                <div className="flex items-start gap-3">
                  {it.correct ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#21B67A]" />
                  ) : (
                    <XCircle className={cn("mt-0.5 h-5 w-5 shrink-0", it.correctParts > 0 ? "text-amber-500" : "text-red-500")} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{board?.prompt ?? mcq?.prompt}</p>
                    {mcq && !it.correct && (
                      <p className="mt-1 text-[#16181d]/70">
                        {it.given ? <>You chose <strong>{String(it.given)}</strong>. </> : "No answer. "}
                        Correct: <strong>{String(it.correctAnswer)} — {mcq.options.find((o) => o.key === it.correctAnswer)?.text}</strong>
                      </p>
                    )}
                    {board && (
                      <p className="mt-1 text-[#16181d]/70">
                        {it.correctParts} of {it.totalParts} pairs correct
                        {!it.correct && Array.isArray(it.correctAnswer) && (
                          <> · {board.left.map((l, i) => `${l} → ${(it.correctAnswer as string[])[i]}`).join(" · ")}</>
                        )}
                      </p>
                    )}
                    {it.explanation && !it.correct && <p className="mt-1 text-xs text-[#16181d]/55">{it.explanation}</p>}
                  </div>
                  <span className="font-bold text-[#1C7BD9]">+{it.score}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!result && (
        <p className="mt-6 text-[15px] leading-relaxed text-[#16181d]/70">
          Your answers are stored on this station and will be sent as soon as the connection allows. You can carry on —
          the result of this round will appear at the end.
        </p>
      )}

      <div className="mt-8 flex items-center justify-end gap-4">
        {round !== 3 && <p className="text-xs text-[#16181d]/55">Continues by itself in {left} s</p>}
        <button
          ref={ref}
          type="button"
          onClick={onContinue}
          className="inline-flex h-14 items-center gap-2 rounded-2xl bg-[#1C7BD9] px-8 text-lg font-bold text-white shadow-[0_14px_30px_-14px_rgba(28,123,217,.9)] hover:brightness-110"
        >
          {round === 3 ? "See my result" : "Next round"} <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

/** Battle over. "Finish" is only offered once every round has reached the server. */
export function Finish({
  state,
  pending,
  syncing,
  rank,
  totalRanked,
  onRetry,
  onFinish,
}: {
  state: BattleState;
  pending: number;
  syncing: boolean;
  rank: number | null;
  totalRanked: number | null;
  onRetry: () => void;
  onFinish: () => void;
}) {
  const reduce = useReducedMotion();
  const synced = pending === 0 && state.status === "completed";
  // Same rule the status page and the certificate use (titles.ts).
  const title = synced
    ? earnedTitles({
        correct: state.correctCount,
        questions: state.totalQuestions,
        timeMs: state.totalTimeMs,
        allowedMs: allowedMsFromPlan(state.plan),
        perfect: perfectRounds(state.results),
      })[0]
    : null;
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5 py-12 text-white" style={{ background: BRAND_SURFACE }}>
      <div className="br-grid" aria-hidden="true" />
      <div className="br-sheen" aria-hidden="true" />
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative w-full max-w-2xl text-center"
      >
        <Crest size={64} className="mx-auto" />
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-white/85">Battle complete</p>
        <p className="mt-2 text-2xl font-bold">{state.participant.name}</p>
        <p className="font-mono text-sm text-white/80">{state.participant.code}</p>

        {synced ? (
          <>
            {title && (
              <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f5b301] px-4 py-1.5 text-base font-extrabold uppercase tracking-wide text-[#3b2a00]">
                <Trophy className="h-4 w-4" /> Title earned: {title.name}
              </p>
            )}
            <p className="mt-6 text-sm text-white/80">Final score</p>
            <p className="text-[clamp(4.5rem,16vw,8rem)] font-extrabold leading-none tracking-tight">{state.totalScore}</p>
            {rank && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-lg font-bold">
                <Trophy className="h-5 w-5" /> Currently {ordinal(rank)}
                {totalRanked ? <span className="font-medium text-white/80"> of {totalRanked}</span> : null}
              </p>
            )}
            <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-2">
              {ROUNDS.map((r, i) => (
                <div key={r.no} className="rounded-2xl border border-white/25 bg-white/10 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/75">Round {r.no}</p>
                  <p className="text-2xl font-bold">{state.roundScores[i]}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm text-white/85">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {state.correctCount} of {state.totalQuestions} correct</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatDuration(state.totalTimeMs)} total</span>
            </p>
          </>
        ) : (
          <div className="mx-auto mt-10 max-w-md rounded-3xl border border-white/25 bg-[#061224]/30 p-6">
            <p className="flex items-center justify-center gap-2 text-lg font-bold">
              {syncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CloudOff className="h-5 w-5" />}
              Sending your answers…
            </p>
            <p className="mt-2 text-sm text-white/85">
              {pending} round{pending === 1 ? "" : "s"} still to reach the server. They are saved on this station —
              <strong> don&apos;t close this screen</strong>. It retries automatically.
            </p>
            <button type="button" onClick={onRetry} disabled={syncing} className="mt-4 h-11 rounded-xl bg-white px-5 font-semibold text-[#0f4f8f] disabled:opacity-60">
              Retry now
            </button>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {synced && (
            <Link
              href={`${BR_BASE}/leaderboard?code=${encodeURIComponent(state.participant.code)}`}
              className="inline-flex h-12 items-center rounded-xl border border-white/45 px-6 font-semibold hover:bg-white/10"
            >
              View leaderboard
            </Link>
          )}
          <button
            type="button"
            onClick={onFinish}
            disabled={!synced}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-bold text-[#0f4f8f] disabled:opacity-50"
          >
            Finish — next player
          </button>
        </div>
        {synced && (
          <p className="mx-auto mt-6 max-w-md rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm text-white/90">
            <strong>Your e-certificate is ready.</strong> On your phone, open{" "}
            <span className="font-mono font-semibold">pharmawallah.com/battle-royale</span> → <strong>My result</strong>, and
            type your Player ID <span className="font-mono font-semibold">{state.participant.code}</span> and your email.
          </p>
        )}
        <p className="mt-4 text-xs text-white/75">Final results are announced when the competition closes.</p>
      </motion.div>
    </div>
  );
}
