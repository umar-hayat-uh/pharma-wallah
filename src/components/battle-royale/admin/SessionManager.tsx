"use client";

import { useState } from "react";
import { Bell, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog, Dialog } from "./Dialog";
import { adminFetch, useMutation } from "./client";
import { Field, Notice, SessionBadge, inputClass, selectClass } from "../ui";
import { EVENT_TZ, formatEventDate, formatTime } from "@/lib/battle-royale/format";
import type { SessionStatus } from "@/lib/battle-royale/types";

export type SessionRow = {
  id: string; name: string; eventDate: string; startTime: string; endTime: string;
  capacity: number; status: SessionStatus; registered: number;
};

type Form = { name: string; date: string; start: string; end: string; capacity: string; status: SessionStatus };

// Pakistan has no daylight saving, so event-local time is always UTC+05:00.
const PKT = "+05:00";
const localTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: EVENT_TZ }).format(new Date(iso));

const EMPTY: Form = { name: "", date: "", start: "10:00", end: "12:00", capacity: "50", status: "scheduled" };

export function SessionManager({ rows }: { rows: SessionRow[] }) {
  const [editing, setEditing] = useState<SessionRow | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [deleting, setDeleting] = useState<SessionRow | null>(null);
  const { run, pending, error, message, setError } = useMutation();

  const open = (row: SessionRow | "new") => {
    setError(null);
    setEditing(row);
    setForm(
      row === "new"
        ? { ...EMPTY, name: `Session ${rows.length + 1}`, date: rows.at(-1)?.eventDate ?? "" }
        : { name: row.name, date: row.eventDate, start: localTime(row.startTime), end: localTime(row.endTime), capacity: String(row.capacity), status: row.status },
    );
  };

  const save = async () => {
    const body = {
      name: form.name,
      eventDate: form.date,
      startTime: `${form.date}T${form.start}:00${PKT}`,
      endTime: `${form.date}T${form.end}:00${PKT}`,
      capacity: form.capacity,
      status: form.status,
    };
    const url = editing === "new" ? "/api/battle-royale/admin/sessions" : `/api/battle-royale/admin/sessions/${(editing as SessionRow).id}`;
    const r = await run(() => adminFetch(url, editing === "new" ? "POST" : "PATCH", body), "Session saved.");
    if (r) setEditing(null);
  };

  const setStatus = (row: SessionRow, status: SessionStatus) =>
    run(
      () =>
        adminFetch(`/api/battle-royale/admin/sessions/${row.id}`, "PATCH", {
          name: row.name, eventDate: row.eventDate, startTime: row.startTime, endTime: row.endTime, capacity: row.capacity, status,
        }),
      `${row.name}: ${status}.`,
    );

  const remind = (row: SessionRow) =>
    run(
      () => adminFetch<{ sent: number; failed: number; skipped: number }>("/api/battle-royale/admin/emails", "POST", { action: "remind_session", sessionId: row.id }),
      (r) => `Reminders for ${row.name}: ${r.sent} sent, ${r.failed} failed, ${r.skipped} skipped.`,
    );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={() => open("new")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1C7BD9] px-4 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> New session
        </button>
      </div>
      {error && !editing && <Notice tone="red">{error}</Notice>}
      {message && <Notice tone="green">{message}</Notice>}

      <div className="overflow-x-auto rounded-2xl border border-[#16181d]/10 bg-white">
        <table className="w-full min-w-[48rem] text-left text-sm">
          <thead className="border-b border-[#16181d]/10 bg-[#f7f8fa] font-mono text-[11px] uppercase tracking-[0.1em] text-[#16181d]/55">
            <tr>
              <th className="px-4 py-3">Session</th>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Seats</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-[#16181d]/55">No sessions yet. Without sessions, everyone plays as a walk-in.</td></tr>
            )}
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-[#16181d]/[0.06] last:border-b-0">
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3">
                  {formatEventDate(s.eventDate)}
                  <p className="text-xs text-[#16181d]/55">{formatTime(s.startTime)}–{formatTime(s.endTime)}</p>
                </td>
                <td className="px-4 py-3">{s.registered} / {s.capacity}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <SessionBadge value={s.status} />
                    <select
                      aria-label={`Change status of ${s.name}`}
                      value={s.status}
                      disabled={pending}
                      onChange={(e) => void setStatus(s, e.target.value as SessionStatus)}
                      className="h-8 rounded-lg border border-[#16181d]/15 bg-white px-2 text-xs"
                    >
                      {(["scheduled", "open", "live", "completed", "cancelled"] as SessionStatus[]).map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => void remind(s)} disabled={pending || s.registered === 0} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[#1C7BD9] disabled:opacity-40" title="Email a reminder to everyone in this session">
                      <Bell className="h-3.5 w-3.5" /> Remind
                    </button>
                    <button type="button" onClick={() => open(s)} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold" aria-label={`Edit ${s.name}`}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button type="button" onClick={() => setDeleting(s)} className="inline-flex h-8 items-center rounded-lg px-2 text-red-600" aria-label={`Delete ${s.name}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New session" : "Edit session"}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          className="space-y-4"
        >
          {error && <Notice tone="red">{error}</Notice>}
          <Field id="s-name" label="Name"><input id="s-name" required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field id="s-date" label="Date"><input id="s-date" type="date" required className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="s-start" label="Starts (PKT)"><input id="s-start" type="time" required className={inputClass} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
            <Field id="s-end" label="Ends (PKT)"><input id="s-end" type="time" required className={inputClass} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field id="s-cap" label="Capacity"><input id="s-cap" type="number" min={1} required className={inputClass} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></Field>
            <Field id="s-status" label="Status">
              <select id="s-status" className={selectClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as SessionStatus })}>
                {(["scheduled", "open", "live", "completed", "cancelled"] as SessionStatus[]).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={pending} className="h-11 rounded-xl bg-[#1C7BD9] px-6 font-semibold text-white disabled:opacity-60">
              {pending ? "Saving…" : "Save session"}
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        danger
        busy={pending}
        title={`Delete ${deleting?.name ?? "session"}?`}
        confirmLabel="Delete session"
        body={
          deleting && deleting.registered > 0
            ? `${deleting.registered} participant(s) are in this session. They become walk-ins. To stop them playing instead, set the session to Cancelled.`
            : "Nobody is registered in this session."
        }
        onConfirm={async () => {
          if (!deleting) return;
          const r = await run(() => adminFetch(`/api/battle-royale/admin/sessions/${deleting.id}`, "DELETE"), "Session deleted.");
          if (r) setDeleting(null);
        }}
      />
    </div>
  );
}
