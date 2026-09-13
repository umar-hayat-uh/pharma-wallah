"use client";

import { useMemo, useState } from "react";
import { Activity, Clock, PieChart, RefreshCw, TrendingDown } from "lucide-react";
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
} from "@/components/calculators";

type HalfLifeMethod = "ke" | "clearance" | "fraction";
type TimeUnit = "hours" | "minutes" | "days";
type ConcentrationUnit = "mg/L" | "mcg/mL" | "ng/mL";

const DEFAULTS = {
    ke: "0.1",
    clearance: "5",
    volume: "50",
    c0: "100",
    ct: "50",
    time: "6",
};

const SAMPLE_DRUGS = [
    { name: "Aspirin", t12: "0.25", ke: "2.77", cl: "15", vd: "11" },
    { name: "Propranolol", t12: "4", ke: "0.173", cl: "60", vd: "280" },
    { name: "Digoxin", t12: "36", ke: "0.019", cl: "6.6", vd: "440" },
    { name: "Gentamicin", t12: "2", ke: "0.346", cl: "4.3", vd: "18" },
    { name: "Warfarin", t12: "40", ke: "0.017", cl: "0.2", vd: "10" },
];

/** Bands from the original page (they assume the half-life is in hours). */
function interpret(t12: number) {
    if (t12 < 1) return "Very short half-life - frequent dosing required";
    if (t12 < 6) return "Short half-life - multiple daily doses";
    if (t12 < 24) return "Intermediate half-life - once or twice daily dosing";
    if (t12 < 48) return "Long half-life - once daily dosing";
    return "Very long half-life - less frequent dosing possible";
}

function positiveError(value: string) {
    if (value.trim() === "") return undefined;
    const v = parseFloat(value);
    if (isNaN(v)) return "Enter a number.";
    if (v <= 0) return "Must be greater than 0.";
    return undefined;
}

