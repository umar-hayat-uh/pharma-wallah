"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Heart,
  AlertTriangle,
  Activity,
  TrendingUp,
  Shield,
  BookOpen,
  RefreshCw,
  Pill,
  Droplet,
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
  ArrowRight,
} from "lucide-react";

// ─── STRICT TYPES & INTERFACES ───────────────────────────────────────

export type RiskTool = "chads" | "hasbled" | "doac_dosing";

export interface ChadsFactors {
  chf: boolean;
  hypertension: boolean;
  ageOver75: boolean;
  diabetes: boolean;
  strokeTIA: boolean;
  vascularDisease: boolean;
  age65to74: boolean;
  female: boolean;
}

export interface HasbledFactors {
  hypertension: boolean;
  abnormalRenal: boolean;
  abnormalLiver: boolean;
  stroke: boolean;
  bleeding: boolean;
  labileINR: boolean;
  elderly: boolean;
  drugsAlcohol: boolean;
}

export interface PatientPreset {
  name: string;
  tag: string;
  tool: RiskTool;
  chads: ChadsFactors;
  hasbled: HasbledFactors;
}

export interface DOACMonograph {
  drug: string;
  brand: string;
  standardDose: string;
  reducedDose: string;
  reductionCriteria: string[];
  monitoringPearls: string;
}

// ─── DOAC CLINICAL MONOGRAPHS ────────────────────────────────────────

const DOAC_MONOGRAPHS: DOACMonograph[] = [
  {
    drug: "Apixaban",
    brand: "Eliquis",
    standardDose: "5 mg BID (Twice Daily)",
    reducedDose: "2.5 mg BID",
    reductionCriteria: [
      "Patient meets at least 2 of 3 ABC criteria:",
      "1. Age ≥ 80 years",
      "2. Body Weight ≤ 60 kg",
      "3. Serum Creatinine ≥ 1.5 mg/dL (133 µmol/L)",
    ],
    monitoringPearls: "Preferred DOAC in CKD and elderly (lowest GI bleeding rate in ARISTOTLE trial). CrCl < 15 mL/min: use with caution / hemodialysis per FDA labeling.",
  },
  {
    drug: "Rivaroxaban",
    brand: "Xarelto",
    standardDose: "20 mg Once Daily (with Evening Meal)",
    reducedDose: "15 mg Once Daily",
    reductionCriteria: [
      "CrCl 15–49 mL/min (Cockcroft-Gault)",
      "Must be taken with food to ensure ~100% systemic bioavailability.",
    ],
    monitoringPearls: "Avoid if CrCl < 15 mL/min or Child-Pugh B/C hepatic impairment. Once-daily dosing improves compliance.",
  },
  {
    drug: "Dabigatran",
    brand: "Pradaxa",
    standardDose: "150 mg BID",
    reducedDose: "110 mg BID (EMA) / 75 mg BID (US FDA)",
    reductionCriteria: [
      "Age ≥ 80 years or concomitant Verapamil (reduce to 110 mg BID per ESC)",
      "CrCl 15–30 mL/min (reduce to 75 mg BID in US)",
      "High bleeding risk / gastritis history",
    ],
    monitoringPearls: "Direct Thrombin Inhibitor (DTI). Specific reversal agent: Idarucizumab (Praxbind). Keep in original packaging to prevent moisture breakdown.",
  },
  {
    drug: "Edoxaban",
    brand: "Savaysa / Lixiana",
    standardDose: "60 mg Once Daily",
    reducedDose: "30 mg Once Daily",
    reductionCriteria: [
      "CrCl 15–50 mL/min",
      "Body Weight ≤ 60 kg",
      "Concomitant strong P-gp inhibitors (Cyclosporine, Dronedarone, Erythromycin, Ketoconazole)",
    ],
    monitoringPearls: "FDA Black Box: Do not use in non-valvular AF if CrCl > 95 mL/min due to increased ischemic stroke risk from rapid renal clearance.",
  },
];

// ─── MAIN COMPONENT ──────────────────────────────────────────────────

