/**
 * Turns a validated dilution into the lab record card (LabReportData).
 *
 * Kept apart from page.tsx so the page holds inputs and validation, and this
 * file holds the wording of the record. Only called with inputs that have
 * already passed validation — nothing here re-checks them.
 */

import {
  formatSig,
  formatScientific,
  VOLUME_TO_ML,
  type VolumeUnit,
  type LabReportData,
  type LabReportSection,
  type LabReportRow,
} from "@/components/calculators";
import {
  CONC_UNITS,
  analyseTarget,
  computeChain,
  convenientPlan,
  displayConc,
  exactFactor,
  fromBase,
  minimumSteps,
  practicalVolume,
  relClose,
  stepsToTarget,
  type Chain,
  type ConcUnit,
} from "./_dilution";

/* ─── Formatting ─────────────────────────────────────────────────────────── */

/** Three significant figures with trailing zeros kept — "1.00 mL", "9.50 mL". */
export function sig3(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  if (Math.abs(value) < 1e-3) return formatScientific(value, 3);
  if (Math.abs(value) >= 1000) return Math.round(value).toLocaleString("en-US");
  const text = value.toPrecision(3);
  return text.includes("e") ? Number(text).toLocaleString("en-US") : text;
}

/** A volume in the unit you would set on the pipette. */
export function vol(ml: number): string {
  const { value, unit } = practicalVolume(ml);
  return `${sig3(value)} ${unit}`;
}

export const volIn = (ml: number, unit: VolumeUnit) => `${sig3(ml / VOLUME_TO_ML[unit])} ${unit}`;

/** Practical unit, plus the student's chosen unit when that differs. */
export function volBoth(ml: number, chosen: VolumeUnit): string {
  const practical = practicalVolume(ml).unit;
  return practical === chosen ? vol(ml) : `${vol(ml)} (${volIn(ml, chosen)})`;
}

export function conc(base: number, preferred: ConcUnit): string {
  const { value, unit } = displayConc(base, preferred);
  return `${formatSig(value, 4)} ${CONC_UNITS[unit].label}`;
}

export const concIn = (base: number, unit: ConcUnit) => `${formatSig(fromBase(base, unit), 4)} ${CONC_UNITS[unit].label}`;

/** Concentration in a readable unit, with the stock's unit alongside when they differ. */
function concBoth(base: number, unit: ConcUnit): string {
  const shown = displayConc(base, unit);
  return shown.unit === unit ? conc(base, unit) : `${conc(base, unit)} (= ${concIn(base, unit)})`;
}

export const factorLabel = (x: number) => `1:${formatSig(x, 4)}`;
export const fractionLabel = (x: number) => `× ${formatSig(1 / x, 3)}`;
const factorBoth = (x: number) => `${factorLabel(x)} (${fractionLabel(x)})`;
const tubeRange = (n: number) => (n === 1 ? "T1" : `T1–T${n}`);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const CONTEXT = "Pharmaceutics Lab · Solution preparation";
const TINY_ML = 0.01; // 10 µL
const HUGE_ML = 1000; // 1 L

const TINY_WARNING = "Volumes below 10 µL are hard to pipette accurately";
const HUGE_WARNING =
  "A volume above 1 L is involved — check the volume units; this is far larger than a routine bench dilution.";

const CONVENTION_LINE =
  "Dilution factor is written 1:X — 1 part of solution in X parts total. 1:10 means C_new = C_start × 1/10 (× 0.1), so \"C_final = C_initial × dilution factor\" uses the fraction 1/X.";

/* ─── Shared pieces for a chain of tubes ──────────────────────────────────── */

function chainTable(chain: Chain, unit: ConcUnit, keepFull: boolean): NonNullable<LabReportSection["table"]> {
  return {
    columns: [
      "Step",
      "Starting concentration",
      "Dilution factor",
      "Volume taken",
      "Diluent added",
      keepFull ? "Final volume (made up)" : "Final volume",
      "New concentration",
      ...(keepFull ? [] : ["Left in tube"]),
    ],
    rows: chain.tubes.map((tube, i) => [
      `T${tube.number}`,
      `${conc(tube.startBase, unit)}${i === 0 ? " (stock)" : ""}`,
      factorBoth(tube.factor),
      `${vol(tube.transferMl)} from ${i === 0 ? "stock" : `T${i}`}`,
      vol(tube.diluentMl),
      vol(tube.preparedMl),
      conc(tube.endBase, unit),
      ...(keepFull ? [] : [vol(tube.remainingMl)]),
    ]),
  };
}

