"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown, PieChart, RefreshCw } from "lucide-react";
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

type StrengthFormat = "percent" | "ratio" | "wv" | "ww" | "vv";
type MassUnit = "mg" | "g";
type VolumeUnit = "mL" | "L";

const FORMAT_LABELS: Record<StrengthFormat, string> = {
    percent: "Percentage (%)",
    ratio: "Ratio Strength (1:X)",
    wv: "Weight/Volume (wv)",
    ww: "Weight/Weight (ww)",
    vv: "Volume/Volume (vv)",
};

const FORMAT_ORDER: StrengthFormat[] = ["percent", "ratio", "wv", "ww", "vv"];
const FORMAT_OPTIONS = FORMAT_ORDER.map((f) => ({ value: f, label: FORMAT_LABELS[f] }));

const COMMON_STRENGTHS: { label: string; value: string; format: StrengthFormat }[] = [
    { label: "1% Solution", value: "1", format: "percent" },
    { label: "1:1000 Ratio", value: "1000", format: "ratio" },
    { label: "5 mg/mL", value: "5", format: "wv" },
    { label: "0.1% ww", value: "0.1", format: "percent" },
    { label: "10% Solution", value: "10", format: "percent" },
];

/** Plain-language reading of what to type for each input format. */
const INPUT_HINTS: Record<StrengthFormat, string> = {
    percent: "The percentage, e.g. 0.9 for normal saline.",
    ratio: "Only the X of 1:X — for 1:1000 adrenaline, enter 1000.",
    wv: "Mass of solute per volume, in the mass and volume units chosen below.",
    ww: "Mass of solute per mass, in the mass unit chosen below.",
    vv: "Volume percentage of a liquid solute — uses the density below.",
};

const CLINICAL_APPLICATIONS: Record<StrengthFormat, string> = {
    percent: "Percentage strengths are commonly used for topical preparations and solutions.",
    ratio: "Ratio strengths are often used for dilute solutions (e.g., epinephrine 1:1000).",
    wv: "Weight/volume is standard for solutions where solute is solid and solvent is liquid.",
    ww: "Weight/weight is used for ointments, creams, and other semisolid preparations.",
    vv: "Volume/volume is used for liquid-liquid mixtures (e.g., alcohol solutions).",
};

/**
 * The previous page's conversion, unchanged: every format is turned into a
 * percentage first, then the percentage into the output format, and the answer
 * is printed to 4 decimal places followed by its unit.
 */
function convertStrength(
    value: number,
    densityVal: number,
    inputFormat: StrengthFormat,
    outputFormat: StrengthFormat,
    massUnit: MassUnit,
    volumeUnit: VolumeUnit,
): { percentage: number; number: string; unit: string } | null {
    let percentage: number;
    switch (inputFormat) {
        case "percent":
            percentage = value;
            break;
        case "ratio":
            percentage = (1 / value) * 100;
            break;
        case "wv":
            percentage = (value / (massUnit === "mg" ? 10 : 10000)) * (volumeUnit === "mL" ? 1 : 0.001);
            break;
        case "ww":
            percentage = value / (massUnit === "mg" ? 10 : 10000);
            break;
        case "vv":
            percentage = value * densityVal;
            break;
    }

    let result: number;
    let unit: string;
    switch (outputFormat) {
        case "percent":
            result = percentage;
            unit = "%";
            break;
        case "ratio":
            result = 100 / percentage;
            unit = `1:${result.toFixed(0)}`;
            break;
        case "wv":
            result = percentage * (massUnit === "mg" ? 10 : 10000) * (volumeUnit === "mL" ? 1 : 1000);
            unit = `${massUnit}/${volumeUnit}`;
            break;
        case "ww":
            result = percentage * (massUnit === "mg" ? 10 : 10000);
            unit = `${massUnit}/${massUnit}`;
            break;
        case "vv":
            result = percentage / densityVal;
            unit = "vv";
            break;
    }

    // The old page printed "NaN" / "Infinity" here; show nothing instead.
    if (!Number.isFinite(result) || !Number.isFinite(percentage)) return null;
    return { percentage, number: result.toFixed(4), unit };
}

const COMMON_EQUIVALENTS = [
    { strength: "1%", equivalent: "1 g/100 mL", type: "wv" },
    { strength: "1:100", equivalent: "1%", type: "ratio" },
    { strength: "1 mg/mL", equivalent: "0.1%", type: "wv" },
    { strength: "5%", equivalent: "50 mg/mL", type: "wv" },
    { strength: "0.1%", equivalent: "1 mg/mL", type: "wv" },
    { strength: "1:1000", equivalent: "0.1%", type: "ratio" },
    { strength: "1:10,000", equivalent: "0.01%", type: "ratio" },
];

