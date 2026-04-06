"use client";
import { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Linkedin, GraduationCap, BadgeCheck, Quote, ArrowRight, Users,
  ChevronLeft, ChevronRight, Star, BookOpen, Award,
  Pill, Microscope, Stethoscope, Beaker, Leaf, Dna,
} from "lucide-react";

const mentors = [
  { name: "Dr. Ayesha Khan",  role: "Pharmacology Professor",      university: "University of Health Sciences, Lahore", exp: "15 yrs", specialty: "Pharmacology",     quote: "Pharmawallah bridges the gap between textbooks and real understanding.", img: "/images/mentors/ayesha.jpg", initials: "AK", courses: 3, students: 2400, linkedin: "#", accentFrom: "from-blue-600", accentTo: "to-blue-400" },
  { name: "Dr. Ali Hassan",   role: "Pharmaceutical Chemist",       university: "Dow University of Health Sciences",      exp: "12 yrs", specialty: "Pharma Chemistry", quote: "A platform that genuinely prepares students for clinical practice.",    img: "/images/mentors/ali.jpg",    initials: "AH", courses: 2, students: 1800, linkedin: "#", accentFrom: "from-blue-500", accentTo: "to-green-400" },
  { name: "Dr. Fatima Shah",  role: "Clinical Pharmacy Specialist", university: "Aga Khan University Hospital",           exp: "10 yrs", specialty: "Clinical",         quote: "The MCQ bank quality rivals the best GPAT prep resources available.",   img: "/images/mentors/fatima.jpg", initials: "FS", courses: 4, students: 3100, linkedin: "#", accentFrom: "from-green-500", accentTo: "to-blue-400" },
  { name: "Dr. Kamran Ahmed", role: "Pharmaceutics Expert",         university: "University of Karachi",                  exp: "18 yrs", specialty: "Pharmaceutics",    quote: "Structured, accurate, and built with students' real needs in mind.",    img: "/images/mentors/kamran.jpg", initials: "KA", courses: 5, students: 4200, linkedin: "#", accentFrom: "from-blue-700", accentTo: "to-blue-500" },
  { name: "Dr. Sana Malik",   role: "Pharmacognosy Researcher",     university: "Quaid-i-Azam University, Islamabad",     exp: "8 yrs",  specialty: "Pharmacognosy",    quote: "I recommend Pharmawallah to every student entering their first year.",   img: "/images/mentors/sana.jpg",   initials: "SM", courses: 2, students: 1200, linkedin: "#", accentFrom: "from-green-600", accentTo: "to-green-400" },
  { name: "Dr. Bilal Raza",   role: "Hospital Pharmacy Director",   university: "Services Hospital, Lahore",              exp: "14 yrs", specialty: "Hospital Pharma",  quote: "The case-based clinical modules are exactly what students need.",       img: "/images/mentors/bilal.jpg",  initials: "BR", courses: 3, students: 2700, linkedin: "#", accentFrom: "from-green-500", accentTo: "to-blue-500" },
];

const bgIcons = [
  { Icon: Pill,        top: "12%", left: "1.5%",  size: 32 },
  { Icon: Leaf,        top: "45%", left: "1%",    size: 28 },
  { Icon: Stethoscope, top: "78%", left: "1.5%",  size: 32 },
  { Icon: Microscope,  top: "12%", left: "96.5%", size: 34 },
  { Icon: Beaker,      top: "45%", left: "96.5%", size: 28 },
  { Icon: Dna,         top: "78%", left: "96%",   size: 30 },
];

const totalStudents = mentors.reduce((a, m) => a + m.students, 0);

