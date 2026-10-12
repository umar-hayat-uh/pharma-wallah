/**
 * Board ordering and the podium's places — pure, so they can be tested
 * (scripts/battle-royale.test.mts) and shared by the server and the podium.
 *
 * The `br_leaderboard` view already ranks (total, then the shorter battle time
 * — MEMORY.md gotcha 185). This is the same rule applied again in JS, so the
 * order on screen never depends on how PostgREST happens to break a tie, and
 * two identical scores always come out in the same order: total ↓, time ↑,
 * then player code ↑ as the last, arbitrary but stable, key.
 */
import type { LeaderboardRow } from "./types";

export function compareBoardRows(a: LeaderboardRow, b: LeaderboardRow): number {
  return (
    a.rank - b.rank ||
    b.total - a.total ||
    a.timeMs - b.timeMs ||
    a.code.localeCompare(b.code)
  );
}

export type PodiumPlace = 1 | 2 | 3;

/**
 * The top three as podium slots, in RANK order (1, 2, 3).
 *
 * The stage draws 2 · 1 · 3 from left to right, but that is a visual
 * arrangement only (CSS `order`). Until 2026-10-12 the list was written in
 * 2 · 1 · 3 order, so its text — what a screen reader, a crawler or anyone
 * reading the numbered list sees — put the runner-up first: "Manahil 175"
 * above "Manal 185".
 */
export function podiumSlots(rows: LeaderboardRow[]): { place: PodiumPlace; row: LeaderboardRow | undefined; column: 1 | 2 | 3 }[] {
  const top = [...rows].sort(compareBoardRows).slice(0, 3);
  const COLUMN: Record<PodiumPlace, 1 | 2 | 3> = { 1: 2, 2: 1, 3: 3 };
  return ([1, 2, 3] as const).map((place) => ({ place, row: top[place - 1], column: COLUMN[place] }));
}

export const PLACE_LABEL: Record<PodiumPlace, string> = { 1: "1st place", 2: "2nd place", 3: "3rd place" };
