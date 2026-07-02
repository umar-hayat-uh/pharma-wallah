"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Zap,
    BookOpen,
    ShieldAlert,
    Star,
    RefreshCw,
    Lightbulb,
    Pill,
    FlaskConical,
    Microscope,
    Stethoscope,
    ChevronRight,
    Award,
    ArrowRight,
    Lock,
    Trophy,
    Clock,
    Sparkles,
    Flame,
    Bug,
    Activity,
    Skull,
    Droplets,
    Droplet,
    Baby,
    Wind,
    Home,
    TrendingUp,
} from "lucide-react";

// ─── Patient Avatar SVG ─────────────────────────
const PatientAvatar = ({
    skin = "#F5CBA7",
    hair = "#4A235A",
    shirt = "#2980B9",
    size = 80,
    isInfant = false,
}: {
    skin?: string;
    hair?: string;
    shirt?: string;
    size?: number;
    isInfant?: boolean;
}) => (
    <svg width={size} height={size} viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        <ellipse cx="50" cy="95" rx={isInfant ? 22 : 28} ry={isInfant ? 18 : 22} fill={shirt} />
        <rect x="44" y="64" width="12" height="14" rx="4" fill={skin} />
        <circle cx="50" cy="52" r={isInfant ? 25 : 22} fill={skin} />
        {!isInfant && <ellipse cx="50" cy="33" rx="22" ry="12" fill={hair} />}
        {!isInfant && <ellipse cx="30" cy="46" rx="6" ry="14" fill={hair} />}
        {!isInfant && <ellipse cx="70" cy="46" rx="6" ry="14" fill={hair} />}
        <circle cx="42" cy="50" r="3" fill="#2c3e50" />
        <circle cx="58" cy="50" r="3" fill="#2c3e50" />
        <circle cx="43" cy="49" r="1" fill="white" />
        <circle cx="59" cy="49" r="1" fill="white" />
        <path d="M 43 58 Q 50 64 57 58" stroke="#c0392b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 40 78 L 50 88 L 60 78" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
);

// ─── Gram-stain style germ glyph ─────────────────────────
const GermGlyph = ({
    gram,
    morphology,
    size = 30,
}: {
    gram: "positive" | "negative";
    morphology: "coccus" | "rod" | "diplococcus";
    size?: number;
}) => {
    const fill = gram === "positive" ? "#7c3aed" : "#fecdd3";
    const stroke = gram === "positive" ? "#5b21b6" : "#e11d48";
    if (morphology === "rod") {
        return (
            <svg width={size} height={size} viewBox="0 0 40 40">
                <rect x="7" y="14" width="26" height="12" rx="6" fill={fill} stroke={stroke} strokeWidth="2" />
            </svg>
        );
    }
    if (morphology === "diplococcus") {
        return (
            <svg width={size} height={size} viewBox="0 0 40 40">
                <circle cx="15" cy="20" r="9" fill={fill} stroke={stroke} strokeWidth="2" />
                <circle cx="27" cy="20" r="9" fill={fill} stroke={stroke} strokeWidth="2" />
            </svg>
        );
    }
    return (
        <svg width={size} height={size} viewBox="0 0 40 40">
            <circle cx="14" cy="14" r="7" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <circle cx="26" cy="14" r="7" fill={fill} stroke={stroke} strokeWidth="1.5" />
            <circle cx="20" cy="26" r="7" fill={fill} stroke={stroke} strokeWidth="1.5" />
        </svg>
    );
};

// ─── TYPES ─────────────────────────
type Pathogen = { id: string; name: string; gram: "positive" | "negative"; morphology: "coccus" | "rod" | "diplococcus"; };
type PatientProfile = { name: string; age: string; allergies: string[]; comorbidities: string; avatar: { skin: string; hair: string; shirt: string; }; isInfant?: boolean; };
type AntibiogramResult = "S" | "I" | "R";
type Difficulty = "Easy" | "Medium" | "Hard" | "Boss";
type AntibiogramCase = {
    id: number;
    title: string;
    difficulty: Difficulty;
    xp: number;
    timeLimit: number;
    icon: any;
    vignette: string;
    patient: PatientProfile;
    pathogens: Pathogen[];
    antibiogram: Record<string, Record<string, AntibiogramResult>>;
    antibiotics: string[];
    correct: string;
    contraindicated: string[];
    rationale: string;
    references: string;
};

