"use client";

import { useMemo, useState } from "react";
import { Flame, RefreshCw } from "lucide-react";
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

/* ── Reference data, unchanged ────────────────────────────────────────────── */
const REFERENCE_TEMPS = [
    { value: "121", label: "121 °C (F₀ standard)" },
    { value: "100", label: "100 °C" },
    { value: "134", label: "134 °C (flash)" },
];

const Z_VALUES = [
    { value: "10", label: "10 °C (B. stearothermophilus)" },
    { value: "12", label: "12 °C (C. botulinum)" },
    { value: "8", label: "8 °C (thermophiles)" },
];

/** Lethal rate per minute at a given temperature, assuming z = 10 °C. */
const LETHAL_RATES = [
    { temp: "100 °C", rate: "0.008", use: "Pasteurisation" },
    { temp: "110 °C", rate: "0.077", use: "Low-temperature sterilisation" },
    { temp: "115 °C", rate: "0.245", use: "Pharmaceuticals" },
    { temp: "121 °C", rate: "0.975", use: "Reference (F₀ standard)" },
    { temp: "125 °C", rate: "2.448", use: "High-temperature short time" },
    { temp: "130 °C", rate: "7.743", use: "Flash sterilisation" },
];

/** The three acceptance criteria a validation report is usually judged against. */
const STANDARDS = [
    { name: "Overkill method", target: "F₀ ≥ 12 min" },
    { name: "C. botulinum (12D)", target: "F₀ ≥ 2.52 min" },
    { name: "Medical devices", target: "F₀ ≥ 8 min" },
];

const SAMPLES = [
    { name: "Overkill cycle", d: "1.5", log: "12", temp: "121" },
    { name: "12D botulinum", d: "0.21", log: "12", temp: "121" },
    { name: "Terminal sterilisation", d: "1.5", log: "6", temp: "121" },
    { name: "Flash 134 °C", d: "1.5", log: "6", temp: "134" },
];

