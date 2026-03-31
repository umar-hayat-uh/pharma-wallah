"use client";

// app/dashboard/page.tsx

import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf,
  BookOpen, Sparkles, Clock, Flame, Trophy, TrendingUp,
  BarChart3, Target, Zap, GraduationCap, Activity,
  ChevronRight, CalendarDays, Star, Database,
  CheckCircle2, Circle, Brain, Library, LogIn,
} from "lucide-react";

// ─── BG icons ─────────────────────────────────────────────────────────────────
const bgIcons = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 28 },
  { Icon: Beaker, top: "40%", left: "1%", size: 26 },
  { Icon: Stethoscope, top: "72%", left: "1.5%", size: 28 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 28 },
  { Icon: FlaskConical, top: "40%", left: "97%", size: 26 },
  { Icon: Leaf, top: "72%", left: "96.5%", size: 26 },
];

// ─── Category label map ────────────────────────────────────────────────────────
const FLASHCARD_LABELS: Record<string, { label: string; color: string }> = {
  moa: { label: "Mechanism of Action", color: "from-blue-600 to-cyan-400" },
  classification: { label: "Classification", color: "from-indigo-600 to-blue-400" },
  sideEffects: { label: "Side Effects", color: "from-rose-500 to-orange-400" },
  pharmacokinetics: { label: "Pharmacokinetics", color: "from-purple-600 to-pink-500" },
  pharmacodynamics: { label: "Pharmacodynamics", color: "from-teal-600 to-green-400" },
  indications: { label: "Indications", color: "from-emerald-600 to-cyan-400" },
};

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  unit_read: <BookOpen size={14} className="text-blue-500" />,
  flashcard: <Brain size={14} className="text-purple-500" />,
  quiz: <Target size={14} className="text-green-500" />,
  spotting: <Microscope size={14} className="text-orange-500" />,
  drug_search: <Database size={14} className="text-pink-500" />,
  book_view: <Library size={14} className="text-teal-500" />,
};

// ─── Calculate streak from recent activity ─────────────────────────────
function calculateStreak(recentActivity: { timestamp: string }[]) {
  if (!recentActivity.length) return { current: 0, longest: 0 };

  // Get unique days
  const days = Array.from(new Set(
    recentActivity.map(a => new Date(a.timestamp).toDateString())
  )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // newest first

  let current = 1;
  let longest = 1;

  // Current streak (from newest date)
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) current++;
    else break;
  }

  // Longest streak
  for (let i = 0; i < days.length; i++) {
    let streak = 1;
    for (let j = i + 1; j < days.length; j++) {
      const diff = (new Date(days[j - 1]).getTime() - new Date(days[j]).getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) streak++;
      else break;
    }
    longest = Math.max(longest, streak);
  }

  return { current, longest };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  if (!iso) return "unknown";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtDate(iso: string) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
}

function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, gradient }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; gradient: string;
}) {
  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden p-5 hover:border-blue-200 hover:shadow-md transition-all duration-300">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-extrabold text-gray-900 leading-none mb-1">{value}</p>
      <p className="text-xs font-bold text-gray-700">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, gradient }: { value: number; gradient: string }) {
  return (
    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-extrabold text-gray-900">{title}</h2>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="h-px bg-gradient-to-r from-gray-200 to-transparent flex-1 hidden sm:block" />
    </div>
  );
}

