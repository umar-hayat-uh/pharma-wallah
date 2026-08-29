"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Syringe,
  Calculator,
  Activity,
  RefreshCw,
  AlertCircle,
  Target,
  Coffee,
  Scale,
  Droplets,
  BookOpen,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
} from "lucide-react";

// ─── STRICT TYPES & INTERFACES ───────────────────────────────────────

export type RuleISF = "1500" | "1700" | "1800" | "2000" | "2200";
export type RuleICR = "300" | "400" | "450" | "500";
export type GlucoseUnit = "mg/dL" | "mmol/L";
export type WeightUnit = "kg" | "lbs";

export interface PatientPreset {
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

export interface InsulinCalculationResult {
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
  sensitivityColor: string;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function InsulinDoseCalculator() {
  // Core Parameters
  const [totalDailyDose, setTotalDailyDose] = useState<string>("50");
  const [weight, setWeight] = useState<string>("70");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
  const [tddMultiplier, setTddMultiplier] = useState<string>("0.55");

  // Rules & Units
  const [ruleISF, setRuleISF] = useState<RuleISF>("1800");
  const [ruleICR, setRuleICR] = useState<RuleICR>("500");
  const [glucoseUnit, setGlucoseUnit] = useState<GlucoseUnit>("mg/dL");

  // Pre-prandial Glucose & Meal Inputs
  const [targetGlucose, setTargetGlucose] = useState<string>("110");
  const [currentGlucose, setCurrentGlucose] = useState<string>("210");
  const [carbIntake, setCarbIntake] = useState<string>("60");

  // UI States
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Conversion Constant
  const MMOL_CONVERSION_FACTOR = 18.0182;

  // Clinical Patient Archetypes
  const samplePatients: PatientPreset[] = [
    { name: "Adult Type 1", tag: "TDD 50U", tdd: "50", weight: "70", weightUnit: "kg", isfRule: "1800", icrRule: "500", targetBg: "110", currentBg: "210", carbs: "60" },
    { name: "Sensitive / Honeymoon", tag: "TDD 24U", tdd: "24", weight: "55", weightUnit: "kg", isfRule: "2000", icrRule: "500", targetBg: "100", currentBg: "180", carbs: "45" },
    { name: "Insulin Resistant (T2D)", tag: "TDD 95U", tdd: "95", weight: "95", weightUnit: "kg", isfRule: "1500", icrRule: "300", targetBg: "120", currentBg: "240", carbs: "75" },
    { name: "Adolescent (Puberty)", tag: "TDD 65U", tdd: "65", weight: "60", weightUnit: "kg", isfRule: "1700", icrRule: "400", targetBg: "110", currentBg: "220", carbs: "80" },
    { name: "Elderly Mild T2D", tag: "TDD 32U", tdd: "32", weight: "68", weightUnit: "kg", isfRule: "1800", icrRule: "500", targetBg: "130", currentBg: "190", carbs: "40" },
  ];

  // Normalized Weight in kg
  const weightKg = useMemo(() => {
    const raw = parseFloat(weight);
    if (isNaN(raw) || raw <= 0) return 0;
    return weightUnit === "lbs" ? raw * 0.453592 : raw;
  }, [weight, weightUnit]);

  // Parsed Numeric Inputs
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

  // ─── PURE REACT STATE DERIVATION (NO ASYNC DISCREPANCIES) ──────────
  const calculations = useMemo<InsulinCalculationResult | null>(() => {
    if (tddNum <= 0) return null;

    // 1. ISF in mg/dL: Rule / TDD
    const isfMgDl = parseInt(ruleISF, 10) / tddNum;
    // ISF in mmol/L: (Rule / 18.0182) / TDD
    const isfMmol = isfMgDl / MMOL_CONVERSION_FACTOR;
    const activeISF = glucoseUnit === "mg/dL" ? isfMgDl : isfMmol;

    // 2. ICR (Grams of carbs covered by 1 Unit of insulin): Rule / TDD
    const icrGramsPerUnit = parseInt(ruleICR, 10) / tddNum;

    // 3. Basal / Bolus 50:50 Distribution
    const basalTotal = tddNum * 0.5;
    const bolusTotal = tddNum * 0.5;
    const estimatedPerMealBolus = bolusTotal / 3;

    // 4. Correction Dose: (Current BG - Target BG) / ISF
    const bgDelta = currentBgNum - targetBgNum;
    let correctionDose = 0;
    let isHypoglycemic = false;

    // Hypoglycemia threshold (< 70 mg/dL or < 3.9 mmol/L)
    if (glucoseUnit === "mg/dL" && currentBgNum < 70 && currentBgNum > 0) {
      isHypoglycemic = true;
    } else if (glucoseUnit === "mmol/L" && currentBgNum < 3.9 && currentBgNum > 0) {
      isHypoglycemic = true;
    }

    if (bgDelta > 0 && activeISF > 0 && !isHypoglycemic) {
      correctionDose = bgDelta / activeISF;
    }

    // 5. Meal Dose: Carbs (g) / ICR
    let mealDose = 0;
    if (carbsNum > 0 && icrGramsPerUnit > 0) {
      mealDose = carbsNum / icrGramsPerUnit;
    }

    // 6. Total Recommended Bolus
    const totalDose = correctionDose + mealDose;
    const mealFraction = totalDose > 0 ? (mealDose / totalDose) * 100 : 0;
    const correctionFraction = totalDose > 0 ? (correctionDose / totalDose) * 100 : 0;

    // 7. Sensitivity Classification
    let sensitivityLabel = "Average Sensitivity";
    let sensitivityColor = "text-blue-800 bg-blue-50 border-blue-200";

    if (isfMgDl > 50) {
      sensitivityLabel = "Highly Sensitive";
      sensitivityColor = "text-emerald-800 bg-emerald-50 border-emerald-200";
    } else if (isfMgDl >= 30) {
      sensitivityLabel = "Average Sensitivity";
      sensitivityColor = "text-blue-800 bg-blue-50 border-blue-200";
    } else if (isfMgDl >= 18) {
      sensitivityLabel = "Moderate Resistance";
      sensitivityColor = "text-amber-800 bg-amber-50 border-amber-200";
    } else {
      sensitivityLabel = "Severe Resistance";
      sensitivityColor = "text-rose-800 bg-rose-50 border-rose-200";
    }

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
      sensitivityColor,
    };
  }, [tddNum, ruleISF, ruleICR, glucoseUnit, currentBgNum, targetBgNum, carbsNum, weightKg]);

