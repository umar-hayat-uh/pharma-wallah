"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, CloudOff, Star } from "lucide-react";
import { CalcDisclaimer } from "@/components/calculators/CalcDisclaimer";
import { cn } from "@/lib/utils";
import { TOOL_NAMES } from "../_data/tool-registry";
import { recordRecent, useLibrary } from "./useLibrary";
import { useOnlineStatus } from "./useOnlineStatus";

/**
 * The app bar for calculator pages. The web site wraps calculators in
 * Header/Footer, but those link out to courses, the tournament and the clinical
 * subdomain — none of which ship in the APK — so without this bar a student
 * who opened a tool would have no way back.
 *
 * The home screen has no app bar: its space hero carries the brand and the
 * search, and the bottom bar handles navigation (ToolHub).
 *
 * Opening a tool records it under Recent; the star saves it. Both live only on
 * the phone (useLibrary).
 *
 * The bar is brandBlue with a slow gradient drift: the same blue as the native
 * launch screen and the WebView background (capacitor.config.ts), so startup
 * reads as one surface.
 */
export default function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnline = useOnlineStatus();
  const { saved, toggleSaved } = useLibrary();

  // "/calculation-tools/bmi-calculator/" -> "bmi-calculator"
  const slug = pathname?.match(/^\/calculation-tools\/([^/]+)\/?$/)?.[1];
  const isHome = !slug;
  const title = slug ? (TOOL_NAMES[slug] ?? "Calculator") : "PharmaWallah";
  const isSaved = !!slug && saved.includes(slug);

  useEffect(() => {
    if (slug) recordRecent(slug);
  }, [slug]);

  if (isHome) return <main className="min-h-screen bg-[#f6f8fb]">{children}</main>;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="pw-space sticky top-0 z-50 shadow-[0_6px_20px_-12px_rgba(15,23,42,0.5)]">
        {/* Keeps the bar clear of the status bar / notch on Android. */}
        <div className="h-[env(safe-area-inset-top)]" />
        <div aria-hidden="true">
          <span className="pw-nebula right-[-10%] top-[-120%] h-32 w-32 bg-sky-400" />
          <span className="pw-star left-[62%] top-[30%]" />
          <span className="pw-star left-[78%] top-[70%]" style={{ animationDelay: "1.4s" }} />
        </div>
        <div className="relative flex h-14 items-center gap-3 px-3">
          <Link
            href="/"
            aria-label="Back to all calculators"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20 transition-transform duration-300 ease-out-expo active:scale-90 active:bg-white/30"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9.5px] font-medium uppercase leading-none tracking-[0.18em] text-white/90">
              PharmaWallah
            </p>
            <h1 className="mt-1 truncate text-[15px] font-semibold leading-tight tracking-[-0.01em]">{title}</h1>
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

          <button
            type="button"
            onClick={() => slug && toggleSaved(slug)}
            aria-pressed={isSaved}
            aria-label={isSaved ? "Remove from saved" : "Save this calculator"}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/20 transition-transform duration-300 ease-out-expo active:scale-90"
          >
            <Star className={cn("h-5 w-5 transition-colors", isSaved && "fill-amber-300 text-amber-300")} />
          </button>
        </div>
      </header>

      <main className="flex-1">
        {children}
        {/* The web mounts this in the (tools) layout, which never reaches the
            app (generated routes re-export the page only) — so the shell
            carries it for every tool page, and only for tool pages. */}
        <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-2">
          <CalcDisclaimer />
        </div>
      </main>
    </div>
  );
}
