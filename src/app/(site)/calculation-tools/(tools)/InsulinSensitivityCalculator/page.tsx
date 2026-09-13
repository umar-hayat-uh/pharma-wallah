"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, RefreshCw, Scale, Syringe } from "lucide-react";
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
    LabNotice,
} from "@/components/calculators";

type RuleISF = "1500" | "1700" | "1800" | "2000" | "2200";
type RuleICR = "300" | "400" | "450" | "500";
type GlucoseUnit = "mg/dL" | "mmol/L";
type WeightUnit = "kg" | "lbs";

interface PatientPreset {
    name: string;
    tag: string;
    tdd: string;
    weight: string;
    weightUnit: WeightUnit;
    isfRule: RuleISF;
    icrRule: RuleICR;
    targetBg: string;
    currentBg: string;
    carbs: string;
}

interface InsulinCalculationResult {
    tdd: number;
    weightKg: number;
    isfMgDl: number;
    isfMmol: number;
    activeISF: number;
    icrGramsPerUnit: number;
    basalTotal: number;
    bolusTotal: number;
    estimatedPerMealBolus: number;
    correctionDose: number;
    mealDose: number;
    totalDose: number;
    mealFraction: number;
    correctionFraction: number;
    isHypoglycemic: boolean;
    sensitivityLabel: string;
}

// Conversion constant (unchanged)
const MMOL_CONVERSION_FACTOR = 18.0182;

const SAMPLE_PATIENTS: PatientPreset[] = [
    { name: "Adult type 1", tag: "TDD 50 U", tdd: "50", weight: "70", weightUnit: "kg", isfRule: "1800", icrRule: "500", targetBg: "110", currentBg: "210", carbs: "60" },
    { name: "Sensitive / honeymoon", tag: "TDD 24 U", tdd: "24", weight: "55", weightUnit: "kg", isfRule: "2000", icrRule: "500", targetBg: "100", currentBg: "180", carbs: "45" },
    { name: "Insulin resistant (T2D)", tag: "TDD 95 U", tdd: "95", weight: "95", weightUnit: "kg", isfRule: "1500", icrRule: "300", targetBg: "120", currentBg: "240", carbs: "75" },
    { name: "Adolescent (puberty)", tag: "TDD 65 U", tdd: "65", weight: "60", weightUnit: "kg", isfRule: "1700", icrRule: "400", targetBg: "110", currentBg: "220", carbs: "80" },
    { name: "Elderly, mild T2D", tag: "TDD 32 U", tdd: "32", weight: "68", weightUnit: "kg", isfRule: "1800", icrRule: "500", targetBg: "130", currentBg: "190", carbs: "40" },
];

const ISF_RULES: RuleISF[] = ["1500", "1700", "1800", "2000", "2200"];
const ICR_RULES: RuleICR[] = ["300", "400", "450", "500"];

