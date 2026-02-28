"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Linkedin, GraduationCap, BadgeCheck, Quote, ArrowRight, Users,
  // Background icons
  Pill,
  FlaskConical,
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

// Increased opacity for better visibility
const iconList: BgIconItem[] = [
  { Icon: Pill, color: "text-blue-800/20" },
  { Icon: FlaskConical, color: "text-green-800/20" },
  { Icon: Beaker, color: "text-purple-800/20" },
  { Icon: Microscope, color: "text-amber-800/20" },
  { Icon: Atom, color: "text-blue-800/20" },
  { Icon: Dna, color: "text-green-800/20" },
  { Icon: HeartPulse, color: "text-purple-800/20" },
  { Icon: Leaf, color: "text-amber-800/20" },
  { Icon: Syringe, color: "text-blue-800/20" },
  { Icon: TestTube, color: "text-green-800/20" },
  { Icon: Tablet, color: "text-purple-800/20" },
  { Icon: ClipboardList, color: "text-amber-800/20" },
  { Icon: Stethoscope, color: "text-blue-800/20" },
  { Icon: Bandage, color: "text-green-800/20" },
  { Icon: Droplet, color: "text-purple-800/20" },
  { Icon: Eye, color: "text-amber-800/20" },
  { Icon: Bone, color: "text-blue-800/20" },
  { Icon: Brain, color: "text-green-800/20" },
  { Icon: Heart, color: "text-purple-800/20" },
  { Icon: Activity, color: "text-amber-800/20" },
  { Icon: AlertCircle, color: "text-blue-800/20" },
  { Icon: Scissors, color: "text-green-800/20" },
  { Icon: Thermometer, color: "text-purple-800/20" },
  { Icon: Wind, color: "text-amber-800/20" },
  { Icon: Droplets, color: "text-green-800/20" },
  { Icon: FlaskRound, color: "text-purple-800/20" },
  { Icon: Scale, color: "text-blue-800/20" },
  { Icon: Calculator, color: "text-green-800/20" },
];

const bgIcons: BgIconItem[] = [];
for (let i = 0; i < 40; i++) {
  const item = iconList[i % iconList.length];
  bgIcons.push({
    Icon: item.Icon,
    color:
      i % 4 === 0
        ? "text-blue-800/20"
        : i % 4 === 1
        ? "text-green-800/20"
        : i % 4 === 2
        ? "text-purple-800/20"
        : "text-amber-800/20",
  });
}

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

const MentorCard = ({ mentor, index }: { mentor: typeof mentors[0]; index: number }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative"
    >
      {/* Gradient border on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300" />

      {/* Card */}
      <div className="relative bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 p-6 h-full flex flex-col items-center text-center hover:shadow-xl transition-all duration-300">
        {/* Avatar Circle */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 border-4 border-white shadow-md"
          style={{
            background: hovered ? mentor.accent : mentor.accent + "15",
            color: hovered ? "#fff" : mentor.accent,
          }}
        >
          {mentor.initials}
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1">{mentor.name}</h3>

        {/* Role */}
        <p className="text-sm font-medium" style={{ color: mentor.accent }}>
          {mentor.role}
        </p>

        {/* University */}
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
          <GraduationCap className="w-3 h-3" />
          <span>{mentor.university}</span>
        </div>

        {/* Quote */}
        <div className="mt-4 p-3 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-100 w-full">
          <Quote className="w-4 h-4 mx-auto mb-1" style={{ color: mentor.accent }} />
          <p className="text-xs text-gray-600 italic">"{mentor.quote}"</p>
        </div>

        {/* Experience & Specialty */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2 py-1 rounded-full"
            style={{ background: mentor.accent + "12", color: mentor.accent }}
          >
            {mentor.experience}
          </span>
          <span className="text-xs text-gray-500">{mentor.specialty}</span>
        </div>

        {/* LinkedIn Link */}
        <a
          href={mentor.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Linkedin className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
};

const Mentor = () => {
  return (
    <section className="w-full py-16 md:py-20 lg:py-24 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      {/* Floating background icons with animation */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {bgIcons.map(({ Icon, color }, index) => {
          const left = `${(index * 13) % 90 + 5}%`;
          const top = `${(index * 19) % 90 + 5}%`;
          const size = 30 + (index * 7) % 90;
          const rotate = (index * 23) % 360;
          const delay = index * 0.2;
          return (
            <Icon
              key={index}
              size={size}
              className={`absolute ${color} animate-float`}
              style={{
                left,
                top,
                transform: `rotate(${rotate}deg)`,
                animationDelay: `${delay}s`,
                animationDuration: '8s',
              }}
            />
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
            <BadgeCheck className="w-4 h-4" />
            Expert Endorsements
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Endorsed by{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Pharmacy Experts
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Leading professors and pharmaceutical professionals who vouch for Pharmawallah's academic quality.
          </p>
        </motion.div>

        {/* Stats and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <div className="inline-flex flex-col items-center gap-1 px-6 py-4 rounded-xl border border-blue-200 bg-white/70 backdrop-blur-md">
            <span className="text-3xl font-extrabold text-blue-700">{mentors.length}+</span>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Expert Endorsers</span>
          </div>
          <Link
            href="/mentors"
            className="inline-flex items-center gap-2 px-6 py-4 border border-white/50 bg-white/70 backdrop-blur-md rounded-xl text-gray-700 font-medium hover:bg-white/90 transition"
          >
            View All Mentors <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor, index) => (
            <MentorCard key={mentor.name} mentor={mentor} index={index} />
          ))}
        </div>

        {/* Verification Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-gray-400 text-center sm:text-left">
            All endorsers are verified academic professionals affiliated with accredited Pakistani institutions.
          </p>
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-600">Verified Endorsements</span>
          </div>
        </motion.div>

        {/* Become a Mentor CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-50/50 to-green-50/50 backdrop-blur-md border border-white/50 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Are you a pharmacy expert?</h4>
              <p className="text-sm text-gray-600">Join our mentor community and help shape future pharmacists.</p>
            </div>
          </div>
          <Link
            href="/become-mentor"
            className="inline-flex items-center gap-2 px-6 py-2 bg-white/70 backdrop-blur-md border border-white/50 text-blue-700 font-medium rounded-full hover:bg-white/90 transition"
          >
            Become a Mentor <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }

        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Mentor;