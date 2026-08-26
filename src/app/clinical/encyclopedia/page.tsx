"use client";

import { useState, useEffect, useCallback } from "react";
import DrugSearch from "@/components/DrugSearch";

import {
  Database,
  Activity,
  Pill,
  FlaskConical,
  GitCompare,
  Package,
  Scale,
  Tag,
  Link as LinkIcon,
  Apple,
  AlertOctagon,
  Building2,
  TriangleAlert,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Search,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* DATA                                                                       */
/* -------------------------------------------------------------------------- */

const heroStats = [
  {
    value: "17.4K+",
    label: "Drug profiles",
  },
  {
    value: "50K+",
    label: "Interactions",
  },
  {
    value: "100K+",
    label: "Products",
  },
  {
    value: "200+",
    label: "Categories",
  },
];

const features = [
  {
    Icon: FlaskConical,
    label: "Chemical Properties",
    description:
      "CAS numbers, UNII identifiers, molecular weight and structural classification.",
    iconClass:
      "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600",
  },

  {
    Icon: Activity,
    label: "Pharmacokinetics",
    description:
      "Absorption, half-life, protein binding, distribution, clearance and elimination.",
    iconClass:
      "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
  },

  {
    Icon: AlertOctagon,
    label: "Pharmacodynamics",
    description:
      "Indications, mechanisms of action, therapeutic effects and toxicity information.",
    iconClass:
      "bg-violet-50 text-violet-600 group-hover:bg-violet-600",
  },

  {
    Icon: GitCompare,
    label: "Drug Interactions",
    description:
      "Drug-drug and drug-food interaction information with clinical severity.",
    iconClass:
      "bg-sky-50 text-sky-600 group-hover:bg-sky-600",
  },

  {
    Icon: Package,
    label: "Products",
    description:
      "Manufacturers, dosage forms, strengths, routes and product information.",
    iconClass:
      "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
  },

  {
    Icon: Scale,
    label: "Dosage Information",
    description:
      "Available strengths, dosage forms and administration routes.",
    iconClass:
      "bg-teal-50 text-teal-600 group-hover:bg-teal-600",
  },

  {
    Icon: Tag,
    label: "Classification",
    description:
      "Chemical taxonomy including superclass, class, subclass and direct parent.",
    iconClass:
      "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600",
  },

  {
    Icon: Apple,
    label: "Food Interactions",
    description:
      "Food-related effects on absorption, metabolism, efficacy and adverse effects.",
    iconClass:
      "bg-orange-50 text-orange-600 group-hover:bg-orange-600",
  },

  {
    Icon: Building2,
    label: "Synonyms & Salts",
    description:
      "Alternative names, brand names and salt forms with identifiers.",
    iconClass:
      "bg-slate-100 text-slate-600 group-hover:bg-slate-700",
  },

  {
    Icon: LinkIcon,
    label: "References",
    description:
      "Clinical articles, PubMed identifiers, DOIs and external resources.",
    iconClass:
      "bg-sky-50 text-sky-600 group-hover:bg-sky-600",
  },

  {
    Icon: Pill,
    label: "Drug Groups",
    description:
      "Approved, investigational, experimental, withdrawn and other drug groups.",
    iconClass:
      "bg-rose-50 text-rose-600 group-hover:bg-rose-600",
  },

  {
    Icon: Database,
    label: "Drug Metadata",
    description:
      "Identifiers, source information and available database metadata.",
    iconClass:
      "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
  },
];

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function ClinicalEncyclopediaPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  /* ------------------------------------------------------------------------ */
  /* RESPONSIVE SLIDER                                                       */
  /* ------------------------------------------------------------------------ */

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

    window.addEventListener(
      "resize",
      updateItemsPerView
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateItemsPerView
      );
    };
  }, [updateItemsPerView]);

  const totalSlides = Math.ceil(
    features.length / itemsPerView
  );

  const maxIndex = Math.max(
    totalSlides - 1,
    0
  );

  const goToSlide = (index: number) => {
    setCurrentIndex(
      Math.max(
        0,
        Math.min(index, maxIndex)
      )
    );
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-[#F8FBFD] text-slate-900">

      {/* ================================================================== */}
      {/* HERO                                                               */}
      {/* ================================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">

        {/* Soft clinical background */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-blue-100/50 blur-3xl" />

          <div className="absolute -bottom-40 left-10 h-[350px] w-[350px] rounded-full bg-cyan-100/40 blur-3xl" />

          <div className="absolute right-[35%] top-[20%] h-40 w-40 rounded-full bg-teal-100/30 blur-3xl" />

        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">

          {/* Breadcrumb */}

          <div className="mb-10 flex items-center gap-2 text-xs font-medium text-slate-400">

            <span>PharmaWallah</span>

            <span>/</span>

            <span className="text-blue-600">
              Clinical
            </span>

            <span>/</span>

            <span className="text-slate-500">
              Drug Encyclopedia
            </span>

          </div>

          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">

            {/* ------------------------------------------------------------ */}
            {/* HERO CONTENT                                                 */}
            {/* ------------------------------------------------------------ */}

            <div>

              {/* Label */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold tracking-wide text-blue-700">

                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                  <Stethoscope className="h-3 w-3 text-white" />
                </span>

                PHARMAWALLAH CLINICAL

              </div>

              {/* Heading */}

              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">

                Clinical drug information,

                <span className="block bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  built for better decisions.
                </span>

              </h1>

              {/* Description */}

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">

                Explore structured pharmacological information,
                medication properties, interactions, products
                and clinical references through one searchable
                platform.

              </p>

              {/* Quick benefits */}

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">

                {[
                  "Structured drug information",
                  "Clinical reference",
                  "Fast drug search",
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600"
                  >

                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">

                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />

                    </span>

                    {item}

                  </div>

                ))}

              </div>

              {/* Stats */}

              <div className="mt-10 grid max-w-2xl grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-4">

                {heroStats.map(
                  ({ value, label }, index) => (

                    <div
                      key={label}
                      className={`px-5 py-5 ${
                        index !== 0
                          ? "border-t border-slate-200 sm:border-l sm:border-t-0"
                          : ""
                      }`}
                    >

                      <div className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                        {value}
                      </div>

                      <div className="mt-1 text-xs font-medium text-slate-500">
                        {label}
                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

            {/* ------------------------------------------------------------ */}
            {/* HERO DRUG PROFILE                                            */}
            {/* ------------------------------------------------------------ */}

            <div className="relative mx-auto w-full max-w-md lg:ml-auto">

              {/* Glow */}

              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-blue-100/70 via-cyan-50/50 to-teal-100/40 blur-2xl" />

              {/* Card */}

              <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.06]">

                {/* Top bar */}

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                      <Pill className="h-5 w-5 text-blue-600" />

                    </div>

                    <div>

                      <p className="text-sm font-semibold text-slate-900">
                        Drug Profile
                      </p>

                      <p className="text-xs text-slate-400">
                        Clinical reference
                      </p>

                    </div>

                  </div>

                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">

                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                    Active

                  </span>

                </div>

                {/* Drug */}

                <div className="px-6 py-6">

                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-600">
                    Example profile
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    Metformin
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Biguanide antidiabetic agent
                  </p>

                  {/* Data */}

                  <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50">

                    <div className="flex items-center justify-between px-4 py-3">

                      <span className="text-xs text-slate-500">
                        Drug class
                      </span>

                      <span className="text-xs font-semibold text-slate-800">
                        Biguanide
                      </span>

                    </div>

                    <div className="flex items-center justify-between px-4 py-3">

                      <span className="text-xs text-slate-500">
                        Molecular weight
                      </span>

                      <span className="text-xs font-semibold text-slate-800">
                        129.16 g/mol
                      </span>

                    </div>

                    <div className="flex items-center justify-between px-4 py-3">

                      <span className="text-xs text-slate-500">
                        Formula
                      </span>

                      <span className="text-xs font-semibold text-slate-800">
                        C₄H₁₁N₅
                      </span>

                    </div>

                  </div>

                  {/* Mini features */}

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">

                      <Activity className="h-4 w-4 text-blue-600" />

                      <p className="mt-2 text-xs font-semibold text-slate-800">
                        Pharmacokinetics
                      </p>

                      <p className="mt-1 text-[11px] text-slate-500">
                        Available
                      </p>

                    </div>

                    <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">

                      <GitCompare className="h-4 w-4 text-cyan-600" />

                      <p className="mt-2 text-xs font-semibold text-slate-800">
                        Interactions
                      </p>

                      <p className="mt-1 text-[11px] text-slate-500">
                        Available
                      </p>

                    </div>

                  </div>

                </div>

                {/* Bottom */}

                <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2 text-xs text-slate-500">

                      <Database className="h-3.5 w-3.5 text-blue-500" />

                      Structured drug data

                    </div>

                    <ArrowUpRight className="h-4 w-4 text-slate-400" />

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================================================================== */}
      {/* MAIN                                                               */}
      {/* ================================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8">

        {/* ================================================================ */}
        {/* DISCLAIMER                                                       */}
        {/* ================================================================ */}

        <div className="mb-16 flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-5 py-4">

          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <p className="text-sm leading-6 text-amber-800">

            <span className="font-semibold text-amber-900">
              Clinical information notice:
            </span>{" "}
            Information provided through this resource is
            intended for educational and clinical reference
            purposes. It should not replace professional
            clinical judgment, official prescribing information,
            or institutional protocols.

          </p>

        </div>

        {/* ================================================================ */}
        {/* SEARCH                                                           */}
        {/* ================================================================ */}

        <section className="mb-20">

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">

                  <Search className="h-5 w-5 text-blue-600" />

                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Drug database
                  </p>

                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    Search clinical drug information
                  </h2>

                </div>

              </div>

              <p className="ml-[52px] max-w-xl text-sm leading-6 text-slate-500">
                Search by drug name, CAS number or UNII
                to explore available pharmacological information.
              </p>

            </div>

            <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">

              <Database className="h-4 w-4" />

              Structured clinical data

            </div>

          </div>

          {/* Search container */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] sm:p-7">

            <DrugSearch />

          </div>

        </section>

        {/* ================================================================ */}
        {/* INFORMATION COVERAGE                                            */}
        {/* ================================================================ */}

        <section>

          <div className="mb-8 flex items-end justify-between border-b border-slate-200 pb-6">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                Drug profile
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Clinical information at a glance
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Key pharmacological, medication and product
                information organized into one structured profile.
              </p>

            </div>

            {/* Desktop controls */}

            <div className="hidden items-center gap-2 sm:flex">

              <button
                type="button"
                onClick={() =>
                  goToSlide(
                    currentIndex - 1
                  )
                }
                disabled={
                  currentIndex === 0
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous features"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  goToSlide(
                    currentIndex + 1
                  )
                }
                disabled={
                  currentIndex === maxIndex
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next features"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

            </div>

          </div>

          {/* Feature slider */}

          <div className="overflow-hidden">

            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${
                  currentIndex *
                  (100 / itemsPerView)
                }%)`,
              }}
            >

              {features.map(
                ({
                  Icon,
                  label,
                  description,
                  iconClass,
                }) => (

                  <div
                    key={label}
                    className="shrink-0"
                    style={{
                      width: `${
                        100 /
                        itemsPerView
                      }%`,
                    }}
                  >

                    <div className="p-2">

                      <article className="group h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/[0.05]">

                        <div className="mb-6 flex items-start justify-between">

                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-300 ${iconClass} group-hover:text-white`}
                          >

                            <Icon className="h-5 w-5" />

                          </div>

                          <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-blue-500" />

                        </div>

                        <h3 className="text-base font-bold text-slate-900">
                          {label}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {description}
                        </p>

                      </article>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

          {/* Mobile controls */}

          <div className="mt-6 flex items-center justify-center gap-3 sm:hidden">

            <button
              type="button"
              onClick={() =>
                goToSlide(
                  currentIndex - 1
                )
              }
              disabled={
                currentIndex === 0
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-medium text-slate-400">
              {currentIndex + 1} / {totalSlides}
            </span>

            <button
              type="button"
              onClick={() =>
                goToSlide(
                  currentIndex + 1
                )
              }
              disabled={
                currentIndex === maxIndex
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

          </div>

          {/* Desktop indicators */}

          <div className="mt-7 hidden justify-center gap-1.5 sm:flex">

            {Array.from({
              length: totalSlides,
            }).map((_, index) => (

              <button
                key={index}
                type="button"
                onClick={() =>
                  goToSlide(index)
                }
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-blue-600"
                    : "w-1.5 bg-slate-300"
                }`}
                aria-label={`Go to feature slide ${
                  index + 1
                }`}
              />

            ))}

          </div>

        </section>

      </section>

      {/* ================================================================== */}
      {/* FOOTER                                                             */}
      {/* ================================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-sm shadow-blue-500/20">

              <Stethoscope className="h-5 w-5 text-white" />

            </div>

            <div>

              <p className="text-sm font-bold text-slate-950">
                PharmaWallah Clinical
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Clinical pharmacy resources
              </p>

            </div>

          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">

            <ShieldCheck className="h-4 w-4 text-emerald-500" />

            For educational and clinical reference purposes

          </div>

        </div>

      </footer>

    </main>
  );
}