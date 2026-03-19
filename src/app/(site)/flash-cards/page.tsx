"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, X, Zap, Activity, FlaskConical, AlertTriangle,
  TrendingUp, Pill, Beaker, Microscope, Stethoscope, Leaf, Dna,
  ChevronLeft, ChevronRight, BookOpen, ExternalLink, Database, ArrowRight,
  Target, ChevronDown, LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const bgIcons = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

type TabKey = "moa" | "classification" | "sideEffects" | "pharmacokinetics" | "pharmacodynamics" | "indications";

interface TabDef {
  key: TabKey; label: string; shortLabel: string;
  Icon: LucideIcon; backLabel: string; color: string;
  desc: string; accentFrom: string; accentTo: string;
}

const TABS: TabDef[] = [
  { key: "moa",              label: "Mechanism of Action", shortLabel: "MOA",   Icon: FlaskConical,  backLabel: "Mechanism of Action", color: "from-blue-600 to-green-400",    desc: "How drugs work at molecular level",    accentFrom: "#2563eb", accentTo: "#4ade80"  },
  { key: "classification",   label: "Classification",      shortLabel: "Class", Icon: Pill,          backLabel: "Drug Class",          color: "from-indigo-600 to-blue-500",   desc: "Drug classes and pharmacological groups", accentFrom: "#4f46e5", accentTo: "#3b82f6"  },
  { key: "sideEffects",      label: "Side Effects",        shortLabel: "ADRs",  Icon: AlertTriangle, backLabel: "Side Effects",        color: "from-rose-500 to-orange-400",   desc: "Adverse reactions and toxicity",       accentFrom: "#f43f5e", accentTo: "#fb923c"  },
  { key: "pharmacokinetics", label: "Pharmacokinetics",    shortLabel: "PK",    Icon: TrendingUp,    backLabel: "Pharmacokinetics",    color: "from-purple-600 to-pink-500",   desc: "Absorption, distribution, metabolism", accentFrom: "#9333ea", accentTo: "#ec4899"  },
  { key: "pharmacodynamics", label: "Pharmacodynamics",    shortLabel: "PD",    Icon: Activity,      backLabel: "Pharmacodynamics",    color: "from-teal-600 to-green-500",    desc: "Drug effects and clinical outcomes",   accentFrom: "#0d9488", accentTo: "#22c55e"  },
  { key: "indications",      label: "Indications",         shortLabel: "Ind",   Icon: Target,        backLabel: "Indications",         color: "from-emerald-600 to-cyan-500",  desc: "Clinical uses and therapeutic roles",  accentFrom: "#059669", accentTo: "#06b6d4"  },
];

const CARDS_PER_PAGE = 12;

// ─── DATA ─────────────────────────────────────────────────────────────────────

const moaData = [
  { drug:"Methotrexate",       back:"Inhibits DHFR → depletes tetrahydrofolate → blocks DNA/RNA synthesis. Anti-inflammatory at low doses via adenosine accumulation." },
  { drug:"Omeprazole",         back:"PPI — irreversibly inhibits H⁺/K⁺-ATPase (proton pump) in gastric parietal cells." },
  { drug:"Atenolol",           back:"Cardioselective β₁-adrenergic antagonist — reduces HR and myocardial contractility." },
  { drug:"Lisinopril",         back:"ACE inhibitor — blocks angiotensin I→II conversion, causing vasodilation and reducing afterload." },
  { drug:"Metformin",          back:"Biguanide — activates AMPK, decreasing hepatic gluconeogenesis and improving insulin sensitivity." },
  { drug:"Warfarin",           back:"Vitamin K antagonist — inhibits VKOR, blocking synthesis of clotting factors II, VII, IX, X." },
  { drug:"Simvastatin",        back:"HMG-CoA reductase inhibitor — reduces cholesterol synthesis, upregulates hepatic LDL receptors." },
  { drug:"Furosemide",         back:"Loop diuretic — inhibits Na⁺/K⁺/2Cl⁻ symporter in thick ascending limb of Henle." },
  { drug:"Ciprofloxacin",      back:"Fluoroquinolone — inhibits bacterial DNA gyrase (topo II) and topoisomerase IV." },
  { drug:"Salbutamol",         back:"SABA — activates β₂ receptors → ↑cAMP → bronchial smooth muscle relaxation." },
  { drug:"Morphine",           back:"Full μ-opioid receptor agonist — inhibits adenylyl cyclase, reduces neuronal excitability." },
  { drug:"Amoxicillin",        back:"β-lactam — inhibits transpeptidase (PBP), blocking peptidoglycan crosslinking." },
  { drug:"Aspirin",            back:"Irreversibly inhibits COX-1 and COX-2 → ↓PG and TXA₂ synthesis." },
  { drug:"Digoxin",            back:"Inhibits Na⁺/K⁺-ATPase → ↑intracellular Na⁺ → ↑Ca²⁺ → positive inotropy." },
  { drug:"Heparin",            back:"Binds antithrombin III → enhances inhibition of thrombin (IIa) and Factor Xa by ~1000×." },
  { drug:"Amlodipine",         back:"Dihydropyridine CCB — blocks L-type Ca²⁺ channels in vascular smooth muscle → vasodilation." },
  { drug:"Metoprolol",         back:"Cardioselective β₁ blocker — reduces HR, contractility, AV conduction; decreases renin." },
  { drug:"Spironolactone",     back:"Aldosterone receptor antagonist — blocks mineralocorticoid receptor in collecting duct → K⁺-sparing diuresis." },
  { drug:"Clopidogrel",        back:"Irreversibly blocks P2Y12 ADP receptor on platelets, preventing ADP-induced aggregation." },
  { drug:"Vancomycin",         back:"Glycopeptide — inhibits cell wall synthesis by binding D-Ala-D-Ala terminus of peptidoglycan precursors." },
  { drug:"Rifampicin",         back:"Inhibits bacterial DNA-dependent RNA polymerase (β-subunit), blocking mRNA transcription." },
  { drug:"Paracetamol",        back:"Central COX inhibition in CNS; reduces prostaglandin synthesis centrally (exact mechanism debated)." },
  { drug:"Ibuprofen",          back:"Reversibly inhibits COX-1 and COX-2 → ↓PG synthesis → analgesic, antipyretic, anti-inflammatory." },
  { drug:"Ondansetron",        back:"Selective 5-HT₃ antagonist — blocks serotonin-mediated vagal signaling in gut and CTZ." },
  { drug:"Ramipril",           back:"ACE inhibitor (prodrug → ramiprilat); same mechanism as lisinopril but prodrug requiring hepatic activation." },
  { drug:"Losartan",           back:"ARB — selectively blocks AT₁ receptor, preventing angiotensin II effects (vasodilation, ↓aldosterone)." },
  { drug:"Enalapril",          back:"ACE inhibitor prodrug (→enalaprilat); inhibits ACE → ↓Ang II, ↓aldosterone, vasodilation." },
  { drug:"Candesartan",        back:"ARB — irreversibly blocks AT₁ receptor; insurmountable antagonism of angiotensin II." },
  { drug:"Propranolol",        back:"Non-selective β₁/β₂ blocker — reduces HR, CO, renin; membrane-stabilising (class II antiarrhythmic)." },
  { drug:"Carvedilol",         back:"Non-selective β-blocker + α₁ blocker — reduces preload (α₁) and afterload (β); used in CHF." },
  { drug:"Bisoprolol",         back:"Highly cardioselective β₁ blocker — reduces HR and myocardial oxygen demand; used in HF and angina." },
  { drug:"Diltiazem",          back:"Non-dihydropyridine CCB — blocks L-type Ca²⁺ channels in heart and vasculature; rate-limiting." },
  { drug:"Verapamil",          back:"Non-DHP CCB — strongest cardiac effect; decreases SA node automaticity and AV conduction velocity." },
  { drug:"Hydrochlorothiazide",back:"Thiazide diuretic — inhibits Na⁺/Cl⁻ cotransporter (NCC) in distal convoluted tubule." },
  { drug:"Indapamide",         back:"Thiazide-like diuretic — inhibits NCC; also has direct vasodilatory properties." },
  { drug:"Atorvastatin",       back:"Statin — competitive inhibitor of HMG-CoA reductase; reduces LDL-C and ↑LDL receptors." },
  { drug:"Rosuvastatin",       back:"Most potent statin — inhibits HMG-CoA reductase with high liver selectivity; greatest LDL reduction." },
  { drug:"Ezetimibe",          back:"Inhibits NPC1L1 transporter in small intestine → blocks cholesterol absorption from gut." },
  { drug:"Glibenclamide",      back:"Sulphonylurea — closes ATP-sensitive K⁺ channels on β-cells → depolarisation → insulin secretion." },
  { drug:"Glipizide",          back:"Sulphonylurea — same mechanism; shorter duration than glibenclamide; less hypoglycaemia risk." },
  { drug:"Pioglitazone",       back:"Thiazolidinedione — PPARγ agonist → ↑insulin sensitivity in adipose, muscle, liver." },
  { drug:"Sitagliptin",        back:"DPP-4 inhibitor — blocks dipeptidyl peptidase-4 → ↑GLP-1 and GIP → glucose-dependent insulin secretion." },
  { drug:"Empagliflozin",      back:"SGLT-2 inhibitor — blocks glucose reabsorption in proximal tubule → glycosuria → blood glucose." },
  { drug:"Liraglutide",        back:"GLP-1 receptor agonist — stimulates glucose-dependent insulin secretion, suppresses glucagon, delays gastric emptying." },
  { drug:"Phenytoin",          back:"Voltage-gated Na⁺ channel blocker — stabilises inactive state; reduces neuronal firing frequency." },
  { drug:"Carbamazepine",      back:"Na⁺ channel blocker (use-dependent) — stabilises inactive Na⁺ channels; also used in trigeminal neuralgia." },
  { drug:"Valproate",          back:"Multiple mechanisms: ↑GABA (inhibits GABA-T), Na⁺ channel blockade, T-type Ca²⁺ channel inhibition." },
  { drug:"Levetiracetam",      back:"Binds synaptic vesicle protein SV2A — modulates neurotransmitter release; unique novel mechanism." },
  { drug:"Phenobarbitone",     back:"Barbiturate — positive allosteric modulator of GABA-A receptor; ↑Cl⁻ channel opening duration." },
  { drug:"Diazepam",           back:"Benzodiazepine — positive allosteric modulator of GABA-A; ↑frequency of Cl⁻ channel opening." },
  { drug:"Lorazepam",          back:"Benzodiazepine — same GABA-A modulation; high potency, intermediate duration; first-line status epilepticus." },
  { drug:"Clonazepam",         back:"Benzodiazepine — positive allosteric GABA-A modulator; used in myoclonic and absence seizures." },
  { drug:"Haloperidol",        back:"Typical antipsychotic — potent D₂ receptor antagonist in mesolimbic pathway." },
  { drug:"Risperidone",        back:"Atypical antipsychotic — D₂ + 5-HT₂A antagonist; 5-HT₂A blockade ↓EPS risk vs. typicals." },
  { drug:"Olanzapine",         back:"Atypical antipsychotic — antagonist at D₂, 5-HT₂A, H₁, M₁, α₁; high metabolic side-effect risk." },
  { drug:"Clozapine",          back:"Atypical antipsychotic — blocks D₄ > D₂; also 5-HT₂A, H₁, M, α; used in treatment-resistant schizophrenia." },
  { drug:"Fluoxetine",         back:"SSRI — selectively inhibits serotonin reuptake transporter (SERT) → ↑synaptic serotonin." },
  { drug:"Sertraline",         back:"SSRI — same SERT inhibition; first-line for depression, OCD, PTSD." },
  { drug:"Amitriptyline",      back:"TCA — blocks SERT + NET; also blocks H₁, mAChR, α₁ → significant side-effect profile." },
  { drug:"Venlafaxine",        back:"SNRI — inhibits both SERT and NET; dose-dependent NET inhibition; used in depression and anxiety." },
  { drug:"Lithium",            back:"Inhibits inositol monophosphatase → depletes IP₃/DAG second messengers; also modulates GSK-3β." },
  { drug:"Donepezil",          back:"Reversible AChE inhibitor — ↑synaptic acetylcholine in basal forebrain; used in Alzheimer's." },
  { drug:"Memantine",          back:"NMDA receptor antagonist (non-competitive) — blocks excessive glutamate excitotoxicity; moderate-severe AD." },
  { drug:"Levodopa",           back:"Dopamine precursor — crosses BBB, decarboxylated to dopamine by DOPA decarboxylase in brain." },
  { drug:"Pramipexole",        back:"Non-ergot dopamine agonist — binds D₂/D₃ receptors in striatum; used in PD and RLS." },
  { drug:"Selegiline",         back:"Selective MAO-B inhibitor — ↓dopamine breakdown in striatum; adjunct in Parkinson's disease." },
  { drug:"Amoxicillin-Clavulanate", back:"Amoxicillin (PBP inhibitor) + clavulanate (β-lactamase inhibitor → protects amoxicillin from resistance)." },
  { drug:"Piperacillin-Tazobactam", back:"Antipseudomonal β-lactam + β-lactamase inhibitor — broad-spectrum including Pseudomonas and ESBL organisms." },
  { drug:"Meropenem",          back:"Carbapenem — ultra-broad-spectrum β-lactam; inhibits PBPs; stable to most β-lactamases." },
  { drug:"Azithromycin",       back:"Macrolide — binds 50S ribosomal subunit (23S rRNA) → inhibits translocation of peptide chain." },
  { drug:"Erythromycin",       back:"Macrolide — binds 50S ribosome; also prokinetic via motilin receptor agonism." },
  { drug:"Doxycycline",        back:"Tetracycline — binds 30S ribosomal subunit → inhibits aminoacyl-tRNA binding to A-site." },
  { drug:"Clindamycin",        back:"Lincosamide — binds 50S ribosomal subunit; inhibits peptidyl transferase activity." },
  { drug:"Gentamicin",         back:"Aminoglycoside — binds 30S ribosome → causes misreading; uptake oxygen-dependent (inactive anaerobes)." },
  { drug:"Trimethoprim",       back:"Inhibits dihydrofolate reductase (bacterial) → blocks folate synthesis; bacteriostatic." },
  { drug:"Co-trimoxazole",     back:"Trimethoprim (DHFR) + sulfamethoxazole (DHPS) — sequential blockade of folate synthesis." },
  { drug:"Metronidazole",      back:"Prodrug — reduced to reactive nitroso radical in anaerobes/protozoa → DNA strand breaks." },
  { drug:"Fluconazole",        back:"Azole antifungal — inhibits CYP51 (lanosterol 14α-demethylase) → ↓ergosterol → membrane disruption." },
  { drug:"Amphotericin B",     back:"Polyene antifungal — binds ergosterol → pores in fungal membrane → K⁺ leakage and cell death." },
  { drug:"Acyclovir",          back:"Activated by viral thymidine kinase → acyclovir-TP → inhibits viral DNA polymerase (chain terminator)." },
  { drug:"Oseltamivir",        back:"Neuraminidase inhibitor — prevents viral shedding from infected cells; inhibits influenza A and B." },
  { drug:"Zidovudine (AZT)",   back:"NRTI — nucleoside analogue; incorporated into viral DNA → chain termination; inhibits HIV reverse transcriptase." },
  { drug:"Tenofovir",          back:"NRTI — nucleotide analogue; inhibits HIV and HBV reverse transcriptase; backbone of most ART regimens." },
  { drug:"Efavirenz",          back:"NNRTI — non-competitive allosteric inhibitor of HIV reverse transcriptase; once-daily dosing." },
  { drug:"Lopinavir",          back:"HIV protease inhibitor — blocks cleavage of viral polyprotein → immature, non-infectious virions." },
  { drug:"Dexamethasone",      back:"Potent synthetic glucocorticoid — binds GR → ↑anti-inflammatory gene transcription (lipocortin) and ↓cytokines." },
  { drug:"Prednisolone",       back:"Glucocorticoid — binds GR → ↑anti-inflammatory proteins, ↓NF-κB → ↓cytokines, adhesion molecules." },
  { drug:"Fludrocortisone",    back:"Synthetic mineralocorticoid — binds MR in collecting duct → ↑Na⁺ reabsorption, K⁺ and H⁺ excretion." },
  { drug:"Azathioprine",       back:"Prodrug → 6-mercaptopurine → inhibits purine synthesis → ↓lymphocyte proliferation (immunosuppressant)." },
  { drug:"Cyclosporin",        back:"Binds cyclophilin → complex inhibits calcineurin → ↓IL-2 transcription → ↓T-cell activation." },
  { drug:"Tacrolimus",         back:"Binds FKBP12 → complex inhibits calcineurin → ↓IL-2 → ↓T-cell activation; more potent than cyclosporin." },
  { drug:"Mycophenolate",      back:"Inhibits inosine monophosphate dehydrogenase (IMPDH) → ↓guanine synthesis → selective ↓lymphocyte proliferation." },
  { drug:"Infliximab",         back:"Anti-TNFα monoclonal antibody (chimeric) — neutralises soluble and membrane-bound TNFα." },
  { drug:"Adalimumab",         back:"Anti-TNFα monoclonal antibody (fully human) — same mechanism as infliximab." },
  { drug:"Rituximab",          back:"Anti-CD20 monoclonal antibody — depletes B-cells via CDC, ADCC, and direct apoptosis." },
  { drug:"Trastuzumab",        back:"Anti-HER2 monoclonal antibody — blocks HER2 dimerisation and downstream PI3K/Akt signalling." },
  { drug:"Imatinib",           back:"Tyrosine kinase inhibitor — selectively inhibits BCR-ABL, c-KIT, and PDGFR; first targeted cancer therapy." },
  { drug:"Cyclophosphamide",   back:"Alkylating agent — crosslinks DNA strands (N-7 guanine); cell cycle non-specific cytotoxic." },
  { drug:"Cisplatin",          back:"Platinum alkylating agent — forms intrastrand and interstrand DNA crosslinks → apoptosis." },
  { drug:"Doxorubicin",        back:"Anthracycline — intercalates DNA + inhibits topoisomerase II; also generates free radicals." },
  { drug:"Tamoxifen",          back:"SERM — competitive oestrogen receptor antagonist in breast tissue; agonist in bone/endometrium." },
  { drug:"Anastrozole",        back:"Aromatase inhibitor — blocks conversion of androgens → oestrogens; used in ER+ post-menopausal breast cancer." },
  { drug:"Allopurinol",        back:"Xanthine oxidase inhibitor → ↓uric acid production; used in gout prophylaxis." },
  { drug:"Colchicine",         back:"Binds tubulin → inhibits microtubule polymerisation → prevents neutrophil migration into joints." },
  { drug:"Omalizumab",         back:"Anti-IgE monoclonal antibody — binds free IgE → prevents mast cell and basophil degranulation." },
  { drug:"Montelukast",        back:"Leukotriene receptor antagonist (CysLT1) — blocks bronchoconstriction and mucus secretion in asthma." },
  { drug:"Theophylline",       back:"Non-selective phosphodiesterase inhibitor → ↑cAMP/cGMP → bronchodilation; also adenosine antagonism." },
  { drug:"Ipratropium",        back:"Muscarinic antagonist (M₃) — blocks parasympathetic bronchoconstriction; non-selective antimuscarinic." },
  { drug:"Tiotropium",         back:"Long-acting M₃ muscarinic antagonist (LAMA) — once-daily bronchodilator for COPD." },
];

