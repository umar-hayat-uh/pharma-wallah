"use client";

import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  animate,
} from "framer-motion";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from "recharts";
import {
  Flame, Trophy, Clock, BookOpen, Layers, FileText, Activity,
  ArrowRight, RefreshCw, Microscope, Lock, Star,
  LayoutDashboard, HelpCircle, Menu, Search, ChevronRight,
  ChevronDown, Folder, LifeBuoy, BookMarked, Play,
  Sparkles, Edit3, GraduationCap, Mail, Bell, X, Award,
  TrendingUp, CheckCircle2, Moon, Sun,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useProgress } from "@/hooks/useProgress";

// ─── Types ─────────────────────────────────────────────────────────────────────
type TabType = "feed" | "quizzes" | "profile" | "settings";
type PageType = "dashboard" | "guide" | "support";
type ToastVariant = "success" | "info" | "achievement";
type ToastItem = { id: number; title: string; description?: string; variant: ToastVariant };

// ─── REAL SEMESTER DATA ───────────────────────────────────────────────────────
const SEMESTERS = {
  "sem-1": {
    label: "Semester 1",
    subjects: [
      { key: "pharmaceutical-biochemistry", label: "Pharmaceutical Biochemistry", icon: BookOpen, href: "/courses/sem-1/pharmaceutical-biochemistry" },
      { key: "pharmaceutical-organic-chemistry", label: "Pharmaceutical Organic Chemistry", icon: Microscope, href: "/courses/sem-1/pharmaceutical-organic-chemistry" },
      { key: "physical-pharmacy", label: "Physical Pharmacy", icon: Layers, href: "/courses/sem-1/physical-pharmacy" },
      { key: "physiology-histology-1", label: "Physiology / Histology 1", icon: Activity, href: "/courses/sem-1/physiology-histology-1" },
    ],
  },
  "sem-6": {
    label: "Semester 6",
    subjects: [
      { key: "industrial-pharmacy", label: "Industrial Pharmacy", icon: Layers, href: "/courses/sem-6/industrial-pharmacy" },
      { key: "natural-toxins", label: "Natural Toxins", icon: Microscope, href: "/courses/sem-6/natural-toxins" },
      { key: "pharmaceutical-analysis", label: "Pharmaceutical Analysis", icon: FileText, href: "/courses/sem-6/pharmaceutical-analysis" },
    ],
  },
  "sem-7": {
    label: "Semester 7",
    subjects: [
      { key: "advanced-pharmacognosy", label: "Advanced Pharmacognosy", icon: Layers, href: "/courses/sem-7/advanced-pharmacognosy" },
      { key: "hospital-pharmacy", label: "Hospital Pharmacy", icon: Activity, href: "/courses/sem-7/hospital-pharmacy" },
      { key: "industrial-pharmacy-2", label: "Industrial Pharmacy 2", icon: Layers, href: "/courses/sem-7/industrial-pharmacy-2" },
      { key: "pharmaceutical-technology", label: "Pharmaceutical Technology", icon: Microscope, href: "/courses/sem-7/pharmaceutical-technology" },
      { key: "systemic-pharmacology-3", label: "Systemic Pharmacology 3", icon: BookOpen, href: "/courses/sem-7/systemic-pharmacology-3" },
    ],
  },
};

