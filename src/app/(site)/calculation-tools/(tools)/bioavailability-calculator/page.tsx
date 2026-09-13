"use client";

import { useMemo, useState } from "react";
import { Activity, ArrowRightLeft, BarChart3, Pill, RefreshCw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
    type ResultTone,
} from "@/components/calculators";

type RouteType = "oral" | "iv" | "im" | "sc" | "transdermal";
type Method = "auc" | "dose";

const METHODS: ModeOption<Method>[] = [
    { value: "auc", label: "From AUC data", description: "F = (AUCₜ/Dₜ) / (AUCᵣ/Dᵣ)", icon: BarChart3 },
    { value: "dose", label: "Estimate from dose", description: "Uses a typical F for the route", icon: Pill },
];

const ROUTES: { value: RouteType; label: string }[] = [
    { value: "oral", label: "Oral" },
    { value: "iv", label: "Intravenous (IV)" },
    { value: "im", label: "Intramuscular (IM)" },
    { value: "sc", label: "Subcutaneous (SC)" },
    { value: "transdermal", label: "Transdermal" },
];

/** Typical bioavailability by route, % (unchanged). */
const TYPICAL_F: Record<RouteType, number> = {
    oral: 80,
    iv: 100,
    im: 95,
    sc: 90,
    transdermal: 85,
};

/** Chart bar name for each route. */
const ROUTE_BAR: Record<RouteType, string> = {
    oral: "Oral",
    iv: "IV",
    im: "IM",
    sc: "SC",
    transdermal: "Transdermal",
};

const SAMPLE_DRUGS: { name: string; route: RouteType; f: number; dose: string; t12: string }[] = [
    { name: "Aspirin", route: "oral", f: 80, dose: "325", t12: "0.25" },
    { name: "Propranolol", route: "oral", f: 26, dose: "40", t12: "4" },
    { name: "Digoxin", route: "iv", f: 100, dose: "0.25", t12: "36" },
    { name: "Insulin", route: "sc", f: 95, dose: "10", t12: "0.17" },
    { name: "Nitroglycerin", route: "transdermal", f: 75, dose: "0.4", t12: "0.04" },
];

const DEFAULTS = { doseA: "100", aucA: "50", doseR: "100", aucR: "100" };

/* Interpretation bands (unchanged). */
function getInterpretation(f: number): { text: string; tone: ResultTone } {
    if (f >= 80) return { text: "Excellent bioavailability – minimal first‑pass effect", tone: "success" };
    if (f >= 50) return { text: "Good bioavailability – suitable for oral administration", tone: "success" };
    if (f >= 30) return { text: "Moderate bioavailability – may require dose adjustment", tone: "warning" };
    return { text: "Low bioavailability – consider alternative routes or formulations", tone: "danger" };
}

function numberError(raw: string, allowZero: boolean): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    if (isNaN(value)) return "Enter a number.";
    if (value < 0) return "Cannot be negative.";
    if (value === 0 && !allowZero) return "Must be greater than zero.";
    return undefined;
}

