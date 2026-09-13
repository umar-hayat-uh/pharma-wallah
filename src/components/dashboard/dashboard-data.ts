import {
  BookOpen, Calculator, FileText, FlaskConical, Layers, Library, Microscope, MessagesSquare,
  Pill, ScanText, Search, Atom, type LucideIcon,
} from "lucide-react";
import { SUBJECTS } from "@/lib/courses/registry";
import type { CourseUnit, SubjectMeta } from "@/lib/courses/types";

/*
 * Every number the dashboard prints is derived here, from the rows
 * GET /api/progress returns plus the course registry — nothing is typed by
 * hand (MEMORY.md gotcha 47), and nothing reads a column that no code writes:
 *
 *  - `progress.current_streak` is never written (Known Issue 8), so the streak
 *    is computed from activity_log days instead.
 *  - A unit has two states: *opened* (any visit) and *read* — the student
 *    pressed "Mark as read", which sets `unit_progress.completed`. Coverage
 *    counts read units; opened-but-unread ones are shown separately.
 *  - `total_time_spent_min` only ever receives 0 (UnitTracker sends
 *    `timeSpentMin: 0`), so study time is not shown at all.
 *
 * Days are bucketed in the browser's local time zone. The old dashboard used
 * `toISOString()` (UTC), which put 00:00–05:00 PKT study on the previous day.
 */

export type ActivityRow = { type?: string; label?: string; title?: string; href?: string; timestamp: string };
export type UnitRow = { unit_id: string; unit_title?: string; subject?: string; last_visited?: string; completed?: boolean | null };
export type QuizRow = { quiz_id?: string; subject?: string; score: number; total: number; attempted_at: string };
export type SpottingRow = { lesson_id: string; category?: string; last_visited?: string };
export type FlashcardRow = { category: string; last_practiced?: string };

/** The API reads activity_log for this many days — keep in step with ACTIVITY_WINDOW_DAYS. */
export const ACTIVITY_WINDOW_DAYS = 91;

// ─── Days ────────────────────────────────────────────────────────────────

export function dayKey(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/**
 * A unit visit writes two activity_log rows with the same label a moment apart
 * (the typed "unit" row, and UnitTracker's own "activity" row that carries the
 * href). Collapse rows with the same label inside a minute, keeping the href.
 */
export function dedupeActivity(rows: ActivityRow[]): ActivityRow[] {
  const sorted = [...rows].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  const out: ActivityRow[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const row = sorted[i];
    const label = row.label || row.title || "";
    const prev = out[out.length - 1];
    const prevLabel = prev ? prev.label || prev.title || "" : null;
    if (prev && prevLabel === label && Math.abs(+new Date(prev.timestamp) - +new Date(row.timestamp)) < 60_000) {
      if (!prev.href && row.href) prev.href = row.href;
      if ((!prev.type || prev.type === "generic") && row.type) prev.type = row.type;
      continue;
    }
    out.push({ ...row });
  }
  return out;
}

export type HeatCell = { key: string; date: Date; count: number; level: 0 | 1 | 2 | 3 | 4; future: boolean };

export function activityCalendar(rows: ActivityRow[], weeks = 13, now = new Date()) {
  const counts = new Map<string, number>();
  rows.forEach((r) => {
    const k = dayKey(new Date(r.timestamp));
    counts.set(k, (counts.get(k) || 0) + 1);
  });

  const today = startOfDay(now);
  // Columns are Monday-first weeks; the last column holds today.
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = addDays(today, -mondayOffset - (weeks - 1) * 7);

  const columns: HeatCell[][] = [];
  for (let w = 0; w < weeks; w++) {
    const col: HeatCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(start, w * 7 + d);
      const key = dayKey(date);
      const count = counts.get(key) || 0;
      const level = (count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4) as HeatCell["level"];
      col.push({ key, date, count, level, future: date > today });
    }
    columns.push(col);
  }

  const activeDays = Array.from(counts.keys());
  const last30 = dayKey(addDays(today, -29));
  const activeLast30 = activeDays.filter((k) => k >= last30).length;

  return { columns, activeLast30, activeTotal: activeDays.length };
}