const classificationData = [
  { drug:"Amlodipine",         back:"CCB — dihydropyridine class, vascular selective, once-daily antihypertensive" },
  { drug:"Ranitidine",         back:"H₂ receptor antagonist — competitive, reversible gastric acid reducer" },
  { drug:"Diphenhydramine",    back:"First-generation H₁ antihistamine — highly sedating, anticholinergic" },
  { drug:"Albuterol",          back:"SABA (short-acting β₂ agonist) — rescue bronchodilator in asthma/COPD" },
  { drug:"Levothyroxine",      back:"Synthetic thyroid hormone (T4 analogue) — hypothyroidism replacement" },
  { drug:"Insulin glargine",   back:"Long-acting basal insulin analogue — peakless 24-hour subcutaneous insulin" },
  { drug:"Clopidogrel",        back:"P2Y12 ADP receptor inhibitor — thienopyridine prodrug, irreversible antiplatelet" },
  { drug:"Morphine",           back:"Opioid analgesic — full μ-opioid receptor agonist, Schedule II" },
  { drug:"Carbamazepine",      back:"Antiepileptic — iminostilbene class, Na⁺ channel blocker; mood stabiliser" },
  { drug:"Metformin",          back:"Biguanide antidiabetic — first-line type 2 DM, insulin sensitiser" },
  { drug:"Atorvastatin",       back:"Statin — HMG-CoA reductase inhibitor, hypolipidaemic agent" },
  { drug:"Omeprazole",         back:"Proton pump inhibitor (PPI) — benzimidazole class, acid suppressant" },
  { drug:"Aspirin",            back:"NSAID (low-dose: antiplatelet; standard: analgesic/antipyretic/anti-inflammatory)" },
  { drug:"Heparin",            back:"Anticoagulant — indirect thrombin inhibitor via antithrombin III (UFH/LMWH)" },
  { drug:"Vancomycin",         back:"Glycopeptide antibiotic — cell wall synthesis inhibitor, MRSA treatment" },
  { drug:"Rifampicin",         back:"Antitubercular — RNA polymerase inhibitor, potent CYP450 inducer" },
  { drug:"Digoxin",            back:"Cardiac glycoside — Na⁺/K⁺-ATPase inhibitor, positive inotrope/rate control" },
  { drug:"Spironolactone",     back:"K⁺-sparing diuretic — aldosterone receptor antagonist (mineralocorticoid receptor)" },
  { drug:"Furosemide",         back:"Loop diuretic — sulfonamide-derived NKCC2 inhibitor (thick ascending limb)" },
  { drug:"Ibuprofen",          back:"Non-selective NSAID — reversible COX-1/COX-2 inhibitor" },
  { drug:"Ondansetron",        back:"Antiemetic — selective 5-HT₃ receptor antagonist" },
  { drug:"Paracetamol",        back:"Non-opioid analgesic/antipyretic — NOT classified as NSAID (no anti-inflammatory at standard dose)" },
  { drug:"Metoprolol",         back:"Cardioselective β₁ blocker — used in hypertension, angina, HF, rate control" },
  { drug:"Ciprofloxacin",      back:"2nd-generation fluoroquinolone — broad-spectrum bactericidal (gram-negative + atypicals)" },
  { drug:"Losartan",           back:"ARB (angiotensin receptor blocker, AT₁) — antihypertensive, nephroprotective in DM" },
  { drug:"Ramipril",           back:"ACE inhibitor — prodrug (→ramiprilat); cardioprotective post-MI, HF, nephroprotective" },
  { drug:"Verapamil",          back:"Non-DHP CCB — rate-limiting; Class IV antiarrhythmic; negative chronotrope/inotrope" },
  { drug:"Diltiazem",          back:"Non-DHP CCB — intermediate rate/vasodilatory effects; Class IV antiarrhythmic" },
  { drug:"Propranolol",        back:"Non-selective β₁/β₂ blocker — Class II antiarrhythmic; also anxiety, migraine prophylaxis" },
  { drug:"Bisoprolol",         back:"Highly selective β₁ blocker — first-line in HFrEF (evidence-based mortality benefit)" },
  { drug:"Carvedilol",         back:"Non-selective β + α₁ blocker — used in HFrEF, portal hypertension, post-MI LV dysfunction" },
  { drug:"Glibenclamide",      back:"Sulphonylurea (SU) — insulin secretagogue; second-generation, K⁺-channel blocker" },
  { drug:"Pioglitazone",       back:"Thiazolidinedione (TZD) — PPARγ agonist, insulin sensitiser; reduces TG, raises HDL" },
  { drug:"Sitagliptin",        back:"DPP-4 inhibitor (gliptin) — incretin enhancer; weight-neutral, low hypoglycaemia risk" },
  { drug:"Empagliflozin",      back:"SGLT-2 inhibitor (flozin) — glucosuric; cardiorenal protective beyond glucose lowering" },
  { drug:"Liraglutide",        back:"GLP-1 receptor agonist — promotes weight loss, glucose-dependent insulin, CV benefit" },
  { drug:"Azithromycin",       back:"Macrolide antibiotic — broad spectrum including atypicals; hepatic excretion; long tissue t½" },
  { drug:"Doxycycline",        back:"Tetracycline antibiotic — broad-spectrum bacteriostatic; covers atypicals, MRSA (skin), malaria" },
  { drug:"Amoxicillin-Clavulanate", back:"β-lactam/β-lactamase inhibitor combination — broader coverage than amoxicillin alone" },
  { drug:"Co-trimoxazole",     back:"Antibiotic combination (TMP + SMX) — antifolate (sequential blockade); PCP prophylaxis" },
  { drug:"Metronidazole",      back:"Nitroimidazole antibiotic/antiprotozoal — active against anaerobes, C. diff, protozoa" },
  { drug:"Fluconazole",        back:"Azole antifungal — CYP51 inhibitor; used in Candida and Cryptococcus infections" },
  { drug:"Acyclovir",          back:"Nucleoside antiviral — selective anti-herpetic (HSV1/2, VZV); requires viral TK activation" },
  { drug:"Oseltamivir",        back:"Neuraminidase inhibitor antiviral — active against influenza A and B" },
  { drug:"Prednisolone",       back:"Glucocorticoid — anti-inflammatory/immunosuppressant; synthetic cortisol analogue" },
  { drug:"Azathioprine",       back:"Antimetabolite immunosuppressant — prodrug → 6-MP; inhibits purine synthesis in lymphocytes" },
  { drug:"Cyclosporin",        back:"Calcineurin inhibitor — immunosuppressant; used in transplantation, autoimmune disease" },
  { drug:"Infliximab",         back:"Biologic (anti-TNFα) — chimeric monoclonal antibody; used in IBD, RA, psoriasis" },
  { drug:"Rituximab",          back:"Biologic (anti-CD20) — B-cell depleting monoclonal antibody; NHL, CLL, RA, MS" },
  { drug:"Imatinib",           back:"BCR-ABL tyrosine kinase inhibitor — targeted therapy; CML, GIST" },
  { drug:"Cyclophosphamide",   back:"Alkylating agent chemotherapy — cell-cycle non-specific; also immunosuppressant" },
  { drug:"Tamoxifen",          back:"SERM (selective oestrogen receptor modulator) — ER+ breast cancer adjuvant therapy" },
  { drug:"Allopurinol",        back:"Xanthine oxidase inhibitor — urate-lowering; gout prophylaxis" },
  { drug:"Colchicine",         back:"Anti-gout/anti-inflammatory — microtubule disruption, neutrophil migration inhibitor" },
  { drug:"Montelukast",        back:"CysLT1 leukotriene receptor antagonist — allergic rhinitis, mild-moderate asthma add-on" },
  { drug:"Theophylline",       back:"PDE inhibitor + adenosine antagonist — bronchodilator; narrow therapeutic index" },
  { drug:"Fluoxetine",         back:"SSRI (serotonin-selective reuptake inhibitor) — antidepressant; longest t½ of SSRIs" },
  { drug:"Amitriptyline",      back:"TCA (tricyclic antidepressant) — SERT+NET inhibitor + H₁+mAChR+α₁ antagonist" },
  { drug:"Diazepam",           back:"Benzodiazepine — GABA-A positive modulator; anxiolytic, anticonvulsant, muscle relaxant" },
  { drug:"Haloperidol",        back:"Typical (first-generation) antipsychotic — high-potency D₂ antagonist" },
  { drug:"Risperidone",        back:"Atypical (second-generation) antipsychotic — D₂ + 5-HT₂A antagonist" },
  { drug:"Lithium",            back:"Mood stabiliser — first-line in bipolar disorder; narrow TI (0.6–1.2 mmol/L)" },
  { drug:"Levodopa",           back:"Dopamine precursor/antiparkinson — combined with carbidopa/benserazide (peripheral decarboxylase inhibitor)" },
  { drug:"Donepezil",          back:"Reversible AChE inhibitor — anticholinesterase; Alzheimer's disease management" },
  { drug:"Warfarin",           back:"Vitamin K antagonist anticoagulant — oral, narrow TI; monitored by INR" },
  { drug:"Enoxaparin",         back:"LMWH anticoagulant — anti-Xa > anti-IIa; once/twice daily SC; VTE prophylaxis/treatment" },
  { drug:"Apixaban",           back:"Direct oral anticoagulant (DOAC) — direct Factor Xa inhibitor; fixed dosing" },
  { drug:"Dabigatran",         back:"DOAC — direct thrombin (IIa) inhibitor; only DOAC reversible by idarucizumab" },
  { drug:"Glyceryl trinitrate",back:"Organic nitrate — NO donor → ↑cGMP → vascular smooth muscle relaxation (venodilator)" },
  { drug:"Isosorbide mononitrate", back:"Long-acting organic nitrate — requires eccentric dosing to prevent tolerance" },
  { drug:"Ivermectin",         back:"Antiparasitic — opens glutamate-gated Cl⁻ channels in invertebrates → paralysis" },
  { drug:"Mebendazole",        back:"Anthelmintic — inhibits microtubule synthesis (tubulin polymerisation) in helminths" },
  { drug:"Chloroquine",        back:"Antimalarial — concentrates in parasite food vacuole; inhibits haem polymerisation → haem toxicity" },
  { drug:"Artemether",         back:"Artemisinin-based antimalarial — generates reactive oxygen species that damage parasite proteins" },
  { drug:"Hydralazine",        back:"Direct arterial vasodilator — opens K⁺ channels → hyperpolarisation → vascular smooth muscle relaxation" },
  { drug:"Methyldopa",         back:"Central α₂ agonist — reduces sympathetic outflow; used in hypertension in pregnancy" },
  { drug:"Clonidine",          back:"Central α₂ agonist — reduces sympathetic outflow; used in hypertension, ADHD, opioid withdrawal" },
  { drug:"Desmopressin",       back:"Synthetic ADH (V2 agonist) — ↑water reabsorption in collecting duct; used in DI and enuresis" },
  { drug:"Folic acid",         back:"Vitamin B9 supplement — substrate for DNA synthesis; used in megaloblastic anaemia, pregnancy" },
  { drug:"Iron (oral)",        back:"Haematinic — provides Fe²⁺ for haemoglobin synthesis; treats iron-deficiency anaemia" },
  { drug:"Erythropoietin",     back:"Recombinant glycoprotein hormone — stimulates erythropoiesis via EPO receptor on RBC precursors" },
  { drug:"Filgrastim",         back:"Recombinant G-CSF — stimulates neutrophil production and release from bone marrow" },
  { drug:"Adrenaline (Epi)",   back:"Catecholamine — non-selective α + β₁ + β₂ agonist; first-line in anaphylaxis and cardiac arrest" },
  { drug:"Noradrenaline",      back:"Catecholamine — α₁ + β₁ agonist (minimal β₂); vasopressor of choice in septic shock" },
  { drug:"Dopamine",           back:"Catecholamine — dose-dependent: low=D₁ (renal); medium=β₁; high=α₁ vasoconstriction" },
  { drug:"Dobutamine",         back:"Synthetic catecholamine — β₁ > β₂ agonist; positive inotrope; used in acute decompensated HF" },
  { drug:"Atropine",           back:"Competitive muscarinic antagonist — blocks vagal tone; used in bradycardia, organophosphate poisoning" },
  { drug:"Suxamethonium",      back:"Depolarising neuromuscular blocker — acts as nicotinic ACh receptor agonist; ultra-short acting" },
  { drug:"Rocuronium",         back:"Non-depolarising NMBA — competitive nicotinic ACh antagonist; reversed by sugammadex" },
  { drug:"Fentanyl",           back:"Potent opioid analgesic — highly lipophilic, rapid onset; used in anaesthesia and chronic pain" },
  { drug:"Ketamine",           back:"Dissociative anaesthetic — NMDA receptor antagonist; preserves airway reflexes and BP" },
  { drug:"Propofol",           back:"IV anaesthetic — potentiates GABA-A + inhibits NMDA; rapid onset/offset; used in TIVA" },
  { drug:"Lidocaine",          back:"Local anaesthetic + Class Ib antiarrhythmic — Na⁺ channel blocker (use-dependent); also systemic IV antiarrhythmic." },
  { drug:"Bupivacaine",        back:"Long-acting amide local anaesthetic — Na⁺ channel blocker; used in epidurals and nerve blocks" },
];

