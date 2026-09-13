"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { Check, Copy, Filter, RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
    LabNotice,
    type ResultTone,
} from "@/components/calculators";

type WeightMethod = "auto" | "actual" | "ibw" | "adjbw";
type WeightUnit = "kg" | "lbs";
type HeightUnit = "cm" | "in";
type ScrUnit = "mg/dL" | "umol/L";
type Sex = "male" | "female";

interface PatientPreset {
    label: string;
    tag: string;
    age: string;
    sex: Sex;
    weight: string;
    weightUnit: WeightUnit;
    height: string;
    heightUnit: HeightUnit;
    scr: string;
    scrUnit: ScrUnit;
}

interface RenalTier {
    range: string;
    label: string;
    dosingAdvice: string;
    isCurrent: boolean;
}

/*
 * Input values unchanged. The old chips also printed an expected CrCl
 * ("CrCl ~115", "~38", "~18") that the calculator does not produce for those
 * inputs, so only the demographic part of each tag is kept.
 */
const SAMPLE_PATIENTS: PatientPreset[] = [
    { label: "Young fit adult", tag: "M 30", age: "30", sex: "male", weight: "75", weightUnit: "kg", height: "180", heightUnit: "cm", scr: "0.9", scrUnit: "mg/dL" },
    { label: "Elderly CKD", tag: "M 74", age: "74", sex: "male", weight: "78", weightUnit: "kg", height: "172", heightUnit: "cm", scr: "1.7", scrUnit: "mg/dL" },
    { label: "Sarcopenic, low SCr", tag: "F 86", age: "86", sex: "female", weight: "48", weightUnit: "kg", height: "158", heightUnit: "cm", scr: "0.5", scrUnit: "mg/dL" },
    { label: "Obese", tag: "F 54", age: "54", sex: "female", weight: "112", weightUnit: "kg", height: "165", heightUnit: "cm", scr: "1.4", scrUnit: "mg/dL" },
    { label: "Severe CKD", tag: "M 79", age: "79", sex: "male", weight: "68", weightUnit: "kg", height: "170", heightUnit: "cm", scr: "2.8", scrUnit: "mg/dL" },
];

