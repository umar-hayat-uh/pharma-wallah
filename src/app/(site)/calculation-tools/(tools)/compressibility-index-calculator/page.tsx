"use client";

import { useMemo, useState } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
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
    LabNotice,
    fieldError,
    type ResultTone,
} from "@/components/calculators";

/* ── Reference scales and table (unchanged text) ──────────────────────────── */
const CARR_SCALE = [
    { range: "5–15%", label: "Excellent – Good" },
    { range: "16–20%", label: "Fair" },
    { range: "21–25%", label: "Passable" },
    { range: "26–31%", label: "Poor" },
    { range: ">31%", label: "Very Poor" },
];

const HAUSNER_SCALE = [
    { range: "< 1.18", label: "Excellent" },
    { range: "1.18 – 1.25", label: "Good" },
    { range: "1.25 – 1.35", label: "Fair" },
    { range: "1.35 – 1.45", label: "Poor" },
    { range: "> 1.45", label: "Very Poor" },
];

const CLASSIFICATION = [
    { ci: "<10", hr: "1.00–1.11", flow: "Excellent", example: "Glidants, free-flowing granules" },
    { ci: "11–15", hr: "1.12–1.18", flow: "Good", example: "Lactose, MCC" },
    { ci: "16–20", hr: "1.19–1.25", flow: "Fair", example: "Starch, some APIs" },
    { ci: "21–25", hr: "1.26–1.34", flow: "Passable", example: "Fine powders, cohesive blends" },
    { ci: "26–31", hr: "1.35–1.45", flow: "Poor", example: "Very cohesive, need granulation" },
    { ci: ">31", hr: ">1.45", flow: "Very Poor", example: "Extremely cohesive, must granulate" },
];

const USP_PROCEDURE = [
    "Weigh 25–100g of powder accurately.",
    "Pour into graduated cylinder (without compaction).",
    "Read initial unsettled volume V₀.",
    "Tap cylinder 500 times (USP I) or until volume change <2 mL.",
    "Read tapped volume Vₜ.",
    "Calculate CI and HR.",
];

/** Worked examples, so the page can show a result without a lab measurement. */
const EXAMPLES = [
    { name: "Free-flowing granules", mass: "100", v0: "120", vf: "110" },
    { name: "Typical blend", mass: "25", v0: "50", vf: "40" },
    { name: "Cohesive powder", mass: "30", v0: "80", vf: "50" },
];

type Compressibility = {
    compressibilityIndex: number;
    bulkDensity: number;
    tappedDensity: number;
    hausnerRatio: number;
    interpretation: string;
    flowCharacter: string;
    recommendation: string;
};

/** Densities, Carr's index, Hausner ratio and bands — exactly the previous page's. */
function computeCompressibility(m: number, V0: number, Vf: number): Compressibility {
    const bulkDensity = m / V0;
    const tappedDensity = m / Vf;
    const compressibilityIndex = ((V0 - Vf) / V0) * 100;
    const hausnerRatio = V0 / Vf;

    let interpretation = "";
    let flowCharacter = "";
    let recommendation = "";

    if (compressibilityIndex < 10) {
        interpretation = "Excellent flow";
        flowCharacter = "Free-flowing";
        recommendation = "Suitable for direct compression. No glidant needed.";
    } else if (compressibilityIndex >= 10 && compressibilityIndex < 15) {
        interpretation = "Good flow";
        flowCharacter = "Free-flowing to cohesive";
        recommendation = "May require minimal glidant for consistent flow.";
    } else if (compressibilityIndex >= 15 && compressibilityIndex < 20) {
        interpretation = "Fair flow";
        flowCharacter = "Cohesive";
        recommendation = "Glidant recommended. Consider granulation if problematic.";
    } else if (compressibilityIndex >= 20 && compressibilityIndex < 25) {
        interpretation = "Passable flow";
        flowCharacter = "Cohesive";
        recommendation = "Needs glidant. Granulation advised for high-speed tableting.";
    } else if (compressibilityIndex >= 25 && compressibilityIndex < 31) {
        interpretation = "Poor flow";
        flowCharacter = "Very cohesive";
        recommendation = "Granulation necessary. Glidant may not suffice.";
    } else {
        interpretation = "Very poor flow";
        flowCharacter = "Extremely cohesive";
        recommendation = "Not suitable for direct compression. Wet granulation required.";
    }

    return {
        compressibilityIndex,
        bulkDensity,
        tappedDensity,
        hausnerRatio,
        interpretation,
        flowCharacter,
        recommendation,
    };
}

