"use client";

import { teamMembers } from "@/app/api/team-members";
import {
  Linkedin, Instagram, Mail, Sparkles, Award, BookOpen,
  Wrench, Megaphone, Pill, FlaskConical, Beaker, Microscope,
  Stethoscope, Leaf, Dna, Activity, GraduationCap, Users, Layers,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ── University overrides ──────────────────────────────────
const universityOverrides: Record<string, string> = {
  "Umar Hayat": "SMIT",
  "Abdul Wahab": "Hamdard University",
  "Jalal bin Junaid": "Hamdard University",
};

const getUniversity = (name: string) =>
  universityOverrides[name] ?? "University of Karachi";

// ── Orbiting background icons (one deliberate ambient moment) ──
const orbitIcons = [
  { Icon: Pill, radius: 46, duration: 34, delay: 0, size: 26, top: "10%", left: "4%" },
  { Icon: Beaker, radius: 34, duration: 26, delay: -6, size: 24, top: "42%", left: "2%" },
  { Icon: Stethoscope, radius: 40, duration: 30, delay: -12, size: 26, top: "76%", left: "5%" },
  { Icon: Microscope, radius: 42, duration: 32, delay: -4, size: 26, top: "10%", left: "94%" },
  { Icon: FlaskConical, radius: 30, duration: 24, delay: -10, size: 24, top: "44%", left: "96%" },
  { Icon: Leaf, radius: 36, duration: 28, delay: -18, size: 24, top: "76%", left: "94%" },
];

const stats = [
  { label: "Study resources", value: 120, suffix: "+" },
  { label: "Team members", value: 16, suffix: "" },
  { label: "Course modules", value: 30, suffix: "+" },
  { label: "Students reached", value: 4, suffix: "k+" },
];

export default function AboutPage() {
  const productionMembers = teamMembers.filter(m =>
    ["Shayan Hussain", "Umar Hayat", "Jalal bin Junaid", "Abdul Wahab", "Jazil bin kashef",
      "Sumaiya Saeed", "Syed M. Ali", "Rumaisa Farooqui", "Misbah Yameen", "Nawal Mirza",
      "Saleem Ferozi", "Muhammad Salman"].includes(m.name)
  );
  const marketingMembers = teamMembers.filter(m =>
    ["Syed Tanzeel Ali", "Romana Abbbas", "Abdul Rafay", "Muhammad Dayyan"].includes(m.name)
  );

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">
      <OrbitField />

      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 animate-[float_9s_ease-in-out_infinite]" />
        <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 animate-[float_7s_ease-in-out_infinite_1s]" />
        <div className="absolute right-20 bottom-4 opacity-15"><Dna size={60} className="text-white animate-[spin_18s_linear_infinite]" /></div>
        <div className="absolute right-44 top-6 opacity-15"><Activity size={40} className="text-white" /></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-4 py-1.5 mb-6 backdrop-blur-sm animate-[fadeUp_0.6s_ease-out]">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-semibold text-white tracking-wide">Built by pharmacy students, for pharmacy students</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight animate-[fadeUp_0.7s_ease-out_0.05s_both]">
            About
            <span className="block text-green-200 mt-1">PharmaWallah</span>
          </h1>

          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-2 leading-relaxed animate-[fadeUp_0.7s_ease-out_0.15s_both]">
            Empowering pharmacy students with curated study materials, comprehensive guides, and a supportive learning community.
          </p>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <StatsStrip />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-20">

        {/* ── Our Story ── */}
        <div>
          <SectionHeading icon={BookOpen} title="Our Story" />
          <div className="rounded-2xl border border-gray-200 bg-white p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
            <div className="absolute inset-0 bg-blue-50/20 pointer-events-none" />
            <div className="absolute -right-6 -bottom-6 text-blue-50 group-hover:text-blue-100 transition-colors duration-500">
              <Pill size={120} strokeWidth={1} />
            </div>
            <p className="relative z-10 text-gray-600 leading-relaxed text-base max-w-4xl">
              We are a group of passionate pharmacy students from the{" "}
              <span className="font-extrabold text-gray-900">University of Karachi (UOK)</span>{" "}
              who understand the challenges of university-level pharmacy education firsthand. After experiencing our own struggles with complex curriculum and scattered resources, we decided to create something better.{" "}
              <span className="font-extrabold text-blue-600">PharmaWallah</span>{" "}
              was born from a simple idea: to make pharmacy education more accessible, organized, and effective for every student who shares our passion for pharmaceutical sciences.
            </p>
          </div>
        </div>

        {/* ── Mission / Values / Approach ── */}
        <div>
          <SectionHeading icon={Award} title="What Drives Us" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { Icon: Award, title: "Our Mission", body: "To empower pharmacy students with accurate, concise, and easy-to-understand study materials that help them excel in their academic journey." },
              { Icon: Sparkles, title: "Our Values", body: "Quality content, student-first approach, collaborative learning, and commitment to accessible education." },
              { Icon: BookOpen, title: "Our Approach", body: "Deep curriculum understanding combined with clarity to simplify complex pharmaceutical concepts into digestible material." },
            ].map(({ Icon, title, body }, i) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-gray-200 bg-white p-6 flex flex-col hover:border-blue-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/40 transition-colors duration-300 pointer-events-none" />
                <div className="relative z-10 w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4
                  group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-400 group-hover:border-transparent group-hover:rotate-6 transition-all duration-300">
                  <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="relative z-10 text-sm font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="relative z-10 text-xs text-gray-500 leading-relaxed flex-1">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Production Team ── */}
        <div>
          <SectionHeading
            icon={Wrench}
            title="Production Team"
            subtitle="The creative minds behind our content, resources, and educational tools"
            count={productionMembers.length}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {productionMembers.map((member, i) => (
              <TeamCard key={i} member={member} university={getUniversity(member.name)} index={i} />
            ))}
          </div>
        </div>

        {/* ── Marketing Team ── */}
        <div>
          <SectionHeading
            icon={Megaphone}
            title="Marketing Team"
            subtitle="Spreading the word and building our community"
            count={marketingMembers.length}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-3xl">
            {marketingMembers.map((member, i) => (
              <TeamCard key={i} member={member} university={getUniversity(member.name)} index={i} />
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden p-10 md:p-14 text-center group">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
          <div className="absolute inset-0 bg-blue-50/30 pointer-events-none" />
          <div className="absolute -left-10 -top-10 text-blue-50 group-hover:rotate-12 transition-transform duration-700">
            <Dna size={140} strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200/50 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Join Our Learning Community
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Whether you're just starting your pharmacy journey or preparing for finals, PharmaWallah is here to support your success every step of the way.
            </p>
            <Link href="/courses"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 hover:-translate-y-0.5 transition-all duration-300">
              <BookOpen className="w-4 h-4" />
              Explore Our Materials
            </Link>
          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(var(--r)) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); }
        }
        @keyframes ringSpin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </section>
  );
}

