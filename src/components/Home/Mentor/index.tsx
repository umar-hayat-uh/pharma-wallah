"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Linkedin, GraduationCap, BadgeCheck, Quote, ArrowRight, Users } from "lucide-react";

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

const ExpertCard = ({ mentor, index }: { mentor: typeof mentors[0]; index: number }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative group"
        >
            <div
                className="rounded-xl border p-6 h-full flex flex-col transition-all duration-300 bg-white"
                style={{
                    borderColor: hovered ? mentor.accent + "40" : "#E5E7EB",
                    boxShadow: hovered ? `0 4px 12px ${mentor.accent}18` : "0 1px 3px #0000000A",
                }}
            >
                <Quote className="w-6 h-6 mb-4" style={{ color: hovered ? mentor.accent : "#D1D5DB" }} />
                <p className="text-sm text-gray-600 mb-6 flex-1 italic">"{mentor.quote}"</p>
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
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50"
                        aria-label={`${mentor.name} LinkedIn`}
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
};

const Mentor = () => {
    return (
        <section className="w-full py-16 md:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                            <BadgeCheck className="w-4 h-4" />
                            Expert Endorsements
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Endorsed by{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                                Pharmacy Experts
                            </span>
                        </h2>
                        <p className="mt-3 text-gray-600 max-w-lg">
                            Leading professors and pharmaceutical professionals who vouch for Pharmawallah's academic quality.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-shrink-0">
                            <div className="inline-flex flex-col items-center gap-1 px-6 py-4 rounded-xl border border-blue-200 bg-blue-50">
                                <span className="text-3xl font-extrabold text-blue-700">{mentors.length}+</span>
                                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Expert Endorsers</span>
                            </div>
                        </div>
                        <Link
                            href="/mentors"
                            className="inline-flex items-center gap-2 px-6 py-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:border-gray-400 transition self-center"
                        >
                            View All Mentors <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                    {mentors.slice(0, 3).map((mentor, i) => (
                        <ExpertCard key={mentor.name} mentor={mentor} index={i} />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:w-2/3 lg:mx-auto">
                    {mentors.slice(3).map((mentor, i) => (
                        <ExpertCard key={mentor.name} mentor={mentor} index={i + 3} />
                    ))}
                </div>

                <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-400 text-center sm:text-left">
                        All endorsers are verified academic professionals affiliated with accredited Pakistani institutions.
                    </p>
                    <div className="flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-gray-600">Verified Endorsements</span>
                    </div>
                </div>

                <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-600" />
                        <div>
                            <h4 className="font-semibold text-gray-900">Are you a pharmacy expert?</h4>
                            <p className="text-sm text-gray-600">Join our mentor community and help shape future pharmacists.</p>
                        </div>
                    </div>
                    <Link
                        href="/become-mentor"
                        className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-blue-300 text-blue-700 font-medium rounded-full hover:bg-blue-50 transition"
                    >
                        Become a Mentor <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Mentor;