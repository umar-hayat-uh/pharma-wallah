"use client";

import { useState } from "react";
import { AutocompleteSearch } from "@/components/AutocompleteSearch";
import { MedicalDisclaimerBanner } from "@/components/MedicalDisclaimerBanner";

interface FinderResult {
    rxcui: string;
    matchedName: string;
    termType?: string;
    ingredientNames: string[];
    relatedBrands: string[];
    relatedGenerics: string[];
    doseForms: string[];
}

interface FinderResponse {
    source: string;
    found?: boolean;
    result?: FinderResult;
    suggestions?: string[];
    message?: string;
    disclaimer?: string;
    error?: string;
}

export default function DrugFinderPage() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<FinderResponse | null>(null);

    async function runSearch(term: string) {
        if (!term.trim()) return;
        setLoading(true);
        setResponse(null);
        try {
            const res = await fetch(`/api/drugs/finder?q=${encodeURIComponent(term)}`);
            setResponse(await res.json());
        } catch {
            setResponse({ source: "error", error: "Network error — try again." });
        } finally {
            setLoading(false);
        }
    }

    const r = response?.result;

    return (
        <div className="page">
            <header className="masthead">
                <span className="eyebrow">Pharmawallah CDS · Tool 1 of 2</span>
                <h1>Drug Finder</h1>
                <p className="tagline">
                    Look up a drug&apos;s identity: RxCUI, active ingredient, related brand
                    and generic names, and dose forms.
                </p>
            </header>

            <div className="banner-slot">
                <MedicalDisclaimerBanner />
            </div>

            <main className="content">
                <AutocompleteSearch
                    value={query}
                    onChange={setQuery}
                    onSubmit={(v) => {
                        setQuery(v);
                        runSearch(v);
                    }}
                    suggestUrl={(q) => `/api/drugs/finder/suggest?q=${encodeURIComponent(q)}`}
                    extractSuggestions={(data) =>
                        (data as { suggestions?: string[] }).suggestions ?? []
                    }
                    placeholder="e.g. metformin, ibuprofen"
                    loading={loading}
                    accentColor="#1f6b52"
                />

                {loading && <div className="status-line">Querying RxNorm…</div>}

                {response?.error && (
                    <div className="callout error">
                        <strong>Error.</strong> {response.error}
                    </div>
                )}

                {response && response.found === false && (
                    <div className="callout warn">
                        <strong>No exact match for &ldquo;{query}&rdquo;.</strong>
                        {response.suggestions && response.suggestions.length > 0 && (
                            <ul className="suggestion-list">
                                {response.suggestions.map((s) => (
                                    <li key={s}>
                                        <button className="link-button" onClick={() => runSearch(s)}>
                                            {s}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {r && (
                    <article className="result-card">
                        <h2>{r.matchedName}</h2>
                        <div className="meta-row">
                            <span className="chip mono">RxCUI {r.rxcui}</span>
                            {r.termType && <span className="chip">{r.termType}</span>}
                        </div>

                        {r.ingredientNames.length > 0 && (
                            <div className="field">
                                <span className="label">Active ingredient(s)</span>
                                <p>{r.ingredientNames.join(", ")}</p>
                            </div>
                        )}
                        {r.relatedGenerics.length > 0 && (
                            <div className="field">
                                <span className="label">Related generic clinical drugs</span>
                                <p>{r.relatedGenerics.join(", ")}</p>
                            </div>
                        )}
                        {r.relatedBrands.length > 0 && (
                            <div className="field">
                                <span className="label">Related US brand names</span>
                                <p>{r.relatedBrands.join(", ")}</p>
                            </div>
                        )}
                        {r.doseForms.length > 0 && (
                            <div className="field">
                                <span className="label">Dose forms</span>
                                <p>{r.doseForms.join(", ")}</p>
                            </div>
                        )}
                    </article>
                )}

                {response?.disclaimer && <p className="disclaimer">{response.disclaimer}</p>}
            </main>

            <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f6f8f7;
          color: #12201b;
          font-family: "IBM Plex Sans", system-ui, sans-serif;
        }
        .masthead {
          background: #14312a;
          color: #eaf3ee;
          padding: 2.75rem 1.5rem 1.75rem;
        }
        .eyebrow {
          display: block;
          max-width: 720px;
          margin: 0 auto 0.6rem;
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #86c2a6;
          font-weight: 600;
        }
        h1 {
          max-width: 720px;
          margin: 0 auto 0.45rem;
          font-size: 2rem;
          font-weight: 650;
        }
        .tagline {
          max-width: 56ch;
          margin: 0 auto;
          color: #b9d3c8;
          font-size: 0.98rem;
          line-height: 1.5;
        }
        .banner-slot {
          padding: 1rem 1.5rem 0;
        }
        .content {
          max-width: 720px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 4rem;
        }
        .status-line {
          font-size: 0.9rem;
          color: #4b5f57;
          margin: 0.85rem 0 0;
        }
        .callout {
          padding: 1rem 1.1rem;
          border-radius: 8px;
          font-size: 0.92rem;
          margin-top: 1.25rem;
          line-height: 1.5;
        }
        .callout.warn {
          background: #fdf3e2;
          border: 1px solid #e8c988;
          color: #6b4f14;
        }
        .callout.error {
          background: #fbeaea;
          border: 1px solid #e3a5a5;
          color: #7a1f1f;
        }
        .suggestion-list {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .link-button {
          background: white;
          border: 1px solid #e8c988;
          padding: 0.35rem 0.7rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.88rem;
          text-transform: capitalize;
        }
        .result-card {
          background: white;
          border: 1px solid #dce6e1;
          border-radius: 12px;
          padding: 1.75rem;
          margin-top: 1.5rem;
        }
        .result-card h2 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          text-transform: capitalize;
        }
        .meta-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .chip {
          font-size: 0.78rem;
          background: #eef4f1;
          color: #2c4a3d;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
        }
        .chip.mono {
          font-family: "IBM Plex Mono", ui-monospace, monospace;
        }
        .field {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eaeeec;
        }
        .field .label {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #4b5f57;
          font-weight: 600;
        }
        .field p {
          margin: 0.35rem 0 0;
          font-size: 0.95rem;
          line-height: 1.5;
          text-transform: capitalize;
        }
        .disclaimer {
          font-size: 0.8rem;
          color: #6b7a74;
          line-height: 1.5;
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px dashed #cdd9d3;
        }
      `}</style>
        </div>
    );
}