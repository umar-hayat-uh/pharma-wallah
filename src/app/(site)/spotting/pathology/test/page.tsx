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
  MapPin, Crosshair, Eye, Check, Layers, Trash2, Loader2, Bot,
} from "lucide-react";
import { useTracker } from "@/hooks/useTracker";

// ══════════════════════════════════════════════════════════════════════════════
//  DESIGN TOKENS — Histology Stain Palette
// ══════════════════════════════════════════════════════════════════════════════
const INK = "#241C28";
const INK_SOFT = "#5B4F63";
const PAPER = "#FBF7F1";
const PAPER_MUTED = "#F1E9DE";
const VIOLET = "#4C2E7A";
const VIOLET_DEEP = "#331F54";
const ROSE = "#E14B72";
const ROSE_SOFT = "#FCE4EA";
const TEAL = "#12876F";
const TEAL_SOFT = "#DEF3EE";
const AMBER = "#DB9A34";
const AMBER_SOFT = "#FBEDD3";
const RED = "#D14545";
const RED_SOFT = "#FBE3E3";
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

interface SlideHotspot {
  id: string;
  tag: string;
  label: string;
  description: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  radius: number; // percentage radius tolerance
}

interface UserPin {
  id: string;
  x: number;
  y: number;
  label: string;
  isHit?: boolean;
  matchedHotspot?: SlideHotspot;
}

interface AiEvaluationResult {
  semanticScore: number;
  feedback: string;
  matchedConcepts: string[];
  missedConcepts: string[];
  examinerNote: string;
}

interface SlideAnswer {
  selectedOption: number | null;
  points: string;
  pins: UserPin[];
  submitted: boolean;
  matchScore: number;
  pinScore: number;
  aiResult?: AiEvaluationResult;
}

