"use client";

// app/courses/sem-1/pharmaceutical-biochemistry/[unit]/page.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronLeft, ChevronRight, BookOpen, ArrowUp,
  Printer, Menu, X, Zap, Clock, GraduationCap,
} from "lucide-react";
import {
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf,
} from "lucide-react";
import { BiochemUnits, SUBJECT_META } from "@/app/api/biochemistry-data";

interface PageProps { params: { unit: string } }

const bgIconDefs = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 28 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 26 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 28 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 28 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 26 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 26 },
];

const BASE_PATH = `/courses/${SUBJECT_META.semesterSlug}/${SUBJECT_META.slug}`;

// ─── Markdown Components ──────────────────────────────────────────────────────
const mdComponents: any = {
  h1: ({ children }: any) => (
    <h1 style={{ fontSize: "clamp(1.1rem, 4vw, 1.75rem)", fontWeight: 800, background: "linear-gradient(to right, #2563eb, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginTop: "2rem", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "2px solid #dbeafe", wordBreak: "break-word", overflowWrap: "anywhere" }}>
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 style={{ fontSize: "clamp(1rem, 3.5vw, 1.5rem)", fontWeight: 700, color: "#111827", marginTop: "1.75rem", marginBottom: "0.75rem", paddingBottom: "0.5rem", borderBottom: "1px solid #e5e7eb", wordBreak: "break-word", overflowWrap: "anywhere" }}>
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 style={{ fontSize: "clamp(0.9rem, 3vw, 1.125rem)", fontWeight: 700, background: "linear-gradient(to right, #2563eb, #22c55e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginTop: "1.5rem", marginBottom: "0.5rem", wordBreak: "break-word", overflowWrap: "anywhere" }}>
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 style={{ fontSize: "0.875rem", fontWeight: 600, color: "#15803d", marginTop: "1rem", marginBottom: "0.5rem", wordBreak: "break-word" }}>
      {children}
    </h4>
  ),
  p: ({ children }: any) => (
    <p style={{ color: "#374151", lineHeight: 1.7, fontSize: "0.875rem", marginBottom: "1rem", wordBreak: "break-word", overflowWrap: "anywhere" }}>
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul style={{ marginBottom: "1rem", paddingLeft: 0, listStyle: "none" }}>{children}</ul>
  ),
  ol: ({ children }: any) => (
    <ol style={{ marginBottom: "1rem", paddingLeft: "1.25rem", color: "#374151", fontSize: "0.875rem" }}>
      {children}
    </ol>
  ),
  li: ({ children }: any) => (
    <li style={{ display: "flex", gap: "0.5rem", color: "#374151", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "0.4rem" }}>
      <span style={{ marginTop: "0.45rem", width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
      <span style={{ wordBreak: "break-word", overflowWrap: "anywhere", minWidth: 0, flex: 1 }}>{children}</span>
    </li>
  ),
  strong: ({ children }: any) => (
    <strong style={{ fontWeight: 700, color: "#111827" }}>{children}</strong>
  ),
  em: ({ children }: any) => (
    <em style={{ fontStyle: "italic", color: "#374151" }}>{children}</em>
  ),
  blockquote: ({ children }: any) => (
    <blockquote style={{ borderLeft: "4px solid #60a5fa", background: "rgba(219,234,254,0.4)", padding: "0.75rem 1rem", borderRadius: "0 0.75rem 0.75rem 0", margin: "1rem 0", color: "#374151", fontSize: "0.875rem", fontStyle: "italic", wordBreak: "break-word" }}>
      {children}
    </blockquote>
  ),

  // ── TABLE — full bleed horizontal scroll on mobile ────────────────────────
  table: ({ children }: any) => (
    <div style={{ margin: "1.25rem -1rem", position: "relative" }}>
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingLeft: "1rem", paddingRight: "1rem", paddingBottom: "0.25rem" }}>
        <table style={{ minWidth: "500px", width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
          {children}
        </table>
      </div>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead style={{ background: "linear-gradient(to right, #eff6ff, #f0fdf4)" }}>{children}</thead>
  ),
  th: ({ children }: any) => (
    <th style={{ padding: "9px 12px", textAlign: "left", fontWeight: 700, color: "#1f2937", border: "1px solid #e5e7eb", fontSize: "0.7rem", whiteSpace: "nowrap", background: "inherit" }}>
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td style={{ padding: "7px 12px", border: "1px solid #e5e7eb", fontSize: "0.7rem", color: "#374151" }}>
      {children}
    </td>
  ),
  tr: ({ children }: any) => (
    <tr style={{ borderBottom: "1px solid #f3f4f6" }}>{children}</tr>
  ),

  // ── CODE ──────────────────────────────────────────────────────────────────
  code: ({ inline, children }: any) =>
    inline ? (
      <code style={{ background: "#f3f4f6", color: "#1d4ed8", padding: "1px 5px", borderRadius: "4px", fontSize: "0.75rem", fontFamily: "monospace", wordBreak: "break-all" }}>
        {children}
      </code>
    ) : (
      <div style={{ margin: "1rem -1rem" }}>
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", paddingLeft: "1rem", paddingRight: "1rem" }}>
          <pre style={{ background: "#111827", color: "#6ee7b7", borderRadius: "12px", padding: "1rem", fontSize: "0.7rem", fontFamily: "monospace", lineHeight: 1.6, minWidth: "max-content" }}>
            <code>{children}</code>
          </pre>
        </div>
      </div>
    ),

  hr: () => <hr style={{ margin: "2rem 0", borderColor: "#e5e7eb" }} />,
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function BiochemUnitPage({ params }: PageProps) {
  const { unit: unitSlug } = params;

  const unitIdx  = BiochemUnits.findIndex((u: any) => u.id === unitSlug);
  const unit     = BiochemUnits[unitIdx];
  const prevUnit = unitIdx > 0 ? BiochemUnits[unitIdx - 1] : null;
  const nextUnit = unitIdx < BiochemUnits.length - 1 ? BiochemUnits[unitIdx + 1] : null;

  const [content,       setContent]       = useState<string>("");
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!unit) return;
    setLoading(true); setError(false);
    fetch(`/content/pharmaceutical-biochemistry/${unitSlug}.md`)
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(text => { setContent(text.replace(/^---[\s\S]*?---\n?/, "")); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [unitSlug]);

  useEffect(() => {
    const onKey    = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileNavOpen(false); };
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("scroll", onScroll); };
  }, []);

  if (!unit) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-xl font-extrabold text-gray-900 mb-2">Unit not found</p>
        <Link href={BASE_PATH} className="text-blue-600 text-sm font-semibold hover:underline">← Back to Biochemistry</Link>
      </div>
    </div>
  );

  const GRAD = unit.gradient;

  return (
    <section style={{ minHeight: "100vh", background: "#fff", position: "relative", overflowX: "hidden", maxWidth: "100vw" }}>

      {/* BG icons — only sm+ */}
      {bgIconDefs.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="hidden sm:block fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══ MOBILE TOP BAR ══════════════════════════════════════════════════ */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm print:hidden"
        style={{ maxWidth: "100vw" }}>

        {/* Row 1 */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 0.75rem" }}>
          <Link href={BASE_PATH}
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, flexShrink: 0, textDecoration: "none" }}>
            <ChevronLeft size={14} strokeWidth={2.5} />
            Back
          </Link>
          <div style={{ flex: 1, minWidth: 0, textAlign: "center", padding: "0 0.5rem" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {unit.emoji} {unit.shortTitle}
            </p>
          </div>
          <button onClick={() => setMobileNavOpen(v => !v)}
            style={{ flexShrink: 0, padding: "0.375rem", borderRadius: "0.75rem", border: mobileNavOpen ? "1px solid #111827" : "1px solid #e5e7eb", background: mobileNavOpen ? "#111827" : "#f3f4f6", color: mobileNavOpen ? "#fff" : "#374151", cursor: "pointer" }}>
            {mobileNavOpen ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>

        {/* Row 2: prev / next */}
        <div style={{ display: "flex", borderTop: "1px solid #f3f4f6" }}>
          {prevUnit ? (
            <Link href={`${BASE_PATH}/${prevUnit.id}`}
              style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.5rem 0.75rem", fontSize: "0.6875rem", color: "#6b7280", textDecoration: "none", overflow: "hidden" }}>
              <ChevronLeft size={12} style={{ flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prevUnit.shortTitle}</span>
            </Link>
          ) : <div style={{ flex: 1 }} />}
          {nextUnit ? (
            <Link href={`${BASE_PATH}/${nextUnit.id}`}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.25rem", padding: "0.5rem 0.75rem", fontSize: "0.6875rem", color: "#6b7280", textDecoration: "none", overflow: "hidden", borderLeft: "1px solid #f3f4f6" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nextUnit.shortTitle}</span>
              <ChevronRight size={12} style={{ flexShrink: 0 }} />
            </Link>
          ) : <div style={{ flex: 1 }} />}
        </div>

        {/* Dropdown */}
        {mobileNavOpen && (
          <div style={{ background: "#fff", borderTop: "1px solid #f3f4f6", maxHeight: "55vh", overflowY: "auto" }}>
            <p style={{ fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af", padding: "0.75rem 1rem 0.25rem" }}>All Units</p>
            {BiochemUnits.map((u: any) => (
              <Link key={u.id} href={`${BASE_PATH}/${u.id}`}
                onClick={() => setMobileNavOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid #f9fafb",
                  textDecoration: "none",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  ...(u.id === unitSlug
                    ? { background: "linear-gradient(to right, var(--tw-gradient-stops))", color: "#fff" }
                    : { color: "#374151", background: "transparent" })
                }}
                className={u.id === unitSlug ? `bg-gradient-to-r ${GRAD} text-white` : "hover:bg-blue-50"}
              >
                <span style={{ fontSize: "1.125rem", flexShrink: 0 }}>{u.emoji}</span>
                <span style={{ flex: 1, lineHeight: 1.4, fontSize: "0.75rem" }}>{u.title}</span>
                {u.id === unitSlug && (
                  <span style={{ fontSize: "0.5625rem", background: "rgba(255,255,255,0.25)", padding: "2px 6px", borderRadius: "999px", flexShrink: 0, fontWeight: 700 }}>NOW</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ══ PAGE BODY ════════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-screen-xl mx-auto sm:px-4 lg:px-8 sm:py-6 lg:py-10">

        {/* Desktop breadcrumb */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 mb-5 print:hidden flex-wrap">
          {[
            { href: "/", label: "Home" },
            { href: "/courses", label: "Courses" },
            { href: `/courses/${SUBJECT_META.semesterSlug}`, label: SUBJECT_META.semester },
            { href: BASE_PATH, label: "Pharmaceutical Biochemistry" },
          ].map(({ href, label }) => (
            <span key={href} className="flex items-center gap-1.5">
              <Link href={href} className="hover:text-blue-600 transition-colors">{label}</Link>
              <ChevronRight size={13} />
            </span>
          ))}
          <span className="text-blue-700 font-semibold">{unit.shortTitle}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">

          {/* ─── SIDEBAR (desktop only) ─────────────────────────────────── */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0 print:hidden">
            <div className="sticky top-6 space-y-4">
              <div className={`bg-gradient-to-br ${GRAD} rounded-2xl p-4 text-white shadow-lg`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={11} className="opacity-80" />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Pharmaceutical Biochemistry</span>
                </div>
                <p className="font-bold text-sm leading-snug">{SUBJECT_META.semester} · {SUBJECT_META.subjectCode}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                  <BookOpen size={12} /> All Units
                </p>
                <ul className="space-y-0.5">
                  {BiochemUnits.map((u: any) => (
                    <li key={u.id}>
                      <Link href={`${BASE_PATH}/${u.id}`}
                        className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all ${
                          u.id === unitSlug
                            ? `bg-gradient-to-r ${GRAD} text-white font-semibold shadow-sm`
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}>
                        <span>{u.emoji}</span>
                        <span className="flex-1 leading-snug">{u.shortTitle}</span>
                        <ChevronRight size={12} className={`shrink-0 ${u.id === unitSlug ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3.5 space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1">Unit Info</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Clock size={13} className="text-blue-500 shrink-0" />
                  <span>{unit.readTime} min read</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <GraduationCap size={13} className="text-blue-500 shrink-0" />
                  <span>Difficulty: <strong>{unit.difficulty}</strong></span>
                </div>
              </div>
              <button onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all">
                <Printer size={14} /> Save as PDF
              </button>
            </div>
          </aside>

          {/* ─── MAIN CONTENT ───────────────────────────────────────────── */}
          <div style={{ flex: 1, minWidth: 0, maxWidth: "100%", width: "100%" }}>

            {/* Hero */}
            <div className={`relative overflow-hidden bg-gradient-to-r ${GRAD} shadow-xl sm:rounded-3xl print:hidden`}>
              <div className="absolute -top-10 -right-10 w-32 sm:w-48 h-32 sm:h-48 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-24 sm:w-36 h-24 sm:h-36 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-3 right-4 opacity-10 pointer-events-none select-none">
                <span style={{ fontSize: "clamp(3rem, 10vw, 5rem)" }}>{unit.emoji}</span>
              </div>
              <div className="relative z-10 px-4 sm:px-8 py-5 sm:py-7">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-2.5">
                  <Zap size={9} /> Pharmaceutical Biochemistry · {SUBJECT_META.semester}
                </div>
                <h1 style={{ fontSize: "clamp(1.2rem, 5vw, 2.5rem)", fontWeight: 800, color: "#fff", lineHeight: 1.25, marginBottom: "0.5rem", wordBreak: "break-word" }}>
                  {unit.title}
                </h1>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "clamp(0.75rem, 2.5vw, 0.9rem)", lineHeight: 1.6, maxWidth: "36rem", wordBreak: "break-word" }}>
                  {unit.description}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
                  {[`Unit ${unitIdx + 1} of ${BiochemUnits.length}`, `${unit.readTime} min read`, unit.difficulty].map(t => (
                    <span key={t} style={{ padding: "0.2rem 0.6rem", borderRadius: "999px", background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: "0.625rem", fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Content card */}
            <div className="bg-white sm:rounded-3xl sm:border sm:border-gray-200 sm:shadow-sm sm:mt-5"
              style={{ overflowX: "hidden", maxWidth: "100%", padding: "1.25rem 1rem" }}>

              {loading && (
                <div style={{ padding: "5rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${GRAD} flex items-center justify-center animate-pulse`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-400 text-sm font-semibold">Loading unit content…</p>
                </div>
              )}

              {error && !loading && (
                <div style={{ padding: "4rem 1rem", textAlign: "center" }}>
                  <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-6 h-6 text-red-400" />
                  </div>
                  <p className="text-gray-700 font-bold mb-1">Content file not found</p>
                  <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginBottom: "1rem", wordBreak: "break-all" }}>
                    Make sure <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "4px", color: "#2563eb", fontFamily: "monospace" }}>
                      public/content/pharmaceutical-biochemistry/{unitSlug}.md
                    </code> exists.
                  </p>
                  <Link href={BASE_PATH}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r ${GRAD} text-white text-xs font-extrabold`}>
                    ← Back to all units
                  </Link>
                </div>
              )}

              {!loading && !error && content && (
                <div style={{ minWidth: 0, maxWidth: "100%", overflowX: "hidden", wordBreak: "break-word" }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {content}
                  </ReactMarkdown>
                </div>
              )}

              {!loading && !error && (
                <div className="flex justify-center mt-8 print:hidden">
                  <button onClick={() => window.print()}
                    className={`flex items-center gap-2 px-5 sm:px-8 py-3 bg-gradient-to-r ${GRAD} text-white rounded-2xl font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all`}>
                    <Printer size={16} /> Download as PDF
                  </button>
                </div>
              )}
            </div>

            {/* Prev / Next */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1rem", padding: "0 1rem" }}
              className="sm:px-0 print:hidden">
              {prevUnit ? (
                <Link href={`${BASE_PATH}/${prevUnit.id}`}
                  className={`group relative flex items-center gap-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden`}>
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${prevUnit.gradient}`} />
                  <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <ChevronLeft size={14} className="text-blue-600" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "0.5625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", marginBottom: "2px" }}>Prev</p>
                    <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#1f2937", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {prevUnit.emoji} {prevUnit.shortTitle}
                    </p>
                  </div>
                </Link>
              ) : <div />}
              {nextUnit ? (
                <Link href={`${BASE_PATH}/${nextUnit.id}`}
                  className={`group relative flex items-center justify-end gap-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-3 hover:-translate-y-0.5 hover:shadow-md transition-all overflow-hidden`}>
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${nextUnit.gradient}`} />
                  <div style={{ minWidth: 0, textAlign: "right" }}>
                    <p style={{ fontSize: "0.5625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9ca3af", marginBottom: "2px" }}>Next</p>
                    <p style={{ fontSize: "0.6875rem", fontWeight: 600, color: "#1f2937", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {nextUnit.emoji} {nextUnit.shortTitle}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <ChevronRight size={14} className="text-blue-600" />
                  </div>
                </Link>
              ) : <div />}
            </div>

            <div style={{ height: "2rem" }} className="lg:hidden" />
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`fixed bottom-5 right-4 z-30 w-10 h-10 rounded-2xl bg-gradient-to-br ${GRAD} text-white shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center print:hidden`}>
          <ArrowUp size={16} />
        </button>
      )}

      <style jsx global>{`
        @media print {
          @page { margin: 2cm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        *, *::before, *::after { box-sizing: border-box; }
        body { overflow-x: hidden; }
        img, video, iframe { max-width: 100%; }
      `}</style>
    </section>
  );
}