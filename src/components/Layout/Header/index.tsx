"use client";

import Link from "next/link";
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
import Logo from "./Logo";
import {
  Pill,
  FlaskConical,
  Stethoscope,
  Microscope,
  Beaker,
  BookOpen,
  ChevronDown,
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

/** The gradient pill both the Dashboard and Sign-Up CTAs wear. */
const CTA_PILL =
  "h-9 rounded-full px-4 font-bold text-white shadow-md transition-all hover:shadow-lg active:scale-95 " +
  "bg-gradient-to-r from-blue-600 via-sky-500 to-green-400 hover:bg-gradient-to-r";

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
    const onScroll = () => {
      const y = window.scrollY;
      setSticky(y > 60);
      // 4px of slack so a trackpad's jitter does not flap the bar.
      if (menuOpenRef.current || y < 600) setRetracted(false);
      else if (y > last + 4) setRetracted(true);
      else if (y < last - 4) setRetracted(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        className={`fixed top-0 left-0 right-0 z-50 border-b border-gray-100/80 ${
          sticky
            ? "h-[60px] lg:h-[64px] bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80"
            : "h-[64px] lg:h-[76px] bg-white"
        }`}
        style={{
          boxShadow: sticky ? "0 10px 30px -26px rgba(10,30,70,0.6)" : "none",
          transform: retracted ? "translateY(-100%)" : "translateY(0)",
          transition:
            "box-shadow 220ms ease, height 300ms cubic-bezier(.16,1,.3,1), transform 380ms cubic-bezier(.16,1,.3,1), background-color 220ms ease",
        }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* The logo SVG carries inline width/height:auto, so the override has
              to win on specificity for the bar to have a fixed height. */}
          <div
            className={`flex items-center [&_img]:!w-auto ${
              sticky ? "h-[30px] lg:h-[34px]" : "h-[32px] lg:h-[40px]"
            } [&_img]:!h-full`}
            style={{ transition: "height 300ms cubic-bezier(.16,1,.3,1)" }}
          >
            <Logo />
          </div>

          {/* ── Desktop nav ── */}
          <MegaMenu isActive={isActive} onOpenChange={setMegaOpen} />

          {/* ── Desktop Auth CTA ──
              shadcn/ui <Button> so the bar shares the focus ring, disabled
              handling and sizing scale used by the rest of the product. */}
          <div className="hidden lg:flex items-center gap-2">
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
                  className="h-9 w-9 rounded-full text-slate-500 hover:bg-red-50 hover:text-red-500"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full text-slate-600 hover:text-blue-700">
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button asChild size="sm" className={CTA_PILL}>
                  <Link href="/signup">
                    <User className="h-4 w-4" />
                    Sign Up
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
                className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100"
              >
                <Download className="h-[18px] w-[18px]" />
              </Button>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openMenu}
            aria-label="Open menu"
            style={{ touchAction: "manipulation" }}
            className="lg:hidden h-10 w-10 rounded-xl border border-blue-100 bg-blue-50 text-blue-600"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Gradient bottom line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background: "linear-gradient(90deg,#2563eb,#4ade80)",
            opacity: sticky ? 1 : 0,
            transition: "opacity 220ms ease",
          }}
        />
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
              <div className="shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-green-400 flex items-center justify-center text-white shadow-sm">
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-95"
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
        {/* Top strip */}
        <div style={{ height: 4, background: "linear-gradient(90deg,#2563eb,#4ade80)", flexShrink: 0 }} />

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

          {/* Mobile Auth CTA */}
          {!authLoading && (
            <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-gray-100">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm shadow-md active:opacity-90 transition-opacity"
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
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-blue-200 text-blue-600 font-semibold text-sm active:opacity-90 transition-opacity"
                    style={{ touchAction: "manipulation" }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm shadow-md active:opacity-90 transition-opacity"
                    style={{ touchAction: "manipulation" }}
                  >
                    <User className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )}

              {isInstallable && (
                <button
                  onClick={() => {
                    handleInstall();
                    closeMenu();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-blue-200 text-blue-600 font-semibold text-sm active:opacity-90 transition-opacity"
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
        <div className="px-5 py-4 border-t border-gray-100 bg-blue-50/40 shrink-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs text-gray-400">Pakistan's #1 Pharmacy eLearning Platform</span>
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
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
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
              ? "bg-gradient-to-r from-blue-600 to-green-400 text-white"
              : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
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