"use client";

import Link from "next/link";
import {
    Calculator,
    Beaker,
    Pill,
    FlaskRound,
    Scale,
    Microscope,
    TestTube,
    Atom,
    Shield,
    FileText,
    TriangleAlert,
    Search,
    // Additional icons for background
    FlaskConical,
    Dna,
    HeartPulse,
    Leaf,
    Syringe,
    Tablet,
    ClipboardList,
    Stethoscope,
    Bandage,
    Droplet,
    Eye,
    Bone,
    Brain,
    Heart,
    Activity,
    AlertCircle,
    Scissors,
    Thermometer,
    Wind,
    Droplets,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useState, useMemo } from "react";

// Icon mapping for tools (unchanged)
const getToolIcon = (toolName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
        Dosage: <Pill className="w-6 h-6" />,
        Concentration: <FlaskRound className="w-6 h-6" />,
        Dilution: <TestTube className="w-6 h-6" />,
        Molarity: <Beaker className="w-6 h-6" />,
        Molecular: <Atom className="w-6 h-6" />,
        Weight: <Scale className="w-6 h-6" />,
        pH: <Calculator className="w-6 h-6" />,
        Formula: <FileText className="w-6 h-6" />,
        Calculator: <Calculator className="w-6 h-6" />,
        Analysis: <Microscope className="w-6 h-6" />,
    };

    const iconKey = Object.keys(iconMap).find((key) =>
        toolName.toLowerCase().includes(key.toLowerCase())
    );

    return iconKey ? iconMap[iconKey] : <Calculator className="w-6 h-6" />;
};

// Background icon types and lists (unchanged)
interface BgIconItem {
    Icon: LucideIcon;
    color: string;
}

const iconList: BgIconItem[] = [
    { Icon: Pill, color: "text-blue-800/10" },
    { Icon: FlaskConical, color: "text-green-800/10" },
    { Icon: Beaker, color: "text-purple-800/10" },
    { Icon: Microscope, color: "text-amber-800/10" },
    { Icon: Atom, color: "text-blue-800/10" },
    { Icon: Dna, color: "text-green-800/10" },
    { Icon: HeartPulse, color: "text-purple-800/10" },
    { Icon: Leaf, color: "text-amber-800/10" },
    { Icon: Syringe, color: "text-blue-800/10" },
    { Icon: TestTube, color: "text-green-800/10" },
    { Icon: Tablet, color: "text-purple-800/10" },
    { Icon: ClipboardList, color: "text-amber-800/10" },
    { Icon: Stethoscope, color: "text-blue-800/10" },
    { Icon: Bandage, color: "text-green-800/10" },
    { Icon: Droplet, color: "text-purple-800/10" },
    { Icon: Eye, color: "text-amber-800/10" },
    { Icon: Bone, color: "text-blue-800/10" },
    { Icon: Brain, color: "text-green-800/10" },
    { Icon: Heart, color: "text-purple-800/10" },
    { Icon: Activity, color: "text-amber-800/10" },
    { Icon: AlertCircle, color: "text-blue-800/10" },
    { Icon: Scissors, color: "text-green-800/10" },
    { Icon: Thermometer, color: "text-purple-800/10" },
    { Icon: Wind, color: "text-amber-800/10" },
    { Icon: Droplets, color: "text-green-800/10" },
    { Icon: FlaskRound, color: "text-purple-800/10" },
    { Icon: Scale, color: "text-blue-800/10" },
    { Icon: Calculator, color: "text-green-800/10" },
];

const bgIcons: BgIconItem[] = [];
for (let i = 0; i < 40; i++) {
    const item = iconList[i % iconList.length];
    bgIcons.push({
        Icon: item.Icon,
        color:
            i % 4 === 0
                ? "text-blue-800/10"
                : i % 4 === 1
                    ? "text-green-800/10"
                    : i % 4 === 2
                        ? "text-purple-800/10"
                        : "text-amber-800/10",
    });
}

