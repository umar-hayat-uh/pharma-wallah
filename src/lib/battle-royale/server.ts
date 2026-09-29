/**
 * Battle Royale — server-side core. NEVER import from a client component: it
 * holds the service-role client (RLS bypassed).
 *
 * Authorization model (MEMORY.md §3): this feature is "Model A", but with no
 * user accounts for players. The browser never reads a table. A player enters
 * the arena with the single-use Game Code the desk issued on approving their
 * payment; from then on the battle is identified by a random token in an
 * httpOnly cookie whose SHA-256 is all the database stores. Admins are Supabase users with a row in
 * `br_admins` — checked here on every admin request, not by comparing emails.
 */
import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase-server";
import { clientIpFrom } from "@/lib/ai-guide/pure";
import type { AdminRole, PublicSession, PublicSettings } from "./types";

export const db = () => createServiceSupabaseClient();
export { clientIpFrom };

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/* ── Engine errors ─────────────────────────────────────────────────────────
 * The SQL functions raise `BR_<CODE>`. Each maps to a status and a sentence a
 * participant can act on. Anything unrecognised is logged and reported as a
 * generic failure — raw database text never reaches the browser. */

const ENGINE_ERRORS: Record<string, [number, string]> = {
  BR_INVALID_CODE: [401, "That Game Code isn't valid. Check the slip from the desk and try again."],
  BR_CODE_USED: [409, "This Game Code has already been used. If your station failed, ask the desk for a new code to continue."],
  BR_DISQUALIFIED: [403, "This participant has been disqualified. Please speak to an event coordinator."],
  BR_CANCELLED: [403, "This registration was cancelled. Please speak to the registration desk."],
  BR_NOT_REGISTERED: [409, "This registration is cancelled or disqualified, so no code can be issued."],
  BR_ALREADY_PLAYED: [409, "This participant has already completed their official attempt."],
  BR_CLOSED: [403, "The arena isn't open for battles right now. Please wait for a coordinator."],
  BR_NOT_PAID: [402, "The entry fee hasn't been confirmed yet. Please pay at the PharmaWallah desk."],
  BR_SESSION_ENDED: [403, "This battle session has ended."],
  BR_NO_QUESTIONS: [503, "The question bank isn't ready yet. Please tell a coordinator."],
  BR_NO_ATTEMPT: [404, "No battle is running on this device. Enter your Game Code to continue."],
  BR_ATTEMPT_VOID: [410, "This attempt was reset by a coordinator. Ask the desk for a new Game Code."],
  BR_COMPLETED: [409, "This battle is already complete."],
  BR_ROUND_ORDER: [409, "Rounds must be submitted in order. Syncing…"],
  BR_REGISTRATION_CLOSED: [403, "Online registration is closed. You can still register at the PharmaWallah desk."],
  BR_EMAIL_TAKEN: [409, "This email is already registered for Battle Royale."],
  BR_SLOT_FULL: [409, "That battle slot is full. Please choose another."],
  BR_SLOT_UNAVAILABLE: [409, "That battle slot is no longer available. Please choose another."],
  BR_NOT_FOUND: [404, "Participant not found."],
};

export const GENERIC_ERROR = "Something went wrong. Please try again.";

export function engineCode(err: unknown): string | null {
  const message = typeof err === "object" && err && "message" in err ? String((err as { message: unknown }).message) : "";
  const match = message.match(/\bBR_[A-Z_]+\b/);
  return match ? match[0] : null;
}

export function engineErrorResponse(err: unknown, where: string) {
  const code = engineCode(err);
  if (code && ENGINE_ERRORS[code]) {
    const [status, message] = ENGINE_ERRORS[code];
    return NextResponse.json({ error: message, code }, { status });
  }
  console.error(`[battle-royale] ${where} failed`, err);
  return errorResponse(GENERIC_ERROR, 500);
}

/* ── Battle token ─────────────────────────────────────────────────────────── */

export const ATTEMPT_COOKIE = "br_attempt";
const ATTEMPT_MAX_AGE = 60 * 60 * 6; // a long queue at the stall still fits

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function setAttemptCookie(res: NextResponse, token: string) {
  res.cookies.set(ATTEMPT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ATTEMPT_MAX_AGE,
  });
}

export function clearAttemptCookie(res: NextResponse) {
  res.cookies.set(ATTEMPT_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

/** The token's hash from the request cookie, or null when there is none. */
export function attemptHashFrom(req: Request): string | null {
  const header = req.headers.get("cookie") ?? "";
  const match = header.match(new RegExp(`(?:^|;\\s*)${ATTEMPT_COOKIE}=([^;]+)`));
  const token = match?.[1];
  if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  return hashToken(token);
}

/* ── Admin ────────────────────────────────────────────────────────────────── */

export type AdminContext = { userId: string; email: string; role: AdminRole };

/**
 * Resolve the signed-in user and their `br_admins` row. `desk` can register,
 * take payments and check people in; everything else needs `admin`.
 */
export async function getBattleAdmin(): Promise<
  { ok: true; admin: AdminContext } | { ok: false; status: 401 | 403 }
> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401 };

  const svc = await db();
  const { data, error } = await svc.from("br_admins").select("role").eq("user_id", user.id).maybeSingle();
  if (error) {
    console.error("[battle-royale] admin lookup failed", error);
    return { ok: false, status: 403 };
  }
  if (!data) return { ok: false, status: 403 };
  return { ok: true, admin: { userId: user.id, email: user.email ?? "", role: data.role as AdminRole } };
}

