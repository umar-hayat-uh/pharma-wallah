"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf,
  FileText, Database, Lock, Clock, AlertTriangle, CheckCircle,
  Globe, Mail, ChevronRight, ArrowUp, ExternalLink, Scale, Shield, Zap,
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
  { id: "introduction",        label: "Introduction",         Icon: FileText,     accent: "from-blue-600 to-green-400",    hex: "#2563eb" },
  { id: "use-of-website",      label: "Use of Website",       Icon: Globe,        accent: "from-emerald-600 to-cyan-400",  hex: "#059669" },
  { id: "intellectual-prop",   label: "Intellectual Property",Icon: Database,     accent: "from-purple-600 to-blue-500",   hex: "#7c3aed" },
  { id: "user-conduct",        label: "User Conduct",         Icon: AlertTriangle,accent: "from-amber-500 to-orange-400",  hex: "#d97706" },
  { id: "third-party",         label: "Third-Party Services", Icon: ExternalLink, accent: "from-sky-500 to-blue-500",      hex: "#0ea5e9" },
  { id: "disclaimers",         label: "Disclaimers",          Icon: AlertTriangle,accent: "from-rose-500 to-orange-400",   hex: "#ea580c" },
  { id: "limitation-liability",label: "Limitation of Liability",Icon: Scale,      accent: "from-purple-600 to-blue-500",   hex: "#7c3aed" },
  { id: "indemnification",     label: "Indemnification",      Icon: Shield,       accent: "from-blue-600 to-green-400",    hex: "#2563eb" },
  { id: "governing-law",       label: "Governing Law",        Icon: Globe,        accent: "from-purple-600 to-blue-500",   hex: "#7c3aed" },
  { id: "changes",             label: "Changes to Terms",     Icon: Clock,        accent: "from-sky-500 to-blue-500",      hex: "#0ea5e9" },
  { id: "contact",             label: "Contact",              Icon: Mail,         accent: "from-blue-600 to-green-400",    hex: "#2563eb" },
];

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
function InfoBox({ children, hex }: { children: React.ReactNode; hex: string }) {
  return (
    <div className="rounded-2xl p-4 my-5 text-sm leading-relaxed border"
      style={{ background: hex + "08", borderColor: hex + "25", color: "#1e293b" }}>
      {children}
    </div>
  );
}
function SectionBlock({ id, num, label, Icon, accent, hex, children }: {
  id: string; num: number; label: string; Icon: React.ElementType;
  accent: string; hex: string; children: React.ReactNode;
}) {
  return (
    <div id={id} className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden mb-5 scroll-mt-28">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${accent}`} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: hex + "18" }}>
            <Icon className="w-4 h-4" style={{ color: hex }} />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: hex }}>Section {num}</p>
            <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{label}</h2>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function TermsPage() {
  const [active, setActive]  = useState("introduction");
  const [showTop, setShowTop] = useState(false);

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
        <div className="absolute right-20 bottom-4 opacity-15 pointer-events-none"><FileText size={70} className="text-white" /></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> Legal Document
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl leading-relaxed mb-6">
            Welcome to Pharmawallah. By accessing our educational platform, you agree to be bound by these Terms and Conditions.
          </p>
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 inline-block" /> Version 1.0
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

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* Mobile section nav */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-4 mb-6 -mx-1 px-1">
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className="shrink-0 text-[10px] font-extrabold px-3 py-1.5 rounded-full border whitespace-nowrap transition-all"
                  style={{ borderColor: s.hex + "40", color: s.hex, background: s.hex + "10" }}>
                  {s.label}
                </button>
              ))}
            </div>

            <SectionBlock id="introduction" num={1} label="Introduction" Icon={FileText} accent="from-blue-600 to-green-400" hex="#2563eb">
              <Para>Pharmawallah ("we", "our", "us") provides an open-access educational platform including pharmaceutical calculators, drug mechanism explanations, an AI guide tool, and a Pharmacopedia drug encyclopedia. These Terms govern your use of our website at pharma-wallah.vercel.app (the "Site"). By accessing or using the Site, you agree to be bound by these Terms.</Para>
            </SectionBlock>

            <SectionBlock id="use-of-website" num={2} label="Use of Website" Icon={Globe} accent="from-emerald-600 to-cyan-400" hex="#059669">
              <Para>The Site is intended for educational and informational purposes only. You may use the Site only if you are at least 13 years of age and are not barred from using it under applicable law.</Para>
              <Sub>Account Registration</Sub>
              <Para>Currently, Pharmawallah does not require user registration. All tools and resources are accessible without creating an account. If account features are introduced in the future, additional terms may apply.</Para>
              <Sub>Permitted Use</Sub>
              <Bullets items={[
                "Access and view content for personal, non-commercial educational purposes",
                "Use calculators and tools for academic work and study",
                "Interact with the AI guide for learning support",
              ]} />
            </SectionBlock>

            <SectionBlock id="intellectual-prop" num={3} label="Intellectual Property Rights" Icon={Database} accent="from-purple-600 to-blue-500" hex="#7c3aed">
              <Para>All content on the Site — including text, graphics, logos, images, data compilations, and software — is the property of Pharmawallah or its content suppliers and is protected by Pakistani and international copyright laws.</Para>
              <Sub>Limited License</Sub>
              <Para>We grant you a limited, non-exclusive, non-transferable license to access and use the Site for personal educational purposes. You may not:</Para>
              <Bullets items={[
                "Modify, copy, distribute, transmit, display, reproduce, publish, or create derivative works from any Site content",
                "Use any robot, spider, or automated means to access the Site without our express written permission",
                "Frame or mirror any part of the Site without prior written authorization",
              ]} />
            </SectionBlock>

            <SectionBlock id="user-conduct" num={4} label="User Conduct" Icon={AlertTriangle} accent="from-amber-500 to-orange-400" hex="#d97706">
              <Para>You agree not to use the Site in any way that:</Para>
              <Bullets items={[
                "Violates any applicable local, national, or international law or regulation",
                "Is unlawful, fraudulent, or harmful",
                "Impersonates any person or entity, or misrepresents your affiliation with any person or entity",
                "Interferes with or disrupts the operation of the Site or servers",
                "Attempts to gain unauthorized access to any part of the Site, other accounts, or computer systems",
                "Transmits any viruses, worms, Trojan horses, or other destructive items",
              ]} />
            </SectionBlock>

            <SectionBlock id="third-party" num={5} label="Third-Party Services" Icon={ExternalLink} accent="from-sky-500 to-blue-500" hex="#0ea5e9">
              <Para>The Site may include links to third-party websites, services, or advertisements (e.g., Google AdSense). We do not control and are not responsible for the content or practices of any third-party sites. We encourage you to read the terms and privacy policies of any third-party site you visit.</Para>
              <Sub>AI Guide Tool</Sub>
              <Para>Our AI guide may utilize third-party machine learning infrastructure. These providers process query data in accordance with their own terms. By using the AI tool, you consent to the transmission of your queries to such third-party services for the purpose of generating responses.</Para>
            </SectionBlock>

            <SectionBlock id="disclaimers" num={6} label="Disclaimers" Icon={AlertTriangle} accent="from-rose-500 to-orange-400" hex="#ea580c">
              <Warning>The Site and all content, tools, and AI-generated responses are provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. Pharmawallah does not warrant that the Site will be uninterrupted, error-free, or free of viruses or other harmful components.</Warning>
              <Para>The educational content, calculators, and AI guide are intended for learning and informational purposes only. They are not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider.</Para>
              <InfoBox hex="#ea580c">
                <strong>AI Accuracy:</strong> The AI guide tool may occasionally generate incorrect or outdated information. You should independently verify all critical information before relying on it for clinical or professional decisions.
              </InfoBox>
            </SectionBlock>

            <SectionBlock id="limitation-liability" num={7} label="Limitation of Liability" Icon={Scale} accent="from-purple-600 to-blue-500" hex="#7c3aed">
              <Para>To the fullest extent permitted by law, Pharmawallah and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:</Para>
              <Bullets items={[
                "Your use or inability to use the Site",
                "Any conduct or content of any third party on the Site",
                "Any content obtained from the Site",
                "Unauthorized access, use, or alteration of your transmissions or content",
              ]} />
              <Para>In no event shall our total liability to you for all claims exceed the amount you paid us (if any) to access the Site.</Para>
            </SectionBlock>

            <SectionBlock id="indemnification" num={8} label="Indemnification" Icon={Shield} accent="from-blue-600 to-green-400" hex="#2563eb">
              <Para>You agree to defend, indemnify, and hold harmless Pharmawallah and its affiliates, officers, directors, employees, and agents from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from:</Para>
              <Bullets items={[
                "Your use of and access to the Site",
                "Your violation of any term of these Terms",
                "Your violation of any third-party right, including any copyright, property, or privacy right",
              ]} />
            </SectionBlock>

            <SectionBlock id="governing-law" num={9} label="Governing Law" Icon={Globe} accent="from-purple-600 to-blue-500" hex="#7c3aed">
              <Para>These Terms shall be governed and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions. Any legal suit, action, or proceeding arising out of or related to these Terms or the Site shall be instituted exclusively in the courts of Pakistan.</Para>
            </SectionBlock>

            <SectionBlock id="changes" num={10} label="Changes to Terms" Icon={Clock} accent="from-sky-500 to-blue-500" hex="#0ea5e9">
              <Para>We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Site after any revisions become effective, you agree to be bound by the revised terms.</Para>
            </SectionBlock>

            <SectionBlock id="contact" num={11} label="Contact Information" Icon={Mail} accent="from-blue-600 to-green-400" hex="#2563eb">
              <Para>If you have any questions about these Terms, please contact us:</Para>
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
                <p className="text-xs text-gray-400">Version 1.0 · Last Updated: February 2025 · Governed by the laws of Pakistan</p>
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