export default function CalculationToolsClient() {
    const [searchQuery, setSearchQuery] = useState("");

    // All tools (FULL LIST from original)
    const allTools = useMemo(
        () => [
            // Pharmaceutical Chemistry
            { name: "Molarity Calculator", link: "/calculation-tools/molarity-calculator" },
            { name: "Mass–Molarity Calculator", link: "/calculation-tools/mass-molarity-calculator" },
            { name: "mg/mL ↔ Molarity Calculator", link: "/calculation-tools/mg-ml-to-molarity-calculator" },
            { name: "Normality Calculator", link: "/calculation-tools/normality-calculator" },
            {
                name: "Percentage Solution Calculator (w/v, w/w, v/v)",
                link: "/calculation-tools/percentage-solution-calculator",
            },
            { name: "ppm / ppb Calculator", link: "/calculation-tools/ppm-ppb-calculator" },
            { name: "Dilution Calculator (C₁V₁ = C₂V₂)", link: "/calculation-tools/dilution-calculator" },
            { name: "Molecular Weight Finder", link: "/calculation-tools/molecular-weight-finder" },
            { name: "Solubility Calculator", link: "/calculation-tools/solubility-calculator" },
            { name: "Heat of Formation Calculator", link: "/calculation-tools/heat-formation-calculator" },
            {
                name: "pH–pKa Calculator (Henderson–Hasselbalch)",
                link: "/calculation-tools/pH-pka-relationship-calculator",
            },
            { name: "Combined pKa Suite", link: "/calculation-tools/combined-pka-suite" },
            { name: "Heat Of Neutralization Calculator", link: "/calculation-tools/HeatOfNeutralizationCalculator" },

            // Unit Conversion
            { name: "Mass Conversion Calculator", link: "/calculation-tools/MassConversionCalculator" },
            { name: "Volume Conversion Calculator", link: "/calculation-tools/VolumeConversionCalculator" },
            { name: "mmol ↔ mEq ↔ mg Calculator", link: "/calculation-tools/ElectrolyteConversionCalculator" },
            { name: "Temperature Conversion Calculator", link: "/calculation-tools/TemperatureConversionCalculator" },
            { name: "Strength Conversion Calculator", link: "/calculation-tools/StrengthConversionCalculator" },
            {
                name: "Weight/Volume Conversion Calculator (Density-Based)",
                link: "/calculation-tools/DensityConversionCalculator",
            },

            // Pharmaceutics
            {
                name: "Powder Flowability Calculator",
                link: "/calculation-tools/powder-flowability-calculator",
            },
            {
                name: "Surface Area–Particle Size Calculator",
                link: "/calculation-tools/surface-area-particle-size-calculator",
            },
            {
                name: "Compressibility Index Calculator",
                link: "/calculation-tools/compressibility-index-calculator",
            },
            { name: "Porosity Calculator", link: "/calculation-tools/porosity-calculator" },
            { name: "Density Calculator", link: "/calculation-tools/density-calculator" },
            {
                name: "Tablet Dissolution Profile Plotter",
                link: "/calculation-tools/tablet-disintegration-dissolution-profile-plotter",
            },
            { name: "Content Uniformity Calculator", link: "/calculation-tools/content-uniformity-calculator" },
            { name: "Osmolarity Calculator", link: "/calculation-tools/osmolarity-calculators" },
            { name: "Osmolality Calculator", link: "/calculation-tools/osmolality-calculators" },
            { name: "Isotonicity Calculator", link: "/calculation-tools/isotonicity-calculator" },
            { name: "Sterile Dose Volume Calculator", link: "/calculation-tools/sterile-dose-volume" },
            {
                name: "Drug–Excipient Compatibility Predictor",
                link: "/calculation-tools/drug-excipient-compatibility-predictor",
            },

            // Biopharmaceutics & Pharmacokinetics
            { name: "Half-Life Calculator", link: "/calculation-tools/half-life-calculator" },
            { name: "Ke Calculator", link: "/calculation-tools/ke-calculator" },
            { name: "Clearance Calculator", link: "/calculation-tools/clearance-calculator" },
            { name: "Volume of Distribution Calculator", link: "/calculation-tools/volume-distribution-calculator" },
            { name: "AUC Estimator", link: "/calculation-tools/auc-estimator" },
            { name: "Bioavailability Calculator", link: "/calculation-tools/bioavailability-calculator" },
            { name: "Loading Dose Calculator", link: "/calculation-tools/loading-dose-calculator" },
            { name: "Maintenance Dose Calculator", link: "/calculation-tools/maintenance-dose-calculator" },
            {
                name: "First-Order vs Zero-Order Kinetics Tool",
                link: "/calculation-tools/order-kinetics-calculator",
            },
            { name: "Bioequivalence Calculator", link: "/calculation-tools/bioequivalence-calculator" },
            { name: "Accumulation Index Calculator", link: "/calculation-tools/AccumulationIndexCalculator" },
            { name: "Mean Residence Time Calculator", link: "/calculation-tools/MeanResidenceTimeCalculator" },

            // Pharmacology
            {
                name: "Drug–Receptor Binding Affinity Tool",
                link: "/calculation-tools/drug-receptor-binding-affinity-tool",
            },
            { name: "Therapeutic Index Calculator", link: "/calculation-tools/therapeutic-index-calculator" },
            { name: "Dose–Response Curve Generator", link: "/calculation-tools/dose-response-curve-generator" },
            { name: "ED50 / TD50 / LD50 Calculator", link: "/calculation-tools/ed50-td50-ld50-calculator" },
            { name: "Antagonism Simulator", link: "/calculation-tools/AntagonismSimulator" },
            { name: "Emax Model Calculator", link: "/calculation-tools/EmaxModelCalculator" },

            // Pharmaceutical Analysis
            {
                name: "Beer-Lambert Law Calculator",
                link: "/calculation-tools/law-absorbance-calculator",
            },
            { name: "UV-Vis Peak Analyzer", link: "/calculation-tools/uv-analyzer-tool" },
            {
                name: "Chromatographic Resolution Calculator",
                link: "/calculation-tools/chromatographic-resolution-calculator",
            },
            { name: "Rf Value Calculator", link: "/calculation-tools/rf-value-calculator" },
            { name: "Percent Purity Calculator", link: "/calculation-tools/percent-purity-calculator" },
            { name: "Ash Value Calculator", link: "/calculation-tools/ash-value-calculator" },

            // Microbiology
            { name: "CFU Calculator", link: "/calculation-tools/cfu-calculator" },
            { name: "Sterilization Calculator", link: "/calculation-tools/sterilization-calculator" },
            { name: "Zone of Inhibition Calculator", link: "/calculation-tools/zone-of-inhibition-calculator" },
            { name: "D-Value Calculator", link: "/calculation-tools/DValueCalculator" },
            { name: "F-Value Calculator", link: "/calculation-tools/FValueCalculator" },
            { name: "Log Reduction Calculator", link: "/calculation-tools/LogReductionCalculator" },

            // Pharmaceutical Engineering
            { name: "Heat Transfer Area Calculator", link: "/calculation-tools/heat-transfer-area" },
            { name: "Reynolds Number Calculator", link: "/calculation-tools/reynolds-number" },
            { name: "Drying Rate Calculator", link: "/calculation-tools/drying-rate" },
            { name: "Mixing Time Estimator", link: "/calculation-tools/mixing-time-estimator" },

            // Clinical & Hospital Pharmacy
            { name: "BSA Calculator", link: "/calculation-tools/bsa-calculator" },
            { name: "BMI Calculator", link: "/calculation-tools/bmi-calculator" },
            { name: "Pediatric Dose Calculator", link: "/calculation-tools/pedriatic-calculator" },
            { name: "IV Drip Rate Calculator", link: "/calculation-tools/iv-drip-rate-calculator" },
            { name: "Creatinine Calculator", link: "/calculation-tools/creatinine-calculator" },
            { name: "GFR Calculator", link: "/calculation-tools/gfr-calculator" },
            { name: "Child-Pugh Calculator", link: "/calculation-tools/child-pugh-calculator" },
            { name: "QT Interval Calculator", link: "/calculation-tools/qt-interval-calculator" },
            {
                name: "Anticoagulation Risk Calculator",
                link: "/calculation-tools/anti-coagulation-risk-calculator",
            },
            { name: "Corrected Calcium Calculator", link: "/calculation-tools/CorrectedCalciumCalculator" },
            { name: "Sodium Correction Calculator", link: "/calculation-tools/SodiumCorrectionCalculator" },
            { name: "Anion Gap Calculator", link: "/calculation-tools/AnionGapCalculator" },
            { name: "Insulin Sensitivity Calculator", link: "/calculation-tools/InsulinSensitivityCalculator" },
        ],
        []
    );

    // Category templates (FULL LIST)
    const categoryTemplates = useMemo(
        () => [
            {
                id: "pharma-chem",
                heading: "Pharmaceutical Chemistry",
                h_description: "Tools for solution preparation, concentration calculations, and chemical analysis",
                icon: "🧪",
                gradient: "from-blue-600 to-green-500",
                toolNames: [
                    "Molarity Calculator",
                    "Mass–Molarity Calculator",
                    "mg/mL ↔ Molarity Calculator",
                    "Normality Calculator",
                    "Percentage Solution Calculator (w/v, w/w, v/v)",
                    "ppm / ppb Calculator",
                    "Dilution Calculator (C₁V₁ = C₂V₂)",
                    "Molecular Weight Finder",
                    "Solubility Calculator",
                    "Heat of Formation Calculator",
                    "pH–pKa Calculator (Henderson–Hasselbalch)",
                    "Combined pKa Suite",
                    "Heat Of Neutralization Calculator",
                ],
            },
            {
                id: "unit-conversion",
                heading: "Unit Conversion",
                h_description: "Convert between pharmaceutical units: mass, volume, concentration, and more",
                icon: "🏥",
                gradient: "from-blue-600 to-green-500",
                toolNames: [
                    "Mass Conversion Calculator",
                    "Volume Conversion Calculator",
                    "mmol ↔ mEq ↔ mg Calculator",
                    "Temperature Conversion Calculator",
                    "Strength Conversion Calculator",
                    "Weight/Volume Conversion Calculator (Density-Based)",
                ],
            },
            {
                id: "pharmaceutics",
                heading: "Pharmaceutics",
                h_description: "Formulation, powder properties, dissolution, and dosage form calculations",
                icon: "💊",
                gradient: "from-blue-600 to-green-500",
                toolNames: [
                    "Powder Flowability Calculator",
                    "Compressibility Index Calculator",
                    "Porosity Calculator",
                    "Density Calculator",
                    "Tablet Dissolution Profile Plotter",
                    "Content Uniformity Calculator",
                    "Osmolarity Calculator",
                    "Osmolality Calculator",
                    "Isotonicity Calculator",
                    "Sterile Dose Volume Calculator",
                    "Drug–Excipient Compatibility Predictor",
                    "Surface Area–Particle Size Calculator",
                ],
            },
            {
                id: "biopharmaceutics-pharmacokinetics",
                heading: "Biopharmaceutics & Pharmacokinetics",
                h_description: "Drug absorption, distribution, metabolism, and excretion parameters",
                icon: "📈",
                gradient: "from-blue-600 to-green-500",
                toolNames: [
                    "Half-Life Calculator",
                    "Ke Calculator",
                    "Clearance Calculator",
                    "Volume of Distribution Calculator",
                    "AUC Estimator",
                    "Bioavailability Calculator",
                    "Loading Dose Calculator",
                    "Maintenance Dose Calculator",
                    "First-Order vs Zero-Order Kinetics Tool",
                    "Bioequivalence Calculator",
                    "Accumulation Index Calculator",
                    "Mean Residence Time Calculator",
                ],
            },
            {
                id: "pharmacology",
                heading: "Pharmacology",
                h_description: "Drug-receptor interactions, dose-response, and safety margin tools",
                icon: "🧠",
                gradient: "from-blue-600 to-green-500",
                toolNames: [
                    "Drug–Receptor Binding Affinity Tool",
                    "Therapeutic Index Calculator",
                    "Dose–Response Curve Generator",
                    "ED50 / TD50 / LD50 Calculator",
                    "Antagonism Simulator",
                    "Emax Model Calculator",
                ],
            },
            {
                id: "pharmaceutical-analysis",
                heading: "Pharmaceutical Analysis",
                h_description: "Spectroscopy, chromatography, purity, and assay calculations",
                icon: "⚗️",
                gradient: "from-blue-600 to-green-500",
                toolNames: [
                    "Beer-Lambert Law Calculator",
                    "UV-Vis Peak Analyzer",
                    "Chromatographic Resolution Calculator",
                    "Rf Value Calculator",
                    "Percent Purity Calculator",
                    "Ash Value Calculator",
                ],
            },
            {
                id: "microbiology",
                heading: "Microbiology",
                h_description: "Microbial quantification, sterilization, and antimicrobial testing",
                icon: "🧫",
                gradient: "from-blue-600 to-green-500",
                toolNames: [
                    "CFU Calculator",
                    "Sterilization Calculator",
                    "Zone of Inhibition Calculator",
                    "D-Value Calculator",
                    "F-Value Calculator",
                    "Log Reduction Calculator",
                ],
            },
            {
                id: "pharmaceutical-engineering",
                heading: "Pharmaceutical Engineering",
                h_description: "Industrial processes, heat transfer, and scale-up calculations",
                icon: "🧮",
                gradient: "from-blue-600 to-green-500",
                toolNames: [
                    "Heat Transfer Area Calculator",
                    "Reynolds Number Calculator",
                    "Drying Rate Calculator",
                    "Mixing Time Estimator",
                ],
            },
            {
                id: "clinical-hospital-pharmacy",
                heading: "Clinical & Hospital Pharmacy",
                h_description: "Patient-specific dosing, renal/hepatic adjustments, and clinical tools",
                icon: "🏥",
                gradient: "from-blue-600 to-green-500",
                toolNames: [
                    "BSA Calculator",
                    "BMI Calculator",
                    "Pediatric Dose Calculator",
                    "IV Drip Rate Calculator",
                    "Creatinine Calculator",
                    "GFR Calculator",
                    "Child-Pugh Calculator",
                    "QT Interval Calculator",
                    "Anticoagulation Risk Calculator",
                    "Corrected Calcium Calculator",
                    "Sodium Correction Calculator",
                    "Anion Gap Calculator",
                    "Insulin Sensitivity Calculator",
                ],
            },
        ],
        []
    );

    // Filtered categories
    const filteredCategories = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase().trim();
        return categoryTemplates
            .map((template) => {
                const tools = template.toolNames
                    .map((name) => allTools.find((t) => t.name === name))
                    .filter((tool): tool is (typeof allTools)[0] => tool !== undefined)
                    .filter((tool) => !lowerQuery || tool.name.toLowerCase().includes(lowerQuery));
                return { ...template, tools };
            })
            .filter((category) => category.tools.length > 0);
    }, [searchQuery, categoryTemplates, allTools]);

    return (
        <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 p-0 relative overflow-x-hidden">
            {/* Background blobs (same) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            </div>

            {/* Floating background icons */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="relative w-full h-full">
                    {bgIcons.map(({ Icon, color }, index) => {
                        const left = `${(index * 13) % 90 + 5}%`;
                        const top = `${(index * 19) % 90 + 5}%`;
                        const size = 30 + (index * 7) % 90;
                        const rotate = (index * 23) % 360;
                        return (
                            <Icon
                                key={index}
                                size={size}
                                className={`absolute ${color}`}
                                style={{ left, top, transform: `rotate(${rotate}deg)` }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                            Pharmaceutical
                            <span className="block text-green-300 mt-2">Calculation Tools</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
                            Professional-grade calculators and formula tools designed for pharmacy professionals,
                            researchers, and students
                        </p>
                        <div
                            className="bg-red-100/90 backdrop-blur-sm border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
                            role="alert"
                        >
                            <span className="font-bold gap-2 flex items-center justify-center">
                                <TriangleAlert className="inline-flex" />
                                <strong>Professional & Educational Use Only:</strong>
                            </span>
                            <span className="inline-flex sm:inline">
                                These tools are designed exclusively for educational and informational purposes to
                                support academic study and professional reference.
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="mt-8 max-w-xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search calculators by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 z-10">
                {/* Background Icons (duplicate for main area) */}
                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="relative w-full h-full">
                        {bgIcons.map(({ Icon, color }, index) => {
                            const left = `${(index * 13) % 90 + 5}%`;
                            const top = `${(index * 19) % 90 + 5}%`;
                            const size = 30 + (index * 7) % 90;
                            const rotate = (index * 23) % 360;
                            return (
                                <Icon
                                    key={index}
                                    size={size}
                                    className={`absolute ${color}`}
                                    style={{ left, top, transform: `rotate(${rotate}deg)` }}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* No results message */}
                {filteredCategories.length === 0 && searchQuery && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No calculators found for "{searchQuery}"</p>
                    </div>
                )}

                {/* Categories */}
                {filteredCategories.map((category) => (
                    <div key={category.id} className="mb-16">
                        {/* Category Header */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${category.gradient}`}>
                                    <span className="text-2xl">{category.icon}</span>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                                        {category.heading}
                                    </h2>
                                    <p className="text-gray-600 text-sm">{category.h_description}</p>
                                </div>
                            </div>
                            <hr className="mt-4 border-t-2 border-blue-200/50 max-w-xs mx-auto" />
                        </div>

                        {/* Tools Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {category.tools.map((tool) => (
                                <Link key={tool.name} href={tool.link} className="group">
                                    <div className="relative p-6 rounded-2xl backdrop-blur-md transition-all duration-300 flex flex-col h-full bg-white/40 border border-white/50 shadow-lg hover:shadow-2xl hover:scale-105 hover:bg-white/60">
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                                        <div className="relative mb-4 flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100/50 to-green-100/50 backdrop-blur-sm border border-white/50 shadow-sm">
                                            {getToolIcon(tool.name)}
                                        </div>
                                        <h3 className="relative text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                                            {tool.name}
                                        </h3>
                                        <div className="relative mt-4 flex justify-end">
                                            <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                                                →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}