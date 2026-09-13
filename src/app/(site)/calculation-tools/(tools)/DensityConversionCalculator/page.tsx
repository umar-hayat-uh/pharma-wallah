"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    FieldGrid,
    NumberField,
    SelectField,
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
} from "@/components/calculators";

type Substance = {
    name: string;
    density: number;
    category: string;
    commonUses: string[];
};

type CalculationType = "mass_to_volume" | "volume_to_mass";
type MassUnit = "mg" | "g" | "kg";
type VolumeUnit = "mL" | "L";

/* ── Reference densities, g/mL at 20–25 °C (unchanged) ────────────────────── */
const SUBSTANCES: Record<string, Substance> = {
    water: { name: "Water", density: 1.0, category: "Solvent", commonUses: ["Diluent", "Vehicle", "Reconstitution"] },
    ethanol: { name: "Ethanol (95%)", density: 0.816, category: "Solvent", commonUses: ["Extraction", "Preservative", "Tinctures"] },
    glycerol: { name: "Glycerol", density: 1.26, category: "Vehicle", commonUses: ["Syrups", "Ointments", "Humectant"] },
    propylene_glycol: { name: "Propylene Glycol", density: 1.04, category: "Vehicle", commonUses: ["Injectables", "Topicals", "Solvent"] },
    mineral_oil: { name: "Mineral Oil", density: 0.88, category: "Vehicle", commonUses: ["Laxative", "Ointment base", "Lubricant"] },
    olive_oil: { name: "Olive Oil", density: 0.92, category: "Vehicle", commonUses: ["Ointments", "Emulsions", "Carrier"] },
    honey: { name: "Honey", density: 1.42, category: "Vehicle", commonUses: ["Cough syrups", "Demulcent", "Sweetener"] },
};

const SUBSTANCE_OPTIONS = [
    ...Object.entries(SUBSTANCES).map(([key, s]) => ({ value: key, label: `${s.name} — ${s.density} g/mL` })),
    { value: "custom", label: "Custom — enter density" },
];

const COMMON_CONVERSIONS = [
    { substance: "water", mass: 100, volume: 100, type: "mass_to_volume" as const },
    { substance: "ethanol", mass: 100, volume: 122.5, type: "mass_to_volume" as const },
    { substance: "glycerol", mass: 100, volume: 79.4, type: "mass_to_volume" as const },
    { substance: "propylene_glycol", mass: 100, volume: 96.2, type: "mass_to_volume" as const },
    { substance: "mineral_oil", mass: 100, volume: 113.6, type: "mass_to_volume" as const },
];

const MODE_OPTIONS: ModeOption<CalculationType>[] = [
    { value: "mass_to_volume", label: "Mass → Volume", description: "Volume = Mass ÷ Density" },
    { value: "volume_to_mass", label: "Volume → Mass", description: "Mass = Volume × Density" },
];

const COMPOUNDING_TIPS = [
    "Always measure liquids at room temperature (20-25°C)",
    "Account for temperature effects on density",
    "Use calibrated glassware for volume measurements",
    "Verify density values in USP/NF monographs",
];

/** Unchanged: 2 decimal places, or scientific notation for very large/small values. */
function formatNumber(num: number): string {
    if (num === 0) return "0";
    if (Math.abs(num) >= 10000 || (Math.abs(num) < 0.001 && num !== 0)) {
        return num.toExponential(3);
    }
    return num.toFixed(2);
}

const DEFAULTS = {
    mass: "100",
    volume: "100",
    density: "1",
    substance: "water",
    type: "mass_to_volume" as CalculationType,
};

