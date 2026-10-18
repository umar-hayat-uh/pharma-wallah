"use client";

/**
 * One station: the specimen image (if any) with its marker, the question, and large
 * answer buttons. Used by spotting practice and the mock exam. Feedback is a prop: in
 * practice it arrives from /api/osteology/check; in an exam there is none until submission.
 */
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Expand, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TYPE_LABEL, type QType } from "@/lib/osteology/exam-config";

export type ClientQuestion = {
  index: number;
  type: QType;
  prompt: string;
  image?: { src: string; alt: string; marker?: { x: number; y: number } };
  options: string[];
};

export type Feedback = { correct: boolean; answer: number; explanation: string; learnHref: string };

type Props = {
  q: ClientQuestion;
  chosen: number | null;
  onChoose: (i: number) => void;
  feedback?: Feedback | null;
  disabled?: boolean;
  /** "Station 3 of 20" etc. */
  heading?: React.ReactNode;
};

export function QuestionCard({ q, chosen, onChoose, feedback, disabled, heading }: Props) {
  const [zoom, setZoom] = useState(false);
  const promptRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the new question so keyboard and screen-reader users follow along.
  useEffect(() => {
    promptRef.current?.focus({ preventScroll: true });
  }, [q.index]);

  return (
    <div className="rounded-2xl border border-[#16181d]/10 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="rounded-full bg-brandBlue/10 px-3 py-1 font-semibold text-brandBlue">{TYPE_LABEL[q.type]}</span>
        {heading}
      </div>

      {q.image && (
        <div className="mt-4">
          <Specimen image={q.image} />
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[#6b7079]">
            <span>3D-model render — not a photograph or X-ray</span>
            <button type="button" onClick={() => setZoom(true)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 font-semibold text-brandBlue">
              <Expand className="h-4 w-4" aria-hidden /> Enlarge
            </button>
          </div>
        </div>
      )}

      <h2 ref={promptRef} tabIndex={-1} className="mt-4 text-lg font-bold leading-snug outline-none sm:text-xl">
        {q.prompt}
      </h2>

      <div role="radiogroup" aria-label="Answer options" className="mt-4 grid gap-2.5">
        {q.options.map((opt, i) => {
          const isChosen = chosen === i;
          const isAnswer = feedback && feedback.answer === i;
          const isWrongPick = feedback && isChosen && !feedback.correct;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isChosen}
              disabled={disabled}
              onClick={() => onChoose(i)}
              className={cn(
                "flex min-h-14 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brandBlue disabled:cursor-default",
                isAnswer
                  ? "border-brandGreen bg-[#effaf4]"
                  : isWrongPick
                    ? "border-red-400 bg-red-50"
                    : isChosen
                      ? "border-brandBlue bg-brandBlue/[0.06]"
                      : "border-[#16181d]/10 bg-white hover:border-brandBlue/40",
              )}
            >
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold",
                  isChosen ? "border-brandBlue bg-brandBlue text-white" : "border-[#16181d]/20 text-[#4a4f57]",
                )}
                aria-hidden
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {isAnswer && <CheckCircle2 className="h-5 w-5 text-brandGreen" aria-label="correct answer" />}
              {isWrongPick && <XCircle className="h-5 w-5 text-red-500" aria-label="your answer, incorrect" />}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          role="status"
          className={cn("mt-4 rounded-xl p-4 text-[15px] leading-relaxed", feedback.correct ? "bg-[#effaf4] text-[#0f5132]" : "bg-red-50 text-red-900")}
        >
          <p className="font-bold">{feedback.correct ? "Correct." : `Not quite — the answer is ${q.options[feedback.answer]}.`}</p>
          <p className="mt-1 text-[#2b2f36]">{feedback.explanation}</p>
          <a href={feedback.learnHref} className="mt-2 inline-flex min-h-10 items-center font-semibold text-brandBlue underline underline-offset-2">
            Learn this in the lesson
          </a>
        </div>
      )}

      {zoom && q.image && (
        <div role="dialog" aria-modal="true" aria-label="Enlarged specimen" className="fixed inset-0 z-[70] flex flex-col bg-[#0d2a45]/95 p-3">
          <div className="flex justify-end">
            <button type="button" onClick={() => setZoom(false)} autoFocus className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold">
              <X className="h-4 w-4" aria-hidden /> Close
            </button>
          </div>
          {/* touch-action: pinch-zoom lets the phone's own pinch enlarge the image. */}
          <div className="mt-3 flex-1 overflow-auto [touch-action:pan-x_pan-y_pinch-zoom]">
            <Specimen image={q.image} large />
          </div>
        </div>
      )}
    </div>
  );
}

function Specimen({ image, large }: { image: NonNullable<ClientQuestion["image"]>; large?: boolean }) {
  return (
    <div className={cn("relative mx-auto aspect-square w-full overflow-hidden rounded-xl bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#e9eef4_80%)]", large ? "max-w-[min(100%,90svh)]" : "max-w-md")}>
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size local render, no optimisation needed */}
      <img src={image.src} alt={image.alt} className="h-full w-full object-contain" loading="eager" decoding="async" />
      {image.marker && (
        <span
          className="pointer-events-none absolute"
          style={{ left: `${image.marker.x * 100}%`, top: `${image.marker.y * 100}%` }}
          aria-hidden
        >
          {/* An arrow from the upper left ending exactly on the anchor, plus a ring. */}
          <svg width="56" height="56" viewBox="0 0 56 56" className="absolute -left-[50px] -top-[50px] overflow-visible">
            <line x1="4" y1="4" x2="44" y2="44" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
            <line x1="4" y1="4" x2="44" y2="44" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="50" r="6" fill="none" stroke="#ffffff" strokeWidth="5" />
            <circle cx="50" cy="50" r="6" fill="none" stroke="#e11d48" strokeWidth="2.5" />
          </svg>
        </span>
      )}
    </div>
  );
}
