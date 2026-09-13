"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, RefreshCw, Thermometer } from "lucide-react";
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
    type ResultTone,
} from "@/components/calculators";

type TemperatureUnit = "C" | "F" | "K";

const UNIT_SYMBOL: Record<TemperatureUnit, string> = { C: "°C", F: "°F", K: "K" };
const UNIT_LABELS: Record<TemperatureUnit, string> = {
    C: "Celsius (°C)",
    F: "Fahrenheit (°F)",
    K: "Kelvin (K)",
};
const UNIT_ORDER: TemperatureUnit[] = ["C", "F", "K"];
const UNIT_OPTIONS = UNIT_ORDER.map((unit) => ({ value: unit, label: UNIT_LABELS[unit] }));

const COMMON_TEMPERATURES = [
    { label: "Room Temp", C: 25, F: 77, context: "Ideal for most medications" },
    { label: "Refrigerator", C: 4, F: 39.2, context: "2-8°C standard range" },
    { label: "Freezer", C: -20, F: -4, context: "Long-term storage" },
    { label: "Body Temp", C: 37, F: 98.6, context: "Normal human body" },
    { label: "Controlled Room", C: 20, F: 68, context: "USP controlled room temp" },
];

const DECIMAL_OPTIONS = [0, 1, 2].map((n) => ({ value: String(n), label: `${n} decimal${n !== 1 ? "s" : ""}` }));

const ABSOLUTE_ZERO_C = -273.15;

/* ── Conversion maths (unchanged): everything goes through Celsius ────────── */
function toCelsius(value: number, unit: TemperatureUnit): number {
    switch (unit) {
        case "C":
            return value;
        case "F":
            return ((value - 32) * 5) / 9;
        case "K":
            return value - 273.15;
    }
}

function fromCelsius(tempInC: number, unit: TemperatureUnit): number {
    switch (unit) {
        case "C":
            return tempInC;
        case "F":
            return (tempInC * 9) / 5 + 32;
        case "K":
            return tempInC + 273.15;
    }
}

/** Unchanged: round to a fixed number of decimal places. */
function formatNumber(num: number, decimals: number): string {
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(num * factor) / factor;
    return rounded.toString();
}

/** The storage band the previous page reported, with the same thresholds and wording. */
function storageCondition(tempC: number): { text: string; tone: ResultTone } {
    if (tempC <= -15) return { text: "Freezer storage - suitable for long-term preservation", tone: "success" };
    if (tempC >= 2 && tempC <= 8) return { text: "Refrigerated storage - maintain cold chain", tone: "success" };
    if (tempC >= 15 && tempC <= 25) return { text: "Controlled room temperature - most medications", tone: "success" };
    if (tempC > 25 && tempC <= 30) return { text: "Warm storage - monitor stability", tone: "warning" };
    if (tempC > 30) return { text: "Excessive heat - stability compromised", tone: "danger" };
    return { text: "Special storage conditions required", tone: "warning" };
}

const SCALE_MARKS = [-20, 0, 4, 8, 15, 20, 25, 30, 37];

const USP_DEFINITIONS = [
    { range: "-25°C to -10°C", label: "Freezer" },
    { range: "2°C to 8°C", label: "Refrigerator" },
    { range: "8°C to 15°C", label: "Cool" },
    { range: "15°C to 25°C", label: "Room Temperature" },
    { range: "20°C to 25°C", label: "Controlled Room Temp" },
    { range: "30°C to 40°C", label: "Warm" },
    { range: "40°C to 50°C", label: "Excessive Heat" },
];

const CRITICAL_GROUPS = [
    {
        title: "Cold storage",
        items: ["Vaccines: 2-8°C (35-46°F)", "Insulin: 2-8°C (unopened)", "Biologicals: 2-8°C", "Freezer: -20°C (-4°F)", "Ultra-low: -80°C (-112°F)"],
    },
    {
        title: "Room temperature",
        items: ["Controlled RT: 20-25°C", "Extended RT: 15-30°C", "Most oral solids: 15-30°C", "Opened insulin: ≤25°C", "Capsules: 15-25°C"],
    },
    {
        title: "Stability limits",
        items: ["Protein denaturation: >40°C", "Accelerated testing: 40°C", "Glass transition: varies", "Melting point: varies", "Degradation: >30°C"],
    },
];

const DEFAULTS = { value: "25", from: "C" as TemperatureUnit, to: "F" as TemperatureUnit, decimals: "1" };

