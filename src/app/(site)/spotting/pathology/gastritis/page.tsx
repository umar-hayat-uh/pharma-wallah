"use client";
// app/spotting/pathology/lessons/gastritis/page.tsx

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, BookOpen, ExternalLink,
  Microscope, Play, X, Zap, ArrowUp, Menu,
  CheckSquare, Library, Video, Trophy,
} from "lucide-react";
import {
  Pill, FlaskConical, Beaker, Stethoscope, Leaf,
  Microscope as MicIcon,
} from "lucide-react";

const BG_ICONS = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: MicIcon,      top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const GRAD = "from-amber-500 to-yellow-400";
const TITLE = "Gastritis";
const CAT = "GI Pathology";
const EMOJI = "🍽️";
const VIDEO_URL = "https://youtu.be/Mzj2crDQhyc";
const VIDEO_TITLE = "Gastritis — Pathology Lecture";
const PO_URL = "https://www.pathologyoutlines.com/topic/stomachgastritis.html";

const ALL_LESSONS = [
  { id: "acute-appendicitis", title: "Acute Appendicitis", category: "GI Pathology" },
  { id: "chronic-cholecystitis", title: "Chronic Cholecystitis", category: "Hepatobiliary" },
  { id: "gastritis", title: "Gastritis", category: "GI Pathology" },
  { id: "peptic-ulcer", title: "Peptic Ulcer", category: "GI Pathology" },
  { id: "tb-granuloma", title: "TB Granuloma", category: "Inflammatory" },
  { id: "leiomyoma", title: "Leiomyoma", category: "Smooth Muscle Tumour" },
  { id: "lipoma", title: "Lipoma", category: "Soft Tissue Tumour" },
  { id: "squamous-cell-carcinoma", title: "Squamous Cell Carcinoma", category: "Malignant Tumour" },
  { id: "hodgkin-lymphoma", title: "Hodgkin's Disease", category: "Haematological" },
  { id: "adenocarcinoma", title: "Adenocarcinoma", category: "Malignant Tumour" },
  { id: "fatty-liver", title: "Fatty Liver", category: "Hepatic Pathology" },
  { id: "cvc-liver", title: "Chronic Venous Congestion (Liver)", category: "Hepatic Pathology" },
  { id: "bph", title: "Benign Prostatic Hyperplasia", category: "Urological" },
  { id: "fibroadenoma", title: "Fibroadenoma", category: "Breast Pathology" },
  { id: "carcinoma-in-situ", title: "Carcinoma In Situ", category: "Cervical Pathology" },
];

type NavLink = { id: string; title: string };

