"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Calculator, CloudOff } from "lucide-react";
import { TOOL_NAMES } from "../_data/tool-registry";
import { useOnlineStatus } from "./useOnlineStatus";

/**
 * The app bar. The web site wraps calculators in Header/Footer, but those link
 * out to courses, the tournament and the clinical subdomain — none of which
 * ship in the APK. The calculators themselves contain no navigation at all
 * (zero `next/link` imports across all 89), so without this bar a student who
 * opened a tool would have no way back.
 */
export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnline = useOnlineStatus();

  // "/calculation-tools/bmi-calculator/" -> "bmi-calculator"
  const slug = pathname?.match(/^\/calculation-tools\/([^/]+)\/?$/)?.[1];
  const isHome = !slug;
  const title = slug ? (TOOL_NAMES[slug] ?? "Calculator") : "PharmaWallah Calculators";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-md">
        {/* Keeps the bar clear of the status bar / notch on Android. */}
        <div className="h-[env(safe-area-inset-top)]" />
        <div className="flex items-center gap-3 px-3 h-14">
          {isHome ? (
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-white/15 shrink-0">
              <Calculator className="w-5 h-5" />
            </span>
          ) : (
            <Link
              href="/"
              aria-label="Back to all calculators"
              className="grid place-items-center w-9 h-9 rounded-lg bg-white/15 active:bg-white/30 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}

          <h1 className="font-semibold text-base leading-tight truncate flex-1">{title}</h1>

          {!isOnline && (
            <span
              className="flex items-center gap-1 text-[11px] font-medium bg-white/15 rounded-full px-2 py-1 shrink-0"
              title="You are offline. Every calculator still works."
            >
              <CloudOff className="w-3.5 h-3.5" />
              Offline
            </span>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
