// src/lib/courses/subjects/biochemistry.ts
import type { SubjectMeta } from "../types";

export const biochemistrySubject: SubjectMeta = {
  slug: "pharmaceutical-biochemistry",
  semesterSlug: "sem-1",
  semester: "Semester 1",
  title: "Pharmaceutical Biochemistry",
  subjectCode: "PHARM-BIOC-101",
  icon: "🧬",
  description:
    "Explore the molecular basis of life — from biomolecule chemistry and enzyme kinetics to metabolic pathways and hormonal signalling.",
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
      previewImage:
        "https://res.cloudinary.com/osevupfr/image/upload/l_My%20Brand:WhatsApp_Image_2026-02-27_at_4.44.40_PM_jtmqf8/c_scale,fl_relative,h_1.00,w_1.02/o_12/fl_layer_apply,fl_no_overflow,g_south_east/Chapter_01_Infographic.png",
      contentFile: "pharmaceutical-biochemistry/unit1-intro-pharma-biochemistry.md",
    },
    {
      id: "unit2-carbohydrates",
      title: "Unit 2: Basic Chemistry of Biomolecules: Carbohydrates, Lipids, Proteins & Amino Acids",
      shortTitle: "Biomolecule Chemistry",
      emoji: "🧬",
      description:
        "Chemical nature, classification, optical activity, reactions, and pharmaceutical importance of carbohydrates, lipids, proteins, and amino acids.",
      readTime: 15,
      difficulty: "Intermediate",
      gradient: "from-amber-500 to-orange-400",
      previewImage:
        "https://res.cloudinary.com/osevupfr/image/upload/l_My%20Brand:WhatsApp_Image_2026-02-27_at_4.44.40_PM_jtmqf8/c_scale,fl_relative,h_1.00,w_1.02/o_12/fl_layer_apply,fl_no_overflow,g_south_east/Chapter_02_Infographic.png",
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
      previewImage:
        "https://res.cloudinary.com/osevupfr/image/upload/l_My%20Brand:WhatsApp_Image_2026-02-27_at_4.44.40_PM_jtmqf8/c_scale,fl_relative,h_1.00,w_1.02/o_12/fl_layer_apply,fl_no_overflow,g_south_east/Chapter_03_Infographic.png",
      contentFile: "pharmaceutical-biochemistry/unit3-bioenergetics.md",
    },
    {
      id: "unit4-lipids",
      title: "Unit 4: Enzymes: Chemistry, Classification, Kinetics, Inhibition, and Mechanism of Action",
      shortTitle: "Enzymes",
      emoji: "🧪",
      description:
        "Enzyme structure, classification, kinetics (Michaelis-Menten), inhibition types, allosteric regulation, and mechanisms of chymotrypsin and ribonuclease.",
      readTime: 16,
      difficulty: "Advanced",
      gradient: "from-rose-500 to-pink-400",
      previewImage:
        "https://res.cloudinary.com/osevupfr/image/upload/l_My%20Brand:WhatsApp_Image_2026-02-27_at_4.44.40_PM_jtmqf8/c_scale,fl_relative,h_1.00,w_1.02/o_12/fl_layer_apply,fl_no_overflow,g_south_east/Chapter_04_Infographic.png",
      contentFile: "pharmaceutical-biochemistry/unit4-lipids.md",
    },
    {
      id: "unit5-vitamins",
      title: "Unit 5: Metabolic Fate of Biomolecules: Carbohydrates, Lipids, Proteins & Amino Acids",
      shortTitle: "Metabolism of Biomolecules",
      emoji: "⚙️",
      description:
        "Digestion, absorption, and metabolic pathways of carbohydrates, lipids, and proteins — including glycolysis, TCA cycle, β‑oxidation, urea cycle, and heme synthesis.",
      readTime: 14,
      difficulty: "Advanced",
      gradient: "from-green-500 to-teal-400",
      previewImage:
        "https://res.cloudinary.com/osevupfr/image/upload/l_My%20Brand:WhatsApp_Image_2026-02-27_at_4.44.40_PM_jtmqf8/c_scale,fl_relative,h_1.00,w_1.02/o_12/fl_layer_apply,fl_no_overflow,g_south_east/Chapter_05_Infographic.png",
      contentFile: "pharmaceutical-biochemistry/unit5-vitamins.md",
    },
  ],
};