const DATA: {
  definition: string;
  generalFeatures: string[];
  sites: string[];
  pathophysiology: string;
  etiology: string[];
  clinicalFeatures: string[];
  diagnosis: string[];
  treatment: string[];
  points: string[];
  images: string[];
  prev: NavLink | null;
  next: NavLink | null;
} = {
  definition: "Gastritis is inflammation of the gastric mucosa, which can be acute (erosive) or chronic (predominantly lymphocytic). Chronic gastritis is most often caused by Helicobacter pylori infection or autoimmune mechanisms and can lead to atrophy, metaplasia, and increased cancer risk.",
  generalFeatures: [
    "Acute gastritis: neutrophil infiltration, mucosal erosions, haemorrhage",
    "Chronic gastritis: lymphoplasmacytic infiltrate, lymphoid follicles, glandular atrophy",
    "H. pylori gastritis: organisms visible on Giemsa stain, activity (neutrophils) in pit epithelium",
    "Autoimmune gastritis: body predominant, parietal cell loss, enterochromaffin-like (ECL) cell hyperplasia",
    "Intestinal metaplasia: goblet cells, Paneth cells – precursor to adenocarcinoma",
    "Reactive gastropathy: foveolar hyperplasia, minimal inflammation – due to bile reflux or NSAIDs",
  ],
  sites: [
    "Antrum (H. pylori gastritis)",
    "Body/fundus (autoimmune gastritis)",
    "Pylorus (reactive gastropathy)",
  ],
  pathophysiology: "H. pylori urease produces ammonia, damaging epithelium and recruiting neutrophils. Cytotoxin-associated gene A (CagA) strains increase cancer risk. Autoimmune gastritis results from autoantibodies against parietal cell H+/K+ ATPase and intrinsic factor, leading to vitamin B12 deficiency and pernicious anaemia.",
  etiology: [
    "H. pylori infection (most common)",
    "Autoimmune (parietal cell antibodies)",
    "NSAIDs, alcohol, bile reflux (reactive gastropathy)",
    "Stress (acute erosive gastritis)",
    "Crohn's disease (rarely)",
  ],
  clinicalFeatures: [
    "Often asymptomatic",
    "Epigastric pain, nausea, bloating",
    "Haematemesis or melena in erosive gastritis",
    "Autoimmune: symptoms of pernicious anaemia (fatigue, neuropathy)",
    "Iron deficiency anaemia from chronic blood loss",
  ],
  diagnosis: [
    "Upper GI endoscopy with biopsy (gold standard)",
    "Rapid urease test / CLO test for H. pylori",
    "Histology: H&E, Giemsa or immunohistochemistry for H. pylori",
    "Serology: anti-parietal cell antibodies, anti-intrinsic factor antibodies",
    "Urea breath test or stool antigen for H. pylori",
  ],
  treatment: [
    "H. pylori eradication: triple therapy (PPI + amoxicillin + clarithromycin) for 14 days",
    "PPIs for symptom control",
    "Avoid NSAIDs, alcohol",
    "Iron or vitamin B12 supplementation if deficient",
    "Endoscopic surveillance for atrophic gastritis with metaplasia",
  ],
  points: [
    "Lymphoplasmacytic infiltrate in lamina propria",
    "Neutrophil infiltration (activity) in pit epithelium (H. pylori)",
    "Glandular atrophy and intestinal metaplasia in chronic cases",
    "H. pylori organisms on special stains (Giemsa)",
    "Lymphoid follicles (especially in H. pylori)",
  ],
  images: [
    "/images/spotting/pathology/gastritis.jpg",
    "/images/spotting/pathology/gastritis-high.jpg",
  ],
  prev: { id: "chronic-cholecystitis", title: "Chronic Cholecystitis" },
  next: { id: "peptic-ulcer", title: "Peptic Ulcer" },
};

// ─── Lightbox component ──────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-6" onClick={onClose}>
      <div className="relative max-w-5xl max-h-screen" onClick={e => e.stopPropagation()}>
        <img src={src} alt="Enlarged slide" className="max-h-screen max-w-full object-contain rounded-lg" />
        <button onClick={onClose} className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Lesson drawer navigation ────────────────────────────────────────────────
