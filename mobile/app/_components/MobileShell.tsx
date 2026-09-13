"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Calculator, CloudOff } from "lucide-react";
import { CalcDisclaimer } from "@/components/calculators/CalcDisclaimer";
import { TOOL_NAMES } from "../_data/tool-registry";
import { useOnlineStatus } from "./useOnlineStatus";

/**
 * The app bar. The web site wraps calculators in Header/Footer, but those link
 * out to courses, the tournament and the clinical subdomain — none of which
 * ship in the APK. Most calculators contain no navigation of their own, so
 * without this bar a student who opened a tool would have no way back.
 *
 * It stays brandBlue: that is the colour of the native launch screen and the
 * WebView background (capacitor.config.ts), so startup reads as one surface.
 */
export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnline = useOnlineStatus();

  // "/calculation-tools/bmi-calculator/" -> "bmi-calculator"
  const slug = pathname?.match(/^\/calculation-tools\/([^/]+)\/?$/)?.[1];
  const isHome = !slug;
  const title = slug ? (TOOL_NAMES[slug] ?? "Calculator") : "PharmaWallah";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_6px_20px_-12px_rgba(15,23,42,0.5)]">
        {/* Keeps the bar clear of the status bar / notch on Android. */}
        <div className="h-[env(safe-area-inset-top)]" />
        <div className="flex h-14 items-center gap-3 px-3">
          {isHome ? (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20">
              <Calculator className="h-[18px] w-[18px]" />
            </span>
          ) : (
            <Link
              href="/"
              aria-label="Back to all calculators"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20 transition-transform duration-300 ease-out-expo active:scale-90 active:bg-white/30"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}

          <div className="min-w-0 flex-1">
            {/* On a tool, the product name steps down to a label above its title. */}
            {!isHome && (
              <p className="font-mono text-[9.5px] font-medium uppercase leading-none tracking-[0.18em] text-white/65">
                PharmaWallah
              </p>
            )}
            <h1
              className={
                isHome
                  ? "truncate text-[17px] font-bold leading-tight tracking-[-0.02em]"
                  : "mt-1 truncate text-[15px] font-semibold leading-tight tracking-[-0.01em]"
              }
            >
              {title}
            </h1>
          </div>

          {!isOnline && (
            <span
              className="flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ring-white/20"
              title="You are offline. Every calculator still works."
            >
              <CloudOff className="h-3.5 w-3.5" />
              Offline
            </span>
          )}
        </div>
      </header>

      <main className="flex-1">
        {children}
        {/* The web mounts this in the (tools) layout, which never reaches the
            app (generated routes re-export the page only) — so the app bar's
            shell carries it for every tool page, and only for tool pages. */}
        {!isHome && (
          <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-2">
            <CalcDisclaimer />
          </div>
        )}
      </main>
    </div>
  );
}
