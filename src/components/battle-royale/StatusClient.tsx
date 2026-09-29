"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Award, Check, CircleAlert, Hourglass, Medal, Search, Trophy } from "lucide-react";
import { BRAND_BUTTON, BRAND_SURFACE } from "@/components/page-kit";
import { Field, Notice, Spinner, inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";
import { Certificate } from "./certificate/Certificate";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import { statusSchema, type StatusInput } from "@/lib/battle-royale/schemas";
import { formatDuration, ordinal } from "@/lib/battle-royale/format";
import type { StatusPayload } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

/**
 * "My result & certificate". Before the battle it shows the ONE thing the
 * player should do next (non-technical players get lost in a full tracker);
 * after it, the score, the titles earned and the e-certificate.
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
      <form onSubmit={onSubmit} noValidate className="space-y-4 rounded-3xl border border-[#16181d]/10 bg-white p-6 sm:p-8">
        {error && <Notice tone="red" icon={<CircleAlert />}>{error}</Notice>}
        <Field id="st-id" label="Player ID" hint="It's in your registration email, e.g. BR-2026-0007." error={errors.playerId?.message}>
          <input id="st-id" autoFocus autoCapitalize="characters" spellCheck={false} placeholder="BR-2026-0001" className={cn(inputClass, "font-mono tracking-wide")} {...register("playerId")} />
        </Field>
        <Field id="st-email" label="Email you registered with" error={errors.email?.message}>
          <input id="st-email" type="email" autoComplete="email" className={inputClass} {...register("email")} />
        </Field>
        <button type="submit" disabled={busy} className={cn(primaryButtonClass, "w-full")} style={{ background: BRAND_BUTTON }}>
          {busy ? <Spinner /> : <Search className="h-4 w-4" />} {busy ? "Looking up…" : "Show my result"}
        </button>
      </form>
    );
  }

  const p = data.participant;
  const blocked = p.registrationStatus !== "registered";
  const next = !data.steps.paid
    ? { t: "Pay at the PharmaWallah desk", d: "Show your Player ID and pay the entry fee. The desk then gives you your Game Code." }
    : !data.steps.codeIssued
      ? { t: "Collect your Game Code", d: "Ask the desk for your Game Code slip." }
      : data.attemptStatus === "active"
        ? { t: "Your battle is in progress", d: "Finish it at the station. If the station stopped working, ask the desk for a new code — you'll continue where you left off." }
        : { t: "Go to any free station and play", d: "Tap Press Start, type your Game Code and play the three rounds." };
  const steps = [
    { label: "Registered", done: true },
    { label: "Paid", done: data.steps.paid },
    { label: "Game Code", done: data.steps.codeIssued },
    { label: "Played", done: data.steps.played },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-2xl font-bold">{p.name}</p>
        <p className="font-mono text-sm text-[#1C7BD9]">{p.code}</p>
      </div>

      {blocked && (
        <Notice tone="red" title={p.registrationStatus === "disqualified" ? "This participant has been disqualified." : "This registration was cancelled."}>
          Please speak to an event coordinator at the desk.
        </Notice>
      )}

      {!data.score && !blocked && (
        <>
          <ol className="grid grid-cols-4 gap-2" aria-label="Progress">
            {steps.map((s) => (
              <li key={s.label} className="text-center">
                <span className={cn("mx-auto flex h-9 w-9 items-center justify-center rounded-full", s.done ? "bg-[#21B67A] text-white" : "bg-[#16181d]/10 text-[#16181d]/40")}>
                  <Check className="h-4 w-4" />
                </span>
                <p className={cn("mt-1.5 text-xs font-semibold", !s.done && "text-[#16181d]/45")}>{s.label}</p>
              </li>
            ))}
          </ol>
          <div className="rounded-3xl border-2 border-[#1C7BD9]/30 bg-[#1C7BD9]/[0.05] p-6">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1C7BD9]">Your next step</p>
            <p className="mt-2 text-2xl font-bold">{next.t}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[#16181d]/70">{next.d}</p>
          </div>
          <p className="text-sm text-[#16181d]/60">Your score and e-certificate appear here as soon as you finish your battle.</p>
        </>
      )}

      {data.score && (
        <>
          <div className="relative overflow-hidden rounded-3xl p-6 text-white sm:p-8" style={{ background: BRAND_SURFACE }}>
            <div className="br-sheen" aria-hidden="true" />
            <div className="relative">
              {data.titles[0] && (
                <p className="inline-flex items-center gap-2 rounded-full bg-[#f5b301] px-3.5 py-1.5 text-sm font-extrabold uppercase tracking-wide text-[#3b2a00]">
                  <Award className="h-4 w-4" /> {data.titles[0].name}
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-end gap-x-10 gap-y-4">
                <div>
                  <p className="text-sm text-white/80">Total score</p>
                  <p className="text-6xl font-extrabold tracking-tight">{data.score.total}</p>
                </div>
                {data.rank && (
                  <div>
                    <p className="text-sm text-white/80">{data.finalized ? "Final rank" : "Rank right now"}</p>
                    <p className="text-4xl font-bold">{ordinal(data.rank)}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {ROUNDS.map((r, i) => (
                  <div key={r.no} className="rounded-2xl border border-white/25 bg-white/10 p-3">
                    <p className="text-xs text-white/75">{r.name}</p>
                    <p className="text-2xl font-bold">{data.score!.rounds[i]}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-white/85">
                {data.score.correct} of {data.score.questions} correct · {formatDuration(data.score.timeMs)} battle time
              </p>
            </div>
          </div>

          {data.titles.length > 0 && (
            <section aria-labelledby="st-titles">
              <h2 id="st-titles" className="text-lg font-bold">Titles you earned</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {data.titles.map((t, i) => (
                  <li key={t.id} className={cn("flex gap-3 rounded-2xl border p-4", i === 0 ? "border-[#f5b301]/60 bg-[#f5b301]/[0.08]" : "border-[#16181d]/10 bg-white")}>
                    <Medal className={cn("mt-0.5 h-5 w-5 shrink-0", i === 0 ? "text-[#b98500]" : "text-[#1C7BD9]")} />
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-sm text-[#16181d]/65">{t.reason}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!data.finalized ? (
            <Notice tone="blue" icon={<Hourglass />} title="Results aren't final yet.">
              Your score won&apos;t change, but your rank can while others play. The Top {data.winnersCount} receive a gold
              Certificate of Achievement once results are final — come back here then.
            </Notice>
          ) : data.score.finalStatus === "winner" ? (
            <Notice tone="green" icon={<Trophy />} title={`You're in the Top ${data.winnersCount}!`}>
              Collect your PharmaWallah Goodie Hamper at the stall.
            </Notice>
          ) : null}

          {data.certificate && (
            <section aria-labelledby="st-cert">
              <h2 id="st-cert" className="text-lg font-bold">
                Your e-certificate
                <span className="ml-2 align-middle text-sm font-medium text-[#16181d]/55">
                  {data.certificate.kind === "winner" ? "Certificate of Achievement" : "Certificate of Participation"}
                </span>
              </h2>
              <div className="mt-3">
                <Certificate data={data.certificate} />
              </div>
            </section>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href={`${BR_BASE}/leaderboard?code=${encodeURIComponent(p.code)}`} className={secondaryButtonClass}>Leaderboard</Link>
        <button type="button" className={secondaryButtonClass} onClick={() => setData(null)}>Look up someone else</button>
      </div>
    </div>
  );
}
