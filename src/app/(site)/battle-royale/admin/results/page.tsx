import { AdminHeader } from "@/components/battle-royale/admin/AdminShell";
import { AdminGate } from "@/components/battle-royale/admin/AdminGate";
import { ResultsControls, StatusOverride } from "@/components/battle-royale/admin/ResultsControls";
import { FinalBadge, Notice } from "@/components/battle-royale/ui";
import { adminForPage } from "@/lib/battle-royale/admin-page";
import { formatDuration, formatTime } from "@/lib/battle-royale/format";
import { db, readSettings } from "@/lib/battle-royale/server";
import type { FinalStatus } from "@/lib/battle-royale/types";

const MAX_ROWS = 500;

export default async function AdminResultsPage() {
  const admin = await adminForPage("admin");
  if (!admin) return null;
  if (admin === "role") return <AdminGate status="role" />;

  const svc = await db();
  const [settings, { data, error }, { count: unranked }] = await Promise.all([
    readSettings(),
    svc.from("br_leaderboard").select("*").order("rank").order("completed_at").limit(MAX_ROWS),
    svc.from("br_attempts").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);
  if (!settings) return <Notice tone="red" title="Settings are unavailable." />;

  return (
    <>
      <AdminHeader
        title="Results"
        lead={`Closing sequence: freeze the board (stops new battles) → verify → finalise (Top ${settings.winnersCount} become winners) → email everyone.`}
      />
      <ResultsControls
        frozenAt={settings.leaderboardFrozenAt}
        finalized={settings.resultsFinalized}
        winners={settings.winnersCount}
        activeBattles={unranked ?? 0}
      />

      {error ? (
        <Notice tone="red" className="mt-4" title="Couldn't load the leaderboard." />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#16181d]/10 bg-white">
          <table className="w-full min-w-[60rem] text-left text-sm">
            <thead className="border-b border-[#16181d]/10 bg-[#f7f8fa] font-mono text-[11px] uppercase tracking-[0.1em] text-[#16181d]/55">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3 text-right">R1</th>
                <th className="px-4 py-3 text-right">R2</th>
                <th className="px-4 py-3 text-right">R3</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Correct</th>
                <th className="px-4 py-3 text-right">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Override</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length === 0 && (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-[#16181d]/55">No completed battles yet.</td></tr>
              )}
              {(data ?? []).map((r) => (
                <tr key={r.participant_id} className={r.rank <= settings.winnersCount ? "border-b border-[#16181d]/[0.06] bg-amber-50/40" : "border-b border-[#16181d]/[0.06]"}>
                  <td className="px-4 py-3 font-mono font-bold">{r.rank}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs text-[#16181d]/50"><span className="font-mono">{r.participant_code}</span> · {r.university} · {formatTime(r.completed_at)}</p>
                  </td>
                  <td className="px-4 py-3 text-right">{r.round1_score}</td>
                  <td className="px-4 py-3 text-right">{r.round2_score}</td>
                  <td className="px-4 py-3 text-right">{r.round3_score}</td>
                  <td className="px-4 py-3 text-right text-base font-extrabold">{r.total_score}</td>
                  <td className="px-4 py-3 text-right">{r.correct_count}/{r.total_questions}</td>
                  <td className="px-4 py-3 text-right">{formatDuration(r.total_time_ms)}</td>
                  <td className="px-4 py-3"><FinalBadge value={r.final_status as FinalStatus} /></td>
                  <td className="px-4 py-3"><StatusOverride participantId={r.participant_id} value={r.final_status as FinalStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-xs text-[#16181d]/50">
        Disqualified participants are not listed. {settings.leaderboardFrozenAt ? "Scores completed after the freeze are not ranked." : ""}
      </p>
    </>
  );
}
