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
        className={`top-0 w-full z-40 transition-all duration-300
        bg-white/70 backdrop-blur border-b border-white/40
        ${sticky ? "shadow-md fixed" : ""}`}
      >
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
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
              className="hidden lg:block bg-primary text-white px-6 py-3 rounded-full font-medium hover:opacity-90"
            >
              Expert AI Guide
            </Link>

            {/* mobile toggle */}
            <button
              onClick={() => setNavbarOpen(true)}
              className="lg:hidden p-2"
              aria-label="Open menu"
            >
              <div className="space-y-1">
                <span className="block w-6 h-0.5 bg-black" />
                <span className="block w-6 h-0.5 bg-black" />
                <span className="block w-6 h-0.5 bg-black" />
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

      {/* MOBILE DRAWER */}
      <aside
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-[85%] bg-white z-50
        shadow-xl transition-transform duration-300
        ${navbarOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <Logo />
          <button
            onClick={() => setNavbarOpen(false)}
            className="text-xl"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="p-4 flex flex-col gap-4">
          {headerData.map((item, i) => (
            <div key={i} onClick={() => setNavbarOpen(false)}>
              <MobileHeaderLink
                item={item}
              />
            </div>
          ))}

          <Link
            href="/ai-guide"
            className="mt-4 border border-primary text-primary px-4 py-2 rounded-lg text-center hover:bg-primary hover:text-white"
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