export default function FValueCalculator() {
    const [dValue, setDValue] = useState("1.5");
    const [logReduction, setLogReduction] = useState("6");
    const [processTemp, setProcessTemp] = useState("121");
    const [referenceTemp, setReferenceTemp] = useState("121");
    const [zValue, setZValue] = useState("10");

    /*
     * Derived, not stored. The previous version recomputed into state from a
     * useEffect, so for one render after every keystroke the number on screen
     * did not match the inputs. The arithmetic below is unchanged.
     */
    const result = useMemo(() => {
        const D = parseFloat(dValue);
        const log = parseFloat(logReduction);
        const T = parseFloat(processTemp);
        const Tref = parseFloat(referenceTemp);
        const Z = parseFloat(zValue);

        if (isNaN(D) || isNaN(log) || D <= 0 || log <= 0) return null;

        const F = D * log;
        const F0 =
            !isNaN(T) && !isNaN(Tref) && !isNaN(Z) ? F * Math.pow(10, (T - Tref) / Z) : null;

        // Judged against the overkill criterion, which is the one most cycles
        // in pharmaceutical manufacturing are designed to meet.
        let interpretation: string;
        let tone: ResultTone;
        if (F0 === null) {
            interpretation = "Enter a process temperature, reference temperature and z-value for F₀.";
            tone = "neutral";
        } else if (F0 >= 12) {
            interpretation = "Meets the overkill criterion of F₀ ≥ 12 min.";
            tone = "success";
        } else if (F0 >= 8) {
            interpretation = "Meets the medical-device criterion (F₀ ≥ 8 min) but not overkill.";
            tone = "warning";
        } else if (F0 >= 2.52) {
            interpretation = "Meets the 12D botulinum criterion, but is below the overkill target.";
            tone = "warning";
        } else {
            interpretation = "Below every common acceptance criterion — the cycle is not sufficient.";
            tone = "danger";
        }

        return { F, F0, interpretation, tone };
    }, [dValue, logReduction, processTemp, referenceTemp, zValue]);

    const reset = () => {
        setDValue("1.5");
        setLogReduction("6");
        setProcessTemp("121");
        setReferenceTemp("121");
        setZValue("10");
    };

    return (
        <CalculatorShell
            title="F-Value Calculator"
            subtitle="Thermal lethality of a sterilisation cycle, and its equivalent minutes at 121 °C."
            icon={Flame}
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            The <strong>F-value</strong> is the time a sterilisation cycle must hold at a
                            reference temperature to deliver a chosen log reduction in microbial
                            population. <strong>F₀</strong> is the special case everyone quotes:
                            the reference is 121 °C and z is 10 °C, the resistance of{" "}
                            <em>Geobacillus stearothermophilus</em>, the standard biological indicator
                            for moist-heat sterilisation.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Designing or validating a moist-heat sterilisation cycle",
                                "Comparing cycles run at different temperatures",
                                "Checking a cycle against an overkill or 12D acceptance criterion",
                                "Teaching the relationship between D-value, z-value and lethality",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Remember"
                            items={[
                                "D and z are organism-specific and product-specific — use measured values",
                                "A real cycle's F₀ is integrated over the whole temperature profile, not a single point",
                                "Heat-up and cool-down contribute lethality that a single-point estimate ignores",
                                "This is a teaching estimate, not a substitute for a validated cycle record",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="F₀ — equivalent minutes at 121 °C"
                value={result?.F0 != null ? result.F0.toFixed(2) : null}
                unit="min"
                interpretation={result?.interpretation}
                tone={result?.tone ?? "neutral"}
                empty="Enter a D-value and a log reduction to see the cycle's lethality."
            />

            <CalcSection title="Lethality parameters">
                <FieldGrid>
                    <NumberField
                        label="D-value"
                        value={dValue}
                        onChange={setDValue}
                        unit="min"
                        step="0.1"
                        min={0}
                        hint="Minutes at the process temperature to kill 90% of the population."
                    />
                    <NumberField
                        label="Desired log reduction"
                        value={logReduction}
                        onChange={setLogReduction}
                        unit="log"
                        step="0.5"
                        min={0}
                        hint="6 log is typical; 12 log is the overkill and botulinum standard."
                    />
                    <NumberField
                        label="Process temperature"
                        value={processTemp}
                        onChange={setProcessTemp}
                        unit="°C"
                        step="1"
                        hint="The temperature the load actually holds at."
                    />
                    <SelectField
                        label="Reference temperature"
                        value={referenceTemp}
                        onChange={setReferenceTemp}
                        options={REFERENCE_TEMPS}
                        hint="121 °C is the reference that defines F₀."
                    />
                    <SelectField
                        label="z-value"
                        value={zValue}
                        onChange={setZValue}
                        options={Z_VALUES}
                        hint="Degrees of temperature change for a tenfold change in D."
                    />
                </FieldGrid>

                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLES.map((sample) => (
                            <button
                                key={sample.name}
                                type="button"
                                onClick={() => {
                                    setDValue(sample.d);
                                    setLogReduction(sample.log);
                                    setProcessTemp(sample.temp);
                                    setReferenceTemp("121");
                                    setZValue("10");
                                }}
                                className="rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent"
                            >
                                {sample.name}
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
                <CalcSection title="Working">
                    <div>
                        <ResultRow label="F at the process temperature" value={result.F.toFixed(2)} unit="min" />
                        {result.F0 != null && (
                            <ResultRow label="F₀ (equivalent at 121 °C)" value={result.F0.toFixed(2)} unit="min" />
                        )}
                        <ResultRow label="D-value used" value={dValue} unit="min" />
                        <ResultRow label="z-value used" value={zValue} unit="°C" />
                    </div>
                </CalcSection>
            )}

            <CalcSection
                title="Acceptance criteria"
                description="What a validation report is usually judged against."
            >
                <div>
                    {STANDARDS.map((standard) => (
                        <ResultRow key={standard.name} label={standard.name} value={standard.target} />
                    ))}
                </div>
            </CalcSection>

            <CalcSection
                title="Lethal rate per minute"
                description="Minutes of F₀ delivered by one minute at each temperature, assuming z = 10 °C."
            >
                <div>
                    {LETHAL_RATES.map((row) => (
                        <ResultRow key={row.temp} label={`${row.temp} — ${row.use}`} value={row.rate} unit="min⁻¹" />
                    ))}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>F = D × log reduction</Formula>
                <Formula>F₀ = F × 10^((T − T_ref) / z)</Formula>
                <p>
                    The D-value is the time needed to kill 90% of a population — one log. Killing six
                    logs therefore takes six D-values, which is all the first line says.
                </p>
                <p>
                    The second line converts that time to its equivalent at the reference temperature.
                    The z-value is how many degrees change D tenfold, so every z degrees above the
                    reference multiplies the lethality delivered per minute by ten.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is the difference between F and F₀?",
                        a: "F is the lethality expressed at whatever reference temperature and z-value you choose. F₀ is the industry convention: reference 121 °C and z = 10 °C. Quoting F₀ lets cycles run at different temperatures be compared on one scale.",
                    },
                    {
                        q: "Why is F₀ ≥ 12 minutes called the overkill method?",
                        a: "It delivers at least a 12-log reduction of an organism with D₁₂₁ of 1 minute. That is so far beyond any realistic bioburden that the cycle is sterilising regardless of what was on the load, which removes the need to characterise the bioburden itself.",
                    },
                    {
                        q: "Where does the 12D botulinum figure of 2.52 minutes come from?",
                        a: "Clostridium botulinum spores have a D₁₂₁ of about 0.21 minutes. Twelve logs of reduction is 12 × 0.21 = 2.52 minutes. It is the classic food-canning criterion and is far less stringent than the pharmaceutical overkill target.",
                    },
                    {
                        q: "Can I use this for dry-heat sterilisation?",
                        a: "Not with these defaults. Dry heat uses a reference of 170 °C and a z-value nearer 20 °C, and the equivalent term is F_H rather than F₀. The arithmetic is the same, but you must enter the correct reference temperature and z-value.",
                    },
                    {
                        q: "Does this account for heat-up and cool-down?",
                        a: "No. A real F₀ is the integral of the lethal rate across the entire recorded temperature profile, including ramp and cool-down, which usually adds lethality. This calculator gives the single-point estimate that a design calculation starts from.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
