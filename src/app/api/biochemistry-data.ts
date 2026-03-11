// app/api/biochemistry-data.ts
// Centralised metadata for all Pharmaceutical Biochemistry units.
// Both the listing page and dynamic unit page import from here.

export interface BiochemUnit {
  id: string;           // used as the [unit] slug in the URL
  title: string;
  shortTitle: string;
  emoji: string;
  description: string;
  readTime: number;     // estimated minutes
  difficulty: "Easy" | "Medium" | "Hard";
  gradient: string;     // Tailwind gradient classes for card accent stripe
  previewImage?: string; // optional: path inside /public e.g. "/previews/biochem/unit1.jpg"
  color: {
    badge: string;      // pill background + text
    icon: string;       // icon box background
    iconText: string;
    heading: string;    // section heading colour
  };
}

export const SUBJECT_META = {
  title: "Pharmaceutical Biochemistry",
  slug: "pharmaceutical-biochemistry",
  semester: "Semester 1",
  semesterSlug: "sem-1",
  description:
    "Explore the molecular basis of life — from energy metabolism and carbohydrate chemistry to lipid structure, vitamins, and hormonal signalling.",
  totalUnits: 6,
  subjectCode: "PHARM-BIOC-101",
};

export const BiochemUnits: BiochemUnit[] = [
  {
    id: "unit1-intro-pharma-biochemistry",
    title: "Unit 1: Introduction to Pharmaceutical Biochemistry",
    shortTitle: "Intro to Pharma Biochemistry",
    emoji: "🔬",
    description:
      "Scope of biochemistry in pharmacy, cell organisation, biomolecules overview, and the molecular logic of living systems.",
    readTime: 10,
    difficulty: "Easy",
    gradient: "from-blue-600 to-cyan-400",
    previewImage: "/previews/biochem/unit1-intro.jpg",
    color: {
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      icon: "bg-blue-50 border-blue-100",
      iconText: "text-blue-600",
      heading: "from-blue-600 to-cyan-500",
    },
  },
  {
    id: "unit2-carbohydrates",
    title: "Unit 2: Biochemistry of Carbohydrates",
    shortTitle: "Biochemistry of Carbohydrates",
    emoji: "🍬",
    description:
      "Structure, classification and metabolism of sugars — glycolysis, TCA cycle, glycogenesis, glycogenolysis and gluconeogenesis.",
    readTime: 15,
    difficulty: "Medium",
    gradient: "from-amber-500 to-orange-400",
    previewImage: "/previews/biochem/unit2-carbs.jpg",
    color: {
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "bg-amber-50 border-amber-100",
      iconText: "text-amber-600",
      heading: "from-amber-500 to-orange-400",
    },
  },
  {
    id: "unit3-bioenergetics",
    title: "Unit 3: Bioenergetics",
    shortTitle: "Bioenergetics",
    emoji: "⚡",
    description:
      "Laws of thermodynamics, free energy, ATP synthesis, oxidative phosphorylation, electron transport chain, and mitochondrial coupling.",
    readTime: 14,
    difficulty: "Hard",
    gradient: "from-yellow-500 to-lime-400",
    previewImage: "/previews/biochem/unit3-bioenergetics.png",
    color: {
      badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: "bg-yellow-50 border-yellow-100",
      iconText: "text-yellow-600",
      heading: "from-yellow-500 to-lime-500",
    },
  },
  {
    id: "unit4-lipids",
    title: "Unit 4: Biochemistry of Lipids",
    shortTitle: "Biochemistry of Lipids",
    emoji: "🧈",
    description:
      "Classification of lipids, fatty acid oxidation (β-oxidation), lipogenesis, ketone bodies, phospholipids, cholesterol and lipoproteins.",
    readTime: 16,
    difficulty: "Hard",
    gradient: "from-rose-500 to-pink-400",
    previewImage: "/previews/biochem/unit4-lipids.png",

    color: {
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      icon: "bg-rose-50 border-rose-100",
      iconText: "text-rose-600",
      heading: "from-rose-500 to-pink-500",
    },
  },
  {
    id: "unit5-vitamins",
    title: "Unit 5: Biochemistry of Vitamins",
    shortTitle: "Biochemistry of Vitamins",
    emoji: "💊",
    description:
      "Fat-soluble (A, D, E, K) and water-soluble (B-complex, C) vitamins — coenzyme roles, deficiency diseases, daily requirements.",
    readTime: 13,
    difficulty: "Medium",
    gradient: "from-green-500 to-teal-400",
    previewImage: "/previews/biochem/unit5-vitamins.png",
    color: {
      badge: "bg-green-50 text-green-700 border-green-200",
      icon: "bg-green-50 border-green-100",
      iconText: "text-green-600",
      heading: "from-green-500 to-teal-500",
    },
  },
  {
    id: "unit6-hormones",
    title: "Unit 6: Biochemistry of Hormones",
    shortTitle: "Biochemistry of Hormones",
    emoji: "🧬",
    description:
      "Hormone classification, mechanisms of action, second messengers (cAMP, IP3/DAG), steroid hormones, thyroid hormones and insulin signalling.",
    readTime: 14,
    difficulty: "Hard",
    gradient: "from-violet-600 to-purple-400",
    previewImage: "/previews/biochem/unit6-hormones.png",
    color: {
      badge: "bg-violet-50 text-violet-700 border-violet-200",
      icon: "bg-violet-50 border-violet-100",
      iconText: "text-violet-600",
      heading: "from-violet-600 to-purple-500",
    },
  },
];

export const DIFF_BADGE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};