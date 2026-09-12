"use client";

import { useMemo, useState } from "react";
import { Shield, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

/**
 * Safety bands. Thresholds and wording are carried over unchanged — only the
 * presentation of them has moved from ad-hoc text colours to result tones.
 */
type Band = { margin: string; safety: string; tone: ResultTone; interpretation: string };

function bandFor(ti: number): Band {
    if (ti < 2)
        return {
            margin: "Very narrow",
            safety: "High risk",
            tone: "danger",
            interpretation: "Requires close monitoring and precise dosing.",
        };
    if (ti < 5)
        return {
            margin: "Narrow",
            safety: "Moderate risk",
            tone: "warning",
            interpretation: "Caution required; therapeutic drug monitoring recommended.",
        };
    if (ti < 10)
        return {
            margin: "Moderate",
            safety: "Acceptable",
            tone: "warning",
            interpretation: "Standard precautions apply.",
        };
    return {
        margin: "Wide",
        safety: "Safe",
        tone: "success",
        interpretation: "Good safety margin.",
    };
}

const SAMPLE_DRUGS = [
    { name: "Digoxin", ED50: "0.8", TD50: "2.0" },
    { name: "Warfarin", ED50: "1.5", TD50: "3.0" },
    { name: "Penicillin", ED50: "10", TD50: "500" },
    { name: "Lithium", ED50: "0.5", TD50: "1.5" },
    { name: "Aspirin", ED50: "100", TD50: "500" },
];

const GUIDELINES = [
    { range: "TI < 2", classification: "Very narrow", monitoring: "Continuous TDM required" },
    { range: "TI 2–5", classification: "Narrow", monitoring: "Regular TDM recommended" },
    { range: "TI 5–10", classification: "Moderate", monitoring: "Routine monitoring" },
    { range: "TI > 10", classification: "Wide", monitoring: "Minimal monitoring" },
];

export default function TherapeuticIndexCalculator() {
    const [td50, setTd50] = useState("");
    const [ed50, setEd50] = useState("");

    /*
     * Computed as you type. The previous version required pressing "Calculate"
     * and raised a browser `alert()` on bad input — a modal interruption that is
     * especially jarring on a phone. Validation is now inline and non-blocking.
     * The formula (TI = TD50 / ED50) and the four bands are unchanged.
     */
    const { result, errors } = useMemo(() => {
        const TD50 = parseFloat(td50);
        const ED50 = parseFloat(ed50);

        const errors: { td50?: string; ed50?: string } = {};
        if (td50 !== "" && (isNaN(TD50) || TD50 <= 0)) errors.td50 = "Enter a number greater than 0.";
        if (ed50 !== "" && (isNaN(ED50) || ED50 <= 0)) errors.ed50 = "Enter a number greater than 0.";

        if (isNaN(TD50) || isNaN(ED50) || TD50 <= 0 || ED50 <= 0) return { result: null, errors };

        const ti = TD50 / ED50;
        return { result: { ti, TD50, ED50, ...bandFor(ti) }, errors };
    }, [td50, ed50]);

    const chartData = result
        ? [
              { name: "ED50", value: result.ED50, fill: "#1C7BD9" },
              { name: "TD50", value: result.TD50, fill: "#ef4444" },
          ]
        : [];

    return (
        <CalculatorShell
            title="Therapeutic Index Calculator"
            subtitle="How much room there is between an effective dose and a toxic one."
            icon={Shield}
            aside={
                <>
                    <CalcAbout title="About the therapeutic index">
                        <p>
                            The therapeutic index is the classic measure of a drug&apos;s margin of
                            safety: how far apart the dose that helps and the dose that harms actually
                            are. A large index means an ordinary dosing error is unlikely to hurt
                            anyone; a small one means the two doses nearly touch.
                        </p>
                        <CalcList
                            title="Drugs with a narrow index"
                            items={[
                                "Digoxin, lithium and warfarin",
                                "Phenytoin, carbamazepine and theophylline",
                                "Aminoglycosides such as gentamicin",
                                "Most cytotoxic chemotherapy agents",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Limits of this number"
                            items={[
                                "It is a population average and says nothing about one patient",
                                "It ignores how steep the dose–response curves are",
                                "Human values are usually extrapolated from animal data",
                                "Clinically, the therapeutic window from real plasma levels matters more",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Therapeutic index"
                value={result ? result.ti.toFixed(2) : null}
                interpretation={result ? `${result.margin} margin — ${result.interpretation}` : undefined}
                tone={result?.tone ?? "neutral"}
                empty="Enter ED50 and TD50 to see the therapeutic index."
            />

            <CalcSection title="Dose values" description="Both must be in the same units.">
                <FieldGrid>
                    <NumberField
                        label="ED50 (effective dose, 50%)"
                        value={ed50}
                        onChange={setEd50}
                        placeholder="e.g. 0.8"
                        step="any"
                        min={0}
                        error={errors.ed50}
                        hint="Dose producing the desired effect in half the population."
                    />
                    <NumberField
                        label="TD50 (toxic dose, 50%)"
                        value={td50}
                        onChange={setTd50}
                        placeholder="e.g. 2.0"
                        step="any"
                        min={0}
                        error={errors.td50}
                        hint="Dose producing toxicity in half the population."
                    />
                </FieldGrid>

                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Try a known drug</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_DRUGS.map((drug) => (
                            <button
                                key={drug.name}
                                type="button"
                                onClick={() => {
                                    setEd50(drug.ED50);
                                    setTd50(drug.TD50);
                                }}
                                className="rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent"
                            >
                                {drug.name}
                            </button>
                        ))}
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={() => {
                        setTd50("");
                        setEd50("");
                    }}
                    className="w-full"
                >
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="Dose comparison">
                    {/* ResponsiveContainer keeps the chart inside the viewport on a
                        phone; the old fixed-width chart forced sideways scrolling. */}
                    <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                                />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                    {chartData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div>
                        <ResultRow label="ED50" value={result.ED50} />
                        <ResultRow label="TD50" value={result.TD50} />
                        <ResultRow
                            label="Safety classification"
                            value={result.safety}
                            badge={result.margin}
                            badgeTone={result.tone === "success" ? "success" : result.tone === "danger" ? "destructive" : "warning"}
                        />
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Monitoring guide">
                <div className="-my-2.5">
                    {GUIDELINES.map((guideline) => (
                        <ResultRow
                            key={guideline.range}
                            label={`${guideline.range} · ${guideline.classification}`}
                            value={guideline.monitoring}
                        />
                    ))}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>Therapeutic index (TI) = TD50 ÷ ED50</Formula>
                <p>
                    ED50 is the dose that produces the desired effect in 50% of a population; TD50 is
                    the dose that produces toxicity in 50%. Their ratio describes how much margin for
                    error a drug allows.
                </p>
                <p>
                    A large TI means a dosing mistake is unlikely to cause harm. A small one — digoxin,
                    warfarin, lithium — means the effective and toxic doses are close together, which
                    is why those drugs need therapeutic drug monitoring.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is a 'good' therapeutic index?",
                        a: "There is no formal cut-off, but above 10 is generally treated as a comfortable margin and below 2 as dangerous. Regulators tend to describe a drug as narrow-therapeutic-index when small changes in dose or blood level produce serious changes in effect.",
                    },
                    {
                        q: "How is this different from the therapeutic window?",
                        a: "The therapeutic index is a ratio of two doses derived from population curves. The therapeutic window is the range of actual plasma concentrations that are effective without being toxic — that is what therapeutic drug monitoring measures in a real patient.",
                    },
                    {
                        q: "What are ED50 and TD50 exactly?",
                        a: "ED50 is the dose producing the desired effect in 50% of the population; TD50 is the dose producing toxicity in 50%. Both come from fitting dose–response curves, and both must be expressed in the same units for the ratio to mean anything.",
                    },
                    {
                        q: "Why do some textbooks use LD50 instead of TD50?",
                        a: "The older definition used LD50, the lethal dose in 50% of animals, giving TI = LD50 ÷ ED50. TD50 is preferred in human pharmacology because the clinically relevant boundary is toxicity, not death.",
                    },
                    {
                        q: "Can the index be less than 1?",
                        a: "Arithmetically yes, if the toxic dose is lower than the effective one — which is why some otherwise effective compounds never become medicines. Certain cytotoxic drugs run close to this and are only justified by the severity of the disease.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
