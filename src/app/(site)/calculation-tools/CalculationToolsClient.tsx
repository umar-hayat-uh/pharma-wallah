"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Calculator, Beaker, Pill, FlaskRound, Scale, Microscope,
  TestTube, Atom, FileText, TriangleAlert, Search, X,
  FlaskConical, Stethoscope, Leaf, Activity, HeartPulse, Syringe,
  Dna, BookOpen,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

// ── Tool icon resolver ─────────────────────────────────────────────
const getToolIcon = (name: string) => {
  const map: Record<string, React.ReactNode> = {
    Dosage:       <Pill       className="w-5 h-5" />,
    Concentration:<FlaskRound className="w-5 h-5" />,
    Dilution:     <TestTube   className="w-5 h-5" />,
    Molarity:     <Beaker     className="w-5 h-5" />,
    Molecular:    <Atom       className="w-5 h-5" />,
    Weight:       <Scale      className="w-5 h-5" />,
    pH:           <Calculator className="w-5 h-5" />,
    Formula:      <FileText   className="w-5 h-5" />,
    Calculator:   <Calculator className="w-5 h-5" />,
    Analysis:     <Microscope className="w-5 h-5" />,
  };
  const key = Object.keys(map).find(k => name.toLowerCase().includes(k.toLowerCase()));
  return key ? map[key] : <Calculator className="w-5 h-5" />;
};

// ── Category icon map ──────────────────────────────────────────────
const CAT_ICONS: Record<string, LucideIcon> = {
  "pharma-chem":                       Beaker,
  "unit-conversion":                   Scale,
  "pharmaceutics":                     Pill,
  "biopharmaceutics-pharmacokinetics": Activity,
  "pharmacology":                      HeartPulse,
  "pharmaceutical-analysis":           Microscope,
  "microbiology":                      Syringe,
  "pharmaceutical-engineering":        FlaskRound,
  "clinical-hospital-pharmacy":        Stethoscope,
};

// ── Symmetric 3+3 floating icons ──────────────────────────────────
const bgIcons = [
  { Icon: Pill,        top: "8%",  left: "1.5%",  size: 30, delay: 0   },
  { Icon: Beaker,      top: "38%", left: "1%",    size: 28, delay: 1.0 },
  { Icon: Stethoscope, top: "70%", left: "1.5%",  size: 30, delay: 1.4 },
  { Icon: Microscope,  top: "8%",  left: "96.5%", size: 30, delay: 0.4 },
  { Icon: FlaskConical,top: "38%", left: "97%",   size: 28, delay: 0.8 },
  { Icon: Leaf,        top: "70%", left: "96.5%", size: 28, delay: 0.6 },
];

