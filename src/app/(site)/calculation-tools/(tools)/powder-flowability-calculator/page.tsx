"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Wind } from "lucide-react";
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
    toNumber,
    type ResultTone,
} from "@/components/calculators";

/* ── Quick samples, g/mL (unchanged) ──────────────────────────────────────── */
const SAMPLES = [
    { bulk: 0.45, tapped: 0.55, label: "Excellent Flow" },
    { bulk: 0.5, tapped: 0.6, label: "Good Flow" },
    { bulk: 0.4, tapped: 0.55, label: "Poor Flow" },
    { bulk: 0.35, tapped: 0.5, label: "Very Poor Flow" },
];

/** The reference scale the previous page printed under its results (unchanged text). */
const FLOW_SCALE = [
    { range: "Carr's Index <10%", label: "Excellent", dot: "bg-emerald-500" },
    { range: "10–15%", label: "Good", dot: "bg-blue-500" },
    { range: "16–20%", label: "Fair", dot: "bg-amber-400" },
    { range: "21–25%", label: "Passable", dot: "bg-orange-500" },
    { range: ">25%", label: "Poor", dot: "bg-red-500" },
];

type Flow = {
    carrsIndex: number;
    hausnerRatio: number;
    flowability: string;
    compressibility: string;
    quality: string;
    hausnerQuality: string;
};

/**
 * Carr's index and Hausner ratio from bulk and tapped density.
 * Bands, strings and arithmetic are exactly the previous page's.
 */
function computeFlow(bulk: number, tapped: number): Flow {
    const carrsIndex = ((tapped - bulk) / tapped) * 100;
    const hausnerRatio = tapped / bulk;

    let flowability = "";
    let compressibility = "";
    let quality = "";

    if (carrsIndex < 10) {
        flowability = "Excellent";
        compressibility = "Very Low";
        quality = "Excellent flow, no glidant needed.";
    } else if (carrsIndex < 15) {
        flowability = "Good";
        compressibility = "Low";
        quality = "Good flow, may require minimal glidant.";
    } else if (carrsIndex < 20) {
        flowability = "Fair";
        compressibility = "Moderate";
        quality = "Fair flow, may require glidant.";
    } else if (carrsIndex < 25) {
        flowability = "Passable";
        compressibility = "High";
        quality = "Poor flow, requires glidant.";
    } else if (carrsIndex < 31) {
        flowability = "Poor";
        compressibility = "Very High";
        quality = "Very poor flow, needs significant glidant.";
    } else {
        flowability = "Very Poor";
        compressibility = "Extremely High";
        quality = "Extremely poor flow, not suitable for direct compression.";
    }

    let hausnerQuality = "";
    if (hausnerRatio < 1.2) hausnerQuality = "Excellent flow";
    else if (hausnerRatio < 1.25) hausnerQuality = "Good flow";
    else if (hausnerRatio < 1.4) hausnerQuality = "Fair flow";
    else hausnerQuality = "Poor flow";

    return {
        carrsIndex,
        hausnerRatio,
        flowability,
        compressibility,
        quality: `${quality} Hausner Ratio indicates: ${hausnerQuality}.`,
        hausnerQuality,
    };
}

