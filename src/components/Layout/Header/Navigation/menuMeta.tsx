import React from "react";
import {
  Pill, FlaskConical, Stethoscope, Microscope, Beaker, BookOpen, TestTube,
  ShoppingCart, FileSearch, ShieldAlert, Atom, ListChecks, Layers, Library, Search,
  Scale, Activity, HeartPulse, Syringe, FlaskRound,
} from "lucide-react";

/*
 * Presentation metadata for every submenu entry: its icon, the tint it uses in
 * the mega menu, and its one-line description.
 *
 * Extracted from Header/index.tsx so the desktop mega menu and the mobile
 * drawer read from one table instead of two copies that drift apart.
 */

export const SUBMENU_ICONS: Record<string, React.ReactNode> = {
  Material: <BookOpen className="w-5 h-5" />,
  "MCQ's Bank": <ListChecks className="w-5 h-5" />,
  "Lab Simulation": <TestTube className="w-5 h-5" />,
  "Slide Spotting": <Microscope className="w-5 h-5" />,
  Flashcards: <Layers className="w-5 h-5" />,
  "Pharmacy Counter": <ShoppingCart className="w-5 h-5" />,
  "Compounding Lab": <FlaskConical className="w-5 h-5" />,
  "ADR Detective": <Search className="w-5 h-5" />,
  "Prescription Reader": <FileSearch className="w-5 h-5" />,
  "Books Library": <Library className="w-5 h-5" />,
  "Antibiogram Simulator": <ShieldAlert className="w-5 h-5" />,
  "Molecule Viewer": <Atom className="w-5 h-5" />,
  // ── Calculation Tools categories ──
  "Pharmaceutical Chemistry": <Beaker className="w-5 h-5" />,
  "Unit Conversion": <Scale className="w-5 h-5" />,
  "Pharmaceutics": <Pill className="w-5 h-5" />,
  "Biopharmaceutics & Pharmacokinetics": <Activity className="w-5 h-5" />,
  "Pharmacology": <HeartPulse className="w-5 h-5" />,
  "Pharmaceutical Analysis": <Microscope className="w-5 h-5" />,
  "Microbiology": <Syringe className="w-5 h-5" />,
  "Pharmaceutical Engineering": <FlaskRound className="w-5 h-5" />,
  "Clinical & Hospital Pharmacy": <Stethoscope className="w-5 h-5" />,
};

export const SUBMENU_COLORS: Record<string, { icon: string; bg: string; ring: string }> = {
  Material: { icon: "text-blue-500", bg: "from-blue-50 to-blue-100/40", ring: "group-hover:border-blue-200" },
  "MCQ's Bank": { icon: "text-green-500", bg: "from-green-50 to-green-100/40", ring: "group-hover:border-green-200" },
  "Lab Simulation": { icon: "text-purple-500", bg: "from-purple-50 to-purple-100/40", ring: "group-hover:border-purple-200" },
  "Slide Spotting": { icon: "text-sky-500", bg: "from-sky-50 to-sky-100/40", ring: "group-hover:border-sky-200" },
  Flashcards: { icon: "text-amber-500", bg: "from-amber-50 to-amber-100/40", ring: "group-hover:border-amber-200" },
  "Pharmacy Counter": { icon: "text-orange-500", bg: "from-orange-50 to-orange-100/40", ring: "group-hover:border-orange-200" },
  "Compounding Lab": { icon: "text-teal-500", bg: "from-teal-50 to-teal-100/40", ring: "group-hover:border-teal-200" },
  "ADR Detective": { icon: "text-red-500", bg: "from-red-50 to-red-100/40", ring: "group-hover:border-red-200" },
  "Prescription Reader": { icon: "text-cyan-500", bg: "from-cyan-50 to-cyan-100/40", ring: "group-hover:border-cyan-200" },
  "Books Library": { icon: "text-emerald-500", bg: "from-emerald-50 to-emerald-100/40", ring: "group-hover:border-emerald-200" },
  "Antibiogram Simulator": { icon: "text-rose-500", bg: "from-rose-50 to-rose-100/40", ring: "group-hover:border-rose-200" },
  "Molecule Viewer": { icon: "text-indigo-500", bg: "from-indigo-50 to-indigo-100/40", ring: "group-hover:border-indigo-200" },
  // ── Calculation Tools categories ──
  "Pharmaceutical Chemistry": { icon: "text-violet-500", bg: "from-violet-50 to-violet-100/40", ring: "group-hover:border-violet-200" },
  "Unit Conversion": { icon: "text-slate-500", bg: "from-slate-50 to-slate-100/40", ring: "group-hover:border-slate-200" },
  "Pharmaceutics": { icon: "text-amber-500", bg: "from-amber-50 to-amber-100/40", ring: "group-hover:border-amber-200" },
  "Biopharmaceutics & Pharmacokinetics": { icon: "text-teal-500", bg: "from-teal-50 to-teal-100/40", ring: "group-hover:border-teal-200" },
  "Pharmacology": { icon: "text-rose-500", bg: "from-rose-50 to-rose-100/40", ring: "group-hover:border-rose-200" },
  "Pharmaceutical Analysis": { icon: "text-sky-500", bg: "from-sky-50 to-sky-100/40", ring: "group-hover:border-sky-200" },
  "Microbiology": { icon: "text-lime-500", bg: "from-lime-50 to-lime-100/40", ring: "group-hover:border-lime-200" },
  "Pharmaceutical Engineering": { icon: "text-orange-500", bg: "from-orange-50 to-orange-100/40", ring: "group-hover:border-orange-200" },
  "Clinical & Hospital Pharmacy": { icon: "text-emerald-500", bg: "from-emerald-50 to-emerald-100/40", ring: "group-hover:border-emerald-200" },
};

export const SUBMENU_DESCRIPTIONS: Record<string, string> = {
  Material: "Curated curriculum notes & modules.",
  "MCQ's Bank": "Extensive practice question sets.",
  "Lab Simulation": "Interactive 2D & 3D experiments.",
  "Slide Spotting": "Histology and pathology practice.",
  Flashcards: "Quick review with spaced repetition.",
  "Pharmacy Counter": "Virtual retail dispensing training.",
  "Compounding Lab": "Practice pharmaceutical compounding.",
  "ADR Detective": "Spot and analyze adverse drug reactions.",
  "Prescription Reader": "Decipher and analyze Rx forms.",
  "Books Library": "Comprehensive textbook collection.",
  "Antibiogram Simulator": "Analyze resistance patterns.",
  "Molecule Viewer": "Explore 3D chemical structures.",
  // ── Calculation Tools categories ──
  "Pharmaceutical Chemistry": "Solution prep, concentration & chemical analysis tools",
  "Unit Conversion": "Mass, volume, temperature & unit conversions",
  "Pharmaceutics": "Formulation, powder, dissolution & dosage calculations",
  "Biopharmaceutics & Pharmacokinetics": "ADME parameters, half-life, clearance & kinetics",
  "Pharmacology": "Drug-receptor interactions, dose-response & safety",
  "Pharmaceutical Analysis": "Spectroscopy, chromatography & purity assays",
  "Microbiology": "Microbial quantification & sterilization calculations",
  "Pharmaceutical Engineering": "Heat transfer, fluid dynamics & scale-up",
  "Clinical & Hospital Pharmacy": "Patient dosing, renal/hepatic adjustments & clinical tools",
};

