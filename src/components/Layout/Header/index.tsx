// Header.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { headerData } from "../Header/Navigation/menuData"; // Update this path if needed
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

// ─── Submenu Icons, Colors & Descriptions ──────────────────────────────────
// Every entry is matched to what the feature actually does, with its own
// accent color so the grid doesn't read as one repeated tile.
const SUBMENU_ICONS: Record<string, React.ReactNode> = {
  Material: <BookOpen className="w-5 h-5" />,
  "MCQ's Bank": <ListChecks className="w-5 h-5" />,
  "Lab Simulation": <TestTube className="w-5 h-5" />,
  "Slide Spotting": <Microscope className="w-5 h-5" />,
  Flashcards: <Layers className="w-5 h-5" />,
  "Pharmacy Counter": <ShoppingCart className="w-5 h-5" />,
  "Compounding Lab": <FlaskConical className="w-5 h-5" />,
  "ADR Detective": <Search className="w-5 h-5" />,
  "Prescription Reader": <FileSearch className="w-5 h-5" />,
  "Books Library": <Library className="w-5 h-5" />,
  "Antibiogram Simulator": <ShieldAlert className="w-5 h-5" />,
  "Molecule Viewer": <Atom className="w-5 h-5" />,
};

const SUBMENU_COLORS: Record<string, { icon: string; bg: string; ring: string }> = {
  Material: { icon: "text-blue-500", bg: "from-blue-50 to-blue-100/40", ring: "group-hover:border-blue-200" },
  "MCQ's Bank": { icon: "text-green-500", bg: "from-green-50 to-green-100/40", ring: "group-hover:border-green-200" },
  "Lab Simulation": { icon: "text-purple-500", bg: "from-purple-50 to-purple-100/40", ring: "group-hover:border-purple-200" },
  "Slide Spotting": { icon: "text-sky-500", bg: "from-sky-50 to-sky-100/40", ring: "group-hover:border-sky-200" },
  Flashcards: { icon: "text-amber-500", bg: "from-amber-50 to-amber-100/40", ring: "group-hover:border-amber-200" },
  "Pharmacy Counter": { icon: "text-orange-500", bg: "from-orange-50 to-orange-100/40", ring: "group-hover:border-orange-200" },
  "Compounding Lab": { icon: "text-teal-500", bg: "from-teal-50 to-teal-100/40", ring: "group-hover:border-teal-200" },
  "ADR Detective": { icon: "text-red-500", bg: "from-red-50 to-red-100/40", ring: "group-hover:border-red-200" },
  "Prescription Reader": { icon: "text-cyan-500", bg: "from-cyan-50 to-cyan-100/40", ring: "group-hover:border-cyan-200" },
  "Books Library": { icon: "text-emerald-500", bg: "from-emerald-50 to-emerald-100/40", ring: "group-hover:border-emerald-200" },
  "Antibiogram Simulator": { icon: "text-rose-500", bg: "from-rose-50 to-rose-100/40", ring: "group-hover:border-rose-200" },
  "Molecule Viewer": { icon: "text-indigo-500", bg: "from-indigo-50 to-indigo-100/40", ring: "group-hover:border-indigo-200" },
};

const SUBMENU_DESCRIPTIONS: Record<string, string> = {
  Material: "Curated curriculum notes & modules.",
  "MCQ's Bank": "Extensive practice question sets.",
  "Lab Simulation": "Interactive 2D & 3D experiments.",
  "Slide Spotting": "Histology and pathology practice.",
  Flashcards: "Quick review with spaced repetition.",
  "Pharmacy Counter": "Virtual retail dispensing training.",
  "Compounding Lab": "Practice pharmaceutical compounding.",
  "ADR Detective": "Spot and analyze adverse drug reactions.",
  "Prescription Reader": "Decipher and analyze Rx forms.",
  "Books Library": "Comprehensive textbook collection.",
  "Antibiogram Simulator": "Analyze resistance patterns.",
  "Molecule Viewer": "Explore 3D chemical structures.",
};

