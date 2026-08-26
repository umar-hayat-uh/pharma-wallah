/**
 * PubMed E-utilities client (NCBI).
 * Free, no API key required (3 req/s). Optional NCBI_API_KEY env var
 * raises the limit to 10 req/s — get one at https://www.ncbi.nlm.nih.gov/account/
 *
 * Docs: https://www.ncbi.nlm.nih.gov/books/NBK25501/
 */

const EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const TOOL_NAME = "pharmawallah";
const CONTACT_EMAIL = process.env.NCBI_CONTACT_EMAIL || "";
const API_KEY = process.env.NCBI_API_KEY || "";

export interface PubMedArticle {
    pmid: string;
    title: string;
    authors: string[];
    journal: string;
    pubDate: string;
    abstract: string | null;
    url: string;
}

export interface PubMedSearchResult {
    query: string;
    totalCount: number;
    articles: PubMedArticle[];
}

function withAuth(params: URLSearchParams) {
    params.set("tool", TOOL_NAME);
    if (CONTACT_EMAIL) params.set("email", CONTACT_EMAIL);
    if (API_KEY) params.set("api_key", API_KEY);
    return params;
}

/**
 * Step 1: ESearch — resolve a free-text query into a list of PMIDs.
 * Step 2: ESummary — fetch structured metadata for those PMIDs in one call.
 *
 * We deliberately use ESummary (not EFetch abstracts) for the list view —
 * it's cheaper and gives us title/authors/journal/date directly as JSON.
 * Abstracts are fetched separately, only for the article the user opens,
 * to keep list-search calls light.
 */
export async function searchPubMed(
    query: string,
    opts: { retmax?: number; retstart?: number } = {}
): Promise<PubMedSearchResult> {
    const retmax = opts.retmax ?? 10;
    const retstart = opts.retstart ?? 0;

    const searchParams = withAuth(
        new URLSearchParams({
            db: "pubmed",
            term: query,
            retmode: "json",
            retmax: String(retmax),
            retstart: String(retstart),
            sort: "relevance",
        })
    );

    const searchRes = await fetch(`${EUTILS_BASE}/esearch.fcgi?${searchParams}`);
    if (!searchRes.ok) throw new Error(`PubMed ESearch failed: ${searchRes.status}`);
    const searchJson = await searchRes.json();

    const ids: string[] = searchJson?.esearchresult?.idlist ?? [];
    const totalCount = Number(searchJson?.esearchresult?.count ?? 0);

    if (ids.length === 0) {
        return { query, totalCount: 0, articles: [] };
    }

    const summaryParams = withAuth(
        new URLSearchParams({
            db: "pubmed",
            id: ids.join(","),
            retmode: "json",
            version: "2.0",
        })
    );

    const summaryRes = await fetch(`${EUTILS_BASE}/esummary.fcgi?${summaryParams}`);
    if (!summaryRes.ok) throw new Error(`PubMed ESummary failed: ${summaryRes.status}`);
    const summaryJson = await summaryRes.json();

    const result = summaryJson?.result ?? {};
    const articles: PubMedArticle[] = ids
        .map((id) => result[id])
        .filter(Boolean)
        .map((doc: any) => ({
            pmid: doc.uid,
            title: doc.title?.replace(/\.$/, "") ?? "Untitled",
            authors: (doc.authors ?? []).map((a: any) => a.name).slice(0, 6),
            journal: doc.fulljournalname || doc.source || "",
            pubDate: doc.pubdate || "",
            abstract: null, // populated on-demand via getPubMedAbstract()
            url: `https://pubmed.ncbi.nlm.nih.gov/${doc.uid}/`,
        }));

    return { query, totalCount, articles };
}

/**
 * Fetch a single article's abstract on demand (e.g. when a user expands
 * a card in the UI). Kept separate from search so list queries stay fast
 * and we're not pulling full abstract text for 10 results at once.
 */
export async function getPubMedAbstract(pmid: string): Promise<string | null> {
    const params = withAuth(
        new URLSearchParams({
            db: "pubmed",
            id: pmid,
            rettype: "abstract",
            retmode: "text",
        })
    );

    const res = await fetch(`${EUTILS_BASE}/efetch.fcgi?${params}`);
    if (!res.ok) return null;
    const text = await res.text();

    // The plain-text record includes title/authors/journal above the abstract.
    // Grab just the abstract body: text after the last blank-line-separated
    // header block, up to a "PMID:" or copyright footer if present.
    const cleaned = text
        .split(/\n{2,}/)
        .find((block) => block.length > 200) // heuristic: abstract is the long paragraph
        ?.replace(/\s+/g, " ")
        .trim();

    return cleaned || null;
}