export default function DensityConversionCalculator() {
    const [mass, setMass] = useState(DEFAULTS.mass);
    const [volume, setVolume] = useState(DEFAULTS.volume);
    const [density, setDensity] = useState(DEFAULTS.density);
    const [selectedSubstance, setSelectedSubstance] = useState(DEFAULTS.substance);
    const [calculationType, setCalculationType] = useState<CalculationType>(DEFAULTS.type);
    const [massUnit, setMassUnit] = useState<MassUnit>("g");
    const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>("mL");

    const isCustom = selectedSubstance === "custom";
    const substance = isCustom ? null : SUBSTANCES[selectedSubstance];
    const massToVolume = calculationType === "mass_to_volume";
    const amountRaw = massToVolume ? mass : volume;
    const inputUnit = massToVolume ? massUnit : volumeUnit;
    const outputUnit = massToVolume ? volumeUnit : massUnit;

    const parsedAmount = parseFloat(amountRaw);
    const amountError =
        amountRaw.trim() !== "" && isNaN(parsedAmount)
            ? "Enter a number."
            : parsedAmount < 0
              ? `A ${massToVolume ? "mass" : "volume"} cannot be negative.`
              : undefined;
    const parsedDensity = parseFloat(density);
    const densityError =
        isCustom && (density.trim() === "" || isNaN(parsedDensity))
            ? "Enter the density."
            : isCustom && parsedDensity <= 0
              ? "Density must be greater than zero."
              : undefined;

    /*
     * Derived, not stored — the previous page refreshed state from a useEffect.
     * Same arithmetic: volume = mass ÷ density, mass = volume × density, with a
     * listed substance always using its reference density.
     */
    const result = useMemo(() => {
        const massVal = parseFloat(mass);
        const volumeVal = parseFloat(volume);
        const densityVal = selectedSubstance === "custom" ? parseFloat(density) : SUBSTANCES[selectedSubstance].density;
        if (isNaN(densityVal) || densityVal <= 0) return null;

        const value = calculationType === "mass_to_volume" ? massVal / densityVal : volumeVal * densityVal;
        if (!Number.isFinite(value) || value < 0) return null;
        return { value, densityVal };
    }, [mass, volume, density, selectedSubstance, calculationType]);

    const substanceName = substance?.name || "Substance";

    const handleSubstanceChange = (next: string) => {
        setSelectedSubstance(next);
        if (next !== "custom") setDensity(SUBSTANCES[next].density.toFixed(3));
    };

    const reset = () => {
        setMass(DEFAULTS.mass);
        setVolume(DEFAULTS.volume);
        setDensity(DEFAULTS.density);
        setSelectedSubstance(DEFAULTS.substance);
        setCalculationType(DEFAULTS.type);
    };

    return (
        <CalculatorShell
            title="Density-Based Conversion Calculator"
            subtitle="Converts between the mass and the volume of a liquid using its density — for weighing viscous vehicles and measuring solvents in compounding."
            icon={Weight}
            eyebrow="Unit Conversion"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Density links how much a liquid weighs to how much space it takes up. Glycerol
                            and honey are too viscous to measure accurately by volume, so formulas are often
                            converted to a mass and weighed; ethanol is lighter than water, so 100 g of it
                            fills more than 100 mL.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "A formula gives a volume but the liquid is easier to weigh",
                                "Converting a weighed quantity of solvent into millilitres",
                                "Checking a w/w and v/v preparation against each other",
                            ]}
                        />
                        <CalcList title="Compounding tips" items={COMPOUNDING_TIPS} />
                        <CalcList
                            tone="caution"
                            title="Check before relying on it"
                            items={[
                                "Density changes with temperature and, for mixtures such as ethanol–water, with composition",
                                "Use the density from the monograph or certificate of analysis for the batch you hold",
                                "The mass and volume units are labels here: enter grams with millilitres (g/mL density) for a correct answer",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch
                label="Calculation type"
                value={calculationType}
                onChange={setCalculationType}
                options={MODE_OPTIONS}
            />

            <ResultCard
                label={`${massToVolume ? "Volume" : "Mass"} of ${substanceName}`}
                value={result ? formatNumber(result.value) : null}
                unit={outputUnit}
                interpretation={result ? `${amountRaw} ${inputUnit} of ${substanceName} · density ${density} g/mL` : undefined}
                empty={
                    densityError
                        ? "Enter a density greater than zero for the custom substance."
                        : `Enter the ${massToVolume ? "mass" : "volume"} to convert.`
                }
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    <SelectField
                        label="Substance"
                        value={selectedSubstance}
                        onChange={handleSubstanceChange}
                        options={SUBSTANCE_OPTIONS}
                        hint="Pick a listed liquid, or Custom to type your own density."
                    />
                    <NumberField
                        label="Density (g/mL)"
                        value={density}
                        onChange={setDensity}
                        unit="g/mL"
                        step="0.001"
                        placeholder="Enter density"
                        disabled={!isCustom}
                        hint={substance ? `Density of ${substance.name}: ${density} g/mL` : "From the monograph or certificate of analysis."}
                        error={densityError}
                    />
                </FieldGrid>

                {massToVolume ? (
                    <NumberField
                        label={`Mass (${massUnit})`}
                        value={mass}
                        onChange={setMass}
                        units={["mg", "g", "kg"]}
                        unit={massUnit}
                        onUnitChange={(next) => setMassUnit(next as MassUnit)}
                        step="0.001"
                        placeholder="Enter mass"
                        hint="The weighed amount of the liquid."
                        error={amountError}
                    />
                ) : (
                    <NumberField
                        label={`Volume (${volumeUnit})`}
                        value={volume}
                        onChange={setVolume}
                        units={["mL", "L"]}
                        unit={volumeUnit}
                        onUnitChange={(next) => setVolumeUnit(next as VolumeUnit)}
                        step="0.001"
                        placeholder="Enter volume"
                        hint="The measured volume of the liquid."
                        error={amountError}
                    />
                )}

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Common conversions</p>
                    <div className="flex flex-wrap gap-2">
                        {COMMON_CONVERSIONS.map((conv) => (
                            <button
                                key={conv.substance}
                                type="button"
                                onClick={() => {
                                    handleSubstanceChange(conv.substance);
                                    setCalculationType(conv.type);
                                    setMass(conv.mass.toString());
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 text-sm font-medium transition-colors hover:border-foreground/25 active:bg-accent"
                            >
                                {conv.mass}g {SUBSTANCES[conv.substance].name}{" "}
                                <span className="font-normal text-muted-foreground">= {conv.volume}mL</span>
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
                        <ResultRow label={massToVolume ? "Mass" : "Volume"} value={amountRaw} unit={inputUnit} />
                        <ResultRow label="Density" value={density} unit="g/mL" />
                        <ResultRow
                            label="Substitution"
                            value={
                                massToVolume
                                    ? `${amountRaw} ÷ ${result.densityVal} = ${formatNumber(result.value)}`
                                    : `${amountRaw} × ${result.densityVal} = ${formatNumber(result.value)}`
                            }
                            unit={outputUnit}
                        />
                        {substance && (
                            <>
                                <ResultRow label="Category" value={substance.category} />
                                <ResultRow label="Uses" value={substance.commonUses.join(", ")} />
                            </>
                        )}
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Density comparison" description="Reference densities in g/mL; the bar is scaled to 1.5 g/mL.">
                <div className="space-y-3">
                    {Object.entries(SUBSTANCES).map(([key, s]) => (
                        <div key={key} className="flex items-center gap-3">
                            <div
                                className={
                                    key === selectedSubstance
                                        ? "w-28 shrink-0 text-sm font-semibold text-foreground sm:w-36"
                                        : "w-28 shrink-0 text-sm text-muted-foreground sm:w-36"
                                }
                            >
                                {s.name}
                            </div>
                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
                                    style={{ width: `${(s.density / 1.5) * 100}%` }}
                                />
                            </div>
                            <div className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                                {s.density}
                            </div>
                        </div>
                    ))}
                </div>
            </CalcSection>

            <CalcSection title="Density reference table">
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[36rem] text-left text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs text-muted-foreground">
                                <th className="px-4 py-2.5 font-medium sm:px-3">Substance</th>
                                <th className="px-3 py-2.5 font-medium">Density (g/mL)</th>
                                <th className="px-3 py-2.5 font-medium">Category</th>
                                <th className="px-3 py-2.5 font-medium">Common uses</th>
                                <th className="px-3 py-2.5 font-medium">Temperature</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(SUBSTANCES).map(([key, s]) => (
                                <tr key={key} className="border-b border-border/70">
                                    <td className="px-4 py-2.5 font-medium text-foreground sm:px-3">{s.name}</td>
                                    <td className="px-3 py-2.5 tabular-nums">{s.density.toFixed(3)}</td>
                                    <td className="px-3 py-2.5">{s.category}</td>
                                    <td className="px-3 py-2.5">{s.commonUses.join(", ")}</td>
                                    <td className="px-3 py-2.5">20-25°C</td>
                                </tr>
                            ))}
                            <tr className="border-b border-border/70 bg-muted/50">
                                <td className="px-4 py-2.5 font-medium text-foreground sm:px-3">Water (4°C)</td>
                                <td className="px-3 py-2.5 tabular-nums">1.000</td>
                                <td className="px-3 py-2.5">Reference</td>
                                <td className="px-3 py-2.5">Standard reference</td>
                                <td className="px-3 py-2.5">4°C</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2.5 font-medium text-foreground sm:px-3">Ethanol (100%)</td>
                                <td className="px-3 py-2.5 tabular-nums">0.789</td>
                                <td className="px-3 py-2.5">Solvent</td>
                                <td className="px-3 py-2.5">Tinctures, extracts</td>
                                <td className="px-3 py-2.5">20°C</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>Density (ρ) = Mass ÷ Volume</Formula>
                <Formula>Volume = Mass ÷ Density · Mass = Volume × Density</Formula>
                <p>
                    Density is quoted in g/mL, so the arithmetic is only correct when mass is in grams and
                    volume in millilitres. A density above 1 means the liquid is heavier than water — its
                    volume is smaller than its mass in grams; below 1, the volume is larger.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why weigh a liquid instead of measuring its volume?",
                        a: "Viscous liquids such as glycerol, honey and syrups cling to glassware, so a measured volume delivers less than it reads. Weighing on a calibrated balance avoids that loss, and density turns the prescribed volume into the mass to weigh.",
                    },
                    {
                        q: "Is density the same as specific gravity?",
                        a: "Numerically almost, near room temperature. Specific gravity is density divided by the density of water, so it has no units; because water is about 1.00 g/mL, the two figures match to two decimals for everyday pharmacy work.",
                    },
                    {
                        q: "Why is 95% ethanol 0.816 g/mL but pure ethanol 0.789?",
                        a: "Ethanol–water mixtures are denser than pure ethanol because water is heavier. The exact figure depends on strength and temperature, so use the value for the grade you actually hold.",
                    },
                    {
                        q: "Does temperature matter?",
                        a: "Yes. Most liquids expand when warmed, so their density falls. The reference values here are for 20–25 °C; measure at room temperature or use a density for your actual temperature.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