export default function InsulinDoseCalculator() {
    // Core parameters
    const [totalDailyDose, setTotalDailyDose] = useState<string>("50");
    const [weight, setWeight] = useState<string>("70");
    const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
    const [tddMultiplier, setTddMultiplier] = useState<string>("0.55");

    // Rules & units
    const [ruleISF, setRuleISF] = useState<RuleISF>("1800");
    const [ruleICR, setRuleICR] = useState<RuleICR>("500");
    const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>("mg/dL");

    // Pre-meal glucose & meal
    const [targetGlucose, setTargetGlucose] = useState<string>("110");
    const [currentGlucose, setCurrentGlucose] = useState<string>("210");
    const [carbIntake, setCarbIntake] = useState<string>("60");

    const [copied, setCopied] = useState<boolean>(false);

    /* ── Parsed inputs (unchanged) ────────────────────────────────────────── */
    const weightKg = useMemo(() => {
        const raw = parseFloat(weight);
        if (isNaN(raw) || raw <= 0) return 0;
        return weightUnit === "lbs" ? raw * 0.453592 : raw;
    }, [weight, weightUnit]);

    const tddNum = useMemo(() => {
        const raw = parseFloat(totalDailyDose);
        return isNaN(raw) || raw <= 0 ? 0 : raw;
    }, [totalDailyDose]);

    const targetBgNum = useMemo(() => {
        const raw = parseFloat(targetGlucose);
        return isNaN(raw) || raw <= 0 ? 0 : raw;
    }, [targetGlucose]);

    const currentBgNum = useMemo(() => {
        const raw = parseFloat(currentGlucose);
        return isNaN(raw) || raw <= 0 ? 0 : raw;
    }, [currentGlucose]);

    const carbsNum = useMemo(() => {
        const raw = parseFloat(carbIntake);
        return isNaN(raw) || raw < 0 ? 0 : raw;
    }, [carbIntake]);

    /* ── Dose calculation (unchanged) ─────────────────────────────────────── */
    const calculations = useMemo<InsulinCalculationResult | null>(() => {
        if (tddNum <= 0) return null;

        // 1. ISF in mg/dL: Rule / TDD; in mmol/L: ISF / 18.0182
        const isfMgDl = parseInt(ruleISF, 10) / tddNum;
        const isfMmol = isfMgDl / MMOL_CONVERSION_FACTOR;
        const activeISF = glucoseUnit === "mg/dL" ? isfMgDl : isfMmol;

        // 2. ICR (grams of carbohydrate covered by 1 unit): Rule / TDD
        const icrGramsPerUnit = parseInt(ruleICR, 10) / tddNum;

        // 3. Basal / bolus 50:50 split
        const basalTotal = tddNum * 0.5;
        const bolusTotal = tddNum * 0.5;
        const estimatedPerMealBolus = bolusTotal / 3;

        // 4. Correction dose: (current BG − target BG) / ISF
        const bgDelta = currentBgNum - targetBgNum;
        let correctionDose = 0;
        let isHypoglycemic = false;

        // Hypoglycaemia threshold (< 70 mg/dL or < 3.9 mmol/L)
        if (glucoseUnit === "mg/dL" && currentBgNum < 70 && currentBgNum > 0) {
            isHypoglycemic = true;
        } else if (glucoseUnit === "mmol/L" && currentBgNum < 3.9 && currentBgNum > 0) {
            isHypoglycemic = true;
        }

        if (bgDelta > 0 && activeISF > 0 && !isHypoglycemic) {
            correctionDose = bgDelta / activeISF;
        }

        // 5. Meal dose: carbs (g) / ICR
        let mealDose = 0;
        if (carbsNum > 0 && icrGramsPerUnit > 0) {
            mealDose = carbsNum / icrGramsPerUnit;
        }

        // 6. Total bolus
        const totalDose = correctionDose + mealDose;
        const mealFraction = totalDose > 0 ? (mealDose / totalDose) * 100 : 0;
        const correctionFraction = totalDose > 0 ? (correctionDose / totalDose) * 100 : 0;

        // 7. Sensitivity classification
        let sensitivityLabel = "Average Sensitivity";
        if (isfMgDl > 50) sensitivityLabel = "Highly Sensitive";
        else if (isfMgDl >= 30) sensitivityLabel = "Average Sensitivity";
        else if (isfMgDl >= 18) sensitivityLabel = "Moderate Resistance";
        else sensitivityLabel = "Severe Resistance";

        return {
            tdd: tddNum,
            weightKg,
            isfMgDl,
            isfMmol,
            activeISF,
            icrGramsPerUnit,
            basalTotal,
            bolusTotal,
            estimatedPerMealBolus,
            correctionDose,
            mealDose,
            totalDose,
            mealFraction,
            correctionFraction,
            isHypoglycemic,
            sensitivityLabel,
        };
    }, [tddNum, ruleISF, ruleICR, glucoseUnit, currentBgNum, targetBgNum, carbsNum, weightKg]);

    // Estimate TDD from body weight (unchanged)
    const handleEstimateTDD = () => {
        if (weightKg > 0) {
            const mult = parseFloat(tddMultiplier) || 0.55;
            const estimated = weightKg * mult;
            setTotalDailyDose(estimated.toFixed(1));
        }
    };

    // Switching glucose units converts the typed values (unchanged)
    const handleToggleGlucoseUnit = (unit: GlucoseUnit) => {
        if (unit === glucoseUnit) return;
        setGlucoseUnit(unit);

        if (unit === "mmol/L") {
            if (targetBgNum > 0) setTargetGlucose((targetBgNum / MMOL_CONVERSION_FACTOR).toFixed(1));
            if (currentBgNum > 0) setCurrentGlucose((currentBgNum / MMOL_CONVERSION_FACTOR).toFixed(1));
        } else {
            if (targetBgNum > 0) setTargetGlucose(Math.round(targetBgNum * MMOL_CONVERSION_FACTOR).toString());
            if (currentBgNum > 0) setCurrentGlucose(Math.round(currentBgNum * MMOL_CONVERSION_FACTOR).toString());
        }
    };

    const handleLoadPreset = (p: PatientPreset) => {
        setTotalDailyDose(p.tdd);
        setWeight(p.weight);
        setWeightUnit(p.weightUnit);
        setRuleISF(p.isfRule);
        setRuleICR(p.icrRule);
        setCarbIntake(p.carbs);

        if (glucoseUnit === "mmol/L") {
            setTargetGlucose((parseFloat(p.targetBg) / MMOL_CONVERSION_FACTOR).toFixed(1));
            setCurrentGlucose((parseFloat(p.currentBg) / MMOL_CONVERSION_FACTOR).toFixed(1));
        } else {
            setTargetGlucose(p.targetBg);
            setCurrentGlucose(p.currentBg);
        }
    };

    const handleReset = () => {
        setTotalDailyDose("50");
        setWeight("70");
        setWeightUnit("kg");
        setTddMultiplier("0.55");
        setRuleISF("1800");
        setRuleICR("500");
        setGlucoseUnit("mg/dL");
        setTargetGlucose("110");
        setCurrentGlucose("210");
        setCarbIntake("60");
    };

    // Consult note — text unchanged from the previous page.
    const handleCopyConsultNote = useCallback(() => {
        if (!calculations) return;

        const note = `=== CLINICAL DIABETES INSULIN DOSE CONSULT ===
PATIENT PARAMETERS:
- Total Daily Dose (TDD): ${tddNum} Units/day (Body Weight: ${weightKg.toFixed(1)} kg | ~${(tddNum / (weightKg || 1)).toFixed(2)} U/kg)
- Basal Insulin (50%): ${calculations.basalTotal.toFixed(1)} Units (e.g., Glargine / Degludec once daily)
- Total Bolus Split (50%): ${calculations.bolusTotal.toFixed(1)} Units (~${calculations.estimatedPerMealBolus.toFixed(1)} U per meal)

SENSITIVITY & CARB RATIOS:
- Insulin Sensitivity Factor (ISF): 1 Unit drops BG by ${calculations.isfMgDl.toFixed(1)} mg/dL (${calculations.isfMmol.toFixed(1)} mmol/L) [Rule of ${ruleISF}]
- Insulin-to-Carb Ratio (ICR): 1 Unit covers ${calculations.icrGramsPerUnit.toFixed(1)} grams carb [Rule of ${ruleICR}]
- Sensitivity Classification: ${calculations.sensitivityLabel}

ACTIVE MEAL DOSE CALCULATION:
- Blood Glucose: Current ${currentBgNum} ${glucoseUnit} -> Target ${targetBgNum} ${glucoseUnit}
- Meal Carbohydrates: ${carbsNum} grams
- Carbohydrate Meal Bolus: ${calculations.mealDose.toFixed(1)} Units
- Hyperglycemia Correction Bolus: ${calculations.correctionDose.toFixed(1)} Units
- TOTAL RECOMMENDED RAPID-ACTING DOSE: ${calculations.totalDose.toFixed(1)} Units

SAFETY NOTICE:
${calculations.isHypoglycemic ? "ALERT: Hypoglycemia detected. Do not dose correction insulin. Administer 15g fast-acting carbs (Rule of 15)." : "Standard administration. Adjust for exercise, illness, and CGM trends."}
Generated: ${new Date().toLocaleString()}`;

        try {
            navigator.clipboard.writeText(note);
            setCopied(true);
            setTimeout(() => setCopied(false), 2400);
        } catch {
            // No clipboard in this context (insecure origin, old WebView).
        }
    }, [calculations, tddNum, weightKg, ruleISF, ruleICR, currentBgNum, targetBgNum, carbsNum, glucoseUnit]);

    /* ── Display helpers ─────────────────────────────────────────────────── */
    const isMmol = glucoseUnit === "mmol/L";
    // Weight × multiplier preview, exactly as the previous page computed it.
    const estimatePreview = ((parseFloat(weight) || 0) * (parseFloat(tddMultiplier) || 0.55)).toFixed(1);
    const bgDeltaShown = Math.max(0, currentBgNum - targetBgNum);

    const negativeError = (raw: string, name: string) =>
        raw.trim() !== "" && parseFloat(raw) < 0 ? `${name} cannot be negative.` : undefined;
    const tddError =
        totalDailyDose.trim() !== "" && parseFloat(totalDailyDose) <= 0 ? "TDD must be greater than 0." : undefined;

    return (
        <CalculatorShell
            title="Insulin Dose & Sensitivity Calculator"
            subtitle="Works out the insulin sensitivity factor, insulin-to-carb ratio and a pre-meal rapid-acting bolus from the total daily insulin dose."
            icon={Syringe}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About this calculator">
                        <p>
                            Basal-bolus insulin regimens use two numbers derived from the total daily dose (TDD):
                            the insulin sensitivity factor (ISF — how far 1 unit of rapid-acting insulin lowers
                            blood glucose) and the insulin-to-carbohydrate ratio (ICR — how many grams of carbohydrate
                            1 unit covers). The pre-meal bolus is a meal dose plus a correction dose.
                        </p>
                        <CalcList
                            title="How to use it"
                            items={[
                                "Enter the known 24-hour insulin total, or estimate it from body weight (0.4–1.0 units/kg)",
                                "Pick the ISF rule (1800 for rapid-acting, 1500 for regular insulin) and the ICR rule (500 or 450)",
                                "Enter current glucose, target glucose and the meal's carbohydrate to get the bolus",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Keep in mind"
                            items={[
                                "Insulin sensitivity changes with physical activity, acute illness, emotional stress and insulin on board (IOB). Check CGM trends before giving stacked correction boluses.",
                                "Below 70 mg/dL (3.9 mmol/L) no correction dose is calculated — treat hypoglycaemia first.",
                                "The rules give starting estimates. Real ratios are adjusted from the patient's glucose records.",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Total rapid-acting bolus"
                value={calculations ? calculations.totalDose.toFixed(1) : null}
                unit="units"
                interpretation={
                    calculations
                        ? `${calculations.mealDose.toFixed(1)} U meal + ${calculations.correctionDose.toFixed(1)} U correction`
                        : undefined
                }
                tone={calculations?.isHypoglycemic ? "danger" : "neutral"}
                empty="Enter a total daily dose (TDD) above 0 to calculate."
            />

            {calculations?.isHypoglycemic && (
                <LabNotice tone="danger" title="Hypoglycaemia alert — do not give a correction dose">
                    Blood glucose is below safe limits (under 70 mg/dL or under 3.9 mmol/L). Treat immediately with{" "}
                    <strong>15 grams of fast-acting glucose</strong> (4 oz juice, 3-4 glucose tablets) and re-check
                    blood glucose in 15 minutes (Rule of 15).
                </LabNotice>
            )}

            <CalcSection title="Total daily dose (TDD)" description="All insulin in 24 hours — basal plus every meal bolus.">
                <FieldGrid>
                    <NumberField
                        label="Known total daily dose"
                        value={totalDailyDose}
                        onChange={setTotalDailyDose}
                        unit="U/day"
                        step="1"
                        min={0}
                        placeholder="e.g. 50"
                        hint="Sum of 24-hr basal + meal boluses. Or estimate it from weight below."
                        error={tddError}
                    />
                </FieldGrid>

                <div className="space-y-3 rounded-xl border border-border/80 bg-muted/30 p-3.5">
                    <p className="flex items-center gap-2 text-[13px] font-medium text-foreground">
                        <Scale className="h-4 w-4 text-primary" />
                        Estimate TDD from body weight
                    </p>
                    <FieldGrid>
                        <NumberField
                            label="Body weight"
                            value={weight}
                            onChange={setWeight}
                            units={["kg", "lbs"]}
                            unit={weightUnit}
                            onUnitChange={(next) => setWeightUnit(next as WeightUnit)}
                            step="0.5"
                            min={0}
                            placeholder="e.g. 70"
                            error={negativeError(weight, "Weight")}
                        />
                        <SelectField
                            label="Units per kg"
                            value={tddMultiplier}
                            onChange={setTddMultiplier}
                            options={[
                                { value: "0.4", label: "0.4 U/kg (Sensitive)" },
                                { value: "0.55", label: "0.55 U/kg (Standard)" },
                                { value: "0.7", label: "0.7 U/kg (Resistant)" },
                                { value: "1.0", label: "1.0 U/kg (High)" },
                            ]}
                        />
                    </FieldGrid>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            Calculates ~{estimatePreview} Units for {weight} {weightUnit}
                        </p>
                        <Button variant="outline" onClick={handleEstimateTDD} className="sm:w-auto">
                            Use estimate as TDD
                        </Button>
                    </div>
                </div>

                {calculations && (
                    <div>
                        <ResultRow label="24-hr basal (50%) — e.g. glargine / degludec" value={calculations.basalTotal.toFixed(1)} unit="U" />
                        <ResultRow label="Total meal bolus (50%) — across 24 hours" value={calculations.bolusTotal.toFixed(1)} unit="U" />
                        <ResultRow label="Estimated per meal (3 meals)" value={`~${calculations.estimatedPerMealBolus.toFixed(1)}`} unit="U" />
                    </div>
                )}
            </CalcSection>

            <CalcSection title="Rules & glucose units">
                <ChipGroup
                    label="ISF rule (sensitivity)"
                    note={ruleISF === "1800" ? "Rapid-Acting" : ruleISF === "1500" ? "Regular Insulin" : "Custom"}
                    options={ISF_RULES}
                    value={ruleISF}
                    onChange={setRuleISF}
                    hint={`ISF = ${ruleISF} / TDD (mg/dL per unit). A higher rule number means more sensitive.`}
                />
                <ChipGroup
                    label="ICR rule (carb ratio)"
                    note={ruleICR === "500" ? "Rapid-Acting" : "Resistant / Regular"}
                    options={ICR_RULES}
                    value={ruleICR}
                    onChange={setRuleICR}
                    hint={`ICR = ${ruleICR} / TDD (grams of carbohydrate covered by 1 unit).`}
                />
                <ChipGroup
                    label="Glucose units"
                    options={["mg/dL", "mmol/L"] as GlucoseUnit[]}
                    value={glucoseUnit}
                    onChange={handleToggleGlucoseUnit}
                    hint="Switching converts the glucose values below (1 mmol/L = 18.0182 mg/dL)."
                />
            </CalcSection>

            <CalcSection title="Before the meal" description="Glucose from a fingerstick or CGM, and the meal's total carbohydrate.">
                <FieldGrid>
                    <NumberField
                        label={`Current glucose (${glucoseUnit})`}
                        value={currentGlucose}
                        onChange={setCurrentGlucose}
                        unit={glucoseUnit}
                        step="1"
                        min={0}
                        placeholder={isMmol ? "11.6" : "210"}
                        hint="Fingerstick or CGM reading now."
                        error={negativeError(currentGlucose, "Glucose")}
                    />
                    <NumberField
                        label={`Target glucose (${glucoseUnit})`}
                        value={targetGlucose}
                        onChange={setTargetGlucose}
                        unit={glucoseUnit}
                        step="1"
                        min={0}
                        placeholder={isMmol ? "6.1" : "110"}
                        hint={isMmol ? "Pre-meal target, often 4.4–7.2 mmol/L." : "Pre-meal target, often 80–130 mg/dL."}
                        error={negativeError(targetGlucose, "Glucose")}
                    />
                    <NumberField
                        label="Meal carbohydrate"
                        value={carbIntake}
                        onChange={setCarbIntake}
                        unit="g"
                        step="1"
                        min={0}
                        placeholder="e.g. 60"
                        hint="Total dietary carbohydrate in the meal."
                        error={negativeError(carbIntake, "Carbohydrate")}
                    />
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example patient</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_PATIENTS.map((p) => (
                            <button
                                key={p.name}
                                type="button"
                                onClick={() => handleLoadPreset(p)}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {p.name} · {p.tag}
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={handleReset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {calculations && (
                <CalcSection title="Working" description="Each step with the numbers plugged in.">
                    <div>
                        <ResultRow
                            label={`ISF = ${ruleISF} ÷ ${tddNum}`}
                            value={isMmol ? calculations.isfMmol.toFixed(1) : calculations.isfMgDl.toFixed(1)}
                            unit={`${glucoseUnit} per U`}
                            badge={calculations.sensitivityLabel}
                            badgeTone={
                                calculations.sensitivityLabel === "Highly Sensitive"
                                    ? "success"
                                    : calculations.sensitivityLabel === "Average Sensitivity"
                                      ? "secondary"
                                      : calculations.sensitivityLabel === "Moderate Resistance"
                                        ? "warning"
                                        : "destructive"
                            }
                        />
                        <ResultRow label={`ICR = ${ruleICR} ÷ ${tddNum}`} value={`1 : ${calculations.icrGramsPerUnit.toFixed(1)}`} unit="g" />
                        <ResultRow
                            label={`Meal dose = ${carbsNum} g ÷ ${calculations.icrGramsPerUnit.toFixed(1)}`}
                            value={calculations.mealDose.toFixed(1)}
                            unit="U"
                        />
                        <ResultRow
                            label={
                                calculations.isHypoglycemic
                                    ? "Correction dose — withheld (hypoglycaemia)"
                                    : `Correction = (${currentBgNum} − ${targetBgNum}) ÷ ${calculations.activeISF.toFixed(1)}  ·  Δ ${isMmol ? bgDeltaShown.toFixed(1) : bgDeltaShown.toFixed(0)} ${glucoseUnit}`
                            }
                            value={calculations.correctionDose.toFixed(1)}
                            unit="U"
                        />
                        <ResultRow
                            label="Total bolus = meal + correction"
                            value={calculations.totalDose.toFixed(1)}
                            unit="U"
                        />
                    </div>

                    {calculations.totalDose > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                                <span>Meal vs correction</span>
                                <span className="font-semibold text-foreground">
                                    {calculations.mealFraction.toFixed(0)}% meal / {calculations.correctionFraction.toFixed(0)}% correction
                                </span>
                            </div>
                            <div
                                className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
                                role="img"
                                aria-label={`${calculations.mealFraction.toFixed(0)}% meal, ${calculations.correctionFraction.toFixed(0)}% correction`}
                            >
                                <div style={{ width: `${calculations.mealFraction}%` }} className="h-full bg-emerald-500" />
                                <div style={{ width: `${calculations.correctionFraction}%` }} className="h-full bg-amber-400" />
                            </div>
                            <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                                <span>Meal dose ({calculations.mealDose.toFixed(1)} U)</span>
                                <span>Correction ({calculations.correctionDose.toFixed(1)} U)</span>
                            </div>
                        </div>
                    )}

                    <Button variant="outline" onClick={handleCopyConsultNote} className="w-full">
                        {copied ? <Check /> : <Copy />}
                        {copied ? "Consult note copied" : "Copy consult note"}
                    </Button>
                </CalcSection>
            )}

            <FormulaNote>
                <p className="font-medium text-foreground">1. Insulin sensitivity factor (ISF, correction factor)</p>
                <Formula>ISF = Rule (1500–2200) ÷ TDD   (mg/dL lowered per 1 unit) · mmol/L: ISF ÷ 18.0182</Formula>
                <p className="font-medium text-foreground">2. Insulin-to-carbohydrate ratio (ICR)</p>
                <Formula>ICR = Rule (300–500) ÷ TDD   (grams of carbohydrate covered per 1 unit)</Formula>
                <p className="font-medium text-foreground">3. Total bolus</p>
                <Formula>Total bolus = [(current BG − target BG) ÷ ISF] + [meal carbs (g) ÷ ICR]</Formula>
                <p>
                    TDD — total daily dose (units/day); BG — blood glucose. The correction part is zero when
                    glucose is at or below target, or below the hypoglycaemia threshold (70 mg/dL / 3.9 mmol/L).
                    Basal and bolus are each taken as 50% of TDD, and the bolus half is spread over 3 meals.
                </p>
                <p>
                    Sensitivity bands (ISF in mg/dL per unit): &gt; 50 highly sensitive, 30–50 average,
                    18–30 moderate resistance, &lt; 18 severe resistance.
                </p>
                <p>
                    Guideline reference: American Diabetes Association (ADA) Standards of Medical Care in Diabetes
                    and Endocrine Society clinical guidelines.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Should I use the 1800 or the 1500 rule?",
                        a: "The 1800 rule is used for rapid-acting analogues (lispro, aspart, glulisine) and the 1500 rule for regular human insulin. Higher numbers (2000, 2200) give a larger ISF and suit more insulin-sensitive patients; the 1700 rule sits between.",
                    },
                    {
                        q: "Why is no correction dose given when glucose is below target?",
                        a: "The calculator only adds insulin for glucose above target. It does not subtract from the meal dose when glucose is below target — decide that clinically. Below 70 mg/dL (3.9 mmol/L) it treats the reading as hypoglycaemia and withholds correction entirely.",
                    },
                    {
                        q: "What if the patient already has insulin on board?",
                        a: "This calculator does not subtract insulin on board (IOB). If a bolus was given in the last 3–4 hours, part of it is still acting, and giving a full correction on top can cause hypoglycaemia (insulin stacking).",
                    },
                    {
                        q: "Does switching to mmol/L change the dose?",
                        a: "No. Switching converts the glucose values and the ISF by 18.0182, so the correction dose stays the same (apart from small rounding in the converted values).",
                    },
                    {
                        q: "How do I estimate TDD for a new patient?",
                        a: "A common starting range is 0.4–1.0 units/kg/day: about 0.4–0.5 for insulin-sensitive or new type 1 patients, 0.55 as a standard starting point, and 0.7–1.0 with insulin resistance, obesity or puberty. Titrate from glucose records.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}

/** A labelled row of single-choice chips (the kit has no chip-radio group). */
function ChipGroup<T extends string>({
    label,
    note,
    options,
    value,
    onChange,
    hint,
}: {
    label: string;
    note?: string;
    options: T[];
    value: T;
    onChange: (next: T) => void;
    hint?: string;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
                <p className="text-[13px] font-medium text-foreground/90">{label}</p>
                {note && <span className="text-xs font-medium text-primary">{note}</span>}
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
                {options.map((option) => {
                    const selected = option === value;
                    return (
                        <button
                            key={option}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => onChange(option)}
                            className={
                                "min-h-[40px] min-w-[64px] rounded-xl border px-3.5 py-2 text-sm font-semibold tabular-nums transition-colors " +
                                (selected
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border/80 bg-background text-foreground hover:bg-muted/60")
                            }
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
            {hint && <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
        </div>
    );
}
