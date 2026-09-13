"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Percent } from "lucide-react";
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
  TextField,
  LabNotice,
  type LabReportData,
  toNumber,
  fieldError,
  formatSig,
  formatFixed,
  calculatorHref,
  readQuery,
  MASS_TO_G,
} from "@/components/calculators";

// ─── TYPES & CONSTANTS ───────────────────────────────────────────────────────

type MassUnit = "mg" | "g" | "kg";
const MASS_UNITS: MassUnit[] = ["mg", "g", "kg"];
const isMassUnit = (value: string | null): value is MassUnit => value === "mg" || value === "g" || value === "kg";

/** Two decimals: a balance reads to 0.1 mg, so more than this is false precision. */
const DECIMALS = 2;

const EXAMPLES = [
  { label: "Aspirin: 2.21 g of 2.61 g", actual: "2.21", actualUnit: "g" as MassUnit, theoretical: "2.609", theoreticalUnit: "g" as MassUnit },
  { label: "Paracetamol: 2.48 g of 3.00 g", actual: "2.48", actualUnit: "g" as MassUnit, theoretical: "3.00", theoreticalUnit: "g" as MassUnit },
  { label: "Micro-scale: 412 mg of 0.520 g", actual: "412", actualUnit: "mg" as MassUnit, theoretical: "0.520", theoreticalUnit: "g" as MassUnit },
  { label: "Wet product: 3.05 g of 2.61 g", actual: "3.05", actualUnit: "g" as MassUnit, theoretical: "2.609", theoreticalUnit: "g" as MassUnit },
];

// ─── PURE CALCULATION ────────────────────────────────────────────────────────

/**
 * An educational reading of the number, not a grade. Bands are broad on
 * purpose: what counts as "good" depends on the reaction, the scale and the
 * number of purification steps.
 */
