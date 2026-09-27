import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { ResultsClient } from "@/components/battle-royale/ResultsClient";
import { EventFooter } from "@/components/battle-royale/sections";
import { BR_BASE } from "@/lib/battle-royale/constants";

export const metadata: Metadata = {
  title: "My results — Battle Royale | PharmaWallah",
  description: "See your Battle Royale round scores, total, rank and final status.",
  robots: { index: false, follow: true },
};

export default function ResultsPage() {
  return (
    <>
      <PageHero
        eyebrow="Battle Royale · Results"
        title="My results"
        lead="Enter your Player ID (or email) and Game Code to see your round scores, rank and final status."
        trail={[{ label: "Battle Royale", href: BR_BASE }, { label: "My results" }]}
      />
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-6 sm:py-14">
        <ResultsClient />
      </div>
      <EventFooter />
    </>
  );
}
