"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Zap } from "lucide-react";
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
    type ResultTone,
} from "@/components/calculators";

type AdministrationRoute = "iv" | "im" | "oral" | "sc";
type DoseBasis = "weight" | "fixed";

const DEFAULTS = {
    target: "10",
    vd: "50",
    bioavailability: "100",
    route: "iv" as AdministrationRoute,
    weight: "70",
};

const SAMPLE_DRUGS = [
    { name: "Digoxin", targetC: "1.5", vd: "440", f: "100", route: "iv" as AdministrationRoute, weightBased: true, note: "Therapeutic range: 0.8-2.0 mcg/L" },
    { name: "Vancomycin", targetC: "20", vd: "0.7", f: "100", route: "iv" as AdministrationRoute, weightBased: true, note: "Based on actual body weight" },
    { name: "Phenytoin", targetC: "15", vd: "0.65", f: "90", route: "oral" as AdministrationRoute, weightBased: true, note: "Non-linear kinetics" },
    { name: "Amiodarone", targetC: "1", vd: "66", f: "50", route: "iv" as AdministrationRoute, weightBased: true, note: "Large Vd due to tissue binding" },
];

/** Safety wording from the original page, checked in the same order. */
function doseSafety(dose: number): { text: string; tone: ResultTone } {
    if (dose < 10) return { text: "Very small dose - verify calculations", tone: "warning" };
    if (dose > 1000) return { text: "Large dose - consider divided loading", tone: "warning" };
    if (dose > 5000) return { text: "Very large dose - verify Vd and target concentration", tone: "danger" };
    return { text: "Dose appears reasonable", tone: "success" };
}

function positiveError(value: string) {
    if (value.trim() === "") return undefined;
    const v = parseFloat(value);
    if (isNaN(v)) return "Enter a number.";
    if (v <= 0) return "Must be greater than 0.";
    return undefined;
}

