"use client";

import "./dashboard.css";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { CommandPalette } from "./CommandPalette";
import { AccountMenu, MobileSheet, Rail, SECTIONS, TopBar, type SectionId } from "./Shell";
import {
  ActivityFeed, CalendarPanel, CoverageCard, FigureStrip, Greeting, KeepGoing, MilestonesSection,
  NextUpPanel, QuizPanel, SectionHead, SyllabusSection,
} from "./Sections";
import {
  activityCalendar, dedupeActivity, greeting, milestones, nextUp, quizStats, studyStreak, syllabusCoverage,
  type ActivityRow, type QuizRow, type UnitRow,
} from "./dashboard-data";
import { useDashboardMotion } from "./useDashboardMotion";

/*
 * /dashboard — rebuilt 2026-09-13 (top-design pass, "next up" + syllabus
 * coverage direction). Chromeless: AppShell drops the site header and footer
 * here, so the rail and top bar below are the only navigation.
 *
 * Why it loads faster than the one it replaced:
 *  - The frame (rail, top bar, greeting, every panel's skeleton) paints
 *    immediately. The old page held a full-page skeleton until BOTH the auth
 *    session and /api/progress had answered.
 *  - No recharts, no canvas-confetti, no framer-motion. Charts are inline SVG;
 *    GSAP is fetched in the background and only choreographs what is already
 *    on screen.
 *
 * Ad-free by decision (adsense-monetization skill). Middleware keeps
 * signed-out visitors out, and sends signed-in visitors of `/` here.
 */

const SECTION_IDS = SECTIONS.map((s) => s.id);
const THEME_KEY = "pw-dash-theme";

