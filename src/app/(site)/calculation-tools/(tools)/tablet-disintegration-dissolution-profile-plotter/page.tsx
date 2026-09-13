"use client";

import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { Plus, RefreshCw, Tablet, Trash2 } from "lucide-react";
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
import {
    DEFAULT_POINTS,
    SAMPLE_PROFILES,
    profileParameters,
    type Crossing,
    type ProfileKey,
    type TimePoint,
} from "./_profile";

const MIN_POINTS = 2;

/** "(50 − 25) ÷ (60 − 25) × (15 − 10)" — the numbers behind an interpolated time. */
function substitution(crossing: Crossing, key: ProfileKey) {
    const { prev, curr, threshold } = crossing;
    if (!prev) return `first point already ≥ ${threshold}% → t = ${curr.time}`;
    return `${prev.time} + (${threshold} − ${prev[key]}) ÷ (${curr[key]} − ${prev[key]}) × (${curr.time} − ${prev.time})`;
}

export default function TabletProfilePlotter() {
    const [timePoints, setTimePoints] = useState<TimePoint[]>(DEFAULT_POINTS);
    const [newTime, setNewTime] = useState("");
    const [newDisintegration, setNewDisintegration] = useState("");
    const [newDissolution, setNewDissolution] = useState("");

    /*
     * Live. The original only updated T₅₀/T₉₀/Td after "Calculate Parameters",
     * and kept showing them after the data changed; the Q check was already live.
     */
    const params = useMemo(() => profileParameters(timePoints), [timePoints]);

    /* ── New-point validation (replaces the original's alert() dialogs, same rules) ── */
    const time = parseFloat(newTime);
    const disint = parseFloat(newDisintegration);
    const dissol = parseFloat(newDissolution);
    const pctError = (raw: string, value: number) =>
        raw.trim() === "" ? undefined : isNaN(value) ? "Enter a number." : value < 0 || value > 100 ? "Must be between 0 and 100." : undefined;
    const timeError = newTime.trim() === "" ? undefined : isNaN(time) ? "Enter a number." : time < 0 ? "Cannot be negative." : undefined;
    const disError = pctError(newDisintegration, disint);
    const dissError = pctError(newDissolution, dissol);
    const canAdd = !isNaN(time) && !isNaN(disint) && !isNaN(dissol) && !timeError && !disError && !dissError;

    const addTimePoint = () => {
        if (!canAdd) return;
        const newPoint = { time, disintegration: disint, dissolution: dissol };
        setTimePoints([...timePoints, newPoint].sort((a, b) => a.time - b.time));
        setNewTime("");
        setNewDisintegration("");
        setNewDissolution("");
    };

    const removeTimePoint = (index: number) => {
        if (timePoints.length <= MIN_POINTS) return;
        setTimePoints(timePoints.filter((_, i) => i !== index));
    };

    const loadSample = (index: number) => {
        setTimePoints(
            SAMPLE_PROFILES[index].data.map((d) => ({ time: d.time, disintegration: d.dis, dissolution: d.diss })),
        );
    };

    const reset = () => {
        setTimePoints(DEFAULT_POINTS);
        setNewTime("");
        setNewDisintegration("");
        setNewDissolution("");
    };

    const q = params.q;
    const qTone: ResultTone = q ? (q.meets ? "success" : "warning") : "neutral";
    const qText = q
        ? `${q.meets ? "Meets" : "Below"} Q = 80% — ${q.value.toFixed(1)}% dissolved at 30 min`
        : "No 30-min point — add one to check Q = 80%";

    const rows: { label: string; crossing: Crossing | null; key: ProfileKey; hint: string }[] = [
        { label: "Disintegration time (Td)", crossing: params.td, key: "disintegration", hint: "Time for 100% disintegration" },
        { label: "T₅₀ disintegration", crossing: params.t50Disintegration, key: "disintegration", hint: "Time to 50% disintegrated" },
        { label: "T₅₀ dissolution", crossing: params.t50Dissolution, key: "dissolution", hint: "Time to 50% dissolved" },
        { label: "T₉₀ dissolution", crossing: params.t90, key: "dissolution", hint: "Time to 90% dissolved" },
    ];

    return (
        <CalculatorShell
            title="Tablet Disintegration & Dissolution Profile Plotter"
            subtitle="Plots a tablet's disintegration and dissolution over time and reads off Td, T₅₀, T₉₀ and the USP Q = 80% check."
            icon={Tablet}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About this plotter">
                        <p>
                            Enter the percentage disintegrated and dissolved at each sampling time.
                            Characteristic times are read by straight-line interpolation between the
                            two points either side of the threshold.
                        </p>
                        <CalcList
                            title="USP <711> acceptance"
                            items={[
                                "S1 (n = 6): each unit ≥ Q + 5%",
                                "S2 (n = 12): average ≥ Q, no unit < Q − 15%",
                                "S3 (n = 24): average ≥ Q, ≤ 2 units < Q − 15%, none < Q − 25%",
                            ]}
                        />
                        <CalcList
                            title="IVIVC correlation levels"
                            items={[
                                "Level A: point-to-point relationship",
                                "Level B: statistical moments (MDT vs MRT)",
                                "Level C: single point (T₅₀, T₉₀ vs Cmax, AUC)",
                            ]}
                        />
                        <CalcList
                            title="ODT requirements"
                            items={[
                                "Disintegration ≤ 30 seconds",
                                "Tablet weight ≤ 500 mg",
                                "No need for water",
                                "Rapid oral disintegration",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Read with care"
                            items={[
                                "The Q check uses only a data point at exactly 30 min — it is not interpolated",
                                "Interpolated times are only as good as your sampling density",
                                "Enter mean values; USP acceptance is judged on individual units",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="T₅₀ dissolution"
                value={params.t50Dissolution ? params.t50Dissolution.value.toFixed(1) : null}
                unit="min"
                interpretation={qText}
                tone={qTone}
                empty={`Dissolution never reaches 50% in this data. ${qText}.`}
            />

            <CalcSection title="Key parameters" description="Updated live as you edit the data.">
                <div>
                    {rows.map((row) => (
                        <ResultRow
                            key={row.label}
                            label={row.label}
                            value={row.crossing ? row.crossing.value.toFixed(1) : "Not reached"}
                            unit={row.crossing ? "min" : undefined}
                        />
                    ))}
                    <ResultRow
                        label="Dissolved at 30 min (Q = 80%)"
                        value={q ? `${q.value.toFixed(1)}%` : "No 30-min point"}
                        badge={q ? (q.meets ? "Meets" : "Below") : undefined}
                        badgeTone={q?.meets ? "success" : "warning"}
                    />
                </div>
            </CalcSection>

            <CalcSection title="Profile data" description="Time in minutes; disintegration and dissolution in % (0–100).">
                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_PROFILES.map((sample, index) => (
                            <button
                                key={sample.short}
                                type="button"
                                onClick={() => loadSample(index)}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {sample.name} ({sample.short})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 rounded-xl border border-border/80 bg-muted/30 p-3.5">
                    <p className="text-[13px] font-medium text-foreground/90">Add a time point</p>
                    <FieldGrid className="lg:grid-cols-3">
                        <NumberField
                            label="Time"
                            value={newTime}
                            onChange={setNewTime}
                            unit="min"
                            step="0.1"
                            min={0}
                            placeholder="e.g., 15"
                            error={timeError}
                            hint="Sampling time"
                        />
                        <NumberField
                            label="Disintegration"
                            value={newDisintegration}
                            onChange={setNewDisintegration}
                            unit="%"
                            step="0.1"
                            min={0}
                            max={100}
                            placeholder="0–100"
                            error={disError}
                            hint="Share of tablet broken up"
                        />
                        <NumberField
                            label="Dissolution"
                            value={newDissolution}
                            onChange={setNewDissolution}
                            unit="%"
                            step="0.1"
                            min={0}
                            max={100}
                            placeholder="0–100"
                            error={dissError}
                            hint="Drug dissolved, % of label claim"
                        />
                    </FieldGrid>
                    <Button onClick={addTimePoint} disabled={!canAdd} className="w-full">
                        <Plus />
                        Add point
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-border/80">
                    <table className="w-full min-w-[320px] text-sm">
                        <thead>
                            <tr className="bg-muted/60 text-left text-xs text-muted-foreground">
                                <th className="px-3 py-2.5 font-medium">Time (min)</th>
                                <th className="px-3 py-2.5 font-medium">Disint. (%)</th>
                                <th className="px-3 py-2.5 font-medium">Dissol. (%)</th>
                                <th className="px-3 py-2.5 text-right font-medium">
                                    <span className="sr-only">Remove</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="tabular-nums">
                            {timePoints.map((point, index) => (
                                <tr key={index} className="border-t border-border/70">
                                    <td className="px-3 py-1.5 font-medium text-foreground">{point.time}</td>
                                    <td className={point.disintegration >= 100 ? "px-3 py-1.5 font-semibold text-emerald-600" : "px-3 py-1.5"}>
                                        {point.disintegration}%
                                    </td>
                                    <td className={point.dissolution >= 80 ? "px-3 py-1.5 font-semibold text-emerald-600" : "px-3 py-1.5"}>
                                        {point.dissolution}%
                                    </td>
                                    <td className="px-1 py-1 text-right">
                                        <button
                                            type="button"
                                            onClick={() => removeTimePoint(index)}
                                            disabled={timePoints.length <= MIN_POINTS}
                                            aria-label={`Remove point at ${point.time} min`}
                                            className="inline-grid h-10 w-10 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-950/30"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {timePoints.length <= MIN_POINTS && (
                    <p className="text-xs text-muted-foreground">At least 2 time points are required.</p>
                )}

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            <CalcSection title="Profile plot" description="Dashed lines mark 50% and the Q = 80% acceptance level.">
                <div className="h-72 sm:h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timePoints} margin={{ top: 16, right: 12, left: 0, bottom: 24 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis
                                dataKey="time"
                                label={{ value: "Time (minutes)", position: "insideBottom", offset: -12, fontSize: 12 }}
                                domain={[0, "dataMax"]}
                                tick={{ fontSize: 11 }}
                                stroke="hsl(var(--muted-foreground))"
                            />
                            <YAxis
                                label={{ value: "Percentage (%)", angle: -90, position: "insideLeft", offset: 12, fontSize: 12 }}
                                domain={[0, 100]}
                                tick={{ fontSize: 11 }}
                                width={44}
                                stroke="hsl(var(--muted-foreground))"
                            />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12 }} />
                            <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Q = 80%", position: "insideTopRight", fontSize: 11 }} />
                            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "50%", position: "insideTopRight", fontSize: 11 }} />
                            <Line type="monotone" dataKey="disintegration" stroke="#2563eb" strokeWidth={3} name="Disintegration" dot={{ r: 5 }} activeDot={{ r: 7 }} />
                            <Line type="monotone" dataKey="dissolution" stroke="#10b981" strokeWidth={3} name="Dissolution" dot={{ r: 5 }} activeDot={{ r: 7 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CalcSection>

            <CalcSection title="Working" description="Linear interpolation between the points either side of each threshold.">
                <div>
                    {rows.map((row) => (
                        <div key={row.label} className="border-b border-border/70 py-3 last:border-b-0">
                            <div className="flex items-baseline justify-between gap-3">
                                <span className="text-sm text-muted-foreground">{row.label}</span>
                                <span className="text-[15px] font-semibold tabular-nums text-foreground">
                                    {row.crossing ? `${row.crossing.value.toFixed(1)} min` : "Not reached"}
                                </span>
                            </div>
                            <p className="mt-1 break-words font-mono text-xs text-muted-foreground">
                                {row.crossing
                                    ? `t = ${substitution(row.crossing, row.key)}`
                                    : `${row.hint}: no point reaches the threshold`}
                            </p>
                        </div>
                    ))}
                </div>
            </CalcSection>

            <CalcSection title="Dissolution requirements by dosage form">
                <div className="overflow-x-auto rounded-xl border border-border/80">
                    <table className="w-full min-w-[560px] text-sm">
                        <thead>
                            <tr className="bg-muted/60 text-left text-xs text-muted-foreground">
                                <th className="px-3 py-2.5 font-medium">Dosage form</th>
                                <th className="px-3 py-2.5 font-medium">Apparatus</th>
                                <th className="px-3 py-2.5 font-medium">Speed (rpm)</th>
                                <th className="px-3 py-2.5 font-medium">Medium</th>
                                <th className="px-3 py-2.5 font-medium">Q value</th>
                                <th className="px-3 py-2.5 font-medium">Time point</th>
                            </tr>
                        </thead>
                        <tbody className="[&_td]:px-3 [&_td]:py-2.5 [&_tr]:border-t [&_tr]:border-border/70">
                            <tr><td className="font-medium">Immediate Release</td><td>I or II</td><td>50-100</td><td>0.1N HCl, buffer</td><td>75-80%</td><td>30-45 min</td></tr>
                            <tr><td className="font-medium">Extended Release</td><td>I or II</td><td>50-100</td><td>Multiple pH</td><td>Varies</td><td>Multiple</td></tr>
                            <tr><td className="font-medium">Enteric Coated</td><td>I or II</td><td>50-100</td><td>Acid then buffer</td><td>75% (buffer)</td><td>45-120 min</td></tr>
                            <tr><td className="font-medium">Orally Disintegrating</td><td>USP &lt;701&gt;</td><td>N/A</td><td>Water</td><td>N/A</td><td>≤30 sec</td></tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-muted-foreground">Source: USP &lt;701&gt;, &lt;711&gt;; FDA guidance.</p>
            </CalcSection>

            <FormulaNote>
                <Formula>t = t₁ + (X − y₁) ÷ (y₂ − y₁) × (t₂ − t₁)</Formula>
                <p>
                    X is the threshold (50% for T₅₀, 90% for T₉₀, 100% for disintegration time Td).
                    (t₂, y₂) is the first point at or above X and (t₁, y₁) the point before it. If the
                    very first point already meets X, its time is used.
                </p>
                <Formula>Q check: % dissolved at the 30-min point ≥ 80%</Formula>
                <p>Profile similarity between a test (T) and reference (R) product uses the f₂ factor:</p>
                <Formula>{"f₂ = 50·log{[1 + (1/n)Σ(Rᵢ − Tᵢ)²]⁻⁰·⁵ × 100}"}</Formula>
                <p>
                    f₂ ≥ 50 indicates similarity. If ≥ 85% is dissolved in 15 min, profiles are
                    considered similar without f₂.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is the difference between disintegration and dissolution?",
                        a: "Disintegration is the tablet breaking into particles (USP <701>); dissolution is the drug going into solution (USP <711>). A tablet can disintegrate quickly and still dissolve slowly, which is why both curves are plotted.",
                    },
                    {
                        q: "Why does the Q check say there is no 30-min point?",
                        a: "The check looks for a sampling time of exactly 30 minutes and uses the measured value there — it does not interpolate. Add a 30-min time point to see it.",
                    },
                    {
                        q: "Why is T₉₀ 'Not reached'?",
                        a: "None of your points reaches 90% dissolved, so there is nothing to interpolate to. Extend the sampling time or check that percentages are of label claim.",
                    },
                    {
                        q: "Does the order I add points in matter?",
                        a: "No. Points are sorted by time as they are added, and every interpolated time is taken from neighbouring rows in that sorted order.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
