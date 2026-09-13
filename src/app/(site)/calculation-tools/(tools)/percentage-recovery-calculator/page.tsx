"use client";

import { useMemo, useRef, useState } from "react";
import { Beaker, Percent, Scale } from "lucide-react";
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
  type LabReportSection,
  toNumber,
  fieldError,
  formatSig,
  formatFixed,
  MASS_TO_G,
  VOLUME_TO_ML,
} from "@/components/calculators";

// ─── TYPES & UNIT TABLES ─────────────────────────────────────────────────────

type Mode = "amounts" | "concentration";

type Dimension = "mass" | "volume" | "percent" | "units";
type AmountUnit = "µg" | "mg" | "g" | "kg" | "µL" | "mL" | "L" | "%" | "IU";
type VolumeUnit = keyof typeof VOLUME_TO_ML;
type ConcUnit = "µg/mL" | "mg/mL" | "g/L" | "mg/L" | "µg/L" | "% w/v" | "M" | "mM" | "µM";
type ConcFamily = "massPerVolume" | "molar";

const AMOUNT_UNITS: AmountUnit[] = ["µg", "mg", "g", "kg", "µL", "mL", "L", "%", "IU"];
const VOLUME_UNITS: VolumeUnit[] = ["µL", "mL", "L"];
const CONC_UNITS: ConcUnit[] = ["µg/mL", "mg/mL", "g/L", "mg/L", "µg/L", "% w/v", "M", "mM", "µM"];

/**
 * Each unit's dimension and its factor to that dimension's base unit (g for
 * mass, mL for volume). "%" and "IU" have no conversion: a percentage can only
 * be compared with a percentage, and an IU is defined per substance, so it can
 * never be turned into a mass here.
 */
const AMOUNT_UNIT_INFO: Record<AmountUnit, { dim: Dimension; toBase: number }> = {
  "µg": { dim: "mass", toBase: MASS_TO_G["µg"] },
  mg: { dim: "mass", toBase: MASS_TO_G.mg },
  g: { dim: "mass", toBase: MASS_TO_G.g },
  kg: { dim: "mass", toBase: MASS_TO_G.kg },
  "µL": { dim: "volume", toBase: VOLUME_TO_ML["µL"] },
  mL: { dim: "volume", toBase: VOLUME_TO_ML.mL },
  L: { dim: "volume", toBase: VOLUME_TO_ML.L },
  "%": { dim: "percent", toBase: 1 },
  IU: { dim: "units", toBase: 1 },
};

const DIMENSION_ORDER: Dimension[] = ["mass", "volume", "percent", "units"];
const DIMENSION_NAME: Record<Dimension, string> = {
  mass: "mass",
  volume: "volume",
  percent: "a percentage",
  units: "IU (units)",
};

/**
 * Concentration → base concentration. Mass-per-volume units go to mg/mL, so
 * C × V(mL) is an amount in mg; molar units go to mmol/mL (1 M = 1 mol/L =
 * 1 mmol/mL), so C × V(mL) is an amount in mmol.
 */
const CONC_INFO: Record<ConcUnit, { family: ConcFamily; factor: number }> = {
  "µg/mL": { family: "massPerVolume", factor: 1e-3 },
  "mg/mL": { family: "massPerVolume", factor: 1 },
  "g/L": { family: "massPerVolume", factor: 1 },
  "mg/L": { family: "massPerVolume", factor: 1e-3 },
  "µg/L": { family: "massPerVolume", factor: 1e-6 },
  "% w/v": { family: "massPerVolume", factor: 10 },
  M: { family: "molar", factor: 1 },
  mM: { family: "molar", factor: 1e-3 },
  "µM": { family: "molar", factor: 1e-6 },
};

const FAMILY_BASE: Record<ConcFamily, { conc: string; amount: string; name: string }> = {
  massPerVolume: { conc: "mg/mL", amount: "mg", name: "a mass-per-volume concentration" },
  molar: { conc: "mmol/mL", amount: "mmol", name: "a molar concentration" },
};

const OVER_100_WARNING = "Recovery exceeds 100%. Verify weighing, concentration, dilution, or measurement data.";

// ─── PURE CALCULATION ────────────────────────────────────────────────────────

