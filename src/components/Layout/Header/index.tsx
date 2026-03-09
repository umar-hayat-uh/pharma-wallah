"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { headerData } from "../Header/Navigation/menuData";
import Logo from "./Logo";
import {
  Pill, FlaskConical, Stethoscope, Microscope, Beaker,
  Leaf, BookOpen, ChevronDown, Menu, X, Sparkles,
} from "lucide-react";

// ─── Nav item icons for submenu visual flair ─────────────────────────────────
const SUBMENU_ICONS: Record<string, React.ReactNode> = {
  Material:        <BookOpen  className="w-4 h-4 text-blue-500" />,
  "MCQ's Bank":    <FlaskConical className="w-4 h-4 text-green-500" />,
  "Slide Spotting":<Microscope  className="w-4 h-4 text-blue-500" />,
  Flashcards:      <Beaker     className="w-4 h-4 text-green-500" />,
  "Books Library": <Leaf       className="w-4 h-4 text-blue-500" />,
};

// ─── Desktop submenu dropdown ─────────────────────────────────────────────────
const DesktopDropdown = ({
  item,
  isOpen,
  onClose,
}: {
  item: (typeof headerData)[0];
  isOpen: boolean;
  onClose: () => void;
}) => (
  <AnimatePresence>
    {isOpen && item.submenu && (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.97 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-blue-100/40 overflow-hidden z-50"
      >
        {/* gradient top strip */}
        <div className="h-[3px] w-full bg-gradient-to-r from-blue-600 to-green-400" />
        <div className="py-1.5">
          {item.submenu.map((sub, i) => (
            <Link
              key={i}
              href={sub.href}
              onClick={onClose}
              className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-400 transition-all duration-200">
                {SUBMENU_ICONS[sub.label] ?? <Pill className="w-4 h-4 text-blue-500 group-hover:text-white" />}
              </span>
              <span className="font-medium">{sub.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main Header ─────────────────────────────────────────────────────────────
const Header: React.FC = () => {
  const pathUrl = usePathname();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // ── Sticky on scroll ──
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close mobile drawer on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navbarOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setNavbarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [navbarOpen]);

  // ── Lock body scroll when drawer open ──
  useEffect(() => {
    document.body.style.overflow = navbarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [navbarOpen]);

  // ── Close desktop dropdown on outside click ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string, submenu?: { href: string }[]) =>
    pathUrl === href || submenu?.some(s => pathUrl === s.href);

  return (
    <>
      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <motion.header
        ref={headerRef}
        initial={false}
        animate={sticky ? "sticky" : "top"}
        variants={{
          top:    { backgroundColor: "rgba(255,255,255,0.85)", boxShadow: "none",                       paddingTop: "14px", paddingBottom: "14px" },
          sticky: { backgroundColor: "rgba(255,255,255,0.97)", boxShadow: "0 2px 24px rgba(37,99,235,0.08)", paddingTop: "10px",  paddingBottom: "10px" },
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gray-100/80"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Logo />

          {/* ── Desktop Nav ── */}
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
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        active
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-600 hover:text-blue-700 hover:bg-blue-50/60"
                      }`}
                    >
                      {item.label}
                      <motion.span animate={{ rotate: dropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.span>
                      {/* Active indicator dot */}
                      {active && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-blue-600 to-green-400" />}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`relative flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        active
                          ? "text-blue-700 bg-blue-50"
                          : "text-gray-600 hover:text-blue-700 hover:bg-blue-50/60"
                      }`}
                    >
                      {item.label}
                      {active && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gradient-to-r from-blue-600 to-green-400" />}
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

          {/* ── Desktop CTA ── */}
          <div className="hidden lg:flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/ai-guide"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-bold shadow-md shadow-blue-200/50 hover:shadow-blue-300/60 transition-shadow"
              >
                <Sparkles className="w-4 h-4" />
                Expert AI Guide
              </Link>
            </motion.div>
          </div>

          {/* ── Mobile Hamburger ── */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={() => setNavbarOpen(true)}
            className="lg:hidden p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Gradient bottom line */}
        <div className={`absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 to-green-400 transition-opacity duration-300 ${sticky ? "opacity-100" : "opacity-0"}`} />
      </motion.header>

      {/* ── HEADER SPACER (prevents content jump under fixed header) ── */}
      <div className="h-[64px] lg:h-[68px]" />

      {/* ── OVERLAY ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {navbarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setNavbarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── MOBILE DRAWER ────────────────────────────────────────────── */}
      <AnimatePresence>
        {navbarOpen && (
          <motion.aside
            ref={mobileMenuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 h-full w-80 max-w-[88vw] bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Gradient top strip */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-green-400 shrink-0" />

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <Logo />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setNavbarOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-1.5">
              {headerData.map((item, i) => (
                <MobileNavItem
                  key={i}
                  item={item}
                  pathUrl={pathUrl}
                  onClose={() => setNavbarOpen(false)}
                  delay={i * 0.04}
                />
              ))}

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: headerData.length * 0.04 + 0.1 }}
                className="mt-4"
              >
                <Link
                  href="/ai-guide"
                  onClick={() => setNavbarOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  Expert AI Guide
                </Link>
              </motion.div>
            </nav>

            {/* Drawer footer */}
            <div className="px-5 py-4 border-t border-gray-100 bg-blue-50/50 shrink-0">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Pakistan's #1 Pharmacy eLearning Platform</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

// ─── Mobile Nav Item ──────────────────────────────────────────────────────────
const MobileNavItem = ({
  item,
  pathUrl,
  onClose,
  delay,
}: {
  item: (typeof headerData)[0];
  pathUrl: string;
  onClose: () => void;
  delay: number;
}) => {
  const [open, setOpen] = useState(false);
  const hasSubmenu = Boolean(item.submenu);
  const isActive = pathUrl === item.href || item.submenu?.some(s => pathUrl === s.href);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.22, ease: "easeOut" }}
    >
      {hasSubmenu ? (
        <div>
          <button
            onClick={() => setOpen(!open)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
            }`}
          >
            <span>{item.label}</span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="mt-1.5 ml-3 pl-3 border-l-2 border-blue-100 flex flex-col gap-1">
                  {item.submenu!.map((sub, j) => {
                    const subActive = pathUrl === sub.href;
                    return (
                      <Link
                        key={j}
                        href={sub.href}
                        onClick={onClose}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          subActive
                            ? "bg-gradient-to-r from-blue-600 to-green-400 text-white font-semibold"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${subActive ? "bg-white/20" : "bg-blue-50 border border-blue-100"}`}>
                          {SUBMENU_ICONS[sub.label] ?? <Pill className="w-3.5 h-3.5 text-blue-500" />}
                        </span>
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <Link
          href={item.href}
          onClick={onClose}
          className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isActive
              ? "bg-gradient-to-r from-blue-600 to-green-400 text-white"
              : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
          }`}
        >
          {item.label}
        </Link>
      )}
    </motion.div>
  );
};

export default Header;