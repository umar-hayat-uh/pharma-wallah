"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { battleApi } from "./api";
import { TitleScreen, type BootStep } from "./TitleScreen";
import { Hud, Timer } from "./Hud";
import { WordSearch } from "./WordSearch";
import { Matching } from "./Matching";
import { Quiz } from "./Quiz";
import { Countdown, Finish, RoundEnd, RoundIntro } from "./Panels";
import { OUTDATED_ENGINE, answersFor, battleKey, freshProgress, isPlayable, load, save, type Progress, type Station } from "./station";
import type { DraftHandle } from "./types";
import type { FoundWord, RoundNo } from "@/lib/battle-royale/types";

/*
 * The station — offline-first.
 *
 *   boot ─┬─ a saved battle on this station ──────────▶ ready (resume)
 *         └─ nothing saved ────────────────────────────▶ gate
 *   gate ── Game Code (start: downloads the whole battle) ▶ ready
 *   ready ─▶ countdown (first time) ─▶ intro → play → end, per round ─▶ finish
 *
 * Network calls: ONE to start (everything, no answers), ONE per round to
 * submit, and a state read on boot. Every other step runs from the copy saved
 * in localStorage, so a flaky connection only delays the results — it never
 * stops the player. Submissions go into a queue that retries with backoff;
 * the server treats a repeated round as a no-op, so retrying is always safe.
 */

type Phase = "boot" | "gate" | "ready" | "countdown" | "intro" | "play" | "end" | "finish";