  // Estimate TDD from Body Weight
  const handleEstimateTDD = () => {
    if (weightKg > 0) {
      const mult = parseFloat(tddMultiplier) || 0.55;
      const estimated = weightKg * mult;
      setTotalDailyDose(estimated.toFixed(1));
    }
  };

  // Switch Glucose Units & Convert Input Values
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

  // Load Preset
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

  // Reset
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

  // Copy Regimen Consult Note
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

    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }, [calculations, tddNum, weightKg, ruleISF, ruleICR, currentBgNum, targetBgNum, carbsNum, glucoseUnit]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ─── HEADER ──────────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                <Syringe className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Insulin Dose & Sensitivity Calculator
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                    <Sparkles className="h-3 w-3 text-yellow-300" /> ADA Clinical Edition
                  </span>
                </div>
                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                  Rule of 1800/1500 ISF, Rule of 500 ICR, Basal/Bolus 50:50 distribution & smart meal bolus
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

        {/* ─── STEP-BY-STEP DIRECTIONS / CLINICAL PROTOCOL ─────────────────── */}
        {showInstructions && (
          <div className="rounded-2xl border border-blue-100 bg-white/90 p-4 sm:p-6 shadow-sm backdrop-blur-sm transition-all animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span>Clinical Instructions & Dosing Protocol</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">3-Step Workflow</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Define Total Daily Dose (TDD)</strong>
                  Enter known 24-hr insulin total or estimate from body weight (0.4 to 1.0 Units/kg).
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  2
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Select Rules & Units</strong>
                  Choose ISF rule (1800 for rapid, 1500 for regular) and ICR rule (500/400). Toggle between mg/dL and mmol/L.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  3
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Calculate Meal + Correction Bolus</strong>
                  Input current BG, target BG, and meal carbohydrates to receive exact recommended dose.
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
                key={p.name}
                type="button"
                onClick={() => handleLoadPreset(p)}
                className="group p-2.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-blue-50 hover:border-blue-300 text-left transition flex flex-col justify-between"
              >
                <div className="font-bold text-xs text-gray-900 group-hover:text-blue-700">
                  {p.name}
                </div>
                <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                  {p.tag} ({p.weight} {p.weightUnit})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── MAIN WORKSPACE GRID: 12 COLS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT: PARAMETERS, RULES & MEAL DOSING (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">

            {/* CARD 1: PATIENT TDD & WEIGHT-BASED ESTIMATION */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-600" />
                  1. Total Daily Dose (TDD) Baseline
                </h2>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Manual TDD Input */}
                <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                    Known Total Daily Dose (TDD)
                  </label>
                  <div className="relative rounded-lg border border-gray-300 bg-white overflow-hidden focus-within:border-blue-500">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={totalDailyDose}
                      onChange={(e) => setTotalDailyDose(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full px-3 py-2 text-base font-bold text-gray-900 focus:outline-none pr-16"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-gray-400">
                      Units/day
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Sum of 24-hr basal + meal boluses</p>
                </div>

                {/* Weight-Based Estimator */}
                <div className="rounded-xl border border-green-200/70 bg-green-50/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-green-600" /> Weight Estimator
                    </label>
                    <div className="inline-flex rounded bg-green-100 p-0.5 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setWeightUnit("kg")}
                        className={`px-1.5 py-0.5 rounded ${weightUnit === "kg" ? "bg-white text-green-800 shadow-xs" : "text-green-700"}`}
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => setWeightUnit("lbs")}
                        className={`px-1.5 py-0.5 rounded ${weightUnit === "lbs" ? "bg-white text-green-800 shadow-xs" : "text-green-700"}`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.5"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="e.g. 70"
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-green-500"
                    />
                    <select
                      value={tddMultiplier}
                      onChange={(e) => setTddMultiplier(e.target.value)}
                      className="rounded-lg border border-gray-300 bg-white px-2 text-xs font-bold text-gray-700 focus:outline-none"
                    >
                      <option value="0.4">0.4 U/kg (Sensitive)</option>
                      <option value="0.55">0.55 U/kg (Standard)</option>
                      <option value="0.7">0.7 U/kg (Resistant)</option>
                      <option value="1.0">1.0 U/kg (High)</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleEstimateTDD}
                      className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition shadow-xs shrink-0"
                    >
                      Estimate
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Calculates ~{((parseFloat(weight) || 0) * (parseFloat(tddMultiplier) || 0.55)).toFixed(1)} Units for {weight} {weightUnit}
                  </p>
                </div>
              </div>

              {/* Basal vs Bolus 50:50 Distribution Readout */}
              {calculations && (
                <div className="grid grid-cols-3 gap-2.5 pt-2 text-center text-xs">
                  <div className="rounded-xl bg-blue-50/70 p-2.5 border border-blue-100">
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">24-hr Basal (50%)</span>
                    <span className="text-base font-black text-blue-700">{calculations.basalTotal.toFixed(1)} U</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Glargine / Degludec</span>
                  </div>
                  <div className="rounded-xl bg-green-50/70 p-2.5 border border-green-100">
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">Total Meal Bolus (50%)</span>
                    <span className="text-base font-black text-green-700">{calculations.bolusTotal.toFixed(1)} U</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Across 24 hours</span>
                  </div>
                  <div className="rounded-xl bg-teal-50/70 p-2.5 border border-teal-100">
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">Est. per Meal</span>
                    <span className="text-base font-black text-teal-800">~{calculations.estimatedPerMealBolus.toFixed(1)} U</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Average 3 meals</span>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: SENSITIVITY & CARB COVERAGE RULES */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-teal-600" />
                  2. Rule Selection & Glucose Units
                </h2>

                {/* Glucose Unit Radio Pills */}
                <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleToggleGlucoseUnit("mg/dL")}
                    className={`px-3 py-1 rounded-lg transition ${
                      glucoseUnit === "mg/dL"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    mg/dL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleGlucoseUnit("mmol/L")}
                    className={`px-3 py-1 rounded-lg transition ${
                      glucoseUnit === "mmol/L"
                        ? "bg-white text-blue-700 shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    mmol/L
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ISF Rule */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase">
                      ISF Rule (Sensitivity)
                    </label>
                    <span className="text-[10px] text-blue-600 font-semibold">
                      {ruleISF === "1800" ? "Rapid-Acting" : ruleISF === "1500" ? "Regular Insulin" : "Custom"}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-xs font-bold">
                    {(["1500", "1700", "1800", "2000", "2200"] as RuleISF[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRuleISF(r)}
                        className={`py-1.5 rounded-lg border transition text-center ${
                          ruleISF === r
                            ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    ISF = {ruleISF} / TDD (mg/dL per Unit). Higher number = more sensitive.
                  </p>
                </div>

                {/* ICR Rule */}
                <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 uppercase">
                      ICR Rule (Carb Ratio)
                    </label>
                    <span className="text-[10px] text-green-600 font-semibold">
                      {ruleICR === "500" ? "Rapid-Acting" : "Resistant / Regular"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-xs font-bold">
                    {(["300", "400", "450", "500"] as RuleICR[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRuleICR(r)}
                        className={`py-1.5 rounded-lg border transition text-center ${
                          ruleICR === r
                            ? "border-green-600 bg-green-600 text-white shadow-xs"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    ICR = {ruleICR} / TDD (grams of carbs covered per 1 Unit).
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 3: ACTIVE MEAL & GLUCOSE CORRECTION CALCULATOR */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Target className="h-5 w-5 text-green-600" />
                3. Pre-Prandial Blood Glucose & Carbohydrate Intake
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Current Glucose */}
                <div className="rounded-xl border border-blue-200/70 bg-blue-50/30 p-3">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Current Glucose ({glucoseUnit})
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={currentGlucose}
                    onChange={(e) => setCurrentGlucose(e.target.value)}
                    placeholder={glucoseUnit === "mg/dL" ? "210" : "11.6"}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-base font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Fingerstick or CGM</p>
                </div>

                {/* Target Glucose */}
                <div className="rounded-xl border border-green-200/70 bg-green-50/30 p-3">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Target Glucose ({glucoseUnit})
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={targetGlucose}
                    onChange={(e) => setTargetGlucose(e.target.value)}
                    placeholder={glucoseUnit === "mg/dL" ? "110" : "6.1"}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-base font-bold text-gray-900 focus:outline-none focus:border-green-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Pre-meal target</p>
                </div>

                {/* Meal Carbohydrates */}
                <div className="rounded-xl border border-teal-200/70 bg-teal-50/30 p-3">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Meal Carbs (grams)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={carbIntake}
                    onChange={(e) => setCarbIntake(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-base font-bold text-gray-900 focus:outline-none focus:border-teal-500"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Total dietary carbohydrates</p>
                </div>
              </div>
            </div>

            {/* COLLAPSIBLE PHYSIOLOGY & FORMULAS REFERENCE */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition"
              >
                <span className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Clinical Pharmacology & Insulin Equations (ADA Standards)
                </span>
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showDetails && (
                <div className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100 leading-relaxed">
                  <div>
                    <strong className="text-gray-900 block mb-0.5">1. Insulin Sensitivity Factor (ISF / Correction Factor):</strong>
                    <code className="text-blue-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                      ISF = Rule of 1800 / TDD (mg/dL lowered per 1 Unit) | For mmol/L: ISF / 18.018
                    </code>
                  </div>
                  <div>
                    <strong className="text-gray-900 block mb-0.5">2. Insulin-to-Carbohydrate Ratio (ICR):</strong>
                    <code className="text-green-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                      ICR = Rule of 500 / TDD (Grams of carbs covered per 1 Unit)
                    </code>
                  </div>
                  <div>
                    <strong className="text-gray-900 block mb-0.5">3. Total Bolus Dose Equation:</strong>
                    <code className="text-teal-700 bg-gray-100 p-1.5 rounded block text-[11px] font-mono">
                      Total Bolus = [(Current BG - Target BG) / ISF] + [Meal Carbs (g) / ICR]
                    </code>
                  </div>
                  <p className="text-[11px] text-gray-400 italic pt-1">
                    Guideline reference: American Diabetes Association (ADA) Standards of Medical Care in Diabetes & Endocrine Society Clinical Guidelines.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: HERO DOSE OUTPUT & SENSITIVITY BREAKDOWN (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">

            {/* HERO DOSE CARD */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Syringe className="h-5 w-5 text-green-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                    Recommended Bolus
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
                      <span>Copied!</span>
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
                      Total Recommended Dose (Rapid-Acting)
                    </span>
                    <div className="text-5xl font-black tracking-tight text-white">
                      {calculations.totalDose.toFixed(1)}{" "}
                      <span className="text-2xl font-bold text-green-200">Units</span>
                    </div>
                    <div className="mt-2 text-xs font-mono text-blue-100/90 bg-black/10 inline-block px-3 py-1 rounded-full">
                      {calculations.mealDose.toFixed(1)} U (Meal) + {calculations.correctionDose.toFixed(1)} U (Correction)
                    </div>
                  </div>

                  {/* Component Breakdown Cards */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                      <div className="text-[11px] text-blue-100 font-medium">Meal Carb Bolus</div>
                      <div className="text-xl font-bold text-white mt-0.5">
                        {calculations.mealDose.toFixed(1)}{" "}
                        <span className="text-xs font-normal text-blue-200">Units</span>
                      </div>
                      <span className="text-[10px] text-blue-200">
                        ({carbIntake}g @ 1:{calculations.icrGramsPerUnit.toFixed(1)})
                      </span>
                    </div>

                    <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
                      <div className="text-[11px] text-blue-100 font-medium">Correction Bolus</div>
                      <div className="text-xl font-bold text-white mt-0.5">
                        {calculations.correctionDose.toFixed(1)}{" "}
                        <span className="text-xs font-normal text-blue-200">Units</span>
                      </div>
                      <span className="text-[10px] text-blue-200">
                        (Delta {Math.max(0, currentBgNum - targetBgNum).toFixed(0)} {glucoseUnit})
                      </span>
                    </div>
                  </div>

                  {/* Stacked Ratio Visualizer Bar */}
                  {calculations.totalDose > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] text-blue-100">
                        <span>Meal vs Correction Ratio:</span>
                        <span className="font-semibold">
                          {calculations.mealFraction.toFixed(0)}% Meal / {calculations.correctionFraction.toFixed(0)}% Corr
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden flex border border-white/20">
                        <div
                          style={{ width: `${calculations.mealFraction}%` }}
                          className="bg-green-300 h-full"
                          title={`Meal: ${calculations.mealDose.toFixed(1)} U`}
                        />
                        <div
                          style={{ width: `${calculations.correctionFraction}%` }}
                          className="bg-yellow-300 h-full"
                          title={`Correction: ${calculations.correctionDose.toFixed(1)} U`}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-blue-100">
                        <span>Meal Dose ({calculations.mealDose.toFixed(1)} U)</span>
                        <span>Correction ({calculations.correctionDose.toFixed(1)} U)</span>
                      </div>
                    </div>
                  )}

                  {/* Hypoglycemia High-Visibility Alert */}
                  {calculations.isHypoglycemic && (
                    <div className="rounded-xl bg-rose-500/90 p-4 text-white shadow-lg border border-white/30 space-y-1">
                      <div className="flex items-center gap-2 font-black text-sm">
                        <AlertCircle className="h-5 w-5 text-yellow-300 shrink-0" />
                        <span>HYPOGLYCEMIA ALERT — DO NOT DOSE CORRECTION!</span>
                      </div>
                      <p className="text-xs text-rose-100 leading-relaxed">
                        Blood glucose is below safe limits (under 70 mg/dL or under 3.9 mmol/L). Treat immediately with <strong>15 grams of fast-acting glucose</strong> (4 oz juice, 3-4 glucose tablets) and re-check blood glucose in 15 minutes (Rule of 15).
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center text-blue-100">
                  <Calculator className="h-12 w-12 mx-auto mb-2 opacity-60" />
                  <p className="font-medium text-sm">Enter TDD to calculate sensitivity factors.</p>
                </div>
              )}
            </div>

            {/* SENSITIVITY FACTORS SUMMARY CARD */}
            {calculations && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    Sensitivity Parameters Breakdown
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${calculations.sensitivityColor}`}>
                    {calculations.sensitivityLabel}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* ISF Card */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                    <div>
                      <div className="font-bold text-blue-950">Insulin Sensitivity Factor (ISF)</div>
                      <div className="text-[11px] text-gray-500">1 Unit lowers blood glucose by:</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-blue-700">
                        {glucoseUnit === "mg/dL" ? `${calculations.isfMgDl.toFixed(1)} mg/dL` : `${calculations.isfMmol.toFixed(1)} mmol/L`}
                      </div>
                      <span className="text-[10px] text-gray-400">Rule of {ruleISF}</span>
                    </div>
                  </div>

                  {/* ICR Card */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-50/60 border border-green-100">
                    <div>
                      <div className="font-bold text-green-950">Insulin-to-Carb Ratio (ICR)</div>
                      <div className="text-[11px] text-gray-500">1 Unit covers:</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-green-700">
                        1 : {calculations.icrGramsPerUnit.toFixed(1)} g
                      </div>
                      <span className="text-[10px] text-gray-400">Rule of {ruleICR}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MANDATORY CLINICAL SAFETY WARNING */}
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-4 shadow-sm text-gray-700">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="font-semibold text-gray-900 block mb-0.5">Clinical Prescribing Advisory:</strong>
                  Insulin sensitivity is dynamically influenced by physical activity, acute illness, emotional stress, and insulin-on-board (IOB / stacking). Always cross-reference against continuous glucose monitoring (CGM) trends before administering stacked correction boluses.
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-200 pt-6 pb-10 text-center text-xs text-gray-500 space-y-2">
          <p className="max-w-4xl mx-auto leading-relaxed">
            <strong>Clinical Diabetes Management:</strong> Compliant with the 2024–2026 American Diabetes Association (ADA) Standards of Medical Care in Diabetes and Endocrine Society Clinical Guidelines.
          </p>
          <p className="text-gray-400">
            &copy; 2024–2026 Advanced Diabetes Clinical Decision Support.
          </p>
        </footer>

      </div>
    </section>
  );
}