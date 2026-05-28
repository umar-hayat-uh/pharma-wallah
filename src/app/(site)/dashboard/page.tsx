"use client";

import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Flame, Trophy, Clock, CheckCircle, BookOpen, Layers, FileText, Activity,
  ArrowRight, RefreshCw, Pill, Beaker, Stethoscope, Microscope, FlaskConical,
  Lock, Loader2, TrendingUp, Target, BarChart3, Calendar, Award, ChevronRight,
  Shield, Heart, Thermometer, Atom, Dna, Syringe, TestTube, Zap, Star,
  ChevronUp, AlertCircle, Play, BookMarked, LayoutGrid, Sparkles,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useProgress } from "@/hooks/useProgress";
import { createClient } from "@/lib/supabase";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DailyStats {
  date: string;
  label: string;
  dayLabel: string;
  units_read: number;
  flashcards: number;
  quizzes: number;
  time_min: number;
  total_activities: number;
}
interface WeeklyChartData {
  days: DailyStats[];
  maxActivities: number;
  maxTime: number;
}

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

function formatTimeSpent(minutes: number) {
  if (!minutes) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getActivityMeta(type: string) {
  switch (type) {
    case "unit_read": return { icon: BookOpen, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", label: "Unit" };
    case "flashcard": return { icon: Layers, color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Card" };
    case "quiz": return { icon: FileText, color: "#6366f1", bg: "rgba(99,102,241,0.1)", label: "Quiz" };
    case "spotting": return { icon: Microscope, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Spot" };
    default: return { icon: Activity, color: "#64748b", bg: "rgba(100,116,139,0.1)", label: "Log" };
  }
}

function getScoreColor(pct: number) {
  if (pct >= 80) return { grad: "from-emerald-400 to-teal-500", text: "text-emerald-600", bg: "bg-emerald-50" };
  if (pct >= 50) return { grad: "from-amber-400 to-orange-500", text: "text-amber-600", bg: "bg-amber-50" };
  return { grad: "from-rose-400 to-pink-500", text: "text-rose-600", bg: "bg-rose-50" };
}

// ─── Hooks ──────────────────────────────────────────────────────────────────────
function useWeeklyActivity(userId: string | null) {
  const [data, setData] = useState<WeeklyChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const fetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!userId || fetchingRef.current) return;
    fetchingRef.current = true;
    setIsLoading(true);
    try {
      const days: DailyStats[] = [];
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        days.push({ date: dateStr, label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 1), units_read: 0, flashcards: 0, quizzes: 0, time_min: 0, total_activities: 0 });
      }
      const startDate = days[0].date + "T00:00:00.000Z";
      const endDate = new Date(days[6].date); endDate.setDate(endDate.getDate() + 1);
      const { data: activityData } = await supabase.from("activity_log").select("type, timestamp").eq("user_id", userId).gte("timestamp", startDate).lte("timestamp", endDate.toISOString());
      if (activityData) {
        activityData.forEach((act: any) => {
          const actDate = new Date(act.timestamp).toISOString().split("T")[0];
          const dayEntry = days.find((d) => d.date === actDate);
          if (dayEntry) {
            dayEntry.total_activities++;
            if (act.type === "unit_read") dayEntry.units_read++;
            else if (act.type === "flashcard") dayEntry.flashcards++;
            else if (act.type === "quiz") dayEntry.quizzes++;
          }
        });
      }
      const { data: progressRow } = await supabase.from("progress").select("id").eq("user_id", userId).single();
      if (progressRow) {
        const { data: unitData } = await supabase.from("unit_progress").select("last_visited, time_spent_min").eq("progress_id", progressRow.id).gte("last_visited", startDate).lte("last_visited", endDate.toISOString());
        if (unitData) unitData.forEach((u: any) => {
          const visitDate = new Date(u.last_visited).toISOString().split("T")[0];
          const dayEntry = days.find((d) => d.date === visitDate);
          if (dayEntry) dayEntry.time_min += u.time_spent_min || 0;
        });
      }
      const maxActivities = Math.max(...days.map((d) => d.total_activities), 1);
      const maxTime = Math.max(...days.map((d) => d.time_min), 1);
      setData({ days, maxActivities, maxTime });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [userId, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { data, isLoading, refetch: fetchData };
}

function useTodayStats(userId: string | null) {
  const [stats, setStats] = useState({ activities: 0, timeMin: 0, quizScore: 0, quizTotal: 0 });
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!userId) return;
    async function load() {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();
      const { data: acts } = await supabase.from("activity_log").select("type").eq("user_id", userId!).gte("timestamp", todayStr);
      const { data: progressRow } = await supabase.from("progress").select("id, total_time_spent_min").eq("user_id", userId!).single();
      if (!progressRow) return;
      const { data: quizToday } = await supabase.from("quiz_attempts").select("score, total").eq("progress_id", progressRow.id).gte("attempted_at", todayStr).order("attempted_at", { ascending: false }).limit(1);
      setStats({ activities: acts?.length || 0, timeMin: progressRow.total_time_spent_min || 0, quizScore: quizToday?.[0]?.score || 0, quizTotal: quizToday?.[0]?.total || 0 });
    }
    load();
  }, [userId, supabase]);

  return stats;
}

