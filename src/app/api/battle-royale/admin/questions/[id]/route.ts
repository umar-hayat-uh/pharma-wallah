import { NextResponse } from "next/server";
import { z } from "zod";
import { adminGuard } from "@/lib/battle-royale/admin";
import { firstIssue, questionSchema } from "@/lib/battle-royale/schemas";
import { toQuestionRow } from "@/lib/battle-royale/questions";
import { db, engineErrorResponse, errorResponse, readJson } from "@/lib/battle-royale/server";

type Ctx = { params: { id: string } };
const idSchema = z.string().uuid();

/*
 * Editing a question that someone has already answered changes what the
 * record says they were asked. Allowed — typos happen on the day — but the
 * answers table keeps its own `is_correct` and `score`, so no finished score
 * moves. A question's round/type cannot change: the table's check constraint
 * refuses it.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await adminGuard("admin");
  if (guard.response) return guard.response;
  if (!idSchema.safeParse(params.id).success) return errorResponse("Question not found.", 404);

  const body = await readJson(req);
  // A bare {active} toggles availability without resending the whole question.
  const toggle = z.object({ active: z.boolean() }).strict().safeParse(body);
  const svc = await db();

  if (toggle.success) {
    const { data, error } = await svc
      .from("br_questions")
      .update({ active: toggle.data.active, updated_at: new Date().toISOString() })
      .eq("id", params.id)
      .select("id")
      .maybeSingle();
    if (error) return engineErrorResponse(error, "toggle question");
    if (!data) return errorResponse("Question not found.", 404);
    return NextResponse.json({ ok: true });
  }

  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);
  const { data, error } = await svc
    .from("br_questions")
    .update({ ...toQuestionRow(parsed.data), updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select("id")
    .maybeSingle();
  if (error) return engineErrorResponse(error, "update question");
  if (!data) return errorResponse("Question not found.", 404);
  return NextResponse.json({ ok: true });
}

/** Deletes a question nobody has drawn; retires (deactivates) one that has been. */
export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await adminGuard("admin");
  if (guard.response) return guard.response;
  if (!idSchema.safeParse(params.id).success) return errorResponse("Question not found.", 404);

  const svc = await db();
  const { data, error } = await svc.rpc("br_delete_question", { p_id: params.id });
  if (error) return engineErrorResponse(error, "delete question");
  return NextResponse.json({ outcome: data });
}
