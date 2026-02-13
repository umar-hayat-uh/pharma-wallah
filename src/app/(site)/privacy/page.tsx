"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Database,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle,
  Globe,
  Mail,
  ChevronRight,
  ArrowUp,
} from "lucide-react";

// ─── Section Data ─────────────────────────────────────────────────────────────

const sections = [
  { id: "introduction", label: "Introduction", icon: FileText, accent: "#2563EB" },
  { id: "info-collection", label: "Information Collection", icon: Database, accent: "#7C3AED" },
  { id: "cookies", label: "Cookies & Third‑Party", icon: Lock, accent: "#059669" },
  { id: "data-retention", label: "Data Retention", icon: Clock, accent: "#0EA5E9" },
  { id: "disclaimer", label: "Professional Disclaimer", icon: AlertTriangle, accent: "#D97706" },
  { id: "user-consent", label: "User Consent", icon: CheckCircle, accent: "#DC2626" },
  { id: "jurisdiction", label: "Jurisdiction", icon: Globe, accent: "#7C3AED" },
  { id: "contact", label: "Contact", icon: Mail, accent: "#2563EB" },
];

// ─── Sub‑components (reused from Terms) ────────────────────────────────────────

function SectionHeading({
  id,
  number,
  title,
  icon: Icon,
  accent,
}: {
  id: string;
  number: number;
  title: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div id={id} className="flex items-start gap-4 mb-6 scroll-mt-28">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
        style={{ background: accent + "15" }}
      >
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: accent }}>
          Section {number}
        </span>
        <h2
          className="text-2xl font-extrabold text-gray-900 mt-0.5"
          style={{ letterSpacing: "-0.02em" }}
        >
          {title}
        </h2>
      </div>
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 my-5">
      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-amber-800 leading-relaxed">{children}</div>
    </div>
  );
}

