import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { CheckInClient } from "@/components/battle-royale/CheckInClient";
import { EventFooter } from "@/components/battle-royale/sections";
import { BR_BASE } from "@/lib/battle-royale/constants";

export const metadata: Metadata = {
  title: "Check in — Battle Royale | PharmaWallah",
  description: "Check in for PharmaWallah Battle Royale with your Player ID and Game Code.",
  robots: { index: false, follow: true },
};

export default function CheckInPage() {
  return (
    <>
      <PageHero
        eyebrow="Battle Royale · Check-in"
        title="Check in"
        lead="Enter your Player ID (or the email you registered with) and your Game Code. Paid at the desk already? You'll be checked in straight away."
        trail={[{ label: "Battle Royale", href: BR_BASE }, { label: "Check in" }]}
      />
      <div className="mx-auto max-w-xl px-5 py-10 sm:px-6 sm:py-14">
        <CheckInClient />
      </div>
      <EventFooter />
    </>
  );
}
