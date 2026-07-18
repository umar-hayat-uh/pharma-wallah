// src/components/course/UnitSidebar.tsx
// No "use client" — this has no hooks, so it can be rendered on the
// server even though its parent (UnitPageClient) is a client component.
import Link from "next/link";
import { BookOpen, Zap, Clock, GraduationCap } from "lucide-react";
import { CourseUnit, SubjectMeta } from "@/lib/courses/types";

export default function UnitSidebar({ subject, unit, basePath }: { subject: SubjectMeta; unit: CourseUnit; basePath: string }) {
  return (
    <aside className="hidden lg:block w-52 xl:w-60 flex-shrink-0">
      <div className="sticky top-6 space-y-4">
        <div className={`bg-gradient-to-br ${subject.gradient} rounded-2xl p-4 text-white shadow-lg`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={11} className="opacity-80" />
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{subject.title}</span>
          </div>
          <p className="font-bold text-xs leading-snug mt-1">{subject.semester} · {subject.subjectCode}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
          <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            <BookOpen size={11} /> All Units
          </p>
          <ul className="space-y-0.5">
            {subject.units.map((u) => (
              <li key={u.id}>
                <Link href={`${basePath}/${u.id}`}
                  className={`group flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-all ${u.id === unit.id ? `bg-gradient-to-r ${subject.gradient} text-white font-semibold shadow-sm` : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"}`}>
                  <span>{u.emoji}</span>
                  <span className="flex-1 leading-snug truncate">{u.shortTitle}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Unit Info</p>
          <div className="flex items-center gap-2 text-xs text-gray-600"><Clock size={12} className="text-blue-500 shrink-0" /><span>{unit.readTime} min read</span></div>
          <div className="flex items-center gap-2 text-xs text-gray-600"><GraduationCap size={12} className="text-blue-500 shrink-0" /><span>Difficulty: <strong>{unit.difficulty}</strong></span></div>
        </div>

        <Link href="/dashboard"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl text-xs font-extrabold text-white hover:shadow-md transition-all">
          📊 My Dashboard
        </Link>
      </div>
    </aside>
  );
}