"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, BookOpen, Award, Shuffle,
  CheckCircle, XCircle, RotateCcw, Trophy, ExternalLink,
  ZoomIn, X, Images, Microscope as MicIcon, Clock, AlertTriangle,
} from "lucide-react";
import {
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf, Dna, Activity,
} from "lucide-react";

// ─── Constant site-wide gradient ─────────────────────────────────────────────
const GRAD = "from-indigo-600 to-pink-500";

// ─── Fixed BG icons ───────────────────────────────────────────────────────────
const BG_ICONS = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 30 },
  { Icon: Beaker, top: "38%", left: "1%", size: 28 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 30 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 28 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 28 },
];

// PathologyOutlines base URL — used for the citation below every image
const PO_BASE = "https://www.pathologyoutlines.com";

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE DATA — 15 slides
// images: only `url` is needed (label / hint removed per spec)
// pathologyOutlinesUrl: deep-link to the specific topic page for citation
// ═══════════════════════════════════════════════════════════════════════════════
const SLIDE_DATA = [
  {
    id: "acute-appendicitis",
    title: "Acute Appendicitis",
    category: "GI Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/appendixacuteappendicitisnonperforated.html`,
    images: [
      { url: "/images/spotting/pathology/acute-appendicitis.jpg" },
      { url: "/images/spotting/pathology/acute-appendicitis-mid.jpg" },
      { url: "/images/spotting/pathology/acute-appendicitis-high.jpg" },
    ],
    options: ["Acute Appendicitis", "Chronic Appendicitis", "Crohn's Disease", "Mucinous Cystadenoma"],
    correctOptionIndex: 0,
    definition: [
      "Hyperplastic lymphoid follicles are present.",
      "Obstruction of lumen is present.",
      "Neutrophil exudate is present / Neutrophil exudate spread in Sub-mucosa.",
      "Inflamed serosal layered observed.",
      "Fibrin present in peritoneal surface due to inflammation.",
    ],
    lessonDetailed: "Acute appendicitis is the commonest abdominal surgical emergency. Obstruction of the lumen (faecolith, lymphoid hyperplasia) leads to bacterial overgrowth and transmural inflammation. Neutrophilic infiltration of the muscularis propria is the histological hallmark. Mucosal ulceration, hyperplastic follicles, and peritoneal fibrinous exudate are characteristic. Gangrene and perforation follow if untreated.",
    keyFeatures: ["Hyperplastic lymphoid follicles", "Luminal obstruction", "Neutrophil exudate in submucosa", "Inflamed serosa", "Peritoneal fibrin"],
  },
  {
    id: "chronic-cholecystitis",
    title: "Chronic Cholecystitis",
    category: "Hepatobiliary",
    pathologyOutlinesUrl: `${PO_BASE}/topic/gallbladderchroniccholecystitis.html`,
    images: [
      { url: "/images/spotting/pathology/chronic-cholecystitis.jpg" },
      { url: "/images/spotting/pathology/chronic-cholecystitis-mid.jpg" },
      { url: "/images/spotting/pathology/chronic-cholecystitis-high.jpg" },
    ],
    options: ["Chronic Cholecystitis", "Acute Cholecystitis", "Gallbladder Carcinoma", "Cholesterolosis"],
    correctOptionIndex: 0,
    definition: [
      "Penetration of epithelium lined spaces penetrate into the gall bladder wall that form RAS (Rokitansky Aschoff Sinus).",
      "Mononuclear inflammatory cells are present.",
      "Sub-epithelial and sub-serosal fibrosis is present that leads to the shrinking of gall bladder.",
      "Hypertrophy of smooth muscles.",
      "Lamina propria is infiltrated by lymphocytes and plasma cells.",
      "Hypertrophy of muscularis.",
    ],
    lessonDetailed: "Chronic cholecystitis is almost always associated with gallstones. Repeated low-grade inflammation causes progressive fibrosis, wall thickening, and muscle hypertrophy. The pathognomonic feature is the Rokitansky–Aschoff sinus — epithelium-lined crypts herniating through the muscularis. The lamina propria shows lymphocytes and plasma cells.",
    keyFeatures: ["Rokitansky–Aschoff Sinuses (RAS)", "Mononuclear / lymphocyte infiltrate", "Sub-epithelial and sub-serosal fibrosis", "Smooth muscle hypertrophy", "Lamina propria: lymphocytes + plasma cells"],
  },
  {
    id: "gastritis",
    title: "Gastritis",
    category: "GI Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/stomachHelicobacter.html`,
    images: [
      { url: "/images/spotting/pathology/gastritis.jpg" },
      { url: "/images/spotting/pathology/gastritis-mid.jpg" },
      { url: "/images/spotting/pathology/gastritis-high.jpg" },
    ],
    options: ["Gastritis", "Peptic Ulcer", "Gastric Carcinoma", "Ménétrier Disease"],
    correctOptionIndex: 0,
    definition: [
      "Lymphocytes infiltration is present.",
      "Neutrophil infiltration is present in the epithelium layer.",
      "Spiral shaped H.pylori is also observed.",
      "The epithelium layer forms gastric pits.",
    ],
    lessonDetailed: "H. pylori is the most common cause of chronic active gastritis. The mucosa shows lymphoplasmacytic infiltration (chronic) and neutrophilic infiltration of surface epithelium and gastric pits (active). H. pylori are visible in the mucus layer. Chronic gastritis predisposes to peptic ulcer and gastric adenocarcinoma.",
    keyFeatures: ["Lymphocyte infiltration in lamina propria", "Neutrophil infiltration of epithelium", "Spiral-shaped H. pylori", "Gastric pit formation"],
  },
  {
    id: "peptic-ulcer",
    title: "Peptic Ulcer",
    category: "GI Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/stomachpepticulcer.html`,
    images: [
      { url: "/images/spotting/pathology/peptic-ulcer.jpg" },
      { url: "/images/spotting/pathology/peptic-ulcer-mid.jpg" },
      { url: "/images/spotting/pathology/peptic-ulcer-high.jpg" },
    ],
    options: ["Peptic Ulcer", "Gastric Carcinoma", "Gastritis", "Crohn's Disease"],
    correctOptionIndex: 0,
    definition: [
      "Degeneration of mucosal epithelium.",
      "Blood vessels present at the ulcer base.",
      "Inflammatory cells mostly lymphocytes, plasma cells and eosinophils are present.",
      "A mesh work of fibrino inflammatory exudate is present that is followed by a zone of necrosis.",
      "Fibrosis / Scarring zone is present.",
      "Sharply demarcated edges are present.",
      "Perforation of ulcer leads to acute peritonitis.",
    ],
    lessonDetailed: "Peptic ulcers are mucosal defects penetrating through the muscularis mucosae. Classic four-zone histology: (1) fibrinopurulent exudate, (2) coagulation necrosis, (3) granulation tissue with vessels, (4) fibrous/scar tissue. H. pylori and NSAIDs are the major aetiological factors.",
    keyFeatures: ["Sharply demarcated edges", "Mucosal epithelium degeneration", "Fibrinoinflammatory exudate + necrosis", "Blood vessels at ulcer base", "Fibrosis / scarring zone"],
  },
  {
    id: "tb-granuloma",
    title: "TB Granuloma",
    category: "Inflammatory",
    pathologyOutlinesUrl: `${PO_BASE}/topic/lymphnodestuberculosis.html`,
    images: [
      { url: "/images/spotting/pathology/tb-granuloma.jpg" },
      { url: "/images/spotting/pathology/tb-granuloma-mid.jpg" },
      { url: "/images/spotting/pathology/tb-granuloma-high.jpg" },
    ],
    options: ["TB Granuloma", "Sarcoidosis", "Fungal Granuloma", "Foreign Body Granuloma"],
    correctOptionIndex: 0,
    definition: [
      "Caseous necrosis is present at the center.",
      "Giant cells surrounded the caseation.",
      "Infiltration of lymphocytes.",
      "Few collagen strands surrounding the lymphocytes.",
      "Macrophages type of cells are also present.",
    ],
    lessonDetailed: "Tuberculosis produces the classic caseating granuloma: central caseous necrosis surrounded by epithelioid macrophages, Langhans giant cells (peripheral horseshoe nuclei), and a rim of lymphocytes with outer collagen fibrosis. ZN stain or PCR confirms Mycobacterium tuberculosis.",
    keyFeatures: ["Central caseous necrosis", "Langhans giant cells surrounding caseation", "Peripheral lymphocytic infiltration", "Collagen strands around lymphocytes", "Epithelioid macrophages"],
  },
  {
    id: "leiomyoma",
    title: "Leiomyoma",
    category: "Smooth Muscle Tumour",
    pathologyOutlinesUrl: `${PO_BASE}/topic/uterusleiomyoma.html`,
    images: [
      { url: "/images/spotting/pathology/leiomyoma.jpg" },
      { url: "/images/spotting/pathology/leiomyoma-mid.jpg" },
      { url: "/images/spotting/pathology/leiomyoma-high.jpg" },
    ],
    options: ["Leiomyoma", "Leiomyosarcoma", "Rhabdomyoma", "Fibroma"],
    correctOptionIndex: 0,
    definition: [
      "Intersecting fascicles of spindle shaped smooth muscle cells with elongated cigar shaped nuclei.",
      "The cells have abundant eosinophilic cytoplasm.",
      "Variable amount of collagen is present between the muscles bundle.",
      "They usually have no significant nuclear pleomorphism and hyperchromasia.",
      "Usually have low mitotic activity.",
    ],
    lessonDetailed: "Leiomyomas (fibroids) are the commonest uterine neoplasms. Gross: firm, whorled, white-grey nodules. Microscopy: interlacing smooth muscle fascicles with cigar-shaped nuclei, eosinophilic cytoplasm, and <5 mitoses/10 HPF. IHC: SMA+, Desmin+.",
    keyFeatures: ["Intersecting fascicles of spindle smooth muscle cells", "Cigar-shaped (blunt-ended) nuclei", "Abundant eosinophilic cytoplasm", "Low / no mitotic activity", "No nuclear pleomorphism or hyperchromasia"],
  },
  {
    id: "lipoma",
    title: "Lipoma",
    category: "Soft Tissue Tumour",
    pathologyOutlinesUrl: `${PO_BASE}/topic/softtissuelipoma.html`,
    images: [
      { url: "/images/spotting/pathology/lipoma.jpg" },
      { url: "/images/spotting/pathology/lipoma-mid.jpg" },
      { url: "/images/spotting/pathology/lipoma-high.jpg" },
    ],
    options: ["Lipoma", "Liposarcoma", "Fibroma", "Myxoma"],
    correctOptionIndex: 0,
    definition: [
      "It is composed of lobules of mature fat cells (adipocytes) with clear cytoplasm and peripherally located nuclei.",
      "lobules are separated by delicate fibrous septa.",
      "There is no nuclear polymorphism and hyperchromasia.",
      "Some lipomas have thick fibrous capsules while others may blend into surrounding fat tissues.",
      "There is no increased mitotic activity that distinguish it with lipocarcinoma.",
    ],
    lessonDetailed: "Lipomas are the commonest soft-tissue tumour in adults. Microscopically: uniform mature adipocytes with eccentric nuclei and clear cytoplasm, arranged in lobules separated by thin fibrovascular septa. Absence of nuclear atypia, lipoblasts, and mitoses distinguishes lipoma from well-differentiated liposarcoma.",
    keyFeatures: ["Lobules of mature adipocytes", "Clear cytoplasm, peripheral nuclei", "Delicate fibrous septa between lobules", "No nuclear polymorphism / hyperchromasia", "No mitotic activity"],
  },
  {
    id: "squamous-cell-carcinoma",
    title: "Squamous Cell Carcinoma",
    category: "Malignant Tumour",
    pathologyOutlinesUrl: `${PO_BASE}/topic/skinsquamouscellcarcinoma.html`,
    images: [
      { url: "/images/spotting/pathology/squamous-cell-carcinoma.jpg" },
      { url: "/images/spotting/pathology/squamous-cell-carcinoma-mid.jpg" },
      { url: "/images/spotting/pathology/squamous-cell-carcinoma-high.jpg" },
    ],
    options: ["Squamous Cell Carcinoma", "Adenocarcinoma", "Basal Cell Carcinoma", "Large Cell Carcinoma"],
    correctOptionIndex: 0,
    definition: [
      "Large polygonal cells with abundant eosinophilic cytoplasm.",
      "Concentric whorl arrangement of keratinized cell.",
      "Desmosomal connections between the adjacent squamous cells.",
      "Lymphocytic infiltration also present sometimes plasma cells are also present with it.",
      "Tumor cells infiltrate the underline stroma often breaking the basement membrane.",
    ],
    lessonDetailed: "SCC shows keratin pearls (concentric whorls of keratinised squamous cells), individual cell keratinisation, intercellular bridges (desmosomes), stromal invasion with desmoplasia, and lymphocytic host response. Common sites: skin, lung, oesophagus, cervix.",
    keyFeatures: ["Large polygonal cells with eosinophilic cytoplasm", "Keratin pearls (concentric whorled keratinisation)", "Desmosomal intercellular bridges", "Lymphocytic ± plasma cell infiltrate", "Stromal invasion / BM disruption"],
  },
  {
    id: "hodgkin-lymphoma",
    title: "Hodgkin's Disease",
    category: "Haematological",
    pathologyOutlinesUrl: `${PO_BASE}/topic/lymphnodeshodgkin.html`,
    images: [
      { url: "/images/spotting/pathology/hodgkin-lymphoma.jpg" },
      { url: "/images/spotting/pathology/hodgkin-lymphoma-mid.jpg" },
      { url: "/images/spotting/pathology/hodgkin-lymphoma-high.jpg" },
    ],
    options: ["Hodgkin's Disease", "Non-Hodgkin Lymphoma", "Reactive Lymphadenitis", "Metastatic Carcinoma"],
    correctOptionIndex: 0,
    definition: [
      "There is a presence of large binucleated or multinucleated RSC ( Rerd Sternberg Cell).",
      "It has a prominent eosinophilic nucleoli in each nucleus.",
      "It has abundant eosinophilic cytoplasm.",
      "It is derived from the germinal disc of B-cells.",
    ],
    lessonDetailed: "Hodgkin's lymphoma is characterised by Reed–Sternberg cells — large cells with bilobed or multinucleated nuclei, each with a huge eosinophilic 'owl-eye' nucleolus, set against an inflammatory background. IHC: CD15+, CD30+. Classic subtypes: nodular sclerosis (commonest), mixed cellularity.",
    keyFeatures: ["Large binucleated / multinucleated Reed–Sternberg cells", "Prominent eosinophilic 'owl-eye' nucleoli", "Abundant eosinophilic cytoplasm", "Derived from germinal-centre B-cells", "Mixed inflammatory background"],
  },
  {
    id: "adenocarcinoma",
    title: "Adenocarcinoma",
    category: "Malignant Tumour",
    pathologyOutlinesUrl: `${PO_BASE}/topic/colonadenocarcinoma.html`,
    images: [
      { url: "/images/spotting/pathology/adenocarcinoma.jpg" },
      { url: "/images/spotting/pathology/adenocarcinoma-mid.jpg" },
      { url: "/images/spotting/pathology/adenocarcinoma-high.jpg" },
    ],
    options: ["Adenocarcinoma", "Squamous Cell Carcinoma", "Adenoma", "Mucinous Cystadenocarcinoma"],
    correctOptionIndex: 0,
    definition: [
      "Metastasis is found.",
      "There is a huge amount of mucous inside the gland.",
      "Cancer cells infiltered through the muscularis mucosa.",
      "Infiltration of lymphocytes and plasma cells.",
    ],
    lessonDetailed: "Adenocarcinoma: irregular glandular structures lined by pleomorphic columnar cells, abundant intraluminal mucin, invasion through muscularis mucosae, desmoplastic stromal reaction, and lymphovascular invasion. Common primaries: colorectum, stomach, lung, pancreas, breast.",
    keyFeatures: ["Irregular malignant glandular structures", "Abundant intraluminal mucin", "Infiltration through muscularis mucosa", "Lymphocyte + plasma cell infiltrate", "Evidence of metastasis"],
  },
  {
    id: "fatty-liver",
    title: "Fatty Liver",
    category: "Hepatic Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/liversteatosis.html`,
    images: [
      { url: "/images/spotting/pathology/fatty-liver.jpg" },
      { url: "/images/spotting/pathology/fatty-liver-mid.jpg" },
      { url: "/images/spotting/pathology/fatty-liver-high.jpg" },
    ],
    options: ["Fatty Liver", "Cirrhosis", "Hepatitis", "Chronic Venous Congestion"],
    correctOptionIndex: 0,
    definition: [
      "central vein is dilated.",
      "Balloon shaped hepatocytes are present.",
      "Fatty cells are present.",
    ],
    lessonDetailed: "Hepatic steatosis is accumulation of lipid within hepatocytes, primarily as macro-vesicular fat. Causes: alcohol, obesity, diabetes (NAFLD/NASH), drugs. Ballooned hepatocytes — swollen cells with pale rarefied cytoplasm — indicate cellular injury. Progression: steatosis → steatohepatitis → cirrhosis.",
    keyFeatures: ["Dilated central vein", "Balloon-shaped hepatocytes", "Macro-vesicular fat (clear cytoplasmic vacuoles)"],
  },
  {
    id: "cvc-liver",
    title: "Chronic Venous Congestion (Liver)",
    category: "Hepatic Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/livercongestiveheart.html`,
    images: [
      { url: "/images/spotting/pathology/cvc-liver.jpg" },
      { url: "/images/spotting/pathology/cvc-liver-mid.jpg" },
      { url: "/images/spotting/pathology/cvc-liver-high.jpg" },
    ],
    options: ["Chronic Venous Congestion", "Fatty Liver", "Hepatic Cirrhosis", "Budd–Chiari Syndrome"],
    correctOptionIndex: 0,
    definition: [
      "Central veins (sinusoidal) are dilated and congested.",
      "Central hemorrhagic necrosis are present.",
      "Fatty changes are observed.",
      "Portal triad is present.",
      "Eosinophilic cytoplasm is present.",
    ],
    lessonDetailed: "Chronic passive congestion (cardiac liver) from right heart failure. Macroscopic 'nutmeg' pattern. Microscopy: dilated sinusoids and central veins, centrilobular haemorrhagic necrosis, periportal fatty change, portal triads relatively preserved, eventual centrilobular fibrosis (cardiac cirrhosis).",
    keyFeatures: ["Dilated central veins and sinusoids", "Centrilobular haemorrhagic necrosis", "Periportal fatty changes", "Portal triad preserved", "Eosinophilic hepatocyte cytoplasm"],
  },
  {
    id: "bph",
    title: "Benign Prostatic Hyperplasia",
    category: "Urological",
    pathologyOutlinesUrl: `${PO_BASE}/topic/prostateBPH.html`,
    images: [
      { url: "/images/spotting/pathology/bph.jpg" },
      { url: "/images/spotting/pathology/bph-mid.jpg" },
      { url: "/images/spotting/pathology/bph-high.jpg" },
    ],
    options: ["Benign Prostatic Hyperplasia", "Prostatic Carcinoma", "Prostatitis", "Prostatic Intraepithelial Neoplasia"],
    correctOptionIndex: 0,
    definition: [
      "Cystic spaces are present.",
      "Diverticulum is present.",
      "Glandular papillary projections are present.",
      "Dilated bladder with hypertrophic muscles band are present.",
      "Glands lined by double layer epithelium cell, inner columnar and outer cuboidal cells.",
    ],
    lessonDetailed: "BPH is hyperplasia of the periurethral transitional zone driven by DHT. Key histology: enlarged glands with papillary projections lined by double-layer epithelium — inner tall columnar secretory cells over basal cuboidal cells. Corpora amylacea may be present. Secondary bladder changes: trabeculation, diverticula, detrusor hypertrophy.",
    keyFeatures: ["Cystic dilated glandular spaces", "Glandular papillary projections", "Double-layer epithelium (columnar + cuboidal)", "Bladder diverticulum / detrusor hypertrophy"],
  },
  {
    id: "fibroadenoma",
    title: "Fibroadenoma",
    category: "Breast Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/breastfibroadenoma.html`,
    images: [
      { url: "/images/spotting/pathology/fibroadenoma.jpg" },
      { url: "/images/spotting/pathology/fibroadenoma-mid.jpg" },
      { url: "/images/spotting/pathology/fibroadenoma-high.jpg" },
    ],
    options: ["Fibroadenoma", "Phyllodes Tumour", "Breast Carcinoma", "Fibrocystic Change"],
    correctOptionIndex: 0,
    definition: [
      "Small acinar and ductus structures are present which resembles the normal breast tissue.",
      "Fibrous tissues are arranged around the acinar.",
      "Epithelium formed clefts due to the pressure from the projecting fibrous tissue.",
    ],
    lessonDetailed: "Fibroadenoma is the commonest benign breast tumour in women under 30. Biphasic: epithelial + stromal. Two patterns: pericanalicular (fibrous grows around rounded acini) and intracanalicular (fibrous compresses ducts into clefts). Epithelium is benign without atypia. Well-circumscribed, encapsulated.",
    keyFeatures: ["Acinar and ductal structures resembling normal breast", "Fibrous stroma arranged around acini", "Epithelial clefts from fibrous compression", "Biphasic (epithelial + stromal)", "Well-circumscribed, no atypia"],
  },
  {
    id: "carcinoma-in-situ",
    title: "Carcinoma In Situ",
    category: "Cervical Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/cervixcarcinomainsitu.html`,
    images: [
      { url: "/images/spotting/pathology/carcinoma-in-situ.jpg" },
      { url: "/images/spotting/pathology/carcinoma-in-situ-mid.jpg" },
      { url: "/images/spotting/pathology/carcinoma-in-situ-high.jpg" },
    ],
    options: ["Carcinoma In Situ", "Severe Dysplasia (CIN 3)", "Invasive Carcinoma", "High-grade VAIN"],
    correctOptionIndex: 0,
    definition: [
      "Presence of SMILE (Stratified Mucin Intraepithelial Lesions).",
      "Polyhedral two columnar cells with eosinophilic to mucinous cytoplasm are present.",
      "There is no clear stratification and cells are undifferentiated.",
      "Due to increase in mitotic activity abnormal alter cells are filling the crypts.",
    ],
    lessonDetailed: "CIS is full-thickness neoplastic transformation without stromal invasion. SMILE (Stratified Mucin-secreting Intraepithelial Lesion) involves endocervical crypts. Features: complete loss of maturation, polyhedral undifferentiated cells, mitoses at all levels, no stratification, crypt involvement without invasion. HPV high-risk types (16, 18) are aetiological.",
    keyFeatures: ["SMILE (Stratified Mucin Intraepithelial Lesions)", "Polyhedral columnar cells with mucinous cytoplasm", "No stratification / undifferentiated", "Increased mitosis throughout", "Abnormal cells filling crypts"],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// REFERENCES
// ═══════════════════════════════════════════════════════════════════════════════
const REFERENCES = [
  { authors: "Kumar V, Abbas AK, Aster JC.", title: "Robbins and Cotran Pathologic Basis of Disease (10th ed.).", publisher: "Elsevier.", year: "2020" },
  { authors: "Harsh Mohan.", title: "Textbook of Pathology (8th ed.).", publisher: "Jaypee Brothers Medical Publishers.", year: "2019" },
  { authors: "Bancroft JD, Layton C.", title: "Bancroft's Theory and Practice of Histological Techniques (8th ed.).", publisher: "Elsevier.", year: "2019" },
  { authors: "Rosai J.", title: "Rosai and Ackerman's Surgical Pathology (11th ed.).", publisher: "Elsevier.", year: "2018" },
  { authors: "Fletcher CDM.", title: "Diagnostic Histopathology of Tumors (5th ed.).", publisher: "Elsevier.", year: "2021" },
  { authors: "PathologyOutlines.com.", title: "Slide references for histological images used in this test.", publisher: "PathologyOutlines.com.", year: "2024", url: PO_BASE },
];

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calculateMatch(userText: string, definition: string[]): number {
  const defText = definition.join(" ");

  const STOP = new Set<string>([
    "the", "and", "for", "with", "that", "this", "are", "was", "from", "into", "have", "also",
    "they", "its", "not", "but", "all", "has", "our", "more", "some", "been", "their", "there",
    "when", "which", "present", "cells", "cell",
  ]);

  const tok = (s: string): string[] =>
    s.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((w: string) => w.length > 3 && !STOP.has(w));

  const userSet = new Set<string>(tok(userText));
  const defSet = new Set<string>(tok(defText));

  if (!defSet.size) return 0;

  let matches = 0;

  userSet.forEach((w) => {
    if (defSet.has(w)) matches++;
  });

  return Math.min(100, Math.round((matches / defSet.size) * 100));
}

function scoreBadge(s: number) {
  if (s >= 75) return "text-green-700 bg-green-50 border-green-200";
  if (s >= 40) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-red-700 bg-red-50 border-red-200";
}
function scoreLabel(s: number) {
  if (s >= 75) return "Excellent — spot-on recognition!";
  if (s >= 40) return "Good effort — compare your points below.";
  return "Study the key features carefully and try again.";
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface SlideAnswer {
  selectedOption: number | null;
  points: string;
  submitted: boolean;
  matchScore: number;
}
type Slide = typeof SLIDE_DATA[number];

// ═══════════════════════════════════════════════════════════════════════════════
// PATHOLOGY OUTLINES CITATION BAR
// ═══════════════════════════════════════════════════════════════════════════════
function POCitation({ url }: { url: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-indigo-50/60 border-t border-indigo-100/80">
      <p className="text-[10px] text-indigo-500 font-semibold leading-tight">
        Image reference: PathologyOutlines.com
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-pink-600 transition-colors shrink-0 ml-2"
        onClick={e => e.stopPropagation()}
      >
        View topic <ExternalLink className="w-2.5 h-2.5" />
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTBOX
// ═══════════════════════════════════════════════════════════════════════════════
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-3 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: "88vh" }}
        onClick={e => e.stopPropagation()}
      >
        <Image src={src} alt="Microscope slide" width={1400} height={900}
          className="w-full object-contain bg-gray-950" style={{ maxHeight: "84vh" }} />
        <button onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition">
          <X className="w-4 h-4" />
        </button>
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/50 text-[10px] whitespace-nowrap">
          Press Esc or tap outside to close
        </p>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE GALLERY
// ═══════════════════════════════════════════════════════════════════════════════
function ImageGallery({ images, poUrl }: { images: Slide["images"]; poUrl: string }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  useEffect(() => { setActiveIdx(0); }, [images]);

  const active = images[activeIdx];
  const powerLabel = (i: number) => (["Low ×", "Mid ×", "High ×"])[i] ?? `${i + 1}×`;

  return (
    <>
      <AnimatePresence mode="wait">
        {lightbox && (
          <Lightbox key="lb" src={active.url} onClose={() => setLightbox(false)} />
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {/* ── Main image ── */}
        <div
          className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden group cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
          {/* gradient top accent */}
          <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD} z-10`} />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="relative w-full bg-gray-50"
              style={{ height: 230 }}
            >
              <Image
                src={active.url} alt="Microscope slide" fill
                className="object-contain"
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 600px"
              />
              {/* Zoom badge */}
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn className="w-3 h-3" /> Zoom
              </div>
              {/* Counter */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold pointer-events-none">
                <Images className="w-3 h-3" /> {activeIdx + 1}/{images.length}
              </div>
              {/* Power badge */}
              <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-gradient-to-r ${GRAD} text-white text-[10px] font-extrabold pointer-events-none`}>
                {powerLabel(activeIdx)}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* PathologyOutlines citation */}
          <POCitation url={poUrl} />
        </div>

        {/* ── Thumbnails ── */}
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              title={`View ${powerLabel(i)} power`}
              className={`relative flex-1 rounded-xl overflow-hidden border-2 transition-all duration-200 group/t ${i === activeIdx
                ? "border-indigo-500 shadow-md shadow-indigo-200/40 scale-[1.03]"
                : "border-gray-200 hover:border-indigo-300 hover:scale-[1.02]"
                }`}
              style={{ height: 58 }}
            >
              <Image src={img.url} alt={`View ${i + 1}`} fill className="object-cover" sizes="110px" />
              <div className={`absolute inset-0 transition-opacity ${i === activeIdx ? "bg-indigo-600/15" : "bg-black/0 group-hover/t:bg-black/10"
                }`} />
              {i === activeIdx && (
                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
              )}
              <div className="absolute top-1 left-1 bg-black/60 rounded px-1 py-0.5 text-white text-[8px] font-extrabold uppercase">
                {(["Low", "Mid", "High"])[i] ?? i + 1}
              </div>
            </button>
          ))}
        </div>

        {/* ── Mobile prev/next ── */}
        <div className="flex gap-2 sm:hidden">
          <button
            disabled={activeIdx === 0}
            onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 disabled:opacity-30 flex items-center justify-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button
            disabled={activeIdx === images.length - 1}
            onClick={() => setActiveIdx(i => Math.min(images.length - 1, i + 1))}
            className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 disabled:opacity-30 flex items-center justify-center gap-1"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REFERENCES BLOCK
// ═══════════════════════════════════════════════════════════════════════════════
function ReferencesBlock() {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0`}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900">References</h2>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1 shrink-0">
            {REFERENCES.length} sources
          </span>
        </div>
        <ol className="space-y-2.5">
          {REFERENCES.map((ref, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="w-5 h-5 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[9px] font-extrabold text-indigo-700 shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-gray-700 leading-relaxed">
                <span className="text-gray-400">{ref.authors} </span>
                <em className="font-semibold text-gray-900">{ref.title}</em>
                <span className="text-gray-400"> {ref.publisher} {ref.year}.</span>
                {"url" in ref && ref.url && (
                  <a href={ref.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-1 text-indigo-600 text-[11px] font-semibold hover:text-pink-600 transition-colors">
                    <ExternalLink className="w-2.5 h-2.5" />{ref.url.replace("https://", "")}
                  </a>
                )}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
          <strong className="text-gray-500">Disclaimer:</strong> Content is for educational review only. Clinical diagnosis requires a qualified pathologist.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function SpottingTestPage() {
  const [slides, setSlides] = useState<typeof SLIDE_DATA>(SLIDE_DATA);
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<SlideAnswer[]>(
    SLIDE_DATA.map(() => ({ selectedOption: null, points: "", submitted: false, matchScore: 0 }))
  );
  const [testCompleted, setTestCompleted] = useState(false);

  // ── 20-minute countdown timer ──────────────────────────────────────────────
  const TOTAL_SECONDS = 20 * 60; // 1200 s
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);

  // Start timer once component mounts
  useEffect(() => {
    const shuffled = shuffle([...SLIDE_DATA]);
    setSlides(shuffled);
    setAnswers(shuffled.map(() => ({ selectedOption: null, points: "", submitted: false, matchScore: 0 })));
    setMounted(true);
    setTimerActive(true);
  }, []);

  // Tick every second
  useEffect(() => {
    if (!timerActive || testCompleted) return;
    if (timeLeft <= 0) {
      setTimerExpired(true);
      setTimerActive(false);
      setTestCompleted(true);
      return;
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft, testCompleted]);

  const timerMins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const timerSecs = String(timeLeft % 60).padStart(2, "0");
  const timerUrgent = timeLeft <= 120; // last 2 min → red pulse

  const current = slides[currentIndex];
  const currentAnswer = answers[currentIndex];
  const allSubmitted = answers.every(a => a.submitted);
  const submittedCount = answers.filter(a => a.submitted).length;

  const shuffledOptions = useMemo(() => {
    if (!mounted) return current.options.map((text, origIdx) => ({ text, origIdx }));
    return shuffle(current.options.map((text, origIdx) => ({ text, origIdx })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id, mounted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAnswer.selectedOption === null || !currentAnswer.points.trim()) {
      alert("Please select an answer and write your recognition points before submitting.");
      return;
    }
    const score = calculateMatch(currentAnswer.points, current.definition);
    setAnswers(prev => prev.map((a, i) =>
      i === currentIndex ? { ...a, submitted: true, matchScore: score } : a
    ));
  };

  const handleReset = () => {
    setAnswers(prev => prev.map((a, i) =>
      i === currentIndex ? { selectedOption: null, points: "", submitted: false, matchScore: 0 } : a
    ));
  };

  const setOption = (origIdx: number) => {
    if (currentAnswer.submitted) return;
    setAnswers(prev => prev.map((a, i) => i === currentIndex ? { ...a, selectedOption: origIdx } : a));
  };
  const setPoints = (val: string) => {
    if (currentAnswer.submitted) return;
    setAnswers(prev => prev.map((a, i) => i === currentIndex ? { ...a, points: val } : a));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RESULTS SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (testCompleted) {
    const totalCorrect = answers.filter((a, i) =>
      a.selectedOption !== null && slides[i].options[a.selectedOption] === slides[i].title
    ).length;
    const avgMatch = (answers.reduce((s, a) => s + a.matchScore, 0) / answers.length).toFixed(1);
    const pct = Math.round((totalCorrect / slides.length) * 100);

    return (
      <section className="min-h-screen bg-white relative overflow-x-hidden">
        {BG_ICONS.map(({ Icon, top, left, size }, i) => (
          <div key={i} className="fixed pointer-events-none text-indigo-200/60 z-0" style={{ top, left }}>
            <Icon size={size} strokeWidth={1.4} />
          </div>
        ))}

        {/* Hero */}
        <div className={`relative bg-gradient-to-r ${GRAD} overflow-hidden`}>
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-6 sm:right-20 bottom-4 opacity-15 pointer-events-none">
            <Trophy size={64} className="text-white" />
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 text-center">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-4`}>
              <Trophy className="w-3.5 h-3.5" /> Test Complete
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Your Results</h1>
            {timerExpired && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/80 text-white text-xs font-bold mb-4 border border-red-400/60">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Time's up! 20 minutes elapsed.
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { n: `${totalCorrect}/${slides.length}`, l: "Correct Slides" },
                { n: `${pct}%`, l: "MCQ Score" },
                { n: `${avgMatch}%`, l: "Avg Match Score" },
                { n: pct >= 80 ? "🏆" : pct >= 50 ? "🎯" : "📚", l: "Grade" },
              ].map(({ n, l }) => (
                <div key={l} className="bg-white/15 rounded-2xl p-3 sm:p-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{n}</div>
                  <div className="text-xs text-pink-200 mt-1">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Per-slide summary */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-3">
          <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0`}>
              <Award className="w-5 h-5 text-white" />
            </div>
            Slide-by-Slide Summary
          </h2>

          {slides.map((slide, idx) => {
            const ans = answers[idx];
            const isCorrect = ans.selectedOption !== null && slide.options[ans.selectedOption] === slide.title;
            return (
              <div key={slide.id} className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-all">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* thumbnail */}
                  <div className="relative w-14 h-11 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                    <Image src={slide.images[0].url} alt={slide.title} fill className="object-cover" sizes="56px" />
                  </div>
                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-gray-900 text-sm">{slide.title}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{slide.category}</span>
                      {isCorrect
                        ? <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700"><CheckCircle className="w-2.5 h-2.5" /> Correct</span>
                        : <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700"><XCircle className="w-2.5 h-2.5" /> Incorrect</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Your answer: <span className="font-semibold text-gray-600">{ans.selectedOption !== null ? slide.options[ans.selectedOption] : "—"}</span>
                      {!isCorrect && <span className="ml-2 text-indigo-600">✓ <strong>{slide.title}</strong></span>}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {slide.keyFeatures.slice(0, 3).map(f => (
                        <span key={f} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700">{f}</span>
                      ))}
                    </div>
                  </div>
                  {/* score + link */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${scoreBadge(ans.matchScore)}`}>
                      {ans.matchScore}% match
                    </span>
                    <Link href={`/spotting/pathology/${slide.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-pink-600 transition-colors">
                      Lesson <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button onClick={() => window.location.reload()}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r ${GRAD} text-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all`}>
              <Shuffle className="w-4 h-4" /> Retake (Reshuffled)
            </button>
            <Link href="/spotting"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-indigo-400 hover:text-indigo-600 transition-all">
              <ChevronLeft className="w-4 h-4" /> Back to Spotting Centre
            </Link>
          </div>

          <ReferencesBlock />
        </div>
      </section>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MAIN TEST UI
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-indigo-200/60 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ════════════════ HERO ════════════════ */}
      <div className={`relative bg-gradient-to-r ${GRAD} overflow-hidden`}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-16 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-6 sm:right-20 bottom-4 opacity-15 pointer-events-none">
          <Dna size={60} className="text-white" />
        </div>
        <div className="absolute right-20 sm:right-44 top-5 opacity-15 pointer-events-none">
          <Activity size={36} className="text-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-10">
          {/* back link */}
          <Link href="/spotting"
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold mb-4 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Spotting Centre
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            {/* title block — NO slide name shown */}
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-3">
                <MicIcon className="w-3 h-3" /> Pathology Spotting Test · {current.category}
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Pathology Spotting Test
              </h1>
              <p className="text-white/70 text-xs sm:text-sm mt-2 max-w-md">
                <strong className="text-white">{current.images.length} views</strong> per slide — study all, then select the diagnosis and write your points of recognition.
              </p>
            </div>

            {/* slide progress pills */}
            <div className="flex flex-wrap gap-1.5 max-w-xs">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  title={`Slide ${i + 1}`}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl text-[9px] sm:text-xs font-extrabold transition-all duration-200 ${i === currentIndex
                    ? "bg-white text-indigo-700 shadow-md scale-110"
                    : answers[i].submitted
                      ? "bg-white/30 text-white"
                      : "bg-white/15 text-white/60 hover:bg-white/25"
                    }`}
                >
                  {answers[i].submitted
                    ? (slides[i].options[answers[i].selectedOption!] === slides[i].title ? "✓" : "✗")
                    : i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* progress bar */}
          <div className="mt-5 w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              animate={{ width: `${(submittedCount / slides.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-white/60 mt-1.5">
            <span>Slide {currentIndex + 1} of {slides.length}</span>
            {/* ── Timer pill ── */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-extrabold text-sm transition-all ${timerUrgent
              ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40"
              : "bg-white/20 text-white"
              }`}>
              <Clock className="w-3.5 h-3.5" />
              {timerMins}:{timerSecs}
            </div>
            <span>{submittedCount}/{slides.length} answered</span>
          </div>
        </div>
      </div>

      {/* ════════════════ CONTENT ════════════════ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}
            className="grid lg:grid-cols-2 gap-4 lg:gap-8"
          >
            {/* ── LEFT: gallery + MCQ ── */}
            <div className="space-y-4">

              {/* Slide number chip */}
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0 shadow-md shadow-indigo-200/40`}>
                  <MicIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                    Slide {currentIndex + 1} of {slides.length} · {current.category}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    Study all {current.images.length} views before answering
                  </p>
                </div>
              </div>

              {/* Gallery (PathologyOutlines citation is inside) */}
              <ImageGallery images={current.images} poUrl={current.pathologyOutlinesUrl} />

              {/* Key features chip list — revealed only after submit */}
              <AnimatePresence>
                {currentAnswer.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden p-4"
                  >
                    <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">
                      Key Identifying Features
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {current.keyFeatures.map(f => (
                        <span key={f} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700">
                          {f}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* MCQ */}
              <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-extrabold text-indigo-700 shrink-0">?</span>
                    Identify this slide:
                  </h3>
                  <div className="space-y-2">
                    {shuffledOptions.map(({ text, origIdx }) => {
                      const isSelected = currentAnswer.selectedOption === origIdx;
                      const isCorrectOpt = origIdx === current.correctOptionIndex;
                      let state = "default";
                      if (currentAnswer.submitted) {
                        if (isCorrectOpt) state = "correct";
                        else if (isSelected) state = "wrong";
                      } else if (isSelected) state = "selected";

                      return (
                        <label
                          key={origIdx}
                          onClick={() => setOption(origIdx)}
                          className={`flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border-2 transition-all duration-200 ${state === "correct" ? "border-green-400 bg-green-50 cursor-default" :
                            state === "wrong" ? "border-red-400 bg-red-50 cursor-default" :
                              state === "selected" ? "border-indigo-500 bg-indigo-50 cursor-pointer" :
                                currentAnswer.submitted ? "border-gray-100 bg-gray-50/50 cursor-default opacity-40" :
                                  "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer"
                            }`}
                        >
                          <input
                            type="radio" name="slideOption" value={origIdx}
                            checked={isSelected} disabled={currentAnswer.submitted}
                            onChange={() => setOption(origIdx)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 shrink-0"
                          />
                          <span className={`text-sm font-semibold flex-1 ${state === "correct" ? "text-green-800" :
                            state === "wrong" ? "text-red-700" : "text-gray-800"
                            }`}>{text}</span>
                          {currentAnswer.submitted && state === "correct" && <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />}
                          {currentAnswer.submitted && state === "wrong" && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: recognition textarea + feedback ── */}
            <div className="space-y-4">

              {/* Points textarea */}
              <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                <div className="p-4 sm:p-5">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-pink-600" />
                    </div>
                    Points of Recognition
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Write the key microscopic features that helped you identify this slide. Study all {current.images.length} views first!
                  </p>
                  <textarea
                    value={currentAnswer.points}
                    onChange={e => setPoints(e.target.value)}
                    rows={7}
                    disabled={currentAnswer.submitted}
                    placeholder={`e.g., ${current.keyFeatures[0].toLowerCase()}, ${(current.keyFeatures[1] ?? "").toLowerCase()}...`}
                    className="w-full px-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 text-sm text-gray-800 placeholder:text-gray-400 bg-white disabled:bg-gray-50 disabled:text-gray-500 resize-none transition-colors"
                  />
                  {!currentAnswer.submitted ? (
                    <button
                      onClick={handleSubmit}
                      className={`mt-3 w-full py-3 rounded-2xl bg-gradient-to-r ${GRAD} text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300`}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="mt-3 w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-2 transition-all"
                    >
                      <RotateCcw className="w-4 h-4" /> Try Again
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {currentAnswer.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="space-y-4"
                  >
                    {/* Match score */}
                    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                            <Award className="w-4 h-4 text-yellow-500" /> Match Score
                          </h3>
                          <span className={`text-base sm:text-lg font-extrabold px-3 py-1 rounded-xl border ${scoreBadge(currentAnswer.matchScore)}`}>
                            {currentAnswer.matchScore}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${GRAD} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${currentAnswer.matchScore}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{scoreLabel(currentAnswer.matchScore)}</p>
                      </div>
                    </div>

                    {/* Points comparison */}
                    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                      <div className="p-4 sm:p-5 space-y-4">
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
                            Expected Points of Recognition
                          </p>
                          <ol className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1.5">
                            {current.definition.map((point, pi) => (
                              <li key={pi} className="flex gap-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
                                <span className="w-5 h-5 rounded-md bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[9px] font-extrabold text-indigo-700 shrink-0 mt-0.5">
                                  {pi + 1}
                                </span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">
                            Your Points
                          </p>
                          <p className="text-xs sm:text-sm text-gray-700 bg-indigo-50 border border-indigo-100 p-3 rounded-xl leading-relaxed">
                            {currentAnswer.points}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lesson notes (expandable) */}
                    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                      <details className="group">
                        <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none select-none">
                          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-pink-600" /> Detailed Lesson Notes
                          </h3>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform duration-200" />
                        </summary>
                        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100 pt-3 space-y-3">
                          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                            {current.lessonDetailed}
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link
                              href={`/spotting/pathology/${current.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-600 hover:text-pink-600 transition-colors"
                            >
                              Open full lesson <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                            <a
                              href={current.pathologyOutlinesUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-400 hover:text-pink-600 transition-colors"
                            >
                              PathologyOutlines.com <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </details>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ════════════════ NAVIGATION ════════════════ */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100 gap-3">
          <button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-xs sm:text-sm font-bold hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <div className="text-xs text-gray-400 hidden sm:block">
            {submittedCount}/{slides.length} answered
          </div>

          {currentIndex === slides.length - 1 ? (
            <button
              onClick={() => setTestCompleted(true)}
              disabled={!allSubmitted}
              className={`inline-flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r ${GRAD} text-white text-xs sm:text-sm font-extrabold shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none transition-all`}
            >
              <Trophy className="w-4 h-4" /> See Results
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(i => Math.min(slides.length - 1, i + 1))}
              disabled={!answers[currentIndex].submitted}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-xs sm:text-sm font-bold hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-8">
          <ReferencesBlock />
        </div>
      </div>
    </section>
  );
}