// ─── CASE LIBRARY (informed by CLSI M100 breakpoint categories & IDSA/CDC guidance) ─────────────────────────
const CASES: AntibiogramCase[] = [
    {
        id: 1,
        title: "Community-Acquired Pneumonia",
        difficulty: "Easy",
        xp: 40,
        timeLimit: 55,
        icon: Wind,
        vignette: "Presents to the ED with 3 days of fever, productive cough, and pleuritic chest pain. Chest X-ray shows a right lower lobe infiltrate.",
        patient: {
            name: "David Miller", age: "65 yrs", allergies: ["Penicillin (rash)"], comorbidities: "Type 2 diabetes, eGFR > 60 mL/min",
            avatar: { skin: "#F5CBA7", hair: "#4A235A", shirt: "#2980B9" },
        },
        pathogens: [
            { id: "spneumo", name: "S. pneumoniae", gram: "positive", morphology: "diplococcus" },
            { id: "hflu", name: "H. influenzae", gram: "negative", morphology: "rod" },
        ],
        antibiogram: {
            amoxicillin: { spneumo: "R", hflu: "R" }, ceftriaxone: { spneumo: "S", hflu: "S" },
            doxycycline: { spneumo: "S", hflu: "I" }, moxifloxacin: { spneumo: "S", hflu: "S" }, meropenem: { spneumo: "S", hflu: "S" },
        },
        antibiotics: ["amoxicillin", "ceftriaxone", "doxycycline", "moxifloxacin", "meropenem"],
        correct: "ceftriaxone", contraindicated: ["amoxicillin"],
        rationale: "Ceftriaxone is first-line empiric therapy for CAP in a non-ICU patient with comorbidities, covering both S. pneumoniae and H. influenzae. Amoxicillin is contraindicated given the penicillin allergy, and meropenem is unnecessarily broad when a narrower agent is fully susceptible.",
        references: "IDSA/ATS CAP Guidelines 2019; CLSI M100 Ed.34.",
    },
    {
        id: 2,
        title: "Uncomplicated Cystitis",
        difficulty: "Easy",
        xp: 40,
        timeLimit: 50,
        icon: Droplet,
        vignette: "Otherwise healthy woman reports dysuria, urgency, and frequency for 2 days. No fever, no flank pain.",
        patient: {
            name: "Maria Alvarez", age: "28 yrs", allergies: [], comorbidities: "None; normal renal function",
            avatar: { skin: "#E8B589", hair: "#1C1C1C", shirt: "#C0392B" },
        },
        pathogens: [{ id: "ecoli", name: "E. coli", gram: "negative", morphology: "rod" }],
        antibiogram: {
            nitrofurantoin: { ecoli: "S" }, tmp_smx: { ecoli: "I" }, ciprofloxacin: { ecoli: "R" }, amoxicillin: { ecoli: "R" },
        },
        antibiotics: ["nitrofurantoin", "tmp_smx", "ciprofloxacin", "amoxicillin"],
        correct: "nitrofurantoin", contraindicated: ["ciprofloxacin", "amoxicillin"],
        rationale: "Nitrofurantoin is preferred first-line therapy for uncomplicated cystitis given its susceptibility and narrow impact on normal flora. Fluoroquinolones like ciprofloxacin should be reserved for complicated infections, and amoxicillin has poor reliability against E. coli in most regions.",
        references: "IDSA/ESCMID Uncomplicated UTI Guidelines (2019 update); CLSI M100 Ed.34.",
    },
    {
        id: 3,
        title: "Neonatal Early-Onset Sepsis",
        difficulty: "Easy",
        xp: 45,
        timeLimit: 55,
        icon: Baby,
        vignette: "Term newborn, day of life 2, with grunting, tachypnea, and lethargy. Blood cultures grow gram-positive cocci in chains.",
        patient: {
            name: "Baby Sofia Reyes", age: "2 days", allergies: [], comorbidities: "Term infant, confirmed GBS bacteremia, normal renal function for age",
            avatar: { skin: "#F5CBA7", hair: "#3B2412", shirt: "#F1C40F" }, isInfant: true,
        },
        pathogens: [{ id: "gbs", name: "S. agalactiae (GBS)", gram: "positive", morphology: "coccus" }],
        antibiogram: {
            penicillin: { gbs: "S" }, ampicillin: { gbs: "S" }, ceftriaxone: { gbs: "S" }, vancomycin: { gbs: "S" },
        },
        antibiotics: ["penicillin", "ampicillin", "ceftriaxone", "vancomycin"],
        correct: "penicillin", contraindicated: ["ceftriaxone"],
        rationale: "Once GBS is confirmed and the infant is stable, penicillin is the narrowest-spectrum agent and preferred definitive therapy. Ceftriaxone is generally avoided in neonates due to the risk of biliary sludging and bilirubin displacement, especially with calcium-containing IV fluids.",
        references: "AAP Red Book; CLSI M100 Ed.34.",
    },
    {
        id: 4,
        title: "MRSA Skin & Soft Tissue Infection",
        difficulty: "Medium",
        xp: 60,
        timeLimit: 50,
        icon: Bug,
        vignette: "Presents with a tender, fluctuant, erythematous abscess on the forearm with purulent drainage. Afebrile and hemodynamically stable.",
        patient: {
            name: "Jasmine Booker", age: "34 yrs", allergies: [], comorbidities: "History of IV drug use, otherwise healthy",
            avatar: { skin: "#8D5524", hair: "#0B0B0B", shirt: "#16A085" },
        },
        pathogens: [{ id: "mrsa", name: "MRSA", gram: "positive", morphology: "coccus" }],
        antibiogram: {
            cephalexin: { mrsa: "R" }, tmp_smx: { mrsa: "S" }, doxycycline: { mrsa: "S" }, clindamycin: { mrsa: "I" }, vancomycin: { mrsa: "S" },
        },
        antibiotics: ["cephalexin", "tmp_smx", "doxycycline", "clindamycin", "vancomycin"],
        correct: "tmp_smx", contraindicated: ["cephalexin"],
        rationale: "Cephalexin lacks MRSA activity. For outpatient purulent MRSA skin infection, oral TMP-SMX is a guideline-preferred option. Clindamycin carries a risk of inducible resistance without D-zone testing, and IV vancomycin should be reserved for patients who cannot tolerate oral therapy or have systemic infection.",
        references: "IDSA MRSA Guidelines 2011; CLSI M100 Ed.34.",
    },
    {
        id: 5,
        title: "Gonococcal Urethritis",
        difficulty: "Medium",
        xp: 60,
        timeLimit: 50,
        icon: ShieldAlert,
        vignette: "Sexually active patient with dysuria and purulent urethral discharge. Gram stain shows gram-negative intracellular diplococci.",
        patient: {
            name: "Alex Torres", age: "24 yrs", allergies: [], comorbidities: "None",
            avatar: { skin: "#E0AC69", hair: "#2C1B0F", shirt: "#8E44AD" },
        },
        pathogens: [{ id: "ngon", name: "N. gonorrhoeae", gram: "negative", morphology: "diplococcus" }],
        antibiogram: {
            ceftriaxone: { ngon: "S" }, ciprofloxacin: { ngon: "R" }, azithromycin: { ngon: "I" }, doxycycline: { ngon: "I" },
        },
        antibiotics: ["ceftriaxone", "ciprofloxacin", "azithromycin", "doxycycline"],
        correct: "ceftriaxone", contraindicated: ["ciprofloxacin"],
        rationale: "Current guidelines recommend ceftriaxone monotherapy at an increased dose for uncomplicated gonococcal infection, given widespread fluoroquinolone resistance and rising azithromycin resistance. Doxycycline targets concurrent chlamydia, not gonorrhea itself.",
        references: "CDC STI Treatment Guidelines 2021; CLSI M100 Ed.34.",
    },
    {
        id: 6,
        title: "ESBL Pyelonephritis",
        difficulty: "Hard",
        xp: 80,
        timeLimit: 45,
        icon: Flame,
        vignette: "Presents with fever, flank pain, and costovertebral angle tenderness. Urine culture grows >100,000 CFU/mL of a multidrug-resistant organism.",
        patient: {
            name: "Robert Chen", age: "54 yrs", allergies: ["Sulfa drugs (Stevens-Johnson history)"], comorbidities: "Hypertension, eGFR 75 mL/min",
            avatar: { skin: "#F0C9A0", hair: "#151515", shirt: "#34495E" },
        },
        pathogens: [{ id: "ecoli_esbl", name: "E. coli (ESBL+)", gram: "negative", morphology: "rod" }],
        antibiogram: {
            ceftriaxone: { ecoli_esbl: "R" }, ciprofloxacin: { ecoli_esbl: "R" }, tmp_smx: { ecoli_esbl: "S" },
            ertapenem: { ecoli_esbl: "S" }, meropenem: { ecoli_esbl: "S" },
        },
        antibiotics: ["ceftriaxone", "ciprofloxacin", "tmp_smx", "ertapenem", "meropenem"],
        correct: "ertapenem", contraindicated: ["ceftriaxone", "ciprofloxacin", "tmp_smx"],
        rationale: "This ESBL-producing E. coli resists ceftriaxone and fluoroquinolones. Although TMP-SMX shows susceptibility, the patient's severe sulfa allergy rules it out. Ertapenem — narrower-spectrum than meropenem — is preferred for ESBL infections, sparing broader carbapenems for cases needing Pseudomonas coverage.",
        references: "IDSA 2023 Guidance on ESBL Infections; CLSI M100 Ed.34.",
    },
    {
        id: 7,
        title: "Ventilator-Associated Pneumonia",
        difficulty: "Hard",
        xp: 80,
        timeLimit: 45,
        icon: Activity,
        vignette: "Mechanically ventilated in the ICU for 6 days, now with new fever, purulent secretions, and a worsening infiltrate on chest imaging.",
        patient: {
            name: "George Whitfield", age: "71 yrs", allergies: [], comorbidities: "ICU day 6, mechanically ventilated, eGFR 55 mL/min",
            avatar: { skin: "#E8B589", hair: "#B0B0B0", shirt: "#7F8C8D" },
        },
        pathogens: [{ id: "psae", name: "P. aeruginosa", gram: "negative", morphology: "rod" }],
        antibiogram: {
            piperacillin_tazobactam: { psae: "S" }, cefepime: { psae: "S" }, meropenem: { psae: "S" }, ciprofloxacin: { psae: "R" }, aztreonam: { psae: "I" },
        },
        antibiotics: ["piperacillin_tazobactam", "cefepime", "meropenem", "ciprofloxacin", "aztreonam"],
        correct: "cefepime", contraindicated: ["ciprofloxacin"],
        rationale: "Piperacillin-tazobactam, cefepime, and meropenem are all susceptible. Choosing cefepime provides effective antipseudomonal coverage while preserving carbapenems for truly multidrug-resistant organisms — a core antimicrobial stewardship principle.",
        references: "IDSA/ATS HAP/VAP Guidelines 2016; CLSI M100 Ed.34.",
    },
    {
        id: 8,
        title: "VRE Bacteremia",
        difficulty: "Hard",
        xp: 80,
        timeLimit: 45,
        icon: Droplets,
        vignette: "Neutropenic oncology patient with a central line develops fever and rigors. Blood cultures grow gram-positive cocci in pairs and chains.",
        patient: {
            name: "Harold Nguyen", age: "62 yrs", allergies: [], comorbidities: "Central venous catheter, hematologic malignancy, eGFR 68 mL/min",
            avatar: { skin: "#E0AC69", hair: "#3E3E3E", shirt: "#2980B9" },
        },
        pathogens: [{ id: "vre", name: "E. faecium (VRE)", gram: "positive", morphology: "coccus" }],
        antibiogram: {
            vancomycin: { vre: "R" }, ampicillin: { vre: "R" }, linezolid: { vre: "S" }, daptomycin: { vre: "S" }, tmp_smx: { vre: "I" },
        },
        antibiotics: ["vancomycin", "ampicillin", "linezolid", "daptomycin", "tmp_smx"],
        correct: "daptomycin", contraindicated: ["vancomycin", "ampicillin"],
        rationale: "Vancomycin-resistant E. faecium requires alternative therapy. For bloodstream infection, daptomycin is generally preferred over linezolid, since linezolid is bacteriostatic and associated with more treatment failures in bacteremia.",
        references: "IDSA Enterococcal Bacteremia Guidance; CLSI M100 Ed.34.",
    },
    {
        id: 9,
        title: "CRE Bloodstream Infection",
        difficulty: "Boss",
        xp: 120,
        timeLimit: 40,
        icon: Skull,
        vignette: "Transferred from a hospital abroad in septic shock. Blood cultures grow a gram-negative rod resistant to nearly the entire standard panel.",
        patient: {
            name: "Diane Okafor", age: "58 yrs", allergies: [], comorbidities: "Recent hospitalization abroad, septic shock, eGFR 50 mL/min",
            avatar: { skin: "#8D5524", hair: "#1A1A1A", shirt: "#C0392B" },
        },
        pathogens: [{ id: "kpneu_cre", name: "K. pneumoniae (CRE)", gram: "negative", morphology: "rod" }],
        antibiogram: {
            meropenem: { kpneu_cre: "R" }, ceftriaxone: { kpneu_cre: "R" }, ciprofloxacin: { kpneu_cre: "R" },
            ceftazidime_avibactam: { kpneu_cre: "S" }, colistin: { kpneu_cre: "I" },
        },
        antibiotics: ["meropenem", "ceftriaxone", "ciprofloxacin", "ceftazidime_avibactam", "colistin"],
        correct: "ceftazidime_avibactam", contraindicated: ["meropenem", "ceftriaxone", "ciprofloxacin"],
        rationale: "This carbapenem-resistant Enterobacterales (CRE) isolate resists standard beta-lactams and fluoroquinolones. Newer beta-lactam/beta-lactamase-inhibitor combinations like ceftazidime-avibactam are now preferred over colistin, which carries significant nephrotoxicity and less reliable efficacy.",
        references: "IDSA 2023 Guidance on CRE Infections; CLSI M100 Ed.34.",
    },
];

