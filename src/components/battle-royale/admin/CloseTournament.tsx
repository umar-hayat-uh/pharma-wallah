"use client";

import { useState } from "react";
import { DoorClosed, DoorOpen } from "lucide-react";
import { ConfirmDialog } from "./Dialog";
import { adminFetch, useMutation } from "./client";
import { BR_BASE } from "@/lib/battle-royale/constants";
import { cn } from "@/lib/utils";

/**
 * The end-of-event switch. Closing turns off registration and battles, freezes
 * the board, and reduces the public pages to the leaderboard and "My result &
 * certificate". Reopening only lifts that last part — the switches above stay
 * off until someone turns them on again.
 */
export function CloseTournament({ canEdit, closed, activeBattles }: { canEdit: boolean; closed: boolean; activeBattles: number }) {
  const [confirm, setConfirm] = useState(false);
  const { run, pending, error, message } = useMutation();

  const go = async () => {
    const r = await run(
      () => adminFetch("/api/battle-royale/admin/results", "POST", { action: closed ? "reopen" : "close" }),
      closed ? "Tournament reopened. Turn registration and battles back on above if you need them." : "Tournament closed.",
    );
    if (r) setConfirm(false);
  };

  return (
    <div
      className={cn(
        "mt-3 flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between",
        closed ? "border-red-200 bg-red-50" : "border-[#16181d]/10 bg-white",
      )}
    >
      <div className="flex items-center gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", closed ? "bg-red-100 text-red-700" : "bg-[#16181d]/[0.06] text-[#16181d]/60")}>
          {closed ? <DoorClosed className="h-5 w-5" /> : <DoorOpen className="h-5 w-5" />}
        </span>
        <div>
          <p className="font-semibold">{closed ? "Tournament closed" : "Tournament open"}</p>
          <p className="text-xs text-[#16181d]/60">
            {closed
              ? "The public site shows only the leaderboard and My result & certificate."
              : "Close it at the end of the event: registration and battles stop, and only the leaderboard stays public."}
          </p>
          {message && <p className="mt-1 text-xs font-medium text-[#0f7a50]">{message}</p>}
          {error && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{error}</p>}
        </div>
      </div>
      <button
        type="button"
        disabled={!canEdit || pending}
        onClick={() => setConfirm(true)}
        className={cn(
          "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold disabled:opacity-50",
          closed ? "border border-[#16181d]/15 bg-white text-[#16181d]" : "bg-red-600 text-white",
        )}
      >
        {closed ? <DoorOpen className="h-4 w-4" /> : <DoorClosed className="h-4 w-4" />}
        {closed ? "Reopen tournament" : "Close tournament"}
      </button>

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        busy={pending}
        danger={!closed}
        title={closed ? "Reopen the tournament?" : "Close the tournament?"}
        confirmLabel={closed ? "Reopen" : "Close tournament"}
        onConfirm={() => void go()}
        body={
          closed ? (
            <p>
              The event pages come back (menu, registration and how to play). Registration and battles stay
              <strong> off</strong> and the board stays frozen — turn them back on yourself if you need them.
            </p>
          ) : (
            <div className="space-y-2">
              <p>This will:</p>
              {/* .pw-br removes list bullets (battle-royale.css), so they are drawn. */}
              <ul className="space-y-1">
                {[
                  "turn off online registration and desk registration,",
                  "stop new battles from starting, and freeze the leaderboard,",
                  `hide the menu, registration, how to play and the arena — visitors to ${BR_BASE} see only the leaderboard and My result & certificate.`,
                ].map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" aria-hidden="true" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              {activeBattles > 0 && (
                <p className="font-semibold text-red-700">
                  {activeBattles} battle{activeBattles === 1 ? " is" : "s are"} still in progress. A score finished after closing is not
                  ranked — wait for {activeBattles === 1 ? "it" : "them"} to finish if you can.
                </p>
              )}
              <p>You can reopen it afterwards.</p>
            </div>
          )
        }
      />
    </div>
  );
}