export default function CreatinineClearanceCalculator() {
    const [age, setAge] = useState<string>("68");
    const [sex, setSex] = useState<Sex>("male");
    const [weight, setWeight] = useState<string>("82");
    const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
    const [height, setHeight] = useState<string>("175");
    const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
    const [serumCreatinine, setSerumCreatinine] = useState<string>("1.3");
    const [scrUnit, setScrUnit] = useState<ScrUnit>("mg/dL");

    const [weightMethod, setWeightMethod] = useState<WeightMethod>("auto");
    const [roundLowScr, setRoundLowScr] = useState<boolean>(true); // Sarcopenia floor

    const [copied, setCopied] = useState<boolean>(false);

    /* ── Numeric normalisation (unchanged) ─────────────────────────────────── */
    const numAge = parseFloat(age) || 0;
    const rawW = parseFloat(weight) || 0;
    const rawH = parseFloat(height) || 0;
    const rawScr = parseFloat(serumCreatinine) || 0;

    const weightKg = useMemo(() => {
        if (weightUnit === "lbs") return Math.round(rawW * 0.453592 * 10) / 10;
        return rawW;
    }, [rawW, weightUnit]);

    const heightCm = useMemo(() => {
        if (heightUnit === "in") return Math.round(rawH * 2.54 * 10) / 10;
        return rawH;
    }, [rawH, heightUnit]);

    const heightInches = useMemo(() => {
        if (heightUnit === "cm") return heightCm / 2.54;
        return rawH;
    }, [heightCm, rawH, heightUnit]);

    // SCr in mg/dL, rounded to 0.01 when converted from µmol/L
    const scrMgDl = useMemo(() => {
        if (scrUnit === "umol/L") return Math.round((rawScr / 88.4) * 100) / 100;
        return rawScr;
    }, [rawScr, scrUnit]);

    // Sarcopenia floor: SCr below 0.8 mg/dL is rounded up to 0.8 for Cockcroft-Gault
    const effectiveScr = useMemo(() => {
        if (roundLowScr && scrMgDl < 0.8 && scrMgDl > 0) {
            return 0.8;
        }
        return scrMgDl;
    }, [roundLowScr, scrMgDl]);

    /* ── Anthropometrics: IBW, AdjBW, BMI (unchanged) ─────────────────────── */
    const ibwDevine = useMemo(() => {
        if (heightInches <= 0) return 0;
        const base = sex === "male" ? 50.0 : 45.5;
        const diff = heightInches - 60;
        const ibw = base + 2.3 * diff;
        return Math.max(Math.round(ibw * 10) / 10, sex === "male" ? 50 : 45.5);
    }, [heightInches, sex]);

    const adjBwKg = useMemo(() => {
        if (weightKg <= 0 || ibwDevine <= 0) return 0;
        return Math.round((ibwDevine + 0.4 * (weightKg - ibwDevine)) * 10) / 10;
    }, [weightKg, ibwDevine]);

    const bmi = useMemo(() => {
        if (heightCm <= 0 || weightKg <= 0) return 0;
        const heightM = heightCm / 100;
        return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
    }, [heightCm, weightKg]);

    // Automatic dosing-weight rule
    const { autoRecommendedMethod, autoReason } = useMemo(() => {
        if (!weightKg || !ibwDevine) return { autoRecommendedMethod: "actual" as const, autoReason: "Actual weight" };
        if (weightKg < ibwDevine) {
            return {
                autoRecommendedMethod: "actual" as const,
                autoReason: "Underweight (TBW < IBW): Actual total body weight recommended.",
            };
        }
        if (weightKg > 1.2 * ibwDevine) {
            return {
                autoRecommendedMethod: "adjbw" as const,
                autoReason: `Obese (BMI ${bmi} kg/m²; TBW > 120% IBW): Adjusted Body Weight (AdjBW 40%) recommended to avoid CrCl overestimation.`,
            };
        }
        return {
            autoRecommendedMethod: "ibw" as const,
            autoReason: "Normal Weight: Ideal Body Weight (IBW) standard for Cockcroft-Gault.",
        };
    }, [weightKg, ibwDevine, bmi]);

    const effectiveCrClWeight = useMemo(() => {
        const method = weightMethod === "auto" ? autoRecommendedMethod : weightMethod;
        if (method === "actual") return weightKg;
        if (method === "ibw") return ibwDevine || weightKg;
        if (method === "adjbw") return adjBwKg || weightKg;
        return weightKg;
    }, [weightMethod, autoRecommendedMethod, weightKg, ibwDevine, adjBwKg]);

    const effectiveWeightLabel = useMemo(() => {
        const method = weightMethod === "auto" ? autoRecommendedMethod : weightMethod;
        if (method === "actual") return `Actual TBW (${weightKg} kg)`;
        if (method === "ibw") return `Ideal Body Weight (${ibwDevine} kg)`;
        if (method === "adjbw") return `Adjusted Body Weight (${adjBwKg} kg)`;
        return `${effectiveCrClWeight} kg`;
    }, [weightMethod, autoRecommendedMethod, weightKg, ibwDevine, adjBwKg, effectiveCrClWeight]);

    /* ── Clearance, eGFR and staging (unchanged) ─────────────────────────── */
    const calculations = useMemo(() => {
        if (numAge <= 0 || effectiveCrClWeight <= 0 || effectiveScr <= 0) return null;

        // 1. Cockcroft-Gault CrCl (mL/min)
        let crcl = ((140 - numAge) * effectiveCrClWeight) / (72 * effectiveScr);
        if (sex === "female") crcl *= 0.85;
        crcl = Math.round(crcl * 10) / 10;

        // 2. CKD-EPI 2021 race-free equation (mL/min/1.73 m²) — uses the measured SCr
        const kappa = sex === "female" ? 0.7 : 0.9;
        const alpha = sex === "female" ? -0.241 : -0.302;
        const minScr = Math.min(scrMgDl / kappa, 1);
        const maxScr = Math.max(scrMgDl / kappa, 1);
        const femaleCoeff = sex === "female" ? 1.012 : 1.0;

        let egfr = 142 * Math.pow(minScr, alpha) * Math.pow(maxScr, -1.200) * Math.pow(0.9938, numAge) * femaleCoeff;
        egfr = Math.round(egfr * 10) / 10;

        // 3. Staging (applied to the Cockcroft-Gault CrCl)
        let kdigoStage = "G1 (Normal / High)";
        let tone: ResultTone = "success";
        let clinicalDosingAdvice = "Standard dosing protocols for all renally eliminated agents.";

        if (crcl >= 90) {
            kdigoStage = "G1 (Normal or High ≥ 90 mL/min)";
            tone = "success";
            clinicalDosingAdvice = "Normal renal clearance. Standard full-dose pharmacotherapy.";
        } else if (crcl >= 60) {
            kdigoStage = "G2 (Mildly Decreased: 60–89 mL/min)";
            tone = "success";
            clinicalDosingAdvice = "Mild clearance reduction. Routine monitoring; dose adjustments rarely required.";
        } else if (crcl >= 45) {
            kdigoStage = "G3a (Mild-to-Moderate: 45–59 mL/min)";
            tone = "warning";
            clinicalDosingAdvice = "Moderate impairment. Dose reduction indicated for narrow-index renally cleared agents (e.g. Enoxaparin, DOACs, Aminoglycosides).";
        } else if (crcl >= 30) {
            kdigoStage = "G3b (Moderate-to-Severe: 30–44 mL/min)";
            tone = "warning";
            clinicalDosingAdvice = "Moderate-to-severe impairment. Significant dose reductions required. Metformin max 1000 mg/day.";
        } else if (crcl >= 15) {
            kdigoStage = "G4 (Severely Decreased: 15–29 mL/min)";
            tone = "danger";
            clinicalDosingAdvice = "Severe renal failure. Extended intervals / major dose reductions. Metformin contraindicated. Switch to level-guided dosing.";
        } else {
            kdigoStage = "G5 (Kidney Failure < 15 mL/min / ESRD)";
            tone = "danger";
            clinicalDosingAdvice = "End-stage renal disease (ESRD). Avoid nephrotoxic agents. Pulse / post-dialysis redosing required.";
        }

        // 4. CrCl across ages 20–90 at the same weight and SCr
        const trajectoryData: { age: number; clearance: number }[] = [];
        for (let a = 20; a <= 90; a += 5) {
            let cl = ((140 - a) * effectiveCrClWeight) / (72 * effectiveScr);
            if (sex === "female") cl *= 0.85;
            trajectoryData.push({
                age: a,
                clearance: Math.round(cl * 10) / 10,
            });
        }

        return { crcl, egfr, kdigoStage, tone, clinicalDosingAdvice, trajectoryData };
    }, [numAge, effectiveCrClWeight, effectiveScr, sex, scrMgDl]);

    // Renal dose-adjustment tiers (unchanged)
    const renalTiers: RenalTier[] = useMemo(() => {
        const currentCrcl = calculations?.crcl ?? 100;
        return [
            {
                range: "> 50 mL/min",
                label: "Normal / Mild",
                dosingAdvice: "100% standard maintenance dose. Standard intervals.",
                isCurrent: currentCrcl > 50,
            },
            {
                range: "30 – 50 mL/min",
                label: "Moderate Reduction",
                dosingAdvice: "Reduce dose by 25–50% or extend dosing interval (e.g. q12h -> q24h).",
                isCurrent: currentCrcl >= 30 && currentCrcl <= 50,
            },
            {
                range: "15 – 29 mL/min",
                label: "Severe Reduction",
                dosingAdvice: "Reduce dose by 50–75% (e.g. Enoxaparin 1 mg/kg q24h, Cefepime 1g q24h).",
                isCurrent: currentCrcl >= 15 && currentCrcl < 30,
            },
            {
                range: "< 15 mL/min",
                label: "ESRD / Dialysis",
                dosingAdvice: "Avoid renally cleared drugs if possible. Dose post-hemodialysis.",
                isCurrent: currentCrcl < 15,
            },
        ];
    }, [calculations]);

    const handleLoadPreset = (p: PatientPreset) => {
        setAge(p.age);
        setSex(p.sex);
        setWeight(p.weight);
        setWeightUnit(p.weightUnit);
        setHeight(p.height);
        setHeightUnit(p.heightUnit);
        setSerumCreatinine(p.scr);
        setScrUnit(p.scrUnit);
        setWeightMethod("auto");
    };

    const handleReset = () => {
        setAge("68");
        setSex("male");
        setWeight("82");
        setWeightUnit("kg");
        setHeight("175");
        setHeightUnit("cm");
        setSerumCreatinine("1.3");
        setScrUnit("mg/dL");
        setWeightMethod("auto");
        setRoundLowScr(true);
    };

    // Consult note — text unchanged from the previous page.
    const handleCopyConsultNote = useCallback(() => {
        if (!calculations) return;

        const note = `=== CLINICAL RENAL FUNCTION & PHARMACOKINETIC CONSULT ===
PATIENT ANTHROPOMETRICS:
- Age: ${numAge} yrs | Biological Sex: ${sex.toUpperCase()}
- Height: ${heightCm} cm (${rawH} ${heightUnit}) | Weight: ${weightKg} kg (TBW)
- Devine IBW: ${ibwDevine} kg | AdjBW (40%): ${adjBwKg} kg | BMI: ${bmi} kg/m²
- Dosing Weight Used: ${effectiveWeightLabel}

SERUM CREATININE & CLEARANCE:
- Serum Creatinine: ${scrMgDl} mg/dL (${rawScr} ${scrUnit}) ${roundLowScr && scrMgDl < 0.8 ? `(Sarcopenia-Adjusted to 0.8 mg/dL)` : ""}
- COCKCROFT-GAULT CrCl: ${calculations.crcl} mL/min (FDA Drug Dosing Standard)
- CKD-EPI 2021 Race-Free eGFR: ${calculations.egfr} mL/min/1.73m²
- KDIGO Renal Staging: ${calculations.kdigoStage}

CLINICAL PHARMACOTHERAPY DIRECTIVE:
${calculations.clinicalDosingAdvice}
Guideline Standard: Cockcroft DW, Gault MH (Nephron 1976) & KDIGO 2024 Clinical Practice Guidelines.
Generated: ${new Date().toLocaleString()}`;

        try {
            navigator.clipboard.writeText(note);
            setCopied(true);
            setTimeout(() => setCopied(false), 2400);
        } catch {
            // No clipboard in this context (insecure origin, old WebView).
        }
    }, [
        calculations,
        numAge,
        sex,
        heightCm,
        rawH,
        heightUnit,
        weightKg,
        ibwDevine,
        adjBwKg,
        bmi,
        effectiveWeightLabel,
        scrMgDl,
        rawScr,
        scrUnit,
        roundLowScr,
    ]);

    /* ── Display-only validation ───────────────────────────────────────────── */
    const positiveError = (raw: string, name: string) => {
        if (raw.trim() === "") return undefined;
        const n = parseFloat(raw);
        return Number.isFinite(n) && n <= 0 ? `${name} must be greater than 0.` : undefined;
    };
    const ageError =
        positiveError(age, "Age") ?? (numAge >= 140 ? "Cockcroft-Gault is not valid at age 140 or above." : undefined);

    const activeMethod = weightMethod === "auto" ? autoRecommendedMethod : weightMethod;
    const floorApplied = roundLowScr && scrMgDl < 0.8 && scrMgDl > 0;

    return (
        <CalculatorShell
            title="Creatinine Clearance Calculator"
            subtitle="Estimates creatinine clearance (Cockcroft-Gault) for renal drug dosing, with the CKD-EPI 2021 eGFR and the matching dose-adjustment tier."
            icon={Filter}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About creatinine clearance">
                        <p>
                            Creatinine clearance (CrCl) estimates how fast the kidneys clear creatinine, and so
                            how fast they clear renally eliminated drugs. The Cockcroft-Gault equation, in mL/min,
                            is the one most drug labels and renal dosing tables were written against. The CKD-EPI
                            eGFR (estimated glomerular filtration rate) is indexed to 1.73 m² and is used to stage
                            chronic kidney disease.
                        </p>
                        <CalcList
                            title="How to use it"
                            items={[
                                "Enter age, sex, weight, height and serum creatinine (SCr), in either unit",
                                "Leave the dosing weight on Auto, or override it with actual, ideal or adjusted weight",
                                "Read the CrCl, find the dose-adjustment tier, and copy the note if you need it",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Keep in mind"
                            items={[
                                "Cockcroft-Gault assumes stable (steady-state) kidney function. In acute kidney injury or a rapidly changing creatinine it can badly overestimate true filtration — use urine output and drug-level monitoring instead.",
                                "Low creatinine from low muscle mass (elderly, frail, amputees) inflates CrCl; that is what the 0.8 mg/dL floor option is for.",
                                "Check each drug's own label: some use CrCl bands that differ from the tiers here.",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Creatinine clearance (Cockcroft-Gault)"
                value={calculations ? String(calculations.crcl) : null}
                unit="mL/min"
                interpretation={calculations?.kdigoStage}
                tone={calculations?.tone ?? "neutral"}
                empty="Enter age, weight, height and serum creatinine (all above 0) to calculate."
            />

            <CalcSection title="Patient details">
                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/90">Sex</p>
                    <ModeSwitch<Sex>
                        label="Sex"
                        value={sex}
                        onChange={setSex}
                        options={[
                            { value: "male", label: "Male", description: "Factor 1.00" },
                            { value: "female", label: "Female", description: "Factor 0.85" },
                        ]}
                    />
                </div>
                <FieldGrid>
                    <NumberField
                        label="Age"
                        value={age}
                        onChange={setAge}
                        unit="years"
                        step="1"
                        min={0}
                        placeholder="e.g. 68"
                        hint="Validated in adults (18 years and over)."
                        error={ageError}
                    />
                    <NumberField
                        label="Serum creatinine (SCr)"
                        value={serumCreatinine}
                        onChange={setSerumCreatinine}
                        units={[
                            { value: "mg/dL", label: "mg/dL" },
                            { value: "umol/L", label: "µmol/L" },
                        ]}
                        unit={scrUnit}
                        onUnitChange={(next) => setScrUnit(next as ScrUnit)}
                        step="0.05"
                        min={0}
                        hint="Adult normal is about 0.6–1.2 mg/dL (53–106 µmol/L). 1 mg/dL = 88.4 µmol/L."
                        error={positiveError(serumCreatinine, "Creatinine")}
                    />
                    <NumberField
                        label="Body weight"
                        value={weight}
                        onChange={setWeight}
                        units={["kg", "lbs"]}
                        unit={weightUnit}
                        onUnitChange={(next) => setWeightUnit(next as WeightUnit)}
                        step="0.5"
                        min={0}
                        hint="Actual (total) body weight today."
                        error={positiveError(weight, "Weight")}
                    />
                    <NumberField
                        label="Height"
                        value={height}
                        onChange={setHeight}
                        units={["cm", "in"]}
                        unit={heightUnit}
                        onUnitChange={(next) => setHeightUnit(next as HeightUnit)}
                        step="0.5"
                        min={0}
                        hint="Needed for ideal and adjusted body weight."
                        error={positiveError(height, "Height")}
                    />
                </FieldGrid>

                <Toggle
                    checked={roundLowScr}
                    onChange={setRoundLowScr}
                    label="Round SCr below 0.8 up to 0.8 mg/dL"
                    description="A common safety rule for elderly or low-muscle-mass patients, whose low creatinine would otherwise overstate clearance. Applies to Cockcroft-Gault only."
                />

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example patient</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_PATIENTS.map((p) => (
                            <button
                                key={p.label}
                                type="button"
                                onClick={() => handleLoadPreset(p)}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {p.label} · {p.tag}
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={handleReset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            <CalcSection title="Dosing weight" description="Which weight goes into the Cockcroft-Gault equation.">
                <ModeSwitch<WeightMethod>
                    label="Dosing weight"
                    value={weightMethod}
                    onChange={setWeightMethod}
                    options={[
                        { value: "auto", label: "Auto", description: "Picks by body size" },
                        { value: "actual", label: "Actual (TBW)", description: `${weightKg} kg` },
                        { value: "ibw", label: "Ideal (Devine IBW)", description: `${ibwDevine} kg` },
                        { value: "adjbw", label: "Adjusted (AdjBW 40%)", description: `${adjBwKg} kg` },
                    ]}
                />
                <LabNotice title={`Using: ${effectiveWeightLabel}`}>
                    {weightMethod === "auto" ? autoReason : `Manual override. Auto would choose: ${autoReason}`}
                </LabNotice>
            </CalcSection>

            {calculations && (
                <CalcSection title="Results & working">
                    <div>
                        <ResultRow
                            label="CKD-EPI 2021 eGFR (for CKD staging)"
                            value={calculations.egfr}
                            unit="mL/min/1.73m²"
                        />
                        <ResultRow
                            label={`SCr used${floorApplied ? " (floored from " + scrMgDl + ")" : ""}`}
                            value={effectiveScr}
                            unit="mg/dL"
                        />
                        <ResultRow label="Dosing weight used" value={effectiveCrClWeight} unit="kg" />
                        <ResultRow label="Devine ideal body weight" value={ibwDevine} unit="kg" badge={activeMethod === "ibw" ? "used" : undefined} />
                        <ResultRow label="Adjusted body weight (40%)" value={adjBwKg} unit="kg" badge={activeMethod === "adjbw" ? "used" : undefined} />
                        <ResultRow label="Body mass index (BMI)" value={bmi} unit="kg/m²" />
                        <ResultRow
                            label="CrCl = (140 − age) × weight ÷ (72 × SCr)"
                            value={`(140 − ${numAge}) × ${effectiveCrClWeight} ÷ (72 × ${effectiveScr})${sex === "female" ? " × 0.85" : ""}`}
                        />
                    </div>

                    <LabNotice
                        tone={calculations.tone === "danger" ? "danger" : calculations.tone === "warning" ? "warning" : "info"}
                        title="Dosing recommendation"
                    >
                        {calculations.clinicalDosingAdvice}
                    </LabNotice>

                    <Button variant="outline" onClick={handleCopyConsultNote} className="w-full">
                        {copied ? <Check /> : <Copy />}
                        {copied ? "Consult note copied" : "Copy consult note"}
                    </Button>
                </CalcSection>
            )}

            <CalcSection title="Renal dose-adjustment tiers" description="General tiers by CrCl. The patient's tier is highlighted.">
                <div className="space-y-2">
                    {renalTiers.map((tier) => (
                        <div
                            key={tier.range}
                            className={
                                "rounded-xl border px-3.5 py-3 " +
                                (tier.isCurrent ? "border-primary/60 bg-primary/10" : "border-border/80 bg-background")
                            }
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground">
                                    {tier.range} <span className="font-normal text-muted-foreground">· {tier.label}</span>
                                </p>
                                {tier.isCurrent && (
                                    <span className="rounded-md bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                                        Patient tier
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tier.dosingAdvice}</p>
                        </div>
                    ))}
                </div>
            </CalcSection>

            {calculations && calculations.trajectoryData.length > 0 && (
                <CalcSection
                    title="CrCl across ages 20–90"
                    description="How Cockcroft-Gault falls with age if weight and creatinine stayed the same."
                >
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={calculations.trajectoryData} margin={{ top: 5, right: 12, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="age"
                                    fontSize={11}
                                    tickMargin={6}
                                    label={{ value: "Age (years)", position: "insideBottom", offset: -12, fontSize: 11, fill: "#6b7280" }}
                                />
                                <YAxis
                                    fontSize={11}
                                    width={44}
                                    label={{ value: "CrCl (mL/min)", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "#6b7280" }}
                                />
                                <Tooltip
                                    formatter={(value) => (typeof value === "number" ? [`${value.toFixed(1)} mL/min`, "CrCl"] : ["N/A", "CrCl"])}
                                    labelFormatter={(label) => `Age ${label}`}
                                    contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                                />
                                <Line type="monotone" dataKey="clearance" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <p className="font-medium text-foreground">1. Cockcroft-Gault (1976)</p>
                <Formula>CrCl (mL/min) = [(140 − age) × weight (kg)] ÷ [72 × SCr (mg/dL)] × 0.85 if female</Formula>
                <p className="font-medium text-foreground">2. Devine ideal body weight and adjusted body weight</p>
                <Formula>
                    Male IBW = 50.0 kg + 2.3 × (height in inches − 60)
                    <br />
                    Female IBW = 45.5 kg + 2.3 × (height in inches − 60)
                    <br />
                    AdjBW (40%) = IBW + 0.4 × (actual weight − IBW)
                </Formula>
                <p>
                    IBW is never taken below 50 kg (male) or 45.5 kg (female). Auto uses actual weight when it is
                    below IBW, adjusted weight when it is more than 120% of IBW, and IBW otherwise.
                </p>
                <p className="font-medium text-foreground">3. CKD-EPI 2021 (race-free)</p>
                <Formula>
                    eGFR = 142 × min(SCr/κ, 1)^α × max(SCr/κ, 1)^−1.200 × 0.9938^age × 1.012 if female
                </Formula>
                <p>
                    κ = 0.7 (female) or 0.9 (male); α = −0.241 (female) or −0.302 (male). eGFR uses the measured
                    SCr, not the 0.8 floor. µmol/L is divided by 88.4 and rounded to 0.01 mg/dL first. The stage
                    shown on the result (G1–G5) is applied to the Cockcroft-Gault CrCl.
                </p>
                <p>
                    References: Cockcroft DW, Gault MH. Nephron 1976. Inker LA, et al. New creatinine- and
                    cystatin C-based equations to estimate GFR without race. N Engl J Med. 2021;385(19):1737-1749.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Should I use CrCl or eGFR for drug dosing?",
                        a: "Most renal dose recommendations in drug labels were derived with Cockcroft-Gault CrCl in mL/min, so use it for dosing — especially for narrow-therapeutic-index drugs such as DOACs, aminoglycosides and enoxaparin. eGFR is indexed to 1.73 m² and is designed for staging chronic kidney disease.",
                    },
                    {
                        q: "Which weight should go into Cockcroft-Gault?",
                        a: "There is no single agreed answer. A common approach, used by Auto here, is actual weight if the patient weighs less than their ideal weight, ideal weight if they are near it, and adjusted weight (IBW + 40% of the excess) if they weigh more than 120% of ideal. Follow your institution's policy.",
                    },
                    {
                        q: "Why round a low creatinine up to 0.8 mg/dL?",
                        a: "Elderly and frail patients make little creatinine because they have little muscle, so a very low SCr can make CrCl look falsely high and lead to overdosing. Rounding up is a conservative habit, but it can also underestimate clearance — switch it off when you judge the low value to be genuine.",
                    },
                    {
                        q: "Can I use this in acute kidney injury?",
                        a: "Not reliably. Creatinine lags behind a sudden change in kidney function, so any estimating equation will be wrong until creatinine is stable again. Use urine output, repeated creatinine and, where available, drug-level monitoring.",
                    },
                    {
                        q: "My lab reports creatinine in µmol/L — what do I do?",
                        a: "Switch the unit next to the creatinine field to µmol/L. The calculator divides by 88.4 to get mg/dL, which both equations need.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}

/** A full-width, thumb-sized checkbox row. */
function Toggle({
    checked,
    onChange,
    label,
    description,
}: {
    checked: boolean;
    onChange: (next: boolean) => void;
    label: string;
    description?: string;
}) {
    const id = useId();
    return (
        <label
            htmlFor={id}
            className="flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-background px-3.5 py-3 hover:bg-muted/50"
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
            />
            <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{label}</span>
                {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>}
            </span>
        </label>
    );
}