const antibioticNames: Record<string, string> = {
    amoxicillin: "Amoxicillin", ceftriaxone: "Ceftriaxone", doxycycline: "Doxycycline", moxifloxacin: "Moxifloxacin", meropenem: "Meropenem",
    nitrofurantoin: "Nitrofurantoin", tmp_smx: "TMP-SMX", ciprofloxacin: "Ciprofloxacin", ertapenem: "Ertapenem", cephalexin: "Cephalexin",
    clindamycin: "Clindamycin", vancomycin: "Vancomycin", piperacillin_tazobactam: "Pip-Tazo", cefepime: "Cefepime", aztreonam: "Aztreonam",
    ceftazidime_avibactam: "Ceftaz-Avi", colistin: "Colistin", ampicillin: "Ampicillin", linezolid: "Linezolid", daptomycin: "Daptomycin",
    penicillin: "Penicillin G", azithromycin: "Azithromycin",
};

const STUDY_GUIDE = {
    title: "Antibiogram Mastery",
    points: [
        "S = Susceptible – Effective at standard dosing.",
        "I = Intermediate – May work at higher doses.",
        "R = Resistant – Avoid; choose an alternative.",
    ],
    stewardship: "Target the narrowest-spectrum antibiotic that covers all likely pathogens, factoring in patient allergies and renal function. Save your broadest agents for when nothing narrower will work.",
};

