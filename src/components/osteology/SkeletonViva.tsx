"use client";

/**
 * Skeleton identification on the full articulated Z-Anatomy skeleton (decimated for
 * phones). "Find" mode names a bone and side; the student taps it. "Explore" mode names
 * whatever is tapped and links to its lesson. Only bones the lab teaches are asked for.
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SkeletonPart } from "@/lib/osteology/models";
import { ModelViewer } from "./viewer/ModelViewer";
import { recordPractice } from "./progress-store";

const ROUND = 10;
const VIEWS = [
  { id: "anterior", label: "Front", dir: [0, 0, 1] as [number, number, number] },
  { id: "posterior", label: "Back", dir: [0, 0, -1] as [number, number, number] },
  { id: "right", label: "Right side", dir: [-1, 0, 0] as [number, number, number] },
  { id: "left", label: "Left side", dir: [1, 0, 0] as [number, number, number] },
];

/** "left femur", "atlas (C1)": the side, then the bone in lower case ("Hip bone" → "hip bone"). */
const label = (p: SkeletonPart) => (p.side === "midline" ? p.base : `${p.side} ${p.base.charAt(0).toLowerCase()}${p.base.slice(1)}`);

export function SkeletonViva({ src, sizeLabel, parts, boneNames }: { src: string; sizeLabel: string; parts: SkeletonPart[]; boneNames: Record<string, string> }) {
  const [mode, setMode] = useState<"explore" | "find">("find");
  const [picked, setPicked] = useState<string | null>(null);
  const askable = useMemo(() => parts.filter((p) => p.bone), [parts]);
  const [round, setRound] = useState<SkeletonPart[]>([]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<{ right: boolean; tapped: string } | null>(null);

  const byName = useMemo(() => new Map(parts.map((p) => [p.name, p])), [parts]);
  const target = round[i];

  function newRound() {
    const pool = [...askable];
    for (let k = pool.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [pool[k], pool[j]] = [pool[j], pool[k]];
    }
    setRound(pool.slice(0, ROUND));
    setI(0);
    setScore(0);
    setAnswer(null);
    setPicked(null);
  }

  function onTap(name: string | null) {
    setPicked(name);
    if (mode !== "find" || !target || answer || !name) return;
    const right = name === target.name;
    setAnswer({ right, tapped: name });
    if (right) setScore((s) => s + 1);
  }

  function next() {
    setAnswer(null);
    setPicked(null);
    if (i + 1 >= round.length) {
      recordPractice({ kind: "skeleton", correct: score, total: round.length });
      setRound([]);
    } else setI(i + 1);
  }

  const pickedPart = picked ? byName.get(picked) : undefined;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
      <ModelViewer
        src={src}
        sizeLabel={sizeLabel}
        views={VIEWS}
        selectableParts
        // Green means right: a wrong tap is not painted green; only the target turns blue.
        selectedPart={answer ? (answer.right ? answer.tapped : null) : picked}
        highlightParts={answer && !answer.right && target ? [target.name] : []}
        onSelectPart={onTap}
        heightClass="h-[70svh] min-h-[380px] max-h-[760px]"
        hint="Pinch to zoom in on the hands and feet. Tap a bone to answer."
        fallback={<p className="text-sm">The skeleton viva needs 3D. Use the viva trainer instead.</p>}
      />

      <div className="space-y-4">
        <div className="inline-flex overflow-hidden rounded-xl border border-[#16181d]/12" role="group" aria-label="Mode">
          {(["find", "explore"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                setAnswer(null);
                setPicked(null);
              }}
              className={cn("min-h-11 px-4 text-sm font-semibold", mode === m ? "bg-[#16181d] text-white" : "bg-white")}
            >
              {m === "find" ? "Find the bone" : "Explore"}
            </button>
          ))}
        </div>

        {mode === "explore" ? (
          <div className="rounded-2xl border border-[#16181d]/10 bg-white p-5" aria-live="polite">
            {pickedPart ? (
              <>
                <p className="text-xl font-bold first-letter:uppercase">{label(pickedPart)}</p>
                {pickedPart.bone ? (
                  <Link href={`/osteology-lab/bones/${pickedPart.bone}`} className="mt-2 inline-flex min-h-10 items-center font-semibold text-brandBlue underline underline-offset-2">
                    Open the {boneNames[pickedPart.bone] ?? pickedPart.bone} lesson
                  </Link>
                ) : (
                  <p className="mt-2 text-sm text-[#5b616b]">Shown for context; the lab has no lesson for this bone yet.</p>
                )}
              </>
            ) : (
              <p className="text-[#4a4f57]">Tap any bone to name it.</p>
            )}
          </div>
        ) : round.length === 0 ? (
          <div className="rounded-2xl border border-[#16181d]/10 bg-white p-5">
            <p className="text-[#4a4f57]">{ROUND} bones, named with their side. Tap each one on the skeleton.</p>
            <button type="button" onClick={newRound} className="mt-4 min-h-12 rounded-xl bg-brandBlue px-5 font-semibold text-white">Start a round</button>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#16181d]/10 bg-white p-5" aria-live="polite">
            <p className="text-sm text-[#5b616b]">Bone {i + 1} of {round.length} · score {score}</p>
            <p className="mt-2 text-xl font-bold">Tap the {label(target)}.</p>
            {answer && (
              <div className={cn("mt-3 rounded-xl p-3 text-sm", answer.right ? "bg-[#effaf4] text-[#0f5132]" : "bg-red-50 text-red-900")}>
                {answer.right ? "Correct." : <>That is the <strong>{byName.get(answer.tapped) ? label(byName.get(answer.tapped)!) : answer.tapped}</strong>. The {label(target)} is highlighted in blue.</>}
              </div>
            )}
            {answer && (
              <button type="button" onClick={next} className="mt-3 min-h-12 w-full rounded-xl bg-brandBlue font-semibold text-white">
                {i + 1 < round.length ? "Next bone" : "Finish round"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
