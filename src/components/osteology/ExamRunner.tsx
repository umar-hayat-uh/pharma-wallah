"use client";

/**
 * Timed mock practical.
 *
 * Integrity: the browser never has the answer key — the paper comes without answers
 * and the server grades it from the signed token. The countdown is drawn here but the
 * deadline that counts is the server's (issue time + limit, checked at submission), and
 * the local clock is corrected by the server's time at start, so a wrong phone clock
 * does not change it.
 *
 * Resilience: the paper, answers, flags and position are kept in sessionStorage, so a
 * refresh or an accidental back-navigation resumes the same exam; a failed submission
 * keeps everything and offers a retry; at zero the exam submits itself.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Clock, Flag, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { EXAM_PRESETS } from "@/lib/osteology/exam-config";
import type { Graded } from "@/lib/osteology/questions";
import { QuestionCard, type ClientQuestion } from "./QuestionCard";
import { ExamResults } from "./ExamResults";
import { recordExam } from "./progress-store";

const STORE = "pw-osteo:exam-in-progress";

type Running = {
  token: string;
  preset: string;
  title: string;
  questions: ClientQuestion[];
  answers: (number | null)[];
  flags: boolean[];
  i: number;
  /** Local epoch ms at which time is up (server deadline mapped to this clock). */
  deadline: number;
  limitSec: number;
  marksPer: number;
};
export type ExamResult = Graded & { late: boolean; recorded: boolean; signedIn: boolean; timeTakenSec: number; preset: string; marksPer: number };

function load(): Running | null {
  try {
    const raw = window.sessionStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Running) : null;
  } catch {
    return null;
  }
}
function save(r: Running | null) {
  try {
    if (r) window.sessionStorage.setItem(STORE, JSON.stringify(r));
    else window.sessionStorage.removeItem(STORE);
  } catch {
    // storage blocked: the exam still runs, it just cannot survive a refresh
  }
}

const fmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Bring the session itself into view — not the top of the page, where the hero is. */
function scrollToSession(el: HTMLElement | null) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 140;
  window.scrollTo({ top: Math.max(0, top) });
}

export function ExamRunner({ initialPreset }: { initialPreset?: string | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef}>
      <ExamRunnerInner initialPreset={initialPreset} rootRef={rootRef} />
    </div>
  );
}

