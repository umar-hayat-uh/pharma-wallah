import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BR_BASE } from "@/lib/battle-royale/constants";
import { getPublicSettings } from "@/lib/battle-royale/server";
import { BattleApp } from "@/components/battle-royale/battle/BattleApp";

export const metadata: Metadata = {
  title: "Arena — Battle Royale | PharmaWallah",
  description: "The Battle Royale gaming station.",
  robots: { index: false, follow: false },
};

/**
 * The gaming station. Chromeless (AppShell) so it can fill a screen. Hidden
 * once the tournament is closed: the engine already refuses to start a battle
 * then, and a station left on this page would only show that refusal.
 */
export default async function BattlePage() {
  if ((await getPublicSettings())?.eventClosed) redirect(BR_BASE);
  return <BattleApp />;
}
