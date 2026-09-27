import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/battle-royale/admin";
import { firstIssue, questionSchema } from "@/lib/battle-royale/schemas";
import { toQuestionRow } from "@/lib/battle-royale/questions";
import { db, engineErrorResponse, errorResponse, readJson } from "@/lib/battle-royale/server";

export async function POST(req: Request) {
  const guard = await adminGuard("admin");
  if (guard.response) return guard.response;

  const parsed = questionSchema.safeParse(await readJson(req));
  if (!parsed.success) return errorResponse(firstIssue(parsed.error), 400);

  const svc = await db();
  const { data, error } = await svc.from("br_questions").insert(toQuestionRow(parsed.data)).select("id").single();
  if (error) return engineErrorResponse(error, "create question");
  return NextResponse.json({ id: data.id }, { status: 201 });
}
