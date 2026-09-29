import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { StatusClient } from "@/components/battle-royale/StatusClient";
import { EventFooter } from "@/components/battle-royale/sections";
import { BR_BASE } from "@/lib/battle-royale/constants";

export const metadata: Metadata = {
  title: "My result & certificate — Battle Royale | PharmaWallah",
  description: "See your Battle Royale score, rank and titles, and download your e-certificate.",
  robots: { index: false, follow: true },
};

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="Battle Royale · My result"
        title="My result & certificate"
        lead="Type your Player ID and the email you registered with. After your battle, your score, titles and e-certificate are here."
        trail={[{ label: "Battle Royale", href: BR_BASE }, { label: "My result" }]}
      />
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        <StatusClient />
      </div>
      <EventFooter />
    </>
  );
}
