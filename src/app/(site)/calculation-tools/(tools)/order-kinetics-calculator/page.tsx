"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart, GitCompare, RefreshCw, TrendingDown } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

type KineticsType = "first-order" | "zero-order" | "mixed" | "comparison";
type SeriesKey = "First-Order" | "Zero-Order" | "Mixed";

const MODELS: ModeOption<KineticsType>[] = [
    { value: "first-order", label: "First-order", description: "Rate ∝ concentration", icon: TrendingDown },
    { value: "zero-order", label: "Zero-order", description: "Constant rate", icon: BarChart },
    { value: "mixed", label: "Mixed", description: "Michaelis–Menten", icon: Activity },
    { value: "comparison", label: "Compare", description: "First vs zero", icon: GitCompare },
];

/** Sampling times for the simulation, in hours (unchanged). */
const TIME_POINTS = [0, 1, 2, 4, 6, 8, 12, 24];

const DEFAULTS = { c0: "100", ke: "0.1", vmax: "10", km: "50" };

const SAMPLE_DRUGS: { name: string; type: KineticsType; c0: string; vmax?: string; ke?: string; km?: string; note: string }[] = [
    { name: "Ethanol (Zero-order)", type: "zero-order", c0: "100", vmax: "10", note: "Saturable metabolism" },
    { name: "Most Drugs (First-order)", type: "first-order", c0: "100", ke: "0.1", note: "Linear elimination" },
    { name: "Phenytoin (Mixed)", type: "mixed", c0: "20", vmax: "8", km: "6", note: "Michaelis-Menten" },
];

const SERIES_COLORS: Record<SeriesKey, string> = {
    "First-Order": "#2563EB",
    "Zero-Order": "#DC2626",
    Mixed: "#059669",
};

function getKineticsDescription(type: KineticsType) {
    switch (type) {
        case "first-order":
            return "Rate proportional to concentration – constant half‑life";
        case "zero-order":
            return "Constant rate independent of concentration – time to eliminate depends on dose";
        case "mixed":
            return "Saturable (Michaelis-Menten) kinetics – shifts from first to zero at high doses";
        case "comparison":
            return "Compare first-order and zero-order models";
    }
}

function positiveError(raw: string): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value <= 0) return "Must be greater than zero.";
    return undefined;
}