function ScaleList({ title, rows }: { title: string; rows: { range: string; label: string }[] }) {
    return (
        <div>
            <p className="mb-1 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {title}
            </p>
            {rows.map((row) => (
                <ResultRow key={row.range} label={row.range} value={row.label} />
            ))}
        </div>
    );
}

export default function CompressibilityIndexCalculator() {
    const [mass, setMass] = useState("");
    const [initialVolume, setInitialVolume] = useState("");
    const [finalVolume, setFinalVolume] = useState("");

    /*
     * Live, derived from the inputs. The previous page computed on a button
     * press and alerted on bad input, leaving the last valid result showing
     * beside inputs that no longer produced it. Arithmetic unchanged.
     */
    const state = useMemo(() => {
        const V0 = parseFloat(initialVolume);
        const Vf = parseFloat(finalVolume);
        const m = parseFloat(mass);
        if (isNaN(V0) || isNaN(Vf) || isNaN(m) || V0 <= 0 || Vf <= 0 || m <= 0) {
            return { result: null, orderError: false };
        }
        if (Vf >= V0) return { result: null, orderError: true };
        return { result: computeCompressibility(m, V0, Vf), orderError: false };
    }, [mass, initialVolume, finalVolume]);

    const result = state.result;
    const tone: ResultTone = !result
        ? "neutral"
        : result.compressibilityIndex < 15
          ? "success"
          : result.compressibilityIndex < 25
            ? "warning"
            : "danger";

    const reset = () => {
        setMass("");
        setInitialVolume("");
        setFinalVolume("");
    };

    return (
        <CalculatorShell
            title="Compressibility Index Calculator"
            subtitle="Calculates Carr's compressibility index, the Hausner ratio and bulk and tapped density from a tapped-cylinder test, and describes the powder's flow."
            icon={BarChart3}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            The tapped-density test (USP/Ph. Eur.) is the quickest way to judge whether a
                            powder will flow well enough for tableting or capsule filling. You record how far
                            a known mass of powder settles in a graduated cylinder when tapped; the more it
                            settles, the more cohesive it is.
                        </p>
                        <div>
                            <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                USP procedure
                            </p>
                            <div role="list" className="mt-2.5 space-y-2">
                                {USP_PROCEDURE.map((step, index) => (
                                    <div role="listitem" key={step} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
                                        <span className="w-4 shrink-0 font-mono text-xs leading-6 text-primary">{index + 1}</span>
                                        <span>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <CalcList
                            title="Applications"
                            items={[
                                "Tablet compression formulation",
                                "Capsule filling optimization",
                                "Powder blending assessment",
                                "Excipient selection",
                                "Process validation (QbD)",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Carr's index"
                value={result ? result.compressibilityIndex.toFixed(1) : null}
                unit="%"
                interpretation={
                    result ? `${result.interpretation} (${result.flowCharacter}) — ${result.recommendation}` : undefined
                }
                tone={tone}
                empty={
                    state.orderError
                        ? "Final volume must be less than initial volume after tapping."
                        : "Enter the powder mass, initial volume and tapped volume to see the flow properties."
                }
            />

            <CalcSection title="Powder properties">
                <FieldGrid className="lg:grid-cols-3">
                    <NumberField
                        label="Powder mass (m)"
                        value={mass}
                        onChange={setMass}
                        unit="g"
                        step="0.001"
                        placeholder="e.g., 25.0"
                        hint="Accurately weighed; USP uses 25–100 g."
                        error={fieldError(mass, { show: false })}
                    />
                    <NumberField
                        label="Initial volume (V₀)"
                        value={initialVolume}
                        onChange={setInitialVolume}
                        unit="mL"
                        step="0.1"
                        placeholder="e.g., 50.0"
                        hint="Unsettled volume, read before tapping."
                        error={fieldError(initialVolume, { show: false })}
                    />
                    <NumberField
                        label="Tapped volume (Vₜ)"
                        value={finalVolume}
                        onChange={setFinalVolume}
                        unit="mL"
                        step="0.1"
                        placeholder="e.g., 40.0"
                        hint="After standard tapping (e.g., 500–1250 taps). Smaller than V₀."
                        error={fieldError(finalVolume, { show: false })}
                    />
                </FieldGrid>

                {state.orderError && (
                    <LabNotice tone="danger" title="Final volume must be less than initial volume after tapping">
                        Tapping only settles the powder, so the tapped volume has to be smaller than the
                        initial volume. Check the two readings have not been swapped.
                    </LabNotice>
                )}

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {EXAMPLES.map((example) => (
                            <button
                                key={example.name}
                                type="button"
                                onClick={() => {
                                    setMass(example.mass);
                                    setInitialVolume(example.v0);
                                    setFinalVolume(example.vf);
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {example.name}{" "}
                                <span className="font-normal text-muted-foreground">
                                    {example.mass} g · {example.v0}→{example.vf} mL
                                </span>
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
                <CalcSection title="Calculation details">
                    <div>
                        <ResultRow
                            label="Carr's index"
                            value={`(${initialVolume} − ${finalVolume}) ÷ ${initialVolume} × 100 = ${result.compressibilityIndex.toFixed(1)}`}
                            unit="%"
                        />
                        <ResultRow label="USP limit" value="≤20% (good)" />
                        <ResultRow
                            label="Hausner ratio"
                            value={`${initialVolume} ÷ ${finalVolume} = ${result.hausnerRatio.toFixed(2)}`}
                        />
                        <ResultRow label="Hausner target" value="<1.25" />
                        <ResultRow
                            label="Bulk density (ρ_b)"
                            value={`${mass} ÷ ${initialVolume} = ${result.bulkDensity.toFixed(3)}`}
                            unit="g/mL"
                        />
                        <ResultRow
                            label="Tapped density (ρ_t)"
                            value={`${mass} ÷ ${finalVolume} = ${result.tappedDensity.toFixed(3)}`}
                            unit="g/mL"
                        />
                        <ResultRow label="Flow character" value={`${result.interpretation} (${result.flowCharacter})`} />
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        <span className="font-semibold text-foreground">Recommendation:</span> {result.recommendation}
                    </p>
                </CalcSection>
            )}

            <CalcSection title="Flowability classification reference">
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[520px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium sm:px-3">Carr&apos;s Index (%)</th>
                                <th className="px-3 py-2.5 font-medium">Hausner Ratio</th>
                                <th className="px-3 py-2.5 font-medium">Flow Character</th>
                                <th className="px-3 py-2.5 font-medium">Typical Example</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CLASSIFICATION.map((row) => (
                                <tr key={row.flow} className="border-b border-border/70 last:border-b-0">
                                    <td className="px-4 py-2.5 font-medium tabular-nums text-foreground sm:px-3">{row.ci}</td>
                                    <td className="px-3 py-2.5 tabular-nums text-foreground">{row.hr}</td>
                                    <td className="px-3 py-2.5 font-medium text-foreground">{row.flow}</td>
                                    <td className="px-3 py-2.5 text-muted-foreground">{row.example}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <ScaleList title="Carr's index scale" rows={CARR_SCALE} />
                    <ScaleList title="Hausner ratio scale" rows={HAUSNER_SCALE} />
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>CI = (V₀ − Vₜ) / V₀ × 100</Formula>
                <Formula>HR = V₀ / Vₜ</Formula>
                <Formula>ρ_b = m / V₀ · ρ_t = m / Vₜ</Formula>
                <p>
                    m = powder mass (g), V₀ = initial (bulk) volume (mL), Vₜ = tapped volume (mL), ρ_b =
                    bulk density, ρ_t = tapped density.
                </p>
                <p>
                    Because the mass is the same before and after tapping, Carr&apos;s index and the
                    Hausner ratio can be worked out from the two volumes alone — the mass is only needed
                    for the densities.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Is the compressibility index the same as Carr's index?",
                        a: "Yes. Carr's index, Carr's compressibility index and the compressibility index all refer to (V₀ − Vₜ) / V₀ × 100, which equals (ρ_t − ρ_b) / ρ_t × 100.",
                    },
                    {
                        q: "How many taps should I use?",
                        a: "USP method I taps 10, 500 and 1250 times and continues until the volume change between readings is small (under 2 mL). Use the same number of taps for every sample you want to compare.",
                    },
                    {
                        q: "Why is the result shown to one decimal place?",
                        a: "Cylinder volumes are usually read to the nearest 0.5–1 mL, so more decimals would suggest precision the test does not have. The flow band is decided on the unrounded value, so 14.99% counts as Good even though it displays as 15.0%.",
                    },
                    {
                        q: "What if the powder flows poorly?",
                        a: "Add a glidant such as colloidal silicon dioxide, or granulate the powder to make larger, rounder particles. Re-test afterwards to confirm the improvement.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
