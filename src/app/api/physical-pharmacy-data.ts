// app/api/physical-pharmacy-data.ts
// Centralised metadata for all Physical Pharmacy units.
// Both the listing page and dynamic unit page import from here.

export interface PhysPharmUnit {
  id: string;            // URL slug — must match the .md filename exactly
  title: string;
  shortTitle: string;
  emoji: string;
  description: string;
  readTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  gradient: string;
  previewImage?: string; // optional — place file in /public/previews/physpharm/
  color: {
    badge: string;
    icon: string;
    iconText: string;
    heading: string;
  };
}

export const PHYSPHARM_META = {
  title: "Physical Pharmacy",
  slug: "physical-pharmacy",
  semester: "Semester 1",
  semesterSlug: "sem-1",
  description:
    "The science of physical and chemical properties of drugs — from foundational pharmacy history and literature, through states of matter and thermodynamics, to particle science and micromeritics.",
  totalUnits: 6,
  subjectCode: "PHARM-PHYS-101",
};

export const PhysPharmUnits: PhysPharmUnit[] = [
  {
    id: "unit1-intro-pharmacy-history",
    title: "Unit 1: Introduction to Pharmacy and History",
    shortTitle: "Intro to Pharmacy & History",
    emoji: "🏛️",
    description:
      "Origins of pharmacy practice, evolution of the pharmacist role, landmark milestones in pharmaceutical science, and the regulatory framework shaping modern pharmacy.",
    readTime: 10,
    difficulty: "Easy",
    gradient: "from-indigo-600 to-blue-400",
    previewImage: "/previews/physpharm/unit1-history.jpg",
    color: {
      badge:    "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon:     "bg-indigo-50 border-indigo-100",
      iconText: "text-indigo-600",
      heading:  "from-indigo-600 to-blue-500",
    },
  },
  {
    id: "unit2-pharmaceutical-literature",
    title: "Unit 2: Introduction to Pharmaceutical Literature",
    shortTitle: "Pharmaceutical Literature",
    emoji: "📚",
    description:
      "Pharmacopoeias, formularies, drug information databases, primary and secondary literature sources, and how to critically evaluate pharmaceutical references.",
    readTime: 11,
    difficulty: "Easy",
    gradient: "from-violet-600 to-indigo-400",
    previewImage: "/previews/physpharm/unit2-literature.jpg",
    color: {
      badge:    "bg-violet-50 text-violet-700 border-violet-200",
      icon:     "bg-violet-50 border-violet-100",
      iconText: "text-violet-600",
      heading:  "from-violet-600 to-indigo-500",
    },
  },
  {
    id: "unit3-introductory-concepts",
    title: "Unit 3: Introductory Concepts in Physical Pharmacy",
    shortTitle: "Introductory Concepts",
    emoji: "⚗️",
    description:
      "States of matter, intermolecular forces, thermodynamic principles, phase diagrams, solubility, colligative properties, and their pharmaceutical significance.",
    readTime: 15,
    difficulty: "Medium",
    gradient: "from-purple-600 to-violet-400",
    previewImage: "/previews/physpharm/unit3-concepts.jpg",
    color: {
      badge:    "bg-purple-50 text-purple-700 border-purple-200",
      icon:     "bg-purple-50 border-purple-100",
      iconText: "text-purple-600",
      heading:  "from-purple-600 to-violet-500",
    },
  },
  {
    id: "unit4-physico-chemical-principles",
    title: "Unit 4: Physico‑Chemical Principles",
    shortTitle: "Physico‑Chemical Principles",
    emoji: "🧪",
    description:
      "Solubility, partition coefficient, surface tension, viscosity, rheology, and their influence on drug formulation and delivery.",
    readTime: 13,
    difficulty: "Medium",
    gradient: "from-cyan-600 to-blue-400",
    previewImage: "/previews/physpharm/unit4-physico.jpg",
    color: {
      badge:    "bg-cyan-50 text-cyan-700 border-cyan-200",
      icon:     "bg-cyan-50 border-cyan-100",
      iconText: "text-cyan-600",
      heading:  "from-cyan-600 to-blue-500",
    },
  },
  {
    id: "unit5-ionization-buffers",
    title: "Unit 5: Ionization and Buffers",
    shortTitle: "Ionization & Buffers",
    emoji: "⚖️",
    description:
      "pH, pKa, Henderson‑Hasselbalch equation, buffer capacity, and the impact of ionization on drug absorption and stability.",
    readTime: 12,
    difficulty: "Medium",
    gradient: "from-amber-600 to-orange-400",
    previewImage: "/previews/physpharm/unit5-ionization.jpg",
    color: {
      badge:    "bg-amber-50 text-amber-700 border-amber-200",
      icon:     "bg-amber-50 border-amber-100",
      iconText: "text-amber-600",
      heading:  "from-amber-600 to-orange-500",
    },
  },
  {
    id: "unit6-micromeritics",
    title: "Unit 6: Micromeritics",
    shortTitle: "Micromeritics",
    emoji: "🔬",
    description:
      "Particle size analysis methods, size distribution, specific surface area, porosity, flow properties, packing, and their impact on drug absorption and formulation.",
    readTime: 14,
    difficulty: "Hard",
    gradient: "from-fuchsia-600 to-purple-400",
    previewImage: "/previews/physpharm/unit6-micromeritics.jpg",
    color: {
      badge:    "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
      icon:     "bg-fuchsia-50 border-fuchsia-100",
      iconText: "text-fuchsia-600",
      heading:  "from-fuchsia-600 to-purple-500",
    },
  },
];

export const PHYSPHARM_DIFF_BADGE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};