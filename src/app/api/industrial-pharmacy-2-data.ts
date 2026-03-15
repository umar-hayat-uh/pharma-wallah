// app/api/industrial-pharmacy-2-data.ts

export interface IndPharm2Unit {
  id: string; title: string; shortTitle: string; emoji: string;
  description: string; readTime: number; difficulty: "Easy"|"Medium"|"Hard";
  gradient: string; previewImage?: string;
  color: { badge: string; icon: string; iconText: string; heading: string; };
}

export const IND_PHARM2_META = {
  title: "Industrial Pharmacy II",
  slug: "industrial-pharmacy-2",
  semester: "Semester 7",
  semesterSlug: "sem-7",
  description:
    "Advanced industrial pharmacy covering pharmaceutical plant layout and design, heat and mass transfer operations, industry safety methods, packaging technology, and practical study tour insights from pharmaceutical manufacturing facilities.",
  totalUnits: 5,
  subjectCode: "PHARM-IND2-701",
};

export const IndPharm2Units: IndPharm2Unit[] = [
  {
    id: "chapter1-pharma-layout-plant-designing",
    title: "Chapter 1: Pharmaceutical Layout & Plant Designing",
    shortTitle: "Pharmaceutical Layout & Plant Designing",
    emoji: "🏗️",
    description:
      "Principles of pharmaceutical plant layout, GMP-compliant facility design, HVAC systems, cleanroom classification (ISO/EU GMP grades), environmental monitoring, material and personnel flow, and regulatory requirements for plant design.",
    readTime: 14, difficulty: "Medium",
    gradient: "from-blue-700 to-indigo-500",
    previewImage: "/previews/indpharm2/ch1-layout.jpg",
    color: { badge: "bg-blue-50 text-blue-700 border-blue-200", icon: "bg-blue-50 border-blue-100", iconText: "text-blue-600", heading: "from-blue-700 to-indigo-500" },
  },
  {
    id: "chapter2-heat-mass-transfer",
    title: "Chapter 2: Heat Transfer & Mass Transfer",
    shortTitle: "Heat Transfer & Mass Transfer",
    emoji: "♨️",
    description:
      "Principles of heat transfer (conduction, convection, radiation), heat exchangers, evaporation and distillation, mass transfer fundamentals, diffusion, extraction, absorption, and their pharmaceutical applications in manufacturing.",
    readTime: 16, difficulty: "Hard",
    gradient: "from-orange-600 to-red-400",
    previewImage: "/previews/indpharm2/ch2-heat-mass.jpg",
    color: { badge: "bg-orange-50 text-orange-700 border-orange-200", icon: "bg-orange-50 border-orange-100", iconText: "text-orange-600", heading: "from-orange-600 to-red-500" },
  },
  {
    id: "chapter3-safety-methods",
    title: "Chapter 3: Safety Methods in the Pharmaceutical Industry",
    shortTitle: "Safety Methods",
    emoji: "🦺",
    description:
      "Occupational health and safety, hazard identification and risk assessment, HAZOP studies, fire safety, explosion prevention, handling of hazardous chemicals and solvents, waste management, safety audits, and regulatory compliance (OSHA, WHO).",
    readTime: 12, difficulty: "Medium",
    gradient: "from-red-600 to-rose-400",
    previewImage: "/previews/indpharm2/ch3-safety.jpg",
    color: { badge: "bg-red-50 text-red-700 border-red-200", icon: "bg-red-50 border-red-100", iconText: "text-red-600", heading: "from-red-600 to-rose-500" },
  },
  {
    id: "chapter4-packaging-technology",
    title: "Chapter 4: Packaging Technology",
    shortTitle: "Packaging Technology",
    emoji: "📦",
    description:
      "Pharmaceutical packaging materials (glass, plastics, metals, laminates), packaging types (primary, secondary, tertiary), blister packs, strip packs, ampoules, vials, child-resistant packaging, labelling regulations, and packaging validation.",
    readTime: 13, difficulty: "Medium",
    gradient: "from-teal-600 to-cyan-400",
    previewImage: "/previews/indpharm2/ch4-packaging.jpg",
    color: { badge: "bg-teal-50 text-teal-700 border-teal-200", icon: "bg-teal-50 border-teal-100", iconText: "text-teal-600", heading: "from-teal-600 to-cyan-500" },
  },
  {
    id: "chapter5-study-tour",
    title: "Chapter 5: Study Tour of Pharmaceutical Industry",
    shortTitle: "Study Tour of Pharmaceutical Industry",
    emoji: "🏭",
    description:
      "Objectives and planning of industrial study tours, observation of manufacturing areas (solid, liquid, sterile), quality control labs, regulatory documentation, warehouse operations, environmental monitoring, and industrial visit reporting.",
    readTime: 10, difficulty: "Easy",
    gradient: "from-emerald-600 to-green-400",
    previewImage: "/previews/indpharm2/ch5-study-tour.jpg",
    color: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "bg-emerald-50 border-emerald-100", iconText: "text-emerald-600", heading: "from-emerald-600 to-green-500" },
  },
];

export const IND_PHARM2_DIFF_BADGE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};