const MentorCard = ({ m }: { m: typeof mentors[0] }) => (
  <div className="px-2.5 pb-8">
    <div className="group relative rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col
      hover:shadow-xl hover:shadow-blue-100/60 hover:-translate-y-1 hover:border-blue-200
      transition-all duration-300 shadow-sm">

      {/* Gradient top bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${m.accentFrom} ${m.accentTo} flex-shrink-0`} />

      {/* Image / Avatar area */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 shrink-0">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/65 via-gray-900/10 to-transparent z-10" />

        <Image
          src={m.img} alt={m.name} fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-700 z-0"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        {/* Fallback initials */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${m.accentFrom} ${m.accentTo}
            flex items-center justify-center text-3xl font-extrabold text-white shadow-lg`}>
            {m.initials}
          </div>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <p className="text-base font-extrabold text-white leading-tight">{m.name}</p>
          <p className="text-xs text-blue-200/90 mt-0.5">{m.role}</p>
        </div>

        {/* Specialty chip */}
        <div className="absolute top-3 right-3 z-20">
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg
            bg-white/95 text-blue-700 border border-blue-100 uppercase tracking-wide shadow-sm">
            {m.specialty}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">

        {/* University */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <GraduationCap className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
          <span className="line-clamp-1 font-medium">{m.university}</span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Experience", value: m.exp, icon: Award },
            { label: "Courses",    value: `${m.courses}`,       icon: BookOpen },
            { label: "Students",   value: `${(m.students/1000).toFixed(1)}k`, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center rounded-xl bg-gray-50 border border-gray-100 py-2.5 px-1">
              <Icon className="w-3.5 h-3.5 text-blue-500 mb-1" />
              <span className="text-sm font-extrabold text-gray-900 leading-none">{value}</span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-50 to-green-50/40 border border-blue-100/60 p-3.5 mb-4">
          <Quote className="w-4 h-4 mb-1.5 text-blue-400" />
          <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-3">"{m.quote}"</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-[11px] font-bold text-green-600 flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified Expert
          </span>
          <a
            href={m.linkedin} target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200
              text-gray-400 hover:text-[#0A66C2] hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            <Linkedin className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default function Mentor() {
  const sliderRef = useRef<any>(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  const sliderSettings = {
    dots: false, infinite: true, speed: 600, autoplay: true, autoplaySpeed: 4500,
    slidesToShow: 3, slidesToScroll: 1, arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640,  settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="relative w-full py-24 overflow-hidden"
      style={{ background: "linear-gradient(160deg, #f0f7ff 0%, #ffffff 45%, #f0fdf6 100%)" }}>

      {/* Ambient blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.28]"
        style={{ backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />

      {/* Side ambient icons */}
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="absolute pointer-events-none text-blue-200/25" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.3} />
        </div>
      ))}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 28 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-white border border-blue-200/70 shadow-sm mb-6">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
              <BadgeCheck className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Verified Expert Endorsers</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-5 tracking-tight leading-[1.08]">
            Guided by Pakistan's{" "}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                Top Educators
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 220 6" preserveAspectRatio="none">
                <path d="M0 3 Q55 0 110 3 Q165 6 220 3" stroke="url(#ul3)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="ul3" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#2563eb"/>
                    <stop offset="100%" stopColor="#22c55e"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h2>

          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed mb-8">
            Our platform is shaped by leading professors and clinical pharmacists from Pakistan's premier institutions —
            ensuring accuracy, relevance, and academic excellence.
          </p>

          {/* Aggregate stats */}
          <div className="inline-flex items-center gap-6 bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-sm">
            {[
              { value: `${mentors.length}+`, label: "Expert Mentors" },
              { value: `${(totalStudents / 1000).toFixed(0)}k+`, label: "Students Guided" },
              { value: "6+", label: "Institutions" },
            ].map(({ value, label }, i) => (
              <div key={i} className={`flex flex-col items-center ${i > 0 ? "pl-6 border-l border-gray-100" : ""}`}>
                <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">{value}</span>
                <span className="text-xs text-gray-400 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Slider controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-gray-700">All mentors verified from accredited institutions</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => sliderRef.current?.slickPrev()}
              className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center
                text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => sliderRef.current?.slickNext()}
              className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center
                text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Slider ref={sliderRef} {...sliderSettings}>
            {mentors.map(m => <MentorCard key={m.name} m={m} />)}
          </Slider>
        </motion.div>

        {/* Become a mentor CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-2 relative rounded-2xl overflow-hidden border border-blue-100 bg-white shadow-sm"
        >
          {/* Subtle gradient background */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.03) 0%, rgba(34,197,94,0.03) 100%)" }} />

          <div className="relative z-10 p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-md flex-shrink-0">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 text-base">Are you a pharmacy expert?</h4>
                <p className="text-sm text-gray-500 mt-0.5">Join our mentor community and help shape the next generation of pharmacists.</p>
              </div>
            </div>
            <Link href="/contact">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-bold
                shadow-md hover:shadow-lg hover:scale-105 active:scale-95
                transition-all duration-200 cursor-pointer shrink-0 group">
                Become a Mentor
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </motion.div>

        {/* Trust badge */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <BadgeCheck className="w-4 h-4 text-green-500" />
          <span className="text-xs text-gray-400">All mentors are verified professionals at accredited Pakistani pharmaceutical institutions.</span>
        </div>
      </div>
    </section>
  );
}