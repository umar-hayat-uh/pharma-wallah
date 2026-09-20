// ============================================================
// Community Pharmacy Simulation — the cases
// ============================================================
//
// Ten templates across six tiers. A case is written by choosing a patient, a
// prescription (or a complaint) and the problems that are genuinely in it —
// never by inventing drug facts, which live in `medicines.ts`, or new kinds of
// check, which live in `constants.ts`.
//
// `findings` is the answer key. The student never sees it until they have
// recorded their own verdict on the matching check: finding the problem is the
// exercise, so anything that leaks it early destroys the case.
//
// Every `concernId` must exist in that check's `concerns` list in
// `constants.ts`. `scripts/pharmacy-counter.test.mts` asserts that for all of
// them, because a typo here would make a finding permanently unfindable.

import type { ScenarioTemplate } from "../types";

const SCENARIOS: ScenarioTemplate[] = [
  // ── Beginner ───────────────────────────────────────────────────────────────
  {
    id: "chest-infection",
    kind: "rx",
    tier: "beginner",
    title: "A straightforward course of antibiotics",
    brief: "A young adult with a chest infection. Work the counter from end to end.",
    patientId: "ayesha-siddiqui",
    prescription: {
      prescriber: { name: "Dr. S. Anwar", qualification: "MBBS, FCPS", registration: "PMC-41209", clinic: "Shifa Family Clinic, Gulberg" },
      handwritten: ["Amoxicillin 500 mg caps", "1 cap TDS × 7 days", "Qty: 21", "Dr. S. Anwar"],
      legibility: "clear",
      items: [
        {
          id: "item-1",
          written: "Amoxicillin 500 mg — 1 cap TDS × 7/7",
          medicineId: "amoxicillin-500",
          doseUnits: 1,
          frequencyCode: "TDS",
          route: "Oral",
          durationDays: 7,
          quantityWritten: 21,
        },
      ],
    },
    // Deliberately clean. A student who records a concern on every check to be
    // "safe" is over-calling, and the debrief says so — that is a real fault.
    findings: [],
    decoyMedicineIds: ["amoxicillin-250", "amoxicillin-susp", "cotrimoxazole-ds", "clarithromycin-500"],
    dialogue: [
      {
        id: "d1",
        question: "Can I stop these once I feel better? I usually feel fine after two or three days.",
        options: [
          {
            id: "a",
            text: "Yes, once the symptoms have gone the infection has cleared, so you can stop.",
            scores: { accuracy: 0, safety: 0, communication: 1, professionalism: 1, completeness: 0 },
            feedback: "Wrong and unsafe. Feeling better does not mean the bacteria are cleared; stopping early risks relapse and resistance.",
          },
          {
            id: "b",
            text: "No — please finish all seven days, even once you feel well. Stopping early lets the infection come back and encourages resistant bacteria. Come back if you are no better after two or three days.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Correct, gives the reason, and adds the safety net of when to come back.",
          },
          {
            id: "c",
            text: "You must complete the course. Those are the instructions.",
            scores: { accuracy: 2, safety: 2, communication: 0, professionalism: 1, completeness: 0 },
            feedback: "Accurate but delivered as an order with no explanation, which is what makes patients stop anyway.",
          },
        ],
      },
    ],
    expectedMinutes: 8,
  },
  {
    id: "dental-abscess",
    kind: "rx",
    tier: "beginner",
    title: "The quantity does not match the course",
    brief: "A dental abscess. Read what is written, then check that the numbers agree.",
    patientId: "imran-qureshi",
    prescription: {
      prescriber: { name: "Dr. F. Hameed", qualification: "BDS", registration: "PMDC-D-8871", clinic: "Smile Dental Surgery, Model Town" },
      handwritten: ["Metronidazole 400mg", "1 tab TDS x 5 days", "Qty: 21 tabs", "Dr. F. Hameed"],
      legibility: "rushed",
      items: [
        {
          id: "item-1",
          written: "Metronidazole 400 mg — 1 tab TDS × 5/7",
          medicineId: "metronidazole-400",
          doseUnits: 1,
          frequencyCode: "TDS",
          route: "Oral",
          durationDays: 5,
          quantityWritten: 21,
        },
      ],
    },
    findings: [
      {
        id: "f-qty",
        checkId: "duration",
        concernId: "quantity-mismatch",
        itemId: "item-1",
        severity: "review",
        title: "Quantity written does not match the course",
        detail:
          "One tablet three times a day for five days needs 15 tablets. The prescription says 21 — the size of a full pack, not the course.",
        action: "Confirm with the prescriber whether the course is 5 days (supply 15) or 7 days (supply 21), and supply accordingly.",
        learningPoint:
          "Dose × frequency × days must equal the quantity. A quantity that happens to equal a pack size is the classic sign that the pack, not the course, was written down.",
        blocksDispensing: false,
      },
    ],
    decoyMedicineIds: ["amoxicillin-500", "doxycycline-100", "clarithromycin-500"],
    dialogue: [
      {
        id: "d1",
        question: "My cousin's wedding is on Saturday. Can I have a drink or two while I am on these?",
        options: [
          {
            id: "a",
            text: "One or two will not hurt.",
            scores: { accuracy: 0, safety: 0, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "Unsafe. Metronidazole with alcohol can cause flushing, vomiting and palpitations.",
          },
          {
            id: "b",
            text: "No alcohol at all during the course and for 48 hours after the last tablet — together they can cause severe flushing, vomiting and a racing heart. If the wedding falls inside that window, it is worth planning around.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Correct, explains why, and acknowledges the patient's actual situation.",
          },
          {
            id: "c",
            text: "Alcohol is forbidden with all antibiotics.",
            scores: { accuracy: 0, safety: 1, communication: 1, professionalism: 1, completeness: 0 },
            feedback: "Over-generalised. It is specifically metronidazole; saying it of all antibiotics teaches the patient to ignore you next time.",
          },
        ],
      },
    ],
    expectedMinutes: 9,
  },
  // ── Intermediate ───────────────────────────────────────────────────────────
  {
    id: "nitrate-pde5",
    kind: "rx",
    tier: "intermediate",
    title: "A new angina medicine",
    brief: "A cardiologist has added a preventive medicine. Read the whole medication list.",
    patientId: "rashid-mehmood",
    prescription: {
      prescriber: { name: "Dr. R. Patel", qualification: "MBBS, FCPS (Cardiology)", registration: "PMC-30442", clinic: "National Institute of Cardiology" },
      handwritten: ["Imdur (ISMN) 30 mg", "1 tab OD", "Qty: 28", "Dr. R. Patel"],
      legibility: "clear",
      items: [
        {
          id: "item-1",
          written: "Isosorbide mononitrate 30 mg — 1 tab OD × 28/7",
          medicineId: "isosorbide-mono-30",
          doseUnits: 1,
          frequencyCode: "OD",
          route: "Oral",
          durationDays: 28,
          quantityWritten: 28,
        },
      ],
    },
    findings: [
      {
        id: "f-nitrate-pde5",
        checkId: "interaction",
        concernId: "major-ddi",
        itemId: "item-1",
        severity: "critical",
        title: "Nitrate with a PDE5 inhibitor",
        detail:
          "The patient takes sildenafil as needed. Adding an organic nitrate produces synergistic vasodilation — profound hypotension, syncope, myocardial infarction or death.",
        action:
          "Do not supply. Contact the cardiologist. The patient must also be told explicitly never to take sildenafil while on a nitrate, including anything bought privately.",
        learningPoint:
          "Nitrate plus PDE5 inhibitor is an absolute contraindication, not a monitorable interaction. It is missed when the 'as needed' and privately bought medicines are not read as part of the list.",
        blocksDispensing: true,
      },
    ],
    decoyMedicineIds: ["amlodipine-5", "atorvastatin-40", "aspirin-75", "lisinopril-10"],
    dialogue: [
      {
        id: "d1",
        question: "The doctor said this stops chest pain. Should I take it when the pain starts?",
        options: [
          {
            id: "a",
            text: "Yes, take one as soon as the pain begins.",
            scores: { accuracy: 0, safety: 0, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "Wrong. This is a long-acting preventer, not a reliever — it will not help an attack in progress.",
          },
          {
            id: "b",
            text: "No — this one is taken every morning to prevent attacks. It works slowly, so it will not help once the pain has started. Your short-acting spray or tablet is what you use for an attack.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Correct, and it distinguishes preventer from reliever, which is the confusion behind the question.",
          },
          {
            id: "c",
            text: "Just follow the label.",
            scores: { accuracy: 0, safety: 0, communication: 0, professionalism: 0, completeness: 0 },
            feedback: "A dismissal, not counselling. The patient has told you they hold a dangerous misunderstanding.",
          },
        ],
      },
    ],
    expectedMinutes: 11,
  },
  {
    id: "statin-macrolide",
    kind: "rx",
    tier: "intermediate",
    title: "An antibiotic on top of a statin",
    brief: "A chest infection in a patient already on regular medicines.",
    patientId: "nadia-farooq",
    prescription: {
      prescriber: { name: "Dr. A. Kamal", qualification: "MBBS", registration: "PMC-52117", clinic: "Ittefaq General Practice" },
      handwritten: ["T. Klaricid 500mg", "1 BD x 7 days", "Qty 14", "Dr. A. Kamal"],
      legibility: "rushed",
      items: [
        {
          id: "item-1",
          written: "Clarithromycin 500 mg — 1 tab BD × 7/7",
          medicineId: "clarithromycin-500",
          doseUnits: 1,
          frequencyCode: "BD",
          route: "Oral",
          durationDays: 7,
          quantityWritten: 14,
        },
      ],
    },
    findings: [
      {
        id: "f-statin",
        checkId: "interaction",
        concernId: "major-ddi",
        itemId: "item-1",
        severity: "caution",
        title: "Clarithromycin raises atorvastatin exposure",
        detail:
          "Clarithromycin is a potent CYP3A4 inhibitor and atorvastatin is a CYP3A4 substrate. Concurrent use raises statin concentrations and the risk of myopathy and rhabdomyolysis.",
        action:
          "Discuss with the prescriber: the usual options are to withhold the statin for the seven days of the course, or to use a non-interacting antibiotic. Counsel the patient to report muscle pain, tenderness or dark urine.",
        learningPoint:
          "A short antibiotic course is where chronic-medicine interactions surface. The statin is the medicine that moves, even though the antibiotic is the new item.",
        blocksDispensing: false,
      },
    ],
    decoyMedicineIds: ["amoxicillin-500", "doxycycline-100", "atorvastatin-40", "metformin-500"],
    dialogue: [
      {
        id: "d1",
        question: "I have been having aches in my legs this week. Is that from my cholesterol tablet?",
        options: [
          {
            id: "a",
            text: "Muscle aches are very common with statins, so do not worry about it.",
            scores: { accuracy: 1, safety: 0, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "Dismisses the one symptom that matters most here, in the very week an interacting antibiotic is starting.",
          },
          {
            id: "b",
            text: "It can be. That matters especially now, because this antibiotic raises the level of your cholesterol tablet. Please tell me if the ache worsens, spreads, or comes with dark urine or fever — and I want to speak to your doctor about your statin before you start this.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Links the symptom to the interaction, names the red flags, and commits to an action.",
          },
          {
            id: "c",
            text: "Stop your cholesterol tablet immediately and do not take it again.",
            scores: { accuracy: 1, safety: 1, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "Stopping may well be right for the week of the course — but that is the prescriber's decision to confirm, not a unilateral instruction at the counter.",
          },
        ],
      },
    ],
    expectedMinutes: 11,
  },
  // ── Advanced ───────────────────────────────────────────────────────────────
  {
    id: "sulfa-allergy",
    kind: "rx",
    tier: "advanced",
    title: "A urinary infection, and an allergy card",
    brief: "Read the allergy record before you read anything else. Look-alike packs are on the shelf.",
    patientId: "daud-miraj",
    prescription: {
      prescriber: { name: "Dr. A. Toor", qualification: "MBBS", registration: "PMC-27884", clinic: "Al-Noor Clinic, Johar Town" },
      handwritten: ["Septran DS", "1 tab BD x 7 days", "Qty: 14", "Dr. A. Toor"],
      legibility: "rushed",
      items: [
        {
          id: "item-1",
          written: "Co-trimoxazole 800/160 mg — 1 tab BD × 7/7",
          medicineId: "cotrimoxazole-ds",
          doseUnits: 1,
          frequencyCode: "BD",
          route: "Oral",
          durationDays: 7,
          quantityWritten: 14,
        },
      ],
    },
    findings: [
      {
        id: "f-sulfa",
        checkId: "allergy",
        concernId: "documented-allergy",
        itemId: "item-1",
        severity: "critical",
        title: "Documented sulfonamide allergy",
        detail:
          "The patient has a recorded severe reaction to sulfonamides — rash with facial swelling in 2019. Co-trimoxazole contains sulfamethoxazole, a sulfonamide.",
        action:
          "Do not supply. Contact the prescriber for an alternative such as nitrofurantoin or fosfomycin, and confirm the allergy is on the clinic's record as well as the pharmacy's.",
        learningPoint:
          "The brand name carries no warning — 'Septran' does not contain the word sulfa. The allergy check has to be run on drug class, which is why it is the first check and not an afterthought.",
        blocksDispensing: true,
      },
      {
        id: "f-ace-k",
        checkId: "interaction",
        concernId: "moderate-ddi",
        itemId: "item-1",
        severity: "caution",
        title: "Co-trimoxazole with an ACE inhibitor",
        detail:
          "Trimethoprim is structurally related to amiloride and reduces potassium excretion. With lisinopril, and in a diabetic patient, the risk of significant hyperkalaemia rises.",
        action: "Flag to the prescriber with the allergy. If any sulfonamide-free alternative is chosen, this risk goes with it.",
        learningPoint:
          "A second, quieter problem often sits behind a dramatic one. Finding the allergy is not a reason to stop running the remaining checks.",
        blocksDispensing: false,
      },
    ],
    decoyMedicineIds: ["cotrimoxazole-ss", "amoxicillin-500", "doxycycline-100", "metronidazole-400", "omeprazole-20"],
    dialogue: [
      {
        id: "d1",
        question: "I have had a rash from a tablet years ago, but it was nothing serious. Can you just give me the medicine?",
        options: [
          {
            id: "a",
            text: "If it was only a rash, it should be fine — I will dispense it.",
            scores: { accuracy: 0, safety: 0, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "A recorded rash with facial swelling to the same class is exactly what precedes a severe reaction on re-exposure.",
          },
          {
            id: "b",
            text: "I am not able to give you this one — it is from the same family as the tablet that caused your rash, and a second reaction can be much more severe than the first. I will call the doctor now and get a different antibiotic for you today.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Refuses safely, explains the reason in the patient's terms, and takes responsibility for the next step.",
          },
          {
            id: "c",
            text: "I cannot dispense this. You will have to go back to the doctor.",
            scores: { accuracy: 2, safety: 2, communication: 0, professionalism: 1, completeness: 1 },
            feedback: "The decision is right, but sending an unwell patient away without making the call is poor practice.",
          },
        ],
      },
    ],
    expectedMinutes: 13,
  },
  {
    id: "paediatric-dose",
    kind: "rx",
    tier: "advanced",
    title: "A child's ear infection",
    brief: "A four-year-old, weighed at the clinic this morning. Check the dose yourself.",
    patientId: "hooriya-tariq",
    prescription: {
      prescriber: { name: "Dr. M. Zafar", qualification: "MBBS, FCPS (Paediatrics)", registration: "PMC-33901", clinic: "Children's Clinic, Faisal Town" },
      handwritten: ["Amoxil susp 125mg/5ml", "10 ml TDS x 7 days", "Qty: 1 bottle", "Wt 16 kg", "Dr. M. Zafar"],
      legibility: "clear",
      items: [
        {
          id: "item-1",
          written: "Amoxicillin 125 mg/5 mL — 10 mL TDS × 7/7",
          medicineId: "amoxicillin-susp",
          doseUnits: 10,
          frequencyCode: "TDS",
          route: "Oral",
          durationDays: 7,
          quantityWritten: 210,
          instructions: "Weight recorded as 16 kg",
        },
      ],
    },
    findings: [
      {
        id: "f-weight",
        checkId: "weight",
        concernId: "dose-mismatch-weight",
        itemId: "item-1",
        severity: "caution",
        title: "Dose above the weight-based range",
        detail:
          "10 mL of 125 mg/5 mL is 250 mg per dose. Three times a day is 750 mg/day, which for 16 kg is about 47 mg/kg/day — above the usual 20–40 mg/kg/day for this indication.",
        action:
          "Recalculate and confirm with the prescriber. 40 mg/kg/day for 16 kg is 640 mg/day, about 8.5 mL three times a day, or a 250 mg/5 mL strength at a smaller volume.",
        learningPoint:
          "A paediatric dose is verified by recalculating it from the weight, never by recognising the volume as a familiar-looking number. Checking against the child's age alone would have missed this.",
        blocksDispensing: false,
      },
    ],
    decoyMedicineIds: ["amoxicillin-500", "amoxicillin-250", "paracetamol-susp", "cotrimoxazole-ss"],
    dialogue: [
      {
        id: "d1",
        question: "She hates the taste. Can I mix the whole bottle into her milk so she finishes it?",
        options: [
          {
            id: "a",
            text: "Yes, mixing it into milk is the easiest way.",
            scores: { accuracy: 0, safety: 1, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "Mixing a whole bottle into a feed means an unknown dose — if she does not finish the milk, she does not get the medicine.",
          },
          {
            id: "b",
            text: "Please give each dose with the syringe so you know she has had all of it, then follow it with a drink she likes. If you mix it into a full bottle of milk and she leaves some, she gets less than her dose.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Solves the parent's real problem while protecting the accuracy of the dose.",
          },
          {
            id: "c",
            text: "No, never mix medicines with food or drink.",
            scores: { accuracy: 1, safety: 2, communication: 0, professionalism: 1, completeness: 0 },
            feedback: "Too absolute and unhelpful; the parent will do it anyway, having been told nothing useful.",
          },
        ],
      },
      {
        id: "d2",
        question: "She is due at her grandmother's for two days. Does it really need to stay in the fridge?",
        options: [
          {
            id: "a",
            text: "It is fine at room temperature for a few days.",
            scores: { accuracy: 0, safety: 1, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "Reconstituted amoxicillin suspension needs refrigeration; potency is not guaranteed otherwise.",
          },
          {
            id: "b",
            text: "Yes — once it is made up it needs to stay in the fridge, and it must be thrown away seven days after today. Take it in a cool bag and put it straight in her grandmother's fridge.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Correct, gives the discard date, and offers a practical way to comply.",
          },
        ],
      },
    ],
    expectedMinutes: 13,
  },
  // ── Clinical challenge ─────────────────────────────────────────────────────
  {
    id: "warfarin-multi",
    kind: "rx",
    tier: "clinical-challenge",
    title: "Two items, an anticoagulant and a kidney",
    brief: "An older patient on warfarin. More than one thing on this prescription needs you.",
    patientId: "ghulam-abbas",
    prescription: {
      prescriber: { name: "Dr. N. Bukhari", qualification: "MBBS", registration: "PMC-19073", clinic: "City Medical Centre" },
      handwritten: ["1) Septran DS 1 BD x 7d  Qty 14", "2) Brufen 400mg 1 TDS x 10d  Qty 30", "Dr. N. Bukhari"],
      legibility: "poor",
      items: [
        {
          id: "item-1",
          written: "Co-trimoxazole 800/160 mg — 1 tab BD × 7/7",
          medicineId: "cotrimoxazole-ds",
          doseUnits: 1,
          frequencyCode: "BD",
          route: "Oral",
          durationDays: 7,
          quantityWritten: 14,
        },
        {
          id: "item-2",
          written: "Ibuprofen 400 mg — 1 tab TDS × 10/7",
          medicineId: "ibuprofen-400",
          doseUnits: 1,
          frequencyCode: "TDS",
          route: "Oral",
          durationDays: 10,
          quantityWritten: 30,
        },
      ],
    },
    findings: [
      {
        id: "f-warf-cotrim",
        checkId: "interaction",
        concernId: "major-ddi",
        itemId: "item-1",
        severity: "critical",
        title: "Co-trimoxazole markedly potentiates warfarin",
        detail:
          "Sulfamethoxazole inhibits CYP2C9 and displaces warfarin from protein binding. INR can rise steeply within days, with serious bleeding risk.",
        action: "Contact the prescriber. If it must be used, the INR needs checking within a few days and the warfarin dose adjusting.",
        learningPoint: "Antibiotics are the commonest cause of a sudden INR rise. Every new course in an anticoagulated patient is an intervention.",
        blocksDispensing: true,
      },
      {
        id: "f-warf-nsaid",
        checkId: "interaction",
        concernId: "major-ddi",
        itemId: "item-2",
        severity: "critical",
        title: "NSAID with an anticoagulant",
        detail:
          "Ibuprofen adds antiplatelet effect and direct gastric mucosal damage to an already anticoagulated patient — a substantial gastrointestinal bleeding risk.",
        action:
          "Do not supply the ibuprofen. Contact the prescriber; paracetamol is already prescribed and is the appropriate analgesic here.",
        learningPoint: "Two mechanisms stacking — impaired clotting plus mucosal injury — is what makes this combination dangerous rather than merely additive.",
        blocksDispensing: true,
      },
      {
        id: "f-nsaid-ckd",
        checkId: "contraindication",
        concernId: "condition-contraindicated",
        itemId: "item-2",
        severity: "caution",
        title: "NSAID in stage 3 chronic kidney disease",
        detail: "An eGFR of 42 mL/min/1.73 m² with a regular NSAID risks further decline in renal function, especially with dehydration.",
        action: "Avoid the NSAID. Recommend paracetamol, already prescribed, and topical options for the knee.",
        learningPoint: "The condition list is part of the prescription. Reading only the drug list would have missed this entirely.",
        blocksDispensing: false,
      },
      {
        id: "f-cotrim-renal",
        checkId: "dose",
        concernId: "not-organ-adjusted",
        itemId: "item-1",
        severity: "review",
        title: "Co-trimoxazole dose not adjusted for renal function",
        detail: "Co-trimoxazole is renally cleared and a reduced dose is usual below an eGFR of about 30–50 mL/min/1.73 m².",
        action: "Raise with the prescriber together with the warfarin interaction; confirm the intended dose for this level of function.",
        learningPoint:
          "Renal dose adjustment is a routine check in older patients, not an exotic one. The creatinine clearance calculator on the workstation exists for this.",
        blocksDispensing: false,
      },
    ],
    decoyMedicineIds: ["cotrimoxazole-ss", "paracetamol-500", "aspirin-75", "omeprazole-20", "cocodamol-30-500"],
    dialogue: [
      {
        id: "d1",
        question: "My knee has been terrible. I took two of my wife's Brufen yesterday and it helped. Is that all right?",
        options: [
          {
            id: "a",
            text: "If it helped, there is no harm in continuing until your own supply arrives.",
            scores: { accuracy: 0, safety: 0, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "Actively dangerous — an NSAID on top of warfarin is the combination you are trying to prevent.",
          },
          {
            id: "b",
            text: "I am glad you told me. Please do not take any more — anti-inflammatories like Brufen and your warfarin together can cause serious bleeding in the stomach. I am going to speak to your doctor about the painkiller on this prescription for the same reason. In the meantime your paracetamol is safe, and I can suggest something to rub in.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Thanks the patient for disclosing, stops the harm, explains it, and offers a real alternative rather than only a refusal.",
          },
          {
            id: "c",
            text: "You should never take anyone else's medicine.",
            scores: { accuracy: 1, safety: 1, communication: 0, professionalism: 1, completeness: 0 },
            feedback: "True but scolding, and it answers none of the clinical question. The patient stops telling you things.",
          },
        ],
      },
    ],
    expectedMinutes: 16,
  },
  // ── OTC challenge ──────────────────────────────────────────────────────────
  {
    id: "hay-fever",
    kind: "otc",
    tier: "otc-challenge",
    title: "Something for hay fever",
    brief: "No prescription. Assess first, then decide whether this is yours to treat.",
    patientId: "sana-javed",
    findings: [],
    decoyMedicineIds: ["cetirizine-10", "chlorpheniramine-4", "paracetamol-500", "hydrocortisone-cream", "salbutamol-inhaler"],
    dialogue: [
      {
        id: "d1",
        question: "I drive to work every morning. Will this make me sleepy?",
        options: [
          {
            id: "a",
            text: "No, antihistamines do not cause drowsiness.",
            scores: { accuracy: 0, safety: 0, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "Untrue even of the newer ones, and the patient drives.",
          },
          {
            id: "b",
            text: "This one is much less likely to than the older kind, but it does affect some people. Try the first dose on a day you are not driving, and if it does make you drowsy, do not drive until you know how it affects you.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Honest about the residual risk and gives a practical way to test it safely.",
          },
          {
            id: "c",
            text: "It might. Read the leaflet.",
            scores: { accuracy: 1, safety: 1, communication: 0, professionalism: 0, completeness: 0 },
            feedback: "Passes a safety question straight back to the patient.",
          },
        ],
      },
    ],
    otc: {
      complaint: "Sneezing, itchy watery eyes and a runny nose for about ten days, worse outdoors.",
      wwham: [
        {
          field: "who",
          prompt: "Who is the medicine for?",
          options: [
            { id: "w1", text: "For myself.", correct: true },
            { id: "w2", text: "For my younger brother, he is six.", correct: false },
            { id: "w3", text: "For my mother, she is 70.", correct: false },
          ],
        },
        {
          field: "what",
          prompt: "What exactly are the symptoms?",
          options: [
            { id: "x1", text: "Sneezing, itchy watery eyes and a clear runny nose.", correct: true },
            { id: "x2", text: "Green nasal discharge with facial pain and fever.", correct: false },
            { id: "x3", text: "Blocked nose with a cough and wheeze at night.", correct: false },
          ],
        },
        {
          field: "howLong",
          prompt: "How long has this been going on?",
          options: [
            { id: "h1", text: "About ten days, since the weather changed.", correct: true },
            { id: "h2", text: "Since yesterday evening.", correct: false },
            { id: "h3", text: "Nearly four months without a break.", correct: false },
          ],
        },
        {
          field: "action",
          prompt: "What have you already tried?",
          options: [
            { id: "a1", text: "Nothing yet — I wanted to ask first.", correct: true },
            { id: "a2", text: "A week of steroid nasal spray with no effect at all.", correct: false },
            { id: "a3", text: "My friend's antibiotics for three days.", correct: false },
          ],
        },
        {
          field: "medication",
          prompt: "Are you taking any other medicines, and do you have any allergies?",
          options: [
            { id: "m1", text: "Nothing regular, and no allergies to medicines.", correct: true },
            { id: "m2", text: "I take a sedative at night for sleep.", correct: false },
            { id: "m3", text: "I am on tablets for epilepsy.", correct: false },
          ],
        },
      ],
      redFlagIds: [],
      correctOutcome: "self-care",
      appropriateMedicineIds: ["cetirizine-10"],
      rationale:
        "Classic seasonal allergic rhinitis in a healthy adult, no red flags, nothing tried yet. A non-sedating antihistamine is appropriate pharmacy supply. The older sedating antihistamine would also relieve the symptoms but is a poor choice for someone who drives to work each morning.",
    },
    expectedMinutes: 10,
  },
  {
    id: "infant-diarrhoea",
    kind: "otc",
    tier: "emergency-referral",
    title: "\"Something to stop it\" — a nine-month-old",
    brief: "A father asking for an anti-diarrhoeal for his baby. Assess before you reach for anything.",
    patientId: "bilal-ahmed",
    findings: [],
    decoyMedicineIds: ["loperamide-2", "ors-sachet", "paracetamol-susp", "metronidazole-400"],
    dialogue: [
      {
        id: "d1",
        question: "My neighbour gave her baby Imodium and it stopped straight away. Can I just have that?",
        options: [
          {
            id: "a",
            text: "Yes, one capsule should settle it.",
            scores: { accuracy: 0, safety: 0, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "Loperamide is not for infants. In a small child it risks ileus and masks worsening dehydration.",
          },
          {
            id: "b",
            text: "I cannot give that for a baby — it is not safe under twelve, and it only hides the problem rather than treating it. What worries me more is that he is drowsy with fewer wet nappies, which suggests he is getting dehydrated. He needs to be seen today. Start this rehydration solution now and keep breastfeeding on the way.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Refuses the unsafe request, names the real danger, and gives the father something useful to do immediately.",
          },
          {
            id: "c",
            text: "No, we do not sell that for babies.",
            scores: { accuracy: 1, safety: 1, communication: 0, professionalism: 1, completeness: 0 },
            feedback: "A correct refusal that leaves a dehydrating infant with no advice and no referral.",
          },
        ],
      },
    ],
    otc: {
      complaint: "Loose watery stools for three days in a nine-month-old, now drowsy with fewer wet nappies and some vomiting.",
      wwham: [
        {
          field: "who",
          prompt: "Who is the medicine for?",
          options: [
            { id: "w1", text: "My son — he is nine months old.", correct: true },
            { id: "w2", text: "For me.", correct: false },
            { id: "w3", text: "For my wife.", correct: false },
          ],
        },
        {
          field: "what",
          prompt: "What exactly is happening?",
          options: [
            { id: "x1", text: "Watery stools many times a day, he has vomited twice, and he is sleepy with far fewer wet nappies.", correct: true },
            { id: "x2", text: "One loose stool this morning, otherwise feeding and playing normally.", correct: false },
            { id: "x3", text: "Hard stools he is straining to pass.", correct: false },
          ],
        },
        {
          field: "howLong",
          prompt: "How long has it been going on?",
          options: [
            { id: "h1", text: "Three days, and worse today.", correct: true },
            { id: "h2", text: "A couple of hours.", correct: false },
            { id: "h3", text: "On and off for six months.", correct: false },
          ],
        },
        {
          field: "action",
          prompt: "What have you done so far?",
          options: [
            { id: "a1", text: "We stopped his feeds because we thought it would rest his stomach.", correct: true },
            { id: "a2", text: "We have been giving rehydration sachets regularly.", correct: false },
            { id: "a3", text: "He has been seen by a doctor already today.", correct: false },
          ],
        },
        {
          field: "medication",
          prompt: "Is he taking anything, and any allergies?",
          options: [
            { id: "m1", text: "Nothing at all, and no allergies.", correct: true },
            { id: "m2", text: "He is on antibiotics from last week.", correct: false },
            { id: "m3", text: "He takes a daily inhaler.", correct: false },
          ],
        },
      ],
      redFlagIds: ["dehydration", "persistent-vomiting", "treatment-failure"],
      correctOutcome: "refer",
      appropriateMedicineIds: ["ors-sachet"],
      rationale:
        "An infant with three days of diarrhoea, vomiting, drowsiness and reduced wet nappies is showing signs of dehydration and must be seen the same day. Loperamide is contraindicated under twelve. Oral rehydration solution should be started immediately and feeding resumed — withholding feeds is a common and harmful belief worth correcting at the counter.",
      referralReason: "Signs of dehydration in an infant with ongoing diarrhoea and vomiting — same-day medical assessment.",
    },
    expectedMinutes: 11,
  },
  {
    id: "chest-pain-antacid",
    kind: "otc",
    tier: "emergency-referral",
    title: "\"Just a strong antacid\"",
    brief: "A request for indigestion relief. Listen to the whole description before you sell anything.",
    patientId: "tanveer-shah",
    findings: [],
    decoyMedicineIds: ["omeprazole-20", "paracetamol-500", "aspirin-75", "ibuprofen-400"],
    dialogue: [
      {
        id: "d1",
        question: "Look, I have work to get to. Can you just give me something strong and I will see someone later in the week?",
        options: [
          {
            id: "a",
            text: "Of course — try this, and see a doctor if it does not settle.",
            scores: { accuracy: 0, safety: 0, communication: 1, professionalism: 0, completeness: 0 },
            feedback: "Selling an antacid to a man describing exertional chest tightness with sweating can cost him his life.",
          },
          {
            id: "b",
            text: "I am not going to sell you something for this, and I want to be straight with you about why. Chest tightness that comes on when you exert yourself, spreads to your jaw and makes you sweat can come from the heart, not the stomach. This needs to be looked at today, now rather than later in the week. Let me help you arrange it.",
            scores: { accuracy: 2, safety: 2, communication: 2, professionalism: 2, completeness: 2 },
            feedback: "Direct, explains the reasoning without alarming theatrics, and converts the refusal into help.",
          },
          {
            id: "c",
            text: "You are probably having a heart attack. I cannot help you.",
            scores: { accuracy: 1, safety: 1, communication: 0, professionalism: 0, completeness: 0 },
            feedback: "Frightening, over-claims a diagnosis you cannot make, and abandons him at the counter.",
          },
        ],
      },
    ],
    otc: {
      complaint: "Central chest tightness for a week, brought on by walking uphill, easing with rest; described as indigestion.",
      wwham: [
        {
          field: "who",
          prompt: "Who is it for?",
          options: [
            { id: "w1", text: "For me.", correct: true },
            { id: "w2", text: "For my son.", correct: false },
            { id: "w3", text: "For my father.", correct: false },
          ],
        },
        {
          field: "what",
          prompt: "Describe what you are feeling and exactly where.",
          options: [
            {
              id: "x1",
              text: "A tightness in the middle of my chest that spreads to my jaw and left arm. It comes on walking up the hill to work, and I sweat with it.",
              correct: true,
            },
            { id: "x2", text: "Burning behind the breastbone after a heavy meal, worse lying down at night.", correct: false },
            { id: "x3", text: "A sharp pain low down on the right side after eating fried food.", correct: false },
          ],
        },
        {
          field: "howLong",
          prompt: "How long has this been happening?",
          options: [
            { id: "h1", text: "About a week, and it is happening on shorter walks now.", correct: true },
            { id: "h2", text: "Only after last night's dinner.", correct: false },
            { id: "h3", text: "For years, unchanged.", correct: false },
          ],
        },
        {
          field: "action",
          prompt: "Have you tried anything for it?",
          options: [
            { id: "a1", text: "Antacids from the shop. They made no difference at all.", correct: true },
            { id: "a2", text: "Nothing, this is the first time.", correct: false },
            { id: "a3", text: "A course of omeprazole that fixed it completely.", correct: false },
          ],
        },
        {
          field: "medication",
          prompt: "What medicines do you take, and any conditions?",
          options: [
            { id: "m1", text: "Amlodipine for blood pressure. I gave up smoking three years ago.", correct: true },
            { id: "m2", text: "Nothing at all, and I have never had anything wrong with me.", correct: false },
            { id: "m3", text: "Only vitamins.", correct: false },
          ],
        },
      ],
      redFlagIds: ["chest-pain", "treatment-failure", "comorbidity"],
      correctOutcome: "refer",
      appropriateMedicineIds: [],
      rationale:
        "Exertional central chest tightness radiating to the jaw and arm, with sweating, worsening over a week, unrelieved by antacids, in a hypertensive ex-smoker. This is a cardiac presentation until proven otherwise and requires urgent same-day assessment — not a pharmacy sale. 'Indigestion' is how a great many cardiac presentations are described at the counter.",
      referralReason: "Exertional chest pain with radiation and sweating in a patient with cardiovascular risk factors — urgent same-day assessment.",
    },
    expectedMinutes: 10,
  },
];

export { SCENARIOS };

export function scenarioTemplate(id: string): ScenarioTemplate | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export const TIER_COPY: Record<string, { label: string; blurb: string }> = {
  beginner: { label: "Beginner", blurb: "A single item, the full workflow, nothing hidden in it." },
  intermediate: { label: "Intermediate", blurb: "One real interaction to find in the medication list." },
  advanced: { label: "Advanced", blurb: "Allergies, weight-based doses and look-alike packs." },
  "clinical-challenge": { label: "Clinical challenge", blurb: "Several problems at once on one prescription." },
  "otc-challenge": { label: "OTC challenge", blurb: "No prescription. Assess, then decide." },
  "emergency-referral": { label: "Emergency referral", blurb: "Something here belongs to a doctor, not a pharmacist." },
};
