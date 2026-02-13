"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Info,
  BookOpen,
  Wrench,
  Headphones,
  ArrowRight,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const categories = [
  { id: "general", label: "General", icon: Info, accent: "#2563EB" },
  { id: "content", label: "Content & Features", icon: BookOpen, accent: "#7C3AED" },
  { id: "usage", label: "Usage & Access", icon: Wrench, accent: "#059669" },
  { id: "support", label: "Support & Feedback", icon: Headphones, accent: "#D97706" },
];

const faqs = [
  // ── General
  {
    id: 1,
    category: "general",
    q: "What is Pharma Wallah?",
    a: "Pharma Wallah is an online educational platform designed for pharmacy and pharmaceutical science students. It offers free access to structured study materials, practice questions, a drug encyclopedia (Pharmacopedia), and calculation tools to support academic and professional development.",
  },
  {
    id: 2,
    category: "general",
    q: "Who is this platform for?",
    a: "The platform is tailored for undergraduate (B.Pharm, D.Pharm) and postgraduate pharmacy students, aspirants preparing for competitive exams like GPAT, and pharmacy professionals seeking to refresh their knowledge.",
  },
  {
    id: 3,
    category: "general",
    q: "Is Pharma Wallah completely free?",
    a: "Yes. All core resources — study materials, MCQ Bank, Pharmacopedia, and calculation tools — are available completely free of charge. No hidden fees, no subscriptions.",
  },
  {
    id: 4,
    category: "general",
    q: "Do I need to create an account?",
    a: "Currently, an account is not required to access most resources. Future updates may include optional accounts for features like personalized progress tracking and saved notes.",
  },

  // ── Content & Features
  {
    id: 5,
    category: "content",
    q: "What subjects are covered on the platform?",
    a: "We cover essential pharmacy subjects including Pharmaceutics, Pharmaceutical Chemistry, Pharmacology, Pharmacognosy, Pharmaceutical Analysis, Biopharmaceutics, Clinical Pharmacy, Hospital Pharmacy, Pharmacy Practice, and Pharmaceutical Microbiology.",
  },
  {
    id: 6,
    category: "content",
    q: "Who creates the content?",
    a: "Content is curated and developed by experienced pharmacy educators, professors, and industry experts. Their profiles are available on the platform so you can learn more about the people behind the material.",
  },
  {
    id: 7,
    category: "content",
    q: "What is included in the Study Material section?",
    a: "The Study Material section provides structured resources such as detailed lecture notes, topic-wise summaries, diagrams and illustrations, and key concept explanations — all aligned with standard pharmacy curricula.",
  },
  {
    id: 8,
    category: "content",
    q: "How can the MCQ Bank help me?",
    a: "The MCQ Bank offers a vast collection of multiple-choice questions for self-assessment, semester exam preparation, and competitive exam practice (e.g., GPAT). Each question comes with detailed explanations to reinforce understanding.",
  },
  {
    id: 9,
    category: "content",
    q: "What is Pharmacopedia?",
    a: "Pharmacopedia is an integrated drug encyclopedia offering concise information on medicines — including uses and mechanisms, side effects and interactions, and drug classifications. It serves as a quick reference tool for students and professionals.",
  },
  {
    id: 10,
    category: "content",
    q: "What types of Calculation Tools are available?",
    a: "Our interactive tools assist with common pharmacy calculations including dosage calculations, dilution and concentration problems, isotonic solutions, and pharmacokinetic parameters — with step-by-step guidance.",
  },

  // ── Usage & Access
  {
    id: 11,
    category: "usage",
    q: "How do I access study materials?",
    a: "Navigate to the Material section from the main menu. Content is organized by subject and topic for easy browsing. No login is required — just visit and start learning.",
  },
  {
    id: 12,
    category: "usage",
    q: "Can I download content for offline use?",
    a: "Yes. Most study materials are available in downloadable PDF formats for offline access, so you can study anytime, anywhere — even without an internet connection.",
  },
  {
    id: 13,
    category: "usage",
    q: "Is there a mobile app?",
    a: "Information about a mobile application, if available, will be displayed on the website. Check the homepage or footer for download links. The website itself is fully responsive and works great on mobile browsers.",
  },

  // ── Support & Feedback
  {
    id: 14,
    category: "support",
    q: "I found an error or broken tool. How do I report it?",
    a: "Please use the Contact Us details provided on the website to report issues. Your feedback is invaluable — it helps us maintain accuracy and quality across all resources.",
  },
  {
    id: 15,
    category: "support",
    q: "How often is new content added?",
    a: "We continuously expand and update our resources. Follow our social media channels or check the website regularly for announcements about new subjects, tools, or features.",
  },
  {
    id: 16,
    category: "support",
    q: "Can I contribute content to Pharma Wallah?",
    a: "We welcome inquiries from qualified professionals. For contribution opportunities, please contact us through the official channels listed on the website — we'd love to have knowledgeable experts join our mission.",
  },
  {
    id: 17,
    category: "support",
    q: "My question isn't listed here. Where can I get help?",
    a: "For further assistance, visit the About Us or Contact section for relevant email addresses or contact forms. Our team is happy to help with any questions not covered here.",
  },
];

// ─── Accordion Item ───────────────────────────────────────────────────────────

