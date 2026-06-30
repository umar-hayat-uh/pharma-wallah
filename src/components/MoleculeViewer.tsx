"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    FlaskConical,
    Loader2,
    Download,
    Eye,
    FileText,
    Atom,
    Weight,
} from "lucide-react";

// Only supported styles for small molecules
const STYLES = ["stick", "sphere"] as const;
type MoleculeStyle = (typeof STYLES)[number];

const STYLE_LABELS: Record<MoleculeStyle, string> = {
    stick: "Ball & Stick",
    sphere: "Space Fill",
};

interface MoleculeData {
    iupacName: string;
    molecularFormula: string;
    molecularWeight: string;
}

interface Suggestion {
    name: string;
}

export default function MoleculeViewer() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [style, setStyle] = useState<MoleculeStyle>("stick");
    const [moleculeData, setMoleculeData] = useState<MoleculeData | null>(null);
    const [exporting, setExporting] = useState(false);
    const [$3Dmol, set$3Dmol] = useState<any>(null);

    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

    const viewerRef = useRef<HTMLDivElement>(null);
    const viewerInstance = useRef<any>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Dynamically load 3Dmol on the client
    useEffect(() => {
        let cancelled = false;
        import("3dmol")
            .then((mod) => {
                if (!cancelled) set$3Dmol(mod.default || mod);
            })
            .catch((err) => console.error("Failed to load 3Dmol:", err));
        return () => { cancelled = true; };
    }, []);

    // Cleanup viewer on unmount
    useEffect(() => {
        return () => {
            if (viewerInstance.current) {
                viewerInstance.current.clear();
                viewerInstance.current = null;
            }
        };
    }, []);

    // Update viewer style when style changes
    useEffect(() => {
        if (viewerInstance.current) {
            viewerInstance.current.setStyle({}, getStyleParamsObj(style));
            viewerInstance.current.render();
        }
    }, [style]);

    function getStyleParamsObj(s: MoleculeStyle) {
        switch (s) {
            case "stick":
                return { stick: { radius: 0.15, colorscheme: "Jmol" } };
            case "sphere":
                return { sphere: { scale: 0.4, colorscheme: "Jmol" } };
            default:
                return { stick: {} };
        }
    }

    // Autocomplete fetch with debounce
    const fetchSuggestions = useCallback(async (value: string) => {
        if (!value.trim() || value.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        try {
            const res = await fetch(
                `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(value)}/json?limit=8`
            );
            if (!res.ok) throw new Error();
            const data = await res.json();
            const dicts = data?.dictionary_terms?.compound || [];
            const items: Suggestion[] = dicts.map((item: string) => ({
                name: item,
            }));
            setSuggestions(items);
            setShowSuggestions(true);
            setActiveSuggestionIndex(-1);
        } catch {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, []);

    // Debounce effect
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, fetchSuggestions]);

    const fetchSummary = async (cid: number) => {
        try {
            const res = await fetch(
                `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/IUPACName,MolecularFormula,MolecularWeight/JSON`
            );
            if (!res.ok) throw new Error();
            const data = await res.json();
            const props = data?.PropertyTable?.Properties?.[0];
            if (props) {
                setMoleculeData({
                    iupacName: props.IUPACName || "N/A",
                    molecularFormula: props.MolecularFormula || "N/A",
                    molecularWeight: props.MolecularWeight
                        ? `${Number(props.MolecularWeight).toFixed(2)} g/mol`
                        : "N/A",
                });
            }
        } catch {
            // silently fail
        }
    };

    const fetchAndRender = async (searchTerm: string) => {
        if (!searchTerm.trim() || !$3Dmol) return;
        setLoading(true);
        setError(null);
        setMoleculeData(null);
        setShowSuggestions(false);

        try {
            // Get CID
            const cidRes = await fetch(
                `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(searchTerm)}/cids/JSON`
            );
            if (!cidRes.ok) throw new Error("Compound not found. Check spelling or try a SMILES string.");
            const cidData = await cidRes.json();
            const cid = cidData?.IdentifierList?.CID?.[0];
            if (!cid) throw new Error("No CID found.");

            // Fetch 3D SDF
            const sdfRes = await fetch(
                `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`
            );
            if (!sdfRes.ok) throw new Error("3D structure not available for this compound.");
            const sdfText = await sdfRes.text();

            // Render with 3Dmol
            if (viewerRef.current) {
                if (viewerInstance.current) {
                    viewerInstance.current.clear();
                }
                viewerRef.current.innerHTML = "";

                const viewer = $3Dmol.createViewer(viewerRef.current, {
                    backgroundColor: "white",
                    antialias: true,
                });
                viewer.addModel(sdfText, "sdf");
                viewer.setStyle({}, getStyleParamsObj(style));
                viewer.zoomTo();
                viewer.render();
                viewerInstance.current = viewer;
            }

            fetchSummary(cid);
        } catch (err: any) {
            setError(err.message || "Failed to load molecule.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAndRender(query);
    };

    // Select suggestion
    const selectSuggestion = (name: string) => {
        setQuery(name);
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        fetchAndRender(name);
    };

    // Keyboard handler for suggestions
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveSuggestionIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveSuggestionIndex((prev) =>
                prev > 0 ? prev - 1 : suggestions.length - 1
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
                selectSuggestion(suggestions[activeSuggestionIndex].name);
            } else {
                handleSubmit(e as any);
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
            setActiveSuggestionIndex(-1);
        }
    };

    const exportImage = () => {
        if (!viewerInstance.current) return;
        setExporting(true);
        try {
            const uri = viewerInstance.current.pngURI();
            const link = document.createElement("a");
            link.href = uri;
            link.download = `molecule-${query || "structure"}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 space-y-4 sm:space-y-6">
            {/* Search bar */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 relative">
                <div className="relative flex-1">
                    <FlaskConical
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                        size={18}
                    />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        onBlur={() => {
                            setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. Aspirin, C9H8O4, or a SMILES..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-xl text-sm text-gray-900 outline-none transition"
                    />

                    {/* Autocomplete dropdown */}
                    <AnimatePresence>
                        {showSuggestions && suggestions.length > 0 && (
                            <motion.ul
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20"
                            >
                                {suggestions.map((s, idx) => (
                                    <li
                                        key={s.name}
                                        onMouseDown={() => selectSuggestion(s.name)}
                                        className={`px-4 py-2.5 text-sm flex items-center gap-2 cursor-pointer transition-colors ${idx === activeSuggestionIndex
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                            }`}
                                    >
                                        <FlaskConical size={14} className="text-gray-400 shrink-0" />
                                        <span className="truncate">{s.name}</span>
                                    </li>
                                ))}
                            </motion.ul>
                        )}
                    </AnimatePresence>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !$3Dmol}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <Search size={18} />
                    )}
                    {loading ? "Loading..." : "View"}
                </motion.button>
            </form>

            {/* Error message */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600"
                >
                    {error}
                </motion.div>
            )}

            {/* Main viewer + details grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* 3D Viewer */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                    <div className="relative h-[300px] sm:h-[400px] lg:h-[450px]">
                        <div ref={viewerRef} className="w-full h-full" />
                        {!viewerInstance.current && !loading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none">
                                <FlaskConical size={48} className="mb-3 opacity-40" />
                                <p className="text-sm font-medium text-center px-4">
                                    Enter a molecule name to see its 3D structure
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Style toggles + export */}
                    <div className="p-3 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1">
                            {STYLES.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${style === s
                                            ? "bg-gradient-to-r from-blue-600 to-green-500 text-white shadow-sm"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    <Eye size={12} className="inline mr-1" />
                                    {STYLE_LABELS[s]}
                                </button>
                            ))}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={exportImage}
                            disabled={!viewerInstance.current || exporting}
                            className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-1"
                        >
                            <Download size={12} />
                            {exporting ? "Exporting..." : "Export PNG"}
                        </motion.button>
                    </div>
                </div>

                {/* Molecular Details Sidebar */}
                <div className="space-y-4">
                    {moleculeData ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
                        >
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                                <FileText size={16} className="text-blue-600" />
                                Molecular Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <Atom size={14} className="text-green-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">
                                            IUPAC Name
                                        </p>
                                        <p className="text-sm text-gray-900 break-words">
                                            {moleculeData.iupacName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <FlaskConical size={14} className="text-blue-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">
                                            Formula
                                        </p>
                                        <p className="text-sm font-mono text-gray-900">
                                            {moleculeData.molecularFormula}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Weight size={14} className="text-purple-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">
                                            Weight
                                        </p>
                                        <p className="text-sm text-gray-900">
                                            {moleculeData.molecularWeight}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        viewerInstance.current && (
                            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm text-center">
                                <Loader2 className="animate-spin mx-auto text-blue-600" size={20} />
                                <p className="text-xs text-gray-400 mt-2">Fetching details…</p>
                            </div>
                        )
                    )}

                    {/* Quick tips */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4 text-xs text-amber-700">
                        <strong>Pro tip:</strong> You can also enter a SMILES string, PubChem CID, or drug name. Rotate with mouse drag, zoom with scroll wheel.
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-400 text-center pb-6 lg:pb-0">
                Powered by PubChem · Drag to rotate, scroll to zoom
            </p>
        </div>
    );
}