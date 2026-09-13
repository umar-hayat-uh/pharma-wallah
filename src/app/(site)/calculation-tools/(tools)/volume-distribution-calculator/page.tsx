"use client";

import { useMemo, useState } from "react";
import { Brain, Filter, Heart, RefreshCw, Scale } from "lucide-react";
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
} from "@/components/calculators";

/** Joins class names, skipping falsy ones (kept local: no @/lib imports in tool pages). */
const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

/** Used when the weight field is left blank — unchanged from the original tool. */
const DEFAULT_WEIGHT_KG = 70;

/*
 * Interpretation bands per the MSD Manual (unchanged). Upper bounds are
 * exclusive, exactly as the original if/else chain: < 0.1, < 0.3, < 0.7, < 2, < 10.
 */
const BANDS = [
    {
        upTo: 0.1,
        range: "< 0.1 L/kg",
        distributionType: "Plasma Volume",
        interpretation: "Confined to plasma compartment",
        clinicalSignificance: "Highly protein bound, minimal tissue distribution.",
    },
    {
        upTo: 0.3,
        range: "0.1 – 0.3 L/kg",
        distributionType: "Extracellular Fluid",
        interpretation: "Distributed in extracellular fluid",
        clinicalSignificance: "Moderate tissue distribution, limited intracellular penetration.",
    },
    {
        upTo: 0.7,
        range: "0.3 – 0.7 L/kg",
        distributionType: "Total Body Water",
        interpretation: "Distributed in total body water",
        clinicalSignificance: "Good distribution throughout body water compartments.",
    },
    {
        upTo: 2,
        range: "0.7 – 2 L/kg",
        distributionType: "Tissue Binding",
        interpretation: "Moderate tissue binding",
        clinicalSignificance: "Significant tissue binding, longer half-life expected.",
    },
    {
        upTo: 10,
        range: "2 – 10 L/kg",
        distributionType: "Extensive Distribution",
        interpretation: "Extensive tissue binding",
        clinicalSignificance: "High tissue affinity, very long half-life, accumulates in tissues.",
    },
    {
        upTo: Infinity,
        range: "≥ 10 L/kg",
        distributionType: "Extreme Distribution",
        interpretation: "Extreme tissue binding and accumulation",
        clinicalSignificance: "Very high tissue affinity, potential for long-term accumulation.",
    },
];

/* The presets fill dose and C₀ only; the weight field is left as it is. */
const SAMPLE_DRUGS = [
    { name: "Warfarin", vd: 0.14, dose: "5", conc: "1.5" },
    { name: "Gentamicin", vd: 0.25, dose: "5", conc: "8" },
    { name: "Theophylline", vd: 0.5, dose: "400", conc: "10" },
    { name: "Digoxin", vd: 7, dose: "0.5", conc: "1" },
    { name: "Chloroquine", vd: 200, dose: "500", conc: "0.05" },
];

function positiveError(raw: string): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value <= 0) return "Must be greater than zero.";
    return undefined;
}

