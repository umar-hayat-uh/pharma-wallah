"use client";

/**
 * Untimed practice: choose regions and question types, answer one station at a time,
 * get the answer and an explanation straight away (checked by the server, which holds
 * the key), then a summary with the missed questions to review.
 */
import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, RotateCcw, Timer, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPE_LABEL, type QType } from "@/lib/osteology/exam-config";
import type { Region } from "@/lib/osteology/types";
import { QuestionCard, type ClientQuestion, type Feedback } from "./QuestionCard";
import { recordPractice } from "./progress-store";

const REGIONS: { id: Region; label: string }[] = [
  { id: "upper-limb", label: "Upper limb" },
  { id: "lower-limb", label: "Pelvis & lower limb" },
  { id: "axial", label: "Axial skeleton" },
];

type Props = {
  title: string;
  types: QType[];
  defaultTypes?: QType[];
  kind: "spotting" | "viva";
  initialRegion?: Region | null;
  examHref?: string;
};

type Stage =
  | { name: "setup" }
  | { name: "loading" }
  | { name: "running"; token: string; questions: ClientQuestion[]; i: number; chosen: (number | null)[]; feedback: (Feedback | null)[] }
  | { name: "done"; questions: ClientQuestion[]; chosen: (number | null)[]; feedback: (Feedback | null)[] };

/** Bring the session itself into view — not the top of the page, where the hero is. */
function scrollToSession(el: HTMLElement | null) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 140;
  window.scrollTo({ top: Math.max(0, top) });
}

export function PracticeSession(props: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef}>
      <PracticeSessionInner {...props} rootRef={rootRef} />
    </div>
  );
}