const sideEffectsData = [
  { drug:"Metformin",          back:"GI upset (nausea, diarrhoea, metallic taste), lactic acidosis (rare; avoid in eGFR<30), B12 deficiency (long-term)." },
  { drug:"Warfarin",           back:"Bleeding (major risk), skin necrosis (protein C deficiency), teratogenicity, purple toe syndrome, hair loss." },
  { drug:"Furosemide",         back:"Hypokalaemia, hyponatraemia, ototoxicity (high IV doses), hyperuricaemia, dehydration, metabolic alkalosis." },
  { drug:"Ciprofloxacin",      back:"Tendinopathy/rupture (Achilles), QT prolongation, peripheral neuropathy, CNS effects (seizures rare)." },
  { drug:"Lisinopril",         back:"Dry persistent cough (bradykinin), hyperkalaemia, angioedema, first-dose hypotension, renal impairment." },
  { drug:"Atenolol",           back:"Bradycardia, fatigue, cold extremities, bronchospasm (avoid in asthma), masking hypoglycaemia symptoms." },
  { drug:"Simvastatin",        back:"Myopathy/rhabdomyolysis (especially + CYP3A4 inhibitors), elevated transaminases, GI disturbance." },
  { drug:"Amoxicillin",        back:"Hypersensitivity/anaphylaxis, GI upset, maculopapular rash (especially in EBV mono), C. difficile." },
  { drug:"Morphine",           back:"Respiratory depression, constipation, nausea/vomiting, miosis, urinary retention, dependence, itching (histamine)." },
  { drug:"Omeprazole",         back:"Hypomagnesaemia, C. difficile risk, B12 deficiency, rebound acid hypersecretion on withdrawal, osteoporosis." },
  { drug:"Methotrexate",       back:"Hepatotoxicity, myelosuppression, mucositis, pneumonitis, teratogenicity (must give folate supplementation)." },
  { drug:"Carbamazepine",      back:"Stevens-Johnson syndrome (HLA-B*1502 in Han Chinese), SIADH/hyponatraemia, diplopia, ataxia, teratogenic." },
  { drug:"Aspirin",            back:"GI ulceration/bleeding, Reye's syndrome (children <12), salicylism (tinnitus), bronchospasm in aspirin-sensitive." },
  { drug:"Heparin",            back:"Bleeding, HIT (heparin-induced thrombocytopaenia, type II = thrombosis paradox), hyperkalaemia, osteoporosis." },
  { drug:"Vancomycin",         back:"Red man syndrome (rapid infusion → histamine release), nephrotoxicity, ototoxicity, thrombophlebitis." },
  { drug:"Digoxin",            back:"Nausea, xanthopsia (yellow-green vision), bradyarrhythmias, narrow TI — toxicity aggravated by hypokalaemia." },
  { drug:"Spironolactone",     back:"Hyperkalaemia, gynaecomastia (anti-androgen effect), menstrual irregularities, renal impairment." },
  { drug:"Amlodipine",         back:"Peripheral oedema (ankle/leg), flushing, headache; generally no reflex tachycardia unlike nifedipine." },
  { drug:"Ibuprofen",          back:"GI irritation/peptic ulcers, renal impairment, fluid retention, cardiovascular risk, bronchospasm (aspirin-sensitive)." },
  { drug:"Rifampicin",         back:"Orange discolouration of body fluids (urine, tears, sweat), hepatotoxicity, potent CYP inducer → many interactions." },
  { drug:"Paracetamol",        back:"Hepatotoxicity in overdose (NAPQI → GSH depletion → hepatocyte necrosis); otherwise very safe." },
  { drug:"Ondansetron",        back:"QT prolongation (dose-dependent), headache, constipation, serotonin syndrome risk (with other serotonergic drugs)." },
  { drug:"Metoprolol",         back:"Bradycardia, fatigue, cold extremities, worsening HF if started in decompensated state, sexual dysfunction." },
  { drug:"Clopidogrel",        back:"Bleeding, TTP (rare), GI upset; variable response in poor CYP2C19 metabolisers ('clopidogrel resistance')." },
  { drug:"Losartan",           back:"Hyperkalaemia, renal impairment, dizziness, first-dose hypotension; no cough (unlike ACE inhibitors)." },
  { drug:"Ramipril",           back:"ACE inhibitor class effects: cough (10–15%), hyperkalaemia, angioedema, first-dose hypotension." },
  { drug:"Atorvastatin",       back:"Myalgia/myopathy, rarely rhabdomyolysis, elevated transaminases, GI upset, new-onset diabetes (class effect)." },
  { drug:"Doxycycline",        back:"Photosensitivity, oesophageal ulceration (sit upright after dose), teratogenic, not for children <8 years." },
  { drug:"Azithromycin",       back:"QT prolongation (cardiac risk), GI upset, rarely hepatotoxicity, rare cholestatic jaundice." },
  { drug:"Metronidazole",      back:"Metallic taste, nausea, peripheral neuropathy (prolonged use), disulfiram-like reaction with alcohol." },
  { drug:"Fluconazole",        back:"Hepatotoxicity, QT prolongation, GI upset; potent CYP2C9 inhibitor (↑warfarin levels significantly)." },
  { drug:"Acyclovir",          back:"Nephrotoxicity (crystal nephropathy — ensure hydration), neurotoxicity (high dose IV), local phlebitis IV." },
  { drug:"Cyclosporin",        back:"Nephrotoxicity, hypertension, gingival hyperplasia, hirsutism, neurotoxicity, hyperlipidaemia." },
  { drug:"Prednisolone",       back:"Cushing's syndrome, diabetes, osteoporosis, immunosuppression, peptic ulcers, HPA axis suppression, weight gain." },
  { drug:"Azathioprine",       back:"Myelosuppression, hepatotoxicity, GI intolerance, ↑infection risk; interaction with allopurinol (↑toxicity)." },
  { drug:"Cyclophosphamide",   back:"Haemorrhagic cystitis (acrolein), myelosuppression, alopecia, infertility, secondary malignancy (bladder)." },
  { drug:"Tamoxifen",          back:"Endometrial cancer, DVT/PE (thromboembolism), hot flushes, vaginal discharge; beneficial in bone density." },
  { drug:"Allopurinol",        back:"Hypersensitivity syndrome (DRESS — especially HLA-B*5801 in Han Chinese), acute gout flare on initiation." },
  { drug:"Haloperidol",        back:"EPS (dystonia, akathisia, tardive dyskinesia), neuroleptic malignant syndrome, QT prolongation, sedation." },
  { drug:"Lithium",            back:"Tremor, polyuria/polydipsia (NDI), hypothyroidism, weight gain, acne; toxicity: tremor, ataxia, confusion, seizures." },
  { drug:"Carvedilol",         back:"Dizziness (α₁ blockade), bradycardia, fatigue, hypotension, fluid retention; caution in severe HF." },
  { drug:"Diazepam",           back:"Sedation, tolerance and dependence, respiratory depression (high doses), anterograde amnesia." },
  { drug:"Levodopa",           back:"Dyskinesias (peak-dose), wearing off, on-off fluctuations, nausea, orthostatic hypotension, psychosis (dopamine excess)." },
  { drug:"Amitriptyline",      back:"Anticholinergic (dry mouth, urinary retention, constipation, blurred vision), cardiac arrhythmias, sedation (H₁), weight gain." },
  { drug:"Fluoxetine",         back:"GI (nausea, diarrhoea), sexual dysfunction, insomnia, serotonin syndrome (+ MAOIs), hyponatraemia (SIADH)." },
  { drug:"Valproate",          back:"Teratogenicity (neural tube defects — avoid in women of childbearing potential), hepatotoxicity, pancreatitis, weight gain, tremor." },
  { drug:"Phenytoin",          back:"Gingival hyperplasia, hirsutism, coarsening of facies, ataxia, nystagmus, hypersensitivity, osteoporosis, teratogenic." },
  { drug:"Glibenclamide",      back:"Hypoglycaemia (most significant SU concern), weight gain, GI upset, rarely cholestatic jaundice." },
  { drug:"Pioglitazone",       back:"Fluid retention/oedema, heart failure risk, weight gain, bladder cancer risk (prolonged use), fractures." },
  { drug:"Sitagliptin",        back:"Pancreatitis (rare class concern), nasopharyngitis, UTI; generally well tolerated." },
  { drug:"Empagliflozin",      back:"Genital mycotic infections (glycosuria), UTI, DKA (rare euglycaemic), volume depletion, Fournier's gangrene." },
  { drug:"Liraglutide",        back:"Nausea/vomiting (GLP-1 common), pancreatitis risk, medullary thyroid cancer concern (rodent data), injection site reactions." },
  { drug:"Adrenaline",         back:"Tachycardia, hypertension, anxiety, arrhythmias (at high doses); tissue necrosis if extravasated." },
  { drug:"Atropine",           back:"Dry mouth, urinary retention, constipation, blurred vision, tachycardia, hyperthermia, confusion (elderly)." },
  { drug:"Dexamethasone",      back:"Same as prednisolone but more potent; adrenal suppression, hyperglycaemia, osteoporosis, immunosuppression." },
  { drug:"Amphotericin B",     back:"Infusion-related reactions (fever, rigors), nephrotoxicity, hypokalaemia, hypomagnesaemia — use lipid formulation." },
  { drug:"Gentamicin",         back:"Nephrotoxicity and ototoxicity (vestibular + cochlear); requires peak and trough monitoring." },
  { drug:"Lidocaine (IV)",     back:"CNS toxicity (perioral tingling, confusion, seizures), cardiac arrhythmias (LA toxicity); Bupivacaine more cardiotoxic." },
  { drug:"Tacrolimus",         back:"Nephrotoxicity, neurotoxicity, hypertension, diabetes mellitus (more than cyclosporin), hyperkalaemia." },
  { drug:"Infliximab",         back:"Reactivation of TB/hepatitis B (screen first), infection risk, infusion reactions, demyelination, heart failure worsening." },
  { drug:"Rituximab",          back:"Infusion reactions, PML (progressive multifocal leukoencephalopathy), prolonged B-cell depletion, hepatitis B reactivation." },
  { drug:"Trastuzumab",        back:"Cardiotoxicity (reversible LV dysfunction) — monitor LVEF; hypersensitivity, infusion reactions." },
  { drug:"Cisplatin",          back:"Nephrotoxicity (major — require vigorous hydration), ototoxicity, peripheral neuropathy, nausea/vomiting (most emetogenic)." },
  { drug:"Doxorubicin",        back:"Cardiotoxicity (irreversible cardiomyopathy — cumulative dose-dependent), myelosuppression, alopecia, extravasation injury." },
  { drug:"Glyceryl trinitrate",back:"Headache (vasodilation), flushing, hypotension, tolerance with continuous use (eccentric dosing needed)." },
  { drug:"Clindamycin",        back:"C. difficile-associated diarrhoea/colitis (highest risk of any antibiotic), GI upset, metallic taste." },
  { drug:"Trimethoprim",       back:"Hyperkalaemia (blocks collecting duct K⁺ secretion like amiloride), folate deficiency, GI upset, rash." },
  { drug:"Hydralazine",        back:"Reflex tachycardia, lupus-like syndrome (with high doses, slow acetylators), headache, fluid retention." },
  { drug:"Methyldopa",         back:"Sedation, positive Coombs' test (haemolytic anaemia), hepatotoxicity, depression; safe in pregnancy." },
  { drug:"Montelukast",        back:"Neuropsychiatric effects (mood changes, nightmares — FDA black box warning), headache, GI upset." },
  { drug:"Theophylline",       back:"Nausea/vomiting, tremor, tachyarrhythmias, seizures (toxic); narrow TI — monitor serum levels." },
  { drug:"Chloroquine",        back:"Retinopathy (dose-dependent, potentially irreversible), GI upset, pruritus (especially in dark-skinned patients), QT prolongation." },
  { drug:"Suxamethonium",      back:"Hyperkalaemia (dangerous in burns, crush injury), malignant hyperthermia, prolonged paralysis (pseudocholinesterase deficiency), bradycardia." },
  { drug:"Propofol",           back:"Propofol infusion syndrome (rare — metabolic acidosis, cardiac failure), pain on injection, hypotension, hyperlipidaemia." },
  { drug:"Ketamine",           back:"Emergence reactions/hallucinations (give midazolam), hypertension, tachycardia, increased secretions, raised ICP." },
  { drug:"Mycophenolate",      back:"GI toxicity (diarrhoea, nausea), myelosuppression, ↑infection risk, teratogenicity (strict pregnancy prevention)." },
  { drug:"Fentanyl",           back:"Chest wall rigidity (rapid IV injection), respiratory depression, tolerance and dependence, less GI/histamine than morphine." },
  { drug:"Oseltamivir",        back:"Nausea/vomiting (take with food), rare neuropsychiatric events reported (mainly in children in Japan)." },
  { drug:"Tenofovir",          back:"Nephrotoxicity (proximal tubular injury → Fanconi syndrome), decreased bone mineral density, GI upset." },
  { drug:"Zidovudine",         back:"Myelosuppression (anaemia, neutropaenia), myopathy (mitochondrial), nail pigmentation, lactic acidosis." },
  { drug:"Imatinib",           back:"Oedema (periorbital, peripheral), nausea, myelosuppression, hepatotoxicity, muscle cramps, rash." },
  { drug:"Anastrozole",        back:"Arthralgias/myalgias, hot flushes, osteoporosis, menopausal symptoms; no uterine cancer risk (unlike tamoxifen)." },
  { drug:"Colchicine",         back:"GI toxicity (diarrhoea — dose-limiting), myopathy (long-term), myelosuppression (rare), teratogenicity." },
  { drug:"Omalizumab",         back:"Injection site reactions, rare anaphylaxis (observe 30–60 min post-injection), malignancy (theoretical concern)." },
  { drug:"Erythropoietin",     back:"Hypertension, thromboembolic events, pure red cell aplasia (anti-EPO antibodies), flu-like symptoms." },
  { drug:"Hydrochlorothiazide",back:"Hypokalaemia, hyponatraemia, hyperuricaemia, hyperglycaemia, hypercalcaemia, dyslipidaemia." },
];

