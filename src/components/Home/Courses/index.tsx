"use client";
import { useRef } from "react";
import Slider from "react-slick";
// @ts-ignore
import "slick-carousel/slick/slick.css";
// @ts-ignore
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen, ArrowRight, ChevronLeft, ChevronRight,
  Star, FileText, Download,
  Pill, FlaskConical, Stethoscope, Microscope, Beaker, Leaf,
} from "lucide-react";

// Static background icons with slight adjustments for modern feel
const bgIcons = [
  { Icon: Pill, top: "15%", left: "3%", size: 32, color: "text-blue-500/10" },
  { Icon: Beaker, top: "45%", left: "2%", size: 28, color: "text-emerald-500/10" },
  { Icon: Stethoscope, top: "80%", left: "4%", size: 36, color: "text-blue-500/10" },
  { Icon: Microscope, top: "18%", left: "94%", size: 32, color: "text-emerald-500/10" },
  { Icon: FlaskConical, top: "55%", left: "96%", size: 28, color: "text-blue-500/10" },
  { Icon: Leaf, top: "82%", left: "95%", size: 28, color: "text-emerald-500/10" },
];

const notes = [
  {
    id: 1, img: "/previews/syspharm3/unit1-cns.jpg", title: "Central Nervous System – Complete Notes", rating: 4.9, pages: 48, downloads: 1250, featured: true, slug: "/courses/sem-7/systemic-pharmacology-3/unit1-cns-drugs",
  },
  {
    id: 2, img: "/previews/orgchem/unit1-basics.jpg", title: "Basic Concepts of Organic Chemistry in Pharmacy", rating: 4.8, pages: 32, downloads: 840, featured: false, slug: "/courses/sem-1/pharmaceutical-organic-chemistry/unit1-basic-concepts",
  },
  {
    id: 3, img: "/previews/physpharm/unit6-micromeritics.jpg", title: "Micromeritics & Powder Technology – Key Notes", rating: 5.0, pages: 112, downloads: 2100, featured: true, slug: "/courses/sem-1/physical-pharmacy/unit6-micromeritics",
  },
  {
    id: 4, img: "/previews/pharmaanalysis/unit1-chemical.jpg", title: "Chemical Analysis of Drugs – Essential Notes", rating: 4.9, pages: 64, downloads: 980, featured: true, slug: "/courses/sem-6/pharmaceutical-analysis/unit1-chemical-methods",
  },
  {
    id: 5, img: "/previews/hosppharm/ch2-role.jpg", title: "Role of Hospital Pharmacy – Comprehensive Notes", rating: 4.7, pages: 40, downloads: 620, featured: false, slug: "/courses/sem-7/hospital-pharmacy/chapter2-role-of-pharmacy-in-hospitals",
  },
];

const Stars = ({ r }: { r: number }) => (
  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md w-fit border border-amber-100/50">
    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
    <span className="text-[11px] font-bold text-amber-600">{r.toFixed(1)}</span>
  </div>
);

const Card = ({ n }: { n: typeof notes[0] }) => (
  <div className="px-3 pb-12 pt-4">
    <div className="group relative rounded-3xl bg-white flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100">
      
      {/* Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 shrink-0">
        <Image src={n.img} alt={n.title} quality={75} fill className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        
        {/* Soft vignette overlay so badges pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-80" /> 
        
        {/* Featured badge */}
        {n.featured && (
          <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-white bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
            ★ Featured
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1 relative bg-white">
        {/* Floating gradient line that reveals on hover */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <Stars r={n.rating} />

        <h3 className="mt-3 text-base font-bold text-gray-900 leading-snug line-clamp-2 min-h-[3rem] group-hover:text-blue-600 transition-colors">
          {n.title}
        </h3>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-100/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <FileText className="w-4 h-4 text-gray-400" />
            {n.pages} pages
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <Download className="w-4 h-4 text-gray-400" />
            {n.downloads.toLocaleString()}
          </div>
        </div>

        {/* CTA */}
        <Link href={n.slug} className="mt-6 block w-full">
          <span className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200 transition-all duration-300">
            Read Notes <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>
  </div>
);

export default function Courses() {
  const ref = useRef<any>(null);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="w-full py-28 bg-[#f8fafc] relative overflow-hidden"
    >
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50" />

      {bgIcons.map(({ Icon, top, left, size, color }, i) => (
        <div key={i} className={`absolute pointer-events-none ${color}`} style={{ top, left }}>
          <Icon size={size} strokeWidth={1.5} />
        </div>
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-gray-200 shadow-sm text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Semester Notes
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
              Pharm-D <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Study Material</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              Semester-wise organized notes covering Pharmacology to Clinical Pharmacy — fully aligned with major curriculum standards.
            </p>
          </motion.div>

          {/* Controls */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <button onClick={() => ref.current?.slickPrev()}
              className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:shadow-md transition-all active:scale-95">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => ref.current?.slickNext()}
              className="w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:shadow-md transition-all active:scale-95">
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link href="/courses" className="hidden sm:flex">
              <span className="flex items-center gap-2 px-6 py-3 ml-2 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-blue-600 shadow-md transition-colors duration-300 cursor-pointer">
                View All <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>

        {/* Slider */}
        <div className="-mx-3">
          <Slider
            ref={ref}
            dots={false}
            infinite
            speed={600}
            autoplay
            autoplaySpeed={5000}
            slidesToShow={3}
            slidesToScroll={1}
            arrows={false}
            cssEase="cubic-bezier(0.87, 0, 0.13, 1)"
            responsive={[
              { breakpoint: 1024, settings: { slidesToShow: 2 } },
              { breakpoint: 640, settings: { slidesToShow: 1 } },
            ]}
          >
            {notes.map(n => <Card key={n.id} n={n} />)}
          </Slider>
        </div>
      </div>
    </motion.section>
  );
}