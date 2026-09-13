"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, RefreshCw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    FieldGrid,
    NumberField,
    SelectField,
    ResultCard,
    ResultRow,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    AdSlot,
    LabNotice,
} from "@/components/calculators";

type MassUnit = "mg" | "g" | "kg" | "lb" | "oz" | "mcg";

/* ── Conversion factors: how many milligrams are in one unit (unchanged) ──── */
const CONVERSION_FACTORS: Record<MassUnit, number> = {
    mg: 1,
    mcg: 0.001,
    g: 1000,
    kg: 1000000,
    lb: 453592.37,
    oz: 28349.5231,
};

const UNIT_LABELS: Record<MassUnit, string> = {
    mg: "Milligram (mg)",
    mcg: "Microgram (mcg)",
    g: "Gram (g)",
    kg: "Kilogram (kg)",
    lb: "Pound (lb)",
    oz: "Ounce (oz)",
};

/** Listed smallest to largest, which is how the "every unit" table reads best. */
const UNIT_ORDER: MassUnit[] = ["mcg", "mg", "g", "kg", "oz", "lb"];

const UNIT_OPTIONS = UNIT_ORDER.map((unit) => ({ value: unit, label: UNIT_LABELS[unit] }));

const COMMON_CONVERSIONS: { from: MassUnit; to: MassUnit; value: number }[] = [
    { from: "mg", to: "g", value: 1000 },
    { from: "g", to: "mg", value: 500 },
    { from: "kg", to: "lb", value: 1 },
    { from: "lb", to: "kg", value: 2.2 },
    { from: "oz", to: "g", value: 28.35 },
];

