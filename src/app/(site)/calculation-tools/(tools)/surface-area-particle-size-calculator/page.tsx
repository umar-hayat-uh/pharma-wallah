"use client";

import { useMemo, useState } from "react";
import { Grid3x3, Layers, Plus, RefreshCw, Target, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
    LabNotice,
    type ResultTone,
} from "@/components/calculators";
import {
    calculateFromLaser,
    calculateFromSieve,
    DEFAULT_LASER,
    DEFAULT_SIEVE,
    LASER_EXAMPLES,
    SIEVE_EXAMPLES,
    type CumulativePoint,
    type Distribution,
    type LaserRow,
    type Method,
    type SieveRow,
} from "./_psd";

const DEFAULT_DENSITY = "1.5";

const DISTRIBUTION: Record<Distribution, { label: string; tone: ResultTone; badge: "success" | "warning" | "destructive" }> = {
    narrow: { label: "Narrow", tone: "success", badge: "success" },
    moderate: { label: "Moderate", tone: "warning", badge: "warning" },
    broad: { label: "Broad", tone: "danger", badge: "destructive" },
};

/** Fixed decimals as the original showed, but never "NaN", "Infinity" or "-0.0". */
function fmt(value: number, decimals: number): string {
    if (!Number.isFinite(value)) return "—";
    const text = value.toFixed(decimals);
    return /^-0\.?0*$/.test(text) ? text.slice(1) : text;
}

/** Which two points interpolateSize() used for a target — for the Working section only. */
function bracketFor(data: CumulativePoint[], target: number) {
    for (let i = 0; i < data.length - 1; i++) {
        if (target >= data[i + 1].cumulative && target <= data[i].cumulative) {
            return { upper: data[i], lower: data[i + 1] };
        }
    }
    return null;
}

const chipClass =
    "min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium transition-colors hover:bg-muted active:bg-accent";

const cellInput = "h-11 rounded-lg px-2.5 text-base font-medium";

