"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { headerData } from "../Header/Navigation/menuData";
import {
  SUBMENU_COLORS,
  SUBMENU_DESCRIPTIONS,
  SUBMENU_ICONS,
} from "../Header/Navigation/menuMeta";
import MegaMenu from "./MegaMenu";
import { Button } from "@/components/ui/button";
import { BRAND_BUTTON, BRAND_BUTTON_HOVER } from "@/components/page-kit/brand";
import Logo from "./Logo";
import {
  Pill,
  FlaskConical,
  Stethoscope,
  Microscope,
  Beaker,
  BookOpen,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Download,
  Smartphone,
  LayoutDashboard,
  LogOut,
  User,
  TestTube,
  ShoppingCart,
  FileSearch,
  ShieldAlert,
  Atom,
  ListChecks,
  Layers,
  Search,
  Library,
  Scale,
  Activity,
  HeartPulse,
  Syringe,
  FlaskRound,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { createClient } from "@/lib/supabase";

// ─── PWA installation hook ─────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function useInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const installPromptEvent = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      installPromptEvent.current = e;
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () =>
      window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  const install = useCallback(async () => {
    if (!installPromptEvent.current) return;
    await installPromptEvent.current.prompt();
    const { outcome } = await installPromptEvent.current.userChoice;
    installPromptEvent.current = null;
    setIsInstallable(false);
  }, []);

  return { isInstallable, install };
}

/**
 * The pill both the Dashboard and Sign-Up CTAs wear.
 *
 * The brand blue→green (the `.pw-brand-btn` class below), not ink: the user's
 * rule of 2026-09-13 is that the theme is the gradient, never a black ground.
 * BRAND_BUTTON's 30% scrim keeps the white label at 4.60:1; hover darkens it.
 */
const CTA_PILL =
  "pw-brand-btn h-9 rounded-full px-4 font-semibold text-white shadow-none hover:shadow-md hover:shadow-[#1C7BD9]/25";

/**
 * The Android app CTA — the one deliberately loud thing in the bar.
 *
 * Asked for on 2026-09-13 ("prominent, catch attention"), then redesigned the
 * same day with the top-design skill after a gradient pill with a ping dot and
 * a looping shine sweep was judged not good enough (scored 4/10: muddy teal
 * under its contrast scrim, stock SaaS tropes, motion with no reason).
 *
 *  - Colour: solid brandGreen with INK text — 7.49:1, so no scrim is needed and
 *    the colour stays clean. In an ink-and-white header it is the only colour,
 *    which is what makes it the loudest control without being the largest.
 *  - Signature detail: the real app icon on a white tile. It reads as "an app"
 *    faster than any phone glyph. Omitted from the compact bar, where the site
 *    logo carrying the same mark sits right beside it.
 *  - Type: the site's instrument language — a mono eyebrow over a bold label.
 *    The eyebrow is ink/75 on green, 5.05:1.
 *  - Motion with a reason: the arrow drops through its tray — a download —
 *    twice, 1.4s after the styles attach, then stops; it repeats on hover. Transform-only, no
 *    infinite loops, nothing under prefers-reduced-motion.
 *
 * Links to /download (install steps + the APK), never to the file directly.
 * No aria-label: the visible words are the accessible name (WCAG 2.5.3).
 */
function DownloadGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <g className="pw-app-arrow">
        <path d="M12 3.5v11" />
        <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      </g>
      <path d="M6 20h12" />
    </svg>
  );
}

const APP_CTA_BASE =
  "pw-app-cta group relative inline-flex shrink-0 items-center bg-[#21B67A] text-[#0b0c0e] ring-1 ring-inset ring-[#0b0c0e]/10 shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_10px_24px_-14px_rgba(22,120,80,.95)] transition-[transform,background-color,box-shadow] duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)] hover:-translate-y-px hover:bg-[#2ac487] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.4),0_14px_28px_-14px_rgba(22,120,80,1)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b0c0e] focus-visible:ring-offset-2";

function AppIconTile({ size }: { size: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-[0_1px_2px_rgba(11,12,14,.18)]"
      style={{ width: size, height: size }}
    >
      <Image src="/icons/icon-96x96.png" alt="" width={96} height={96} className="h-[82%] w-[82%]" />
    </span>
  );
}

