/**
 * openFDA Drug Label API client
 * Docs: https://open.fda.gov/apis/drug/label/
 * Free, no API key required (optional key raises rate limit).
 * Set OPENFDA_API_KEY in .env.local if you hit rate limits.
 *
 * This is the CLINICAL SAFETY DATA source: interactions, contraindications,
 * warnings, boxed warnings, dosage. RxNorm (lib/api/rxnorm.ts) is ONLY for
 * name normalization — do not use it for interaction data (that endpoint is dead).
 *
 * IMPORTANT: openFDA label data is US-labeling based (FDA-approved products).
 * A drug sold in Pakistan under a different brand may not appear by brand name —
 * always search/cross-reference by GENERIC/ACTIVE INGREDIENT NAME, not brand name,
 * for best coverage. This is why RxNorm normalization to ingredient level matters.
 */

const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";
const OPENFDA_EVENT_BASE = "https://api.fda.gov/drug/event.json";
const OPENFDA_TIMEOUT = 15000; // 15 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second base delay

export interface DrugLabelSafetyInfo {
    setId?: string;
    brandName?: string[];
    genericName?: string[];
    manufacturerName?: string[];
    rxcui?: string[];
    route?: string[];
    boxedWarning?: string[];
    warnings?: string[];
    warningsAndPrecautions?: string[];
    contraindications?: string[];
    drugInteractions?: string[];
    dosageAndAdministration?: string[];
    adverseReactions?: string[];
    pregnancy?: string[];
    pediatricUse?: string[];
    geriatricUse?: string[];
    overdosage?: string[];
}

type OpenFdaRawResult = {
    openfda?: {
        spl_set_id?: string[];
        brand_name?: string[];
        generic_name?: string[];
        manufacturer_name?: string[];
        rxcui?: string[];
        route?: string[];
    };
    boxed_warning?: string[];
    warnings?: string[];
    warnings_and_precautions?: string[];
    contraindications?: string[];
    drug_interactions?: string[];
    dosage_and_administration?: string[];
    adverse_reactions?: string[];
    pregnancy?: string[];
    pediatric_use?: string[];
    geriatric_use?: string[];
    overdosage?: string[];
};

type OpenFdaResponse = {
    results?: OpenFdaRawResult[];
    error?: { code: string; message: string };
};

function mapResult(r: OpenFdaRawResult): DrugLabelSafetyInfo {
    return {
        setId: r.openfda?.spl_set_id?.[0],
        brandName: r.openfda?.brand_name,
        genericName: r.openfda?.generic_name,
        manufacturerName: r.openfda?.manufacturer_name,
        rxcui: r.openfda?.rxcui,
        route: r.openfda?.route,
        boxedWarning: r.boxed_warning,
        warnings: r.warnings,
        warningsAndPrecautions: r.warnings_and_precautions,
        contraindications: r.contraindications,
        drugInteractions: r.drug_interactions,
        dosageAndAdministration: r.dosage_and_administration,
        adverseReactions: r.adverse_reactions,
        pregnancy: r.pregnancy,
        pediatricUse: r.pediatric_use,
        geriatricUse: r.geriatric_use,
        overdosage: r.overdosage,
    };
}

/**
 * Fetch with timeout and retry logic.
 * Returns parsed JSON, or null if 404 (no results), or throws on other errors.
 */
async function fetchWithTimeout<T>(
    url: string,
    options: RequestInit = {},
    timeout = OPENFDA_TIMEOUT,
    retries = MAX_RETRIES
): Promise<T | null> {
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(url, { ...options, signal });
        clearTimeout(timeoutId);

        if (res.status === 404) {
            return null; // not found – treat as empty result
        }
        if (res.status === 429) {
            throw new Error("Rate limit exceeded. Try again later.");
        }
        if (!res.ok) {
            throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data as T;
    } catch (err: any) {
        clearTimeout(timeoutId);

        // If it's a timeout or network error, retry (if retries left)
        if (
            (err.name === "AbortError" || err.code === "ETIMEDOUT" || err.message.includes("timeout")) &&
            retries > 0
        ) {
            console.warn(`openFDA request failed, retrying (${retries} left)...`);
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
            return fetchWithTimeout<T>(url, options, timeout, retries - 1);
        }

        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}

async function fetchLabelResults(searchQuery: string, limit = 5): Promise<OpenFdaRawResult[]> {
    const apiKey = process.env.OPENFDA_API_KEY;
    const params = new URLSearchParams({
        search: searchQuery,
        limit: String(limit),
    });
    if (apiKey) params.set("api_key", apiKey);

    const fullUrl = `${OPENFDA_BASE}?${params.toString()}`;
    const data = await fetchWithTimeout<OpenFdaResponse>(fullUrl, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 * 60 * 24 },
    });

    if (!data) return [];
    return data.results ?? [];
}

