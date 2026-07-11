"use client";
import { useRef } from "react";
import Slider from "react-slick";
// @ts-ignore: Ignore missing type declarations for CSS imports
import "slick-carousel/slick/slick.css";
// @ts-ignore: Ignore missing type declarations for CSS imports
import "slick-carousel/slick/slick-theme.css";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Linkedin, GraduationCap, BadgeCheck, ChevronLeft, ChevronRight, Users, ArrowRight, BookOpen, Quote
} from "lucide-react";

// Simplified mentor data - removed heavy accent colors for a unified professional look
const mentors = [
  { name: "Dr. Ayesha Khan", role: "Pharmacology Professor", university: "University of Health Sciences", exp: "15 yrs", specialty: "Pharmacology", quote: "Pharmawallah bridges the gap between textbooks and real understanding.", img: "images/mentor/user3.png", initials: "AK", courses: 3, students: 2400, linkedin: "#" },
  { name: "Dr. Ali Hassan", role: "Pharmaceutical Chemist", university: "Dow University of Health Sciences", exp: "12 yrs", specialty: "Pharma Chemistry", quote: "A platform that genuinely prepares students for clinical practice.", img: "images/mentor/user3.png", initials: "AH", courses: 2, students: 1800, linkedin: "#" },
  { name: "Dr. Fatima Shah", role: "Clinical Pharmacy Specialist", university: "Aga Khan University Hospital", exp: "10 yrs", specialty: "Clinical", quote: "The MCQ bank quality rivals the best GPAT prep resources available.", img: "images/mentor/user3.png", initials: "FS", courses: 4, students: 3100, linkedin: "#" },
  { name: "Dr. Kamran Ahmed", role: "Pharmaceutics Expert", university: "University of Karachi", exp: "18 yrs", specialty: "Pharmaceutics", quote: "Structured, accurate, and built with students' real needs in mind.", img: "images/mentor/user3.png", initials: "KA", courses: 5, students: 4200, linkedin: "#" },
];

const totalStudents = mentors.reduce((a, m) => a + m.students, 0);

const MentorCard = ({ m }: { m: typeof mentors[0] }) => (
  <div className="px-3 pb-8 pt-2">
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 flex flex-col h-full text-center">

      {/* Large Full Image in Round Frame - No gray ring */}
      <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden shrink-0 mb-5 shadow-sm">
        <Image
          src={m.img}
          alt={m.name}
          fill
          className="object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {/* Fallback initials if image fails to load */}
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-400 bg-gray-50 z-[-1]">
          {m.initials}
        </div>
      </div>

      {/* Header Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <h3 className="text-xl font-bold text-gray-900 truncate">{m.name}</h3>
          <BadgeCheck className="w-5 h-5 text-blue-600 shrink-0" />
        </div>
        <p className="text-sm font-medium text-blue-600 truncate">{m.role}</p>
        <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-gray-500">
          <GraduationCap className="w-4 h-4 shrink-0" />
          <span className="truncate">{m.university}</span>
        </div>
      </div>

      {/* Quote */}
      <div className="mt-5 mb-6">
        <Quote className="w-5 h-5 text-gray-200 mx-auto mb-2" />
        <p className="text-sm text-gray-700 leading-relaxed italic line-clamp-3">"{m.quote}"</p>
      </div>

      {/* Footer Stats & Social */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span>{m.courses} Courses</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{(m.students / 1000).toFixed(1)}k Students</span>
          </div>
        </div>
        <a
          href={m.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-[#0A66C2] transition-colors shrink-0"
        >
          <Linkedin className="w-5 h-5" />
        </a>
      </div>
    </div>
  </div>
);

export default function Mentor() {
  const sliderRef = useRef<any>(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  const sliderSettings = {
    dots: false, infinite: true, speed: 500, autoplay: true, autoplaySpeed: 5000,
    slidesToShow: 3, slidesToScroll: 1, arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">
              Learn from Pakistan's <span className="text-blue-600">Top Educators</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Our curriculum is shaped by leading professors and clinical pharmacists from premier institutions to ensure academic excellence.
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-2 shrink-0">
            <button onClick={() => sliderRef.current?.slickPrev()}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => sliderRef.current?.slickNext()}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Slider */}
        <div className="-mx-3">
          <Slider ref={sliderRef} {...sliderSettings}>
            {mentors.map(m => <MentorCard key={m.name} m={m} />)}
          </Slider>
        </div>

        {/* Professional Call to Action */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-bold text-gray-900 text-lg">Are you a pharmacy expert?</h4>
            <p className="text-gray-600 mt-1">Join our mentor community and help shape the next generation of pharmacists.</p>
          </div>
          <Link href="/contact">
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 font-medium text-sm hover:bg-gray-50 transition-colors cursor-pointer shrink-0">
              Apply to Mentor
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}