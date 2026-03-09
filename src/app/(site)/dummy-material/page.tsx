'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Clock, BookOpen, ChevronRight, ChevronLeft,
  Menu, X, Microscope, FlaskConical, Leaf, Zap,
  List, ArrowUp, Printer, ExternalLink, AlertCircle,
} from 'lucide-react';
import {
  Pill as PillIcon, Beaker, Atom, Dna, HeartPulse, Syringe,
  TestTube, Tablet, ClipboardList, Stethoscope, Bandage, Droplet,
  Eye, Bone, Brain, Heart, Activity, Scissors,
  Thermometer, Wind, Droplets, FlaskRound, Scale, Calculator,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ─── Types ───────────────────────────────────────────────────────────── */
interface Unit { id: string; title: string; slug: string; emoji: string }

/* ─── Data ────────────────────────────────────────────────────────────── */
const allUnits: Unit[] = [
  { id: 'unit1', title: 'Unit 1: Introduction to Toxicology', slug: 'unit1-intro',      emoji: '🔬' },
  { id: 'unit2', title: 'Unit 2: Heavy Metals',               slug: 'unit2-heavy-metals', emoji: '⚗️' },
  { id: 'unit3', title: 'Unit 3: Pesticides',                 slug: 'unit3-pesticides',  emoji: '🌿' },
  { id: 'unit4', title: 'Unit 4: Mycotoxins',                 slug: 'unit4-mycotoxins',  emoji: '🍄' },
  { id: 'unit5', title: 'Unit 5: Venoms & Toxins',            slug: 'unit5-venoms',      emoji: '🐍' },
];

const currentUnitId = 'unit4';
const currentIdx = allUnits.findIndex(u => u.id === currentUnitId);
const prevUnit = currentIdx > 0 ? allUnits[currentIdx - 1] : null;
const nextUnit = currentIdx < allUnits.length - 1 ? allUnits[currentIdx + 1] : null;

/* ─── TOC ─────────────────────────────────────────────────────────────── */
const sections = [
  { id: 'intro',         label: 'Introduction' },
  { id: 'overview-table',label: 'Overview Table' },
  { id: 'sec-4-1',       label: '4.1 Foodborne Mycotoxins' },
  { id: 'sec-4-2',       label: '4.2 Mushroom Toxins' },
  { id: 'key-concepts',  label: 'Key Concepts & Management' },
  { id: 'references',    label: 'References' },
];

/* ─── BG Icons ────────────────────────────────────────────────────────── */
const iconDefs: LucideIcon[] = [
  PillIcon, FlaskConical, Beaker, Microscope, Atom, Dna, HeartPulse, Leaf,
  Syringe, TestTube, Tablet, ClipboardList, Stethoscope, Bandage, Droplet,
  Eye, Bone, Brain, Heart, Activity, Scissors, Thermometer, Wind,
  Droplets, FlaskRound, Scale, Calculator,
];
const bgIconColors = [
  'text-blue-800/[0.06]', 'text-green-800/[0.06]',
  'text-purple-800/[0.06]', 'text-amber-800/[0.06]',
];
const bgIcons = Array.from({ length: 32 }, (_, i) => ({
  Icon: iconDefs[i % iconDefs.length],
  color: bgIconColors[i % 4],
  left: `${(i * 11 + 3) % 94 + 3}%`,
  top:  `${(i * 17 + 5) % 90 + 5}%`,
  size: 28 + (i * 9) % 48,
  rotate: (i * 31) % 360,
}));

/* ─── Fixed-class card styles (no dynamic Tailwind) ──────────────────── */
const cardStyles = {
  blue:   { wrap: 'bg-blue-50/60 border-blue-100',   dot: 'bg-blue-500',   title: 'text-blue-800'   },
  purple: { wrap: 'bg-purple-50/60 border-purple-100', dot: 'bg-purple-500', title: 'text-purple-800' },
  amber:  { wrap: 'bg-amber-50/60 border-amber-100',  dot: 'bg-amber-500',  title: 'text-amber-800'  },
  rose:   { wrap: 'bg-rose-50/60 border-rose-100',    dot: 'bg-rose-500',   title: 'text-rose-800'   },
  green:  { wrap: 'bg-green-50/60 border-green-100',  dot: 'bg-green-500',  title: 'text-green-800'  },
};

/* ─── Sub-components ──────────────────────────────────────────────────── */
function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3
      id={id}
      className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mt-10 mb-4 pb-3 border-b-2 border-blue-100 scroll-mt-24"
    >
      {children}
    </h3>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-base sm:text-lg md:text-xl font-semibold text-green-700 mt-6 mb-3">
      {children}
    </h4>
  );
}

