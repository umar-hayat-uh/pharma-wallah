"use client";

import { useMemo, useState } from "react";
import { Beaker, RefreshCw } from "lucide-react";
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
    ResultCard,
    ResultRow,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    AdSlot,
} from "@/components/calculators";

/** Published D₁₂₁ values, for a sense of scale. */
const TYPICAL_D = [
    { organism: "Geobacillus stearothermophilus", d: "1.5 – 3.0" },
    { organism: "Clostridium botulinum spores", d: "0.21" },
    { organism: "Bacillus subtilis spores", d: "0.5 – 0.8" },
    { organism: "Vegetative bacteria", d: "< 0.01" },
];

const SAMPLES = [
    { name: "6-log reduction", n0: "1000000", nt: "1", t: "10" },
    { name: "3-log reduction", n0: "1000000", nt: "1000", t: "10" },
    { name: "Bioburden 10⁵ → 10⁰", n0: "100000", nt: "1", t: "7.5" },
    { name: "Slow 2-log", n0: "10000", nt: "100", t: "12" },
];

export default function DValueCalculator() {
    const [initialCount, setInitialCount] = useState("1000000");
    const [finalCount, setFinalCount] = useState("1000");
    const [time, setTime] = useState("10");
    const [temperature, setTemperature] = useState("121");

    /*
     * Derived rather than written into state from a useEffect — the previous
     * version also silently kept the last valid result on screen when the input
     * became invalid. The arithmetic is unchanged.
     */
    const result = useMemo(() => {
        const N0 = parseFloat(initialCount);
        const Nt = parseFloat(finalCount);
        const t = parseFloat(time);

        if (isNaN(N0) || isNaN(Nt) || isNaN(t) || N0 <= 0 || Nt <= 0) return null;
        if (Nt >= N0) {
            return {
                error: "The surviving count must be lower than the starting count.",
            } as const;
        }

        const logReduction = Math.log10(N0 / Nt);
        const D = t / logReduction;

        // Survivor curve: a straight line on a log scale, which is the whole point.
        const curve = Array.from({ length: 61 }, (_, minute) => ({
            time: minute,
            logCount: Math.log10(N0 * Math.pow(10, -minute / D)),
        }));

        return { D, logReduction, curve } as const;
    }, [initialCount, finalCount, time]);

    const reset = () => {
        setInitialCount("1000000");
        setFinalCount("1000");
        setTime("10");
        setTemperature("121");
    };

    const hasValue = result !== null && !("error" in result);

    return (
        <CalculatorShell
            title="D-Value Calculator"
            subtitle="Decimal reduction time — the minutes needed to kill 90% of a microbial population."
            icon={Beaker}
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            The <strong>D-value</strong>, or decimal reduction time, is the exposure time
                            that reduces a microbial population by one log — that is, to a tenth of what
                            it was. It is the fundamental measure of how resistant an organism is to a
                            given lethal process.
                        </p>
                        <p>
                            Because killing follows first-order kinetics, each successive D-value removes
                            another 90% of whatever is left. That is why a survivor curve is a straight
                            line when plotted on a log scale, and why sterility is expressed as a
                            probability rather than an absolute.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Characterising a biological indicator or a resistant isolate",
                                "Designing a sterilisation or pasteurisation cycle",
                                "Converting a bioburden reduction into a required hold time",
                                "Teaching first-order death kinetics",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Remember"
                            items={[
                                "D is specific to one organism, one temperature and one medium",
                                "Changing the temperature changes D — that relationship is the z-value",
                                "Real survivor curves can show shoulders or tails that this model ignores",
                                "Counts below about 10 CFU carry large counting error",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="D-value"
                value={hasValue ? result.D.toFixed(2) : null}
                unit="min"
                interpretation={
                    hasValue
                        ? `Each ${result.D.toFixed(2)} minutes at ${temperature} °C removes 90% of the surviving population.`
                        : result && "error" in result
                          ? result.error
                          : undefined
                }
                tone={result && "error" in result ? "danger" : "neutral"}
                empty="Enter a starting count, a surviving count and an exposure time."
            />

            <CalcSection title="Experimental data">
                <FieldGrid>
                    <NumberField
                        label="Starting count (N₀)"
                        value={initialCount}
                        onChange={setInitialCount}
                        unit="CFU"
                        step="1"
                        min={0}
                        hint="Population before exposure."
                    />
                    <NumberField
                        label="Surviving count (N)"
                        value={finalCount}
                        onChange={setFinalCount}
                        unit="CFU"
                        step="1"
                        min={0}
                        hint="Population after exposure. Must be lower than N₀."
                    />
                    <NumberField
                        label="Exposure time"
                        value={time}
                        onChange={setTime}
                        unit="min"
                        step="0.1"
                        min={0}
                        hint="How long the population was held at the process temperature."
                    />
                    <NumberField
                        label="Process temperature"
                        value={temperature}
                        onChange={setTemperature}
                        unit="°C"
                        step="1"
                        hint="Recorded for reference — D is only meaningful with its temperature."
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
                                    setInitialCount(sample.n0);
                                    setFinalCount(sample.nt);
                                    setTime(sample.t);
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

            {hasValue && (
                <>
                    <CalcSection title="Working">
                        <div>
                            <ResultRow
                                label="Log reduction achieved"
                                value={result.logReduction.toFixed(2)}
                                unit="log"
                            />
                            <ResultRow label="D-value" value={`${result.D.toFixed(2)}`} unit={`min at ${temperature} °C`} />
                            <ResultRow
                                label="Time for a 6-log reduction"
                                value={(result.D * 6).toFixed(2)}
                                unit="min"
                            />
                            <ResultRow
                                label="Time for a 12-log reduction"
                                value={(result.D * 12).toFixed(2)}
                                unit="min"
                            />
                        </div>
                    </CalcSection>

                    <CalcSection
                        title="Survivor curve"
                        description="First-order death makes this a straight line on a log scale — one D-value per decade."
                    >
                        <div className="h-56 -ml-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={result.curve}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="time"
                                        tick={{ fontSize: 11 }}
                                        stroke="hsl(var(--muted-foreground))"
                                        label={{ value: "Minutes", position: "insideBottom", offset: -4, fontSize: 11 }}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11 }}
                                        stroke="hsl(var(--muted-foreground))"
                                        label={{ value: "log₁₀ CFU", angle: -90, position: "insideLeft", fontSize: 11 }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [Number(value).toFixed(2), "log₁₀ CFU"]}
                                        labelFormatter={(label) => `${label} min`}
                                    />
                                    <Line type="monotone" dataKey="logCount" stroke="#2563EB" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CalcSection>
                </>
            )}

            <CalcSection
                title="Typical D₁₂₁ values"
                description="Minutes at 121 °C in saturated steam."
            >
                <div>
                    {TYPICAL_D.map((row) => (
                        <ResultRow key={row.organism} label={row.organism} value={row.d} unit="min" />
                    ))}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>Log reduction = log₁₀(N₀ / N)</Formula>
                <Formula>D = exposure time / log reduction</Formula>
                <p>
                    Microbial death under a constant lethal stress is first-order: a fixed{" "}
                    <em>fraction</em> dies per unit time, not a fixed number. So the time to drop from
                    10⁶ to 10⁵ is the same as the time to drop from 10² to 10¹ — and that time is the
                    D-value.
                </p>
                <p>
                    It follows that no finite process reaches zero organisms. Sterility assurance is
                    defined as a probability instead: a SAL of 10⁻⁶ means no more than one chance in a
                    million that a single unit is non-sterile.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is the difference between D-value and z-value?",
                        a: "D is the time for one log reduction at a single temperature. z is how many degrees the temperature must change to change D tenfold. D tells you how long; z tells you how the process responds when you turn up the heat.",
                    },
                    {
                        q: "Why does the survivor curve never reach zero?",
                        a: "Because each D-value removes 90% of what remains, not a fixed count. Ten organisms become one, one becomes a 10% chance of one, and so on. This is why sterilisation is validated to a sterility assurance level rather than to absolute sterility.",
                    },
                    {
                        q: "My curve has a shoulder or a tail. Is the D-value still valid?",
                        a: "Only over the log-linear portion. Shoulders (a lag before killing starts) and tails (a stubborn resistant subpopulation) both break the first-order assumption, and a single D calculated across them will be misleading. Fit D to the straight section and report the deviation separately.",
                    },
                    {
                        q: "Does the medium matter?",
                        a: "Considerably. Fat, sugar, protein and low water activity all protect organisms, so a spore suspended in oil can have a D-value many times its value in water. A D-value is only transferable between identical matrices.",
                    },
                    {
                        q: "How does D relate to the F₀ of a cycle?",
                        a: "F = D × log reduction. Once you know the D-value of the target organism and the log reduction you need, multiplying them gives the hold time the cycle must deliver — which is what the F-value calculator does.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
