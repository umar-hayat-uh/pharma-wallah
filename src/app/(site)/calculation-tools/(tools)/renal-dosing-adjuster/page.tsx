"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Calculator,
    Droplet,
    User,
    FileText,
    ExternalLink,
    Info,
    AlertTriangle,
    CheckCircle2,
    Copy,
    Check,
    BookOpen,
    ShieldAlert,
    Activity,
    SlidersHorizontal,
    ChevronDown,
    ChevronUp,
    HeartPulse,
    Pill,
    Stethoscope,
    RefreshCw,
    Sparkles,
} from "lucide-react";

// ─── TYPES & INTERFACES ─────────────────────────────────────────────

export type DrugCategory =
    | "All"
    | "Antibiotics"
    | "Antivirals & Antifungals"
    | "Anticoagulants"
    | "Cardiovascular"
    | "Endocrine & Diabetes"
    | "Neurology & Analgesics"
    | "Rheumatology & Gout";

export interface DoseAdjustmentTier {
    crclRangeLabel: string;
    minCrCl: number;
    maxCrCl: number;
    dose: string;
    interval: string;
    notes?: string;
    status: "safe" | "caution" | "contraindicated" | "monitored";
}

export interface RenalDrug {
    id: string;
    name: string;
    genericName?: string;
    brandName?: string;
    category: DrugCategory;
    indication: string;
    usualDose: string;
    adjustments: DoseAdjustmentTier[];
    dialysisGuidance?: {
        hemodialysis?: string;
        crrt?: string;
        peritoneal?: string;
    };
    clinicalPearls?: string[];
    criticalWarning?: string;
    reference: string;
    source: string;
    link?: string;
    lastReviewed: string;
}

// ─── COMPREHENSIVE CLINICAL DRUG DATABASE (2024–2026 EVIDENCE) ──────

