"use client";

import { useMemo, useState } from "react";
import { Droplets, RefreshCw } from "lucide-react";
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
    type ResultTone,
} from "@/components/calculators";

type GlucoseUnit = "mg/dL" | "mmol/L";

/* ── Conversion and reference bands, unchanged ────────────────────────────── */
const MMOL_TO_MGDL = 18;
const NORMAL_LOW = 135;
const NORMAL_HIGH = 145;

const SAMPLES = [
    { name: "Normal", na: "140", glu: "100" },
    { name: "Hyperglycaemia", na: "128", glu: "400" },
    { name: "DKA", na: "125", glu: "600" },
    { name: "Mild hyponatraemia", na: "132", glu: "120" },
    { name: "Hypernatraemia", na: "148", glu: "90" },
];

export default function SodiumCorrectionCalculator() {
    const [sodium, setSodium] = useState("135");
    const [glucose, setGlucose] = useState("100");
    const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>("mg/dL");

    /* Derived rather than pushed into state from a useEffect. Arithmetic unchanged. */
    const result = useMemo(() => {
        const na = parseFloat(sodium);
        let glu = parseFloat(glucose);
        if (isNaN(na) || isNaN(glu)) return null;

        if (glucoseUnit === "mmol/L") glu = glu * MMOL_TO_MGDL;

        const corrected = na + 0.016 * (glu - 100);

        let interpretation: string;
        let tone: ResultTone;
        if (corrected < NORMAL_LOW) {
            interpretation = "Hyponatraemia — true sodium deficit, below 135 mEq/L even after correction.";
            tone = "warning";
        } else if (corrected > NORMAL_HIGH) {
            interpretation = "Hypernatraemia — above 145 mEq/L after correction.";
            tone = "danger";
        } else {
            interpretation = "Within the normal range of 135–145 mEq/L.";
            tone = "success";
        }

        return { corrected, glucoseMgDl: glu, measured: na, interpretation, tone };
    }, [sodium, glucose, glucoseUnit]);

    const reset = () => {
        setSodium("135");
        setGlucose("100");
        setGlucoseUnit("mg/dL");
    };

    return (
        <CalculatorShell
            title="Sodium Correction Calculator"
            subtitle="Corrects measured serum sodium for the dilutional effect of a high glucose."
            icon={Droplets}
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            A high blood glucose pulls water out of cells into the bloodstream. The
                            extra water dilutes the sodium, so the lab reports a low sodium in a patient
                            who has no sodium deficit at all. This is{" "}
                            <strong>translocational (dilutional) hyponatraemia</strong>.
                        </p>
                        <p>
                            Correcting the sodium answers the question that actually matters: is this
                            patient genuinely short of sodium, or does the number simply reflect their
                            glucose?
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Diabetic ketoacidosis or a hyperosmolar hyperglycaemic state",
                                "Any hyponatraemia found alongside a glucose above 100 mg/dL",
                                "Before treating an apparent hyponatraemia in a diabetic patient",
                                "Tracking sodium as glucose falls during insulin therapy",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Do not rely on it when"
                            items={[
                                "Hyponatraemia has a cause other than glucose — SIADH, diuretics, heart failure",
                                "Severe hyperlipidaemia or hyperproteinaemia (pseudohyponatraemia) is present",
                                "Deciding the rate of correction — that is a separate clinical judgement",
                                "The glucose is normal; the correction then does almost nothing",
                            ]}
                        />
                        <p className="text-xs italic">
                            Katz MA, N Engl J Med 1973; Hillier TA et al., Am J Med 1999.
                        </p>
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Corrected sodium"
                value={result ? result.corrected.toFixed(1) : null}
                unit="mEq/L"
                interpretation={result?.interpretation}
                tone={result?.tone ?? "neutral"}
                empty="Enter a sodium and a glucose value to see the corrected sodium."
            />

            <CalcSection title="Patient values">
                <FieldGrid>
                    <NumberField
                        label="Measured sodium"
                        value={sodium}
                        onChange={setSodium}
                        unit="mEq/L"
                        step="1"
                        hint="The sodium printed on the lab report."
                    />
                    <NumberField
                        label="Blood glucose"
                        value={glucose}
                        onChange={setGlucose}
                        units={["mg/dL", "mmol/L"]}
                        unit={glucoseUnit}
                        onUnitChange={(next) => setGlucoseUnit(next as GlucoseUnit)}
                        step="1"
                        hint="The correction only matters once glucose is well above 100 mg/dL."
                    />
                </FieldGrid>

                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLES.map((sample) => (
                            <button
                                key={sample.name}
                                type="button"
                                onClick={() => {
                                    setSodium(sample.na);
                                    setGlucose(sample.glu);
                                    setGlucoseUnit("mg/dL");
                                }}
                                className="rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent"
                            >
                                {sample.name}
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
                        <ResultRow label="Measured sodium" value={result.measured.toFixed(1)} unit="mEq/L" />
                        <ResultRow
                            label="Glucose (converted)"
                            value={result.glucoseMgDl.toFixed(0)}
                            unit="mg/dL"
                        />
                        <ResultRow
                            label="Correction applied"
                            value={`+${(result.corrected - result.measured).toFixed(1)}`}
                            unit="mEq/L"
                        />
                        <ResultRow label="Normal sodium" value="135 – 145" unit="mEq/L" />
                        <ResultRow label="Normal fasting glucose" value="70 – 100" unit="mg/dL" />
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>Corrected Na = measured Na + 0.016 × (glucose in mg/dL − 100)</Formula>
                <p>
                    For every 100 mg/dL the glucose sits above normal, the measured sodium reads about
                    1.6 mEq/L lower than the patient&apos;s true sodium. The formula simply adds that
                    back.
                </p>
                <p>
                    A commonly taught alternative uses 0.024 rather than 0.016, based on work by
                    Hillier, and is argued to be more accurate once glucose exceeds 400 mg/dL. This
                    calculator uses the classic Katz factor of 0.016; expect a slightly larger
                    correction if your institution prefers Hillier&apos;s.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why does a high glucose lower sodium?",
                        a: "Glucose is osmotically active and does not cross cell membranes freely without insulin. A high plasma glucose therefore draws water out of cells into the plasma, and that extra water dilutes the sodium already there. No sodium has been lost — it is simply spread through more water.",
                    },
                    {
                        q: "Should I use 0.016 or 0.024?",
                        a: "0.016 is the original Katz factor and the one most references still quote; this calculator uses it. Hillier's experimental work suggests 0.024 fits better, especially above 400 mg/dL. Follow your local protocol, and be aware the two can differ by several mEq/L in severe hyperglycaemia.",
                    },
                    {
                        q: "The corrected sodium is normal but the measured one is low. What now?",
                        a: "That pattern points to dilutional hyponatraemia caused by the glucose rather than a sodium deficit. Treating the hyperglycaemia will usually bring the measured sodium up on its own — which is why the sodium often rises during insulin therapy and should be watched rather than chased.",
                    },
                    {
                        q: "What if the corrected sodium is still low?",
                        a: "Then there is a genuine hyponatraemia on top of the hyperglycaemia, and it needs its own workup — volume status, urine osmolality, urine sodium and a medication review. Correction tells you the question is real; it does not tell you the cause.",
                    },
                    {
                        q: "Does this apply to pseudohyponatraemia?",
                        a: "No. Pseudohyponatraemia is a laboratory artefact from very high lipids or proteins displacing plasma water, and it is unrelated to glucose. This correction will not fix it — a direct ion-selective electrode measurement will.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
