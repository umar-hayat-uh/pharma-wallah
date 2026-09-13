"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Check, CircleCheck, ListChecks, LogIn, RotateCcw, X } from "lucide-react";
import type { CourseUnit, SubjectMeta } from "@/lib/courses/types";
import type { MCQQuestion } from "@/lib/mcq-utils";
import { hasLessonQuestions, loadLessonQuestions, pickQuestions } from "@/lib/courses/lesson-questions";
import { useSupabaseUser } from "@/hooks/useSupabaseUser";
import { useTracker } from "@/hooks/useTracker";
import { useProgress, clearProgressCache } from "@/hooks/useProgress";
import { BRAND_BUTTON, BRAND_BUTTON_HOVER } from "@/components/page-kit/brand";

/**
 * The end of a lesson: a few optional questions from that unit, an explicit
 * "Mark as read", and the way on to the next unit.
 *
 * Decisions (user, 2026-09-13):
 *  - Questions are OPTIONAL. Mark as read never waits on them — they are
 *    practice, not a gate.
 *  - 5 questions a set, drawn at random from the unit's 30 in the MCQ bank, with
 *    "Try 5 more" for another set.
 *  - "Read" is the student's click, not reaching the bottom of the page.
 *
 * Data: `markUnitRead` sets unit_progress.completed (never cleared by later
 * visits); a finished set is recorded with `trackQuiz` like any other quiz.
 * Both are no-ops for a signed-out visitor, so the questions still work for
 * them and the read button becomes a sign-in link instead of a dead control.
 */

const SET_SIZE = 5;

type Phase = "idle" | "loading" | "quiz" | "done" | "error";

export default function LessonCheckpoint({
  subject,
  unit,
  unitIndex,
  nextUnit,
  basePath,
}: {
  subject: SubjectMeta;
  unit: CourseUnit;
  unitIndex: number;
  nextUnit: CourseUnit | null;
  basePath: string;
}) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useSupabaseUser();
  const { markUnitRead, trackQuiz } = useTracker();
  const { units } = useProgress();

  const alreadyRead = Boolean(units.find((u) => u.unit_id === unit.id)?.completed);
  // Set optimistically on click: the progress cache would otherwise keep
  // saying "not read" until its next refetch.
  const [justRead, setJustRead] = useState(false);
  const isRead = alreadyRead || justRead;

  const withQuestions = hasLessonQuestions(subject.slug, unit.id);

  return (
    <section
      aria-labelledby="lesson-check-title"
      className="mt-8 max-w-4xl mx-auto rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="px-4 pt-5 pb-4 sm:px-7 sm:pt-7">
        <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] text-gray-500">
          End of unit {unitIndex + 1} of {subject.units.length}
        </p>
        <h2
          id="lesson-check-title"
          className="mt-1.5 text-xl sm:text-2xl font-bold tracking-[-0.02em] text-gray-900"
        >
          {withQuestions ? "Check what you've learned" : "Finished this unit?"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-600 max-w-2xl">
          {withQuestions
            ? `${SET_SIZE} quick questions from this unit. They're optional: try them if you like, then mark the unit as read and move on.`
            : "Mark the unit as read to keep track of your progress, then move on."}
        </p>
      </div>

      {withQuestions && <QuestionSet subject={subject} unit={unit} trackQuiz={trackQuiz} />}

      <div className="border-t border-gray-200 bg-gray-50/70 px-4 py-4 sm:px-7 sm:py-5">
        {isRead && (
          <p role="status" className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            You&apos;ve marked this unit as read.
          </p>
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          {authLoading ? (
            <span className="h-11 w-full sm:w-44 rounded-xl bg-gray-200/70 animate-pulse" aria-hidden="true" />
          ) : !user ? (
            <Link
              href="/signin"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 hover:border-gray-400 transition-colors"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in to mark as read
            </Link>
          ) : isRead ? (
            <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 text-sm font-semibold text-emerald-800">
              <Check className="h-4 w-4" aria-hidden="true" />
              Read
            </span>
          ) : (
            <BrandButton
              onClick={() => {
                markUnitRead({
                  unitId: unit.id,
                  unitTitle: unit.title,
                  subject: subject.title,
                  semester: subject.semester,
                  href: pathname,
                });
                clearProgressCache();
                setJustRead(true);
              }}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Mark as read
            </BrandButton>
          )}

          {nextUnit ? (
            <Link
              href={`${basePath}/${nextUnit.id}`}
              className={
                isRead
                  ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-[background] sm:ml-auto"
                  : "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 hover:border-gray-400 transition-colors sm:ml-auto"
              }
              style={isRead ? { background: BRAND_BUTTON } : undefined}
            >
              <span className="truncate">Next: {nextUnit.shortTitle}</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href={basePath}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 hover:border-gray-400 transition-colors sm:ml-auto"
            >
              Last unit — back to {subject.title}
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          )}
        </div>

        {!authLoading && !user && (
          <p className="mt-2.5 text-xs text-gray-500">
            Lessons and questions are free without an account. Signing in keeps which units you&apos;ve read.
          </p>
        )}
      </div>
    </section>
  );
}

function BrandButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1C7BD9]"
      style={{ background: hover ? BRAND_BUTTON_HOVER : BRAND_BUTTON }}
    >
      {children}
    </button>
  );
}

