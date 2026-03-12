// app/api/organic-chemistry-data.ts
// Centralised metadata for all Pharmaceutical Organic Chemistry units.

export interface OrgChemUnit {
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

export const ORG_CHEM_META = {
  title: "Pharmaceutical Organic Chemistry",
  slug: "pharmaceutical-organic-chemistry",
  semester: "Semester 1",
  semesterSlug: "sem-1",
  description:
    "The chemical language of drug design — from atomic structure and bonding through functional groups and reaction mechanisms to stereochemistry and its critical role in pharmacological activity.",
  totalUnits: 4,
  subjectCode: "PHARM-OCHEM-101",
};

export const OrgChemUnits: OrgChemUnit[] = [
  {
    id: "unit1-basic-concepts",
    title: "Unit 1: Basic Concepts",
    shortTitle: "Basic Concepts",
    emoji: "⚛️",
    description:
      "Atomic orbitals, hybridisation (sp, sp², sp³), covalent bonding, resonance, inductive and mesomeric effects, electronegativity, acids and bases in organic chemistry, and IUPAC nomenclature.",
    readTime: 12,
    difficulty: "Easy",
    gradient: "from-emerald-600 to-teal-400",
    previewImage: "/previews/orgchem/unit1-basics.jpg",
    color: {
      badge:    "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon:     "bg-emerald-50 border-emerald-100",
      iconText: "text-emerald-600",
      heading:  "from-emerald-600 to-teal-500",
    },
  },
  {
    id: "unit2-functional-organic-compounds",
    title: "Unit 2: Functional Organic Compounds",
    shortTitle: "Functional Organic Compounds",
    emoji: "🧬",
    description:
      "Hydrocarbons, alkyl halides, alcohols, phenols, ethers, aldehydes, ketones, carboxylic acids, esters, amines, and amides — structures, properties, and pharmaceutical relevance.",
    readTime: 16,
    difficulty: "Medium",
    gradient: "from-violet-600 to-purple-400",
    previewImage: "/previews/orgchem/unit2-functional.jpg",
    color: {
      badge:    "bg-violet-50 text-violet-700 border-violet-200",
      icon:     "bg-violet-50 border-violet-100",
      iconText: "text-violet-600",
      heading:  "from-violet-600 to-purple-500",
    },
  },
  {
    id: "unit3-types-of-reactions",
    title: "Unit 3: Types of Reactions",
    shortTitle: "Types of Reactions",
    emoji: "⚗️",
    description:
      "Substitution (SN1, SN2), elimination (E1, E2), addition, condensation, and oxidation-reduction reactions. Reaction mechanisms, intermediates, energy diagrams, and catalysis.",
    readTime: 15,
    difficulty: "Hard",
    gradient: "from-orange-500 to-amber-400",
    previewImage: "/previews/orgchem/unit3-reactions.jpg",
    color: {
      badge:    "bg-orange-50 text-orange-700 border-orange-200",
      icon:     "bg-orange-50 border-orange-100",
      iconText: "text-orange-600",
      heading:  "from-orange-500 to-amber-500",
    },
  },
  {
    id: "unit4-stereochemistry",
    title: "Unit 4: Stereochemistry",
    shortTitle: "Stereochemistry",
    emoji: "🔄",
    description:
      "Chirality, enantiomers, diastereomers, R/S and E/Z configuration, optical activity, racemic mixtures, meso compounds, and the pharmacological significance of stereoisomerism in drug action.",
    readTime: 14,
    difficulty: "Hard",
    gradient: "from-rose-600 to-pink-400",
    previewImage: "/previews/orgchem/unit4-stereochemistry.jpg",
    color: {
      badge:    "bg-rose-50 text-rose-700 border-rose-200",
      icon:     "bg-rose-50 border-rose-100",
      iconText: "text-rose-600",
      heading:  "from-rose-600 to-pink-500",
    },
  },
];

export const ORG_CHEM_DIFF_BADGE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};