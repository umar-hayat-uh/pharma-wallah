/**
 * Which external services this deployment has keys for (2026-11-04).
 *
 * The site must build and run with NO keys at all: pages render, calculators
 * work, and a feature whose service is not configured answers with
 * UNAVAILABLE_MESSAGE instead of crashing. Keys are read when asked for, never
 * at module load, so `next build` needs none of them (it loads every route
 * module while collecting page data).
 *
 * Safe to import from client components: the NEXT_PUBLIC_* reads are written
 * out literally so Next inlines them into the browser bundle; the secret ones
 * are never inlined and read as undefined there, which is correct — the
 * browser never talks to those services directly.
 */
export const UNAVAILABLE_MESSAGE = "This feature is unavailable at the moment. Please try again later.";

export type Service =
  /** Supabase URL + anon key: sign-in, community, Q&A, AMR, progress reads. */
  | "supabase"
  /** Supabase service-role key (bypasses RLS): progress, tournament, Battle Royale, admin, osteology tokens. */
  | "supabaseAdmin"
  /** MONGODB_URI (mongoose, database `pharmawallah`): interaction data, drug caches, comments. */
  | "mongo"
  /** MONGODB_USER + MONGODB_USER_PASSWORD (native driver, database `pharmacopedia`): the drug encyclopedia. */
  | "drugDb"
  /** Upstash REST URL + token: tournament sessions; elsewhere only caching and rate limits. */
  | "redis"
  /** GEMINI_API_KEY: AI Guide, histology marking, colony scan. */
  | "gemini"
  /** GOOGLE_GENERATIVE_AI_API_KEY (Vercel AI SDK): prescription reader. */
  | "googleAI"
  /** RESEND_API_KEY: contact and careers forms. */
  | "resend";

export function isConfigured(service: Service): boolean {
  switch (service) {
    case "supabase":
      return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    case "supabaseAdmin":
      return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    case "mongo":
      return Boolean(process.env.MONGODB_URI);
    case "drugDb":
      return Boolean(process.env.MONGODB_USER && process.env.MONGODB_USER_PASSWORD);
    case "redis":
      return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
    case "gemini":
      return Boolean(process.env.GEMINI_API_KEY);
    case "googleAI":
      return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    case "resend":
      return Boolean(process.env.RESEND_API_KEY);
  }
}

/** Thrown by a client getter when its service has no key. Route handlers turn it into a 503. */
export class ServiceUnavailableError extends Error {
  readonly status = 503;
  constructor(readonly service: Service) {
    super(UNAVAILABLE_MESSAGE);
    this.name = "ServiceUnavailableError";
  }
}
