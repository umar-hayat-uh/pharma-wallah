// src/components/dashboard/DashboardMain.tsx
"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, useMotionValue, animate } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
    Menu, Search, Flame, Moon, Sun, RefreshCw, Bell, Play, Star, BookOpen,
    FileText, TrendingUp, Sparkles, ChevronRight, Activity, X,
} from "lucide-react";
import {
    SEMESTERS, QUICK_LINKS, itemVariants, containerVariants, getGreeting,
    type NotificationItem,
} from "./dashboard-shared";

// ── Small local primitives (kept in-file since only used here) ─────────────
function CountUp({ value, duration = 0.9 }: { value: number; duration?: number }) {
    const reduceMotion = useReducedMotion();
    const mv = useMotionValue(0);
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (reduceMotion) { setDisplay(value); return; }
        const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setDisplay(Math.round(v)) });
        return () => controls.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, reduceMotion]);
    return <>{display.toLocaleString()}</>;
}

function CircularProgress({ value, size = 64, stroke = 6, color = "#ffffff", bg = "rgba(255,255,255,0.25)" }: any) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const [offset, setOffset] = useState(circ);
    useEffect(() => {
        const t = setTimeout(() => setOffset(circ * (1 - value / 100)), 300);
        return () => clearTimeout(t);
    }, [value, circ]);
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <span className="absolute text-xs font-bold text-white">{Math.round(value)}%</span>
        </div>
    );
}

// ── Header ───────────────────────────────────────────────────────────────
function DashboardHeader({
    onOpenMobileSidebar, onOpenSearch, currentStreak,
    notifications, notifOpen, onToggleNotif,
    isDark, onToggleDark, onRefresh, refreshing,
}: {
    onOpenMobileSidebar: () => void;
    onOpenSearch: () => void;
    currentStreak: number;
    notifications: NotificationItem[];
    notifOpen: boolean;
    onToggleNotif: () => void;
    isDark: boolean;
    onToggleDark: () => void;
    onRefresh: () => void;
    refreshing: boolean;
}) {
    const reduceMotion = useReducedMotion();
    const hasAlert = notifications[0]?.id !== "all-good";

    return (
        <header className="h-16 px-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <button onClick={onOpenMobileSidebar} aria-label="Open menu" className="lg:hidden p-2 text-slate-500 dark:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg -ml-1">
                    <Menu className="w-5 h-5" />
                </button>
                <button
                    onClick={onOpenSearch}
                    className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-pointer w-64 hover:border-indigo-300 dark:hover:border-indigo-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                    <Search className="w-4 h-4" />
                    <span className="text-xs">Search courses & tools</span>
                    <kbd className="ml-auto text-[9px] px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400">⌘K</kbd>
                </button>
                <span className="md:hidden font-bold text-sm text-slate-800 dark:text-slate-100">Dashboard</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3">
                <button onClick={onOpenSearch} aria-label="Open search" className="md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition">
                    <Search className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-900/50">
                    <motion.div animate={reduceMotion ? {} : { scale: currentStreak > 0 ? [1, 1.15, 1] : 1 }} transition={{ repeat: Infinity, duration: 2 }}>
                        <Flame className="w-4 h-4 text-amber-500" />
                    </motion.div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{currentStreak || 0}</span>
                </div>

                <div className="relative hidden sm:block">
                    <button onClick={onToggleNotif} aria-label="Notifications" className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                        <Bell className="w-4 h-4" />
                        {hasAlert && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    </button>
                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                transition={{ duration: 0.18 }}
                                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50"
                            >
                                <p className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1.5">Notifications</p>
                                <div className="space-y-1">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                            <n.icon className={`w-4 h-4 mt-0.5 shrink-0 ${n.tone}`} />
                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{n.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button onClick={onToggleDark} aria-label="Toggle dark mode" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button onClick={onRefresh} aria-label="Refresh progress" className="hidden xs:inline-flex p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                    <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-600" : ""}`} />
                </button>
            </div>
        </header>
    );
}

// ── Continue-learning hero ──────────────────────────────────────────────
function ContinueLearningHero({
    profileName, currentStreak, continueUnit, currentLevel, levelProgress, xpToNextLevel,
}: any) {
    return (
        <motion.div
            variants={itemVariants}
            className="relative bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-white shadow-lg overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6"
        >
            <div className="relative z-10 max-w-xl w-full">
                <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 sm:mb-4 border border-white/20">
                    Academic progress
                </span>
                <h1 className="text-xl sm:text-3xl font-black tracking-tight mb-2 sm:mb-3">
                    {getGreeting()}, {profileName}.
                </h1>
                <p className="text-xs sm:text-sm text-indigo-100 font-medium mb-5 sm:mb-6">
                    {currentStreak > 0
                        ? `You're on a ${currentStreak}-day study streak. Keep it going!`
                        : "Start a module today to kick off a new study streak."}
                </p>
                {continueUnit ? (
                    <Link
                        href={`/courses/${continueUnit.semester}/${continueUnit.subject}/${continueUnit.unit_id}`}
                        className="inline-flex bg-white text-indigo-700 px-5 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-indigo-50 transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
                    >
                        <Play className="w-4 h-4" /> Resume: {continueUnit.unit_title || continueUnit.unit_id}
                    </Link>
                ) : (
                    <Link href="/courses" className="inline-flex bg-white text-indigo-700 px-5 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-indigo-50 transition shadow-sm">
                        <Play className="w-4 h-4" /> Browse courses
                    </Link>
                )}
            </div>
            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-4 sm:p-5 rounded-2xl flex flex-col items-center shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-100 mb-2">Level</p>
                <CircularProgress value={levelProgress} size={68} stroke={5} color="#ffffff" />
                <p className="text-base font-black mt-2">Lvl {currentLevel}</p>
                <p className="text-[10px] text-indigo-200 mt-1 whitespace-nowrap">{xpToNextLevel > 0 ? `${xpToNextLevel} XP to go` : "Max tier"}</p>
            </div>
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        </motion.div>
    );
}