const REFERENCE_GROUPS = [
    {
        title: "Percentage strengths",
        items: ["1% = 1 g/100 mL (wv)", "1% = 1 g/100 g (ww)", "1% = 1 mL/100 mL (vv)", "For wv: % = (g solute/100 mL) × 100"],
    },
    {
        title: "Ratio strengths",
        items: ["1:X means 1 part in X parts total", "1:1000 = 0.1%", "1:10,000 = 0.01%", "Convert to %: (1/X) × 100"],
    },
    { title: "Weight/volume", items: ["Common format: mg/mL", "1 mg/mL = 0.1%", "10 mg/mL = 1%", "50 mg/mL = 5%"] },
];

const DEFAULTS = {
    value: "1",
    from: "percent" as StrengthFormat,
    to: "ratio" as StrengthFormat,
    mass: "mg" as MassUnit,
    volume: "mL" as VolumeUnit,
    density: "1",
};

export default function StrengthConversionCalculator() {
    const [inputValue, setInputValue] = useState(DEFAULTS.value);
    const [inputFormat, setInputFormat] = useState<StrengthFormat>(DEFAULTS.from);
    const [outputFormat, setOutputFormat] = useState<StrengthFormat>(DEFAULTS.to);
    const [massUnit, setMassUnit] = useState<MassUnit>(DEFAULTS.mass);
    const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>(DEFAULTS.volume);
    const [density, setDensity] = useState(DEFAULTS.density);

    const usesDensity = inputFormat === "vv" || outputFormat === "vv";

    const parsedValue = parseFloat(inputValue);
    const valueError =
        inputValue.trim() !== "" && isNaN(parsedValue)
            ? "Enter a number."
            : parsedValue <= 0
              ? "A strength must be greater than zero."
              : undefined;
    const parsedDensity = parseFloat(density);
    const densityError =
        density.trim() === "" ? "Enter the density." : parsedDensity <= 0 ? "Density must be greater than zero." : undefined;

    /* Derived, not stored — the previous page refreshed state from a useEffect. */
    const conversion = useMemo(() => {
        const value = parseFloat(inputValue);
        const densityVal = parseFloat(density);
        if (isNaN(value) || value <= 0) return null;

        const main = convertStrength(value, densityVal, inputFormat, outputFormat, massUnit, volumeUnit);
        if (!main) return null;

        const all = FORMAT_ORDER.map((format) => ({
            format,
            converted: convertStrength(value, densityVal, inputFormat, format, massUnit, volumeUnit),
        }));
        return { main, all };
    }, [inputValue, inputFormat, outputFormat, massUnit, volumeUnit, density]);

    const reset = () => {
        setInputValue(DEFAULTS.value);
        setInputFormat(DEFAULTS.from);
        setOutputFormat(DEFAULTS.to);
        setMassUnit(DEFAULTS.mass);
        setVolumeUnit(DEFAULTS.volume);
        setDensity(DEFAULTS.density);
    };

    return (
        <CalculatorShell
            title="Strength Conversion Calculator"
            subtitle="Converts a concentration between percentage, ratio strength (1:X), weight/volume, weight/weight and volume/volume — for compounding and reading labels."
            icon={PieChart}
            eyebrow="Unit Conversion"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            The same concentration can be written several ways: adrenaline as 1:1000,
                            0.1% or 1 mg/mL. Pharmacists move between these constantly when compounding,
                            checking labels and diluting stock solutions. This tool converts each format
                            to a percentage first, then into the format you need.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Turning a ratio strength such as 1:1000 into a percentage or mg/mL",
                                "Checking how many mg/mL a percentage solution contains",
                                "Preparing a compounding record that states strength in another format",
                            ]}
                        />
                        <CalcList
                            title="Compounding tips"
                            items={[
                                "Always verify the final concentration matches prescription",
                                "Use appropriate precision for balance measurements",
                                "Document all calculations in compounding record",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Check before relying on it"
                            items={[
                                "Ratio strengths are dangerous to misread — confirm 1:1000 vs 1:10,000 before any injection",
                                "The mass unit and volume unit you choose change the w/v and w/w figures",
                                "Volume/volume conversions depend on the density you enter",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label={FORMAT_LABELS[outputFormat]}
                value={conversion ? conversion.main.number : null}
                unit={conversion?.main.unit}
                interpretation={
                    conversion
                        ? `This represents the concentration in ${FORMAT_LABELS[outputFormat].toLowerCase()} format`
                        : undefined
                }
                empty="Enter a strength greater than zero and choose the formats to convert between."
            />

            {conversion && <LabNotice title="Clinical application">{CLINICAL_APPLICATIONS[outputFormat]}</LabNotice>}

            <CalcSection title="Convert">
                <NumberField
                    label={`Strength (${FORMAT_LABELS[inputFormat]})`}
                    value={inputValue}
                    onChange={setInputValue}
                    step="0.001"
                    placeholder="Enter strength value"
                    hint={INPUT_HINTS[inputFormat]}
                    error={valueError}
                />

                <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                    <SelectField
                        label="From format"
                        value={inputFormat}
                        onChange={(next) => setInputFormat(next as StrengthFormat)}
                        options={FORMAT_OPTIONS}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            setInputFormat(outputFormat);
                            setOutputFormat(inputFormat);
                        }}
                        aria-label="Swap the from and to formats"
                        className="mx-auto h-12 w-12 sm:mx-0 sm:[&_svg]:rotate-90"
                    >
                        <ArrowUpDown />
                    </Button>
                    <SelectField
                        label="To format"
                        value={outputFormat}
                        onChange={(next) => setOutputFormat(next as StrengthFormat)}
                        options={FORMAT_OPTIONS}
                    />
                </div>

                <FieldGrid>
                    <SelectField
                        label="Mass unit"
                        value={massUnit}
                        onChange={(next) => setMassUnit(next as MassUnit)}
                        options={["mg", "g"]}
                        hint="Used by the weight/volume and weight/weight formats."
                    />
                    <SelectField
                        label="Volume unit"
                        value={volumeUnit}
                        onChange={(next) => setVolumeUnit(next as VolumeUnit)}
                        options={["mL", "L"]}
                        hint="Used by the weight/volume format."
                    />
                </FieldGrid>

                {usesDensity && (
                    <FieldGrid>
                        <NumberField
                            label="Density (g/mL)"
                            value={density}
                            onChange={setDensity}
                            unit="g/mL"
                            step="0.001"
                            placeholder="Enter density"
                            hint="Required for accurate vv conversions. Water is 1.000; ethanol about 0.789."
                            error={densityError}
                        />
                    </FieldGrid>
                )}

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Common pharmacy strengths</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_STRENGTHS.map((strength) => (
                            <button
                                key={strength.label}
                                type="button"
                                onClick={() => {
                                    setInputValue(strength.value);
                                    setInputFormat(strength.format);
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {strength.label}
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {conversion && (
                <CalcSection
                    title="In every format"
                    description={`${inputValue} as ${FORMAT_LABELS[inputFormat].toLowerCase()}, with ${massUnit} and ${volumeUnit}.`}
                >
                    <div>
                        <ResultRow
                            label="Step 1 — as a percentage"
                            value={conversion.main.percentage.toFixed(4)}
                            unit="%"
                        />
                        {conversion.all.map(({ format, converted }) => (
                            <ResultRow
                                key={format}
                                label={FORMAT_LABELS[format]}
                                value={converted ? converted.number : "—"}
                                unit={converted?.unit}
                                badge={format === outputFormat ? "Result" : format === inputFormat ? "Input" : undefined}
                                badgeTone={format === outputFormat ? "default" : "outline"}
                            />
                        ))}
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Reference">
                <div>
                    <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Common equivalents
                    </p>
                    {COMMON_EQUIVALENTS.map((item) => (
                        <ResultRow
                            key={item.strength}
                            label={item.strength}
                            value={item.equivalent}
                            badge={item.type}
                            badgeTone="outline"
                        />
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
                <p>Step 1 — turn the input into a percentage:</p>
                <Formula>
                    ratio 1:X → % = (1 ÷ X) × 100
                    <br />
                    w/v → % = value ÷ (10 for mg, 10000 for g) × (1 for mL, 0.001 for L)
                    <br />
                    w/w → % = value ÷ (10 for mg, 10000 for g)
                    <br />
                    v/v → % = value × density
                </Formula>
                <p>Step 2 — turn the percentage into the output format:</p>
                <Formula>
                    ratio → X = 100 ÷ %
                    <br />
                    w/v → % × (10 for mg, 10000 for g) × (1 for mL, 1000 for L)
                    <br />
                    w/w → % × (10 for mg, 10000 for g)
                    <br />
                    v/v → % ÷ density
                </Formula>
                <p>
                    Going through a percentage means each format needs only one rule in and one rule out.
                    Results are shown to 4 decimal places; for a ratio the X is also rounded to a whole
                    number in the unit label.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What does 1:1000 actually mean?",
                        a: "One part of drug in 1000 parts of preparation. For a solid in a liquid that is 1 g in 1000 mL — the same as 0.1% w/v or 1 mg/mL.",
                    },
                    {
                        q: "How do I get mg/mL from a percentage?",
                        a: "Multiply the percentage by 10. A 1% w/v solution holds 1 g per 100 mL, which is 1000 mg per 100 mL, or 10 mg/mL.",
                    },
                    {
                        q: "When should I use w/v, w/w or v/v?",
                        a: "w/v for a solid dissolved in a liquid (most solutions), w/w for semisolids such as creams and ointments, and v/v for one liquid mixed into another, such as alcohol in water.",
                    },
                    {
                        q: "Why does v/v need a density?",
                        a: "A volume percentage says nothing about mass until you know how heavy the liquid is. Multiplying by density turns millilitres of solute into grams, so it can be compared with the weight-based formats.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
