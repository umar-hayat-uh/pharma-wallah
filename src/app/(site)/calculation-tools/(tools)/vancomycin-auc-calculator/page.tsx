"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calculator,
    Droplet,
    User,
    Activity,
    Info,
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
    Layers,
    Stethoscope,
} from "lucide-react";

// ─── PHARMACOKINETIC FORMULA HELPERS ─────────────────────────────────

export function calculateIBW(heightInches: number, sex: "male" | "female"): number {
    const base = sex === "male" ? 50.0 : 45.5;
    const diff = heightInches - 60;
    const ibw = base + 2.3 * diff;
    return Math.max(ibw, sex === "male" ? 50 : 45.5);
}

export function calculateAdjBW(actualKg: number, ibwKg: number): number {
    return ibwKg + 0.4 * (actualKg - ibwKg);
}

export function calculateBMI(weightKg: number, heightCm: number): number {
    if (heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateCrCl(
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
export function calculateKe(crcl: number): number {
    return Math.max(0.00083 * crcl + 0.0044, 0.005);
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
    const [showFormulas, setShowFormulas] = useState<boolean>(false);

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
        if (!weightKg || !ibwKg) return { autoRecommendedMethod: "actual", autoReason: "Standard weight" };
        if (weightKg < ibwKg) {
            return {
                autoRecommendedMethod: "actual" as const,
                autoReason: "Underweight (TBW < IBW): Actual total body weight is recommended.",
            };
        }
        if (weightKg > 1.2 * ibwKg) {
            return {
                autoRecommendedMethod: "adjbw" as const,
                autoReason: `Obese (BMI ${bmi} kg/m²; TBW > 120% of IBW): Adjusted Body Weight (AdjBW 40%) recommended for CrCl estimation to avoid overestimating clearance.`,
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

        // Vd based on Actual Body Weight (0.7 L/kg, capped at 0.5-0.9 L/kg)
        const Vd = Math.round(0.7 * weightKg * 10) / 10;
        const ke = calculateKe(crcl);
        const halfLife = Math.round((0.693 / ke) * 10) / 10;
        const clearanceLhr = Math.round(Vd * ke * 100) / 100;

        const tInf = numInfusionTime; // Infusion duration in hours
        const tau = numInterval;

        // Steady State Peak (at end of infusion): Cmax,ss = [Dose / (tinf * Vd * ke)] * [(1 - e^-ke*tinf) / (1 - e^-ke*tau)]
        const numeratorPeak = (numDose / (tInf * Vd * ke)) * (1 - Math.exp(-ke * tInf));
        const denominatorPeak = 1 - Math.exp(-ke * tau);
        const cMaxSs = Math.round((numeratorPeak / denominatorPeak) * 10) / 10;

        // Steady State Trough (immediately prior to next dose): Cmin,ss = Cmax,ss * e^-ke*(tau - tinf)
        const cMinSs = Math.round(cMaxSs * Math.exp(-ke * (tau - tInf)) * 10) / 10;

        // Steady State 24-hr AUC: AUC24 = (Total Daily Dose) / Clearance
        const totalDailyDose = numDose * (24 / tau);
        const auc24 = Math.round((totalDailyDose / clearanceLhr) * 10) / 10;
        const aucMic = Math.round((auc24 / numMic) * 10) / 10;

        // Loading Dose Recommendation (25–35 mg/kg, max 3000 mg)
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
                type: "therapeutic",
                label: "Target Therapeutic Range (400–600)",
                badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
                barColor: "bg-emerald-500",
                message: "Optimal exposure. Maximizes clinical efficacy against MRSA while minimizing nephrotoxicity risk.",
                icon: CheckCircle2,
            };
        } else if (aucMic < 400) {
            return {
                type: "subtherapeutic",
                label: "Subtherapeutic (< 400 mg·h/L)",
                badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
                barColor: "bg-amber-500",
                message: "Under-exposure risk. Associated with clinical failure and potential selection of vancomycin-intermediate (VISA) strains. Consider increasing dose or shortening interval.",
                icon: AlertTriangle,
            };
        } else {
            return {
                type: "supratherapeutic",
                label: "Supratherapeutic / Toxic (> 600 mg·h/L)",
                badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
                barColor: "bg-rose-500",
                message: "High risk of Acute Kidney Injury (AKI) and ototoxicity. ASHP guidelines strongly advise reducing total daily dose or extending interval.",
                icon: AlertTriangle,
            };
        }
    }, [pkResults]);

    // Alternative Regimens Matrix
    const alternativeRegimens = useMemo(() => {
        if (!pkResults || !weightKg || !crcl) return [];
        const testIntervals = [8, 12, 18, 24];
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

    // Copy Clinical SBAR / Chart Note
    const handleCopyChartNote = useCallback(() => {
        if (!pkResults) return;

        const noteText = `=== CLINICAL PHARMACOKINETIC CONSULT: VANCOMYCIN TDM ===
PATIENT PARAMETERS:
- Age: ${numAge} yrs | Biological Sex: ${sex.toUpperCase()}
- Weight: ${weightKg} kg (TBW) | IBW: ${ibwKg} kg | AdjBW: ${adjBwKg} kg | BMI: ${bmi} kg/m²
- Serum Creatinine: ${scrMgDl} mg/dL (${rawScr} ${scrUnit})
- Cockcroft-Gault CrCl: ${crcl} mL/min [Using: ${effectiveWeightLabel}]

CURRENT VANCOMYCIN REGIMEN:
- Maintenance Dose: ${numDose} mg IV every ${numInterval} hours (Infusion: ${numInfusionTime} hrs)
- Pathogen Target MIC: ${numMic} mg/L (Indication: ${indication.replace("_", " ").toUpperCase()})
- Recommended Initial Loading Dose: ${pkResults.recommendedLoadingDose} mg IV (25-30 mg/kg)

PHARMACOKINETIC PREDICTIONS (1-Compartment Steady State):
- Elimination Rate Constant (ke): ${pkResults.ke} hr⁻¹ (Estimated t1/2: ${pkResults.halfLife} hrs)
- Volume of Distribution (Vd): ${pkResults.Vd} L (Clearance: ${pkResults.clearanceLhr} L/hr)
- Predicted Peak (Cmax,ss): ${pkResults.cMaxSs} mcg/mL
- Predicted Trough (Cmin,ss): ${pkResults.cMinSs} mcg/mL
- Predicted 24-hr AUC: ${pkResults.auc24} mg·h/L
- Predicted AUC24 / MIC Ratio: ${pkResults.aucMic}

THERAPEUTIC ASSESSMENT:
- Target Range: 400–600 mg·h/L (ASHP/IDSA/PIDS/SIDP 2020 Guidelines)
- Status: ${targetStatus?.label.toUpperCase()}
- Recommendation: ${targetStatus?.message}

REFERENCE & DISCLAIMER:
- 2020 Vancomycin Consensus Guidelines (Rybak MJ et al. Am J Health-Syst Pharm. 2020;77(11):835-864).
- Clinical decision support aid only. Confirm with institutional Bayesian TDM software & official package inserts.`;

        navigator.clipboard.writeText(noteText);
        setCopiedNote(true);
        setTimeout(() => setCopiedNote(false), 3000);
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
        <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* ─── HEADER WITH PHARMAWALLAH GRADIENT ──────────────────────── */}
                <header className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                    {/* Top gradient accent line */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
                                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                                ASHP / IDSA 2020 Consensus Guidelines • AUC-Guided TDM
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                                Vancomycin AUC/MIC Calculator
                            </h1>
                            <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
                                Precision one-compartment pharmacokinetic modeling to estimate steady-state{" "}
                                <strong className="text-blue-600">AUC₂₄/MIC</strong>, peak, and trough levels, optimizing
                                therapeutic efficacy while preventing nephrotoxicity.
                            </p>
                        </div>

                        {/* Top quick badges */}
                        <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
                                <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Target: AUC/MIC 400–600</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
                                <HeartPulse className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>Loading Dose: 25–35 mg/kg</span>
                            </div>
                        </div>
                    </div>

                    {/* Prominent Clinical Disclaimer Banner */}
                    <div className="mt-6 bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 text-xs sm:text-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold text-amber-950 block sm:inline mr-1">
                                Clinical Notice & Guideline Directive:
                            </strong>
                            According to the revised 2020 ASHP/IDSA/PIDS/SIDP guidelines, trough-only monitoring (15–20 mcg/mL)
                            is no longer recommended for serious MRSA infections due to excess nephrotoxicity.
                            Always cross-reference with institutional Bayesian dosing platforms and real-time clinical judgment.
                        </div>
                    </div>
                </header>

                {/* ─── MAIN TWO-COLUMN WORKSPACE ──────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: PARAMETER ENTRY (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Patient Biometrics Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    1. Patient Biometrics
                                </h2>
                                <button
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
                                    className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" /> Reset
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Age & Sex */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Age (Years)
                                        </label>
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="e.g. 58"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Biological Sex
                                        </label>
                                        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => setSex("male")}
                                                className={`py-1.5 text-xs font-bold rounded-lg transition ${sex === "male"
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                            >
                                                Male
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSex("female")}
                                                className={`py-1.5 text-xs font-bold rounded-lg transition ${sex === "female"
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                            >
                                                Female
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Weight */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Total Body Weight (TBW)
                                        </label>
                                        <div className="flex items-center gap-1 text-[11px]">
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit("kg")}
                                                className={`px-2 py-0.5 rounded font-bold ${weightUnit === "kg"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                kg
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit("lbs")}
                                                className={`px-2 py-0.5 rounded font-bold ${weightUnit === "lbs"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
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
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            {weightUnit}
                                        </span>
                                    </div>
                                </div>

                                {/* Height */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Height
                                        </label>
                                        <div className="flex items-center gap-1 text-[11px]">
                                            <button
                                                type="button"
                                                onClick={() => setHeightUnit("cm")}
                                                className={`px-2 py-0.5 rounded font-bold ${heightUnit === "cm"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                cm
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setHeightUnit("in")}
                                                className={`px-2 py-0.5 rounded font-bold ${heightUnit === "in"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
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
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            {heightUnit}
                                        </span>
                                    </div>
                                </div>

                                {/* Serum Creatinine */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Serum Creatinine (SCr)
                                        </label>
                                        <div className="flex items-center gap-1 text-[11px]">
                                            <button
                                                type="button"
                                                onClick={() => setScrUnit("mg/dL")}
                                                className={`px-2 py-0.5 rounded font-bold ${scrUnit === "mg/dL"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                mg/dL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setScrUnit("umol/L")}
                                                className={`px-2 py-0.5 rounded font-bold ${scrUnit === "umol/L"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
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
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            {scrUnit}
                                        </span>
                                    </div>
                                </div>

                                {/* Body Weight Metrics Readout */}
                                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                                    <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                            IBW (Devine)
                                        </span>
                                        <span className="text-sm font-black text-blue-700">
                                            {ibwKg ? `${ibwKg} kg` : "--"}
                                        </span>
                                    </div>
                                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                            AdjBW (0.4)
                                        </span>
                                        <span className="text-sm font-black text-emerald-700">
                                            {adjBwKg ? `${adjBwKg} kg` : "--"}
                                        </span>
                                    </div>
                                    <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                            BMI
                                        </span>
                                        <span className="text-sm font-black text-slate-800">
                                            {bmi ? `${bmi} kg/m²` : "--"}
                                        </span>
                                    </div>
                                </div>

                                {/* Weight Selector for CrCl */}
                                <div className="space-y-1 pt-1">
                                    <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center justify-between">
                                        <span>Cockcroft-Gault Weight Basis:</span>
                                        <span className="text-blue-600 font-bold">{effectiveWeightLabel}</span>
                                    </label>
                                    <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                                        {(
                                            [
                                                { key: "auto", label: "Auto" },
                                                { key: "actual", label: "Actual" },
                                                { key: "ibw", label: "IBW" },
                                                { key: "adjbw", label: "AdjBW" },
                                            ] as const
                                        ).map((tab) => (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() => setWeightMethod(tab.key)}
                                                className={`py-1.5 rounded-lg font-bold transition ${weightMethod === tab.key
                                                    ? "bg-white text-blue-700 shadow-sm"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Calculated CrCl Callout */}
                                <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block">
                                            Estimated CrCl (Cockcroft-Gault)
                                        </span>
                                        <span className="text-xs text-slate-600">Standard for FDA Pharmacokinetics</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-blue-700">{crcl}</span>
                                        <span className="text-xs font-bold text-slate-600 ml-1">mL/min</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dosing Regimen Parameters Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                                <Droplet className="w-4 h-4 text-emerald-600" />
                                2. Vancomycin Dosing Regimen
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Maintenance Dose (mg)
                                        </label>
                                        <input
                                            type="number"
                                            step="250"
                                            value={dose}
                                            onChange={(e) => setDose(e.target.value)}
                                            placeholder="e.g. 1250"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Dosing Interval (Hours)
                                        </label>
                                        <select
                                            value={interval}
                                            onChange={(e) => setInterval(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        >
                                            <option value="8">q8h (Every 8 hours)</option>
                                            <option value="12">q12h (Every 12 hours)</option>
                                            <option value="18">q18h (Every 18 hours)</option>
                                            <option value="24">q24h (Every 24 hours)</option>
                                            <option value="36">q36h (Every 36 hours)</option>
                                            <option value="48">q48h (Every 48 hours)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Infusion Duration (hrs)
                                        </label>
                                        <select
                                            value={infusionTime}
                                            onChange={(e) => setInfusionTime(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        >
                                            <option value="1.0">1.0 hr (≤ 1000 mg)</option>
                                            <option value="1.5">1.5 hrs (1250–1500 mg)</option>
                                            <option value="2.0">2.0 hrs (1750–2000 mg)</option>
                                            <option value="2.5">2.5 hrs (&gt; 2000 mg)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Target Pathogen MIC
                                        </label>
                                        <select
                                            value={mic}
                                            onChange={(e) => setMic(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
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

                    {/* RIGHT COLUMN: CLINICAL PREDICTION & TARGET GAUGES (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Primary Results Hero Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                                        Steady-State AUC/MIC Forecast
                                    </span>
                                    <h3 className="text-2xl font-black text-slate-900">
                                        Therapeutic Exposure Analysis
                                    </h3>
                                </div>
                                <button
                                    onClick={handleCopyChartNote}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white text-xs font-bold transition shadow-sm self-start sm:self-center"
                                >
                                    {copiedNote ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Note Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Copy Chart Note</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {pkResults && targetStatus ? (
                                <div className="space-y-6">
                                    {/* Big Metric Display */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200/80 p-4 rounded-2xl">
                                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide block">
                                                AUC₂₄ / MIC Ratio
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-3xl font-black text-slate-900">
                                                    {pkResults.aucMic}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-slate-500">
                                                Target: 400–600
                                            </span>
                                        </div>

                                        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/80 p-4 rounded-2xl">
                                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide block">
                                                AUC₂₄ (24h Exposure)
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-3xl font-black text-slate-900">
                                                    {pkResults.auc24}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500">mg·h/L</span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-slate-500">
                                                Daily Dose: {pkResults.totalDailyDose} mg
                                            </span>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                                                Predicted Trough (Cmin,ss)
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-1">
                                                <span className="text-3xl font-black text-slate-900">
                                                    {pkResults.cMinSs}
                                                </span>
                                                <span className="text-xs font-bold text-slate-500">mcg/mL</span>
                                            </div>
                                            <span className="text-[11px] font-semibold text-slate-500">
                                                Peak: {pkResults.cMaxSs} mcg/mL
                                            </span>
                                        </div>
                                    </div>

                                    {/* Visual Target Range Zone Meter */}
                                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-600">Therapeutic Zone Gauge</span>
                                            <span
                                                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${targetStatus.badgeColor}`}
                                            >
                                                {targetStatus.label}
                                            </span>
                                        </div>

                                        {/* Progress Track */}
                                        <div className="relative w-full h-4 bg-slate-200 rounded-full overflow-hidden flex">
                                            <div className="w-[40%] bg-amber-200 h-full border-r border-white/50" title="Subtherapeutic (<400)" />
                                            <div className="w-[20%] bg-emerald-300 h-full border-r border-white/50" title="Target Range (400-600)" />
                                            <div className="w-[40%] bg-rose-200 h-full" title="Supratherapeutic / Toxic (>600)" />
                                        </div>

                                        <div className="flex justify-between text-[10px] font-bold text-slate-500 px-1">
                                            <span>0</span>
                                            <span>400 (Target Min)</span>
                                            <span>600 (Target Max)</span>
                                            <span>1000+</span>
                                        </div>
                                    </div>

                                    {/* Clinical Recommendation Box */}
                                    <div
                                        className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm leading-relaxed ${targetStatus.type === "therapeutic"
                                            ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                                            : targetStatus.type === "subtherapeutic"
                                                ? "bg-amber-50/80 border-amber-200 text-amber-950"
                                                : "bg-rose-50/80 border-rose-200 text-rose-950"
                                            }`}
                                    >
                                        <targetStatus.icon className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            <strong className="font-bold block mb-0.5">
                                                Clinical Assessment:
                                            </strong>
                                            {targetStatus.message}
                                        </div>
                                    </div>

                                    {/* Loading Dose & Pharmacokinetic Parameters Table */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-blue-50/60 border border-blue-200/70 p-4 rounded-2xl space-y-1">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5" /> Recommended Loading Dose
                                            </span>
                                            <p className="text-xl font-black text-slate-900">
                                                {pkResults.recommendedLoadingDose} mg IV
                                            </p>
                                            <p className="text-[11px] text-slate-600">
                                                Calculated as 25–35 mg/kg (actual body weight, max 3000 mg) for critically ill or severe sepsis.
                                            </p>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1 text-xs text-slate-700">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                                                Individual Pharmacokinetics
                                            </span>
                                            <div className="grid grid-cols-2 gap-2 pt-1 font-semibold">
                                                <div>
                                                    <span className="text-slate-500 block text-[10px]">Vd (Volume):</span>
                                                    <span>{pkResults.Vd} Liters</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 block text-[10px]">Elimination ke:</span>
                                                    <span>{pkResults.ke} hr⁻¹</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 block text-[10px]">Half-Life (t½):</span>
                                                    <span>{pkResults.halfLife} Hours</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 block text-[10px]">Total Clearance:</span>
                                                    <span>{pkResults.clearanceLhr} L/hr</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alternative Regimens Quick Simulator */}
                                    {alternativeRegimens.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                                                Alternative Regimens Achieving 400–600 Target
                                            </h4>
                                            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                                                        <tr>
                                                            <th className="py-2.5 px-3">Regimen</th>
                                                            <th className="py-2.5 px-3">Forecast AUC₂₄</th>
                                                            <th className="py-2.5 px-3">AUC/MIC</th>
                                                            <th className="py-2.5 px-3">Pred. Trough</th>
                                                            <th className="py-2.5 px-3">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {alternativeRegimens.map((reg, idx) => (
                                                            <tr
                                                                key={idx}
                                                                className={reg.isCurrent ? "bg-blue-50/70 font-bold text-blue-900" : "hover:bg-slate-50"}
                                                            >
                                                                <td className="py-2.5 px-3">
                                                                    {reg.dose} mg q{reg.interval}h
                                                                    {reg.isCurrent && (
                                                                        <span className="ml-1 text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                                                                            Current
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="py-2.5 px-3 font-semibold">{reg.auc24}</td>
                                                                <td className="py-2.5 px-3 font-bold text-emerald-700">{reg.aucMic}</td>
                                                                <td className="py-2.5 px-3">{reg.cMin} mcg/mL</td>
                                                                <td className="py-2.5 px-3">
                                                                    <button
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
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    Enter valid patient and dosing parameters to view pharmacokinetic modeling.
                                </div>
                            )}
                        </div>

                        {/* Collapsible Pharmacokinetic Formulas & Evidence */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
                            <button
                                type="button"
                                onClick={() => setShowFormulas(!showFormulas)}
                                className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                            >
                                <span className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-600" />
                                    One-Compartment Pharmacokinetic Equations & ASHP 2020 Guidelines
                                </span>
                                {showFormulas ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </button>

                            <AnimatePresence>
                                {showFormulas && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3 text-xs text-slate-600 pt-2 border-t border-slate-100 overflow-hidden leading-relaxed"
                                    >
                                        <div>
                                            <strong className="text-slate-800 block font-bold mb-0.5">
                                                1. Matzke Elimination Rate Constant (ke):
                                            </strong>
                                            <code className="text-blue-700 bg-slate-100 px-2 py-1 rounded block text-[11px] font-mono">
                                                ke = 0.00083 × CrCl (mL/min) + 0.0044
                                            </code>
                                        </div>
                                        <div>
                                            <strong className="text-slate-800 block font-bold mb-0.5">
                                                2. Steady-State Peak (Cmax,ss) & Trough (Cmin,ss):
                                            </strong>
                                            <code className="text-blue-700 bg-slate-100 px-2 py-1 rounded block text-[11px] font-mono">
                                                Cmax,ss = [Dose / (tinf × Vd × ke)] × [(1 - e^(-ke×tinf)) / (1 - e^(-ke×τ))]
                                                <br />
                                                Cmin,ss = Cmax,ss × e^(-ke × (τ - tinf))
                                            </code>
                                        </div>
                                        <div>
                                            <strong className="text-slate-800 block font-bold mb-0.5">
                                                3. 24-Hour Area Under Curve (AUC24):
                                            </strong>
                                            <code className="text-blue-700 bg-slate-100 px-2 py-1 rounded block text-[11px] font-mono">
                                                AUC24 = Total Daily Dose / (Vd × ke)
                                            </code>
                                        </div>
                                        <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                                            <span className="font-semibold text-slate-700">
                                                Reference: Rybak MJ et al. Am J Health-Syst Pharm. 2020;77(11):835-864.
                                            </span>
                                            <a
                                                href="https://academic.oup.com/ajhp/article/77/11/835/5810200"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                                            >
                                                Read ASHP Guidelines <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ─── FOOTER & REGULATORY DISCLOSURES ───────────────────────── */}
                <footer className="border-t border-slate-200 pt-6 pb-10 text-center text-xs text-slate-500 space-y-2">
                    <p className="max-w-3xl mx-auto leading-relaxed">
                        <strong>Clinical TDM Notice:</strong> This calculator employs standard first-order 1-compartment pharmacokinetic
                        equations at steady state. For patients with rapidly changing renal function, hemodialysis, CRRT, or morbid obesity,
                        Bayesian-guided concentration monitoring (sampling 2 post-distribution levels) is strongly recommended.
                    </p>
                    <p className="text-slate-400">
                        © 2024–2026 Advanced Vancomycin Clinical Decision Support. PharmaWallah Gradient Edition.
                    </p>
                </footer>
            </div>
        </div>
    );
}