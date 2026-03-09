"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft, ChevronRight, BookOpen, Award, Shuffle, CheckCircle,
    XCircle, RotateCcw, Trophy, ExternalLink, ZoomIn, X, Images,
} from "lucide-react";
import {
    Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf, Dna, Activity,
} from "lucide-react";

// ─── BG icons ────────────────────────────────────────────────────────────────
const bgIcons = [
    { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
    { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
    { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
    { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
    { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
    { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

// ─── SLIDE DATA — 2–3 images per slide ───────────────────────────────────────
const SLIDE_DATA = [
    {
        id: "stratified-squamous-epithelium",
        title: "Stratified Squamous Epithelium",
        images: [
            { url: "/images/spotting/histology/stratified-squamous.jpg",            label: "Low power — overall epithelial layers",     hint: "Count the number of cell layers" },
            { url: "/images/spotting/histology/stratified-squamous-midpower.jpg",   label: "Mid power — cell layer organisation",       hint: "Note flattening of cells toward the surface" },
            { url: "/images/spotting/histology/stratified-squamous-highpower.jpg",  label: "High power — surface squamous cells",       hint: "Flat superficial cells with dense nuclei" },
        ],
        options: [
            "Stratified Squamous Epithelium",
            "Simple Columnar Epithelium",
            "Transitional Epithelium",
            "Pseudostratified Epithelium",
        ],
        correctOptionIndex: 0,
        definition:
            "Multi-layered flat cells providing mechanical protection – found in skin, oral mucosa, oesophagus, and vagina.",
        lessonDetailed:
            "Stratified squamous epithelium consists of multiple cell layers with flattened superficial cells. It protects against abrasion and forms the epidermis (keratinised) and linings of the mouth, oesophagus, and vagina (non‑keratinised).",
        keyFeatures: [
            "Multiple cell layers",
            "Flattened surface cells",
            "Basal cuboidal/columnar cells",
            "Keratinised (skin) or non-keratinised (mucosa)",
            "Abrasion protection",
        ],
        gradient: "from-blue-600 to-green-400",
    },
    {
        id: "simple-columnar-epithelium",
        title: "Simple Columnar Epithelium",
        images: [
            { url: "/images/spotting/histology/simple-columnar.jpg",           label: "Low power — intestinal lining",            hint: "Single layer of tall cells lining the lumen" },
            { url: "/images/spotting/histology/simple-columnar-midpower.jpg",  label: "Mid power — columnar cell morphology",     hint: "Look for brush border and goblet cells" },
            { url: "/images/spotting/histology/simple-columnar-highpower.jpg", label: "High power — nuclear position",            hint: "Elongated basal nuclei, apical cytoplasm" },
        ],
        options: [
            "Simple Columnar Epithelium",
            "Stratified Squamous Epithelium",
            "Cuboidal Epithelium",
            "Ciliated Pseudostratified Epithelium",
        ],
        correctOptionIndex: 0,
        definition:
            "Single layer of tall cells with basal nuclei lining the intestine – specialised for absorption and secretion.",
        lessonDetailed:
            "Simple columnar epithelium lines the gastrointestinal tract from stomach to anus. Cells often possess microvilli (brush border) and goblet cells for mucus secretion. Nuclei are elongated and basally located.",
        keyFeatures: [
            "Single layer of tall columnar cells",
            "Basally placed elongated nuclei",
            "Brush border (microvilli) apically",
            "Goblet cells interspersed",
            "Lines GI tract — absorption & secretion",
        ],
        gradient: "from-purple-600 to-blue-500",
    },
    {
        id: "transitional-epithelium",
        title: "Transitional Epithelium (Urothelium)",
        images: [
            { url: "/images/spotting/histology/transitional-epithelium.jpg",            label: "Low power — relaxed bladder wall",         hint: "Several layers with dome-shaped surface cells" },
            { url: "/images/spotting/histology/transitional-epithelium-midpower.jpg",   label: "Mid power — umbrella cell layer",          hint: "Large rounded superficial umbrella cells" },
            { url: "/images/spotting/histology/transitional-epithelium-highpower.jpg",  label: "High power — cell detail",                 hint: "Binucleate umbrella cells, rounded profiles below" },
        ],
        options: [
            "Transitional Epithelium",
            "Stratified Squamous Epithelium",
            "Simple Columnar Epithelium",
            "Ciliated Columnar Epithelium",
        ],
        correctOptionIndex: 0,
        definition:
            "Distensible epithelium lining the urinary bladder with characteristic dome‑shaped umbrella cells at the surface.",
        lessonDetailed:
            "Urothelium is a stratified epithelium that can stretch. In the relaxed state it appears 4–5 cells thick with large superficial umbrella cells; when stretched it thins to 2–3 layers. Found in renal pelvis, ureter, bladder, and proximal urethra.",
        keyFeatures: [
            "Dome-shaped umbrella cells at surface",
            "4–5 layers in relaxed state",
            "Thins to 2–3 layers when distended",
            "Rounded cells in intermediate layers",
            "Lining of urinary tract",
        ],
        gradient: "from-emerald-600 to-cyan-400",
    },
    {
        id: "hyaline-cartilage",
        title: "Hyaline Cartilage",
        images: [
            { url: "/images/spotting/histology/hyaline-cartilage.jpg",            label: "Low power — cartilaginous lobule",          hint: "Pale blue-grey homogeneous matrix" },
            { url: "/images/spotting/histology/hyaline-cartilage-midpower.jpg",   label: "Mid power — chondrocytes in lacunae",      hint: "Rounded cells within well-defined spaces" },
            { url: "/images/spotting/histology/hyaline-cartilage-highpower.jpg",  label: "High power — isogenous groups",            hint: "Cell nests (isogenous groups) in matrix" },
        ],
        options: [
            "Hyaline Cartilage",
            "Elastic Cartilage",
            "Fibrocartilage",
            "Compact Bone",
        ],
        correctOptionIndex: 0,
        definition:
            "Glassy homogeneous matrix with chondrocytes in lacunae – found in articular surfaces, trachea, and costal ribs.",
        lessonDetailed:
            "Hyaline cartilage has a pale blue‑grey matrix rich in type II collagen and proteoglycans. Chondrocytes reside in lacunae, often in isogenous groups. It provides smooth articular surfaces and flexible support in respiratory passages.",
        keyFeatures: [
            "Glassy blue-grey homogeneous matrix",
            "Chondrocytes in lacunae",
            "Isogenous groups (cell nests)",
            "No blood vessels",
            "Perichondrium present (except articular)",
        ],
        gradient: "from-amber-500 to-orange-400",
    },
    {
        id: "compact-bone",
        title: "Compact Bone (Osteon / Haversian System)",
        images: [
            { url: "/images/spotting/histology/compact-bone.jpg",            label: "Low power — osteon arrangement",           hint: "Concentric circular structures — Haversian systems" },
            { url: "/images/spotting/histology/compact-bone-midpower.jpg",   label: "Mid power — lamellae and canals",          hint: "Concentric lamellae around a central canal" },
            { url: "/images/spotting/histology/compact-bone-highpower.jpg",  label: "High power — osteocytes in lacunae",       hint: "Dark lacunae with canalicular connections" },
        ],
        options: [
            "Compact Bone",
            "Trabecular Bone",
            "Hyaline Cartilage",
            "Dense Regular Connective Tissue",
        ],
        correctOptionIndex: 0,
        definition:
            "Concentric lamellae around a central Haversian canal with osteocytes in lacunae – the structural unit of cortical bone.",
        lessonDetailed:
            "Compact bone is organised into osteons (Haversian systems). Each osteon consists of concentric lamellae surrounding a central canal containing blood vessels and nerves. Osteocytes lie in lacunae between lamellae; canaliculi connect them.",
        keyFeatures: [
            "Concentric lamellae",
            "Central Haversian canal (vessels + nerves)",
            "Osteocytes in lacunae",
            "Canaliculi linking osteocytes",
            "Interstitial lamellae between osteons",
        ],
        gradient: "from-rose-500 to-pink-400",
    },
    {
        id: "skeletal-muscle",
        title: "Skeletal Muscle (L.S. & T.S.)",
        images: [
            { url: "/images/spotting/histology/skeletal-muscle.jpg",            label: "Low power — muscle fascicles",             hint: "Parallel bundles of muscle fibres" },
            { url: "/images/spotting/histology/skeletal-muscle-midpower.jpg",   label: "Mid power — L.S. striations",              hint: "Alternating light (I) and dark (A) bands" },
            { url: "/images/spotting/histology/skeletal-muscle-highpower.jpg",  label: "High power — peripheral nuclei",           hint: "Multiple nuclei pressed against the sarcolemma" },
        ],
        options: [
            "Skeletal Muscle",
            "Cardiac Muscle",
            "Smooth Muscle",
            "Nerve",
        ],
        correctOptionIndex: 0,
        definition:
            "Voluntary striated fibres with peripheral nuclei. Cross‑sections reveal polygonal fields; L.S. shows clear striations.",
        lessonDetailed:
            "Skeletal muscle fibres are long, cylindrical, and multinucleated with nuclei pressed against the sarcolemma. Longitudinal sections show alternating A and I bands (striations). Transverse sections reveal polygonal profiles with peripheral nuclei.",
        keyFeatures: [
            "Cross-striations (A & I bands)",
            "Peripheral (subsarcolemmal) nuclei",
            "Multinucleated fibres",
            "Polygonal T.S. profiles",
            "No intercalated discs",
        ],
        gradient: "from-cyan-600 to-blue-400",
    },
    {
        id: "liver-lobule",
        title: "Liver Lobule",
        images: [
            { url: "/images/spotting/histology/liver.jpg",            label: "Low power — classic hexagonal lobule",     hint: "Central vein at centre, portal triads at vertices" },
            { url: "/images/spotting/histology/liver-midpower.jpg",   label: "Mid power — hepatic plates & sinusoids",  hint: "Radiating cords of hepatocytes, sinusoidal spaces" },
            { url: "/images/spotting/histology/liver-highpower.jpg",  label: "High power — portal triad",               hint: "Portal vein, hepatic artery, bile duct in one triad" },
        ],
        options: [
            "Liver Lobule",
            "Pancreas",
            "Kidney Cortex",
            "Spleen",
        ],
        correctOptionIndex: 0,
        definition:
            "Hexagonal lobule with portal triads at vertices and a central vein – hepatic plates radiate from centre to periphery.",
        lessonDetailed:
            "The classic liver lobule is a hexagonal structure with a central vein and portal triads (portal vein, hepatic artery, bile duct) at the corners. Hepatocyte plates radiate outward; sinusoids lined by Kupffer cells lie between plates.",
        keyFeatures: [
            "Central vein (centrilobular vein)",
            "Portal triads at lobule periphery",
            "Radiating hepatocyte plates (1–2 cells thick)",
            "Sinusoids between hepatocyte plates",
            "Kupffer cells lining sinusoids",
        ],
        gradient: "from-violet-600 to-purple-400",
    },
    {
        id: "renal-cortex",
        title: "Renal Cortex & Medulla",
        images: [
            { url: "/images/spotting/histology/kidney.jpg",            label: "Low power — cortex overview",             hint: "Round glomeruli scattered in cortical parenchyma" },
            { url: "/images/spotting/histology/kidney-midpower.jpg",   label: "Mid power — renal corpuscle",             hint: "Glomerulus within Bowman's capsule" },
            { url: "/images/spotting/histology/kidney-highpower.jpg",  label: "High power — tubule distinction",         hint: "PCT brush border vs DCT clear lumen" },
        ],
        options: [
            "Renal Cortex",
            "Renal Medulla",
            "Liver",
            "Pancreas",
        ],
        correctOptionIndex: 0,
        definition:
            "Glomeruli, proximal (brush‑border) and distal tubules in cortex; collecting ducts in medulla – identify tubule calibre.",
        lessonDetailed:
            "The renal cortex contains renal corpuscles (glomeruli with Bowman's capsule) and convoluted tubules. Proximal tubules have a brush border and eosinophilic cytoplasm; distal tubules are smaller with clear lumens. The medulla contains straight tubules and collecting ducts.",
        keyFeatures: [
            "Renal corpuscles (glomerulus + Bowman's capsule)",
            "PCT — brush border, eosinophilic, wide lumen",
            "DCT — no brush border, clearer, smaller",
            "Loop of Henle in medulla",
            "Collecting ducts — pale cuboidal cells",
        ],
        gradient: "from-teal-600 to-green-400",
    },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function calculateMatch(userText: string, definition: string): number {
    const normalize = (s: string) =>
        s.toLowerCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/)
            .filter((w) => w.length > 3 && !["the", "and", "for", "with", "that", "this", "are", "was", "from", "into", "have"].includes(w));
    const ut = new Set(normalize(userText));
    const dt = new Set(normalize(definition));
    if (!dt.size) return 0;
    const inter = new Set(Array.from(ut).filter((x) => dt.has(x)));
    return Math.round((inter.size / dt.size) * 100);
}

function scoreBadge(score: number) {
    if (score >= 75) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 40) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-red-700 bg-red-50 border-red-200";
}

// ─── References ──────────────────────────────────────────────────────────────
const REFERENCES = [
    { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas (8th ed.).", publisher: "Wolters Kluwer.", year: "2020" },
    { authors: "Mescher AL.", title: "Junqueira's Basic Histology (16th ed.).", publisher: "McGraw Hill.", year: "2021" },
    { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology (6th ed.).", publisher: "Elsevier.", year: "2014" },
    { authors: "Gartner LP.", title: "Textbook of Histology (5th ed.).", publisher: "Elsevier.", year: "2020" },
    { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology (12th ed.).", publisher: "Lippincott Williams & Wilkins.", year: "2013" },
];

interface SlideAnswer {
    selectedOption: number | null;
    points: string;
    submitted: boolean;
    matchScore: number;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
                transition={{ type: "spring", damping: 24, stiffness: 280 }}
                className="relative w-full max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <Image src={src} alt={label} width={1400} height={900}
                    className="w-full h-full object-contain max-h-[80vh] bg-gray-950" />
                <button onClick={onClose}
                    className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/60 backdrop-blur text-white flex items-center justify-center hover:bg-black/80 transition">
                    <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-5 py-4">
                    <p className="text-white text-sm font-semibold">{label}</p>
                    <p className="text-white/50 text-xs mt-0.5">Press Esc or click outside to close</p>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── ImageGallery ─────────────────────────────────────────────────────────────
function ImageGallery({ images, gradient }: {
    images: { url: string; label: string; hint: string }[];
    gradient: string;
}) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [lightbox, setLightbox] = useState<string | null>(null);
    const active = images[activeIdx];

    return (
        <>
            <AnimatePresence mode="wait">
                {lightbox && (
                    <Lightbox key="lb" src={lightbox}
                        label={images.find((img) => img.url === lightbox)?.label ?? ""}
                        onClose={() => setLightbox(null)} />
                )}
            </AnimatePresence>

            <div className="space-y-3">
                {/* Main image */}
                <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden group">
                    <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient} z-10`} />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIdx}
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
                            className="relative h-[280px] sm:h-[320px] w-full bg-gray-50 cursor-zoom-in"
                            onClick={() => setLightbox(active.url)}
                        >
                            <Image src={active.url} alt={active.label} fill
                                className="object-contain" sizes="(max-width:768px) 100vw, 600px" />
                            {/* Zoom hint */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <ZoomIn className="w-3 h-3" /> Click to zoom
                            </div>
                            {/* Counter badge */}
                            <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold">
                                <Images className="w-3 h-3" /> {activeIdx + 1} / {images.length}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    {/* Label + hint bar */}
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/80">
                        <p className="text-xs font-extrabold text-gray-700 truncate">{active.label}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 italic">{active.hint}</p>
                    </div>
                </div>

                {/* Thumbnail strip */}
                <div className="flex gap-2.5">
                    {images.map((img, i) => (
                        <button key={i} onClick={() => setActiveIdx(i)}
                            className={`relative flex-1 h-[72px] rounded-xl overflow-hidden border-2 transition-all duration-200 group/thumb ${
                                i === activeIdx
                                    ? "border-blue-500 shadow-md shadow-blue-200/50 scale-[1.03]"
                                    : "border-gray-200 hover:border-blue-300 hover:scale-[1.02]"
                            }`}
                        >
                            <Image src={img.url} alt={img.label} fill className="object-cover" sizes="150px" />
                            <div className={`absolute inset-0 transition-opacity duration-200 ${
                                i === activeIdx ? "bg-blue-600/15" : "bg-black/0 group-hover/thumb:bg-black/10"
                            }`} />
                            {i === activeIdx && (
                                <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient}`} />
                            )}
                            <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5 text-white text-[9px] font-extrabold uppercase tracking-wide">
                                {i === 0 ? "Low" : i === 1 ? "Mid" : "High"}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Mobile navigation arrows */}
                <div className="flex items-center gap-2 sm:hidden">
                    <button disabled={activeIdx === 0}
                        onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
                        className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 disabled:opacity-30 flex items-center justify-center gap-1">
                        <ChevronLeft className="w-3.5 h-3.5" /> Prev view
                    </button>
                    <button disabled={activeIdx === images.length - 1}
                        onClick={() => setActiveIdx((i) => Math.min(images.length - 1, i + 1))}
                        className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 disabled:opacity-30 flex items-center justify-center gap-1">
                        Next view <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function HistologyTestPage() {
    const [slides, setSlides] = useState<typeof SLIDE_DATA>(SLIDE_DATA);
    const [mounted, setMounted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<SlideAnswer[]>(
        SLIDE_DATA.map(() => ({ selectedOption: null, points: "", submitted: false, matchScore: 0 }))
    );
    const [testCompleted, setTestCompleted] = useState(false);

    useEffect(() => {
        const shuffled = shuffle([...SLIDE_DATA]);
        setSlides(shuffled);
        setAnswers(shuffled.map(() => ({ selectedOption: null, points: "", submitted: false, matchScore: 0 })));
        setMounted(true);
    }, []);

    const currentSlide = slides[currentIndex];
    const currentAnswer = answers[currentIndex];
    const allSubmitted = answers.every((a) => a.submitted);

    const shuffledOptions = useMemo(() => {
        if (!mounted) return currentSlide.options.map((text, origIdx) => ({ text, origIdx }));
        return shuffle(currentSlide.options.map((text, origIdx) => ({ text, origIdx })));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSlide.id, mounted]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentAnswer.selectedOption === null || !currentAnswer.points.trim()) {
            alert("Please select an option and write your recognition points.");
            return;
        }
        const score = calculateMatch(currentAnswer.points, currentSlide.definition);
        setAnswers((prev) =>
            prev.map((ans, i) =>
                i === currentIndex ? { ...ans, submitted: true, matchScore: score } : ans
            )
        );
    };

    const handleReset = () => {
        setAnswers((prev) =>
            prev.map((ans, i) =>
                i === currentIndex
                    ? { selectedOption: null, points: "", submitted: false, matchScore: 0 }
                    : ans
            )
        );
    };

    // ── Results screen ────────────────────────────────────────────────────────
    if (testCompleted) {
        const totalCorrect = answers.filter(
            (a, i) => a.selectedOption !== null && slides[i].options[a.selectedOption] === slides[i].title
        ).length;
        const avgMatch = (answers.reduce((s, a) => s + a.matchScore, 0) / answers.length).toFixed(1);
        const pct = Math.round((totalCorrect / slides.length) * 100);

        return (
            <section className="min-h-screen bg-white relative overflow-x-hidden">
                {bgIcons.map(({ Icon, top, left, size }, i) => (
                    <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
                        <Icon size={size} strokeWidth={1.4} />
                    </div>
                ))}

                {/* Hero */}
                <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute right-20 bottom-4 opacity-15 pointer-events-none"><Trophy size={70} className="text-white" /></div>
                    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-14 text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-4">
                            <Trophy className="w-3.5 h-3.5" /> Test Complete
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">Your Results</h1>
                        <div className="flex items-center justify-center gap-8 flex-wrap">
                            {[
                                { n: `${totalCorrect}/${slides.length}`, l: "Correct Slides" },
                                { n: `${pct}%`,                          l: "Score"          },
                                { n: `${avgMatch}%`,                     l: "Avg Key-Point Match" },
                                { n: pct >= 80 ? "🏆" : pct >= 50 ? "🎯" : "📚", l: "Grade" },
                            ].map(({ n, l }) => (
                                <div key={l} className="text-center">
                                    <div className="text-3xl font-extrabold text-white leading-none">{n}</div>
                                    <div className="text-xs text-blue-200 mt-1">{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Per-slide summary */}
                <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 py-12 space-y-4">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Slide-by-Slide Summary</h2>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                    </div>

                    {slides.map((slide, idx) => {
                        const ans = answers[idx];
                        const isCorrect = ans.selectedOption !== null && slide.options[ans.selectedOption] === slide.title;
                        const notAnswered = ans.selectedOption === null || !ans.submitted;

                        return (
                            <div key={slide.id}
                                className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-all duration-300">
                                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${slide.gradient}`} />
                                <div className="relative z-10 p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                                    {/* Thumbnail */}
                                    <div className="relative w-20 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                                        <Image src={slide.images[0].url} alt={slide.title} fill className="object-cover" sizes="80px" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-extrabold text-gray-900">{slide.title}</h3>
                                            {notAnswered ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600">Not answered</span>
                                            ) : isCorrect ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700"><CheckCircle className="w-3 h-3" /> Correct</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700"><XCircle className="w-3 h-3" /> Incorrect</span>
                                            )}
                                        </div>
                                        {!notAnswered && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Your choice: <span className="font-semibold text-gray-600">
                                                    {ans.selectedOption !== null ? slide.options[ans.selectedOption] : "—"}
                                                </span>
                                                {!isCorrect && <span className="ml-2 text-blue-600">Correct: <strong>{slide.title}</strong></span>}
                                            </p>
                                        )}
                                        {/* Key features */}
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {slide.keyFeatures.slice(0, 3).map((f) => (
                                                <span key={f} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                    {!notAnswered && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${scoreBadge(ans.matchScore)}`}>
                                                Match {ans.matchScore}%
                                            </span>
                                            <Link href={`/spotting/histology/lessons/${slide.id}`}
                                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                                                Lesson <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                        <button onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                            <Shuffle className="w-4 h-4" /> Retake (Reshuffled)
                        </button>
                        <Link href="/spotting"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 transition-all duration-300">
                            <ChevronLeft className="w-4 h-4" /> Back to Spotting Centre
                        </Link>
                    </div>

                    {/* References */}
                    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden mt-6">
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                        <div className="p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-lg font-extrabold text-gray-900">References</h2>
                                <span className="ml-auto text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">{REFERENCES.length} sources</span>
                            </div>
                            <ol className="space-y-3">
                                {REFERENCES.map((ref, i) => (
                                    <li key={i} className="flex gap-3">
                                        <span className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-extrabold text-blue-700 shrink-0 mt-0.5">{i + 1}</span>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            <span className="text-gray-400">{ref.authors} </span>
                                            <em className="font-semibold text-gray-900">{ref.title}</em>
                                            <span className="text-gray-400"> {ref.publisher} {ref.year}.</span>
                                        </p>
                                    </li>
                                ))}
                            </ol>
                            <p className="text-[11px] text-gray-400 mt-5 pt-4 border-t border-gray-100">
                                <strong className="text-gray-500">Disclaimer:</strong> Content is for educational review only. Histopathological diagnosis requires a qualified pathologist.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    // ── Main test UI ──────────────────────────────────────────────────────────
    return (
        <section className="min-h-screen bg-white relative overflow-x-hidden">
            {bgIcons.map(({ Icon, top, left, size }, i) => (
                <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
                    <Icon size={size} strokeWidth={1.4} />
                </div>
            ))}

            {/* Hero */}
            <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
                <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
                <div className="absolute right-20 bottom-4 opacity-15 pointer-events-none"><Dna size={60} className="text-white" /></div>
                <div className="absolute right-44 top-6 opacity-15 pointer-events-none"><Activity size={40} className="text-white" /></div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
                    <Link href="/spotting"
                        className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold mb-5 transition-colors">
                        <ChevronLeft className="w-3.5 h-3.5" /> Back to Spotting Centre
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-4">
                                <Microscope className="w-3.5 h-3.5" /> Histology Spot Test
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                                Histology
                                <span className="block text-green-200 mt-1">Spotting Test</span>
                            </h1>
                            <p className="text-white/70 text-sm mt-2 max-w-md">
                                Each slide shows <span className="font-bold text-white">2–3 views</span> (low → mid → high power).
                                Study all views, then identify the slide and write your recognition points.
                            </p>
                        </div>

                        {/* Progress pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {slides.map((_, i) => (
                                <button key={i} onClick={() => setCurrentIndex(i)}
                                    className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                                        i === currentIndex
                                            ? "bg-white text-blue-700 shadow-md scale-110"
                                            : answers[i].submitted
                                                ? "bg-white/30 text-white"
                                                : "bg-white/15 text-white/60 hover:bg-white/25"
                                    }`}>
                                    {answers[i].submitted
                                        ? (slides[i].options[answers[i].selectedOption!] === slides[i].title ? "✓" : "✗")
                                        : i + 1}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-6 w-full h-2 bg-white/20 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-white rounded-full"
                            animate={{ width: `${(answers.filter((a) => a.submitted).length / slides.length) * 100}%` }}
                            transition={{ duration: 0.4, ease: "easeOut" }} />
                    </div>
                    <div className="flex justify-between text-xs text-white/60 mt-1.5">
                        <span>Slide {currentIndex + 1} of {slides.length}</span>
                        <span className="flex items-center gap-1">
                            <Shuffle className="w-3 h-3" /> {answers.filter((a) => a.submitted).length} / {slides.length} answered
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10">
                <AnimatePresence mode="wait">
                    <motion.div key={currentSlide.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
                        className="grid lg:grid-cols-2 gap-8">

                        {/* LEFT: gallery + MCQ */}
                        <div className="space-y-5">
                            {/* Slide label */}
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${currentSlide.gradient} flex items-center justify-center shrink-0`}>
                                    <Microscope className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Slide #{currentIndex + 1}</p>
                                    <p className="text-xs font-bold text-gray-600">
                                        {currentSlide.images.length} views available — study all before answering
                                    </p>
                                </div>
                            </div>

                            {/* Gallery */}
                            <ImageGallery images={currentSlide.images} gradient={currentSlide.gradient} />

                            {/* Key features strip (shown after submit) */}
                            <AnimatePresence>
                                {currentAnswer.submitted && (
                                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden p-4">
                                        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${currentSlide.gradient}`} />
                                        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2.5">Key Identifying Features</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {currentSlide.keyFeatures.map((f) => (
                                                <span key={f} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700">{f}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* MCQ */}
                            <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${currentSlide.gradient}`} />
                                <div className="p-5">
                                    <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                                            <span className="text-[10px] font-extrabold text-blue-700">?</span>
                                        </div>
                                        Identify this slide:
                                    </h3>
                                    <div className="space-y-2">
                                        {shuffledOptions.map(({ text, origIdx }) => {
                                            const isSelected = currentAnswer.selectedOption === origIdx;
                                            const isCorrectOpt = origIdx === currentSlide.correctOptionIndex;
                                            let state = "default";
                                            if (currentAnswer.submitted) {
                                                if (isCorrectOpt) state = "correct";
                                                else if (isSelected) state = "wrong";
                                            } else if (isSelected) {
                                                state = "selected";
                                            }
                                            return (
                                                <label key={origIdx}
                                                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all duration-200 ${
                                                        state === "correct"  ? "border-green-400 bg-green-50 cursor-default" :
                                                        state === "wrong"    ? "border-red-400   bg-red-50   cursor-default" :
                                                        state === "selected" ? "border-blue-500  bg-blue-50  cursor-pointer" :
                                                        currentAnswer.submitted ? "border-gray-100 bg-gray-50/50 cursor-default opacity-50" :
                                                        "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer"
                                                    }`}>
                                                    <input type="radio" name="slideOption" value={origIdx}
                                                        checked={isSelected} disabled={currentAnswer.submitted}
                                                        onChange={() => !currentAnswer.submitted && setAnswers((prev) =>
                                                            prev.map((ans, i) => i === currentIndex ? { ...ans, selectedOption: origIdx } : ans)
                                                        )}
                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 shrink-0" />
                                                    <span className={`text-sm font-semibold flex-1 ${
                                                        state === "correct" ? "text-green-800" :
                                                        state === "wrong"   ? "text-red-700"   : "text-gray-800"
                                                    }`}>{text}</span>
                                                    {currentAnswer.submitted && state === "correct" && <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />}
                                                    {currentAnswer.submitted && state === "wrong"   && <XCircle    className="w-4 h-4 text-red-500   shrink-0" />}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: recognition points + results */}
                        <div className="space-y-5">
                            {/* Points textarea */}
                            <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${currentSlide.gradient}`} />
                                <div className="p-5">
                                    <h3 className="text-sm font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                                            <BookOpen className="w-3.5 h-3.5 text-green-600" />
                                        </div>
                                        Points of Recognition
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-3">
                                        Write the key microscopic features that helped you identify this slide. Tip: study all views first!
                                    </p>
                                    <textarea
                                        value={currentAnswer.points}
                                        onChange={(e) => !currentAnswer.submitted && setAnswers((prev) =>
                                            prev.map((ans, i) => i === currentIndex ? { ...ans, points: e.target.value } : ans)
                                        )}
                                        rows={6}
                                        disabled={currentAnswer.submitted}
                                        placeholder="e.g., multiple cell layers, flat surface cells, basal cuboidal cells, no invasion..."
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 text-sm text-gray-800 placeholder:text-gray-400 bg-white disabled:bg-gray-50 disabled:text-gray-500 resize-none transition-colors"
                                    />
                                    {!currentAnswer.submitted ? (
                                        <button onClick={handleSubmit}
                                            className={`mt-4 w-full py-3 rounded-2xl bg-gradient-to-r ${currentSlide.gradient} text-white font-extrabold text-sm shadow-md shadow-blue-200/50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300`}>
                                            Submit Answer
                                        </button>
                                    ) : (
                                        <button onClick={handleReset}
                                            className="mt-4 w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2 transition-all">
                                            <RotateCcw className="w-4 h-4" /> Try Again
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Results after submit */}
                            <AnimatePresence>
                                {currentAnswer.submitted && (
                                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }} className="space-y-4">

                                        {/* Match score */}
                                        <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                                            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${currentSlide.gradient}`} />
                                            <div className="p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                                                        <Award className="w-4 h-4 text-yellow-500" /> Match Score
                                                    </h3>
                                                    <span className={`text-lg font-extrabold px-3 py-1 rounded-xl border ${scoreBadge(currentAnswer.matchScore)}`}>
                                                        {currentAnswer.matchScore}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div className={`h-full bg-gradient-to-r ${currentSlide.gradient} rounded-full`}
                                                        initial={{ width: 0 }} animate={{ width: `${currentAnswer.matchScore}%` }}
                                                        transition={{ duration: 0.7, ease: "easeOut" }} />
                                                </div>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {currentAnswer.matchScore >= 75 ? "Excellent! Your recognition is spot-on." :
                                                     currentAnswer.matchScore >= 40 ? "Good effort — compare your points to the definition." :
                                                     "Study the key features and try the next slide carefully."}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Definition comparison */}
                                        <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                                            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${currentSlide.gradient}`} />
                                            <div className="p-5 space-y-4">
                                                <div>
                                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">Expected Definition</p>
                                                    <p className="text-sm text-gray-700 bg-gray-50 border border-gray-200 p-3 rounded-xl leading-relaxed">{currentSlide.definition}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">Your Points</p>
                                                    <p className="text-sm text-gray-700 bg-blue-50 border border-blue-100 p-3 rounded-xl leading-relaxed">{currentAnswer.points}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed lesson */}
                                        <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                                            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${currentSlide.gradient}`} />
                                            <details className="group">
                                                <summary className="flex items-center justify-between p-5 cursor-pointer list-none select-none">
                                                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-green-600" /> Detailed Lesson Notes
                                                    </h3>
                                                    <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform duration-200" />
                                                </summary>
                                                <div className="px-5 pb-5">
                                                    <p className="text-sm text-gray-600 leading-relaxed">{currentSlide.lessonDetailed}</p>
                                                    <Link href={`/spotting/histology/lessons/${currentSlide.id}`}
                                                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700 mt-3">
                                                        Open full lesson page <ChevronRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            </details>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                    <button onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-bold hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-all">
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <div className="text-xs text-gray-400 font-medium hidden sm:block">
                        {answers.filter((a) => a.submitted).length} / {slides.length} answered
                    </div>
                    {currentIndex === slides.length - 1 ? (
                        <button onClick={() => setTestCompleted(true)} disabled={!allSubmitted}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-extrabold shadow-md shadow-blue-200/50 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none transition-all">
                            <Trophy className="w-4 h-4" /> See Results
                        </button>
                    ) : (
                        <button onClick={() => setCurrentIndex((i) => Math.min(slides.length - 1, i + 1))}
                            disabled={!answers[currentIndex].submitted}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-bold hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition-all">
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* References */}
                <div className="mt-12 relative rounded-2xl border border-gray-200 bg-white overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                    <div className="p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
                                <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-900">References</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Histology sources used for slide content</p>
                            </div>
                            <span className="ml-auto text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 shrink-0">
                                {REFERENCES.length} sources
                            </span>
                        </div>
                        <ol className="space-y-3">
                            {REFERENCES.map((ref, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[10px] font-extrabold text-blue-700 shrink-0 mt-0.5">{i + 1}</span>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        <span className="text-gray-400">{ref.authors} </span>
                                        <em className="font-semibold text-gray-900">{ref.title}</em>
                                        <span className="text-gray-400"> {ref.publisher} {ref.year}.</span>
                                    </p>
                                </li>
                            ))}
                        </ol>
                        <p className="text-[11px] text-gray-400 mt-5 pt-4 border-t border-gray-100">
                            <strong className="text-gray-500">Disclaimer:</strong> Content is for educational review only. Histopathological diagnosis requires a qualified pathologist.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}