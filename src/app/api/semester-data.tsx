import {
    Pill,
    Atom,
    HeartPulse,
    Dna,
    Sigma,
    FlaskRound,
    Microscope,
    Beaker,
    Stethoscope,
    MicroscopeIcon,
    Activity,
    Skull,
    ShieldCheck,
    ClipboardList,
    Scale,
    Microscope as MicroIcon,
    Target,
    Brain,
    Leaf,
    Factory,
    ChartColumnIncreasing as Graph,
    BriefcaseMedical as Briefcase,
} from "lucide-react";

export const SemesterData = [
    // ---------------- SEMESTER 1 ----------------
    {
        semester: "Semester 1",
        subjects: [
            {
                name: "Fundamentals of Pharmacy",
                icon: <Pill className="text-blue-600" strokeWidth={2} />,
                description:
                    "Introduction to pharmacy, dosage forms, compounding, and core principles of pharmaceutical sciences.",
            },
            {
                name: "Pharmaceutical (Organic Chemistry)",
                icon: <Atom className="text-green-600" strokeWidth={2} />,
                description:
                    "Structure, reactions, mechanisms, stereochemistry, and organic compounds essential for drug design.",
            },
            {
                name: "Physiology & Histology-I",
                icon: <HeartPulse className="text-orange-500" strokeWidth={2} />,
                description:
                    "Study of human organ systems, tissues, and physiological functions relevant to pharmacology.",
            },
            {
                name: "Biochemistry-I",
                icon: <Dna className="text-purple-600" strokeWidth={2} />,
                description:
                    "Biomolecules, enzymes, metabolism pathways, and biochemical processes in human health.",
            },
            {
                name: "Pharmaceutical Mathematics-I",
                icon: <Sigma className="text-red-500" strokeWidth={2} />,
                description:
                    "Pharmaceutical calculations: concentrations, dilutions, alligation, kinetics, and drug dosing.",
            },
        ],
    },

    // ---------------- SEMESTER 2 ----------------
    {
        semester: "Semester 2",
        subjects: [
            {
                name: "Dosage Form-I",
                icon: <FlaskRound className="text-blue-600" strokeWidth={2} />,
                description:
                    "Fundamental dosage forms including solutions, suspensions, emulsions, and solid dosage basics.",
            },
            {
                name: "Physiology & Histology-II",
                icon: <HeartPulse className="text-orange-500" strokeWidth={2} />,
                description:
                    "Continuation of organ systems, deeper physiological mechanisms, and tissue structures.",
            },
            {
                name: "Biochemistry-II",
                icon: <Dna className="text-purple-600" strokeWidth={2} />,
                description:
                    "Advanced biochemical pathways, genetics, metabolism regulation, and disease-related biochemistry.",
            },
            {
                name: "General Pharmacognosy",
                icon: <Leaf className="text-green-600" strokeWidth={2} />,
                description:
                    "Study of medicinal plants, natural drugs, and their phytochemical and therapeutic properties.",
            },
            {
                name: "Anatomy",
                icon: <Stethoscope className="text-red-600" strokeWidth={2} />,
                description:
                    "Detailed structure of human organs, musculoskeletal system, and internal biological framework.",
            },
        ],
    },

    // ---------------- SEMESTER 3 ----------------
    {
        semester: "Semester 3",
        subjects: [
            {
                name: "Dosage Form-II",
                icon: <Beaker className="text-blue-600" strokeWidth={2} />,
                description:
                    "Advanced dosage forms including tablets, capsules, sterile products, and controlled-release systems.",
            },
            {
                name: "Microbiology-I",
                icon: <Microscope className="text-green-600" strokeWidth={2} />,
                description:
                    "Microbial classification, growth, pathogenicity, sterilization, and laboratory techniques.",
            },
            {
                name: "Physical Chemistry-I",
                icon: <Atom className="text-blue-500" strokeWidth={2} />,
                description:
                    "Thermodynamics, kinetics, solutions, phase rules, and chemical equilibria.",
            },
            {
                name: "Pathology",
                icon: <Activity className="text-red-600" strokeWidth={2} />,
                description:
                    "Study of diseases, cell injuries, inflammation, immune disorders, and pathological mechanisms.",
            },
            {
                name: "Pharmacology & Therapeutics",
                icon: <Stethoscope className="text-purple-600" strokeWidth={2} />,
                description:
                    "Mechanism of drug action, interaction, therapeutic classes, and treatment strategies.",
            },
        ],
    },

    // ---------------- SEMESTER 4 ----------------
    {
        semester: "Semester 4",
        subjects: [
            {
                name: "Microbiology-II",
                icon: <MicroscopeIcon className="text-green-600" strokeWidth={2} />,
                description:
                    "Virology, mycology, immunology, microbial assays, and applied microbiology.",
            },
            {
                name: "Physical Chemistry-II",
                icon: <Beaker className="text-blue-500" strokeWidth={2} />,
                description:
                    "Advanced chemical kinetics, catalysis, electrochemistry, polymer chemistry.",
            },
            {
                name: "Systemic Pharmacology-I",
                icon: <Brain className="text-purple-600" strokeWidth={2} />,
                description:
                    "Pharmacology of CNS, ANS, cardiovascular system, and respiratory system.",
            },
            {
                name: "Chemical Pharmacognosy-I",
                icon: <Leaf className="text-green-700" strokeWidth={2} />,
                description:
                    "Phytochemical classification, plant constituents, and extraction methods.",
            },
            {
                name: "Physical Pharmacy",
                icon: <FlaskRound className="text-indigo-600" strokeWidth={2} />,
                description:
                    "Solubility, dispersion systems, rheology, surface tension, and drug stability.",
            },
        ],
    },

    // ---------------- SEMESTER 5 ----------------
    {
        semester: "Semester 5",
        subjects: [
            {
                name: "Quality Control",
                icon: <ClipboardList className="text-blue-600" strokeWidth={2} />,
                description:
                    "Quality assurance, sampling, specifications, GLP, GMP, and QC testing of pharmaceuticals.",
            },
            {
                name: "Systemic Pharmacology-II",
                icon: <Brain className="text-purple-600" strokeWidth={2} />,
                description:
                    "Endocrine, GI, reproductive, metabolic, and immune system pharmacology.",
            },
            {
                name: "Chemical Pharmacognosy-II",
                icon: <Leaf className="text-green-600" strokeWidth={2} />,
                description:
                    "Advanced study of phytoconstituents, alkaloids, flavonoids, glycosides, and essential oils.",
            },
        ],
    },

    // ---------------- SEMESTER 6 ----------------
    {
        semester: "Semester 6",
        subjects: [
            {
                name: "Industrial Pharmacy-I",
                icon: <Factory className="text-blue-600" strokeWidth={2} />,
                description:
                    "Pharmaceutical manufacturing principles, equipment, scale-up, and unit operations.",
            },
            {
                name: "Pharmaceutical Analysis-I",
                icon: <Sigma className="text-purple-600" strokeWidth={2} />,
                description:
                    "Analytical techniques including titrimetry, spectrophotometry, chromatography.",
            },
            {
                name: "Natural Toxins",
                icon: <Skull className="text-red-600" strokeWidth={2} />,
                description:
                    "Toxic plants, venomous organisms, natural poisons, and their biochemical effects.",
            },
        ],
    },

    // ---------------- SEMESTER 7 ----------------
    {
        semester: "Semester 7",
        subjects: [
            {
                name: "Industrial Pharmacy-II",
                icon: <Factory className="text-blue-700" strokeWidth={2} />,
                description:
                    "Advanced manufacturing, process validation, packaging, and regulatory processes.",
            },
            {
                name: "Pharmacy Practice-I",
                icon: <Stethoscope className="text-green-600" strokeWidth={2} />,
                description:
                    "Community pharmacy, hospital pharmacy, patient counseling, and drug interactions.",
            },
            {
                name: "Pharmaceutical Technology",
                icon: <Target className="text-indigo-600" strokeWidth={2} />,
                description:
                    "Formulation design, novel drug delivery systems, nanotechnology, and biotech products.",
            },
            {
                name: "Advanced Pharmacognosy",
                icon: <Leaf className="text-green-700" strokeWidth={2} />,
                description:
                    "Advanced phytochemistry, herbal formulations, and research methods in natural drugs.",
            },
            {
                name: "Systemic Pharmacology-III",
                icon: <Brain className="text-purple-700" strokeWidth={2} />,
                description:
                    "Renal, hepatic, hematologic, dermatologic, and musculoskeletal pharmacology.",
            },
        ],
    },

    // ---------------- SEMESTER 8 ----------------
    {
        semester: "Semester 8",
        subjects: [
            {
                name: "Pharmacy Practice-II",
                icon: <Stethoscope className="text-green-700" strokeWidth={2} />,
                description:
                    "Clinical pharmacy, medication therapy management, ADR monitoring, pharmaco-economics.",
            },
            {
                name: "Biopharmaceutics & Pharmacokinetics",
                icon: <Graph className="text-blue-600" strokeWidth={2} />,
                description:
                    "ADME properties, bioavailability, compartment models, and drug absorption kinetics.",
            },
            {
                name: "Clinical Pharmacokinetics",
                icon: <Activity className="text-purple-600" strokeWidth={2} />,
                description:
                    "Dose adjustments, therapeutic drug monitoring, renal/hepatic clearance models.",
            },
            {
                name: "Pharmaceutical Analysis-II",
                icon: <FlaskRound className="text-indigo-600" strokeWidth={2} />,
                description:
                    "HPLC, GC, NMR, MS, IR, advanced separation and identification techniques.",
            },
            {
                name: "Medicinal Chemistry-I",
                icon: <Atom className="text-red-600" strokeWidth={2} />,
                description:
                    "Drug structure relationships, molecular modification, and lead compound optimization.",
            },
        ],
    },

    // ---------------- SEMESTER 9 ----------------
    {
        semester: "Semester 9",
        subjects: [
            {
                name: "Forensic Pharmacy",
                icon: <Scale className="text-blue-600" strokeWidth={2} />,
                description:
                    "Pharmacy laws, ethics, drug regulations, forensic toxicology, and pharmaceutical jurisprudence.",
            },
            {
                name: "Pharmacy Practice-III",
                icon: <Stethoscope className="text-green-600" strokeWidth={2} />,
                description:
                    "Clinical decision-making, therapeutic guidelines, and drug information services.",
            },
            {
                name: "Medicinal Chemistry-II",
                icon: <Atom className="text-red-600" strokeWidth={2} />,
                description:
                    "SAR analysis, receptor interactions, drug design strategies, and synthesis pathways.",
            },
            {
                name: "Clinical Pharmacology",
                icon: <HeartPulse className="text-purple-600" strokeWidth={2} />,
                description:
                    "Clinical drug effects, trials, ADRs, pharmacogenetics, and therapeutic monitoring.",
            },
            {
                name: "Clinical Pharmacognosy",
                icon: <Leaf className="text-green-700" strokeWidth={2} />,
                description:
                    "Herbal remedies in clinical practice, evidence-based natural medicines.",
            },
        ],
    },

    // ---------------- SEMESTER 10 ----------------
    {
        semester: "Semester 10",
        subjects: [
            {
                name: "Prescription & Community Pharmacy",
                icon: <ClipboardList className="text-blue-600" strokeWidth={2} />,
                description:
                    "Prescription handling, extemporaneous compounding, community pharmacy operations.",
            },
            {
                name: "Pharma Management & Marketing",
                icon: <Briefcase className="text-indigo-600" strokeWidth={2} />,
                description:
                    "Marketing strategies, pharma industry structure, management principles.",
            },
            {
                name: "Quality Control & Quality Assurance",
                icon: <ShieldCheck className="text-green-600" strokeWidth={2} />,
                description:
                    "GMP, quality audits, validation, risk management, documentation and compliance.",
            },
            {
                name: "Medicinal Chemistry-III",
                icon: <Atom className="text-red-700" strokeWidth={2} />,
                description:
                    "Advanced drug design, prodrugs, enzyme inhibitors, structure-based chemistry.",
            },
            {
                name: "Toxicology",
                icon: <Skull className="text-red-600" strokeWidth={2} />,
                description:
                    "Mechanisms of toxicity, poisons, toxic agents, organ toxicity, and antidotes.",
            },
            {
                name: "Pharmacy Practice-IV",
                icon: <Stethoscope className="text-green-700" strokeWidth={2} />,
                description:
                    "Advanced clinical services, patient assessment, therapeutic management.",
            },
        ],
    },
];