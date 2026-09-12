"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Timer } from "lucide-react";
import {
    CartesianGrid,
    Line,
    LineChart,
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
} from "@/components/calculators";

type Method = "halfLife" | "aucAumc";

const METHODS = [
    { value: "halfLife", label: "From half-life (MRT = 1.44 × t½)" },
    { value: "aucAumc", label: "From AUC and AUMC (MRT = AUMC / AUC)" },
];

/*
 * The illustrative curves are fixed — they show what AUMC *is*, not the user's
 * data — so they are computed once at module scope rather than on every render.
 */
const CONCEPT_DATA = Array.from({ length: 21 }, (_, index) => {
    const time = index * 0.25;
    return { time, c: Math.exp(-time), t: time * Math.exp(-time) };
});

export default function MeanResidenceTimeCalculator() {
    const [method, setMethod] = useState<Method>("halfLife");
    const [halfLife, setHalfLife] = useState("24");
    const [auc, setAuc] = useState("100");
    const [aumc, setAumc] = useState("2400");

    /* Derived, not stored — the arithmetic itself is unchanged. */
    const mrt = useMemo(() => {
        if (method === "halfLife") {
            const t12 = parseFloat(halfLife);
            if (isNaN(t12) || t12 <= 0) return null;
            return 1.44 * t12;
        }
        const aucValue = parseFloat(auc);
        const aumcValue = parseFloat(aumc);
        if (isNaN(aucValue) || isNaN(aumcValue) || aucValue <= 0) return null;
        return aumcValue / aucValue;
    }, [method, halfLife, auc, aumc]);

    const reset = () => {
        setHalfLife("24");
        setAuc("100");
        setAumc("2400");
    };

    return (
        <CalculatorShell
            title="Mean Residence Time Calculator"
            subtitle="The average time a drug molecule spends in the body before it is eliminated."
            icon={Timer}
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            <strong>Mean residence time (MRT)</strong> is the average time a single drug
                            molecule stays in the body. Where half-life describes how fast the
                            concentration falls, MRT describes how long the drug persists on average —
                            a statistical property of the whole dose rather than of the curve&apos;s slope.
                        </p>
                        <p>
                            MRT is a <em>non-compartmental</em> parameter: the AUMC/AUC route makes no
                            assumption about how many compartments the drug distributes into, which is
                            why it is the preferred method in modern pharmacokinetic analysis.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Comparing formulations — a slower release raises MRT",
                                "Characterising a drug without assuming a compartment model",
                                "Deriving steady-state volume of distribution (Vss = CL × MRT)",
                                "Teaching the difference between persistence and half-life",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch for"
                            items={[
                                "MRT = 1.44 × t½ holds only for a one-compartment IV bolus",
                                "After oral dosing, MRT includes absorption time (MAT)",
                                "AUMC is very sensitive to how the terminal tail is extrapolated",
                                "AUC and AUMC must be extrapolated to infinity, not just to the last sample",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Mean residence time"
                value={mrt !== null ? mrt.toFixed(2) : null}
                unit="h"
                interpretation={
                    mrt !== null
                        ? method === "halfLife"
                            ? "Estimated from half-life, assuming one-compartment IV bolus kinetics."
                            : "Calculated non-compartmentally from AUMC divided by AUC."
                        : undefined
                }
                empty="Choose a method and enter the values to see the mean residence time."
            />

            <CalcSection title="Calculation method">
                <SelectField
                    label="Method"
                    value={method}
                    onChange={(next) => setMethod(next as Method)}
                    options={METHODS}
                    hint="AUMC/AUC is preferred when you have the concentration–time data."
                />

                {method === "halfLife" ? (
                    <NumberField
                        label="Elimination half-life (t½)"
                        value={halfLife}
                        onChange={setHalfLife}
                        unit="h"
                        step="0.1"
                        min={0}
                        hint="Valid only for a one-compartment drug given as an IV bolus."
                    />
                ) : (
                    <FieldGrid>
                        <NumberField
                            label="AUC₀–∞"
                            value={auc}
                            onChange={setAuc}
                            unit="mg·h/L"
                            step="1"
                            min={0}
                            hint="Area under the concentration–time curve, extrapolated to infinity."
                        />
                        <NumberField
                            label="AUMC₀–∞"
                            value={aumc}
                            onChange={setAumc}
                            unit="mg·h²/L"
                            step="1"
                            min={0}
                            hint="Area under the first moment curve — the area under t × C(t)."
                        />
                    </FieldGrid>
                )}

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {mrt !== null && (
                <CalcSection title="Working">
                    <div>
                        <ResultRow label="Mean residence time" value={mrt.toFixed(2)} unit="h" />
                        {method === "halfLife" ? (
                            <ResultRow label="Half-life used" value={halfLife} unit="h" />
                        ) : (
                            <>
                                <ResultRow label="AUC₀–∞" value={auc} unit="mg·h/L" />
                                <ResultRow label="AUMC₀–∞" value={aumc} unit="mg·h²/L" />
                            </>
                        )}
                        <ResultRow
                            label="Equivalent half-life"
                            value={(mrt / 1.44).toFixed(2)}
                            unit="h"
                        />
                    </div>
                </CalcSection>
            )}

            <CalcSection
                title="What AUMC means"
                description="Blue is the concentration curve C(t). Green is t × C(t) — AUMC is the area beneath it."
            >
                <div className="h-52 -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={CONCEPT_DATA}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 11 }}
                                stroke="hsl(var(--muted-foreground))"
                            />
                            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                            <Tooltip />
                            <Line type="monotone" dataKey="c" stroke="#2563EB" dot={false} name="C(t)" />
                            <Line type="monotone" dataKey="t" stroke="#16A34A" dot={false} name="t × C(t)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>MRT = AUMC₀–∞ / AUC₀–∞</Formula>
                <Formula>MRT = 1.44 × t½   (one-compartment IV bolus only)</Formula>
                <p>
                    AUC is the area under the concentration curve. AUMC is the area under the same
                    curve after every point has been multiplied by its own time — the &quot;first
                    moment&quot;. Dividing one by the other gives a time-weighted average, which is
                    exactly what a mean residence time is.
                </p>
                <p>
                    The 1.44 shortcut is 1/ln 2. It applies only when elimination is monoexponential
                    from a single compartment after an IV bolus; for anything else, use AUMC/AUC.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "How is MRT different from half-life?",
                        a: "Half-life is how long the concentration takes to halve. MRT is the average time an individual molecule spends in the body. For a simple one-compartment IV drug they are proportional (MRT = 1.44 × t½), but for a two-compartment or orally absorbed drug they diverge.",
                    },
                    {
                        q: "Why is 1.44 the conversion factor?",
                        a: "MRT is 1/k and half-life is ln 2 / k, so MRT / t½ = 1 / ln 2 = 1.4427. It only holds where a single exponential describes the whole curve.",
                    },
                    {
                        q: "What is MAT?",
                        a: "Mean absorption time. After oral dosing, MRT_oral = MRT_iv + MAT, so subtracting the IV MRT from the oral MRT isolates how long absorption itself takes. It is one of the cleanest ways to compare formulations.",
                    },
                    {
                        q: "Why is AUMC considered unreliable?",
                        a: "Because multiplying by t weights the late, low, noisy concentrations most heavily, and those are precisely the points measured least accurately. The extrapolated tail can contribute a large share of AUMC, so a small error in the terminal rate constant moves MRT a lot.",
                    },
                    {
                        q: "How do I get the steady-state volume of distribution from this?",
                        a: "Vss = CL × MRT, where CL is Dose/AUC after an IV dose. Vss derived this way is model-independent, which is why it is preferred over the older Varea.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
