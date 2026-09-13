"use client";

import { useMemo, useState } from "react";
import { FlaskConical, RefreshCw } from "lucide-react";
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
type BUNUnit = "mg/dL" | "mmol/L";

/* ── Conversion factors and bands (unchanged from the original calculator) ── */
const GLUCOSE_MMOL_TO_MGDL = 18;
const BUN_MMOL_TO_MGDL = 2.8;
const ETHANOL_DIVISOR = 4.6;
const GAP_HIGH = 10;
const GAP_LOW = -10;

const DEFAULTS = { na: "140", glu: "100", bun: "15", etoh: "0", measured: "290" };

/** Sample cases. All values are in mg/dL, so loading one also resets the units. */
const SAMPLES = [
    { name: "Normal", na: "140", glu: "100", bun: "15", measured: "290" },
    { name: "Ethanol ingestion", na: "140", glu: "100", bun: "15", etoh: "150", measured: "320" },
    { name: "Methanol poisoning", na: "138", glu: "95", bun: "12", measured: "340" },
    { name: "Renal failure", na: "135", glu: "110", bun: "80", measured: "315" },
    { name: "DKA", na: "128", glu: "450", bun: "25", measured: "310" },
];

/** toFixed(1) without ever showing "-0.0" for a value that rounds to zero. */
const fixed1 = (value: number) => {
    const text = value.toFixed(1);
    return text === "-0.0" ? "0.0" : text;
};

/** An error for a value that cannot physically be negative. */
const negativeError = (raw: string) => (raw.trim() !== "" && parseFloat(raw) < 0 ? "Cannot be negative." : undefined);

