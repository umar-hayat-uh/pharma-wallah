"use client";

import { useMemo, useState } from "react";
import { Beaker, Droplets, RefreshCw, Scale, Weight } from "lucide-react";
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

type DensityType = "true" | "bulk" | "tapped";

const MODE_OPTIONS: ModeOption<DensityType>[] = [
    { value: "true", label: "True", description: "Excluding pores and voids", icon: Weight },
    { value: "bulk", label: "Bulk", description: "Including voids between particles", icon: Beaker },
    { value: "tapped", label: "Tapped", description: "Bulk density after tapping", icon: Droplets },
];

const TYPE_LABEL: Record<DensityType, string> = { true: "True", bulk: "Bulk", tapped: "Tapped" };

/* ── Common materials, g/mL (unchanged) ───────────────────────────────────── */
const SAMPLE_MATERIALS: { name: string; density: number; type: DensityType }[] = [
    { name: "Water", density: 1.0, type: "true" },
    { name: "Lactose", density: 1.52, type: "true" },
    { name: "Microcrystalline Cellulose", density: 1.5, type: "true" },
    { name: "Magnesium Stearate", density: 1.1, type: "bulk" },
    { name: "Talc", density: 2.7, type: "true" },
];

const COMMON_DENSITIES = [
    { name: "Water", value: "1.0" },
    { name: "Lactose", value: "1.52" },
    { name: "MCC", value: "1.5" },
    { name: "Mg Stearate", value: "1.1" },
];

/** The previous page's parse: an empty optional field counts as 0. */
function optional(raw: string): number {
    return raw ? parseFloat(raw) : 0;
}