export default function KineticsCalculator() {
    const [kineticsType, setKineticsType] = useState<KineticsType>("first-order");
    const [initialConcentration, setInitialConcentration] = useState(DEFAULTS.c0);
    const [eliminationConstant, setEliminationConstant] = useState(DEFAULTS.ke);
    const [maxRate, setMaxRate] = useState(DEFAULTS.vmax);
    const [km, setKm] = useState(DEFAULTS.km);

    /*
     * Derived with useMemo. The old page wrote results into state from a
     * useEffect and returned early on an invalid C₀, leaving the previous
     * half-life and curve on screen; it also printed "Infinity h" / "NaN h" for
     * a zero or blank kₑ or Vmax. Those now show "—". The simulation maths is
     * copied verbatim.
     */
    const sim = useMemo(() => {
        const c0 = parseFloat(initialConcentration);
        const ke = parseFloat(eliminationConstant);
        const vmax = parseFloat(maxRate);
        const kmVal = parseFloat(km);

        if (isNaN(c0) || c0 <= 0) return null;

        const firstOrder: number[] = [];
        const zeroOrder: number[] = [];
        const mixed: number[] = [];

        // First-order: C(t) = C0 * e^(-ke*t)
        TIME_POINTS.forEach((t) => {
            firstOrder.push(c0 * Math.exp(-ke * t));
        });

        // Zero-order: C(t) = C0 - vmax*t (until zero)
        TIME_POINTS.forEach((t) => {
            zeroOrder.push(Math.max(0, c0 - vmax * t));
        });

        // Michaelis-Menten (simplified Euler integration)
        let currentC = c0;
        TIME_POINTS.forEach((t, idx) => {
            if (idx === 0) {
                mixed.push(currentC);
            } else {
                const dt = t - TIME_POINTS[idx - 1];
                const rate = (vmax * currentC) / (kmVal + currentC);
                currentC = Math.max(0, currentC - rate * dt);
                mixed.push(currentC);
            }
        });

        const rows = TIME_POINTS.map((t, idx) => ({
            time: t,
            "First-Order": firstOrder[idx],
            "Zero-Order": zeroOrder[idx],
            Mixed: mixed[idx],
        }));

        // Half-life for first-order; time to eliminate for zero-order.
        const halfLife = 0.693 / ke;
        const timeToEliminate = c0 / vmax;

        return {
            c0,
            rows,
            halfLife: Number.isFinite(halfLife) && halfLife > 0 ? halfLife : null,
            timeToEliminate: Number.isFinite(timeToEliminate) && timeToEliminate > 0 ? timeToEliminate : null,
        };
    }, [initialConcentration, eliminationConstant, maxRate, km]);

    const series: SeriesKey[] =
        kineticsType === "comparison"
            ? ["First-Order", "Zero-Order"]
            : [kineticsType === "first-order" ? "First-Order" : kineticsType === "zero-order" ? "Zero-Order" : "Mixed"];

    // A curve is drawn only when every value in it is a real number.
    const chartOk =
        sim !== null && sim.rows.every((row) => series.every((key) => Number.isFinite(row[key])));

    const showHalfLifeCard = kineticsType === "first-order" || kineticsType === "comparison";
    const cardValue = sim
        ? showHalfLifeCard
            ? sim.halfLife?.toFixed(2)
            : sim.timeToEliminate?.toFixed(1)
        : null;

    const loadSample = (drug: (typeof SAMPLE_DRUGS)[number]) => {
        setKineticsType(drug.type);
        setInitialConcentration(drug.c0);
        if (drug.vmax) setMaxRate(drug.vmax);
        if (drug.ke) setEliminationConstant(drug.ke);
        if (drug.km) setKm(drug.km);
    };

    const reset = () => {
        setInitialConcentration(DEFAULTS.c0);
        setEliminationConstant(DEFAULTS.ke);
        setMaxRate(DEFAULTS.vmax);
        setKm(DEFAULTS.km);
    };

    const keField = (
        <NumberField
            label="Elimination rate constant kₑ (h⁻¹)"
            value={eliminationConstant}
            onChange={setEliminationConstant}
            unit="h⁻¹"
            step="0.01"
            min={0}
            error={positiveError(eliminationConstant)}
            hint="First-order drugs typically 0.01–0.5 h⁻¹."
        />
    );
    const vmaxField = (
        <NumberField
            label="Maximum elimination rate Vmax (mg/L/h)"
            value={maxRate}
            onChange={setMaxRate}
            unit="mg/L/h"
            step="0.1"
            min={0}
            error={positiveError(maxRate)}
            hint="Concentration removed per hour when elimination is saturated."
        />
    );

    return (
        <CalculatorShell
            title="First-Order vs Zero-Order Kinetics"
            subtitle="Simulates how a plasma concentration falls under first-order, zero-order or Michaelis–Menten (mixed) elimination."
            icon={TrendingDown}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Most drugs are eliminated by <strong>first-order</strong> kinetics: a constant
                            <em> fraction</em> is removed per hour, so half-life never changes. A few —
                            ethanol, high-dose aspirin, phenytoin — saturate their enzymes and switch to
                            <strong> zero-order</strong> kinetics, removing a constant <em>amount</em> per hour.
                            <strong> Michaelis–Menten</strong> (mixed) kinetics describes the transition between the two.
                        </p>
                        <CalcList
                            title="Clinical implications"
                            items={[
                                "First‑order: Safe, predictable elimination; dose proportional",
                                "Zero‑order: Risk of accumulation at high doses; small dose changes can cause large concentration swings",
                                "Mixed kinetics: Requires therapeutic drug monitoring (phenytoin, theophylline)",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch for"
                            items={[
                                "The mixed curve is a coarse step-by-step estimate at the sampled times, not an exact solution",
                                "Half-life is meaningful only for first-order elimination",
                                "C₀ / Vmax is meaningful only for zero-order elimination",
                                "The curves assume one compartment and no further dosing",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch label="Elimination model" value={kineticsType} onChange={setKineticsType} options={MODELS} />

            <ResultCard
                label={showHalfLifeCard ? "Half-life (first-order)" : "Time to eliminate (C₀ / Vmax)"}
                value={cardValue}
                unit="h"
                interpretation={getKineticsDescription(kineticsType)}
                empty={
                    showHalfLifeCard
                        ? "Enter a positive C₀ and kₑ to see the half-life."
                        : "Enter a positive C₀ and Vmax to see the time to eliminate."
                }
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    <NumberField
                        label="Initial concentration C₀ (mg/L)"
                        value={initialConcentration}
                        onChange={setInitialConcentration}
                        unit="mg/L"
                        step="0.1"
                        min={0}
                        error={positiveError(initialConcentration)}
                        hint="Plasma concentration at time zero."
                    />
                    {(kineticsType === "first-order" || kineticsType === "comparison") && keField}
                    {(kineticsType === "zero-order" || kineticsType === "mixed" || kineticsType === "comparison") &&
                        vmaxField}
                    {kineticsType === "mixed" && (
                        <NumberField
                            label="Michaelis constant Km (mg/L)"
                            value={km}
                            onChange={setKm}
                            unit="mg/L"
                            step="0.1"
                            min={0}
                            error={positiveError(km)}
                            hint="Concentration at which elimination runs at half of Vmax."
                        />
                    )}
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_DRUGS.map((drug) => (
                            <button
                                key={drug.name}
                                type="button"
                                onClick={() => loadSample(drug)}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-left text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {drug.name}
                                <span className="ml-1.5 font-normal text-muted-foreground">{drug.note}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {sim && (
                <CalcSection title="Results">
                    <div>
                        <ResultRow
                            label={`Half-life = 0.693 ÷ ${eliminationConstant || "kₑ"}`}
                            value={sim.halfLife !== null ? sim.halfLife.toFixed(2) : "—"}
                            unit="h"
                        />
                        <ResultRow
                            label={`Time to eliminate = ${initialConcentration} ÷ ${maxRate || "Vmax"}`}
                            value={sim.timeToEliminate !== null ? sim.timeToEliminate.toFixed(1) : "—"}
                            unit="h"
                        />
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Half-life uses kₑ and applies to first-order elimination; time to eliminate uses Vmax and
                        applies to zero-order elimination.
                    </p>
                </CalcSection>
            )}

            {sim && chartOk && (
                <CalcSection
                    title="Concentration–time profile"
                    description="Simulated plasma concentration (mg/L) at 0, 1, 2, 4, 6, 8, 12 and 24 hours."
                >
                    <div className="-ml-2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sim.rows} margin={{ top: 10, right: 12, left: 4, bottom: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="time"
                                    type="number"
                                    domain={[0, 24]}
                                    ticks={[0, 2, 4, 6, 8, 12, 24]}
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    label={{ value: "Time (h)", position: "insideBottom", offset: -8, fontSize: 11 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    width={44}
                                    label={{ value: "Conc (mg/L)", angle: -90, position: "insideLeft", offset: 12, fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value) => Number(value).toFixed(2)}
                                    labelFormatter={(label) => `${label} h`}
                                />
                                <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12 }} />
                                {series.map((key) => (
                                    <Line
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={SERIES_COLORS[key]}
                                        strokeWidth={2}
                                        strokeDasharray={kineticsType === "comparison" && key === "Zero-Order" ? "4 4" : undefined}
                                        isAnimationActive={false}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[16rem] text-sm tabular-nums">
                            <thead>
                                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                    <th className="py-2 pr-3 font-medium">Time (h)</th>
                                    {series.map((key) => (
                                        <th key={key} className="py-2 pr-3 text-right font-medium">
                                            {key} (mg/L)
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sim.rows.map((row) => (
                                    <tr key={row.time} className="border-b border-border/60 last:border-b-0">
                                        <td className="py-2 pr-3 text-muted-foreground">{row.time}</td>
                                        {series.map((key) => (
                                            <td key={key} className="py-2 pr-3 text-right font-medium text-foreground">
                                                {row[key].toFixed(2)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Model comparison">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[18rem] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="py-2 pr-3 font-medium">Parameter</th>
                                <th className="py-2 pr-3 font-medium">First-order</th>
                                <th className="py-2 font-medium">Zero-order</th>
                            </tr>
                        </thead>
                        <tbody className="text-foreground">
                            <tr className="border-b border-border/60">
                                <td className="py-2 pr-3 text-muted-foreground">Rate</td>
                                <td className="py-2 pr-3 font-mono text-xs">k·C</td>
                                <td className="py-2 font-mono text-xs">Vmax</td>
                            </tr>
                            <tr className="border-b border-border/60">
                                <td className="py-2 pr-3 text-muted-foreground">Half-life</td>
                                <td className="py-2 pr-3">Constant</td>
                                <td className="py-2">Variable</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-3 text-muted-foreground">Examples</td>
                                <td className="py-2 pr-3">Most drugs</td>
                                <td className="py-2">Ethanol, Aspirin (high dose)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>First-order:  C(t) = C₀ · e^(−kₑ·t)     t½ = 0.693 / kₑ</Formula>
                <Formula>Zero-order:  C(t) = max(0, C₀ − Vmax·t)     time to eliminate = C₀ / Vmax</Formula>
                <Formula>Michaelis–Menten:  rate = Vmax·C / (Km + C)</Formula>
                <p>
                    The mixed curve is built step by step: between each pair of sampling times the rate is
                    worked out from the concentration at the start of the step and held constant for the whole
                    step (simple Euler integration), and the concentration is not allowed to go below zero.
                </p>
                <p>
                    When C is much smaller than Km, the Michaelis–Menten rate is roughly (Vmax/Km)·C —
                    first-order. When C is much larger than Km, it approaches Vmax — zero-order.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "How do I tell first-order from zero-order on a graph?",
                        a: "Plot the log of concentration against time. First-order elimination gives a straight line; zero-order gives a straight line on the ordinary (linear) axis instead, and curves downward on the log plot.",
                    },
                    {
                        q: "Why is phenytoin dangerous to increase?",
                        a: "Its usual therapeutic levels are close to its Km, so elimination is already partly saturated. A small dose increase pushes it towards zero-order, and the steady-state level can rise far more than proportionally — hence routine monitoring.",
                    },
                    {
                        q: "Why is the mixed curve jagged or reaching zero early?",
                        a: "The simulation only steps between the listed sampling times, some of which are 4–12 hours apart. Over a long step the rate is overestimated, so the curve can drop too fast. Treat it as a qualitative picture, not a prediction.",
                    },
                    {
                        q: "What units should Vmax and Km be in?",
                        a: "Here both are concentration-based: Vmax in mg/L per hour and Km in mg/L, matching C₀ in mg/L. Clinical phenytoin dosing often quotes Vmax in mg/day instead, which is a dosing rate, not a concentration rate.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
