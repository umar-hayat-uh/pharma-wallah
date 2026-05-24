"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  Trophy,
  Clock,
  CheckCircle,
  BookOpen,
  Layers,
  FileText,
  Activity,
  ArrowRight,
  RefreshCw,
  Pill,
  Beaker,
  Stethoscope,
  Microscope,
  FlaskConical,
  Leaf,
  Lock,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useProgress } from "@/hooks/useProgress";

// ─── Helpers ──────────────────────────────────────────────────────────
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
    case "unit_read":
      return { icon: BookOpen, bg: "bg-blue-50", text: "text-blue-600" };
    case "flashcard":
      return { icon: Layers, bg: "bg-purple-50", text: "text-purple-600" };
    case "quiz":
      return { icon: FileText, bg: "bg-orange-50", text: "text-orange-600" };
    case "spotting":
      return { icon: Microscope, bg: "bg-emerald-50", text: "text-emerald-600" };
    default:
      return { icon: Activity, bg: "bg-gray-50", text: "text-gray-600" };
  }
}

// ─── Background icons ──────────────────────────────────────────────────
const BG_ICONS = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 30 },
  { Icon: Beaker, top: "38%", left: "1%", size: 28 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 30 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 28 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 28 },
];

// ─── Animations ────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

// ─── Main component ────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, loading: authLoading } = useSupabaseUser();
  const {
    units,
    flashcards,
    quizAttempts,
    recentActivity,
    totalTimeSpentMin,
    currentStreak,
    longestStreak,
    isLoading: progressLoading,
    refetch,
  } = useProgress();

  // --- Loading state ---
  if (authLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your learning hub…</p>
        </div>
      </div>
    );
  }

  // --- Not signed in ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Unlock Your Dashboard</h2>
          <p className="text-gray-500 mb-8">Sign in to see your learning statistics, streaks, and progress.</p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-400 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-lg transition-all"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // --- Data preparation ---
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";
  const completedUnits = units?.filter((u: any) => u.completed).length || 0;
  const totalCardsReviewed = flashcards?.reduce((acc: number, f: any) => acc + (f.cards_reviewed || 0), 0) || 0;
  const totalCardsCorrect = flashcards?.reduce((acc: number, f: any) => acc + (f.cards_correct || 0), 0) || 0;
  const flashcardAccuracy = totalCardsReviewed > 0 ? Math.round((totalCardsCorrect / totalCardsReviewed) * 100) : 0;

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      {/* Floating background icons */}
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div
          key={i}
          className="fixed pointer-events-none text-blue-200/40 z-0 hidden md:block"
          style={{ top, left }}
        >
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">{displayName}</span>
            </h1>
            <p className="text-gray-500 text-sm sm:text-base mt-1">Here's your learning summary.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-green-400 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
            >
              Resume Learning <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* KPI cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {[
            { label: "Current Streak", value: `${currentStreak || 0}d`, icon: Flame, color: "text-rose-500", bg: "bg-rose-50", ring: "ring-rose-100" },
            { label: "Longest Streak", value: `${longestStreak || 0}d`, icon: Trophy, color: "text-amber-500", bg: "bg-amber-50", ring: "ring-amber-100" },
            { label: "Total Time", value: formatTimeSpent(totalTimeSpentMin), icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50", ring: "ring-indigo-100" },
            { label: "Units Completed", value: completedUnits, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50", ring: "ring-emerald-100" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={item}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ring-1 ${stat.ring} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Activity Feed + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                Recent Activity
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-80">
              {!recentActivity?.length ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Activity className="w-10 h-10 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No recent activity yet.</p>
                  <p className="text-xs mt-1">Start learning to see your progress.</p>
                </div>
              ) : (
                recentActivity.slice(0, 10).map((act: any, i: number) => {
                  const meta = getActivityMeta(act.type);
                  const IconComponent = meta.icon;
                  return (
                    <motion.div
                      key={act.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-3"
                    >
                      <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <IconComponent className={`w-4 h-4 ${meta.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {act.href ? (
                          <Link href={act.href} className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                            {act.label}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{act.label}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(act.timestamp)}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Weekly Activity Chart (static placeholder) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              This Week
            </h2>
            <div className="flex items-end justify-between h-40 mt-2">
              {[
                { day: "M", value: 30 },
                { day: "T", value: 45 },
                { day: "W", value: 80 },
                { day: "T", value: 65 },
                { day: "F", value: 40 },
                { day: "S", value: 20 },
                { day: "S", value: 50 },
              ].map((bar) => (
                <div key={bar.day} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full bg-gray-100 rounded-t-md" style={{ height: `${(bar.value / 80) * 100}%` }} />
                  <span className="text-xs text-gray-400">{bar.day}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">Study time (mock data)</p>
          </motion.div>
        </div>

        {/* Bottom cards: Courses, Flashcards, Quizzes */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Courses */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Courses</h2>
            </div>
            {!units?.length ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-3">No courses started.</p>
                <Link href="/courses" className="text-blue-600 text-sm font-semibold hover:underline">
                  Browse catalog →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {units.slice(0, 3).map((unit: any, i: number) => {
                  const progress = unit.completed ? 100 : Math.min(85, (unit.read_count || 1) * 20);
                  return (
                    <div key={unit.unit_id || i}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="text-sm font-semibold text-gray-900 line-clamp-1">{unit.unit_title}</p>
                          <p className="text-xs text-gray-500">{unit.subject}</p>
                        </div>
                        <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-green-400 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Flashcards */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Flashcards</h2>
            </div>
            {totalCardsReviewed === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-3">No cards reviewed.</p>
                <Link href="/flash-cards" className="text-purple-600 text-sm font-semibold hover:underline">
                  Start review →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-extrabold text-gray-900">{totalCardsReviewed}</p>
                    <p className="text-sm text-gray-500">Cards Reviewed</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-700">
                      {flashcardAccuracy}%
                    </div>
                    <span className="text-xs text-gray-500">accuracy</span>
                  </div>
                </div>
                <Link href="/flash-cards" className="block w-full text-center py-2 bg-purple-50 text-purple-700 rounded-xl font-semibold text-sm hover:bg-purple-100 transition-colors">
                  Continue Practice
                </Link>
              </div>
            )}
          </motion.div>

          {/* Quizzes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 md:col-span-2 xl:col-span-1"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Recent Quizzes</h2>
            </div>
            {!quizAttempts?.length ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 mb-3">No quizzes taken yet.</p>
                <Link href="/mcqs-bank" className="text-orange-600 text-sm font-semibold hover:underline">
                  Take a quiz →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {quizAttempts.slice(0, 4).map((q: any, i: number) => {
                  const pct = Math.round((q.score / q.total) * 100);
                  return (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{q.subject}</p>
                        <p className="text-xs text-gray-400">{timeAgo(q.attempted_at)}</p>
                      </div>
                      <span className={`font-bold px-2 py-1 rounded-lg ${pct >= 80 ? "bg-emerald-50 text-emerald-700" :
                          pct >= 50 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                        }`}>
                        {q.score}/{q.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}