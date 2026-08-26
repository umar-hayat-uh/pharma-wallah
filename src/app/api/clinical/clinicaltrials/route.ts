// Path in your project: src/app/api/clinical/clinicaltrials/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchClinicalTrials, TrialStatus } from "@/lib/api/clinicaltrials";
import { buildCacheKey } from "@/lib/api/cacheKey";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";


const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
});

const VALID_STATUSES: TrialStatus[] = [
    "RECRUITING",
    "COMPLETED",
    "NOT_YET_RECRUITING",
    "ACTIVE_NOT_RECRUITING",
    "TERMINATED",
];

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const statusParam = searchParams.get("status")?.toUpperCase();
    const status = VALID_STATUSES.includes(statusParam as TrialStatus)
        ? (statusParam as TrialStatus)
        : undefined;
    const pageSize = Number(searchParams.get("pageSize") ?? 10);
    const pageToken = searchParams.get("pageToken") ?? undefined;

    const identifier =
        req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "anonymous";
    const limited = await ratelimit.limit(`clinicaltrials:${identifier}`);
    if (!limited.success) {
        return NextResponse.json(
            { error: "Too many requests. Please slow down." },
            { status: 429 }
        );
    }

    if (!query) {
        return NextResponse.json({ error: "Missing required 'q' query param" }, { status: 400 });
    }

    // Paginated requests (pageToken present) bypass cache — they're a
    // continuation of a session, not worth caching individually.
    const cacheKey = buildCacheKey("ctgov", { query, status, pageSize });

    try {
        if (!pageToken) {
            const { data: cached } = await supabaseAdmin
                .from("clinicaltrials_cache")
                .select("response, expires_at")
                .eq("cache_key", cacheKey)
                .gt("expires_at", new Date().toISOString())
                .maybeSingle();

            if (cached) {
                return NextResponse.json({ ...cached.response, cached: true });
            }
        }

        const result = await searchClinicalTrials(query, { status, pageSize, pageToken });

        if (!pageToken) {
            await supabaseAdmin.from("clinicaltrials_cache").upsert(
                {
                    cache_key: cacheKey,
                    query,
                    status_filter: status ?? null,
                    response: result,
                    result_count: result.totalCount,
                },
                { onConflict: "cache_key" }
            );
        }

        return NextResponse.json({ ...result, cached: false });
    } catch (err) {
        console.error("ClinicalTrials route error:", err);
        return NextResponse.json(
            { error: "Failed to search ClinicalTrials.gov" },
            { status: 502 }
        );
    }
}