export default function HalfLifeCalculator() {
    const [method, setMethod] = useState<HalfLifeMethod>("ke");
    const [eliminationConstant, setEliminationConstant] = useState(DEFAULTS.ke);
    const [clearance, setClearance] = useState(DEFAULTS.clearance);
    const [volume, setVolume] = useState(DEFAULTS.volume);
    const [initialConcentration, setInitialConcentration] = useState(DEFAULTS.c0);
    const [remainingConcentration, setRemainingConcentration] = useState(DEFAULTS.ct);
    const [timeElapsed, setTimeElapsed] = useState(DEFAULTS.time);
    const [timeUnits, setTimeUnits] = useState<TimeUnit>("hours");
    const [concentrationUnits, setConcentrationUnits] = useState<ConcentrationUnit>("mg/L");

    /*
     * Derived live. The old page kept t½ and kₑ in state from a useEffect, so an
     * invalid input showed "0.00" and kₑ could be left over from a previously
     * selected method. Formulas, the 0.693 constant and the unit conversion are
     * unchanged.
     */
    const result = useMemo(() => {
        let tHalf: number | null = null;
        let k: number | null = null;

        if (method === "ke") {
            const ke = parseFloat(eliminationConstant);
            if (!isNaN(ke) && ke > 0) {
                tHalf = 0.693 / ke;
                k = ke;
            }
        } else if (method === "clearance") {
            const cl = parseFloat(clearance);
            const vd = parseFloat(volume);
            if (!isNaN(cl) && !isNaN(vd) && cl > 0 && vd > 0) {
                k = cl / vd;
                tHalf = 0.693 / k;
            }
        } else {
            const c0 = parseFloat(initialConcentration);
            const ct = parseFloat(remainingConcentration);
            const t = parseFloat(timeElapsed);
            if (!isNaN(c0) && !isNaN(ct) && !isNaN(t) && c0 > 0 && ct > 0 && t > 0 && ct < c0) {
                k = (Math.log(c0) - Math.log(ct)) / t;
                tHalf = 0.693 / k;
            }
        }

        if (tHalf === null || k === null || !Number.isFinite(tHalf)) return null;

        const baseHalfLife = tHalf;
        if (timeUnits === "minutes") {
            tHalf *= 60;
        } else if (timeUnits === "days") {
            tHalf /= 24;
        }

        return { halfLife: tHalf, baseHalfLife, k };
    }, [method, eliminationConstant, clearance, volume, initialConcentration, remainingConcentration, timeElapsed, timeUnits]);

    const loadSample = (drug: (typeof SAMPLE_DRUGS)[number]) => {
        setMethod("ke");
        setEliminationConstant(drug.ke);
        setClearance(drug.cl);
        setVolume(drug.vd);

        // Approximate concentrations for the concentration method (original logic).
        const c0 = 100;
        const t = parseFloat(drug.t12);
        const ke = parseFloat(drug.ke);
        const ct = c0 * Math.exp(-ke * t);

        setInitialConcentration(c0.toString());
        setRemainingConcentration(ct.toFixed(2));
        setTimeElapsed(drug.t12);
    };

    const reset = () => {
        setEliminationConstant(DEFAULTS.ke);
        setClearance(DEFAULTS.clearance);
        setVolume(DEFAULTS.volume);
        setInitialConcentration(DEFAULTS.c0);
        setRemainingConcentration(DEFAULTS.ct);
        setTimeElapsed(DEFAULTS.time);
    };

    const ctError = (() => {
        const base = positiveError(remainingConcentration);
        if (base) return base;
        const c0 = parseFloat(initialConcentration);
        const ct = parseFloat(remainingConcentration);
        if (!isNaN(c0) && !isNaN(ct) && ct >= c0) return "Must be lower than C₀ — the drug is being eliminated.";
        return undefined;
    })();

    const kUnit = method === "fraction" ? `per ${timeUnits.replace(/s$/, "")}` : "h⁻¹";
    const unitShort = timeUnits;

    const emptyText =
        method === "ke"
            ? "Enter an elimination rate constant (kₑ) above 0."
            : method === "clearance"
              ? "Enter clearance and volume of distribution, both above 0."
              : "Enter C₀, a lower Cₜ and the time between them.";

    return (
        <CalculatorShell
            title="Half-Life Calculator"
            subtitle="Works out a drug's elimination half-life (t½) from kₑ, from clearance and volume of distribution, or from two measured concentrations."
            icon={Clock}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            The <strong>elimination half-life (t½)</strong> is the time it takes for the
                            plasma concentration of a drug to fall by half. For drugs that follow first-order
                            kinetics it is constant, whatever the concentration.
                        </p>
                        <CalcList
                            title="Quick reference"
                            items={[
                                "Steady state is reached after ~4–5 × t½",
                                "The loading dose is based on Vd, not t½",
                                "A dosing interval of ~1 × t½ is a common starting point",
                                "~3.3 × t½ removes 90% of a dose; ~6.6 × t½ removes 99%",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Assumptions"
                            items={[
                                "First-order (linear) elimination — not valid for phenytoin or ethanol at high doses",
                                "One-compartment behaviour: both samples taken after distribution is complete",
                                "The interpretation bands assume the half-life is in hours",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch
                label="Calculation method"
                value={method}
                onChange={setMethod}
                options={[
                    { value: "ke", label: "Using kₑ", description: "t½ = 0.693 ÷ kₑ", icon: TrendingDown },
                    { value: "clearance", label: "Using Cl & Vd", description: "t½ = 0.693 × Vd ÷ Cl", icon: Activity },
                    { value: "fraction", label: "From concentrations", description: "t½ = 0.693 × t ÷ ln(C₀/Cₜ)", icon: PieChart },
                ]}
            />

            <ResultCard
                label="Elimination half-life (t½)"
                value={result ? result.halfLife.toFixed(2) : null}
                unit={unitShort}
                interpretation={result ? interpret(result.halfLife) : undefined}
                tone="neutral"
                empty={emptyText}
            />

            <CalcSection title="Inputs">
                {method === "ke" && (
                    <FieldGrid>
                        <NumberField
                            label="Elimination rate constant (kₑ)"
                            value={eliminationConstant}
                            onChange={setEliminationConstant}
                            unit="h⁻¹"
                            step="0.001"
                            placeholder="e.g. 0.1"
                            hint="The fraction of drug eliminated per hour, e.g. 0.1 h⁻¹."
                            error={positiveError(eliminationConstant)}
                        />
                    </FieldGrid>
                )}

                {method === "clearance" && (
                    <FieldGrid>
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
                            label="Volume of distribution (Vd)"
                            value={volume}
                            onChange={setVolume}
                            unit="L"
                            step="0.001"
                            placeholder="e.g. 50"
                            hint="Apparent volume the drug distributes into (total litres, not L/kg)."
                            error={positiveError(volume)}
                        />
                    </FieldGrid>
                )}

                {method === "fraction" && (
                    <FieldGrid>
                        <NumberField
                            label="Initial concentration (C₀)"
                            value={initialConcentration}
                            onChange={setInitialConcentration}
                            units={[
                                { value: "mg/L" },
                                { value: "mcg/mL", label: "μg/mL" },
                                { value: "ng/mL" },
                            ]}
                            unit={concentrationUnits}
                            onUnitChange={(next) => setConcentrationUnits(next as ConcentrationUnit)}
                            step="0.001"
                            placeholder="e.g. 100"
                            hint="The first measured level."
                            error={positiveError(initialConcentration)}
                        />
                        <NumberField
                            label="Later concentration (Cₜ)"
                            value={remainingConcentration}
                            onChange={setRemainingConcentration}
                            units={[
                                { value: "mg/L" },
                                { value: "mcg/mL", label: "μg/mL" },
                                { value: "ng/mL" },
                            ]}
                            unit={concentrationUnits}
                            onUnitChange={(next) => setConcentrationUnits(next as ConcentrationUnit)}
                            step="0.001"
                            placeholder="e.g. 50"
                            hint="Same unit as C₀ — only the ratio matters."
                            error={ctError}
                        />
                        <NumberField
                            label="Time between the two samples (t)"
                            value={timeElapsed}
                            onChange={setTimeElapsed}
                            unit={timeUnits}
                            step="0.001"
                            placeholder="e.g. 6"
                            hint="Entered in the time unit chosen below."
                            error={positiveError(timeElapsed)}
                        />
                    </FieldGrid>
                )}

                <FieldGrid>
                    <SelectField
                        label="Time unit"
                        value={timeUnits}
                        onChange={(next) => setTimeUnits(next as TimeUnit)}
                        options={[
                            { value: "hours", label: "Hours" },
                            { value: "minutes", label: "Minutes" },
                            { value: "days", label: "Days" },
                        ]}
                        hint="The unit the half-life is reported in."
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example drug</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_DRUGS.map((drug) => (
                            <button
                                key={drug.name}
                                type="button"
                                onClick={() => loadSample(drug)}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent"
                            >
                                {drug.name} <span className="text-muted-foreground">· t½ {drug.t12} h</span>
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
                        <ResultRow label="Elimination rate constant (kₑ)" value={result.k.toFixed(4)} unit={kUnit} />
                        <ResultRow
                            label={method === "fraction" ? `t½ = 0.693 ÷ kₑ (${timeUnits})` : "t½ = 0.693 ÷ kₑ (hours)"}
                            value={result.baseHalfLife.toFixed(2)}
                        />
                        <ResultRow label="Time to 90% eliminated" value={(result.halfLife * 3.32).toFixed(1)} unit={timeUnits} />
                        <ResultRow label="Time to 99% eliminated" value={(result.halfLife * 6.64).toFixed(1)} unit={timeUnits} />
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Elimination pattern" description="Drug remaining after each half-life.">
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <div key={num} className="flex items-center gap-3">
                            <div className="w-24 shrink-0 text-sm text-muted-foreground">
                                {num} × t½
                                {result && (
                                    <span className="block font-mono text-[11px]">
                                        {(result.halfLife * num).toFixed(1)} {timeUnits}
                                    </span>
                                )}
                            </div>
                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${100 * Math.pow(0.5, num)}%` }}
                                />
                            </div>
                            <div className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                                {Math.round(100 * Math.pow(0.5, num))}%
                            </div>
                        </div>
                    ))}
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>t½ = 0.693 ÷ kₑ</Formula>
                <Formula>kₑ = Cl ÷ Vd → t½ = 0.693 × Vd ÷ Cl</Formula>
                <Formula>kₑ = [ln(C₀) − ln(Cₜ)] ÷ t → t½ = 0.693 × t ÷ ln(C₀/Cₜ)</Formula>
                <p>
                    <strong>kₑ (elimination rate constant)</strong> is the fraction of drug removed per unit
                    time, in time⁻¹ (h⁻¹). <strong>Cl (clearance)</strong> is the volume of plasma cleared per
                    unit time (L/h), independent of concentration for first-order kinetics.{" "}
                    <strong>Vd (volume of distribution)</strong> is an apparent, theoretical volume
                    (Vd = Dose ÷ C₀ = Cl ÷ kₑ), not a physiological one.
                </p>
                <p>
                    0.693 is ln 2. Because elimination is exponential, the same fraction of drug is removed
                    in every half-life — 50%, then 25%, 12.5%, and so on.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why does a bigger Vd give a longer half-life?",
                        a: "Drug sitting in tissues is not in the plasma passing through the liver and kidneys. With the same clearance, a larger volume means a smaller fraction of the body's drug is cleared each hour, so t½ = 0.693 × Vd ÷ Cl gets longer.",
                    },
                    {
                        q: "Does the concentration unit matter in the two-sample method?",
                        a: "No, as long as C₀ and Cₜ are in the same unit. The formula uses their ratio, so the unit cancels out.",
                    },
                    {
                        q: "When should I take the two samples?",
                        a: "Both after distribution is complete (in the elimination phase) and ideally at least one half-life apart. Samples too close together magnify assay error.",
                    },
                    {
                        q: "How many half-lives until a drug is gone?",
                        a: "About 3.3 half-lives removes 90% and about 6.6 removes 99%. For practical purposes a drug is considered eliminated after 4–5 half-lives (≈94–97%).",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
