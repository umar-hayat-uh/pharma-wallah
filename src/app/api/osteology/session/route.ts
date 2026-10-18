// POST /api/osteology/session — start a practice session or a mock exam.
//
// Returns the questions WITHOUT answers, and a signed token that lets the server
// rebuild the same paper to check (practice) or grade (exam) it. Anonymous by design:
// the lab's practice is open to everyone; only exam history needs an account.
import { NextResponse } from "next/server";
import { EXAM_PRESETS, PRACTICE_LENGTH, TYPE_LABEL, getPreset, type QType } from "@/lib/osteology/exam-config";
import { buildPaper, poolFor, poolHash, toPublic } from "@/lib/osteology/questions";
import { errorResponse, limited, readJson } from "@/lib/osteology/server";
import { signSession } from "@/lib/osteology/token";
import type { Region } from "@/lib/osteology/types";

const REGIONS: Region[] = ["upper-limb", "lower-limb", "axial"];
const TYPES = Object.keys(TYPE_LABEL) as QType[];
const MIN_PRACTICE = 5;
const MAX_PRACTICE = 30;

export async function POST(req: Request) {
  const blocked = await limited(req);
  if (blocked) return blocked;

  const body = await readJson(req);
  if (!body) return errorResponse("Invalid JSON", 400);

  let claims: Parameters<typeof signSession>[0];

  if (body.mode === "exam") {
    const preset = typeof body.preset === "string" ? getPreset(body.preset) : undefined;
    if (!preset) return errorResponse(`preset must be one of: ${EXAM_PRESETS.map((p) => p.id).join(", ")}`, 400);
    const filter = { regions: preset.regions, types: preset.types, scope: preset.scope };
    claims = {
      mode: "exam",
      preset: preset.id,
      ...filter,
      count: preset.stations,
      pool: poolHash(poolFor(filter)),
      limit: preset.minutes * 60,
      marks: preset.marksPerStation,
    };
  } else if (body.mode === "practice") {
    const regions = Array.isArray(body.regions) ? REGIONS.filter((r) => (body.regions as unknown[]).includes(r)) : REGIONS;
    const types = Array.isArray(body.types) ? TYPES.filter((t) => (body.types as unknown[]).includes(t)) : TYPES;
    if (regions.length === 0) return errorResponse("Choose at least one region", 400);
    if (types.length === 0) return errorResponse("Choose at least one question type", 400);
    const requested = Number(body.count ?? PRACTICE_LENGTH);
    const count = Number.isFinite(requested)
      ? Math.min(MAX_PRACTICE, Math.max(MIN_PRACTICE, Math.round(requested)))
      : PRACTICE_LENGTH;
    const filter = { regions, types, scope: "both" as const };
    claims = { mode: "practice", preset: "practice", ...filter, count, pool: poolHash(poolFor(filter)), limit: 0, marks: 1 };
  } else {
    return errorResponse('mode must be "practice" or "exam"', 400);
  }

  const { token, claims: signed } = signSession(claims);
  const paper = buildPaper({ regions: signed.regions, types: signed.types, scope: signed.scope }, signed.count, signed.seed);
  if (paper.length === 0) return errorResponse("No questions are available for that selection yet.", 422);

  return NextResponse.json(
    {
      token,
      mode: signed.mode,
      preset: signed.preset,
      issuedAt: signed.iat,
      serverNow: Math.floor(Date.now() / 1000),
      limitSec: signed.limit,
      marksPer: signed.marks,
      questions: paper.map(toPublic),
    },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
