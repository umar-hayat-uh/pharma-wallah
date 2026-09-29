"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Mail, MailWarning, Printer } from "lucide-react";
import { BRAND_BUTTON, BRAND_SURFACE } from "@/components/page-kit";
import { Crest, Notice, SkeletonRows, primaryButtonClass, secondaryButtonClass } from "./ui";
import { RECEIPT_KEY } from "./RegistrationForm";
import { ARRIVAL_POINTS } from "./copy";
import { BR_BASE } from "@/lib/battle-royale/constants";
import type { RegistrationReceipt } from "@/lib/battle-royale/types";

/**
 * Shows the receipt the register route returned. It lives in sessionStorage
 * for this tab only — the page has no ID in its URL, so a shared or guessed
 * link can never display someone else's Game Code.
 */
export function SuccessCard() {
  const [receipt, setReceipt] = useState<RegistrationReceipt | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(RECEIPT_KEY);
      setReceipt(raw ? (JSON.parse(raw) as RegistrationReceipt) : null);
    } catch {
      setReceipt(null);
    }
  }, []);

  if (receipt === undefined) return <SkeletonRows rows={6} />;

  if (receipt === null) {
    return (
      <div className="space-y-5 text-center">
        <Mail className="mx-auto h-10 w-10 text-[#1C7BD9]" />
        <h1 className="text-2xl font-bold">Looking for your confirmation?</h1>
        <p className="text-[15px] text-[#16181d]/65">
          Your Player ID was emailed to you when you registered. If you can&apos;t find the email,
          check your spam folder or ask at the PharmaWallah desk.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={`${BR_BASE}/register`} className={secondaryButtonClass}>Register</Link>
          <Link href={`${BR_BASE}/status`} className={primaryButtonClass} style={{ background: BRAND_BUTTON }}>My result</Link>
        </div>
      </div>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Player ID: ${receipt.code}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the codes are on screen anyway */
    }
  };

  const rows: [string, string][] = [
    ["Participant", receipt.name],
    ["Participant ID", receipt.code],
    ["Email", receipt.email ?? "—"],
    ["Battle slot", receipt.slot ?? "Walk-in — any open station"],
    ["Event date", receipt.eventDate ?? "To be announced"],
    ["Reporting time", receipt.reportingTime || "Any time the stall is open"],
    ["Venue", receipt.venue || "PharmaWallah stall"],
  ];

  return (
    <div className="space-y-6">
      <article className="br-print-card overflow-hidden rounded-3xl border border-[#16181d]/10 bg-white shadow-[0_24px_60px_-32px_rgba(6,18,36,.35)]">
        <header className="relative overflow-hidden px-6 py-7 text-white sm:px-8" style={{ background: BRAND_SURFACE }}>
          <div className="br-sheen" aria-hidden="true" />
          <div className="relative flex items-center gap-4">
            <Crest size={52} />
            <div>
              <p className="text-sm font-semibold text-white/90">PharmaWallah · Battle Royale</p>
              <h1 className="mt-0.5 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                <CheckCircle2 className="h-7 w-7" /> Registration Confirmed!
              </h1>
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-8">
          <div className="rounded-2xl border border-[#1C7BD9]/20 bg-[#1C7BD9]/[0.05] p-5">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/55">Player ID</p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-[#1C7BD9]">{receipt.code}</p>
            <p className="mt-2 text-sm text-[#16181d]/70">
              <strong>Next:</strong> pay the Rs. {receipt.entryFee} entry fee at the PharmaWallah desk. Once it&apos;s
              approved, the desk gives you your single-use <strong>Game Code</strong> to start your battle.
            </p>
          </div>

          <dl className="mt-6 divide-y divide-[#16181d]/10 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3 py-2.5">
                <dt className="text-[#16181d]/55">{k}</dt>
                <dd className="break-words font-semibold">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <p className="text-sm font-semibold">Before you arrive</p>
            <ul className="mt-2 space-y-1.5 text-sm text-[#16181d]/75">
              {ARRIVAL_POINTS.map((p) => (
                <li key={p}>• {p}</li>
              ))}
            </ul>
          </div>
        </div>
      </article>

      <div className="br-no-print">
        {receipt.emailStatus === "sent" ? (
          <Notice tone="green" icon={<Mail />} title="Your confirmation email has been sent.">
            It&apos;s on its way to {receipt.email}. Check your spam folder if it doesn&apos;t arrive in a few minutes.
          </Notice>
        ) : (
          <Notice tone="amber" icon={<MailWarning />} title="We couldn't send your confirmation email just now.">
            Your registration is saved. Print or screenshot this page — the desk can resend the email.
          </Notice>
        )}
      </div>

      <div className="br-no-print flex flex-wrap gap-3">
        <Link href={`${BR_BASE}/instructions`} className={primaryButtonClass} style={{ background: BRAND_BUTTON }}>
          View Instructions
        </Link>
        <button type="button" onClick={() => window.print()} className={secondaryButtonClass}>
          <Printer className="h-4 w-4" /> Download / Print Confirmation
        </button>
        <button type="button" onClick={copy} className={secondaryButtonClass}>
          <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy Player ID"}
        </button>
        <Link href={BR_BASE} className={secondaryButtonClass}>Back to Battle Royale</Link>
      </div>
    </div>
  );
}
