-- ============================================================================
-- Battle Royale — starter question bank
-- ============================================================================
-- Run AFTER supabase/migrations/20260927_battle_royale.sql. Safe to re-run:
-- every row carries a `seed_key`, and existing keys are left alone — so an
-- admin's edits in the dashboard are never overwritten by a re-run.
--
-- 22 words (round 1), 8 matching boards of 5 pairs (round 2) and 31 MCQs
-- (round 3). Written for teaching; have a pharmacist read them before the
-- event, and edit or retire any of them from /battle-royale/admin/questions.
-- ============================================================================

-- ─── Round 1 — Word blocks ──────────────────────────────────────────────────
-- Time limit grows with length: the player has to find more letters.
insert into public.br_questions (seed_key, round, type, question, correct_answer, explanation, points, time_limit, difficulty)
values
  ('w-aspirin',     1, 'WORD', 'Irreversible COX inhibitor, used at low dose as an antiplatelet', 'ASPIRIN', 'Aspirin acetylates cyclo-oxygenase irreversibly, so its antiplatelet effect lasts the life of the platelet.', 10, 30, 'easy'),
  ('w-capsule',     1, 'WORD', 'Solid dosage form with a hard or soft gelatin shell', 'CAPSULE', null, 10, 30, 'easy'),
  ('w-tablet',      1, 'WORD', 'Solid dosage form made by compressing powder or granules', 'TABLET', null, 10, 30, 'easy'),
  ('w-dosage',      1, 'WORD', 'The amount, frequency and number of doses of a medicine', 'DOSAGE', null, 10, 30, 'easy'),
  ('w-syrup',       1, 'WORD', 'Concentrated aqueous sugar solution used as an oral vehicle', 'SYRUP', null, 10, 25, 'easy'),
  ('w-insulin',     1, 'WORD', 'Peptide hormone from pancreatic beta cells that lowers blood glucose', 'INSULIN', null, 10, 30, 'easy'),
  ('w-placebo',     1, 'WORD', 'Inert preparation given as the control in a clinical trial', 'PLACEBO', null, 10, 30, 'easy'),
  ('w-pharmacy',    1, 'WORD', 'The science and practice of preparing and dispensing medicines', 'PHARMACY', null, 10, 35, 'medium'),
  ('w-morphine',    1, 'WORD', 'The principal alkaloid of opium, a strong opioid analgesic', 'MORPHINE', null, 10, 35, 'medium'),
  ('w-heparin',     1, 'WORD', 'Parenteral anticoagulant that works by potentiating antithrombin', 'HEPARIN', 'Its antidote is protamine sulfate.', 10, 35, 'medium'),
  ('w-warfarin',    1, 'WORD', 'Oral anticoagulant that antagonises vitamin K', 'WARFARIN', 'Monitored by the INR.', 10, 35, 'medium'),
  ('w-atropine',    1, 'WORD', 'Muscarinic antagonist used for bradycardia and organophosphate poisoning', 'ATROPINE', null, 10, 35, 'medium'),
  ('w-emulsion',    1, 'WORD', 'Dispersion of one immiscible liquid in another, stabilised by an emulsifier', 'EMULSION', null, 10, 35, 'medium'),
  ('w-ointment',    1, 'WORD', 'Greasy semisolid preparation applied to the skin', 'OINTMENT', null, 10, 35, 'medium'),
  ('w-adherence',   1, 'WORD', 'How closely a patient follows the treatment plan agreed with the prescriber', 'ADHERENCE', null, 10, 40, 'medium'),
  ('w-metformin',   1, 'WORD', 'First-line biguanide for type 2 diabetes', 'METFORMIN', null, 10, 40, 'medium'),
  ('w-excipient',   1, 'WORD', 'An inactive ingredient in a formulation', 'EXCIPIENT', null, 10, 40, 'medium'),
  ('w-antibiotic',  1, 'WORD', 'A drug that kills bacteria or stops them multiplying', 'ANTIBIOTIC', null, 10, 45, 'hard'),
  ('w-amoxicillin', 1, 'WORD', 'An aminopenicillin, often combined with clavulanic acid', 'AMOXICILLIN', null, 10, 45, 'hard'),
  ('w-paracetamol', 1, 'WORD', 'Analgesic and antipyretic whose overdose damages the liver', 'PARACETAMOL', 'The antidote is N-acetylcysteine.', 10, 45, 'hard'),
  ('w-suppository', 1, 'WORD', 'Solid dosage form for rectal insertion that melts at body temperature', 'SUPPOSITORY', null, 10, 45, 'hard'),
  ('w-bioavail',    1, 'WORD', 'Fraction of a dose that reaches the systemic circulation unchanged', 'BIOAVAILABILITY', null, 10, 50, 'hard')