function Dot({ color }: { color: string }) {
  return <span className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 ${color}`} />;
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function Unit4Mycotoxins() {
  const [lightboxOpen,   setLightboxOpen]   = useState(false);
  const [recentNotes,    setRecentNotes]    = useState<Unit[]>([]);
  const [mobileNavOpen,  setMobileNavOpen]  = useState(false);
  const [tocOpen,        setTocOpen]        = useState(false);
  const [activeSection,  setActiveSection]  = useState('intro');
  const [showScrollTop,  setShowScrollTop]  = useState(false);

  /* recent notes -------------------------------------------------------- */
  useEffect(() => {
    try { const s = localStorage.getItem('recentNotes'); if (s) setRecentNotes(JSON.parse(s)); } catch {}
  }, []);

  useEffect(() => {
    try {
      const current = allUnits.find(u => u.id === currentUnitId)!;
      setRecentNotes(prev => {
        const updated = [current, ...prev.filter(u => u.id !== current.id)].slice(0, 5);
        localStorage.setItem('recentNotes', JSON.stringify(updated));
        return updated;
      });
    } catch {}
  }, []);

  /* keyboard + scroll --------------------------------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setLightboxOpen(false); setMobileNavOpen(false); setTocOpen(false); }
    };
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      for (const sec of [...sections].reverse()) {
        const el = document.getElementById(sec.id);
        if (el && el.getBoundingClientRect().top <= 130) { setActiveSection(sec.id); break; }
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll); };
  }, []);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTocOpen(false);
    setMobileNavOpen(false);
  };

  /* ════════════════════════════════════════════════════════════════════ */
  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-green-50/20 relative overflow-x-hidden">

      {/* ── decorative blobs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-40 -right-40 w-72 sm:w-96 h-72 sm:h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute -bottom-40 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* ── background icons ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
        {bgIcons.map(({ Icon, color, left, top, size, rotate }, i) => (
          <Icon key={i} size={size} className={`absolute ${color}`} style={{ left, top, transform: `rotate(${rotate}deg)` }} />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE STICKY TOP BAR  (hidden on lg+)
      ══════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm print:hidden">
        {/* row 1 – breadcrumb + buttons */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 min-w-0">
            <Link href="/courses/sem-6/natural-toxin" className="hover:text-blue-600 shrink-0 truncate max-w-[110px] sm:max-w-none">
              Natural Toxins
            </Link>
            <ChevronRight size={12} className="shrink-0 mx-0.5" />
            <span className="text-blue-700 font-semibold truncate">Unit 4: Mycotoxins</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={() => { setTocOpen(v => !v); setMobileNavOpen(false); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                tocOpen ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              <List size={13} />
              <span>Contents</span>
            </button>
            <button
              onClick={() => { setMobileNavOpen(v => !v); setTocOpen(false); }}
              className={`p-1.5 rounded-xl border transition-colors ${
                mobileNavOpen ? 'bg-gray-800 text-white border-gray-800' : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
              aria-label="Unit Navigation"
            >
              {mobileNavOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </div>

        {/* TOC dropdown */}
        {tocOpen && (
          <div className="bg-white border-t border-gray-100 px-3 pb-3 shadow-lg max-h-64 overflow-y-auto">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 pt-2 mb-1.5">Jump to Section</p>
            <ul className="space-y-0.5">
              {sections.map(sec => (
                <li key={sec.id}>
                  <button
                    onClick={() => jumpTo(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      activeSection === sec.id
                        ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white'
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    {sec.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unit nav dropdown */}
        {mobileNavOpen && (
          <div className="bg-white border-t border-gray-100 px-3 pb-3 shadow-lg max-h-64 overflow-y-auto">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 pt-2 mb-1.5">All Units</p>
            <ul className="space-y-0.5">
              {allUnits.map(unit => (
                <li key={unit.id}>
                  <Link
                    href={`/courses/sem-6/natural-toxin/${unit.slug}`}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm transition-all ${
                      unit.id === currentUnitId
                        ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold'
                        : 'text-gray-700 hover:bg-blue-50'
                    }`}
                  >
                    <span className="text-base leading-none">{unit.emoji}</span>
                    <span className="flex-1 leading-snug">{unit.title}</span>
                    {unit.id === currentUnitId && (
                      <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full shrink-0">Now</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prev / Next mini strip */}
        <div className="flex border-t border-gray-100">
          {prevUnit ? (
            <Link
              href={`/courses/sem-6/natural-toxin/${prevUnit.slug}`}
              className="flex-1 flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <ChevronLeft size={14} className="shrink-0" />
              <span className="truncate">{prevUnit.emoji} {prevUnit.title.replace(/Unit \d+: /, '')}</span>
            </Link>
          ) : <div className="flex-1" />}
          {nextUnit && (
            <Link
              href={`/courses/sem-6/natural-toxin/${nextUnit.slug}`}
              className="flex-1 flex items-center justify-end gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border-l border-gray-100"
            >
              <span className="truncate">{nextUnit.emoji} {nextUnit.title.replace(/Unit \d+: /, '')}</span>
              <ChevronRight size={14} className="shrink-0" />
            </Link>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          LIGHTBOX
      ══════════════════════════════════════════════════════════════ */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl"
            style={{ height: 'min(90vh, 600px)' }}
            onClick={e => e.stopPropagation()}
          >
            <Image
              src="/images/courses/sem-6/natural-toxin/unit4.png"
              alt="Mycotoxins full screen"
              fill className="object-contain" priority
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white bg-black/60 rounded-full p-2 hover:bg-black/80 transition"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/50 text-xs whitespace-nowrap">
              Tap outside or press Esc to close
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          PAGE LAYOUT
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto max-w-screen-xl px-3 sm:px-5 lg:px-8 py-4 sm:py-6 lg:py-10 z-10">

        {/* Desktop breadcrumb */}
        <nav className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500 mb-5 print:hidden flex-wrap">
          {[
            { href: '/', label: 'Home' },
            { href: '/courses', label: 'Courses' },
            { href: '/courses/sem-6', label: 'Semester 6' },
            { href: '/courses/sem-6/natural-toxin', label: 'Natural Toxins' },
          ].map(({ href, label }) => (
            <span key={href} className="flex items-center gap-1.5">
              <Link href={href} className="hover:text-blue-600 transition-colors">{label}</Link>
              <ChevronRight size={13} />
            </span>
          ))}
          <span className="text-blue-700 font-semibold">Unit 4: Mycotoxins</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">

          {/* ════════════════════════════════════════════════════════
              LEFT SIDEBAR  (desktop only)
          ════════════════════════════════════════════════════════ */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0 print:hidden">
            <div className="sticky top-6 space-y-4">

              {/* course badge */}
              <div className="bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={12} className="opacity-80" />
                  <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">Natural Toxins</span>
                </div>
                <p className="font-bold text-base leading-snug">Semester 6 · Pharmacognosy</p>
              </div>

              {/* TOC */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm p-3.5">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                  <List size={12} /> Contents
                </p>
                <ul className="space-y-0.5">
                  {sections.map(sec => (
                    <li key={sec.id}>
                      <button
                        onClick={() => jumpTo(sec.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                          activeSection === sec.id
                            ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold shadow-sm'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        {sec.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* All Units */}
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm p-3.5">
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                  <BookOpen size={12} /> All Units
                </p>
                <ul className="space-y-0.5">
                  {allUnits.map(unit => (
                    <li key={unit.id}>
                      <Link
                        href={`/courses/sem-6/natural-toxin/${unit.slug}`}
                        className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all ${
                          unit.id === currentUnitId
                            ? 'bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold shadow-sm'
                            : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        <span>{unit.emoji}</span>
                        <span className="flex-1 leading-snug">{unit.title}</span>
                        <ChevronRight
                          size={12}
                          className={`shrink-0 transition-opacity ${unit.id === currentUnitId ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recently visited */}
              {recentNotes.filter(u => u.id !== currentUnitId).length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm p-3.5">
                  <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2.5">
                    <Clock size={12} /> Recently Visited
                  </p>
                  <ul className="space-y-0.5">
                    {recentNotes.filter(u => u.id !== currentUnitId).slice(0, 4).map(unit => (
                      <li key={unit.id}>
                        <Link
                          href={`/courses/sem-6/natural-toxin/${unit.slug}`}
                          className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
                        >
                          <span>{unit.emoji}</span>
                          <span className="flex-1 line-clamp-1">{unit.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Save PDF */}
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-700 hover:bg-white hover:shadow-md transition-all"
              >
                <Printer size={14} /> Save as PDF
              </button>
            </div>
          </aside>

          {/* ════════════════════════════════════════════════════════
              MAIN CONTENT
          ════════════════════════════════════════════════════════ */}
          <div className="flex-1 min-w-0">

            {/* ── hero banner ── */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden mb-5 sm:mb-7 bg-gradient-to-r from-blue-600 to-green-500 shadow-xl print:hidden">
              <div className="absolute -top-10 -right-10 w-36 sm:w-48 h-36 sm:h-48 rounded-full bg-white/10" />
              <div className="absolute -bottom-8 -left-8 w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-white/10" />
              <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 opacity-10">
                <Microscope size={70} className="text-white sm:hidden" />
                <Microscope size={90} className="text-white hidden sm:block" />
              </div>
              <div className="relative z-10 px-4 py-5 sm:px-8 sm:py-7">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-2.5">
                  <Zap size={10} /> Pharmacognosy · Sem 6
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-1.5">
                  Unit 4: Mycotoxins
                </h1>
                <p className="text-white/80 text-xs sm:text-sm md:text-base max-w-lg">
                  Foodborne fungal toxins & deadly mushroom poisons — mechanisms, clinical effects, and management.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {['2 Topics', '4 Toxin Groups', '7 References'].map(n => (
                    <span key={n} className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-semibold">{n}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── glass content card ── */}
            <div className="bg-white/55 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/60 shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10">
              <div className="hidden print:block print-watermark">PharmaWallah</div>

              {/* slide image */}
              <div
                id="intro"
                className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl overflow-hidden border border-white/40 bg-gray-100/50 cursor-zoom-in group relative scroll-mt-24"
                onClick={() => setLightboxOpen(true)}
                title="Click to enlarge"
              >
                <div className="relative w-full" style={{ aspectRatio: '2/1' }}>
                  <Image
                    src="/images/courses/sem-6/natural-toxin/unit4.png"
                    alt="Mycotoxins overview slide"
                    fill className="object-contain p-1.5" priority
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 800px"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                  <span className="bg-black/60 text-white text-xs sm:text-sm px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5">
                    <ExternalLink size={13} /> Tap to enlarge
                  </span>
                </div>
              </div>

              {/* intro text */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4 print:text-gray-900">
                Unit 4: Mycotoxins
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg mb-3">
                Mycotoxins are toxic secondary metabolites produced by fungi. This unit covers two critical categories: (1) toxins from moulds that contaminate food, such as <em>Aspergillus</em> and <em>Claviceps</em> species; and (2) toxins from poisonous mushrooms, specifically the deadly <em>Amanita</em> genus. While both are fungal in origin, they differ significantly in their sources, mechanisms, and public health impact.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg mb-6">
                The table below categorizes and compares the key mycotoxins and mushroom toxins covered in this unit.
              </p>

              {/* ── overview table ── */}
              <div id="overview-table" className="scroll-mt-24 mb-8 sm:mb-10">
                {/* Mobile: stacked cards */}
                <div className="sm:hidden space-y-3">
                  {[
                    {
                      cat: 'Foodborne Mycotoxins', catColor: 'text-blue-700',
                      fungi: 'Aspergillus flavus, A. parasiticus',
                      examples: 'Aflatoxin B1, M1. Found in maize, peanuts, tree nuts, spices.',
                      mechanism: 'Genotoxic; carcinogenic epoxide. Primary target: Liver.',
                      effects: 'Acute liver failure; chronic → hepatocellular carcinoma.',
                    },
                    {
                      cat: 'Foodborne Mycotoxins', catColor: 'text-blue-700',
                      fungi: 'Aspergillus, Penicillium spp.',
                      examples: 'Ochratoxin A. Common in cereals, coffee, dried fruit, wine.',
                      mechanism: 'Nephrotoxic. Primary target: Kidneys.',
                      effects: 'Kidney damage; potential carcinogen.',
                    },
                    {
                      cat: 'Foodborne Mycotoxins', catColor: 'text-blue-700',
                      fungi: 'Claviceps purpurea',
                      examples: 'Ergometrine, ergotamine. Contaminates rye, wheat, barley, oats.',
                      mechanism: 'Vasoactive; agonizes adrenergic, serotonergic, dopaminergic receptors.',
                      effects: 'Ergotism (St. Anthony\'s Fire): gangrene, convulsions, hallucinations.',
                    },
                    {
                      cat: 'Mushroom Toxins', catColor: 'text-green-700',
                      fungi: 'Amanita phalloides, A. virosa',
                      examples: 'α-amanitin, β-amanitin. Found in poisonous mushrooms.',
                      mechanism: 'Inhibits RNA polymerase II. Primary target: Hepatocytes.',
                      effects: 'Delayed gastroenteritis, acute liver failure, hepato-renal syndrome.',
                    },
                  ].map((row, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 bg-white/80 p-3.5 space-y-2 text-xs">
                      <p className={`font-bold text-sm ${row.catColor}`}>{row.cat}</p>
                      <div><span className="font-semibold text-gray-500">Fungi: </span><em>{row.fungi}</em></div>
                      <div><span className="font-semibold text-gray-500">Examples: </span>{row.examples}</div>
                      <div><span className="font-semibold text-gray-500">Mechanism: </span>{row.mechanism}</div>
                      <div><span className="font-semibold text-gray-500">Health Effects: </span>{row.effects}</div>
                    </div>
                  ))}
                </div>

                {/* Desktop: proper table */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-50 to-green-50">
                        {['Toxin Category','Primary Producing Fungi','Key Examples & Sources','Mechanism / Target','Major Health Effects'].map(h => (
                          <th key={h} className="px-3 py-3 text-left font-semibold text-gray-800 border border-gray-200 text-xs whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          cat: <strong className="text-blue-700">Foodborne</strong>,
                          fungi: <><em>Aspergillus flavus</em>, <em>A. parasiticus</em></>,
                          ex: 'Aflatoxin B1, M1 (milk). Maize, peanuts, nuts, spices.',
                          mech: <>Genotoxic epoxide. <strong>Liver</strong>.</>,
                          eff: 'Aflatoxicosis; hepatocellular carcinoma.',
                        },
                        {
                          cat: null,
                          fungi: <><em>Aspergillus</em>, <em>Penicillium</em> spp.</>,
                          ex: 'Ochratoxin A. Cereals, coffee, dried fruit, wine.',
                          mech: <>Nephrotoxic. <strong>Kidneys</strong>.</>,
                          eff: 'Kidney damage; potential carcinogen.',
                        },
                        {
                          cat: null,
                          fungi: <><em>Claviceps purpurea</em></>,
                          ex: 'Ergometrine, ergotamine. Rye, wheat, barley.',
                          mech: 'Vasoactive; adrenergic/serotonin/dopamine receptors.',
                          eff: <><strong>Ergotism</strong>: gangrene, convulsions, hallucinations.</>,
                        },
                        {
                          cat: <strong className="text-green-700">Mushroom Toxins</strong>,
                          fungi: <><em>Amanita phalloides</em>, <em>A. virosa</em></>,
                          ex: 'α-amanitin, β-amanitin. Poisonous mushrooms.',
                          mech: <>Inhibits RNA Pol II. <strong>Hepatocytes</strong>.</>,
                          eff: 'Gastroenteritis → acute liver failure → hepato-renal syndrome.',
                        },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-3 py-2.5 border border-gray-200 text-xs">{row.cat}</td>
                          <td className="px-3 py-2.5 border border-gray-200 text-xs whitespace-nowrap">{row.fungi}</td>
                          <td className="px-3 py-2.5 border border-gray-200 text-xs">{row.ex}</td>
                          <td className="px-3 py-2.5 border border-gray-200 text-xs">{row.mech}</td>
                          <td className="px-3 py-2.5 border border-gray-200 text-xs">{row.eff}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── 4.1 ── */}
              <SectionHeading id="sec-4-1">4.1 Fungal Toxins (Foodborne Mycotoxins)</SectionHeading>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg mb-4">
                These toxins are produced by moulds that grow on crops pre- or post-harvest. Exposure occurs through ingestion of contaminated food or feed, posing a widespread public health risk (WHO, 2023). More than 400 mycotoxins are known, but only a few are found at levels sufficient to cause health concerns.
              </p>

              <SubHeading>Aspergillus-derived Mycotoxins</SubHeading>

              {/* aflatoxins card */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-4">
                <p className="text-gray-800 text-sm sm:text-base font-medium mb-3">
                  <strong>Aflatoxins</strong> (Pusztahelyi et al., 2020): Produced mainly by <em>Aspergillus flavus</em> and <em>A. parasiticus</em>. Aflatoxin B₁ is the most potent natural carcinogen known.
                </p>
                <ul className="space-y-2.5">
                  {[
                    <><strong>Biosynthesis:</strong> Polyketide synthase pathway; produced under hot, humid conditions.</>,
                    <><strong>Toxicokinetics:</strong> Rapidly absorbed, metabolized in liver by CYP450 (CYP1A2, 3A4) to the reactive exo-8,9-epoxide. Forms DNA adducts at guanine → GC→TA transversions in <em>TP53</em> (codon 249), a signature mutation in hepatocellular carcinoma.</>,
                    <><strong>Acute toxicity:</strong> Aflatoxicosis: vomiting, abdominal pain, hepatitis, fulminant liver failure. Outbreaks: Kenya 2004 (125 deaths), India 1974.</>,
                    <><strong>Chronic effects:</strong> Strong correlation with liver cancer. Synergistic with hepatitis B infection.</>,
                    <><strong>Regulation:</strong> Codex: ≤15 µg/kg total aflatoxins; EU stricter at 4 µg/kg for B₁.</>,
                  ].map((b, i) => (
                    <li key={i} className="flex gap-2.5 text-gray-700 text-xs sm:text-sm md:text-base">
                      <Dot color="bg-blue-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ochratoxin card */}
              <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-4 sm:p-5 mb-4">
                <p className="text-gray-800 text-sm sm:text-base font-medium mb-3">
                  <strong>Ochratoxin A</strong> (Pusztahelyi et al., 2020): Produced by <em>A. ochraceus</em>, <em>A. carbonarius</em>, and <em>P. verrucosum</em>.
                </p>
                <ul className="space-y-2.5">
                  {[
                    <><strong>Mechanism:</strong> Inhibits mitochondrial ATP synthesis, disrupts calcium homeostasis, induces oxidative stress. Accumulates in proximal tubule cells via organic anion transporters.</>,
                    <><strong>Toxicity:</strong> Nephrotoxic; associated with <strong>Balkan endemic nephropathy</strong> and urinary tract tumors (IARC Group 2B).</>,
                    <><strong>Sources:</strong> Cereals (wheat, barley), coffee beans, dried fruit, wine, beer.</>,
                  ].map((b, i) => (
                    <li key={i} className="flex gap-2.5 text-gray-700 text-xs sm:text-sm md:text-base">
                      <Dot color="bg-purple-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* other toxins card */}
              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 sm:p-5 mb-5">
                <p className="text-gray-800 text-sm sm:text-base font-medium mb-3">
                  <strong>Other Aspergillus-related toxins:</strong>
                </p>
                <ul className="space-y-2.5">
                  {[
                    <><strong>Fumonisins</strong> (<em>Fusarium verticillioides</em>): Inhibit ceramide synthase, disrupting sphingolipid metabolism. Linked to oesophageal cancer and leukoencephalomalacia in horses.</>,
                    <><strong>Patulin</strong> (<em>Penicillium expansum</em>): In rotting apples. Causes GI distress and immunotoxicity; regulated at ≤50 µg/L in juice.</>,
                    <><strong>Sterigmatocystin:</strong> Aflatoxin precursor, less potent but carcinogenic; contaminates cheese and grains.</>,
                  ].map((b, i) => (
                    <li key={i} className="flex gap-2.5 text-gray-700 text-xs sm:text-sm md:text-base">
                      <Dot color="bg-amber-500" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <SubHeading>Ergot Alkaloids (from <em>Claviceps purpurea</em>)</SubHeading>
              <ul className="space-y-3 mb-6 pl-1">
                {[
                  { text: <><strong>Biosynthesis and Chemistry</strong> (Silva et al., 2023): Derived from tryptophan and dimethylallyl diphosphate, forming the tetracyclic ergoline ring. Key examples: ergotamine, ergometrine, ergocristine.</> },
                  {
                    text: <><strong>Mechanism:</strong> Partial agonists/antagonists at α-adrenergic, serotonin (5-HT<sub>2A</sub>), and dopamine D<sub>2</sub> receptors.</>,
                    sub: ['Vasoconstriction (α-adrenergic + serotonin) → gangrene.', 'CNS stimulation (dopamine/serotonin) → hallucinations, convulsions.'],
                  },
                  { text: <><strong>Historical outbreaks:</strong> &quot;St. Anthony's Fire&quot; (11th–18th centuries) from contaminated rye. Symptoms: burning limb pain, gangrene, psychosis.</> },
                  { text: <><strong>Modern relevance:</strong> Grain cleaning removes sclerotia. EU limit: 0.5 g/kg in unprocessed cereals. Veterinary cases still occur.</> },
                  { text: <><strong>Therapeutic use:</strong> Ergotamine for migraine; ergometrine for postpartum hemorrhage. Also LSD precursors (controlled). (Constantinou et al., 2025)</> },
                ].map(({ text, sub }, i) => (
                  <li key={i} className="flex gap-2.5 text-gray-700 text-xs sm:text-sm md:text-base">
                    <Dot color="bg-gradient-to-br from-blue-500 to-green-400" />
                    <div>
                      {text}
                      {sub && (
                        <ul className="mt-2 space-y-1.5 pl-3">
                          {sub.map((s, j) => (
                            <li key={j} className="flex gap-2 text-gray-600 text-xs sm:text-sm">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* ── 4.2 ── */}
              <SectionHeading id="sec-4-2">4.2 Mushroom Toxins (Amatoxins from <em>Amanita</em> spp.)</SectionHeading>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base md:text-lg mb-4">
                Poisoning from <em>Amanita phalloides</em> (Death Cap), <em>A. virosa</em> (Destroying Angel), and <em>Galerina</em> species causes the majority of fatal mushroom ingestions worldwide. <strong>Amatoxins</strong> account for &gt;90% of deaths (NCBI, 2025).
              </p>

              {/* clinical phases box */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 mb-5">
                <p className="text-rose-800 font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <AlertCircle size={16} /> Clinical Phases of Amatoxin Poisoning
                </p>
                <ol className="space-y-3">
                  {[
                    { phase: 'Phase 1 — Latent (6‑24 h)',          desc: 'Asymptomatic. Patients may not seek care.' },
                    { phase: 'Phase 2 — Gastrointestinal (24‑48 h)', desc: 'Cholera-like diarrhea, vomiting, abdominal cramps → dehydration, electrolyte imbalance, metabolic acidosis.' },
                    { phase: 'Phase 3 — Cytotoxic (48‑96 h)',       desc: 'Apparent improvement masks rising ALT/AST, coagulopathy (INR ↑), hypoglycemia, encephalopathy. Hepatic necrosis may progress to fulminant liver failure. Mortality 10–30%.' },
                  ].map(({ phase, desc }, i) => (
                    <li key={i} className="flex gap-3 text-xs sm:text-sm md:text-base">
                      <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <strong className="text-rose-800">{phase}:</strong>{' '}
                        <span className="text-gray-700">{desc}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <ul className="space-y-3 mb-6 pl-1">
                {[
                  { text: <><strong>Chemistry:</strong> Bicyclic octapeptides (α‑amanitin, β‑amanitin, γ‑amanitin). Heat-stable — not destroyed by cooking.</> },
                  { text: <><strong>Toxicokinetics</strong> (NCBI, 2025): Absorbed rapidly, peak plasma at 2‑4 h. Enterohepatic recirculation prolongs exposure. Hepatocellular uptake via OATP1B3; renal excretion.</> },
                  { text: <><strong>Mechanism</strong> (Paul et al., 2025): α-Amanitin binds RNA polymerase II, blocking mRNA synthesis. High-turnover cells (hepatocytes, renal tubules, intestinal epithelium) most affected → apoptosis and necrosis.</> },
                  {
                    text: <><strong>Management</strong> (NCBI, 2025; Paul et al., 2025):</>,
                    sub: [
                      'Supportive: IV fluids, glucose, electrolytes, FFP for coagulopathy.',
                      'Decontamination: Activated charcoal (early); multiple-dose to interrupt enterohepatic cycling.',
                      'Silibinin IV: Blocks OATP uptake and enterohepatic recycling.',
                      'N-acetylcysteine: Antioxidant, replenishes glutathione.',
                      'Liver transplantation: For severe coagulopathy or encephalopathy (King\'s College / Clichy criteria).',
                    ],
                  },
                  { text: <><strong>Prognostic factors:</strong> Early diagnosis (&lt;24 h) improves outcome. INR &gt;6 or grade III/IV encephalopathy → poor prognosis without transplant.</> },
                ].map(({ text, sub }, i) => (
                  <li key={i} className="flex gap-2.5 text-gray-700 text-xs sm:text-sm md:text-base">
                    <Dot color="bg-rose-500" />
                    <div>
                      {text}
                      {sub && (
                        <ul className="mt-2 space-y-1.5 pl-3">
                          {sub.map((s, j) => (
                            <li key={j} className="flex gap-2 text-gray-600 text-xs sm:text-sm">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* ── Key Concepts ── */}
              <SectionHeading id="key-concepts">Key Concepts and Management</SectionHeading>
              <div className="space-y-4 mb-8">
                {[
                  {
                    title: 'Prevention of Foodborne Mycotoxin Exposure (WHO, 2023)',
                    styles: cardStyles.blue,
                    points: [
                      'Good agricultural practices: crop rotation, resistant varieties, proper drying (moisture <14%), cool dry storage.',
                      'Monitoring and regulatory limits (Codex Alimentarius, EU, FDA).',
                      'Public education on avoiding mouldy food.',
                      'Diet diversification to reduce reliance on a single susceptible staple.',
                    ],
                  },
                  {
                    title: 'Management of Mushroom Poisoning (NCBI, 2025)',
                    styles: cardStyles.rose,
                    points: [
                      'Early identification of mushroom species by mycologist.',
                      'Aggressive supportive care: liver function, coagulation, and renal monitoring.',
                      'Consider silibinin (Legalon® SIL) 20‑50 mg/kg/day IV for 3‑5 days.',
                      'N-acetylcysteine as antioxidant (similar to acetaminophen protocol).',
                      'Liver transplantation in severe cases.',
                    ],
                  },
                  {
                    title: 'Therapeutic Paradox (Paul et al., 2025)',
                    styles: cardStyles.green,
                    points: [
                      'Ergot alkaloids → ergotamine (migraine), ergometrine (postpartum hemorrhage).',
                      'Aflatoxin research → insights into liver carcinogenesis; chemoprevention with oltipraz.',
                      'Amatoxin-conjugated antibodies explored for targeted cancer therapy (antibody-drug conjugates).',
                      'Penicillins and cyclosporine (fungal origin) are life-saving drugs — not toxins themselves.',
                    ],
                  },
                ].map(({ title, styles, points }) => (
                  <div key={title} className={`rounded-2xl border p-4 sm:p-5 ${styles.wrap}`}>
                    <p className={`font-semibold mb-3 text-sm sm:text-base ${styles.title}`}>{title}</p>
                    <ul className="space-y-2">
                      {points.map((p, i) => (
                        <li key={i} className="flex gap-2.5 text-gray-700 text-xs sm:text-sm md:text-base">
                          <Dot color={styles.dot} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* ── References ── */}
              <SectionHeading id="references">References</SectionHeading>
              <ol className="list-decimal pl-5 space-y-2 text-gray-600 text-xs sm:text-sm mb-8">
                <li>Pusztahelyi, T., Holb, I.J., &amp; Pócsi, I. (2020). Toxicological and Medical Aspects of <em>Aspergillus</em>-Derived Mycotoxins. <em>Frontiers in Microbiology, 10</em>, 2908.</li>
                <li>National Center for Biotechnology Information (NCBI). (2025). Amatoxin Mushroom Toxicity. In <em>StatPearls</em> [Internet]. StatPearls Publishing.</li>
                <li>World Health Organization (WHO). (2023). <em>Mycotoxins</em>. WHO Fact Sheet.</li>
                <li>Silva, L.J.G., et al. (2023). Ergot Alkaloids on Cereals and Seeds. <em>Molecules, 28</em>(20), 7233.</li>
                <li>Constantinou, M., et al. (2025). Innovative Detection and Mitigation of Ergot Alkaloids. <em>Metabolites, 15</em>(12), 778.</li>
                <li>Paul, S., et al. (2025). A comprehensive review on poisonous mushrooms. <em>Toxicon, 266</em>, 108538.</li>
                <li>IARC Working Group. (2012). Chemical agents. <em>IARC Monographs, 100F</em>, 225–248.</li>
              </ol>

              {/* print/PDF button */}
              <div className="flex justify-center mt-4 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-2xl font-extrabold text-sm sm:text-base shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
                >
                  <Icon icon="mdi:file-pdf" className="text-xl sm:text-2xl" />
                  Download as PDF
                </button>
              </div>
            </div>

            {/* ── prev / next ── */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 print:hidden">
              {prevUnit ? (
                <Link
                  href={`/courses/sem-6/natural-toxin/${prevUnit.slug}`}
                  className="group relative flex items-center gap-3 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-md p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400 rounded-t-2xl" />
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <ChevronLeft size={18} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Previous</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">
                      {prevUnit.emoji} {prevUnit.title}
                    </p>
                  </div>
                </Link>
              ) : <div />}

              {nextUnit && (
                <Link
                  href={`/courses/sem-6/natural-toxin/${nextUnit.slug}`}
                  className="group relative flex items-center justify-end gap-3 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-md p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all overflow-hidden sm:col-start-2"
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-400 to-blue-600 rounded-t-2xl" />
                  <div className="min-w-0 text-right">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">Next</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-tight">
                      {nextUnit.emoji} {nextUnit.title}
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <ChevronRight size={18} className="text-blue-600" />
                  </div>
                </Link>
              )}
            </div>
          </div>{/* /main content */}
        </div>
      </div>

      {/* ── scroll to top ── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-green-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center print:hidden"
          aria-label="Scroll to top"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* ── print styles ── */}
      <style jsx global>{`
        @media print {
          @page { margin: 2cm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-watermark {
            display: block !important;
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 72px;
            color: rgba(0, 100, 0, 0.15);
            white-space: nowrap;
            pointer-events: none;
            z-index: 9999;
            font-weight: bold;
          }
          footer, header { display: none !important; }
        }
      `}</style>
    </section>
  );
}