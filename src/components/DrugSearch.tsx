'use client';

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import DrugCard from '@/components/DrugCard';

interface Drug {
    drugbank_ids: { id: string }[];
    name: string;
    description: string;
    unii: string;
    drug_type: string;
    cas_number?: string;
    classification?: {
        direct_parent: string;
        kingdom: string;
    };
    groups?: string[];
}

export default function DrugSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Drug[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalResults, setTotalResults] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 10;

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (searchQuery: string, pageNum: number) => {
            if (!searchQuery.trim()) {
                setResults([]);
                setTotalResults(0);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&limit=${limit}`
                );

                const data = await response.json();

                if (data.success) {
                    setResults(data.data);
                    setTotalResults(data.pagination.total);
                } else {
                    setError(data.message || 'Search failed');
                    setResults([]);
                }
            } catch (err) {
                setError('Failed to fetch results');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 500),
        []
    );

    useEffect(() => {
        debouncedSearch(query, page);
        return () => debouncedSearch.cancel();
    }, [query, page, debouncedSearch]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setPage(1); // Reset to first page on new search
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setTotalResults(0);
        setPage(1);
    };

    const totalPages = Math.ceil(totalResults / limit);

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="mb-8">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder="Search for drugs by name, description, UNII, CAS number..."
                        className="w-full p-4 pl-12 text-lg border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all"
                    />
                    <div className="absolute left-4 top-4 text-gray-400">
                        {loading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        )}
                    </div>
                    {query && (
                        <button
                            onClick={handleClear}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {query && (
                    <div className="mt-2 text-sm text-gray-600">
                        {loading ? 'Searching...' : `${totalResults} results found`}
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {!loading && results.length === 0 && query && (
                <div className="text-center py-8 text-gray-500">
                    No drugs found matching "{query}"
                </div>
            )}

            <div className="space-y-6">
                {results.map((drug) => (
                    <DrugCard key={drug.drugbank_ids[0]?.id || drug.unii} drug={drug} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex justify-center space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>

                    <span className="px-4 py-2">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {results.length > 0 && (
                <div className="mt-8 pt-4 border-t text-sm text-gray-500">
                    Showing {results.length} of {totalResults} results
                    {results.length < totalResults && ' (use pagination to see more)'}
                </div>
            )}
        </div>
    );
}