"use client";

import { useMemo, useState } from "react";
import { Activity, Clock, PieChart, RefreshCw, TrendingDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    FieldGrid,
    NumberField,
    ResultCard,
    ResultRow,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    AdSlot,
    ModeSwitch,
    type ModeOption,
} from "@/components/calculators";

type Method = "halfLife" | "clearance" | "concentration";

const METHODS: ModeOption<Method>[] = [
    { value: "halfLife", label: "From half-life", description: "kₑ = 0.693 / t½", icon: Clock },
    { value: "clearance", label: "From CL and Vd", description: "kₑ = CL / Vd", icon: Activity },
    { value: "concentration", label: "From dose and C₀", description: "Vd = Dose / C₀, then kₑ = CL / Vd", icon: PieChart },
];

const SAMPLE_VALUES = [
    { name: "Short t½", t12: "2", ke: "0.346", cl: "10", vd: "30" },
    { name: "Medium t½", t12: "6", ke: "0.116", cl: "8", vd: "70" },
    { name: "Long t½", t12: "24", ke: "0.029", cl: "2", vd: "70" },
];

const DEFAULTS = { halfLife: "4", clearance: "5", volume: "50", dose: "100", initialConcentration: "10" };

/* Interpretation bands (unchanged). */
function getKeInterpretation(k: number) {
    if (k > 0.5) return "Very rapid elimination – multiple daily doses";
    if (k > 0.1) return "Rapid elimination – multiple daily doses";
    if (k > 0.05) return "Moderate elimination – once or twice daily";
    if (k > 0.01) return "Slow elimination – once daily";
    return "Very slow elimination – weekly or less";
}

function positiveError(raw: string): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value <= 0) return "Must be greater than zero.";
    return undefined;
}