const PRECISION_OPTIONS = [2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n} digits` }));

/**
 * Unchanged from the previous page. Below 10,000 and above 0.001 the number is
 * rounded to `precision` decimal places; outside that band it switches to
 * scientific notation with `precision` significant figures.
 */
function formatNumber(num: number, precision: number): string {
    if (num === 0) return "0";
    if (Math.abs(num) >= 10000 || (Math.abs(num) < 0.001 && num !== 0)) {
        return num.toExponential(precision - 1);
    }
    const factor = Math.pow(10, precision);
    const rounded = Math.round(num * factor) / factor;
    return rounded.toString();
}

/** Context notes the previous page showed for particular unit pairs. */
function pharmacyGuideline(from: MassUnit, to: MassUnit): string | null {
    if (from === "mg" && to === "g") return "For oral solid dosage forms, typical tablet strengths range from 1mg to 1000mg";
    if (from === "mcg" && to === "mg") return "Microgram to milligram conversions are critical for potent drugs like levothyroxine";
    if (from === "g" && to === "mg") return "1 gram = 1000 milligrams. Verify calculations for compounding accuracy.";
    if (from === "kg" && to === "lb") return "Body weight conversions: important for pediatric and weight-based dosing";
    if (from === "lb" && to === "kg") return "Always use kilograms for medication dosing calculations";
    return null;
}

const COMMON_EQUIVALENTS = [
    { label: "1 kilogram (kg)", value: "2.20462 pounds (lb)" },
    { label: "1 pound (lb)", value: "453.592 grams (g)" },
    { label: "1 ounce (oz)", value: "28.3495 grams (g)" },
    { label: "1 grain (gr)", value: "64.7989 milligrams (mg)" },
    { label: "1 gram (g)", value: "1000 milligrams (mg)" },
];

const REFERENCE_GROUPS = [
    { title: "Metric system", items: ["1 kg = 1000 g", "1 g = 1000 mg", "1 mg = 1000 mcg", "Base unit: gram (g)"] },
    { title: "Imperial system", items: ["1 lb = 16 oz", "1 oz = 28.35 g", "1 lb = 453.59 g", "1 grain = 64.8 mg"] },
    {
        title: "Apothecary (pharmacy)",
        items: ["1 scruple = 20 grains", "1 drachm = 60 grains", "1 ounce (apoth) = 480 grains", "1 pound (apoth) = 5760 grains"],
    },
];

const DEFAULTS = { value: "100", from: "mg" as MassUnit, to: "g" as MassUnit, precision: "4" };

export default function MassConversionCalculator() {
    const [inputValue, setInputValue] = useState(DEFAULTS.value);
    const [inputUnit, setInputUnit] = useState<MassUnit>(DEFAULTS.from);
    const [outputUnit, setOutputUnit] = useState<MassUnit>(DEFAULTS.to);
    const [precision, setPrecision] = useState(DEFAULTS.precision);

    const sigFigs = parseInt(precision);
    const trimmed = inputValue.trim();
    const parsed = parseFloat(inputValue);
    const inputError =
        trimmed !== "" && isNaN(parsed)
            ? "Enter a number."
            : parsed < 0
              ? "A mass cannot be negative."
              : undefined;

    /*
     * Derived, not stored: the previous page kept the answer in state and
     * refreshed it from a useEffect. The arithmetic is untouched — convert to
     * milligrams, then divide by the target unit's milligram factor.
     */
    const result = useMemo(() => {
        const value = parseFloat(inputValue);
        if (isNaN(value) || value < 0) return null;
        const valueInMg = value * CONVERSION_FACTORS[inputUnit];
        const converted = valueInMg / CONVERSION_FACTORS[outputUnit];
        if (!Number.isFinite(converted)) return null;
        return { valueInMg, converted };
    }, [inputValue, inputUnit, outputUnit]);

    const guideline = result ? pharmacyGuideline(inputUnit, outputUnit) : null;

    const swap = () => {
        setInputUnit(outputUnit);
        setOutputUnit(inputUnit);
    };

    const reset = () => {
        setInputValue(DEFAULTS.value);
        setInputUnit(DEFAULTS.from);
        setOutputUnit(DEFAULTS.to);
        setPrecision(DEFAULTS.precision);
    };

    return (
        <CalculatorShell
            title="Mass Conversion Calculator"
            subtitle="Converts a mass between micrograms, milligrams, grams, kilograms, ounces and pounds — for doses, weighing and body weight."
            icon={Scale}
            eyebrow="Unit Conversion"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Drug doses are written in micrograms, milligrams or grams, while body weight
                            may arrive in pounds. A slipped decimal point between these units is one of the
                            most common — and most dangerous — dosing errors, so it pays to convert
                            deliberately and check the answer.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Turning a prescribed dose into the units printed on the label",
                                "Converting a patient's weight from pounds to kilograms",
                                "Weighing ingredients for a compounded preparation",
                                "Checking a mcg ↔ mg step for a potent drug",
                            ]}
                        />
                        <CalcList
                            title="Rounding"
                            items={[
                                "Use 4+ decimals for compounding",
                                "Use 2-3 decimals for dosing",
                                "Always round at final step",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch out for"
                            items={[
                                "Write “mcg”, not “µg” — a handwritten µ is easily misread as “m”",
                                "Never add a trailing zero (5.0 mg) or omit a leading one (.5 mg)",
                                "Apothecary ounces and pounds differ from the avoirdupois units used here",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label={`In ${UNIT_LABELS[outputUnit].toLowerCase()}`}
                value={result ? formatNumber(result.converted, sigFigs) : null}
                unit={outputUnit}
                interpretation={
                    result ? `${inputValue} ${inputUnit} = ${formatNumber(result.converted, sigFigs)} ${outputUnit}` : undefined
                }
                empty="Enter a mass and choose the units to convert between."
            />

            {guideline && <LabNotice title="Pharmacy note">{guideline}</LabNotice>}

            <CalcSection title="Convert">
                <NumberField
                    label={`Mass to convert (${inputUnit})`}
                    value={inputValue}
                    onChange={setInputValue}
                    unit={inputUnit}
                    placeholder="Enter mass value"
                    hint="Any positive number. Decimals are fine — 0.25, 2.2, 1500."
                    error={inputError}
                />

                <UnitPair
                    from={inputUnit}
                    to={outputUnit}
                    options={UNIT_OPTIONS}
                    onFrom={(next) => setInputUnit(next as MassUnit)}
                    onTo={(next) => setOutputUnit(next as MassUnit)}
                    onSwap={swap}
                />

                <FieldGrid>
                    <SelectField
                        label="Precision"
                        value={precision}
                        onChange={setPrecision}
                        options={PRECISION_OPTIONS}
                        hint="Decimal places shown. Very large or small answers switch to scientific notation."
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Common pharmacy conversions</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_CONVERSIONS.map((conv) => (
                            <button
                                key={`${conv.value}-${conv.from}-${conv.to}`}
                                type="button"
                                onClick={() => {
                                    setInputUnit(conv.from);
                                    setOutputUnit(conv.to);
                                    setInputValue(conv.value.toString());
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {conv.value} {conv.from} → {conv.to}
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="In every unit" description={`${inputValue} ${inputUnit} expressed in each unit.`}>
                    <div>
                        {UNIT_ORDER.map((unit) => (
                            <ResultRow
                                key={unit}
                                label={UNIT_LABELS[unit]}
                                value={formatNumber(result.valueInMg / CONVERSION_FACTORS[unit], sigFigs)}
                                unit={unit}
                                badge={unit === outputUnit ? "Result" : unit === inputUnit ? "Input" : undefined}
                                badgeTone={unit === outputUnit ? "default" : "outline"}
                            />
                        ))}
                        <ResultRow
                            label="Conversion factor"
                            value={`1 ${inputUnit} = ${(CONVERSION_FACTORS[outputUnit] / CONVERSION_FACTORS[inputUnit]).toFixed(6)} ${outputUnit}`}
                        />
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Reference">
                <div>
                    <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Common equivalents
                    </p>
                    {COMMON_EQUIVALENTS.map((item) => (
                        <ResultRow key={item.label} label={item.label} value={item.value} />
                    ))}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {REFERENCE_GROUPS.map((group) => (
                        <div key={group.title} className="rounded-xl border border-border/70 bg-muted/40 p-4">
                            <CalcList title={group.title} items={group.items} />
                        </div>
                    ))}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>result = value × (mg in 1 “from” unit) ÷ (mg in 1 “to” unit)</Formula>
                <p>
                    Every unit is first turned into milligrams, then divided into the target unit. Going
                    through one base unit means only one factor per unit is needed, instead of one for
                    every pair.
                </p>
                <div>
                    {UNIT_ORDER.map((unit) => (
                        <ResultRow key={unit} label={`1 ${unit}`} value={String(CONVERSION_FACTORS[unit])} unit="mg" />
                    ))}
                </div>
                {result && (
                    <Formula>
                        {inputValue} × {CONVERSION_FACTORS[inputUnit]} ÷ {CONVERSION_FACTORS[outputUnit]} ={" "}
                        {formatNumber(result.converted, sigFigs)} {outputUnit}
                    </Formula>
                )}
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "How many milligrams are in a gram?",
                        a: "1000. Each step in the metric ladder — kg, g, mg, mcg — is a factor of 1000, so moving one step down multiplies by 1000 and one step up divides by 1000.",
                    },
                    {
                        q: "Why does the answer sometimes show “e”?",
                        a: "Answers of 10,000 or more, or smaller than 0.001, are shown in scientific notation: 5.000e-10 means 5.000 × 10⁻¹⁰. It keeps very large and very small numbers readable without a long run of zeros.",
                    },
                    {
                        q: "Should I convert pounds to kilograms before dosing?",
                        a: "Yes. Weight-based doses (mg/kg) are written per kilogram. Divide pounds by about 2.2046 — or use this calculator — and dose from the kilogram figure.",
                    },
                    {
                        q: "Is the ounce here the same as a pharmacy ounce?",
                        a: "No. This calculator uses the avoirdupois ounce (28.35 g), the everyday unit. The apothecary ounce is 480 grains, about 31.1 g, and appears only in old formulas.",
                    },
                    {
                        q: "What is a grain?",
                        a: "An old apothecary unit of about 64.8 mg, still seen on some aspirin and thyroid labels. It is listed in the reference section rather than the converter.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}

/**
 * From → swap → To. Stacked on a phone so the full unit names fit; one row from
 * `sm` up. The swap button flips direction without retyping the value.
 */
function UnitPair({
    from,
    to,
    options,
    onFrom,
    onTo,
    onSwap,
}: {
    from: string;
    to: string;
    options: { value: string; label: string }[];
    onFrom: (value: string) => void;
    onTo: (value: string) => void;
    onSwap: () => void;
}) {
    return (
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <SelectField label="From" value={from} onChange={onFrom} options={options} />
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onSwap}
                aria-label="Swap the from and to units"
                className="mx-auto h-12 w-12 sm:mx-0 sm:[&_svg]:rotate-90"
            >
                <ArrowUpDown />
            </Button>
            <SelectField label="To" value={to} onChange={onTo} options={options} />
        </div>
    );
}
