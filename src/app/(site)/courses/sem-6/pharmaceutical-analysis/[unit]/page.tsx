"use client";

// app/courses/sem-6/pharmaceutical-analysis/[unit]/page.tsx

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronLeft, ChevronRight, BookOpen, ArrowUp,
  Printer, Menu, X, Zap, Clock, GraduationCap, ImageIcon, Loader2,
} from "lucide-react";
import { Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf } from "lucide-react";
import { PharmaAnalysisUnits, PHARMA_ANALYSIS_META } from "@/app/api/pharmaceutical-analysis-data";

interface PageProps { params: { unit: string } }

const bgIconDefs = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 26 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 24 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 26 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 26 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 24 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 24 },
];

const BASE_PATH = `/courses/${PHARMA_ANALYSIS_META.semesterSlug}/${PHARMA_ANALYSIS_META.slug}`;

function ScrollTable({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canL, setL] = useState(false);
  const [canR, setR] = useState(false);
  const check = () => {
    const el = ref.current; if (!el) return;
    setL(el.scrollLeft > 4);
    setR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    check();
    const el = ref.current; if (!el) return;
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => { el.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, []);
  return (
    <div className="relative my-5 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {canL && <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />}
      {canR && <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />}
      {canR && <div className="absolute top-2 right-2 z-20 bg-cyan-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full pointer-events-none sm:hidden">scroll →</div>}
      <div ref={ref} className="overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: "touch" }}>
        <table className="min-w-full border-collapse text-sm">{children}</table>
      </div>
    </div>
  );
}

const mdComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent mt-8 mb-4 pb-3 border-b-2 border-cyan-100 break-words">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200 break-words">{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent mt-6 mb-3 break-words">{children}</h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-sm sm:text-base font-semibold text-teal-700 mt-5 mb-2 break-words">{children}</h4>
  ),
  p:  ({ children }: any) => <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4 break-words">{children}</p>,
  ul: ({ children }: any) => <ul className="space-y-2 mb-4 pl-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="space-y-2 mb-4 pl-4 list-decimal text-gray-700 text-sm sm:text-base">{children}</ol>,
  li: ({ children }: any) => (
    <li className="flex gap-2.5 text-gray-700 text-sm sm:text-base leading-relaxed">
      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
      <span className="break-words min-w-0 flex-1">{children}</span>
    </li>
  ),
  strong:     ({ children }: any) => <strong className="font-bold text-gray-900">{children}</strong>,
  em:         ({ children }: any) => <em className="italic text-gray-700">{children}</em>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-cyan-400 bg-cyan-50/60 px-4 py-3 rounded-r-xl my-4 text-gray-700 text-sm sm:text-base italic break-words">{children}</blockquote>
  ),
  table:  ({ children }: any) => <ScrollTable>{children}</ScrollTable>,
  thead:  ({ children }: any) => <thead className="bg-gradient-to-r from-cyan-50 to-teal-50">{children}</thead>,
  th:     ({ children }: any) => <th className="px-3 py-3 text-left font-semibold text-gray-800 border border-gray-200 text-xs whitespace-nowrap">{children}</th>,
  td:     ({ children }: any) => <td className="px-3 py-2.5 border border-gray-200 text-xs text-gray-700 whitespace-normal min-w-[100px]">{children}</td>,
  tr:     ({ children }: any) => <tr className="hover:bg-cyan-50/30 transition-colors">{children}</tr>,
  code:   ({ inline, children }: any) =>
    inline
      ? <code className="bg-gray-100 text-cyan-700 px-1.5 py-0.5 rounded text-xs font-mono break-all">{children}</code>
      : <pre className="bg-gray-900 text-teal-300 rounded-2xl p-4 overflow-x-auto text-xs font-mono my-4 leading-relaxed"><code>{children}</code></pre>,
  hr: () => <hr className="my-8 border-gray-200" />,
};

