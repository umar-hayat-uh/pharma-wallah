// ============================================================
// PharmaWallah — Disk Diffusion Lab: configuration
// ============================================================
//
// Everything a teacher would want to change lives here: the organisms, the
// antibiotic panel, the interpretive criteria, and the Lab Guide's prose.
// Nothing in this file renders — see `engine.ts` for the model that consumes
// it and the components for the presentation.

import type {
  Antibiotic,
  GuideStep,
  InterpretationSystem,
  Organism,
} from "./types";

// ─── Plate geometry (millimetres) ───────────────────────────
// The whole simulation works in real millimetres and only converts to SVG
// units at the edge, so "24 mm apart" in the model means 24 mm on screen.

/** A standard 90 mm Petri dish. */
export const PLATE_DIAMETER_MM = 90;
export const PLATE_RADIUS_MM = PLATE_DIAMETER_MM / 2;
/** Paper disks are 6 mm across — a "no zone" result still reads 6 mm. */
export const DISK_DIAMETER_MM = 6;
/** Minimum centre-to-centre spacing so adjacent zones stay measurable. */
export const MIN_DISK_SPACING_MM = 24;
/** Disks must sit at least this far in from the rim. */
export const EDGE_MARGIN_MM = 15;
/** A 90 mm plate does not usefully hold more than this many disks. */
export const MAX_DISKS = 6;
/** Below this many disks the panel is too thin to interpret. */
export const MIN_DISKS = 4;

// ─── Antibiotic panel ───────────────────────────────────────

export const ANTIBIOTICS: Antibiotic[] = [
  {
    id: "AMP",
    name: "Ampicillin",
    diskContent: "10 µg",
    className: "Aminopenicillin",
    color: "#2563eb",
    mechanism: "Binds penicillin-binding proteins and blocks cell-wall cross-linking.",
    variability: 1.5,
  },
  {
    id: "CIP",
    name: "Ciprofloxacin",
    diskContent: "5 µg",
    className: "Fluoroquinolone",
    color: "#db2777",
    mechanism: "Inhibits DNA gyrase and topoisomerase IV, halting DNA replication.",
    variability: 1.5,
  },
  {
    id: "GEN",
    name: "Gentamicin",
    diskContent: "10 µg",
    className: "Aminoglycoside",
    color: "#16a34a",
    mechanism: "Binds the 30S ribosomal subunit; causes misreading and stops protein synthesis.",
    variability: 1,
  },
  {
    id: "CTX",
    name: "Cefotaxime",
    diskContent: "30 µg",
    className: "Third-generation cephalosporin",
    color: "#9333ea",
    mechanism: "Binds PBP3 and inhibits transpeptidation; stable to many beta-lactamases.",
    variability: 1.5,
  },
  {
    id: "TET",
    name: "Tetracycline",
    diskContent: "30 µg",
    className: "Tetracycline",
    color: "#ea580c",
    mechanism: "Reversibly binds the 30S subunit and blocks aminoacyl-tRNA docking.",
    variability: 2,
  },
  {
    id: "ERY",
    name: "Erythromycin",
    diskContent: "15 µg",
    className: "Macrolide",
    color: "#dc2626",
    mechanism: "Binds the 50S subunit and blocks translocation of the growing peptide.",
    variability: 2,
  },
  {
    id: "VAN",
    name: "Vancomycin",
    diskContent: "30 µg",
    className: "Glycopeptide",
    color: "#0891b2",
    mechanism: "Binds the D-Ala-D-Ala terminus of peptidoglycan precursors.",
    variability: 1,
  },
];

export const ANTIBIOTIC_BY_ID: Record<string, Antibiotic> = Object.fromEntries(
  ANTIBIOTICS.map((a) => [a.id, a]),
);

// ─── Organisms ──────────────────────────────────────────────
//
// `baseZones` are teaching values chosen so that each organism demonstrates a
// different lesson (intrinsic resistance, acquired resistance, a fully
// susceptible isolate). They are not measurements from a validated panel, and
// the interface says so wherever a result is shown.

