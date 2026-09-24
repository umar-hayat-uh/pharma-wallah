/**
 * Search and review metadata for every page that does not set its own.
 *
 * WHY THIS EXISTS (2026-09-23): AdSense rejected the site for "low value
 * content". A crawl of the live site found 173 of 216 pages served the same
 * `<title>PharmaWallah</title>` and the four-word description "AI-powered
 * pharmacy platform" — including the home page and every calculator — because
 * nearly every page is a `"use client"` component and so cannot export
 * `metadata`. To a crawler, 173 distinct pages looked like one page repeated.
 *
 * Rather than wrap ~130 client pages in server shells, the root layout reads the
 * request path (set as `x-pathname` by middleware) and looks it up here. A page
 * or layout that exports its own metadata still wins: Next merges metadata
 * field by field, deepest segment last. Calculators get theirs from the tool
 * registry in `(tools)/layout.tsx`, so a new tool is described automatically.
 *
 * Titles carry the brand themselves (no `title.template`), because pages that
 * already set a title already end in "PharmaWallah" and a template would
 * double it.
 */

export const SITE_URL = "https://www.pharmawallah.com";
export const SITE_NAME = "PharmaWallah";

export const DEFAULT_TITLE = "PharmaWallah — Pharm-D study tools, calculators and lessons";
export const DEFAULT_DESCRIPTION =
  "Free study resources for Pharm-D students in Pakistan: over 100 pharmacy calculators with worked formulas, course lessons, MCQ practice, slide spotting and virtual lab simulations.";

export type PageMeta = {
  title: string;
  description: string;
  /** Keep out of search results (still followed for links). */
  noindex?: boolean;
  /** When the same content lives at another path, the path to canonicalise to. */
  canonicalPath?: string;
};

const brand = (t: string) => `${t} | ${SITE_NAME}`;

/* ── Pages with a fixed path ─────────────────────────────────────────────── */