// ─── Not signed in state ──────────────────────────────────────────────────────
function NotSignedIn() {
  return (
    <section className="min-h-screen bg-white flex items-center justify-center px-5 relative overflow-hidden">
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-100 z-0 hidden lg:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center max-w-md mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200/50">
          <GraduationCap size={36} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Your Dashboard</h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          Sign in to track your progress, flashcard sessions, quiz scores, and study streaks across PharmaWallah.
        </p>
        <SignInButton mode="modal">
          <button className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 hover:shadow-xl transition-all">
            <LogIn size={17} /> Sign in to get started
          </button>
        </SignInButton>
        <p className="text-[11px] text-gray-400 mt-4">Free to join · No spam</p>
      </motion.div>
    </section>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-56 bg-gradient-to-r from-blue-600 to-green-400 animate-pulse" />
      <div className="max-w-6xl mx-auto px-5 py-10 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
        <div className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { progress, loading } = useProgress();

  if (!isLoaded || loading) return <Skeleton />;
  if (!isSignedIn) return <NotSignedIn />;
  if (!progress) return <Skeleton />;

  // ── Safely extract data with fallbacks ──────────────────────────────────────
  const units = progress.units ?? [];
  const flashcards = progress.flashcards ?? [];
  const quizAttempts = progress.quizAttempts ?? [];
  const spotting = progress.spotting ?? [];
  const recentActivity = progress.recentActivity ?? [];
  const totalTimeSpentMin = progress.totalTimeSpentMin ?? 0;
  const displayName = progress.displayName ?? "Student";
  const avatarUrl = progress.avatarUrl ?? null;
  const joinedAt = progress.joinedAt ?? new Date().toISOString();

  // ── Compute streak from recent activity (dynamic) ──────────────────────────
  const computedStreak = calculateStreak(recentActivity);
  const currentStreak = computedStreak.current;
  const longestStreak = computedStreak.longest;

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalUnits = units.length;
  const completedUnits = units.filter(u => u.completed).length;
  const totalFC = flashcards.reduce((s, f) => s + f.cardsReviewed, 0);
  const totalQuizzes = quizAttempts.length;
  const avgScore = totalQuizzes
    ? Math.round(quizAttempts.reduce((s, q) => s + pct(q.score, q.total), 0) / totalQuizzes)
    : 0;
  const spottingDone = spotting.filter(s => s.completed).length;
  const hoursStudied = Math.round(totalTimeSpentMin / 60 * 10) / 10;

  // Group units by subject
  const unitsBySubject = units.reduce<Record<string, typeof units>>((acc, u) => {
    (acc[u.subject] = acc[u.subject] || []).push(u);
    return acc;
  }, {});

  // Best quiz score
  const bestQuiz = quizAttempts.length
    ? quizAttempts.reduce((a, b) => pct(a.score, a.total) >= pct(b.score, b.total) ? a : b)
    : null;

  return (
    <section className="min-h-screen bg-gray-50/50 relative overflow-x-hidden">

      {/* BG icons */}
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0 hidden xl:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══ HERO BANNER ════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-4 right-24 opacity-10 pointer-events-none"><GraduationCap size={80} className="text-white" /></div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar + Clerk UserButton */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-lg" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center">
                    <span className="text-2xl font-extrabold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1">
                  {/* Clerk UserButton for account management */}
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-6 h-6 rounded-lg border-2 border-white shadow-md",
                      },
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                    <Sparkles size={9} /> Student
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {displayName}
                </h1>
                <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1.5">
                  <CalendarDays size={11} /> Joined {fmtDate(joinedAt)}
                </p>
              </div>
            </div>

            {/* Streak + last active */}
            <div className="sm:ml-auto flex items-center gap-3">
              {currentStreak > 0 && (
                <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-2xl px-4 py-2.5">
                  <Flame size={18} className="text-orange-300" />
                  <div>
                    <p className="text-white font-extrabold text-lg leading-none">{currentStreak}</p>
                    <p className="text-white/60 text-[10px]">day streak</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-2xl px-4 py-2.5">
                <Clock size={16} className="text-white/70" />
                <div>
                  <p className="text-white font-extrabold text-lg leading-none">{hoursStudied}h</p>
                  <p className="text-white/60 text-[10px]">studied</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONTENT ════════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 py-8 space-y-10">

        {/* ── Stats row ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            icon={<BookOpen size={18} className="text-white" />}
            label="Units Studied"
            value={totalUnits}
            sub={`${completedUnits} completed`}
            gradient="from-blue-600 to-cyan-400"
          />
          <StatCard
            icon={<Brain size={18} className="text-white" />}
            label="Flashcards Reviewed"
            value={totalFC}
            sub={`${flashcards.length} categories`}
            gradient="from-purple-600 to-pink-400"
          />
          <StatCard
            icon={<Target size={18} className="text-white" />}
            label="Quiz Average"
            value={totalQuizzes ? `${avgScore}%` : "—"}
            sub={`${totalQuizzes} attempt${totalQuizzes !== 1 ? "s" : ""}`}
            gradient="from-green-600 to-emerald-400"
          />
          <StatCard
            icon={<Microscope size={18} className="text-white" />}
            label="Spotting Done"
            value={spottingDone}
            sub={`${spotting.length} lessons visited`}
            gradient="from-orange-500 to-amber-400"
          />
        </motion.div>

        {/* ── Two-column layout: main left, sidebar right ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ══ LEFT — main column ══ */}
          <div className="lg:col-span-2 space-y-8">

            {/* ── Units progress ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
              <SectionHeader
                icon={<BookOpen size={16} className="text-white" />}
                title="Course Units"
                sub="Units you've visited across all subjects"
              />

              {Object.keys(unitsBySubject).length === 0 ? (
                <EmptyState
                  icon={<BookOpen size={22} className="text-blue-300" />}
                  title="No units visited yet"
                  desc="Start reading a unit to track your progress here."
                  href="/courses"
                  cta="Browse Courses"
                />
              ) : (
                <div className="space-y-6">
                  {Object.entries(unitsBySubject).map(([subject, units]) => {
                    const done = units.filter(u => u.completed).length;
                    return (
                      <div key={subject}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-extrabold text-gray-800">{subject}</p>
                            <p className="text-[11px] text-gray-400">{units[0].semester}</p>
                          </div>
                          <span className="text-xs font-bold text-gray-500">{done}/{units.length}</span>
                        </div>
                        <ProgressBar value={pct(done, units.length)} gradient="from-blue-600 to-green-400" />
                        <div className="mt-3 space-y-1.5">
                          {units.slice(0, 5).map(u => (
                            <div key={u.unitId} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-blue-50/50 transition-colors">
                              {u.completed
                                ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                                : <Circle size={14} className="text-gray-300 flex-shrink-0" />}
                              <span className="text-xs text-gray-700 flex-1 truncate">{u.unitTitle}</span>
                              <span className="text-[10px] text-gray-400 flex-shrink-0 flex items-center gap-1">
                                <BookOpen size={10} /> {u.readCount}× · {u.timeSpentMin}min
                              </span>
                            </div>
                          ))}
                          {units.length > 5 && (
                            <p className="text-[11px] text-gray-400 pl-3 pt-1">+{units.length - 5} more units</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* ── Flashcard progress ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
              <SectionHeader
                icon={<Brain size={16} className="text-white" />}
                title="Flashcard Performance"
                sub="Cards reviewed per category"
              />

              {flashcards.length === 0 ? (
                <EmptyState
                  icon={<Brain size={22} className="text-purple-300" />}
                  title="No flashcard sessions yet"
                  desc="Practice flashcards to see your category breakdown here."
                  href="/flashcards"
                  cta="Start Flashcards"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {flashcards.map(f => {
                    const meta = FLASHCARD_LABELS[f.category] ?? { label: f.category, color: "from-gray-500 to-gray-400" };
                    const accuracy = pct(f.cardsCorrect, f.cardsReviewed);
                    return (
                      <div key={f.category} className="relative rounded-xl border border-gray-100 p-4 overflow-hidden">
                        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${meta.color}`} />
                        <p className="text-xs font-extrabold text-gray-800 mb-1">{meta.label}</p>
                        <div className="flex items-end justify-between mb-2">
                          <div>
                            <span className="text-xl font-extrabold text-gray-900">{f.cardsReviewed}</span>
                            <span className="text-[11px] text-gray-400 ml-1">reviewed</span>
                          </div>
                          {f.cardsCorrect > 0 && (
                            <span className="text-xs font-bold text-green-600">{accuracy}% acc.</span>
                          )}
                        </div>
                        <ProgressBar value={Math.min(f.cardsReviewed / 1.1, 100)} gradient={meta.color} />
                        <p className="text-[10px] text-gray-400 mt-1.5">
                          Last: {timeAgo(f.lastPracticed)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href="/flashcards"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Continue practicing <ChevronRight size={13} />
                </Link>
              </div>
            </motion.div>

            {/* ── Quiz history ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
              <SectionHeader
                icon={<Target size={16} className="text-white" />}
                title="Quiz History"
                sub="Recent test attempts and scores"
              />

              {quizAttempts.length === 0 ? (
                <EmptyState
                  icon={<Target size={22} className="text-green-300" />}
                  title="No quizzes attempted yet"
                  desc="Take a spotting test to see your scores here."
                  href="/spotting"
                  cta="Try a Test"
                />
              ) : (
                <div className="space-y-2.5">
                  {[...quizAttempts].reverse().slice(0, 6).map((q, i) => {
                    const score = pct(q.score, q.total);
                    const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-500";
                    return (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-blue-50/40 transition-colors">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0
                          ${score >= 80 ? "bg-green-50 border border-green-100 text-green-600"
                            : score >= 60 ? "bg-amber-50 border border-amber-100 text-amber-600"
                              : "bg-red-50 border border-red-100 text-red-500"}`}>
                          {score}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{q.subject}</p>
                          <p className="text-[10px] text-gray-400">{q.score}/{q.total} correct · {q.timeTakenMin}min</p>
                        </div>
                        <p className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(q.attemptedAt)}</p>
                      </div>
                    );
                  })}
                  {quizAttempts.length > 6 && (
                    <p className="text-[11px] text-gray-400 pl-4 pt-1">+{quizAttempts.length - 6} earlier attempts</p>
                  )}
                </div>
              )}
            </motion.div>

          </div>

          {/* ══ RIGHT — sidebar ══ */}
          <div className="space-y-6">

            {/* ── Streak card ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="relative rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 overflow-hidden p-5 text-white">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={16} className="text-orange-300" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70">Study Streak</span>
                </div>
                <p className="text-4xl font-extrabold leading-none mb-1">{currentStreak || 0}</p>
                <p className="text-white/70 text-xs mb-3">day{currentStreak !== 1 ? "s" : ""} in a row</p>
                <div className="h-px bg-white/20 mb-3" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">Longest streak</span>
                  <span className="font-extrabold text-white flex items-center gap-1">
                    <Trophy size={12} className="text-yellow-300" /> {longestStreak || 0} days
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ── Best quiz ── */}
            {bestQuiz && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={14} className="text-yellow-500 fill-yellow-400" />
                  <p className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Best Score</p>
                </div>
                <p className="text-3xl font-extrabold text-gray-900 leading-none mb-1">
                  {pct(bestQuiz.score, bestQuiz.total)}%
                </p>
                <p className="text-xs text-gray-500 truncate">{bestQuiz.subject}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{bestQuiz.score}/{bestQuiz.total} correct</p>
              </motion.div>
            )}

            {/* ── Spotting progress ── */}
            {spotting.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <SectionHeader
                  icon={<Microscope size={15} className="text-white" />}
                  title="Spotting Centre"
                  sub={`${spottingDone} lessons completed`}
                />
                <div className="space-y-2">
                  {spotting.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      {s.completed
                        ? <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                        : <Circle size={14} className="text-gray-300 flex-shrink-0" />}
                      <span className="text-[11px] text-gray-600 flex-1 truncate capitalize">{s.lessonId.replace(/-/g, " ")}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 capitalize">{s.category}</span>
                    </div>
                  ))}
                </div>
                <Link href="/spotting"
                  className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  View all <ChevronRight size={12} />
                </Link>
              </motion.div>
            )}

            {/* ── Recent activity ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <SectionHeader
                icon={<Activity size={15} className="text-white" />}
                title="Recent Activity"
              />
              {recentActivity.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No activity recorded yet</p>
              ) : (
                <div className="space-y-2.5">
                  {[...recentActivity].reverse().slice(0, 8).map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {ACTIVITY_ICONS[a.type] ?? <Zap size={12} className="text-gray-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        {a.href ? (
                          <Link href={a.href} className="text-[11px] text-gray-700 hover:text-blue-600 transition-colors line-clamp-2 font-medium">
                            {a.label}
                          </Link>
                        ) : (
                          <p className="text-[11px] text-gray-700 line-clamp-2 font-medium">{a.label}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(a.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* ── Quick links ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                <Zap size={11} /> Quick Links
              </p>
              <div className="space-y-1.5">
                {[
                  { href: "/courses", icon: <BookOpen size={14} className="text-blue-500" />, label: "Courses" },
                  { href: "/flashcards", icon: <Brain size={14} className="text-purple-500" />, label: "Flashcards" },
                  { href: "/spotting", icon: <Microscope size={14} className="text-orange-500" />, label: "Spotting" },
                  { href: "/encyclopedia", icon: <Database size={14} className="text-pink-500" />, label: "Drug Search" },
                  { href: "/books", icon: <Library size={14} className="text-teal-500" />, label: "Book Library" },
                ].map(({ href, icon, label }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                    <span className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white">
                      {icon}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-blue-700">{label}</span>
                    <ChevronRight size={12} className="text-gray-300 ml-auto group-hover:text-blue-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Empty state helper ───────────────────────────────────────────────────────
function EmptyState({ icon, title, desc, href, cta }: {
  icon: React.ReactNode; title: string; desc: string; href: string; cta: string;
}) {
  return (
    <div className="text-center py-10">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <p className="text-sm font-bold text-gray-700 mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">{desc}</p>
      <Link href={href}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-xs font-extrabold shadow-sm hover:-translate-y-0.5 transition-all">
        {cta} <ChevronRight size={12} />
      </Link>
    </div>
  );
}