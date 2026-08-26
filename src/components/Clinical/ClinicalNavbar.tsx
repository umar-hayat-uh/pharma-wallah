"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Stethoscope,
    Menu,
    X,
    ChevronDown,
    Calculator,
    Pill,
    Activity,
    FileText
} from 'lucide-react';

interface ToolSubItem {
    label: string;
    href: string;
    description: string;
    icon: React.ElementType;
}

interface NavItem {
    label: string;
    href?: string;
    children?: ToolSubItem[];
}

const CLINICAL_TOOLS: ToolSubItem[] = [
    {
        label: 'Dose Calculator',
        href: '/tools/dose-calculator',
        description: 'Calculate precise pediatric and adult drug dosages.',
        icon: Calculator,
    },
    {
        label: 'Drug Interaction Checker',
        href: '/tools/interactions',
        description: 'Check potential contraindications between meds.',
        icon: Pill,
    },
    {
        label: 'Lab Values Reference',
        href: '/tools/lab-values',
        description: 'Standard reference ranges for clinical lab tests.',
        icon: Activity,
    },
    {
        label: 'Clinical Guidelines',
        href: '/tools/guidelines',
        description: 'Evidence-based clinical protocols and pathways.',
        icon: FileText,
    },
];

const NAV_ITEMS: NavItem[] = [
    { label: 'Home', href: '/clinical' },
    { label: 'Clinical Tools', children: CLINICAL_TOOLS },
    { label: 'Pharmacopedia', href: '/clinical/encyclopedia' },
    { label: 'Resources', href: '/clinical/resources' },
    { label: 'About', href: '/clinical/about' },
];

export default function ClinicalNavbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // State management for dropdowns
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 60);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu & desktop dropdown on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setDropdownOpen(false);
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

    const isActive = (href?: string) => {
        if (!href || href.startsWith('#')) return false;
        if (href === '/' && pathname !== '/') return false;
        return pathname?.startsWith(href);
    };

    const isDropdownActive = (children?: ToolSubItem[]) => {
        return children?.some((child) => pathname?.startsWith(child.href));
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${scrolled
                    ? 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-b border-transparent'
                    : 'border-b border-slate-100'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 lg:h-[68px]">
                        {/* Logo */}
                        <Link href="/clinical" className="flex items-center gap-3 group">
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
                                if (item.children) {
                                    const active = isDropdownActive(item.children);
                                    return (
                                        <div
                                            key={item.label}
                                            ref={dropdownRef}
                                            className="relative"
                                            onMouseEnter={() => setDropdownOpen(true)}
                                            onMouseLeave={() => setDropdownOpen(false)}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setDropdownOpen((prev) => !prev)}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${active || dropdownOpen
                                                    ? 'text-[#1C7BD9] bg-blue-50/60'
                                                    : 'text-slate-600 hover:text-[#1C7BD9] hover:bg-slate-50'
                                                    }`}
                                            >
                                                {item.label}
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''
                                                        }`}
                                                />
                                            </button>

                                            {/* Desktop Dropdown Menu */}
                                            <AnimatePresence>
                                                {dropdownOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                                        className="absolute left-0 top-full pt-2 w-80 z-50"
                                                    >
                                                        <div className="p-2 bg-white rounded-2xl shadow-xl border border-slate-100 ring-1 ring-slate-900/5">
                                                            {item.children.map((child) => {
                                                                const Icon = child.icon;
                                                                const childActive = isActive(child.href);
                                                                return (
                                                                    <Link
                                                                        key={child.href}
                                                                        href={child.href}
                                                                        className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${childActive
                                                                            ? 'bg-blue-50/80 text-[#1C7BD9]'
                                                                            : 'hover:bg-slate-50 text-slate-700'
                                                                            }`}
                                                                    >
                                                                        <div
                                                                            className={`p-2 rounded-lg mt-0.5 ${childActive
                                                                                ? 'bg-[#1C7BD9] text-white'
                                                                                : 'bg-slate-100 text-slate-600'
                                                                                }`}
                                                                        >
                                                                            <Icon className="w-4 h-4" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-semibold text-slate-900">
                                                                                {child.label}
                                                                            </div>
                                                                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                                                {child.description}
                                                                            </p>
                                                                        </div>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                }

                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href!}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${active
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
                                href="/tools"
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
                    className={`h-[2px] bg-gradient-to-r from-[#1C7BD9] to-teal-500 transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'
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
                                        if (item.children) {
                                            const active = isDropdownActive(item.children);
                                            return (
                                                <div key={item.label} className="flex flex-col">
                                                    <button
                                                        type="button"
                                                        onClick={() => setMobileToolsOpen((prev) => !prev)}
                                                        className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-medium transition-colors ${active
                                                            ? 'text-[#1C7BD9] bg-blue-50/60'
                                                            : 'text-slate-700 hover:text-[#1C7BD9] hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        <span>{item.label}</span>
                                                        <ChevronDown
                                                            className={`w-5 h-5 transition-transform duration-200 ${mobileToolsOpen ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                    </button>

                                                    {/* Mobile Collapsible Sub-Items */}
                                                    <AnimatePresence>
                                                        {mobileToolsOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: 'auto' }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden pl-4 pr-2 space-y-1 my-1"
                                                            >
                                                                {item.children.map((child) => {
                                                                    const Icon = child.icon;
                                                                    const childActive = isActive(child.href);
                                                                    return (
                                                                        <Link
                                                                            key={child.href}
                                                                            href={child.href}
                                                                            onClick={() => setMobileMenuOpen(false)}
                                                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${childActive
                                                                                ? 'text-[#1C7BD9] bg-blue-50/80'
                                                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                                                                }`}
                                                                        >
                                                                            <Icon className="w-4 h-4 text-[#1C7BD9]" />
                                                                            {child.label}
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        }

                                        const active = isActive(item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href!}
                                                className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${active
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
                                    href="/tools"
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