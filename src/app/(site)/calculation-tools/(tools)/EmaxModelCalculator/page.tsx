"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
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
    type ResultTone,
} from "@/components/calculators";
import { computeEmax, interpretEffect } from "./_math";

const DEFAULTS = { emax: "100", ec50: "5", hill: "1", baseline: "0", conc: "10" };

const SAMPLE_DRUGS = [
    { name: "Morphine", ec50: 10, emax: 100, hill: 1.2 },
    { name: "Aspirin", ec50: 100, emax: 80, hill: 1.0 },
    { name: "Fentanyl", ec50: 0.1, emax: 100, hill: 1.5 },
];

const BAND_TONE: Record<"below" | "therapeutic" | "plateau", ResultTone> = {
    below: "neutral",
    therapeutic: "success",
    plateau: "warning",
};

/** Axis-friendly number: no float noise such as 0.1250000001 on the ticks. */
const tick = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : Number(v.toPrecision(3)).toString());

function numberError(value: string, { positive = false } = {}) {
    if (value.trim() === "") return "Required.";
    const v = parseFloat(value);
    if (isNaN(v)) return "Enter a number.";
    if (positive && v <= 0) return "Must be greater than 0.";
    return undefined;
}

export default function EmaxModelCalculator() {
    const [emax, setEmax] = useState(DEFAULTS.emax);
    const [ec50, setEc50] = useState(DEFAULTS.ec50);
    const [hill, setHill] = useState(DEFAULTS.hill);
    const [baseline, setBaseline] = useState(DEFAULTS.baseline);
    const [conc, setConc] = useState(DEFAULTS.conc);

    /*
     * Live. The old page recomputed in a useEffect but only wrote state when the
     * inputs were valid, so an invalid entry (e.g. EC₅₀ = 0) left the previous
     * effect and curves on screen. Now an invalid entry clears the result.
     */
    const result = useMemo(
        () => computeEmax({ emax, ec50, hill, baseline, conc }),
        [emax, ec50, hill, baseline, conc],
    );
    const reading = result ? interpretEffect(result.effect) : null;

    const reset = () => {
        setEmax(DEFAULTS.emax);
        setEc50(DEFAULTS.ec50);
        setHill(DEFAULTS.hill);
        setBaseline(DEFAULTS.baseline);
        setConc(DEFAULTS.conc);
    };

    const loadSample = (drug: (typeof SAMPLE_DRUGS)[number]) => {
        setEc50(drug.ec50.toString());
        setEmax(drug.emax.toString());
        setHill(drug.hill.toString());
        setBaseline("0");
    };

    return (
        <CalculatorShell
            title="Emax Model Calculator"
            subtitle="Predicts the effect of a drug at a given concentration with the sigmoid Emax (Hill) equation, and plots the full concentration–effect curve."
            icon={Target}
            eyebrow="Pharmacology"
            aside={
                <>
                    <CalcAbout title="About the Emax model">
                        <p>
                            The <strong>sigmoid Emax model</strong> is the standard pharmacodynamic (PD) link
                            between drug concentration and effect. Effect rises steeply around the{" "}
                            <strong>EC₅₀</strong> (the concentration giving half the maximal effect) and levels
                            off at <strong>Emax</strong>; the <strong>Hill coefficient (n)</strong> sets how
                            steep the rise is.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Learning how potency (EC₅₀) and efficacy (Emax) shape a curve",
                                "Estimating the effect expected at a measured plasma concentration",
                                "Seeing why doubling a dose near the plateau adds little effect",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Keep in mind"
                            items={[
                                "The interpretation compares the absolute effect (baseline included) with 50% and 80%",
                                "The plotted curves are capped at 100% effect",
                                "Assumes effect depends only on concentration at the site of action — no delay or tolerance",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Effect at test concentration"
                value={result ? result.effect.toFixed(1) : null}
                unit="% of maximum"
                interpretation={reading?.text}
                tone={reading ? BAND_TONE[reading.band] : "neutral"}
                empty="Enter Emax, a positive EC₅₀, the Hill coefficient, baseline and a test concentration."
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    <NumberField
                        label="Maximal effect (Emax)"
                        value={emax}
                        onChange={setEmax}
                        unit="%"
                        step="1"
                        hint="Largest effect the drug can produce, often 100%."
                        error={numberError(emax)}
                    />
                    <NumberField
                        label="EC₅₀"
                        value={ec50}
                        onChange={setEc50}
                        unit="nM"
                        step="0.1"
                        hint="Concentration giving half of Emax. Must be above 0."
                        error={numberError(ec50, { positive: true })}
                    />
                    <NumberField
                        label="Hill coefficient (n)"
                        value={hill}
                        onChange={setHill}
                        step="0.1"
                        hint="Steepness; typically 0.5–3. n = 1 is the simple hyperbola."
                        error={numberError(hill)}
                    />
                    <NumberField
                        label="Baseline effect (E₀)"
                        value={baseline}
                        onChange={setBaseline}
                        unit="%"
                        step="1"
                        hint="Effect with no drug present, usually 0."
                        error={numberError(baseline)}
                    />
                    <NumberField
                        label="Test concentration [C]"
                        value={conc}
                        onChange={setConc}
                        unit="nM"
                        step="0.1"
                        hint="Concentration at which to predict the effect."
                        error={numberError(conc)}
                        className="sm:col-span-2"
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example drug</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_DRUGS.map((drug) => (
                            <button
                                key={drug.name}
                                type="button"
                                onClick={() => loadSample(drug)}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {drug.name} <span className="text-muted-foreground">· EC₅₀ {drug.ec50} nM</span>
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Examples set Emax, EC₅₀ and n, and reset the baseline to 0. The test concentration is kept.
                    </p>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="Working">
                    <p className="overflow-x-auto rounded-lg bg-muted/60 px-3 py-2.5 font-mono text-[13px] text-foreground">
                        E = {result.base} + ({result.Em} × {result.C}^{result.n}) ÷ ({result.EC50}^{result.n} + {result.C}^{result.n})
                    </p>
                    <div>
                        <ResultRow label="Emax" value={result.Em} unit="%" />
                        <ResultRow label="EC₅₀" value={result.EC50} unit="nM" />
                        <ResultRow label="Hill coefficient (n)" value={result.n} />
                        <ResultRow label="Baseline (E₀)" value={result.base} unit="%" />
                        <ResultRow label="Test concentration" value={result.C} unit="nM" />
                        <ResultRow label="Predicted effect" value={`${result.effect.toFixed(1)}%`} />
                    </div>
                </CalcSection>
            )}

            {result && (
                <CalcSection
                    title="Concentration–effect curve (linear scale)"
                    description={`Effect against concentration from 0 to ${tick(result.maxLinear)} nM. The red line marks EC₅₀, the grey line 50% effect.`}
                >
                    <div className="-ml-2 h-64 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.linear} margin={{ top: 16, right: 16, left: 4, bottom: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="conc"
                                    type="number"
                                    domain={[0, result.maxLinear]}
                                    tickFormatter={tick}
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    label={{ value: "Concentration (nM)", position: "insideBottom", offset: -8, fontSize: 11 }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 11 }}
                                    width={44}
                                    stroke="hsl(var(--muted-foreground))"
                                    label={{ value: "Effect (%)", angle: -90, position: "insideLeft", offset: 12, fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(v) => [`${Number(v).toFixed(1)}%`, "Effect"]}
                                    labelFormatter={(l) => `${tick(Number(l))} nM`}
                                />
                                <Line type="monotone" dataKey="effect" stroke="#1C7BD9" strokeWidth={2} dot={false} isAnimationActive={false} />
                                <ReferenceLine x={result.EC50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "EC₅₀", position: "top", fontSize: 11, fill: "#ef4444" }} />
                                <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" label={{ value: "50%", position: "insideTopRight", fontSize: 11, fill: "#64748b" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CalcSection>
            )}

            {result && (
                <CalcSection
                    title="Log-concentration curve"
                    description="The same model on a log₁₀ axis, from EC₅₀ ÷ 100 to EC₅₀ × 100 — the classic sigmoid shape."
                >
                    <div className="-ml-2 h-64 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.logData} margin={{ top: 16, right: 16, left: 4, bottom: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="logConc"
                                    type="number"
                                    domain={[result.minLog, result.maxLog]}
                                    tickFormatter={(v: number) => v.toFixed(1)}
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    label={{ value: "log₁₀ concentration (nM)", position: "insideBottom", offset: -8, fontSize: 11 }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fontSize: 11 }}
                                    width={44}
                                    stroke="hsl(var(--muted-foreground))"
                                    label={{ value: "Effect (%)", angle: -90, position: "insideLeft", offset: 12, fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(v) => [`${Number(v).toFixed(1)}%`, "Effect"]}
                                    labelFormatter={(l) => `log C = ${Number(l).toFixed(2)}`}
                                />
                                <Line type="monotone" dataKey="effect" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                                <ReferenceLine x={Math.log10(result.EC50)} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "EC₅₀", position: "top", fontSize: 11, fill: "#ef4444" }} />
                                <ReferenceLine y={50} stroke="#64748b" strokeDasharray="3 3" label={{ value: "50%", position: "insideTopLeft", fontSize: 11, fill: "#64748b" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>E = E₀ + (Emax × Cⁿ) ÷ (EC₅₀ⁿ + Cⁿ)</Formula>
                <p>
                    <strong>E</strong> is the predicted effect, <strong>E₀</strong> the baseline effect with no
                    drug, <strong>Emax</strong> the maximal drug effect, <strong>C</strong> the concentration,{" "}
                    <strong>EC₅₀</strong> the concentration producing half of Emax, and <strong>n</strong> the
                    Hill coefficient.
                </p>
                <p>
                    With n = 1 the equation is a simple hyperbola. A Hill coefficient above 1 makes the curve
                    steeper (often read as positive cooperativity); below 1 makes it shallower.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is the difference between EC₅₀ and Emax?",
                        a: "EC₅₀ measures potency — how much drug is needed for half the maximal effect. Emax measures efficacy — how big the effect can get at all. A drug can be very potent (low EC₅₀) yet have a low Emax, like a partial agonist.",
                    },
                    {
                        q: "Why is the curve drawn on a log axis too?",
                        a: "On a linear axis the curve rises quickly and then flattens, which hides the low-concentration region. On a log₁₀ axis the same curve becomes a symmetric S-shape centred on EC₅₀, which is how dose–response curves are normally presented.",
                    },
                    {
                        q: "What does the Hill coefficient tell me?",
                        a: "It sets the steepness of the curve. With n > 1 the effect switches from low to high over a narrow concentration range; with n < 1 the change is spread over many-fold concentrations.",
                    },
                    {
                        q: "Why does the interpretation say 'Below EC₅₀' when my Emax is under 100%?",
                        a: "The interpretation bands compare the absolute effect with fixed cut-offs of 50% and 80%, rather than with half of your own Emax. With Emax below 100% (or a non-zero baseline) read the number itself rather than the band.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