on conflict (seed_key) do nothing;

-- ─── Round 2 — Column matching ──────────────────────────────────────────────
-- `points` is per correct pair: a perfect board of five pairs scores 25.
insert into public.br_questions (seed_key, round, type, question, options, points, time_limit, difficulty)
values
  ('m-drug-class', 2, 'MATCHING', 'Match each drug to its class', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Metformin',    'right', 'Biguanide'),
      jsonb_build_object('left', 'Atenolol',     'right', 'Beta-blocker'),
      jsonb_build_object('left', 'Omeprazole',   'right', 'Proton pump inhibitor'),
      jsonb_build_object('left', 'Amlodipine',   'right', 'Calcium channel blocker'),
      jsonb_build_object('left', 'Atorvastatin', 'right', 'HMG-CoA reductase inhibitor'))), 5, 75, 'easy'),
  ('m-drug-indication', 2, 'MATCHING', 'Match each drug to its main use', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Salbutamol',    'right', 'Acute bronchospasm'),
      jsonb_build_object('left', 'Levothyroxine', 'right', 'Hypothyroidism'),
      jsonb_build_object('left', 'Allopurinol',   'right', 'Prevention of gout attacks'),
      jsonb_build_object('left', 'Ondansetron',   'right', 'Nausea and vomiting'),
      jsonb_build_object('left', 'Sumatriptan',   'right', 'Acute migraine'))), 5, 75, 'easy'),
  ('m-drug-mechanism', 2, 'MATCHING', 'Match each drug to its mechanism of action', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Omeprazole',    'right', 'Blocks the gastric H+/K+ ATPase'),
      jsonb_build_object('left', 'Penicillin',    'right', 'Inhibits bacterial cell-wall synthesis'),
      jsonb_build_object('left', 'Ciprofloxacin', 'right', 'Inhibits DNA gyrase'),
      jsonb_build_object('left', 'Captopril',     'right', 'Inhibits angiotensin-converting enzyme'),
      jsonb_build_object('left', 'Furosemide',    'right', 'Blocks the Na+/K+/2Cl- cotransporter'))), 5, 90, 'medium'),
  ('m-apparatus', 2, 'MATCHING', 'Match each piece of apparatus to its function', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Burette',          'right', 'Delivers measured volumes in a titration'),
      jsonb_build_object('left', 'Volumetric pipette','right', 'Transfers one fixed volume accurately'),
      jsonb_build_object('left', 'Desiccator',       'right', 'Keeps samples dry'),
      jsonb_build_object('left', 'Pycnometer',       'right', 'Measures density'),
      jsonb_build_object('left', 'Mortar and pestle','right', 'Triturates solids'))), 5, 75, 'easy'),
  ('m-dosage-route', 2, 'MATCHING', 'Match each dosage form to its route', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Suppository',          'right', 'Rectal'),
      jsonb_build_object('left', 'Pessary',              'right', 'Vaginal'),
      jsonb_build_object('left', 'Metered-dose inhaler', 'right', 'Pulmonary'),
      jsonb_build_object('left', 'Glyceryl trinitrate spray', 'right', 'Sublingual'),
      jsonb_build_object('left', 'Eye drops',            'right', 'Ophthalmic'))), 5, 75, 'easy'),
  ('m-lab-test', 2, 'MATCHING', 'Match each laboratory test to what it measures', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'HbA1c',            'right', 'Long-term glycaemic control'),
      jsonb_build_object('left', 'INR',              'right', 'Warfarin therapy'),
      jsonb_build_object('left', 'Serum creatinine', 'right', 'Kidney function'),
      jsonb_build_object('left', 'ALT',              'right', 'Liver cell injury'),
      jsonb_build_object('left', 'TSH',              'right', 'Thyroid function'))), 5, 75, 'medium'),
  ('m-vitamin', 2, 'MATCHING', 'Match each vitamin to its deficiency disease', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Vitamin C',         'right', 'Scurvy'),
      jsonb_build_object('left', 'Vitamin D',         'right', 'Rickets'),
      jsonb_build_object('left', 'Thiamine (B1)',     'right', 'Beriberi'),
      jsonb_build_object('left', 'Niacin (B3)',       'right', 'Pellagra'),
      jsonb_build_object('left', 'Cyanocobalamin (B12)', 'right', 'Megaloblastic anaemia'))), 5, 75, 'easy'),
  ('m-antidote', 2, 'MATCHING', 'Match each poisoning to its antidote', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Opioids',         'right', 'Naloxone'),
      jsonb_build_object('left', 'Paracetamol',     'right', 'N-acetylcysteine'),
      jsonb_build_object('left', 'Benzodiazepines', 'right', 'Flumazenil'),
      jsonb_build_object('left', 'Warfarin',        'right', 'Vitamin K'),
      jsonb_build_object('left', 'Heparin',         'right', 'Protamine sulfate'))), 5, 75, 'medium')
