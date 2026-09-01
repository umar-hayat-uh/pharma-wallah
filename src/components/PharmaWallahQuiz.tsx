"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================
   PHARMAWALLAH — RAPID PHARMACY QUIZ
   Science Fair booth game. Scan → Play → Win → Collect prize.
   Updated to PharmaWallah design system.
   ========================================================= */

// ---------- Types ----------
type Question = {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    category: string;
    difficulty: "Easy" | "Medium" | "Hard";
    explanation: string;
};

type FlashState = {
    show: boolean;
    correct: boolean;
};

type Phase = "welcome" | "quiz" | "result" | "prize";

// ---------- Constants ----------
const QUESTIONS: Question[] = [
    { id: 1, question: "Which drug is a proton pump inhibitor?", options: ["Famotidine", "Omeprazole", "Metoclopramide", "Ondansetron"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Omeprazole inhibits the gastric H+/K+ ATPase." },
    { id: 2, question: "Which class does atenolol belong to?", options: ["Calcium channel blocker", "Beta blocker", "ACE inhibitor", "Diuretic"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Atenolol is a cardioselective beta-1 blocker." },
    { id: 3, question: "Warfarin's mechanism of action is inhibition of:", options: ["Vitamin K epoxide reductase", "Cyclooxygenase", "Factor Xa directly", "Thrombin directly"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "Warfarin blocks vitamin K epoxide reductase, reducing synthesis of clotting factors II, VII, IX, X." },
    { id: 4, question: "Which drug is a classic muscarinic antagonist used for bradycardia?", options: ["Atropine", "Neostigmine", "Pilocarpine", "Bethanechol"], correctAnswer: 0, category: "Pharmacology", difficulty: "Easy", explanation: "Atropine blocks muscarinic receptors, increasing heart rate." },
    { id: 5, question: "Which of these is a selective serotonin reuptake inhibitor (SSRI)?", options: ["Amitriptyline", "Fluoxetine", "Haloperidol", "Diazepam"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Fluoxetine selectively inhibits serotonin reuptake." },
    { id: 6, question: "Digoxin toxicity is potentiated by which electrolyte imbalance?", options: ["Hyperkalemia", "Hypokalemia", "Hypernatremia", "Hypercalcemia (mild)"], correctAnswer: 1, category: "Pharmacology", difficulty: "Medium", explanation: "Hypokalemia increases digoxin binding to Na+/K+ ATPase, worsening toxicity." },
    { id: 7, question: "Which drug class commonly causes a dry cough as a side effect?", options: ["ARBs", "ACE inhibitors", "Beta blockers", "Thiazide diuretics"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "ACE inhibitors increase bradykinin, causing a dry cough." },
    { id: 8, question: "Which opioid receptor is primarily responsible for analgesia and respiratory depression?", options: ["Mu", "Kappa", "Delta", "Sigma"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "Mu-opioid receptor activation drives analgesia and respiratory depression." },
    { id: 9, question: "Which drug is a first-generation antihistamine known for sedation?", options: ["Loratadine", "Diphenhydramine", "Fexofenadine", "Cetirizine (least sedating)"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Diphenhydramine crosses the blood-brain barrier causing sedation." },
    { id: 10, question: "Nitroglycerin primarily relieves angina by:", options: ["Increasing heart rate", "Venodilation reducing preload", "Increasing contractility", "Blocking beta receptors"], correctAnswer: 1, category: "Pharmacology", difficulty: "Medium", explanation: "Nitrates release NO, causing venodilation and reduced cardiac preload." },
    { id: 11, question: "Which drug is a loop diuretic?", options: ["Hydrochlorothiazide", "Spironolactone", "Furosemide", "Acetazolamide"], correctAnswer: 2, category: "Pharmacology", difficulty: "Easy", explanation: "Furosemide inhibits the Na-K-2Cl symporter in the loop of Henle." },
    { id: 12, question: "Which drug is a potassium-sparing diuretic?", options: ["Furosemide", "Spironolactone", "Chlorthalidone", "Mannitol"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Spironolactone is an aldosterone antagonist that spares potassium." },
    { id: 13, question: "Metformin's primary mechanism is:", options: ["Increasing insulin secretion", "Decreasing hepatic glucose production", "Blocking alpha-glucosidase", "Increasing renal glucose excretion"], correctAnswer: 1, category: "Pharmacology", difficulty: "Medium", explanation: "Metformin reduces hepatic gluconeogenesis and improves insulin sensitivity." },
    { id: 14, question: "Which class of drugs is associated with a risk of Achilles tendon rupture?", options: ["Penicillins", "Fluoroquinolones", "Macrolides", "Tetracyclines"], correctAnswer: 1, category: "Pharmacology", difficulty: "Medium", explanation: "Fluoroquinolones carry a boxed warning for tendinopathy and rupture." },
    { id: 15, question: "Which drug is used as an antidote for acetaminophen overdose?", options: ["Naloxone", "N-acetylcysteine", "Flumazenil", "Protamine sulfate"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "N-acetylcysteine replenishes glutathione to detoxify NAPQI." },
    { id: 16, question: "Naloxone is used to reverse toxicity from which drug class?", options: ["Benzodiazepines", "Opioids", "Beta blockers", "Anticoagulants"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Naloxone is a competitive opioid receptor antagonist." },
    { id: 17, question: "Which drug is the antidote for benzodiazepine overdose?", options: ["Naloxone", "Flumazenil", "Physostigmine", "Protamine"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Flumazenil is a benzodiazepine receptor antagonist." },
    { id: 18, question: "Which drug class includes amlodipine?", options: ["Beta blocker", "Calcium channel blocker", "ACE inhibitor", "Alpha blocker"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Amlodipine is a dihydropyridine calcium channel blocker." },
    { id: 19, question: "Statins primarily work by inhibiting:", options: ["HMG-CoA reductase", "Cyclooxygenase", "Lipoprotein lipase", "Bile acid absorption"], correctAnswer: 0, category: "Pharmacology", difficulty: "Easy", explanation: "Statins inhibit HMG-CoA reductase, reducing cholesterol synthesis." },
    { id: 20, question: "Which adverse effect is classically associated with statins?", options: ["Myopathy", "Hyperkalemia", "Dry cough", "Gingival hyperplasia"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "Statins can cause myalgia, myopathy, and rarely rhabdomyolysis." },
    { id: 21, question: "Which drug is a common first-generation antipsychotic?", options: ["Risperidone", "Haloperidol", "Olanzapine", "Quetiapine"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Haloperidol is a typical (first-generation) antipsychotic." },
    { id: 22, question: "Which drug is known to cause gingival hyperplasia?", options: ["Phenytoin", "Lithium", "Metformin", "Furosemide"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "Phenytoin is classically associated with gingival hyperplasia." },
    { id: 23, question: "Lithium is primarily used to treat:", options: ["Schizophrenia", "Bipolar disorder", "Major depression", "Generalized anxiety"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Lithium is a mood stabilizer used for bipolar disorder." },
    { id: 24, question: "Which drug requires monitoring of INR?", options: ["Heparin", "Warfarin", "Aspirin", "Clopidogrel"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Warfarin's effect is monitored via INR." },
    { id: 25, question: "Heparin's anticoagulant effect is monitored using:", options: ["INR", "aPTT", "Bleeding time", "Platelet count"], correctAnswer: 1, category: "Pharmacology", difficulty: "Medium", explanation: "Unfractionated heparin is monitored with aPTT." },
    { id: 26, question: "Which drug reverses heparin overdose?", options: ["Vitamin K", "Protamine sulfate", "Fresh frozen plasma only", "Naloxone"], correctAnswer: 1, category: "Pharmacology", difficulty: "Medium", explanation: "Protamine sulfate neutralizes heparin." },
    { id: 27, question: "Which class of drugs ends in the suffix '-sartan'?", options: ["ACE inhibitors", "Angiotensin receptor blockers", "Beta blockers", "Calcium channel blockers"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "ARBs like losartan and valsartan carry the '-sartan' suffix." },
    { id: 28, question: "Which drug class ends in the suffix '-pril'?", options: ["ACE inhibitors", "ARBs", "Statins", "Diuretics"], correctAnswer: 0, category: "Pharmacology", difficulty: "Easy", explanation: "ACE inhibitors like lisinopril and enalapril end in '-pril'." },
    { id: 29, question: "Insulin's main action is to:", options: ["Increase blood glucose", "Promote cellular glucose uptake", "Stimulate glucagon release", "Inhibit glycogen synthesis"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Insulin promotes glucose uptake into cells, lowering blood glucose." },
    { id: 30, question: "Which drug is a rapid-acting insulin analog?", options: ["NPH", "Glargine", "Lispro", "Detemir"], correctAnswer: 2, category: "Pharmacology", difficulty: "Medium", explanation: "Insulin lispro is a rapid-acting analog." },
    { id: 31, question: "Which drug is a long-acting basal insulin?", options: ["Regular insulin", "Lispro", "Glargine", "Aspart"], correctAnswer: 2, category: "Pharmacology", difficulty: "Medium", explanation: "Insulin glargine provides a long, relatively flat basal profile." },
    { id: 32, question: "Sildenafil's mechanism of action involves inhibition of:", options: ["PDE5", "PDE3", "ACE", "COX-2"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "Sildenafil inhibits phosphodiesterase type 5, enhancing cGMP effects." },
    { id: 33, question: "Which drug class is contraindicated with nitrates due to hypotension risk?", options: ["PDE5 inhibitors", "Beta blockers", "Statins", "SSRIs"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "Combining PDE5 inhibitors with nitrates can cause severe hypotension." },
    { id: 34, question: "Which drug is a common NSAID?", options: ["Ibuprofen", "Acetaminophen", "Morphine", "Diazepam"], correctAnswer: 0, category: "Pharmacology", difficulty: "Easy", explanation: "Ibuprofen is a nonsteroidal anti-inflammatory drug." },
    { id: 35, question: "Acetaminophen differs from NSAIDs in that it has minimal:", options: ["Analgesic effect", "Antipyretic effect", "Anti-inflammatory effect", "CNS penetration"], correctAnswer: 2, category: "Pharmacology", difficulty: "Medium", explanation: "Acetaminophen has weak peripheral anti-inflammatory activity." },
    { id: 36, question: "Which drug class carries a risk of GI ulceration via COX-1 inhibition?", options: ["NSAIDs", "SSRIs", "Beta blockers", "Statins"], correctAnswer: 0, category: "Pharmacology", difficulty: "Easy", explanation: "NSAIDs inhibit COX-1, reducing protective gastric prostaglandins." },
    { id: 37, question: "Which drug class stimulates muscarinic receptors directly and is used for urinary retention?", options: ["Bethanechol", "Atropine", "Propranolol", "Losartan"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "Bethanechol is a direct-acting muscarinic agonist used for urinary retention." },
    { id: 38, question: "Epinephrine's action at high doses is dominated by which receptor?", options: ["Alpha-1", "Beta-2 only", "Muscarinic", "Nicotinic"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "At high doses, alpha-1 mediated vasoconstriction predominates." },
    { id: 39, question: "Which drug is a selective beta-2 agonist used in asthma?", options: ["Propranolol", "Albuterol", "Atenolol", "Metoprolol"], correctAnswer: 1, category: "Pharmacology", difficulty: "Easy", explanation: "Albuterol selectively stimulates beta-2 receptors causing bronchodilation." },
    { id: 40, question: "Which drug is a common benzodiazepine?", options: ["Diazepam", "Fluoxetine", "Haloperidol", "Metoprolol"], correctAnswer: 0, category: "Pharmacology", difficulty: "Easy", explanation: "Diazepam is a classic benzodiazepine anxiolytic." },
    { id: 41, question: "Which drug is first-line for stable angina symptom relief?", options: ["Nitroglycerin", "Warfarin", "Furosemide", "Metformin"], correctAnswer: 0, category: "Pharmacology", difficulty: "Easy", explanation: "Sublingual nitroglycerin relieves acute anginal episodes." },
    { id: 42, question: "Which class of antiarrhythmics does amiodarone primarily belong to?", options: ["Class I", "Class II", "Class III", "Class IV"], correctAnswer: 2, category: "Pharmacology", difficulty: "Hard", explanation: "Amiodarone is primarily a Class III (potassium channel blocker) with mixed effects." },
    { id: 43, question: "Adenosine is used clinically to:", options: ["Terminate SVT", "Lower blood pressure chronically", "Treat asthma", "Treat depression"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "IV adenosine briefly blocks AV node conduction, terminating SVT." },
    { id: 44, question: "Which drug is commonly used for Parkinson's disease as a dopamine precursor?", options: ["Levodopa", "Haloperidol", "Diazepam", "Phenytoin"], correctAnswer: 0, category: "Pharmacology", difficulty: "Easy", explanation: "Levodopa is converted to dopamine in the CNS to treat Parkinson's." },
    { id: 45, question: "Carbidopa is combined with levodopa to:", options: ["Increase CNS dopamine conversion", "Prevent peripheral decarboxylation", "Block dopamine receptors", "Increase absorption in the stomach"], correctAnswer: 1, category: "Pharmacology", difficulty: "Medium", explanation: "Carbidopa inhibits peripheral DOPA decarboxylase, sparing levodopa for the CNS." },
    { id: 46, question: "Which drug is a first-line treatment for generalized tonic-clonic seizures?", options: ["Valproate", "Diazepam only", "Loratadine", "Furosemide"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "Valproate is broad-spectrum and commonly used for generalized seizures." },
    { id: 47, question: "Phenytoin's main mechanism of action is:", options: ["Blocking voltage-gated sodium channels", "Enhancing GABA-A directly", "Blocking calcium channels", "Inhibiting acetylcholinesterase"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "Phenytoin stabilizes neuronal membranes by blocking sodium channels." },
    { id: 48, question: "Which class of drugs is metoprolol part of?", options: ["Beta-1 selective blocker", "Non-selective beta blocker", "Alpha blocker", "Calcium channel blocker"], correctAnswer: 0, category: "Pharmacology", difficulty: "Easy", explanation: "Metoprolol is cardioselective, primarily blocking beta-1 receptors." },
    { id: 49, question: "Clopidogrel's mechanism of action is:", options: ["COX-1 inhibition", "P2Y12 receptor inhibition", "Vitamin K antagonism", "Direct thrombin inhibition"], correctAnswer: 1, category: "Pharmacology", difficulty: "Medium", explanation: "Clopidogrel irreversibly blocks the P2Y12 ADP receptor on platelets." },
    { id: 50, question: "Aspirin's antiplatelet effect is due to irreversible inhibition of:", options: ["COX-1", "COX-2 only", "Lipoxygenase", "Phospholipase A2"], correctAnswer: 0, category: "Pharmacology", difficulty: "Medium", explanation: "Aspirin irreversibly acetylates COX-1, reducing thromboxane A2 production." },
    { id: 61, question: "Bioavailability of an IV drug is considered to be:", options: ["50%", "100%", "Variable", "0%"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "IV administration bypasses absorption barriers, giving 100% bioavailability." },
    { id: 62, question: "Two products are 'bioequivalent' if they show similar:", options: ["Color and shape", "Rate and extent of absorption", "Price", "Packaging"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Medium", explanation: "Bioequivalence compares the rate and extent (Cmax, AUC) of drug absorption." },
    { id: 63, question: "Which route of administration typically has the fastest onset of action?", options: ["Oral", "Intravenous", "Rectal", "Transdermal"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "IV administration delivers drug directly into systemic circulation." },
    { id: 64, question: "An emulsion is a dispersion of:", options: ["Solid in liquid", "Liquid in liquid", "Gas in liquid", "Solid in solid"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "An emulsion is a mixture of two immiscible liquids, one dispersed in the other." },
    { id: 65, question: "A suspension is a dispersion of:", options: ["Insoluble solid particles in a liquid", "Two liquids", "Gas in a liquid", "Two miscible solids"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Easy", explanation: "Suspensions contain finely divided insoluble solid particles dispersed in liquid." },
    { id: 66, question: "Which dosage form is designed to disintegrate/dissolve in the mouth without water?", options: ["Enteric-coated tablet", "Orally disintegrating tablet", "Sustained-release capsule", "Suppository"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "ODTs dissolve rapidly on the tongue without needing water." },
    { id: 67, question: "Enteric coating is primarily used to:", options: ["Improve taste", "Protect the drug from stomach acid or protect the stomach from the drug", "Speed up absorption", "Add color"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Medium", explanation: "Enteric coatings resist gastric acid and dissolve in the intestine." },
    { id: 68, question: "Which term describes the fraction of an administered dose that reaches systemic circulation unchanged?", options: ["Half-life", "Bioavailability", "Clearance", "Volume of distribution"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "Bioavailability (F) is the fraction of unchanged drug reaching systemic circulation." },
    { id: 69, question: "First-pass metabolism primarily reduces bioavailability for which route?", options: ["Oral", "Intravenous", "Intramuscular", "Sublingual"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Medium", explanation: "Oral drugs pass through the liver via the portal vein before systemic circulation." },
    { id: 70, question: "Sublingual administration avoids first-pass metabolism because drug is absorbed:", options: ["Directly into systemic veins bypassing the liver", "Through the stomach lining", "Through the kidneys", "Through the lungs"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Medium", explanation: "Sublingual veins drain into systemic circulation, bypassing hepatic first-pass." },
    { id: 71, question: "What does 'QD' mean on a prescription?", options: ["Four times daily", "Once daily", "Every other day", "Twice daily"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "QD (or 'once daily') means the medication is taken once per day." },
    { id: 72, question: "What does 'BID' mean on a prescription?", options: ["Once daily", "Twice daily", "Three times daily", "As needed"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "BID means twice a day." },
    { id: 73, question: "What does 'TID' mean on a prescription?", options: ["Twice daily", "Three times daily", "Four times daily", "Once weekly"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "TID means three times a day." },
    { id: 74, question: "What does 'PRN' mean on a prescription?", options: ["As needed", "At bedtime", "Before meals", "With food"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Easy", explanation: "PRN stands for 'pro re nata,' meaning as needed." },
    { id: 75, question: "What does 'PO' mean as a route of administration?", options: ["By mouth", "Intravenous", "Per rectum", "Subcutaneous"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Easy", explanation: "PO ('per os') means administration by mouth." },
    { id: 76, question: "What does 'NPO' mean on a chart?", options: ["Nothing by mouth", "No prescription ordered", "Normal pulse observed", "No pain, ongoing"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Easy", explanation: "NPO means the patient should have nothing by mouth." },
    { id: 77, question: "A hard gelatin capsule shell is primarily made from:", options: ["Gelatin", "Cellulose only", "Starch only", "Lactose"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Medium", explanation: "Hard gelatin capsules are traditionally made from gelatin derived from collagen." },
    { id: 78, question: "Which excipient type helps a tablet break apart after ingestion?", options: ["Binder", "Disintegrant", "Lubricant", "Diluent"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Medium", explanation: "Disintegrants like croscarmellose help tablets break apart in fluid." },
    { id: 79, question: "Which excipient type prevents powder from sticking to tablet punches?", options: ["Lubricant", "Binder", "Sweetener", "Colorant"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Medium", explanation: "Lubricants like magnesium stearate reduce friction during compression." },
    { id: 80, question: "A 'binder' in tablet formulation functions to:", options: ["Hold powder particles together", "Dissolve the tablet quickly", "Add flavor", "Prevent oxidation"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Medium", explanation: "Binders promote cohesion of powder into granules/tablets." },
    { id: 81, question: "Which storage condition is typically recommended for most solid oral tablets?", options: ["Cool, dry place away from light", "Freezer", "Direct sunlight", "Humid bathroom cabinet"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Easy", explanation: "Most tablets are stored in a cool, dry place to maintain stability." },
    { id: 82, question: "Which route bypasses the GI tract and hepatic first-pass entirely?", options: ["Oral", "Transdermal", "Sublingual (mostly)", "Rectal (partially)"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Medium", explanation: "Transdermal patches deliver drug through skin directly into systemic circulation." },
    { id: 83, question: "Which of these is a semisolid dosage form?", options: ["Tablet", "Ointment", "Capsule", "Solution"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "Ointments are semisolid preparations for topical use." },
    { id: 84, question: "A suppository is designed for administration via which route?", options: ["Oral", "Rectal or vaginal", "Intravenous", "Inhalation"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "Suppositories are solid dosage forms inserted rectally or vaginally." },
    { id: 85, question: "Which pharmaceutical calculation term refers to concentration expressed as parts of solute per 100 parts of solution?", options: ["Molarity", "Percentage strength", "Osmolarity", "Specific gravity"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Medium", explanation: "Percentage strength (% w/v, w/w, v/v) expresses solute per 100 parts." },
    { id: 86, question: "If a solution is labeled 5% w/v, how many grams of solute are in 100 mL?", options: ["0.5 g", "5 g", "50 g", "500 g"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Medium", explanation: "5% w/v means 5 grams of solute per 100 mL of solution." },
    { id: 87, question: "Which term describes drug degradation via reaction with water?", options: ["Oxidation", "Hydrolysis", "Photolysis", "Racemization"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Medium", explanation: "Hydrolysis is degradation caused by reaction with water, common in esters and amides." },
    { id: 88, question: "Light-sensitive drugs are typically packaged in:", options: ["Clear glass", "Amber/opaque containers", "Plastic bags", "Paper envelopes"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "Amber or opaque containers protect photosensitive drugs from light degradation." },
    { id: 89, question: "Which term refers to the time required for drug concentration to reduce by half?", options: ["Half-life", "Bioavailability", "Clearance", "Onset of action"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Easy", explanation: "Half-life (t1/2) is the time for plasma concentration to fall by 50%." },
    { id: 90, question: "Which packaging term indicates a container that keeps out moisture?", options: ["Light-resistant", "Tamper-evident", "Well-closed / tight container", "Child-resistant"], correctAnswer: 2, category: "Pharmaceutics", difficulty: "Medium", explanation: "A tight or well-closed container protects contents from moisture and contamination." },
    { id: 91, question: "Sustained-release formulations aim to:", options: ["Release drug rapidly all at once", "Release drug slowly over an extended period", "Bypass the GI tract", "Increase first-pass metabolism"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "Sustained-release forms extend drug release to maintain steady levels." },
    { id: 92, question: "Which of the following best describes 'tonicity' relative to body fluids?", options: ["pH balance", "Osmotic pressure relative to plasma", "Viscosity", "Color"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Medium", explanation: "Tonicity describes a solution's osmotic pressure relative to body fluids/plasma." },
    { id: 93, question: "An isotonic solution has the same osmotic pressure as:", options: ["Distilled water", "Blood plasma", "Gastric acid", "Urine"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Medium", explanation: "Isotonic solutions match the osmotic pressure of blood plasma, avoiding cell lysis or shrinkage." },
    { id: 94, question: "Which dosage form uses a propellant to deliver drug to the lungs?", options: ["Metered-dose inhaler", "Suppository", "Transdermal patch", "Suspension"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Easy", explanation: "MDIs use a pressurized propellant to deliver a metered drug dose to the lungs." },
    { id: 95, question: "Which of these is NOT typically a parenteral route?", options: ["Intravenous", "Intramuscular", "Subcutaneous", "Oral"], correctAnswer: 3, category: "Pharmaceutics", difficulty: "Easy", explanation: "Oral is an enteral route; parenteral routes bypass the GI tract (IV, IM, SC)." },
    { id: 96, question: "What does 'w/v' mean in a pharmaceutical concentration expression?", options: ["Weight of solute per volume of solution", "Volume of solute per weight of solution", "Weight per weight", "Volume per volume"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Medium", explanation: "w/v expresses weight of solute (g) per volume of solution (mL)." },
    { id: 97, question: "1 gram equals how many milligrams?", options: ["10 mg", "100 mg", "1,000 mg", "10,000 mg"], correctAnswer: 2, category: "Pharmaceutics", difficulty: "Easy", explanation: "1 gram = 1,000 milligrams." },
    { id: 98, question: "1 teaspoon is approximately equal to how many mL?", options: ["1 mL", "5 mL", "15 mL", "30 mL"], correctAnswer: 1, category: "Pharmaceutics", difficulty: "Easy", explanation: "1 teaspoon (tsp) is approximately 5 mL." },
    { id: 99, question: "1 tablespoon is approximately equal to how many mL?", options: ["5 mL", "10 mL", "15 mL", "30 mL"], correctAnswer: 2, category: "Pharmaceutics", difficulty: "Easy", explanation: "1 tablespoon (tbsp) is approximately 15 mL." },
    { id: 100, question: "Which term describes uniform distribution of drug particles throughout a dosage form?", options: ["Content uniformity", "Bioequivalence", "Solubility", "Viscosity"], correctAnswer: 0, category: "Pharmaceutics", difficulty: "Medium", explanation: "Content uniformity ensures each dosage unit contains a consistent drug amount." },
    { id: 101, question: "A drug that is a weak acid will be best absorbed in an environment that is:", options: ["Acidic", "Basic", "Neutral only", "Absorption is unaffected by pH"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Weak acids are more un-ionized (absorbable) in acidic environments like the stomach." },
    { id: 102, question: "Ionized drug molecules are generally:", options: ["More lipophilic and better absorbed", "Less lipophilic and poorly absorbed across membranes", "Unaffected in absorption", "Always inactive"], correctAnswer: 1, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Ionized molecules are more water-soluble and cross lipid membranes poorly." },
    { id: 103, question: "Which functional group is present in aspirin (acetylsalicylic acid)?", options: ["Ester", "Amide", "Ether", "Nitrile"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Aspirin contains an ester linkage (acetyl group esterified to salicylic acid)." },
    { id: 104, question: "Penicillin's core structure contains which ring system essential for activity?", options: ["Beta-lactam ring", "Steroid nucleus", "Purine ring", "Indole ring"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "The beta-lactam ring is essential for penicillin's antibacterial activity." },
    { id: 105, question: "Which functional group characterizes local anesthetics like lidocaine?", options: ["Amide", "Sulfonamide", "Carboxylic acid", "Aldehyde"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Lidocaine is an amide-type local anesthetic." },
    { id: 106, question: "pKa is defined as the pH at which a drug is:", options: ["Fully ionized", "Fully un-ionized", "50% ionized and 50% un-ionized", "Chemically unstable"], correctAnswer: 2, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "pKa is the pH at which a compound is 50% ionized." },
    { id: 107, question: "Steroid drugs like prednisone share a core structure based on which ring system?", options: ["Cyclopentanoperhydrophenanthrene ring", "Benzene ring only", "Pyrimidine ring", "Furan ring"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Hard", explanation: "Steroids are based on the four-fused-ring cyclopentanoperhydrophenanthrene structure." },
    { id: 108, question: "Which chemical property most affects a drug's ability to cross the blood-brain barrier?", options: ["Lipophilicity", "Molecular color", "Taste", "Density"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Lipophilic drugs cross the lipid-rich blood-brain barrier more readily." },
    { id: 109, question: "Sulfonamide antibiotics act as structural analogs of which compound?", options: ["Folic acid precursor (PABA)", "Glucose", "Adenine", "Cholesterol"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Sulfonamides mimic PABA, competitively inhibiting folate synthesis in bacteria." },
    { id: 110, question: "Which functional group is common to amphetamine-type stimulants?", options: ["Primary amine", "Nitro group", "Ketone", "Sulfate"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Amphetamines share a phenethylamine backbone with an amine group." },
    { id: 111, question: "Racemic drugs contain a mixture of:", options: ["Enantiomers", "Different molecular weights", "Different salts", "Isotopes"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "A racemic mixture contains equal parts of two enantiomers (mirror-image isomers)." },
    { id: 112, question: "Which drug class typically contains a carboxylic acid functional group (e.g., ibuprofen)?", options: ["NSAIDs (arylpropionic acids)", "Benzodiazepines", "Opioids", "Statins only"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Many NSAIDs like ibuprofen are arylpropionic acid derivatives with a carboxylic acid group." },
    { id: 113, question: "Which term describes drugs with identical molecular formulas but different structural arrangements?", options: ["Isomers", "Isotopes", "Isotypes", "Isoforms"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Isomers share a molecular formula but differ in structure." },
    { id: 114, question: "Which property describes a drug's tendency to dissolve in water?", options: ["Hydrophilicity", "Lipophilicity", "Volatility", "Chirality"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Easy", explanation: "Hydrophilicity refers to water-solubility/affinity." },
    { id: 115, question: "Morphine belongs to which chemical class of natural compounds?", options: ["Alkaloid", "Glycoside", "Tannin", "Flavonoid"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Morphine is a phenanthrene alkaloid derived from opium poppy." },
    { id: 116, question: "Which chemical modification typically improves a drug's oral bioavailability by increasing lipophilicity?", options: ["Esterification (prodrug)", "Adding a charged sulfate group", "Increasing molecular size drastically", "Adding more hydroxyl groups"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Hard", explanation: "Esterification can mask polar groups, forming a prodrug with better lipophilicity/absorption." },
    { id: 117, question: "Aromatic rings in drug structures often contribute to:", options: ["Receptor binding via pi-stacking/hydrophobic interactions", "Increased water solubility", "Decreased potency always", "Faster renal clearance"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Aromatic rings often engage in hydrophobic and pi-stacking interactions with receptors." },
    { id: 118, question: "Which type of isomerism involves non-superimposable mirror images?", options: ["Enantiomerism", "Structural isomerism", "Tautomerism", "Geometric isomerism only"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Enantiomers are non-superimposable mirror-image stereoisomers." },
    { id: 119, question: "Which term describes the conversion of an inactive prodrug into its active form in the body?", options: ["Biotransformation/metabolic activation", "Hydrolysis only", "Racemization", "Ionization"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Prodrugs are metabolically activated (often via hydrolysis or oxidation) into active drug." },
    { id: 120, question: "Which drug is a well-known example of a prodrug?", options: ["Enalapril", "Metformin", "Digoxin", "Furosemide"], correctAnswer: 0, category: "Pharmaceutical Chemistry", difficulty: "Medium", explanation: "Enalapril is a prodrug converted to active enalaprilat in the liver." },
    { id: 121, question: "Morphine is derived from which plant?", options: ["Papaver somniferum (opium poppy)", "Cinchona bark", "Digitalis purpurea", "Atropa belladonna"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Easy", explanation: "Morphine is an alkaloid derived from the opium poppy, Papaver somniferum." },
    { id: 122, question: "Quinine, an antimalarial alkaloid, is derived from which source?", options: ["Cinchona bark", "Foxglove", "Poppy", "Willow bark"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Quinine is obtained from the bark of the Cinchona tree." },
    { id: 123, question: "Digoxin, a cardiac glycoside, is derived from which plant?", options: ["Digitalis (foxglove)", "Willow bark", "Poppy", "Cinchona"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Easy", explanation: "Digoxin is derived from Digitalis lanata (foxglove)." },
    { id: 124, question: "Aspirin's active compound was originally derived from which plant source?", options: ["Willow bark", "Poppy", "Foxglove", "Cinchona"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Easy", explanation: "Salicin from willow bark led to the development of aspirin (salicylic acid derivative)." },
    { id: 125, question: "Caffeine belongs to which class of natural compounds?", options: ["Xanthine alkaloid", "Glycoside", "Tannin", "Volatile oil"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Caffeine is a methylxanthine alkaloid found in coffee, tea, and cacao." },
    { id: 126, question: "Which term describes plant-derived sugar-containing compounds like digoxin?", options: ["Glycosides", "Alkaloids", "Tannins", "Resins"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Glycosides consist of a sugar moiety bonded to a non-sugar (aglycone) portion." },
    { id: 127, question: "Tannins are primarily known for which pharmacological property?", options: ["Astringent action", "Analgesic action", "Antihistamine action", "Diuretic action"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Tannins precipitate proteins, giving them astringent properties." },
    { id: 128, question: "Volatile (essential) oils are typically obtained from plants via:", options: ["Steam distillation", "Aqueous extraction only", "Freeze-drying", "Fermentation"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Volatile oils are commonly extracted via steam distillation." },
    { id: 129, question: "Atropine, an anticholinergic alkaloid, is derived from which plant?", options: ["Atropa belladonna", "Cinchona", "Digitalis", "Papaver"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Atropine is derived from Atropa belladonna (deadly nightshade)." },
    { id: 130, question: "Which natural compound class includes vincristine and vinblastine, used in cancer therapy?", options: ["Vinca alkaloids", "Cardiac glycosides", "Tannins", "Saponins"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Vincristine and vinblastine are alkaloids derived from Catharanthus roseus (Vinca)." },
    { id: 131, question: "Ephedrine, a decongestant/stimulant alkaloid, is traditionally derived from which plant genus?", options: ["Ephedra", "Cinchona", "Papaver", "Digitalis"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Ephedrine is derived from Ephedra species." },
    { id: 132, question: "Which is a classic example of a plant-derived antimalarial that remains clinically important?", options: ["Artemisinin", "Digoxin", "Codeine", "Colchicine"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Artemisinin, from Artemisia annua, is a key antimalarial compound." },
    { id: 133, question: "Colchicine, used for gout, is derived from which plant?", options: ["Colchicum autumnale", "Foxglove", "Poppy", "Willow"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Colchicine is derived from the autumn crocus, Colchicum autumnale." },
    { id: 134, question: "Saponins are natural compounds known for producing:", options: ["A soap-like foam in water", "A bitter alkaloid taste only", "Red pigmentation", "Strong odors only"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Saponins form stable foams when shaken with water, similar to soap." },
    { id: 135, question: "Codeine and morphine both belong to which chemical class?", options: ["Opioid alkaloids", "Cardiac glycosides", "Tannins", "Flavonoids"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Easy", explanation: "Codeine and morphine are both opium-derived alkaloids." },
    { id: 136, question: "Which crude drug source is castor oil obtained from?", options: ["Ricinus communis seeds", "Cinchona bark", "Foxglove leaves", "Poppy capsules"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Medium", explanation: "Castor oil is pressed from the seeds of Ricinus communis." },
    { id: 137, question: "Ginkgo biloba extract is commonly marketed for:", options: ["Memory/cognitive support", "Antibiotic activity", "Blood clotting promotion", "Antidiabetic effect"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Easy", explanation: "Ginkgo biloba is popularly used as a supplement for cognitive function." },
    { id: 138, question: "Which term describes the biologically active non-sugar portion of a glycoside?", options: ["Aglycone", "Alkaloid", "Tannin", "Resin"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Hard", explanation: "The aglycone is the non-sugar component of a glycoside, often responsible for activity." },
    { id: 139, question: "St. John's Wort is a well-known herbal supplement associated with which use?", options: ["Mild depression relief", "Diabetes control", "Antibiotic use", "Anticoagulation"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Easy", explanation: "St. John's Wort is popularly used for mild-to-moderate depression, but has many drug interactions." },
    { id: 140, question: "Garlic (Allium sativum) supplements are commonly claimed to help with:", options: ["Cholesterol/cardiovascular support", "Seizure control", "Antipsychotic effect", "Muscle relaxation"], correctAnswer: 0, category: "Pharmacognosy", difficulty: "Easy", explanation: "Garlic is popularly used as a supplement for cardiovascular/cholesterol support." },
    { id: 141, question: "Gram-positive bacteria are characterized by a cell wall rich in:", options: ["Peptidoglycan", "Lipopolysaccharide", "Chitin", "Cellulose"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "Gram-positive bacteria have a thick peptidoglycan layer that retains crystal violet stain." },
    { id: 142, question: "Which structure gives Gram-negative bacteria their outer membrane endotoxin?", options: ["Lipopolysaccharide (LPS)", "Peptidoglycan", "Flagella", "Pili"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "LPS in the outer membrane of Gram-negative bacteria acts as endotoxin." },
    { id: 143, question: "Penicillin works by inhibiting synthesis of which bacterial structure?", options: ["Cell wall (peptidoglycan)", "Ribosomes", "Cell membrane", "DNA gyrase"], correctAnswer: 0, category: "Microbiology", difficulty: "Easy", explanation: "Penicillins inhibit peptidoglycan cross-linking in bacterial cell walls." },
    { id: 144, question: "Which class of antibiotics inhibits bacterial protein synthesis at the 30S ribosomal subunit?", options: ["Aminoglycosides", "Penicillins", "Fluoroquinolones", "Vancomycin"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "Aminoglycosides bind the 30S subunit, causing misreading of mRNA." },
    { id: 145, question: "Which antibiotic class inhibits DNA gyrase/topoisomerase?", options: ["Fluoroquinolones", "Macrolides", "Tetracyclines", "Penicillins"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "Fluoroquinolones inhibit bacterial DNA gyrase and topoisomerase IV." },
    { id: 146, question: "Which antibiotic class binds the 50S ribosomal subunit (e.g., erythromycin)?", options: ["Macrolides", "Aminoglycosides", "Fluoroquinolones", "Sulfonamides"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "Macrolides like erythromycin inhibit protein synthesis at the 50S subunit." },
    { id: 147, question: "MRSA stands for:", options: ["Methicillin-resistant Staphylococcus aureus", "Multi-drug resistant Streptococcus A", "Macrolide-resistant Salmonella", "Methicillin-reduced Staph antigen"], correctAnswer: 0, category: "Microbiology", difficulty: "Easy", explanation: "MRSA is Methicillin-resistant Staphylococcus aureus, a resistant pathogen." },
    { id: 148, question: "Which sterilization method uses high-pressure saturated steam?", options: ["Autoclaving", "Dry heat oven", "UV irradiation", "Filtration"], correctAnswer: 0, category: "Microbiology", difficulty: "Easy", explanation: "Autoclaves use pressurized steam (typically 121°C) to sterilize equipment." },
    { id: 149, question: "Which term describes a substance that kills bacteria (rather than just inhibiting growth)?", options: ["Bactericidal", "Bacteriostatic", "Bacteriophage", "Bacterial vector"], correctAnswer: 0, category: "Microbiology", difficulty: "Easy", explanation: "Bactericidal agents kill bacteria directly, unlike bacteriostatic agents which inhibit growth." },
    { id: 150, question: "Which term describes an agent that inhibits bacterial growth without necessarily killing them?", options: ["Bacteriostatic", "Bactericidal", "Virucidal", "Fungicidal"], correctAnswer: 0, category: "Microbiology", difficulty: "Easy", explanation: "Bacteriostatic agents like tetracyclines inhibit growth, allowing the immune system to clear infection." },
    { id: 151, question: "Which type of organism causes candidiasis (thrush)?", options: ["Fungus", "Bacterium", "Virus", "Protozoan"], correctAnswer: 0, category: "Microbiology", difficulty: "Easy", explanation: "Candida albicans is a fungus responsible for candidiasis." },
    { id: 152, question: "Fluconazole treats fungal infections by inhibiting synthesis of:", options: ["Ergosterol", "Peptidoglycan", "DNA gyrase", "Folic acid"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "Azole antifungals inhibit ergosterol synthesis in fungal cell membranes." },
    { id: 153, question: "Which virus causes AIDS?", options: ["HIV", "HPV", "HBV", "HSV"], correctAnswer: 0, category: "Microbiology", difficulty: "Easy", explanation: "Human Immunodeficiency Virus (HIV) causes AIDS." },
    { id: 154, question: "Antiviral drugs like acyclovir primarily target which viral enzyme?", options: ["Viral DNA polymerase", "Bacterial cell wall synthesis", "Ergosterol synthesis", "Ribosomal subunit"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "Acyclovir is phosphorylated and inhibits viral DNA polymerase." },
    { id: 155, question: "Which disinfection method uses chemical agents applied to non-living surfaces?", options: ["Disinfection with chemical agents (e.g., bleach)", "Sterilization by autoclave only", "Pasteurization only", "Filtration only"], correctAnswer: 0, category: "Microbiology", difficulty: "Easy", explanation: "Chemical disinfectants like bleach are commonly used on surfaces/instruments." },
    { id: 156, question: "E. coli is classified as which type of bacteria on Gram stain?", options: ["Gram-negative rod", "Gram-positive cocci", "Acid-fast bacillus", "Gram-positive rod"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "E. coli is a Gram-negative rod-shaped bacterium." },
    { id: 157, question: "Which bacterium is a common cause of strep throat?", options: ["Streptococcus pyogenes", "Staphylococcus aureus", "Escherichia coli", "Clostridium difficile"], correctAnswer: 0, category: "Microbiology", difficulty: "Easy", explanation: "Streptococcus pyogenes (Group A strep) commonly causes strep throat." },
    { id: 158, question: "Which organism is a common cause of antibiotic-associated diarrhea/colitis?", options: ["Clostridioides difficile", "Streptococcus pyogenes", "Candida albicans", "Influenza virus"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "C. difficile overgrowth after antibiotic use can cause severe colitis." },
    { id: 159, question: "Vancomycin is often reserved for treating which type of infection?", options: ["Serious Gram-positive infections including MRSA", "Fungal infections", "Viral infections", "Parasitic infections"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "Vancomycin is a glycopeptide used for serious Gram-positive infections like MRSA." },
    { id: 160, question: "Which term describes bacteria that require oxygen to survive?", options: ["Obligate aerobes", "Obligate anaerobes", "Facultative anaerobes only", "Microaerophiles only"], correctAnswer: 0, category: "Microbiology", difficulty: "Medium", explanation: "Obligate aerobes require oxygen for growth and survival." },
    { id: 161, question: "Enzymes function primarily by:", options: ["Lowering the activation energy of reactions", "Increasing reaction temperature", "Being consumed in the reaction", "Increasing substrate concentration"], correctAnswer: 0, category: "Biochemistry", difficulty: "Easy", explanation: "Enzymes act as catalysts, lowering activation energy without being consumed." },
    { id: 162, question: "Vitamin K is essential for the synthesis of which type of proteins?", options: ["Clotting factors", "Hemoglobin", "Collagen only", "Insulin"], correctAnswer: 0, category: "Biochemistry", difficulty: "Medium", explanation: "Vitamin K is a cofactor for carboxylation of clotting factors II, VII, IX, X." },
    { id: 163, question: "Which vitamin deficiency causes scurvy?", options: ["Vitamin C", "Vitamin D", "Vitamin B12", "Vitamin A"], correctAnswer: 0, category: "Biochemistry", difficulty: "Easy", explanation: "Vitamin C deficiency causes scurvy due to impaired collagen synthesis." },
    { id: 164, question: "Which vitamin deficiency causes beriberi?", options: ["Thiamine (B1)", "Riboflavin (B2)", "Niacin (B3)", "Folate (B9)"], correctAnswer: 0, category: "Biochemistry", difficulty: "Medium", explanation: "Thiamine deficiency causes beriberi, affecting cardiovascular and nervous systems." },
    { id: 165, question: "Which vitamin deficiency is linked to megaloblastic anemia and neural tube defects?", options: ["Folate (B9)", "Vitamin C", "Vitamin E", "Vitamin K"], correctAnswer: 0, category: "Biochemistry", difficulty: "Medium", explanation: "Folate deficiency causes megaloblastic anemia and increases neural tube defect risk in pregnancy." },
    { id: 166, question: "Which macronutrient is the primary source of quick cellular energy (glucose)?", options: ["Carbohydrates", "Lipids", "Proteins", "Vitamins"], correctAnswer: 0, category: "Biochemistry", difficulty: "Easy", explanation: "Carbohydrates are broken down into glucose, the primary quick-energy fuel." },
    { id: 167, question: "Proteins are composed of chains of which building blocks?", options: ["Amino acids", "Fatty acids", "Nucleotides", "Monosaccharides"], correctAnswer: 0, category: "Biochemistry", difficulty: "Easy", explanation: "Proteins are polymers of amino acids linked by peptide bonds." },
    { id: 168, question: "Which biomolecule class includes cholesterol and triglycerides?", options: ["Lipids", "Carbohydrates", "Proteins", "Nucleic acids"], correctAnswer: 0, category: "Biochemistry", difficulty: "Easy", explanation: "Cholesterol and triglycerides are both classified as lipids." },
    { id: 169, question: "DNA is composed of nucleotides containing which sugar?", options: ["Deoxyribose", "Ribose", "Glucose", "Fructose"], correctAnswer: 0, category: "Biochemistry", difficulty: "Medium", explanation: "DNA nucleotides contain deoxyribose sugar, distinguishing it from RNA (ribose)." },
    { id: 170, question: "Glycolysis is the metabolic pathway that breaks down:", options: ["Glucose", "Fatty acids", "Amino acids", "Nucleotides"], correctAnswer: 0, category: "Biochemistry", difficulty: "Medium", explanation: "Glycolysis breaks down glucose into pyruvate, generating ATP." },
    { id: 171, question: "Which enzyme converts angiotensin I to angiotensin II?", options: ["ACE (Angiotensin-Converting Enzyme)", "Renin", "Aldosterone synthase", "COX-2"], correctAnswer: 0, category: "Biochemistry", difficulty: "Medium", explanation: "ACE converts angiotensin I into the potent vasoconstrictor angiotensin II." },
    { id: 172, question: "Cytochrome P450 enzymes are primarily located in which organ for drug metabolism?", options: ["Liver", "Kidney", "Lungs", "Spleen"], correctAnswer: 0, category: "Biochemistry", difficulty: "Easy", explanation: "CYP450 enzymes in the liver are central to Phase I drug metabolism." },
    { id: 173, question: "Which type of reaction is catalyzed by CYP450 enzymes (Phase I metabolism)?", options: ["Oxidation", "Glucuronidation", "Acetylation", "Sulfation"], correctAnswer: 0, category: "Biochemistry", difficulty: "Medium", explanation: "CYP450 enzymes primarily catalyze oxidation reactions in Phase I metabolism." },
    { id: 174, question: "Which vitamin is fat-soluble?", options: ["Vitamin D", "Vitamin C", "Vitamin B6", "Folate"], correctAnswer: 0, category: "Biochemistry", difficulty: "Medium", explanation: "Vitamins A, D, E, and K are fat-soluble; B vitamins and C are water-soluble." },
    { id: 175, question: "Which of the following is a water-soluble vitamin?", options: ["Vitamin B12", "Vitamin A", "Vitamin D", "Vitamin E"], correctAnswer: 0, category: "Biochemistry", difficulty: "Medium", explanation: "B vitamins and vitamin C are water-soluble, unlike A, D, E, K." },
    { id: 176, question: "Which organ is primarily responsible for drug metabolism?", options: ["Liver", "Kidney", "Lungs", "Spleen"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Easy", explanation: "The liver is the primary site of drug metabolism." },
    { id: 177, question: "Which organ is primarily responsible for excreting water-soluble drug metabolites?", options: ["Kidney", "Liver", "Lungs", "Skin"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Easy", explanation: "The kidneys excrete water-soluble drugs and metabolites in urine." },
    { id: 178, question: "Normal resting adult heart rate is approximately:", options: ["60-100 bpm", "20-40 bpm", "120-160 bpm", "150-200 bpm"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Easy", explanation: "Normal resting adult heart rate is typically 60-100 beats per minute." },
    { id: 179, question: "Normal adult blood pressure is generally considered to be around:", options: ["120/80 mmHg", "180/120 mmHg", "90/40 mmHg", "60/30 mmHg"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Easy", explanation: "120/80 mmHg is commonly cited as a normal adult blood pressure." },
    { id: 180, question: "Which chamber of the heart pumps oxygenated blood to the body?", options: ["Left ventricle", "Right ventricle", "Left atrium", "Right atrium"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Medium", explanation: "The left ventricle pumps oxygenated blood into the aorta and systemic circulation." },
    { id: 181, question: "Which part of the nephron is the primary site of drug reabsorption/secretion regulation?", options: ["Renal tubules", "Bowman's capsule only", "Glomerulus only", "Ureter"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Medium", explanation: "Renal tubules are responsible for reabsorption and secretion processes affecting drug excretion." },
    { id: 182, question: "The autonomic nervous system is divided into which two main branches?", options: ["Sympathetic and parasympathetic", "Central and peripheral", "Somatic and enteric", "Afferent and efferent only"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Easy", explanation: "The ANS consists of sympathetic ('fight or flight') and parasympathetic ('rest and digest') branches." },
    { id: 183, question: "Which neurotransmitter is primarily released by parasympathetic neurons at the target organ?", options: ["Acetylcholine", "Norepinephrine", "Dopamine", "Serotonin"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Medium", explanation: "Parasympathetic postganglionic neurons release acetylcholine at target organs." },
    { id: 184, question: "Which neurotransmitter is primarily released by sympathetic postganglionic neurons?", options: ["Norepinephrine", "Acetylcholine", "GABA", "Glycine"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Medium", explanation: "Most sympathetic postganglionic neurons release norepinephrine (except sweat glands)." },
    { id: 185, question: "Which organ produces insulin?", options: ["Pancreas", "Liver", "Adrenal gland", "Thyroid"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Easy", explanation: "Insulin is produced by beta cells in the pancreatic islets of Langerhans." },
    { id: 186, question: "Which gland produces thyroid hormones that regulate metabolism?", options: ["Thyroid gland", "Pancreas", "Adrenal gland", "Pituitary gland"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Easy", explanation: "The thyroid gland produces T3 and T4 hormones regulating metabolism." },
    { id: 187, question: "Which gland releases adrenaline (epinephrine) in response to stress?", options: ["Adrenal medulla", "Thyroid", "Pancreas", "Pituitary"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Medium", explanation: "The adrenal medulla releases epinephrine and norepinephrine during stress response." },
    { id: 188, question: "Normal fasting blood glucose is generally considered to be:", options: ["70-100 mg/dL", "150-200 mg/dL", "200-250 mg/dL", "30-50 mg/dL"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Medium", explanation: "Normal fasting blood glucose is typically 70-100 mg/dL." },
    { id: 189, question: "Which blood cell type is primarily responsible for oxygen transport?", options: ["Red blood cells (erythrocytes)", "White blood cells", "Platelets", "Plasma cells"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Easy", explanation: "Red blood cells contain hemoglobin, which binds and transports oxygen." },
    { id: 190, question: "Which blood component is primarily responsible for clot formation?", options: ["Platelets", "Red blood cells", "Lymphocytes", "Plasma"], correctAnswer: 0, category: "Anatomy & Physiology", difficulty: "Easy", explanation: "Platelets aggregate to form clots at sites of vascular injury." },
    { id: 191, question: "Which lab value is used to monitor kidney function and dose-adjust renally cleared drugs?", options: ["Serum creatinine / creatinine clearance", "Hemoglobin A1c", "Liver function tests", "INR"], correctAnswer: 0, category: "Clinical Pharmacy", difficulty: "Medium", explanation: "Serum creatinine and creatinine clearance estimate renal function for dose adjustment." },
    { id: 192, question: "Which lab value reflects average blood glucose control over about 3 months?", options: ["Hemoglobin A1c", "Fasting glucose only", "Serum creatinine", "INR"], correctAnswer: 0, category: "Clinical Pharmacy", difficulty: "Medium", explanation: "HbA1c reflects average blood glucose over the preceding 2-3 months." },
    { id: 193, question: "Which drug interaction risk is highest when combining warfarin with NSAIDs?", options: ["Increased bleeding risk", "Increased infection risk", "Decreased anticoagulation", "No significant interaction"], correctAnswer: 0, category: "Clinical Pharmacy", difficulty: "Medium", explanation: "NSAIDs increase bleeding risk when combined with warfarin due to additive effects and GI irritation." },
    { id: 194, question: "Grapefruit juice is known to interact with many drugs by inhibiting which enzyme?", options: ["CYP3A4", "CYP2D6", "Monoamine oxidase", "Acetylcholinesterase"], correctAnswer: 0, category: "Clinical Pharmacy", difficulty: "Medium", explanation: "Grapefruit juice inhibits intestinal CYP3A4, increasing bioavailability of many drugs." },
    { id: 195, question: "Combining an SSRI with an MAOI carries a significant risk of:", options: ["Serotonin syndrome", "Hypoglycemia", "Renal failure", "Hepatotoxicity"], correctAnswer: 0, category: "Clinical Pharmacy", difficulty: "Medium", explanation: "Combining serotonergic drugs like SSRIs with MAOIs risks life-threatening serotonin syndrome." },
    { id: 196, question: "Which counseling point is most important for a patient starting metformin?", options: ["Take with food to reduce GI upset", "Take on an empty stomach only", "Avoid all carbohydrates", "Take at bedtime only"], correctAnswer: 0, category: "Clinical Pharmacy", difficulty: "Easy", explanation: "Taking metformin with food helps reduce common GI side effects." },
    { id: 197, question: "Patients on ACE inhibitors should have which lab monitored periodically?", options: ["Potassium and renal function", "Liver enzymes only", "Blood glucose only", "Platelet count"], correctAnswer: 0, category: "Clinical Pharmacy", difficulty: "Medium", explanation: "ACE inhibitors can cause hyperkalemia and affect renal function, requiring monitoring." },
    { id: 198, question: "A patient taking warfarin should be counseled to maintain consistent intake of which nutrient?", options: ["Vitamin K (leafy greens)", "Vitamin C", "Calcium", "Sodium"], correctAnswer: 0, category: "Clinical Pharmacy", difficulty: "Medium", explanation: "Consistent vitamin K intake helps maintain stable INR control on warfarin." },
    { id: 199, question: "Which sign is a classic symptom of an allergic drug reaction requiring immediate attention?", options: ["Hives and swelling (angioedema)", "Mild drowsiness", "Dry mouth", "Mild nausea"], correctAnswer: 0, category: "Clinical Pharmacy", difficulty: "Easy", explanation: "Hives and angioedema can signal a serious allergic reaction requiring urgent care." },
    { id: 200, question: "Which practice is a key part of medication safety when dispensing look-alike/sound-alike drugs?", options: ["Using tall-man lettering and double-checking", "Dispensing quickly without verification", "Ignoring similar packaging", "Relying on memory only"], correctAnswer: 0, category: "Clinical Pharmacy", difficulty: "Easy", explanation: "Tall-man lettering and verification checks reduce errors with look-alike/sound-alike drugs." },
    { id: 201, question: "What is a first-line treatment class for uncomplicated hypertension in many guidelines?", options: ["Thiazide diuretics, ACEi/ARB, or CCBs", "Opioids", "Antibiotics", "Antihistamines"], correctAnswer: 0, category: "Pharmacotherapy", difficulty: "Medium", explanation: "Thiazides, ACE inhibitors/ARBs, and calcium channel blockers are common first-line antihypertensives." },
    { id: 202, question: "Which medication class is typically first-line for uncomplicated type 2 diabetes?", options: ["Metformin", "Insulin", "Sulfonylureas", "SGLT2 inhibitors only"], correctAnswer: 0, category: "Pharmacotherapy", difficulty: "Easy", explanation: "Metformin is generally recommended as first-line therapy for type 2 diabetes." },
    { id: 203, question: "Which drug class is commonly first-line for treating GERD symptoms?", options: ["Proton pump inhibitors", "Opioids", "Antibiotics", "Antihistamines (H1)"], correctAnswer: 0, category: "Pharmacotherapy", difficulty: "Easy", explanation: "PPIs are commonly used first-line for GERD due to potent acid suppression." },
    { id: 204, question: "Which class of drugs is typically first-line for allergic rhinitis symptom relief?", options: ["Second-generation antihistamines", "Opioids", "Beta blockers", "Statins"], correctAnswer: 0, category: "Pharmacotherapy", difficulty: "Easy", explanation: "Second-generation antihistamines (e.g., loratadine) are first-line and less sedating." },
    { id: 205, question: "Which vaccine-preventable illness is caused by Bordetella pertussis?", options: ["Whooping cough", "Measles", "Chickenpox", "Mumps"], correctAnswer: 0, category: "Pharmacotherapy", difficulty: "Medium", explanation: "Bordetella pertussis causes whooping cough (pertussis)." },
];

const QUESTION_TIME = 10;
const WIN_THRESHOLD = 8;
const TOTAL_QUESTIONS = 10;
const HISTORY_KEY = "pw_quiz_seen_ids_v1";
const HISTORY_CAP = 120; // rolling history cap so it never grows unbounded

// ---------- Storage Helpers ----------
type MemoryStore = { data: Record<string, string> };
const memoryStore: MemoryStore = { data: {} };

function safeGet(key: string): string | null {
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            return window.localStorage.getItem(key);
        }
    } catch (e) { }
    return memoryStore.data[key] ?? null;
}

function safeSet(key: string, value: string): void {
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(key, value);
            return;
        }
    } catch (e) { }
    memoryStore.data[key] = value;
}

function getSeenIds(): number[] {
    const raw = safeGet(HISTORY_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(Number) : [];
    } catch (e) {
        return [];
    }
}

function recordSeenIds(ids: number[]): void {
    const prev = getSeenIds();
    const merged = [...prev, ...ids];
    const trimmed = merged.slice(Math.max(0, merged.length - HISTORY_CAP));
    safeSet(HISTORY_KEY, JSON.stringify(trimmed));
}

// ---------- Shuffle ----------
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ---------- Question Selection ----------
function pickQuizQuestions(): Question[] {
    const seenIds = getSeenIds();
    const seenSet = new Set(seenIds);
    const seenRank = new Map<number, number>();
    seenIds.forEach((id, idx) => seenRank.set(id, idx));

    const unseen = shuffle(QUESTIONS.filter((q) => !seenSet.has(q.id)));
    const seen = QUESTIONS.filter((q) => seenSet.has(q.id)).sort(
        (a, b) => (seenRank.get(a.id) ?? 0) - (seenRank.get(b.id) ?? 0)
    );

    let pool = [...unseen];
    if (pool.length < TOTAL_QUESTIONS) {
        pool = pool.concat(seen);
    }

    const selected = pool.slice(0, TOTAL_QUESTIONS);
    const ordered = shuffle(selected);

    return ordered.map((q) => {
        const optionIdx = shuffle([0, 1, 2, 3]);
        const options = optionIdx.map((i) => q.options[i]);
        const correctAnswer = optionIdx.indexOf(q.correctAnswer);
        return { ...q, options, correctAnswer };
    });
}

// ---------- UI Components ----------
type LogoProps = { size?: number };

function Logo({ size = 34 }: LogoProps) {
    return (
        <div className="flex items-center gap-2.5">
            <div
                className="rounded-xl flex items-center justify-center shadow-md"
                style={{
                    width: size,
                    height: size,
                    background: "linear-gradient(135deg, #2563eb, #4ade80)",
                }}
            >
                <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
                    <path
                        d="M6 12.5L11 7.5C12.66 5.84 15.34 5.84 17 7.5C18.66 9.16 18.66 11.84 17 13.5L12 18.5"
                        stroke="white"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                    />
                    <path
                        d="M14 9.5L9 14.5C7.34 16.16 4.66 16.16 3 14.5C1.34 12.84 1.34 10.16 3 8.5L6 5.5"
                        stroke="white"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            <span
                className="font-bold text-gray-800"
                style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: size * 0.44,
                }}
            >
                PharmaWallah
            </span>
        </div>
    );
}

type WelcomeScreenProps = { onStart: () => void };

function WelcomeScreen({ onStart }: WelcomeScreenProps) {
    return (
        <div className="flex flex-col h-full min-h-[720px]">
            <div className="px-5 pt-5">
                <Logo />
            </div>

            <div className="flex-1 flex flex-col justify-center gap-5 px-5 py-6">
                <div>
                    <div className="text-xs font-bold tracking-widest text-blue-600 mb-2">
                        SCIENCE FAIR EDITION
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                        RAPID
                        <br />
                        PHARMACY
                        <br />
                        QUIZ
                    </h1>
                    <div className="mt-2 text-sm font-medium text-gray-500">
                        Think Fast. Know Pharmacy. Win a Prize.
                    </div>
                </div>

                <div className="flex gap-3">
                    {["10 Questions", "10s / Question", "8/10 To Win"].map((item) => (
                        <div
                            key={item}
                            className="flex-1 bg-white border border-gray-200 rounded-2xl p-3 text-center shadow-sm"
                        >
                            <div className="text-lg font-extrabold text-blue-600">{item.split(" ")[0]}</div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
                                {item.split(" ").slice(1).join(" ")}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="font-bold text-gray-800 mb-2">How it works</div>
                    <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
                        <li>Answer 10 pharmacy MCQs, 4 options each</li>
                        <li>You get 10 seconds per question — no pausing</li>
                        <li>Score 8 or more correct to win</li>
                        <li>Winners collect a PharmaWallah Pen + Sticker at the booth</li>
                    </ul>
                </div>
            </div>

            <div className="px-5 pb-7">
                <button
                    onClick={onStart}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                    START QUIZ
                </button>
                <div className="text-center mt-3 text-sm font-semibold text-blue-600">
                    Can you score 8/10?
                </div>
            </div>
        </div>
    );
}

type QuestionScreenProps = {
    question: Question;
    index: number;
    total: number;
    onAnswer: (selectedIdx: number | null, timeLeft: number) => void;
};

function QuestionScreen({ question, index, total, onAnswer }: QuestionScreenProps) {
    const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME);
    const [selected, setSelected] = useState<number | null>(null);
    const [locked, setLocked] = useState<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const answeredRef = useRef<boolean>(false);
    const questionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Reset per-question state
        setTimeLeft(QUESTION_TIME);
        setSelected(null);
        setLocked(false);
        answeredRef.current = false;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    if (!answeredRef.current) {
                        answeredRef.current = true;
                        setLocked(true);
                        setTimeout(() => onAnswer(null, 0), 450);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [question.id]);

    const handleSelect = (idx: number) => {
        if (locked || answeredRef.current) return;
        answeredRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
        setSelected(idx);
        setLocked(true);
        setTimeout(() => onAnswer(idx, timeLeft), 500);
    };

    const urgent = timeLeft <= 3;
    const timeUp = timeLeft === 0;

    return (
        <div className="flex flex-col h-full min-h-[720px]">
            <div className="px-5 pt-5">
                <Logo size={26} />
            </div>

            <div className="px-5 pt-3">
                <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-blue-600">
                        QUESTION {index + 1} / {total}
                    </span>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-green-400 rounded-full transition-all"
                            style={{ width: `${(index / total) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex justify-center my-4">
                    <div
                        className={`rounded-full flex items-center justify-center bg-white shadow-lg transition-all ${urgent ? "scale-105 ring-4 ring-red-200" : "ring-4 ring-blue-100"
                            }`}
                        style={{
                            width: 80,
                            height: 80,
                            border: urgent ? "4px solid #ef4444" : "4px solid #2563eb",
                        }}
                    >
                        <span
                            className={`font-extrabold text-3xl ${urgent ? "text-red-600" : "text-blue-600"
                                }`}
                        >
                            {timeUp ? "0" : String(timeLeft).padStart(2, "0")}
                        </span>
                    </div>
                </div>
                {timeUp && (
                    <div className="text-center text-sm font-bold text-red-600 mb-2">TIME UP</div>
                )}
            </div>

            <div ref={questionRef} className="flex-1 px-5 overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl p-5 shadow-lg">
                    <span className="inline-block bg-white/20 text-white text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-3">
                        {question.category}
                    </span>
                    <div className="text-xl font-bold text-white leading-snug">
                        {question.question}
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-5">
                    {question.options.map((opt, idx) => {
                        const letters = ["A", "B", "C", "D"];
                        let bg = "bg-white";
                        let border = "border-gray-200";
                        let text = "text-gray-800";
                        if (locked) {
                            if (idx === question.correctAnswer) {
                                bg = "bg-green-50";
                                border = "border-green-500";
                                text = "text-green-700";
                            } else if (idx === selected && idx !== question.correctAnswer) {
                                bg = "bg-red-50";
                                border = "border-red-500";
                                text = "text-red-700";
                            } else {
                                bg = "bg-gray-50";
                                border = "border-gray-200";
                                text = "text-gray-400";
                            }
                        }
                        return (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                disabled={locked}
                                className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border-2 font-semibold text-left transition-colors ${bg} ${border} ${text} ${locked ? "cursor-default" : "cursor-pointer hover:border-blue-300"
                                    }`}
                            >
                                <span
                                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-extrabold text-sm ${border}`}
                                >
                                    {letters[idx]}
                                </span>
                                <span className="flex-1">{opt}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="h-5" />
        </div>
    );
}

type FeedbackFlashProps = {
    correct: boolean;
    show: boolean;
};

function FeedbackFlash({ correct, show }: FeedbackFlashProps) {
    if (!show) return null;
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <div
                className={`font-extrabold text-2xl px-7 py-3.5 rounded-2xl text-white shadow-2xl ${correct ? "bg-green-500" : "bg-red-500"
                    }`}
                style={{ animation: "pw-pop 0.5s ease" }}
            >
                {correct ? "CORRECT +1" : "WRONG"}
            </div>
        </div>
    );
}

type ResultScreenProps = {
    score: number;
    total: number;
    onRestart: () => void;
    onClaimPrize: () => void;
};

function ResultScreen({ score, total, onRestart, onClaimPrize }: ResultScreenProps) {
    const won = score >= WIN_THRESHOLD;
    return (
        <div className="flex flex-col h-full min-h-[720px]">
            <div className="px-5 pt-5">
                <Logo />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <div className="text-sm font-bold tracking-widest text-gray-500 mb-2">
                    QUIZ COMPLETE
                </div>
                <div className="text-7xl font-extrabold text-gray-900">
                    {score}
                    <span className="text-4xl text-gray-400">/{total}</span>
                </div>

                {won ? (
                    <>
                        <div className="text-2xl font-extrabold text-green-600 mt-4">
                            CONGRATULATIONS! 🎉
                        </div>
                        <div className="text-base text-gray-600 mt-2">
                            You scored {WIN_THRESHOLD}/10 or higher.
                        </div>
                        <div className="text-base text-gray-600">
                            You've earned a PharmaWallah prize.
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-2xl font-extrabold text-blue-600 mt-4">
                            Almost There!
                        </div>
                        <div className="text-base text-gray-600 mt-2">You scored {score}/10.</div>
                        <div className="text-base text-gray-600">
                            Think you can beat it? Try again!
                        </div>
                    </>
                )}
            </div>

            <div className="px-5 pb-7">
                {won ? (
                    <button
                        onClick={onClaimPrize}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                        COLLECT MY PRIZE
                    </button>
                ) : (
                    <button
                        onClick={onRestart}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                        PLAY AGAIN
                    </button>
                )}
            </div>
        </div>
    );
}

type PrizeScreenProps = {
    score: number;
    onPlayAgain: () => void;
};

function PrizeScreen({ score, onPlayAgain }: PrizeScreenProps) {
    return (
        <div className="flex flex-col h-full min-h-[720px]">
            <div className="px-5 pt-5">
                <Logo />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
                <div className="text-base font-extrabold text-blue-600 tracking-wider">
                    🏆 PRIZE UNLOCKED
                </div>

                <div className="w-full max-w-xs bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                    <div className="text-xs font-bold tracking-widest text-green-600">
                        PHARMAWALLAH
                    </div>
                    <div className="text-lg font-extrabold text-gray-900 mt-1">
                        Rapid Pharmacy Quiz Winner
                    </div>
                    <div className="flex justify-between items-center mt-4 text-sm font-medium text-gray-600">
                        <span>Score</span>
                        <span className="text-xl font-extrabold text-gray-900">{score}/10</span>
                    </div>
                    <hr className="my-4 border-gray-200" />
                    <div className="text-xs font-bold tracking-widest text-green-600 mb-2">
                        CLAIM YOUR PRIZE
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                        ✓ 1× PharmaWallah Pen
                    </div>
                    <div className="text-sm font-semibold text-gray-700 mt-1">
                        ✓ 1× PharmaWallah Sticker
                    </div>
                    <div className="inline-block mt-4 bg-green-100 text-green-800 text-xs font-bold px-4 py-1.5 rounded-full">
                        ✓ QUALIFIED
                    </div>
                </div>

                <div className="text-sm text-gray-500 font-medium max-w-xs">
                    Show this screen to the PharmaWallah team at the booth.
                </div>
            </div>

            <div className="px-5 pb-7">
                <button
                    onClick={onPlayAgain}
                    className="w-full py-3.5 rounded-2xl border-2 border-blue-600 text-blue-600 font-bold text-base hover:bg-blue-50 transition-colors"
                >
                    PLAY AGAIN
                </button>
            </div>
        </div>
    );
}

// ---------- Root Component ----------
export default function PharmaWallahQuiz() {
    const [phase, setPhase] = useState<Phase>("welcome");
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
    const [qIndex, setQIndex] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [flash, setFlash] = useState<FlashState>({ show: false, correct: false });
    const flashTimeout = useRef<NodeJS.Timeout | null>(null);

    // Scroll to top whenever question index or phase changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [qIndex, phase]);

    const startQuiz = useCallback(() => {
        const qs = pickQuizQuestions();
        setQuizQuestions(qs);
        setQIndex(0);
        setScore(0);
        setPhase("quiz");
    }, []);

    const handleAnswer = (selectedIdx: number | null, _timeLeft: number) => {
        const q = quizQuestions[qIndex];
        const correct = selectedIdx !== null && selectedIdx === q.correctAnswer;
        if (correct) setScore((s) => s + 1);

        if (flashTimeout.current) clearTimeout(flashTimeout.current);
        setFlash({ show: true, correct });
        flashTimeout.current = setTimeout(() => setFlash({ show: false, correct: false }), 420);

        const isLast = qIndex === quizQuestions.length - 1;
        setTimeout(() => {
            if (isLast) {
                recordSeenIds(quizQuestions.map((qq) => qq.id));
                setPhase("result");
            } else {
                setQIndex((i) => i + 1);
            }
        }, 60);
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center py-4">
            <style>{`
                @keyframes pw-pop {
                    0% { transform: scale(0.7); opacity: 0; }
                    60% { transform: scale(1.06); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                * { box-sizing: border-box; }
                button:focus-visible {
                    outline: 3px solid #3b82f6;
                    outline-offset: 2px;
                }
            `}</style>
            <div className="w-full max-w-[430px] bg-white rounded-[28px] overflow-hidden shadow-2xl border border-gray-200 flex flex-col">
                {phase === "welcome" && <WelcomeScreen onStart={startQuiz} />}

                {phase === "quiz" && quizQuestions.length > 0 && (
                    <div className="relative h-full">
                        <QuestionScreen
                            key={quizQuestions[qIndex].id}
                            question={quizQuestions[qIndex]}
                            index={qIndex}
                            total={quizQuestions.length}
                            onAnswer={handleAnswer}
                        />
                        <FeedbackFlash show={flash.show} correct={flash.correct} />
                    </div>
                )}

                {phase === "result" && (
                    <ResultScreen
                        score={score}
                        total={quizQuestions.length}
                        onRestart={startQuiz}
                        onClaimPrize={() => setPhase("prize")}
                    />
                )}

                {phase === "prize" && <PrizeScreen score={score} onPlayAgain={startQuiz} />}
            </div>
        </div>
    );
}