const DIFF_META: Record<Difficulty, { ring: string; text: string; badge: string; glow: string }> = {
    Easy: { ring: "border-emerald-400", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", glow: "shadow-emerald-200" },
    Medium: { ring: "border-amber-400", text: "text-amber-600", badge: "bg-amber-100 text-amber-700 border-amber-200", glow: "shadow-amber-200" },
    Hard: { ring: "border-rose-400", text: "text-rose-600", badge: "bg-rose-100 text-rose-700 border-rose-200", glow: "shadow-rose-200" },
    Boss: { ring: "border-rose-500", text: "text-rose-400", badge: "bg-slate-900 text-rose-300 border-slate-700", glow: "shadow-slate-400" },
};

const XP_PER_LEVEL = 150;

const getSusceptibilityColor = (value: string) => {
    if (value === "S") return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (value === "I") return "bg-amber-100 text-amber-800 border-amber-200";
    if (value === "R") return "bg-rose-100 text-rose-800 border-rose-200";
    return "bg-slate-100 text-slate-400 border-slate-200";
};

const FloatingIcon = ({ icon: Icon, style }: { icon: any; style: React.CSSProperties }) => (
    <motion.div
        className="absolute text-slate-300 pointer-events-none hidden sm:block z-0"
        style={{ ...style, opacity: 0.15 }}
        animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 8 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
    >
        <Icon size={48} />
    </motion.div>
);

const TimerBar = ({ timeLeft, timeLimit }: { timeLeft: number; timeLimit: number }) => {
    const pct = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100));
    const color = pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-500" : "bg-rose-500";
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <Clock size={13} /> Decision Window
                </span>
                <span className={`text-xs font-black tabular-nums ${pct <= 20 ? "text-rose-600" : "text-slate-500"}`}>{timeLeft}s</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div className={`h-full ${color} rounded-full`} animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: "linear" }} />
            </div>
        </div>
    );
};