type Outcome =
  | { status: "incomplete" }
  | { status: "incompatible"; message: string }
  | {
      status: "ok";
      initial: number;
      recovered: number;
      /** Unit both amounts are expressed in for the division. */
      unit: string;
      percent: number;
      normalisation: { formulas: string[]; lines: string[] };
      initialSection: LabReportSection;
      recoveredSection: LabReportSection;
      given: LabReportSection;
    };

const num = (value: number) => formatSig(value, 6);

function incompatibleMessage(a: Dimension, b: Dimension) {
  const [first, second] = DIMENSION_ORDER.indexOf(a) <= DIMENSION_ORDER.indexOf(b) ? [a, b] : [b, a];
  return `Incompatible units: ${DIMENSION_NAME[first]} cannot be compared with ${DIMENSION_NAME[second]}. Use the same kind of unit for both.`;
}

function computeAmounts(initialRaw: string, initialUnit: AmountUnit, recoveredRaw: string, recoveredUnit: AmountUnit): Outcome {
  const a = AMOUNT_UNIT_INFO[initialUnit];
  const b = AMOUNT_UNIT_INFO[recoveredUnit];
  if (a.dim !== b.dim) return { status: "incompatible", message: incompatibleMessage(a.dim, b.dim) };

  const initial = toNumber(initialRaw);
  const recoveredEntered = toNumber(recoveredRaw);
  if (initial === null || initial <= 0 || recoveredEntered === null || recoveredEntered < 0) return { status: "incomplete" };

  // Express the recovered amount in the initial amount's unit, so the division
  // is between like quantities and the substitution reads naturally.
  const factor = b.toBase / a.toBase;
  const recovered = recoveredEntered * factor;
  const sameUnit = initialUnit === recoveredUnit;

  return {
    status: "ok",
    initial,
    recovered,
    unit: initialUnit,
    percent: (recovered / initial) * 100,
    given: {
      title: "Given data",
      rows: [
        { label: "Initial amount", value: initialRaw.trim(), unit: initialUnit },
        { label: "Amount recovered", value: recoveredRaw.trim(), unit: recoveredUnit },
      ],
    },
    normalisation: sameUnit
      ? { formulas: [], lines: [`Both amounts are in ${initialUnit}, so no conversion is needed.`] }
      : {
          formulas: [
            `1 ${recoveredUnit} = ${formatSig(factor, 4)} ${initialUnit}`,
            `Amount recovered = ${recoveredRaw.trim()} ${recoveredUnit} × ${formatSig(factor, 4)} = ${num(recovered)} ${initialUnit}`,
          ],
          lines: [`The recovered amount is converted to ${initialUnit}, the unit of the initial amount, so both are the same kind of quantity in the same unit.`],
        },
    initialSection: {
      title: "Initial amount",
      rows: [{ label: "Initial amount", value: num(initial), unit: initialUnit }],
      lines: ["Taken as entered — the amount present before the procedure (the denominator)."],
    },
    recoveredSection: {
      title: "Recovered amount",
      rows: [{ label: "Amount recovered", value: num(recovered), unit: initialUnit }],
      lines: ["The amount found after the procedure (the numerator)."],
    },
  };
}

