"use client";

// app/dashboard/page.tsx — PharmaWallah v2 Dashboard
// Fully responsive design: mobile-first, tablet, desktop
// Color scheme aligned with project: from-blue-600 to-green-400

import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { useProgress } from "@/hooks/useProgress";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf,
  BookOpen, Sparkles, Clock, Flame, Trophy, TrendingUp,
  BarChart3, Target, Zap, GraduationCap, Activity,
  ChevronRight, CalendarDays, Star, Database,
  CheckCircle2, Circle, Brain, Library, LogIn,
  Award, BookMarked, Layers, ArrowUpRight, MoreHorizontal,
  Hash, Percent, AlignLeft, ChevronUp, ChevronDown,
} from "lucide-react";

// ─── BG ambient icons ─────────────────────────────────────────────────────────
const BG_ICONS = [
  { Icon: Pill, top: "6%", left: "1%", size: 22, rotate: -15 },
  { Icon: Beaker, top: "38%", left: "0.5%", size: 20, rotate: 10 },
  { Icon: Stethoscope, top: "70%", left: "1%", size: 22, rotate: -8 },
  { Icon: Microscope, top: "6%", left: "97%", size: 22, rotate: 12 },
  { Icon: FlaskConical, top: "38%", left: "97.5%", size: 20, rotate: -10 },
  { Icon: Leaf, top: "70%", left: "97%", size: 22, rotate: 6 },
];

// ─── Flashcard meta ───────────────────────────────────────────────────────────
const FC_META: Record<string, { label: string; color: string; bg: string }> = {
  moa: { label: "Mechanism of Action", color: "#2563EB", bg: "rgba(37,99,235,0.08)" },
  classification: { label: "Classification", color: "#7C3AED", bg: "rgba(124,58,237,0.08)" },
  sideEffects: { label: "Side Effects", color: "#DC2626", bg: "rgba(220,38,38,0.08)" },
  pharmacokinetics: { label: "Pharmacokinetics", color: "#0891B2", bg: "rgba(8,145,178,0.08)" },
  pharmacodynamics: { label: "Pharmacodynamics", color: "#059669", bg: "rgba(5,150,105,0.08)" },
  indications: { label: "Indications", color: "#D97706", bg: "rgba(217,119,6,0.08)" },
};

const ACT_ICON: Record<string, React.ReactNode> = {
  unit_read: <BookOpen size={13} />,
  flashcard: <Brain size={13} />,
  quiz: <Target size={13} />,
  spotting: <Microscope size={13} />,
  drug_search: <Database size={13} />,
  book_view: <Library size={13} />,
};

const ACT_COLOR: Record<string, string> = {
  unit_read: "#2563EB",
  flashcard: "#7C3AED",
  quiz: "#059669",
  spotting: "#D97706",
  drug_search: "#DB2777",
  book_view: "#0891B2",
};

// ─── Streak engine (unchanged) ────────────────────────────────────────────────
function computeStreak(activities: { timestamp: string }[]) {
  if (!activities.length) return { current: 0, longest: 0, weekMap: {} as Record<string, boolean> };

  const daySet = new Set(
    activities.map(a => {
      const d = new Date(a.timestamp);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })
  );
  const days = Array.from(daySet).sort((a, b) => b.localeCompare(a));

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  let current = 0;
  const streakStartsAt = days[0];
  if (streakStartsAt === todayStr || streakStartsAt === yStr) {
    current = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
      if (diff === 1) current++;
      else break;
    }
  }

  let longest = 0, run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) { run++; longest = Math.max(longest, run); }
    else run = 1;
  }
  longest = Math.max(longest, current, days.length > 0 ? 1 : 0);

  const weekMap: Record<string, boolean> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    weekMap[k] = daySet.has(k);
  }

  return { current, longest, weekMap };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pct = (a: number, b: number) => (!b ? 0 : Math.round((a / b) * 100));
