"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart,
    Lightbulb,
    X,
    AlertTriangle,
    CheckCircle,
    Clock,
    User,
    Pill,
    FlaskConical,
    Activity,
    ChevronRight,
    RefreshCw,
    SkipForward,
    Star,
    BookOpen,
    Shield,
    Tag,
    MessageCircle,
    Award,
    Zap,
    Flame,
    Trophy,
    Sparkles,
    Home,
    TrendingUp,
    Lock,
    ArrowRight,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface DURAlert {
    alertTitle: string;
    severity: "Moderate" | "Severe" | "Critical";
    description: string;
    correctAction: "override" | "call_doctor";
    rationale: string;
}

interface ShelfItem {
    id: string;
    name: string;
    dose: string;
    form: string;
    isLookAlike: boolean;
}

interface CounselingQ {
    question: string;
    options: string[];
    correctIndex: number;
    rationale: string;
}

interface StudyGuide {
    overview: string;
    pharmacology: string;
    interactionMechanism: string;
    keyTakeaways: string[];
    references?: string;
}

interface PrescriptionCase {
    id: number;
    patientName: string;
    patientDob: string;
    patientAge: number;
    allergies: string[];
    currentMedications: string[];
    avatarSeed: { skin: string; hair: string; shirt: string };
    rxCursiveText: string;
    correctDrug: string;
    correctDose: string;
    correctFrequency: string;
    correctQty: number;
    durAlert: DURAlert;
    shelfItems: ShelfItem[];
    availableAuxiliaryLabels: string[];
    requiredAuxiliaryLabels: string[];
    counseling: CounselingQ[];
    studyGuide: StudyGuide;
    // Gamification extensions
    difficulty: "Easy" | "Medium" | "Hard";
    xp: number;
    timeLimit: number; // seconds
}

