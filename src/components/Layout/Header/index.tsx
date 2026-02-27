"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { headerData } from "../Header/Navigation/menuData";
import Logo from "./Logo";
import HeaderLink from "../Header/Navigation/HeaderLink";
import MobileHeaderLink from "../Header/Navigation/MobileHeaderLink";

const Header: React.FC = () => {
  const pathUrl = usePathname();

  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // sticky header
  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY >= 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // click outside mobile drawer
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        navbarOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node)
      ) {
        setNavbarOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [navbarOpen]);

  // lock scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = navbarOpen ? "hidden" : "";
  }, [navbarOpen]);

  return (
    <>
      {/* HEADER */}
      <header
        className={`top-0 w-full z-50 relative transition-all duration-300   // added relative
    bg-white/70 backdrop-blur-md border-b border-white/40
    ${sticky ? "shadow-md fixed" : ""}`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Logo />

          {/* Desktop nav */}
          <nav className="hidden lg:flex gap-8 items-center">
            {headerData.map((item, i) => (
              <HeaderLink key={i} item={item} />
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/ai-guide"
              className="hidden lg:block bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity shadow-md"
            >
              Expert AI Guide
            </Link>

            {/* mobile toggle */}
            <button
              onClick={() => setNavbarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30"
              aria-label="Open menu"
            >
              <div className="space-y-1">
                <span className="block w-6 h-0.5 bg-gray-800" />
                <span className="block w-6 h-0.5 bg-gray-800" />
                <span className="block w-6 h-0.5 bg-gray-800" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40
        ${navbarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setNavbarOpen(false)}
      />

      {/* MOBILE DRAWER - glass effect */}
      <aside
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-[85%] bg-white/80 backdrop-blur-md border-l border-white/50 z-50
        shadow-xl transition-transform duration-300
        ${navbarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-white/30">
          <Logo />
          <button
            onClick={() => setNavbarOpen(false)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-4">
          {headerData.map((item, i) => (
            <div key={i} onClick={() => setNavbarOpen(false)}>
              <MobileHeaderLink item={item} />
            </div>
          ))}

          <Link
            href="/ai-guide"
            className="mt-4 bg-gradient-to-r from-blue-600 to-green-500 text-white px-4 py-3 rounded-lg text-center font-medium hover:opacity-90 transition-opacity"
            onClick={() => setNavbarOpen(false)}
          >
            Expert AI Guide
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Header;