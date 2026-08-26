/**
 * MedlinePlus Web Service client (National Library of Medicine).
 * Free, no API key, no auth. Keyword search over consumer health topics —
 * unlike MedlinePlus Connect (which needs ICD/SNOMED/RxCUI codes), this
 * takes free text, which fits a search-bar UI directly.
 *
 * Base: https://wsearch.nlm.nih.gov/ws/query
 * Docs: https://medlineplus.gov/about/developers/webservices/
 */

const MEDLINEPLUS_BASE = "https://wsearch.nlm.nih.gov/ws/query";

export interface MedlinePlusTopic {
    title: string;
    snippet: string;
    url: string;
    language: "en" | "es";
}

export interface MedlinePlusSearchResult {
    query: string;
    totalCount: number;
    topics: MedlinePlusTopic[];
}

function stripTags(html: string): string {
    return html
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

/** Minimal XML tag-content extractor — MedlinePlus returns XML, not JSON. */
function extractAll(xml: string, tag: string): string[] {
    const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "g");
    const matches: string[] = [];
    let m;
    while ((m = re.exec(xml)) !== null) matches.push(m[1]);
    return matches;
}

export async function searchMedlinePlus(
    query: string,
    opts: { language?: "en" | "es"; retmax?: number } = {}
): Promise<MedlinePlusSearchResult> {
    const language = opts.language ?? "en";
    const db = language === "es" ? "healthTopicsSpanish" : "healthTopics";

    const params = new URLSearchParams({
        db,
        term: query,
        retmax: String(opts.retmax ?? 10),
    });

    const res = await fetch(`${MEDLINEPLUS_BASE}?${params}`);
    if (!res.ok) throw new Error(`MedlinePlus search failed: ${res.status}`);
    const xml = await res.text();

    const countMatch = xml.match(/count="(\d+)"/);
    const totalCount = countMatch ? Number(countMatch[1]) : 0;

    // Each <document> block contains <content name="title"> and <content name="snippet">
    const documents = extractAll(xml, "document");
    const urlAttrRe = /<document[^>]*url="([^"]+)"/g;
    const urls: string[] = [];
    let um;
    while ((um = urlAttrRe.exec(xml)) !== null) urls.push(um[1]);

    const topics: MedlinePlusTopic[] = documents.map((doc, i) => {
        const titleMatch = doc.match(/<content name="title"[^>]*>([\s\S]*?)<\/content>/);
        const snippetMatch = doc.match(/<content name="snippet"[^>]*>([\s\S]*?)<\/content>/);
        return {
            title: titleMatch ? stripTags(titleMatch[1]) : "Untitled topic",
            snippet: snippetMatch ? stripTags(snippetMatch[1]) : "",
            url: urls[i] || "",
            language,
        };
    });

    return { query, totalCount, topics };
}