// ══════════════════════════════════════════════════════════════════════════════
//  DATASET WITH ROBOFLOW PIXEL COORDINATES CONVERTED TO RESPONSIVE PERCENTAGES
// ══════════════════════════════════════════════════════════════════════════════
const SLIDE_DATA = [
  {
    id: "hodgkin-lymphoma",
    title: "Hodgkin's Disease",
    category: "Haematological",
    pathologyOutlinesUrl: `${PO_BASE}/topic/lymphnodeshodgkin.html`,
    images: [
      { url: "/images/spotting/pathology/hodgkin-lymphoma.jpg" },
      { url: "/images/spotting/pathology/hodgkin-lymphoma-high.jpg" },
    ],
    options: ["Hodgkin's Disease", "Non-Hodgkin Lymphoma", "Reactive Lymphadenitis", "Metastatic Carcinoma"],
    correctOptionIndex: 0,
    definition: [
      "There is a presence of large binucleated or multinucleated RSC (Reed Sternberg Cell).",
      "It has a prominent eosinophilic nucleoli in each nucleus.",
      "It has abundant eosinophilic cytoplasm.",
      "It is derived from the germinal disc of B-cells.",
    ],
    hotspots: [
      { id: "hodgkin_001", tag: "candidate_reed_sternberg_like_cell", label: "Reed-Sternberg-like atypical cell 1", description: "Large binucleated atypical cell with prominent owl-eye nucleolus.", x: 44, y: 47, radius: 16 },
      { id: "hodgkin_002", tag: "candidate_large_atypical_cell", label: "Candidate large atypical cell 2", description: "Atypical mononuclear Hodgkin cell candidate.", x: 20, y: 59, radius: 15 },
      { id: "hodgkin_003", tag: "candidate_large_atypical_cell", label: "Candidate large atypical cell 3", description: "Peripherally located atypical neoplastic cell.", x: 73, y: 83, radius: 15 },
    ],
    keyFeatures: ["Reed-Sternberg-like cell", "Owl-eye eosinophilic nucleoli", "Mixed reactive inflammatory background", "Large atypical Hodgkin cell"],
  },
  {
    id: "gastritis",
    title: "Gastritis",
    category: "GI Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/stomachHelicobacter.html`,
    images: [
      { url: "/images/spotting/pathology/gastritis.jpg" },
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
    hotspots: [
      { id: "gastritis_001", tag: "foveolar_epithelium", label: "Foveolar epithelial structure", description: "Surface foveolar mucus-secreting epithelial lining.", x: 54, y: 35, radius: 16 },
      { id: "gastritis_002", tag: "congested_capillary", label: "Congested capillary", description: "Erythrocyte-filled hyperemic mucosal microvessel.", x: 70, y: 33, radius: 14 },
      { id: "gastritis_003", tag: "lamina_propria_inflammatory_infiltrate", label: "Lamina propria inflammatory infiltrate", description: "Dense chronic lymphoplasmacytic infiltrate expanding the lamina propria.", x: 32, y: 59, radius: 18 },
      { id: "gastritis_004", tag: "deep_gastric_gland", label: "Deep gastric gland structure", description: "Base of gastric pits and oxyntic/mucous neck glands.", x: 66, y: 73, radius: 16 },
      { id: "gastritis_005", tag: "surface_exudate_debris", label: "Surface fibrinous/cellular debris", description: "Luminal exudate containing shed epithelial cells and neutrophils.", x: 78, y: 15, radius: 14 },
    ],
    keyFeatures: ["Foveolar epithelium", "Lamina propria inflammatory infiltrate", "Congested capillaries", "Deep gastric glands", "Surface exudate"],
  },
  {
    id: "fatty-liver",
    title: "Fatty Liver",
    category: "Hepatic Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/liversteatosis.html`,
    images: [
      { url: "/images/spotting/pathology/fatty-liver.jpg" },
      { url: "/images/spotting/pathology/fatty-liver-high.jpg" },
    ],
    options: ["Fatty Liver", "Cirrhosis", "Hepatitis", "Chronic Venous Congestion"],
    correctOptionIndex: 0,
    definition: [
      "central vein is dilated.",
      "Balloon shaped hepatocytes are present.",
      "Fatty cells are present.",
    ],
    hotspots: [
      { id: "fatty_liver_001", tag: "large_lipid_vacuole", label: "Large clear lipid vacuole 1", description: "Macrovesicular steatosis with clear cytoplasmic fat droplet.", x: 17, y: 49, radius: 15 },
      { id: "fatty_liver_002", tag: "large_lipid_vacuole", label: "Large clear lipid vacuole 2", description: "Abundant intracytoplasmic lipid accumulation.", x: 91, y: 75, radius: 15 },
      { id: "fatty_liver_003", tag: "compressed_hepatocyte_nucleus", label: "Compressed peripheral nucleus", description: "Hepatocyte nucleus displaced and flattened against cell membrane.", x: 47, y: 50, radius: 14 },
      { id: "fatty_liver_004", tag: "sinusoidal_erythrocyte_focus", label: "Sinusoidal erythrocyte focus 1", description: "Compressed hepatic sinusoid with red blood cells.", x: 12, y: 86, radius: 14 },
      { id: "fatty_liver_005", tag: "sinusoidal_erythrocyte_focus", label: "Sinusoidal erythrocyte focus 2", description: "Hepatic cord sinusoidal microcirculation.", x: 21, y: 32, radius: 14 },
    ],
    keyFeatures: ["Macrovesicular lipid vacuoles", "Compressed peripheral hepatocyte nucleus", "Ballooned hepatocytes", "Sinusoidal erythrocyte foci"],
  },
  {
    id: "tb-granuloma",
    title: "TB Granuloma",
    category: "Inflammatory",
    pathologyOutlinesUrl: `${PO_BASE}/topic/lymphnodestuberculosis.html`,
    images: [
      { url: "/images/spotting/pathology/tb-granuloma.jpg" },
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
    hotspots: [
      { id: "tb_granuloma_001", tag: "candidate_multinucleated_giant_cell", label: "Multinucleated giant cell (Langhans)", description: "Horseshoe arrangement of peripheral nuclei.", x: 31, y: 71, radius: 16 },
      { id: "tb_granuloma_002", tag: "candidate_multinucleated_giant_cell", label: "Pale multinucleated giant cell", description: "Large epithelioid macrophage fusion cell.", x: 23, y: 51, radius: 16 },
      { id: "tb_granuloma_003", tag: "multinucleated_cell_cluster", label: "Multinucleated-cell cluster", description: "Clustered histiocytes at the edge of the granuloma.", x: 9, y: 33, radius: 15 },
      { id: "tb_granuloma_004", tag: "acellular_necrotic_appearing_zone", label: "Acellular caseous necrotic zone", description: "Structureless, eosinophilic central caseous necrosis.", x: 78, y: 20, radius: 18 },
    ],
    keyFeatures: ["Multinucleated Langhans giant cells", "Central caseous necrosis", "Epithelioid histiocyte rim", "Peripheral lymphocyte cuff"],
  },
  {
    id: "cvc-liver",
    title: "Chronic Venous Congestion (Liver)",
    category: "Hepatic Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/livercongestiveheart.html`,
    images: [
      { url: "/images/spotting/pathology/cvc-liver.jpg" },
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
    hotspots: [
      { id: "cvc_liver_001", tag: "large_vascular_lumen", label: "Central vein / dilated vascular lumen", description: "Engorged centrilobular terminal hepatic venule.", x: 40, y: 61, radius: 18 },
      { id: "cvc_liver_002", tag: "congested_sinusoid", label: "Dilated congested sinusoid", description: "Sinusoids distended with densely packed red blood cells.", x: 73, y: 50, radius: 16 },
      { id: "cvc_liver_003", tag: "hepatic_cord", label: "Preserved hepatic cord", description: "Viable cords of hepatocytes with eosinophilic cytoplasm.", x: 73, y: 22, radius: 16 },
      { id: "cvc_liver_004", tag: "perivenular_congestion", label: "Perivenular hemorrhagic necrosis", description: "Centrilobular cell death from severe congestion and hypoxia.", x: 67, y: 82, radius: 16 },
      { id: "cvc_liver_005", tag: "attenuated_hepatocyte_cord", label: "Attenuated hepatocyte cord", description: "Compressed liver plate between congested sinusoids.", x: 49, y: 46, radius: 15 },
    ],
    keyFeatures: ["Dilated central veins", "Congested sinusoids", "Perivenular hemorrhagic necrosis", "Preserved periportal cords"],
  },
  {
    id: "chronic-cholecystitis",
    title: "Chronic Cholecystitis",
    category: "Hepatobiliary",
    pathologyOutlinesUrl: `${PO_BASE}/topic/gallbladderchroniccholecystitis.html`,
    images: [
      { url: "/images/spotting/pathology/chronic-cholecystitis.jpg" },
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
    hotspots: [
      { id: "cholecystitis_001", tag: "mucosal_gland_cluster", label: "Deep mucosal-gland / RAS sinus", description: "Epithelium outpouching (Rokitansky-Aschoff sinus) deep in wall.", x: 18, y: 43, radius: 16 },
      { id: "cholecystitis_002", tag: "columnar_epithelial_lining", label: "Columnar epithelial lining", description: "Tall columnar surface mucosal epithelium.", x: 88, y: 21, radius: 15 },
      { id: "cholecystitis_003", tag: "chronic_inflammatory_infiltrate", label: "Chronic inflammatory infiltrate", description: "Lymphocytic and plasma cell infiltrate in the lamina propria.", x: 35, y: 59, radius: 16 },
      { id: "cholecystitis_004", tag: "fibromuscular_stroma", label: "Fibromuscular stroma hypertrophy", description: "Thickened smooth muscle with fibrosis.", x: 3, y: 64, radius: 18 },
      { id: "cholecystitis_005", tag: "mucosal_fold", label: "Mucosal projection / fold", description: "Blunted mucosal architecture.", x: 63, y: 51, radius: 15 },
    ],
    keyFeatures: ["Rokitansky–Aschoff Sinuses (RAS)", "Columnar epithelial lining", "Chronic inflammatory infiltrate", "Fibromuscular hypertrophy"],
  },
  {
    id: "bph",
    title: "Benign Prostatic Hyperplasia",
    category: "Urological",
    pathologyOutlinesUrl: `${PO_BASE}/topic/prostateBPH.html`,
    images: [
      { url: "/images/spotting/pathology/bph.jpg" },
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
    hotspots: [
      { id: "bph_001", tag: "corpora_amylacea", label: "Corpora amylacea (Intraluminal body)", description: "Concentric laminated glycoprotein concretion in prostatic lumen.", x: 87, y: 16, radius: 15 },
      { id: "bph_002", tag: "dilated_glandular_lumen", label: "Dilated glandular lumen", description: "Cystically dilated hyperplastic prostatic gland.", x: 24, y: 55, radius: 18 },
      { id: "bph_003", tag: "fibromuscular_stroma", label: "Dense fibromuscular stroma", description: "Proliferating smooth muscle and collagenous stroma between glands.", x: 59, y: 88, radius: 16 },
      { id: "bph_004", tag: "papillary_epithelial_infolding", label: "Papillary epithelial infolding", description: "Papillary projections lined by dual columnar and basal cells.", x: 61, y: 41, radius: 16 },
      { id: "bph_005", tag: "corpora_amylacea_cluster", label: "Corpora amylacea cluster", description: "Multiple inspissated prostatic luminal secretions.", x: 80, y: 66, radius: 15 },
    ],
    keyFeatures: ["Corpora amylacea", "Dilated cystic glands", "Papillary infoldings", "Fibromuscular stroma", "Double-layered epithelium"],
  },
  {
    id: "lipoma",
    title: "Lipoma",
    category: "Soft Tissue Tumour",
    pathologyOutlinesUrl: `${PO_BASE}/topic/softtissuelipoma.html`,
    images: [
      { url: "/images/spotting/pathology/lipoma.jpg" },
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
    hotspots: [
      { id: "lipoma_001", tag: "blood_vessel", label: "Blood vessel cross-section", description: "Capillary vessel traversing fibrovascular septum.", x: 8, y: 10, radius: 14 },
      { id: "lipoma_002", tag: "fibrous_septum", label: "Fibrous septum 1", description: "Delicate collagenous septum dividing fat lobules.", x: 18, y: 53, radius: 15 },
      { id: "lipoma_003", tag: "fibrous_septum", label: "Fibrous septum 2", description: "Fibrovascular network supporting adipocytes.", x: 73, y: 55, radius: 15 },
      { id: "lipoma_004", tag: "mature_adipocyte", label: "Mature adipocyte 1", description: "Large clear cell with dissolved lipid and eccentric nucleus.", x: 56, y: 26, radius: 16 },
      { id: "lipoma_005", tag: "mature_adipocyte", label: "Mature adipocyte 2", description: "Benign univacuolar mature fat cell.", x: 20, y: 49, radius: 16 },
    ],
    keyFeatures: ["Mature adipocytes", "Clear lipid cytoplasm", "Delicate fibrous septa", "Vascular capillaries", "No cytologic atypia"],
  },
  {
    id: "carcinoma-in-situ",
    title: "Carcinoma In Situ",
    category: "Cervical Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/cervixcarcinomainsitu.html`,
    images: [
      { url: "/images/spotting/pathology/carcinoma-in-situ.jpg" },
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
    hotspots: [
      { id: "cis_mid_001", tag: "basophilic_intraluminal_debris", label: "Basophilic intraluminal debris / calcification", description: "Necrotic apoptotic cellular debris in glandular crypt.", x: 43, y: 23, radius: 15 },
      { id: "cis_mid_002", tag: "epithelial_cellular_bridge", label: "Epithelial cellular bridge", description: "Atypical bridges across glandular spaces (SMILE pattern).", x: 47, y: 45, radius: 15 },
      { id: "cis_mid_003", tag: "cribriform_lumen", label: "Cribriform-type lumen", description: "Back-to-back glandular architecture without stromal invasion.", x: 65, y: 40, radius: 16 },
      { id: "cis_mid_004", tag: "hyperchromatic_cellular_focus", label: "Hyperchromatic atypical cellular focus", description: "Pleomorphic nuclei with increased N:C ratio and loss of polarity.", x: 25, y: 52, radius: 15 },
      { id: "cis_mid_005", tag: "epithelial_nest_lumen", label: "Epithelial nest lumen", description: "Expanded endocervical crypt filled with atypical cells.", x: 27, y: 64, radius: 15 },
    ],
    keyFeatures: ["Full-thickness atypia", "Loss of stratification", "Cribriform lumens", "Basophilic debris", "Intact basement membrane"],
  },
  {
    id: "peptic-ulcer",
    title: "Peptic Ulcer",
    category: "GI Pathology",
    pathologyOutlinesUrl: `${PO_BASE}/topic/stomachpepticulcer.html`,
    images: [
      { url: "/images/spotting/pathology/peptic-ulcer.jpg" },
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
    hotspots: [
      { id: "peptic_ulcer_001", tag: "mucosal_epithelial_margin", label: "Mucosal epithelial margin", description: "Sharply demarcated ulcer edge with regenerating epithelium.", x: 22, y: 30, radius: 16 },
      { id: "peptic_ulcer_002", tag: "subepithelial_inflammatory_infiltrate", label: "Subepithelial inflammatory infiltrate", description: "Neutrophils, lymphocytes, and plasma cells in the submucosa.", x: 8, y: 83, radius: 16 },
      { id: "peptic_ulcer_003", tag: "surface_fibrinous_debris", label: "Surface fibrinous & necrotic debris", description: "Superficial fibrinopurulent exudate zone.", x: 60, y: 33, radius: 18 },
      { id: "peptic_ulcer_004", tag: "granulation_tissue", label: "Granulation & fibrous tissue bed", description: "Proliferating capillaries and fibroblasts in ulcer floor.", x: 57, y: 68, radius: 16 },
      { id: "peptic_ulcer_005", tag: "congested_blood_vessel", label: "Congested blood vessel focus", description: "Thrombosed or dilated vessels at the base prone to bleeding.", x: 83, y: 59, radius: 15 },
    ],
    keyFeatures: ["Mucosal margin breakdown", "Surface fibrinous debris", "Granulation tissue base", "Subepithelial inflammation", "Congested blood vessels"],
  },
];

type Slide = typeof SLIDE_DATA[number];

function evaluatePinAccuracy(pins: UserPin[], hotspots: SlideHotspot[]): { hits: number; score: number; evaluatedPins: UserPin[] } {
  if (!pins.length || !hotspots.length) return { hits: 0, score: 0, evaluatedPins: pins };

  let hitCount = 0;
  const evaluated = pins.map((p) => {
    const matched = hotspots.find((h) => {
      const dx = p.x - h.x;
      const dy = p.y - h.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= h.radius;
    });

    if (matched) {
      hitCount++;
      return { ...p, isHit: true, matchedHotspot: matched };
    }
    return { ...p, isHit: false };
  });

  const score = Math.min(100, Math.round((hitCount / hotspots.length) * 100));
  return { hits: hitCount, score, evaluatedPins: evaluated };
}

// ══════════════════════════════════════════════════════════════════════════════
//  INTERACTIVE SLIDE VIEWER
// ══════════════════════════════════════════════════════════════════════════════
function InteractiveSlideViewer({
  slide, pins, onAddPin, onRemovePin, submitted, onInsertPinsToNotes,
}: {
  slide: Slide;
  pins: UserPin[];
  onAddPin: (p: UserPin) => void;
  onRemovePin: (id: string) => void;
  submitted: boolean;
  onInsertPinsToNotes: () => void;
}) {
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [toolMode, setToolMode] = useState<"pin" | "loupe">("pin");
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [activePinDraft, setActivePinDraft] = useState<{ x: number; y: number } | null>(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [showHotspots, setShowHotspots] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeImage = slide.images[activeImgIdx] || slide.images[0];

  useEffect(() => {
    setActiveImgIdx(0);
    setActivePinDraft(null);
  }, [slide.id]);

  useEffect(() => {
    if (submitted) setShowHotspots(true);
  }, [submitted]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (submitted || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setActivePinDraft({ x, y });
    setSelectedTag(slide.hotspots[pins.length % slide.hotspots.length]?.label || slide.keyFeatures[0]);
    setCustomTag("");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setHoverPos({ x, y });
  };

  const handleSavePin = () => {
    if (!activePinDraft) return;
    const label = customTag.trim() || selectedTag.trim() || `Landmark #${pins.length + 1}`;
    onAddPin({
      id: `pin-${Date.now()}-${Math.random()}`,
      x: activePinDraft.x,
      y: activePinDraft.y,
      label,
    });
    setActivePinDraft(null);
  };

  return (
    <div className="space-y-3">
      {/* Top Banner Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-white border" style={{ borderColor: "#EEE4D6" }}>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[11px] font-bold" style={{ background: GRAD_FLAT }}>1</span>
          <div>
            <span className="text-xs font-bold font-display" style={{ color: INK }}>Visual Spotting & Pinning</span>
            <p className="text-[10px] text-gray-500">Click anywhere on the slide to spot landmarks</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!submitted && (
            <>
              <button
                type="button"
                onClick={() => setToolMode("pin")}
                className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                style={{
                  background: toolMode === "pin" ? VIOLET : PAPER_MUTED,
                  color: toolMode === "pin" ? "#fff" : INK_SOFT,
                }}
              >
                <MapPin size={12} /> Pin
              </button>
              <button
                type="button"
                onClick={() => setToolMode("loupe")}
                className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                style={{
                  background: toolMode === "loupe" ? VIOLET : PAPER_MUTED,
                  color: toolMode === "loupe" ? "#fff" : INK_SOFT,
                }}
              >
                <Eye size={12} /> 2.5× Loupe
              </button>
            </>
          )}

          {submitted && (
            <button
              type="button"
              onClick={() => setShowHotspots(!showHotspots)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border"
              style={{
                background: showHotspots ? TEAL_SOFT : "#fff",
                color: showHotspots ? TEAL : INK_SOFT,
                borderColor: showHotspots ? TEAL : "#E9DCC7",
              }}
            >
              <Layers size={12} /> {showHotspots ? "Hide Target Zones" : "Show Target Zones"}
            </button>
          )}
        </div>
      </div>

      {/* Main Slide Frame */}
      <div className="relative rounded-2xl border overflow-hidden shadow-sm select-none" style={{ borderColor: "#E9DCC7", background: "#FAF7F2" }}>
        <div
          ref={containerRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPos(null)}
          className={`relative w-full h-[300px] sm:h-[360px] overflow-hidden ${toolMode === "pin" && !submitted ? "cursor-crosshair" : "cursor-default"}`}
        >
          <Image
            src={activeImage.url}
            alt="Histology slide"
            fill
            priority
            className="object-contain pointer-events-none"
          />

          {/* Hover Crosshair */}
          {toolMode === "pin" && !submitted && hoverPos && (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
              style={{ left: `${hoverPos.x}%`, top: `${hoverPos.y}%` }}
            >
              <div className="w-10 h-10 rounded-full border border-dashed border-[#4C2E7A]/80 animate-spin" style={{ animationDuration: "12s" }} />
              <div className="absolute w-2 h-2 rounded-full bg-[#E14B72]" />
            </div>
          )}

          {/* 2.5x Loupe Magnifier */}
          {toolMode === "loupe" && !submitted && hoverPos && (
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white shadow-2xl overflow-hidden z-30 ring-2 ring-[#4C2E7A]/70"
              style={{
                left: `${hoverPos.x}%`,
                top: `${hoverPos.y}%`,
                backgroundImage: `url(${activeImage.url})`,
                backgroundPosition: `${hoverPos.x}% ${hoverPos.y}%`,
                backgroundSize: "260%",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              </div>
            </div>
          )}

          {/* TARGET HOTSPOTS (Revealed on submit) */}
          {submitted && showHotspots && slide.hotspots.map((hs) => (
            <div
              key={hs.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
            >
              <div
                className="rounded-full border-2 border-dashed flex items-center justify-center animate-pulse"
                style={{
                  width: `${hs.radius * 2.2}%`,
                  height: `${hs.radius * 2.2}%`,
                  minWidth: 48,
                  minHeight: 48,
                  borderColor: TEAL,
                  background: "rgba(18, 135, 111, 0.18)",
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: TEAL }} />
              </div>

              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col bg-gray-900/95 text-white p-2 rounded-xl text-xs w-44 shadow-xl z-40">
                <span className="font-bold text-teal-300">✓ {hs.label}</span>
                <span className="text-[10px] text-gray-300 mt-0.5">{hs.description}</span>
              </div>
            </div>
          ))}

          {/* USER DROPPED PINS */}
          {pins.map((pin) => (
            <motion.div
              key={pin.id}
              initial={{ scale: 0, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              className="absolute z-20 -translate-x-1/2 -translate-y-full cursor-pointer group"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              onClick={(e) => { e.stopPropagation(); if (!submitted) onRemovePin(pin.id); }}
            >
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-lg border text-white font-extrabold text-[10px] font-lab"
                style={{
                  background: submitted ? (pin.isHit ? TEAL : RED) : GRAD_FLAT,
                  borderColor: "#fff",
                }}
              >
                <MapPin size={10} />
                <span className="max-w-[90px] truncate">{pin.label}</span>
                {!submitted && <X size={9} className="opacity-70 group-hover:opacity-100" />}
              </div>
              <div
                className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] mx-auto -mt-[1px]"
                style={{ borderTopColor: submitted ? (pin.isHit ? TEAL : RED) : ROSE }}
              />
            </motion.div>
          ))}

          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold pointer-events-none">
            📍 {pins.length} landmark{pins.length === 1 ? "" : "s"} pinned
          </div>
        </div>

        {/* PIN TAGGING MODAL */}
        <AnimatePresence>
          {activePinDraft && !submitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="p-3.5 bg-[#FAF4EA] border-t space-y-2"
              style={{ borderColor: "#E9DCC7" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1 font-display" style={{ color: INK }}>
                  <Sparkles size={13} style={{ color: ROSE }} /> Tag Identified Landmark at ({activePinDraft.x}%, {activePinDraft.y}%)
                </span>
                <button onClick={() => setActivePinDraft(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto spot-scroll">
                {slide.hotspots.map((hs) => (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => { setSelectedTag(hs.label); setCustomTag(""); }}
                    className="text-[11px] px-2.5 py-1 rounded-lg border font-semibold text-left transition-all"
                    style={{
                      background: selectedTag === hs.label ? VIOLET : "#fff",
                      color: selectedTag === hs.label ? "#fff" : INK,
                      borderColor: selectedTag === hs.label ? VIOLET : "#E3D5C0",
                    }}
                  >
                    {hs.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Or type custom note..."
                  value={customTag}
                  onChange={(e) => { setCustomTag(e.target.value); setSelectedTag(""); }}
                  className="flex-1 px-3 py-1.5 rounded-xl border text-xs bg-white"
                  style={{ borderColor: "#E3D5C0" }}
                />
                <button
                  type="button"
                  onClick={handleSavePin}
                  className="px-4 py-1.5 rounded-xl text-white font-bold text-xs shadow"
                  style={{ background: GRAD_FLAT }}
                >
                  Save Pin
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Magnification Controls & Quick Transfer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {slide.images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveImgIdx(i)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all"
              style={{
                background: i === activeImgIdx ? VIOLET : "#fff",
                color: i === activeImgIdx ? "#fff" : INK_SOFT,
                borderColor: i === activeImgIdx ? VIOLET : "#E9DCC7",
              }}
            >
              {i === 0 ? "Low ×10" : "High ×40"}
            </button>
          ))}
        </div>

        {!submitted && pins.length > 0 && (
          <button
            type="button"
            onClick={onInsertPinsToNotes}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-white flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            style={{ color: VIOLET, borderColor: "#F0CBD8" }}
          >
            <Sparkles size={12} style={{ color: ROSE }} />
            <span>Insert Pinned into Notes ({pins.length})</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function SpottingTestPage() {
  const { trackQuiz, trackActivity, trackTimeOnUnmount } = useTracker();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(SLIDE_DATA);
  const [isAiEvaluating, setIsAiEvaluating] = useState(false);
  const [answers, setAnswers] = useState<SlideAnswer[]>(() =>
    SLIDE_DATA.map(() => ({
      selectedOption: null,
      points: "",
      pins: [],
      submitted: false,
      matchScore: 0,
      pinScore: 0,
    }))
  );

  const currentSlide = slides[currentIdx];
  const currentAnswer = answers[currentIdx] || {
    selectedOption: null,
    points: "",
    pins: [],
    submitted: false,
    matchScore: 0,
    pinScore: 0,
  };

  const handleAddPin = (pin: UserPin) => {
    setAnswers((prev) =>
      prev.map((a, idx) => (idx === currentIdx ? { ...a, pins: [...a.pins, pin] } : a))
    );
  };

  const handleRemovePin = (id: string) => {
    setAnswers((prev) =>
      prev.map((a, idx) => (idx === currentIdx ? { ...a, pins: a.pins.filter((p) => p.id !== id) } : a))
    );
  };

  const handleInsertPinsToNotes = () => {
    if (!currentAnswer.pins.length) return;
    const pinText = currentAnswer.pins.map((p) => `• ${p.label}`).join("\n");
    const existing = currentAnswer.points.trim();
    const updated = existing ? `${existing}\n${pinText}` : pinText;
    setAnswers((prev) =>
      prev.map((a, idx) => (idx === currentIdx ? { ...a, points: updated } : a))
    );
  };

  // Submit Answer to AI Examiner Route
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentSlide || currentAnswer.submitted || isAiEvaluating) return;

    setIsAiEvaluating(true);

    try {
      const res = await fetch("/api/evaluate-histology", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slideTitle: currentSlide.title,
          expectedDefinition: currentSlide.definition,
          keyFeatures: currentSlide.keyFeatures,
          studentPoints: currentAnswer.points,
          studentPins: currentAnswer.pins,
        }),
      });

      const aiData: AiEvaluationResult = await res.json();
      const pinEval = evaluatePinAccuracy(currentAnswer.pins, currentSlide.hotspots);

      setAnswers((prev) =>
        prev.map((a, idx) =>
          idx === currentIdx
            ? {
              ...a,
              submitted: true,
              matchScore: aiData.semanticScore,
              pinScore: pinEval.score,
              pins: pinEval.evaluatedPins,
              aiResult: aiData,
            }
            : a
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < slides.length - 1) {
      setCurrentIdx((i) => i + 1);
    }
  };

  return (
    <section className="min-h-screen relative font-body p-4 sm:p-8" style={{ background: PAPER, color: INK }}>
      {/* Header HUD */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between border-b pb-4" style={{ borderColor: "#EEE4D6" }}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl text-white shadow" style={{ background: GRAD_FLAT }}>
            <MicIcon size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black font-display" style={{ color: INK }}>Pathology Spotting Lab</h1>
            <p className="text-xs text-gray-500">Interactive Slide Feature Pinning & AI Semantic Examiner</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full font-lab" style={{ background: ROSE_SOFT, color: VIOLET }}>
            Slide {currentIdx + 1} of {slides.length}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Slide */}
        <div className="lg:col-span-2 space-y-4">
          <InteractiveSlideViewer
            slide={currentSlide}
            pins={currentAnswer.pins}
            onAddPin={handleAddPin}
            onRemovePin={handleRemovePin}
            submitted={currentAnswer.submitted}
            onInsertPinsToNotes={handleInsertPinsToNotes}
          />
        </div>

        {/* Right Column: Diagnosis & AI Recognition Evaluator */}
        <div className="space-y-4">
          {/* MCQ Diagnosis */}
          <div className="bg-white rounded-2xl p-4 border shadow-sm" style={{ borderColor: "#EEE4D6" }}>
            <h3 className="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: INK }}>
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]" style={{ background: GRAD_FLAT }}>2</span>
              Identify Diagnosis
            </h3>
            <div className="space-y-1.5">
              {currentSlide.options.map((opt, i) => {
                const isSelected = currentAnswer.selectedOption === i;
                const isCorrect = i === currentSlide.correctOptionIndex;
                let bg = "#fff";
                let text = INK;
                let border = "#E9DCC7";

                if (currentAnswer.submitted) {
                  if (isCorrect) { bg = TEAL_SOFT; border = TEAL; text = TEAL; }
                  else if (isSelected) { bg = RED_SOFT; border = RED; text = RED; }
                } else if (isSelected) {
                  bg = ROSE_SOFT; border = VIOLET; text = INK;
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={currentAnswer.submitted}
                    onClick={() => setAnswers(prev => prev.map((a, idx) => idx === currentIdx ? { ...a, selectedOption: i } : a))}
                    className="w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all"
                    style={{ background: bg, borderColor: border, color: text }}
                  >
                    <span>{opt}</span>
                    {currentAnswer.submitted && isCorrect && <CheckCircle size={14} style={{ color: TEAL }} />}
                    {currentAnswer.submitted && isSelected && !isCorrect && <XCircle size={14} style={{ color: RED }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Points of Recognition with AI Evaluator */}
          <div className="bg-white rounded-2xl p-4 border shadow-sm" style={{ borderColor: "#EEE4D6" }}>
            <h3 className="text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: INK }}>
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]" style={{ background: GRAD_FLAT }}>3</span>
              Points of Recognition
            </h3>
            <textarea
              rows={4}
              value={currentAnswer.points}
              disabled={currentAnswer.submitted || isAiEvaluating}
              onChange={(e) => setAnswers(prev => prev.map((a, idx) => idx === currentIdx ? { ...a, points: e.target.value } : a))}
              placeholder="Write observations in your own words (AI understands medical synonyms)..."
              className="w-full p-2.5 border rounded-xl text-xs focus:outline-none resize-none font-body"
              style={{ borderColor: "#E9DCC7", background: currentAnswer.submitted ? "#FAF6EF" : "#fff" }}
            />

            {!currentAnswer.submitted ? (
              <button
                type="button"
                disabled={isAiEvaluating}
                onClick={handleSubmit}
                className="mt-3 w-full py-3 rounded-xl text-white font-extrabold text-xs shadow flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{ background: GRAD_FLAT }}
              >
                {isAiEvaluating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>AI Pathologist Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Bot size={14} />
                    <span>Submit to AI Examiner</span>
                  </>
                )}
              </button>
            ) : (
              <div className="mt-3.5 space-y-3.5">
                {/* Professional AI Histological Evaluation Report */}
                {currentAnswer.aiResult && (
                  <div
                    className="rounded-2xl border shadow-sm overflow-hidden transition-all bg-white"
                    style={{ borderColor: "#E6DBCB" }}
                  >
                    {/* Report Header */}
                    <div
                      className="px-4 py-3 border-b flex items-center justify-between"
                      style={{ background: "#FAF6F0", borderColor: "#EFE5D6" }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0"
                          style={{ background: GRAD_FLAT }}
                        >
                          <Sparkles size={12} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider font-display" style={{ color: INK }}>
                            Pathological Evaluation Report
                          </h4>
                          <p className="text-[10px] font-medium" style={{ color: INK_SOFT }}>
                            Semantic Morphological Correlation
                          </p>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="flex items-center gap-1.5">
                        <div
                          className="px-2.5 py-1 rounded-xl text-xs font-black font-lab border flex items-center gap-1 shadow-2xs"
                          style={{
                            background: currentAnswer.aiResult.semanticScore >= 75 ? TEAL_SOFT : currentAnswer.aiResult.semanticScore >= 50 ? AMBER_SOFT : RED_SOFT,
                            color: currentAnswer.aiResult.semanticScore >= 75 ? TEAL : currentAnswer.aiResult.semanticScore >= 50 ? "#8C6212" : RED,
                            borderColor: currentAnswer.aiResult.semanticScore >= 75 ? "#B7E3D8" : currentAnswer.aiResult.semanticScore >= 50 ? "#F0D9A6" : "#F3C6C6",
                          }}
                        >
                          <span>{currentAnswer.aiResult.semanticScore}%</span>
                          <span className="text-[9px] font-bold uppercase opacity-80">
                            {currentAnswer.aiResult.semanticScore >= 80 ? "Distinction" : currentAnswer.aiResult.semanticScore >= 50 ? "Proficient" : "Review"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 space-y-3.5">
                      {/* Examiner Feedback */}
                      <div className="rounded-xl p-3 border" style={{ background: "#FDFBF7", borderColor: "#EFE5D6" }}>
                        <span className="text-[9px] font-black uppercase tracking-wider block mb-1 font-lab" style={{ color: INK_SOFT }}>
                          Examiner's Clinical Impression
                        </span>
                        <p className="text-xs leading-relaxed font-medium" style={{ color: INK }}>
                          "{currentAnswer.aiResult.feedback}"
                        </p>
                      </div>

                      {/* Validated Diagnostic Criteria */}
                      {currentAnswer.aiResult.matchedConcepts?.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle size={12} style={{ color: TEAL }} />
                            <span className="text-[10px] font-black uppercase tracking-wider font-lab" style={{ color: TEAL }}>
                              Validated Morphological Criteria ({currentAnswer.aiResult.matchedConcepts.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {currentAnswer.aiResult.matchedConcepts.map((concept, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold border"
                                style={{
                                  background: TEAL_SOFT,
                                  color: TEAL,
                                  borderColor: "#BDE6DC",
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: TEAL }} />
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Omitted / Key Features to Correlate */}
                      {currentAnswer.aiResult.missedConcepts?.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle size={12} style={{ color: AMBER }} />
                            <span className="text-[10px] font-black uppercase tracking-wider font-lab" style={{ color: "#8C6212" }}>
                              Diagnostic Criteria to Correlate ({currentAnswer.aiResult.missedConcepts.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {currentAnswer.aiResult.missedConcepts.map((concept, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg font-semibold border"
                                style={{
                                  background: AMBER_SOFT,
                                  color: "#7A530F",
                                  borderColor: "#F0DBAD",
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: AMBER }} />
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* High-Yield Viva Pearl */}
                      {currentAnswer.aiResult.examinerNote && (
                        <div
                          className="p-3 rounded-xl border flex items-start gap-2.5"
                          style={{
                            background: ROSE_SOFT,
                            borderColor: "#F2CAD6",
                          }}
                        >
                          <BookOpen size={14} className="shrink-0 mt-0.5" style={{ color: VIOLET }} />
                          <div className="text-xs leading-relaxed" style={{ color: VIOLET_DEEP }}>
                            <span className="font-black uppercase text-[10px] tracking-wide block mb-0.5 font-lab" style={{ color: VIOLET }}>
                              High-Yield Board Pearl
                            </span>
                            <span>{currentAnswer.aiResult.examinerNote}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Next Specimen Action Button */}
                {currentIdx < slides.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3.5 rounded-2xl text-white font-extrabold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all tracking-wide font-display"
                    style={{ background: GRAD_FLAT }}
                  >
                    <span>Proceed to Next Specimen</span>
                    <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3.5 rounded-2xl text-white font-extrabold text-xs shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all tracking-wide font-display"
                    style={{ background: GRAD_FLAT }}
                  >
                    <Trophy size={15} />
                    <span>Complete Examination & View Summary</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}