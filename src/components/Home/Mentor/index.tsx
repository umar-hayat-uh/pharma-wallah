"use client";
import { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Linkedin, GraduationCap, BadgeCheck, Quote, ArrowRight, Users,
  ChevronLeft, ChevronRight,
  Pill, Microscope, Stethoscope, Beaker, Leaf, Dna,
} from "lucide-react";

const mentors = [
  { name: "Dr. Ayesha Khan",  role: "Pharmacology Professor",      university: "University of Health Sciences, Lahore", exp: "15 yrs", specialty: "Pharmacology",     quote: "Pharmawallah bridges the gap between textbooks and real understanding.", img: "/images/mentors/ayesha.jpg", initials: "AK", courses: 3, students: 2400, linkedin: "#" },
  { name: "Dr. Ali Hassan",   role: "Pharmaceutical Chemist",       university: "Dow University of Health Sciences",      exp: "12 yrs", specialty: "Pharma Chemistry", quote: "A platform that genuinely prepares students for clinical practice.",    img: "/images/mentors/ali.jpg",    initials: "AH", courses: 2, students: 1800, linkedin: "#" },
  { name: "Dr. Fatima Shah",  role: "Clinical Pharmacy Specialist", university: "Aga Khan University Hospital",           exp: "10 yrs", specialty: "Clinical",         quote: "The MCQ bank quality rivals the best GPAT prep resources available.",   img: "/images/mentors/fatima.jpg", initials: "FS", courses: 4, students: 3100, linkedin: "#" },
  { name: "Dr. Kamran Ahmed", role: "Pharmaceutics Expert",         university: "University of Karachi",                  exp: "18 yrs", specialty: "Pharmaceutics",    quote: "Structured, accurate, and built with students' real needs in mind.",    img: "/images/mentors/kamran.jpg", initials: "KA", courses: 5, students: 4200, linkedin: "#" },
  { name: "Dr. Sana Malik",   role: "Pharmacognosy Researcher",     university: "Quaid-i-Azam University, Islamabad",     exp: "8 yrs",  specialty: "Pharmacognosy",    quote: "I recommend Pharmawallah to every student entering their first year.",   img: "/images/mentors/sana.jpg",   initials: "SM", courses: 2, students: 1200, linkedin: "#" },
  { name: "Dr. Bilal Raza",   role: "Hospital Pharmacy Director",   university: "Services Hospital, Lahore",              exp: "14 yrs", specialty: "Hospital Pharma",  quote: "The case-based clinical modules are exactly what students need.",       img: "/images/mentors/bilal.jpg",  initials: "BR", courses: 3, students: 2700, linkedin: "#" },
];

const bgIcons = [
  { Icon: Pill,        top: "15%", left: "1.5%",  size: 30, delay: 0   },
  { Icon: Leaf,        top: "50%", left: "1%",    size: 28, delay: 1.0 },
  { Icon: Stethoscope, top: "82%", left: "1.5%",  size: 30, delay: 1.4 },
  { Icon: Microscope,  top: "15%", left: "96.5%", size: 32, delay: 0.8 },
  { Icon: Beaker,      top: "50%", left: "96.5%", size: 26, delay: 0.4 },
  { Icon: Dna,         top: "82%", left: "96%",   size: 28, delay: 0.6 },
];

const MentorCard = ({ m }: { m: typeof mentors[0] }) => (
  <div className="px-3 pb-10">
    <motion.div whileHover={{ y: -7, boxShadow: "0 18px 40px rgba(37,99,235,0.11)" }}
      transition={{ type: "spring", stiffness: 260 }}
      className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col hover:border-blue-300 transition-all duration-300">
      {/* Top stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-10 bg-gradient-to-r from-blue-600 to-green-400" />

      {/* Image */}
      <div className="relative h-52 w-full overflow-hidden bg-blue-50 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/10 to-transparent z-10" />
        <Image src={m.img} alt={m.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
        {/* Fallback initials */}
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center text-3xl font-extrabold text-white">
            {m.initials}
          </div>
        </div>
        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <p className="text-base font-extrabold text-white">{m.name}</p>
          <p className="text-xs text-blue-200 mt-0.5">{m.role}</p>
        </div>
        {/* Specialty tag */}
        <div className="absolute top-3.5 right-3.5 z-20 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-extrabold text-blue-700 border border-blue-100 uppercase tracking-wide">
          {m.specialty}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* University */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3.5">
          <GraduationCap className="w-3.5 h-3.5 shrink-0 text-blue-500" />
          <span className="line-clamp-1">{m.university}</span>
        </div>

        {/* Quote */}
        <div className="flex-1 rounded-xl bg-blue-50 border border-blue-100 p-3.5 mb-4">
          <Quote className="w-4 h-4 mb-1.5 text-blue-400" />
          <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-3">"{m.quote}"</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-[11px] font-bold text-green-600 flex items-center gap-1">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified Expert
          </span>
          <a href={m.linkedin} target="_blank" rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 text-gray-400 hover:text-[#0A66C2] hover:border-blue-300 transition">
            <Linkedin className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  </div>
);

export default function Mentor() {
  const ref = useRef<any>(null);

  return (
    <section className="w-full py-24 bg-gray-50/50 relative overflow-hidden">
      {bgIcons.map(({ Icon, top, left, size, delay }, i) => (
        <motion.div key={i} className="absolute pointer-events-none text-blue-200"
          style={{ top, left }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}>
          <Icon size={size} strokeWidth={1.4} />
        </motion.div>
      ))}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-green-400" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Centered header (replaces gradient banner) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified Expert Endorsers
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight max-w-3xl mx-auto">
            Guided by Pakistan's{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">
              Top Pharmacy Educators
            </span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our platform is endorsed and shaped by leading professors and clinical pharmacists from premier Pakistani institutions — ensuring accuracy, relevance, and academic excellence.
          </p>
        </motion.div>

        {/* Arrow controls */}
        <div className="flex justify-end gap-2 mb-5">
          <button onClick={() => ref.current?.slickPrev()}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition bg-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => ref.current?.slickNext()}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition bg-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Slider */}
        <Slider ref={ref} dots={false} infinite speed={600} autoplay autoplaySpeed={4500}
          slidesToShow={3} slidesToScroll={1} arrows={false}
          responsive={[{ breakpoint: 1024, settings: { slidesToShow: 2 } }, { breakpoint: 640, settings: { slidesToShow: 1 } }]}>
          {mentors.map(m => <MentorCard key={m.name} m={m} />)}
        </Slider>

        {/* Become a mentor CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-4 rounded-2xl border-2 border-blue-100 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-gray-900 text-sm">Are you a pharmacy expert?</h4>
              <p className="text-xs text-gray-400 mt-0.5">Join our mentor community and help shape the next generation of pharmacists.</p>
            </div>
          </div>
          <Link href="/contact">
            <motion.span whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer shrink-0">
              Become a Mentor <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <BadgeCheck className="w-4 h-4 text-green-500" />
          <span className="text-xs text-gray-400">All mentors are verified professionals at accredited Pakistani pharmaceutical institutions.</span>
        </div>
      </div>
    </section>
  );
}