const timeAgo = (iso: string) => {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
const fmtDate = (iso: string) =>
  !iso ? "N/A" : new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

const gradeInfo = (score: number) => {
  if (score >= 90) return { grade: "A+", color: "#059669", bg: "rgba(5,150,105,0.1)" };
  if (score >= 80) return { grade: "A", color: "#2563EB", bg: "rgba(37,99,235,0.1)" };
  if (score >= 70) return { grade: "B", color: "#0891B2", bg: "rgba(8,145,178,0.1)" };
  if (score >= 60) return { grade: "C", color: "#D97706", bg: "rgba(217,119,6,0.1)" };
  return { grade: "F", color: "#DC2626", bg: "rgba(220,38,38,0.1)" };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MiniBar({ value, color = "#2563EB" }: { value: number; color?: string }) {
  return (
    <div style={{ height: 4, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: color, borderRadius: 999, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: `${color}18`, color }}>
      {children}
    </span>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FC" }}>
      <div style={{ height: 220, background: "linear-gradient(135deg, #2563EB 0%, #4ADE80 100%)" }} className="animate-pulse" />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 110, borderRadius: 16, background: "#E5E7EB" }} className="animate-pulse" />
          ))}
        </div>
        <div style={{ height: 400, borderRadius: 20, background: "#E5E7EB" }} className="animate-pulse" />
      </div>
    </div>
  );
}

