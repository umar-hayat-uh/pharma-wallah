"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, RotateCcw, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { adminFetch, useMutation } from "./client";
import { ConfirmDialog } from "./Dialog";
import { showSlip } from "./SlipHost";
import { CheckInBadge, FinalBadge, Notice, PaymentBadge, RegistrationBadge, SkeletonRows, StatusBadge } from "../ui";
import { EMAIL_TYPE_LABEL, ROUNDS } from "@/lib/battle-royale/constants";
import { formatDuration, formatTime } from "@/lib/battle-royale/format";
import type { AdminRole, CheckInStatus, EmailType, FinalStatus, PaymentStatus, RegistrationStatus } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

type Detail = {
  participant: {
    id: string; participant_code: string; name: string; email: string | null; phone: string | null;
    university: string; pharm_year: string; student_id: string | null; slot_id: string | null; source: string;
    registration_status: RegistrationStatus; payment_status: PaymentStatus; check_in_status: CheckInStatus;
    checked_in_at: string | null; notes: string | null; created_at: string;
    game_code: string | null; code_issued_at: string | null; code_used_at: string | null;
  };
  attempts: {
    id: string; status: string; round: number; q_index: number; round1_score: number; round2_score: number; round3_score: number;
    total_score: number; correct_count: number; total_questions: number; total_time_ms: number;
    started_at: string; completed_at: string | null; void_reason: string | null;
  }[];
  rank: number | null;
  finalStatus: FinalStatus | null;
  emails: { id: string; email_type: EmailType; status: "sent" | "failed"; sent_at: string; error: string | null }[];
};

const sel = "h-10 w-full rounded-xl border border-[#16181d]/15 bg-white px-3 text-sm";

