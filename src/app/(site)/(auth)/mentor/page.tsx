"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Linkedin, GraduationCap, BadgeCheck, Quote, ArrowRight, Users } from "lucide-react";
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

// Mentors data (from your earlier example)
const mentors = [
  {
    name: "Dr. Ayesha Khan",
    role: "Pharmacology Professor",
    university: "University of Health Sciences",
    experience: "15 years",
    specialty: "Pharmacology",
    quote: "Pharmawallah bridges the gap between textbooks and real understanding.",
    initials: "AK",
    accent: "#2563EB",
    linkedin: "#",
  },
  {
    name: "Dr. Ali Hassan",
    role: "Pharmaceutical Chemist",
    university: "Dow University",
    experience: "12 years",
    specialty: "Pharmaceutical Chemistry",
    quote: "A platform that genuinely prepares students for clinical practice.",
    initials: "AH",
    accent: "#059669",
    linkedin: "#",
  },
  {
    name: "Dr. Fatima Shah",
    role: "Clinical Pharmacy Specialist",
    university: "Aga Khan University",
    experience: "10 years",
    specialty: "Clinical Pharmacy",
    quote: "The MCQ bank quality rivals the best GPAT prep resources available.",
    initials: "FS",
    accent: "#7C3AED",
    linkedin: "#",
  },
  {
    name: "Dr. Kamran Ahmed",
    role: "Pharmaceutics Expert",
    university: "University of Karachi",
    experience: "18 years",
    specialty: "Pharmaceutics",
    quote: "Structured, accurate, and built with students' real needs in mind.",
    initials: "KA",
    accent: "#0EA5E9",
    linkedin: "#",
  },
  {
    name: "Dr. Sana Malik",
    role: "Pharmacognosy Researcher",
    university: "Quaid-i-Azam University",
    experience: "8 years",
    specialty: "Pharmacognosy",
    quote: "I recommend Pharmawallah to every student entering their first year.",
    initials: "SM",
    accent: "#D97706",
    linkedin: "#",
  },
];

function MentorCard({ mentor, index }: { mentor: typeof mentors[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative"
    >
      {/* Permanent gradient border */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-400 to-green-400 rounded-3xl opacity-30 group-hover:opacity-70 transition-opacity duration-500 blur-[1px]" />

      {/* Main card */}
      <div className="relative bg-white/70 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl border border-white/20 p-6">
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, rgba(59,130,246,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <Quote className="w-6 h-6 mb-4" style={{ color: hovered ? mentor.accent : "#D1D5DB" }} />

        <p className="text-sm text-gray-600 mb-6 italic">"{mentor.quote}"</p>

        <div className="w-10 h-0.5 mb-5 rounded-full" style={{ background: hovered ? mentor.accent : "#E5E7EB" }} />

        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: hovered ? mentor.accent : mentor.accent + "15",
              color: hovered ? "#fff" : mentor.accent,
            }}
          >
            {mentor.initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <span className="text-sm font-bold text-gray-900 truncate">{mentor.name}</span>
              <BadgeCheck className="w-4 h-4 flex-shrink-0" style={{ color: hovered ? mentor.accent : "#9CA3AF" }} />
            </div>
            <p className="text-xs font-medium truncate" style={{ color: mentor.accent }}>
              {mentor.role}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <GraduationCap className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400 truncate">{mentor.university}</span>
            </div>
          </div>

          <a
            href={mentor.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50"
          >
            <Linkedin className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: mentor.accent + "12", color: mentor.accent }}>
            {mentor.experience}
          </span>
          <span className="text-xs text-gray-400">{mentor.specialty}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function MentorPage() {
  const [hovered, setHovered] = useState(false); // not used

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
              Our Mentors
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Meet the experts who guide and shape the content at PharmaWallah.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor, index) => (
              <MentorCard key={mentor.name} mentor={mentor} index={index} />
            ))}
          </div>

          {/* Become a Mentor CTA */}
          <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-blue-50/50 to-green-50/50 backdrop-blur-sm border border-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-gray-900">Are you a pharmacy expert?</h4>
                <p className="text-sm text-gray-600">Join our mentor community and help shape future pharmacists.</p>
              </div>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-2 bg-white/70 backdrop-blur-sm border border-white/50 text-blue-700 font-medium rounded-full hover:bg-white/90 transition"
            >
              Become a Mentor <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Verification footer */}
          <div className="mt-6 text-center text-xs text-gray-400">
            All mentors are verified academic professionals affiliated with accredited institutions.
          </div>
        </div>
      </div>
    </section>
  );
}