export default function PowderFlowabilityCalculator() {
    const [bulkDensity, setBulkDensity] = useState("");
    const [tappedDensity, setTappedDensity] = useState("");

    const bulkError = fieldError(bulkDensity, { show: false });
    const tappedError = fieldError(tappedDensity, { show: false });

    /*
     * Live, derived from the inputs. The previous page computed on a button
     * press and alerted on bad input — which left the last valid result on
     * screen next to inputs that no longer produced it.
     */
    const state = useMemo(() => {
        const bulk = toNumber(bulkDensity);
        const tapped = toNumber(tappedDensity);
        if (bulk === null || tapped === null || bulk <= 0 || tapped <= 0) return { result: null, orderError: false };
        if (bulk >= tapped) return { result: null, orderError: true };
        return { result: computeFlow(bulk, tapped), orderError: false };
    }, [bulkDensity, tappedDensity]);

    const result = state.result;
    const tone: ResultTone = !result
        ? "neutral"
        : result.carrsIndex < 15
          ? "success"
          : result.carrsIndex < 25
            ? "warning"
            : "danger";

    const reset = () => {
        setBulkDensity("");
        setTappedDensity("");
    };

    return (
        <CalculatorShell
            title="Powder Flowability Index Calculator"
            subtitle="Works out Carr's index and the Hausner ratio from a powder's bulk and tapped density, and says how well it will flow."
            icon={Wind}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            A powder that packs down a lot when tapped is cohesive: its particles cling
                            together and it will not run smoothly from a hopper into a tablet die or capsule
                            shell. Comparing the loosely poured (bulk) density with the tapped density puts a
                            number on that.
                        </p>
                        <CalcList
                            title="Applications"
                            items={["Tablet manufacturing", "Capsule filling", "Powder blending", "Quality control"]}
                        />
                        <CalcList
                            tone="caution"
                            title="Factors affecting flow"
                            items={[
                                "Particle size & distribution",
                                "Particle shape & surface texture",
                                "Moisture content",
                                "Cohesive forces",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Carr's index"
                value={result ? result.carrsIndex.toFixed(2) : null}
                unit="%"
                interpretation={result ? `${result.flowability} — ${result.quality}` : undefined}
                tone={tone}
                empty={
                    state.orderError
                        ? "Bulk density must be less than tapped density."
                        : "Enter the bulk and tapped density to see Carr's index and the Hausner ratio."
                }
            />

            <CalcSection title="Powder density values">
                <FieldGrid>
                    <NumberField
                        label="Bulk density (ρᵦ)"
                        value={bulkDensity}
                        onChange={setBulkDensity}
                        unit="g/mL"
                        step="0.01"
                        placeholder="e.g., 0.45"
                        hint="Mass of powder divided by its bulk (poured, untapped) volume."
                        error={bulkError}
                    />
                    <NumberField
                        label="Tapped density (ρₜ)"
                        value={tappedDensity}
                        onChange={setTappedDensity}
                        unit="g/mL"
                        step="0.01"
                        placeholder="e.g., 0.55"
                        hint="Mass of powder divided by its tapped volume. Always higher than bulk density."
                        error={tappedError}
                    />
                </FieldGrid>

                {state.orderError && (
                    <LabNotice tone="danger" title="Bulk density must be less than tapped density">
                        Tapping only packs a powder down, so the tapped density cannot be lower than — or
                        equal to — the bulk density. Check the two values have not been swapped.
                    </LabNotice>
                )}

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLES.map((sample) => (
                            <button
                                key={sample.label}
                                type="button"
                                onClick={() => {
                                    setBulkDensity(sample.bulk.toString());
                                    setTappedDensity(sample.tapped.toString());
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {sample.label}{" "}
                                <span className="font-normal text-muted-foreground">
                                    {sample.bulk} / {sample.tapped} g/mL
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
                <CalcSection title="Breakdown">
                    <div>
                        <ResultRow
                            label="Carr's index"
                            value={`(${tappedDensity} − ${bulkDensity}) ÷ ${tappedDensity} × 100 = ${result.carrsIndex.toFixed(2)}`}
                            unit="%"
                        />
                        <ResultRow label="Flow character" value={result.flowability} />
                        <ResultRow label="Compressibility" value={result.compressibility} />
                        <ResultRow
                            label="Hausner ratio"
                            value={`${tappedDensity} ÷ ${bulkDensity} = ${result.hausnerRatio.toFixed(3)}`}
                        />
                        <ResultRow label="Hausner target" value="<1.25" />
                        <ResultRow label="Hausner ratio indicates" value={result.hausnerQuality} />
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Flowability scale" description="Carr's index bands used to describe powder flow.">
                <div role="list" className="space-y-2.5">
                    {FLOW_SCALE.map((band) => (
                        <div role="listitem" key={band.range} className="flex items-center gap-2.5 text-sm text-foreground">
                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${band.dot}`} aria-hidden="true" />
                            <span>
                                {band.range}: <span className="font-semibold">{band.label}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>Carr&apos;s Index = (ρₜ − ρᵦ) / ρₜ × 100</Formula>
                <Formula>Hausner Ratio = ρₜ / ρᵦ</Formula>
                <p>ρₜ = tapped density, ρᵦ = bulk density (both in the same units, e.g. g/mL).</p>
                <p>
                    Both numbers describe the same thing — how much the powder consolidates when tapped.
                    Carr&apos;s index expresses the loss of volume as a percentage; the Hausner ratio
                    expresses it as a ratio. A free-flowing powder barely settles, so its index is low and
                    its ratio is close to 1.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "How do I measure bulk and tapped density?",
                        a: "Pour a weighed amount of powder gently into a graduated cylinder and read the volume — mass ÷ that volume is the bulk density. Then tap the cylinder a set number of times (USP uses a mechanical tapper, typically 500–1250 taps) until the volume stops changing; mass ÷ the tapped volume is the tapped density.",
                    },
                    {
                        q: "Do the densities have to be in g/mL?",
                        a: "No. Both formulas divide one density by the other, so the units cancel. Any unit works as long as both values use the same one.",
                    },
                    {
                        q: "Why must bulk density be lower than tapped density?",
                        a: "Tapping removes air from between particles, so the same mass occupies less volume and the density can only rise. Equal or reversed values usually mean the two readings were swapped or mistyped.",
                    },
                    {
                        q: "What does a high Carr's index mean for a formulation?",
                        a: "The powder is cohesive and will flow unevenly, causing tablet or capsule weight variation. Adding a glidant such as colloidal silica, or granulating the powder, are the usual fixes.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
