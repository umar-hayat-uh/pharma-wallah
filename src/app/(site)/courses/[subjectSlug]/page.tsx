import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock, ChevronRight, GraduationCap, Zap, Play, Layers, Sparkles, Trophy } from "lucide-react";
import { SUBJECTS, getSubject } from "@/lib/courses/registry";
import type { Metadata } from "next";

interface Params {
  subjectSlug: string;
}

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subjectSlug: s.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const subject = getSubject(params.subjectSlug);
  if (!subject) return {};
  return {
    title: `${subject.title} | Pharmawallah`,
    description: subject.description,
  };
}

export const revalidate = 3600;

export default function SubjectPage({ params }: { params: Params }) {
  const subject = getSubject(params.subjectSlug);
  if (!subject) notFound();

  const basePath = `/courses/${subject.slug}`;
  const totalReadTime = subject.units.reduce((acc, u) => acc + (u.readTime || 10), 0);

  return (
    <section className="min-h-screen bg-gray-50/80">
      {/* ══ HERO HEADER ══ */}
      <div className={`relative bg-gradient-to-r ${subject.gradient || "from-blue-600 to-indigo-600"} overflow-hidden shadow-xl py-12 sm:py-16 text-white`}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 text-4xl shadow-inner">
            {subject.icon}
          </div>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-white text-xs font-extrabold uppercase tracking-widest mb-3 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5 text-yellow-300" /> {subject.semester} · {subject.subjectCode || "Pharm-D"}
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-3">{subject.title}</h1>
          <p className="text-white/85 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed mb-6">{subject.description}</p>

          <div className="flex items-center justify-center gap-6 text-xs font-bold text-white/80 flex-wrap">
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20">
              <Layers className="w-4 h-4 text-yellow-300" /> {subject.units.length} Unit Modules
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/20">
              <Clock className="w-4 h-4 text-cyan-300" /> ~{totalReadTime} Mins Total Reading
            </span>
          </div>
        </div>
      </div>

      {/* ══ CONTENT BODY ══ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Bar */}
        <div className="flex items-center gap-2 text-xs font-extrabold text-gray-500 mb-8 flex-wrap">
          <Link href="/" className="hover:text-blue-600 transition">Home</Link>
          <ChevronRight size={13} className="text-gray-300" />
          <Link href="/courses" className="hover:text-blue-600 transition">Courses</Link>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-gray-900 font-bold">{subject.title}</span>
        </div>

        {/* Start Unit 1 Primary Callout */}
        {subject.units.length > 0 && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-white/20 font-extrabold text-[10px] uppercase tracking-wider mb-1">
                Start Learning
              </span>
              <h2 className="text-xl sm:text-2xl font-black leading-tight">Unit 1: {subject.units[0].title}</h2>
              <p className="text-white/80 text-xs sm:text-sm mt-1">{subject.units[0].description}</p>
            </div>
            <Link
              href={`${basePath}/${subject.units[0].id}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-blue-700 font-black text-sm shadow-lg hover:-translate-y-0.5 transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-blue-700" /> Begin Unit 1
            </Link>
          </div>
        )}

        {/* Units Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subject.units.map((unit, i) => (
            <Link key={unit.id} href={`${basePath}/${unit.id}`} className="group block">
              <div className="relative h-full rounded-3xl border-2 border-gray-100 bg-white p-5 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl overflow-hidden flex flex-col justify-between">
                <div className={`h-1.5 bg-gradient-to-r ${unit.gradient || subject.gradient} rounded-t-3xl`} />

                <div>
                  {/* Thumbnail Image */}
                  {unit.previewImage && (
                    <img
                      src={unit.previewImage}
                      alt={unit.title}
                      className="w-full h-36 object-cover rounded-2xl border border-gray-100 mb-4 shadow-sm"
                      loading="lazy"
                    />
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 rounded-2xl bg-gray-50 border border-gray-100">{unit.emoji}</span>
                    <span className="text-[11px] font-black text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                      Unit {i + 1}
                    </span>
                  </div>

                  <h3 className="font-black text-gray-900 text-base mb-1.5 leading-snug group-hover:text-blue-600 transition-colors">
                    {unit.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{unit.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-400 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Clock size={13} className="text-blue-500" /> {unit.readTime || 10} min read
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <BookOpen size={13} className="text-emerald-500" /> {unit.difficulty || "Core"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}