"use client";

/**
 * "My progress": completed lessons by region, recently viewed, practice and exam history.
 * This device's record always; for a signed-in student, lessons completed and exams sat
 * on other devices are merged in from the account (spotting_progress / quiz_attempts).
 */
import Link from "next/link";
import { useMemo } from "react";
import { BarChart3, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useOsteoProgress } from "./progress-store";

type Lesson = { kind: "bone" | "joint"; slug: string; name: string; region: string };

const REGION_LABEL: Record<string, string> = { "upper-limb": "Upper limb", "lower-limb": "Pelvis & lower limb", axial: "Axial skeleton" };
const when = (t: number | string) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short" });

export function ProgressOverview({ lessons }: { lessons: Lesson[] }) {
  const local = useOsteoProgress();
  const { user } = useSupabaseUser();
  const server = useProgress();

  // Completed = this device ∪ the account's "osteology-done:" rows.
  const done = useMemo(() => {
    const set = new Set(Object.keys(local.completed));
    for (const row of server.spotting ?? []) {
      const id = String(row.lesson_id ?? "");
      if (id.startsWith("osteology-done:")) set.add(id.slice("osteology-done:".length));
    }
    return set;
  }, [local.completed, server.spotting]);

  const accountExams = (server.quizAttempts ?? [])
    .filter((q) => String(q.quiz_id ?? "").startsWith("osteology:"))
    .sort((a, b) => String(b.attempted_at).localeCompare(String(a.attempted_at)));

  const regions = ["upper-limb", "lower-limb", "axial"];
  const total = lessons.length;
  const completed = lessons.filter((l) => done.has(`${l.kind}:${l.slug}`)).length;
  const next = lessons.find((l) => !done.has(`${l.kind}:${l.slug}`));
  const avg = (rows: { correct: number; total: number }[]) =>
    rows.length ? Math.round((rows.reduce((s, r) => s + r.correct / Math.max(1, r.total), 0) / rows.length) * 100) : null;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <Tile label="Lessons completed" value={`${completed} / ${total}`} />
        <Tile label="Practice average" value={avg(local.practice) === null ? "—" : `${avg(local.practice)}%`} sub={`${local.practice.length} rounds on this device`} />
        <Tile label="Mock exams" value={String(Math.max(local.exams.length, accountExams.length))} sub={user ? "on this device / your account" : "on this device"} />
      </section>

      {next && (
        <Link href={`/osteology-lab/${next.kind === "bone" ? "bones" : "joints"}/${next.slug}`} className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-brandBlue px-5 py-3 font-semibold text-white">
          <span>Continue: {next.name}</span>
          <span aria-hidden>→</span>
        </Link>
      )}

      <section aria-labelledby="lessons-h" className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
        <h2 id="lessons-h" className="text-lg font-bold">Lessons</h2>
        {regions.map((r) => {
          const list = lessons.filter((l) => l.region === r);
          if (list.length === 0) return null;
          const n = list.filter((l) => done.has(`${l.kind}:${l.slug}`)).length;
          return (
            <div key={r} className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <h3 className="font-semibold">{REGION_LABEL[r]}</h3>
                <span className="text-[#5b616b]">{n} / {list.length}</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#16181d]/8" role="progressbar" aria-valuenow={n} aria-valuemin={0} aria-valuemax={list.length} aria-label={`${REGION_LABEL[r]} lessons completed`}>
                <div className="h-full rounded-full bg-brandGreen" style={{ width: `${(n / list.length) * 100}%` }} />
              </div>
              <ul className="pw-osteo-list mt-3 grid gap-1.5 sm:grid-cols-2">
                {list.map((l) => {
                  const isDone = done.has(`${l.kind}:${l.slug}`);
                  return (
                    <li key={`${l.kind}:${l.slug}`}>
                      <Link href={`/osteology-lab/${l.kind === "bone" ? "bones" : "joints"}/${l.slug}`} className="flex min-h-10 items-center gap-2 text-sm hover:text-brandBlue">
                        {isDone ? <CheckCircle2 className="h-4 w-4 text-brandGreen" aria-label="completed" /> : <Circle className="h-4 w-4 text-[#16181d]/25" aria-label="not completed" />}
                        {l.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="recent-h" className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
          <h2 id="recent-h" className="text-lg font-bold">Recently viewed</h2>
          {local.viewed.length === 0 ? (
            <p className="mt-2 text-sm text-[#5b616b]">Nothing yet on this device. <Link href="/osteology-lab/bones" className="text-brandBlue underline">Open a bone</Link> to begin.</p>
          ) : (
            <ul className="pw-osteo-list mt-2 divide-y divide-[#16181d]/8">
              {local.viewed.slice(0, 8).map((v) => (
                <li key={`${v.kind}:${v.slug}`}>
                  <Link href={`/osteology-lab/${v.kind === "bone" ? "bones" : "joints"}/${v.slug}`} className="flex min-h-11 items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{v.name}</span>
                    <span className="text-[#6b7079]">{when(v.at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="exams-h" className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
          <h2 id="exams-h" className="flex items-center gap-2 text-lg font-bold"><BarChart3 className="h-5 w-5 text-brandBlue" aria-hidden /> Exam history</h2>
          {user && server.isLoading && <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#5b616b]"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading your account history…</p>}
          {local.exams.length === 0 && accountExams.length === 0 ? (
            <p className="mt-2 text-sm text-[#5b616b]">No mock exams yet. <Link href="/osteology-lab/exam" className="text-brandBlue underline">Sit one</Link>.</p>
          ) : (
            <ul className="pw-osteo-list mt-2 divide-y divide-[#16181d]/8 text-sm">
              {(user && accountExams.length > 0
                ? accountExams.slice(0, 10).map((q) => ({ key: String(q.id ?? q.attempted_at), title: String(q.subject ?? q.quiz_id).replace(/^Osteology Lab · /, ""), score: `${q.score}/${q.total}`, at: q.attempted_at as string }))
                : local.exams.slice(0, 10).map((e) => ({ key: String(e.at), title: e.title, score: `${e.correct}/${e.total}`, at: e.at as number | string }))
              ).map((row) => (
                <li key={row.key} className="flex min-h-11 items-center justify-between gap-3">
                  <span className="font-medium">{row.title}</span>
                  <span className="tabular-nums">{row.score}</span>
                  <span className="text-[#6b7079]">{when(row.at)}</span>
                </li>
              ))}
            </ul>
          )}
          {!user && <p className="mt-3 text-xs text-[#5b616b]"><Link href="/signin" className="text-brandBlue underline">Sign in</Link> to save exams to your account.</p>}
        </section>
      </div>

      <section aria-labelledby="practice-h" className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
        <h2 id="practice-h" className="text-lg font-bold">Practice history (this device)</h2>
        {local.practice.length === 0 ? (
          <p className="mt-2 text-sm text-[#5b616b]">No practice rounds yet.</p>
        ) : (
          <ul className="pw-osteo-list mt-2 divide-y divide-[#16181d]/8 text-sm">
            {local.practice.slice(0, 12).map((p) => (
              <li key={p.at} className="flex min-h-10 items-center justify-between gap-3">
                <span className="capitalize">{p.kind === "skeleton" ? "Skeleton viva" : p.kind === "viva" ? "Viva trainer" : "Spotting"}</span>
                <span className="tabular-nums">{p.correct}/{p.total}</span>
                <span className="text-[#6b7079]">{when(p.at)}</span>
              </li>
            ))}
          </ul>
        )}
        {local.revise.length > 0 && (
          <p className="mt-3 text-sm">
            {local.revise.length} viva question{local.revise.length > 1 ? "s" : ""} on your revise list —{" "}
            <Link href="/osteology-lab/viva" className="font-semibold text-brandBlue underline">drill them</Link>.
          </p>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-[#6b7079]">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[#6b7079]">{sub}</p>}
    </div>
  );
}
