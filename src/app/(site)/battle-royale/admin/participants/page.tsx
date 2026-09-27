import Link from "next/link";
import { AdminHeader } from "@/components/battle-royale/admin/AdminShell";
import { ParticipantFilters } from "@/components/battle-royale/admin/ParticipantFilters";
import { ParticipantDrawer } from "@/components/battle-royale/admin/ParticipantDrawer";
import { DeskRegistration } from "@/components/battle-royale/admin/DeskRegistration";
import { CheckInBadge, Notice, PaymentBadge, RegistrationBadge } from "@/components/battle-royale/ui";
import { adminForPage } from "@/lib/battle-royale/admin-page";
import { BR_BASE, PHARM_YEARS } from "@/lib/battle-royale/constants";
import { formatSlot, formatTime } from "@/lib/battle-royale/format";
import { db } from "@/lib/battle-royale/server";
import type { CheckInStatus, PaymentStatus, RegistrationStatus } from "@/lib/battle-royale/types";

const PAGE_SIZE = 25;
const MAX_PAGE = 400;
const A = `${BR_BASE}/admin/participants`;

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

/**
 * Strip the characters that are syntax in a PostgREST `or=(…)` filter, so a
 * search can never turn into a different filter.
 */
function searchTerm(raw: string | undefined): string | null {
  const t = (raw ?? "").replace(/[,()*%\\:]/g, " ").trim().slice(0, 80);
  return t.length >= 2 ? t : null;
}

export default async function ParticipantsPage({ searchParams }: { searchParams: SP }) {
  const admin = await adminForPage("desk");
  if (!admin || admin === "role") return null;

  const q = searchTerm(one(searchParams.q));
  const year = one(searchParams.year);
  const university = one(searchParams.university)?.replace(/[%*,()\\]/g, "").slice(0, 80);
  const slot = one(searchParams.slot);
  const status = one(searchParams.status);
  const payment = one(searchParams.payment);
  const checkin = one(searchParams.checkin);
  const rawPage = Number(one(searchParams.page) ?? 1);
  const page = Number.isFinite(rawPage) ? Math.min(Math.max(Math.trunc(rawPage), 1), MAX_PAGE) : 1;

  const svc = await db();
  let query = svc
    .from("br_participants")
    .select(
      "id, participant_code, name, email, university, pharm_year, source, registration_status, payment_status, check_in_status, created_at, slot:br_sessions(name, start_time, end_time)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) query = query.or(`name.ilike.*${q}*,email.ilike.*${q}*,participant_code.ilike.*${q}*,phone.ilike.*${q}*`);
  if (year && (PHARM_YEARS as readonly string[]).includes(year)) query = query.eq("pharm_year", year);
  if (university) query = query.ilike("university", `%${university}%`);
  if (slot === "none") query = query.is("slot_id", null);
  else if (slot && /^[0-9a-f-]{36}$/i.test(slot)) query = query.eq("slot_id", slot);
  if (status && ["registered", "disqualified", "cancelled"].includes(status)) query = query.eq("registration_status", status);
  if (payment === "paid") query = query.in("payment_status", ["paid", "waived"]);
  else if (payment === "unpaid") query = query.eq("payment_status", "unpaid");
  if (checkin === "checked_in") query = query.in("check_in_status", ["checked_in", "late"]);
  else if (checkin && ["not_checked_in", "late"].includes(checkin)) query = query.eq("check_in_status", checkin);

  const [{ data, count, error }, sessions] = await Promise.all([
    query,
    svc.from("br_sessions").select("id, name, start_time, end_time, status").order("start_time").limit(50),
  ]);

  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const pageHref = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (typeof v === "string" && k !== "page" && k !== "open" && k !== "new") sp.set(k, v);
    sp.set("page", String(p));
    return `${A}?${sp}`;
  };
  const slots = (sessions.data ?? []).map((s) => ({ id: s.id, label: formatSlot({ name: s.name, startTime: s.start_time, endTime: s.end_time }), status: s.status }));

  return (
    <>
      <AdminHeader
        title="Participants"
        lead="Search, filter and act on registrations. Click a row for the full record, the Game Code and every action."
        actions={<DeskRegistration slots={slots} />}
      />
      <ParticipantFilters slots={slots} />

      {error ? (
        <Notice tone="red" className="mt-4" title="Couldn't load participants.">Reload the page to try again.</Notice>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#16181d]/10 bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-[#16181d]/10 bg-[#f7f8fa] font-mono text-[11px] uppercase tracking-[0.1em] text-[#16181d]/55">
              <tr>
                <th scope="col" className="px-4 py-3">Participant</th>
                <th scope="col" className="px-4 py-3">University · year</th>
                <th scope="col" className="px-4 py-3">Slot</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Fee</th>
                <th scope="col" className="px-4 py-3">Check-in</th>
                <th scope="col" className="px-4 py-3 text-right">Registered</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-[#16181d]/55">No participants match these filters.</td>
                </tr>
              )}
              {(data ?? []).map((p) => {
                const s = (Array.isArray(p.slot) ? p.slot[0] : p.slot) as { name: string; start_time: string; end_time: string } | null;
                return (
                  <tr key={p.id} className="border-b border-[#16181d]/[0.06] last:border-b-0 hover:bg-[#1C7BD9]/[0.03]">
                    <td className="px-4 py-3">
                      <Link href={`?${new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams).filter(([, v]) => typeof v === "string")) as Record<string, string>, open: p.id })}`} scroll={false} className="font-semibold hover:text-[#1C7BD9]">
                        {p.name}
                      </Link>
                      <p className="text-xs text-[#16181d]/50">
                        <span className="font-mono">{p.participant_code}</span>
                        {p.email ? ` · ${p.email}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="max-w-[14rem] truncate">{p.university}</p>
                      <p className="text-xs text-[#16181d]/50">{p.pharm_year}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{s ? formatSlot({ name: s.name, startTime: s.start_time, endTime: s.end_time }) : "Walk-in"}</td>
                    <td className="px-4 py-3"><RegistrationBadge value={p.registration_status as RegistrationStatus} /></td>
                    <td className="px-4 py-3"><PaymentBadge value={p.payment_status as PaymentStatus} /></td>
                    <td className="px-4 py-3"><CheckInBadge value={p.check_in_status as CheckInStatus} /></td>
                    <td className="px-4 py-3 text-right text-xs text-[#16181d]/55">
                      {p.source === "desk" ? "Desk" : "Online"} · {formatTime(p.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-[#16181d]/60">
        <p>{count ?? 0} participants · page {page} of {pages}</p>
        <div className="flex gap-2">
          {page > 1 && <Link href={pageHref(page - 1)} className="rounded-lg border border-[#16181d]/15 bg-white px-3 py-1.5 font-semibold">Previous</Link>}
          {page < pages && <Link href={pageHref(page + 1)} className="rounded-lg border border-[#16181d]/15 bg-white px-3 py-1.5 font-semibold">Next</Link>}
        </div>
      </div>

      <ParticipantDrawer slots={slots} role={admin.role} />
    </>
  );
}