// ── All tools ─────────────────────────────────────────────────────
const allTools = [
  // Pharmaceutical Chemistry
  { name: "Molarity Calculator",                             link: "/calculation-tools/molarity-calculator" },
  { name: "Mass–Molarity Calculator",                        link: "/calculation-tools/mass-molarity-calculator" },
  { name: "mg/mL ↔ Molarity Calculator",                    link: "/calculation-tools/mg-ml-to-molarity-calculator" },
  { name: "Normality Calculator",                            link: "/calculation-tools/normality-calculator" },
  { name: "Percentage Solution Calculator (w/v, w/w, v/v)", link: "/calculation-tools/percentage-solution-calculator" },
  { name: "ppm / ppb Calculator",                           link: "/calculation-tools/ppm-ppb-calculator" },
  { name: "Dilution Calculator (C₁V₁ = C₂V₂)",             link: "/calculation-tools/dilution-calculator" },
  { name: "Molecular Weight Finder",                         link: "/calculation-tools/molecular-weight-finder" },
  { name: "Solubility Calculator",                           link: "/calculation-tools/solubility-calculator" },
  { name: "Heat of Formation Calculator",                    link: "/calculation-tools/heat-formation-calculator" },
  { name: "pH–pKa Calculator (Henderson–Hasselbalch)",       link: "/calculation-tools/pH-pka-relationship-calculator" },
  { name: "Combined pKa Suite",                              link: "/calculation-tools/combined-pka-suite" },
  { name: "Heat Of Neutralization Calculator",               link: "/calculation-tools/HeatOfNeutralizationCalculator" },
  // Unit Conversion
  { name: "Mass Conversion Calculator",                      link: "/calculation-tools/MassConversionCalculator" },
  { name: "Volume Conversion Calculator",                    link: "/calculation-tools/VolumeConversionCalculator" },
  { name: "mmol ↔ mEq ↔ mg Calculator",                     link: "/calculation-tools/ElectrolyteConversionCalculator" },
  { name: "Temperature Conversion Calculator",               link: "/calculation-tools/TemperatureConversionCalculator" },
  { name: "Strength Conversion Calculator",                  link: "/calculation-tools/StrengthConversionCalculator" },
  { name: "Weight/Volume Conversion Calculator (Density-Based)", link: "/calculation-tools/DensityConversionCalculator" },
  // Pharmaceutics
  { name: "Powder Flowability Calculator",                   link: "/calculation-tools/powder-flowability-calculator" },
  { name: "Surface Area–Particle Size Calculator",           link: "/calculation-tools/surface-area-particle-size-calculator" },
  { name: "Compressibility Index Calculator",                link: "/calculation-tools/compressibility-index-calculator" },
  { name: "Porosity Calculator",                             link: "/calculation-tools/porosity-calculator" },
  { name: "Density Calculator",                              link: "/calculation-tools/density-calculator" },
  { name: "Tablet Dissolution Profile Plotter",              link: "/calculation-tools/tablet-disintegration-dissolution-profile-plotter" },
  { name: "Content Uniformity Calculator",                   link: "/calculation-tools/content-uniformity-calculator" },
  { name: "Osmolarity Calculator",                           link: "/calculation-tools/osmolarity-calculators" },
  { name: "Osmolality Calculator",                           link: "/calculation-tools/osmolality-calculators" },
  { name: "Isotonicity Calculator",                          link: "/calculation-tools/isotonicity-calculator" },
  { name: "Sterile Dose Volume Calculator",                  link: "/calculation-tools/sterile-dose-volume" },
  { name: "Drug–Excipient Compatibility Predictor",          link: "/calculation-tools/drug-excipient-compatibility-predictor" },
  // Biopharmaceutics & Pharmacokinetics
  { name: "Half-Life Calculator",                            link: "/calculation-tools/half-life-calculator" },
  { name: "Ke Calculator",                                   link: "/calculation-tools/ke-calculator" },
  { name: "Clearance Calculator",                            link: "/calculation-tools/clearance-calculator" },
  { name: "Volume of Distribution Calculator",               link: "/calculation-tools/volume-distribution-calculator" },
  { name: "AUC Estimator",                                   link: "/calculation-tools/auc-estimator" },
  { name: "Bioavailability Calculator",                      link: "/calculation-tools/bioavailability-calculator" },
  { name: "Loading Dose Calculator",                         link: "/calculation-tools/loading-dose-calculator" },
  { name: "Maintenance Dose Calculator",                     link: "/calculation-tools/maintenance-dose-calculator" },
  { name: "First-Order vs Zero-Order Kinetics Tool",         link: "/calculation-tools/order-kinetics-calculator" },
  { name: "Bioequivalence Calculator",                       link: "/calculation-tools/bioequivalence-calculator" },
  { name: "Accumulation Index Calculator",                   link: "/calculation-tools/AccumulationIndexCalculator" },
  { name: "Mean Residence Time Calculator",                  link: "/calculation-tools/MeanResidenceTimeCalculator" },
  // Pharmacology
  { name: "Drug–Receptor Binding Affinity Tool",             link: "/calculation-tools/drug-receptor-binding-affinity-tool" },
  { name: "Therapeutic Index Calculator",                    link: "/calculation-tools/therapeutic-index-calculator" },
  { name: "Dose–Response Curve Generator",                   link: "/calculation-tools/dose-response-curve-generator" },
  { name: "ED50 / TD50 / LD50 Calculator",                   link: "/calculation-tools/ed50-td50-ld50-calculator" },
  { name: "Antagonism Simulator",                            link: "/calculation-tools/AntagonismSimulator" },
  { name: "Emax Model Calculator",                           link: "/calculation-tools/EmaxModelCalculator" },
  // Pharmaceutical Analysis
  { name: "Beer-Lambert Law Calculator",                     link: "/calculation-tools/law-absorbance-calculator" },
  { name: "UV-Vis Peak Analyzer",                            link: "/calculation-tools/uv-analyzer-tool" },
  { name: "Chromatographic Resolution Calculator",           link: "/calculation-tools/chromatographic-resolution-calculator" },
  { name: "Rf Value Calculator",                             link: "/calculation-tools/rf-value-calculator" },
  { name: "Percent Purity Calculator",                       link: "/calculation-tools/percent-purity-calculator" },
  { name: "Ash Value Calculator",                            link: "/calculation-tools/ash-value-calculator" },
  // Microbiology
  { name: "CFU Calculator",                                  link: "/calculation-tools/cfu-calculator" },
  { name: "Sterilization Calculator",                        link: "/calculation-tools/sterilization-calculator" },
  { name: "Zone of Inhibition Calculator",                   link: "/calculation-tools/zone-of-inhibition-calculator" },
  { name: "D-Value Calculator",                              link: "/calculation-tools/DValueCalculator" },
  { name: "F-Value Calculator",                              link: "/calculation-tools/FValueCalculator" },
  { name: "Log Reduction Calculator",                        link: "/calculation-tools/LogReductionCalculator" },
  // Pharmaceutical Engineering
  { name: "Heat Transfer Area Calculator",                   link: "/calculation-tools/heat-transfer-area" },
  { name: "Reynolds Number Calculator",                      link: "/calculation-tools/reynolds-number" },
  { name: "Drying Rate Calculator",                          link: "/calculation-tools/drying-rate" },
  { name: "Mixing Time Estimator",                           link: "/calculation-tools/mixing-time-estimator" },
  // Clinical & Hospital Pharmacy
  { name: "BSA Calculator",                                  link: "/calculation-tools/bsa-calculator" },
  { name: "BMI Calculator",                                  link: "/calculation-tools/bmi-calculator" },
  { name: "Pediatric Dose Calculator",                       link: "/calculation-tools/pedriatic-calculator" },
  { name: "IV Drip Rate Calculator",                         link: "/calculation-tools/iv-drip-rate-calculator" },
  { name: "Creatinine Calculator",                           link: "/calculation-tools/creatinine-calculator" },
  { name: "GFR Calculator",                                  link: "/calculation-tools/gfr-calculator" },
  { name: "Child-Pugh Calculator",                           link: "/calculation-tools/child-pugh-calculator" },
  { name: "QT Interval Calculator",                          link: "/calculation-tools/qt-interval-calculator" },
  { name: "Anticoagulation Risk Calculator",                 link: "/calculation-tools/anti-coagulation-risk-calculator" },
  { name: "Corrected Calcium Calculator",                    link: "/calculation-tools/CorrectedCalciumCalculator" },
  { name: "Sodium Correction Calculator",                    link: "/calculation-tools/SodiumCorrectionCalculator" },
  { name: "Anion Gap Calculator",                            link: "/calculation-tools/AnionGapCalculator" },
  { name: "Insulin Sensitivity Calculator",                  link: "/calculation-tools/InsulinSensitivityCalculator" },
];