export const renalDrugsDatabase: RenalDrug[] = [
    {
        id: "vancomycin",
        name: "Vancomycin",
        brandName: "Vancocin",
        category: "Antibiotics",
        indication: "Severe Gram-positive infections, MRSA bacteremia, endocarditis",
        usualDose: "15–20 mg/kg IV q8–12h (Max 2 g/dose). Target AUC/MIC: 400–600 mg·h/L",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 50 mL/min",
                minCrCl: 50,
                maxCrCl: 9999,
                dose: "15–20 mg/kg (actual body weight)",
                interval: "Every 8 to 12 hours",
                notes: "Loading dose 25–35 mg/kg (max 3 g) recommended in critically ill. Monitor AUC-guided dosing.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 30–49 mL/min",
                minCrCl: 30,
                maxCrCl: 49.9,
                dose: "15 mg/kg",
                interval: "Every 24 hours",
                notes: "AUC-guided dosing or trough level monitoring (15–20 mcg/mL for severe MRSA) required.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl 15–29 mL/min",
                minCrCl: 15,
                maxCrCl: 29.9,
                dose: "15 mg/kg",
                interval: "Every 24 to 48 hours",
                notes: "Check pre-dose serum trough level before redosing.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 15 mL/min",
                minCrCl: 0,
                maxCrCl: 14.9,
                dose: "15–20 mg/kg loading dose, then level-guided",
                interval: "Redose when level < 15–20 mcg/mL",
                notes: "Pulse dosing: Redose only after checking random serum vancomycin concentration.",
                status: "monitored",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "15–25 mg/kg loading dose; redose 5–10 mg/kg after HD when serum level < 15–20 mcg/mL (High-flux dialyzers remove 30–50%).",
            crrt: "20–25 mg/kg loading dose, then 10–15 mg/kg IV q24–48h or continuous infusion with AUC monitoring.",
            peritoneal: "1–2 g IP loading dose, then 30 mg/kg IP every 3–5 days or 15–30 mg/L in each dialysate bag.",
        },
        clinicalPearls: [
            "Calculate actual body weight for loading dose, but monitor trough/AUC closely in morbidly obese patients.",
            "Co-administration with Piperacillin-Tazobactam increases acute kidney injury (AKI) incidence significantly.",
        ],
        criticalWarning: "High risk of nephrotoxicity with AUC > 650 mg·h/L or concurrent loop diuretics/aminoglycosides.",
        reference: "Rybak MJ, et al. ASHP/IDSA/PIDS/SIDP Consensus Guidelines. Am J Health-Syst Pharm. 2020;77(11):835-864.",
        source: "ASHP/IDSA Guidelines",
        link: "https://academic.oup.com/ajhp/article/77/11/835/5810200",
        lastReviewed: "2024 Q4",
    },
    {
        id: "pip-tazo",
        name: "Piperacillin / Tazobactam",
        brandName: "Zosyn",
        category: "Antibiotics",
        indication: "Nosocomial pneumonia, intra-abdominal infections, complicated UTI",
        usualDose: "3.375 g – 4.5 g IV q6h (or 3.375 g q8h extended 4-hour infusion)",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 50 mL/min",
                minCrCl: 50,
                maxCrCl: 9999,
                dose: "3.375 g – 4.5 g",
                interval: "Every 6 hours (or 3.375 g q8h over 4h)",
                notes: "Extended 4-hour infusions optimize pharmacokinetic/pharmacodynamic (PK/PD) target attainment.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 20–49 mL/min",
                minCrCl: 20,
                maxCrCl: 49.9,
                dose: "3.375 g",
                interval: "Every 6 hours (or 2.25 g q6h)",
                notes: "For nosocomial pneumonia: maintain 3.375 g q6h.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 20 mL/min",
                minCrCl: 0,
                maxCrCl: 19.9,
                dose: "2.25 g",
                interval: "Every 8 hours (or 2.25 g q6h for nosocomial pneumonia)",
                notes: "Monitor for accumulation and hematologic/neurologic toxicities.",
                status: "caution",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "2.25 g IV q8h; give supplemental 0.75 g post-dialysis on HD days.",
            crrt: "3.375 g IV q8h (extended 4h infusion preferred) or 4.5 g q8h for severe Pseudomonas.",
        },
        clinicalPearls: [
            "Contains 2.79 mEq (64 mg) of sodium per gram of piperacillin; observe sodium/fluid balance.",
        ],
        reference: "Zosyn (piperacillin and tazobactam) US FDA Prescribing Information. Pfizer Inc.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/050684s088lbl.pdf",
        lastReviewed: "2024 Q3",
    },
    {
        id: "meropenem",
        name: "Meropenem",
        brandName: "Merrem",
        category: "Antibiotics",
        indication: "Complicated intra-abdominal infections, meningitis, multidrug-resistant sepsis",
        usualDose: "1 g IV q8h (2 g IV q8h for meningitis or resistant Pseudomonas)",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 50 mL/min",
                minCrCl: 50,
                maxCrCl: 9999,
                dose: "1 g (or 2 g for meningitis)",
                interval: "Every 8 hours",
                notes: "Standard extended 3-hour infusion optimizes time above MIC (>40% fT>MIC).",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 26–49 mL/min",
                minCrCl: 26,
                maxCrCl: 49.9,
                dose: "1 g",
                interval: "Every 12 hours",
                notes: "Dose may be increased for high-MIC pathogens under ID consultation.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 10–25 mL/min",
                minCrCl: 10,
                maxCrCl: 25.9,
                dose: "500 mg",
                interval: "Every 12 hours",
                notes: "Reduced dose to prevent central nervous system toxicity/seizures.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 10 mL/min",
                minCrCl: 0,
                maxCrCl: 9.9,
                dose: "500 mg",
                interval: "Every 24 hours",
                notes: "High risk of accumulation.",
                status: "caution",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "500 mg IV q24h; on dialysis days, administer dose immediately after HD session.",
            crrt: "1 g IV q8–12h (or 1 g q8h extended 3h infusion depending on effluent rate).",
        },
        clinicalPearls: [
            "Significantly reduces serum valproic acid levels (up to 80% decrease within 24h), precipitating breakthrough seizures.",
        ],
        criticalWarning: "Co-administration with valproic acid / divalproex is generally contraindicated.",
        reference: "Meropenem prescribing information. US FDA & Sanford Guide to Antimicrobial Therapy.",
        source: "FDA / Sanford",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2020/050706s039lbl.pdf",
        lastReviewed: "2024 Q4",
    },
    {
        id: "cefepime",
        name: "Cefepime",
        brandName: "Maxipime",
        category: "Antibiotics",
        indication: "Febrile neutropenia, hospital-acquired pneumonia, urosepsis",
        usualDose: "1 g – 2 g IV q8–12h",
        adjustments: [
            {
                crclRangeLabel: "CrCl > 60 mL/min",
                minCrCl: 60.1,
                maxCrCl: 9999,
                dose: "2 g (severe/neutropenia) or 1 g",
                interval: "Every 8 to 12 hours",
                notes: "Standard dosing for normal clearance.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 30–60 mL/min",
                minCrCl: 30,
                maxCrCl: 60,
                dose: "2 g (severe) or 1 g",
                interval: "Every 12 to 24 hours",
                notes: "2 g q12h for febrile neutropenia or severe sepsis.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl 11–29 mL/min",
                minCrCl: 11,
                maxCrCl: 29.9,
                dose: "1 g (or 2 g for severe infections)",
                interval: "Every 24 hours",
                notes: "Strict renal adjustment required to avoid cefepime-induced neurotoxicity.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl ≤ 10 mL/min",
                minCrCl: 0,
                maxCrCl: 10.9,
                dose: "500 mg (or 1 g for severe infections)",
                interval: "Every 24 hours",
                notes: "High risk of nonconvulsive status epilepticus if overdosed.",
                status: "contraindicated",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "1 g initial loading dose on Day 1, then 500 mg IV q24h (administer dose after HD).",
            crrt: "1 g to 2 g IV q12h depending on continuous dialysis flow rate.",
        },
        clinicalPearls: [
            "Cefepime neurotoxicity presents as altered mental status, myoclonus, confusion, and triphasic EEG waves without fever.",
        ],
        criticalWarning: "FDA Safety Alert: Neurotoxicity risk in unadjusted renal impairment. Always calculate CrCl accurately.",
        reference: "Cefepime US FDA Label & FDA Drug Safety Communication regarding neurotoxicity.",
        source: "FDA Safety Alert",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/050679s044lbl.pdf",
        lastReviewed: "2024 Q3",
    },
    {
        id: "ceftriaxone",
        name: "Ceftriaxone",
        brandName: "Rocephin",
        category: "Antibiotics",
        indication: "Community-acquired pneumonia, meningitis, pyelonephritis, gonorrhea",
        usualDose: "1 g – 2 g IV/IM q24h (2 g q12h for bacterial meningitis)",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 10 mL/min",
                minCrCl: 10,
                maxCrCl: 9999,
                dose: "1 g – 2 g",
                interval: "Every 24 hours (No renal adjustment needed)",
                notes: "Dual elimination (biliary and renal). No dosage reduction necessary in pure renal impairment.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl < 10 mL/min with Hepatic Impairment",
                minCrCl: 0,
                maxCrCl: 9.9,
                dose: "Max 2 g / day",
                interval: "Every 24 hours",
                notes: "Only adjust if concurrent severe liver disease is present; do not exceed 2 g/day.",
                status: "safe",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "No supplemental dose or schedule change needed after HD (not significantly dialyzable).",
            crrt: "1 g – 2 g IV q24h (standard dosing).",
        },
        clinicalPearls: [
            "Do NOT mix with calcium-containing IV solutions (e.g., Lactated Ringer's) due to risk of fatal ceftriaxone-calcium precipitation in lungs/kidneys.",
        ],
        reference: "Rocephin (ceftriaxone) US FDA Prescribing Information. Genentech USA.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/050585s068lbl.pdf",
        lastReviewed: "2024 Q2",
    },
    {
        id: "gentamicin",
        name: "Gentamicin",
        brandName: "Garamycin",
        category: "Antibiotics",
        indication: "Gram-negative bacteremia, synergy in enterococcal endocarditis",
        usualDose: "5–7 mg/kg IV once daily (Hartford Nomogram) or 1.5–2 mg/kg q8h",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 60 mL/min",
                minCrCl: 60,
                maxCrCl: 9999,
                dose: "5–7 mg/kg (using adjusted weight if obese)",
                interval: "Every 24 hours",
                notes: "Obtain 6–14 hour random serum concentration and plot on Hartford Nomogram.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 40–59 mL/min",
                minCrCl: 40,
                maxCrCl: 59.9,
                dose: "5–7 mg/kg",
                interval: "Every 36 hours",
                notes: "Extended interval strategy with therapeutic drug monitoring.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl 20–39 mL/min",
                minCrCl: 20,
                maxCrCl: 39.9,
                dose: "5–7 mg/kg",
                interval: "Every 48 hours",
                notes: "Alternative: traditional dosing (1–1.5 mg/kg) with peak/trough monitoring.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 20 mL/min",
                minCrCl: 0,
                maxCrCl: 19.9,
                dose: "2 mg/kg loading dose, then monitor levels",
                interval: "Level-guided (redose when trough < 1 mcg/mL)",
                notes: "High risk of ototoxicity and tubular nephrotoxicity. Avoid extended-interval nomogram.",
                status: "contraindicated",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "1.5–2 mg/kg loading dose; administer 1–1.5 mg/kg post-dialysis after each HD session.",
            crrt: "2–3 mg/kg loading dose, then 1.5–2 mg/kg q24–48h with daily peak/trough monitoring.",
        },
        clinicalPearls: [
            "Use Ideal Body Weight (IBW) or Adjusted Body Weight (AdjBW = IBW + 0.4*(TBW - IBW)) for dosing calculations.",
        ],
        criticalWarning: "Irreversible vestibular/auditory ototoxicity and acute tubular necrosis with sustained troughs > 2 mcg/mL.",
        reference: "Nicolau DP, et al. Antimicrob Agents Chemother. 1995;39(3):650-655.",
        source: "Hartford Nomogram",
        link: "https://journals.asm.org/doi/10.1128/AAC.39.3.650",
        lastReviewed: "2024 Q4",
    },
    {
        id: "ciprofloxacin",
        name: "Ciprofloxacin",
        brandName: "Cipro",
        category: "Antibiotics",
        indication: "Complicated UTI, pyelonephritis, intra-abdominal infections, anthrax",
        usualDose: "400 mg IV q8–12h or 500–750 mg PO q12h",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 50 mL/min",
                minCrCl: 50,
                maxCrCl: 9999,
                dose: "400 mg IV q8–12h or 500–750 mg PO q12h",
                interval: "Every 8 to 12 hours",
                notes: "Standard dosing.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 30–49 mL/min",
                minCrCl: 30,
                maxCrCl: 49.9,
                dose: "400 mg IV q12h or 250–500 mg PO q12h",
                interval: "Every 12 hours",
                notes: "Reduce frequency or oral strength.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 5–29 mL/min",
                minCrCl: 5,
                maxCrCl: 29.9,
                dose: "200–400 mg IV q18–24h or 250–500 mg PO q24h",
                interval: "Every 18 to 24 hours",
                notes: "Monitor renal function and QT interval.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 5 mL/min",
                minCrCl: 0,
                maxCrCl: 4.9,
                dose: "200–400 mg IV q24h or 250 mg PO q24h",
                interval: "Every 24 hours",
                notes: "Give dose post-dialysis on hemodialysis days.",
                status: "caution",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "200–400 mg IV q24h or 250–500 mg PO q24h (administer post-HD on dialysis days).",
            crrt: "400 mg IV q12h for Pseudomonas/severe infections; otherwise 200–400 mg q12–24h.",
        },
        clinicalPearls: [
            "Oral bioavailability is >70%; oral absorption is severely impaired by dairy, calcium, iron, and multivalent antacids.",
        ],
        reference: "Cipro (ciprofloxacin) US FDA Prescribing Information. Bayer Healthcare.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2017/019537s086lbl.pdf",
        lastReviewed: "2024 Q1",
    },
    {
        id: "levofloxacin",
        name: "Levofloxacin",
        brandName: "Levaquin",
        category: "Antibiotics",
        indication: "Pneumonia, complicated UTI, pyelonephritis, skin infections",
        usualDose: "500 mg – 750 mg IV/PO once daily",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 50 mL/min",
                minCrCl: 50,
                maxCrCl: 9999,
                dose: "500 mg – 750 mg",
                interval: "Every 24 hours",
                notes: "Standard dosing based on indication.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 20–49 mL/min",
                minCrCl: 20,
                maxCrCl: 49.9,
                dose: "750 mg q48h (or initial 500 mg then 250 mg q24h)",
                interval: "Every 24 to 48 hours",
                notes: "If starting 750 mg regimen: 750 mg initial, then 750 mg q48h.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 20 mL/min",
                minCrCl: 0,
                maxCrCl: 19.9,
                dose: "750 mg initial, then 500 mg q48h (or 500 mg initial, then 250 mg q48h)",
                interval: "Every 48 hours",
                notes: "No supplemental dose needed post-dialysis.",
                status: "caution",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "750 mg initial, then 500 mg q48h (or 500 mg initial, then 250 mg q48h). Not removed by HD.",
            crrt: "Initial 500–750 mg loading dose, then 250–500 mg q24h.",
        },
        clinicalPearls: [
            "Levofloxacin is predominantly excreted unchanged renally (~80%), making dose adjustment mandatory to avoid CNS toxicities.",
        ],
        criticalWarning: "Boxed warnings for tendinitis, tendon rupture, peripheral neuropathy, and CNS toxicities.",
        reference: "Levaquin (levofloxacin) US FDA Prescribing Information. Janssen Pharmaceuticals.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2016/020634s067,020635s071,021721s032lbl.pdf",
        lastReviewed: "2024 Q2",
    },
    {
        id: "bactrim",
        name: "Trimethoprim / Sulfamethoxazole",
        brandName: "Bactrim DS / Septra",
        category: "Antibiotics",
        indication: "Pneumocystis jirovecii (PJP), Stenotrophomonas, MRSA skin infections, UTI",
        usualDose: "1–2 DS tabs PO q12h (or 10–20 mg/kg/day TMP IV for PJP treatment)",
        adjustments: [
            {
                crclRangeLabel: "CrCl > 30 mL/min",
                minCrCl: 30.1,
                maxCrCl: 9999,
                dose: "Standard dose (1 DS tab q12h or 100% IV dose)",
                interval: "Every 12 hours",
                notes: "Standard dosing for normal kidney function.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 15–30 mL/min",
                minCrCl: 15,
                maxCrCl: 30,
                dose: "50% of standard dose (1 SS tab q12h or 1 DS tab q24h)",
                interval: "Every 12 to 24 hours",
                notes: "Monitor serum potassium (TMP blocks amiloride-sensitive sodium channels in distal nephron).",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 15 mL/min",
                minCrCl: 0,
                maxCrCl: 14.9,
                dose: "Use NOT recommended unless benefits outweigh risks",
                interval: "50% dose q24h with intensive monitoring",
                notes: "Trimethoprim inhibits tubular creatinine secretion, artificially elevating serum Cr without dropping true GFR.",
                status: "contraindicated",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "50% of standard dose administered after each HD session (both components moderately dialyzed).",
            crrt: "5–10 mg/kg/day TMP component divided q12h with frequent potassium and level monitoring.",
        },
        clinicalPearls: [
            "Causes benign, pseudo-elevation of serum creatinine due to competitive inhibition of organic cation transporters (OCT2).",
            "High incidence of hyperkalemia, especially in combination with ACE inhibitors or ARBs.",
        ],
        reference: "Bactrim (sulfamethoxazole and trimethoprim) US FDA Prescribing Information.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/017377s077,018449s060lbl.pdf",
        lastReviewed: "2024 Q3",
    },
    {
        id: "nitrofurantoin",
        name: "Nitrofurantoin",
        brandName: "Macrobid / Macrodantin",
        category: "Antibiotics",
        indication: "Treatment and prophylaxis of uncomplicated lower cystitis (E. coli, enterococci)",
        usualDose: "Macrobid: 100 mg PO BID x 5 days (Macrodantin: 50–100 mg QID)",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 60 mL/min",
                minCrCl: 60,
                maxCrCl: 9999,
                dose: "100 mg PO BID",
                interval: "Every 12 hours",
                notes: "Standard therapeutic duration: 5 days for acute cystitis.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 30–59 mL/min",
                minCrCl: 30,
                maxCrCl: 59.9,
                dose: "100 mg PO BID (short-course uncomplicated UTI)",
                interval: "Every 12 hours",
                notes: "AGS Beers Criteria & IDSA: Safe for short-course (≤5 days) in uncomplicated lower UTI if CrCl ≥ 30 mL/min.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 30 mL/min",
                minCrCl: 0,
                maxCrCl: 29.9,
                dose: "CONTRAINDICATED",
                interval: "Do not use",
                notes: "Inadequate urinary drug concentration leads to treatment failure + increased risk of peripheral neuropathy and pulmonary toxicity.",
                status: "contraindicated",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "CONTRAINDICATED in ESRD/HD.",
            crrt: "Contraindicated / Ineffective due to poor urinary excretion.",
        },
        clinicalPearls: [
            "Ineffective for pyelonephritis or systemic bacteremia because it achieves negligible systemic tissue/blood levels.",
        ],
        criticalWarning: "Contraindicated in CrCl < 30 mL/min or term pregnancy (weeks 38-42) due to hemolytic anemia risk.",
        reference: "2023 American Geriatrics Society Beers Criteria & US FDA Macrobid Package Insert.",
        source: "AGS Beers / FDA",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2021/020064s027lbl.pdf",
        lastReviewed: "2024 Q4",
    },
    {
        id: "acyclovir",
        name: "Acyclovir",
        brandName: "Zovirax",
        category: "Antivirals & Antifungals",
        indication: "HSV encephalitis, severe mucocutaneous HSV, disseminated VZV",
        usualDose: "5–10 mg/kg IV q8h (or 200–800 mg PO 3–5x/day)",
        adjustments: [
            {
                crclRangeLabel: "CrCl > 50 mL/min",
                minCrCl: 50.1,
                maxCrCl: 9999,
                dose: "5–10 mg/kg (or 10 mg/kg for encephalitis)",
                interval: "Every 8 hours",
                notes: "Maintain vigorous IV hydration to prevent intratubular crystal precipitation.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 25–50 mL/min",
                minCrCl: 25,
                maxCrCl: 50,
                dose: "5–10 mg/kg",
                interval: "Every 12 hours",
                notes: "Infuse slowly over at least 1 hour.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 10–24 mL/min",
                minCrCl: 10,
                maxCrCl: 24.9,
                dose: "5–10 mg/kg",
                interval: "Every 24 hours",
                notes: "Reduce frequency to avoid neurotoxicity (hallucinations, tremors, encephalopathy).",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 10 mL/min",
                minCrCl: 0,
                maxCrCl: 9.9,
                dose: "2.5–5 mg/kg",
                interval: "Every 24 hours",
                notes: "High risk of crystallization and CNS accumulation.",
                status: "caution",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "2.5–5 mg/kg IV q24h; administer dose immediately following hemodialysis session (approx 60% removed during 6h HD).",
            crrt: "5–7.5 mg/kg IV q12–24h with aggressive monitoring.",
        },
        clinicalPearls: [
            "Always co-prescribe adequate intravenous fluids (e.g., 0.9% Normal Saline) to maintain urine output > 100 mL/h.",
            "Use Ideal Body Weight (IBW) in obese patients to prevent acute overdosing.",
        ],
        criticalWarning: "Acute renal injury via intratubular acyclovir crystallization if infused rapidly without hydration.",
        reference: "Acyclovir US FDA Prescribing Information. GlaxoSmithKline / FDA.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/018603s040lbl.pdf",
        lastReviewed: "2024 Q3",
    },
    {
        id: "fluconazole",
        name: "Fluconazole",
        brandName: "Diflucan",
        category: "Antivirals & Antifungals",
        indication: "Candidemia, cryptococcal meningitis, mucosal candidiasis",
        usualDose: "200–400 mg IV/PO q24h (Loading dose: 400–800 mg on Day 1)",
        adjustments: [
            {
                crclRangeLabel: "CrCl > 50 mL/min",
                minCrCl: 50.1,
                maxCrCl: 9999,
                dose: "100% of standard dose (200–400 mg)",
                interval: "Every 24 hours",
                notes: "Single day 1 loading dose of double the maintenance dose recommended.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 21–50 mL/min",
                minCrCl: 21,
                maxCrCl: 50,
                dose: "50% of standard dose (100–200 mg)",
                interval: "Every 24 hours",
                notes: "Full loading dose on Day 1, followed by 50% maintenance.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 11–20 mL/min",
                minCrCl: 11,
                maxCrCl: 20.9,
                dose: "25% to 50% of standard dose (50–100 mg)",
                interval: "Every 24 hours",
                notes: "Full loading dose on Day 1.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl ≤ 10 mL/min",
                minCrCl: 0,
                maxCrCl: 10.9,
                dose: "25% of standard dose (50–100 mg)",
                interval: "Every 24 to 48 hours",
                notes: "Monitor liver function enzymes and QTc.",
                status: "caution",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "100% regular dose administered after each HD session (hemodialysis clears ~50% of systemic drug in 3 hours).",
            crrt: "400–800 mg IV loading dose, then 200–400 mg IV q24h (cleared substantially by CRRT).",
        },
        clinicalPearls: [
            "80% excreted unchanged by the kidneys; excellent urinary tract penetration makes it the antifungal of choice for Candida cystitis.",
        ],
        reference: "Diflucan (fluconazole) US FDA Prescribing Information. Pfizer Inc.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2019/019949s064lbl.pdf",
        lastReviewed: "2024 Q4",
    },
    {
        id: "apixaban",
        name: "Apixaban",
        brandName: "Eliquis",
        category: "Anticoagulants",
        indication: "Nonvalvular Atrial Fibrillation (NVAF) stroke prevention, DVT/PE treatment",
        usualDose: "NVAF: 5 mg PO BID. (DVT/PE: 10 mg BID x 7 days, then 5 mg BID)",
        adjustments: [
            {
                crclRangeLabel: "Standard Dose (CrCl ≥ 15 mL/min with < 2 dose-reduction criteria)",
                minCrCl: 15,
                maxCrCl: 9999,
                dose: "5 mg PO",
                interval: "Every 12 hours (BID)",
                notes: "Reduce to 2.5 mg BID ONLY if patient meets ≥ 2 of: Age ≥ 80 yrs, Weight ≤ 60 kg, or Serum Creatinine ≥ 1.5 mg/dL.",
                status: "safe",
            },
            {
                crclRangeLabel: "Dose-Reduction Criteria Met (≥2 of Age ≥80, Wt ≤60kg, SCr ≥1.5)",
                minCrCl: 15,
                maxCrCl: 9999,
                dose: "2.5 mg PO",
                interval: "Every 12 hours (BID)",
                notes: "Validated in ARISTOTLE trial to lower major bleeding risk while maintaining stroke protection.",
                status: "safe",
            },
            {
                crclRangeLabel: "ESRD on Maintenance Hemodialysis (US FDA Labeling)",
                minCrCl: 0,
                maxCrCl: 14.9,
                dose: "5 mg PO BID (or 2.5 mg BID if Age ≥ 80 or Weight ≤ 60 kg)",
                interval: "Every 12 hours (BID)",
                notes: "FDA approved for HD based on PK data; European guidelines (EMA) suggest avoiding if CrCl < 15 mL/min.",
                status: "monitored",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "5 mg BID (or 2.5 mg BID if age ≥80 OR wt ≤60 kg). Not significantly dialyzable.",
            crrt: "Data limited; cautiously consider 2.5 mg BID or unfractionated heparin bridge.",
        },
        clinicalPearls: [
            "Only 27% renal elimination (lowest renal dependence among modern DOACs).",
            "CrCl alone does NOT trigger dose reduction in AFib unless accompanied by age ≥ 80 or weight ≤ 60 kg.",
        ],
        criticalWarning: "Boxed warning: Premature discontinuation increases risk of thrombotic events. Epidural/spinal hematoma risk.",
        reference: "Eliquis (apixaban) US FDA Prescribing Information. Bristol-Myers Squibb / Pfizer.",
        source: "FDA Label / ARISTOTLE",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/202155s036lbl.pdf",
        lastReviewed: "2024 Q4",
    },
    {
        id: "rivaroxaban",
        name: "Rivaroxaban",
        brandName: "Xarelto",
        category: "Anticoagulants",
        indication: "NVAF stroke prophylaxis, DVT/PE treatment, CAD/PAD vascular protection",
        usualDose: "NVAF: 20 mg PO once daily with evening meal (DVT/PE: 15 mg BID x21d then 20 mg daily)",
        adjustments: [
            {
                crclRangeLabel: "CrCl > 50 mL/min",
                minCrCl: 50.1,
                maxCrCl: 9999,
                dose: "20 mg PO once daily with food",
                interval: "Every 24 hours (with dinner)",
                notes: "Food co-administration increases absorption bioavailability of 15mg/20mg tablets to ~100%.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 15–50 mL/min",
                minCrCl: 15,
                maxCrCl: 50,
                dose: "15 mg PO once daily with food",
                interval: "Every 24 hours (with dinner)",
                notes: "DVT/PE Treatment: Avoid if CrCl < 30 mL/min per package insert.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 15 mL/min",
                minCrCl: 0,
                maxCrCl: 14.9,
                dose: "AVOID USE / Contraindicated",
                interval: "Do not use",
                notes: "Significant drug bioaccumulation and excessive bleeding risks.",
                status: "contraindicated",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "Avoid use in hemodialysis (high protein binding > 95%, not dialyzable; unproven benefit-risk profile).",
            crrt: "Avoid use; transition to unfractionated heparin.",
        },
        clinicalPearls: [
            "36% eliminated unchanged by kidneys. 20 mg and 15 mg tablets must always be taken with a substantial meal.",
        ],
        criticalWarning: "Avoid in patients with CrCl < 15 mL/min due to lack of clinical safety trial data.",
        reference: "Xarelto (rivaroxaban) US FDA Prescribing Information. Janssen Pharmaceuticals.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/022406s041lbl.pdf",
        lastReviewed: "2024 Q3",
    },
    {
        id: "enoxaparin",
        name: "Enoxaparin",
        brandName: "Lovenox",
        category: "Anticoagulants",
        indication: "VTE prophylaxis, acute DVT/PE treatment, acute coronary syndromes (NSTEMI/STEMI)",
        usualDose: "DVT Tx: 1 mg/kg SC q12h (or 1.5 mg/kg q24h). Prophylaxis: 40 mg SC q24h (or 30 mg SC q12h)",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 30 mL/min",
                minCrCl: 30,
                maxCrCl: 9999,
                dose: "Standard Dosing (Tx: 1 mg/kg q12h; Prophylaxis: 40 mg q24h)",
                interval: "Every 12 to 24 hours",
                notes: "Standard dosing.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl < 30 mL/min (Severe Renal Impairment)",
                minCrCl: 0,
                maxCrCl: 29.9,
                dose: "Treatment: 1 mg/kg SC once daily. Prophylaxis: 30 mg SC once daily",
                interval: "Every 24 hours (q24h)",
                notes: "Dosing frequency reduced to every 24 hours. Monitor peak anti-Xa activity (target 0.5–1.0 IU/mL for q12h, 1.0–2.0 for q24h) 4 hours post-dose.",
                status: "caution",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "Avoid in ESRD on HD due to unpredictable bioaccumulation and major hemorrhage. Unfractionated heparin (UFH) preferred.",
            crrt: "Use with caution with daily anti-Xa monitoring, or switch to UFH.",
        },
        clinicalPearls: [
            "Bioaccumulates significantly when CrCl < 30 mL/min. Unfractionated heparin (UFH) is safer in acute kidney failure.",
        ],
        criticalWarning: "Epidural or spinal hematomas causing long-term or permanent paralysis in neuraxial anesthesia.",
        reference: "Lovenox (enoxaparin sodium) US FDA Prescribing Information. Sanofi-Aventis.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/020164s129lbl.pdf",
        lastReviewed: "2024 Q4",
    },
    {
        id: "metformin",
        name: "Metformin",
        brandName: "Glucophage",
        category: "Endocrine & Diabetes",
        indication: "Type 2 Diabetes Mellitus glycemic management",
        usualDose: "500 mg – 1000 mg PO BID (Max 2000–2550 mg/day)",
        adjustments: [
            {
                crclRangeLabel: "eGFR / CrCl ≥ 60 mL/min",
                minCrCl: 60,
                maxCrCl: 9999,
                dose: "500 mg – 1000 mg PO BID (Max 2000–2550 mg/day)",
                interval: "Every 12 hours (with meals)",
                notes: "Monitor eGFR at least annually.",
                status: "safe",
            },
            {
                crclRangeLabel: "eGFR / CrCl 45–59 mL/min",
                minCrCl: 45,
                maxCrCl: 59.9,
                dose: "Max 1500–2000 mg/day in divided doses",
                interval: "Every 12 hours",
                notes: "Monitor renal function every 3 to 6 months.",
                status: "safe",
            },
            {
                crclRangeLabel: "eGFR / CrCl 30–44 mL/min",
                minCrCl: 30,
                maxCrCl: 44.9,
                dose: "Max 500–1000 mg/day. DO NOT initiate new therapy",
                interval: "Every 24 hours (with evening meal)",
                notes: "If already on therapy, reduce maximum dose by 50%. Assess risk/benefit balance closely.",
                status: "caution",
            },
            {
                crclRangeLabel: "eGFR / CrCl < 30 mL/min",
                minCrCl: 0,
                maxCrCl: 29.9,
                dose: "CONTRAINDICATED",
                interval: "Discontinue immediately",
                notes: "High risk of fatal Metformin-Associated Lactic Acidosis (MALA).",
                status: "contraindicated",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "CONTRAINDICATED. (However, hemodialysis effectively removes metformin and corrects acidosis during MALA overdose emergencies).",
            crrt: "CONTRAINDICATED.",
        },
        clinicalPearls: [
            "Withhold metformin at the time of or prior to iodinated contrast imaging in patients with eGFR 30–60 mL/min or liver disease; re-evaluate eGFR 48 hours post-procedure.",
        ],
        criticalWarning: "Boxed Warning: Metformin-associated lactic acidosis (MALA) is a medical emergency with high mortality (>30%).",
        reference: "FDA Drug Safety Communication: FDA revises warnings regarding use of metformin in certain patients with reduced kidney function.",
        source: "FDA Safety Alert / ADA",
        link: "https://www.fda.gov/drugs/drug-safety-and-availability/fda-drug-safety-communication-fda-revises-warnings-regarding-use-diabetes-medicine-metformin-certain",
        lastReviewed: "2024 Q3",
    },
    {
        id: "gabapentin",
        name: "Gabapentin",
        brandName: "Neurontin",
        category: "Neurology & Analgesics",
        indication: "Postherpetic neuralgia, neuropathic pain, partial onset seizures",
        usualDose: "300 mg – 600 mg PO TID (Max 1800–3600 mg/day in normal kidney function)",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 60 mL/min",
                minCrCl: 60,
                maxCrCl: 9999,
                dose: "300 mg – 1200 mg TID (Max 3600 mg/day)",
                interval: "Three times daily (TID)",
                notes: "Standard titration.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 30–59 mL/min",
                minCrCl: 30,
                maxCrCl: 59.9,
                dose: "200 mg – 700 mg BID (Max 1400 mg/day)",
                interval: "Twice daily (BID)",
                notes: "Titrate slowly to avoid excessive sedation and ataxia.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl 15–29 mL/min",
                minCrCl: 15,
                maxCrCl: 29.9,
                dose: "200 mg – 700 mg once daily (Max 700 mg/day)",
                interval: "Once daily (QD)",
                notes: "Administer at bedtime.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 15 mL/min",
                minCrCl: 0,
                maxCrCl: 14.9,
                dose: "100 mg – 300 mg once daily (Max 300 mg/day)",
                interval: "Once daily (or every other day)",
                notes: "Dose proportionate to measured CrCl.",
                status: "monitored",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "100–300 mg post-dialysis maintenance dose after every 4 hours of HD, with initial loading dose 300–400 mg.",
            crrt: "200–300 mg PO q24h.",
        },
        clinicalPearls: [
            "Gabapentin is eliminated 100% renally without metabolic breakdown. Overdosing causes severe myoclonus, sedation, and coma.",
        ],
        criticalWarning: "Respiratory depression risk increased when combined with opioids or central depressants.",
        reference: "Neurontin (gabapentin) US FDA Prescribing Information. Pfizer / Viatris.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2020/020235s068,020882s051,021129s049lbl.pdf",
        lastReviewed: "2024 Q4",
    },
    {
        id: "allopurinol",
        name: "Allopurinol",
        brandName: "Zyloprim",
        category: "Rheumatology & Gout",
        indication: "Gout flare prevention, hyperuricemia, tumor lysis syndrome",
        usualDose: "100 mg – 300 mg PO once daily (titrated to target serum urate < 6 mg/dL; max 800 mg/day)",
        adjustments: [
            {
                crclRangeLabel: "CrCl > 50 mL/min",
                minCrCl: 50.1,
                maxCrCl: 9999,
                dose: "Start 100 mg/day; titrate upward gradually by 100 mg/month",
                interval: "Every 24 hours",
                notes: "ACR 2020 Guidelines: Starting dose ≤ 100 mg/day is strongly recommended for all patients to avoid Allopurinol Hypersensitivity Syndrome (AHS).",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 20–50 mL/min",
                minCrCl: 20,
                maxCrCl: 50,
                dose: "Start ≤ 50–100 mg/day; titrate upward gradually (Max 200–300 mg/day)",
                interval: "Every 24 hours",
                notes: "Safe to titrate above historical thresholds if serum urate remains > 6 mg/dL with careful monitoring for rash/AHS.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl 10–19 mL/min",
                minCrCl: 10,
                maxCrCl: 19.9,
                dose: "Start 50 mg/day or 100 mg every other day (Max 100 mg/day)",
                interval: "Every 24 to 48 hours",
                notes: "Active metabolite oxypurinol is renally eliminated and accumulates in CKD.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 10 mL/min",
                minCrCl: 0,
                maxCrCl: 9.9,
                dose: "50 mg every 48 to 72 hours (or 50 mg post-HD)",
                interval: "Every 48 to 72 hours",
                notes: "Monitor closely for skin eruptions, eosinophilia, and liver function changes.",
                status: "caution",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "50–100 mg PO administered immediately after each HD session (oxypurinol is dialyzable).",
            crrt: "100 mg PO q24h with serum urate monitoring.",
        },
        clinicalPearls: [
            "Test HLA-B*5801 allele prior to initiation in patients of Southeast Asian, African American, or Han Chinese descent.",
            "Allopurinol Hypersensitivity Syndrome (AHS: DRESS / Stevens-Johnson syndrome) is significantly higher in renal impairment.",
        ],
        reference: "FitzGerald JD, et al. 2020 American College of Rheumatology Guideline for the Management of Gout. Arthritis Care Res. 2020;72(6):744-760.",
        source: "ACR 2020 Guidelines",
        link: "https://onlinelibrary.wiley.com/doi/10.1002/art.41247",
        lastReviewed: "2024 Q4",
    },
    {
        id: "colchicine",
        name: "Colchicine",
        brandName: "Colcrys",
        category: "Rheumatology & Gout",
        indication: "Acute gout flare treatment and prophylaxis, Familial Mediterranean Fever",
        usualDose: "Acute Flare: 1.2 mg PO at first sign, then 0.6 mg 1 hour later (1.8 mg total). Prophylaxis: 0.6 mg daily or BID",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 50 mL/min",
                minCrCl: 50,
                maxCrCl: 9999,
                dose: "Flare: 1.2 mg then 0.6 mg 1h later. Prophylaxis: 0.6 mg once or twice daily",
                interval: "As indicated",
                notes: "Standard dosing.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 30–49 mL/min",
                minCrCl: 30,
                maxCrCl: 49.9,
                dose: "Flare: Standard dose, but do NOT repeat course within 14 days. Prophylaxis: 0.3 mg daily",
                interval: "Every 24 hours",
                notes: "Observe for neuromyopathy and diarrhea.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl 15–29 mL/min",
                minCrCl: 15,
                maxCrCl: 29.9,
                dose: "Flare: Standard dose, but do NOT repeat within 14 days. Prophylaxis: 0.3 mg every other day",
                interval: "Every 48 hours",
                notes: "High risk of colchicine toxicity (rhabdomyolysis, bone marrow suppression).",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 15 mL/min / Dialysis",
                minCrCl: 0,
                maxCrCl: 14.9,
                dose: "Prophylaxis CONTRAINDICATED. Flare: 0.3 mg single dose max, do NOT repeat within 14 days",
                interval: "Single dose only",
                notes: "Severe life-threatening toxicity reported in ESRD/dialysis patients.",
                status: "contraindicated",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "Not dialyzable (large volume of distribution). Prophylaxis is contraindicated. Acute flare: Max 0.3 mg single dose.",
            crrt: "Avoid unless absolute necessity; monitor for severe neuromyopathy.",
        },
        clinicalPearls: [
            "Co-administration of colchicine with strong CYP3A4 inhibitors (clarithromycin, ketoconazole) or P-gp inhibitors in renal impairment is CONTRAINDICATED and has caused fatal overdoses.",
        ],
        criticalWarning: "Fatal toxicity can occur in patients with renal impairment receiving standard doses with CYP3A4/P-gp inhibitors.",
        reference: "Colcrys (colchicine) US FDA Prescribing Information. Takeda Pharmaceuticals.",
        source: "FDA Label",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2014/022352s016lbl.pdf",
        lastReviewed: "2024 Q3",
    },
    {
        id: "digoxin",
        name: "Digoxin",
        brandName: "Lanoxin",
        category: "Cardiovascular",
        indication: "Heart failure with reduced ejection fraction (HFrEF), Atrial fibrillation rate control",
        usualDose: "0.125 mg – 0.25 mg PO/IV once daily (Target serum trough: 0.5–0.9 ng/mL for HF)",
        adjustments: [
            {
                crclRangeLabel: "CrCl ≥ 50 mL/min",
                minCrCl: 50,
                maxCrCl: 9999,
                dose: "0.125 mg – 0.25 mg PO once daily",
                interval: "Every 24 hours",
                notes: "Monitor serum digoxin trough levels 7–14 days after initiation.",
                status: "safe",
            },
            {
                crclRangeLabel: "CrCl 30–49 mL/min",
                minCrCl: 30,
                maxCrCl: 49.9,
                dose: "0.125 mg PO once daily (or 0.0625 mg daily)",
                interval: "Every 24 hours",
                notes: "Target therapeutic trough: 0.5–0.9 ng/mL for HF (higher levels increase all-cause mortality).",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl 10–29 mL/min",
                minCrCl: 10,
                maxCrCl: 29.9,
                dose: "0.0625 mg PO daily or 0.125 mg every other day",
                interval: "Every 24 to 48 hours",
                notes: "Monitor potassium, magnesium, and ECG for digitalis toxicity / arrhythmias.",
                status: "caution",
            },
            {
                crclRangeLabel: "CrCl < 10 mL/min",
                minCrCl: 0,
                maxCrCl: 9.9,
                dose: "0.0625 mg PO 2 to 3 times per week",
                interval: "Every 48 to 72 hours",
                notes: "Very long half-life in anuria (~3.5 to 5 days).",
                status: "monitored",
            },
        ],
        dialysisGuidance: {
            hemodialysis: "0.0625 mg PO given 2–3 times weekly after HD sessions. Not cleared by hemodialysis (tissue distribution Vd ~500 L).",
            crrt: "0.0625 mg to 0.125 mg PO/IV q24–48h with frequent serum trough monitoring.",
        },
        clinicalPearls: [
            "Hypokalemia and hypomagnesemia sensitize the myocardium to digitalis toxicity, triggering ventricular arrhythmias even at normal serum levels.",
        ],
        criticalWarning: "Narrow therapeutic index (HF target 0.5–0.9 ng/mL). Toxicity manifests as nausea, xanthopsia (yellow halos), and AV block.",
        reference: "Lanoxin (digoxin) US FDA Prescribing Information. Covis Pharma / AHA/ACC Guidelines.",
        source: "FDA / AHA Guidelines",
        link: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2016/020405s011lbl.pdf",
        lastReviewed: "2024 Q4",
    },
];

// ─── ANTHROPOMETRICS & RENAL CLEARANCE CALCULATORS ──────────────────

export function calculateIBW(heightInches: number, sex: "male" | "female"): number {
    const base = sex === "male" ? 50.0 : 45.5;
    const diff = heightInches - 60;
    const ibw = base + 2.3 * diff;
    return Math.max(ibw, sex === "male" ? 50 : 45.5);
}

export function calculateAdjBW(actualKg: number, ibwKg: number): number {
    return ibwKg + 0.4 * (actualKg - ibwKg);
}

export function calculateBMI(weightKg: number, heightCm: number): number {
    if (heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function calculateCrCl(
    age: number,
    weightKg: number,
    scrMgDl: number,
    sex: "male" | "female"
): number {
    if (age <= 0 || weightKg <= 0 || scrMgDl <= 0) return 0;
    let crcl = ((140 - age) * weightKg) / (72 * scrMgDl);
    if (sex === "female") crcl *= 0.85;
    return Math.round(crcl * 10) / 10;
}

export function calculateCKDEPI2021(
    age: number,
    scrMgDl: number,
    sex: "male" | "female"
): number {
    if (age <= 0 || scrMgDl <= 0) return 0;
    const kappa = sex === "female" ? 0.7 : 0.9;
    const alpha = sex === "female" ? -0.241 : -0.302;
    const minRatio = Math.min(scrMgDl / kappa, 1);
    const maxRatio = Math.max(scrMgDl / kappa, 1);
    const sexMultiplier = sex === "female" ? 1.012 : 1.0;

    const egfr =
        142 *
        Math.pow(minRatio, alpha) *
        Math.pow(maxRatio, -1.2) *
        Math.pow(0.9938, age) *
        sexMultiplier;

    return Math.round(egfr * 10) / 10;
}

export function getKDIGOStage(egfr: number): {
    stage: string;
    description: string;
    badgeStyle: string;
} {
    if (egfr >= 90) return { stage: "G1", description: "Normal or High (≥ 90 mL/min/1.73m²)", badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    if (egfr >= 60) return { stage: "G2", description: "Mildly Decreased (60–89 mL/min/1.73m²)", badgeStyle: "bg-teal-100 text-teal-800 border-teal-300" };
    if (egfr >= 45) return { stage: "G3a", description: "Mild to Moderate (45–59 mL/min/1.73m²)", badgeStyle: "bg-amber-100 text-amber-800 border-amber-300" };
    if (egfr >= 30) return { stage: "G3b", description: "Moderate to Severe (30–44 mL/min/1.73m²)", badgeStyle: "bg-orange-100 text-orange-800 border-orange-300" };
    if (egfr >= 15) return { stage: "G4", description: "Severely Decreased (15–29 mL/min/1.73m²)", badgeStyle: "bg-rose-100 text-rose-800 border-rose-300" };
    return { stage: "G5", description: "Kidney Failure / ESRD (< 15 mL/min/1.73m²)", badgeStyle: "bg-red-100 text-red-900 border-red-300 font-black" };
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────

export default function RenalDosingAdjuster() {
    // Patient Form States
    const [age, setAge] = useState<string>("68");
    const [sex, setSex] = useState<"male" | "female">("male");
    const [weightInput, setWeightInput] = useState<string>("84");
    const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
    const [heightInput, setHeightInput] = useState<string>("176");
    const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
    const [scrInput, setScrInput] = useState<string>("1.6");
    const [scrUnit, setScrUnit] = useState<"mg/dL" | "umol/L">("mg/dL");

    // Weight Calculation Method: "auto" | "actual" | "ibw" | "adjbw"
    const [weightMethod, setWeightMethod] = useState<"auto" | "actual" | "ibw" | "adjbw">("auto");

    // Drug Selection & Search States
    const [selectedDrugId, setSelectedDrugId] = useState<string>("vancomycin");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<DrugCategory>("All");
    const [copiedNote, setCopiedNote] = useState<boolean>(false);
    const [showFormulas, setShowFormulas] = useState<boolean>(false);

    // Standardized Unit Normalizations
    const numAge = parseFloat(age) || 0;
    const rawWeight = parseFloat(weightInput) || 0;
    const rawHeight = parseFloat(heightInput) || 0;
    const rawScr = parseFloat(scrInput) || 0;

    const weightKg = useMemo(() => {
        if (weightUnit === "lbs") return Math.round(rawWeight * 0.45359237 * 10) / 10;
        return rawWeight;
    }, [rawWeight, weightUnit]);

    const heightInches = useMemo(() => {
        if (heightUnit === "cm") return rawHeight / 2.54;
        return rawHeight;
    }, [rawHeight, heightUnit]);

    const heightCm = useMemo(() => {
        if (heightUnit === "in") return rawHeight * 2.54;
        return rawHeight;
    }, [rawHeight, heightUnit]);

    const scrMgDl = useMemo(() => {
        if (scrUnit === "umol/L") return Math.round((rawScr / 88.4) * 100) / 100;
        return rawScr;
    }, [rawScr, scrUnit]);

    // Anthropometrics
    const ibwKg = useMemo(() => {
        if (heightInches <= 0) return 0;
        return Math.round(calculateIBW(heightInches, sex) * 10) / 10;
    }, [heightInches, sex]);

    const adjBwKg = useMemo(() => {
        if (weightKg <= 0 || ibwKg <= 0) return 0;
        return Math.round(calculateAdjBW(weightKg, ibwKg) * 10) / 10;
    }, [weightKg, ibwKg]);

    const bmi = useMemo(() => calculateBMI(weightKg, heightCm), [weightKg, heightCm]);

    // Auto Weight Heuristic
    const { autoRecommendedMethod, autoReason } = useMemo(() => {
        if (!weightKg || !ibwKg) return { autoRecommendedMethod: "actual", autoReason: "Standard weight" };
        if (weightKg < ibwKg) {
            return {
                autoRecommendedMethod: "actual" as const,
                autoReason: "Underweight (TBW < IBW): Actual total body weight recommended to prevent underdosing.",
            };
        }
        if (weightKg > 1.2 * ibwKg) {
            return {
                autoRecommendedMethod: "adjbw" as const,
                autoReason: `Patient is >120% of IBW (BMI ${bmi} kg/m²). Adjusted Body Weight (AdjBW 40%) recommended to avoid overdosing.`,
            };
        }
        return {
            autoRecommendedMethod: "ibw" as const,
            autoReason: "Normal Weight: Ideal Body Weight (IBW) standard for Cockcroft-Gault estimation.",
        };
    }, [weightKg, ibwKg, bmi]);

    const effectiveWeightUsed = useMemo(() => {
        const method = weightMethod === "auto" ? autoRecommendedMethod : weightMethod;
        if (method === "actual") return weightKg;
        if (method === "ibw") return ibwKg || weightKg;
        if (method === "adjbw") return adjBwKg || weightKg;
        return weightKg;
    }, [weightMethod, autoRecommendedMethod, weightKg, ibwKg, adjBwKg]);

    const effectiveWeightLabel = useMemo(() => {
        const method = weightMethod === "auto" ? autoRecommendedMethod : weightMethod;
        if (method === "actual") return `Actual TBW (${weightKg} kg)`;
        if (method === "ibw") return `Ideal Body Weight (${ibwKg} kg)`;
        if (method === "adjbw") return `Adjusted Body Weight (${adjBwKg} kg)`;
        return `${effectiveWeightUsed} kg`;
    }, [weightMethod, autoRecommendedMethod, weightKg, ibwKg, adjBwKg, effectiveWeightUsed]);

    // CrCl & eGFR
    const calculatedCrCl = useMemo(() => {
        if (!numAge || !effectiveWeightUsed || !scrMgDl) return null;
        return calculateCrCl(numAge, effectiveWeightUsed, scrMgDl, sex);
    }, [numAge, effectiveWeightUsed, scrMgDl, sex]);

    const calculatedEGFR = useMemo(() => {
        if (!numAge || !scrMgDl) return null;
        return calculateCKDEPI2021(numAge, scrMgDl, sex);
    }, [numAge, scrMgDl, sex]);

    const kdigoStage = useMemo(() => {
        if (calculatedEGFR === null) return null;
        return getKDIGOStage(calculatedEGFR);
    }, [calculatedEGFR]);

    // Drug Filtering
    const categories: DrugCategory[] = [
        "All",
        "Antibiotics",
        "Antivirals & Antifungals",
        "Anticoagulants",
        "Cardiovascular",
        "Endocrine & Diabetes",
        "Neurology & Analgesics",
        "Rheumatology & Gout",
    ];

    const filteredDrugs = useMemo(() => {
        return renalDrugsDatabase.filter((drug) => {
            const matchesCategory =
                selectedCategory === "All" || drug.category === selectedCategory;
            const searchLower = searchTerm.toLowerCase().trim();
            const matchesSearch =
                !searchLower ||
                drug.name.toLowerCase().includes(searchLower) ||
                (drug.brandName && drug.brandName.toLowerCase().includes(searchLower)) ||
                drug.indication.toLowerCase().includes(searchLower) ||
                drug.category.toLowerCase().includes(searchLower);
            return matchesCategory && matchesSearch;
        });
    }, [searchTerm, selectedCategory]);

    const selectedDrug = useMemo(() => {
        return renalDrugsDatabase.find((d) => d.id === selectedDrugId) || renalDrugsDatabase[0];
    }, [selectedDrugId]);

    // Recommendation Matching
    const currentRecommendation = useMemo(() => {
        if (!selectedDrug || calculatedCrCl === null) return null;
        for (const tier of selectedDrug.adjustments) {
            if (calculatedCrCl >= tier.minCrCl && calculatedCrCl <= tier.maxCrCl) {
                return tier;
            }
        }
        return selectedDrug.adjustments[0];
    }, [selectedDrug, calculatedCrCl]);

    // Copy Chart Note Handler
    const handleCopyChartNote = useCallback(() => {
        if (!selectedDrug || calculatedCrCl === null || !currentRecommendation) return;

        const noteText = `=== CLINICAL RENAL DOSING CONSULTATION NOTE ===
PATIENT BIOMETRICS:
- Age: ${numAge} yrs | Biological Sex: ${sex.toUpperCase()}
- Weight: ${weightKg} kg (TBW) | IBW: ${ibwKg} kg | AdjBW: ${adjBwKg} kg | BMI: ${bmi} kg/m²
- Serum Creatinine: ${scrMgDl} mg/dL (${rawScr} ${scrUnit})
- Cockcroft-Gault CrCl: ${calculatedCrCl} mL/min [Based on ${effectiveWeightLabel}]
- CKD-EPI (2021) eGFR: ${calculatedEGFR ?? "N/A"} mL/min/1.73m² (${kdigoStage?.stage ?? "N/A"})

MEDICATION: ${selectedDrug.name} (${selectedDrug.brandName ?? "Generic"})
- Category: ${selectedDrug.category}
- Usual Normal Dosing: ${selectedDrug.usualDose}

RENAL RECOMMENDATION:
- CrCl Range: ${currentRecommendation.crclRangeLabel}
- Recommended Dose: ${currentRecommendation.dose}
- Dosing Interval: ${currentRecommendation.interval}
- Clinical Notes: ${currentRecommendation.notes ?? "Standard administration"}
${selectedDrug.dialysisGuidance ? `- HD / CRRT Guidance: HD: ${selectedDrug.dialysisGuidance.hemodialysis ?? "N/A"} | CRRT: ${selectedDrug.dialysisGuidance.crrt ?? "N/A"}` : ""}

OFFICIAL REFERENCE:
- ${selectedDrug.source} (${selectedDrug.reference})
- Verified Review: ${selectedDrug.lastReviewed}

DISCLAIMER: Clinical decision support tool. Verify with official FDA package inserts and institutional guidelines before prescribing.`;

        navigator.clipboard.writeText(noteText);
        setCopiedNote(true);
        setTimeout(() => setCopiedNote(false), 3000);
    }, [
        selectedDrug,
        calculatedCrCl,
        currentRecommendation,
        numAge,
        sex,
        weightKg,
        ibwKg,
        adjBwKg,
        bmi,
        scrMgDl,
        rawScr,
        scrUnit,
        effectiveWeightLabel,
        calculatedEGFR,
        kdigoStage,
    ]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-teal-500 selection:text-white">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* ─── OFFICIAL HEADER WITH PHARMAWALLAH GRADIENT ─────────────── */}
                <header className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                    {/* Top gradient accent line */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase">
                                <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                                Advanced Clinical Pharmacopeia • 2024–2026 Guidelines
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                                Renal Dosing Adjuster
                            </h1>
                            <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
                                Accurate renal clearance calculations (Cockcroft-Gault CrCl & CKD-EPI 2021 eGFR) paired with
                                tier-matched drug adjustments from FDA package inserts, ASHP/IDSA, and KDIGO guidelines.
                            </p>
                        </div>

                        {/* Top quick badges */}
                        <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
                                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>FDA / KDIGO 2024 Aligned</span>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700">
                                <HeartPulse className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>IBW & AdjBW Auto-Selection</span>
                            </div>
                        </div>
                    </div>

                    {/* Prominent Clinical Disclaimer Banner */}
                    <div className="mt-6 bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 text-xs sm:text-sm">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <strong className="font-bold text-amber-950 block sm:inline mr-1">
                                Mandatory Clinical Notice & Disclaimer:
                            </strong>
                            This system is designed for healthcare professionals, clinical pharmacists, and medical education.
                            Dosing recommendations must always be verified against institutional antibiograms, current FDA/EMA package inserts,
                            and specialist clinical judgment prior to dispensing or patient administration.
                        </div>
                    </div>
                </header>

                {/* ─── MAIN WORKSPACE GRID ───────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT COLUMN: PATIENT BIOMETRICS & RENAL ENGINE (5 COLS) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600" />
                                    Patient Biometrics
                                </h2>
                                <button
                                    onClick={() => {
                                        setAge("65");
                                        setSex("male");
                                        setWeightInput("70");
                                        setHeightInput("175");
                                        setScrInput("1.2");
                                    }}
                                    className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium transition"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
                                </button>
                            </div>

                            {/* Biometric Fields */}
                            <div className="space-y-4">
                                {/* Age & Sex */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Age (Years)
                                        </label>
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="e.g. 68"
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Biological Sex
                                        </label>
                                        <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                            <button
                                                type="button"
                                                onClick={() => setSex("male")}
                                                className={`py-1.5 text-xs font-bold rounded-lg transition ${sex === "male"
                                                    ? "bg-white text-blue-700 shadow-sm"
                                                    : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                            >
                                                Male
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSex("female")}
                                                className={`py-1.5 text-xs font-bold rounded-lg transition ${sex === "female"
                                                    ? "bg-white text-blue-700 shadow-sm"
                                                    : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                            >
                                                Female
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Weight */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Total Body Weight (TBW)
                                        </label>
                                        <div className="flex items-center gap-1 text-[11px]">
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit("kg")}
                                                className={`px-2 py-0.5 rounded font-bold ${weightUnit === "kg"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                kg
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setWeightUnit("lbs")}
                                                className={`px-2 py-0.5 rounded font-bold ${weightUnit === "lbs"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                lbs
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={weightInput}
                                            onChange={(e) => setWeightInput(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            {weightUnit}
                                        </span>
                                    </div>
                                </div>

                                {/* Height */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Height
                                        </label>
                                        <div className="flex items-center gap-1 text-[11px]">
                                            <button
                                                type="button"
                                                onClick={() => setHeightUnit("cm")}
                                                className={`px-2 py-0.5 rounded font-bold ${heightUnit === "cm"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                cm
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setHeightUnit("in")}
                                                className={`px-2 py-0.5 rounded font-bold ${heightUnit === "in"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                in
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.5"
                                            value={heightInput}
                                            onChange={(e) => setHeightInput(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            {heightUnit}
                                        </span>
                                    </div>
                                </div>

                                {/* Serum Creatinine */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Serum Creatinine (SCr)
                                        </label>
                                        <div className="flex items-center gap-1 text-[11px]">
                                            <button
                                                type="button"
                                                onClick={() => setScrUnit("mg/dL")}
                                                className={`px-2 py-0.5 rounded font-bold ${scrUnit === "mg/dL"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                mg/dL
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setScrUnit("umol/L")}
                                                className={`px-2 py-0.5 rounded font-bold ${scrUnit === "umol/L"
                                                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                µmol/L
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.05"
                                            value={scrInput}
                                            onChange={(e) => setScrInput(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        />
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                            {scrUnit}
                                        </span>
                                    </div>
                                </div>

                                {/* Body Weight Metrics Readout */}
                                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                                    <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                            IBW (Devine)
                                        </span>
                                        <span className="text-sm font-black text-blue-700">
                                            {ibwKg ? `${ibwKg} kg` : "--"}
                                        </span>
                                    </div>
                                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                            AdjBW (0.4)
                                        </span>
                                        <span className="text-sm font-black text-emerald-700">
                                            {adjBwKg ? `${adjBwKg} kg` : "--"}
                                        </span>
                                    </div>
                                    <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                                        <span className="text-slate-500 block text-[10px] uppercase font-bold">
                                            BMI
                                        </span>
                                        <span className="text-sm font-black text-slate-800">
                                            {bmi ? `${bmi} kg/m²` : "--"}
                                        </span>
                                    </div>
                                </div>

                                {/* Weight Selector for CrCl */}
                                <div className="space-y-1 pt-1">
                                    <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center justify-between">
                                        <span>Cockcroft-Gault Weight Basis:</span>
                                        <span className="text-blue-600 font-bold">{effectiveWeightLabel}</span>
                                    </label>
                                    <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                                        {(
                                            [
                                                { key: "auto", label: "Auto" },
                                                { key: "actual", label: "Actual" },
                                                { key: "ibw", label: "IBW" },
                                                { key: "adjbw", label: "AdjBW" },
                                            ] as const
                                        ).map((tab) => (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() => setWeightMethod(tab.key)}
                                                className={`py-1.5 rounded-lg font-bold transition ${weightMethod === tab.key
                                                    ? "bg-white text-blue-700 shadow-sm"
                                                    : "text-slate-500 hover:text-slate-800"
                                                    }`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                    {weightMethod === "auto" && (
                                        <p className="text-[11px] text-blue-800 bg-blue-50/80 border border-blue-200 p-2.5 rounded-xl leading-snug">
                                            💡 <strong>Auto Weight Guidance:</strong> {autoReason}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Calculated Clearance Cards */}
                            <div className="pt-3 border-t border-slate-100 space-y-3">
                                {/* Cockcroft-Gault CrCl Card */}
                                <div className="bg-gradient-to-r from-blue-50 via-teal-50/40 to-emerald-50 border border-blue-200/80 rounded-2xl p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                                            <Activity className="w-4 h-4 text-blue-600" /> Estimated CrCl (Cockcroft-Gault)
                                        </span>
                                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold">
                                            FDA Standard
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-3xl font-black text-slate-900 tracking-tight">
                                            {calculatedCrCl !== null ? calculatedCrCl : "--"}
                                        </span>
                                        <span className="text-sm font-bold text-slate-500">mL/min</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 mt-1">
                                        Calculated using {effectiveWeightLabel}. Standard for dosing tables.
                                    </p>
                                </div>

                                {/* CKD-EPI eGFR Card */}
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            eGFR (CKD-EPI 2021 Race-Free)
                                        </span>
                                        {kdigoStage && (
                                            <span
                                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${kdigoStage.badgeStyle}`}
                                            >
                                                Stage {kdigoStage.stage}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-2xl font-black text-slate-800">
                                            {calculatedEGFR !== null ? calculatedEGFR : "--"}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500">
                                            mL/min/1.73 m²
                                        </span>
                                    </div>
                                    {kdigoStage && (
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            KDIGO: <strong className="text-slate-700">{kdigoStage.description}</strong>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Expandable Formulas Accordion */}
                            <div className="border-t border-slate-100 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowFormulas(!showFormulas)}
                                    className="w-full flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 py-1 transition"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <BookOpen className="w-3.5 h-3.5" /> Formula Details & CrCl vs eGFR
                                    </span>
                                    {showFormulas ? (
                                        <ChevronUp className="w-4 h-4" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4" />
                                    )}
                                </button>

                                <AnimatePresence>
                                    {showFormulas && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-3 space-y-2.5 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200 overflow-hidden leading-relaxed"
                                        >
                                            <div>
                                                <strong className="text-slate-800 block font-bold mb-0.5">
                                                    Cockcroft-Gault Equation (1976):
                                                </strong>
                                                <code className="text-blue-700 bg-white px-2 py-1 rounded border border-slate-200 block text-[11px] font-mono">
                                                    CrCl = [(140 - Age) × Weight (kg)] / [72 × SCr (mg/dL)] × (0.85 if Female)
                                                </code>
                                            </div>
                                            <div>
                                                <strong className="text-slate-800 block font-bold mb-0.5">
                                                    Devine Formula (IBW):
                                                </strong>
                                                <p className="text-slate-500 text-[11px]">
                                                    Male: 50.0 kg + 2.3 kg/inch &gt; 60 inches | Female: 45.5 kg + 2.3 kg/inch &gt; 60 inches
                                                </p>
                                            </div>
                                            <div>
                                                <strong className="text-slate-800 block font-bold mb-0.5">
                                                    Adjusted Body Weight (AdjBW 40%):
                                                </strong>
                                                <code className="text-blue-700 bg-white px-2 py-1 rounded border border-slate-200 block text-[11px] font-mono">
                                                    AdjBW = IBW + 0.4 × (Actual TBW - IBW)
                                                </code>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: DRUG SELECTION & CLINICAL RECOMMENDATION PANEL (7 COLS) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Drug Search & Filter Card */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Pill className="w-4 h-4 text-emerald-600" />
                                    Renal Pharmacopeia
                                </h2>
                                <span className="text-xs text-slate-500">
                                    {filteredDrugs.length} of {renalDrugsDatabase.length} medications available
                                </span>
                            </div>

                            {/* Search Input */}
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search drugs (e.g. Vancomycin, Zosyn, Apixaban, Metformin, Cefepime)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${selectedCategory === cat
                                            ? "bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-sm"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {/* Medication Horizontal Selector Grid */}
                            <div className="max-h-48 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-200 p-2 rounded-2xl bg-slate-50/50">
                                {filteredDrugs.map((drug) => {
                                    const isSelected = selectedDrug.id === drug.id;
                                    return (
                                        <button
                                            key={drug.id}
                                            type="button"
                                            onClick={() => setSelectedDrugId(drug.id)}
                                            className={`text-left p-3 rounded-xl transition flex flex-col justify-between border ${isSelected
                                                ? "bg-blue-50/90 border-blue-400 text-blue-950 shadow-sm ring-1 ring-blue-400"
                                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-1">
                                                <p className="font-bold text-sm text-slate-900">{drug.name}</p>
                                                {drug.brandName && (
                                                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                                                        {drug.brandName}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-slate-500 truncate mt-1">
                                                {drug.category}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ─── ACTIVE RECOMMENDATION & DOSING MATRIX ───────────────── */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                            {/* Drug Header & Action Bar */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                                            {selectedDrug.category}
                                        </span>
                                        {selectedDrug.brandName && (
                                            <span className="text-xs text-slate-500">
                                                Brand: <strong className="text-slate-800">{selectedDrug.brandName}</strong>
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                                        {selectedDrug.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Indication: {selectedDrug.indication}
                                    </p>
                                </div>

                                <button
                                    onClick={handleCopyChartNote}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white text-xs font-bold transition shadow-sm shrink-0 self-start sm:self-center"
                                >
                                    {copiedNote ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Note Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span>Copy Chart Note</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Active Recommendation Card */}
                            {calculatedCrCl !== null && currentRecommendation ? (
                                <motion.div
                                    key={`${selectedDrug.id}-${currentRecommendation.crclRangeLabel}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`rounded-2xl p-5 sm:p-6 border shadow-sm relative overflow-hidden ${currentRecommendation.status === "contraindicated"
                                        ? "bg-rose-50 border-rose-300"
                                        : currentRecommendation.status === "caution"
                                            ? "bg-amber-50/80 border-amber-300"
                                            : "bg-gradient-to-br from-blue-50/80 via-teal-50/40 to-white border-blue-300"
                                        }`}
                                >
                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-3 h-3 rounded-full animate-pulse ${currentRecommendation.status === "contraindicated"
                                                    ? "bg-rose-500"
                                                    : currentRecommendation.status === "caution"
                                                        ? "bg-amber-500"
                                                        : "bg-emerald-500"
                                                    }`}
                                            />
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                                Active Recommendation (Patient CrCl: {calculatedCrCl} mL/min)
                                            </span>
                                        </div>
                                        <span
                                            className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase border ${currentRecommendation.status === "contraindicated"
                                                ? "bg-rose-100 text-rose-800 border-rose-300"
                                                : currentRecommendation.status === "caution"
                                                    ? "bg-amber-100 text-amber-800 border-amber-300"
                                                    : "bg-emerald-100 text-emerald-800 border-emerald-300"
                                                }`}
                                        >
                                            {currentRecommendation.crclRangeLabel}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                                                Adjusted Dose
                                            </span>
                                            <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                                                {currentRecommendation.dose}
                                            </p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                                                Dosing Interval
                                            </span>
                                            <p className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                                                {currentRecommendation.interval}
                                            </p>
                                        </div>
                                    </div>

                                    {currentRecommendation.notes && (
                                        <div className="mt-4 flex items-start gap-2.5 text-xs text-slate-800 bg-white/90 p-3.5 rounded-xl border border-slate-200">
                                            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                            <p>{currentRecommendation.notes}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-slate-500 text-sm">
                                    Enter patient parameters on the left to activate real-time renal adjustment.
                                </div>
                            )}

                            {/* Critical Clinical Warning */}
                            {selectedDrug.criticalWarning && (
                                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-950 text-xs sm:text-sm">
                                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-rose-900 font-bold block mb-0.5">
                                            Critical Clinical Warning:
                                        </strong>
                                        {selectedDrug.criticalWarning}
                                    </div>
                                </div>
                            )}

                            {/* Complete Dosing Adjustment Matrix Table */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                                    Complete Renal Adjustment Matrix
                                </h4>
                                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                                            <tr>
                                                <th className="py-3 px-4">CrCl Range</th>
                                                <th className="py-3 px-4">Recommended Dose</th>
                                                <th className="py-3 px-4">Interval</th>
                                                <th className="py-3 px-4">Specific Guidance</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedDrug.adjustments.map((adj, idx) => {
                                                const isActive =
                                                    calculatedCrCl !== null &&
                                                    calculatedCrCl >= adj.minCrCl &&
                                                    calculatedCrCl <= adj.maxCrCl;
                                                return (
                                                    <tr
                                                        key={idx}
                                                        className={`transition ${isActive
                                                            ? "bg-blue-50/80 font-bold text-blue-950 border-l-4 border-l-blue-600"
                                                            : "text-slate-700 hover:bg-slate-50"
                                                            }`}
                                                    >
                                                        <td className="py-3 px-4 font-bold whitespace-nowrap">
                                                            <div className="flex items-center gap-1.5">
                                                                {isActive && (
                                                                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                                                                )}
                                                                {adj.crclRangeLabel}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4 font-semibold">{adj.dose}</td>
                                                        <td className="py-3 px-4">{adj.interval}</td>
                                                        <td className="py-3 px-4 text-slate-500 text-[11px] leading-relaxed">
                                                            {adj.notes ?? "Standard administration"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Dialysis (HD & CRRT) Guidance */}
                            {selectedDrug.dialysisGuidance && (
                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                        <Droplet className="w-4 h-4 text-blue-600" />
                                        Renal Replacement Therapy (HD & CRRT)
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                        {selectedDrug.dialysisGuidance.hemodialysis && (
                                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                                <strong className="text-blue-700 block mb-1">
                                                    Intermittent Hemodialysis (HD):
                                                </strong>
                                                <p className="text-slate-600 leading-relaxed">
                                                    {selectedDrug.dialysisGuidance.hemodialysis}
                                                </p>
                                            </div>
                                        )}
                                        {selectedDrug.dialysisGuidance.crrt && (
                                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                                <strong className="text-emerald-700 block mb-1">
                                                    Continuous Renal Replacement (CRRT):
                                                </strong>
                                                <p className="text-slate-600 leading-relaxed">
                                                    {selectedDrug.dialysisGuidance.crrt}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Guideline Citation & Official External Links */}
                            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div>
                                    <p className="text-slate-500 font-bold">
                                        Primary Guideline / Label Reference:
                                    </p>
                                    <p className="text-slate-800 font-semibold">{selectedDrug.reference}</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
                                        {selectedDrug.source}
                                    </span>
                                    {selectedDrug.link && (
                                        <a
                                            href={selectedDrug.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold transition"
                                        >
                                            Official Source <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── FOOTER & REGULATORY DISCLOSURES ───────────────────────── */}
                <footer className="border-t border-slate-200 pt-6 pb-10 text-center text-xs text-slate-500 space-y-2">
                    <p className="max-w-4xl mx-auto leading-relaxed">
                        <strong>Clinical Evidence Summary:</strong> Dosing matrices incorporate criteria from the
                        2024 KDIGO Clinical Practice Guidelines, ASHP/IDSA Consensus Guidelines, and FDA-approved labeling.
                        For pregnant patients, amputees, cirrhotic patients, or those with unstable fluctuating renal function (AKI),
                        standard serum creatinine equations may be inaccurate; direct 24-hour urine collection or cystatin C measurement is advised.
                    </p>
                    <p className="text-slate-400">
                        © 2024–2026 Advanced Renal Decision Support. PharmaWallah Gradient Edition.
                    </p>
                </footer>
            </div>
        </div>
    );
}