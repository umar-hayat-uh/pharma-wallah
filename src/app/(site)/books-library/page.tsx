"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Book, Search, ChevronRight, ChevronLeft, Star, Users, Library,
  X, Filter, BookOpen, GraduationCap, Tag, ExternalLink, Hash, Info,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf, Dna, Activity } from "lucide-react";

interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  course: string;
  coverColor: string;
  image?: string;
  imagePosition?: string;
  rating?: number;
  available: boolean;
  book_url: string;
  edition?: string;
  pages?: number;
  description?: string;
  chapters?: string[];
  publisher?: string;
  isbn?: string;
  tags?: string[];
}

const booksData: BookItem[] = [
  {
    id: "1",
    title: "Principles of Anatomy and Physiology",
    author: "Tortora & Derrickson",
    category: "Anatomy",
    course: "Human Anatomy & Physiology",
    coverColor: "from-blue-500 to-blue-700",
    image: "/images/books/tortora bp.jpg",
    imagePosition: "center",
    available: true,
    book_url: "#",
    edition: "16th Edition",
    pages: 1232,
    publisher: "Wiley",
    description: "The gold-standard A&P textbook with a pioneering homeostatic approach. Combines exceptional content and outstanding visuals for a rich two-semester course experience.",
    chapters: [
      "Introduction to the Human Body",
      "Chemical Level of Organization",
      "Cellular Level of Organization",
      "Tissue Level of Organization",
      "Integumentary System",
      "Skeletal System: Bone Tissue",
      "Axial & Appendicular Skeleton",
      "Joints",
      "Muscle Tissue & Muscular System",
      "Nervous Tissue",
      "Spinal Cord & Spinal Nerves",
      "Brain & Cranial Nerves",
      "Autonomic Nervous System",
      "Endocrine System",
      "Cardiovascular System",
    ],
    tags: ["Homeostasis", "A&P", "Two-semester", "Wiley"],
  },
  {
    id: "2",
    title: "Ross and Wilson Anatomy and Physiology",
    author: "Ross & Wilson",
    category: "Anatomy",
    course: "Human Anatomy & Physiology",
    coverColor: "from-blue-500 to-blue-700",
    image: "/images/books/ross and wilson bp.jpg",
    imagePosition: "top",
    available: true,
    book_url: "#",
    edition: "13th Edition",
    pages: 552,
    publisher: "Elsevier Churchill Livingstone",
    description: "A trusted, accessible introduction to anatomy and physiology widely used by nursing and allied health students worldwide. Clear writing with full-color illustrations.",
    chapters: [
      "Introduction to the Human Body",
      "The Cell",
      "Basic Tissues",
      "The Skeletal System",
      "The Muscular System",
      "The Nervous System",
      "The Special Senses",
      "The Endocrine System",
      "The Blood",
      "The Heart",
      "The Cardiovascular System",
      "The Lymphatic System",
      "Respiratory System",
      "Digestive System",
      "Urinary System",
    ],
    tags: ["Nursing", "Allied Health", "Accessible", "Full-color"],
  },
  {
    id: "3",
    title: "Guyton and Hall Textbook of Medical Physiology",
    author: "Guyton & Hall",
    category: "Physiology",
    course: "Human Anatomy & Physiology",
    coverColor: "from-blue-500 to-blue-700",
    image: "/images/books/guyton bp.jpg",
    imagePosition: "center",
    available: true,
    book_url: "#",
    edition: "14th Edition",
    pages: 1168,
    publisher: "Elsevier",
    description: "The world's most trusted medical physiology textbook. Provides a comprehensive yet concise account of the key physiology concepts essential for medical practice.",
    chapters: [
      "Functional Organization of the Human Body",
      "Transport of Substances Through Cell Membranes",
      "Action Potentials in Neurons",
      "Contraction of Skeletal Muscle",
      "Blood Flow & Cardiac Output",
      "Coronary Circulation",
      "Respiration",
      "Renal Physiology & Urine Formation",
      "Gastrointestinal Physiology",
      "Endocrinology",
      "Reproductive & Hormonal Functions",
      "Nervous System",
      "Special Senses",
    ],
    tags: ["Medical Physiology", "Clinical", "Comprehensive", "Elsevier"],
  },
  {
    id: "4",
    title: "Pharmaceutics: The Design and Manufacture of Medicines",
    author: "Aulton",
    category: "Pharmaceutics",
    course: "Pharmaceutics",
    coverColor: "from-green-500 to-green-700",
    image: "/images/books/aulton bp.jpg",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "4th Edition",
    pages: 680,
    publisher: "Elsevier Churchill Livingstone",
    description: "Comprehensive coverage of the science of dosage form design. The essential pharmaceutics text for undergraduate pharmacy students covering formulation, manufacturing and biopharmaceutics.",
    chapters: [
      "Scientific Principles of Dosage Form Design",
      "Physical Pharmacy",
      "Particle Science & Powder Technology",
      "Solutions & Solubility",
      "Emulsions, Suspensions & Colloids",
      "Rheology",
      "Drug Stability",
      "Solid Dosage Forms",
      "Modified Release Drug Delivery",
      "Parenteral Drug Delivery",
      "Pharmaceutical Packaging",
    ],
    tags: ["Dosage Forms", "Formulation", "Biopharmaceutics", "Manufacturing"],
  },
  {
    id: "5",
    title: "The Theory and Practice of Industrial Pharmacy",
    author: "Lachman, Lieberman & Kanig",
    category: "Pharmaceutics",
    course: "Pharmaceutics",
    coverColor: "from-green-500 to-green-700",
    image: "/images/books/lachman bp.jpg",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "3rd Edition",
    pages: 950,
    publisher: "Lea & Febiger",
    description: "The definitive reference in industrial pharmacy. Covers manufacturing theory, equipment, and processes for all major pharmaceutical dosage forms at an industrial scale.",
    chapters: [
      "Preformulation",
      "Tablet Manufacture",
      "Coating of Tablets",
      "Hard & Soft Gelatin Capsules",
      "Parenteral Preparations",
      "Oral Liquids",
      "Ointments, Creams & Gels",
      "Aerosols",
      "Lyophilization",
      "Quality Control",
    ],
    tags: ["Industrial", "Manufacturing", "GMP", "Scale-up"],
  },
  {
    id: "6",
    title: "Remington: The Science and Practice of Pharmacy",
    author: "Remington",
    category: "Pharmaceutics",
    course: "Pharmaceutics, Community Pharmacy",
    coverColor: "from-green-500 to-green-700",
    image: "/images/books/remington bp.jpg",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "23rd Edition",
    pages: 2752,
    publisher: "Pharmaceutical Press",
    description: "The 'Bible of Pharmacy' — a comprehensive reference covering all aspects of pharmaceutical sciences and practice. An indispensable resource for pharmacists worldwide.",
    chapters: [
      "The Profession of Pharmacy",
      "Pharmacogenomics",
      "Clinical Pharmacokinetics",
      "Drug Interaction & Adverse Effects",
      "Pharmaceutical Mathematics",
      "Pharmaceutical Compounding",
      "Solid Oral Dosage Forms",
      "Liquid Dosage Forms",
      "Sterile Products",
      "Pharmacoepidemiology",
      "Drug Information Resources",
      "Community Pharmacy Practice",
    ],
    tags: ["Reference", "Comprehensive", "Clinical", "Bible of Pharmacy"],
  },
  {
    id: "7",
    title: "Harper's Illustrated Biochemistry",
    author: "Harper et al.",
    category: "Biochemistry",
    course: "Medicinal Biochemistry",
    coverColor: "from-purple-500 to-purple-700",
    image: "https://picsum.photos/seed/7/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "31st Edition",
    pages: 848,
    publisher: "McGraw-Hill",
    description: "A classic medical biochemistry text that bridges biochemistry and clinical medicine. Known for its clinical cases and clear explanation of metabolic pathways.",
    chapters: [
      "Biochemistry & Medicine",
      "Water & pH",
      "Amino Acids & Proteins",
      "Enzymes",
      "Bioenergetics",
      "Carbohydrate Metabolism",
      "Lipid Metabolism",
      "Nucleotide Metabolism",
      "Vitamins & Coenzymes",
      "Hormones",
      "Molecular Biology",
    ],
    tags: ["Clinical Cases", "Metabolism", "Medical", "McGraw-Hill"],
  },
  {
    id: "8",
    title: "Lehninger Principles of Biochemistry",
    author: "Nelson & Cox",
    category: "Biochemistry",
    course: "Medicinal Biochemistry",
    coverColor: "from-purple-500 to-purple-700",
    image: "https://picsum.photos/seed/8/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "8th Edition",
    pages: 1200,
    publisher: "W.H. Freeman",
    description: "One of the most respected biochemistry textbooks. Renowned for its clear explanations of complex biochemical concepts, metabolic pathways, and molecular biology.",
    chapters: [
      "The Foundations of Biochemistry",
      "Water",
      "Amino Acids, Peptides & Proteins",
      "Three-Dimensional Structure of Proteins",
      "Enzymes",
      "Carbohydrates & Glycobiology",
      "Lipids",
      "Nucleotides & Nucleic Acids",
      "DNA-Based Information Technologies",
      "Biosignaling",
      "Glycolysis, Gluconeogenesis & Pentose Phosphate Pathway",
      "The Citric Acid Cycle",
      "Oxidative Phosphorylation",
    ],
    tags: ["Molecular Biology", "Metabolism", "Pathways", "Freeman"],
  },
  {
    id: "9",
    title: "Biochemistry",
    author: "Stryer et al.",
    category: "Biochemistry",
    course: "Medicinal Biochemistry",
    coverColor: "from-purple-500 to-purple-700",
    image: "https://picsum.photos/seed/9/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "9th Edition",
    pages: 1120,
    publisher: "W.H. Freeman",
    description: "Stryer's Biochemistry is celebrated for its vivid full-color art program and clear explanations of biochemical principles. A favorite for its integration of structural biology.",
    chapters: [
      "Biochemistry: An Evolving Science",
      "Protein Structure",
      "Enzyme Kinetics",
      "Carbohydrate Metabolism",
      "The Citric Acid Cycle",
      "Electron Transport & Oxidative Phosphorylation",
      "Photosynthesis",
      "Fatty Acid Metabolism",
      "Amino Acid Degradation",
      "Nucleotide Biosynthesis",
      "Hormonal Signaling",
    ],
    tags: ["Structural Biology", "Visual", "Full-color", "Freeman"],
  },
  {
    id: "10",
    title: "Organic Chemistry",
    author: "Morrison & Boyd",
    category: "Chemistry",
    course: "Pharmaceutical Organic Chemistry",
    coverColor: "from-red-500 to-red-700",
    image: "https://picsum.photos/seed/10/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "6th Edition",
    pages: 1279,
    publisher: "Prentice Hall",
    description: "The timeless classic for organic chemistry. Widely used in pharmacy programs for its thorough mechanistic approach, named reactions, and pharmaceutical relevance.",
    chapters: [
      "Structure and Properties",
      "Structural Theory of Organic Chemistry",
      "Alkanes & Cycloalkanes",
      "Stereochemistry",
      "Alkyl Halides & Nucleophilic Substitution",
      "Alcohols & Ethers",
      "Aromatic Compounds",
      "Carbonyl Chemistry",
      "Carboxylic Acids & Derivatives",
      "Amines",
      "Spectroscopy",
    ],
    tags: ["Mechanisms", "Named Reactions", "Classic", "Prentice Hall"],
  },
  {
    id: "11",
    title: "Organic Chemistry Vol I and II",
    author: "I.L. Finar",
    category: "Chemistry",
    course: "Pharmaceutical Organic Chemistry",
    coverColor: "from-red-500 to-red-700",
    image: "https://picsum.photos/seed/11/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "6th Edition",
    pages: 1100,
    publisher: "Pearson / Longman",
    description: "A comprehensive two-volume organic chemistry reference widely used across South Asian pharmacy programs. Covers both fundamental and advanced topics systematically.",
    chapters: [
      "Aliphatic Compounds",
      "Aromatic Compounds",
      "Heterocyclic Compounds (Vol II)",
      "Stereochemistry",
      "Natural Products",
      "Alkaloids",
      "Terpenes",
      "Carbohydrates",
      "Amino Acids & Proteins",
      "Dyes",
    ],
    tags: ["South Asia", "Two-volume", "Natural Products", "Heterocyclic"],
  },
  {
    id: "12",
    title: "Textbook of Pharmaceutical Chemistry",
    author: "Bentley & Driver",
    category: "Chemistry",
    course: "Pharmaceutical Organic & Inorganic Chemistry",
    coverColor: "from-red-500 to-red-700",
    image: "https://picsum.photos/seed/12/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "8th Edition",
    pages: 552,
    publisher: "Oxford University Press",
    description: "Focused pharmaceutical chemistry text bridging organic/inorganic chemistry with drug development. Covers drug design principles, SAR, and medicinal chemistry fundamentals.",
    chapters: [
      "General Principles of Drug Action",
      "Stereochemistry in Drug Design",
      "Analgesics",
      "CNS Drugs",
      "Cardiovascular Drugs",
      "Antibiotics",
      "Antineoplastic Agents",
      "Vitamins & Hormones",
    ],
    tags: ["SAR", "Drug Design", "Medicinal Chemistry", "Oxford"],
  },
  {
    id: "13",
    title: "Vogel's Textbook of Quantitative Chemical Analysis",
    author: "Vogel et al.",
    category: "Analysis",
    course: "Pharmaceutical Analysis",
    coverColor: "from-yellow-500 to-yellow-700",
    image: "https://picsum.photos/seed/13/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "5th Edition",
    pages: 877,
    publisher: "Longman Scientific",
    description: "The definitive reference for quantitative chemical analysis. Covers classical wet chemistry and modern instrumental techniques with detailed practical procedures.",
    chapters: [
      "Fundamentals of Volumetric Analysis",
      "Acid-Base Titrations",
      "Complexometric Titrations",
      "Redox Titrations",
      "Precipitation Titrations",
      "Gravimetric Analysis",
      "Electroanalytical Methods",
      "Spectrophotometry",
      "Chromatographic Methods",
    ],
    tags: ["Volumetric", "Titrimetry", "Gravimetric", "Classical Analysis"],
  },
  {
    id: "14",
    title: "Practical Pharmaceutical Chemistry",
    author: "Beckett & Stenlake",
    category: "Chemistry",
    course: "Pharmaceutical Inorganic Chemistry",
    coverColor: "from-red-500 to-red-700",
    image: "https://picsum.photos/seed/14/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "4th Edition",
    pages: 776,
    publisher: "Athlone Press",
    description: "Essential practical text for pharmaceutical chemistry. Covers quality control methods, instrumental analysis, and the physical chemistry underpinning pharmaceutical testing.",
    chapters: [
      "Volumetric Analysis",
      "Gravimetric Analysis",
      "Colorimetry & Spectrophotometry",
      "Fluorimetry",
      "Infrared Spectrophotometry",
      "NMR Spectroscopy",
      "Mass Spectrometry",
      "Chromatographic Methods",
      "Biological Assay Methods",
    ],
    tags: ["Practical", "QC", "Instrumentation", "British Pharmacopoeia"],
  },
  {
    id: "15",
    title: "Biology",
    author: "Campbell et al.",
    category: "Biology",
    course: "Remedial Biology",
    coverColor: "from-teal-500 to-teal-700",
    image: "https://picsum.photos/seed/15/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "12th Edition",
    pages: 1488,
    publisher: "Pearson",
    description: "The world's most widely used general biology textbook. Provides an authoritative foundation in biology with vivid art, relevant examples, and inquiry-based approach.",
    chapters: [
      "Introduction: Themes in the Study of Life",
      "The Chemical Context of Life",
      "Cell Structure",
      "Metabolism",
      "Cell Respiration & Photosynthesis",
      "Cell Communication",
      "Meiosis & Sexual Life Cycles",
      "Mendelian Genetics",
      "Molecular Basis of Inheritance",
      "Gene Expression",
      "Evolution & Natural Selection",
      "Ecology",
    ],
    tags: ["General Biology", "Genetics", "Evolution", "Inquiry-based"],
  },
  {
    id: "16",
    title: "Textbook of Pathology",
    author: "Harsh Mohan",
    category: "Pathology",
    course: "Pathophysiology",
    coverColor: "from-orange-500 to-orange-700",
    image: "https://picsum.photos/seed/16/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "7th Edition",
    pages: 900,
    publisher: "Jaypee Brothers",
    description: "A comprehensive pathology text highly popular across South Asian medical and pharmacy schools. Combines general and systemic pathology with excellent clinical correlation.",
    chapters: [
      "Cell Injury & Cellular Adaptations",
      "Inflammation & Repair",
      "Haemodynamic Disorders",
      "Immunopathology",
      "Neoplasia",
      "Infectious Diseases",
      "Cardiovascular System Pathology",
      "Respiratory System Pathology",
      "Gastrointestinal Pathology",
      "Hepatobiliary Pathology",
      "Kidney Pathology",
      "Endocrine Pathology",
    ],
    tags: ["South Asia", "Systemic Pathology", "Clinical Correlation", "Jaypee"],
  },
  {
    id: "17",
    title: "Robbins and Cotran Pathologic Basis of Disease",
    author: "Kumar, Abbas & Aster",
    category: "Pathology",
    course: "Pathophysiology",
    coverColor: "from-orange-500 to-orange-700",
    image: "https://picsum.photos/seed/17/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "10th Edition",
    pages: 1392,
    publisher: "Elsevier",
    description: "The definitive pathology reference — known as 'Big Robbins'. Provides an authoritative and comprehensive account of disease mechanisms from a cellular and molecular perspective.",
    chapters: [
      "Cell Injury, Death & Adaptation",
      "Inflammation & Repair",
      "Hemodynamic Disorders",
      "Diseases of the Immune System",
      "Neoplasia",
      "Genetic & Pediatric Diseases",
      "Blood Vessels",
      "Heart",
      "Lungs",
      "Liver & Biliary Tract",
      "Kidney & Lower Urinary Tract",
      "Endocrine System",
    ],
    tags: ["Molecular Pathology", "Definitive", "Elsevier", "Mechanisms"],
  },
  {
    id: "18",
    title: "Microbiology",
    author: "Prescott et al.",
    category: "Microbiology",
    course: "Pharmaceutical Microbiology",
    coverColor: "from-indigo-500 to-indigo-700",
    image: "https://picsum.photos/seed/18/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "11th Edition",
    pages: 1096,
    publisher: "McGraw-Hill",
    description: "A balanced, comprehensive introduction to microbiology. Renowned for its integration of cutting-edge research with fundamental principles relevant to pharmacy practice.",
    chapters: [
      "Introduction to Microbiology",
      "Microscopy",
      "Bacterial Cell Structure",
      "Viruses",
      "Microbial Nutrition & Growth",
      "Control of Microorganisms",
      "Microbial Genetics",
      "Antimicrobial Chemotherapy",
      "Human Diseases by Body System",
      "Immunology",
      "Industrial Microbiology",
    ],
    tags: ["Pharmaceutical", "Antimicrobials", "Immunology", "McGraw-Hill"],
  },
  {
    id: "19",
    title: "Microbiology",
    author: "Pelczar et al.",
    category: "Microbiology",
    course: "Pharmaceutical Microbiology",
    coverColor: "from-indigo-500 to-indigo-700",
    image: "https://picsum.photos/seed/19/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "5th Edition",
    pages: 918,
    publisher: "Tata McGraw-Hill",
    description: "A widely used microbiology text in South Asian pharmacy programs. Covers microbial world comprehensively with emphasis on applications in health sciences.",
    chapters: [
      "The Microbial World",
      "Characterization of Microorganisms",
      "Bacteria",
      "Fungi",
      "Viruses",
      "Protozoa & Algae",
      "Control of Microorganisms",
      "Microbial Metabolism",
      "Microbial Genetics",
      "Host-Microorganism Interactions",
      "Environmental & Applied Microbiology",
    ],
    tags: ["South Asia", "Applied", "Tata McGraw-Hill", "Health Sciences"],
  },
  {
    id: "20",
    title: "Textbook of Microbiology",
    author: "Ananthanarayan & Paniker",
    category: "Microbiology",
    course: "Pharmaceutical Microbiology",
    coverColor: "from-indigo-500 to-indigo-700",
    image: "https://picsum.photos/seed/20/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "10th Edition",
    pages: 690,
    publisher: "Universities Press",
    description: "A compact, highly popular microbiology text in South Asia, particularly suited for pharmacy and medical examinations with its concise yet thorough coverage.",
    chapters: [
      "General Microbiology",
      "Sterilization & Disinfection",
      "Bacteriology",
      "Systematic Bacteriology",
      "Mycobacteria",
      "Spirochaetes",
      "Mycology",
      "Virology",
      "Immunology",
      "Clinical Microbiology",
    ],
    tags: ["Compact", "Exam-focused", "South Asia", "Clinical"],
  },
  {
    id: "21",
    title: "Pharmacognosy",
    author: "Kokate, Purohit & Gokhale",
    category: "Pharmacognosy",
    course: "Pharmacognosy",
    coverColor: "from-pink-500 to-pink-700",
    image: "https://picsum.photos/seed/21/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "57th Edition",
    pages: 800,
    publisher: "Nirali Prakashan",
    description: "Highly popular pharmacognosy textbook in South Asian pharmacy programs covering crude drugs, their sources, constituents, and pharmaceutical applications.",
    chapters: [
      "Introduction to Pharmacognosy",
      "Classification of Drugs",
      "Cultivation & Collection of Drugs",
      "Alkaloids",
      "Glycosides",
      "Tannins & Resins",
      "Volatile Oils",
      "Lipids & Fixed Oils",
      "Carbohydrates & Gums",
      "Enzymes",
      "Biological Activity of Natural Products",
    ],
    tags: ["Natural Products", "Crude Drugs", "Alkaloids", "South Asia"],
  },
  {
    id: "22",
    title: "Pharmacognosy",
    author: "Trease & Evans",
    category: "Pharmacognosy",
    course: "Pharmacognosy",
    coverColor: "from-pink-500 to-pink-700",
    image: "https://picsum.photos/seed/22/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "16th Edition",
    pages: 616,
    publisher: "Saunders / Elsevier",
    description: "The classic Western pharmacognosy reference. Covers medicinal plants, natural products chemistry, and phytomedicines with modern phytochemical and biological evaluation.",
    chapters: [
      "History & Scope of Pharmacognosy",
      "Cultivation & Collection",
      "Phytochemistry",
      "Carbohydrates",
      "Lipids",
      "Terpenes & Volatile Oils",
      "Alkaloids",
      "Phenolic Compounds",
      "Herbal Medicine",
      "Biotechnology in Pharmacognosy",
    ],
    tags: ["Western", "Phytochemistry", "Herbal Medicine", "Elsevier"],
  },
  {
    id: "23",
    title: "Essentials of Medical Pharmacology",
    author: "K.D. Tripathi",
    category: "Pharmacology",
    course: "Pharmacology I & II",
    coverColor: "from-blue-600 to-blue-800",
    image: "https://picsum.photos/seed/23/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "8th Edition",
    pages: 1000,
    publisher: "Jaypee Brothers",
    description: "The most popular pharmacology textbook in South Asia. Known for its comprehensive coverage, clinical relevance, and clear explanations of drug mechanisms.",
    chapters: [
      "General Pharmacology",
      "Autonomic Nervous System Drugs",
      "CNS Pharmacology",
      "Cardiovascular Drugs",
      "Diuretics",
      "Hormones & Related Drugs",
      "Antimicrobial Drugs",
      "Antineoplastic Drugs",
      "Immunosuppressants",
      "Drug Interactions",
      "Drug Toxicity & Adverse Effects",
    ],
    tags: ["South Asia", "Clinical", "Mechanisms", "Jaypee"],
  },
  {
    id: "24",
    title: "Rang and Dale's Pharmacology",
    author: "Ritter, Flower, Henderson et al.",
    category: "Pharmacology",
    course: "Pharmacology I & II",
    coverColor: "from-blue-600 to-blue-800",
    image: "https://picsum.photos/seed/24/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "9th Edition",
    pages: 808,
    publisher: "Elsevier",
    description: "The leading Western pharmacology text known for its molecular approach. Bridges basic science and clinical application with an emphasis on receptor pharmacology.",
    chapters: [
      "How Drugs Act: General Principles",
      "How Drugs Act: Molecular Aspects",
      "The Autonomic Nervous System",
      "Chemical Transmission",
      "Local Hormones & Inflammation",
      "The Central Nervous System",
      "The Cardiovascular System",
      "Inflammation & Immunopharmacology",
      "Chemotherapy",
      "Endocrine Pharmacology",
    ],
    tags: ["Molecular", "Receptor Pharmacology", "Western", "Elsevier"],
  },
  {
    id: "25",
    title: "The Pharmacological Basis of Therapeutics",
    author: "Goodman & Gilman",
    category: "Pharmacology",
    course: "Pharmacology I & II",
    coverColor: "from-blue-600 to-blue-800",
    image: "https://picsum.photos/seed/25/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "13th Edition",
    pages: 1440,
    publisher: "McGraw-Hill",
    description: "The authoritative pharmacology reference known as 'Goodman & Gilman'. An indispensable resource for clinical pharmacology with comprehensive drug monographs.",
    chapters: [
      "General Principles of Pharmacology",
      "Drug Receptors & Pharmacodynamics",
      "Pharmacokinetics",
      "Drugs Acting on the Nervous System",
      "Cardiovascular Drugs",
      "Endocrine Pharmacology",
      "Gastrointestinal Drugs",
      "Antimicrobial Agents",
      "Antineoplastic Agents",
      "Drugs in Special Populations",
    ],
    tags: ["Reference", "Clinical", "Drug Monographs", "McGraw-Hill"],
  },
  {
    id: "26",
    title: "Instrumental Methods of Chemical Analysis",
    author: "Chatwal & Anand",
    category: "Analysis",
    course: "Pharmaceutical Analysis",
    coverColor: "from-yellow-500 to-yellow-700",
    image: "https://picsum.photos/seed/26/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "5th Edition",
    pages: 1008,
    publisher: "Himalaya Publishing House",
    description: "Widely used in South Asian analytical chemistry courses. Provides comprehensive coverage of all instrumental analytical techniques with theory and applications.",
    chapters: [
      "Absorption Spectroscopy (UV-Vis)",
      "Infrared Spectroscopy",
      "NMR Spectroscopy",
      "Mass Spectrometry",
      "Flame Photometry & AAS",
      "Fluorescence Spectroscopy",
      "Gas Chromatography",
      "HPLC",
      "TLC & Paper Chromatography",
      "Electrophoresis",
      "Potentiometry & Polarography",
    ],
    tags: ["Instrumental", "Spectroscopy", "Chromatography", "South Asia"],
  },
  {
    id: "27",
    title: "Pharmacotherapy: A Pathophysiologic Approach",
    author: "DiPiro et al.",
    category: "Therapeutics",
    course: "Pharmacotherapeutics I & II",
    coverColor: "from-purple-600 to-purple-800",
    image: "https://picsum.photos/seed/27/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "12th Edition",
    pages: 2640,
    publisher: "McGraw-Hill",
    description: "The leading pharmacotherapy textbook linking pharmacological principles to disease management. Essential for clinical pharmacy students learning evidence-based therapeutic decision-making.",
    chapters: [
      "Cardiovascular Disorders",
      "Respiratory Disorders",
      "Gastrointestinal Disorders",
      "Renal Disorders",
      "Neurological Disorders",
      "Psychiatric Disorders",
      "Endocrine Disorders",
      "Gynecologic & Obstetric Disorders",
      "Infectious Diseases",
      "Oncology",
      "Nutritional Disorders",
    ],
    tags: ["Clinical", "Evidence-based", "Disease Management", "McGraw-Hill"],
  },
  {
    id: "28",
    title: "Applied Therapeutics",
    author: "Koda-Kimble et al.",
    category: "Therapeutics",
    course: "Pharmacotherapeutics I & II",
    coverColor: "from-purple-600 to-purple-800",
    image: "https://picsum.photos/seed/28/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "10th Edition",
    pages: 2544,
    publisher: "Lippincott Williams & Wilkins",
    description: "A case-based pharmacotherapy reference widely used in clinical pharmacy education. Emphasizes clinical reasoning through patient cases and therapeutic problem-solving.",
    chapters: [
      "General Principles",
      "Cardiac & Vascular Disorders",
      "Pulmonary Disorders",
      "Neurological Disorders",
      "Infectious Disease Therapy",
      "Neoplastic Disorders",
      "Solid Organ Transplantation",
      "Renal Disorders",
      "Gastrointestinal Disorders",
      "Psychiatric Disorders",
    ],
    tags: ["Case-based", "Clinical Reasoning", "LWW", "Problem-solving"],
  },
  {
    id: "29",
    title: "Clinical Pharmacy Practice",
    author: "Parthasarathi et al.",
    category: "Clinical",
    course: "Clinical Pharmacy",
    coverColor: "from-cyan-500 to-cyan-700",
    image: "https://picsum.photos/seed/29/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "2nd Edition",
    pages: 620,
    publisher: "Elsevier India",
    description: "A practical clinical pharmacy text geared for South Asian pharmacy practice. Covers patient care, medication management, and the expanding role of the clinical pharmacist.",
    chapters: [
      "Introduction to Clinical Pharmacy",
      "Patient Assessment",
      "Drug Information Services",
      "Pharmacokinetic Dosing",
      "Adverse Drug Reactions",
      "Drug Interactions",
      "Drug Therapy Monitoring",
      "Clinical Pharmacy in Specialties",
      "Pharmaceutical Care",
    ],
    tags: ["Clinical Practice", "Patient Care", "South Asia", "Elsevier India"],
  },
  {
    id: "30",
    title: "Biostatistics: A Foundation for Analysis in the Health Sciences",
    author: "Daniel",
    category: "Biostatistics",
    course: "Biostatistics",
    coverColor: "from-lime-500 to-lime-700",
    image: "https://picsum.photos/seed/30/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "10th Edition",
    pages: 864,
    publisher: "Wiley",
    description: "A comprehensive yet accessible introduction to biostatistics for health sciences students. Features real-world health data examples and thorough coverage of statistical methodology.",
    chapters: [
      "Introduction to Biostatistics",
      "Descriptive Statistics",
      "Probability",
      "Discrete Probability Distributions",
      "Normal Distribution",
      "Estimation",
      "Hypothesis Testing",
      "Analysis of Variance",
      "Simple & Multiple Regression",
      "Survival Analysis",
    ],
    tags: ["Statistics", "Health Sciences", "Wiley", "Research"],
  },
  {
    id: "31",
    title: "Research Methodology",
    author: "Kothari",
    category: "Research",
    course: "Research Methodology",
    coverColor: "from-emerald-500 to-emerald-700",
    image: "https://picsum.photos/seed/31/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "2nd Edition",
    pages: 418,
    publisher: "New Age International",
    description: "A practical and widely used research methodology text in South Asian universities. Covers both quantitative and qualitative research design, data collection, and analysis.",
    chapters: [
      "Introduction to Research",
      "Defining the Research Problem",
      "Research Design",
      "Sampling Design",
      "Measurement & Scaling",
      "Data Collection",
      "Data Processing & Analysis",
      "Hypothesis Testing",
      "Report Writing",
    ],
    tags: ["Research Design", "South Asia", "Quantitative", "Qualitative"],
  },
  {
    id: "32",
    title: "Pharmacokinetics",
    author: "Gibaldi & Perrier",
    category: "Pharmacokinetics",
    course: "Biopharmaceutics & Pharmacokinetics",
    coverColor: "from-amber-500 to-amber-700",
    image: "https://picsum.photos/seed/32/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "2nd Edition",
    pages: 494,
    publisher: "Marcel Dekker",
    description: "A seminal pharmacokinetics reference providing rigorous mathematical and physiological treatment of drug disposition. Essential reading for understanding PK modeling.",
    chapters: [
      "Intravenous Bolus Administration",
      "Drug Absorption",
      "Drug Distribution",
      "Drug Elimination",
      "Multiple Dosing",
      "Nonlinear Pharmacokinetics",
      "Pharmacokinetic-Pharmacodynamic Relationships",
      "Population Pharmacokinetics",
    ],
    tags: ["PK Modeling", "Mathematical", "Drug Disposition", "Marcel Dekker"],
  },
  {
    id: "33",
    title: "Applied Biopharmaceutics and Pharmacokinetics",
    author: "Shargel & Yu",
    category: "Pharmacokinetics",
    course: "Biopharmaceutics & Pharmacokinetics",
    coverColor: "from-amber-500 to-amber-700",
    image: "https://picsum.photos/seed/33/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "7th Edition",
    pages: 896,
    publisher: "McGraw-Hill",
    description: "The standard biopharmaceutics and pharmacokinetics textbook. Bridges drug absorption science with clinical dosing decisions using practical, applied examples.",
    chapters: [
      "Introduction to Biopharmaceutics & PK",
      "Mathematical Fundamentals in PK",
      "One-Compartment Open Model",
      "Multi-Compartment Models",
      "Oral Drug Absorption",
      "Drug Distribution & Protein Binding",
      "Drug Elimination",
      "Bioavailability & Bioequivalence",
      "Modified-Release Products",
      "Clinical Pharmacokinetics",
    ],
    tags: ["Bioavailability", "Dosing", "Clinical PK", "McGraw-Hill"],
  },
  {
    id: "34",
    title: "Design and Analysis of Clinical Trials",
    author: "Chow & Liu",
    category: "Clinical Research",
    course: "Clinical Research",
    coverColor: "from-rose-500 to-rose-700",
    image: "https://picsum.photos/seed/34/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "3rd Edition",
    pages: 744,
    publisher: "Wiley",
    description: "A comprehensive reference on clinical trial design and statistical analysis. Covers regulatory requirements, bioequivalence testing, and adaptive trial designs.",
    chapters: [
      "Introduction to Clinical Trials",
      "Protocol Development",
      "Randomization & Blinding",
      "Sample Size Determination",
      "Efficacy & Safety Analysis",
      "Bioequivalence Studies",
      "Adaptive Designs",
      "Statistical Methods",
      "Regulatory Considerations",
    ],
    tags: ["Clinical Trials", "Regulatory", "Bioequivalence", "Wiley"],
  },
  {
    id: "35",
    title: "Fundamentals of Clinical Trials",
    author: "Friedman et al.",
    category: "Clinical Research",
    course: "Clinical Research",
    coverColor: "from-rose-500 to-rose-700",
    image: "https://picsum.photos/seed/35/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "5th Edition",
    pages: 446,
    publisher: "Springer",
    description: "An accessible yet rigorous introduction to clinical trial design, conduct, and analysis. Widely used in clinical research training programs worldwide.",
    chapters: [
      "Introduction to Clinical Trials",
      "What is the Question?",
      "Study Population",
      "Baseline Assessment",
      "Intervention",
      "Randomization",
      "Blinding",
      "Data Collection",
      "Analysis & Monitoring",
      "Reporting",
    ],
    tags: ["Trial Design", "Accessible", "Springer", "Training"],
  },
  {
    id: "36",
    title: "Pharmacoepidemiology",
    author: "Strom et al.",
    category: "Epidemiology",
    course: "Pharmacoepidemiology",
    coverColor: "from-fuchsia-500 to-fuchsia-700",
    image: "https://picsum.photos/seed/36/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "5th Edition",
    pages: 672,
    publisher: "Wiley-Blackwell",
    description: "The leading pharmacoepidemiology textbook covering post-marketing drug surveillance, adverse effect monitoring, and the epidemiology of drug use in populations.",
    chapters: [
      "Introduction to Pharmacoepidemiology",
      "Study Designs",
      "Spontaneous Reporting Systems",
      "Record Linkage Databases",
      "Case-Control Studies",
      "Cohort Studies",
      "Confounding & Bias",
      "Drug Utilization Research",
      "Pharmacovigilance",
    ],
    tags: ["Post-marketing", "Pharmacovigilance", "Epidemiology", "Wiley"],
  },
  {
    id: "37",
    title: "Essentials of Pharmacoeconomics",
    author: "Rascati",
    category: "Pharmacoeconomics",
    course: "Pharmacoeconomics",
    coverColor: "from-violet-500 to-violet-700",
    image: "https://picsum.photos/seed/37/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "3rd Edition",
    pages: 320,
    publisher: "Lippincott Williams & Wilkins",
    description: "A concise, practical introduction to pharmacoeconomics. Covers cost analysis methods, quality of life measurement, and health outcomes research with pharmacy applications.",
    chapters: [
      "Introduction to Pharmacoeconomics",
      "Cost Identification",
      "Cost-Minimization Analysis",
      "Cost-Effectiveness Analysis",
      "Cost-Utility Analysis",
      "Cost-Benefit Analysis",
      "Measuring Health Outcomes",
      "Decision Analysis",
      "Applying Pharmacoeconomics",
    ],
    tags: ["Health Economics", "QALY", "Cost Analysis", "LWW"],
  },
  {
    id: "38",
    title: "Goldfrank's Toxicologic Emergencies",
    author: "Goldfrank et al.",
    category: "Toxicology",
    course: "Clinical Toxicology",
    coverColor: "from-stone-500 to-stone-700",
    image: "https://picsum.photos/seed/38/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "11th Edition",
    pages: 2000,
    publisher: "McGraw-Hill",
    description: "The definitive emergency toxicology reference. Covers poisoning, antidotes, and management of toxic exposures across virtually every substance category.",
    chapters: [
      "Principles of Medical Toxicology",
      "Pharmaceutical Additives",
      "Antidotes",
      "Analgesics & NSAIDs",
      "CNS Drugs",
      "Cardiovascular Drugs",
      "Pesticides",
      "Heavy Metals",
      "Caustics & Acids",
      "Envenomation",
      "Occupational & Environmental Toxicology",
    ],
    tags: ["Emergency", "Antidotes", "Poisoning", "Comprehensive"],
  },
  {
    id: "39",
    title: "Ellenhorn's Medical Toxicology",
    author: "Ellenhorn et al.",
    category: "Toxicology",
    course: "Clinical Toxicology",
    coverColor: "from-stone-500 to-stone-700",
    image: "https://picsum.photos/seed/39/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
    edition: "2nd Edition",
    pages: 2047,
    publisher: "Williams & Wilkins",
    description: "A comprehensive medical toxicology reference covering diagnosis and treatment of poisoning from drugs, chemicals, plants, and environmental agents.",
    chapters: [
      "General Approach to the Poisoned Patient",
      "Drug Overdose",
      "Cardiovascular Drugs",
      "Analgesics",
      "Psychiatric Drugs",
      "Drugs of Abuse",
      "Industrial & Environmental Toxins",
      "Plants & Mushrooms",
      "Animal Toxins & Venoms",
      "Radiation Toxicology",
    ],
    tags: ["Diagnosis", "Treatment", "Poisoning", "Environmental"],
  },
];

