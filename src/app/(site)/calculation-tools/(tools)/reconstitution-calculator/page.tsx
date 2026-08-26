"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calculator,
    Droplet,
    FileText,
    ExternalLink,
    Info,
    AlertTriangle,
    CheckCircle2,
    Copy,
    Check,
    BookOpen,
    ShieldAlert,
    Activity,
    RotateCcw,
    Layers,
    Sparkles,
    FlaskConical,
    Clock,
    Thermometer,
    Syringe,
    ArrowRight,
    Search,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

// ─── TYPES & INTERFACES ─────────────────────────────────────────────

// Removed "export" from interface
interface ReconstitutionPreset {
    id: string;
    drugName: string;
    brandName: string;
    vialStrengthMg: number;
    vialLabel: string;
    route: "IV Push" | "IV Piggyback" | "IM" | "IV / IM";
    displacementVolMl: number;
    standardDiluentVolMl: number;
    resultingConcMgMl: number;
    recommendedDiluents: string[];
    stability: {
        roomTemp: string;
        refrigerated: string;
        frozen?: string;
    };
    clinicalNotes: string;
    fdaLink: string;
}

// Removed "export" from type
type CalcMode = "doseToVol" | "volToDose" | "targetConc";

// ─── BUILT-IN CLINICAL PARENTERAL DATABASE ──────────────────────────