const pharmacokineticsData = [
  { drug:"Warfarin",           back:"Oral BA ~100%; protein-bound 99%; CYP2C9 metabolism; t½ 36–42h; renal excretion of metabolites." },
  { drug:"Metformin",          back:"Oral BA 50–60%; NOT protein-bound; no hepatic metabolism; excreted unchanged renally; t½ ~4–8h." },
  { drug:"Omeprazole",         back:"Acid-labile prodrug (enteric coated); BA 35–65%; CYP2C19/3A4; t½ ~1h; clinical effect lasts 24h." },
  { drug:"Furosemide",         back:"Oral BA ~50% (variable); protein-bound 98%; renally excreted 50% unchanged; t½ ~2h." },
  { drug:"Lisinopril",         back:"NOT a prodrug; oral BA ~25%; not protein-bound; excreted unchanged renally; t½ ~12h." },
  { drug:"Morphine",           back:"Oral BA ~30% (first-pass); glucuronidation → active M6G; renally excreted; t½ ~2–4h." },
  { drug:"Amoxicillin",        back:"Oral BA ~90%; protein binding 18%; renal excretion 60% unchanged; t½ ~1h." },
  { drug:"Atenolol",           back:"Oral BA ~50%; hydrophilic (minimal CNS penetration); no hepatic metabolism; renally excreted; t½ ~6–9h." },
  { drug:"Ciprofloxacin",      back:"Oral BA ~70–80%; large Vd; hepatic + renal elimination; t½ ~4h; chelated by antacids (↓absorption)." },
  { drug:"Simvastatin",        back:"Extensive first-pass (prodrug → active acid); CYP3A4; t½ ~2h; oral BA ~5%." },
  { drug:"Methotrexate",       back:"Low-dose: good oral BA; high-dose IV preferred; intracellular polyglutamation prolongs effect; renal excretion; t½ 3–10h." },
  { drug:"Carbamazepine",      back:"Slow oral absorption; autoinduction → t½ 24–65h → 12–17h; active 10,11-epoxide metabolite." },
  { drug:"Aspirin",            back:"Rapidly absorbed; hydrolysed to salicylate; t½ aspirin ~20min, salicylate 2–3h; dose-dependent kinetics at high doses." },
  { drug:"Heparin",            back:"IV/SC only; highly protein-bound; metabolised by heparinase; t½ ~90min; dose-dependent clearance." },
  { drug:"Digoxin",            back:"Oral BA ~70–80%; large Vd; renally excreted unchanged; t½ ~36–48h; ↑t½ in renal failure." },
  { drug:"Vancomycin",         back:"IV only (oral not absorbed systemically); protein binding 55%; renally excreted; t½ ~4–6h; AUC/MIC monitoring." },
  { drug:"Amlodipine",         back:"Oral BA ~64%; protein-bound 98%; CYP3A4; very long t½ ~35–50h → once-daily dosing." },
  { drug:"Spironolactone",     back:"Oral; extensive first-pass → active canrenone; protein binding >90%; t½ spiro ~1.4h; canrenone ~16–20h." },
  { drug:"Rifampicin",         back:"Oral BA ~95%; hepatic acetylation; autoinducer; t½ ~3h (decreases with time); faecal + renal." },
  { drug:"Ibuprofen",          back:"Oral BA ~80%; highly protein-bound 99%; hepatic oxidation; t½ ~2h; renal excretion." },
  { drug:"Paracetamol",        back:"Oral BA ~90%; low protein binding; hepatic glucuronidation/sulphation; t½ ~2h; renal excretion." },
  { drug:"Clopidogrel",        back:"Prodrug; CYP2C19 activation; active metabolite t½ ~30min; irreversible platelet effect lasts 7–10 days." },
  { drug:"Ondansetron",        back:"Oral BA ~60%; CYP3A4/1A2; t½ ~5–6h; hepatic excretion; dose reduction in liver impairment." },
  { drug:"Metoprolol",         back:"Oral BA ~50% (first-pass); CYP2D6; t½ ~3–7h; renally excreted; lipophilic → CNS penetration." },
  { drug:"Losartan",           back:"Prodrug → active EXP3174 (CYP2C9/3A4); oral BA ~33%; t½ losartan ~2h, EXP3174 ~6–9h; renally excreted." },
  { drug:"Ramipril",           back:"Prodrug → ramiprilat (hepatic esterases); oral BA ramipril ~60%; ramiprilat protein-bound 73%; t½ ~13–17h." },
  { drug:"Atorvastatin",       back:"Oral BA ~14% (first-pass); active metabolites contribute; CYP3A4; t½ ~14h; faecal excretion." },
  { drug:"Azithromycin",       back:"Oral BA ~37%; large Vd (concentrated in tissues); long t½ ~68h; hepatic/biliary excretion; no CYP3A4 induction." },
  { drug:"Doxycycline",        back:"Oral BA ~93%; protein-bound 90%; t½ ~18h (not impaired by renal failure); faecal + renal excretion." },
  { drug:"Metronidazole",      back:"Oral BA ~100%; CNS penetration (small Vd in CNS); hepatic oxidation + glucuronidation; t½ ~8h; renal." },
  { drug:"Fluconazole",        back:"Oral BA ~90%; low protein binding (11%); renal excretion ~80% unchanged; t½ ~30h; good CNS penetration." },
  { drug:"Acyclovir",          back:"Oral BA ~15–30% (prodrug valaciclovir → 55%); poor protein binding; renal excretion; t½ ~2.5–3.5h." },
  { drug:"Prednisolone",       back:"Oral BA ~70–80%; hepatic metabolism; active form of prednisone; t½ ~2–3h (biological effect 18–36h)." },
  { drug:"Cyclosporin",        back:"Erratic oral BA (25–50%); highly lipophilic; large Vd; CYP3A4/P-gp substrate; t½ ~19h; faecal excretion." },
  { drug:"Tacrolimus",         back:"Oral BA variable (5–67%); CYP3A4/P-gp; narrow TI — TDM mandatory; t½ ~12h; primarily faecal." },
  { drug:"Phenytoin",          back:"Non-linear (Michaelis-Menten) kinetics at therapeutic range; highly protein-bound; CYP2C9/2C19; t½ variable 20–60h." },
  { drug:"Valproate",          back:"Oral BA ~100%; highly protein-bound (90%); hepatic β-oxidation + glucuronidation; t½ ~9–16h." },
  { drug:"Diazepam",           back:"Oral BA ~100%; highly protein-bound (98%); active metabolite (desmethyldiazepam t½ 36–200h); CYP2C19/3A4." },
  { drug:"Lithium",            back:"Complete oral absorption; NOT protein-bound; not metabolised; renal excretion exclusively; t½ ~24h." },
  { drug:"Haloperidol",        back:"Oral BA ~60–70%; hepatic glucuronidation + CYP3A4; t½ ~12–36h; long-acting depot forms available." },
  { drug:"Levodopa",           back:"Oral BA variable; peripheral decarboxylation if no DOPA-I; t½ ~50min; CNS t½ extends with COMT inhibitors." },
  { drug:"Donepezil",          back:"Oral BA ~100%; protein-bound 96%; hepatic CYP3A4/2D6; long t½ ~70h → once-daily dosing." },
  { drug:"Fluoxetine",         back:"Oral BA ~72%; CYP2D6 (inhibits CYP2D6 — many interactions); long t½ ~1–4 days; active norfluoxetine t½ ~7 days." },
  { drug:"Amitriptyline",      back:"Oral BA ~45% (first-pass); highly protein-bound (96%); CYP2D6/2C19; active nortriptyline metabolite; t½ ~9–27h." },
  { drug:"Fentanyl",           back:"Highly lipophilic (rapid onset/offset IV); oral BA <2% (mucosal or transdermal used); hepatic CYP3A4; t½ ~2–4h IV." },
  { drug:"Ketamine",           back:"IV/IM; hepatic N-demethylation → active norketamine; t½ ~2–3h; lipophilic → CNS penetration." },
  { drug:"Propofol",           back:"Highly lipophilic; rapid redistribution → rapid wake-up; hepatic + extrahepatic conjugation; t½ ~30–60min." },
  { drug:"Lidocaine",          back:"Oral BA ~35% (first-pass); hepatic CYP3A4/1A2; protein-bound 70%; t½ ~1.5–2h; renal excretion of metabolites." },
  { drug:"Gentamicin",         back:"IV/IM only; not absorbed orally; hydrophilic — low Vd; renally excreted unchanged; t½ ~2–3h (longer in renal failure)." },
  { drug:"Amphotericin B",     back:"IV only; highly protein-bound (>90%); large Vd; tissue storage; t½ ~15 days; mainly biliary/faecal." },
  { drug:"Liraglutide",        back:"SC injection; BA ~55%; albumin-bound (>98%); endogenous proteolysis; t½ ~13h → once-daily dosing." },
  { drug:"Empagliflozin",      back:"Oral BA ~86%; protein-bound 86%; hepatic glucuronidation; t½ ~12h; renal + faecal excretion." },
  { drug:"Sitagliptin",        back:"Oral BA ~87%; low protein binding; minimal hepatic metabolism; renally excreted 79% unchanged; t½ ~12h." },
  { drug:"Pioglitazone",       back:"Oral BA ~83%; hepatic CYP2C8/3A4; active metabolites; t½ pioglitazone ~3–7h, active metabolites ~16–24h." },
  { drug:"Glibenclamide",      back:"Oral; hepatic metabolism → active metabolites; protein-bound 99%; t½ ~10h; renal + biliary excretion." },
  { drug:"Oseltamivir",        back:"Prodrug → oseltamivir carboxylate (ester hydrolysis in liver/intestine); oral BA ~79%; renal excretion; t½ ~6–10h." },
  { drug:"Tenofovir",          back:"Oral BA ~25% (with food ~40%); intracellular phosphorylation to active TFV-DP; renally excreted; t½ ~17h." },
  { drug:"Efavirenz",          back:"Oral BA ~45%; CYP2B6 (inhibitor + inducer); t½ ~40–55h; faecal (mainly) + renal excretion." },
  { drug:"Lopinavir",          back:"Oral BA ~25% (boosted by ritonavir); CYP3A4 substrate; highly protein-bound (98–99%); t½ ~5–6h." },
  { drug:"Chloroquine",        back:"Oral BA ~90%; large Vd (very high tissue distribution); t½ ~1–2 months; renal excretion." },
  { drug:"Trimethoprim",       back:"Oral BA ~100%; protein-bound ~45%; hepatic oxidation; t½ ~8–10h; renal excretion ~60–80% unchanged." },
  { drug:"Colchicine",         back:"Oral BA ~45%; P-gp and CYP3A4 substrate; t½ ~27h; hepatic recycling; faecal + renal excretion." },
  { drug:"Allopurinol",        back:"Oral BA ~90%; hepatic → active oxypurinol (t½ ~15–18h); renally excreted; reduce dose in renal impairment." },
  { drug:"Dexamethasone",      back:"Oral BA ~78%; protein-bound ~60–70%; hepatic metabolism; t½ ~3–4h; biological effect ~36–54h." },
  { drug:"Enoxaparin",         back:"SC only; BA ~92% SC; anti-Xa peak 3–4h; t½ ~4–5h; renally excreted; accumulates in renal impairment." },
  { drug:"Apixaban",           back:"Oral BA ~50%; protein-bound 87%; CYP3A4/P-gp substrate; t½ ~12h; dual renal (~27%) + faecal elimination." },
  { drug:"Dabigatran",         back:"Prodrug (dabigatran etexilate); oral BA ~6–7%; NOT hepatically metabolised; renally excreted 80%; t½ ~12–17h." },
  { drug:"Glyceryl trinitrate",back:"Sublingual BA ~80% (extensive oral first-pass — IV/SL/transdermal used); rapid onset 1–3min; t½ ~1–4min." },
  { drug:"Hydrochlorothiazide",back:"Oral BA ~65–75%; protein-bound ~68%; renally excreted unchanged; t½ ~6–15h; onset ~2h, peak 4h." },
  { drug:"Bisoprolol",         back:"Oral BA ~90%; not significantly hepatically metabolised; equal renal + hepatic excretion; t½ ~9–12h." },
  { drug:"Verapamil",          back:"Oral BA ~20–35% (high first-pass); CYP3A4; active norverapamil metabolite; t½ ~6–12h; hepatic excretion." },
  { drug:"Diltiazem",          back:"Oral BA ~40%; CYP3A4; active desacetyl-diltiazem; t½ ~3–5h; hepatic excretion mainly." },
  { drug:"Propranolol",        back:"Oral BA ~26% (variable first-pass); CYP2D6; highly protein-bound (93%); t½ ~3–5h; lipophilic (CNS)." },
  { drug:"Ezetimibe",          back:"Oral BA ~35–65%; undergoes enterohepatic cycling; glucuronide metabolite t½ ~22h; faecal excretion." },
  { drug:"Hydralazine",        back:"Oral BA 30–50% (first-pass varies with acetylator status); t½ ~1–2h but tissue effect longer; renal excretion." },
  { drug:"Methyldopa",         back:"Oral BA ~25–50%; active metabolite (α-methyl-noradrenaline) formed centrally; t½ ~1.5–2h; renal excretion." },
  { drug:"Montelukast",        back:"Oral BA ~64%; highly protein-bound (99%); CYP2C9/3A4; t½ ~2.7–5.5h; biliary/faecal excretion." },
  { drug:"Theophylline",       back:"Oral BA ~96%; protein-bound 40%; CYP1A2 metabolism; t½ ~8h (smokers ~5h; neonates ~24h); renal." },
  { drug:"Phenobarbitone",     back:"Oral BA ~100%; protein-bound ~50%; hepatic; autoinduction; t½ ~80–100h; renal excretion (↑with alkaline urine)." },
  { drug:"Clonazepam",         back:"Oral BA ~90%; protein-bound 85%; CYP3A4; t½ ~18–50h; hepatic excretion." },
  { drug:"Imatinib",           back:"Oral BA ~98%; protein-bound 95%; CYP3A4/2C8; t½ ~18h; faecal (biliary) excretion mainly." },
  { drug:"Levetiracetam",      back:"Oral BA ~100%; NOT protein-bound; minimal hepatic metabolism; renally excreted 66% unchanged; t½ ~6–8h." },
  { drug:"Selegiline",         back:"Oral BA ~10%; MAO-B in brain after BBB crossing; metabolised to amphetamine derivatives; t½ ~2h (brain effect longer)." },
  { drug:"Pramipexole",        back:"Oral BA ~90%; low protein binding; renally excreted 90% unchanged; t½ ~8–12h; no significant hepatic metabolism." },
  { drug:"Rosuvastatin",       back:"Oral BA ~20%; low CYP metabolism (minor 2C9); mainly OATP1B1 hepatic uptake; t½ ~19h; faecal excretion." },
  { drug:"Mycophenolate",      back:"Prodrug MMF → MPA; oral BA ~94%; enterohepatic recycling; hepatic glucuronidation; t½ MPA ~17h; renal excretion MPAG." },
];

