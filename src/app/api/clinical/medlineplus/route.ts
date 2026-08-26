// Path in your project: src/app/api/clinical/medlineplus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchMedlinePlus } from "@/lib/api/medlineplus";
import { buildCacheKey } from "@/lib/api/cacheKey";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const language = searchParams.get("lang") === "es" ? "es" : "en";
  const retmax = Number(searchParams.get("retmax") ?? 10);

  const identifier =
    req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "anonymous";
  const limited = await ratelimit.limit(`medlineplus:${identifier}`);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 }
    );
  }

  if (!query) {
    return NextResponse.json({ error: "Missing required 'q' query param" }, { status: 400 });
  }

  const cacheKey = buildCacheKey("medlineplus", { query, language, retmax });

  try {
    const { data: cached } = await supabaseAdmin
      .from("medlineplus_cache")
      .select("response, expires_at")
      .eq("cache_key", cacheKey)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      return NextResponse.json({ ...cached.response, cached: true });
    }

    const result = await searchMedlinePlus(query, { language, retmax });

    await supabaseAdmin.from("medlineplus_cache").upsert(
      {
        cache_key: cacheKey,
        query,
        language,
        response: result,
        result_count: result.totalCount,
      },
      { onConflict: "cache_key" }
    );

    return NextResponse.json({ ...result, cached: false });
  } catch (err) {
    console.error("MedlinePlus route error:", err);
    return NextResponse.json({ error: "Failed to search MedlinePlus" }, { status: 502 });
  }
}