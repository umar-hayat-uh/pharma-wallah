"use client";

import { useMemo, useState } from "react";
import { GitCompare, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    NumberField,
    ResultCard,
    ResultRow,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    AdSlot,
    LabNotice,
    fieldError,
    type ResultTone,
} from "@/components/calculators";

type FinalResult = "PASS" | "FAIL" | "TEST STAGE 2";

type UnitResult = { entry: number; value: number; percentage: number; status: "PASS" | "FAIL" };

/* ── Worked examples (unchanged values, label claim 100) ──────────────────── */
const EXAMPLES: { name: string; values: string[] }[] = [
    { name: "Passing", values: ["98.5", "99.2", "100.1", "100.5", "99.8", "100.2", "99.9", "100.3", "99.7", "100.0"] },
    { name: "Borderline", values: ["97.5", "98.8", "99.1", "100.5", "101.2", "102.5", "98.7", "99.9", "100.1", "101.8"] },
    { name: "Failing", values: ["88.5", "92.1", "95.3", "97.8", "99.2", "101.5", "103.2", "104.8", "106.5", "108.2"] },
];

const FINAL_MESSAGE: Record<FinalResult, string> = {
    PASS: "Batch PASSES content uniformity requirements (Stage 1).",
    "TEST STAGE 2": "Proceed to Stage 2: test 20 additional units.",
    FAIL: "Batch FAILS content uniformity requirements.",
};

const FINAL_TONE: Record<FinalResult, ResultTone> = {
    PASS: "success",
    "TEST STAGE 2": "warning",
    FAIL: "danger",
};

/** Minimum number of valid unit results the calculation needs (unchanged). */
const MIN_UNITS = 10;

/**
 * USP <905> statistics, acceptance value and verdict — exactly the previous
 * page's arithmetic. `values` are the entries that parsed to a number > 0, in
 * the order typed; `entries` remembers which field each came from.
 */
function computeUniformity(values: number[], entries: number[], label: number) {
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
    const standardDeviation = Math.sqrt(variance);
    const relativeStandardDeviation = (standardDeviation / mean) * 100;

    // Acceptance Value (AV) per USP <905>
    let M = 0;
    const averagePercentage = (mean / label) * 100;
    if (averagePercentage >= 98.5 && averagePercentage <= 101.5) {
        M = mean;
    } else if (averagePercentage < 98.5) {
        M = label * 0.985;
    } else {
        M = label * 1.015;
    }

    const k = 2.4; // Acceptability constant for n=10
    const acceptanceValue = Math.abs(M - mean) + k * standardDeviation;

    const passesStage1 = acceptanceValue <= 15;
    const individualResults: UnitResult[] = values.map((value, index) => {
        const percentage = (value / label) * 100;
        return {
            entry: entries[index],
            value,
            percentage,
            status: percentage >= 85 && percentage <= 115 ? "PASS" : "FAIL",
        };
    });
    const passesStage2 = acceptanceValue <= 25;
    const passingUnits = individualResults.filter((r) => r.status === "PASS").length;

    let finalResult: FinalResult = "PASS";
    if (passesStage1 && individualResults.every((r) => r.status === "PASS")) {
        finalResult = "PASS";
    } else if (!passesStage1 && passesStage2 && passingUnits >= 24) {
        finalResult = "TEST STAGE 2";
    } else {
        finalResult = "FAIL";
    }

    return {
        mean,
        standardDeviation,
        relativeStandardDeviation,
        acceptanceValue,
        min,
        max,
        M,
        k,
        averagePercentage,
        passesStage1,
        passesStage2,
        passingUnits,
        finalResult,
        individualResults,
    };
}

