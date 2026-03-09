"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, BookOpen, Sparkles,
  Pill, FlaskConical, Stethoscope, Microscope, Dna, Beaker, HeartPulse, Leaf, Activity, Syringe,
} from "lucide-react";

const stats = [
  { value: "500+", label: "Resources"  },
  { value: "10k+", label: "Students"   },
  { value: "50+",  label: "Mentors"    },
  { value: "4.9★", label: "Rating"     },
];

const tags = ["Pharmacology", "GPAT Prep", "MCQ Bank", "Drug Database", "Clinical Pharmacy"];

// Symmetric 4-left / 4-right floating icons with individual colors
const bgIcons = [
  { Icon: Pill,        top: "10%", left: "2%",   size: 30, delay: 0,   color: "text-blue-400"   },
  { Icon: HeartPulse,  top: "34%", left: "1.5%", size: 28, delay: 0.6, color: "text-red-400"     },
  { Icon: Stethoscope, top: "60%", left: "2%",   size: 32, delay: 1.2, color: "text-purple-400"  },
  { Icon: Leaf,        top: "84%", left: "1.5%", size: 26, delay: 1.8, color: "text-green-400"   },
  { Icon: FlaskConical,top: "10%", left: "93%",  size: 32, delay: 0.3, color: "text-amber-400"   },
  { Icon: Dna,         top: "34%", left: "93.5%",size: 28, delay: 0.9, color: "text-teal-400"    },
  { Icon: Microscope,  top: "60%", left: "93%",  size: 34, delay: 1.5, color: "text-indigo-400"  },
  { Icon: Beaker,      top: "84%", left: "93.5%",size: 26, delay: 2.1, color: "text-cyan-400"    },
  { Icon: Syringe,     top: "90%", left: "48%",  size: 24, delay: 2,   color: "text-pink-400"    },
  { Icon: Activity,    top: "4%",  left: "48%",  size: 22, delay: 0.5, color: "text-orange-400"  },
];

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-white">
      {/* Soft gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-100/60 to-green-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-green-100/50 to-blue-100/40 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #2563eb 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
      </div>

      {/* Floating icons */}
      {bgIcons.map(({ Icon, top, left, size, delay, color }, i) => (
        <motion.div key={i} className={`absolute pointer-events-none ${color}`}
          style={{ top, left }}
          animate={{ y: [0, -14, 0], rotate: [0, 5, -5, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 6 + i * 0.3, delay, repeat: Infinity, ease: "easeInOut" }}>
          <Icon size={size} strokeWidth={1.4} />
        </motion.div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left column */}
          <div className="flex flex-col gap-7">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit bg-blue-50 border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-blue-700">Pakistan's #1 Pharmacy eLearning Platform</span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
              <h1 className="text-4xl xs:text-5xl sm:text-5xl lg:text-[3.6rem] font-extrabold leading-tight lg:leading-[1.09] text-gray-900 tracking-tight">
                Master{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">Pharmacy</span>
                  <motion.svg
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.8 }}
                    className="absolute -bottom-1.5 left-0 w-full"
                    viewBox="0 0 220 10"
                    fill="none"
                  >
                    <motion.path
                      d="M2 7 C 55 2, 140 2, 218 7"
                      stroke="url(#hg)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, delay: 0.8 }}
                    />
                    <defs>
                      <linearGradient id="hg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#4ade80" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
                <br />& Pharmaceutical
                <br />Sciences
              </h1>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-lg">
                UOK & HEC-aligned curriculum · Exam ready Notes & MCQ's · Quick Calculations · Comprehensive Drug Information — all in one platform.
              </p>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
              className="relative max-w-lg">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 opacity-20 blur-sm" />
              <div className="relative flex items-center bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <Search className="absolute left-4 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, drugs, or topics..."
                  className="w-full pl-11 pr-28 py-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
                />
                <button className="absolute right-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-green-400 hover:opacity-90 transition">
                  Search
                </button>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.38 }}
              className="flex flex-wrap gap-3">
              <Link href="/courses">
                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm shadow-lg shadow-blue-200/50 cursor-pointer">
                  <BookOpen className="w-4 h-4" /> Start Learning Free
                </motion.span>
              </Link>
              <Link href="/ai-guide">
                <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-blue-300 hover:text-blue-600 transition cursor-pointer">
                  <Sparkles className="w-4 h-4 text-blue-500" /> Try AI Guide
                </motion.span>
              </Link>
            </motion.div>
          </div>

          {/* Right column – image */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.2 }}
            className="relative flex flex-col items-center">
            {/* Rotating gradient background */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              className="absolute w-[420px] h-[420px] rounded-full"
              style={{ background: "conic-gradient(from 0deg, #2563eb18, #4ade8018, #2563eb18)", filter: "blur(2px)" }} />
            <div className="absolute w-[380px] h-[380px] rounded-full border border-blue-100/60" />

            {/* Desktop floating cards (hidden on mobile) */}
            <div className="hidden md:block">
              {/* Exam Prep card */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 z-20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Exam Prep</div>
                  <div className="text-[10px] text-gray-400">Exam-ready questions & Solutions</div>
                </div>
              </motion.div>

              {/* Rating card */}
              <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
                className="absolute -bottom-6 -right-4 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 z-20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">4.9 / 5.0 Rating</div>
                  <div className="text-[10px] text-gray-400">10,000+ students</div>
                </div>
              </motion.div>

              {/* AI Guide card */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-1/2 -right-10 -translate-y-1/2 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 z-20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">AI Guide</div>
                  <div className="text-[10px] text-gray-400">24/7 available</div>
                </div>
              </motion.div>
            </div>

            {/* Hero image */}
            <div className="relative w-[280px] sm:w-[320px] h-[360px] sm:h-[400px] rounded-3xl overflow-hidden z-10">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent z-10" />
              <Image src="/images/banner/mahila.jpeg" alt="Pharmacy student" fill className="object-cover object-top" priority />
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm rounded-full px-5 py-2 flex items-center gap-2 shadow-md">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-gray-700">Learning Platform</span>
              </div>
            </div>

            {/* Mobile info cards (visible only on small screens) */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 md:hidden">
              <div className="bg-white rounded-xl px-3 py-2 shadow-md border border-gray-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                  <FlaskConical className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">Exam Prep</div>
                  <div className="text-[8px] text-gray-400">Q&A Solutions</div>
                </div>
              </div>
              <div className="bg-white rounded-xl px-3 py-2 shadow-md border border-gray-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">4.9★ Rating</div>
                  <div className="text-[8px] text-gray-400">10k+ students</div>
                </div>
              </div>
              <div className="bg-white rounded-xl px-3 py-2 shadow-md border border-gray-100 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                  <Stethoscope className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">AI Guide</div>
                  <div className="text-[8px] text-gray-400">24/7 available</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}