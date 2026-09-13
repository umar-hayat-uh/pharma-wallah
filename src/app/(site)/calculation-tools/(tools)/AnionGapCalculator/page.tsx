"use client";

import { useMemo, useState } from "react";
import { Layers, RefreshCw } from "lucide-react";
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

type Correction = "none" | "albumin";

/* ── Constants and interpretation bands (unchanged from the original page) ── */
const NORMAL_ALBUMIN = 4; // g/dL
const ALBUMIN_FACTOR = 2.5; // mEq/L of gap per 1 g/dL fall in albumin
const HIGH_CUTOFF = 12; // gap > 12 → elevated
const LOW_CUTOFF = 6; // gap < 6 → low

const SAMPLES = [
    { name: "Normal", na: "140", cl: "104", hco3: "24", alb: "4.0" },
    { name: "DKA", na: "135", cl: "95", hco3: "10", alb: "4.5" },
    { name: "Lactic acidosis", na: "138", cl: "100", hco3: "14", alb: "3.5" },
    { name: "Hyperchloremic", na: "138", cl: "115", hco3: "18", alb: "4.0" },
    { name: "Hypoalbuminemia", na: "140", cl: "108", hco3: "22", alb: "2.0" },
];

/** One decimal, as the original page showed — without ever printing "-0.0". */
function fmt1(value: number): string {
    const text = value.toFixed(1);
    return text === "-0.0" ? "0.0" : text;
}

function interpret(gap: number): { text: string; tone: ResultTone } {
    if (gap > HIGH_CUTOFF) return { text: "Elevated anion gap metabolic acidosis", tone: "danger" };
    if (gap < LOW_CUTOFF) return { text: "Low anion gap (consider causes)", tone: "warning" };
    return { text: "Normal anion gap", tone: "success" };
}

/** Empty is "not entered yet"; a negative concentration is impossible. */
function negativeError(raw: string): string | undefined {
    const value = parseFloat(raw);
    return !isNaN(value) && value < 0 ? "A concentration cannot be negative." : undefined;
}

