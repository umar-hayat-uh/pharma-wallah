"use client";

import { useMemo, useState } from "react";
import { Box, Filter, RefreshCw, Scale } from "lucide-react";
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
    ModeSwitch,
    fieldError,
    type ModeOption,
} from "@/components/calculators";

type Method = "density" | "volume";

const MODE_OPTIONS: ModeOption<Method>[] = [
    { value: "density", label: "Density Method", description: "From true and bulk density", icon: Scale },
    { value: "volume", label: "Volume Method", description: "From total and solid volume", icon: Box },
];

/* ── Sample materials (unchanged) ─────────────────────────────────────────── */
const SAMPLE_MATERIALS: { name: string; porosity: number; method: Method }[] = [
    { name: "Compressed Tablet", porosity: 5, method: "density" },
    { name: "Granules", porosity: 25, method: "density" },
    { name: "Powder Blend", porosity: 40, method: "density" },
    { name: "Porous Excipient", porosity: 60, method: "volume" },
];

const POROSITY_SCALE = [
    { range: "0–10%", label: "Very Low" },
    { range: "10–25%", label: "Low" },
    { range: "25–40%", label: "Medium" },
    { range: "40–60%", label: "High" },
    { range: "60–100%", label: "Very High" },
];

/** Classification bands and strings, exactly the previous page's. */
function interpret(porosity: number) {
    const voidFraction = porosity / 100;
    const solidFraction = 1 - voidFraction;

    let interpretation = "";
    let classification = "";

    if (porosity < 10) {
        interpretation = "Very low porosity, highly compact material.";
        classification = "Non-porous";
    } else if (porosity < 25) {
        interpretation = "Low porosity, well-compacted powder.";
        classification = "Low Porosity";
    } else if (porosity < 40) {
        interpretation = "Moderate porosity, typical for many pharmaceutical powders.";
        classification = "Medium Porosity";
    } else if (porosity < 60) {
        interpretation = "High porosity, good for dissolution but poor flow.";
        classification = "High Porosity";
    } else {
        interpretation = "Very high porosity, excellent for rapid dissolution.";
        classification = "Very High Porosity";
    }

    return { porosity, voidFraction, solidFraction, interpretation, classification };
}

/** toFixed without ever printing "-0.00". */
function fixed(value: number, digits: number): string {
    const text = value.toFixed(digits);
    return Number(text) === 0 ? (0).toFixed(digits) : text;
}

