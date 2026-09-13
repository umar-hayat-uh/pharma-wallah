"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Syringe } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    LabNotice,
    type ResultTone,
} from "@/components/calculators";

type ConcentrationUnit = "mg/mL" | "mcg/mL" | "units/mL" | "g/mL" | "percent";
type VolumeUnit = "mL" | "L" | "mcl";

/* ── Presets and unit tables (unchanged from the original calculator) ─────── */
const SAMPLES = [
    { name: "Vancomycin IV", desiredDose: "1000", desiredDoseUnit: "mg", concentration: "50", concentrationUnit: "mg/mL" as ConcentrationUnit, totalVolume: "250", notes: "Standard infusion" },
    { name: "Insulin", desiredDose: "10", desiredDoseUnit: "units", concentration: "100", concentrationUnit: "units/mL" as ConcentrationUnit, totalVolume: "0.1", notes: "Subcutaneous" },
    { name: "Heparin", desiredDose: "5000", desiredDoseUnit: "units", concentration: "1000", concentrationUnit: "units/mL" as ConcentrationUnit, totalVolume: "5", notes: "IV push" },
    { name: "Epinephrine", desiredDose: "0.3", desiredDoseUnit: "mg", concentration: "1", concentrationUnit: "mg/mL" as ConcentrationUnit, totalVolume: "0.3", notes: "Anaphylaxis" },
    { name: "Morphine", desiredDose: "4", desiredDoseUnit: "mg", concentration: "10", concentrationUnit: "mg/mL" as ConcentrationUnit, totalVolume: "0.4", notes: "IV push" },
];

const CONCENTRATION_UNITS = [
    { value: "mg/mL", label: "mg/mL" },
    { value: "mcg/mL", label: "mcg/mL" },
    { value: "units/mL", label: "units/mL" },
    { value: "g/mL", label: "g/mL" },
    { value: "percent", label: "% (w/v)" },
];

const DOSE_UNITS = [
    { value: "mg", label: "mg" },
    { value: "mcg", label: "mcg" },
    { value: "g", label: "g" },
    { value: "units", label: "units" },
];

const VOLUME_UNITS: { value: VolumeUnit; label: string }[] = [
    { value: "mL", label: "mL" },
    { value: "L", label: "L" },
    { value: "mcl", label: "μL" },
];

const DEFAULTS = { dose: "500", doseUnit: "mg", conc: "250", concUnit: "mg/mL" as ConcentrationUnit };

/** Volume check bands — same order as the original, so the first match wins. */
function safetyAssessment(volume: number): { tone: ResultTone; message: string } {
    if (volume < 0.1) return { tone: "warning", message: "Very small volume - use insulin syringe for accuracy" };
    if (volume > 10) return { tone: "warning", message: "Large volume - consider diluting or adjusting concentration" };
    if (volume > 50) return { tone: "danger", message: "Excessive volume - review dose and concentration" };
    return { tone: "success", message: "Volume within typical administration range" };
}

/** Pure version of the original calculateVolume(). */
function computeVolume(desiredDose: string, concentration: string, concentrationUnit: ConcentrationUnit, volumeUnit: VolumeUnit, totalVolume: string) {
    const dose = parseFloat(desiredDose);
    const conc = parseFloat(concentration);

    if (isNaN(dose) || isNaN(conc)) return { error: "Please enter valid numbers for dose and concentration" } as const;
    if (conc <= 0) return { error: "Concentration must be greater than zero" } as const;
    if (dose < 0) return { error: "Dose cannot be negative" } as const;

    let volume = dose / conc;

    // Handle percent concentration (w/v) - assuming % means g/100mL
    let mgPerMl: number | null = null;
    if (concentrationUnit === "percent") {
        const gPerMl = conc / 100;
        mgPerMl = gPerMl * 1000;
        volume = dose / mgPerMl;
    }

    // Convert volume based on selected unit
    let finalVolume = volume;
    if (volumeUnit === "L") finalVolume = volume / 1000;
    else if (volumeUnit === "mcl") finalVolume = volume * 1000;

    let finalConcentration: number | null = null;
    let totalVol: number | null = null;
    if (totalVolume) {
        const parsed = parseFloat(totalVolume);
        if (!isNaN(parsed) && parsed > 0) {
            totalVol = parsed;
            finalConcentration = dose / parsed;
        }
    }

    return { error: null, dose, conc, mgPerMl, volumeMl: volume, finalVolume, finalConcentration, totalVol } as const;
}