const ComboBadge = ({ streak }: { streak: number }) => (
    <motion.div
        animate={streak >= 3 ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.6, repeat: streak >= 3 ? Infinity : 0, repeatDelay: 0.4 }}
        className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200/50"
    >
        <Flame className={`text-rose-500 ${streak >= 3 ? "fill-rose-500" : ""}`} size={16} />
        <span className="font-bold text-rose-900">{streak}</span>
    </motion.div>
);

const XPBar = ({ xp }: { xp: number }) => {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const into = xp % XP_PER_LEVEL;
    const pct = (into / XP_PER_LEVEL) * 100;
    return (
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                {level}
            </div>
            <div className="w-28 sm:w-40">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Level {level}</span>
                    <span className="text-[10px] font-bold text-slate-400">{into}/{XP_PER_LEVEL}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                </div>
            </div>
        </div>
    );
};

type CaseProgress = { completed: boolean; stars: number };

// ─── Case Map Node ─────────────────────────
const CaseNode = ({
    caseData, index, unlocked, prog, onSelect,
}: {
    caseData: AntibiogramCase; index: number; unlocked: boolean; prog?: CaseProgress; onSelect: () => void;
}) => {
    const Icon = caseData.icon;
    const meta = DIFF_META[caseData.difficulty];
    const isBoss = caseData.difficulty === "Boss";
    const alignRight = index % 2 === 1;

    return (
        <div className={`relative z-10 flex w-full ${alignRight ? "justify-end pr-2 sm:pr-10" : "justify-start pl-2 sm:pl-10"}`}>
            <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={unlocked ? { scale: 1.05, y: -2 } : {}}
                whileTap={unlocked ? { scale: 0.96 } : {}}
                onClick={onSelect}
                disabled={!unlocked}
                className={`flex flex-col items-center gap-2 w-28 sm:w-32 ${!unlocked ? "opacity-60 cursor-not-allowed" : ""}`}
            >
                <div
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-lg ${unlocked ? meta.ring : "border-slate-200"} ${
                        isBoss && unlocked ? "bg-slate-900" : "bg-white"
                    } ${unlocked ? `shadow-md ${meta.glow}` : ""}`}
                >
                    {unlocked ? (
                        <Icon size={30} className={isBoss ? "text-rose-400" : meta.text} strokeWidth={2.2} />
                    ) : (
                        <Lock size={22} className="text-slate-400" />
                    )}
                    {isBoss && unlocked && (
                        <motion.div
                            className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                            animate={{ y: [0, -2, 0] }}
                            transition={{ duration: 1.4, repeat: Infinity }}
                        >
                            Boss
                        </motion.div>
                    )}
                </div>
                <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{caseData.title}</span>
                <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                        <Star key={i} size={11} className={i < (prog?.stars || 0) ? "text-amber-500 fill-amber-500" : "text-slate-200 fill-slate-200"} />
                    ))}
                </div>
            </motion.button>
        </div>
    );
};

// ─── Level Up Modal ─────────────────────────
const LevelUpModal = ({ level, onClose }: { level: number; onClose: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} className="relative bg-white rounded-3xl shadow-2xl p-10 text-center max-w-xs w-full overflow-hidden">
            {[...Array(10)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-amber-400"
                    style={{ top: "50%", left: "50%" }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{ x: Math.cos((i / 10) * Math.PI * 2) * 120, y: Math.sin((i / 10) * Math.PI * 2) * 120, opacity: 0, scale: 1 }}
                    transition={{ duration: 1.1, ease: "easeOut" }}
                >
                    <Sparkles size={18} />
                </motion.div>
            ))}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }} className="w-20 h-20 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
                <Trophy size={36} />
            </motion.div>
            <h2 className="text-2xl font-black text-slate-900">Level {level}!</h2>
            <p className="text-sm font-medium text-slate-500 mt-2">Your clinical judgment is leveling up. Keep stewarding those antibiotics.</p>
            <button onClick={onClose} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95">
                Keep Going
            </button>
        </motion.div>
    </motion.div>
);

// ─── Toast ─────────────────────────
const Toast = ({ message, icon: Icon }: { message: string; icon: any }) => (
    <motion.div
        initial={{ opacity: 0, y: -20, x: "-50%" }}
        animate={{ opacity: 1, y: 0, x: "-50%" }}
        exit={{ opacity: 0, y: -20, x: "-50%" }}
        className="fixed top-20 left-1/2 z-[70] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold"
    >
        <Icon size={16} className="text-amber-400" /> {message}
    </motion.div>
);

export default function AntibiogramSimulator() {
    const [screen, setScreen] = useState<"map" | "brief" | "lab" | "result">("map");
    const [showStudyGuide, setShowStudyGuide] = useState(true);
    const [activeIdx, setActiveIdx] = useState(0);
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);
    const [timedOut, setTimedOut] = useState(false);
    const [feedback, setFeedback] = useState<{ correct: boolean; title: string; text: string; references: string; stars: number; xpGain: number } | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [progress, setProgress] = useState<Record<number, CaseProgress>>({});
    const [levelUpTo, setLevelUpTo] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; icon: any } | null>(null);
    const toastTimer = useRef<any>(null);

    const currentCase = CASES[activeIdx];
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;

    const isUnlocked = (idx: number) => idx === 0 || !!progress[CASES[idx - 1].id]?.completed;

    const fireToast = (message: string, icon: any) => {
        setToast({ message, icon });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 2600);
    };

    // Countdown timer — only ticks while actively in the lab and undecided
    useEffect(() => {
        if (screen !== "lab" || selected || timeLeft <= 0) return;
        const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [screen, selected, timeLeft]);

    useEffect(() => {
        if (screen === "lab" && !selected && timeLeft === 0) {
            evaluateAnswer(null, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    const startCase = (idx: number) => {
        if (!isUnlocked(idx)) {
            fireToast("Complete the prior case to unlock this one", Lock);
            return;
        }
        setActiveIdx(idx);
        setSelected(null);
        setFeedback(null);
        setShowHint(false);
        setHintUsed(false);
        setTimedOut(false);
        setTimeLeft(CASES[idx].timeLimit);
        setScreen("brief");
    };

    const beginLab = () => setScreen("lab");

    const evaluateAnswer = (abxId: string | null, didTimeOut: boolean) => {
        setSelected(abxId ?? "__timeout__");
        setTimedOut(didTimeOut);

        const isCorrect = !didTimeOut && abxId === currentCase.correct;
        const timeFraction = timeLeft / currentCase.timeLimit;
        let stars = 0;
        if (isCorrect) stars = hintUsed ? 2 : timeFraction > 0.4 ? 3 : 2;

        const bonus = stars === 3 ? 10 : 0;
        const xpGain = isCorrect ? currentCase.xp + bonus : 0;
        const prevLevel = Math.floor(xp / XP_PER_LEVEL);
        const newXp = xp + xpGain;
        setXp(newXp);
        const newLevel = Math.floor(newXp / XP_PER_LEVEL);

        if (isCorrect) {
            setStreak((s) => s + 1);
            if (stars === 3) fireToast("Perfect Diagnosis!", Award);
            if (currentCase.difficulty === "Boss") fireToast("Superbug Contained!", Skull);
        } else {
            setStreak(0);
        }

        setProgress((p) => ({
            ...p,
            [currentCase.id]: { completed: true, stars: Math.max(stars, p[currentCase.id]?.stars || 0) },
        }));

        setFeedback({
            correct: isCorrect,
            title: didTimeOut ? "Time's Up" : isCorrect ? "Correct Diagnosis!" : `Preferred Agent: ${antibioticNames[currentCase.correct] || currentCase.correct}`,
            text: currentCase.rationale,
            references: currentCase.references,
            stars,
            xpGain,
        });
        setScreen("result");

        if (newLevel > prevLevel) {
            setTimeout(() => setLevelUpTo(newLevel), 700);
        }
    };

    const handleSelect = (abxId: string) => {
        if (selected) return;
        evaluateAnswer(abxId, false);
    };

    const backToMap = () => {
        setScreen("map");
        setSelected(null);
        setFeedback(null);
        setShowHint(false);
        setHintUsed(false);
    };

    const resetGame = () => {
        setXp(0); setStreak(0); setProgress({}); setActiveIdx(0);
        setSelected(null); setFeedback(null); setShowHint(false); setHintUsed(false);
        setScreen("map"); setShowStudyGuide(false);
    };

    const nextIdx = activeIdx + 1 < CASES.length ? activeIdx + 1 : null;
    const allComplete = CASES.every((c) => progress[c.id]?.completed);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
            <FloatingIcon icon={Pill} style={{ top: "15%", left: "5%" }} />
            <FloatingIcon icon={FlaskConical} style={{ top: "40%", right: "8%" }} />
            <FloatingIcon icon={Microscope} style={{ top: "70%", left: "6%" }} />
            <FloatingIcon icon={Stethoscope} style={{ top: "85%", right: "5%" }} />
            <FloatingIcon icon={Bug} style={{ top: "55%", left: "50%" }} />

            {/* Toast */}
            <AnimatePresence>{toast && <Toast message={toast.message} icon={toast.icon} />}</AnimatePresence>

            {/* Level Up Modal */}
            <AnimatePresence>
                {levelUpTo !== null && <LevelUpModal level={levelUpTo} onClose={() => setLevelUpTo(null)} />}
            </AnimatePresence>

            {/* Study Guide Modal */}
            <AnimatePresence>
                {showStudyGuide && (
                    <motion.div key="study-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><BookOpen size={28} /></div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{STUDY_GUIDE.title}</h2>
                                    <p className="text-slate-500 text-sm font-medium">Stewardship Quick Reference</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {STUDY_GUIDE.points.map((point, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? "bg-emerald-100 text-emerald-600" : i === 1 ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"}`}>
                                            {i === 0 ? <CheckCircle size={14} strokeWidth={3} /> : i === 1 ? <AlertTriangle size={14} strokeWidth={3} /> : <XCircle size={14} strokeWidth={3} />}
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">{point}</p>
                                    </div>
                                ))}
                                <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100/50 mt-2">
                                    <p className="text-sm font-medium text-indigo-900 leading-relaxed">{STUDY_GUIDE.stewardship}</p>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-start gap-3">
                                    <Trophy size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                                    <p className="text-xs font-medium text-slate-600 leading-relaxed">Work through the case map, race the decision timer, and earn stars, XP, and levels as you clear each rotation — culminating in a multidrug-resistant boss case.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowStudyGuide(false)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-95">
                                Enter the Case Map
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header / HUD */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                    <button onClick={backToMap} className="flex items-center gap-3 shrink-0">
                        <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm"><Microscope size={20} /></div>
                        <div className="text-left hidden sm:block">
                            <span className="font-bold text-slate-900 text-lg leading-none block">Antibiogram Lab</span>
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                {screen === "map" ? `${Object.values(progress).filter((p) => p.completed).length}/${CASES.length} Rotations Cleared` : currentCase.title}
                            </span>
                        </div>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <XPBar xp={xp} />
                        <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/50">
                            <Star className="text-amber-500 fill-amber-500" size={16} />
                            <span className="font-bold text-amber-900">{xp}</span>
                        </div>
                        <ComboBadge streak={streak} />
                        <button onClick={() => setShowStudyGuide(true)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" title="How to Play">
                            <BookOpen size={18} />
                        </button>
                        <button onClick={resetGame} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors" title="Restart Session">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── MAP SCREEN ─── */}
            {screen === "map" && (
                <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Clinical Rotation Map</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Clear each case to unlock the next. Reach the CRE boss to become Chief Resident.</p>
                    </motion.div>

                    {allComplete && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-3xl p-6 flex items-center gap-4 shadow-lg shadow-indigo-200">
                            <Trophy size={36} className="text-amber-300" />
                            <div>
                                <p className="font-black text-lg">Chief Resident Status Achieved</p>
                                <p className="text-indigo-100 text-sm font-medium">Every rotation cleared — from CAP to carbapenem-resistant Klebsiella.</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="relative flex flex-col gap-10 py-4">
                        <div className="absolute left-1/2 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-300 -translate-x-1/2 z-0" />
                        {CASES.map((c, idx) => (
                            <CaseNode key={c.id} caseData={c} index={idx} unlocked={isUnlocked(idx)} prog={progress[c.id]} onSelect={() => startCase(idx)} />
                        ))}
                    </div>

                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        {(["Easy", "Medium", "Hard", "Boss"] as Difficulty[]).map((d) => (
                            <span key={d} className={`text-[11px] font-bold px-3 py-1 rounded-full border ${DIFF_META[d].badge}`}>{d}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── BRIEFING SCREEN ─── */}
            {screen === "brief" && (
                <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20, rotateX: -10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden">
                        <div className={`px-6 py-4 flex items-center justify-between ${currentCase.difficulty === "Boss" ? "bg-slate-900" : "bg-indigo-50"}`}>
                            <span className={`text-xs font-bold uppercase tracking-wider ${currentCase.difficulty === "Boss" ? "text-rose-300" : "text-indigo-500"}`}>Incoming Consult</span>
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${DIFF_META[currentCase.difficulty].badge}`}>{currentCase.difficulty}</span>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-start gap-5">
                                <PatientAvatar skin={currentCase.patient.avatar.skin} hair={currentCase.patient.avatar.hair} shirt={currentCase.patient.avatar.shirt} isInfant={currentCase.patient.isInfant} size={72} />
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{currentCase.patient.name}</h2>
                                    <p className="text-sm font-medium text-slate-500">{currentCase.patient.age} • {currentCase.patient.comorbidities}</p>
                                    <h3 className="mt-2 text-lg font-black text-indigo-600">{currentCase.title}</h3>
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                                <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{currentCase.vignette}"</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {currentCase.pathogens.map((p) => (
                                    <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-white shadow-sm border border-indigo-100 rounded-full">
                                        <GermGlyph gram={p.gram} morphology={p.morphology} size={22} />
                                        <span className="text-xs font-bold text-indigo-700">{p.name}</span>
                                    </div>
                                ))}
                            </div>

                            {currentCase.patient.allergies.length > 0 && (
                                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle size={14} className="text-rose-500" />
                                        <p className="text-rose-700 text-xs font-bold uppercase tracking-wider">Documented Allergies</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {currentCase.patient.allergies.map((a) => (
                                            <span key={a} className="bg-white border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span className="flex items-center gap-1.5"><Clock size={13} /> {currentCase.timeLimit}s decision window</span>
                                <span className="flex items-center gap-1.5"><Zap size={13} /> {currentCase.xp} XP reward</span>
                            </div>

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={beginLab} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                                Begin Diagnostic Rounds <ArrowRight size={18} />
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* ─── LAB SCREEN ─── */}
            {screen === "lab" && (
                <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                    <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/60">
                            <TimerBar timeLeft={timeLeft} timeLimit={currentCase.timeLimit} />
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                            <div className="flex items-start gap-5">
                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                                    <PatientAvatar skin={currentCase.patient.avatar.skin} hair={currentCase.patient.avatar.hair} shirt={currentCase.patient.avatar.shirt} isInfant={currentCase.patient.isInfant} size={72} />
                                </motion.div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{currentCase.patient.name}</h3>
                                    <p className="text-sm font-medium text-slate-500 mt-1">{currentCase.patient.age} • {currentCase.patient.comorbidities}</p>
                                </div>
                            </div>
                            {currentCase.patient.allergies.length > 0 && (
                                <div className="mt-5 bg-rose-50/50 border border-rose-100 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle size={14} className="text-rose-500" />
                                        <p className="text-rose-700 text-xs font-bold uppercase tracking-wider">Documented Allergies</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {currentCase.patient.allergies.map((a) => (
                                            <span key={a} className="bg-white border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">{a}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-indigo-50 to-blue-50/30 border border-indigo-100 rounded-3xl p-6 shadow-sm">
                            <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Primary Diagnosis</h4>
                            <p className="text-lg font-bold text-slate-900 leading-tight">{currentCase.title}</p>
                            <div className="mt-4 pt-4 border-t border-indigo-200/50">
                                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Isolated Pathogens</h4>
                                <div className="flex flex-wrap gap-2">
                                    {currentCase.pathogens.map((p) => (
                                        <div key={p.id} className="flex items-center gap-2 px-3 py-1.5 bg-white shadow-sm border border-indigo-100 rounded-full">
                                            <GermGlyph gram={p.gram} morphology={p.morphology} size={18} />
                                            <span className="text-xs font-bold text-indigo-700">{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <button onClick={() => { setShowHint((h) => !h); setHintUsed(true); }} className="flex justify-between items-center bg-white border border-slate-200 hover:border-amber-300 rounded-2xl p-4 w-full transition-all group shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg transition-colors ${showHint ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-500"}`}>
                                    <Lightbulb size={18} />
                                </div>
                                <span className="font-semibold text-sm text-slate-700">Clinical Hint</span>
                            </div>
                            <ChevronRight size={18} className={`text-slate-400 transition-transform ${showHint ? "rotate-90" : ""}`} />
                        </button>
                        <AnimatePresence>
                            {showHint && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-sm font-medium text-amber-900 mt-2">
                                        Identify an agent with "S" across all isolated pathogens, ensuring it bypasses any documented hypersensitivities. Using a hint caps your stars for this case at 2.
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </aside>

                    <div className="lg:col-span-8 space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <ShieldAlert className="text-indigo-500" size={20} /> Susceptibility Matrix
                                </h3>
                                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${DIFF_META[currentCase.difficulty].badge}`}>{currentCase.difficulty}</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-wider text-xs border-b border-slate-100 bg-slate-50/50">Organism</th>
                                            {currentCase.antibiotics.map((abx) => (
                                                <th key={abx} className={`px-4 py-4 text-center font-bold text-xs uppercase tracking-wider border-b border-slate-100 transition-colors ${selected === abx ? "bg-indigo-50 text-indigo-700" : "bg-slate-50/50 text-slate-500"}`}>
                                                    {antibioticNames[abx] || abx}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentCase.pathogens.map((pathogen) => (
                                            <tr key={pathogen.id} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-slate-700">
                                                    <div className="flex items-center gap-2">
                                                        <GermGlyph gram={pathogen.gram} morphology={pathogen.morphology} size={20} />
                                                        {pathogen.name}
                                                    </div>
                                                </td>
                                                {currentCase.antibiotics.map((abx) => {
                                                    const value = currentCase.antibiogram[abx]?.[pathogen.id] || "-";
                                                    const isSelectedCol = selected === abx;
                                                    return (
                                                        <td key={abx} className={`px-4 py-4 text-center transition-colors ${isSelectedCol ? "bg-indigo-50/50" : ""}`}>
                                                            <span className={`inline-flex w-9 h-9 items-center justify-center rounded-xl text-xs font-black border shadow-sm ${getSusceptibilityColor(value)} ${isSelectedCol ? "ring-2 ring-indigo-400 ring-offset-1" : ""}`}>
                                                                {value}
                                                            </span>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {!selected && (
                                <motion.div key="selection" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {currentCase.antibiotics.map((abx) => {
                                        const contraindicated = currentCase.contraindicated.includes(abx);
                                        return (
                                            <motion.button
                                                key={abx}
                                                whileHover={contraindicated ? {} : { scale: 1.03, y: -2 }}
                                                whileTap={contraindicated ? {} : { scale: 0.98 }}
                                                onClick={() => !contraindicated && handleSelect(abx)}
                                                disabled={contraindicated}
                                                className={`group relative p-5 rounded-2xl border text-left flex flex-col justify-between min-h-[100px] transition-all ${
                                                    contraindicated ? "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-70" : "bg-white border-slate-200 text-slate-800 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100"
                                                }`}
                                            >
                                                <span className="font-bold text-sm block">{antibioticNames[abx] || abx}</span>
                                                {contraindicated ? (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mt-2 flex items-center gap-1"><XCircle size={12} /> Contraindicated</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Select Agent</span>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* ─── RESULT SCREEN ─── */}
            {screen === "result" && feedback && (
                <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-8 rounded-3xl border shadow-lg ${feedback.correct ? "bg-emerald-50 border-emerald-200 shadow-emerald-100/50" : "bg-rose-50 border-rose-200 shadow-rose-100/50"}`}
                    >
                        <div className="flex items-start gap-4">
                            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 12 }} className={`p-4 rounded-2xl shadow-sm ${feedback.correct ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
                                {timedOut ? <Clock size={32} /> : feedback.correct ? <Award size={32} /> : <AlertTriangle size={32} />}
                            </motion.div>
                            <div className="flex-1">
                                <h3 className={`text-2xl font-black mb-1 ${feedback.correct ? "text-emerald-900" : "text-rose-900"}`}>{feedback.title}</h3>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.15, type: "spring" }}>
                                                <Star size={20} className={i < feedback.stars ? "text-amber-500 fill-amber-500" : "text-slate-300 fill-slate-200"} />
                                            </motion.div>
                                        ))}
                                    </div>
                                    {feedback.xpGain > 0 && (
                                        <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex items-center gap-1 text-xs font-black text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">
                                            <TrendingUp size={12} /> +{feedback.xpGain} XP
                                        </motion.span>
                                    )}
                                </div>
                                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-inner mt-2 text-slate-800 leading-relaxed font-medium">
                                    {feedback.text}
                                </div>
                                <p className="text-xs font-bold text-slate-500 mt-5 uppercase tracking-wider flex items-center gap-2">
                                    <BookOpen size={14} /> Reference: {feedback.references}
                                </p>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={backToMap} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-colors">
                                <Home size={16} /> Case Map
                            </motion.button>
                            {nextIdx !== null && isUnlocked(nextIdx) && (
                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startCase(nextIdx)} className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-md transition-colors ${feedback.correct ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-800 hover:bg-slate-900"}`}>
                                    Next Patient <ArrowRight size={18} />
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}