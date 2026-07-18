"use client";

// src/components/course/MobileUnitNav.tsx
import { useState, useRef, RefObject } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { CourseUnit, SubjectMeta } from "@/lib/courses/types";
import PdfDownloadButton from "./PdfDownloadButton";

interface Props {
  subject: SubjectMeta;
  unit: CourseUnit;
  prevUnit: CourseUnit | null;
  nextUnit: CourseUnit | null;
  basePath: string;
  printRef: RefObject<HTMLDivElement>;
}

export default function MobileUnitNav({ subject, unit, prevUnit, nextUnit, basePath, printRef }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-3 py-2.5 max-w-full">
        <div className="flex items-center gap-1 text-xs text-gray-500 min-w-0 flex-1 mr-2">
          <Link href={basePath} className="hover:text-blue-600 shrink-0 font-medium">{subject.icon} {subject.title.split(" ")[0]}</Link>
          <ChevronRight size={11} className="shrink-0 mx-0.5 text-gray-300" />
          <span className="text-blue-700 font-semibold truncate">{unit.shortTitle}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <PdfDownloadButton
            printRef={printRef}
            fileName={unit.id}
            headerLabel={`PHARMAWALLAH · ${subject.title}`}
            footerLabel={`${unit.title} · pharmawallah.com`}
            gradientClass={unit.gradient}
            variant="icon"
          />
          <button onClick={() => setOpen((v) => !v)}
            className={`p-1.5 rounded-xl border transition-colors ${open ? "bg-gray-900 text-white border-gray-900" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="bg-white border-t border-gray-100 px-3 pb-3 shadow-xl max-h-60 overflow-y-auto">
          <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 pt-2 mb-1.5">All Units</p>
          <ul className="space-y-0.5">
            {subject.units.map((u) => (
              <li key={u.id}>
                <Link href={`${basePath}/${u.id}`} onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition-all ${u.id === unit.id ? `bg-gradient-to-r ${subject.gradient} text-white font-semibold` : "text-gray-700 hover:bg-blue-50"}`}>
                  <span className="shrink-0">{u.emoji}</span>
                  <span className="flex-1 leading-snug truncate">{u.title}</span>
                  {u.id === unit.id && <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full shrink-0">Now</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex border-t border-gray-100">
        {prevUnit ? (
          <Link href={`${basePath}/${prevUnit.id}`}
            className="flex-1 flex items-center gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors min-w-0">
            <ChevronLeft size={13} className="shrink-0" />
            <span className="truncate">{prevUnit.emoji} {prevUnit.shortTitle}</span>
          </Link>
        ) : <div className="flex-1" />}
        {nextUnit && (
          <Link href={`${basePath}/${nextUnit.id}`}
            className="flex-1 flex items-center justify-end gap-1.5 px-3 py-2 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border-l border-gray-100 min-w-0">
            <span className="truncate">{nextUnit.emoji} {nextUnit.shortTitle}</span>
            <ChevronRight size={13} className="shrink-0" />
          </Link>
        )}
      </div>
    </div>
  );
}