"use client";

import { useMemo, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
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
} from "@/components/calculators";

type DosingInterval = "q4h" | "q6h" | "q8h" | "q12h" | "q24h" | "q48h" | "custom";
type HalfLifeSource = "estimate" | "known";

const INTERVALS: DosingInterval[] = ["q4h", "q6h", "q8h", "q12h", "q24h", "q48h", "custom"];
const INTERVAL_HOURS: Record<Exclude<DosingInterval, "custom">, number> = {
    q4h: 4,
    q6h: 6,
    q8h: 8,
    q12h: 12,
    q24h: 24,
    q48h: 48,
};

/** Typical Vd (L) the original page assumes when no half-life is entered. */
const TYPICAL_VD = 50;
/** Half-lives to reach ~95% of steady state. */
const HALF_LIVES_TO_SS = 4.32;

const DEFAULTS = {
    target: "10",
    clearance: "5",
    bioavailability: "100",
    interval: "q12h" as DosingInterval,
    custom: "12",
    halfLife: "6",
};

const SAMPLE_DRUGS = [
    { name: "Vancomycin", targetC: "15", cl: "4.3", f: "100", interval: "q12h" as DosingInterval, note: "Trough: 10-15 mg/L, Peak: 25-40 mg/L" },
    { name: "Digoxin", targetC: "1.2", cl: "0.048", f: "70", interval: "q24h" as DosingInterval, note: "Therapeutic: 0.8-2.0 mcg/L" },
    { name: "Phenytoin", targetC: "15", cl: "0.03", f: "90", interval: "q24h" as DosingInterval, note: "Non-linear kinetics" },
    { name: "Gentamicin", targetC: "8", cl: "4.3", f: "100", interval: "q8h" as DosingInterval, note: "Peak: 5-10 mg/L, Trough: <2 mg/L" },
];

/** Frequency wording from the original page. */
function dosingFrequency(interval: number) {
    if (interval <= 6) return "Multiple daily doses";
    if (interval <= 12) return "Twice daily";
    if (interval <= 24) return "Once daily";
    return "Less than once daily";
}

function positiveError(value: string) {
    if (value.trim() === "") return undefined;
    const v = parseFloat(value);
    if (isNaN(v)) return "Enter a number.";
    if (v <= 0) return "Must be greater than 0.";
    return undefined;
}