export default function KeCalculator() {
    const [method, setMethod] = useState<Method>("halfLife");
    const [halfLife, setHalfLife] = useState(DEFAULTS.halfLife);
    const [clearance, setClearance] = useState(DEFAULTS.clearance);
    const [volume, setVolume] = useState(DEFAULTS.volume);
    const [dose, setDose] = useState(DEFAULTS.dose);
    const [initialConcentration, setInitialConcentration] = useState(DEFAULTS.initialConcentration);

    /*
     * Derived with useMemo. The old page ran the maths from a useEffect into
     * separate state, so invalid input displayed kₑ = 0.0000 ("very slow
     * elimination") beside the half-life and curve left over from the previous
     * valid input. Now an input that cannot give a positive, finite kₑ shows
     * the empty state instead. Valid inputs give identical numbers.
     */
    const result = useMemo(() => {
        let k = 0;
        let t12Out: number | null = null;
        let vdCalc: number | null = null;

        switch (method) {
            case "halfLife": {
                const t12 = parseFloat(halfLife);
                if (!isNaN(t12) && t12 > 0) {
                    k = 0.693 / t12;
                    t12Out = t12;
                }
                break;
            }
            case "clearance": {
                const cl = parseFloat(clearance);
                const vd = parseFloat(volume);
                if (!isNaN(cl) && !isNaN(vd) && vd > 0) {
                    k = cl / vd; // k = Cl / Vd
                    t12Out = 0.693 / k;
                }
                break;
            }
            case "concentration": {
                const doseVal = parseFloat(dose);
                const c0 = parseFloat(initialConcentration);
                if (!isNaN(doseVal) && !isNaN(c0) && c0 > 0) {
                    vdCalc = doseVal / c0;
                    const cl = parseFloat(clearance);
                    if (!isNaN(cl)) {
                        k = cl / vdCalc;
                        t12Out = 0.693 / k;
                    }
                }
                break;
            }
        }

        if (!(k > 0) || !Number.isFinite(k) || t12Out === null || !Number.isFinite(t12Out)) return null;

        // Decay curve, 0–10 h in 0.5 h steps
        const chartData: { time: number; conc: number }[] = [];
        for (let t = 0; t <= 10; t += 0.5) {
            chartData.push({ time: t, conc: Math.exp(-k * t) * 100 });
        }

        return { k, t12: t12Out, vdCalc, chartData };
    }, [method, halfLife, clearance, volume, dose, initialConcentration]);

    const loadSample = (sample: (typeof SAMPLE_VALUES)[number]) => {
        setMethod("halfLife");
        setHalfLife(sample.t12);
        setClearance(sample.cl);
        setVolume(sample.vd);
    };

    const reset = () => {
        setHalfLife(DEFAULTS.halfLife);
        setClearance(DEFAULTS.clearance);
        setVolume(DEFAULTS.volume);
        setDose(DEFAULTS.dose);
        setInitialConcentration(DEFAULTS.initialConcentration);
    };

    const clearanceField = (
        <NumberField
            label="Clearance CL (L/h)"
            value={clearance}
            onChange={setClearance}
            unit="L/h"
            step="0.1"
            min={0}
            error={positiveError(clearance)}
            hint="Total body clearance of the drug."
        />
    );

    return (
        <CalculatorShell
            title="Elimination Rate Constant (kₑ) Calculator"
            subtitle="Finds the first-order elimination rate constant from a half-life, from clearance and Vd, or from a dose and C₀."
            icon={TrendingDown}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            <strong>kₑ — the elimination rate constant</strong> — is the fraction of the drug
                            in the body removed per unit time in first-order kinetics. A larger kₑ means a
                            shorter half-life and more frequent dosing. It links half-life, clearance (CL)
                            and volume of distribution (Vd).
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Converting a half-life into a rate constant",
                                "You know clearance and Vd but not the half-life",
                                "Predicting how fast a level will fall after a dose",
                                "Setting up concentration–time equations (C = C₀·e^(−kₑt))",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch for"
                            items={[
                                "Valid only for first-order (linear) elimination",
                                "CL and Vd must use the same volume unit (L/h with L)",
                                "The dose/C₀ method assumes an IV bolus into one compartment",
                                "Half-life and kₑ must share a time unit — here, hours",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch label="Calculation method" value={method} onChange={setMethod} options={METHODS} />

            <ResultCard
                label="Elimination rate constant"
                value={result ? result.k.toFixed(4) : null}
                unit="h⁻¹"
                interpretation={result ? getKeInterpretation(result.k) : undefined}
                empty="Enter positive values for the chosen method to see kₑ."
            />

            <CalcSection title="Inputs">
                {method === "halfLife" && (
                    <NumberField
                        label="Half-life t½ (hours)"
                        value={halfLife}
                        onChange={setHalfLife}
                        unit="h"
                        step="0.1"
                        min={0}
                        error={positiveError(halfLife)}
                        hint="The elimination half-life, e.g. from a drug monograph."
                    />
                )}
                {method === "clearance" && (
                    <FieldGrid>
                        {clearanceField}
                        <NumberField
                            label="Volume of distribution Vd (L)"
                            value={volume}
                            onChange={setVolume}
                            unit="L"
                            step="0.1"
                            min={0}
                            error={positiveError(volume)}
                            hint="Apparent volume, in litres (L/kg × body weight)."
                        />
                    </FieldGrid>
                )}
                {method === "concentration" && (
                    <FieldGrid>
                        <NumberField
                            label="Dose (mg)"
                            value={dose}
                            onChange={setDose}
                            unit="mg"
                            step="0.1"
                            min={0}
                            error={positiveError(dose)}
                            hint="IV bolus dose."
                        />
                        <NumberField
                            label="Initial concentration C₀ (mg/L)"
                            value={initialConcentration}
                            onChange={setInitialConcentration}
                            unit="mg/L"
                            step="0.1"
                            min={0}
                            error={positiveError(initialConcentration)}
                            hint="Concentration at time zero, back-extrapolated."
                        />
                        {clearanceField}
                    </FieldGrid>
                )}

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example (fills the half-life method)</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_VALUES.map((sample) => (
                            <button
                                key={sample.name}
                                type="button"
                                onClick={() => loadSample(sample)}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {sample.name}
                                <span className="ml-1.5 font-normal text-muted-foreground">kₑ = {sample.ke} h⁻¹</span>
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
                        {method === "halfLife" && (
                            <ResultRow label={`kₑ = 0.693 ÷ ${halfLife}`} value={result.k.toFixed(4)} unit="h⁻¹" />
                        )}
                        {method === "clearance" && (
                            <ResultRow label={`kₑ = ${clearance} ÷ ${volume}`} value={result.k.toFixed(4)} unit="h⁻¹" />
                        )}
                        {method === "concentration" && result.vdCalc !== null && (
                            <>
                                <ResultRow
                                    label={`Vd = ${dose} ÷ ${initialConcentration}`}
                                    value={Number(result.vdCalc.toFixed(4)).toString()}
                                    unit="L"
                                />
                                <ResultRow
                                    label={`kₑ = ${clearance} ÷ ${Number(result.vdCalc.toFixed(4))}`}
                                    value={result.k.toFixed(4)}
                                    unit="h⁻¹"
                                />
                            </>
                        )}
                        <ResultRow label="Calculated t½" value={result.t12.toFixed(2)} unit="hours" />
                        <ResultRow
                            label="Fraction eliminated per hour (kₑ × 100)"
                            value={`${(result.k * 100).toFixed(1)}%`}
                        />
                    </div>
                </CalcSection>
            )}

            {result && (
                <CalcSection title="Elimination curve" description="Percentage of the drug remaining over the first 10 hours.">
                    <div className="-ml-2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.chartData} margin={{ top: 10, right: 12, left: 4, bottom: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="time"
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    type="number"
                                    domain={[0, 10]}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                    label={{ value: "Time (h)", position: "insideBottom", offset: -8, fontSize: 11 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    width={44}
                                    label={{ value: "% remaining", angle: -90, position: "insideLeft", offset: 12, fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${Number(value).toFixed(1)}%`, "Remaining"]}
                                    labelFormatter={(label) => `${label} h`}
                                />
                                <Line type="monotone" dataKey="conc" stroke="#2563EB" strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>kₑ = 0.693 / t½</Formula>
                <Formula>kₑ = CL / Vd</Formula>
                <Formula>Vd = Dose / C₀   then   kₑ = CL / Vd</Formula>
                <p>Key relationships between the parameters:</p>
                <Formula>t½ = 0.693 / kₑ</Formula>
                <Formula>CL = kₑ × Vd</Formula>
                <Formula>AUC = Dose / (kₑ × Vd)</Formula>
                <p>
                    0.693 is ln 2. In first-order elimination the concentration falls exponentially,
                    C = C₀ · e^(−kₑ·t), which is what the curve above plots as a percentage of C₀.
                    First-order kinetics per the MSD Manual.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What are the units of kₑ?",
                        a: "Reciprocal time — here h⁻¹, because half-life is entered in hours and clearance in L/h. If you enter a half-life in minutes the answer is in min⁻¹; multiply by 60 to convert to h⁻¹.",
                    },
                    {
                        q: "Is kₑ × 100 really the percentage eliminated each hour?",
                        a: "Only approximately, and only when kₑ is small. The exact fraction lost in one hour is 1 − e^(−kₑ). For kₑ = 0.1 h⁻¹ that is 9.5% rather than 10%; for larger kₑ the gap widens.",
                    },
                    {
                        q: "Why does a bigger Vd give a smaller kₑ?",
                        a: "Because kₑ = CL / Vd. With the same clearance, a drug spread through a larger volume has a smaller share of itself in the blood passing the liver and kidneys at any moment, so it leaves more slowly.",
                    },
                    {
                        q: "Does this work for zero-order drugs like high-dose phenytoin or ethanol?",
                        a: "No. Zero-order drugs are removed at a constant amount per hour, so there is no constant kₑ or half-life. Use the order-of-kinetics calculator to compare the two patterns.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
