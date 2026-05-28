"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Sparkles, X, Zap, Activity, FlaskConical, AlertTriangle,
  TrendingUp, Pill, Beaker, Microscope, Stethoscope, Leaf, Dna,
  ChevronLeft, ChevronRight, BookOpen, ExternalLink, Database, ArrowRight,
  Target, ChevronDown, LayoutGrid, BrainCircuit, CheckCircle2, XCircle, RotateCcw, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { useTracker } from "@/hooks/useTracker";

// ─────────────────────────────────────────────────────────────────────────────
// Background floating icons
const bgIcons = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 30 },
  { Icon: Beaker, top: "38%", left: "1%", size: 28 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 30 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 28 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 28 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Types & Tabs
type TabKey = "moa" | "classification" | "sideEffects" | "pharmacokinetics" | "pharmacodynamics" | "indications";

interface TabDef {
  key: TabKey; label: string; shortLabel: string;
  Icon: LucideIcon; backLabel: string; color: string;
  desc: string; accentFrom: string; accentTo: string;
}

const TABS: TabDef[] = [
  { key: "moa", label: "Mechanism of Action", shortLabel: "MOA", Icon: FlaskConical, backLabel: "Mechanism of Action", color: "from-blue-600 to-green-400", desc: "How drugs work at molecular level", accentFrom: "#2563eb", accentTo: "#4ade80" },
  { key: "classification", label: "Classification", shortLabel: "Class", Icon: Pill, backLabel: "Drug Class", color: "from-indigo-600 to-blue-500", desc: "Drug classes and pharmacological groups", accentFrom: "#4f46e5", accentTo: "#3b82f6" },
  { key: "sideEffects", label: "Side Effects", shortLabel: "ADRs", Icon: AlertTriangle, backLabel: "Side Effects", color: "from-rose-500 to-orange-400", desc: "Adverse reactions and toxicity", accentFrom: "#f43f5e", accentTo: "#fb923c" },
  { key: "pharmacokinetics", label: "Pharmacokinetics", shortLabel: "PK", Icon: TrendingUp, backLabel: "Pharmacokinetics", color: "from-purple-600 to-pink-500", desc: "Absorption, distribution, metabolism", accentFrom: "#9333ea", accentTo: "#ec4899" },
  { key: "pharmacodynamics", label: "Pharmacodynamics", shortLabel: "PD", Icon: Activity, backLabel: "Pharmacodynamics", color: "from-teal-600 to-green-500", desc: "Drug effects and clinical outcomes", accentFrom: "#0d9488", accentTo: "#22c55e" },
  { key: "indications", label: "Indications", shortLabel: "Ind", Icon: Target, backLabel: "Indications", color: "from-emerald-600 to-cyan-500", desc: "Clinical uses and therapeutic roles", accentFrom: "#059669", accentTo: "#06b6d4" },
];

const CARDS_PER_PAGE = 12;

// FLASHCARD DATA (your full datasets – I've kept them intact)
// (All your moaData, classificationData, sideEffectsData, pharmacokineticsData,
//  pharmacodynamicsData, indicationsData go here. For brevity I'm showing a
//  placeholder – you must keep your existing huge data arrays.)
// 
// IMPORTANT: Replace the placeholder comments below with your actual data arrays.
// They are exactly as you provided in your original file.


const moaData = [

  { drug: "Methotrexate", back: "Inhibits DHFR → depletes tetrahydrofolate → blocks DNA/RNA synthesis. Anti-inflammatory at low doses via adenosine accumulation." },
  { drug: "Omeprazole", back: "PPI — irreversibly inhibits H⁺/K⁺-ATPase (proton pump) in gastric parietal cells." },
  { drug: "Atenolol", back: "Cardioselective β₁-adrenergic antagonist — reduces HR and myocardial contractility." },
  { drug: "Lisinopril", back: "ACE inhibitor — blocks angiotensin I→II conversion, causing vasodilation and reducing afterload." },
  { drug: "Metformin", back: "Biguanide — activates AMPK, decreasing hepatic gluconeogenesis and improving insulin sensitivity." },
  { drug: "Warfarin", back: "Vitamin K antagonist — inhibits VKOR, blocking synthesis of clotting factors II, VII, IX, X." },
  { drug: "Simvastatin", back: "HMG-CoA reductase inhibitor — reduces cholesterol synthesis, upregulates hepatic LDL receptors." },
  { drug: "Furosemide", back: "Loop diuretic — inhibits Na⁺/K⁺/2Cl⁻ symporter in thick ascending limb of Henle." },
  { drug: "Ciprofloxacin", back: "Fluoroquinolone — inhibits bacterial DNA gyrase (topo II) and topoisomerase IV." },
  { drug: "Salbutamol", back: "SABA — activates β₂ receptors → ↑cAMP → bronchial smooth muscle relaxation." },
  { drug: "Morphine", back: "Full μ-opioid receptor agonist — inhibits adenylyl cyclase, reduces neuronal excitability." },
  { drug: "Amoxicillin", back: "β-lactam — inhibits transpeptidase (PBP), blocking peptidoglycan crosslinking." },
  { drug: "Aspirin", back: "Irreversibly inhibits COX-1 and COX-2 → ↓PG and TXA₂ synthesis." },
  { drug: "Digoxin", back: "Inhibits Na⁺/K⁺-ATPase → ↑intracellular Na⁺ → ↑Ca²⁺ → positive inotropy." },
  { drug: "Heparin", back: "Binds antithrombin III → enhances inhibition of thrombin (IIa) and Factor Xa by ~1000×." },
  { drug: "Amlodipine", back: "Dihydropyridine CCB — blocks L-type Ca²⁺ channels in vascular smooth muscle → vasodilation." },
  { drug: "Metoprolol", back: "Cardioselective β₁ blocker — reduces HR, contractility, AV conduction; decreases renin." },
  { drug: "Spironolactone", back: "Aldosterone receptor antagonist — blocks mineralocorticoid receptor in collecting duct → K⁺-sparing diuresis." },
  { drug: "Clopidogrel", back: "Irreversibly blocks P2Y12 ADP receptor on platelets, preventing ADP-induced aggregation." },
  { drug: "Vancomycin", back: "Glycopeptide — inhibits cell wall synthesis by binding D-Ala-D-Ala terminus of peptidoglycan precursors." },
  { drug: "Rifampicin", back: "Inhibits bacterial DNA-dependent RNA polymerase (β-subunit), blocking mRNA transcription." },
  { drug: "Paracetamol", back: "Central COX inhibition in CNS; reduces prostaglandin synthesis centrally (exact mechanism debated)." },
  { drug: "Ibuprofen", back: "Reversibly inhibits COX-1 and COX-2 → ↓PG synthesis → analgesic, antipyretic, anti-inflammatory." },
  { drug: "Ondansetron", back: "Selective 5-HT₃ antagonist — blocks serotonin-mediated vagal signaling in gut and CTZ." },
  { drug: "Ramipril", back: "ACE inhibitor (prodrug → ramiprilat); same mechanism as lisinopril but prodrug requiring hepatic activation." },
  { drug: "Losartan", back: "ARB — selectively blocks AT₁ receptor, preventing angiotensin II effects (vasodilation, ↓aldosterone)." },
  { drug: "Enalapril", back: "ACE inhibitor prodrug (→enalaprilat); inhibits ACE → ↓Ang II, ↓aldosterone, vasodilation." },
  { drug: "Candesartan", back: "ARB — irreversibly blocks AT₁ receptor; insurmountable antagonism of angiotensin II." },
  { drug: "Propranolol", back: "Non-selective β₁/β₂ blocker — reduces HR, CO, renin; membrane-stabilising (class II antiarrhythmic)." },
  { drug: "Carvedilol", back: "Non-selective β-blocker + α₁ blocker — reduces preload (α₁) and afterload (β); used in CHF." },
  { drug: "Bisoprolol", back: "Highly cardioselective β₁ blocker — reduces HR and myocardial oxygen demand; used in HF and angina." },
  { drug: "Diltiazem", back: "Non-dihydropyridine CCB — blocks L-type Ca²⁺ channels in heart and vasculature; rate-limiting." },
  { drug: "Verapamil", back: "Non-DHP CCB — strongest cardiac effect; decreases SA node automaticity and AV conduction velocity." },
  { drug: "Hydrochlorothiazide", back: "Thiazide diuretic — inhibits Na⁺/Cl⁻ cotransporter (NCC) in distal convoluted tubule." },
  { drug: "Indapamide", back: "Thiazide-like diuretic — inhibits NCC; also has direct vasodilatory properties." },
  { drug: "Atorvastatin", back: "Statin — competitive inhibitor of HMG-CoA reductase; reduces LDL-C and ↑LDL receptors." },
  { drug: "Rosuvastatin", back: "Most potent statin — inhibits HMG-CoA reductase with high liver selectivity; greatest LDL reduction." },
  { drug: "Ezetimibe", back: "Inhibits NPC1L1 transporter in small intestine → blocks cholesterol absorption from gut." },
  { drug: "Glibenclamide", back: "Sulphonylurea — closes ATP-sensitive K⁺ channels on β-cells → depolarisation → insulin secretion." },
  { drug: "Glipizide", back: "Sulphonylurea — same mechanism; shorter duration than glibenclamide; less hypoglycaemia risk." },
  { drug: "Pioglitazone", back: "Thiazolidinedione — PPARγ agonist → ↑insulin sensitivity in adipose, muscle, liver." },
  { drug: "Sitagliptin", back: "DPP-4 inhibitor — blocks dipeptidyl peptidase-4 → ↑GLP-1 and GIP → glucose-dependent insulin secretion." },
  { drug: "Empagliflozin", back: "SGLT-2 inhibitor — blocks glucose reabsorption in proximal tubule → glycosuria → blood glucose." },
  { drug: "Liraglutide", back: "GLP-1 receptor agonist — stimulates glucose-dependent insulin secretion, suppresses glucagon, delays gastric emptying." },
  { drug: "Phenytoin", back: "Voltage-gated Na⁺ channel blocker — stabilises inactive state; reduces neuronal firing frequency." },
  { drug: "Carbamazepine", back: "Na⁺ channel blocker (use-dependent) — stabilises inactive Na⁺ channels; also used in trigeminal neuralgia." },
  { drug: "Valproate", back: "Multiple mechanisms: ↑GABA (inhibits GABA-T), Na⁺ channel blockade, T-type Ca²⁺ channel inhibition." },
  { drug: "Levetiracetam", back: "Binds synaptic vesicle protein SV2A — modulates neurotransmitter release; unique novel mechanism." },
  { drug: "Phenobarbitone", back: "Barbiturate — positive allosteric modulator of GABA-A receptor; ↑Cl⁻ channel opening duration." },
  { drug: "Diazepam", back: "Benzodiazepine — positive allosteric modulator of GABA-A; ↑frequency of Cl⁻ channel opening." },
  { drug: "Lorazepam", back: "Benzodiazepine — same GABA-A modulation; high potency, intermediate duration; first-line status epilepticus." },
  { drug: "Clonazepam", back: "Benzodiazepine — positive allosteric GABA-A modulator; used in myoclonic and absence seizures." },
  { drug: "Haloperidol", back: "Typical antipsychotic — potent D₂ receptor antagonist in mesolimbic pathway." },
  { drug: "Risperidone", back: "Atypical antipsychotic — D₂ + 5-HT₂A antagonist; 5-HT₂A blockade ↓EPS risk vs. typicals." },
  { drug: "Olanzapine", back: "Atypical antipsychotic — antagonist at D₂, 5-HT₂A, H₁, M₁, α₁; high metabolic side-effect risk." },
  { drug: "Clozapine", back: "Atypical antipsychotic — blocks D₄ > D₂; also 5-HT₂A, H₁, M, α; used in treatment-resistant schizophrenia." },
  { drug: "Fluoxetine", back: "SSRI — selectively inhibits serotonin reuptake transporter (SERT) → ↑synaptic serotonin." },
  { drug: "Sertraline", back: "SSRI — same SERT inhibition; first-line for depression, OCD, PTSD." },
  { drug: "Amitriptyline", back: "TCA — blocks SERT + NET; also blocks H₁, mAChR, α₁ → significant side-effect profile." },
  { drug: "Venlafaxine", back: "SNRI — inhibits both SERT and NET; dose-dependent NET inhibition; used in depression and anxiety." },
  { drug: "Lithium", back: "Inhibits inositol monophosphatase → depletes IP₃/DAG second messengers; also modulates GSK-3β." },
  { drug: "Donepezil", back: "Reversible AChE inhibitor — ↑synaptic acetylcholine in basal forebrain; used in Alzheimer's." },
  { drug: "Memantine", back: "NMDA receptor antagonist (non-competitive) — blocks excessive glutamate excitotoxicity; moderate-severe AD." },
  { drug: "Levodopa", back: "Dopamine precursor — crosses BBB, decarboxylated to dopamine by DOPA decarboxylase in brain." },
  { drug: "Pramipexole", back: "Non-ergot dopamine agonist — binds D₂/D₃ receptors in striatum; used in PD and RLS." },
  { drug: "Selegiline", back: "Selective MAO-B inhibitor — ↓dopamine breakdown in striatum; adjunct in Parkinson's disease." },
  { drug: "Amoxicillin-Clavulanate", back: "Amoxicillin (PBP inhibitor) + clavulanate (β-lactamase inhibitor → protects amoxicillin from resistance)." },
  { drug: "Piperacillin-Tazobactam", back: "Antipseudomonal β-lactam + β-lactamase inhibitor — broad-spectrum including Pseudomonas and ESBL organisms." },
  { drug: "Meropenem", back: "Carbapenem — ultra-broad-spectrum β-lactam; inhibits PBPs; stable to most β-lactamases." },
  { drug: "Azithromycin", back: "Macrolide — binds 50S ribosomal subunit (23S rRNA) → inhibits translocation of peptide chain." },
  { drug: "Erythromycin", back: "Macrolide — binds 50S ribosome; also prokinetic via motilin receptor agonism." },
  { drug: "Doxycycline", back: "Tetracycline — binds 30S ribosomal subunit → inhibits aminoacyl-tRNA binding to A-site." },
  { drug: "Clindamycin", back: "Lincosamide — binds 50S ribosomal subunit; inhibits peptidyl transferase activity." },
  { drug: "Gentamicin", back: "Aminoglycoside — binds 30S ribosome → causes misreading; uptake oxygen-dependent (inactive anaerobes)." },
  { drug: "Trimethoprim", back: "Inhibits dihydrofolate reductase (bacterial) → blocks folate synthesis; bacteriostatic." },
  { drug: "Co-trimoxazole", back: "Trimethoprim (DHFR) + sulfamethoxazole (DHPS) — sequential blockade of folate synthesis." },
  { drug: "Metronidazole", back: "Prodrug — reduced to reactive nitroso radical in anaerobes/protozoa → DNA strand breaks." },
  { drug: "Fluconazole", back: "Azole antifungal — inhibits CYP51 (lanosterol 14α-demethylase) → ↓ergosterol → membrane disruption." },
  { drug: "Amphotericin B", back: "Polyene antifungal — binds ergosterol → pores in fungal membrane → K⁺ leakage and cell death." },
  { drug: "Acyclovir", back: "Activated by viral thymidine kinase → acyclovir-TP → inhibits viral DNA polymerase (chain terminator)." },
  { drug: "Oseltamivir", back: "Neuraminidase inhibitor — prevents viral shedding from infected cells; inhibits influenza A and B." },
  { drug: "Zidovudine (AZT)", back: "NRTI — nucleoside analogue; incorporated into viral DNA → chain termination; inhibits HIV reverse transcriptase." },
  { drug: "Tenofovir", back: "NRTI — nucleotide analogue; inhibits HIV and HBV reverse transcriptase; backbone of most ART regimens." },
  { drug: "Efavirenz", back: "NNRTI — non-competitive allosteric inhibitor of HIV reverse transcriptase; once-daily dosing." },
  { drug: "Lopinavir", back: "HIV protease inhibitor — blocks cleavage of viral polyprotein → immature, non-infectious virions." },
  { drug: "Dexamethasone", back: "Potent synthetic glucocorticoid — binds GR → ↑anti-inflammatory gene transcription (lipocortin) and ↓cytokines." },
  { drug: "Prednisolone", back: "Glucocorticoid — binds GR → ↑anti-inflammatory proteins, ↓NF-κB → ↓cytokines, adhesion molecules." },
  { drug: "Fludrocortisone", back: "Synthetic mineralocorticoid — binds MR in collecting duct → ↑Na⁺ reabsorption, K⁺ and H⁺ excretion." },
  { drug: "Azathioprine", back: "Prodrug → 6-mercaptopurine → inhibits purine synthesis → ↓lymphocyte proliferation (immunosuppressant)." },
  { drug: "Cyclosporin", back: "Binds cyclophilin → complex inhibits calcineurin → ↓IL-2 transcription → ↓T-cell activation." },
  { drug: "Tacrolimus", back: "Binds FKBP12 → complex inhibits calcineurin → ↓IL-2 → ↓T-cell activation; more potent than cyclosporin." },
  { drug: "Mycophenolate", back: "Inhibits inosine monophosphate dehydrogenase (IMPDH) → ↓guanine synthesis → selective ↓lymphocyte proliferation." },
  { drug: "Infliximab", back: "Anti-TNFα monoclonal antibody (chimeric) — neutralises soluble and membrane-bound TNFα." },
  { drug: "Adalimumab", back: "Anti-TNFα monoclonal antibody (fully human) — same mechanism as infliximab." },
  { drug: "Rituximab", back: "Anti-CD20 monoclonal antibody — depletes B-cells via CDC, ADCC, and direct apoptosis." },
  { drug: "Trastuzumab", back: "Anti-HER2 monoclonal antibody — blocks HER2 dimerisation and downstream PI3K/Akt signalling." },
  { drug: "Imatinib", back: "Tyrosine kinase inhibitor — selectively inhibits BCR-ABL, c-KIT, and PDGFR; first targeted cancer therapy." },
  { drug: "Cyclophosphamide", back: "Alkylating agent — crosslinks DNA strands (N-7 guanine); cell cycle non-specific cytotoxic." },
  { drug: "Cisplatin", back: "Platinum alkylating agent — forms intrastrand and interstrand DNA crosslinks → apoptosis." },
  { drug: "Doxorubicin", back: "Anthracycline — intercalates DNA + inhibits topoisomerase II; also generates free radicals." },
  { drug: "Tamoxifen", back: "SERM — competitive oestrogen receptor antagonist in breast tissue; agonist in bone/endometrium." },
  { drug: "Anastrozole", back: "Aromatase inhibitor — blocks conversion of androgens → oestrogens; used in ER+ post-menopausal breast cancer." },
  { drug: "Allopurinol", back: "Xanthine oxidase inhibitor → ↓uric acid production; used in gout prophylaxis." },
  { drug: "Colchicine", back: "Binds tubulin → inhibits microtubule polymerisation → prevents neutrophil migration into joints." },
  { drug: "Omalizumab", back: "Anti-IgE monoclonal antibody — binds free IgE → prevents mast cell and basophil degranulation." },
  { drug: "Montelukast", back: "Leukotriene receptor antagonist (CysLT1) — blocks bronchoconstriction and mucus secretion in asthma." },
  { drug: "Theophylline", back: "Non-selective phosphodiesterase inhibitor → ↑cAMP/cGMP → bronchodilation; also adenosine antagonism." },
  { drug: "Ipratropium", back: "Muscarinic antagonist (M₃) — blocks parasympathetic bronchoconstriction; non-selective antimuscarinic." },
  { drug: "Tiotropium", back: "Long-acting M₃ muscarinic antagonist (LAMA) — once-daily bronchodilator for COPD." },
  // ==================== ADDITIONAL DRUGS (to reach 500+) ====================
  { drug: "Acetazolamide", back: "Carbonic anhydrase inhibitor → ↓HCO₃⁻ reabsorption in proximal tubule; causes metabolic acidosis; used in glaucoma, altitude sickness." },
  { drug: "Mannitol", back: "Osmotic diuretic — increases plasma osmolality, drawing water from tissues (brain) and increasing urine flow." },
  { drug: "Amiloride", back: "K⁺-sparing diuretic — blocks epithelial Na⁺ channels (ENaC) in collecting duct." },
  { drug: "Triamterene", back: "K⁺-sparing diuretic — inhibits ENaC in collecting duct; same as amiloride." },
  { drug: "Chlorthalidone", back: "Thiazide-like diuretic — inhibits NCC in DCT; longer half-life than HCTZ." },
  { drug: "Metolazone", back: "Thiazide-like diuretic — inhibits NCC; used in resistant oedema, synergistic with loop diuretics." },
  { drug: "Torasemide", back: "Loop diuretic — inhibits Na⁺/K⁺/2Cl⁻ symporter; longer duration than furosemide." },
  { drug: "Bumetanide", back: "Loop diuretic — more potent than furosemide; inhibits Na⁺/K⁺/2Cl⁻ symporter." },
  { drug: "Dabigatran", back: "Direct thrombin inhibitor (DTI) — binds active site of thrombin (factor IIa), blocking fibrinogen→fibrin." },
  { drug: "Rivaroxaban", back: "Direct factor Xa inhibitor — selectively and reversibly blocks active site of factor Xa." },
  { drug: "Apixaban", back: "Direct factor Xa inhibitor — higher bioavailability than rivaroxaban; once/twice daily dosing." },
  { drug: "Edoxaban", back: "Direct factor Xa inhibitor — once daily; used in VTE and stroke prevention in AF." },
  { drug: "Enoxaparin", back: "Low molecular weight heparin (LMWH) — binds antithrombin III → inhibits factor Xa > IIa." },
  { drug: "Fondaparinux", back: "Synthetic pentasaccharide — binds antithrombin III → selective factor Xa inhibition." },
  { drug: "Bivalirudin", back: "Bivalent direct thrombin inhibitor — binds both active site and exosite-1 of thrombin." },
  { drug: "Argatroban", back: "Univalent direct thrombin inhibitor — reversible inhibition of thrombin's active site." },
  { drug: "Ticagrelor", back: "Reversible P2Y12 antagonist — direct binding to ADP receptor; faster onset/offset than clopidogrel." },
  { drug: "Prasugrel", back: "Irreversible P2Y12 blocker — more potent than clopidogrel, faster activation." },
  { drug: "Ticlopidine", back: "Irreversible P2Y12 antagonist — older agent, risk of neutropenia; now largely replaced." },
  { drug: "Dipyridamole", back: "Phosphodiesterase inhibitor + adenosine reuptake inhibitor → ↑cAMP in platelets → antiplatelet effect." },
  { drug: "Cilostazol", back: "PDE3 inhibitor → ↑cAMP → vasodilation and inhibits platelet aggregation; used in intermittent claudication." },
  { drug: "Streptokinase", back: "Binds plasminogen → conformational change → active plasmin → fibrinolytic (non-fibrin selective)." },
  { drug: "Alteplase", back: "Recombinant tPA — fibrin-selective plasminogen activator; used in acute stroke, MI, PE." },
  { drug: "Tenecteplase", back: "Modified tPA — higher fibrin specificity and longer half-life; bolus dosing for MI." },
  { drug: "Reteplase", back: "Recombinant tPA derivative — less fibrin-specific; double-bolus regimen for MI." },
  { drug: "Tranexamic acid", back: "Synthetic lysine analogue — inhibits plasminogen activation by binding lysine-binding sites." },
  { drug: "Aminocaproic acid", back: "Lysine analogue — inhibits plasminogen activation; antifibrinolytic." },
  { drug: "Protamine sulfate", back: "Antidote to heparin — positively charged arginine-rich protein that binds heparin." },
  { drug: "Vitamin K", back: "Cofactor for VKOR → reactivates vitamin K-dependent clotting factors; antidote for warfarin." },
  { drug: "Phytonadione", back: "Vitamin K1 — same mechanism; given orally or subcutaneously for warfarin reversal." },
  { drug: "Idarucizumab", back: "Monoclonal antibody fragment (Fab) that binds dabigatran → reversal of DTI effect." },
  { drug: "Andexanet alfa", back: "Recombinant modified factor Xa decoy — binds and sequesters direct Xa inhibitors (apixaban, rivaroxaban)." },
  { drug: "Naloxone", back: "Opioid receptor antagonist (μ > κ, δ) — reverses opioid-induced respiratory depression." },
  { drug: "Naltrexone", back: "Long-acting opioid antagonist — blocks μ-opioid receptor; used in alcohol/opioid dependence." },
  { drug: "Buprenorphine", back: "Partial μ-opioid agonist, κ antagonist — ceiling effect for respiratory depression; used in addiction." },
  { drug: "Methadone", back: "Long-acting μ-opioid agonist — NMDA antagonist; used for pain and opioid maintenance." },
  { drug: "Fentanyl", back: "Synthetic μ-opioid agonist — high potency (100× morphine), rapid onset, short duration." },
  { drug: "Oxycodone", back: "Semi-synthetic μ-opioid agonist — oral bioavailability high; used for moderate-severe pain." },
  { drug: "Hydromorphone", back: "Potent μ-opioid agonist (5-7× morphine); higher lipid solubility." },
  { drug: "Tramadol", back: "Weak μ-opioid agonist + SNRI — inhibits serotonin and norepinephrine reuptake." },
  { drug: "Tapentadol", back: "μ-opioid agonist + NET inhibitor (norepinephrine reuptake inhibition)." },
  { drug: "Codeine", back: "Prodrug — CYP2D6 converts to morphine (10%); μ-opioid agonist." },
  { drug: "Dihydrocodeine", back: "Semi-synthetic opioid — μ-agonist; similar to codeine but more potent." },
  { drug: "Meperidine", back: "μ-opioid agonist — toxic metabolite normeperidine (CNS excitation); limited use." },
  { drug: "Loperamide", back: "Peripheral μ-opioid agonist — does not cross BBB; reduces GI motility (antidiarrheal)." },
  { drug: "Flumazenil", back: "Benzodiazepine antagonist — competitive inhibition at GABA-A receptor benzodiazepine site." },
  { drug: "Zolpidem", back: "Non-benzodiazepine hypnotic — selective α₁ subunit agonist at GABA-A receptor." },
  { drug: "Eszopiclone", back: "Non-benzodiazepine hypnotic — binds GABA-A at α subunits; similar to zolpidem." },
  { drug: "Zaleplon", back: "Ultra-short acting hypnotic — GABA-A α₁ subunit agonist; very short half-life." },
  { drug: "Ramelteon", back: "Melatonin MT₁/MT₂ receptor agonist — promotes sleep onset; not scheduled." },
  { drug: "Suvorexant", back: "Dual orexin receptor antagonist (OX₁R and OX₂R) — promotes sleep by blocking wakefulness." },
  { drug: "Modafinil", back: "Wakefulness-promoting agent — inhibits dopamine reuptake (weak) and activates orexin system." },
  { drug: "Methylphenidate", back: "CNS stimulant — blocks DAT and NET → ↑dopamine and norepinephrine in prefrontal cortex." },
  { drug: "Amphetamine", back: "Reverses DAT and VMAT2 → releases dopamine and norepinephrine into synapse." },
  { drug: "Lisdexamfetamine", back: "Prodrug of dextroamphetamine — hydrolysed in RBCs to active d-amphetamine." },
  { drug: "Atomoxetine", back: "Selective NET inhibitor (SNRI) — used in ADHD; no abuse potential." },
  { drug: "Guanfacine", back: "Central α₂A-adrenergic agonist — reduces sympathetic outflow; used in ADHD and hypertension." },
  { drug: "Clonidine", back: "Central α₂-agonist — decreases sympathetic tone; used in hypertension, ADHD, withdrawal." },
  { drug: "Dexmedetomidine", back: "Highly selective α₂-agonist — sedative with minimal respiratory depression; used in ICU." },
  { drug: "Baclofen", back: "GABA-B receptor agonist — hyperpolarises spinal motoneurons; reduces spasticity." },
  { drug: "Tizanidine", back: "Central α₂-agonist — inhibits spinal interneurons; antispasticity agent." },
  { drug: "Dantrolene", back: "Inhibits ryanodine receptor (RyR1) in skeletal muscle → uncouples excitation-contraction; used in malignant hyperthermia." },
  { drug: "Botulinum toxin", back: "Protease that cleaves SNARE proteins (SNAP-25) → inhibits ACh release at NMJ." },
  { drug: "Neostigmine", back: "Reversible AChE inhibitor → ↑ACh at NMJ; reverses non-depolarising muscle relaxants." },
  { drug: "Pyridostigmine", back: "Reversible AChE inhibitor — longer-acting than neostigmine; used in myasthenia gravis." },
  { drug: "Edrophonium", back: "Short-acting AChE inhibitor — diagnostic test for myasthenia gravis (Tensilon test)." },
  { drug: "Atropine", back: "Competitive mAChR antagonist (non-selective) — increases HR, dries secretions; antidote for organophosphates." },
  { drug: "Glycopyrrolate", back: "Quaternary antimuscarinic — does not cross BBB; reduces secretions, used pre-op." },
  { drug: "Scopolamine", back: "Antimuscarinic (M₁ > others) — crosses BBB; used for motion sickness and post-op nausea." },
  { drug: "Ipratropium", back: "Muscarinic antagonist (M₃) — blocks parasympathetic bronchoconstriction; non-selective antimuscarinic." },
  { drug: "Tiotropium", back: "Long-acting M₃ muscarinic antagonist (LAMA) — once-daily bronchodilator for COPD." },
  { drug: "Aclidinium", back: "LAMA — rapid onset, once/twice daily; bronchodilator for COPD." },
  { drug: "Umeclidinium", back: "LAMA — used in combination with vilanterol for COPD." },
  { drug: "Pilocarpine", back: "Muscarinic agonist (non-selective) — stimulates salivation; used in xerostomia and glaucoma." },
  { drug: "Cevimeline", back: "M₁/M₃ muscarinic agonist — increases salivary secretion; Sjögren's syndrome." },
  { drug: "Bethanechol", back: "Muscarinic agonist (M₂/M₃) — increases bladder contractility; used in urinary retention." },
  { drug: "Carbachol", back: "Muscarinic and nicotinic agonist — used in glaucoma (miotic)." },
  { drug: "Physostigmine", back: "Reversible AChE inhibitor (crosses BBB) — antidote for anticholinergic toxicity." },
  { drug: "Pralidoxime", back: "Oxime — reactivates AChE inhibited by organophosphates by removing phosphate group." },
  { drug: "Epinephrine", back: "Non-selective α/β agonist — increases HR, BP, bronchodilation; anaphylaxis, cardiac arrest." },
  { drug: "Norepinephrine", back: "α₁ > β₁ agonist (weak β₂) — potent vasoconstrictor; used in septic shock." },
  { drug: "Dopamine", back: "Agonist at D₁, α₁, β₁ (dose-dependent) — low dose: renal vasodilation; high dose: vasoconstriction." },
  { drug: "Dobutamine", back: "β₁-selective agonist (racemic mixture) — increases contractility with modest HR increase." },
  { drug: "Isoproterenol", back: "Non-selective β agonist (β₁=β₂) — increases HR and contractility; bronchodilation." },
  { drug: "Phenylephrine", back: "Selective α₁ agonist — vasoconstriction; used as decongestant and for hypotension." },
  { drug: "Midodrine", back: "Prodrug → desglymidodrine (α₁ agonist) — used in orthostatic hypotension." },
  { drug: "Clonidine", back: "Central α₂ agonist — reduces sympathetic outflow; hypertension, ADHD." },
  { drug: "Methyldopa", back: "Prodrug → methylnorepinephrine (α₂ agonist) — centrally acting antihypertensive; safe in pregnancy." },
  { drug: "Prazosin", back: "α₁-selective antagonist — vasodilation; used in hypertension and PTSD nightmares." },
  { drug: "Doxazosin", back: "Long-acting α₁ antagonist — used in hypertension and BPH." },
  { drug: "Terazosin", back: "α₁ antagonist — similar to doxazosin; BPH and hypertension." },
  { drug: "Tamsulosin", back: "Selective α₁A/α₁D antagonist — relaxes prostate smooth muscle; minimal BP effect." },
  { drug: "Alfuzosin", back: "α₁ antagonist — used for BPH; less cardiac effects than tamsulosin." },
  { drug: "Silodosin", back: "Highly selective α₁A antagonist — for BPH; higher risk of retrograde ejaculation." },
  { drug: "Phentolamine", back: "Non-selective α blocker (α₁ + α₂) — used in pheochromocytoma crisis." },
  { drug: "Phenoxybenzamine", back: "Irreversible α blocker — long-acting; used before pheochromocytoma surgery." },
  { drug: "Yohimbine", back: "Selective α₂ antagonist — increases sympathetic outflow; used for erectile dysfunction (rare)." },
  { drug: "Labetalol", back: "Non-selective β blocker + α₁ blocker — reduces BP without reflex tachycardia." },
  { drug: "Nebivolol", back: "β₁-selective blocker + NO-dependent vasodilation (β₃ agonist?)." },
  { drug: "Betaxolol", back: "β₁-selective blocker — used in hypertension and glaucoma (topical)." },
  { drug: "Carteolol", back: "Non-selective β blocker with intrinsic sympathomimetic activity (ISA)." },
  { drug: "Pindolol", back: "Non-selective β blocker with ISA — less bradycardia than propranolol." },
  { drug: "Acebutolol", back: "β₁-selective blocker with ISA — used in hypertension and arrhythmias." },
  { drug: "Esmolol", back: "Ultra-short-acting β₁-selective blocker — used in acute arrhythmias (IV only)." },
  { drug: "Sotalol", back: "Non-selective β blocker + class III antiarrhythmic (K⁺ channel blockade)." },
  { drug: "Amiodarone", back: "Class III antiarrhythmic — blocks K⁺ channels, also Na⁺, Ca²⁺, β-blocker effects; multichannel blocker." },
  { drug: "Dronedarone", back: "Amiodarone analogue — multichannel blocker but no iodine; less toxicity." },
  { drug: "Procainamide", back: "Class Ia antiarrhythmic — blocks Na⁺ channels (intermediate kinetics) + K⁺ channels." },
  { drug: "Quinidine", back: "Class Ia — Na⁺ channel blocker; also antimalarial (blocks parasite K⁺ channels)." },
  { drug: "Disopyramide", back: "Class Ia — Na⁺ blocker; negative inotrope; used in hypertrophic cardiomyopathy." },
  { drug: "Lidocaine", back: "Class Ib — fast Na⁺ channel blocker (inactivated state); used in ventricular arrhythmias." },
  { drug: "Mexiletine", back: "Oral lidocaine analogue — Class Ib; used in myotonia and ventricular arrhythmias." },
  { drug: "Flecainide", back: "Class Ic — potent Na⁺ channel blocker (slow kinetics); used in atrial fibrillation (no structural disease)." },
  { drug: "Propafenone", back: "Class Ic + weak β-blocker — Na⁺ channel blocker; used in AF and SVT." },
  { drug: "Adenosine", back: "Activates A₁ receptors in AV node → ↓cAMP → ↑K⁺ efflux, hyperpolarisation; terminates SVT." },
  { drug: "Ivabradine", back: "Blocks HCN channels (I_f current) in SA node → reduces HR without affecting contractility." },
  { drug: "Ranolazine", back: "Inhibits late Na⁺ current → reduces intracellular Ca²⁺ overload; antianginal, antiarrhythmic." },
  { drug: "Hydralazine", back: "Direct arterial vasodilator — activates K⁺ channels? Exact mechanism: increases cGMP in smooth muscle." },
  { drug: "Minoxidil", back: "Opens ATP-sensitive K⁺ channels in vascular smooth muscle → vasodilation; also promotes hair growth." },
  { drug: "Sodium nitroprusside", back: "Nitric oxide donor — activates soluble guanylyl cyclase → ↑cGMP → vasodilation (arterial + venous)." },
  { drug: "Nitroglycerin", back: "Organic nitrate — metabolised to NO → ↑cGMP → venodilation > arterial; reduces preload." },
  { drug: "Isosorbide mononitrate", back: "Active metabolite of isosorbide dinitrate — NO donor; long-acting antianginal." },
  { drug: "Isosorbide dinitrate", back: "Prodrug → isosorbide mononitrate → NO donor; venodilator." },
  { drug: "Nicorandil", back: "K⁺ channel opener + NO donor — dual mechanism; antianginal." },
  { drug: "Fenoldopam", back: "Selective D₁ receptor agonist — renal vasodilation; used in hypertensive emergencies." },
  { drug: "Epoprostenol", back: "Prostacyclin (PGI₂) analogue — vasodilation, inhibits platelet aggregation; used in pulmonary hypertension." },
  { drug: "Treprostinil", back: "PGI₂ analogue — same as epoprostenol; subcutaneous, IV, inhaled." },
  { drug: "Iloprost", back: "PGI₂ analogue — inhaled for pulmonary hypertension." },
  { drug: "Selexipag", back: "Selective IP prostacyclin receptor agonist — oral for pulmonary hypertension." },
  { drug: "Bosentan", back: "Dual endothelin receptor antagonist (ETA/ETB) — used in pulmonary arterial hypertension." },
  { drug: "Ambrisentan", back: "Selective ETA antagonist — pulmonary vasodilation; less hepatotoxicity than bosentan." },
  { drug: "Macitentan", back: "Dual endothelin antagonist — tissue-targeting; used in PAH." },
  { drug: "Riociguat", back: "Soluble guanylate cyclase stimulator (NO-independent) — used in PAH and CTEPH." },
  { drug: "Sildenafil", back: "PDE5 inhibitor — ↑cGMP in pulmonary vasculature; used in PAH and ED." },
  { drug: "Tadalafil", back: "Long-acting PDE5 inhibitor — used in PAH and ED." },
  { drug: "Vardenafil", back: "PDE5 inhibitor — similar to sildenafil; for ED." },
  { drug: "Alprostadil", back: "PGE₁ analogue — vasodilation; used in erectile dysfunction (intracavernosal) and to maintain ductus arteriosus." },
  { drug: "Methylergonovine", back: "Ergot alkaloid — 5-HT₂A agonist; used for postpartum haemorrhage." },
  { drug: "Ergotamine", back: "5-HT₁B/₁D agonist + α antagonist — vasoconstriction; used in migraine (now less common)." },
  { drug: "Dihydroergotamine", back: "5-HT₁B/₁D agonist — less vasospasm than ergotamine; used in migraine." },
  { drug: "Sumatriptan", back: "5-HT₁B/₁D receptor agonist — constricts cranial vessels, inhibits trigeminal nerve firing." },
  { drug: "Rizatriptan", back: "5-HT₁B/₁D agonist — similar to sumatriptan; higher oral bioavailability." },
  { drug: "Eletriptan", back: "5-HT₁B/₁D agonist — lipophilic; used in acute migraine." },
  { drug: "Zolmitriptan", back: "5-HT₁B/₁D agonist — oral and nasal spray." },
  { drug: "Naratriptan", back: "5-HT₁B/₁D agonist — longer half-life, slower onset." },
  { drug: "Frovatriptan", back: "Long-acting triptan — used for menstrual migraine." },
  { drug: "Ergotamine", back: "5-HT₁B/₁D agonist + α blocker — vasoconstriction; used in migraine." },
  { drug: "Lasmiditan", back: "5-HT₁F agonist — no vasoconstriction; for acute migraine." },
  { drug: "Ubrogepant", back: "CGRP receptor antagonist — small molecule for acute migraine." },
  { drug: "Rimegepant", back: "CGRP antagonist — acute and preventive migraine treatment." },
  { drug: "Erenumab", back: "Anti-CGRP receptor monoclonal antibody — preventive migraine." },
  { drug: "Galcanezumab", back: "Anti-CGRP monoclonal antibody — preventive migraine." },
  { drug: "Fremanezumab", back: "Anti-CGRP antibody — preventive migraine." },
  { drug: "Topiramate", back: "Multiple mechanisms: Na⁺ channel block, GABA-A potentiation, AMPA/kainate antagonism; migraine prophylaxis." },
  { drug: "Propranolol", back: "Non-selective β-blocker — reduces migraine frequency (mechanism unclear)." },
  { drug: "Valproate", back: "↑GABA, Na⁺/Ca²⁺ channel block; migraine prophylaxis." },
  { drug: "OnabotulinumtoxinA", back: "BoNT-A — cleaves SNAP-25; inhibits ACh release from nerve endings; chronic migraine." },
  { drug: "Phenelzine", back: "MAOI (non-selective, irreversible) — ↑monoamines; used in atypical depression." },
  { drug: "Tranylcypromine", back: "Non-selective, irreversible MAOI — similar to phenelzine; stimulant properties." },
  { drug: "Isocarboxazid", back: "Non-selective MAOI — used in depression (rarely due to diet interactions)." },
  { drug: "Moclobemide", back: "Reversible MAO-A inhibitor — fewer dietary restrictions; used in depression." },
  { drug: "Selegiline", back: "Selective MAO-B inhibitor at low doses; at high doses inhibits MAO-A." },
  { drug: "Rasagiline", back: "Selective MAO-B inhibitor — neuroprotective claims; used in Parkinson's." },
  { drug: "Bupropion", back: "NDRI — inhibits DAT and NET; used in depression, smoking cessation." },
  { drug: "Mirtazapine", back: "α₂ antagonist + 5-HT₂/5-HT₃ antagonist → ↑NA and 5-HT; also H₁ antagonist (sedation)." },
  { drug: "Trazodone", back: "5-HT₂ antagonist + weak SERT inhibitor; sedating antidepressant." },
  { drug: "Vortioxetine", back: "SERT inhibitor + 5-HT₁A agonist + 5-HT₃ antagonist; multimodal antidepressant." },
  { drug: "Vilazodone", back: "SERT inhibitor + 5-HT₁A partial agonist — less sexual side effects." },
  { drug: "Desvenlafaxine", back: "Active metabolite of venlafaxine — SNRI." },
  { drug: "Duloxetine", back: "SNRI — balanced SERT/NET inhibition; used in depression, neuropathic pain, stress incontinence." },
  { drug: "Levomilnacipran", back: "SNRI with higher NET:SERT ratio; for depression." },
  { drug: "Milnacipran", back: "SNRI — approved for fibromyalgia (not depression in US)." },
  { drug: "Nefazodone", back: "5-HT₂ antagonist + SERT inhibition (weak); hepatotoxicity risk." },
  { drug: "Agomelatine", back: "Melatonin MT₁/MT₂ agonist + 5-HT₂C antagonist — resynchronises circadian rhythms." },
  { drug: "Esketamine", back: "NMDA antagonist (S-enantiomer of ketamine) — rapid-acting antidepressant; intranasal." },
  { drug: "Ketamine", back: "Non-competitive NMDA antagonist — rapid antidepressant, dissociative anaesthetic." },
  { drug: "Lithium", back: "Inhibits inositol monophosphatase → depletes IP₃/DAG; modulates GSK-3β." },
  { drug: "Carbamazepine", back: "Na⁺ channel blocker; mood stabiliser, also for trigeminal neuralgia." },
  { drug: "Oxcarbazepine", back: "Prodrug of licarbazepine (Na⁺ channel blocker) — better tolerated than carbamazepine." },
  { drug: "Lamotrigine", back: "Na⁺ channel blocker (use-dependent) — mood stabiliser (bipolar depression)." },
  { drug: "Gabapentin", back: "Binds α₂δ subunit of voltage-gated Ca²⁺ channels → ↓ neurotransmitter release; neuropathic pain, epilepsy." },
  { drug: "Pregabalin", back: "α₂δ ligand (similar to gabapentin) — higher potency; neuropathic pain, fibromyalgia, anxiety." },
  { drug: "Phenytoin", back: "Na⁺ channel blocker; also used in neuropathic pain (less common)." },
  { drug: "Lacosamide", back: "Enhances slow inactivation of Na⁺ channels; for focal epilepsy." },
  { drug: "Rufinamide", back: "Na⁺ channel blocker (prolongs inactivation); Lennox-Gastaut syndrome." },
  { drug: "Eslicarbazepine", back: "Na⁺ channel blocker (active metabolite of oxcarbazepine); once-daily." },
  { drug: "Perampanel", back: "Non-competitive AMPA receptor antagonist; for focal and generalised seizures." },
  { drug: "Brivaracetam", back: "SV2A ligand (similar to levetiracetam) — higher potency." },
  { drug: "Cannabidiol (CBD)", back: "Modulates GPR55 and TRPV1; also inhibits adenosine reuptake; for Dravet and Lennox-Gastaut." },
  { drug: "Felbamate", back: "NMDA antagonist + Na⁺/Ca²⁺ channel block; severe aplastic anaemia risk; reserved." },
  { drug: "Vigabatrin", back: "Irreversible GABA-T inhibitor → ↑GABA; causes visual field defects." },
  { drug: "Tiagabine", back: "GABA reuptake inhibitor (GAT-1) → ↑synaptic GABA." },
  { drug: "Zonisamide", back: "Na⁺ and T-type Ca²⁺ channel blocker; also carbonic anhydrase inhibitor." },
  { drug: "Ethosuximide", back: "T-type Ca²⁺ channel blocker (thalamic) — first-line for absence seizures." },
  { drug: "Trimethadione", back: "T-type Ca²⁺ blocker — older agent for absence; replaced by ethosuximide." },
  { drug: "Primidone", back: "Metabolised to phenobarbital and phenylethylmalonamide; similar barbiturate mechanism." },
  { drug: "Mephenytoin", back: "Hydantoin derivative — similar to phenytoin; rarely used." },
  { drug: "Fosphenytoin", back: "Water-soluble phenytoin prodrug — IV/IM for status epilepticus." },
  { drug: "Cenobamate", back: "Na⁺ channel blocker + GABA-A positive allosteric modulator; refractory focal seizures." },
  { drug: "Apomorphine", back: "Dopamine agonist (D₁/D₂) — for Parkinson's 'off' episodes (subcutaneous)." },
  { drug: "Rotigotine", back: "Transdermal dopamine agonist (D₃ > D₂/D₁) — Parkinson's and RLS." },
  { drug: "Ropinirole", back: "D₂/D₃ agonist — Parkinson's and RLS." },
  { drug: "Piribedil", back: "D₂/D₃ agonist — used in Europe for Parkinson's." },
  { drug: "Entacapone", back: "COMT inhibitor (peripheral) — reduces levodopa metabolism; extends 'on' time." },
  { drug: "Tolcapone", back: "COMT inhibitor (central and peripheral) — more effective but hepatotoxic; reserved." },
  { drug: "Opicapone", back: "Peripheral COMT inhibitor — once-daily; similar to entacapone." },
  { drug: "Amantadine", back: "Weak NMDA antagonist + anticholinergic? — used in Parkinson's and drug-induced dyskinesia." },
  { drug: "Benztropine", back: "Central anticholinergic (M₁ antagonist) — reduces parkinsonian tremors and EPS." },
  { drug: "Trihexyphenidyl", back: "Central anticholinergic — similar to benztropine." },
  { drug: "Procyclidine", back: "Anticholinergic — used for drug-induced EPS." },
  { drug: "Biperiden", back: "Anticholinergic — Parkinson's and EPS." },
  { drug: "Orphenadrine", back: "Anticholinergic + NMDA antagonist? — muscle relaxant." },
  { drug: "Rivastigmine", back: "AChE and BuChE inhibitor (pseudo-irreversible) — Alzheimer's and Parkinson's dementia." },
  { drug: "Galantamine", back: "AChE inhibitor + nicotinic allosteric modulator — Alzheimer's." },
  { drug: "Tacrine", back: "First AChE inhibitor — hepatotoxic; no longer used." },
  { drug: "Levetiracetam", back: "SV2A ligand — also used in myoclonic seizures." },
  { drug: "Clobazam", back: "1,5-benzodiazepine — GABA-A positive modulator; adjunct in Lennox-Gastaut." },
  { drug: "Nitrazepam", back: "Benzodiazepine — hypnotic and anticonvulsant." },
  { drug: "Temazepam", back: "Benzodiazepine — hypnotic; active metabolite of diazepam." },
  { drug: "Oxazepam", back: "Benzodiazepine (active metabolite of many) — intermediate duration." },
  { drug: "Alprazolam", back: "High-potency benzodiazepine — anxiolytic; high abuse potential." },
  { drug: "Clonazepam", back: "Long-acting benzodiazepine — panic disorder and epilepsy." },
  { drug: "Chlordiazepoxide", back: "Benzodiazepine — first benzodiazepine; used in alcohol withdrawal." },
  { drug: "Midazolam", back: "Water-soluble benzodiazepine — sedation, anaesthesia, status epilepticus." },
  { drug: "Triazolam", back: "Short-acting benzodiazepine — hypnotic." },
  { drug: "Estazolam", back: "Benzodiazepine — hypnotic." },
  { drug: "Quazepam", back: "Long-acting benzodiazepine — hypnotic." },
  { drug: "Flurazepam", back: "Long-acting benzodiazepine — hypnotic (active metabolite)." },
  { drug: "Buspirone", back: "5-HT₁A partial agonist — anxiolytic; no sedation, no dependence." },
  { drug: "Hydroxyzine", back: "H₁ antagonist + weak 5-HT₂A antagonist — anxiolytic, sedative, antipruritic." },
  { drug: "Prochlorperazine", back: "D₂ antagonist — antiemetic, antipsychotic." },
  { drug: "Promethazine", back: "H₁ antagonist + weak D₂ — antiemetic, sedative, anti-allergic." },
  { drug: "Metoclopramide", back: "D₂ antagonist + 5-HT₃ antagonist? + 5-HT₄ agonist — prokinetic; antiemetic." },
  { drug: "Domperidone", back: "Peripheral D₂ antagonist — prokinetic; does not cross BBB; antiemetic." },
  { drug: "Cisapride", back: "5-HT₄ agonist + 5-HT₃ antagonist — prokinetic; withdrawn due to QT prolongation." },
  { drug: "Mosapride", back: "5-HT₄ agonist — prokinetic; used in Asia." },
  { drug: "Tegaserod", back: "5-HT₄ agonist — for IBS-C; withdrawn due to CV risk, now restricted." },
  { drug: "Lubiprostone", back: "Type-2 chloride channel activator (ClC-2) → ↑intestinal fluid; for constipation." },
  { drug: "Linaclotide", back: "Guanylate cyclase-C agonist → ↑cGMP → ↑intestinal fluid and transit." },
  { drug: "Plecanatide", back: "GC-C agonist — similar to linaclotide; for IBS-C and chronic constipation." },
  { drug: "Alosetron", back: "5-HT₃ antagonist — for severe IBS-D; restricted due to ischaemic colitis." },
  { drug: "Ramosetron", back: "5-HT₃ antagonist — for IBS-D; used in Asia." },
  { drug: "Eluxadoline", back: "μ-agonist + δ-antagonist — reduces GI motility; for IBS-D." },
  { drug: "Rifaximin", back: "Non-absorbable rifamycin — inhibits bacterial RNA polymerase; for IBS-D and hepatic encephalopathy." },
  { drug: "Loperamide", back: "Peripheral μ-agonist — reduces GI motility; antidiarrheal." },
  { drug: "Diphenoxylate", back: "Peripheral μ-agonist (combined with atropine) — antidiarrheal." },
  { drug: "Bismuth subsalicylate", back: "Coats mucosa + weak antibacterial + anti-inflammatory; for traveller's diarrhoea." },
  { drug: "Sucralfate", back: "Sucrose aluminium complex — forms protective barrier on ulcers; promotes healing." },
  { drug: "Misoprostol", back: "PGE₁ analogue — increases mucus and bicarbonate; protects gastric mucosa; also induces labour." },
  { drug: "Carbenoxolone", back: "Glycyrrhetinic acid derivative — inhibits 11β-HSD2; ulcer healing (not used in US)." },
  { drug: "Ranitidine", back: "H₂ receptor antagonist — reduces gastric acid secretion (withdrawn in many countries due to NDMA)." },
  { drug: "Famotidine", back: "H₂ antagonist — more potent than ranitidine; available OTC." },
  { drug: "Nizatidine", back: "H₂ antagonist — similar to famotidine." },
  { drug: "Cimetidine", back: "First H₂ antagonist — inhibits CYP450 (many interactions); less potent." },
  { drug: "Pantoprazole", back: "PPI — irreversible H⁺/K⁺-ATPase inhibitor; less CYP2C19 interaction." },
  { drug: "Rabeprazole", back: "PPI — faster onset; non-enzymatic activation." },
  { drug: "Lansoprazole", back: "PPI — similar to omeprazole." },
  { drug: "Esomeprazole", back: "S-isomer of omeprazole — higher bioavailability." },
  { drug: "Dexlansoprazole", back: "Dual delayed-release PPI — once-daily with longer duration." },
  { drug: "Sodium bicarbonate", back: "Systemic antacid — neutralises gastric acid; used in metabolic acidosis." },
  { drug: "Calcium carbonate", back: "Antacid — neutralises acid; also calcium source." },
  { drug: "Magnesium hydroxide", back: "Antacid + osmotic laxative." },
  { drug: "Aluminium hydroxide", back: "Antacid — binds phosphate; causes constipation." },
  { drug: "Simethicone", back: "Surfactant — reduces surface tension of gas bubbles; antiflatulent." },
  { drug: "Ursodeoxycholic acid", back: "Hydrophilic bile acid — displaces toxic bile acids; used in cholestasis and gallstone dissolution." },
  { drug: "Chenodeoxycholic acid", back: "Bile acid — dissolves gallstones; replaced by UDCA due to diarrhoea." },
  { drug: "Obeticholic acid", back: "FXR agonist — reduces bile acid synthesis; for primary biliary cholangitis." },
  { drug: "Lactulose", back: "Non-absorbable disaccharide — metabolised to organic acids → osmotic laxative and reduces ammonia." },
  { drug: "Polyethylene glycol", back: "Osmotic laxative — non-absorbable; for constipation and bowel prep." },
  { drug: "Senna", back: "Anthraquinone laxative — stimulates colonic motility; causes melanosis coli." },
  { drug: "Bisacodyl", back: "Diphenylmethane laxative — stimulates colonic motility; rectal and oral." },
  { drug: "Docusate", back: "Stool softener (surfactant) — lowers surface tension; minimal efficacy." },
  { drug: "Glycerin", back: "Hyperosmotic rectal laxative — draws water into rectum." },
  { drug: "Linaclotide", back: "GC-C agonist — increases intestinal fluid; for constipation." },
  { drug: "Prucalopride", back: "5-HT₄ agonist — prokinetic for chronic constipation." },
  { drug: "Naloxegol", back: "Peripheral μ-antagonist (PEGylated naloxone) — for opioid-induced constipation." },
  { drug: "Methylnaltrexone", back: "Peripheral μ-antagonist (quaternary) — opioid-induced constipation." },
  { drug: "Ondansetron", back: "5-HT₃ antagonist — antiemetic." },
  { drug: "Granisetron", back: "5-HT₃ antagonist — longer-acting; for CINV." },
  { drug: "Palonosetron", back: "5-HT₃ antagonist with long half-life (40h) — for CINV." },
  { drug: "Dolasetron", back: "5-HT₃ antagonist — for CINV and post-op nausea." },
  { drug: "Aprepitant", back: "NK₁ antagonist — blocks substance P; used in CINV." },
  { drug: "Fosaprepitant", back: "Prodrug of aprepitant — IV formulation." },
  { drug: "Rolapitant", back: "Long-acting NK₁ antagonist — for CINV." },
  { drug: "Metoclopramide", back: "D₂ antagonist + 5-HT₄ agonist — prokinetic and antiemetic." },
  { drug: "Droperidol", back: "Butyrophenone (D₂ antagonist) — antiemetic; black box for QT prolongation." },
  { drug: "Haloperidol", back: "D₂ antagonist — used off-label for nausea." },
  { drug: "Trimethobenzamide", back: "Antiemetic (mechanism unclear) — less effective." },
  { drug: "Scopolamine", back: "Muscarinic antagonist — transdermal for motion sickness." },
  { drug: "Cyclizine", back: "H₁ antagonist — antiemetic for motion sickness." },
  { drug: "Meclizine", back: "H₁ antagonist — motion sickness, vertigo." },
  { drug: "Dimenhydrinate", back: "H₁ antagonist (diphenhydramine + theophylline) — motion sickness." },
  { drug: "Diphenhydramine", back: "H₁ antagonist — antiemetic, sedative, antiallergic." },
  { drug: "Doxylamine", back: "H₁ antagonist — sedative, antiemetic in pregnancy (with B6)." },
  { drug: "Pyridoxine (B6)", back: "Vitamin — cofactor; used with doxylamine for morning sickness." },
  { drug: "Glucagon", back: "Peptide hormone — activates Gs → ↑cAMP; increases blood glucose; used in hypoglycaemia and as smooth muscle relaxant (ERCP)." },
  { drug: "Octreotide", back: "Somatostatin analogue — inhibits GH, insulin, glucagon, GI secretions; for carcinoid, variceal bleeding." },
  { drug: "Lanreotide", back: "Somatostatin analogue — similar to octreotide; longer depot." },
  { drug: "Pasireotide", back: "Multireceptor somatostatin analogue — for acromegaly and Cushing's disease." },
  { drug: "Vasopressin", back: "V₁/V₂ agonist — vasoconstriction (V₁) and water reabsorption (V₂); used in diabetes insipidus and variceal bleed." },
  { drug: "Desmopressin", back: "Selective V₂ agonist — increases water reabsorption; for nocturnal enuresis and diabetes insipidus." },
  { drug: "Terlipressin", back: "Prodrug of lysine-vasopressin — V₁ selective; used in variceal bleeding (not US)." },
  { drug: "Oxytocin", back: "Oxytocin receptor agonist — stimulates uterine contractions and milk ejection." },
  { drug: "Carbetocin", back: "Long-acting oxytocin analogue — for prevention of postpartum haemorrhage." },
  { drug: "Ergonovine", back: "Ergot alkaloid — 5-HT₂A agonist; used for postpartum haemorrhage." },
  { drug: "Dinoprostone", back: "PGE₂ — ripens cervix, induces labour; also for missed abortion." },
  { drug: "Misoprostol", back: "PGE₁ analogue — induces labour, prevents NSAID ulcers, also used for abortion." },
  { drug: "Mifepristone", back: "Progesterone antagonist (antiprogestin) — used for medical abortion and Cushing's syndrome." },
  { drug: "Letrozole", back: "Aromatase inhibitor — third-generation; for ER+ breast cancer; also ovulation induction." },
  { drug: "Exemestane", back: "Steroidal aromatase inactivator — irreversible; for breast cancer." },
  { drug: "Fulvestrant", back: "Selective oestrogen receptor downregulator (SERD) — degrades ER; for metastatic breast cancer." },
  { drug: "Toremifene", back: "SERM — similar to tamoxifen; for breast cancer." },
  { drug: "Raloxifene", back: "SERM — oestrogen agonist in bone, antagonist in breast/uterus; for osteoporosis." },
  { drug: "Bazedoxifene", back: "SERM — used with conjugated oestrogens for osteoporosis." },
  { drug: "Clomiphene", back: "SERM (weak oestrogen agonist/antagonist) — induces ovulation by blocking negative feedback." },
  { drug: "Enclomiphene", back: "Trans-isomer of clomiphene — for hypogonadism." },
  { drug: "Testosterone", back: "Androgen receptor agonist — replacement therapy; anabolic effects." },
  { drug: "Methyltestosterone", back: "17α-alkylated androgen — oral; hepatotoxic." },
  { drug: "Oxandrolone", back: "Anabolic steroid — for weight gain, HIV wasting." },
  { drug: "Nandrolone", back: "Anabolic steroid — promotes protein synthesis; limited use." },
  { drug: "Danazol", back: "Androgenic steroid — suppresses gonadotropins; used in endometriosis." },
  { drug: "Finasteride", back: "5α-reductase type II inhibitor — blocks DHT synthesis; for BPH and androgenetic alopecia." },
  { drug: "Dutasteride", back: "5α-reductase type I + II inhibitor — more potent; for BPH." },
  { drug: "Dutasteride", back: "5α-reductase inhibitor — same as above." },
  { drug: "Tamsulosin", back: "α₁A antagonist — for BPH." },
  { drug: "Alfuzosin", back: "α₁ antagonist — for BPH." },
  { drug: "Silodosin", back: "α₁A selective — for BPH." },
  { drug: "Terazosin", back: "α₁ antagonist — for BPH and hypertension." },
  { drug: "Doxazosin", back: "α₁ antagonist — same." },
  { drug: "Prazosin", back: "α₁ antagonist — primarily for hypertension, but also BPH off-label." },
  { drug: "Solifenacin", back: "M₃ selective antimuscarinic — for overactive bladder (OAB)." },
  { drug: "Darifenacin", back: "M₃ selective — for OAB." },
  { drug: "Tolterodine", back: "Non-selective antimuscarinic — for OAB." },
  { drug: "Oxybutynin", back: "Antimuscarinic (M₁/M₂/M₃) — for OAB; also topical for hyperhidrosis." },
  { drug: "Fesoterodine", back: "Prodrug of 5-hydroxymethyl tolterodine — antimuscarinic for OAB." },
  { drug: "Trospium", back: "Quaternary antimuscarinic — no CNS effects; for OAB." },
  { drug: "Mirabegron", back: "β₃-adrenergic agonist — relaxes detrusor muscle; for OAB." },
  { drug: "Vibegron", back: "β₃ agonist — for OAB." },
  { drug: "Phenazopyridine", back: "Urinary tract analgesic — topical effect on mucosa; no antimicrobial activity." },
  { drug: "Methenamine", back: "Prodrug — releases formaldehyde in acidic urine; urinary antiseptic." },
  { drug: "Nitrofurantoin", back: "Inhibits bacterial enzymes (acetylation of carbamates?) — causes DNA damage; for UTIs." },
  { drug: "Fosfomycin", back: "Inhibits MurA (UDP-N-acetylglucosamine enolpyruvyl transferase) — cell wall synthesis; single-dose for UTI." },
  { drug: "Cefalexin", back: "First-generation cephalosporin — inhibits PBP; gram-positive coverage." },
  { drug: "Cefuroxime", back: "Second-generation cephalosporin — more gram-negative coverage." },
  { drug: "Ceftriaxone", back: "Third-generation cephalosporin — broad-spectrum, crosses BBB; long half-life." },
  { drug: "Ceftazidime", back: "Third-generation — antipseudomonal; low activity against gram-positives." },
  { drug: "Cefepime", back: "Fourth-generation cephalosporin — broad, including Pseudomonas; stable to some β-lactamases." },
  { drug: "Ceftaroline", back: "Fifth-generation — active against MRSA; inhibits PBP2a." },
  { drug: "Ceftobiprole", back: "Fifth-generation — anti-MRSA and Pseudomonas." },
  { drug: "Cefiderocol", back: "Siderophore cephalosporin — iron-uptake mediated entry; for carbapenem-resistant bacteria." },
  { drug: "Aztreonam", back: "Monobactam — inhibits PBP3; only gram-negative, no cross-allergy with penicillins." },
  { drug: "Imipenem", back: "Carbapenem — broad-spectrum; given with cilastatin (renal dehydropeptidase inhibitor)." },
  { drug: "Ertapenem", back: "Carbapenem — once-daily; not for Pseudomonas." },
  { drug: "Doripenem", back: "Carbapenem — similar to meropenem; for complicated intra-abdominal infections." },
  { drug: "Clavulanate", back: "β-lactamase inhibitor (suicide inhibitor) — protects amoxicillin." },
  { drug: "Sulbactam", back: "β-lactamase inhibitor — combined with ampicillin (Unasyn)." },
  { drug: "Tazobactam", back: "β-lactamase inhibitor — combined with piperacillin." },
  { drug: "Avibactam", back: "Non-β-lactam β-lactamase inhibitor (reversible) — inhibits class A, C, some D." },
  { drug: "Relebactam", back: "Avibactam-like — with imipenem/cilastatin." },
  { drug: "Vaborbactam", back: "Boronic acid β-lactamase inhibitor — with meropenem." },
  { drug: "Dalbavancin", back: "Lipoglycopeptide — inhibits cell wall (D-Ala-D-Ala); long half-life (1 week)." },
  { drug: "Telavancin", back: "Lipoglycopeptide — cell wall + membrane disruption; for MRSA." },
  { drug: "Oritavancin", back: "Lipoglycopeptide — multi-mechanism; single-dose for ABSSSI." },
  { drug: "Teicoplanin", back: "Glycopeptide — similar to vancomycin; used outside US." },
  { drug: "Linezolid", back: "Oxazolidinone — binds 50S (23S) → inhibits initiation complex; MRSA, VRE." },
  { drug: "Tedizolid", back: "Oxazolidinone — more potent than linezolid; once-daily for ABSSSI." },
  { drug: "Daptomycin", back: "Lipopeptide — inserts into bacterial membrane (Ca²⁺-dependent) → depolarisation; gram-positives." },
  { drug: "Fidaxomicin", back: "Macrocyclic — inhibits RNA polymerase (σ subunit); for C. difficile." },
  { drug: "Polymyxin B", back: "Lipopeptide — disrupts gram-negative outer membrane; nephrotoxic." },
  { drug: "Colistin", back: "Polymyxin E — same mechanism; last-resort for MDR gram-negatives." },
  { drug: "Tigecycline", back: "Glycylcycline (30S binder) — broad-spectrum including MDR; bacteriostatic." },
  { drug: "Eravacycline", back: "Fluorocycline — similar to tigecycline; for intra-abdominal infections." },
  { drug: "Omadacycline", back: "Aminomethylcycline — once-daily IV/po; broad-spectrum." },
  { drug: "Lefamulin", back: "Pleuromutilin — inhibits 50S peptidyl transferase; for community-acquired pneumonia." },
  { drug: "Solithromycin", back: "Fluoroketolide (macrolide derivative) — 50S binding; for CAP." },
  { drug: "Fosfomycin trometamol", back: "Inhibits MurA; single-dose oral for UTI." },
  { drug: "Ceftazidime-avibactam", back: "Cephalosporin + β-lactamase inhibitor — for KPC producers." },
  { drug: "Ceftolozane-tazobactam", back: "Antipseudomonal cephalosporin + BLI — for MDR Pseudomonas." },
  { drug: "Meropenem-vaborbactam", back: "Carbapenem + BLI — for CRE." },
  { drug: "Imipenem-cilastatin-relebactam", back: "Carbapenem + DHPI + BLI — for CRE." },
  { drug: "Cefiderocol", back: "Siderophore cephalosporin — for carbapenem-resistant gram-negatives." },
  { drug: "Delamanid", back: "Nitroimidazole — inhibits mycolic acid synthesis; for MDR-TB." },
  { drug: "Pretomanid", back: "Nitroimidazole — similar; part of BPaL regimen for XDR-TB." },
  { drug: "Bedaquiline", back: "Inhibits mycobacterial ATP synthase (subunit c); for MDR-TB." },
  { drug: "Clofazimine", back: "Rimino-phenazine — binds DNA; for leprosy and TB." },
  { drug: "Dapsone", back: "Inhibits dihydropteroate synthase (DHPS) — for leprosy and Pneumocystis." },
  { drug: "Isoniazid", back: "Prodrug activated by KatG → inhibits InhA (enoyl-ACP reductase) → blocks mycolic acid synthesis." },
  { drug: "Rifabutin", back: "Rifamycin — induces CYP3A; used in MAC and for TB in HIV patients." },
  { drug: "Pyrazinamide", back: "Prodrug activated by pyrazinamidase to pyrazinoic acid → disrupts membrane energetics (exact target uncertain)." },
  { drug: "Ethambutol", back: "Inhibits arabinosyltransferase (EmbB) → blocks arabinogalactan synthesis; bacteriostatic." },
  { drug: "Streptomycin", back: "Aminoglycoside — binds 30S → misreading; for TB (second-line)." },
  { drug: "Kanamycin", back: "Aminoglycoside — second-line TB." },
  { drug: "Amikacin", back: "Aminoglycoside — for MDR-TB and gram-negatives." },
  { drug: "Capreomycin", back: "Cyclic peptide — inhibits 30S; for MDR-TB." },
  { drug: "Ethionamide", back: "Inhibits InhA (similar to isoniazid) — second-line TB." },
  { drug: "Prothionamide", back: "Same as ethionamide." },
  { drug: "Para-aminosalicylic acid (PAS)", back: "Folate synthesis inhibitor (DHPS) — second-line TB." },
  { drug: "Terizidone", back: "Cycloserine derivative — inhibits D-alanine racemase; for MDR-TB." },
  { drug: "Cycloserine", back: "Inhibits D-alanine racemase and D-Ala-D-Ala ligase." },
  { drug: "Linezolid", back: "Oxazolidinone — also active against TB (second-line)." },
  { drug: "Clofazimine", back: "Binds DNA; also used in TB." },
  { drug: "Moxifloxacin", back: "Fluoroquinolone — active against TB; used in MDR regimens." },
  { drug: "Levofloxacin", back: "Fluoroquinolone — for TB and general infections." },
  { drug: "Gatifloxacin", back: "Fluoroquinolone — withdrawn in some countries due to dysglycaemia." },
  { drug: "Ofloxacin", back: "Fluoroquinolone — older agent for TB." },
  { drug: "Sparfloxacin", back: "Fluoroquinolone — photosensitivity risk." },
  { drug: "Gemifloxacin", back: "Fluoroquinolone — for respiratory infections." },
  { drug: "Delafloxacin", back: "Fluoroquinolone — broad-spectrum, including MRSA; anionic at pH." },
  { drug: "Nalidixic acid", back: "First quinolone — inhibits DNA gyrase; limited use." },
  { drug: "Clinafloxacin", back: "Fluoroquinolone — broad but toxic; not used." },
  { drug: "Temafloxacin", back: "Withdrawn due to haemolytic uraemic syndrome." },
  { drug: "Trovafloxacin", back: "Withdrawn due to hepatotoxicity." },
  { drug: "Garenoxacin", back: "Des-F(6)-quinolone — similar." },
  { drug: "Sitafloxacin", back: "Fluoroquinolone — used in Japan." },
  { drug: "Nemonoxacin", back: "Non-fluorinated quinolone — for CAP." },
  { drug: "Zabofloxacin", back: "Fluoroquinolone — under development." },
  { drug: "Finafloxacin", back: "pH-sensitive quinolone — for biofilm infections." },
  { drug: "Ozenoxacin", back: "Non-fluorinated quinolone — topical for impetigo." },
  { drug: "Metronidazole", back: "Nitroimidazole — already listed." },
  { drug: "Tinidazole", back: "Nitroimidazole — longer half-life than metronidazole." },
  { drug: "Ornidazole", back: "Nitroimidazole — similar." },
  { drug: "Secnidazole", back: "Nitroimidazole — single-dose for trichomoniasis." },
  { drug: "Nitazoxanide", back: "Inhibits pyruvate ferredoxin oxidoreductase (PFOR) — antiprotozoal, antiviral." },
  { drug: "Chloroquine", back: "Antimalarial — accumulates in parasite food vacuole, inhibits heme polymerase." },
  { drug: "Hydroxychloroquine", back: "Same mechanism; also immunomodulatory (TLR inhibition)." },
  { drug: "Quinine", back: "Blocks heme polymerisation; also Na⁺ channel blocker." },
  { drug: "Mefloquine", back: "Antimalarial — unknown mechanism; neuropsychiatric side effects." },
  { drug: "Primaquine", back: "8-aminoquinoline — causes oxidative damage to parasites; for hypnozoites (P. vivax)." },
  { drug: "Tafenoquine", back: "Long-acting primaquine analogue — single dose for radical cure." },
  { drug: "Artemisinin", back: "Endoperoxide — generates free radicals; kills blood-stage malaria." },
  { drug: "Artesunate", back: "Semi-synthetic artemisinin derivative — IV for severe malaria." },
  { drug: "Artemether", back: "Artemisinin derivative — used in combination (e.g., with lumefantrine)." },
  { drug: "Dihydroartemisinin", back: "Active metabolite of artemisinin derivatives." },
  { drug: "Lumefantrine", back: "Aryl amino alcohol — interferes with heme detoxification." },
  { drug: "Piperaquine", back: "Bisquinoline — similar to chloroquine; used in combination with dihydroartemisinin." },
  { drug: "Pyronaridine", back: "Mannich base antimalarial — heme binding." },
  { drug: "Atovaquone", back: "Inhibits parasite mitochondrial electron transport (cytochrome bc1)." },
  { drug: "Proguanil", back: "Inhibits DHFR (after conversion to cycloguanil)." },
  { drug: "Doxycycline", back: "Tetracycline — antimalarial (blood-stage)." },
  { drug: "Clindamycin", back: "Lincosamide — antimalarial adjunct." },
  { drug: "Sulfadoxine", back: "DHPS inhibitor — used with pyrimethamine." },
  { drug: "Pyrimethamine", back: "DHFR inhibitor — for toxoplasmosis and malaria." },
  { drug: "Sulfadiazine", back: "DHPS inhibitor — for toxoplasmosis." },
  { drug: "Trimetrexate", back: "DHFR inhibitor — for Pneumocystis (with leucovorin rescue)." },
  { drug: "Pafuramidine", back: "Prodrug for trypanosomiasis — inhibits protein synthesis? Not available." },
  { drug: "Pentamidine", back: "Binds DNA? — for Pneumocystis, leishmaniasis, trypanosomiasis." },
  { drug: "Suramin", back: "Inhibits various enzymes; for African trypanosomiasis (stage 1)." },
  { drug: "Melarsoprol", back: "Arsenical — binds trypanothione; for stage 2 HAT (CNS)." },
  { drug: "Eflornithine", back: "Ornithine decarboxylase inhibitor — for stage 2 T.b. gambiense." },
  { drug: "Nifurtimox", back: "Nitroheterocycle — generates radicals; for Chagas disease." },
  { drug: "Benznidazole", back: "Nitroimidazole — for Chagas disease." },
  { drug: "Miltefosine", back: "Alkylphosphocholine — disrupts cell membrane synthesis; for leishmaniasis." },
  { drug: "Paromomycin", back: "Aminoglycoside — topical and systemic for leishmaniasis, also intestinal amoebiasis." },
  { drug: "Stibogluconate", back: "Pentavalent antimonial — inhibits parasite glycolysis; for leishmaniasis." },
  { drug: "Amphotericin B", back: "Polyene — for visceral leishmaniasis." },
  { drug: "Ivermectin", back: "Activates glutamate-gated Cl⁻ channels in invertebrates; for onchocerciasis, strongyloidiasis, scabies." },
  { drug: "Albendazole", back: "Binds β-tubulin → inhibits microtubule polymerisation; broad-spectrum anthelmintic." },
  { drug: "Mebendazole", back: "Same as albendazole; less systemic absorption." },
  { drug: "Praziquantel", back: "Increases Ca²⁺ permeability in schistosomes → tetanic contraction and tegument damage." },
  { drug: "Niclosamide", back: "Inhibits oxidative phosphorylation; for tapeworms." },
  { drug: "Pyrantel pamoate", back: "Nicotinic agonist in parasites → spastic paralysis; for roundworms and hookworms." },
  { drug: "Piperazine", back: "GABA agonist in parasites → flaccid paralysis; for ascariasis." },
  { drug: "Diethylcarbamazine", back: "Unknown mechanism; for filariasis (Wolbachia?); also anti-inflammatory." },
  { drug: "Doxycycline", back: "Targets Wolbachia in filarial worms; adjunct for onchocerciasis and lymphatic filariasis." },
  { drug: "Rifampicin", back: "Used in some bacterial infections; also for leprosy." },
  { drug: "Clarithromycin", back: "Macrolide — for MAC, H. pylori, and other infections." },
  { drug: "Telithromycin", back: "Ketolide — for CAP; hepatotoxicity concerns." },
  { drug: "Fidaxomicin", back: "For C. difficile." },
  { drug: "Bezlotoxumab", back: "Monoclonal antibody against C. difficile toxin B — prevents recurrence." },
  { drug: "Oritavancin", back: "Lipoglycopeptide — single-dose for ABSSSI." },
  { drug: "Dalbavancin", back: "Lipoglycopeptide — two-dose regimen." },
  { drug: "Ceftobiprole", back: "Fifth-generation cephalosporin — for MRSA and Pseudomonas." },
  { drug: "Ceftaroline", back: "Fifth-generation — MRSA and gram-positives." },
  { drug: "Cefiderocol", back: "Siderophore cephalosporin — for carbapenem-resistant Acinetobacter, Pseudomonas, Enterobacteriaceae." },
  { drug: "Eravacycline", back: "Fluorocycline — for intra-abdominal infections." },
  { drug: "Omadacycline", back: "Aminomethylcycline — for CABP and ABSSSI." },
  { drug: "Lefamulin", back: "Pleuromutilin — for CABP." },
  { drug: "Solithromycin", back: "Fluoroketolide — for CABP." },
  { drug: "Gepotidacin", back: "Novel triazaacenaphthylene — inhibits DNA gyrase and topo IV (different binding); for uncomplicated UTI." },
  { drug: "Zoliflodacin", back: "Novel spiropyrimidinetrione — inhibits DNA gyrase; for gonorrhoea." },
  { drug: "Lascufloxacin", back: "Fluoroquinolone — used in Japan." },
  { drug: "Nemonoxacin", back: "Non-fluorinated quinolone — for CAP." }

];

const classificationData = [
  { drug: "Methotrexate", back: "Antimetabolite — DHFR inhibitor; disease-modifying antirheumatic drug (DMARD), immunosuppressant" },
  { drug: "Omeprazole", back: "Proton pump inhibitor (PPI) — benzimidazole class, gastric acid suppressant" },
  { drug: "Atenolol", back: "Cardioselective β₁ blocker — antihypertensive, antianginal, class II antiarrhythmic" },
  { drug: "Lisinopril", back: "ACE inhibitor — antihypertensive, heart failure, post-MI; non-prodrug" },
  { drug: "Metformin", back: "Biguanide — first-line oral antidiabetic, insulin sensitiser" },
  { drug: "Warfarin", back: "Vitamin K antagonist — oral anticoagulant (coumarin derivative)" },
  { drug: "Simvastatin", back: "Statin — HMG-CoA reductase inhibitor, lipid-lowering agent" },
  { drug: "Furosemide", back: "Loop diuretic — sulfonamide-derived NKCC2 inhibitor, potent diuresis" },
  { drug: "Ciprofloxacin", back: "Second-generation fluoroquinolone — broad-spectrum bactericidal (gram-negative + atypicals)" },
  { drug: "Salbutamol", back: "SABA (short-acting β₂ agonist) — rescue bronchodilator in asthma/COPD" },
  { drug: "Morphine", back: "Opioid analgesic — full μ-opioid receptor agonist, Schedule II" },
  { drug: "Amoxicillin", back: "Aminopenicillin — β-lactam antibiotic, inhibits cell wall synthesis" },
  { drug: "Aspirin", back: "NSAID (non-selective COX inhibitor) — low-dose antiplatelet; analgesic/antipyretic/anti-inflammatory at higher doses" },
  { drug: "Digoxin", back: "Cardiac glycoside — Na⁺/K⁺-ATPase inhibitor, positive inotrope, rate control in AF" },
  { drug: "Heparin", back: "Anticoagulant — indirect thrombin and factor Xa inhibitor via antithrombin III (unfractionated or LMWH)" },
  { drug: "Amlodipine", back: "Dihydropyridine CCB — vascular-selective, once-daily antihypertensive/antianginal" },
  { drug: "Metoprolol", back: "Cardioselective β₁ blocker — antihypertensive, antianginal, heart failure, rate control" },
  { drug: "Spironolactone", back: "K⁺-sparing diuretic — aldosterone (mineralocorticoid) receptor antagonist" },
  { drug: "Clopidogrel", back: "P2Y₁₂ ADP receptor inhibitor — thienopyridine prodrug, irreversible antiplatelet" },
  { drug: "Vancomycin", back: "Glycopeptide antibiotic — cell wall synthesis inhibitor, MRSA and C. difficile (oral)" },
  { drug: "Rifampicin", back: "Rifamycin antitubercular — RNA polymerase inhibitor, potent CYP450 inducer" },
  { drug: "Paracetamol", back: "Non-opioid analgesic/antipyretic — central COX inhibition; not an NSAID" },
  { drug: "Ibuprofen", back: "Non-selective NSAID — reversible COX-1/COX-2 inhibitor, analgesic/anti-inflammatory" },
  { drug: "Ondansetron", back: "Antiemetic — selective 5-HT₃ receptor antagonist" },
  { drug: "Ramipril", back: "ACE inhibitor (prodrug → ramiprilat) — cardioprotective post-MI, heart failure, nephroprotective" },
  { drug: "Losartan", back: "ARB (angiotensin receptor blocker, AT₁) — antihypertensive, diabetic nephropathy" },
  { drug: "Enalapril", back: "ACE inhibitor (prodrug → enalaprilat) — antihypertensive, heart failure" },
  { drug: "Candesartan", back: "ARB — insurmountable AT₁ antagonist, once-daily antihypertensive" },
  { drug: "Propranolol", back: "Non-selective β₁/β₂ blocker — antihypertensive, antianginal, migraine prophylaxis, class II antiarrhythmic" },
  { drug: "Carvedilol", back: "Non-selective β-blocker + α₁ blocker — heart failure, hypertension" },
  { drug: "Bisoprolol", back: "Highly cardioselective β₁ blocker — hypertension, chronic heart failure" },
  { drug: "Diltiazem", back: "Non-dihydropyridine CCB — rate-controlling antiarrhythmic, antianginal, antihypertensive" },
  { drug: "Verapamil", back: "Non-dihydropyridine CCB — strongest cardiac effects (SA/AV node), antiarrhythmic (class IV)" },
  { drug: "Hydrochlorothiazide", back: "Thiazide diuretic — NCC inhibitor in distal convoluted tubule, first-line hypertension" },
  { drug: "Indapamide", back: "Thiazide-like diuretic — NCC inhibitor with vasodilatory properties" },
  { drug: "Atorvastatin", back: "Statin — high-intensity HMG-CoA reductase inhibitor, LDL-C lowering" },
  { drug: "Rosuvastatin", back: "Statin — most potent statin, high liver selectivity, LDL reduction" },
  { drug: "Ezetimibe", back: "Cholesterol absorption inhibitor — NPC1L1 transporter blocker in small intestine" },
  { drug: "Glibenclamide", back: "Sulphonylurea (second-generation) — insulin secretagogue, K_ATP channel blocker" },
  { drug: "Glipizide", back: "Sulphonylurea — shorter-acting insulin secretagogue, lower hypoglycaemia risk" },
  { drug: "Pioglitazone", back: "Thiazolidinedione (TZD) — PPARγ agonist, insulin sensitiser" },
  { drug: "Sitagliptin", back: "DPP-4 inhibitor — incretin enhancer, glucose-dependent insulin secretion" },
  { drug: "Empagliflozin", back: "SGLT2 inhibitor — sodium-glucose cotransporter-2 blocker, antidiabetic, cardiorenal protection" },
  { drug: "Liraglutide", back: "GLP-1 receptor agonist — incretin mimetic, weight loss, cardioprotective" },
  { drug: "Phenytoin", back: "Antiepileptic — hydantoin, voltage-gated Na⁺ channel blocker (inactive state)" },
  { drug: "Carbamazepine", back: "Antiepileptic — iminostilbene, Na⁺ channel blocker; also trigeminal neuralgia, bipolar" },
  { drug: "Valproate", back: "Antiepileptic — broad-spectrum (Na⁺, T-type Ca²⁺, GABA); also mood stabiliser, migraine" },
  { drug: "Levetiracetam", back: "Antiepileptic — SV2A ligand, unique mechanism; broad-spectrum" },
  { drug: "Phenobarbitone", back: "Barbiturate antiepileptic — GABA-A positive allosteric modulator (prolongs Cl⁻ channel opening)" },
  { drug: "Diazepam", back: "Benzodiazepine — GABA-A positive modulator; anxiolytic, muscle relaxant, anticonvulsant" },
  { drug: "Lorazepam", back: "Benzodiazepine — intermediate-acting, first-line status epilepticus, anxiolytic" },
  { drug: "Clonazepam", back: "Benzodiazepine — long-acting, myoclonic/absence seizures, panic disorder" },
  { drug: "Haloperidol", back: "Typical antipsychotic — butyrophenone, potent D₂ antagonist" },
  { drug: "Risperidone", back: "Atypical antipsychotic — D₂/5-HT₂A antagonist, lower EPS than typicals" },
  { drug: "Olanzapine", back: "Atypical antipsychotic — D₂/5-HT₂A/H₁/M₁/α₁ antagonist; high metabolic risk" },
  { drug: "Clozapine", back: "Atypical antipsychotic — D₄-selective; treatment-resistant schizophrenia, agranulocytosis risk" },
  { drug: "Fluoxetine", back: "SSRI — selective serotonin reuptake inhibitor, long half-life" },
  { drug: "Sertraline", back: "SSRI — first-line for depression, OCD, PTSD, anxiety" },
  { drug: "Amitriptyline", back: "Tricyclic antidepressant (TCA) — SERT/NET inhibitor, also antihistaminergic/anticholinergic" },
  { drug: "Venlafaxine", back: "SNRI — serotonin-norepinephrine reuptake inhibitor, dose-dependent NET effect" },
  { drug: "Lithium", back: "Mood stabiliser — inositol depletion, GSK-3β modulation; gold standard for bipolar" },
  { drug: "Donepezil", back: "AChE inhibitor (reversible) — piperidine derivative, Alzheimer's dementia" },
  { drug: "Memantine", back: "NMDA receptor antagonist (non-competitive) — moderate-severe Alzheimer's" },
  { drug: "Levodopa", back: "Dopamine precursor — gold standard for Parkinson's, combined with carbidopa" },
  { drug: "Pramipexole", back: "Non-ergot dopamine agonist (D₂/D₃) — Parkinson's, restless legs syndrome" },
  { drug: "Selegiline", back: "MAO-B inhibitor (selective at low doses) — adjunct in Parkinson's" },
  { drug: "Amoxicillin-Clavulanate", back: "Combination antibiotic — amoxicillin (β-lactam) + clavulanate (β-lactamase inhibitor)" },
  { drug: "Piperacillin-Tazobactam", back: "Antipseudomonal penicillin + β-lactamase inhibitor — broad-spectrum, including ESBL" },
  { drug: "Meropenem", back: "Carbapenem antibiotic — ultra-broad spectrum, stable to most β-lactamases" },
  { drug: "Azithromycin", back: "Macrolide antibiotic — 50S ribosomal inhibitor, long half-life, anti-inflammatory effects" },
  { drug: "Erythromycin", back: "Macrolide antibiotic — also motilin agonist (prokinetic)" },
  { drug: "Doxycycline", back: "Tetracycline antibiotic — 30S ribosomal inhibitor, also antimalarial, anti-inflammatory" },
  { drug: "Clindamycin", back: "Lincosamide antibiotic — 50S inhibitor, anaerobic coverage, C. difficile risk" },
  { drug: "Gentamicin", back: "Aminoglycoside antibiotic — 30S misreading, gram-negative coverage, nephrotoxic/ototoxic" },
  { drug: "Trimethoprim", back: "DHFR inhibitor (bacterial) — bacteriostatic, often combined with sulfamethoxazole" },
  { drug: "Co-trimoxazole", back: "Combination antibiotic — trimethoprim + sulfamethoxazole (sequential folate blockade)" },
  { drug: "Metronidazole", back: "Nitroimidazole antibiotic/antiprotozoal — anaerobic bacteria, C. difficile, Giardia, Trichomonas" },
  { drug: "Fluconazole", back: "Triazole antifungal — inhibits CYP51 (lanosterol 14α-demethylase), systemic and topical" },
  { drug: "Amphotericin B", back: "Polyene antifungal — binds ergosterol, broad-spectrum, gold standard for severe systemic mycoses" },
  { drug: "Acyclovir", back: "Nucleoside analogue antiviral — HSV/VZV DNA polymerase inhibitor, requires viral thymidine kinase" },
  { drug: "Oseltamivir", back: "Neuraminidase inhibitor — influenza A and B, early treatment or prophylaxis" },
  { drug: "Zidovudine (AZT)", back: "NRTI (nucleoside reverse transcriptase inhibitor) — HIV, first antiretroviral" },
  { drug: "Tenofovir", back: "Nucleotide analogue RT inhibitor (NtRTI) — HIV and HBV, backbone of ART" },
  { drug: "Efavirenz", back: "NNRTI (non-nucleoside RT inhibitor) — HIV, once-daily, CNS side effects" },
  { drug: "Lopinavir", back: "HIV protease inhibitor — combined with ritonavir (booster), second-line ART" },
  { drug: "Dexamethasone", back: "Glucocorticoid — potent synthetic, anti-inflammatory, immunosuppressant" },
  { drug: "Prednisolone", back: "Glucocorticoid — active metabolite of prednisone, wide use in inflammation/autoimmunity" },
  { drug: "Fludrocortisone", back: "Mineralocorticoid — synthetic, sodium retention, used in adrenal insufficiency" },
  { drug: "Azathioprine", back: "Purine synthesis inhibitor — prodrug to 6-MP, immunosuppressant (transplant, autoimmune)" },
  { drug: "Cyclosporin", back: "Calcineurin inhibitor — immunosuppressant (transplant, autoimmune)" },
  { drug: "Tacrolimus", back: "Calcineurin inhibitor — more potent than cyclosporin, transplant rejection" },
  { drug: "Mycophenolate", back: "IMPDH inhibitor — selective lymphocyte proliferation block, transplant/autoimmune" },
  { drug: "Infliximab", back: "Anti-TNFα monoclonal antibody (chimeric) — TNF inhibitor for rheumatoid arthritis, IBD, etc." },
  { drug: "Adalimumab", back: "Anti-TNFα monoclonal antibody (fully human) — same as infliximab, subcutaneous" },
  { drug: "Rituximab", back: "Anti-CD20 monoclonal antibody — B-cell depletion, haematological malignancies, autoimmune" },
  { drug: "Trastuzumab", back: "Anti-HER2 monoclonal antibody — HER2-positive breast/gastric cancer" },
  { drug: "Imatinib", back: "Tyrosine kinase inhibitor (BCR-ABL, c-KIT, PDGFR) — CML, GIST" },
  { drug: "Cyclophosphamide", back: "Alkylating agent (nitrogen mustard) — DNA crosslinker, broad anticancer, immunosuppressant" },
  { drug: "Cisplatin", back: "Platinum alkylating-like agent — DNA crosslinks, testicular/ovarian/head & neck cancers" },
  { drug: "Doxorubicin", back: "Anthracycline — topoisomerase II inhibitor, intercalator; broad anticancer, cardiotoxic" },
  { drug: "Tamoxifen", back: "SERM (selective oestrogen receptor modulator) — ER+ breast cancer" },
  { drug: "Anastrozole", back: "Aromatase inhibitor (non-steroidal) — postmenopausal ER+ breast cancer" },
  { drug: "Allopurinol", back: "Xanthine oxidase inhibitor — gout, hyperuricaemia, tumour lysis syndrome" },
  { drug: "Colchicine", back: "Microtubule inhibitor — gout, familial Mediterranean fever, pericarditis" },
  { drug: "Omalizumab", back: "Anti-IgE monoclonal antibody — severe allergic asthma, chronic urticaria" },
  { drug: "Montelukast", back: "Leukotriene receptor antagonist (CysLT₁) — asthma, allergic rhinitis" },
  { drug: "Theophylline", back: "Methylxanthine — non-selective PDE inhibitor, bronchodilator, weak adenosine antagonist" },
  { drug: "Ipratropium", back: "Short-acting muscarinic antagonist (SAMA) — bronchodilator, COPD/asthma" },
  { drug: "Tiotropium", back: "Long-acting muscarinic antagonist (LAMA) — once-daily bronchodilator for COPD" },
  { drug: "Acetazolamide", back: "Carbonic anhydrase inhibitor — diuretic, glaucoma, altitude sickness, epilepsy" },
  { drug: "Mannitol", back: "Osmotic diuretic — reduces intracranial pressure, promotes diuresis" },
  { drug: "Amiloride", back: "K⁺-sparing diuretic — ENaC blocker in collecting duct" },
  { drug: "Triamterene", back: "K⁺-sparing diuretic — ENaC blocker, same as amiloride" },
  { drug: "Chlorthalidone", back: "Thiazide-like diuretic — long-acting, first-line hypertension" },
  { drug: "Metolazone", back: "Thiazide-like diuretic — synergistic with loop diuretics in resistant oedema" },
  { drug: "Torasemide", back: "Loop diuretic — longer half-life than furosemide" },
  { drug: "Bumetanide", back: "Loop diuretic — more potent than furosemide, better oral absorption" },
  { drug: "Dabigatran", back: "Direct thrombin inhibitor (DTI) — oral anticoagulant, prodrug" },
  { drug: "Rivaroxaban", back: "Direct factor Xa inhibitor — oral anticoagulant, once-daily" },
  { drug: "Apixaban", back: "Direct factor Xa inhibitor — twice-daily, lower bleeding risk" },
  { drug: "Edoxaban", back: "Direct factor Xa inhibitor — once-daily, used after initial parenteral anticoagulation" },
  { drug: "Enoxaparin", back: "Low molecular weight heparin (LMWH) — anti-Xa > anti-IIa, subcutaneous" },
  { drug: "Fondaparinux", back: "Synthetic pentasaccharide — selective factor Xa inhibitor via antithrombin" },
  { drug: "Bivalirudin", back: "Bivalent direct thrombin inhibitor — IV, used in PCI" },
  { drug: "Argatroban", back: "Univalent direct thrombin inhibitor — IV, for HIT" },
  { drug: "Ticagrelor", back: "Reversible P2Y₁₂ inhibitor — antiplatelet, ACS, once/twice-daily" },
  { drug: "Prasugrel", back: "Irreversible P2Y₁₂ inhibitor — more potent than clopidogrel, higher bleeding risk" },
  { drug: "Ticlopidine", back: "Irreversible P2Y₁₂ inhibitor — older, neutropenia risk, largely replaced" },
  { drug: "Dipyridamole", back: "PDE inhibitor + adenosine reuptake inhibitor — antiplatelet, vasodilator" },
  { drug: "Cilostazol", back: "PDE3 inhibitor — antiplatelet, vasodilator, intermittent claudication" },
  { drug: "Streptokinase", back: "Thrombolytic (fibrinolytic) — plasminogen activator, non-fibrin selective" },
  { drug: "Alteplase", back: "Thrombolytic (tPA) — fibrin-selective, acute ischaemic stroke/MI/PE" },
  { drug: "Tenecteplase", back: "Thrombolytic (modified tPA) — longer half-life, bolus dosing" },
  { drug: "Reteplase", back: "Thrombolytic (recombinant tPA derivative) — double-bolus, MI" },
  { drug: "Tranexamic acid", back: "Antifibrinolytic — lysine analogue, inhibits plasminogen activation" },
  { drug: "Aminocaproic acid", back: "Antifibrinolytic — lysine analogue, same as tranexamic acid" },
  { drug: "Protamine sulfate", back: "Heparin antidote — positively charged protein, binds heparin" },
  { drug: "Vitamin K", back: "Coagulation factor synthesis cofactor — antidote for warfarin" },
  { drug: "Phytonadione", back: "Vitamin K1 — specific antidote for vitamin K antagonist" },
  { drug: "Idarucizumab", back: "Dabigatran antidote — monoclonal antibody fragment" },
  { drug: "Andexanet alfa", back: "Factor Xa inhibitor antidote — recombinant modified factor Xa decoy" },
  { drug: "Naloxone", back: "Opioid antagonist (μ > κ, δ) — rapid reversal of opioid overdose" },
  { drug: "Naltrexone", back: "Opioid antagonist (long-acting) — alcohol/opioid dependence" },
  { drug: "Buprenorphine", back: "Partial μ-opioid agonist — opioid use disorder, pain" },
  { drug: "Methadone", back: "Long-acting μ-opioid agonist — opioid maintenance, chronic pain" },
  { drug: "Fentanyl", back: "Synthetic μ-opioid agonist — high potency, rapid onset, anaesthesia/pain" },
  { drug: "Oxycodone", back: "Semi-synthetic μ-opioid agonist — moderate-severe pain, oral" },
  { drug: "Hydromorphone", back: "Potent μ-opioid agonist — 5-7× morphine, parenteral/oral" },
  { drug: "Tramadol", back: "Atypical opioid — weak μ agonist + SNRI, less respiratory depression" },
  { drug: "Tapentadol", back: "Atypical opioid — μ agonist + NET inhibitor, dual mechanism" },
  { drug: "Codeine", back: "Prodrug opioid (→morphine) — mild to moderate pain, antitussive" },
  { drug: "Dihydrocodeine", back: "Semi-synthetic opioid — similar to codeine, more potent" },
  { drug: "Meperidine", back: "μ-opioid agonist — neurotoxic metabolite; limited use" },
  { drug: "Loperamide", back: "Peripheral μ-opioid agonist — antidiarrhoeal, no CNS effects" },
  { drug: "Flumazenil", back: "Benzodiazepine antagonist — competitive, reverses sedation/overdose" },
  { drug: "Zolpidem", back: "Non-benzodiazepine hypnotic (Z-drug) — selective α₁ subunit agonist" },
  { drug: "Eszopiclone", back: "Non-benzodiazepine hypnotic — Z-drug, insomnia" },
  { drug: "Zaleplon", back: "Ultra-short acting Z-drug — sleep onset, minimal hangover" },
  { drug: "Ramelteon", back: "Melatonin receptor agonist (MT₁/MT₂) — sleep onset, non-scheduled" },
  { drug: "Suvorexant", back: "Dual orexin receptor antagonist — insomnia" },
  { drug: "Modafinil", back: "Wakefulness-promoting agent — narcolepsy, shift work disorder; weak DAT inhibitor" },
  { drug: "Methylphenidate", back: "CNS stimulant — DAT/NET inhibitor, ADHD, narcolepsy" },
  { drug: "Amphetamine", back: "CNS stimulant — releases dopamine/norepinephrine via reversal of transporters" },
  { drug: "Lisdexamfetamine", back: "Prodrug of dextroamphetamine — long-acting ADHD" },
  { drug: "Atomoxetine", back: "Selective NET inhibitor — non-stimulant ADHD" },
  { drug: "Guanfacine", back: "Central α₂A agonist — ADHD (non-stimulant), hypertension" },
  { drug: "Clonidine", back: "Central α₂ agonist — hypertension, ADHD, withdrawal symptoms" },
  { drug: "Dexmedetomidine", back: "Highly selective α₂ agonist — ICU sedation, minimal respiratory depression" },
  { drug: "Baclofen", back: "GABA-B agonist — muscle relaxant, spasticity" },
  { drug: "Tizanidine", back: "Central α₂ agonist — muscle relaxant, spasticity" },
  { drug: "Dantrolene", back: "Ryanodine receptor inhibitor (RyR1) — malignant hyperthermia, spasticity" },
  { drug: "Botulinum toxin", back: "SNARE protein cleaver — inhibits ACh release, focal spasticity, cosmetic" },
  { drug: "Neostigmine", back: "Reversible AChE inhibitor — myasthenia gravis, reversal of neuromuscular block" },
  { drug: "Pyridostigmine", back: "Reversible AChE inhibitor — longer-acting, myasthenia gravis" },
  { drug: "Edrophonium", back: "Short-acting AChE inhibitor — diagnostic test (Tensilon) for myasthenia" },
  { drug: "Atropine", back: "Muscarinic antagonist (non-selective) — bradycardia, antispasmodic, antidote (organophosphates)" },
  { drug: "Glycopyrrolate", back: "Quaternary antimuscarinic — reduces secretions, pre-anaesthesia" },
  { drug: "Scopolamine", back: "Antimuscarinic (CNS-active) — motion sickness, post-op nausea" },
  { drug: "Aclidinium", back: "LAMA (long-acting muscarinic antagonist) — COPD bronchodilator" },
  { drug: "Umeclidinium", back: "LAMA — once-daily COPD, combination with vilanterol" },
  { drug: "Pilocarpine", back: "Muscarinic agonist — glaucoma, xerostomia (Sjögren's, radiation)" },
  { drug: "Cevimeline", back: "Muscarinic agonist (M₁/M₃) — xerostomia in Sjögren's" },
  { drug: "Bethanechol", back: "Muscarinic agonist — urinary retention, neurogenic bladder" },
  { drug: "Carbachol", back: "Muscarinic + nicotinic agonist — glaucoma (miotic)" },
  { drug: "Physostigmine", back: "Reversible AChE inhibitor (crosses BBB) — anticholinergic toxicity antidote" },
  { drug: "Pralidoxime", back: "Oxime — reactivates AChE inhibited by organophosphates" },
  { drug: "Epinephrine", back: "Non-selective α/β agonist — anaphylaxis, cardiac arrest, vasoconstrictor" },
  { drug: "Norepinephrine", back: "α₁ > β₁ agonist — vasopressor in septic shock" },
  { drug: "Dopamine", back: "Catecholamine — dose-dependent D₁/β₁/α₁ agonist; shock, heart failure" },
  { drug: "Dobutamine", back: "β₁-selective inotrope — acute heart failure, cardiac stress test" },
  { drug: "Isoproterenol", back: "Non-selective β agonist — bradycardia, heart block (rarely used)" },
  { drug: "Phenylephrine", back: "Selective α₁ agonist — decongestant, hypotension (e.g., spinal anaesthesia)" },
  { drug: "Midodrine", back: "Prodrug α₁ agonist — orthostatic hypotension" },
  { drug: "Methyldopa", back: "Central α₂ agonist — hypertension in pregnancy" },
  { drug: "Prazosin", back: "α₁ antagonist — hypertension, PTSD nightmares" },
  { drug: "Doxazosin", back: "Long-acting α₁ antagonist — hypertension, BPH" },
  { drug: "Terazosin", back: "α₁ antagonist — hypertension, BPH" },
  { drug: "Tamsulosin", back: "Selective α₁A/α₁D antagonist — BPH, urinary retention" },
  { drug: "Alfuzosin", back: "α₁ antagonist — BPH, minimal cardiac effect" },
  { drug: "Silodosin", back: "Highly selective α₁A antagonist — BPH, retrograde ejaculation common" },
  { drug: "Phentolamine", back: "Non-selective α blocker — pheochromocytoma crisis" },
  { drug: "Phenoxybenzamine", back: "Irreversible α blocker — preoperative pheochromocytoma" },
  { drug: "Yohimbine", back: "α₂ antagonist — erectile dysfunction (rare)" },
  { drug: "Labetalol", back: "Non-selective β + α₁ blocker — hypertension, hypertensive emergency" },
  { drug: "Nebivolol", back: "β₁-selective blocker + NO-mediated vasodilation — hypertension, heart failure" },
  { drug: "Betaxolol", back: "β₁-selective blocker — hypertension, also topical for glaucoma" },
  { drug: "Carteolol", back: "Non-selective β blocker with ISA — glaucoma (topical), hypertension" },
  { drug: "Pindolol", back: "Non-selective β blocker with ISA — hypertension, less bradycardia" },
  { drug: "Acebutolol", back: "β₁-selective blocker with ISA — hypertension, arrhythmias" },
  { drug: "Esmolol", back: "Ultra-short-acting β₁ blocker — acute arrhythmias, IV only" },
  { drug: "Sotalol", back: "Non-selective β blocker + class III antiarrhythmic (K⁺ channel blocker)" },
  { drug: "Amiodarone", back: "Class III antiarrhythmic — multichannel blocker (K⁺, Na⁺, Ca²⁺, β), iodine-rich" },
  { drug: "Dronedarone", back: "Amiodarone analogue — multichannel blocker, no iodine, less toxicity" },
  { drug: "Procainamide", back: "Class Ia antiarrhythmic — Na⁺ (intermediate) + K⁺ blockade" },
  { drug: "Quinidine", back: "Class Ia antiarrhythmic — also antimalarial (Cinchona alkaloid)" },
  { drug: "Disopyramide", back: "Class Ia — Na⁺ blocker, negative inotrope, hypertrophic cardiomyopathy" },
  { drug: "Lidocaine", back: "Class Ib antiarrhythmic — ventricular arrhythmias, also local anaesthetic" },
  { drug: "Mexiletine", back: "Oral Class Ib — ventricular arrhythmias, myotonia" },
  { drug: "Flecainide", back: "Class Ic antiarrhythmic — atrial fibrillation (no structural disease)" },
  { drug: "Propafenone", back: "Class Ic + weak β-blocker — atrial fibrillation, SVT" },
  { drug: "Adenosine", back: "A₁ receptor agonist — AV nodal blocker, terminates SVT" },
  { drug: "Ivabradine", back: "I_f channel blocker (HCN) — pure heart rate reduction, chronic heart failure" },
  { drug: "Ranolazine", back: "Late Na⁺ current inhibitor — antianginal, antiarrhythmic" },
  { drug: "Hydralazine", back: "Direct arterial vasodilator — hypertension, heart failure (with nitrates)" },
  { drug: "Minoxidil", back: "K_ATP opener — severe hypertension, also topical for alopecia" },
  { drug: "Sodium nitroprusside", back: "Nitric oxide donor — rapid arterial+venous vasodilator, hypertensive emergency" },
  { drug: "Nitroglycerin", back: "Organic nitrate — venodilator > arterial, angina, heart failure" },
  { drug: "Isosorbide mononitrate", back: "Long-acting nitrate — angina prophylaxis" },
  { drug: "Isosorbide dinitrate", back: "Prodrug nitrate — angina, heart failure" },
  { drug: "Nicorandil", back: "K_ATP opener + nitrate — antianginal" },
  { drug: "Fenoldopam", back: "D₁ receptor agonist — hypertensive emergency, renal vasodilation" },
  { drug: "Epoprostenol", back: "Prostacyclin (PGI₂) analogue — pulmonary arterial hypertension (PAH)" },
  { drug: "Treprostinil", back: "PGI₂ analogue — PAH (subcutaneous, IV, inhaled, oral)" },
  { drug: "Iloprost", back: "PGI₂ analogue — inhaled PAH" },
  { drug: "Selexipag", back: "Selective IP receptor agonist — oral PAH" },
  { drug: "Bosentan", back: "Dual endothelin receptor antagonist — PAH" },
  { drug: "Ambrisentan", back: "Selective ETA antagonist — PAH, less hepatotoxicity" },
  { drug: "Macitentan", back: "Dual endothelin antagonist — PAH, tissue-targeting" },
  { drug: "Riociguat", back: "sGC stimulator (NO-independent) — PAH, CTEPH" },
  { drug: "Sildenafil", back: "PDE5 inhibitor — PAH, erectile dysfunction" },
  { drug: "Tadalafil", back: "Long-acting PDE5 inhibitor — PAH, erectile dysfunction, BPH" },
  { drug: "Vardenafil", back: "PDE5 inhibitor — erectile dysfunction" },
  { drug: "Alprostadil", back: "PGE₁ analogue — erectile dysfunction (intracavernosal), maintain ductus arteriosus" },
  { drug: "Methylergonovine", back: "Ergot alkaloid — postpartum haemorrhage (uterotonic)" },
  { drug: "Ergotamine", back: "5-HT₁B/₁D agonist + α blocker — acute migraine (less used)" },
  { drug: "Dihydroergotamine", back: "5-HT₁B/₁D agonist — migraine (nasal/injection)" },
  { drug: "Sumatriptan", back: "Triptan (5-HT₁B/₁D agonist) — acute migraine" },
  { drug: "Rizatriptan", back: "Triptan — oral, fast-acting migraine" },
  { drug: "Eletriptan", back: "Triptan — migraine" },
  { drug: "Zolmitriptan", back: "Triptan — oral/nasal, migraine" },
  { drug: "Naratriptan", back: "Triptan — longer half-life, slower onset" },
  { drug: "Frovatriptan", back: "Long-acting triptan — menstrual migraine" },
  { drug: "Lasmiditan", back: "5-HT₁F agonist (non-triptan) — acute migraine, no vasoconstriction" },
  { drug: "Ubrogepant", back: "CGRP receptor antagonist (small molecule) — acute migraine" },
  { drug: "Rimegepant", back: "CGRP antagonist — acute and preventive migraine" },
  { drug: "Erenumab", back: "Anti-CGRP receptor monoclonal antibody — migraine prevention" },
  { drug: "Galcanezumab", back: "Anti-CGRP antibody — migraine prevention" },
  { drug: "Fremanezumab", back: "Anti-CGRP antibody — migraine prevention" },
  { drug: "Topiramate", back: "Antiepileptic — Na⁺ channel, GABA potentiation, AMPA antagonism; migraine prophylaxis" },
  { drug: "OnabotulinumtoxinA", back: "Botulinum toxin type A — chronic migraine, spasticity, cosmetic" },
  { drug: "Phenelzine", back: "MAOI (non-selective, irreversible) — atypical depression" },
  { drug: "Tranylcypromine", back: "Non-selective MAOI — depression, stimulant properties" },
  { drug: "Isocarboxazid", back: "Non-selective MAOI — depression (rare)" },
  { drug: "Moclobemide", back: "Reversible MAO-A inhibitor — depression, fewer dietary restrictions" },
  { drug: "Rasagiline", back: "Selective MAO-B inhibitor — Parkinson's disease" },
  { drug: "Bupropion", back: "NDRI (norepinephrine-dopamine reuptake inhibitor) — depression, smoking cessation" },
  { drug: "Mirtazapine", back: "NaSSA (noradrenergic and specific serotonergic antidepressant) — α₂ antagonist + 5-HT₂/5-HT₃ block" },
  { drug: "Trazodone", back: "SARI (serotonin antagonist and reuptake inhibitor) — depression, insomnia" },
  { drug: "Vortioxetine", back: "Multimodal antidepressant — SERT inhibitor + 5-HT₁A agonist + 5-HT₃ antagonist" },
  { drug: "Vilazodone", back: "SERT inhibitor + 5-HT₁A partial agonist — depression" },
  { drug: "Desvenlafaxine", back: "SNRI — active metabolite of venlafaxine" },
  { drug: "Duloxetine", back: "SNRI — depression, neuropathic pain, stress incontinence" },
  { drug: "Levomilnacipran", back: "SNRI (higher NET:SERT) — depression" },
  { drug: "Milnacipran", back: "SNRI — fibromyalgia (US), not depression" },
  { drug: "Nefazodone", back: "SARI — depression, hepatotoxicity risk" },
  { drug: "Agomelatine", back: "Melatonin agonist + 5-HT₂C antagonist — depression, circadian rhythms" },
  { drug: "Esketamine", back: "NMDA antagonist — intranasal, treatment-resistant depression" },
  { drug: "Ketamine", back: "NMDA antagonist — dissociative anaesthetic, rapid antidepressant (off-label)" },
  { drug: "Oxcarbazepine", back: "Antiepileptic (Na⁺ channel blocker) — bipolar disorder, trigeminal neuralgia" },
  { drug: "Lamotrigine", back: "Antiepileptic (Na⁺ channel blocker) — bipolar depression maintenance" },
  { drug: "Gabapentin", back: "Gabapentinoid (α₂δ ligand) — neuropathic pain, epilepsy, anxiety" },
  { drug: "Pregabalin", back: "Gabapentinoid — neuropathic pain, fibromyalgia, generalised anxiety" },
  { drug: "Lacosamide", back: "Antiepileptic (Na⁺ channel slow inactivation) — focal seizures" },
  { drug: "Rufinamide", back: "Antiepileptic (Na⁺ channel) — Lennox-Gastaut syndrome" },
  { drug: "Eslicarbazepine", back: "Antiepileptic (Na⁺ channel) — once-daily, focal seizures" },
  { drug: "Perampanel", back: "AMPA receptor antagonist — antiepileptic (focal, generalised)" },
  { drug: "Brivaracetam", back: "SV2A ligand (high affinity) — antiepileptic" },
  { drug: "Cannabidiol (CBD)", back: "GPR55/TRPV1 modulator — Dravet, Lennox-Gastaut syndromes" },
  { drug: "Felbamate", back: "Antiepileptic (multimodal) — severe adverse effects, reserved" },
  { drug: "Vigabatrin", back: "GABA-T inhibitor — infantile spasms, visual field defect risk" },
  { drug: "Tiagabine", back: "GABA reuptake inhibitor (GAT-1) — adjunctive epilepsy" },
  { drug: "Zonisamide", back: "Antiepileptic (Na⁺/T-type Ca²⁺, carbonic anhydrase) — focal seizures" },
  { drug: "Ethosuximide", back: "T-type Ca²⁺ channel blocker — absence seizures (first-line)" },
  { drug: "Trimethadione", back: "T-type Ca²⁺ blocker — older, replaced by ethosuximide" },
  { drug: "Primidone", back: "Barbiturate antiepileptic — metabolised to phenobarbital" },
  { drug: "Mephenytoin", back: "Hydantoin — similar to phenytoin, rarely used" },
  { drug: "Fosphenytoin", back: "Water-soluble phenytoin prodrug — IV/IM for status epilepticus" },
  { drug: "Cenobamate", back: "Antiepileptic (Na⁺ channel + GABA-A) — refractory focal seizures" },
  { drug: "Apomorphine", back: "Dopamine agonist (D₁/D₂) — Parkinson's 'off' episodes (subcutaneous)" },
  { drug: "Rotigotine", back: "Transdermal dopamine agonist (D₃ > D₂/D₁) — Parkinson's, RLS" },
  { drug: "Ropinirole", back: "D₂/D₃ agonist — Parkinson's, RLS" },
  { drug: "Piribedil", back: "D₂/D₃ agonist — Parkinson's (Europe)" },
  { drug: "Entacapone", back: "Peripheral COMT inhibitor — levodopa adjunct, extends 'on' time" },
  { drug: "Tolcapone", back: "Central+peripheral COMT inhibitor — more effective but hepatotoxic, reserved" },
  { drug: "Opicapone", back: "Peripheral COMT inhibitor — once-daily, similar to entacapone" },
  { drug: "Amantadine", back: "NMDA antagonist (weak) + anticholinergic? — Parkinson's, dyskinesia" },
  { drug: "Benztropine", back: "Central anticholinergic — drug-induced EPS, Parkinson's tremor" },
  { drug: "Trihexyphenidyl", back: "Central anticholinergic — Parkinson's, EPS" },
  { drug: "Procyclidine", back: "Anticholinergic — Parkinson's, EPS" },
  { drug: "Biperiden", back: "Anticholinergic — Parkinson's, EPS" },
  { drug: "Orphenadrine", back: "Anticholinergic + NMDA antagonist? — muscle relaxant" },
  { drug: "Rivastigmine", back: "AChE + BuChE inhibitor (pseudo-irreversible) — Alzheimer's, Parkinson's dementia" },
  { drug: "Galantamine", back: "AChE inhibitor + nicotinic modulator — Alzheimer's" },
  { drug: "Tacrine", back: "First AChE inhibitor — hepatotoxic, discontinued" },
  { drug: "Clobazam", back: "1,5-benzodiazepine — Lennox-Gastaut syndrome, anxiety" },
  { drug: "Nitrazepam", back: "Benzodiazepine hypnotic — anticonvulsant (rare)" },
  { drug: "Temazepam", back: "Benzodiazepine hypnotic — short-intermediate acting" },
  { drug: "Oxazepam", back: "Benzodiazepine (active metabolite) — anxiety, alcohol withdrawal" },
  { drug: "Alprazolam", back: "High-potency benzodiazepine — panic disorder, anxiety (high abuse potential)" },
  { drug: "Chlordiazepoxide", back: "Benzodiazepine — alcohol withdrawal (first benzodiazepine)" },
  { drug: "Midazolam", back: "Water-soluble benzodiazepine — sedation, anaesthesia, status epilepticus" },
  { drug: "Triazolam", back: "Short-acting benzodiazepine hypnotic" },
  { drug: "Estazolam", back: "Benzodiazepine hypnotic" },
  { drug: "Quazepam", back: "Long-acting benzodiazepine hypnotic" },
  { drug: "Flurazepam", back: "Long-acting benzodiazepine hypnotic" },
  { drug: "Buspirone", back: "5-HT₁A partial agonist — generalised anxiety, non-sedating" },
  { drug: "Hydroxyzine", back: "H₁ antihistamine — anxiety, urticaria, sedation" },
  { drug: "Prochlorperazine", back: "D₂ antagonist — antiemetic, antipsychotic" },
  { drug: "Promethazine", back: "First-generation H₁ antihistamine — antiemetic, sedation, allergy" },
  { drug: "Metoclopramide", back: "D₂ antagonist + 5-HT₄ agonist — prokinetic, antiemetic" },
  { drug: "Domperidone", back: "Peripheral D₂ antagonist — prokinetic, antiemetic (no CNS effects)" },
  { drug: "Cisapride", back: "5-HT₄ agonist — prokinetic (withdrawn due to QT prolongation)" },
  { drug: "Mosapride", back: "5-HT₄ agonist — prokinetic (Asia)" },
  { drug: "Tegaserod", back: "5-HT₄ agonist — IBS-C (restricted use)" },
  { drug: "Lubiprostone", back: "ClC-2 chloride channel activator — chronic constipation, IBS-C" },
  { drug: "Linaclotide", back: "GC-C agonist — chronic constipation, IBS-C" },
  { drug: "Plecanatide", back: "GC-C agonist — constipation, IBS-C" },
  { drug: "Alosetron", back: "5-HT₃ antagonist — severe IBS-D (restricted)" },
  { drug: "Ramosetron", back: "5-HT₃ antagonist — IBS-D (Asia)" },
  { drug: "Eluxadoline", back: "μ-opioid agonist + δ-antagonist — IBS-D" },
  { drug: "Rifaximin", back: "Non-absorbable rifamycin — IBS-D, hepatic encephalopathy, traveller's diarrhoea" },
  { drug: "Diphenoxylate", back: "Peripheral μ-opioid agonist (with atropine) — antidiarrhoeal" },
  { drug: "Bismuth subsalicylate", back: "Bismuth salt — antidiarrhoeal, H. pylori adjunct" },
  { drug: "Sucralfate", back: "Mucosal protectant — duodenal/gastric ulcer" },
  { drug: "Misoprostol", back: "PGE₁ analogue — ulcer prevention (NSAID-induced), labour induction" },
  { drug: "Carbenoxolone", back: "Glycyrrhetinic acid derivative — ulcer healing (not US)" },
  { drug: "Ranitidine", back: "H₂ receptor antagonist — acid reducer (withdrawn in many countries due to NDMA)" },
  { drug: "Famotidine", back: "H₂ receptor antagonist — acid reducer, OTC" },
  { drug: "Nizatidine", back: "H₂ antagonist — similar to famotidine" },
  { drug: "Cimetidine", back: "First H₂ antagonist — CYP450 inhibitor, drug interactions" },
  { drug: "Pantoprazole", back: "PPI — gastric acid suppression, less CYP2C19 interaction" },
  { drug: "Rabeprazole", back: "PPI — faster onset" },
  { drug: "Lansoprazole", back: "PPI — similar to omeprazole" },
  { drug: "Esomeprazole", back: "S-isomer of omeprazole — higher bioavailability" },
  { drug: "Dexlansoprazole", back: "Dual delayed-release PPI — once-daily" },
  { drug: "Sodium bicarbonate", back: "Systemic antacid — metabolic acidosis, urine alkalinisation" },
  { drug: "Calcium carbonate", back: "Antacid + calcium supplement" },
  { drug: "Magnesium hydroxide", back: "Antacid + osmotic laxative" },
  { drug: "Aluminium hydroxide", back: "Antacid, phosphate binder (causes constipation)" },
  { drug: "Simethicone", back: "Antiflatulent — reduces gas bubble surface tension" },
  { drug: "Ursodeoxycholic acid", back: "Bile acid — gallstone dissolution, cholestasis" },
  { drug: "Chenodeoxycholic acid", back: "Bile acid — gallstone dissolution (less used)" },
  { drug: "Obeticholic acid", back: "FXR agonist — primary biliary cholangitis" },
  { drug: "Lactulose", back: "Osmotic laxative — also reduces ammonia in hepatic encephalopathy" },
  { drug: "Polyethylene glycol", back: "Osmotic laxative — bowel preparation, constipation" },
  { drug: "Senna", back: "Stimulant laxative (anthraquinone) — colonic motility" },
  { drug: "Bisacodyl", back: "Stimulant laxative (diphenylmethane) — rectal/oral" },
  { drug: "Docusate", back: "Stool softener (surfactant) — minimal efficacy" },
  { drug: "Glycerin", back: "Hyperosmotic rectal laxative" },
  { drug: "Prucalopride", back: "5-HT₄ agonist — chronic constipation" },
  { drug: "Naloxegol", back: "Peripheral μ-antagonist (PEGylated) — opioid-induced constipation" },
  { drug: "Methylnaltrexone", back: "Peripheral μ-antagonist (quaternary) — opioid-induced constipation" },
  { drug: "Granisetron", back: "5-HT₃ antagonist — CINV, post-op nausea" },
  { drug: "Palonosetron", back: "Long-acting 5-HT₃ antagonist — CINV" },
  { drug: "Dolasetron", back: "5-HT₃ antagonist — CINV, post-op" },
  { drug: "Aprepitant", back: "NK₁ antagonist — CINV (with 5-HT₃ + dexamethasone)" },
  { drug: "Fosaprepitant", back: "Prodrug of aprepitant — IV for CINV" },
  { drug: "Rolapitant", back: "Long-acting NK₁ antagonist — CINV" },
  { drug: "Droperidol", back: "Butyrophenone D₂ antagonist — antiemetic, QT prolongation black box" },
  { drug: "Trimethobenzamide", back: "Antiemetic (mechanism unclear) — less effective" },
  { drug: "Cyclizine", back: "H₁ antagonist — motion sickness" },
  { drug: "Meclizine", back: "H₁ antagonist — motion sickness, vertigo" },
  { drug: "Dimenhydrinate", back: "H₁ antagonist (diphenhydramine + theophylline) — motion sickness" },
  { drug: "Diphenhydramine", back: "First-generation H₁ antihistamine — allergy, sedation, antiemetic" },
  { drug: "Doxylamine", back: "H₁ antagonist — sedative, morning sickness (with B6)" },
  { drug: "Pyridoxine (B6)", back: "Vitamin — with doxylamine for nausea in pregnancy" },
  { drug: "Glucagon", back: "Pancreatic hormone — hypoglycaemia rescue, GI smooth muscle relaxant (ERCP)" },
  { drug: "Octreotide", back: "Somatostatin analogue — acromegaly, carcinoid, variceal bleeding" },
  { drug: "Lanreotide", back: "Somatostatin analogue — similar to octreotide, depot" },
  { drug: "Pasireotide", back: "Multireceptor somatostatin analogue — acromegaly, Cushing's" },
  { drug: "Vasopressin", back: "ADH analogue — diabetes insipidus, variceal bleeding (V₁ effect)" },
  { drug: "Desmopressin", back: "Selective V₂ agonist — nocturnal enuresis, diabetes insipidus" },
  { drug: "Terlipressin", back: "V₁-selective prodrug — variceal bleeding (not US)" },
  { drug: "Oxytocin", back: "Uterotonic — labour induction, postpartum haemorrhage" },
  { drug: "Carbetocin", back: "Long-acting oxytocin analogue — postpartum haemorrhage prevention" },
  { drug: "Ergonovine", back: "Ergot alkaloid — postpartum haemorrhage (uterotonic)" },
  { drug: "Dinoprostone", back: "PGE₂ — cervical ripening, labour induction" },
  { drug: "Mifepristone", back: "Progesterone antagonist — medical abortion, Cushing's syndrome" },
  { drug: "Letrozole", back: "Aromatase inhibitor (non-steroidal) — breast cancer, ovulation induction" },
  { drug: "Exemestane", back: "Aromatase inactivator (steroidal) — postmenopausal breast cancer" },
  { drug: "Fulvestrant", back: "SERD (selective oestrogen receptor downregulator) — metastatic breast cancer" },
  { drug: "Toremifene", back: "SERM — breast cancer" },
  { drug: "Raloxifene", back: "SERM — osteoporosis, breast cancer risk reduction" },
  { drug: "Bazedoxifene", back: "SERM — with conjugated oestrogens for osteoporosis" },
  { drug: "Clomiphene", back: "SERM — ovulation induction (infertility)" },
  { drug: "Enclomiphene", back: "Trans-isomer of clomiphene — hypogonadism" },
  { drug: "Testosterone", back: "Androgen — replacement therapy, anabolic" },
  { drug: "Methyltestosterone", back: "Oral androgen — hepatotoxic, rarely used" },
  { drug: "Oxandrolone", back: "Anabolic steroid — weight gain, HIV wasting" },
  { drug: "Nandrolone", back: "Anabolic steroid — limited medical use" },
  { drug: "Danazol", back: "Androgenic steroid — endometriosis, hereditary angioedema" },
  { drug: "Finasteride", back: "5α-reductase type II inhibitor — BPH, male pattern baldness" },
  { drug: "Dutasteride", back: "5α-reductase type I+II inhibitor — BPH" },
  { drug: "Solifenacin", back: "Antimuscarinic (M₃ selective) — overactive bladder" },
  { drug: "Darifenacin", back: "M₃ selective antimuscarinic — overactive bladder" },
  { drug: "Tolterodine", back: "Non-selective antimuscarinic — overactive bladder" },
  { drug: "Oxybutynin", back: "Antimuscarinic — overactive bladder, hyperhidrosis (topical)" },
  { drug: "Fesoterodine", back: "Prodrug antimuscarinic — overactive bladder" },
  { drug: "Trospium", back: "Quaternary antimuscarinic — no CNS, overactive bladder" },
  { drug: "Mirabegron", back: "β₃-adrenergic agonist — overactive bladder" },
  { drug: "Vibegron", back: "β₃ agonist — overactive bladder" },
  { drug: "Phenazopyridine", back: "Urinary tract analgesic — mucosal anaesthetic" },
  { drug: "Methenamine", back: "Urinary antiseptic — releases formaldehyde in acid urine" },
  { drug: "Nitrofurantoin", back: "Urinary antibiotic — inhibits bacterial enzymes, for UTI prophylaxis" },
  { drug: "Fosfomycin", back: "Phosphonic acid antibiotic — single-dose UTI" },
  { drug: "Cefuroxime", back: "Second-generation cephalosporin — moderate gram-negative coverage" },
  { drug: "Cefepime", back: "Fourth-generation cephalosporin — broad, Pseudomonas" },
  { drug: "Ceftaroline", back: "Fifth-generation cephalosporin — MRSA, gram-positives" },
  { drug: "Ceftobiprole", back: "Fifth-generation cephalosporin — MRSA, Pseudomonas" },
  { drug: "Cefiderocol", back: "Siderophore cephalosporin — carbapenem-resistant gram-negatives" },
  { drug: "Aztreonam", back: "Monobactam antibiotic — gram-negative only, no cross-allergy with penicillins" },
  { drug: "Cilastatin", back: "Renal dehydropeptidase inhibitor — combined with imipenem" },
  { drug: "Sulbactam", back: "β-lactamase inhibitor — combined with ampicillin" },
  { drug: "Tazobactam", back: "β-lactamase inhibitor — with piperacillin" },
  { drug: "Avibactam", back: "Non-β-lactam β-lactamase inhibitor (class A, C, D)" },
  { drug: "Relebactam", back: "Avibactam-like — with imipenem/cilastatin" },
  { drug: "Vaborbactam", back: "Boronic acid β-lactamase inhibitor — with meropenem" },
  { drug: "Dalbavancin", back: "Lipoglycopeptide — long half-life (1 week), ABSSSI" },
  { drug: "Telavancin", back: "Lipoglycopeptide — MRSA, with membrane disruption" },
  { drug: "Oritavancin", back: "Lipoglycopeptide — single-dose for ABSSSI" },
  { drug: "Teicoplanin", back: "Glycopeptide — similar to vancomycin (Europe)" },
  { drug: "Linezolid", back: "Oxazolidinone — MRSA, VRE, 50S initiation inhibitor" },
  { drug: "Tedizolid", back: "Oxazolidinone — once-daily, more potent than linezolid" },
  { drug: "Daptomycin", back: "Lipopeptide — gram-positives, membrane depolarisation (not for pneumonia)" },
  { drug: "Fidaxomicin", back: "Macrocyclic RNA polymerase inhibitor — C. difficile" },
  { drug: "Polymyxin B", back: "Polymyxin — disrupts gram-negative outer membrane, nephrotoxic" },
  { drug: "Colistin", back: "Polymyxin E — last-resort for MDR gram-negatives" },
  { drug: "Tigecycline", back: "Glycylcycline — broad-spectrum MDR, bacteriostatic" },
  { drug: "Eravacycline", back: "Fluorocycline — intra-abdominal infections, MDR" },
  { drug: "Omadacycline", back: "Aminomethylcycline — CABP, ABSSSI" },
  { drug: "Lefamulin", back: "Pleuromutilin — CABP, 50S peptidyl transferase" },
  { drug: "Solithromycin", back: "Fluoroketolide — CAP (investigational)" },
  { drug: "Ceftazidime-avibactam", back: "Cephalosporin + β-lactamase inhibitor — KPC producers" },
  { drug: "Ceftolozane-tazobactam", back: "Antipseudomonal cephalosporin + BLI — MDR Pseudomonas" },
  { drug: "Meropenem-vaborbactam", back: "Carbapenem + BLI — CRE" },
  { drug: "Imipenem-cilastatin-relebactam", back: "Carbapenem + DHPI + BLI — CRE" },
  { drug: "Delamanid", back: "Nitroimidazole antitubercular — mycolic acid synthesis inhibitor" },
  { drug: "Pretomanid", back: "Nitroimidazole — part of BPaL regimen for XDR-TB" },
  { drug: "Bedaquiline", back: "Diarylquinoline — mycobacterial ATP synthase inhibitor, MDR-TB" },
  { drug: "Clofazimine", back: "Rimino-phenazine — leprosy, MDR-TB" },
  { drug: "Dapsone", back: "Sulfone — leprosy, Pneumocystis prophylaxis" },
  { drug: "Isoniazid", back: "First-line antitubercular — inhibits InhA (mycolic acid synthesis)" },
  { drug: "Rifabutin", back: "Rifamycin — MAC, TB in HIV (less CYP induction)" },
  { drug: "Pyrazinamide", back: "First-line TB drug — unknown target, active in acidic pH" },
  { drug: "Ethambutol", back: "First-line TB — arabinosyltransferase inhibitor, bacteriostatic" },
  { drug: "Streptomycin", back: "Aminoglycoside — second-line TB, also plague/tularemia" },
  { drug: "Kanamycin", back: "Aminoglycoside — second-line TB" },
  { drug: "Amikacin", back: "Aminoglycoside — MDR-TB, severe gram-negatives" },
  { drug: "Capreomycin", back: "Cyclic peptide — second-line TB, injectable" },
  { drug: "Ethionamide", back: "Second-line TB — inhibits InhA" },
  { drug: "Prothionamide", back: "Second-line TB — same as ethionamide" },
  { drug: "Para-aminosalicylic acid (PAS)", back: "Second-line TB — folate synthesis inhibitor" },
  { drug: "Terizidone", back: "Cycloserine derivative — MDR-TB" },
  { drug: "Cycloserine", back: "Second-line TB — D-alanine racemase inhibitor" },
  { drug: "Moxifloxacin", back: "Fluoroquinolone — TB (MDR regimens), respiratory infections" },
  { drug: "Levofloxacin", back: "Fluoroquinolone — TB, pneumonia, UTI" },
  { drug: "Gatifloxacin", back: "Fluoroquinolone — TB, but dysglycaemia risk" },
  { drug: "Ofloxacin", back: "Fluoroquinolone — TB, older agent" },
  { drug: "Sparfloxacin", back: "Fluoroquinolone — photosensitivity, withdrawn" },
  { drug: "Gemifloxacin", back: "Fluoroquinolone — respiratory infections" },
  { drug: "Delafloxacin", back: "Fluoroquinolone — broad, MRSA, acidic pH active" },
  { drug: "Nalidixic acid", back: "First quinolone — urinary tract infections (old)" },
  { drug: "Clinafloxacin", back: "Fluoroquinolone — broad but toxic, not used" },
  { drug: "Temafloxacin", back: "Withdrawn — haemolytic uraemic syndrome" },
  { drug: "Trovafloxacin", back: "Withdrawn — hepatotoxicity" },
  { drug: "Garenoxacin", back: "Des-F(6)-quinolone — used in Japan" },
  { drug: "Sitafloxacin", back: "Fluoroquinolone — Japan" },
  { drug: "Nemonoxacin", back: "Non-fluorinated quinolone — CAP" },
  { drug: "Zabofloxacin", back: "Fluoroquinolone — in development" },
  { drug: "Finafloxacin", back: "pH-sensitive quinolone — biofilm" },
  { drug: "Ozenoxacin", back: "Topical non-fluorinated quinolone — impetigo" },
  { drug: "Tinidazole", back: "Nitroimidazole — similar to metronidazole, longer half-life" },
  { drug: "Ornidazole", back: "Nitroimidazole — antiprotozoal, anaerobic" },
  { drug: "Secnidazole", back: "Nitroimidazole — single-dose for trichomoniasis" },
  { drug: "Nitazoxanide", back: "Thiazolide — antiprotozoal (Giardia, Cryptosporidium), antiviral" },
  { drug: "Chloroquine", back: "4-aminoquinoline antimalarial — also used in autoimmune diseases" },
  { drug: "Hydroxychloroquine", back: "Antimalarial, immunomodulator (SLE, RA)" },
  { drug: "Quinine", back: "Cinchona alkaloid antimalarial — also muscle cramps (off-label)" },
  { drug: "Mefloquine", back: "Antimalarial — prophylaxis/treatment, neuropsychiatric side effects" },
  { drug: "Primaquine", back: "8-aminoquinoline — radical cure of P. vivax/P. ovale" },
  { drug: "Tafenoquine", back: "Single-dose primaquine analogue — radical cure" },
  { drug: "Artemisinin", back: "Endoperoxide antimalarial — rapid blood-stage kill" },
  { drug: "Artesunate", back: "IV artemisinin derivative — severe malaria" },
  { drug: "Artemether", back: "Artemisinin derivative — in combination (e.g., with lumefantrine)" },
  { drug: "Dihydroartemisinin", back: "Active metabolite of artemisinin derivatives" },
  { drug: "Lumefantrine", back: "Aryl amino alcohol — partner drug with artemether" },
  { drug: "Piperaquine", back: "Bisquinoline — partner with dihydroartemisinin" },
  { drug: "Pyronaridine", back: "Mannich base antimalarial — partner drug" },
  { drug: "Atovaquone", back: "Mitochondrial electron transport inhibitor — antimalarial, Pneumocystis" },
  { drug: "Proguanil", back: "DHFR inhibitor — with atovaquone (Malarone)" },
  { drug: "Sulfadoxine", back: "DHPS inhibitor — with pyrimethamine (Fansidar)" },
  { drug: "Pyrimethamine", back: "DHFR inhibitor — toxoplasmosis, malaria" },
  { drug: "Sulfadiazine", back: "Sulfonamide — toxoplasmosis (with pyrimethamine)" },
  { drug: "Trimetrexate", back: "DHFR inhibitor — Pneumocystis (with leucovorin rescue)" },
  { drug: "Pafuramidine", back: "Prodrug for trypanosomiasis — not widely available" },
  { drug: "Pentamidine", back: "Antiprotozoal — Pneumocystis, leishmaniasis, trypanosomiasis" },
  { drug: "Suramin", back: "Antitrypanosomal — stage 1 African trypanosomiasis" },
  { drug: "Melarsoprol", back: "Arsenical — stage 2 HAT (CNS involvement)" },
  { drug: "Eflornithine", back: "Ornithine decarboxylase inhibitor — stage 2 T.b. gambiense" },
  { drug: "Nifurtimox", back: "Nitroheterocycle — Chagas disease" },
  { drug: "Benznidazole", back: "Nitroimidazole — Chagas disease" },
  { drug: "Miltefosine", back: "Alkylphosphocholine — leishmaniasis" },
  { drug: "Paromomycin", back: "Aminoglycoside — intestinal amoebiasis, leishmaniasis (topical/systemic)" },
  { drug: "Stibogluconate", back: "Pentavalent antimonial — leishmaniasis" },
  { drug: "Ivermectin", back: "Avermectin — onchocerciasis, strongyloidiasis, scabies" },
  { drug: "Albendazole", back: "Benzimidazole anthelmintic — broad-spectrum (roundworms, tapeworms)" },
  { drug: "Mebendazole", back: "Benzimidazole — less systemic, intestinal helminths" },
  { drug: "Praziquantel", back: "Isoquinoline — schistosomiasis, tapeworms" },
  { drug: "Niclosamide", back: "Salicylanilide — tapeworms, also antiviral (investigational)" },
  { drug: "Pyrantel pamoate", back: "Nicotinic agonist — hookworms, roundworms, pinworms" },
  { drug: "Piperazine", back: "GABA agonist — ascariasis (less used)" },
  { drug: "Diethylcarbamazine", back: "Antifilarial — lymphatic filariasis, loiasis" },
  { drug: "Clarithromycin", back: "Macrolide — MAC, H. pylori, respiratory infections" },
  { drug: "Telithromycin", back: "Ketolide — CAP, hepatotoxicity concerns" },
  { drug: "Bezlotoxumab", back: "Monoclonal antibody — C. difficile toxin B, prevents recurrence" }
];
const sideEffectsData = [
  { drug: "Metformin", back: "GI upset (nausea, diarrhoea, metallic taste), lactic acidosis (rare; avoid eGFR<30), B12 deficiency (long-term)." },
  { drug: "Warfarin", back: "Bleeding (major risk), skin necrosis (protein C deficiency), teratogenicity, purple toe syndrome, hair loss." },
  { drug: "Furosemide", back: "Hypokalaemia, hyponatraemia, ototoxicity (high IV doses), hyperuricaemia, dehydration, metabolic alkalosis." },
  { drug: "Ciprofloxacin", back: "Tendinopathy/rupture (Achilles), QT prolongation, peripheral neuropathy, CNS effects (seizures rare)." },
  { drug: "Lisinopril", back: "Dry persistent cough (bradykinin), hyperkalaemia, angioedema, first-dose hypotension, renal impairment." },
  { drug: "Atenolol", back: "Bradycardia, fatigue, cold extremities, bronchospasm (avoid in asthma), masking hypoglycaemia symptoms." },
  { drug: "Simvastatin", back: "Myopathy/rhabdomyolysis (especially + CYP3A4 inhibitors), elevated transaminases, GI disturbance." },
  { drug: "Amoxicillin", back: "Hypersensitivity/anaphylaxis, GI upset, maculopapular rash (especially in EBV mono), C. difficile." },
  { drug: "Morphine", back: "Respiratory depression, constipation, nausea/vomiting, miosis, urinary retention, dependence, itching (histamine)." },
  { drug: "Omeprazole", back: "Hypomagnesaemia, C. difficile risk, B12 deficiency, rebound acid hypersecretion on withdrawal, osteoporosis." },
  { drug: "Methotrexate", back: "Hepatotoxicity, myelosuppression, mucositis, pneumonitis, teratogenicity (must give folate supplementation)." },
  { drug: "Carbamazepine", back: "Stevens-Johnson syndrome (HLA-B*1502), SIADH/hyponatraemia, diplopia, ataxia, teratogenic." },
  { drug: "Aspirin", back: "GI ulceration/bleeding, Reye's syndrome (children <12), salicylism (tinnitus), bronchospasm in aspirin-sensitive." },
  { drug: "Heparin", back: "Bleeding, HIT (type II = thrombosis paradox), hyperkalaemia, osteoporosis, elevated LFTs." },
  { drug: "Vancomycin", back: "Red man syndrome (histamine release; slow infusion), nephrotoxicity, ototoxicity, thrombophlebitis." },
  { drug: "Rifampicin", back: "Orange-red body fluids (urine, sweat, tears), hepatotoxicity, flu-like syndrome, drug interactions (CYP450 inducer)." },
  { drug: "Paracetamol", back: "Hepatotoxicity (with overdose, glutathione depletion), skin rashes (rare), safe at therapeutic doses (no GI bleeding)." },
  { drug: "Ibuprofen", back: "GI ulceration/bleeding, renal impairment (especially with volume depletion), cardiovascular risk (high doses long-term)." },
  { drug: "Ondansetron", back: "QT prolongation (dose-dependent), headache, constipation, serotonin syndrome (with other serotonergics)." },
  { drug: "Ramipril", back: "Same as lisinopril: cough, angioedema, hyperkalaemia, first-dose hypotension, renal impairment." },
  { drug: "Losartan", back: "Less cough than ACE inhibitors, hyperkalaemia, angioedema (rare), foetal toxicity (avoid in pregnancy)." },
  { drug: "Enalapril", back: "Cough, angioedema, hyperkalaemia, rash, neutropenia (rare), foetal toxicity." },
  { drug: "Candesartan", back: "Same as losartan: ARB side effects – hyperkalaemia, hypotension, renal dysfunction, foetal harm." },
  { drug: "Propranolol", back: "Bradycardia, bronchospasm, fatigue, cold extremities, nightmares/depression, masking hypoglycaemia." },
  { drug: "Carvedilol", back: "Dizziness, bradycardia, fluid retention (worsening HF), bronchospasm, fatigue, postural hypotension (α-blockade)." },
  { drug: "Bisoprolol", back: "Bradycardia, hypotension, fatigue, cold extremities, bronchospasm (less than non-selective but still caution)." },
  { drug: "Diltiazem", back: "Constipation, bradycardia, AV block, ankle oedema, gingival hyperplasia, heart failure exacerbation." },
  { drug: "Verapamil", back: "Constipation (most common), bradycardia, AV block, heart failure, gingival hyperplasia, avoid in systolic HF." },
  { drug: "Hydrochlorothiazide", back: "Hypokalaemia, hyponatraemia, hyperuricaemia, hyperglycaemia, hyperlipidaemia, photosensitivity." },
  { drug: "Indapamide", back: "Similar to HCTZ: hypokalaemia, metabolic disturbances, but less metabolic effect at low dose." },
  { drug: "Atorvastatin", back: "Myalgia/rhabdomyolysis, elevated transaminases, increased risk of diabetes (dose-dependent), cognitive effects (rare)." },
  { drug: "Rosuvastatin", back: "Same as atorvastatin: myopathy, raised LFTs, diabetes risk, headache, GI upset." },
  { drug: "Ezetimibe", back: "Generally well-tolerated; GI upset, headache, myalgia (rare), elevated LFTs (when combined with statin)." },
  { drug: "Glibenclamide", back: "Hypoglycaemia (severe, prolonged), weight gain, GI upset, disulfiram-like reaction with alcohol, SIADH." },
  { drug: "Glipizide", back: "Hypoglycaemia (less than glibenclamide), weight gain, GI upset, rash, hyponatraemia." },
  { drug: "Pioglitazone", back: "Weight gain, fluid retention (heart failure risk), bladder cancer (controversial), bone fractures (women)." },
  { drug: "Sitagliptin", back: "Nasopharyngitis, headache, GI upset, rare pancreatitis, arthralgia, bullous pemphigoid." },
  { drug: "Empagliflozin", back: "Genital mycotic infections, UTI, polyuria, volume depletion, DKA (euglycaemic DKA risk), necrotising fasciitis (rare)." },
  { drug: "Liraglutide", back: "Nausea/vomiting (dose-dependent), pancreatitis, gallbladder disease, hypoglycaemia (if combined with insulin/sulphonylurea)." },
  { drug: "Phenytoin", back: "Gingival hyperplasia, hirsutism, ataxia, diplopia, nystagmus, osteoporosis, rash, DRESS syndrome, teratogenicity." },
  { drug: "Valproate", back: "Weight gain, alopecia, tremor, hepatotoxicity (young children), hyperammonaemia, neural tube defects (teratogenic)." },
  { drug: "Levetiracetam", back: "Drowsiness, asthenia, behavioural changes (irritability, aggression), dizziness, rash (rare)." },
  { drug: "Phenobarbitone", back: "Sedation, cognitive impairment, tolerance, dependence, respiratory depression, rash (Stevens-Johnson)." },
  { drug: "Diazepam", back: "Sedation, ataxia, dependence, withdrawal syndrome (seizures, delirium), anterograde amnesia, respiratory depression (IV)." },
  { drug: "Lorazepam", back: "Same as diazepam: sedation, dependence, withdrawal, amnesia; less accumulation in elderly." },
  { drug: "Clonazepam", back: "Drowsiness, ataxia, behavioural changes, dependence, withdrawal seizures, salivary/bronchial hypersecretion." },
  { drug: "Haloperidol", back: "Extrapyramidal symptoms (EPS), tardive dyskinesia, neuroleptic malignant syndrome (NMS), QT prolongation." },
  { drug: "Risperidone", back: "EPS (less than haloperidol), weight gain, hyperprolactinaemia, sedation, orthostatic hypotension." },
  { drug: "Olanzapine", back: "Weight gain (high), metabolic syndrome (diabetes, dyslipidaemia), sedation, dry mouth, constipation." },
  { drug: "Clozapine", back: "Agranulocytosis (requires monitoring), myocarditis, seizures, weight gain, hypersalivation, orthostatic hypotension." },
  { drug: "Fluoxetine", back: "GI upset, insomnia, anxiety, sexual dysfunction (delayed ejaculation, decreased libido), hyponatraemia (SIADH)." },
  { drug: "Sertraline", back: "Same SSRI side effects: GI upset, sexual dysfunction, insomnia, weight gain (less), discontinuation syndrome." },
  { drug: "Amitriptyline", back: "Anticholinergic (dry mouth, constipation, blurred vision, urinary retention), sedation, weight gain, cardiac arrhythmias (QT)." },
  { drug: "Venlafaxine", back: "Nausea, insomnia, sexual dysfunction, hypertension (high dose), withdrawal syndrome, sweating." },
  { drug: "Lithium", back: "Nephrogenic diabetes insipidus, hypothyroidism, tremor, weight gain, teratogenic (Ebstein's anomaly), narrow therapeutic index." },
  { drug: "Donepezil", back: "GI upset (nausea, diarrhoea), insomnia, bradycardia, vivid dreams, muscle cramps, fatigue." },
  { drug: "Memantine", back: "Dizziness, headache, confusion, constipation, hypertension (rare), no significant GI effects." },
  { drug: "Levodopa", back: "Nausea/vomiting (give with carbidopa), dyskinesias, hallucinations, orthostatic hypotension, colour of urine (dark)." },
  { drug: "Pramipexole", back: "Nausea, somnolence (sudden sleep onset), impulse control disorders (gambling, hypersexuality), hallucinations." },
  { drug: "Selegiline", back: "Insomnia, dizziness, GI upset, at high doses: hypertensive crisis (non-selective MAOI effect)." },
  { drug: "Amoxicillin-Clavulanate", back: "Diarrhoea (more than amoxicillin alone), nausea, rash, hepatitis (cholestatic), C. difficile." },
  { drug: "Piperacillin-Tazobactam", back: "Diarrhoea, rash, nausea, thrombophlebitis (IV), neutropenia (prolonged use), hypokalaemia." },
  { drug: "Meropenem", back: "GI upset, headache, rash, thrombophlebitis, seizures (in CNS disease or renal impairment), C. difficile." },
  { drug: "Azithromycin", back: "GI upset (nausea, diarrhoea, abdominal pain), QT prolongation, hepatotoxicity, hearing loss (high doses)." },
  { drug: "Erythromycin", back: "GI intolerance (motilin agonist), QT prolongation, hearing loss (high doses), drug interactions (CYP3A4 inhibitor)." },
  { drug: "Doxycycline", back: "Photosensitivity, oesophageal irritation (take with water), GI upset, tooth discolouration (children <8)." },
  { drug: "Clindamycin", back: "Diarrhoea (high risk of C. difficile), rash, metallic taste, hepatotoxicity (rare), nausea." },
  { drug: "Gentamicin", back: "Nephrotoxicity (acute tubular necrosis), ototoxicity (vestibular > cochlear), neuromuscular blockade." },
  { drug: "Trimethoprim", back: "Rash, GI upset, hyperkalaemia (weak K+-sparing effect), megaloblastic anaemia (long-term)." },
  { drug: "Co-trimoxazole", back: "Stevens-Johnson syndrome (HIV patients), hyperkalaemia, photosensitivity, bone marrow suppression, creatinine rise." },
  { drug: "Metronidazole", back: "Metallic taste, disulfiram-like reaction with alcohol, nausea, headache, peripheral neuropathy (high dose/long-term)." },
  { drug: "Fluconazole", back: "Nausea, rash, hepatotoxicity (dose-dependent), QT prolongation, alopecia (long-term)." },
  { drug: "Amphotericin B", back: "Infusion-related reactions (fever, chills), nephrotoxicity, hypokalaemia, hypomagnesaemia, anaemia." },
  { drug: "Acyclovir", back: "Nausea, diarrhoea, headache, nephrotoxicity (IV, bolus), neurotoxicity (confusion, hallucinations, especially elderly)." },
  { drug: "Oseltamivir", back: "Nausea, vomiting, headache, neuropsychiatric events (sudden confusion, self-harm – rare, children)." },
  { drug: "Zidovudine (AZT)", back: "Anaemia (macrocytic), neutropenia, myopathy, nausea, headache, lactic acidosis (rare)." },
  { drug: "Tenofovir", back: "Nephrotoxicity (Fanconi syndrome), decreased bone mineral density, GI upset, headache." },
  { drug: "Efavirenz", back: "CNS effects (vivid dreams, dizziness, depression), rash, hepatotoxicity, false-positive cannabis test." },
  { drug: "Lopinavir", back: "GI upset (diarrhoea), pancreatitis, lipodystrophy, hepatotoxicity, QT prolongation." },
  { drug: "Dexamethasone", back: "Hyperglycaemia, weight gain, insomnia, osteoporosis, adrenal suppression, immunosuppression." },
  { drug: "Prednisolone", back: "Same as dexamethasone: Cushingoid features, hyperglycaemia, osteoporosis, psychosis, adrenal insufficiency." },
  { drug: "Fludrocortisone", back: "Hypertension, hypokalaemia, oedema, heart failure exacerbation, headache." },
  { drug: "Azathioprine", back: "Myelosuppression (dose-dependent, TPMT deficiency), hepatotoxicity, pancreatitis, rash, nausea." },
  { drug: "Cyclosporin", back: "Nephrotoxicity, hypertension, hyperlipidaemia, gingival hyperplasia, hirsutism, tremor, lymphoma risk." },
  { drug: "Tacrolimus", back: "Nephrotoxicity, neurotoxicity (tremor, headache), diabetes, hyperkalaemia, alopecia, hypertension." },
  { drug: "Mycophenolate", back: "GI upset (diarrhoea), myelosuppression (leukopenia), teratogenic (first trimester), infections." },
  { drug: "Infliximab", back: "Infusion reactions, reactivation TB, hepatitis B, heart failure exacerbation, demyelinating disease, lymphoma." },
  { drug: "Adalimumab", back: "Same as infliximab: injection site reactions, infections (TB, fungal), autoimmune syndromes, hepatotoxicity." },
  { drug: "Rituximab", back: "Infusion reactions (fever, chills), hepatitis B reactivation, progressive multifocal leukoencephalopathy (PML), neutropenia." },
  { drug: "Trastuzumab", back: "Cardiotoxicity (left ventricular dysfunction, especially with anthracyclines), infusion reactions, pulmonary toxicity." },
  { drug: "Imatinib", back: "Oedema (periorbital), nausea, muscle cramps, rash, hepatotoxicity, myelosuppression, fatigue." },
  { drug: "Cyclophosphamide", back: "Haemorrhagic cystitis (acrolein), myelosuppression, SIADH, alopecia, nausea, infertility." },
  { drug: "Cisplatin", back: "Nephrotoxicity (dose-limiting), ototoxicity, severe nausea/vomiting, neuropathy, hypomagnesaemia." },
  { drug: "Doxorubicin", back: "Cardiotoxicity (dilated cardiomyopathy, dose-dependent), myelosuppression, mucositis, alopecia." },
  { drug: "Tamoxifen", back: "Hot flashes, increased risk of endometrial cancer, VTE, cataracts, mood changes." },
  { drug: "Anastrozole", back: "Arthralgia, osteoporosis/fractures, hot flashes, fatigue, hypercholesterolaemia, carpal tunnel syndrome." },
  { drug: "Allopurinol", back: "Rash (including Stevens-Johnson in HLA-B*5801), hypersensitivity syndrome (DRESS), hepatotoxicity, GI upset." },
  { drug: "Colchicine", back: "Diarrhoea (dose-limiting), nausea, vomiting, myelosuppression (high dose), neuromyotoxicity (with statins/cyclosporin)." },
  { drug: "Omalizumab", back: "Injection site reactions, anaphylaxis (rare), headache, arthralgia, parasitic infection risk." },
  { drug: "Montelukast", back: "Headache, GI upset, neuropsychiatric events (agitation, depression, suicidality), fatigue." },
  { drug: "Theophylline", back: "Nausea, vomiting, tremor, tachycardia, seizures (toxic dose), insomnia (CNS stimulation)." },
  { drug: "Ipratropium", back: "Dry mouth, bitter taste, cough, headache, paradoxical bronchospasm (rare)." },
  { drug: "Tiotropium", back: "Dry mouth, constipation, urinary retention, pharyngitis, tachycardia (high dose)." },
  { drug: "Acetazolamide", back: "Paraesthesia (hands/feet), metabolic acidosis, renal stones, hypokalaemia, drowsiness." },
  { drug: "Mannitol", back: "Fluid overload (heart failure), pulmonary oedema, electrolyte imbalance, headache, nausea." },
  { drug: "Amiloride", back: "Hyperkalaemia, nausea, headache, rash, diarrhoea, impotence." },
  { drug: "Triamterene", back: "Hyperkalaemia, nausea, vomiting, photosensitivity, renal stones (rare)." },
  { drug: "Chlorthalidone", back: "Same as HCTZ: hypokalaemia, hyponatraemia, hyperuricaemia, glucose intolerance, dizziness." },
  { drug: "Metolazone", back: "Similar to thiazides: hypokalaemia, dehydration, hyperuricaemia, weakness, GI upset." },
  { drug: "Torasemide", back: "Similar to furosemide: hypokalaemia, electrolyte imbalance, ototoxicity (rare), hyperuricaemia." },
  { drug: "Bumetanide", back: "Same as furosemide: hypokalaemia, metabolic alkalosis, ototoxicity, hypotension." },
  { drug: "Dabigatran", back: "Bleeding (major), dyspepsia (more than warfarin), GI bleeding (higher than other DOACs), liver injury." },
  { drug: "Rivaroxaban", back: "Bleeding, back pain, anaemia, elevated LFTs, rash, spinal haematoma (with neuraxial anaesthesia)." },
  { drug: "Apixaban", back: "Bleeding (less than warfarin), nausea, anaemia, rash, hypotension." },
  { drug: "Edoxaban", back: "Bleeding, rash, abnormal LFTs, anaemia, GI upset." },
  { drug: "Enoxaparin", back: "Bleeding, thrombocytopaenia (rare, less than UFH), injection site haematoma, elevated LFTs, osteoporosis (long-term)." },
  { drug: "Fondaparinux", back: "Bleeding, thrombocytopaenia (very rare), injection site reaction, rash, anaemia." },
  { drug: "Bivalirudin", back: "Bleeding, hypotension, nausea, back pain, injection site reaction." },
  { drug: "Argatroban", back: "Bleeding, hypotension, fever, diarrhoea, elevated LFTs." },
  { drug: "Ticagrelor", back: "Bleeding, dyspnoea (common, mechanism unknown), bradycardia, ventricular pauses, hyperuricaemia." },
  { drug: "Prasugrel", back: "Bleeding (higher than clopidogrel), thrombotic thrombocytopaenic purpura (TTP, rare), rash." },
  { drug: "Ticlopidine", back: "Neutropenia (monitor CBC), TTP, bleeding, diarrhoea, rash, cholestasis." },
  { drug: "Dipyridamole", back: "Headache, dizziness, GI upset, hypotension, flushing (due to vasodilation)." },
  { drug: "Cilostazol", back: "Headache, diarrhoea, palpitations, dizziness, flushing (avoid in heart failure)." },
  { drug: "Streptokinase", back: "Bleeding, allergic reactions (fever, rash, anaphylaxis), hypotension, reperfusion arrhythmias." },
  { drug: "Alteplase", back: "Bleeding (intracranial haemorrhage risk), angioedema, hypotension, arrhythmias." },
  { drug: "Tenecteplase", back: "Same as alteplase: bleeding, intracranial haemorrhage, nausea, hypotension." },
  { drug: "Reteplase", back: "Bleeding, allergic reactions, arrhythmias, hypotension, cholesterol embolism." },
  { drug: "Tranexamic acid", back: "Thrombotic events (rare, but risk with DVT/PE history), visual disturbances, dizziness, GI upset." },
  { drug: "Aminocaproic acid", back: "Thrombosis, myopathy (with prolonged use), nausea, diarrhoea, hypotension." },
  { drug: "Protamine sulfate", back: "Hypotension (rapid IV), bradycardia, anaphylaxis (in NPH insulin users), pulmonary hypertension." },
  { drug: "Vitamin K", back: "Flushing, dizziness, hypotension (rapid IV), rash, allergic reactions." },
  { drug: "Phytonadione", back: "Same as vitamin K: injection site reactions, rare anaphylaxis (IV)." },
  { drug: "Idarucizumab", back: "Headache, nausea, bleeding (if underlying coagulopathy not fully reversed), infusion reactions." },
  { drug: "Andexanet alfa", back: "Infusion reactions, headache, nausea, thrombotic events (early), fatigue." },
  { drug: "Naloxone", back: "Acute opioid withdrawal (tachycardia, hypertension, vomiting, seizures), pulmonary oedema (rare)." },
  { drug: "Naltrexone", back: "Nausea, headache, dizziness, fatigue, hepatotoxicity (high doses), opioid blockade." },
  { drug: "Buprenorphine", back: "Constipation, nausea, headache, sweating, withdrawal if given too soon after full agonist." },
  { drug: "Methadone", back: "QT prolongation, respiratory depression (less than morphine but long half-life), constipation, sweating." },
  { drug: "Fentanyl", back: "Respiratory depression, bradycardia, chest wall rigidity (IV), nausea, dependence." },
  { drug: "Oxycodone", back: "Constipation, nausea, dizziness, dependence, respiratory depression (less than morphine but still risk)." },
  { drug: "Hydromorphone", back: "Same as morphine: respiratory depression, constipation, nausea, euphoria, dependence." },
  { drug: "Tramadol", back: "Seizures (lower seizure threshold), serotonin syndrome (with SSRIs), nausea, dizziness, dependence." },
  { drug: "Tapentadol", back: "Nausea, dizziness, constipation, headache, seizures (rare), serotonin syndrome." },
  { drug: "Codeine", back: "Constipation, nausea, dependence, respiratory depression (poor metabolisers: toxicity)." },
  { drug: "Dihydrocodeine", back: "Same as codeine: constipation, dizziness, nausea, sedation." },
  { drug: "Meperidine", back: "Neurotoxicity (normeperidine: seizures, tremor), serotonin syndrome (with MAOIs), histamine release." },
  { drug: "Loperamide", back: "Constipation, abdominal pain, nausea, rarely: cardiac arrest (high doses, P-glycoprotein inhibitor)." },
  { drug: "Flumazenil", back: "Seizures (in benzodiazepine-dependent patients), agitation, nausea, tachycardia." },
  { drug: "Zolpidem", back: "Drowsiness, dizziness, anterograde amnesia, sleepwalking (complex behaviours), dependence." },
  { drug: "Eszopiclone", back: "Metallic taste, headache, drowsiness, dry mouth, amnesia." },
  { drug: "Zaleplon", back: "Drowsiness, amnesia, headache, nausea, dependence (less than other Z-drugs)." },
  { drug: "Ramelteon", back: "Drowsiness, dizziness, fatigue, headache, no dependence." },
  { drug: "Suvorexant", back: "Next-day drowsiness, headache, abnormal dreams, sleep paralysis, dependence (schedule IV)." },
  { drug: "Modafinil", back: "Headache, nausea, anxiety, insomnia, rare Stevens-Johnson syndrome." },
  { drug: "Methylphenidate", back: "Insomnia, decreased appetite, anxiety, tachycardia, hypertension, growth delay (children)." },
  { drug: "Amphetamine", back: "Insomnia, anorexia, psychosis (high dose), tachycardia, hypertension, dependence." },
  { drug: "Lisdexamfetamine", back: "Same as amphetamine: insomnia, decreased appetite, irritability, dry mouth." },
  { drug: "Atomoxetine", back: "Insomnia, decreased appetite, nausea, fatigue, liver injury (rare), suicidal ideation (warning)." },
  { drug: "Guanfacine", back: "Drowsiness, dry mouth, dizziness, hypotension, bradycardia, rebound hypertension." },
  { drug: "Clonidine", back: "Dry mouth, sedation, rebound hypertension, bradycardia, constipation." },
  { drug: "Dexmedetomidine", back: "Hypotension, bradycardia, dry mouth, nausea, fever, respiratory depression (high dose)." },
  { drug: "Baclofen", back: "Drowsiness, dizziness, weakness, nausea, withdrawal (seizures, hallucinations), respiratory depression." },
  { drug: "Tizanidine", back: "Drowsiness, dry mouth, hypotension, hepatotoxicity (rare), weakness, hallucinations." },
  { drug: "Dantrolene", back: "Muscle weakness, hepatotoxicity (fatal, especially in women >30), diarrhoea, drowsiness." },
  { drug: "Botulinum toxin", back: "Local weakness, dysphagia (if injected near oesophagus), ptosis, dry mouth, systemic spread (rare)." },
  { drug: "Neostigmine", back: "Cholinergic crisis (bradycardia, miosis, sweating, bronchospasm), abdominal cramps, diarrhoea." },
  { drug: "Pyridostigmine", back: "Same as neostigmine: GI upset, excessive salivation, muscle twitching, bradycardia." },
  { drug: "Edrophonium", back: "Bradycardia, salivation, lacrimation, sweating, nausea (cholinergic effects)." },
  { drug: "Atropine", back: "Anticholinergic: dry mouth, blurred vision, urinary retention, constipation, tachycardia, delirium (high dose)." },
  { drug: "Glycopyrrolate", back: "Dry mouth, blurred vision, constipation, urinary retention, tachycardia (less CNS effects)." },
  { drug: "Scopolamine", back: "Drowsiness, dry mouth, blurred vision, confusion (elderly), urinary retention." },
  { drug: "Ipratropium", back: "Already listed above: dry mouth, cough, headache." },
  { drug: "Tiotropium", back: "Already listed above: dry mouth, urinary retention, constipation." },
  { drug: "Pilocarpine", back: "Sweating, salivation, nausea, diarrhoea, bradycardia, headache (cholinergic excess)." },
  { drug: "Cevimeline", back: "Same as pilocarpine: sweating, excessive salivation, lacrimation, GI upset." },
  { drug: "Bethanechol", back: "Abdominal cramps, diarrhoea, nausea, bradycardia, hypotension, urinary urgency." },
  { drug: "Carbachol", back: "Same as bethanechol: cholinergic effects, miosis (topical), headache." },
  { drug: "Physostigmine", back: "Cholinergic crisis (nausea, vomiting, diarrhoea, bradycardia, seizures, respiratory depression)." },
  { drug: "Pralidoxime", back: "Tachycardia, hypertension, dizziness, nausea, muscle weakness (if given too rapidly)." },
  { drug: "Epinephrine", back: "Tachycardia, hypertension, anxiety, tremor, arrhythmias, pulmonary oedema (high dose)." },
  { drug: "Norepinephrine", back: "Tissue ischaemia (extravasation), bradycardia (reflex), hypertension, arrhythmias." },
  { drug: "Dopamine", back: "Tachycardia, arrhythmias, nausea, hypertension, tissue necrosis (extravasation)." },
  { drug: "Dobutamine", back: "Tachycardia, hypertension, arrhythmias, headache, nausea, hypokalaemia." },
  { drug: "Isoproterenol", back: "Tachycardia, palpitations, arrhythmias, headache, flushing, tremor." },
  { drug: "Phenylephrine", back: "Hypertension, reflex bradycardia, headache, nausea, vasoconstriction (local necrosis)." },
  { drug: "Midodrine", back: "Hypertension (supine), piloerection, urinary retention, bradycardia, paresthesia." },
  { drug: "Methyldopa", back: "Drowsiness, haemolytic anaemia (positive direct Coombs test), hepatotoxicity, orthostatic hypotension." },
  { drug: "Prazosin", back: "First-dose syncope, dizziness, headache, palpitations, nasal congestion, oedema." },
  { drug: "Doxazosin", back: "Same as prazosin: orthostatic hypotension, fatigue, dizziness, nasal congestion." },
  { drug: "Terazosin", back: "Same: orthostatic hypotension, dizziness, asthenia, headache, palpitations." },
  { drug: "Tamsulosin", back: "Abnormal ejaculation (retrograde), dizziness, rhinitis, orthostatic hypotension (less than others)." },
  { drug: "Alfuzosin", back: "Dizziness, headache, fatigue, orthostatic hypotension, QT prolongation (rare)." },
  { drug: "Silodosin", back: "Retrograde ejaculation (very common), dizziness, diarrhoea, orthostatic hypotension." },
  { drug: "Phentolamine", back: "Tachycardia, orthostatic hypotension, nasal congestion, nausea, flushing." },
  { drug: "Phenoxybenzamine", back: "Nasal congestion, orthostatic hypotension, reflex tachycardia, fatigue, ejaculatory failure." },
  { drug: "Yohimbine", back: "Anxiety, tachycardia, hypertension, dizziness, nausea, tremor." },
  { drug: "Labetalol", back: "Dizziness, fatigue, scalp paraesthesia, orthostatic hypotension, bronchospasm, heart block." },
  { drug: "Nebivolol", back: "Dizziness, fatigue, bradycardia, headache, bronchospasm (less than other β-blockers)." },
  { drug: "Betaxolol", back: "Same as atenolol: bradycardia, fatigue, cold extremities, depression, sexual dysfunction." },
  { drug: "Carteolol", back: "Same: bradycardia, fatigue, bronchospasm, also topical for glaucoma: stinging, blurred vision." },
  { drug: "Pindolol", back: "Less bradycardia (ISA), but still fatigue, dizziness, bronchospasm, sleep disturbances." },
  { drug: "Acebutolol", back: "Same as pindolol: less bradycardia, but fatigue, GI upset, lupus-like syndrome (rare)." },
  { drug: "Esmolol", back: "Hypotension, bradycardia, infusion site reaction, nausea, bronchospasm (short half-life)." },
  { drug: "Sotalol", back: "QT prolongation (torsades de pointes), bradycardia, fatigue, dyspnoea, headache." },
  { drug: "Amiodarone", back: "Pulmonary fibrosis, corneal microdeposits, hyper/hypothyroidism, photosensitivity (blue-grey skin), hepatotoxicity." },
  { drug: "Dronedarone", back: "Hepatotoxicity (liver failure), worsening HF (in NYHA IV), QT prolongation, bradycardia, GI upset." },
  { drug: "Procainamide", back: "Lupus-like syndrome (more than other antiarrhythmics), agranulocytosis, QT prolongation, hypotension." },
  { drug: "Quinidine", back: "Cinchonism (tinnitus, blurred vision, headache), QT prolongation, thrombocytopaenia, GI upset." },
  { drug: "Disopyramide", back: "Anticholinergic (dry mouth, urinary retention), negative inotrope (worsening HF), QT prolongation." },
  { drug: "Lidocaine", back: "CNS: drowsiness, paresthesia, seizures, respiratory arrest (high dose); hypotension, bradycardia." },
  { drug: "Mexiletine", back: "GI upset (nausea, vomiting), tremor, dizziness, ataxia, hepatotoxicity." },
  { drug: "Flecainide", back: "Proarrhythmia (especially with structural heart disease), dizziness, blurred vision, headache." },
  { drug: "Propafenone", back: "Metallic taste, constipation, proarrhythmia, dizziness, bronchospasm (weak β-blocker)." },
  { drug: "Adenosine", back: "Flushing, chest pain (transient), dyspnoea, bradycardia, asystole (brief), headache." },
  { drug: "Ivabradine", back: "Luminous phenomena (phosphenes), bradycardia, blurred vision, headache, atrial fibrillation." },
  { drug: "Ranolazine", back: "Dizziness, constipation, nausea, headache, QT prolongation (mild)." },
  { drug: "Hydralazine", back: "Reflex tachycardia, SLE-like syndrome (slow acetylators), headache, flushing, palpitations." },
  { drug: "Minoxidil", back: "Hypertrichosis, fluid retention (heart failure), reflex tachycardia, pericardial effusion." },
  { drug: "Sodium nitroprusside", back: "Cyanide toxicity (metabolic acidosis, confusion, seizures), hypotension, thiocyanate toxicity." },
  { drug: "Nitroglycerin", back: "Headache (throbbing), flushing, hypotension, reflex tachycardia, tolerance (long-term)." },
  { drug: "Isosorbide mononitrate", back: "Same as nitroglycerin: headache, dizziness, flushing, hypotension, tolerance." },
  { drug: "Isosorbide dinitrate", back: "Same: headache, hypotension, reflex tachycardia, rash, nausea." },
  { drug: "Nicorandil", back: "Headache, flushing, dizziness, GI ulceration (mouth, perianal, rare), hypotension." },
  { drug: "Fenoldopam", back: "Headache, flushing, hypotension, tachycardia, nausea, hypokalaemia." },
  { drug: "Epoprostenol", back: "Flushing, headache, nausea, diarrhoea, jaw pain, hypotension, thrombocytopaenia." },
  { drug: "Treprostinil", back: "Infusion site pain, headache, nausea, flushing, jaw pain, hypotension." },
  { drug: "Iloprost", back: "Cough, headache, flushing, nausea, jaw pain, hypotension (inhaled)." },
  { drug: "Selexipag", back: "Headache, diarrhoea, jaw pain, nausea, flushing, myalgia." },
  { drug: "Bosentan", back: "Hepatotoxicity (monitor LFTs), headache, flushing, anaemia, oedema, teratogenic." },
  { drug: "Ambrisentan", back: "Peripheral oedema, headache, flushing, hepatotoxicity (less than bosentan), teratogenic." },
  { drug: "Macitentan", back: "Headache, nasopharyngitis, anaemia, oedema, hepatotoxicity (less)." },
  { drug: "Riociguat", back: "Headache, dyspepsia, nausea, diarrhoea, hypotension, haemoptysis (rare)." },
  { drug: "Sildenafil", back: "Headache, flushing, dyspepsia, nasal congestion, visual disturbances (blue tinge), priapism." },
  { drug: "Tadalafil", back: "Headache, back pain, myalgia, flushing, dyspepsia, prolonged erection." },
  { drug: "Vardenafil", back: "Similar to sildenafil: headache, flushing, visual changes, dizziness." },
  { drug: "Alprostadil", back: "Pain at injection site (intracavernosal), priapism, haematoma, urethral bleeding." },
  { drug: "Methylergonovine", back: "Hypertension, nausea, vomiting, headache, seizures (with epidural anaesthesia)." },
  { drug: "Ergotamine", back: "Nausea, vomiting, ergotism (vasospasm, ischaemia, gangrene), headache (rebound)." },
  { drug: "Dihydroergotamine", back: "Same as ergotamine: nausea, vasospasm, chest tightness, myalgia." },
  { drug: "Sumatriptan", back: "Tingling, flushing, chest tightness (non-cardiac), nausea, dizziness, injection site pain." },
  { drug: "Rizatriptan", back: "Same as sumatriptan: dizziness, somnolence, fatigue, paresthesia." },
  { drug: "Eletriptan", back: "Same: asthenia, nausea, dizziness, dry mouth, chest pressure." },
  { drug: "Zolmitriptan", back: "Same: paresthesia, nausea, dizziness, fatigue, throat tightness." },
  { drug: "Naratriptan", back: "Same: nausea, fatigue, paresthesia, dizziness, rarely cardiac events." },
  { drug: "Frovatriptan", back: "Same: dizziness, fatigue, nausea, headache, paresthesia." },
  { drug: "Lasmiditan", back: "Dizziness, fatigue, paresthesia, nausea, sedation (no vasoconstriction)." },
  { drug: "Ubrogepant", back: "Nausea, fatigue, dry mouth, dizziness, somnolence." },
  { drug: "Rimegepant", back: "Nausea, hypersensitivity (rash, dyspnoea), fatigue, dyspepsia." },
  { drug: "Erenumab", back: "Constipation, injection site reaction, muscle cramps, fatigue, rare anaphylaxis." },
  { drug: "Galcanezumab", back: "Injection site reaction, constipation, nausea, fatigue, pruritus." },
  { drug: "Fremanezumab", back: "Same: injection site pain, rash, nausea, dizziness." },
  { drug: "Topiramate", back: "Cognitive dysfunction (word-finding difficulty), paraesthesia, weight loss, metabolic acidosis, nephrolithiasis." },
  { drug: "OnabotulinumtoxinA", back: "Local weakness, ptosis (if injected near eye), dysphagia, headache, flu-like symptoms." }
];
const pharmacokineticsData = [
  { drug: "Warfarin", back: "Oral BA ~100%; protein-bound 99%; CYP2C9 metabolism; t½ 36–42h; renal excretion of metabolites." },
  { drug: "Metformin", back: "Oral BA 50–60%; not protein-bound; not metabolised; t½ 5–6h; renal excretion (active tubular secretion)." },
  { drug: "Omeprazole", back: "Oral BA ~35% (first‑pass); protein-bound 95%; CYP2C19/3A4 metabolism; t½ 1–1.5h; renal excretion of metabolites." },
  { drug: "Atenolol", back: "Oral BA ~50%; low protein binding; minimal metabolism; t½ 6–7h; renal excretion (unchanged)." },
  { drug: "Lisinopril", back: "Oral BA ~25%; protein-bound ~0%; not metabolised; t½ 12h; renal excretion unchanged." },
  { drug: "Furosemide", back: "Oral BA ~60% (variable); protein-bound 95%; glucuronidation; t½ 1.5–2h; renal (unchanged + glucuronide)." },
  { drug: "Ciprofloxacin", back: "Oral BA 70%; protein-bound 20–40%; CYP1A2 (partial); t½ 4–6h; renal (unchanged + metabolites)." },
  { drug: "Salbutamol", back: "Oral BA ~50%; protein-bound ~10%; sulfation; t½ 4–6h; renal excretion." },
  { drug: "Morphine", back: "Oral BA ~25%; protein-bound 35%; UGT2B7 glucuronidation; t½ 2–4h; renal (morphine-3-glucuronide)." },
  { drug: "Amoxicillin", back: "Oral BA ~80%; protein-bound 18%; minimal metabolism; t½ 1–1.5h; renal (unchanged, tubular secretion)." },
  { drug: "Aspirin", back: "Oral BA ~70%; protein-bound 80–90%; esterases + CYP (minor); t½ 15–20min (aspirin), 3–6h (salicylate); renal." },
  { drug: "Digoxin", back: "Oral BA 60–80%; protein-bound 25%; minimal metabolism (some gut flora); t½ 36–48h; renal (unchanged)." },
  { drug: "Heparin", back: "Not absorbed orally; protein-bound (to antithrombin); metabolism by heparinase; t½ 1–2h (UFH); renal (LMWH)." },
  { drug: "Amlodipine", back: "Oral BA ~65%; protein-bound 93%; CYP3A4 metabolism; t½ 30–50h; renal (metabolites)." },
  { drug: "Metoprolol", back: "Oral BA 50%; protein-bound 12%; CYP2D6 metabolism; t½ 3–7h; renal (metabolites)." },
  { drug: "Spironolactone", back: "Oral BA ~90%; protein-bound 90%; CYP3A4 (active metabolites); t½ 1.5h (parent), 16h (canrenone); renal." },
  { drug: "Clopidogrel", back: "Oral BA ~50%; protein-bound 94–98%; CYP2C19/3A4 activation; t½ 6–8h; renal (metabolites)." },
  { drug: "Vancomycin", back: "Oral BA <5% (IV only); protein-bound 55%; minimal metabolism; t½ 6–12h; renal (unchanged)." },
  { drug: "Rifampicin", back: "Oral BA ~95%; protein-bound 80%; deacetylated (liver); t½ 2–4h (inducer, shorter with repeated dose); biliary + renal." },
  { drug: "Paracetamol", back: "Oral BA ~80%; protein-bound 20–25%; glucuronidation/sulfation (CYP2E1 minor); t½ 2–3h; renal (metabolites)." },
  { drug: "Ibuprofen", back: "Oral BA ~100%; protein-bound 99%; CYP2C9 metabolism; t½ 2–4h; renal (metabolites)." },
  { drug: "Ondansetron", back: "Oral BA ~60%; protein-bound 70%; CYP3A4/2D6 metabolism; t½ 4–6h; renal (metabolites)." },
  { drug: "Ramipril", back: "Oral BA ~60% (as ramiprilat); protein-bound 73% (ramiprilat); CYP (minimal); t½ 13–17h (ramiprilat); renal." },
  { drug: "Losartan", back: "Oral BA ~33%; protein-bound 98%; CYP2C9/3A4; t½ 2h (parent), 6–9h (active metabolite); renal + biliary." },
  { drug: "Enalapril", back: "Oral BA ~60% (as enalaprilat); protein-bound 50% (enalaprilat); hydrolysis; t½ 11h (enalaprilat); renal." },
  { drug: "Candesartan", back: "Oral BA ~15%; protein-bound 99%; minimal metabolism; t½ 9h; renal (40%) + biliary (60%)." },
  { drug: "Propranolol", back: "Oral BA ~25%; protein-bound 90%; CYP2D6/1A2; t½ 4–6h; renal (metabolites)." },
  { drug: "Carvedilol", back: "Oral BA ~25%; protein-bound 98%; CYP2D6/2C9; t½ 7–10h; biliary (metabolites)." },
  { drug: "Bisoprolol", back: "Oral BA ~90%; protein-bound 30%; CYP3A4/2D6 (minor); t½ 10–12h; renal (50% unchanged) + biliary." },
  { drug: "Diltiazem", back: "Oral BA ~40%; protein-bound 80%; CYP3A4; t½ 4–6h; renal (metabolites)." },
  { drug: "Verapamil", back: "Oral BA ~20%; protein-bound 90%; CYP3A4; t½ 4–6h; renal (metabolites)." },
  { drug: "Hydrochlorothiazide", back: "Oral BA ~70%; protein-bound 40%; not metabolised; t½ 6–15h; renal unchanged." },
  { drug: "Indapamide", back: "Oral BA ~93%; protein-bound 75%; CYP (extensive); t½ 14–18h; renal (70%) + biliary." },
  { drug: "Atorvastatin", back: "Oral BA ~14%; protein-bound 98%; CYP3A4; t½ 14h (parent), 20–30h (active metabolites); biliary." },
  { drug: "Rosuvastatin", back: "Oral BA ~20%; protein-bound 88%; CYP2C9 (minimal); t½ 19h; biliary (90%) + renal (10%)." },
  { drug: "Ezetimibe", back: "Oral BA ~35%; protein-bound 90%; glucuronidation; t½ 22h (parent), 24h (active glucuronide); biliary + renal." },
  { drug: "Glibenclamide", back: "Oral BA ~100%; protein-bound 99%; CYP2C9; t½ 10h; biliary (50%) + renal (50%)." },
  { drug: "Glipizide", back: "Oral BA ~100%; protein-bound 98%; CYP2C9; t½ 2–4h; renal (metabolites)." },
  { drug: "Pioglitazone", back: "Oral BA ~80%; protein-bound 99%; CYP2C8/3A4; t½ 3–7h (parent), 16–24h (active metabolites); renal + biliary." },
  { drug: "Sitagliptin", back: "Oral BA ~87%; protein-bound 38%; minimal CYP (mostly unchanged); t½ 12h; renal unchanged." },
  { drug: "Empagliflozin", back: "Oral BA ~78%; protein-bound 86%; glucuronidation (UGT); t½ 13h; renal (50% unchanged) + biliary." },
  { drug: "Liraglutide", back: "Oral BA <1% (SC injection); protein-bound 98%; endogenous metabolism; t½ 13h; renal + biliary." },
  { drug: "Phenytoin", back: "Oral BA ~90%; protein-bound 90%; CYP2C9/2C19 (saturable); t½ 7–42h (dose‑dependent); renal (metabolites)." },
  { drug: "Carbamazepine", back: "Oral BA ~80%; protein-bound 75%; CYP3A4 (autoinduction); t½ 25–65h (early), 10–20h (chronic); renal (metabolites)." },
  { drug: "Valproate", back: "Oral BA ~100%; protein-bound 80–90%; glucuronidation, CYP; t½ 9–16h; renal (metabolites)." },
  { drug: "Levetiracetam", back: "Oral BA ~100%; protein-bound <10%; hydrolysis (non‑CYP); t½ 6–8h; renal unchanged (66%)." },
  { drug: "Phenobarbitone", back: "Oral BA ~100%; protein-bound 45%; CYP2C19/2C9 (minor); t½ 50–120h; renal unchanged (25%)." },
  { drug: "Diazepam", back: "Oral BA ~100%; protein-bound 98%; CYP2C19/3A4; t½ 20–70h (active metabolite desmethyldiazepam longer); renal." },
  { drug: "Lorazepam", back: "Oral BA ~90%; protein-bound 85%; glucuronidation (no CYP); t½ 10–20h; renal (glucuronide)." },
  { drug: "Clonazepam", back: "Oral BA ~90%; protein-bound 85%; CYP3A4 (nitro reduction); t½ 18–50h; renal (metabolites)." },
  { drug: "Haloperidol", back: "Oral BA ~60%; protein-bound 92%; CYP3A4/2D6; t½ 12–36h; renal + biliary." },
  { drug: "Risperidone", back: "Oral BA ~70%; protein-bound 90%; CYP2D6; t½ 3h (parent), 24h (active metabolite); renal." },
  { drug: "Olanzapine", back: "Oral BA ~60%; protein-bound 93%; CYP1A2/2D6; t½ 30h; renal + biliary." },
  { drug: "Clozapine", back: "Oral BA ~50%; protein-bound 95%; CYP1A2/3A4/2D6; t½ 12h; renal (metabolites)." },
  { drug: "Fluoxetine", back: "Oral BA ~70%; protein-bound 94%; CYP2D6 (active metabolite norfluoxetine); t½ 4–6 days (parent + metabolite); renal." },
  { drug: "Sertraline", back: "Oral BA ~44%; protein-bound 98%; CYP2B6/2C19/2D6; t½ 24–26h; renal." },
  { drug: "Amitriptyline", back: "Oral BA ~50%; protein-bound 95%; CYP2D6/3A4/1A2 (active metabolite nortriptyline); t½ 10–28h; renal." },
  { drug: "Venlafaxine", back: "Oral BA ~45%; protein-bound 27%; CYP2D6 (active metabolite O‑desmethylvenlafaxine); t½ 5h (parent), 11h (metabolite); renal." },
  { drug: "Lithium", back: "Oral BA ~100%; no protein binding; no metabolism; t½ 18–36h; renal unchanged (reabsorbed in proximal tubule)." },
  { drug: "Donepezil", back: "Oral BA ~100%; protein-bound 96%; CYP2D6/3A4; t½ 70h; renal + biliary." },
  { drug: "Memantine", back: "Oral BA ~100%; protein-bound 45%; minimal metabolism (CYP); t½ 60–80h; renal unchanged." },
  { drug: "Levodopa", back: "Oral BA ~30% (with carbidopa); protein-bound ~10%; aromatic amino acid decarboxylase (peripheral); t½ 1–2h; renal." },
  { drug: "Pramipexole", back: "Oral BA >90%; protein-bound 15%; minimal metabolism (mostly unchanged); t½ 8–12h; renal unchanged." },
  { drug: "Selegiline", back: "Oral BA ~10%; protein-bound 94%; CYP2B6/2C19/2D6 (metabolites: amphetamine); t½ 1–2h; renal." },
  { drug: "Amoxicillin-Clavulanate", back: "Amoxicillin: same as above; clavulanate: oral BA ~60%, protein-bound 20%, t½ 1h, renal." },
  { drug: "Piperacillin-Tazobactam", back: "Piperacillin: protein-bound 30%, t½ 1h, renal; tazobactam: t½ 1h, renal; both not orally absorbed." },
  { drug: "Meropenem", back: "IV only; protein-bound 2%; renal excretion (unchanged); t½ 1h (prolonged in renal failure)." },
  { drug: "Azithromycin", back: "Oral BA ~38%; protein-bound 50%; CYP3A4 (minimal); t½ 68h (tissue accumulation); biliary (unchanged)." },
  { drug: "Erythromycin", back: "Oral BA ~35%; protein-bound 70%; CYP3A4 (inhibitor); t½ 1.5–2h; biliary (unchanged)." },
  { drug: "Doxycycline", back: "Oral BA ~95%; protein-bound 90%; minimal metabolism; t½ 16–24h; renal + biliary." },
  { drug: "Clindamycin", back: "Oral BA ~90%; protein-bound 94%; CYP3A4 (partial); t½ 2–3h; biliary (10%) + renal (10%)." },
  { drug: "Gentamicin", back: "IV/IM only; protein-bound <30%; no metabolism; t½ 2–3h (prolonged in renal failure); renal unchanged." },
  { drug: "Trimethoprim", back: "Oral BA ~100%; protein-bound 45%; CYP (minor); t½ 8–11h; renal (60% unchanged)." },
  { drug: "Co-trimoxazole", back: "Trimethoprim + sulfamethoxazole: both oral BA ~100%; protein-bound TMP 45%, SMX 70%; t½ TMP 10h, SMX 10h; renal." },
  { drug: "Metronidazole", back: "Oral BA ~100%; protein-bound 20%; CYP2A6 (oxidation); t½ 6–8h; renal (60% metabolites)." },
  { drug: "Fluconazole", back: "Oral BA ~90%; protein-bound 12%; minimal metabolism (CYP2C9/2C19); t½ 30h; renal (80% unchanged)." },
  { drug: "Amphotericin B", back: "Oral BA <5% (IV only); protein-bound 90%; unknown metabolism; t½ 15 days (terminal); biliary + renal (slow)." },
  { drug: "Acyclovir", back: "Oral BA 15–30%; protein-bound 15%; minimal (converted to inactive by alcohol dehydrogenase?); t½ 2.5–3h; renal unchanged." },
  { drug: "Oseltamivir", back: "Oral BA ~80%; protein-bound 3%; hepatic esterase (to active oseltamivir carboxylate); t½ 1–3h (parent), 6–10h (active); renal." },
  { drug: "Zidovudine (AZT)", back: "Oral BA ~65%; protein-bound 35%; glucuronidation (UGT2B7); t½ 1h; renal (glucuronide)." },
  { drug: "Tenofovir", back: "Oral BA ~25% (as TDF); protein-bound <1%; not metabolised (prodrug activated); t½ 17h; renal unchanged." },
  { drug: "Efavirenz", back: "Oral BA ~50%; protein-bound 99%; CYP2B6 (major), 3A4; t½ 40–55h; biliary + renal." },
  { drug: "Lopinavir", back: "Oral BA ~60% (with ritonavir); protein-bound 98%; CYP3A4; t½ 5–6h; biliary." },
  { drug: "Dexamethasone", back: "Oral BA ~80%; protein-bound 77%; CYP3A4; t½ 3–4h; renal (metabolites)." },
  { drug: "Prednisolone", back: "Oral BA ~80%; protein-bound 70%; CYP3A4 (to prednisone and others); t½ 2–4h; renal." },
  { drug: "Fludrocortisone", back: "Oral BA ~100%; protein-bound ~50%; CYP3A4; t½ 1.5–3h; renal." },
  { drug: "Azathioprine", back: "Oral BA ~60%; protein-bound 30%; non‑enzymatic conversion to 6‑MP (then XO, TPMT); t½ 0.5–1h; renal (thiouric acid)." },
  { drug: "Cyclosporin", back: "Oral BA ~30%; protein-bound 90%; CYP3A4; t½ 8–24h (variable); biliary (metabolites)." },
  { drug: "Tacrolimus", back: "Oral BA ~20%; protein-bound 99%; CYP3A4/5; t½ 12–16h; biliary." },
  { drug: "Mycophenolate", back: "Oral BA ~94%; protein-bound 97%; glucuronidation (UGT1A9); t½ 12–18h; renal (glucuronide)." },
  { drug: "Infliximab", back: "IV only; protein-bound (to TNF); proteolysis; t½ 9–10 days; renal/biliary (peptides)." },
  { drug: "Adalimumab", back: "SC/IV; protein-bound; proteolysis; t½ 10–20 days; renal/biliary." },
  { drug: "Rituximab", back: "IV only; protein-bound; proteolysis; t½ 22–32 days; renal/biliary." },
  { drug: "Trastuzumab", back: "IV; protein-bound; proteolysis; t½ 5–28 days; renal/biliary." },
  { drug: "Imatinib", back: "Oral BA ~98%; protein-bound 95%; CYP3A4 (major), 2D6; t½ 18h (parent), 40h (active metabolite); biliary." },
  { drug: "Cyclophosphamide", back: "Oral BA >75%; protein-bound 12–20%; CYP2B6/3A4 (activation); t½ 4–8h; renal (metabolites)." },
  { drug: "Cisplatin", back: "IV only; protein-bound >90%; non‑enzymatic hydrolysis; t½ 30h (terminal); renal (unchanged)." },
  { drug: "Doxorubicin", back: "IV only; protein-bound 70%; CYP3A4 (reduction to doxorubicinol); t½ 20–48h; biliary (metabolites)." },
  { drug: "Tamoxifen", back: "Oral BA ~100%; protein-bound 99%; CYP2D6/3A4 (to active endoxifen); t½ 5–7 days; biliary (metabolites)." },
  { drug: "Anastrozole", back: "Oral BA ~80%; protein-bound 40%; CYP3A4 (minor); t½ 40–50h; biliary (metabolites)." },
  { drug: "Allopurinol", back: "Oral BA ~90%; protein-bound negligible; CYP (to oxypurinol); t½ 1–2h (parent), 14–30h (oxypurinol); renal." },
  { drug: "Colchicine", back: "Oral BA ~45%; protein-bound 35%; CYP3A4 (major), glucuronidation; t½ 20–40h; biliary (60%) + renal (20%)." },
  { drug: "Omalizumab", back: "SC only; protein-bound; proteolysis; t½ 26 days; biliary/renal." },
  { drug: "Montelukast", back: "Oral BA ~64%; protein-bound 99%; CYP2C8/3A4; t½ 2.5–5.5h; biliary (metabolites)." },
  { drug: "Theophylline", back: "Oral BA ~96%; protein-bound 40%; CYP1A2/2E1/3A4; t½ 8h (adults), 30h (neonates); renal (10% unchanged)." },
  { drug: "Ipratropium", back: "Inhaled/oral not absorbed; IV: protein-bound <20%; minimal metabolism; t½ 2h; renal unchanged." },
  { drug: "Tiotropium", back: "Inhaled; oral BA ~2%; protein-bound 72%; CYP2D6/3A4 (minor); t½ 5–6 days (terminal); renal." },
  { drug: "Acetazolamide", back: "Oral BA ~100%; protein-bound 70%; not metabolised; t½ 10–15h; renal unchanged." },
  { drug: "Mannitol", back: "IV only; no protein binding; no metabolism; t½ 1.5h; renal unchanged." },
  { drug: "Amiloride", back: "Oral BA ~50%; protein-bound negligible; not metabolised; t½ 6–9h; renal unchanged." },
  { drug: "Triamterene", back: "Oral BA ~50%; protein-bound 60%; CYP (to active sulfate metabolite); t½ 2–4h (parent), 12h (metabolite); renal." },
  { drug: "Chlorthalidone", back: "Oral BA ~65%; protein-bound 75%; minimal metabolism; t½ 40–50h; renal unchanged." },
  { drug: "Metolazone", back: "Oral BA ~65%; protein-bound 95%; minimal metabolism; t½ 6–20h; renal + biliary." },
  { drug: "Torasemide", back: "Oral BA ~80%; protein-bound 99%; CYP2C9 (to metabolites); t½ 3–4h; renal (20% unchanged) + biliary." },
  { drug: "Bumetanide", back: "Oral BA ~80%; protein-bound 95%; glucuronidation; t½ 1–1.5h; renal (unchanged + glucuronide)." },
  { drug: "Dabigatran", back: "Oral BA ~6% (as prodrug dabigatran etexilate); protein-bound 35%; esterase (to active dabigatran); t½ 12–17h; renal (80% unchanged)." },
  { drug: "Rivaroxaban", back: "Oral BA ~80%; protein-bound 92%; CYP3A4/2J2 (partial); t½ 5–9h (young), 11–13h (elderly); renal (36% unchanged) + biliary." },
  { drug: "Apixaban", back: "Oral BA ~50%; protein-bound 87%; CYP3A4 (minor); t½ 12h; renal (25% unchanged) + biliary." },
  { drug: "Edoxaban", back: "Oral BA ~62%; protein-bound 55%; CYP3A4 (minor); t½ 10–14h; renal (35% unchanged) + biliary." },
  { drug: "Enoxaparin", back: "SC only; protein-bound (to antithrombin); metabolism by desulfation; t½ 4–5h; renal (10–20% unchanged)." },
  { drug: "Fondaparinux", back: "SC only; protein-bound (to antithrombin); minimal metabolism; t½ 17–21h; renal unchanged." },
  { drug: "Bivalirudin", back: "IV only; protein-bound 0%; proteolysis (thrombin) + renal; t½ 25min (normal), 1h (severe renal failure)." },
  { drug: "Argatroban", back: "IV only; protein-bound 54%; CYP3A4 (metabolites); t½ 40–50min; biliary (65%) + renal (22%)." },
  { drug: "Ticagrelor", back: "Oral BA ~36%; protein-bound 99%; CYP3A4 (active metabolite); t½ 7h (parent), 9h (metabolite); biliary + renal." },
  { drug: "Prasugrel", back: "Oral BA ~80% (active metabolite); protein-bound 98%; CYP3A4/2B6 (activation); t½ 7h (active metabolite); renal (68% metabolites)." },
  { drug: "Ticlopidine", back: "Oral BA ~80%; protein-bound 98%; CYP2C19 (activation); t½ 24–36h; renal (60% metabolites)." },
  { drug: "Dipyridamole", back: "Oral BA ~50%; protein-bound 99%; glucuronidation; t½ 10–12h; biliary (metabolites)." },
  { drug: "Cilostazol", back: "Oral BA ~80%; protein-bound 95%; CYP3A4/2C19 (to active metabolites); t½ 11–13h; renal (30%) + biliary (70%)." },
  { drug: "Streptokinase", back: "IV only; protein-bound; neutralised by antibodies; t½ 20–30min; renal (metabolites)." },
  { drug: "Alteplase", back: "IV only; protein-bound; hepatic clearance (via mannose receptor); t½ 4–5min; renal (minor)." },
  { drug: "Tenecteplase", back: "IV only; protein-bound; hepatic; t½ 17min; renal." },
  { drug: "Reteplase", back: "IV only; protein-bound; hepatic/renal; t½ 13–16min; renal." },
  { drug: "Tranexamic acid", back: "Oral BA ~30%; protein-bound 3%; minimal metabolism; t½ 2–3h; renal unchanged." },
  { drug: "Aminocaproic acid", back: "Oral BA ~100%; protein-bound 0%; minimal metabolism; t½ 2h; renal unchanged." },
  { drug: "Protamine sulfate", back: "IV only; protein-bound (to heparin); proteolysis; t½ 5–10min; renal." },
  { drug: "Vitamin K (phytonadione)", back: "Oral BA ~80%; protein-bound 0%; CYP (to epoxide); t½ 1–2h; biliary + renal." },
  { drug: "Idarucizumab", back: "IV only; protein-bound; proteolysis; t½ 30min (initial), 8h (terminal); renal (unchanged)." },
  { drug: "Andexanet alfa", back: "IV only; protein-bound; proteolysis; t½ 1h; renal (unchanged)." },
  { drug: "Naloxone", back: "Oral BA <2% (IV/IM); protein-bound 45%; glucuronidation; t½ 1–1.5h; renal (glucuronide)." },
  { drug: "Naltrexone", back: "Oral BA ~20%; protein-bound 21%; CYP (to 6-β-naltrexol); t½ 4h (parent), 13h (metabolite); renal." },
  { drug: "Buprenorphine", back: "Sublingual BA ~30%; protein-bound 96%; CYP3A4 (to norbuprenorphine); t½ 24–48h; biliary (unchanged)." },
  { drug: "Methadone", back: "Oral BA ~80%; protein-bound 85%; CYP3A4/2B6/2D6; t½ 15–55h; renal (metabolites) + biliary." },
  { drug: "Fentanyl", back: "Oral BA <30% (transdermal/IV); protein-bound 84%; CYP3A4; t½ 2–4h (IV); biliary (metabolites)." },
  { drug: "Oxycodone", back: "Oral BA ~80%; protein-bound 45%; CYP2D6 (to oxymorphone), 3A4; t½ 3–5h; renal (metabolites)." },
  { drug: "Hydromorphone", back: "Oral BA ~30%; protein-bound 20%; glucuronidation; t½ 2–3h; renal (glucuronide)." },
  { drug: "Tramadol", back: "Oral BA ~75%; protein-bound 20%; CYP2D6 (to active O‑desmethyltramadol), 3A4; t½ 6h (parent), 7h (metabolite); renal." },
  { drug: "Tapentadol", back: "Oral BA ~32%; protein-bound 20%; glucuronidation; t½ 4h; renal (95% metabolites)." },
  { drug: "Codeine", back: "Oral BA ~50%; protein-bound 7%; CYP2D6 (to morphine), 3A4; t½ 3h; renal (metabolites)." },
  { drug: "Dihydrocodeine", back: "Oral BA ~40%; protein-bound 20%; CYP2D6; t½ 4h; renal." },
  { drug: "Meperidine", back: "Oral BA ~50%; protein-bound 65%; CYP3A4 (to normeperidine); t½ 3–5h; renal." },
  { drug: "Loperamide", back: "Oral BA ~0.3%; protein-bound 95%; CYP3A4 (P‑gp efflux); t½ 10h; biliary (unchanged)." },
  { drug: "Flumazenil", back: "IV only; protein-bound 50%; CYP (oxidation); t½ 1h; renal (metabolites)." },
  { drug: "Zolpidem", back: "Oral BA ~70%; protein-bound 92%; CYP3A4/2C9; t½ 2–3h; renal (metabolites)." },
  { drug: "Eszopiclone", back: "Oral BA ~80%; protein-bound 55%; CYP3A4/2E1; t½ 6h; renal (75%) + biliary." },
  { drug: "Zaleplon", back: "Oral BA ~30%; protein-bound 60%; CYP3A4 (aldehyde oxidase); t½ 1h; renal (metabolites)." },
  { drug: "Ramelteon", back: "Oral BA <2%; protein-bound 80%; CYP1A2 (major), 2C9/3A4; t½ 1–2h; renal (metabolites)." },
  { drug: "Suvorexant", back: "Oral BA ~80%; protein-bound 99%; CYP3A4; t½ 12h; biliary + renal." },
  { drug: "Modafinil", back: "Oral BA ~90%; protein-bound 60%; CYP3A4 (to modafinil acid), 2C19; t½ 15h; renal (metabolites)." },
  { drug: "Methylphenidate", back: "Oral BA ~30% (variable); protein-bound 15%; esterases (to ritalinic acid); t½ 3–4h; renal (metabolites)." },
  { drug: "Amphetamine", back: "Oral BA ~75%; protein-bound 20%; CYP2D6; t½ 10–13h; renal (unchanged, pH‑dependent)." },
  { drug: "Lisdexamfetamine", back: "Oral BA ~96% (as dextroamphetamine); protein-bound ~20%; hydrolysis (RBC); t½ <1h (prodrug), 10–13h (active); renal." },
  { drug: "Atomoxetine", back: "Oral BA ~63%; protein-bound 98%; CYP2D6; t½ 5h (extensive metabolisers), 22h (poor metabolisers); renal." },
  { drug: "Guanfacine", back: "Oral BA ~80%; protein-bound 70%; CYP3A4; t½ 17h; renal (metabolites)." },
  { drug: "Clonidine", back: "Oral BA ~75%; protein-bound 20%; CYP (minor); t½ 12–16h; renal (60% unchanged)." },
  { drug: "Dexmedetomidine", back: "IV only; protein-bound 94%; CYP2A6 (glucuronidation); t½ 2h; renal (95% metabolites)." },
  { drug: "Baclofen", back: "Oral BA ~75%; protein-bound 30%; minimal metabolism; t½ 2–4h; renal unchanged (80%)." },
  { drug: "Tizanidine", back: "Oral BA ~40%; protein-bound 30%; CYP1A2; t½ 2.5h; renal (metabolites)." },
  { drug: "Dantrolene", back: "Oral BA ~70%; protein-bound ~80%; CYP (to 5‑hydroxydantrolene); t½ 9h; renal + biliary." },
  { drug: "Botulinum toxin", back: "IM/SC only; no systemic absorption; local degradation; t½ at nerve terminal ~2–3 months." },
  { drug: "Neostigmine", back: "Oral BA <5% (IV/IM); protein-bound 15%; esterases + CYP; t½ 1–2h; renal unchanged + metabolites." },
  { drug: "Pyridostigmine", back: "Oral BA ~15%; protein-bound negligible; esterases; t½ 3–4h; renal unchanged (80%)." },
  { drug: "Edrophonium", back: "IV only; protein-bound negligible; esterases; t½ 2min; renal (unchanged)." },
  { drug: "Atropine", back: "Oral BA ~25%; protein-bound 18%; CYP (minor); t½ 2–4h; renal unchanged (50%)." },
  { drug: "Glycopyrrolate", back: "Oral BA ~10%; protein-bound ~40%; minimal metabolism; t½ 1–2h; renal unchanged." },
  { drug: "Scopolamine", back: "Oral BA ~30%; protein-bound 10%; CYP3A4; t½ 5h; renal (unchanged + metabolites)." },
  { drug: "Pilocarpine", back: "Oral BA ~90%; protein-bound negligible; esterases; t½ 1h; renal (unchanged)." },
  { drug: "Cevimeline", back: "Oral BA ~30%; protein-bound 20%; CYP2D6/3A4; t½ 4–5h; renal." },
  { drug: "Bethanechol", back: "Oral BA ~10%; protein-bound negligible; minimal metabolism; t½ 1h; renal unchanged." },
  { drug: "Carbachol", back: "Topical only (ophthalmic); systemic absorption minimal; t½ <1h." },
  { drug: "Physostigmine", back: "Oral BA ~10%; protein-bound 30%; esterases; t½ 1–2h; renal (metabolites)." },
  { drug: "Pralidoxime", back: "IM/IV only; protein-bound negligible; minimal metabolism; t½ 1–2h; renal unchanged (80%)." },
  { drug: "Epinephrine", back: "SC/IM/IV; protein-bound 15%; COMT + MAO; t½ 2–3min; renal (metabolites)." },
  { drug: "Norepinephrine", back: "IV only; protein-bound 20%; COMT + MAO; t½ 2–3min; renal (metabolites)." },
  { drug: "Dopamine", back: "IV only; protein-bound ~0%; COMT + MAO; t½ 2min; renal (metabolites)." },
  { drug: "Dobutamine", back: "IV only; protein-bound 25%; COMT; t½ 2min; renal (metabolites)." },
  { drug: "Isoproterenol", back: "IV only; protein-bound 0%; COMT; t½ 2–5min; renal (metabolites)." },
  { drug: "Phenylephrine", back: "Oral BA ~38%; protein-bound 0%; MAO; t½ 2–3h; renal (sulfate conjugates)." },
  { drug: "Midodrine", back: "Oral BA ~93% (active metabolite); protein-bound ~20%; hydrolysis; t½ 0.5h (prodrug), 3h (active); renal." },
  { drug: "Methyldopa", back: "Oral BA ~50%; protein-bound 15%; decarboxylation (to methylnorepinephrine); t½ 1–2h; renal (metabolites)." },
  { drug: "Prazosin", back: "Oral BA ~60%; protein-bound 97%; CYP3A4; t½ 2–3h; biliary + renal (metabolites)." },
  { drug: "Doxazosin", back: "Oral BA ~65%; protein-bound 98%; CYP3A4/2C19; t½ 20h; biliary (metabolites)." },
  { drug: "Terazosin", back: "Oral BA ~90%; protein-bound 95%; minimal metabolism; t½ 12h; renal (unchanged + metabolites)." },
  { drug: "Tamsulosin", back: "Oral BA ~100%; protein-bound 99%; CYP2D6/3A4; t½ 14–15h; renal (metabolites)." },
  { drug: "Alfuzosin", back: "Oral BA ~50%; protein-bound 90%; CYP3A4; t½ 10h; biliary (metabolites)." },
  { drug: "Silodosin", back: "Oral BA ~30%; protein-bound 97%; CYP3A4/2D6; t½ 11h; renal (unchanged + metabolites)." },
  { drug: "Phentolamine", back: "IV/IM only; protein-bound 50%; CYP; t½ 20min; renal (metabolites)." },
  { drug: "Phenoxybenzamine", back: "Oral BA ~30%; protein-bound 80%; CYP; t½ 24h (irreversible binding); renal + biliary." },
  { drug: "Yohimbine", back: "Oral BA ~20%; protein-bound 80%; CYP3A4/2D6; t½ 0.5–1h; renal (metabolites)." },
  { drug: "Labetalol", back: "Oral BA ~25%; protein-bound 50%; glucuronidation; t½ 6–8h; renal (60% metabolites)." },
  { drug: "Nebivolol", back: "Oral BA ~12% (extensive metabolisers); protein-bound 98%; CYP2D6 (to active metabolites); t½ 10h (extensive), 30h (poor); renal." },
  { drug: "Betaxolol", back: "Oral BA ~90%; protein-bound 50%; CYP2D6; t½ 14–22h; renal (80% unchanged)." },
  { drug: "Carteolol", back: "Oral BA ~85%; protein-bound 25%; minimal metabolism; t½ 5–7h; renal (50% unchanged)." },
  { drug: "Pindolol", back: "Oral BA ~90%; protein-bound 40%; CYP2D6 (partial); t½ 3–4h; renal (60% unchanged)." },
  { drug: "Acebutolol", back: "Oral BA ~40%; protein-bound 26%; CYP2D6 (to active metabolite); t½ 3–4h (parent), 8–12h (metabolite); renal." },
  { drug: "Esmolol", back: "IV only; protein-bound 55%; esterases (RBC); t½ 9min; renal (metabolites)." },
  { drug: "Sotalol", back: "Oral BA ~100%; protein-bound 0%; no metabolism; t½ 12h; renal unchanged." },
  { drug: "Amiodarone", back: "Oral BA ~50%; protein-bound 96%; CYP3A4/2C8 (active metabolite desethylamiodarone); t½ 20–100 days; biliary (metabolites)." },
  { drug: "Dronedarone", back: "Oral BA ~15%; protein-bound 98%; CYP3A4; t½ 13–19h; biliary (metabolites)." },
  { drug: "Procainamide", back: "Oral BA ~80%; protein-bound 15%; CYP2D6 (to NAPA active metabolite); t½ 3h (parent), 6h (NAPA); renal." },
  { drug: "Quinidine", back: "Oral BA ~80%; protein-bound 85%; CYP3A4; t½ 6–8h; renal (20% unchanged)." },
  { drug: "Disopyramide", back: "Oral BA ~80%; protein-bound 50%; CYP3A4 (to N‑desisopropyldisopyramide); t½ 5–10h; renal (50% unchanged)." },
  { drug: "Lidocaine", back: "IV only (oral BA <30%); protein-bound 70%; CYP3A4/1A2; t½ 1.5–2h; renal (metabolites)." },
  { drug: "Mexiletine", back: "Oral BA ~90%; protein-bound 60%; CYP2D6/1A2; t½ 10–12h; renal (metabolites)." },
  { drug: "Flecainide", back: "Oral BA ~95%; protein-bound 40%; CYP2D6 (minor); t½ 12–27h; renal (30% unchanged)." },
  { drug: "Propafenone", back: "Oral BA ~50%; protein-bound 95%; CYP2D6 (to active metabolite); t½ 4–8h (extensive), 12–20h (poor); renal." },
  { drug: "Adenosine", back: "IV only; protein-bound negligible; rapid cellular uptake; t½ <10sec; renal (metabolites)." },
  { drug: "Ivabradine", back: "Oral BA ~40%; protein-bound 70%; CYP3A4; t½ 2h (parent), 11h (active metabolite); biliary + renal." },
  { drug: "Ranolazine", back: "Oral BA ~50%; protein-bound 62%; CYP3A4/2D6; t½ 7h; renal (metabolites)." },
  { drug: "Hydralazine", back: "Oral BA ~30%; protein-bound 87%; acetylation (NAT2); t½ 2–4h; renal (acetylated metabolites)." },
  { drug: "Minoxidil", back: "Oral BA ~100%; protein-bound 0%; glucuronidation; t½ 4h; renal (metabolites)." },
  { drug: "Sodium nitroprusside", back: "IV only; protein-bound 0%; non‑enzymatic (cyanide); t½ 2min (parent), 1h (cyanide); renal (thiocyanate)." },
  { drug: "Nitroglycerin", back: "Oral BA <1% (sublingual/transdermal); protein-bound 60%; glutathione S‑transferase; t½ 1–3min; renal (metabolites)." },
  { drug: "Isosorbide mononitrate", back: "Oral BA ~100%; protein-bound <5%; minimal metabolism; t½ 5h; renal (metabolites)." },
  { drug: "Isosorbide dinitrate", back: "Oral BA ~25%; protein-bound 28%; CYP (to mononitrate); t½ 1h (parent), 4h (metabolite); renal." },
  { drug: "Nicorandil", back: "Oral BA ~75%; protein-bound 0%; CYP (to denitrated metabolites); t½ 1h; renal (metabolites)." },
  { drug: "Fenoldopam", back: "IV only; protein-bound 85%; CYP (sulfation); t½ 5min; renal (metabolites)." },
  { drug: "Epoprostenol", back: "IV only; protein-bound 0%; non‑enzymatic (pH); t½ 2–3min; renal (metabolites)." },
  { drug: "Treprostinil", back: "SC/IV/Inhaled; protein-bound 91%; CYP2C8; t½ 4h; renal (unchanged + metabolites)." },
  { drug: "Iloprost", back: "Inhaled/IV; protein-bound 60%; CYP (β‑oxidation); t½ 20–30min; renal (metabolites)." },
  { drug: "Selexipag", back: "Oral BA ~50%; protein-bound 99%; esterase (to active metabolite); t½ 6–8h (parent), 8h (metabolite); renal + biliary." },
  { drug: "Bosentan", back: "Oral BA ~50%; protein-bound 98%; CYP3A4/2C9 (inducer); t½ 5h; biliary (metabolites)." },
  { drug: "Ambrisentan", back: "Oral BA ~100%; protein-bound 99%; CYP3A4/2C19; t½ 9h; biliary + renal (metabolites)." },
  { drug: "Macitentan", back: "Oral BA ~75%; protein-bound 99%; CYP3A4 (to active metabolite); t½ 16h (parent), 48h (metabolite); biliary + renal." },
  { drug: "Riociguat", back: "Oral BA ~40%; protein-bound 95%; CYP3A4/2C8 (to demethylated); t½ 7h (parent), 10h (metabolite); renal + biliary." },
  { drug: "Sildenafil", back: "Oral BA ~40%; protein-bound 96%; CYP3A4/2C9; t½ 4h; biliary (metabolites)." },
  { drug: "Tadalafil", back: "Oral BA ~80%; protein-bound 94%; CYP3A4; t½ 18h; biliary (metabolites)." },
  { drug: "Vardenafil", back: "Oral BA ~15%; protein-bound 95%; CYP3A4/2C9; t½ 4–5h; biliary (metabolites)." },
  { drug: "Alprostadil", back: "IV/intracavernosal; protein-bound 70%; rapid oxidation; t½ 0.5–1min; renal (metabolites)." },
  { drug: "Methylergonovine", back: "Oral BA ~60%; protein-bound 60%; CYP3A4; t½ 2h; biliary + renal." },
  { drug: "Ergotamine", back: "Oral BA <10%; protein-bound 95%; CYP3A4; t½ 2h; biliary (metabolites)." },
  { drug: "Dihydroergotamine", back: "Oral BA ~30%; protein-bound 93%; CYP3A4; t½ 6h; biliary (metabolites)." },
  { drug: "Sumatriptan", back: "Oral BA ~15%; protein-bound 20%; MAO-A; t½ 2h; renal (metabolites)." },
  { drug: "Rizatriptan", back: "Oral BA ~45%; protein-bound 14%; MAO-A; t½ 2–3h; renal (metabolites)." },
  { drug: "Eletriptan", back: "Oral BA ~50%; protein-bound 85%; CYP3A4; t½ 4h; biliary (metabolites)." },
  { drug: "Zolmitriptan", back: "Oral BA ~40%; protein-bound 25%; CYP1A2/MAO-A; t½ 3h; renal (metabolites)." },
  { drug: "Naratriptan", back: "Oral BA ~70%; protein-bound 30%; CYP (multiple); t½ 6h; renal (metabolites)." },
  { drug: "Frovatriptan", back: "Oral BA ~30%; protein-bound 15%; CYP1A2; t½ 26h; renal (metabolites)." },
  { drug: "Lasmiditan", back: "Oral BA ~40%; protein-bound 60%; CYP2C9/3A4; t½ 5–6h; renal (metabolites)." },
  { drug: "Ubrogepant", back: "Oral BA ~60%; protein-bound 87%; CYP3A4; t½ 5–7h; biliary + renal." },
  { drug: "Rimegepant", back: "Oral BA ~64%; protein-bound 80%; CYP3A4; t½ 11h; biliary + renal." },
  { drug: "Erenumab", back: "SC only; protein-bound; proteolysis; t½ 28 days; biliary/renal." },
  { drug: "Galcanezumab", back: "SC only; protein-bound; proteolysis; t½ 27 days; biliary/renal." },
  { drug: "Fremanezumab", back: "SC only; protein-bound; proteolysis; t½ 31 days; biliary/renal." },
  { drug: "Topiramate", back: "Oral BA ~80%; protein-bound 15%; minimal metabolism; t½ 21h; renal (70% unchanged)." },
  { drug: "OnabotulinumtoxinA", back: "IM only; local; t½ at nerve terminal ~2–3 months; systemic clearance unknown." }
];

const pharmacodynamicsData = [
  { "drug": "Warfarin", "back": "Onset 8–12h; peak 48–72h. Effect outlasts drug (depletion of factors). Narrow TI (INR 2–3). Many drug/food interactions via CYP2C9." },
  { "drug": "Metformin", "back": "No insulin secretion → no hypoglycaemia alone. Reduces FPG primarily. No tolerance. Modest ~1.5% HbA1c reduction." },
  { "drug": "Furosemide", "back": "Dose-dependent diuresis; ceiling dose concept. Effective in renal impairment unlike thiazides. IV onset 5–15 min." },
  { "drug": "Morphine", "back": "Analgesia via μ-receptor in CNS and periphery. Tolerance develops rapidly. Reversal by naloxone (competitive antagonist)." },
  { "drug": "Salbutamol", "back": "Bronchodilation onset 5 min; peak 30–60 min; duration 4–6h. Tachyphylaxis with overuse. No anti-inflammatory effect." },
  { "drug": "Lisinopril", "back": "Antihypertensive peak 6–8h. Cardioprotective in HFrEF (reduces preload + afterload). Nephroprotective in diabetic nephropathy." },
  { "drug": "Atenolol", "back": "Negative chronotropy + inotropy; reduces CO and renin. β₁ selectivity lost at high doses. No ISA." },
  { "drug": "Ciprofloxacin", "back": "Concentration-dependent killing (AUC/MIC, Cmax/MIC are PD indices). Post-antibiotic effect. Resistance: gyrase mutation or efflux." },
  { "drug": "Omeprazole", "back": "Irreversible PPI — acid suppression outlasts drug elimination. Full effect 3–5 days. Take 30 min before meals for maximum effect." },
  { "drug": "Simvastatin", "back": "LDL reduction ~35–45%; pleiotropic benefits. Evening dosing optimal (hepatic cholesterol synthesis peaks at night)." },
  { "drug": "Methotrexate", "back": "Anti-inflammatory effect via adenosine at low doses. Clinical benefit in RA delayed 4–6 weeks. Weekly dosing + folate." },
  { "drug": "Amoxicillin", "back": "Time-dependent bactericidal (%T>MIC is PD index). No post-antibiotic effect. Best with frequent dosing or prolonged infusion." },
  { "drug": "Aspirin", "back": "Antiplatelet effect irreversible for platelet lifespan (7–10 days). Antiplatelet dose 75–150 mg; analgesic 300–900 mg." },
  { "drug": "Digoxin", "back": "Positive inotropy + negative chronotropy. Narrow TW (0.5–2.0 ng/mL). Toxicity aggravated by hypokalaemia." },
  { "drug": "Heparin", "back": "Immediate anticoagulant effect. Monitored by aPTT (UFH) or anti-Xa (LMWH). Reversed by protamine sulphate." },
  { "drug": "Vancomycin", "back": "Time-dependent killing (AUC/MIC is PD index). Reserve for MRSA and resistant gram-positives. AUC/MIC target ≥400." },
  { "drug": "Amlodipine", "back": "Gradual antihypertensive (days–weeks due to long t½). Less reflex tachycardia than nifedipine. Well tolerated in elderly." },
  { "drug": "Spironolactone", "back": "Onset 2–3 days (aldosterone receptor interaction). Evidence in HF (RALES: ↓mortality 30%). Also primary hyperaldosteronism." },
  { "drug": "Rifampicin", "back": "Bactericidal against M. tuberculosis. Must be combined (resistance prevention). CYP inducer — reduces co-administered drug levels." },
  { "drug": "Ibuprofen", "back": "Analgesic/anti-inflammatory onset 30–60 min. Renal PG inhibition → risk in elderly, dehydrated, or renal impairment patients." },
  { "drug": "Paracetamol", "back": "Antipyresis via hypothalamic action. Central analgesic. No anti-inflammatory action. Safe in renal impairment (unlike NSAIDs)." },
  { "drug": "Clopidogrel", "back": "Antiplatelet onset 2–6h (prodrug). Maximal effect 3–7 days. Variable response (poor CYP2C19 metabolisers). Irreversible effect." },
  { "drug": "Ondansetron", "back": "Prevents acute chemotherapy-induced emesis (0–24h). Less effective against delayed emesis. Give prophylactically before chemotherapy." },
  { "drug": "Metoprolol", "back": "Cardioselective β₁ blocker; loses selectivity at high doses. Reduces mortality in stable CHF (MERIT-HF). Start low, titrate up." },
  { "drug": "Losartan", "back": "Antihypertensive peak at 6h. Renoprotective in type 2 DM + nephropathy (RENAAL trial). Uricosuric property (lowers uric acid)." },
  { "drug": "Ramipril", "back": "Cardioprotective post-MI (HOPE trial — ↓cardiovascular events). Reduces microalbuminuria. Onset of BP effect ~1–2 weeks." },
  { "drug": "Atorvastatin", "back": "High-intensity statin — ↓LDL 40–60%. Pleiotropic effects (anti-inflammatory). Benefits in ACS shown within 30 days (MIRACL)." },
  { "drug": "Gentamicin", "back": "Concentration-dependent killing (Cmax/MIC is key PD index). Extended interval dosing exploits PAE and Cmax/MIC. TDM essential." },
  { "drug": "Dexamethasone", "back": "Potent anti-inflammatory; 25× more potent than hydrocortisone. Reduces ICP (brain oedema), used in COVID-19 severe disease (RECOVERY)." },
  { "drug": "Prednisolone", "back": "Dose-dependent immunosuppression. Low-dose (≤7.5 mg/day) maintenance less HPA suppression. Biological effect outlasts plasma t½." },
  { "drug": "Phenytoin", "back": "Use-dependent Na⁺ channel blockade → most effective during high-frequency firing. Zero-order kinetics at therapeutic range → unpredictable." },
  { "drug": "Valproate", "back": "Broad-spectrum antiepileptic. Inhibits GABA-T (↑GABA) + Na⁺/Ca²⁺ channel blockade. Used in absence, myoclonic, tonic-clonic, bipolar." },
  { "drug": "Diazepam", "back": "Anxiolysis at low doses; anticonvulsant and muscle relaxation at higher doses. Tolerance develops rapidly. Avoid long-term use." },
  { "drug": "Carbamazepine", "back": "Use-dependent Na⁺ channel block. Autoinduction requires dose titration. First-line for focal seizures and trigeminal neuralgia." },
  { "drug": "Lithium", "back": "Narrow TI (serum level 0.6–1.2 mmol/L). Prevents both manic and depressive episodes. Renoprotective hydration essential." },
  { "drug": "Haloperidol", "back": "High D₂ affinity → effective in positive symptoms of schizophrenia. High EPS risk (TD, dystonia, akathisia). Useful in delirium." },
  { "drug": "Risperidone", "back": "5-HT₂A blockade reduces EPS vs. haloperidol. Metabolic effects less than olanzapine. Used in schizophrenia and mania." },
  { "drug": "Fluoxetine", "back": "Antidepressant effect onset 2–4 weeks. Long t½ reduces discontinuation syndrome risk. Inhibits CYP2D6 → interactions." },
  { "drug": "Amitriptyline", "back": "Analgesic effect (neuropathic pain) at lower doses than antidepressant effect. Sedating — helpful in pain + insomnia." },
  { "drug": "Clonazepam", "back": "High potency, long duration — used in myoclonic and absence seizures. Tolerance may develop; use adjunct long-term." },
  { "drug": "Levodopa", "back": "Most effective antiparkinson drug. Wearing-off and dyskinesias develop over time. COMT inhibitors (entacapone) extend effect." },
  { "drug": "Donepezil", "back": "Modest symptomatic benefit in AD; does not slow disease progression. Nausea common early; once-daily at bedtime." },
  { "drug": "Glyceryl trinitrate", "back": "Venodilation reduces preload; coronary vasodilation. Tolerance with continuous use (nitrate-free interval needed). SL onset <2 min." },
  { "drug": "Empagliflozin", "back": "Cardiorenal protection independent of glucose lowering (EMPA-REG OUTCOME). Reduces HHF and slows CKD progression." },
  { "drug": "Liraglutide", "back": "Reduces weight ~5–8 kg; ↓HbA1c ~1.5%. CV benefit in T2DM with established CVD (LEADER trial). GLP-1 effect enhances satiety." },
  { "drug": "Sitagliptin", "back": "Glucose-dependent insulin secretion — no hypoglycaemia. Neutral CV effects (TECOS). Weight neutral vs GLP-1 agonists." },
  { "drug": "Pioglitazone", "back": "Reduces insulin resistance. ↑HDL, ↓TG. Reduces macrovascular events in T2DM (PROactive). 3–4 months for full effect." },
  { "drug": "Glibenclamide", "back": "Stimulates insulin secretion independent of glucose → risk of hypoglycaemia especially in elderly. Weight gain common." },
  { "drug": "Azithromycin", "back": "Bacteriostatic (can be bactericidal at high concentrations). Time-dependent above MIC. Post-antibiotic effect contributes to once-daily OD dosing." },
  { "drug": "Doxycycline", "back": "Bacteriostatic. Concentration in tissue > plasma → effective against intracellular organisms (Chlamydia, Rickettsia)." },
  { "drug": "Metronidazole", "back": "Bactericidal against anaerobes; antiprotozoal vs Giardia, Entamoeba, Trichomonas. Alcohol interaction via aldehyde dehydrogenase." },
  { "drug": "Fluconazole", "back": "Fungistatic against Candida (fungicidal at high doses). CSF levels ~80% of plasma — effective in Cryptococcal meningitis." },
  { "drug": "Acyclovir", "back": "Selective for HSV-infected cells (viral TK activation). Requires herpes TK — inactive in latent virus. Reduces severity/duration." },
  { "drug": "Chloroquine", "back": "Blood schizonticide — acts on erythrocytic stage. Widespread Plasmodium falciparum resistance now limits use." },
  { "drug": "Apixaban", "back": "Predictable PD; no routine monitoring needed. Reversal by andexanet alfa. Dose-reduced if ≥2 of: age≥80, weight≤60kg, creatinine≥133." },
  { "drug": "Enoxaparin", "back": "Once/twice daily SC. More predictable dose-response than UFH. Anti-Xa monitoring needed in renal impairment, obesity, pregnancy." },
  { "drug": "Dabigatran", "back": "Direct thrombin inhibition — both free and fibrin-bound thrombin. Predictable PD. Reversed by idarucizumab (specific antidote)." },
  { "drug": "Hydrochlorothiazide", "back": "Antihypertensive efficacy similar to loop diuretics but different site. Ineffective in eGFR <30. Synergistic with ACEi/ARBs." },
  { "drug": "Bisoprolol", "back": "Reduces mortality in HFrEF (CIBIS-II). Start low, titrate up. Maximum benefit at target dose. Contraindicated in decompensated HF." },
  { "drug": "Verapamil", "back": "Rate control in AF/flutter. Vasodilatory in angina. Contraindicated with β-blockers (complete heart block risk). Negative inotropy." },
  { "drug": "Propranolol", "back": "Antiarrhythmic (class II), antihypertensive, anti-anginal. Useful in thyrotoxicosis (blocks thyroid hormone sensitisation), portal HTN." },
  { "drug": "Ezetimibe", "back": "~15–20% LDL reduction as monotherapy. Synergistic with statins (+25% additional LDL reduction). Outcome data: IMPROVE-IT." },
  { "drug": "Allopurinol", "back": "Urate-lowering therapy of choice in recurrent gout. Target serum uric acid <360 μmol/L (or <300 if tophaceous). Initiate with colchicine cover." },
  { "drug": "Colchicine", "back": "Effective in acute gout (within 24h). Low-dose regimen as effective as high-dose with fewer GI effects (AGREE). Prevention of pericarditis." },
  { "drug": "Theophylline", "back": "Narrow TI; serum levels 10–20 mg/L (toxic >20). Bronchodilator + anti-inflammatory effect at low doses. Many PK interactions." },
  { "drug": "Montelukast", "back": "Modest bronchodilation. Add-on therapy in persistent asthma. More useful in exercise-induced and allergic asthma. Once-daily evening." },
  { "drug": "Omalizumab", "back": "↓IgE-mediated allergic responses. Reduces asthma exacerbations by ~50%. Used in severe allergic asthma or chronic urticaria." },
  { "drug": "Tiotropium", "back": "LAMA for COPD — once-daily bronchodilation. Reduces exacerbations (UPLIFT trial). Also evidence in severe asthma." },
  { "drug": "Ipratropium", "back": "Short-acting (SAMA); 6–8h duration; onset 15 min. Used in acute COPD exacerbations and asthma (adjunct). No systemic antimuscarinic effects." },
  { "drug": "Cyclosporin", "back": "Therapeutic drug monitoring mandatory (trough levels). Narrow TI. Calcineurin inhibition prevents graft rejection and autoimmune disease." },
  { "drug": "Azathioprine", "back": "Requires 4–6 weeks to show clinical effect. Monitor FBC (myelosuppression). Reduce dose by 75% if used with allopurinol." },
  { "drug": "Infliximab", "back": "Induces remission in active Crohn's and UC. Reduces steroid use. Screen for TB and HBV before starting. Monitor for infection." },
  { "drug": "Rituximab", "back": "Single cycle may deplete B-cells for 6–9 months. Used in NHL, CLL, ANCA vasculitis, RA (anti-CD20)." },
  { "drug": "Imatinib", "back": "Transformed CML prognosis — >90% cytogenetic remission. Must be taken long-term. Resistance via BCR-ABL mutations (T315I)." },
  { "drug": "Tamoxifen", "back": "5 years adjuvant → ~50% relapse reduction in ER+ breast cancer. Benefits accrue beyond treatment period. Endometrial monitoring needed." },
  { "drug": "Anastrozole", "back": "Superior to tamoxifen in post-menopausal ER+ breast cancer (ATAC trial). No endometrial cancer risk. Bone density monitoring needed." },
  { "drug": "Cyclophosphamide", "back": "Requires hepatic activation → acrolein (bladder toxicity: give mesna). Pulse IV regimens in lupus nephritis, ANCA vasculitis." },
  { "drug": "Cisplatin", "back": "Most emetogenic chemotherapy agent. Intense hydration protocol required. Hypomagnesaemia common. Platinum-based backbone in many regimens." },
  { "drug": "Doxorubicin", "back": "Cumulative cardiotoxicity — lifetime dose limit ~450–550 mg/m². LVEF monitoring essential. Free radical mechanism (dexrazoxane cardioprotection)." },
  { "drug": "Adrenaline", "back": "First-line anaphylaxis (IM 0.5 mg 1:1000). α₁ reverses vasodilation; β₁ ↑CO; β₂ ↑bronchodilation. Repeat every 5–15 min." },
  { "drug": "Atropine", "back": "Used in symptomatic bradycardia (600 mcg IV), organophosphate poisoning (high doses), asystole (per ACLS protocol)." },
  { "drug": "Suxamethonium", "back": "Onset 30–60s; duration 5–10 min. 'Fasciculations' before paralysis. Pseudocholinesterase deficiency → prolonged block." },
  { "drug": "Rocuronium", "back": "Onset ~60s (1.2 mg/kg). Duration 30–60 min. Reversal by sugammadex (binds and encapsulates). Alternative to suxamethonium for RSI." },
  { "drug": "Ketamine", "back": "Dissociative state — maintains airway reflexes and BP (useful in shocked patients). Pre-treat with midazolam to prevent emergence delirium." },
  { "drug": "Propofol", "back": "Rapid onset (30s) and offset — 'target-controlled infusion'. Antiemetic property. Risk of propofol infusion syndrome >24h at high dose." },
  { "drug": "Fentanyl", "back": "100× more potent than morphine. Minimal histamine release. Transdermal patch for chronic pain (takes 12–24h to reach steady state)." },
  { "drug": "Methyldopa", "back": "Safe antihypertensive in pregnancy (no teratogenicity). Central α₂ agonism reduces sympathetic outflow. Onset ~4–6h." },
  { "drug": "Amiodarone", "back": "Class III antiarrhythmic with Class I, II, IV effects. Very long t½ (weeks). Contains iodine; risk of thyroid, pulmonary, and hepatic toxicity." },
  { "drug": "Flecainide", "back": "Class IC antiarrhythmic. Strong Na⁺ channel blockade. Proarrhythmic in structural heart disease (contraindicated post-MI)." },
  { "drug": "Diltiazem", "back": "Non-dihydropyridine CCB. Intermediate negative inotropy/chronotropy between verapamil and amlodipine. Used in AF rate control and angina." },
  { "drug": "Nifedipine", "back": "Dihydropyridine CCB. Short-acting forms cause reflex tachycardia; extended-release used for HTN and Raynaud's phenomenon." },
  { "drug": "Hydralazine", "back": "Direct arteriolar vasodilator. Reduces afterload. Used in severe HTN and HF (with nitrates). Risk of drug-induced lupus erythematosus." },
  { "drug": "Minoxidil", "back": "Potent arteriolar vasodilator (K⁺ channel opener). Used in refractory HTN. Causes reflex tachycardia, fluid retention, and hypertrichosis." },
  { "drug": "Prazosin", "back": "Selective α₁ antagonist. Causes vasodilation. Used for HTN, nightmares in PTSD, and BPH. First-dose orthostatic hypotension common." },
  { "drug": "Clonidine", "back": "Central α₂ agonist. Reduces sympathetic outflow. Causes sedation, dry mouth, and rebound hypertension upon abrupt withdrawal." },
  { "drug": "Valsartan", "back": "Angiotensin II receptor blocker (ARB). Vasodilation, reduced aldosterone. No bradykinin accumulation (unlike ACE inhibitors), so no cough." },
  { "drug": "Sacubitril/Valsartan", "back": "ARNI. Neprilysin inhibition (sacubitril) ↑natriuretic peptides, combined with ARB. Superior to ACEi in HFrEF (PARADIGM-HF)." },
  { "drug": "Ivabradine", "back": "Inhibits If current in SA node, reducing heart rate without affecting contractility. Used in stable angina and HFrEF." },
  { "drug": "Ranolazine", "back": "Inhibits late phase Na⁺ current in myocytes. Reduces intracellular Ca²⁺ overload. Antianginal without significant HR/BP effects." },
  { "drug": "Ticagrelor", "back": "Reversible, direct-acting P2Y12 inhibitor. Faster onset than clopidogrel. Associated with transient dyspnea. Twice-daily dosing." },
  { "drug": "Prasugrel", "back": "Irreversible P2Y12 inhibitor. More potent than clopidogrel. Contraindicated if history of TIA/stroke due to bleeding risk." },
  { "drug": "Alteplase", "back": "Recombinant tPA. Converts plasminogen to plasmin. Used in acute ischemic stroke (<4.5h), massive PE, and STEMI." },
  { "drug": "Rosuvastatin", "back": "High-intensity statin with long t½. Hydrophilic (less muscle penetration than lipophilic statins like simvastatin). Can be dosed anytime." },
  { "drug": "Fenofibrate", "back": "PPAR-α agonist. Primarily lowers triglycerides and increases HDL. Safer to combine with statins than gemfibrozil." },
  { "drug": "Evolocumab", "back": "PCSK9 inhibitor (monoclonal antibody). Dramatically lowers LDL by preventing LDL-receptor degradation. Subcutaneous injection." },
  { "drug": "Torasemide", "back": "Loop diuretic with longer t½ and better oral bioavailability than furosemide. Reduces HF readmissions." },
  { "drug": "Chlorthalidone", "back": "Thiazide-like diuretic. Longer t½ and more potent than hydrochlorothiazide. Proven mortality benefits in hypertension trials (ALLHAT)." },
  { "drug": "Eplerenone", "back": "Selective aldosterone receptor antagonist. Less risk of gynecomastia and impotence compared to spironolactone. Reduces post-MI mortality." },
  { "drug": "Acetazolamide", "back": "Carbonic anhydrase inhibitor. Acts in proximal tubule. Causes mild diuresis and metabolic acidosis. Used for glaucoma and altitude sickness." },
  { "drug": "Mannitol", "back": "Osmotic diuretic. Increases tubular fluid osmolarity. Used to rapidly decrease intracranial or intraocular pressure." },
  { "drug": "Glimepiride", "back": "Second-generation sulfonylurea. Stimulates insulin release via pancreatic K-ATP channels. Less hypoglycemia risk than glibenclamide." },
  { "drug": "Exenatide", "back": "GLP-1 receptor agonist derived from Gila monster saliva. Stimulates glucose-dependent insulin release and delays gastric emptying." },
  { "drug": "Semaglutide", "back": "Long-acting GLP-1 agonist (weekly SC or daily oral). Significant weight loss and proven CV risk reduction in T2DM." },
  { "drug": "Dapagliflozin", "back": "SGLT2 inhibitor. Induces glycosuria. Proven benefits in HFrEF, HFpEF, and CKD independent of diabetes status." },
  { "drug": "Acarbose", "back": "Alpha-glucosidase inhibitor. Delays intestinal carbohydrate absorption. Causes significant flatulence and GI distress." },
  { "drug": "Insulin Glargine", "back": "Long-acting basal insulin analog. Forms micro-precipitates at injection site for slow, peakless release over 24 hours." },
  { "drug": "Levothyroxine", "back": "Synthetic T4. Narrow TI. Absorbed best on an empty stomach. Long t½ allows once-daily dosing. Monitor via TSH." },
  { "drug": "Methimazole", "back": "Inhibits thyroid peroxidase (TPO). First-line for hyperthyroidism (except first trimester of pregnancy). Risk of agranulocytosis." },
  { "drug": "Propylthiouracil", "back": "Inhibits TPO and peripheral T4 to T3 conversion. Preferred in first trimester of pregnancy and thyroid storm. Hepatotoxic." },
  { "drug": "Hydrocortisone", "back": "Short-acting glucocorticoid with equal mineralocorticoid activity. Used for adrenal insufficiency replacement therapy." },
  { "drug": "Alendronate", "back": "Bisphosphonate. Inhibits osteoclasts. Must be taken upright with water 30 min before food to prevent erosive esophagitis." },
  { "drug": "Denosumab", "back": "RANKL inhibitor (monoclonal antibody). Prevents osteoclast maturation. Subcutaneous injection every 6 months for osteoporosis." },
  { "drug": "Cinacalcet", "back": "Calcimimetic. Increases calcium-sensing receptor sensitivity in parathyroid gland, reducing PTH. Used in secondary hyperparathyroidism." },
  { "drug": "Pantoprazole", "back": "Proton pump inhibitor (PPI). Irreversibly binds H+/K+ ATPase. Less CYP2C19 inhibition than omeprazole (fewer clopidogrel interactions)." },
  { "drug": "Ranitidine", "back": "H2 receptor antagonist. Reduces nocturnal acid secretion. (Note: largely withdrawn globally due to NDMA impurity concerns)." },
  { "drug": "Sucralfate", "back": "Aluminum hydroxide complex. Polymerizes in acidic environment to form a protective coating over peptic ulcers. Requires acidic pH." },
  { "drug": "Metoclopramide", "back": "D2 antagonist and 5-HT4 agonist. Prokinetic and antiemetic. Crosses BBB; high risk of extrapyramidal symptoms (EPS) and tardive dyskinesia." },
  { "drug": "Domperidone", "back": "D2 antagonist prokinetic. Does not readily cross the BBB, so minimal EPS compared to metoclopramide. Risk of QT prolongation." },
  { "drug": "Aprepitant", "back": "NK1 receptor antagonist. Blocks substance P. Highly effective for preventing delayed chemotherapy-induced nausea and vomiting (CINV)." },
  { "drug": "Loperamide", "back": "Peripheral μ-opioid agonist. Slows gut motility. Poor BBB penetration, so negligible CNS effects. Antidiarrheal." },
  { "drug": "Lactulose", "back": "Osmotic laxative. Degraded by gut flora into lactic acid, trapping ammonia as ammonium (NH4+) to treat hepatic encephalopathy." },
  { "drug": "Mesalazine", "back": "5-ASA derivative. Topical anti-inflammatory effect in the colon. First-line for maintaining remission in mild-to-moderate ulcerative colitis." },
  { "drug": "Formoterol", "back": "Long-acting β₂ agonist (LABA) with rapid onset. Can be used as both maintenance and reliever therapy in asthma (MART regimen)." },
  { "drug": "Salmeterol", "back": "LABA with delayed onset. Strictly for maintenance in asthma (always with ICS) and COPD. Lipophilic tail prolongs receptor binding." },
  { "drug": "Fluticasone", "back": "Potent inhaled corticosteroid (ICS). High first-pass metabolism limits systemic side effects. Risk of oral candidiasis (thrush)." },
  { "drug": "Escitalopram", "back": "SSRI. S-enantiomer of citalopram. Highly selective for SERT. Low potential for pharmacokinetic drug interactions." },
  { "drug": "Sertraline", "back": "SSRI with mild dopamine reuptake inhibition. First-line for depression, PTSD, and OCD. Safe in ischemic heart disease." },
  { "drug": "Venlafaxine", "back": "SNRI. Serotonergic at low doses; noradrenergic at higher doses. Can cause dose-dependent hypertension and severe withdrawal." },
  { "drug": "Bupropion", "back": "NDRI. Antidepressant and smoking cessation aid. No weight gain or sexual dysfunction. Lowers seizure threshold (avoid in epilepsy/bulimia)." },
  { "drug": "Mirtazapine", "back": "NaSSA (α₂ antagonist, ↑NE and 5-HT). Blocks 5-HT2/3 and H1 receptors. Causes sedation and weight gain. Good for depression with insomnia." },
  { "drug": "Tranylcypromine", "back": "Irreversible non-selective MAOI. Risk of hypertensive crisis with tyramine-containing foods (cheese effect). Washout period required." },
  { "drug": "Pramipexole", "back": "Non-ergot D2/D3 agonist. Used in Parkinson's and Restless Legs Syndrome. Risk of impulse control disorders (e.g., gambling)." },
  { "drug": "Selegiline", "back": "Selective irreversible MAO-B inhibitor. Prolongs endogenous dopamine in the striatum. Used as adjunct in Parkinson's disease." },
  { "drug": "Memantine", "back": "NMDA receptor uncompetitive antagonist. Protects neurons from glutamate excitotoxicity. Used in moderate-to-severe Alzheimer's disease." },
  { "drug": "Lamotrigine", "back": "Na⁺ channel blocker. Broad-spectrum antiepileptic and bipolar maintenance. Risk of Stevens-Johnson Syndrome (requires slow dose titration)." },
  { "drug": "Levetiracetam", "back": "Binds to synaptic vesicle protein SV2A. Favorable PK profile (no CYP interactions). Can cause irritability and behavioral disturbances." },
  { "drug": "Topiramate", "back": "Blocks Na⁺ channels, enhances GABA, weak carbonic anhydrase inhibitor. Causes weight loss and cognitive dulling ('dopamax'). Migraine prophylaxis." },
  { "drug": "Ethosuximide", "back": "Blocks T-type Ca²⁺ channels in thalamic neurons. First-line exclusively for absence seizures. Minimal systemic toxicity." },
  { "drug": "Pregabalin", "back": "Binds α2δ subunit of voltage-gated Ca²⁺ channels, decreasing neurotransmitter release. Used for neuropathic pain and focal epilepsies." },
  { "drug": "Midazolam", "back": "Short-acting benzodiazepine. Rapid onset. Used for conscious sedation, induction of anesthesia, and acute status epilepticus." },
  { "drug": "Zolpidem", "back": "Non-benzodiazepine hypnotic (Z-drug). Binds selectively to BZ1 receptor subtype. Short t½. Risk of parasomnias (sleepwalking)." },
  { "drug": "Clozapine", "back": "Atypical antipsychotic. Most effective for treatment-resistant schizophrenia. Risks: agranulocytosis (strict WBC monitoring), myocarditis, seizures." },
  { "drug": "Olanzapine", "back": "Atypical antipsychotic. High affinity for 5-HT2A and D2. Significant metabolic syndrome risk (weight gain, dyslipidemia, diabetes)." },
  { "drug": "Quetiapine", "back": "Atypical antipsychotic. Strong H1 blockade causes profound sedation. Low EPS risk, favored in Parkinson's psychosis." },
  { "drug": "Aripiprazole", "back": "Partial D2 agonist. Atypical antipsychotic. Less weight gain and sedation. Can cause akathisia (inner restlessness)." },
  { "drug": "Tramadol", "back": "Weak μ-agonist and SNRI. Analgesic. Risk of serotonin syndrome if combined with SSRIs. Lowers seizure threshold." },
  { "drug": "Oxycodone", "back": "Semisynthetic opioid. High oral bioavailability. Potent μ-agonist used for moderate to severe pain. High addiction potential." },
  { "drug": "Methadone", "back": "Long-acting μ-agonist and NMDA antagonist. Used for opioid substitution therapy and chronic pain. Prolongs QT interval." },
  { "drug": "Buprenorphine", "back": "Partial μ-agonist, κ-antagonist. High receptor affinity (can precipitate withdrawal if full agonist present). Ceiling effect on respiratory depression." },
  { "drug": "Celecoxib", "back": "Selective COX-2 inhibitor. Anti-inflammatory with lower GI bleeding risk than non-selective NSAIDs. Avoid in known cardiovascular disease." },
  { "drug": "Ketorolac", "back": "Potent NSAID used mostly for short-term (<5 days) severe acute pain. Extremely high risk of GI bleeding and nephrotoxicity if used longer." },
  { "drug": "Lidocaine", "back": "Amide local anesthetic (blocks Na⁺ channels) and Class IB antiarrhythmic. Often combined with epinephrine to prolong local action." },
  { "drug": "Bupivacaine", "back": "Long-acting amide local anesthetic. More cardiotoxic than lidocaine if inadvertently injected intravenously. Used for spinal/epidural blocks." },
  { "drug": "Sevoflurane", "back": "Volatile inhalation anesthetic. Sweet smelling, non-irritating (used for mask induction, especially in pediatrics). Rapid emergence." },
  { "drug": "Flucloxacillin", "back": "Penicillinase-resistant penicillin. Anti-staphylococcal (MSSA). High incidence of cholestatic jaundice compared to other penicillins." },
  { "drug": "Piperacillin", "back": "Antipseudomonal extended-spectrum penicillin. Always combined with tazobactam (β-lactamase inhibitor) for empiric hospital-acquired infections." },
  { "drug": "Ceftriaxone", "back": "Third-generation cephalosporin. Excellent CSF penetration. High biliary excretion (can cause biliary pseudolithiasis). Avoid in neonates (kernicterus)." },
  { "drug": "Meropenem", "back": "Broad-spectrum carbapenem. Resists most β-lactamases including ESBLs. Lower seizure risk compared to imipenem." },
  { "drug": "Clarithromycin", "back": "Macrolide. Binds 50S subunit. Part of H. pylori eradication. Potent CYP3A4 inhibitor (fatal interaction with statins or colchicine)." },
  { "drug": "Linezolid", "back": "Oxazolidinone. Binds 50S subunit. Active against VRE and MRSA. Weak MAOI (serotonin syndrome risk). Causes thrombocytopenia >14 days." },
  { "drug": "Nitrofurantoin", "back": "Concentrates in urine. First-line for uncomplicated cystitis. Ineffective in pyelonephritis or low eGFR. Risk of pulmonary fibrosis." },
  { "drug": "Sulfamethoxazole", "back": "Inhibits dihydropteroate synthase. Used with trimethoprim (co-trimoxazole). Broad spectrum including PCP and Toxoplasma. Causes SJS." },
  { "drug": "Isoniazid", "back": "Prodrug activated by KatG. Inhibits mycolic acid synthesis. Causes peripheral neuropathy (give pyridoxine/B6) and hepatotoxicity." },
  { "drug": "Amphotericin B", "back": "Binds ergosterol, forming pores in fungal membrane. Broad-spectrum fungicidal. Highly nephrotoxic; liposomal formulation reduces toxicity." },
  { "drug": "Valaciclovir", "back": "Prodrug of acyclovir. Higher oral bioavailability allows less frequent dosing for HSV and VZV infections." },
  { "drug": "Tenofovir", "back": "NRTI (nucleotide analog). Used in HIV and HBV. TDF formulation associated with nephrotoxicity and bone mineral density loss; TAF is safer." },
  { "drug": "Efavirenz", "back": "NNRTI. Used in HIV. Notable for vivid dreams, CNS symptoms, and teratogenicity (neural tube defects) in early pregnancy." },
  { "drug": "Ritonavir", "back": "Protease inhibitor. Potent CYP3A4 inhibitor used almost exclusively as a pharmacokinetic 'booster' for other protease inhibitors." },
  { "drug": "Dolutegravir", "back": "Integrase strand transfer inhibitor (INSTI). Blocks integration of HIV DNA. High barrier to resistance. First-line HIV therapy." },
  { "drug": "Artemether", "back": "Artemisinin derivative. Rapid clearance of Plasmodium parasites. Given in combination (e.g., with lumefantrine) to prevent resistance." },
  { "drug": "Fluorouracil", "back": "Pyrimidine analog (5-FU). Inhibits thymidylate synthase. GI and mucosal toxicity. Efficacy enhanced by leucovorin (folinic acid)." },
  { "drug": "Paclitaxel", "back": "Taxane. Hyper-stabilizes microtubules, preventing mitotic spindle breakdown. Causes alopecia and peripheral neuropathy." },
  { "drug": "Vincristine", "back": "Vinca alkaloid. Binds tubulin, blocking microtubule polymerization. Dose-limiting peripheral neuropathy (loss of deep tendon reflexes)." },
  { "drug": "Trastuzumab", "back": "Monoclonal antibody against HER2/neu receptor. Used in HER2+ breast and gastric cancer. Reversible cardiotoxicity (monitor LVEF)." },
  { "drug": "Pembrolizumab", "back": "Anti-PD-1 immune checkpoint inhibitor. Unmasks tumor to the immune system. Causes immune-related adverse events (colitis, pneumonitis, thyroiditis)." },
  { "drug": "Bortezomib", "back": "Proteasome inhibitor. Causes buildup of toxic proteins in cancer cells. First-line for multiple myeloma. Causes peripheral neuropathy." },
  { "drug": "Tacrolimus", "back": "Calcineurin inhibitor (binds FKBP). More potent than cyclosporin. Prevents organ rejection. Nephrotoxic, neurotoxic, and diabetogenic." },
  { "drug": "Mycophenolate Mofetil", "back": "Inhibits IMPDH, starving T and B cells of purines. Immunosuppressant for transplants and lupus. Causes GI upset and leukopenia." },
  { "drug": "Sildenafil", "back": "PDE5 inhibitor. Prevents cGMP breakdown, prolonging NO-mediated vasodilation. Used in erectile dysfunction and pulmonary hypertension. Absolute contraindication with nitrates." },
  { "drug": "Finasteride", "back": "5-alpha reductase inhibitor. Blocks conversion of testosterone to DHT. Shrinks prostate in BPH; treats male pattern baldness. Teratogenic." },
  { "drug": "Tamsulosin", "back": "Alpha-1A selective antagonist. Relaxes smooth muscle in the prostate and bladder neck for BPH. Risk of floppy iris syndrome during cataract surgery." },
  { "drug": "Oxybutynin", "back": "Antimuscarinic. Reduces detrusor overactivity in overactive bladder. High systemic anticholinergic side effects (dry mouth, constipation, confusion)." },
  { "drug": "Mirabegron", "back": "Beta-3 adrenergic agonist. Relaxes detrusor muscle without anticholinergic side effects. Can cause dose-dependent increases in blood pressure." },
  { "drug": "Neostigmine", "back": "Reversible acetylcholinesterase inhibitor. Does not cross BBB. Used for myasthenia gravis and reversal of non-depolarizing neuromuscular blockers." },
  { "drug": "Naloxone", "back": "Short-acting opioid competitive antagonist. Life-saving in opioid overdose. May require repeated dosing due to short half-life." },
  { "drug": "Flumazenil", "back": "Competitive antagonist at the benzodiazepine receptor. Can precipitate severe withdrawal seizures in chronic benzo users; use with caution." },
  { "drug": "Acetylcysteine", "back": "Replenishes glutathione. Antidote for paracetamol (acetaminophen) toxicity. Also used as a mucolytic in respiratory conditions." },
  { "drug": "Filgrastim", "back": "G-CSF analog. Stimulates neutrophil production in bone marrow. Used to treat chemotherapy-induced neutropenia. Causes bone pain." }
];
const indicationsData = [
  { "drug": "Atenolol", "back": "Hypertension, angina, AF rate control, post-MI. Less favoured now vs. bisoprolol/metoprolol (weaker HF evidence)." },
  { "drug": "Atorvastatin", "back": "Hypercholesterolaemia, primary and secondary cardiovascular prevention. High-intensity statin; monitor for myalgia and check LFTs." },
  { "drug": "Amlodipine", "back": "Hypertension, chronic stable angina. Dihydropyridine CCB. Common side effect is dose-dependent ankle swelling (oedema)." },
  { "drug": "Albuterol", "back": "Acute asthma, COPD bronchospasm, exercise-induced bronchospasm. SABA. Can cause tremor, tachycardia, and transient hypokalaemia." },
  { "drug": "Amoxicillin", "back": "Pneumonia, UTI (if sensitive), otitis media, H. pylori eradication. Moderate-spectrum penicillin. Watch for penicillin allergy." },
  { "drug": "Azithromycin", "back": "Chlamydia, atypical pneumonia, travelers' diarrhea, COPD exacerbations. Macrolide. Associated with QT prolongation." },
  { "drug": "Allopurinol", "back": "Chronic gout prevention, tumor lysis syndrome. Xanthine oxidase inhibitor. Do not start during an acute gout flare." },
  { "drug": "Alendronate", "back": "Osteoporosis treatment and prevention, Paget's disease. Bisphosphonate. Must take on empty stomach and remain upright for 30 mins." },
  { "drug": "Amitriptyline", "back": "Major depression, neuropathic pain, migraine prophylaxis. Tricyclic antidepressant. High anticholinergic burden and sedation." },
  { "drug": "Apixaban", "back": "AF stroke prevention, DVT/PE treatment and prophylaxis. DOAC. Direct factor Xa inhibitor. Lower bleeding risk than warfarin." },
  { "drug": "Aspirin", "back": "Acute coronary syndrome, ischemic stroke, secondary CV prevention. Antiplatelet (COX inhibitor). Risk of GI bleeding and peptic ulcers." },
  { "drug": "Aripiprazole", "back": "Schizophrenia, bipolar mania, MDD augmentation. Atypical antipsychotic. Partial D2 agonist; lower risk of weight gain than others." },
  { "drug": "Acetaminophen", "back": "Mild-to-moderate pain, pyrexia (fever). Analgesic/antipyretic. Max dose 4g/day due to risk of hepatotoxicity." },
  { "drug": "Adalimumab", "back": "Rheumatoid arthritis, Crohn's, psoriasis. TNF-alpha inhibitor. Screen for latent TB and hepatitis before starting." },
  { "drug": "Acyclovir", "back": "Herpes simplex, varicella-zoster virus infections. Guanosine analogue. Ensure adequate hydration to prevent crystalluria." },
  { "drug": "Baclofen", "back": "Spasticity in MS or spinal cord injury. GABA-B agonist. Do not stop abruptly due to risk of withdrawal seizures." },
  { "drug": "Bisoprolol", "back": "Hypertension, chronic heart failure, rate control in AF. Beta-1 selective blocker. Reduces mortality in heart failure." },
  { "drug": "Budesonide", "back": "Maintenance asthma, COPD, Crohn's disease (ileal/colonic). Glucocorticoid. Rinse mouth after inhalation to prevent oral thrush." },
  { "drug": "Buprenorphine", "back": "Opioid use disorder, moderate-to-severe chronic pain. Partial mu-opioid agonist. Has a ceiling effect on respiratory depression." },
  { "drug": "Benazepril", "back": "Hypertension, heart failure, diabetic nephropathy. ACE inhibitor. Associated with dry cough and risk of angioedema." },
  { "drug": "Bromocriptine", "back": "Hyperprolactinemia, Parkinson's disease, acromegaly. Dopamine agonist. Can cause nausea, orthostatic hypotension, and psychosis." },
  { "drug": "Brimonidine", "back": "Open-angle glaucoma, ocular hypertension, facial erythema in rosacea. Alpha-2 agonist. Can cause local ocular allergy." },
  { "drug": "Beclomethasone", "back": "Maintenance asthma, allergic rhinitis. Inhaled/nasal corticosteroid. First-line preventative therapy for persistent asthma." },
  { "drug": "Bupropion", "back": "Major depression, smoking cessation, seasonal affective disorder. NDRI. Lowers seizure threshold; avoid in eating disorders." },
  { "drug": "Bumetanide", "back": "Oedema in heart failure, renal disease, hepatic cirrhosis. Loop diuretic. Much more potent than furosemide (1mg = 40mg)." },
  { "drug": "Citalopram", "back": "Major depressive disorder, panic disorder. SSRI. Higher doses (>40mg) associated with dose-dependent QT prolongation." },
  { "drug": "Clopidogrel", "back": "Post-ACS, post-stenting, ischemic stroke, PAD. P2Y12 inhibitor. Prodrug requiring CYP2C19 activation; beware omeprazole interaction." },
  { "drug": "Carvedilol", "back": "Heart failure (HFrEF), hypertension, post-MI. Combined alpha and beta-blocker. Proven mortality benefit in heart failure." },
  { "drug": "Clonazepam", "back": "Panic disorder, seizure disorders, acute mania. Benzodiazepine. High risk of dependence and sedation. Taper slowly." },
  { "drug": "Celecoxib", "back": "Osteoarthritis, rheumatoid arthritis, acute pain. COX-2 selective NSAID. Lower GI bleed risk but carries CV risk." },
  { "drug": "Ciprofloxacin", "back": "UTI, prostatitis, infectious diarrhea, bone/joint infections. Fluoroquinolone. Black box warning for tendon rupture and aortic dissection." },
  { "drug": "Cephalexin", "back": "Skin and soft tissue infections, uncomplicated UTI. 1st generation cephalosporin. Good gram-positive coverage (MSSA)." },
  { "drug": "Clarithromycin", "back": "H. pylori eradication, respiratory tract infections. Macrolide. Strong CYP3A4 inhibitor; many drug interactions." },
  { "drug": "Clonidine", "back": "Hypertension, ADHD, opioid withdrawal. Centrally acting alpha-2 agonist. Rebound hypertension if stopped abruptly." },
  { "drug": "Cyclobenzaprine", "back": "Short-term muscle spasm. Centrally acting muscle relaxant. Highly anticholinergic; avoid in elderly patients." },
  { "drug": "Colchicine", "back": "Acute gout flares, gout prophylaxis, pericarditis. Inhibits microtubule polymerization. Narrow therapeutic index (causes severe diarrhea)." },
  { "drug": "Carbamazepine", "back": "Epilepsy, trigeminal neuralgia, bipolar disorder. Sodium channel blocker. Enzyme inducer. Risk of SJS/TEN (screen for HLA-B*1502)." },
  { "drug": "Codeine", "back": "Mild-to-moderate pain, cough suppression. Opioid prodrug. Genetic fast metabolizers (CYP2D6) risk fatal toxicity." },
  { "drug": "Clindamycin", "back": "SSTI, dental infections, PID, MRSA. Lincosamide. High risk of causing Clostridioides difficile-associated diarrhea." },
  { "drug": "Candesartan", "back": "Hypertension, heart failure (intolerant to ACEi). ARB. Monitor potassium and renal function. Teratogenic." },
  { "drug": "Doxycycline", "back": "Atypical pneumonia, acne, Lyme disease, chlamydia, malaria prophylaxis. Tetracycline. Photosensitivity; avoid in pregnancy and kids <8." },
  { "drug": "Duloxetine", "back": "MDD, GAD, diabetic neuropathy, fibromyalgia, chronic musculoskeletal pain. SNRI. Monitor BP; avoid in heavy alcohol users." },
  { "drug": "Diazepam", "back": "Anxiety, status epilepticus, alcohol withdrawal, muscle spasm. Benzodiazepine. Long half-life with active metabolites." },
  { "drug": "Divalproex", "back": "Epilepsy, bipolar disorder, migraine prophylaxis. Anticonvulsant/mood stabilizer. Highly teratogenic (neural tube defects)." },
  { "drug": "Digoxin", "back": "Heart failure (symptom control), rate control in AF. Cardiac glycoside. Positive inotrope, negative chronotrope. Narrow therapeutic index." },
  { "drug": "Diltiazem", "back": "Hypertension, angina, rate control in AF. Non-dihydropyridine CCB. Can cause bradycardia and worsening heart failure." },
  { "drug": "Desvenlafaxine", "back": "Major depressive disorder. SNRI. Active metabolite of venlafaxine. Can cause dose-related hypertension." },
  { "drug": "Donepezil", "back": "Alzheimer's disease dementia. Acetylcholinesterase inhibitor. Common side effects include nausea, diarrhea, and bradycardia." },
  { "drug": "Doxazosin", "back": "BPH, hypertension. Alpha-1 blocker. Causes smooth muscle relaxation in prostate. Watch for first-dose syncope." },
  { "drug": "Dexamethasone", "back": "Inflammation, cerebral oedema, croup, COVID-19 (severe), chemotherapy nausea. Highly potent glucocorticoid with minimal mineralocorticoid activity." },
  { "drug": "Dabigatran", "back": "AF stroke prevention, DVT/PE treatment. DOAC. Direct thrombin inhibitor. Has specific reversal agent (idarucizumab)." },
  { "drug": "Dorzolamide", "back": "Glaucoma, ocular hypertension. Carbonic anhydrase inhibitor. Can cause a bitter taste in the mouth after use." },
  { "drug": "Dutasteride", "back": "Benign prostatic hyperplasia (BPH). 5-alpha-reductase inhibitor. Reduces prostate size. Pregnant women should not handle capsules." },
  { "drug": "Dicyclomine", "back": "Irritable bowel syndrome (IBS) cramping. Anticholinergic/antispasmodic. Relaxes GI smooth muscle. Causes dry mouth." },
  { "drug": "Dopamine", "back": "Shock, severe hypotension, bradycardia (refractory). Sympathomimetic. Dose-dependent effects on renal, beta, and alpha receptors." },
  { "drug": "Escitalopram", "back": "Major depressive disorder, generalized anxiety disorder. SSRI. S-enantiomer of citalopram. Generally well tolerated." },
  { "drug": "Esomeprazole", "back": "GERD, peptic ulcer disease, H. pylori eradication. PPI. S-isomer of omeprazole. Risk of osteoporosis and hypomagnesemia with long-term use." },
  { "drug": "Ezetimibe", "back": "Hypercholesterolemia (monotherapy or with statin). Cholesterol absorption inhibitor. Lowers LDL by blocking intestinal absorption." },
  { "drug": "Enalapril", "back": "Hypertension, heart failure, left ventricular dysfunction. ACE inhibitor. Prodrug converted to enalaprilat." },
  { "drug": "Ergotamine", "back": "Acute migraine attacks. Ergot alkaloid. Vasoconstrictor. Contraindicated in CAD and peripheral vascular disease." },
  { "drug": "Erythromycin", "back": "Respiratory tract infections, gastroparesis. Macrolide. Strong CYP3A4 inhibitor and GI motilin receptor agonist." },
  { "drug": "Empagliflozin", "back": "Type 2 diabetes, HFrEF, chronic kidney disease. SGLT2 inhibitor. Promotes glucosuria. Lowers CV mortality and HF hospitalizations." },
  { "drug": "Enoxaparin", "back": "DVT/PE prophylaxis and treatment, ACS. Low molecular weight heparin. Predictable pharmacokinetics; doesn't usually require routine monitoring." },
  { "drug": "Epinephrine", "back": "Anaphylaxis, cardiac arrest, severe croup. Sympathomimetic (alpha and beta agonist). Causes bronchodilation and vasoconstriction." },
  { "drug": "Epoetin alfa", "back": "Anaemia due to CKD or chemotherapy. Erythropoiesis-stimulating agent. Target Hb should not exceed 11 g/dL due to CV risk." },
  { "drug": "Estradiol", "back": "Menopause symptoms, osteoporosis prevention, hypoestrogenism. Estrogen hormone. Increased risk of VTE; use lowest dose possible." },
  { "drug": "Etonogestrel", "back": "Contraception (subdermal implant). Progestin. Provides highly effective contraception for up to 3 years." },
  { "drug": "Etoposide", "back": "Small cell lung cancer, testicular cancer, lymphomas. Topoisomerase II inhibitor. Can cause severe myelosuppression." },
  { "drug": "Everolimus", "back": "Renal cell carcinoma, organ transplant rejection, tuberous sclerosis. mTOR inhibitor. Monitor for stomatitis and pneumonitis." },
  { "drug": "Evolocumab", "back": "Hyperlipidemia, CV event prevention. PCSK9 inhibitor. Subcutaneous injection that drastically lowers LDL-C." },
  { "drug": "Fluoxetine", "back": "MDD, OCD, bulimia nervosa, panic disorder. SSRI. Long half-life (no need to taper as strictly). Activating." },
  { "drug": "Fluticasone", "back": "Maintenance asthma, allergic rhinitis, COPD. Inhaled/nasal corticosteroid. High potency, low systemic bioavailability." },
  { "drug": "Furosemide", "back": "Oedema (HF, renal failure, cirrhosis), hypertension (refractory). Loop diuretic. Watch for hypokalaemia and ototoxicity." },
  { "drug": "Folic acid", "back": "Folate deficiency, neural tube defect prevention in pregnancy, methotrexate toxicity prevention. Essential for DNA synthesis." },
  { "drug": "Famotidine", "back": "GERD, peptic ulcer disease, stress ulcer prophylaxis. H2 receptor antagonist. Safer profile than cimetidine." },
  { "drug": "Fenofibrate", "back": "Hypertriglyceridemia, mixed dyslipidemia. Fibric acid derivative. Activates PPAR-alpha. Risk of myopathy when combined with statins." },
  { "drug": "Fentanyl", "back": "Severe chronic pain, acute breakthrough pain, anesthesia. Potent synthetic opioid. Transdermal patch requires careful disposal." },
  { "drug": "Finasteride", "back": "BPH, male pattern baldness. 5-alpha-reductase inhibitor. Inhibits conversion of testosterone to DHT." },
  { "drug": "Fluconazole", "back": "Candidiasis, cryptococcal meningitis prophylaxis. Antifungal (triazole). Inhibits fungal CYP450. Good CNS penetration." },
  { "drug": "Ferrous sulfate", "back": "Iron deficiency anemia. Iron supplement. Causes dark stools and constipation. Absorption improved with Vitamin C." },
  { "drug": "Fludrocortisone", "back": "Addison's disease, orthostatic hypotension. Mineralocorticoid. Promotes sodium retention and potassium excretion." },
  { "drug": "Flucloxacillin", "back": "Skin and soft tissue infections, osteomyelitis, endocarditis. Penicillinase-resistant penicillin. Drug of choice for MSSA." },
  { "drug": "Flumazenil", "back": "Benzodiazepine overdose reversal. Benzodiazepine antagonist. Can precipitate acute withdrawal seizures in chronic users." },
  { "drug": "Fosinopril", "back": "Hypertension, heart failure. ACE inhibitor. Dual hepatic and renal excretion (good for renal impairment)." },
  { "drug": "Fexofenadine", "back": "Allergic rhinitis, chronic idiopathic urticaria. 2nd generation antihistamine. Very low sedating potential; does not cross BBB." },
  { "drug": "Gabapentin", "back": "Neuropathic pain, postherpetic neuralgia, focal seizures. GABA analogue. Can cause dizziness, somnolence, and peripheral oedema." },
  { "drug": "Glipizide", "back": "Type 2 diabetes. Sulfonylurea. Stimulates pancreatic insulin secretion. High risk of hypoglycemia." },
  { "drug": "Glyburide", "back": "Type 2 diabetes. Sulfonylurea. Long-acting; higher risk of prolonged hypoglycemia compared to glipizide. Avoid in elderly." },
  { "drug": "Gliclazide", "back": "Type 2 diabetes. Sulfonylurea. Preferred in elderly over glyburide due to shorter half-life and lower hypoglycemia risk." },
  { "drug": "Glimepiride", "back": "Type 2 diabetes. Sulfonylurea. Once-daily dosing. Promotes insulin release from beta cells." },
  { "drug": "Gemfibrozil", "back": "Hypertriglyceridemia. Fibrate. Do not co-administer with repaglinide or simvastatin due to severe myopathy risk." },
  { "drug": "Gentamicin", "back": "Severe gram-negative infections, endocarditis (with cell wall agent). Aminoglycoside. Requires TDM to prevent nephro- and ototoxicity." },
  { "drug": "Guanfacine", "back": "ADHD, hypertension. Alpha-2 agonist. Less sedating than clonidine. Do not crush XR tablets." },
  { "drug": "Glatiramer", "back": "Relapsing-remitting multiple sclerosis. Immunomodulator. Mixture of peptides resembling myelin basic protein. Injection site reactions common." },
  { "drug": "Goserelin", "back": "Prostate cancer, endometriosis, advanced breast cancer. GnRH agonist. Causes initial surge in testosterone/estrogen before downregulation." },
  { "drug": "Gliclazide", "back": "Type 2 diabetes mellitus. Sulfonylurea. Shorter half-life makes it safer in the elderly than glyburide." },
  { "drug": "Glecaprevir", "back": "Chronic hepatitis C infection (pan-genotypic). HCV NS3/4A protease inhibitor. Usually combined with pibrentasvir." },
  { "drug": "Golimumab", "back": "Rheumatoid arthritis, ulcerative colitis, psoriatic arthritis. TNF-alpha inhibitor. Human monoclonal antibody. SC injection once monthly." },
  { "drug": "Granisetron", "back": "Chemotherapy-induced nausea and vomiting. 5-HT3 receptor antagonist. Can cause headache, constipation, and QT prolongation." },
  { "drug": "Gefitinib", "back": "Non-small cell lung cancer (EGFR mutation positive). Tyrosine kinase inhibitor. Associated with acneiform rash and diarrhea." },
  { "drug": "Hydrochlorothiazide", "back": "Hypertension, oedema in heart failure. Thiazide diuretic. Can cause hypokalaemia, hyperuricaemia, and hyponatraemia." },
  { "drug": "Hydrocodone", "back": "Moderate-to-severe pain, cough suppression. Opioid agonist. Often combined with acetaminophen. High abuse potential." },
  { "drug": "Hydralazine", "back": "Hypertension (often in pregnancy or severe HF with nitrates). Direct vasodilator. Can cause drug-induced lupus erythematosus." },
  { "drug": "Hydrocortisone", "back": "Adrenal insufficiency, severe inflammation, exacerbation of asthma/COPD. Glucocorticoid. High mineralocorticoid activity." },
  { "drug": "Hydroxyzine", "back": "Anxiety, pruritus, sedation. 1st generation antihistamine. Strong anticholinergic and sedative effects." },
  { "drug": "Haloperidol", "back": "Schizophrenia, acute psychosis, Tourette's syndrome. Typical antipsychotic. High risk of extrapyramidal symptoms (EPS)." },
  { "drug": "Heparin", "back": "DVT/PE treatment and prophylaxis, ACS. Anticoagulant. Activates antithrombin III. Monitor with aPTT. Risk of HIT." },
  { "drug": "Hyoscyamine", "back": "IBS, GI spasms, peptic ulcer disease adjunct. Anticholinergic. Belladonna alkaloid. Controls gastric hypermotility." },
  { "drug": "Homatropine", "back": "Mydriasis and cycloplegia for eye exams. Anticholinergic ophthalmic. Shorter duration of action than atropine." },
  { "drug": "Hydromorphone", "back": "Severe acute pain. Highly potent opioid. Much more potent than morphine (approx 5-7x). High risk of respiratory depression." },
  { "drug": "Hydroxychloroquine", "back": "Rheumatoid arthritis, SLE, malaria treatment/prophylaxis. DMARD. Requires baseline and periodic eye exams for retinopathy." },
  { "drug": "Ibuprofen", "back": "Mild-to-moderate pain, inflammation, fever. Non-selective NSAID. Inhibits COX-1 and COX-2. Take with food." },
  { "drug": "Ipratropium", "back": "COPD, acute asthma exacerbation. SAMA. Anticholinergic bronchodilator. Less effective than SABA in asthma." },
  { "drug": "Insulin Glargine", "back": "Type 1 and Type 2 diabetes. Long-acting basal insulin. Steady, peakless effect lasting 24 hours." },
  { "drug": "Insulin Lispro", "back": "Type 1 and Type 2 diabetes. Rapid-acting insulin. Give immediately before or after meals." },
  { "drug": "Insulin NPH", "back": "Type 1 and Type 2 diabetes. Intermediate-acting insulin. Cloudy suspension. Onset 1-2 hours, duration 14-24 hours." },
  { "drug": "Isosorbide Mononitrate", "back": "Angina pectoris prophylaxis. Long-acting nitrate. Requires a nitrate-free interval to prevent tolerance." },
  { "drug": "Irbesartan", "back": "Hypertension, diabetic nephropathy. ARB. Blocks angiotensin II at AT1 receptors. Avoid in pregnancy." },
  { "drug": "Indomethacin", "back": "Acute gout, closure of patent ductus arteriosus, severe pain. Potent NSAID. High incidence of GI side effects and frontal headaches." },
  { "drug": "Imatinib", "back": "CML (BCR-ABL positive), GIST. Tyrosine kinase inhibitor. Revolutionized CML treatment. Causes fluid retention." },
  { "drug": "Infliximab", "back": "Crohn's disease, ulcerative colitis, rheumatoid arthritis. TNF-alpha inhibitor. Chimeric monoclonal antibody given via IV infusion." },
  { "drug": "Isoniazid", "back": "Tuberculosis (treatment and latent infection). Antimycobacterial. Can cause hepatotoxicity and peripheral neuropathy (prevent with B6)." },
  { "drug": "Itraconazole", "back": "Onychomycosis, histoplasmosis, blastomycosis. Antifungal (triazole). Requires acidic gastric environment for optimal absorption." },
  { "drug": "Ivabradine", "back": "Chronic heart failure (stable), stable angina. Hyperpolarization-activated cyclic nucleotide-gated (HCN) channel blocker. Slows heart rate without affecting contractility." },
  { "drug": "Ivermectin", "back": "Strongyloidiasis, onchocerciasis, scabies. Anti-parasitic agent. Paralyzes parasite by increasing cell membrane permeability." },
  { "drug": "Ixekizumab", "back": "Plaque psoriasis, psoriatic arthritis. IL-17A inhibitor. Subcutaneous injection. May exacerbate Crohn's disease." },
  { "drug": "Januvia (Sitagliptin)", "back": "Type 2 diabetes. DPP-4 inhibitor. Increases incretin hormones, stimulating insulin release. Weight neutral." },
  { "drug": "Ketoconazole", "back": "Fungal infections, Cushing's syndrome (off-label). Antifungal. Strong CYP3A4 inhibitor. Severe hepatotoxicity risk with oral use." },
  { "drug": "Ketorolac", "back": "Short-term management of moderate-to-severe acute pain. Potent NSAID. Max 5 days total use due to severe GI/renal risks." },
  { "drug": "Klonopin (Clonazepam)", "back": "Seizures, panic disorder, akathisia. Benzodiazepine. Highly addictive; avoid abrupt withdrawal." },
  { "drug": "Lisinopril", "back": "Hypertension, heart failure, post-MI. ACE inhibitor. Not a prodrug. Can cause dry cough, hyperkalaemia, and renal impairment." },
  { "drug": "Losartan", "back": "Hypertension, diabetic nephropathy, stroke prevention (hypertensive patients). ARB. Blocks angiotensin II. Teratogenic." },
  { "drug": "Levothyroxine", "back": "Hypothyroidism, pituitary TSH suppression. Synthetic T4. Take on empty stomach 30-60 mins before breakfast." },
  { "drug": "Loratadine", "back": "Allergic rhinitis, chronic urticaria. 2nd generation antihistamine. Non-sedating at standard doses." },
  { "drug": "Lansoprazole", "back": "GERD, peptic ulcer disease, H. pylori eradication. PPI. Take 30-60 minutes before a meal." },
  { "drug": "Levofloxacin", "back": "Community-acquired pneumonia, skin infections, UTI. Respiratory fluoroquinolone. Broad spectrum including pneumococcus." },
  { "drug": "Latanoprost", "back": "Open-angle glaucoma, ocular hypertension. Prostaglandin analogue. Can cause permanent browning of iris color." },
  { "drug": "Lamotrigine", "back": "Epilepsy, bipolar I maintenance. Anticonvulsant. Titrate slowly to minimize risk of severe rash (SJS/TEN)." },
  { "drug": "Loperamide", "back": "Acute and chronic diarrhea. Mu-opioid agonist in GI tract. Does not cross blood-brain barrier at standard doses." },
  { "drug": "Labetalol", "back": "Hypertension, hypertensive emergency, pregnancy hypertension. Mixed alpha/beta blocker. Maintains placental blood flow." },
  { "drug": "Leflunomide", "back": "Rheumatoid arthritis. DMARD. Pyrimidine synthesis inhibitor. Teratogenic; remains in body for months unless washed out with cholestyramine." },
  { "drug": "Linezolid", "back": "VRE, MRSA, nosocomial pneumonia. Oxazolidinone. Weak MAO inhibitor (risk of serotonin syndrome with SSRIs). Causes myelosuppression." },
  { "drug": "Lithium", "back": "Bipolar disorder (mania and maintenance). Mood stabilizer. Narrow therapeutic index; requires regular blood level monitoring." },
  { "drug": "Lorazepam", "back": "Anxiety, status epilepticus, alcohol withdrawal. Benzodiazepine. Preferred in liver disease as it undergoes direct glucuronidation." },
  { "drug": "Lurasidone", "back": "Schizophrenia, bipolar depression. Atypical antipsychotic. Must be taken with food (at least 350 calories)." },
  { "drug": "Metformin", "back": "Type 2 diabetes, PCOS (off-label). Biguanide. Reduces hepatic glucose production. Risk of lactic acidosis. Weight neutral or weight loss." },
  { "drug": "Metoprolol", "back": "Hypertension, angina, heart failure (succinate), post-MI. Cardioselective beta-1 blocker. Succinate is XR; tartrate is IR." },
  { "drug": "Montelukast", "back": "Asthma maintenance, allergic rhinitis. Leukotriene receptor antagonist. Black box warning for serious neuropsychiatric events." },
  { "drug": "Morphine", "back": "Severe acute pain, chronic pain, dyspnoea in palliative care. Opioid agonist. Gold standard opioid. Causes constipation." },
  { "drug": "Methylprednisolone", "back": "Inflammation, severe asthma/COPD exacerbations, spinal cord injury (controversial). Glucocorticoid. Available as oral, IV, and depot injection." },
  { "drug": "Meloxicam", "back": "Osteoarthritis, rheumatoid arthritis. NSAID. Preferential COX-2 inhibitor at low doses. Once daily dosing." },
  { "drug": "Mirtazapine", "back": "Major depressive disorder. Alpha-2 antagonist. Increases serotonin and NE release. Causes sedation and weight gain (helpful in frail elderly)." },
  { "drug": "Methotrexate", "back": "Rheumatoid arthritis, psoriasis, malignancies, ectopic pregnancy. Antifolate DMARD. Teratogenic; requires folic acid supplementation." },
  { "drug": "Metronidazole", "back": "Anaerobic infections, C. difficile, trichomoniasis, giardiasis. Nitroimidazole. Disulfiram-like reaction with alcohol." },
  { "drug": "Memantine", "back": "Moderate-to-severe Alzheimer's disease. NMDA receptor antagonist. Helps reduce glutamate-mediated excitotoxicity." },
  { "drug": "Methyldopa", "back": "Hypertension in pregnancy. Centrally acting alpha-2 agonist. First line in pregnancy. Can cause positive Coombs test." },
  { "drug": "Modafinil", "back": "Narcolepsy, shift work sleep disorder, sleep apnea sleepiness. Wakefulness-promoting agent. Lower abuse potential than amphetamines." },
  { "drug": "Mupirocin", "back": "Impetigo, MRSA nasal decolonization. Topical antibiotic. Inhibits bacterial protein synthesis." },
  { "drug": "Mycophenolate", "back": "Organ transplant rejection prophylaxis, lupus nephritis. Immunosuppressant. Inhibits inosine monophosphate dehydrogenase. Teratogenic." },
  { "drug": "Midazolam", "back": "Pre-operative sedation, status epilepticus, procedural sedation. Short-acting benzodiazepine. High amnesic properties." },
  { "drug": "Naproxen", "back": "Mild-to-moderate pain, osteoarthritis, gout, dysmenorrhea. Non-selective NSAID. Considered to have the lowest CV risk among NSAIDs." },
  { "drug": "Nifedipine", "back": "Hypertension, chronic stable angina, Raynaud's, preterm labor. Dihydropyridine CCB. Do not use short-acting formulation for hypertensive crises." },
  { "drug": "Nitrofurantoin", "back": "Uncomplicated UTI treatment and prophylaxis. Urinary tract antibacterial. Ineffective if CrCl <30 mL/min. Risk of pulmonary fibrosis." },
  { "drug": "Naloxone", "back": "Opioid overdose reversal. Opioid antagonist. Short half-life; patient may relapse into overdose and require repeat doses." },
  { "drug": "Nortriptyline", "back": "Depression, neuropathic pain, smoking cessation. Tricyclic antidepressant. Active metabolite of amitriptyline; less sedating." },
  { "drug": "Nystatin", "back": "Candidiasis (oral, skin, GI). Polyene antifungal. Not absorbed systemically (swish and swallow for oral thrush)." },
  { "drug": "Nasal Fluticasone", "back": "Allergic rhinitis. Intranasal corticosteroid. Most effective class for treating symptoms of hay fever." },
  { "drug": "Nitroglycerin", "back": "Acute angina relief, chronic angina prophylaxis, heart failure. Nitrate. Relaxes vascular smooth muscle. Venodilator > arteriodilator." },
  { "drug": "Norepinephrine", "back": "Septic shock, severe hypotension. Sympathomimetic. Potent alpha-1 agonist with some beta-1 activity. Increases SVR." },
  { "drug": "Nefopam", "back": "Acute and chronic pain. Non-opioid analgesic. Inhibits reuptake of serotonin, NE, and dopamine. Anticholinergic side effects." },
  { "drug": "Nicardipine", "back": "Hypertension, hypertensive emergency. Dihydropyridine CCB. Available as IV infusion for rapid BP control." },
  { "drug": "Nimodipine", "back": "Aneurysmal subarachnoid hemorrhage. Dihydropyridine CCB. Prevents cerebral vasospasm. Give orally, NEVER IV." },
  { "drug": "Nitisinone", "back": "Hereditary tyrosinemia type 1. Inhibits 4-hydroxyphenylpyruvate dioxygenase. Prevents accumulation of toxic metabolites." },
  { "drug": "Nitrosoureas (e.g., Carmustine)", "back": "Brain tumors, Hodgkin's lymphoma. Alkylating agents. Highly lipid-soluble; cross the blood-brain barrier effectively." },
  { "drug": "Nalbuphine", "back": "Moderate-to-severe pain, opioid-induced pruritus. Mixed agonist-antagonist opioid. Can precipitate withdrawal in opioid-dependent patients." },
  { "drug": "Omeprazole", "back": "GERD, PUD, H. pylori eradication, Zollinger-Ellison. PPI. Inhibits H+/K+ ATPase. Interacts with clopidogrel." },
  { "drug": "Ondansetron", "back": "Chemotherapy-induced, post-op, and radiation-induced nausea/vomiting. 5-HT3 receptor antagonist. Can cause constipation and QT prolongation." },
  { "drug": "Oxycodone", "back": "Moderate-to-severe acute and chronic pain. Opioid agonist. High abuse potential. Available in IR and XR (OxyContin)." },
  { "drug": "Olanzapine", "back": "Schizophrenia, bipolar disorder, treatment-resistant depression (with fluoxetine). Atypical antipsychotic. High risk of weight gain and metabolic syndrome." },
  { "drug": "Oxymetazoline", "back": "Nasal congestion. Topical decongestant. Do not use for >3-5 days to avoid rebound congestion (rhinitis medicamentosa)." },
  { "drug": "Oseltamivir", "back": "Influenza A and B treatment and prophylaxis. Neuraminidase inhibitor. Most effective if started within 48 hours of symptom onset." },
  { "drug": "Oxcarbazepine", "back": "Epilepsy (focal seizures). Sodium channel blocker. Structurally related to carbamazepine but carries higher risk of hyponatremia." },
  { "drug": "Oxybutynin", "back": "Overactive bladder, urge incontinence. Anticholinergic/antispasmodic. Relaxes detrusor muscle. Significant anticholinergic side effects." },
  { "drug": "Octreotide", "back": "Acromegaly, carcinoid tumors, VIPomas, esophageal variceal bleeding. Somatostatin analogue. Inhibits growth hormone and GI peptides." },
  { "drug": "Olopatadine", "back": "Allergic conjunctivitis, allergic rhinitis. Mast cell stabilizer and antihistamine. Available as eye drops and nasal spray." },
  { "drug": "Ofloxacin", "back": "UTI, prostatitis, SSTI, otitis externa (ear drops). Fluoroquinolone. Broad spectrum. Avoid with antacids." },
  { "drug": "Olmesartan", "back": "Hypertension. ARB. Associated with a rare sprue-like enteropathy causing severe chronic diarrhea." },
  { "drug": "Omalizumab", "back": "Severe allergic asthma, chronic idiopathic urticaria. Anti-IgE monoclonal antibody. Reduces binding of IgE to mast cells." },
  { "drug": "Oxaliplatin", "back": "Colorectal cancer. Platinum-based alkylating agent. Associated with cold-induced peripheral neuropathy." },
  { "drug": "Ondansetron", "back": "Nausea and vomiting from chemo/surgery. 5-HT3 antagonist. Blocks serotonin in CTZ and vagal nerve." },
  { "drug": "Pantoprazole", "back": "GERD, peptic ulcer disease, hypersecretory states. PPI. Can be given IV. Associated with risk of C. diff and osteoporosis." },
  { "drug": "Paroxetine", "back": "MDD, GAD, OCD, PTSD, panic disorder. SSRI. Short half-life among SSRIs; carries higher risk of discontinuation syndrome." },
  { "drug": "Prednisone", "back": "Severe inflammation, asthma/COPD flares, autoimmune diseases, immunosuppression. Glucocorticoid. Requires tapering after prolonged use." },
  { "drug": "Pravastatin", "back": "Hypercholesterolaemia, CV prevention. Statin. Hydrophilic; less likely to cause myalgia than lipophilic statins." },
  { "drug": "Pregabalin", "back": "Neuropathic pain, fibromyalgia, GAD (in Europe), focal seizures. GABA analogue. Similar to gabapentin but more predictable absorption." },
  { "drug": "Propranolol", "back": "Hypertension, angina, tremor, migraine prophylaxis, portal hypertension, performance anxiety. Non-selective beta-blocker. Lipid soluble." },
  { "drug": "Phenytoin", "back": "Tonic-clonic seizures, status epilepticus (after benzo). Sodium channel blocker. Zero-order kinetics at high doses. Gingival hyperplasia." },
  { "drug": "Pioglitazone", "back": "Type 2 diabetes. Thiazolidinedione (TZD). Enhances insulin sensitivity. Can cause fluid retention; contraindicated in heart failure." },
  { "drug": "Potassium Chloride", "back": "Treatment and prevention of hypokalaemia. Electrolyte. Oral doses must be diluted or taken with food to avoid GI upset." },
  { "drug": "Phentermine", "back": "Short-term obesity management. Sympathomimetic stimulant. High abuse potential. Avoid in CV disease and hypertension." },
  { "drug": "Polyethylene Glycol", "back": "Constipation, bowel preparation for colonoscopy. Osmotic laxative. Draws water into the bowel. Generally well tolerated." },
  { "drug": "Phenazopyridine", "back": "UTI dysuria relief. Urinary tract analgesic. Does not treat infection. Turns urine a bright orange/red color." },
  { "drug": "Promethazine", "back": "Nausea and vomiting, motion sickness, sedation. 1st generation antihistamine / phenothiazine. Black box warning for respiratory depression in kids <2." },
  { "drug": "Penicillin V", "back": "Streptococcal pharyngitis, rheumatic fever prophylaxis. Natural penicillin. Oral formulation. Drug of choice for strep throat." },
  { "drug": "Pyrazinamide", "back": "Tuberculosis (part of standard 4-drug regimen). Antimycobacterial. Can cause hyperuricaemia (gout) and hepatotoxicity." },
  { "drug": "Quetiapine", "back": "Schizophrenia, bipolar disorder, MDD augmentation. Atypical antipsychotic. High affinity for H1 receptors (highly sedating)." },
  { "drug": "Quinapril", "back": "Hypertension, heart failure. ACE inhibitor. Prodrug. Can cause cough and hyperkalaemia. Contraindicated in pregnancy." },
  { "drug": "Quinidine", "back": "Atrial and ventricular arrhythmias (rarely used now), malaria. Class Ia antiarrhythmic. Can cause cinchonism (tinnitus, headache) and QT prolongation." },
  { "drug": "Quinine", "back": "Malaria, nocturnal leg cramps (not recommended due to safety). Cinchona alkaloid. Risk of severe thrombocytopenia." },
  { "drug": "Quinupristin/Dalfopristin", "back": "VRE, MRSA, complicated SSTI. Streptogramin antibiotic. Inhibits bacterial protein synthesis. Given via central line only due to phlebitis." },
  { "drug": "Quazepam", "back": "Insomnia. Benzodiazepine. Long half-life with active metabolites. High risk of next-day sedation and falls in elderly." },
  { "drug": "Rabeprazole", "back": "GERD, peptic ulcer disease, H. pylori eradication. PPI. Rapid onset of acid suppression. Extensively metabolized by non-enzymatic pathway." },
  { "drug": "Ramipril", "back": "Hypertension, heart failure, post-MI, CV risk reduction. ACE inhibitor. Large evidence base for CV protection (HOPE study)." },
  { "drug": "Ranitidine", "back": "GERD, peptic ulcer disease (mostly withdrawn from market due to NDMA impurities). H2 receptor antagonist." },
  { "drug": "Repaglinide", "back": "Type 2 diabetes. Meglitinide. Short-acting insulin secretagogue. Take strictly before meals; skip dose if skipping meal." },
  { "drug": "Rifampin", "back": "Tuberculosis, leprosy, meningococcal prophylaxis. Antimycobacterial. Strong CYP450 inducer. Turns body fluids orange-red." },
  { "drug": "Risedronate", "back": "Osteoporosis, Paget's disease. Bisphosphonate. Take on empty stomach with plain water; stay upright for 30 minutes." },
  { "drug": "Risperidone", "back": "Schizophrenia, bipolar mania, autism irritability. Atypical antipsychotic. Higher risk of hyperprolactinemia than other atypicals." },
  { "drug": "Rivaroxaban", "back": "AF stroke prevention, DVT/PE treatment and prophylaxis. DOAC. Direct factor Xa inhibitor. Take doses >=15mg with food." },
  { "drug": "Rizatriptan", "back": "Acute migraine attacks. 5-HT 1B/1D agonist. Vasoconstrictor. Contraindicated in uncontrolled hypertension and ischemic heart disease." },
  { "drug": "Ropinirole", "back": "Parkinson's disease, restless legs syndrome. Dopamine agonist. Can cause sudden sleep attacks and impulse control disorders." },
  { "drug": "Rosuvastatin", "back": "Hypercholesterolaemia, CV prevention. High-intensity statin. More potent on a mg-for-mg basis than atorvastatin." },
  { "drug": "Rituximab", "back": "NHL, CLL, rheumatoid arthritis, granulomatosis with polyangiitis. Anti-CD20 monoclonal antibody. Depletes B cells. Risk of PML." },
  { "drug": "Ranolazine", "back": "Chronic stable angina. Inhibits late inward sodium current. Used when other antianginals are insufficient. Extensively metabolized by CYP3A4." },
  { "drug": "Raltegravir", "back": "HIV-1 infection. Integrase inhibitor. High barrier to resistance. Generally well tolerated." },
  { "drug": "Sertraline", "back": "MDD, OCD, panic disorder, PTSD, PMDD, social anxiety. SSRI. Safe post-MI. Can cause GI upset (diarrhea) more than others." },
  { "drug": "Sildenafil", "back": "Erectile dysfunction, pulmonary arterial hypertension. PDE5 inhibitor. Absolutely contraindicated with nitrates (severe hypotension)." },
  { "drug": "Simvastatin", "back": "Hypercholesterolaemia, CV prevention. Statin. Max dose 20mg when taken with amlodipine due to myopathy risk." },
  { "drug": "Spironolactone", "back": "HF (HFrEF), hypertension (resistant), ascites, hyperaldosteronism, acne/hirsutism. Aldosterone antagonist. Can cause hyperkalaemia and gynecomastia." },
  { "drug": "Sitagliptin", "back": "Type 2 diabetes. DPP-4 inhibitor. Increases incretin levels. Weight neutral. Low risk of hypoglycemia." },
  { "drug": "Sulfamethoxazole/Trimethoprim", "back": "UTI, PCP treatment and prophylaxis, MRSA skin infections. Folate synthesis inhibitor combination. Risk of SJS/TEN and hyperkalaemia." },
  { "drug": "Sumatriptan", "back": "Acute migraine and cluster headaches. 5-HT 1B/1D agonist. Available as oral, nasal spray, and subcutaneous injection." },
  { "drug": "Solifenacin", "back": "Overactive bladder, urge incontinence. Anticholinergic. M3 selective antagonist. Less dry mouth than oxybutynin." },
  { "drug": "Salmeterol", "back": "Maintenance asthma and COPD. LABA. Never use as monotherapy in asthma (must be combined with an ICS)." },
  { "drug": "Sucralfate", "back": "Duodenal ulcers. Cytoprotective agent. Forms a protective paste-like barrier over ulcer craters. Take on an empty stomach." },
  { "drug": "Senna", "back": "Constipation. Stimulant laxative. Can cause abdominal cramping and melanosis coli with long-term use." },
  { "drug": "Selegiline", "back": "Parkinson's disease, major depression (transdermal). MAO-B inhibitor. At low doses, does not require dietary tyramine restrictions." },
  { "drug": "Scopolamine", "back": "Motion sickness, excessive salivation, end-of-life secretions. Anticholinergic. Transdermal patch placed behind the ear." },
  { "drug": "Sotalol", "back": "Ventricular arrhythmias, maintenance of sinus rhythm in AF. Combined Class II (beta-blocker) and Class III antiarrhythmic. High proarrhythmic risk." },
  { "drug": "Sirolimus", "back": "Organ transplant rejection prophylaxis. mTOR inhibitor. Can impair wound healing and cause hyperlipidemia." },
  { "drug": "Tamsulosin", "back": "BPH. Alpha-1A selective blocker. Relaxes prostate smooth muscle with minimal effect on systemic BP. Causes floppy iris syndrome." },
  { "drug": "Topiramate", "back": "Epilepsy, migraine prophylaxis, obesity (with phentermine). Anticonvulsant. Can cause weight loss, kidney stones, and cognitive dulling." },
  { "drug": "Tramadol", "back": "Moderate-to-moderately severe pain. Weak mu-agonist and SNRI. Lowers seizure threshold. Risk of serotonin syndrome with SSRIs." },
  { "drug": "Trazodone", "back": "Major depression, insomnia (off-label). SARI. Highly sedating at low doses (used for sleep). Risk of priapism." },
  { "drug": "Triamcinolone", "back": "Eczema, psoriasis, joint inflammation (IA injection), allergic rhinitis. Corticosteroid. Medium to high potency." },
  { "drug": "Tiotropium", "back": "COPD maintenance, asthma maintenance. LAMA. Long-acting anticholinergic bronchodilator. Once daily inhalation." },
  { "drug": "Telmisartan", "back": "Hypertension, CV risk reduction. ARB. Longest half-life among ARBs (24 hours). PPAR-gamma agonist activity." },
  { "drug": "Terazosin", "back": "Hypertension, BPH. Alpha-1 blocker. Causes smooth muscle relaxation. High risk of orthostatic hypotension." },
  { "drug": "Terbinafine", "back": "Onychomycosis, tinea infections. Allylamine antifungal. Oral therapy requires LFT monitoring. Concentrates in nails." },
  { "drug": "Tetracycline", "back": "Acne, H. pylori, chlamydia, mycoplasma. Tetracycline antibiotic. Chelates with divalent cations (don't take with milk/iron)." },
  { "drug": "Thiamine (Vitamin B1)", "back": "Wernicke-Korsakoff syndrome prevention, beriberi. Essential for carbohydrate metabolism. Give before glucose in alcoholics." },
  { "drug": "Tobramycin", "back": "Severe gram-negative infections, pseudomonas in CF (inhaled). Aminoglycoside. Nephro- and ototoxic." },
  { "drug": "Tolterodine", "back": "Overactive bladder, urge incontinence. Anticholinergic. Less dry mouth compared to oxybutynin." },
  { "drug": "Torsemide", "back": "Oedema in heart failure, renal failure, cirrhosis. Loop diuretic. Longer duration of action and more predictable absorption than furosemide." },
  { "drug": "Tacrolimus", "back": "Organ transplant rejection prophylaxis, atopic dermatitis (topical). Calcineurin inhibitor. Nephrotoxic; requires blood level monitoring." },
  { "drug": "Ursodeoxycholic Acid", "back": "Primary biliary cholangitis, gallstone dissolution. Bile acid. Reduces cholesterol content of bile." },
  { "drug": "Umeclidinium", "back": "COPD maintenance. LAMA. Often combined with vilanterol or fluticasone." },
  { "drug": "Urea (Topical)", "back": "Dry skin, hyperkeratotic conditions, ichthyosis. Keratolytic. Softens skin by dissolving the intercellular matrix." },
  { "drug": "Ulipristal", "back": "Emergency contraception (up to 5 days), uterine fibroids. Selective progesterone receptor modulator. More effective than levonorgestrel for EC." },
  { "drug": "Ustekinumab", "back": "Plaque psoriasis, psoriatic arthritis, Crohn's, ulcerative colitis. IL-12 and IL-23 inhibitor. Monoclonal antibody." },
  { "drug": "Valsartan", "back": "Hypertension, heart failure, post-MI. ARB. Blocks angiotensin II. Often combined with sacubitril (Entresto) for heart failure." },
  { "drug": "Venlafaxine", "back": "MDD, GAD, social anxiety, panic disorder. SNRI. Acts as an SSRI at low doses; increases NE reuptake at higher doses." },
  { "drug": "Verapamil", "back": "Angina, hypertension, rate control in AF, cluster headache prophylaxis. Non-dihydropyridine CCB. High risk of constipation and bradycardia." },
  { "drug": "Warfarin", "back": "AF stroke prevention, DVT/PE treatment and prophylaxis, prosthetic heart valves. Vitamin K antagonist. Requires INR monitoring." },
  { "drug": "Valacyclovir", "back": "Herpes simplex, herpes zoster, CMV prophylaxis. Prodrug of acyclovir with much better oral bioavailability." },
  { "drug": "Vancomycin", "back": "MRSA infections, severe C. difficile (oral). Glycopeptide antibiotic. Requires TDM for IV dosing. Risk of Red Man Syndrome." },
  { "drug": "Varenicline", "back": "Smoking cessation. Nicotinic ACh receptor partial agonist. Reduces cravings and withdrawal. Associated with vivid dreams." },
  { "drug": "Verapamil", "back": "SVT, rate control in AF, angina, hypertension. Class IV antiarrhythmic. High incidence of constipation." },
  { "drug": "Vigabatrin", "back": "Infantile spasms, refractory focal seizures. Irreversible GABA transaminase inhibitor. Can cause permanent visual field defects." },
  { "drug": "Vincristine", "back": "Leukemias, lymphomas, solid tumors. Vinca alkaloid. Inhibits microtubule formation. Associated with peripheral neuropathy." },
  { "drug": "Voriconazole", "back": "Invasive aspergillosis, severe candidiasis. Triazole antifungal. Can cause visual disturbances and photosensitivity." },
  { "drug": "Vilazodone", "back": "Major depressive disorder. SSRI and 5-HT1A partial agonist. Take with food to ensure adequate absorption." },
  { "drug": "Vedolizumab", "back": "Crohn's disease, ulcerative colitis. Integrin receptor antagonist. Gut-selective immunosuppressant." },
  { "drug": "Verapamil", "back": "Hypertension, angina, supraventricular arrhythmias. Non-dihydropyridine CCB. Causes negative inotropy; avoid in heart failure." },
  { "drug": "Xanax (Alprazolam)", "back": "Panic disorder, generalized anxiety disorder. Benzodiazepine. Highly potent with short half-life; high potential for rebound anxiety." },
  { "drug": "Xylometazoline", "back": "Nasal congestion. Topical decongestant. Max 3-5 days use to prevent rebound congestion." },
  { "drug": "Xarelto (Rivaroxaban)", "back": "Stroke prevention in AF, DVT/PE treatment. DOAC. Direct factor Xa inhibitor. Take doses >=15mg with food." },
  { "drug": "Zolpidem", "back": "Short-term management of insomnia. Sedative-hypnotic ('Z-drug'). Associated with complex sleep behaviors (e.g., sleepwalking)." },
  { "drug": "Zonisamide", "back": "Epilepsy (focal seizures), Parkinson's disease (off-label). Sulfonamide anticonvulsant. Can cause kidney stones and weight loss." },
  { "drug": "Zafirlukast", "back": "Asthma maintenance. Leukotriene receptor antagonist. Take on an empty stomach. Rare risk of hepatic failure." },
  { "drug": "Zidovudine", "back": "HIV infection, prevention of maternal-fetal HIV transmission. NRTI. Associated with macrocytic anemia and lipoatrophy." },
  { "drug": "Ziprasidone", "back": "Schizophrenia, acute bipolar mania. Atypical antipsychotic. Must take with a meal (>=500 calories). High risk of QT prolongation." },
  { "drug": "Zoledronic Acid", "back": "Osteoporosis, Paget's disease, hypercalcemia of malignancy. Bisphosphonate. Given IV once yearly for osteoporosis." },
  { "drug": "Zopiclone", "back": "Short-term management of insomnia. Non-benzodiazepine hypnotic ('Z-drug'). Can cause a metallic taste in the mouth." },
  { "drug": "Zaltoprofen", "back": "Pain and inflammation (arthritis, post-surgery). NSAID. Inhibits COX and bradykinin. Popular in some Asian markets." },
  { "drug": "Zileuton", "back": "Asthma prophylaxis. 5-lipoxygenase inhibitor. Requires LFT monitoring due to risk of hepatotoxicity." },
  { "drug": "Zuclopenthixol", "back": "Schizophrenia, acute psychosis, severe agitation. Typical antipsychotic. Available in long-acting decanoate depot injection." },
  { "drug": "Zucapsaicin", "back": "Severe osteoarthritis pain. Topical analgesic. Depletes substance P in nerve endings." },
  { "drug": "Acarbose", "back": "Type 2 diabetes. Alpha-glucosidase inhibitor. Delays carbohydrate absorption. Causes significant flatulence and diarrhea." },
  { "drug": "Acetazolamide", "back": "Glaucoma, mountain sickness prophylaxis, oedema. Carbonic anhydrase inhibitor. Causes metabolic acidosis." },
  { "drug": "Acetylcysteine", "back": "Acetaminophen overdose, mucolytic in COPD/CF. Replenishes glutathione. Smells like rotten eggs." },
  { "drug": "Aliskiren", "back": "Hypertension. Direct renin inhibitor. Do not combine with ACEi or ARBs in diabetic patients due to hyperkalaemia." },
  { "drug": "Amantadine", "back": "Parkinson's disease, drug-induced EPS, Influenza A (no longer recommended). Increases dopamine release. Causes livedo reticularis." },
  { "drug": "Amiloride", "back": "Hypertension, heart failure, hypokalaemia prevention. Potassium-sparing diuretic. Blocks ENaC channels." },
  { "drug": "Amiodarone", "back": "Ventricular arrhythmias, AF rhythm control. Class III antiarrhythmic. Massive half-life. Can cause thyroid, pulmonary, and liver toxicity." },
  { "drug": "Amphotericin B", "back": "Severe systemic fungal infections. Polyene antifungal. 'Amphoterrible' due to high rates of nephrotoxicity and infusion reactions." },
  { "drug": "Ampicillin", "back": "Meningitis (Listeria coverage), endocarditis, respiratory infections. Aminopenicillin. Often combined with sulbactam." },
  { "drug": "Anastrozole", "back": "Hormone receptor-positive breast cancer in postmenopausal women. Aromatase inhibitor. Can cause bone loss and arthralgias." },
  { "drug": "Aprepitant", "back": "Chemotherapy-induced nausea and vomiting. NK1 receptor antagonist. Usually combined with a 5-HT3 antagonist and dexamethasone." },
  { "drug": "Arformoterol", "back": "COPD maintenance. LABA. Nebulized R-enantiomer of formoterol." },
  { "drug": "Armodafinil", "back": "Narcolepsy, shift work sleep disorder, sleep apnea sleepiness. Wakefulness-promoting agent. R-enantiomer of modafinil." },
  { "drug": "Asenapine", "back": "Schizophrenia, bipolar mania. Atypical antipsychotic. Sublingual tablet; do not eat or drink for 10 minutes after administration." },
  { "drug": "Atazanavir", "back": "HIV-1 infection. Protease inhibitor. Requires acidic gastric pH for absorption (avoid PPIs). Can cause unconjugated hyperbilirubinemia." },
  { "drug": "Atomoxetine", "back": "ADHD. Non-stimulant. Selective NE reuptake inhibitor. Slower onset of effect than stimulants (takes weeks)." },
  { "drug": "Atropine", "back": "Symptomatic bradycardia, organophosphate poisoning, pupil dilation. Anticholinergic. Increases heart rate by blocking vagal tone." },
  { "drug": "Azelastine", "back": "Allergic rhinitis, allergic conjunctivitis. Antihistamine. Available as nasal spray and eye drops. Can cause a bitter taste." },
  { "drug": "Azathioprine", "back": "Rheumatoid arthritis, Crohn's, transplant rejection. Immunosuppressant. Prodrug of 6-mercaptopurine. Test TPMT activity before starting." },
  { "drug": "Aztreonam", "back": "Gram-negative infections in penicillin-allergic patients. Monobactam. No cross-reactivity with other beta-lactams (except ceftazidime)." },
  { "drug": "Balsalazide", "back": "Ulcerative colitis. 5-ASA derivative. Prodrug cleaved by bacterial flora in the colon." },
  { "drug": "Banzel (Rufinamide)", "back": "Lennox-Gastaut syndrome seizures. Anticonvulsant. Shortens the QT interval." },
  { "drug": "Baxdela (Delafloxacin)", "back": "Skin infections, community-acquired pneumonia. Fluoroquinolone. Covers MRSA and Pseudomonas." },
  { "drug": "Belimumab", "back": "Systemic lupus erythematosus (SLE). Monoclonal antibody against BLyS. Reduces autoantibody-producing B cells." },
  { "drug": "Bempedoic Acid", "back": "Hypercholesterolemia (statin-intolerant). Inhibits ATP citrate lyase. Lowers LDL-C without the muscle side effects of statins." },
  { "drug": "Benzonatate", "back": "Cough suppression. Non-narcotic antitussive. Anesthetizes stretch receptors in respiratory passages. Do not chew (risk of choking)." },
  { "drug": "Benzoyl Peroxide", "back": "Acne vulgaris. Topical antibacterial and keratolytic. Can bleach clothing and towels." },
  { "drug": "Biktarvy (Bictegravir/Emtricitabine/TAF)", "back": "HIV-1 infection. Complete single-tablet regimen containing an INSTI and two NRTIs." },
  { "drug": "Bimatoprost", "back": "Glaucoma, hypotrichosis of eyelashes. Prostaglandin analogue. Promotes eyelash growth." },
  { "drug": "Bortezomib", "back": "Multiple myeloma, mantle cell lymphoma. Proteasome inhibitor. Can cause peripheral neuropathy and shingles reactivation." },
  { "drug": "Bosentan", "back": "Pulmonary arterial hypertension. Dual endothelin receptor antagonist. Highly teratogenic; requires monthly LFT monitoring." },
  { "drug": "Brentuximab", "back": "Hodgkin's lymphoma, systemic anaplastic large cell lymphoma. Antibody-drug conjugate targeting CD30." },
  { "drug": "Brivaracetam", "back": "Epilepsy (focal seizures). Anticonvulsant. High affinity for synaptic vesicle protein 2A (SV2A)." },
  { "drug": "Budesonide/Formoterol", "back": "Asthma maintenance, COPD maintenance. ICS/LABA combination. Can be used as SMART (maintenance and reliever therapy) in asthma." },
  { "drug": "Bupivacaine", "back": "Local and regional anesthesia, spinal anesthesia. Amide local anesthetic. Highly cardiotoxic if given IV." },
  { "drug": "Buspirone", "back": "Generalized anxiety disorder. Non-benzodiazepine anxiolytic. 5-HT1A partial agonist. No abuse potential; takes weeks to work." },
  { "drug": "Busulfan", "back": "Conditioning before bone marrow transplant, CML. Alkylating agent. Can cause severe pulmonary fibrosis ('busulfan lung')." },
  { "drug": "Butorphanol", "back": "Moderate-to-severe pain, migraine relief (nasal spray). Mixed agonist-antagonist opioid. Lowers abuse potential vs pure agonists." },
  { "drug": "Cabergoline", "back": "Hyperprolactinemia. Dopamine agonist. Higher affinity for D2 receptors than bromocriptine. Long-acting." },
  { "drug": "Calcitonin", "back": "Hypercalcemia, Paget's disease, osteoporosis (less preferred). Inhibits bone resorption. Available as nasal spray." },
  { "drug": "Calcitriol", "back": "Hypocalcemia in dialysis patients, hypoparathyroidism. Active form of Vitamin D (1,25-dihydroxyvitamin D3)." },
  { "drug": "Cangrelor", "back": "P2Y12 inhibitor for patients undergoing PCI. Intravenous antiplatelet agent with very rapid onset and offset." },
  { "drug": "Caplacizumab", "back": "Acquired thrombotic thrombocytopenic purpura (aTTP). Anti-vWF monoclonal antibody." },
  { "drug": "Captopril", "back": "Hypertension, heart failure, post-MI, diabetic nephropathy. ACE inhibitor. Short half-life; must be taken multiple times daily." },
  { "drug": "Carbidopa/Levodopa", "back": "Parkinson's disease. Gold standard treatment. Carbidopa prevents peripheral breakdown of levodopa." },
  { "drug": "Carglumic Acid", "back": "Hyperammonemia due to NAGS deficiency. Orphan drug that activates carbamoyl phosphate synthetase 1." },
  { "drug": "Carmustine", "back": "Brain tumors, Hodgkin's disease. Nitrosourea alkylating agent. Can cross the blood-brain barrier." },
  { "drug": "Casofungin", "back": "Invasive candidiasis, aspergillosis (refractory). Echinocandin antifungal. Inhibits beta(1,3)-D-glucan synthesis." },
  { "drug": "Cefazolin", "back": "Surgical prophylaxis, MSSA infections. 1st generation cephalosporin. Drug of choice for surgical infection prevention." },
  { "drug": "Cefdinir", "back": "Pneumonia, acute otitis media, SSTI. 3rd generation cephalosporin. Can cause reddish stools if taken with iron supplements." },
  { "drug": "Cefepime", "back": "Febrile neutropenia, nosocomial pneumonia. 4th generation cephalosporin. Excellent coverage against Pseudomonas." },
  { "drug": "Cefotaxime", "back": "Meningitis, pneumonia, sepsis. 3rd generation cephalosporin. Preferred over ceftriaxone in neonates (no biliary sludge risk)." },
  { "drug": "Cefoxitin", "back": "Surgical prophylaxis (colorectal), PID. 2nd generation cephalosporin (cephamycin). Excellent anaerobic coverage." },
  { "drug": "Ceftazidime", "back": "Pseudomonas infections. 3rd generation cephalosporin with anti-pseudomonal activity. Lacks good gram-positive coverage." },
  { "drug": "Ceftobiprole", "back": "Pneumonia, SSTI. 5th generation cephalosporin. Covers MRSA and Pseudomonas." },
  { "drug": "Ceftolozane/Tazobactam", "back": "Complicated intra-abdominal infections, complicated UTI. Cephalosporin/beta-lactamase inhibitor combo. Strong anti-pseudomonal activity." },
  { "drug": "Ceftriaxone", "back": "Meningitis, gonorrhea, community-acquired pneumonia. 3rd generation cephalosporin. Long half-life (once daily). Avoid in neonates." },
  { "drug": "Cefuroxime", "back": "Pneumonia, acute otitis media, Lyme disease. 2nd generation cephalosporin. Available as both oral and IV." },
  { "drug": "Certolizumab", "back": "Crohn's disease, rheumatoid arthritis. TNF-alpha inhibitor. Pegylated Fab fragment; does not cross the placenta." },
  { "drug": "Cetirizine", "back": "Allergic rhinitis, chronic urticaria. 2nd generation antihistamine. More sedating than loratadine or fexofenadine." },
  { "drug": "Cetuximab", "back": "Colorectal cancer, head and neck cancer. Anti-EGFR monoclonal antibody. Only effective in patients with wild-type KRAS." },
  { "drug": "Chloramphenicol", "back": "Bacterial meningitis, typhoid fever (in resource-limited settings). Broad spectrum. Can cause Grey Baby Syndrome and aplastic anemia." },
  { "drug": "Chlordiazepoxide", "back": "Alcohol withdrawal, anxiety. Benzodiazepine. Very long half-life with active metabolites. Gold standard for DT prevention." },
  { "drug": "Chlorpromazine", "back": "Schizophrenia, intractable hiccups, severe behavioral problems. Typical antipsychotic (low potency). Highly sedating." },
  { "drug": "Chlorpropamide", "back": "Type 2 diabetes. 1st generation sulfonylurea. Long-acting; can cause disulfiram-like reaction and SIADH. Rarely used." },
  { "drug": "Chlorthalidone", "back": "Hypertension, edema. Thiazide-like diuretic. More potent and longer acting than hydrochlorothiazide. Preferred in guidelines." },
  { "drug": "Cholestyramine", "back": "Hyperlipidemia, pruritus in biliary obstruction, bile acid diarrhea. Bile acid sequestrant. Can cause severe constipation and drug malabsorption." },
  { "drug": "Cidofovir", "back": "CMV retinitis in HIV patients. Antiviral. Highly nephrotoxic; must be given with probenecid and pre-hydration." },
  { "drug": "Cisplatin", "back": "Testicular, ovarian, lung, bladder cancers. Platinum alkylating agent. Highly emetogenic and nephrotoxic. Use amifostine to protect kidneys." },
  { "drug": "Clemastine", "back": "Allergic rhinitis, urticaria. 1st generation antihistamine. Highly sedating with strong anticholinergic effects." },
  { "drug": "Clofibrate", "back": "Hypertriglyceridemia. Fibrate. No longer widely used due to increased overall mortality in clinical trials." },
  { "drug": "Clomiphene", "back": "Infertility due to anovulation. Selective estrogen receptor modulator (SERM). Blocks estrogen feedback, increasing FSH/LH release." },
  { "drug": "Clopidogrel", "back": "Reduction of atherosclerotic events (MI, stroke) in patients with CAD, PAD, or post-stenting. P2Y12 platelet inhibitor." },
  { "drug": "Clozapine", "back": "Treatment-resistant schizophrenia. Atypical antipsychotic. Most effective but carries risk of agranulocytosis. Requires regular CBC monitoring." },
  { "drug": "Cocaine", "back": "Topical anesthesia and vasoconstriction for ENT procedures. Local anesthetic and sympathomimetic. High abuse potential." },
  { "drug": "Colestipol", "back": "Hyperlipidemia. Bile acid sequestrant. Can bind and decrease the absorption of other medications." },
  { "drug": "Crizotinib", "back": "NSCLC (ALK-positive). Tyrosine kinase inhibitor. Associated with visual disturbances and hepatotoxicity." },
  { "drug": "Cyclophosphamide", "back": "Lymphomas, breast cancer, severe autoimmune diseases (e.g., lupus nephritis). Alkylating agent. Can cause hemorrhagic cystitis (prevent with mesna)." },
  { "drug": "Cyclosporine", "back": "Organ transplant rejection prophylaxis, rheumatoid arthritis, psoriasis. Calcineurin inhibitor. Can cause nephrotoxicity and gum hyperplasia." },
  { "drug": "Cyproheptadine", "back": "Allergies, serotonin syndrome (off-label), appetite stimulation. 1st generation antihistamine with strong antiserotonergic effects." },
  { "drug": "Cytarabine", "back": "Acute myeloid leukemia (AML), non-Hodgkin's lymphoma. Pyrimidine analogue. Can cause severe cerebellar toxicity at high doses." },
  { "drug": "Dacarbazine", "back": "Malignant melanoma, Hodgkin's lymphoma. Alkylating agent. Highly emetogenic." },
  { "drug": "Daclizumab", "back": "Organ transplant rejection prophylaxis, relapsing MS (withdrawn due to liver injury). Anti-CD25 monoclonal antibody." },
  { "drug": "Dactinomycin", "back": "Wilms tumor, Ewing sarcoma, rhabdomyosarcoma. Antitumor antibiotic. Intercalates in DNA." },
  { "drug": "Dalfampridine", "back": "Improvement in walking speed in patients with MS. Potassium channel blocker. Increases seizure risk at higher doses." },
  { "drug": "Dalteparin", "back": "DVT/PE prophylaxis and treatment. Low molecular weight heparin. Given via subcutaneous injection." },
  { "drug": "Danazol", "back": "Endometriosis, hereditary angioedema. Synthetic androgen. Suppresses pituitary-ovarian axis." },
  { "drug": "Dantrolene", "back": "Malignant hyperthermia, neuroleptic malignant syndrome, spasticity. Ryanodine receptor antagonist. Blocks calcium release from sarcoplasmic reticulum." },
  { "drug": "Dapagliflozin", "back": "Type 2 diabetes, HFrEF, chronic kidney disease. SGLT2 inhibitor. Promotes urinary glucose excretion." },
  { "drug": "Dapsone", "back": "Leprosy, dermatitis herpetiformis, PCP prophylaxis. Sulfone antibiotic. Can cause hemolysis in G6PD deficient patients." },
  { "drug": "Daptomycin", "back": "Complicated SSTI, bacteremia (MRSA). Cyclic lipopeptide. Inactivated by pulmonary surfactant; do not use for pneumonia." },
  { "drug": "Daratumumab", "back": "Multiple myeloma. Anti-CD38 monoclonal antibody. Can interfere with blood cross-matching." },
  { "drug": "Darunavir", "back": "HIV-1 infection. Protease inhibitor. High genetic barrier to resistance. Must be given with a booster (ritonavir or cobicistat)." },
  { "drug": "Dasatinib", "back": "CML (including imatinib-resistant), Ph+ ALL. Tyrosine kinase inhibitor. Can cause pleural effusions." },
  { "drug": "Decitabine", "back": "Myelodysplastic syndromes (MDS). Hypomethylating agent. Inhibits DNA methyltransferase." },
  { "drug": "Deferasirox", "back": "Chronic iron overload due to blood transfusions. Oral iron chelator. Requires monitoring of kidney and liver function." },
  { "drug": "Deferoxamine", "back": "Acute iron intoxication, chronic iron overload. Parenteral iron chelator. Can cause infusion reactions and ototoxicity." },
  { "drug": "Delavirdine", "back": "HIV-1 infection. NNRTI. Rarely used now due to frequent dosing and high pill burden." },
  { "drug": "Denosumab", "back": "Osteoporosis, bone metastases (prevention of skeletal events). Anti-RANKL monoclonal antibody. Inhibits osteoclast formation." },
  { "drug": "Desipramine", "back": "Depression, neuropathic pain. Tricyclic antidepressant. Active metabolite of imipramine. Least anticholinergic of the TCAs." },
  { "drug": "Desmopressin (DDAVP)", "back": "Central diabetes insipidus, nocturnal enuresis, von Willebrand disease (type 1). Synthetic ADH analogue. Can cause hyponatremia." },
  { "drug": "Desonide", "back": "Atopic dermatitis, psoriasis. Low potency topical corticosteroid. Safe for use on the face and skin folds." },
  { "drug": "Dexlansoprazole", "back": "GERD, erosive esophagitis. PPI. Dual delayed-release formulation allows for flexible dosing time." },
  { "drug": "Dexmedetomidine", "back": "Sedation in the ICU, procedural sedation. Alpha-2 agonist. Provides conscious sedation without respiratory depression." },
  { "drug": "Dexmethylphenidate", "back": "ADHD. CNS stimulant. D-enantiomer of methylphenidate. High potential for abuse and dependence." },
  { "drug": "Dextromethorphan", "back": "Cough suppression. Non-narcotic antitussive. NMDA receptor antagonist at high doses (can cause dissociative states)." },
  { "drug": "Diclofenac", "back": "Osteoarthritis, rheumatoid arthritis, acute pain. NSAID. Higher risk of hepatotoxicity and CV events compared to naproxen." },
  { "drug": "Dicloxacillin", "back": "MSSA infections (skin, bone). Penicillinase-resistant penicillin. Oral formulation." },
  { "drug": "Didanosine", "back": "HIV infection (rarely used now). NRTI. Can cause severe pancreatitis and peripheral neuropathy." },
  { "drug": "Diethylstilbestrol (DES)", "back": "Prostate cancer (palliative), previously used to prevent miscarriage. Synthetic estrogen. Associated with clear cell adenocarcinoma in daughters exposed in utero." },
  { "drug": "Diflunisal", "back": "Mild-to-moderate pain, osteoarthritis. Salicylate derivative NSAID. Longer duration of action than aspirin; no antipyretic activity." },
  { "drug": "Diphenhydramine", "back": "Allergies, motion sickness, insomnia, drug-induced dystonia. 1st generation antihistamine. Highly sedating with strong anticholinergic properties." },
  { "drug": "Diphenoxylate", "back": "Diarrhea. Opioid agonist. Combined with atropine (Lomotil) to discourage abuse. Crosses BBB." },
  { "drug": "Dipyridamole", "back": "Thromboembolism prophylaxis (with warfarin), stroke prevention (with aspirin), pharmacologic stress testing. Phosphodiesterase inhibitor." },
  { "drug": "Disopyramide", "back": "Ventricular arrhythmias. Class Ia antiarrhythmic. Strong anticholinergic and negative inotropic effects. Avoid in HF." },
  { "drug": "Disulfiram", "back": "Chronic alcoholism (maintenance of sobriety). Inhibits aldehyde dehydrogenase. Causes severe flushing, nausea, and tachycardia with alcohol." },
  { "drug": "Dobutamine", "back": "Cardiogenic shock, severe heart failure, pharmacologic stress testing. Sympathomimetic. Beta-1 agonist. Increases contractility more than heart rate." },
  { "drug": "Docetaxel", "back": "Breast, lung, prostate, gastric cancers. Taxane antimicrotubule agent. Associated with severe fluid retention." },
  { "drug": "Dofetilide", "back": "Maintenance of sinus rhythm in AF/A-flutter. Class III antiarrhythmic. Pure potassium channel blocker. Requires inpatient initiation for QTc monitoring." },
  { "drug": "Dolasetron", "back": "Chemotherapy-induced nausea and vomiting. 5-HT3 receptor antagonist. Oral formulation only for CINV due to IV risk of QT prolongation." },
  { "drug": "Dolutegravir", "back": "HIV-1 infection. Integrase inhibitor. High genetic barrier to resistance. Preferred first-line agent in many guidelines." },
  { "drug": "Dornase Alfa", "back": "Cystic fibrosis (improves lung function). Recombinant human DNase. Breaks down DNA in sputum, reducing viscosity." },
  { "drug": "Doxorubicin", "back": "Breast cancer, lymphomas, sarcomas. Antitumor antibiotic. Intercalates in DNA. Cardiotoxic (prevent with dexrazoxane). Turns urine red." },
  { "drug": "Doxylamine", "back": "Insomnia, morning sickness in pregnancy (with pyridoxine). 1st generation antihistamine. Highly sedating." },
  { "drug": "Dronabinol", "back": "Chemotherapy-induced nausea, anorexia in AIDS patients. Synthetic Delta-9-THC. Can cause cannabinoid-induced side effects." },
  { "drug": "Dronedarone", "back": "Maintenance of sinus rhythm in AF. Class III antiarrhythmic. Less toxic than amiodarone but contraindicated in severe heart failure." },
  { "drug": "Droperidol", "back": "Postoperative nausea and vomiting, acute agitation. Typical antipsychotic (butyrophenone). Black box warning for QT prolongation." },
  { "drug": "Droxidopa", "back": "Neurogenic orthostatic hypotension (e.g., in Parkinson's). Synthetic amino acid precursor of norepinephrine." },
  { "drug": "Dulaglutide", "back": "Type 2 diabetes. GLP-1 receptor agonist. Once-weekly subcutaneous injection. Lowers CV risk." },
  { "drug": "Echinocandins (e.g., Micafungin)", "back": "Invasive candidiasis, esophageal candidiasis. Antifungals. Inhibit fungal cell wall synthesis. Well tolerated." },
  { "drug": "Echothiophate", "back": "Glaucoma (rarely used). Irreversible acetylcholinesterase inhibitor. Long-acting miotic." },
  { "drug": "Econazole", "back": "Tinea infections, cutaneous candidiasis. Topical imidazole antifungal." },
  { "drug": "Eculizumab", "back": "Paroxysmal nocturnal hemoglobinuria (PNH), atypical HUS. Anti-C5 monoclonal antibody. Increases risk of meningococcal infections." },
  { "drug": "Edrophonium", "back": "Diagnosis of myasthenia gravis (Tensilon test). Short-acting acetylcholinesterase inhibitor. Improves muscle strength briefly." },
  { "drug": "Efavirenz", "back": "HIV-1 infection. NNRTI. Associated with vivid dreams and CNS side effects. Contraindicated in first trimester of pregnancy." },
  { "drug": "Eledoisin", "back": "Research tool (vasodilator peptide). Tachykinin family." },
  { "drug": "Eletriptan", "back": "Acute migraine attacks. 5-HT 1B/1D agonist. Metabolized by CYP3A4." },
  { "drug": "Elinogrel", "back": "Antiplatelet agent (investigational). P2Y12 inhibitor." },
  { "drug": "Eltrombopag", "back": "Chronic ITP, aplastic anemia. Thrombopoietin receptor agonist. Oral formulation. Requires LFT monitoring." },
  { "drug": "Eluxadoline", "back": "IBS with diarrhea (IBS-D). Mixed opioid receptor modulator. Contraindicated in patients without a gallbladder (risk of pancreatitis)." },
  { "drug": "Elvitegravir", "back": "HIV-1 infection. Integrase inhibitor. Must be boosted with cobicistat." },
  { "drug": "Emcitabine", "back": "HIV infection. NRTI. Cytidine analogue. Active against HBV as well." },
  { "drug": "Eminase (Anistreplase)", "back": "Acute MI (rarely used now). Thrombolytic agent. Complex of streptokinase and plasminogen." },
  { "drug": "Emtricitabine", "back": "HIV infection, HBV infection. NRTI. Often combined with tenofovir (Truvada/Descovy) for PrEP." },
  { "drug": "Enasidenib", "back": "AML with IDH2 mutation. Inhibits the mutant IDH2 enzyme. Risk of differentiation syndrome." },
  { "drug": "Encorafenib", "back": "Metastatic melanoma, colorectal cancer (with cetuximab). BRAF inhibitor." },
  { "drug": "Entacapone", "back": "Parkinson's disease (adjunct to carbidopa/levodopa). COMT inhibitor. Prevents peripheral breakdown of levodopa. Turns urine brown-orange." },
  { "drug": "Enzalutamide", "back": "Prostate cancer (castration-resistant). Androgen receptor inhibitor. Can cause fatigue and increase seizure risk." },
  { "drug": "Epinastine", "back": "Allergic conjunctivitis. Antihistamine and mast cell stabilizer eye drops." },
  { "drug": "Epoprostenol", "back": "Pulmonary arterial hypertension. Synthetic prostacyclin (PGI2). Very short half-life; requires continuous IV infusion via central line." },
  { "drug": "Eprosartan", "back": "Hypertension. ARB. Blocks angiotensin II." },
  { "drug": "Eptifibatide", "back": "ACS undergoing PCI. Glycoprotein IIb/IIIa inhibitor. Intravenous antiplatelet agent." },
  { "drug": "Eravacycline", "back": "Complicated intra-abdominal infections. Fluorocycline antibiotic (similar to tetracyclines)." },
  { "drug": "Eribulin", "back": "Metastatic breast cancer, liposarcoma. Non-taxane microtubule inhibitor. Derived from marine sponge." },
  { "drug": "Erlotinib", "back": "NSCLC (EGFR-positive), pancreatic cancer (with gemcitabine). Tyrosine kinase inhibitor. Causes acneiform rash." },
  { "drug": "Ertapenem", "back": "Complicated intra-abdominal infections, skin infections, pneumonia. Carbapenem. Lacks activity against Pseudomonas and Acinetobacter." },
  { "drug": "Esmolol", "back": "Aortic dissection, hypertensive emergency, rate control in AF. Ultra-short-acting beta-1 blocker. Given as continuous IV infusion." },
  { "drug": "Esomeprazole", "back": "GERD, PUD, H. pylori eradication. PPI. S-enantiomer of omeprazole." },
  { "drug": "Estramustine", "back": "Prostate cancer. Combination of estrogen and nitrogen mustard." },
  { "drug": "Estropipate", "back": "Menopause symptoms, osteoporosis prevention. Estrogen supplement." },
  { "drug": "Eszopiclone", "back": "Insomnia. Non-benzodiazepine hypnotic ('Z-drug'). Can be used for longer-term therapy compared to others. Causes metallic taste." },
  { "drug": "Ethacrynic Acid", "back": "Edema. Loop diuretic. The only loop diuretic that is not a sulfonamide (safe in sulfa allergy). Highest rate of ototoxicity." },
  { "drug": "Ethambutol", "back": "Tuberculosis (part of standard 4-drug regimen). Antimycobacterial. Can cause optic neuritis (color blindness and decreased visual acuity)." },
  { "drug": "Ethinyl Estradiol", "back": "Contraception, hormone replacement therapy. Synthetic estrogen. High risk of VTE, especially in smokers over 35." },
  { "drug": "Ethosuximide", "back": "Absence seizures. Calcium channel blocker (T-type). Drug of choice for absence seizures. Can cause GI distress." },
  { "drug": "Etidronate", "back": "Paget's disease, heterotopic ossification. Bisphosphonate. Less potent than newer bisphosphonates." },
  { "drug": "Etodolac", "back": "Osteoarthritis, rheumatoid arthritis, acute pain. NSAID. Shows some COX-2 selectivity." },
  { "drug": "Etomidate", "back": "Induction of general anesthesia. Non-barbiturate hypnotic. Hemodynamically stable but causes transient adrenal suppression." },
  { "drug": "Etoposide", "back": "Small cell lung cancer, testicular cancer. Topoisomerase II inhibitor. Can cause myelosuppression and secondary leukemia." },
  { "drug": "Exemestane", "back": "Breast cancer in postmenopausal women. Irreversible aromatase inactivator (steroidal)." },
  { "drug": "Exenatide", "back": "Type 2 diabetes. GLP-1 receptor agonist. Available as twice-daily or once-weekly (Bydureon) injection." },
  { "drug": "Ezogabine", "back": "Epilepsy (withdrawn due to side effects). Potassium channel opener. Caused blue skin discoloration and retinal abnormalities." },
  { "drug": "Famciclovir", "back": "Herpes zoster, herpes simplex. Prodrug of penciclovir. Good oral bioavailability." },
  { "drug": "Farnesyltransferase Inhibitors (e.g., Tipifarnib)", "back": "Investigational cancer therapies. Target protein prenylation." },
  { "drug": "Febuxostat", "back": "Chronic gout management. Xanthine oxidase inhibitor. Alternative to allopurinol; black box warning for increased CV death." },
  { "drug": "Felbamate", "back": "Refractory epilepsy. Anticonvulsant. Associated with aplastic anemia and hepatic failure; requires signed informed consent." },
  { "drug": "Felodipine", "back": "Hypertension. Dihydropyridine CCB. High vascular selectivity." },
  { "drug": "Fenofibrate", "back": "Hypertriglyceridemia. Fibrate. Activates PPAR-alpha. Risk of myopathy when combined with statins." },
  { "drug": "Fenoldopam", "back": "Hypertensive emergency. Dopamine D1 receptor agonist. Causes rapid vasodilation while maintaining renal perfusion." },
  { "drug": "Fenoprofen", "back": "Osteoarthritis, rheumatoid arthritis, acute pain. NSAID. Can cause nephrotoxicity (interstitial nephritis)." },
  { "drug": "Fentanyl", "back": "Severe chronic pain (patch), acute pain (IV), breakthrough cancer pain (lozenge). Highly potent synthetic opioid." },
  { "drug": "Ferrous Gluconate", "back": "Iron deficiency anemia. Iron supplement. Better tolerated by some than ferrous sulfate." },
  { "drug": "Fesoterodine", "back": "Overactive bladder. Anticholinergic. Prodrug converted to the same active metabolite as tolterodine." },
  { "drug": "Fexofenadine", "back": "Allergic rhinitis, urticaria. 2nd generation antihistamine. Least sedating of all antihistamines." },
  { "drug": "Fidaxomicin", "back": "C. difficile-associated diarrhea. Macrolide antibiotic with minimal systemic absorption. Lowers recurrence rates vs vancomycin." },
  { "drug": "Filgrastim (G-CSF)", "back": "Neutropenia due to chemotherapy. Granulocyte colony-stimulating factor. Stimulates neutrophil production. Causes bone pain." },
  { "drug": "Finasteride", "back": "BPH, male pattern baldness. 5-alpha-reductase inhibitor. Inhibits DHT production." },
  { "drug": "Fingolimod", "back": "Relapsing multiple sclerosis. Sphingosine 1-phosphate receptor modulator. Prevents lymphocytes from leaving lymph nodes. Causes bradycardia on first dose." },
  { "drug": "Flavoxate", "back": "Urinary tract spasm relief. Antispasmodic. Direct smooth muscle relaxant." },
  { "drug": "Flecainide", "back": "AF maintenance of sinus rhythm, SVT. Class Ic antiarrhythmic. Contraindicated post-MI or in structural heart disease due to proarrhythmic risk." },
  { "drug": "Flibanserin", "back": "Hypoactive sexual desire disorder in premenopausal women. 5-HT1A agonist and 5-HT2A antagonist. Absolutely contraindicated with alcohol." },
  { "drug": "Flonase (Fluticasone)", "back": "Allergic rhinitis. Intranasal corticosteroid. First-line for chronic symptoms." },
  { "drug": "Flucloxacillin", "back": "MSSA infections. Penicillinase-resistant penicillin. Used for skin and soft tissue infections." },
  { "drug": "Fluconazole", "back": "Candidiasis, cryptococcal meningitis. Triazole antifungal. Good CNS penetration." },
  { "drug": "Flucytosine", "back": "Cryptococcal meningitis (with amphotericin B). Antifungal antimetabolite. Converted to 5-FU by fungal cells." },
  { "drug": "Fludrocortisone", "back": "Addison's disease, orthostatic hypotension. Potent mineralocorticoid." },
  { "drug": "Flumazenil", "back": "Benzodiazepine overdose reversal. Benzodiazepine receptor antagonist. Can precipitate acute withdrawal seizures." },
  { "drug": "Flunisolide", "back": "Asthma maintenance, allergic rhinitis. Inhaled/nasal corticosteroid." },
  { "drug": "Fluoxetine", "back": "MDD, OCD, bulimia, panic disorder. SSRI. Longest half-life; least likely to cause withdrawal symptoms." },
  { "drug": "Fluphenazine", "back": "Schizophrenia. Typical antipsychotic (high potency). Available as long-acting decanoate injection." },
  { "drug": "Flurazepam", "back": "Insomnia. Benzodiazepine. Very long half-life; high risk of daytime sedation." },
  { "drug": "Flurbiprofen", "back": "Osteoarthritis, rheumatoid arthritis. NSAID. Available in ophthalmic formulation for intraoperative miosis inhibition." },
  { "drug": "Flutamide", "back": "Prostate cancer. Competitive androgen receptor antagonist. Can cause hepatotoxicity." },
  { "drug": "Fluticasone", "back": "Asthma, COPD, allergic rhinitis. Corticosteroid. Available as inhaler or nasal spray." },
  { "drug": "Fluvastatin", "back": "Hypercholesterolemia. Statin. Metabolized by CYP2C9; fewer drug interactions than simvastatin/atorvastatin." },
  { "drug": "Fluvoxamine", "back": "OCD, social anxiety disorder. SSRI. Strong CYP1A2 inhibitor; many drug interactions." },
  { "drug": "Folic Acid", "back": "Folate deficiency, prevention of neural tube defects. Vitamin B9. Essential for DNA synthesis." },
  { "drug": "Fondaparinux", "back": "DVT/PE treatment and prophylaxis. Synthetic pentasaccharide anticoagulant. Factor Xa inhibitor. No risk of HIT." },
  { "drug": "Formoterol", "back": "Asthma maintenance, COPD maintenance. LABA. Fast onset of action compared to salmeterol." },
  { "drug": "Foscarnet", "back": "CMV retinitis, acyclovir-resistant HSV. Pyrophosphate analogue antiviral. Highly nephrotoxic; causes severe electrolyte imbalances." },
  { "drug": "Fosinopril", "back": "Hypertension, heart failure. ACE inhibitor. Dual hepatic and renal clearance." },
  { "drug": "Fosphenytoin", "back": "Status epilepticus. Prodrug of phenytoin. Water-soluble; can be given faster IV with less risk of purple glove syndrome." },
  { "drug": "Frovatriptan", "back": "Acute migraine attacks. 5-HT 1B/1D agonist. Longest half-life among triptans (approx 26 hours)." },
  { "drug": "Furosemide", "back": "Edema (HF, renal, hepatic), hypertension. Loop diuretic. Inhibits Na-K-2Cl cotransporter in ascending limb." },
  { "drug": "Gabapentin", "back": "Neuropathic pain, postherpetic neuralgia, focal seizures. GABA analogue. Requires dose adjustment in renal impairment." }
];

const DATA_MAP: Record<TabKey, { drug: string; back: string }[]> = {
  moa: moaData, classification: classificationData,
  sideEffects: sideEffectsData, pharmacokinetics: pharmacokineticsData,
  pharmacodynamics: pharmacodynamicsData, indications: indicationsData,
};

const REFERENCES = [
  { authors: "Rang HP, Ritter JM, Flower RJ, Henderson G.", title: "Rang & Dale's Pharmacology (9th ed.).", publisher: "Elsevier.", year: "2019" },
  { authors: "Brunton LL, Hilal-Dandan R, Knollmann BC.", title: "Goodman & Gilman's The Pharmacological Basis of Therapeutics (13th ed.).", publisher: "McGraw-Hill.", year: "2018" },
  { authors: "Tripathi KD.", title: "Essentials of Medical Pharmacology (8th ed.).", publisher: "Jaypee Brothers.", year: "2019" },
  { authors: "Joint Formulary Committee.", title: "British National Formulary (BNF) — online.", publisher: "BMJ Group & Pharmaceutical Press.", year: "2024", url: "https://bnf.nice.org.uk" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Utility Functions
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// ─────────────────────────────────────────────────────────────────────────────
// Flashcard Component (with tracking callback)
function Flashcard({ drug, back, gradient, backLabel, onFlip }: {
  drug: string; back: string; gradient: string; backLabel: string;
  onFlip?: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const hasTrackedRef = useRef(false);

  const handleFlip = () => {
    const newFlipped = !flipped;
    setFlipped(newFlipped);
    if (newFlipped && !hasTrackedRef.current && onFlip) {
      hasTrackedRef.current = true;
      onFlip();
    }
    if (!newFlipped) {
      hasTrackedRef.current = false;
    }
  };

  return (
    <div className="cursor-pointer select-none" style={{ perspective: "900px" }}
      onClick={handleFlip} role="button" aria-pressed={flipped}>
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

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Category Sheet
function MobileCategorySheet({
  activeTab,
  onSelect,
}: {
  activeTab: TabKey;
  onSelect: (key: TabKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeTabDef = TABS.find((t) => t.key === activeTab)!;
  const { Icon } = activeTabDef;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full group relative flex items-center justify-between px-4 py-4 bg-white border-2 border-blue-500/20 rounded-2xl shadow-sm active:scale-[0.98] transition-all"
      >
        <div className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${activeTabDef.color} shadow-lg shadow-blue-200/50`}
          >
            <Icon size={20} className="text-white" />
          </motion.div>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-600/70">Subject</span>
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <span className="text-[10px] font-bold text-gray-400">Change</span>
            </div>
            <p className="text-base font-extrabold text-gray-900 leading-tight">
              {activeTabDef.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-100">
          <div className="text-right flex flex-col items-end">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md mb-1">
              {DATA_MAP[activeTab].length} Cards
            </span>
            <div className="flex items-center gap-1 text-gray-400">
              <span className="text-[10px] font-bold">Switch</span>
              <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-gray-50 rounded-t-[32px] shadow-2xl overflow-hidden"
              style={{ maxHeight: "85vh" }}
            >
              <div className="flex justify-center pt-4 pb-2 bg-white">
                <div className="w-12 h-1.5 rounded-full bg-gray-300" />
              </div>

              <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <LayoutGrid size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-gray-900">Select Category</h3>
                    <p className="text-[11px] text-gray-500 font-medium">Choose a deck to start studying</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:bg-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-4 py-6 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(85vh - 100px)" }}>
                {TABS.map((tab) => {
                  const isActive = tab.key === activeTab;
                  const { Icon: TabIcon } = tab;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        onSelect(tab.key);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left relative ${isActive
                        ? "bg-white ring-2 ring-blue-500 shadow-md"
                        : "bg-white/50 border border-transparent hover:bg-white"
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${tab.color} ${isActive ? "shadow-lg shadow-blue-200" : "opacity-70"}`}>
                        <TabIcon size={22} className="text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-extrabold leading-tight ${isActive ? "text-blue-700" : "text-gray-900"}`}>
                            {tab.label}
                          </p>
                          {isActive && (
                            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-snug font-medium line-clamp-1">
                          {tab.desc}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-500"
                          }`}>
                          {DATA_MAP[tab.key].length}
                        </span>
                        {isActive && (
                          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">Selected</p>
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

// ─────────────────────────────────────────────────────────────────────────────
// Desktop Sidebar
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

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Study Tip</p>
          <p className="text-xs text-blue-700 leading-relaxed">Tap any card to flip it and reveal the answer. Or, enter Quiz Mode to test your knowledge!</p>
        </div>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
export default function FlashcardsPage() {
  const { trackFlashcard, trackActivity, trackTimeOnUnmount } = useTracker() as any;

  // -- Standard Page State --
  const [activeTab, setActiveTab] = useState<TabKey>("moa");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  // -- Quiz Mode State --
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizCards, setQuizCards] = useState<{ drug: string, back: string }[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAns, setSelectedAns] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  // Track time spent on this page
  useEffect(() => {
    const cleanup = trackTimeOnUnmount?.();
    return cleanup;
  }, [trackTimeOnUnmount]);

  const activeTabDef = TABS.find(t => t.key === activeTab)!;
  const allData = DATA_MAP[activeTab];

  const filtered = useMemo(() =>
    allData.filter(d => d.drug.toLowerCase().includes(searchQuery.toLowerCase())),
    [allData, searchQuery]
  );

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);
  const paged = useMemo(() => {
    const s = (page - 1) * CARDS_PER_PAGE;
    return filtered.slice(s, s + CARDS_PER_PAGE);
  }, [filtered, page]);

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setSearchQuery("");
    setPage(1);
    setIsQuizMode(false); // Reset quiz mode if category changes
    const tab = TABS.find(t => t.key === key)!;
    trackActivity?.({
      type: "flashcard",
      label: `Studied ${tab.label} flashcards`,
    });
  };

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleCardFlip = () => {
    trackFlashcard?.({
      category: activeTab,
      cardsReviewed: 1,
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Quiz Logic Functions
  const generateOptions = (correctBack: string, dataArray: typeof allData) => {
    const distractors = dataArray.map(d => d.back).filter(b => b !== correctBack);
    const uniqueDistractors = Array.from(new Set(distractors));
    const shuffledDistractors = shuffleArray(uniqueDistractors);
    const selectedDistractors = shuffledDistractors.slice(0, 3);

    // Fill with generics if the category data is extremely small
    while (selectedDistractors.length < 3) {
      selectedDistractors.push(`Other ${activeTabDef.backLabel} Distractor ${selectedDistractors.length}`);
    }

    return shuffleArray([correctBack, ...selectedDistractors]);
  };

  const startQuiz = () => {
    if (allData.length === 0) return;

    // Shuffle all data, then take only the first 10 for the quiz round
    const shuffled = shuffleArray(allData);
    const selectedCards = shuffled.slice(0, 10);

    setQuizCards(selectedCards);
    setCurrentQIndex(0);
    setScore(0);
    setQuizFinished(false);
    setSelectedAns(null);
    setQuizStartTime(Date.now());
    // Ensure you pass the first card of the sliced array to generateOptions
    setCurrentOptions(generateOptions(selectedCards[0].back, allData));
    setIsQuizMode(true);

    trackActivity?.({
      type: "quiz_started",
      label: `Started ${activeTabDef.label} quiz`,
    });
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAns !== null) return;
    setSelectedAns(answer);

    const currentCard = quizCards[currentQIndex];
    const isCorrect = answer === currentCard.back;
    const newScore = isCorrect ? score + 1 : score;

    if (isCorrect) setScore(newScore);

    setTimeout(() => {
      const nextIndex = currentQIndex + 1;
      if (nextIndex < quizCards.length) {
        setCurrentQIndex(nextIndex);
        setSelectedAns(null);
        setCurrentOptions(generateOptions(quizCards[nextIndex].back, allData));
      } else {
        setQuizFinished(true);
        const timeTaken = Math.round((Date.now() - quizStartTime) / 1000);
        trackActivity?.({
          type: "quiz_completed",
          label: `Completed ${activeTabDef.label} quiz with score ${newScore}/${quizCards.length}`,
          data: { score: newScore, total: quizCards.length, timeTaken }
        });
      }
    }, 1500);
  };

  const exitQuiz = () => {
    setIsQuizMode(false);
    setQuizFinished(false);
  };

  // ─────────────────────────────────────────────────────────────────────────────

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

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-20  w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-20 bottom-4   opacity-15 pointer-events-none"><Dna size={60} className="text-white" /></div>
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
            Master mechanisms, classifications, side effects, pharmacokinetics, and pharmacodynamics — tap any card to reveal the answer or test yourself in Quiz Mode.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {[
              { n: `${totalAll}+`, l: "Total Cards" },
              { n: `${TABS.length}`, l: "Categories" },
              { n: "Tap", l: "to Reveal" },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-extrabold text-white">{n}</div>
                <div className="text-sm text-blue-200">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
          <DesktopSidebar
            activeTab={activeTab}
            onSelect={handleTabChange}
            searchQuery={searchQuery}
            onSearch={handleSearch}
          />

          <div className="flex-1 min-w-0 w-full">
            {/* Mobile category selector + search */}
            <div className="lg:hidden space-y-3 mb-5">
              <MobileCategorySheet activeTab={activeTab} onSelect={handleTabChange} />

              {!isQuizMode && (
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
              )}
            </div>

            {/* Desktop header & Quiz Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div className="hidden lg:flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activeTabDef.color} flex items-center justify-center shadow-sm`}>
                  <activeTabDef.Icon size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{activeTabDef.label}</h2>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-400">{activeTabDef.desc}</p>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5">
                      {filtered.length} / {allData.length} cards
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile count badge fallback */}
              <div className="lg:hidden flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-gray-900">{activeTabDef.label}</h2>
                <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1">
                  {filtered.length} cards
                </span>
              </div>

              {/* Quiz Toggle Button */}
              <button
                onClick={isQuizMode ? exitQuiz : startQuiz}
                disabled={allData.length === 0}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold transition-all duration-300 ${isQuizMode
                  ? "bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  : "bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md hover:shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
              >
                {isQuizMode ? (
                  <>
                    <ArrowLeft className="w-4 h-4" /> Exit Quiz
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-5 h-5" /> Quiz Me!
                  </>
                )}
              </button>
            </div>

            {/* Content Area (Quiz OR Cards) */}
            <AnimatePresence mode="wait">
              {isQuizMode ? (
                <motion.div
                  key="quiz-view"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full flex flex-col justify-center min-h-[400px]"
                >
                  {!quizFinished ? (
                    // --- Active Quiz State ---
                    <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-10 w-full border border-gray-100 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${activeTabDef.color}`} />

                      {/* Progress Bar */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            Question {currentQIndex + 1} of {quizCards.length}
                          </span>
                          <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            Score: {score}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full bg-gradient-to-r ${activeTabDef.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQIndex) / quizCards.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>

                      {/* Question Stem */}
                      <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-500 mb-4">
                          <BrainCircuit size={24} />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                          What is the {activeTabDef.shortLabel.toLowerCase()} of <br className="hidden md:block" />
                          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${activeTabDef.color}`}>
                            {quizCards[currentQIndex]?.drug}
                          </span>?
                        </h3>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {currentOptions.map((opt, idx) => {
                          const isSelected = selectedAns === opt;
                          const isCorrect = opt === quizCards[currentQIndex].back;
                          const showCorrect = selectedAns !== null && isCorrect;
                          const showIncorrect = isSelected && !isCorrect;

                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswerSelect(opt)}
                              disabled={selectedAns !== null}
                              className={`relative flex items-center p-5 text-left rounded-2xl font-bold transition-all border-2 w-full
                                ${selectedAns === null
                                  ? 'border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md'
                                  : showCorrect
                                    ? 'border-transparent bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-lg'
                                    : showIncorrect
                                      ? 'border-transparent bg-gradient-to-r from-red-500 to-rose-400 text-white shadow-lg'
                                      : 'border-gray-100 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed'
                                }
                              `}
                            >
                              <span className="flex-1 text-sm md:text-base leading-snug">{opt}</span>
                              {showCorrect && <CheckCircle2 className="w-6 h-6 ml-3 flex-shrink-0" />}
                              {showIncorrect && <XCircle className="w-6 h-6 ml-3 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    // --- Quiz Results ---
                    <div className="bg-white rounded-[2rem] shadow-xl p-10 w-full text-center border border-gray-100 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${activeTabDef.color}`} />

                      <div className="mb-6 flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center border-4 border-blue-100">
                          <CheckCircle2 className="w-12 h-12 text-blue-500" />
                        </div>
                      </div>

                      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Quiz Complete!</h2>

                      <div className="my-8">
                        <div className={`text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r ${activeTabDef.color} inline-block`}>
                          {Math.round((score / quizCards.length) * 100)}%
                        </div>
                        <p className="text-lg font-bold text-gray-500 mt-2">
                          You scored <span className="text-gray-900">{score}</span> out of <span className="text-gray-900">{quizCards.length}</span>
                        </p>
                      </div>

                      <p className="text-base font-medium text-gray-600 mb-10 max-w-md mx-auto">
                        {(score / quizCards.length) >= 0.8
                          ? "Excellent work! You've mastered this category."
                          : (score / quizCards.length) >= 0.5
                            ? "Good job! You're getting there. Keep reviewing."
                            : "Keep practicing! Review the flashcards and try again."}
                      </p>

                      <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                          onClick={startQuiz}
                          className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-extrabold transition-colors border-2 border-gray-200"
                        >
                          <RotateCcw className="w-5 h-5" /> Retry Quiz
                        </button>
                        <button
                          onClick={exitQuiz}
                          className={`flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r ${activeTabDef.color} hover:opacity-90 text-white rounded-xl font-extrabold transition-opacity shadow-md`}
                        >
                          Back to Flashcards
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                // --- Standard Flashcard Grid ---
                <motion.div
                  key="flashcards-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {paged.length > 0 ? (
                    <motion.div key={`${activeTab}-${searchQuery}-${page}`}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                      {paged.map((item, i) => (
                        <motion.div key={`${activeTab}-${item.drug}-${i}`}
                          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03, duration: 0.24 }}>
                          <Flashcard
                            drug={item.drug}
                            back={item.back}
                            gradient={activeTabDef.color}
                            backLabel={activeTabDef.backLabel}
                            onFlip={handleCardFlip}
                          />
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                      <p className="text-sm text-gray-400">
                        Showing <span className="font-bold text-gray-600">{(page - 1) * CARDS_PER_PAGE + 1}–{Math.min(page * CARDS_PER_PAGE, filtered.length)}</span> of{" "}
                        <span className="font-bold text-gray-600">{filtered.length}</span> cards
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                          className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition">
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        {pageNums.map((n, i) => n === "…"
                          ? <span key={`e-${i}`} className="text-gray-400 text-sm w-4 text-center">…</span>
                          : <button key={n} onClick={() => setPage(n as number)}
                            className={`w-9 h-9 rounded-xl text-sm font-bold transition ${page === n ? "bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md shadow-blue-200/50 border-0" : "border-2 border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"}`}>
                            {n}
                          </button>
                        )}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                          className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>

      {/* Pharmacopedia CTA */}
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
          </div>
        </div>
      </div>
    </section>
  );
}