// ─── CASE DATA ────────────────────────────────────────────────────────────────
// (Your 6 cases, each now includes difficulty, xp, timeLimit)
const CASES: PrescriptionCase[] = [
    {
        id: 1,
        patientName: "David Miller",
        patientDob: "1973-04-12",
        patientAge: 51,
        allergies: ["Sulfonamides (Sulfa)", "Penicillin"],
        currentMedications: ["Metformin 500 mg BID", "Lisinopril 10 mg QD"],
        avatarSeed: { skin: "#F5CBA7", hair: "#4A235A", shirt: "#2980B9" },
        rxCursiveText: "Bactrim DS\n800/160 mg\nBID × 10 days\nQty: 20 tabs\nDr. A. Torres",
        correctDrug: "Bactrim DS",
        correctDose: "800/160 mg",
        correctFrequency: "BID",
        correctQty: 20,
        durAlert: {
            alertTitle: "CRITICAL ALLERGY — Sulfonamide",
            severity: "Critical",
            description:
                "Patient has a documented ALLERGY to Sulfonamides. Bactrim DS (sulfamethoxazole/trimethoprim) is a sulfonamide antibiotic. Dispensing may cause a life-threatening allergic reaction including anaphylaxis.",
            correctAction: "call_doctor",
            rationale:
                "A Critical sulfa allergy alert MUST NOT be overridden. The prescriber must be contacted to select an alternative antibiotic such as Nitrofurantoin or Fosfomycin.",
        },
        shelfItems: [
            { id: "s1", name: "Bactrim DS", dose: "800/160 mg", form: "Tablet", isLookAlike: false },
            { id: "s2", name: "Bactrim", dose: "400/80 mg", form: "Tablet", isLookAlike: true },
            { id: "s3", name: "Septra DS", dose: "800/160 mg", form: "Tablet", isLookAlike: true },
            { id: "s4", name: "SMX-TMP DS", dose: "800/160 mg", form: "Tablet", isLookAlike: true },
            { id: "s5", name: "Cipro", dose: "500 mg", form: "Tablet", isLookAlike: false },
            { id: "s6", name: "Amoxicillin", dose: "500 mg", form: "Capsule", isLookAlike: false },
        ],
        availableAuxiliaryLabels: [
            "Take with plenty of water",
            "Avoid prolonged sun exposure",
            "Complete the full course",
            "May cause dizziness",
            "Take with food",
            "Keep refrigerated",
            "Shake well before use",
        ],
        requiredAuxiliaryLabels: [
            "Take with plenty of water",
            "Avoid prolonged sun exposure",
            "Complete the full course",
        ],
        counseling: [
            {
                question: "David asks, 'How much water should I drink while taking this antibiotic?' What is the best response?",
                options: [
                    "Just drink normally, water doesn't matter.",
                    "Drink at least 8 full glasses of water daily to prevent kidney stones.",
                    "Limit fluids to avoid stomach upset.",
                    "Only drink water if you feel thirsty.",
                ],
                correctIndex: 1,
                rationale: "Sulfonamides can crystallize in the renal tubules (crystalluria). Adequate hydration (≥8 glasses/day) is essential to maintain high urine flow and prevent nephrotoxicity.",
            },
            {
                question: "David plans a beach vacation next week. What sun-exposure counseling should you provide?",
                options: [
                    "Sun exposure is fine; no special precautions needed.",
                    "Apply sunscreen only if you burn easily.",
                    "Avoid prolonged sun exposure and use SPF 30+ sunscreen; sulfonamides cause photosensitivity.",
                    "Wear a hat only if it is very sunny.",
                ],
                correctIndex: 2,
                rationale: "Sulfonamides are known photosensitizers. Patients should minimize UV exposure, use broad-spectrum SPF ≥30 sunscreen, and wear protective clothing.",
            },
        ],
        studyGuide: {
            overview:
                "David Miller, a 51‑year‑old with a documented sulfonamide allergy, presents with a prescription for Bactrim DS (sulfamethoxazole/trimethoprim). This case tests your ability to identify a critical drug‑allergy interaction and intervene appropriately.",
            pharmacology:
                "Bactrim DS is a combination sulfonamide antibiotic that inhibits folate synthesis in bacteria. However, sulfonamides are known to cause hypersensitivity reactions ranging from rash to Stevens‑Johnson syndrome, especially in patients with prior exposure.",
            interactionMechanism:
                "The patient’s allergy to sulfonamides directly contraindicates Bactrim because cross‑reactivity among sulfonamide drugs is well‑documented. The DUR alert is CRITICAL, meaning the pharmacist must contact the prescriber and must not override the alert under any circumstances.",
            keyTakeaways: [
                "Sulfonamide allergy is a life‑threatening contraindication – always verify allergies before dispensing.",
                "A Critical DUR alert requires prescriber contact; overriding can cause patient harm and professional liability.",
                "Counseling on hydration and photosensitivity is essential for all sulfonamide antibiotics.",
            ],
            references: "Dipiro’s Pharmacotherapy, Chapter 92: Allergic Drug Reactions",
        },
        difficulty: "Easy",
        xp: 40,
        timeLimit: 300,
    },
    {
        id: 2,
        patientName: "Clara Jenkins",
        patientDob: "1959-08-27",
        patientAge: 65,
        allergies: ["Latex", "Aspirin (mild intolerance)"],
        currentMedications: ["Sildenafil (Viagra) 50 mg PRN", "Atorvastatin 40 mg QD", "Amlodipine 5 mg QD"],
        avatarSeed: { skin: "#FAD7A0", hair: "#784212", shirt: "#8E44AD" },
        rxCursiveText: "Imdur (ISMN ER)\n30 mg\nQD\nQty: 30 tabs\nDr. R. Patel",
        correctDrug: "Imdur",
        correctDose: "30 mg",
        correctFrequency: "QD",
        correctQty: 30,
        durAlert: {
            alertTitle: "CRITICAL DDI — Nitrate + PDE5 Inhibitor",
            severity: "Critical",
            description:
                "Patient takes Sildenafil (PDE5 inhibitor). Adding Isosorbide Mononitrate (Imdur), an organic nitrate, creates a potentially fatal synergistic vasodilation. Severe hypotension, syncope, myocardial infarction, or death may result.",
            correctAction: "call_doctor",
            rationale:
                "This is an absolute contraindication. The prescriber must be notified immediately. An alternative anti-anginal agent (e.g., a beta-blocker or calcium channel blocker) must be substituted.",
        },
        shelfItems: [
            { id: "s1", name: "Imdur", dose: "30 mg", form: "ER Tablet", isLookAlike: false },
            { id: "s2", name: "Imdur", dose: "60 mg", form: "ER Tablet", isLookAlike: true },
            { id: "s3", name: "ISMO", dose: "20 mg", form: "Tablet", isLookAlike: true },
            { id: "s4", name: "Monoket", dose: "30 mg", form: "Tablet", isLookAlike: true },
            { id: "s5", name: "Isordil", dose: "10 mg", form: "Tablet", isLookAlike: true },
            { id: "s6", name: "NitroStat", dose: "0.4 mg", form: "SL Tablet", isLookAlike: false },
        ],
        availableAuxiliaryLabels: [
            "Do NOT crush or chew",
            "May cause headache initially",
            "Do not take with erectile dysfunction drugs",
            "Take on empty stomach",
            "Take with food",
            "Keep refrigerated",
            "Avoid grapefruit",
        ],
        requiredAuxiliaryLabels: [
            "Do NOT crush or chew",
            "May cause headache initially",
            "Do not take with erectile dysfunction drugs",
        ],
        counseling: [
            {
                question: "Clara asks why she can't take her sildenafil while on this new heart medication. What is the best explanation?",
                options: [
                    "They have the same active ingredient and would double the dose.",
                    "Both medications lower blood pressure; combining them can cause dangerously low blood pressure leading to fainting or a heart attack.",
                    "Sildenafil increases the metabolism of nitrates, making them less effective.",
                    "There is no real interaction; this is just a precaution.",
                ],
                correctIndex: 1,
                rationale: "Nitrates and PDE5 inhibitors both dilate blood vessels through complementary pathways (cGMP potentiation). Co-administration can cause severe, potentially fatal hypotension. This is an absolute contraindication.",
            },
            {
                question: "Clara's Imdur is an extended-release tablet. What administration instruction is critical?",
                options: [
                    "Crush the tablet and mix in applesauce for easier swallowing.",
                    "Swallow the tablet whole; crushing destroys the extended-release mechanism and causes a dangerous dose dump.",
                    "Break the tablet in half if it seems too large.",
                    "It can be crushed; the 'ER' just means it is extended in size.",
                ],
                correctIndex: 1,
                rationale: "Extended-release formulations must never be crushed or chewed. Doing so destroys the controlled-release matrix, releasing the full dose at once (dose dumping), which can cause severe hypotension.",
            },
        ],
        studyGuide: {
            overview:
                "Clara Jenkins, a 65‑year‑old woman taking sildenafil for pulmonary hypertension, has been prescribed Imdur (isosorbide mononitrate ER). This scenario highlights a classic, life‑threatening drug‑drug interaction between nitrates and PDE5 inhibitors.",
            pharmacology:
                "Isosorbide mononitrate is an organic nitrate that acts as a vasodilator, primarily used for angina prophylaxis. It works by releasing nitric oxide, which activates guanylate cyclase and increases cGMP, leading to smooth muscle relaxation. Sildenafil inhibits PDE5, the enzyme that breaks down cGMP, thereby potentiating the vasodilatory effect.",
            interactionMechanism:
                "When a nitrate and a PDE5 inhibitor are combined, cGMP levels rise synergistically, causing profound vasodilation and severe hypotension. This can result in syncope, myocardial infarction, or death. The interaction is absolute contraindication; the prescriber must be called immediately.",
            keyTakeaways: [
                "Nitrate + PDE5 inhibitor = absolute contraindication due to risk of fatal hypotension.",
                "Always check a patient’s complete medication list, including PRN drugs like sildenafil.",
                "Extended‑release nitrate tablets must never be crushed; dose dumping can be life‑threatening.",
            ],
            references: "ACC/AHA Guidelines for Stable Ischemic Heart Disease",
        },
        difficulty: "Medium",
        xp: 60,
        timeLimit: 280,
    },
    {
        id: 3,
        patientName: "Harold Whitfield",
        patientDob: "1945-11-30",
        patientAge: 78,
        allergies: ["Sulfa", "Codeine"],
        currentMedications: ["Warfarin 5 mg QD", "Digoxin 0.125 mg QD", "Pantoprazole 40 mg QD"],
        avatarSeed: { skin: "#E8BEAC", hair: "#B0B0B0", shirt: "#2C3E50" },
        rxCursiveText: "Naproxen 500 mg\nBID PRN\nQty: 60 tabs\nDr. L. Carter",
        correctDrug: "Naproxen",
        correctDose: "500 mg",
        correctFrequency: "BID",
        correctQty: 60,
        durAlert: {
            alertTitle: "CRITICAL DDI — Warfarin + NSAID",
            severity: "Critical",
            description:
                "Naproxen (NSAID) significantly increases the risk of GI bleeding in patients on warfarin. It also displaces warfarin from protein binding and inhibits platelet aggregation, potentiating anticoagulant effects and raising INR dangerously.",
            correctAction: "call_doctor",
            rationale:
                "Concomitant use of warfarin and NSAIDs is a well‑known high‑risk combination. The prescriber must be contacted to consider alternative analgesics (e.g., acetaminophen) or adjust anticoagulant therapy.",
        },
        shelfItems: [
            { id: "s1", name: "Naproxen", dose: "500 mg", form: "Tablet", isLookAlike: false },
            { id: "s2", name: "Naproxen", dose: "250 mg", form: "Tablet", isLookAlike: true },
            { id: "s3", name: "Naprosyn", dose: "500 mg", form: "Tablet", isLookAlike: true },
            { id: "s4", name: "Naproxen Sodium", dose: "550 mg", form: "Tablet", isLookAlike: true },
            { id: "s5", name: "Ibuprofen", dose: "400 mg", form: "Tablet", isLookAlike: false },
            { id: "s6", name: "Celecoxib", dose: "200 mg", form: "Capsule", isLookAlike: false },
        ],
        availableAuxiliaryLabels: [
            "Take with food or milk",
            "May cause GI bleeding",
            "Do not take with other NSAIDs",
            "Avoid alcohol",
            "Consult doctor if taking blood thinners",
            "Take with plenty of water",
            "May cause dizziness",
        ],
        requiredAuxiliaryLabels: [
            "Take with food or milk",
            "May cause GI bleeding",
            "Do not take with other NSAIDs",
            "Avoid alcohol",
        ],
        counseling: [
            {
                question: "Harold asks, 'I already take warfarin. Why is the pharmacist concerned about this pain reliever?'",
                options: [
                    "Naproxen will make warfarin less effective, increasing clot risk.",
                    "Naproxen increases the risk of bleeding when taken with warfarin, possibly causing stomach bleeding or bruising.",
                    "There is no interaction; just take them at different times.",
                    "Naproxen reduces the metabolism of warfarin, causing toxicity.",
                ],
                correctIndex: 1,
                rationale: "NSAIDs impair platelet function and can cause GI mucosal damage, while warfarin inhibits clotting factors. Together they dramatically raise the risk of gastrointestinal and intracerebral bleeding.",
            },
            {
                question: "What additional advice should you give Harold regarding his pantoprazole?",
                options: [
                    "Stop pantoprazole while taking naproxen.",
                    "Continue pantoprazole; it helps protect the stomach but does not eliminate the bleeding risk.",
                    "Double the pantoprazole dose.",
                    "Switch pantoprazole to ranitidine.",
                ],
                correctIndex: 1,
                rationale: "Proton pump inhibitors like pantoprazole reduce NSAID‑induced gastric damage but do not fully prevent bleeding. Patients must remain vigilant for signs of GI bleeding (black stools, abdominal pain).",
            },
        ],
        studyGuide: {
            overview:
                "Harold Whitfield, a 78‑year‑old on chronic warfarin therapy, presents with a prescription for naproxen. This case highlights the high‑risk combination of warfarin and NSAIDs, which can lead to life‑threatening GI hemorrhage.",
            pharmacology:
                "Naproxen is a non‑selective NSAID that inhibits COX‑1 and COX‑2, reducing prostaglandin synthesis. This leads to decreased gastric mucosal protection and impaired platelet aggregation. Warfarin inhibits vitamin K‑dependent clotting factors. Their combined anti‑hemostatic effects are synergistic.",
            interactionMechanism:
                "NSAIDs displace warfarin from plasma proteins, transiently increasing free warfarin levels. More importantly, they cause direct mucosal injury and inhibit platelet thromboxane A2, drastically increasing bleeding risk. The DUR alert is Critical; the prescriber must be contacted.",
            keyTakeaways: [
                "Warfarin + NSAID = high risk of GI bleeding; always verify pain management strategy.",
                "Proton pump inhibitors provide partial protection but do not eliminate the risk.",
                "Counsel patients on signs of bleeding: black tarry stools, unusual bruising, epistaxis.",
            ],
            references: "Chest Guidelines for Antithrombotic Therapy",
        },
        difficulty: "Medium",
        xp: 60,
        timeLimit: 280,
    },
    {
        id: 4,
        patientName: "Maria Gonzalez",
        patientDob: "1962-03-21",
        patientAge: 61,
        allergies: ["ACE inhibitors (dry cough, not true allergy)"],
        currentMedications: ["Lisinopril 20 mg QD", "Hydrochlorothiazide 25 mg QD"],
        avatarSeed: { skin: "#C68642", hair: "#2C3E50", shirt: "#E67E22" },
        rxCursiveText: "K-Dur 20 mEq\nBID\nQty: 60 tabs\nDr. S. Lee",
        correctDrug: "K-Dur",
        correctDose: "20 mEq",
        correctFrequency: "BID",
        correctQty: 60,
        durAlert: {
            alertTitle: "SEVERE DDI — ACE Inhibitor + Potassium Supplement",
            severity: "Severe",
            description:
                "Lisinopril (ACE inhibitor) reduces aldosterone, leading to potassium retention. Adding a potassium supplement (K-Dur) can cause life‑threatening hyperkalemia, especially in patients with reduced renal function. Serum potassium must be monitored closely.",
            correctAction: "call_doctor",
            rationale:
                "Although not an absolute contraindication, this combination requires prescriber verification of recent potassium levels and renal function. The dose may need adjustment or an alternative therapy considered.",
        },
        shelfItems: [
            { id: "s1", name: "K-Dur", dose: "20 mEq", form: "ER Tablet", isLookAlike: false },
            { id: "s2", name: "K-Dur", dose: "10 mEq", form: "ER Tablet", isLookAlike: true },
            { id: "s3", name: "Klor-Con", dose: "20 mEq", form: "ER Tablet", isLookAlike: true },
            { id: "s4", name: "K-Tab", dose: "20 mEq", form: "ER Tablet", isLookAlike: true },
            { id: "s5", name: "Potassium Chloride", dose: "20 mEq", form: "Liquid", isLookAlike: false },
            { id: "s6", name: "Magnesium Oxide", dose: "400 mg", form: "Tablet", isLookAlike: false },
        ],
        availableAuxiliaryLabels: [
            "Take with food or after meals",
            "Do not crush or chew",
            "May cause stomach upset",
            "Take with a full glass of water",
            "Avoid salt substitutes containing potassium",
            "Keep out of reach of children",
            "May cause dizziness",
        ],
        requiredAuxiliaryLabels: [
            "Take with food or after meals",
            "Do not crush or chew",
            "Avoid salt substitutes containing potassium",
        ],
        counseling: [
            {
                question: "Maria asks, 'Why do I need to avoid salt substitutes while taking this potassium pill?'",
                options: [
                    "Salt substitutes contain sodium, which will raise your blood pressure.",
                    "Many salt substitutes contain potassium chloride; combining them can cause dangerously high potassium levels.",
                    "Salt substitutes interfere with the absorption of potassium.",
                    "There is no issue; you can use them freely.",
                ],
                correctIndex: 1,
                rationale: "Salt substitutes often replace sodium with potassium chloride. Adding a potassium supplement on top of an ACE inhibitor can lead to severe hyperkalemia, causing cardiac arrhythmias.",
            },
            {
                question: "What symptoms of high potassium should Maria watch for?",
                options: [
                    "Excessive urination and dry mouth.",
                    "Muscle weakness, palpitations, or irregular heartbeat.",
                    "Increased appetite and weight gain.",
                    "Skin rash and itching.",
                ],
                correctIndex: 1,
                rationale: "Hyperkalemia can cause muscle weakness, fatigue, palpitations, and life‑threatening cardiac arrhythmias. Patients should seek immediate medical attention if these occur.",
            },
        ],
        studyGuide: {
            overview:
                "Maria Gonzalez, on lisinopril and HCTZ, is prescribed a potassium supplement (K-Dur). ACE inhibitors can elevate serum potassium, and adding exogenous potassium requires careful evaluation. This case reinforces the importance of checking drug‑drug interactions that affect electrolyte balance.",
            pharmacology:
                "ACE inhibitors like lisinopril block angiotensin II production, which reduces aldosterone secretion. Aldosterone normally promotes potassium excretion; thus, ACE inhibitors can cause hyperkalemia. Hydrochlorothiazide, a thiazide diuretic, may partially offset this by promoting potassium loss, but the net effect can still be dangerous.",
            interactionMechanism:
                "The combination of an ACE inhibitor and a potassium supplement can lead to additive hyperkalemia. While not an absolute contraindication, it requires verification of renal function and potassium levels. The prescriber should be contacted to confirm the indication and recent labs.",
            keyTakeaways: [
                "ACE inhibitors + potassium supplements = risk of severe hyperkalemia.",
                "Always inquire about salt substitutes; many contain potassium.",
                "Counsel patients on signs of hyperkalemia: muscle weakness, palpitations.",
            ],
            references: "KDIGO Guidelines for Potassium Management in CKD",
        },
        difficulty: "Medium",
        xp: 60,
        timeLimit: 280,
    },
    {
        id: 5,
        patientName: "Robert Chen",
        patientDob: "1970-08-15",
        patientAge: 53,
        allergies: ["Penicillin"],
        currentMedications: ["Methotrexate 15 mg weekly", "Folic acid 1 mg daily"],
        avatarSeed: { skin: "#FDEBD0", hair: "#1C2833", shirt: "#27AE60" },
        rxCursiveText: "Bactrim DS\n800/160 mg\nBID × 7 days\nQty: 14 tabs\nDr. J. Kumar",
        correctDrug: "Bactrim DS",
        correctDose: "800/160 mg",
        correctFrequency: "BID",
        correctQty: 14,
        durAlert: {
            alertTitle: "CRITICAL DDI — Methotrexate + Trimethoprim",
            severity: "Critical",
            description:
                "Trimethoprim (in Bactrim) inhibits dihydrofolate reductase, synergistically exacerbating methotrexate's antifolate effects. This can lead to severe bone marrow suppression, pancytopenia, and fatal toxicity.",
            correctAction: "call_doctor",
            rationale:
                "This combination is contraindicated in many guidelines. The prescriber must be contacted to prescribe an alternative antibiotic (e.g., amoxicillin) and to monitor blood counts if no alternative exists.",
        },
        shelfItems: [
            { id: "s1", name: "Bactrim DS", dose: "800/160 mg", form: "Tablet", isLookAlike: false },
            { id: "s2", name: "Bactrim", dose: "400/80 mg", form: "Tablet", isLookAlike: true },
            { id: "s3", name: "Septra DS", dose: "800/160 mg", form: "Tablet", isLookAlike: true },
            { id: "s4", name: "Sulfatrim DS", dose: "800/160 mg", form: "Tablet", isLookAlike: true },
            { id: "s5", name: "Nitrofurantoin", dose: "100 mg", form: "Capsule", isLookAlike: false },
            { id: "s6", name: "Cephalexin", dose: "500 mg", form: "Capsule", isLookAlike: false },
        ],
        availableAuxiliaryLabels: [
            "Take with plenty of water",
            "Complete the full course",
            "May cause photosensitivity",
            "Do not take with methotrexate",
            "Report unusual bleeding or bruising",
            "Take with food",
        ],
        requiredAuxiliaryLabels: [
            "Complete the full course",
            "Report unusual bleeding or bruising",
        ],
        counseling: [
            {
                question: "Robert asks, 'Why can't I take this antibiotic with my methotrexate?'",
                options: [
                    "The antibiotic stops methotrexate from working.",
                    "Both drugs suppress the bone marrow; together they can cause dangerously low blood counts.",
                    "It will cause severe nausea and vomiting.",
                    "There is no interaction; you can take them together.",
                ],
                correctIndex: 1,
                rationale: "Trimethoprim and methotrexate both inhibit folate metabolism, leading to synergistic bone marrow suppression. This can result in life‑threatening pancytopenia.",
            },
            {
                question: "What signs of bone marrow suppression should Robert watch for?",
                options: [
                    "Increased appetite and weight gain.",
                    "Fever, sore throat, unusual bruising or bleeding.",
                    "Increased energy and restlessness.",
                    "Constipation and dry mouth.",
                ],
                correctIndex: 1,
                rationale: "Symptoms of bone marrow suppression include fever (neutropenia), easy bruising (thrombocytopenia), and fatigue (anemia). Immediate medical attention is necessary.",
            },
        ],
        studyGuide: {
            overview:
                "Robert Chen, on low‑dose methotrexate for rheumatoid arthritis, presents with a prescription for Bactrim DS. This case tests the recognition of the synergistic antifolate toxicity between methotrexate and trimethoprim, which can cause fatal bone marrow suppression.",
            pharmacology:
                "Methotrexate is a folate antimetabolite that inhibits dihydrofolate reductase (DHFR), blocking DNA synthesis. Trimethoprim also inhibits bacterial DHFR, and at high doses can affect human DHFR. Together they deplete folate stores, leading to severe myelosuppression.",
            interactionMechanism:
                "Both drugs inhibit DHFR, albeit with different selectivity. Their additive antifolate effects can cause pancytopenia, oral ulcers, and gastrointestinal necrosis. This interaction is considered a critical DUR alert requiring prescriber contact.",
            keyTakeaways: [
                "Methotrexate + trimethoprim = high risk of bone marrow suppression.",
                "Always verify antibiotic choice in patients on methotrexate.",
                "Counsel patients on signs of myelosuppression: fever, bruising, sore throat.",
            ],
            references: "ASHP Therapeutic Guidelines on Drug Interactions",
        },
        difficulty: "Hard",
        xp: 80,
        timeLimit: 240,
    },
    {
        id: 6,
        patientName: "Evelyn Smith",
        patientDob: "1940-06-05",
        patientAge: 84,
        allergies: ["Codeine"],
        currentMedications: ["Tamsulosin 0.4 mg QD", "Metformin 850 mg BID"],
        avatarSeed: { skin: "#FAD7A0", hair: "#E0E0E0", shirt: "#8E44AD" },
        rxCursiveText: "Ditropan XL 10 mg\nQD\nQty: 30 tabs\nDr. N. Ahmed",
        correctDrug: "Ditropan XL",
        correctDose: "10 mg",
        correctFrequency: "QD",
        correctQty: 30,
        durAlert: {
            alertTitle: "SEVERE DDI — Anticholinergic + BPH",
            severity: "Severe",
            description:
                "Ditropan XL (oxybutynin ER) is a potent anticholinergic used for overactive bladder. In patients with benign prostatic hyperplasia (BPH) already on tamsulosin, it can cause urinary retention and acute kidney injury. A prescriber review is recommended.",
            correctAction: "call_doctor",
            rationale:
                "Anticholinergics can cause urinary hesitancy and retention, especially in elderly males with BPH. The prescriber should be contacted to discuss a possible alternative, such as mirabegron (a beta-3 agonist).",
        },
        shelfItems: [
            { id: "s1", name: "Ditropan XL", dose: "10 mg", form: "ER Tablet", isLookAlike: false },
            { id: "s2", name: "Ditropan XL", dose: "5 mg", form: "ER Tablet", isLookAlike: true },
            { id: "s3", name: "Oxybutynin ER", dose: "10 mg", form: "ER Tablet", isLookAlike: true },
            { id: "s4", name: "Detrol LA", dose: "4 mg", form: "Capsule", isLookAlike: true },
            { id: "s5", name: "Myrbetriq", dose: "50 mg", form: "Tablet", isLookAlike: false },
            { id: "s6", name: "Flomax", dose: "0.4 mg", form: "Capsule", isLookAlike: false },
        ],
        availableAuxiliaryLabels: [
            "May cause drowsiness",
            "Avoid alcohol",
            "Do not crush or chew",
            "May cause dry mouth",
            "May cause constipation",
            "Take with a full glass of water",
        ],
        requiredAuxiliaryLabels: [
            "May cause drowsiness",
            "May cause dry mouth",
            "May cause constipation",
        ],
        counseling: [
            {
                question: "Evelyn asks, 'Will this bladder medicine affect my urination problems?'",
                options: [
                    "No, it only helps with bladder control.",
                    "It may make it harder to start urination because it relaxes the bladder muscle.",
                    "It will make you urinate more frequently.",
                    "It has no effect on urination.",
                ],
                correctIndex: 1,
                rationale: "Oxybutynin is an anticholinergic that reduces bladder contractions, which can impair the ability to initiate urination, especially in patients with BPH.",
            },
            {
                question: "What side effects should Evelyn expect from this medication?",
                options: [
                    "Increased sweating and salivation.",
                    "Dry mouth, constipation, and drowsiness.",
                    "Weight loss and insomnia.",
                    "Increased heart rate and anxiety.",
                ],
                correctIndex: 1,
                rationale: "Anticholinergic side effects include dry mouth, constipation, blurred vision, and drowsiness. Elderly patients are particularly susceptible to cognitive impairment.",
            },
        ],
        studyGuide: {
            overview:
                "Evelyn Smith, an 84‑year‑old woman with BPH (unusual for females but possible due to anatomical variations or medication‑induced), is prescribed Ditropan XL for overactive bladder. This case emphasizes the risk of anticholinergic‑induced urinary retention in patients with voiding difficulties.",
            pharmacology:
                "Oxybutynin is a tertiary amine anticholinergic that competitively blocks muscarinic receptors in the detrusor muscle, reducing bladder contractions. In patients with BPH, the anticholinergic effect can exacerbate urinary outflow obstruction, leading to acute retention.",
            interactionMechanism:
                "The additive anticholinergic burden from oxybutynin can cause urinary hesitancy, retention, and subsequent kidney injury. While tamsulosin (alpha blocker) helps relax the prostate, it does not fully counteract the anticholinergic effect on the detrusor. A prescriber call is warranted.",
            keyTakeaways: [
                "Anticholinergics in BPH patients risk urinary retention.",
                "Consider alternative overactive bladder therapies like beta-3 agonists (mirabegron).",
                "Elderly patients are more prone to anticholinergic side effects including confusion and constipation.",
            ],
            references: "Beers Criteria for Potentially Inappropriate Medication Use in Older Adults",
        },
        difficulty: "Hard",
        xp: 80,
        timeLimit: 240,
    },
];

