"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, RefreshCw, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    FieldGrid,
    NumberField,
    ResultCard,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    AdSlot,
    ModeSwitch,
    LabNotice,
    type ResultTone,
} from "@/components/calculators";

type HeightUnit = "cm" | "in";
type WeightUnit = "kg" | "lbs";
type BMIPopulation = "who_standard" | "who_asian";
type Sex = "male" | "female";

interface PatientPreset {
    name: string;
    tag: string;
    height: string;
    heightUnit: HeightUnit;
    weight: string;
    weightUnit: WeightUnit;
    sex: Sex;
    population: BMIPopulation;
}

interface BMICategory {
    label: string;
    risk: string;
    tone: ResultTone;
    clinicalImplication: string;
}

const SAMPLE_PATIENTS: PatientPreset[] = [
    { name: "Underweight", tag: "BMI ~17.0", height: "172", heightUnit: "cm", weight: "50", weightUnit: "kg", sex: "female", population: "who_standard" },
    { name: "Normal Weight", tag: "BMI ~22.5", height: "175", heightUnit: "cm", weight: "69", weightUnit: "kg", sex: "male", population: "who_standard" },
    { name: "Overweight", tag: "BMI ~27.2", height: "178", heightUnit: "cm", weight: "86", weightUnit: "kg", sex: "male", population: "who_standard" },
    { name: "Obese Class I", tag: "BMI ~32.4", height: "168", heightUnit: "cm", weight: "92", weightUnit: "kg", sex: "female", population: "who_standard" },
    { name: "Severe Obese III", tag: "BMI ~42.5", height: "170", heightUnit: "cm", weight: "123", weightUnit: "kg", sex: "female", population: "who_standard" },
];

/* WHO classification bands, as printed in the original reference table. */
const WHO_TABLE = [
    { label: "Severe Thinness", range: "< 16.0", risk: "Very High" },
    { label: "Moderate Thinness", range: "16.0 – 16.9", risk: "High" },
    { label: "Mild Thinness", range: "17.0 – 18.4", risk: "Moderate" },
    { label: "Normal Weight", range: "18.5 – 24.9", risk: "Low (Optimal)" },
    { label: "Overweight (Pre-Obese)", range: "25.0 – 29.9", risk: "Moderate" },
    { label: "Obese Class I", range: "30.0 – 34.9", risk: "High" },
    { label: "Obese Class II", range: "35.0 – 39.9", risk: "Very High" },
    { label: "Obese Class III", range: "≥ 40.0", risk: "Extremely High" },
];