export default function SterileDoseVolumeCalculator() {
    const [desiredDose, setDesiredDose] = useState(DEFAULTS.dose);
    const [desiredDoseUnit, setDesiredDoseUnit] = useState(DEFAULTS.doseUnit);
    const [concentration, setConcentration] = useState(DEFAULTS.conc);
    const [concentrationUnit, setConcentrationUnit] = useState<ConcentrationUnit>(DEFAULTS.concUnit);
    const [volumeUnit, setVolumeUnit] = useState<VolumeUnit>("mL");
    const [totalVolume, setTotalVolume] = useState("");

    /*
     * Derived, not stored. The original kept the volume in state, so after an
     * invalid entry it went on showing the previous volume beside the error, and
     * a sample's delayed recalculation could re-raise a stale error.
     */
    const result = useMemo(
        () => computeVolume(desiredDose, concentration, concentrationUnit, volumeUnit, totalVolume),
        [desiredDose, concentration, concentrationUnit, volumeUnit, totalVolume],
    );
    const ok = result.error === null ? result : null;
    const safety = ok ? safetyAssessment(ok.finalVolume) : null;
    const volumeLabel = VOLUME_UNITS.find((u) => u.value === volumeUnit)?.label ?? volumeUnit;
    const concLabel = CONCENTRATION_UNITS.find((u) => u.value === concentrationUnit)?.label ?? concentrationUnit;

    const doseNum = parseFloat(desiredDose);
    const concNum = parseFloat(concentration);
    const totalNum = parseFloat(totalVolume);

    const reset = () => {
        setDesiredDose(DEFAULTS.dose);
        setDesiredDoseUnit(DEFAULTS.doseUnit);
        setConcentration(DEFAULTS.conc);
        setConcentrationUnit(DEFAULTS.concUnit);
        setVolumeUnit("mL");
        setTotalVolume("");
    };

    const loadSample = (sample: (typeof SAMPLES)[number]) => {
        setDesiredDose(sample.desiredDose);
        setDesiredDoseUnit(sample.desiredDoseUnit);
        setConcentration(sample.concentration);
        setConcentrationUnit(sample.concentrationUnit);
        setTotalVolume(sample.totalVolume);
    };

    return (
        <CalculatorShell
            title="Sterile Dose Volume Calculator"
            subtitle="Works out how much of a sterile solution to draw up for a dose, and the concentration after dilution."
            icon={Syringe}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Divide the dose you want by the strength of the vial or ampoule to get the
                            volume to draw up. Optionally, enter a diluent volume to see the final
                            concentration.
                        </p>
                        <CalcList
                            title="Sterile preparation tips"
                            items={[
                                "Aseptic technique must be maintained",
                                "Double-check calculations with another professional",
                                "Label all preparations with drug, dose, concentration, and expiration",
                                "Use appropriate syringe size for volume accuracy",
                            ]}
                        />
                        <CalcList
                            title="Volume conversion"
                            items={["1 mL = 1000 μL", "1 L = 1000 mL", "1 teaspoon ≈ 5 mL"]}
                        />
                        <CalcList
                            tone="caution"
                            title="Check before you draw up"
                            items={[
                                "Dose and concentration must use the same amount unit (mg with mg/mL, units with units/mL) — the calculator does not convert between them",
                                "% (w/v) assumes the dose is in mg",
                                "The volume check is applied to the number in the unit you selected",
                                "Always follow institutional protocols and manufacturer guidelines",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Volume to administer"
                value={ok ? ok.finalVolume.toFixed(ok.finalVolume < 0.1 ? 3 : 2) : null}
                unit={volumeLabel}
                interpretation={safety?.message}
                tone={safety?.tone ?? "neutral"}
                empty={result.error ?? undefined}
            />

            <CalcSection title="Dose and strength">
                <FieldGrid>
                    <NumberField
                        label="Desired dose"
                        value={desiredDose}
                        onChange={setDesiredDose}
                        units={DOSE_UNITS}
                        unit={desiredDoseUnit}
                        onUnitChange={setDesiredDoseUnit}
                        step="0.001"
                        placeholder="Enter dose"
                        error={!isNaN(doseNum) && doseNum < 0 ? "Dose cannot be negative" : undefined}
                        hint="The prescribed dose, in the same amount unit as the concentration."
                    />
                    <NumberField
                        label="Concentration"
                        value={concentration}
                        onChange={setConcentration}
                        units={CONCENTRATION_UNITS}
                        unit={concentrationUnit}
                        onUnitChange={(next) => setConcentrationUnit(next as ConcentrationUnit)}
                        step="0.001"
                        placeholder="Enter concentration"
                        error={!isNaN(concNum) && concNum <= 0 ? "Concentration must be greater than zero" : undefined}
                        hint={
                            concentrationUnit === "percent"
                                ? "Note: % concentration is calculated as g/100mL (w/v)"
                                : "Concentration = amount of drug per mL (from the vial label)"
                        }
                    />
                </FieldGrid>

                <FieldGrid>
                    <div className="space-y-1.5">
                        <p className="text-[13px] font-medium text-foreground/90" id="sdv-volume-unit">
                            Show volume in
                        </p>
                        <div role="group" aria-labelledby="sdv-volume-unit" className="grid grid-cols-3 gap-1 rounded-xl border bg-muted/60 p-1">
                            {VOLUME_UNITS.map((unit) => (
                                <button
                                    key={unit.value}
                                    type="button"
                                    aria-pressed={volumeUnit === unit.value}
                                    onClick={() => setVolumeUnit(unit.value)}
                                    className={cn(
                                        "h-10 rounded-lg text-sm font-semibold transition-colors",
                                        volumeUnit === unit.value
                                            ? "border border-primary/20 bg-card text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {unit.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">1 mL = 1000 μL; 1 L = 1000 mL.</p>
                    </div>
                    <NumberField
                        label="Total dilution volume (optional)"
                        value={totalVolume}
                        onChange={setTotalVolume}
                        unit="mL"
                        step="0.001"
                        placeholder="e.g., 250"
                        error={totalVolume.trim() !== "" && !isNaN(totalNum) && totalNum <= 0 ? "Must be greater than zero to calculate a final concentration." : undefined}
                        hint="Enter if you want to calculate final concentration"
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLES.map((sample) => (
                            <button
                                key={sample.name}
                                type="button"
                                onClick={() => loadSample(sample)}
                                title={`${sample.desiredDose} ${sample.desiredDoseUnit} from ${sample.concentration} ${sample.concentrationUnit}, ${sample.totalVolume} mL`}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-left text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {sample.name}
                                <span className="ml-1.5 font-normal text-muted-foreground">{sample.notes}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {ok && ok.finalConcentration !== null && (
                <CalcSection title="Final concentration" description={`This is the concentration after adding the dose to ${totalVolume} mL of diluent.`}>
                    <div>
                        <ResultRow label={`After dilution in ${totalVolume} mL`} value={ok.finalConcentration.toFixed(2)} unit="mg/mL" />
                    </div>
                </CalcSection>
            )}

            {ok && (
                <CalcSection title="Working" description="The numbers you entered, plugged into the formula.">
                    <div>
                        {ok.mgPerMl !== null ? (
                            <>
                                <ResultRow label={`${ok.conc}% (w/v) = ${ok.conc} g/100 mL`} value={+ok.mgPerMl.toFixed(6)} unit="mg/mL" />
                                <ResultRow label={`Volume = ${ok.dose} ÷ ${+ok.mgPerMl.toFixed(6)}`} value={+ok.volumeMl.toFixed(6)} unit="mL" />
                            </>
                        ) : (
                            <ResultRow label={`Volume = ${ok.dose} ÷ ${ok.conc} ${concLabel}`} value={+ok.volumeMl.toFixed(6)} unit="mL" />
                        )}
                        {volumeUnit !== "mL" && (
                            <ResultRow
                                label={volumeUnit === "L" ? "Convert: mL ÷ 1000" : "Convert: mL × 1000"}
                                value={ok.finalVolume.toFixed(ok.finalVolume < 0.1 ? 3 : 2)}
                                unit={volumeLabel}
                            />
                        )}
                        {ok.finalConcentration !== null && ok.totalVol !== null && (
                            <ResultRow label={`Final = ${ok.dose} ÷ ${ok.totalVol} mL`} value={ok.finalConcentration.toFixed(2)} unit="mg/mL" />
                        )}
                    </div>
                    {safety && (
                        <LabNotice tone={safety.tone === "success" ? "info" : safety.tone === "danger" ? "danger" : "warning"} title="Volume check">
                            {safety.message}. Guide: 0.1 - 10 mL typical range · &lt; 0.1 mL use insulin syringe · &gt; 50 mL review dose.
                        </LabNotice>
                    )}
                </CalcSection>
            )}

            <CalcSection title="Administration guidelines">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <CalcList
                        title="Small volumes (< 1 mL)"
                        items={[
                            "Use insulin syringes for accuracy",
                            "Minimum measurable volume: 0.01 mL",
                            "Consider dead space in syringe",
                            "Ideal for subcutaneous injections",
                        ]}
                    />
                    <CalcList
                        title="Medium volumes (1-10 mL)"
                        items={[
                            "Use standard 3-10 mL syringes",
                            "Suitable for IM injections",
                            "Check muscle size for IM administration",
                            "Divide large volumes between sites if needed",
                        ]}
                    />
                    <CalcList
                        title="Large volumes (> 10 mL)"
                        items={[
                            "Typically for IV infusion",
                            "Use appropriate IV bags/syringes",
                            "Consider infusion rate and time",
                            "Check for compatibility with diluent",
                        ]}
                    />
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>Volume = Desired Dose ÷ Concentration</Formula>
                <Formula>% (w/v): concentration in mg/mL = (% ÷ 100) × 1000</Formula>
                <Formula>Final concentration = Desired Dose ÷ Total dilution volume</Formula>
                <p>
                    Example: 500 mg from a 250 mg/mL vial is 500 ÷ 250 = 2 mL. A 2% (w/v) solution holds
                    2 g in 100 mL, i.e. 20 mg/mL, so 50 mg needs 50 ÷ 20 = 2.5 mL.
                </p>
                <p>
                    Volumes under 0.1 are shown to 3 decimals, everything else to 2. The volume check uses
                    the figure in the unit you chose.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "My dose is in mcg but the vial is in mg/mL — what do I do?",
                        a: "Convert one of them first so both use the same amount unit (1 mg = 1000 mcg), or pick the matching concentration unit. The calculator divides the two numbers as entered and does not convert between mg, mcg, g and units.",
                    },
                    {
                        q: "How does % (w/v) work?",
                        a: "A w/v percentage is grams per 100 mL, so 1% is 10 mg/mL. The calculator converts the percentage to mg/mL and divides your dose (in mg) by it.",
                    },
                    {
                        q: "Why does the volume check change when I switch to μL?",
                        a: "The check compares the displayed number with its bands (below 0.1, above 10). 2 mL shown as 2000 μL is flagged as large, and 500 mL shown as 0.5 L is flagged as typical — judge the volume in mL.",
                    },
                    {
                        q: "What is the final concentration for?",
                        a: "When a dose is added to a bag or syringe of diluent, the final concentration (dose ÷ total volume) is what goes on the label and what infusion rates are calculated from.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