/**
 * Consecutive days with at least one activity, counting back from today. A
 * streak survives until today ends: if nothing is logged yet today, it counts
 * from yesterday and `atRisk` is set.
 */
export function studyStreak(rows: ActivityRow[], now = new Date()) {
  const days = new Set(rows.map((r) => dayKey(new Date(r.timestamp))));
  const today = startOfDay(now);
  const studiedToday = days.has(dayKey(today));

  let current = 0;
  let cursor = studiedToday ? today : addDays(today, -1);
  while (days.has(dayKey(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  for (let i = ACTIVITY_WINDOW_DAYS - 1; i >= 0; i--) {
    if (days.has(dayKey(addDays(today, -i)))) {
      run++;
      longest = Math.max(longest, run);
    } else run = 0;
  }

  return { current, longest, studiedToday, atRisk: current > 0 && !studiedToday };
}

// ─── Syllabus ───────────────────────────────────────────────────────────

export type SubjectCoverage = {
  subject: SubjectMeta;
  href: string;
  units: { unit: CourseUnit; href: string; opened: boolean; read: boolean; lastVisited?: string }[];
  /** Units visited at least once — includes the read ones. */
  opened: number;
  read: number;
  /** Share of units read. */
  pct: number;
};

export function unitHref(subjectSlug: string, unitId: string) {
  return `/courses/${subjectSlug}/${unitId}`;
}

export function syllabusCoverage(units: UnitRow[]) {
  const visited = new Map(units.map((u) => [u.unit_id, u.last_visited]));
  const readIds = new Set(units.filter((u) => u.completed === true).map((u) => u.unit_id));
  const subjects: SubjectCoverage[] = SUBJECTS.map((subject) => {
    const rows = subject.units.map((unit) => ({
      unit,
      href: unitHref(subject.slug, unit.id),
      opened: visited.has(unit.id) || readIds.has(unit.id),
      read: readIds.has(unit.id),
      lastVisited: visited.get(unit.id),
    }));
    const opened = rows.filter((r) => r.opened).length;
    const read = rows.filter((r) => r.read).length;
    return {
      subject,
      href: `/courses/${subject.slug}`,
      units: rows,
      opened,
      read,
      pct: rows.length ? Math.round((read / rows.length) * 100) : 0,
    };
  });
  const total = subjects.reduce((n, s) => n + s.units.length, 0);
  const opened = subjects.reduce((n, s) => n + s.opened, 0);
  const read = subjects.reduce((n, s) => n + s.read, 0);
  return { subjects, total, opened, read, pct: total ? Math.round((read / total) * 100) : 0 };
}

export type NextUp = {
  /** continue: the last unit opened isn't read yet · resume: moving on · start: new account. */
  kind: "continue" | "resume" | "start";
  subject: SubjectMeta;
  unit: CourseUnit;
  href: string;
  /** The unit the student opened most recently, when there is one. */
  last?: { subject: SubjectMeta; unit: CourseUnit; href: string; when: string };
};

/**
 * The unit worth opening next: the one visited most recently if it isn't read
 * yet; otherwise the first unread unit after it in the same subject; failing
 * that, the first unread unit anywhere. A brand-new account starts at unit 1.
 */
export function nextUp(units: UnitRow[]): NextUp | null {
  const cov = syllabusCoverage(units);
  const recent = [...units]
    .filter((u) => u.last_visited)
    .sort((a, b) => +new Date(b.last_visited!) - +new Date(a.last_visited!));

  let last: NextUp["last"];
  for (let i = 0; i < recent.length && !last; i++) {
    for (let s = 0; s < cov.subjects.length; s++) {
      const hit = cov.subjects[s].units.find((r) => r.unit.id === recent[i].unit_id);
      if (hit) {
        last = { subject: cov.subjects[s].subject, unit: hit.unit, href: hit.href, when: recent[i].last_visited! };
        break;
      }
    }
  }

  if (last) {
    const sc = cov.subjects.find((s) => s.subject.slug === last!.subject.slug)!;
    const idx = sc.units.findIndex((r) => r.unit.id === last!.unit.id);
    if (!sc.units[idx].read) return { kind: "continue", subject: sc.subject, unit: last.unit, href: last.href, last };
    const after = sc.units.slice(idx + 1).find((r) => !r.read) ?? sc.units.find((r) => !r.read);
    if (after) return { kind: "resume", subject: sc.subject, unit: after.unit, href: after.href, last };
  }

  for (let s = 0; s < cov.subjects.length; s++) {
    const first = cov.subjects[s].units.find((r) => !r.read);
    if (first) return { kind: last ? "resume" : "start", subject: cov.subjects[s].subject, unit: first.unit, href: first.href, last };
  }
  // Every registered unit is read: offer the most recent one again.
  return last ? { kind: "resume", subject: last.subject, unit: last.unit, href: last.href, last } : null;
}

// ─── Practice ───────────────────────────────────────────────────────────

/** End-of-lesson question sets (LessonCheckpoint) are stored as quizzes with this id prefix. */
export const LESSON_CHECK_PREFIX = "lesson:";

export function quizStats(attempts: QuizRow[]) {
  // MCQ-bank tests only: a 5-question lesson check would swamp the average.
  const lessonChecks = attempts.filter((a) => a.quiz_id?.startsWith(LESSON_CHECK_PREFIX)).length;
  const valid = attempts.filter((a) => a.total > 0 && !a.quiz_id?.startsWith(LESSON_CHECK_PREFIX));
  const chronological = [...valid].sort((a, b) => +new Date(a.attempted_at) - +new Date(b.attempted_at));
  const pcts = chronological.map((a) => Math.round((a.score / a.total) * 100));
  const avg = pcts.length ? Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length) : 0;
  const best = pcts.length ? Math.max(...pcts) : 0;

  const bySubject = new Map<string, { n: number; sum: number }>();
  chronological.forEach((a, i) => {
    const key = a.subject || "Other";
    const cur = bySubject.get(key) || { n: 0, sum: 0 };
    bySubject.set(key, { n: cur.n + 1, sum: cur.sum + pcts[i] });
  });

  return {
    lessonChecks,
    count: valid.length,
    avg,
    best,
    trend: pcts.slice(-12),
    recent: [...valid].sort((a, b) => +new Date(b.attempted_at) - +new Date(a.attempted_at)).slice(0, 5),
    subjects: Array.from(bySubject.entries())
      .map(([name, v]) => ({ name, attempts: v.n, avg: Math.round(v.sum / v.n) }))
      .sort((a, b) => b.attempts - a.attempts),
  };
}

export function countBy<T>(rows: T[], key: (row: T) => string | undefined) {
  const map = new Map<string, number>();
  rows.forEach((r) => {
    const k = key(r) || "other";
    map.set(k, (map.get(k) || 0) + 1);
  });
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}

// ─── Milestones ─────────────────────────────────────────────────────────

export type Milestone = {
  id: string;
  name: string;
  rule: string;
  reached: boolean;
  /** Filled portion of the bar, on the same scale as `target`. */
  progress: number;
  target: number;
  /** What the card prints while unreached, e.g. "3 / 10" or "2 of 5 quizzes". */
  status: string;
};

function counted(id: string, name: string, rule: string, value: number, target: number): Milestone {
  return { id, name, rule, reached: value >= target, progress: Math.min(value, target), target, status: `${Math.min(value, target)} / ${target}` };
}

/** Each name says exactly what its rule measures, and the rule is printed beside it. */
export function milestones(input: {
  unitsRead: number;
  bestSubjectPct: number;
  quizCount: number;
  quizAvg: number;
  longestStreak: number;
  spottingCount: number;
}): Milestone[] {
  const { quizCount, quizAvg } = input;
  // "Sharp" needs a sample before an average means anything: the bar tracks
  // the five quizzes first, then the average against 80%.
  const sharpReady = quizCount >= 5;
  return [
    counted("first-unit", "First unit read", "Mark any course unit as read", input.unitsRead, 1),
    counted("ten-units", "Ten units read", "Mark 10 different units as read", input.unitsRead, 10),
    {
      id: "subject",
      name: "Whole subject",
      rule: "Read every unit of one subject",
      reached: input.bestSubjectPct >= 100,
      progress: input.bestSubjectPct,
      target: 100,
      status: `${input.bestSubjectPct}%`,
    },
    counted("first-quiz", "First quiz", "Finish an MCQ quiz", quizCount, 1),
    {
      id: "sharp",
      name: "Sharp",
      rule: "Average 80% or more across 5+ quizzes",
      reached: sharpReady && quizAvg >= 80,
      progress: sharpReady ? Math.min(quizAvg, 80) : (quizCount / 5) * 80,
      target: 80,
      status: sharpReady ? `${quizAvg}% avg` : `${quizCount} of 5 quizzes`,
    },
    counted("week", "Seven days running", "Study 7 days in a row", input.longestStreak, 7),
    counted("spotter", "Spotter", "Open 5 spotting lessons", input.spottingCount, 5),
  ];
}

// ─── Navigation ─────────────────────────────────────────────────────────

export type StudyLink = { label: string; href: string; icon: LucideIcon; blurb: string };

/** Every href here was checked against src/app/(site) on 2026-09-13. */
export const STUDY_LINKS: StudyLink[] = [
  { label: "Courses", href: "/courses", icon: BookOpen, blurb: "Semester lessons" },
  { label: "MCQ bank", href: "/mcqs-bank", icon: FileText, blurb: "Timed subject quizzes" },
  { label: "Flashcards", href: "/flash-cards", icon: Layers, blurb: "Spaced recall" },
  { label: "Spotting", href: "/spotting", icon: Microscope, blurb: "Slides & identification" },
  { label: "Simulations", href: "/simulations", icon: FlaskConical, blurb: "Wet-lab practice" },
  { label: "Calculators", href: "/calculation-tools", icon: Calculator, blurb: "Pharmacy maths" },
];

export const REFERENCE_LINKS: StudyLink[] = [
  { label: "Drug encyclopedia", href: "/encyclopedia", icon: Pill, blurb: "Monographs" },
  { label: "Drug finder", href: "/drug-finder", icon: Search, blurb: "RxNorm lookup" },
  { label: "Prescription reader", href: "/prescription-reader", icon: ScanText, blurb: "Read a script" },
  { label: "Molecule viewer", href: "/molecule-viewer", icon: Atom, blurb: "3D structures" },
  { label: "Books library", href: "/books-library", icon: Library, blurb: "Reference texts" },
  { label: "Community", href: "/community", icon: MessagesSquare, blurb: "Ask & answer" },
];

export function activityKind(type?: string, label = "") {
  const t = type && type !== "generic" ? type : label.startsWith("Visited") ? "unit" : label.startsWith("Quiz") ? "quiz" : label.startsWith("Spotting") ? "spotting" : label.startsWith("Practiced") ? "flashcard" : "activity";
  switch (t) {
    case "unit": return { icon: BookOpen, name: "Lesson" };
    case "quiz": return { icon: FileText, name: "Quiz" };
    case "spotting": return { icon: Microscope, name: "Spotting" };
    case "flashcard": return { icon: Layers, name: "Flashcards" };
    default: return { icon: FlaskConical, name: "Activity" };
  }
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export function relativeTime(iso: string, now = Date.now()) {
  const s = Math.max(0, Math.floor((now - +new Date(iso)) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function dayHeading(d: Date, now = new Date()) {
  const k = dayKey(d);
  if (k === dayKey(now)) return "Today";
  if (k === dayKey(addDays(now, -1))) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
}
