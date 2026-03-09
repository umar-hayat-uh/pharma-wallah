"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf,
  FileText, Database, Lock, Clock, AlertTriangle, CheckCircle,
  Globe, Mail, ChevronRight, ArrowUp, Zap,
} from "lucide-react";

const bgIcons = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const SECTIONS = [
  { id: "introduction",   label: "Introduction",            Icon: FileText,     accent: "from-blue-600 to-green-400",   hex: "#2563eb" },
  { id: "info-collection",label: "Information Collection",  Icon: Database,     accent: "from-purple-600 to-blue-500",  hex: "#7c3aed" },
  { id: "cookies",        label: "Cookies & Third-Party",   Icon: Lock,         accent: "from-emerald-600 to-cyan-400", hex: "#059669" },
  { id: "data-retention", label: "Data Retention",          Icon: Clock,        accent: "from-sky-500 to-blue-500",     hex: "#0ea5e9" },
  { id: "disclaimer",     label: "Professional Disclaimer", Icon: AlertTriangle,accent: "from-amber-500 to-orange-400", hex: "#d97706" },
  { id: "user-consent",   label: "User Consent",            Icon: CheckCircle,  accent: "from-rose-500 to-red-500",     hex: "#dc2626" },
  { id: "jurisdiction",   label: "Jurisdiction",            Icon: Globe,        accent: "from-purple-600 to-blue-500",  hex: "#7c3aed" },
  { id: "contact",        label: "Contact",                 Icon: Mail,         accent: "from-blue-600 to-green-400",   hex: "#2563eb" },
];

