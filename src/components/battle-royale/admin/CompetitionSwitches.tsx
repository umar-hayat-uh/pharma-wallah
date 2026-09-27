"use client";

import { Lock, Swords, UserPlus } from "lucide-react";
import { adminFetch, useMutation } from "./client";
import { cn } from "@/lib/utils";

/**
 * The two switches the organisers flip most on the day. Starting battles is
 * the one that matters: while it is off, nobody can begin an attempt (a battle
 * already running can always be finished).
 */
export function CompetitionSwitches({
  canEdit,
  registrationOpen,
  competitionOpen,
  frozen,
  finalized,
}: {
  canEdit: boolean;
  registrationOpen: boolean;
  competitionOpen: boolean;
  frozen: boolean;
  finalized: boolean;
}) {
  const { run, pending, error } = useMutation();
  const flip = (key: "registrationOpen" | "competitionOpen", value: boolean) =>
    run(() => adminFetch("/api/battle-royale/admin/settings", "PATCH", { [key]: value }));

  const Switch = ({ on, label, sub, icon: Icon, onToggle }: { on: boolean; label: string; sub: string; icon: typeof Swords; onToggle: () => void }) => (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#16181d]/10 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", on ? "bg-[#21B67A]/15 text-[#0f7a50]" : "bg-[#16181d]/[0.06] text-[#16181d]/50")}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-xs text-[#16181d]/55">{sub}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={!canEdit || pending}
        onClick={onToggle}
        className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50", on ? "bg-[#21B67A]" : "bg-[#16181d]/20")}
      >
        <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform", on ? "translate-x-6" : "translate-x-1")} />
      </button>
    </div>
  );

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-3">
        <Switch
          on={competitionOpen}
          label="Battles can start"
          sub={competitionOpen ? "Checked-in players can begin" : "Nobody can begin a battle"}
          icon={Swords}
          onToggle={() => flip("competitionOpen", !competitionOpen)}
        />
        <Switch
          on={registrationOpen}
          label="Online registration"
          sub={registrationOpen ? "The public form is open" : "Desk registration only"}
          icon={UserPlus}
          onToggle={() => flip("registrationOpen", !registrationOpen)}
        />
        <div className="flex items-center gap-3 rounded-2xl border border-[#16181d]/10 bg-white p-4">
          <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", frozen ? "bg-amber-100 text-amber-700" : "bg-[#16181d]/[0.06] text-[#16181d]/50")}>
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Leaderboard {frozen ? "frozen" : "live"}</p>
            <p className="text-xs text-[#16181d]/55">{finalized ? "Results finalised" : frozen ? "Verify, then finalise on Results" : "Freeze it on Results at closing"}</p>
          </div>
        </div>
      </div>
      {!canEdit && <p className="mt-2 text-xs text-[#16181d]/50">Only a full administrator can change these.</p>}
      {error && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
