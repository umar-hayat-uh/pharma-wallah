// src/app/api/progress/batch/route.ts
import { createServerSupabaseClient, createServiceSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { progressWriteLimiter, checkLimit } from "@/lib/rateLimit";
import {
  applyProgressEvent,
  invalidateProgressCache,
  ProgressEventValidationError,
  type ProgressEventPayload,
} from "@/lib/progress-server";

const MAX_EVENTS_PER_BATCH = 25;

export async function POST(req: Request) {
  const userSupabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await userSupabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = await checkLimit(progressWriteLimiter, user.id);
  if (!success) {
    return NextResponse.json({ error: "Too many requests, slow down" }, { status: 429 });
  }

  let body: { events?: ProgressEventPayload[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.events)) {
    return NextResponse.json({ error: "events must be an array" }, { status: 400 });
  }

  const events = body.events.slice(0, MAX_EVENTS_PER_BATCH);
  if (events.length === 0) {
    return NextResponse.json({ error: "No events" }, { status: 400 });
  }

  const supabase = await createServiceSupabaseClient();

  // In order, not in parallel: every event first reads-or-creates the user's
  // `progress` row, so two parallel events for a brand-new account (a unit
  // visit and its activity row arrive together) could each insert one.
  const results: PromiseSettledResult<void>[] = [];
  for (let i = 0; i < events.length; i++) {
    try {
      await applyProgressEvent(supabase, user, events[i]);
      results.push({ status: "fulfilled", value: undefined });
    } catch (reason) {
      results.push({ status: "rejected", reason });
    }
  }

  const errors: { index: number; message: string }[] = [];
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      const reason = r.reason;
      const message = reason instanceof ProgressEventValidationError ? reason.message : "write failed";
      errors.push({ index: i, message });
      console.error(`[progress batch] event ${i} failed`, reason);
    }
  });

  await invalidateProgressCache(user.id);

  return NextResponse.json({
    success: errors.length < events.length,
    applied: events.length - errors.length,
    failed: errors.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}