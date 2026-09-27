"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Crown, Lock, Maximize2, Minimize2, Radio, RefreshCw, Trophy } from "lucide-react";
import { BRAND_SURFACE } from "@/components/page-kit";
import { Crest, FinalBadge, Notice } from "./ui";
import { EventFooter } from "./sections";
import { BR_BASE } from "@/lib/battle-royale/constants";
import { formatDuration, formatTime, ordinal } from "@/lib/battle-royale/format";
import type { LeaderboardPayload, LeaderboardRow } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";

// 30 s: the board is cached for 20 s server-side, so polling faster buys nothing.
const POLL_MS = 30_000;

/**
 * The live board. Polls every 15 s while the tab is visible (not at all when
 * hidden, so a phone left open in a pocket costs nothing), and has a TV mode
 * for the stall monitor: full screen, larger type, no site chrome.
 */
export function LeaderboardClient({
  initial,
  code,
  title,
}: {
  initial: LeaderboardPayload | null;
  code: string | null;
  title: string;
}) {
  const [board, setBoard] = useState(initial);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tv, setTv] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const qs = new URLSearchParams({ limit: tv ? "20" : "50" });
      if (code) qs.set("code", code);
      const res = await fetch(`/api/battle-royale/leaderboard?${qs}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      setBoard((await res.json()) as LeaderboardPayload);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setRefreshing(false);
    }
  }, [code, tv]);

  useEffect(() => {
    let timer: number | undefined;
    const tick = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    timer = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  // Leaving browser full screen (Esc) also leaves TV mode.
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setTv(false);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleTv = async () => {
    if (!tv) {
      setTv(true);
      try {
        await rootRef.current?.requestFullscreen?.();
      } catch {
        /* full screen refused: TV styling still applies */
      }
    } else {
      setTv(false);
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
    }
  };

  const rows = board?.rows ?? [];
  const podium = rows.filter((r) => r.rank <= 3).slice(0, 3);
  const youVisible = board?.you && rows.some((r) => r.code === board.you!.code);

  return (
    <div ref={rootRef} className={cn(tv && "fixed inset-0 z-[100] overflow-auto bg-[#fcfcfa]")}>
      <header className="relative overflow-hidden text-white" style={{ background: BRAND_SURFACE }}>
        <div className="br-sheen" aria-hidden="true" />
        <div className={cn("relative mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 sm:px-6 lg:px-8", tv ? "py-8" : "py-10 sm:py-12")}>
          <div className="flex items-center gap-4">
            <Crest size={tv ? 72 : 56} />
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/85">{title}</p>
              <h1 className={cn("font-extrabold uppercase tracking-tight", tv ? "text-6xl" : "text-4xl sm:text-5xl")}>Leaderboard</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {board?.frozenAt ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold">
                <Lock className="h-4 w-4" /> {board.finalized ? "Final results" : `Frozen at ${formatTime(board.frozenAt)}`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold">
                <Radio className="h-4 w-4" /> Live · {board?.totalRanked ?? 0} ranked
              </span>
            )}
            <button
              type="button"
              onClick={() => void refresh()}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/35 px-3 py-1.5 font-semibold hover:bg-white/10"
              aria-label="Refresh now"
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => void toggleTv()}
              className="br-no-print inline-flex items-center gap-1.5 rounded-full border border-white/35 px-3 py-1.5 font-semibold hover:bg-white/10"
            >
              {tv ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {tv ? "Exit TV mode" : "TV mode"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        {!board && (
          <Notice tone="amber" title="The leaderboard isn't available yet.">
            It appears here as soon as the competition starts.
          </Notice>
        )}
        {error && board && (
          <Notice tone="amber" className="mb-6">Couldn&apos;t refresh just now — showing the last update. Retrying automatically.</Notice>
        )}

        {board && board.you && !youVisible && <YouCard row={board.you} />}

        {board && rows.length === 0 && (
          <div className="rounded-3xl border border-dashed border-[#16181d]/20 px-6 py-16 text-center">
            <Trophy className="mx-auto h-10 w-10 text-[#1C7BD9]" />
            <p className="mt-4 text-xl font-bold">No scores yet</p>
            <p className="mt-1 text-[#16181d]/60">The first completed battle will appear here.</p>
          </div>
        )}

        {podium.length > 0 && (
          <ol className="mb-8 grid gap-4 sm:grid-cols-3" aria-label="Top three">
            {podium.map((r) => (
              <li
                key={r.code}
                className={cn(
                  "relative overflow-hidden rounded-3xl border bg-white p-5",
                  r.rank === 1 ? "border-[#f5b301]/60 shadow-[0_18px_40px_-24px_rgba(245,179,1,.8)]" : "border-[#16181d]/10",
                  board?.you?.code === r.code && "ring-4 ring-[#1C7BD9]/25",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("font-mono font-bold", tv ? "text-3xl" : "text-2xl", r.rank === 1 ? "text-[#b98500]" : "text-[#16181d]/60")}>
                    {ordinal(r.rank)}
                  </span>
                  {r.rank === 1 && <Crown className="h-7 w-7 text-[#f5b301]" />}
                </div>
                <p className={cn("mt-3 truncate font-bold", tv ? "text-3xl" : "text-xl")}>{r.name}</p>
                <p className="truncate text-sm text-[#16181d]/55">{r.code} · {r.university}</p>
                <p className={cn("mt-4 font-extrabold tracking-tight text-[#1C7BD9]", tv ? "text-6xl" : "text-4xl")}>{r.total}</p>
              </li>
            ))}
          </ol>
        )}

        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-3xl border border-[#16181d]/10 bg-white">
            <table className={cn("w-full min-w-[40rem] text-left", tv ? "text-lg" : "text-sm")}>
              <thead className="border-b border-[#16181d]/10 bg-[#f7f8fa] font-mono text-[11px] uppercase tracking-[0.12em] text-[#16181d]/55">
                <tr>
                  <th scope="col" className="px-4 py-3">Rank</th>
                  <th scope="col" className="px-4 py-3">Participant</th>
                  <th scope="col" className="hidden px-4 py-3 text-right md:table-cell">R1</th>
                  <th scope="col" className="hidden px-4 py-3 text-right md:table-cell">R2</th>
                  <th scope="col" className="hidden px-4 py-3 text-right md:table-cell">R3</th>
                  <th scope="col" className="px-4 py-3 text-right">Score</th>
                  <th scope="col" className="px-4 py-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const cutoff = board && rows[i + 1] && r.rank <= board.winnersCount && rows[i + 1].rank > board.winnersCount;
                  const mine = board?.you?.code === r.code;
                  return (
                    <tr
                      key={r.code}
                      className={cn(
                        "border-b border-[#16181d]/[0.07] last:border-b-0",
                        mine && "bg-[#1C7BD9]/[0.07]",
                        cutoff && "border-b-2 border-b-[#f5b301]",
                      )}
                    >
                      <td className="px-4 py-3 font-mono font-bold">
                        {r.rank <= (board?.winnersCount ?? 10) ? (
                          <span className="inline-flex items-center gap-1 text-[#b98500]">{r.rank}<Trophy className="h-3.5 w-3.5" /></span>
                        ) : (
                          r.rank
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">
                          {r.name}
                          {mine && <span className="ml-2 rounded-full bg-[#1C7BD9] px-2 py-0.5 text-[11px] font-bold text-white">You</span>}
                        </p>
                        <p className="text-xs text-[#16181d]/50">{r.code} · {r.university}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-right md:table-cell">{r.rounds[0]}</td>
                      <td className="hidden px-4 py-3 text-right md:table-cell">{r.rounds[1]}</td>
                      <td className="hidden px-4 py-3 text-right md:table-cell">{r.rounds[2]}</td>
                      <td className="px-4 py-3 text-right text-base font-extrabold text-[#16181d]">{r.total}</td>
                      <td className="px-4 py-3 text-right text-[#16181d]/60">{formatDuration(r.timeMs)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {board && board.totalRanked > rows.length && (
          <p className="mt-3 text-sm text-[#16181d]/55">Showing the top {rows.length} of {board.totalRanked} ranked participants.</p>
        )}
        <p className="mt-3 text-xs text-[#16181d]/45">
          Ranked by total score, then Round 3, then faster answering time. The gold line marks the Top {board?.winnersCount ?? 10}.
          {board && ` Updated ${formatTime(board.updatedAt)}.`}
        </p>

        {!tv && (
          <p className="mt-6 text-sm">
            Played already?{" "}
            <Link href={`${BR_BASE}/status`} className="font-semibold text-[#1C7BD9] hover:underline">See your full result</Link>
          </p>
        )}
      </div>
      {!tv && <EventFooter />}
    </div>
  );
}

function YouCard({ row }: { row: LeaderboardRow }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1C7BD9]/25 bg-[#1C7BD9]/[0.06] px-5 py-4">
      <div>
        <p className="text-sm text-[#16181d]/60">Your position</p>
        <p className="text-lg font-bold">
          {ordinal(row.rank)} · {row.name} <span className="font-mono text-sm font-medium text-[#1C7BD9]">{row.code}</span>
        </p>
      </div>
      <div className="flex items-center gap-4">
        <FinalBadge value={row.finalStatus} />
        <p className="text-3xl font-extrabold text-[#1C7BD9]">{row.total}</p>
      </div>
    </div>
  );
}