// ─── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1400;
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{displayed}{suffix}</span>;
}

// ─── Molecule Pill ────────────────────────────────────────────────────────────
function MoleculeOrb({ Icon, style, delay, color, label }: any) {
  return (
    <motion.div
      className="fixed z-10 pointer-events-none select-none hidden xl:flex flex-col items-center gap-1.5"
      style={style}
      animate={{ y: [0, -14, 0], rotate: [0, 4, -4, 0] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    >
      <div className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white/70" style={{ background: color + "40" }}>{label}</div>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: color + "18", border: `1px solid ${color}30`, boxShadow: `0 8px 24px ${color}20` }}>
        <Icon size={22} style={{ color }} strokeWidth={1.6} />
      </div>
    </motion.div>
  );
}

const ORBS = [
  { Icon: Pill, style: { top: "8%", left: "1%" }, delay: 0, color: "#3b82f6", label: "Pharma" },
  { Icon: FlaskConical, style: { top: "30%", left: "1.5%" }, delay: 1.1, color: "#10b981", label: "Chem" },
  { Icon: Beaker, style: { top: "54%", left: "0.5%" }, delay: 0.5, color: "#8b5cf6", label: "Lab" },
  { Icon: Stethoscope, style: { top: "76%", left: "1.5%" }, delay: 1.9, color: "#f43f5e", label: "Clinic" },
  { Icon: Microscope, style: { top: "8%", right: "1%" }, delay: 0.3, color: "#f59e0b", label: "Micro" },
  { Icon: Thermometer, style: { top: "30%", right: "1%" }, delay: 1.5, color: "#ef4444", label: "Vitals" },
  { Icon: Shield, style: { top: "54%", right: "1.5%" }, delay: 0.8, color: "#06b6d4", label: "Immune" },
  { Icon: Heart, style: { top: "76%", right: "1%" }, delay: 2.1, color: "#ec4899", label: "Cardio" },
];

// ─── Circular Progress ────────────────────────────────────────────────────────
function CircularProgress({ value, size = 80, stroke = 7, color = "#3b82f6", bg = "#e2e8f0" }: any) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setOffset(circ * (1 - value / 100)), 400);
    return () => clearTimeout(t);
  }, [value, circ]);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)" }} />
    </svg>
  );
}

