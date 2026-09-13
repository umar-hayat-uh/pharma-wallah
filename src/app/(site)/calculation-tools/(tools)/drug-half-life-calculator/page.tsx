"use client";

import { useMemo, useState } from "react";
import { Clock, RefreshCw } from "lucide-react";
import {
    CartesianGrid,
    Line,
    LineChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
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
    formatSig,
} from "@/components/calculators";

/** Joins class names, skipping falsy ones (kept local: no @/lib imports in tool pages). */
const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

const INTERVALS = [
    { value: "4", label: "Q4H (6x daily)" },
    { value: "6", label: "Q6H (4x daily)" },
    { value: "8", label: "Q8H (3x daily)" },
    { value: "12", label: "Q12H (2x daily)" },
    { value: "24", label: "Q24H (1x daily)" },
    { value: "48", label: "Q48H (Every 2 days)" },
];

const EXAMPLE_DRUGS = [
    { drug: "Amoxicillin", halfLife: "1.3", dose: "500", interval: "8", comment: "Short half-life" },
    { drug: "Metformin", halfLife: "6.2", dose: "500", interval: "12", comment: "Medium half-life" },
    { drug: "Digoxin", halfLife: "36", dose: "0.125", interval: "24", comment: "Long half-life" },
    { drug: "Warfarin", halfLife: "40", dose: "5", interval: "24", comment: "Very long half-life" },
    { drug: "Aspirin", halfLife: "0.25", dose: "325", interval: "4", comment: "Very short half-life" },
];

const HALF_LIFE_GUIDE = [
    { range: "< 4 hours", classification: "Short", dosing: "Multiple daily doses", badge: "bg-blue-100 text-blue-800" },
    { range: "4-24 hours", classification: "Medium", dosing: "Once or twice daily", badge: "bg-emerald-100 text-emerald-800" },
    { range: "24-48 hours", classification: "Long", dosing: "Once daily", badge: "bg-amber-100 text-amber-800" },
    { range: "> 48 hours", classification: "Very Long", dosing: "Loading dose required", badge: "bg-red-100 text-red-800" },
];

const DEFAULTS = { interval: "24", doses: "5" };

/** The chart draws at most this many doses, so a typo like 5000 cannot freeze a phone. */
const MAX_CHART_DOSES = 50;
const SAMPLES_PER_INTERVAL = 24;

function positiveError(raw: string): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value <= 0) return "Must be greater than zero.";
    return undefined;
}