function InfoBox({ children, accent = "#2563EB" }: { children: React.ReactNode; accent?: string }) {
  return (
    <div
      className="rounded-xl p-4 my-5 border text-sm leading-relaxed"
      style={{
        background: accent + "08",
        borderColor: accent + "25",
        color: "#1e293b",
      }}
    >
      {children}
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-bold text-gray-800 mt-6 mb-2">{children}</h3>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-600 text-sm leading-relaxed mb-3">{children}</p>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 my-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <div className="border-t border-gray-100 my-10" />;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PrivacyPage = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sectionEls = sections.map((s) => ({
        id: s.id,
        el: document.getElementById(s.id),
      }));

      for (let i = sectionEls.length - 1; i >= 0; i--) {
        const { id, el } = sectionEls[i];
        if (el && el.getBoundingClientRect().top <= 140) {
          setActiveSection(id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative bg-white border-b border-gray-100 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #1e293b 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 max-w-5xl py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-5 border"
              style={{ color: "#2563EB", borderColor: "#BFDBFE", background: "#EFF6FF" }}
            >
              <FileText className="w-3.5 h-3.5" />
              Privacy
            </span>

            <h1
              className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4"
              style={{ letterSpacing: "-0.03em", fontFamily: "'Sora', 'Nunito', sans-serif" }}
            >
              Privacy{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #2563EB, #0EA5E9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Policy
              </span>
            </h1>

            <p className="text-gray-500 text-base max-w-2xl mb-6">
              Pharmawallah is committed to protecting your privacy. This policy explains how we handle the limited data processed through our educational platform, including the AI Guide, Pharmacopedia, and calculators.
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Document Version: 2.0
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                Governing Law: Pakistan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Contact: support@pharmawallah.com
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="container mx-auto px-6 max-w-5xl py-12">
        <div className="flex gap-10 relative">

          {/* ── Sticky Sidebar TOC ── */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4 pl-1">
                Contents
              </p>
              <nav className="space-y-1">
                {sections.map((s) => {
                  const Icon = s.icon;
                  const isActive = activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-200"
                      style={{
                        background: isActive ? s.accent + "12" : "transparent",
                        color: isActive ? s.accent : "#6B7280",
                        fontWeight: isActive ? 700 : 500,
                        borderLeft: `2px solid ${isActive ? s.accent : "transparent"}`,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="leading-tight">{s.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick contact */}
              <div
                className="mt-8 p-4 rounded-xl border"
                style={{ borderColor: "#E5E7EB", background: "#FAFAFA" }}
              >
                <p className="text-xs font-semibold text-gray-700 mb-1">Questions?</p>
                <a
                  href="mailto:support@pharmawallah.com"
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium break-all"
                >
                  support@pharmawallah.com
                </a>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div ref={contentRef} className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm px-8 py-10 space-y-0"
            >

              {/* 1. Introduction */}
              <SectionHeading id="introduction" number={1} title="Introduction" icon={FileText} accent="#2563EB" />
              <Para>
                Pharmawallah is an open‑access educational platform designed for pharmacy students. We provide structured study materials, specialized pharmaceutical calculators, a comprehensive Pharmacopedia drug encyclopedia, and an AI‑powered expert guide tool. This Privacy Policy outlines our commitment to user privacy and describes how we handle the limited data processed through our website.
              </Para>

              <Divider />

              {/* 2. Information Collection and Usage */}
              <SectionHeading id="info-collection" number={2} title="Information Collection and Usage" icon={Database} accent="#7C3AED" />
              <Para>
                Pharmawallah operates as a free resource and does not require user registration, sign‑ups, or the creation of personal profiles. Data collection is limited to the following categories:
              </Para>

              <SubHeading>Voluntary Correspondence</SubHeading>
              <Para>
                When you use the "Contact Us" feature, we collect your name and email address. This information is used solely to address your specific inquiries, feedback, or technical support requests.
              </Para>

              <SubHeading>AI Guide Tool Interactions</SubHeading>
              <Para>
                When you use our AI‑powered expert guide tool:
              </Para>
              <BulletList items={[
                "Questions submitted are processed to generate educational responses",
                "Interactions may be logged anonymously to improve the tool's accuracy and educational value",
                "We do not associate AI queries with personal identifiers unless voluntarily provided in the query itself (which we recommend against)",
                "Users should not include personal health information, patient data, or sensitive details in AI queries",
              ]} />

              <SubHeading>Pharmacopedia Usage</SubHeading>
              <Para>
                Browsing drug monographs and encyclopedia content does not require or collect personal information.
              </Para>

              <SubHeading>Automated Usage Data</SubHeading>
              <Para>
                We utilize Google Analytics to monitor website traffic and performance. This includes technical information such as IP addresses, browser types, device identifiers, and patterns of interaction with our educational modules, calculators, Pharmacopedia, and AI tools.
              </Para>

              <Divider />

              {/* 3. Cookies and Third‑Party Services */}
              <SectionHeading id="cookies" number={3} title="Cookies and Third‑Party Services" icon={Lock} accent="#059669" />
              <Para>
                We utilize cookies and local browser storage to ensure the technical integrity of our platform:
              </Para>
              <BulletList items={[
                "Functional Storage: Local storage is utilized to temporarily retain session data within our calculators (Pharmacokinetics, Bioavailability, Pharmaceutical Engineering), maintain Pharmacopedia browsing preferences, and support AI tool conversation continuity during a single session.",
                "Third‑Party Advertising: We display advertisements through partners such as Google AdSense. These vendors use cookies to serve relevant advertisements based on your visits to this and other websites across the internet.",
                "AI Service Providers: Our AI guide tool may utilize third‑party machine learning infrastructure. These providers process query data according to strict confidentiality and data protection standards and do not retain personal information.",
              ]} />

              <Divider />

              {/* 4. Data Retention Policy */}
              <SectionHeading id="data-retention" number={4} title="Data Retention Policy" icon={Clock} accent="#0EA5E9" />
              <Para>
                Pharmawallah follows a strict data minimization protocol:
              </Para>
              <BulletList items={[
                "Personal Information: Any personal information obtained through contact forms or direct email correspondence is permanently deleted from our active records every six (6) months.",
                "AI Interaction Logs: Anonymized question and response data may be retained for quality improvement, model training, and educational research purposes. These logs do not contain personally identifiable information.",
                "Usage Data: Data processed by third‑party analytics or advertising providers is managed according to their respective global retention policies.",
              ]} />

              <Divider />

              {/* 5. Professional and Educational Disclaimer */}
              <SectionHeading id="disclaimer" number={5} title="Professional and Educational Disclaimer" icon={AlertTriangle} accent="#D97706" />
              <Para>
                All content, calculation tools, Pharmacopedia entries, and AI‑generated responses provided on Pharmawallah are intended strictly for educational and informational purposes.
              </Para>

              <SubHeading>Non‑Clinical Use</SubHeading>
              <BulletList items={[
                "Calculator outputs (e.g., Loading Dose, Creatinine Clearance, Sterilization Time) are not for clinical decision‑making",
                "Pharmacopedia drug information is not a substitute for official prescribing information",
                "AI guide responses do not constitute professional medical advice",
              ]} />

              <SubHeading>Academic Verification</SubHeading>
              <Para>
                While we strive for high academic standards, Pharmawallah does not guarantee the absolute accuracy, completeness, or suitability of any data provided. Users must verify all results and information against:
              </Para>
              <BulletList items={[
                "Official pharmacopoeias (USP, BP, EP)",
                "FDA‑approved drug labels and product inserts",
                "Current clinical practice guidelines",
                "Peer‑reviewed primary literature",
              ]} />

              <WarningBox>
                The AI guide tool may occasionally generate incorrect or outdated information. Users are encouraged to critically evaluate all responses and consult authoritative sources.
              </WarningBox>

              <Divider />

              {/* 6. User Consent */}
              <SectionHeading id="user-consent" number={6} title="User Consent" icon={CheckCircle} accent="#DC2626" />
              <Para>
                By accessing and utilizing Pharmawallah, including its study materials, calculators, Pharmacopedia, and AI guide tool, you hereby acknowledge that you have read this Privacy Policy and consent to its terms. Your continued use of the website constitutes your formal agreement to the collection and use of information as described herein.
              </Para>
              <Para>
                <strong>Specific Consent for AI Interactions:</strong> By using the AI guide tool, you consent to:
              </Para>
              <BulletList items={[
                "The processing of your queries to generate responses",
                "Anonymous logging of interactions for quality improvement",
                "The educational limitations and disclaimers associated with AI‑generated content",
              ]} />
              <Para>
                If you do not agree to these terms, you must discontinue the use of this platform immediately.
              </Para>

              <Divider />

              {/* 7. Jurisdiction and Updates */}
              <SectionHeading id="jurisdiction" number={7} title="Jurisdiction and Updates" icon={Globe} accent="#7C3AED" />
              <Para>
                This policy is governed by the laws of Pakistan. Pharmawallah reserves the right to modify this policy at any time. We encourage users to review this page periodically to stay informed of our current data handling practices.
              </Para>

              <Divider />

              {/* 8. Contact Information */}
              <SectionHeading id="contact" number={8} title="Contact Information" icon={Mail} accent="#2563EB" />
              <Para>
                For questions regarding this Privacy Policy, data handling practices, Pharmacopedia content, or the AI Guide Tool, please contact:
              </Para>

              <div
                className="flex items-center gap-4 p-5 rounded-xl border mt-4"
                style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#2563EB15" }}
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-0.5">
                    Email Support
                  </p>
                  <a
                    href="mailto:support@pharmawallah.com"
                    className="text-base font-bold text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    support@pharmawallah.com
                  </a>
                </div>
              </div>

              {/* Version footer */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Document Version: 2.0 · Last Updated: February 2025 · Governed by the laws of Pakistan
                </p>
                <Link
                  href="https://pharma-wallah.vercel.app/"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  pharma-wallah.vercel.app →
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-11 h-11 rounded-full flex items-center justify-center shadow-lg z-50 transition-all hover:scale-110"
          style={{ background: "linear-gradient(135deg, #2563EB, #0EA5E9)" }}
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </motion.button>
      )}
    </main>
  );
};

export default PrivacyPage;