function ExamRunnerInner({ initialPreset, rootRef }: { initialPreset?: string | null; rootRef: RefObject<HTMLDivElement> }) {
  const [run, setRun] = useState<Running | null>(null);
  const [pending, setPending] = useState<Running | null>(null);
  const [starting, setStarting] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [startError, setStartError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<{ data: ExamResult; questions: ClientQuestion[]; title: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const submittedRef = useRef(false);

  useEffect(() => {
    const saved = load();
    if (saved) setPending(saved);
  }, []);

  const update = useCallback((r: Running) => {
    setRun(r);
    save(r);
  }, []);

  async function start(presetId: string) {
    setStartError("");
    setStarting(presetId);
    try {
      const res = await fetch("/api/osteology/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "exam", preset: presetId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start the exam.");
      const remainingMs = (data.issuedAt + data.limitSec - data.serverNow) * 1000;
      const preset = EXAM_PRESETS.find((p) => p.id === presetId);
      const r: Running = {
        token: data.token,
        preset: presetId,
        title: preset?.title ?? presetId,
        questions: data.questions,
        answers: Array(data.questions.length).fill(null),
        flags: Array(data.questions.length).fill(false),
        i: 0,
        deadline: Date.now() + remainingMs,
        limitSec: data.limitSec,
        marksPer: data.marksPer,
      };
      submittedRef.current = false;
      setPending(null);
      setNow(Date.now()); // the clock state is stale until its first tick
      update(r);
      scrollToSession(rootRef.current);
    } catch (e) {
      setStartError(navigator.onLine ? (e as Error).message : "You are offline. Connect to start an exam.");
    } finally {
      setStarting(null);
    }
  }

  const submit = useCallback(
    async (r: Running) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      setSubmitError("");
      setConfirming(false);
      try {
        const res = await fetch("/api/osteology/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: r.token, answers: r.answers }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Submission failed.");
        const out = data as ExamResult;
        recordExam({
          preset: r.preset,
          title: r.title,
          correct: out.correct,
          total: out.total,
          marks: out.marks,
          maxMarks: out.maxMarks,
          timeSec: out.timeTakenSec,
        });
        save(null);
        setRun(null);
        setResult({ data: out, questions: r.questions, title: r.title });
        scrollToSession(rootRef.current);
      } catch (e) {
        submittedRef.current = false;
        setSubmitError(
          navigator.onLine
            ? `${(e as Error).message} Your answers are kept — try again.`
            : "You are offline. Your answers are kept on this device — reconnect and press Submit again.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  // Clock + auto-submit. Keyed on the paper's token, not on `run`: `run` is a new object on
  // every answer and every move between stations, and restarting the interval each time froze
  // the countdown for a student moving faster than once a second.
  const paper = run?.token;
  useEffect(() => {
    if (!paper) return;
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [paper]);
  useEffect(() => {
    if (run && now >= run.deadline && !submittedRef.current && !submitting) void submit(run);
  }, [now, run, submit, submitting]);

  // Leaving mid-exam asks first (answers survive a refresh anyway).
  useEffect(() => {
    if (!run) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [run]);

  const unanswered = useMemo(() => (run ? run.answers.filter((a) => a === null).length : 0), [run]);

  if (result) {
    return <ExamResults result={result.data} questions={result.questions} title={result.title} onRestart={() => setResult(null)} />;
  }

  if (!run) {
    return (
      <div>
        {pending && (
          <div role="status" className="mb-6 flex flex-col gap-3 rounded-2xl border border-brandBlue/30 bg-brandBlue/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              <strong>You have an exam in progress</strong> — {pending.title}, {pending.answers.filter((a) => a !== null).length} of {pending.questions.length} answered.
              {pending.deadline <= Date.now() && " Its time is up; resuming will submit it."}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => { submittedRef.current = false; setNow(Date.now()); setRun(pending); setPending(null); scrollToSession(rootRef.current); }} className="min-h-11 rounded-xl bg-brandBlue px-4 text-sm font-semibold text-white">Resume</button>
              <button type="button" onClick={() => { save(null); setPending(null); }} className="min-h-11 rounded-xl border border-[#16181d]/15 bg-white px-4 text-sm font-semibold">Discard</button>
            </div>
          </div>
        )}
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">
          Station counts, times and marks below are practice defaults set by PharmaWallah. They are not your university&apos;s official
          examination format — ask your department how your practical is run.
        </p>
        {startError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-900">{startError}</p>}
        <ul className="pw-osteo-list mt-5 grid gap-3 sm:grid-cols-2">
          {EXAM_PRESETS.map((p) => (
            <li key={p.id}>
              <div className={cn("flex h-full flex-col rounded-2xl border bg-white p-5", initialPreset === p.id ? "border-brandBlue ring-2 ring-brandBlue/20" : "border-[#16181d]/10")}>
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="mt-1 flex-1 text-sm text-[#4a4f57]">{p.description}</p>
                <p className="mt-3 text-sm font-medium">
                  {p.stations} stations · {p.minutes} min · {p.marksPerStation} mark{p.marksPerStation > 1 ? "s" : ""} each · no negative marking
                </p>
                <button
                  type="button"
                  onClick={() => start(p.id)}
                  disabled={!!starting}
                  className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brandBlue px-4 font-semibold text-white disabled:opacity-50"
                >
                  {starting === p.id && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Start {p.minutes}-minute exam
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const left = run.deadline - now;
  const q = run.questions[run.i];
  const low = left < 60_000;
  const answered = run.questions.length - unanswered;

  return (
    <div>
      {/* The bar sits under the site header; it is the one thing that must always be visible. */}
      <div className="sticky top-[4.5rem] z-20 -mx-4 mb-4 border-b border-[#16181d]/10 bg-white px-4 py-2 sm:mx-0 sm:rounded-2xl sm:border">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Station {run.i + 1} / {run.questions.length}</p>
          <p
            className={cn("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-lg font-bold tabular-nums", low ? "bg-red-50 text-red-700" : "text-[#16181d]")}
            aria-label={`Time remaining ${fmt(left)}`}
          >
            <Clock className="h-4 w-4" aria-hidden /> {fmt(left)}
          </p>
          <p className="hidden text-sm text-[#5b616b] sm:block">{answered} answered</p>
        </div>
        {/* Spoken only at the two warnings, not every second. */}
        <p className="sr-only" aria-live="assertive">{left < 300_000 && left > 299_000 ? "Five minutes remaining" : left < 60_000 && left > 59_000 ? "One minute remaining" : ""}</p>
      </div>

      <QuestionCard
        q={q}
        chosen={run.answers[run.i]}
        onChoose={(n) => {
          const answers = [...run.answers];
          answers[run.i] = answers[run.i] === n ? null : n;
          update({ ...run, answers });
        }}
        disabled={submitting}
        heading={
          <button
            type="button"
            aria-pressed={run.flags[run.i]}
            onClick={() => {
              const flags = [...run.flags];
              flags[run.i] = !flags[run.i];
              update({ ...run, flags });
            }}
            className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold", run.flags[run.i] ? "bg-amber-100 text-amber-900" : "text-[#4a4f57]")}
          >
            <Flag className="h-4 w-4" aria-hidden /> {run.flags[run.i] ? "Flagged" : "Flag for review"}
          </button>
        }
      />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={run.i === 0}
          onClick={() => update({ ...run, i: run.i - 1 })}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#16181d]/15 bg-white font-semibold disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Previous
        </button>
        {run.i + 1 < run.questions.length ? (
          <button type="button" onClick={() => update({ ...run, i: run.i + 1 })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brandBlue font-semibold text-white">
            Next <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button type="button" onClick={() => setConfirming(true)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#16181d] font-semibold text-white">
            <Send className="h-4 w-4" aria-hidden /> Finish
          </button>
        )}
      </div>

      <section aria-labelledby="palette-h" className="mt-6 rounded-2xl border border-[#16181d]/10 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 id="palette-h" className="text-sm font-semibold">All stations</h2>
          <button type="button" onClick={() => setConfirming(true)} className="min-h-10 rounded-lg px-3 text-sm font-semibold text-red-700">End exam</button>
        </div>
        <ol className="pw-osteo-list mt-3 grid grid-cols-6 gap-2 sm:grid-cols-10">
          {run.questions.map((_, k) => (
            <li key={k}>
              <button
                type="button"
                onClick={() => update({ ...run, i: k })}
                aria-label={`Station ${k + 1}${run.answers[k] !== null ? ", answered" : ", not answered"}${run.flags[k] ? ", flagged" : ""}`}
                aria-current={k === run.i ? "step" : undefined}
                className={cn(
                  "relative grid h-11 w-full place-items-center rounded-lg text-sm font-semibold",
                  k === run.i ? "ring-2 ring-brandBlue" : "",
                  run.answers[k] !== null ? "bg-brandBlue text-white" : "bg-[#16181d]/[0.06] text-[#16181d]",
                )}
              >
                {k + 1}
                {run.flags[k] && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" aria-hidden />}
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-[#5b616b]">Blue = answered · amber dot = flagged · tap an answer again to clear it.</p>
      </section>

      {(submitting || submitError) && (
        <div role="status" className={cn("mt-4 rounded-xl p-4 text-sm", submitError ? "bg-red-50 text-red-900" : "bg-brandBlue/[0.06]")}>
          {submitting ? (
            <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Submitting your answers…</span>
          ) : (
            <>
              <p>{submitError}</p>
              <button type="button" onClick={() => submit(run)} className="mt-2 min-h-11 rounded-xl bg-brandBlue px-4 font-semibold text-white">Submit again</button>
            </>
          )}
        </div>
      )}

      {confirming && (
        <div role="dialog" aria-modal="true" aria-labelledby="end-h" className="fixed inset-0 z-[70] grid place-items-end bg-[#0d2a45]/60 p-3 sm:place-items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 id="end-h" className="flex items-center gap-2 text-lg font-bold">
              <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden /> Submit the exam now?
            </h2>
            <p className="mt-2 text-sm">
              {unanswered > 0 ? `${unanswered} station${unanswered > 1 ? "s are" : " is"} unanswered and will score zero. ` : "Every station is answered. "}
              {run.flags.some(Boolean) ? `${run.flags.filter(Boolean).length} flagged for review. ` : ""}
              You have {fmt(left)} left. You cannot change answers after submitting.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" autoFocus onClick={() => setConfirming(false)} className="min-h-12 rounded-xl border border-[#16181d]/15 font-semibold">Keep working</button>
              <button type="button" onClick={() => submit(run)} className="min-h-12 rounded-xl bg-[#16181d] font-semibold text-white">Submit</button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-xs text-[#5b616b]">
        Your answers are saved on this device as you go. <Link href="/osteology-lab" className="underline">Lab home</Link> keeps the exam paused, but the clock keeps running.
      </p>
    </div>
  );
}
