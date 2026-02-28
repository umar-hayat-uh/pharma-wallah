"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Search, ChevronDown, HelpCircle, MessageSquare, ArrowRight } from "lucide-react";
// Background icons (same as other pages)
import {
  Pill as PillIcon,
  FlaskConical as FlaskIcon,
  Beaker,
  Microscope,
  Atom,
  Dna,
  HeartPulse,
  Leaf,
  Syringe,
  TestTube,
  Tablet,
  ClipboardList,
  Stethoscope,
  Bandage,
  Droplet,
  Eye,
  Bone,
  Brain,
  Heart,
  Activity,
  AlertCircle,
  Scissors,
  Thermometer,
  Wind,
  Droplets,
  FlaskRound,
  Scale,
  Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BgIconItem {
  Icon: LucideIcon;
  color: string;
}

const iconList: BgIconItem[] = [
  { Icon: PillIcon, color: "text-blue-800/10" },
  { Icon: FlaskIcon, color: "text-green-800/10" },
  { Icon: Beaker, color: "text-purple-800/10" },
  { Icon: Microscope, color: "text-amber-800/10" },
  { Icon: Atom, color: "text-blue-800/10" },
  { Icon: Dna, color: "text-green-800/10" },
  { Icon: HeartPulse, color: "text-purple-800/10" },
  { Icon: Leaf, color: "text-amber-800/10" },
  { Icon: Syringe, color: "text-blue-800/10" },
  { Icon: TestTube, color: "text-green-800/10" },
  { Icon: Tablet, color: "text-purple-800/10" },
  { Icon: ClipboardList, color: "text-amber-800/10" },
  { Icon: Stethoscope, color: "text-blue-800/10" },
  { Icon: Bandage, color: "text-green-800/10" },
  { Icon: Droplet, color: "text-purple-800/10" },
  { Icon: Eye, color: "text-amber-800/10" },
  { Icon: Bone, color: "text-blue-800/10" },
  { Icon: Brain, color: "text-green-800/10" },
  { Icon: Heart, color: "text-purple-800/10" },
  { Icon: Activity, color: "text-amber-800/10" },
  { Icon: AlertCircle, color: "text-blue-800/10" },
  { Icon: Scissors, color: "text-green-800/10" },
  { Icon: Thermometer, color: "text-purple-800/10" },
  { Icon: Wind, color: "text-amber-800/10" },
  { Icon: Droplets, color: "text-green-800/10" },
  { Icon: FlaskRound, color: "text-purple-800/10" },
  { Icon: Scale, color: "text-blue-800/10" },
  { Icon: Calculator, color: "text-green-800/10" },
];

const bgIcons: BgIconItem[] = [];
for (let i = 0; i < 40; i++) {
  const item = iconList[i % iconList.length];
  bgIcons.push({
    Icon: item.Icon,
    color:
      i % 4 === 0
        ? "text-blue-800/10"
        : i % 4 === 1
        ? "text-green-800/10"
        : i % 4 === 2
        ? "text-purple-800/10"
        : "text-amber-800/10",
  });
}

// Real FAQ data
const faqs = [
  // General
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

  // Content & Features
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

  // Usage & Access
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

  // Support & Feedback
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

const categories = [
  { id: "general", label: "General", accent: "#2563EB" },
  { id: "content", label: "Content & Features", accent: "#7C3AED" },
  { id: "usage", label: "Usage & Access", accent: "#059669" },
  { id: "support", label: "Support & Feedback", accent: "#D97706" },
];

function AccordionItem({ item, accent, isOpen, onToggle }: any) {
  return (
    <div
      className="rounded-xl border border-white/50 bg-white/40 backdrop-blur-md overflow-hidden transition-all duration-200 hover:shadow-lg"
      style={{ borderColor: isOpen ? accent + "40" : "rgba(255,255,255,0.5)" }}
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
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pl-16 text-sm text-gray-600 leading-relaxed">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openId, setOpenId] = useState<number | null>(1);
  const [search, setSearch] = useState("");

  const currentAccent = categories.find((c) => c.id === activeCategory)?.accent ?? "#2563EB";

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return faqs.filter((f) => f.category === activeCategory);
    return faqs.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
  }, [search, activeCategory]);

  const isSearching = search.trim().length > 0;

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    categories.forEach((c) => {
      map[c.id] = faqs.filter((f) => f.category === c.id).length;
    });
    return map;
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      {/* Floating background icons */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {bgIcons.map(({ Icon, color }, index) => {
          const left = `${(index * 13) % 90 + 5}%`;
          const top = `${(index * 19) % 90 + 5}%`;
          const size = 30 + (index * 7) % 90;
          const rotate = (index * 23) % 360;
          return (
            <Icon
              key={index}
              size={size}
              className={`absolute ${color}`}
              style={{ left, top, transform: `rotate(${rotate}deg)` }}
            />
          );
        })}
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Everything you need to know about Pharma Wallah — from getting started to advanced features.
            </p>
            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-10 py-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 md:p-10">
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
                <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4 pl-1">
                  Categories
                </p>
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setOpenId(null);
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200"
                        style={{
                          background: isActive ? cat.accent + "20" : "transparent",
                          color: isActive ? cat.accent : "#6B7280",
                          border: `1px solid ${isActive ? cat.accent + "40" : "transparent"}`,
                        }}
                      >
                        <span className="flex-1 text-left">{cat.label}</span>
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: isActive ? cat.accent + "30" : "#F3F4F6",
                            color: isActive ? cat.accent : "#9CA3AF",
                          }}
                        >
                          {counts[cat.id]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Contact CTA */}
                <div className="mt-8 p-4 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-sm hidden lg:block">
                  <MessageSquare className="w-5 h-5 text-blue-600 mb-2" />
                  <p className="text-sm font-semibold text-gray-800 mb-1">Still have questions?</p>
                  <p className="text-xs text-gray-500 mb-3">Our team is ready to help you.</p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Contact us <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </aside>

              {/* FAQ List */}
              <div className="flex-1 min-w-0">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: currentAccent + "15" }}
                    >
                      <HelpCircle className="w-4 h-4" style={{ color: currentAccent }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {categories.find((c) => c.id === activeCategory)?.label}
                      </h2>
                      <p className="text-xs text-gray-400">{counts[activeCategory]} questions</p>
                    </div>
                  </div>

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
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white/30 backdrop-blur-2xl rounded-3xl border border-white/40 p-12 text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Reach out to our team and we'll get back to you quickly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <MessageSquare className="w-5 h-5" />
              Contact Support
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/50 bg-white/30 backdrop-blur-sm text-gray-700 font-semibold hover:bg-white/50 transition-all"
            >
              Visit Platform
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}