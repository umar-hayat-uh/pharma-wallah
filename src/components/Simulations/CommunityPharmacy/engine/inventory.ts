// ============================================================
// Stock, batches and expiry
// ============================================================
//
// Inventory is real state: dispensing depletes it, it persists between cases,
// and a batch that has expired cannot be supplied. That is what turns "check
// the expiry" from a tick-box into something the student can get wrong.
//
// Batches are generated deterministically from the medicine id, so the shelf
// is the same every time a given pharmacy is opened, but different products
// sit at different points in their life — including a handful that are already
// out of date, because a real expiry dashboard is never empty.

import type { Batch, ExpiryStatus, Medicine, StockLine, StockStatus } from "../types";
import { MEDICINES } from "../data/medicines";
import { addMonths, monthsUntilExpiry, toMonth } from "./dates";
import { hashString, makeRng, randomInt } from "./rng";

/** Within this many months of running out, a batch is "expiring soon". */
export const EXPIRING_SOON_MONTHS = 6;

/** Products that deliberately carry an out-of-date batch, so the dashboard bites. */
const EXPIRED_BATCH_PRODUCTS = ["chlorpheniramine-4", "hydrocortisone-cream", "folic-acid-5"];

/** Products deliberately held below their reorder level. */
const LOW_STOCK_PRODUCTS = ["clarithromycin-500", "salbutamol-inhaler", "warfarin-5"];

function batchPrefix(m: Medicine): string {
  const letters = m.generic.replace(/[^A-Za-z]/g, "").toUpperCase();
  return letters.slice(0, 3) || "GEN";
}

/**
 * Build the opening inventory for the whole shelf.
 *
 * `todayMonth` anchors every expiry, so a case run in a test with a fixed date
 * sees exactly the same stock as the tests assert.
 */
export function buildInventory(todayMonth: string): StockLine[] {
  return MEDICINES.map((m) => {
    const rng = makeRng(hashString(m.id));
    const prefix = batchPrefix(m);
    const batches: Batch[] = [];

    if (EXPIRED_BATCH_PRODUCTS.indexOf(m.id) !== -1) {
      // An old batch that should have been pulled. Small, as a real one would be.
      batches.push({
        id: `${m.id}-b0`,
        batchNo: `${prefix}-${randomInt(rng, 1000, 9999)}`,
        expiry: addMonths(todayMonth, -randomInt(rng, 1, 5)),
        packs: randomInt(rng, 1, 3),
      });
    }

    // One batch close to its end and one comfortably in date: that pairing is
    // what makes "pick a batch that outlasts the course" a real decision.
    batches.push({
      id: `${m.id}-b1`,
      batchNo: `${prefix}-${randomInt(rng, 1000, 9999)}`,
      expiry: addMonths(todayMonth, randomInt(rng, 1, EXPIRING_SOON_MONTHS)),
      packs: randomInt(rng, 2, 8),
    });
    batches.push({
      id: `${m.id}-b2`,
      batchNo: `${prefix}-${randomInt(rng, 1000, 9999)}`,
      expiry: addMonths(todayMonth, randomInt(rng, 14, 40)),
      packs: LOW_STOCK_PRODUCTS.indexOf(m.id) !== -1 ? randomInt(rng, 1, 3) : randomInt(rng, 10, 30),
    });

    const reorderLevel = LOW_STOCK_PRODUCTS.indexOf(m.id) !== -1 ? 20 : randomInt(rng, 4, 10);
    return { medicineId: m.id, packs: totalPacks(batches), reorderLevel, batches };
  });
}

export function totalPacks(batches: Batch[]): number {
  return batches.reduce((sum, b) => sum + b.packs, 0);
}

export function expiryStatus(expiry: string, todayMonth: string): ExpiryStatus {
  const months = monthsUntilExpiry(expiry, todayMonth);
  if (Number.isNaN(months)) return "normal";
  if (months < 0) return "expired";
  if (months <= EXPIRING_SOON_MONTHS) return "expiring-soon";
  return "normal";
}

export function stockStatus(line: StockLine, todayMonth: string): StockStatus {
  const usable = usablePacks(line, todayMonth);
  if (usable <= 0) return "out";
  if (usable < line.reorderLevel) return "low";
  return "in-stock";
}