/* Spectrum gauge: 14 → 45 kg/m², as in the original. */
const GAUGE_MIN = 14;
const GAUGE_MAX = 45;
const gaugePct = (bmi: number) => Math.min(100, Math.max(0, ((bmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100));
const GAUGE_TICKS = [14, 18.5, 25, 30, 40];

function positiveError(raw: string, what: string): string | undefined {
    if (raw.trim() === "") return undefined;
    const value = parseFloat(raw);
    return isNaN(value) || value <= 0 ? `${what} must be greater than 0.` : undefined;
}

function classify(bmi: number, population: BMIPopulation): BMICategory {
    if (population === "who_standard") {
        if (bmi < 16.0)
            return { label: "Severe Thinness / Underweight", risk: "Very High Cardiovascular & Nutritional Risk", tone: "danger", clinicalImplication: "Risk of protein-calorie malnutrition, immune compromise, osteoporosis, and electrolyte disturbances." };
        if (bmi < 17.0)
            return { label: "Moderate Thinness", risk: "High Nutritional Risk", tone: "warning", clinicalImplication: "Requires nutritional assessment and screening for underlying systemic illness or eating disorders." };
        if (bmi < 18.5)
            return { label: "Mild Thinness", risk: "Moderate Nutritional Risk", tone: "warning", clinicalImplication: "Mildly reduced body mass. Monitor for unintentional weight loss." };
        if (bmi < 25.0)
            return { label: "Normal Weight", risk: "Low Risk (Optimal Health Range)", tone: "success", clinicalImplication: "Lowest statistical risk for cardiovascular disease, type 2 diabetes, and all-cause mortality." };
        if (bmi < 30.0)
            return { label: "Overweight (Pre-Obesity)", risk: "Moderate Metabolic Risk", tone: "warning", clinicalImplication: "Increased risk of dyslipidemia, hypertension, insulin resistance, and hepatic steatosis (NAFLD)." };
        if (bmi < 35.0)
            return { label: "Obese Class I (Moderate)", risk: "High Cardiovascular Risk", tone: "danger", clinicalImplication: "Elevated risk of ASCVD, obstructive sleep apnea (OSA), and osteoarthritis. Lifestyle and pharmacotherapy indicated." };
        if (bmi < 40.0)
            return { label: "Obese Class II (Severe)", risk: "Very High Cardiovascular & Metabolic Risk", tone: "danger", clinicalImplication: "Substantial morbidity risk. Comprehensive medical management and bariatric evaluation indicated." };
        return { label: "Obese Class III (Morbid / Extreme)", risk: "Extremely High Mortality Risk", tone: "danger", clinicalImplication: "Extreme ASCVD, heart failure, and venous thromboembolism risk. Bariatric surgical candidate." };
    }
    // Asian-Pacific criteria (WHO Western Pacific Region)
    if (bmi < 18.5)
        return { label: "Underweight (Asian Cutoff)", risk: "Moderate Risk", tone: "warning", clinicalImplication: "Nutritional deficiency screening recommended." };
    if (bmi < 23.0)
        return { label: "Normal Weight (Asian Cutoff)", risk: "Low Risk", tone: "success", clinicalImplication: "Optimal metabolic risk window for Asian populations." };
    if (bmi < 27.5)
        return { label: "Overweight / Pre-Obese (Asian Cutoff)", risk: "Moderate to High Risk", tone: "warning", clinicalImplication: "Increased visceral adiposity and insulin resistance at lower BMI in Asian adults." };
    return { label: "Obese (Asian Cutoff >= 27.5)", risk: "High to Very High Risk", tone: "danger", clinicalImplication: "Significant cardiometabolic risk at BMI >= 27.5 kg/m²." };
}

/** A dosing-weight row with a one-line note on what it is used for. */
function WeightRow({ label, note, value, unit }: { label: string; note: string; value: number | string; unit: string }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b border-border/70 py-3 last:border-b-0">
            <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{label}</span>
                <span className="block text-xs text-muted-foreground">{note}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap text-[15px] font-semibold tabular-nums tracking-[-0.01em] text-foreground">
                {value}
                <span className="font-mono text-xs font-normal text-muted-foreground">{unit}</span>
            </span>
        </div>
    );
}

export default function BMICalculator() {
    const [height, setHeight] = useState("175");
    const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
    const [weight, setWeight] = useState("75");
    const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
    const [sex, setSex] = useState<Sex>("male");
    const [population, setPopulation] = useState<BMIPopulation>("who_standard");
    const [copied, setCopied] = useState(false);

    /* ── Normalisation (verbatim from the original, including its 0.1 rounding) ── */
    const rawH = parseFloat(height) || 0;
    const rawW = parseFloat(weight) || 0;

    const heightCm = useMemo(() => {
        if (heightUnit === "in") return Math.round(rawH * 2.54 * 10) / 10;
        return rawH;
    }, [rawH, heightUnit]);

    const heightInches = useMemo(() => {
        if (heightUnit === "cm") return heightCm / 2.54;
        return rawH;
    }, [heightCm, rawH, heightUnit]);

    const weightKg = useMemo(() => {
        if (weightUnit === "lbs") return Math.round(rawW * 0.453592 * 10) / 10;
        return rawW;
    }, [rawW, weightUnit]);

    const weightLbs = useMemo(() => {
        if (weightUnit === "kg") return Math.round(weightKg * 2.20462 * 10) / 10;
        return rawW;
    }, [weightKg, rawW, weightUnit]);

    /* ── Calculations (verbatim) ─────────────────────────────────────────────── */
    const calculations = useMemo(() => {
        if (heightCm <= 0 || weightKg <= 0) return null;

        const heightM = heightCm / 100;
        const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

        const categoryData = classify(bmi, population);

        // Ideal body weight equations
        const baseDevine = sex === "male" ? 50.0 : 45.5;
        const diffInches = heightInches - 60;
        const ibwDevine = Math.round((baseDevine + 2.3 * diffInches) * 10) / 10;

        const baseRobinson = sex === "male" ? 52.0 : 49.0;
        const multRobinson = sex === "male" ? 1.9 : 1.7;
        const ibwRobinson = Math.round((baseRobinson + multRobinson * diffInches) * 10) / 10;

        const baseHamwi = sex === "male" ? 48.0 : 45.5;
        const multHamwi = sex === "male" ? 2.7 : 2.2;
        const ibwHamwi = Math.round((baseHamwi + multHamwi * diffInches) * 10) / 10;

        // Adjusted body weight (40%)
        const adjBw = weightKg > ibwDevine ? Math.round((ibwDevine + 0.4 * (weightKg - ibwDevine)) * 10) / 10 : weightKg;

        // Lean body mass (Boer)
        const lbmBoer =
            sex === "male"
                ? Math.round((0.407 * weightKg + 0.267 * heightCm - 19.2) * 10) / 10
                : Math.round((0.252 * weightKg + 0.473 * heightCm - 48.3) * 10) / 10;

        // Body surface area (Mosteller)
        const bsaMosteller = Math.round(Math.sqrt((heightCm * weightKg) / 3600) * 100) / 100;

        // Healthy weight range (BMI 18.5 – 24.9)
        const healthyWeightMinKg = Math.round(18.5 * heightM * heightM * 10) / 10;
        const healthyWeightMaxKg = Math.round(24.9 * heightM * heightM * 10) / 10;

        let weightDeltaMsg = "";
        if (weightKg > healthyWeightMaxKg) {
            const toLose = Math.round((weightKg - healthyWeightMaxKg) * 10) / 10;
            weightDeltaMsg = `Reduce ${toLose} kg (${Math.round(toLose * 2.20462)} lbs) to reach normal BMI (≤ 24.9)`;
        } else if (weightKg < healthyWeightMinKg) {
            const toGain = Math.round((healthyWeightMinKg - weightKg) * 10) / 10;
            weightDeltaMsg = `Gain ${toGain} kg (${Math.round(toGain * 2.20462)} lbs) to reach normal BMI (≥ 18.5)`;
        } else {
            weightDeltaMsg = "Current weight is within the healthy physiological reference range.";
        }

        return {
            bmi,
            categoryData,
            ibwDevine,
            ibwRobinson,
            ibwHamwi,
            adjBw,
            lbmBoer,
            bsaMosteller,
            healthyWeightMinKg,
            healthyWeightMaxKg,
            weightDeltaMsg,
        };
    }, [heightCm, heightInches, weightKg, sex, population]);

    const loadPreset = (p: PatientPreset) => {
        setHeight(p.height);
        setHeightUnit(p.heightUnit);
        setWeight(p.weight);
        setWeightUnit(p.weightUnit);
        setSex(p.sex);
        setPopulation(p.population);
    };

    const reset = () => {
        setHeight("175");
        setHeightUnit("cm");
        setWeight("75");
        setWeightUnit("kg");
        setSex("male");
        setPopulation("who_standard");
    };

    const copyConsultNote = useCallback(async () => {
        if (!calculations) return;

        const note = `=== CLINICAL ANTHROPOMETRIC & BODY COMPOSITION CONSULT ===
PATIENT ANTHROPOMETRICS:
- Height: ${heightCm} cm (${rawH} ${heightUnit}) | Weight: ${weightKg} kg (${rawW} ${weightUnit})
- Biological Sex: ${sex.toUpperCase()} | Population Standard: ${population === "who_standard" ? "WHO International" : "WHO Asian-Pacific"}

BODY MASS INDEX (BMI):
- CALCULATED BMI: ${calculations.bmi} kg/m²
- Classification: ${calculations.categoryData.label}
- Cardiovascular / Metabolic Risk: ${calculations.categoryData.risk}
- Healthy Weight Target (BMI 18.5–24.9): ${calculations.healthyWeightMinKg} – ${calculations.healthyWeightMaxKg} kg
- Weight Adjustment Goal: ${calculations.weightDeltaMsg}

PHARMACOKINETIC BODY WEIGHTS & SURFACE AREA:
- Ideal Body Weight (Devine 1974): ${calculations.ibwDevine} kg (Gold standard for CrCl & drug dosing)
- Ideal Body Weight (Robinson 1983): ${calculations.ibwRobinson} kg
- Ideal Body Weight (Hamwi 1964): ${calculations.ibwHamwi} kg
- Adjusted Body Weight (AdjBW 40%): ${calculations.adjBw} kg (For obese dosing)
- Lean Body Mass (Boer Formula): ${calculations.lbmBoer} kg
- Body Surface Area (Mosteller): ${calculations.bsaMosteller} m²

CLINICAL IMPLICATION:
${calculations.categoryData.clinicalImplication}
Generated: ${new Date().toLocaleString()}`;

        try {
            await navigator.clipboard.writeText(note);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2400);
        } catch {
            // No clipboard access (insecure context / old WebView): nothing to do.
        }
    }, [calculations, heightCm, rawH, heightUnit, weightKg, rawW, weightUnit, sex, population]);

    const heightHint =
        heightCm > 0
            ? heightUnit === "in"
                ? `≈ ${heightCm} cm`
                : `≈ ${heightInches.toFixed(1)} in`
            : "Standing height without shoes.";
    const weightHint =
        weightKg > 0
            ? weightUnit === "lbs"
                ? `≈ ${weightKg} kg (rounded to 0.1 kg for the calculation)`
                : `≈ ${weightLbs} lbs`
            : "Current body weight.";

    return (
        <CalculatorShell
            title="BMI & Anthropometric Calculator"
            subtitle="Calculates body mass index (BMI) with WHO or Asian-Pacific classification, plus ideal, adjusted and lean body weight and body surface area for drug dosing."
            icon={Scale}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            BMI (body mass index) relates weight to height and is the standard screening
                            measure for under- and overweight. Pharmacists also need the weights used for
                            dosing — ideal body weight (IBW), adjusted body weight (AdjBW) and lean body
                            mass — and body surface area (BSA). All are calculated here from the same
                            height and weight.
                        </p>
                        <CalcList
                            title="How to use it"
                            items={[
                                "Enter height (cm or in) and weight (kg or lbs), and choose biological sex — the IBW equations need it.",
                                "Choose WHO International cut-offs, or Asian-Pacific cut-offs (lower thresholds for metabolic risk).",
                                "Read the BMI class, then the dosing weights; copy the consult note if you need it in a record.",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Limits of BMI"
                            items={[
                                "It is a population screening metric, not a diagnosis.",
                                "It can overestimate adiposity in muscular athletes.",
                                "It can underestimate body fat in elderly or sarcopenic patients with reduced muscle mass.",
                                "Assess waist circumference and metabolic labs (HbA1c, lipid panel) alongside it.",
                                "Not for children or pregnancy — use age- and sex-specific growth charts.",
                            ]}
                        />
                        <p className="text-xs italic">
                            Classification: World Health Organization (WHO) Technical Report Series 854; WHO
                            Western Pacific Region criteria for Asian-Pacific cut-offs.
                        </p>
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch
                label="Population cut-offs"
                value={population}
                onChange={setPopulation}
                options={[
                    { value: "who_standard", label: "WHO International", description: "Overweight ≥ 25, obese ≥ 30" },
                    { value: "who_asian", label: "WHO Asian-Pacific", description: "Overweight ≥ 23, obese ≥ 27.5" },
                ]}
            />

            <ResultCard
                label="Body mass index (BMI)"
                value={calculations ? String(calculations.bmi) : null}
                unit="kg/m²"
                interpretation={calculations ? `${calculations.categoryData.label} — ${calculations.categoryData.risk}` : undefined}
                tone={calculations?.categoryData.tone ?? "neutral"}
                empty="Enter height and weight to calculate BMI."
            />

            <CalcSection title="Measurements">
                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/90">Biological sex (needed for IBW and lean body mass)</p>
                    <ModeSwitch
                        label="Biological sex"
                        value={sex}
                        onChange={setSex}
                        options={[
                            { value: "male", label: "Male", description: "Devine IBW base 50 kg" },
                            { value: "female", label: "Female", description: "Devine IBW base 45.5 kg" },
                        ]}
                    />
                </div>

                <FieldGrid>
                    <NumberField
                        label="Height"
                        value={height}
                        onChange={setHeight}
                        units={["cm", "in"]}
                        unit={heightUnit}
                        onUnitChange={(next) => setHeightUnit(next as HeightUnit)}
                        step="0.5"
                        min={1}
                        placeholder="e.g. 175"
                        hint={heightHint}
                        error={positiveError(height, "Height")}
                    />
                    <NumberField
                        label="Weight"
                        value={weight}
                        onChange={setWeight}
                        units={["kg", "lbs"]}
                        unit={weightUnit}
                        onUnitChange={(next) => setWeightUnit(next as WeightUnit)}
                        step="0.5"
                        min={1}
                        placeholder="e.g. 75"
                        hint={weightHint}
                        error={positiveError(weight, "Weight")}
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example patient</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_PATIENTS.map((p) => (
                            <button
                                key={p.name}
                                type="button"
                                onClick={() => loadPreset(p)}
                                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border bg-background px-3 py-2 text-xs font-medium hover:bg-muted active:bg-accent"
                            >
                                {p.name}
                                <span className="font-mono text-[11px] text-muted-foreground">
                                    {p.tag} ({p.sex === "male" ? "M" : "F"})
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

            {calculations && (
                <CalcSection title="Where this BMI sits" description="Position on the BMI spectrum and the healthy weight for this height.">
                    <div className="px-1 pb-1 pt-7">
                        <div className="relative">
                            <div
                                className="h-3 w-full rounded-full"
                                style={{ background: "linear-gradient(90deg,#93c5fd 0%,#34d399 25%,#facc15 45%,#fb923c 62%,#ef4444 100%)" }}
                                aria-hidden="true"
                            />
                            <div
                                className="absolute -top-7 -translate-x-1/2 transition-[left] duration-300"
                                style={{ left: `${gaugePct(calculations.bmi)}%` }}
                                role="img"
                                aria-label={`BMI ${calculations.bmi} on a scale from ${GAUGE_MIN} to ${GAUGE_MAX}`}
                            >
                                <div className="whitespace-nowrap rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-primary-foreground shadow-sm">
                                    {calculations.bmi}
                                </div>
                                <div className="mx-auto h-5 w-0.5 bg-primary" />
                            </div>
                            <div className="relative mt-1.5 h-4 font-mono text-[11px] text-muted-foreground">
                                {GAUGE_TICKS.map((t) => (
                                    <span
                                        key={t}
                                        className="absolute -translate-x-1/2 tabular-nums first:translate-x-0"
                                        style={{ left: `${gaugePct(t)}%` }}
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <WeightRow
                            label="Healthy weight range"
                            note="BMI 18.5–24.9 at this height"
                            value={`${calculations.healthyWeightMinKg} – ${calculations.healthyWeightMaxKg}`}
                            unit="kg"
                        />
                    </div>
                    <LabNotice tone="info" title={calculations.weightDeltaMsg}>
                        {calculations.categoryData.clinicalImplication}
                    </LabNotice>
                </CalcSection>
            )}

            {calculations && (
                <CalcSection
                    title="Dosing weights & body composition"
                    description="The weights pharmacokinetic dosing and creatinine clearance equations call for."
                >
                    {heightInches < 60 && (
                        <LabNotice tone="warning" title="Height under 5 ft (152.4 cm)">
                            The Devine, Robinson and Hamwi equations were built for adults of at least 60 inches;
                            below that they extrapolate and can give implausible (even negative) weights.
                        </LabNotice>
                    )}
                    <div>
                        <WeightRow label="Devine IBW (1974)" note="CrCl & vancomycin standard" value={calculations.ibwDevine} unit="kg" />
                        <WeightRow label="Adjusted body weight (40%)" note="Obese aminoglycoside dosing" value={calculations.adjBw} unit="kg" />
                        <WeightRow label="Lean body mass (Boer)" note="Fat-free mass estimate" value={calculations.lbmBoer} unit="kg" />
                        <WeightRow label="Robinson IBW (1983)" note="Alternative equation" value={calculations.ibwRobinson} unit="kg" />
                        <WeightRow label="Hamwi IBW (1964)" note="Dietetics reference" value={calculations.ibwHamwi} unit="kg" />
                        <WeightRow label="BSA (Mosteller)" note="Chemotherapy & cardiac index" value={calculations.bsaMosteller} unit="m²" />
                    </div>

                    <Button variant="outline" onClick={copyConsultNote} className="w-full">
                        {copied ? <Check /> : <Copy />}
                        {copied ? "Consult note copied" : "Copy consult note"}
                    </Button>
                </CalcSection>
            )}

            <CalcSection title="WHO weight classification" description="Adult BMI bands used by the WHO International setting.">
                <div className="overflow-x-auto rounded-xl border border-border/80">
                    <table className="w-full min-w-[320px] text-left text-sm">
                        <thead className="border-b border-border/80 bg-muted/60 text-xs text-muted-foreground">
                            <tr>
                                <th className="px-3 py-2.5 font-medium">Classification</th>
                                <th className="px-3 py-2.5 font-medium">BMI (kg/m²)</th>
                                <th className="px-3 py-2.5 font-medium">Health risk</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/70">
                            {WHO_TABLE.map((row) => {
                                const normal = row.label === "Normal Weight";
                                return (
                                    <tr key={row.label} className={normal ? "bg-emerald-50 font-semibold text-emerald-900" : "text-foreground"}>
                                        <td className="px-3 py-2">{row.label}</td>
                                        <td className="whitespace-nowrap px-3 py-2 tabular-nums">{row.range}</td>
                                        <td className={normal ? "px-3 py-2" : "px-3 py-2 text-muted-foreground"}>{row.risk}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="text-xs text-muted-foreground">
                    Asian-Pacific cut-offs: underweight &lt; 18.5, normal 18.5–22.9, overweight 23–27.4, obese ≥ 27.5.
                </p>
            </CalcSection>

            <FormulaNote>
                <Formula>BMI = weight (kg) ÷ [height (m)]²</Formula>
                <p>The Quetelet index. Weights in lbs and heights in inches are converted and rounded to 0.1 kg / 0.1 cm first; BMI is rounded to one decimal.</p>
                <Formula>
                    Devine IBW — male: 50.0 + 2.3 × (height in inches − 60)
                    <br />
                    Devine IBW — female: 45.5 + 2.3 × (height in inches − 60)
                </Formula>
                <p>The usual ideal body weight for drug dosing and creatinine clearance.</p>
                <Formula>
                    Robinson IBW — male: 52 + 1.9 × (in − 60) · female: 49 + 1.7 × (in − 60)
                    <br />
                    Hamwi IBW — male: 48 + 2.7 × (in − 60) · female: 45.5 + 2.2 × (in − 60)
                </Formula>
                <Formula>AdjBW = IBW + 0.4 × (actual weight − IBW)</Formula>
                <p>Uses Devine IBW. If actual weight is at or below IBW, the actual weight is shown.</p>
                <Formula>
                    Boer LBM — male: 0.407 × weight (kg) + 0.267 × height (cm) − 19.2
                    <br />
                    Boer LBM — female: 0.252 × weight (kg) + 0.473 × height (cm) − 48.3
                </Formula>
                <Formula>BSA (Mosteller) = √[height (cm) × weight (kg) ÷ 3600]</Formula>
                <p>The healthy weight range is the weight that gives a BMI of 18.5 to 24.9 at this height.</p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Which weight should I use for drug dosing?",
                        a: "It depends on the drug. Many hydrophilic drugs and creatinine clearance use ideal body weight (IBW); aminoglycosides in obese patients use adjusted body weight; some drugs use actual or lean body weight; chemotherapy is often dosed by BSA. Always follow the drug's monograph.",
                    },
                    {
                        q: "Why use Asian-Pacific cut-offs?",
                        a: "Asian adults tend to carry more visceral fat and develop diabetes and cardiovascular disease at a lower BMI. The WHO Western Pacific Region criteria lower the overweight threshold to 23 and obese to 27.5 kg/m² to reflect that risk.",
                    },
                    {
                        q: "Why is adjusted body weight the same as my weight?",
                        a: "AdjBW is only meaningful when actual weight exceeds ideal body weight. If you weigh the same as or less than your Devine IBW, the calculator shows your actual weight.",
                    },
                    {
                        q: "Why do the three IBW equations disagree?",
                        a: "Devine, Robinson and Hamwi were derived from different data sets and for different purposes. Devine is the one most drug-dosing references assume; the others are shown for comparison.",
                    },
                    {
                        q: "Can I use BMI for children?",
                        a: "No. Children's BMI must be interpreted against age- and sex-specific percentile charts. The bands on this page are for adults.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
