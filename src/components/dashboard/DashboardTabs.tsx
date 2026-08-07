"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity, FileText, Edit3, Award, CheckCircle2, Info, X,
    BookMarked, LifeBuoy, Mail, Sparkles, BookOpen, Layers,
} from "lucide-react";
import {
    itemVariants, timeAgo, getActivityMeta,
    type TabType, type Achievement, type ToastItem, type ToastVariant,
} from "./dashboard-shared";

const EASE = [0.16, 1, 0.3, 1] as const;
const TABS: TabType[] = ["feed", "quizzes", "profile", "settings"];

const TAB_META: Record<TabType, { label: string; icon: any }> = {
    feed: { label: "Activity", icon: Activity },
    quizzes: { label: "Quizzes", icon: FileText },
    profile: { label: "Profile", icon: Sparkles },
    settings: { label: "Settings", icon: Layers },
};

// ── Feed ─────────────────────────────────────────────────────────────────
function FeedTab({ recentActivity, visibleCount, onLoadMore }: { recentActivity: any[]; visibleCount: number; onLoadMore: () => void }) {
    if (!recentActivity?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                    <Activity className="w-7 h-7 text-slate-200 dark:text-slate-700" />
                </div>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No recent activity yet</p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-1.5 max-w-[220px] leading-relaxed">
                    Complete a unit or quiz and your journey will appear here.
                </p>
            </div>
        );
    }
    return (
        <div className="space-y-2">
            {recentActivity.slice(0, visibleCount).map((act: any, idx: number) => {
                const meta = getActivityMeta(act.type);
                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.15), ease: EASE }}
                        className="group flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700/60 hover:shadow-sm transition-all duration-200 relative overflow-hidden"
                    >
                        {/* Left accent bar */}
                        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ backgroundColor: meta.color }} />

                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: meta.bg }}>
                                <meta.icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" style={{ color: meta.color }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[13px] sm:text-sm font-bold text-slate-800 dark:text-slate-200 capitalize truncate tracking-tight">
                                    {act.title || act.type.replace("_", " ")}
                                </p>
                                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{meta.label}</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5 rounded-lg shrink-0 ml-2 whitespace-nowrap tabular-nums">
                            {timeAgo(act.timestamp)}
                        </span>
                    </motion.div>
                );
            })}
            {visibleCount < (recentActivity?.length || 0) && (
                <button onClick={onLoadMore}
                    className="w-full py-3 mt-2 text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-400 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-violet-50 dark:hover:bg-violet-950/20 rounded-xl transition-all duration-200 border border-slate-100 dark:border-slate-800/40 hover:border-violet-200/50 dark:hover:border-violet-800/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 active:scale-[0.99]">
                    Show more activity
                </button>
            )}
        </div>
    );
}

// ── Quizzes ──────────────────────────────────────────────────────────────
function QuizzesTab({ quizAttempts }: { quizAttempts: any[] }) {
    if (!quizAttempts?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                    <FileText className="w-7 h-7 text-slate-200 dark:text-slate-700" />
                </div>
                <p className="text-sm font-bold text-slate-400 dark:text-slate-500">No quiz attempts yet</p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-1.5 max-w-[220px] leading-relaxed mb-4">
                    Test your knowledge and track your scores over time.
                </p>
                <Link href="/mcqs-bank"
                    className="inline-flex text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 bg-violet-50 dark:bg-violet-950/30 px-4 py-2 rounded-lg border border-violet-200/50 dark:border-violet-800/30 transition-colors">
                    Try the MCQ Bank →
                </Link>
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quizAttempts.map((q: any, i: number) => {
                const pct = Math.round((q.score / q.total) * 100);
                const color = pct >= 80 ? "emerald" : pct >= 50 ? "amber" : "rose";
                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.04, ease: EASE }}
                        className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700/50 transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px] sm:max-w-[200px] tracking-tight">
                                {q.quiz_title || "Practice Attempt"}
                            </p>
                            <span className={`text-xs font-black tabular-nums text-${color}-600 dark:text-${color}-400`}>
                                {pct}%
                            </span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, delay: 0.2 + i * 0.05, ease: EASE }}
                                className={`h-full rounded-full bg-${color}-500`}
                            />
                        </div>
                        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-2">
                            {q.score}/{q.total} correct
                        </p>
                    </motion.div>
                );
            })}
        </div>
    );
}

