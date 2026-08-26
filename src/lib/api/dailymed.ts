import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

const DAILYMED_BASE_URL =
    "https://dailymed.nlm.nih.gov/dailymed/services/v2";

const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours
const SUGGEST_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_QUERY_LENGTH = 100;
const MAX_SUGGESTIONS = 12;

export interface DrugNameSuggestion {
    name: string;
    nameType: string; // "G" (generic) | "B" (brand), as returned by DailyMed
}

export interface DailyMedResult {
    setid?: string;
    title?: string;
    spl_version?: string;
    published_date?: string;
    effective_time?: string;
    labeler?: string;
    spl_size?: number;
}

export interface DailyMedResponse {
    data: DailyMedResult[];
    metadata?: {
        total_elements?: number;
        total_pages?: number;
        current_page?: number;
        page_size?: number;
    };
}

interface CacheRecord<T> {
    response: T;
    expires_at: string;
    created_at: string;
}

function normalizeQuery(query: string): string {
    return query.trim().replace(/\s+/g, " ").toLowerCase();
}

function createCacheKey(namespace: string, query: string): string {
    return createHash("sha256")
        .update(`dailymed:${namespace}:${normalizeQuery(query)}`)
        .digest("hex");
}

function validateQuery(query: string): string {
    if (!query || typeof query !== "string") {
        throw new Error("Search query is required.");
    }
    const normalized = normalizeQuery(query);
    if (normalized.length < 2) {
        throw new Error("Search query must contain at least 2 characters.");
    }
    if (normalized.length > MAX_QUERY_LENGTH) {
        throw new Error(`Search query must be ${MAX_QUERY_LENGTH} characters or fewer.`);
    }
    return normalized;
}

async function fetchWithTimeout(url: string, options?: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                Accept: "application/json",
                "User-Agent": "PharmaWallah-Clinical/1.0",
                ...(options?.headers || {}),
            },
            cache: "no-store",
        });
    } finally {
        clearTimeout(timeout);
    }
}

async function getCached<T>(cacheKey: string, table: string): Promise<CacheRecord<T> | null> {
    const { data, error } = await supabaseAdmin
        .from(table)
        .select("response, expires_at, created_at")
        .eq("cache_key", cacheKey)
        .maybeSingle();

    if (error) {
        console.error(`DailyMed ${table} cache read error:`, error);
        return null;
    }
    if (!data) return null;

    const record = data as CacheRecord<T>;
    const expired = new Date(record.expires_at).getTime() <= Date.now();
    return expired ? null : record;
}

async function saveCache<T>(
    cacheKey: string,
    query: string,
    response: T,
    table: string,
    ttlSeconds: number
): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    const { error } = await supabaseAdmin.from(table).upsert(
        {
            cache_key: cacheKey,
            query,
            response,
            created_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
        },
        { onConflict: "cache_key" }
    );

    if (error) console.error(`DailyMed ${table} cache write error:`, error);
}

/**
 * Autocomplete suggestions, backed by /drugnames.json?drug_name=<prefix>.
 * This is DailyMed's actual name-search resource — drug_name here is a
 * real filter (unlike on /spls.json, where it requires an exact SPL
 * title match). We fetch one page, trim to MAX_SUGGESTIONS, and cache
 * per-prefix for a week since the drug name universe barely changes.
 *
 * DEBUG: logs the raw upstream status + row count on every live fetch,
 * so we can see in server logs exactly what DailyMed returns instead of
 * guessing. Remove the console.log lines once confirmed working.
 */
export async function suggestDrugNames(rawQuery: string): Promise<DrugNameSuggestion[]> {
    const query = validateQuery(rawQuery);
    const cacheKey = createCacheKey("suggest", query);

    const cached = await getCached<DrugNameSuggestion[]>(cacheKey, "dailymed_suggest_cache");
    if (cached) {
        console.log(`[dailymed] suggest "${query}" -> cache hit, ${cached.response.length} items`);
        return cached.response;
    }

    const url = new URL(`${DAILYMED_BASE_URL}/drugnames.json`);
    url.searchParams.set("drug_name", query);
    url.searchParams.set("pagesize", "100");
    url.searchParams.set("page", "1");

    console.log(`[dailymed] suggest fetch: ${url.toString()}`);

    const res = await fetchWithTimeout(url.toString());
    console.log(`[dailymed] suggest upstream status: ${res.status}`);

    if (!res.ok) {
        throw new Error(`DailyMed drugnames API returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const rows: Array<{ drug_name?: string; name_type?: string }> = Array.isArray(json?.data)
        ? json.data
        : [];

    console.log(
        `[dailymed] suggest "${query}" -> upstream returned ${rows.length} raw rows` +
        (rows[0] ? `, first: ${JSON.stringify(rows[0])}` : "")
    );

    const seen = new Set<string>();
    const suggestions: DrugNameSuggestion[] = [];

    for (const row of rows) {
        const name = row.drug_name?.trim();
        if (!name) continue;
        const lower = name.toLowerCase();
        if (seen.has(lower)) continue;
        seen.add(lower);
        suggestions.push({ name, nameType: row.name_type || "G" });
        if (suggestions.length >= MAX_SUGGESTIONS) break;
    }

    await saveCache(cacheKey, query, suggestions, "dailymed_suggest_cache", SUGGEST_CACHE_TTL_SECONDS);
    return suggestions;
}

/**
 * Fetches SPLs for an exact drug name — meant to be called with a name
 * the user picked from the autocomplete dropdown (suggestDrugNames），so
 * it's guaranteed to be a real, exact value from DailyMed's own index.
 */
export async function getDailyMedByExactName(
    exactName: string
): Promise<{ result: DailyMedResponse; cached: boolean; stale: boolean }> {
    const query = exactName.trim();
    if (!query) throw new Error("Drug name is required.");

    const cacheKey = createCacheKey("spls", query);
    const cached = await getCached<DailyMedResponse>(cacheKey, "dailymed_cache");
    if (cached) {
        console.log(`[dailymed] spls "${query}" -> cache hit`);
        return { result: cached.response, cached: true, stale: false };
    }

    const url = new URL(`${DAILYMED_BASE_URL}/spls.json`);
    url.searchParams.set("drug_name", query);
    url.searchParams.set("page", "1");
    url.searchParams.set("pagesize", "20");

    console.log(`[dailymed] spls fetch: ${url.toString()}`);

    const response = await fetchWithTimeout(url.toString());
    console.log(`[dailymed] spls upstream status: ${response.status}`);

    if (!response.ok) {
        throw new Error(`DailyMed API returned HTTP ${response.status}`);
    }

    const json = await response.json();
    const result: DailyMedResponse = {
        data: Array.isArray(json?.data) ? json.data : [],
        metadata: json?.metadata ?? {},
    };

    console.log(`[dailymed] spls "${query}" -> ${result.data.length} results`);

    await saveCache(cacheKey, query, result, "dailymed_cache", CACHE_TTL_SECONDS);
    return { result, cached: false, stale: false };
}

/**
 * Legacy single-call search retained for backward compatibility with any
 * existing callers — now implemented as suggest-then-fetch-first-match
 * so a plain "search box, no dropdown" usage still returns real results
 * instead of the old always-empty exact-match bug.
 */
export async function searchDailyMed(
    rawQuery: string
): Promise<{ result: DailyMedResponse; cached: boolean; stale: boolean }> {
    const suggestions = await suggestDrugNames(rawQuery);
    if (suggestions.length === 0) {
        return { result: { data: [], metadata: { total_elements: 0 } }, cached: false, stale: false };
    }
    return getDailyMedByExactName(suggestions[0].name);
}