export default function VolumeDistributionCalculator() {
    const [dose, setDose] = useState("");
    const [concentration, setConcentration] = useState("");
    const [patientWeight, setPatientWeight] = useState("");

    const doseError = positiveError(dose);
    const concError = positiveError(concentration);
    const weightError = positiveError(patientWeight);

    /*
     * Live instead of on a Calculate button. The old page also left the last
     * result on screen when a new, invalid input was rejected by an alert(), so
     * the card could show numbers for inputs that were no longer there.
     */
    const result = useMemo(() => {
        const D = parseFloat(dose);
        const Cp = parseFloat(concentration);
        const W = patientWeight ? parseFloat(patientWeight) : DEFAULT_WEIGHT_KG;

        if (isNaN(D) || isNaN(Cp) || D <= 0 || Cp <= 0) return null;
        // A zero or negative weight would print Infinity / a negative L/kg.
        if (isNaN(W) || W <= 0) return null;

        // Vd = Dose / C0
        const vd = D / Cp;
        const vdPerKg = vd / W;
        const bandIndex = BANDS.findIndex((band) => vdPerKg < band.upTo);

        return { D, Cp, W, vd, vdPerKg, bandIndex, band: BANDS[bandIndex] };
    }, [dose, concentration, patientWeight]);

    const reset = () => {
        setDose("");
        setConcentration("");
        setPatientWeight("");
    };

    const compartments = result
        ? [
              { label: "Plasma", icon: Heart, active: result.vdPerKg < 0.3, size: "h-12 w-12", color: "bg-red-500" },
              {
                  label: "Tissues",
                  icon: Filter,
                  active: result.vdPerKg >= 0.3 && result.vdPerKg < 2,
                  size: "h-14 w-14",
                  color: "bg-blue-600",
              },
              { label: "Deep tissues", icon: Brain, active: result.vdPerKg >= 2, size: "h-16 w-16", color: "bg-emerald-600" },
          ]
        : [];

    return (
        <CalculatorShell
            title="Volume of Distribution Calculator"
            subtitle="Works out the apparent volume of distribution (Vd) from an IV dose and the plasma concentration it produced."
            icon={Scale}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            <strong>Vd — apparent volume of distribution</strong> — is the volume the dose
                            would have to be dissolved in to give the plasma concentration you measured. It
                            is not a real anatomical space: a drug that leaves the blood for fat or muscle
                            can have a Vd far larger than the whole body.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Estimating how widely a drug spreads into tissues",
                                "Working out a loading dose (dose = Vd × target concentration)",
                                "Explaining why dialysis removes some drugs and not others",
                                "Comparing drugs across the plasma → tissue spectrum",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch for"
                            items={[
                                "C₀ must be the concentration at time zero after an IV bolus",
                                "Blank weight is taken as 70 kg for the L/kg figure",
                                "Oedema, obesity and ascites change Vd in real patients",
                                "Dose and concentration must share a mass unit (mg with mg/L)",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Volume of distribution"
                value={result ? result.vd.toFixed(2) : null}
                unit="L"
                interpretation={
                    result
                        ? `${result.vdPerKg.toFixed(3)} L/kg — ${result.band.distributionType}: ${result.band.interpretation}`
                        : undefined
                }
                empty="Enter the IV dose and the plasma concentration at time zero (C₀)."
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    <NumberField
                        label="Dose administered (mg)"
                        value={dose}
                        onChange={setDose}
                        unit="mg"
                        step="0.001"
                        min={0}
                        placeholder="e.g. 500"
                        error={doseError}
                        hint="The total dose given as an intravenous bolus."
                    />
                    <NumberField
                        label="Plasma concentration C₀ (mg/L)"
                        value={concentration}
                        onChange={setConcentration}
                        unit="mg/L"
                        step="0.001"
                        min={0}
                        placeholder="e.g. 10"
                        error={concError}
                        hint="Concentration at time zero after the IV bolus (back-extrapolated)."
                    />
                    <NumberField
                        label="Body weight (kg) — optional"
                        value={patientWeight}
                        onChange={setPatientWeight}
                        unit="kg"
                        step="0.1"
                        min={0}
                        placeholder="70"
                        error={weightError}
                        hint="Used only for Vd per kg. Left blank, 70 kg is assumed."
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example drug</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_DRUGS.map((drug) => (
                            <button
                                key={drug.name}
                                type="button"
                                onClick={() => {
                                    setDose(drug.dose);
                                    setConcentration(drug.conc);
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {drug.name}
                                <span className="ml-1.5 font-normal text-muted-foreground">Vd {drug.vd} L/kg</span>
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
                        <ResultRow label="Dose (D)" value={dose} unit="mg" />
                        <ResultRow label="C₀" value={concentration} unit="mg/L" />
                        <ResultRow
                            label={patientWeight ? "Body weight" : "Body weight (default)"}
                            value={patientWeight || String(DEFAULT_WEIGHT_KG)}
                            unit="kg"
                        />
                        <ResultRow
                            label={`Vd = ${dose} ÷ ${concentration}`}
                            value={result.vd.toFixed(2)}
                            unit="L"
                        />
                        <ResultRow
                            label={`Vd per kg = ${result.vd.toFixed(2)} ÷ ${patientWeight || DEFAULT_WEIGHT_KG}`}
                            value={result.vdPerKg.toFixed(3)}
                            unit="L/kg"
                        />
                    </div>
                    <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm leading-relaxed text-amber-900">
                        <span className="font-semibold">Clinical significance: </span>
                        {result.band.clinicalSignificance}
                    </p>
                </CalcSection>
            )}

            {result && (
                <CalcSection
                    title="Distribution pattern"
                    description="Where the drug mainly resides, judged from Vd per kg."
                >
                    <div className="flex items-end justify-center gap-6 sm:gap-10">
                        {compartments.map((c) => (
                            <div key={c.label} className="flex flex-col items-center gap-1.5 text-center">
                                <c.icon
                                    className={cn("h-6 w-6", c.active ? "text-foreground" : "text-muted-foreground/50")}
                                />
                                <div
                                    className={cn("rounded-full", c.size, c.active ? c.color : "bg-muted")}
                                    aria-hidden="true"
                                />
                                <span
                                    className={cn(
                                        "text-xs",
                                        c.active ? "font-semibold text-foreground" : "text-muted-foreground",
                                    )}
                                >
                                    {c.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Interpreting Vd" description="Bands from the MSD Manual, in litres per kilogram.">
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
                                <span className={cn("text-right text-sm", active ? "font-semibold text-primary" : "text-foreground")}>
                                    {band.distributionType}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>Vd = Dose / C₀</Formula>
                <Formula>Vd (L/kg) = Vd / body weight</Formula>
                <p>
                    Dose is the IV bolus in mg; C₀ is the plasma concentration at time zero in mg/L, usually
                    found by back-extrapolating the log-concentration line to t = 0. Dividing the amount by
                    the concentration gives litres.
                </p>
                <p>
                    Expressing Vd per kg lets you compare it with real body spaces: plasma is about 0.04 L/kg,
                    extracellular fluid about 0.2 L/kg and total body water about 0.6 L/kg. Anything much
                    larger means the drug is held in tissues. Interpretation per the MSD Manual.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why can Vd be larger than the body?",
                        a: "Because it is an apparent volume. If a drug binds strongly in tissue, very little stays in plasma, so the measured concentration is low and Dose ÷ C₀ becomes huge. Chloroquine and digoxin are classic examples.",
                    },
                    {
                        q: "What units should I use?",
                        a: "Dose in mg and concentration in mg/L, giving Vd in litres. If your level is reported in µg/L or ng/mL, convert it to mg/L first (1 ng/mL = 0.001 mg/L), otherwise the answer is out by a factor of a thousand.",
                    },
                    {
                        q: "What is C₀ and how do I get it?",
                        a: "The plasma concentration at the instant of the IV bolus, before any elimination. You cannot sample at exactly t = 0, so plot log concentration against time and extrapolate the straight elimination line back to the y-axis.",
                    },
                    {
                        q: "How is Vd used clinically?",
                        a: "Mainly for loading doses: loading dose = Vd × target concentration. A large Vd also warns that a drug will be slow to leave the body and poorly removed by dialysis.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