function LessonNav({ open, onClose, currentId }: { open: boolean; onClose: () => void; currentId: string }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />}
      <aside className={`fixed top-0 right-0 h-full w-72 sm:w-80 z-50 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className={`relative bg-gradient-to-r ${GRAD} p-4 flex items-center justify-between`}>
          <div>
            <p className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest">Pathology Lessons</p>
            <p className="text-sm font-extrabold text-white">All 15 Slides</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {ALL_LESSONS.map((l, i) => (
            <Link key={l.id} href={`/spotting/pathology/${l.id}`} onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition group ${l.id === currentId ? "bg-amber-50" : ""}`}>
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0 ${l.id === currentId ? `bg-gradient-to-br ${GRAD} text-white` : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}`}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-bold truncate ${l.id === currentId ? "text-amber-700" : "text-gray-800"}`}>{l.title}</p>
                <p className="text-[10px] text-gray-400">{l.category}</p>
              </div>
              {l.id === currentId && <ChevronRight className="w-3.5 h-3.5 text-amber-400 ml-auto shrink-0" />}
            </Link>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100">
          <Link href="/spotting/pathology/test" className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r ${GRAD} text-white font-extrabold text-sm`}>
            <Trophy className="w-4 h-4" /> Take Spotting Test
          </Link>
        </div>
      </aside>
    </>
  );
}

// ─── Bullet list helper ──────────────────────────────────────────────────────
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Main page component ─────────────────────────────────────────────────────
export default function GastritisPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const lessonIdx = ALL_LESSONS.findIndex(l => l.id === "gastritis");

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Print watermark */}
      <div className="print-watermark fixed inset-0 pointer-events-none text-green-800/20 text-8xl font-bold flex items-center justify-center rotate-45 hidden print:flex">
        PharmaWallah
      </div>

      {/* Background icons */}
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-amber-100 z-0 hidden sm:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* Lightbox */}
      {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

      {/* Navigation drawer */}
      <LessonNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} currentId="gastritis" />

      {/* Mobile top bar – with added top padding */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2.5 pt-[2.625rem]">
          <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0 flex-1 mr-2">
            <Link href="/spotting/pathology/" className="hover:text-amber-600 shrink-0 font-medium">Pathology</Link>
            <ChevronRight size={11} className="mx-0.5 text-gray-300 shrink-0" />
            <span className="text-amber-700 font-semibold truncate">{TITLE}</span>
          </div>
          <button onClick={() => setMobileNavOpen(v => !v)}
            className={`p-1.5 rounded-xl border transition-colors shrink-0 ${mobileNavOpen ? "bg-gray-900 text-white border-gray-900" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
            {mobileNavOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
        <div className="flex border-t border-gray-100">
          {DATA.prev ? (
            <Link href={`/spotting/pathology/${DATA.prev.id}`} className="flex-1 flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-colors min-w-0">
              <ChevronLeft size={13} className="shrink-0" /><span className="truncate">{DATA.prev.title}</span>
            </Link>
          ) : <div className="flex-1" />}
          {DATA.next && (
            <Link href={`/spotting/pathology/${DATA.next.id}`} className="flex-1 flex items-center justify-end gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-amber-50 hover:text-amber-700 transition-colors border-l border-gray-100 min-w-0">
              <span className="truncate">{DATA.next.title}</span><ChevronRight size={13} className="shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* Desktop layout – reduced top padding to pt-4 (1rem) on mobile */}
      <div className="relative z-10 mx-auto max-w-screen-xl px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-10 pt-4 sm:pt-0 w-full">

        {/* Desktop breadcrumb */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
          <Link href="/spotting" className="hover:text-amber-600 transition-colors">Spotting Centre</Link>
          <ChevronRight size={13} className="text-gray-300" />
          <Link href="/spotting/pathology/lessons" className="hover:text-amber-600 transition-colors">Pathology Lessons</Link>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-amber-700 font-semibold">{TITLE}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-5 xl:gap-8 items-start w-full">

          {/* Sidebar */}
          <aside className="hidden lg:block w-52 xl:w-60 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              <div className={`bg-gradient-to-br ${GRAD} rounded-2xl p-4 text-white shadow-lg`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={11} className="opacity-80" />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Pathology</span>
                </div>
                <p className="text-lg font-extrabold leading-tight">{EMOJI} {TITLE}</p>
                <p className="text-xs text-white/70 mt-0.5">{CAT}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  <BookOpen size={11} /> All Lessons
                </p>
                <ul className="space-y-0.5">
                  {ALL_LESSONS.map(l => (
                    <li key={l.id}>
                      <Link href={`/spotting/pathology/${l.id}`}
                        className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all ${
                          l.id === "gastritis"
                            ? `bg-gradient-to-r ${GRAD} text-white font-semibold shadow-sm`
                            : "text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                        }`}>
                        <span className="flex-1 leading-snug truncate">{l.title}</span>
                        <ChevronRight size={11} className={`shrink-0 transition-opacity ${l.id === "gastritis" ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Progress</p>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${GRAD} rounded-full`} style={{ width: `${((lessonIdx + 1) / ALL_LESSONS.length) * 100}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">Lesson {lessonIdx + 1} of {ALL_LESSONS.length}</p>
              </div>

              <Link href="/spotting/pathology/test"
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r ${GRAD} text-white text-xs font-extrabold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all`}>
                <Microscope size={13} /> Take Spotting Test
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 w-full space-y-5">

            {/* Hero banner – reduced padding to py-4 on mobile */}
            <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${GRAD} shadow-lg`}>
              <div className="absolute -top-8 -right-8 w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-3 right-4 opacity-10 pointer-events-none select-none text-6xl sm:text-8xl">{EMOJI}</div>
              <div className="relative z-10 px-4 py-4 sm:px-7 sm:py-7">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-2.5">
                  <Microscope size={9} /> Pathology Lesson · {CAT}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-1.5 break-words">
                  {TITLE}
                </h1>
                <p className="text-white/80 text-xs sm:text-sm">Lesson {lessonIdx + 1} of {ALL_LESSONS.length} · Detailed pathology</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-semibold">Pathology</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-semibold">{CAT}</span>
                </div>
              </div>
            </div>

            {/* Points of Recognition */}
            <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0`}>
                    <CheckSquare className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900">Points of Recognition</h2>
                </div>
                <ul className="space-y-2">
                  {DATA.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                      <span className={`w-5 h-5 rounded-lg bg-gradient-to-br ${GRAD} flex items-center justify-center text-white text-[9px] font-extrabold shrink-0 mt-0.5`}>{i + 1}</span>
                      <span className="text-xs sm:text-sm text-gray-700 leading-snug font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Slide images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DATA.images.map((src, idx) => (
                <figure key={idx} className="bg-gray-50 rounded-xl p-2 border border-gray-200 cursor-zoom-in" onClick={() => setLightbox(src)}>
                  <img src={src} alt={`${TITLE} slide ${idx + 1}`} className="w-full h-auto rounded-lg shadow-sm" />
                  <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
                    {idx === 0 ? "Low magnification" : "High magnification"}
                  </figcaption>
                </figure>
              ))}
            </div>

            {/* PathologyOutlines link */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <p className="text-[11px] text-indigo-500 font-semibold">Image reference: PathologyOutlines.com</p>
              <a href={PO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-pink-600 transition-colors">
                View topic <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Detailed theory */}
            <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0`}>
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900">Detailed Pathology</h2>
                </div>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Definition</h3>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{DATA.definition}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">General / Essential Features</h3>
                    <BulletList items={DATA.generalFeatures} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Sites</h3>
                    <BulletList items={DATA.sites} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Pathophysiology</h3>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{DATA.pathophysiology}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Etiology</h3>
                    <BulletList items={DATA.etiology} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Clinical Features</h3>
                    <BulletList items={DATA.clinicalFeatures} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Diagnosis</h3>
                    <BulletList items={DATA.diagnosis} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">Treatment</h3>
                    <BulletList items={DATA.treatment} />
                  </div>
                </div>
              </div>
            </div>

            {/* Video lesson */}
            {VIDEO_URL && (
              <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0`}>
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-sm sm:text-base font-extrabold text-gray-900">Video Lesson</h2>
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-black" style={{ paddingTop: "56.25%" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${VIDEO_URL.split('v=')[1]?.split('&')[0] || VIDEO_URL.split('youtu.be/')[1]?.split('?')[0]}`}
                      title={VIDEO_TITLE}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* References */}
            <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${GRAD} flex items-center justify-center shrink-0`}>
                    <Library className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900">References</h2>
                </div>
                <ul className="space-y-2">
                  <li className="text-xs text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-200">Kumar V, Abbas AK, Aster JC. Robbins & Cotran Pathologic Basis of Disease (10th ed.). Elsevier. 2020.</li>
                  <li className="text-xs text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-200">Harsh Mohan. Textbook of Pathology (8th ed.). Jaypee Brothers. 2019.</li>
                  <li className="text-xs text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-200">Bancroft JD, Layton C. Bancroft's Theory and Practice of Histological Techniques (8th ed.). Elsevier. 2019.</li>
                  <li className="text-xs text-gray-600 leading-relaxed pl-3 border-l-2 border-gray-200 flex items-center gap-1">
                    PathologyOutlines.com. (2024). <a href={PO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:text-pink-600"><ExternalLink className="w-3 h-3" /> View topic</a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Prev / Next */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {DATA.prev ? (
                <Link href={`/spotting/pathology/${DATA.prev.id}`}
                  className="group relative flex items-center gap-2 sm:gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden min-w-0">
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    <ChevronLeft size={15} className="text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Previous</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight truncate">{DATA.prev.title}</p>
                  </div>
                </Link>
              ) : <div />}
              {DATA.next ? (
                <Link href={`/spotting/pathology/${DATA.next.id}`}
                  className="group relative flex items-center justify-end gap-2 sm:gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden min-w-0">
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                  <div className="min-w-0 text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Next</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight truncate">{DATA.next.title}</p>
                  </div>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                    <ChevronRight size={15} className="text-amber-600" />
                  </div>
                </Link>
              ) : <div />}
            </div>

            {/* Take test CTA */}
            <div className={`relative rounded-2xl bg-gradient-to-r ${GRAD} overflow-hidden p-5 sm:p-7`}>
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-white font-extrabold text-sm sm:text-base mb-0.5">Ready to test yourself?</p>
                  <p className="text-white/80 text-xs">Apply what you've learned in the Pathology Spotting Test</p>
                </div>
                <Link href="/spotting/pathology/test"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-amber-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all shrink-0">
                  <Microscope size={15} /> Take the Test
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-10 h-10 rounded-2xl bg-gradient-to-br ${GRAD} text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center`}>
          <ArrowUp size={17} />
        </button>
      )}
    </section>
  );
}