// ── Categories ────────────────────────────────────────────────────
const categories = [
  { id: "pharma-chem",                       label: "Pharmaceutical Chemistry",              desc: "Solution prep, concentration & chemical analysis tools",            toolNames: ["Molarity Calculator","Mass–Molarity Calculator","mg/mL ↔ Molarity Calculator","Normality Calculator","Percentage Solution Calculator (w/v, w/w, v/v)","ppm / ppb Calculator","Dilution Calculator (C₁V₁ = C₂V₂)","Molecular Weight Finder","Solubility Calculator","Heat of Formation Calculator","pH–pKa Calculator (Henderson–Hasselbalch)","Combined pKa Suite","Heat Of Neutralization Calculator"] },
  { id: "unit-conversion",                   label: "Unit Conversion",                       desc: "Convert between pharmaceutical units: mass, volume, concentration",   toolNames: ["Mass Conversion Calculator","Volume Conversion Calculator","mmol ↔ mEq ↔ mg Calculator","Temperature Conversion Calculator","Strength Conversion Calculator","Weight/Volume Conversion Calculator (Density-Based)"] },
  { id: "pharmaceutics",                     label: "Pharmaceutics",                         desc: "Formulation, powder, dissolution and dosage form calculations",       toolNames: ["Powder Flowability Calculator","Surface Area–Particle Size Calculator","Compressibility Index Calculator","Porosity Calculator","Density Calculator","Tablet Dissolution Profile Plotter","Content Uniformity Calculator","Osmolarity Calculator","Osmolality Calculator","Isotonicity Calculator","Sterile Dose Volume Calculator","Drug–Excipient Compatibility Predictor"] },
  { id: "biopharmaceutics-pharmacokinetics", label: "Biopharmaceutics & Pharmacokinetics",   desc: "ADME parameters, half-life, clearance and kinetics tools",             toolNames: ["Half-Life Calculator","Ke Calculator","Clearance Calculator","Volume of Distribution Calculator","AUC Estimator","Bioavailability Calculator","Loading Dose Calculator","Maintenance Dose Calculator","First-Order vs Zero-Order Kinetics Tool","Bioequivalence Calculator","Accumulation Index Calculator","Mean Residence Time Calculator"] },
  { id: "pharmacology",                      label: "Pharmacology",                          desc: "Drug-receptor interactions, dose-response and safety margins",         toolNames: ["Drug–Receptor Binding Affinity Tool","Therapeutic Index Calculator","Dose–Response Curve Generator","ED50 / TD50 / LD50 Calculator","Antagonism Simulator","Emax Model Calculator"] },
  { id: "pharmaceutical-analysis",           label: "Pharmaceutical Analysis",               desc: "Spectroscopy, chromatography, purity and assay calculations",          toolNames: ["Beer-Lambert Law Calculator","UV-Vis Peak Analyzer","Chromatographic Resolution Calculator","Rf Value Calculator","Percent Purity Calculator","Ash Value Calculator"] },
  { id: "microbiology",                      label: "Microbiology",                          desc: "Microbial quantification, sterilization and antimicrobial testing",    toolNames: ["CFU Calculator","Sterilization Calculator","Zone of Inhibition Calculator","D-Value Calculator","F-Value Calculator","Log Reduction Calculator"] },
  { id: "pharmaceutical-engineering",        label: "Pharmaceutical Engineering",            desc: "Industrial processes, heat transfer and scale-up calculations",        toolNames: ["Heat Transfer Area Calculator","Reynolds Number Calculator","Drying Rate Calculator","Mixing Time Estimator"] },
  { id: "clinical-hospital-pharmacy",        label: "Clinical & Hospital Pharmacy",          desc: "Patient-specific dosing, renal/hepatic adjustments and clinical tools", toolNames: ["BSA Calculator","BMI Calculator","Pediatric Dose Calculator","IV Drip Rate Calculator","Creatinine Calculator","GFR Calculator","Child-Pugh Calculator","QT Interval Calculator","Anticoagulation Risk Calculator","Corrected Calcium Calculator","Sodium Correction Calculator","Anion Gap Calculator","Insulin Sensitivity Calculator"] },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp  = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };

export default function CalculationToolsClient() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return categories
      .map(cat => ({
        ...cat,
        tools: cat.toolNames
          .map(name => allTools.find(t => t.name === name))
          .filter((t): t is typeof allTools[0] => !!t)
          .filter(t => !q || t.name.toLowerCase().includes(q)),
      }))
      .filter(cat => cat.tools.length > 0);
  }, [searchQuery]);

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {/* Floating bg icons */}
      {bgIcons.map(({ Icon, top, left, size, delay }, i) => (
        <motion.div key={i} className="fixed pointer-events-none text-blue-200 z-0"
          style={{ top, left }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 7, delay, repeat: Infinity, ease: "easeInOut" }}>
          <Icon size={size} strokeWidth={1.4} />
        </motion.div>
      ))}

      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-20  w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-20 bottom-4   opacity-15"><Dna      size={60} className="text-white" /></div>
        <div className="absolute right-44 top-6      opacity-15"><Activity size={40} className="text-white" /></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20 text-center">
          <motion.span initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Calculator className="w-3.5 h-3.5" /> Professional Tools
          </motion.span>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Pharmaceutical
            <span className="block text-green-200 mt-1">Calculation Tools</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14 }}
            className="text-blue-100 text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            Professional-grade calculators covering all pharmaceutical disciplines — designed for students, researchers, and pharmacy professionals.
          </motion.p>

          {/* Educational disclaimer */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-7 flex items-start gap-3 px-5 py-3.5 rounded-2xl bg-white/15 border border-white/25 text-left">
            <TriangleAlert className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
            <p className="text-white/90 text-sm leading-relaxed">
              <span className="font-extrabold text-white">Educational use only.</span>{" "}
              These tools are designed for academic study and professional reference — not for direct clinical decision-making.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.26 }}
            className="relative max-w-lg mx-auto">
            <div className="absolute -inset-0.5 rounded-2xl bg-white/20 blur-sm" />
            <div className="relative flex items-center bg-white rounded-2xl border border-white/30 shadow-sm overflow-hidden">
              <Search className="absolute left-4 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search calculators..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-12 py-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent" />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.32 }}
            className="flex items-center justify-center gap-8 mt-7 flex-wrap">
            {[
              { n: `${categories.length}`,  l: "Categories"  },
              { n: `${allTools.length}+`,   l: "Calculators" },
              { n: "Free",                  l: "Always"      },
            ].map(({ n, l }) => (
              <div key={l} className="flex items-center gap-2 text-white/80">
                <span className="text-2xl font-extrabold text-white">{n}</span>
                <span className="text-sm">{l}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16">

        {/* No results */}
        <AnimatePresence>
          {filteredCategories.length === 0 && searchQuery && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center py-20">
              <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                No tools found for <span className="font-semibold text-gray-600">"{searchQuery}"</span>
              </p>
              <button onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition">
                Clear search
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category sections */}
        {filteredCategories.map(cat => {
          const CatIcon = CAT_ICONS[cat.id] ?? Calculator;
          return (
            <motion.div key={cat.id}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.4 }}
              id={cat.id} className="mb-16 scroll-mt-24">

              {/* Category heading */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
                  <CatIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight leading-tight">{cat.label}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.desc}</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 shrink-0">
                  {cat.tools.length} tools
                </span>
              </div>

              {/* Tool cards */}
              <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cat.tools.map(tool => (
                  <motion.div key={tool.name} variants={fadeUp}>
                    <Link href={tool.link} className="group block h-full">
                      <motion.div
                        whileHover={{ y: -5, boxShadow: "0 14px 32px rgba(37,99,235,0.10)" }}
                        transition={{ type: "spring", stiffness: 270 }}
                        className="relative h-full rounded-2xl border border-gray-200 bg-white p-5 flex flex-col hover:border-blue-300 transition-all duration-300 overflow-hidden">
                        {/* Top stripe */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
                        {/* Hover tint */}
                        <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/40 transition-colors duration-300 pointer-events-none" />

                        {/* Icon */}
                        <div className="relative z-10 w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-blue-600
                          group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-400 group-hover:text-white group-hover:border-transparent transition-all duration-300">
                          {getToolIcon(tool.name)}
                        </div>

                        <h3 className="relative z-10 text-sm font-bold text-gray-900 leading-snug line-clamp-2 flex-1 group-hover:text-blue-700 transition-colors">
                          {tool.name}
                        </h3>

                        <div className="relative z-10 mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-blue-600">Open Tool</span>
                          <span className="text-blue-400 group-hover:translate-x-1 transition-transform text-sm">→</span>
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}