// ── Profile ──────────────────────────────────────────────────────────────
function ProfileTab({ profileName, email, isEditing, onToggleEdit, onNameChange, achievements }: {
    profileName: string; email?: string | null; isEditing: boolean; onToggleEdit: () => void; onNameChange: (v: string) => void; achievements: Achievement[];
}) {
    return (
        <div className="space-y-6">
            {/* Profile card */}
            <div className="relative overflow-hidden rounded-2xl border border-violet-100 dark:border-violet-900/30 bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-violet-950/30 dark:via-slate-900 dark:to-blue-950/20">
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-200/30 dark:bg-violet-800/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white font-bold flex items-center justify-center shadow-lg shadow-violet-500/20 text-lg shrink-0">
                            {profileName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate tracking-tight">{profileName}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-medium">{email}</p>
                        </div>
                    </div>
                    <button onClick={onToggleEdit}
                        className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1.5 shrink-0 ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 rounded-lg px-2.5 py-1.5 hover:bg-violet-100/50 dark:hover:bg-violet-900/20 transition-colors">
                        <Edit3 className="w-3.5 h-3.5" /> {isEditing ? "Save" : "Edit"}
                    </button>
                </div>
            </div>

            {/* Edit field */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: EASE }}
                        className="overflow-hidden space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Display name</label>
                        <input type="text" value={profileName} onChange={(e) => onNameChange(e.target.value)}
                            className="w-full text-sm font-semibold p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 transition-all" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Achievements */}
            <div>
                <h3 className="text-[10px] font-bold uppercase text-slate-300 dark:text-slate-600 mb-3 tracking-[0.15em]">Achievements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {achievements.map((ach, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: idx * 0.04, ease: EASE }}
                            whileHover={ach.unlocked ? { y: -2, transition: { duration: 0.15 } } : {}}
                            className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all duration-200
                                ${ach.unlocked
                                    ? "bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 border-amber-200/60 dark:border-amber-800/30 hover:shadow-sm hover:shadow-amber-100/50 dark:hover:shadow-none cursor-default"
                                    : "opacity-30 grayscale bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/40"
                                }`}
                        >
                            <ach.icon className={`w-7 h-7 mb-2 ${ach.unlocked ? "text-amber-500" : "text-slate-400"}`} />
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{ach.name}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Settings ─────────────────────────────────────────────────────────────
function SettingsTab({ isDark, onToggleDark, reduceMotion }: { isDark: boolean; onToggleDark: () => void; reduceMotion: boolean }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800/50 rounded-xl bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700/50 transition-colors">
                <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight">Dark mode</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Switch between light and dark themes</p>
                </div>
                <button onClick={onToggleDark} role="switch" aria-checked={isDark}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 shrink-0
                        ${isDark ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-700"}`}>
                    <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-4.5 h-4.5 bg-white rounded-full absolute top-[3px] shadow-sm"
                        style={{ width: 18, height: 18, left: isDark ? "calc(100% - 21px)" : "3px" }}
                    />
                </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800/50 rounded-xl bg-white dark:bg-slate-900">
                <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm tracking-tight">Reduced motion</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {reduceMotion ? "Following your system preference — animations minimized." : "No reduced-motion preference detected."}
                    </p>
                </div>
                <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ml-2 ${reduceMotion ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-50 dark:bg-slate-800 text-slate-400"}`}>
                    {reduceMotion ? "Active" : "Off"}
                </div>
            </div>
        </div>
    );
}