// ─── Not Signed In ────────────────────────────────────────────────────────────
function NotSignedIn() {
  return (
    <section style={{ minHeight: "100vh", background: "#F8F9FC", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {BG_ICONS.map(({ Icon, top, left, size, rotate }, i) => (
        <div key={i} className="hidden lg:block" style={{ position: "fixed", top, left, color: "#BFDBFE", pointerEvents: "none", transform: `rotate(${rotate}deg)` }}>
          <Icon size={size} strokeWidth={1.2} />
        </div>
      ))}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ textAlign: "center", maxWidth: 400, padding: "0 24px" }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, #2563EB, #4ADE80)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", boxShadow: "0 20px 40px rgba(37,99,235,0.25)" }}>
          <GraduationCap size={38} color="white" />
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, fontWeight: 700, color: "#0F172A", marginBottom: 12, lineHeight: 1.2 }}>
          Your Academic<br />Dashboard
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
          Sign in to track progress, review flashcard performance, monitor quiz scores, and maintain study streaks across all PharmaWallah subjects.
        </p>
        <SignInButton mode="modal">
          <button style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", borderRadius: 14, background: "linear-gradient(135deg, #2563EB, #4ADE80)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", boxShadow: "0 8px 24px rgba(37,99,235,0.3)", transition: "transform 0.2s, box-shadow 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(37,99,235,0.4)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(37,99,235,0.3)"; }}>
            <LogIn size={17} /> Sign in to get started
          </button>
        </SignInButton>
        <p style={{ marginTop: 14, fontSize: 11, color: "#94A3B8" }}>Free to join · No spam · Pharm-D students only</p>
      </motion.div>
    </section>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { progress, loading } = useProgress();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const units = progress?.units ?? [];
  const flashcards = progress?.flashcards ?? [];
  const quizAttempts = progress?.quizAttempts ?? [];
  const spotting = progress?.spotting ?? [];
  const recentActivity = progress?.recentActivity ?? [];
  const totalTimeMin = progress?.totalTimeSpentMin ?? 0;
  const displayName = progress?.displayName ?? "Student";
  const avatarUrl = progress?.avatarUrl ?? null;
  const joinedAt = progress?.joinedAt ?? new Date().toISOString();

  const { current: currentStreak, longest: longestStreak, weekMap } = useMemo(
    () => computeStreak(recentActivity),
    [recentActivity]
  );

  if (!isLoaded || loading) return <Skeleton />;
  if (!isSignedIn) return <NotSignedIn />;
  if (!progress) return <Skeleton />;

  const completedUnits = units.filter(u => u.completed).length;
  const totalFC = flashcards.reduce((s, f) => s + f.cardsReviewed, 0);
  const totalQuizzes = quizAttempts.length;
  const avgScore = totalQuizzes
    ? Math.round(quizAttempts.reduce((s, q) => s + pct(q.score, q.total), 0) / totalQuizzes)
    : 0;
  const spottingDone = spotting.filter(s => s.completed).length;
  const hoursStudied = Math.round(totalTimeMin / 60 * 10) / 10;

  const unitsBySubject = units.reduce<Record<string, typeof units>>((acc, u) => {
    (acc[u.subject] = acc[u.subject] || []).push(u);
    return acc;
  }, {});

  const bestQuiz = quizAttempts.length
    ? quizAttempts.reduce((a, b) => pct(a.score, a.total) >= pct(b.score, b.total) ? a : b)
    : null;

  const totalFCCorrect = flashcards.reduce((s, f) => s + f.cardsCorrect, 0);
  const fcAccuracy = totalFC ? pct(totalFCCorrect, totalFC) : 0;

  const weekDays = Object.entries(weekMap);
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: "white",
    borderRadius: 20,
    border: "1px solid #E2E8F0",
    padding: "22px 24px",
    ...extra,
  });

  return (
    <section style={{ minHeight: "100vh", background: "#F1F5F9", fontFamily: "'DM Sans', -apple-system, sans-serif", position: "relative", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        .pw-link { text-decoration: none; }
        .pw-hover-lift { transition: transform 0.2s, box-shadow 0.2s; }
        .pw-hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important; }
        
        /* Responsive breakpoints */
        @media (max-width: 1024px) {
          .bg-icon { display: none !important; }
          .hero-meta { gap: 8px !important; }
          .hero-meta > div { min-width: 70px !important; padding: 10px 12px !important; }
        }
        
        @media (max-width: 768px) {
          .dash-grid { grid-template-columns: 1fr !important; }
          .dash-grid-left { grid-column: auto !important; }
          .inner-two-col { grid-template-columns: 1fr !important; gap: 16px !important; }
          .stat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 12px !important; }
          .hero-row { flex-direction: column !important; align-items: stretch !important; gap: 20px !important; }
          .hero-meta { justify-content: space-between !important; width: 100% !important; }
          .hero-meta > div { flex: 1 !important; text-align: center !important; }
          .card-padding { padding: 18px 16px !important; }
          .week-strip { overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
          .week-strip-inner { display: inline-flex; gap: 12px; }
          .stat-card-val { font-size: 22px !important; }
          .hero-title { font-size: 22px !important; }
          .hero-avatar { width: 56px !important; height: 56px !important; }
        }
        
        @media (max-width: 480px) {
          .stat-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .hero-meta > div { padding: 8px 10px !important; }
          .hero-meta > div p:first-of-type { font-size: 16px !important; }
          .hero-meta > div p:last-of-type { font-size: 9px !important; }
          .card-padding { padding: 14px !important; }
          .fc-item { padding: 8px 10px !important; }
          .quiz-item { padding: 8px 10px !important; }
          .recent-item { gap: 8px !important; }
        }
        
        /* Scrollbar for week strip */
        .week-strip::-webkit-scrollbar { height: 2px; }
        .week-strip::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .week-strip::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 10px; }
        
        /* Touch-friendly tap targets */
        .tap-target { cursor: pointer; transition: opacity 0.2s; }
        .tap-target:active { opacity: 0.7; }
        @media (max-width: 768px) {
          .tap-target { min-height: 44px; display: flex; align-items: center; }
        }
      `}</style>

      {BG_ICONS.map(({ Icon, top, left, size, rotate }, i) => (
        <div key={i} className="bg-icon hidden xl:block" style={{ position: "fixed", top, left, color: "#BFDBFE", pointerEvents: "none", zIndex: 0, transform: `rotate(${rotate}deg)` }}>
          <Icon size={size} strokeWidth={1.2} />
        </div>
      ))}

      {/* ══ HERO BANNER with updated gradient (blue-600 to green-400) ══ */}
      <div style={{ position: "relative", background: "linear-gradient(135deg, #2563EB 0%, #4ADE80 100%)", overflow: "hidden", zIndex: 1 }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -30, left: 80, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 30, right: "20%", opacity: 0.07, pointerEvents: "none" }}>
          <GraduationCap size={120} color="white" />
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 28px", position: "relative", zIndex: 1 }}>
          <div className="hero-row" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flex: 1 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="hero-avatar" style={{ width: 72, height: 72, borderRadius: 18, objectFit: "cover", border: "2.5px solid rgba(255,255,255,0.3)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }} />
                ) : (
                  <div className="hero-avatar" style={{ width: 72, height: 72, borderRadius: 18, background: "rgba(255,255,255,0.15)", border: "2.5px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: "white" }}>{displayName[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div style={{ position: "absolute", bottom: -4, right: -4 }}>
                  <UserButton appearance={{ elements: { avatarBox: "w-6 h-6 rounded-lg border-2 border-white shadow" } }} />
                </div>
              </div>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "rgba(255,255,255,0.15)", marginBottom: 6 }}>
                  <Sparkles size={9} color="rgba(255,255,255,0.9)" />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>Pharm-D Student</span>
                </div>
                <h1 className="hero-title" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: 4 }}>
                  {displayName}
                </h1>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: 5 }}>
                  <CalendarDays size={11} /> Member since {fmtDate(joinedAt)}
                </p>
              </div>
            </div>

            <div className="hero-meta" style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              {[
                { icon: <Flame size={16} color="#FCD34D" />, val: currentStreak || 0, label: "Day Streak" },
                { icon: <Clock size={16} color="rgba(255,255,255,0.7)" />, val: `${hoursStudied}h`, label: "Studied" },
                { icon: <Trophy size={16} color="#FCD34D" />, val: `${avgScore || 0}%`, label: "Avg Score" },
              ].map(({ icon, val, label }, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 16, padding: "12px 16px", textAlign: "center", minWidth: 76, backdropFilter: "blur(8px)" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>{icon}</div>
                  <p style={{ fontSize: 20, fontWeight: 800, color: "white", lineHeight: 1 }}>{val}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2, fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Week activity strip - scrollable on mobile */}
          <div className="week-strip" style={{ marginTop: 22, padding: "14px 18px", background: "rgba(255,255,255,0.08)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.15)" }}>
            <div className="week-strip-inner" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginRight: 4, flexShrink: 0 }}>This week</span>
              {weekDays.map(([dateStr, active], i) => {
                const d = new Date(dateStr);
                const label = dayLabels[d.getDay()];
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.3s" }}>
                      {active && <CheckCircle2 size={14} color="#2563EB" />}
                    </div>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{label}</span>
                  </div>
                );
              })}
              {currentStreak > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: "#FCD34D", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <Flame size={12} color="#FCD34D" /> {currentStreak} day{currentStreak !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px", position: "relative", zIndex: 1 }}>

        {/* Stat cards - responsive grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { icon: <BookOpen size={18} color="white" />, label: "Units Studied", val: units.length, sub: `${completedUnits} completed`, gradient: "linear-gradient(135deg, #2563EB, #4ADE80)" },
            { icon: <Brain size={18} color="white" />, label: "Flashcards Reviewed", val: totalFC, sub: `${fcAccuracy}% accuracy`, gradient: "linear-gradient(135deg, #7C3AED, #DB2777)" },
            { icon: <Target size={18} color="white" />, label: "Quiz Average", val: totalQuizzes ? `${avgScore}%` : "—", sub: `${totalQuizzes} attempts`, gradient: "linear-gradient(135deg, #059669, #0891B2)" },
            { icon: <Microscope size={18} color="white" />, label: "Spotting Done", val: spottingDone, sub: `${spotting.length} visited`, gradient: "linear-gradient(135deg, #D97706, #DC2626)" },
          ].map(({ icon, label, val, sub, gradient }, i) => (
            <motion.div key={i} className="pw-hover-lift" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ ...card({ padding: "18px 20px" }), position: "relative", overflow: "hidden", cursor: "default" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: gradient, borderRadius: "20px 20px 0 0" }} />
              <div style={{ width: 40, height: 40, borderRadius: 12, background: gradient, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, boxShadow: `0 4px 14px rgba(0,0,0,0.1)` }}>
                {icon}
              </div>
              <p className="stat-card-val" style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", lineHeight: 1, marginBottom: 2 }}>{val}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 2 }}>{label}</p>
              <p style={{ fontSize: 11, color: "#94A3B8" }}>{sub}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main bento grid - responsive stacking */}
        <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 340px", gap: 16 }}>

          {/* LEFT COLUMN */}
          <div className="dash-grid-left" style={{ gridColumn: "1 / 3", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Course Units */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={card()}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #2563EB, #4ADE80)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <BookOpen size={16} color="white" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Course Units</h2>
                    <p style={{ fontSize: 11, color: "#94A3B8" }}>{units.length} units across {Object.keys(unitsBySubject).length} subject{Object.keys(unitsBySubject).length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <Link href="/courses" className="pw-link tap-target" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#2563EB" }}>
                  View all <ArrowUpRight size={13} />
                </Link>
              </div>

              {Object.keys(unitsBySubject).length === 0 ? (
                <EmptyState icon={<BookOpen size={22} />} iconColor="#2563EB" title="No units visited yet" desc="Start reading a course unit to track your progress." href="/courses" cta="Browse Courses" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Object.entries(unitsBySubject).map(([subject, subUnits]) => {
                    const done = subUnits.filter(u => u.completed).length;
                    const isExpanded = expandedSubject === subject;
                    const progress = pct(done, subUnits.length);

                    return (
                      <div key={subject} style={{ border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden" }}>
                        <button
                          onClick={() => setExpandedSubject(isExpanded ? null : subject)}
                          className="tap-target"
                          style={{ width: "100%", padding: "14px 16px", background: isExpanded ? "#F8FAFC" : "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{subject}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Tag color="#2563EB">{done}/{subUnits.length} done</Tag>
                                {isExpanded ? <ChevronUp size={14} color="#64748B" /> : <ChevronDown size={14} color="#64748B" />}
                              </div>
                            </div>
                            <MiniBar value={progress} color={progress === 100 ? "#059669" : "#2563EB"} />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} style={{ overflow: "hidden" }}>
                              <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
                                {subUnits.map(u => (
                                  <div key={u.unitId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "#F8FAFC", flexWrap: "wrap" }}>
                                    {u.completed
                                      ? <CheckCircle2 size={14} color="#059669" style={{ flexShrink: 0 }} />
                                      : <Circle size={14} color="#CBD5E1" style={{ flexShrink: 0 }} />}
                                    <span style={{ fontSize: 12, color: "#334155", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.unitTitle}</span>
                                    <span style={{ fontSize: 10, color: "#94A3B8", flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
                                      <BookOpen size={9} /> {u.readCount}× · {u.timeSpentMin}m
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Flashcard Performance + Quiz History side by side - responsive inner grid */}
            <div className="inner-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

              {/* Flashcards */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={card()}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #7C3AED, #DB2777)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Brain size={15} color="white" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Flashcards</h2>
                      <p style={{ fontSize: 10, color: "#94A3B8" }}>{fcAccuracy}% overall accuracy</p>
                    </div>
                  </div>
                  <Link href="/flashcards" className="pw-link tap-target" style={{ fontSize: 11, fontWeight: 600, color: "#7C3AED", display: "flex", alignItems: "center", gap: 3 }}>
                    Practice <ChevronRight size={12} />
                  </Link>
                </div>

                {flashcards.length === 0 ? (
                  <EmptyState icon={<Brain size={20} />} iconColor="#7C3AED" title="No sessions yet" desc="Practice flashcards to see breakdown." href="/flashcards" cta="Start" />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {flashcards.map(f => {
                      const meta = FC_META[f.category] ?? { label: f.category, color: "#64748B", bg: "rgba(100,116,139,0.08)" };
                      const acc = pct(f.cardsCorrect, f.cardsReviewed);
                      return (
                        <div key={f.category} className="fc-item" style={{ padding: "10px 12px", borderRadius: 12, background: meta.bg, border: `1px solid ${meta.color}18` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#1E293B" }}>{meta.label}</p>
                            {f.cardsCorrect > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: meta.color }}>{acc}%</span>}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{f.cardsReviewed}</span>
                            <span style={{ fontSize: 10, color: "#94A3B8" }}>{timeAgo(f.lastPracticed)}</span>
                          </div>
                          <MiniBar value={Math.min(f.cardsReviewed / 1.2, 100)} color={meta.color} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>

              {/* Quiz History */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} style={card()}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg, #059669, #0891B2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Target size={15} color="white" />
                    </div>
                    <div>
                      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Quiz History</h2>
                      <p style={{ fontSize: 10, color: "#94A3B8" }}>{totalQuizzes} attempt{totalQuizzes !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <Link href="/spotting" className="pw-link tap-target" style={{ fontSize: 11, fontWeight: 600, color: "#059669", display: "flex", alignItems: "center", gap: 3 }}>
                    Try Test <ChevronRight size={12} />
                  </Link>
                </div>

                {quizAttempts.length === 0 ? (
                  <EmptyState icon={<Target size={20} />} iconColor="#059669" title="No quizzes yet" desc="Complete a spotting test to see scores." href="/spotting" cta="Try a Test" />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[...quizAttempts].reverse().slice(0, 5).map((q, i) => {
                      const score = pct(q.score, q.total);
                      const { grade, color, bg } = gradeInfo(score);
                      return (
                        <div key={i} className="quiz-item" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 12, background: "#F8FAFC" }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color }}>{grade}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 11, fontWeight: 600, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.subject}</p>
                            <p style={{ fontSize: 10, color: "#94A3B8" }}>{q.score}/{q.total} · {q.timeTakenMin}m</p>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>{score}%</span>
                        </div>
                      );
                    })}
                    {quizAttempts.length > 5 && (
                      <p style={{ fontSize: 10, color: "#94A3B8", textAlign: "center", paddingTop: 4 }}>+{quizAttempts.length - 5} more attempts</p>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Streak card with updated gradient */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              style={{ borderRadius: 20, background: "linear-gradient(145deg, #2563EB, #4ADE80)", overflow: "hidden", padding: "22px 22px 20px", position: "relative" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -20, left: 10, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Flame size={15} color="#FCD34D" />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Study Streak</span>
                </div>
                <p style={{ fontSize: 52, fontWeight: 800, color: "white", lineHeight: 1, marginBottom: 2 }}>{currentStreak}</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 16 }}>
                  day{currentStreak !== 1 ? "s" : ""} in a row
                </p>
                <div style={{ height: 1, background: "rgba(255,255,255,0.15)", marginBottom: 14 }} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Longest</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 5 }}>
                      <Trophy size={13} color="#FCD34D" /> {longestStreak} day{longestStreak !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>Hours</p>
                    <p style={{ fontSize: 16, fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
                      <Clock size={13} color="rgba(255,255,255,0.7)" /> {hoursStudied}h
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Best score */}
            {bestQuiz && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={card({ padding: "18px 20px" })}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Star size={13} color="#F59E0B" fill="#F59E0B" />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8" }}>Best Score</span>
                </div>
                <p style={{ fontSize: 42, fontWeight: 800, color: "#0F172A", lineHeight: 1, marginBottom: 4 }}>
                  {pct(bestQuiz.score, bestQuiz.total)}<span style={{ fontSize: 20, color: "#64748B" }}>%</span>
                </p>
                <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bestQuiz.subject}</p>
                <p style={{ fontSize: 11, color: "#94A3B8" }}>{bestQuiz.score}/{bestQuiz.total} correct</p>
              </motion.div>
            )}

            {/* Spotting checklist */}
            {spotting.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={card({ padding: "18px 20px" })}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #D97706, #DC2626)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Microscope size={14} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Spotting</h3>
                      <p style={{ fontSize: 10, color: "#94A3B8" }}>{spottingDone}/{spotting.length} done</p>
                    </div>
                  </div>
                  <Link href="/spotting" className="pw-link tap-target" style={{ fontSize: 11, fontWeight: 600, color: "#D97706", display: "flex", alignItems: "center", gap: 3 }}>
                    View <ArrowUpRight size={12} />
                  </Link>
                </div>
                <MiniBar value={pct(spottingDone, spotting.length)} color="#D97706" />
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 5 }}>
                  {spotting.slice(0, 4).map((s, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
                      {s.completed
                        ? <CheckCircle2 size={13} color="#059669" style={{ flexShrink: 0 }} />
                        : <Circle size={13} color="#CBD5E1" style={{ flexShrink: 0 }} />}
                      <span style={{ fontSize: 11, color: "#475569", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "capitalize" }}>
                        {s.lessonId.replace(/-/g, " ")}
                      </span>
                      <Tag color="#D97706">{s.category}</Tag>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} style={card({ padding: "18px 20px" })}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #2563EB, #4ADE80)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Activity size={14} color="white" />
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Recent Activity</h3>
              </div>

              {recentActivity.length === 0 ? (
                <p style={{ fontSize: 12, color: "#94A3B8", textAlign: "center", padding: "20px 0" }}>No activity recorded yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...recentActivity].reverse().slice(0, 6).map((a, i) => {
                    const color = ACT_COLOR[a.type] ?? "#64748B";
                    return (
                      <div key={i} className="recent-item" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}12`, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color }}>
                          {ACT_ICON[a.type] ?? <Zap size={12} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {a.href ? (
                            <Link href={a.href} className="pw-link tap-target" style={{ fontSize: 11, color: "#334155", fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {a.label}
                            </Link>
                          ) : (
                            <p style={{ fontSize: 11, color: "#334155", fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.label}</p>
                          )}
                          <p style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>{timeAgo(a.timestamp)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Quick Links */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} style={card({ padding: "18px 20px" })}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}>
                <Zap size={11} /> Quick Links
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { href: "/courses", icon: <BookOpen size={14} />, label: "Courses", color: "#2563EB" },
                  { href: "/flashcards", icon: <Brain size={14} />, label: "Flashcards", color: "#7C3AED" },
                  { href: "/spotting", icon: <Microscope size={14} />, label: "Spotting", color: "#D97706" },
                  { href: "/encyclopedia", icon: <Database size={14} />, label: "Drug Search", color: "#DB2777" },
                  { href: "/books", icon: <Library size={14} />, label: "Book Library", color: "#0891B2" },
                ].map(({ href, icon, label, color }) => (
                  <Link key={href} href={href} className="pw-link tap-target"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 12, transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F1F5F9"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: `${color}12`, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                      {icon}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", flex: 1 }}>{label}</span>
                    <ChevronRight size={13} color="#CBD5E1" />
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
function EmptyState({ icon, iconColor, title, desc, href, cta }: {
  icon: React.ReactNode; iconColor: string; title: string; desc: string; href: string; cta: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "28px 16px" }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${iconColor}10`, border: `1px solid ${iconColor}20`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: iconColor }}>
        {icon}
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 11, color: "#94A3B8", marginBottom: 16, maxWidth: 220, margin: "0 auto 16px" }}>{desc}</p>
      <Link href={href} className="tap-target" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: `linear-gradient(135deg, ${iconColor}, ${iconColor}cc)`, color: "white", fontSize: 11, fontWeight: 700, boxShadow: `0 4px 12px ${iconColor}30` }}>
        {cta} <ChevronRight size={11} />
      </Link>
    </div>
  );
}