// app/api/advanced-pharmacognosy-data.ts

export interface AdvPharmacogUnit {
  id: string; title: string; shortTitle: string; emoji: string;
  description: string; readTime: number; difficulty: "Easy"|"Medium"|"Hard";
  gradient: string; previewImage?: string;
  color: { badge: string; icon: string; iconText: string; heading: string; };
}

export const ADV_PHARMACOG_META = {
  title: "Advanced Pharmacognosy",
  slug: "advanced-pharmacognosy",
  semester: "Semester 7",
  semesterSlug: "sem-7",
  description: "Advanced study of biologically active natural products — from allergens and enzymes through anticancer and immunomodulatory agents to hormones, nutraceuticals, and cosmeceuticals.",
  totalUnits: 5,
  subjectCode: "PHARM-APOG-701",
};

export const AdvPharmacogUnits: AdvPharmacogUnit[] = [
  {
    id: "chapter1-allergens-allergenic-preparations",
    title: "Chapter 1: Allergens & Allergenic Preparations",
    shortTitle: "Allergens & Allergenic Preparations",
    emoji: "🌿",
    description: "Definition and classification of allergens, standardisation of allergenic extracts, routes of administration, immunotherapy (desensitisation), and pharmacopoeial requirements for allergenic preparations.",
    readTime: 11, difficulty: "Medium",
    gradient: "from-lime-600 to-green-400",
    previewImage: "/previews/advpharmacog/ch1-allergens.jpg",
    color: { badge: "bg-lime-50 text-lime-700 border-lime-200", icon: "bg-lime-50 border-lime-100", iconText: "text-lime-600", heading: "from-lime-600 to-green-500" },
  },
  {
    id: "chapter2-enzymes-pharmacognosy",
    title: "Chapter 2: Enzymes in Pharmacognosy",
    shortTitle: "Enzymes in Pharmacognosy",
    emoji: "⚗️",
    description: "Enzyme sources from plants and microorganisms, extraction and purification, pharmaceutical enzymes (papain, bromelain, streptokinase, hyaluronidase, lysozyme), enzyme immobilisation, and therapeutic applications.",
    readTime: 13, difficulty: "Medium",
    gradient: "from-cyan-600 to-teal-400",
    previewImage: "/previews/advpharmacog/ch2-enzymes.jpg",
    color: { badge: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: "bg-cyan-50 border-cyan-100", iconText: "text-cyan-600", heading: "from-cyan-600 to-teal-500" },
  },
  {
    id: "chapter3-anticancer-anti-aids-immunomodulators",
    title: "Chapter 3: Anticancer, Anti-AIDS & Immunomodulators",
    shortTitle: "Anticancer, Anti-AIDS & Immunomodulators",
    emoji: "🧬",
    description: "Plant-derived anticancer agents (taxol, vincristine, camptothecin), anti-HIV natural products, immunomodulatory herbs (ashwagandha, tinospora, echinacea), mechanism of action, and clinical significance.",
    readTime: 16, difficulty: "Hard",
    gradient: "from-rose-600 to-orange-400",
    previewImage: "/previews/advpharmacog/ch3-anticancer.jpg",
    color: { badge: "bg-rose-50 text-rose-700 border-rose-200", icon: "bg-rose-50 border-rose-100", iconText: "text-rose-600", heading: "from-rose-600 to-orange-500" },
  },
  {
    id: "chapter4-hormones-pharmacognosy",
    title: "Chapter 4: Hormones in Pharmacognosy",
    shortTitle: "Hormones in Pharmacognosy",
    emoji: "🔬",
    description: "Hormones of plant and animal origin, steroid hormones from diosgenin, insulin from animal pancreas, thyroid preparations, phytohormones, biosynthesis, isolation, and pharmaceutical uses.",
    readTime: 14, difficulty: "Hard",
    gradient: "from-violet-600 to-purple-400",
    previewImage: "/previews/advpharmacog/ch4-hormones.jpg",
    color: { badge: "bg-violet-50 text-violet-700 border-violet-200", icon: "bg-violet-50 border-violet-100", iconText: "text-violet-600", heading: "from-violet-600 to-purple-500" },
  },
  {
    id: "chapter5-nutraceuticals-cosmeceuticals",
    title: "Chapter 5: Nutraceuticals & Cosmeceuticals",
    shortTitle: "Nutraceuticals & Cosmeceuticals",
    emoji: "✨",
    description: "Definition, classification and regulatory status of nutraceuticals and cosmeceuticals, dietary supplements, functional foods, herbal cosmetics, antioxidants, omega-3 fatty acids, probiotics, and safety evaluation.",
    readTime: 12, difficulty: "Easy",
    gradient: "from-amber-500 to-yellow-400",
    previewImage: "/previews/advpharmacog/ch5-nutraceuticals.jpg",
    color: { badge: "bg-amber-50 text-amber-700 border-amber-200", icon: "bg-amber-50 border-amber-100", iconText: "text-amber-600", heading: "from-amber-500 to-yellow-500" },
  },
];

export const ADV_PHARMACOG_DIFF_BADGE: Record<string, string> = {
  Easy: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-red-50 text-red-700 border-red-200",
};