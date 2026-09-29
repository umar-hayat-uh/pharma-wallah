"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BR_BASE } from "@/lib/battle-royale/constants";

/**
 * One way back to the event's main menu, under the site header. There used
 * to be a five-tab bar here; players got lost in it, so the menu page is now
 * the hub (2026-09-29). Hidden on the menu itself and on the chromeless apps.
 */
export function EventNav() {
  const pathname = usePathname() ?? "";
  if (pathname === BR_BASE || pathname.startsWith(`${BR_BASE}/battle`) || pathname.startsWith(`${BR_BASE}/admin`)) return null;

  return (
    <nav aria-label="Battle Royale" className="br-no-print relative z-10 border-b border-[#16181d]/10 bg-[#fcfcfa]/95">
      <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link href={BR_BASE} className="inline-flex items-center gap-1 py-3 text-sm font-semibold text-[#1462b0] hover:text-[#0f4f8f]">
          <ChevronLeft className="h-4 w-4" /> Battle Royale menu
        </Link>
      </div>
    </nav>
  );
}
