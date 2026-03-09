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
  { id: "senna", title: 'Senna Leaf Powder', imageUrl: '/images/spotting/powder/senna.jpg', tag: 'Leaf', difficulty: 'Easy', readTime: 6, summary: 'Paracytic stomata, unicellular warty trichomes, and rosette crystals of calcium oxalate — hallmark of this anthraquinone laxative.' },
  { id: "clove", title: 'Clove Powder (Syzygium aromaticum)', imageUrl: '/images/spotting/powder/clove.jpg', tag: 'Floral', difficulty: 'Medium', readTime: 7, summary: 'Fibres, vessels, brown pigmented cells, spherical pollen grains, and oil glands filled with volatile oil.' },
  { id: "ginger", title: 'Ginger Rhizome Powder (Zingiber officinale)', imageUrl: '/images/spotting/powder/ginger.jpg', tag: 'Rhizome', difficulty: 'Easy', readTime: 6, summary: 'Large oval starch grains with eccentric hilum, yellowish oleoresin cells, and thin-walled parenchyma with cork fragments.' },
  { id: "turmeric", title: 'Turmeric Rhizome Powder (Curcuma longa)', imageUrl: '/images/spotting/powder/turmeric.jpg', tag: 'Rhizome', difficulty: 'Easy', readTime: 6, summary: 'Yellow parenchyma cells packed with starch, large oil globules, thin-walled cork cells — bright yellow colouring from curcuminoids.' },
  { id: "nux-vomica", title: 'Nux Vomica Seed Powder (Strychnos)', imageUrl: '/images/spotting/powder/nux-vomica.jpg', tag: 'Seed', difficulty: 'Hard', readTime: 9, summary: 'Stone cells in groups, lignified trichomes with thick walls, endosperm cells containing aleurone and fixed oil — strychnine alkaloids.' },
  { id: "digitalis", title: 'Digitalis Leaf Powder (Digitalis purpurea)', imageUrl: '/images/spotting/powder/digitalis.jpg', tag: 'Leaf', difficulty: 'Medium', readTime: 8, summary: 'Anomocytic stomata, non-glandular trichomes, prismatic calcium oxalate crystals in mesophyll cells — cardiac glycoside source.' },
  { id: "cascara", title: 'Cascara Sagrada Bark Powder', imageUrl: '/images/spotting/powder/cascara.jpg', tag: 'Bark', difficulty: 'Medium', readTime: 7, summary: 'Starch granules, cork cells, calcium oxalate crystals with crystal sheath fibres, and reddish-brown pigmented cells.' },
  { id: "belladonna", title: 'Belladonna Root Powder (Atropa)', imageUrl: '/images/spotting/powder/belladonna.jpg', tag: 'Root', difficulty: 'Hard', readTime: 9, summary: 'Abundant simple starch grains, micro sand crystals, vessels with bordered pits, and parenchyma cells — atropine-bearing drug.' }
];

const DIFF_BADGE: Record<string, string> = {
  Easy:   "bg-green-50 text-green-700 border-green-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard:   "bg-red-50 text-red-700 border-red-200",
};

export default function PowderMicroscopyLessonsPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setTag] = useState("All");

  const tags = ["All", ...Array.from(new Set(LESSONS.map(l => l.tag)))];

  const filtered = useMemo(() =>
    LESSONS.filter(l =>
      (activeTag === "All" || l.tag === activeTag) &&
      l.title.toLowerCase().includes(search.toLowerCase())
    ),
    [search, activeTag]
  );

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-cyan-400 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 left-24 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-24 bottom-6 opacity-[0.12] pointer-events-none">
          <Leaf size={90} className="text-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-14 md:py-20">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold mb-4">
            <Link href="/spotting" className="hover:text-white transition flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Spotting Centre
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Powder Microscopy</span>
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> Powder Microscopy Lessons
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 tracking-tight leading-tight">
            Powder Microscopy
          </h1>
          <p className="text-white/80 text-lg font-semibold mb-3">Pharmacognostic Powder Analysis</p>
          <p className="text-white/70 text-sm max-w-xl leading-relaxed mb-8">
            Identify crude drug powders using characteristic microscopic markers — trichomes, crystals, starch grains, fibres, and tracheids.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            <Link href="/spotting/powder-microscopy/test"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
              <Trophy className="w-4 h-4" /> Take Spot Test
            </Link>
            <Link href="/spotting"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 border border-white/40 text-white font-extrabold text-sm hover:bg-white/30 transition-all duration-300">
              <ChevronLeft className="w-4 h-4" /> All Categories
            </Link>
          </div>

          {/* Mini stats */}
          <div className="flex flex-wrap gap-7">
            {[
              { n: String(LESSONS.length),                                         l: "Lessons"  },
              { n: String(LESSONS.filter(l => l.difficulty === "Easy").length),   l: "Easy"     },
              { n: String(LESSONS.filter(l => l.difficulty === "Medium").length), l: "Medium"   },
              { n: String(LESSONS.filter(l => l.difficulty === "Hard").length),   l: "Hard"     },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-extrabold text-white leading-none">{n}</div>
                <div className="text-xs text-white/70 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-10">

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search lessons…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-2xl border-2 border-gray-200 focus:border-emerald-400 focus:outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
            {tags.map(tag => (
              <button key={tag} onClick={() => setTag(tag)}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all duration-200 ${activeTag === tag ? "bg-gradient-to-r from-emerald-600 to-cyan-400 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results count + test link */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1">
            {filtered.length} lesson{filtered.length !== 1 ? "s" : ""}
          </span>
          <Link href="/spotting/powder-microscopy/test"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:opacity-80 transition">
            <Trophy className="w-3.5 h-3.5" /> Go to Spot Test <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Lesson grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div key="grid"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((lesson, i) => (
                <motion.div key={lesson.id}
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}>
                  <Link
                    href={`/spotting/powder-microscopy/lessons/${lesson.id}`}
                    className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full">

                    <div className="h-[3px] bg-gradient-to-r from-emerald-600 to-cyan-400" />

                    {/* Slide image */}
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      <Image
                        src={lesson.imageUrl}
                        alt={lesson.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow-lg">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFF_BADGE[lesson.difficulty]}`}>
                          {lesson.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Card info */}
                    <div className="flex flex-col flex-1 p-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Tag className="w-3 h-3 text-emerald-700 shrink-0" />
                        <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wide truncate">
                          {lesson.tag}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-gray-900 text-sm mb-1.5 leading-snug">{lesson.title}</h3>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">{lesson.summary}</p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                          <Clock className="w-3 h-3" /> {lesson.readTime} min
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600">
                          Open <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-500 font-semibold text-sm">No lessons match your search</p>
              <button onClick={() => { setSearch(""); setTag("All"); }}
                className="mt-4 px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition">
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom CTA */}
        <div className="mt-14 relative rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-400 overflow-hidden p-7">
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-white" />
                <span className="text-white font-extrabold">Ready to be tested?</span>
              </div>
              <p className="text-white/80 text-sm">
                Take the <span className="font-bold text-white">Powder Microscopy Spot Test</span> — shuffled slides, point-writing questions, and instant scoring.
              </p>
            </div>
            <Link href="/spotting/powder-microscopy/test"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-emerald-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300 shrink-0">
              <Trophy className="w-4 h-4" /> Start Spot Test <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}