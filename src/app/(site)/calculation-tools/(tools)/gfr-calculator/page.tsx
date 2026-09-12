"use client";

import { useState, useMemo, useCallback } from "react";
import { Filter, RefreshCw, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    type ResultTone,
} from "@/components/calculators";

// ─── STRICT TYPES & INTERFACES ───────────────────────────────────────

export type GFREquation = "ckd_epi_2021" | "mdrd_legacy";
export type ScrUnit = "mg/dL" | "umol/L";
export type AlbuminuriaStage = "a1" | "a2" | "a3";

export interface PatientPreset {
    label: string;
    tag: string;
    age: string;
    sex: "male" | "female";
    scr: string;
    scrUnit: ScrUnit;
    albuminuria: AlbuminuriaStage;
    equation: GFREquation;
}

export interface KDIGOStageData {
    stage: string;
    stageName: string;
    gfrRange: string;
    riskLevel: string;
    badgeColor: string;
    barColor: string;
    monitoringInterval: string;
    clinicalManagement: string;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function GFRCalculator() {
    // Input State
    const [age, setAge] = useState<string>("62");
    const [sex, setSex] = useState<"male" | "female">("female");
    const [serumCreatinine, setSerumCreatinine] = useState<string>("1.4");
    const [scrUnit, setScrUnit] = useState<ScrUnit>("mg/dL");
    const [albuminuria, setAlbuminuria] = useState<AlbuminuriaStage>("a2");
    const [equation, setEquation] = useState<GFREquation>("ckd_epi_2021");

    // FormulaNote owns the "how it works" disclosure now; only the copy
    // confirmation still needs local UI state.
    const [copied, setCopied] = useState<boolean>(false);

    // Patient Archetypes
    const samplePatients: PatientPreset[] = [
        { label: "Healthy Young Adult", tag: "30y, eGFR > 100", age: "30", sex: "male", scr: "0.8", scrUnit: "mg/dL", albuminuria: "a1", equation: "ckd_epi_2021" },
        { label: "Diabetic CKD G3a", tag: "58y, Moderate Risk", age: "58", sex: "female", scr: "1.3", scrUnit: "mg/dL", albuminuria: "a2", equation: "ckd_epi_2021" },
        { label: "Elderly CKD G3b", tag: "76y, High Risk", age: "76", sex: "male", scr: "1.8", scrUnit: "mg/dL", albuminuria: "a2", equation: "ckd_epi_2021" },
        { label: "Severe CKD G4", tag: "65y, High Albuminuria", age: "65", sex: "female", scr: "2.6", scrUnit: "mg/dL", albuminuria: "a3", equation: "ckd_epi_2021" },
        { label: "Kidney Failure G5", tag: "eGFR < 15 / Dialysis", age: "70", sex: "male", scr: "4.8", scrUnit: "mg/dL", albuminuria: "a3", equation: "ckd_epi_2021" },
    ];

    // Numeric Normalization
    const numAge = parseFloat(age) || 0;
    const rawScr = parseFloat(serumCreatinine) || 0;

    // Normalized SCr in mg/dL
    const scrMgDl = useMemo(() => {
        if (scrUnit === "umol/L") return Math.round((rawScr / 88.4) * 100) / 100;
        return rawScr;
    }, [rawScr, scrUnit]);

    // ─── eGFR & KDIGO CALCULATIONS ──────────────────────────────────────
    const calculations = useMemo(() => {
        if (numAge <= 0 || scrMgDl <= 0) return null;

        // 1. CKD-EPI 2021 Race-Free Refit Equation (NKF-ASN Universal Standard)
        const kappa = sex === "female" ? 0.7 : 0.9;
        const alpha = sex === "female" ? -0.241 : -0.302;
        const minRatio = Math.min(scrMgDl / kappa, 1);
        const maxRatio = Math.max(scrMgDl / kappa, 1);
        const femaleMultiplier = sex === "female" ? 1.012 : 1.0;

        let egfrCkdEpi = 142 * Math.pow(minRatio, alpha) * Math.pow(maxRatio, -1.200) * Math.pow(0.9938, numAge) * femaleMultiplier;
        egfrCkdEpi = Math.round(egfrCkdEpi * 10) / 10;

        // 2. MDRD Study Equation (4-Variable Legacy)
        let egfrMdrd = 175 * Math.pow(scrMgDl, -1.154) * Math.pow(numAge, -0.203);
        if (sex === "female") egfrMdrd *= 0.742;
        egfrMdrd = Math.round(egfrMdrd * 10) / 10;

        // Active Displayed eGFR
        const activeEgfr = equation === "ckd_epi_2021" ? egfrCkdEpi : egfrMdrd;
        const equationLabel = equation === "ckd_epi_2021" ? "CKD-EPI 2021 Race-Free Refit" : "MDRD Study (Legacy 2006)";

        // 3. KDIGO Stage & Risk Profile
        let stageData: KDIGOStageData;

        if (activeEgfr >= 90) {
            stageData = {
                stage: "Stage G1",
                stageName: "Normal or High GFR",
                gfrRange: "≥ 90 mL/min/1.73m²",
                riskLevel: albuminuria === "a3" ? "High Risk (due to A3 Albuminuria)" : albuminuria === "a2" ? "Moderate Risk (due to A2 Albuminuria)" : "Low Risk (Optimal)",
                badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
                barColor: "bg-emerald-500",
                monitoringInterval: "Monitor eGFR and uACR annually if hypertension, diabetes, or CKD risk factors present.",
                clinicalManagement: "Optimize cardiovascular risk factors (BP < 120 mmHg systolic, glycemic control). Standard drug dosing.",
            };
        } else if (activeEgfr >= 60) {
            stageData = {
                stage: "Stage G2",
                stageName: "Mildly Decreased",
                gfrRange: "60–89 mL/min/1.73m²",
                riskLevel: albuminuria === "a3" ? "Very High Risk" : albuminuria === "a2" ? "Moderate Risk" : "Low Risk",
                badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
                barColor: "bg-blue-500",
                monitoringInterval: "Monitor eGFR and uACR every 12 months.",
                clinicalManagement: "Manage ASCVD risk. Initiate SGLT2 inhibitor / ACEi/ARB if albuminuria (A2/A3) or diabetes present.",
            };
        } else if (activeEgfr >= 45) {
            stageData = {
                stage: "Stage G3a",
                stageName: "Mild-to-Moderate Reduction",
                gfrRange: "45–59 mL/min/1.73m²",
                riskLevel: albuminuria === "a3" ? "Very High Risk" : albuminuria === "a2" ? "High Risk" : "Moderate Risk",
                badgeColor: "bg-yellow-100 text-yellow-800 border-yellow-300",
                barColor: "bg-yellow-500",
                monitoringInterval: "Monitor eGFR, electrolytes, and uACR every 6 months.",
                clinicalManagement: "Evaluate for CKD complications (anemia, MBD, acidosis). Screen for medication dose adjustments. First-line SGLT2i + ACEi/ARB.",
            };
        } else if (activeEgfr >= 30) {
            stageData = {
                stage: "Stage G3b",
                stageName: "Moderate-to-Severe Reduction",
                gfrRange: "30–44 mL/min/1.73m²",
                riskLevel: albuminuria === "a1" ? "High Risk" : "Very High Risk",
                badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
                barColor: "bg-orange-500",
                monitoringInterval: "Monitor eGFR, potassium, bicarbonate, and CBC every 3–6 months.",
                clinicalManagement: "Nephrology consultation recommended. Metformin max 1000 mg/day. Adjust renally cleared drugs (DOACs, antibiotics). Avoid NSAIDs.",
            };
        } else if (activeEgfr >= 15) {
            stageData = {
                stage: "Stage G4",
                stageName: "Severely Decreased",
                gfrRange: "15–29 mL/min/1.73m²",
                riskLevel: "Very High Risk",
                badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
                barColor: "bg-rose-500",
                monitoringInterval: "Monitor renal parameters every 1–3 months.",
                clinicalManagement: "Mandatory Nephrology care. Vascular access planning (AV fistula/graft), immunizations (Hepatitis B), prepare for renal replacement therapy. Discontinue Metformin.",
            };
        } else {
            stageData = {
                stage: "Stage G5",
                stageName: "Kidney Failure / End-Stage (ESRD)",
                gfrRange: "< 15 mL/min/1.73m²",
                riskLevel: "Extremely High Mortality Risk",
                badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
                barColor: "bg-purple-600",
                monitoringInterval: "Continuous nephrology co-management / dialysis schedule.",
                clinicalManagement: "Renal replacement therapy (Hemodialysis, Peritoneal Dialysis, or Kidney Transplantation). Comprehensive palliative / conservative care planning.",
            };
        }

        return {
            activeEgfr,
            egfrCkdEpi,
            egfrMdrd,
            equationLabel,
            stageData,
        };
    }, [numAge, scrMgDl, sex, equation, albuminuria]);

    // Load Preset
    const handleLoadPreset = (p: PatientPreset) => {
        setAge(p.age);
        setSex(p.sex);
        setSerumCreatinine(p.scr);
        setScrUnit(p.scrUnit);
        setAlbuminuria(p.albuminuria);
        setEquation(p.equation);
    };

    // Reset
    const handleReset = () => {
        setAge("62");
        setSex("female");
        setSerumCreatinine("1.4");
        setScrUnit("mg/dL");
        setAlbuminuria("a2");
        setEquation("ckd_epi_2021");
    };

    // Copy Consult Note
    const handleCopyConsultNote = useCallback(() => {
        if (!calculations) return;

        const note = `=== CLINICAL RENAL FUNCTION & eGFR CONSULT ===
PATIENT PARAMETERS:
- Age: ${numAge} yrs | Biological Sex: ${sex.toUpperCase()}
- Serum Creatinine: ${scrMgDl} mg/dL (${rawScr} ${scrUnit})
- Albuminuria Category: ${albuminuria.toUpperCase()} (${albuminuria === "a1" ? "< 30 mg/g (Normal)" : albuminuria === "a2" ? "30–300 mg/g (Microalbuminuria)" : "> 300 mg/g (Severely Increased)"})

ESTIMATED GLOMERULAR FILTRATION RATE (eGFR):
- CALCULATED eGFR: ${calculations.activeEgfr} mL/min/1.73m² [${calculations.equationLabel}]
- CKD-EPI 2021 Race-Free Refit: ${calculations.egfrCkdEpi} mL/min/1.73m²
- MDRD Study (Legacy 2006): ${calculations.egfrMdrd} mL/min/1.73m²

KDIGO 2024 CLINICAL STAGING & RISK:
- KDIGO Stage: ${calculations.stageData.stage} (${calculations.stageData.stageName})
- Progression & Cardiovascular Risk: ${calculations.stageData.riskLevel}
- Recommended Monitoring Interval: ${calculations.stageData.monitoringInterval}

CLINICAL PHARMACOTHERAPY & MANAGEMENT DIRECTIVE:
${calculations.stageData.clinicalManagement}

CLINICAL GUIDELINE STANDARD:
2021 NKF-ASN Joint Task Force Consensus (Race-Free eGFR) & KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease.
Generated: ${new Date().toLocaleString()}`;

        navigator.clipboard.writeText(note);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
    }, [calculations, numAge, sex, scrMgDl, rawScr, scrUnit, albuminuria]);

    /** KDIGO stage -> result card tone. Staging logic itself is untouched above. */
    const tone: ResultTone = !calculations
        ? "neutral"
        : calculations.activeEgfr >= 60
          ? "success"
          : calculations.activeEgfr >= 30
            ? "warning"
            : "danger";

    return (
        <CalculatorShell
            title="eGFR Calculator"
            subtitle="Estimated glomerular filtration rate with KDIGO staging and dosing guidance."
            icon={Filter}
            aside={
                <>
                    <CalcAbout title="About eGFR">
                        <p>
                            eGFR estimates how much blood the kidneys filter each minute, normalised
                            to a standard body surface area of 1.73m². It is the number that decides
                            CKD staging and, for pharmacists, whether a renally cleared drug needs its
                            dose adjusted or stopping altogether.
                        </p>
                        <CalcList
                            title="Why it matters in practice"
                            items={[
                                "Metformin is capped below 45 and stopped below 30",
                                "DOAC doses change at defined eGFR thresholds",
                                "Most renally cleared antibiotics need adjusting",
                                "NSAIDs should generally be avoided below 30",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Unreliable when"
                            items={[
                                "Creatinine is changing — acute kidney injury",
                                "Muscle mass is extreme: body-builders, amputees, cachexia",
                                "Pregnancy, or in children under 18",
                                "The patient is on dialysis",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label={calculations ? `Estimated GFR · ${calculations.stageData.stage}` : "Estimated GFR"}
                value={calculations ? calculations.activeEgfr : null}
                unit="mL/min/1.73m²"
                interpretation={
                    calculations
                        ? `${calculations.stageData.stageName} — ${calculations.stageData.riskLevel}`
                        : undefined
                }
                tone={tone}
                empty="Enter an age and serum creatinine to estimate GFR."
            />

            <CalcSection title="Patient">
                <FieldGrid>
                    <NumberField
                        label="Age"
                        value={age}
                        onChange={setAge}
                        unit="years"
                        step="1"
                        min={0}
                        hint="These equations are validated in adults only."
                    />
                    <SelectField
                        label="Biological sex"
                        value={sex}
                        onChange={(next) => setSex(next as "male" | "female")}
                        options={[
                            { value: "female", label: "Female" },
                            { value: "male", label: "Male" },
                        ]}
                    />
                </FieldGrid>

                <NumberField
                    label="Serum creatinine"
                    value={serumCreatinine}
                    onChange={setSerumCreatinine}
                    units={["mg/dL", "umol/L"]}
                    unit={scrUnit}
                    onUnitChange={(next) => setScrUnit(next as ScrUnit)}
                    step="0.1"
                    min={0}
                    hint={scrUnit === "umol/L" ? `Converted to ${scrMgDl} mg/dL for the equation.` : undefined}
                />

                <FieldGrid>
                    <SelectField
                        label="Equation"
                        value={equation}
                        onChange={(next) => setEquation(next as GFREquation)}
                        options={[
                            { value: "ckd_epi_2021", label: "CKD-EPI 2021 (race-free)" },
                            { value: "mdrd_legacy", label: "MDRD (legacy 2006)" },
                        ]}
                        hint="CKD-EPI 2021 is the current standard."
                    />
                    <SelectField
                        label="Albuminuria (uACR)"
                        value={albuminuria}
                        onChange={(next) => setAlbuminuria(next as AlbuminuriaStage)}
                        options={[
                            { value: "a1", label: "A1 — under 30 mg/g" },
                            { value: "a2", label: "A2 — 30–300 mg/g" },
                            { value: "a3", label: "A3 — over 300 mg/g" },
                        ]}
                        hint="Raises the risk category at any eGFR."
                    />
                </FieldGrid>

                <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Try a typical patient</p>
                    <div className="flex flex-wrap gap-2">
                        {samplePatients.map((preset) => (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => handleLoadPreset(preset)}
                                className="rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset} className="flex-1">
                        <RefreshCw />
                        Reset
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handleCopyConsultNote}
                        disabled={!calculations}
                        className="flex-1"
                    >
                        {copied ? <Check /> : <Copy />}
                        {copied ? "Copied" : "Copy note"}
                    </Button>
                </div>
            </CalcSection>

            {calculations && (
                <>
                    <CalcSection title="Both equations" description="Shown side by side so they can be compared.">
                        <div>
                            <ResultRow
                                label="CKD-EPI 2021 (race-free)"
                                value={calculations.egfrCkdEpi}
                                unit="mL/min/1.73m²"
                                badge={equation === "ckd_epi_2021" ? "In use" : undefined}
                            />
                            <ResultRow
                                label="MDRD (legacy 2006)"
                                value={calculations.egfrMdrd}
                                unit="mL/min/1.73m²"
                                badge={equation === "mdrd_legacy" ? "In use" : undefined}
                            />
                            <ResultRow label="Creatinine used" value={scrMgDl} unit="mg/dL" />
                        </div>
                    </CalcSection>

                    <CalcSection title={`${calculations.stageData.stage} — ${calculations.stageData.stageName}`}>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{calculations.stageData.gfrRange}</Badge>
                            <Badge variant={tone === "success" ? "success" : tone === "danger" ? "destructive" : "warning"}>
                                {calculations.stageData.riskLevel}
                            </Badge>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Monitoring
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-foreground">
                                {calculations.stageData.monitoringInterval}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Management
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-foreground">
                                {calculations.stageData.clinicalManagement}
                            </p>
                        </div>
                    </CalcSection>
                </>
            )}

            <FormulaNote>
                <Formula>
                    CKD-EPI 2021: eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^−1.200 × 0.9938^age × 1.012 (if female)
                </Formula>
                <p>
                    κ is 0.7 for females and 0.9 for males; α is −0.241 for females and −0.302 for
                    males. The 2021 refit removed the race coefficient that earlier equations applied.
                </p>
                <Formula>MDRD: eGFR = 175 × Scr^−1.154 × age^−0.203 × 0.742 (if female)</Formula>
                <p>
                    eGFR estimates kidney function from creatinine, which depends on muscle mass — so
                    it is less reliable at extremes of body composition, in acute kidney injury, and in
                    pregnancy. Staging combines eGFR with albuminuria (uACR), which is why A2 or A3
                    raises the risk category even when eGFR looks acceptable.
                </p>
                <p className="text-xs">
                    Standards: 2021 NKF-ASN Joint Task Force (race-free eGFR); KDIGO 2024 CKD guideline.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "CKD-EPI or MDRD — which should I use?",
                        a: "CKD-EPI 2021. It is the current NKF-ASN standard, is more accurate above 60 mL/min/1.73m², and removed the race coefficient that earlier equations applied. MDRD is kept here because many older records and studies quote it.",
                    },
                    {
                        q: "Why does albuminuria change the risk but not the eGFR?",
                        a: "They measure different things. eGFR describes filtration rate; albuminuria describes filter damage. KDIGO stages CKD on both axes, so a patient with a near-normal eGFR but heavy albuminuria can still sit in a high-risk category.",
                    },
                    {
                        q: "Should I use eGFR or Cockcroft-Gault for drug dosing?",
                        a: "Check the product literature. Many older drug labels were written against Cockcroft-Gault creatinine clearance, which is not the same quantity as eGFR. For drugs with a narrow margin, use whichever the label specifies rather than assuming they are interchangeable.",
                    },
                    {
                        q: "What does the 1.73m² mean?",
                        a: "eGFR is normalised to an average adult body surface area so results are comparable between people. For dosing in patients at the extremes of body size, the de-indexed value in mL/min may be more appropriate.",
                    },
                    {
                        q: "One low reading — does that mean CKD?",
                        a: "No. CKD requires the abnormality to persist for at least three months. A single low eGFR may reflect acute kidney injury, dehydration or a transient cause, and should be repeated before staging anyone.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
