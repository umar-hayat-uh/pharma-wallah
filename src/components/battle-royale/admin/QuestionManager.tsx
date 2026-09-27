"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog, Dialog } from "./Dialog";
import { adminFetch, useMutation } from "./client";
import { Field, Notice, StatusBadge, inputClass, selectClass } from "../ui";
import { BR_BASE, ROUNDS } from "@/lib/battle-royale/constants";
import { cn } from "@/lib/utils";

export type QuestionRowView = {
  id: string; round: 1 | 2 | 3; type: "WORD" | "MATCHING" | "MCQ"; question: string;
  options: { A?: string; B?: string; C?: string; D?: string; pairs?: { left: string; right: string }[] };
  correct_answer: string | null; explanation: string | null; points: number; time_limit: number;
  difficulty: "easy" | "medium" | "hard"; active: boolean;
};

type Draft = {
  question: string; explanation: string; points: string; timeLimit: string; difficulty: "easy" | "medium" | "hard"; active: boolean;
  answer: string; options: { A: string; B: string; C: string; D: string }; pairs: { left: string; right: string }[];
};

const TYPE_FOR: Record<1 | 2 | 3, "WORD" | "MATCHING" | "MCQ"> = { 1: "WORD", 2: "MATCHING", 3: "MCQ" };
const DEFAULTS: Record<1 | 2 | 3, { points: string; timeLimit: string }> = {
  1: { points: "10", timeLimit: "35" },
  2: { points: "5", timeLimit: "75" },
  3: { points: "10", timeLimit: "20" },
};

function blank(round: 1 | 2 | 3): Draft {
  return {
    question: "", explanation: "", difficulty: "medium", active: true, answer: round === 3 ? "A" : "",
    options: { A: "", B: "", C: "", D: "" },
    pairs: Array.from({ length: 5 }, () => ({ left: "", right: "" })),
    ...DEFAULTS[round],
  };
}

function fromRow(q: QuestionRowView): Draft {
  return {
    question: q.question, explanation: q.explanation ?? "", points: String(q.points), timeLimit: String(q.time_limit),
    difficulty: q.difficulty, active: q.active, answer: q.correct_answer ?? "",
    options: { A: q.options.A ?? "", B: q.options.B ?? "", C: q.options.C ?? "", D: q.options.D ?? "" },
    pairs: q.options.pairs ?? blank(2).pairs,
  };
}