/** The full record and every action, in a side panel opened by `?open=<id>`. */
export function ParticipantDrawer({ slots, role }: { slots: { id: string; label: string; status: string }[]; role: AdminRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const id = params.get("open");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [confirm, setConfirm] = useState<null | "void" | "disqualify" | "cancel" | "reissue">(null);
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const { run, pending, error, message, setError, setMessage } = useMutation();
  const isAdmin = role === "admin";

  const load = useCallback(async () => {
    if (!id) return;
    setLoadError(null);
    try {
      setDetail(await adminFetch<Detail>(`/api/battle-royale/admin/participants/${id}`, "GET"));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't load this participant.");
    }
  }, [id]);

  useEffect(() => {
    setDetail(null);
    setShowCode(false);
    setError(null);
    setMessage(null);
    void load();
  }, [load, setError, setMessage]);

  if (!id) return null;

  const close = () => {
    const sp = new URLSearchParams(params.toString());
    sp.delete("open");
    router.replace(`${pathname}?${sp}`, { scroll: false });
  };

  const act = async (body: Record<string, unknown>, success: string) => {
    const r = await run(() => adminFetch<{ email?: string; code?: string }>(`/api/battle-royale/admin/participants/${id}`, "PATCH", body), (res) =>
      res.email ? `${success} Email: ${res.email}.` : success,
    );
    if (r) await load();
    return r;
  };
  const sendEmail = async (type: EmailType) => {
    const r = await run(
      () => adminFetch<{ status: string; reason?: string }>("/api/battle-royale/admin/emails", "POST", { action: "send", participantId: id, type }),
      (res) => (res.status === "sent" ? `${EMAIL_TYPE_LABEL[type]} email sent.` : `Not sent: ${res.reason ?? res.status}.`),
    );
    if (r) await load();
  };

  const p = detail?.participant;
  const live = detail?.attempts.find((a) => a.status !== "void");

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label="Participant">
      <button type="button" className="absolute inset-0 bg-[#061224]/40" aria-label="Close" onClick={close} />
      <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#16181d]/10 bg-white px-5 py-4">
          <p className="font-semibold">Participant</p>
          <button type="button" onClick={close} className="rounded-lg p-1.5 text-[#16181d]/50 hover:bg-[#16181d]/5" aria-label="Close panel">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          {loadError && <Notice tone="red">{loadError}</Notice>}
          {!p && !loadError && <SkeletonRows rows={8} />}
          {error && <Notice tone="red">{error}</Notice>}
          {message && <Notice tone="green">{message}</Notice>}

          {p && (
            <>
              <div>
                <p className="text-2xl font-bold">{p.name}</p>
                <p className="font-mono text-sm text-[#1C7BD9]">{p.participant_code}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <RegistrationBadge value={p.registration_status} />
                  <PaymentBadge value={p.payment_status} />
                  <CheckInBadge value={p.check_in_status} />
                  {detail?.finalStatus && <FinalBadge value={detail.finalStatus} />}
                  <StatusBadge>{p.source === "desk" ? "Desk" : "Online"}</StatusBadge>
                </div>
              </div>

              {/* ── Game Code ── */}
              <div className="rounded-2xl border border-[#16181d]/10 bg-[#f7f8fa] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/55">Game Code</p>
                    {p.game_code ? (
                      <p className="font-mono text-xl font-bold tracking-[0.2em]">{showCode ? p.game_code : "••••••"}</p>
                    ) : (
                      <p className="text-sm font-semibold text-[#16181d]/60">{p.code_used_at ? "Withdrawn" : "Not issued — approve the payment to issue one"}</p>
                    )}
                    {p.game_code && (
                      <p className="text-xs text-[#16181d]/55">
                        {p.code_used_at ? `Used at ${formatTime(p.code_used_at)}` : `Issued ${p.code_issued_at ? formatTime(p.code_issued_at) : ""} · not used yet`}
                      </p>
                    )}
                  </div>
                  {p.game_code && (
                    <button type="button" onClick={() => setShowCode((v) => !v)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1C7BD9]">
                      {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {showCode ? "Hide" : "Reveal"}
                    </button>
                  )}
                </div>
                {p.registration_status === "registered" && !detail?.attempts.some((a) => a.status === "completed") && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {!p.game_code ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={async () => {
                          const r = await act({ action: "issue_code" }, "Payment approved.");
                          const c = (r as { code?: string } | null)?.code;
                          if (c && p) showSlip({ name: p.name, playerId: p.participant_code, code: c });
                        }}
                        className="h-10 rounded-xl bg-[#21B67A] px-4 text-sm font-bold text-white disabled:opacity-60"
                      >
                        Approve payment & issue code
                      </button>
                    ) : (
                      <>
                        {!p.code_used_at && (
                          <button type="button" onClick={() => showSlip({ name: p.name, playerId: p.participant_code, code: p.game_code! })} className="h-10 rounded-xl border border-[#16181d]/15 px-4 text-sm font-semibold">
                            Show slip
                          </button>
                        )}
                        <button type="button" onClick={() => setConfirm("reissue")} className="h-10 rounded-xl border border-[#16181d]/15 px-4 text-sm font-semibold">
                          Re-issue code
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <dl className="grid grid-cols-[8rem_minmax(0,1fr)] gap-y-2 text-sm">
                <dt className="text-[#16181d]/55">Email</dt><dd className="break-all">{p.email ?? "—"}</dd>
                <dt className="text-[#16181d]/55">Phone</dt><dd>{p.phone ?? "—"}</dd>
                <dt className="text-[#16181d]/55">University</dt><dd>{p.university}</dd>
                <dt className="text-[#16181d]/55">Year</dt><dd>{p.pharm_year}</dd>
                <dt className="text-[#16181d]/55">Student ID</dt><dd>{p.student_id ?? "—"}</dd>
                <dt className="text-[#16181d]/55">Registered</dt><dd>{new Date(p.created_at).toLocaleString("en-GB")}</dd>
                {p.checked_in_at && (<><dt className="text-[#16181d]/55">Checked in</dt><dd>{formatTime(p.checked_in_at)}</dd></>)}
                {p.notes && (<><dt className="text-[#16181d]/55">Notes</dt><dd>{p.notes}</dd></>)}
              </dl>

              {/* ── Desk actions ─────────────────────────────────── */}
              <section className="space-y-3 border-t border-[#16181d]/10 pt-5">
                <p className="font-semibold">Desk</p>
                <div className="grid gap-3">
                  <label className="text-sm">
                    <span className="mb-1 block text-[#16181d]/60">Entry fee (correction)</span>
                    <select className={sel} value={p.payment_status} disabled={pending} onChange={(e) => void act({ action: "set_payment", value: e.target.value }, "Payment updated.")}>
                      <option value="unpaid">Fee due</option>
                      <option value="paid">Paid</option>
                      <option value="waived">Waived</option>
                    </select>
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                  <label className="text-sm">
                    <span className="mb-1 block text-[#16181d]/60">Battle slot</span>
                    <select
                      className={sel}
                      value={p.slot_id ?? ""}
                      disabled={pending}
                      onChange={(e) => void act({ action: "assign_slot", slotId: e.target.value || null, notify }, e.target.value ? "Slot assigned." : "Slot cleared.")}
                    >
                      <option value="">Walk-in (no slot)</option>
                      {slots.map((s) => <option key={s.id} value={s.id} disabled={["completed", "cancelled"].includes(s.status)}>{s.label}</option>)}
                    </select>
                  </label>
                  <label className="inline-flex h-10 items-center gap-2 text-sm">
                    <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email the slot
                  </label>
                </div>
              </section>

              {/* ── Battle ───────────────────────────────────────── */}
              <section className="space-y-3 border-t border-[#16181d]/10 pt-5">
                <p className="font-semibold">Battle</p>
                {detail!.attempts.length === 0 && <p className="text-sm text-[#16181d]/55">Hasn&apos;t started a battle.</p>}
                {detail!.attempts.map((a) => (
                  <div key={a.id} className={cn("rounded-2xl border p-4 text-sm", a.status === "void" ? "border-dashed border-[#16181d]/15 text-[#16181d]/50" : "border-[#16181d]/10")}>
                    <div className="flex items-center justify-between">
                      <StatusBadge tone={a.status === "completed" ? "green" : a.status === "active" ? "blue" : "neutral"}>
                        {a.status === "void" ? "Voided" : a.status === "active" ? `In progress · round ${a.round}` : "Completed"}
                      </StatusBadge>
                      <span className="text-xs">{formatTime(a.started_at)}{a.completed_at ? ` – ${formatTime(a.completed_at)}` : ""}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                      {ROUNDS.map((r, i) => (
                        <div key={r.no} className="rounded-lg bg-[#16181d]/[0.03] py-1.5">
                          <p className="text-[10px] uppercase tracking-wide text-[#16181d]/50">R{r.no}</p>
                          <p className="font-bold">{[a.round1_score, a.round2_score, a.round3_score][i]}</p>
                        </div>
                      ))}
                      <div className="rounded-lg bg-[#1C7BD9]/10 py-1.5">
                        <p className="text-[10px] uppercase tracking-wide text-[#16181d]/50">Total</p>
                        <p className="font-bold text-[#1C7BD9]">{a.total_score}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[#16181d]/55">
                      {a.correct_count} / {a.total_questions} correct · {formatDuration(a.total_time_ms)}
                      {a.status === "completed" && detail!.rank ? ` · rank #${detail!.rank}` : ""}
                      {a.void_reason ? ` · voided: ${a.void_reason}` : ""}
                    </p>
                  </div>
                ))}
                {isAdmin && live && (
                  <button type="button" onClick={() => { setReason(""); setConfirm("void"); }} className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                    <RotateCcw className="h-4 w-4" /> Reset attempt (technical issue)
                  </button>
                )}
                {isAdmin && detail!.finalStatus && (
                  <label className="block text-sm">
                    <span className="mb-1 block text-[#16181d]/60">Final status (manual override)</span>
                    <select className={sel} value={detail!.finalStatus} disabled={pending} onChange={(e) => void act({ action: "set_final_status", value: e.target.value }, "Final status set.")}>
                      <option value="pending">Pending (follow finalisation)</option>
                      <option value="participant">Participant</option>
                      <option value="winner">Winner</option>
                      <option value="qualified">Qualified</option>
                      <option value="not_qualified">Not qualified</option>
                    </select>
                  </label>
                )}
              </section>

              {/* ── Email ────────────────────────────────────────── */}
              <section className="space-y-3 border-t border-[#16181d]/10 pt-5">
                <p className="font-semibold">Email</p>
                {!p.email ? (
                  <p className="text-sm text-[#16181d]/55">No email address on file.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(isAdmin ? (["registration", "slot_assignment", "reminder", "check_in", "result"] as EmailType[]) : (["registration"] as EmailType[])).map((t) => (
                      <button key={t} type="button" disabled={pending} onClick={() => void sendEmail(t)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#16181d]/15 px-3 text-xs font-semibold disabled:opacity-50">
                        <Mail className="h-3.5 w-3.5" /> {t === "registration" ? "Resend confirmation" : EMAIL_TYPE_LABEL[t]}
                      </button>
                    ))}
                  </div>
                )}
                {detail!.emails.length > 0 && (
                  <ul className="divide-y divide-[#16181d]/[0.07] text-xs">
                    {detail!.emails.map((e) => (
                      <li key={e.id} className="flex items-center justify-between gap-2 py-2">
                        <span>{EMAIL_TYPE_LABEL[e.email_type]} · {formatTime(e.sent_at)}</span>
                        <StatusBadge tone={e.status === "sent" ? "green" : "red"}>{e.status === "sent" ? "Sent" : "Failed"}</StatusBadge>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {/* ── Standing ─────────────────────────────────────── */}
              {isAdmin && (
                <section className="flex flex-wrap gap-2 border-t border-[#16181d]/10 pt-5">
                  {p.registration_status === "registered" ? (
                    <button type="button" onClick={() => { setReason(""); setConfirm("disqualify"); }} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700">
                      <ShieldAlert className="h-4 w-4" /> Disqualify
                    </button>
                  ) : (
                    <button type="button" disabled={pending} onClick={() => void act({ action: "restore" }, "Registration restored.")} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#16181d]/15 px-4 text-sm font-semibold">
                      <ShieldCheck className="h-4 w-4" /> Restore
                    </button>
                  )}
                  {p.registration_status !== "cancelled" && (
                    <button type="button" onClick={() => setConfirm("cancel")} className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-[#16181d]/60 hover:text-red-700">
                      Cancel registration
                    </button>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </aside>

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        busy={pending}
        danger
        title={confirm === "reissue" ? "Issue a new Game Code?" : confirm === "void" ? "Reset this attempt?" : confirm === "disqualify" ? "Disqualify this participant?" : "Cancel this registration?"}
        confirmLabel={confirm === "reissue" ? "Issue new code" : confirm === "void" ? "Reset attempt" : confirm === "disqualify" ? "Disqualify" : "Cancel registration"}
        body={
          <div className="space-y-3">
            <p>
              {confirm === "reissue"
                ? "The current code stops working. With the new one, the player continues the same battle — rounds already submitted are kept. Use this when a station failed."
                : confirm === "void"
                ? "Their current attempt is voided, its score removed from the leaderboard and their code withdrawn; issue a new code for a fresh attempt. The answers stay on record. Only after a verified technical failure — for a crashed station, re-issuing the code is usually enough."
                : confirm === "disqualify"
                  ? "They are removed from the leaderboard and cannot start a battle. You can restore them later."
                  : "Their slot is released and they cannot play. You can restore them later."}
            </p>
            {(confirm === "void" || confirm === "disqualify") && (
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-[#16181d]">Reason{confirm === "void" ? "" : " (optional)"}</span>
                <input value={reason} onChange={(e) => setReason(e.target.value)} className={sel} maxLength={300} />
              </label>
            )}
          </div>
        }
        onConfirm={async () => {
          if (confirm === "reissue") {
            const r = await act({ action: "issue_code" }, "New code issued.");
            const c = (r as { code?: string } | null)?.code;
            if (c && p) {
              setConfirm(null);
              showSlip({ name: p.name, playerId: p.participant_code, code: c, reissued: true });
            }
            return;
          }
          const body =
            confirm === "void" ? { action: "void_attempt", reason } : confirm === "disqualify" ? { action: "disqualify", reason: reason || undefined } : { action: "cancel" };
          const ok = await act(body, confirm === "void" ? "Attempt reset." : confirm === "disqualify" ? "Disqualified." : "Registration cancelled.");
          if (ok) setConfirm(null);
        }}
      />
    </div>
  );
}
