"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import { Beaker, BookmarkPlus, FolderOpen, ListOrdered, Pipette, Plus, TestTubes, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CalculatorShell,
  CalcSection,
  FieldGrid,
  NumberField,
  FormulaNote,
  Formula,
  CalcAbout,
  CalcList,
  CalcFaq,
  AdSlot,
  LabReport,
  LabActions,
  ModeSwitch,
  TextField,
  LabNotice,
  type LabReportData,
  type VolumeUnit,
  toNumber,
  fieldError,
  formatSig,
  VOLUME_TO_ML,
} from "@/components/calculators";
import {
  CONC_UNITS,
  CONC_UNIT_LIST,
  computeChain,
  isConcUnit,
  relClose,
  sameFamily,
  toBase,
  type Chain,
  type ConcUnit,
} from "./_dilution";
import {
  buildChainReport,
  buildReverseReport,
  buildSimpleReport,
  conc,
  factorLabel,
  reversePlan,
  vol,
  type ChainArgs,
  type ReverseArgs,
  type SimpleArgs,
} from "./_report";

// ─── TYPES & DEFAULTS ────────────────────────────────────────────────────────

type Mode = "simple" | "serial" | "stepwise" | "reverse";

const MODE_LABELS: Record<Mode, string> = {
  simple: "Simple dilution",
  serial: "Serial dilution",
  stepwise: "Stepwise dilution",
  reverse: "Reverse calculation",
};

type StepRow = { id: number; factor: string; vol: string; unit: VolumeUnit };

type Inputs = {
  name: string;
  simple: { c1: string; c1Unit: ConcUnit; c2: string; c2Unit: ConcUnit; v: string; vUnit: VolumeUnit };
  serial: {
    c1: string; c1Unit: ConcUnit; stock: string; stockUnit: VolumeUnit; steps: string; factor: string;
    v: string; vUnit: VolumeUnit; target: string; targetUnit: ConcUnit; keepFull: boolean;
  };
  stepwise: {
    c1: string; c1Unit: ConcUnit; stock: string; stockUnit: VolumeUnit; rows: StepRow[];
    target: string; targetUnit: ConcUnit; keepFull: boolean;
  };
  reverse: { cs: string; csUnit: ConcUnit; cd: string; cdUnit: ConcUnit; v: string; vUnit: VolumeUnit; min: string; minUnit: VolumeUnit };
};

const VOLUME_UNITS: VolumeUnit[] = ["µL", "mL", "L"];
const CONC_OPTIONS = CONC_UNIT_LIST.map((unit) => ({ value: unit, label: CONC_UNITS[unit].label }));
const MAX_STEPS = 20;
const MAX_ROWS = 12;

let nextId = 100;
const newId = () => ++nextId;
const blankRow = (): StepRow => ({ id: newId(), factor: "", vol: "", unit: "mL" });

function defaultInputs(): Inputs {
  return {
    name: "",
    simple: { c1: "", c1Unit: "mg/mL", c2: "", c2Unit: "mg/mL", v: "", vUnit: "mL" },
    serial: {
      c1: "", c1Unit: "mg/mL", stock: "", stockUnit: "mL", steps: "", factor: "", v: "", vUnit: "mL",
      target: "", targetUnit: "mg/mL", keepFull: false,
    },
    stepwise: { c1: "", c1Unit: "mg/mL", stock: "", stockUnit: "mL", rows: [blankRow(), blankRow()], target: "", targetUnit: "mg/mL", keepFull: false },
    reverse: { cs: "", csUnit: "M", cd: "", cdUnit: "mM", v: "", vUnit: "mL", min: "", minUnit: "µL" },
  };
}

const isVolumeUnit = (value: unknown): value is VolumeUnit =>
  typeof value === "string" && Object.prototype.hasOwnProperty.call(VOLUME_TO_ML, value);

// ─── EXAMPLES ────────────────────────────────────────────────────────────────

const EXAMPLES: { label: string; mode: Mode; apply: (prev: Inputs) => Inputs }[] = [
  {
    label: "Amoxicillin 10 mg/mL → 1:10 × 5 steps, 10 mL each",
    mode: "serial",
    apply: (prev) => ({
      ...prev,
      name: "Amoxicillin stock 10 mg/mL",
      serial: { ...defaultInputs().serial, c1: "10", c1Unit: "mg/mL", steps: "5", factor: "10", v: "10", vUnit: "mL" },
    }),
  },
  {
    label: "Standard curve: 100 µg/mL stock, 1:2 × 6",
    mode: "serial",
    apply: (prev) => ({
      ...prev,
      name: "Standard curve for paracetamol assay 100 µg/mL",
      serial: { ...defaultInputs().serial, c1: "100", c1Unit: "µg/mL", steps: "6", factor: "2", v: "5", vUnit: "mL", keepFull: true },
    }),
  },
  {
    label: "Simple: 40 mg/mL gentamicin → 2 mg/mL, 10 mL",
    mode: "simple",
    apply: (prev) => ({
      ...prev,
      name: "Gentamicin 40 mg/mL for MIC plate",
      simple: { c1: "40", c1Unit: "mg/mL", c2: "2", c2Unit: "mg/mL", v: "10", vUnit: "mL" },
    }),
  },
  {
    label: "Reverse: 1 M NaCl → 50 µM in 100 mL, min 10 µL",
    mode: "reverse",
    apply: (prev) => ({
      ...prev,
      name: "Sodium chloride 1 M stock",
      reverse: { cs: "1", csUnit: "M", cd: "50", cdUnit: "µM", v: "100", vUnit: "mL", min: "10", minUnit: "µL" },
    }),
  },
];