const allCategories = ["All", ...Array.from(new Set(booksData.map((b) => b.category)))];
const ITEMS_PER_PAGE = 12;

const bgIcons = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 30 },
  { Icon: Beaker, top: "38%", left: "1%", size: 28 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 30 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 28 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 28 },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const getInitials = (title: string) =>
  title.split(" ").filter((w) => w.length > 2).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// ─── Book Detail Modal ─────────────────────────────────────────────────────────
function BookModal({ book, onClose }: { book: BookItem; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{ maxHeight: "90vh" }}
        >
          {/* Top gradient strip */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${book.coverColor}`} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={15} />
          </button>

          <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>
            {/* Header */}
            <div className="flex gap-5 p-6 pb-4">
              {/* Cover thumbnail */}
              <div className="flex-shrink-0 w-24 h-32 rounded-xl overflow-hidden shadow-md border border-gray-100">
                {book.image ? (
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    style={{ objectPosition: book.imagePosition || "center" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${book.coverColor} flex items-center justify-center`}>
                    <span className="text-2xl font-extrabold text-white/90">{getInitials(book.title)}</span>
                  </div>
                )}
              </div>

              {/* Title block */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Tag size={9} /> {book.category}
                </div>
                <h2 className="text-lg font-extrabold text-gray-900 leading-tight mb-1">{book.title}</h2>
                <p className="text-sm text-gray-500 mb-2">by <span className="font-semibold text-gray-700">{book.author}</span></p>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {book.edition && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                      {book.edition}
                    </span>
                  )}
                  {book.publisher && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                      {book.publisher}
                    </span>
                  )}
                  {book.pages && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                      <Hash size={9} /> {book.pages.toLocaleString()} pages
                    </span>
                  )}
                  {book.rating && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-yellow-50 border border-yellow-100 text-yellow-700">
                      <Star size={9} className="fill-yellow-500 text-yellow-500" /> {book.rating}
                    </span>
                  )}
                  {!book.available && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-50 border border-red-100 text-red-600">
                      Unavailable
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-5">
              {/* Course */}
              <div className="flex items-start gap-2">
                <GraduationCap size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Used In</p>
                  <p className="text-sm text-gray-700 font-medium">{book.course}</p>
                </div>
              </div>

              {/* Description */}
              {book.description && (
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">About This Book</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{book.description}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {book.tags.map(tag => (
                      <span key={tag}
                        className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 text-blue-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapters */}
              {book.chapters && book.chapters.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen size={14} className="text-blue-500" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Key Chapters ({book.chapters.length})
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 overflow-hidden">
                    {book.chapters.map((ch, i) => (
                      <div key={i}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50/70"}`}>
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-green-400 text-white text-[9px] font-extrabold flex items-center justify-center flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-gray-700 text-xs leading-snug">{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                {book.book_url !== "#" ? (
                  <a href={book.book_url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 hover:shadow-xl transition-all">
                    <ExternalLink size={15} /> Download Book
                  </a>
                ) : (
                  <button disabled
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-100 text-gray-400 font-extrabold text-sm cursor-not-allowed">
                    <ExternalLink size={15} /> Download Unavailable
                  </button>
                )}
                <button onClick={onClose}
                  className="px-5 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function BookLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return booksData.filter((b) => {
      const matchSearch = b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      const matchCat = selectedCategory === "All" || b.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  React.useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedCategory]);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)
  );

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* Modal */}
      {selectedBook && <BookModal book={selectedBook} onClose={() => setSelectedBook(null)} />}

      {/* Hero */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-20 bottom-4 opacity-15"><Dna size={60} className="text-white" /></div>
        <div className="absolute right-44 top-6 opacity-15"><Activity size={40} className="text-white" /></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Library className="w-3.5 h-3.5" /> Books Library
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Pharmacy
            <span className="block text-green-200 mt-1">Book Library</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Curated collection of pharmacy textbooks, references, and study guides for every semester of Pharm-D.
          </p>
          <div className="relative max-w-lg mx-auto">
            <div className="absolute -inset-0.5 rounded-2xl bg-white/20 blur-sm" />
            <div className="relative flex items-center bg-white rounded-2xl border border-white/30 shadow-sm overflow-hidden">
              <Search className="absolute left-4 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-12 py-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex items-center justify-center gap-8 mt-7 flex-wrap">
            {[{ n: `${booksData.length}`, l: "Titles" }, { n: `${allCategories.length - 1}`, l: "Categories" }, { n: "Pharm-D", l: "Curriculum" }].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-extrabold text-white">{n}</div>
                <div className="text-sm text-blue-200">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            {allCategories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-green-400 text-white border-transparent shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                }`}>
                {cat}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 shrink-0 font-medium">
            {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Grid */}
        {paginatedBooks.length > 0 ? (
          <motion.div variants={stagger} initial="hidden" animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedBooks.map((book) => (
              <motion.div key={book.id} variants={fadeUp}>
                {/* Card is now a button that opens modal */}
                <button onClick={() => setSelectedBook(book)} className="block w-full text-left">
                  <div className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="absolute top-0 left-0 right-0 h-[3px] z-10 bg-gradient-to-r from-blue-600 to-green-400" />
                    <div className="h-36 relative overflow-hidden bg-gray-100">
                      {book.image ? (
                        <img src={book.image} alt={`Cover of ${book.title}`}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: book.imagePosition || "center" }}
                          onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${book.coverColor} flex items-center justify-center`}>
                          <span className="text-4xl font-extrabold text-white/90 tracking-tighter drop-shadow-lg">
                            {getInitials(book.title)}
                          </span>
                        </div>
                      )}
                      {!book.available && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-red-500/90 text-white rounded-full z-10">Unavailable</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-extrabold text-gray-900 line-clamp-2 mb-1 leading-snug group-hover:text-blue-700 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3">by {book.author}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700">{book.category}</span>
                        {book.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-gray-600">{book.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
              <Book className="w-6 h-6 text-blue-300" />
            </div>
            <p className="text-gray-500 font-medium">No books found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or category filter</p>
            <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition">
              Reset filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-10 gap-4 flex-col sm:flex-row">
            <p className="text-sm text-gray-400">
              Showing <span className="font-bold text-gray-600">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredBooks.length)}</span>
              {" "}of <span className="font-bold text-gray-600">{filteredBooks.length}</span> books
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {pageNums.map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="text-gray-400 text-sm">…</span>}
                  <button onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                      currentPage === p
                        ? "bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md shadow-blue-200/50 border-0"
                        : "border-2 border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"
                    }`}>
                    {p}
                  </button>
                </React.Fragment>
              ))}
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden p-10 text-center">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
          <div className="absolute inset-0 bg-blue-50/20 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200/50">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Can't find a specific book?</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Request a new title or suggest a resource for our library.</p>
            <Link href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
              <Users className="w-4 h-4" /> Request a Book
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}