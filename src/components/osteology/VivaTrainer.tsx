"use client";

/**
 * Oral-viva practice: one question at a time, say the answer aloud, reveal it, then
 * mark "I knew it" or "Revise later". The revise list persists on this device and can
 * be drilled on its own. Self-assessed, so nothing here is graded by the server — it is
 * the written viva bank that the lessons already show.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { BookmarkCheck, Eye, RotateCcw, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { recordPractice, toggleRevise, useOsteoProgress } from "./progress-store";

export type VivaCard = { key: string; q: string; a: string; topic: string; href: string; region: string; kind: "bone" | "joint" };

const REGION_LABEL: Record<string, string> = { "upper-limb": "Upper limb", "lower-limb": "Pelvis & lower limb", axial: "Axial" };

function shuffled<T>(a: T[]): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [x[i], x[j]] = [x[j], x[i]];
  }
  return x;
}

export function VivaTrainer({ cards }: { cards: VivaCard[] }) {
  const progress = useOsteoProgress();
  const [region, setRegion] = useState("all");
  const [kind, setKind] = useState<"all" | "bone" | "joint">("all");
  const [onlyRevise, setOnlyRevise] = useState(false);
  const [deck, setDeck] = useState<VivaCard[] | null>(null);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [knew, setKnew] = useState(0);

  const pool = useMemo(
    () =>
      cards.filter(
        (c) => (region === "all" || c.region === region) && (kind === "all" || c.kind === kind) && (!onlyRevise || progress.revise.includes(c.key)),
      ),
    [cards, region, kind, onlyRevise, progress.revise],
  );

  function begin() {
    setDeck(shuffled(pool).slice(0, 20));
    setI(0);
    setShown(false);
    setKnew(0);
  }

  function mark(known: boolean) {
    if (!deck) return;
    const card = deck[i];
    const listed = progress.revise.includes(card.key);
    if (known === listed) toggleRevise(card.key); // knew it → leave the list; didn't → join it
    const k = knew + (known ? 1 : 0);
    setKnew(k);
    if (i + 1 < deck.length) {
      setI(i + 1);
      setShown(false);
    } else {
      recordPractice({ kind: "viva", correct: k, total: deck.length });
      setI(deck.length);
    }
  }

  if (!deck) {
    return (
      <div className="rounded-2xl border border-[#16181d]/10 bg-white p-5 sm:p-6">
        <h2 className="text-xl font-bold">Viva trainer</h2>
        <p className="mt-1 text-sm text-[#4a4f57]">Read the question, answer it out loud as you would to an examiner, then reveal the model answer.</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Region">
          {["all", "upper-limb", "lower-limb", "axial"].map((r) => (
            <Pill key={r} on={region === r} onClick={() => setRegion(r)}>{r === "all" ? "All regions" : REGION_LABEL[r]}</Pill>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Bones or joints">
          {(["all", "bone", "joint"] as const).map((k) => (
            <Pill key={k} on={kind === k} onClick={() => setKind(k)}>{k === "all" ? "Bones and joints" : k === "bone" ? "Bones" : "Joints"}</Pill>
          ))}
        </div>
        <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={onlyRevise} onChange={(e) => setOnlyRevise(e.target.checked)} className="h-5 w-5 accent-[#1c7bd9]" />
          Only my “revise later” list ({progress.revise.length})
        </label>
        <button
          type="button"
          onClick={begin}
          disabled={pool.length === 0}
          className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brandBlue px-5 font-semibold text-white disabled:opacity-50"
        >
          <Shuffle className="h-4 w-4" aria-hidden /> Start ({Math.min(20, pool.length)} of {pool.length} questions, shuffled)
        </button>
        {pool.length === 0 && <p className="mt-2 text-sm text-[#5b616b]">{onlyRevise ? "Your revise list is empty for this selection." : "No questions match."}</p>}
      </div>
    );
  }

  if (i >= deck.length) {
    return (
      <div className="rounded-2xl border border-[#16181d]/10 bg-white p-6 text-center">
        <p className="text-4xl font-bold">{knew} / {deck.length}</p>
        <p className="mt-1 text-[#4a4f57]">answered confidently. {deck.length - knew > 0 ? `${deck.length - knew} added to your revise list.` : ""}</p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => setDeck(null)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brandBlue px-5 font-semibold text-white">
            <RotateCcw className="h-4 w-4" aria-hidden /> New round
          </button>
        </div>
      </div>
    );
  }

  const card = deck[i];
  return (
    <div className="rounded-2xl border border-[#16181d]/10 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between text-sm text-[#5b616b]">
        <span>Question {i + 1} of {deck.length}</span>
        <Link href={card.href} className="font-semibold text-brandBlue underline-offset-2 hover:underline">{card.topic}</Link>
      </div>
      <p className="mt-4 text-xl font-bold leading-snug">{card.q}</p>
      {shown ? (
        <>
          <p className="mt-4 rounded-xl bg-[#f4f7fb] p-4 leading-relaxed" aria-live="polite">{card.a}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => mark(false)} className="min-h-14 rounded-xl border-2 border-amber-300 bg-amber-50 font-semibold text-amber-950">Revise later</button>
            <button type="button" onClick={() => mark(true)} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-brandGreen font-semibold text-white">
              <BookmarkCheck className="h-4 w-4" aria-hidden /> I knew it
            </button>
          </div>
        </>
      ) : (
        <button type="button" onClick={() => setShown(true)} className="mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#16181d] font-semibold text-white">
          <Eye className="h-4 w-4" aria-hidden /> Reveal answer
        </button>
      )}
    </div>
  );
}

function Pill({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cn("min-h-10 rounded-full px-4 text-sm font-medium", on ? "bg-brandBlue text-white" : "border border-[#16181d]/15 bg-white")}>
      {children}
    </button>
  );
}