// ── Section heading (shared) ─────────────────────────────
function SectionHeading({
  icon: Icon, title, subtitle, count,
}: { icon: any; title: string; subtitle?: string; count?: number }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
      {typeof count === "number" && (
        <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 shrink-0">
          {count} members
        </span>
      )}
    </div>
  );
}

// ── Orbiting background icon field ───────────────────────
function OrbitField() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 hidden md:block" aria-hidden="true">
      {orbitIcons.map(({ Icon, radius, duration, delay, size, top, left }, i) => (
        <div
          key={i}
          className="absolute text-blue-200/70"
          style={{
            top, left,
            animation: `orbit ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
            // @ts-ignore custom property
            "--r": `${radius}px`,
          }}
        >
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}
    </div>
  );
}

// ── Stats strip with count-up on scroll into view ────────
function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative z-10 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              <CountUp target={s.value} active={inView} delay={i * 120} />
              {s.suffix}
            </div>
            <div className="text-xs text-gray-400 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountUp({ target, active, delay = 0 }: { target: number; active: boolean; delay?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    let raf: number;
    const start = performance.now() + delay;
    const durationMs = 900;

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < 0) { raf = requestAnimationFrame(tick); return; }
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, delay]);

  return <>{value}</>;
}

// ── Faceless, animated Team Card ─────────────────────────
function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
}

function TeamCard({
  member, university, index,
}: { member: typeof teamMembers[0]; university: string; index: number }) {
  return (
    <div
      className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300"
      style={{ transitionDelay: `${(index % 4) * 30}ms` }}
    >
      {/* Top stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
      {/* Hover tint */}
      <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 transition-colors duration-300 pointer-events-none" />

      {/* Faceless identity badge */}
      <div className="relative z-10 pt-7 pb-3 flex justify-center">
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* rotating gradient ring, only visible/spinning on hover */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background: "conic-gradient(from 0deg, #2563eb, #4ade80, #2563eb)",
              animation: "ringSpin 3.5s linear infinite",
              padding: 2,
              WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              borderRadius: "1rem",
            }}
          />
          <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300 relative z-10">
            <span className="text-white font-extrabold text-lg tracking-wide">
              {getInitials(member.name)}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="relative z-10 px-5 pb-5 text-center">
        <h3 className="text-sm font-extrabold text-gray-900 mb-1.5 group-hover:text-blue-700 transition-colors duration-300">
          {member.name}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-green-400" />
          {member.role}
        </span>

        <div className="w-full h-px bg-gray-100 mb-3" />

        <div className="text-[10px] text-gray-400 mb-3 font-medium">{university}</div>

        <div className="flex justify-center items-center gap-2">
          {[
            { Icon: Linkedin, bg: "bg-blue-50", text: "text-blue-700", hover: "hover:bg-blue-100" },
            { Icon: Instagram, bg: "bg-pink-50", text: "text-pink-700", hover: "hover:bg-pink-100" },
            { Icon: Mail, bg: "bg-green-50", text: "text-green-700", hover: "hover:bg-green-100" },
          ].map(({ Icon, bg, text, hover }, j) => (
            <button
              key={j}
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg} ${text} ${hover} border border-gray-100 transition-all duration-200 hover:scale-110`}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}