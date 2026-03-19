"use client";
// components/spotting/HistologyLessonTemplate.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, BookOpen, ExternalLink,
  Microscope, Play, X, Zap, ArrowUp, Menu,
  CheckSquare, Library, Video,
} from "lucide-react";
import {
  Pill, FlaskConical, Beaker, Stethoscope, Leaf,
  Microscope as MicIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Ref {
  authors: string;
  title: string;
  edition?: string;
  publisher: string;
  year: string;
  url?: string;
}

interface NavLink { id: string; title: string; }

interface Props {
  id: string;
  title: string;
  category: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  pointsOfIdentification: string[];
  theory: React.ReactNode;
  references: Ref[];
  videoUrl?: string;
  prevLesson?: NavLink;
  nextLesson?: NavLink;
}

// ─── Ordered lesson list (for sidebar + hub nav) ─────────────────────────────
export const HISTOLOGY_LESSONS: NavLink[] = [
  { id: "lungs",                          title: "Lungs"                          },
  { id: "stomach",                        title: "Stomach"                        },
  { id: "kidney",                         title: "Kidney"                         },
  { id: "small-intestine",               title: "Small Intestine"               },
  { id: "large-intestine",               title: "Large Intestine"               },
  { id: "appendix",                       title: "Appendix"                       },
  { id: "smooth-muscle",                 title: "Smooth Muscle"                 },
  { id: "skeletal-muscle",               title: "Skeletal Muscle"               },
  { id: "rbcs",                           title: "Red Blood Cells"               },
  { id: "stratified-squamous-epithelium",title: "Stratified Squamous Epithelium"},
];

// ─── BG icons ─────────────────────────────────────────────────────────────────
const BG_ICONS = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 28 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 26 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 28 },
  { Icon: MicIcon,      top: "8%",  left: "96.5%", size: 28 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 26 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 26 },
];