// ─── STEP HINTS ────────────────────────────────────────────────────────────────
const STEP_HINTS: Record<number, string> = {
    0: "Review all allergies carefully before accepting. Check for drug-allergy conflicts now — it is easier to flag early.",
    1: "Common abbreviations: QD = once daily, BID = twice/day, TID = three/day. Verify drug NAME and DOSE exactly as written.",
    2: "Severity matters. Critical alerts almost always require contacting the prescriber. Never override a critical allergy.",
    3: "LASA drugs look similar! Compare BOTH the name AND the strength/dose before selecting.",
    4: "Select ONLY the labels that are specifically required for this medication. More is not always better.",
    5: "Draw on the DUR information you reviewed earlier — it often directly answers the counseling question.",
};

// ─── SVG COMPONENTS ──────────────────────────────────────────────────────────
const PatientAvatar = ({
    skin,
    hair,
    shirt,
    size = 80,
}: {
    skin: string;
    hair: string;
    shirt: string;
    size?: number;
}) => (
    <svg width={size} height={size} viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="95" rx="28" ry="22" fill={shirt} />
        <rect x="44" y="64" width="12" height="14" rx="4" fill={skin} />
        <circle cx="50" cy="52" r="22" fill={skin} />
        <ellipse cx="50" cy="33" rx="22" ry="12" fill={hair} />
        <ellipse cx="30" cy="46" rx="6" ry="14" fill={hair} />
        <ellipse cx="70" cy="46" rx="6" ry="14" fill={hair} />
        <circle cx="42" cy="50" r="3" fill="#2c3e50" />
        <circle cx="58" cy="50" r="3" fill="#2c3e50" />
        <circle cx="43" cy="49" r="1" fill="white" />
        <circle cx="59" cy="49" r="1" fill="white" />
        <path d="M 43 58 Q 50 64 57 58" stroke="#c0392b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 40 78 L 50 88 L 60 78" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
);

