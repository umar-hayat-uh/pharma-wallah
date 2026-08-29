"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calculator,
    Droplet,
    User,
    Activity,
    AlertTriangle,
    CheckCircle2,
    Copy,
    Check,
    BookOpen,
    ShieldAlert,
    ExternalLink,
    Clock,
    Sparkles,
    RefreshCw,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp,
    HeartPulse,
    Stethoscope,
    HelpCircle,
    Zap,
    Scale,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";

// ─── PHARMACOKINETIC FORMULA HELPERS ─────────────────────────────────

function calculateIBW(heightInches: number, sex: "male" | "female"): number {
    const base = sex === "male" ? 50.0 : 45.5;
    const diff = heightInches - 60;
    const ibw = base + 2.3 * diff;
    return Math.max(ibw, sex === "male" ? 50 : 45.5);
}

function calculateAdjBW(actualKg: number, ibwKg: number): number {
    return ibwKg + 0.4 * (actualKg - ibwKg);
}

function calculateBMI(weightKg: number, heightCm: number): number {
    if (heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

function calculateCrCl(
    age: number,
    weightKg: number,
    scrMgDl: number,
    sex: "male" | "female"
): number {
    if (age <= 0 || weightKg <= 0 || scrMgDl <= 0) return 0;
    let crcl = ((140 - age) * weightKg) / (72 * scrMgDl);
    if (sex === "female") crcl *= 0.85;
    return Math.round(crcl * 10) / 10;
}

// Matzke Elimination Rate Constant (hr^-1)
function calculateKe(crcl: number): number {
    return Math.max(0.00083 * crcl + 0.0044, 0.005);
}

interface PatientPreset {
    label: string;
    tag: string;
    age: string;
    sex: "male" | "female";
    weight: string;
    weightUnit: "kg" | "lbs";
    height: string;
    heightUnit: "cm" | "in";
    scr: string;
    scrUnit: "mg/dL" | "umol/L";
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function VancomycinAUCCalculator() {
    // Patient Form State
    const [age, setAge] = useState<string>("58");
    const [sex, setSex] = useState<"male" | "female">("male");
    const [weightInput, setWeightInput] = useState<string>("82");
    const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
    const [heightInput, setHeightInput] = useState<string>("178");
    const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
    const [scrInput, setScrInput] = useState<string>("1.1");
    const [scrUnit, setScrUnit] = useState<"mg/dL" | "umol/L">("mg/dL");

    // Dosing Regimen State
    const [dose, setDose] = useState<string>("1250");
    const [interval, setInterval] = useState<string>("12");
    const [infusionTime, setInfusionTime] = useState<string>("1.5");
    const [mic, setMic] = useState<string>("1.0");
    const [indication, setIndication] = useState<string>("mrsa_bacteremia");

    // Weight Calculation Method
    const [weightMethod, setWeightMethod] = useState<"auto" | "actual" | "ibw" | "adjbw">("auto");

    // UI States
    const [copiedNote, setCopiedNote] = useState<boolean>(false);
    const [showInstructions, setShowInstructions] = useState<boolean>(true);
    const [showFormulas, setShowFormulas] = useState<boolean>(false);

    // Patient Archetypes Presets
    const patientPresets: PatientPreset[] = [
        { label: "Normal Renal", tag: "CrCl ~100", age: "52", sex: "male", weight: "80", weightUnit: "kg", height: "178", heightUnit: "cm", scr: "1.0", scrUnit: "mg/dL" },
        { label: "Moderate CKD", tag: "CrCl ~48", age: "68", sex: "male", weight: "82", weightUnit: "kg", height: "175", heightUnit: "cm", scr: "1.5", scrUnit: "mg/dL" },
        { label: "Severe CKD G4", tag: "CrCl ~24", age: "75", sex: "female", weight: "62", weightUnit: "kg", height: "160", heightUnit: "cm", scr: "2.0", scrUnit: "mg/dL" },
        { label: "Hyperclearance", tag: "CrCl ~145", age: "28", sex: "male", weight: "85", weightUnit: "kg", height: "182", heightUnit: "cm", scr: "0.7", scrUnit: "mg/dL" },
        { label: "Obese Patient", tag: "BMI 36", age: "60", sex: "female", weight: "105", weightUnit: "kg", height: "165", heightUnit: "cm", scr: "1.2", scrUnit: "mg/dL" },
    ];

    // Standardized Unit Normalizations
    const numAge = parseFloat(age) || 0;
    const rawWeight = parseFloat(weightInput) || 0;
    const rawHeight = parseFloat(heightInput) || 0;
    const rawScr = parseFloat(scrInput) || 0;
    const numDose = parseFloat(dose) || 0;
    const numInterval = parseFloat(interval) || 0;
    const numInfusionTime = parseFloat(infusionTime) || 1.0;
    const numMic = parseFloat(mic) || 1.0;

    const weightKg = useMemo(() => {
        if (weightUnit === "lbs") return Math.round(rawWeight * 0.45359237 * 10) / 10;
        return rawWeight;
    }, [rawWeight, weightUnit]);

    const heightInches = useMemo(() => {
        if (heightUnit === "cm") return rawHeight / 2.54;
        return rawHeight;
    }, [rawHeight, heightUnit]);

    const heightCm = useMemo(() => {
        if (heightUnit === "in") return rawHeight * 2.54;
        return rawHeight;
    }, [rawHeight, heightUnit]);

    const scrMgDl = useMemo(() => {
        if (scrUnit === "umol/L") return Math.round((rawScr / 88.4) * 100) / 100;
        return rawScr;
    }, [rawScr, scrUnit]);

    // Anthropometrics
    const ibwKg = useMemo(() => {
        if (heightInches <= 0) return 0;
        return Math.round(calculateIBW(heightInches, sex) * 10) / 10;
    }, [heightInches, sex]);

    const adjBwKg = useMemo(() => {
        if (weightKg <= 0 || ibwKg <= 0) return 0;
        return Math.round(calculateAdjBW(weightKg, ibwKg) * 10) / 10;
    }, [weightKg, ibwKg]);

    const bmi = useMemo(() => calculateBMI(weightKg, heightCm), [weightKg, heightCm]);

    // Auto Weight Heuristic
    const { autoRecommendedMethod, autoReason } = useMemo(() => {
        if (!weightKg || !ibwKg) return { autoRecommendedMethod: "actual" as const, autoReason: "Standard weight" };
        if (weightKg < ibwKg) {
            return {
                autoRecommendedMethod: "actual" as const,
                autoReason: "Underweight (TBW < IBW): Actual total body weight recommended.",
            };
        }
        if (weightKg > 1.2 * ibwKg) {
            return {
                autoRecommendedMethod: "adjbw" as const,
                autoReason: `Obese (BMI ${bmi} kg/m²; TBW > 120% IBW): Adjusted Body Weight (AdjBW 40%) recommended for CrCl estimation to prevent clearance overestimation.`,
            };
        }
        return {
            autoRecommendedMethod: "ibw" as const,
            autoReason: "Normal Weight: Ideal Body Weight (IBW) standard for Cockcroft-Gault.",
        };
    }, [weightKg, ibwKg, bmi]);

    const effectiveCrClWeight = useMemo(() => {
        const method = weightMethod === "auto" ? autoRecommendedMethod : weightMethod;
        if (method === "actual") return weightKg;
        if (method === "ibw") return ibwKg || weightKg;
        if (method === "adjbw") return adjBwKg || weightKg;
        return weightKg;
    }, [weightMethod, autoRecommendedMethod, weightKg, ibwKg, adjBwKg]);

    const effectiveWeightLabel = useMemo(() => {
        const method = weightMethod === "auto" ? autoRecommendedMethod : weightMethod;
        if (method === "actual") return `Actual TBW (${weightKg} kg)`;
        if (method === "ibw") return `Ideal Body Weight (${ibwKg} kg)`;
        if (method === "adjbw") return `Adjusted Body Weight (${adjBwKg} kg)`;
        return `${effectiveCrClWeight} kg`;
    }, [weightMethod, autoRecommendedMethod, weightKg, ibwKg, adjBwKg, effectiveCrClWeight]);

    // CrCl Calculation
    const crcl = useMemo(() => {
        if (!numAge || !effectiveCrClWeight || !scrMgDl) return 0;
        return calculateCrCl(numAge, effectiveCrClWeight, scrMgDl, sex);
    }, [numAge, effectiveCrClWeight, scrMgDl, sex]);

    // ─── PHARMACOKINETIC MODELING ────────────────────────────────────
    const pkResults = useMemo(() => {
        if (!weightKg || !crcl || !numDose || !numInterval || !numMic) return null;

        // Vd based on Actual Body Weight (0.7 L/kg)
        const Vd = Math.round(0.7 * weightKg * 10) / 10;
        const ke = calculateKe(crcl);
        const halfLife = Math.round((0.693 / ke) * 10) / 10;
        const clearanceLhr = Math.round(Vd * ke * 100) / 100;

        const tInf = numInfusionTime;
        const tau = numInterval;

        // Steady State Peak: Cmax,ss = [Dose / (tinf * Vd * ke)] * [(1 - e^-ke*tinf) / (1 - e^-ke*tau)]
        const numeratorPeak = (numDose / (tInf * Vd * ke)) * (1 - Math.exp(-ke * tInf));
        const denominatorPeak = 1 - Math.exp(-ke * tau);
        const cMaxSs = Math.round((numeratorPeak / denominatorPeak) * 10) / 10;

        // Steady State Trough: Cmin,ss = Cmax,ss * e^-ke*(tau - tinf)
        const cMinSs = Math.round(cMaxSs * Math.exp(-ke * (tau - tInf)) * 10) / 10;

        // Steady State 24-hr AUC: AUC24 = (Total Daily Dose) / Clearance
        const totalDailyDose = numDose * (24 / tau);
        const auc24 = Math.round((totalDailyDose / clearanceLhr) * 10) / 10;
        const aucMic = Math.round((auc24 / numMic) * 10) / 10;

        // Loading Dose Recommendation (25–35 mg/kg actual weight, max 3000 mg)
        const recommendedLoadingDose = Math.min(Math.round((25 * weightKg) / 250) * 250, 3000);

        return {
            Vd,
            ke: Math.round(ke * 10000) / 10000,
            halfLife,
            clearanceLhr,
            cMaxSs,
            cMinSs,
            auc24,
            aucMic,
            totalDailyDose,
            recommendedLoadingDose,
        };
    }, [weightKg, crcl, numDose, numInterval, numInfusionTime, numMic]);

    // Therapeutic Target Assessment
    const targetStatus = useMemo(() => {
        if (!pkResults) return null;
        const { aucMic } = pkResults;

        if (aucMic >= 400 && aucMic <= 600) {
            return {
                type: "therapeutic" as const,
                label: "Target Therapeutic Range (400–600)",
                badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
                barColor: "bg-emerald-500",
                message: "Optimal exposure. Maximizes clinical cure for serious MRSA infections while minimizing nephrotoxicity risk.",
                icon: CheckCircle2,
            };
        } else if (aucMic < 400) {
            return {
                type: "subtherapeutic" as const,
                label: "Subtherapeutic (< 400 mg·h/L)",
                badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
                barColor: "bg-amber-500",
                message: "Under-exposure alert. Risk of treatment failure and selection of vancomycin-intermediate (VISA) strains. Increase dose or shorten interval.",
                icon: AlertTriangle,
            };
        } else {
            return {
                type: "supratherapeutic" as const,
                label: "Supratherapeutic / Toxic (> 600 mg·h/L)",
                badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
                barColor: "bg-rose-500",
                message: "Excess exposure / Nephrotoxicity alert. High risk of acute kidney injury (AKI). Reduce dose or extend interval.",
                icon: AlertTriangle,
            };
        }
    }, [pkResults]);

    // ─── AUTOMATIC DOSE OPTIMIZER (DOSE CALCULATOR ENGINE) ─────────────
    const optimalCalculatedRegimen = useMemo(() => {
        if (!weightKg || !crcl || !numMic) return null;

        const candidateIntervals = [8, 12, 18, 24, 36, 48];
        const candidateDoses = [500, 750, 1000, 1250, 1500, 1750, 2000];

        const ke = calculateKe(crcl);
        const Vd = 0.7 * weightKg;
        const clearance = Vd * ke;

        let bestRegimen: { dose: number; interval: number; auc24: number; aucMic: number; cMin: number } | null = null;
        let closestDiffTo500 = Infinity;

        for (const tau of candidateIntervals) {
            for (const d of candidateDoses) {
                const totalDaily = d * (24 / tau);
                const predAuc = totalDaily / clearance;
                const predAucMic = predAuc / numMic;

                if (predAucMic >= 400 && predAucMic <= 600) {
                    const diff = Math.abs(predAucMic - 500); // Closest to midpoint of therapeutic window
                    if (diff < closestDiffTo500) {
                        closestDiffTo500 = diff;
                        const tInf = Math.max(1, d / 1000);
                        const cMax = (d / (tInf * Vd * ke)) * (1 - Math.exp(-ke * tInf)) / (1 - Math.exp(-ke * tau));
                        const cMin = cMax * Math.exp(-ke * (tau - tInf));

                        bestRegimen = {
                            dose: d,
                            interval: tau,
                            auc24: Math.round(predAuc * 10) / 10,
                            aucMic: Math.round(predAucMic * 10) / 10,
                            cMin: Math.round(cMin * 10) / 10,
                        };
                    }
                }
            }
        }
        return bestRegimen;
    }, [weightKg, crcl, numMic]);

    // Alternative Regimens Matrix
    const alternativeRegimens = useMemo(() => {
        if (!pkResults || !weightKg || !crcl) return [];
        const testIntervals = [8, 12, 18, 24, 36, 48];
        const testDoses = [750, 1000, 1250, 1500, 1750, 2000];

        const options = [];
        const ke = calculateKe(crcl);
        const Vd = 0.7 * weightKg;
        const clearance = Vd * ke;

        for (const tau of testIntervals) {
            for (const d of testDoses) {
                const totalDaily = d * (24 / tau);
                const predAuc = totalDaily / clearance;
                const predAucMic = predAuc / numMic;

                if (predAucMic >= 380 && predAucMic <= 620) {
                    const tInf = Math.max(1, d / 1000);
                    const cMax = (d / (tInf * Vd * ke)) * (1 - Math.exp(-ke * tInf)) / (1 - Math.exp(-ke * tau));
                    const cMin = cMax * Math.exp(-ke * (tau - tInf));

                    options.push({
                        dose: d,
                        interval: tau,
                        auc24: Math.round(predAuc * 10) / 10,
                        aucMic: Math.round(predAucMic * 10) / 10,
                        cMin: Math.round(cMin * 10) / 10,
                        isCurrent: d === numDose && tau === numInterval,
                    });
                }
            }
        }
        return options.slice(0, 5);
    }, [pkResults, weightKg, crcl, numMic, numDose, numInterval]);

    // Load Patient Preset
    const handleLoadPreset = (p: PatientPreset) => {
        setAge(p.age);
        setSex(p.sex);
        setWeightInput(p.weight);
        setWeightUnit(p.weightUnit);
        setHeightInput(p.height);
        setHeightUnit(p.heightUnit);
        setScrInput(p.scr);
        setScrUnit(p.scrUnit);
    };

    // Apply Calculated Optimal Regimen
    const handleApplyOptimalRegimen = () => {
        if (optimalCalculatedRegimen) {
            setDose(optimalCalculatedRegimen.dose.toString());
            setInterval(optimalCalculatedRegimen.interval.toString());
            const tInf = optimalCalculatedRegimen.dose > 1500 ? "2.0" : optimalCalculatedRegimen.dose > 1000 ? "1.5" : "1.0";
            setInfusionTime(tInf);
        }
    };

    // Copy Clinical Consult Note
    const handleCopyChartNote = useCallback(() => {
        if (!pkResults) return;

        const noteText = `=== CLINICAL PHARMACOKINETIC CONSULT: VANCOMYCIN AUC-TDM ===
PATIENT PARAMETERS:
- Age: ${numAge} yrs | Biological Sex: ${sex.toUpperCase()}
- Weight: ${weightKg} kg (TBW) | IBW: ${ibwKg} kg | AdjBW: ${adjBwKg} kg | BMI: ${bmi} kg/m²
- Serum Creatinine: ${scrMgDl} mg/dL (${rawScr} ${scrUnit})
- Cockcroft-Gault CrCl: ${crcl} mL/min [Weight Basis: ${effectiveWeightLabel}]

CURRENT VANCOMYCIN REGIMEN:
- Maintenance Dose: ${numDose} mg IV every ${numInterval} hours (Infusion Duration: ${numInfusionTime} hrs)
- Pathogen Target MIC: ${numMic} mg/L (Indication: ${indication.replace("_", " ").toUpperCase()})
- Recommended Loading Dose: ${pkResults.recommendedLoadingDose} mg IV (25–35 mg/kg)

PHARMACOKINETIC PREDICTIONS (1-Compartment Steady State):
- Elimination Rate Constant (ke): ${pkResults.ke} hr⁻¹ (Estimated t1/2: ${pkResults.halfLife} hrs)
- Volume of Distribution (Vd): ${pkResults.Vd} Liters (Clearance: ${pkResults.clearanceLhr} L/hr)
- Predicted Peak (Cmax,ss): ${pkResults.cMaxSs} mcg/mL
- Predicted Trough (Cmin,ss): ${pkResults.cMinSs} mcg/mL
- Predicted 24-hr AUC: ${pkResults.auc24} mg·h/L
- Predicted AUC24 / MIC Ratio: ${pkResults.aucMic}

THERAPEUTIC ASSESSMENT:
- Target Range: 400–600 mg·h/L (ASHP/IDSA/PIDS/SIDP 2020 Guidelines)
- Exposure Status: ${targetStatus?.label.toUpperCase()}
- Clinical Recommendation: ${targetStatus?.message}

REFERENCE:
- 2020 Consensus Guidelines for Vancomycin Therapeutic Dosing (Rybak MJ et al. Am J Health-Syst Pharm. 2020;77(11):835-864).
- Clinical decision support aid. Verify with institutional Bayesian TDM software before dispensing.`;

        navigator.clipboard.writeText(noteText);
        setCopiedNote(true);
        setTimeout(() => setCopiedNote(false), 2400);
    }, [
        pkResults,
        numAge,
        sex,
        weightKg,
        ibwKg,
        adjBwKg,
        bmi,
        scrMgDl,
        rawScr,
        scrUnit,
        crcl,
        effectiveWeightLabel,
        numDose,
        numInterval,
        numInfusionTime,
        numMic,
        indication,
        targetStatus,
    ]);

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ─── HEADER ──────────────────────────────────────────────────────── */}
                <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                                <Stethoscope className="h-8 w-8 md:h-10 md:w-10 text-white" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        Vancomycin AUC/MIC Dosing Calculator
                                    </h1>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                                        <Sparkles className="h-3 w-3 text-yellow-300" /> ASHP / IDSA 2020 Guidelines
                                    </span>
                                </div>
                                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                                    Precision 1-compartment PK modeling, auto-recommended initial regimens & AUC₂₄/MIC forecast
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
                                <span>Directions of Use & 2020 AUC-Targeting Protocol</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">3-Step Workflow</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    1
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Enter Patient Vitals</strong>
                                    Type age, sex, weight, height, and SCr. The engine calculates CrCl using the optimal weight method.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                                    2
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Apply Optimal Dose</strong>
                                    Review the auto-calculated recommended regimen (targeting AUC ~500) and click <strong>&quot;Apply&quot;</strong>.
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                    3
                                </div>
                                <div className="text-xs sm:text-sm text-gray-700">
                                    <strong className="block text-gray-900 font-semibold mb-0.5">Verify Safety & Copy Note</strong>
                                    Check the Loading Dose, Predicted Peak/Trough, Zone Gauge, and export the clinical consult note.
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
                                Quick Patient Archetypes (1-Click Presets)
                            </span>
                        </div>
                        <span className="text-[11px] text-gray-400">Clinical Scenarios</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {patientPresets.map((p) => (
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
                                    {p.tag} ({p.sex}, {p.age}y)
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── MAIN WORKSPACE GRID: 12 COLS ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT: PARAMETERS & DOSE REGIMEN (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* 1. Patient Biometrics Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-blue-600" />
                                    1. Patient Biometrics & Clearance
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAge("58");
                                        setSex("male");
                                        setWeightInput("82");
                                        setHeightInput("178");
                                        setScrInput("1.1");
                                        setDose("1250");
                                        setInterval("12");
                                        setInfusionTime("1.5");
                                        setMic("1.0");
                                    }}
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
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="e.g. 58"
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

                                {/* Weight */}
                                <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                                            <Scale className="h-3 w-3 text-blue-600" /> Total Body Weight (TBW)
                                        </label>
                                        <div className="inline-flex rounded bg-blue-100/80 p-0.5 text-[10px] font-bold">
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit("kg")}
                                                className={`px-1.5 py-0.5 rounded ${weightUnit === "kg" ? "bg-white text-blue-700 shadow-xs" : "text-blue-600"}`}
                                            >
                                                kg
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit("lbs")}
                                                className={`px-1.5 py-0.5 rounded ${weightUnit === "lbs" ? "bg-white text-blue-700 shadow-xs" : "text-blue-600"}`}
                                            >
                                                lbs
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={weightInput}
                                            onChange={(e) => setWeightInput(e.target.value)}
                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
                                        />
                                        <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                            {weightUnit}
                                        </span>
                                    </div>
                                </div>

                                {/* Height & Serum Creatinine */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* Height */}
                                    <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] font-bold text-gray-700 uppercase">Height</label>
                                            <div className="inline-flex rounded bg-gray-200 p-0.5 text-[10px] font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => setHeightUnit("cm")}
                                                    className={`px-1.5 py-0.5 rounded ${heightUnit === "cm" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600"}`}
                                                >
                                                    cm
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setHeightUnit("in")}
                                                    className={`px-1.5 py-0.5 rounded ${heightUnit === "in" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600"}`}
                                                >
                                                    in
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={heightInput}
                                                onChange={(e) => setHeightInput(e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                                {heightUnit}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Serum Creatinine */}
                                    <div className="rounded-xl border border-teal-200/70 bg-teal-50/30 p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="text-[11px] font-bold text-teal-950 uppercase">SCr</label>
                                            <div className="inline-flex rounded bg-teal-100 p-0.5 text-[10px] font-bold">
                                                <button
                                                    type="button"
                                                    onClick={() => setScrUnit("mg/dL")}
                                                    className={`px-1 py-0.5 rounded ${scrUnit === "mg/dL" ? "bg-white text-teal-800 shadow-xs" : "text-teal-700"}`}
                                                >
                                                    mg/dL
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setScrUnit("umol/L")}
                                                    className={`px-1 py-0.5 rounded ${scrUnit === "umol/L" ? "bg-white text-teal-800 shadow-xs" : "text-teal-700"}`}
                                                >
                                                    µmol/L
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.05"
                                                value={scrInput}
                                                onChange={(e) => setScrInput(e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-teal-500"
                                            />
                                            <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                                                {scrUnit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* CrCl Result Callout */}
                                <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-2xl p-4 shadow-md flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1">
                                            <Activity className="h-3.5 w-3.5 text-green-300" /> Cockcroft-Gault CrCl
                                        </span>
                                        <span className="text-[11px] text-blue-100 mt-0.5 block">{effectiveWeightLabel}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-white">{crcl}</span>
                                        <span className="text-xs font-bold text-green-100 ml-1">mL/min</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Dosing Regimen Parameters Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Droplet className="h-5 w-5 text-emerald-600" />
                                2. Regimen Parameters
                            </h2>

                            <div className="space-y-3.5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Maintenance Dose (mg)
                                        </label>
                                        <input
                                            type="number"
                                            step="250"
                                            value={dose}
                                            onChange={(e) => setDose(e.target.value)}
                                            placeholder="e.g. 1250"
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Dosing Interval
                                        </label>
                                        <select
                                            value={interval}
                                            onChange={(e) => setInterval(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="8">q8h (Every 8h)</option>
                                            <option value="12">q12h (Every 12h)</option>
                                            <option value="18">q18h (Every 18h)</option>
                                            <option value="24">q24h (Every 24h)</option>
                                            <option value="36">q36h (Every 36h)</option>
                                            <option value="48">q48h (Every 48h)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Infusion Duration (hrs)
                                        </label>
                                        <select
                                            value={infusionTime}
                                            onChange={(e) => setInfusionTime(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="1.0">1.0 hr (≤ 1000 mg)</option>
                                            <option value="1.5">1.5 hrs (1250–1500 mg)</option>
                                            <option value="2.0">2.0 hrs (1750–2000 mg)</option>
                                            <option value="2.5">2.5 hrs (&gt; 2000 mg)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                                            Target Pathogen MIC
                                        </label>
                                        <select
                                            value={mic}
                                            onChange={(e) => setMic(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 focus:bg-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="0.5">0.5 mg/L</option>
                                            <option value="1.0">1.0 mg/L (Standard BMD)</option>
                                            <option value="1.5">1.5 mg/L</option>
                                            <option value="2.0">2.0 mg/L (VISA Borderline)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT: AUTO-DOSE CALCULATOR & AUC THERAPEUTIC FORECAST (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* AUTO-RECOMMENDED OPTIMAL REGIMEN CARD */}
                        {optimalCalculatedRegimen && (
                            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-blue-50/80 p-5 sm:p-6 shadow-md shadow-emerald-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                                        <Sparkles className="h-4 w-4 text-emerald-600" />
                                        Auto-Calculated Target Regimen (ASHP 2020)
                                    </span>
                                    <div className="text-2xl sm:text-3xl font-black text-emerald-950">
                                        {optimalCalculatedRegimen.dose} mg IV q{optimalCalculatedRegimen.interval}h
                                    </div>
                                    <p className="text-xs text-emerald-800">
                                        Forecasts <strong className="text-emerald-950">AUC₂₄/MIC = {optimalCalculatedRegimen.aucMic}</strong> (Center of 400–600 target).
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleApplyOptimalRegimen}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-xs sm:text-sm shadow-md transition shrink-0"
                                >
                                    <span>Apply Recommended Dose</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* PRIMARY FORECAST RESULTS HERO CARD */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-7 shadow-md shadow-gray-200/50 space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                        Steady-State AUC/MIC Exposure Forecast
                                    </span>
                                    <h3 className="text-2xl font-black text-gray-900 mt-0.5">
                                        Therapeutic Exposure Analysis
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyChartNote}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600 text-white text-xs font-bold transition shadow-md self-start sm:self-center"
                                >
                                    {copiedNote ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            <span>Note Copied to EHR!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            <span>Copy Chart Consult</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {pkResults && targetStatus ? (
                                <div className="space-y-5">
                                    {/* Primary Metric Gauges */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                        {/* AUC/MIC */}
                                        <div className="bg-gradient-to-br from-blue-50/80 to-white border border-blue-200/80 p-4 rounded-2xl">
                                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide block">
                                                AUC₂₄ / MIC Ratio
                                            </span>
                                            <div className="text-3xl font-black text-gray-900 mt-1">
                                                {pkResults.aucMic}
                                            </div>
                                            <span className="text-[11px] font-semibold text-gray-500">Target: 400–600</span>
                                        </div>

                                        {/* AUC24 */}
                                        <div className="bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200/80 p-4 rounded-2xl">
                                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide block">
                                                24-hr AUC (Exposure)
                                            </span>
                                            <div className="text-3xl font-black text-gray-900 mt-1">
                                                {pkResults.auc24}{" "}
                                                <span className="text-xs font-bold text-gray-500">mg·h/L</span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-gray-500">
                                                Daily: {pkResults.totalDailyDose} mg
                                            </span>
                                        </div>

                                        {/* Trough */}
                                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl">
                                            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block">
                                                Predicted Trough (Cmin,ss)
                                            </span>
                                            <div className="text-3xl font-black text-gray-900 mt-1">
                                                {pkResults.cMinSs}{" "}
                                                <span className="text-xs font-bold text-gray-500">mcg/mL</span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-gray-500">
                                                Peak: {pkResults.cMaxSs} mcg/mL
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visual Target Range Zone Meter */}
                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-gray-700">Therapeutic Target Gauge</span>
                                            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${targetStatus.badgeColor}`}>
                                                {targetStatus.label}
                                            </span>
                                        </div>

                                        <div className="relative w-full h-3.5 bg-gray-200 rounded-full overflow-hidden flex">
                                            <div className="w-[40%] bg-amber-200 h-full border-r border-white/50" title="Subtherapeutic (<400)" />
                                            <div className="w-[20%] bg-emerald-400 h-full border-r border-white/50" title="Target Range (400-600)" />
                                            <div className="w-[40%] bg-rose-200 h-full" title="Supratherapeutic / Toxic (>600)" />
                                        </div>

                                        <div className="flex justify-between text-[10px] font-bold text-gray-500 px-0.5">
                                            <span>0</span>
                                            <span>400 (Target Min)</span>
                                            <span>600 (Target Max)</span>
                                            <span>1000+</span>
                                        </div>
                                    </div>

                                    {/* Clinical Recommendation Box */}
                                    <div
                                        className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${targetStatus.type === "therapeutic"
                                                ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                                                : targetStatus.type === "subtherapeutic"
                                                    ? "bg-amber-50/90 border-amber-200 text-amber-950"
                                                    : "bg-rose-50/90 border-rose-200 text-rose-950"
                                            }`}
                                    >
                                        <targetStatus.icon className="h-5 w-5 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="font-bold block mb-0.5">Clinical Evaluation:</strong>
                                            {targetStatus.message}
                                        </div>
                                    </div>

                                    {/* Loading Dose & PK Summary */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        <div className="bg-blue-50/70 border border-blue-200 p-4 rounded-2xl space-y-1">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                                                <Sparkles className="h-3.5 w-3.5" /> Recommended Loading Dose
                                            </span>
                                            <p className="text-2xl font-black text-gray-900">
                                                {pkResults.recommendedLoadingDose} mg IV
                                            </p>
                                            <p className="text-[11px] text-gray-600">
                                                Calculated as 25–35 mg/kg (actual body weight, max 3000 mg) for severe sepsis or critically ill patients.
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-1 text-xs text-gray-700">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
                                                Pharmacokinetic Parameters
                                            </span>
                                            <div className="grid grid-cols-2 gap-2 pt-1 font-semibold">
                                                <div>
                                                    <span className="text-gray-500 block text-[10px]">Vd (Volume):</span>
                                                    <span>{pkResults.Vd} Liters</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block text-[10px]">Elimination ke:</span>
                                                    <span>{pkResults.ke} hr⁻¹</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block text-[10px]">Half-Life (t½):</span>
                                                    <span>{pkResults.halfLife} Hours</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 block text-[10px]">Clearance:</span>
                                                    <span>{pkResults.clearanceLhr} L/hr</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alternative Regimens Matrix */}
                                    {alternativeRegimens.length > 0 && (
                                        <div className="space-y-2 pt-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                                                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
                                                Alternative Regimens Achieving 400–600 Target
                                            </h4>
                                            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase text-[10px]">
                                                        <tr>
                                                            <th className="py-2.5 px-3">Regimen</th>
                                                            <th className="py-2.5 px-3">Forecast AUC₂₄</th>
                                                            <th className="py-2.5 px-3">AUC/MIC</th>
                                                            <th className="py-2.5 px-3">Pred. Trough</th>
                                                            <th className="py-2.5 px-3">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {alternativeRegimens.map((reg, idx) => (
                                                            <tr
                                                                key={idx}
                                                                className={reg.isCurrent ? "bg-blue-50/80 font-bold text-blue-900" : "hover:bg-gray-50"}
                                                            >
                                                                <td className="py-2.5 px-3">
                                                                    {reg.dose} mg q{reg.interval}h
                                                                    {reg.isCurrent && (
                                                                        <span className="ml-1 text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                                                                            Active
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-2.5 px-3 font-semibold">{reg.auc24}</td>
                                                                <td className="py-2.5 px-3 font-bold text-emerald-700">{reg.aucMic}</td>
                                                                <td className="py-2.5 px-3">{reg.cMin} mcg/mL</td>
                                                                <td className="py-2.5 px-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setDose(reg.dose.toString());
                                                                            setInterval(reg.interval.toString());
                                                                        }}
                                                                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                                                                    >
                                                                        Apply
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    Enter valid patient and dosing parameters to view pharmacokinetic modeling.
                                </div>
                            )}
                        </div>

                        {/* COLLAPSIBLE MATHEMATICAL FORMULAS */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                            <button
                                type="button"
                                onClick={() => setShowFormulas(!showFormulas)}
                                className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                            >
                                <span className="flex items-center gap-2 text-sm">
                                    <BookOpen className="h-4 w-4 text-blue-600" />
                                    Pharmacokinetic Equations & 2020 ASHP Guidelines Reference
                                </span>
                                {showFormulas ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>

                            <AnimatePresence>
                                {showFormulas && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100 overflow-hidden leading-relaxed"
                                    >
                                        <div>
                                            <strong className="text-gray-900 block mb-0.5">
                                                1. Matzke Elimination Rate Constant (ke):
                                            </strong>
                                            <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                                ke = 0.00083 × CrCl (mL/min) + 0.0044
                                            </code>
                                        </div>
                                        <div>
                                            <strong className="text-gray-900 block mb-0.5">
                                                2. Steady-State Peak (Cmax,ss) & Trough (Cmin,ss):
                                            </strong>
                                            <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                                Cmax,ss = [Dose / (tinf × Vd × ke)] × [(1 - e^(-ke×tinf)) / (1 - e^(-ke×τ))]
                                                <br />
                                                Cmin,ss = Cmax,ss × e^(-ke × (τ - tinf))
                                            </code>
                                        </div>
                                        <div>
                                            <strong className="text-gray-900 block mb-0.5">
                                                3. 24-Hour Area Under Curve (AUC24):
                                            </strong>
                                            <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                                                AUC24 = Total Daily Dose / (Vd × ke)
                                            </code>
                                        </div>
                                        <div className="pt-1 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                                            <span className="font-semibold text-gray-700">
                                                Reference: Rybak MJ et al. Am J Health-Syst Pharm. 2020;77(11):835-864.
                                            </span>
                                            <a
                                                href="https://academic.oup.com/ajhp/article/77/11/835/5810200"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                                            >
                                                Read Guidelines <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>

                </div>

                {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
                <footer className="border-t border-gray-200 pt-6 pb-10 text-center text-xs text-gray-500 space-y-2">
                    <p className="max-w-4xl mx-auto leading-relaxed">
                        <strong>Clinical TDM Advisory:</strong> This calculator utilizes standard 1-compartment pharmacokinetic models for adult non-dialysis patients. For patients with fluctuating renal function (AKI), hemodialysis, CRRT, or severe ascites/burns, Bayesian multi-level serum monitoring is advised.
                    </p>
                    <p className="text-gray-400">
                        © 2024–2026 Advanced Vancomycin Clinical Decision Support.
                    </p>
                </footer>

            </div>
        </section>
    );
}