function chainCalculation(chain: Chain, unit: ConcUnit, keepFull: boolean, uniform: number | null): string[] {
  const n = chain.tubes.length;
  const shown = n <= 3 ? chain.tubes.map((_, i) => i) : [0, 1, n - 1];
  const out: string[] = [];

  shown.forEach((index) => {
    const t = chain.tubes[index];
    const k = t.number;
    if (n > 3 && index === n - 1) {
      out.push(n === 4 ? "⋮  T3 follows the same pattern" : `⋮  T3–T${n - 1} follow the same pattern`);
    }
    if (keepFull && index < n - 1) {
      const next = chain.tubes[index + 1];
      out.push(`T${k} made up = ${vol(t.remainingMl)} kept + ${vol(next.transferMl)} for T${k + 1} = ${vol(t.preparedMl)}`);
    }
    out.push(`T${k} volume taken = ${vol(t.preparedMl)} ÷ ${formatSig(t.factor, 4)} = ${vol(t.transferMl)}`);
    out.push(`T${k} diluent = ${vol(t.preparedMl)} − ${vol(t.transferMl)} = ${vol(t.diluentMl)}`);
    out.push(`T${k} C = ${conc(t.startBase, unit)} × 1/${formatSig(t.factor, 4)} = ${conc(t.endBase, unit)}`);
  });

  out.push(
    uniform !== null
      ? `Overall factor = ${formatSig(uniform, 4)}^${n} = ${formatSig(chain.overallFactor, 4)}`
      : `Overall factor = ${chain.tubes.map((t) => formatSig(t.factor, 4)).join(" × ")} = ${formatSig(chain.overallFactor, 4)}`,
  );
  out.push(`C_final = ${conc(chain.tubes[0].startBase, unit)} ÷ ${formatSig(chain.overallFactor, 4)} = ${conc(chain.finalBase, unit)}`);
  out.push(`Stock required = T1 volume taken = ${vol(chain.stockMl)}`);
  out.push(
    n <= 6
      ? `Total diluent = ${chain.tubes.map((t) => vol(t.diluentMl)).join(" + ")} = ${vol(chain.totalDiluentMl)}`
      : `Total diluent = sum of the diluent column = ${vol(chain.totalDiluentMl)}`,
  );
  return out;
}

function chainInstructions(chain: Chain, unit: ConcUnit, keepFull: boolean, name: string): string[] {
  const n = chain.tubes.length;
  const lines: string[] = [];
  let step = 1;
  const add = (text: string) => lines.push(`${step++}. ${text}`);

  add(`Label ${plural(n, "tube")} ${tubeRange(n)}${name ? ` for ${name}` : ""}.`);

  const diluents = chain.tubes.map((t) => vol(t.diluentMl));
  add(
    diluents.every((d) => d === diluents[0])
      ? `Pipette ${diluents[0]} of diluent into ${n === 1 ? "the tube" : "each tube"} first.`
      : `Pipette the diluent into each tube first: ${chain.tubes.map((t, i) => `T${t.number} ${diluents[i]}`).join(", ")}.`,
  );

  chain.tubes.forEach((t, i) => {
    add(
      i === 0
        ? `T1: mix the stock (${conc(t.startBase, unit)}), then pipette ${vol(t.transferMl)} of stock into the ${vol(t.diluentMl)} of diluent in T1. Mix by gently inverting 5 times or pipetting up and down. T1 is now ${conc(t.endBase, unit)}.`
        : `T${t.number}: with a fresh tip, mix T${i} and transfer ${vol(t.transferMl)} from T${i} into the ${vol(t.diluentMl)} of diluent in T${t.number}. Mix as before. T${t.number} is now ${conc(t.endBase, unit)}.`,
    );
  });

  if (keepFull) {
    const kept = chain.tubes.map((t) => vol(t.remainingMl));
    add(
      kept.every((k) => k === kept[0])
        ? `Every tube keeps ${kept[0]} after the next transfer. Label each with the drug, concentration and date.`
        : `After the transfers each tube keeps its final volume (${chain.tubes.map((t, i) => `T${t.number} ${kept[i]}`).join(", ")}). Label each with the drug, concentration and date.`,
    );
  } else if (n > 1) {
    const left = chain.tubes.slice(0, -1).map((t) => vol(t.remainingMl));
    const last = chain.tubes[n - 1];
    add(
      left.every((l) => l === left[0])
        ? `After the transfers ${n === 2 ? "T1 holds" : `T1–T${n - 1} each hold`} ${left[0]}, and T${n} holds ${vol(last.remainingMl)}. Label each with the drug, concentration and date.`
        : `After the transfers: ${chain.tubes.map((t) => `T${t.number} holds ${vol(t.remainingMl)}`).join(", ")}. Label each with the drug, concentration and date.`,
    );
  } else {
    add(`T1 holds ${vol(chain.tubes[0].remainingMl)}. Label it with the drug, concentration and date.`);
  }
  return lines;
}

