import "@/components/battle-royale/battle-royale.css";
import { EventNav } from "@/components/battle-royale/EventNav";

/*
 * Every Battle Royale page sits inside `.pw-br` (the stylesheet's namespace).
 * The event sub-nav hides itself on the battle screen and the admin, which
 * are chromeless apps (see AppShell).
 */
export default function BattleRoyaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pw-br min-h-[60vh] bg-[#fcfcfa] text-[#16181d]">
      <EventNav />
      {children}
    </div>
  );
}