export default function LoadingDoseCalculator() {
    const [targetConcentration, setTargetConcentration] = useState(DEFAULTS.target);
    const [volumeDistribution, setVolumeDistribution] = useState(DEFAULTS.vd);
    const [bioavailability, setBioavailability] = useState(DEFAULTS.bioavailability);
    const [administrationRoute, setAdministrationRoute] = useState<AdministrationRoute>(DEFAULTS.route);
    const [patientWeight, setPatientWeight] = useState(DEFAULTS.weight);
    const [doseBasis, setDoseBasis] = useState<DoseBasis>("weight");
    const weightBased = doseBasis === "weight";

    /*
     * Derived live. The old page stored the doses in state from a useEffect,
     * so clearing a field left the previous dose on screen. The arithmetic —
     * including the separate weight-based expression — is unchanged.
     */
    const result = useMemo(() => {
        const targetC = parseFloat(targetConcentration);
        const vd = parseFloat(volumeDistribution);
        const f = parseFloat(bioavailability) / 100;
        const weight = parseFloat(patientWeight);

        if (isNaN(targetC) || isNaN(vd) || vd <= 0 || targetC <= 0) return null;
        const adjustForF = administrationRoute !== "iv" && !isNaN(f);
        if (adjustForF && f <= 0) return null;

        // Basic loading dose, adjusted for bioavailability when not IV.
        let ld = targetC * vd;
        if (adjustForF) ld /= f;

        // Weight-based dose (original expression kept as-is).
        let weightBasedDose = ld;
        const weightValid = !isNaN(weight) && weight > 0;
        if (weightBased && weightValid) {
            const vdPerKg = vd / weight;
            weightBasedDose = targetC * vdPerKg * weight;
            if (adjustForF) weightBasedDose /= f;
        }

        if (!Number.isFinite(weightBasedDose)) return null;

        return {
            targetC,
            vd,
            f,
            adjustForF,
            loadingDose: ld,
            dose: weightBasedDose,
            perKg: weightBased && weightValid ? weightBasedDose / weight : null,
            ivEquivalent: targetC * vd,
            safety: doseSafety(weightBasedDose || ld),
        };
    }, [targetConcentration, volumeDistribution, bioavailability, administrationRoute, patientWeight, weightBased]);

    const loadSample = (drug: (typeof SAMPLE_DRUGS)[number]) => {
        setTargetConcentration(drug.targetC);
        setVolumeDistribution(drug.vd);
        setBioavailability(drug.f);
        setAdministrationRoute(drug.route);
        setDoseBasis(drug.weightBased ? "weight" : "fixed");
    };

    const reset = () => {
        setTargetConcentration(DEFAULTS.target);
        setVolumeDistribution(DEFAULTS.vd);
        setBioavailability(DEFAULTS.bioavailability);
        setAdministrationRoute(DEFAULTS.route);
        setPatientWeight(DEFAULTS.weight);
    };

    const routeLabel = administrationRoute.toUpperCase();

    return (
        <CalculatorShell
            title="Loading Dose Calculator"
            subtitle="Calculates the initial dose needed to reach a target plasma concentration straight away, from Vd and bioavailability."
            icon={Zap}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            A <strong>loading dose</strong> fills the body&apos;s volume of distribution to the
                            target concentration in one step, instead of waiting 4–5 half-lives for maintenance
                            doses to build up. It depends on <strong>Vd</strong> (volume of distribution) and
                            <strong> F</strong> (bioavailability), not on clearance.
                        </p>
                        <CalcList
                            title="Administration guidance"
                            items={[
                                "IV bolus: administer over 1–5 minutes",
                                "Divided loading: for large doses or risk of toxicity",
                                "Monitoring: check levels 30 min post-dose",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Clinical considerations"
                            items={[
                                "Adjust for renal/hepatic impairment",
                                "Consider protein binding changes",
                                "Monitor for adverse effects",
                                "Calculate the maintenance dose separately",
                                "Verify with therapeutic drug monitoring",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch
                label="Administration route"
                value={administrationRoute}
                onChange={setAdministrationRoute}
                options={[
                    { value: "iv", label: "IV Bolus", description: "F = 100%" },
                    { value: "im", label: "IM", description: "Intramuscular" },
                    { value: "oral", label: "Oral", description: "By mouth" },
                    { value: "sc", label: "SC", description: "Subcutaneous" },
                ]}
            />

            <ResultCard
                label={`${routeLabel} loading dose`}
                value={result ? result.dose.toFixed(1) : null}
                unit={result?.perKg != null ? `mg · ${result.perKg.toFixed(2)} mg/kg` : "mg"}
                interpretation={result?.safety.text}
                tone={result?.safety.tone ?? "neutral"}
                empty="Enter a target concentration and a volume of distribution above 0 (and a bioavailability above 0 for non-IV routes)."
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    <NumberField
                        label="Target concentration (Cₚ)"
                        value={targetConcentration}
                        onChange={setTargetConcentration}
                        unit="mg/L"
                        step="0.001"
                        placeholder="e.g. 10"
                        hint="Therapeutic level wanted. Typical: digoxin 0.8–2.0 mcg/L, vancomycin 15–20 mg/L, phenytoin 10–20 mg/L."
                        error={positiveError(targetConcentration)}
                    />
                    <NumberField
                        label="Volume of distribution (Vd)"
                        value={volumeDistribution}
                        onChange={setVolumeDistribution}
                        unit="L"
                        step="0.001"
                        placeholder="e.g. 50"
                        hint="Apparent volume of distribution, in total litres."
                        error={positiveError(volumeDistribution)}
                    />
                    {administrationRoute !== "iv" && (
                        <NumberField
                            label="Bioavailability (F)"
                            value={bioavailability}
                            onChange={setBioavailability}
                            unit="%"
                            step="0.1"
                            min={0}
                            max={100}
                            placeholder="e.g. 80"
                            hint="Typical: IM 75–100%, oral 0–100%, SC 70–95%. Leave blank for no adjustment."
                            error={positiveError(bioavailability)}
                        />
                    )}
                </FieldGrid>

                <div className="space-y-3">
                    <ModeSwitch
                        label="Dose basis"
                        value={doseBasis}
                        onChange={setDoseBasis}
                        options={[
                            { value: "weight", label: "Weight-based", description: "Also show mg/kg" },
                            { value: "fixed", label: "Fixed", description: "Total dose only" },
                        ]}
                    />
                    <FieldGrid>
                        <NumberField
                            label="Patient weight"
                            value={patientWeight}
                            onChange={setPatientWeight}
                            unit="kg"
                            step="0.1"
                            placeholder="e.g. 70"
                            disabled={!weightBased}
                            hint={weightBased ? "Used to express the dose per kilogram." : "Switch to weight-based to use it."}
                            error={weightBased ? positiveError(patientWeight) : undefined}
                        />
                    </FieldGrid>
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example drug</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {SAMPLE_DRUGS.map((drug) => (
                            <button
                                key={drug.name}
                                type="button"
                                onClick={() => loadSample(drug)}
                                className="min-h-[44px] rounded-xl border bg-background px-3.5 py-2.5 text-left transition-colors hover:border-primary/40 active:bg-accent"
                            >
                                <span className="block text-sm font-semibold text-foreground">{drug.name}</span>
                                <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                                    Cₚ {drug.targetC} · Vd {drug.vd} L · {drug.route.toUpperCase()}
                                </span>
                                <span className="mt-0.5 block text-xs text-primary">{drug.note}</span>
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
                        <ResultRow
                            label="LD = (Cₚ × Vd) ÷ F"
                            value={`${result.targetC} × ${result.vd} ÷ ${result.adjustForF ? result.f : 1}`}
                        />
                        <ResultRow label={`${routeLabel} loading dose`} value={result.dose.toFixed(1)} unit="mg" />
                        {result.perKg != null && <ResultRow label="Dose per kilogram" value={result.perKg.toFixed(2)} unit="mg/kg" />}
                        {administrationRoute !== "iv" && result.loadingDose !== 0 && (
                            <ResultRow
                                label="Equivalent IV dose (without F adjustment)"
                                value={result.ivEquivalent.toFixed(1)}
                                unit="mg"
                            />
                        )}
                        <ResultRow label="Initial concentration" value={targetConcentration} unit="mg/L" />
                        <ResultRow label="Time to therapeutic" value={administrationRoute === "iv" ? "Immediate (IV)" : "~30 min (non-IV)"} />
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>LD = (Cₚ × Vd) ÷ F</Formula>
                <p>
                    <strong>Cₚ</strong> = target plasma concentration (mg/L); <strong>Vd</strong> = volume of
                    distribution (L); <strong>F</strong> = bioavailability as a fraction (1 for IV). mg/L × L
                    gives mg — so if the target is in mcg/L, the dose comes out in mcg.
                </p>
                <p>
                    <strong>Divided loading</strong> — for drugs with a long half-life, to reduce toxicity
                    risk and allow response to be assessed (e.g. digoxin 50% initially, then 25% every
                    6–8 h).
                </p>
                <p>
                    <strong>Non-linear kinetics</strong> — phenytoin and theophylline follow
                    Michaelis–Menten kinetics: small dose increases cause large Cₚ changes, so titrate
                    carefully.
                </p>
                <p>
                    <strong>Special populations</strong> — elderly: reduced Vd and increased sensitivity;
                    obesity: use adjusted body weight; renal failure: reduced clearance; paediatrics:
                    different Vd per kg.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why doesn't clearance or half-life appear in the formula?",
                        a: "A loading dose only has to fill the volume of distribution to the target concentration. Clearance decides how fast the drug leaves afterwards, which is the maintenance dose's job.",
                    },
                    {
                        q: "My Vd is in L/kg — what do I enter?",
                        a: "Multiply it by the patient's weight first. This calculator treats Vd as total litres: vancomycin 0.7 L/kg in a 70 kg patient is 49 L.",
                    },
                    {
                        q: "Why is the oral dose bigger than the IV dose?",
                        a: "Only the fraction F of an oral dose reaches the circulation, so the dose is divided by F. With F = 50%, twice the IV dose is needed.",
                    },
                    {
                        q: "Does bioavailability matter for IV doses?",
                        a: "No — an IV dose goes straight into the circulation, so F is 1 and the bioavailability field is hidden.",
                    },
                    {
                        q: "Which units should the concentration be in?",
                        a: "mg/L with Vd in litres gives the dose in mg. Targets quoted in mcg/L (such as digoxin) give a dose in mcg; divide by 1000 for mg.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