function volumeWarnings(transfers: { label: string; ml: number }[], allVolumesMl: number[]): string[] {
  const out: string[] = [];
  const tiny = transfers.filter((t) => t.ml < TINY_ML);
  if (tiny.length) {
    out.push(`${TINY_WARNING} — ${tiny.map((t) => `${t.label}: ${vol(t.ml)}`).join(", ")}. Use a smaller factor per step, larger volumes, or an intermediate dilution.`);
  }
  if (allVolumesMl.some((v) => v > HUGE_ML)) out.push(HUGE_WARNING);
  return out;
}

/* ─── Serial and stepwise ────────────────────────────────────────────────── */

export type ChainArgs = {
  kind: "serial" | "stepwise";
  c1Base: number;
  c1Unit: ConcUnit;
  factors: number[];
  finalMls: number[];
  finalUnit: VolumeUnit;
  keepFull: boolean;
  stockAvailableMl: number | null;
  target: { base: number; unit: ConcUnit } | null;
};

export function buildChainReport(args: ChainArgs, name: string): LabReportData {
  const { c1Base, c1Unit, keepFull, kind, target } = args;
  const chain = computeChain(
    c1Base,
    args.factors.map((factor, i) => ({ factor, finalMl: args.finalMls[i] })),
    keepFull,
  );
  const n = chain.tubes.length;
  const uniform = kind === "serial" ? args.factors[0] : null;
  const finalShown = displayConc(chain.finalBase, c1Unit);

  const warnings = volumeWarnings(
    chain.tubes.map((t) => ({ label: `T${t.number} volume taken`, ml: t.transferMl })),
    [...chain.tubes.map((t) => t.preparedMl), ...(args.stockAvailableMl !== null ? [args.stockAvailableMl] : [])],
  );
  if (args.stockAvailableMl !== null && chain.stockMl > args.stockAvailableMl * (1 + 1e-9)) {
    warnings.unshift(
      `Not enough stock: T1 needs ${vol(chain.stockMl)} but only ${vol(args.stockAvailableMl)} is available. Prepare more stock, reduce the tube volumes, or use a larger first-step factor.`,
    );
  }

  // ── Desired final concentration ──
  const summaryLines: string[] = [];
  const targetRows: LabReportRow[] = [];
  if (target) {
    const analysis = analyseTarget(chain, target.base);
    const targetText = conc(target.base, target.unit);
    const concAt = (tube: number) => (tube === 0 ? c1Base : chain.tubes[tube - 1].endBase);
    const tubeName = (tube: number) => (tube === 0 ? "the stock" : `T${tube}`);

    if (analysis.kind === "reached") {
      targetRows.push({ label: "Desired concentration", value: `${targetText} — reached in T${analysis.tube}` });
      if (analysis.tube < n) {
        summaryLines.push(
          `The desired ${targetText} is reached in T${analysis.tube}, so only ${plural(analysis.tube, "step")} ${analysis.tube === 1 ? "is" : "are"} needed; ${analysis.tube + 1 === n ? `T${n} goes` : `T${analysis.tube + 1}–T${n} go`} below it.`,
        );
      }
    } else {
      const above = analysis.kind === "between" ? analysis.above : n;
      targetRows.push({ label: "Desired concentration", value: `${targetText} — not reached exactly` });
      warnings.push(
        analysis.kind === "between"
          ? `The desired ${targetText} falls between ${tubeName(analysis.above)} (${conc(concAt(analysis.above), c1Unit)}) and T${analysis.below} (${conc(concAt(analysis.below), c1Unit)}) — no tube is at it. Your inputs have not been changed.`
          : `After ${plural(n, "step")} the concentration (${conc(chain.finalBase, c1Unit)}) is still above the desired ${targetText}. Your inputs have not been changed.`,
      );
      if (uniform !== null) {
        const needed = stepsToTarget(c1Base, target.base, uniform);
        const overall = c1Base / target.base;
        summaryLines.push(
          needed.exact
            ? `${plural(needed.steps, "step")} at ${factorLabel(uniform)} reach ${targetText} exactly.`
            : `To reach exactly ${targetText}, use ${plural(needed.steps, "step")} at ${factorLabel(exactFactor(overall, needed.steps))} each instead of ${factorLabel(uniform)}.`,
        );
      }
      summaryLines.push(
        above === 0
          ? `${uniform !== null ? "Or d" : "D"}ilute the stock once at ${factorLabel(c1Base / target.base)}.`
          : `${uniform !== null ? "Or, in Stepwise mode, keep" : "Keep"} ${above === 1 ? "T1 as it is" : `${tubeRange(above)} as they are`} and ${analysis.kind === "between" ? `make T${above + 1} the last tube, at` : "add a last step of"} ${factorLabel(concAt(above) / target.base)} from T${above}.`,
      );
    }
  }

  const sections: LabReportSection[] = [
    {
      title: "Given data",
      rows: [
        { label: "Initial stock concentration (C₁)", value: concIn(c1Base, c1Unit) },
        ...(args.stockAvailableMl !== null ? [{ label: "Stock volume available", value: vol(args.stockAvailableMl) }] : []),
        { label: "Number of steps", value: String(n) },
        uniform !== null
          ? { label: "Dilution factor per step", value: factorBoth(uniform) }
          : { label: "Dilution factors", value: args.factors.map((x) => factorLabel(x)).join(", ") },
        args.finalMls.every((v) => relClose(v, args.finalMls[0], 1e-12))
          ? { label: "Final volume in each tube", value: volIn(args.finalMls[0], args.finalUnit) }
          : { label: "Final volumes", value: args.finalMls.map((v) => vol(v)).join(", ") },
        { label: "Each tube keeps its full final volume", value: keepFull ? "Yes" : "No" },
        ...(target ? [{ label: "Desired final concentration", value: concIn(target.base, target.unit) }] : []),
      ],
    },
    {
      title: "Formula used",
      formulas: ["C₁V₁ = C₂V₂", "C_new = C_start × 1/X", "Volume taken = Final volume ÷ X;  Diluent = Final volume − Volume taken", "Overall factor = X₁ × X₂ × … × Xₙ"],
      lines: [
        CONVENTION_LINE,
        ...(keepFull
          ? ["Each tube is made up to its final volume plus the volume the next tube will take, worked out backwards from the last tube."]
          : []),
      ],
    },
    { title: "Complete calculation", formulas: chainCalculation(chain, c1Unit, keepFull, uniform) },
    {
      title: "Step table",
      table: chainTable(chain, c1Unit, keepFull),
      lines: keepFull
        ? ["\"Final volume (made up)\" is what you prepare in each tube; each is left with its intended final volume after the next transfer."]
        : undefined,
    },
    { title: "Step-by-step preparation", lines: chainInstructions(chain, c1Unit, keepFull, name) },
    {
      title: "Summary",
      rows: [
        { label: "Stock solution required", value: volBoth(chain.stockMl, args.finalUnit) },
        { label: "Total diluent", value: volBoth(chain.totalDiluentMl, args.finalUnit) },
        { label: "Overall dilution factor", value: `1:${formatSig(chain.overallFactor, 4)} (× ${formatSig(1 / chain.overallFactor, 3)})` },
        { label: "Final concentration", value: concBoth(chain.finalBase, c1Unit) },
        ...targetRows,
      ],
      lines: summaryLines.length ? summaryLines : undefined,
    },
  ];

  return {
    title: kind === "serial" ? "Serial Dilution" : "Stepwise Dilution",
    context: CONTEXT,
    sample: name || undefined,
    result: { label: "Final concentration", value: formatSig(finalShown.value, 4), unit: CONC_UNITS[finalShown.unit].label },
    warnings: warnings.length ? warnings : undefined,
    sections,
    notes: [
      "Use a fresh pipette tip for every transfer and mix each tube before taking from it — carry-over and poor mixing both compound down a series.",
      "Diluent: the solvent your method specifies (e.g. sterile water, normal saline, buffer or Mueller–Hinton broth).",
    ],
  };
}