function AppCta({ variant, onClick }: { variant: "desktop" | "compact" | "drawer"; onClick?: () => void }) {
  if (variant === "desktop") {
    return (
      <Link href="/download" onClick={onClick} className={`${APP_CTA_BASE} h-11 gap-2 rounded-full p-[5px]`}>
        <AppIconTile size={34} />
        <span className="flex flex-col pr-0.5 leading-none">
          {/* One word: "Android · Offline" made the CTA 220px and squeezed the
              logo from 213px to 189px at every desktop width. */}
          <span className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#0b0c0e]/75">
            Android
          </span>
          <span className="mt-[5px] text-[14px] font-bold tracking-[-0.015em]">Get the app</span>
        </span>
        <span className="pw-brand-btn grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full text-white">
          <DownloadGlyph className="h-[17px] w-[17px]" />
        </span>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href="/download"
        onClick={onClick}
        className={`${APP_CTA_BASE} h-10 gap-2 rounded-full p-1 pr-3.5 max-[359px]:pr-1`}
        style={{ touchAction: "manipulation" }}
      >
        <span className="pw-brand-btn grid h-8 w-8 shrink-0 place-items-center rounded-full text-white">
          <DownloadGlyph className="h-4 w-4" />
        </span>
        {/* Below 360px the label would push the menu button off-screen. */}
        <span className="text-[13px] font-bold tracking-[-0.01em] max-[359px]:sr-only">Get app</span>
      </Link>
    );
  }

  return (
    <Link
      href="/download"
      onClick={onClick}
      className={`${APP_CTA_BASE} w-full gap-3 rounded-2xl p-2.5 hover:translate-y-0`}
      style={{ touchAction: "manipulation" }}
    >
      <AppIconTile size={44} />
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.16em] text-[#0b0c0e]/75">
          Android · Offline
        </span>
        <span className="mt-1 text-[15px] font-bold tracking-[-0.015em]">Get the app</span>
      </span>
      <span className="pw-brand-btn grid h-10 w-10 shrink-0 place-items-center rounded-full text-white">
        <DownloadGlyph className="h-[18px] w-[18px]" />
      </span>
    </Link>
  );
}

