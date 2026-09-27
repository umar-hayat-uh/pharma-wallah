"use client";

import { useState } from "react";
import { CheckCircle2, Lock, Mail, Unlock, Undo2 } from "lucide-react";
import { ConfirmDialog } from "./Dialog";
import { adminFetch, useMutation } from "./client";
import { Notice } from "../ui";
import { formatTime } from "@/lib/battle-royale/format";
import type { FinalStatus } from "@/lib/battle-royale/types";

type Action = "freeze" | "unfreeze" | "finalize" | "unfinalize" | "notify";

const COPY: Record<Action, { title: string; body: string; label: string }> = {
  freeze: {
    title: "Freeze the leaderboard?",
    body: "Stops new battles from starting and fixes the board at this moment. Battles still in progress can finish, but a score completed after the freeze is not ranked.",
    label: "Freeze now",
  },
  unfreeze: { title: "Unfreeze the leaderboard?", body: "The board goes live again. Battles still won't start until you switch them back on.", label: "Unfreeze" },
  finalize: {
    title: "Finalise the results?",
    body: "The Top N by rank are labelled Winner and everyone else Participant (manual overrides are kept). Participants then see their final status.",
    label: "Finalise",
  },
  unfinalize: { title: "Un-finalise?", body: "Statuses go back to Awaiting final results (manual overrides are kept).", label: "Un-finalise" },
  notify: {
    title: "Email every ranked participant their result?",
    body: "One email per ranked participant, sent one at a time. This can take a minute for a large field — keep the page open.",
    label: "Send result emails",
  },
};

export function ResultsControls({ frozenAt, finalized, winners, activeBattles }: { frozenAt: string | null; finalized: boolean; winners: number; activeBattles: number }) {
  const [confirm, setConfirm] = useState<Action | null>(null);
  const { run, pending, error, message } = useMutation();

  const go = async (action: Action) => {
    const r = await run(
      () => adminFetch<{ sent?: number; failed?: number; skipped?: number; labelled?: number }>("/api/battle-royale/admin/results", "POST", action === "notify" ? { action, type: "result" } : { action }),
      (res) =>
        action === "notify"
          ? `Result emails: ${res.sent ?? 0} sent, ${res.failed ?? 0} failed, ${res.skipped ?? 0} skipped.`
          : action === "finalize"
            ? `Results finalised (${res.labelled ?? 0} labelled).`
            : "Done.",
    );
    if (r) setConfirm(null);
  };

  const btn = "inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:opacity-50";

  return (
    <div className="space-y-3">
      <ol className="grid gap-3 md:grid-cols-3">
        <li className="rounded-2xl border border-[#16181d]/10 bg-white p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/50">1 · Freeze</p>
          <p className="mt-1 font-semibold">{frozenAt ? `Frozen at ${formatTime(frozenAt)}` : "Leaderboard is live"}</p>
          {activeBattles > 0 && !frozenAt && <p className="mt-1 text-xs text-amber-700">{activeBattles} battle(s) still in progress.</p>}
          <div className="mt-3">
            {frozenAt ? (
              <button type="button" className={`${btn} border border-[#16181d]/15`} disabled={finalized || pending} onClick={() => setConfirm("unfreeze")}><Unlock className="h-4 w-4" /> Unfreeze</button>
            ) : (
              <button type="button" className={`${btn} bg-[#1C7BD9] text-white`} disabled={pending} onClick={() => setConfirm("freeze")}><Lock className="h-4 w-4" /> Freeze board</button>
            )}
          </div>
        </li>
        <li className="rounded-2xl border border-[#16181d]/10 bg-white p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/50">2 · Finalise</p>
          <p className="mt-1 font-semibold">{finalized ? `Final — Top ${winners} are winners` : "Not finalised"}</p>
          <div className="mt-3">
            {finalized ? (
              <button type="button" className={`${btn} border border-[#16181d]/15`} disabled={pending} onClick={() => setConfirm("unfinalize")}><Undo2 className="h-4 w-4" /> Un-finalise</button>
            ) : (
              <button type="button" className={`${btn} bg-[#1C7BD9] text-white`} disabled={!frozenAt || pending} onClick={() => setConfirm("finalize")}><CheckCircle2 className="h-4 w-4" /> Finalise results</button>
            )}
          </div>
        </li>
        <li className="rounded-2xl border border-[#16181d]/10 bg-white p-4">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/50">3 · Notify</p>
          <p className="mt-1 font-semibold">Email final results</p>
          <div className="mt-3">
            <button type="button" className={`${btn} bg-[#1C7BD9] text-white`} disabled={!finalized || pending} onClick={() => setConfirm("notify")}><Mail className="h-4 w-4" /> Email results</button>
          </div>
        </li>
      </ol>
      {error && <Notice tone="red">{error}</Notice>}
      {message && <Notice tone="green">{message}</Notice>}
      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        busy={pending}
        title={confirm ? COPY[confirm].title : ""}
        body={confirm ? COPY[confirm].body.replace("Top N", `Top ${winners}`) : ""}
        confirmLabel={confirm ? COPY[confirm].label : ""}
        onConfirm={() => confirm && void go(confirm)}
      />
    </div>
  );
}

/** Per-row manual final status (e.g. marking a playoff qualifier). */
export function StatusOverride({ participantId, value }: { participantId: string; value: FinalStatus }) {
  const { run, pending, error } = useMutation();
  return (
    <div>
      <select
        aria-label="Override final status"
        value={value}
        disabled={pending}
        onChange={(e) => void run(() => adminFetch(`/api/battle-royale/admin/participants/${participantId}`, "PATCH", { action: "set_final_status", value: e.target.value }))}
        className="h-8 rounded-lg border border-[#16181d]/15 bg-white px-2 text-xs"
      >
        <option value="pending">Pending</option>
        <option value="participant">Participant</option>
        <option value="winner">Winner</option>
        <option value="qualified">Qualified</option>
        <option value="not_qualified">Not qualified</option>
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