export function QuestionManager({ round, active, rows }: { round: 1 | 2 | 3; active: [number, number, number]; rows: QuestionRowView[] }) {
  const [editing, setEditing] = useState<QuestionRowView | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(blank(round));
  const [deleting, setDeleting] = useState<QuestionRowView | null>(null);
  const { run, pending, error, message, setError } = useMutation();

  const open = (row: QuestionRowView | "new") => {
    setError(null);
    setEditing(row);
    setDraft(row === "new" ? blank(round) : fromRow(row));
  };

  const save = async () => {
    const type = TYPE_FOR[round];
    const base = {
      type, question: draft.question, explanation: draft.explanation, points: draft.points,
      timeLimit: draft.timeLimit, difficulty: draft.difficulty, active: draft.active,
    };
    const body =
      type === "WORD" ? { ...base, answer: draft.answer }
      : type === "MCQ" ? { ...base, answer: draft.answer, options: draft.options }
      : { ...base, pairs: draft.pairs.filter((p) => p.left.trim() || p.right.trim()) };
    const url = editing === "new" ? "/api/battle-royale/admin/questions" : `/api/battle-royale/admin/questions/${(editing as QuestionRowView).id}`;
    const r = await run(() => adminFetch(url, editing === "new" ? "POST" : "PATCH", body), "Question saved.");
    if (r) setEditing(null);
  };

  const toggle = (q: QuestionRowView) =>
    run(() => adminFetch(`/api/battle-royale/admin/questions/${q.id}`, "PATCH", { active: !q.active }), q.active ? "Question retired." : "Question active.");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-1 rounded-xl bg-white p-1 ring-1 ring-[#16181d]/10" aria-label="Round">
          {ROUNDS.map((r) => (
            <Link
              key={r.no}
              href={`${BR_BASE}/admin/questions?round=${r.no}`}
              aria-current={round === r.no ? "page" : undefined}
              className={cn("rounded-lg px-3 py-2 text-sm font-semibold", round === r.no ? "bg-[#1C7BD9] text-white" : "text-[#16181d]/60 hover:text-[#16181d]")}
            >
              {r.no}. {r.name} <span className="font-normal opacity-75">({active[r.no - 1]})</span>
            </Link>
          ))}
        </nav>
        <button type="button" onClick={() => open("new")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1C7BD9] px-4 text-sm font-semibold text-white">
          <Plus className="h-4 w-4" /> New question
        </button>
      </div>
      {error && !editing && <Notice tone="red">{error}</Notice>}
      {message && <Notice tone="green">{message}</Notice>}

      <ul className="space-y-2">
        {rows.length === 0 && <li className="rounded-2xl border border-dashed border-[#16181d]/20 px-4 py-10 text-center text-sm text-[#16181d]/55">No questions in this round yet.</li>}
        {rows.map((q) => (
          <li key={q.id} className={cn("rounded-2xl border bg-white p-4", q.active ? "border-[#16181d]/10" : "border-dashed border-[#16181d]/15 opacity-60")}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{q.question}</p>
                <p className="mt-1 text-sm text-[#16181d]/60">
                  {q.type === "WORD" && <>Answer: <strong className="font-mono">{q.correct_answer}</strong></>}
                  {q.type === "MCQ" && <>Answer: <strong>{q.correct_answer} — {q.options[q.correct_answer as "A"]}</strong></>}
                  {q.type === "MATCHING" && <>{q.options.pairs?.map((p) => `${p.left} → ${p.right}`).join(" · ")}</>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <StatusBadge>{q.difficulty}</StatusBadge>
                <StatusBadge tone="blue">{q.points} pts{q.type === "MATCHING" ? "/pair" : ""}</StatusBadge>
                <StatusBadge>{q.time_limit}s</StatusBadge>
                <button type="button" disabled={pending} onClick={() => void toggle(q)} className={cn("h-8 rounded-lg px-2.5 text-xs font-semibold", q.active ? "text-[#0f7a50]" : "text-[#16181d]/60")}>
                  {q.active ? "Active" : "Retired"}
                </button>
                <button type="button" onClick={() => open(q)} className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-semibold" aria-label="Edit question">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button type="button" onClick={() => setDeleting(q)} className="h-8 rounded-lg px-2 text-red-600" aria-label="Delete question">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} title={`${editing === "new" ? "New" : "Edit"} ${ROUNDS[round - 1].name} question`} wide>
        <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-4">
          {error && <Notice tone="red">{error}</Notice>}
          <Field id="q-text" label={round === 1 ? "Clue" : round === 2 ? "Instruction" : "Question"}>
            <textarea id="q-text" required rows={2} className={cn(inputClass, "h-auto py-2.5")} value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
          </Field>

          {round === 1 && (
            <Field id="q-word" label="Word" hint="3–16 letters, A–Z only. Players see these letters scrambled.">
              <input id="q-word" required className={cn(inputClass, "font-mono uppercase tracking-widest")} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value.toUpperCase().replace(/[^A-Z]/g, "") })} />
            </Field>
          )}

          {round === 3 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {(["A", "B", "C", "D"] as const).map((k) => (
                <Field key={k} id={`q-opt-${k}`} label={`Option ${k}`}>
                  <input id={`q-opt-${k}`} required className={inputClass} value={draft.options[k]} onChange={(e) => setDraft({ ...draft, options: { ...draft.options, [k]: e.target.value } })} />
                </Field>
              ))}
              <Field id="q-correct" label="Correct option">
                <select id="q-correct" className={selectClass} value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })}>
                  {["A", "B", "C", "D"].map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
            </div>
          )}

          {round === 2 && (
            <div>
              <p className="mb-2 text-sm font-semibold">Pairs <span className="font-normal text-[#16181d]/55">(3–8; Column B is shuffled for players)</span></p>
              <div className="space-y-2">
                {draft.pairs.map((p, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto] gap-2">
                    <input aria-label={`Column A ${i + 1}`} placeholder="Column A" className={inputClass} value={p.left} onChange={(e) => setDraft({ ...draft, pairs: draft.pairs.map((x, k) => (k === i ? { ...x, left: e.target.value } : x)) })} />
                    <input aria-label={`Column B ${i + 1}`} placeholder="Column B" className={inputClass} value={p.right} onChange={(e) => setDraft({ ...draft, pairs: draft.pairs.map((x, k) => (k === i ? { ...x, right: e.target.value } : x)) })} />
                    <button type="button" aria-label={`Remove pair ${i + 1}`} disabled={draft.pairs.length <= 3} onClick={() => setDraft({ ...draft, pairs: draft.pairs.filter((_, k) => k !== i) })} className="px-2 text-red-600 disabled:opacity-30">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {draft.pairs.length < 8 && (
                <button type="button" onClick={() => setDraft({ ...draft, pairs: [...draft.pairs, { left: "", right: "" }] })} className="mt-2 text-sm font-semibold text-[#1C7BD9]">
                  + Add pair
                </button>
              )}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <Field id="q-points" label={round === 2 ? "Points per pair" : "Points"}><input id="q-points" type="number" min={1} max={100} className={inputClass} value={draft.points} onChange={(e) => setDraft({ ...draft, points: e.target.value })} /></Field>
            <Field id="q-time" label="Time limit (s)"><input id="q-time" type="number" min={5} max={600} className={inputClass} value={draft.timeLimit} onChange={(e) => setDraft({ ...draft, timeLimit: e.target.value })} /></Field>
            <Field id="q-diff" label="Difficulty">
              <select id="q-diff" className={selectClass} value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as Draft["difficulty"] })}>
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </Field>
          </div>
          <Field id="q-expl" label="Explanation" optional hint="Shown to the player after they answer.">
            <input id="q-expl" className={inputClass} value={draft.explanation} onChange={(e) => setDraft({ ...draft, explanation: e.target.value })} />
          </Field>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Active (can be drawn into a battle)
          </label>
          {editing !== "new" && <p className="text-xs text-[#16181d]/55">Editing a question someone already answered changes the question text on record; their score is not recalculated.</p>}
          <div className="flex justify-end">
            <button type="submit" disabled={pending} className="h-11 rounded-xl bg-[#1C7BD9] px-6 font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : "Save question"}</button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        danger
        busy={pending}
        title="Delete this question?"
        confirmLabel="Delete"
        body="If any battle has already drawn it, it is retired instead of deleted, so finished battles keep their record."
        onConfirm={async () => {
          if (!deleting) return;
          const r = await run(
            () => adminFetch<{ outcome: string }>(`/api/battle-royale/admin/questions/${deleting.id}`, "DELETE"),
            (res) => (res.outcome === "deleted" ? "Question deleted." : "Question was in use, so it was retired instead."),
          );
          if (r) setDeleting(null);
        }}
      />
    </div>
  );
}
