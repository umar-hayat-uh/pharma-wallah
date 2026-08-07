// app/api/hospital-pharmacy-data.ts

export interface HospPharmUnit {
  id: string; title: string; shortTitle: string; emoji: string;
  description: string; readTime: number; difficulty: "Easy"|"Medium"|"Hard";
  gradient: string; previewImage?: string;
  color: { badge: string; icon: string; iconText: string; heading: string; };
}

export const HOSP_PHARM_META = {
  title: "Hospital Pharmacy",
  slug: "hospital-pharmacy",
  semester: "Semester 7",
  semesterSlug: "sem-7",
  description: "Organisation and management of hospital pharmacy services — from hospital structure and formulary systems through inpatient and outpatient dispensing, off-hours operations, to purchasing and supply chain management.",
  totalUnits: 7,
  subjectCode: "PHARM-HOSP-701",
};

export const HospPharmUnits: HospPharmUnit[] = [
  {
    id: "chapter1-hospital-organisation",
    title: "Chapter 1: Hospital & Its Organisation",
    shortTitle: "Hospital & Its Organisation",
    emoji: "🏥",
    description: "Definition and classification of hospitals, organisational structure, hospital committees, medical records department, central sterile supply department (CSSD), and the role of pharmacy within the hospital hierarchy.",
    readTime: 10, difficulty: "Easy",
    gradient: "from-blue-600 to-sky-400",
    previewImage: "/previews/hosppharm/ch1-organisation.jpg",
    color: { badge: "bg-blue-50 text-blue-700 border-blue-200", icon: "bg-blue-50 border-blue-100", iconText: "text-blue-600", heading: "from-blue-600 to-sky-500" },
  },
  {
    id: "chapter2-role-of-pharmacy-in-hospitals",
    title: "Chapter 2: Role of Pharmacy in Hospitals",
    shortTitle: "Role of Pharmacy in Hospitals",
    emoji: "💊",
    description: "Functions of hospital pharmacy, clinical pharmacy services, drug information centre, pharmacovigilance, medication error prevention, patient counselling, and pharmacy and therapeutics committee.",
    readTime: 11, difficulty: "Easy",
    gradient: "from-green-600 to-emerald-400",
    previewImage: "/previews/hosppharm/ch2-role.jpg",
    color: { badge: "bg-green-50 text-green-700 border-green-200", icon: "bg-green-50 border-green-100", iconText: "text-green-600", heading: "from-green-600 to-emerald-500" },
  },
  {
    id: "chapter3-dispensing-inpatients",
    title: "Chapter 3: Dispensing to Inpatients",
    shortTitle: "Dispensing to Inpatients",
    emoji: "🛏️",
    description: "Ward stock system, individual prescription system, unit dose dispensing (UDD), satellite pharmacies, medication administration records (MAR), IV admixture services, and total parenteral nutrition (TPN) preparation.",
    readTime: 14, difficulty: "Medium",
    gradient: "from-violet-600 to-indigo-400",
    previewImage: "/previews/hosppharm/ch3-inpatients.jpg",
    color: { badge: "bg-violet-50 text-violet-700 border-violet-200", icon: "bg-violet-50 border-violet-100", iconText: "text-violet-600", heading: "from-violet-600 to-indigo-500" },
  },
  {
    id: "chapter4-dispensing-ambulatory-patients",
    title: "Chapter 4: Dispensing to Ambulatory Patients",
    shortTitle: "Dispensing to Ambulatory Patients",
    emoji: "🚶",
    description: "Outpatient dispensing workflow, prescription interpretation and validation, patient counselling for ambulatory care, refill management, polypharmacy review, discharge counselling, and medication therapy management.",
    readTime: 13, difficulty: "Medium",
    gradient: "from-amber-600 to-orange-400",
    previewImage: "/previews/hosppharm/ch4-ambulatory.jpg",
    color: { badge: "bg-amber-50 text-amber-700 border-amber-200", icon: "bg-amber-50 border-amber-100", iconText: "text-amber-600", heading: "from-amber-600 to-orange-500" },
  },
  {
    id: "chapter5-formulary-controlled-substances",
    title: "Chapter 5: Formulary System & Controlled Substances",
    shortTitle: "Formulary & Controlled Substances",
    emoji: "📋",
    description: "Hospital formulary development, drug use evaluation (DUE), addition and deletion of formulary drugs, management of controlled substances, narcotic registers, storage requirements, and legal compliance.",
    readTime: 13, difficulty: "Medium",
    gradient: "from-rose-600 to-pink-400",
    previewImage: "/previews/hosppharm/ch5-formulary.jpg",
    color: { badge: "bg-rose-50 text-rose-700 border-rose-200", icon: "bg-rose-50 border-rose-100", iconText: "text-rose-600", heading: "from-rose-600 to-pink-500" },
  },
  {
    id: "chapter6-off-hours-off-site-pharmacies",
    title: "Chapter 6: Dispensing During Off-Hours & Off-Site Pharmacies",
    shortTitle: "Off-Hours & Off-Site Dispensing",
    emoji: "🌙",
    description: "Night dispensing protocols, emergency drug supply, on-call pharmacist responsibilities, telepharmacy and off-site pharmacy services, remote dispensing units, and regulatory framework for after-hours operations.",
    readTime: 11, difficulty: "Medium",
    gradient: "from-slate-600 to-gray-500",
    previewImage: "/previews/hosppharm/ch6-offhours.jpg",
    color: { badge: "bg-slate-50 text-slate-700 border-slate-200", icon: "bg-slate-50 border-slate-100", iconText: "text-slate-600", heading: "from-slate-600 to-gray-500" },
  },
  {
    id: "chapter7-purchasing-distribution-control",
    title: "Chapter 7: Purchasing, Distribution & Control",
    shortTitle: "Purchasing, Distribution & Control",
    emoji: "📦",
    description: "Drug procurement methods (tender, direct purchase), inventory management (ABC, VEN analysis), storage conditions, cold chain management, expiry date control, drug distribution systems, and audit procedures.",
    readTime: 14, difficulty: "Hard",
    gradient: "from-teal-600 to-cyan-400",
    previewImage: "/previews/hosppharm/ch7-purchasing.jpg",
    color: { badge: "bg-teal-50 text-teal-700 border-teal-200", icon: "bg-teal-50 border-teal-100", iconText: "text-teal-600", heading: "from-teal-600 to-cyan-500" },
  },
];

export const HOSP_PHARM_DIFF_BADGE: Record<string, string> = {
  Easy: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-red-50 text-red-700 border-red-200",
};