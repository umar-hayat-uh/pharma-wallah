import { AdminHeader } from "@/components/battle-royale/admin/AdminShell";
import { AdminGate } from "@/components/battle-royale/admin/AdminGate";
import { SessionManager, type SessionRow } from "@/components/battle-royale/admin/SessionManager";
import { Notice } from "@/components/battle-royale/ui";
import { adminForPage } from "@/lib/battle-royale/admin-page";
import { db } from "@/lib/battle-royale/server";

export default async function SessionsPage() {
  const admin = await adminForPage("admin");
  if (!admin) return null;
  if (admin === "role") return <AdminGate status="role" />;

  const svc = await db();
  const [{ data, error }, { data: taken }] = await Promise.all([
    svc.from("br_sessions").select("*").order("start_time").limit(100),
    svc.from("br_participants").select("slot_id").not("slot_id", "is", null).neq("registration_status", "cancelled").limit(10000),
  ]);
  const counts = new Map<string, number>();
  for (const r of taken ?? []) counts.set(r.slot_id, (counts.get(r.slot_id) ?? 0) + 1);

  const rows: SessionRow[] = (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    eventDate: s.event_date,
    startTime: s.start_time,
    endTime: s.end_time,
    capacity: s.capacity,
    status: s.status,
    registered: counts.get(s.id) ?? 0,
  }));

  return (
    <>
      <AdminHeader
        title="Battle sessions"
        lead="Optional time slots. Participants can pick one when they register, or stay walk-ins. A completed or cancelled session stops its participants from starting a battle."
      />
      {error ? <Notice tone="red" title="Couldn't load sessions." /> : <SessionManager rows={rows} />}
    </>
  );
}
