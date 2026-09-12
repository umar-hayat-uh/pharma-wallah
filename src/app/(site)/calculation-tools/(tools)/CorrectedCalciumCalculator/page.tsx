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

type CalciumUnit = "mg/dL" | "mmol/L";
type AlbuminUnit = "g/dL" | "g/L";

/* ── Conversion constants and reference bands (unchanged) ─────────────────── */
const CALCIUM_MGDL_TO_MMOL = 0.2495;
const ALBUMIN_GDL_TO_GL = 10;
const NORMAL_LOW = 8.5;
const NORMAL_HIGH = 10.2;

/** Typical presentations, so a student can see the correction actually matter. */
const SAMPLES = [
    { name: "Normal", ca: "9.0", alb: "4.0" },
    { name: "Low albumin", ca: "8.0", alb: "2.5" },
    { name: "Hypercalcaemia", ca: "11.0", alb: "4.0" },
    { name: "CKD", ca: "8.5", alb: "3.0" },
    { name: "Cirrhosis", ca: "8.2", alb: "2.0" },
];

export default function CorrectedCalciumCalculator() {
    const [calcium, setCalcium] = useState("9.0");
    const [albumin, setAlbumin] = useState("4.0");
    const [calciumUnit, setCalciumUnit] = useState<CalciumUnit>("mg/dL");
    const [albuminUnit, setAlbuminUnit] = useState<AlbuminUnit>("g/dL");

    /*
     * Derived rather than stored in state. The previous version kept the result
     * in state and recomputed it from a useEffect, which meant a moment after
     * every keystroke where the displayed number did not match the inputs.
     * The arithmetic itself is untouched.
     */
    const result = useMemo(() => {
        let ca = parseFloat(calcium);
        let alb = parseFloat(albumin);
        if (isNaN(ca) || isNaN(alb)) return null;

        if (calciumUnit === "mmol/L") ca = ca / CALCIUM_MGDL_TO_MMOL;
        if (albuminUnit === "g/L") alb = alb / ALBUMIN_GDL_TO_GL;

        const corrected = ca + 0.8 * (4 - alb);

        let interpretation: string;
        let tone: ResultTone;
        if (corrected < NORMAL_LOW) {
            interpretation = "Hypocalcaemia — below the normal range of 8.5–10.2 mg/dL.";
            tone = "warning";
        } else if (corrected > NORMAL_HIGH) {
            interpretation = "Hypercalcaemia — above the normal range of 8.5–10.2 mg/dL.";
            tone = "danger";
        } else {
            interpretation = "Within the normal range of 8.5–10.2 mg/dL.";
            tone = "success";
        }

        return { corrected, measured: ca, interpretation, tone };
    }, [calcium, albumin, calciumUnit, albuminUnit]);

    const reset = () => {
        setCalcium("9.0");
        setAlbumin("4.0");
        setCalciumUnit("mg/dL");
        setAlbuminUnit("g/dL");
    };

    return (
        <CalculatorShell
            title="Corrected Calcium Calculator"
            subtitle="Adjusts total serum calcium for a patient's albumin level."
            icon={Droplets}
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Roughly 40–45% of the calcium in blood travels bound to albumin, and only
                            the free (ionised) fraction is physiologically active. A patient with low
                            albumin therefore shows a low <em>total</em> calcium on the lab report
                            while their active calcium is perfectly normal.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Albumin is outside 3.5–5.0 g/dL",
                                "Nephrotic syndrome, cirrhosis or malnutrition",
                                "Critically ill or post-surgical patients",
                                "Before acting on an apparently abnormal calcium",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Do not rely on it when"
                            items={[
                                "The patient is acidotic or alkalotic — pH shifts calcium binding",
                                "Multiple myeloma or another dysproteinaemia is present",
                                "In dialysis patients, where it performs poorly",
                                "An ionised calcium can be measured directly — always prefer it",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            {/* Result first: on a phone, burying it below the form means scrolling
                past every input to find out what the calculator said. */}
            <ResultCard
                label="Corrected calcium"
                value={result ? result.corrected.toFixed(2) : null}
                unit="mg/dL"
                interpretation={result?.interpretation}
                tone={result?.tone ?? "neutral"}
                empty="Enter a calcium and albumin value to see the corrected result."
            />

            <CalcSection title="Patient values">
                <FieldGrid>
                    <NumberField
                        label="Serum calcium"
                        value={calcium}
                        onChange={setCalcium}
                        units={["mg/dL", "mmol/L"]}
                        unit={calciumUnit}
                        onUnitChange={(next) => setCalciumUnit(next as CalciumUnit)}
                        step="0.1"
                        hint="The measured total calcium from the lab report."
                    />
                    <NumberField
                        label="Serum albumin"
                        value={albumin}
                        onChange={setAlbumin}
                        units={["g/dL", "g/L"]}
                        unit={albuminUnit}
                        onUnitChange={(next) => setAlbuminUnit(next as AlbuminUnit)}
                        step="0.1"
                        hint="Normal is 3.5–5.0 g/dL. Lower values need a bigger correction."
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
                                    setCalcium(sample.ca);
                                    setAlbumin(sample.alb);
                                    setCalciumUnit("mg/dL");
                                    setAlbuminUnit("g/dL");
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
                <CalcSection title="Reference ranges">
                    <div>
                        <ResultRow
                            label="Measured calcium (converted)"
                            value={result.measured.toFixed(2)}
                            unit="mg/dL"
                        />
                        <ResultRow label="Normal total calcium" value="8.5 – 10.2" unit="mg/dL" />
                        <ResultRow label="Normal ionised calcium" value="4.6 – 5.3" unit="mg/dL" />
                        <ResultRow label="Normal albumin" value="3.5 – 5.0" unit="g/dL" />
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>Corrected Ca = measured Ca + 0.8 × (4 − albumin in g/dL)</Formula>
                <p>
                    Roughly half of the calcium in blood is bound to albumin, and only the unbound
                    (ionised) half is physiologically active. When albumin is low, the total calcium
                    reported by the lab looks low even though the active calcium is normal. This
                    formula estimates what the total would have been at a normal albumin of 4 g/dL.
                </p>
                <p>
                    It is an estimate, and it is least reliable in acidosis, alkalosis and
                    dysproteinaemia. A measured ionised calcium remains the gold standard.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why is 4 g/dL used in the formula?",
                        a: "4 g/dL is taken as a normal reference albumin. The formula asks what the total calcium would have been if the patient's albumin had been normal, so the further albumin sits below 4, the larger the correction added.",
                    },
                    {
                        q: "Where does the 0.8 come from?",
                        a: "It is an empirical constant: each 1 g/dL fall in albumin lowers measured total calcium by roughly 0.8 mg/dL. It comes from population regression, which is exactly why the result is an estimate rather than a measurement.",
                    },
                    {
                        q: "Corrected calcium or ionised calcium?",
                        a: "Ionised calcium, whenever your lab can measure it. Corrected calcium is a bedside approximation for when it is unavailable; studies repeatedly show it misclassifies patients, particularly in renal failure and critical illness.",
                    },
                    {
                        q: "Does this work with mmol/L results?",
                        a: "Yes. Switch the unit next to the field and the calculator converts to mg/dL before applying the formula. The result is always reported in mg/dL.",
                    },
                    {
                        q: "What counts as a normal corrected calcium?",
                        a: "8.5–10.2 mg/dL for most adult laboratories. Below that is hypocalcaemia and above it hypercalcaemia — but always check the reference range printed on your own lab's report, as it varies slightly between assays.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