export default function BioavailabilityCalculator() {
    const [method, setMethod] = useState<Method>("auc");
    const [route, setRoute] = useState<RouteType>("oral");
    const [doseAdministered, setDoseAdministered] = useState(DEFAULTS.doseA);
    const [aucAdministered, setAucAdministered] = useState(DEFAULTS.aucA);
    const [doseReference, setDoseReference] = useState(DEFAULTS.doseR);
    const [aucReference, setAucReference] = useState(DEFAULTS.aucR);
    const [clearance, setClearance] = useState("");
    const [volume, setVolume] = useState("");

    /*
     * Live instead of two Calculate buttons. The old page kept the half-life
     * from an earlier calculation after CL or Vd was cleared, and printed
     * "Infinity%" for a zero test dose. Both now show nothing. Negative doses or
     * AUCs are rejected. Positive inputs give identical numbers.
     */
    const result = useMemo(() => {
        const doseA = parseFloat(doseAdministered);
        const doseR = parseFloat(doseReference);
        if (isNaN(doseA) || isNaN(doseR) || doseA <= 0 || doseR <= 0) return null;

        let f: number;
        let estimatedAucA: number | null = null;
        let estimatedAucR: number | null = null;
        let effectiveDose: number | null = null;

        if (method === "auc") {
            const aucA = parseFloat(aucAdministered);
            const aucR = parseFloat(aucReference);
            if (isNaN(aucA) || isNaN(aucR) || aucA < 0 || aucR <= 0) return null;
            f = (aucA / doseA / (aucR / doseR)) * 100;
        } else {
            // Typical bioavailability by route (from literature)
            const typical = TYPICAL_F[route];
            effectiveDose = doseA * (typical / 100);
            f = (effectiveDose / doseR) * 100;
            estimatedAucA = effectiveDose * 0.5;
            estimatedAucR = doseR * 0.5;
        }
        if (!Number.isFinite(f)) return null;

        const chartData = [
            { name: "Oral", value: route === "oral" ? f : 80 },
            { name: "IV", value: 100 },
            { name: "IM", value: 95 },
            { name: "SC", value: 90 },
            { name: "Transdermal", value: 85 },
        ];

        return { f, effectiveDose, estimatedAucA, estimatedAucR, chartData, ...getInterpretation(f) };
    }, [method, route, doseAdministered, aucAdministered, doseReference, aucReference]);

    // Half-life if clearance and volume are provided
    const halfLife = useMemo(() => {
        const cl = parseFloat(clearance);
        const v = parseFloat(volume);
        if (!isNaN(cl) && !isNaN(v) && cl > 0 && v > 0) return (0.693 * v) / cl;
        return null;
    }, [clearance, volume]);

    /* The old "Estimate from Dose" button also wrote these AUCs into the AUC fields. */
    const copyEstimatedAucs = () => {
        if (!result || result.estimatedAucA === null || result.estimatedAucR === null) return;
        setAucAdministered(result.estimatedAucA.toFixed(2));
        setAucReference(result.estimatedAucR.toFixed(2));
        setMethod("auc");
    };

    const loadSample = (drug: (typeof SAMPLE_DRUGS)[number]) => {
        setMethod("auc");
        setRoute(drug.route);
        setDoseAdministered(drug.dose);
        setDoseReference(drug.dose);
        setAucAdministered((parseFloat(drug.dose) * (drug.f / 100) * 0.5).toFixed(2));
        setAucReference((parseFloat(drug.dose) * 0.5).toFixed(2));
    };

    const reset = () => {
        setDoseAdministered(DEFAULTS.doseA);
        setAucAdministered(DEFAULTS.aucA);
        setDoseReference(DEFAULTS.doseR);
        setAucReference(DEFAULTS.aucR);
        setClearance("");
        setVolume("");
    };

    return (
        <CalculatorShell
            title="Bioavailability Calculator"
            subtitle="Works out bioavailability (F) — the percentage of a dose that reaches the circulation — from AUC data, or estimates it from a typical value for the route."
            icon={Activity}
            eyebrow="Pharmacokinetics"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            <strong>F — bioavailability</strong> — compares the exposure (AUC, area under the
                            concentration–time curve) from a test dose with a reference. Against an IV
                            reference it is <em>absolute</em> bioavailability; against another oral
                            formulation it is <em>relative</em> bioavailability.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Comparing an oral dose with an IV dose of the same drug",
                                "Comparing a generic or new formulation with a standard",
                                "Converting a dose between routes",
                                "Explaining first-pass metabolism",
                            ]}
                        />
                        <CalcList
                            title="BCS classification"
                            items={[
                                "Class I: High solubility, high permeability",
                                "Class II: Low solubility, high permeability",
                                "Class III: High solubility, low permeability",
                                "Class IV: Low solubility, low permeability",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Watch for"
                            items={[
                                "AUCs must be to infinity and in the same units",
                                "Assumes clearance is the same in both studies",
                                "The dose estimate uses a textbook F per route, not the drug's own value",
                                "F above 100% usually means different clearance or a measurement problem",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch label="Calculation method" value={method} onChange={setMethod} options={METHODS} />

            <ResultCard
                label="Bioavailability (F)"
                value={result ? result.f.toFixed(1) : null}
                unit="%"
                interpretation={result?.text}
                tone={result?.tone ?? "neutral"}
                empty={
                    method === "auc"
                        ? "Enter the dose and AUC for both the test and the reference formulation."
                        : "Enter the test and reference doses to estimate F for the chosen route."
                }
            />

            <CalcSection title="Inputs">
                <SelectField
                    label="Administration route"
                    value={route}
                    onChange={(next) => setRoute(next as RouteType)}
                    options={ROUTES}
                    hint={
                        method === "dose"
                            ? `Typical F used for this route: ${TYPICAL_F[route]}%.`
                            : "Labels the result and highlights the route in the comparison chart."
                    }
                />

                <div className="space-y-3">
                    <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Test formulation
                    </p>
                    <FieldGrid>
                        <NumberField
                            label="Test dose Dₜ (mg)"
                            value={doseAdministered}
                            onChange={setDoseAdministered}
                            unit="mg"
                            step="0.001"
                            min={0}
                            error={numberError(doseAdministered, false)}
                            hint="Dose of the formulation being tested (e.g. oral)."
                        />
                        {method === "auc" && (
                            <NumberField
                                label="Test AUCₜ (mg·h/L)"
                                value={aucAdministered}
                                onChange={setAucAdministered}
                                unit="mg·h/L"
                                step="0.001"
                                min={0}
                                error={numberError(aucAdministered, true)}
                                hint="AUC measured after the test dose."
                            />
                        )}
                    </FieldGrid>
                </div>

                <div className="space-y-3">
                    <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Reference (IV or standard)
                    </p>
                    <FieldGrid>
                        <NumberField
                            label="Reference dose Dᵣ (mg)"
                            value={doseReference}
                            onChange={setDoseReference}
                            unit="mg"
                            step="0.001"
                            min={0}
                            error={numberError(doseReference, false)}
                            hint="Dose of the IV or standard formulation."
                        />
                        {method === "auc" && (
                            <NumberField
                                label="Reference AUCᵣ (mg·h/L)"
                                value={aucReference}
                                onChange={setAucReference}
                                unit="mg·h/L"
                                step="0.001"
                                min={0}
                                error={numberError(aucReference, false)}
                                hint="AUC measured after the reference dose."
                            />
                        )}
                    </FieldGrid>
                </div>

                <div className="space-y-3">
                    <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Pharmacokinetic parameters (optional)
                    </p>
                    <FieldGrid>
                        <NumberField
                            label="Clearance CL (L/h)"
                            value={clearance}
                            onChange={setClearance}
                            unit="L/h"
                            step="0.001"
                            min={0}
                            error={numberError(clearance, false)}
                            hint="With Vd, gives the half-life."
                        />
                        <NumberField
                            label="Volume of distribution Vd (L)"
                            value={volume}
                            onChange={setVolume}
                            unit="L"
                            step="0.001"
                            min={0}
                            error={numberError(volume, false)}
                            hint="t½ = 0.693 × Vd / CL."
                        />
                    </FieldGrid>
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example drug (fills the AUC method)</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_DRUGS.map((drug) => (
                            <button
                                key={drug.name}
                                type="button"
                                onClick={() => loadSample(drug)}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {drug.name}
                                <span className="ml-1.5 font-normal text-muted-foreground">
                                    F={drug.f}% · t½={drug.t12}h
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
                <CalcSection title="Working">
                    <div>
                        <ResultRow label="Route" value={route.toUpperCase()} />
                        {method === "auc" ? (
                            <ResultRow
                                label={`F = (${aucAdministered} ÷ ${doseAdministered}) ÷ (${aucReference} ÷ ${doseReference}) × 100`}
                                value={result.f.toFixed(1)}
                                unit="%"
                            />
                        ) : (
                            <>
                                <ResultRow
                                    label={`Effective dose = ${doseAdministered} × ${TYPICAL_F[route]}%`}
                                    value={Number(result.effectiveDose!.toFixed(4)).toString()}
                                    unit="mg"
                                />
                                <ResultRow
                                    label={`F = ${Number(result.effectiveDose!.toFixed(4))} ÷ ${doseReference} × 100`}
                                    value={result.f.toFixed(1)}
                                    unit="%"
                                />
                                <ResultRow label="Estimated test AUC (dose × F × 0.5)" value={result.estimatedAucA!.toFixed(2)} unit="mg·h/L" />
                                <ResultRow label="Estimated reference AUC (dose × 0.5)" value={result.estimatedAucR!.toFixed(2)} unit="mg·h/L" />
                            </>
                        )}
                        <ResultRow
                            label={halfLife !== null ? `t½ = 0.693 × ${volume} ÷ ${clearance}` : "Half-life (t½)"}
                            value={halfLife !== null ? halfLife.toFixed(2) : "Enter CL and Vd"}
                            unit={halfLife !== null ? "h" : undefined}
                        />
                    </div>
                    {method === "dose" && (
                        <Button variant="outline" onClick={copyEstimatedAucs} className="w-full">
                            <ArrowRightLeft />
                            Copy estimated AUCs to the AUC method
                        </Button>
                    )}
                </CalcSection>
            )}

            {result && (
                <CalcSection
                    title="Route comparison"
                    description="Typical bioavailability by route (%). The Oral bar shows your result when the route is oral."
                >
                    <div className="-ml-2 h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={result.chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval={0} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={36} />
                                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, "F"]} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                                    {result.chartData.map((entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={entry.name === ROUTE_BAR[route] ? "#10B981" : "#2563EB"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Typical bioavailability">
                <div>
                    <ResultRow label="IV" value="100%" />
                    <ResultRow label="IM" value="75–100%" />
                    <ResultRow label="Oral" value="0–100%" />
                    <ResultRow label="Transdermal" value="70–95%" />
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>F (%) = (AUCₜ / Dₜ) ÷ (AUCᵣ / Dᵣ) × 100</Formula>
                <Formula>Estimate: effective dose = Dₜ × typical F;  F = effective dose ÷ Dᵣ × 100</Formula>
                <Formula>t½ = 0.693 × Vd / CL</Formula>
                <p>
                    Dividing each AUC by its own dose puts both formulations on a per-milligram footing, so
                    the doses do not need to be equal. With an IV reference the result is absolute
                    bioavailability; with an oral reference it is relative bioavailability.
                </p>
                <p>
                    The dose estimate does not use your AUCs at all: it applies a textbook F for the route
                    (oral 80%, IV 100%, IM 95%, SC 90%, transdermal 85%) and writes illustrative AUCs of
                    half the effective dose, which you can copy into the AUC method.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is the difference between absolute and relative bioavailability?",
                        a: "Absolute bioavailability compares a dose with an IV dose, which by definition reaches the circulation completely (F = 100%). Relative bioavailability compares two non-IV formulations, for example a generic tablet with the brand tablet.",
                    },
                    {
                        q: "Why does oral bioavailability fall below 100%?",
                        a: "Incomplete dissolution or absorption in the gut, and first-pass metabolism in the gut wall and liver before the drug reaches the systemic circulation. Propranolol loses most of each dose this way.",
                    },
                    {
                        q: "Can F be more than 100%?",
                        a: "For true absolute bioavailability, no. A result above 100% usually means clearance differed between the two studies, the AUCs were not extrapolated to infinity, or — in relative studies — the test formulation is genuinely better absorbed than the reference.",
                    },
                    {
                        q: "How do I use F to convert a dose between routes?",
                        a: "Oral dose = IV dose ÷ F (as a fraction). A drug with F = 0.5 needs twice the IV dose by mouth to give the same exposure.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