/**
 * Autocomplete suggestions as the user types a drug name. Uses openFDA's
 * `.exact` count aggregation as a cheap prefix-search substitute — openFDA
 * has no dedicated autocomplete endpoint, so this is a pragmatic workaround:
 * count distinct generic_name values starting with the typed prefix.
 */
export interface DrugSuggestion {
    name: string;
    type: "generic" | "brand";
}

export async function suggestDrugNames(
    prefix: string,
    limit = 8
): Promise<DrugSuggestion[]> {
    const trimmed = prefix.trim();
    if (trimmed.length < 2) return [];

    const apiKey = process.env.OPENFDA_API_KEY;
    const escaped = trimmed.replace(/"/g, '\\"');

    async function countSearch(field: "generic_name" | "brand_name") {
        const params = new URLSearchParams({
            search: `openfda.${field}:${escaped}*`,
            count: `openfda.${field}.exact`,
        });
        if (apiKey) params.set("api_key", apiKey);

        const fullUrl = `${OPENFDA_BASE}?${params.toString()}`;
        try {
            const data = await fetchWithTimeout<{ results?: Array<{ term: string; count: number }> }>(
                fullUrl,
                { headers: { Accept: "application/json" }, next: { revalidate: 60 * 60 * 24 } }
            );
            return data?.results ?? [];
        } catch {
            return [];
        }
    }

    const [genericHits, brandHits] = await Promise.all([
        countSearch("generic_name"),
        countSearch("brand_name"),
    ]);

    const suggestions: DrugSuggestion[] = [
        ...genericHits
            .filter((h) => h.term.toLowerCase().startsWith(trimmed.toLowerCase()))
            .map((h) => ({ name: h.term.toLowerCase(), type: "generic" as const })),
        ...brandHits
            .filter((h) => h.term.toLowerCase().startsWith(trimmed.toLowerCase()))
            .map((h) => ({ name: h.term.toLowerCase(), type: "brand" as const })),
    ];

    // de-dupe by name, cap to limit
    const seen = new Set<string>();
    const deduped: DrugSuggestion[] = [];
    for (const s of suggestions) {
        if (!seen.has(s.name)) {
            seen.add(s.name);
            deduped.push(s);
        }
        if (deduped.length >= limit) break;
    }
    return deduped;
}

/**
 * Reported adverse event counts from FAERS (FDA Adverse Event Reporting
 * System), via openFDA's /drug/event endpoint. This is REPORTED data —
 * anyone can submit a report, causation is not confirmed — distinct from
 * the label's official "adverse_reactions" section (clinical-trial derived).
 * Both are shown together in the Adverse Effect Detector for a fuller picture.
 */
export interface ReportedReaction {
    reactionTerm: string;
    reportCount: number;
}

export async function getReportedAdverseEvents(
    drugName: string,
    limit = 10
): Promise<ReportedReaction[]> {
    try {
        const apiKey = process.env.OPENFDA_API_KEY;
        const params = new URLSearchParams({
            search: `patient.drug.medicinalproduct:"${drugName}"`,
            count: "patient.reaction.reactionmeddrapt.exact",
        });
        if (apiKey) params.set("api_key", apiKey);

        const fullUrl = `${OPENFDA_EVENT_BASE}?${params.toString()}`;
        const data = await fetchWithTimeout<{ results?: Array<{ term: string; count: number }> }>(
            fullUrl,
            { headers: { Accept: "application/json" }, next: { revalidate: 60 * 60 * 24 } }
        );

        if (!data) return [];
        return (data.results ?? [])
            .slice(0, limit)
            .map((r) => ({ reactionTerm: r.term, reportCount: r.count }));
    } catch (err) {
        console.warn("openFDA event API failed:", err);
        return []; // non‑fatal – we still have label data
    }
}

/**
 * Search adverse-event-specific label sections directly by free-text drug
 * name (tries generic name match, falls back to brand name). Used by the
 * Adverse Effect Detector tool — deliberately does NOT go through RxNorm,
 * per requirement that these be two fully independent tools/pipelines.
 */
export async function searchAdverseEffectsByName(
    drugName: string
): Promise<DrugLabelSafetyInfo[]> {
    try {
        let results = await fetchLabelResults(`openfda.generic_name:"${drugName}"`);
        if (results.length === 0) {
            results = await fetchLabelResults(`openfda.brand_name:"${drugName}"`);
        }
        return results.map(mapResult);
    } catch (err) {
        console.error("openFDA label search failed:", err);
        throw err; // re‑throw for the route to handle
    }
}

/**
 * Search by generic/active ingredient name. PREFERRED method — best coverage
 * since Pakistani brand names won't match US brand names.
 */
export async function getLabelByGenericName(
    genericName: string
): Promise<DrugLabelSafetyInfo[]> {
    try {
        const results = await fetchLabelResults(
            `openfda.generic_name:"${genericName}"`
        );
        return results.map(mapResult);
    } catch (err) {
        console.warn("Failed to fetch label by generic name:", err);
        return [];
    }
}

/**
 * Search by US brand name. Fallback only — won't match Pakistani-only brands.
 */
export async function getLabelByBrandName(
    brandName: string
): Promise<DrugLabelSafetyInfo[]> {
    try {
        const results = await fetchLabelResults(`openfda.brand_name:"${brandName}"`);
        return results.map(mapResult);
    } catch (err) {
        console.warn("Failed to fetch label by brand name:", err);
        return [];
    }
}

/**
 * Search by RxCUI — most precise, use this when you already normalized
 * via RxNorm. This is the recommended path: name -> RxNorm -> RxCUI -> openFDA.
 */
export async function getLabelByRxcui(
    rxcui: string
): Promise<DrugLabelSafetyInfo[]> {
    try {
        const results = await fetchLabelResults(`openfda.rxcui:"${rxcui}"`);
        return results.map(mapResult);
    } catch (err) {
        console.warn("Failed to fetch label by RxCUI:", err);
        return [];
    }
}

// ─── Interaction checker (text-matching) ──────────────────────────────────

export interface PairwiseInteractionResult {
    drugA: string;
    drugB: string;
    possibleInteractionFound: boolean;
    evidence: Array<{
        fromDrug: string;
        section: "drug_interactions" | "contraindications" | "boxed_warning" | "warnings";
        excerpt: string;
    }>;
}

function textMentionsDrug(text: string, drugName: string): boolean {
    return text.toLowerCase().includes(drugName.toLowerCase());
}

function findMentions(
    sectionText: string[] | undefined,
    otherDrugName: string,
    fromDrugName: string,
    section: PairwiseInteractionResult["evidence"][number]["section"]
): PairwiseInteractionResult["evidence"] {
    if (!sectionText) return [];
    const hits: PairwiseInteractionResult["evidence"] = [];
    for (const chunk of sectionText) {
        if (textMentionsDrug(chunk, otherDrugName)) {
            hits.push({
                fromDrug: fromDrugName,
                section,
                excerpt: chunk.slice(0, 500),
            });
        }
    }
    return hits;
}

export async function checkPairwiseInteraction(
    genericNameA: string,
    genericNameB: string
): Promise<PairwiseInteractionResult> {
    const [labelsA, labelsB] = await Promise.all([
        getLabelByGenericName(genericNameA),
        getLabelByGenericName(genericNameB),
    ]);

    const evidence: PairwiseInteractionResult["evidence"] = [];

    for (const label of labelsA) {
        evidence.push(
            ...findMentions(label.drugInteractions, genericNameB, genericNameA, "drug_interactions"),
            ...findMentions(label.contraindications, genericNameB, genericNameA, "contraindications"),
            ...findMentions(label.boxedWarning, genericNameB, genericNameA, "boxed_warning"),
            ...findMentions(label.warnings, genericNameB, genericNameA, "warnings")
        );
    }

    for (const label of labelsB) {
        evidence.push(
            ...findMentions(label.drugInteractions, genericNameA, genericNameB, "drug_interactions"),
            ...findMentions(label.contraindications, genericNameA, genericNameB, "contraindications"),
            ...findMentions(label.boxedWarning, genericNameA, genericNameB, "boxed_warning"),
            ...findMentions(label.warnings, genericNameA, genericNameB, "warnings")
        );
    }

    return {
        drugA: genericNameA,
        drugB: genericNameB,
        possibleInteractionFound: evidence.length > 0,
        evidence,
    };
}