/** For route handlers: the admin, or a ready-made 401/403 response. */
export async function requireBattleAdmin(
  need: AdminRole = "admin",
): Promise<{ admin: AdminContext; response?: never } | { admin?: never; response: NextResponse }> {
  const result = await getBattleAdmin();
  if (!result.ok) {
    return {
      response: errorResponse(result.status === 401 ? "Please sign in." : "You don't have access to the Battle Royale admin.", result.status),
    };
  }
  if (need === "admin" && result.admin.role !== "admin") {
    return { response: errorResponse("This action needs a full event administrator.", 403) };
  }
  return { admin: result.admin };
}

/* ── Settings and sessions ────────────────────────────────────────────────── */

export const SETTINGS_TAG = "br-settings";
export const SESSIONS_TAG = "br-sessions";

// Postgres row → client shape. Kept in one place so the column list is too.
export type SettingsRow = {
  event_title: string; tagline: string; event_date: string | null; reporting_time: string; venue: string;
  entry_fee: number; contact_text: string; round1_count: number; round2_count: number; round3_count: number;
  round1_seconds: number; grid_size: number; sync_grace_seconds: number; winners_count: number; registration_open: boolean;
  competition_open: boolean; leaderboard_frozen_at: string | null; results_finalized: boolean;
  show_full_names: boolean; rules: unknown;
  /** Added 2026-09-29 (20260929_battle_royale_closed.sql); absent on an older database. */
  event_closed?: boolean;
};

export function toPublicSettings(r: SettingsRow): PublicSettings {
  return {
    eventTitle: r.event_title,
    tagline: r.tagline,
    eventDate: r.event_date,
    reportingTime: r.reporting_time,
    venue: r.venue,
    entryFee: r.entry_fee,
    contactText: r.contact_text,
    roundCounts: [r.round1_count, r.round2_count, r.round3_count],
    round1Seconds: r.round1_seconds ?? 120,
    gridSize: r.grid_size ?? 10,
    syncGraceSeconds: r.sync_grace_seconds ?? 180,
    winnersCount: r.winners_count,
    registrationOpen: r.registration_open,
    competitionOpen: r.competition_open,
    leaderboardFrozenAt: r.leaderboard_frozen_at,
    resultsFinalized: r.results_finalized,
    showFullNames: r.show_full_names,
    eventClosed: r.event_closed ?? false,
    rules: Array.isArray(r.rules) ? r.rules.filter((x): x is string => typeof x === "string") : [],
  };
}

/** Uncached read, for the engine-adjacent routes that must see a change at once. */
export async function readSettings(): Promise<PublicSettings | null> {
  const svc = await db();
  const { data, error } = await svc.from("br_settings").select("*").eq("id", 1).maybeSingle();
  if (error || !data) {
    if (error) console.error("[battle-royale] settings read failed", error);
    return null;
  }
  return toPublicSettings(data as SettingsRow);
}

/**
 * Cached for the public pages (landing, instructions, register). Admin edits
 * call `revalidateTag(SETTINGS_TAG)`, so a change shows within one request.
 * Returns null when the tables don't exist yet (migration not applied) — the
 * pages then say so rather than crash.
 */
export const getPublicSettings = unstable_cache(readSettings, ["br-settings-v1"], {
  tags: [SETTINGS_TAG],
  revalidate: 60,
});

async function readOpenSessions(): Promise<PublicSession[]> {
  const svc = await db();
  const { data, error } = await svc
    .from("br_sessions")
    .select("id, name, event_date, start_time, end_time, capacity, status")
    .in("status", ["scheduled", "open", "live"])
    .order("start_time", { ascending: true })
    .limit(50);
  if (error || !data) {
    if (error) console.error("[battle-royale] sessions read failed", error);
    return [];
  }
  const ids = data.map((s) => s.id);
  const taken = new Map<string, number>();
  if (ids.length) {
    const { data: rows } = await svc
      .from("br_participants")
      .select("slot_id")
      .in("slot_id", ids)
      .neq("registration_status", "cancelled");
    for (const r of rows ?? []) taken.set(r.slot_id, (taken.get(r.slot_id) ?? 0) + 1);
  }
  return data.map((s) => ({
    id: s.id,
    name: s.name,
    eventDate: s.event_date,
    startTime: s.start_time,
    endTime: s.end_time,
    status: s.status,
    seatsLeft: Math.max(0, s.capacity - (taken.get(s.id) ?? 0)),
  }));
}

export const getOpenSessions = unstable_cache(readOpenSessions, ["br-sessions-v1"], {
  tags: [SESSIONS_TAG],
  revalidate: 30,
});

/** Parse a JSON body without throwing. */
export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}