function computeConcentration(
  c1Raw: string, c1Unit: ConcUnit, v1Raw: string, v1Unit: VolumeUnit,
  c2Raw: string, c2Unit: ConcUnit, v2Raw: string, v2Unit: VolumeUnit,
): Outcome {
  const f1 = CONC_INFO[c1Unit];
  const f2 = CONC_INFO[c2Unit];
  if (f1.family !== f2.family) {
    return {
      status: "incompatible",
      message: `Incompatible units: ${FAMILY_BASE.massPerVolume.name} cannot be compared with ${FAMILY_BASE.molar.name}. Use the same kind of unit for both.`,
    };
  }

  const c1 = toNumber(c1Raw);
  const v1 = toNumber(v1Raw);
  const c2 = toNumber(c2Raw);
  const v2 = toNumber(v2Raw);
  if (c1 === null || c1 <= 0 || v1 === null || v1 <= 0 || c2 === null || c2 < 0 || v2 === null || v2 <= 0) {
    return { status: "incomplete" };
  }

  const base = FAMILY_BASE[f1.family];
  const c1b = c1 * f1.factor;
  const c2b = c2 * f2.factor;
  const v1b = v1 * VOLUME_TO_ML[v1Unit];
  const v2b = v2 * VOLUME_TO_ML[v2Unit];
  const initial = c1b * v1b;
  const recovered = c2b * v2b;

  // Only the conversions that were actually applied are written out.
  const formulas: string[] = [];
  if (c1Unit !== base.conc) formulas.push(`C₁: ${c1Raw.trim()} ${c1Unit} = ${c1Raw.trim()} × ${formatSig(f1.factor, 3)} ${base.conc} = ${num(c1b)} ${base.conc}`);
  if (v1Unit !== "mL") formulas.push(`V₁: ${v1Raw.trim()} ${v1Unit} = ${v1Raw.trim()} × ${formatSig(VOLUME_TO_ML[v1Unit], 3)} mL = ${num(v1b)} mL`);
  if (c2Unit !== base.conc) formulas.push(`C₂: ${c2Raw.trim()} ${c2Unit} = ${c2Raw.trim()} × ${formatSig(f2.factor, 3)} ${base.conc} = ${num(c2b)} ${base.conc}`);
  if (v2Unit !== "mL") formulas.push(`V₂: ${v2Raw.trim()} ${v2Unit} = ${v2Raw.trim()} × ${formatSig(VOLUME_TO_ML[v2Unit], 3)} mL = ${num(v2b)} mL`);

  const lines = [
    `Concentrations are expressed in ${base.conc} and volumes in mL, so concentration × volume gives an amount in ${base.amount}.`,
  ];
  if (formulas.length === 0) lines.push(`All values are already in ${base.conc} and mL — no conversion needed.`);
  if (c1Unit === "% w/v" || c2Unit === "% w/v") lines.push("1 % w/v = 1 g per 100 mL = 10 mg/mL.");
  if (f1.family === "molar") lines.push("1 M = 1 mol/L = 1 mmol/mL.");

  return {
    status: "ok",
    initial,
    recovered,
    unit: base.amount,
    percent: (recovered / initial) * 100,
    given: {
      title: "Given data",
      rows: [
        { label: "Initial concentration (C₁)", value: c1Raw.trim(), unit: c1Unit },
        { label: "Initial volume (V₁)", value: v1Raw.trim(), unit: v1Unit },
        { label: "Recovered concentration (C₂)", value: c2Raw.trim(), unit: c2Unit },
        { label: "Final volume (V₂)", value: v2Raw.trim(), unit: v2Unit },
      ],
    },
    normalisation: { formulas, lines },
    initialSection: {
      title: "Initial amount",
      formulas: [`Initial amount = C₁ × V₁ = ${num(c1b)} ${base.conc} × ${num(v1b)} mL = ${num(initial)} ${base.amount}`],
      rows: [{ label: "Initial amount", value: num(initial), unit: base.amount }],
    },
    recoveredSection: {
      title: "Recovered amount",
      formulas: [`Amount recovered = C₂ × V₂ = ${num(c2b)} ${base.conc} × ${num(v2b)} mL = ${num(recovered)} ${base.amount}`],
      rows: [{ label: "Amount recovered", value: num(recovered), unit: base.amount }],
    },
  };
}

