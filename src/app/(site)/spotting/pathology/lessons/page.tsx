"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Microscope, FlaskConical, Leaf, Beaker, Stethoscope, Pill,
  BookOpen, Trophy, ChevronRight, ChevronLeft, Search,
  X, Clock, Tag, Zap, Layers, ArrowRight,
} from "lucide-react";

const bgIcons = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const LESSONS = [
  {
    id: "acute-appendicitis",
    title: "Acute Appendicitis",
    imageUrl: "/images/spotting/pathology/acute-appendicitis.jpg",
    tag: "GI Pathology",
    difficulty: "Medium",
    readTime: 8,
    summary:
      "Transmural neutrophilic inflammation of the appendix — hyperplastic lymphoid follicles, luminal obstruction, peritoneal fibrin exudate.",
  },
  {
    id: "chronic-cholecystitis",
    title: "Chronic Cholecystitis",
    imageUrl: "/images/spotting/pathology/chronic-cholecystitis.jpg",
    tag: "Hepatobiliary",
    difficulty: "Medium",
    readTime: 8,
    summary:
      "Rokitansky–Aschoff sinuses, mononuclear infiltrate, sub-epithelial fibrosis, and smooth-muscle hypertrophy — almost always gallstone-associated.",
  },
  {
    id: "gastritis",
    title: "Gastritis",
    imageUrl: "/images/spotting/pathology/gastritis.jpg",
    tag: "GI Pathology",
    difficulty: "Easy",
    readTime: 7,
    summary:
      "Lymphocytic and neutrophilic mucosal inflammation with spiral H. pylori in the mucus layer — gastric pit distortion and intestinal metaplasia in chronic cases.",
  },
  {
    id: "peptic-ulcer",
    title: "Peptic Ulcer",
    imageUrl: "/images/spotting/pathology/peptic-ulcer.jpg",
    tag: "GI Pathology",
    difficulty: "Medium",
    readTime: 8,
    summary:
      "Full-thickness mucosal defect with four-zone base (exudate → necrosis → granulation → scar) — sharply punched-out edges, vessels at ulcer floor.",
  },
  {
    id: "tb-granuloma",
    title: "TB Granuloma",
    imageUrl: "/images/spotting/pathology/tb-granuloma.jpg",
    tag: "Inflammatory",
    difficulty: "Medium",
    readTime: 9,
    summary:
      "Central caseous necrosis, Langhans giant cells with horseshoe nuclei, epithelioid macrophages, lymphocytic rim — classic delayed hypersensitivity reaction.",
  },
  {
    id: "leiomyoma",
    title: "Leiomyoma",
    imageUrl: "/images/spotting/pathology/leiomyoma.jpg",
    tag: "Smooth Muscle Tumour",
    difficulty: "Medium",
    readTime: 7,
    summary:
      "Whorled fascicles of spindle smooth-muscle cells with cigar-shaped nuclei — commonest uterine neoplasm, oestrogen-dependent, low mitotic activity.",
  },
  {
    id: "lipoma",
    title: "Lipoma",
    imageUrl: "/images/spotting/pathology/lipoma.jpg",
    tag: "Soft Tissue Tumour",
    difficulty: "Easy",
    readTime: 6,
    summary:
      "Lobules of mature adipocytes with clear cytoplasm and peripheral nuclei, delicate fibrovascular septa — no atypia, no lipoblasts, no mitoses.",
  },
  {
    id: "squamous-cell-carcinoma",
    title: "Squamous Cell Carcinoma",
    imageUrl: "/images/spotting/pathology/squamous-cell-carcinoma.jpg",
    tag: "Malignant Tumour",
    difficulty: "Hard",
    readTime: 10,
    summary:
      "Keratin pearls, desmosomal bridges, polygonal eosinophilic cells with stromal invasion — arises from squamous epithelium or squamous metaplasia.",
  },
  {
    id: "hodgkin-lymphoma",
    title: "Hodgkin's Disease",
    imageUrl: "/images/spotting/pathology/hodgkin-lymphoma.jpg",
    tag: "Haematological",
    difficulty: "Hard",
    readTime: 11,
    summary:
      "Pathognomonic Reed–Sternberg cells with owl-eye nucleoli (CD15+, CD30+) in a mixed inflammatory background — B-cell malignancy, bimodal age distribution.",
  },
  {
    id: "adenocarcinoma",
    title: "Adenocarcinoma",
    imageUrl: "/images/spotting/pathology/adenocarcinoma.jpg",
    tag: "Malignant Tumour",
    difficulty: "Hard",
    readTime: 10,
    summary:
      "Irregular malignant glands, abundant intraluminal mucin, invasion through muscularis mucosae, desmoplastic stroma — affects colon, stomach, lung, pancreas.",
  },
  {
    id: "fatty-liver",
    title: "Fatty Liver",
    imageUrl: "/images/spotting/pathology/fatty-liver.jpg",
    tag: "Hepatic Pathology",
    difficulty: "Easy",
    readTime: 6,
    summary:
      "Macro-vesicular steatosis with ballooned hepatocytes and dilated central vein — centrilobular distribution in NAFLD and alcoholic liver disease.",
  },
  {
    id: "cvc-liver",
    title: "Chronic Venous Congestion (Liver)",
    imageUrl: "/images/spotting/pathology/cvc-liver.jpg",
    tag: "Hepatic Pathology",
    difficulty: "Medium",
    readTime: 7,
    summary:
      "Dilated central veins, centrilobular haemorrhagic necrosis, periportal fatty change — 'nutmeg liver' from right heart failure back-pressure.",
  },
  {
    id: "bph",
    title: "Benign Prostatic Hyperplasia",
    imageUrl: "/images/spotting/pathology/bph.jpg",
    tag: "Urological",
    difficulty: "Medium",
    readTime: 8,
    summary:
      "Cystic glands with papillary projections, double-layer epithelium (columnar + cuboidal basal), corpora amylacea — DHT-driven periurethral zone hyperplasia.",
  },
  {
    id: "fibroadenoma",
    title: "Fibroadenoma",
    imageUrl: "/images/spotting/pathology/fibroadenoma.jpg",
    tag: "Breast Pathology",
    difficulty: "Easy",
    readTime: 6,
    summary:
      "Biphasic benign tumour with fibrous stroma compressing ducts into epithelial clefts — commonest breast tumour in women under 30, well-circumscribed.",
  },
  {
    id: "carcinoma-in-situ",
    title: "Carcinoma In Situ",
    imageUrl: "/images/spotting/pathology/carcinoma-in-situ.jpg",
    tag: "Cervical Pathology",
    difficulty: "Hard",
    readTime: 9,
    summary:
      "Full-thickness cervical dysplasia with SMILE lesion — undifferentiated cells filling crypts, increased mitoses throughout, intact basement membrane.",
  },
];

