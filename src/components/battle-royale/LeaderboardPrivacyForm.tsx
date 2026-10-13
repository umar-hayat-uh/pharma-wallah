"use client";

import { useState } from "react";
import { EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { inputClass, secondaryButtonClass } from "./ui";

/**
 * Hide (or show again) your name on the public Battle Royale board
 * (2026-10-13). Player ID + registered email, like the status lookup, because
 * the Player ID alone is public. See /api/battle-royale/privacy.
 */
export function LeaderboardPrivacyForm() {
  const [playerId, setPlayerId] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const send = async (hide: boolean) => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/battle-royale/privacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, email, hide }),
      });
      const body = await res.json().catch(() => ({}));
      setMsg(
        res.ok
          ? { ok: true, text: hide ? "Done — the board now lists you as “Anonymous player”." : "Done — your first name is shown on the board again." }
          : { ok: false, text: body.error ?? "That didn't work. Please try again." },
      );
    } catch {
      setMsg({ ok: false, text: "Couldn't reach the server. Check your connection and try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="br-privacy" className="mt-10 rounded-2xl border border-[#16181d]/10 bg-white p-5">
      <h2 id="br-privacy" className="flex items-center gap-2 text-base font-semibold text-[#16181d]">
        <EyeOff className="h-4 w-4 text-[#1C7BD9]" aria-hidden="true" /> Hide my name on the leaderboard
      </h2>
      <p className="mt-1 text-sm text-[#16181d]/65">
        The public board shows first names only. You can also hide yours completely: you keep your rank, score
        and certificate, and the board lists you as “Anonymous player”.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-[#16181d]">
          Player ID
          <input className={cn(inputClass, "mt-1")} value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="BR-2026-0001" autoComplete="off" />
        </label>
        <label className="text-sm font-medium text-[#16181d]">
          Registered email
          <input className={cn(inputClass, "mt-1")} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={busy || !playerId || !email} onClick={() => send(true)} className={secondaryButtonClass}>
          Hide my name
        </button>
        <button type="button" disabled={busy || !playerId || !email} onClick={() => send(false)} className={cn(secondaryButtonClass, "border-transparent")}>
          Show it again
        </button>
      </div>
      {msg && (
        <p role="status" className={cn("mt-3 text-sm", msg.ok ? "text-[#167a52]" : "text-red-600")}>
          {msg.text}
        </p>
      )}
    </section>
  );
}