// Removed "export" from const
const RECONSTITUTION_DATABASE: ReconstitutionPreset[] = [
    {
        id: "ceftriaxone-1g-iv",
        drugName: "Ceftriaxone",
        brandName: "Rocephin",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.4,
        standardDiluentVolMl: 9.6,
        resultingConcMgMl: 100,
        recommendedDiluents: ["Sterile Water for Injection (SWFI)", "0.9% Sodium Chloride (NS)", "5% Dextrose (D5W)"],
        stability: {
            roomTemp: "2 days (25°C)",
            refrigerated: "10 days (4°C)",
            frozen: "26 weeks (-20°C)",
        },
        clinicalNotes: "CONTRAINDICATION: Do NOT mix or co-infuse with calcium-containing IV solutions (e.g., Ringer's Lactate, Hartmann's, parenteral nutrition) due to risk of fatal calcium-ceftriaxone crystalline precipitation.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42702744-8848-43e5-9c96-857e2d93e117",
    },
    {
        id: "ceftriaxone-1g-im",
        drugName: "Ceftriaxone (IM Formulation)",
        brandName: "Rocephin (IM)",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IM",
        displacementVolMl: 0.7,
        standardDiluentVolMl: 2.1,
        resultingConcMgMl: 350,
        recommendedDiluents: ["1% Lidocaine HCl Solution (without epinephrine)", "SWFI"],
        stability: {
            roomTemp: "24 hours (25°C)",
            refrigerated: "10 days (4°C)",
        },
        clinicalNotes: "Reconstitute with 1% Lidocaine (no epi) to reduce severe injection pain. Inject deep into large muscle mass (gluteal or anterolateral thigh). Max recommended IM volume is 2-3 mL per site.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42702744-8848-43e5-9c96-857e2d93e117",
    },
    {
        id: "ceftriaxone-2g-iv",
        drugName: "Ceftriaxone",
        brandName: "Rocephin",
        vialStrengthMg: 2000,
        vialLabel: "2 g (2000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.8,
        standardDiluentVolMl: 19.2,
        resultingConcMgMl: 100,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "2 days (25°C)",
            refrigerated: "10 days (4°C)",
        },
        clinicalNotes: "Standard reconstitution yields 100 mg/mL. Dilute further into 50-100 mL IVPB and infuse over 30 minutes.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42702744-8848-43e5-9c96-857e2d93e117",
    },
    {
        id: "piptazo-3375g",
        drugName: "Piperacillin / Tazobactam",
        brandName: "Zosyn",
        vialStrengthMg: 3375,
        vialLabel: "3.375 g Vial (3g Pip / 0.375g Tazo)",
        route: "IV Piggyback",
        displacementVolMl: 1.8,
        standardDiluentVolMl: 15.0,
        resultingConcMgMl: 200,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W", "Bacteriostatic Water"],
        stability: {
            roomTemp: "24 hours (20-25°C)",
            refrigerated: "48 hours (2-8°C)",
        },
        clinicalNotes: "Shake vigorously until completely dissolved. For extended infusion regimens, infuse over 3-4 hours after secondary dilution into 50-100 mL NS/D5W.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1b1f8ef6-17b5-4dc2-8c9b-ff73bf7c706d",
    },
    {
        id: "piptazo-45g",
        drugName: "Piperacillin / Tazobactam",
        brandName: "Zosyn",
        vialStrengthMg: 4500,
        vialLabel: "4.5 g Vial (4g Pip / 0.5g Tazo)",
        route: "IV Piggyback",
        displacementVolMl: 2.4,
        standardDiluentVolMl: 20.0,
        resultingConcMgMl: 200,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "24 hours (20-25°C)",
            refrigerated: "48 hours (2-8°C)",
        },
        clinicalNotes: "Yields 200 mg/mL total drug (178 mg/mL piperacillin). Further dilute in ≥50 mL compatible IV solution prior to infusion.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1b1f8ef6-17b5-4dc2-8c9b-ff73bf7c706d",
    },
    {
        id: "vancomycin-1g",
        drugName: "Vancomycin HCl",
        brandName: "Vancocin",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Lyophilized Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.6,
        standardDiluentVolMl: 20.0,
        resultingConcMgMl: 48.5,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "24 hours (reconstituted vial)",
            refrigerated: "14 days (reconstituted vial)",
        },
        clinicalNotes: "NEVER ADMINISTER IV PUSH or IM. MUST be further diluted to ≤5 mg/mL (e.g. 1 g in ≥200 mL) and infused at ≤10 mg/min (≥60 min per 1 g) to prevent Vancomycin Infusion Reaction (Red Man Syndrome).",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42217bc4-e223-455b-a25e-e0ef9f50e7b8",
    },
    {
        id: "ampicillin-1g",
        drugName: "Ampicillin Sodium",
        brandName: "Principen",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV / IM",
        displacementVolMl: 0.6,
        standardDiluentVolMl: 3.4,
        resultingConcMgMl: 250,
        recommendedDiluents: ["SWFI", "0.9% NS"],
        stability: {
            roomTemp: "1 hour in D5W (rapid degradation!), 8 hours in NS",
            refrigerated: "48 hours in NS",
        },
        clinicalNotes: "RAPID DEGRADATION: Use reconstituted solution within 1 hour. Avoid dextrose solutions if possible as ampicillin hydrolyzes rapidly in acidic pH.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=233e72eb-9174-4b53-a5bc-b73a388b1442",
    },
    {
        id: "unasyn-3g",
        drugName: "Ampicillin / Sulbactam",
        brandName: "Unasyn",
        vialStrengthMg: 3000,
        vialLabel: "3 g Vial (2g Amp / 1g Sulb)",
        route: "IV Piggyback",
        displacementVolMl: 1.6,
        standardDiluentVolMl: 6.4,
        resultingConcMgMl: 375,
        recommendedDiluents: ["SWFI", "0.9% NS"],
        stability: {
            roomTemp: "8 hours in NS",
            refrigerated: "48 hours in NS",
        },
        clinicalNotes: "Resulting concentration is 375 mg/mL (250 mg ampicillin + 125 mg sulbactam per mL). Dilute further to 3-45 mg/mL in NS for IV infusion.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1f66bfad-1d11-4770-b184-a1db024f2b90",
    },
    {
        id: "cefazolin-1g",
        drugName: "Cefazolin Sodium",
        brandName: "Ancef",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV / IM",
        displacementVolMl: 0.5,
        standardDiluentVolMl: 2.5,
        resultingConcMgMl: 330,
        recommendedDiluents: ["SWFI", "0.9% NS"],
        stability: {
            roomTemp: "24 hours (25°C)",
            refrigerated: "10 days (4°C)",
        },
        clinicalNotes: "For IV Push: Reconstitute with 10 mL SWFI (yields 100 mg/mL) and inject slowly over 3-5 minutes. For IM: Reconstitute with 2.5 mL SWFI (yields 330 mg/mL).",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=29a91079-8800-47b2-bd79-a78b40875e53",
    },
    {
        id: "meropenem-1g",
        drugName: "Meropenem",
        brandName: "Merrem",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.8,
        standardDiluentVolMl: 20.0,
        resultingConcMgMl: 48.1,
        recommendedDiluents: ["SWFI", "0.9% NS", "5% Dextrose"],
        stability: {
            roomTemp: "2 hours reconstituted with SWFI, 1 hour in D5W",
            refrigerated: "15 hours in SWFI, 24 hours in NS",
        },
        clinicalNotes: "Shake until dissolved and clear. Infuse IV Push over 3-5 min or IVPB over 15-30 min (or 3-hr extended infusion in critical care).",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=80e7228a-6b45-4ae0-b490-410a5e8e89f8",
    },
    {
        id: "cefepime-2g",
        drugName: "Cefepime HCl",
        brandName: "Maxipime",
        vialStrengthMg: 2000,
        vialLabel: "2 g (2000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 2.6,
        standardDiluentVolMl: 17.4,
        resultingConcMgMl: 100,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "24 hours (20-25°C)",
            refrigerated: "7 days (2-8°C)",
        },
        clinicalNotes: "Reconstituted solution may range from colorless to amber without loss of potency. Infuse IVPB over 30 minutes.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=361d9cf1-33ea-44a6-98dc-a734fa096df6",
    },
];