export const ORGANISMS: Organism[] = [
  {
    id: "ecoli",
    name: "Escherichia coli",
    short: "E. coli",
    strain: "ATCC 25922",
    gram: "negative",
    group: "enterobacterales",
    morphology: "Gram-negative rod; motile, non-spore-forming, facultative anaerobe",
    lawnColor: "#cbe7c8",
    color: "#dc2626",
    clinicalNote:
      "The commonest cause of urinary tract infection. Ampicillin resistance is widespread, so an empirical choice needs confirming.",
    caseStudy:
      "45-year-old woman, three days of dysuria, frequency and left flank pain. Temperature 38.4 °C. Urinalysis shows pyuria and nitrites; culture grows lactose-fermenting colonies on MacConkey agar.",
    baseZones: { AMP: 12, CIP: 28, GEN: 21, CTX: 29, TET: 16, ERY: 8, VAN: 0 },
  },
  {
    id: "saureus",
    name: "Staphylococcus aureus",
    short: "S. aureus",
    strain: "ATCC 25923",
    gram: "positive",
    group: "staphylococcus",
    morphology: "Gram-positive cocci in grape-like clusters; catalase and coagulase positive",
    lawnColor: "#f3ecc6",
    color: "#d97706",
    clinicalNote:
      "Leading cause of skin, soft-tissue and endovascular infection. Methicillin resistance changes the whole treatment plan.",
    caseStudy:
      "28-year-old man with a painful fluctuant abscess on the left forearm after minor trauma. Aspirate shows Gram-positive cocci in clusters; beta-haemolytic, catalase and coagulase positive.",
    baseZones: { AMP: 26, CIP: 22, GEN: 19, CTX: 31, TET: 24, ERY: 26, VAN: 17 },
  },
  {
    id: "paeruginosa",
    name: "Pseudomonas aeruginosa",
    short: "P. aeruginosa",
    strain: "ATCC 27853",
    gram: "negative",
    group: "pseudomonas",
    morphology: "Gram-negative rod; motile non-fermenter, produces pyocyanin",
    lawnColor: "#bfe3dd",
    color: "#0d9488",
    clinicalNote:
      "Intrinsically resistant to many agents through efflux and a low-permeability outer membrane. A common ICU, burns and cystic-fibrosis pathogen.",
    caseStudy:
      "67-year-old man with COPD, ventilated for five days. Fever 39 °C and green purulent secretions. Bronchoalveolar lavage grows an oxidase-positive non-fermenter with a grape-like odour.",
    baseZones: { AMP: 0, CIP: 28, GEN: 17, CTX: 14, TET: 0, ERY: 0, VAN: 0 },
  },
  {
    id: "kpneumoniae",
    name: "Klebsiella pneumoniae",
    short: "K. pneumoniae",
    strain: "ATCC 700603",
    gram: "negative",
    group: "enterobacterales",
    morphology: "Gram-negative rod; encapsulated, non-motile, mucoid colonies",
    lawnColor: "#d9d2ea",
    color: "#7c3aed",
    clinicalNote:
      "Intrinsically ampicillin-resistant. This reference strain produces an extended-spectrum beta-lactamase, which flattens the cephalosporin zones.",
    caseStudy:
      "71-year-old man, hospital-acquired pneumonia on day 9 of admission. Sputum grows mucoid, non-motile Gram-negative rods; the laboratory flags a possible ESBL producer.",
    baseZones: { AMP: 0, CIP: 24, GEN: 18, CTX: 12, TET: 15, ERY: 6, VAN: 0 },
  },
  {
    id: "spyogenes",
    name: "Streptococcus pyogenes",
    short: "S. pyogenes",
    strain: "ATCC 19615",
    gram: "positive",
    group: "streptococcus",
    morphology: "Gram-positive cocci in chains; beta-haemolytic, Lancefield group A",
    lawnColor: "#f0d7e0",
    color: "#be123c",
    clinicalNote:
      "Still uniformly susceptible to penicillin, so susceptibility testing is usually reserved for patients with a penicillin allergy.",
    caseStudy:
      "9-year-old girl with sore throat, fever and tender cervical nodes; no cough. Throat swab grows beta-haemolytic colonies inhibited by a bacitracin disk.",
    baseZones: { AMP: 28, CIP: 19, GEN: 14, CTX: 32, TET: 20, ERY: 25, VAN: 18 },
  },
  {
    id: "efaecalis",
    name: "Enterococcus faecalis",
    short: "E. faecalis",
    strain: "ATCC 29212",
    gram: "positive",
    group: "enterococcus",
    morphology: "Gram-positive cocci in pairs and short chains",
    lawnColor: "#cfe4ea",
    color: "#0369a1",
    clinicalNote:
      "Intrinsically resistant to cephalosporins and to aminoglycosides at standard disk contents — a zone there does not mean the drug will work alone.",
    caseStudy:
      "63-year-old man with an indwelling catheter and relapsing urinary infection. Culture grows Gram-positive cocci in pairs, growing in bile-aesculin and 6.5% NaCl.",
    baseZones: { AMP: 22, CIP: 16, GEN: 10, CTX: 0, TET: 16, ERY: 18, VAN: 18 },
  },
];

