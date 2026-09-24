// app/spotting/powder-microscopy/test/page.tsx
//
// The powder microscopy spot test was an image-identification test, but none of
// its 24 slide photographs ever existed (public/images/spotting/powder/ was never
// created), so every slide rendered as a broken image and the test could not be
// answered honestly. The old ~970-line test is deleted rather than kept as dead
// code; it is recoverable from git history (HEAD before 2026-09-23). Nothing on
// the site links here any more — this page only catches old bookmarks.

import Link from "next/link";
import { BookOpen, ChevronLeft, Leaf } from "lucide-react";

// Title, description and noindex come from src/lib/seo.ts (STATIC_META).

export default function PowderMicroscopyTestPage() {
  return (
    <section className="min-h-[70vh] bg-white flex items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-400 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Leaf className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          Powder Microscopy Spot Test
        </h1>
        <p className="text-gray-600 leading-relaxed mb-8">
          The powder microscopy spotting test is being rebuilt with new slide
          photographs. Study the lessons in the meantime.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/spotting/powder-microscopy/lessons"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-400 text-white font-extrabold text-sm shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
          >
            <BookOpen className="w-4 h-4" /> Powder Microscopy Lessons
          </Link>
          <Link
            href="/spotting"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-extrabold text-sm hover:border-emerald-300 transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4" /> Spotting Centre
          </Link>
        </div>
      </div>
    </section>
  );
}