export default function ContentUniformityCalculator() {
    const [units, setUnits] = useState<string[]>(Array(10).fill(""));
    const [labelClaim, setLabelClaim] = useState("100");

    const handleUnitChange = (index: number, value: string) => {
        const next = [...units];
        next[index] = value;
        setUnits(next);
    };

    const loadExample = (values: string[]) => {
        setUnits([...values]);
        setLabelClaim("100");
    };

    const reset = () => {
        setUnits(Array(10).fill(""));
        setLabelClaim("100");
    };

    /*
     * Live, derived from the inputs. The previous page computed on "Calculate
     * Uniformity" and alerted when fewer than 10 units were valid, leaving the
     * last result on screen beside inputs that no longer produced it. Entries
     * that are blank, not a number, or ≤ 0 are skipped exactly as before.
     */
    const state = useMemo(() => {
        const values: number[] = [];
        const entries: number[] = [];
        let typed = 0;
        units.forEach((raw, index) => {
            if (raw.trim() !== "") typed += 1;
            const value = parseFloat(raw);
            if (!isNaN(value) && value > 0) {
                values.push(value);
                entries.push(index + 1);
            }
        });
        const label = parseFloat(labelClaim);
        const labelValid = !isNaN(label) && label > 0;
        const skipped = typed - values.length;
        if (values.length < MIN_UNITS || !labelValid) {
            return { result: null, count: values.length, skipped, labelValid };
        }
        return { result: computeUniformity(values, entries, label), count: values.length, skipped, labelValid };
    }, [units, labelClaim]);

    const result = state.result;

    const emptyText = !state.labelValid
        ? "Enter a label claim greater than zero."
        : `Enter at least ${MIN_UNITS} unit contents greater than zero — ${state.count} entered so far.`;

    return (
        <CalculatorShell
            title="Content Uniformity Calculator"
            subtitle="Checks whether a batch of tablets or capsules passes the USP <905> content uniformity test, from the assay of each individual unit."
            icon={GitCompare}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Content uniformity asks whether every tablet or capsule in a batch carries close to
                            the labelled amount of drug. Ten units are assayed one by one, and their mean and
                            spread are combined into a single acceptance value (AV).
                        </p>
                        <CalcList title="Stage 1 (n=10)" items={["AV ≤ 15.0", "All units 85.0–115.0%"]} />
                        <CalcList
                            title="Stage 2 (n=30)"
                            items={["AV ≤ 25.0", "At least 24 units 85.0–115.0%", "All units 75.0–125.0%"]}
                        />
                        <CalcList
                            title="Guidelines"
                            items={[
                                "Required for all solid oral dosage forms (tablets, capsules).",
                                "Perform on finished product and during stability.",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch for"
                            items={["High RSD (>6%) indicates formulation or process issues."]}
                        />
                        <CalcList
                            title="Applications"
                            items={["Batch release testing", "Process validation", "Stability testing"]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Acceptance value (AV)"
                value={result ? result.acceptanceValue.toFixed(2) : null}
                interpretation={result ? `${result.finalResult} — ${FINAL_MESSAGE[result.finalResult]}` : undefined}
                tone={result ? FINAL_TONE[result.finalResult] : "neutral"}
                empty={emptyText}
            />

            {result && (
                <CalcSection title="Summary">
                    <div>
                        <ResultRow
                            label="Final result"
                            value={result.finalResult}
                            badgeTone={
                                result.finalResult === "PASS"
                                    ? "success"
                                    : result.finalResult === "TEST STAGE 2"
                                      ? "warning"
                                      : "destructive"
                            }
                            badge={result.finalResult === "PASS" ? "Stage 1" : result.finalResult === "FAIL" ? "Reject" : "Stage 2"}
                        />
                        <ResultRow
                            label="Acceptance value — USP limit ≤15.0"
                            value={result.acceptanceValue.toFixed(2)}
                            badge={result.acceptanceValue <= 15 ? "≤15" : result.acceptanceValue <= 25 ? "≤25" : ">25"}
                            badgeTone={
                                result.acceptanceValue <= 15 ? "success" : result.acceptanceValue <= 25 ? "warning" : "destructive"
                            }
                        />
                        <ResultRow
                            label="RSD — target ≤6%"
                            value={`${result.relativeStandardDeviation.toFixed(2)}%`}
                            badge={result.relativeStandardDeviation <= 6 ? "OK" : "High"}
                            badgeTone={result.relativeStandardDeviation <= 6 ? "success" : "warning"}
                        />
                        <ResultRow label="Mean (X̄)" value={result.mean.toFixed(2)} />
                        <ResultRow label="Range" value={`${result.min.toFixed(1)} – ${result.max.toFixed(1)}`} />
                        <ResultRow
                            label="Units within 85–115%"
                            value={`${result.passingUnits} of ${result.individualResults.length}`}
                        />
                    </div>
                </CalcSection>
            )}

            <CalcSection
                title="Unit data entry"
                description="Assay result of each unit, in the same unit as the label claim (mg, or % of label)."
            >
                <NumberField
                    label="Label claim (mg or %)"
                    value={labelClaim}
                    onChange={setLabelClaim}
                    step="0.1"
                    placeholder="100"
                    hint="Reference value for percentage calculations — the labelled amount per unit, or 100 if the results are already % of label."
                    error={fieldError(labelClaim, { show: true })}
                    className="sm:max-w-xs"
                />

                <div>
                    <p className="mb-2 text-[13px] font-medium text-foreground/90">Individual unit contents</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        {units.map((unit, index) => (
                            <NumberField
                                key={index}
                                label={`Unit ${index + 1}`}
                                value={unit}
                                onChange={(value) => handleUnitChange(index, value)}
                                step="0.01"
                                placeholder="0.00"
                            />
                        ))}
                    </div>
                </div>

                {state.skipped > 0 && (
                    <LabNotice tone="warning">
                        {state.skipped === 1 ? "1 entry is" : `${state.skipped} entries are`} zero, negative or not a
                        number and {state.skipped === 1 ? "is" : "are"} left out of the calculation.
                    </LabNotice>
                )}

                <Button
                    variant="outline"
                    onClick={() => setUnits([...units, ...Array(5).fill("")])}
                    className="w-full"
                >
                    <Plus />
                    Add 5 more units
                </Button>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example (label claim 100)</p>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLES.map((example) => (
                            <button
                                key={example.name}
                                type="button"
                                onClick={() => loadExample(example.values)}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {example.name}
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset all
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="Working" description="Acceptance value AV = |M − X̄| + k·s.">
                    <div>
                        <ResultRow label="Units counted (n)" value={result.individualResults.length} />
                        <ResultRow label="Mean (X̄)" value={result.mean.toFixed(4)} />
                        <ResultRow label="Standard deviation (s)" value={result.standardDeviation.toFixed(4)} />
                        <ResultRow label="Mean as % of label" value={`${result.averagePercentage.toFixed(2)}%`} />
                        <ResultRow
                            label="Reference value (M)"
                            value={result.M.toFixed(4)}
                            badge={
                                result.averagePercentage >= 98.5 && result.averagePercentage <= 101.5
                                    ? "M = mean"
                                    : result.averagePercentage < 98.5
                                      ? "98.5% of label"
                                      : "101.5% of label"
                            }
                            badgeTone="outline"
                        />
                        <ResultRow
                            label="AV"
                            value={`|${result.M.toFixed(2)} − ${result.mean.toFixed(2)}| + ${result.k} × ${result.standardDeviation.toFixed(2)} = ${result.acceptanceValue.toFixed(2)}`}
                        />
                    </div>
                </CalcSection>
            )}

            {result && (
                <CalcSection title="Individual unit analysis">
                    <div className="-mx-4 overflow-x-auto sm:mx-0">
                        <table className="w-full min-w-[340px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-border text-xs text-muted-foreground">
                                    <th className="px-4 py-2.5 font-medium sm:px-3">Unit</th>
                                    <th className="px-3 py-2.5 text-right font-medium">Value</th>
                                    <th className="px-3 py-2.5 text-right font-medium">% of Label</th>
                                    <th className="px-4 py-2.5 text-right font-medium sm:px-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.individualResults.map((unit) => (
                                    <tr key={unit.entry} className="border-b border-border/70 last:border-b-0">
                                        <td className="px-4 py-2.5 font-medium text-foreground sm:px-3">{unit.entry}</td>
                                        <td className="px-3 py-2.5 text-right tabular-nums text-foreground">{unit.value.toFixed(2)}</td>
                                        <td className="px-3 py-2.5 text-right tabular-nums text-foreground">{unit.percentage.toFixed(1)}%</td>
                                        <td className="px-4 py-2.5 text-right sm:px-3">
                                            <span
                                                className={
                                                    unit.status === "PASS"
                                                        ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800"
                                                        : "inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800"
                                                }
                                            >
                                                {unit.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CalcSection>
            )}

            {result && (
                <CalcSection
                    title="Distribution (% of label claim)"
                    description="Each bar is one unit, drawn on an 85–115% scale. Red bars fall outside 85–115%."
                >
                    <DistributionChart units={result.individualResults} />
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>AV = |M − X̄| + k·s</Formula>
                <p>
                    M = reference value (98.5–101.5% of label claim), X̄ = sample mean, k = 2.4 (for n=10),
                    s = sample standard deviation.
                </p>
                <p>
                    M depends on where the mean falls: if X̄ is between 98.5% and 101.5% of the label claim, M
                    = X̄ and only the spread counts; below 98.5%, M = 98.5% of label; above 101.5%, M = 101.5%
                    of label. The standard deviation uses n − 1, and RSD = s ÷ X̄ × 100.
                </p>
                <p>
                    Each unit is also expressed as a percentage of the label claim and must fall within
                    85–115%. A batch passes Stage 1 when AV ≤ 15.0 and every unit is within that range.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why is k = 2.4?",
                        a: "k is the acceptability constant from USP <905>. It is 2.4 when 10 units are tested and 2.0 when 30 are tested; this calculator uses 2.4 whatever number of units you enter.",
                    },
                    {
                        q: "Can the AV be high even if the mean is exactly 100%?",
                        a: "Yes. When the mean sits between 98.5% and 101.5% the first term is zero, but a large standard deviation still pushes AV up — a batch with the right average but widely scattered units fails.",
                    },
                    {
                        q: "What should I enter as the label claim?",
                        a: "The labelled amount per unit, in the same unit as your assay results — for example 250 for 250 mg tablets assayed in mg. If your results are already expressed as % of label, leave it at 100.",
                    },
                    {
                        q: "What happens if Stage 1 fails?",
                        a: "USP allows a second stage: 20 more units are tested and all 30 are evaluated together, with a limit of AV ≤ 25.0, at least 24 units within 85–115% and none outside 75–125%.",
                    },
                    {
                        q: "Is content uniformity the same as weight variation?",
                        a: "No. Weight variation infers drug content from each unit's weight and is allowed only in limited cases (for example, high-dose tablets). Content uniformity measures the drug in each unit directly by assay.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}

/**
 * One bar per unit. Same scale as the previous page: height = (% − 85) / 30,
 * clamped to 0–100% — so 85% is the baseline and 115% the top. A bar at or
 * below 85% keeps a thin stub so the unit is still visible.
 */
function DistributionChart({ units }: { units: UnitResult[] }) {
    return (
        <div className="flex gap-2">
            <div className="flex h-48 flex-col justify-between py-0 text-right font-mono text-[10.5px] text-muted-foreground">
                <span className="-translate-y-1/2">115%</span>
                <span>100%</span>
                <span className="translate-y-1/2">85%</span>
            </div>
            <div className="relative h-48 flex-1 border-b border-l border-border">
                <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-border" aria-hidden="true" />
                <div className="absolute inset-0 flex items-end gap-px px-1 sm:gap-1">
                    {units.map((unit) => {
                        const height = Math.min(((unit.percentage - 85) / 30) * 100, 100);
                        return (
                            <div
                                key={unit.entry}
                                className={`min-h-[3px] flex-1 rounded-t-sm ${unit.status === "PASS" ? "bg-emerald-500" : "bg-red-500"}`}
                                style={{ height: `${Math.max(height, 0)}%` }}
                                title={`Unit ${unit.entry}: ${unit.percentage.toFixed(1)}%`}
                                role="img"
                                aria-label={`Unit ${unit.entry}: ${unit.percentage.toFixed(1)}%, ${unit.status}`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