export default function PorosityCalculator() {
    const [method, setMethod] = useState<Method>("density");
    const [trueDensity, setTrueDensity] = useState("");
    const [bulkDensity, setBulkDensity] = useState("");
    const [volumeTotal, setVolumeTotal] = useState("");
    const [volumeSolid, setVolumeSolid] = useState("");

    /*
     * Live, derived from the inputs of the selected method. The previous page
     * stored the result on Calculate, so a failed calculation (or a method
     * switch) left the last result showing. Arithmetic unchanged.
     */
    const state = useMemo(() => {
        if (method === "density") {
            const ρTrue = parseFloat(trueDensity);
            const ρBulk = parseFloat(bulkDensity);
            if (isNaN(ρTrue) || isNaN(ρBulk) || ρTrue <= 0 || ρBulk <= 0) return { result: null, orderError: null };
            if (ρBulk > ρTrue) return { result: null, orderError: "Bulk density cannot be greater than true density" };
            return { result: interpret((1 - ρBulk / ρTrue) * 100), orderError: null };
        }
        const vTotal = parseFloat(volumeTotal);
        const vSolid = parseFloat(volumeSolid);
        if (isNaN(vTotal) || isNaN(vSolid) || vTotal <= 0 || vSolid <= 0) return { result: null, orderError: null };
        if (vSolid > vTotal) return { result: null, orderError: "Solid volume cannot be greater than total volume" };
        return { result: interpret(((vTotal - vSolid) / vTotal) * 100), orderError: null };
    }, [method, trueDensity, bulkDensity, volumeTotal, volumeSolid]);

    const result = state.result;

    const reset = () => {
        setTrueDensity("");
        setBulkDensity("");
        setVolumeTotal("");
        setVolumeSolid("");
    };

    const substitution =
        method === "density"
            ? `(1 − ${bulkDensity} ÷ ${trueDensity}) × 100`
            : `(${volumeTotal} − ${volumeSolid}) ÷ ${volumeTotal} × 100`;

    return (
        <CalculatorShell
            title="Porosity Calculator"
            subtitle="Calculates the porosity (ε), void fraction and solid fraction of a powder, granule or tablet from its densities or volumes."
            icon={Filter}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Porosity is the share of a material&apos;s total volume that is empty space — the
                            air between particles and inside their pores. It explains why two tablets of the
                            same formula can dissolve at very different rates.
                        </p>
                        <CalcList
                            title="Pharmaceutical significance"
                            items={[
                                "Affects dissolution rate",
                                "Influences powder flow",
                                "Impacts compression",
                                "Affects drug loading",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch label="Calculation method" value={method} onChange={setMethod} options={MODE_OPTIONS} />

            <ResultCard
                label="Porosity"
                value={result ? fixed(result.porosity, 2) : null}
                unit="%"
                interpretation={result ? `${result.classification} — ${result.interpretation}` : undefined}
                empty={
                    state.orderError
                        ? `${state.orderError}.`
                        : method === "density"
                          ? "Enter the true and bulk density to see the porosity."
                          : "Enter the total and solid volume to see the porosity."
                }
            />

            <CalcSection title="Inputs">
                {method === "density" ? (
                    <FieldGrid>
                        <NumberField
                            label="True density (ρ_true)"
                            value={trueDensity}
                            onChange={setTrueDensity}
                            unit="g/mL"
                            step="0.001"
                            placeholder="e.g., 1.52"
                            hint="Density excluding pores (helium pycnometry)."
                            error={fieldError(trueDensity, { show: false })}
                        />
                        <NumberField
                            label="Bulk density (ρ_bulk)"
                            value={bulkDensity}
                            onChange={setBulkDensity}
                            unit="g/mL"
                            step="0.001"
                            placeholder="e.g., 0.65"
                            hint="Mass ÷ bulk volume, including voids. Must not exceed the true density."
                            error={fieldError(bulkDensity, { show: false })}
                        />
                    </FieldGrid>
                ) : (
                    <FieldGrid>
                        <NumberField
                            label="Total volume (V_total)"
                            value={volumeTotal}
                            onChange={setVolumeTotal}
                            unit="mL"
                            step="0.01"
                            placeholder="e.g., 100.0"
                            hint="Bulk volume of the sample, solid plus voids."
                            error={fieldError(volumeTotal, { show: false })}
                        />
                        <NumberField
                            label="Solid volume (V_solid)"
                            value={volumeSolid}
                            onChange={setVolumeSolid}
                            unit="mL"
                            step="0.01"
                            placeholder="e.g., 60.0"
                            hint="Volume of the solid alone. Must not exceed the total volume."
                            error={fieldError(volumeSolid, { show: false })}
                        />
                    </FieldGrid>
                )}

                {state.orderError && (
                    <LabNotice tone="danger" title={state.orderError}>
                        {method === "density"
                            ? "Voids can only lower a density, so bulk density is always at or below true density. Check the two values have not been swapped."
                            : "The solid is part of the total volume, so it cannot be larger. Check the two values have not been swapped."}
                    </LabNotice>
                )}

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try a sample material</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_MATERIALS.map((material) => (
                            <button
                                key={material.name}
                                type="button"
                                onClick={() => {
                                    if (material.method === "density") {
                                        setMethod("density");
                                        setTrueDensity("1.5");
                                        setBulkDensity(((1.5 * (100 - material.porosity)) / 100).toFixed(3));
                                    } else {
                                        setMethod("volume");
                                        setVolumeTotal("100");
                                        setVolumeSolid(((100 * (100 - material.porosity)) / 100).toFixed(1));
                                    }
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {material.name}{" "}
                                <span className="font-normal text-muted-foreground">{material.porosity}%</span>
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
                        <ResultRow label="Porosity" value={`${substitution} = ${fixed(result.porosity, 2)}`} unit="%" />
                        <ResultRow label="Classification" value={result.classification} />
                        <ResultRow label="Void fraction" value={fixed(result.voidFraction, 4)} />
                        <ResultRow label="Solid fraction" value={fixed(result.solidFraction, 4)} />
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-medium text-foreground">Composition</p>
                        <div
                            className="flex h-6 overflow-hidden rounded-full bg-muted"
                            role="img"
                            aria-label={`Voids ${fixed(result.porosity, 1)}%, solid ${fixed(100 - result.porosity, 1)}%`}
                        >
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500"
                                style={{ width: `${Math.min(Math.max(result.porosity, 0), 100)}%` }}
                            />
                            <div className="h-full flex-1 bg-slate-300" />
                        </div>
                        <div className="mt-2 flex justify-between text-xs font-medium">
                            <span className="text-blue-700">Voids: {fixed(result.porosity, 1)}%</span>
                            <span className="text-muted-foreground">Solid: {fixed(100 - result.porosity, 1)}%</span>
                        </div>
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Porosity scale">
                <div>
                    {POROSITY_SCALE.map((band) => (
                        <ResultRow key={band.range} label={band.range} value={band.label} />
                    ))}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>ε = (1 − ρ_bulk / ρ_true) × 100%</Formula>
                <Formula>ε = (V_total − V_solid) / V_total × 100%</Formula>
                <p>
                    ε = porosity; ρ_bulk and ρ_true = bulk and true density (same units); V_total = bulk
                    volume of the sample; V_solid = volume of the solid alone.
                </p>
                <p>
                    Void fraction is porosity as a fraction (ε ÷ 100), and solid fraction is what is left
                    (1 − void fraction). Both methods give the same answer for the same sample, because
                    bulk ÷ true density equals solid ÷ total volume.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Which method should I use?",
                        a: "Use whichever you measured. Densities are the usual route for powders (true density from a pycnometer, bulk density from a cylinder); volumes suit a tablet or compact whose dimensions and solid volume you know.",
                    },
                    {
                        q: "What is the difference between porosity and void fraction?",
                        a: "They are the same quantity in different forms: porosity is a percentage (40%), void fraction is the fraction (0.40). Solid fraction, sometimes called relative density, is 1 minus the void fraction.",
                    },
                    {
                        q: "Why does high porosity help dissolution but hurt flow?",
                        a: "Open pores let fluid into the particle or tablet, speeding disintegration and dissolution. But a very porous powder is usually light and fluffy, packs unevenly and flows poorly.",
                    },
                    {
                        q: "Do I need g/mL?",
                        a: "No. In each formula the units cancel, so any unit works as long as both densities, or both volumes, use the same one.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
