/**
 * Master formula scaling — pure functions, no I/O (this ships in the APK).
 *
 *   Scaling factor = Desired quantity ÷ Master formula quantity
 *   Required amount = Master formula amount × Scaling factor
 *
 * Two ingredient "units" are deliberately NOT multiplied, because scaling them
 * would give a wrong formula rather than a smaller one:
 *  - "%"    a concentration. 10% glycerin is 10% in 1000 mL and in 100 mL.
 *  - "q.s." quantum sufficit — "enough to make up to volume/weight". It has no
 *           amount of its own; in the scaled batch it is q.s. to the new size.
 */

import { formatSig, toNumber } from "@/components/calculators/lab-math";

/* ─── Units ──────────────────────────────────────────────────────────────── */

/**
 * Batch-size units. Within a family the desired quantity may use a different
 * unit (a 1 L master, 100 mL wanted); count units only scale against themselves.
 */
const BATCH_FAMILIES: Record<string, { family: string; toBase: number }> = {
  mL: { family: "volume", toBase: 1 },
  L: { family: "volume", toBase: 1000 },
  g: { family: "mass", toBase: 1 },
  kg: { family: "mass", toBase: 1000 },
  tablets: { family: "tablets", toBase: 1 },
  capsules: { family: "capsules", toBase: 1 },
  suppositories: { family: "suppositories", toBase: 1 },
};

export const BATCH_UNITS = Object.keys(BATCH_FAMILIES);

/** The units a desired quantity may be entered in, given the master batch unit. */
export function compatibleBatchUnits(masterUnit: string): string[] {
  const family = BATCH_FAMILIES[masterUnit]?.family;
  return BATCH_UNITS.filter((unit) => BATCH_FAMILIES[unit].family === family);
}

export const INGREDIENT_UNITS = ["g", "mg", "µg", "kg", "mL", "L", "drops", "IU", "%", "q.s."];

/** Units that are carried over unchanged instead of being multiplied. */
export const isPercent = (unit: string) => unit === "%";
export const isQs = (unit: string) => unit === "q.s.";

/* ─── Formatting ─────────────────────────────────────────────────────────── */

/**
 * An amount as a student would write it in a formula.
 *
 * Float noise is removed first (650 × 0.1 is 65.00000000000001 in JS). From 1
 * up, up to three decimals — a balance or pipette reads no finer, and the
 * master's own figure (1,234.5 g) is never rounded away. Below 1, four
 * significant figures, so 0.03334 mg does not collapse to 0.033.
 */
export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const clean = Number(value.toPrecision(12));
  if (Math.abs(clean) >= 1) {
    return clean.toLocaleString("en-US", { maximumFractionDigits: 3 });
  }
  return formatSig(clean, 4);
}

/** The scaling factor keeps more figures — every amount is multiplied by it. */
export const formatFactor = (value: number) => formatSig(Number(value.toPrecision(12)), 6);

/* ─── Calculation ────────────────────────────────────────────────────────── */

export type IngredientInput = { id: number; name: string; quantity: string; unit: string };

export type ScaledIngredient = {
  id: number;
  name: string;
  unit: string;
  /** The master formula column, e.g. "650 g", "10 %", "q.s.". */
  master: string;
  /** The required column, e.g. "65 g". */
  required: string;
  /** One line of the Calculation Details, e.g. "Sucrose = 650 × 0.1 = 65 g". */
  working: string;
  kind: "scaled" | "percent" | "qs";
};

export type ScaleResult = {
  /** Desired quantity ÷ master quantity, both in the master batch unit. */
  factor: number;
  /** Set only when the desired quantity was converted, e.g. "100 mL = 0.1 L". */
  conversion?: string;
  desiredInMasterUnit: number;
  ingredients: ScaledIngredient[];
};

/**
 * Scales the master formula, or returns null while any input is missing or
 * invalid. The page shows field-level errors; this only decides whether there
 * is a result to show.
 */
export function scaleFormula(
  masterQty: string,
  masterUnit: string,
  desiredQty: string,
  desiredUnit: string,
  ingredients: IngredientInput[],
): ScaleResult | null {
  const master = toNumber(masterQty);
  const desired = toNumber(desiredQty);
  if (master === null || desired === null || master <= 0 || desired <= 0) return null;

  const from = BATCH_FAMILIES[desiredUnit];
  const to = BATCH_FAMILIES[masterUnit];
  if (!from || !to || from.family !== to.family) return null;
  if (ingredients.length === 0) return null;

  // Convert once, into the master's unit, so the factor is a pure ratio.
  const desiredInMasterUnit = (desired * from.toBase) / to.toBase;
  const factor = desiredInMasterUnit / master;
  const factorText = formatFactor(factor);
  const desiredText = `${formatAmount(desired)} ${desiredUnit}`;

  const scaled: ScaledIngredient[] = [];
  for (const ingredient of ingredients) {
    const name = ingredient.name.trim();
    if (!name) return null;
    const { unit } = ingredient;

    if (isQs(unit)) {
      scaled.push({
        id: ingredient.id,
        name,
        unit,
        master: "q.s.",
        required: `q.s. to ${desiredText}`,
        working: `${name} = q.s. to ${desiredText} (make up to the final quantity; not multiplied)`,
        kind: "qs",
      });
      continue;
    }

    const amount = toNumber(ingredient.quantity);
    if (amount === null || amount <= 0) return null;

    if (isPercent(unit)) {
      if (amount > 100) return null;
      scaled.push({
        id: ingredient.id,
        name,
        unit,
        master: `${formatAmount(amount)} %`,
        required: `${formatAmount(amount)} %`,
        working: `${name} = ${formatAmount(amount)} % (a concentration stays the same at any batch size; not multiplied)`,
        kind: "percent",
      });
      continue;
    }

    const required = amount * factor;
    scaled.push({
      id: ingredient.id,
      name,
      unit,
      master: `${formatAmount(amount)} ${unit}`,
      required: `${formatAmount(required)} ${unit}`,
      working: `${name} = ${formatAmount(amount)} × ${factorText} = ${formatAmount(required)} ${unit}`,
      kind: "scaled",
    });
  }

  return {
    factor,
    desiredInMasterUnit,
    conversion:
      desiredUnit !== masterUnit
        ? `${desiredText} = ${formatAmount(desiredInMasterUnit)} ${masterUnit}`
        : undefined,
    ingredients: scaled,
  };
}
