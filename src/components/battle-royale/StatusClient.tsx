"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ArrowLeft, Check, CircleAlert, IdCard, Search } from "lucide-react";
import { BRAND_BUTTON } from "@/components/page-kit";
import { Field, Notice, Spinner, inputClass, primaryButtonClass, secondaryButtonClass } from "./ui";
import { CertificateSearch } from "./CertificateSearch";
import { ResultView } from "./ResultView";
import { BR_BASE } from "@/lib/battle-royale/constants";
import { statusSchema, type StatusInput } from "@/lib/battle-royale/schemas";
import type { StatusPayload } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

/**
 * "My result & certificate". Leads with the name search — pick your name,
 * get your certificate (players forget their Player ID). The Player ID +
 * email lookup stays one tap away for the pre-battle tracker, and is hidden
 * once the tournament is closed, when there is nothing left to track.
 */
export function StatusClient({ closed }: { closed: boolean }) {
  const [byId, setById] = useState(false);
  if (byId) return <IdLookup onBack={() => setById(false)} />;
  return (
    <div className="space-y-5">
      <CertificateSearch />
      {!closed && (
        <button type="button" onClick={() => setById(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1C7BD9] hover:underline">
          <IdCard className="h-4 w-4" /> Haven&apos;t played yet? Check your registration with your Player ID
        </button>
      )}
    </div>
  );
}

/**
 * Player ID + email. Before the battle it shows the ONE thing the player
 * should do next (non-technical players get lost in a full tracker); after
 * it, the same result view as the name search.
 */
function IdLookup({ onBack }: { onBack: () => void }) {
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
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1C7BD9] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Find my certificate by name instead
        </button>
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
  const next = data.closed
    ? { t: "The tournament has ended", d: "Battle Royale is closed, so this registration can no longer play. See the leaderboard for the results." }
    : !data.steps.paid
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
          {!data.closed && <p className="text-sm text-[#16181d]/60">Your score and e-certificate appear here as soon as you finish your battle.</p>}
        </>
      )}

      {data.score && <ResultView data={{ ...data, score: data.score }} />}

      <div className="flex flex-wrap gap-3">
        <Link href={`${BR_BASE}/leaderboard?code=${encodeURIComponent(p.code)}`} className={secondaryButtonClass}>Leaderboard</Link>
        <button type="button" className={secondaryButtonClass} onClick={() => setData(null)}>Look up someone else</button>
      </div>
    </div>
  );
}