const STATIC_META: Record<string, PageMeta> = {
  "/": { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },

  "/mcqs-bank": {
    title: brand("Pharmacy MCQ Bank — Pharm-D practice questions"),
    description:
      "Timed multiple-choice practice for Pharm-D subjects, with an explanation for every answer and a downloadable score report. Physical pharmacy, biochemistry, organic chemistry and physiology.",
  },
  "/flash-cards": {
    title: brand("Drug Flashcards — mechanisms, classes and side effects"),
    description:
      "Flip-card revision for pharmacology: drug classes, mechanisms of action, adverse effects, pharmacokinetics and pharmacodynamics, with a quiz mode to test yourself.",
  },
  "/spotting": {
    title: brand("Slide Spotting — histology and pathology lessons"),
    description:
      "Learn to identify microscope slides for Pharm-D spotting exams: annotated histology, pathology and powder microscopy lessons with identification points, and practice spot tests.",
  },
  "/spotting/histology/lessons": {
    title: brand("Histology Slide Lessons"),
    description:
      "Annotated histology lessons for Pharm-D spotting: each tissue's theory, points of identification and exam notes — lungs, stomach, kidney, intestine, muscle, blood and epithelia.",
  },
  "/spotting/histology/test": {
    title: brand("Histology Spotting Test"),
    description:
      "A timed histology spotting test: identify each slide and list its recognition points, then check your answers.",
  },
  "/spotting/pathology/lessons": {
    title: brand("Pathology Slide Lessons"),
    description:
      "Pathology spotting lessons for Pharm-D: the gross and microscopic features of fifteen common lesions, from acute appendicitis to carcinoma in situ.",
  },
  "/spotting/pathology/test": {
    title: brand("Pathology Spotting Test"),
    description:
      "Identify pathology slides, pin the diagnostic features and name the lesion — a practice test for the Pharm-D pathology practical.",
  },
  "/spotting/powder-microscopy/lessons": {
    title: brand("Powder Microscopy Lessons — crude drug identification"),
    description:
      "Pharmacognosy powder microscopy: the diagnostic microscopic characters of senna, nux vomica and digitalis powders.",
  },
  "/spotting/powder-microscopy/test": {
    title: brand("Powder Microscopy Test"),
    description: "The powder microscopy spotting test is being rebuilt with new slide photographs.",
    noindex: true,
  },

  "/simulations/titration": {
    title: brand("Acid–Base Titration Simulation"),
    description:
      "Acid–base titration explained and simulated: the theory of standard solutions and end points, then a virtual titration to find an unknown concentration.",
  },
  "/simulations/buffer-lab": {
    title: brand("Buffer Preparation Lab"),
    description:
      "How buffers resist pH change and why they matter in pharmacy — eye drops, IV fluids, drug stability — with the Henderson–Hasselbalch equation, a quiz and a buffer simulation.",
  },
  "/simulations/uv-lab": {
    title: brand("UV-Vis Spectrophotometry Lab"),
    description:
      "A virtual UV-visible spectrophotometer: the Beer–Lambert law, building a calibration curve and measuring an unknown's absorbance.",
  },
  "/simulations/staining-lab": {
    title: brand("Bacterial Staining Lab — simple, Gram and special stains"),
    description:
      "Why bacteria are stained and how: simple, Gram, capsule and endospore staining, with the reagents, the procedure and what each result looks like under the microscope.",
  },
  "/simulations/organic-id-lab": {
    title: brand("Organic Compound Identification Lab"),
    description:
      "Identify an unknown organic compound systematically — physical state, solubility, element detection and functional group tests — in a guided virtual lab.",
  },
  "/simulations/lab-guide": {
    title: brand("Determination of Bleeding Time — lab guide"),
    description:
      "A step-by-step physiology practical: determining bleeding time by Duke's method — equipment, biosafety precautions and the six-step procedure.",
  },

  "/antibiogram-simulator": {
    title: brand("Antibiogram Simulator — empirical antibiotic choice"),
    description:
      "Case-based antimicrobial stewardship practice: read an antibiogram's S/I/R results and choose the narrowest effective antibiotic for pneumonia, cystitis, sepsis and other infections.",
  },
  "/adr-detective": {
    title: brand("ADR Detective — adverse drug reaction cases"),
    description:
      "Clinical mystery cases for pharmacy students: read the history and identify the drug behind each adverse reaction.",
  },
  "/compounding-lab": {
    title: brand("Extemporaneous Compounding Lab"),
    description:
      "A formulation library for pharmacy compounding — ointments, capsules, gels, suppositories and sterile IV preparations — with study cards, a quiz and a compounding simulation for each.",
  },
  "/drug-finder": {
    title: brand("Drug Finder — brand and generic names (RxNorm)"),
    description:
      "Look up any medicine by brand or generic name and see its ingredients, related brands and generics, and dose forms from the US National Library of Medicine's RxNorm.",
  },
  "/prescription-reader": {
    title: brand("Prescription Reader"),
    description: "Upload a photo of a prescription and get the medicines, doses and directions read out as text.",
    noindex: true,
  },

  "/faqs": {
    title: brand("Frequently Asked Questions"),
    description:
      "Answers about PharmaWallah: who it is for, what is free, how accounts and progress work, and how to contact the team.",
  },
  "/contact": {
    title: brand("Contact Us"),
    description: "Get in touch with the PharmaWallah team — questions, corrections, feedback and partnership enquiries.",
  },
  "/careers": {
    title: brand("Careers — join the PharmaWallah team"),
    description:
      "Help build free pharmacy education: open remote roles for content writers, MCQ creators, editors and developers.",
  },
  "/privacy": {
    title: brand("Privacy Policy"),
    description:
      "How PharmaWallah collects, uses and protects your information, including accounts, analytics, cookies and Google AdSense advertising.",
  },
  "/terms": {
    title: brand("Terms and Conditions"),
    description: "The terms for using PharmaWallah's educational website, calculators and study resources.",
  },

  /* Clinical — the same content is also served on the clinical.* subdomain;
     canonicals send both to these www URLs (see canonicalFor). */
  "/clinical": {
    title: brand("Clinical Pharmacy Tools"),
    description:
      "Clinical pharmacy tools for pharmacists and students: drug interaction checkers, adverse effect lookup, AMR surveillance data, clinical calculators and drug information.",
  },
  "/clinical/about": {
    title: brand("About PharmaWallah Clinical"),
    description:
      "PharmaWallah Clinical brings drug information, research tools and clinical calculators together for pharmacy students and practising pharmacists.",
  },
  "/clinical/adr": {
    title: brand("Adverse Effect Detector — FDA label and FAERS data"),
    description:
      "Look up the known adverse reactions, warnings and post-market reports for a drug, from FDA labelling and the FAERS database via openFDA.",
  },
  "/clinical/calculators": {
    title: brand("Clinical Calculators"),
    description:
      "Patient assessment calculators for clinical pharmacy: body surface area, BMI, creatinine clearance, eGFR and other laboratory and severity scores.",
  },
  "/clinical/dose-calculators": {
    title: brand("Clinical Dose Calculators"),
    description:
      "Dose calculators for clinical practice: paediatric, geriatric and renal dose adjustment, opioid MME, IV drip rate, reconstitution, TPN and vancomycin AUC.",
  },
  "/clinical/drug-drug-interaction": {
    title: brand("Drug–Drug Interaction Checker"),
    description:
      "Check two medicines or a whole regimen for pharmacological interactions, with the severity, mechanism and management of each one found.",
  },
  "/clinical/drug-food-interaction": {
    title: brand("Drug–Food Interaction Checker"),
    description:
      "Check how foods, drinks, herbal products, supplements and meal timing can affect a medicine's absorption and effect.",
  },
  "/clinical/encyclopedia": {
    title: brand("Clinical Drug Encyclopedia"),
    description:
      "Search drug monographs: indication, mechanism, pharmacokinetics, interactions, products and chemistry for thousands of approved and investigational drugs.",
  },
  "/clinical/resources": {
    title: brand("Clinical Resources — PubMed, DailyMed, MedlinePlus, ClinicalTrials.gov"),
    description:
      "Search trusted clinical sources from one place: PubMed literature, DailyMed drug labels, MedlinePlus patient information and ClinicalTrials.gov studies.",
  },
  "/clinical/resources/pubmed": {
    title: brand("PubMed Search"),
    description: "Search PubMed's biomedical literature and abstracts from PharmaWallah Clinical.",
    // A search box over a third-party source: no content of its own.
    noindex: true,
  },
  "/clinical/resources/dailymed": {
    title: brand("DailyMed Drug Label Search"),
    description: "Find the official FDA prescribing information and package insert for a medicine through DailyMed.",
    // A search box over a third-party source: no content of its own.
    noindex: true,
  },
  "/clinical/resources/medlineplus": {
    title: brand("MedlinePlus Health Topic Search"),
    description: "Plain-language health topics and medicine information for patients, from MedlinePlus.",
    // A search box over a third-party source: no content of its own.
    noindex: true,
  },
  "/clinical/resources/clinicaltrials": {
    title: brand("ClinicalTrials.gov Search"),
    description: "Search ClinicalTrials.gov for studies by condition or drug, with recruitment status, phase and sponsor.",
    // A search box over a third-party source: no content of its own.
    noindex: true,
  },

  /* Accounts and private pages — useful to a signed-in student, empty to a
     crawler. Kept out of the index. */
  "/signin": { title: brand("Sign in"), description: "Sign in to your PharmaWallah account.", noindex: true },
  "/signup": { title: brand("Create an account"), description: "Create a free PharmaWallah account.", noindex: true },
  "/forgot-password": { title: brand("Reset your password"), description: "Reset your PharmaWallah password.", noindex: true },
  "/update-password": { title: brand("Set a new password"), description: "Set a new PharmaWallah password.", noindex: true },
  "/verify-otp": { title: brand("Verify your email"), description: "Confirm your email address.", noindex: true },
};

