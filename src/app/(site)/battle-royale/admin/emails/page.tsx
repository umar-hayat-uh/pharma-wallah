import Link from "next/link";
import { AdminHeader } from "@/components/battle-royale/admin/AdminShell";
import { AdminGate } from "@/components/battle-royale/admin/AdminGate";
import { ResendButton } from "@/components/battle-royale/admin/ResendButton";
import { Notice, StatusBadge } from "@/components/battle-royale/ui";
import { adminForPage } from "@/lib/battle-royale/admin-page";
import { BR_BASE, EMAIL_TYPE_LABEL } from "@/lib/battle-royale/constants";
import { formatTime } from "@/lib/battle-royale/format";
import { db } from "@/lib/battle-royale/server";
import type { EmailType } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 50;
const MAX_PAGE = 200;
const TYPES = Object.keys(EMAIL_TYPE_LABEL) as EmailType[];

export default async function EmailsPage({ searchParams }: { searchParams: { type?: string; status?: string; page?: string } }) {
  const admin = await adminForPage("admin");
  if (!admin) return null;
  if (admin === "role") return <AdminGate status="role" />;

  const type = TYPES.includes(searchParams.type as EmailType) ? (searchParams.type as EmailType) : null;
  const status = searchParams.status === "sent" || searchParams.status === "failed" ? searchParams.status : null;
  const raw = Number(searchParams.page ?? 1);
  const page = Number.isFinite(raw) ? Math.min(Math.max(Math.trunc(raw), 1), MAX_PAGE) : 1;

  const svc = await db();
  let q = svc
    .from("br_email_logs")
    .select("id, email_type, recipient, subject, status, error, sent_at, participant:br_participants(name, participant_code)", { count: "exact" })
    .order("sent_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (type) q = q.eq("email_type", type);
  if (status) q = q.eq("status", status);
  const { data, count, error } = await q;

  const href = (next: Record<string, string | null>) => {
    const sp = new URLSearchParams();
    const merged = { type, status, ...next };
    for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
    return `${BR_BASE}/admin/emails?${sp}`;
  };
  const chip = (active: boolean) =>
    cn("rounded-lg px-3 py-1.5 text-sm font-semibold", active ? "bg-[#1C7BD9] text-white" : "bg-white text-[#16181d]/60 ring-1 ring-[#16181d]/10 hover:text-[#16181d]");
  const pages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <>
      <AdminHeader title="Emails" lead="Every email the event has sent or tried to send. A failed send never undoes the registration it was confirming — resend it from here." />
      <div className="flex flex-wrap gap-2">
        <Link href={href({ type: null, page: null })} className={chip(!type)}>All types</Link>
        {TYPES.map((t) => <Link key={t} href={href({ type: t, page: null })} className={chip(type === t)}>{EMAIL_TYPE_LABEL[t]}</Link>)}
      </div>
      <div className="mt-2 flex gap-2">
        <Link href={href({ status: null, page: null })} className={chip(!status)}>Any result</Link>
        <Link href={href({ status: "sent", page: null })} className={chip(status === "sent")}>Sent</Link>
        <Link href={href({ status: "failed", page: null })} className={chip(status === "failed")}>Failed</Link>
      </div>

      {error ? (
        <Notice tone="red" className="mt-4" title="Couldn't load the email log." />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#16181d]/10 bg-white">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-[#16181d]/10 bg-[#f7f8fa] font-mono text-[11px] uppercase tracking-[0.1em] text-[#16181d]/55">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-[#16181d]/55">No emails match.</td></tr>}
              {(data ?? []).map((e) => {
                const p = (Array.isArray(e.participant) ? e.participant[0] : e.participant) as { name: string; participant_code: string } | null;
                return (
                  <tr key={e.id} className="border-b border-[#16181d]/[0.06] last:border-b-0">
                    <td className="px-4 py-3 text-xs text-[#16181d]/60">{new Date(e.sent_at).toLocaleDateString("en-GB")} {formatTime(e.sent_at)}</td>
                    <td className="px-4 py-3">{EMAIL_TYPE_LABEL[e.email_type as EmailType]}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{p?.name ?? "—"} <span className="font-mono text-xs text-[#16181d]/50">{p?.participant_code}</span></p>
                      <p className="text-xs text-[#16181d]/50">{e.recipient}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={e.status === "sent" ? "green" : "red"}>{e.status === "sent" ? "Sent" : "Failed"}</StatusBadge>
                      {e.error && <p className="mt-1 max-w-[18rem] truncate text-xs text-red-600" title={e.error}>{e.error}</p>}
                    </td>
                    <td className="px-4 py-3 text-right">{p && <ResendButton logId={e.id} failed={e.status === "failed"} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between text-sm text-[#16181d]/60">
        <p>{count ?? 0} emails · page {page} of {pages}</p>
        <div className="flex gap-2">
          {page > 1 && <Link href={href({ page: String(page - 1) })} className="rounded-lg border border-[#16181d]/15 bg-white px-3 py-1.5 font-semibold">Previous</Link>}
          {page < pages && <Link href={href({ page: String(page + 1) })} className="rounded-lg border border-[#16181d]/15 bg-white px-3 py-1.5 font-semibold">Next</Link>}
        </div>
      </div>
    </>
  );
}