const FIRST_BOOT: BootStep[] = [
  { label: "Starting the station", done: false },
  { label: "Looking for a saved battle", done: false },
];
const START_BOOT: BootStep[] = [
  { label: "Checking your Game Code", done: false },
  { label: "Downloading your battle", done: false },
  { label: "Saving it on this station", done: false },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function phaseOf(p: Progress): Phase {
  return p.step === "finished" ? "finish" : p.step;
}

export function BattleApp() {
  const [phase, setPhase] = useState<Phase>("boot");
  const [steps, setSteps] = useState<BootStep[]>(FIRST_BOOT);
  const [station, setStation] = useState<Station | null>(null);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rank, setRank] = useState<{ rank: number | null; total: number | null }>({ rank: null, total: null });
  const draftRef = useRef<DraftHandle>(null);
  const stationRef = useRef<Station | null>(null);
  const syncingRef = useRef(false);
  const firstRun = useRef(true);
  const retryTimer = useRef<number | undefined>(undefined);
  const backoff = useRef(2000);

  const tick = (i: number) => setSteps((s) => s.map((x, k) => (k === i ? { ...x, done: true } : x)));

  /** The single writer: memory, localStorage and the ref move together. */
  const commit = useCallback((next: Station | null) => {
    stationRef.current = next;
    setStation(next);
    save(next);
  }, []);
  const update = useCallback(
    (fn: (s: Station) => Station) => {
      const cur = stationRef.current;
      if (cur) commit(fn(cur));
    },
    [commit],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase]);

  // ── Sync queue ─────────────────────────────────────────────────────────
  const flush = useCallback(async () => {
    const cur = stationRef.current;
    if (!cur || cur.queue.length === 0 || syncingRef.current) return;
    syncingRef.current = true;
    setSyncing(true);
    window.clearTimeout(retryTimer.current);
    try {
      while (stationRef.current && stationRef.current.queue.length > 0) {
        const item = stationRef.current.queue[0];
        const res = await battleApi.submit(item.round, item.answers);
        if (res.ok) {
          backoff.current = 2000;
          update((s) => ({ ...s, state: res.data.state, clockOffset: res.clockOffset, queue: s.queue.slice(1) }));
          continue;
        }
        if (res.code === "BR_ROUND_ORDER" || res.code === "BR_COMPLETED") {
          // The server and this queue disagree: re-read the server and keep
          // only the rounds it doesn't have yet.
          const st = await battleApi.state();
          if (st.ok && st.data.state) {
            const server = st.data.state;
            update((s) => ({ ...s, state: server, queue: s.queue.filter((q) => !(String(q.round) in server.results)) }));
            continue;
          }
        }
        if (res.code === "BR_NO_ATTEMPT" || res.code === "BR_ATTEMPT_VOID") {
          setError(`${res.error} Your answers are still saved on this station.`);
          break;
        }
        if (res.status === 0 || res.status >= 500 || res.status === 429) {
          // Offline or overloaded: wait and try again, backing off to every 20 s.
          retryTimer.current = window.setTimeout(() => void flush(), backoff.current);
          backoff.current = Math.min(backoff.current * 2, 20000);
          break;
        }
        setError(res.error);
        break;
      }
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [update]);

  useEffect(() => {
    const onOnline = () => void flush();
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.clearTimeout(retryTimer.current);
    };
  }, [flush]);

  // ── Boot ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let saved = load();
      if (saved && !isPlayable(saved.state)) {
        save(null);
        saved = null;
      }
      tick(0);
      await sleep(250);
      if (saved) {
        // Play on from the saved copy at once; refresh from the server in the
        // background if it answers.
        commit(saved);
        tick(1);
        await sleep(250);
        if (cancelled) return;
        firstRun.current = false;
        setPhase(saved.progress.step === "finished" ? "finish" : "ready");
        void flush();
        const res = await battleApi.state();
        if (!cancelled && res.ok && res.data.state && battleKey(res.data.state) === saved.key) {
          const server = res.data.state;
          update((s) => ({ ...s, state: server, clockOffset: res.clockOffset }));
        }
        return;
      }
      const res = await battleApi.state();
      if (cancelled) return;
      tick(1);
      await sleep(250);
      if (res.ok && res.data.state && !isPlayable(res.data.state)) {
        void battleApi.leave();
        setError(OUTDATED_ENGINE);
        setPhase("gate");
      } else if (res.ok && res.data.state) {
        // A cookie but no saved copy (storage cleared): rebuild from the server.
        const st = res.data.state;
        commit({ key: battleKey(st), state: st, clockOffset: res.clockOffset, progress: freshProgress(st), queue: [] });
        firstRun.current = Object.keys(st.results).length === 0;
        setPhase(st.status === "completed" ? "finish" : "ready");
      } else {
        if (res.ok && res.data.notice === "BR_ATTEMPT_VOID") setError("Your previous attempt was reset. Ask the desk for a new Game Code.");
        setPhase("gate");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [commit, flush, update]);

  // ── Gate → ready ───────────────────────────────────────────────────────
  const enter = async (code: string) => {
    setBusy(true);
    setError(null);
    setSteps(START_BOOT);
    setPhase("boot");
    const res = await battleApi.start(code);
    if (!res.ok) {
      setBusy(false);
      setError(res.error);
      setPhase("gate");
      return;
    }
    if (!isPlayable(res.data.state)) {
      void battleApi.leave();
      setBusy(false);
      setError(OUTDATED_ENGINE);
      setPhase("gate");
      return;
    }
    tick(0);
    await sleep(250);
    tick(1);
    const st = res.data.state;
    const saved = load();
    // A re-issued code on the same station keeps the local progress and queue.
    const keep = saved && saved.key === battleKey(st);
    commit(
      keep
        ? { ...saved, state: st, clockOffset: res.clockOffset }
        : { key: battleKey(st), state: st, clockOffset: res.clockOffset, progress: freshProgress(st), queue: [] },
    );
    await sleep(250);
    tick(2);
    await sleep(300);
    setBusy(false);
    firstRun.current = !st.resumed;
    setPhase(st.status === "completed" ? "finish" : "ready");
    if (keep) void flush();
  };

  // ── Playing ────────────────────────────────────────────────────────────
  const setProgress = (fn: (p: Progress) => Progress) => update((s) => ({ ...s, progress: fn(s.progress) }));

  const pressStart = () => {
    const s = stationRef.current;
    if (!s) return;
    if (firstRun.current && s.progress.round === 1 && s.progress.step === "intro") {
      firstRun.current = false;
      setPhase("countdown");
    } else {
      setPhase(phaseOf(s.progress));
    }
  };

  const begin = () => {
    setProgress((p) => ({ ...p, step: "play", startedAt: p.startedAt ?? Date.now(), index: 0 }));
    setPhase("play");
  };

  /** Queue the round, show its end screen, and try to send it. */
  const endRound = () => {
    const s = stationRef.current;
    if (!s || s.progress.step !== "play") return;
    const round = s.progress.round;
    update((cur) => ({
      ...cur,
      queue: cur.queue.some((q) => q.round === round) ? cur.queue : [...cur.queue, { round, answers: answersFor(round, cur.progress) }],
      progress: { ...cur.progress, step: round === 3 ? "finished" : "end", startedAt: null },
    }));
    setPhase(round === 3 ? "finish" : "end");
    void flush();
  };

  const nextRound = () => {
    setProgress((p) => ({ ...p, round: (p.round + 1) as RoundNo, step: "intro", startedAt: null, index: 0 }));
    setPhase("intro");
  };

  const onFind = (w: FoundWord) =>
    setProgress((p) => (p.found.some((f) => f.word === w.word) ? p : { ...p, found: [...p.found, w] }));

  /** Record the current board / question, then move on (or end the round). */
  const recordItem = (answer: { matches: string[] } | { choice: "A" | "B" | "C" | "D" } | null) => {
    const s = stationRef.current;
    if (!s || s.progress.step !== "play") return;
    const { round, index } = s.progress;
    const items = round === 2 ? s.state.plan.r2 : s.state.plan.r3;
    const item = items[index];
    if (!item) return;
    setProgress((p) => {
      if (round === 2) {
        const matches = answer && "matches" in answer ? answer.matches : [];
        return { ...p, boards: [...p.boards.filter((b) => b.questionId !== item.id), { questionId: item.id, matches }] };
      }
      const choice = answer && "choice" in answer ? answer.choice : null;
      return { ...p, choices: [...p.choices.filter((c) => c.questionId !== item.id), { questionId: item.id, choice }] };
    });
    if (index + 1 < items.length) setProgress((p) => ({ ...p, index: p.index + 1, startedAt: Date.now() }));
    else endRound();
  };

  const onItemExpire = () => recordItem(draftRef.current?.draft() ?? null);

  // ── Finish ─────────────────────────────────────────────────────────────
  const completed = station?.state.status === "completed" && station.queue.length === 0;
  const code = station?.state.participant.code;
  useEffect(() => {
    if (phase !== "finish" || !completed || !code) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/battle-royale/leaderboard?limit=20&code=${encodeURIComponent(code)}`, { cache: "no-store" });
        const body = await res.json();
        if (!cancelled && res.ok) setRank({ rank: body.you?.rank ?? null, total: body.totalRanked ?? null });
      } catch {
        /* the rank is a nicety */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, completed, code]);

  const finish = async () => {
    await battleApi.leave();
    commit(null);
    setError(null);
    setRank({ rank: null, total: null });
    firstRun.current = true;
    setSteps(FIRST_BOOT);
    setPhase("gate");
  };

  // ── Render ─────────────────────────────────────────────────────────────
  if (phase === "boot" || phase === "gate" || phase === "ready") {
    return (
      <TitleScreen mode={phase} steps={steps} state={station?.state ?? null} error={error} busy={busy} onEnter={enter} onStart={pressStart} />
    );
  }
  if (!station) return null;
  if (phase === "countdown") return <Countdown onDone={() => setPhase("intro")} />;
  if (phase === "finish") {
    return (
      <Finish
        state={station.state}
        pending={station.queue.length}
        syncing={syncing}
        rank={rank.rank}
        totalRanked={rank.total}
        onRetry={() => void flush()}
        onFinish={finish}
      />
    );
  }

  const { state, progress } = station;
  const plan = state.plan;
  const round = progress.round;
  const size = round === 1 ? plan.r1.words.length : round === 2 ? plan.r2.length : plan.r3.length;
  const hudIndex = round === 1 ? progress.found.length : progress.index;
  const board = round === 2 ? plan.r2[progress.index] : undefined;
  const mcq = round === 3 ? plan.r3[progress.index] : undefined;

  const timer =
    phase === "play" && progress.startedAt !== null ? (
      <Timer
        key={`${round}-${progress.index}-${progress.startedAt}`}
        startedAt={progress.startedAt}
        total={round === 1 ? plan.r1.seconds : ((board ?? mcq)?.timeLimit ?? 30)}
        onExpire={round === 1 ? endRound : onItemExpire}
      />
    ) : undefined;

  return (
    <div className="min-h-dvh bg-[#f4f6f9]">
      <Hud round={round} index={hudIndex} size={size} score={state.totalScore} pending={station.queue.length} timer={timer} />

      {error && (
        <div className="mx-auto mt-4 flex max-w-3xl items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">{error}</p>
          <button type="button" onClick={() => { setError(null); void flush(); }} className="font-semibold underline">
            Retry
          </button>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        {phase === "intro" && <RoundIntro round={round} plan={plan} score={state.totalScore} onBegin={begin} />}
        {phase === "end" && (
          <RoundEnd round={round} plan={plan} result={state.results[String(round) as "1" | "2" | "3"] ?? null} syncing={syncing} onContinue={nextRound} />
        )}
        {phase === "play" && (
          <div className="px-4 py-6 sm:px-8 sm:py-10">
            <div className="rounded-3xl border border-[#16181d]/10 bg-white p-4 shadow-[0_24px_60px_-40px_rgba(6,18,36,.35)] sm:p-8">
              {round === 1 && <WordSearch plan={plan.r1} found={progress.found} disabled={false} onFind={onFind} onFinish={endRound} />}
              {board && <Matching key={board.id} ref={draftRef} question={board} disabled={false} onSubmit={(a) => recordItem(a)} />}
              {mcq && <Quiz key={mcq.id} ref={draftRef} question={mcq} disabled={false} onSubmit={(a) => recordItem(a)} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
