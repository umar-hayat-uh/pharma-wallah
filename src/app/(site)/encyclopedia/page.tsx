"use client"; // Required for carousel state & hooks

import { useState, useEffect, useCallback, useRef } from "react";
import DrugSearch from '@/components/DrugSearch';
import {
  Database, Activity, Pill,
  FlaskConical, GitCompare, Package, Scale, Tag, Link as LinkIcon,
  Apple, AlertOctagon, Building2, TriangleAlert,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Metadata } from 'next';

// Metadata can't be exported from a client component.
// Move metadata export to a separate layout.tsx or page.tsx (server component).
// For simplicity in this snippet, we'll omit the metadata export.
// If you need metadata, wrap this component in a server layout that defines it.

const heroStats = [
  { n: "17.4k+", l: "Drugs" },
  { n: "50k+", l: "Interactions" },
  { n: "100k+", l: "Products" },
  { n: "200+", l: "Categories" },
];

const features = [
  { Icon: FlaskConical, label: "Chemical Properties", desc: "Physical state, CAS number, UNII, molecular weight, and structural classification." },
  { Icon: Activity, label: "Pharmacokinetics", desc: "Absorption, half-life, protein binding, Vd, clearance, and routes of elimination." },
  { Icon: AlertOctagon, label: "Pharmacodynamics", desc: "Indication, mechanism of action, toxicity data, and therapeutic effects." },
  { Icon: GitCompare, label: "Drug Interactions", desc: "Drug-drug and drug-food interactions with severity classification." },
  { Icon: Package, label: "Products", desc: "Commercial products with labeller, dosage form, strength, route, and approval status." },
  { Icon: Scale, label: "Dosages", desc: "Available forms, administration routes, and detailed strength specifications." },
  { Icon: Tag, label: "Classification", desc: "Chemical taxonomy: kingdom, superclass, class, subclass, and direct parent." },
  { Icon: Apple, label: "Food Interactions", desc: "Foods affecting drug absorption, metabolism, or side effects." },
  { Icon: Building2, label: "Synonyms & Salts", desc: "Alternative names, brand names, and salt forms with UNII identifiers." },
  { Icon: LinkIcon, label: "References", desc: "Clinical articles, PubMed IDs, DOIs, and external resource links." },
  { Icon: Pill, label: "Drug Groups", desc: "Approved, investigational, experimental, withdrawn, illicit, and nutraceutical." },
  { Icon: Database, label: "Metadata", desc: "Creation date, last update, DrugBank ID, and full source information." },
];

export default function EncyclopediaPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const trackRef = useRef<HTMLDivElement>(null);

  // Responsive items per view
  const updateItemsPerView = useCallback(() => {
    const width = window.innerWidth;
    if (width < 640) {
      setItemsPerView(1);
    } else if (width < 1024) {
      setItemsPerView(2);
    } else {
      setItemsPerView(3);
    }
  }, []);

  useEffect(() => {
    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, [updateItemsPerView]);

  const totalSlides = Math.ceil(features.length / itemsPerView);
  const maxIndex = Math.max(0, totalSlides - 1);

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(Math.max(index, 0), maxIndex));
  };

  const nextSlide = () => goToSlide(currentIndex + 1);
  const prevSlide = () => goToSlide(currentIndex - 1);

  // Compute translateX percentage
  const slideWidthPercentage = 100 / itemsPerView;
  const translateX = -currentIndex * slideWidthPercentage;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-green-400 selection:text-white">

      {/* HEADER / HERO */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-400 pt-24 pb-20">
        {/* Decorative blur circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-5">
            Drug Encyclopedia
          </h1>
          <p className="text-blue-50 max-w-2xl mx-auto text-base sm:text-lg mb-12 leading-relaxed">
            A comprehensive database of 17,430+ drugs. Powered by DrugBank for clean, accessible pharmacological data.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            {heroStats.map(({ n, l }) => (
              <div
                key={l}
                className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-3 text-center min-w-[120px]"
              >
                <div className="text-2xl sm:text-3xl font-bold text-white">{n}</div>
                <div className="text-xs font-semibold text-blue-100 uppercase tracking-widest mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 py-16">

        {/* DISCLAIMER */}
        <div className="flex items-start gap-3 p-5 bg-amber-50 border border-amber-200 rounded-2xl mb-16 shadow-sm">
          <TriangleAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-semibold text-amber-900">Educational Use Only.</span>{" "}
            Information provided is for reference purposes. Do not self-medicate; always consult a healthcare provider.
          </p>
        </div>

        {/* SEARCH SECTION */}
        <section className="mb-24">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Search Database</h2>
            <p className="text-sm text-slate-500">Find detailed drug profiles by name, UNII, or CAS number.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <DrugSearch />
          </div>
        </section>

        {/* DATA COVERAGE SLIDER */}
        <section className="mb-16">
          <div className="mb-8 border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Data Coverage</h2>
              <p className="text-sm text-slate-500">Comprehensive profiles include the following sections.</p>
            </div>
            {/* Slider controls */}
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <button
                onClick={prevSlide}
                disabled={currentIndex === 0}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                disabled={currentIndex === maxIndex}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                aria-label="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slider container */}
          <div className="overflow-hidden">
            <div
              ref={trackRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${translateX}%)` }}
            >
              {features.map(({ Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex-shrink-0"
                  style={{ width: `${slideWidthPercentage}%` }}
                >
                  <div className="p-2">
                    <div className="group bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 h-full flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{label}</h3>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2 rounded-full transition-all ${idx === currentIndex ? "w-6 bg-blue-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-wide">Pharmacopedia</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Data sourced from DrugBank v5.1
          </p>
        </div>
      </footer>
    </div>
  );
}