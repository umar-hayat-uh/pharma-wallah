import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { checkLimit } from "@/lib/rateLimit";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { buildSystemPrompt } from "@/lib/ai-guide/prompt";
import {
  clientIpFrom,
  encodeEvent,
  normaliseMessages,
  toGeminiHistory,
} from "@/lib/ai-guide/pure";

/**
 * The AI Guide's chat endpoint.
 *
 * Rewritten 2026-09-20 when the Books Library was removed and this became the
 * study surface that replaced it. Three things changed and none of them are
 * cosmetic:
 *
 *   1. It streams, so a long answer is readable while the rest is still being
 *      written. Measured on a 3.4k-character answer: first text at 6.7s, last
 *      at 10.2s, in 17 chunks. The win is real but bounded — gemini-2.5-flash
 *      is a thinking model and most of that 6.7s is deliberation before any
 *      token exists. The UI shows a thinking indicator for that stretch.
 *      A `thinkingConfig` budget would cut it, but the installed SDK (0.24.1)
 *      does not type one, and less deliberation is the wrong trade for the
 *      Calculate mode — so it stays on. Do not "optimise" this without
 *      measuring answer quality on a calculation.
 *   2. It is rate limited. This spends money at Gemini on every call and was
 *      open to the anonymous internet — the biggest cost exposure in the app.
 *   3. The request body is validated and clamped, not merely checked for being
 *      an array (see `normaliseMessages`).
 *
 * Node runtime, not Edge: it reads Supabase cookies to tell a signed-in student
 * from an anonymous one, and @supabase/supabase-js touches `process.version`,
 * which Edge does not support (CLAUDE.md §7 Known Issue 6).
 */
export const runtime = "nodejs";
/** Long answers legitimately take a while; the default 10s would cut them off. */
export const maxDuration = 60;

/**
 * Anonymous callers, keyed by IP. Deliberately tight: every message is a paid
 * model call, and a signed-out visitor trying the guide needs a handful of
 * questions, not a hundred.
 */
const anonChatLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(8, "5 m"),
      analytics: true,
      prefix: "ratelimit:chat:anon",
    })
  : null;

/**
 * Signed-in students, keyed by user id. Roomier, because the account is the
 * accountability — and a real study session is a long back-and-forth.
 */
const userChatLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "5 m"),
      analytics: true,
      prefix: "ratelimit:chat:user",
    })
  : null;

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set");
    return errorResponse("Server configuration error. API key missing.", 500);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const { messages, mode } = (body ?? {}) as { messages?: unknown; mode?: unknown };

  // Validate before spending anything — a bad request must never reach Gemini.
  const normalised = normaliseMessages(messages);
  if (!normalised.ok) return errorResponse(normalised.error, 400);

  // Identify the caller only to choose a rate-limit bucket. The guide stays
  // usable signed-out (it is linked from the home page for visitors), so a
  // failure to resolve a user is not an error — it just means the tighter
  // anonymous limit applies.
  let userId: string | null = null;
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    userId = data.user?.id ?? null;
  } catch (err) {
    console.error("[chat] auth lookup failed, treating as anonymous", err);
  }

  const { success } = userId
    ? await checkLimit(userChatLimiter, userId)
    : await checkLimit(anonChatLimiter, clientIpFrom(req.headers));

  if (!success) {
    return errorResponse(
      userId
        ? "You've sent a lot of questions in a short time. Give it a minute and try again."
        : "Too many questions from this connection. Wait a minute, or sign in for a higher limit.",
      429,
    );
  }

  const conversation = normalised.messages;
  const history = toGeminiHistory(conversation);
  const latest = conversation[conversation.length - 1].content;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: buildSystemPrompt(mode),
    });

    const chat = model.startChat({
      history,
      generationConfig: {
        // Raised from 1024: exam mode writes a question set plus an answer key,
        // and the old ceiling truncated those mid-sentence.
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessageStream(latest);
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            // A chunk stopped by a safety filter has no text and throws on
            // .text() in some SDK versions — guard rather than kill the stream.
            let text = "";
            try {
              text = chunk.text();
            } catch {
              continue;
            }
            if (text) controller.enqueue(encoder.encode(encodeEvent({ type: "text", value: text })));
          }
          controller.enqueue(encoder.encode(encodeEvent({ type: "done" })));
        } catch (err) {
          // We are past the 200 header here, so this is the only way to tell
          // the client the answer stopped early rather than finished.
          console.error("[chat] stream failed", err);
          controller.enqueue(
            encoder.encode(
              encodeEvent({
                type: "error",
                value: "The answer stopped early. Try asking again.",
              }),
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        // Stops nginx-style proxies buffering the whole body, which would undo
        // the point of streaming.
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: unknown) {
    // Failures before the first byte — bad key, quota, model unavailable.
    console.error("Gemini API error:", error);

    // Gemini's own quota, which is a different thing from our rate limit and
    // needs a different sentence. The key is on the free tier, whose ceiling is
    // 5 requests per minute *for the whole project* — so this is reachable by
    // ordinary traffic, not just by abuse, and it clears in about a minute.
    // Telling a student "something went wrong" here would send them away from
    // an answer they could have had by waiting. See CLAUDE.md §7 Known Issues.
    const status = (error as { status?: number } | null)?.status;
    if (status === 429) {
      return errorResponse(
        "The guide is busy right now — it can only answer a few questions a minute. Try again in about a minute.",
        503,
      );
    }

    return errorResponse("Failed to get a response from the AI. Please try again.", 500);
  }
}
