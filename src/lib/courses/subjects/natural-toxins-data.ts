// app/api/natural-toxins-data.ts
// Centralised metadata for all Natural Toxins units.

export interface NaturalToxinsUnit {
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

export const NATURAL_TOXINS_META = {
  title: "Natural Toxins",
  slug: "natural-toxins",
  semester: "Semester 6",
  semesterSlug: "sem-6",
  description:
    "A comprehensive study of toxins occurring in nature — from higher and lower plants to fungi, animals, and marine organisms — covering their chemistry, mechanisms of toxicity, and strategies for prevention and control.",
  totalUnits: 6,
  subjectCode: "PHARM-NTOX-601",
};

export const NaturalToxinsUnits: NaturalToxinsUnit[] = [
  {
    id: "unit1-intro-natural-toxins",
    title: "Unit 1: Introduction to Natural Toxins",
    shortTitle: "Introduction to Natural Toxins",
    emoji: "☠️",
    description:
      "Definition and scope of toxicology, classification of natural toxins, dose-response relationships, ADME of toxins, and the historical role of natural poisons in medicine and pharmacy.",
    readTime: 10,
    difficulty: "Easy",
    gradient: "from-green-600 to-emerald-400",
    previewImage: "/previews/naturaltoxins/unit1-intro.jpg",
    color: {
      badge:    "bg-green-50 text-green-700 border-green-200",
      icon:     "bg-green-50 border-green-100",
      iconText: "text-green-600",
      heading:  "from-green-600 to-emerald-500",
    },
  },
  {
    id: "unit2-higher-plant-toxins",
    title: "Unit 2: Higher Plant Toxins",
    shortTitle: "Higher Plant Toxins",
    emoji: "🌿",
    description:
      "Alkaloids, glycosides, oxalates, lectins, and phenolic toxins from angiosperms and gymnosperms. Mechanism of action, affected organ systems, and clinical significance.",
    readTime: 15,
    difficulty: "Medium",
    gradient: "from-lime-600 to-green-400",
    previewImage: "/previews/naturaltoxins/unit2-higher-plants.jpg",
    color: {
      badge:    "bg-lime-50 text-lime-700 border-lime-200",
      icon:     "bg-lime-50 border-lime-100",
      iconText: "text-lime-600",
      heading:  "from-lime-600 to-green-500",
    },
  },
  {
    id: "unit3-lower-plant-toxins",
    title: "Unit 3: Lower Plant Toxins",
    shortTitle: "Lower Plant Toxins",
    emoji: "🦠",
    description:
      "Toxins produced by algae, cyanobacteria, ferns, and mosses. Cyanotoxins, phycotoxins, shellfish poisoning, and harmful algal bloom toxins — structures and mechanisms.",
    readTime: 13,
    difficulty: "Medium",
    gradient: "from-teal-600 to-cyan-400",
    previewImage: "/previews/naturaltoxins/unit3-lower-plants.jpg",
    color: {
      badge:    "bg-teal-50 text-teal-700 border-teal-200",
      icon:     "bg-teal-50 border-teal-100",
      iconText: "text-teal-600",
      heading:  "from-teal-600 to-cyan-500",
    },
  },
  {
    id: "unit4-mycotoxins",
    title: "Unit 4: Mycotoxins",
    shortTitle: "Mycotoxins",
    emoji: "🍄",
    description:
      "Aflatoxins, ochratoxins, fumonisins, trichothecenes, and zearalenone. Fungal biosynthesis, contamination of food and feed, carcinogenicity, and regulatory limits.",
    readTime: 14,
    difficulty: "Hard",
    gradient: "from-amber-600 to-orange-400",
    previewImage: "/previews/naturaltoxins/unit4-mycotoxins.jpg",
    color: {
      badge:    "bg-amber-50 text-amber-700 border-amber-200",
      icon:     "bg-amber-50 border-amber-100",
      iconText: "text-amber-600",
      heading:  "from-amber-600 to-orange-500",
    },
  },
  {
    id: "unit5-animal-toxins",
    title: "Unit 5: Animal Toxins",
    shortTitle: "Animal Toxins",
    emoji: "🐍",
    description:
      "Venoms and toxins from snakes, scorpions, spiders, marine animals, amphibians, and insects. Neurotoxins, cytotoxins, hemotoxins — molecular targets and antivenom therapy.",
    readTime: 16,
    difficulty: "Hard",
    gradient: "from-red-600 to-rose-400",
    previewImage: "/previews/naturaltoxins/unit5-animal-toxins.jpg",
    color: {
      badge:    "bg-red-50 text-red-700 border-red-200",
      icon:     "bg-red-50 border-red-100",
      iconText: "text-red-600",
      heading:  "from-red-600 to-rose-500",
    },
  },
  {
    id: "unit6-prevention-control-toxins",
    title: "Unit 6: Prevention and Control of Toxins",
    shortTitle: "Prevention & Control",
    emoji: "🛡️",
    description:
      "Detoxification strategies, regulatory frameworks, storage conditions, processing methods, biocontrol agents, and monitoring programs for natural toxin management.",
    readTime: 11,
    difficulty: "Medium",
    gradient: "from-sky-600 to-blue-400",
    previewImage: "/previews/naturaltoxins/unit6-prevention.jpg",
    color: {
      badge:    "bg-sky-50 text-sky-700 border-sky-200",
      icon:     "bg-sky-50 border-sky-100",
      iconText: "text-sky-600",
      heading:  "from-sky-600 to-blue-500",
    },
  },
];

export const NATURAL_TOXINS_DIFF_BADGE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};