const PillBottleSVG = ({
    color = "#3b82f6",
    isSelected = false,
    isWrong = false,
    isLookAlike = false,
}: {
    color?: string;
    isSelected?: boolean;
    isWrong?: boolean;
    isLookAlike?: boolean;
}) => (
    <svg width="56" height="80" viewBox="0 0 56 80" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="2" width="32" height="14" rx="4" fill={isWrong ? "#ef4444" : isSelected ? "#16a34a" : "#d97706"} />
        <rect
            x="8" y="14" width="40" height="58" rx="6"
            fill={color} opacity="0.85"
            stroke={isSelected ? "#16a34a" : isWrong ? "#ef4444" : "#93c5fd"}
            strokeWidth={isSelected || isWrong ? "2.5" : "1"}
        />
        <rect x="12" y="22" width="32" height="38" rx="3" fill="white" opacity="0.9" />
        <ellipse cx="21" cy="35" rx="5" ry="3" fill="#ef4444" opacity="0.7" />
        <ellipse cx="35" cy="35" rx="5" ry="3" fill="#3b82f6" opacity="0.7" />
        <ellipse cx="28" cy="42" rx="5" ry="3" fill="#22c55e" opacity="0.7" />
        <ellipse cx="21" cy="49" rx="5" ry="3" fill="#ef4444" opacity="0.7" />
        <ellipse cx="35" cy="49" rx="5" ry="3" fill="#3b82f6" opacity="0.7" />
        {isLookAlike && (
            <>
                <rect x="8" y="66" width="40" height="8" rx="0" fill="#f59e0b" opacity="0.95" />
                <text x="28" y="73" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold">
                    LASA
                </text>
            </>
        )}
        {[0, 2, 4, 6, 8, 10, 12].map((i) => (
            <rect key={i} x={14 + i * 2.5} y="55" width="1.2" height="7" fill="#334155" opacity="0.4" />
        ))}
    </svg>
);

