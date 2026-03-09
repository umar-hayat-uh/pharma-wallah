"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf,
  Search, ChevronDown, HelpCircle, MessageSquare, ArrowRight, Zap, X,
} from "lucide-react";

const bgIcons = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const FAQS = [
  { id:1,  cat:"general", q:"What is Pharma Wallah?",              a:"Pharma Wallah is a free online educational platform for pharmacy and pharmaceutical science students, offering study materials, MCQ banks, a drug encyclopedia (Pharmacopedia), AI-guided learning, and calculation tools." },
  { id:2,  cat:"general", q:"Who is this platform for?",           a:"Undergraduate (B.Pharm, D.Pharm) and postgraduate pharmacy students, GPAT aspirants, and pharmacy professionals looking to reinforce their knowledge." },
  { id:3,  cat:"general", q:"Is Pharma Wallah completely free?",    a:"Yes. All core resources — study materials, MCQ Bank, Pharmacopedia, and calculation tools — are completely free with no hidden fees or subscriptions." },
  { id:4,  cat:"general", q:"Do I need to create an account?",      a:"Currently no account is required to access most resources. Future updates may introduce optional accounts for personalised progress tracking and saved notes." },
  { id:5,  cat:"content", q:"What subjects are covered?",           a:"Pharmaceutics, Pharmaceutical Chemistry, Pharmacology, Pharmacognosy, Pharmaceutical Analysis, Biopharmaceutics, Clinical Pharmacy, Hospital Pharmacy, and Pharmaceutical Microbiology." },
  { id:6,  cat:"content", q:"Who creates the content?",             a:"Content is developed by experienced pharmacy educators, professors, and industry experts. Their profiles are available on the About page." },
  { id:7,  cat:"content", q:"What is included in Study Materials?", a:"Structured lecture notes, topic-wise summaries, diagrams, and key concept explanations aligned with standard pharmacy curricula." },
  { id:8,  cat:"content", q:"How can the MCQ Bank help me?",        a:"The MCQ Bank contains thousands of questions for self-assessment, semester prep, and competitive exam practice (e.g., GPAT), each with detailed explanations." },
  { id:9,  cat:"content", q:"What is Pharmacopedia?",               a:"An integrated drug encyclopedia covering uses, mechanisms, side effects, interactions, and drug classifications — a quick reference for students and professionals." },
  { id:10, cat:"content", q:"What Calculation Tools are available?",a:"Interactive tools for dosage calculations, dilution/concentration problems, isotonic solutions, and pharmacokinetic parameters with step-by-step guidance." },
  { id:11, cat:"usage",   q:"How do I access study materials?",     a:"Navigate to the Material section from the main menu. Content is organised by subject and topic. No login required." },
  { id:12, cat:"usage",   q:"Can I download content offline?",      a:"Yes. Most study materials are available as downloadable PDFs for offline access." },
  { id:13, cat:"usage",   q:"Is there a mobile app?",               a:"The website is fully responsive and works great on all mobile browsers. Check the homepage for any app download links." },
  { id:14, cat:"support", q:"I found an error. How do I report it?",a:"Use the Contact page to report issues. Your feedback is invaluable for maintaining accuracy and quality." },
  { id:15, cat:"support", q:"How often is new content added?",      a:"We continuously expand our resources. Follow our social media or check regularly for announcements about new subjects and features." },
  { id:16, cat:"support", q:"Can I contribute content?",            a:"We welcome inquiries from qualified professionals. Contact us through the official channels listed on the Contact page." },
  { id:17, cat:"support", q:"My question isn't listed here.",       a:"Visit the Contact section for email and contact form details. Our team is happy to help with anything not covered here." },
];

const CATS = [
  { id: "general", label: "General",            count: 4,  accent: "from-blue-600 to-green-400",   hex: "#2563eb" },
  { id: "content", label: "Content & Features", count: 6,  accent: "from-purple-600 to-blue-500",  hex: "#7c3aed" },
  { id: "usage",   label: "Usage & Access",     count: 3,  accent: "from-emerald-600 to-cyan-400", hex: "#059669" },
  { id: "support", label: "Support",            count: 4,  accent: "from-amber-500 to-orange-400", hex: "#d97706" },
];