export default function OsmolarGapCalculator() {
    const [sodium, setSodium] = useState(DEFAULTS.na);
    const [glucose, setGlucose] = useState(DEFAULTS.glu);
    const [bun, setBun] = useState(DEFAULTS.bun);
    const [ethanol, setEthanol] = useState(DEFAULTS.etoh);
    const [measuredOsm, setMeasuredOsm] = useState(DEFAULTS.measured);
    const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>("mg/dL");
    const [bunUnit, setBunUnit] = useState<BUNUnit>("mg/dL");
    const [includeEthanol, setIncludeEthanol] = useState(false);

    /*
     * Derived, not stored. The original recomputed into state from a useEffect
     * (plus a redundant Calculate button); the arithmetic below is the same.
     */
    const result = useMemo(() => {
        const na = parseFloat(sodium);
        let glu = parseFloat(glucose);
        let bunVal = parseFloat(bun);
        const etoh = parseFloat(ethanol);

        if (isNaN(na) || isNaN(glu) || isNaN(bunVal)) return null;

        // Convert glucose and BUN to mg/dL if needed
        if (glucoseUnit === "mmol/L") glu = glu * GLUCOSE_MMOL_TO_MGDL;
        if (bunUnit === "mmol/L") bunVal = bunVal * BUN_MMOL_TO_MGDL; // 1 mmol/L = 2.8 mg/dL (BUN)

        const naTerm = 2 * na;
        const gluTerm = glu / GLUCOSE_MMOL_TO_MGDL;
        const bunTerm = bunVal / BUN_MMOL_TO_MGDL;
        let calcOsm = naTerm + gluTerm + bunTerm;
        const ethanolUsed = includeEthanol && !isNaN(etoh);
        const etohTerm = ethanolUsed ? etoh / ETHANOL_DIVISOR : 0;
        if (ethanolUsed) calcOsm += etohTerm;

        const measured = parseFloat(measuredOsm);
        let gap: number | null = null;
        let interpretation = "";
        let tone: ResultTone = "neutral";
        if (!isNaN(measured)) {
            gap = measured - calcOsm;
            if (gap > GAP_HIGH) {
                interpretation = "Elevated osmolar gap – possible toxic alcohol ingestion";
                tone = "danger";
            } else if (gap < GAP_LOW) {
                interpretation = "Low osmolar gap (check measured value)";
                tone = "warning";
            } else {
                interpretation = "Normal osmolar gap";
                tone = "success";
            }
        }

        return { na, glu, bunVal, etoh, naTerm, gluTerm, bunTerm, etohTerm, ethanolUsed, calcOsm, measured, gap, interpretation, tone };
    }, [sodium, glucose, bun, ethanol, measuredOsm, glucoseUnit, bunUnit, includeEthanol]);

    const reset = () => {
        setSodium(DEFAULTS.na);
        setGlucose(DEFAULTS.glu);
        setBun(DEFAULTS.bun);
        setEthanol(DEFAULTS.etoh);
        setMeasuredOsm(DEFAULTS.measured);
        setGlucoseUnit("mg/dL");
        setBunUnit("mg/dL");
        setIncludeEthanol(false);
    };

    const loadSample = (sample: (typeof SAMPLES)[number]) => {
        setSodium(sample.na);
        setGlucose(sample.glu);
        setBun(sample.bun);
        setEthanol(sample.etoh || "0");
        setMeasuredOsm(sample.measured);
        setIncludeEthanol(!!sample.etoh);
        // The sample values are mg/dL; leaving a mmol/L unit selected would misread them.
        setGlucoseUnit("mg/dL");
        setBunUnit("mg/dL");
    };

    return (
        <CalculatorShell
            title="Osmolar Gap Calculator"
            subtitle="Compares measured with calculated serum osmolality to flag unmeasured osmoles such as toxic alcohols."
            icon={FlaskConical}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            The lab measures serum osmolality directly. Sodium, glucose and urea
                            account for almost all of it, so a formula can estimate what it{" "}
                            <em>should</em> be. The difference — the osmolar gap — is made of
                            osmoles the formula does not know about.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "A toxic alcohol ingestion is suspected (methanol, ethylene glycol, isopropanol)",
                                "There is an unexplained high anion gap metabolic acidosis",
                                "Checking how much of a raised osmolality ethanol explains",
                            ]}
                        />
                        <CalcList
                            title="Causes of an elevated gap"
                            items={[
                                "Ethanol",
                                "Methanol",
                                "Ethylene glycol",
                                "Isopropanol",
                                "Renal failure (BUN)",
                                "Diabetic ketoacidosis (ketones)",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Read with care"
                            items={[
                                "The normal gap varies by lab — typically −10 to +10",
                                "A normal gap does not exclude a late toxic alcohol ingestion, once it has been metabolised",
                                "Measured and calculated values must come from the same blood sample",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Osmolar gap"
                value={result && result.gap !== null ? fixed1(result.gap) : null}
                unit="mOsm/kg"
                interpretation={result?.interpretation || undefined}
                tone={result?.tone ?? "neutral"}
                empty={
                    result
                        ? `Calculated osmolality is ${fixed1(result.calcOsm)} mOsm/kg — enter the measured osmolality to see the gap.`
                        : "Enter sodium, glucose, BUN and the measured osmolality to see the gap."
                }
            />

            <CalcSection title="Patient values" description="From the same blood sample. Glucose and BUN accept mg/dL or mmol/L.">
                <FieldGrid>
                    <NumberField
                        label="Sodium (Na)"
                        value={sodium}
                        onChange={setSodium}
                        unit="mEq/L"
                        step="1"
                        placeholder="e.g., 140"
                        error={negativeError(sodium)}
                        hint="Normal 135–145 mEq/L."
                    />
                    <NumberField
                        label="Glucose"
                        value={glucose}
                        onChange={setGlucose}
                        units={["mg/dL", "mmol/L"]}
                        unit={glucoseUnit}
                        onUnitChange={(next) => setGlucoseUnit(next as GlucoseUnit)}
                        step="1"
                        placeholder="e.g., 100"
                        error={negativeError(glucose)}
                        hint="Fasting normal 70–100 mg/dL (3.9–5.6 mmol/L)."
                    />
                    <NumberField
                        label="BUN — blood urea nitrogen"
                        value={bun}
                        onChange={setBun}
                        units={["mg/dL", "mmol/L"]}
                        unit={bunUnit}
                        onUnitChange={(next) => setBunUnit(next as BUNUnit)}
                        step="1"
                        placeholder="e.g., 15"
                        error={negativeError(bun)}
                        hint="Normal 7–20 mg/dL. Use urea nitrogen, not urea."
                    />
                    <NumberField
                        label="Measured osmolality"
                        value={measuredOsm}
                        onChange={setMeasuredOsm}
                        unit="mOsm/kg"
                        step="1"
                        placeholder="e.g., 290"
                        error={negativeError(measuredOsm)}
                        hint="From the lab (freezing-point osmometer). Normal 275–295 mOsm/kg."
                    />
                </FieldGrid>

                <div className="space-y-4 rounded-xl border border-border/80 bg-muted/30 p-3.5">
                    <label className="flex min-h-[40px] cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            checked={includeEthanol}
                            onChange={(event) => setIncludeEthanol(event.target.checked)}
                            className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
                        />
                        <span className="min-w-0">
                            <span className="block text-sm font-medium text-foreground">Include ethanol</span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                                Adds ethanol ÷ 4.6 to the calculated value, so the gap shows what ethanol does not explain.
                            </span>
                        </span>
                    </label>
                    {includeEthanol && (
                        <NumberField
                            label="Serum ethanol"
                            value={ethanol}
                            onChange={setEthanol}
                            unit="mg/dL"
                            step="1"
                            placeholder="e.g., 100"
                            error={negativeError(ethanol)}
                            hint="Blood alcohol level in mg/dL (80 mg/dL ≈ 0.08%)."
                        />
                    )}
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLES.map((sample) => (
                            <button
                                key={sample.name}
                                type="button"
                                onClick={() => loadSample(sample)}
                                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
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
                <CalcSection title="Working" description="Every term converted to mg/dL first, then to its osmolar contribution.">
                    <div>
                        <ResultRow label={`2 × Na = 2 × ${result.na}`} value={result.naTerm.toFixed(2)} unit="mOsm" />
                        <ResultRow
                            label={`Glucose ÷ 18 = ${+result.glu.toFixed(2)} ÷ 18`}
                            value={result.gluTerm.toFixed(2)}
                            unit="mOsm"
                        />
                        <ResultRow
                            label={`BUN ÷ 2.8 = ${+result.bunVal.toFixed(2)} ÷ 2.8`}
                            value={result.bunTerm.toFixed(2)}
                            unit="mOsm"
                        />
                        {result.ethanolUsed && (
                            <ResultRow
                                label={`Ethanol ÷ 4.6 = ${result.etoh} ÷ 4.6`}
                                value={result.etohTerm.toFixed(2)}
                                unit="mOsm"
                            />
                        )}
                        <ResultRow label="Calculated osmolality" value={fixed1(result.calcOsm)} unit="mOsm/kg" />
                        <ResultRow
                            label="Measured osmolality"
                            value={isNaN(result.measured) ? "—" : String(result.measured)}
                            unit="mOsm/kg"
                        />
                        {result.gap !== null && (
                            <ResultRow
                                label="Gap = measured − calculated"
                                value={fixed1(result.gap)}
                                unit="mOsm/kg"
                                badge={result.gap > GAP_HIGH ? "High" : result.gap < GAP_LOW ? "Low" : "Normal"}
                                badgeTone={result.gap > GAP_HIGH ? "destructive" : result.gap < GAP_LOW ? "warning" : "success"}
                            />
                        )}
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <Formula>Calculated osmolality = 2 × Na + glucose ÷ 18 + BUN ÷ 2.8</Formula>
                <Formula>With ethanol: + ethanol ÷ 4.6</Formula>
                <Formula>Osmolar gap = measured osmolality − calculated osmolality</Formula>
                <p>
                    All of glucose, BUN and ethanol are in mg/dL. Dividing glucose by 18 converts it to
                    mmol/L; dividing BUN by 2.8 converts urea nitrogen to mmol/L; ethanol ÷ 4.6 does the
                    same for ethanol. Sodium is doubled to count its accompanying anions (chloride,
                    bicarbonate).
                </p>
                <p>
                    An osmolar gap &gt; 10 suggests the presence of unmeasured osmoles — common in toxic
                    alcohol ingestion. The normal gap varies by lab (typically −10 to +10).
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "My lab reports glucose and urea in mmol/L — what do I enter?",
                        a: "Switch the glucose and BUN units to mmol/L. The calculator converts them to mg/dL (× 18 for glucose, × 2.8 for BUN) before applying the formula, so mmol/L values effectively enter at face value. Make sure the BUN value is urea nitrogen, not urea.",
                    },
                    {
                        q: "Why does ethanol matter?",
                        a: "Ethanol is the commonest cause of a raised osmolar gap. Ticking 'Include ethanol' adds its osmolar contribution to the calculated value, so the remaining gap reflects what ethanol does not explain — a persistent gap then points toward methanol or ethylene glycol.",
                    },
                    {
                        q: "Can a normal gap rule out toxic alcohol poisoning?",
                        a: "No. As methanol or ethylene glycol is metabolised, the gap falls while the anion gap rises. A patient presenting late can have a normal osmolar gap and a severe acidosis.",
                    },
                    {
                        q: "What does a negative gap mean?",
                        a: "Small negative values are within the normal −10 to +10 spread. A gap below −10 usually means a measurement or transcription error — recheck the measured osmolality and that all values are from the same sample.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
