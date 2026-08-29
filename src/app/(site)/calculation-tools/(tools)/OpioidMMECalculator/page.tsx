"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Pill,
  AlertTriangle,
  Activity,
  Shield,
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
  Syringe,
  Plus,
  Trash2,
  Flame,
  ArrowRight,
} from "lucide-react";

// ─── STRICT TYPES & INTERFACES ───────────────────────────────────────

export type OpioidDrugId =
  | "morphine_po"
  | "morphine_iv"
  | "oxycodone_po"
  | "hydrocodone_po"
  | "hydromorphone_po"
  | "hydromorphone_iv"
  | "fentanyl_patch"
  | "fentanyl_iv"
  | "codeine_po"
  | "tramadol_po"
  | "oxymorphone_po"
  | "oxymorphone_iv"
  | "tapentadol_po";

export interface OpioidDrugConfig {
  id: OpioidDrugId;
  name: string;
  brand: string;
  route: "Oral" | "IV / SC" | "Transdermal";
  unit: "mg" | "mcg" | "mcg/hr";
  multiplierToOralMorphine: number; // Conversion to Oral Morphine Milligram Equivalent
  standardDoseUnit: string;
}

export interface RegimenItem {
  id: string;
  drugId: OpioidDrugId;
  dosePerAdmin: number;
  frequencyTimesPerDay: number;
}

export interface PatientPreset {
  label: string;
  tag: string;
  items: Array<{ drugId: OpioidDrugId; dosePerAdmin: number; frequencyTimesPerDay: number }>;
  targetDrug: OpioidDrugId;
  crossToleranceReduction: number;
  concomitantBenzo: boolean;
}

// ─── EQUIANALGESIC DRUG REGISTRY (CDC 2022 & NCCN STANDARDS) ──────────