// ─── Main Header ────────────────────────────────────────────────────────────
const Header: React.FC = () => {
  const pathUrl = usePathname();
  const router = useRouter();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  // Retracted while the reader is scrolling down through a long page, restored
  // the moment they scroll back up. Never retracted while a menu is open.
  const [retracted, setRetracted] = useState(false);
  // Radix owns the mega menu's open state; the header only needs to know that
  // something is open so it does not retract out from under it.
  const [megaOpen, setMegaOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  // Written directly from the scroll listener — a re-render per scroll frame
  // for a 2px bar would be wasteful.
  const progressRef = useRef<HTMLDivElement>(null);

  const { isInstallable, install } = useInstallPrompt();
  const { user, loading: authLoading } = useSupabaseUser();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // ── Sticky & Banner effects ─────────────────────────────────────────────
  useEffect(() => {
    if (!isInstallable) return;
    const dismissed = localStorage.getItem("installBannerDismissed");
    if (dismissed === "true") return;
    const timer = setTimeout(() => setShowInstallBanner(true), 3000);
    return () => clearTimeout(timer);
  }, [isInstallable]);

  const dismissBanner = useCallback(() => {
    setShowInstallBanner(false);
    localStorage.setItem("installBannerDismissed", "true");
  }, []);

  const handleInstall = useCallback(async () => {
    await install();
    dismissBanner();
  }, [install, dismissBanner]);

  // Read inside the scroll listener without re-subscribing on every state change.
  const menuOpenRef = useRef(false);
  menuOpenRef.current = navbarOpen || megaOpen || openDropdown !== null;

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    // The scrollable range, cached. Reading scrollHeight inside the handler
    // forced a synchronous layout on every scroll event — while the landing
    // page's GSAP was writing transforms in the same frame.
    let max = 0;
    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
    };

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setSticky(y > 60);
      // 4px of slack so a trackpad's jitter does not flap the bar.
      if (menuOpenRef.current || y < 600) setRetracted(false);
      else if (y > last + 4) setRetracted(true);
      else if (y < last - 4) setRetracted(false);
      last = y;

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
    };
    // Several scroll events can fire per frame; do the work once per frame.
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    measure();
    // Page height changes without a resize (images, accordions, route
    // content streaming in), so watch the body as well as the window.
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // ── Close mobile menu on outside click ────────────────────────────────
  useEffect(() => {
    if (!navbarOpen) return;
    const handler = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node))
        setNavbarOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 10);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [navbarOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", navbarOpen);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [navbarOpen]);

  // ── Close dropdown on outside click or Esc ────────────────────────────
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node))
        setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openDropdown) setOpenDropdown(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openDropdown]);

  const isActive = (href: string, submenu?: { href: string }[]) =>
    pathUrl === href || (submenu?.some((s) => pathUrl === s.href) ?? false);

  const openMenu = () => setNavbarOpen(true);
  const closeMenu = () => setNavbarOpen(false);

  return (
    <>
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 border-b ${
          sticky
            ? // Opaque, no backdrop-filter: the blur re-rasterised everything
              // under the fixed bar on every scroll frame, site-wide. Measured
              // 2026-09-13 (80 wheel events, 1440×900): /calculation-tools went
              // from 35 frames >50ms to 7 with the blur off.
              "h-[60px] lg:h-[64px] border-slate-900/[0.07] bg-white"
            : "h-[64px] lg:h-[76px] border-slate-900/[0.05] bg-white"
        }`}
        style={{
          boxShadow: sticky ? "0 12px 32px -28px rgba(11,12,14,0.55)" : "none",
          transform: retracted ? "translateY(-100%)" : "translateY(0)",
          transition:
            "box-shadow 400ms cubic-bezier(.16,1,.3,1), height 300ms cubic-bezier(.16,1,.3,1), transform 380ms cubic-bezier(.16,1,.3,1), background-color 400ms cubic-bezier(.16,1,.3,1), border-color 400ms cubic-bezier(.16,1,.3,1)",
        }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* The logo SVG carries inline width/height:auto, so the override has
              to win on specificity for the bar to have a fixed height. */}
          {/* Pinned from 380px: the brand mark is never the item that gives way
              when the bar is full — the auth cluster's slack absorbs it. On 360px
              and smaller phones there is no slack, so the logo gives a little
              rather than push the menu button into the gutter. */}
          <div
            className={`flex items-center min-[380px]:shrink-0 [&_img]:!w-auto ${
              sticky ? "h-[30px] lg:h-[34px]" : "h-[32px] lg:h-[40px]"
            } [&_img]:!h-full`}
            style={{ transition: "height 300ms cubic-bezier(.16,1,.3,1)" }}
          >
            <Logo />
          </div>

          {/* ── Desktop nav ── */}
          <MegaMenu isActive={isActive} onOpenChange={setMegaOpen} />

          {/* ── Desktop Auth CTA ──
              Desktop nav, this cluster and the compact bar below all switch at
              xl, not lg: from 1024–1279px the six nav items plus the app CTA
              and auth buttons do not fit, and flexbox was crushing the logo
              (to 113px of 214 even before the app CTA; to 6px after it).
              shadcn/ui <Button> so the bar shares the focus ring, disabled
              handling and sizing scale used by the rest of the product. */}
          <div className="hidden xl:flex items-center gap-2">
            {/* Outside the auth branches, so it never waits on the session. */}
            <AppCta variant="desktop" />

            {authLoading ? (
              // Reserve the space instead of collapsing it, or the whole bar
              // reflows the moment the auth session resolves.
              <div aria-hidden="true" className="h-9 w-[172px]" />
            ) : user ? (
              <>
                <Button asChild size="sm" className={CTA_PILL}>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  className="h-9 w-9 rounded-full text-slate-500 hover:bg-slate-100 hover:text-red-600"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="h-9 rounded-full px-4 font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild size="sm" className={CTA_PILL}>
                  <Link href="/signup">
                    Sign Up
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}

            {isInstallable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleInstall}
                aria-label="Install app"
                title="Install app"
                className="h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              >
                <Download className="h-[18px] w-[18px]" />
              </Button>
            )}
          </div>

          {/* ── Mobile: app CTA + hamburger ── */}
          <div className="flex items-center gap-2 xl:hidden">
            <AppCta variant="compact" />
            <Button
              variant="ghost"
              size="icon"
              onClick={openMenu}
              aria-label="Open menu"
              style={{ touchAction: "manipulation" }}
              className="h-10 w-10 rounded-full border border-slate-900/10 bg-white text-slate-900 hover:bg-slate-50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Reading progress. Replaces a decorative gradient line with one that
            says something: how far down this page you are. Only once scrolled. */}
        <div
          aria-hidden="true"
          className="absolute -bottom-px left-0 right-0 h-[2px] overflow-hidden"
          style={{ opacity: sticky ? 1 : 0, transition: "opacity 400ms cubic-bezier(.16,1,.3,1)" }}
        >
          <div ref={progressRef} className="h-full w-full origin-left bg-primary" style={{ transform: "scaleX(0)" }} />
        </div>
      </header>

      {/* ── Spacer ──
          Matches the header's un-scrolled height exactly. It used to be 64/68px
          against an ~88px bar, so the first 20px of every page rendered behind
          the nav. */}
      <div className="h-[64px] lg:h-[76px]" />

      {/* ══ INSTALL BANNER ═══════════════════════════════════════════════════ */}
      {showInstallBanner && (
        <div
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300"
          style={{
            background: "white",
            borderRadius: 24,
            boxShadow: "0 20px 35px -12px rgba(0,0,0,0.2)",
            border: "1px solid #eef2ff",
          }}
        >
          <div className="p-4">
            <div className="flex gap-3">
              <div className="pw-brand-btn shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">Install App</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Get a faster, offline‑ready experience by installing our app on your device.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="pw-brand-btn inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-semibold active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    Install
                  </button>
                  <button
                    onClick={dismissBanner}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button
                onClick={dismissBanner}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        /* The arrow drops through its tray and a fresh one drops in from above,
           with a small overshoot. Every keyframe run starts AND ends on the
           resting arrow with no fill mode, so the glyph is never blank — an
           earlier version filled "both" from a hidden first frame, and since
           this global style attaches at hydration, the arrow sat invisible
           for the whole delay. Two names so hover can restart it (changing
           animation-name restarts an animation; re-applying one does not). */
        @keyframes pwAppDrop {
          0% { transform: translateY(0); opacity: 1; }
          34% { transform: translateY(80%); opacity: 0; }
          35% { transform: translateY(-110%); opacity: 0; }
          78% { transform: translateY(6%); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes pwAppDropHover {
          0% { transform: translateY(0); opacity: 1; }
          34% { transform: translateY(80%); opacity: 0; }
          35% { transform: translateY(-110%); opacity: 0; }
          78% { transform: translateY(6%); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .pw-app-arrow {
          transform-box: fill-box;
          animation: pwAppDrop 1000ms cubic-bezier(.16,1,.3,1) 1.4s 2;
        }
        .pw-app-cta:hover .pw-app-arrow,
        .pw-app-cta:focus-visible .pw-app-arrow {
          animation: pwAppDropHover 800ms cubic-bezier(.16,1,.3,1);
        }
        /* The brand ground for every filled control in the header, drawer and
           mega menu — src/components/page-kit/brand.ts BRAND_BUTTON and its
           hover. A class, not inline style, so :hover and :active can darken
           it; darker only ever raises the white label's contrast. */
        .pw-brand-btn {
          background: ${BRAND_BUTTON};
        }
        .pw-brand-btn:hover,
        .pw-brand-btn:active,
        a:hover > .pw-brand-btn {
          background: ${BRAND_BUTTON_HOVER};
        }
        @media (prefers-reduced-motion: reduce) {
          .pw-app-arrow,
          .pw-app-cta:hover .pw-app-arrow,
          .pw-app-cta:focus-visible .pw-app-arrow { animation: none; }
        }
      `}</style>

      {/* ══ OVERLAY & MOBILE DRAWER ══════════════════════════════════════════ */}
      <div
        onClick={closeMenu}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.38)",
          zIndex: 40,
          opacity: navbarOpen ? 1 : 0,
          pointerEvents: navbarOpen ? "auto" : "none",
          transition: "opacity 200ms ease",
          willChange: "opacity",
        }}
      />

      <aside
        ref={mobileMenuRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: 320,
          maxWidth: "88vw",
          background: "#fff",
          zIndex: 50,
          boxShadow: "-4px 0 32px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: navbarOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 260ms cubic-bezier(0.32,0.72,0,1)",
          willChange: "transform",
        }}
        aria-hidden={!navbarOpen}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <Logo />
          <button
            onClick={closeMenu}
            className="w-8 h-8 rounded-full bg-gray-100 active:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
            aria-label="Close menu"
            style={{ touchAction: "manipulation" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items (accordion for submenus) */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
          {headerData.map((item, i) => (
            <MobileNavItem key={i} item={item} pathUrl={pathUrl} onClose={closeMenu} />
          ))}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <AppCta variant="drawer" onClick={closeMenu} />
          </div>

          {/* Mobile Auth CTA */}
          {!authLoading && (
            <div className="mt-3 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="pw-brand-btn flex items-center justify-center gap-2 w-full py-3 rounded-full text-white font-semibold text-sm"
                    style={{ touchAction: "manipulation" }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm active:bg-gray-100 transition-colors"
                    style={{ touchAction: "manipulation" }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-slate-900/15 text-slate-900 font-semibold text-sm active:bg-slate-100 transition-colors"
                    style={{ touchAction: "manipulation" }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="pw-brand-btn flex items-center justify-center gap-2 w-full py-3.5 rounded-full text-white font-semibold text-sm"
                    style={{ touchAction: "manipulation" }}
                  >
                    Sign Up
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}

              {isInstallable && (
                <button
                  onClick={() => {
                    handleInstall();
                    closeMenu();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-slate-900/15 text-slate-900 font-semibold text-sm active:bg-slate-100 transition-colors"
                  style={{ touchAction: "manipulation" }}
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
              )}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-900/[0.06] shrink-0">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-500">Pharmacy study tools for Pharm-D students</span>
          </div>
        </div>
      </aside>
    </>
  );
};

// ─── MobileNavItem (Accordion) with 3‑Column Grid Design ────────────────────
const MobileNavItem = ({
  item,
  pathUrl,
  onClose,
}: {
  item: (typeof headerData)[0];
  pathUrl: string;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const hasSubmenu = Boolean(item.submenu);
  const isActive = pathUrl === item.href || item.submenu?.some((s) => pathUrl === s.href);

  return (
    <div>
      {hasSubmenu ? (
        <div className="bg-white rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${
              isActive
                ? "bg-slate-100 text-slate-950"
                : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            <span>{item.label}</span>
            <ChevronDown
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          <div
            style={{
              maxHeight: open ? 1000 : 0,
              opacity: open ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 320ms cubic-bezier(0.4,0,0.2,1), opacity 300ms ease",
            }}
          >
            {/* 3-COLUMN GRID UI FOR MOBILE */}
            <div className="mt-2 grid grid-cols-3 gap-2 px-1 pb-2">
              {item.submenu!.map((sub, j) => {
                const colors = SUBMENU_COLORS[sub.label] ?? {
                  icon: "text-blue-500",
                  bg: "from-blue-50 to-blue-100/40",
                  ring: "group-hover:border-blue-200",
                };
                return (
                  <Link
                    key={j}
                    href={sub.href}
                    onClick={onClose}
                    className={`group relative flex flex-col items-center justify-center p-2.5 rounded-2xl gap-1.5 overflow-hidden transition-all duration-300 border border-gray-100 bg-gray-50/50 hover:bg-white ${colors.ring} hover:shadow-sm active:scale-95`}
                    style={{
                      animation: open ? "submenuFadeInMobile 300ms ease both" : undefined,
                      animationDelay: open ? `${j * 20}ms` : undefined,
                    }}
                  >
                    <span
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300`}
                    />
                    <span className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-gray-100 bg-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:shadow-md">
                      <span className={colors.icon}>
                        {SUBMENU_ICONS[sub.label] ?? <Pill className="w-4 h-4 text-blue-500" />}
                      </span>
                    </span>
                    <span className="relative text-[10.5px] font-semibold text-center leading-tight px-0.5 text-gray-600 group-hover:text-blue-700 transition-colors">
                      {sub.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <Link
          href={item.href}
          onClick={onClose}
          className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${
            isActive
              ? "pw-brand-btn text-white"
              : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
          }`}
          style={{ touchAction: "manipulation" }}
        >
          {item.label}
        </Link>
      )}

      <style jsx>{`
        @keyframes submenuFadeInMobile {
          from {
            opacity: 0;
            transform: translateY(4px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Header;