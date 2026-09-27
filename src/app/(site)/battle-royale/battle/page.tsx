import type { Metadata } from "next";
import { BattleApp } from "@/components/battle-royale/battle/BattleApp";

export const metadata: Metadata = {
  title: "Arena — Battle Royale | PharmaWallah",
  description: "The Battle Royale gaming station.",
  robots: { index: false, follow: false },
};

/** The gaming station. Chromeless (AppShell) so it can fill a screen. */
export default function BattlePage() {
  return <BattleApp />;
}