const OPIOID_REGISTRY: Record<OpioidDrugId, OpioidDrugConfig> = {
  morphine_po: { id: "morphine_po", name: "Morphine (Oral)", brand: "MS Contin, Roxanol", route: "Oral", unit: "mg", multiplierToOralMorphine: 1.0, standardDoseUnit: "mg" },
  morphine_iv: { id: "morphine_iv", name: "Morphine (IV / SC)", brand: "Infumorph", route: "IV / SC", unit: "mg", multiplierToOralMorphine: 3.0, standardDoseUnit: "mg" },
  oxycodone_po: { id: "oxycodone_po", name: "Oxycodone (Oral)", brand: "OxyContin, Roxicodone, Percocet", route: "Oral", unit: "mg", multiplierToOralMorphine: 1.5, standardDoseUnit: "mg" },
  hydrocodone_po: { id: "hydrocodone_po", name: "Hydrocodone (Oral)", brand: "Norco, Vicodin, Zohydro", route: "Oral", unit: "mg", multiplierToOralMorphine: 1.0, standardDoseUnit: "mg" },
  hydromorphone_po: { id: "hydromorphone_po", name: "Hydromorphone (Oral)", brand: "Dilaudid PO", route: "Oral", unit: "mg", multiplierToOralMorphine: 4.0, standardDoseUnit: "mg" },
  hydromorphone_iv: { id: "hydromorphone_iv", name: "Hydromorphone (IV / SC)", brand: "Dilaudid IV", route: "IV / SC", unit: "mg", multiplierToOralMorphine: 20.0, standardDoseUnit: "mg" },
  fentanyl_patch: { id: "fentanyl_patch", name: "Fentanyl (Transdermal Patch)", brand: "Duragesic (q72h)", route: "Transdermal", unit: "mcg/hr", multiplierToOralMorphine: 2.4, standardDoseUnit: "mcg/hr" },
  fentanyl_iv: { id: "fentanyl_iv", name: "Fentanyl (IV / SC)", brand: "Sublimaze", route: "IV / SC", unit: "mcg", multiplierToOralMorphine: 0.3, standardDoseUnit: "mcg" },
  codeine_po: { id: "codeine_po", name: "Codeine (Oral)", brand: "Tylenol #3", route: "Oral", unit: "mg", multiplierToOralMorphine: 0.15, standardDoseUnit: "mg" },
  tramadol_po: { id: "tramadol_po", name: "Tramadol (Oral)", brand: "Ultram", route: "Oral", unit: "mg", multiplierToOralMorphine: 0.1, standardDoseUnit: "mg" },
  oxymorphone_po: { id: "oxymorphone_po", name: "Oxymorphone (Oral)", brand: "Opana PO", route: "Oral", unit: "mg", multiplierToOralMorphine: 3.0, standardDoseUnit: "mg" },
  oxymorphone_iv: { id: "oxymorphone_iv", name: "Oxymorphone (IV)", brand: "Opana IV", route: "IV / SC", unit: "mg", multiplierToOralMorphine: 30.0, standardDoseUnit: "mg" },
  tapentadol_po: { id: "tapentadol_po", name: "Tapentadol (Oral)", brand: "Nucynta", route: "Oral", unit: "mg", multiplierToOralMorphine: 0.4, standardDoseUnit: "mg" },
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function OpioidMMECalculator() {
  // Current Regimen State (Multi-drug support)
  const [regimen, setRegimen] = useState<RegimenItem[]>([
    { id: "1", drugId: "oxycodone_po", dosePerAdmin: 20, frequencyTimesPerDay: 2 }, // OxyContin 20mg BID
    { id: "2", drugId: "oxycodone_po", dosePerAdmin: 5, frequencyTimesPerDay: 2 },  // Breakthrough PRN (avg 2x/day)
  ]);

  // Opioid Rotation Target State
  const [targetDrugId, setTargetDrugId] = useState<OpioidDrugId>("morphine_po");
  const [crossToleranceReduction, setCrossToleranceReduction] = useState<number>(30); // 25% to 50% default
  const [targetFrequency, setTargetFrequency] = useState<number>(2); // e.g. BID

  // Patient Clinical Risk Modifiers
  const [concomitantBenzo, setConcomitantBenzo] = useState<boolean>(false);
  const [hasSleepApneaOrCopd, setHasSleepApneaOrCopd] = useState<boolean>(false);
  const [hasRenalOrHepaticImpairment, setHasRenalOrHepaticImpairment] = useState<boolean>(false);

  // UI States
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Patient Archetypes
  const samplePatients: PatientPreset[] = [
    {
      label: "Moderate Chronic Pain",
      tag: "Oxycodone 20mg BID + PRN",
      items: [
        { drugId: "oxycodone_po", dosePerAdmin: 20, frequencyTimesPerDay: 2 },
        { drugId: "oxycodone_po", dosePerAdmin: 5, frequencyTimesPerDay: 2 },
      ],
      targetDrug: "morphine_po",
      crossToleranceReduction: 30,
      concomitantBenzo: false,
    },
    {
      label: "IV to Oral Rotation",
      tag: "IV Dilaudid 1mg q4h -> Oral",
      items: [{ drugId: "hydromorphone_iv", dosePerAdmin: 1.0, frequencyTimesPerDay: 6 }],
      targetDrug: "oxycodone_po",
      crossToleranceReduction: 35,
      concomitantBenzo: false,
    },
    {
      label: "High-Dose Cancer Pain",
      tag: "Fentanyl 50mcg/hr + Dilaudid",
      items: [
        { drugId: "fentanyl_patch", dosePerAdmin: 50, frequencyTimesPerDay: 1 },
        { drugId: "hydromorphone_po", dosePerAdmin: 4, frequencyTimesPerDay: 3 },
      ],
      targetDrug: "morphine_po",
      crossToleranceReduction: 25,
      concomitantBenzo: false,
    },
    {
      label: "Frail Senior on Sedatives",
      tag: "Hydrocodone + Diazepam (High Risk)",
      items: [{ drugId: "hydrocodone_po", dosePerAdmin: 10, frequencyTimesPerDay: 4 }],
      targetDrug: "morphine_po",
      crossToleranceReduction: 50,
      concomitantBenzo: true,
    },
    {
      label: "Mild Post-Op Outpatient",
      tag: "Codeine 30mg q6h PRN",
      items: [{ drugId: "codeine_po", dosePerAdmin: 30, frequencyTimesPerDay: 3 }],
      targetDrug: "tramadol_po",
      crossToleranceReduction: 25,
      concomitantBenzo: false,
    },
  ];

  // ─── ADD / REMOVE REGIMEN ITEMS ─────────────────────────────────────
  const handleAddRegimenItem = () => {
    const newItem: RegimenItem = {
      id: Date.now().toString(),
      drugId: "morphine_po",
      dosePerAdmin: 15,
      frequencyTimesPerDay: 2,
    };
    setRegimen([...regimen, newItem]);
  };

  const handleRemoveRegimenItem = (id: string) => {
    if (regimen.length <= 1) return;
    setRegimen(regimen.filter((item) => item.id !== id));
  };

  const handleUpdateRegimenItem = (id: string, updates: Partial<RegimenItem>) => {
    setRegimen(regimen.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  // ─── TOTAL MME CALCULATIONS ─────────────────────────────────────────
  const calculations = useMemo(() => {
    // 1. Calculate MME for each line item
    let totalDailyMme = 0;

    const lineCalculations = regimen.map((item) => {
      const config = OPIOID_REGISTRY[item.drugId];
      let dailyQuantity = item.dosePerAdmin * item.frequencyTimesPerDay;
      if (item.drugId === "fentanyl_patch") {
        // Transdermal patch dose is in mcg/hr (constant delivery)
        dailyQuantity = item.dosePerAdmin;
      }
      const itemDailyMme = dailyQuantity * config.multiplierToOralMorphine;
      totalDailyMme += itemDailyMme;

      return {
        ...item,
        config,
        dailyQuantity,
        itemDailyMme: Math.round(itemDailyMme * 10) / 10,
      };
    });

    totalDailyMme = Math.round(totalDailyMme * 10) / 10;

    // 2. CDC Risk Stratification Tier
    let riskTier = "Low Overdose Risk (< 50 MME/day)";
    let riskBadgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
    let riskDirectives = "Standard monitoring. Reassess pain and functional goals at regular intervals.";
    let naloxoneMandated = false;

    if (totalDailyMme >= 200) {
      riskTier = "Extreme Risk (≥ 200 MME/day — Palliative / Active Cancer)";
      riskBadgeColor = "bg-purple-100 text-purple-900 border-purple-300";
      riskDirectives = "Requires urgent specialist pain / palliative co-management. Immediate Naloxone co-prescription mandatory. Screen for respiratory depression and sleep apnea.";
      naloxoneMandated = true;
    } else if (totalDailyMme >= 90) {
      riskTier = "High Overdose Risk (≥ 90 MME/day — CDC Threshold)";
      riskBadgeColor = "bg-rose-100 text-rose-800 border-rose-300";
      riskDirectives = "Substantial overdose hazard (9x–10x baseline). Prescribe Naloxone (Narcan) rescue. Frequent urine drug monitoring & consider tapering.";
      naloxoneMandated = true;
    } else if (totalDailyMme >= 50) {
      riskTier = "Moderate Risk (50–89 MME/day — CDC Caution)";
      riskBadgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
      riskDirectives = "Carefully assess individual benefit vs. harm. Offer Naloxone co-prescription. Avoid concurrent benzodiazepines.";
      naloxoneMandated = concomitantBenzo || hasSleepApneaOrCopd;
    } else {
      if (concomitantBenzo) {
        riskTier = "Elevated Risk (Concurrent Benzodiazepines / Sedatives)";
        riskBadgeColor = "bg-orange-100 text-orange-800 border-orange-300";
        riskDirectives = "FDA Black Box: Co-prescribing opioids and benzodiazepines causes profound sedation, respiratory depression, coma, and death. Co-prescribe Naloxone.";
        naloxoneMandated = true;
      }
    }

    // 3. Opioid Rotation & Equianalgesic Target Dosing
    const targetConfig = OPIOID_REGISTRY[targetDrugId];
    // 100% Unadjusted Equianalgesic 24h Target Dose
    const unadjusted24hTargetDose = totalDailyMme / targetConfig.multiplierToOralMorphine;

    // Cross-tolerance safety reduction (typically 25% to 50%)
    const reductionMultiplier = (100 - crossToleranceReduction) / 100;
    const safe24hTargetDose = Math.round(unadjusted24hTargetDose * reductionMultiplier * 10) / 10;

    // Individual dose per administration
    const safeDosePerAdmin = Math.round((safe24hTargetDose / targetFrequency) * 10) / 10;

    // Breakthrough Pain PRN Rescue Dose (10% to 15% of safe total daily dose q3-4h PRN)
    const breakthroughDoseMin = Math.round(safe24hTargetDose * 0.1 * 10) / 10;
    const breakthroughDoseMax = Math.round(safe24hTargetDose * 0.15 * 10) / 10;

    return {
      totalDailyMme,
      lineCalculations,
      riskTier,
      riskBadgeColor,
      riskDirectives,
      naloxoneMandated,
      targetConfig,
      unadjusted24hTargetDose: Math.round(unadjusted24hTargetDose * 10) / 10,
      safe24hTargetDose,
      safeDosePerAdmin,
      breakthroughDoseMin,
      breakthroughDoseMax,
    };
  }, [regimen, targetDrugId, crossToleranceReduction, targetFrequency, concomitantBenzo, hasSleepApneaOrCopd]);

  // Load Preset
  const handleLoadPreset = (p: PatientPreset) => {
    setRegimen(
      p.items.map((item, idx) => ({
        id: (idx + 1).toString(),
        drugId: item.drugId,
        dosePerAdmin: item.dosePerAdmin,
        frequencyTimesPerDay: item.frequencyTimesPerDay,
      }))
    );
    setTargetDrugId(p.targetDrug);
    setCrossToleranceReduction(p.crossToleranceReduction);
    setConcomitantBenzo(p.concomitantBenzo);
  };

  // Reset
  const handleReset = () => {
    setRegimen([{ id: "1", drugId: "oxycodone_po", dosePerAdmin: 20, frequencyTimesPerDay: 2 }]);
    setTargetDrugId("morphine_po");
    setCrossToleranceReduction(30);
    setTargetFrequency(2);
    setConcomitantBenzo(false);
    setHasSleepApneaOrCopd(false);
    setHasRenalOrHepaticImpairment(false);
  };

  // Copy Consult Note
  const handleCopyConsultNote = useCallback(() => {
    if (!calculations) return;

    const linesSummary = calculations.lineCalculations
      .map(
        (l) =>
          `  - ${l.config.name}: ${l.dosePerAdmin} ${l.config.unit} x ${l.frequencyTimesPerDay} times/day (${l.dailyQuantity} ${l.config.unit}/day) = ${l.itemDailyMme} MME/day`
      )
      .join("\n");

    const note = `=== CLINICAL OPIOID CONVERSION & MME CONSULT NOTE ===
CURRENT REGIMEN BREAKDOWN:
${linesSummary}
TOTAL BASELINE MME: ${calculations.totalDailyMme} MME/day

CDC RISK STRATIFICATION:
- Risk Tier: ${calculations.riskTier}
- Naloxone (Narcan) Status: ${calculations.naloxoneMandated ? "MANDATORY CO-PRESCRIPTION INDICATED" : "Standard clinical discretion"}
- High-Risk Co-prescriptions: ${concomitantBenzo ? "YES (Concurrent Benzodiazepine/Sedative - FDA Boxed Warning)" : "None noted"}
- Organ Impairment: ${hasRenalOrHepaticImpairment ? "Renal/Hepatic impairment present (use caution, extend intervals)" : "None"}

ROTATED TARGET OPIOID REGIMEN:
- Target Drug: ${calculations.targetConfig.name} (${calculations.targetConfig.brand})
- Incomplete Cross-Tolerance Reduction Applied: ${crossToleranceReduction}% Safety Reduction
- 100% Equianalgesic 24h Dose: ${calculations.unadjusted24hTargetDose} ${calculations.targetConfig.unit}/day
- RECOMMENDED INITIAL 24h DOSE: ${calculations.safe24hTargetDose} ${calculations.targetConfig.unit}/day
- Dosing Schedule: ${calculations.safeDosePerAdmin} ${calculations.targetConfig.unit} administered ${targetFrequency} times daily (e.g. q${Math.round(24 / targetFrequency)}h)
- Breakthrough Pain (PRN) Rescue Dose: ${calculations.breakthroughDoseMin}–${calculations.breakthroughDoseMax} ${calculations.targetConfig.unit} orally q3–4h PRN (10–15% of total daily dose)

SAFETY DIRECTIVES:
${calculations.riskDirectives}
Guideline Standard: CDC 2022 Clinical Practice Guideline for Prescribing Opioids & NCCN Guidelines.
Generated: ${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }, [calculations, crossToleranceReduction, targetFrequency, concomitantBenzo, hasRenalOrHepaticImpairment]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ─── HEADER ──────────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                <Pill className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Opioid MME & Equianalgesic Converter
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                    <Sparkles className="h-3 w-3 text-yellow-300" /> CDC 2022 & NCCN Standard
                  </span>
                </div>
                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                  Total daily MME calculation, incomplete cross-tolerance reduction & breakthrough rescue dosing
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
                <span>Opioid Rotation & Cross-Tolerance Safety Workflow</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">3-Step Protocol</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Sum Baseline Daily MME</strong>
                  Add all current scheduled and PRN opioids. The tool automatically computes total 24h Morphine Milligram Equivalents.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  2
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Apply Cross-Tolerance Safety Reduction</strong>
                  Reduce the equianalgesic target by 25%–50% (mandatory to prevent overdose due to opioid receptor naivety).
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  3
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Prescribe Rescue Dose & Naloxone</strong>
                  Calculate 10%–15% breakthrough PRN doses and screen for Naloxone (Narcan) co-prescription requirements.
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
            <span className="text-[11px] text-gray-400">Prescribing Scenarios</span>
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
                  {p.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── MAIN WORKSPACE GRID: 12 COLS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT: CURRENT REGIMEN BUILDER & ROTATION SELECTOR (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">

            {/* CARD 1: CURRENT OPIOID REGIMEN BUILDER */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    1. Current Opioid Regimen (Multi-Drug Sum)
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Include baseline scheduled doses and regular PRN breakthrough usage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>

              {/* Dynamic Regimen Rows */}
              <div className="space-y-3">
                {regimen.map((item, index) => {
                  const cfg = OPIOID_REGISTRY[item.drugId];
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 hover:bg-blue-50/30 transition space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                          <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px]">
                            {index + 1}
                          </span>
                          Opioid Drug #{index + 1}
                        </span>
                        {regimen.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRegimenItem(item.id)}
                            className="text-rose-500 hover:text-rose-700 p-1 rounded transition"
                            title="Remove drug"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Drug Selector */}
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                            Opioid Agent & Route
                          </label>
                          <select
                            value={item.drugId}
                            onChange={(e) =>
                              handleUpdateRegimenItem(item.id, { drugId: e.target.value as OpioidDrugId })
                            }
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                          >
                            {Object.values(OPIOID_REGISTRY).map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Dose per admin */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                            Dose ({cfg.unit})
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={item.dosePerAdmin}
                            onChange={(e) =>
                              handleUpdateRegimenItem(item.id, { dosePerAdmin: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Frequency times/day */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                            Times / Day (Freq)
                          </label>
                          <select
                            value={item.frequencyTimesPerDay}
                            disabled={item.drugId === "fentanyl_patch"}
                            onChange={(e) =>
                              handleUpdateRegimenItem(item.id, {
                                frequencyTimesPerDay: parseInt(e.target.value, 10) || 1,
                              })
                            }
                            className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                          >
                            <option value={1}>1x daily (q24h / Patch)</option>
                            <option value={2}>2x daily (q12h / BID)</option>
                            <option value={3}>3x daily (q8h / TID)</option>
                            <option value={4}>4x daily (q6h / QID)</option>
                            <option value={6}>6x daily (q4h PRN)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
                        <span>Brand: {cfg.brand}</span>
                        <span className="font-bold text-blue-700">
                          Multiplier: {cfg.multiplierToOralMorphine}x Oral Morphine
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Drug Button */}
              <button
                type="button"
                onClick={handleAddRegimenItem}
                className="w-full py-2 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="h-4 w-4" /> Add Another Opioid / PRN Breakthrough Agent
              </button>
            </div>

            {/* CARD 2: ROTATION TARGET & CROSS-TOLERANCE REDUCTION */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
                2. Target Opioid Rotation & Safety Reduction
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Target Drug Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Rotate To (Target Opioid)
                  </label>
                  <select
                    value={targetDrugId}
                    onChange={(e) => setTargetDrugId(e.target.value as OpioidDrugId)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                  >
                    {Object.values(OPIOID_REGISTRY).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.route})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Target Brand: {OPIOID_REGISTRY[targetDrugId].brand}
                  </span>
                </div>

                {/* Target Frequency */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    Target Dosing Frequency
                  </label>
                  <select
                    value={targetFrequency}
                    disabled={targetDrugId === "fentanyl_patch"}
                    onChange={(e) => setTargetFrequency(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1}>Once Daily (q24h / ER)</option>
                    <option value={2}>Twice Daily (q12h / BID - Standard)</option>
                    <option value={3}>Three Times Daily (q8h / TID)</option>
                    <option value={4}>Four Times Daily (q6h / QID)</option>
                    <option value={6}>Every 4 Hours (q4h / Acute)</option>
                  </select>
                </div>
              </div>

              {/* Cross-Tolerance Safety Reduction Slider */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    Incomplete Cross-Tolerance Reduction:
                  </span>
                  <span className="text-emerald-800 font-black text-sm">{crossToleranceReduction}% Safety Reduction</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={crossToleranceReduction}
                  onChange={(e) => setCrossToleranceReduction(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />

                <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                  <span>0% (No reduction - Danger)</span>
                  <span className="text-emerald-700 font-bold">25%–35% (Clinical Standard)</span>
                  <span>50% (Frail / Elderly / Severe Pain)</span>
                </div>
              </div>

              {/* Patient High-Risk Modifier Checkboxes */}
              <div className="space-y-2 pt-1 border-t border-gray-100 text-xs">
                <strong className="text-gray-800 text-[11px] uppercase tracking-wider block">
                  Patient Co-Morbidities & Safety Modifiers:
                </strong>

                <label className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={concomitantBenzo}
                    onChange={(e) => setConcomitantBenzo(e.target.checked)}
                    className="h-4 w-4 rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>Concomitant Benzodiazepines / CNS Depressants (FDA Black Box Warning)</span>
                </label>

                <label className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasSleepApneaOrCopd}
                    onChange={(e) => setHasSleepApneaOrCopd(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Sleep Apnea / Chronic COPD / Respiratory Disease</span>
                </label>

                <label className="flex items-center gap-2 text-gray-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasRenalOrHepaticImpairment}
                    onChange={(e) => setHasRenalOrHepaticImpairment(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Renal Failure (CrCl &lt; 30) or Hepatic Cirrhosis (Reduce Morphine/Codeine accumulation)</span>
                </label>
              </div>
            </div>

          </div>

          {/* RIGHT: HERO MME OUTPUT & ROTATION DIRECTIVES (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">

            {/* HERO MME CARD */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                    Total Daily MME & Risk Tier
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

              <div className="space-y-4">
                {/* Big MME Number Display */}
                <div className="rounded-xl bg-white/15 p-5 text-center backdrop-blur-md ring-1 ring-white/20">
                  <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block mb-1">
                    Total Daily Morphine Equivalent
                  </span>
                  <div className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                    {calculations.totalDailyMme}
                    <span className="text-xl font-bold text-green-200 ml-1.5">MME/day</span>
                  </div>
                  <div className="mt-2 text-xs font-mono text-blue-100/90 bg-black/10 inline-block px-3 py-1 rounded-full">
                    {calculations.riskTier}
                  </div>
                </div>

                {/* Naloxone Co-Prescribing Banner */}
                {calculations.naloxoneMandated && (
                  <div className="rounded-xl bg-rose-500/30 border border-rose-300/40 p-3 flex items-center gap-2.5 text-xs text-white">
                    <Flame className="h-5 w-5 text-yellow-300 shrink-0" />
                    <div>
                      <strong className="block font-bold">Naloxone (Narcan) Co-Prescription Indicated:</strong>
                      <span className="text-[11px] text-blue-100">
                        Patient exceeds CDC safety threshold or takes concurrent sedatives. Co-prescribe Naloxone nasal spray 4 mg.
                      </span>
                    </div>
                  </div>
                )}

                {/* Directives Box */}
                <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/10 text-xs text-blue-100 space-y-1">
                  <strong className="text-white block font-bold">Clinical Safety Advisory:</strong>
                  <p className="leading-relaxed text-[11px]">{calculations.riskDirectives}</p>
                </div>
              </div>
            </div>

            {/* ROTATED REGIMEN PRESCRIPTION CARD */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3.5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <ArrowRight className="h-4 w-4 text-emerald-600" />
                  Rotated Target Prescription
                </h3>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  {crossToleranceReduction}% Safety Reduced
                </span>
              </div>

              {/* Proposed Target Schedule */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 space-y-2">
                <div className="text-xs font-bold text-gray-900">
                  {calculations.targetConfig.name} ({calculations.targetConfig.brand})
                </div>
                <div className="text-2xl font-black text-emerald-900">
                  {calculations.safeDosePerAdmin} {calculations.targetConfig.unit}
                  <span className="text-xs font-semibold text-gray-600 ml-1.5">
                    administered {targetFrequency}x daily (q{Math.round(24 / targetFrequency)}h)
                  </span>
                </div>
                <div className="text-[11px] text-gray-600 flex justify-between pt-1 border-t border-emerald-200/60">
                  <span>Total 24h Initial Dose:</span>
                  <strong>{calculations.safe24hTargetDose} {calculations.targetConfig.unit}/day</strong>
                </div>
              </div>

              {/* Breakthrough Rescue Dose */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">
                  Breakthrough Pain (PRN) Rescue Dose (10%–15% Rule):
                </span>
                <div className="text-sm font-bold text-gray-900">
                  {calculations.breakthroughDoseMin} – {calculations.breakthroughDoseMax} {calculations.targetConfig.unit}{" "}
                  <span className="text-xs font-normal text-gray-600">orally q3–4h PRN</span>
                </div>
                <p className="text-[10px] text-gray-400">
                  Do not exceed 3–4 breakthrough doses per 24 hours without reassessing baseline pain.
                </p>
              </div>
            </div>

            {/* MANDATORY CLINICAL SAFETY WARNING */}
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-4 shadow-sm text-gray-700">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="font-semibold text-gray-900 block mb-0.5">High-Alert Medication Advisory:</strong>
                  Equianalgesic ratios are population approximations. Patient response varies due to genetics, organ clearance, and receptor binding. Never abruptly rotate Methadone without specialized palliative consult due to unpredictable half-life (15–120 hours).
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ─── COLLAPSIBLE EVIDENCE & GUIDELINES REFERENCE ─────────────────── */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-3">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition"
          >
            <span className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Equianalgesic Conversion Multipliers & CDC 2022 Guidelines
            </span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDetails && (
            <div className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100 leading-relaxed">
              <div>
                <strong className="text-gray-900 block mb-0.5">1. Standard Oral Morphine Equianalgesic Ratios (Relative to 30 mg Oral Morphine):</strong>
                <p className="text-gray-600">
                  Oral Morphine (1.0x) | IV Morphine (3.0x) | Oral Oxycodone (1.5x) | Oral Hydrocodone (1.0x) | Oral Hydromorphone (4.0x) | IV Hydromorphone (20.0x) | Transdermal Fentanyl (2.4x mcg/hr) | Oral Codeine (0.15x) | Oral Tramadol (0.1x).
                </p>
              </div>
              <div>
                <strong className="text-gray-900 block mb-0.5">2. CDC Clinical Practice Guideline for Prescribing Opioids (2022):</strong>
                <p className="text-gray-600">
                  Dowell D, et al. CDC Clinical Practice Guideline for Prescribing Opioids for Pain — United States, 2022. MMWR Recomm Rep 2022;71(No. RR-3):1–95.
                </p>
              </div>
              <div>
                <strong className="text-gray-900 block mb-0.5">3. Incomplete Cross-Tolerance Rule:</strong>
                <p className="text-gray-600">
                  Because patients lack full tolerance to the new opioid, always reduce the equianalgesic calculated dose by 25% to 50% when rotating.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-200 pt-6 pb-10 text-center text-xs text-gray-500 space-y-2">
          <p className="max-w-4xl mx-auto leading-relaxed">
            <strong>Clinical Pain Management Advisory:</strong> Opioids are high-alert medications. Always verify conversion calculations independently with a second clinician or clinical pharmacist prior to dispensing.
          </p>
          <p className="text-gray-400">
            &copy; 2024–2026 Advanced Opioid Pharmacotherapy & Equianalgesic Decision Support.
          </p>
        </footer>

      </div>
    </section>
  );
}