const pharmacodynamicsData = [
  { drug:"Warfarin",           back:"Onset 8–12h; peak 48–72h. Effect outlasts drug (depletion of factors). Narrow TI (INR 2–3). Many drug/food interactions via CYP2C9." },
  { drug:"Metformin",          back:"No insulin secretion → no hypoglycaemia alone. Reduces FPG primarily. No tolerance. Modest ~1.5% HbA1c reduction." },
  { drug:"Furosemide",         back:"Dose-dependent diuresis; ceiling dose concept. Effective in renal impairment unlike thiazides. IV onset 5–15 min." },
  { drug:"Morphine",           back:"Analgesia via μ-receptor in CNS and periphery. Tolerance develops rapidly. Reversal by naloxone (competitive antagonist)." },
  { drug:"Salbutamol",         back:"Bronchodilation onset 5 min; peak 30–60 min; duration 4–6h. Tachyphylaxis with overuse. No anti-inflammatory effect." },
  { drug:"Lisinopril",         back:"Antihypertensive peak 6–8h. Cardioprotective in HFrEF (reduces preload + afterload). Nephroprotective in diabetic nephropathy." },
  { drug:"Atenolol",           back:"Negative chronotropy + inotropy; reduces CO and renin. β₁ selectivity lost at high doses. No ISA." },
  { drug:"Ciprofloxacin",      back:"Concentration-dependent killing (AUC/MIC, Cmax/MIC are PD indices). Post-antibiotic effect. Resistance: gyrase mutation or efflux." },
  { drug:"Omeprazole",         back:"Irreversible PPI — acid suppression outlasts drug elimination. Full effect 3–5 days. Take 30 min before meals for maximum effect." },
  { drug:"Simvastatin",        back:"LDL reduction ~35–45%; pleiotropic benefits. Evening dosing optimal (hepatic cholesterol synthesis peaks at night)." },
  { drug:"Methotrexate",       back:"Anti-inflammatory effect via adenosine at low doses. Clinical benefit in RA delayed 4–6 weeks. Weekly dosing + folate." },
  { drug:"Amoxicillin",        back:"Time-dependent bactericidal (%T>MIC is PD index). No post-antibiotic effect. Best with frequent dosing or prolonged infusion." },
  { drug:"Aspirin",            back:"Antiplatelet effect irreversible for platelet lifespan (7–10 days). Antiplatelet dose 75–150 mg; analgesic 300–900 mg." },
  { drug:"Digoxin",            back:"Positive inotropy + negative chronotropy. Narrow TW (0.5–2.0 ng/mL). Toxicity aggravated by hypokalaemia." },
  { drug:"Heparin",            back:"Immediate anticoagulant effect. Monitored by aPTT (UFH) or anti-Xa (LMWH). Reversed by protamine sulphate." },
  { drug:"Vancomycin",         back:"Time-dependent killing (AUC/MIC is PD index). Reserve for MRSA and resistant gram-positives. AUC/MIC target ≥400." },
  { drug:"Amlodipine",         back:"Gradual antihypertensive (days–weeks due to long t½). Less reflex tachycardia than nifedipine. Well tolerated in elderly." },
  { drug:"Spironolactone",     back:"Onset 2–3 days (aldosterone receptor interaction). Evidence in HF (RALES: ↓mortality 30%). Also primary hyperaldosteronism." },
  { drug:"Rifampicin",         back:"Bactericidal against M. tuberculosis. Must be combined (resistance prevention). CYP inducer — reduces co-administered drug levels." },
  { drug:"Ibuprofen",          back:"Analgesic/anti-inflammatory onset 30–60 min. Renal PG inhibition → risk in elderly, dehydrated, or renal impairment patients." },
  { drug:"Paracetamol",        back:"Antipyresis via hypothalamic action. Central analgesic. No anti-inflammatory action. Safe in renal impairment (unlike NSAIDs)." },
  { drug:"Clopidogrel",        back:"Antiplatelet onset 2–6h (prodrug). Maximal effect 3–7 days. Variable response (poor CYP2C19 metabolisers). Irreversible effect." },
  { drug:"Ondansetron",        back:"Prevents acute chemotherapy-induced emesis (0–24h). Less effective against delayed emesis. Give prophylactically before chemotherapy." },
  { drug:"Metoprolol",         back:"Cardioselective β₁ blocker; loses selectivity at high doses. Reduces mortality in stable CHF (MERIT-HF). Start low, titrate up." },
  { drug:"Losartan",           back:"Antihypertensive peak at 6h. Renoprotective in type 2 DM + nephropathy (RENAAL trial). Uricosuric property (lowers uric acid)." },
  { drug:"Ramipril",           back:"Cardioprotective post-MI (HOPE trial — ↓cardiovascular events). Reduces microalbuminuria. Onset of BP effect ~1–2 weeks." },
  { drug:"Atorvastatin",       back:"High-intensity statin — ↓LDL 40–60%. Pleiotropic effects (anti-inflammatory). Benefits in ACS shown within 30 days (MIRACL)." },
  { drug:"Gentamicin",         back:"Concentration-dependent killing (Cmax/MIC is key PD index). Extended interval dosing exploits PAE and Cmax/MIC. TDM essential." },
  { drug:"Dexamethasone",      back:"Potent anti-inflammatory; 25× more potent than hydrocortisone. Reduces ICP (brain oedema), used in COVID-19 severe disease (RECOVERY)." },
  { drug:"Prednisolone",       back:"Dose-dependent immunosuppression. Low-dose (≤7.5 mg/day) maintenance less HPA suppression. Biological effect outlasts plasma t½." },
  { drug:"Phenytoin",          back:"Use-dependent Na⁺ channel blockade → most effective during high-frequency firing. Zero-order kinetics at therapeutic range → unpredictable." },
  { drug:"Valproate",          back:"Broad-spectrum antiepileptic. Inhibits GABA-T (↑GABA) + Na⁺/Ca²⁺ channel blockade. Used in absence, myoclonic, tonic-clonic, bipolar." },
  { drug:"Diazepam",           back:"Anxiolysis at low doses; anticonvulsant and muscle relaxation at higher doses. Tolerance develops rapidly. Avoid long-term use." },
  { drug:"Carbamazepine",      back:"Use-dependent Na⁺ channel block. Autoinduction requires dose titration. First-line for focal seizures and trigeminal neuralgia." },
  { drug:"Lithium",            back:"Narrow TI (serum level 0.6–1.2 mmol/L). Prevents both manic and depressive episodes. Renoprotective hydration essential." },
  { drug:"Haloperidol",        back:"High D₂ affinity → effective in positive symptoms of schizophrenia. High EPS risk (TD, dystonia, akathisia). Useful in delirium." },
  { drug:"Risperidone",        back:"5-HT₂A blockade reduces EPS vs. haloperidol. Metabolic effects less than olanzapine. Used in schizophrenia and mania." },
  { drug:"Fluoxetine",         back:"Antidepressant effect onset 2–4 weeks. Long t½ reduces discontinuation syndrome risk. Inhibits CYP2D6 → interactions." },
  { drug:"Amitriptyline",      back:"Analgesic effect (neuropathic pain) at lower doses than antidepressant effect. Sedating — helpful in pain + insomnia." },
  { drug:"Clonazepam",         back:"High potency, long duration — used in myoclonic and absence seizures. Tolerance may develop; use adjunct long-term." },
  { drug:"Levodopa",           back:"Most effective antiparkinson drug. Wearing-off and dyskinesias develop over time. COMT inhibitors (entacapone) extend effect." },
  { drug:"Donepezil",          back:"Modest symptomatic benefit in AD; does not slow disease progression. Nausea common early; once-daily at bedtime." },
  { drug:"Glyceryl trinitrate",back:"Venodilation reduces preload; coronary vasodilation. Tolerance with continuous use (nitrate-free interval needed). SL onset <2 min." },
  { drug:"Empagliflozin",      back:"Cardiorenal protection independent of glucose lowering (EMPA-REG OUTCOME). Reduces HHF and slows CKD progression." },
  { drug:"Liraglutide",        back:"Reduces weight ~5–8 kg; ↓HbA1c ~1.5%. CV benefit in T2DM with established CVD (LEADER trial). GLP-1 effect enhances satiety." },
  { drug:"Sitagliptin",        back:"Glucose-dependent insulin secretion — no hypoglycaemia. Neutral CV effects (TECOS). Weight neutral vs GLP-1 agonists." },
  { drug:"Pioglitazone",       back:"Reduces insulin resistance. ↑HDL, ↓TG. Reduces macrovascular events in T2DM (PROactive). 3–4 months for full effect." },
  { drug:"Glibenclamide",      back:"Stimulates insulin secretion independent of glucose → risk of hypoglycaemia especially in elderly. Weight gain common." },
  { drug:"Azithromycin",       back:"Bacteriostatic (can be bactericidal at high concentrations). Time-dependent above MIC. Post-antibiotic effect contributes to once-daily OD dosing." },
  { drug:"Doxycycline",        back:"Bacteriostatic. Concentration in tissue > plasma → effective against intracellular organisms (Chlamydia, Rickettsia)." },
  { drug:"Metronidazole",      back:"Bactericidal against anaerobes; antiprotozoal vs Giardia, Entamoeba, Trichomonas. Alcohol interaction via aldehyde dehydrogenase." },
  { drug:"Fluconazole",        back:"Fungistatic against Candida (fungicidal at high doses). CSF levels ~80% of plasma — effective in Cryptococcal meningitis." },
  { drug:"Acyclovir",          back:"Selective for HSV-infected cells (viral TK activation). Requires herpes TK — inactive in latent virus. Reduces severity/duration." },
  { drug:"Chloroquine",        back:"Blood schizonticide — acts on erythrocytic stage. Widespread Plasmodium falciparum resistance now limits use." },
  { drug:"Apixaban",           back:"Predictable PD; no routine monitoring needed. Reversal by andexanet alfa. Dose-reduced if ≥2 of: age≥80, weight≤60kg, creatinine≥133." },
  { drug:"Enoxaparin",         back:"Once/twice daily SC. More predictable dose-response than UFH. Anti-Xa monitoring needed in renal impairment, obesity, pregnancy." },
  { drug:"Dabigatran",         back:"Direct thrombin inhibition — both free and fibrin-bound thrombin. Predictable PD. Reversed by idarucizumab (specific antidote)." },
  { drug:"Hydrochlorothiazide",back:"Antihypertensive efficacy similar to loop diuretics but different site. Ineffective in eGFR <30. Synergistic with ACEi/ARBs." },
  { drug:"Bisoprolol",         back:"Reduces mortality in HFrEF (CIBIS-II). Start low, titrate up. Maximum benefit at target dose. Contraindicated in decompensated HF." },
  { drug:"Verapamil",          back:"Rate control in AF/flutter. Vasodilatory in angina. Contraindicated with β-blockers (complete heart block risk). Negative inotropy." },
  { drug:"Propranolol",        back:"Antiarrhythmic (class II), antihypertensive, anti-anginal. Useful in thyrotoxicosis (blocks thyroid hormone sensitisation), portal HTN." },
  { drug:"Ezetimibe",          back:"~15–20% LDL reduction as monotherapy. Synergistic with statins (+25% additional LDL reduction). Outcome data: IMPROVE-IT." },
  { drug:"Allopurinol",        back:"Urate-lowering therapy of choice in recurrent gout. Target serum uric acid <360 μmol/L (or <300 if tophaceous). Initiate with colchicine cover." },
  { drug:"Colchicine",         back:"Effective in acute gout (within 24h). Low-dose regimen as effective as high-dose with fewer GI effects (AGREE). Prevention of pericarditis." },
  { drug:"Theophylline",       back:"Narrow TI; serum levels 10–20 mg/L (toxic >20). Bronchodilator + anti-inflammatory effect at low doses. Many PK interactions." },
  { drug:"Montelukast",        back:"Modest bronchodilation. Add-on therapy in persistent asthma. More useful in exercise-induced and allergic asthma. Once-daily evening." },
  { drug:"Omalizumab",         back:"↓IgE-mediated allergic responses. Reduces asthma exacerbations by ~50%. Used in severe allergic asthma or chronic urticaria." },
  { drug:"Tiotropium",         back:"LAMA for COPD — once-daily bronchodilation. Reduces exacerbations (UPLIFT trial). Also evidence in severe asthma." },
  { drug:"Ipratropium",        back:"Short-acting (SAMA); 6–8h duration; onset 15 min. Used in acute COPD exacerbations and asthma (adjunct). No systemic antimuscarinic effects." },
  { drug:"Cyclosporin",        back:"Therapeutic drug monitoring mandatory (trough levels). Narrow TI. Calcineurin inhibition prevents graft rejection and autoimmune disease." },
  { drug:"Azathioprine",       back:"Requires 4–6 weeks to show clinical effect. Monitor FBC (myelosuppression). Reduce dose by 75% if used with allopurinol." },
  { drug:"Infliximab",         back:"Induces remission in active Crohn's and UC. Reduces steroid use. Screen for TB and HBV before starting. Monitor for infection." },
  { drug:"Rituximab",          back:"Single cycle may deplete B-cells for 6–9 months. Used in NHL, CLL, ANCA vasculitis, RA (anti-CD20)." },
  { drug:"Imatinib",           back:"Transformed CML prognosis — >90% cytogenetic remission. Must be taken long-term. Resistance via BCR-ABL mutations (T315I)." },
  { drug:"Tamoxifen",          back:"5 years adjuvant → ~50% relapse reduction in ER+ breast cancer. Benefits accrue beyond treatment period. Endometrial monitoring needed." },
  { drug:"Anastrozole",        back:"Superior to tamoxifen in post-menopausal ER+ breast cancer (ATAC trial). No endometrial cancer risk. Bone density monitoring needed." },
  { drug:"Cyclophosphamide",   back:"Requires hepatic activation → acrolein (bladder toxicity: give mesna). Pulse IV regimens in lupus nephritis, ANCA vasculitis." },
  { drug:"Cisplatin",          back:"Most emetogenic chemotherapy agent. Intense hydration protocol required. Hypomagnesaemia common. Platinum-based backbone in many regimens." },
  { drug:"Doxorubicin",        back:"Cumulative cardiotoxicity — lifetime dose limit ~450–550 mg/m². LVEF monitoring essential. Free radical mechanism (dexrazoxane cardioprotection)." },
  { drug:"Adrenaline",         back:"First-line anaphylaxis (IM 0.5 mg 1:1000). α₁ reverses vasodilation; β₁ ↑CO; β₂ ↑bronchodilation. Repeat every 5–15 min." },
  { drug:"Atropine",           back:"Used in symptomatic bradycardia (600 mcg IV), organophosphate poisoning (high doses), asystole (per ACLS protocol)." },
  { drug:"Suxamethonium",      back:"Onset 30–60s; duration 5–10 min. 'Fasciculations' before paralysis. Pseudocholinesterase deficiency → prolonged block." },
  { drug:"Rocuronium",         back:"Onset ~60s (1.2 mg/kg). Duration 30–60 min. Reversal by sugammadex (binds and encapsulates). Alternative to suxamethonium for RSI." },
  { drug:"Ketamine",           back:"Dissociative state — maintains airway reflexes and BP (useful in shocked patients). Pre-treat with midazolam to prevent emergence delirium." },
  { drug:"Propofol",           back:"Rapid onset (30s) and offset — 'target-controlled infusion'. Antiemetic property. Risk of propofol infusion syndrome >24h at high dose." },
  { drug:"Fentanyl",           back:"100× more potent than morphine. Minimal histamine release. Transdermal patch for chronic pain (takes 12–24h to reach steady state)." },
  { drug:"Methyldopa",         back:"Safe antihypertensive in pregnancy (no teratogenicity). Central α₂ agonism reduces sympathetic outflow. Onset ~4–6h." },
];

