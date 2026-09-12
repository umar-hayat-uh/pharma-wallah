"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Pill, Sparkles } from "lucide-react";

import { headerData } from "./Navigation/menuData";
import {
  SUBMENU_COLORS,
  SUBMENU_DESCRIPTIONS,
  SUBMENU_ICONS,
} from "./Navigation/menuMeta";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

/*
 * The desktop navigation.
 *
 * Built on Radix's NavigationMenu (via shadcn/ui) rather than the hand-rolled
 * button + outside-click dropdown it replaced, which had no roving focus, no
 * arrow-key support and no aria-expanded. Radix gives all three, plus the
 * open/close animation and the shared viewport that morphs between panels.
 *
 * Each panel is a real mega menu: a featured tile that names the one thing a
 * student should do first, a three-column grid of destinations, and a footer
 * row that goes somewhere. The old panel ended in a strip that said "Press Esc
 * to close", which was 44px of dead space telling the reader nothing.
 */

/** The promoted destination at the head of each panel. */
const FEATURED: Record<
  string,
  { eyebrow: string; title: string; body: string; href: string; cta: string }
> = {
  Resources: {
    eyebrow: "Start here",
    title: "Your semester, already organised",
    body: "Notes, past papers and spotting decks mapped to the Pharm-D syllabus — open the semester you are in.",
    href: "/courses",
    cta: "Open study material",
  },
  "Calculation Tools": {
    eyebrow: "89 calculators",
    title: "Every calculation, worked",
    body: "Dosage, dilution, kinetics and analysis tools. The whole set also ships offline in the Android app.",
    href: "/calculation-tools",
    cta: "Browse all calculators",
  },
};

const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  Resources: [
    { label: "Books library", href: "/books-library" },
    { label: "Flashcards", href: "/flash-cards" },
    { label: "AI Guide", href: "/ai-guide" },
  ],
  "Calculation Tools": [
    { label: "Clinical calculators", href: "/clinical/dose-calculators" },
    { label: "Offline Android app", href: "/download" },
  ],
};

function FeaturedTile({ item }: { item: (typeof FEATURED)[string] }) {
  return (
    <NavigationMenuLink asChild>
      <Link
        href={item.href}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-sky-500 to-green-400 p-5 text-white"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-white/20 blur-2xl transition-transform duration-500 group-hover:scale-125"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            {item.eyebrow}
          </span>
          <p className="mt-4 text-lg font-extrabold leading-snug tracking-tight">{item.title}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-white/85">{item.body}</p>
        </div>
        <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-bold">
          {item.cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

function MenuCard({ label, href }: { label: string; href: string }) {
  const colors = SUBMENU_COLORS[label] ?? {
    icon: "text-blue-500",
    bg: "from-blue-50 to-blue-100/40",
    ring: "group-hover:border-blue-200",
  };
  return (
    <NavigationMenuLink asChild>
      <Link
        href={href}
        className="group relative flex items-start gap-3 overflow-hidden rounded-xl p-2.5 transition-colors hover:bg-slate-50"
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            colors.bg,
          )}
        />
        <span
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md",
            colors.ring,
          )}
        >
          <span className={colors.icon}>
            {SUBMENU_ICONS[label] ?? <Pill className="h-5 w-5 text-blue-500" />}
          </span>
        </span>
        <span className="relative min-w-0">
          <span className="block text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-blue-700">
            {label}
          </span>
          <span className="mt-0.5 block text-xs leading-snug text-slate-500 line-clamp-2">
            {SUBMENU_DESCRIPTIONS[label] || "Explore this resource"}
          </span>
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

export default function MegaMenu({
  isActive,
  onOpenChange,
}: {
  isActive: (href: string, submenu?: { href: string }[]) => boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <NavigationMenu
      className="hidden max-w-none lg:flex"
      delayDuration={80}
      onValueChange={(v) => onOpenChange?.(Boolean(v))}
    >
      <NavigationMenuList>
        {headerData.map((item) => {
          const active = isActive(item.href, item.submenu);

          if (!item.submenu) {
            return (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      active && "bg-blue-50 text-blue-700",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-4 bottom-1 h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-green-400 transition-transform duration-300 ease-out group-hover:scale-x-100"
                    />
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }

          const featured = FEATURED[item.label];
          const footer = FOOTER_LINKS[item.label] ?? [];

          return (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger className={cn(active && "bg-blue-50 text-blue-700")}>
                {item.label}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-4 bottom-1 h-[2px] origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-green-400 transition-transform duration-300 ease-out group-hover:scale-x-100 group-data-[state=open]:scale-x-100"
                />
              </NavigationMenuTrigger>

              <NavigationMenuContent>
                <div className="w-[min(94vw,1020px)]">
                  <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 via-sky-500 to-green-400" />
                  <div className="grid grid-cols-[minmax(0,244px)_minmax(0,1fr)] gap-5 p-5">
                    {featured ? <FeaturedTile item={featured} /> : null}
                    <div className="grid grid-cols-3 gap-1">
                      {item.submenu.map((sub) => (
                        <MenuCard key={sub.label} label={sub.label} href={sub.href} />
                      ))}
                    </div>
                  </div>
                  {footer.length > 0 && (
                    <div className="flex items-center gap-1 border-t border-slate-100 bg-slate-50/70 px-5 py-2.5">
                      <span className="mr-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Also
                      </span>
                      {footer.map((f) => (
                        <NavigationMenuLink asChild key={f.href}>
                          <Link
                            href={f.href}
                            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-white hover:text-blue-700"
                          >
                            {f.label}
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  )}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>

      {/* One viewport for every panel, centred under the bar, so switching
          between Resources and Calculation Tools morphs instead of popping. */}
      <div className="absolute left-1/2 top-full flex -translate-x-1/2 justify-center">
        <NavigationMenuViewport />
      </div>
    </NavigationMenu>
  );
}