export type DashboardViewProps = {
  user: { email?: string; user_metadata?: { full_name?: string } } | null;
  authLoading: boolean;
  progress: {
    units: unknown[];
    quizAttempts: unknown[];
    spotting: unknown[];
    recentActivity: unknown[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
  };
  onSignOut: () => void | Promise<void>;
};

/** The whole dashboard as a function of its data — page.tsx wires the hooks. */
export function DashboardView({ user, authLoading, progress, onSignOut }: DashboardViewProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Skeletons only on the first load — a manual refresh keeps the figures up.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!authLoading && !progress.isLoading) setLoaded(true);
  }, [authLoading, progress.isLoading]);
  const loading = !loaded;

  const [active, setActive] = useState<SectionId>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dark, setDark] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const onSection = useCallback((id: string) => setActive(id as SectionId), []);

  useEffect(() => {
    try {
      setDark(localStorage.getItem(THEME_KEY) === "dark");
    } catch {
      /* storage blocked — light theme */
    }
  }, []);
  const toggleDark = () =>
    setDark((d) => {
      try {
        localStorage.setItem(THEME_KEY, d ? "light" : "dark");
      } catch {
        /* not persisted */
      }
      return !d;
    });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const intro = useDashboardMotion(rootRef, { ready: loaded, sections: SECTION_IDS, onSection });

  // ── Derived figures ────────────────────────────────────────────────────
  const units = progress.units as UnitRow[];
  const quizzes = progress.quizAttempts as QuizRow[];
  const spottingCount = progress.spotting.length;
  const d = useMemo(() => {
    const activity = dedupeActivity(progress.recentActivity as ActivityRow[]);
    const cov = syllabusCoverage(units);
    const streak = studyStreak(activity);
    const quiz = quizStats(quizzes);
    return {
      activity,
      cov,
      streak,
      quiz,
      calendar: activityCalendar(activity),
      next: nextUp(units),
      milestones: milestones({
        unitsRead: cov.read,
        bestSubjectPct: Math.max(0, ...cov.subjects.map((s) => s.pct)),
        quizCount: quiz.count,
        quizAvg: quiz.avg,
        longestStreak: streak.longest,
        spottingCount,
      }),
    };
  }, [progress.recentActivity, spottingCount, units, quizzes]);

  const name =
    user?.user_metadata?.full_name?.trim() || user?.email?.split("@")[0] || "Student";
  const firstName = user ? name.split(/\s+/)[0] : null;

  const summary = useMemo(() => {
    const { cov, quiz, streak, activity } = d;
    if (!activity.length && !cov.opened) {
      return "Your dashboard fills in as you study. Start with the unit on the left — every lesson, quiz and slide you open is counted here.";
    }
    const unread = cov.opened - cov.read;
    const done = `You've read ${cov.read} of ${cov.total} units${unread ? ` (${unread} more opened)` : ""}${quiz.count ? ` and finished ${quiz.count} quiz${quiz.count === 1 ? "" : "zes"}` : ""}.`;
    const run = streak.atRisk
      ? ` Your ${streak.current}-day streak ends tonight unless you study today.`
      : streak.studiedToday
        ? ` ${streak.current} ${streak.current === 1 ? "day" : "days"} running — today already counts.`
        : " Open a unit today to start a streak.";
    return done + run;
  }, [d]);

  const refresh = async () => {
    setRefreshing(true);
    await progress.refetch();
    setRefreshing(false);
  };

  // The session can end in another tab; middleware only guards the first request.
  if (!authLoading && !user) {
    return (
      <div className="pw-dash grid place-items-center px-4">
        <div className="d-panel w-full max-w-sm p-8 text-center">
          <p className="d-eyebrow justify-center">Signed out</p>
          <h1 className="mt-4 text-[28px] font-bold tracking-[-0.04em]">Sign in to see your dashboard.</h1>
          <Button asChild className="mt-6 h-11 w-full bg-[#1c7bd9] hover:bg-[#1668b8]">
            <Link href="/signin?redirect=/dashboard">
              Go to sign in <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const account = (placement: "up" | "down") => (
    <AccountMenu name={name} email={user?.email} onSignOut={onSignOut} placement={placement} />
  );

  return (
    <div ref={rootRef} className={cn("pw-dash", dark && "dark")} data-intro={loading ? undefined : intro}>
      <Rail active={active} user={account("up")} />
      <MobileSheet open={menuOpen} onClose={closeMenu} active={active} user={account("up")} />
      <CommandPalette open={paletteOpen} onClose={closePalette} />

      <div className="lg:pl-[256px]">
        <TopBar
          active={active}
          onMenu={() => setMenuOpen(true)}
          onSearch={() => setPaletteOpen(true)}
          onRefresh={refresh}
          refreshing={refreshing}
          dark={dark}
          onToggleDark={toggleDark}
          account={account("down")}
        />

        <div className="mx-auto max-w-[1240px] px-4 pb-24 sm:px-8">
          {progress.error && (
            <div role="alert" className="d-panel mt-6 flex flex-wrap items-center gap-3 p-4 text-[14px]">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
              <p className="min-w-0 flex-1 text-[var(--ink-2)]">
                Couldn&apos;t reach your progress just now{loaded ? " — showing what we had." : "."}
              </p>
              <Button size="sm" variant="outline" onClick={refresh} className="border-[var(--line-2)] bg-transparent text-[var(--ink)] hover:bg-[var(--panel-2)] hover:text-[var(--ink)]">
                Try again
              </Button>
            </div>
          )}

          <section id="overview" aria-label="Overview" className="scroll-mt-20">
            <Greeting hello={greeting()} name={firstName} summary={summary} loading={loading} />
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-12">
              <NextUpPanel next={d.next} loading={loading} />
              <CoverageCard
                pct={d.cov.pct}
                opened={d.cov.opened}
                read={d.cov.read}
                total={d.cov.total}
                subjects={d.cov.subjects}
                loading={loading}
              />
            </div>
            <FigureStrip
              loading={loading}
              streak={d.streak.current}
              longest={d.streak.longest}
              atRisk={d.streak.atRisk}
              studiedToday={d.streak.studiedToday}
              active30={d.calendar.activeLast30}
              quizAvg={d.quiz.avg}
              quizCount={d.quiz.count}
              spotting={spottingCount}
            />
          </section>

          <SyllabusSection subjects={d.cov.subjects} nextHref={d.next?.href} loading={loading} />

          <section id="practice" className="scroll-mt-20 pt-20">
            <SectionHead index="03" eyebrow="Practice" title="How your study is going." />
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-12">
              <CalendarPanel columns={d.calendar.columns} activeTotal={d.calendar.activeTotal} loading={loading} />
              <QuizPanel loading={loading} stats={d.quiz} />
            </div>
          </section>

          <section id="activity" className="scroll-mt-20 pt-20">
            <SectionHead index="04" eyebrow="Activity" title="What you did, and what's next." />
            <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-12">
              <ActivityFeed rows={d.activity} loading={loading} />
              <KeepGoing />
            </div>
          </section>

          <MilestonesSection items={d.milestones} loading={loading} />

          <footer className="mt-24 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6 text-[12.5px] text-[var(--ink-3)]">
            <p>Figures come from your own activity over the last 13 weeks, counted in your time zone.</p>
            <nav aria-label="Legal" className="flex gap-5">
              <Link href="/privacy" className="hover:text-[var(--ink)]">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--ink)]">Terms</Link>
              <Link href="/faqs" className="hover:text-[var(--ink)]">Help</Link>
            </nav>
          </footer>
        </div>
      </div>
    </div>
  );
}