const indicationsData = [
  { drug:"Metformin",          back:"First-line T2DM. Also used in PCOS, prediabetes prevention, and gestational diabetes. Not for T1DM." },
  { drug:"Aspirin",            back:"Low-dose (75–150 mg): antiplatelet in ACS, AF, stroke prevention, post-MI, TIA. Standard dose: analgesia, antipyresis, acute MI (300–600 mg)." },
  { drug:"Amoxicillin",        back:"RTIs (otitis media, sinusitis, pneumonia), UTIs, dental infections, H. pylori eradication (triple therapy), Lyme disease." },
  { drug:"Ibuprofen",          back:"Mild-moderate pain, fever, dysmenorrhoea, osteoarthritis, RA, pericarditis, patent ductus arteriosus (neonates IV)." },
  { drug:"Atorvastatin",       back:"Primary and secondary prevention of cardiovascular disease. Hypercholesterolaemia, mixed dyslipidaemia. Post-ACS (high-intensity)." },
  { drug:"Omeprazole",         back:"GORD/GERD, peptic ulcer disease (H. pylori eradication), NSAID-induced ulcer prophylaxis, Zollinger-Ellison syndrome." },
  { drug:"Lisinopril",         back:"Hypertension, HFrEF (reduces mortality), post-MI LV dysfunction, diabetic nephropathy (proteinuria reduction)." },
  { drug:"Warfarin",           back:"AF (stroke prevention), DVT/PE treatment and prophylaxis, mechanical heart valves, antiphospholipid syndrome." },
  { drug:"Paracetamol",        back:"Mild-moderate pain (headache, musculoskeletal, post-operative), fever. Safe in pregnancy, renal impairment, peptic ulcer disease." },
  { drug:"Morphine",           back:"Severe acute pain (post-operative, trauma, MI), chronic cancer pain (WHO step 3), acute cardiogenic pulmonary oedema (IV)." },
  { drug:"Furosemide",         back:"Acute pulmonary oedema (IV), chronic HF (oral), hypertension (adjunct), ascites (with spironolactone), hypercalcaemia." },
  { drug:"Metoprolol",         back:"Hypertension, angina, HFrEF (evidence-based), AF rate control, post-MI cardioprotection, migraine prophylaxis." },
  { drug:"Amlodipine",         back:"Hypertension (first-line), stable angina, vasospastic (Prinzmetal) angina. Safe in elderly and chronic kidney disease." },
  { drug:"Ciprofloxacin",      back:"UTIs (including complicated), gonorrhoea, traveller's diarrhoea, anthrax prophylaxis, pseudomonal infections (not empirical RTI)." },
  { drug:"Salbutamol",         back:"Acute bronchospasm in asthma and COPD (rescue). Exercise-induced asthma. Hyperkalaemia (nebulised, temporising). Preterm labour (tocolysis)." },
  { drug:"Methotrexate",       back:"RA, psoriatic arthritis, psoriasis (low-dose weekly). High-dose: ALL, lymphoma, osteosarcoma, choriocarcinoma." },
  { drug:"Carbamazepine",      back:"Focal seizures (first-line), generalised tonic-clonic, trigeminal neuralgia, bipolar disorder (mania/maintenance)." },
  { drug:"Prednisolone",       back:"Asthma exacerbation, COPD exacerbation, IBD, rheumatoid arthritis, SLE, PMR, temporal arteritis, nephrotic syndrome, ALL." },
  { drug:"Atenolol",           back:"Hypertension, angina, AF rate control, post-MI. Less favoured now vs. bisoprolol/metoprolol (weaker HF evidence)." },
  { drug:"Losartan",           back:"Hypertension, HFrEF (ACEi-intolerant), type 2 DM nephropathy (RENAAL trial), stroke prevention in hypertensive LVH (LIFE trial)." },
  { drug:"Ramipril",           back:"Hypertension, HFrEF, post-MI LV dysfunction, high CV risk without HF (HOPE trial — diabetics, vascular disease)." },
  { drug:"Spironolactone",     back:"HFrEF (add-on to ACEi+β-blocker, RALES trial), primary hyperaldosteronism, resistant hypertension, ascites in cirrhosis." },
  { drug:"Bisoprolol",         back:"HFrEF (first-line — CIBIS-II), hypertension, angina, AF rate control. Most selective β₁ blocker available." },
  { drug:"Clopidogrel",        back:"ACS (NSTEMI/STEMI — dual antiplatelet with aspirin), PCI (post-stent thrombosis prevention), TIA/stroke (alternative to aspirin)." },
  { drug:"Heparin (UFH)",      back:"Acute VTE treatment, ACS (STEMI/NSTEMI bridging), cardiopulmonary bypass, renal replacement therapy anticoagulation." },
  { drug:"Enoxaparin",         back:"VTE prophylaxis (surgical, medical patients), DVT/PE treatment, ACS (NSTEMI), bridging anticoagulation." },
  { drug:"Apixaban",           back:"AF (stroke prevention), DVT/PE treatment and extended prophylaxis, post-joint-replacement VTE prophylaxis." },
  { drug:"Dabigatran",         back:"AF (stroke prevention), DVT/PE treatment and secondary prevention, post-elective hip/knee replacement VTE prophylaxis." },
  { drug:"Digoxin",            back:"AF rate control (particularly with HF or when β-blockers contraindicated), HFrEF adjunct (symptom control only — no mortality benefit)." },
  { drug:"Glyceryl trinitrate",back:"Acute angina attack (SL/spray), angina prophylaxis (transdermal patch), acute HF/acute coronary syndrome (IV), oesophageal spasm." },
  { drug:"Vancomycin",         back:"MRSA infections (bacteraemia, endocarditis, bone), C. difficile colitis (oral — not absorbed systemically), meningitis (gram-positive)." },
  { drug:"Azithromycin",       back:"Community-acquired pneumonia (atypical cover), chlamydia (single dose 1g), MAC prophylaxis in HIV, pertussis, enteric fever." },
  { drug:"Doxycycline",        back:"Malaria prophylaxis, chlamydia, Lyme disease, rickettsia, pelvic inflammatory disease, acne vulgaris, MRSA skin infection." },
  { drug:"Metronidazole",      back:"C. difficile colitis (mild-moderate), bacterial vaginosis, trichomoniasis, amoebiasis, giardiasis, H. pylori (triple therapy), dental infections." },
  { drug:"Fluconazole",        back:"Vaginal candidiasis (single dose 150 mg), oropharyngeal candidiasis, cryptococcal meningitis (after amphotericin induction), prophylaxis in immunocompromised." },
  { drug:"Acyclovir",          back:"HSV-1/2 (cold sores, genital herpes — treatment and suppression), VZV (chickenpox, shingles), HSV encephalitis (IV high-dose), neonatal herpes." },
  { drug:"Glibenclamide",      back:"T2DM (when metformin is contraindicated or insufficient). Avoid in elderly (hypoglycaemia risk) and renal impairment." },
  { drug:"Pioglitazone",       back:"T2DM (add-on or monotherapy). Reduces macrovascular events. Useful when metabolic syndrome features present (↑HDL, ↓TG)." },
  { drug:"Sitagliptin",        back:"T2DM (mono or combo). Weight-neutral. Good choice in elderly (low hypoglycaemia risk). CV-safe (TECOS trial)." },
  { drug:"Empagliflozin",      back:"T2DM + established CVD or high CV risk (EMPA-REG). HFrEF (with or without DM — EMPEROR). CKD slowing (EMPA-KIDNEY)." },
  { drug:"Liraglutide",        back:"T2DM + CVD (LEADER trial — reduces MACE). Obesity (3 mg — Saxenda). Also studied in NASH/MAFLD." },
  { drug:"Phenytoin",          back:"Focal and generalised tonic-clonic seizures (second-line due to adverse effects), status epilepticus (IV fosphenytoin), trigeminal neuralgia." },
  { drug:"Valproate",          back:"Generalised epilepsy (absence, myoclonic, tonic-clonic), focal seizures, bipolar disorder (mania/prophylaxis), migraine prophylaxis." },
  { drug:"Levetiracetam",      back:"Adjunctive focal and generalised seizures, myoclonic epilepsy (juvenile), status epilepticus (IV). Good safety profile, no enzyme induction." },
  { drug:"Diazepam",           back:"Acute anxiety, status epilepticus (IV/rectal), alcohol withdrawal seizures/delirium tremens, procedural sedation, muscle spasm." },
  { drug:"Haloperidol",        back:"Schizophrenia (positive symptoms), acute psychosis, mania, delirium (including ICU), intractable hiccups, Tourette syndrome, palliative sedation." },
  { drug:"Risperidone",        back:"Schizophrenia, bipolar mania, irritability in autism spectrum disorder (paediatric), delirium (short-term)." },
  { drug:"Olanzapine",         back:"Schizophrenia, acute mania, bipolar maintenance, treatment-resistant depression (augmentation). High metabolic risk limits long-term use." },
  { drug:"Fluoxetine",         back:"MDD, OCD, bulimia nervosa, panic disorder, PTSD, premenstrual dysphoric disorder. Only SSRI licensed for paediatric depression." },
  { drug:"Sertraline",         back:"MDD, OCD, PTSD, social anxiety, panic disorder, PMDD. Most commonly prescribed antidepressant; good safety in pregnancy." },
  { drug:"Amitriptyline",      back:"Neuropathic pain (first-line), migraine prophylaxis, fibromyalgia, IBS, MDD (now mainly superseded by SSRIs)." },
  { drug:"Lithium",            back:"Bipolar disorder (mania treatment, maintenance — prevents both poles), treatment-resistant depression augmentation, cluster headache prophylaxis." },
  { drug:"Levodopa",           back:"Parkinson's disease (gold standard for motor symptoms — tremor, rigidity, bradykinesia). Always given with peripheral DOPA decarboxylase inhibitor." },
  { drug:"Donepezil",          back:"Alzheimer's disease (all stages — mild to severe). Off-label: Lewy body dementia, vascular dementia, Down syndrome cognitive decline." },
  { drug:"Memantine",          back:"Moderate-to-severe Alzheimer's disease (monotherapy or + AChEI). Off-label: vascular dementia, Lewy body dementia." },
  { drug:"Azathioprine",       back:"Transplant rejection prophylaxis, RA, IBD (Crohn's/UC maintenance), SLE, autoimmune hepatitis, myasthenia gravis, pemphigus." },
  { drug:"Cyclosporin",        back:"Organ transplantation, severe psoriasis, atopic dermatitis, RA, uveitis, aplastic anaemia, nephrotic syndrome." },
  { drug:"Tacrolimus",         back:"Organ transplantation (liver, kidney, heart — more potent than cyclosporin), eczema (topical 0.1%), refractory IBD." },
  { drug:"Mycophenolate",      back:"Transplant rejection prophylaxis (with tacrolimus/cyclosporin), lupus nephritis, ANCA vasculitis, myasthenia gravis." },
  { drug:"Infliximab",         back:"Crohn's disease, UC, RA (anti-TNF), ankylosing spondylitis, psoriatic arthritis, plaque psoriasis, uveitis (JIA)." },
  { drug:"Rituximab",          back:"NHL (DLBCL, follicular lymphoma), CLL, RA (second-line after methotrexate failure), ANCA vasculitis, ITP, pemphigus vulgaris." },
  { drug:"Imatinib",           back:"CML (BCR-ABL+, first-line), GIST (c-KIT+), Ph+ ALL, dermatofibrosarcoma protuberans, hypereosinophilic syndrome." },
  { drug:"Cyclophosphamide",   back:"Lymphoma (CHOP regimen), RA, lupus nephritis, ANCA vasculitis, nephrotic syndrome, ovarian/breast cancer, conditioning for transplant." },
  { drug:"Tamoxifen",          back:"Hormone receptor-positive breast cancer (adjuvant and metastatic — pre-menopausal and post-menopausal), DCIS, breast cancer prevention (high-risk)." },
  { drug:"Anastrozole",        back:"Post-menopausal ER+ breast cancer (adjuvant — superior to tamoxifen, ATAC trial), metastatic breast cancer." },
  { drug:"Allopurinol",        back:"Gout prophylaxis (recurrent gout, tophaceous gout), hyperuricaemia (tumour lysis syndrome prevention), uric acid renal calculi." },
  { drug:"Colchicine",         back:"Acute gout flare (within 24h of onset), gout prophylaxis (low-dose with urate-lowering therapy), pericarditis (acute and prevention)." },
  { drug:"Montelukast",        back:"Persistent asthma (add-on), allergic rhinitis, exercise-induced bronchoconstriction, aspirin-exacerbated respiratory disease." },
  { drug:"Ondansetron",        back:"Prevention/treatment of CINV (chemotherapy-induced), PONV (post-operative), radiotherapy-induced nausea, hyperemesis gravidarum (off-label)." },
  { drug:"Rifampicin",         back:"Tuberculosis (first-line — RIPE regimen), leprosy (multidrug therapy), meningococcal prophylaxis, Legionella (adjunct), MRSA (never alone)." },
  { drug:"Chloroquine",        back:"Malaria treatment and prophylaxis (where sensitive), SLE, RA (hydroxychloroquine preferred), amoebiasis (liver abscess)." },
  { drug:"Adrenaline",         back:"Anaphylaxis (IM, first-line), cardiac arrest (IV/IO), severe asthma/bronchospasm (adjunct), croup (nebulised), local anaesthesia (vasoconstrictor additive)." },
  { drug:"Atropine",           back:"Symptomatic bradycardia, organophosphate/nerve agent poisoning, pre-op to ↓secretions, cycloplegia/mydriasis (ophthalmic), IBS (antispasmodic)." },
  { drug:"Dexamethasone",      back:"COVID-19 (severe, requiring oxygen — RECOVERY trial), brain oedema (tumour, abscess), bacterial meningitis (inflammation), CINV, croup, adrenal insufficiency." },
  { drug:"Hydrochlorothiazide",back:"Hypertension (first-line), oedema (HF, cirrhosis, renal), nephrogenic DI (paradoxically ↓urine output), hypercalciuria/calcium stones." },
  { drug:"Theophylline",       back:"COPD (adjunct bronchodilator — narrow TI limits use), severe acute asthma (adjunct, IV aminophylline), sleep apnoea in neonates." },
  { drug:"Ipratropium",        back:"Acute COPD exacerbation (nebulised), acute severe asthma (adjunct to salbutamol), rhinorrhoea (intranasal)." },
  { drug:"Tiotropium",         back:"COPD maintenance therapy (first-line — reduces exacerbations and hospitalisations, UPLIFT trial), severe persistent asthma (add-on)." },
  { drug:"Omalizumab",         back:"Severe allergic asthma (IgE-mediated, uncontrolled on high-dose ICS + LABA), chronic spontaneous urticaria (refractory), nasal polyps." },
  { drug:"Oseltamivir",        back:"Treatment of influenza A and B (within 48h of symptom onset — reduces duration by ~1 day), prophylaxis in high-risk contacts." },
  { drug:"Acyclovir (IV)",     back:"HSV encephalitis (empirical if suspected), neonatal herpes, severe primary genital herpes, immunocompromised with VZV/HSV." },
  { drug:"Tenofovir",          back:"HIV (backbone of ART — TDF or TAF-based regimens), hepatitis B treatment (first-line — more potent than lamivudine)." },
  { drug:"Efavirenz",          back:"HIV treatment (first-line in resource-limited settings — part of EFV-based regimen with tenofovir + emtricitabine)." },
  { drug:"Propranolol",        back:"Angina, hypertension, AF/flutter (rate control), essential tremor, thyrotoxicosis (symptom control), portal hypertension, migraine prophylaxis, anxiety (performance)." },
  { drug:"Ezetimibe",          back:"Hypercholesterolaemia (add-on to statin or monotherapy if statin-intolerant), familial hypercholesterolaemia, ACS post-event (IMPROVE-IT)." },
  { drug:"Hydralazine",        back:"Hypertension in pregnancy (IV for severe hypertension), hypertensive emergency, HFrEF (with nitrate, if ACEi/ARB intolerant — A-HeFT trial in self-identified Black patients)." },
  { drug:"Methyldopa",         back:"Hypertension in pregnancy (oral — first-line safe option), hypertensive emergency in pregnancy (IV)." },
  { drug:"Desmopressin",       back:"Central diabetes insipidus (V2 agonist), primary nocturnal enuresis, mild haemophilia A and von Willebrand disease (↑Factor VIII/vWF release), nocturia." },
  { drug:"Erythropoietin",     back:"Anaemia of chronic kidney disease (pre-dialysis and dialysis), anaemia related to chemotherapy, myelodysplastic syndrome." },
  { drug:"Folic acid",         back:"Megaloblastic anaemia (folate-deficient), pregnancy supplementation (neural tube defect prevention — 400 mcg/day; high-risk 5 mg/day), methotrexate rescue." },
  { drug:"Ketamine",           back:"Dissociative anaesthesia (especially in haemodynamically compromised patients), procedural sedation, rapid sequence induction (RSI), treatment-resistant depression (IV/intranasal esketamine)." },
  { drug:"Propofol",           back:"Induction and maintenance of general anaesthesia (TIVA), procedural sedation, ICU sedation (short-term), refractory status epilepticus." },
  { drug:"Lidocaine",          back:"Local anaesthesia (infiltration, nerve blocks, topical), ventricular arrhythmias (post-MI VT/VF — IV Class Ib), painful neuropathy (IV infusion)." },
  { drug:"Simvastatin",        back:"Primary hypercholesterolaemia, mixed dyslipidaemia, cardiovascular event prevention (secondary). Now mostly replaced by atorvastatin for high-intensity statin use." },
  { drug:"Venlafaxine",        back:"MDD, GAD, social anxiety disorder, panic disorder, PTSD, menopausal hot flushes, diabetic neuropathy (off-label)." },
  { drug:"Clonazepam",         back:"Myoclonic and absence seizures, Lennox-Gastaut syndrome, adjunct in status epilepticus, panic disorder, restless legs syndrome." },
  { drug:"Selegiline",         back:"Parkinson's disease (adjunct to levodopa — extends on-time, reduces off-time), early PD monotherapy (neuroprotective hypothesis)." },
  { drug:"Pramipexole",        back:"Parkinson's disease (early or adjunct), restless legs syndrome (RLS), depression in bipolar II (augmentation — limited evidence)." },
];

