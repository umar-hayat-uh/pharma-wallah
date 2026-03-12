// app/api/pharmaceutical-analysis-data.ts
// Centralised metadata for all Pharmaceutical Analysis units.

export interface PharmaAnalysisUnit {
  id: string;
  title: string;
  shortTitle: string;
  emoji: string;
  description: string;
  readTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  gradient: string;
  previewImage?: string;
  color: {
    badge: string;
    icon: string;
    iconText: string;
    heading: string;
  };
}

export const PHARMA_ANALYSIS_META = {
  title: "Pharmaceutical Analysis",
  slug: "pharmaceutical-analysis",
  semester: "Semester 6",
  semesterSlug: "sem-6",
  description:
    "Quantitative and qualitative analysis of pharmaceutical substances — covering classical chemical methods, electrochemical techniques, optical spectroscopy, and radiochemical analysis for drug quality assurance.",
  totalUnits: 4,
  subjectCode: "PHARM-ANAL-601",
};

export const PharmaAnalysisUnits: PharmaAnalysisUnit[] = [
  {
    id: "unit1-chemical-methods",
    title: "Unit 1: Chemical Methods",
    shortTitle: "Chemical Methods",
    emoji: "🧪",
    description:
      "Titrimetric analysis including acid-base, redox, complexometric, and precipitation titrations. Gravimetric methods, primary standards, and indicator theory.",
    readTime: 14,
    difficulty: "Medium",
    gradient: "from-cyan-600 to-teal-400",
    previewImage: "/previews/pharmaanalysis/unit1-chemical.jpg",
    color: {
      badge:    "bg-cyan-50 text-cyan-700 border-cyan-200",
      icon:     "bg-cyan-50 border-cyan-100",
      iconText: "text-cyan-600",
      heading:  "from-cyan-600 to-teal-500",
    },
  },
  {
    id: "unit2-electrochemical-methods",
    title: "Unit 2: Electrochemical Methods",
    shortTitle: "Electrochemical Methods",
    emoji: "⚡",
    description:
      "Potentiometry, pH measurement, ion-selective electrodes, conductometry, polarography, amperometry, and coulometry — principles and pharmaceutical applications.",
    readTime: 15,
    difficulty: "Hard",
    gradient: "from-blue-600 to-cyan-400",
    previewImage: "/previews/pharmaanalysis/unit2-electrochemical.jpg",
    color: {
      badge:    "bg-blue-50 text-blue-700 border-blue-200",
      icon:     "bg-blue-50 border-blue-100",
      iconText: "text-blue-600",
      heading:  "from-blue-600 to-cyan-500",
    },
  },
  {
    id: "unit3-optical-methods",
    title: "Unit 3: Optical Methods",
    shortTitle: "Optical Methods",
    emoji: "🔭",
    description:
      "UV-Visible spectrophotometry, Beer-Lambert law, colorimetry, fluorimetry, flame photometry, atomic absorption spectroscopy, IR spectroscopy, and refractometry.",
    readTime: 16,
    difficulty: "Hard",
    gradient: "from-violet-600 to-blue-400",
    previewImage: "/previews/pharmaanalysis/unit3-optical.jpg",
    color: {
      badge:    "bg-violet-50 text-violet-700 border-violet-200",
      icon:     "bg-violet-50 border-violet-100",
      iconText: "text-violet-600",
      heading:  "from-violet-600 to-blue-500",
    },
  },
  {
    id: "unit4-radiochemical-methods",
    title: "Unit 4: Radiochemical Methods",
    shortTitle: "Radiochemical Methods",
    emoji: "☢️",
    description:
      "Radioactivity fundamentals, types of radiation, radioisotopes in pharmacy, radioimmunoassay, isotope dilution analysis, radiation safety, and nuclear pharmacy applications.",
    readTime: 13,
    difficulty: "Hard",
    gradient: "from-teal-600 to-emerald-400",
    previewImage: "/previews/pharmaanalysis/unit4-radiochemical.jpg",
    color: {
      badge:    "bg-teal-50 text-teal-700 border-teal-200",
      icon:     "bg-teal-50 border-teal-100",
      iconText: "text-teal-600",
      heading:  "from-teal-600 to-emerald-500",
    },
  },
];

export const PHARMA_ANALYSIS_DIFF_BADGE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};