/* ── Whole sections kept out of the index ───────────────────────────────── */

/*
 * Private pages, and the Science Fair 2026 tournament, which has ended. The
 * tournament pages still work for anyone with a link, but a finished event's
 * entry forms and games are not content for a search result or an ad review.
 */
const NOINDEX_PREFIXES = [
  "/dashboard",
  "/admin",
  "/tournament",
  "/leaderboard",
  "/pw",
  "/community/submit",
  "/community/saved",
];

/* ── Pages whose metadata is derived from a slug ────────────────────────── */

export const HISTOLOGY_LESSONS: Record<string, string> = {
  lungs: "Lungs",
  stomach: "Stomach",
  kidney: "Kidney",
  "small-intestine": "Small Intestine",
  "large-intestine": "Large Intestine",
  appendix: "Appendix",
  "smooth-muscle": "Smooth Muscle",
  "skeletal-muscle": "Skeletal Muscle",
  "cardiac-muscle": "Cardiac Muscle",
  "gall-bladder-skin": "Gall Bladder and Skin",
  rbcs: "Red Blood Cells (RBCs)",
  wbcs: "White Blood Cells (WBCs)",
  "epithelium-simple": "Simple Epithelium",
  "epithelium-stratified": "Stratified Epithelium",
  "connective-tissue": "Connective Tissue",
  "slide-preparation": "Slide Preparation and Staining",
  "simple-columnar-epithelium": "Simple Columnar Epithelium",
};

export const PATHOLOGY_LESSONS: Record<string, string> = {
  "acute-appendicitis": "Acute Appendicitis",
  "chronic-cholecystitis": "Chronic Cholecystitis",
  gastritis: "Gastritis",
  "peptic-ulcer": "Peptic Ulcer",
  "tb-granuloma": "Tuberculous Granuloma",
  leiomyoma: "Leiomyoma",
  lipoma: "Lipoma",
  "squamous-cell-carcinoma": "Squamous Cell Carcinoma",
  "hodgkin-lymphoma": "Hodgkin Lymphoma",
  adenocarcinoma: "Adenocarcinoma",
  "fatty-liver": "Fatty Liver",
  "cvc-liver": "Chronic Venous Congestion of the Liver",
  bph: "Benign Prostatic Hyperplasia",
  fibroadenoma: "Fibroadenoma",
  "carcinoma-in-situ": "Carcinoma In Situ",
};

