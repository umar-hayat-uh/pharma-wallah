// app/api/systemic-pharmacology-3-data.ts

export interface SysPharm3Unit {
  id: string; title: string; shortTitle: string; emoji: string;
  description: string; readTime: number; difficulty: "Easy"|"Medium"|"Hard";
  gradient: string; previewImage?: string;
  color: { badge: string; icon: string; iconText: string; heading: string; };
}

export const SYS_PHARM3_META = {
  title: "Systemic Pharmacology III",
  slug: "systemic-pharmacology-3",
  semester: "Semester 7",
  semesterSlug: "sem-7",
  description: "Pharmacology of drugs acting on the central nervous system, endocrine system, ophthalmic preparations, oxytocic agents, and reproductive pharmacology — mechanisms, clinical uses, and adverse effects.",
  totalUnits: 5,
  subjectCode: "PHARM-SP3-701",
};

export const SysPharm3Units: SysPharm3Unit[] = [
  {
    id: "unit1-cns-drugs",
    title: "Unit 1: Drugs Acting on the CNS",
    shortTitle: "CNS Drugs",
    emoji: "🧠",
    description: "Sedatives, hypnotics, anxiolytics, antiepileptics, antipsychotics, antidepressants, opioid analgesics, CNS stimulants, general anaesthetics, and drugs for Parkinson's and Alzheimer's disease.",
    readTime: 18, difficulty: "Hard",
    gradient: "from-indigo-600 to-blue-400",
    previewImage: "/previews/syspharm3/unit1-cns.jpg",
    color: { badge: "bg-indigo-50 text-indigo-700 border-indigo-200", icon: "bg-indigo-50 border-indigo-100", iconText: "text-indigo-600", heading: "from-indigo-600 to-blue-500" },
  },
  {
    id: "unit2-endocrine-drugs",
    title: "Unit 2: Endocrine Drugs",
    shortTitle: "Endocrine Drugs",
    emoji: "🔩",
    description: "Insulin and oral hypoglycaemics, thyroid and antithyroid drugs, adrenocorticosteroids, pituitary hormones, parathyroid and calcitonin, anabolic steroids, and sex hormones and their antagonists.",
    readTime: 16, difficulty: "Hard",
    gradient: "from-emerald-600 to-teal-400",
    previewImage: "/previews/syspharm3/unit2-endocrine.jpg",
    color: { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "bg-emerald-50 border-emerald-100", iconText: "text-emerald-600", heading: "from-emerald-600 to-teal-500" },
  },
  {
    id: "unit3-ophthalmic-drugs",
    title: "Unit 3: Ophthalmic Drugs",
    shortTitle: "Ophthalmic Drugs",
    emoji: "👁️",
    description: "Miotics, mydriatics and cycloplegics, anti-glaucoma agents, ocular anti-infectives, anti-inflammatory eye drops, lubricants, ocular drug delivery systems, and pharmacokinetics of topical ophthalmic formulations.",
    readTime: 12, difficulty: "Medium",
    gradient: "from-sky-600 to-cyan-400",
    previewImage: "/previews/syspharm3/unit3-ophthalmic.jpg",
    color: { badge: "bg-sky-50 text-sky-700 border-sky-200", icon: "bg-sky-50 border-sky-100", iconText: "text-sky-600", heading: "from-sky-600 to-cyan-500" },
  },
  {
    id: "unit4-oxytocic-drugs",
    title: "Unit 4: Oxytocic Drugs",
    shortTitle: "Oxytocic Drugs",
    emoji: "💉",
    description: "Oxytocin, ergometrine, prostaglandins (PGE₂, PGF₂α), tocolytics (ritodrine, salbutamol), mechanism of uterine stimulation, clinical uses in obstetrics, dosing protocols, and adverse effects.",
    readTime: 11, difficulty: "Medium",
    gradient: "from-pink-600 to-rose-400",
    previewImage: "/previews/syspharm3/unit4-oxytocic.jpg",
    color: { badge: "bg-pink-50 text-pink-700 border-pink-200", icon: "bg-pink-50 border-pink-100", iconText: "text-pink-600", heading: "from-pink-600 to-rose-500" },
  },
  {
    id: "unit5-reproductive-drugs",
    title: "Unit 5: Reproductive Drugs",
    shortTitle: "Reproductive Drugs",
    emoji: "🧬",
    description: "Oral contraceptives (combined, progestogen-only, emergency), drugs for erectile dysfunction, drugs for infertility (clomiphene, gonadotrophins), androgens and anti-androgens, and hormone replacement therapy.",
    readTime: 14, difficulty: "Hard",
    gradient: "from-fuchsia-600 to-pink-400",
    previewImage: "/previews/syspharm3/unit5-reproductive.jpg",
    color: { badge: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200", icon: "bg-fuchsia-50 border-fuchsia-100", iconText: "text-fuchsia-600", heading: "from-fuchsia-600 to-pink-500" },
  },
];

export const SYS_PHARM3_DIFF_BADGE: Record<string, string> = {
  Easy: "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-red-50 text-red-700 border-red-200",
};