function QuestionSet({
  subject,
  unit,
  trackQuiz,
}: {
  subject: SubjectMeta;
  unit: CourseUnit;
  trackQuiz: ReturnType<typeof useTracker>["trackQuiz"];
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [pool, setPool] = useState<MCQQuestion[]>([]);
  const [set, setSet] = useState<MCQQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  // question id → chosen option id
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const recorded = useRef(false);
  const lastSetIds = useRef<number[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  const score = set.filter((q) => answers[q.id] === q.correctAnswer).length;

  // Record a finished set exactly once. Signed-out visitors are ignored by the tracker.
  useEffect(() => {
    if (phase !== "done" || recorded.current || set.length === 0) return;
    recorded.current = true;
    trackQuiz({
      quizId: `lesson:${subject.slug}:${unit.id}`,
      subject: subject.title,
      score,
      total: set.length,
    });
  }, [phase, score, set.length, subject.slug, subject.title, unit.id, trackQuiz]);

  const startSet = (from: MCQQuestion[]) => {
    // Prefer questions the student didn't just see, when the pool allows it.
    const fresh = from.filter((q) => lastSetIds.current.indexOf(q.id) === -1);
    const next = pickQuestions(fresh.length >= SET_SIZE ? fresh : from, SET_SIZE);
    lastSetIds.current = next.map((q) => q.id);
    recorded.current = false;
    setSet(next);
    setAnswers({});
    setCurrent(0);
    setPhase(next.length ? "quiz" : "error");
  };

  const begin = async () => {
    if (pool.length) return startSet(pool);
    setPhase("loading");
    try {
      const loaded = await loadLessonQuestions(subject.slug, unit.id);
      setPool(loaded);
      startSet(loaded);
    } catch {
      setPhase("error");
    }
  };

  // Keep the question card in view when moving on — on a phone the Next button
  // sits below a long explanation.
  const goTo = (index: number) => {
    setCurrent(index);
    cardRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  if (phase === "idle" || phase === "loading" || phase === "error") {
    return (
      <div className="px-4 pb-5 sm:px-7 sm:pb-7">
        <button
          type="button"
          onClick={begin}
          disabled={phase === "loading"}
          className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#1C7BD9]/30 bg-[#1C7BD9]/[0.06] px-5 text-sm font-semibold text-[#155FA8] hover:bg-[#1C7BD9]/10 disabled:opacity-60 transition-colors"
        >
          <ListChecks className="h-4 w-4" aria-hidden="true" />
          {phase === "loading" ? "Loading questions…" : `Try ${SET_SIZE} questions`}
        </button>
        {phase === "error" && (
          <p role="alert" className="mt-2 text-sm text-red-700">
            The questions couldn&apos;t load. Check your connection and try again.
          </p>
        )}
      </div>
    );
  }

  if (phase === "done") {
    const allRight = score === set.length;
    return (
      <div className="px-4 pb-5 sm:px-7 sm:pb-7">
        <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
          <p className="text-sm text-gray-600">Your score</p>
          <p className="mt-0.5 text-3xl font-bold tracking-[-0.03em] text-gray-900">
            {score} <span className="text-lg font-semibold text-gray-500">/ {set.length} correct</span>
          </p>
          <p className="mt-1.5 text-sm text-gray-700">
            {allRight
              ? "All correct — this unit has stuck."
              : score >= set.length - 1
                ? "Nearly there. The answer you missed is shown below."
                : "Worth another read of the lesson above before moving on."}
          </p>

          {/* `!` beats globals.css `ol:not(.prose ol)` / `li:not(.prose li)`, which
              out-rank a plain utility class and would indent and space the list. */}
          <ol className="mt-4 space-y-1.5 !list-none !pl-0 !mb-0">
            {set.map((q, i) => {
              const right = answers[q.id] === q.correctAnswer;
              return (
                <li key={q.id} className="flex items-start gap-2 text-sm !text-gray-700 !mb-0">
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${right ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                    aria-label={right ? "Correct" : "Incorrect"}
                  >
                    {right ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </span>
                  <span className="min-w-0">
                    <span className="text-gray-500">{i + 1}.</span> {q.question}
                    {!right && (
                      <span className="block text-xs text-gray-500">
                        Answer: {q.options.find((o) => o.id === q.correctAnswer)?.text}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>

          <button
            type="button"
            onClick={() => startSet(pool)}
            className="mt-4 inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 hover:border-gray-400 transition-colors"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try {SET_SIZE} more
          </button>
        </div>
      </div>
    );
  }

  // phase === "quiz"
  const q = set[current];
  const chosen = answers[q.id];
  const answered = chosen !== undefined;
  const correct = chosen === q.correctAnswer;
  const isLast = current === set.length - 1;

  return (
    <div ref={cardRef} className="px-4 pb-5 sm:px-7 sm:pb-7 scroll-mt-24">
      <div className="rounded-xl border border-gray-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-500">
            Question {current + 1} of {set.length}
          </p>
          <div className="flex gap-1.5" aria-hidden="true">
            {set.map((item, i) => {
              const a = answers[item.id];
              const tone =
                a === undefined
                  ? i === current
                    ? "bg-[#1C7BD9]"
                    : "bg-gray-200"
                  : a === item.correctAnswer
                    ? "bg-emerald-500"
                    : "bg-red-500";
              return <span key={item.id} className={`h-1.5 w-5 rounded-full ${tone}`} />;
            })}
          </div>
        </div>

        <p className="mt-3 text-[15px] sm:text-base font-semibold leading-snug text-gray-900">{q.question}</p>

        <div className="mt-3 grid gap-2" role="group" aria-label="Answer options">
          {q.options.map((opt) => {
            const isChosen = chosen === opt.id;
            const isAnswer = opt.id === q.correctAnswer;
            let cls = "border-gray-200 bg-white hover:border-[#1C7BD9]/50 hover:bg-[#1C7BD9]/[0.03]";
            if (answered) {
              if (isAnswer) cls = "border-emerald-400 bg-emerald-50";
              else if (isChosen) cls = "border-red-300 bg-red-50";
              else cls = "border-gray-200 bg-white opacity-70";
            }
            return (
              <button
                key={opt.id}
                type="button"
                disabled={answered}
                aria-pressed={isChosen}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                className={`flex min-h-11 w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm text-gray-800 transition-colors disabled:cursor-default ${cls}`}
              >
                <span
                  className={`mt-px grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-bold ${
                    answered && isAnswer
                      ? "bg-emerald-500 text-white"
                      : answered && isChosen
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {opt.id}
                </span>
                <span className="min-w-0 pt-0.5">{opt.text}</span>
              </button>
            );
          })}
        </div>

        <div aria-live="polite">
          {answered && (
            <div
              className={`mt-3 rounded-xl border px-3.5 py-3 text-sm leading-relaxed ${
                correct ? "border-emerald-200 bg-emerald-50/60 text-emerald-950" : "border-red-200 bg-red-50/60 text-red-950"
              }`}
            >
              <p className="font-semibold">
                {correct ? "Correct." : `Not quite — the answer is ${q.correctAnswer}.`}
              </p>
              {q.explanation && <p className="mt-1 text-gray-700">{q.explanation}</p>}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={!answered}
            onClick={() => (isLast ? setPhase("done") : goTo(current + 1))}
            className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 text-sm font-semibold text-gray-800 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isLast ? "See your score" : "Next question"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
