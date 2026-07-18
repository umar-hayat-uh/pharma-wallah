// src/app/(site)/courses/[subjectSlug]/page.tsx
// Replaces src/app/(site)/courses/[semesterSlug]/[subjectSlug]/page.tsx

import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import { SUBJECTS, getSubject } from "@/lib/courses/registry";
import type { Metadata } from "next";

interface Params { subjectSlug: string }

export function generateStaticParams() {
  return SUBJECTS.map((s) => ({ subjectSlug: s.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const subject = getSubject(params.subjectSlug);
  if (!subject) return {};
  return { title: `${subject.title} | Pharmawallah`, description: subject.description };
}

export const revalidate = 3600;

export default function SubjectPage({ params }: { params: Params }) {
  const subject = getSubject(params.subjectSlug);
  if (!subject) notFound();

  const basePath = `/courses/${subject.slug}`;

  return (
    <section className="min-h-screen bg-white">
      <div className={`relative bg-gradient-to-r ${subject.gradient} overflow-hidden`}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <span className="text-4xl">{subject.icon}</span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-3 mb-2">{subject.title}</h1>
          <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto">{subject.description}</p>
          <p className="text-white/70 text-xs mt-3">{subject.semester} · {subject.subjectCode}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight size={13} className="text-gray-300" />
          <Link href="/courses" className="hover:text-blue-600">Courses</Link>
          <ChevronRight size={13} className="text-gray-300" />
          <span className="text-gray-800 font-semibold">{subject.title}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subject.units.map((unit, i) => (
            <Link key={unit.id} href={`${basePath}/${unit.id}`} className="group block">
              <div className="relative h-full rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 hover:border-blue-300 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${unit.gradient}`} />
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{unit.emoji}</span>
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Unit {i + 1}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-700 transition-colors">{unit.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{unit.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1"><Clock size={11} /> {unit.readTime} min</span>
                  <span className="flex items-center gap-1"><BookOpen size={11} /> {unit.difficulty}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}