// ─── Heatmap Bar ──────────────────────────────────────────────────────────────
function WeeklyHeatmap({ chartData, isLoading }: { chartData: WeeklyChartData | null; isLoading: boolean }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [mode, setMode] = useState<"activities" | "time">("activities");

  if (isLoading) return (
    <div className="flex items-center justify-center h-52">
      <div className="flex gap-2 items-center text-slate-400 text-sm font-semibold">
        <Loader2 className="animate-spin w-5 h-5 text-blue-500" /> Loading activity…
      </div>
    </div>
  );

  const days = chartData?.days || [];
  const maxVal = mode === "activities" ? (chartData?.maxActivities || 1) : (chartData?.maxTime || 1);
  const totalActs = days.reduce((s, d) => s + d.total_activities, 0);
  const totalTime = days.reduce((s, d) => s + d.time_min, 0);
  const activeDays = days.filter((d) => d.total_activities > 0).length;

  return (
    <div>
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { val: totalActs, label: "Sessions", color: "text-blue-600", bg: "bg-blue-50" },
          { val: formatTimeSpent(totalTime), label: "Study Time", color: "text-emerald-600", bg: "bg-emerald-50" },
          { val: `${activeDays}/7`, label: "Active Days", color: "text-violet-600", bg: "bg-violet-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-2.5 text-center`}>
            <p className={`text-base font-black ${s.color}`}>{s.val}</p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toggle */}
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
        {(["activities", "time"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all capitalize ${mode === m ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            {m === "activities" ? "Sessions" : "Time"}
          </button>
        ))}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1.5 h-36 relative">
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <div key={p} className="absolute left-0 right-0 border-t border-slate-100/80 pointer-events-none" style={{ bottom: `${p * 100}%` }} />
        ))}
        {days.map((day, i) => {
          const val = mode === "activities" ? day.total_activities : day.time_min;
          const pct = maxVal > 0 ? Math.max((val / maxVal) * 100, val > 0 ? 6 : 0) : 0;
          const isToday = day.date === new Date().toISOString().split("T")[0];
          const isHov = hovered === i;
          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 relative"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <AnimatePresence>
                {isHov && val > 0 && (
                  <motion.div initial={{ opacity: 0, y: 6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute bottom-[calc(100%+8px)] z-20 bg-slate-800 text-white text-[11px] rounded-xl px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none">
                    <div className="font-bold">{day.label}</div>
                    <div className="text-slate-300 mt-0.5">{day.total_activities} session{day.total_activities !== 1 ? "s" : ""}</div>
                    {day.time_min > 0 && <div className="text-blue-300">{formatTimeSpent(day.time_min)}</div>}
                    {day.units_read > 0 && <div className="text-emerald-300">📖 {day.units_read} units</div>}
                    {day.quizzes > 0 && <div className="text-amber-300">📝 {day.quizzes} quizzes</div>}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative w-full h-full flex items-end justify-center" style={{ height: "100%", maxWidth: 28 }}>
                <div className="w-full rounded-full overflow-hidden bg-slate-100" style={{ height: "100%" }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.07 }}
                    className="absolute bottom-0 w-full rounded-full"
                    style={{
                      background: isToday
                        ? "linear-gradient(to top, #2563eb, #3b82f6, #34d399)"
                        : val > 0 ? "linear-gradient(to top, #60a5fa, #93c5fd, #6ee7b7)" : "transparent"
                    }}>
                    {val > 0 && <div className="absolute top-0 left-0 w-1/3 h-full bg-white/25 rounded-full" />}
                  </motion.div>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? "text-blue-600" : "text-slate-400"}`}>{day.dayLabel}</span>
            </div>
          );
        })}
      </div>

      {totalActs === 0 && (
        <div className="mt-4 text-center py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-400 font-semibold">No activity this week — start studying to see your chart!</p>
        </div>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, suffix, icon: Icon, iconBg, trend, trendUp, delay }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-4 sm:p-5 cursor-default group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(ellipse at top right, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />
      <div className="flex items-start justify-between mb-3 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ${iconBg}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-3xl sm:text-4xl font-black text-slate-900 leading-none tracking-tight relative z-10">
        <AnimatedNumber value={value} suffix={suffix} />
      </p>
      <p className={`text-[11px] font-semibold mt-2 flex items-center gap-1 relative z-10 ${trendUp ? "text-emerald-600" : "text-slate-400"}`}>
        {trendUp && <TrendingUp className="w-3 h-3" />}
        {trend}
      </p>
    </motion.div>
  );
}

// ─── Streak Flame ─────────────────────────────────────────────────────────────
function StreakFlame({ streak }: { streak: number }) {
  const intensity = Math.min(streak / 30, 1);
  return (
    <div className="relative flex items-center justify-center">
      <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: `radial-gradient(circle, rgba(249,115,22,${0.3 + intensity * 0.4}) 0%, transparent 70%)` }} />
      <Flame className="relative w-8 h-8" style={{ color: streak > 0 ? `hsl(${30 - intensity * 20}, 90%, ${55 - intensity * 10}%)` : "#cbd5e1" }} />
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading: authLoading } = useSupabaseUser();
  const { units, flashcards, quizAttempts, recentActivity, totalTimeSpentMin, currentStreak, longestStreak, isLoading: progressLoading, refetch } = useProgress();
  const { data: weeklyData, isLoading: weeklyLoading, refetch: refetchWeekly } = useWeeklyActivity(user?.id || null);
  const todayStats = useTodayStats(user?.id || null);
  const [activeTab, setActiveTab] = useState<"feed" | "quizzes">("feed");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefetch = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchWeekly()]);
    setTimeout(() => setRefreshing(false), 600);
  }, [refetch, refetchWeekly]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (authLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-2xl border-4 border-transparent border-t-blue-500 border-r-green-400" />
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
              <FlaskConical className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-slate-500 font-bold text-sm tracking-widest uppercase">Preparing your lab…</p>
        </motion.div>
      </div>
    );
  }

  // ── Not signed in ────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-6 relative overflow-hidden">
        {ORBS.slice(0, 4).map((o, i) => <MoleculeOrb key={i} {...o} />)}
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-2xl p-8 sm:p-12 max-w-sm w-full text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <Lock className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Unlock Your Lab</h2>
          <p className="text-slate-500 mb-8 text-sm">Sign in to access streaks, analytics & clinical progress.</p>
          <Link href="/signin" className="group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-green-400 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all">
            Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Data prep ────────────────────────────────────────────────────────────────
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";
  const completedUnits = units?.filter((u: any) => u.completed).length || 0;
  const totalCardsReviewed = flashcards?.reduce((acc: number, f: any) => acc + (f.cards_reviewed || 0), 0) || 0;
  const avgQuizPct = quizAttempts?.length ? Math.round(quizAttempts.reduce((s: number, q: any) => s + (q.score / q.total) * 100, 0) / quizAttempts.length) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayActivities = todayStats.activities;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#f0f4f8] overflow-x-hidden font-sans">

      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-[50rem] h-[50rem] bg-blue-100/25 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-[40rem] h-[40rem] bg-emerald-100/25 rounded-full blur-3xl pointer-events-none translate-x-1/3 translate-y-1/3" />

      {/* Floating icons */}
      {ORBS.map((o, i) => <MoleculeOrb key={i} {...o} />)}

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-10 pb-20">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-green-400 rounded-3xl p-5 sm:p-7  mb-5 overflow-hidden shadow-2xl shadow-blue-300/30">
          {/* Decorative rings */}
          <div className="absolute -right-16 -top-16 w-72 h-72 border border-white/10 rounded-full pointer-events-none" />
          <div className="absolute -right-6 -top-6 w-52 h-52 border border-white/10 rounded-full pointer-events-none" />
          {/* Molecule SVG */}
          <div className="absolute right-4 top-4 opacity-[0.08] hidden sm:block">
            <svg width="160" height="100" viewBox="0 0 160 100" fill="none">
              <circle cx="20" cy="50" r="10" fill="white" /><circle cx="80" cy="15" r="10" fill="white" />
              <circle cx="140" cy="50" r="10" fill="white" /><circle cx="80" cy="85" r="10" fill="white" />
              <circle cx="50" cy="30" r="6" fill="white" /><circle cx="110" cy="30" r="6" fill="white" />
              <circle cx="50" cy="70" r="6" fill="white" /><circle cx="110" cy="70" r="6" fill="white" />
              <line x1="30" y1="45" x2="44" y2="34" stroke="white" strokeWidth="1.5" />
              <line x1="56" y1="27" x2="70" y2="20" stroke="white" strokeWidth="1.5" />
              <line x1="90" y1="18" x2="104" y2="26" stroke="white" strokeWidth="1.5" />
              <line x1="116" y1="33" x2="130" y2="44" stroke="white" strokeWidth="1.5" />
              <line x1="130" y1="56" x2="116" y2="67" stroke="white" strokeWidth="1.5" />
              <line x1="104" y1="74" x2="90" y2="82" stroke="white" strokeWidth="1.5" />
              <line x1="70" y1="82" x2="56" y2="73" stroke="white" strokeWidth="1.5" />
              <line x1="44" y1="66" x2="30" y2="55" stroke="white" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-md shrink-0">
                <FlaskConical className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-blue-100/80 text-[11px] font-bold tracking-[0.2em] uppercase">{greeting}</p>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">{displayName} 👋</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1">
                    <Flame className="w-3.5 h-3.5 text-orange-300" />
                    <span className="text-white text-[11px] font-bold">{currentStreak || 0} day streak</span>
                  </div>
                  {todayActivities > 0 && (
                    <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-2.5 py-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-300" />
                      <span className="text-white text-[11px] font-bold">{todayActivities} today</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={handleRefetch}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-bold hover:bg-white/30 transition-all active:scale-95 border border-white/20">
                <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <Link href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95">
                <Play className="w-4 h-4 fill-blue-600" /> Continue Learning
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── KPI GRID ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <KpiCard label="Current Streak" value={currentStreak || 0} suffix="d" icon={Flame}
            iconBg="bg-gradient-to-br from-orange-400 to-rose-500"
            trend={currentStreak > 0 ? `🔥 Keep it going!` : "Start your streak"} trendUp={currentStreak > 0} delay={0.05} />
          <KpiCard label="Best Streak" value={longestStreak || 0} suffix="d" icon={Trophy}
            iconBg="bg-gradient-to-br from-amber-400 to-yellow-500"
            trend="Personal record" trendUp={longestStreak > 0} delay={0.1} />
          <KpiCard label="Study Hours" value={Math.floor(totalTimeSpentMin / 60)} suffix="h" icon={Clock}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-700"
            trend={`+${totalTimeSpentMin % 60}m tracked`} trendUp={null} delay={0.15} />
          <KpiCard label="Modules Done" value={completedUnits} suffix="" icon={CheckCircle}
            iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
            trend={`of ${units?.length || 0} total`} trendUp={null} delay={0.2} />
        </div>

        {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 mb-5">

          {/* Activity Feed + Quizzes */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-slate-100 shrink-0">
              {(["feed", "quizzes"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-bold transition-all duration-200 relative ${activeTab === tab ? "text-blue-700" : "text-slate-400 hover:text-slate-600"}`}>
                  <span className="flex items-center justify-center gap-2">
                    {tab === "feed" ? <Activity className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    {tab === "feed" ? "Activity Feed" : "Assessments"}
                    {tab === "feed" && recentActivity?.length > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">{Math.min(recentActivity.length, 99)}</span>
                    )}
                    {tab === "quizzes" && quizAttempts?.length > 0 && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">{quizAttempts.length}</span>
                    )}
                  </span>
                  {activeTab === tab && (
                    <motion.div layoutId="tab-line" className="absolute bottom-0 left-6 right-6 h-0.5 bg-gradient-to-r from-blue-600 to-green-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "feed" ? (
                  <motion.div key="feed" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
                    className="p-4 sm:p-5 h-full overflow-y-auto max-h-[400px] custom-scroll space-y-1">
                    {!recentActivity?.length ? (
                      <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                          <Activity className="w-7 h-7 text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-500 text-sm mb-1">No activity yet</p>
                        <p className="text-xs text-slate-400 text-center max-w-xs mb-4">Complete units, quizzes, or flashcards to see your progress here.</p>
                        <Link href="/courses" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
                          Start Learning →
                        </Link>
                      </div>
                    ) : (
                      recentActivity.slice(0, 15).map((act: any, i: number) => {
                        const meta = getActivityMeta(act.type);
                        const IC = meta.icon;
                        return (
                          <motion.div key={act.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.035 }}
                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
                              <IC style={{ width: 17, height: 17, color: meta.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              {act.href ? (
                                <Link href={act.href} className="text-sm font-bold text-slate-800 hover:text-blue-700 transition-colors line-clamp-1">{act.label}</Link>
                              ) : (
                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{act.label}</p>
                              )}
                              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" /> {timeAgo(act.timestamp)}
                                <span className="ml-1 px-1.5 py-px rounded-md text-[10px] font-bold" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                              </p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-400 transition-colors shrink-0" />
                          </motion.div>
                        );
                      })
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="quizzes" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}
                    className="p-4 sm:p-5 h-full overflow-y-auto max-h-[400px] custom-scroll space-y-2.5">
                    {!quizAttempts?.length ? (
                      <div className="flex flex-col items-center justify-center py-14 text-slate-400">
                        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 border border-amber-100">
                          <FileText className="w-7 h-7 text-amber-300" />
                        </div>
                        <p className="font-bold text-slate-500 text-sm mb-1">No quizzes taken yet</p>
                        <Link href="/mcqs-bank" className="mt-3 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors">
                          Take a Quiz →
                        </Link>
                      </div>
                    ) : (
                      quizAttempts.slice(0, 10).map((q: any, i: number) => {
                        const pct = Math.round((q.score / q.total) * 100);
                        const colors = getScoreColor(pct);
                        return (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-slate-200 hover:bg-white transition-all">
                            <div className="flex items-start justify-between gap-3 mb-2.5">
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 text-sm line-clamp-1">{q.subject || "Quiz"}</p>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Calendar className="w-3 h-3" /> {timeAgo(q.attempted_at)}
                                  {q.time_taken_min > 0 && <> · <Clock className="w-3 h-3" /> {q.time_taken_min}m</>}
                                </p>
                              </div>
                              <span className={`shrink-0 text-sm font-black px-2.5 py-1 rounded-xl ${colors.bg} ${colors.text}`}>{pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.3 + i * 0.04 }}
                                className={`h-full bg-gradient-to-r ${colors.grad} rounded-full`} />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">{q.score} / {q.total} correct</p>
                          </motion.div>
                        );
                      })
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Weekly Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                Weekly Activity
              </h2>
              <motion.span animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Live
              </motion.span>
            </div>
            <WeeklyHeatmap chartData={weeklyData} isLoading={weeklyLoading} />
          </motion.div>
        </div>

        {/* ── BOTTOM ROW ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">

          {/* Modules Progress */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-sm shadow-blue-200">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Modules</h2>
                  <p className="text-[10px] text-slate-400 font-medium">{completedUnits} / {units?.length || 0} completed</p>
                </div>
              </div>
              <Link href="/courses" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {!units?.length ? (
              <div className="text-center py-8 bg-blue-50/50 rounded-2xl border border-dashed border-blue-200">
                <BookMarked className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500 mb-2">No modules started yet</p>
                <Link href="/courses" className="text-blue-600 text-xs font-bold hover:underline">Browse catalog →</Link>
              </div>
            ) : (
              <div className="space-y-3.5">
                {units.slice(0, 4).map((unit: any, i: number) => {
                  const progress = unit.completed ? 100 : Math.min(90, (unit.read_count || 1) * 20);
                  return (
                    <div key={unit.unit_id || i}>
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{unit.unit_title}</p>
                          <p className="text-[10px] text-slate-400">{unit.subject}</p>
                        </div>
                        <span className={`text-[11px] font-black shrink-0 px-2 py-0.5 rounded-lg border ${unit.completed ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100"}`}>{progress}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                          transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 + i * 0.07 }}
                          className={`h-full rounded-full ${unit.completed ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-green-400"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Flashcards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-green-200">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Flashcards</h2>
                <p className="text-[10px] text-slate-400">Spaced repetition</p>
              </div>
            </div>
            {totalCardsReviewed === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 bg-emerald-50/50 rounded-2xl border border-dashed border-emerald-200">
                <Layers className="w-8 h-8 text-emerald-300 mb-3" />
                <p className="text-xs font-bold text-slate-500 mb-1">No cards reviewed yet</p>
                <Link href="/flash-cards" className="text-emerald-600 text-xs font-bold hover:underline">Start reviewing →</Link>
              </div>
            ) : (
              <div className="flex flex-col flex-1 gap-3">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">{totalCardsReviewed}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Reviewed</p>
                  </div>
                  <div className="flex-1">
                    {flashcards?.slice(0, 3).map((f: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-emerald-100 last:border-0">
                        <span className="font-bold text-slate-700 truncate max-w-[120px]">{f.category}</span>
                        <span className="text-slate-400 font-medium">{f.cards_reviewed || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link href="/flash-cards"
                  className="block w-full text-center py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-green-200 hover:-translate-y-0.5 transition-all">
                  Continue Practice →
                </Link>
              </div>
            )}
          </motion.div>

          {/* Progress Overview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow md:col-span-2 xl:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shadow-sm shadow-blue-200">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900">Progress Overview</h2>
                <p className="text-[10px] text-slate-400">Academic journey</p>
              </div>
            </div>

            {/* Circular stats row */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { label: "Modules", val: units?.length ? Math.round((completedUnits / units.length) * 100) : 0, color: "#3b82f6" },
                { label: "Quizzes", val: avgQuizPct, color: "#f59e0b" },
                { label: "Cards", val: Math.min(100, totalCardsReviewed > 0 ? Math.round((totalCardsReviewed / Math.max(totalCardsReviewed + 10, 50)) * 100) : 0), color: "#10b981" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <CircularProgress value={item.val} size={64} stroke={6} color={item.color} bg="#f1f5f9" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black text-slate-800">{item.val}%</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Linear bars */}
            <div className="space-y-3">
              {[
                { label: "Module Completion", value: units?.length ? Math.round((completedUnits / units.length) * 100) : 0, color: "from-blue-600 to-green-400", detail: `${completedUnits} / ${units?.length || 0}`, icon: CheckCircle },
                { label: "Avg Quiz Score", value: avgQuizPct, color: "from-amber-400 to-orange-500", detail: `${quizAttempts?.length || 0} attempts`, icon: Target },
                { label: "Cards Reviewed", value: Math.min(100, totalCardsReviewed), color: "from-green-400 to-emerald-500", detail: `${totalCardsReviewed} total`, icon: Layers },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                      <item.icon className="w-3 h-3" /> {item.label}
                    </span>
                    <span className="text-[11px] font-black text-slate-700">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1.4, ease: "easeOut", delay: 0.6 + i * 0.1 }}
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full`} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.detail}</p>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-100">
              {[
                { label: "MCQ Bank", href: "/mcqs-bank", color: "text-amber-700 bg-amber-50 border-amber-100" },
                { label: "Flash Cards", href: "/flash-cards", color: "text-emerald-700 bg-emerald-50 border-emerald-100" },
                { label: "Spotting", href: "/spotting", color: "text-violet-700 bg-violet-50 border-violet-100" },
                { label: "Courses", href: "/courses", color: "text-blue-700 bg-blue-50 border-blue-100" },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border text-xs font-bold ${link.color} hover:shadow-sm hover:-translate-y-0.5 transition-all`}>
                  {link.label} <ChevronRight className="w-3 h-3" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 20px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.5); }
      ` }} />
    </div>
  );
}