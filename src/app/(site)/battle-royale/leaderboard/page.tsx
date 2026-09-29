import type { Metadata } from "next";
import { LeaderboardClient } from "@/components/battle-royale/LeaderboardClient";
import { readLeaderboard } from "@/lib/battle-royale/leaderboard";
import { getPublicSettings } from "@/lib/battle-royale/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Leaderboard — Battle Royale | PharmaWallah",
  description: "Live PharmaWallah Battle Royale leaderboard: ranks, round scores and totals. The Top 10 at closing win a Goodie Hamper.",
  alternates: { canonical: "https://www.pharmawallah.com/battle-royale/leaderboard" },
};

/** Server-rendered first paint (so the board is readable before hydration), then polled. */
export default async function LeaderboardPage({ searchParams }: { searchParams: { code?: string } }) {
  const code = typeof searchParams.code === "string" ? searchParams.code.trim().toUpperCase().slice(0, 20) : null;
  const [initial, settings] = await Promise.all([readLeaderboard(50, code), getPublicSettings()]);
  return <LeaderboardClient initial={initial} code={code} title={settings?.eventTitle ?? "PharmaWallah Battle Royale"} closed={settings?.eventClosed ?? false} />;
}
