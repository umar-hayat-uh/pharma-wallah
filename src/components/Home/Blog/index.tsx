"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar, User, ArrowRight, ArrowUpRight, Pill, FlaskConical,
  Stethoscope, Microscope, Beaker, Leaf, Clock, Sparkles,
} from "lucide-react";

const bgIcons = [
  { Icon: Pill, top: "12%", left: "1.5%", size: 30 },
  { Icon: Beaker, top: "50%", left: "1%", size: 28 },
  { Icon: Stethoscope, top: "84%", left: "1.5%", size: 30 },
  { Icon: Microscope, top: "12%", left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "50%", left: "97%", size: 28 },
  { Icon: Leaf, top: "84%", left: "96.5%", size: 28 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function Badge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
      {label}
    </span>
  );
}

export default function BlogSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data.slice(0, 6) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="w-full py-24 bg-gray-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="w-full py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center text-gray-400 text-sm">
          No blog posts yet. Check back soon!
        </div>
      </section>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <section className="w-full py-24 bg-gray-50/50 relative overflow-hidden">
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="absolute pointer-events-none text-blue-200/40" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-green-400" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
              <Leaf className="w-3.5 h-3.5" /> Our Blog
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              Latest from{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">
                Pharmawallah
              </span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl">
              Insights, tips, and updates from our team of pharmacy educators and professionals.
            </p>
          </div>
          <Link href="/blog">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-green-500 transition cursor-pointer shrink-0 group">
              View All Posts{" "}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Featured */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 group"
          >
            <Link href={`/blog/${featured.slug}`} className="block h-full">
              <div className="relative h-full min-h-[300px] rounded-2xl border border-gray-200 bg-white p-7 flex flex-col hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/20 transition-colors duration-300 pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    <Sparkles className="w-2.5 h-2.5" /> Featured
                  </span>
                  <Badge label={featured.category} />
                </div>

                <h3 className="relative z-10 text-xl font-extrabold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors flex-1">
                  {featured.title}
                </h3>
                <p className="relative z-10 text-sm text-gray-500 leading-relaxed mb-5">{featured.excerpt}</p>

                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {featured.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {featured.readingTime} min
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                    Read <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.article>

          {/* Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {rest.map((p) => (
              <motion.article key={p.slug} variants={item} className="group">
                <Link href={`/blog/${p.slug}`} className="block h-full">
                  <div className="relative h-full rounded-2xl border border-gray-200 bg-white p-5 flex flex-col hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
                    <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/20 transition-colors duration-300 pointer-events-none" />

                    <div className="relative z-10 mb-3">
                      <Badge label={p.category} />
                    </div>

                    <h3 className="relative z-10 text-sm font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                      {p.title}
                    </h3>
                    <p className="relative z-10 text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                      {p.excerpt}
                    </p>

                    <div className="relative z-10 flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-green-400 p-8 sm:p-10"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-white">Never miss a pharmacy update</h3>
              <p className="text-blue-100 text-sm mt-1">
                Join hundreds of pharmacy students & professionals.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 sm:w-56 px-4 py-2.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-0"
              />
              <button className="bg-white text-blue-600 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition flex-shrink-0 shadow-sm">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}