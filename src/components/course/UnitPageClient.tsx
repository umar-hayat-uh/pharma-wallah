"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, BookOpen, ChevronLeft, ChevronRight, ImageIcon, Zap } from "lucide-react";
import { CourseUnit, SubjectMeta } from "@/lib/courses/types";
import UnitTracker from "@/components/UnitTracker";
import UnitSidebar from "./UnitSidebar";
import MobileUnitNav from "./MobileUnitNav";
import MarkdownRenderer from "./MarkdownRenderer";
import PdfDownloadButton from "./PdfDownloadButton";
import Comments from "@/components/course/Comments";          // <-- NEW

interface Props {
  subject: SubjectMeta;
  unit: CourseUnit;
  prevUnit: CourseUnit | null;
  nextUnit: CourseUnit | null;
  unitIndex: number;
  content: string;
  basePath: string;
}

export default function UnitPageClient({
  subject,
  unit,
  prevUnit,
  nextUnit,
  unitIndex,
  content,
  basePath,
}: Props) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [imgError, setImgError] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const GRAD = unit.gradient;

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Unique identifier for the comment thread of this unit
  const commentUnitId = `${subject.slug}/${unit.id}`;

  return (
    <section className="min-h-screen bg-white relative" style={{ overflowX: "hidden" }}>
      <UnitTracker unitTitle={unit.title} />

      <MobileUnitNav
        subject={subject}
        unit={unit}
        prevUnit={prevUnit}
        nextUnit={nextUnit}
        basePath={basePath}
        printRef={printRef}
      />

      <div className="relative z-10 mx-auto max-w-screen-xl px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-10 w-full">
        {/* Breadcrumb (unchanged) */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
          {[
            { href: "/", label: "Home" },
            { href: "/courses", label: "Courses" },
            { href: `/courses/${subject.semesterSlug}`, label: subject.semester },
            { href: basePath, label: subject.title },
          ].map(({ href, label }) => (
            <span key={href} className="flex items-center gap-1.5">
              <Link href={href} className="hover:text-blue-600 transition-colors">{label}</Link>
              <ChevronRight size={13} className="text-gray-300" />
            </span>
          ))}
          <span className="text-blue-700 font-semibold">{unit.shortTitle}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-5 xl:gap-8 items-start w-full">
          <UnitSidebar subject={subject} unit={unit} basePath={basePath} />

          <div className="flex-1 min-w-0 w-full">
            {/* Hero section (unchanged) */}
            <div className={`relative rounded-2xl overflow-hidden mb-4 sm:mb-5 bg-gradient-to-r ${GRAD} shadow-lg`}>
              <div className="absolute -top-8 -right-8 w-32 sm:w-44 h-32 sm:h-44 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-3 right-3 opacity-10 pointer-events-none select-none">
                <span className="text-6xl sm:text-8xl">{unit.emoji}</span>
              </div>
              <div className="relative z-10 px-4 py-5 sm:px-7 sm:py-7">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-2.5">
                  <Zap size={9} /> {subject.title} · {subject.semester}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-1.5 break-words">
                  {unit.title}
                </h1>
                <p className="text-white/80 text-xs sm:text-sm max-w-lg break-words">{unit.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[
                    `Unit ${unitIndex + 1} of ${subject.units.length}`,
                    `${unit.readTime} min`,
                    unit.difficulty,
                  ].map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-semibold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Main content (unchanged) */}
            <div ref={printRef} style={{ background: "#fff" }}>
              {unit.previewImage && !imgError && (
                <div className="mb-4 sm:mb-5 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-white">
                    <ImageIcon size={13} className="text-blue-500 shrink-0" />
                    <span className="text-xs font-semibold text-gray-500">Unit Overview</span>
                  </div>
                  <img
                    src={unit.previewImage}
                    alt={`${unit.shortTitle} overview`}
                    crossOrigin="anonymous"
                    className="w-full max-h-72 sm:max-h-96 object-contain bg-gray-50 p-2 sm:p-4"
                    onError={() => setImgError(true)}
                  />
                </div>
              )}

              <div
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-5 md:p-8 overflow-hidden"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                {content ? (
                  <MarkdownRenderer content={content} />
                ) : (
                  <div className="py-16 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-gray-700 font-bold mb-1">Content file not found</p>
                    <p className="text-gray-400 text-xs mb-4 break-all">
                      Place{" "}
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded text-blue-600 font-mono">
                        public/content/{unit.contentFile}
                      </code>
                    </p>
                    <Link
                      href={basePath}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${GRAD} text-white text-xs font-extrabold`}
                    >
                      ← Back to all units
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* PDF download button (unchanged) */}
            {content && (
              <div className="flex justify-center mt-6">
                <PdfDownloadButton
                  printRef={printRef}
                  fileName={unit.id}
                  headerLabel={`PHARMAWALLAH · ${subject.title}`}
                  footerLabel={`${unit.title} · pharmawallah.com`}
                  gradientClass={GRAD}
                />
              </div>
            )}

            {/* ── COMMENT SECTION ── */}
            <div className="mt-10 max-w-4xl mx-auto">
              <Comments unitId={commentUnitId} />
            </div>

            {/* Prev / Next navigation (unchanged) */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {prevUnit ? (
                <Link
                  href={`${basePath}/${prevUnit.id}`}
                  className="group relative flex items-center gap-2 sm:gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden min-w-0"
                >
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${prevUnit.gradient}`} />
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <ChevronLeft size={15} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Prev</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight truncate">
                      {prevUnit.emoji} {prevUnit.shortTitle}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextUnit ? (
                <Link
                  href={`${basePath}/${nextUnit.id}`}
                  className="group relative flex items-center justify-end gap-2 sm:gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden min-w-0"
                >
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${nextUnit.gradient}`} />
                  <div className="min-w-0 text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Next</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight truncate">
                      {nextUnit.emoji} {nextUnit.shortTitle}
                    </p>
                  </div>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <ChevronRight size={15} className="text-blue-600" />
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll‑to‑top button (unchanged) */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-10 h-10 rounded-2xl bg-gradient-to-br ${GRAD} text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center`}
        >
          <ArrowUp size={17} />
        </button>
      )}
    </section>
  );
}