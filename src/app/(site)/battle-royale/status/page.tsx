import type { Metadata } from "next";
import { PageHero } from "@/components/page-kit";
import { StatusClient } from "@/components/battle-royale/StatusClient";
import { EventFooter } from "@/components/battle-royale/sections";
import { BR_BASE } from "@/lib/battle-royale/constants";
import { getPublicSettings } from "@/lib/battle-royale/server";

export const metadata: Metadata = {
  title: "My result & certificate — Battle Royale | PharmaWallah",
  description: "Find your name to see your Battle Royale score, rank and titles, and download your e-certificate.",
  robots: { index: false, follow: true },
};

export default async function StatusPage() {
  const closed = (await getPublicSettings())?.eventClosed ?? false;
  return (
    <>
      <PageHero
        eyebrow="Battle Royale · My result"
        title="My result & certificate"
        lead="Type your name and pick it from the list. After your battle, your score, titles and e-certificate are here — download it as a PDF or picture."
        trail={[{ label: "Battle Royale", href: BR_BASE }, { label: "My result" }]}
      />
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        <StatusClient closed={closed} />
      </div>
      <EventFooter closed={closed} />
    </>
  );
}