export default function AnticoagulationRiskCalculator() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<RiskTool>("chads");

  // CHA2DS2-VASc State
  const [chadsFactors, setChadsFactors] = useState<ChadsFactors>({
    chf: false,
    hypertension: true,
    ageOver75: false,
    diabetes: false,
    strokeTIA: false,
    vascularDisease: false,
    age65to74: true,
    female: false,
  });

  // HAS-BLED State
  const [hasbledFactors, setHasbledFactors] = useState<HasbledFactors>({
    hypertension: true,
    abnormalRenal: false,
    abnormalLiver: false,
    stroke: false,
    bleeding: false,
    labileINR: false,
    elderly: true,
    drugsAlcohol: false,
  });

  // UI States
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Patient Archetypes
  const samplePatients: PatientPreset[] = [
    {
      name: "Low Risk (Lone AF)",
      tag: "Male, 52y, No comorbidities",
      tool: "chads",
      chads: { chf: false, hypertension: false, ageOver75: false, diabetes: false, strokeTIA: false, vascularDisease: false, age65to74: false, female: false },
      hasbled: { hypertension: false, abnormalRenal: false, abnormalLiver: false, stroke: false, bleeding: false, labileINR: false, elderly: false, drugsAlcohol: false },
    },
    {
      name: "Moderate Risk Senior",
      tag: "Male, 71y, HTN",
      tool: "chads",
      chads: { chf: false, hypertension: true, ageOver75: false, diabetes: false, strokeTIA: false, vascularDisease: false, age65to74: true, female: false },
      hasbled: { hypertension: true, abnormalRenal: false, abnormalLiver: false, stroke: false, bleeding: false, labileINR: false, elderly: true, drugsAlcohol: false },
    },
    {
      name: "High-Risk Diabetic Female",
      tag: "Female, 78y, HTN, T2D, CHF",
      tool: "chads",
      chads: { chf: true, hypertension: true, ageOver75: true, diabetes: true, strokeTIA: false, vascularDisease: false, age65to74: false, female: true },
      hasbled: { hypertension: true, abnormalRenal: false, abnormalLiver: false, stroke: false, bleeding: false, labileINR: false, elderly: true, drugsAlcohol: false },
    },
    {
      name: "Prior Stroke High-Risk",
      tag: "Male, 68y, Prior TIA & PAD",
      tool: "chads",
      chads: { chf: false, hypertension: true, ageOver75: false, diabetes: false, strokeTIA: true, vascularDisease: true, age65to74: true, female: false },
      hasbled: { hypertension: true, abnormalRenal: false, abnormalLiver: false, stroke: true, bleeding: false, labileINR: false, elderly: true, drugsAlcohol: false },
    },
    {
      name: "High Bleeding Hazard",
      tag: "HAS-BLED Score 4 (NSAIDs + Renal)",
      tool: "hasbled",
      chads: { chf: true, hypertension: true, ageOver75: false, diabetes: true, strokeTIA: false, vascularDisease: false, age65to74: true, female: false },
      hasbled: { hypertension: true, abnormalRenal: true, abnormalLiver: false, stroke: false, bleeding: true, labileINR: false, elderly: true, drugsAlcohol: true },
    },
  ];

  // ─── CHA2DS2-VASc CALCULATIONS ───────────────────────────────────────
  const chadsResult = useMemo(() => {
    let score = 0;
    if (chadsFactors.chf) score += 1;
    if (chadsFactors.hypertension) score += 1;
    if (chadsFactors.ageOver75) score += 2;
    if (chadsFactors.diabetes) score += 1;
    if (chadsFactors.strokeTIA) score += 2;
    if (chadsFactors.vascularDisease) score += 1;
    if (chadsFactors.age65to74 && !chadsFactors.ageOver75) score += 1; // Mutually exclusive
    if (chadsFactors.female) score += 1;

    // Annual Ischemic Stroke Rates (Lip GY et al. Stroke 2010; ESC 2024)
    const annualStrokeRates: Record<number, number> = {
      0: 0.2,
      1: 0.6,
      2: 2.2,
      3: 3.2,
      4: 4.8,
      5: 7.2,
      6: 9.7,
      7: 11.2,
      8: 12.5,
      9: 15.2,
    };

    const annualRisk = annualStrokeRates[score] ?? 15.2;

    // Clinical Guideline Recommendation (ESC 2024 / AHA 2023)
    const isFemale = chadsFactors.female;
    let recommendation = "";
    let classOfRecommendation = "";
    let badgeColor = "";

    if (isFemale) {
      if (score === 1) {
        recommendation = "Low Risk (Female sex alone). No oral anticoagulation (OAC) or antiplatelet therapy recommended.";
        classOfRecommendation = "Class III (No Benefit / Potential Harm)";
        badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
      } else if (score === 2) {
        recommendation = "Moderate Risk (1 non-sex risk factor). Oral anticoagulation (DOAC) should be considered based on individual clinical judgment and patient values.";
        classOfRecommendation = "Class IIa (Moderate Recommendation)";
        badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
      } else {
        recommendation = "High Risk (≥ 2 non-sex risk factors). Oral anticoagulation (DOAC preferred over Warfarin) is strongly recommended unless absolute contraindications exist.";
        classOfRecommendation = "Class I (Strong Recommendation)";
        badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
      }
    } else {
      if (score === 0) {
        recommendation = "Truly Low Risk. No oral anticoagulation or antiplatelet therapy recommended.";
        classOfRecommendation = "Class III (No Benefit)";
        badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
      } else if (score === 1) {
        recommendation = "Moderate Risk (1 clinical risk factor). Oral anticoagulation (DOAC) should be considered based on net clinical benefit and patient preference.";
        classOfRecommendation = "Class IIa (Moderate Recommendation)";
        badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
      } else {
        recommendation = "High Risk (≥ 2 clinical risk factors). Oral anticoagulation (DOAC preferred over Warfarin) is strongly recommended.";
        classOfRecommendation = "Class I (Strong Recommendation)";
        badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
      }
    }

    return {
      score,
      annualRisk,
      recommendation,
      classOfRecommendation,
      badgeColor,
    };
  }, [chadsFactors]);

  // ─── HAS-BLED CALCULATIONS ──────────────────────────────────────────
  const hasbledResult = useMemo(() => {
    let score = 0;
    if (hasbledFactors.hypertension) score += 1;
    if (hasbledFactors.abnormalRenal) score += 1;
    if (hasbledFactors.abnormalLiver) score += 1;
    if (hasbledFactors.stroke) score += 1;
    if (hasbledFactors.bleeding) score += 1;
    if (hasbledFactors.labileINR) score += 1;
    if (hasbledFactors.elderly) score += 1;
    if (hasbledFactors.drugsAlcohol) score += 1;

    // Annual Major Bleeding Rates (Pisters R et al. Chest 2010)
    const annualBleedRates: Record<number, number> = {
      0: 0.9,
      1: 1.1,
      2: 1.9,
      3: 3.7,
      4: 8.7,
      5: 12.5,
      6: 14.0,
      7: 15.0,
      8: 18.0,
    };

    const annualRisk = annualBleedRates[score] ?? 18.0;

    let riskTier = "Low Bleeding Risk";
    let badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-300";
    let directive = "Standard monitoring. Continue scheduled clinical reviews.";

    if (score >= 3) {
      riskTier = "High Bleeding Risk (HAS-BLED ≥ 3)";
      badgeColor = "bg-rose-100 text-rose-800 border-rose-300";
      directive = "High bleeding risk is NOT an automatic reason to withhold OAC. Rather, it warrants identifying and correcting modifiable risk factors (e.g. discontinue NSAIDs, control blood pressure, optimize TTR) and scheduling frequent follow-up (every 3–6 months).";
    } else if (score === 2) {
      riskTier = "Moderate Bleeding Risk";
      badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-300";
      directive = "Address any modifiable bleeding risks (antiplatelets, alcohol, blood pressure).";
    }

    return {
      score,
      annualRisk,
      riskTier,
      badgeColor,
      directive,
    };
  }, [hasbledFactors]);

  // Load Preset
  const handleLoadPreset = (p: PatientPreset) => {
    setActiveTab(p.tool);
    setChadsFactors(p.chads);
    setHasbledFactors(p.hasbled);
  };

  // Reset
  const handleReset = () => {
    setChadsFactors({
      chf: false,
      hypertension: false,
      ageOver75: false,
      diabetes: false,
      strokeTIA: false,
      vascularDisease: false,
      age65to74: false,
      female: false,
    });
    setHasbledFactors({
      hypertension: false,
      abnormalRenal: false,
      abnormalLiver: false,
      stroke: false,
      bleeding: false,
      labileINR: false,
      elderly: false,
      drugsAlcohol: false,
    });
  };

  // Copy Consult Note
  const handleCopyConsultNote = useCallback(() => {
    const note = `=== CLINICAL ANTICOAGULATION & AF STROKE RISK CONSULT ===
THROMBOEMBOLIC STROKE RISK (CHA₂DS₂-VASc):
- Calculated Score: ${chadsResult.score} points
- Estimated Annual Ischemic Stroke Risk: ${chadsResult.annualRisk}% / year
- Guideline Status: ${chadsResult.classOfRecommendation}
- Recommendation: ${chadsResult.recommendation}

BLEEDING HAZARD ASSESSMENT (HAS-BLED):
- Calculated Score: ${hasbledResult.score} points (${hasbledResult.riskTier})
- Estimated Annual Major Bleeding Risk: ${hasbledResult.annualRisk}% / year
- Clinical Directive: ${hasbledResult.directive}

NET CLINICAL BENEFIT EVALUATION:
${chadsResult.score >= 2 ? "Net clinical benefit strongly favors oral anticoagulation. DOACs (Apixaban, Rivaroxaban, Dabigatran, Edoxaban) are first-line over Warfarin." : "Low stroke risk; anticoagulation generally withheld unless patient preference dictates otherwise."}

DOAC DOSING CONSIDERATION:
Screen for dose-reduction criteria (Renal function CrCl, age ≥ 80, body weight ≤ 60 kg, hepatic impairment).
Guidelines: 2024 ESC Atrial Fibrillation Guidelines & 2023 ACC/AHA/ACCP/HRS Guidelines.
Generated: ${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }, [chadsResult, hasbledResult]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/70 p-3 sm:p-5 md:p-8 font-sans selection:bg-teal-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ─── HEADER ──────────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-green-500 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="rounded-2xl bg-white/20 p-3.5 backdrop-blur-md ring-1 ring-white/30 shadow-inner">
                <Heart className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Anticoagulation Risk & DOAC Dosing Suite
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                    <Sparkles className="h-3 w-3 text-yellow-300" /> ESC 2024 & ACC/AHA 2023
                  </span>
                </div>
                <p className="mt-1 text-sm md:text-base text-blue-100 font-medium">
                  CHA₂DS₂-VASc stroke risk, HAS-BLED bleeding hazard & direct oral anticoagulant (DOAC) dosing guide
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
                <span>Atrial Fibrillation Anticoagulation Decision Pathway</span>
              </div>
              <span className="text-xs text-gray-500 font-medium">3-Step Protocol</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 rounded-xl bg-blue-50/60 p-3.5 border border-blue-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  1
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Calculate Stroke Risk (CHA₂DS₂-VASc)</strong>
                  Determine if patient warrants oral anticoagulation (OAC indicated if score &ge; 2 in men or &ge; 3 in women).
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-green-50/60 p-3.5 border border-green-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  2
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Evaluate Bleeding Hazard (HAS-BLED)</strong>
                  Identify modifiable risk factors (hypertension, NSAIDs, alcohol) to mitigate bleeding without withholding OAC.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100/70">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  3
                </div>
                <div className="text-xs sm:text-sm text-gray-700">
                  <strong className="block text-gray-900 font-semibold mb-0.5">Select DOAC & Adjust Dosing</strong>
                  Choose Apixaban, Rivaroxaban, Dabigatran, or Edoxaban and verify renal/weight dose-reduction criteria.
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
                  {p.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── NAVIGATION TABS ──────────────────────────────────────────────── */}
        <div className="flex gap-2 p-1.5 bg-gray-200/70 rounded-2xl max-w-xl mx-auto shadow-inner text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("chads")}
            className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "chads"
                ? "bg-white text-blue-700 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>CHA₂DS₂-VASc (Stroke)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hasbled")}
            className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "hasbled"
                ? "bg-white text-rose-700 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Droplet className="h-4 w-4" />
            <span>HAS-BLED (Bleeding)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("doac_dosing")}
            className={`flex-1 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === "doac_dosing"
                ? "bg-white text-emerald-700 shadow-md"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Pill className="h-4 w-4" />
            <span>DOAC Dosing Guide</span>
          </button>
        </div>

        {/* ─── MAIN WORKSPACE GRID: 12 COLS ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT: RISK FACTOR CHECKLIST / DOAC SELECTOR (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">

            {/* TAB 1: CHA2DS2-VASc CHECKLIST */}
            {activeTab === "chads" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    CHA₂DS₂-VASc Stroke Risk Factors
                  </h2>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "chf", label: "C — Congestive Heart Failure / LVEF ≤ 40%", pts: "+1" },
                    { id: "hypertension", label: "H — Hypertension (Resting SBP > 140 or treated)", pts: "+1" },
                    { id: "ageOver75", label: "A₂ — Age ≥ 75 Years", pts: "+2" },
                    { id: "diabetes", label: "D — Diabetes Mellitus (Oral agent or insulin)", pts: "+1" },
                    { id: "strokeTIA", label: "S₂ — Prior Stroke, TIA, or Systemic Thromboembolism", pts: "+2" },
                    { id: "vascularDisease", label: "V — Vascular Disease (Prior MI, PAD, Aortic Plaque)", pts: "+1" },
                    { id: "age65to74", label: "A — Age 65–74 Years (If < 75y)", pts: "+1" },
                    { id: "female", label: "Sc — Female Biological Sex", pts: "+1" },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-2 cursor-pointer ${
                        chadsFactors[item.id as keyof ChadsFactors]
                          ? "border-blue-500 bg-blue-50/80 ring-1 ring-blue-400"
                          : "border-gray-200 bg-gray-50/60 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={chadsFactors[item.id as keyof ChadsFactors]}
                          onChange={(e) => {
                            const val = e.target.checked;
                            if (item.id === "ageOver75" && val) {
                              setChadsFactors((prev) => ({ ...prev, ageOver75: true, age65to74: false }));
                            } else if (item.id === "age65to74" && val) {
                              setChadsFactors((prev) => ({ ...prev, age65to74: true, ageOver75: false }));
                            } else {
                              setChadsFactors((prev) => ({ ...prev, [item.id]: val }));
                            }
                          }}
                          className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-semibold text-gray-800 leading-snug">
                          {item.label}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold shrink-0">
                        {item.pts}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: HAS-BLED CHECKLIST */}
            {activeTab === "hasbled" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-rose-600" />
                    HAS-BLED Bleeding Risk Factors
                  </h2>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Reset
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "hypertension", label: "H — Uncontrolled Hypertension (SBP > 160 mmHg)", pts: "+1" },
                    { id: "abnormalRenal", label: "A — Abnormal Renal Function (Dialysis, Cr > 2.26 mg/dL)", pts: "+1" },
                    { id: "abnormalLiver", label: "A — Abnormal Liver Function (Cirrhosis, Bilirubin > 2x, AST/ALT > 3x)", pts: "+1" },
                    { id: "stroke", label: "S — Prior Stroke History (Ischemic or Hemorrhagic)", pts: "+1" },
                    { id: "bleeding", label: "B — Bleeding History or Predisposition (Major bleed, Anemia)", pts: "+1" },
                    { id: "labileINR", label: "L — Labile INR (Time in Therapeutic Range < 60% on Warfarin)", pts: "+1" },
                    { id: "elderly", label: "E — Elderly (Age > 65 Years or Frailty)", pts: "+1" },
                    { id: "drugsAlcohol", label: "D — Drugs (Antiplatelets / NSAIDs) or Alcohol (≥ 8 drinks/week)", pts: "+1" },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-2 cursor-pointer ${
                        hasbledFactors[item.id as keyof HasbledFactors]
                          ? "border-rose-500 bg-rose-50/80 ring-1 ring-rose-400"
                          : "border-gray-200 bg-gray-50/60 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={hasbledFactors[item.id as keyof HasbledFactors]}
                          onChange={(e) => setHasbledFactors((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                          className="mt-0.5 h-4 w-4 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-xs font-semibold text-gray-800 leading-snug">
                          {item.label}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold shrink-0">
                        {item.pts}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: DOAC CLINICAL MONOGRAPHS */}
            {activeTab === "doac_dosing" && (
              <div className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-md shadow-gray-200/50 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-emerald-600" />
                    Direct Oral Anticoagulant (DOAC) Dosing Monographs
                  </h2>
                  <span className="text-xs text-gray-500 font-semibold">2024 ESC Protocol</span>
                </div>

                <div className="space-y-3">
                  {DOAC_MONOGRAPHS.map((d) => (
                    <div key={d.drug} className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <strong className="text-sm font-black text-gray-900">
                            {d.drug} ({d.brand})
                          </strong>
                          <span className="text-xs text-emerald-700 font-bold ml-2">
                            Standard: {d.standardDose}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 self-start">
                          Reduced: {d.reducedDose}
                        </span>
                      </div>

                      <div className="text-xs text-gray-700 space-y-1 bg-white p-2.5 rounded-lg border border-gray-200/80">
                        <strong className="text-gray-900 block text-[11px] uppercase tracking-wider">
                          Dose Reduction Criteria:
                        </strong>
                        <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                          {d.reductionCriteria.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-[11px] text-gray-500 leading-snug">
                        <strong>Clinical Pearl:</strong> {d.monitoringPearls}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ESC / ACCP CLINICAL SUMMARY BOX */}
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-white to-green-50/80 p-4 shadow-sm text-gray-700 space-y-1">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="font-semibold text-gray-900 block mb-0.5">2024 ESC Guideline Principle:</strong>
                  DOACs (Apixaban, Rivaroxaban, Dabigatran, Edoxaban) are recommended in preference to Vitamin K Antagonists (Warfarin) for non-valvular atrial fibrillation. Antiplatelet monotherapy (Aspirin) is not recommended for stroke prevention in AF due to inferior efficacy and similar bleeding risk.
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: HERO SCORE OUTPUT & RISK VISUALIZATION (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">

            {/* HERO SCORE CARD */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-300" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                    {activeTab === "hasbled" ? "HAS-BLED Bleeding Risk" : "CHA₂DS₂-VASc Stroke Risk"}
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
                {/* Big Score Display */}
                <div className="rounded-xl bg-white/15 p-5 text-center backdrop-blur-md ring-1 ring-white/20">
                  <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider block mb-1">
                    {activeTab === "hasbled" ? "Bleeding Hazard Score" : "Ischemic Stroke Risk Score"}
                  </span>
                  <div className="text-6xl font-black tracking-tight text-white">
                    {activeTab === "hasbled" ? hasbledResult.score : chadsResult.score}
                    <span className="text-2xl font-bold text-green-200 ml-1">pts</span>
                  </div>
                  <div className="mt-2 text-xs font-mono text-blue-100/90 bg-black/10 inline-block px-3 py-1 rounded-full">
                    {activeTab === "hasbled"
                      ? `Est. Major Bleeding: ${hasbledResult.annualRisk}% / year`
                      : `Est. Ischemic Stroke: ${chadsResult.annualRisk}% / year`}
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm border border-white/15 space-y-1 text-xs">
                  <strong className="text-white block font-bold">
                    {activeTab === "hasbled" ? hasbledResult.riskTier : chadsResult.classOfRecommendation}
                  </strong>
                  <p className="text-blue-100 text-[11px] leading-relaxed">
                    {activeTab === "hasbled" ? hasbledResult.directive : chadsResult.recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* DUAL RISK COMPARISON GAUGE */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-200/50 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Net Clinical Benefit Balance
                </h3>
                <span className="text-[10px] text-gray-400">Annual Event Rates</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                {/* Stroke Rate */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Annual Stroke Risk</span>
                  <div className="text-2xl font-black text-blue-900 mt-0.5">{chadsResult.annualRisk}%</div>
                  <span className="text-[10px] text-gray-500 block">CHA₂DS₂-VASc: {chadsResult.score} pts</span>
                </div>

                {/* Bleed Rate */}
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Annual Major Bleed</span>
                  <div className="text-2xl font-black text-rose-900 mt-0.5">{hasbledResult.annualRisk}%</div>
                  <span className="text-[10px] text-gray-500 block">HAS-BLED: {hasbledResult.score} pts</span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-2 pt-1 text-xs text-gray-600">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span>Stroke Risk Scale ({chadsResult.score}/9):</span>
                    <span className="text-blue-700 font-bold">{chadsResult.annualRisk}% / yr</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (chadsResult.score / 9) * 100)}%` }}
                      className="bg-blue-600 h-full rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span>Bleeding Risk Scale ({hasbledResult.score}/8):</span>
                    <span className="text-rose-700 font-bold">{hasbledResult.annualRisk}% / yr</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, (hasbledResult.score / 8) * 100)}%` }}
                      className="bg-rose-500 h-full rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MODIFIABLE BLEEDING RISK FACTORS CALLOUT */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm text-xs text-amber-950 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Actionable Modifiable Bleeding Risks</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-amber-900 text-[11px]">
                <li>Control systolic BP (&lt; 140 mmHg resting).</li>
                <li>Deprescribe unnecessary NSAIDs, Aspirin, or antiplatelets.</li>
                <li>Counsel on reducing alcohol intake (&lt; 8 units/week).</li>
                <li>If on Warfarin, target TTR &gt; 70% or switch to a DOAC.</li>
              </ul>
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
              Clinical Evidence & Guideline Citations (ESC / ACC / AHA)
            </span>
            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showDetails && (
            <div className="space-y-3 text-xs text-gray-600 pt-2 border-t border-gray-100 leading-relaxed">
              <div>
                <strong className="text-gray-900 block mb-0.5">1. 2024 ESC Guidelines for the Management of Atrial Fibrillation:</strong>
                <p className="text-gray-600">
                  Eur Heart J. 2024. Recommends oral anticoagulation in non-valvular AF for men with CHA₂DS₂-VASc ≥ 2 and women with CHA₂DS₂-VASc ≥ 3 (Class I). DOACs preferred over VKAs.
                </p>
              </div>
              <div>
                <strong className="text-gray-900 block mb-0.5">2. 2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of AF:</strong>
                <p className="text-gray-600">
                  Circulation. 2023;148:e00-e00. Reinforces that high bleeding risk scores (HAS-BLED ≥ 3) should prompt risk factor modification rather than withholding anticoagulation.
                </p>
              </div>
              <div>
                <strong className="text-gray-900 block mb-0.5">3. HAS-BLED Bleeding Score Validation:</strong>
                <p className="text-gray-600">
                  Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation. Chest. 2010;138(5):1093-1100.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── FOOTER ──────────────────────────────────────────────────────── */}
        <footer className="border-t border-gray-200 pt-6 pb-10 text-center text-xs text-gray-500 space-y-2">
          <p className="max-w-4xl mx-auto leading-relaxed">
            <strong>Clinical Anticoagulation Advisory:</strong> Risk scores are clinical decision support aids. Always evaluate individual bleeding risk, renal function, compliance, and shared patient decision-making prior to initiating OAC therapy.
          </p>
          <p className="text-gray-400">
            &copy; 2024–2026 Advanced Anticoagulation & Atrial Fibrillation Clinical Decision Support.
          </p>
        </footer>

      </div>
    </section>
  );
}