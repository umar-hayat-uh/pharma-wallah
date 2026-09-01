"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
    TrendingUp,
    Activity,
    AlertCircle,
    Filter,
    BarChart,
    BookOpen,
    RefreshCw,
    Check,
    Copy,
    Sparkles,
    ShieldCheck,
    HelpCircle,
    Zap,
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
    Stethoscope,
    Droplet,
    Layers,
} from "lucide-react";

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

    // UI States
    const [showInstructions, setShowInstructions] = useState<boolean>(true);
    const [showDetails, setShowDetails] = useState<boolean>(false);
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

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ─── HEADER ──────────────────────────────────────────────────────── */}
                <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                                <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        eGFR & KDIGO CKD Staging Suite
                                    </h1>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                                        <Sparkles className="h-3 w-3 text-yellow-300" /> NKF-ASN 2021 Race-Free
                                    </span>
                                </div>
                                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                                    2021 CKD-EPI universal race-free equation, KDIGO G1–G5 staging & albuminuria risk matrix
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowInstructions((prev) => !prev)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3.5 py-2 text-xs md:text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/40"
                            >
                                <HelpCircle className="h-4 w-4" />
                                {showInstructions ? "Hide Instructions" : "Clinical Guide"}
                            </button>
                        </div>
                    </div>

                    <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
                </header>

                {/* ─── STEP-BY-STEP DIRECTIONS / CLINICAL GUIDE ─────────────────────── */}
                {showInstructions && (
                    <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 sm:p-6 shadow-sm backdrop-blur-sm transition-all animate-in fade-in duration-300">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <span>eGFR Assessment & KDIGO Risk Protocol</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">3-Step Workflow</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    1
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Enter Age, Sex & SCr</strong>
                                    Input patient parameters. The universal 2021 CKD-EPI race-free equation calculates standardized eGFR.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                    2
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Select Albuminuria Category</strong>
                                    Choose A1 (&lt; 30), A2 (30–300), or A3 (&gt; 300 mg/g) to populate the KDIGO CKD progression heatmap.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                    3
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Review Directives & Copy Note</strong>
                                    Check monitoring frequency, SGLT2i / Metformin dosing rules, and export the clinical consult note.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── QUICK CLINICAL ARCHETYPES BAR ────────────────────────────────── */}
                <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-md shadow-gray-200/50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Quick Clinical Archetypes (1-Click Presets)
                            </span>
                        </div>
                        <span className="text-[11px] text-gray-400">Clinical Scenarios</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {samplePatients.map((p) => (
                            <button
                                key={p.label}
                                type="button"
                                onClick={() => handleLoadPreset(p)}
                                className="group p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition flex flex-col justify-between"
                            >
                                <div className="font-bold text-xs text-gray-900 group-hover:text-blue-700">
                                    {p.label}
                                </div>
                                <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                                    {p.tag} ({p.sex === "male" ? "M" : "F"})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── MAIN WORKSPACE GRID: 12 COLS ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT: INPUT PARAMETERS & EQUATION SELECTION (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* CARD 1: PATIENT CLINICAL DATA */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <Stethoscope className="h-5 w-5 text-blue-600" />
                                    1. Clinical Parameters
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
                                >
                                    <RefreshCw className="h-3.5 w-3.5" /> Reset
                                </button>
                            </div>

                            <div className="space-y-3.5">
                                {/* Age & Sex */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3">
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Age (Years)
                                        </label>
                                        <input
                                            type="number"
                                            min="18"
                                            max="120"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="e.g. 62"
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3">
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Biological Sex
                                        </label>
                                        <div className="grid grid-cols-2 gap-1 bg-gray-200/70 p-0.5 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setSex("male")}
                                                className={`py-1 text-xs font-bold rounded-md transition ${sex === "male"
                                                        ? "bg-white text-blue-700 shadow-xs"
                                                        : "text-gray-600 hover:text-gray-900"
                                                    }`}
                                            >
                                                Male
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSex("female")}
                                                className={`py-1 text-xs font-bold rounded-md transition ${sex === "female"
                                                        ? "bg-white text-blue-700 shadow-xs"
                                                        : "text-gray-600 hover:text-gray-900"
                                                    }`}
                                            >
                                                Female
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Serum Creatinine Input */}
                                <div className="rounded-xl border border-teal-200/70 bg-teal-50/30 p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[11px] font-bold text-teal-950 uppercase flex items-center gap-1">
                                            <Droplet className="h-3.5 w-3.5 text-teal-600" /> Serum Creatinine (SCr)
                                        </label>
                                        <div className="inline-flex rounded bg-teal-100 p-0.5 text-[10px] font-bold">
                                            <button
                                                type="button"
                                                onClick={() => setScrUnit("mg/dL")}
                                                className={`px-1.5 py-0.5 rounded ${scrUnit === "mg/dL" ? "bg-white text-teal-800 shadow-xs" : "text-teal-700"}`}
                                            >
                                                mg/dL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setScrUnit("umol/L")}
                                                className={`px-1.5 py-0.5 rounded ${scrUnit === "umol/L" ? "bg-white text-teal-800 shadow-xs" : "text-teal-700"}`}
                                            >
                                                µmol/L
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.05"
                                            value={serumCreatinine}
                                            onChange={(e) => setSerumCreatinine(e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-teal-500"
                                        />
                                        <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                            {scrUnit}
                                        </span>
                                    </div>
                                </div>

                                {/* Albuminuria (uACR) Stage */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
                                        Albuminuria Staging (Urine Albumin-to-Creatinine Ratio)
                                    </label>
                                    <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                                        {[
                                            { id: "a1", name: "A1: Normal", sub: "< 30 mg/g" },
                                            { id: "a2", name: "A2: Micro", sub: "30–300 mg/g" },
                                            { id: "a3", name: "A3: Macro", sub: "> 300 mg/g" },
                                        ].map((a) => (
                                            <button
                                                key={a.id}
                                                type="button"
                                                onClick={() => setAlbuminuria(a.id as AlbuminuriaStage)}
                                                className={`p-2 rounded-xl border transition text-center flex flex-col items-center justify-center ${albuminuria === a.id
                                                        ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500 font-extrabold"
                                                        : "border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                            >
                                                <span>{a.name}</span>
                                                <span className="text-[10px] text-gray-400 font-normal">{a.sub}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Equation Selector */}
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1.5">
                                        Select Estimating Equation
                                    </label>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setEquation("ckd_epi_2021")}
                                            className={`p-2.5 rounded-xl border transition text-left ${equation === "ckd_epi_2021"
                                                    ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500 font-extrabold"
                                                    : "border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            <div className="font-extrabold">CKD-EPI 2021</div>
                                            <div className="text-[10px] font-normal text-gray-500">Universal Race-Free (NKF/ASN)</div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setEquation("mdrd_legacy")}
                                            className={`p-2.5 rounded-xl border transition text-left ${equation === "mdrd_legacy"
                                                    ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500 font-extrabold"
                                                    : "border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            <div className="font-extrabold">MDRD (2006)</div>
                                            <div className="text-[10px] font-normal text-gray-500">Legacy 4-Variable Equation</div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CARD 2: KDIGO HEATMAP MATRIX REFERENCE */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                                <Layers className="h-3.5 w-3.5 text-blue-600" />
                                KDIGO CKD Staging Reference Matrix
                            </h3>
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px]">
                                        <tr>
                                            <th className="py-2 px-3">Stage</th>
                                            <th className="py-2 px-3">eGFR Range</th>
                                            <th className="py-2 px-3">Description</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-[11px]">
                                        <tr className="bg-emerald-50/40"><td className="py-1.5 px-3 font-bold text-emerald-800">G1</td><td className="py-1.5 px-3">≥ 90</td><td className="py-1.5 px-3 text-gray-600">Normal or High</td></tr>
                                        <tr className="bg-blue-50/40"><td className="py-1.5 px-3 font-bold text-blue-800">G2</td><td className="py-1.5 px-3">60–89</td><td className="py-1.5 px-3 text-gray-600">Mildly Decreased</td></tr>
                                        <tr className="bg-yellow-50/40"><td className="py-1.5 px-3 font-bold text-yellow-800">G3a</td><td className="py-1.5 px-3">45–59</td><td className="py-1.5 px-3 text-gray-600">Mild-to-Moderate</td></tr>
                                        <tr className="bg-orange-50/40"><td className="py-1.5 px-3 font-bold text-orange-800">G3b</td><td className="py-1.5 px-3">30–44</td><td className="py-1.5 px-3 text-gray-600">Moderate-to-Severe</td></tr>
                                        <tr className="bg-rose-50/40"><td className="py-1.5 px-3 font-bold text-rose-800">G4</td><td className="py-1.5 px-3">15–29</td><td className="py-1.5 px-3 text-gray-600">Severely Decreased</td></tr>
                                        <tr className="bg-purple-50/40"><td className="py-1.5 px-3 font-bold text-purple-800">G5</td><td className="py-1.5 px-3">&lt; 15</td><td className="py-1.5 px-3 text-gray-600">Kidney Failure / ESRD</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT: HERO eGFR OUTPUT & KDIGO DIRECTIVES (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* HERO eGFR CARD */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-green-300" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                                        Glomerular Filtration Rate & Staging
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyConsultNote}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/30"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-green-300" />
                                            <span>Copied to EHR!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span>Copy Consult</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {calculations ? (
                                <div className="space-y-4">
                                    {/* Big Number Output */}
                                    <div className="rounded-xl bg-white/15 p-5 text-center backdrop-blur-md ring-1 ring-white/20">
                                        <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block mb-1">
                                            {calculations.equationLabel}
                                        </span>
                                        <div className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                                            {calculations.activeEgfr}{" "}
                                            <span className="text-xl font-bold text-green-200">mL/min/1.73m²</span>
                                        </div>
                                        <div className="mt-2 text-xs font-mono text-blue-100/90 bg-black/10 inline-block px-3 py-1 rounded-full">
                                            {calculations.stageData.stage} ({calculations.stageData.stageName}) — {calculations.stageData.riskLevel}
                                        </div>
                                    </div>

                                    {/* Clinical Directive Card */}
                                    <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/15 space-y-2 text-xs">
                                        <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
                                            <span className="text-blue-100 font-bold">Recommended Monitoring Interval:</span>
                                            <span className="text-white font-black">{calculations.stageData.monitoringInterval}</span>
                                        </div>
                                        <p className="text-blue-100 text-[11px] leading-relaxed">
                                            <strong>Clinical Management:</strong> {calculations.stageData.clinicalManagement}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-blue-100">
                                    <BarChart className="h-12 w-12 mx-auto mb-2 opacity-60" />
                                    <p className="font-medium text-sm">Enter age and serum creatinine to compute GFR.</p>
                                </div>
                            )}
                        </div>

                        {/* VISUAL eGFR SPECTRUM GAUGE */}
                        {calculations && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-gray-700 flex items-center gap-1.5">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        eGFR Clearance Spectrum (KDIGO G1–G5)
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${calculations.stageData.badgeColor}`}>
                                        {calculations.activeEgfr} mL/min/1.73m²
                                    </span>
                                </div>

                                <div className="relative pt-6 pb-2">
                                    {/* Spectrum Track */}
                                    <div className="h-3.5 bg-gradient-to-r from-purple-600 via-rose-500 via-orange-400 via-yellow-400 via-blue-400 to-emerald-500 rounded-full w-full relative overflow-hidden" />

                                    {/* Marker Needle */}
                                    <div
                                        className="absolute top-1 transition-all duration-300 -translate-x-1/2"
                                        style={{
                                            left: `${Math.min(100, Math.max(0, (calculations.activeEgfr / 120) * 100))}%`,
                                        }}
                                    >
                                        <div className="bg-gray-900 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap">
                                            {calculations.activeEgfr}
                                        </div>
                                        <div className="w-0.5 h-3.5 bg-gray-900 mx-auto" />
                                    </div>

                                    <div className="flex justify-between text-[10px] font-bold text-gray-400 px-0.5 mt-1">
                                        <span>0 (G5)</span>
                                        <span>15 (G4)</span>
                                        <span>30 (G3b)</span>
                                        <span>60 (G2)</span>
                                        <span>90+ (G1)</span>
                                        <span>120</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EQUATIONS COMPARISON CARD */}
                        {calculations && (
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                                    <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
                                    Equation Comparison (CKD-EPI vs. MDRD)
                                </h3>

                                <div className="grid grid-cols-2 gap-3 text-xs text-center">
                                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                                        <span className="text-[10px] uppercase font-bold text-blue-700 block">CKD-EPI 2021 (Universal)</span>
                                        <div className="text-2xl font-black text-blue-900 mt-0.5">{calculations.egfrCkdEpi}</div>
                                        <span className="text-[10px] text-gray-500 block">mL/min/1.73m²</span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                                        <span className="text-[10px] uppercase font-bold text-gray-600 block">MDRD Study (Legacy 2006)</span>
                                        <div className="text-2xl font-black text-gray-800 mt-0.5">{calculations.egfrMdrd}</div>
                                        <span className="text-[10px] text-gray-500 block">mL/min/1.73m²</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MANDATORY CLINICAL SAFETY WARNING */}
                        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-4 shadow-sm text-gray-700">
                            <div className="flex items-start gap-2.5">
                                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                                <div className="text-[11px] leading-relaxed">
                                    <strong className="font-semibold text-gray-900 block mb-0.5">Clinical Staging Advisory:</strong>
                                    Chronic Kidney Disease (CKD) diagnosis requires documented GFR &lt; 60 mL/min/1.73m² or kidney damage markers (albuminuria uACR &ge; 30 mg/g) persisting for <strong>&ge; 3 months</strong>. For acute kidney injury (AKI), serum creatinine trends and urine output should guide therapy.
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

                {/* ─── COLLAPSIBLE FORMULAS & EVIDENCE REFERENCE ────────────────────── */}
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                    <button
                        type="button"
                        onClick={() => setShowDetails(!showDetails)}
                        className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                        <span className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            Mathematical Equations & NKF-ASN 2021 Consensus Evidence
                        </span>
                        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showDetails && (
                        <div className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100 leading-relaxed">
                            <div>
                                <strong className="text-gray-900 block mb-0.5">1. 2021 CKD-EPI Race-Free Creatinine Equation (NKF-ASN Joint Task Force):</strong>
                                <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    eGFR = 142 × min(SCr/κ, 1)^α × max(SCr/κ, 1)^-1.200 × 0.9938^Age × (1.012 if Female)
                                    <br />
                                    Female: κ = 0.7, α = -0.241 | Male: κ = 0.9, α = -0.302
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">2. MDRD Study Equation (Re-expressed 2006):</strong>
                                <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                    eGFR = 175 × (SCr)^-1.154 × (Age)^-0.203 × (0.742 if Female)
                                </code>
                            </div>
                            <div>
                                <strong className="text-gray-900 block mb-0.5">3. Reference Guideline:</strong>
                                <p className="text-gray-600">
                                    Inker LA, et al. New Creatinine- and Cystatin C-Based Equations to Estimate GFR without Race. N Engl J Med. 2021;385(19):1737-1749.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
                <footer className="border-t border-gray-200 pt-6 pb-10 text-center text-xs text-gray-500 space-y-2">
                    <p className="max-w-4xl mx-auto leading-relaxed">
                        <strong>Clinical Nephrology Advisory:</strong> Compliant with the 2021 NKF-ASN Joint Task Force Consensus and KDIGO 2024 Clinical Practice Guidelines.
                    </p>
                    <p className="text-gray-400">
                        &copy; 2024–2026 Advanced Renal Function & Glomerular Filtration Decision Support.
                    </p>
                </footer>

            </div>
        </section>
    );
}