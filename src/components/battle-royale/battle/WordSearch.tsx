"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { FoundWord, WordSearchPlan } from "@/lib/battle-royale/types";
import { cn } from "@/lib/utils";
import { lineCells, snapLine, spell } from "./station";
import { SubmitButton } from "./SubmitButton";

// One colour per found word, like highlighter strokes.
const STROKES = ["#1C7BD9", "#f59e0b", "#21B67A", "#8b5cf6", "#e11d48", "#0891b2", "#65a30d", "#c026d3", "#ea580c", "#0d9488"];

/**
 * Round 1. Drag across a word in any of the 8 directions — or tap its first
 * letter, then its last. The grid and the word list are public by nature (the
 * player can see every letter), so finding a word is checked right here for
 * instant feedback; the server re-checks every claimed path when the round is
 * submitted, and only credits a path that really spells a listed word.
 */
export function WordSearch({
  plan,
  found,
  disabled,
  onFind,
  onFinish,
}: {
  plan: WordSearchPlan;
  found: FoundWord[];
  disabled: boolean;
  onFind: (w: FoundWord) => void;
  onFinish: () => void;
}) {
  const size = plan.grid.length;
  const [anchor, setAnchor] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [miss, setMiss] = useState(false);
  const dragging = useRef(false);
  // The handlers read these refs, not state: a fast press-and-drag delivers
  // move events before React has re-rendered with the new anchor, and a
  // handler reading state would see the old (empty) one and drop the drag.
  const anchorRef = useRef<[number, number] | null>(null);
  const endRef = useRef<[number, number] | null>(null);
  const setA = (v: [number, number] | null) => {
    anchorRef.current = v;
    setAnchor(v);
  };
  const setE = (v: [number, number] | null) => {
    endRef.current = v;
    setEnd(v);
  };
  const moved = useRef(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const foundSet = useMemo(() => new Set(found.map((f) => f.word)), [found]);

  const selection = anchor && end ? lineCells(anchor[0], anchor[1], end[0], end[1]) ?? [] : anchor ? [anchor] : [];
  const selected = new Set(selection.map(([r, c]) => `${r},${c}`));

  const cellFrom = (x: number, y: number): [number, number] | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const cell = el?.closest<HTMLElement>("[data-cell]");
    if (!cell || !gridRef.current?.contains(cell)) return null;
    return [Number(cell.dataset.r), Number(cell.dataset.c)];
  };

  const evaluate = (a: [number, number], b: [number, number]) => {
    const cells = lineCells(a[0], a[1], b[0], b[1]);
    if (!cells || cells.length < 3) return false;
    const s = spell(plan.grid, cells);
    const rev = s.split("").reverse().join("");
    const word = plan.words.find((w) => (w === s || w === rev) && !foundSet.has(w));
    if (word) {
      onFind({ word, r1: a[0], c1: a[1], r2: b[0], c2: b[1] });
      return true;
    }
    return false;
  };

  const flashMiss = () => {
    setMiss(true);
    window.setTimeout(() => setMiss(false), 350);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    const cell = cellFrom(e.clientX, e.clientY);
    if (!cell) return;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    const anchorNow = anchorRef.current;
    // Second tap of a tap-tap selection.
    if (anchorNow && !dragging.current && (anchorNow[0] !== cell[0] || anchorNow[1] !== cell[1])) {
      const [er, ec] = snapLine(anchorNow[0], anchorNow[1], cell[0], cell[1], size);
      if (!evaluate(anchorNow, [er, ec])) flashMiss();
      setA(null);
      setE(null);
      return;
    }
    dragging.current = true;
    moved.current = false;
    setA(cell);
    setE(cell);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const a = anchorRef.current;
    if (!dragging.current || !a) return;
    const cell = cellFrom(e.clientX, e.clientY);
    if (!cell) return;
    const snapped = snapLine(a[0], a[1], cell[0], cell[1], size);
    if (snapped[0] !== a[0] || snapped[1] !== a[1]) moved.current = true;
    setE(snapped);
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const a = anchorRef.current;
    const b = endRef.current;
    if (!moved.current || !a || !b) {
      // A tap: keep the anchor and wait for the second tap.
      setE(null);
      return;
    }
    if (!evaluate(a, b)) flashMiss();
    setA(null);
    setE(null);
  };

  // Esc clears a half-made selection.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setA(null);
        setE(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pct = (i: number) => ((i + 0.5) / size) * 100;
  const total = plan.words.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#1C7BD9]">Word search · {found.length} of {total} found</p>
        <h2 className="mt-1.5 text-xl font-bold text-[#16181d] sm:text-2xl">Find the pharmacy words</h2>
        <div
          ref={gridRef}
          role="grid"
          aria-label="Letter grid"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "relative mx-auto mt-4 aspect-square w-full max-w-[34rem] touch-none select-none rounded-2xl border border-[#16181d]/10 bg-white p-1.5",
            miss && "animate-[br-shake_0.3s_ease-in-out]",
          )}
        >
          {/* Found-word strokes, under the letters. */}
          <svg className="pointer-events-none absolute inset-1.5 h-[calc(100%-0.75rem)] w-[calc(100%-0.75rem)]" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {found.map((f, i) => (
              <line
                key={f.word}
                x1={pct(f.c1)} y1={pct(f.r1)} x2={pct(f.c2)} y2={pct(f.r2)}
                stroke={STROKES[i % STROKES.length]}
                strokeOpacity="0.85"
                strokeWidth={(100 / size) * 0.72}
                strokeLinecap="round"
              />
            ))}
            {selection.length > 0 && (
              <line
                x1={pct(selection[0][1])} y1={pct(selection[0][0])}
                x2={pct(selection[selection.length - 1][1])} y2={pct(selection[selection.length - 1][0])}
                stroke="#16181d"
                strokeOpacity="0.14"
                strokeWidth={(100 / size) * 0.72}
                strokeLinecap="round"
              />
            )}
          </svg>
          <div className="relative grid h-full w-full" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
            {plan.grid.flatMap((row, r) =>
              row.split("").map((ch, c) => (
                <span
                  key={`${r}-${c}`}
                  data-cell=""
                  data-r={r}
                  data-c={c}
                  role="gridcell"
                  aria-selected={selected.has(`${r},${c}`)}
                  className={cn(
                    "flex items-center justify-center font-bold uppercase text-[#16181d]",
                    size > 11 ? "text-[clamp(0.8rem,3.6vw,1.25rem)]" : "text-[clamp(0.95rem,4.4vw,1.5rem)]",
                    selected.has(`${r},${c}`) && "text-[#0f4f8f]",
                  )}
                >
                  {ch}
                </span>
              )),
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-[#16181d]/55">Drag across a word, or tap its first letter and then its last. Esc clears.</p>
      </div>

      <aside className="rounded-2xl border border-[#16181d]/10 bg-white p-4">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#16181d]/55">Word list</p>
        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 lg:grid-cols-1">
          {plan.words.map((w) => {
            const got = foundSet.has(w);
            const i = found.findIndex((f) => f.word === w);
            return (
              <li key={w} className={cn("flex items-center gap-2 text-sm font-semibold", got ? "text-[#16181d]/45 line-through" : "text-[#16181d]")}>
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={got ? { background: STROKES[i % STROKES.length] } : { boxShadow: "inset 0 0 0 1.5px rgba(22,24,29,.25)" }}
                >
                  {got && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </span>
                {w}
              </li>
            );
          })}
        </ul>
        <div className="mt-5">
          <SubmitButton disabled={disabled} onClick={onFinish} label={found.length === total ? "Submit round" : "Finish round"} />
        </div>
      </aside>
    </div>
  );
}
