// Path in your project: src/app/api/clinical/pubmed/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchPubMed, getPubMedAbstract } from "@/lib/api/pubmed";
import { buildCacheKey } from "@/lib/api/cacheKey";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const pubmedRatelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
});

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const pmid = searchParams.get("pmid"); // optional: fetch a single abstract
    const retmax = Number(searchParams.get("retmax") ?? 10);
    const retstart = Number(searchParams.get("retstart") ?? 0);

    const identifier =
        req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "anonymous";
    const limited = await pubmedRatelimit.limit(`pubmed:${identifier}`);
    if (!limited.success) {
        return NextResponse.json(
            { error: "Too many requests. Please slow down." },
            { status: 429 }
        );
    }

    // Single-abstract fetch path — not cached, cheap, on-demand from the UI
    if (pmid) {
        try {
            const abstract = await getPubMedAbstract(pmid);
            return NextResponse.json({ pmid, abstract });
        } catch (err) {
            console.error("PubMed abstract fetch error:", err);
            return NextResponse.json({ error: "Failed to fetch abstract" }, { status: 502 });
        }
    }

    if (!query) {
        return NextResponse.json({ error: "Missing required 'q' query param" }, { status: 400 });
    }

    const cacheKey = buildCacheKey("pubmed", { query, retmax, retstart });

    try {
        const { data: cached } = await supabaseAdmin
            .from("pubmed_cache")
            .select("response, expires_at")
            .eq("cache_key", cacheKey)
            .gt("expires_at", new Date().toISOString())
            .maybeSingle();

        if (cached) {
            return NextResponse.json({ ...cached.response, cached: true });
        }

        const result = await searchPubMed(query, { retmax, retstart });

        await supabaseAdmin.from("pubmed_cache").upsert(
            {
                cache_key: cacheKey,
                query,
                response: result,
                result_count: result.totalCount,
            },
            { onConflict: "cache_key" }
        );

        return NextResponse.json({ ...result, cached: false });
    } catch (err) {
        console.error("PubMed route error:", err);
        return NextResponse.json({ error: "Failed to search PubMed" }, { status: 502 });
    }
}