const DATA_MAP: Record<TabKey, { drug: string; back: string }[]> = {
  moa: moaData, classification: classificationData,
  sideEffects: sideEffectsData, pharmacokinetics: pharmacokineticsData,
  pharmacodynamics: pharmacodynamicsData, indications: indicationsData,
};

const REFERENCES = [
  { authors:"Rang HP, Ritter JM, Flower RJ, Henderson G.", title:"Rang & Dale's Pharmacology (9th ed.).", publisher:"Elsevier.", year:"2019" },
  { authors:"Brunton LL, Hilal-Dandan R, Knollmann BC.", title:"Goodman & Gilman's The Pharmacological Basis of Therapeutics (13th ed.).", publisher:"McGraw-Hill.", year:"2018" },
  { authors:"Tripathi KD.", title:"Essentials of Medical Pharmacology (8th ed.).", publisher:"Jaypee Brothers.", year:"2019" },
  { authors:"Joint Formulary Committee.", title:"British National Formulary (BNF) — online.", publisher:"BMJ Group & Pharmaceutical Press.", year:"2024", url:"https://bnf.nice.org.uk" },
  { authors:"Trevor AJ, Katzung BG, Bhakta M.", title:"Katzung & Trevor's Pharmacology: Examination and Board Review (13th ed.).", publisher:"McGraw-Hill.", year:"2021" },
  { authors:"Rowland M, Tozer TN.", title:"Clinical Pharmacokinetics and Pharmacodynamics (5th ed.).", publisher:"Lippincott Williams & Wilkins.", year:"2011" },
  { authors:"Baxter K, Preston CL.", title:"Stockley's Drug Interactions (12th ed.).", publisher:"Pharmaceutical Press.", year:"2023", url:"https://www.medicinescomplete.com" },
  { authors:"Wishart DS, et al.", title:"DrugBank Online v5.1.", publisher:"DrugBank.", year:"2024", url:"https://go.drugbank.com" },
];

