/**
 * Battle Royale — pure display helpers. Client-safe, no imports, unit-tested
 * in scripts/battle-royale.test.mts.
 */

export const EVENT_TZ = "Asia/Karachi";

/** "Ayesha Khan" → "Ayesha K." — the public board's default. */
export function shortName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Player";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/** 83_450 → "1:23.4" (m:ss.t), or "48.2 s" under a minute. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const tenths = Math.round(ms / 100);
  const totalSeconds = Math.floor(tenths / 10);
  const t = tenths % 10;
  if (totalSeconds < 60) return `${totalSeconds}.${t} s`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}.${t}`;
}

/** Remaining whole seconds on a server deadline, given the client's clock offset. */
export function secondsLeft(deadlineIso: string, clockOffsetMs: number, nowMs: number = Date.now()): number {
  const deadline = Date.parse(deadlineIso);
  if (Number.isNaN(deadline)) return 0;
  return Math.max(0, Math.ceil((deadline - (nowMs + clockOffsetMs)) / 1000));
}

export function formatEventDate(isoDate: string | null): string {
  if (!isoDate) return "To be announced";
  const d = new Date(`${isoDate}T12:00:00+05:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: EVENT_TZ }).format(d);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: EVENT_TZ })
    .format(d)
    .toUpperCase();
}

export function formatSlot(slot: { name: string; startTime: string; endTime: string } | null): string {
  if (!slot) return "Walk-in — any open station";
  return `${slot.name} · ${formatTime(slot.startTime)}–${formatTime(slot.endTime)}`;
}

/** "1st", "2nd", "3rd", "11th", "22nd" … */
export function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

/** "BR-2026-0007" style check — only the shape; existence is the server's job. */
export function looksLikePlayerId(value: string): boolean {
  return /^BR-\d{4}-\d{4,}$/i.test(value.trim());
}

/** "user@domain.com" → "u•••@domain.com", for lookups that confirm identity. */
export function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const [local, domain] = email.split("@");
  if (!domain) return null;
  return `${local[0] ?? ""}•••@${domain}`;
}
