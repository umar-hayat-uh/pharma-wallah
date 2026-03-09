"use client";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity, Leaf, FlaskConical, Stethoscope, Beaker, Microscope,
  TrendingUp, BarChart, Building, Users, ArrowRight,
  Pill, Dna, HeartPulse, Syringe,
} from "lucide-react";

const fields = [
  { name: "Pharmacology",                 Icon: Activity,     desc: "Drug action & mechanisms"             },
  { name: "Pharmacognosy",                Icon: Leaf,         desc: "Natural drug sources"                 },
  { name: "Pharmaceutical Chemistry",     Icon: FlaskConical, desc: "Drug design & synthesis"              },
  { name: "Pharmacy Practice",            Icon: Stethoscope,  desc: "Patient care & dispensing"            },
  { name: "Pharmaceutics",                Icon: Beaker,       desc: "Dosage forms & formulation"           },
  { name: "Pharmaceutical Microbiology",  Icon: Microscope,   desc: "Sterility & contamination control"    },
  { name: "Biopharmaceutics",             Icon: TrendingUp,   desc: "Drug absorption & kinetics"           },
  { name: "Pharmaceutical Analysis",      Icon: BarChart,     desc: "Quality control & testing"            },
  { name: "Hospital Pharmacy",            Icon: Building,     desc: "Institutional medication management"  },
  { name: "Clinical Pharmacy",            Icon: Users,        desc: "Therapeutic optimization"             },
];

const bgIcons = [
  { Icon: Pill,       top: "20%", left: "1.5%",  size: 30, delay: 0   },
  { Icon: HeartPulse, top: "70%", left: "1.5%",  size: 28, delay: 1.2 },
  { Icon: Dna,        top: "20%", left: "96.5%", size: 30, delay: 0.8 },
  { Icon: Syringe,    top: "70%", left: "96.5%", size: 26, delay: 0.4 },
];

export default function Companies() {
  const settings = {
    dots: false, infinite: true, slidesToShow: 4, slidesToScroll: 1,
    arrows: false, autoplay: true, speed: 3500, autoplaySpeed: 0, cssEase: "linear",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 700,  settings: { slidesToShow: 2 } },
      { breakpoint: 480,  settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <section className="w-full py-24 bg-gray-50/50 relative overflow-hidden">
      {bgIcons.map(({ Icon, top, left, size, delay }, i) => (
        <motion.div key={i} className="absolute pointer-events-none text-blue-200"
          style={{ top, left }}
          animate={{ y: [0, -10, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 7, delay, repeat: Infinity, ease: "easeInOut" }}>
          <Icon size={size} strokeWidth={1.4} />
        </motion.div>
      ))}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-green-400" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
            <FlaskConical className="w-3.5 h-3.5" /> Core Disciplines
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight max-w-3xl mx-auto">
            Explore All Areas of{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">Pharmacy</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Comprehensive coverage of all pharmaceutical disciplines, from fundamentals to advanced clinical topics.
          </p>
        </motion.div>

        {/* Slider */}
        <Slider {...settings}>
          {fields.map((f, i) => (
            <div key={i} className="px-3">
              <motion.div whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(37,99,235,0.10)" }}
                transition={{ type: "spring", stiffness: 280 }}
                className="group rounded-2xl border border-gray-200 bg-white p-6 text-center cursor-pointer min-h-[190px] flex flex-col items-center justify-center relative overflow-hidden hover:border-blue-300 transition-all duration-300">
                {/* Top stripe */}
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
                {/* Hover tint */}
                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-colors duration-300 pointer-events-none" />

                <motion.div whileHover={{ scale: 1.1, rotate: 6 }} transition={{ type: "spring", stiffness: 300 }}
                  className="relative z-10 w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-400 transition-all duration-300">
                  <f.Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </motion.div>
                <h3 className="relative z-10 text-sm font-bold text-gray-900 mb-1.5 leading-tight">{f.name}</h3>
                <p className="relative z-10 text-xs text-gray-400">{f.desc}</p>
              </motion.div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}