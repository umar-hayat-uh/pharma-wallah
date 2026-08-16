import { createServiceSupabaseClient } from "@/lib/supabase-server";
import { redis, validateCodeLimiter, getClientIp, checkRateLimit } from "@/lib/tournament-redis";
import { NextResponse } from "next/server";

interface CachedCode {
    code: string;
    entry_type: string;
    games_included: string[];
    max_retries: number;
    team_name: string | null;
    team_members: string[] | null;
    is_used: boolean;
}

const CODE_CACHE_TTL = 300; // 5 min — codes are near-static once generated

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
        return NextResponse.json({ valid: false, message: "No code provided" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const rl = await checkRateLimit(validateCodeLimiter, ip);
    if (rl.blocked) {
        return NextResponse.json(
            { valid: false, message: "Too many requests. Please wait a moment." },
            { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
        );
    }

    const cacheKey = `tournament:code:${code}`;

    try {
        const cached = await redis.get<CachedCode>(cacheKey);
        if (cached) {
            if (cached.is_used) {
                return NextResponse.json({ valid: false, message: "Code already used" });
            }
            return NextResponse.json({ valid: true, ...cached });
        }
    } catch (err) {
        console.error("Code cache read failed, falling back to DB:", err);
    }

    const supabase = await createServiceSupabaseClient();
    const { data, error } = await supabase
        .from("entry_codes")
        .select("*")
        .eq("code", code)
        .single();

    if (error || !data) {
        return NextResponse.json({ valid: false, message: "Invalid code" });
    }

    const payload: CachedCode = {
        code: data.code,
        entry_type: data.entry_type,
        games_included: data.games_included,
        max_retries: data.max_retries,
        team_name: data.team_name,
        team_members: data.team_members,
        is_used: data.is_used,
    };

    // Only cache unused codes for the shorter, safer path; once used, don't
    // cache the "used" state for long in case of manual admin resets.
    try {
        await redis.set(cacheKey, payload, { ex: CODE_CACHE_TTL });
    } catch (err) {
        console.error("Code cache write failed (non-fatal):", err);
    }

    if (data.is_used) {
        return NextResponse.json({ valid: false, message: "Code already used" });
    }

    return NextResponse.json({ valid: true, ...payload });
}