/* ─── Single step: simple and reverse ────────────────────────────────────── */

function singleTable(csBase: number, unit: ConcUnit, stockMl: number, vMl: number, cdBase: number): NonNullable<LabReportSection["table"]> {
  const factor = csBase / cdBase;
  return {
    columns: ["Step", "Starting concentration", "Dilution factor", "Volume taken", "Diluent added", "Final volume", "New concentration"],
    rows: [["1", `${conc(csBase, unit)} (stock)`, factorBoth(factor), `${vol(stockMl)} of stock`, vol(vMl - stockMl), vol(vMl), conc(cdBase, unit)]],
  };
}

function singleInstructions(csBase: number, cdBase: number, unit: ConcUnit, stockMl: number, vMl: number, name: string): string[] {
  return [
    `1. Label a tube or volumetric flask${name ? ` for ${name}` : ""}.`,
    `2. Add ${vol(vMl - stockMl)} of diluent.`,
    `3. Mix the stock, then with a clean tip pipette ${vol(stockMl)} of the ${conc(csBase, unit)} stock into the diluent.`,
    `4. Mix by gently inverting 5 times or pipetting up and down. You now have ${vol(vMl)} at ${conc(cdBase, unit)}.`,
    `For quantitative work (e.g. an assay standard), pipette the stock into a ${vol(vMl)} volumetric flask and make up to the mark instead — mixed liquid volumes are not always exactly additive.`,
  ];
}

