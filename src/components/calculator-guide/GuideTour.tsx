"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuideFacts } from "./content";
import {
  CalculateSketch,
  ChooseSketch,
  FormulaSketch,
  GraphSketch,
  MiniScreenSketch,
  RawToInputSketch,
  UnitDropdownSketch,
  VerifySketch,
} from "./illustrations";

/**
 * The short version: eight cards, one idea each, before the full guide.
 *
 * Inline on the page rather than a modal. There is no dialog primitive in the
 * repo, and a card that sits in the page needs no focus trap, works the same in
 * the app's WebView, and never covers a calculator the student came to use.
 *
 * Moves with Back / Next, the arrow keys while it has focus, or a horizontal
 * swipe. "Skip" jumps to the one-screen quick start at the end of the page.
 */

type TourStep = { title: string; body: string; picture: React.ReactNode };

function buildSteps(facts: GuideFacts): TourStep[] {
  return [
    {
      title: "Choose your calculator",
      body: `Search by name, or open the subject you're studying — the index groups the calculators into ${facts.categories.length} subjects.`,
      picture: <ChooseSketch categories={facts.categories} />,
    },
    {
      title: "Read the screen top to bottom",
      body: "Title and description first, then the boxes, then the result. Some calculators have tabs or a “Try an example” button.",
      picture: <MiniScreenSketch />,
    },
    {
      title: "Enter your values as recorded",
      body: "Type numbers only. The unit goes in its own dropdown or is shown beside the box.",
      picture: <RawToInputSketch />,
    },
    {
      title: "Match every unit",
      body: "Choose the unit you measured in. A wrong unit can change the answer by a factor of 1000.",
      picture: <UnitDropdownSketch />,
    },
    {
      title: "Watch the result appear",
      body: "Most calculators update as you type. Lab-practical calculators have a Calculate button instead.",
      picture: <CalculateSketch />,
    },
    {
      title: "Open “How this is calculated”",
      body: "Every calculator shows its formula and working. Use it for your practical record and viva.",
      picture: <FormulaSketch />,
    },
    {
      title: "Read tables and graphs",
      body: "Where a calculator takes several readings, check each row and the shape of the graph.",
      picture: <GraphSketch />,
    },
    {
      title: "Reset, then verify",
      body: "Reset clears the calculator for a new dataset. Before you record an answer, check it against your manual.",
      picture: <VerifySketch />,
    },
  ];
}

export function GuideTour({ facts, onSkip }: { facts: GuideFacts; onSkip: () => void }) {
  const steps = buildSteps(facts);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();
  const startX = useRef<number | null>(null);

  const last = index === steps.length - 1;
  const go = (next: number) => {
    if (next < 0 || next >= steps.length) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  };

  const step = steps[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Quick tour of the calculators"
      tabIndex={-1}
      onKeyDown={(e) => {
        // Nothing inside the tour uses the arrow keys, so they are free to move it.
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") startX.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
      }}
      className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_24px_60px_-40px_rgba(15,23,42,.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      // Lets a vertical scroll through the page pass straight through the card,
      // while a horizontal swipe is ours to read.
      style={{ touchAction: "pan-y" }}
    >
      {/* Progress */}
      <div className="flex items-center gap-3 border-b border-border/70 px-5 py-3.5 sm:px-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Quick tour
        </p>
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {steps.map((s, i) => (
            <button
              key={s.title}
              type="button"
              tabIndex={-1}
              onClick={() => go(i)}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                i <= index ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>
        <p className="font-mono text-xs font-semibold tabular-nums text-foreground" aria-hidden="true">
          {index + 1} / {steps.length}
        </p>
      </div>

      <div className="relative min-h-[24rem] px-5 py-6 sm:px-6 sm:py-7">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center"
            aria-roledescription="slide"
            aria-label={`Step ${index + 1} of ${steps.length}`}
          >
            <div>
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                Step {index + 1}
              </p>
              <h3
                aria-live="polite"
                className="mt-2 text-2xl font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-[1.75rem]"
              >
                {step.title}
              </h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
            <div className="min-w-0">{step.picture}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls. Big enough to hit with a thumb; in reading order for a keyboard. */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/70 px-5 py-4 sm:px-6">
        <button
          type="button"
          onClick={onSkip}
          className="mr-auto h-11 rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Skip guide
        </button>
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
        </button>
        {last ? (
          <Link
            href={facts.hubHref}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Calculator className="h-4 w-4" aria-hidden="true" />
            Start calculating
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Next
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