export const ORGANISM_BY_ID: Record<string, Organism> = Object.fromEntries(
  ORGANISMS.map((o) => [o.id, o]),
);

// ─── Interpretive criteria ──────────────────────────────────
//
// IMPORTANT, and stated to the student as well as here: a zone diameter only
// becomes S / I / R through a standard, and that standard is specific to the
// organism, the antimicrobial, the disk content and the test conditions. Both
// sets below are TEACHING sets shipped with the simulation so the workflow can
// be practised. They are configuration, not clinical authority — replace them
// with the criteria in force before using any of this for a real isolate.
//
// The two systems share thresholds on purpose. What differs is the reporting
// vocabulary, which is the thing students most often get wrong: the middle
// category means "may work with adjusted dosing or at a site where the drug
// concentrates", not "half-effective".

const TEACHING_CRITERIA: InterpretationSystem["criteria"] = {
  AMP: {
    enterobacterales: { susceptible: 17, resistant: 13 },
    enterococcus: { susceptible: 17, resistant: 16 },
  },
  CIP: {
    enterobacterales: { susceptible: 21, resistant: 15 },
    pseudomonas: { susceptible: 21, resistant: 15 },
    staphylococcus: { susceptible: 21, resistant: 15 },
  },
  GEN: {
    enterobacterales: { susceptible: 15, resistant: 12 },
    pseudomonas: { susceptible: 15, resistant: 12 },
    staphylococcus: { susceptible: 15, resistant: 12 },
  },
  CTX: {
    enterobacterales: { susceptible: 26, resistant: 22 },
  },
  TET: {
    enterobacterales: { susceptible: 15, resistant: 11 },
    staphylococcus: { susceptible: 19, resistant: 14 },
    streptococcus: { susceptible: 23, resistant: 18 },
  },
  ERY: {
    staphylococcus: { susceptible: 23, resistant: 13 },
    streptococcus: { susceptible: 21, resistant: 15 },
    enterococcus: { susceptible: 23, resistant: 13 },
  },
  VAN: {
    staphylococcus: { susceptible: 15, resistant: 14 },
    streptococcus: { susceptible: 17, resistant: 16 },
    enterococcus: { susceptible: 17, resistant: 14 },
  },
};

export const INTERPRETATION_SYSTEMS: InterpretationSystem[] = [
  {
    id: "teaching-sir",
    label: "Teaching set — S / I / R",
    shortLabel: "S / I / R",
    sourceNote:
      "Teaching criteria shipped with this simulation. Real interpretation depends on the standard in force (for example CLSI M100 or EUCAST), the organism, the antimicrobial agent, the disk content and the testing conditions — always read against the current table for the isolate in front of you.",
    categoryLabels: {
      S: "Susceptible",
      I: "Intermediate",
      R: "Resistant",
    },
    criteria: TEACHING_CRITERIA,
  },
  {
    id: "teaching-increased-exposure",
    label: "Teaching set — increased-exposure wording",
    shortLabel: "S / I(↑) / R",
    sourceNote:
      "The same teaching thresholds, reported with the newer vocabulary in which the middle category means the isolate may be treatable when exposure to the drug is increased — a higher dose, or a site where the agent concentrates. Changing the wording does not change the measurement; both remain teaching criteria, not a clinical standard.",
    categoryLabels: {
      S: "Susceptible, standard dosing",
      I: "Susceptible, increased exposure",
      R: "Resistant",
    },
    criteria: TEACHING_CRITERIA,
  },
];

export const DEFAULT_INTERPRETATION_SYSTEM_ID = INTERPRETATION_SYSTEMS[0].id;

