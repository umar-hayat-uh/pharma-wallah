"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleAlert, Wallet } from "lucide-react";
import { BRAND_BUTTON } from "@/components/page-kit";
import { CredentialsForm, type Credentials } from "./CredentialsForm";
import { CheckInBadge, Notice, PaymentBadge, RegistrationBadge, primaryButtonClass, secondaryButtonClass } from "./ui";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import type { CheckInStatus, PaymentStatus, RegistrationStatus } from "@/lib/battle-royale/types";

type Result = {
  outcome: "checked_in" | "already" | "unpaid" | "blocked";
  participant: {
    name: string;
    code: string;
    slot: string;
    registrationStatus: RegistrationStatus;
    paymentStatus: PaymentStatus;
    checkInStatus: CheckInStatus;
  };
};

export function CheckInClient() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const submit = async (c: Credentials) => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/battle-royale/check-in", {
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
        <CredentialsForm onSubmit={submit} busy={busy} busyLabel="Checking…" submitLabel="Check in" autoFocus />
      </div>
    );
  }

  const p = result.participant;
  const ready = result.outcome === "checked_in" || (result.outcome === "already" && p.checkInStatus !== "not_checked_in");

  return (
    <div className="space-y-6">
      {result.outcome === "checked_in" && (
        <Notice tone="green" icon={<CheckCircle2 />} title="Check-in successful.">
          Head to any available gaming station and enter your Player ID and Game Code.
        </Notice>
      )}
      {result.outcome === "already" && ready && (
        <Notice tone="green" icon={<CheckCircle2 />} title="You&apos;re already checked in.">
          You&apos;re all set — head to a free station.
        </Notice>
      )}
      {result.outcome === "unpaid" && (
        <Notice tone="amber" icon={<Wallet />} title="Please pay the entry fee at the PharmaWallah desk.">
          Once the desk confirms your payment, they&apos;ll check you in — or you can come back here.
        </Notice>
      )}
      {result.outcome === "blocked" && (
        <Notice tone="red" icon={<CircleAlert />} title="This registration can&apos;t be checked in.">
          Please speak to an event coordinator at the desk.
        </Notice>
      )}

      <div className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
        <p className="text-lg font-bold">{p.name}</p>
        <p className="font-mono text-sm text-[#1C7BD9]">{p.code}</p>
        <dl className="mt-4 grid grid-cols-[8rem_minmax(0,1fr)] gap-y-2.5 text-sm">
          <dt className="text-[#16181d]/55">Battle slot</dt>
          <dd className="font-medium">{p.slot}</dd>
          <dt className="text-[#16181d]/55">Registration</dt>
          <dd><RegistrationBadge value={p.registrationStatus} /></dd>
          <dt className="text-[#16181d]/55">Entry fee</dt>
          <dd><PaymentBadge value={p.paymentStatus} /></dd>
          <dt className="text-[#16181d]/55">Check-in</dt>
          <dd><CheckInBadge value={p.checkInStatus} /></dd>
        </dl>
      </div>

      {ready && (
        <section className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
          <p className="font-semibold">Your battle, in brief</p>
          <ol className="mt-3 space-y-3">
            {ROUNDS.map((r) => (
              <li key={r.no} className="flex gap-3 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1C7BD9]/10 font-bold text-[#1C7BD9]">{r.no}</span>
                <span><strong>{r.name}.</strong> <span className="text-[#16181d]/70">{r.how}</span></span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-[#16181d]/70">Every question has its own timer, and answers are final once submitted.</p>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        {ready && (
          <Link href={`${BR_BASE}/battle`} className={primaryButtonClass} style={{ background: BRAND_BUTTON }}>
            Enter the arena <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        <Link href={`${BR_BASE}/instructions`} className={secondaryButtonClass}>Full instructions</Link>
        <button type="button" className={secondaryButtonClass} onClick={() => setResult(null)}>Check in someone else</button>
      </div>
    </div>
  );
}
