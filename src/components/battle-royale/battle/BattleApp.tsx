"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Hourglass } from "lucide-react";
import { battleApi } from "./api";
import { TitleScreen, type BootStep } from "./TitleScreen";
import { Hud, Timer } from "./Hud";
import { WordBlock } from "./WordBlock";
import { Matching } from "./Matching";
import { Quiz } from "./Quiz";
import { Countdown, Feedback, Finish, NextPrompt, RoundIntro } from "./Panels";
import type { DraftHandle } from "./types";
import type { Credentials } from "../CredentialsForm";
import type { AnswerPayload, AnswerResult, BattleState, PublicQuestion } from "@/lib/battle-royale/types";

/*
 * The station's state machine.
 *
 *   boot ─┬─ no battle on this device ─────────────▶ gate
 *         └─ battle found ─────────────────────────▶ ready
 *   gate ── Player ID + Game Code (start) ─────────▶ ready
 *   ready ── Press start ─▶ countdown (first time) ─▶ intro | question | between
 *   intro ── Begin (serve) ─────────────────────────▶ question
 *   question ── answer / timer ─────────────────────▶ feedback
 *   feedback ── Next ─▶ intro (new round) | question (serve) | finished
 *   finished ── Finish (forget cookie) ─────────────▶ gate
 *
 * Every transition that changes the battle goes through the server, and every
 * screen is rebuilt from the state the server returns — the client never
 * advances a round or adds a point on its own. A reload anywhere lands back in
 * the right place: `phaseFor()` maps any server state to its screen.
 */

type Phase = "boot" | "gate" | "ready" | "countdown" | "intro" | "between" | "question" | "feedback" | "finished" | "fatal";

type FeedbackData = {
  result: AnswerResult | { timedOut: true; expiredOnly: true };
  question: PublicQuestion;
  next: "question" | "round" | "finish";
  /** Where the answered question sat, so the HUD doesn't jump ahead to the next round. */
  at: { round: BattleState["round"]; index: number };
};

