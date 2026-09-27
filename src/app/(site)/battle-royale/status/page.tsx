import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { StatusClient } from "@/components/battle-royale/StatusClient";
import { EventFooter } from "@/components/battle-royale/sections";
import { BR_BASE } from "@/lib/battle-royale/constants";

export const metadata: Metadata = {
  title: "My status & results — Battle Royale | PharmaWallah",
  description: "Track your Battle Royale registration — payment, Game Code, battle — and see your scores and rank.",
  robots: { index: false, follow: true },
};

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Battle Royale · My status"
        title="My status & results"
        lead="Enter your Player ID (from your registration email) and the email you registered with."
        trail={[{ label: "Battle Royale", href: BR_BASE }, { label: "My status" }]}
      />
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
        <StatusClient />
      </div>
      <EventFooter />
    </>
  );
}
