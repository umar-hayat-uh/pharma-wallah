"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Clinical Tools', href: '#tools' },
  { label: 'Pharmacopedia', href: '/encyclopedia' },
  { label: 'Resources', href: '#resources' },
  { label: 'About', href: '/about-us' },
];

export default function ClinicalNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href.startsWith('#')) return false; // Basic handling for hashes
    if (href === '/' && pathname !== '/') return false;
    return pathname?.startsWith(href);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${
          scrolled ? 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-transparent' : 'border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-[68px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#1C7BD9] to-teal-500 flex items-center justify-center shadow-md shadow-[#1C7BD9]/20 group-hover:shadow-lg group-hover:shadow-[#1C7BD9]/30 transition-all duration-300">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900 tracking-tight">PharmaWallah</span>
                <span className="text-xl font-semibold text-teal-600 tracking-tight">Clinical</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'text-[#1C7BD9] bg-blue-50/60'
                        : 'text-slate-600 hover:text-[#1C7BD9] hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="https://academia.pharmawallah.com/"
                className="px-5 py-2.5 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-[#1C7BD9]/30 hover:text-[#1C7BD9] transition-all duration-300"
              >
                Academia
              </a>
              <Link
                href="#tools"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1C7BD9] to-teal-500 text-white font-bold text-sm shadow-md shadow-[#1C7BD9]/20 hover:shadow-lg hover:shadow-[#1C7BD9]/30 transition-all duration-300 active:scale-95"
              >
                Explore Tools
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex lg:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -mr-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1C7BD9]/20 transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Gradient bottom line on scroll */}
        <div
          className={`h-[2px] bg-gradient-to-r from-[#1C7BD9] to-teal-500 transition-opacity duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </header>

      {/* Spacer */}
      <div className="h-16 lg:h-[68px]" />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-80 max-w-[88vw] bg-white shadow-2xl flex flex-col lg:hidden"
            >
              <div className="h-1 bg-gradient-to-r from-[#1C7BD9] to-teal-500" />
              
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-r from-[#1C7BD9] to-teal-500 flex items-center justify-center">
                    <Stethoscope className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-slate-900">Menu</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span className="sr-only">Close menu</span>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <div className="flex flex-col space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                          active
                            ? 'text-[#1C7BD9] bg-blue-50/60'
                            : 'text-slate-700 hover:text-[#1C7BD9] hover:bg-slate-50'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50">
                <a
                  href="https://academia.pharmawallah.com/"
                  className="flex items-center justify-center w-full px-5 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-[#1C7BD9]/30 hover:text-[#1C7BD9] transition-all duration-300"
                >
                  Academia
                </a>
                <Link
                  href="#tools"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center w-full px-5 py-3 rounded-xl bg-gradient-to-r from-[#1C7BD9] to-teal-500 text-white font-bold text-sm shadow-md shadow-[#1C7BD9]/20 active:scale-95 transition-all duration-300"
                >
                  Explore Tools
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}