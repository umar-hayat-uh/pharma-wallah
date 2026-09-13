"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, CalendarDays, Check, Flame, Microscope, RotateCcw, Target, Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BRAND_SURFACE } from "@/components/page-kit/brand";
import { cn } from "@/lib/utils";
import {
  activityKind, dayHeading, relativeTime,
  type ActivityRow, type HeatCell, type Milestone, type NextUp, type QuizRow, type SubjectCoverage,
  REFERENCE_LINKS, STUDY_LINKS,
} from "./dashboard-data";
import { jumpTo } from "./Shell";

/*
 * The dashboard's content. Every panel takes `loading` and renders a skeleton
 * of its own final shape, so the page frame paints at once and each section
 * fills in when /api/progress answers — no full-page spinner.
 *
 * Motion hooks are data attributes read by useDashboardMotion:
 *   data-reveal   first-screen entrance      data-count  counts up to its value
 *   data-cascade  children [data-cell] pop   data-ring   coverage ring draws
 *   data-draw     SVG path draws             data-bar    bar fills from the left
 *   data-rise     block rises on scroll      data-drift  parallax against scroll
 *   data-magnetic follows a fine pointer
 */

const pad2 = (n: number) => String(n).padStart(2, "0");

function Skel({ className }: { className?: string }) {
  return <div className={cn("d-skel", className)} aria-hidden="true" />;
}

/** Numbers that count up. `key` remounts the node when the value changes, because GSAP writes its text directly. */
function Count({ value }: { value: number }) {
  return (
    <span key={value} data-count={value} className="tabular-nums">
      {value.toLocaleString()}
    </span>
  );
}

export function SectionHead({ index, eyebrow, title, aside }: { index: string; eyebrow: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <p className="d-eyebrow">
          <span className="text-[var(--blue)]">{index}</span> {eyebrow}
        </p>
        <h2 className="mt-3 text-[clamp(1.6rem,1.2rem+1.4vw,2.35rem)] font-bold leading-[1.05] tracking-[-0.035em]">{title}</h2>
      </div>
      {aside}
    </div>
  );
}

// ─── Greeting ────────────────────────────────────────────────────────────

export function Greeting({
  hello, name, summary, loading,
}: { hello: string; name: string | null; summary: string; loading: boolean }) {
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="grid items-end gap-6 pb-8 pt-8 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:pb-10">
      <div>
        <p className="d-eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1c7bd9]" aria-hidden="true" />
          {today}
        </p>
        <h1 className="mt-5 text-[clamp(2.7rem,1.4rem+4.6vw,5.6rem)] font-bold leading-[0.94] tracking-[-0.055em]">
          <span className="d-line">
            <span style={{ ["--i" as string]: 0 }}>{hello},</span>
          </span>
          <span className="d-line">
            <span style={{ ["--i" as string]: 1 }} className="d-name pr-[0.06em]">
              {name ?? "welcome back"}.
            </span>
          </span>
        </h1>
      </div>
      {loading ? (
        <div className="space-y-2.5 lg:pb-3">
          <Skel className="h-4 w-full" />
          <Skel className="h-4 w-4/5" />
        </div>
      ) : (
        <p data-reveal className="text-[16.5px] leading-relaxed text-[var(--ink-2)] [text-wrap:pretty] lg:pb-2">
          {summary}
        </p>
      )}
    </div>
  );
}

// ─── Next up ─────────────────────────────────────────────────────────────