export default function TemperatureConversionCalculator() {
    const [inputValue, setInputValue] = useState(DEFAULTS.value);
    const [inputUnit, setInputUnit] = useState<TemperatureUnit>(DEFAULTS.from);
    const [outputUnit, setOutputUnit] = useState<TemperatureUnit>(DEFAULTS.to);
    const [decimals, setDecimals] = useState(DEFAULTS.decimals);

    const places = parseInt(decimals);
    const parsed = parseFloat(inputValue);
    const belowAbsoluteZero = !isNaN(parsed) && toCelsius(parsed, inputUnit) < ABSOLUTE_ZERO_C;
    const inputError =
        inputValue.trim() !== "" && isNaN(parsed)
            ? "Enter a number."
            : belowAbsoluteZero
              ? "That is below absolute zero (−273.15 °C / −459.67 °F / 0 K)."
              : undefined;

    /*
     * Derived, not stored: the previous page kept the answer and the storage
     * band in state, refreshed from a useEffect. Same maths, same bands.
     */
    const result = useMemo(() => {
        const value = parseFloat(inputValue);
        if (isNaN(value)) return null;
        const tempInC = toCelsius(value, inputUnit);
        if (tempInC < ABSOLUTE_ZERO_C) return null;
        return {
            tempInC,
            converted: fromCelsius(tempInC, outputUnit),
            storage: storageCondition(tempInC),
        };
    }, [inputValue, inputUnit, outputUnit]);

    const reset = () => {
        setInputValue(DEFAULTS.value);
        setInputUnit(DEFAULTS.from);
        setOutputUnit(DEFAULTS.to);
        setDecimals(DEFAULTS.decimals);
    };

    return (
        <CalculatorShell
            title="Temperature Conversion Calculator"
            subtitle="Converts a temperature between Celsius, Fahrenheit and Kelvin, and tells you which medicine-storage band it falls in."
            icon={Thermometer}
            eyebrow="Unit Conversion"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Storage instructions, fridge logs and imported product leaflets do not always
                            use the same scale. This converter moves between °C, °F and K and places the
                            temperature against common pharmacy storage bands, so a reading can be checked
                            at a glance.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Reading a fridge or freezer log kept in °F",
                                "Checking an imported label's storage statement",
                                "Converting body temperature between °C and °F",
                                "Working in Kelvin for physical-chemistry or stability calculations",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Keep in mind"
                            items={[
                                "The storage band is a general guide — the product's own label or monograph always wins",
                                "Temperatures between the bands (e.g. 9–14 °C or −14–1 °C) are reported as needing special storage",
                                "A refrigerator must stay within 2–8 °C throughout, not just at the moment you check",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label={`In ${UNIT_LABELS[outputUnit].toLowerCase()}`}
                value={result ? formatNumber(result.converted, places) : null}
                unit={UNIT_SYMBOL[outputUnit]}
                interpretation={result?.storage.text}
                tone={result?.storage.tone ?? "neutral"}
                empty="Enter a temperature and choose the scales to convert between."
            />

            <CalcSection title="Convert">
                <NumberField
                    label={`Temperature (${UNIT_SYMBOL[inputUnit]})`}
                    value={inputValue}
                    onChange={setInputValue}
                    unit={UNIT_SYMBOL[inputUnit]}
                    step="0.1"
                    placeholder="Enter temperature"
                    hint="Negative values are fine for °C and °F — e.g. −20 for a freezer."
                    error={inputError}
                />

                <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                    <SelectField
                        label="From"
                        value={inputUnit}
                        onChange={(next) => setInputUnit(next as TemperatureUnit)}
                        options={UNIT_OPTIONS}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            setInputUnit(outputUnit);
                            setOutputUnit(inputUnit);
                        }}
                        aria-label="Swap the from and to units"
                        className="mx-auto h-12 w-12 sm:mx-0 sm:[&_svg]:rotate-90"
                    >
                        <ArrowUpDown />
                    </Button>
                    <SelectField
                        label="To"
                        value={outputUnit}
                        onChange={(next) => setOutputUnit(next as TemperatureUnit)}
                        options={UNIT_OPTIONS}
                    />
                </div>

                <FieldGrid>
                    <SelectField label="Decimal places" value={decimals} onChange={setDecimals} options={DECIMAL_OPTIONS} />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Common storage temperatures</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_TEMPERATURES.map((temp) => (
                            <button
                                key={temp.label}
                                type="button"
                                title={temp.context}
                                onClick={() => {
                                    setInputValue(temp.C.toString());
                                    setInputUnit("C");
                                    setOutputUnit("F");
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {temp.label}{" "}
                                <span className="font-normal text-muted-foreground">
                                    · {temp.C}°C / {temp.F}°F
                                </span>
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
                <CalcSection
                    title="On every scale"
                    description={`${inputValue} ${UNIT_SYMBOL[inputUnit]} expressed on each scale.`}
                >
                    <div>
                        {UNIT_ORDER.map((unit) => (
                            <ResultRow
                                key={unit}
                                label={UNIT_LABELS[unit]}
                                value={formatNumber(fromCelsius(result.tempInC, unit), places)}
                                unit={UNIT_SYMBOL[unit]}
                                badge={unit === outputUnit ? "Result" : unit === inputUnit ? "Input" : undefined}
                                badgeTone={unit === outputUnit ? "default" : "outline"}
                            />
                        ))}
                        <ResultRow label="Storage condition" value={result.storage.text} />
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Storage reference">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[10rem_minmax(0,1fr)]">
                    {/* The scale the previous page drew: -20 °C at the top to 40 °C at the bottom. */}
                    <div>
                        <p className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            Temperature scale
                        </p>
                        <div className="relative h-60 overflow-hidden rounded-xl bg-gradient-to-b from-blue-600 via-emerald-500 to-red-500">
                            {SCALE_MARKS.map((temp) => (
                                <div
                                    key={temp}
                                    className="absolute left-0 right-0 flex -translate-y-1/2 items-center"
                                    style={{ top: `${4 + ((temp + 20) / 60) * 92}%` }}
                                >
                                    <div className="h-px w-4 bg-white" />
                                    <div className="ml-2 text-xs font-semibold text-white [text-shadow:0_1px_2px_rgba(15,23,42,0.45)]">
                                        {temp}°C | {Math.round((temp * 9) / 5 + 32)}°F
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                            USP storage definitions
                        </p>
                        {USP_DEFINITIONS.map((item) => (
                            <ResultRow key={item.label} label={item.label} value={item.range} />
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {CRITICAL_GROUPS.map((group) => (
                        <div key={group.title} className="rounded-xl border border-border/70 bg-muted/40 p-4">
                            <CalcList title={group.title} items={group.items} />
                        </div>
                    ))}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>°F = (°C × 9/5) + 32</Formula>
                <Formula>°C = (°F − 32) × 5/9</Formula>
                <Formula>K = °C + 273.15</Formula>
                <p>
                    The calculator converts the input to Celsius first, then from Celsius to the target
                    scale. Fahrenheit needs both a scale factor (9/5, because a Fahrenheit degree is
                    smaller) and an offset (32, because water freezes at 32 °F). Kelvin uses Celsius-sized
                    degrees and only shifts the zero to absolute zero.
                </p>
                {result && (
                    <Formula>
                        {inputValue} {UNIT_SYMBOL[inputUnit]} → {formatNumber(result.tempInC, places)} °C →{" "}
                        {formatNumber(result.converted, places)} {UNIT_SYMBOL[outputUnit]}
                    </Formula>
                )}
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why is there no degree sign on Kelvin?",
                        a: "Kelvin is an absolute scale, so its unit is simply the kelvin (K). Writing “°K” was dropped from SI usage in 1967.",
                    },
                    {
                        q: "What does “controlled room temperature” mean?",
                        a: "In USP terms, a temperature maintained at 20–25 °C, with brief excursions between 15 and 30 °C allowed. Most tablets and capsules are labelled for it.",
                    },
                    {
                        q: "Is −40 the same in °C and °F?",
                        a: "Yes. −40 °C = −40 °F is the single point where the two scales meet — a handy check that a conversion formula is set up correctly.",
                    },
                    {
                        q: "A vaccine fridge read 46 °F. Is that a problem?",
                        a: "46 °F is 7.8 °C, which is inside 2–8 °C. Anything above 46.4 °F (8 °C) is an excursion and should be recorded and reported following your cold-chain procedure.",
                    },
                    {
                        q: "Why do some temperatures say “special storage conditions required”?",
                        a: "Readings that fall between the defined bands — above 8 °C but below 15 °C, or between −15 °C and 2 °C — do not match a standard storage category, so check the product's own labelling.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