// Quick-access links to the rest of the platform (surfaced in Cmd+K search)
const QUICK_LINKS = [
  { label: "MCQ Bank", href: "/mcqs-bank", icon: FileText, group: "Practice" },
  { label: "Flashcards", href: "/flash-cards", icon: Layers, group: "Practice" },
  { label: "Spotting Centre", href: "/spotting", icon: Microscope, group: "Practice" },
  { label: "Drug Encyclopedia", href: "/encyclopedia", icon: BookOpen, group: "Reference" },
  { label: "Book Library", href: "/books-library", icon: BookMarked, group: "Reference" },
  { label: "Prescription Reader", href: "/prescription-reader", icon: FileText, group: "Tools" },
  { label: "Lab Simulations", href: "/simulations", icon: Microscope, group: "Simulations" },
  { label: "Calculation Tools", href: "/calculation-tools", icon: Activity, group: "Tools" },
  { label: "Molecule Viewer", href: "/molecule-viewer", icon: Sparkles, group: "Tools" },
  { label: "Pharmacy Counter", href: "/pharmacy-counter", icon: GraduationCap, group: "Simulations" },
  { label: "Antibiogram Simulator", href: "/antibiogram-simulator", icon: Microscope, group: "Simulations" },
  { label: "RxSentinel (Pharmacovigilance)", href: "/pharmacovigilance", icon: Activity, group: "Simulations" },
  { label: "Compounding Lab", href: "/compounding-lab", icon: Layers, group: "Simulations" },
  { label: "Adverse Reaction Sleuth", href: "/adverse-reaction-sleuth", icon: HelpCircle, group: "Simulations" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────
function timeAgo(dateString: string) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function getActivityMeta(type: string) {
  switch (type) {
    case "unit_read": return { icon: BookOpen, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "Study Unit" };
    case "flashcard": return { icon: Layers, color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Flashcards" };
    case "quiz": return { icon: FileText, color: "#6366f1", bg: "rgba(99,102,241,0.1)", label: "Quiz" };
    case "spotting": return { icon: Microscope, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Lab Practice" };
    default: return { icon: Activity, color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "Activity" };
  }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Working late";
}

// ─── Small UI Primitives ────────────────────────────────────────────────────────

/** Animates a number counting up whenever `value` changes. Respects reduced motion. */
function CountUp({ value, duration = 0.9 }: { value: number; duration?: number }) {
  const reduceMotion = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduceMotion]);

  return <>{display.toLocaleString()}</>;
}

function CircularProgress({ value, size = 60, stroke = 6, color = "#ffffff", bg = "rgba(255, 255, 255, 0.2)" }: any) {
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
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <span className="absolute text-xs font-bold text-white">{Math.round(value)}%</span>
    </div>
  );
}

function StatCard({ label, value, suffix = "", icon: Icon, colorClass, subtitle }: any) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-none dark:hover:border-slate-700 transition-all relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2.5 rounded-xl ${colorClass} shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight tabular-nums">
        <CountUp value={value} />{suffix}
      </div>
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>
    </motion.div>
  );
}

type CalendarCell = { date: Date; key: string; count: number; isToday: boolean; inRange: boolean } | null;