export default function MaintenanceDoseCalculator() {
    const [targetConcentration, setTargetConcentration] = useState(DEFAULTS.target);
    const [clearance, setClearance] = useState(DEFAULTS.clearance);
    const [bioavailability, setBioavailability] = useState(DEFAULTS.bioavailability);
    const [dosingInterval, setDosingInterval] = useState<DosingInterval>(DEFAULTS.interval);
    const [customInterval, setCustomInterval] = useState(DEFAULTS.custom);
    const [halfLifeSource, setHalfLifeSource] = useState<HalfLifeSource>("estimate");
    const [halfLife, setHalfLife] = useState(DEFAULTS.halfLife);
    const useHalfLife = halfLifeSource === "known";

    // A blank or zero custom interval falls back to 12 h, as before.
    const intervalHours =
        dosingInterval === "custom" ? parseFloat(customInterval) || 12 : INTERVAL_HOURS[dosingInterval];

    /*
     * Derived live. The old page kept every figure in state from a useEffect,
     * so the accumulation ratio stayed on screen after the half-life was
     * switched off, and an invalid input left stale numbers. The formulas and
     * constants are unchanged.
     */
    const result = useMemo(() => {
        const targetC = parseFloat(targetConcentration);
        const cl = parseFloat(clearance);
        const f = parseFloat(bioavailability) / 100;

        if (isNaN(targetC) || isNaN(cl) || cl <= 0 || targetC <= 0 || intervalHours <= 0) return null;
        // A blank F means "no adjustment" (as before); zero or negative F is meaningless.
        if (!isNaN(f) && f <= 0) return null;

        let md = targetC * cl * intervalHours;
        if (!isNaN(f)) md /= f;

        let steadyStateTime: number | null = null;
        let halfLifeUsed: number | null = null;
        let accumulationRatio: number | null = null;
        let peakTrough: number | null = null;

        if (useHalfLife) {
            const t12 = parseFloat(halfLife);
            if (!isNaN(t12) && t12 > 0) {
                halfLifeUsed = t12;
                steadyStateTime = t12 * HALF_LIVES_TO_SS;
                const ke = 0.693 / t12;
                accumulationRatio = 1 / (1 - Math.exp(-ke * intervalHours));
                peakTrough = Math.exp((0.693 / t12) * intervalHours);
            }
        } else {
            // Estimate half-life from clearance and a typical Vd.
            const ke = cl / TYPICAL_VD;
            const t12 = 0.693 / ke;
            halfLifeUsed = t12;
            steadyStateTime = t12 * HALF_LIVES_TO_SS;
        }

        return {
            targetC,
            cl,
            f,
            fApplied: !isNaN(f),
            md,
            daily: md * (24 / intervalHours),
            steadyStateTime,
            halfLifeUsed,
            accumulationRatio,
            peakTrough,
        };
    }, [targetConcentration, clearance, bioavailability, intervalHours, useHalfLife, halfLife]);

    const loadSample = (drug: (typeof SAMPLE_DRUGS)[number]) => {
        setTargetConcentration(drug.targetC);
        setClearance(drug.cl);
        setBioavailability(drug.f);
        setDosingInterval(drug.interval);
    };

    const reset = () => {
        setTargetConcentration(DEFAULTS.target);
        setClearance(DEFAULTS.clearance);
        setBioavailability(DEFAULTS.bioavailability);
        setDosingInterval(DEFAULTS.interval);
        setCustomInterval(DEFAULTS.custom);
        setHalfLifeSource("estimate");
        setHalfLife(DEFAULTS.halfLife);
    };

    const customError = (() => {
        if (customInterval.trim() === "") return undefined;
        const v = parseFloat(customInterval);
        if (isNaN(v)) return "Enter a number.";
        if (v < 0) return "Must be greater than 0.";
        return undefined;
    })();

    return (
        <CalculatorShell
            title="Maintenance Dose Calculator"
            subtitle="Calculates the dose per interval that keeps a drug at its target steady-state concentration, from clearance, bioavailability and the dosing interval."
            icon={Activity}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            At <strong>steady state</strong> the rate of drug going in equals the rate going out.
                            A <strong>maintenance dose</strong> replaces exactly what was eliminated during one
                            dosing interval — so it is set by <strong>clearance (Cl)</strong>, not by the volume
                            of distribution.
                        </p>
                        <CalcList
                            title="Dosing strategy"
                            items={[
                                "Timing: consistent intervals recommended",
                                "Adjustments: based on therapeutic drug monitoring",
                                "Steady state is reached after 4–5 half-lives, whatever the dose",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Important considerations"
                            items={[
                                "Adjust for renal/hepatic impairment",
                                "Consider drug interactions",
                                "Monitor for efficacy and toxicity",
                                "A loading dose may be needed initially",
                                "Individualise based on patient factors",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Maintenance dose per interval"
                value={result ? result.md.toFixed(1) : null}
                unit={`mg every ${intervalHours} h`}
                interpretation={
                    result ? `${result.daily.toFixed(1)} mg/day total · ${dosingFrequency(intervalHours)}` : undefined
                }
                tone="neutral"
                empty="Enter a target concentration and a clearance above 0."
            />

            <CalcSection title="Inputs">
                <FieldGrid>
                    <NumberField
                        label="Target steady-state concentration (Cₛₛ)"
                        value={targetConcentration}
                        onChange={setTargetConcentration}
                        unit="mg/L"
                        step="0.001"
                        placeholder="e.g. 10"
                        hint="Average level at steady state. Typical: digoxin 0.8–2.0 mcg/L, vancomycin 10–20 mg/L (trough), phenytoin 10–20 mg/L."
                        error={positiveError(targetConcentration)}
                    />
                    <NumberField
                        label="Clearance (Cl)"
                        value={clearance}
                        onChange={setClearance}
                        unit="L/h"
                        step="0.001"
                        placeholder="e.g. 5"
                        hint="Volume of plasma cleared of drug per hour."
                        error={positiveError(clearance)}
                    />
                    <NumberField
                        label="Bioavailability (F)"
                        value={bioavailability}
                        onChange={setBioavailability}
                        unit="%"
                        step="0.1"
                        min={0}
                        max={100}
                        placeholder="e.g. 100"
                        hint="100% for IV. Leave blank for no adjustment."
                        error={positiveError(bioavailability)}
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-[13px] font-medium text-foreground/90">Dosing interval (τ)</p>
                    <div role="radiogroup" aria-label="Dosing interval" className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                        {INTERVALS.map((interval) => {
                            const selected = dosingInterval === interval;
                            return (
                                <button
                                    key={interval}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => setDosingInterval(interval)}
                                    className={`min-h-[44px] rounded-xl border text-sm font-medium transition-colors ${
                                        selected
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "bg-background text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {interval === "custom" ? "Custom" : interval}
                                </button>
                            );
                        })}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                        q12h = every 12 hours. Frequency: {dosingFrequency(intervalHours)}.
                    </p>
                </div>

                {dosingInterval === "custom" && (
                    <FieldGrid>
                        <NumberField
                            label="Custom interval"
                            value={customInterval}
                            onChange={setCustomInterval}
                            unit="h"
                            step="0.1"
                            placeholder="e.g. 12"
                            hint="Blank or 0 uses 12 hours."
                            error={customError}
                        />
                    </FieldGrid>
                )}

                <div className="space-y-3">
                    <ModeSwitch
                        label="Half-life for steady-state estimates"
                        value={halfLifeSource}
                        onChange={setHalfLifeSource}
                        options={[
                            { value: "estimate", label: "Estimate it", description: `From Cl, assuming Vd ${TYPICAL_VD} L` },
                            { value: "known", label: "Enter half-life", description: "Adds accumulation and peak/trough" },
                        ]}
                    />
                    {useHalfLife && (
                        <FieldGrid>
                            <NumberField
                                label="Half-life (t½)"
                                value={halfLife}
                                onChange={setHalfLife}
                                unit="h"
                                step="0.001"
                                placeholder="e.g. 6"
                                hint="Elimination half-life of the drug in this patient."
                                error={positiveError(halfLife)}
                            />
                        </FieldGrid>
                    )}
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
                                    Cₛₛ {drug.targetC} · Cl {drug.cl} L/h · {drug.interval}
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
                            label="MD = (Cₛₛ × Cl × τ) ÷ F"
                            value={`${result.targetC} × ${result.cl} × ${intervalHours} ÷ ${result.fApplied ? result.f : 1}`}
                        />
                        <ResultRow label="Dose per interval" value={result.md.toFixed(1)} unit="mg" />
                        <ResultRow label="Total daily dose" value={result.daily.toFixed(1)} unit="mg/day" />
                        <ResultRow label="Frequency" value={dosingFrequency(intervalHours)} />
                    </div>
                </CalcSection>
            )}

            {result && result.steadyStateTime !== null && (
                <CalcSection
                    title="Steady state"
                    description={
                        useHalfLife
                            ? "From the half-life you entered."
                            : `Half-life estimated as 0.693 ÷ (Cl ÷ ${TYPICAL_VD} L) — a typical Vd, not this patient's.`
                    }
                >
                    <div>
                        {result.halfLifeUsed !== null && !useHalfLife && (
                            <ResultRow label="Estimated half-life" value={result.halfLifeUsed.toFixed(1)} unit="h" />
                        )}
                        <ResultRow
                            label="Time to steady state (4.32 × t½)"
                            value={result.steadyStateTime.toFixed(1)}
                            unit={`h (~${Math.ceil(result.steadyStateTime / 24)} days)`}
                        />
                        {result.accumulationRatio !== null && (
                            <ResultRow label="Accumulation ratio (R)" value={result.accumulationRatio.toFixed(2)} />
                        )}
                        {result.peakTrough !== null && (
                            <ResultRow label="Peak/trough ratio" value={result.peakTrough.toFixed(2)} />
                        )}
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>MD = (Cₛₛ × Cl × τ) ÷ F</Formula>
                <Formula>t½ (estimate) = 0.693 ÷ (Cl ÷ 50 L); time to steady state = 4.32 × t½</Formula>
                <Formula>R = 1 ÷ (1 − e^(−k × τ)); peak/trough = e^(k × τ); k = 0.693 ÷ t½</Formula>
                <p>
                    <strong>Cₛₛ</strong> = target steady-state concentration (mg/L); <strong>Cl</strong> =
                    clearance (L/h); <strong>τ</strong> = dosing interval (h); <strong>F</strong> =
                    bioavailability as a fraction. mg/L × L/h × h gives mg.
                </p>
                <p>
                    <strong>Steady state</strong> — rate in equals rate out; it is reached after 4–5
                    half-lives, independent of any loading dose, and the maintenance dose replaces the drug
                    eliminated each interval.
                </p>
                <p>
                    <strong>Accumulation</strong> depends on the dosing interval relative to the half-life:
                    a shorter interval means more accumulation, which matters for predicting toxicity.
                </p>
                <p>
                    <strong>Clinical application</strong> — start with the estimated dose, measure
                    concentrations at steady state, adjust on therapeutic response, and allow for individual
                    variability.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why is the maintenance dose based on clearance, not Vd?",
                        a: "At steady state the dose given each interval must equal the amount eliminated in that interval, and elimination is set by clearance. Vd decides the loading dose and how long steady state takes, not the maintenance dose.",
                    },
                    {
                        q: "Does changing the interval change the daily dose?",
                        a: "No. Doubling τ doubles the dose per interval, so the total daily dose stays the same. What changes is the swing between peak and trough.",
                    },
                    {
                        q: "Why is the time to steady state only an estimate without a half-life?",
                        a: "Without a half-life the calculator assumes a typical Vd of 50 L to turn clearance into a half-life. For drugs with a very large or small Vd (digoxin, aminoglycosides) enter the real half-life instead.",
                    },
                    {
                        q: "Which units should the target be in?",
                        a: "mg/L with clearance in L/h gives a dose in mg. A target in mcg/L (such as digoxin) gives the dose in mcg.",
                    },
                    {
                        q: "Does a loading dose change when steady state is reached?",
                        a: "It gets the concentration to target immediately, but the time for the maintenance regimen itself to settle at steady state is still 4–5 half-lives.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
