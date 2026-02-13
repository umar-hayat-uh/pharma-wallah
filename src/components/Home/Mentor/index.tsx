"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, GraduationCap, BadgeCheck, Quote } from "lucide-react";

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
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const ExpertCard = ({ mentor, index }: { mentor: typeof mentors[0]; index: number }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group"
    >
      <div
        className="rounded-2xl border p-6 h-full flex flex-col transition-all duration-300"
        style={{
          borderColor: hovered ? mentor.accent + "40" : "#E5E7EB",
          background: hovered ? mentor.accent + "05" : "#fff",
          boxShadow: hovered
            ? `0 8px 32px 0 ${mentor.accent}18`
            : "0 1px 4px 0 #0000000A",
          transform: hovered ? "translateY(-3px)" : "translateY(0)",
        }}
      >
        {/* Quote mark */}
        <Quote
          className="w-7 h-7 mb-4 transition-colors duration-300"
          style={{ color: hovered ? mentor.accent : "#D1D5DB" }}
        />

        {/* Quote text */}
        <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1 italic">
          "{mentor.quote}"
        </p>

        {/* Divider */}
        <div
          className="w-10 h-0.5 mb-5 transition-colors duration-300 rounded-full"
          style={{ background: hovered ? mentor.accent : "#E5E7EB" }}
        />

        {/* Profile row */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors duration-300"
            style={{
              background: hovered ? mentor.accent : mentor.accent + "15",
              color: hovered ? "#fff" : mentor.accent,
            }}
          >
            {mentor.initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm font-bold text-gray-900 truncate">
                {mentor.name}
              </span>
              <BadgeCheck
                className="w-4 h-4 flex-shrink-0 transition-colors duration-300"
                style={{ color: hovered ? mentor.accent : "#9CA3AF" }}
              />
            </div>
            <p className="text-xs font-medium truncate" style={{ color: mentor.accent }}>
              {mentor.role}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <GraduationCap className="w-3 h-3 text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-400 truncate">{mentor.university}</span>
            </div>
          </div>

          {/* LinkedIn */}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 border"
            style={{
              borderColor: hovered ? mentor.accent + "40" : "#E5E7EB",
              background: hovered ? mentor.accent + "10" : "#F9FAFB",
            }}
            aria-label={`${mentor.name} LinkedIn`}
          >
            <Linkedin
              className="w-3.5 h-3.5 transition-colors duration-200"
              style={{ color: hovered ? mentor.accent : "#9CA3AF" }}
            />
          </a>
        </div>

        {/* Experience badge */}
        <div className="mt-4 flex items-center gap-2">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: mentor.accent + "12",
              color: mentor.accent,
            }}
          >
            {mentor.experience} experience
          </span>
          <span className="text-xs text-gray-400">&middot;</span>
          <span className="text-xs text-gray-400">{mentor.specialty}</span>
        </div>
      </div>
    </motion.div>
  );
};

const Mentor = () => {
  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden" id="mentor">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="container mx-auto px-6 max-w-6xl relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span
              className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "#2563EB" }}
            >
              <BadgeCheck className="w-3.5 h-3.5" />
              Expert Endorsements
            </span>

            <h2
              className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight"
              style={{ letterSpacing: "-0.02em", fontFamily: "'Sora', 'Nunito', sans-serif" }}
            >
              Endorsed by{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #2563EB, #0EA5E9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Pharmacy Experts
              </span>
            </h2>

            <p className="mt-3 text-gray-500 text-base max-w-lg">
              Leading professors and pharmaceutical professionals who vouch for
              Pharmawallah's academic quality and depth.
            </p>
          </motion.div>

          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <div
              className="inline-flex flex-col items-center gap-1 px-6 py-4 rounded-2xl border"
              style={{ borderColor: "#BFDBFE", background: "#EFF6FF" }}
            >
              <span className="text-3xl font-extrabold text-blue-700" style={{ letterSpacing: "-0.03em" }}>
                {mentors.length}+
              </span>
              <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest">
                Expert Endorsers
              </span>
            </div>
          </motion.div>
        </div>

        {/* Cards Grid — 3 columns top, 2 centered below */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Row 1 — 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
            {mentors.slice(0, 3).map((mentor, i) => (
              <ExpertCard key={mentor.name} mentor={mentor} index={i} />
            ))}
          </div>

          {/* Row 2 — 2 cards centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:w-2/3 lg:mx-auto">
            {mentors.slice(3).map((mentor, i) => (
              <ExpertCard key={mentor.name} mentor={mentor} index={i + 3} />
            ))}
          </div>
        </motion.div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200"
        >
          <p className="text-sm text-gray-400 text-center sm:text-left">
            All endorsers are verified academic professionals affiliated with accredited Pakistani institutions.
          </p>
          <div className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-600">Verified Endorsements</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Mentor;