export type SimpleArgs = { c1Base: number; c1Unit: ConcUnit; c2Base: number; c2Unit: ConcUnit; vMl: number; vUnit: VolumeUnit };

export function buildSimpleReport(args: SimpleArgs, name: string): LabReportData {
  const { c1Base, c1Unit, c2Base, c2Unit, vMl, vUnit } = args;
  const stockMl = (c2Base * vMl) / c1Base;
  const diluentMl = vMl - stockMl;
  const factor = c1Base / c2Base;
  const stockShown = practicalVolume(stockMl);
  const converted = c2Unit !== c1Unit;

  const warnings = volumeWarnings([{ label: "Stock volume", ml: stockMl }], [vMl]);

  return {
    title: "Simple Dilution",
    context: CONTEXT,
    sample: name || undefined,
    result: { label: "Stock volume required", value: sig3(stockShown.value), unit: stockShown.unit },
    warnings: warnings.length ? warnings : undefined,
    sections: [
      {
        title: "Given data",
        rows: [
          { label: "Stock concentration (C₁)", value: concIn(c1Base, c1Unit) },
          { label: "Desired concentration (C₂)", value: concIn(c2Base, c2Unit) },
          { label: "Final volume (V₂)", value: volIn(vMl, vUnit) },
        ],
      },
      {
        title: "Formula used",
        formulas: ["C₁V₁ = C₂V₂", "V₁ = C₂ × V₂ ÷ C₁", "Diluent = V₂ − V₁", "Dilution factor X = C₁ ÷ C₂;  C₂ = C₁ × 1/X"],
        lines: [CONVENTION_LINE],
      },
      {
        title: "Complete calculation",
        formulas: [
          ...(converted ? [`C₂ = ${concIn(c2Base, c2Unit)} = ${concIn(c2Base, c1Unit)}`] : []),
          ...(vUnit !== "mL" ? [`V₂ = ${volIn(vMl, vUnit)} = ${sig3(vMl)} mL`] : []),
          `V₁ = ${concIn(c2Base, c1Unit)} × ${sig3(vMl)} mL ÷ ${concIn(c1Base, c1Unit)} = ${sig3(stockMl)} mL = ${vol(stockMl)}`,
          `Diluent = ${sig3(vMl)} mL − ${sig3(stockMl)} mL = ${vol(diluentMl)}`,
          `X = ${formatSig(fromBase(c1Base, c1Unit), 4)} ÷ ${formatSig(fromBase(c2Base, c1Unit), 4)} = ${formatSig(factor, 4)} → ${factorBoth(factor)}`,
        ],
      },
      { title: "Step table", table: singleTable(c1Base, c1Unit, stockMl, vMl, c2Base) },
      { title: "Step-by-step preparation", lines: singleInstructions(c1Base, c2Base, c1Unit, stockMl, vMl, name) },
      {
        title: "Summary",
        rows: [
          { label: "Stock solution required", value: volBoth(stockMl, vUnit) },
          { label: "Total diluent", value: volBoth(diluentMl, vUnit) },
          { label: "Overall dilution factor", value: factorBoth(factor) },
          { label: "Final concentration", value: concBoth(c2Base, c1Unit) },
        ],
      },
    ],
    notes: [
      "C₁ and C₂ must be in the same kind of unit (both mass/volume or both molar); the calculator converts within a family.",
      "Diluent: the solvent your method specifies (e.g. sterile water, normal saline or buffer).",
    ],
  };
}