// ── Public tabs container ───────────────────────────────────────────────
export function DashboardTabs({
    activeTab, setActiveTab, recentActivity, visibleActivityCount, onLoadMoreActivity,
    quizAttempts, profileName, email, isEditing, onToggleEdit, onNameChange, achievements,
    isDark, onToggleDark, reduceMotion,
}: any) {
    return (
        <motion.div variants={itemVariants}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm shadow-slate-100/50 dark:shadow-none overflow-hidden min-h-[400px]">
            {/* Pill-style tab switcher */}
            <div className="p-1.5 bg-slate-50/80 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800/40">
                <div className="flex gap-1 overflow-x-auto">
                    {TABS.map((tab) => {
                        const meta = TAB_META[tab];
                        const isActive = activeTab === tab;
                        return (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`relative flex-1 min-w-[90px] py-2.5 px-3 text-xs font-bold transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 flex items-center justify-center gap-1.5
                                    ${isActive
                                        ? "text-violet-700 dark:text-violet-300"
                                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                                    }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="tabPill"
                                        className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/50"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <meta.icon className="w-3.5 h-3.5" />
                                    {meta.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <AnimatePresence mode="wait">
                    {activeTab === "feed" && (
                        <motion.div key="feed" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                            <FeedTab recentActivity={recentActivity} visibleCount={visibleActivityCount} onLoadMore={onLoadMoreActivity} />
                        </motion.div>
                    )}
                    {activeTab === "quizzes" && (
                        <motion.div key="quizzes" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                            <QuizzesTab quizAttempts={quizAttempts} />
                        </motion.div>
                    )}
                    {activeTab === "profile" && (
                        <motion.div key="profile" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                            <ProfileTab profileName={profileName} email={email} isEditing={isEditing} onToggleEdit={onToggleEdit} onNameChange={onNameChange} achievements={achievements} />
                        </motion.div>
                    )}
                    {activeTab === "settings" && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                            <SettingsTab isDark={isDark} onToggleDark={onToggleDark} reduceMotion={reduceMotion} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ── Guide / Support static pages ────────────────────────────────────────
export function GuidePage() {
    const SECTIONS = [
        { title: "Accessing courses", body: "Use the sidebar (or bottom menu on mobile) to expand a semester and open any subject.", icon: BookOpen },
        { title: "Earning XP & leveling up", body: "Every completed unit, quiz attempt, and lab simulation earns you XP. Reach new levels to unlock achievements.", icon: Sparkles },
        { title: "Streaks & heatmap", body: "Study every day to build your streak. The calendar visualizes your consistency — darker cells mean more activity.", icon: Activity },
    ];
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm shadow-slate-100/50 dark:shadow-none">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2.5 tracking-tight">
                <BookMarked className="text-violet-600 w-5 h-5 sm:w-6 sm:h-6" /> User guide
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Everything you need to navigate PharmaWallah.</p>
            <div className="space-y-3">
                {SECTIONS.map((s, i) => (
                    <motion.div
                        key={s.title}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + i * 0.06, ease: EASE }}
                        className="flex items-start gap-4 p-4 border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-800/20 rounded-xl hover:border-slate-200 dark:hover:border-slate-700/40 transition-colors"
                    >
                        <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 shrink-0">
                            <s.icon className="w-4 h-4 text-violet-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1 text-sm tracking-tight">{s.title}</h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{s.body}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

export function SupportPage() {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}
            className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm shadow-slate-100/50 dark:shadow-none text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center mx-auto mb-5">
                <LifeBuoy className="w-8 h-8 text-violet-400 dark:text-violet-500" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-2 tracking-tight">Technical support</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
                If you encounter issues with a simulation, grading discrepancy, or account access, our team is here to help.
            </p>
            <a href="mailto:support@pharmawallah.com"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-md shadow-violet-500/20 hover:shadow-lg hover:shadow-violet-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 active:scale-[0.97]">
                <Mail className="w-4 h-4" /> Open support ticket
            </a>
        </motion.div>
    );
}

// ── Toasts ───────────────────────────────────────────────────────────────
function toastIcon(v: ToastVariant) { return v === "achievement" ? Award : v === "success" ? CheckCircle2 : Info; }
function toastStyle(v: ToastVariant) {
    if (v === "achievement") return "border-amber-200/60 dark:border-amber-800/30 bg-amber-50/90 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200";
    if (v === "success") return "border-emerald-200/60 dark:border-emerald-800/30 bg-emerald-50/90 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200";
    return "border-violet-200/60 dark:border-violet-800/30 bg-violet-50/90 dark:bg-violet-950/60 text-violet-800 dark:text-violet-200";
}

export function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
    return (
        <div className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-[80] flex flex-col gap-2.5 w-[calc(100%-1.5rem)] sm:w-[calc(100%-3rem)] max-w-sm" aria-live="polite">
            <AnimatePresence>
                {toasts.map((t) => {
                    const Icon = toastIcon(t.variant);
                    return (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, y: 16, scale: 0.95, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: 30, scale: 0.95, filter: "blur(2px)" }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-xl ${toastStyle(t.variant)}`}
                            role="status"
                        >
                            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold leading-tight tracking-tight">{t.title}</p>
                                {t.description && <p className="text-xs opacity-70 mt-0.5 leading-relaxed">{t.description}</p>}
                            </div>
                            <button onClick={() => onDismiss(t.id)} aria-label="Dismiss notification"
                                className="opacity-40 hover:opacity-100 transition-opacity duration-200 shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}

// ── Skeleton (shimmer) ──────────────────────────────────────────────────
export function DashboardSkeleton() {
    const shimmer = "relative overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-xl before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/40 dark:before:via-slate-800/40 before:to-transparent";
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 flex">
            <div className={`hidden lg:block w-64 shrink-0 ${shimmer} rounded-none`} />
            <div className="flex-1 p-4 sm:p-8 lg:p-10 space-y-6 max-w-[1120px] mx-auto w-full">
                <div className={`h-44 ${shimmer} rounded-2xl`} />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <div key={i} className={`h-28 ${shimmer}`} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className={`h-60 ${shimmer}`} />
                    <div className={`h-60 ${shimmer}`} />
                </div>
                <div className={`h-80 ${shimmer}`} />
            </div>
        </div>
    );
}