// ─── VALIDATION ──────────────────────────────────────────────────────────────

const INCOMPATIBLE = "Incompatible units: mass-based and molar concentrations can't be converted without the molecular weight.";

const isBlank = (raw: string) => raw.trim() === "";
const noErrors = (errors: Record<string, string | undefined>) => Object.values(errors).every((e) => !e);

/** X in 1:X must be a real dilution: greater than 1. */
function factorError(raw: string, show: boolean): string | undefined {
  const base = fieldError(raw, { show });
  if (base) return base;
  const x = toNumber(raw);
  if (x === null) return undefined;
  if (x === 1) return "1:1 is no dilution — enter a fold greater than 1 (e.g. 10 for 1:10).";
  if (x < 1) return "Below 1 would concentrate, not dilute. Enter X of 1:X, e.g. 10.";
  return undefined;
}

function stepsError(raw: string, show: boolean): string | undefined {
  const base = fieldError(raw, { show, max: MAX_STEPS });
  if (base) return base;
  const n = toNumber(raw);
  if (n !== null && !Number.isInteger(n)) return `Enter a whole number of steps (1–${MAX_STEPS}).`;
  return undefined;
}

/** A target or desired concentration must sit below the stock. */
function belowStockError(targetBase: number, stockBase: number): string | undefined {
  if (relClose(targetBase, stockBase, 1e-9)) return "Equal to the stock — this is no dilution.";
  if (targetBase > stockBase) return "Cannot dilute to a higher concentration than the stock.";
  return undefined;
}

function factorHint(raw: string): string {
  const x = toNumber(raw);
  if (x !== null && x > 1) return `${factorLabel(x)} — each step is × ${formatSig(1 / x, 3)} (C_new = C × 1/${formatSig(x, 4)}).`;
  return "Enter X of 1:X — e.g. 10 for 1:10 (× 0.1).";
}

function evalSimple(s: Inputs["simple"], show: boolean) {
  const errors: Record<"c1" | "c2" | "v", string | undefined> = {
    c1: fieldError(s.c1, { show }),
    c2: fieldError(s.c2, { show }),
    v: fieldError(s.v, { show }),
  };
  const incompatible = !sameFamily(s.c1Unit, s.c2Unit);
  const c1 = toNumber(s.c1);
  const c2 = toNumber(s.c2);
  const v = toNumber(s.v);
  if (!incompatible && c1 !== null && c2 !== null && !errors.c1 && !errors.c2) {
    errors.c2 = belowStockError(toBase(c2, s.c2Unit), toBase(c1, s.c1Unit));
  }
  const result: SimpleArgs | null =
    !incompatible && c1 !== null && c2 !== null && v !== null && noErrors(errors)
      ? { c1Base: toBase(c1, s.c1Unit), c1Unit: s.c1Unit, c2Base: toBase(c2, s.c2Unit), c2Unit: s.c2Unit, vMl: v * VOLUME_TO_ML[s.vUnit], vUnit: s.vUnit }
      : null;
  return { errors, incompatible, result };
}

function evalSerial(s: Inputs["serial"], show: boolean) {
  const errors: Record<"c1" | "stock" | "steps" | "factor" | "v" | "target", string | undefined> = {
    c1: fieldError(s.c1, { show }),
    stock: fieldError(s.stock, { show, required: false }),
    steps: stepsError(s.steps, show),
    factor: factorError(s.factor, show),
    v: fieldError(s.v, { show }),
    target: fieldError(s.target, { show, required: false }),
  };
  const incompatible = !isBlank(s.target) && !sameFamily(s.c1Unit, s.targetUnit);
  const c1 = toNumber(s.c1);
  const steps = toNumber(s.steps);
  const factor = toNumber(s.factor);
  const v = toNumber(s.v);
  const target = toNumber(s.target);
  const stock = toNumber(s.stock);
  if (!incompatible && c1 !== null && target !== null && !errors.c1 && !errors.target) {
    errors.target = belowStockError(toBase(target, s.targetUnit), toBase(c1, s.c1Unit));
  }
  const result: ChainArgs | null =
    !incompatible && c1 !== null && steps !== null && factor !== null && v !== null && noErrors(errors)
      ? {
          kind: "serial",
          c1Base: toBase(c1, s.c1Unit),
          c1Unit: s.c1Unit,
          factors: new Array(steps).fill(factor),
          finalMls: new Array(steps).fill(v * VOLUME_TO_ML[s.vUnit]),
          finalUnit: s.vUnit,
          keepFull: s.keepFull,
          stockAvailableMl: stock !== null ? stock * VOLUME_TO_ML[s.stockUnit] : null,
          target: target !== null ? { base: toBase(target, s.targetUnit), unit: s.targetUnit } : null,
        }
      : null;
  return { errors, incompatible, result };
}

