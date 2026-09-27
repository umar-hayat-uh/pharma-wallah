import Link from "next/link";
import { Activity, CalendarClock, CheckCheck, Hourglass, MailWarning, Swords, UserPlus, Users, Wallet } from "lucide-react";
import { AdminHeader } from "@/components/battle-royale/admin/AdminShell";
import { CompetitionSwitches } from "@/components/battle-royale/admin/CompetitionSwitches";
import { CheckInBadge, Notice, PaymentBadge, SessionBadge } from "@/components/battle-royale/ui";
import { adminForPage } from "@/lib/battle-royale/admin-page";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import { EVENT_TZ, formatSlot, formatTime } from "@/lib/battle-royale/format";
import { db, readSettings } from "@/lib/battle-royale/server";
import type { CheckInStatus, PaymentStatus, SessionStatus } from "@/lib/battle-royale/types";

const A = `${BR_BASE}/admin`;

function StatCard({ icon: Icon, label, value, href }: { icon: typeof Users; label: string; value: number | string; href?: string }) {
  const body = (
    <div className="h-full rounded-2xl border border-[#16181d]/10 bg-white p-4 transition-colors hover:border-[#1C7BD9]/30">
      <div className="flex items-center gap-2 text-[#16181d]/55">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold">{label}</p>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function AdminOverview() {
  const admin = await adminForPage("desk");
  if (!admin || admin === "role") return null;
  const svc = await db();
  const count = (q: PromiseLike<{ count: number | null }>) => Promise.resolve(q).then((r) => r.count ?? 0);

  const since = new Date(Date.now() - 6 * 86400_000);
  since.setUTCHours(0, 0, 0, 0);

  const [settings, total, paid, checkedIn, active, completed, pending, failedEmails, recent, live, sessions, created] =
    await Promise.all([
      readSettings(),
      count(svc.from("br_participants").select("id", { count: "exact", head: true }).neq("registration_status", "cancelled")),
      count(svc.from("br_participants").select("id", { count: "exact", head: true }).in("payment_status", ["paid", "waived"])),
      count(svc.from("br_participants").select("id", { count: "exact", head: true }).in("check_in_status", ["checked_in", "late"])),
      count(svc.from("br_attempts").select("id", { count: "exact", head: true }).eq("status", "active")),
      count(svc.from("br_attempts").select("id", { count: "exact", head: true }).eq("status", "completed")),
      count(svc.from("br_scores").select("participant_id", { count: "exact", head: true }).eq("final_status", "pending")),
      count(svc.from("br_email_logs").select("id", { count: "exact", head: true }).eq("status", "failed")),
      svc
        .from("br_participants")
        .select("id, name, participant_code, university, source, payment_status, check_in_status, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
      svc
        .from("br_attempts")
        .select("id, round, q_index, total_score, started_at, participant:br_participants(name, participant_code)")
        .eq("status", "active")
        .order("started_at", { ascending: true })
        .limit(20),
      svc.from("br_sessions").select("id, name, start_time, end_time, capacity, status").order("start_time").limit(12),
      svc.from("br_participants").select("created_at").gte("created_at", since.toISOString()).limit(5000),
    ]);

  if (!settings) {
    return (
      <Notice tone="red" title="The Battle Royale tables aren't reachable.">
        Run <code>supabase/migrations/20260927_battle_royale.sql</code> in the Supabase SQL editor, then reload.
      </Notice>
    );
  }

  // Registrations per day (event time zone), last 7 days.
  const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: EVENT_TZ }).format(d);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400_000);
    return { key: dayKey(d), label: new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: EVENT_TZ }).format(d), n: 0 };
  });
  for (const r of created.data ?? []) {
    const day = days.find((d) => d.key === dayKey(new Date(r.created_at)));
    if (day) day.n += 1;
  }
  const peak = Math.max(1, ...days.map((d) => d.n));

  const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? v[0] ?? null : v);

  return (
    <>
      <AdminHeader
        title="Overview"
        lead={`${settings.eventTitle} — live figures. Refresh the page to update.`}
        actions={
          <Link href={`${A}/participants?new=1`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1C7BD9] px-4 text-sm font-semibold text-white">
            <UserPlus className="h-4 w-4" /> Desk registration
          </Link>
        }
      />

      <CompetitionSwitches
        canEdit={admin.role === "admin"}
        registrationOpen={settings.registrationOpen}
        competitionOpen={settings.competitionOpen}
        frozen={Boolean(settings.leaderboardFrozenAt)}
        finalized={settings.resultsFinalized}
      />

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <StatCard icon={Users} label="Total registrations" value={total} href={`${A}/participants`} />
        <StatCard icon={Wallet} label="Fee received" value={paid} href={`${A}/participants?payment=paid`} />
        <StatCard icon={CheckCheck} label="Checked in" value={checkedIn} href={`${A}/participants?checkin=checked_in`} />
        <StatCard icon={Swords} label="Active battles" value={active} />
        <StatCard icon={Activity} label="Completed battles" value={completed} href={admin.role === "admin" ? `${A}/results` : undefined} />
        <StatCard icon={Hourglass} label="Pending results" value={pending} href={admin.role === "admin" ? `${A}/results` : undefined} />
        <StatCard icon={MailWarning} label="Failed emails" value={failedEmails} href={admin.role === "admin" ? `${A}/emails?status=failed` : undefined} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
          <h2 className="font-semibold">Live battles</h2>
          {(live.data ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-[#16181d]/55">No battle is in progress.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#16181d]/[0.07] text-sm">
              {(live.data ?? []).map((a) => {
                const p = one(a.participant as unknown as { name: string; participant_code: string } | null);
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p?.name ?? "—"}</p>
                      <p className="font-mono text-xs text-[#16181d]/50">{p?.participant_code}</p>
                    </div>
                    <p className="text-right text-xs text-[#16181d]/60">
                      Round {a.round} · {ROUNDS[a.round - 1]?.name}
                      <br />Q{a.q_index + 1} · {a.total_score} pts · since {formatTime(a.started_at)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
          <h2 className="font-semibold">Registration activity · last 7 days</h2>
          <div className="mt-4 flex h-36 items-end gap-2" role="img" aria-label={days.map((d) => `${d.label}: ${d.n}`).join(", ")}>
            {days.map((d) => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-xs font-semibold">{d.n}</span>
                <div className="w-full rounded-t-lg bg-[#1C7BD9]" style={{ height: `${Math.max(4, (d.n / peak) * 100)}px`, opacity: d.n ? 1 : 0.2 }} />
                <span className="text-[11px] text-[#16181d]/55">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4" /> Battle sessions</h2>
            {admin.role === "admin" && <Link href={`${A}/sessions`} className="text-sm font-semibold text-[#1C7BD9]">Manage</Link>}
          </div>
          {(sessions.data ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-[#16181d]/55">No sessions — everyone is a walk-in.</p>
          ) : (
            <ul className="mt-3 divide-y divide-[#16181d]/[0.07] text-sm">
              {(sessions.data ?? []).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 truncate">{formatSlot({ name: s.name, startTime: s.start_time, endTime: s.end_time })}</span>
                  <SessionBadge value={s.status as SessionStatus} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent participants</h2>
            <Link href={`${A}/participants`} className="text-sm font-semibold text-[#1C7BD9]">All participants</Link>
          </div>
          <ul className="mt-3 divide-y divide-[#16181d]/[0.07] text-sm">
            {(recent.data ?? []).map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <div className="min-w-0">
                  <Link href={`${A}/participants?open=${p.id}`} className="font-semibold hover:text-[#1C7BD9]">{p.name}</Link>
                  <p className="text-xs text-[#16181d]/50">
                    <span className="font-mono">{p.participant_code}</span> · {p.source === "desk" ? "Desk" : "Online"} · {formatTime(p.created_at)}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <PaymentBadge value={p.payment_status as PaymentStatus} />
                  <CheckInBadge value={p.check_in_status as CheckInStatus} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
