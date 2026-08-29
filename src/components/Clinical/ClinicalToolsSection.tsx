"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  GitCompareArrows,
  ShieldAlert,
  Bug,
  BookOpen,
  Syringe,
  Database,
  Microscope,
  Pill,
  Search,
  Sparkles,
  ArrowRight,
  X,
  Utensils,
} from "lucide-react";

import ClinicalToolCard from "./ClinicalToolCard";

type Category =
  | "all"
  | "clinical"
  | "laboratory"
  | "medication";

interface Tool {
  title: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  description: string;
  category: Category;
  featured?: boolean;
  comingSoon?: boolean;
}

const tools: Tool[] = [
  {
    title: "Drug-Drug Interaction Checker",
    icon: <GitCompareArrows className="w-6 h-6" />,
    color: "blue",
    href: "/clinical/drug-drug-interaction",
    category: "clinical",
    featured: true,
    description:
      "Analyze potential interactions between medications using structured clinical information.",
  },

  {
    title: "Adverse Effect Detector",
    icon: <ShieldAlert className="w-6 h-6" />,
    color: "rose",
    href: "/clinical/adr",
    category: "clinical",
    featured: true,
    description:
      "Identify possible medication-related adverse effects and support clinical assessment.",
  },

  {
    title: "Antibiogram",
    icon: <Bug className="w-6 h-6" />,
    color: "amber",
    href: "/clinical/amr",
    category: "clinical",
    featured: true,
    description:
      "Explore antimicrobial susceptibility patterns and support antimicrobial selection.",
  },

  {
    title: "Clinical Calculators",
    icon: <Syringe className="w-6 h-6" />,
    color: "violet",
    href: "/clinical/calculators",
    category: "clinical",
    featured: true,
    description:
      "Access pharmacy-focused calculations for common clinical scenarios.",
  },

  {
    title: "Pharmacopedia",
    icon: <BookOpen className="w-6 h-6" />,
    color: "emerald",
    href: "/encyclopedia",
    category: "medication",
    featured: true,
    description:
      "Explore structured drug information, mechanisms, pharmacokinetics and medication resources.",
  },

  {
    title: "Dose & Therapy Tools",
    icon: <Syringe className="w-6 h-6" />,
    color: "teal",
    href: "/clinical/calculators",
    category: "clinical",
    featured: true,
    description:
      "Support dose adjustments, renal dosing and therapy-related calculations.",
  },

  {
    title: "Drug Food Interaction Checker",
    icon: <Utensils className="w-6 h-6" />,
    color: "cyan",
    href: "/clinical/drug-food-interaction",
    category: "laboratory",
    featured: true,
    description:
      "Search standardized laboratory and clinical observation terminology using LOINC.",
  },


  {
    title: "Medication Reference",
    icon: <Pill className="w-6 h-6" />,
    color: "blue",
    href: "/clinical/resources/dailymed",
    category: "medication",
    description:
      "Explore medication information including indications, dosing and precautions.",
  },

  {
    title: "Clinical Guidelines",
    icon: <BookOpen className="w-6 h-6" />,
    color: "violet",
    href: "/clinical/resources/pubmed",
    category: "clinical",
    description:
      "Access organized clinical guideline resources for pharmacy practice.",
    comingSoon: true,
  },
];

export default function ClinicalToolsSection() {
  const [activeCategory, setActiveCategory] =
    useState<Category>("all");

  const [search, setSearch] = useState("");

  const categories = [
    {
      id: "all" as Category,
      label: "All Features",
    },
    {
      id: "clinical" as Category,
      label: "Clinical",
    },
    {
      id: "laboratory" as Category,
      label: "Laboratory",
    },
    {
      id: "medication" as Category,
      label: "Medication",
    },
  ];

  const filteredTools = useMemo(() => {
    const term = search.toLowerCase().trim();

    return tools.filter((tool) => {
      const categoryMatch =
        activeCategory === "all" ||
        tool.category === activeCategory;

      const searchMatch =
        !term ||
        tool.title.toLowerCase().includes(term) ||
        tool.description.toLowerCase().includes(term);

      return categoryMatch && searchMatch;
    });
  }, [activeCategory, search]);

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-white px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-blue-50 blur-3xl" />

        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-cyan-50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">

        {/* HEADER */}
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-80px",
          }}
          transition={{
            duration: 0.6,
          }}
          className="mx-auto mb-12 max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Sparkles className="h-4 w-4" />
            PharmaWallah Clinical
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Everything you need for
            <span className="block text-blue-600">
              smarter pharmacy practice
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-500">
            Clinical tools, medication resources and laboratory
            references designed to support pharmacists and
            healthcare learners.
          </p>
        </motion.div>

        {/* SEARCH */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="mx-auto mb-8 max-w-3xl"
        >
          <div className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search clinical features..."
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-14 pr-12 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>

        {/* FILTERS */}
        <div className="mb-12 flex flex-wrap justify-center gap-2">
          {categories.map((category) => {
            const active =
              activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setActiveCategory(category.id)
                }
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                  }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* FEATURES */}
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-950">
                Clinical Features
              </h3>

              <p className="text-sm text-slate-500">
                Tools designed around real clinical workflows
              </p>
            </div>

            <div className="hidden h-px flex-1 bg-slate-200 sm:block" />

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
              {filteredTools.length} features
            </span>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map(
                (tool, index) => (
                  <div
                    key={tool.title}
                    className="relative"
                  >
                    <ClinicalToolCard
                      {...tool}
                      index={index}
                    />

                  </div>
                )
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-300" />

              <h3 className="mt-4 font-semibold text-slate-900">
                No features found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try another search term or category.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="mt-16 overflow-hidden rounded-3xl bg-slate-950"
        >
          <div className="relative px-6 py-10 sm:px-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-400">
                  PharmaWallah Clinical
                </p>

                <h3 className="mt-2 text-2xl font-bold text-white">
                  More clinical features are coming.
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  We are continuously expanding PharmaWallah
                  Clinical with more clinical decision-support,
                  laboratory and medication resources.
                </p>
              </div>

              <a
                href="/clinical"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Explore Clinical
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* DISCLAIMER */}
        <div className="mt-8 text-center">
          <p className="mx-auto max-w-3xl text-xs leading-5 text-slate-400">
            PharmaWallah Clinical is an educational and
            clinical decision-support resource. Information and
            tools should not replace professional clinical
            judgment, institutional protocols or official
            prescribing information.
          </p>
        </div>
      </div>
    </section>
  );
}