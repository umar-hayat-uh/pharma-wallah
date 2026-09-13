"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, Droplets, RefreshCw } from "lucide-react";
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

type VolumeUnit = "mL" | "L" | "μL" | "m³" | "gal" | "fl oz" | "tsp" | "tbsp";

/* ── Conversion factors: how many millilitres are in one unit (unchanged) ─── */
const CONVERSION_FACTORS: Record<VolumeUnit, number> = {
    μL: 0.001,
    mL: 1,
    L: 1000,
    "m³": 1000000,
    tsp: 4.92892,
    tbsp: 14.7868,
    "fl oz": 29.5735,
    gal: 3785.41,
};

const UNIT_LABELS: Record<VolumeUnit, string> = {
    μL: "Microliter (μL)",
    mL: "Milliliter (mL)",
    L: "Liter (L)",
    "m³": "Cubic Meter (m³)",
    tsp: "Teaspoon (tsp)",
    tbsp: "Tablespoon (tbsp)",
    "fl oz": "Fluid Ounce (fl oz)",
    gal: "Gallon (gal)",
};

/** Metric units first, smallest to largest, then the US customary measures. */
const UNIT_ORDER: VolumeUnit[] = ["μL", "mL", "L", "m³", "tsp", "tbsp", "fl oz", "gal"];

const UNIT_OPTIONS = UNIT_ORDER.map((unit) => ({ value: unit, label: UNIT_LABELS[unit] }));

const COMMON_CONVERSIONS: { from: VolumeUnit; to: VolumeUnit; value: number }[] = [
    { from: "mL", to: "L", value: 1000 },
    { from: "L", to: "mL", value: 2.5 },
    { from: "tsp", to: "mL", value: 1 },
    { from: "tbsp", to: "mL", value: 1 },
    { from: "fl oz", to: "mL", value: 30 },
];

