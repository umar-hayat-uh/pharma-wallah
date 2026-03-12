// app/api/industrial-pharmacy-data.ts
// Centralised metadata for all Industrial Pharmacy units.

export interface IndustrialPharmUnit {
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

export const INDUSTRIAL_PHARM_META = {
  title: "Industrial Pharmacy",
  slug: "industrial-pharmacy",
  semester: "Semester 6",
  semesterSlug: "sem-6",
  description:
    "The science and technology of large-scale drug manufacturing — from foundational unit operations and mixing through granulation, compression, coating, drying, and particle size reduction to the finished dosage form.",
  totalUnits: 9,
  subjectCode: "PHARM-INDP-601",
};

export const IndustrialPharmUnits: IndustrialPharmUnit[] = [
  {
    id: "unit1-intro-unit-operations",
    title: "Unit 1: Introduction to Unit Operations",
    shortTitle: "Intro to Unit Operations",
    emoji: "🏭",
    description:
      "Scope and importance of pharmaceutical manufacturing, classification of unit operations, GMP principles, material and energy balances, scale-up concepts, and regulatory frameworks for industrial production.",
    readTime: 10,
    difficulty: "Easy",
    gradient: "from-slate-600 to-blue-500",
    previewImage: "/previews/indpharm/unit1-intro.jpg",
    color: {
      badge:    "bg-slate-50 text-slate-700 border-slate-200",
      icon:     "bg-slate-50 border-slate-100",
      iconText: "text-slate-600",
      heading:  "from-slate-600 to-blue-500",
    },
  },
  {
    id: "unit2-mixing-blending",
    title: "Unit 2: Mixing & Blending",
    shortTitle: "Mixing & Blending",
    emoji: "🌀",
    description:
      "Mechanisms of mixing (convective, diffusive, shear), tumble blenders, ribbon mixers, high-shear mixers, static mixers, blend uniformity, segregation, and quality control of mixed products.",
    readTime: 13,
    difficulty: "Medium",
    gradient: "from-blue-600 to-indigo-400",
    previewImage: "/previews/indpharm/unit2-mixing.jpg",
    color: {
      badge:    "bg-blue-50 text-blue-700 border-blue-200",
      icon:     "bg-blue-50 border-blue-100",
      iconText: "text-blue-600",
      heading:  "from-blue-600 to-indigo-500",
    },
  },
  {
    id: "unit3-tablet-compression-compaction",
    title: "Unit 3: Tablet Compression & Compaction",
    shortTitle: "Tablet Compression",
    emoji: "💊",
    description:
      "Single-punch and rotary tablet presses, compression force and hardness, tooling types, tablet defects (capping, lamination, sticking), compaction profiles, direct compression, and in-process controls.",
    readTime: 16,
    difficulty: "Hard",
    gradient: "from-violet-600 to-purple-400",
    previewImage: "/previews/indpharm/unit3-tablet.jpg",
    color: {
      badge:    "bg-violet-50 text-violet-700 border-violet-200",
      icon:     "bg-violet-50 border-violet-100",
      iconText: "text-violet-600",
      heading:  "from-violet-600 to-purple-500",
    },
  },
  {
    id: "unit4-granulation",
    title: "Unit 4: Granulation",
    shortTitle: "Granulation",
    emoji: "🧱",
    description:
      "Wet granulation (high-shear, fluidised-bed), dry granulation (roller compaction, slugging), melt granulation, binders and granulating agents, endpoint determination, and granule characterisation.",
    readTime: 15,
    difficulty: "Hard",
    gradient: "from-amber-600 to-yellow-400",
    previewImage: "/previews/indpharm/unit4-granulation.jpg",
    color: {
      badge:    "bg-amber-50 text-amber-700 border-amber-200",
      icon:     "bg-amber-50 border-amber-100",
      iconText: "text-amber-600",
      heading:  "from-amber-600 to-yellow-500",
    },
  },
  {
    id: "unit5-filtration-clarification",
    title: "Unit 5: Filtration & Clarification",
    shortTitle: "Filtration & Clarification",
    emoji: "🔽",
    description:
      "Filter media and filter aids, depth and surface filtration, pressure and vacuum filtration, membrane filtration, sterile filtration, centrifugation, and clarification of pharmaceutical liquids.",
    readTime: 12,
    difficulty: "Medium",
    gradient: "from-cyan-600 to-teal-400",
    previewImage: "/previews/indpharm/unit5-filtration.jpg",
    color: {
      badge:    "bg-cyan-50 text-cyan-700 border-cyan-200",
      icon:     "bg-cyan-50 border-cyan-100",
      iconText: "text-cyan-600",
      heading:  "from-cyan-600 to-teal-500",
    },
  },
  {
    id: "unit6-evaporation",
    title: "Unit 6: Evaporation",
    shortTitle: "Evaporation",
    emoji: "♨️",
    description:
      "Principles of evaporation, types of evaporators (falling film, rising film, wiped film, multiple-effect), heat transfer, vapour recompression, concentration of pharmaceutical solutions, and energy efficiency.",
    readTime: 11,
    difficulty: "Medium",
    gradient: "from-orange-500 to-red-400",
    previewImage: "/previews/indpharm/unit6-evaporation.jpg",
    color: {
      badge:    "bg-orange-50 text-orange-700 border-orange-200",
      icon:     "bg-orange-50 border-orange-100",
      iconText: "text-orange-600",
      heading:  "from-orange-500 to-red-500",
    },
  },
  {
    id: "unit7-encapsulation-coating",
    title: "Unit 7: Encapsulation & Coating",
    shortTitle: "Encapsulation & Coating",
    emoji: "🫙",
    description:
      "Hard and soft gelatin capsule filling, capsule sealing, pan coating, fluidised-bed coating, film coating formulations, enteric coatings, modified-release coatings, and coating defects.",
    readTime: 14,
    difficulty: "Hard",
    gradient: "from-pink-600 to-rose-400",
    previewImage: "/previews/indpharm/unit7-encapsulation.jpg",
    color: {
      badge:    "bg-pink-50 text-pink-700 border-pink-200",
      icon:     "bg-pink-50 border-pink-100",
      iconText: "text-pink-600",
      heading:  "from-pink-600 to-rose-500",
    },
  },
  {
    id: "unit8-drying",
    title: "Unit 8: Drying",
    shortTitle: "Drying",
    emoji: "🌡️",
    description:
      "Moisture content and drying rate curves, tray drying, fluidised-bed drying, spray drying, freeze drying (lyophilisation), infrared and microwave drying, and moisture specifications for pharmaceutical products.",
    readTime: 13,
    difficulty: "Medium",
    gradient: "from-emerald-600 to-green-400",
    previewImage: "/previews/indpharm/unit8-drying.jpg",
    color: {
      badge:    "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon:     "bg-emerald-50 border-emerald-100",
      iconText: "text-emerald-600",
      heading:  "from-emerald-600 to-green-500",
    },
  },
  {
    id: "unit9-particle-size-reduction",
    title: "Unit 9: Particle Size Reduction",
    shortTitle: "Particle Size Reduction",
    emoji: "⚙️",
    description:
      "Principles of size reduction (Kick's, Rittinger's, Bond's laws), ball mills, hammer mills, fluid energy mills, colloid mills, cutter mills, factors affecting milling, and particle size analysis.",
    readTime: 14,
    difficulty: "Hard",
    gradient: "from-stone-600 to-gray-500",
    previewImage: "/previews/indpharm/unit9-particle.jpg",
    color: {
      badge:    "bg-stone-50 text-stone-700 border-stone-200",
      icon:     "bg-stone-50 border-stone-100",
      iconText: "text-stone-600",
      heading:  "from-stone-600 to-gray-600",
    },
  },
];

export const INDUSTRIAL_PHARM_DIFF_BADGE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};