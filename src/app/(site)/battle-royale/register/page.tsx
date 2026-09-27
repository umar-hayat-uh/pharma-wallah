import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { RegistrationForm } from "@/components/battle-royale/RegistrationForm";
import { EventFooter } from "@/components/battle-royale/sections";
import { BR_BASE } from "@/lib/battle-royale/constants";
import { formatEventDate } from "@/lib/battle-royale/format";
import { getOpenSessions, getPublicSettings } from "@/lib/battle-royale/server";

export const metadata: Metadata = {
  title: "Register — Battle Royale | PharmaWallah",
  description:
    "Register for PharmaWallah Battle Royale. Get your Player ID and Game Code by email, then pay the entry fee and check in at the PharmaWallah desk.",
  alternates: { canonical: "https://www.pharmawallah.com/battle-royale/register" },
};

export default async function RegisterPage() {
  const [settings, sessions] = await Promise.all([getPublicSettings(), getOpenSessions()]);

  return (
    <>
      <PageHero
        eyebrow="Battle Royale · Registration"
        title="Register for Battle Royale"
        lead={
          settings
            ? `Registration is free online; the Rs. ${settings.entryFee} entry fee is paid at the PharmaWallah desk. ${formatEventDate(settings.eventDate)} · ${settings.venue}.`
            : "Get your Player ID and Game Code, then pay the entry fee at the desk."
        }
        trail={[{ label: "Battle Royale", href: BR_BASE }, { label: "Register" }]}
      />
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        {/* Always the form (user decision, 2026-09-27). If an admin has closed
            online registration, the route still refuses and the form shows why. */}
        <RegistrationForm sessions={sessions} entryFee={settings?.entryFee ?? 100} />
      </div>
      <EventFooter />
    </>
  );
}
