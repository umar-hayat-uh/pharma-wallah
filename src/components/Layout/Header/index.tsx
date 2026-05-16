"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { headerData } from "../Header/Navigation/menuData";
import Logo from "./Logo";
import {
  Pill,
  FlaskConical,
  Stethoscope,
  Microscope,
  Beaker,
  Leaf,
  BookOpen,
  ChevronDown,
  Menu,
  X,
  Download,
  Smartphone,
} from "lucide-react";

// ─── Type definition for the beforeinstallprompt event ───────────────────────
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ─── Custom hook to handle PWA installation ───────────────────────────────────
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
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener,
      );
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

// ─── Submenu icons ────────────────────────────────────────────────────────────
const SUBMENU_ICONS: Record<string, React.ReactNode> = {
  Material: <BookOpen className="w-4 h-4 text-blue-500" />,
  "MCQ's Bank": <FlaskConical className="w-4 h-4 text-green-500" />,
  "Slide Spotting": <Microscope className="w-4 h-4 text-blue-500" />,
  Flashcards: <Beaker className="w-4 h-4 text-green-500" />,
  "Books Library": <Leaf className="w-4 h-4 text-blue-500" />,
};

// ─── Desktop dropdown ─────────────────────────────────────────────────────────
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
      style={{
        position: "absolute",
        top: "100%",
        left: "50%",
        transform: isOpen
          ? "translateX(-50%) translateY(8px) scale(1)"
          : "translateX(-50%) translateY(4px) scale(0.97)",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "opacity 160ms ease, transform 160ms ease",
        willChange: "opacity, transform",
        marginTop: 4,
        width: 224,
        background: "#fff",
        borderRadius: 16,
        border: "1px solid #f0f0f0",
        boxShadow: "0 8px 28px rgba(37,99,235,0.10)",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg,#2563eb,#4ade80)",
        }}
      />
      <div style={{ padding: "6px 0" }}>
        {item.submenu.map((sub, i) => (
          <Link
            key={i}
            href={sub.href}
            onClick={onClose}
            className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-400 transition-all duration-200">
              {SUBMENU_ICONS[sub.label] ?? (
                <Pill className="w-4 h-4 text-blue-500" />
              )}
            </span>
            <span className="font-medium">{sub.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const Header: React.FC = () => {
  const pathUrl = usePathname();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // PWA installation
  const { isInstallable, install } = useInstallPrompt();

  // ── Auto‑show install banner (only once per device) ─────────────────────────
  useEffect(() => {
    if (!isInstallable) return;

    // Check if user has already dismissed the banner
    const dismissed = localStorage.getItem("installBannerDismissed");
    if (dismissed === "true") return;

    // Show banner after 3 seconds
    const timer = setTimeout(() => {
      setShowInstallBanner(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstallable]);

  const dismissBanner = useCallback(() => {
    setShowInstallBanner(false);
    localStorage.setItem("installBannerDismissed", "true");
  }, []);

  const handleInstall = useCallback(async () => {
    await install();
    dismissBanner(); // hide banner after install attempt
  }, [install, dismissBanner]);

  // ── Sticky ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close mobile on outside click ─────────────────────────────────────────
  useEffect(() => {
    if (!navbarOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      )
        setNavbarOpen(false);
    };
    const t = setTimeout(
      () => document.addEventListener("mousedown", handler),
      10,
    );
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [navbarOpen]);

  // ── Lock body scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", navbarOpen);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [navbarOpen]);

  // ── Close desktop dropdown on outside click ───────────────────────────────
  useEffect(() => {
    if (!openDropdown) return;
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node))
        setOpenDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdown]);

  const isActive = (href: string, submenu?: { href: string }[]) =>
    pathUrl === href || submenu?.some((s) => pathUrl === s.href);

  const openMenu = () => setNavbarOpen(true);
  const closeMenu = () => setNavbarOpen(false);

  return (
    <>
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100/80"
        style={{
          backgroundColor: sticky
            ? "rgba(255,255,255,0.97)"
            : "rgba(255,255,255,0.88)",
          boxShadow: sticky ? "0 2px 20px rgba(37,99,235,0.07)" : "none",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          paddingTop: sticky ? 10 : 14,
          paddingBottom: sticky ? 10 : 14,
          transition:
            "background-color 220ms ease, box-shadow 220ms ease, padding 220ms ease",
          willChange: "background-color",
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
                      onClick={() =>
                        setOpenDropdown(dropOpen ? null : item.label)
                      }
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${active
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-600 hover:text-blue-700 hover:bg-blue-50/60"
                        }`}
                    >
                      {item.label}
                      <ChevronDown
                        className="w-3.5 h-3.5 transition-transform duration-200"
                        style={{
                          transform: dropOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                      {active && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`relative flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-colors duration-150 ${active
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-600 hover:text-blue-700 hover:bg-blue-50/60"
                        }`}
                    >
                      {item.label}
                      {active && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                      )}
                    </Link>
                  )}
                  <DesktopDropdown
                    item={item}
                    isOpen={dropOpen}
                    onClose={() => setOpenDropdown(null)}
                  />
                </div>
              );
            })}
          </nav>

          {/* ── Desktop CTA – no auth buttons for now ── */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Install button (only if installable) */}
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

      {/* ══ INSTALL BANNER (auto‑popup) ═══════════════════════════════════════ */}
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
                  Get a faster, offline‑ready experience by installing our app
                  on your device.
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

      {/* ══ OVERLAY ════════════════════════════════════════════════════════ */}
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

      {/* ══ MOBILE DRAWER ══════════════════════════════════════════════════ */}
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
        <div
          style={{
            height: 4,
            background: "linear-gradient(90deg,#2563eb,#4ade80)",
            flexShrink: 0,
          }}
        />

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

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
          {headerData.map((item, i) => (
            <MobileNavItem
              key={i}
              item={item}
              pathUrl={pathUrl}
              onClose={closeMenu}
            />
          ))}

          {/* Mobile CTA – install button only (no auth) */}
          <div className="mt-4 flex flex-col gap-3">
            {isInstallable && (
              <button
                onClick={handleInstall}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-blue-200 text-blue-600 font-semibold text-sm active:opacity-90 transition-opacity"
                style={{ touchAction: "manipulation" }}
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-blue-50/40 shrink-0">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs text-gray-400">
              Pakistan's #1 Pharmacy eLearning Platform
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

// ─── Mobile nav item ──────────────────────────────────────────────────────────
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
  const isActive =
    pathUrl === item.href || item.submenu?.some((s) => pathUrl === s.href);

  return (
    <div>
      {hasSubmenu ? (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${isActive
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
              maxHeight: open ? 400 : 0,
              overflow: "hidden",
              transition: "max-height 220ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <div className="mt-1.5 ml-3 pl-3 border-l-2 border-blue-100 flex flex-col gap-1 pb-1">
              {item.submenu!.map((sub, j) => {
                const subActive = pathUrl === sub.href;
                return (
                  <Link
                    key={j}
                    href={sub.href}
                    onClick={onClose}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 ${subActive
                        ? "bg-gradient-to-r from-blue-600 to-green-400 text-white font-semibold"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100"
                      }`}
                    style={{ touchAction: "manipulation" }}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${subActive
                          ? "bg-white/20"
                          : "bg-blue-50 border border-blue-100"
                        }`}
                    >
                      {SUBMENU_ICONS[sub.label] ?? (
                        <Pill className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </span>
                    {sub.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <Link
          href={item.href}
          onClick={onClose}
          className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ${isActive
              ? "bg-gradient-to-r from-blue-600 to-green-400 text-white"
              : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
            }`}
          style={{ touchAction: "manipulation" }}
        >
          {item.label}
        </Link>
      )}
    </div>
  );
};

export default Header;