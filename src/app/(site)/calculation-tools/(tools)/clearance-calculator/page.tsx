"use client";

import { useMemo, useState } from "react";
import { Activity, Filter, Gauge, RefreshCw } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
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
    type ResultTone,
} from "@/components/calculators";

/** Joins class names, skipping falsy ones (kept local: no @/lib imports in tool pages). */
const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

type Method = "single" | "steady";

const METHODS: ModeOption<Method>[] = [
    { value: "single", label: "Single dose", description: "CL = Dose / AUC", icon: Activity },
    { value: "steady", label: "Steady-state infusion", description: "CL = R₀ / Css", icon: Gauge },
];

/** The per-kg figure is always for a 70 kg reference patient (unchanged). */
const REFERENCE_WEIGHT_KG = 70;

/*
 * Clearance bands in L/h (unchanged). Upper bounds exclusive, as the original
 * if/else chain: < 0.5, < 2, < 10, < 30.
 */
const BANDS: {
    upTo: number;
    range: string;
    short: string;
    interpretation: string;
    organInvolved: string;
    tone: ResultTone;
    text: string;
}[] = [
    {
        upTo: 0.5,
        range: "< 0.5 L/h",
        short: "Severe impairment",
        interpretation: "Very low clearance – severely impaired elimination",
        organInvolved: "Severe hepatic/renal impairment",
        tone: "danger",
        text: "text-red-600",
    },
    {
        upTo: 2,
        range: "0.5 – 2 L/h",
        short: "Reduced",
        interpretation: "Low clearance – reduced elimination capacity",
        organInvolved: "Moderate hepatic/renal impairment",
        tone: "warning",
        text: "text-amber-600",
    },
    {
        upTo: 10,
        range: "2 – 10 L/h",
        short: "Normal",
        interpretation: "Normal clearance – typical elimination",
        organInvolved: "Normal hepatic/renal function",
        tone: "success",
        text: "text-emerald-600",
    },
    {
        upTo: 30,
        range: "10 – 30 L/h",
        short: "High",
        interpretation: "High clearance – efficient elimination",
        organInvolved: "Enhanced metabolism/excretion",
        tone: "neutral",
        text: "text-blue-600",
    },
    {
        upTo: Infinity,
        range: "≥ 30 L/h",
        short: "Flow-limited",
        interpretation: "Very high clearance – blood flow limited",
        organInvolved: "Liver blood flow limited",
        tone: "neutral",
        text: "text-blue-800",
    },
];

const SAMPLE_DRUGS: { name: string; clearance: number; method: Method }[] = [
    { name: "Digoxin", clearance: 0.12, method: "single" },
    { name: "Theophylline", clearance: 0.04, method: "single" },
    { name: "Gentamicin", clearance: 0.1, method: "steady" },
    { name: "Lidocaine", clearance: 0.95, method: "steady" },
    { name: "Propranolol", clearance: 1.2, method: "single" },
];

const COLORS = ["#2563EB", "#10B981", "#F59E0B"];

function positiveError(raw: string): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value <= 0) return "Must be greater than zero.";
    return undefined;
}

