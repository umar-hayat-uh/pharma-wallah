"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Pill } from "lucide-react";

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
import { BRAND_SURFACE } from "@/components/page-kit/brand";

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
    eyebrow: "Calculators",
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
        // The brand surface (40% scrim over blue→green, white/90 ≈ 5:1) — the
        // user's 2026-09-13 rule replaced the ink tile. Still no blurred orb.
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl p-5 text-white"
        style={{ background: BRAND_SURFACE }}
      >
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-white/50" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-white/90">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {item.eyebrow}
          </span>
          <p className="mt-4 text-[1.35rem] font-bold leading-[1.1] tracking-[-0.03em] [text-wrap:balance]">{item.title}</p>
          <p className="mt-2.5 text-[13px] leading-relaxed text-white/90">{item.body}</p>
        </div>
        <span className="relative mt-6 inline-flex items-center gap-2 text-sm font-semibold">
          {item.cta}
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 transition-[background-color,transform] duration-500 ease-out-expo group-hover:translate-x-0.5 group-hover:bg-white/25">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </span>
      </Link>
    </NavigationMenuLink>
  );
}

/**
 * The mark under a top-level item: an ink hairline that wipes in from the left
 * on hover or while its panel is open, and a brand-blue one that stays put
 * under the section you are in. Replaces a filled blue pill, which on the home
 * page drew the eye to "Home" — the one place the visitor already was.
 */
function NavUnderline({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-4 bottom-0.5 h-[1.5px] origin-left rounded-full transition-transform duration-500 ease-out-expo",
        active
          ? "scale-x-100 bg-primary"
          : "scale-x-0 bg-slate-950 group-hover:scale-x-100 group-data-[state=open]:scale-x-100",
      )}
    />
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
        className="group relative flex items-start gap-3 overflow-hidden rounded-xl p-2.5 transition-colors duration-300 ease-out-expo hover:bg-slate-100/70 focus-visible:bg-slate-100/70"
      >
        {/* Category colour stays on the icon only — it helps scanning — while
            the card itself stays neutral. */}
        <span
          className={cn(
            "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-900/[0.07] bg-white transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5",
            colors.ring,
          )}
        >
          <span className={colors.icon}>
            {SUBMENU_ICONS[label] ?? <Pill className="h-5 w-5 text-blue-500" />}
          </span>
        </span>
        <span className="relative min-w-0">
          <span className="block text-sm font-semibold leading-snug tracking-[-0.01em] text-slate-800 transition-colors group-hover:text-slate-950">
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
      className="hidden max-w-none xl:flex"
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
                      active && "text-slate-950",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                    <NavUnderline active={active} />
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }

          const featured = FEATURED[item.label];
          const footer = FOOTER_LINKS[item.label] ?? [];

          return (
            <NavigationMenuItem key={item.label}>
              <NavigationMenuTrigger className={cn(active && "text-slate-950")}>
                {item.label}
                <NavUnderline active={active} />
              </NavigationMenuTrigger>

              <NavigationMenuContent>
                <div className="w-[min(94vw,1020px)]">
                  <div className="grid grid-cols-[minmax(0,244px)_minmax(0,1fr)] gap-5 p-5">
                    {featured ? <FeaturedTile item={featured} /> : null}
                    <div className="grid grid-cols-3 gap-1">
                      {item.submenu.map((sub) => (
                        <MenuCard key={sub.label} label={sub.label} href={sub.href} />
                      ))}
                    </div>
                  </div>
                  {footer.length > 0 && (
                    <div className="flex items-center gap-1 border-t border-slate-900/[0.06] bg-slate-50/70 px-5 py-2.5">
                      <span className="mr-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-slate-400">
                        Also
                      </span>
                      {footer.map((f) => (
                        <NavigationMenuLink asChild key={f.href}>
                          <Link
                            href={f.href}
                            className="rounded-full px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-white hover:text-slate-950"
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
