"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Menu, X, LayoutDashboard, BookMarked, LifeBuoy, Folder, ChevronDown, Search, Bell, User,
} from "lucide-react";
import { SEMESTERS, type PageType } from "./dashboard-shared";

const EASE = [0.16, 1, 0.3, 1] as const;

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "guide", label: "User guide", icon: BookMarked },
    { id: "support", label: "Support", icon: LifeBuoy },
] as const;

export function DashboardSidebar({
    sidebarOpen, setSidebarOpen,
    mobileSidebarOpen, setMobileSidebarOpen,
    activePage, setActivePage,
    expandedSemester, setExpandedSemester,
    profileName, currentLevel,
    onOpenSearch, onOpenNotif, unreadNotif,
}: {
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean | ((p: boolean) => boolean)) => void;
    mobileSidebarOpen: boolean;
    setMobileSidebarOpen: (v: boolean) => void;
    activePage: PageType;
    setActivePage: (p: PageType) => void;
    expandedSemester: string | null;
    setExpandedSemester: (v: string | null) => void;
    profileName: string;
    currentLevel: number;
    onOpenSearch: () => void;
    onOpenNotif: () => void;
    unreadNotif: boolean;
}) {
    return (
        <>
            {/* ── Mobile drawer backdrop ── */}
            <AnimatePresence>
                {mobileSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setMobileSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-slate-950/40 dark:bg-black/50 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* ── Sidebar ── */}
            <aside
                className={`fixed lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] inset-y-0 left-0 z-50 bg-white dark:bg-slate-950 border-r border-slate-100 dark:border-slate-800/50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
                    ${sidebarOpen ? "w-72 sm:w-64" : "w-20"} flex flex-col`}
            >
                {/* Logo header */}
                <div className="px-4 flex justify-between items-center h-16 border-b border-slate-100 dark:border-slate-800/50 shrink-0">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center text-white font-black shrink-0 text-sm shadow-sm shadow-cyan-500/20">
                            P
                        </div>
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, ease: EASE }}
                                className="font-extrabold text-[17px] tracking-tight whitespace-nowrap text-slate-900 dark:text-slate-100"
                            >
                                Pharma<span className="text-cyan-600">Wallah</span>
                            </motion.span>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen((v) => !v)}
                        aria-label="Toggle sidebar"
                        className="hidden lg:flex p-1.5 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg transition-colors"
                    >
                        <Menu className="w-4 h-4" />
                    </button>
                    <button onClick={() => setMobileSidebarOpen(false)} aria-label="Close menu"
                        className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                    <div className="space-y-0.5">
                        {sidebarOpen && (
                            <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.15em] mb-2.5 px-3">
                                Menu
                            </p>
                        )}
                        {NAV_ITEMS.map((item) => {
                            const isActive = activePage === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => { setActivePage(item.id as PageType); setMobileSidebarOpen(false); }}
                                    title={!sidebarOpen ? item.label : undefined}
                                    className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
                                        ${isActive
                                            ? "text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        }`}
                                >
                                    {/* Active left accent */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebarAccent"
                                            className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-cyan-600 dark:bg-cyan-500"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-cyan-600 dark:text-cyan-400" : ""}`} />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Course tree */}
                    {sidebarOpen && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/40">
                            <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-[0.15em] mb-2.5 px-3">
                                My courses
                            </p>
                            <div className="space-y-0.5">
                                {Object.entries(SEMESTERS).map(([semKey, semester]) => (
                                    <div key={semKey}>
                                        <button
                                            onClick={() => setExpandedSemester(expandedSemester === semKey ? null : semKey)}
                                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 text-[13px] font-semibold text-slate-600 dark:text-slate-300 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 group"
                                            aria-expanded={expandedSemester === semKey}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <Folder className="w-4 h-4 text-cyan-400 dark:text-cyan-500 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors" />
                                                {semester.label}
                                            </div>
                                            <ChevronDown className={`w-3.5 h-3.5 text-slate-300 dark:text-slate-600 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${expandedSemester === semKey ? "rotate-180" : ""}`} />
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {expandedSemester === semKey && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: EASE }}
                                                    className="ml-[18px] pl-4 border-l border-slate-100 dark:border-slate-800/40 space-y-0.5 mt-0.5 overflow-hidden"
                                                >
                                                    {semester.subjects.map((subj) => (
                                                        <Link
                                                            key={subj.key}
                                                            href={subj.href}
                                                            onClick={() => setMobileSidebarOpen(false)}
                                                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 text-[12px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors duration-150 group/link"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover/link:bg-cyan-400 dark:group-hover/link:bg-cyan-500 transition-colors shrink-0" />
                                                            <span className="truncate">{subj.label}</span>
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>

                {/* Profile footer */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800/40 shrink-0">
                    <div className={`flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-default ${sidebarOpen ? "" : "justify-center"}`}>
                        <div className="relative shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 text-white font-bold flex items-center justify-center text-sm ring-2 ring-cyan-200/50 dark:ring-cyan-800/30">
                                {profileName.charAt(0).toUpperCase()}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950" />
                        </div>
                        {sidebarOpen && (
                            <div className="text-xs min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{profileName}</p>
                                <p className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">Level {currentLevel}</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* ── Mobile bottom tab bar ── */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800/50 px-1 pb-[env(safe-area-inset-bottom)]">
                <div className="grid grid-cols-4 h-[60px]">
                    {[
                        { id: "dashboard", icon: LayoutDashboard, label: "Home", action: () => setActivePage("dashboard") },
                        { id: "search", icon: Search, label: "Search", action: onOpenSearch },
                        { id: "alerts", icon: Bell, label: "Alerts", action: onOpenNotif, badge: unreadNotif },
                        { id: "menu", icon: User, label: "Menu", action: () => setMobileSidebarOpen(true) },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={item.action}
                            className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors duration-200
                                ${item.id === "dashboard" && activePage === "dashboard"
                                    ? "text-cyan-600 dark:text-cyan-400"
                                    : "text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300"
                                }`}
                        >
                            <div className="relative">
                                <item.icon className="w-5 h-5" />
                                {item.badge && (
                                    <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
                                )}
                            </div>
                            <span>{item.label}</span>
                            {/* Active dot */}
                            {item.id === "dashboard" && activePage === "dashboard" && (
                                <motion.div
                                    layoutId="mobileTabDot"
                                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-cyan-600 dark:bg-cyan-400"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </nav>
        </>
    );
}