function evalStepwise(s: Inputs["stepwise"], show: boolean) {
  const errors: Record<"c1" | "stock" | "target", string | undefined> = {
    c1: fieldError(s.c1, { show }),
    stock: fieldError(s.stock, { show, required: false }),
    target: fieldError(s.target, { show, required: false }),
  };
  const rowErrors = s.rows.map((row) => ({ factor: factorError(row.factor, show), vol: fieldError(row.vol, { show }) }));
  const incompatible = !isBlank(s.target) && !sameFamily(s.c1Unit, s.targetUnit);
  const c1 = toNumber(s.c1);
  const target = toNumber(s.target);
  const stock = toNumber(s.stock);
  if (!incompatible && c1 !== null && target !== null && !errors.c1 && !errors.target) {
    errors.target = belowStockError(toBase(target, s.targetUnit), toBase(c1, s.c1Unit));
  }

  const factors = s.rows.map((row) => toNumber(row.factor));
  const volumes = s.rows.map((row, i) => {
    const value = toNumber(row.vol);
    return value === null ? null : value * VOLUME_TO_ML[s.rows[i].unit];
  });
  const rowsReady =
    rowErrors.every((e) => !e.factor && !e.vol) && factors.every((x) => x !== null) && volumes.every((v) => v !== null);

  if (rowsReady && !s.keepFull) {
    // Without "keep full volume", a tube can be asked for more than it holds.
    const chain = computeChain(1, factors.map((factor, i) => ({ factor: factor as number, finalMl: volumes[i] as number })), false);
    chain.shortfalls.forEach((short) => {
      rowErrors[short.tube - 1].vol = `T${short.tube} holds ${vol(short.hasMl)}, but T${short.tube + 1} takes ${vol(short.needMl)} from it. Increase this volume, reduce T${short.tube + 1}'s volume, or turn on "keep full volume".`;
    });
  }

  const result: ChainArgs | null =
    !incompatible && c1 !== null && rowsReady && noErrors(errors) && rowErrors.every((e) => !e.factor && !e.vol)
      ? {
          kind: "stepwise",
          c1Base: toBase(c1, s.c1Unit),
          c1Unit: s.c1Unit,
          factors: factors as number[],
          finalMls: volumes as number[],
          finalUnit: "mL",
          keepFull: s.keepFull,
          stockAvailableMl: stock !== null ? stock * VOLUME_TO_ML[s.stockUnit] : null,
          target: target !== null ? { base: toBase(target, s.targetUnit), unit: s.targetUnit } : null,
        }
      : null;
  return { errors, rowErrors, incompatible, result };
}

function evalReverse(s: Inputs["reverse"], show: boolean) {
  const errors: Record<"cs" | "cd" | "v" | "min", string | undefined> = {
    cs: fieldError(s.cs, { show }),
    cd: fieldError(s.cd, { show }),
    v: fieldError(s.v, { show }),
    min: fieldError(s.min, { show, required: false }),
  };
  const incompatible = !sameFamily(s.csUnit, s.cdUnit);
  const cs = toNumber(s.cs);
  const cd = toNumber(s.cd);
  const v = toNumber(s.v);
  const min = toNumber(s.min);
  if (!incompatible && cs !== null && cd !== null && !errors.cs && !errors.cd) {
    errors.cd = belowStockError(toBase(cd, s.cdUnit), toBase(cs, s.csUnit));
  }
  if (v !== null && min !== null && !errors.v && !errors.min && min * VOLUME_TO_ML[s.minUnit] >= v * VOLUME_TO_ML[s.vUnit]) {
    errors.min = "Must be smaller than the desired final volume.";
  }
  const result: ReverseArgs | null =
    !incompatible && cs !== null && cd !== null && v !== null && noErrors(errors)
      ? {
          csBase: toBase(cs, s.csUnit),
          csUnit: s.csUnit,
          cdBase: toBase(cd, s.cdUnit),
          cdUnit: s.cdUnit,
          vMl: v * VOLUME_TO_ML[s.vUnit],
          vUnit: s.vUnit,
          minMl: min !== null ? min * VOLUME_TO_ML[s.minUnit] : null,
        }
      : null;
  return { errors, incompatible, result };
}

// ─── SAVED CALCULATIONS (localStorage) ───────────────────────────────────────

const STORAGE_KEY = "pw-serial-dilution-saved";
const MAX_SAVED = 20;

type SavedCalc = { id: string; name: string; mode: Mode; timestamp: number; inputs: Inputs };

function isSavedCalc(value: unknown): value is SavedCalc {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.timestamp === "number" &&
    typeof item.mode === "string" &&
    Object.prototype.hasOwnProperty.call(MODE_LABELS, item.mode) &&
    !!item.inputs &&
    typeof item.inputs === "object"
  );
}

/** null means storage itself is unavailable (private mode, blocked site data). */
function readSaved(): SavedCalc[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isSavedCalc).slice(0, MAX_SAVED) : [];
  } catch {
    return null;
  }
}

