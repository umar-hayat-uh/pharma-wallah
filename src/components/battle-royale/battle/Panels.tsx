"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Clock, Hourglass, Loader2, Trophy, XCircle, Zap } from "lucide-react";
import { BRAND_SURFACE } from "@/components/page-kit";
import { Crest } from "../ui";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import { formatDuration, ordinal } from "@/lib/battle-royale/format";
import type { AnswerResult, BattleState, PublicQuestion } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

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

/** The card before each round. Serving the first question waits for "Begin". */
export function RoundIntro({
  state,
  timeLimits,
  busy,
  onBegin,
}: {
  state: BattleState;
  timeLimits: string;
  busy: boolean;
  onBegin: () => void;
}) {
  const reduce = useReducedMotion();
  const r = ROUNDS[state.round - 1];
  const size = state.roundSizes[state.round - 1];
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), [state.round]);

  return (
    <motion.section
      key={`intro-${state.round}`}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="mx-auto w-full max-w-2xl px-5 py-12 text-center sm:py-20"
    >
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-[#1C7BD9]">Round {r.no} of 3</p>
      <h2 className="mt-3 text-5xl font-extrabold uppercase tracking-tight text-[#16181d] sm:text-6xl">{r.name}</h2>
      <p className="mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-[#16181d]/70">{r.how}</p>
      <dl className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-3 text-left">
        <div className="rounded-2xl border border-[#16181d]/10 bg-white p-4">
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/50">{state.round === 2 ? "Boards" : "Questions"}</dt>
          <dd className="mt-1 text-2xl font-bold">{size}</dd>
        </div>
        <div className="rounded-2xl border border-[#16181d]/10 bg-white p-4">
          <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/50">Timer</dt>
          <dd className="mt-1 text-2xl font-bold">{timeLimits}</dd>
        </div>
      </dl>
      {state.round > 1 && (
        <p className="mt-6 text-sm text-[#16181d]/60">
          Score so far: <strong className="text-[#16181d]">{state.totalScore}</strong>
        </p>
      )}
      <button
        ref={ref}
        type="button"
        onClick={onBegin}
        disabled={busy}
        className="mt-8 inline-flex h-14 items-center gap-2 rounded-2xl bg-[#1C7BD9] px-10 text-lg font-bold text-white shadow-[0_14px_30px_-14px_rgba(28,123,217,.9)] transition-[filter,transform] hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {busy ? "Loading challenge…" : `Begin round ${r.no}`}
        {!busy && <ArrowRight className="h-5 w-5" />}
      </button>
      <p className="mt-3 text-xs text-[#16181d]/50">The timer starts when the question appears.</p>
    </motion.section>
  );
}

/** Between questions after a reload: nothing is served until the player is ready. */
export function NextPrompt({ state, busy, onNext }: { state: BattleState; busy: boolean; onNext: () => void }) {
  const size = state.roundSizes[state.round - 1];
  return (
    <section className="mx-auto max-w-xl px-5 py-20 text-center">
      <p className="font-mono text-sm uppercase tracking-[0.3em] text-[#1C7BD9]">Round {state.round}</p>
      <h2 className="mt-3 text-3xl font-bold">Ready for question {state.index + 1} of {size}?</h2>
      <button
        type="button"
        autoFocus
        onClick={onNext}
        disabled={busy}
        className="mt-8 inline-flex h-14 items-center gap-2 rounded-2xl bg-[#1C7BD9] px-10 text-lg font-bold text-white disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {busy ? "Loading challenge…" : "Next question"}
      </button>
    </section>
  );
}

