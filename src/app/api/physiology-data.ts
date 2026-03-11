// app/api/physiology-data.ts
// Centralised metadata for all Physiology & Histology-I units.
// Both the listing page and dynamic unit page import from here.

export interface PhysUnit {
    id: string;           // URL slug — matches the .md filename
    title: string;
    shortTitle: string;
    emoji: string;
    description: string;
    readTime: number;
    difficulty: "Easy" | "Medium" | "Hard";
    gradient: string;
    previewImage?: string; // optional: path inside /public, e.g. "/previews/physio/unit1.jpg"
    color: {
        badge: string;
        icon: string;
        iconText: string;
        heading: string;
    };
}

export const PHYSIO_META = {
    title: "Physiology & Histology-I",
    slug: "physiology-histology-1",
    semester: "Semester 1",
    semesterSlug: "sem-1",
    description:
        "Study of human organ systems, tissues, and physiological functions — from cellular mechanisms and muscle physiology to cardiac function, blood, digestion, and temperature regulation.",
    totalUnits: 6,
    subjectCode: "PHARM-PHYS-101",
};

export const PhysUnits: PhysUnit[] = [
    {
        id: "unit1-basic-cell-functions",
        title: "Unit 1: Basic Cell Functions",
        shortTitle: "Basic Cell Functions",
        emoji: "🔬",
        description:
            "Cell structure, organelle functions, membrane transport, osmosis, cell signalling, and homeostatic mechanisms at the cellular level.",
        readTime: 12,
        difficulty: "Easy",
        gradient: "from-blue-600 to-cyan-400",
        previewImage: "/previews/physio/unit1-cell.jpg",
        color: {
            badge: "bg-blue-50 text-blue-700 border-blue-200",
            icon: "bg-blue-50 border-blue-100",
            iconText: "text-blue-600",
            heading: "from-blue-600 to-cyan-500",
        },
    },
    {
        id: "unit2-muscle-physiology",
        title: "Unit 2: Muscle Physiology",
        shortTitle: "Muscle Physiology",
        emoji: "💪",
        description:
            "Skeletal, smooth, and cardiac muscle structure. Neuromuscular junction, sliding filament theory, excitation-contraction coupling, and fatigue.",
        readTime: 14,
        difficulty: "Medium",
        gradient: "from-orange-500 to-red-400",
        previewImage: "/previews/physio/unit2-muscle.jpg",
        color: {
            badge: "bg-orange-50 text-orange-700 border-orange-200",
            icon: "bg-orange-50 border-orange-100",
            iconText: "text-orange-600",
            heading: "from-orange-500 to-red-400",
        },
    },
    {
        id: "unit3-circulation",
        title: "Unit 3: Circulation",
        shortTitle: "Circulation",
        emoji: "🩸",
        description:
            "Systemic and pulmonary circulation, blood vessels, hemodynamics, regulation of arterial pressure, capillary exchange, lymphatic system, and fetal circulation.",
        readTime: 15,
        difficulty: "Hard",
        gradient: "from-red-500 to-blue-400",
        previewImage: "/previews/physio/unit3-circulation.jpg",
        color: {
            badge: "bg-red-50 text-red-700 border-red-200",
            icon: "bg-red-50 border-red-100",
            iconText: "text-red-600",
            heading: "from-red-500 to-blue-400",
        },
    },
    {
        id: "unit4-the-heart",
        title: "Unit 4: The Heart",
        shortTitle: "The Heart",
        emoji: "❤️",
        description:
            "Cardiac cycle, action potentials, ECG interpretation, coronary circulation, heart sounds, Frank-Starling law, and cardiac output regulation.",
        readTime: 16,
        difficulty: "Hard",
        gradient: "from-rose-600 to-pink-400",
        previewImage: "/previews/physio/unit4-heart.jpg",
        color: {
            badge: "bg-rose-50 text-rose-700 border-rose-200",
            icon: "bg-rose-50 border-rose-100",
            iconText: "text-rose-600",
            heading: "from-rose-600 to-pink-500",
        },
    },
    {
        id: "unit5-blood-cells",
        title: "Unit 5: The Blood Cells",
        shortTitle: "The Blood Cells",
        emoji: "🩸",
        description:
            "Erythrocytes, leukocytes, platelets, haematopoiesis, haemoglobin structure, blood groups, coagulation cascade, and anaemias.",
        readTime: 13,
        difficulty: "Medium",
        gradient: "from-red-600 to-rose-400",
        previewImage: "/previews/physio/unit5-blood.jpg",
        color: {
            badge: "bg-red-50 text-red-700 border-red-200",
            icon: "bg-red-50 border-red-100",
            iconText: "text-red-600",
            heading: "from-red-600 to-rose-500",
        },
    },
    {
        id: "unit6-digestion-absorption",
        title: "Unit 6: Digestion and Absorption of Food",
        shortTitle: "Digestion & Absorption",
        emoji: "🍽️",
        description:
            "GI tract anatomy, digestive enzymes, gastric secretion, bile, intestinal absorption of nutrients, and motility regulation.",
        readTime: 15,
        difficulty: "Medium",
        gradient: "from-green-600 to-emerald-400",
        previewImage: "/previews/physio/unit6-digestion.jpg",
        color: {
            badge: "bg-green-50 text-green-700 border-green-200",
            icon: "bg-green-50 border-green-100",
            iconText: "text-green-600",
            heading: "from-green-600 to-emerald-500",
        },
    },
    {
        id: "unit7-temperature-regulation",
        title: "Unit 7: Temperature Regulation",
        shortTitle: "Temperature Regulation",
        emoji: "🌡️",
        description:
            "Thermogenesis, heat loss mechanisms, hypothalamic thermostat, fever pathophysiology, hypothermia, and clinical relevance of thermoregulation.",
        readTime: 11,
        difficulty: "Easy",
        gradient: "from-amber-500 to-yellow-400",
        previewImage: "/previews/physio/unit7-temp.jpg",
        color: {
            badge: "bg-amber-50 text-amber-700 border-amber-200",
            icon: "bg-amber-50 border-amber-100",
            iconText: "text-amber-600",
            heading: "from-amber-500 to-yellow-500",
        },
    },
];

export const PHYS_DIFF_BADGE: Record<string, string> = {
    Easy: "bg-green-50 text-green-700 border-green-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Hard: "bg-red-50 text-red-700 border-red-200",
};