/* ── Reusable typography helpers ── */
function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 text-sm leading-relaxed mb-3">{children}</p>;
}
function Sub({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-extrabold text-gray-800 mt-6 mb-2">{children}</h3>;
}
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-3">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
          <ChevronRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 my-5 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 to-orange-400" />
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div className="text-sm text-amber-800 leading-relaxed">{children}</div>
    </div>
  );
}
function SectionBlock({ id, num, label, Icon, accent, hex, children }: {
  id: string; num: number; label: string; Icon: React.ElementType; accent: string; hex: string; children: React.ReactNode;
}) {
  return (
    <div id={id} className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden mb-5 scroll-mt-28">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${accent}`} />
      <div className="p-6">
        {/* Heading row */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: hex + "18" }}>
            <Icon className="w-4 h-4" style={{ color: hex }} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: hex }}>
              Section {num}
            </p>
            <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{label}</h2>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  const [active, setActive]         = useState("introduction");
  const [showTop, setShowTop]        = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 400);
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.getBoundingClientRect().top <= 140) { setActive(SECTIONS[i].id); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

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
        <div className="absolute right-20 bottom-4 opacity-15 pointer-events-none"><Lock size={70} className="text-white" /></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> Legal Document
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl leading-relaxed mb-6">
            Pharmawallah is committed to protecting your privacy. This policy explains how we handle the limited data processed through our educational platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" /> Version 2.0
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-300 inline-block" /> Governing Law: Pakistan
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 inline-block" /> Last Updated: Feb 2025
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex gap-10">

          {/* Sticky sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-3 pl-1">Contents</p>
              <nav className="space-y-0.5">
                {SECTIONS.map(s => {
                  const isActive = active === s.id;
                  return (
                    <button key={s.id} onClick={() => scrollTo(s.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs transition-all duration-200 ${isActive ? "font-extrabold" : "font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
                      style={isActive ? { background: s.hex + "12", color: s.hex, borderLeft: `2px solid ${s.hex}` } : { borderLeft: "2px solid transparent" }}>
                      <s.Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Sidebar contact */}
              <div className="mt-6 relative rounded-2xl border border-gray-200 bg-white overflow-hidden p-4">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                <p className="text-xs font-extrabold text-gray-700 mb-0.5">Questions?</p>
                <a href="mailto:support@pharmawallah.com"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium break-all">
                  support@pharmawallah.com
                </a>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Mobile section nav — horizontal scroll */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 mb-6 -mx-1 px-1">
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className="shrink-0 text-[10px] font-extrabold px-3 py-1.5 rounded-full border whitespace-nowrap transition-all"
                  style={{ borderColor: s.hex + "40", color: s.hex, background: s.hex + "10" }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Sections */}
            <SectionBlock id="introduction" num={1} label="Introduction" Icon={FileText} accent="from-blue-600 to-green-400" hex="#2563eb">
              <Para>Pharmawallah is an open-access educational platform for pharmacy students offering structured study materials, pharmaceutical calculators, a Pharmacopedia drug encyclopedia, and an AI-powered expert guide. This Privacy Policy outlines our commitment to user privacy and describes how we handle the limited data processed through our website.</Para>
            </SectionBlock>

            <SectionBlock id="info-collection" num={2} label="Information Collection and Usage" Icon={Database} accent="from-purple-600 to-blue-500" hex="#7c3aed">
              <Para>Pharmawallah operates as a free resource and does not require user registration, sign-ups, or the creation of personal profiles. Data collection is limited to the following categories:</Para>
              <Sub>Voluntary Correspondence</Sub>
              <Para>When you use the "Contact Us" feature, we collect your name and email address solely to address your specific inquiries or technical support requests.</Para>
              <Sub>AI Guide Tool Interactions</Sub>
              <Bullets items={[
                "Questions submitted are processed to generate educational responses",
                "Interactions may be logged anonymously to improve the tool's accuracy",
                "We do not associate AI queries with personal identifiers",
              ]} />
              <Sub>Automated Usage Data</Sub>
              <Para>We utilize Google Analytics to monitor website traffic and performance, including technical information such as IP addresses, browser types, device identifiers, and interaction patterns.</Para>
            </SectionBlock>

            <SectionBlock id="cookies" num={3} label="Cookies & Third-Party Services" Icon={Lock} accent="from-emerald-600 to-cyan-400" hex="#059669">
              <Bullets items={[
                "Functional Storage: Local storage retains session data within our calculators, Pharmacopedia preferences, and AI tool conversation continuity during a single session.",
                "Third-Party Advertising: Advertisements are displayed through partners such as Google AdSense, which use cookies to serve relevant ads.",
                "AI Service Providers: Our AI guide may utilize third-party ML infrastructure processing query data under strict confidentiality standards.",
              ]} />
            </SectionBlock>

            <SectionBlock id="data-retention" num={4} label="Data Retention Policy" Icon={Clock} accent="from-sky-500 to-blue-500" hex="#0ea5e9">
              <Bullets items={[
                "Personal Information: Any personal information obtained through contact forms is permanently deleted every six (6) months.",
                "AI Interaction Logs: Anonymized question/response data may be retained for quality improvement and model training — no personally identifiable information is retained.",
                "Usage Data: Data processed by third-party analytics or advertising providers is managed according to their respective global retention policies.",
              ]} />
            </SectionBlock>

            <SectionBlock id="disclaimer" num={5} label="Professional and Educational Disclaimer" Icon={AlertTriangle} accent="from-amber-500 to-orange-400" hex="#d97706">
              <Para>All content, calculation tools, Pharmacopedia entries, and AI-generated responses are intended strictly for educational and informational purposes.</Para>
              <Warning>The AI guide tool may occasionally generate incorrect or outdated information. Users are encouraged to critically evaluate all responses and consult authoritative sources. This platform is not a substitute for professional medical advice.</Warning>
            </SectionBlock>

            <SectionBlock id="user-consent" num={6} label="User Consent" Icon={CheckCircle} accent="from-rose-500 to-red-500" hex="#dc2626">
              <Para>By accessing and utilizing Pharmawallah — including its study materials, calculators, Pharmacopedia, and AI guide tool — you acknowledge that you have read this Privacy Policy and consent to its terms. Your continued use constitutes formal agreement to the collection and use of information as described herein.</Para>
            </SectionBlock>

            <SectionBlock id="jurisdiction" num={7} label="Jurisdiction and Updates" Icon={Globe} accent="from-purple-600 to-blue-500" hex="#7c3aed">
              <Para>This policy is governed by the laws of Pakistan. Pharmawallah reserves the right to modify this policy at any time. We encourage users to review this page periodically to stay informed of our current data handling practices.</Para>
            </SectionBlock>

            <SectionBlock id="contact" num={8} label="Contact Information" Icon={Mail} accent="from-blue-600 to-green-400" hex="#2563eb">
              <Para>For questions regarding this Privacy Policy, data handling practices, Pharmacopedia content, or the AI Guide Tool, please contact:</Para>
              <div className="relative flex items-center gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 mt-4 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 mb-0.5">Email Support</p>
                  <a href="mailto:support@pharmawallah.com"
                    className="text-base font-extrabold text-blue-700 hover:text-blue-800 transition">
                    support@pharmawallah.com
                  </a>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-400">Version 2.0 · Last Updated: February 2025 · Governed by the laws of Pakistan</p>
                <Link href="/" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                  pharma-wallah.vercel.app →
                </Link>
              </div>
            </SectionBlock>

          </div>
        </div>
      </div>

      {/* Scroll-to-top */}
      {showTop && (
        <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg z-50 hover:scale-110 transition-transform bg-gradient-to-r from-blue-600 to-green-400">
          <ArrowUp className="w-5 h-5 text-white" />
        </motion.button>
      )}
    </section>
  );
}