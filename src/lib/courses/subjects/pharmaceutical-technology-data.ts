// app/api/pharmaceutical-technology-data.ts

export interface PharmaechUnit {
  id: string; title: string; shortTitle: string; emoji: string;
  description: string; readTime: number; difficulty: "Easy"|"Medium"|"Hard";
  gradient: string; previewImage?: string;
  color: { badge: string; icon: string; iconText: string; heading: string; };
}

export const PHARMATECH_META = {
  title: "Pharmaceutical Technology",
  slug: "pharmaceutical-technology",
  semester: "Semester 7",
  semesterSlug: "sem-7",
  description:
    "Advanced drug delivery science — from barriers to drug delivery and conventional dosage form principles through novel targeting strategies, NDDS characterisation techniques, pharmacokinetic/pharmacological aspects, and commercial applications of advanced drug delivery systems.",
  totalUnits: 5,
  subjectCode: "PHARM-TECH-701",
};

export const PharmaTechUnits: PharmaechUnit[] = [
  {
    id: "chapter1-barriers-conventional-formulations",
    title: "Chapter 1: Barriers to Drug Delivery & Conventional Formulations",
    shortTitle: "Barriers & Conventional Formulations",
    emoji: "🚧",
    description:
      "Physiological and biochemical barriers to drug delivery (GI, blood-brain, skin, ocular, nasal), principles of conventional pharmaceutical formulations, dosage form design, biopharmaceutics classification system (BCS), and ADME considerations in formulation development.",
    readTime: 15, difficulty: "Hard",
    gradient: "from-violet-700 to-purple-500",
    previewImage: "/previews/pharmatech/ch1-barriers.jpg",
    color: { badge: "bg-violet-50 text-violet-700 border-violet-200", icon: "bg-violet-50 border-violet-100", iconText: "text-violet-600", heading: "from-violet-700 to-purple-500" },
  },
  {
    id: "chapter2-targeting-advanced-dosage-forms",
    title: "Chapter 2: Concepts of Targeting & Advanced Dosage Forms",
    shortTitle: "Targeting & Advanced Dosage Forms",
    emoji: "🎯",
    description:
      "Drug targeting concepts (passive, active, physical targeting), liposomes, nanoparticles, microspheres, niosomes, transfersomes, solid lipid nanoparticles (SLNs), dendrimers, carbon nanotubes, transdermal drug delivery, implants, and pulsatile drug delivery systems.",
    readTime: 18, difficulty: "Hard",
    gradient: "from-rose-600 to-pink-400",
    previewImage: "/previews/pharmatech/ch2-targeting.jpg",
    color: { badge: "bg-rose-50 text-rose-700 border-rose-200", icon: "bg-rose-50 border-rose-100", iconText: "text-rose-600", heading: "from-rose-600 to-pink-500" },
  },
  {
    id: "chapter3-characterization-ndds",
    title: "Chapter 3: Characterisation Techniques for Novel Drug Delivery Systems",
    shortTitle: "Characterisation of NDDS",
    emoji: "🔬",
    description:
      "Physicochemical characterisation of NDDS — particle size analysis (DLS, SEM, TEM), zeta potential, entrapment efficiency, drug release studies (dialysis, Franz diffusion cell), in vitro-in vivo correlation (IVIVC), stability testing, and in vitro cytotoxicity assays.",
    readTime: 16, difficulty: "Hard",
    gradient: "from-cyan-600 to-teal-400",
    previewImage: "/previews/pharmatech/ch3-characterisation.jpg",
    color: { badge: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: "bg-cyan-50 border-cyan-100", iconText: "text-cyan-600", heading: "from-cyan-600 to-teal-500" },
  },
  {
    id: "chapter4-pharmacokinetic-pharmacological-ndds",
    title: "Chapter 4: Pharmacokinetic & Pharmacological Aspects of NDDS",
    shortTitle: "PK/PD Aspects of NDDS",
    emoji: "📊",
    description:
      "Pharmacokinetics of novel drug delivery systems — compartmental models, non-compartmental analysis, bioavailability and bioequivalence, modified release kinetics (zero-order, first-order, Higuchi, Korsmeyer-Peppas), pharmacodynamic considerations, and toxicokinetics of nanoparticles.",
    readTime: 17, difficulty: "Hard",
    gradient: "from-amber-600 to-orange-400",
    previewImage: "/previews/pharmatech/ch4-pkpd.jpg",
    color: { badge: "bg-amber-50 text-amber-700 border-amber-200", icon: "bg-amber-50 border-amber-100", iconText: "text-amber-600", heading: "from-amber-600 to-orange-500" },
  },
  {
    id: "chapter5-commercial-benefits-ndds",
    title: "Chapter 5: Commercial Benefits & Applications of NDDS",
    shortTitle: "Commercial Benefits of NDDS",
    emoji: "💼",
    description:
      "Market landscape of novel drug delivery systems, patent strategies, life-cycle management, commercial products (Doxil, Abraxane, Neulasta, Ozempic depot), regulatory pathway for NDDS approval (FDA, EMA guidelines), cost-benefit analysis, and future trends in the NDDS market.",
    readTime: 12, difficulty: "Medium",
    gradient: "from-green-600 to-lime-400",
    previewImage: "/previews/pharmatech/ch5-commercial.jpg",
    color: { badge: "bg-green-50 text-green-700 border-green-200", icon: "bg-green-50 border-green-100", iconText: "text-green-600", heading: "from-green-600 to-lime-500" },
  },
];

export const PHARMATECH_DIFF_BADGE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};