function interpret(percent: number): { heading: string; detail: string } {
  if (percent === 0) {
    return { heading: "No product isolated", detail: "Check that the reaction ran (temperature, time, reagent quality) and that the product did not stay in the filtrate or mother liquor." };
  }
  if (percent > 100) {
    return { heading: "Exceeds theoretical yield", detail: "Physically the pure product cannot exceed 100%. The usual causes are a product that is still wet or holds solvent, impurities or unreacted excess reagent in the solid, or an error in the theoretical yield (wrong MW, hydrate vs anhydrous, wrong limiting reactant). Dry to constant weight and check purity (melting point, TLC)." };
  }
  if (percent < 50) {
    return { heading: "Low yield", detail: "Common causes: incomplete reaction, product lost in transfers, filtration or washing, too much recrystallisation solvent, or product left dissolved in the mother liquor." };
  }
  if (percent < 75) {
    return { heading: "Moderate yield", detail: "Typical of a student preparation that includes a recrystallisation step, where some product is always sacrificed for purity." };
  }
  if (percent < 90) {
    return { heading: "Good yield", detail: "Losses are small. Confirm purity before recording — a high yield of impure product is not a good result." };
  }
  return { heading: "Very high yield", detail: "Excellent if the product is dry and pure. Yields this close to 100% are worth checking for retained solvent or impurities." };
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function PercentageYieldCalculator() {
  const [actual, setActual] = useState("");
  const [actualUnit, setActualUnit] = useState<MassUnit>("g");
  const [theoretical, setTheoretical] = useState("");
  const [theoreticalUnit, setTheoreticalUnit] = useState<MassUnit>("g");
  const [sample, setSample] = useState("");
  const [carriedOver, setCarriedOver] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  /*
   * The Theoretical Yield Calculator hands its result over in the query string.
   * Read once, on the client, after mount — reading it during render would
   * mismatch the server HTML, and useSearchParams would need a Suspense
   * boundary in the Android static export.
   */
  useEffect(() => {
    const query = readQuery();
    const value = toNumber(query.get("theoretical"));
    if (value === null || value <= 0) return;
    const unit = query.get("unit");
    setTheoretical(String(value));
    if (isMassUnit(unit)) setTheoreticalUnit(unit);
    const product = query.get("product")?.slice(0, 120) ?? "";
    const carriedSample = query.get("sample")?.slice(0, 120) ?? "";
    if (carriedSample || product) setSample(carriedSample || product);
    setCarriedOver(`${formatSig(value, 4)} ${isMassUnit(unit) ? unit : "g"}${product ? ` of ${product}` : ""}`);
  }, []);

  const result = useMemo(() => {
    const a = toNumber(actual);
    const t = toNumber(theoretical);
    if (a === null || t === null || a < 0 || t <= 0) return null;
    const actualG = a * MASS_TO_G[actualUnit];
    const theoreticalG = t * MASS_TO_G[theoreticalUnit];
    const percent = (actualG / theoreticalG) * 100;
    return { a, t, actualG, theoreticalG, percent, lossG: theoreticalG - actualG };
  }, [actual, actualUnit, theoretical, theoreticalUnit]);

  const report: LabReportData | null = useMemo(() => {
    if (!result) return null;
    const { actualG, theoreticalG, percent, lossG } = result;
    const reading = interpret(percent);
    const sameUnit = actualUnit === theoreticalUnit;

    return {
      title: "Percentage Yield",
      context: "Chemistry / Preparation Lab",
      sample: sample.trim() || undefined,
      result: { label: "Percentage yield", value: formatFixed(percent, DECIMALS), unit: "%" },
      warnings:
        percent > 100
          ? [`Actual yield (${actual.trim()} ${actualUnit}) exceeds the theoretical yield (${theoretical.trim()} ${theoreticalUnit}). The value has been calculated, but it is not a valid yield for a pure, dry product — see the interpretation below.`]
          : undefined,
      sections: [
        {
          title: "Given data",
          rows: [
            { label: "Actual yield obtained", value: actual.trim(), unit: actualUnit },
            { label: "Theoretical yield", value: theoretical.trim(), unit: theoreticalUnit },
          ],
        },
        {
          title: "Unit normalisation",
          lines: sameUnit
            ? [`Both yields are in ${actualUnit}; no conversion needed.`]
            : [],
          // Only the conversions actually applied — a value already in grams is left alone.
          formulas: sameUnit
            ? []
            : [
                ...(actualUnit !== "g" ? [`Actual yield = ${actual.trim()} ${actualUnit} = ${formatSig(actualG, 6)} g`] : []),
                ...(theoreticalUnit !== "g" ? [`Theoretical yield = ${theoretical.trim()} ${theoreticalUnit} = ${formatSig(theoreticalG, 6)} g`] : []),
              ],
        },
        { title: "Formula", formulas: ["Percentage yield = (Actual yield / Theoretical yield) × 100"] },
        {
          title: "Substitution",
          formulas: [
            `Percentage yield = (${formatSig(actualG, 6)} g / ${formatSig(theoreticalG, 6)} g) × 100`,
            `= ${formatSig(actualG / theoreticalG, 6)} × 100`,
            `= ${formatFixed(percent, DECIMALS)} %`,
          ],
        },
        {
          title: "Result",
          rows: [
            { label: "Actual yield", value: formatSig(actualG, 5), unit: "g" },
            { label: "Theoretical yield", value: formatSig(theoreticalG, 5), unit: "g" },
            { label: "Percentage yield", value: formatFixed(percent, DECIMALS), unit: "%" },
            lossG >= 0
              ? { label: "Product not recovered", value: formatSig(lossG, 4), unit: `g (${formatFixed(100 - percent, DECIMALS)} %)` }
              : { label: "Mass above theoretical", value: formatSig(-lossG, 4), unit: "g" },
          ],
        },
        { title: "Lab interpretation", lines: [`${reading.heading}. ${reading.detail}`] },
      ],
      notes: [
        "Weigh the product only after drying to constant weight.",
        "Interpretation bands are general teaching guidance, not an acceptance criterion for your experiment.",
      ],
    };
  }, [result, actual, actualUnit, theoretical, theoreticalUnit, sample]);

  const errors = {
    actual: fieldError(actual, { show: submitted, allowZero: true }),
    theoretical: theoretical.trim() !== "" && toNumber(theoretical) === 0
      ? "Theoretical yield cannot be zero."
      : fieldError(theoretical, { show: submitted }),
  };

  const calculate = () => {
    setSubmitted(true);
    window.requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const reset = () => {
    setActual(""); setActualUnit("g");
    setTheoretical(""); setTheoreticalUnit("g");
    setSample(""); setCarriedOver(null); setSubmitted(false);
  };

  return (
    <CalculatorShell
      title="Percentage Yield Calculator"
      subtitle="How much of the possible product you actually isolated from a laboratory preparation."
      icon={Percent}
      aside={
        <>
          <CalcAbout title="About percentage yield">
            <p>
              <strong>Percentage yield</strong> compares the mass of dry product you isolated with the
              theoretical yield — the most the limiting reactant could possibly give. It measures how much was
              lost to incomplete reaction, side reactions, transfers, filtration and purification.
            </p>
            <CalcList
              title="Record in your lab book"
              items={[
                "Mass of the empty container and of container + dry product",
                "Theoretical yield with its calculation",
                "Percentage yield to two decimal places",
                "A purity check — melting point or TLC",
              ]}
            />
            <CalcList
              tone="caution"
              title="Common mistakes"
              items={[
                "Weighing the product before it is fully dry",
                "Using the wrong limiting reactant for the theoretical yield",
                "Mixing mg and g — this page converts for you",
              ]}
            />
          </CalcAbout>
          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      {carriedOver && (
        <LabNotice tone="info" title="Theoretical yield carried over">
          {carriedOver} from the Theoretical Yield Calculator. You can still edit it.
        </LabNotice>
      )}

      <CalcSection title="Yields" description="Units are normalised automatically — mg, g and kg can be mixed.">
        <FieldGrid>
          <NumberField
            label="Actual yield obtained"
            value={actual}
            onChange={setActual}
            units={MASS_UNITS}
            unit={actualUnit}
            onUnitChange={(u) => setActualUnit(u as MassUnit)}
            min={0}
            error={errors.actual}
            hint="Mass of dry product weighed."
          />
          <NumberField
            label="Theoretical yield"
            value={theoretical}
            onChange={(value) => { setTheoretical(value); setCarriedOver(null); }}
            units={MASS_UNITS}
            unit={theoreticalUnit}
            onUnitChange={(u) => setTheoreticalUnit(u as MassUnit)}
            min={0}
            error={errors.theoretical}
            hint="Maximum possible mass from the limiting reactant."
          />
        </FieldGrid>

        <TextField
          label="Preparation / product name (optional)"
          value={sample}
          onChange={setSample}
          placeholder="e.g. Aspirin — Batch 2"
        />

        {result && result.percent > 100 && (
          <LabNotice tone="warning" title="Actual yield exceeds theoretical yield">
            A yield of {formatFixed(result.percent, DECIMALS)}% is not possible for a pure, dry product. Check that
            the product is dry, that it is free of solvent and excess reagent, and that the theoretical yield used
            the correct molecular weight and limiting reactant.
          </LabNotice>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => {
                  setActual(example.actual); setActualUnit(example.actualUnit);
                  setTheoretical(example.theoretical); setTheoreticalUnit(example.theoreticalUnit);
                  setCarriedOver(null);
                }}
                className="min-h-[36px] rounded-full border bg-background px-3 py-2 text-xs font-medium transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>

        <a
          href={calculatorHref("theoretical-yield-calculator", {})}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-blue-700 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Need the theoretical yield? Calculate it from the reaction
        </a>
      </CalcSection>

      <LabActions report={report} onCalculate={calculate} onReset={reset} fileName="percentage-yield" />

      <div ref={reportRef} className="scroll-mt-24">
        {report ? (
          <LabReport data={report} />
        ) : (
          <div className="rounded-[20px] border border-dashed bg-card p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Laboratory calculation card</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {submitted
                ? "Some values are missing or invalid — check the highlighted fields."
                : "Enter the actual and theoretical yields to see the percentage yield."}
            </p>
          </div>
        )}
      </div>

      <FormulaNote>
        <Formula>Percentage yield = (Actual yield / Theoretical yield) × 100</Formula>
        <p>
          Both yields must be in the same unit before dividing. This page converts mg and kg to grams first, so
          412 mg against a theoretical 0.520 g is (0.412 / 0.520) × 100 = 79.23%.
        </p>
        <p>
          The actual yield is always a measured mass of dry product. The theoretical yield is calculated from the
          limiting reactant and the balanced equation — use the Theoretical Yield Calculator if you have not
          worked it out.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          { q: "Why is my percentage yield over 100%?", a: "The solid weighed more than pure product could. It is almost always still damp or holding solvent, contaminated with a reagent or by-product, or the theoretical yield is wrong — for example the anhydrous MW was used for a hydrate. Dry to constant weight, check the melting point, and recheck the theoretical yield." },
          { q: "What is a good percentage yield in a student lab?", a: "It depends on the reaction and how many purification steps there are. A single recrystallisation typically costs 10–30% of the product, so yields of 60–85% are common for simple preparations such as aspirin. Purity matters as much as the number." },
          { q: "How many decimal places should I report?", a: "Two decimal places for the percentage is standard for a student record, and no more precise than your balance allows. Keep full precision during the calculation and round only the final answer." },
          { q: "Is percentage yield the same as percentage recovery?", a: "No. Yield compares product formed with what the reaction could form. Recovery compares what you got back with what you started with of the same substance — for example after an extraction or recrystallisation." },
        ]}
      />
    </CalculatorShell>
  );
}