on conflict (seed_key) do nothing;

-- ─── Round 3 — Final quiz ───────────────────────────────────────────────────
insert into public.br_questions (seed_key, round, type, question, options, correct_answer, explanation, points, time_limit, difficulty)
select key, 3, 'MCQ', q, jsonb_build_object('A', a, 'B', b, 'C', c, 'D', d), ans, expl, 10, secs, diff
from (values
  ('q-loop-diuretic', 'Which of these is a loop diuretic?', 'Hydrochlorothiazide', 'Furosemide', 'Spironolactone', 'Acetazolamide', 'B', 'Furosemide blocks the Na+/K+/2Cl- cotransporter in the thick ascending limb.', 20, 'easy'),
  ('q-pcm-antidote', 'The antidote for paracetamol overdose is:', 'Naloxone', 'Flumazenil', 'N-acetylcysteine', 'Atropine', 'C', 'N-acetylcysteine replenishes glutathione.', 20, 'easy'),
  ('q-half-life', 'A drug has a half-life of 4 hours. What fraction of a dose remains after 12 hours?', '1/2', '1/4', '1/8', '1/16', 'C', '12 h is three half-lives: 1/2 × 1/2 × 1/2 = 1/8.', 30, 'medium'),
  ('q-percent-wv', 'How much drug is in 100 mL of a 2% w/v solution?', '20 mg', '200 mg', '2000 mg', '20000 mg', 'C', '2% w/v means 2 g per 100 mL, which is 2000 mg.', 30, 'medium'),
  ('q-prodrug', 'Which ACE inhibitor is a prodrug activated in the liver?', 'Enalapril', 'Captopril', 'Lisinopril', 'None of them', 'A', 'Enalapril is hydrolysed to enalaprilat.', 25, 'medium'),
  ('q-30s', 'Aminoglycosides inhibit protein synthesis by binding to:', 'The 50S subunit', 'The 30S subunit', 'DNA gyrase', 'The cell wall', 'B', null, 20, 'medium'),
  ('q-gram', 'Gram-positive bacteria appear which colour after Gram staining?', 'Pink', 'Purple', 'Green', 'Colourless', 'B', 'Their thick peptidoglycan wall retains crystal violet.', 20, 'easy'),
  ('q-autoclave', 'The standard autoclave cycle is:', '100 °C for 10 minutes', '121 °C for 15 minutes', '160 °C for 2 hours', '70 °C for 30 minutes', 'B', '160 °C for 2 hours is dry-heat sterilisation.', 20, 'easy'),
  ('q-nti', 'Which drug has a narrow therapeutic index and needs level monitoring?', 'Digoxin', 'Paracetamol', 'Amoxicillin', 'Loratadine', 'A', null, 20, 'easy'),
  ('q-first-pass', 'Which route avoids hepatic first-pass metabolism?', 'Oral tablet', 'Sublingual', 'Oral suspension', 'Enteric-coated tablet', 'B', 'Sublingual absorption drains into the systemic veins, not the portal vein.', 20, 'easy'),
  ('q-pka', 'A weak acid is exactly 50% ionised when:', 'pH = pKa', 'pH = pKa + 1', 'pH = pKa − 1', 'pH = 7', 'A', 'From Henderson–Hasselbalch, log(ionised/unionised) = 0 when pH = pKa.', 25, 'medium'),
  ('q-ace-cough', 'The dry cough caused by ACE inhibitors is due to accumulation of:', 'Histamine', 'Bradykinin', 'Angiotensin II', 'Aldosterone', 'B', null, 20, 'medium'),
  ('q-beta2', 'Which is a selective β2 agonist?', 'Propranolol', 'Salbutamol', 'Atenolol', 'Phenylephrine', 'B', null, 20, 'easy'),
  ('q-grapefruit', 'Grapefruit juice raises levels of drugs metabolised mainly by:', 'CYP2D6', 'CYP3A4', 'CYP2C9', 'CYP1A2', 'B', null, 20, 'medium'),
  ('q-wernicke', 'Wernicke''s encephalopathy is caused by deficiency of:', 'Thiamine (B1)', 'Pyridoxine (B6)', 'Cyanocobalamin (B12)', 'Ascorbic acid (C)', 'A', null, 20, 'medium'),
  ('q-disintegrant', 'Which excipient acts as a tablet disintegrant?', 'Magnesium stearate', 'Croscarmellose sodium', 'Lactose', 'Talc', 'B', 'Magnesium stearate is a lubricant, lactose a diluent and talc a glidant.', 20, 'medium'),
  ('q-hlb', 'Emulsifiers for oil-in-water emulsions typically have an HLB of:', '1–3', '3–6', '8–18', '20–25', 'C', 'Low-HLB (3–6) emulsifiers favour water-in-oil.', 25, 'hard'),
  ('q-k', 'Clearance is 5 L/h and volume of distribution is 50 L. The elimination rate constant is:', '0.1 h⁻¹', '10 h⁻¹', '0.25 h⁻¹', '250 h⁻¹', 'A', 'k = CL / Vd = 5 / 50 = 0.1 h⁻¹.', 30, 'hard'),
  ('q-h2', 'Which drug is an H2-receptor antagonist?', 'Omeprazole', 'Famotidine', 'Loratadine', 'Sucralfate', 'B', null, 20, 'easy'),
  ('q-anaphylaxis', 'The first-line drug for anaphylaxis is:', 'Intramuscular adrenaline', 'Intravenous hydrocortisone', 'Oral cetirizine', 'Inhaled salbutamol', 'A', null, 20, 'easy'),
  ('q-teratogen', 'Which drug is a potent teratogen, contraindicated in pregnancy?', 'Isotretinoin', 'Paracetamol', 'Folic acid', 'Methyldopa', 'A', null, 20, 'easy'),
  ('q-penicillin-ring', 'The ring essential to the activity of penicillins is the:', 'β-lactam ring', 'Steroid nucleus', 'Quinoline ring', 'Imidazole ring', 'A', null, 20, 'easy'),
  ('q-aspirin-chem', 'Aspirin is chemically:', 'Acetylsalicylic acid', 'Methyl salicylate', 'Salicylamide', 'Acetaminophen', 'A', null, 20, 'easy'),
  ('q-serotonin', 'Combined with an SSRI, which drug carries a risk of serotonin syndrome?', 'Tramadol', 'Paracetamol', 'Amoxicillin', 'Omeprazole', 'A', null, 20, 'medium'),
  ('q-organophosphate', 'Which drug is given with atropine in organophosphate poisoning?', 'Pralidoxime', 'Naloxone', 'Physostigmine', 'Dimercaprol', 'A', 'Pralidoxime reactivates acetylcholinesterase if given early.', 20, 'medium'),
  ('q-youngs', 'By Young''s rule, the dose for a 6-year-old when the adult dose is 300 mg is:', '50 mg', '100 mg', '150 mg', '200 mg', 'B', 'Age ÷ (age + 12) × adult dose = 6 ÷ 18 × 300 = 100 mg.', 30, 'medium'),
  ('q-ziehl', 'Which stain identifies Mycobacterium tuberculosis?', 'Gram stain', 'Ziehl–Neelsen stain', 'Giemsa stain', 'India ink', 'B', 'Mycobacteria are acid-fast.', 20, 'easy'),
  ('q-carbidopa', 'Carbidopa is given with levodopa to:', 'Inhibit peripheral dopa decarboxylase', 'Block dopamine receptors', 'Inhibit MAO-B in the brain', 'Increase renal excretion', 'A', 'More levodopa reaches the brain and peripheral side effects fall.', 25, 'medium'),
  ('q-metformin-ae', 'The rare but most serious adverse effect of metformin is:', 'Severe hypoglycaemia on its own', 'Lactic acidosis', 'Marked weight gain', 'Hyperkalaemia', 'B', null, 20, 'medium'),
  ('q-k-sparing', 'Which diuretic is potassium-sparing?', 'Furosemide', 'Hydrochlorothiazide', 'Spironolactone', 'Mannitol', 'C', null, 20, 'easy'),
  ('q-isotonic', 'Isotonic sodium chloride solution is:', '0.45% w/v', '0.9% w/v', '5% w/v', '9% w/v', 'B', null, 20, 'easy')
) as v(key, q, a, b, c, d, ans, expl, secs, diff)
on conflict (seed_key) do nothing;