function PracticeSessionInner({ title, types, defaultTypes, kind, initialRegion, examHref, rootRef }: Props & { rootRef: RefObject<HTMLDivElement> }) {
  const [regions, setRegions] = useState<Region[]>(initialRegion ? [initialRegion] : REGIONS.map((r) => r.id));
  const [picked, setPicked] = useState<QType[]>(defaultTypes ?? types);
  const [length, setLength] = useState(15);
  const [stage, setStage] = useState<Stage>({ name: "setup" });
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function start() {
    setError("");
    setStage({ name: "loading" });
    try {
      const res = await fetch("/api/osteology/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "practice", regions, types: picked, count: length }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start practice.");
      const n = data.questions.length;
      setStage({ name: "running", token: data.token, questions: data.questions, i: 0, chosen: Array(n).fill(null), feedback: Array(n).fill(null) });
    } catch (e) {
      setError(navigator.onLine ? (e as Error).message : "You are offline. Connect to the internet to start practice.");
      setStage({ name: "setup" });
    }
  }

  async function check() {
    if (stage.name !== "running") return;
    const choice = stage.chosen[stage.i];
    if (choice === null) return;
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/osteology/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: stage.token, index: stage.i, choice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not check the answer.");
      const feedback = [...stage.feedback];
      feedback[stage.i] = { correct: data.correct, answer: data.answer, explanation: data.explanation, learnHref: data.learnHref };
      setStage({ ...stage, feedback });
    } catch (e) {
      setError(navigator.onLine ? (e as Error).message : "You are offline — your answer is kept. Reconnect and press Check again.");
    } finally {
      setChecking(false);
    }
  }

  function next() {
    if (stage.name !== "running") return;
    if (stage.i + 1 < stage.questions.length) {
      setStage({ ...stage, i: stage.i + 1 });
      scrollToSession(rootRef.current);
    } else {
      const correct = stage.feedback.filter((f) => f?.correct).length;
      recordPractice({ kind, correct, total: stage.questions.length });
      setStage({ name: "done", questions: stage.questions, chosen: stage.chosen, feedback: stage.feedback });
    }
  }

  // Keyboard: 1–4 / A–D choose, Enter checks or moves on.
  useEffect(() => {
    if (stage.name !== "running") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const q = stage.questions[stage.i];
      const fb = stage.feedback[stage.i];
      const n = "1234".indexOf(e.key) >= 0 ? "1234".indexOf(e.key) : "abcd".indexOf(e.key.toLowerCase());
      if (!fb && n >= 0 && n < q.options.length) {
        const chosen = [...stage.chosen];
        chosen[stage.i] = n;
        setStage({ ...stage, chosen });
      } else if (e.key === "Enter") {
        if (fb) next();
        else void check();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (stage.name === "setup" || stage.name === "loading") {
    return (
      <div className="rounded-2xl border border-[#16181d]/10 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-[#4a4f57]">No timer: you see the answer and why after every question.</p>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Regions</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <Toggle key={r.id} on={regions.includes(r.id)} onClick={() => setRegions(toggle(regions, r.id))}>{r.label}</Toggle>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Question types</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {types.map((t) => (
              <Toggle key={t} on={picked.includes(t)} onClick={() => setPicked(toggle(picked, t))}>{TYPE_LABEL[t]}</Toggle>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Length</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[10, 15, 25].map((n) => (
              <Toggle key={n} on={length === n} onClick={() => setLength(n)}>{n} questions</Toggle>
            ))}
          </div>
        </fieldset>

        {error && <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-900"><WifiOff className="h-4 w-4" aria-hidden />{error}</p>}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={start}
            disabled={stage.name === "loading" || regions.length === 0 || picked.length === 0}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brandBlue px-6 font-semibold text-white disabled:opacity-50"
          >
            {stage.name === "loading" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Start practice
          </button>
          {examHref && (
            <Link href={examHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#16181d]/15 px-5 text-sm font-semibold">
              <Timer className="h-4 w-4" aria-hidden /> Timed exam mode instead
            </Link>
          )}
        </div>
        {(regions.length === 0 || picked.length === 0) && <p className="mt-2 text-sm text-[#5b616b]">Choose at least one region and one question type.</p>}
      </div>
    );
  }

  if (stage.name === "done") {
    const correct = stage.feedback.filter((f) => f?.correct).length;
    const missed = stage.questions.filter((_, i) => !stage.feedback[i]?.correct);
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-[#16181d]/10 bg-white p-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#6b7079]">Practice complete</p>
          <p className="mt-2 text-4xl font-bold">{correct} / {stage.questions.length}</p>
          <p className="mt-1 text-[#4a4f57]">{Math.round((correct / stage.questions.length) * 100)}% correct</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => setStage({ name: "setup" })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brandBlue px-5 font-semibold text-white">
              <RotateCcw className="h-4 w-4" aria-hidden /> Practise again
            </button>
            <Link href="/osteology-lab/progress" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#16181d]/15 px-5 font-semibold">See my progress</Link>
          </div>
        </div>
        {missed.length > 0 && (
          <section aria-labelledby="missed-h">
            <h2 id="missed-h" className="text-lg font-bold">Review what you missed ({missed.length})</h2>
            <div className="mt-3 space-y-4">
              {missed.map((q) => (
                <QuestionCard key={q.index} q={q} chosen={stage.chosen[q.index]} onChoose={() => {}} feedback={stage.feedback[q.index]} disabled />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const q = stage.questions[stage.i];
  const fb = stage.feedback[stage.i];
  return (
    <div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#16181d]/10" aria-hidden>
        <div className="h-full bg-brandBlue transition-[width]" style={{ width: `${(stage.i / stage.questions.length) * 100}%` }} />
      </div>
      <QuestionCard
        q={q}
        chosen={stage.chosen[stage.i]}
        onChoose={(n) => {
          if (fb) return;
          const chosen = [...stage.chosen];
          chosen[stage.i] = n;
          setStage({ ...stage, chosen });
        }}
        feedback={fb}
        disabled={!!fb || checking}
        heading={<span className="text-[#5b616b]">Question {stage.i + 1} of {stage.questions.length}</span>}
      />
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-900">{error}</p>}
      <div className="sticky bottom-[4.5rem] z-10 mt-4 md:bottom-4">
        {fb ? (
          <button type="button" onClick={next} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-brandBlue font-semibold text-white shadow-lg">
            {stage.i + 1 < stage.questions.length ? "Next question" : "See results"} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            onClick={check}
            disabled={stage.chosen[stage.i] === null || checking}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#16181d] font-semibold text-white shadow-lg disabled:opacity-40"
          >
            {checking && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Check answer
          </button>
        )}
      </div>
    </div>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "min-h-11 rounded-full px-4 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandBlue",
        on ? "bg-brandBlue text-white" : "border border-[#16181d]/15 bg-white text-[#16181d]",
      )}
    >
      {children}
    </button>
  );
}
