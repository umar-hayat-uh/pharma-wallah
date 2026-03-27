"use client";
import { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen, ArrowRight, ChevronLeft, ChevronRight,
  Star, FileText, Download,
  Pill, FlaskConical, Stethoscope, Microscope, Beaker, Leaf,
} from "lucide-react";

// Static background icons
const bgIcons = [
  { Icon: Pill,        top: "12%", left: "1.5%",  size: 30, color: "text-blue-400/40"  },
  { Icon: Beaker,      top: "50%", left: "1%",    size: 28, color: "text-green-400/40" },
  { Icon: Stethoscope, top: "84%", left: "1.5%",  size: 30, color: "text-purple-400/40" },
  { Icon: Microscope,  top: "12%", left: "96.5%", size: 30, color: "text-amber-400/40"  },
  { Icon: FlaskConical,top: "50%", left: "97%",   size: 28, color: "text-teal-400/40"   },
  { Icon: Leaf,        top: "84%", left: "96.5%", size: 28, color: "text-red-400/40"    },
];

const notes = [
  {
    id: 1,
    img: "/previews/syspharm3/unit1-cns.jpg",
    title: "Central Nervous System – Complete Notes",
    rating: 4.9,
    pages: 48,
    downloads: 1250,
    featured: true,
    slug: "/courses/sem-7/systemic-pharmacology-3/unit1-cns-drugs",
  },
  {
    id: 2,
    img: "/previews/orgchem/unit1-basics.jpg",
    title: "Basic Concepts of Organic Chemistry in Pharmacy",
    rating: 4.8,
    pages: 32,
    downloads: 840,
    featured: false,
    slug: "/courses/sem-1/pharmaceutical-organic-chemistry/unit1-basic-concepts",
  },
  {
    id: 3,
    img: "/previews/physpharm/unit6-micromeritics.jpg",
    title: "Micromeritics & Powder Technology – Key Notes",
    rating: 5.0,
    pages: 112,
    downloads: 2100,
    featured: true,
    slug: "/courses/sem-1/physical-pharmacy/unit6-micromeritics",
  },
  {
    id: 4,
    img: "/previews/pharmaanalysis/unit1-chemical.jpg",
    title: "Chemical Analysis of Drugs – Essential Notes",
    rating: 4.9,
    pages: 64,
    downloads: 980,
    featured: true,
    slug: "/courses/sem-6/pharmaceutical-analysis/unit1-chemical-methods",
  },
  {
    id: 5,
    img: "/previews/hosppharm/ch2-role.jpg",
    title: "Role of Hospital Pharmacy – Comprehensive Notes",
    rating: 4.7,
    pages: 40,
    downloads: 620,
    featured: false,
    slug: "/courses/sem-7/hospital-pharmacy/chapter2-role-of-pharmacy-in-hospitals",
  },
];

const Stars = ({ r }: { r: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(r) ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"}`} />
    ))}
    <span className="ml-1 text-xs font-bold text-amber-500">{r.toFixed(1)}</span>
  </div>
);

const Card = ({ n }: { n: typeof notes[0] }) => (
  <div className="px-3 pb-10">
    <div className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col hover:border-blue-300 hover:shadow-lg transition-all duration-300">
      {/* Top stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-10 bg-gradient-to-r from-blue-600 to-green-400" />

      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden bg-blue-50 shrink-0">
        <Image src={n.img} alt={n.title}  quality={60} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" /> 
        
        {/* Featured badge */}
        {n.featured && (
          <div className="absolute bottom-0 right-0 z-10 px-3 py-1.5 rounded-tl-xl text-[10px] font-extrabold uppercase tracking-wide text-white bg-gradient-to-r from-blue-600 to-green-400">
            ★ Featured
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <Stars r={n.rating} />

        <h3 className="mt-2.5 text-sm font-extrabold text-gray-900 leading-snug line-clamp-2 min-h-[2.6rem] group-hover:text-blue-600 transition-colors">
          {n.title}
        </h3>

        {/* Stats – Notes specific */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            {n.pages} pages
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <Download className="w-3.5 h-3.5 text-blue-400" />
            {n.downloads.toLocaleString()}
          </div>
        </div>

        {/* CTA */}
        <Link href={n.slug} className="mt-4">
          <span className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-green-400 shadow-sm hover:shadow-md transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer">
            Read Notes <ArrowRight className="w-3.5 h-3.5" />
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="w-full py-24 bg-white relative overflow-hidden"
    >
      {bgIcons.map(({ Icon, top, left, size, color }, i) => (
        <div key={i} className={`absolute pointer-events-none ${color}`} style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-green-400" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header – centered */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
            <BookOpen className="w-3.5 h-3.5" /> Semester Notes
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight max-w-3xl mx-auto">
            Pharm-D <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">Study Material</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Semester-wise organized notes for Pharmacology, Pharmaceutics, Pharmaceutical Chemistry, and Clinical Pharmacy — fully aligned with HEC & UOK curriculum.
          </p>
        </motion.div>

        {/* Navigation buttons – centered */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <button onClick={() => ref.current?.slickPrev()}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition bg-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => ref.current?.slickNext()}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition bg-white">
            <ChevronRight className="w-5 h-5" />
          </button>
          <Link href="/courses">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-bold shadow-md transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer">
              View All Notes <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        <Slider
          ref={ref}
          dots={false}
          infinite
          speed={600}
          autoplay
          autoplaySpeed={4000}
          slidesToShow={3}
          slidesToScroll={1}
          arrows={false}
          responsive={[
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 640, settings: { slidesToShow: 1 } },
          ]}
        >
          {notes.map(n => <Card key={n.id} n={n} />)}
        </Slider>
      </div>
    </motion.section>
  );
}