function writeSaved(list: SavedCalc[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies only keys the current form knows, of the right type, with units that
 * still exist — so an old or hand-edited save can never put the form into a
 * state the validation does not expect.
 */
function mergeFlat<T extends object>(defaults: T, raw: unknown): T {
  const out = { ...defaults } as Record<string, unknown>;
  if (!raw || typeof raw !== "object") return out as T;
  const source = raw as Record<string, unknown>;
  Object.keys(out).forEach((key) => {
    const fallback = out[key];
    const value = source[key];
    if (Array.isArray(fallback) || typeof value !== typeof fallback) return;
    if (isConcUnit(fallback) && !isConcUnit(value)) return;
    if (isVolumeUnit(fallback) && !isVolumeUnit(value)) return;
    out[key] = typeof value === "string" ? value.slice(0, 120) : value;
  });
  return out as T;
}

function restoreInputs(raw: unknown): Inputs {
  const defaults = defaultInputs();
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const stepwise = mergeFlat(defaults.stepwise, source.stepwise);
  const rawRows = source.stepwise && typeof source.stepwise === "object" ? (source.stepwise as Record<string, unknown>).rows : null;
  const rows = Array.isArray(rawRows)
    ? rawRows.slice(0, MAX_ROWS).map((row) => ({ ...mergeFlat(blankRow(), row), id: newId() }))
    : [];
  return {
    name: typeof source.name === "string" ? source.name.slice(0, 120) : "",
    simple: mergeFlat(defaults.simple, source.simple),
    serial: mergeFlat(defaults.serial, source.serial),
    stepwise: { ...stepwise, rows: rows.length ? rows : defaults.stepwise.rows },
    reverse: mergeFlat(defaults.reverse, source.reverse),
  };
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function SerialDilutionCalculator() {
  const [mode, setMode] = useState<Mode>("serial");
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState<SavedCalc[]>([]);
  const [saveStatus, setSaveStatus] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  // Read storage after mount: the server has no localStorage, and reading it
  // during render would make the first client render differ from the HTML.
  useEffect(() => {
    const list = readSaved();
    if (list) setSaved(list);
  }, []);

  const setSimple = (p: Partial<Inputs["simple"]>) => setInputs((prev) => ({ ...prev, simple: { ...prev.simple, ...p } }));
  const setSerial = (p: Partial<Inputs["serial"]>) => setInputs((prev) => ({ ...prev, serial: { ...prev.serial, ...p } }));
  const setStepwise = (p: Partial<Inputs["stepwise"]>) => setInputs((prev) => ({ ...prev, stepwise: { ...prev.stepwise, ...p } }));
  const setReverse = (p: Partial<Inputs["reverse"]>) => setInputs((prev) => ({ ...prev, reverse: { ...prev.reverse, ...p } }));
  const updateRow = (id: number, p: Partial<StepRow>) =>
    setInputs((prev) => ({
      ...prev,
      stepwise: { ...prev.stepwise, rows: prev.stepwise.rows.map((row) => (row.id === id ? { ...row, ...p } : row)) },
    }));

  // Strict evaluation (every required field demanded) decides whether there is
  // a result; the shown one only nags about empty fields after Calculate.
  const simpleStrict = useMemo(() => evalSimple(inputs.simple, true), [inputs.simple]);
  const serialStrict = useMemo(() => evalSerial(inputs.serial, true), [inputs.serial]);
  const stepwiseStrict = useMemo(() => evalStepwise(inputs.stepwise, true), [inputs.stepwise]);
  const reverseStrict = useMemo(() => evalReverse(inputs.reverse, true), [inputs.reverse]);
  const simple = submitted ? simpleStrict : evalSimple(inputs.simple, false);
  const serial = submitted ? serialStrict : evalSerial(inputs.serial, false);
  const stepwise = submitted ? stepwiseStrict : evalStepwise(inputs.stepwise, false);
  const reverse = submitted ? reverseStrict : evalReverse(inputs.reverse, false);

  const name = inputs.name.trim();

  const report: LabReportData | null = useMemo(() => {
    if (mode === "simple") return simpleStrict.result ? buildSimpleReport(simpleStrict.result, name) : null;
    if (mode === "serial") return serialStrict.result ? buildChainReport(serialStrict.result, name) : null;
    if (mode === "stepwise") return stepwiseStrict.result ? buildChainReport(stepwiseStrict.result, name) : null;
    return reverseStrict.result ? buildReverseReport(reverseStrict.result, name) : null;
  }, [mode, name, simpleStrict, serialStrict, stepwiseStrict, reverseStrict]);

  const plan = useMemo(() => (reverseStrict.result ? reversePlan(reverseStrict.result) : null), [reverseStrict]);

  // The tube strip above the card — the series at a glance.
  const strip = useMemo((): { chain: Chain; unit: ConcUnit } | null => {
    const args = mode === "serial" ? serialStrict.result : mode === "stepwise" ? stepwiseStrict.result : null;
    if (args) {
      const chain = computeChain(args.c1Base, args.factors.map((factor, i) => ({ factor, finalMl: args.finalMls[i] })), args.keepFull);
      return { chain, unit: args.c1Unit };
    }
    if (mode === "reverse" && reverseStrict.result && plan && plan.steps !== null && plan.exactX !== null) {
      const x = plan.exactX;
      const r = reverseStrict.result;
      return { chain: computeChain(r.csBase, new Array(plan.steps).fill(0).map(() => ({ factor: x, finalMl: r.vMl })), false), unit: r.csUnit };
    }
    return null;
  }, [mode, serialStrict, stepwiseStrict, reverseStrict, plan]);

  const scrollToReport = () =>
    window.requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));

  const calculate = () => {
    setSubmitted(true);
    scrollToReport();
  };

  const reset = () => {
    setSubmitted(false);
    setInputs(defaultInputs());
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setSubmitted(false);
  };

  const flashSave = (message: string) => {
    setSaveStatus(message);
    window.setTimeout(() => setSaveStatus(""), 2600);
  };

  const save = () => {
    const current = readSaved();
    if (current === null) return flashSave("Saving isn't available in this browser.");
    const item: SavedCalc = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: name || (report ? `${MODE_LABELS[mode]}: ${report.result.value} ${report.result.unit ?? ""}`.trim() : MODE_LABELS[mode]),
      mode,
      timestamp: Date.now(),
      inputs,
    };
    const next = [item, ...current].slice(0, MAX_SAVED);
    if (!writeSaved(next)) return flashSave("Saving isn't available in this browser.");
    setSaved(next);
    flashSave("Calculation saved on this device.");
  };

  const load = (item: SavedCalc) => {
    setInputs(restoreInputs(item.inputs));
    setMode(item.mode);
    setSubmitted(true);
    scrollToReport();
  };

  const remove = (id: string) => {
    const next = saved.filter((item) => item.id !== id);
    if (!writeSaved(next)) return flashSave("Saving isn't available in this browser.");
    setSaved(next);
  };

  const openInStepwise = (factors: number[]) => {
    setInputs((prev) => ({
      ...prev,
      stepwise: {
        c1: prev.reverse.cs,
        c1Unit: prev.reverse.csUnit,
        stock: "",
        stockUnit: "mL",
        // Six significant figures, visibly — the stepwise card then shows the factor used.
        rows: factors.map((x) => ({ id: newId(), factor: String(Number(x.toPrecision(6))), vol: prev.reverse.v, unit: prev.reverse.vUnit })),
        target: prev.reverse.cd,
        targetUnit: prev.reverse.cdUnit,
        keepFull: false,
      },
    }));
    switchMode("stepwise");
  };

  const s = inputs;

  return (
    <CalculatorShell
      title="Serial Dilution Calculator"
      subtitle="Plan simple, serial and stepwise dilutions of a drug stock — volumes to pipette, diluent, every tube's concentration and a printable lab record."
      icon={TestTubes}
      eyebrow="Pharmaceutics · Microbiology"
      aside={
        <>
          <CalcAbout title="About serial dilution">
            <p>
              A <strong>serial dilution</strong> makes a large dilution as a chain of small, equal ones: each tube
              takes a fixed volume from the tube before it. Ten-fold steps turn a 10 mg/mL amoxicillin stock into
              0.1 µg/mL in five tubes, without ever pipetting a volume too small to measure.
            </p>
            <CalcList
              title="Single step or serial?"
              items={[
                "Single step (C₁V₁ = C₂V₂) when the stock volume is comfortably pipettable — usually 10 µL or more",
                "Serial when the overall dilution is large (1:1,000 and beyond) or you need every intermediate concentration",
                "MIC plates, bacterial counts (CFU) and standard curves for assays all use serial dilutions",
              ]}
            />
            <CalcList
              tone="caution"
              title="Errors compound down a series"
              items={[
                "A 1 % pipetting error in each of 6 steps can put the last tube about 6 % off — calibrate and use the right pipette",
                "Use a fresh tip for every transfer: a drop carried over from a concentrated tube skews every tube after it",
                "Mix each tube thoroughly before taking from it — an unmixed tube gives a wrong transfer, not just a wrong tube",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ModeSwitch
        label="Calculation mode"
        value={mode}
        onChange={switchMode}
        options={[
          { value: "simple", label: "Simple dilution", description: "C₁V₁ = C₂V₂", icon: Beaker },
          { value: "serial", label: "Serial dilution", description: "The same 1:X each step", icon: TestTubes },
          { value: "stepwise", label: "Stepwise dilution", description: "A factor per step", icon: ListOrdered },
          { value: "reverse", label: "Reverse calculation", description: "Stock needed for a target", icon: Pipette },
        ]}
      />

      <CalcSection title="Preparation" className="rounded-[20px]">
        <TextField
          label="Preparation name / drug (optional)"
          value={s.name}
          onChange={(value) => setInputs((prev) => ({ ...prev, name: value }))}
          placeholder="e.g. Gentamicin 40 mg/mL for MIC plate"
          hint="Printed on the lab result card and used to name a saved calculation."
        />
        <Examples
          items={EXAMPLES.map((example) => ({
            label: example.label,
            active: example.mode === mode,
            apply: () => {
              setInputs((prev) => example.apply(prev));
              switchMode(example.mode);
            },
          }))}
        />
      </CalcSection>

      {mode !== "simple" && mode !== "reverse" && <ConventionCard />}

      {mode === "simple" && (
        <CalcSection title="Simple dilution" description="One step from stock to the concentration you need." className="rounded-[20px]">
          <FieldGrid>
            <NumberField
              label="Stock concentration (C₁)"
              value={s.simple.c1}
              onChange={(v) => setSimple({ c1: v })}
              units={CONC_OPTIONS}
              unit={s.simple.c1Unit}
              onUnitChange={(u) => setSimple({ c1Unit: u as ConcUnit })}
              min={0}
              placeholder="e.g. 40"
              error={simple.errors.c1}
            />
            <NumberField
              label="Desired concentration (C₂)"
              value={s.simple.c2}
              onChange={(v) => setSimple({ c2: v })}
              units={CONC_OPTIONS}
              unit={s.simple.c2Unit}
              onUnitChange={(u) => setSimple({ c2Unit: u as ConcUnit })}
              min={0}
              placeholder="e.g. 2"
              error={simple.errors.c2}
            />
            <NumberField
              label="Final volume (V₂)"
              value={s.simple.v}
              onChange={(v) => setSimple({ v })}
              units={VOLUME_UNITS}
              unit={s.simple.vUnit}
              onUnitChange={(u) => setSimple({ vUnit: u as VolumeUnit })}
              min={0}
              placeholder="e.g. 10"
              error={simple.errors.v}
            />
          </FieldGrid>
          {simple.incompatible && <LabNotice tone="warning">{INCOMPATIBLE}</LabNotice>}
        </CalcSection>
      )}

      {mode === "serial" && (
        <CalcSection title="Serial dilution" description="The same dilution factor in every tube." className="rounded-[20px]">
          <FieldGrid>
            <NumberField
              label="Initial stock concentration (C₁)"
              value={s.serial.c1}
              onChange={(v) => setSerial({ c1: v })}
              units={CONC_OPTIONS}
              unit={s.serial.c1Unit}
              onUnitChange={(u) => setSerial({ c1Unit: u as ConcUnit })}
              min={0}
              placeholder="e.g. 10"
              error={serial.errors.c1}
            />
            <NumberField
              label="Stock volume available (optional)"
              value={s.serial.stock}
              onChange={(v) => setSerial({ stock: v })}
              units={VOLUME_UNITS}
              unit={s.serial.stockUnit}
              onUnitChange={(u) => setSerial({ stockUnit: u as VolumeUnit })}
              min={0}
              error={serial.errors.stock}
              hint="Checked against the stock the first tube needs."
            />
            <NumberField
              label="Number of steps (tubes)"
              value={s.serial.steps}
              onChange={(v) => setSerial({ steps: v })}
              min={1}
              max={MAX_STEPS}
              step="1"
              placeholder="e.g. 5"
              error={serial.errors.steps}
              hint={`A whole number, 1–${MAX_STEPS}.`}
            />
            <NumberField
              label="Dilution factor per step (X in 1:X)"
              value={s.serial.factor}
              onChange={(v) => setSerial({ factor: v })}
              unit="fold"
              min={0}
              placeholder="e.g. 10"
              error={serial.errors.factor}
              hint={factorHint(s.serial.factor)}
            />
            <NumberField
              label="Final volume in each tube"
              value={s.serial.v}
              onChange={(v) => setSerial({ v })}
              units={VOLUME_UNITS}
              unit={s.serial.vUnit}
              onUnitChange={(u) => setSerial({ vUnit: u as VolumeUnit })}
              min={0}
              placeholder="e.g. 10"
              error={serial.errors.v}
            />
            <NumberField
              label="Desired final concentration (optional)"
              value={s.serial.target}
              onChange={(v) => setSerial({ target: v })}
              units={CONC_OPTIONS}
              unit={s.serial.targetUnit}
              onUnitChange={(u) => setSerial({ targetUnit: u as ConcUnit })}
              min={0}
              error={serial.errors.target}
              hint="Reports the tube that reaches it. Your inputs are never changed."
            />
          </FieldGrid>
          <KeepFullToggle checked={s.serial.keepFull} onChange={(keepFull) => setSerial({ keepFull })} />
          {serial.incompatible && <LabNotice tone="warning">{INCOMPATIBLE}</LabNotice>}
        </CalcSection>
      )}

      {mode === "stepwise" && (
        <>
          <CalcSection title="Stock" className="rounded-[20px]">
            <FieldGrid>
              <NumberField
                label="Initial stock concentration (C₁)"
                value={s.stepwise.c1}
                onChange={(v) => setStepwise({ c1: v })}
                units={CONC_OPTIONS}
                unit={s.stepwise.c1Unit}
                onUnitChange={(u) => setStepwise({ c1Unit: u as ConcUnit })}
                min={0}
                placeholder="e.g. 100"
                error={stepwise.errors.c1}
              />
              <NumberField
                label="Stock volume available (optional)"
                value={s.stepwise.stock}
                onChange={(v) => setStepwise({ stock: v })}
                units={VOLUME_UNITS}
                unit={s.stepwise.stockUnit}
                onUnitChange={(u) => setStepwise({ stockUnit: u as VolumeUnit })}
                min={0}
                error={stepwise.errors.stock}
              />
              <NumberField
                label="Desired final concentration (optional)"
                value={s.stepwise.target}
                onChange={(v) => setStepwise({ target: v })}
                units={CONC_OPTIONS}
                unit={s.stepwise.targetUnit}
                onUnitChange={(u) => setStepwise({ targetUnit: u as ConcUnit })}
                min={0}
                error={stepwise.errors.target}
              />
            </FieldGrid>
            {stepwise.incompatible && <LabNotice tone="warning">{INCOMPATIBLE}</LabNotice>}
          </CalcSection>

          <CalcSection title="Steps" description={`Each tube is diluted from the one before it. Up to ${MAX_ROWS} steps.`} className="rounded-[20px]">
            {s.stepwise.rows.map((row, index) => (
              <div key={row.id} className="rounded-[16px] border bg-background p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="grid h-7 min-w-[28px] place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-green-400 px-1.5 text-xs font-bold text-white">
                      T{index + 1}
                    </span>
                    {index === 0 ? "From the stock" : `From T${index}`}
                  </p>
                  {s.stepwise.rows.length > 1 && (
                    <Button
                      variant="ghost"
                      className="h-11"
                      onClick={() => setStepwise({ rows: s.stepwise.rows.filter((r) => r.id !== row.id) })}
                      aria-label={`Remove step ${index + 1}`}
                    >
                      <Trash2 />
                      Remove
                    </Button>
                  )}
                </div>
                <FieldGrid>
                  <NumberField
                    label="Dilution factor (X in 1:X)"
                    value={row.factor}
                    onChange={(v) => updateRow(row.id, { factor: v })}
                    unit="fold"
                    min={0}
                    placeholder="e.g. 10"
                    error={stepwise.rowErrors[index]?.factor}
                    hint={factorHint(row.factor)}
                  />
                  <NumberField
                    label="Final volume"
                    value={row.vol}
                    onChange={(v) => updateRow(row.id, { vol: v })}
                    units={VOLUME_UNITS}
                    unit={row.unit}
                    onUnitChange={(u) => updateRow(row.id, { unit: u as VolumeUnit })}
                    min={0}
                    placeholder="e.g. 5"
                    error={stepwise.rowErrors[index]?.vol}
                  />
                </FieldGrid>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setStepwise({ rows: [...s.stepwise.rows, blankRow()] })}
              disabled={s.stepwise.rows.length >= MAX_ROWS}
            >
              <Plus />
              Add step
            </Button>
            <KeepFullToggle checked={s.stepwise.keepFull} onChange={(keepFull) => setStepwise({ keepFull })} />
          </CalcSection>
        </>
      )}

      {mode === "reverse" && (
        <CalcSection title="Reverse calculation" description="How much stock for the concentration and volume you need — split into steps if it is too small to pipette." className="rounded-[20px]">
          <FieldGrid>
            <NumberField
              label="Stock concentration"
              value={s.reverse.cs}
              onChange={(v) => setReverse({ cs: v })}
              units={CONC_OPTIONS}
              unit={s.reverse.csUnit}
              onUnitChange={(u) => setReverse({ csUnit: u as ConcUnit })}
              min={0}
              placeholder="e.g. 1"
              error={reverse.errors.cs}
            />
            <NumberField
              label="Desired concentration"
              value={s.reverse.cd}
              onChange={(v) => setReverse({ cd: v })}
              units={CONC_OPTIONS}
              unit={s.reverse.cdUnit}
              onUnitChange={(u) => setReverse({ cdUnit: u as ConcUnit })}
              min={0}
              placeholder="e.g. 50"
              error={reverse.errors.cd}
            />
            <NumberField
              label="Desired final volume"
              value={s.reverse.v}
              onChange={(v) => setReverse({ v })}
              units={VOLUME_UNITS}
              unit={s.reverse.vUnit}
              onUnitChange={(u) => setReverse({ vUnit: u as VolumeUnit })}
              min={0}
              placeholder="e.g. 100"
              error={reverse.errors.v}
            />
            <NumberField
              label="Minimum volume you can pipette accurately (optional)"
              value={s.reverse.min}
              onChange={(v) => setReverse({ min: v })}
              units={VOLUME_UNITS}
              unit={s.reverse.minUnit}
              onUnitChange={(u) => setReverse({ minUnit: u as VolumeUnit })}
              min={0}
              error={reverse.errors.min}
              hint="If the stock volume is below this, a multi-step plan is suggested."
            />
          </FieldGrid>
          {reverse.incompatible && <LabNotice tone="warning">{INCOMPATIBLE}</LabNotice>}
          {plan && plan.steps !== null && plan.exactX !== null && (
            <LabNotice tone="info" title={`Too small to pipette in one step — try ${plan.steps} steps`}>
              <p>
                {plan.steps} steps of {factorLabel(plan.exactX)} each
                {plan.convenient ? `, or exactly ${plan.convenient.map((x) => factorLabel(x)).join(" then ")}` : ""}. Details are on the card below.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="outline" className="h-11 bg-card" onClick={() => openInStepwise(new Array(plan.steps as number).fill(plan.exactX as number))}>
                  <ListOrdered />
                  Open {plan.steps}-step plan in Stepwise
                </Button>
                {plan.convenient && (
                  <Button variant="outline" className="h-11 bg-card" onClick={() => openInStepwise(plan.convenient as number[])}>
                    <ListOrdered />
                    Open {plan.convenient.map((x) => factorLabel(x)).join(" → ")} in Stepwise
                  </Button>
                )}
              </div>
            </LabNotice>
          )}
        </CalcSection>
      )}

      <div className="space-y-1">
        <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="serial-dilution">
          <Button
            variant="outline"
            onClick={save}
            disabled={!report}
            className="col-span-2 border-green-300 bg-green-50 text-green-800 hover:border-green-400 hover:bg-green-100 sm:col-span-1"
          >
            <BookmarkPlus />
            Save calculation
          </Button>
        </LabActions>
        <p aria-live="polite" className="text-xs font-medium text-green-700">
          {saveStatus}
        </p>
      </div>

      <div ref={reportRef} className="scroll-mt-24 space-y-4">
        {report ? (
          <>
            {strip && <TubeStrip chain={strip.chain} unit={strip.unit} />}
            <LabReport data={report} />
          </>
        ) : (
          <div className="rounded-[20px] border border-dashed bg-card p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Laboratory calculation card</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {submitted
                ? "Some values are missing or invalid — check the highlighted fields."
                : mode === "simple"
                  ? "Enter the stock concentration, the concentration you need and the final volume."
                  : mode === "serial"
                    ? "Enter the stock concentration, number of steps, dilution factor and the volume in each tube."
                    : mode === "stepwise"
                      ? "Enter the stock concentration and a dilution factor and volume for every step."
                      : "Enter the stock and desired concentrations and the final volume."}
            </p>
          </div>
        )}
      </div>

      {saved.length > 0 && (
        <CalcSection title="Saved calculations" description="Stored in this browser only — newest first, up to 20." className="rounded-[20px]">
          <div role="list" className="divide-y overflow-hidden rounded-[16px] border">
            {saved.map((item) => (
              <div role="listitem" key={item.id} className="flex flex-col gap-2 bg-background p-3 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {MODE_LABELS[item.mode]} · {new Date(item.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="h-11 flex-1 sm:flex-none" onClick={() => load(item)}>
                    <FolderOpen />
                    Load
                  </Button>
                  <Button variant="ghost" className="h-11 flex-1 sm:flex-none" onClick={() => remove(item.id)} aria-label={`Delete ${item.name}`}>
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CalcSection>
      )}

      <FormulaNote>
        <Formula>C₁V₁ = C₂V₂ → V₁ = C₂ × V₂ ÷ C₁; diluent = V₂ − V₁</Formula>
        <Formula>C_new = C_start × 1/X  (dilution factor written 1:X)</Formula>
        <Formula>Volume taken = Final volume ÷ X; diluent = Final volume − Volume taken</Formula>
        <Formula>Overall factor = X₁ × X₂ × … × Xₙ; C_final = C₁ ÷ overall factor</Formula>
        <p>
          <strong>Keep full volume.</strong> If every tube must still hold its final volume after the next tube has
          taken its share, each tube is made up to V + (volume the next tube takes). That depends on the next tube, so
          the volumes are worked out backwards from the last tube: made-up volumeᵢ = Vᵢ + made-up volumeᵢ₊₁ ÷ Xᵢ₊₁.
        </p>
        <p>
          <strong>Worked example.</strong> Amoxicillin 10 mg/mL, 1:10 × 5 tubes of 10 mL: each tube takes 10 mL ÷ 10 =
          1.00 mL and 9.00 mL of diluent. The concentrations are 1, 0.1, 0.01, 0.001 mg/mL and 0.1 µg/mL; the overall
          factor is 10⁵ = 100,000. With &ldquo;keep full volume&rdquo; on, T1 is made up to 11.1 mL (1.11 mL of stock +
          10.0 mL diluent) so that it still holds 10.0 mL after T2 takes its 1.11 mL.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "Is a 1:10 dilution the same as a dilution factor of 10?", a: "Yes, in this calculator. 1:10 means 1 part of solution in 10 parts total (1 mL stock + 9 mL diluent), so the concentration becomes one tenth. Some older texts write 1:9 for 1 part + 9 parts — check which convention your manual uses before you pipette." },
          { q: "When should I use a serial dilution instead of a single step?", a: "When the single-step stock volume would be too small to pipette accurately (below about 10 µL on a typical micropipette), or when you need every intermediate concentration — for example the doubling dilutions of an MIC plate or the points of a standard curve." },
          { q: "Why does the last tube have more liquid than the others?", a: "Because nothing is taken out of it. Every other tube gives up a transfer to the next tube. Turn on \"keep full volume\" if every tube must end with the same volume — the calculator then makes each tube up a little larger." },
          { q: "Can I mix mg/mL and mM?", a: "Not without the molecular weight. Mass concentrations (mg/mL, g/L, µg/mL, % w/v) convert among themselves, and molar ones (M, mM, µM) convert among themselves. To cross over, first convert with mM = (mg/mL ÷ MW in g/mol) × 1000." },
          { q: "How accurate is a long series?", a: "Pipetting errors compound. If each step is within 1 %, six steps can be about 6 % off in the last tube. Use calibrated pipettes, a fresh tip for each transfer, and mix every tube before taking from it." },
        ]}
      />
    </CalculatorShell>
  );
}

// ─── UI PIECES ───────────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as const;

/** States the 1:X convention once, where the factor is entered. */
function ConventionCard() {
  return (
    <div className="rounded-[20px] border border-blue-100 bg-gradient-to-br from-blue-50 via-card to-green-50 p-4 sm:p-5">
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-blue-700">How the factor is entered</p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground">
        Dilution factor is <strong>X in 1:X</strong> — 1 part of solution in X parts total. <strong>10</strong> means
        1:10, so each tube is <span className="font-mono text-[13px]">C_new = C_start × 1/10</span> (× 0.1). The
        textbook form <span className="font-mono text-[13px]">C_final = C_initial × dilution factor</span> uses the
        fraction 1/X. X must be greater than 1.
      </p>
    </div>
  );
}

function KeepFullToggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-[56px] w-full items-center gap-3 rounded-[16px] border bg-background px-4 py-3 text-left transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
    >
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${checked ? "bg-blue-600" : "bg-slate-300"}`}>
        <MotionConfig reducedMotion="user">
          <motion.span
            className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow"
            animate={{ x: checked ? 20 : 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          />
        </MotionConfig>
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">Each tube keeps its full final volume after the next transfer</span>
        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
          {checked
            ? "On: tubes are made up larger, worked out backwards from the last tube."
            : "Off: every tube is made up to the final volume, then gives up the next transfer."}
        </span>
      </span>
    </button>
  );
}

/**
 * The series at a glance: colour depth follows log concentration, so a 1:10
 * series fades in even steps. Decorative — the numbers live in the card.
 */
function TubeStrip({ chain, unit }: { chain: Chain; unit: ConcUnit }) {
  const start = chain.tubes[0]?.startBase ?? 1;
  const span = Math.log(start / chain.finalBase) || 1;
  const items = [
    { label: "Stock", base: start },
    ...chain.tubes.map((tube) => ({ label: `T${tube.number}`, base: tube.endBase })),
  ];
  return (
    <MotionConfig reducedMotion="user">
      <div className="rounded-[20px] border bg-card p-4 shadow-sm">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Dilution series</p>
        <div className="mt-3 overflow-x-auto pb-1">
          <div className="flex min-w-max items-end gap-3" aria-hidden="true">
            {items.map((item, i) => {
              const depth = Math.log(item.base / chain.finalBase) / span; // 1 at stock, 0 at the last tube
              return (
                <div key={item.label} className="flex w-[68px] flex-col items-center gap-1.5">
                  <div className="relative h-20 w-9 overflow-hidden rounded-b-full rounded-t-md border-2 border-blue-100 bg-white">
                    <motion.div
                      className="absolute inset-x-0 bottom-0 h-3/4 origin-bottom bg-gradient-to-t from-blue-600 to-green-400"
                      style={{ opacity: 0.12 + 0.88 * Math.max(0, Math.min(1, depth)) }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.6, ease: EASE, delay: i * 0.05 }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground">{item.label}</span>
                  <span className="text-center text-[11px] leading-tight tabular-nums text-muted-foreground">{conc(item.base, unit)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="sr-only">
          {items.map((item) => `${item.label}: ${conc(item.base, unit)}`).join("; ")}
        </p>
      </div>
    </MotionConfig>
  );
}

function Examples({ items }: { items: { label: string; active: boolean; apply: () => void }[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Try a worked example</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.apply}
            className={`min-h-[44px] rounded-full border px-3.5 py-2 text-left text-xs font-medium transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1 ${
              item.active ? "border-blue-200 bg-blue-50/60 text-blue-900" : "bg-background text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
