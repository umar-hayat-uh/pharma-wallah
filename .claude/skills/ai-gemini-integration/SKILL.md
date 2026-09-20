# AI / Gemini Integration

## Purpose
Work on the four Google Gemini-backed features — chat tutor, prescription reader, histology
grading, colony counting — safely and without leaking keys or money.

## Trigger Examples
- "improve the AI tutor's answers"
- "the prescription reader returns malformed JSON"
- "add an AI feature that does X"
- "change the model"

## Read First
- `src/app/api/chat/route.ts` — the reference AI route: rate limiting, validation, streaming.
- `src/lib/ai-guide/prompt.ts` — the chat tutor's system prompt (moved out of the route 2026-09-20).
- `src/app/api/prescription-reader-v2/route.ts` — the streaming + structured-output pattern.
- `CLAUDE.md` §7 Known Issues — the `NEXT_PUBLIC_GEMINI_API_KEY` fallback and the missing rate limits.

## Architecture Context

**Three different Gemini integration styles coexist.** Match the one nearest your feature:

| Feature | Route | How it calls Gemini | Notes |
| --- | --- | --- | --- |
| Chat tutor | `/api/chat` | `@google/generative-ai` (`GoogleGenerativeAI`), **streaming** | **The only rate-limited, input-clamped AI route.** History shaping and clamps live in `src/lib/ai-guide/pure.ts`, not in the handler; answers stream as NDJSON |
| Prescription reader | `/api/prescription-reader-v2` | Vercel AI SDK (`ai` + `@ai-sdk/google`), `streamText` | `runtime = 'edge'`, `maxDuration = 60`, model `gemini-2.5-flash` |
| Histology grading | `/api/evaluate-histology` | raw `fetch` to the REST API | Returns a structured score/feedback object; has a graceful no-key branch |
| Colony counting | `/api/scan-colonies` | raw `fetch` to the REST API | `GEMINI_MODEL` env override, defaults `gemini-2.5-flash` |

### Env vars
- `GEMINI_API_KEY` — chat, histology, colonies.
- `GOOGLE_GENERATIVE_AI_API_KEY` — the Vercel AI SDK's own convention (prescription reader).
- `GEMINI_MODEL` — optional override, colony route only.
- `NEXT_PUBLIC_GEMINI_API_KEY` — **read as a fallback at `evaluate-histology/route.ts:17`. Not set
  today. It must never be set** — `NEXT_PUBLIC_*` ships to the browser. Delete the fallback.

### Current exposure — know this before adding another
**`/api/chat` was fixed on 2026-09-20** and is now the reference implementation: anonymous callers
are limited by IP (8 / 5 min), signed-in ones by user id (30 / 5 min), and the request body is
validated and clamped before a single token is spent. Copy `src/app/api/chat/route.ts`.

**The other three — `/api/prescription-reader-v2`, `/api/evaluate-histology`, `/api/scan-colonies`
— are still unauthenticated and unthrottled.** They are public endpoints that spend money per call.
Tracked in `ROADMAP.md` Phase 5 and `CLAUDE.md` §7. If you add a fifth AI route, rate limit it.

### The key is on the Gemini FREE TIER — 5 requests per minute, per model, per project
Measured 2026-09-20 by driving `/api/chat` until it broke: the sixth call inside a minute comes
back `429 … quotaValue: "5"` with a ~50 s `retryDelay`. **This ceiling is shared by the whole
site**, so it is reachable by ordinary traffic, not just abuse — our own rate limits sit above it
and are not what a student hits first. `/api/chat` maps that upstream 429 to a **503** with a
"try again in about a minute" message; any new AI route should do the same rather than reporting a
generic failure. Raising the ceiling is a billing change, and therefore an owner decision.

### Prompt conventions
System prompts are inline `const SYSTEM_PROMPT = \`…\`` at the top of the route. The established
style, from `/api/chat`:
- State the persona and audience (a pharmacy tutor for students and professionals).
- Enumerate in-scope topics.
- **Safety steering**: redirect off-topic questions; for patient-specific medical questions, tell
  the user to consult a qualified healthcare provider.
- Specify the output format (concise, markdown, bullets for classifications).

For structured output (prescription reader, colony scan, histology grading), the prompt demands
**raw JSON only** — "no markdown formatting, no code fences, no preamble" — and gives an explicit
example of the exact shape. The histology prompt additionally supplies a synonym table so students
are not penalised for informal phrasing.

## Procedure

### Adding an AI feature
1. Choose the integration style from the table above — streaming UI → Vercel AI SDK; one-shot JSON
   → raw `fetch` or `@google/generative-ai`.
2. **Check the key at the top and fail cleanly:**
   ```ts
   if (!process.env.GEMINI_API_KEY) {
     console.error("GEMINI_API_KEY is not set");
     return NextResponse.json({ error: "Server configuration error. API key missing." }, { status: 500 });
   }
   ```
   `/api/evaluate-histology` goes further and returns a useful non-AI response when no key is
   present — a good pattern where the feature can degrade.