const FIRST_BOOT: BootStep[] = [
  { label: "Connecting to the arena", done: false },
  { label: "Looking for a battle on this station", done: false },
];
const START_BOOT: BootStep[] = [
  { label: "Verifying player", done: false },
  { label: "Drawing your questions", done: false },
  { label: "Syncing the clock", done: false },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function phaseFor(s: BattleState): Phase {
  if (s.status === "completed") return "finished";
  if (s.question) return "question";
  return s.index === 0 ? "intro" : "between";
}

export function BattleApp() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [steps, setSteps] = useState<BootStep[]>(FIRST_BOOT);
  const [state, setState] = useState<BattleState | null>(null);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [lastIdentifier, setLastIdentifier] = useState("");
  const [rank, setRank] = useState<{ rank: number | null; total: number | null }>({ rank: null, total: null });
  const draftRef = useRef<DraftHandle>(null);
  const submittingRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  const tick = (i: number) => setSteps((s) => s.map((x, k) => (k === i ? { ...x, done: true } : x)));

  const apply = useCallback((s: BattleState, clockOffset: number) => {
    setState(s);
    setOffset(clockOffset);
  }, []);

  // ── Boot: is there a battle on this device already? ────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await battleApi.state();
      if (cancelled) return;
      tick(0);
      await sleep(250);
      if (!res.ok) {
        setError(res.error);
        setPhase("gate");
        return;
      }
      tick(1);
      await sleep(300);
      if (res.data.notice === "BR_ATTEMPT_VOID") {
        setError("Your previous attempt was reset by a coordinator. Enter your details to start again.");
      }
      if (res.data.state) {
        apply(res.data.state, res.clockOffset);
        startedRef.current = res.data.state.answeredCount > 0 || Boolean(res.data.state.question);
        setPhase(res.data.state.status === "completed" ? "finished" : "ready");
      } else {
        setPhase("gate");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apply]);

  // ── Gate → ready ───────────────────────────────────────────────────────
  const enter = async (c: Credentials) => {
    setLastIdentifier(c.identifier);
    setBusy(true);
    setError(null);
    setSteps(START_BOOT);
    setPhase("boot");
    const res = await battleApi.start(c.identifier, c.gameCode);
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      setPhase("gate");
      return;
    }
    tick(0);
    await sleep(280);
    tick(1); // the questions were drawn by the same call
    await sleep(280);
    apply(res.data.state, res.clockOffset);
    tick(2);
    await sleep(320);
    setBusy(false);
    startedRef.current = Boolean(res.data.state.resumed);
    setPhase(res.data.state.status === "completed" ? "finished" : "ready");
  };

  // ── Ready → play ───────────────────────────────────────────────────────
  const pressStart = () => {
    if (!state) return;
    if (!startedRef.current && state.round === 1 && state.index === 0 && !state.question) setPhase("countdown");
    else setPhase(phaseFor(state));
  };

  const serve = async () => {
    setBusy(true);
    setError(null);
    const res = await battleApi.serve();
    setBusy(false);
    if (!res.ok) return handleFailure(res.error, res.code);
    startedRef.current = true;
    apply(res.data.state, res.clockOffset);
    setPhase(phaseFor(res.data.state));
  };

  // ── Answering ──────────────────────────────────────────────────────────
  const submit = useCallback(
    async (answer: AnswerPayload) => {
      if (!state?.question || submittingRef.current) return;
      submittingRef.current = true;
      setBusy(true);
      const question = state.question;
      const prevRound = state.round;
      const at = { round: state.round, index: state.index + 1 };
      const res = await battleApi.answer(question.id, answer);
      submittingRef.current = false;
      setBusy(false);
      if (!res.ok) {
        // Already answered or no longer current (a second tab, a slow network):
        // re-read the truth and carry on from there.
        if (res.code === "BR_DUPLICATE" || res.code === "BR_WRONG_QUESTION") return resync();
        return handleFailure(res.error, res.code);
      }
      const next = res.data.state;
      apply(next, res.clockOffset);
      setFeedback({
        result: res.data.result,
        question,
        next: next.status === "completed" ? "finish" : next.round !== prevRound ? "round" : "question",
        at,
      });
      setPhase("feedback");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state],
  );

  /** Timer hit zero: submit what's there, or let the server record the timeout. */
  const onExpire = useCallback(async () => {
    const draft = draftRef.current?.draft();
    if (draft) return submit(draft);
    if (!state?.question) return;
    const question = state.question;
    const prevRound = state.round;
    const at = { round: state.round, index: state.index + 1 };
    setBusy(true);
    // The server allows a short grace period; wait it out so the read expires the question.
    await sleep(2300);
    const res = await battleApi.state();
    setBusy(false);
    if (!res.ok || !res.data.state) return handleFailure(res.ok ? "Your battle could not be found." : res.error);
    const next = res.data.state;
    apply(next, res.clockOffset);
    if (next.question?.id === question.id) return; // not expired yet by the server's clock; keep going
    setFeedback({
      result: { timedOut: true, expiredOnly: true },
      question,
      next: next.status === "completed" ? "finish" : next.round !== prevRound ? "round" : "question",
      at,
    });
    setPhase("feedback");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, submit]);

  const afterFeedback = () => {
    if (!feedback || !state) return;
    setFeedback(null);
    if (feedback.next === "question") void serve();
    else setPhase(phaseFor(state));
  };

  // ── Recovery ───────────────────────────────────────────────────────────
  const resync = async () => {
    const res = await battleApi.state();
    if (!res.ok) return handleFailure(res.error);
    if (!res.data.state) {
      setState(null);
      setPhase("gate");
      return;
    }
    apply(res.data.state, res.clockOffset);
    setPhase(phaseFor(res.data.state));
  };

  function handleFailure(message: string, code?: string) {
    if (code === "BR_NO_ATTEMPT" || code === "BR_ATTEMPT_VOID") {
      setState(null);
      setError(message);
      setPhase("gate");
      return;
    }
    if (code === "BR_COMPLETED") return void resync();
    setError(message);
    // Network trouble mid-battle keeps the screen; the banner offers a retry.
    if (phase === "boot") setPhase("gate");
  }

  // ── Finished ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "finished" || !state) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/battle-royale/leaderboard?limit=1&code=${encodeURIComponent(state.participant.code)}`, { cache: "no-store" });
        const body = await res.json();
        if (!cancelled && res.ok) setRank({ rank: body.you?.rank ?? null, total: body.totalRanked ?? null });
      } catch {
        /* the rank is a nicety; the score is already on screen */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, state]);

  const finish = async () => {
    setBusy(true);
    await battleApi.leave();
    setBusy(false);
    setState(null);
    setFeedback(null);
    setError(null);
    setRank({ rank: null, total: null });
    setLastIdentifier("");
    startedRef.current = false;
    setPhase("gate");
  };

  // ── Render ─────────────────────────────────────────────────────────────
  if (phase === "boot" || phase === "gate" || phase === "ready") {
    return (
      <TitleScreen
        mode={phase}
        steps={steps}
        state={state}
        error={error}
        busy={busy}
        onEnter={enter}
        onStart={pressStart}
        lastIdentifier={lastIdentifier}
      />
    );
  }
  if (phase === "countdown") return <Countdown onDone={() => state && setPhase(phaseFor(state))} />;
  if (phase === "finished" && state) {
    return <Finish state={state} rank={rank.rank} totalRanked={rank.total} onFinish={finish} finishing={busy} />;
  }
  if (!state) return null;

  const q = state.question;
  return (
    <div className="min-h-dvh bg-[#f4f6f9]">
      <Hud
        state={phase === "feedback" && feedback ? { ...state, ...feedback.at } : state}
        timer={
          phase === "question" && q ? (
            <Timer deadline={q.deadline} total={q.timeLimit} clockOffset={offset} onExpire={onExpire} paused={busy} />
          ) : undefined
        }
      />

      {error && (
        <div className="mx-auto mt-4 flex max-w-3xl items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <button type="button" onClick={() => { setError(null); void resync(); }} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      <div className="mx-auto max-w-5xl">
        {phase === "intro" && <RoundIntro state={state} timeLimits="Per question" busy={busy} onBegin={serve} />}
        {phase === "between" && <NextPrompt state={state} busy={busy} onNext={serve} />}
        {phase === "feedback" && feedback && (
          <Feedback result={feedback.result} question={feedback.question} next={feedback.next} busy={busy} onNext={afterFeedback} />
        )}
        {phase === "question" && q && (
          <div className="px-5 py-8 sm:px-8 sm:py-12">
            <div className="rounded-3xl border border-[#16181d]/10 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(6,18,36,.35)] sm:p-8">
              {q.type === "WORD" && <WordBlock ref={draftRef} question={q} disabled={busy} onSubmit={submit} />}
              {q.type === "MATCHING" && <Matching ref={draftRef} question={q} disabled={busy} onSubmit={submit} />}
              {q.type === "MCQ" && <Quiz ref={draftRef} question={q} disabled={busy} onSubmit={submit} />}
            </div>
            {busy && (
              <p className="mt-4 flex items-center justify-center gap-2 text-sm text-[#16181d]/60">
                <Hourglass className="h-4 w-4" /> Submitting…
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
