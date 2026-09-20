// ============================================================
// Month arithmetic for expiry dates
// ============================================================
//
// Expiry on a pack is a month, not a day — "08/2028" means usable to the end
// of August 2028. Everything here therefore works in whole months on a
// "YYYY-MM" string, so a batch that expires this month is not wrongly called
// expired on the 1st.
//
// The simulation's "today" is always passed in. Nothing here reads the wall
// clock, so the tests are stable and a render can never disagree with the
// server about what day it is.

/** "YYYY-MM" → months since year 0. Returns NaN for a malformed value. */
export function monthIndex(yyyymm: string): number {
  const match = /^(\d{4})-(\d{2})$/.exec(yyyymm);
  if (!match) return NaN;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return NaN;
  return year * 12 + (month - 1);
}

export function fromMonthIndex(index: number): string {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

/** Months from `today` until `expiry` runs out. Negative means already expired. */
export function monthsUntilExpiry(expiry: string, todayMonth: string): number {
  const a = monthIndex(expiry);
  const b = monthIndex(todayMonth);
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return a - b;
}

export function addMonths(yyyymm: string, months: number): string {
  const idx = monthIndex(yyyymm);
  if (Number.isNaN(idx)) return yyyymm;
  return fromMonthIndex(idx + months);
}

/** "2026-08" → "08/2026", the way it is printed on a carton. */
export function formatExpiry(yyyymm: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(yyyymm);
  if (!match) return yyyymm;
  return `${match[2]}/${match[1]}`;
}

/** The "YYYY-MM" of an ISO date or a Date. */
export function toMonth(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** A readable date for the prescription and the label. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/** ISO date `days` after `iso`. Used for "does this batch outlast the course?". */
export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
