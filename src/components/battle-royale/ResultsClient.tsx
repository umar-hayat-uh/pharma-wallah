"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleAlert, Hourglass, Trophy } from "lucide-react";
import { BRAND_SURFACE } from "@/components/page-kit";
import { CredentialsForm, type Credentials } from "./CredentialsForm";
import { FinalBadge, Notice, Stat, secondaryButtonClass } from "./ui";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import { formatDuration, ordinal } from "@/lib/battle-royale/format";
import type { FinalStatus, RegistrationStatus } from "@/lib/battle-royale/types";

type Result = {
  participant: { name: string; code: string; registrationStatus: RegistrationStatus };
  attemptStatus: "active" | "completed" | null;
  score: null | {
    rounds: [number, number, number];
    total: number;
    correct: number;
    questions: number;
    timeMs: number;
    finalStatus: FinalStatus;
  };
  rank: number | null;
  finalized: boolean;
  frozen: boolean;
  winnersCount: number;
};

export function ResultsClient() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const submit = async (c: Credentials) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/battle-royale/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) setError(body.error ?? "Something went wrong. Please try again.");
      else setResult(body as Result);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!result) {
    return (
      <div className="space-y-5">
        {error && <Notice tone="red" icon={<CircleAlert />}>{error}</Notice>}
        <CredentialsForm onSubmit={submit} busy={busy} busyLabel="Looking up…" submitLabel="Show my results" autoFocus />
      </div>
    );
  }

  const { participant: p, score } = result;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl p-6 text-white sm:p-8" style={{ background: BRAND_SURFACE }}>
        <div className="br-sheen" aria-hidden="true" />
        <div className="relative">
          <p className="font-mono text-sm text-white/85">{p.code}</p>
          <p className="mt-1 text-2xl font-bold sm:text-3xl">{p.name}</p>
          {score ? (
            <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-4">
              <div>
                <p className="text-sm text-white/80">Total score</p>
                <p className="text-5xl font-extrabold tracking-tight">{score.total}</p>
              </div>
              {result.rank && (
                <div>
                  <p className="text-sm text-white/80">{result.finalized ? "Final rank" : "Current rank"}</p>
                  <p className="text-3xl font-bold">{ordinal(result.rank)}</p>
                </div>
              )}
              <div className="pb-1"><FinalBadge value={score.finalStatus} /></div>
            </div>
          ) : (
            <p className="mt-4 text-white/85">
              {result.attemptStatus === "active"
                ? "Your battle is still in progress."
                : "You haven't played your battle yet."}
            </p>
          )}
        </div>
      </div>

      {p.registrationStatus === "disqualified" && (
        <Notice tone="red" title="This participant has been disqualified.">
          Disqualified scores are not ranked. Please speak to an event coordinator.
        </Notice>
      )}

      {score && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {ROUNDS.map((r, i) => (
              <Stat key={r.no} label={`Round ${r.no}`} value={score.rounds[i]} sub={r.name} />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Correct answers" value={`${score.correct} / ${score.questions}`} sub="Each matching pair counts as one" />
            <Stat label="Answering time" value={formatDuration(score.timeMs)} sub="Used to break ties" />
          </div>
          {!result.finalized && (
            <Notice tone="blue" icon={<Hourglass />} title="Results aren't final yet.">
              {result.frozen
                ? "The leaderboard is frozen and being verified. Final statuses appear here once it's done."
                : "The leaderboard is still open, so your rank can change as others play."}
            </Notice>
          )}
          {result.finalized && score.finalStatus === "winner" && (
            <Notice tone="green" icon={<Trophy />} title={`You're in the Top ${result.winnersCount}!`}>
              Collect your PharmaWallah Goodie Hamper at the stall.
            </Notice>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href={`${BR_BASE}/leaderboard?code=${encodeURIComponent(p.code)}`} className={secondaryButtonClass}>
          View on the leaderboard
        </Link>
        <button type="button" className={secondaryButtonClass} onClick={() => setResult(null)}>Look up another</button>
      </div>
    </div>
  );
}
