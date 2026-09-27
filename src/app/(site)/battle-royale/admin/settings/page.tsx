import { AdminHeader } from "@/components/battle-royale/admin/AdminShell";
import { AdminGate } from "@/components/battle-royale/admin/AdminGate";
import { SettingsForm } from "@/components/battle-royale/admin/SettingsForm";
import { Notice } from "@/components/battle-royale/ui";
import { adminForPage } from "@/lib/battle-royale/admin-page";
import { readSettings } from "@/lib/battle-royale/server";

export default async function SettingsPage() {
  const admin = await adminForPage("admin");
  if (!admin) return null;
  if (admin === "role") return <AdminGate status="role" />;
  const settings = await readSettings();
  return (
    <>
      <AdminHeader
        title="Settings"
        lead="Event details, scoring and rules. Public pages pick up a change straight away; a battle already running keeps the questions it drew, but scoring changes apply to its remaining answers."
      />
      {settings ? <SettingsForm initial={settings} /> : <Notice tone="red" title="Settings are unavailable." />}
    </>
  );
}