// ─── Video Player ─────────────────────────────────────────────────────────────
function VideoPlayer({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  // Extract video ID
  const videoId =
    url.split("v=")[1]?.split("&")[0] ||
    url.split("youtu.be/")[1]?.split("?")[0] ||
    url.split("embed/")[1]?.split("?")[0];

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />

      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
            <Video className="w-4 h-4 text-white" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Video Lesson
            </p>
            <p className="text-sm font-extrabold text-gray-900">{title}</p>
          </div>
        </div>

        {!playing ? (
          <div
            className="relative rounded-xl overflow-hidden cursor-pointer group"
            style={{ paddingTop: "56.25%" }}
            onClick={() => setPlaying(true)}
          >
            {/* Thumbnail */}
            <img
              src={thumbnail}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">

              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                <Play className="w-7 h-7 text-blue-600 ml-1" fill="currentColor" />
              </div>

            </div>

            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-xs font-semibold">
                Click to play video lesson
              </p>
            </div>
          </div>
        ) : (
          <div
            className="relative rounded-xl overflow-hidden bg-black"
            style={{ paddingTop: "56.25%" }}
          >
            <iframe
              src={`${embedUrl}?autoplay=1`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />

            <button
              onClick={() => setPlaying(false)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            Open on YouTube
          </a>
        </p>
      </div>
    </div>
  );
}

// ─── References Block ─────────────────────────────────────────────────────────
function ReferencesBlock({ refs }: { refs: Ref[] }) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
            <Library className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm sm:text-base font-extrabold text-gray-900">References</h3>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1 shrink-0">
            {refs.length} sources
          </span>
        </div>
        <ol className="space-y-3">
          {refs.map((ref, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="w-5 h-5 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-[9px] font-extrabold text-blue-700 shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-gray-700 leading-relaxed break-words w-full">
                <span className="text-gray-500">{ref.authors} </span>
                <em className="font-semibold text-gray-900 not-italic">{ref.title}</em>
                {ref.edition && <span className="text-gray-400"> ({ref.edition})</span>}
                <span className="text-gray-400">. {ref.publisher}; {ref.year}.</span>
                {ref.url && (
                  <a href={ref.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-1.5 text-blue-600 hover:text-green-600 transition-colors break-all">
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />{ref.url.replace("https://", "").replace("http://", "")}
                  </a>
                )}
              </p>
            </li>
          ))}
        </ol>
        <p className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-gray-100 leading-relaxed">
          <strong className="text-gray-500">Disclaimer:</strong> These notes are for educational purposes only and compiled from standard histology textbooks. Clinical interpretation of slides requires a qualified histologist or pathologist.
        </p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════
export default function HistologyLessonTemplate({
  id, title, category, emoji, gradient, accentColor,
  pointsOfIdentification, theory, references, videoUrl,
  prevLesson, nextLesson,
}: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const lessonIdx = HISTOLOGY_LESSONS.findIndex(l => l.id === id);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    const onKey    = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileNavOpen(false); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("keydown", onKey); };
  }, []);

  const BASE = "/spotting/histology/lessons";

  return (
    <section className="min-h-screen bg-white relative" style={{ overflowX: "hidden" }}>

      {/* BG icons */}
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100 z-0 hidden sm:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        {/* Added pt-[2.625rem] to match pathology fix */}
        <div className="flex items-center justify-between px-3 py-2.5 pt-[2.625rem]">
          <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0 flex-1 mr-2">
            <Link href="/spotting/histology/lessons" className="hover:text-blue-600 shrink-0 font-medium">Histology</Link>
            <ChevronRight size={11} className="mx-0.5 text-gray-300 shrink-0" />
            <span className="text-blue-700 font-semibold truncate">{title}</span>
          </div>
          <button onClick={() => setMobileNavOpen(v => !v)}
            className={`p-1.5 rounded-xl border transition-colors shrink-0 ${mobileNavOpen ? "bg-gray-900 text-white border-gray-900" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
            {mobileNavOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
        {mobileNavOpen && (
          <div className="bg-white border-t border-gray-100 px-3 pb-3 shadow-xl max-h-[60vh] overflow-y-auto">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 pt-2 mb-1.5">All Lessons</p>
            <ul className="space-y-0.5">
              {HISTOLOGY_LESSONS.map(l => (
                <li key={l.id}>
                  <Link href={`${BASE}/${l.id}`} onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition-all ${l.id === id ? `bg-gradient-to-r ${gradient} text-white font-semibold` : "text-gray-700 hover:bg-blue-50"}`}>
                    <span className="flex-1 leading-snug">{l.title}</span>
                    {l.id === id && <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full shrink-0">Now</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex border-t border-gray-100">
          {prevLesson ? (
            <Link href={`${BASE}/${prevLesson.id}`} className="flex-1 flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors min-w-0">
              <ChevronLeft size={13} className="shrink-0" /><span className="truncate">{prevLesson.title}</span>
            </Link>
          ) : <div className="flex-1" />}
          {nextLesson && (
            <Link href={`${BASE}/${nextLesson.id}`} className="flex-1 flex items-center justify-end gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border-l border-gray-100 min-w-0">
              <span className="truncate">{nextLesson.title}</span><ChevronRight size={13} className="shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Page Layout – with minimal top padding on mobile (pt-4) ── */}
      <div className="relative z-10 mx-auto max-w-screen-xl px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-10 pt-4 sm:pt-0 w-full">

        {/* Desktop breadcrumb */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
          {[
            { href: "/spotting",                    label: "Spotting Centre" },
            { href: "/spotting/histology/lessons",  label: "Histology Lessons" },
          ].map(({ href, label }) => (
            <span key={href} className="flex items-center gap-1.5">
              <Link href={href} className="hover:text-blue-600 transition-colors">{label}</Link>
              <ChevronRight size={13} className="text-gray-300" />
            </span>
          ))}
          <span className="text-blue-700 font-semibold">{title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-5 xl:gap-8 items-start w-full">

          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:block w-52 xl:w-60 flex-shrink-0">
            <div className="sticky top-[80px] space-y-4">
              {/* Subject card */}
              <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-lg`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={11} className="opacity-80" />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Histology</span>
                </div>
                <p className="text-lg font-extrabold leading-tight">{emoji} {title}</p>
                <p className="text-xs text-white/70 mt-0.5">{category}</p>
              </div>

              {/* Lesson list */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  <BookOpen size={11} /> All Lessons
                </p>
                <ul className="space-y-0.5">
                  {HISTOLOGY_LESSONS.map(l => (
                    <li key={l.id}>
                      <Link href={`${BASE}/${l.id}`}
                        className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all ${
                          l.id === id
                            ? `bg-gradient-to-r ${gradient} text-white font-semibold shadow-sm`
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}>
                        <span className="flex-1 leading-snug truncate">{l.title}</span>
                        <ChevronRight size={11} className={`shrink-0 transition-opacity ${l.id === id ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Progress */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Progress</p>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
                    style={{ width: `${((lessonIdx + 1) / HISTOLOGY_LESSONS.length) * 100}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1.5">Lesson {lessonIdx + 1} of {HISTOLOGY_LESSONS.length}</p>
              </div>

              {/* Take test */}
              <Link href="/spotting/histology/test"
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r ${gradient} text-white text-xs font-extrabold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all`}>
                <Microscope size={13} /> Take Spotting Test
              </Link>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <div className="flex-1 min-w-0 w-full space-y-5">

            {/* Hero banner */}
            <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-r ${gradient} shadow-lg`}>
              <div className="absolute -top-8 -right-8 w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-3 right-4 opacity-10 pointer-events-none select-none text-6xl sm:text-8xl">{emoji}</div>
              <div className="relative z-10 px-4 py-5 sm:px-7 sm:py-7">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-2.5">
                  <Microscope size={9} /> Histology Lesson · {category}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-1.5 break-words">
                  {title}
                </h1>
                <p className="text-white/80 text-xs sm:text-sm">Lesson {lessonIdx + 1} of {HISTOLOGY_LESSONS.length} · Detailed theory + identification points</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {["Histology", category, `${pointsOfIdentification.length} ID Points`].map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-semibold">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Points of Identification ── */}
            <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient}`} />
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                    <CheckSquare className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900">Points of Identification</h2>
                  <span className="ml-auto text-xs text-gray-400 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 text-blue-700 font-semibold shrink-0">
                    {pointsOfIdentification.length} points
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {pointsOfIdentification.map((point, i) => (
                    <div key={i} className={`flex items-start gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100`}>
                      <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-[10px] font-extrabold shrink-0 mt-0.5`}>
                        {i + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-700 leading-snug font-medium">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Detailed Theory – with table styles ── */}
            <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient}`} />
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                    <BookOpen className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-sm sm:text-base font-extrabold text-gray-900">Detailed Theory</h2>
                </div>
                {/* Theory content with table styles */}
                <div className="theory-content space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed overflow-x-auto [&_table]:min-w-full [&_table]:border-collapse [&_table]:border [&_table]:border-gray-200 [&_thead]:bg-gray-50 [&_th]:p-3 [&_th]:text-left [&_th]:font-bold [&_th]:text-gray-900 [&_th]:border [&_th]:border-gray-200 [&_td]:p-3 [&_td]:border [&_td]:border-gray-200 [&_td]:align-top [&_tr:last-child_td]:border-b [&_tr]:border-b [&_tr]:border-gray-200 [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:font-extrabold [&_h3]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:pt-4 [&_h3]:border-t [&_h3]:border-gray-100 [&_h4]:text-sm [&_h4]:sm:text-base [&_h4]:font-bold [&_h4]:text-blue-700 [&_h4]:mt-5 [&_h4]:mb-2 [&_p]:leading-relaxed [&_ul]:space-y-2 [&_ul]:pl-1 [&_li]:flex [&_li]:gap-2.5 [&_li]:leading-relaxed [&_strong]:font-bold [&_strong]:text-gray-900">
                  {theory}
                </div>
              </div>
            </div>

            {/* ── Video Lesson ── */}
            {videoUrl ? (
              <VideoPlayer url={videoUrl} title={`${title} — Histology Video Lesson`} />
            ) : (
              <div className="relative rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 overflow-hidden p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                    <Video className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-gray-500">Video Lesson</p>
                    <p className="text-xs text-gray-400">Video coming soon — check back later or add a <code className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded text-[10px]">videoUrl</code> prop</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── References ── */}
            <ReferencesBlock refs={references} />

            {/* ── Prev / Next ── */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
              {prevLesson ? (
                <Link href={`${BASE}/${prevLesson.id}`}
                  className="flex-1 group relative flex items-center gap-2 sm:gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden min-w-0">
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient}`} />
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <ChevronLeft size={15} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Previous</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight truncate">{prevLesson.title}</p>
                  </div>
                </Link>
              ) : <div className="hidden sm:block flex-1" />}
              {nextLesson ? (
                <Link href={`${BASE}/${nextLesson.id}`}
                  className="flex-1 group relative flex items-center justify-end gap-2 sm:gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden min-w-0">
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient}`} />
                  <div className="min-w-0 text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Next</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight truncate">{nextLesson.title}</p>
                  </div>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <ChevronRight size={15} className="text-blue-600" />
                  </div>
                </Link>
              ) : <div className="hidden sm:block flex-1" />}
            </div>

            {/* Take test CTA */}
            <div className={`relative rounded-2xl bg-gradient-to-r ${gradient} overflow-hidden p-5 sm:p-7`}>
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-white font-extrabold text-sm sm:text-base mb-0.5">Ready to test yourself?</p>
                  <p className="text-white/80 text-xs">Apply what you've learned in the Histology Spotting Test</p>
                </div>
                <Link href="/spotting/histology/test"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all shrink-0">
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
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-10 h-10 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center`}>
          <ArrowUp size={17} />
        </button>
      )}
    </section>
  );
}