// ── Stats grid ───────────────────────────────────────────────────────────
function StatCard({ label, value, suffix = "", icon: Icon, tone, subtitle }: any) {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-none dark:hover:border-slate-700 transition-all"
        >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
                <div className={`p-2 sm:p-2.5 rounded-xl ${tone.bg}`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${tone.text}`} />
                </div>
            </div>
            <div className="text-xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight tabular-nums">
                <CountUp value={value} />{suffix}
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-500 mt-1 truncate">{subtitle}</p>
        </motion.div>
    );
}

// ── 30-day study calendar ───────────────────────────────────────────────
function StudyCalendar({ activities }: { activities: any[] }) {
    const { weeks, rangeLabel, activeDaysCount } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const rangeStart = new Date(today);
        rangeStart.setDate(rangeStart.getDate() - 29);
        const counts: Record<string, number> = {};
        (activities || []).forEach((a: any) => {
            const d = new Date(a.timestamp);
            d.setHours(0, 0, 0, 0);
            const key = d.toISOString().split("T")[0];
            counts[key] = (counts[key] || 0) + 1;
        });
        const days: any[] = [];
        for (let i = 0; i < 30; i++) {
            const d = new Date(rangeStart);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().split("T")[0];
            days.push({ date: d, key, count: counts[key] || 0, isToday: key === today.toISOString().split("T")[0] });
        }
        const leadingBlanks = Array(days[0].date.getDay()).fill(null);
        const cells = [...leadingBlanks, ...days];
        while (cells.length % 7 !== 0) cells.push(null);
        const weeks: any[][] = [];
        for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
        const rangeLabel = `${rangeStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${today.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
        const activeDaysCount = days.filter((d) => d.count > 0).length;
        return { weeks, rangeLabel, activeDaysCount };
    }, [activities]);

    const getFill = (count: number) => {
        if (count === 0) return "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600";
        if (count <= 2) return "bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200";
        if (count <= 5) return "bg-indigo-400 dark:bg-indigo-600 text-white";
        return "bg-indigo-600 dark:bg-indigo-400 text-white dark:text-indigo-950";
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-600" /> Study calendar
                </h3>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">{rangeLabel}</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">{activeDaysCount} active day{activeDaysCount === 1 ? "" : "s"} · last 30 days</p>
            <div className="flex justify-center">
                <div className="min-w-[245px]">
                    <div className="grid gap-0.5 mb-1" style={{ gridTemplateColumns: "repeat(7, 1.75rem)" }}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
                            <div key={label} className="text-center text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase w-7 h-5 flex items-center justify-center">{label[0]}</div>
                        ))}
                    </div>
                    <div className="space-y-0.5">
                        {weeks.map((week, wi) => (
                            <div key={wi} className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(7, 1.75rem)" }}>
                                {week.map((day, di) => (
                                    <motion.div
                                        key={day ? day.key : `blank-${wi}-${di}`}
                                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.2, delay: Math.min((wi * 7 + di) * 0.01, 0.25) }}
                                        className="group relative w-7 h-7"
                                    >
                                        {day && (
                                            <>
                                                <div className={`w-full h-full rounded-[5px] flex items-center justify-center text-[8px] font-bold transition-all hover:scale-110 ${getFill(day.count)} ${day.isToday ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900" : ""}`}>
                                                    {day.date.getDate()}
                                                </div>
                                                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-slate-800 text-white text-[9px] py-1 px-2 rounded z-50">
                                                    {day.count} action{day.count === 1 ? "" : "s"} · {day.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Weekly bar chart ─────────────────────────────────────────────────────
function WeeklyChart({ data }: { data: { day: string; count: number }[] }) {
    const reduceMotion = useReducedMotion();
    return (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500" /> Weekly overview
            </h3>
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#64748b" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#64748b" }} allowDecimals={false} width={20} />
                        <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "11px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={!reduceMotion}>
                            {data.map((entry, index) => <Cell key={index} fill={entry.count > 0 ? "#4f46e5" : "#cbd5e1"} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ── Search modal ─────────────────────────────────────────────────────────
function SearchModal({ open, query, onQueryChange, onClose }: { open: boolean; query: string; onQueryChange: (v: string) => void; onClose: () => void }) {
    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        const allSubjects = Object.values(SEMESTERS).flatMap((s) => s.subjects);
        const combined = [...allSubjects.map((s) => ({ label: s.label, href: s.href, icon: s.icon, group: "Courses" })), ...QUICK_LINKS];
        if (!q) return combined.slice(0, 6);
        return combined.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
    }, [query]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] flex items-start justify-center pt-[8vh] sm:pt-[10vh] bg-slate-900/50 backdrop-blur-sm px-3 sm:px-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                    >
                        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                            <Search className="w-5 h-5 text-slate-400 shrink-0" />
                            <input autoFocus type="text" value={query} onChange={(e) => onQueryChange(e.target.value)}
                                placeholder="Search courses, units, or tools..."
                                className="w-full bg-transparent border-none outline-none px-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400" />
                            <button onClick={onClose} className="sm:hidden text-slate-400 p-1"><X className="w-4 h-4" /></button>
                            <kbd className="hidden sm:inline text-[9px] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">ESC</kbd>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-1">
                            <p className="text-[9px] font-bold uppercase text-slate-400 px-1 mb-1">{query ? `Results (${results.length})` : "Suggestions"}</p>
                            {results.length === 0 ? (
                                <p className="text-xs text-slate-400 px-1 py-6 text-center">No matches for &quot;{query}&quot;</p>
                            ) : (
                                results.map((item, i) => (
                                    <Link key={`${item.href}-${i}`} href={item.href} onClick={onClose}
                                        className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer flex items-center gap-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                                        <item.icon className="w-4 h-4 text-indigo-600 shrink-0" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                                        <span className="ml-auto text-[10px] text-slate-400 shrink-0">{item.group}</span>
                                    </Link>
                                ))
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Public component ─────────────────────────────────────────────────────
export function DashboardMain({
    profileName, currentStreak, continueUnit, currentLevel, levelProgress, xpToNextLevel,
    totalXP, unitsCompleted, quizCount, avgQuizScore,
    recentActivity, weeklyData, incompleteUnits,
    onOpenMobileSidebar, notifications, notifOpen, onToggleNotif,
    isDark, onToggleDark, onRefresh, refreshing,
    searchOpen, searchQuery, onSearchQueryChange, onOpenSearch, onCloseSearch,
}: any) {
    return (
        <>
            <DashboardHeader
                onOpenMobileSidebar={onOpenMobileSidebar} onOpenSearch={onOpenSearch} currentStreak={currentStreak}
                notifications={notifications} notifOpen={notifOpen} onToggleNotif={onToggleNotif}
                isDark={isDark} onToggleDark={onToggleDark} onRefresh={onRefresh} refreshing={refreshing}
            />

            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4 sm:space-y-6 p-4 sm:p-8 max-w-6xl mx-auto">
                <ContinueLearningHero
                    profileName={profileName} currentStreak={currentStreak} continueUnit={continueUnit}
                    currentLevel={currentLevel} levelProgress={levelProgress} xpToNextLevel={xpToNextLevel}
                />

                <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard label="XP earned" value={totalXP} icon={Star} subtitle="Total experience"
                        tone={{ bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600" }} />
                    <StatCard label="Units read" value={unitsCompleted} icon={BookOpen} subtitle="Modules mastered"
                        tone={{ bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-600" }} />
                    <StatCard label="Quizzes" value={quizCount} icon={FileText} subtitle="Completed"
                        tone={{ bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-600" }} />
                    <StatCard label="Quiz avg" value={avgQuizScore} suffix="%" icon={TrendingUp}
                        subtitle={quizCount ? "All attempts" : "Take a quiz"}
                        tone={{ bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600" }} />
                </motion.div>

                <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <StudyCalendar activities={recentActivity} />
                    <WeeklyChart data={weeklyData} />
                </motion.div>

                {incompleteUnits.length > 0 && (
                    <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2 text-sm">
                            <Sparkles className="w-4 h-4 text-amber-500" /> Recommended for you
                        </h3>
                        <div className="space-y-2">
                            {incompleteUnits.map((u: any) => (
                                <Link key={u.unit_id} href={`/courses/${u.semester}/${u.subject}/${u.unit_id}`}
                                    className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
                                    <span className="truncate pr-2">Finish: {u.unit_title || u.unit_id}</span> <ChevronRight className="w-3 h-3 shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

            <SearchModal open={searchOpen} query={searchQuery} onQueryChange={onSearchQueryChange} onClose={onCloseSearch} />
        </>
    );
}