/** What the player just got, with the correct answer revealed after it was recorded. */
export function Feedback({
  result,
  question,
  next,
  busy,
  onNext,
}: {
  result: AnswerResult | { timedOut: true; expiredOnly: true };
  question: PublicQuestion;
  next: "question" | "round" | "finish";
  busy: boolean;
  onNext: () => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), []);

  const expiredOnly = "expiredOnly" in result;
  const r = expiredOnly ? null : (result as AnswerResult);
  const tone = r?.correct ? "green" : r && r.correctParts > 0 ? "amber" : "red";

  const heading = expiredOnly || r?.timedOut
    ? "Time's up"
    : r!.correct
      ? "Correct!"
      : question.type === "MATCHING" && r!.correctParts > 0
        ? `${r!.correctParts} of ${r!.totalParts} pairs correct`
        : "Not quite";

  const answerText = (() => {
    if (!r) return null;
    const a = r.correctAnswer;
    if (question.type === "MCQ" && typeof a === "string") {
      const opt = question.options?.find((o) => o.key === a);
      return opt ? `${a} — ${opt.text}` : a;
    }
    if (question.type === "WORD") return String(a);
    return null;
  })();

  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14"
      aria-live="polite"
    >
      <div
        className={cn(
          "rounded-3xl border-2 bg-white p-6 sm:p-8",
          tone === "green" ? "border-[#21B67A]/60" : tone === "amber" ? "border-amber-300" : "border-red-200",
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {expiredOnly || r?.timedOut ? (
              <Hourglass className="h-9 w-9 text-red-500" />
            ) : r!.correct ? (
              <CheckCircle2 className="h-9 w-9 text-[#21B67A]" />
            ) : (
              <XCircle className={cn("h-9 w-9", tone === "amber" ? "text-amber-500" : "text-red-500")} />
            )}
            <h2 className="text-3xl font-extrabold tracking-tight">{heading}</h2>
          </div>
          {r && (
            <div className="text-right">
              <p className="text-3xl font-extrabold text-[#1C7BD9]">+{r.score}</p>
              {r.bonusPoints > 0 && (
                <p className="inline-flex items-center gap-1 text-xs font-semibold text-[#0f7a50]">
                  <Zap className="h-3.5 w-3.5" /> {r.basePoints} + {r.bonusPoints} speed bonus
                </p>
              )}
            </div>
          )}
        </div>

        {expiredOnly && <p className="mt-4 text-[15px] text-[#16181d]/70">The timer ran out before an answer was submitted, so this question scores 0.</p>}
        {r?.timedOut && <p className="mt-4 text-[15px] text-[#16181d]/70">Your answer arrived after the timer ended, so it scores 0.</p>}

        {answerText && !(r?.correct) && (
          <p className="mt-5 text-[15px]">
            <span className="text-[#16181d]/60">Correct answer: </span>
            <strong>{answerText}</strong>
          </p>
        )}

        {r && question.type === "MATCHING" && Array.isArray(r.correctAnswer) && !r.correct && (
          <ul className="mt-5 grid gap-1.5 text-sm">
            {(question.left ?? []).map((l, i) => (
              <li key={l} className="grid grid-cols-[minmax(0,1fr)_1rem_minmax(0,1fr)] items-center gap-2 rounded-lg bg-[#16181d]/[0.03] px-3 py-2">
                <span className="font-semibold">{l}</span>
                <span className="text-[#16181d]/40">→</span>
                <span>{(r.correctAnswer as string[])[i]}</span>
              </li>
            ))}
          </ul>
        )}

        {r?.explanation && <p className="mt-5 border-t border-[#16181d]/10 pt-4 text-sm leading-relaxed text-[#16181d]/70">{r.explanation}</p>}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          ref={ref}
          type="button"
          onClick={onNext}
          disabled={busy}
          className="inline-flex h-14 items-center gap-2 rounded-2xl bg-[#1C7BD9] px-8 text-lg font-bold text-white shadow-[0_14px_30px_-14px_rgba(28,123,217,.9)] transition-[filter,transform] hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {busy ? "Loading challenge…" : next === "finish" ? "See my result" : next === "round" ? "Next round" : "Next question"}
          {!busy && <ArrowRight className="h-5 w-5" />}
        </button>
      </div>
    </motion.section>
  );
}

/** Battle over. "Finish" clears this device for the next player. */
export function Finish({
  state,
  rank,
  totalRanked,
  onFinish,
  finishing,
}: {
  state: BattleState;
  rank: number | null;
  totalRanked: number | null;
  onFinish: () => void;
  finishing: boolean;
}) {
  const reduce = useReducedMotion();
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

        <p className="mt-8 text-sm text-white/80">Final score</p>
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
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {formatDuration(state.totalTimeMs)} answering</span>
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href={`${BR_BASE}/leaderboard?code=${encodeURIComponent(state.participant.code)}`}
            className="inline-flex h-12 items-center rounded-xl border border-white/45 px-6 font-semibold hover:bg-white/10"
          >
            View leaderboard
          </Link>
          <button
            type="button"
            onClick={onFinish}
            disabled={finishing}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 font-bold text-[#0f4f8f] disabled:opacity-60"
          >
            {finishing && <Loader2 className="h-4 w-4 animate-spin" />}
            Finish — next player
          </button>
        </div>
        <p className="mt-4 text-xs text-white/75">Your score is saved. Final results are announced when the competition closes.</p>
      </motion.div>
    </div>
  );
}
