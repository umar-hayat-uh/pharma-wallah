"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Check, CircleAlert, Hourglass, Search, Trophy } from "lucide-react";
import { BRAND_BUTTON, BRAND_SURFACE } from "@/components/page-kit";
import { Field, FinalBadge, Notice, Spinner, Stat, inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import { statusSchema, type StatusInput } from "@/lib/battle-royale/schemas";
import { formatDuration, ordinal } from "@/lib/battle-royale/format";
import type { StatusPayload } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

/**
 * The participant's side of the flow, as a tracker:
 * Registered → Payment approved → Game Code collected → Battle played → Result.
 */
export function StatusClient() {
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<StatusInput, unknown, z.output<typeof statusSchema>>({
    resolver: zodResolver(statusSchema),
    mode: "onTouched",
    defaultValues: { playerId: "", email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/battle-royale/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) setError(body.error ?? "Something went wrong. Please try again.");
      else setData(body as StatusPayload);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  });

  if (!data) {
    return (
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {error && <Notice tone="red" icon={<CircleAlert />}>{error}</Notice>}
        <Field id="st-id" label="Player ID" error={errors.playerId?.message}>
          <input id="st-id" autoFocus autoCapitalize="characters" spellCheck={false} placeholder="BR-2026-0001" className={cn(inputClass, "font-mono tracking-wide")} {...register("playerId")} />
        </Field>
        <Field id="st-email" label="Email you registered with" error={errors.email?.message}>
          <input id="st-email" type="email" autoComplete="email" className={inputClass} {...register("email")} />
        </Field>
        <button type="submit" disabled={busy} className={cn(primaryButtonClass, "w-full")} style={{ background: BRAND_BUTTON }}>
          {busy ? <Spinner /> : <Search className="h-4 w-4" />} {busy ? "Looking up…" : "Show my status"}
        </button>
      </form>
    );
  }

  const p = data.participant;
  const steps = [
    { label: "Registered", sub: p.code, done: true },
    { label: "Payment approved", sub: data.steps.paid ? "Rs. paid at the desk" : "Pay at the PharmaWallah desk", done: data.steps.paid },
    { label: "Game Code collected", sub: data.steps.codeIssued ? "Given to you at the desk" : "The desk gives it to you after payment", done: data.steps.codeIssued },
    { label: "Battle played", sub: data.attemptStatus === "active" ? "In progress" : data.steps.played ? "Complete" : "At any free station", done: data.steps.played },
  ];
  const nextIndex = steps.findIndex((s) => !s.done);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xl font-bold">{p.name}</p>
        <p className="text-sm text-[#16181d]/60"><span className="font-mono text-[#1C7BD9]">{p.code}</span> · {p.slot}</p>
      </div>

      {p.registrationStatus !== "registered" && (
        <Notice tone="red" title={p.registrationStatus === "disqualified" ? "This participant has been disqualified." : "This registration was cancelled."}>
          Please speak to an event coordinator at the desk.
        </Notice>
      )}

      <ol className="relative space-y-0">
        {steps.map((s, i) => (
          <li key={s.label} className="relative flex gap-4 pb-6 last:pb-0">
            {i < steps.length - 1 && <span className={cn("absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5", s.done ? "bg-[#21B67A]" : "bg-[#16181d]/10")} />}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                s.done ? "bg-[#21B67A] text-white" : i === nextIndex ? "bg-[#1C7BD9] text-white" : "bg-[#16181d]/10 text-[#16181d]/50",
              )}
            >
              {s.done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <div className="pt-1">
              <p className={cn("font-semibold", !s.done && i !== nextIndex && "text-[#16181d]/50")}>{s.label}</p>
              <p className="text-sm text-[#16181d]/60">{s.sub}</p>
            </div>
          </li>
        ))}
      </ol>

      {data.score && (
        <>
          <div className="relative overflow-hidden rounded-3xl p-6 text-white" style={{ background: BRAND_SURFACE }}>
            <div className="br-sheen" aria-hidden="true" />
            <div className="relative flex flex-wrap items-end gap-x-10 gap-y-4">
              <div>
                <p className="text-sm text-white/80">Total score</p>
                <p className="text-5xl font-extrabold tracking-tight">{data.score.total}</p>
              </div>
              {data.rank && (
                <div>
                  <p className="text-sm text-white/80">{data.finalized ? "Final rank" : "Current rank"}</p>
                  <p className="text-3xl font-bold">{ordinal(data.rank)}</p>
                </div>
              )}
              <div className="pb-1"><FinalBadge value={data.score.finalStatus} /></div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {ROUNDS.map((r, i) => <Stat key={r.no} label={`Round ${r.no}`} value={data.score!.rounds[i]} sub={r.name} />)}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Correct" value={`${data.score.correct} / ${data.score.questions}`} sub="Words, pairs and questions" />
            <Stat label="Battle time" value={formatDuration(data.score.timeMs)} sub="Measured by our server; breaks ties" />
          </div>
          {!data.finalized ? (
            <Notice tone="blue" icon={<Hourglass />} title="Results aren't final yet.">
              {data.frozen ? "The leaderboard is frozen and being verified." : "The leaderboard is still open, so your rank can change as others play."}
            </Notice>
          ) : data.score.finalStatus === "winner" ? (
            <Notice tone="green" icon={<Trophy />} title={`You're in the Top ${data.winnersCount}!`}>Collect your PharmaWallah Goodie Hamper at the stall.</Notice>
          ) : null}
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href={`${BR_BASE}/leaderboard?code=${encodeURIComponent(p.code)}`} className={secondaryButtonClass}>Leaderboard</Link>
        <button type="button" className={secondaryButtonClass} onClick={() => setData(null)}>Look up another</button>
      </div>
    </div>
  );
}