// ─── Lab Guide — the illustrated walk-through ───────────────

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: "inoculum",
    title: "Prepare the bacterial inoculum",
    summary:
      "Pick three to five well-isolated colonies of the same morphology and suspend them in sterile saline or broth.",
    body: [
      "Start from a pure, fresh culture — 18 to 24 hours old. Touching several colonies of the same appearance keeps the suspension representative of the isolate rather than of one lucky colony.",
      "Sterilise the loop or use a sterile swab, lift the colony material, and emulsify it against the wall of the tube so no clumps remain. A lumpy suspension seeds the plate unevenly and the lawn shows it.",
    ],
    practicalNote:
      "Work from a pure culture. A mixed suspension produces a mixed lawn, and no zone measured on it means anything.",
    illustrationAlt:
      "A culture plate with isolated colonies, a sterile loop transferring colony material into a tube of clear saline, and the same tube afterwards holding a faintly cloudy suspension.",
    stage: "inoculum",
  },
  {
    id: "media",
    title: "Prepare the Mueller-Hinton agar plate",
    summary:
      "Pour Mueller-Hinton agar to an even 4 mm depth and let the surface dry before use.",
    body: [
      "Mueller-Hinton agar is the medium of choice for this test because it is low in inhibitors of sulphonamides and trimethoprim, supports good growth of most non-fastidious pathogens, and — importantly — behaves reproducibly between batches, so zones can be compared to a table at all.",
      "Depth matters because the antibiotic diffuses in three dimensions. Agar that is too thin lets the drug spread further sideways and reads falsely susceptible; agar that is too thick does the opposite.",
    ],
    practicalNote:
      "The surface must be dry before inoculation. Free moisture spreads the inoculum outwards and blurs the zone edge.",
    illustrationAlt:
      "A cross-section of a Petri dish showing an even layer of Mueller-Hinton agar measured at 4 mm, beside a top view of a smooth, dry plate surface.",
    stage: "plate-preparation",
  },
  {
    id: "turbidity",
    title: "Standardise the inoculum density",
    summary:
      "Adjust the suspension against a turbidity standard before swabbing — this is the single most common source of error.",
    body: [
      "Compare the suspension with the standard against a card with sharp black lines, in good light. If it is too light, add more colony material; if it is too heavy, dilute it with sterile diluent.",
      "Inoculum density changes the answer. A heavy inoculum puts more organisms in the path of the diffusing drug, so growth reaches closer to the disk and the measured zone shrinks. A light inoculum does the reverse and can make a resistant isolate look susceptible.",
    ],
    practicalNote:
      "Swab the plate within about 15 minutes of standardising. The suspension keeps growing while it sits on the bench.",
    illustrationAlt:
      "Three tubes side by side against a lined card: a nearly clear tube labelled too light, a correctly matched tube labelled standard, and a milky tube labelled too heavy.",
    stage: "inoculum",
  },
  {
    id: "inoculation",
    title: "Inoculate the agar surface",
    summary:
      "Streak the whole surface in three directions, rotating the plate 60° between passes, then run the swab round the rim.",
    body: [
      "Dip the sterile swab, press out the excess against the inside of the tube so it is not dripping, and draw it evenly across the plate. Turn the plate 60° and repeat, then 60° again — the three passes at different angles are what turn separate streaks into one continuous lawn.",
      "Finish by running the swab around the inside edge of the plate to pick up the margin, which the straight passes miss.",
    ],
    practicalNote:
      "The aim is a confluent lawn, not colonies. If individual colonies are visible after incubation the zone edge cannot be read reliably and the test should be repeated.",
    illustrationAlt:
      "A plate shown three times, each with streaks in a different orientation, and a fourth plate showing the combined even lawn with a rim pass.",
    stage: "inoculation",
  },
  {
    id: "disks",
    title: "Apply the antibiotic disks",
    summary:
      "Place the disks flat on the dried lawn, well spaced and away from the rim, and press each one down gently.",
    body: [
      "Use a dispenser or sterile forceps. Every disk must make complete contact with the agar, because diffusion starts at the moment the moisture from the agar wets the paper. A disk lying on a bubble or tilted at the edge releases its drug unevenly.",
      "Once a disk touches the surface it cannot be moved. The drug begins diffusing immediately, so lifting and repositioning leaves a partial zone behind at the first site.",
    ],
    practicalNote:
      "Keep disks at least 24 mm apart centre to centre and at least 15 mm in from the rim, so neighbouring zones stay separate and measurable.",
    illustrationAlt:
      "A plate bearing a bacterial lawn with four evenly spaced labelled antibiotic disks, a pair of forceps placing a fifth, and a dashed guide marking the minimum spacing.",
    stage: "disk-placement",
  },
  {
    id: "incubation",
    title: "Incubate",
    summary:
      "Invert the plate and incubate in air at 35 ± 2 °C for 16 to 18 hours.",
    body: [
      "Inverting keeps condensation from dropping onto the agar and smearing the lawn. Plates go into the incubator within 15 minutes of the disks being applied, so that diffusion and growth start together.",
      "Reading a plate early can exaggerate a zone, because the lawn has not yet grown in fully. Reading it very late can shrink one, as slow-growing resistant subpopulations fill in.",
    ],
    practicalNote:
      "Standard testing is in air, not in a CO₂ incubator — added CO₂ lowers the agar pH and shifts the zones for several drug classes.",
    illustrationAlt:
      "An incubator set to 35 degrees Celsius with an inverted stack of plates on the shelf and a timer showing an 18-hour cycle.",
    stage: "incubation",
  },
  {
    id: "zones",
    title: "Observe the zones of inhibition",
    summary:
      "Look for circular clear areas around the disks, against an even background of confluent growth.",
    body: [
      "Each disk sets up a concentration gradient: the drug is most concentrated at the paper and falls away with distance. Wherever the concentration is still high enough to inhibit that organism, no growth appears — the edge of the clear area is the point at which the two curves cross.",
      "Zone size is therefore not a direct measure of potency. It reflects the drug's diffusion through agar and the organism's susceptibility together, which is exactly why zone diameters can only be read against criteria built for that drug and organism.",
    ],
    practicalNote:
      "Examine the plate by reflected light with the lid off, against a dark background. For a few organism and drug combinations the plate is read by transmitted light instead.",
    illustrationAlt:
      "A plate after incubation showing an even lawn, with a wide clear zone around one disk, a narrow zone around another, and growth reaching the edge of a third disk.",
    stage: "growth",
  },
  {
    id: "measure",
    title: "Measure the zone diameters",
    summary:
      "Measure the full diameter of each clear zone, in millimetres, through the centre of the disk.",
    body: [
      "Use a ruler or callipers and read to the nearest whole millimetre. The measurement includes the 6 mm disk, so a complete absence of inhibition is recorded as 6 mm, not as zero.",
      "Read the zone at the point where growth stops completely. Faint growth that only appears under magnification, and isolated colonies well inside an otherwise clear zone, are handled separately — the latter may mean a mixed culture or a resistant mutant.",
    ],
    practicalNote:
      "Measure across the widest part, through the disk centre. Measuring a radius and doubling it, or measuring off-centre, is the classic way to report a zone several millimetres wrong.",
    illustrationAlt:
      "A ruler laid across a zone of inhibition so that its scale passes through the centre of the antibiotic disk, with the measurement read at both edges of the clear area.",
    stage: "measurement",
  },
  {
    id: "interpret",
    title: "Interpret and report",
    summary:
      "Convert each diameter to a category using the criteria in force for that organism and agent.",
    body: [
      "Look the measured diameter up in the table for the organism group and the antimicrobial at that disk content. The result is a category, and the category is what gets reported — not the millimetres alone.",
      "Some organism and drug combinations have no zone-diameter criteria at all. That is a genuine answer: it means disk diffusion cannot be interpreted for that pair, and a different method is needed.",
    ],
    practicalNote:
      "Never report a zone against a table built for a different organism or a different disk content. The thresholds in this simulation are configurable teaching values, shown so you can see how the lookup works.",
    illustrationAlt:
      "A results table listing each antibiotic with its measured diameter, the threshold applied, and the resulting category.",
    stage: "results",
  },
];