export default function DrugHalfLifeCalculator() {
    const [halfLife, setHalfLife] = useState("");
    const [dose, setDose] = useState("");
    const [interval, setInterval] = useState(DEFAULTS.interval);
    const [doses, setDoses] = useState(DEFAULTS.doses);

    /*
     * Live instead of a Calculate button. The old page mirrored kₑ into a
     * read-only field as (0.693 / t½).toFixed(4) and then read that rounded
     * text back for every calculation; that exact behaviour is kept, so the
     * numbers are identical. The editable kₑ field it showed when t½ was blank
     * could never be used (a blank t½ was rejected), so kₑ is now shown as a
     * derived value. Invalid input shows the empty state instead of an alert.
     */
    const result = useMemo(() => {
        const t_half = parseFloat(halfLife);
        const D = parseFloat(dose);
        const tau = parseFloat(interval);
        const n = parseFloat(doses);

        if (isNaN(t_half) || isNaN(D) || isNaN(tau) || isNaN(n) || t_half <= 0 || D <= 0 || tau <= 0 || n <= 0) {
            return null;
        }

        // What the old read-only kₑ field held, and what the maths then used.
        const ke = parseFloat((0.693 / t_half).toFixed(4));
        const Ke = ke || 0.693 / t_half;

        // Steady state concentration factor
        const accumulationFactor = 1 / (1 - Math.exp(-Ke * tau));
        // Time to reach steady state (4-5 half-lives)
        const timeToSteady = t_half * 4.32;
        // Trough concentration approximation
        const trough = D * (Math.exp(-Ke * tau) / (1 - Math.exp(-Ke * tau)));
        // Peak concentration approximation
        const peak = D / (1 - Math.exp(-Ke * tau));
        // Accumulation ratio
        const accumulation = 1 / (1 - Math.exp(-Ke * tau));

        if (![accumulationFactor, timeToSteady, trough, peak, accumulation].every(Number.isFinite)) return null;

        /*
         * Amount in the body over the regimen: each IV bolus dose D decays as
         * D·e^(−kₑ·t) and the doses add up (superposition). It uses the same kₑ,
         * D and τ as the figures above, and levels off between the peak and
         * trough lines. Two samples at each dose time draw the jump.
         */
        const chartDoses = Math.min(Math.max(Math.floor(n), 1), MAX_CHART_DOSES);
        const amountAt = (t: number, given: number) => {
            let total = 0;
            for (let i = 0; i < given; i++) {
                const dt = t - i * tau;
                if (dt >= 0) total += D * Math.exp(-Ke * dt);
            }
            return total;
        };
        const chartData: { time: number; amount: number }[] = [];
        for (let doseIndex = 0; doseIndex < chartDoses; doseIndex++) {
            const start = doseIndex * tau;
            chartData.push({ time: start, amount: amountAt(start, doseIndex) });
            for (let s = 0; s <= SAMPLES_PER_INTERVAL; s++) {
                const t = start + (tau * s) / SAMPLES_PER_INTERVAL;
                chartData.push({ time: Number(t.toFixed(4)), amount: amountAt(t, doseIndex + 1) });
            }
        }

        return {
            ke: Ke,
            steadyState: accumulationFactor,
            timeToSteady,
            accumulation,
            trough,
            peak,
            chartData,
            chartDoses,
            chartClamped: Math.floor(n) > MAX_CHART_DOSES,
        };
    }, [halfLife, dose, interval, doses]);

    const reset = () => {
        setHalfLife("");
        setDose("");
        setInterval(DEFAULTS.interval);
        setDoses(DEFAULTS.doses);
    };

    return (
        <CalculatorShell
            title="Drug Half-Life Calculator (Multiple Dose)"
            subtitle="For a repeated dosing regimen, works out the elimination rate constant, how much the drug accumulates and how long it takes to reach steady state."
            icon={Clock}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            When a drug is given again before the last dose has gone, it builds up until the
                            amount eliminated in each dosing interval (τ, tau) equals the dose. That plateau is
                            <strong> steady state</strong>. The half-life (t½) alone decides how long it
                            takes to get there; the half-life and the interval together decide how high it
                            builds.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Explaining why a drug takes days to reach its full effect",
                                "Deciding whether a loading dose is worthwhile",
                                "Comparing how different dosing intervals change accumulation",
                                "Planning when to take a steady-state level",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch for"
                            items={[
                                "Assumes first-order elimination and a one-compartment model",
                                "Peak and trough are amounts in the body (mg), not concentrations — divide by Vd for mg/L",
                                "Doses are treated as IV boluses; oral absorption flattens the real curve",
                                "Half-life changes with kidney or liver function",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Time to steady state"
                value={result ? result.timeToSteady.toFixed(1) : null}
                unit="hours"
                interpretation={
                    result
                        ? `Accumulation ratio ${result.accumulation.toFixed(2)} — steady-state peaks reach ${result.accumulation.toFixed(2)}× the first dose's peak`
                        : undefined
                }
                empty="Enter the half-life and the dose, then pick the dosing interval."
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    <NumberField
                        label="Half-life t½ (hours)"
                        value={halfLife}
                        onChange={setHalfLife}
                        unit="h"
                        step="0.1"
                        min={0}
                        placeholder="e.g. 6"
                        error={positiveError(halfLife)}
                        hint="From the drug monograph, e.g. 1–2 h for penicillins, 36 h for digoxin."
                    />
                    <NumberField
                        label="Dose (mg)"
                        value={dose}
                        onChange={setDose}
                        unit="mg"
                        step="1"
                        min={0}
                        placeholder="e.g. 500"
                        error={positiveError(dose)}
                        hint="The amount given at every dose."
                    />
                    <SelectField
                        label="Dosing interval τ (hours)"
                        value={interval}
                        onChange={setInterval}
                        options={INTERVALS}
                        hint="Time between doses."
                    />
                    <NumberField
                        label="Number of doses"
                        value={doses}
                        onChange={setDoses}
                        step="1"
                        min={0}
                        placeholder="e.g. 5"
                        error={positiveError(doses)}
                        hint="Sets the length of the regimen and of the chart."
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example drug</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {EXAMPLE_DRUGS.map((drug) => {
                            const active =
                                halfLife === drug.halfLife && dose === drug.dose && interval === drug.interval;
                            return (
                                <button
                                    key={drug.drug}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => {
                                        setHalfLife(drug.halfLife);
                                        setDose(drug.dose);
                                        setInterval(drug.interval);
                                    }}
                                    className={cn(
                                        "min-h-[40px] rounded-xl border px-3 py-2.5 text-left transition-colors hover:bg-accent",
                                        active ? "border-primary bg-primary/10" : "bg-background",
                                    )}
                                >
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-foreground">{drug.drug}</span>
                                        <span className="font-mono text-xs text-primary">t½ {drug.halfLife} h</span>
                                    </span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                        {drug.dose} mg Q{drug.interval}H · {drug.comment}
                                    </span>
                                </button>
                            );
                        })}
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
                        <ResultRow label="Half-life entered" value={halfLife} unit="hours" />
                        <ResultRow
                            label={`kₑ = 0.693 ÷ ${halfLife}`}
                            value={result.ke.toFixed(4)}
                            unit="h⁻¹"
                        />
                        <ResultRow
                            label={`Accumulation = 1 ÷ (1 − e^(−${result.ke.toFixed(4)} × ${interval}))`}
                            value={result.accumulation.toFixed(2)}
                        />
                        <ResultRow
                            label={`Time to steady state = 4.32 × ${halfLife}`}
                            value={result.timeToSteady.toFixed(1)}
                            unit="hours"
                        />
                        <ResultRow
                            label="Steady-state peak amount = dose × accumulation"
                            value={formatSig(result.peak, 3)}
                            unit="mg"
                        />
                        <ResultRow
                            label="Steady-state trough amount = peak × e^(−kₑτ)"
                            value={formatSig(result.trough, 3)}
                            unit="mg"
                        />
                    </div>
                    <p className="rounded-xl border border-border bg-muted/40 px-3.5 py-3 text-sm text-foreground">
                        <span className="font-semibold">Dosing regimen: </span>
                        {dose} mg every {interval} hours for {doses} doses
                    </p>
                </CalcSection>
            )}

            {result && (
                <CalcSection
                    title="Multiple-dose profile"
                    description={`Amount of drug in the body (mg) over ${result.chartDoses} dose${result.chartDoses === 1 ? "" : "s"}, treating each dose as an IV bolus. Dashed lines: steady-state peak and trough.`}
                >
                    <div className="-ml-2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={result.chartData} margin={{ top: 10, right: 12, left: 4, bottom: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="time"
                                    type="number"
                                    domain={[0, "dataMax"]}
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    label={{ value: "Time (h)", position: "insideBottom", offset: -8, fontSize: 11 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    width={48}
                                    domain={[0, "auto"]}
                                    tickFormatter={(value) => formatSig(Number(value), 3)}
                                    label={{ value: "Amount (mg)", angle: -90, position: "insideLeft", offset: 12, fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${formatSig(Number(value), 3)} mg`, "In the body"]}
                                    labelFormatter={(label) => `${label} h`}
                                />
                                <ReferenceLine
                                    y={result.peak}
                                    ifOverflow="extendDomain"
                                    stroke="#DC2626"
                                    strokeDasharray="5 5"
                                    label={{ value: "SS peak", position: "insideTopRight", fontSize: 10, fill: "#DC2626" }}
                                />
                                <ReferenceLine
                                    y={result.trough}
                                    ifOverflow="extendDomain"
                                    stroke="#D97706"
                                    strokeDasharray="5 5"
                                    label={{ value: "SS trough", position: "insideBottomRight", fontSize: 10, fill: "#B45309" }}
                                />
                                <Line
                                    type="linear"
                                    dataKey="amount"
                                    stroke="#059669"
                                    strokeWidth={2}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {result.chartClamped && (
                        <p className="text-xs text-muted-foreground">
                            The chart shows the first {MAX_CHART_DOSES} doses; the figures above do not depend on
                            the number of doses.
                        </p>
                    )}
                </CalcSection>
            )}

            <CalcSection title="Half-life interpretation guide">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[18rem] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="py-2 pr-3 font-medium">Half-life range</th>
                                <th className="py-2 pr-3 font-medium">Classification</th>
                                <th className="py-2 font-medium">Typical dosing</th>
                            </tr>
                        </thead>
                        <tbody>
                            {HALF_LIFE_GUIDE.map((row) => (
                                <tr key={row.range} className="border-b border-border/60 last:border-b-0">
                                    <td className="py-2.5 pr-3 font-medium text-foreground">{row.range}</td>
                                    <td className="py-2.5 pr-3">
                                        <span className={cn("rounded px-2 py-1 text-xs font-bold", row.badge)}>
                                            {row.classification}
                                        </span>
                                    </td>
                                    <td className="py-2.5 text-muted-foreground">{row.dosing}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>kₑ = 0.693 / t½</Formula>
                <Formula>Accumulation = 1 / (1 − e^(−kₑ × τ))</Formula>
                <Formula>Steady State ≈ 4.32 × t½</Formula>
                <Formula>Peak = Dose / (1 − e^(−kₑτ))     Trough = Dose × e^(−kₑτ) / (1 − e^(−kₑτ))</Formula>
                <p>
                    kₑ is the elimination rate constant (h⁻¹) and τ the dosing interval (h). kₑ is rounded to
                    four decimal places before the other figures are worked out. The accumulation ratio is how
                    many times higher a steady-state peak is than the peak after the first dose.
                </p>
                <p>
                    After 4.32 half-lives the drug is at about 95% of its steady-state level (1 − 0.5^4.32 ≈
                    0.95). Peak and trough are amounts in the body; divide them by the volume of distribution
                    to get concentrations.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Does giving the dose more often make steady state come sooner?",
                        a: "No. Time to steady state depends only on the half-life. A shorter interval makes the plateau higher and flatter (larger accumulation ratio, smaller swing between peak and trough), but it still takes about 4–5 half-lives to get there.",
                    },
                    {
                        q: "Why does the number of doses not change the results?",
                        a: "The accumulation ratio, peak and trough describe the eventual steady state, which does not depend on how many doses are given. The number of doses only sets how much of the build-up the chart shows.",
                    },
                    {
                        q: "When is a loading dose needed?",
                        a: "When the half-life is long, reaching steady state by repeated dosing takes too long — digoxin (t½ ≈ 36 h) would take about a week. A loading dose reaches the target level at once, and maintenance doses then keep it there.",
                    },
                    {
                        q: "What does an accumulation ratio of 1.00 mean?",
                        a: "Almost nothing is left from one dose when the next is given, so the drug does not build up — each dose behaves like the first. That happens when the interval is many half-lives long, as with aspirin every 4 hours.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