function readingLines(percent: number): string[] {
  const lines: string[] = [];
  if (percent > 100) {
    lines.push(
      `The recovered amount is ${formatFixed(percent - 100, 2)} percentage points above the initial amount. This does happen in real work — usually from residual solvent or moisture, co-extracted material, or a dilution or calibration error — so check the data before accepting the result.`,
    );
  } else if (percent === 0) {
    lines.push("Nothing was recovered. Check that the analyte was present, that the right fraction was collected, and that the measurement was sensitive enough to detect it.");
  } else if (percent < 98) {
    lines.push(
      `${formatFixed(100 - percent, 2)}% of the initial amount was not recovered. Transfer losses, incomplete extraction, adsorption onto glassware or filters, degradation, and material left in the mother liquor are common causes.`,
    );
  }
  if (percent >= 98 && percent <= 102) {
    lines.push("The result lies within roughly 98–102%, a window commonly used for assay and spike-recovery studies.");
  }
  lines.push(
    "General guidance only: many assay validations commonly expect recoveries of roughly 98–102%, trace-level and bioanalytical methods often accept wider ranges, and extraction or purification recoveries vary widely with the procedure. The acceptance criteria that apply are those set by your method, SOP or pharmacopoeia.",
  );
  return lines;
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function PercentageRecoveryCalculator() {
  const [mode, setMode] = useState<Mode>("amounts");
  const [submitted, setSubmitted] = useState(false);
  const [sample, setSample] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  // Amounts mode
  const [initial, setInitial] = useState("");
  const [initialUnit, setInitialUnit] = useState<AmountUnit>("mg");
  const [recovered, setRecovered] = useState("");
  const [recoveredUnit, setRecoveredUnit] = useState<AmountUnit>("mg");

  // Concentration × volume mode
  const [c1, setC1] = useState("");
  const [c1Unit, setC1Unit] = useState<ConcUnit>("µg/mL");
  const [v1, setV1] = useState("");
  const [v1Unit, setV1Unit] = useState<VolumeUnit>("mL");
  const [c2, setC2] = useState("");
  const [c2Unit, setC2Unit] = useState<ConcUnit>("µg/mL");
  const [v2, setV2] = useState("");
  const [v2Unit, setV2Unit] = useState<VolumeUnit>("mL");

  const outcome: Outcome = useMemo(
    () =>
      mode === "amounts"
        ? computeAmounts(initial, initialUnit, recovered, recoveredUnit)
        : computeConcentration(c1, c1Unit, v1, v1Unit, c2, c2Unit, v2, v2Unit),
    [mode, initial, initialUnit, recovered, recoveredUnit, c1, c1Unit, v1, v1Unit, c2, c2Unit, v2, v2Unit],
  );

  const report: LabReportData | null = useMemo(() => {
    if (outcome.status !== "ok") return null;
    const { percent, initial: i, recovered: r, unit } = outcome;
    const ratio = r / i;

    return {
      title: "Percentage Recovery",
      context: "Pharmaceutical Analysis Lab",
      sample: sample.trim() || undefined,
      result: { label: "Percentage recovery", value: formatFixed(percent, 2), unit: "%" },
      warnings: percent > 100 ? [OVER_100_WARNING] : undefined,
      sections: [
        outcome.given,
        { title: "Unit normalisation", formulas: outcome.normalisation.formulas, lines: outcome.normalisation.lines },
        outcome.initialSection,
        outcome.recoveredSection,
        { title: "Formula", formulas: ["% Recovery = (Amount recovered / Initial amount) × 100"] },
        {
          title: "Substitution & result",
          formulas: [
            `% Recovery = (${num(r)} ${unit} / ${num(i)} ${unit}) × 100`,
            `= ${formatSig(ratio, 6)} × 100 = ${formatFixed(percent, 2)} %`,
          ],
          rows: [
            { label: "Percentage recovery", value: formatFixed(percent, 2), unit: "%" },
            ...(percent <= 100 ? [{ label: "Percentage loss (100 − recovery)", value: formatFixed(100 - percent, 2), unit: "%" }] : []),
          ],
        },
        { title: "Reading the result", lines: readingLines(percent) },
      ],
      notes: [
        "Recovery compares the same substance before and after a procedure. Yield compares an isolated product with the theoretical amount a reaction could give.",
        ...(mode === "concentration"
          ? ["Concentration × volume assumes each concentration applies to the whole of the volume entered with it."]
          : []),
      ],
    };
  }, [outcome, sample, mode]);

  // ── Validation ──
  const show = submitted;
  const errors = {
    initial: fieldError(initial, { show }),
    recovered: fieldError(recovered, { show, allowZero: true }),
    c1: fieldError(c1, { show }),
    v1: fieldError(v1, { show }),
    c2: fieldError(c2, { show, allowZero: true }),
    v2: fieldError(v2, { show }),
  };

  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setSubmitted(false);
    setSample("");
    setInitial(""); setInitialUnit("mg"); setRecovered(""); setRecoveredUnit("mg");
    setC1(""); setC1Unit("µg/mL"); setV1(""); setV1Unit("mL");
    setC2(""); setC2Unit("µg/mL"); setV2(""); setV2Unit("mL");
  };

  const examples: { label: string; apply: () => void }[] = [
    {
      label: "Extraction: 500 mg → 432 mg",
      apply: () => {
        setMode("amounts");
        setInitial("500"); setInitialUnit("mg"); setRecovered("432"); setRecoveredUnit("mg");
      },
    },
    {
      label: "Recrystallisation: 2.00 g → 1.64 g",
      apply: () => {
        setMode("amounts");
        setInitial("2.00"); setInitialUnit("g"); setRecovered("1.64"); setRecoveredUnit("g");
      },
    },
    {
      label: "Mixed units: 1 g → 850 mg",
      apply: () => {
        setMode("amounts");
        setInitial("1"); setInitialUnit("g"); setRecovered("850"); setRecoveredUnit("mg");
      },
    },
    {
      label: "Assay spike: 10 µg/mL × 5 mL → 9.85 µg/mL × 5 mL",
      apply: () => {
        setMode("concentration");
        setC1("10"); setC1Unit("µg/mL"); setV1("5"); setV1Unit("mL");
        setC2("9.85"); setC2Unit("µg/mL"); setV2("5"); setV2Unit("mL");
      },
    },
  ];

  return (
    <CalculatorShell
      title="Percentage Recovery Calculator"
      subtitle="How much of the starting material you got back after an extraction, purification, assay or analytical procedure."
      icon={Percent}
      eyebrow="Pharmaceutical Analysis"
      aside={
        <>
          <CalcAbout title="About percentage recovery">
            <p>
              <strong>Percentage recovery</strong> expresses the amount of a substance found after a procedure as a
              percentage of the amount that was there at the start. It measures how much a step loses — or, in method
              validation, how accurately a method measures a known amount.
            </p>
            <CalcList
              title="Where it is used"
              items={[
                "Extraction of a drug or phytoconstituent from a matrix",
                "Purification steps such as recrystallisation or chromatography",
                "Spike-recovery studies when validating an assay",
                "Checking losses during filtration, transfer and drying",
              ]}
            />
            <CalcList
              tone="caution"
              title="Check before you trust it"
              items={[
                "Both amounts must be the same substance, in the same kind of unit",
                "A dried product must be dried to constant weight before weighing",
                "Account for every dilution between the sample and the measurement",
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
        onChange={(next) => { setMode(next); setSubmitted(false); }}
        options={[
          { value: "amounts", label: "Amounts", description: "Initial and recovered amount", icon: Scale },
          { value: "concentration", label: "Concentration × volume", description: "Amounts from C and V", icon: Beaker },
        ]}
      />

      <CalcSection title="Experiment">
        <TextField
          label="Sample / procedure name (optional)"
          value={sample}
          onChange={setSample}
          placeholder="e.g. Caffeine extraction from tea — Group 3"
          hint="Printed on the lab result card."
        />
      </CalcSection>

      {mode === "amounts" ? (
        <CalcSection title="Amounts" description="Mass with mass, volume with volume. % and IU compare only with themselves.">
          <FieldGrid>
            <NumberField
              label="Initial amount"
              value={initial}
              onChange={setInitial}
              units={AMOUNT_UNITS}
              unit={initialUnit}
              onUnitChange={(u) => setInitialUnit(u as AmountUnit)}
              min={0}
              error={errors.initial}
              hint="Amount before the procedure."
            />
            <NumberField
              label="Amount recovered"
              value={recovered}
              onChange={setRecovered}
              units={AMOUNT_UNITS}
              unit={recoveredUnit}
              onUnitChange={(u) => setRecoveredUnit(u as AmountUnit)}
              min={0}
              error={errors.recovered}
              hint="Amount found after the procedure."
            />
          </FieldGrid>
          {outcome.status === "incompatible" && <LabNotice tone="danger">{outcome.message}</LabNotice>}
        </CalcSection>
      ) : (
        <>
          <CalcSection title="Initial solution" description="The amount present at the start = C₁ × V₁.">
            <FieldGrid>
              <NumberField
                label="Initial concentration (C₁)"
                value={c1}
                onChange={setC1}
                units={CONC_UNITS}
                unit={c1Unit}
                onUnitChange={(u) => setC1Unit(u as ConcUnit)}
                min={0}
                error={errors.c1}
              />
              <NumberField
                label="Initial volume (V₁)"
                value={v1}
                onChange={setV1}
                units={VOLUME_UNITS}
                unit={v1Unit}
                onUnitChange={(u) => setV1Unit(u as VolumeUnit)}
                min={0}
                error={errors.v1}
              />
            </FieldGrid>
          </CalcSection>
          <CalcSection title="Recovered solution" description="The amount found at the end = C₂ × V₂.">
            <FieldGrid>
              <NumberField
                label="Recovered concentration (C₂)"
                value={c2}
                onChange={setC2}
                units={CONC_UNITS}
                unit={c2Unit}
                onUnitChange={(u) => setC2Unit(u as ConcUnit)}
                min={0}
                error={errors.c2}
                hint="As measured, corrected back for any dilution."
              />
              <NumberField
                label="Final volume (V₂)"
                value={v2}
                onChange={setV2}
                units={VOLUME_UNITS}
                unit={v2Unit}
                onUnitChange={(u) => setV2Unit(u as VolumeUnit)}
                min={0}
                error={errors.v2}
              />
            </FieldGrid>
            {outcome.status === "incompatible" && <LabNotice tone="danger">{outcome.message}</LabNotice>}
          </CalcSection>
        </>
      )}

      <CalcSection>
        <Examples items={examples} />
      </CalcSection>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="percentage-recovery" />

      <div ref={reportRef} className="scroll-mt-24">
        {report ? (
          <LabReport data={report} />
        ) : (
          <div className="rounded-[20px] border border-dashed bg-card p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Laboratory calculation card</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {outcome.status === "incompatible"
                ? "The selected units cannot be compared — choose the same kind of unit for both."
                : submitted
                  ? "Some values are missing or invalid — check the highlighted fields."
                  : mode === "amounts"
                    ? "Enter the initial amount and the amount recovered."
                    : "Enter both concentrations and both volumes."}
            </p>
          </div>
        )}
      </div>

      <FormulaNote>
        <Formula>% Recovery = (Amount recovered / Initial amount) × 100</Formula>
        <Formula>Amount = Concentration × Volume</Formula>
        <Formula>% Loss = 100 − % Recovery</Formula>
        <p>
          Both amounts must be in the same unit before dividing. Masses are converted through grams and volumes
          through millilitres, so 850 mg recovered from 1 g is 0.85 g / 1 g × 100 = 85%. In concentration mode, a
          mass-per-volume concentration is converted to mg/mL and a molar one to mmol/mL; multiplying by the volume in
          mL then gives each amount in mg or mmol.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "How can recovery be more than 100%?", a: "On paper it often is. A product that is not fully dry still holds solvent or water; an extract can carry co-extracted impurities that add weight or absorbance; a pipetting or dilution error, or a drifting calibration curve, inflates a measured concentration. A result above 100% is a signal to re-check the data, not proof that something was created." },
          { q: "What is the difference between recovery and yield?", a: "Recovery compares the amount of the same substance before and after a step — you started with 2.00 g of crude aspirin and got 1.64 g back. Percentage yield compares the product you isolated with the theoretical amount a reaction could form from its limiting reactant." },
          { q: "What is a spike-recovery study?", a: "A known amount of the analyte is added (spiked) to a blank or sample matrix and then measured with the method. The found amount as a percentage of the added amount shows how accurate the method is in that matrix. Acceptance limits come from the validation protocol or the applicable guideline." },
          { q: "Why can I not compare mg with mL?", a: "A mass and a volume are different quantities; converting between them needs the density of that specific material. Convert one of them first (mass = volume × density), then enter both as masses." },
          { q: "Can I use % or IU?", a: "Yes, as long as both values use it — for example a labelled 100% content and a found 98.7%, or 10,000 IU added and 9,640 IU found. IU cannot be converted to a mass without substance-specific information, so it is never mixed with other units." },
        ]}
      />
    </CalculatorShell>
  );
}

function Examples({ items }: { items: { label: string; apply: () => void }[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">Try a worked example</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.apply}
            className="min-h-[44px] rounded-full border bg-background px-3.5 py-2 text-left text-xs font-medium transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
