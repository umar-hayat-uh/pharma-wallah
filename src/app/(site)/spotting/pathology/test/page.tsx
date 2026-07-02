"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, BookOpen, Award, CheckCircle, XCircle, RotateCcw,
  Trophy, ExternalLink, ZoomIn, X, Images, Microscope as MicIcon, Clock,
  AlertTriangle, Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf,
  Star, Zap, Flame, Lock, Target, Medal, Sparkles, ArrowRight, ChevronDown,
} from "lucide-react";
import { useTracker } from "@/hooks/useTracker";

// ══════════════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS — palette drawn from actual histology stains
//  (hematoxylin violet → eosin rose is the signature gradient; teal nods to
//  Papanicolaou counterstain for "correct"; parchment paper for the canvas)
// ══════════════════════════════════════════════════════════════════════════════
const INK = "#241C28";
const INK_SOFT = "#5B4F63";
const PAPER = "#FBF7F1";
const PAPER_MUTED = "#F1E9DE";
const VIOLET = "#4C2E7A";     // hematoxylin
const VIOLET_DEEP = "#331F54";
const ROSE = "#E14B72";       // eosin
const ROSE_SOFT = "#FCE4EA";
const TEAL = "#12876F";       // Papanicolaou green — "correct"
const TEAL_SOFT = "#DEF3EE";
const AMBER = "#DB9A34";
const AMBER_SOFT = "#FBEDD3";
const RED = "#D14545";
const RED_SOFT = "#FBE3E3";
const GRAD = "from-[#4C2E7A] via-[#8A3F86] to-[#E14B72]";
const GRAD_FLAT = "linear-gradient(90deg, #4C2E7A 0%, #8A3F86 50%, #E14B72 100%)";

const BG_ICONS = [
  { Icon: Pill, top: "9%", left: "2%", size: 26, rot: -12 },
  { Icon: Beaker, top: "40%", left: "1.2%", size: 24, rot: 8 },
  { Icon: Stethoscope, top: "74%", left: "2%", size: 26, rot: -6 },
  { Icon: Microscope, top: "10%", left: "96%", size: 26, rot: 10 },
  { Icon: FlaskConical, top: "42%", left: "97%", size: 24, rot: -8 },
  { Icon: Leaf, top: "74%", left: "96%", size: 24, rot: 14 },
];

const PO_BASE = "https://www.pathologyoutlines.com";

// ══════════════════════════════════════════════════════════════════════════════
//  FULL SLIDE DATA (15 slides) — unchanged content, same source of truth
// ══════════════════════════════════════════════════════════════════════════════
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

const REFERENCES = [
  { authors: "Kumar V, Abbas AK, Aster JC.", title: "Robbins and Cotran Pathologic Basis of Disease (10th ed.).", publisher: "Elsevier.", year: "2020" },
  { authors: "Harsh Mohan.", title: "Textbook of Pathology (8th ed.).", publisher: "Jaypee Brothers Medical Publishers.", year: "2019" },
  { authors: "Bancroft JD, Layton C.", title: "Bancroft's Theory and Practice of Histological Techniques (8th ed.).", publisher: "Elsevier.", year: "2019" },
  { authors: "Rosai J.", title: "Rosai and Ackerman's Surgical Pathology (11th ed.).", publisher: "Elsevier.", year: "2018" },
  { authors: "Fletcher CDM.", title: "Diagnostic Histopathology of Tumors (5th ed.).", publisher: "Elsevier.", year: "2021" },
  { authors: "PathologyOutlines.com.", title: "Slide references for histological images used in this test.", publisher: "PathologyOutlines.com.", year: "2024", url: PO_BASE },
];

// ─── UTILITIES ──────────────────────────────────────────────────────────────
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
    s.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((w: string) => w.length > 3 && !STOP.has(w));
  const userSet = new Set<string>(tok(userText));
  const defSet = new Set<string>(tok(defText));
  if (!defSet.size) return 0;
  let matches = 0;
  userSet.forEach((w) => { if (defSet.has(w)) matches++; });
  return Math.min(100, Math.round((matches / defSet.size) * 100));
}

function scoreTone(s: number) {
  if (s >= 75) return { fg: TEAL, bg: TEAL_SOFT, border: "#B7E3D8" };
  if (s >= 40) return { fg: AMBER, bg: AMBER_SOFT, border: "#F0D9A6" };
  return { fg: RED, bg: RED_SOFT, border: "#F3C6C6" };
}
function scoreLabel(s: number) {
  if (s >= 75) return "Excellent — spot-on recognition!";
  if (s >= 40) return "Good effort — compare your points below.";
  return "Study the key features carefully and try again.";
}

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface SlideAnswer {
  selectedOption: number | null;
  points: string;
  submitted: boolean;
  matchScore: number;
}
type Slide = typeof SLIDE_DATA[number];

