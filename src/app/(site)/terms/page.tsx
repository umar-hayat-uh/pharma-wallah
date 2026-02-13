"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Scale,
  BookOpen,
  Database,
  Bot,
  AlertTriangle,
  Lock,
  ShieldCheck,
  Globe,
  Mail,
  ChevronRight,
  ArrowUp,
} from "lucide-react";

// ─── Section Data ─────────────────────────────────────────────────────────────

const sections = [
  { id: "acceptance", label: "Acceptance of Agreement", icon: Scale, accent: "#2563EB" },
  { id: "nature", label: "Nature of Service", icon: BookOpen, accent: "#7C3AED" },
  { id: "pharmacopedia", label: "Pharmacopedia", icon: Database, accent: "#059669" },
  { id: "ai-guide", label: "AI Guide Tool", icon: Bot, accent: "#0EA5E9" },
  { id: "tool-warnings", label: "Tool Warnings", icon: AlertTriangle, accent: "#D97706" },
  { id: "privacy", label: "Privacy & Data", icon: Lock, accent: "#DC2626" },
  { id: "ip-conduct", label: "IP & Conduct", icon: ShieldCheck, accent: "#7C3AED" },
  { id: "governing-law", label: "Governing Law", icon: Globe, accent: "#059669" },
  { id: "contact", label: "Contact", icon: Mail, accent: "#2563EB" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

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

const TermsPage = () => {
  const [activeSection, setActiveSection] = useState("acceptance");
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
              <Scale className="w-3.5 h-3.5" />
              Legal
            </span>

            <h1
              className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4"
              style={{ letterSpacing: "-0.03em", fontFamily: "'Sora', 'Nunito', sans-serif" }}
            >
              Terms &{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #2563EB, #0EA5E9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Conditions
              </span>
            </h1>

            <p className="text-gray-500 text-base max-w-2xl mb-6">
              By using Pharmawallah, you agree to the terms outlined below. Please read carefully — this document governs your use of all platform features including the AI Guide, Pharmacopedia, MCQ Bank, and Calculation Tools.
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

              {/* 1. Acceptance */}
              <SectionHeading id="acceptance" number={1} title="Acceptance of Agreement" icon={Scale} accent="#2563EB" />
              <Para>
                By accessing and utilizing Pharmawallah, you agree to be bound by this integrated agreement. This document governs your use of our structured study notes, MCQ banks, pharmaceutical calculators, Pharmacopedia drug encyclopedia, and AI-powered expert guide tool.
              </Para>
              <Para>
                Your continued use of the platform constitutes your formal consent to these practices. If you do not agree with any part of these terms, you must discontinue use immediately.
              </Para>

              <Divider />

              {/* 2. Nature of Service */}
              <SectionHeading id="nature" number={2} title="Nature of Service & Educational Disclaimer" icon={BookOpen} accent="#7C3AED" />
              <InfoBox accent="#7C3AED">
                Pharmawallah is a <strong>free, open-access educational resource</strong> intended for pharmacy and pharmaceutical science students. All materials are for academic practice and theoretical understanding only.
              </InfoBox>

              <SubHeading>Academic Simulation</SubHeading>
              <Para>
                All materials — including Pharmacokinetics, Microbiology, Engineering tools, Pharmacopedia entries, and AI-generated responses — are intended for student practice and theoretical understanding only.
              </Para>

              <SubHeading>No Clinical Reliance</SubHeading>
              <BulletList items={[
                "Calculators: Outputs (e.g., Loading Dose, Creatinine Clearance, Sterilization Time) must never be used for clinical decision-making, diagnostic purposes, or real-world patient care.",
                "Pharmacopedia: Drug information is compiled for educational reference only and should not replace professional medical judgment, product inserts, or official pharmacopoeias.",
                "AI Guide Tool: Responses are based on trained educational data and do not constitute professional medical advice, clinical recommendations, or substitute for qualified healthcare consultation.",
              ]} />

              <WarningBox>
                While we strive for academic integrity, digital algorithms and AI models may contain errors or omissions. Users are strictly required to verify all results against primary sources such as the USP, BP, FDA-approved labeling, and current clinical guidelines.
              </WarningBox>

              <Divider />

              {/* 3. Pharmacopedia */}
              <SectionHeading id="pharmacopedia" number={3} title="Pharmacopedia – Drug Encyclopedia" icon={Database} accent="#059669" />
              <Para>
                Pharmawallah's Pharmacopedia is a comprehensive drug information resource designed exclusively for educational purposes.
              </Para>

              <SubHeading>Content Coverage</SubHeading>
              <BulletList items={[
                "Drug Properties: Chemical structure, molecular formula, physicochemical properties",
                "Pharmacodynamics: Mechanism of action, receptor interactions, dose-response relationships",
                "Pharmacokinetics: Absorption, distribution, metabolism, excretion (ADME) parameters",
                "Drug Interactions: Potential drug-drug, drug-food, and drug-disease interactions",
                "Clinical Correlations: Therapeutic uses, contraindications, adverse effects (for educational context)",
              ]} />

              <SubHeading>Educational Purpose Only</SubHeading>
              <Para>
                Pharmacopedia content is synthesized from academic sources and standard textbooks for student learning. It does not replace official prescribing information, manufacturer package inserts, current clinical practice guidelines, or professional medical judgment.
              </Para>

              <InfoBox accent="#059669">
                <strong>Verification Required:</strong> Users must independently verify all drug information using authoritative sources before any application in academic, research, or professional settings.
              </InfoBox>

              <Divider />

              {/* 4. AI Guide Tool */}
              <SectionHeading id="ai-guide" number={4} title="AI Guide Tool – Educational Assistant" icon={Bot} accent="#0EA5E9" />
              <Para>
                Pharmawallah offers an AI-powered expert guide tool to support student learning through interactive questioning and conceptual clarification.
              </Para>

              <SubHeading>Functionality</SubHeading>
              <BulletList items={[
                "Answers academic questions related to pharmacy and pharmaceutical sciences",
                "Provides guided explanations of complex concepts",
                "Suggests study approaches and clarifies doubts",
                "Generates practice questions for self-assessment",
              ]} />

              <SubHeading>Important Limitations</SubHeading>
              <BulletList items={[
                "No Medical Advice: The AI tool does not provide medical recommendations, diagnoses, treatment plans, or patient-specific guidance.",
                "Educational Context Only: Responses are generated based on training data and may not reflect the most current research, guidelines, or drug approvals.",
                "Potential Inaccuracies: AI models may occasionally produce incorrect, incomplete, or outdated information. Users must critically evaluate all responses.",
                "No Emergency Support: The AI tool is not equipped to handle emergencies. For immediate medical assistance, contact qualified healthcare professionals or emergency services.",
              ]} />

              <WarningBox>
                <strong>User Responsibility:</strong> You acknowledge that you use the AI tool at your own risk, will verify all information through primary academic sources, and will not rely on AI responses for clinical decisions, patient care, or professional practice.
              </WarningBox>

              <Divider />

              {/* 5. Tool Warnings */}
              <SectionHeading id="tool-warnings" number={5} title="Specialized Tool Warnings" icon={AlertTriangle} accent="#D97706" />
              <div className="space-y-3">
                {[
                  {
                    tool: "Dosing / PK Calculators",
                    warning:
                      "Calculations do not account for individual patient variables such as organ function, metabolic differences, or concomitant medications.",
                  },
                  {
                    tool: "Pharmacology Tools",
                    warning:
                      "LD50 or ED50 values are theoretical models and are not intended for safety assessments or human dosing.",
                  },
                  {
                    tool: "Microbiology Tools",
                    warning:
                      "F0 values are for laboratory practice only — not for clinical or industrial sterilization validation.",
                  },
                  {
                    tool: "Pharmacopedia Entries",
                    warning:
                      "Drug interaction information is educational and may not include all possible interactions or clinical nuances.",
                  },
                  {
                    tool: "AI Responses",
                    warning:
                      "The AI tool does not have access to real-time medical databases and cannot provide patient-specific recommendations.",
                  },
                ].map(({ tool, warning }) => (
                  <div
                    key={tool}
                    className="flex gap-3 p-4 rounded-xl border"
                    style={{ borderColor: "#FDE68A", background: "#FFFBEB" }}
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-800">{tool}</p>
                      <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{warning}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Divider />

              {/* 6. Privacy */}
              <SectionHeading id="privacy" number={6} title="Privacy & Data Handling" icon={Lock} accent="#DC2626" />
              <InfoBox accent="#DC2626">
                We prioritize your privacy by operating on a <strong>non-registration basis</strong>. Most resources are freely accessible without providing any personal information.
              </InfoBox>

              <SubHeading>Information We Collect</SubHeading>
              <BulletList items={[
                "Voluntary Correspondence: When you use the Contact Us feature, we collect your name and email address solely to address your inquiries.",
                "AI Interactions: Questions submitted to the AI guide tool may be processed to generate responses. These interactions are anonymized and used to improve accuracy and educational value.",
                "Automated Data: We utilize Google Analytics to monitor website traffic and performance (IP addresses, browser types, device identifiers, interaction patterns).",
                "Cookies: We use Google AdSense and functional cookies to provide relevant advertisements and ensure calculator and AI tool functionality.",
              ]} />

              <SubHeading>Data Retention</SubHeading>
              <BulletList items={[
                "Personal correspondence is permanently deleted every six (6) months.",
                "AI interaction logs are anonymized and retained for quality improvement purposes only.",
                "Usage data is managed according to third-party provider retention policies.",
              ]} />

              <Para>
                Pharmacopedia browsing and calculator usage do not require or collect personal identification.
              </Para>

              <Divider />

              {/* 7. IP & Conduct */}
              <SectionHeading id="ip-conduct" number={7} title="Intellectual Property & Conduct" icon={ShieldCheck} accent="#7C3AED" />

              <SubHeading>Ownership</SubHeading>
              <Para>
                All curated content — including study notes, MCQ banks, calculator logic, Pharmacopedia entries, and AI training materials — remains the intellectual property of Pharmawallah.
              </Para>

              <SubHeading>Prohibited Use</SubHeading>
              <BulletList items={[
                "Scraping data, mining MCQ banks, or attempting to bypass site security",
                "Automated extraction of Pharmacopedia content",
                "Reverse engineering calculator algorithms or AI response mechanisms",
                "Commercial redistribution of any platform content without prior written consent",
              ]} />

              <SubHeading>Permitted Use</SubHeading>
              <InfoBox accent="#7C3AED">
                Personal, non-commercial educational use only. Students and educators may reference platform content for learning purposes with appropriate attribution.
              </InfoBox>

              <Divider />

              {/* 8. Governing Law */}
              <SectionHeading id="governing-law" number={8} title="Governing Law & Jurisdiction" icon={Globe} accent="#059669" />
              <Para>
                These Terms and Conditions are governed by and construed in accordance with the laws of <strong>Pakistan</strong>. Any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts in Pakistan.
              </Para>

              <Divider />

              {/* 9. Contact */}
              <SectionHeading id="contact" number={9} title="Contact Information" icon={Mail} accent="#2563EB" />
              <Para>
                For questions or formal inquiries regarding these Terms and Conditions, Privacy practices, Pharmacopedia content, or the AI Guide Tool, please contact us at:
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

              {/* Cookie Banner Notice */}
              <div className="mt-8 p-5 rounded-xl border border-gray-200 bg-gray-50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Cookie Consent Policy
                </p>
                <p className="text-sm text-gray-600 leading-relaxed italic">
                  "We use cookies to improve your experience, analyze site traffic, personalize content, and serve relevant ads. Cookies also enable our AI Guide Tool and Pharmacopedia functionality. By using Pharmawallah, you consent to our use of cookies as detailed in our Privacy Policy and Terms."
                </p>
              </div>

              {/* Footer note */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Document Version: 2.0 · Governed by the laws of Pakistan
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

export default TermsPage;