/* ─── Reverse ────────────────────────────────────────────────────────────── */

export type ReverseArgs = {
  csBase: number;
  csUnit: ConcUnit;
  cdBase: number;
  cdUnit: ConcUnit;
  vMl: number;
  vUnit: VolumeUnit;
  minMl: number | null;
};

export type ReversePlan = {
  stockMl: number;
  overall: number;
  /** Stock volume is below the stated minimum pipettable volume. */
  needsSplit: boolean;
  /** Equal steps in the suggested plan (≥ 2), or null when no plan is possible. */
  steps: number | null;
  exactX: number | null;
  /** Convenient factors that multiply to exactly the overall factor, if any differ from exactX. */
  convenient: number[] | null;
};

export function reversePlan(args: ReverseArgs): ReversePlan {
  const stockMl = (args.cdBase * args.vMl) / args.csBase;
  const overall = args.csBase / args.cdBase;
  const needsSplit = args.minMl !== null && stockMl < args.minMl * (1 - 1e-9);
  if (!needsSplit || args.minMl === null) return { stockMl, overall, needsSplit, steps: null, exactX: null, convenient: null };

  const steps = minimumSteps(overall, args.vMl, args.minMl);
  if (steps === null || steps < 2) return { stockMl, overall, needsSplit, steps: null, exactX: null, convenient: null };
  const exactX = exactFactor(overall, steps);
  let convenient = convenientPlan(overall, args.vMl, args.minMl, steps);
  if (convenient && convenient.length === steps && convenient.every((x) => relClose(x, exactX, 1e-9))) convenient = null;
  return { stockMl, overall, needsSplit, steps, exactX, convenient };
}