export default function SurfaceAreaParticleSizeCalculator() {
    const [method, setMethod] = useState<Method>("sieve");
    const [sieveData, setSieveData] = useState<SieveRow[]>(DEFAULT_SIEVE);
    const [particleData, setParticleData] = useState<LaserRow[]>(DEFAULT_LASER);
    const [density, setDensity] = useState(DEFAULT_DENSITY);

    const densityNumber = parseFloat(density);
    const densityNegative = !isNaN(densityNumber) && densityNumber < 0;

    /*
     * Derived, not stored. The original computed only on "Calculate Particle
     * Size" and left the previous result on screen when validation failed; the
     * same functions now run on every edit, and a failed check shows its message.
     */
    const outcome = useMemo(
        () => (method === "sieve" ? calculateFromSieve(sieveData, density) : calculateFromLaser(particleData, density)),
        [method, sieveData, particleData, density],
    );
    const result = outcome.ok ? outcome.result : null;

    const updateSieve = (index: number, field: keyof SieveRow, value: string) =>
        setSieveData((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    const updateLaser = (index: number, field: keyof LaserRow, value: string) =>
        setParticleData((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

    const addRow = () => {
        if (method === "sieve") setSieveData((rows) => [...rows, { mesh: "0", opening: "0", retained: "0" }]);
        else setParticleData((rows) => [...rows, { size: "0", percentage: "0" }]);
    };
    const removeRow = (index: number) => {
        if (method === "sieve") setSieveData((rows) => rows.filter((_, i) => i !== index));
        else setParticleData((rows) => rows.filter((_, i) => i !== index));
    };

    const loadExample = (type: "fine" | "coarse") => {
        if (method === "sieve") setSieveData(SIEVE_EXAMPLES[type]);
        else setParticleData(LASER_EXAMPLES[type]);
    };

    const reset = () => {
        setSieveData(DEFAULT_SIEVE);
        setParticleData(DEFAULT_LASER);
        setDensity(DEFAULT_DENSITY);
    };

    const rows = method === "sieve" ? sieveData : particleData;
    const percentOf = (row: SieveRow | LaserRow) => ("retained" in row ? row.retained : row.percentage);
    const enteredTotal = rows.reduce((sum, row) => {
        const value = parseFloat(percentOf(row));
        return value >= 0 && value <= 100 ? sum + value : sum;
    }, 0);
    const totalOk = Math.abs(enteredTotal - 100) <= 5;

    const chartData = useMemo(
        () =>
            result
                ? result.cumulativeData
                      .filter((point) => Number.isFinite(point.size) && Number.isFinite(point.cumulative))
                      // The original plotted log10(max(size, 1)); a log axis cannot show 0.
                      .map((point) => ({ size: Math.max(point.size, 1), passing: point.cumulative }))
                      .sort((a, b) => a.size - b.size)
                : [],
        [result],
    );
    const chartMax = chartData.length ? Math.max(1000, ...chartData.map((point) => point.size)) : 1000;

    const reading = result ? DISTRIBUTION[result.distribution] : null;
    const pctLabel = method === "sieve" ? "% retained" : "% by volume";

    return (
        <CalculatorShell
            title="Surface Area & Particle Size Analyzer"
            subtitle="Turns sieve or laser-diffraction data into D10, D50, D90, span, mean diameter and specific surface area for a pharmaceutical powder."
            icon={Grid3x3}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About particle size analysis">
                        <p>
                            Particle size controls how fast a drug dissolves, how well a powder flows and
                            how evenly it mixes. A distribution is summarised by a few cut points and a
                            measure of its width.
                        </p>
                        <CalcList
                            title="Key definitions"
                            items={[
                                "D10, D50, D90 — the particle size below which 10%, 50% and 90% of the particles fall (D50 is the median)",
                                "Span — (D90 − D10) / D50, the width of the distribution",
                                "Specific surface area — surface area per unit mass (m²/kg)",
                            ]}
                        />
                        <CalcList
                            title="Target ranges"
                            items={[
                                "Tablet formulation: D50 50–200 μm, span < 2.0",
                                "Inhalation: D50 1–5 μm, narrow distribution",
                            ]}
                        />
                        <CalcList
                            title="Analysis methods"
                            items={["Sieve analysis: mechanical, particles > 45 μm", "Laser diffraction: 0.1–3000 μm"]}
                        />
                        <CalcList
                            tone="caution"
                            title="Quality impact"
                            items={[
                                "Dissolution: smaller particles dissolve faster",
                                "Bioavailability: particle size affects absorption",
                                "Flowability: critical for manufacturing",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch
                label="Measurement method"
                value={method}
                onChange={setMethod}
                options={[
                    { value: "sieve", label: "Sieve analysis", description: "% retained on each sieve", icon: Layers },
                    { value: "laser", label: "Laser diffraction", description: "% by volume per size class", icon: Target },
                ]}
            />

            <ResultCard
                label="D50 — median particle size"
                value={result ? fmt(result.d50, 1) : null}
                unit="μm"
                interpretation={
                    result && reading ? `${reading.label} distribution · span ${fmt(result.span, 2)}` : undefined
                }
                tone={reading?.tone ?? "neutral"}
                empty={
                    outcome.ok
                        ? undefined
                        : `${outcome.message}. ${
                              method === "sieve"
                                  ? "Adjust the % retained column below."
                                  : "Adjust the % by volume column below."
                          }`
                }
            />

            <CalcSection
                title={method === "sieve" ? "Sieve analysis data" : "Particle size distribution"}
                description={
                    method === "sieve"
                        ? "List sieves from the coarsest to the finest, ending with the pan (mesh 0, opening 0)."
                        : "Enter each size class and the % of the sample volume in it. Rows are sorted by size for you."
                }
            >
                <FieldGrid>
                    <NumberField
                        label="Particle density (g/cm³)"
                        value={density}
                        onChange={setDensity}
                        unit="g/cm³"
                        step="0.01"
                        min={0.1}
                        placeholder="1.5"
                        hint="True density, needed for the surface area. Blank or 0 is treated as 1 g/cm³. Many drug powders are 1.2–1.6."
                        error={densityNegative ? "Density cannot be negative." : undefined}
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => loadExample("fine")} className={chipClass}>
                            Fine powder
                        </button>
                        <button type="button" onClick={() => loadExample("coarse")} className={chipClass}>
                            Coarse granules
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Examples replace the {method === "sieve" ? "sieve" : "laser diffraction"} table only.
                    </p>
                </div>

                <div className="space-y-2">
                    <div
                        className={cn(
                            "grid gap-2 px-0.5 text-xs font-medium text-muted-foreground",
                            method === "sieve" ? "grid-cols-[1fr_1fr_1fr_2.75rem]" : "grid-cols-[1fr_1fr_2.75rem]",
                        )}
                        aria-hidden="true"
                    >
                        {method === "sieve" ? (
                            <>
                                <span>Sieve mesh</span>
                                <span>Opening (μm)</span>
                                <span>% retained</span>
                            </>
                        ) : (
                            <>
                                <span>Size (μm)</span>
                                <span>% by volume</span>
                            </>
                        )}
                        <span />
                    </div>

                    {method === "sieve"
                        ? sieveData.map((row, index) => (
                              <div key={index} className="grid grid-cols-[1fr_1fr_1fr_2.75rem] items-center gap-2">
                                  <Input
                                      type="number"
                                      inputMode="decimal"
                                      value={row.mesh}
                                      onChange={(event) => updateSieve(index, "mesh", event.target.value)}
                                      aria-label={`Row ${index + 1} sieve mesh`}
                                      className={cellInput}
                                  />
                                  <Input
                                      type="number"
                                      inputMode="decimal"
                                      step="1"
                                      value={row.opening}
                                      onChange={(event) => updateSieve(index, "opening", event.target.value)}
                                      aria-label={`Row ${index + 1} opening in micrometres`}
                                      className={cellInput}
                                  />
                                  <Input
                                      type="number"
                                      inputMode="decimal"
                                      step="0.1"
                                      value={row.retained}
                                      onChange={(event) => updateSieve(index, "retained", event.target.value)}
                                      aria-label={`Row ${index + 1} percent retained`}
                                      className={cellInput}
                                  />
                                  <RemoveButton index={index} onRemove={removeRow} />
                              </div>
                          ))
                        : particleData.map((row, index) => (
                              <div key={index} className="grid grid-cols-[1fr_1fr_2.75rem] items-center gap-2">
                                  <Input
                                      type="number"
                                      inputMode="decimal"
                                      step="1"
                                      value={row.size}
                                      onChange={(event) => updateLaser(index, "size", event.target.value)}
                                      aria-label={`Row ${index + 1} size in micrometres`}
                                      className={cellInput}
                                  />
                                  <Input
                                      type="number"
                                      inputMode="decimal"
                                      step="0.1"
                                      value={row.percentage}
                                      onChange={(event) => updateLaser(index, "percentage", event.target.value)}
                                      aria-label={`Row ${index + 1} percent by volume`}
                                      className={cellInput}
                                  />
                                  <RemoveButton index={index} onRemove={removeRow} />
                              </div>
                          ))}

                    <div
                        className={cn(
                            "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                            totalOk ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900",
                        )}
                    >
                        <span>Total {pctLabel} (rows between 0 and 100)</span>
                        <span className="font-semibold tabular-nums">{enteredTotal.toFixed(1)}%</span>
                    </div>
                    {!outcome.ok && <LabNotice tone="warning">{outcome.message}. It must be within 95–105%.</LabNotice>}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <Button variant="outline" onClick={addRow}>
                        <Plus />
                        Add row
                    </Button>
                    <Button variant="outline" onClick={reset}>
                        <RefreshCw />
                        Reset data
                    </Button>
                </div>
            </CalcSection>

            {result && reading && (
                <CalcSection title="Results" description="Sizes in micrometres (μm).">
                    <div>
                        <ResultRow label="D10 — 10% are smaller" value={fmt(result.d10, 1)} unit="μm" />
                        <ResultRow label="D50 — median, 50% are smaller" value={fmt(result.d50, 1)} unit="μm" />
                        <ResultRow label="D90 — 90% are smaller" value={fmt(result.d90, 1)} unit="μm" />
                        <ResultRow
                            label={method === "sieve" ? "Mean diameter (geometric)" : "Mean diameter (volume-weighted)"}
                            value={fmt(result.meanDiameter, 1)}
                            unit="μm"
                        />
                        <ResultRow
                            label="Specific surface area"
                            value={densityNegative ? "—" : fmt(result.specificSurfaceArea, 1)}
                            unit="m²/kg"
                        />
                        <ResultRow
                            label="Span"
                            value={fmt(result.span, 2)}
                            badge={reading.label}
                            badgeTone={reading.badge}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5">
                            <p className="text-xs font-medium text-muted-foreground">Dissolution rate</p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                D50 {fmt(result.d50, 0)} μm – {result.d50 < 50 ? "Fast" : "Moderate"} dissolution.
                            </p>
                        </div>
                        <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5">
                            <p className="text-xs font-medium text-muted-foreground">Flowability</p>
                            <p className="mt-1 text-sm font-medium text-foreground">
                                Span {fmt(result.span, 2)} – {result.span < 1.5 ? "Good flow" : "May need glidant"}.
                            </p>
                        </div>
                    </div>
                </CalcSection>
            )}

            {result && (
                <CalcSection
                    title="Cumulative distribution"
                    description="Cumulative % finer than each size. Dashed lines mark 10%, 50% and 90%."
                >
                    <div className="h-64 w-full sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 12, left: 4, bottom: 16 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="size"
                                    type="number"
                                    scale="log"
                                    domain={[1, chartMax]}
                                    ticks={[1, 10, 100, 1000].filter((tick) => tick <= chartMax)}
                                    allowDataOverflow
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    label={{ value: "Size (μm, log scale)", position: "insideBottom", offset: -8, fontSize: 11 }}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    ticks={[0, 25, 50, 75, 100]}
                                    tick={{ fontSize: 11 }}
                                    stroke="hsl(var(--muted-foreground))"
                                    width={44}
                                    label={{ value: "% finer", angle: -90, position: "insideLeft", offset: 12, fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${Number(value).toFixed(1)}%`, "Cumulative finer"]}
                                    labelFormatter={(label) => `${label} μm`}
                                />
                                {[10, 50, 90].map((y) => (
                                    <ReferenceLine key={y} y={y} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                                ))}
                                <Line
                                    type="linear"
                                    dataKey="passing"
                                    stroke="#2563EB"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground">Sizes below 1 μm (such as the pan) are drawn at 1 μm.</p>
                </CalcSection>
            )}

            {result && (
                <CalcSection title="Working" description="Your numbers, plugged into each step.">
                    <div className="-mx-4 overflow-x-auto sm:mx-0">
                        <table className="w-full min-w-[20rem] border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                    <th className="px-4 py-2 font-medium sm:pl-0">
                                        {method === "sieve" ? "Opening (μm)" : "Size (μm), largest first"}
                                    </th>
                                    <th className="px-4 py-2 text-right font-medium sm:pr-0">Cumulative % finer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.cumulativeData.map((point, index) => (
                                    <tr key={index} className="border-b border-border/70">
                                        <td className="px-4 py-2 tabular-nums sm:pl-0">{fmt(point.size, 0)}</td>
                                        <td className="px-4 py-2 text-right tabular-nums sm:pr-0">{fmt(point.cumulative, 1)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Cumulative % finer = 100 − running total of {pctLabel} ({result.rowsUsed} rows, total{" "}
                        {result.total.toFixed(1)}%).
                    </p>

                    <div className="space-y-2">
                        {([10, 50, 90] as const).map((target) => {
                            const value = target === 10 ? result.d10 : target === 50 ? result.d50 : result.d90;
                            const bracket = bracketFor(result.cumulativeData, target);
                            return (
                                <Formula key={target}>
                                    D{target} ={" "}
                                    {bracket
                                        ? `${fmt(bracket.lower.size, 0)} + (${target} − ${fmt(bracket.lower.cumulative, 1)}) ÷ (${fmt(bracket.upper.cumulative, 1)} − ${fmt(bracket.lower.cumulative, 1)}) × (${fmt(bracket.upper.size, 0)} − ${fmt(bracket.lower.size, 0)})`
                                        : "no row brackets this %, so the first size is used"}{" "}
                                    = {fmt(value, 1)} μm
                                </Formula>
                            );
                        })}
                        <Formula>
                            Span = ({fmt(result.d90, 1)} − {fmt(result.d10, 1)}) ÷ {fmt(result.d50, 1)} = {fmt(result.span, 2)}
                        </Formula>
                        <Formula>
                            {method === "sieve"
                                ? `Mean = √(${fmt(result.d10, 1)} × ${fmt(result.d90, 1)}) = ${fmt(result.meanDiameter, 1)} μm`
                                : `Mean = Σ(size × %) ÷ 100 = ${fmt(result.meanDiameter, 1)} μm`}
                        </Formula>
                        <Formula>
                            SSA = 6 ÷ ({result.density} × {fmt(result.d50, 1)} ÷ 1000) × 1000 ={" "}
                            {densityNegative ? "—" : fmt(result.specificSurfaceArea, 1)} m²/kg
                        </Formula>
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>Cumulative % finer = 100 − Σ % retained (from the coarsest sieve down)</Formula>
                <Formula>Dx = S₂ + (x − C₂) ÷ (C₁ − C₂) × (S₁ − S₂)</Formula>
                <Formula>Span = (D90 − D10) ÷ D50</Formula>
                <Formula>Mean (sieve) = √(D10 × D90)   ·   Mean (laser) = Σ(size × %) ÷ 100</Formula>
                <Formula>SSA = 6 ÷ (ρ × D50 ÷ 1000) × 1000  (m²/kg)</Formula>
                <p>
                    Dx is read off the cumulative curve by straight-line interpolation between the two
                    rows that bracket x%: S₁ and C₁ are the size and cumulative % of the coarser row, S₂
                    and C₂ of the finer row. ρ is particle density in g/cm³ and D50 is in μm. The surface
                    area treats every particle as a sphere of diameter D50 (area-to-volume ratio 6/d).
                </p>
                <p>
                    The distribution is read as narrow when span is below 1, broad above 2, and moderate
                    in between. A span below 1.5 is read as good flow; a D50 below 50 μm as fast
                    dissolution.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why must the percentages add up to about 100%?",
                        a: "Each row is a share of the whole sample, so together they should account for all of it. Up to 5% either way is accepted to allow for handling losses on the sieves; beyond that the calculator asks you to recheck the data.",
                    },
                    {
                        q: "How do I enter the pan in a sieve analysis?",
                        a: "Add it as the last row with mesh 0 and opening 0, and enter the % of powder collected in it. Without the pan the cumulative curve never reaches 0% finer and the total will be short.",
                    },
                    {
                        q: "What is a good span?",
                        a: "Smaller is more uniform. Below 1 is narrow; 1–2 is typical of milled or granulated material; above 2 is broad and more likely to segregate during mixing. Tablet granules usually aim for a span under 2.0.",
                    },
                    {
                        q: "Which mean diameter is shown?",
                        a: "For sieve data it is the geometric mean of D10 and D90. For laser diffraction it is the volume-weighted mean, each size multiplied by its % and divided by 100 — so the % column should total 100.",
                    },
                    {
                        q: "Why is density needed?",
                        a: "Specific surface area is area per unit mass. The same size of particle has less surface per gram when the material is denser, so the true (particle) density divides into the result.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}

function RemoveButton({ index, onRemove }: { index: number; onRemove: (index: number) => void }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            aria-label={`Remove row ${index + 1}`}
            className="h-11 w-11 text-muted-foreground hover:text-destructive"
        >
            <Trash2 />
        </Button>
    );
}
