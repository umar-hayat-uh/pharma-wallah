"use client";

import { useMemo, useState } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
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

/** The bands a systematic review of 122 studies settled on. */
const SCALE = [
    { range: "R < 1.2", label: "No to weak accumulation" },
    { range: "1.2 – 2", label: "Weak accumulation" },
    { range: "2 – 5", label: "Moderate accumulation" },
    { range: "R ≥ 5", label: "Strong accumulation" },
];

const SAMPLES = [
    { name: "Once daily, t½ 24 h", t: "24", tau: "24" },
    { name: "Twice daily, t½ 24 h", t: "24", tau: "12" },
    { name: "Short t½ 4 h, q8h", t: "4", tau: "8" },
    { name: "Long t½ 72 h, daily", t: "72", tau: "24" },
];

export default function AccumulationIndexCalculator() {
    const [halfLife, setHalfLife] = useState("24");
    const [interval, setDoseInterval] = useState("24");

    /*
     * Derived rather than held in state and refreshed from a useEffect, which
     * previously left the displayed figures one render behind the inputs. The
     * arithmetic is unchanged.
     */
    const result = useMemo(() => {
        const t12 = parseFloat(halfLife);
        const tau = parseFloat(interval);
        if (isNaN(t12) || isNaN(tau) || t12 <= 0 || tau <= 0) return null;

        const k = 0.693 / t12;
        const R = 1 / (1 - Math.exp(-k * tau));
        const ssFraction = (1 - Math.exp(-k * tau * 4)) * 100;

        let interpretation: string;
        let tone: ResultTone;
        if (R < 1.2) {
            interpretation = "Minimal accumulation — suitable for once-daily dosing.";
            tone = "success";
        } else if (R < 2) {
            interpretation = "Weak accumulation — monitor for side effects.";
            tone = "success";
        } else if (R < 5) {
            interpretation = "Moderate accumulation — consider a dose adjustment.";
            tone = "warning";
        } else {
            interpretation =
                "Strong accumulation — risk of toxicity; therapeutic drug monitoring is advisable.";
            tone = "danger";
        }

        return { k, R, ssFraction, interpretation, tone };
    }, [halfLife, interval]);

    const reset = () => {
        setHalfLife("24");
        setDoseInterval("24");
    };

    return (
        <CalculatorShell
            title="Accumulation Index Calculator"
            subtitle="How much a drug builds up when the next dose arrives before the last has cleared."
            icon={TrendingUp}
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Give a dose before the previous one has been eliminated and the drug
                            accumulates. The <strong>accumulation index (R)</strong> is the ratio of the
                            steady-state concentration to the concentration after a single dose — so
                            R = 3 means the patient ends up with three times the exposure of the first dose.
                        </p>
                        <p>
                            R depends on only two things: the elimination half-life and the dosing
                            interval. It does not depend on the size of the dose.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Choosing a dosing interval for a drug with a long half-life",
                                "Explaining why a patient deteriorates on day 3 rather than day 1",
                                "Deciding whether a loading dose is needed",
                                "Anticipating how long until steady state is reached",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Assumptions"
                            items={[
                                "First-order elimination — not valid for phenytoin or ethanol",
                                "One-compartment behaviour with linear kinetics",
                                "A constant dose given at a constant interval",
                                "Unchanged clearance — renal or hepatic decline raises R",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Accumulation index (R)"
                value={result ? result.R.toFixed(2) : null}
                unit="×"
                interpretation={result?.interpretation}
                tone={result?.tone ?? "neutral"}
                empty="Enter a half-life and a dosing interval to see the accumulation."
            />

            <CalcSection title="Dosing parameters">
                <FieldGrid>
                    <NumberField
                        label="Elimination half-life (t½)"
                        value={halfLife}
                        onChange={setHalfLife}
                        unit="h"
                        step="0.1"
                        min={0}
                        hint="Time for the concentration to fall by half."
                    />
                    <NumberField
                        label="Dosing interval (τ)"
                        value={interval}
                        onChange={setDoseInterval}
                        unit="h"
                        step="0.1"
                        min={0}
                        hint="24 for once daily, 12 for twice daily, 8 for three times daily."
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
                                    setHalfLife(sample.t);
                                    setDoseInterval(sample.tau);
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
                        <ResultRow
                            label="Elimination rate constant (k)"
                            value={result.k.toFixed(4)}
                            unit="h⁻¹"
                        />
                        <ResultRow
                            label="Fraction of steady state after 4 half-lives"
                            value={`${result.ssFraction.toFixed(1)}%`}
                        />
                        <ResultRow
                            label="Time to ~97% of steady state"
                            value={(parseFloat(halfLife) * 5).toFixed(1)}
                            unit="h"
                        />
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Accumulation scale">
                <div>
                    {SCALE.map((band) => (
                        <ResultRow key={band.range} label={band.range} value={band.label} />
                    ))}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>k = 0.693 / t½</Formula>
                <Formula>R = 1 / (1 − e^(−k · τ))</Formula>
                <p>
                    The exponential term is the fraction of drug still present when the next dose is
                    given. If half remains, the next dose lands on top of it, then the one after lands
                    on top of that — and the series converges on R times the single-dose concentration.
                </p>
                <p>
                    Dose an interval equal to the half-life and R is 2. Dose every half-life for a drug
                    with a long half-life and R grows quickly, which is why a long-half-life drug given
                    frequently is the classic recipe for delayed toxicity.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Does a bigger dose cause more accumulation?",
                        a: "No. R depends only on the half-life and the interval. A bigger dose raises every concentration proportionally, but the ratio of steady state to first dose is unchanged.",
                    },
                    {
                        q: "How long until steady state?",
                        a: "About 4 half-lives gets you to 94% and 5 half-lives to 97%, whatever the interval. This is why a loading dose exists: for a drug with a 72-hour half-life, waiting for steady state means waiting the better part of a fortnight.",
                    },
                    {
                        q: "What counts as a worrying R?",
                        a: "There is no universal threshold — it depends on the therapeutic index. R of 5 for a drug with a wide margin may be fine; R of 2 for digoxin or lithium is worth planning around. Use the value to decide whether monitoring is needed, not as a pass/fail.",
                    },
                    {
                        q: "Can I reduce accumulation without changing the total daily dose?",
                        a: "Not meaningfully. R is set by τ relative to t½, so lengthening the interval lowers R but also lowers the average concentration unless each dose is made larger. The trade is between a flat profile with more frequent dosing and bigger peaks and troughs with less frequent dosing.",
                    },
                    {
                        q: "Why does the formula use 0.693?",
                        a: "It is the natural logarithm of 2. First-order elimination is exponential, so the constant that turns a half-life into a rate constant is ln 2.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
