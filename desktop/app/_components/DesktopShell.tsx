"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  BookOpenCheck,
  Calculator,
  FlaskConical,
  History,
  LayoutDashboard,
  Ruler,
  Settings,
  Sigma,
  WifiOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The application frame: a fixed navigation rail and one scrolling content
 * pane. This is the difference between "a website in a window" and a desktop
 * program — the rail never scrolls away, and the content pane keeps its own
 * scroll position per section.
 *
 * Kept intentionally small. It renders no calculator logic; it only frames it.
 */

type NavItem = { href: string; label: string; icon: LucideIcon; match: (path: string) => boolean };

const NAV: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (path) => path === "/" || path === "",
  },
  {
    href: "/calculation-tools/",
    label: "Calculators",
    icon: Calculator,
    match: (path) => path.startsWith("/calculation-tools"),
  },
  {
    href: "/values/",
    label: "Values",
    icon: FlaskConical,
    match: (path) => path.startsWith("/values"),
  },
  {
    href: "/formulas/",
    label: "Formulas",
    icon: Sigma,
    match: (path) => path.startsWith("/formulas"),
  },
  {
    href: "/convert/",
    label: "Conversions",
    icon: Ruler,
    match: (path) => path.startsWith("/convert"),
  },
  {
    href: "/history/",
    label: "History",
    icon: History,
    match: (path) => path.startsWith("/history"),
  },
  {
    href: "/settings/",
    label: "Settings",
    icon: Settings,
    match: (path) => path.startsWith("/settings"),
  },
];

export function DesktopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const main = useRef<HTMLElement>(null);

  // A new section starts at the top, the way a desktop application behaves —
  // the pane is a long-lived scroll container, so it would otherwise keep the
  // previous section's offset.
  useEffect(() => {
    main.current?.scrollTo({ top: 0 });
  }, [pathname]);

  /**
   * Every reference link inside a calculator points at a website (FDA labels,
   * CredibleMeds, journal articles). This application is offline by design and
   * has no permission to launch a browser, so rather than letting a click do
   * nothing — or, worse, replace the application's own window with an error
   * page — the URL is copied and the reader is told what happened.
   */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href") ?? "";
      if (!/^https?:\/\//i.test(href)) return;

      event.preventDefault();
      void navigator.clipboard?.writeText(href).catch(() => undefined);
      window.dispatchEvent(new CustomEvent("pw-external-link", { detail: href }));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="pw-desk">
      <nav className="pw-desk__rail" aria-label="Sections" data-print="hide">
        <div className="px-3.5 pb-4 pt-5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-1.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {/* The mark is drawn, not fetched — an <img> would be one more
                asset to resolve at startup for a 28 px logo. */}
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25"
              aria-hidden="true"
            >
              <BookOpenCheck className="h-[18px] w-[18px]" />
            </span>
            <span className="pw-desk__label min-w-0">
              <span className="block truncate text-[15px] font-bold leading-tight tracking-[-0.01em]">
                PharmaWallah
              </span>
              <span className="block truncate text-[11px] leading-tight text-white/75">
                Offline Calculator Suite
              </span>
            </span>
          </Link>
        </div>

        <ul className="flex-1 space-y-1 px-2.5">
          {NAV.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="pw-nav"
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                  <span className="pw-desk__label truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="pw-desk__rail-wide px-4 pb-5 pt-4">
          <p className="flex items-center gap-2 text-[11px] leading-snug text-white/75">
            <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Works with no internet connection
          </p>
          <p className="mt-2 text-[11px] leading-snug text-white/60">
            Educational use only. Check every value against your own reference.
          </p>
        </div>
      </nav>

      <main ref={main} className="pw-desk__main" id="content">
        {children}
      </main>
    </div>
  );
}
