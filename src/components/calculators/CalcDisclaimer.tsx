import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The "educational purposes only" notice every calculator carries.
 *
 * Mounted from two places rather than from 97 pages, because the two surfaces
 * wrap a tool differently:
 *  - the website, in src/app/(site)/calculation-tools/(tools)/layout.tsx;
 *  - the Android app, in mobile/app/_components/MobileShell.tsx. A web layout
 *    never reaches the APK (the mobile routes re-export the page only), so the
 *    app needs its own mount.
 * Do not also render it inside a tool page, or it appears twice.
 *
 * No `"use client"` and no hooks: it is static text, so the web layout (a
 * server component) renders it into the HTML.
 */
export function CalcDisclaimer({ className }: { className?: string }) {
  return (
    <aside
      role="note"
      aria-label="Educational use disclaimer"
      className={cn(
        "flex gap-3 rounded-2xl border border-amber-300/70 bg-amber-50 px-4 py-3.5 text-amber-950 sm:gap-4 sm:px-5 sm:py-4",
        className,
      )}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-300/70">
        <GraduationCap className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 text-sm leading-relaxed">
        <p className="font-semibold">For educational purposes only</p>
        <p className="mt-0.5 text-amber-900/85">
          PharmaWallah calculators are learning aids for pharmacy students. Results are not a substitute for
          professional judgement, official references or a supervisor&apos;s check — verify every calculation
          independently before using it in the lab, in dispensing or for patient care.
        </p>
      </div>
    </aside>
  );
}