// ─── Flashcard ────────────────────────────────────────────────────────────────
function Flashcard({ drug, back, gradient, backLabel }: {
  drug: string; back: string; gradient: string; backLabel: string;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="cursor-pointer select-none" style={{ perspective: "900px" }}
      onClick={() => setFlipped(f => !f)} role="button" aria-pressed={flipped}>
      <motion.div animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d", position: "relative", height: "220px" }}>
        {/* Front */}
        <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          className="absolute inset-0 rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col items-center justify-center p-6 text-center hover:border-blue-300 hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
          <div className="relative z-10 w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
            <Pill className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="relative z-10 text-sm font-extrabold text-gray-900 px-2">{drug}</h3>
          <p className="relative z-10 text-[11px] text-gray-400 mt-2 font-medium">
            Tap to reveal <span className="text-blue-500">{backLabel}</span>
          </p>
        </div>
        {/* Back */}
        <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className={`absolute inset-0 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-5 text-center bg-gradient-to-br ${gradient} shadow-md`}>
          <div className="absolute -top-5 -right-5 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
          <Sparkles className="w-6 h-6 text-white/80 mb-2.5 relative z-10 shrink-0" />
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-1.5 relative z-10">{backLabel}</p>
          <p className="text-xs text-white leading-relaxed font-medium relative z-10 overflow-y-auto max-h-28">{back}</p>
          <p className="text-[10px] text-white/40 mt-2.5 relative z-10 shrink-0">Tap to flip back</p>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Mobile Category Sheet ─────────────────────────────────────────────────────
function MobileCategorySheet({
  activeTab, onSelect,
}: { activeTab: TabKey; onSelect: (key: TabKey) => void }) {
  const [open, setOpen] = useState(false);
  const activeTabDef = TABS.find(t => t.key === activeTab)!;
  const { Icon } = activeTabDef;

  return (
    <>
      {/* Trigger bar — sticky at top on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeTabDef.color}`}>
            <Icon size={15} className="text-white" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none mb-0.5">Category</p>
            <p className="text-sm font-extrabold text-gray-900">{activeTabDef.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
            {DATA_MAP[activeTab].length} cards
          </span>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </button>

      {/* Bottom sheet overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl overflow-hidden"
              style={{ maxHeight: "80vh" }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <LayoutGrid size={16} className="text-blue-600" />
                  <h3 className="text-sm font-extrabold text-gray-900">Choose Category</h3>
                </div>
                <button onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <X size={14} />
                </button>
              </div>

              {/* Category list */}
              <div className="px-4 py-4 space-y-2 overflow-y-auto" style={{ maxHeight: "calc(80vh - 80px)" }}>
                {TABS.map(tab => {
                  const isActive = tab.key === activeTab;
                  const { Icon: TabIcon } = tab;
                  return (
                    <button key={tab.key}
                      onClick={() => { onSelect(tab.key); setOpen(false); }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${isActive ? "ring-2 ring-blue-200" : "hover:bg-gray-50"}`}
                    >
                      {/* Icon blob */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${tab.color} ${isActive ? "shadow-md" : "opacity-80"}`}>
                        <TabIcon size={18} className="text-white" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-extrabold leading-tight ${isActive ? "text-blue-700" : "text-gray-900"}`}>{tab.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug truncate">{tab.desc}</p>
                      </div>

                      {/* Count + check */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? "bg-blue-100 text-blue-700 border border-blue-200" : "bg-gray-100 text-gray-500"}`}>
                          {DATA_MAP[tab.key].length}
                        </span>
                        {isActive && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Desktop Sidebar ───────────────────────────────────────────────────────────
function DesktopSidebar({
  activeTab, onSelect, searchQuery, onSearch,
}: {
  activeTab: TabKey;
  onSelect: (key: TabKey) => void;
  searchQuery: string;
  onSearch: (v: string) => void;
}) {
  const totalAll = Object.values(DATA_MAP).reduce((s, d) => s + d.length, 0);
  const activeTabDef = TABS.find(t => t.key === activeTab)!;

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0">
      <div className="sticky top-6 space-y-3">

        {/* Sidebar header */}
        <div className={`rounded-2xl p-4 bg-gradient-to-br ${activeTabDef.color} text-white shadow-md`}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={13} className="opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Drug Flashcards</span>
          </div>
          <p className="text-lg font-extrabold leading-tight">{activeTabDef.label}</p>
          <p className="text-xs text-white/70 mt-0.5">{activeTabDef.desc}</p>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20">
            <div className="text-center">
              <p className="text-lg font-extrabold">{DATA_MAP[activeTab].length}</p>
              <p className="text-[10px] opacity-70">This set</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-lg font-extrabold">{totalAll}+</p>
              <p className="text-[10px] opacity-70">Total cards</p>
            </div>
          </div>
        </div>

        {/* Search — desktop */}
        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Search drugs…"
            value={searchQuery} onChange={e => onSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button onClick={() => onSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
              <X size={10} />
            </button>
          )}
        </div>

        {/* Category list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <LayoutGrid size={13} className="text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Categories</span>
          </div>
          <ul className="p-2 space-y-0.5">
            {TABS.map(tab => {
              const isActive = tab.key === activeTab;
              const { Icon: TabIcon } = tab;
              return (
                <li key={tab.key}>
                  <button onClick={() => onSelect(tab.key)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${isActive ? "bg-gradient-to-r " + tab.color + " shadow-sm" : "hover:bg-gray-50"}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"} transition-colors`}>
                      <TabIcon size={13} className={isActive ? "text-white" : "text-gray-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-gray-700"}`}>{tab.label}</p>
                      <p className={`text-[10px] truncate ${isActive ? "text-white/70" : "text-gray-400"}`}>{tab.desc}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {DATA_MAP[tab.key].length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Quick tip */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Study Tip</p>
          <p className="text-xs text-blue-700 leading-relaxed">Tap any card to flip it and reveal the answer. Go through each category systematically for exam prep.</p>
        </div>
      </div>
    </aside>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function FlashcardsPage() {
  const [activeTab,   setActiveTab]   = useState<TabKey>("moa");
  const [searchQuery, setSearchQuery] = useState("");
  const [page,        setPage]        = useState(1);

  const activeTabDef = TABS.find(t => t.key === activeTab)!;
  const allData      = DATA_MAP[activeTab];

  const filtered = useMemo(() =>
    allData.filter(d => d.drug.toLowerCase().includes(searchQuery.toLowerCase())),
    [allData, searchQuery]
  );

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const paged = useMemo(() => {
    const s = (page - 1) * CARDS_PER_PAGE;
    return filtered.slice(s, s + CARDS_PER_PAGE);
  }, [filtered, page]);

  const handleTabChange = (key: TabKey) => { setActiveTab(key); setSearchQuery(""); setPage(1); };
  const handleSearch    = (val: string) => { setSearchQuery(val); setPage(1); };

  const totalAll = Object.values(DATA_MAP).reduce((s, d) => s + d.length, 0);

  const pageNums: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) pageNums.push(p);
    else if (pageNums[pageNums.length - 1] !== "…") pageNums.push("…");
  }

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-20  w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-20 bottom-4   opacity-15 pointer-events-none"><Dna      size={60} className="text-white" /></div>
        <div className="absolute right-44 top-6      opacity-15 pointer-events-none"><Activity size={50} className="text-white" /></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> Drug Flashcards
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Drug Flashcards
            <span className="block text-green-200 mt-1">Flip &amp; Learn</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
            Master mechanisms, classifications, side effects, pharmacokinetics, and pharmacodynamics — tap any card to reveal the answer.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { n: `${totalAll}+`, l: "Total Cards"  },
              { n: `${TABS.length}`, l: "Categories" },
              { n: "Tap",           l: "to Reveal"   },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-extrabold text-white">{n}</div>
                <div className="text-sm text-blue-200">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">

          {/* ── Desktop sidebar ── */}
          <DesktopSidebar
            activeTab={activeTab}
            onSelect={handleTabChange}
            searchQuery={searchQuery}
            onSearch={handleSearch}
          />

          {/* ── Main content area ── */}
          <div className="flex-1 min-w-0 w-full">

            {/* Mobile: category selector + search */}
            <div className="lg:hidden space-y-3 mb-5">
              <MobileCategorySheet activeTab={activeTab} onSelect={handleTabChange} />

              {/* Mobile search */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="text" placeholder="Search drug name…"
                  value={searchQuery} onChange={e => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 text-sm text-gray-800 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button onClick={() => handleSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop: section header + count */}
            <div className="hidden lg:flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${activeTabDef.color} flex items-center justify-center shadow-sm`}>
                  <activeTabDef.Icon size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{activeTabDef.label}</h2>
                  <p className="text-xs text-gray-400">{activeTabDef.desc}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5">
                {filtered.length} / {allData.length} cards
              </span>
            </div>

            {/* Mobile: count badge */}
            <div className="lg:hidden flex items-center justify-between mb-4">
              <h2 className="text-sm font-extrabold text-gray-900">{activeTabDef.label}</h2>
              <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1">
                {filtered.length} cards
              </span>
            </div>

            {/* Cards grid */}
            <AnimatePresence mode="wait">
              {paged.length > 0 ? (
                <motion.div key={`${activeTab}-${searchQuery}-${page}`}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                  {paged.map((item, i) => (
                    <motion.div key={`${activeTab}-${item.drug}-${i}`}
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.24 }}>
                      <Flashcard drug={item.drug} back={item.back}
                        gradient={activeTabDef.color} backLabel={activeTabDef.backLabel} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-20">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Pill className="w-6 h-6 text-blue-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No cards found for <span className="font-bold text-gray-700">"{searchQuery}"</span></p>
                  <button onClick={() => handleSearch("")}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition">
                    Clear search
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <p className="text-sm text-gray-400">
                  Showing <span className="font-bold text-gray-600">{(page-1)*CARDS_PER_PAGE+1}–{Math.min(page*CARDS_PER_PAGE, filtered.length)}</span> of{" "}
                  <span className="font-bold text-gray-600">{filtered.length}</span> cards
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                    className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {pageNums.map((n,i) => n==="…"
                    ? <span key={`e-${i}`} className="text-gray-400 text-sm w-4 text-center">…</span>
                    : <button key={n} onClick={() => setPage(n as number)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition ${page===n ? "bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md shadow-blue-200/50 border-0" : "border-2 border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"}`}>
                        {n}
                      </button>
                  )}
                  <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                    className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pharmacopedia CTA ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden p-8 text-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-4">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">Want Detailed Drug Information?</h3>
            <p className="text-blue-100 text-sm max-w-lg mx-auto mb-5 leading-relaxed">
              These flashcards are your quick-review tool. For comprehensive profiles including chemical properties, pharmacokinetics, interactions, dosing, and 17,430+ drug entries — visit <span className="font-extrabold text-white">Pharmacopedia</span>.
            </p>
            <Link href="/encyclopedia"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
              <Database className="w-4 h-4" /> Explore Pharmacopedia <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── References ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">References</h2>
                <p className="text-xs text-gray-400 mt-0.5">Authoritative sources used for flashcard content</p>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent hidden sm:block" />
              <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 shrink-0">
                {REFERENCES.length} sources
              </span>
            </div>
            <ol className="space-y-3">
              {REFERENCES.map((ref, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-extrabold text-blue-700 shrink-0 mt-0.5">{i+1}</span>
                  <p className="text-sm text-gray-700 leading-relaxed min-w-0">
                    <span className="text-gray-500">{ref.authors} </span>
                    <span className="font-semibold text-gray-900 italic">{ref.title}</span>
                    <span className="text-gray-500"> {ref.publisher} {ref.year}.</span>
                    {"url" in ref && ref.url && (
                      <a href={ref.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 ml-2 text-blue-600 hover:text-blue-700 text-xs font-semibold">
                        <ExternalLink className="w-3 h-3" />{ref.url.replace("https://","").replace("www.","")}
                      </a>
                    )}
                  </p>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-gray-400 mt-6 pt-4 border-t border-gray-100 leading-relaxed">
              <span className="font-bold text-gray-500">Disclaimer:</span> Flashcard content is intended for educational and academic review only. Always verify clinical information with current drug references and consult qualified healthcare professionals for patient care decisions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}