// ─── FLOATING ICONS ─────────────────────────────────────────────────────────
const FloatingIcon = ({ icon: Icon, style }: { icon: any; style: React.CSSProperties }) => (
    <motion.div
        className="absolute text-blue-400 pointer-events-none z-0 hidden sm:block"
        style={{ ...style, opacity: 0.15 }}
        animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, ease: "easeInOut" }}
    >
        <Icon size={32} />
    </motion.div>
);

// ─── SEVERITY BADGE ──────────────────────────────────────────────────────────
const SeverityBadge = ({ severity }: { severity: string }) => {
    const map: Record<string, string> = {
        Critical: "bg-red-600 text-white",
        Severe: "bg-orange-500 text-white",
        Moderate: "bg-amber-400 text-gray-900",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${map[severity] || "bg-gray-400 text-white"}`}>
            {severity}
        </span>
    );
};

// ─── GAME UI SUBCOMPONENTS ────────────────────────────────────────────────────
const XP_PER_LEVEL = 150;

const XPBar = ({ xp }: { xp: number }) => {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const into = xp % XP_PER_LEVEL;
    const pct = (into / XP_PER_LEVEL) * 100;
    return (
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                {level}
            </div>
            <div className="w-24 sm:w-32 md:w-40">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Lv {level}</span>
                    <span className="text-[10px] font-bold text-slate-400">{into}/{XP_PER_LEVEL}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
                </div>
            </div>
        </div>
    );
};

const ComboBadge = ({ streak }: { streak: number }) => (
    <motion.div
        animate={streak >= 3 ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.6, repeat: streak >= 3 ? Infinity : 0, repeatDelay: 0.4 }}
        className="flex items-center gap-1.5 sm:gap-2 bg-rose-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-rose-200/50"
    >
        <Flame className={`text-rose-500 ${streak >= 3 ? "fill-rose-500" : ""}`} size={14} />
        <span className="font-bold text-rose-900 text-xs sm:text-sm">{streak}</span>
    </motion.div>
);

const TimerBar = ({ timeLeft, timeLimit }: { timeLeft: number; timeLimit: number }) => {
    const pct = Math.max(0, Math.min(100, (timeLeft / timeLimit) * 100));
    const color = pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-500" : "bg-rose-500";
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase">
                    <Clock size={13} /> Time Left
                </span>
                <span className={`text-xs font-black tabular-nums ${pct <= 20 ? "text-rose-600" : "text-slate-500"}`}>{timeLeft}s</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div className={`h-full ${color} rounded-full`} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
            </div>
        </div>
    );
};

const LevelUpModal = ({ level, onClose }: { level: number; onClose: () => void }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center max-w-xs w-full overflow-hidden">
            <Trophy size={36} className="text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900">Level {level}!</h2>
            <p className="text-sm text-slate-500 mt-2">Your dispensing skills are improving.</p>
            <button onClick={onClose} className="mt-6 w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg">
                Keep Going
            </button>
        </motion.div>
    </motion.div>
);

const Toast = ({ message, icon: Icon }: { message: string; icon: any }) => (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold">
        <Icon size={16} className="text-amber-400" /> {message}
    </motion.div>
);

// ─── CASE MAP NODE ────────────────────────────────────────────────────────────
const CaseNode = ({
    caseData,
    index,
    unlocked,
    prog,
    onSelect,
}: {
    caseData: PrescriptionCase;
    index: number;
    unlocked: boolean;
    prog?: { completed: boolean; stars: number };
    onSelect: () => void;
}) => {
    const colors = {
        Easy: "border-emerald-400 text-emerald-600 bg-emerald-50",
        Medium: "border-amber-400 text-amber-600 bg-amber-50",
        Hard: "border-rose-400 text-rose-600 bg-rose-50",
    };
    const col = colors[caseData.difficulty] || "";
    const alignRight = index % 2 === 1;

    return (
        <div className={`relative z-10 flex w-full ${alignRight ? "justify-end pr-2 sm:pr-10" : "justify-start pl-2 sm:pl-10"}`}>
            <motion.button
                whileHover={unlocked ? { scale: 1.05 } : {}}
                whileTap={unlocked ? { scale: 0.95 } : {}}
                onClick={onSelect}
                disabled={!unlocked}
                className={`flex flex-col items-center gap-2 w-24 sm:w-32 ${!unlocked ? "opacity-60 cursor-not-allowed" : ""}`}
            >
                <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-4 shadow-lg ${unlocked ? col : "border-slate-200"} bg-white`}>
                    {unlocked ? (
                        <User size={28} className={col.split(" ")[1]} />
                    ) : (
                        <Lock size={20} className="text-slate-400" />
                    )}
                    {caseData.difficulty === "Hard" && unlocked && (
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">Hard</span>
                    )}
                </div>
                <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">{caseData.patientName}</span>
                <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => (
                        <Star key={i} size={11} className={i < (prog?.stars || 0) ? "text-amber-500 fill-amber-500" : "text-slate-200 fill-slate-200"} />
                    ))}
                </div>
            </motion.button>
        </div>
    );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function PharmacySimulation() {
    // ── Game State ──
    const [screen, setScreen] = useState<"map" | "brief" | "lab" | "result">("map");
    const [activeIdx, setActiveIdx] = useState(0);
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [progress, setProgress] = useState<Record<number, { completed: boolean; stars: number }>>({});
    const [levelUpTo, setLevelUpTo] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; icon: any } | null>(null);

    // ── Lab / Step State ──
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(100);
    const [errors, setErrors] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [running, setRunning] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [hintUsed, setHintUsed] = useState(false);
    const [preceptorMsg, setPreceptorMsg] = useState<string | null>(null);
    const [correction, setCorrection] = useState<{ title: string; explanation: string; correct: string } | null>(null);
    const [txDrug, setTxDrug] = useState("");
    const [txDose, setTxDose] = useState("");
    const [txFreq, setTxFreq] = useState("QD");
    const [txQty, setTxQty] = useState("");
    const [selectedBottle, setSelectedBottle] = useState<string | null>(null);
    const [wrongBottle, setWrongBottle] = useState<string | null>(null);
    const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
    const [counselingIdx, setCounselingIdx] = useState(0);
    const [done, setDone] = useState(false);
    const [timedOut, setTimedOut] = useState(false);
    const [showStudyGuide, setShowStudyGuide] = useState(true);

    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const preceptorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const currentCase = CASES[activeIdx];
    const isUnlocked = (idx: number) => idx === 0 || !!progress[CASES[idx - 1].id]?.completed;

    // ── Countdown Timer ──
    useEffect(() => {
        if (screen !== "lab" || done || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        timerIntervalRef.current = interval;
        return () => clearInterval(interval);
    }, [screen, done, timeLeft]);

    // Auto‑submit on timeout
    useEffect(() => {
        if (screen === "lab" && timeLeft <= 0 && !done) {
            handleTimeout();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft]);

    // ── Helpers ──
    const showToast = (msg: string, icon: any) => {
        setToast({ message: msg, icon });
        if (toastRef.current) clearTimeout(toastRef.current);
        toastRef.current = setTimeout(() => setToast(null), 2600);
    };

    const penalise = useCallback((data: { title: string; explanation: string; correct: string }, msg: string) => {
        setScore(s => Math.max(0, s - 12));
        setErrors(e => e + 1);
        setCorrection(data);
        setPreceptorMsg(msg);
        if (preceptorRef.current) clearTimeout(preceptorRef.current);
        preceptorRef.current = setTimeout(() => setPreceptorMsg(null), 6000);
    }, []);

    // ── End Case & Calculate Stars ──
    const endCase = (forcedTimeout = false) => {
        setRunning(false);
        setDone(true);
        if (forcedTimeout) setTimedOut(true);
        const totalErrors = errors;
        const baseStars = totalErrors === 0 ? 3 : totalErrors <= 2 ? 2 : 1;
        const finalStars = forcedTimeout ? 0 : (hintUsed ? Math.min(baseStars, 2) : baseStars);
        const xpGain = finalStars > 0 ? currentCase.xp : 0;

        setProgress(p => ({ ...p, [currentCase.id]: { completed: true, stars: finalStars } }));
        const prevLevel = Math.floor(xp / XP_PER_LEVEL);
        const newXp = xp + xpGain;
        setXp(newXp);
        if (xpGain > 0) setStreak(s => s + 1);
        else setStreak(0);

        const newLevel = Math.floor(newXp / XP_PER_LEVEL);
        if (newLevel > prevLevel) setTimeout(() => setLevelUpTo(newLevel), 700);

        if (finalStars === 3) showToast("Perfect Dispensing!", Award);
        if (forcedTimeout) showToast("Time's up!", Clock);
        setScreen("result");
    };

    const handleTimeout = () => {
        endCase(true);
    };

    // ── Step Handlers (unchanged logic) ──
    const handleAccept = () => { setRunning(true); setStep(1); };
    const handleTranscription = () => {
        const c = currentCase;
        const drugOk = txDrug.trim().toLowerCase() === c.correctDrug.toLowerCase();
        const doseOk = txDose.trim().toLowerCase() === c.correctDose.toLowerCase();
        const freqOk = txFreq === c.correctFrequency;
        const qtyOk = parseInt(txQty) === c.correctQty;
        if (!drugOk || !doseOk || !freqOk || !qtyOk) {
            const wrongs: string[] = [];
            if (!drugOk) wrongs.push(`Drug (correct: ${c.correctDrug})`);
            if (!doseOk) wrongs.push(`Dose (correct: ${c.correctDose})`);
            if (!freqOk) wrongs.push(`Frequency (correct: ${c.correctFrequency})`);
            if (!qtyOk) wrongs.push(`Quantity (correct: ${c.correctQty})`);
            penalise(
                { title: "Transcription Error", explanation: `Incorrect: ${wrongs.join(", ")}.`, correct: `${c.correctDrug} | ${c.correctDose} | ${c.correctFrequency} | Qty: ${c.correctQty}` },
                "⚠️ Preceptor: Transcription mismatch. Verify the prescription."
            );
            return;
        }
        setStep(2);
    };
    const handleDUR = (action: "override" | "call_doctor") => {
        if (action !== currentCase.durAlert.correctAction) {
            penalise(
                { title: "Incorrect DUR Action", explanation: `You chose to ${action}. Correct action: ${currentCase.durAlert.correctAction}.`, correct: currentCase.durAlert.rationale },
                "⚠️ Preceptor: DUR response incorrect."
            );
            return;
        }
        setStep(3);
    };
    const handleBottleClick = (item: ShelfItem) => {
        const c = currentCase;
        if (item.name === c.correctDrug && item.dose === c.correctDose) {
            setSelectedBottle(item.id);
            setTimeout(() => setStep(4), 700);
        } else {
            setWrongBottle(item.id);
            penalise(
                { title: "LASA Error", explanation: `You selected ${item.name} ${item.dose}.`, correct: `${c.correctDrug} ${c.correctDose}` },
                "⚠️ Preceptor: Wrong medication. Beware of LASA drugs."
            );
            setTimeout(() => setWrongBottle(null), 1200);
        }
    };
    const handleLabels = () => {
        const req = [...currentCase.requiredAuxiliaryLabels].sort().join("|");
        const sel = [...selectedLabels].sort().join("|");
        if (req !== sel) {
            const missing = currentCase.requiredAuxiliaryLabels.filter(l => !selectedLabels.includes(l));
            const extra = selectedLabels.filter(l => !currentCase.requiredAuxiliaryLabels.includes(l));
            penalise(
                { title: "Label Error", explanation: `${missing.length ? "Missing: " + missing.join(", ") : ""} ${extra.length ? "Extra: " + extra.join(", ") : ""}`, correct: currentCase.requiredAuxiliaryLabels.join(" | ") },
                "⚠️ Preceptor: Incorrect auxiliary labels."
            );
            return;
        }
        setStep(5);
    };
    const handleCounseling = (idx: number) => {
        const q = currentCase.counseling[counselingIdx];
        if (idx !== q.correctIndex) {
            penalise(
                { title: "Counseling Error", explanation: `Best answer: ${q.options[q.correctIndex]}`, correct: q.rationale },
                "⚠️ Preceptor: Review the pharmacology."
            );
            return;
        }
        if (counselingIdx + 1 < currentCase.counseling.length) {
            setCounselingIdx(i => i + 1);
        } else {
            endCase();
        }
    };

    // ── Navigation ──
    const startCase = (idx: number) => {
        if (!isUnlocked(idx)) { showToast("Complete the previous case first", Lock); return; }
        setActiveIdx(idx);
        setStep(0);
        setScore(100);
        setErrors(0);
        setTimeLeft(CASES[idx].timeLimit);
        setRunning(false);
        setTxDrug(""); setTxDose(""); setTxFreq("QD"); setTxQty("");
        setSelectedBottle(null); setWrongBottle(null);
        setSelectedLabels([]); setCounselingIdx(0);
        setDone(false); setTimedOut(false);
        setCorrection(null); setPreceptorMsg(null);
        setShowHint(false); setHintUsed(false);
        setShowStudyGuide(true);
        setScreen("brief");
    };
    const beginLab = () => { setShowStudyGuide(false); setScreen("lab"); };
    const backToMap = () => { setScreen("map"); setDone(false); };
    const resetGame = () => {
        setXp(0); setStreak(0); setProgress({});
        setScreen("map"); setActiveIdx(0);
        setShowStudyGuide(false);
    };

    const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

    // ── RENDER ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900">
            {/* Floating background icons */}
            <FloatingIcon icon={Pill} style={{ top: "15%", left: "5%" }} />
            <FloatingIcon icon={FlaskConical} style={{ top: "40%", right: "8%" }} />
            <FloatingIcon icon={Activity} style={{ top: "70%", left: "6%" }} />
            <FloatingIcon icon={Shield} style={{ top: "85%", right: "5%" }} />
            <FloatingIcon icon={BookOpen} style={{ top: "50%", left: "3%" }} />

            {/* Toast & Level Up Modal */}
            <AnimatePresence>{toast && <Toast message={toast.message} icon={toast.icon} />}</AnimatePresence>
            <AnimatePresence>{levelUpTo && <LevelUpModal level={levelUpTo} onClose={() => setLevelUpTo(null)} />}</AnimatePresence>

            {/* ── HEADER / HUD ── */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm pt-10">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
                    <button onClick={backToMap} className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="p-1.5 sm:p-2 bg-indigo-600 rounded-xl text-white">
                            <ShoppingCart size={18} />
                        </div>
                        <span className="font-bold text-slate-900 text-base sm:text-lg hidden sm:block">Pharmacy Counter</span>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <XPBar xp={xp} />
                        <ComboBadge streak={streak} />
                        <button onClick={resetGame} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600" title="Restart Session">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── STUDY GUIDE OVERLAY ─── */}
            <AnimatePresence>
                {showStudyGuide && screen === "brief" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <BookOpen className="text-indigo-600" size={28} />
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Case Study #{currentCase.id} — {currentCase.patientName}</h2>
                                    <p className="text-slate-500 text-sm">Pharmacological Background & Safety Review</p>
                                </div>
                            </div>
                            {/* Patient snapshot */}
                            <div className="flex gap-4 items-center  bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                <PatientAvatar {...currentCase.avatarSeed} size={64} />
                                <div>
                                    <p className="font-bold text-slate-800">{currentCase.patientName}</p>
                                    <p className="text-sm text-slate-600">{currentCase.patientAge} yrs, Allergies: {currentCase.allergies.join(", ")}</p>
                                    <p className="text-sm text-slate-600">Current meds: {currentCase.currentMedications.join("; ")}</p>
                                </div>
                            </div>
                            {/* Prescription preview */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-amber-700 text-xs font-bold uppercase mb-2">Written Prescription</p>
                                <pre className="  bg-white font-serif italic text-amber-900 text-sm whitespace-pre-wrap">{currentCase.rxCursiveText}</pre>
                            </div>
                            {/* Study guide content */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-extrabold text-indigo-700 flex items-center gap-2"><FlaskConical size={18} /> Clinical Overview</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed mt-1">{currentCase.studyGuide.overview}</p>
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-emerald-700 flex items-center gap-2"><Pill size={18} /> Pharmacology</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed mt-1">{currentCase.studyGuide.pharmacology}</p>
                                </div>
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                                    <h3 className="text-lg font-extrabold text-rose-700 flex items-center gap-2"><AlertTriangle size={18} /> Interaction Mechanism</h3>
                                    <p className="text-slate-700 text-sm leading-relaxed mt-1">{currentCase.studyGuide.interactionMechanism}</p>
                                </div>
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                    <h3 className="text-lg font-extrabold text-emerald-700 flex items-center gap-2"><Star size={18} /> Key Takeaways</h3>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-slate-700">
                                        {currentCase.studyGuide.keyTakeaways.map((k, i) => <li key={i}>{k}</li>)}
                                    </ul>
                                </div>
                                {currentCase.studyGuide.references && (
                                    <p className="text-xs text-slate-400 italic">Reference: {currentCase.studyGuide.references}</p>
                                )}
                            </div>
                            <button onClick={() => { setShowStudyGuide(false); beginLab(); }} className="w-full bg-indigo-600 text-white font-extrabold py-3.5 rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                <ChevronRight size={20} /> Begin Simulation
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── MAP SCREEN ─── */}
            {screen === "map" && (
                <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Patient Cases</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Complete each dispensing case to unlock the next.</p>
                    </motion.div>
                    <div className="relative flex flex-col gap-10 py-4">
                        <div className="absolute left-1/2 top-4 bottom-4 w-0.5 border-l-2 border-dashed border-slate-300 -translate-x-1/2 z-0" />
                        {CASES.map((c, idx) => (
                            <CaseNode key={c.id} caseData={c} index={idx} unlocked={isUnlocked(idx)} prog={progress[c.id]} onSelect={() => startCase(idx)} />
                        ))}
                    </div>
                </div>
            )}

            {/* ─── BRIEFING SCREEN (shown only if study guide is not active, but we use it as a launch screen; study guide overlays it) ─── */}
            {screen === "brief" && !showStudyGuide && (
                <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-xl border p-6 sm:p-8 space-y-4">
                        <div className="flex items-center gap-4">
                            <PatientAvatar {...currentCase.avatarSeed} size={64} />
                            <div>
                                <h2 className="text-xl font-bold">{currentCase.patientName}</h2>
                                <p className="text-sm text-slate-500">{currentCase.patientAge} yrs · Allergies: {currentCase.allergies.join(", ")}</p>
                            </div>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-4 font-serif italic text-amber-900">{currentCase.rxCursiveText}</div>
                        <p className="text-sm text-slate-600">{currentCase.studyGuide.overview}</p>
                        <button onClick={beginLab} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2">
                            Begin Dispensing <ArrowRight size={18} />
                        </button>
                    </motion.div>
                </div>
            )}

            {/* ─── LAB SCREEN (existing 6‑step simulation) ─── */}
            {screen === "lab" && (
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
                    {/* Left sidebar: Patient & Timer */}
                    <aside className="lg:sticky lg:top-24 space-y-4 lg:col-span-1 h-fit">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border">
                            <TimerBar timeLeft={timeLeft} timeLimit={currentCase.timeLimit} />
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border">
                            <div className="flex flex-col items-center">
                                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                                    <PatientAvatar {...currentCase.avatarSeed} size={80} />
                                </motion.div>
                                <h3 className="font-bold mt-2">{currentCase.patientName}</h3>
                                <p className="text-xs text-slate-500">{currentCase.patientAge} yrs</p>
                                <div className="mt-3 bg-rose-50 rounded-xl p-3 w-full">
                                    <p className="text-xs font-bold text-rose-600 uppercase">Allergies</p>
                                    {currentCase.allergies.map(a => (
                                        <span key={a} className="inline-block bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full mr-1 mb-1">{a}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-4 border">
                            <p className="text-xs font-bold uppercase text-amber-700">Prescription</p>
                            <pre className=" bg-white font-serif italic text-amber-900 text-sm whitespace-pre-wrap">{currentCase.rxCursiveText}</pre>
                        </div>
                        {/* Hint toggle */}
                        <button onClick={() => { setShowHint(h => !h); if (!showHint) setHintUsed(true); }} className="flex items-center justify-between bg-white border rounded-2xl p-3 w-full">
                            <div className="flex items-center gap-2"><Lightbulb size={16} className="text-slate-600" /><span className="text-sm font-semibold">Hint</span></div>
                            <ChevronRight size={16} className={`transition-transform ${showHint ? "rotate-90" : ""}`} />
                        </button>
                        <AnimatePresence>
                            {showHint && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-sm font-medium text-amber-900 mt-2">
                                        {STEP_HINTS[step]}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </aside>

                    {/* Right: Steps */}
                    <div className="lg:col-span-2 relative">
                        {/* Preceptor alert */}
                        <AnimatePresence>
                            {preceptorMsg && (
                                <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }} className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white px-4 py-3 flex items-center justify-between shadow-xl">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                        <AlertTriangle size={18} className="animate-pulse" /> {preceptorMsg}
                                    </div>
                                    <button onClick={() => setPreceptorMsg(null)} className="text-rose-200 hover:text-white"><X size={18} /></button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Correction side panel */}
                        <AnimatePresence>
                            {correction && (
                                <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed right-0 top-0 bottom-0 w-full max-w-sm z-50 bg-white border-l border-slate-200 shadow-2xl flex flex-col">
                                    <div className="bg-rose-600 px-5 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={18} className="text-rose-200" />
                                            <h3 className="font-bold text-white text-sm">{correction.title}</h3>
                                        </div>
                                        <button onClick={() => setCorrection(null)} className="text-rose-200 hover:text-white"><X size={20} /></button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-slate-700">{correction.explanation}</div>
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-slate-700"><strong>Correct:</strong> {correction.correct}</div>
                                    </div>
                                    <div className="p-4 border-t border-slate-100">
                                        <button onClick={() => setCorrection(null)} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl transition">Understood — Continue</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Step rendering (same as original) */}
                        <AnimatePresence mode="wait">
                            {/* STEP 0: INTAKE */}
                            {step === 0 && !done && (
                                <motion.div key="intake" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="bg-white rounded-2xl p-6 shadow-sm border space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-100 rounded-xl p-2"><CheckCircle className="text-emerald-600" size={22} /></div>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-slate-900">Step 1 — Patient Intake</h2>
                                            <p className="text-slate-500 text-xs">Review the patient profile and accept the prescription.</p>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200 text-sm text-slate-700">
                                        <p><strong>{currentCase.patientName}</strong> has arrived at the counter and handed you a written prescription. Before accepting, review:</p>
                                        <ul className="mt-3 space-y-1.5 list-disc list-inside">
                                            <li>Allergies: <span className="text-rose-600 font-semibold">{currentCase.allergies.join(", ")}</span></li>
                                            <li>Current medications: <span className="text-indigo-700 font-medium">{currentCase.currentMedications.join("; ")}</span></li>
                                        </ul>
                                        <p className="mt-3 text-xs text-slate-500">Scan the prescription note, note the drug and any potential flags, then click Accept to begin.</p>
                                    </div>
                                    <button onClick={handleAccept} className="w-full bg-indigo-600 text-white font-extrabold py-3.5 rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                        <CheckCircle size={18} /> Accept Order & Start Timer
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 1: TRANSCRIPTION */}
                            {step === 1 && !done && (
                                <motion.div key="transcription" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="bg-white rounded-2xl p-6 shadow-sm border space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 rounded-xl p-2"><BookOpen className="text-blue-600" size={22} /></div>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-slate-900">Step 2 — Transcription</h2>
                                            <p className="text-slate-500 text-xs">Interpret the handwritten Rx and enter the details below.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <label className="space-y-1.5">
                                            <span className="text-xs text-slate-600 font-semibold uppercase">Drug Name *</span>
                                            <input value={txDrug} onChange={e => setTxDrug(e.target.value)} placeholder="e.g. Amoxicillin" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
                                        </label>
                                        <label className="space-y-1.5">
                                            <span className="text-xs text-slate-600 font-semibold uppercase">Dose / Strength *</span>
                                            <input value={txDose} onChange={e => setTxDose(e.target.value)} placeholder="e.g. 500 mg" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
                                        </label>
                                        <label className="space-y-1.5">
                                            <span className="text-xs text-slate-600 font-semibold uppercase">Frequency *</span>
                                            <select value={txFreq} onChange={e => setTxFreq(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400">
                                                <option value="QD">QD — Once daily</option>
                                                <option value="BID">BID — Twice daily</option>
                                                <option value="TID">TID — Three times daily</option>
                                                <option value="QID">QID — Four times daily</option>
                                                <option value="PRN">PRN — As needed</option>
                                            </select>
                                        </label>
                                        <label className="space-y-1.5">
                                            <span className="text-xs text-slate-600 font-semibold uppercase">Quantity *</span>
                                            <input type="number" value={txQty} onChange={e => setTxQty(e.target.value)} placeholder="e.g. 30" min={1} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400" />
                                        </label>
                                    </div>
                                    <button onClick={handleTranscription} className="w-full bg-indigo-600 text-white font-extrabold py-3.5 rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                        <ChevronRight size={18} /> Verify & Submit Transcription
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 2: DUR */}
                            {step === 2 && !done && (
                                <motion.div key="dur" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-4">
                                    <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} className="bg-rose-500 rounded-full p-3 shrink-0">
                                                <AlertTriangle size={24} className="text-white" />
                                            </motion.div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                    <h2 className="text-xl font-extrabold text-slate-900">{currentCase.durAlert.alertTitle}</h2>
                                                    <SeverityBadge severity={currentCase.durAlert.severity} />
                                                </div>
                                                <p className="text-sm text-rose-700 leading-relaxed">{currentCase.durAlert.description}</p>
                                            </div>
                                        </div>
                                        <div className="bg-rose-100 rounded-xl p-3 text-xs text-rose-600 border border-rose-200">
                                            <strong>Clinical Context:</strong> This alert was triggered during automated Drug Utilization Review (DUR). Your response is mandatory before dispensing can proceed.
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button onClick={() => handleDUR("call_doctor")} className="bg-white hover:bg-indigo-50 border-2 border-indigo-400 text-indigo-700 font-extrabold py-5 px-6 rounded-2xl transition flex flex-col items-center gap-2">
                                            <MessageCircle size={24} className="text-indigo-500" /> Call Prescriber
                                            <span className="text-xs font-normal text-indigo-500">Contact the doctor for alternative</span>
                                        </button>
                                        <button onClick={() => handleDUR("override")} className="bg-white hover:bg-amber-50 border-2 border-amber-400 text-amber-700 font-extrabold py-5 px-6 rounded-2xl transition flex flex-col items-center gap-2">
                                            <Shield size={24} className="text-amber-500" /> Force Override
                                            <span className="text-xs font-normal text-amber-500">Proceed with pharmacist override</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: SHELF SELECTION */}
                            {step === 3 && !done && (
                                <motion.div key="shelf" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="bg-white rounded-2xl p-6 shadow-sm border space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 rounded-xl p-2"><Tag className="text-purple-600" size={22} /></div>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-slate-900">Step 4 — Shelf Selection</h2>
                                            <p className="text-slate-500 text-xs">Select the correct medication. Beware of LASA drugs!</p>
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                                        LASA alert active: Look-alike/sound-alike drugs are present on the shelf.
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {currentCase.shelfItems.map(item => (
                                            <motion.button
                                                key={item.id}
                                                whileHover={{ scale: 1.04 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => handleBottleClick(item)}
                                                className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition cursor-pointer ${selectedBottle === item.id ? "border-emerald-500 bg-emerald-50 shadow-md" :
                                                    wrongBottle === item.id ? "border-rose-500 bg-rose-50 animate-pulse" :
                                                        item.isLookAlike ? "border-amber-300 bg-amber-50 hover:border-amber-500" :
                                                            "border-slate-200 bg-white hover:border-indigo-400"
                                                    }`}
                                            >
                                                {item.isLookAlike && (
                                                    <span className="absolute top-2 right-2 text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">LASA</span>
                                                )}
                                                <PillBottleSVG isSelected={selectedBottle === item.id} isWrong={wrongBottle === item.id} isLookAlike={item.isLookAlike} />
                                                <div className="text-center">
                                                    <p className="text-slate-900 font-bold text-xs leading-tight">{item.name}</p>
                                                    <p className="text-indigo-600 text-xs font-medium">{item.dose}</p>
                                                    <p className="text-slate-400 text-xs">{item.form}</p>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: LABELING */}
                            {step === 4 && !done && (
                                <motion.div key="labeling" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="bg-white rounded-2xl p-6 shadow-sm border space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-orange-100 rounded-xl p-2"><Tag className="text-orange-600" size={22} /></div>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-slate-900">Step 5 — Auxiliary Labeling</h2>
                                            <p className="text-slate-500 text-xs">Select ONLY the required warning labels for this medication.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {currentCase.availableAuxiliaryLabels.map(label => {
                                            const isSelected = selectedLabels.includes(label);
                                            return (
                                                <motion.button
                                                    key={label}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={() => setSelectedLabels(prev => isSelected ? prev.filter(l => l !== label) : [...prev, label])}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition text-sm font-medium text-left ${isSelected ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-indigo-500 bg-indigo-600" : "border-slate-300 bg-white"}`}>
                                                        {isSelected && <CheckCircle size={12} className="text-white" />}
                                                    </div>
                                                    {label}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-xs text-slate-400 text-center">{selectedLabels.length} label(s) selected</p>
                                    <button onClick={handleLabels} className="w-full bg-indigo-600 text-white font-extrabold py-3.5 rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                                        <Tag size={18} /> Confirm Labels & Package
                                    </button>
                                </motion.div>
                            )}

                            {/* STEP 5: COUNSELING */}
                            {step === 5 && !done && (
                                <motion.div key="counseling" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="bg-white rounded-2xl p-6 shadow-sm border space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-teal-100 rounded-xl p-2"><MessageCircle className="text-teal-600" size={22} /></div>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-slate-900">Step 6 — Patient Counseling</h2>
                                            <p className="text-slate-500 text-xs">Question {counselingIdx + 1} of {currentCase.counseling.length}</p>
                                        </div>
                                    </div>
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
                                        <div className="flex items-start gap-3">
                                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                                <PatientAvatar {...currentCase.avatarSeed} size={50} />
                                            </motion.div>
                                            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-slate-800 leading-relaxed flex-1 shadow-sm">
                                                <p className="text-indigo-600 text-xs font-bold mb-1">{currentCase.patientName} asks:</p>
                                                {currentCase.counseling[counselingIdx]?.question}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {currentCase.counseling[counselingIdx]?.options.map((opt, i) => (
                                            <motion.button
                                                key={i}
                                                whileHover={{ x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleCounseling(i)}
                                                className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 text-sm text-slate-800 transition shadow-sm"
                                            >
                                                <span className="w-7 h-7 rounded-full bg-slate-100 text-indigo-600 text-xs font-bold flex items-center justify-center shrink-0">{String.fromCharCode(65 + i)}</span>
                                                {opt}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* ─── RESULT SCREEN ─── */}
            {screen === "result" && (
                <div className="max-w-2xl mx-auto px-4 py-10 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 sm:p-8 rounded-3xl border shadow-lg ${timedOut ? "bg-slate-50 border-slate-200" : score >= 80 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                        }`}>
                        <div className="flex items-start gap-4">
                            {timedOut ? <Clock size={32} className="text-slate-600" /> : score >= 80 ? <CheckCircle size={32} className="text-emerald-600" /> : <AlertTriangle size={32} className="text-amber-600" />}
                            <div>
                                <h2 className="text-2xl font-black">{timedOut ? "Time Expired" : "Dispensing Complete!"}</h2>
                                <div className="flex gap-1 mt-2">
                                    {[0, 1, 2].map(i => (
                                        <Star key={i} size={20} className={i < (progress[currentCase.id]?.stars || 0) ? "text-amber-500 fill-amber-500" : "text-slate-300 fill-slate-200"} />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 mt-2">Final Score: {score} pts · Errors: {errors}</p>
                                {progress[currentCase.id]?.stars > 0 && <p className="text-xs font-bold text-indigo-600 mt-2">+{currentCase.xp} XP</p>}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            <button onClick={backToMap} className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 font-bold"><Home size={16} /> Case Map</button>
                            {activeIdx + 1 < CASES.length && isUnlocked(activeIdx + 1) && (
                                <button onClick={() => startCase(activeIdx + 1)} className="flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl"><ArrowRight size={16} /> Next Case</button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}