/** Realistic 30-day calendar grid (weeks as rows, Sun–Sat columns) — not an abstract heatmap strip. */
function StudyCalendar({ activities }: { activities: any[] }) {
  const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const { weeks, rangeLabel, activeDaysCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - 29); // last 30 days incl. today

    const counts: Record<string, number> = {};
    (activities || []).forEach((a: any) => {
      const d = new Date(a.timestamp);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().split("T")[0];
      counts[key] = (counts[key] || 0) + 1;
    });

    const days: CalendarCell[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      days.push({ date: d, key, count: counts[key] || 0, isToday: key === today.toISOString().split("T")[0], inRange: true });
    }

    // Pad the front so the grid aligns to real Sun–Sat weekday columns
    const leadingBlanks: CalendarCell[] = Array(days[0]!.date.getDay()).fill(null);
    const cells = [...leadingBlanks, ...days];
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    const rangeLabel = `${rangeStart.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${today.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    const activeDaysCount = days.filter((d) => d && d.count > 0).length;

    return { weeks, rangeLabel, activeDaysCount };
  }, [activities]);

  const getFill = (count: number) => {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600";
    if (count <= 2) return "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200";
    if (count <= 5) return "bg-blue-400 dark:bg-blue-600 text-white";
    return "bg-blue-600 dark:bg-blue-400 text-white dark:text-blue-950";
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-blue-600" /> Study Calendar
        </h3>
        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">{rangeLabel}</span>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">{activeDaysCount} active day{activeDaysCount === 1 ? "" : "s"} · last 30 days</p>

      <div className="flex justify-center">
        <div>
          <div className="grid gap-0.5 mb-1" style={{ gridTemplateColumns: "repeat(7, 1.75rem)" }}>
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="text-center text-[8px] font-bold text-slate-400 dark:text-slate-600 uppercase w-7 h-5 flex items-center justify-center">
                {label[0]}
              </div>
            ))}
          </div>

          <div className="space-y-0.5">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid gap-0.5" style={{ gridTemplateColumns: "repeat(7, 1.75rem)" }}>
                {week.map((day, di) => (
                  <motion.div
                    key={day ? day.key : `blank-${wi}-${di}`}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: Math.min((wi * 7 + di) * 0.01, 0.25) }}
                    className="group relative w-7 h-7"
                  >
                    {day && (
                      <>
                        <div
                          className={`w-full h-full rounded-[5px] flex items-center justify-center text-[8px] font-bold transition-all hover:scale-110 ${getFill(day.count)} ${day.isToday ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-slate-900" : ""}`}
                        >
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

/** Skeleton shown while auth/progress data is loading — avoids a jarring blank/plain-text state. */
function DashboardSkeleton() {
  const pulse = "animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl";
  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex">
      <div className={`hidden lg:block w-64 shrink-0 ${pulse} m-0 rounded-none`} />
      <div className="flex-1 p-4 sm:p-8 space-y-6 max-w-6xl mx-auto w-full">
        <div className={`h-40 ${pulse}`} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className={`h-28 ${pulse}`} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 h-56 ${pulse}`} />
          <div className={`h-56 ${pulse}`} />
        </div>
        <div className={`h-96 ${pulse}`} />
      </div>
    </div>
  );
}

// Toast stack — success / info / achievement notifications
function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  const iconFor = (v: ToastVariant) => v === "achievement" ? Award : v === "success" ? CheckCircle2 : Info;
  const styleFor = (v: ToastVariant) =>
    v === "achievement"
      ? "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
      : v === "success"
        ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
        : "border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300";

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = iconFor(t.variant);
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md ${styleFor(t.variant)}`}
              role="status"
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight">{t.title}</p>
                {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
              </div>
              <button
                onClick={() => onDismiss(t.id)}
                aria-label="Dismiss notification"
                className="opacity-60 hover:opacity-100 transition shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// small local alias so ToastStack doesn't need a separate Info import path collision
function Info(props: any) {
  return <Bell {...props} />;
}

// Shared motion variants (module scope so all components can reuse them)
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── MAIN PAGE COMPONENT ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading: authLoading } = useSupabaseUser();
  const { units, quizAttempts, recentActivity, totalTimeSpentMin, currentStreak, isLoading: progressLoading, refetch } = useProgress();

  const reduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState<TabType>("feed");
  const [activePage, setActivePage] = useState<PageType>("dashboard");
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);
  const [visibleActivityCount, setVisibleActivityCount] = useState(5);
  const [prevLevel, setPrevLevel] = useState(1);
  const [profileName, setProfileName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4800);
  }, []);
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  // Profile name
  useEffect(() => {
    if (user) {
      setProfileName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Student");
    }
  }, [user]);

  // Sync dark-mode toggle state with the DOM class on mount
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(document.documentElement.classList.contains("dark"));
  };

  // XP & Level
  const totalXP = useMemo(() => {
    let xp = 0;
    xp += (units?.filter((u: any) => u.completed).length || 0) * 100;
    xp += (quizAttempts?.length || 0) * 50;
    xp += (recentActivity?.length || 0) * 10;
    return xp;
  }, [units, quizAttempts, recentActivity]);

  const currentLevel = Math.floor(Math.sqrt(totalXP / 100)) + 1;
  const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
  const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const levelProgress = Math.min(100, ((totalXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100);
  const xpToNextLevel = Math.max(0, xpForNextLevel - totalXP);

  useEffect(() => {
    if (currentLevel > prevLevel && prevLevel !== 1) {
      if (!reduceMotion) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      pushToast({ title: `Level ${currentLevel} reached!`, description: "Your consistency is paying off.", variant: "success" });
    }
    setPrevLevel(currentLevel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel]);

  // Achievements
  const achievements = useMemo(() => {
    const completed = units?.filter((u: any) => u.completed).length || 0;
    const quizCount = quizAttempts?.length || 0;
    const avgScore = quizCount ? Math.round(quizAttempts.reduce((s: number, q: any) => s + (q.score / q.total) * 100, 0) / quizCount) : 0;
    return [
      { name: "7-Day Streak", icon: Flame, unlocked: currentStreak >= 7 },
      { name: "First Unit", icon: BookOpen, unlocked: completed >= 1 },
      { name: "Quiz Master", icon: Trophy, unlocked: quizCount >= 10 && avgScore >= 80 },
      { name: "Bookworm", icon: BookOpen, unlocked: completed >= 20 },
      { name: "Lab Rat", icon: Microscope, unlocked: completed >= 5 }, // simplified
      { name: "Night Owl", icon: Clock, unlocked: totalTimeSpentMin > 1000 },
    ];
  }, [units, quizAttempts, totalTimeSpentMin, currentStreak]);

  // Toast whenever a *new* achievement unlocks (skips the very first render so we
  // don't spam toasts for achievements the student already had).
  const prevUnlockedRef = useRef<Set<string>>(new Set());
  const firstAchievementPass = useRef(true);
  useEffect(() => {
    const nowUnlocked = achievements.filter((a) => a.unlocked).map((a) => a.name);
    if (!firstAchievementPass.current) {
      nowUnlocked.forEach((name) => {
        if (!prevUnlockedRef.current.has(name)) {
          pushToast({ title: "Achievement unlocked", description: name, variant: "achievement" });
        }
      });
    } else {
      firstAchievementPass.current = false;
    }
    prevUnlockedRef.current = new Set(nowUnlocked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievements]);

  // Recommendations
  const incompleteUnits = (units || []).filter((u: any) => !u.completed).slice(0, 3);
  const continueUnit = incompleteUnits[0];

  // Shared quiz-average figure, used in the stat card and in notifications
  const avgQuizScore = useMemo(() => {
    const quizCount = quizAttempts?.length || 0;
    if (!quizCount) return 0;
    return Math.round(quizAttempts.reduce((s: number, q: any) => s + (q.score / q.total) * 100, 0) / quizCount);
  }, [quizAttempts]);

  // Weekly Chart
  const weeklyData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const data = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return { day: days[d.getDay()], dateStr: d.toISOString().split("T")[0], count: 0 };
    });
    recentActivity?.forEach((act: any) => {
      const dateStr = new Date(act.timestamp).toISOString().split("T")[0];
      const match = data.find(d => d.dateStr === dateStr);
      if (match) match.count++;
    });
    return data;
  }, [recentActivity]);

  // Did the student study today? (used for streak-at-risk notification)
  const studiedToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return (recentActivity || []).some((a: any) => new Date(a.timestamp).toISOString().split("T")[0] === today);
  }, [recentActivity]);

  const notifications = useMemo(() => {
    const list: { id: string; icon: any; text: string; tone: string }[] = [];
    if (currentStreak >= 3 && !studiedToday) {
      list.push({ id: "streak-risk", icon: Flame, text: `Your ${currentStreak}-day streak is at risk — study today to keep it alive.`, tone: "text-amber-600" });
    }
    if (incompleteUnits.length > 0) {
      list.push({ id: "incomplete", icon: BookOpen, text: `${incompleteUnits.length} unit${incompleteUnits.length > 1 ? "s" : ""} left to finish from your recent courses.`, tone: "text-blue-600" });
    }
    const quizCount = quizAttempts?.length || 0;
    if (quizCount >= 3 && avgQuizScore < 60) {
      list.push({ id: "low-score", icon: TrendingUp, text: `Your quiz average is ${avgQuizScore}% — revisit flagged topics to improve it.`, tone: "text-rose-600" });
    }
    if (list.length === 0) {
      list.push({ id: "all-good", icon: CheckCircle2, text: "You're all caught up. Great work!", tone: "text-emerald-600" });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStreak, studiedToday, incompleteUnits.length, quizAttempts]);

  // Search results (subjects + quick links)
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const allSubjects = Object.values(SEMESTERS).flatMap((s) => s.subjects);
    const combined = [
      ...allSubjects.map((s) => ({ label: s.label, href: s.href, icon: s.icon, group: "Courses" })),
      ...QUICK_LINKS,
    ];
    if (!q) return combined.slice(0, 6);
    return combined.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery]);

  // Handlers
  const handleRefetch = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => {
      setRefreshing(false);
      pushToast({ title: "Progress synced", description: "Your latest activity is up to date.", variant: "success" });
    }, 500);
  };

  const loadMoreActivity = () => setVisibleActivityCount(prev => prev + 5);

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (authLoading || progressLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-900 p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center max-w-sm w-full"
        >
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Sign In Required</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Log in to view your learning dashboard.</p>
          <Link href="/signin" className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
            Go to Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex font-sans antialiased text-slate-800 dark:text-slate-200 pt-7">

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-40 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-out
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        ${sidebarOpen ? "w-64" : "w-64 lg:w-20"} flex flex-col`}
      >
        <div className="p-4 flex justify-between items-center h-16 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-400 rounded-lg flex items-center justify-center text-white font-bold shrink-0">P</div>
            {sidebarOpen && <span className="font-black text-lg tracking-tight whitespace-nowrap">PharmaWallah</span>}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
            className="hidden lg:block text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close menu"
            className="lg:hidden text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">Main Menu</p>
            {([
              { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { id: "guide", label: "User Guide", icon: BookMarked },
              { id: "support", label: "Support", icon: LifeBuoy },
            ] as const).map((item) => (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id as PageType); setMobileSidebarOpen(false); }}
                title={!sidebarOpen ? item.label : undefined}
                className={`relative w-full flex items-center gap-3 p-3 rounded-xl font-semibold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
                  ${activePage === item.id ? "text-blue-600 bg-blue-50 dark:bg-blue-950/50" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
              >
                {activePage === item.id && (
                  <motion.span layoutId="sidebarActive" className="absolute inset-0 rounded-xl bg-blue-50 dark:bg-blue-950/50 -z-10" transition={{ duration: 0.25 }} />
                )}
                <item.icon className="w-5 h-5 shrink-0" /> {sidebarOpen && item.label}
              </button>
            ))}
          </div>

          {sidebarOpen && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">My Courses</p>
              {Object.entries(SEMESTERS).map(([semKey, semester]) => (
                <div key={semKey}>
                  <button
                    onClick={() => setExpandedSemester(expandedSemester === semKey ? null : semKey)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    aria-expanded={expandedSemester === semKey}
                  >
                    <div className="flex items-center gap-2"><Folder className="w-4 h-4 text-blue-500" /> {semester.label}</div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedSemester === semKey ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {expandedSemester === semKey && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="pl-4 ml-3 border-l-2 border-slate-100 dark:border-slate-800 space-y-1 mt-1 overflow-hidden"
                      >
                        {semester.subjects.map(subj => (
                          <Link
                            key={subj.key}
                            href={subj.href}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 transition"
                          >
                            <subj.icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{subj.label}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-emerald-400 text-white font-bold flex items-center justify-center text-sm shrink-0">
              {profileName.charAt(0)}
            </div>
            {sidebarOpen && (
              <div className="text-xs min-w-0">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{profileName}</p>
                <p className="text-slate-500 dark:text-slate-500">Level {currentLevel}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col overflow-hidden w-full relative min-w-0">
        <header className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <button onClick={() => setMobileSidebarOpen(true)} aria-label="Open menu" className="lg:hidden p-2 text-slate-500 dark:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-pointer w-64 hover:border-blue-400 dark:hover:border-blue-500 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs">Search courses & tools</span>
              <kbd className="ml-auto text-[9px] px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-400">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <Search className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900/50">
              <motion.div animate={reduceMotion ? {} : { scale: currentStreak > 0 ? [1, 1.15, 1] : 1 }} transition={{ repeat: Infinity, duration: 2 }}>
                <Flame className="w-4 h-4 text-amber-500" />
              </motion.div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{currentStreak || 0}</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
                className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <Bell className="w-4 h-4" />
                {notifications[0]?.id !== "all-good" && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
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

            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button onClick={handleRefetch} aria-label="Refresh progress" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 pb-20">
          <div className="max-w-6xl mx-auto space-y-6">

            {activePage === "guide" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <BookMarked className="text-blue-600 w-6 h-6" /> User Guide
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Welcome to the PharmaWallah learning environment. Here is how to navigate your curriculum.</p>
                <div className="space-y-4">
                  <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Accessing Courses</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Use the left sidebar to expand a semester and click on any subject. You'll be taken directly to the unit list where you can start reading and tracking your progress.</p>
                  </div>
                  <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Earning XP & Leveling Up</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Every completed unit, quiz attempt, and lab simulation earns you XP. Reach new levels to unlock achievements and stay motivated!</p>
                  </div>
                  <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Streaks & Heatmap</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Study every day to build your streak. The heatmap visualizes your consistency — darker cells mean more activity on that day.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activePage === "support" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                <LifeBuoy className="w-16 h-16 text-blue-100 dark:text-blue-950 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Technical Support</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">If you encounter issues with a simulation, grading discrepancy, or account access, our administrative team is here to assist.</p>
                <a href="mailto:support@pharmawallah.com" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2">
                  <Mail className="w-4 h-4" /> Open Support Ticket
                </a>
              </motion.div>
            )}

            {activePage === "dashboard" && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {/* Welcome Banner */}
                <motion.div variants={itemVariants} className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 rounded-3xl p-8 sm:p-10 text-white shadow-lg overflow-hidden flex flex-col sm:flex-row items-center justify-between">
                  <div className="relative z-10 max-w-xl">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-white/20">
                      Academic Progress
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                      {getGreeting()}, {profileName}.
                    </h1>
                    <p className="text-sm text-blue-100 font-medium mb-6">
                      {currentStreak > 0
                        ? `You are currently on a ${currentStreak}-day study streak. Continue your modules to maintain your momentum.`
                        : "Start a module today to kick off a new study streak."}
                    </p>
                    {continueUnit ? (
                      <Link
                        href={`/courses/${continueUnit.semester}/${continueUnit.subject}/${continueUnit.unit_id}`}
                        className="inline-flex bg-white text-blue-700 px-6 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-blue-50 transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
                      >
                        <Play className="w-4 h-4" /> Resume: {continueUnit.unit_title || continueUnit.unit_id}
                      </Link>
                    ) : (
                      <Link href="/courses" className="inline-flex bg-white text-blue-700 px-6 py-2.5 rounded-xl text-sm font-bold items-center gap-2 hover:bg-blue-50 transition shadow-sm">
                        <Play className="w-4 h-4" /> Browse Courses
                      </Link>
                    )}
                  </div>
                  <div className="relative z-10 mt-6 sm:mt-0 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex flex-col items-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100 mb-2">Current Level</p>
                    <CircularProgress value={levelProgress} size={80} stroke={6} color="#ffffff" />
                    <p className="text-lg font-black mt-2">Level {currentLevel}</p>
                    <p className="text-[10px] text-blue-200 mt-1">{xpToNextLevel > 0 ? `${xpToNextLevel} XP to next level` : "Max tier"}</p>
                  </div>
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                </motion.div>

                {/* Stats Grid */}
                <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard label="XP Earned" value={totalXP} icon={Star} colorClass="bg-purple-500" subtitle="Total experience points" />
                  <StatCard label="Units Read" value={units?.filter((u: any) => u.completed).length || 0} icon={BookOpen} colorClass="bg-blue-500" subtitle="Modules mastered" />
                  <StatCard label="Quizzes" value={quizAttempts?.length || 0} icon={FileText} colorClass="bg-indigo-500" subtitle="Practice completed" />
                  <StatCard label="Quiz Average" value={avgQuizScore} suffix="%" icon={TrendingUp} colorClass="bg-emerald-500" subtitle={quizAttempts?.length ? "Across all attempts" : "Take a quiz to get started"} />
                </motion.div>

                {/* Charts Row */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <StudyCalendar activities={recentActivity} />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-500" /> Weekly Overview
                    </h3>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -24, bottom: 0 }} barCategoryGap="30%">
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} allowDecimals={false} width={20} />
                          <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={22} isAnimationActive={!reduceMotion}>
                            {weeklyData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#3b82f6' : '#cbd5e1'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </motion.div>

                {/* Recommendations */}
                {incompleteUnits.length > 0 && (
                  <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Recommended for You
                    </h3>
                    <div className="space-y-2">
                      {incompleteUnits.map((u: any) => (
                        <Link
                          key={u.unit_id}
                          href={`/courses/${u.semester}/${u.subject}/${u.unit_id}`}
                          className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                        >
                          <span>Finish: {u.unit_title || u.unit_id}</span> <ChevronRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Tab Panel */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                  <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-800/40">
                    {(["feed", "quizzes", "profile", "settings"] as TabType[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 min-w-[120px] py-3.5 px-4 text-xs font-bold capitalize transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-lg ${activeTab === tab ? "text-blue-600" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          }`}
                      >
                        {tab}
                        {activeTab === tab && (
                          <motion.div layoutId="activeTab" className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-t-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="p-6">
                    <AnimatePresence mode="wait">
                      {activeTab === "feed" && (
                        <motion.div key="feed" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-3">
                          {!recentActivity?.length ? (
                            <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                              <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                              <p className="text-xs font-bold">No recent activity yet</p>
                              <p className="text-[11px] mt-1">Complete a unit or quiz to see it show up here.</p>
                            </div>
                          ) : (
                            <>
                              {recentActivity.slice(0, visibleActivityCount).map((act: any, idx: number) => {
                                const meta = getActivityMeta(act.type);
                                return (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.2) }}
                                    className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm transition-all"
                                  >
                                    <div className="flex items-center gap-4 min-w-0">
                                      <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: meta.bg, color: meta.color }}>
                                        <meta.icon className="w-5 h-5" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize truncate">{act.title || act.type.replace('_', ' ')}</p>
                                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{meta.label}</span>
                                      </div>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shrink-0 ml-2">
                                      {timeAgo(act.timestamp)}
                                    </span>
                                  </motion.div>
                                );
                              })}
                              {visibleActivityCount < (recentActivity?.length || 0) && (
                                <button
                                  onClick={loadMoreActivity}
                                  className="w-full py-3 mt-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-100 dark:border-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                                >
                                  Show More Activity
                                </button>
                              )}
                            </>
                          )}
                        </motion.div>
                      )}

                      {activeTab === "quizzes" && (
                        <motion.div key="quizzes" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
                          {!quizAttempts?.length ? (
                            <div className="text-center py-12 text-slate-400 dark:text-slate-600">
                              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                              <p className="text-xs font-bold">No quiz attempts yet</p>
                              <Link href="/mcqs-bank" className="text-[11px] mt-1 text-blue-600 hover:underline inline-block">Try the MCQ Bank →</Link>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {quizAttempts?.map((q: any, i: number) => {
                                const pct = Math.round((q.score / q.total) * 100);
                                return (
                                  <div key={i} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">{q.quiz_title || "Practice Attempt"}</p>
                                      <p className="text-[11px] font-bold mt-1 text-slate-500 dark:text-slate-400">{q.score} out of {q.total} correct</p>
                                    </div>
                                    <div className={`text-xs font-black px-3 py-1.5 rounded-xl shrink-0 ml-2 ${pct >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : pct >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
                                      {pct}%
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === "profile" && (
                        <motion.div key="profile" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-6">
                          <div className="flex items-center justify-between p-4 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-400 text-white font-bold flex items-center justify-center shadow-md text-lg shrink-0">
                                {profileName.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-800 dark:text-slate-200 truncate">{profileName}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                              </div>
                            </div>
                            <button onClick={() => setIsEditing(!isEditing)} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 shrink-0 ml-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded">
                              <Edit3 className="w-3.5 h-3.5" /> {isEditing ? "Save" : "Edit"}
                            </button>
                          </div>
                          <AnimatePresence>
                            {isEditing && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Display Name</label>
                                <input
                                  type="text"
                                  value={profileName}
                                  onChange={(e) => setProfileName(e.target.value)}
                                  className="w-full text-xs font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-400 transition-all"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div>
                            <h3 className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-3">Achievements</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {achievements.map((ach, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                                  whileHover={ach.unlocked ? { y: -2 } : {}}
                                  className={`p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center transition ${ach.unlocked ? "bg-amber-50 dark:bg-amber-950/30" : "opacity-40 grayscale bg-slate-50 dark:bg-slate-800/40"
                                    }`}
                                >
                                  <ach.icon className={`w-8 h-8 mb-2 ${ach.unlocked ? "text-amber-500" : "text-slate-400"}`} />
                                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{ach.name}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "settings" && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="space-y-4">
                          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">Dark Mode</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Toggle the application theme.</p>
                            </div>
                            <button
                              onClick={toggleDarkMode}
                              role="switch"
                              aria-checked={isDark}
                              className={`w-12 h-6 rounded-full relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${isDark ? "bg-blue-600" : "bg-slate-300"}`}
                            >
                              <motion.div
                                layout
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="w-4 h-4 bg-white rounded-full absolute top-1"
                                style={{ left: isDark ? "calc(100% - 20px)" : "4px" }}
                              />
                            </button>
                          </div>
                          <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">Reduced Motion</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {reduceMotion ? "Following your system preference — animations are minimized." : "Your system has no reduced-motion preference set."}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Search Modal (Ctrl+K) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-slate-900/50 backdrop-blur-sm px-4"
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, units, or tools..."
                  className="w-full bg-transparent border-none outline-none px-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
                <kbd className="text-[9px] px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">ESC</kbd>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-1">
                <p className="text-[9px] font-bold uppercase text-slate-400 px-1 mb-1">
                  {searchQuery ? `Results (${searchResults.length})` : "Suggestions"}
                </p>
                {searchResults.length === 0 ? (
                  <p className="text-xs text-slate-400 px-1 py-6 text-center">No matches for "{searchQuery}"</p>
                ) : (
                  searchResults.map((item, i) => (
                    <Link
                      key={`${item.href}-${i}`}
                      href={item.href}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer flex items-center gap-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      <item.icon className="w-4 h-4 text-blue-600 shrink-0" />
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

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}