export function NextUpPanel({ next, loading }: { next: NextUp | null; loading: boolean }) {
  const unitNumber = next ? next.subject.units.findIndex((u) => u.id === next.unit.id) + 1 : 0;

  return (
    <section
      data-reveal
      aria-label="Next up"
      className="relative isolate flex min-h-[360px] flex-col overflow-hidden rounded-[24px] p-6 text-white sm:p-9 lg:col-span-7"
      style={{ background: BRAND_SURFACE }}
    >
      {/* Ghost numeral: a low-alpha fill, never a stroke (Outfit's overlapping contours — gotcha 43). */}
      {next && (
        <span
          data-drift
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-10 -right-2 -z-10 select-none text-[clamp(11rem,8rem+12vw,19rem)] font-bold leading-none tracking-[-0.08em] text-white/[0.08]"
        >
          {pad2(unitNumber)}
        </span>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />

      <p className="d-eyebrow !text-white/90">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        {next?.kind === "start" ? "Start here" : next?.kind === "continue" ? "Continue reading" : "Next up"}
        {next && <span className="hidden truncate sm:inline">· {next.subject.title}</span>}
      </p>

      {loading || !next ? (
        <div className="mt-8 space-y-4">
          <div className="h-10 w-4/5 rounded-xl bg-white/15" />
          <div className="h-10 w-3/5 rounded-xl bg-white/15" />
          <div className="mt-6 h-4 w-2/3 rounded bg-white/10" />
        </div>
      ) : (
        <>
          <h2 className="mt-6 max-w-[20ch] text-[clamp(1.9rem,1.3rem+2.2vw,3.1rem)] font-bold leading-[1.02] tracking-[-0.04em] [text-wrap:balance]">
            {next.unit.title}
          </h2>
          <p className="mt-4 line-clamp-2 max-w-[52ch] text-[15.5px] leading-relaxed text-white/90">{next.unit.description}</p>

          <div className="mt-5 flex flex-wrap gap-2 text-[12.5px] text-white/90">
            <span className="rounded-full border border-white/25 px-2.5 py-1">
              Unit {unitNumber} of {next.subject.units.length}
            </span>
            <span className="rounded-full border border-white/25 px-2.5 py-1">{next.unit.difficulty}</span>
            <span className="rounded-full border border-white/25 px-2.5 py-1 sm:hidden">{next.subject.title}</span>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-8">
            <Link
              href={next.href}
              data-magnetic
              className="group inline-flex h-12 items-center gap-2.5 rounded-xl bg-white px-5 text-[15px] font-semibold text-[#0b2440] shadow-[0_10px_30px_-10px_rgba(0,0,0,.45)] transition-colors hover:bg-white/90"
            >
              {next.kind === "start" ? "Begin the first unit" : next.kind === "continue" ? "Continue unit" : "Open unit"}
              <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
            </Link>
            {next.last && next.last.unit.id !== next.unit.id && (
              <Link
                href={next.last.href}
                className="inline-flex min-w-0 items-center gap-2 text-[14px] text-white/90 underline-offset-4 hover:text-white hover:underline"
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Back to {next.last.unit.shortTitle || next.last.unit.title} · {relativeTime(next.last.when)}
                </span>
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  );
}

// ─── Coverage ring ───────────────────────────────────────────────────────

export function CoverageCard({
  pct, opened, read, total, subjects, loading,
}: { pct: number; opened: number; read: number; total: number; subjects: SubjectCoverage[]; loading: boolean }) {
  const r = 58;
  const len = 2 * Math.PI * r;
  const offset = len * (1 - pct / 100);

  return (
    <section data-reveal aria-label="Syllabus coverage" className="d-panel flex flex-col p-6 sm:p-7 lg:col-span-5">
      <div className="flex items-center justify-between">
        <p className="d-eyebrow">Syllabus coverage</p>
        <button
          type="button"
          onClick={() => jumpTo("syllabus")}
          className="d-link inline-flex items-center gap-1 text-[13px] font-medium text-[var(--blue)] hover:underline"
        >
          All units <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-5 flex items-center gap-6">
        <div className="relative h-[140px] w-[140px] shrink-0">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" aria-hidden="true">
            <defs>
              <linearGradient id="pw-dash-ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1C7BD9" />
                <stop offset="100%" stopColor="#21B67A" />
              </linearGradient>
            </defs>
            <circle cx="70" cy="70" r={r} fill="none" stroke="var(--panel-2)" strokeWidth="12" />
            {!loading && (
              <circle
                data-ring
                data-len={len}
                data-offset={offset}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke="url(#pw-dash-ring)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={len}
                strokeDashoffset={pct === 0 ? len : offset}
              />
            )}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            {loading ? (
              <Skel className="h-8 w-14" />
            ) : (
              <p className="text-[34px] font-bold leading-none tracking-[-0.05em]">
                <Count value={pct} />
                <span className="text-[16px] text-[var(--ink-3)]">%</span>
              </p>
            )}
          </div>
        </div>
        <div className="min-w-0">
          {loading ? (
            <div className="space-y-2">
              <Skel className="h-6 w-28" />
              <Skel className="h-4 w-40" />
            </div>
          ) : (
            <>
              <p className="text-[26px] font-bold leading-none tracking-[-0.04em]">
                {read} <span className="text-[var(--ink-3)]">/ {total}</span>
              </p>
              <p className="mt-2 text-[14px] leading-snug text-[var(--ink-2)]">
                units read across {subjects.length} subjects
              </p>
              {opened > read && (
                <p className="mt-1.5 text-[12.5px] text-[var(--ink-3)]">
                  {opened - read} more opened, not marked read
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <ul className="mt-auto space-y-3 pt-6">
        {(loading ? Array.from({ length: 4 }, () => null) : subjects).map((s, i) =>
          s ? (
            <li key={s.subject.slug}>
              <Link href={s.href} className="group block">
                <span className="mb-1.5 flex items-baseline justify-between gap-3 text-[13.5px]">
                  <span className="truncate font-medium text-[var(--ink-2)] group-hover:text-[var(--ink)]">{s.subject.title}</span>
                  <span className="shrink-0 font-mono text-[11.5px] text-[var(--ink-3)]">
                    {s.read}/{s.units.length}
                  </span>
                </span>
                <Progress
                  value={s.pct}
                  className="h-1.5 bg-[var(--panel-2)]"
                  indicatorClassName="bg-gradient-to-r from-[#1c7bd9] to-[#21b67a]"
                />
              </Link>
            </li>
          ) : (
            <li key={i}>
              <Skel className="mb-1.5 h-3.5 w-1/2" />
              <Skel className="h-1.5 w-full" />
            </li>
          ),
        )}
      </ul>
    </section>
  );
}

// ─── Figures ─────────────────────────────────────────────────────────────

export function FigureStrip({
  loading, streak, longest, atRisk, studiedToday, active30, quizAvg, quizCount, spotting,
}: {
  loading: boolean;
  streak: number;
  longest: number;
  atRisk: boolean;
  studiedToday: boolean;
  active30: number;
  quizAvg: number;
  quizCount: number;
  spotting: number;
}) {
  const figures = [
    {
      icon: Flame,
      label: "Study streak",
      value: streak,
      unit: streak === 1 ? "day" : "days",
      note: atRisk ? "Study today to keep it" : studiedToday ? `Today counts · best ${longest}` : "Study today to start one",
      warn: atRisk,
    },
    { icon: CalendarDays, label: "Active days", value: active30, unit: "of 30", note: "Days with any activity" },
    {
      icon: Target,
      label: "Quiz average",
      value: quizAvg,
      unit: "%",
      note: quizCount ? `Across ${quizCount} quiz${quizCount === 1 ? "" : "zes"}` : "No quizzes yet",
      empty: quizCount === 0,
    },
    { icon: Microscope, label: "Spotting lessons", value: spotting, unit: "opened", note: "Histology, pathology, powders" },
  ];

  return (
    <section
      data-reveal
      aria-label="Your figures"
      className="d-panel mt-5 grid grid-cols-2 lg:grid-cols-4 [&>div:nth-child(n+3)]:border-t lg:[&>div:nth-child(n+3)]:border-t-0 [&>div]:border-[var(--line)] [&>div:nth-child(even)]:border-l lg:[&>div:not(:first-child)]:border-l"
    >
      {figures.map((f) => (
        <div key={f.label} className="p-5 sm:p-6">
          <p className="flex items-center gap-2 text-[13px] font-medium text-[var(--ink-2)]">
            <f.icon className={cn("h-4 w-4", f.warn ? "text-amber-500" : "text-[var(--ink-3)]")} />
            {f.label}
          </p>
          {loading ? (
            <Skel className="mt-4 h-10 w-20" />
          ) : (
            <p className="mt-3 flex items-baseline gap-1.5">
              <span className="text-[clamp(2.1rem,1.6rem+1.6vw,3rem)] font-bold leading-none tracking-[-0.05em]">
                {f.empty ? "—" : <Count value={f.value} />}
              </span>
              {!f.empty && <span className="font-mono text-[12px] text-[var(--ink-3)]">{f.unit}</span>}
            </p>
          )}
          <p className={cn("mt-2 text-[12.5px] leading-snug", f.warn ? "text-amber-700 [.dark_&]:text-amber-400" : "text-[var(--ink-3)]")}>
            {loading ? " " : f.note}
          </p>
        </div>
      ))}
    </section>
  );
}

// ─── Syllabus ────────────────────────────────────────────────────────────

export function SyllabusSection({
  subjects, nextHref, loading,
}: { subjects: SubjectCoverage[]; nextHref?: string; loading: boolean }) {
  return (
    <section id="syllabus" className="scroll-mt-20 pt-20">
      <SectionHead
        index="02"
        eyebrow="Syllabus"
        title="Every unit, at a glance."
        aside={
          <ul className="flex flex-wrap items-center gap-4 text-[12.5px] text-[var(--ink-2)]">
            <li className="flex items-center gap-2"><span className="d-unit !h-3 w-5" data-state="read" /> Read</li>
            <li className="flex items-center gap-2"><span className="d-unit !h-3 w-5" data-state="opened" /> Opened</li>
            <li className="flex items-center gap-2"><span className="d-unit !h-3 w-5" data-next="true" /> Next up</li>
            <li className="flex items-center gap-2"><span className="d-unit !h-3 w-5" /> Not yet</li>
          </ul>
        }
      />

      <div className="d-panel divide-y divide-[var(--line)]">
        {(loading ? Array.from({ length: 4 }, () => null) : subjects).map((s, i) =>
          !s ? (
            <div key={i} className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[17rem_minmax(0,1fr)_5.5rem] lg:items-center">
              <Skel className="h-5 w-48" />
              <Skel className="h-[30px] w-full" />
              <Skel className="h-5 w-12" />
            </div>
          ) : (
            <div key={s.subject.slug} className="grid gap-4 p-5 sm:p-6 lg:grid-cols-[17rem_minmax(0,1fr)_5.5rem] lg:items-center">
              <div className="min-w-0">
                <Link href={s.href} className="group inline-flex max-w-full items-center gap-1.5 text-[15.5px] font-semibold tracking-[-0.01em] hover:text-[var(--blue)]">
                  <span className="truncate">{s.subject.title}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--ink-3)] transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--blue)]" />
                </Link>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
                  {s.subject.semester} · {s.subject.subjectCode}
                </p>
              </div>

              <ol
                data-cascade="0.5"
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${Math.min(s.units.length, 12)}, minmax(0, 1fr))` }}
              >
                {s.units.map((u, n) => {
                  const isNext = u.href === nextHref;
                  const state = u.read ? "read" : u.opened ? "opened, not marked read" : isNext ? "next up" : "not opened yet";
                  return (
                    <li key={u.unit.id} data-cell className="group relative">
                      <Link
                        href={u.href}
                        className="d-unit"
                        data-state={u.read ? "read" : u.opened ? "opened" : "none"}
                        data-next={isNext && !u.read}
                        aria-label={`Unit ${n + 1}: ${u.unit.title} — ${state}`}
                      />
                      <span
                        role="tooltip"
                        className="d-panel pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-max max-w-[15rem] -translate-x-1/2 px-3 py-2 text-[12.5px] leading-snug group-hover:block"
                      >
                        <span className="block font-mono text-[10.5px] uppercase tracking-[0.12em] text-[var(--ink-3)]">
                          Unit {n + 1} · {state}
                        </span>
                        <span className="mt-0.5 block font-medium">{u.unit.title}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>

              <p className="text-left lg:text-right">
                <span className="text-[22px] font-bold tracking-[-0.04em]">{s.pct}%</span>
                <span className="ml-2 font-mono text-[11.5px] text-[var(--ink-3)] lg:ml-0 lg:block">
                  {s.read}/{s.units.length} read
                </span>
              </p>
            </div>
          ),
        )}
      </div>
      <p className="mt-3 text-[12.5px] text-[var(--ink-3)]">
        A unit counts as read when you press “Mark as read” at the end of the lesson. Only subjects with published lessons are listed.
      </p>
    </section>
  );
}

// ─── Practice: calendar + quizzes ────────────────────────────────────────

const WEEKDAYS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

export function CalendarPanel({
  columns, activeTotal, loading,
}: { columns: HeatCell[][]; activeTotal: number; loading: boolean }) {
  const todayKey = columns.length ? columns[columns.length - 1].find((c) => !c.future && c.date.toDateString() === new Date().toDateString())?.key : undefined;

  return (
    <div data-rise className="d-panel p-5 sm:p-7 lg:col-span-7">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="d-eyebrow">Study calendar · 13 weeks</p>
          <div className="mt-3 text-[20px] font-semibold tracking-[-0.02em]">
            {loading ? <Skel className="h-6 w-44" /> : `${activeTotal} active ${activeTotal === 1 ? "day" : "days"}`}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--ink-3)]">
          Less
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className="d-heat !w-3" data-l={l} />
          ))}
          More
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[2rem_minmax(0,1fr)] gap-2">
        <div className="grid grid-rows-[1rem_repeat(7,minmax(0,1fr))] gap-[5px] font-mono text-[10px] text-[var(--ink-3)]">
          <span />
          {WEEKDAYS.map((d, i) => (
            <span key={i} className="flex items-center">{d}</span>
          ))}
        </div>
        <div className="grid gap-[5px]" style={{ gridTemplateColumns: `repeat(${columns.length || 13}, minmax(0, 1fr))` }}>
          {columns.map((col, w) => {
            const month = col[0].date.getMonth();
            const showMonth = w === 0 || columns[w - 1][0].date.getMonth() !== month;
            return (
              <div key={col[0].key} className="grid grid-rows-[1rem_repeat(7,minmax(0,1fr))] gap-[5px]">
                <span className="whitespace-nowrap font-mono text-[10px] leading-none text-[var(--ink-3)]">
                  {showMonth ? col[0].date.toLocaleDateString(undefined, { month: "short" }) : ""}
                </span>
                {col.map((c) => (
                  <span
                    key={c.key}
                    className={cn("d-heat", loading && "d-skel")}
                    data-l={loading ? 0 : c.level}
                    data-future={c.future}
                    data-today={c.key === todayKey}
                    title={
                      c.future
                        ? undefined
                        : `${c.count} ${c.count === 1 ? "action" : "actions"} · ${c.date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}`
                    }
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-[12.5px] text-[var(--ink-3)]">Days are counted in your own time zone.</p>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 320;
  const h = 84;
  if (values.length < 2) return null;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => [i * step, h - 6 - (v / 100) * (h - 12)] as const);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[84px] w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="pw-dash-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1C7BD9" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1C7BD9" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1="0" x2={w} y1={h - 6 - 0.8 * (h - 12)} y2={h - 6 - 0.8 * (h - 12)} stroke="var(--line-2)" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
      <path d={area} fill="url(#pw-dash-spark)" />
      <path data-draw d={line} fill="none" stroke="var(--blue)" strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="4" fill="var(--panel)" stroke="var(--blue)" strokeWidth="2.25" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function QuizPanel({
  loading, stats,
}: {
  loading: boolean;
  stats: { lessonChecks: number; count: number; avg: number; best: number; trend: number[]; recent: QuizRow[]; subjects: { name: string; attempts: number; avg: number }[] };
}) {
  return (
    <div data-rise className="d-panel flex flex-col p-5 sm:p-7 lg:col-span-5">
      <p className="d-eyebrow">MCQ performance</p>

      {loading ? (
        <div className="mt-5 space-y-4">
          <Skel className="h-12 w-32" />
          <Skel className="h-[84px] w-full" />
          <Skel className="h-4 w-full" />
          <Skel className="h-4 w-3/4" />
        </div>
      ) : stats.count === 0 ? (
        <div className="flex flex-1 flex-col items-start justify-center py-8">
          <p className="text-[20px] font-semibold tracking-[-0.02em]">No quizzes yet.</p>
          <p className="mt-2 max-w-[34ch] text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            Your scores, trend and weakest subject appear here after your first MCQ quiz.
          </p>
          <Button asChild className="mt-6 h-11 bg-[var(--blue)] hover:bg-[var(--blue)]/90">
            <Link href="/mcqs-bank">
              Take a quiz <ArrowRight />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-end justify-between gap-4">
            <p className="flex items-baseline gap-1.5">
              <span className="text-[48px] font-bold leading-none tracking-[-0.05em]">
                <Count value={stats.avg} />
              </span>
              <span className="font-mono text-[12px] text-[var(--ink-3)]">% average</span>
            </p>
            <p className="pb-1 text-right text-[12.5px] text-[var(--ink-3)]">
              Best <span className="font-semibold text-[var(--ink)]">{stats.best}%</span>
              <br />
              {stats.count} MCQ-bank {stats.count === 1 ? "test" : "tests"}
              {stats.lessonChecks > 0 && (
                <>
                  <br />
                  {stats.lessonChecks} lesson {stats.lessonChecks === 1 ? "check" : "checks"} not counted
                </>
              )}
            </p>
          </div>

          <div className="mt-5">
            <Sparkline values={stats.trend} />
            {stats.trend.length >= 2 && (
              <p className="mt-1 flex justify-between font-mono text-[10px] text-[var(--ink-3)]">
                <span>Last {stats.trend.length} quizzes</span>
                <span>80% line</span>
              </p>
            )}
          </div>

          <ul className="mt-6 space-y-3">
            {stats.subjects.slice(0, 4).map((s) => (
              <li key={s.name}>
                <p className="mb-1.5 flex justify-between gap-3 text-[13.5px]">
                  <span className="truncate text-[var(--ink-2)]">{s.name}</span>
                  <span className="shrink-0 font-mono text-[11.5px] text-[var(--ink-3)]">
                    {s.avg}% · {s.attempts}×
                  </span>
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--panel-2)]">
                  <div
                    data-bar
                    className={cn("h-full rounded-full", s.avg >= 80 ? "bg-[#21b67a]" : s.avg >= 60 ? "bg-[#1c7bd9]" : "bg-amber-500")}
                    style={{ width: `${Math.max(3, s.avg)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <Button asChild variant="outline" className="mt-auto h-11 border-[var(--line-2)] bg-transparent text-[var(--ink)] hover:bg-[var(--panel-2)] hover:text-[var(--ink)]">
            <Link href="/mcqs-bank" className="!mt-6">
              Practise more <ArrowRight />
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}

// ─── Activity ────────────────────────────────────────────────────────────

const FEED_PAGE = 10;

export function ActivityFeed({ rows, loading }: { rows: ActivityRow[]; loading: boolean }) {
  const [shown, setShown] = useState(FEED_PAGE);

  const groups = useMemo(() => {
    const out: { heading: string; items: ActivityRow[] }[] = [];
    rows.slice(0, shown).forEach((r) => {
      const heading = dayHeading(new Date(r.timestamp));
      const last = out[out.length - 1];
      if (last && last.heading === heading) last.items.push(r);
      else out.push({ heading, items: [r] });
    });
    return out;
  }, [rows, shown]);

  return (
    <div data-rise className="d-panel p-5 sm:p-7 lg:col-span-7">
      <p className="d-eyebrow">Recent activity</p>

      {loading ? (
        <div className="mt-6 space-y-5">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skel className="h-9 w-9 !rounded-full" />
              <div className="flex-1 space-y-2">
                <Skel className="h-4 w-3/5" />
                <Skel className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10">
          <p className="text-[20px] font-semibold tracking-[-0.02em]">Nothing logged yet.</p>
          <p className="mt-2 max-w-[40ch] text-[14.5px] leading-relaxed text-[var(--ink-2)]">
            Open a course unit, a spotting lesson or a quiz — each one lands here, and on your calendar.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-2">
            {groups.map((g) => (
              <div key={g.heading}>
                <p className="pb-2 pt-5 text-[12.5px] font-semibold text-[var(--ink-2)]">{g.heading}</p>
                <ol className="relative before:absolute before:bottom-4 before:left-[17px] before:top-4 before:w-px before:bg-[var(--line)]">
                  {g.items.map((r, i) => {
                    const label = r.label || r.title || "Activity";
                    const kind = activityKind(r.type, label);
                    const body = (
                      <>
                        <span className="relative z-[1] grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--panel)]">
                          <kind.icon className="h-4 w-4 text-[var(--blue)]" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14.5px] font-medium">{label}</span>
                          <span className="block text-[12.5px] text-[var(--ink-3)]">
                            {kind.name} · {new Date(r.timestamp).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                          </span>
                        </span>
                        {r.href && <ArrowUpRight className="h-4 w-4 shrink-0 text-[var(--ink-3)] opacity-0 transition-opacity group-hover:opacity-100" />}
                      </>
                    );
                    return (
                      <li key={`${r.timestamp}-${i}`}>
                        {r.href && r.href.startsWith("/") ? (
                          <Link href={r.href} className="d-link group -mx-2 flex items-center gap-4 rounded-xl px-2 py-2 hover:bg-[var(--panel-2)]">
                            {body}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-4 py-2">{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </div>
          {shown < rows.length && (
            <Button
              variant="outline"
              onClick={() => setShown((n) => n + FEED_PAGE * 2)}
              className="mt-5 h-11 w-full border-[var(--line-2)] bg-transparent text-[var(--ink)] hover:bg-[var(--panel-2)] hover:text-[var(--ink)]"
            >
              Show earlier activity
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export function KeepGoing() {
  const links = [...STUDY_LINKS.slice(1), ...REFERENCE_LINKS.slice(0, 1)];
  return (
    <div data-rise className="d-panel p-5 sm:p-7 lg:col-span-5">
      <p className="d-eyebrow">Keep going</p>
      <ul className="mt-4 grid grid-cols-2 gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="d-link group flex h-full flex-col rounded-2xl border border-[var(--line)] p-4 hover:-translate-y-0.5 hover:border-[var(--line-2)] hover:bg-[var(--panel-2)]"
            >
              <span className="flex items-center justify-between">
                <l.icon className="h-5 w-5 text-[var(--blue)]" />
                <ArrowUpRight className="h-4 w-4 text-[var(--ink-3)] transition-transform duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span className="mt-6 text-[14.5px] font-semibold tracking-[-0.01em]">{l.label}</span>
              <span className="text-[12.5px] text-[var(--ink-3)]">{l.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Milestones ──────────────────────────────────────────────────────────

export function MilestonesSection({ items, loading }: { items: Milestone[]; loading: boolean }) {
  const done = items.filter((m) => m.reached).length;
  return (
    <section id="milestones" className="scroll-mt-20 pt-20">
      <SectionHead
        index="05"
        eyebrow="Milestones"
        title="Earned, not given."
        aside={
          !loading && (
            <p className="text-[14px] text-[var(--ink-2)]">
              <span className="text-[22px] font-bold tracking-[-0.04em] text-[var(--ink)]">{done}</span> of {items.length} reached
            </p>
          )
        }
      />
      <ul data-cascade="0.4" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m) => {
          const reached = m.reached;
          const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
          return (
            <li
              key={m.id}
              data-cell
              className={cn("d-panel relative flex flex-col overflow-hidden p-5", reached && "border-transparent")}
            >
              {reached && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: "linear-gradient(90deg,#1C7BD9,#21B67A)" }}
                />
              )}
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-xl",
                    reached ? "text-white" : "bg-[var(--panel-2)] text-[var(--ink-3)]",
                  )}
                  style={reached ? { background: "linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(135deg,#1C7BD9,#21B67A)" } : undefined}
                >
                  {reached ? <Check className="h-5 w-5" /> : <Trophy className="h-5 w-5" />}
                </span>
                {loading ? (
                  <Skel className="h-5 w-14" />
                ) : reached ? (
                  <Badge className="border-transparent bg-[#21b67a]/15 text-[var(--green-text)]">Reached</Badge>
                ) : (
                  <span className="font-mono text-[11.5px] text-[var(--ink-3)]">{m.status}</span>
                )}
              </div>
              <p className="mt-5 text-[16px] font-semibold tracking-[-0.015em]">{m.name}</p>
              <p className="mt-1 text-[13px] leading-snug text-[var(--ink-2)]">{m.rule}</p>
              <div className="mt-auto pt-5">
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--panel-2)]">
                  {!loading && (
                    <div
                      data-bar
                      className="h-full rounded-full bg-gradient-to-r from-[#1c7bd9] to-[#21b67a]"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