export default function ReconstitutionCalculator() {
    // ─── STATE MANAGEMENT ───────────────────────────────────────────
    const [selectedPresetId, setSelectedPresetId] = useState<string>("ceftriaxone-1g-iv");
    const [calcMode, setCalcMode] = useState<CalcMode>("doseToVol");

    // Core parameters
    const [vialStrength, setVialStrength] = useState<string>("1000");
    const [vialStrengthUnit, setVialStrengthUnit] = useState<"mg" | "g">("mg");
    const [displacementVol, setDisplacementVol] = useState<string>("0.4");
    const [diluentAdded, setDiluentAdded] = useState<string>("9.6");
    const [targetConc, setTargetConc] = useState<string>("100");
    const [prescribedDose, setPrescribedDose] = useState<string>("750");
    const [prescribedDoseUnit, setPrescribedDoseUnit] = useState<"mg" | "g">("mg");
    const [withdrawalVol, setWithdrawalVol] = useState<string>("7.5");

    // Secondary IV Bag Dilution state
    const [enableIvBag, setEnableIvBag] = useState<boolean>(true);
    const [carrierBagVol, setCarrierBagVol] = useState<string>("100");
    const [infusionDurationMin, setInfusionDurationMin] = useState<string>("30");

    // UI States
    const [searchFilter, setSearchFilter] = useState<string>("");
    const [copiedLabel, setCopiedLabel] = useState<boolean>(false);
    const [showUspGuide, setShowUspGuide] = useState<boolean>(false);
    const [showMathDetails, setShowMathDetails] = useState<boolean>(false);

    // ─── PRESET SELECTION HANDLER ───────────────────────────────────
    const handleSelectPreset = useCallback((presetId: string) => {
        setSelectedPresetId(presetId);
        if (presetId === "custom") return;

        const preset = RECONSTITUTION_DATABASE.find((p) => p.id === presetId);
        if (preset) {
            setVialStrength(preset.vialStrengthMg.toString());
            setVialStrengthUnit("mg");
            setDisplacementVol(preset.displacementVolMl.toString());
            setDiluentAdded(preset.standardDiluentVolMl.toString());
            setTargetConc(preset.resultingConcMgMl.toString());

            // Set a sensible default dose (e.g., 75% of vial or full vial)
            const defaultDose = preset.vialStrengthMg === 1000 ? 750 : preset.vialStrengthMg;
            setPrescribedDose(defaultDose.toString());
            setPrescribedDoseUnit("mg");
        }
    }, []);

    // ─── ACTIVE PRESET OBJECT ───────────────────────────────────────
    const activePreset = useMemo(() => {
        return RECONSTITUTION_DATABASE.find((p) => p.id === selectedPresetId) || null;
    }, [selectedPresetId]);

    // ─── FILTERED PRESETS FOR SEARCH ────────────────────────────────
    const filteredPresets = useMemo(() => {
        if (!searchFilter.trim()) return RECONSTITUTION_DATABASE;
        const q = searchFilter.toLowerCase();
        return RECONSTITUTION_DATABASE.filter(
            (p) =>
                p.drugName.toLowerCase().includes(q) ||
                p.brandName.toLowerCase().includes(q) ||
                p.route.toLowerCase().includes(q)
        );
    }, [searchFilter]);

    // ─── MATHEMATICAL CALCULATIONS ENGINE ───────────────────────────
    const calculations = useMemo(() => {
        const rawStrength = parseFloat(vialStrength) || 0;
        const totalVialMg = vialStrengthUnit === "g" ? rawStrength * 1000 : rawStrength;
        const powderDisplacement = parseFloat(displacementVol) || 0;

        let diluentVolume = parseFloat(diluentAdded) || 0;
        let finalConcMgMl = 0;
        let finalReconstitutedVol = 0;

        if (calcMode === "targetConc") {
            const desiredConc = parseFloat(targetConc) || 0;
            if (desiredConc > 0 && totalVialMg > 0) {
                finalReconstitutedVol = totalVialMg / desiredConc;
                diluentVolume = Math.max(0, finalReconstitutedVol - powderDisplacement);
                finalConcMgMl = desiredConc;
            }
        } else {
            finalReconstitutedVol = diluentVolume + powderDisplacement;
            if (finalReconstitutedVol > 0 && totalVialMg > 0) {
                finalConcMgMl = totalVialMg / finalReconstitutedVol;
            }
        }

        // Dose calculations
        const rawPrescribedDose = parseFloat(prescribedDose) || 0;
        const doseMg = prescribedDoseUnit === "g" ? rawPrescribedDose * 1000 : rawPrescribedDose;

        let calculatedWithdrawalVol = 0;
        let calculatedDeliveredDoseMg = 0;

        if (finalConcMgMl > 0) {
            if (calcMode === "volToDose") {
                const volInput = parseFloat(withdrawalVol) || 0;
                calculatedWithdrawalVol = volInput;
                calculatedDeliveredDoseMg = volInput * finalConcMgMl;
            } else {
                calculatedWithdrawalVol = doseMg / finalConcMgMl;
                calculatedDeliveredDoseMg = doseMg;
            }
        }

        // Secondary IV Dilution
        const carrierVol = parseFloat(carrierBagVol) || 0;
        const totalBagVolume = carrierVol + calculatedWithdrawalVol;
        const finalBagConc = totalBagVolume > 0 ? calculatedDeliveredDoseMg / totalBagVolume : 0;
        const infusionMin = parseFloat(infusionDurationMin) || 0;
        const infusionRateMlHr = infusionMin > 0 ? (totalBagVolume / infusionMin) * 60 : 0;
        const doseDeliveryRateMgMin = infusionMin > 0 ? calculatedDeliveredDoseMg / infusionMin : 0;

        // Syringe volume percentage of total reconstituted vial
        const vialFractionUsed = finalReconstitutedVol > 0 ? (calculatedWithdrawalVol / finalReconstitutedVol) * 100 : 0;

        return {
            totalVialMg,
            powderDisplacement,
            diluentVolume,
            finalReconstitutedVol,
            finalConcMgMl,
            doseMg,
            calculatedWithdrawalVol,
            calculatedDeliveredDoseMg,
            totalBagVolume,
            finalBagConc,
            infusionRateMlHr,
            doseDeliveryRateMgMin,
            vialFractionUsed,
            isValid: totalVialMg > 0 && finalReconstitutedVol > 0 && finalConcMgMl > 0,
        };
    }, [
        vialStrength,
        vialStrengthUnit,
        displacementVol,
        diluentAdded,
        targetConc,
        prescribedDose,
        prescribedDoseUnit,
        withdrawalVol,
        calcMode,
        carrierBagVol,
        infusionDurationMin,
    ]);

    // ─── COPY COMPOUNDING RECORD TO CLIPBOARD ───────────────────────
    const handleCopyCompoundingLog = useCallback(() => {
        const drugLabel = activePreset ? `${activePreset.drugName} (${activePreset.brandName})` : "Custom Parenteral Drug";
        const text = `
=== PHARMAWALLAH ASEPTIC COMPOUNDING & RECONSTITUTION RECORD ===
Drug: ${drugLabel}
Vial Strength: ${calculations.totalVialMg} mg
Powder Displacement Volume: ${calculations.powderDisplacement.toFixed(2)} mL
Diluent Added: ${calculations.diluentVolume.toFixed(2)} mL
Total Reconstituted Volume: ${calculations.finalReconstitutedVol.toFixed(2)} mL
Reconstituted Concentration: ${calculations.finalConcMgMl.toFixed(2)} mg/mL

DOSE PREPARATION:
Target Dose: ${calculations.calculatedDeliveredDoseMg.toFixed(1)} mg
Volume Withdrawn: ${calculations.calculatedWithdrawalVol.toFixed(2)} mL (${calculations.vialFractionUsed.toFixed(1)}% of vial)
${enableIvBag
                ? `\nSECONDARY IV DILUTION:
Carrier Solution: ${carrierBagVol} mL
Total IVPB Infusion Volume: ${calculations.totalBagVolume.toFixed(1)} mL
Final Infusion Concentration: ${calculations.finalBagConc.toFixed(2)} mg/mL
Infusion Duration: ${infusionDurationMin} min
Pump Rate: ${calculations.infusionRateMlHr.toFixed(1)} mL/hr (${calculations.doseDeliveryRateMgMin.toFixed(1)} mg/min)`
                : ""
            }

STORAGE & STABILITY (USP <797>):
Room Temperature: ${activePreset?.stability.roomTemp || "Follow institutional protocol"}
Refrigerated: ${activePreset?.stability.refrigerated || "Follow institutional protocol"}
Clinical Notes: ${activePreset?.clinicalNotes || "Standard sterile technique"}
Generated at: ${new Date().toLocaleString()}
=============================================================
`.trim();

        navigator.clipboard.writeText(text);
        setCopiedLabel(true);
        setTimeout(() => setCopiedLabel(false), 2500);
    }, [calculations, activePreset, enableIvBag, carrierBagVol, infusionDurationMin]);

    // ─── RESET TO DEFAULTS ──────────────────────────────────────────
    const handleReset = () => {
        handleSelectPreset("ceftriaxone-1g-iv");
        setCalcMode("doseToVol");
        setEnableIvBag(true);
        setCarrierBagVol("100");
        setInfusionDurationMin("30");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* ─── HERO HEADER ────────────────────────────────────────── */}
                <motion.header
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-500 p-8 text-white shadow-xl"
                >
                    <div className="relative z-10 max-w-3xl space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30">
                                <Sparkles className="w-3.5 h-3.5" />
                                PharmaWallah Clinical Suite
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/30 backdrop-blur-md text-emerald-100 border border-emerald-300/30">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                USP &lt;797&gt; Displacement Engine
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Parenteral Drug Reconstitution & Dilution Calculator
                        </h1>
                        <p className="text-blue-50 text-sm sm:text-base leading-relaxed">
                            Accurately calculate powder displacement volumes, final reconstituted concentrations, syringe withdrawal volumes, and secondary IVPB infusion pump rates with built-in antibiotic monographs.
                        </p>
                    </div>

                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 opacity-10 pointer-events-none hidden lg:block">
                        <FlaskConical className="w-80 h-80 text-white" />
                    </div>
                </motion.header>

                {/* ─── QUICK PRESET SELECTOR & SEARCH ────────────────────── */}
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-bold text-slate-800">Select Antibiotic or Parenteral Drug Preset</h2>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search drug (e.g., Zosyn)..."
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                />
                            </div>
                            <button
                                onClick={handleReset}
                                title="Reset all fields"
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                        {filteredPresets.map((preset) => {
                            const isSelected = selectedPresetId === preset.id;
                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => handleSelectPreset(preset.id)}
                                    className={`p-3 rounded-xl text-left transition-all border ${isSelected
                                        ? "bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-500 shadow-sm ring-2 ring-blue-500/20"
                                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    <div className="font-semibold text-xs text-slate-900 truncate">
                                        {preset.drugName}
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate">
                                        {preset.vialLabel}
                                    </div>
                                    <div className="mt-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                                        {preset.route}
                                    </div>
                                </button>
                            );
                        })}

                        <button
                            onClick={() => {
                                setSelectedPresetId("custom");
                            }}
                            className={`p-3 rounded-xl text-left transition-all border ${selectedPresetId === "custom"
                                ? "bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-500 shadow-sm ring-2 ring-blue-500/20"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                        >
                            <div className="font-semibold text-xs text-slate-900">Custom Drug</div>
                            <div className="text-[11px] text-slate-500">Manual Entry</div>
                            <div className="mt-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                                Any Vial
                            </div>
                        </button>
                    </div>
                </section>

                {/* ─── MAIN WORKBENCH (GRID: INPUTS VS RESULTS) ───────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ─── LEFT COLUMN: CALCULATION CONTROLS & INPUTS (7 COLS) ─── */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* Mode Selector */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Calculation Target Mode
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <button
                                    onClick={() => setCalcMode("doseToVol")}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${calcMode === "doseToVol"
                                        ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md shadow-blue-500/20"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                >
                                    <Syringe className="w-3.5 h-3.5" />
                                    Dose → Withdrawal Vol
                                </button>

                                <button
                                    onClick={() => setCalcMode("volToDose")}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${calcMode === "volToDose"
                                        ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md shadow-blue-500/20"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                >
                                    <Calculator className="w-3.5 h-3.5" />
                                    Volume → Delivered Dose
                                </button>

                                <button
                                    onClick={() => setCalcMode("targetConc")}
                                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${calcMode === "targetConc"
                                        ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-md shadow-blue-500/20"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                >
                                    <Droplet className="w-3.5 h-3.5" />
                                    Target Conc → Diluent Needed
                                </button>
                            </div>
                        </div>

                        {/* Step 1: Vial Specification */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                                        1
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                                        Vial Parameters & Powder Displacement
                                    </h3>
                                </div>
                                <span className="text-[11px] font-medium text-slate-400">Step 1 of 3</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Total Vial Strength */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Total Drug in Vial
                                    </label>
                                    <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
                                        <input
                                            type="number"
                                            step="any"
                                            value={vialStrength}
                                            onChange={(e) => setVialStrength(e.target.value)}
                                            placeholder="e.g. 1000"
                                            className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none"
                                        />
                                        <select
                                            value={vialStrengthUnit}
                                            onChange={(e) => setVialStrengthUnit(e.target.value as "mg" | "g")}
                                            className="bg-slate-100 px-3 text-xs font-semibold text-slate-700 border-l border-slate-300 focus:outline-none"
                                        >
                                            <option value="mg">mg</option>
                                            <option value="g">g</option>
                                        </select>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Total active drug content per vial</p>
                                </div>

                                {/* Powder Displacement Volume */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                                        <span>Powder Displacement Volume</span>
                                        <span className="text-[11px] text-blue-600 font-normal">Package Insert</span>
                                    </label>
                                    <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={displacementVol}
                                            onChange={(e) => setDisplacementVol(e.target.value)}
                                            placeholder="e.g. 0.4"
                                            className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-12"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                            mL
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Volume occupied by dry powder</p>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Reconstitution Process */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                                        2
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                                        Diluent Addition & Final Concentration
                                    </h3>
                                </div>
                                <span className="text-[11px] font-medium text-slate-400">Step 2 of 3</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {calcMode !== "targetConc" ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Diluent Volume to Add
                                        </label>
                                        <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={diluentAdded}
                                                onChange={(e) => setDiluentAdded(e.target.value)}
                                                placeholder="e.g. 9.6"
                                                className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-12"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                                mL
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Yields {calculations.finalReconstitutedVol.toFixed(2)} mL total volume
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Desired Target Concentration
                                        </label>
                                        <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-600">
                                            <input
                                                type="number"
                                                step="1"
                                                value={targetConc}
                                                onChange={(e) => setTargetConc(e.target.value)}
                                                placeholder="e.g. 100"
                                                className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-16"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                                mg/mL
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">
                                            Requires {calculations.diluentVolume.toFixed(2)} mL diluent
                                        </p>
                                    </div>
                                )}

                                {/* Resulting Concentration Indicator */}
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-col justify-center">
                                    <span className="text-xs text-slate-500 font-medium">Reconstituted Concentration</span>
                                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                                        {calculations.finalConcMgMl > 0 ? (
                                            <>
                                                {calculations.finalConcMgMl.toFixed(1)}{" "}
                                                <span className="text-xs font-normal text-slate-600">mg/mL</span>
                                            </>
                                        ) : (
                                            <span className="text-sm text-slate-400">Enter valid volumes</span>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-1">
                                        Total Yield: {calculations.finalReconstitutedVol.toFixed(1)} mL
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Prescribed Dose & Syringe Withdrawal */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                                        3
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                                        {calcMode === "volToDose" ? "Syringe Volume Administered" : "Prescribed Patient Dose"}
                                    </h3>
                                </div>
                                <span className="text-[11px] font-medium text-slate-400">Step 3 of 3</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {calcMode !== "volToDose" ? (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Prescribed Dose
                                        </label>
                                        <div className="flex rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600">
                                            <input
                                                type="number"
                                                step="any"
                                                value={prescribedDose}
                                                onChange={(e) => setPrescribedDose(e.target.value)}
                                                placeholder="e.g. 750"
                                                className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none"
                                            />
                                            <select
                                                value={prescribedDoseUnit}
                                                onChange={(e) => setPrescribedDoseUnit(e.target.value as "mg" | "g")}
                                                className="bg-slate-100 px-3 text-xs font-semibold text-slate-700 border-l border-slate-300 focus:outline-none"
                                            >
                                                <option value="mg">mg</option>
                                                <option value="g">g</option>
                                            </select>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">Ordered dose for patient</p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Volume Withdrawn in Syringe
                                        </label>
                                        <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-600">
                                            <input
                                                type="number"
                                                step="0.05"
                                                value={withdrawalVol}
                                                onChange={(e) => setWithdrawalVol(e.target.value)}
                                                placeholder="e.g. 7.5"
                                                className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-12"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                                mL
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 mt-1">Measured syringe volume</p>
                                    </div>
                                )}

                                {/* Syringe Dose Callout */}
                                <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/80 flex flex-col justify-center">
                                    <span className="text-xs text-emerald-800 font-semibold">
                                        {calcMode === "volToDose" ? "Delivered Dose" : "Withdrawal Volume Required"}
                                    </span>
                                    <div className="text-xl font-extrabold text-emerald-900 mt-0.5">
                                        {calcMode === "volToDose" ? (
                                            <>
                                                {calculations.calculatedDeliveredDoseMg.toFixed(1)}{" "}
                                                <span className="text-xs font-medium text-emerald-700">mg</span>
                                            </>
                                        ) : (
                                            <>
                                                {calculations.calculatedWithdrawalVol.toFixed(2)}{" "}
                                                <span className="text-xs font-medium text-emerald-700">mL</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-emerald-700 mt-0.5">
                                        Represents {calculations.vialFractionUsed.toFixed(1)}% of total reconstituted vial
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optional: Secondary IV Piggyback Dilution */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FlaskConical className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                                        Secondary IV Bag Dilution & Pump Rate
                                    </h3>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={enableIvBag}
                                        onChange={(e) => setEnableIvBag(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {enableIvBag && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100"
                                >
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            IV Carrier Bag Volume
                                        </label>
                                        <select
                                            value={carrierBagVol}
                                            onChange={(e) => setCarrierBagVol(e.target.value)}
                                            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium text-slate-800"
                                        >
                                            <option value="50">50 mL (IV Piggyback)</option>
                                            <option value="100">100 mL (Standard IVPB)</option>
                                            <option value="250">250 mL (e.g. Vancomycin)</option>
                                            <option value="500">500 mL (Large Volume)</option>
                                            <option value="1000">1000 mL (1 Liter Bag)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            Infusion Duration (minutes)
                                        </label>
                                        <div className="relative rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600">
                                            <input
                                                type="number"
                                                value={infusionDurationMin}
                                                onChange={(e) => setInfusionDurationMin(e.target.value)}
                                                placeholder="e.g. 30"
                                                className="w-full px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none pr-12"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                                                min
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                    </div>

                    {/* ─── RIGHT COLUMN: CLINICAL SUMMARY & HERO RESULTS (5 COLS) ─── */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* HERO RESULTS CARD */}
                        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-blue-900/50 space-y-6">
                            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 text-white">
                                        <Syringe className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-white">Compounding Output</h3>
                                        <p className="text-xs text-blue-200/80">Displacement-Corrected Values</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCopyCompoundingLog}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
                                >
                                    {copiedLabel ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            Copy Log
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Main Withdrawal Highlight */}
                            <div className="bg-gradient-to-r from-blue-600/30 to-emerald-500/30 rounded-2xl p-5 border border-emerald-400/30 backdrop-blur-sm">
                                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                                    {calcMode === "volToDose" ? "Delivered Dose" : "Volume to Withdraw for Patient Dose"}
                                </div>
                                <div className="text-4xl sm:text-5xl font-black text-white mt-1 tracking-tight">
                                    {calcMode === "volToDose" ? (
                                        <>
                                            {calculations.calculatedDeliveredDoseMg.toFixed(1)}{" "}
                                            <span className="text-xl font-medium text-emerald-300">mg</span>
                                        </>
                                    ) : (
                                        <>
                                            {calculations.calculatedWithdrawalVol.toFixed(2)}{" "}
                                            <span className="text-xl font-medium text-emerald-300">mL</span>
                                        </>
                                    )}
                                </div>
                                <div className="mt-2 text-xs text-blue-100 flex items-center gap-1.5">
                                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    <span>
                                        {calcMode === "volToDose"
                                            ? `From ${calculations.calculatedWithdrawalVol.toFixed(2)} mL reconstituted solution`
                                            : `Provides exactly ${calculations.calculatedDeliveredDoseMg.toFixed(1)} mg (${calculations.vialFractionUsed.toFixed(1)}% of vial)`}
                                    </span>
                                </div>
                            </div>

                            {/* Core Breakdown Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <span className="text-[11px] text-blue-200">Diluent to Add</span>
                                    <div className="text-lg font-bold text-white mt-0.5">
                                        {calculations.diluentVolume.toFixed(2)}{" "}
                                        <span className="text-xs font-normal text-blue-200">mL</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Added to vial</span>
                                </div>

                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <span className="text-[11px] text-blue-200">Powder Displacement</span>
                                    <div className="text-lg font-bold text-white mt-0.5">
                                        +{calculations.powderDisplacement.toFixed(2)}{" "}
                                        <span className="text-xs font-normal text-blue-200">mL</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Dry volume</span>
                                </div>

                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <span className="text-[11px] text-blue-200">Total Final Volume</span>
                                    <div className="text-lg font-bold text-emerald-400 mt-0.5">
                                        {calculations.finalReconstitutedVol.toFixed(2)}{" "}
                                        <span className="text-xs font-normal text-blue-200">mL</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">Reconstituted yield</span>
                                </div>

                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <span className="text-[11px] text-blue-200">Reconstituted Conc.</span>
                                    <div className="text-lg font-bold text-emerald-400 mt-0.5">
                                        {calculations.finalConcMgMl.toFixed(1)}{" "}
                                        <span className="text-xs font-normal text-blue-200">mg/mL</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400">In primary vial</span>
                                </div>
                            </div>

                            {/* Secondary IVPB Infusion Stats */}
                            {enableIvBag && (
                                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
                                    <div className="flex items-center justify-between text-xs font-semibold text-blue-200">
                                        <span>Secondary IV Piggyback Infusion</span>
                                        <span className="text-emerald-400">{carrierBagVol} mL Bag</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-slate-400 text-[11px]">Total IVPB Volume:</span>
                                            <div className="font-bold text-white text-sm">
                                                {calculations.totalBagVolume.toFixed(1)} mL
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[11px]">IVPB Concentration:</span>
                                            <div className="font-bold text-white text-sm">
                                                {calculations.finalBagConc.toFixed(2)} mg/mL
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[11px]">Infusion Pump Rate:</span>
                                            <div className="font-bold text-emerald-400 text-sm">
                                                {calculations.infusionRateMlHr.toFixed(1)} mL/hr
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 text-[11px]">Delivery Rate:</span>
                                            <div className="font-bold text-emerald-400 text-sm">
                                                {calculations.doseDeliveryRateMgMin.toFixed(1)} mg/min
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Visual Fluid Displacement Bar */}
                            <div className="space-y-1.5 pt-1">
                                <div className="flex justify-between text-[11px] text-slate-300">
                                    <span>Reconstitution Volume Composition:</span>
                                    <span>{calculations.finalReconstitutedVol.toFixed(1)} mL Total</span>
                                </div>
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex border border-white/10">
                                    <div
                                        style={{
                                            width: `${(calculations.diluentVolume / (calculations.finalReconstitutedVol || 1)) * 100}%`,
                                        }}
                                        className="bg-blue-500 h-full"
                                        title={`Diluent Added: ${calculations.diluentVolume.toFixed(2)} mL`}
                                    />
                                    <div
                                        style={{
                                            width: `${(calculations.powderDisplacement / (calculations.finalReconstitutedVol || 1)) * 100}%`,
                                        }}
                                        className="bg-emerald-400 h-full"
                                        title={`Powder Displacement: ${calculations.powderDisplacement.toFixed(2)} mL`}
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                                        Diluent ({calculations.diluentVolume.toFixed(1)} mL)
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                                        Displacement ({calculations.powderDisplacement.toFixed(1)} mL)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Monograph & Stability Card */}
                        {activePreset && (
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-blue-600" />
                                        <h4 className="font-bold text-sm text-slate-900">
                                            {activePreset.drugName} ({activePreset.brandName}) Monograph
                                        </h4>
                                    </div>
                                    <a
                                        href={activePreset.fdaLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                                    >
                                        DailyMed / FDA <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>

                                <div className="space-y-2.5 text-xs text-slate-700">
                                    <div className="flex items-start gap-2">
                                        <Droplet className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-semibold text-slate-900">Compatible Diluents: </span>
                                            {activePreset.recommendedDiluents.join(", ")}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Thermometer className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-semibold text-slate-900">Storage & Stability: </span>
                                            Room Temp: {activePreset.stability.roomTemp} | Refrigerated: {activePreset.stability.refrigerated}
                                        </div>
                                    </div>

                                    {activePreset.clinicalNotes && (
                                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2 mt-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <div>{activePreset.clinicalNotes}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── EDUCATIONAL ACCORDIONS & CLINICAL REFERENCE ─────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Math & Formulas Accordion */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                        <button
                            onClick={() => setShowMathDetails(!showMathDetails)}
                            className="w-full flex items-center justify-between text-left focus:outline-none"
                        >
                            <div className="flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-blue-600" />
                                <h3 className="font-bold text-base text-slate-900">
                                    Mathematical Equations & Powder Physics
                                </h3>
                            </div>
                            {showMathDetails ? (
                                <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                        </button>

                        {showMathDetails && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4 pt-3 border-t border-slate-100 text-xs text-slate-700 leading-relaxed"
                            >
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1.5">
                                    <div className="text-blue-700 font-semibold">1. Total Reconstituted Volume:</div>
                                    <div>{`\(V_{\text{final}} = V_{\text{diluent added}} + V_{\text{powder displacement}}\)`}</div>

                                    <div className="text-blue-700 font-semibold pt-1">2. Reconstituted Concentration:</div>
                                    <div>{`\(C_{\text{final}} = \frac{\text{Vial Strength (mg)}}{V_{\text{final}} (\text{mL})}\)`}</div>

                                    <div className="text-blue-700 font-semibold pt-1">3. Syringe Withdrawal Volume:</div>
                                    <div>{`\(V_{\text{dose}} = \frac{\text{Prescribed Dose (mg)}}{C_{\text{final}} (\text{mg/mL})}\)`}</div>
                                </div>

                                <div className="text-slate-600">
                                    <strong className="text-slate-900">Why Powder Volume Cannot Be Ignored:</strong> Reconstituting a 1 g Ceftriaxone vial with 9.6 mL of diluent yields a final volume of 10.0 mL due to a 0.4 mL powder volume displacement. If a practitioner assumes the final volume is 9.6 mL, concentration would be miscalculated as 104.2 mg/mL instead of 100 mg/mL, leading to compounding underdosing errors.
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* USP <797> Sterile Compounding Safety */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                        <button
                            onClick={() => setShowUspGuide(!showUspGuide)}
                            className="w-full flex items-center justify-between text-left focus:outline-none"
                        >
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-base text-slate-900">
                                    USP &lt;797&gt; Sterile Compounding Best Practices
                                </h3>
                            </div>
                            {showUspGuide ? (
                                <ChevronUp className="w-4 h-4 text-slate-500" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                        </button>

                        {showUspGuide && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-3 pt-3 border-t border-slate-100 text-xs text-slate-700 leading-relaxed"
                            >
                                <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                                    <li>
                                        <strong className="text-slate-800">ISO Class 5 Environment:</strong> Perform all vial reconstitutions within a certified Primary Engineering Control (PEC) laminar airflow workbench or biological safety cabinet.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800">Vial Septum Disinfection:</strong> Swab vial rubber stoppers with sterile 70% IPA (Isopropyl Alcohol) using sterile wipe in a single direction; allow to dry completely (≥10 seconds) before puncturing.
                                    </li>
                                    <li>
                                        <strong className="text-slate-800">Air Pressure Equalization:</strong> When adding diluent to dry powder vials, practice slight negative pressure or use venting needles/equalizing techniques to prevent aerosolization of cytotoxic or allergenic antibiotic particles (especially penicillins/cephalosporins).
                                    </li>
                                </ul>
                            </motion.div>
                        )}
                    </div>

                </div>

                {/* ─── CLINICAL DISCLAIMER & REGULATORY FOOTER ─────────────── */}
                <footer className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs text-slate-500">
                    <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <span className="font-bold text-slate-700">Official Clinical Compounding Disclaimer: </span>
                            This calculator is designed as a clinical decision support tool for pharmacists, pharmacy technicians, and healthcare professionals. Always verify vial displacement values against the manufacturer&apos;s specific package insert, as displacement can vary between generic manufacturers and proprietary formulations. Verify all doses and sterile preparations in compliance with institutional compounding protocols and current USP &lt;797&gt; standards before patient administration.
                        </div>
                    </div>
                    <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-2 flex flex-wrap justify-between items-center gap-2">
                        <span>PharmaWallah Clinical Engineering • Updated for 2026 Parenteral Standards</span>
                        <span>Referenced against FDA Center for Drug Evaluation & Research (CDER) & USP &lt;797&gt;</span>
                    </div>
                </footer>

            </div>
        </div>
    );
}