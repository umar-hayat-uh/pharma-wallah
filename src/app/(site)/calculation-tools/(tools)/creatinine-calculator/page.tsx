"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Filter,
  Calculator,
  Activity,
  Droplet,
  Scale,
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
  Ruler,
  TrendingUp,
  Pill,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── STRICT TYPES & INTERFACES ───────────────────────────────────────

export type WeightMethod = "auto" | "actual" | "ibw" | "adjbw";
export type WeightUnit = "kg" | "lbs";
export type HeightUnit = "cm" | "in";
export type ScrUnit = "mg/dL" | "umol/L";

export interface PatientPreset {
  label: string;
  tag: string;
  age: string;
  sex: "male" | "female";
  weight: string;
  weightUnit: WeightUnit;
  height: string;
  heightUnit: HeightUnit;
  scr: string;
  scrUnit: ScrUnit;
}

export interface RenalTier {
  range: string;
  label: string;
  badgeColor: string;
  dosingAdvice: string;
  isCurrent: boolean;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function CreatinineClearanceCalculator() {
  // Input State
  const [age, setAge] = useState<string>("68");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [weight, setWeight] = useState<string>("82");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [height, setHeight] = useState<string>("175");
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
  const [serumCreatinine, setSerumCreatinine] = useState<string>("1.3");
  const [scrUnit, setScrUnit] = useState<ScrUnit>("mg/dL");

  // Advanced Options
  const [weightMethod, setWeightMethod] = useState<WeightMethod>("auto");
  const [roundLowScr, setRoundLowScr] = useState<boolean>(true); // Sarcopenia correction

  // UI States
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Patient Archetypes
  const samplePatients: PatientPreset[] = [
    { label: "Young Fit Adult", tag: "30y, CrCl ~115", age: "30", sex: "male", weight: "75", weightUnit: "kg", height: "180", heightUnit: "cm", scr: "0.9", scrUnit: "mg/dL" },
    { label: "Elderly CKD 3b", tag: "74y, CrCl ~38", age: "74", sex: "male", weight: "78", weightUnit: "kg", height: "172", heightUnit: "cm", scr: "1.7", scrUnit: "mg/dL" },
    { label: "Sarcopenic Low SCr", tag: "86y, SCr 0.5", age: "86", sex: "female", weight: "48", weightUnit: "kg", height: "158", heightUnit: "cm", scr: "0.5", scrUnit: "mg/dL" },
    { label: "Bariatric Obese", tag: "BMI 39 kg/m²", age: "54", sex: "female", weight: "112", weightUnit: "kg", height: "165", heightUnit: "cm", scr: "1.4", scrUnit: "mg/dL" },
    { label: "Severe CKD G4", tag: "CrCl ~18 mL/min", age: "79", sex: "male", weight: "68", weightUnit: "kg", height: "170", heightUnit: "cm", scr: "2.8", scrUnit: "mg/dL" },
  ];

  // Numeric Normalizations
  const numAge = parseFloat(age) || 0;
  const rawW = parseFloat(weight) || 0;
  const rawH = parseFloat(height) || 0;
  const rawScr = parseFloat(serumCreatinine) || 0;

  // Normalized Weight in kg
  const weightKg = useMemo(() => {
    if (weightUnit === "lbs") return Math.round(rawW * 0.453592 * 10) / 10;
    return rawW;
  }, [rawW, weightUnit]);

  // Normalized Height in cm & inches
  const heightCm = useMemo(() => {
    if (heightUnit === "in") return Math.round(rawH * 2.54 * 10) / 10;
    return rawH;
  }, [rawH, heightUnit]);

  const heightInches = useMemo(() => {
    if (heightUnit === "cm") return heightCm / 2.54;
    return rawH;
  }, [heightCm, rawH, heightUnit]);

  // Normalized SCr in mg/dL
  const scrMgDl = useMemo(() => {
    if (scrUnit === "umol/L") return Math.round((rawScr / 88.4) * 100) / 100;
    return rawScr;
  }, [rawScr, scrUnit]);

  // Sarcopenia-Corrected SCr
  const effectiveScr = useMemo(() => {
    if (roundLowScr && scrMgDl < 0.8 && scrMgDl > 0) {
      return 0.8;
    }
    return scrMgDl;
  }, [roundLowScr, scrMgDl]);

  // Anthropometrics: IBW, AdjBW, BMI
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

  // Auto-Weight Selection Rule
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

  // Effective Dosing Weight for CrCl
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

  // ─── CLEARANCE & eGFR CALCULATIONS ──────────────────────────────────
  const calculations = useMemo(() => {
    if (numAge <= 0 || effectiveCrClWeight <= 0 || effectiveScr <= 0) return null;

    // 1. Cockcroft-Gault CrCl (mL/min)
    let crcl = ((140 - numAge) * effectiveCrClWeight) / (72 * effectiveScr);
    if (sex === "female") crcl *= 0.85;
    crcl = Math.round(crcl * 10) / 10;

    // Unadjusted CrCl (using unrounded SCr)
    let unroundedCrcl = ((140 - numAge) * effectiveCrClWeight) / (72 * scrMgDl);
    if (sex === "female") unroundedCrcl *= 0.85;
    unroundedCrcl = Math.round(unroundedCrcl * 10) / 10;

    // 2. CKD-EPI 2021 Race-Free Equation (mL/min/1.73m²)
    const kappa = sex === "female" ? 0.7 : 0.9;
    const alpha = sex === "female" ? -0.241 : -0.302;
    const minScr = Math.min(scrMgDl / kappa, 1);
    const maxScr = Math.max(scrMgDl / kappa, 1);
    const femaleCoeff = sex === "female" ? 1.012 : 1.0;

    let egfr = 142 * Math.pow(minScr, alpha) * Math.pow(maxScr, -1.200) * Math.pow(0.9938, numAge) * femaleCoeff;
    egfr = Math.round(egfr * 10) / 10;

    // 3. KDIGO Staging
    let kdigoStage = "G1 (Normal / High)";
    let stageColor = "text-emerald-800 bg-emerald-50 border-emerald-300";
    let clinicalDosingAdvice = "Standard dosing protocols for all renally eliminated agents.";

    if (crcl >= 90) {
      kdigoStage = "G1 (Normal or High ≥ 90 mL/min)";
      stageColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
      clinicalDosingAdvice = "Normal renal clearance. Standard full-dose pharmacotherapy.";
    } else if (crcl >= 60) {
      kdigoStage = "G2 (Mildly Decreased: 60–89 mL/min)";
      stageColor = "bg-blue-100 text-blue-800 border-blue-300";
      clinicalDosingAdvice = "Mild clearance reduction. Routine monitoring; dose adjustments rarely required.";
    } else if (crcl >= 45) {
      kdigoStage = "G3a (Mild-to-Moderate: 45–59 mL/min)";
      stageColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
      clinicalDosingAdvice = "Moderate impairment. Dose reduction indicated for narrow-index renally cleared agents (e.g. Enoxaparin, DOACs, Aminoglycosides).";
    } else if (crcl >= 30) {
      kdigoStage = "G3b (Moderate-to-Severe: 30–44 mL/min)";
      stageColor = "bg-orange-100 text-orange-800 border-orange-300";
      clinicalDosingAdvice = "Moderate-to-severe impairment. Significant dose reductions required. Metformin max 1000 mg/day.";
    } else if (crcl >= 15) {
      kdigoStage = "G4 (Severely Decreased: 15–29 mL/min)";
      stageColor = "bg-rose-100 text-rose-800 border-rose-300";
      clinicalDosingAdvice = "Severe renal failure. Extended intervals / major dose reductions. Metformin contraindicated. Switch to level-guided dosing.";
    } else {
      kdigoStage = "G5 (Kidney Failure < 15 mL/min / ESRD)";
      stageColor = "bg-purple-100 text-purple-800 border-purple-300";
      clinicalDosingAdvice = "End-stage renal disease (ESRD). Avoid nephrotoxic agents. Pulse / post-dialysis redosing required.";
    }

    // 4. Lifespan CrCl vs Age Curve (Recharts)
    const trajectoryData = [];
    for (let a = 20; a <= 90; a += 5) {
      let cl = ((140 - a) * effectiveCrClWeight) / (72 * effectiveScr);
      if (sex === "female") cl *= 0.85;
      trajectoryData.push({
        age: a,
        clearance: Math.round(cl * 10) / 10,
      });
    }

    return {
      crcl,
      unroundedCrcl,
      egfr,
      kdigoStage,
      stageColor,
      clinicalDosingAdvice,
      trajectoryData,
    };
  }, [numAge, effectiveCrClWeight, effectiveScr, sex, scrMgDl]);

  // Renal Dosing Adjustment Tiers
  const renalTiers: RenalTier[] = useMemo(() => {
    const currentCrcl = calculations?.crcl ?? 100;
    return [
      {
        range: "> 50 mL/min",
        label: "Normal / Mild",
        badgeColor: "text-emerald-700 bg-emerald-50",
        dosingAdvice: "100% standard maintenance dose. Standard intervals.",
        isCurrent: currentCrcl > 50,
      },
      {
        range: "30 – 50 mL/min",
        label: "Moderate Reduction",
        badgeColor: "text-yellow-700 bg-yellow-50",
        dosingAdvice: "Reduce dose by 25–50% or extend dosing interval (e.g. q12h -> q24h).",
        isCurrent: currentCrcl >= 30 && currentCrcl <= 50,
      },
      {
        range: "15 – 29 mL/min",
        label: "Severe Reduction",
        badgeColor: "text-orange-700 bg-orange-50",
        dosingAdvice: "Reduce dose by 50–75% (e.g. Enoxaparin 1 mg/kg q24h, Cefepime 1g q24h).",
        isCurrent: currentCrcl >= 15 && currentCrcl < 30,
      },
      {
        range: "< 15 mL/min",
        label: "ESRD / Dialysis",
        badgeColor: "text-rose-700 bg-rose-50",
        dosingAdvice: "Avoid renally cleared drugs if possible. Dose post-hemodialysis.",
        isCurrent: currentCrcl < 15,
      },
    ];
  }, [calculations]);

  // Load Preset
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

  // Reset
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

  // Copy Consult Note
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

    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
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

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ─── HEADER ──────────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                <Filter className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Creatinine Clearance & Renal Dosing Suite
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                    <Sparkles className="h-3 w-3 text-yellow-300" /> Cockcroft-Gault & CKD-EPI
                  </span>
                </div>
                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                  Cockcroft-Gault CrCl, Devine/AdjBW obesity scaling, sarcopenia adjustments & KDIGO staging
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
                <span>Renal Clearance Estimation & Dosing Workflow</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">3-Step Protocol</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Enter Patient Vitals & SCr</strong>
                  Input age, sex, weight, height, and serum creatinine. Select units (mg/dL or µmol/L).
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  2
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Select Dosing Weight Method</strong>
                  Choose Auto-Selection (recommends AdjBW for BMI &gt; 30) or override with TBW / Devine IBW.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  3
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Review Dosing Tiers & Copy Note</strong>
                  Check active renal adjustment tier, lifelong clearance decline curve, and export the EHR note.
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

          {/* LEFT: PATIENT DATA & WEIGHT SELECTOR (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">

            {/* CARD 1: PATIENT MEASUREMENTS */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                  1. Patient Vitals & Serum Creatinine
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
                      placeholder="e.g. 68"
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
                        className={`py-1 text-xs font-bold rounded-md transition ${
                          sex === "male"
                            ? "bg-white text-blue-700 shadow-xs"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Male (1.00)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSex("female")}
                        className={`py-1 text-xs font-bold rounded-md transition ${
                          sex === "female"
                            ? "bg-white text-blue-700 shadow-xs"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Female (0.85)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Weight & Height */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Weight */}
                  <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                        <Scale className="h-3 w-3 text-blue-600" /> Body Weight
                      </label>
                      <div className="inline-flex rounded bg-blue-100 p-0.5 text-[10px] font-bold">
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
                        step="0.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                        {weightUnit}
                      </span>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-gray-700 uppercase flex items-center gap-1">
                        <Ruler className="h-3 w-3 text-gray-600" /> Height
                      </label>
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
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
                      />
                      <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                        {heightUnit}
                      </span>
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
                      value={serumCreatinine}
                      onChange={(e) => setSerumCreatinine(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-teal-500"
                    />
                    <span className="absolute right-3 top-2 text-xs font-bold text-gray-400">
                      {scrUnit}
                    </span>
                  </div>
                </div>

                {/* Sarcopenia Floor Toggle */}
                <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3 border border-gray-200 text-xs">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sarcopeniaToggle"
                      checked={roundLowScr}
                      onChange={(e) => setRoundLowScr(e.target.checked)}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="sarcopeniaToggle" className="text-gray-800 font-semibold cursor-pointer">
                      Sarcopenia Low-SCr Floor (Round SCr &lt; 0.8 to 0.8 mg/dL)
                    </label>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Elderly Safety</span>
                </div>
              </div>
            </div>

            {/* CARD 2: DOSING WEIGHT STRATEGY */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
                2. Dosing Weight Selection for Cockcroft-Gault
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                {[
                  { id: "auto", name: "Auto-Heuristic", sub: "Clinical Best Practice" },
                  { id: "actual", name: "Actual TBW", sub: `${weightKg} kg` },
                  { id: "ibw", name: "Devine IBW", sub: `${ibwDevine} kg` },
                  { id: "adjbw", name: "AdjBW (40%)", sub: `${adjBwKg} kg` },
                ].map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWeightMethod(w.id as WeightMethod)}
                    className={`p-2 rounded-xl border transition text-left ${
                      weightMethod === w.id
                        ? "border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500 font-extrabold"
                        : "border-gray-200 bg-gray-50/70 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div>{w.name}</div>
                    <div className="text-[10px] font-normal text-gray-500">{w.sub}</div>
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-gray-500 leading-snug pt-1">
                <strong>Active Basis:</strong> {effectiveWeightLabel} — {autoReason}
              </p>
            </div>

          </div>

          {/* RIGHT: HERO CrCl OUTPUT & RENAL DOSING TIERS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">

            {/* HERO CrCl CARD */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                    Creatinine Clearance & GFR Staging
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
                  {/* Primary Output Numbers Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Cockcroft-Gault CrCl */}
                    <div className="rounded-xl bg-white/15 p-4 backdrop-blur-md ring-1 ring-white/20 text-center">
                      <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block mb-1">
                        Cockcroft-Gault CrCl (Drug Dosing)
                      </span>
                      <div className="text-4xl sm:text-5xl font-black text-white">
                        {calculations.crcl}{" "}
                        <span className="text-lg font-bold text-green-200">mL/min</span>
                      </div>
                      <span className="text-[10px] text-blue-100 block mt-1">
                        Basis: {effectiveWeightLabel}
                      </span>
                    </div>

                    {/* CKD-EPI eGFR */}
                    <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm border border-white/15 text-center">
                      <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block mb-1">
                        CKD-EPI 2021 eGFR (CKD Staging)
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-white">
                        {calculations.egfr}{" "}
                        <span className="text-sm font-normal text-blue-100">mL/min/1.73m²</span>
                      </div>
                      <span className="text-[10px] text-green-200 block mt-1">
                        {calculations.kdigoStage}
                      </span>
                    </div>
                  </div>

                  {/* Clinical Dosing Directive */}
                  <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10 text-xs text-blue-100 space-y-1">
                    <strong className="text-white block font-bold">Pharmacotherapy Recommendation:</strong>
                    <p className="leading-relaxed text-[11px]">{calculations.clinicalDosingAdvice}</p>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-blue-100">
                  <Calculator className="h-12 w-12 mx-auto mb-2 opacity-60" />
                  <p className="font-medium text-sm">Enter patient parameters to compute clearance.</p>
                </div>
              )}
            </div>

            {/* RENAL DOSING ADJUSTMENT TIERS */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <Pill className="h-3.5 w-3.5 text-blue-600" />
                  Renal Dose Adjustment Tiers
                </h3>
                <span className="text-[10px] text-gray-400">Active Tier Highlighted</span>
              </div>

              <div className="space-y-2">
                {renalTiers.map((tier) => (
                  <div
                    key={tier.range}
                    className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      tier.isCurrent
                        ? "border-blue-500 bg-blue-50/90 shadow-sm ring-1 ring-blue-400"
                        : "border-gray-200 bg-gray-50/50 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${tier.badgeColor}`}>
                        {tier.range}
                      </span>
                      <strong className="text-xs text-gray-900">{tier.label}</strong>
                      {tier.isCurrent && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          Patient Tier
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-700 font-medium sm:text-right">
                      {tier.dosingAdvice}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RECHARTS CrCl vs. AGE TRAJECTORY GRAPH */}
            {calculations && calculations.trajectoryData.length > 0 && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                    CrCl Lifespan Decline Curve (Age 20–90)
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">Assumes constant SCr & Wt</span>
                </div>

                <div className="h-56 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={calculations.trajectoryData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis
                        dataKey="age"
                        fontSize={11}
                        tickMargin={6}
                        label={{
                          value: "Patient Age (Years)",
                          position: "insideBottom",
                          offset: -12,
                          fontSize: 11,
                          fontWeight: 600,
                          fill: "#6b7280",
                        }}
                      />
                      <YAxis
                        fontSize={11}
                        width={40}
                        label={{
                          value: "CrCl (mL/min)",
                          angle: -90,
                          position: "insideLeft",
                          offset: 10,
                          fontSize: 11,
                          fontWeight: 600,
                          fill: "#6b7280",
                        }}
                      />
                      <Tooltip
                        formatter={(value) => typeof value === "number" ? [`${value.toFixed(1)} mL/min`, "CrCl"] : ["N/A", "CrCl"]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="clearance"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* MANDATORY CLINICAL SAFETY WARNING */}
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-4 shadow-sm text-gray-700">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="font-semibold text-gray-900 block mb-0.5">Clinical Pharmacokinetics Advisory:</strong>
                  Cockcroft-Gault assumes steady-state renal function. In acute kidney injury (AKI) or rapidly fluctuating serum creatinine, calculated CrCl will significantly overestimate true glomerular filtration. Use clinical urine output and Bayesian TDM in unstable patients.
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
              Pharmacokinetic Equations & Nephrology Reference (Cockcroft-Gault & CKD-EPI)
            </span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDetails && (
            <div className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100 leading-relaxed">
              <div>
                <strong className="text-gray-900 block mb-0.5">1. Cockcroft-Gault Equation (1976):</strong>
                <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                  CrCl (mL/min) = [(140 - Age) × Weight (kg)] / [72 × SCr (mg/dL)] × (0.85 if Female)
                </code>
              </div>
              <div>
                <strong className="text-gray-900 block mb-0.5">2. Devine Ideal Body Weight (IBW) & Adjusted Body Weight (AdjBW):</strong>
                <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                  Male: IBW = 50.0 kg + 2.3 × (Height in inches - 60)
                  <br />
                  Female: IBW = 45.5 kg + 2.3 × (Height in inches - 60)
                  <br />
                  AdjBW (40%) = IBW + 0.4 × (Actual Weight - IBW)
                </code>
              </div>
              <div>
                <strong className="text-gray-900 block mb-0.5">3. CKD-EPI 2021 Race-Free Refit Equation:</strong>
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
            <strong>Renal Dosing Advisory:</strong> Compliant with FDA Guidance on Pharmacokinetics in Renal Impairment, KDIGO 2024 Clinical Practice Guidelines, and the 2021 CKD-EPI consensus.
          </p>
          <p className="text-gray-400">
            &copy; 2024–2026 Advanced Renal Pharmacotherapy & Creatinine Clearance Decision Support.
          </p>
        </footer>

      </div>
    </section>
  );
}