// ─── Three‑Column Desktop Mega‑Dropdown ────────────────────────────────────
const DesktopDropdown = ({
  item,
  isOpen,
  onClose,
}: {
  item: (typeof headerData)[0];
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!item.submenu) return null;

  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 mt-1 bg-white rounded-2xl border border-slate-100 shadow-[0_25px_50px_-15px_rgba(37,99,235,0.18)] overflow-hidden z-50"
      style={{
        width: 780,
        transform: isOpen
          ? "translateX(-50%) translateY(8px) scale(1)"
          : "translateX(-50%) translateY(4px) scale(0.97)",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 220ms ease, transform 220ms ease",
        willChange: "opacity, transform",
      }}
    >
      <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 to-green-400" />

      {/* 3-column CSS Grid */}
      <div className="p-4 grid grid-cols-3 gap-2">
        {item.submenu.map((sub, i) => {
          const colors = SUBMENU_COLORS[sub.label] ?? {
            icon: "text-blue-500",
            bg: "from-blue-50 to-blue-100/40",
            ring: "group-hover:border-blue-200",
          };
          return (
            <Link
              key={i}
              href={sub.href}
              onClick={onClose}
              className="group relative flex items-start gap-3 p-3 rounded-xl overflow-hidden transition-all duration-200 hover:bg-slate-50"
              style={{
                animation: isOpen
                  ? `submenuFadeIn 320ms ease both`
                  : undefined,
                animationDelay: isOpen ? `${i * 25}ms` : undefined,
              }}
            >
              {/* Hover sweep highlight */}
              <span
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <div
                className={`relative shrink-0 w-11 h-11 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:shadow-md ${colors.ring}`}
              >
                <span className={colors.icon}>
                  {SUBMENU_ICONS[sub.label] ?? <Pill className="w-5 h-5 text-blue-500" />}
                </span>
              </div>
              <div className="relative flex flex-col justify-center min-w-0">
                <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors duration-200 truncate">
                  {sub.label}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
                  {SUBMENU_DESCRIPTIONS[sub.label] || "Explore this resource"}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="bg-slate-50/80 border-t border-slate-100 p-3 px-6 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">Press Esc to close</span>
      </div>

      <style jsx>{`
        @keyframes submenuFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// ─── Main Header ────────────────────────────────────────────────────────────
const Header: React.FC = () => {
  const pathUrl = usePathname();
  const router = useRouter();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 60);
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
    pathUrl === href || submenu?.some((s) => pathUrl === s.href);

  const openMenu = () => setNavbarOpen(true);
  const closeMenu = () => setNavbarOpen(false);

  return (
    <>
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      {/* Background is a flat, fully opaque white at all times — no
          translucency, so nothing from the hero section shows through.
          Only the shadow/padding shift slightly once the page is scrolled,
          for a subtle sense of depth. */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100/80 bg-white"
        style={{
          boxShadow: sticky ? "0 2px 20px rgba(37,99,235,0.07)" : "none",
          paddingTop: sticky ? 10 : 14,
          paddingBottom: sticky ? 10 : 14,
          transition: "box-shadow 220ms ease, padding 220ms ease",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Logo />

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-1">
            {headerData.map((item, i) => {
              const active = isActive(item.href, item.submenu);
              const hasSubmenu = Boolean(item.submenu);
              const dropOpen = openDropdown === item.label;

              return (
                <div key={i} className="relative">
                  {hasSubmenu ? (
                    <button
                      onClick={() => setOpenDropdown(dropOpen ? null : item.label)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${active ? "text-blue-700 bg-blue-50" : "text-gray-600 hover:text-blue-700 hover:bg-blue-50/60"
                        }`}
                    >
                      {item.label}
                      <ChevronDown
                        className="w-3.5 h-3.5 transition-transform duration-200"
                        style={{ transform: dropOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                      />
                      {active && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`relative flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${active ? "text-blue-700 bg-blue-50" : "text-gray-600 hover:text-blue-700 hover:bg-blue-50/60"
                        }`}
                    >
                      {item.label}
                      {active && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                      )}
                    </Link>
                  )}
                  <DesktopDropdown item={item} isOpen={dropOpen} onClose={() => setOpenDropdown(null)} />
                </div>
              );
            })}
          </nav>

          {/* ── Desktop Auth CTA ── */}
          <div className="hidden lg:flex items-center gap-3">
            {!authLoading ? (
              user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-700 hover:bg-blue-50/60 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                  >
                    <User className="w-4 h-4" />
                    Sign Up
                  </Link>
                </>
              )
            ) : null}

            {isInstallable && (
              <button
                onClick={handleInstall}
                className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                aria-label="Install app"
                title="Install app"
              >
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={openMenu}
            className="lg:hidden p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 active:bg-blue-100 transition-colors"
            aria-label="Open menu"
            style={{ touchAction: "manipulation" }}
          >
            <Menu className="w-5 h-5" />
          </button>
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

      {/* ── Spacer ── */}
      <div className="h-[64px] lg:h-[68px]" />

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
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${isActive ? "bg-blue-50 text-blue-700 border border-blue-100" : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
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
          className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${isActive ? "bg-gradient-to-r from-blue-600 to-green-400 text-white" : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
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