const DIFF_BADGE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};

const TAG_COLORS: Record<string, string> = {
  "GI Pathology":         "text-orange-600",
  "Hepatobiliary":        "text-amber-600",
  "Inflammatory":         "text-teal-600",
  "Smooth Muscle Tumour": "text-violet-600",
  "Soft Tissue Tumour":   "text-lime-700",
  "Malignant Tumour":     "text-red-600",
  "Haematological":       "text-indigo-600",
  "Hepatic Pathology":    "text-yellow-700",
  "Urological":           "text-sky-600",
  "Breast Pathology":     "text-pink-600",
  "Cervical Pathology":   "text-fuchsia-600",
};

export default function PathologyLessonsPage() {
  const [search,    setSearch]    = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const tags = ["All", ...Array.from(new Set(LESSONS.map(l => l.tag)))];

  const filtered = useMemo(() =>
    LESSONS.filter(l =>
      (activeTag === "All" || l.tag === activeTag) &&
      l.title.toLowerCase().includes(search.toLowerCase())
    ),
    [search, activeTag]
  );

  const easyCount   = LESSONS.filter(l => l.difficulty === "Easy").length;
  const mediumCount = LESSONS.filter(l => l.difficulty === "Medium").length;
  const hardCount   = LESSONS.filter(l => l.difficulty === "Hard").length;

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══════════════════════════════════════════ HERO */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-pink-500 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 left-24 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-16 sm:right-24 bottom-6 opacity-[0.12] pointer-events-none">
          <FlaskConical size={90} className="text-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold mb-4 flex-wrap">
            <Link href="/spotting" className="hover:text-white transition flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Spotting Centre
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Pathology</span>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> Pathology Lessons
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white mb-2 tracking-tight leading-tight">
            Pathology
          </h1>
          <p className="text-white/80 text-base sm:text-lg font-semibold mb-3">
            Disease Processes &amp; Lesion Recognition
          </p>
          <p className="text-white/70 text-sm max-w-xl leading-relaxed mb-8">
            Examine each slide systematically — architecture first, then cellular detail — before reading the annotated lesson notes.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/spotting/pathology/test"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
              <Trophy className="w-4 h-4" /> Take Spot Test
            </Link>
            <Link href="/spotting"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 border border-white/40 text-white font-extrabold text-sm hover:bg-white/30 transition-all duration-300">
              <ChevronLeft className="w-4 h-4" /> All Categories
            </Link>
          </div>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { n: String(LESSONS.length), l: "Lessons" },
              { n: String(easyCount),      l: "Easy"    },
              { n: String(mediumCount),    l: "Medium"  },
              { n: String(hardCount),      l: "Hard"    },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white leading-none">{n}</div>
                <div className="text-xs text-white/70 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════ CONTENT */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Search + tag filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search lessons…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl border-2 border-gray-200 focus:border-indigo-400 focus:outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* scrollable tag pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-hide">
            {tags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all duration-200 ${
                  activeTag === tag
                    ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Count + test shortcut */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
            {filtered.length} lesson{filtered.length !== 1 ? "s" : ""}
          </span>
          <Link href="/spotting/pathology/test"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:opacity-80 transition">
            <Trophy className="w-3.5 h-3.5" /> Go to Spot Test <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Lesson grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
            >
              {filtered.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    href={`/spotting/pathology/${lesson.id}`}
                    className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full"
                  >
                    {/* top accent stripe */}
                    <div className="h-[3px] bg-gradient-to-r from-indigo-600 to-pink-500" />

                    {/* image */}
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      <Image
                        src={lesson.imageUrl}
                        alt={lesson.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                      {/* difficulty badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_BADGE[lesson.difficulty]}`}>
                          {lesson.difficulty}
                        </span>
                      </div>
                      {/* slide number */}
                      <div className="absolute bottom-2 left-2 w-6 h-6 rounded-lg bg-black/55 flex items-center justify-center">
                        <span className="text-white text-[9px] font-extrabold">
                          {LESSONS.findIndex(l => l.id === lesson.id) + 1}
                        </span>
                      </div>
                    </div>

                    {/* card body */}
                    <div className="flex flex-col flex-1 p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Tag className={`w-3 h-3 shrink-0 ${TAG_COLORS[lesson.tag] ?? "text-indigo-600"}`} />
                        <span className={`text-[10px] font-extrabold uppercase tracking-wide truncate ${TAG_COLORS[lesson.tag] ?? "text-indigo-600"}`}>
                          {lesson.tag}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-gray-900 text-sm mb-1.5 leading-snug">
                        {lesson.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
                        {lesson.summary}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                          <Clock className="w-3 h-3" /> {lesson.readTime} min
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-600">
                          Open <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold text-sm">No lessons match your search</p>
              <button
                onClick={() => { setSearch(""); setActiveTag("All"); }}
                className="mt-4 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <div className="mt-12 sm:mt-16 relative rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 overflow-hidden p-6 sm:p-8">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-white" />
                <span className="text-white font-extrabold text-sm sm:text-base">Ready to be tested?</span>
              </div>
              <p className="text-white/80 text-xs sm:text-sm">
                Take the <span className="font-bold text-white">Pathology Spot Test</span> — 15 shuffled slides, point-writing, instant scoring.
              </p>
            </div>
            <Link href="/spotting/pathology/test"
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-white text-indigo-600 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 shrink-0">
              <Trophy className="w-4 h-4" /> Start Spot Test <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}