/** Packs that are not already out of date. Expired stock is not stock. */
export function usablePacks(line: StockLine, todayMonth: string): number {
  return line.batches.filter((b) => expiryStatus(b.expiry, todayMonth) !== "expired").reduce((s, b) => s + b.packs, 0);
}

export function stockFor(stock: StockLine[], medicineId: string): StockLine | undefined {
  return stock.find((l) => l.medicineId === medicineId);
}

/**
 * Batches a student may legitimately pick, best first.
 *
 * Expired batches are still returned — they must be visible, or "check the
 * expiry" cannot be practised. `expiryStatus` is what the UI marks them with.
 */
export function batchesFor(stock: StockLine[], medicineId: string): Batch[] {
  const line = stockFor(stock, medicineId);
  if (!line) return [];
  return line.batches.slice().sort((a, b) => a.expiry.localeCompare(b.expiry));
}

/**
 * Does this batch outlast the course?
 *
 * The pack is usable to the end of its expiry month, so the comparison is
 * month-to-month against the month the course finishes in.
 */
export function batchCoversCourse(batch: Batch, courseEndMonth: string): boolean {
  const months = monthsUntilExpiry(batch.expiry, courseEndMonth);
  return !Number.isNaN(months) && months >= 0;
}

/** Remove packs from a named batch. Returns new stock — never mutates. */
export function dispensePacks(stock: StockLine[], medicineId: string, batchId: string, packs: number): StockLine[] {
  return stock.map((line) => {
    if (line.medicineId !== medicineId) return line;
    const batches = line.batches.map((b) => (b.id === batchId ? { ...b, packs: Math.max(0, b.packs - packs) } : b));
    return { ...line, batches, packs: totalPacks(batches) };
  });
}

/** Add packs to a batch, or create one. Used by the inventory drawer. */
export function receivePacks(stock: StockLine[], medicineId: string, batchId: string, packs: number): StockLine[] {
  return stock.map((line) => {
    if (line.medicineId !== medicineId) return line;
    const batches = line.batches.map((b) => (b.id === batchId ? { ...b, packs: b.packs + packs } : b));
    return { ...line, batches, packs: totalPacks(batches) };
  });
}

/** Discard an expired batch entirely — the correct action on a date check. */
export function removeBatch(stock: StockLine[], medicineId: string, batchId: string): StockLine[] {
  return stock.map((line) => {
    if (line.medicineId !== medicineId) return line;
    const batches = line.batches.filter((b) => b.id !== batchId);
    return { ...line, batches, packs: totalPacks(batches) };
  });
}

export interface ExpirySummary {
  expired: { medicineId: string; batch: Batch }[];
  expiringSoon: { medicineId: string; batch: Batch }[];
  normalCount: number;
}

export function summariseExpiry(stock: StockLine[], todayMonth: string): ExpirySummary {
  const expired: { medicineId: string; batch: Batch }[] = [];
  const expiringSoon: { medicineId: string; batch: Batch }[] = [];
  let normalCount = 0;
  stock.forEach((line) => {
    line.batches.forEach((batch) => {
      const status = expiryStatus(batch.expiry, todayMonth);
      if (status === "expired") expired.push({ medicineId: line.medicineId, batch });
      else if (status === "expiring-soon") expiringSoon.push({ medicineId: line.medicineId, batch });
      else normalCount += 1;
    });
  });
  const byDate = (a: { batch: Batch }, b: { batch: Batch }) => a.batch.expiry.localeCompare(b.batch.expiry);
  expired.sort(byDate);
  expiringSoon.sort(byDate);
  return { expired, expiringSoon, normalCount };
}

/** Lines at or below their reorder level, worst first. */
export function reorderList(stock: StockLine[], todayMonth: string): StockLine[] {
  return stock
    .filter((l) => stockStatus(l, todayMonth) !== "in-stock")
    .sort((a, b) => usablePacks(a, todayMonth) - usablePacks(b, todayMonth));
}

/** Convenience for the opening screen, which shows the pharmacy's own date. */
export function currentMonth(today: string): string {
  return toMonth(today);
}