function Accordion({ item, isOpen, onToggle, catAccent }: {
  item: typeof FAQS[0]; isOpen: boolean; onToggle: () => void; catAccent: string;
}) {
  return (
    <div className={`relative rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${isOpen ? "border-blue-200 shadow-md shadow-blue-50/80" : "border-gray-200 hover:border-gray-300 hover:shadow-sm"}`}>
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${catAccent} transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`} />
      <button onClick={onToggle} className="w-full flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 text-left group">
        <span className={`shrink-0 mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold transition-all duration-200 ${isOpen ? "text-white bg-blue-600" : "bg-gray-100 text-gray-500"}`}>
          {item.id}
        </span>
        <span className={`flex-1 text-sm font-extrabold leading-snug transition-colors duration-200 ${isOpen ? "text-blue-700" : "text-gray-900"}`}>
          {item.q}
        </span>
        <ChevronDown className={`shrink-0 w-4 h-4 transition-all duration-300 mt-0.5 ${isOpen ? "text-blue-500 rotate-180" : "text-gray-400"}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden">
            <div className="px-4 sm:px-5 pb-5 pl-10 sm:pl-[3.75rem] text-sm text-gray-600 leading-relaxed">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [activeCat, setActiveCat] = useState("general");
  const [openId, setOpenId]       = useState<number | null>(1);
  const [search, setSearch]       = useState("");

  const cat       = CATS.find(c => c.id === activeCat)!;
  const searching = search.trim().length > 0;

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) return FAQS.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
    return FAQS.filter(f => f.cat === activeCat);
  }, [search, activeCat]);

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-20   w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-20 bottom-4 opacity-15 pointer-events-none"><HelpCircle size={70} className="text-white" /></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> Help Centre
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Frequently Asked<br className="hidden sm:block" /> Questions
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl leading-relaxed mb-8">
            Everything you need to know about PharmaWallah — from getting started to advanced features.
          </p>

          {/* Search in hero */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Search questions…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border-2 border-white focus:border-blue-200 focus:outline-none text-sm text-gray-800 placeholder:text-gray-400 shadow-lg transition-all" />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          {!searching && (
            <aside className="lg:w-60 shrink-0">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-3 pl-1">Categories</p>

              {/* Mobile: horizontal scroll; desktop: stacked */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1">
                {CATS.map(c => {
                  const active = activeCat === c.id;
                  return (
                    <button key={c.id}
                      onClick={() => { setActiveCat(c.id); setOpenId(null); }}
                      className={`relative shrink-0 flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm font-extrabold transition-all duration-200 overflow-hidden whitespace-nowrap ${active ? "text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                      {active && <div className={`absolute inset-0 bg-gradient-to-r ${c.accent}`} />}
                      <span className="relative z-10">{c.label}</span>
                      <span className={`relative z-10 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-gray-200 text-gray-500"}`}>
                        {c.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop CTA */}
              <div className="hidden lg:block mt-8 relative rounded-2xl border border-gray-200 bg-white overflow-hidden p-5">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                <MessageSquare className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-sm font-extrabold text-gray-800 mb-0.5">Still have questions?</p>
                <p className="text-xs text-gray-400 mb-3">Our team is ready to help.</p>
                <Link href="/contact"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                  Contact us <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </aside>
          )}

          {/* FAQ list */}
          <div className="flex-1 min-w-0">
            {searching ? (
              <div>
                <p className="text-xs font-bold text-gray-400 mb-5">
                  {shown.length === 0
                    ? "No results found. Try a different term."
                    : `${shown.length} result${shown.length !== 1 ? "s" : ""} for "${search}"`}
                </p>
                <div className="space-y-3">
                  {shown.map(item => {
                    const c = CATS.find(c => c.id === item.cat)!;
                    return (
                      <Accordion key={item.id} item={item} catAccent={c.accent}
                        isOpen={openId === item.id} onToggle={() => setOpenId(openId === item.id ? null : item.id)} />
                    );
                  })}
                </div>
              </div>
            ) : (
              <motion.div key={activeCat}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}>
                {/* Cat header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${cat.accent} flex items-center justify-center`}>
                    <HelpCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{cat.label}</h2>
                    <p className="text-xs text-gray-400">{cat.count} questions</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {shown.map((item, i) => (
                    <motion.div key={item.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}>
                      <Accordion item={item} catAccent={cat.accent}
                        isOpen={openId === item.id} onToggle={() => setOpenId(openId === item.id ? null : item.id)} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 relative rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden p-8 text-center">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold text-white mb-2">Still need help?</h3>
            <p className="text-blue-100 text-sm max-w-md mx-auto mb-6">
              Can't find what you're looking for? Reach out and we'll get back to you quickly.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                <MessageSquare className="w-4 h-4" /> Contact Support
              </Link>
              <Link href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 border border-white/40 text-white font-extrabold text-sm hover:bg-white/30 transition-all duration-300">
                Visit Platform <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}