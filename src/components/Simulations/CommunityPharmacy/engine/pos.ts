// ============================================================
// The till
// ============================================================

import type { PosLine, PosTotals, TrayItem } from "../types";
import { medicine } from "../data/medicines";

/** Prices are indicative PKR retail, for the arithmetic — not a price list. */
export function buildTotals(tray: TrayItem[], discountPkr: number): PosTotals {
  const lines: PosLine[] = [];
  tray.forEach((t) => {
    const m = medicine(t.medicineId);
    if (!m) return;
    lines.push({
      medicineId: m.id,
      description: `${m.brand} ${m.strength} ${m.form} — ${t.units} ${m.packUnit}`,
      packs: t.packs,
      unitPricePkr: m.pricePkr,
      totalPkr: m.pricePkr * t.packs,
    });
  });
  const subtotalPkr = lines.reduce((s, l) => s + l.totalPkr, 0);
  const discount = Math.max(0, Math.min(discountPkr, subtotalPkr));
  return { lines, subtotalPkr, discountPkr: discount, totalPkr: subtotalPkr - discount };
}

export function formatPkr(amount: number): string {
  return `Rs ${amount.toLocaleString("en-PK")}`;
}