// ══════════════════════════════════════════════════════════════════════════════
//  GLOBAL STYLE (fonts + keyframes + scrollbar) — self-contained, no config edits
// ══════════════════════════════════════════════════════════════════════════════
function GlobalStyle() {
  return (
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,650;9..144,800&family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
      .font-display { font-family: 'Fraunces', ui-serif, Georgia, serif; font-feature-settings: 'ss01' on; }
      .font-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
      .font-lab { font-family: 'JetBrains Mono', ui-monospace, monospace; }
      .spot-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
      .spot-scroll::-webkit-scrollbar-thumb { background: #d9cdbd; border-radius: 999px; }
      html, body { overflow-x: hidden; }
      @keyframes spot-float { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-10px) rotate(var(--r,0deg)); } }
      @keyframes spot-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(76,46,122,0.35); } 100% { box-shadow: 0 0 0 14px rgba(76,46,122,0); } }
    `}</style>
  );
}

// ─── SLIDE LABEL (glass-slide styled citation strip) ──────────────────────
function POCitation({ url }: { url: string }) {
  return (
    <div
      className="flex items-center justify-between px-3 py-2 border-t"
      style={{ background: "#F7EFE4", borderColor: "#E9DCC7" }}
    >
      <p className="text-[10px] font-bold tracking-wide" style={{ color: VIOLET }}>
        SPECIMEN REF · PathologyOutlines.com
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] font-extrabold transition-colors shrink-0 ml-2 hover:opacity-70"
        style={{ color: ROSE }}
        onClick={(e) => e.stopPropagation()}
      >
        View topic <ExternalLink className="w-2.5 h-2.5" />
      </a>
    </div>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-3 sm:p-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "88vh" }} onClick={e => e.stopPropagation()}>
        <Image src={src} alt="Microscope slide" width={1400} height={900} className="w-full object-contain bg-gray-950" style={{ maxHeight: "84vh" }} />
        <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition">
          <X className="w-4 h-4" />
        </button>
        <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/50 text-[10px] whitespace-nowrap">Press Esc or tap outside to close</p>
      </motion.div>
    </motion.div>
  );
}

// ─── IMAGE GALLERY — styled like a physical glass microscope slide ─────────
function ImageGallery({ images, poUrl }: { images: Slide["images"]; poUrl: string }) {
  const filteredImages = [images[0], images[images.length - 1]];
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  useEffect(() => { setActiveIdx(0); }, [images]);

  const active = filteredImages[activeIdx];
  const powerLabel = (i: number) => (i === 0 ? "Low ×10" : "High ×40");

  return (
    <>
      <AnimatePresence mode="wait">
        {lightbox && <Lightbox key="lb" src={active.url} onClose={() => setLightbox(false)} />}
      </AnimatePresence>
      <div className="space-y-2.5">
        <div
          className="relative rounded-[20px] border overflow-hidden group cursor-zoom-in shadow-sm"
          style={{ borderColor: "#E9DCC7", background: "#fff" }}
          onClick={() => setLightbox(true)}
        >
          <div className="absolute top-0 left-0 right-0 h-[4px] z-10" style={{ background: GRAD_FLAT }} />
          <AnimatePresence mode="wait">
            <motion.div key={activeIdx} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="relative w-full" style={{ height: 240, background: "radial-gradient(circle at 50% 40%, #fdfaf5 0%, #efe6d8 100%)" }}>
              <Image src={active.url} alt="Microscope slide" fill className="object-contain" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 600px" />
              <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"><ZoomIn className="w-3 h-3" /> Zoom</div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold pointer-events-none"><Images className="w-3 h-3" /> {activeIdx + 1}/{filteredImages.length}</div>
              <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg text-white text-[10px] font-extrabold pointer-events-none font-lab" style={{ background: GRAD_FLAT }}>{powerLabel(activeIdx)}</div>
            </motion.div>
          </AnimatePresence>
          <POCitation url={poUrl} />
        </div>

        <div className="flex gap-2">
          {filteredImages.map((img, i) => (
            <button key={i} onClick={() => setActiveIdx(i)} title={`View ${powerLabel(i)}`}
              className="relative flex-1 rounded-xl overflow-hidden border-2 transition-all duration-200 group/t"
              style={{
                height: 60,
                borderColor: i === activeIdx ? VIOLET : "#E9DCC7",
                transform: i === activeIdx ? "scale(1.03)" : "scale(1)",
                boxShadow: i === activeIdx ? "0 4px 14px -4px rgba(76,46,122,0.35)" : "none",
              }}>
              <Image src={img.url} alt={`View ${i + 1}`} fill className="object-cover" sizes="110px" />
              <div className="absolute inset-0 transition-opacity" style={{ background: i === activeIdx ? "rgba(76,46,122,0.18)" : "rgba(0,0,0,0)" }} />
              {i === activeIdx && <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />}
              <div className="absolute top-1 left-1 bg-black/60 rounded px-1 py-0.5 text-white text-[8px] font-extrabold uppercase font-lab">{i === 0 ? "Low" : "High"}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2 sm:hidden">
          <button disabled={activeIdx === 0} onClick={() => setActiveIdx(i => Math.max(0, i - 1))}
            className="flex-1 py-2.5 rounded-xl border text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1"
            style={{ borderColor: "#E9DCC7", color: INK_SOFT }}>
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button disabled={activeIdx === filteredImages.length - 1} onClick={() => setActiveIdx(i => Math.min(filteredImages.length - 1, i + 1))}
            className="flex-1 py-2.5 rounded-xl border text-xs font-bold disabled:opacity-30 flex items-center justify-center gap-1"
            style={{ borderColor: "#E9DCC7", color: INK_SOFT }}>
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

function ReferencesBlock() {
  return (
    <div className="relative rounded-2xl border overflow-hidden" style={{ borderColor: "#E9DCC7", background: "#fff" }}>
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: GRAD_FLAT }} />
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: GRAD_FLAT }}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-sm sm:text-base font-extrabold font-display" style={{ color: INK }}>References</h2>
          <span className="ml-auto text-xs rounded-full px-2.5 py-1 shrink-0" style={{ color: INK_SOFT, background: PAPER_MUTED, border: "1px solid #E9DCC7" }}>{REFERENCES.length} sources</span>
        </div>
        <ol className="space-y-2.5">
          {REFERENCES.map((ref, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-extrabold shrink-0 mt-0.5" style={{ background: ROSE_SOFT, color: VIOLET, border: "1px solid #F0CBD8" }}>{i + 1}</span>
              <p className="text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                <span className="opacity-60">{ref.authors} </span>
                <em className="font-semibold not-italic" style={{ color: INK }}>{ref.title}</em>
                <span className="opacity-60"> {ref.publisher} {ref.year}.</span>
                {"url" in ref && ref.url && (
                  <a href={ref.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 ml-1 text-[11px] font-semibold hover:opacity-70 transition-colors" style={{ color: ROSE }}>
                    <ExternalLink className="w-2.5 h-2.5" />{ref.url.replace("https://", "")}
                  </a>
                )}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-[10px] mt-4 pt-3 border-t" style={{ color: INK_SOFT, borderColor: "#EEE4D6", opacity: 0.8 }}>
          <strong>Disclaimer:</strong> Content is for educational review only. Clinical diagnosis requires a qualified pathologist.
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  GAMIFICATION UI ELEMENTS
// ══════════════════════════════════════════════════════════════════════════════
const XP_PER_LEVEL = 150;
const BASE_TIME_PER_SLIDE = 90; // seconds

const XPBar = ({ xp }: { xp: number }) => {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  const pct = (into / XP_PER_LEVEL) * 100;
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div
        className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0 font-lab"
        style={{ background: GRAD_FLAT }}
      >
        {level}
        <span className="absolute -inset-0.5 rounded-full pointer-events-none" style={{ animation: "spot-pulse-ring 2.4s ease-out infinite" }} />
      </div>
      <div className="w-20 sm:w-32 md:w-40">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide font-lab" style={{ color: INK_SOFT }}>Lv {level}</span>
          <span className="text-[9px] sm:text-[10px] font-bold font-lab" style={{ color: INK_SOFT }}>{into}/{XP_PER_LEVEL}</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: PAPER_MUTED }}>
          <motion.div className="h-full rounded-full" style={{ background: GRAD_FLAT }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>
    </div>
  );
};

const ComboBadge = ({ streak }: { streak: number }) => (
  <motion.div
    animate={streak >= 3 ? { scale: [1, 1.14, 1] } : {}}
    transition={{ duration: 0.6, repeat: streak >= 3 ? Infinity : 0, repeatDelay: 0.4 }}
    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl border"
    style={{ background: ROSE_SOFT, borderColor: "#F0CBD8" }}
  >
    <Flame size={14} style={{ color: ROSE, fill: streak >= 3 ? ROSE : "transparent" }} />
    <span className="font-bold text-xs sm:text-sm font-lab" style={{ color: VIOLET_DEEP }}>{streak}</span>
  </motion.div>
);

// Circular "microscope aperture" timer ring — the page's signature motif
const TimerRing = ({ timeLeft, timeLimit }: { timeLeft: number; timeLimit: number }) => {
  const pct = Math.max(0, Math.min(1, timeLeft / timeLimit));
  const color = pct > 0.5 ? TEAL : pct > 0.2 ? AMBER : RED;
  const r = 42, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} stroke={PAPER_MUTED} strokeWidth="7" fill="none" />
          <motion.circle
            cx="50" cy="50" r={r} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round"
            strokeDasharray={c}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          />
          {/* faint aperture blades for the "iris diaphragm" motif */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line key={deg} x1="50" y1="50" x2={50 + 34 * Math.cos((deg * Math.PI) / 180)} y2={50 + 34 * Math.sin((deg * Math.PI) / 180)}
              stroke="#EEE4D6" strokeWidth="1" />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-lab font-black text-2xl tabular-nums" style={{ color }}>{Math.max(0, timeLeft)}</span>
          <span className="text-[9px] uppercase tracking-wider font-bold" style={{ color: INK_SOFT }}>seconds</span>
        </div>
      </div>
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mt-1" style={{ color: INK_SOFT }}>
        <Clock size={12} /> Time on slide
      </span>
    </div>
  );
};

const AccuracyRing = ({ pct, label, color }: { pct: number; label: string; color: string }) => {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
      <svg viewBox="0 0 84 84" className="w-full h-full -rotate-90">
        <circle cx="42" cy="42" r={r} stroke={PAPER_MUTED} strokeWidth="7" fill="none" />
        <motion.circle cx="42" cy="42" r={r} stroke={color} strokeWidth="7" fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct / 100) }} transition={{ duration: 1, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-lab font-black text-lg" style={{ color }}>{pct}%</span>
      </div>
      <p className="text-center text-[10px] font-bold uppercase tracking-wide mt-1" style={{ color: INK_SOFT }}>{label}</p>
    </div>
  );
};

const LevelUpModal = ({ level, onClose }: { level: number; onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] backdrop-blur-md flex items-center justify-center p-4" style={{ background: "rgba(36,28,40,0.55)" }}>
    <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", damping: 18 }}
      className="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-10 text-center max-w-xs w-full overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: GRAD_FLAT }} />
      <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.6, delay: 0.2 }}
        className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: GRAD_FLAT }}>
        <Trophy size={30} className="text-white" />
      </motion.div>
      <h2 className="text-2xl font-black font-display" style={{ color: INK }}>Level {level}!</h2>
      <p className="text-sm mt-2" style={{ color: INK_SOFT }}>Your pathology skills are advancing.</p>
      <button onClick={onClose} className="mt-6 w-full text-white font-bold py-3 rounded-2xl shadow-lg transition-transform active:scale-95" style={{ background: GRAD_FLAT }}>
        Keep Going
      </button>
    </motion.div>
  </motion.div>
);

const Toast = ({ message, icon: Icon, tone = "dark" }: { message: string; icon: any; tone?: "dark" | "rose" }) => (
  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-bold"
    style={{ background: tone === "rose" ? GRAD_FLAT : INK }}>
    <Icon size={16} style={{ color: "#F5CD6B" }} /> {message}
  </motion.div>
);

// Small popup shown after a wrong / weak-match answer: your points vs. what was expected
const ReviewPopup = ({
  slideTitle, userText, expected, matchScore, onClose,
}: {
  slideTitle: string; userText: string; expected: string[]; matchScore: number; onClose: () => void;
}) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[95] backdrop-blur-md flex items-center justify-center p-4" style={{ background: "rgba(36,28,40,0.5)" }}
    onClick={onClose}>
    <motion.div initial={{ scale: 0.92, y: 14 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
      transition={{ type: "spring", damping: 22, stiffness: 260 }}
      className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full max-h-[85vh] overflow-y-auto spot-scroll"
      onClick={(e) => e.stopPropagation()}>
      <div className="px-5 pt-5 pb-4 text-white" style={{ background: GRAD_FLAT }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/75">Answer: {slideTitle}</p>
            <h3 className="text-base font-black font-display mt-0.5">Let's compare notes</h3>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0 hover:bg-white/25 transition-colors">
            <X size={14} className="text-white" />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: INK_SOFT }}>Your points</p>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg font-lab" style={{ ...scoreToneStyle(matchScore) }}>{matchScore}% match</span>
          </div>
          <p className="text-sm rounded-xl p-3 whitespace-pre-wrap" style={{ background: PAPER_MUTED, color: INK, border: "1px solid #EEE4D6" }}>
            {userText?.trim() || "—"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide mb-1.5" style={{ color: ROSE }}>Expected features</p>
          <ul className="space-y-1.5">
            {expected.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm rounded-xl p-2.5" style={{ background: ROSE_SOFT }}>
                <CheckCircle size={14} className="shrink-0 mt-0.5" style={{ color: VIOLET }} />
                <span style={{ color: VIOLET_DEEP }}>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button onClick={onClose} className="w-full text-white font-extrabold py-3 rounded-2xl shadow-md active:scale-[0.98] transition-transform" style={{ background: GRAD_FLAT }}>
          Got it — continue
        </button>
      </div>
    </motion.div>
  </motion.div>
);

function scoreToneStyle(s: number) {
  const t = s >= 75 ? { fg: TEAL, bg: TEAL_SOFT } : s >= 40 ? { fg: AMBER, bg: AMBER_SOFT } : { fg: RED, bg: RED_SOFT };
  return { color: t.fg, background: t.bg };
}

// Lightweight confetti burst — fires on perfect matches & level-ups
const Confetti = () => {
  const pieces = useMemo(() => Array.from({ length: 26 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 360,
    delay: Math.random() * 0.25,
    rotate: Math.random() * 360,
    color: [VIOLET, ROSE, TEAL, AMBER][i % 4],
    w: 5 + Math.random() * 4,
  })), []);
  return (
    <div className="fixed inset-0 z-[75] pointer-events-none overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: `calc(50% + ${p.x}px)`, opacity: 1, rotate: 0 }}
          animate={{ y: "70vh", opacity: 0, rotate: p.rotate }}
          transition={{ duration: 1.5, delay: p.delay, ease: "easeIn" }}
          style={{ background: p.color, width: p.w, height: p.w * 1.6, position: "absolute", top: "18%", borderRadius: 2 }}
        />
      ))}
    </div>
  );
};

// ─── Case Map Node ──────────────────────────────────────────────────────────
const CaseNode = ({
  slide, index, unlocked, prog, onSelect,
}: {
  slide: Slide; index: number; unlocked: boolean; prog?: { completed: boolean; stars: number }; onSelect: () => void;
}) => {
  const alignRight = index % 2 === 1;
  return (
    <div className={`relative z-10 flex w-full ${alignRight ? "justify-end pr-2 sm:pr-12" : "justify-start pl-2 sm:pl-12"}`}>
      <motion.button whileHover={unlocked ? { scale: 1.06 } : {}} whileTap={unlocked ? { scale: 0.94 } : {}} onClick={onSelect} disabled={!unlocked}
        className={`flex flex-col items-center gap-2 w-24 sm:w-32 ${!unlocked ? "opacity-50 cursor-not-allowed" : ""}`}>
        <div
          className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-[3px] shadow-md"
          style={{
            borderColor: unlocked ? (prog?.completed ? TEAL : VIOLET) : "#DED2C0",
            background: unlocked ? (prog?.completed ? TEAL_SOFT : ROSE_SOFT) : "#fff",
          }}
        >
          {unlocked ? (
            prog?.completed ? <CheckCircle size={26} style={{ color: TEAL }} /> : <MicIcon size={26} style={{ color: VIOLET }} />
          ) : (
            <Lock size={18} style={{ color: "#B7A88F" }} />
          )}
        </div>
        <span className="text-[11px] font-bold text-center leading-tight truncate max-w-full font-body" style={{ color: prog?.completed ? INK : INK_SOFT }}>
          {prog?.completed ? slide.title : `Case ${String(index + 1).padStart(2, "0")}`}
        </span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <Star key={i} size={11} style={{ color: i < (prog?.stars || 0) ? AMBER : "#E3D8C6" }} fill={i < (prog?.stars || 0) ? AMBER : "#E3D8C6"} />
          ))}
        </div>
      </motion.button>
    </div>
  );
};

// ─── TEST INSTRUCTIONS / STUDY GUIDE ───────────────────────────────────────
const TestInstructions = ({ onClose }: { onClose: () => void }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-4" style={{ background: "rgba(36,28,40,0.45)" }}>
    <motion.div initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
      className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[88vh] overflow-y-auto spot-scroll">
      <div className="relative px-6 pt-6 pb-5" style={{ background: GRAD_FLAT }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><MicIcon className="text-white" size={22} /></div>
          <div>
            <h2 className="text-xl font-black text-white font-display">Pathology Spotting Challenge</h2>
            <p className="text-white/80 text-xs">Test your slide recognition skills</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-sm" style={{ color: INK }}>You will be shown <strong>15 pathology slides</strong> in random order. For each slide you must:</p>
        <ul className="space-y-2">
          {["Identify the correct diagnosis from 4 options", "Write your key points of recognition", "Submit within the 90-second time limit"].map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-sm" style={{ color: INK_SOFT }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-0.5" style={{ background: GRAD_FLAT }}>{i + 1}</span>
              {t}
            </li>
          ))}
        </ul>
        <div className="rounded-2xl p-4" style={{ background: ROSE_SOFT, border: "1px solid #F0CBD8" }}>
          <p className="text-xs font-bold uppercase mb-2 flex items-center gap-1.5" style={{ color: VIOLET }}><Medal size={13} /> Scoring & Progression</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs" style={{ color: VIOLET_DEEP }}>
              <span className="flex gap-0.5">{[0, 1, 2].map(i => <Star key={i} size={11} fill={AMBER} color={AMBER} />)}</span> correct + match ≥75%
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: VIOLET_DEEP }}>
              <span className="flex gap-0.5">{[0, 1].map(i => <Star key={i} size={11} fill={AMBER} color={AMBER} />)}<Star size={11} color="#E3D8C6" fill="#E3D8C6" /></span> correct + match ≥40%
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: VIOLET_DEEP }}>
              <span className="flex gap-0.5"><Star size={11} fill={AMBER} color={AMBER} /><Star size={11} color="#E3D8C6" fill="#E3D8C6" /><Star size={11} color="#E3D8C6" fill="#E3D8C6" /></span> correct only
            </div>
          </div>
          <p className="text-xs mt-2.5 flex items-center gap-1.5" style={{ color: VIOLET }}><Zap size={12} /> Earn XP and level up as you complete slides!</p>
        </div>
        <div className="rounded-2xl p-3 text-xs flex items-start gap-2" style={{ background: AMBER_SOFT, color: "#7A5A17" }}>
          <Sparkles size={14} className="shrink-0 mt-0.5" />
          <span><strong>Pro tip:</strong> Use the low and high magnification views. Write what you see — match scoring rewards key terms.</span>
        </div>
      </div>
      <div className="px-6 pb-6">
        <button onClick={onClose} className="w-full text-white font-extrabold py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2" style={{ background: GRAD_FLAT }}>
          Begin Challenge <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function SpottingTestPage() {
  const { trackQuiz, trackActivity, trackTimeOnUnmount } = useTracker();

  // ── Game / Meta state ──
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [progress, setProgress] = useState<Record<string, { completed: boolean; stars: number }>>({});
  const [levelUpTo, setLevelUpTo] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; icon: any } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [reviewPopup, setReviewPopup] = useState<{ slideTitle: string; userText: string; expected: string[]; matchScore: number } | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confettiRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Screen & test state ──
  const [screen, setScreen] = useState<"map" | "lab" | "result">("map");
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [answers, setAnswers] = useState<SlideAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(BASE_TIME_PER_SLIDE);
  const [timerActive, setTimerActive] = useState(false);

  const testStartTimeRef = useRef<number | null>(null);

  // Initialize slides once on client
  useEffect(() => {
    const shuffled = shuffle([...SLIDE_DATA]);
    setSlides(shuffled);
    setAnswers(shuffled.map(() => ({ selectedOption: null, points: "", submitted: false, matchScore: 0 })));
    testStartTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    const cleanup = trackTimeOnUnmount();
    return cleanup;
  }, [trackTimeOnUnmount]);

  // Timer effect
  useEffect(() => {
    if (screen !== "lab" || !timerActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [screen, timerActive, timeLeft]);

  // Auto-submit on timeout
  useEffect(() => {
    if (screen === "lab" && timeLeft <= 0 && slides.length > 0 && !answers[currentIdx]?.submitted) {
      handleTimeout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // ── Helpers ──
  const showToast = useCallback((msg: string, icon: any) => {
    setToast({ message: msg, icon });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const burstConfetti = useCallback(() => {
    setShowConfetti(true);
    if (confettiRef.current) clearTimeout(confettiRef.current);
    confettiRef.current = setTimeout(() => setShowConfetti(false), 1600);
  }, []);

  const finishTest = useCallback(() => {
    setTimerActive(false);
    const finalCorrect = answers.filter((a, i) => a.submitted && slides[i]?.options[a.selectedOption!] === slides[i]?.title).length;
    const timeMins = Math.max(1, Math.round((Date.now() - (testStartTimeRef.current || Date.now())) / 60000));
    trackQuiz({
      quizId: `spotting-pathology-gamified-${Date.now()}`,
      subject: "Pathology Spotting",
      score: finalCorrect,
      total: slides.length,
      timeTakenMin: timeMins,
    });
    trackActivity({
      type: "quiz",
      label: `Completed Pathology Spotting Challenge — ${finalCorrect}/${slides.length}`,
      href: window.location.pathname,
    });
    setScreen("result");
  }, [answers, slides, trackQuiz, trackActivity]);

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!slides[currentIdx] || answers[currentIdx]?.submitted) return;
    const cur = answers[currentIdx];
    if (cur.selectedOption === null || !cur.points.trim()) {
      showToast("Select an answer and write your points first.", AlertTriangle);
      return;
    }
    const matchScore = calculateMatch(cur.points, slides[currentIdx].definition);
    const newAnswers = answers.map((a, i) => i === currentIdx ? { ...a, submitted: true, matchScore } : a);
    setAnswers(newAnswers);

    const isCorrect = slides[currentIdx].options[cur.selectedOption] === slides[currentIdx].title;
    let stars = 0;
    if (isCorrect) {
      if (matchScore >= 75) stars = 3;
      else if (matchScore >= 40) stars = 2;
      else stars = 1;
    }

    const prevLevel = Math.floor(xp / XP_PER_LEVEL);
    const xpGain = isCorrect ? (stars === 3 ? 60 : stars === 2 ? 40 : 20) : 0;
    const newXp = xp + xpGain;
    setXp(newXp);
    if (isCorrect) {
      setStreak(s => { const ns = s + 1; setBestStreak(bs => Math.max(bs, ns)); return ns; });
    } else {
      setStreak(0);
    }

    const newLevel = Math.floor(newXp / XP_PER_LEVEL);
    if (newLevel > prevLevel) setTimeout(() => { setLevelUpTo(newLevel); burstConfetti(); }, 700);

    setProgress(prev => ({ ...prev, [slides[currentIdx].id]: { completed: true, stars } }));

    if (stars === 3) { showToast("Perfect identification!", Award); burstConfetti(); }

    const needsReview = !isCorrect || matchScore < 40;

    if (needsReview) {
      // Pop up a small comparison card; advancing waits until the person closes it
      setReviewPopup({
        slideTitle: slides[currentIdx].title,
        userText: cur.points,
        expected: slides[currentIdx].definition,
        matchScore,
      });
    } else if (currentIdx < slides.length - 1) {
      setTimeout(() => {
        setCurrentIdx(idx => idx + 1);
        setTimeLeft(BASE_TIME_PER_SLIDE);
      }, 1200);
    } else {
      setTimeout(finishTest, 1200);
    }
  }, [slides, currentIdx, answers, xp, showToast, finishTest, burstConfetti]);

  const closeReviewPopup = useCallback(() => {
    setReviewPopup(null);
    if (currentIdx < slides.length - 1) {
      setCurrentIdx(idx => idx + 1);
      setTimeLeft(BASE_TIME_PER_SLIDE);
    } else {
      finishTest();
    }
  }, [currentIdx, slides.length, finishTest]);

  const handleTimeout = useCallback(() => {
    const newAnswers = answers.map((a, i) => i === currentIdx ? { ...a, submitted: true, matchScore: 0 } : a);
    setAnswers(newAnswers);
    setStreak(0);
    setProgress(prev => ({ ...prev, [slides[currentIdx].id]: { completed: true, stars: 0 } }));
    if (currentIdx < slides.length - 1) {
      setTimeout(() => {
        setCurrentIdx(idx => idx + 1);
        setTimeLeft(BASE_TIME_PER_SLIDE);
      }, 500);
    } else {
      finishTest();
    }
  }, [answers, currentIdx, slides, finishTest]);

  const setOption = useCallback((origIdx: number) => {
    setAnswers(prev => prev.map((a, i) => i === currentIdx ? { ...a, selectedOption: origIdx } : a));
  }, [currentIdx]);

  const setPoints = useCallback((val: string) => {
    setAnswers(prev => prev.map((a, i) => i === currentIdx ? { ...a, points: val } : a));
  }, [currentIdx]);

  const resetCurrent = useCallback(() => {
    setAnswers(prev => prev.map((a, i) => i === currentIdx ? { selectedOption: null, points: "", submitted: false, matchScore: 0 } : a));
    setProgress(prev => { const { [slides[currentIdx]?.id]: _, ...rest } = prev; return rest; });
  }, [currentIdx, slides]);

  const startChallenge = useCallback(() => {
    setShowInstructions(false);
    setScreen("lab");
    setCurrentIdx(0);
    setTimeLeft(BASE_TIME_PER_SLIDE);
    setTimerActive(true);
  }, []);

  const currentSlide = slides[currentIdx];
  const currentAnswer = answers[currentIdx] ?? { selectedOption: null, points: "", submitted: false, matchScore: 0 };

  const shuffledOptions = useMemo(() => {
    if (!currentSlide) return [];
    return shuffle(currentSlide.options.map((text, origIdx) => ({ text, origIdx })));
  }, [currentSlide?.id]);

  const isUnlocked = useCallback((idx: number) => {
    if (idx === 0) return true;
    for (let i = 0; i < idx; i++) {
      if (!progress[slides[i]?.id]?.completed) return false;
    }
    return true;
  }, [progress, slides]);

  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const totalStars = Object.values(progress).reduce((sum, p) => sum + p.stars, 0);
  const finalCorrectCount = answers.filter((a, i) => a.submitted && slides[i]?.options[a.selectedOption!] === slides[i]?.title).length;
  const accuracyPct = slides.length ? Math.round((finalCorrectCount / slides.length) * 100) : 0;

  // ── RENDER ──────────────────────────────────────────────
  return (
    <section className="min-h-screen relative font-body" style={{ background: PAPER, color: INK }}>
      <GlobalStyle />

      {/* Ambient background icons */}
      {BG_ICONS.map(({ Icon, top, left, size, rot }, i) => (
        <div
          key={i}
          className="fixed pointer-events-none z-0 hidden sm:block"
          style={{ top, left, color: i % 2 === 0 ? VIOLET : ROSE, opacity: 0.12, ["--r" as any]: `${rot}deg`, animation: `spot-float ${5 + i}s ease-in-out infinite` }}
        >
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      <AnimatePresence>{toast && <Toast message={toast.message} icon={toast.icon} />}</AnimatePresence>
      <AnimatePresence>{showConfetti && <Confetti key="confetti" />}</AnimatePresence>
      <AnimatePresence>{levelUpTo && <LevelUpModal level={levelUpTo} onClose={() => setLevelUpTo(null)} />}</AnimatePresence>
      <AnimatePresence>
        {reviewPopup && (
          <ReviewPopup
            slideTitle={reviewPopup.slideTitle}
            userText={reviewPopup.userText}
            expected={reviewPopup.expected}
            matchScore={reviewPopup.matchScore}
            onClose={closeReviewPopup}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>{showInstructions && <TestInstructions onClose={startChallenge} />}</AnimatePresence>

      {/* Header HUD */}
      <div className="sticky top-0 z-40 pt-10 backdrop-blur-xl border-b" style={{ background: "rgba(251,247,241,0.85)", borderColor: "#EEE4D6" }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          <Link href="/spotting" className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 sm:p-2 rounded-xl text-white" style={{ background: GRAD_FLAT }}><MicIcon size={18} /></div>
            <span className="font-black text-base sm:text-lg hidden sm:block font-display" style={{ color: INK }}>Pathology Spotting</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <XPBar xp={xp} />
            <ComboBadge streak={streak} />
          </div>
        </div>
      </div>

      {/* MAP SCREEN */}
      {screen === "map" && slides.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 py-10 relative z-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3" style={{ background: ROSE_SOFT, color: VIOLET }}>
              <Microscope size={12} /> Specimen Trail
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-display" style={{ color: INK }}>Spotting Challenge</h1>
            <p className="text-sm font-medium mt-1" style={{ color: INK_SOFT }}>Complete all {slides.length} slides to become a Pathology Pro.</p>
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: TEAL_SOFT, color: TEAL }}>
              <CheckCircle size={13} /> {completedCount}/{slides.length} slides
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: AMBER_SOFT, color: "#9A6E15" }}>
              <Star size={13} fill="#9A6E15" /> {totalStars}/{slides.length * 3} stars
            </div>
          </div>

          <div className="relative flex flex-col gap-9 py-4">
            <div className="absolute left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 z-0" style={{ background: "repeating-linear-gradient(to bottom, #D9C7B3 0, #D9C7B3 6px, transparent 6px, transparent 12px)" }} />
            {slides.map((s, idx) => (
              <CaseNode key={s.id} slide={s} index={idx} unlocked={isUnlocked(idx)} prog={progress[s.id]}
                onSelect={() => { setCurrentIdx(idx); setScreen("lab"); setTimeLeft(BASE_TIME_PER_SLIDE); setTimerActive(true); }} />
            ))}
          </div>
        </div>
      )}

      {/* LAB SCREEN */}
      {screen === "lab" && currentSlide && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10 pb-28 lg:pb-6">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 space-y-4 lg:col-span-1 h-fit order-2 lg:order-1">
            <div className="bg-white rounded-2xl p-4 shadow-sm border flex flex-col items-center" style={{ borderColor: "#EEE4D6" }}>
              <TimerRing timeLeft={timeLeft} timeLimit={BASE_TIME_PER_SLIDE} />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "#EEE4D6" }}>
              <p className="text-xs font-bold uppercase font-lab" style={{ color: INK_SOFT }}>Slide {currentIdx + 1} of {slides.length}</p>
              <h3 className="font-bold text-lg mt-1 font-display" style={{ color: currentAnswer.submitted ? INK : INK_SOFT }}>
                {currentAnswer.submitted ? currentSlide.title : "Unidentified Specimen"}
              </h3>
              {currentAnswer.submitted && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1" style={{ background: ROSE_SOFT, color: VIOLET }}>{currentSlide.category}</span>
              )}
            </div>
            <button onClick={resetCurrent} className="hidden lg:flex items-center justify-between bg-white border rounded-2xl p-3 w-full hover:bg-[#FBF3E9] transition-colors" style={{ borderColor: "#EEE4D6" }}>
              <div className="flex items-center gap-2"><RotateCcw size={16} style={{ color: INK_SOFT }} /><span className="text-sm font-semibold" style={{ color: INK }}>Reset This Slide</span></div>
            </button>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-4 order-1 lg:order-2">
            <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "#EEE4D6" }}>
              <ImageGallery images={currentSlide.images} poUrl={currentSlide.pathologyOutlinesUrl} />
            </div>

            {/* MCQ */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "#EEE4D6" }}>
              <h3 className="text-sm font-extrabold mb-3 flex items-center gap-2 font-display" style={{ color: INK }}>
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold text-white shrink-0" style={{ background: GRAD_FLAT }}>?</span>
                Identify this slide:
              </h3>
              <div className="space-y-2">
                {shuffledOptions.map(({ text, origIdx }, i) => {
                  const isSelected = currentAnswer.selectedOption === origIdx;
                  const isCorrectOpt = origIdx === currentSlide.correctOptionIndex;
                  let state = "default";
                  if (currentAnswer.submitted) {
                    if (isCorrectOpt) state = "correct";
                    else if (isSelected) state = "wrong";
                  } else if (isSelected) state = "selected";

                  const styles: Record<string, { border: string; bg: string; text: string; opacity?: number }> = {
                    correct: { border: TEAL, bg: TEAL_SOFT, text: TEAL },
                    wrong: { border: RED, bg: RED_SOFT, text: RED },
                    selected: { border: VIOLET, bg: ROSE_SOFT, text: INK },
                    default: currentAnswer.submitted
                      ? { border: "#EEE4D6", bg: "#FAF6EF", text: INK, opacity: 0.4 }
                      : { border: "#E9DCC7", bg: "#fff", text: INK },
                  };
                  const st = styles[state];

                  return (
                    <label key={origIdx} onClick={() => setOption(origIdx)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 ${currentAnswer.submitted ? "cursor-default" : "cursor-pointer"}`}
                      style={{ borderColor: st.border, background: st.bg, opacity: st.opacity ?? 1 }}>
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 font-lab"
                        style={{ background: state === "default" ? "#F1E9DE" : "#fff", color: state === "default" ? INK_SOFT : st.text, border: `1px solid ${st.border}` }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm font-semibold flex-1" style={{ color: st.text }}>{text}</span>
                      {currentAnswer.submitted && state === "correct" && <CheckCircle className="w-4 h-4 shrink-0" style={{ color: TEAL }} />}
                      {currentAnswer.submitted && state === "wrong" && <XCircle className="w-4 h-4 shrink-0" style={{ color: RED }} />}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Points of Recognition */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border" style={{ borderColor: "#EEE4D6" }}>
              <h3 className="text-sm font-extrabold mb-1 flex items-center gap-2 font-display" style={{ color: INK }}>
                <BookOpen className="w-4 h-4" style={{ color: ROSE }} /> Points of Recognition
              </h3>
              <p className="text-xs mb-3" style={{ color: INK_SOFT, opacity: 0.8 }}>Write the key microscopic features you used to identify this slide.</p>
              <textarea value={currentAnswer.points} onChange={e => setPoints(e.target.value)}
                rows={6} disabled={currentAnswer.submitted}
                placeholder="e.g., Neutrophil exudate, hyperplastic follicles, etc."
                className="w-full px-3 py-3 border-2 rounded-xl focus:outline-none text-sm resize-none transition-colors font-body"
                style={{ borderColor: "#E9DCC7", color: INK, background: currentAnswer.submitted ? "#FAF6EF" : "#fff" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = VIOLET)}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#E9DCC7")}
              />
              {!currentAnswer.submitted ? (
                <button onClick={(e) => handleSubmit(e)}
                  className="hidden lg:block mt-3 w-full py-3.5 rounded-xl text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                  style={{ background: GRAD_FLAT }}>
                  Submit Answer
                </button>
              ) : (
                <div className="mt-3">
                  {(() => {
                    const tone = scoreTone(currentAnswer.matchScore);
                    return (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold" style={{ color: INK_SOFT }}>Match Score</span>
                          <span className="text-base font-extrabold px-3 py-1 rounded-xl border font-lab" style={{ color: tone.fg, background: tone.bg, borderColor: tone.border }}>
                            {currentAnswer.matchScore}%
                          </span>
                        </div>
                        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: PAPER_MUTED }}>
                          <motion.div className="h-full rounded-full" style={{ background: GRAD_FLAT }}
                            initial={{ width: 0 }} animate={{ width: `${currentAnswer.matchScore}%` }} transition={{ duration: 0.7 }} />
                        </div>
                        <p className="text-xs mt-2" style={{ color: INK_SOFT, opacity: 0.85 }}>{scoreLabel(currentAnswer.matchScore)}</p>
                      </>
                    );
                  })()}
                  <details className="mt-3 group">
                    <summary className="text-xs font-bold cursor-pointer flex items-center gap-1 select-none" style={{ color: ROSE }}>
                      Show expected features <ChevronDown size={13} className="transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="mt-2 text-xs space-y-1.5" style={{ color: INK_SOFT }}>
                      {currentSlide.definition.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: ROSE }} />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky mobile submit bar (visible only when unsubmitted, on lab screen) */}
      {screen === "lab" && currentSlide && !currentAnswer.submitted && (
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden p-3 backdrop-blur-xl border-t" style={{ background: "rgba(251,247,241,0.92)", borderColor: "#EEE4D6" }}>
          <div className="flex gap-2 max-w-7xl mx-auto">
            <button onClick={resetCurrent} className="px-4 py-3 rounded-xl border bg-white" style={{ borderColor: "#E9DCC7" }}>
              <RotateCcw size={16} style={{ color: INK_SOFT }} />
            </button>
            <button onClick={(e) => handleSubmit(e)} className="flex-1 py-3 rounded-xl text-white font-extrabold text-sm shadow-md active:scale-[0.98] transition-transform" style={{ background: GRAD_FLAT }}>
              Submit Answer
            </button>
          </div>
        </div>
      )}

      {/* RESULT SCREEN */}
      {screen === "result" && (
        <div className="max-w-4xl mx-auto px-4 py-10 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-xl border overflow-hidden" style={{ borderColor: "#EEE4D6" }}>
            <div className="px-6 sm:px-8 pt-8 pb-6 text-center text-white" style={{ background: GRAD_FLAT }}>
              <Trophy size={44} className="mx-auto mb-3" />
              <h2 className="text-2xl font-black font-display">Challenge Complete!</h2>
              <p className="text-white/80 text-sm mt-1">Nice work — here's how your specimen trail went.</p>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-3 gap-3 sm:gap-4 -mt-2">
                <AccuracyRing pct={accuracyPct} label="Accuracy" color={accuracyPct >= 75 ? TEAL : accuracyPct >= 40 ? AMBER : RED} />
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5">
                    <Flame size={22} style={{ color: ROSE }} />
                    <span className="font-lab font-black text-2xl" style={{ color: ROSE }}>{bestStreak}</span>
                  </div>
                  <p className="text-center text-[10px] font-bold uppercase tracking-wide mt-1" style={{ color: INK_SOFT }}>Best Streak</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center gap-1.5">
                    <Zap size={22} style={{ color: VIOLET }} />
                    <span className="font-lab font-black text-2xl" style={{ color: VIOLET }}>{xp}</span>
                  </div>
                  <p className="text-center text-[10px] font-bold uppercase tracking-wide mt-1" style={{ color: INK_SOFT }}>XP Earned</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
                <div className="rounded-2xl p-4" style={{ background: TEAL_SOFT }}>
                  <p className="text-2xl font-black font-lab" style={{ color: TEAL }}>{finalCorrectCount}/{slides.length}</p>
                  <p className="text-xs font-semibold" style={{ color: TEAL }}>Correct</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: AMBER_SOFT }}>
                  <p className="text-2xl font-black font-lab" style={{ color: "#9A6E15" }}>{totalStars}</p>
                  <p className="text-xs font-semibold" style={{ color: "#9A6E15" }}>Total Stars</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 justify-center">
                <button onClick={() => window.location.reload()} className="px-6 py-3 text-white font-bold rounded-xl shadow-md active:scale-[0.98] transition-transform" style={{ background: GRAD_FLAT }}>
                  Retry Challenge
                </button>
                <Link href="/spotting" className="px-6 py-3 border font-bold rounded-xl hover:bg-[#FBF3E9] transition-colors" style={{ borderColor: "#E9DCC7", color: INK }}>
                  Back to Spotting
                </Link>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4 font-display flex items-center gap-2" style={{ color: INK }}>
                  <Target size={18} style={{ color: ROSE }} /> Slide Details
                </h3>
                <div className="space-y-2.5">
                  {slides.map((s, i) => {
                    const ans = answers[i];
                    const isCorrect = ans?.submitted && s.options[ans.selectedOption!] === s.title;
                    return (
                      <div key={s.id} className="flex items-center gap-3 sm:gap-4 p-3 rounded-xl" style={{ background: PAPER_MUTED }}>
                        <div className="relative w-12 h-9 rounded-lg overflow-hidden shrink-0 border" style={{ borderColor: "#E9DCC7" }}>
                          <Image src={s.images[0].url} alt={s.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: INK }}>{s.title}</p>
                          <p className="text-xs truncate" style={{ color: INK_SOFT }}>
                            {ans?.submitted ? s.options[ans.selectedOption!] : "—"}
                            {!isCorrect && <span className="ml-2 font-semibold" style={{ color: TEAL }}>✓ {s.title}</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[...Array(3)].map((_, si) => (
                            <Star key={si} size={13} style={{ color: si < (progress[s.id]?.stars || 0) ? AMBER : "#E3D8C6" }} fill={si < (progress[s.id]?.stars || 0) ? AMBER : "#E3D8C6"} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-6">
            <ReferencesBlock />
          </div>
        </div>
      )}
    </section>
  );
}