export default function AnionGapCalculator() {
    const [sodium, setSodium] = useState("140");
    const [chloride, setChloride] = useState("104");
    const [bicarb, setBicarb] = useState("24");
    const [albumin, setAlbumin] = useState("4.0");
    const [correction, setCorrection] = useState<Correction>("none");

    const errors = {
        sodium: negativeError(sodium),
        chloride: negativeError(chloride),
        bicarb: negativeError(bicarb),
        albumin: negativeError(albumin),
    };

    /*
     * Derived, not stored. The original recalculated from a useEffect on every
     * change; the arithmetic below is exactly that function's.
     */
    const result = useMemo(() => {
        const na = parseFloat(sodium);
        const cl = parseFloat(chloride);
        const hco3 = parseFloat(bicarb);
        const alb = parseFloat(albumin);

        if (isNaN(na) || isNaN(cl) || isNaN(hco3)) return null;
        if (na < 0 || cl < 0 || hco3 < 0) return null;

        const ag = na - (cl + hco3);

        const correctionApplied = correction === "albumin" && !isNaN(alb) && alb >= 0;
        const corrected = correctionApplied ? ag + ALBUMIN_FACTOR * (NORMAL_ALBUMIN - alb) : null;

        // The interpretation is read from the corrected gap whenever one exists.
        const reading = interpret(corrected ?? ag);

        return { na, cl, hco3, alb, ag, corrected, reading };
    }, [sodium, chloride, bicarb, albumin, correction]);

    const albuminMissing = correction === "albumin" && isNaN(parseFloat(albumin));

    const reset = () => {
        setSodium("140");
        setChloride("104");
        setBicarb("24");
        setAlbumin("4.0");
        setCorrection("none");
    };

    const headlineIsCorrected = result?.corrected !== null && result?.corrected !== undefined;

    return (
        <CalculatorShell
            title="Anion Gap Calculator"
            subtitle="Calculates the serum anion gap from sodium, chloride and bicarbonate, with an optional albumin correction."
            icon={Layers}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About the anion gap">
                        <p>
                            Blood is electrically neutral, but a routine panel only measures some of
                            its ions. The anion gap (AG) is the difference between the main measured
                            cation, sodium, and the main measured anions, chloride and bicarbonate. It
                            estimates the unmeasured anions — mostly albumin, plus phosphates,
                            sulfates and organic acids.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Working up a metabolic acidosis (low bicarbonate)",
                                "Separating high-gap from normal-gap (hyperchloraemic) acidosis",
                                "Suspecting a toxic ingestion — methanol, ethylene glycol, salicylate",
                                "Monitoring DKA: the gap closing tracks ketone clearance",
                            ]}
                        />
                        <CalcList
                            title="High-gap causes — MUDPILES"
                            items={[
                                "Methanol",
                                "Uremia",
                                "DKA (diabetic ketoacidosis)",
                                "Paraldehyde",
                                "Iron / INH (isoniazid)",
                                "Lactic acidosis",
                                "Ethanol / Ethylene glycol",
                                "Salicylates",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Read with care"
                            items={[
                                "Normal ranges vary by lab and analyser — commonly 8–12 mEq/L",
                                "Low albumin hides a raised gap; apply the albumin correction",
                                "A normal gap does not exclude a mixed acid–base disorder",
                            ]}
                        />
                        <p className="text-xs italic">Source: Kraut &amp; Madias, NEJM 2007.</p>
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch
                label="Albumin correction"
                value={correction}
                onChange={setCorrection}
                options={[
                    { value: "none", label: "Standard gap", description: "Na − (Cl + HCO₃)" },
                    { value: "albumin", label: "Albumin-corrected", description: "Adds 2.5 per g/dL albumin below 4" },
                ]}
            />

            <ResultCard
                label={headlineIsCorrected ? "Albumin-corrected anion gap" : "Anion gap"}
                value={result ? fmt1(result.corrected ?? result.ag) : null}
                unit="mEq/L"
                interpretation={result?.reading.text}
                tone={result?.reading.tone ?? "neutral"}
                empty="Enter sodium, chloride and bicarbonate to see the anion gap."
            />

            <CalcSection title="Electrolyte values" description="From the patient's basic metabolic panel (serum).">
                <FieldGrid className="lg:grid-cols-3">
                    <NumberField
                        label="Sodium (Na⁺)"
                        value={sodium}
                        onChange={setSodium}
                        unit="mEq/L"
                        step="1"
                        hint="Normal 135–145 mEq/L."
                        error={errors.sodium}
                    />
                    <NumberField
                        label="Chloride (Cl⁻)"
                        value={chloride}
                        onChange={setChloride}
                        unit="mEq/L"
                        step="1"
                        hint="Normal 96–106 mEq/L."
                        error={errors.chloride}
                    />
                    <NumberField
                        label="Bicarbonate (HCO₃⁻)"
                        value={bicarb}
                        onChange={setBicarb}
                        unit="mEq/L"
                        step="1"
                        hint="Normal 22–28 mEq/L. May be reported as total CO₂."
                        error={errors.bicarb}
                    />
                </FieldGrid>

                {correction === "albumin" && (
                    <FieldGrid>
                        <NumberField
                            label="Serum albumin"
                            value={albumin}
                            onChange={setAlbumin}
                            unit="g/dL"
                            step="0.1"
                            hint="Normal 3.5–5.0 g/dL. The correction uses 4 g/dL as the reference."
                            error={
                                errors.albumin ??
                                (albuminMissing ? "Enter albumin to apply the correction — the standard gap is shown until then." : undefined)
                            }
                        />
                    </FieldGrid>
                )}

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLES.map((sample) => (
                            <button
                                key={sample.name}
                                type="button"
                                onClick={() => {
                                    setSodium(sample.na);
                                    setChloride(sample.cl);
                                    setBicarb(sample.hco3);
                                    setAlbumin(sample.alb);
                                }}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium hover:bg-muted active:bg-accent"
                            >
                                {sample.name}
                                <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">
                                    Na {sample.na}, Cl {sample.cl}
                                </span>
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Examples fill albumin too; switch to Albumin-corrected to use it.
                    </p>
                </div>

                <Button variant="outline" onClick={reset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {result && (
                <CalcSection title="Working" description="The numbers you entered, plugged into the formula.">
                    <div>
                        <ResultRow
                            label={`AG = ${result.na} − (${result.cl} + ${result.hco3})`}
                            value={fmt1(result.ag)}
                            unit="mEq/L"
                        />
                        {result.corrected !== null && (
                            <ResultRow
                                label={`Corrected = ${fmt1(result.ag)} + 2.5 × (4 − ${albumin.trim()})`}
                                value={fmt1(result.corrected)}
                                unit="mEq/L"
                            />
                        )}
                        <ResultRow label="Normal range (typical lab)" value="8 – 12" unit="mEq/L" />
                        <ResultRow label="Read as elevated / low" value="> 12  /  < 6" unit="mEq/L" />
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>AG = Na⁺ − (Cl⁻ + HCO₃⁻)</Formula>
                <Formula>Albumin-corrected AG = AG + 2.5 × (4 − albumin in g/dL)</Formula>
                <p>
                    Na⁺ is sodium, Cl⁻ chloride and HCO₃⁻ bicarbonate, all in mEq/L. Albumin is the
                    largest unmeasured anion, so every 1 g/dL it falls below 4 g/dL lowers the gap by
                    about 2.5 mEq/L. The correction adds that back, unmasking a raised gap in a patient
                    with low albumin.
                </p>
                <p>
                    Here a gap above 12 mEq/L is read as elevated and below 6 mEq/L as low. When the
                    correction is on, the interpretation is based on the corrected value.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why correct for albumin?",
                        a: "Albumin carries negative charge and makes up most of the normal anion gap. In a patient with low albumin (liver disease, nephrotic syndrome, critical illness) the gap is artificially low, so an acid that would normally raise it can leave it looking normal. The correction adds 2.5 mEq/L for every 1 g/dL of albumin below 4.",
                    },
                    {
                        q: "Should potassium be included?",
                        a: "Some references use Na + K − (Cl + HCO₃), which gives a normal range about 4 mEq/L higher. This calculator uses the more common form without potassium — compare your result against a range for the same formula.",
                    },
                    {
                        q: "What does a low anion gap mean?",
                        a: "It is uncommon and most often reflects low albumin or a lab error. Other causes include paraproteins (multiple myeloma), lithium or bromide toxicity, and severe hypercalcaemia or hypermagnesaemia.",
                    },
                    {
                        q: "What is the delta ratio?",
                        a: "ΔAG / ΔHCO₃ — how much the gap has risen compared with how much bicarbonate has fallen. In a pure high-gap acidosis the two move roughly together; a ratio well below or above that suggests a mixed disorder (an additional normal-gap acidosis or a metabolic alkalosis).",
                    },
                    {
                        q: "Can I enter total CO₂ instead of bicarbonate?",
                        a: "Yes. Most chemistry analysers report total CO₂, which is mostly bicarbonate and is what the anion gap is normally calculated from.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
