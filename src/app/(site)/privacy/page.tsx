"use client";

import { useState, useEffect, useRef } from "react";
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

function SectionHeading({ id, number, title, icon: Icon, accent }: any) {
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
        <h2 className="text-2xl font-extrabold text-gray-900 mt-0.5">{title}</h2>
      </div>
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-xl p-4 my-5">
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
  return <h3 className="text-base font-bold text-gray-800 mt-6 mb-2">{children}</h3>;
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
  return <div className="border-t border-white/20 my-10" />;
}

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState("introduction");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      const sectionEls = sections.map((s) => ({ id: s.id, el: document.getElementById(s.id) }));
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
              Privacy Policy
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Pharmawallah is committed to protecting your privacy. This policy explains how we handle the limited data processed through our educational platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Document Version: 2.0
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                Governing Law: Pakistan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="flex gap-10 relative">
          {/* Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-500 mb-4 pl-1">
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
              <div className="mt-8 p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm">
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

          {/* Main Content */}
          <div ref={contentRef} className="flex-1 min-w-0">
            <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 md:p-10">
              <SectionHeading id="introduction" number={1} title="Introduction" icon={FileText} accent="#2563EB" />
              <Para>
                Pharmawallah is an open‑access educational platform designed for pharmacy students. We provide structured study materials, specialized pharmaceutical calculators, a comprehensive Pharmacopedia drug encyclopedia, and an AI‑powered expert guide tool. This Privacy Policy outlines our commitment to user privacy and describes how we handle the limited data processed through our website.
              </Para>

              <Divider />

              <SectionHeading id="info-collection" number={2} title="Information Collection and Usage" icon={Database} accent="#7C3AED" />
              <Para>
                Pharmawallah operates as a free resource and does not require user registration, sign‑ups, or the creation of personal profiles. Data collection is limited to the following categories:
              </Para>
              <SubHeading>Voluntary Correspondence</SubHeading>
              <Para>
                When you use the "Contact Us" feature, we collect your name and email address. This information is used solely to address your specific inquiries, feedback, or technical support requests.
              </Para>
              <SubHeading>AI Guide Tool Interactions</SubHeading>
              <BulletList items={[
                "Questions submitted are processed to generate educational responses",
                "Interactions may be logged anonymously to improve the tool's accuracy and educational value",
                "We do not associate AI queries with personal identifiers unless voluntarily provided in the query itself (which we recommend against)",
              ]} />
              <SubHeading>Automated Usage Data</SubHeading>
              <Para>
                We utilize Google Analytics to monitor website traffic and performance. This includes technical information such as IP addresses, browser types, device identifiers, and patterns of interaction with our educational modules, calculators, Pharmacopedia, and AI tools.
              </Para>

              <Divider />

              <SectionHeading id="cookies" number={3} title="Cookies and Third‑Party Services" icon={Lock} accent="#059669" />
              <BulletList items={[
                "Functional Storage: Local storage is utilized to temporarily retain session data within our calculators, maintain Pharmacopedia browsing preferences, and support AI tool conversation continuity during a single session.",
                "Third‑Party Advertising: We display advertisements through partners such as Google AdSense. These vendors use cookies to serve relevant advertisements based on your visits to this and other websites.",
                "AI Service Providers: Our AI guide tool may utilize third‑party machine learning infrastructure. These providers process query data according to strict confidentiality and data protection standards.",
              ]} />

              <Divider />

              <SectionHeading id="data-retention" number={4} title="Data Retention Policy" icon={Clock} accent="#0EA5E9" />
              <BulletList items={[
                "Personal Information: Any personal information obtained through contact forms or direct email correspondence is permanently deleted from our active records every six (6) months.",
                "AI Interaction Logs: Anonymized question and response data may be retained for quality improvement, model training, and educational research purposes. These logs do not contain personally identifiable information.",
                "Usage Data: Data processed by third‑party analytics or advertising providers is managed according to their respective global retention policies.",
              ]} />

              <Divider />

              <SectionHeading id="disclaimer" number={5} title="Professional and Educational Disclaimer" icon={AlertTriangle} accent="#D97706" />
              <Para>
                All content, calculation tools, Pharmacopedia entries, and AI‑generated responses provided on Pharmawallah are intended strictly for educational and informational purposes.
              </Para>
              <WarningBox>
                The AI guide tool may occasionally generate incorrect or outdated information. Users are encouraged to critically evaluate all responses and consult authoritative sources.
              </WarningBox>

              <Divider />

              <SectionHeading id="user-consent" number={6} title="User Consent" icon={CheckCircle} accent="#DC2626" />
              <Para>
                By accessing and utilizing Pharmawallah, including its study materials, calculators, Pharmacopedia, and AI guide tool, you hereby acknowledge that you have read this Privacy Policy and consent to its terms. Your continued use of the website constitutes your formal agreement to the collection and use of information as described herein.
              </Para>

              <Divider />

              <SectionHeading id="jurisdiction" number={7} title="Jurisdiction and Updates" icon={Globe} accent="#7C3AED" />
              <Para>
                This policy is governed by the laws of Pakistan. Pharmawallah reserves the right to modify this policy at any time. We encourage users to review this page periodically to stay informed of our current data handling practices.
              </Para>

              <Divider />

              <SectionHeading id="contact" number={8} title="Contact Information" icon={Mail} accent="#2563EB" />
              <Para>
                For questions regarding this Privacy Policy, data handling practices, Pharmacopedia content, or the AI Guide Tool, please contact:
              </Para>
              <div className="flex items-center gap-4 p-5 rounded-xl border border-blue-200/50 bg-blue-50/50 mt-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#2563EB15" }}>
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

              <div className="mt-10 pt-6 border-t border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  Document Version: 2.0 · Last Updated: February 2025 · Governed by the laws of Pakistan
                </p>
                <Link
                  href="/"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  pharma-wallah.vercel.app →
                </Link>
              </div>
            </div>
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
    </section>
  );
}