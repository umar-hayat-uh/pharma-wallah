// src/lib/courses/subjects/biochemistry.ts
// Converted from the old app/api/biochemistry-data.ts — same content,
// reshaped into the shared SubjectMeta contract so it plugs into the
// generic [semesterSlug]/[subjectSlug]/[unit] route.

import type { SubjectMeta } from "../types";

export const biochemistrySubject: SubjectMeta = {
  slug: "pharmaceutical-biochemistry",
  semesterSlug: "sem-1",
  semester: "Semester 1",
  title: "Pharmaceutical Biochemistry",
  subjectCode: "PHARM-BIOC-101",
  icon: "🧬",
  description:
    "Explore the molecular basis of life — from energy metabolism and carbohydrate chemistry to lipid structure, vitamins, and hormonal signalling.",
  gradient: "from-blue-600 to-cyan-400",
  hasMcq: true,
  units: [
    {
      id: "unit1-intro-pharma-biochemistry",
      title: "Unit 1: Introduction to Pharmaceutical Biochemistry",
      shortTitle: "Intro to Pharma Biochemistry",
      emoji: "🔬",
      description:
        "Scope of biochemistry in pharmacy, cell organisation, biomolecules overview, and the molecular logic of living systems.",
      readTime: 10,
      difficulty: "Beginner",
      gradient: "from-blue-600 to-cyan-400",
      previewImage: "/previews/biochem/unit1-intro.jpg",
      contentFile: "pharmaceutical-biochemistry/unit1-intro-pharma-biochemistry.md",
    },
    {
      id: "unit2-carbohydrates",
      title: "Unit 2: Biochemistry of Carbohydrates",
      shortTitle: "Biochemistry of Carbohydrates",
      emoji: "🍬",
      description:
        "Structure, classification and metabolism of sugars — glycolysis, TCA cycle, glycogenesis, glycogenolysis and gluconeogenesis.",
      readTime: 15,
      difficulty: "Intermediate",
      gradient: "from-amber-500 to-orange-400",
      previewImage: "/previews/biochem/unit2-carbs.jpg",
      contentFile: "pharmaceutical-biochemistry/unit2-carbohydrates.md",
    },
    {
      id: "unit3-bioenergetics",
      title: "Unit 3: Bioenergetics",
      shortTitle: "Bioenergetics",
      emoji: "⚡",
      description:
        "Laws of thermodynamics, free energy, ATP synthesis, oxidative phosphorylation, electron transport chain, and mitochondrial coupling.",
      readTime: 14,
      difficulty: "Advanced",
      gradient: "from-yellow-500 to-lime-400",
      previewImage: "/previews/biochem/unit3-bioenergetics.png",
      contentFile: "pharmaceutical-biochemistry/unit3-bioenergetics.md",
    },
    {
      id: "unit4-lipids",
      title: "Unit 4: Biochemistry of Lipids",
      shortTitle: "Biochemistry of Lipids",
      emoji: "🧈",
      description:
        "Classification of lipids, fatty acid oxidation (β-oxidation), lipogenesis, ketone bodies, phospholipids, cholesterol and lipoproteins.",
      readTime: 16,
      difficulty: "Advanced",
      gradient: "from-rose-500 to-pink-400",
      previewImage: "/previews/biochem/unit4-lipids.png",
      contentFile: "pharmaceutical-biochemistry/unit4-lipids.md",
    },
    {
      id: "unit5-vitamins",
      title: "Unit 5: Biochemistry of Vitamins",
      shortTitle: "Biochemistry of Vitamins",
      emoji: "💊",
      description:
        "Fat-soluble (A, D, E, K) and water-soluble (B-complex, C) vitamins — coenzyme roles, deficiency diseases, daily requirements.",
      readTime: 13,
      difficulty: "Intermediate",
      gradient: "from-green-500 to-teal-400",
      previewImage: "/previews/biochem/unit5-vitamins.png",
      contentFile: "pharmaceutical-biochemistry/unit5-vitamins.md",
    },
    {
      id: "unit6-hormones",
      title: "Unit 6: Biochemistry of Hormones",
      shortTitle: "Biochemistry of Hormones",
      emoji: "🧬",
      description:
        "Hormone classification, mechanisms of action, second messengers (cAMP, IP3/DAG), steroid hormones, thyroid hormones and insulin signalling.",
      readTime: 14,
      difficulty: "Advanced",
      gradient: "from-violet-600 to-purple-400",
      previewImage: "/previews/biochem/unit6-hormones.png",
      contentFile: "pharmaceutical-biochemistry/unit6-hormones.md",
    },
  ],
};