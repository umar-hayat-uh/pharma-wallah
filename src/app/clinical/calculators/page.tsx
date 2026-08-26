"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ClinicalToolCard from "@/components/Clinical/ClinicalToolCard";

// Clinical calculator list (same as your existing data)
const clinicalCalculators = [
    {
        title: "BSA Calculator",
        href: "/calculation-tools/bsa-calculator",
        description: "Body Surface Area (Mosteller, DuBois, etc.)",
        icon: "scale",
        color: "blue",
    },
    {
        title: "BMI Calculator",
        href: "/calculation-tools/bmi-calculator",
        description: "Body Mass Index & weight classification",
        icon: "scale",
        color: "blue",
    },
    {
        title: "Pediatric Dose Calculator",
        href: "/calculation-tools/pedriatic-calculator",
        description: "Weight‑based dosing for children",
        icon: "stethoscope",
        color: "teal",
    },
    {
        title: "IV Drip Rate Calculator",
        href: "/calculation-tools/iv-drip-rate-calculator",
        description: "Infusion rate and drop/minute calculations",
        icon: "droplet",
        color: "violet",
    },
    {
        title: "Creatinine Calculator",
        href: "/calculation-tools/creatinine-calculator",
        description: "Cockcroft‑Gault equation for CrCl",
        icon: "gauge",
        color: "rose",
    },
    {
        title: "GFR Calculator",
        href: "/calculation-tools/gfr-calculator",
        description: "eGFR using MDRD, CKD‑EPI, etc.",
        icon: "activity",
        color: "emerald",
    },
    {
        title: "Child‑Pugh Calculator",
        href: "/calculation-tools/child-pugh-calculator",
        description: "Liver disease severity score",
        icon: "file-text",
        color: "amber",
    },
    {
        title: "QT Interval Calculator",
        href: "/calculation-tools/qt-interval-calculator",
        description: "Corrected QT (Bazett, Fridericia, etc.)",
        icon: "heart-pulse",
        color: "rose",
    },
    {
        title: "Anticoagulation Risk Calculator",
        href: "/calculation-tools/anti-coagulation-risk-calculator",
        description: "CHA₂DS₂‑VASc, HAS‑BLED, etc.",
        icon: "shield-alert",
        color: "blue",
    },
    {
        title: "Corrected Calcium Calculator",
        href: "/calculation-tools/CorrectedCalciumCalculator",
        description: "Calcium adjusted for albumin",
        icon: "flask-conical",
        color: "violet",
    },
    {
        title: "Sodium Correction Calculator",
        href: "/calculation-tools/SodiumCorrectionCalculator",
        description: "Hyponatremia correction formulas",
        icon: "droplet",
        color: "teal",
    },
    {
        title: "Renal Dose Adjustment Calculator",
        href: "/calculation-tools/renal-dosing-adjuster",
        description: "Dose adjustments for renal impairment",
        icon: "droplet",
        color: "teal",
    },
    {
        title: "Reconstitution Calculator",
        href: "/calculation-tools/reconstitution-calculator",
        description: "Calculate diluent volume, final concentration, and syringe withdrawal for injectable medications",
        icon: "flask-conical",
        color: "teal",
    },
    {
        title: "TPN Calculator",
        href: "/calculation-tools/tpn",
        description: "Compute macronutrient, electrolyte, and total volume for parenteral nutrition orders",
        icon: "syringe",
        color: "emerald",
    },
    {
        title: "Anion Gap Calculator",
        href: "/calculation-tools/AnionGapCalculator",
        description: "Serum anion gap with/without potassium",
        icon: "calculator",
        color: "amber",
    },
    {
        title: "Vancomycin AUC/MIC",
        href: "/calculation-tools/vancomycin-auc-calculator",
        description: "Estimate AUC/MIC ratio using pharmacokinetic parameters",
        icon: "syringe",
        color: "blue",
    },
    {
        title: "Insulin Sensitivity Calculator",
        href: "/calculation-tools/InsulinSensitivityCalculator",
        description: "Insulin dosing adjustments",
        icon: "syringe",
        color: "emerald",
    },
];

// Icon mapping (same as your getToolIcon logic)
const iconMap: Record<string, React.ReactNode> = {
    scale: <Scale className="w-5 h-5" />,
    stethoscope: <Stethoscope className="w-5 h-5" />,
    droplet: <Droplet className="w-5 h-5" />,
    gauge: <Gauge className="w-5 h-5" />,
    activity: <Activity className="w-5 h-5" />,
    "file-text": <FileText className="w-5 h-5" />,
    "heart-pulse": <HeartPulse className="w-5 h-5" />,
    "shield-alert": <ShieldAlert className="w-5 h-5" />,
    "flask-conical": <FlaskConical className="w-5 h-5" />,
    calculator: <Calculator className="w-5 h-5" />,
    syringe: <Syringe className="w-5 h-5" />,
};

// Add the missing imports
import {
    Scale,
    Stethoscope,
    Droplet,
    Gauge,
    Activity,
    FileText,
    HeartPulse,
    ShieldAlert,
    FlaskConical,
    Calculator,
    Syringe,

} from "lucide-react";

export default function ClinicalCalculatorsPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-10">
            {/* Simple top bar for back navigation */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/clinical"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Clinical Hub
                    </Link>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                        Clinical Calculators
                    </h1>
                    <p className="text-slate-500 mt-3 max-w-2xl mx-auto">
                        Patient‑specific dosing, renal/hepatic adjustments, and other essential clinical tools for
                        pharmacy practice.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {clinicalCalculators.map((calc, index) => (
                        <ClinicalToolCard
                            key={calc.title}
                            title={calc.title}
                            description={calc.description}
                            href={calc.href}
                            color={calc.color}
                            icon={iconMap[calc.icon]}
                            index={index}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}