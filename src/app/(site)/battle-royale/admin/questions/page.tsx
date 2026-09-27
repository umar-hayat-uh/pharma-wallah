import { AdminHeader } from "@/components/battle-royale/admin/AdminShell";
import { AdminGate } from "@/components/battle-royale/admin/AdminGate";
import { QuestionManager, type QuestionRowView } from "@/components/battle-royale/admin/QuestionManager";
import { Notice } from "@/components/battle-royale/ui";
import { adminForPage } from "@/lib/battle-royale/admin-page";
import { db, readSettings } from "@/lib/battle-royale/server";

const MAX_QUESTIONS = 1000;

export default async function QuestionsPage({ searchParams }: { searchParams: { round?: string } }) {
  const admin = await adminForPage("admin");
  if (!admin) return null;
  if (admin === "role") return <AdminGate status="role" />;

  const round = ["1", "2", "3"].includes(searchParams.round ?? "") ? Number(searchParams.round) : 1;
  const svc = await db();
  const [{ data, error }, counts, settings] = await Promise.all([
    svc
      .from("br_questions")
      .select("id, round, type, question, options, correct_answer, explanation, points, time_limit, difficulty, active")
      .eq("round", round)
      .order("created_at", { ascending: true })
      .limit(MAX_QUESTIONS),
    Promise.all([1, 2, 3].map((r) => svc.from("br_questions").select("id", { count: "exact", head: true }).eq("round", r).eq("active", true))),
    readSettings(),
  ]);

  const active = counts.map((c) => c.count ?? 0) as [number, number, number];
  const needed = settings?.roundCounts ?? [0, 0, 0];

  return (
    <>
      <AdminHeader
        title="Questions"
        lead="The pool each battle draws from. Each attempt draws a random set of active questions per round. Answer keys never leave the server until a question has been answered."
      />
      {active.some((n, i) => n < needed[i]) && (
        <Notice tone="amber" className="mb-4" title="Some rounds have fewer active questions than each battle draws.">
          {active.map((n, i) => (n < needed[i] ? `Round ${i + 1}: ${n} active, ${needed[i]} drawn per battle. ` : "")).join("")}
          Battles still run — they just draw every active question.
        </Notice>
      )}
      {error ? (
        <Notice tone="red" title="Couldn't load questions." />
      ) : (
        <QuestionManager round={round as 1 | 2 | 3} active={active} rows={(data ?? []) as QuestionRowView[]} />
      )}
    </>
  );
}
