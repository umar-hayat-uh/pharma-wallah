// src/lib/courses/subjects/pharmaceutical-organic-chemistry.ts
import type { SubjectMeta } from "../types";

export const pharmaceuticalOrganicChemistrySubject: SubjectMeta = {
    slug: "pharmaceutical-organic-chemistry",
    semesterSlug: "sem-1",
    semester: "Semester 1",
    title: "Pharmaceutical Organic Chemistry",
    subjectCode: "PHARM-OCHEM-101",
    icon: "🧪",
    description:
        "The chemical language of drug design — from atomic structure and bonding through functional groups and reaction mechanisms to stereochemistry and its critical role in pharmacological activity.",
    gradient: "from-emerald-600 to-teal-400",
    hasMcq: false,
    units: [
        {
            id: "unit1-basic-concepts",
            title: "Unit 1: Basic Concepts",
            shortTitle: "Basic Concepts",
            emoji: "⚛️",
            description:
                "Atomic orbitals, hybridisation (sp, sp², sp³), covalent bonding, resonance, inductive and mesomeric effects, electronegativity, acids and bases in organic chemistry, and IUPAC nomenclature.",
            readTime: 12,
            difficulty: "Beginner",
            gradient: "from-emerald-600 to-teal-400",
            previewImage: "/previews/orgchem/unit1-basics.jpg",
            contentFile: "pharmaceutical-organic-chemistry/unit1-basic-concepts.md",
        },
        {
            id: "unit2-functional-organic-compounds",
            title: "Unit 2: Functional Organic Compounds",
            shortTitle: "Functional Organic Compounds",
            emoji: "🧬",
            description:
                "Hydrocarbons, alkyl halides, alcohols, phenols, ethers, aldehydes, ketones, carboxylic acids, esters, amines, and amides — structures, properties, and pharmaceutical relevance.",
            readTime: 16,
            difficulty: "Intermediate",
            gradient: "from-violet-600 to-purple-400",
            previewImage: "/previews/orgchem/unit2-functional.jpg",
            contentFile: "pharmaceutical-organic-chemistry/unit2-functional-organic-compounds.md",
        },
        {
            id: "unit3-types-of-reactions",
            title: "Unit 3: Types of Reactions",
            shortTitle: "Types of Reactions",
            emoji: "⚗️",
            description:
                "Substitution (SN1, SN2), elimination (E1, E2), addition, condensation, and oxidation-reduction reactions. Reaction mechanisms, intermediates, energy diagrams, and catalysis.",
            readTime: 15,
            difficulty: "Advanced",
            gradient: "from-orange-500 to-amber-400",
            previewImage: "/previews/orgchem/unit3-reactions.jpg",
            contentFile: "pharmaceutical-organic-chemistry/unit3-types-of-reactions.md",
        },
        {
            id: "unit4-stereochemistry",
            title: "Unit 4: Stereochemistry",
            shortTitle: "Stereochemistry",
            emoji: "🔄",
            description:
                "Chirality, enantiomers, diastereomers, R/S and E/Z configuration, optical activity, racemic mixtures, meso compounds, and the pharmacological significance of stereoisomerism in drug action.",
            readTime: 14,
            difficulty: "Advanced",
            gradient: "from-rose-600 to-pink-400",
            previewImage: "/previews/orgchem/unit4-stereochemistry.jpg",
            contentFile: "pharmaceutical-organic-chemistry/unit4-stereochemistry.md",
        },
    ],
};