export default function ClearanceCalculator() {
    const [method, setMethod] = useState<Method>("single");
    const [dose, setDose] = useState("");
    const [auc, setAuc] = useState("");
    const [concentration, setConcentration] = useState("");
    const [infusionRate, setInfusionRate] = useState("");
    const [volume, setVolume] = useState(""); // optional, for half-life

    /*
     * Live from the inputs. The old page computed on a button and kept the last
     * result when the method changed or an alert() rejected the new inputs, so
     * the card could describe values that were no longer on screen.
     */
    const result = useMemo(() => {
        let clearance: number;
        if (method === "single") {
            const D = parseFloat(dose);
            const AUC = parseFloat(auc);
            if (isNaN(D) || isNaN(AUC) || D <= 0 || AUC <= 0) return null;
            clearance = D / AUC; // L/h
        } else {
            const Css = parseFloat(concentration);
            const R0 = parseFloat(infusionRate);
            if (isNaN(Css) || isNaN(R0) || Css <= 0 || R0 <= 0) return null;
            clearance = R0 / Css;
        }

        const V = parseFloat(volume);
        const halfLife = !isNaN(V) && V > 0 ? (0.693 * V) / clearance : null;

        // Per 70 kg patient
        const clearancePerKg = clearance / REFERENCE_WEIGHT_KG;

        const bandIndex = BANDS.findIndex((band) => clearance < band.upTo);

        // Organ contribution (illustrative)
        const chartData = [
            { name: "Liver", value: clearance > 10 ? 70 : 40 },
            { name: "Kidneys", value: clearance < 10 ? 60 : 20 },
            { name: "Other", value: 10 },
        ];

        return { clearance, clearancePerKg, halfLife, bandIndex, band: BANDS[bandIndex], chartData };
    }, [method, dose, auc, concentration, infusionRate, volume]);

    const loadSample = (drug: (typeof SAMPLE_DRUGS)[number]) => {
        setMethod(drug.method);
        if (drug.method === "single") {
            setDose("100");
            setAuc((100 / drug.clearance).toFixed(2));
        } else {
            setConcentration("10");
            setInfusionRate((10 * drug.clearance).toFixed(2));
        }
    };

    const reset = () => {
        setDose("");
        setAuc("");
        setConcentration("");
        setInfusionRate("");
        setVolume("");
    };

    return (
        <CalculatorShell
            title="Clearance Calculator"
            subtitle="Works out drug clearance (CL) from a single dose and its AUC, or from an infusion rate and the steady-state level."
            icon={Filter}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            <strong>CL — clearance</strong> — is the volume of plasma cleared of drug per
                            unit time. It measures the body&apos;s capacity to eliminate the drug (liver,
                            kidneys and other routes combined) and is the one parameter that sets the
                            maintenance dose.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "You have an AUC from a single IV dose",
                                "A continuous infusion has reached steady state",
                                "Estimating half-life from clearance and Vd",
                                "Comparing elimination capacity between patients",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch for"
                            items={[
                                "Dose ÷ AUC is total clearance only for an IV dose — oral gives CL/F",
                                "Css is valid only after about 4–5 half-lives of infusion",
                                "The per-kg figure assumes a 70 kg patient",
                                "The organ chart is illustrative, not derived from your data",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch label="Calculation method" value={method} onChange={setMethod} options={METHODS} />

            <ResultCard
                label="Clearance (CL)"
                value={result ? result.clearance.toFixed(3) : null}
                unit="L/h"
                interpretation={result?.band.interpretation}
                tone={result?.band.tone ?? "neutral"}
                empty={
                    method === "single"
                        ? "Enter the dose and the AUC to see the clearance."
                        : "Enter the steady-state concentration and the infusion rate to see the clearance."
                }
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    {method === "single" ? (
                        <>
                            <NumberField
                                label="Dose (mg)"
                                value={dose}
                                onChange={setDose}
                                unit="mg"
                                step="0.001"
                                min={0}
                                error={positiveError(dose)}
                                hint="The IV dose given."
                            />
                            <NumberField
                                label="AUC (mg·h/L)"
                                value={auc}
                                onChange={setAuc}
                                unit="mg·h/L"
                                step="0.001"
                                min={0}
                                error={positiveError(auc)}
                                hint="Area under the concentration–time curve, 0 to infinity."
                            />
                        </>
                    ) : (
                        <>
                            <NumberField
                                label="Steady-state concentration Css (mg/L)"
                                value={concentration}
                                onChange={setConcentration}
                                unit="mg/L"
                                step="0.001"
                                min={0}
                                error={positiveError(concentration)}
                                hint="Plasma level once the infusion has plateaued."
                            />
                            <NumberField
                                label="Infusion rate R₀ (mg/h)"
                                value={infusionRate}
                                onChange={setInfusionRate}
                                unit="mg/h"
                                step="0.001"
                                min={0}
                                error={positiveError(infusionRate)}
                                hint="Constant rate of drug going in."
                            />
                        </>
                    )}
                    <NumberField
                        label="Volume of distribution Vd (L) — optional"
                        value={volume}
                        onChange={setVolume}
                        unit="L"
                        step="0.001"
                        min={0}
                        error={positiveError(volume)}
                        hint="Enter it to also get the half-life: t½ = 0.693 × Vd / CL."
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
                                {drug.name}
                                <span className="ml-1.5 font-normal text-muted-foreground">CL {drug.clearance} L/h</span>
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
                        {method === "single" ? (
                            <ResultRow label={`CL = ${dose} ÷ ${auc}`} value={result.clearance.toFixed(3)} unit="L/h" />
                        ) : (
                            <ResultRow
                                label={`CL = ${infusionRate} ÷ ${concentration}`}
                                value={result.clearance.toFixed(3)}
                                unit="L/h"
                            />
                        )}
                        <ResultRow
                            label={`CL per kg (÷ ${REFERENCE_WEIGHT_KG} kg)`}
                            value={result.clearancePerKg.toFixed(4)}
                            unit="L/h/kg"
                        />
                        {result.halfLife !== null ? (
                            <ResultRow
                                label={`t½ = 0.693 × ${volume} ÷ ${result.clearance.toFixed(3)}`}
                                value={result.halfLife.toFixed(2)}
                                unit="h"
                            />
                        ) : (
                            <ResultRow label="Half-life (t½)" value="Enter Vd" />
                        )}
                        <ResultRow label="Primary organ" value={result.band.organInvolved} />
                    </div>
                </CalcSection>
            )}

            {result && (
                <CalcSection
                    title="Organ contribution (illustrative)"
                    description="A teaching sketch of which organs usually dominate at this clearance — not calculated from your inputs."
                >
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={result.chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    label
                                    isAnimationActive={false}
                                >
                                    {result.chartData.map((entry, idx) => (
                                        <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                        {result.chartData.map((entry, idx) => (
                            <span key={entry.name} className="flex items-center gap-1.5">
                                <span
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{ background: COLORS[idx % COLORS.length] }}
                                    aria-hidden="true"
                                />
                                {entry.name}
                            </span>
                        ))}
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Clearance scale" description="Total clearance bands used for the interpretation.">
                <div role="list">
                    {BANDS.map((band, index) => {
                        const active = result?.bandIndex === index;
                        return (
                            <div
                                role="listitem"
                                key={band.range}
                                className={cn(
                                    "flex items-center justify-between gap-3 border-b border-border/70 px-2 py-3 last:border-b-0",
                                    active && "rounded-lg bg-primary/10",
                                )}
                            >
                                <span className="font-mono text-xs text-muted-foreground sm:text-sm">{band.range}</span>
                                <span className={cn("text-right text-sm", band.text, active && "font-semibold")}>
                                    {band.short}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>CL = Dose / AUC   (single dose)</Formula>
                <Formula>CL = R₀ / Css   (steady-state infusion)</Formula>
                <Formula>t½ = 0.693 × Vd / CL</Formula>
                <p>
                    Dose in mg divided by AUC in mg·h/L gives litres per hour. At steady state the rate in
                    (R₀, mg/h) equals the rate out (CL × Css), so rearranging gives CL = R₀ / Css.
                </p>
                <p>
                    Half-life depends on both clearance and distribution: a large Vd or a small CL makes it
                    longer. 0.693 is ln 2.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why is clearance in litres per hour and not mg per hour?",
                        a: "Clearance is a volume of plasma completely cleared of drug per unit time. The amount removed per hour (mg/h) is CL × concentration, so it changes as the level changes while CL stays constant for first-order drugs.",
                    },
                    {
                        q: "Can I use an oral dose and AUC?",
                        a: "You can, but the answer is apparent oral clearance, CL/F, because only the bioavailable fraction F reached the circulation. Divide by F — or multiply the dose by F first — to get true clearance.",
                    },
                    {
                        q: "How do I know the infusion is at steady state?",
                        a: "It takes about 4–5 half-lives of constant infusion to reach roughly 94–97% of the plateau. A level drawn earlier underestimates Css and so overestimates clearance.",
                    },
                    {
                        q: "Why does the per-kg figure use 70 kg?",
                        a: "The calculator has no weight input, so it scales to a standard 70 kg adult. For a real patient, divide the clearance by their actual weight instead.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
