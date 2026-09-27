import type { Metadata } from "next";
import { AdminGate } from "@/components/battle-royale/admin/AdminGate";
import { AdminShell } from "@/components/battle-royale/admin/AdminShell";
import { getBattleAdmin } from "@/lib/battle-royale/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Battle Royale | PharmaWallah",
  robots: { index: false, follow: false },
};

/*
 * The admin's frame. This check decides what is DRAWN; it is not the
 * protection — a layout and its page render in parallel, so every admin page
 * and every admin route handler checks `br_admins` again for itself.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const gate = await getBattleAdmin();
  if (!gate.ok) return <AdminGate status={gate.status} />;
  return (
    <AdminShell email={gate.admin.email} role={gate.admin.role}>
      {children}
    </AdminShell>
  );
}
