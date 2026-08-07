// src/app/(site)/dashboard/page.tsx
"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { Flame, Trophy, BookOpen, Microscope, Clock } from "lucide-react";
import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useProgress } from "@/hooks/useProgress";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardMain } from "@/components/dashboard/DashboardMain";
import { DashboardTabs, GuidePage, SupportPage, ToastStack, DashboardSkeleton } from "@/components/dashboard/DashboardTabs";
import { DashboardErrorBoundary } from "@/components/dashboard/DashboardErrorBoundary";
import type { TabType, PageType, ToastItem } from "@/components/dashboard/dashboard-shared";

function SignInRequired() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center pt-20 px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center max-w-sm w-full">
        <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Sign in required</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Log in to view your learning dashboard.</p>
        <Link href="/signin" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2">
          Go to sign in <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}

function DashboardPageInner() {
  const { user, loading: authLoading } = useSupabaseUser();
  const { units, quizAttempts, recentActivity, totalTimeSpentMin, currentStreak, isLoading: progressLoading, error: progressError, refetch } = useProgress();
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
  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  const lastShownError = useRef<string | null>(null);
  useEffect(() => {
    if (progressError && progressError !== lastShownError.current) {
      lastShownError.current = progressError;
      pushToast({ title: "Sync issue", description: progressError, variant: "info" });
    }
    if (!progressError) lastShownError.current = null;
  }, [progressError, pushToast]);

  useEffect(() => {
    if (user) setProfileName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Student");
  }, [user]);

  useEffect(() => { setIsDark(document.documentElement.classList.contains("dark")); }, []);
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(document.documentElement.classList.contains("dark"));
  };

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

  const achievements = useMemo(() => {
    const completed = units?.filter((u: any) => u.completed).length || 0;
    const quizCount = quizAttempts?.length || 0;
    const avgScore = quizCount ? Math.round(quizAttempts.reduce((s: number, q: any) => s + (q.score / q.total) * 100, 0) / quizCount) : 0;
    return [
      { name: "7-Day Streak", icon: Flame, unlocked: currentStreak >= 7 },
      { name: "First Unit", icon: BookOpen, unlocked: completed >= 1 },
      { name: "Quiz Master", icon: Trophy, unlocked: quizCount >= 10 && avgScore >= 80 },
      { name: "Bookworm", icon: BookOpen, unlocked: completed >= 20 },
      { name: "Lab Rat", icon: Microscope, unlocked: completed >= 5 },
      { name: "Night Owl", icon: Clock, unlocked: totalTimeSpentMin > 1000 },
    ];
  }, [units, quizAttempts, totalTimeSpentMin, currentStreak]);

  const prevUnlockedRef = useRef<Set<string>>(new Set());
  const firstAchievementPass = useRef(true);
  useEffect(() => {
    const nowUnlocked = achievements.filter((a) => a.unlocked).map((a) => a.name);
    if (!firstAchievementPass.current) {
      nowUnlocked.forEach((name) => {
        if (!prevUnlockedRef.current.has(name)) pushToast({ title: "Achievement unlocked", description: name, variant: "achievement" });
      });
    } else {
      firstAchievementPass.current = false;
    }
    prevUnlockedRef.current = new Set(nowUnlocked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievements]);

  const incompleteUnits = (units || []).filter((u: any) => !u.completed).slice(0, 3);
  const continueUnit = incompleteUnits[0];

  const avgQuizScore = useMemo(() => {
    const quizCount = quizAttempts?.length || 0;
    if (!quizCount) return 0;
    return Math.round(quizAttempts.reduce((s: number, q: any) => s + (q.score / q.total) * 100, 0) / quizCount);
  }, [quizAttempts]);

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
      const match = data.find((d) => d.dateStr === dateStr);
      if (match) match.count++;
    });
    return data;
  }, [recentActivity]);

  const studiedToday = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return (recentActivity || []).some((a: any) => new Date(a.timestamp).toISOString().split("T")[0] === today);
  }, [recentActivity]);

  const notifications = useMemo(() => {
    const list: { id: string; icon: any; text: string; tone: string }[] = [];
    if (currentStreak >= 3 && !studiedToday) list.push({ id: "streak-risk", icon: Flame, text: `Your ${currentStreak}-day streak is at risk — study today to keep it alive.`, tone: "text-amber-600" });
    if (incompleteUnits.length > 0) list.push({ id: "incomplete", icon: BookOpen, text: `${incompleteUnits.length} unit${incompleteUnits.length > 1 ? "s" : ""} left to finish.`, tone: "text-indigo-600" });
    const quizCount = quizAttempts?.length || 0;
    if (quizCount >= 3 && avgQuizScore < 60) list.push({ id: "low-score", icon: Trophy, text: `Your quiz average is ${avgQuizScore}% — revisit flagged topics.`, tone: "text-rose-600" });
    if (list.length === 0) list.push({ id: "all-good", icon: Trophy, text: "You're all caught up. Great work!", tone: "text-emerald-600" });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStreak, studiedToday, incompleteUnits.length, quizAttempts]);

  const handleRefetch = async () => {
    setRefreshing(true);
    await refetch();
    setTimeout(() => {
      setRefreshing(false);
      pushToast({ title: "Progress synced", description: "Your latest activity is up to date.", variant: "success" });
    }, 500);
  };

  const loadMoreActivity = () => setVisibleActivityCount((prev) => prev + 5);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setSearchOpen((open) => !open); }
      if (e.key === "Escape") { setSearchOpen(false); setNotifOpen(false); }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (authLoading || progressLoading) return <DashboardSkeleton />;
  if (!user) return <SignInRequired />;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex pt-7 font-sans antialiased text-slate-800 dark:text-slate-200">
      <DashboardSidebar
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
        mobileSidebarOpen={mobileSidebarOpen} setMobileSidebarOpen={setMobileSidebarOpen}
        activePage={activePage} setActivePage={setActivePage}
        expandedSemester={expandedSemester} setExpandedSemester={setExpandedSemester}
        profileName={profileName} currentLevel={currentLevel}
        onOpenSearch={() => setSearchOpen(true)} onOpenNotif={() => setNotifOpen((o) => !o)}
        unreadNotif={notifications[0]?.id !== "all-good"}
      />

      <main className="flex-1 flex flex-col overflow-hidden w-full relative min-w-0 pb-16 lg:pb-0">
        <div className="flex-1 overflow-y-auto">
          {activePage === "guide" && <div className="p-4 sm:p-8 max-w-6xl mx-auto"><GuidePage /></div>}
          {activePage === "support" && <div className="p-4 sm:p-8 max-w-6xl mx-auto"><SupportPage /></div>}

          {activePage === "dashboard" && (
            <>
              <DashboardMain
                profileName={profileName} currentStreak={currentStreak} continueUnit={continueUnit}
                currentLevel={currentLevel} levelProgress={levelProgress} xpToNextLevel={xpToNextLevel}
                totalXP={totalXP} unitsCompleted={units?.filter((u: any) => u.completed).length || 0}
                quizCount={quizAttempts?.length || 0} avgQuizScore={avgQuizScore}
                recentActivity={recentActivity} weeklyData={weeklyData} incompleteUnits={incompleteUnits}
                onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
                notifications={notifications} notifOpen={notifOpen} onToggleNotif={() => setNotifOpen((o) => !o)}
                isDark={isDark} onToggleDark={toggleDarkMode} onRefresh={handleRefetch} refreshing={refreshing}
                searchOpen={searchOpen} searchQuery={searchQuery} onSearchQueryChange={setSearchQuery}
                onOpenSearch={() => setSearchOpen(true)} onCloseSearch={() => { setSearchOpen(false); setSearchQuery(""); }}
              />
              <div className="px-4 sm:px-8 max-w-6xl mx-auto pb-8">
                <DashboardTabs
                  activeTab={activeTab} setActiveTab={setActiveTab}
                  recentActivity={recentActivity} visibleActivityCount={visibleActivityCount} onLoadMoreActivity={loadMoreActivity}
                  quizAttempts={quizAttempts} profileName={profileName} email={user?.email}
                  isEditing={isEditing} onToggleEdit={() => setIsEditing((v) => !v)} onNameChange={setProfileName}
                  achievements={achievements} isDark={isDark} onToggleDark={toggleDarkMode} reduceMotion={!!reduceMotion}
                />
              </div>
            </>
          )}
        </div>
      </main>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardPageInner />
    </DashboardErrorBoundary>
  );
}