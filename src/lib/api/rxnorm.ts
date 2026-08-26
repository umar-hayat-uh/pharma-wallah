/**
 * RxNorm API client (NLM RxNav REST API)
 * Docs: https://lhncbc.nlm.nih.gov/RxNav/APIs/RxNormAPIs.html
 * Free, no API key, no auth. Rate limit: ~20 req/sec (be polite, we still throttle).
 *
 * NOTE: The old /interaction/interaction.json endpoint was PERMANENTLY
 * DISCONTINUED by NLM in Jan 2024. Do not use it. Interactions come from openFDA instead
 * (see lib/api/openfda.ts). RxNorm here is used ONLY for name <-> RxCUI normalization.
 */

const RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST";

export interface RxNormConcept {
    rxcui: string;
    name: string;
    synonym?: string;
    tty?: string; // term type: IN (ingredient), SCD (clinical drug), SBD (branded drug), etc.
}

export interface RxNormSearchResult {
    query: string;
    exactMatches: RxNormConcept[];
    suggestions: string[]; // spelling suggestions if no exact match
}

async function rxnormFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${RXNORM_BASE}${path}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 60 * 60 * 24 }, // cache 24h, this data changes monthly
    });

    if (!res.ok) {
        throw new Error(`RxNorm API error ${res.status}: ${path}`);
    }

    return res.json() as Promise<T>;
}

/**
 * Autocomplete suggestions as the user types. Uses RxNorm's dedicated
 * approximateTerm endpoint — a real prefix/fuzzy search built for exactly
 * this use case (unlike openFDA, which has no autocomplete endpoint).
 */
export async function suggestDrugNames(
    prefix: string,
    limit = 8
): Promise<string[]> {
    const trimmed = prefix.trim();
    if (trimmed.length < 2) return [];

    type ApproxResponse = {
        approximateGroup?: {
            candidate?: Array<{ rxcui: string; rxaui: string; score: string }>;
        };
    };

    const data = await rxnormFetch<ApproxResponse>(
        `/approximateTerm.json?term=${encodeURIComponent(trimmed)}&maxEntries=${limit * 2}`
    );

    const candidates = data.approximateGroup?.candidate ?? [];
    if (candidates.length === 0) return [];

    // approximateTerm returns rxcui/rxaui but not names directly — resolve names
    const uniqueRxcuis = [...new Set(candidates.map((c) => c.rxcui))].slice(0, limit);
    const names = await Promise.all(
        uniqueRxcuis.map(async (rxcui) => {
            type PropsResponse = { properties?: { name?: string } };
            try {
                const props = await rxnormFetch<PropsResponse>(
                    `/rxcui/${encodeURIComponent(rxcui)}/property.json?propName=RxNorm%20Name`
                );
                return props.properties?.name;
            } catch {
                return undefined;
            }
        })
    );

    return names.filter((n): n is string => Boolean(n));
}

/**
 * Look up RxCUI(s) + concept info for a drug name (brand or generic).
 * This is the main entry point for normalizing a free-text drug name.
 */
export async function searchRxNormByName(
    name: string
): Promise<RxNormSearchResult> {
    const trimmed = name.trim();
    if (!trimmed) {
        return { query: name, exactMatches: [], suggestions: [] };
    }

    // /drugs.json returns grouped concepts (brand + generic) for a name
    type DrugsResponse = {
        drugGroup?: {
            conceptGroup?: Array<{
                tty: string;
                conceptProperties?: Array<{
                    rxcui: string;
                    name: string;
                    synonym?: string;
                }>;
            }>;
        };
    };

    const data = await rxnormFetch<DrugsResponse>(
        `/drugs.json?name=${encodeURIComponent(trimmed)}`
    );

    const exactMatches: RxNormConcept[] = [];
    for (const group of data.drugGroup?.conceptGroup ?? []) {
        for (const concept of group.conceptProperties ?? []) {
            exactMatches.push({
                rxcui: concept.rxcui,
                name: concept.name,
                synonym: concept.synonym,
                tty: group.tty,
            });
        }
    }

    if (exactMatches.length > 0) {
        return { query: name, exactMatches, suggestions: [] };
    }

    // No exact match — fetch spelling suggestions so the UI can offer "did you mean"
    type SuggestionsResponse = {
        suggestionGroup?: {
            suggestionList?: { suggestion?: string[] };
        };
    };

    const suggestData = await rxnormFetch<SuggestionsResponse>(
        `/spellingsuggestions.json?name=${encodeURIComponent(trimmed)}`
    );

    return {
        query: name,
        exactMatches: [],
        suggestions: suggestData.suggestionGroup?.suggestionList?.suggestion ?? [],
    };
}

/**
 * Get the base ingredient(s) for a given RxCUI. Useful for normalizing a
 * branded product (e.g. "Panadol") down to its active ingredient ("acetaminophen")
 * so it can be matched against DRAP generic-name data or openFDA queries.
 */
export async function getIngredientsForRxcui(
    rxcui: string
): Promise<RxNormConcept[]> {
    type RelatedResponse = {
        relatedGroup?: {
            conceptGroup?: Array<{
                tty: string;
                conceptProperties?: Array<{ rxcui: string; name: string }>;
            }>;
        };
    };

    const data = await rxnormFetch<RelatedResponse>(
        `/rxcui/${encodeURIComponent(rxcui)}/related.json?tty=IN+PIN+MIN`
    );

    const ingredients: RxNormConcept[] = [];
    for (const group of data.relatedGroup?.conceptGroup ?? []) {
        for (const c of group.conceptProperties ?? []) {
            ingredients.push({ rxcui: c.rxcui, name: c.name, tty: group.tty });
        }
    }
    return ingredients;
}

/**
 * Get the fuller picture of a concept for the Drug Finder tool: related
 * brand names (SBD/BN), related generic clinical drugs (SCD), and available
 * dose forms (DF). Pure RxNorm — no safety data.
 */
export interface RelatedConcepts {
    brands: string[];
    generics: string[];
    doseForms: string[];
}

export async function getAllRelatedConcepts(
    rxcui: string
): Promise<RelatedConcepts> {
    type RelatedResponse = {
        relatedGroup?: {
            conceptGroup?: Array<{
                tty: string;
                conceptProperties?: Array<{ rxcui: string; name: string }>;
            }>;
        };
    };

    const data = await rxnormFetch<RelatedResponse>(
        `/rxcui/${encodeURIComponent(rxcui)}/related.json?tty=BN+SBD+SCD+DF`
    );

    const brands = new Set<string>();
    const generics = new Set<string>();
    const doseForms = new Set<string>();

    for (const group of data.relatedGroup?.conceptGroup ?? []) {
        for (const c of group.conceptProperties ?? []) {
            if (group.tty === "BN" || group.tty === "SBD") brands.add(c.name);
            else if (group.tty === "SCD") generics.add(c.name);
            else if (group.tty === "DF") doseForms.add(c.name);
        }
    }

    return {
        brands: [...brands],
        generics: [...generics],
        doseForms: [...doseForms],
    };
}

/**
 * Look up an RxCUI directly by NDC (National Drug Code).
 */
export async function getRxcuiByNdc(ndc: string): Promise<string | null> {
    type NdcResponse = { idGroup?: { rxnormId?: string[] } };
    const data = await rxnormFetch<NdcResponse>(
        `/rxcui.json?idtype=NDC&id=${encodeURIComponent(ndc)}`
    );
    return data.idGroup?.rxnormId?.[0] ?? null;
}