export function buildReverseReport(args: ReverseArgs, name: string): LabReportData {
  const { csBase, csUnit, cdBase, cdUnit, vMl, vUnit, minMl } = args;
  const plan = reversePlan(args);
  const { stockMl, overall } = plan;
  const diluentMl = vMl - stockMl;
  const stockShown = practicalVolume(stockMl);

  const chain =
    plan.steps !== null && plan.exactX !== null
      ? computeChain(csBase, new Array(plan.steps).fill(0).map(() => ({ factor: plan.exactX as number, finalMl: vMl })), false)
      : null;
  const convenientChain = plan.convenient
    ? computeChain(csBase, plan.convenient.map((factor) => ({ factor, finalMl: vMl })), false)
    : null;

  const warnings: string[] = [];
  if (plan.needsSplit && minMl !== null) {
    warnings.push(
      chain
        ? `The single-step stock volume (${vol(stockMl)}) is below your minimum pipettable volume (${vol(minMl)}). Use the ${plan.steps}-step plan below.`
        : `The single-step stock volume (${vol(stockMl)}) is below your minimum pipettable volume (${vol(minMl)}), and no plan of 20 steps or fewer fixes it. Increase the final volume or prepare an intermediate stock.`,
    );
  } else if (stockMl < TINY_ML) {
    warnings.push(`${TINY_WARNING} — the stock volume is ${vol(stockMl)}. Enter the minimum volume you can pipette to get a multi-step plan.`);
  }
  if (chain) {
    warnings.push(...volumeWarnings(chain.tubes.map((t) => ({ label: `T${t.number} volume taken`, ml: t.transferMl })), []));
  }
  if (vMl > HUGE_ML) warnings.push(HUGE_WARNING);

  const sections: LabReportSection[] = [
    {
      title: "Given data",
      rows: [
        { label: "Stock concentration", value: concIn(csBase, csUnit) },
        { label: "Desired concentration", value: concIn(cdBase, cdUnit) },
        { label: "Desired final volume", value: volIn(vMl, vUnit) },
        { label: "Minimum volume you can pipette accurately", value: minMl !== null ? vol(minMl) : "Not given" },
      ],
    },
    {
      title: "Formula used",
      formulas: [
        "C₁V₁ = C₂V₂",
        "V_stock = C_desired × V_final ÷ C_stock;  Diluent = V_final − V_stock",
        "Overall factor F = C_stock ÷ C_desired  (1:F)",
        ...(chain ? ["Largest factor per step = V_final ÷ V_min", "n = ⌈log F ÷ log(V_final ÷ V_min)⌉;  X = F^(1/n)", "Overall factor = X₁ × X₂ × … × Xₙ"] : []),
      ],
      lines: [CONVENTION_LINE],
    },
    {
      title: "Complete calculation",
      formulas: [
        ...(cdUnit !== csUnit ? [`C_desired = ${concIn(cdBase, cdUnit)} = ${concIn(cdBase, csUnit)}`] : []),
        `V_stock = ${concIn(cdBase, csUnit)} × ${sig3(vMl)} mL ÷ ${concIn(csBase, csUnit)} = ${sig3(stockMl)} mL = ${vol(stockMl)}`,
        `Diluent = ${sig3(vMl)} mL − ${sig3(stockMl)} mL = ${vol(diluentMl)}`,
        `F = ${formatSig(fromBase(csBase, csUnit), 4)} ÷ ${formatSig(fromBase(cdBase, csUnit), 4)} = ${formatSig(overall, 4)}`,
        ...(chain && minMl !== null && plan.exactX !== null
          ? [
              `Largest factor per step = ${vol(vMl)} ÷ ${vol(minMl)} = ${formatSig(vMl / minMl, 4)}`,
              `n = ⌈log ${formatSig(overall, 4)} ÷ log ${formatSig(vMl / minMl, 4)}⌉ = ⌈${formatSig(Math.log(overall) / Math.log(vMl / minMl), 4)}⌉ = ${plan.steps}`,
              `X = ${formatSig(overall, 4)}^(1/${plan.steps}) = ${formatSig(plan.exactX, 5)};  volume taken per step = ${vol(vMl)} ÷ ${formatSig(plan.exactX, 5)} = ${vol(vMl / plan.exactX)}`,
              ...chainCalculation(chain, csUnit, false, plan.exactX).filter((line) => !line.startsWith("Stock required") && !line.startsWith("Total diluent")),
            ]
          : []),
      ],
    },
    chain
      ? {
          title: "Step table",
          table: chainTable(chain, csUnit, false),
          lines: [
            `Suggested ${plan.steps}-step plan with an exact factor of ${factorLabel(plan.exactX as number)} per step. Intermediate tubes can be made smaller, provided each still holds more than the next transfer.`,
          ],
        }
      : { title: "Step table", table: singleTable(csBase, csUnit, stockMl, vMl, cdBase) },
    {
      title: "Step-by-step preparation",
      lines: chain ? chainInstructions(chain, csUnit, false, name) : singleInstructions(csBase, cdBase, csUnit, stockMl, vMl, name),
    },
    {
      title: "Summary",
      rows: [
        { label: chain ? "Stock required (single step)" : "Stock solution required", value: volBoth(stockMl, vUnit) },
        ...(chain ? [{ label: `Stock required (${plan.steps}-step plan)`, value: vol(chain.stockMl) }] : []),
        { label: chain ? "Total diluent (plan)" : "Total diluent", value: volBoth(chain ? chain.totalDiluentMl : diluentMl, vUnit) },
        { label: "Overall dilution factor", value: factorBoth(overall) },
        { label: "Final concentration", value: concBoth(chain ? chain.finalBase : cdBase, csUnit) },
      ],
    },
  ];

  if (convenientChain && plan.convenient) {
    sections.push({
      title: "Convenient alternative (exact)",
      table: chainTable(convenientChain, csUnit, false),
      lines: [
        `${plan.convenient.map((x) => factorLabel(x)).join(" then ")} multiplies to exactly 1:${formatSig(overall, 4)}, so it reaches ${conc(cdBase, cdUnit)} with no rounding, and every transfer is at least ${minMl !== null ? vol(minMl) : "the minimum"}.`,
      ],
    });
  }

  return {
    title: "Reverse Dilution",
    context: CONTEXT,
    sample: name || undefined,
    result: { label: chain ? "Stock volume required (single step)" : "Stock volume required", value: sig3(stockShown.value), unit: stockShown.unit },
    warnings: warnings.length ? warnings : undefined,
    sections,
    notes: [
      "Use a fresh pipette tip for every transfer and mix each tube before taking from it.",
      "Plans are suggestions: nothing you entered has been changed or rounded.",
    ],
  };
}