const IV_BAG_SIZES = [
    { size: "50 mL", type: "Pediatric" },
    { size: "100 mL", type: "Small Volume" },
    { size: "250 mL", type: "Standard" },
    { size: "500 mL", type: "Large Volume" },
    { size: "1000 mL", type: "Liter Bag" },
    { size: "3000 mL", type: "TPN" },
    { size: "5 mL", type: "Vial" },
    { size: "10 mL", type: "Syringe" },
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

/** Context notes the previous page showed for the target unit. */
function ivGuideline(to: VolumeUnit): string | null {
    if (to === "mL") return "For IV push medications, verify total volume does not exceed recommended limits";
    if (to === "L") return "Large volume parenterals require strict aseptic technique";
    if (to === "μL") return "Microvolume measurements require calibrated micropipettes";
    if (to.includes("tsp")) return "Use oral syringes for accurate teaspoon measurements";
    return null;
}

const VOLUME_EQUIVALENTS = [
    { label: "1 teaspoon (tsp)", value: "5 mL" },
    { label: "1 tablespoon (tbsp)", value: "15 mL" },
    { label: "1 fluid ounce (fl oz)", value: "30 mL" },
    { label: "1 cup (medical)", value: "240 mL" },
    { label: "1 pint (pt)", value: "473 mL" },
    { label: "1 quart (qt)", value: "946 mL" },
    { label: "1 gallon (gal)", value: "3785 mL" },
    { label: "1 drop (gtt)", value: "0.05 mL" },
];

const DROP_RATES = [
    { label: "Macrodrip (10 gtt/mL)", value: "1 mL = 10 drops" },
    { label: "Microdrip (60 gtt/mL)", value: "1 mL = 60 drops" },
    { label: "Blood (15 gtt/mL)", value: "1 mL = 15 drops" },
];

const REFERENCE_GROUPS = [
    { title: "Metric volume", items: ["1 L = 1000 mL", "1 mL = 1000 μL", "1 m³ = 1000 L", "Base unit: liter (L)"] },
    { title: "US customary", items: ["1 tsp = 5 mL", "1 tbsp = 15 mL", "1 fl oz = 30 mL", "1 cup = 240 mL"] },
    {
        title: "Pharmacy measures",
        items: ["1 minim = 0.0616 mL", "1 fluid drachm = 3.697 mL", "1 fluid ounce = 29.57 mL", "1 pint = 473.176 mL"],
    },
];

const DEFAULTS = { value: "100", from: "mL" as VolumeUnit, to: "L" as VolumeUnit, precision: "4" };

const CHIP =
    "min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent";

export default function VolumeConversionCalculator() {
    const [inputValue, setInputValue] = useState(DEFAULTS.value);
    const [inputUnit, setInputUnit] = useState<VolumeUnit>(DEFAULTS.from);
    const [outputUnit, setOutputUnit] = useState<VolumeUnit>(DEFAULTS.to);
    const [precision, setPrecision] = useState(DEFAULTS.precision);

    const sigFigs = parseInt(precision);
    const parsed = parseFloat(inputValue);
    const inputError =
        inputValue.trim() !== "" && isNaN(parsed)
            ? "Enter a number."
            : parsed < 0
              ? "A volume cannot be negative."
              : undefined;

    /*
     * Derived, not stored: the previous page kept the answer in state and
     * refreshed it from a useEffect. The arithmetic is untouched — convert to
     * millilitres, then divide by the target unit's millilitre factor.
     */
    const result = useMemo(() => {
        const value = parseFloat(inputValue);
        if (isNaN(value) || value < 0) return null;
        const valueInMl = value * CONVERSION_FACTORS[inputUnit];
        const converted = valueInMl / CONVERSION_FACTORS[outputUnit];
        if (!Number.isFinite(converted)) return null;
        return { valueInMl, converted };
    }, [inputValue, inputUnit, outputUnit]);

    const guideline = result ? ivGuideline(outputUnit) : null;

    const reset = () => {
        setInputValue(DEFAULTS.value);
        setInputUnit(DEFAULTS.from);
        setOutputUnit(DEFAULTS.to);
        setPrecision(DEFAULTS.precision);
    };

    return (
        <CalculatorShell
            title="Volume Conversion Calculator"
            subtitle="Converts a volume between microlitres, millilitres, litres, cubic metres and household measures — for IV preparations, oral liquids and compounding."
            icon={Droplets}
            eyebrow="Unit Conversion"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Infusion bags are labelled in millilitres or litres, micropipettes in
                            microlitres, and patients still describe oral doses in teaspoons. This
                            converter moves a volume between all of them through one base unit, the
                            millilitre.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Checking the volume of an IV bag, vial or syringe in another unit",
                                "Translating a teaspoon or tablespoon dose into millilitres",
                                "Scaling a compounding formula between mL and L",
                                "Setting a micropipette volume in μL",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch out for"
                            items={[
                                "Household spoons vary widely — dispense oral liquids with an oral syringe",
                                "The exact US teaspoon (4.93 mL) differs from the rounded 5 mL used on labels",
                                "US and imperial (UK) fluid ounces and gallons are different sizes; this tool uses US units",
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
                empty="Enter a volume and choose the units to convert between."
            />

            {guideline && <LabNotice title="IV preparation note">{guideline}</LabNotice>}

            <CalcSection title="Convert">
                <NumberField
                    label={`Volume to convert (${inputUnit})`}
                    value={inputValue}
                    onChange={setInputValue}
                    unit={inputUnit}
                    placeholder="Enter volume value"
                    hint="Any positive number. Decimals are fine — 0.25, 2.5, 1000."
                    error={inputError}
                />

                <UnitPair
                    from={inputUnit}
                    to={outputUnit}
                    options={UNIT_OPTIONS}
                    onFrom={(next) => setInputUnit(next as VolumeUnit)}
                    onTo={(next) => setOutputUnit(next as VolumeUnit)}
                    onSwap={() => {
                        setInputUnit(outputUnit);
                        setOutputUnit(inputUnit);
                    }}
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
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Common conversions</p>
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
                                className={CHIP}
                            >
                                {conv.value} {conv.from} → {conv.to}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Common IV bag sizes <span className="font-normal">— sets the volume in mL</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {IV_BAG_SIZES.map((bag) => (
                            <button
                                key={bag.size}
                                type="button"
                                onClick={() => {
                                    const match = bag.size.match(/(\d+)/);
                                    if (match) {
                                        setInputValue(match[1]);
                                        setInputUnit("mL");
                                    }
                                }}
                                className={CHIP}
                            >
                                {bag.size} <span className="font-normal text-muted-foreground">· {bag.type}</span>
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
                                value={formatNumber(result.valueInMl / CONVERSION_FACTORS[unit], sigFigs)}
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
                <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    <div>
                        <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            Volume equivalents
                        </p>
                        {VOLUME_EQUIVALENTS.map((item) => (
                            <ResultRow key={item.label} label={item.label} value={item.value} />
                        ))}
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            Drop rate reference
                        </p>
                        {DROP_RATES.map((item) => (
                            <ResultRow key={item.label} label={item.label} value={item.value} />
                        ))}
                    </div>
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
                <Formula>result = value × (mL in 1 “from” unit) ÷ (mL in 1 “to” unit)</Formula>
                <p>
                    Every unit is first turned into millilitres, then divided into the target unit. Going
                    through one base unit means only one factor per unit is needed, instead of one for
                    every pair.
                </p>
                <div>
                    {UNIT_ORDER.map((unit) => (
                        <ResultRow key={unit} label={`1 ${unit}`} value={String(CONVERSION_FACTORS[unit])} unit="mL" />
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
                        q: "Is 1 teaspoon 5 mL or 4.93 mL?",
                        a: "Both, depending on context. The exact US teaspoon is 4.92892 mL, which this converter uses. Prescriptions and medicine labels round it to 5 mL, which is what the reference table shows — dose from the label's 5 mL figure.",
                    },
                    {
                        q: "How many microlitres are in a millilitre?",
                        a: "1000. Each step from L to mL to μL is a factor of 1000. A 200 μL pipette setting is 0.2 mL.",
                    },
                    {
                        q: "Why does the answer sometimes show “e”?",
                        a: "Answers of 10,000 or more, or smaller than 0.001, are shown in scientific notation: 6.604e-8 means 6.604 × 10⁻⁸. It keeps very large and very small numbers readable.",
                    },
                    {
                        q: "How do drops (gtt) relate to millilitres?",
                        a: "It depends on the giving set's drop factor: a macrodrip set delivers 10–20 drops per mL, a microdrip set 60, and blood sets usually 15. A free-falling dropper is roughly 20 drops per mL (0.05 mL a drop).",
                    },
                    {
                        q: "Is a gallon here a US or a UK gallon?",
                        a: "US. The US gallon is 3.785 L; the imperial (UK) gallon is 4.546 L. Fluid ounces differ too (29.57 mL US vs 28.41 mL UK).",
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