// ─── Pre-lab knowledge check (kept from the original lab) ────

export interface PreLabQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const PRE_LAB_QUESTIONS: PreLabQuestion[] = [
  {
    id: "q-medium",
    question: "Which medium is used for standard disk diffusion susceptibility testing?",
    options: ["Blood agar", "MacConkey agar", "Mueller-Hinton agar", "Sabouraud dextrose agar"],
    correctIndex: 2,
    explanation:
      "Mueller-Hinton agar is low in inhibitors of sulphonamides and trimethoprim, supports most non-fastidious pathogens, and behaves reproducibly batch to batch — which is what makes zone diameters comparable to a table.",
  },
  {
    id: "q-inoculum",
    question: "A suspension swabbed onto the plate is much heavier than the turbidity standard. What happens to the zones?",
    options: [
      "They get larger",
      "They get smaller",
      "They are unchanged — density does not matter",
      "They disappear entirely",
    ],
    correctIndex: 1,
    explanation:
      "More organisms in the path of the diffusing drug means growth reaches closer to the disk, so the apparent zone shrinks. A heavy inoculum can make a susceptible isolate read as resistant.",
  },
  {
    id: "q-spacing",
    question: "Why are the disks kept at least 24 mm apart, centre to centre?",
    options: [
      "To fit more disks on one plate",
      "To slow the rate of diffusion",
      "So that neighbouring zones do not overlap and stay measurable",
      "To keep the agar at an even temperature",
    ],
    correctIndex: 2,
    explanation:
      "Overlapping zones have no readable edge. Spacing keeps each zone a complete circle that can be measured through the centre of its own disk.",
  },
  {
    id: "q-measure",
    question: "There is no inhibition at all around a disk. What diameter is recorded?",
    options: ["0 mm", "6 mm — the diameter of the disk", "Not recorded", "The plate diameter"],
    correctIndex: 1,
    explanation:
      "The measurement always includes the 6 mm paper disk, so complete absence of inhibition is recorded as 6 mm.",
  },
];
