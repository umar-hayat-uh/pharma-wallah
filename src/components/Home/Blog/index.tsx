"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, ArrowUpRight, Pill, FlaskConical, Stethoscope, Microscope, Beaker, Leaf } from "lucide-react";

const categories = ["Study Tips","Pharmacology","Exam Prep","Calculations","Career","Clinical"] as const;

const posts = [
  { id:1, category:"Study Tips",  title:"Top 5 Study Tips for Pharmacy Students",            excerpt:"Struggling with pharmacology? These proven techniques will help you retain information and ace your exams.", date:"Mar 15, 2025", author:"Dr. Ayesha Khan",  slug:"/blog/study-tips"          },
  { id:2, category:"Pharmacology",title:"Understanding Pharmacokinetics: A Beginner's Guide",  excerpt:"Learn the four key processes of ADME and how they determine drug concentration over time.",               date:"Mar 10, 2025", author:"Dr. Ali Hassan",   slug:"/blog/pharmacokinetics"   },
  { id:3, category:"Exam Prep",   title:"How to Prepare for GPAT 2025",                        excerpt:"A month-by-month strategy to cover the syllabus, practice MCQs, and boost your rank.",                    date:"Mar 5, 2025",  author:"Dr. Fatima Shah",  slug:"/blog/gpat"               },
  { id:4, category:"Calculations",title:"Pharmaceutical Calculations Made Easy",                excerpt:"Master alligation, dilution, and dosage calculations with our step-by-step guide.",                        date:"Feb 28, 2025", author:"Dr. Kamran Ahmed", slug:"/blog/calculations"       },
  { id:5, category:"Career",      title:"Career Paths After Pharm.D",                          excerpt:"Explore clinical, industrial, regulatory, and academic opportunities for pharmacy graduates.",              date:"Feb 20, 2025", author:"Dr. Sana Malik",   slug:"/blog/career"             },
  { id:6, category:"Clinical",    title:"Common Drug Interactions You Must Know",               excerpt:"A quick reference for major drug-drug interactions encountered in clinical practice.",                      date:"Feb 12, 2025", author:"Dr. Ayesha Khan",  slug:"/blog/interactions"       },
];

const bgIcons = [
  { Icon: Pill,        top: "12%", left: "1.5%",  size: 30, delay: 0   },
  { Icon: Beaker,      top: "50%", left: "1%",    size: 28, delay: 1.0 },
  { Icon: Stethoscope, top: "84%", left: "1.5%",  size: 30, delay: 1.4 },
  { Icon: Microscope,  top: "12%", left: "96.5%", size: 30, delay: 0.4 },
  { Icon: FlaskConical,top: "50%", left: "97%",   size: 28, delay: 0.8 },
  { Icon: Leaf,        top: "84%", left: "96.5%", size: 28, delay: 0.6 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } };

const Badge = ({ label }: { label: string }) => (
  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">{label}</span>
);

export default function Blog() {
  const [featured, ...rest] = posts;

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
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
              <Leaf className="w-3.5 h-3.5" /> Our Blog
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Latest from{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">Pharmawallah</span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl">Insights, tips, and updates from our team of pharmacy educators and professionals.</p>
          </div>
          <Link href="/blog">
            <motion.span whileHover={{ x: 4 }} className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-green-500 transition cursor-pointer shrink-0">
              View All Posts <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </motion.div>

        {/* Featured + grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Featured */}
          <motion.article initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="lg:col-span-5 group">
            <Link href={featured.slug} className="block h-full">
              <div className="relative h-full min-h-[320px] rounded-2xl border border-gray-200 bg-white p-7 flex flex-col hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 transition-colors duration-300 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3 mb-6">
                  <Badge label={featured.category} />
                  <span className="text-xs text-gray-400 flex items-center gap-1.5"><Calendar className="w-3 h-3" />{featured.date}</span>
                </div>
                <h3 className="relative z-10 text-2xl font-extrabold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors flex-1">{featured.title}</h3>
                <p className="relative z-10 text-sm text-gray-500 leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400"><User className="w-3.5 h-3.5" />{featured.author}</span>
                  <motion.span whileHover={{ x: 2, y: -2 }} className="flex items-center gap-1 text-sm font-bold text-blue-600">
                    Read More <ArrowUpRight className="w-4 h-4" />
                  </motion.span>
                </div>
              </div>
            </Link>
          </motion.article>

          {/* Grid */}
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rest.map(p => (
              <motion.article key={p.id} variants={item} className="group">
                <Link href={p.slug} className="block h-full">
                  <div className="relative h-full rounded-2xl border border-gray-200 bg-white p-5 flex flex-col hover:border-blue-300 hover:shadow-sm transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
                    <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 transition-colors duration-300 pointer-events-none" />
                    <div className="relative z-10 mb-3"><Badge label={p.category} /></div>
                    <h3 className="relative z-10 text-sm font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">{p.title}</h3>
                    <p className="relative z-10 text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{p.excerpt}</p>
                    <div className="relative z-10 flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400"><Calendar className="w-3 h-3" />{p.date}</span>
                      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>

        {/* Newsletter – fully responsive */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-green-400">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 left-16 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute right-80 top-3 opacity-15 hidden sm:block"><FlaskConical size={36} className="text-white" /></div>
          <div className="absolute right-64 bottom-2 opacity-15 hidden sm:block"><Pill size={28} className="text-white" /></div>
          <div className="relative z-10 p-5 sm:p-7 flex flex-col sm:flex-row items-center gap-5">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-extrabold text-white mb-1">Enjoying our content?</h3>
              <p className="text-blue-100 text-sm">Subscribe to get weekly updates straight to your inbox.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full sm:w-56 px-4 py-2.5 rounded-xl border border-white/30 bg-white/20 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm backdrop-blur"
              />
              <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-blue-600 font-bold text-sm hover:bg-blue-50 shadow-md transition">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}