function AccordionItem({
  item,
  accent,
  isOpen,
  onToggle,
}: {
  item: (typeof faqs)[0];
  accent: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{
        borderColor: isOpen ? accent + "40" : "#E5E7EB",
        background: isOpen ? accent + "06" : "#fff",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 px-6 py-5 text-left group"
      >
        <span
          className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200"
          style={{
            background: isOpen ? accent : "#F3F4F6",
            color: isOpen ? "#fff" : "#6B7280",
          }}
        >
          {item.id}
        </span>

        <span
          className="flex-1 text-base font-semibold transition-colors duration-200"
          style={{ color: isOpen ? accent : "#111827" }}
        >
          {item.q}
        </span>

        <ChevronDown
          className="flex-shrink-0 w-5 h-5 transition-all duration-300 mt-0.5"
          style={{
            color: isOpen ? accent : "#9CA3AF",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pl-16 text-sm text-gray-500 leading-relaxed">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openId, setOpenId] = useState<number | null>(1);
  const [search, setSearch] = useState("");

  const currentAccent =
    categories.find((c) => c.id === activeCategory)?.accent ?? "#2563EB";

  // When searching, show all categories that match
  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs.filter((f) => f.category === activeCategory);
    return faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [search, activeCategory]);

  const isSearching = search.trim().length > 0;

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  // Category counts
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach((c) => {
      map[c.id] = faqs.filter((f) => f.category === c.id).length;
    });
    return map;
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-white border-b border-gray-100 overflow-hidden">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #2563EB 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 max-w-5xl py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6 border"
              style={{
                color: "#2563EB",
                borderColor: "#BFDBFE",
                background: "#EFF6FF",
              }}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Help Center
            </span>

            <h1
              className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4"
              style={{ letterSpacing: "-0.03em", fontFamily: "'Sora', 'Nunito', sans-serif" }}
            >
              Frequently Asked{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #2563EB, #0EA5E9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Questions
              </span>
            </h1>

            <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10">
              Everything you need to know about Pharma Wallah — from getting started to advanced features.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-5 py-3.5 rounded-full border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 shadow-sm transition-all"
                style={{ focusRingColor: "#2563EB" } as React.CSSProperties}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────── */}
      <section className="container mx-auto px-6 max-w-5xl py-14">
        {isSearching ? (
          /* Search Results */
          <div>
            <p className="text-sm text-gray-500 mb-6">
              {filteredFaqs.length === 0
                ? "No results found."
                : `${filteredFaqs.length} result${filteredFaqs.length > 1 ? "s" : ""} for "${search}"`}
            </p>
            <div className="space-y-3">
              {filteredFaqs.map((item) => {
                const cat = categories.find((c) => c.id === item.category);
                return (
                  <AccordionItem
                    key={item.id}
                    item={item}
                    accent={cat?.accent ?? "#2563EB"}
                    isOpen={openId === item.id}
                    onToggle={() => toggle(item.id)}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* Categorized View */
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Sidebar */}
            <aside className="lg:w-60 flex-shrink-0">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4 pl-1">
                Categories
              </p>
              <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setOpenId(null);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap"
                      style={{
                        background: isActive ? cat.accent + "12" : "transparent",
                        color: isActive ? cat.accent : "#6B7280",
                        border: `1px solid ${isActive ? cat.accent + "30" : "transparent"}`,
                      }}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{cat.label}</span>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: isActive ? cat.accent + "20" : "#F3F4F6",
                          color: isActive ? cat.accent : "#9CA3AF",
                        }}
                      >
                        {counts[cat.id]}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Contact CTA */}
              <div
                className="mt-8 p-4 rounded-2xl border hidden lg:block"
                style={{ borderColor: "#E5E7EB", background: "#FAFAFA" }}
              >
                <MessageSquare className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-sm font-semibold text-gray-800 mb-1">
                  Still have questions?
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Our team is ready to help you.
                </p>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Contact us <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </aside>

            {/* FAQ List */}
            <div className="flex-1 min-w-0">
              {/* Category heading */}
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {(() => {
                  const cat = categories.find((c) => c.id === activeCategory)!;
                  const Icon = cat.icon;
                  return (
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: cat.accent + "15" }}
                      >
                        <Icon className="w-4 h-4" style={{ color: cat.accent }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {cat.label}
                        </h2>
                        <p className="text-xs text-gray-400">
                          {counts[cat.id]} questions
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="space-y-3">
                  <AnimatePresence mode="wait">
                    {filteredFaqs.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.04 }}
                      >
                        <AccordionItem
                          item={item}
                          accent={currentAccent}
                          isOpen={openId === item.id}
                          onToggle={() => toggle(item.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white">
        <div className="container mx-auto px-6 max-w-5xl py-14 text-center">
          <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-3">
            Still need help?
          </p>
          <h3
            className="text-3xl font-extrabold text-gray-900 mb-3"
            style={{ letterSpacing: "-0.02em" }}
          >
            We're here for you
          </h3>
          <p className="text-gray-500 text-base max-w-md mx-auto mb-8">
            Can't find what you're looking for? Reach out to our team and we'll get back to you quickly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ background: "linear-gradient(90deg, #2563EB, #0EA5E9)" }}
            >
              <MessageSquare className="w-4 h-4" />
              Contact Support
            </Link>
            <Link
              href="https://pharma-wallah.vercel.app/"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-bold border border-gray-200 text-gray-700 hover:border-gray-400 hover:shadow-md transition-all duration-300"
            >
              Visit Platform
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FAQPage;