3. **Validate the input before spending a call.** Empty prompt, missing image, oversized payload →
   400 before touching Gemini.
4. **Rate limit it.** Use `checkRateLimit` from `src/lib/tournament-redis.ts` with a new IP-keyed
   limiter, or `checkLimit` if a session exists.
5. **Write the prompt** following the conventions above. For JSON output, demand raw JSON and give
   the exact shape.
6. **Parse defensively.** Models return code fences despite instructions — strip them before
   `JSON.parse`, and wrap the parse in try/catch with a sensible fallback.
7. **Never send secrets or other users' data into a prompt.**

### Changing the model
Model ids are inline (`gemini-2.5-flash`) except the colony route's `GEMINI_MODEL` override. Update
each route deliberately; there is no central config.

## Files Usually Involved
- `src/app/api/{chat,prescription-reader-v2,evaluate-histology,scan-colonies}/route.ts`
- `src/app/(site)/{ai-guide,mentor,prescription-reader}/page.tsx`
- `src/lib/ai-guide/{pure,modes,prompt,resources,types}.ts` — the chat tutor's pure layer: request
  clamps, Gemini history rules, the NDJSON wire format, the system prompt and the study modes.
  Covered by `node --test scripts/ai-guide.test.mts` (34 tests) — change it there, with a test.
- `src/app/(site)/spotting/**/test/page.tsx` (calls the histology evaluator)
- `src/components/ExtemporaneousCompoundingLab.tsx`, the antibiogram simulator (colony scan)

## Security Checks
- [ ] The API key is read from a **server-only** env var. Never `NEXT_PUBLIC_*`.
- [ ] The key never appears in a response, a log line, or an error message.
- [ ] The route is rate limited — it costs money per call.
- [ ] Input size is bounded (images especially — base64 payloads get large fast).
- [ ] No user PII or secret is interpolated into a prompt.
- [ ] Model output is never rendered as raw HTML without sanitising. Existing UIs use
      `react-markdown`, which is safe by default.
- [ ] Medical output carries a disclaimer and the "consult a qualified provider" steer.

## Validation
- Missing/empty input → 400 before any Gemini call.
- `messages` array validated as a non-empty array (`/api/chat` does this).
- History reshaped correctly: Gemini requires the first entry to be `user` and roles to alternate —
  `/api/chat` handles this explicitly; copy that logic, don't re-derive it.
- JSON responses parsed defensively with a fallback.

## Tests & Verification
```bash
# The pure layer — free, deterministic, run this first and on every change.
node --test scripts/ai-guide.test.mts        # 34 tests: clamps, history rules, NDJSON, modes

# The validation path — rejects before spending anything, so these cost nothing.
curl -s -X POST localhost:3000/api/chat -H 'content-type: application/json' -d '{"messages":[]}'

# A real answer. Streams NDJSON, so read it line by line, and note this COSTS MONEY.
curl -N -s -X POST localhost:3000/api/chat -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"What is the MOA of metformin?"}],"mode":"tutor"}'
```
Requires a real `GEMINI_API_KEY`. Also test the no-key path by temporarily unsetting the variable
(it must fail cleanly, not crash), and verify the safety steering with something off-topic and
something patient-specific.

**Budget your live calls: the free tier allows 5 a minute for the whole project** (see above), so a
loop of test calls will start returning 503 and you will mistake it for a bug you introduced. The
deterministic half is covered by the test file; only the model's own behaviour needs a live call,
and model output is non-deterministic — exercise it, describe what you saw, and do not claim
deterministic correctness.

## Common Failure Modes
- **Adding an unauthenticated, unthrottled AI route.** Already the app's biggest open exposure.
- **Setting `NEXT_PUBLIC_GEMINI_API_KEY`** to "fix" the histology route — that publishes the key.
- **`JSON.parse` failing on code fences** despite the prompt saying not to use them. Strip first.
- **Breaking Gemini's history rules** — leading `model` message or non-alternating roles → API error.
- **Adding `runtime = 'edge'` to a route that imports Supabase** — `process.version` is unsupported
  on Edge.
- **Burning quota in a test loop.**
- **Trusting model output for clinical decisions** without a disclaimer.

## Do Not
- Do not put a Gemini key in any `NEXT_PUBLIC_*` variable.
- Do not log prompts or responses containing user-submitted images or personal data.
- Do not remove the safety steering from the chat system prompt.
- Do not remove its copyright rule either (`src/lib/ai-guide/prompt.ts`): the guide replaced the
  Books Library precisely because we cannot distribute textbook content, so it must not reproduce
  passages or claim to source a book.
- Do not accept prompt text from the client. A mode arrives as an **id**, which the server maps to
  a directive; `modeDirective()` falls back to the default for anything unrecognised.
- Do not add a fifth unthrottled AI endpoint.

## Update Project Knowledge
New AI route → add it to `.claude/PROJECT_MAP.md` §AI, record the env var **name** in
`.claude/MEMORY.md` §6, and if it is unauthenticated say so in `CLAUDE.md` §7 Known Issues.