export const POWDER_LESSONS: Record<string, string> = {
  senna: "Senna Leaf Powder",
  "nux-vomica": "Nux Vomica Seed Powder",
  digitalis: "Digitalis Leaf Powder",
};

/** Semester and subject names come from the same data the MCQ pages render. */
export type McqLookup = {
  semester(slug: string): string | undefined;
  subject(
    semesterSlug: string,
    subjectSlug: string,
  ): { name: string; available: boolean; firstSemesterSlug: string } | undefined;
  semesterHasQuestions(slug: string): boolean;
};

function derivedMeta(path: string, mcq?: McqLookup): PageMeta | undefined {
  let m: RegExpMatchArray | null;

  if ((m = path.match(/^\/spotting\/histology\/lessons\/([^/]+)$/)) && HISTOLOGY_LESSONS[m[1]]) {
    const name = HISTOLOGY_LESSONS[m[1]];
    return {
      title: brand(`${name} Histology — spotting lesson`),
      description: `${name} under the microscope: the histological structure, points of identification and exam notes for the Pharm-D histology spotting practical.`,
      // Not in the lesson index; the same tissue is covered by Simple Epithelium.
      noindex: m[1] === "simple-columnar-epithelium",
    };
  }
  if ((m = path.match(/^\/spotting\/pathology\/([^/]+)$/)) && PATHOLOGY_LESSONS[m[1]]) {
    const name = PATHOLOGY_LESSONS[m[1]];
    return {
      title: brand(`${name} — pathology slide lesson`),
      description: `${name}: definition, gross and microscopic features, and the points of identification to recognise the slide in the Pharm-D pathology spotting exam.`,
    };
  }
  if ((m = path.match(/^\/spotting\/powder-microscopy\/lessons\/([^/]+)$/)) && POWDER_LESSONS[m[1]]) {
    const name = POWDER_LESSONS[m[1]];
    return {
      title: brand(`${name} — powder microscopy`),
      description: `${name}: source, definition and the diagnostic microscopic characters used to identify the crude drug powder in pharmacognosy practicals.`,
    };
  }

  if (mcq && (m = path.match(/^\/mcqs-bank\/([^/]+)$/))) {
    const semester = mcq.semester(m[1]);
    if (semester) {
      return {
        title: brand(`${semester} MCQs — Pharm-D practice questions`),
        description: `Multiple-choice practice for ${semester} of the Pharm-D programme, with explanations for every answer and a score report at the end.`,
        // A semester with no finished question bank is only a list of names.
        noindex: !mcq.semesterHasQuestions(m[1]),
      };
    }
  }
  if (mcq && (m = path.match(/^\/mcqs-bank\/([^/]+)\/([^/]+)$/))) {
    const subject = mcq.subject(m[1], m[2]);
    if (subject) {
      return {
        title: brand(`${subject.name} MCQs`),
        description: `Practice multiple-choice questions for ${subject.name}, by unit or across the whole syllabus, with an explanation for every answer.`,
        noindex: !subject.available,
        // A subject listed under two semesters (Physical Pharmacy: 1 and 4)
        // serves the same bank twice; the first semester's URL is canonical.
        canonicalPath:
          subject.firstSemesterSlug !== m[1] ? `/mcqs-bank/${subject.firstSemesterSlug}/${m[2]}` : undefined,
      };
    }
  }

  if ((m = path.match(/^\/clinical\/resources\/([^/]+)$/))) {
    return STATIC_META[path];
  }

  return undefined;
}

/**
 * Metadata for a request path, or undefined when the page should rely on its
 * own (or the site default). `path` has no query string.
 */
export function metaForPath(path: string, mcq?: McqLookup): PageMeta | undefined {
  const exact = STATIC_META[path] ?? derivedMeta(path, mcq);
  if (NOINDEX_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    return {
      title: exact?.title ?? DEFAULT_TITLE,
      description: exact?.description ?? DEFAULT_DESCRIPTION,
      noindex: true,
    };
  }
  return exact;
}

/**
 * The canonical www URL for a request. The whole app is also reachable on the
 * clinical.* subdomain (middleware tags the host; it does not rewrite), which
 * made every page a duplicate of itself on a second host. Canonicals point both
 * at www. The subdomain's home page is the same content as www's /clinical.
 */
export function canonicalFor(path: string, isClinicalHost: boolean): string {
  const p = isClinicalHost && path === "/" ? "/clinical" : path;
  return `${SITE_URL}${p === "/" ? "" : p}` || SITE_URL;
}