export default function PharmaceuticalAnalysisUnitPage({ params }: PageProps) {
  const { unit: unitSlug } = params;
  const unitIdx  = PharmaAnalysisUnits.findIndex(u => u.id === unitSlug);
  const unit     = PharmaAnalysisUnits[unitIdx];
  const prevUnit = unitIdx > 0 ? PharmaAnalysisUnits[unitIdx - 1] : null;
  const nextUnit = unitIdx < PharmaAnalysisUnits.length - 1 ? PharmaAnalysisUnits[unitIdx + 1] : null;

  const [content,       setContent]       = useState("");
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [imgError,      setImgError]      = useState(false);
  const [pdfLoading,    setPdfLoading]    = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!unit) return;
    setLoading(true); setError(false);
    fetch(`/content/pharmaceutical-analysis/${unitSlug}.md`)
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(text => { setContent(text.replace(/^---[\s\S]*?---\n?/, "")); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [unitSlug, unit]);

  useEffect(() => {
    const onKey    = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileNavOpen(false); };
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onScroll); };
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    if (!printRef.current || pdfLoading) return;
    setPdfLoading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"), import("html2canvas"),
      ]);
      const el = printRef.current;
      const prevH = el.style.height; el.style.height = "auto";
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff", windowWidth: 900 });
      el.style.height = prevH;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const headerSpace = 12;
      const usableH = (pageH - margin * 2) - headerSpace;
      const scaledW = pageW - margin * 2;
      const scaledH = (canvas.height / canvas.width) * scaledW;
      const totalPages = Math.ceil(scaledH / usableH);

      const addHeader = (doc: typeof pdf, p: number, t: number) => {
        doc.setFillColor(8, 145, 178); // cyan-600
        doc.rect(0, 0, pageW, 10, "F");
        doc.setTextColor(255,255,255); doc.setFontSize(7);
        doc.setFont("helvetica","bold");
        doc.text(`PHARMAWALLAH  ·  ${PHARMA_ANALYSIS_META.title.toUpperCase()}`, margin, 6.5);
        doc.setFont("helvetica","normal");
        doc.text(`Page ${p} of ${t}`, pageW - margin, 6.5, { align: "right" });
      };
      const addFooter = (doc: typeof pdf) => {
        doc.setDrawColor(229,231,235); doc.line(margin, pageH-8, pageW-margin, pageH-8);
        doc.setTextColor(156,163,175); doc.setFontSize(6.5); doc.setFont("helvetica","normal");
        doc.text(`${unit.title}  ·  pharmawallah.com`, pageW/2, pageH-4, { align:"center" });
      };

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        addHeader(pdf, page+1, totalPages); addFooter(pdf);
        const srcY = (page * usableH * canvas.height) / scaledH;
        const slicePxH = Math.min((usableH * canvas.height) / scaledH, canvas.height - srcY);
        const sc = document.createElement("canvas"); sc.width = canvas.width; sc.height = slicePxH;
        sc.getContext("2d")!.drawImage(canvas, 0, srcY, canvas.width, slicePxH, 0, 0, canvas.width, slicePxH);
        pdf.addImage(sc.toDataURL("image/jpeg",0.95), "JPEG", margin, margin+headerSpace, scaledW, (slicePxH/canvas.height)*scaledH);
      }
      pdf.save(`${unitSlug}.pdf`);
    } catch(err) { console.error(err); alert("PDF generation failed. Please try again."); }
    finally { setPdfLoading(false); }
  }, [unit, unitSlug, pdfLoading]);

  if (!unit) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-xl font-extrabold text-gray-900 mb-2">Unit not found</p>
        <Link href={BASE_PATH} className="text-cyan-600 text-sm font-semibold hover:underline">← Back to Pharmaceutical Analysis</Link>
      </div>
    </div>
  );

  const GRAD = unit.gradient;

  return (
    <section className="min-h-screen bg-white relative" style={{ overflowX: "hidden" }}>

      {bgIconDefs.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-cyan-100 z-0 hidden sm:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══ MOBILE TOP BAR ══ */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0 flex-1 mr-2">
            <Link href={BASE_PATH} className="hover:text-cyan-600 shrink-0 font-medium">Analysis</Link>
            <ChevronRight size={11} className="shrink-0 mx-0.5 text-gray-300" />
            <span className="text-cyan-600 font-semibold truncate">{unit.shortTitle}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={handleDownloadPdf} disabled={pdfLoading}
              className="p-1.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50">
              {pdfLoading ? <Loader2 size={15} className="animate-spin" /> : <Printer size={15} />}
            </button>
            <button onClick={() => setMobileNavOpen(v => !v)}
              className={`p-1.5 rounded-xl border transition-colors ${mobileNavOpen ? "bg-gray-900 text-white border-gray-900" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
              {mobileNavOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="bg-white border-t border-gray-100 px-3 pb-3 shadow-xl max-h-60 overflow-y-auto">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 pt-2 mb-1.5">All Units</p>
            <ul className="space-y-0.5">
              {PharmaAnalysisUnits.map(u => (
                <li key={u.id}>
                  <Link href={`${BASE_PATH}/${u.id}`} onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition-all ${
                      u.id === unitSlug ? `bg-gradient-to-r ${GRAD} text-white font-semibold` : "text-gray-700 hover:bg-cyan-50"
                    }`}>
                    <span className="shrink-0">{u.emoji}</span>
                    <span className="flex-1 leading-snug truncate">{u.title}</span>
                    {u.id === unitSlug && <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full shrink-0">Now</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex border-t border-gray-100">
          {prevUnit ? (
            <Link href={`${BASE_PATH}/${prevUnit.id}`} className="flex-1 flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors min-w-0">
              <ChevronLeft size={13} className="shrink-0" /><span className="truncate">{prevUnit.emoji} {prevUnit.shortTitle}</span>
            </Link>
          ) : <div className="flex-1" />}
          {nextUnit && (
            <Link href={`${BASE_PATH}/${nextUnit.id}`} className="flex-1 flex items-center justify-end gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-cyan-50 hover:text-cyan-600 transition-colors border-l border-gray-100 min-w-0">
              <span className="truncate">{nextUnit.emoji} {nextUnit.shortTitle}</span><ChevronRight size={13} className="shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* ══ PAGE LAYOUT ══ */}
      <div className="relative z-10 mx-auto max-w-screen-xl px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-10 w-full">

        <nav className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 mb-5 flex-wrap">
          {[
            { href: "/",        label: "Home" },
            { href: "/courses", label: "Courses" },
            { href: `/courses/${PHARMA_ANALYSIS_META.semesterSlug}`, label: PHARMA_ANALYSIS_META.semester },
            { href: BASE_PATH,  label: "Pharmaceutical Analysis" },
          ].map(({ href, label }) => (
            <span key={href} className="flex items-center gap-1.5">
              <Link href={href} className="hover:text-cyan-600 transition-colors">{label}</Link>
              <ChevronRight size={13} className="text-gray-300" />
            </span>
          ))}
          <span className="text-cyan-700 font-semibold">{unit.shortTitle}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-5 xl:gap-8 items-start w-full">

          {/* ══ SIDEBAR ══ */}
          <aside className="hidden lg:block w-52 xl:w-60 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              <div className={`bg-gradient-to-br ${GRAD} rounded-2xl p-4 text-white shadow-lg`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={11} className="opacity-80" />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Pharmaceutical Analysis</span>
                </div>
                <p className="font-bold text-xs leading-snug mt-1">{PHARMA_ANALYSIS_META.semester} · {PHARMA_ANALYSIS_META.subjectCode}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                  <BookOpen size={11} /> All Units
                </p>
                <ul className="space-y-0.5">
                  {PharmaAnalysisUnits.map(u => (
                    <li key={u.id}>
                      <Link href={`${BASE_PATH}/${u.id}`}
                        className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all ${
                          u.id === unitSlug ? `bg-gradient-to-r ${GRAD} text-white font-semibold shadow-sm` : "text-gray-600 hover:bg-cyan-50 hover:text-cyan-700"
                        }`}>
                        <span>{u.emoji}</span>
                        <span className="flex-1 leading-snug truncate">{u.shortTitle}</span>
                        <ChevronRight size={11} className={`shrink-0 transition-opacity ${u.id === unitSlug ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Unit Info</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={12} className="text-cyan-500 shrink-0" /><span>{unit.readTime} min read</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <GraduationCap size={12} className="text-cyan-500 shrink-0" /><span>Difficulty: <strong>{unit.difficulty}</strong></span>
                </div>
              </div>
              <button onClick={handleDownloadPdf} disabled={pdfLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {pdfLoading ? <Loader2 size={13} className="animate-spin" /> : <Printer size={13} />}
                {pdfLoading ? "Generating…" : "Save as PDF"}
              </button>
            </div>
          </aside>

          {/* ══ MAIN CONTENT ══ */}
          <div className="flex-1 min-w-0 w-full">

            {/* Hero — excluded from PDF */}
            <div className={`relative rounded-2xl overflow-hidden mb-4 sm:mb-5 bg-gradient-to-r ${GRAD} shadow-lg`}>
              <div className="absolute -top-8 -right-8 w-32 sm:w-44 h-32 sm:h-44 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 sm:w-32 h-24 sm:h-32 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-3 right-3 opacity-10 pointer-events-none select-none">
                <span className="text-6xl sm:text-8xl">{unit.emoji}</span>
              </div>
              <div className="relative z-10 px-4 py-5 sm:px-7 sm:py-7">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-2.5">
                  <Zap size={9} /> Pharmaceutical Analysis · {PHARMA_ANALYSIS_META.semester}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-1.5 break-words">{unit.title}</h1>
                <p className="text-white/80 text-xs sm:text-sm max-w-lg break-words">{unit.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {[`Unit ${unitIdx + 1} of ${PharmaAnalysisUnits.length}`, `${unit.readTime} min`, unit.difficulty].map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-semibold">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── PRINTABLE AREA ── */}
            <div ref={printRef} style={{ background: "#fff" }}>
              {unit.previewImage && !imgError && (
                <div className="mb-4 sm:mb-5 rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 bg-white">
                    <ImageIcon size={13} className="text-cyan-500 shrink-0" />
                    <span className="text-xs font-semibold text-gray-500">Unit Overview</span>
                  </div>
                  <img src={unit.previewImage} alt={`${unit.shortTitle} overview`} crossOrigin="anonymous"
                    className="w-full max-h-72 sm:max-h-96 object-contain bg-gray-50 p-2 sm:p-4"
                    onError={() => setImgError(true)} />
                </div>
              )}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-5 md:p-8 overflow-hidden"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}>
                {loading && (
                  <div className="py-16 flex flex-col items-center gap-4">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${GRAD} flex items-center justify-center animate-pulse`}>
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-gray-400 text-sm font-semibold">Loading unit content…</p>
                  </div>
                )}
                {error && !loading && (
                  <div className="py-16 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-5 h-5 text-red-400" />
                    </div>
                    <p className="text-gray-700 font-bold mb-1">Content file not found</p>
                    <p className="text-gray-400 text-xs mb-4 break-all">
                      Place <code className="bg-gray-100 px-1.5 py-0.5 rounded text-cyan-600 font-mono">public/content/pharmaceutical-analysis/{unitSlug}.md</code>
                    </p>
                    <Link href={BASE_PATH} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${GRAD} text-white text-xs font-extrabold`}>
                      ← Back to all units
                    </Link>
                  </div>
                )}
                {!loading && !error && content && (
                  <div className="max-w-full">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents as any}>{content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
            {/* ── END PRINTABLE AREA ── */}

            {!loading && !error && (
              <div className="flex justify-center mt-6">
                <button onClick={handleDownloadPdf} disabled={pdfLoading}
                  className={`flex items-center gap-2.5 px-6 sm:px-8 py-3.5 bg-gradient-to-r ${GRAD} text-white rounded-2xl font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0`}>
                  {pdfLoading ? <><Loader2 size={17} className="animate-spin" /> Generating PDF…</> : <><Printer size={17} /> Download as PDF</>}
                </button>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              {prevUnit ? (
                <Link href={`${BASE_PATH}/${prevUnit.id}`}
                  className="group relative flex items-center gap-2 sm:gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden min-w-0">
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${prevUnit.gradient}`} />
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center flex-shrink-0">
                    <ChevronLeft size={15} className="text-cyan-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Prev</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight truncate">{prevUnit.emoji} {prevUnit.shortTitle}</p>
                  </div>
                </Link>
              ) : <div />}
              {nextUnit ? (
                <Link href={`${BASE_PATH}/${nextUnit.id}`}
                  className="group relative flex items-center justify-end gap-2 sm:gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden min-w-0">
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${nextUnit.gradient}`} />
                  <div className="min-w-0 text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Next</p>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight truncate">{nextUnit.emoji} {nextUnit.shortTitle}</p>
                  </div>
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center flex-shrink-0">
                    <ChevronRight size={15} className="text-cyan-600" />
                  </div>
                </Link>
              ) : <div />}
            </div>
          </div>
        </div>
      </div>

      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-10 h-10 rounded-2xl bg-gradient-to-br ${GRAD} text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center`}>
          <ArrowUp size={17} />
        </button>
      )}
    </section>
  );
}