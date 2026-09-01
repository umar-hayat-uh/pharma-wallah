// src/lib/courses/subjects/physical-pharmacy.ts
import type { SubjectMeta } from "../types";

export const physicalPharmacySubject: SubjectMeta = {
    slug: "physical-pharmacy",
    semesterSlug: "sem-1",
    semester: "Semester 1",
    title: "Physical Pharmacy",
    subjectCode: "PHARM-PHYS-101",
    icon: "🧪",
    description:
        "The science of physical and chemical properties of drugs — from foundational pharmacy history and literature, through states of matter and thermodynamics, to particle science and micromeritics.",
    gradient: "from-indigo-600 to-blue-400",
    hasMcq: false,
    units: [
        {
            id: "unit1-intro-pharmacy-history",
            title: "Unit 1: Introduction to Pharmacy and History",
            shortTitle: "Intro to Pharmacy & History",
            emoji: "🏛️",
            description:
                "Origins of pharmacy practice, evolution of the pharmacist role, landmark milestones in pharmaceutical science, and the regulatory framework shaping modern pharmacy.",
            readTime: 10,
            difficulty: "Beginner",
            gradient: "from-indigo-600 to-blue-400",
            previewImage: "/previews/physpharm/unit1-history.jpg",
            contentFile: "physical-pharmacy/unit1-intro-pharmacy-history.md",
        },
        {
            id: "unit2-pharmaceutical-literature",
            title: "Unit 2: Introduction to Pharmaceutical Literature",
            shortTitle: "Pharmaceutical Literature",
            emoji: "📚",
            description:
                "Pharmacopoeias, formularies, drug information databases, primary and secondary literature sources, and how to critically evaluate pharmaceutical references.",
            readTime: 11,
            difficulty: "Beginner",
            gradient: "from-violet-600 to-indigo-400",
            previewImage: "/previews/physpharm/unit2-literature.jpg",
            contentFile: "physical-pharmacy/unit2-pharmaceutical-literature.md",
        },
        {
            id: "unit3-introductory-concepts",
            title: "Unit 3: Introductory Concepts in Physical Pharmacy",
            shortTitle: "Introductory Concepts",
            emoji: "⚗️",
            description:
                "States of matter, intermolecular forces, thermodynamic principles, phase diagrams, solubility, colligative properties, and their pharmaceutical significance.",
            readTime: 15,
            difficulty: "Intermediate",
            gradient: "from-purple-600 to-violet-400",
            previewImage: "/previews/physpharm/unit3-concepts.jpg",
            contentFile: "physical-pharmacy/unit3-introductory-concepts.md",
        },
        {
            id: "unit4-physico-chemical-principles",
            title: "Unit 4: Physico‑Chemical Principles",
            shortTitle: "Physico‑Chemical Principles",
            emoji: "🧪",
            description:
                "Solubility, partition coefficient, surface tension, viscosity, rheology, and their influence on drug formulation and delivery.",
            readTime: 13,
            difficulty: "Intermediate",
            gradient: "from-cyan-600 to-blue-400",
            previewImage: "/previews/physpharm/unit4-physico.jpg",
            contentFile: "physical-pharmacy/unit4-physico-chemical-principles.md",
        },
        {
            id: "unit5-ionization-buffers",
            title: "Unit 5: Ionization and Buffers",
            shortTitle: "Ionization & Buffers",
            emoji: "⚖️",
            description:
                "pH, pKa, Henderson‑Hasselbalch equation, buffer capacity, and the impact of ionization on drug absorption and stability.",
            readTime: 12,
            difficulty: "Intermediate",
            gradient: "from-amber-600 to-orange-400",
            previewImage: "/previews/physpharm/unit5-ionization.jpg",
            contentFile: "physical-pharmacy/unit5-ionization-buffers.md",
        },
        {
            id: "unit6-micromeritics",
            title: "Unit 6: Micromeritics",
            shortTitle: "Micromeritics",
            emoji: "🔬",
            description:
                "Particle size analysis methods, size distribution, specific surface area, porosity, flow properties, packing, and their impact on drug absorption and formulation.",
            readTime: 14,
            difficulty: "Advanced",
            gradient: "from-fuchsia-600 to-purple-400",
            previewImage: "/previews/physpharm/unit6-micromeritics.jpg",
            contentFile: "physical-pharmacy/unit6-micromeritics.md",
        },
    ],
};