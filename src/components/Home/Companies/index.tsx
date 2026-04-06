"use client";
import React, { useRef } from "react";
import Slider from "react-slick";
import { motion, useInView } from "framer-motion";
import {
  Activity, Leaf, FlaskConical, Stethoscope, Beaker, Microscope,
  TrendingUp, BarChart, Building, Users,
  Pill, Dna, HeartPulse, Syringe, ArrowRight,
} from "lucide-react";

const fields = [
  { name: "Pharmacology",               Icon: Activity,     desc: "Drug action & mechanisms",            color: "from-blue-600 to-blue-400"   },
  { name: "Pharmacognosy",              Icon: Leaf,         desc: "Natural drug sources",                color: "from-green-600 to-green-400" },
  { name: "Pharmaceutical Chemistry",   Icon: FlaskConical, desc: "Drug design & synthesis",             color: "from-blue-500 to-green-400"  },
  { name: "Pharmacy Practice",          Icon: Stethoscope,  desc: "Patient care & dispensing",           color: "from-blue-600 to-blue-500"   },
  { name: "Pharmaceutics",              Icon: Beaker,       desc: "Dosage forms & formulation",          color: "from-green-500 to-blue-400"  },
  { name: "Pharmaceutical Microbiology",Icon: Microscope,   desc: "Sterility & contamination control",   color: "from-blue-500 to-blue-400"   },
  { name: "Biopharmaceutics",           Icon: TrendingUp,   desc: "Drug absorption & kinetics",          color: "from-blue-600 to-green-500"  },
  { name: "Pharmaceutical Analysis",    Icon: BarChart,     desc: "Quality control & testing",           color: "from-green-600 to-blue-500"  },
  { name: "Hospital Pharmacy",          Icon: Building,     desc: "Institutional medication management", color: "from-blue-700 to-blue-500"   },
  { name: "Clinical Pharmacy",          Icon: Users,        desc: "Therapeutic optimization",            color: "from-green-500 to-green-400" },
];

const bgIcons = [
  { Icon: Pill,       top: "18%", left: "2%",   size: 34 },
  { Icon: HeartPulse, top: "55%", left: "1.5%", size: 30 },
  { Icon: Dna,        top: "80%", left: "2%",   size: 28 },
  { Icon: Microscope, top: "18%", left: "96%",  size: 34 },
  { Icon: Syringe,    top: "55%", left: "96%",  size: 28 },
  { Icon: Leaf,       top: "80%", left: "96%",  size: 30 },
];

const DisciplineCard = ({ f }: { f: typeof fields[0] }) => (
  <div className="px-2.5 pb-6">
    <div className="group relative rounded-2xl border border-gray-100 bg-white overflow-hidden
      hover:shadow-xl hover:shadow-blue-100/70 hover:-translate-y-1.5 hover:border-blue-200
      transition-all duration-300 cursor-pointer min-h-[200px] flex flex-col">

      {/* Gradient top bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${f.color} flex-shrink-0`} />

      <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
        {/* Icon circle */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color}
          flex items-center justify-center mb-4 shadow-md
          group-hover:scale-110 transition-transform duration-300`}>
          <f.Icon className="w-6 h-6 text-white" strokeWidth={1.8} />
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-1.5 leading-tight">{f.name}</h3>
        <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>

        {/* Hover reveal arrow */}
        <div className="flex items-center gap-1 text-xs font-semibold text-blue-600
          mt-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
          transition-all duration-200">
          Learn more <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  </div>
);

export default function Companies() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const settings = {
    dots: false, infinite: true, slidesToShow: 4, slidesToScroll: 1,
    arrows: false, autoplay: true, speed: 4000, autoplaySpeed: 0, cssEase: "linear",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 700,  settings: { slidesToShow: 2 } },
      { breakpoint: 480,  settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="relative w-full py-24 overflow-hidden"
      style={{ background: "linear-gradient(170deg, #f8faff 0%, #f0fdf4 50%, #f8faff 100%)" }}>

      {/* Ambient blobs */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.3]"
        style={{ backgroundImage: "radial-gradient(circle, #cbd5e1 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      {/* Top gradient rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/60 to-transparent" />

      {/* Side ambient icons */}
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="absolute pointer-events-none text-blue-200/30" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.3} />
        </div>
      ))}

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-white border border-blue-200/70 shadow-sm mb-6">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
              <FlaskConical className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Core Disciplines</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-5 tracking-tight leading-[1.08]">
            Explore All Areas of{" "}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                Pharmacy
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
                <path d="M0 3 Q50 0 100 3 Q150 6 200 3" stroke="url(#ul2)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="ul2" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#2563eb"/>
                    <stop offset="100%" stopColor="#22c55e"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h2>

          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            Comprehensive coverage of all pharmaceutical disciplines — from foundational science to advanced clinical practice.
          </p>

          {/* Discipline count chips */}
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
              {fields.length} Disciplines
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Full Pharm.D Coverage
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
              Expert-Curated
            </span>
          </div>
        </motion.div>

        {/* Slider with fade edges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative"
        >
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-6 w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, #f8faff, transparent)" }} />
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-6 w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, #f8faff, transparent)" }} />

          <Slider {...settings}>
            {fields.map((f, i) => <DisciplineCard key={i} f={f} />)}
          </Slider>
        </motion.div>

        {/* Second pass — reverse direction */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative mt-0"
        >
          <div className="absolute left-0 top-0 bottom-6 w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to right, #f8faff, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-6 w-16 z-10 pointer-events-none"
            style={{ background: "linear-gradient(to left, #f8faff, transparent)" }} />

          <Slider {...{ ...settings, rtl: true, speed: 3500 }}>
            {[...fields].reverse().map((f, i) => <DisciplineCard key={i} f={f} />)}
          </Slider>
        </motion.div>

      </div>
    </section>
  );
}