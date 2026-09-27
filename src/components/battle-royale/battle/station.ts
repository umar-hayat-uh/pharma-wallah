/**
 * The station's local copy of a battle — what makes it playable on bad
 * internet.
 *
 * Start downloads the whole battle (no answers). From then on everything the
 * player does is written here first, in localStorage, and rounds are sent to
 * the server from a queue that retries until it succeeds. A reload, a dropped
 * connection or a browser crash resumes from this record.
 *
 * Nothing here is trusted by the server: the device timers only decide when
 * the station stops accepting input. The server grades every round and applies
 * its own time window to each one.
 */
import type { BattleState, FoundWord, RoundAnswers, RoundNo } from "@/lib/battle-royale/types";

export const STORE_KEY = "br:station:v2";

export type Choice = "A" | "B" | "C" | "D" | null;

export type Progress = {
  /** The round being played on this device. */
  round: RoundNo;
  /** intro → play → end, per round; "finished" after round 3 is queued. */
  step: "intro" | "play" | "end" | "finished";
  /** Device time the current round (R1) or item (R2/R3) started — timers only. */
  startedAt: number | null;
  index: number;
  found: FoundWord[];
  boards: { questionId: string; matches: string[] }[];
  choices: { questionId: string; choice: Choice }[];
};

export type Station = {
  /** Participant code + server start time: identifies this battle. */
  key: string;
  state: BattleState;
  clockOffset: number;
  progress: Progress;
  queue: { round: RoundNo; answers: RoundAnswers }[];
};

export const battleKey = (s: BattleState) => `${s.participant.code}@${s.startedAt}`;

/**
 * True for a battle in the v2 shape (downloaded plan + per-round results). A
 * database still running the v1 engine returns neither; the station must not
 * try to play that.
 */
export function isPlayable(state: unknown): state is BattleState {
  const s = state as Partial<BattleState> | null;
  return Boolean(s && s.plan && s.plan.r1 && Array.isArray(s.plan.r2) && Array.isArray(s.plan.r3) && s.results && typeof s.results === "object");
}

export const OUTDATED_ENGINE =
  "The event database is on an older version. An organiser must run supabase/migrations/20260928_battle_royale_v2.sql in Supabase, then try again.";

export function freshProgress(state: BattleState): Progress {
  // Rounds the server already has are skipped: a re-issued code on a new
  // station lands on the first round still to play.
  const done = Object.keys(state.results ?? {}).map(Number);
  const next = ([1, 2, 3] as RoundNo[]).find((r) => !done.includes(r));
  return {
    round: next ?? 3,
    step: state.status === "completed" || !next ? "finished" : "intro",
    startedAt: null,
    index: 0,
    found: [],
    boards: [],
    choices: [],
  };
}

export function load(): Station | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as Station) : null;
  } catch {
    return null;
  }
}

export function save(station: Station | null) {
  try {
    if (station) localStorage.setItem(STORE_KEY, JSON.stringify(station));
    else localStorage.removeItem(STORE_KEY);
  } catch {
    /* storage full or blocked: the battle still runs from memory */
  }
}

/** The round's answers as the server expects them. */
export function answersFor(round: RoundNo, p: Progress): RoundAnswers {
  if (round === 1) return { found: p.found };
  if (round === 2) return { boards: p.boards };
  return { choices: p.choices };
}

/** Seconds left on a device timer. */
export function remaining(startedAt: number | null, seconds: number, now = Date.now()): number {
  if (startedAt === null) return seconds;
  return Math.max(0, Math.ceil(seconds - (now - startedAt) / 1000));
}

/** Letters along a straight line in the grid, or null if the line isn't straight. */
export function lineCells(r1: number, c1: number, r2: number, c2: number): [number, number][] | null {
  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);
  if (!(r1 === r2 || c1 === c2 || Math.abs(r2 - r1) === Math.abs(c2 - c1))) return null;
  const n = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) + 1;
  return Array.from({ length: n }, (_, i) => [r1 + dr * i, c1 + dc * i]);
}

/** Snap a drag end to the nearest of the 8 directions from the anchor, inside the grid. */
export function snapLine(r1: number, c1: number, r2: number, c2: number, size: number): [number, number] {
  const dR = r2 - r1;
  const dC = c2 - c1;
  if (dR === 0 && dC === 0) return [r1, c1];
  const angle = Math.atan2(dR, dC);
  const step = Math.round(angle / (Math.PI / 4));
  const dirs: [number, number][] = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
  const [dr, dc] = dirs[(step + 8) % 8];
  let len = Math.max(Math.abs(dR), Math.abs(dC));
  while (len > 0) {
    const er = r1 + dr * len;
    const ec = c1 + dc * len;
    if (er >= 0 && er < size && ec >= 0 && ec < size) return [er, ec];
    len -= 1;
  }
  return [r1, c1];
}

/** The word a line spells in the grid, forwards. */
export function spell(grid: string[], cells: [number, number][]): string {
  return cells.map(([r, c]) => grid[r]?.[c] ?? "").join("");
}