export default function DensityCalculator() {
    const [densityType, setDensityType] = useState<DensityType>("true");
    const [mass, setMass] = useState("");
    const [volume, setVolume] = useState("");
    const [containerMass, setContainerMass] = useState("");
    const [containerVolume, setContainerVolume] = useState("");

    const massError = fieldError(mass, { show: false });
    const volumeError = fieldError(volume, { show: false });
    const containerMassError = fieldError(containerMass, { show: false, allowZero: true, required: false });
    const containerVolumeError = fieldError(containerVolume, { show: false, allowZero: true, required: false });

    /*
     * Live, derived from the inputs and the selected type. The previous page
     * stored the result on Calculate and titled it with the *current* type, so
     * switching type afterwards relabelled an old number. Arithmetic unchanged.
     */
    const result = useMemo(() => {
        const m = parseFloat(mass);
        const v = parseFloat(volume);
        const cm = optional(containerMass);
        const cv = optional(containerVolume);
        if (isNaN(m) || isNaN(v) || m <= 0 || v <= 0) return null;

        let density = 0;
        let interpretation = "";
        let formula = "";
        let substitution = "";
        let containerIgnored = false;

        switch (densityType) {
            case "true":
                density = m / v;
                formula = "ρ = m / V";
                substitution = `${mass} ÷ ${volume}`;
                if (density < 1) interpretation = "Material will float on water";
                else if (density < 2) interpretation = "Typical for many pharmaceutical powders";
                else interpretation = "High density material";
                break;

            case "bulk":
                if (cm > 0) {
                    density = (m - cm) / v;
                    formula = "ρ_bulk = (m_total - m_container) / V";
                    substitution = `(${mass} − ${containerMass}) ÷ ${volume}`;
                } else {
                    density = m / v;
                    formula = "ρ_bulk = m / V";
                    substitution = `${mass} ÷ ${volume}`;
                }
                interpretation = "Includes void spaces between particles";
                break;

            case "tapped":
                if (cv > 0 && v > cv) {
                    density = m / (v - cv);
                    formula = "ρ_tapped = m / (V_total - V_container)";
                    substitution = `${mass} ÷ (${volume} − ${containerVolume})`;
                } else {
                    density = m / v;
                    formula = "ρ_tapped = m / V";
                    substitution = `${mass} ÷ ${volume}`;
                    containerIgnored = cv > 0;
                }
                interpretation = "Measured after standard tapping procedure";
                break;
        }

        if (!Number.isFinite(density)) return null;
        return { density, interpretation, formula, substitution, containerIgnored };
    }, [densityType, mass, volume, containerMass, containerVolume]);

    const negative = result !== null && result.density < 0;
    // Never print "-0.0000".
    const shown = result ? (Object.is(Number(result.density.toFixed(4)), -0) ? "0.0000" : result.density.toFixed(4)) : null;

    const reset = () => {
        setMass("");
        setVolume("");
        setContainerMass("");
        setContainerVolume("");
    };

    return (
        <CalculatorShell
            title="Density Calculator"
            subtitle="Calculates the true, bulk or tapped density of a pharmaceutical material from its mass and volume."
            icon={Scale}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            The same powder has three densities depending on which volume you divide by. True
                            density uses the volume of the solid alone; bulk density includes the air between
                            particles as the powder is poured; tapped density is the bulk density after the
                            powder has been tapped down.
                        </p>
                        <CalcList
                            title="Density types"
                            items={[
                                "True density — mass excluding pores and voids",
                                "Bulk density — mass including pores and voids",
                                "Tapped density — bulk density after tapping",
                            ]}
                        />
                        <CalcList
                            title="Applications"
                            items={["Tablet formulation", "Capsule filling", "Powder flow", "Quality control"]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch label="Density type" value={densityType} onChange={setDensityType} options={MODE_OPTIONS} />

            <ResultCard
                label={`${TYPE_LABEL[densityType]} density`}
                value={shown}
                unit="g/mL"
                interpretation={result?.interpretation}
                tone={negative ? "danger" : "neutral"}
                empty="Enter a mass and a volume greater than zero to see the density."
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    <NumberField
                        label={densityType === "bulk" ? "Mass (g) — total if weighed in a container" : "Mass (g)"}
                        value={mass}
                        onChange={setMass}
                        unit="g"
                        step="0.001"
                        placeholder="Enter mass"
                        hint={
                            densityType === "bulk"
                                ? "The powder's mass, or the powder plus container if you enter a container mass below."
                                : "The weighed mass of the sample."
                        }
                        error={massError}
                    />
                    <NumberField
                        label="Volume (mL)"
                        value={volume}
                        onChange={setVolume}
                        unit="mL"
                        step="0.01"
                        placeholder="Enter volume"
                        hint={
                            densityType === "true"
                                ? "Volume of the solid itself, e.g. by pycnometry."
                                : densityType === "bulk"
                                  ? "Volume read after gently pouring the powder into a cylinder."
                                  : "Volume read after the standard tapping procedure."
                        }
                        error={volumeError}
                    />
                </FieldGrid>

                {densityType === "bulk" && (
                    <NumberField
                        label="Container mass (g) — optional"
                        value={containerMass}
                        onChange={setContainerMass}
                        unit="g"
                        step="0.001"
                        placeholder="Mass of empty container"
                        hint="Leave blank if the mass above is the powder alone. Subtracted from the mass."
                        error={containerMassError}
                    />
                )}

                {densityType === "tapped" && (
                    <NumberField
                        label="Container volume (mL) — optional"
                        value={containerVolume}
                        onChange={setContainerVolume}
                        unit="mL"
                        step="0.01"
                        placeholder="Volume of empty container"
                        hint="Leave blank if the volume above is the powder alone. Used only when smaller than the volume."
                        error={containerVolumeError}
                    />
                )}

                {densityType === "bulk" && negative && (
                    <LabNotice tone="danger" title="Container mass is larger than the mass">
                        The mass above should be the total — powder plus container. With a heavier container
                        the powder mass comes out negative, and so does the density.
                    </LabNotice>
                )}

                {densityType === "tapped" && result?.containerIgnored && (
                    <LabNotice tone="warning" title="Container volume not used">
                        The container volume is not smaller than the volume, so it was ignored and the
                        density was calculated as m / V.
                    </LabNotice>
                )}

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Common materials — fills 100 g and the matching volume
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_MATERIALS.map((material) => (
                            <button
                                key={material.name}
                                type="button"
                                onClick={() => {
                                    setDensityType(material.type);
                                    setMass("100");
                                    setVolume((100 / material.density).toFixed(2));
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {material.name}{" "}
                                <span className="font-normal text-muted-foreground">{material.density} g/mL</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && shown !== null && (
                <CalcSection title="Working">
                    <div>
                        <ResultRow label="Formula used" value={result.formula} />
                        <ResultRow label="Substitution" value={`${result.substitution} = ${shown}`} unit="g/mL" />
                        <ResultRow label="Interpretation" value={result.interpretation} />
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Common densities">
                <div>
                    {COMMON_DENSITIES.map((row) => (
                        <ResultRow key={row.name} label={row.name} value={row.value} unit="g/mL" />
                    ))}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>ρ = m / V</Formula>
                <Formula>ρ_bulk = (m_total − m_container) / V</Formula>
                <Formula>ρ_tapped = m / (V_total − V_container)</Formula>
                <p>
                    ρ = density (g/mL), m = mass (g), V = volume (mL). The container terms are optional:
                    use them when the powder was weighed in, or its volume read together with, a container.
                </p>
                <p>
                    For true density the interpretation compares the result with water (1 g/mL): below 1
                    the material floats, 1–2 g/mL is typical of pharmaceutical powders, and 2 g/mL or more
                    is a high-density material.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why is bulk density lower than true density?",
                        a: "Bulk volume includes the air between and inside particles, so the same mass is spread over a larger volume. True density counts only the solid, which is why it is always the highest of the three.",
                    },
                    {
                        q: "How is true density measured?",
                        a: "Usually by gas (helium) pycnometry, which measures the volume of the solid by gas displacement. Helium penetrates the smallest pores, so the volume excludes voids.",
                    },
                    {
                        q: "Can I enter kilograms or litres?",
                        a: "Convert first. The calculator divides the numbers as entered and labels the result g/mL, so mass must be in grams and volume in millilitres.",
                    },
                    {
                        q: "What do I do with bulk and tapped density?",
                        a: "Use them together to judge powder flow — Carr's index and the Hausner ratio are both calculated from bulk and tapped density. See the Powder Flowability and Compressibility Index calculators.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
