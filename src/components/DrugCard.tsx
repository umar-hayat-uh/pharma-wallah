'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Pill, FlaskConical, Activity, FileText, Link as LinkIcon, Calendar, Tag, AlertCircle } from 'lucide-react';

interface DrugCardProps {
    drug: {
        drugbank_ids: { id: string }[];
        name: string;
        description: string;
        cas_number?: string;
        unii: string;
        drug_type: string;
        created?: string;
        updated?: string;
        physical_chemical_properties?: {
            state?: string;
            experimental_properties?: Array<{
                kind?: string;
                value?: string;
                source?: string;
            }>;
        };
        pharmacokinetics?: {
            absorption?: string;
            half_life?: string;
            protein_binding?: string;
            route_of_elimination?: string;
            volume_of_distribution?: string;
            clearance?: string;
            metabolism?: string;
        };
        pharmacodynamics?: {
            indication?: string;
            pharmacodynamics?: string;
            mechanism_of_action?: string;
            toxicity?: string;
        };
        interactions?: Record<string, any>;
        classification?: {
            direct_parent: string;
            kingdom: string;
            superclass?: string;
            class?: string;
            subclass?: string;
        };
        groups?: string[];
        salts?: Array<{
            name?: string;
            unii?: string;
        }>;
        synonyms?: { name: string }[];
        general_references?: {
            articles?: Array<{
                citation?: string;
                pmid?: string;
                doi?: string;
            }>;
            links?: Array<{
                title?: string;
                url?: string;
            }>;
        };
    };
}

export default function DrugCard({ drug }: DrugCardProps) {
    const [expandedSections, setExpandedSections] = useState({
        details: false,
        physical: false,
        pharmacokinetics: false,
        pharmacodynamics: false,
        classification: false,
        references: false,
        synonyms: false
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const drugTypeColors: Record<string, string> = {
        biotech: 'bg-purple-100 text-purple-800',
        small_molecule: 'bg-blue-100 text-blue-800',
        nutraceutical: 'bg-green-100 text-green-800',
        approved: 'bg-emerald-100 text-emerald-800',
        investigational: 'bg-amber-100 text-amber-800',
        experimental: 'bg-orange-100 text-orange-800',
        withdrawn: 'bg-red-100 text-red-800',
        illicit: 'bg-gray-100 text-gray-800'
    };

    const getDrugTypeColor = (type: string) => {
        return drugTypeColors[type] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <Pill className="w-6 h-6" />
                            <h2 className="text-3xl font-bold">{drug.name}</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getDrugTypeColor(drug.drug_type)}`}>
                                {drug.drug_type.replace('_', ' ').toUpperCase()}
                            </span>
                            {drug.groups?.map((group, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium"
                                >
                                    {group}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-blue-200 mb-1">UNII</div>
                        <div className="font-mono text-lg font-bold bg-white/10 px-3 py-1 rounded-lg">
                            {drug.unii}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Quick Info Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Tag className="w-4 h-4" />
                            <span className="font-semibold">DrugBank ID:</span>
                        </div>
                        <div className="font-mono text-gray-800 bg-white px-3 py-1 rounded border">
                            {drug.drugbank_ids?.[0]?.id || 'N/A'}
                        </div>
                    </div>

                    {drug.cas_number && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FlaskConical className="w-4 h-4" />
                                <span className="font-semibold">CAS Number:</span>
                            </div>
                            <div className="font-mono text-gray-800 bg-white px-3 py-1 rounded border">
                                {drug.cas_number}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="font-semibold">Last Updated:</span>
                        </div>
                        <div className="text-gray-800 bg-white px-3 py-1 rounded border">
                            {formatDate(drug.updated)}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                        {drug.description}
                    </p>
                </div>

                {/* Expandable Sections */}
                <div className="space-y-4">
                    {/* Physical & Chemical Properties */}
                    {drug.physical_chemical_properties && (
                        <div className="border rounded-xl overflow-hidden">
                            <button
                                onClick={() => toggleSection('physical')}
                                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FlaskConical className="w-5 h-5 text-purple-600" />
                                    <h3 className="text-lg font-semibold text-gray-800">Physical & Chemical Properties</h3>
                                </div>
                                {expandedSections.physical ? (
                                    <ChevronUp className="w-5 h-5 text-purple-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-purple-600" />
                                )}
                            </button>
                            {expandedSections.physical && (
                                <div className="p-6 bg-white">
                                    <div className="space-y-4">
                                        {drug.physical_chemical_properties.state && (
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2">State</h4>
                                                <div className="px-3 py-2 bg-gray-100 rounded-lg">
                                                    {drug.physical_chemical_properties.state}
                                                </div>
                                            </div>
                                        )}
                                        {drug.physical_chemical_properties.experimental_properties && (
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2">Experimental Properties</h4>
                                                <div className="space-y-3">
                                                    {drug.physical_chemical_properties.experimental_properties.map((prop, idx) => (
                                                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                                                            {prop.kind && (
                                                                <div className="font-medium text-gray-800">{prop.kind}</div>
                                                            )}
                                                            {prop.value && (
                                                                <div className="text-gray-600 mt-1">{prop.value}</div>
                                                            )}
                                                            {prop.source && (
                                                                <div className="text-sm text-gray-500 mt-2">Source: {prop.source}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pharmacokinetics */}
                    {drug.pharmacokinetics && (
                        <div className="border rounded-xl overflow-hidden">
                            <button
                                onClick={() => toggleSection('pharmacokinetics')}
                                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-emerald-600" />
                                    <h3 className="text-lg font-semibold text-gray-800">Pharmacokinetics</h3>
                                </div>
                                {expandedSections.pharmacokinetics ? (
                                    <ChevronUp className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-emerald-600" />
                                )}
                            </button>
                            {expandedSections.pharmacokinetics && (
                                <div className="p-6 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(drug.pharmacokinetics).map(([key, value]) => (
                                            <div key={key} className="space-y-2">
                                                <h4 className="font-semibold text-gray-700 capitalize">
                                                    {key.replace('_', ' ')}
                                                </h4>
                                                <div className="text-gray-600 p-3 bg-gray-50 rounded-lg border">
                                                    {value || 'Not available'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pharmacodynamics */}
                    {drug.pharmacodynamics && (
                        <div className="border rounded-xl overflow-hidden">
                            <button
                                onClick={() => toggleSection('pharmacodynamics')}
                                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                    <h3 className="text-lg font-semibold text-gray-800">Pharmacodynamics</h3>
                                </div>
                                {expandedSections.pharmacodynamics ? (
                                    <ChevronUp className="w-5 h-5 text-amber-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-amber-600" />
                                )}
                            </button>
                            {expandedSections.pharmacodynamics && (
                                <div className="p-6 bg-white">
                                    <div className="space-y-4">
                                        {drug.pharmacodynamics.indication && (
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2">Indication</h4>
                                                <div className="text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                    {drug.pharmacodynamics.indication}
                                                </div>
                                            </div>
                                        )}
                                        {drug.pharmacodynamics.mechanism_of_action && (
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2">Mechanism of Action</h4>
                                                <div className="text-gray-600 p-3 bg-green-50 rounded-lg border border-green-100">
                                                    {drug.pharmacodynamics.mechanism_of_action}
                                                </div>
                                            </div>
                                        )}
                                        {drug.pharmacodynamics.toxicity && (
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-2">Toxicity</h4>
                                                <div className="text-gray-600 p-3 bg-red-50 rounded-lg border border-red-100">
                                                    {drug.pharmacodynamics.toxicity}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Classification */}
                    {drug.classification && (
                        <div className="border rounded-xl overflow-hidden">
                            <button
                                onClick={() => toggleSection('classification')}
                                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Tag className="w-5 h-5 text-blue-600" />
                                    <h3 className="text-lg font-semibold text-gray-800">Classification</h3>
                                </div>
                                {expandedSections.classification ? (
                                    <ChevronUp className="w-5 h-5 text-blue-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-blue-600" />
                                )}
                            </button>
                            {expandedSections.classification && (
                                <div className="p-6 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        {Object.entries(drug.classification).map(([key, value]) => (
                                            <div key={key} className="text-center p-4 bg-gradient-to-b from-white to-gray-50 rounded-lg border shadow-sm">
                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                    {key.replace('_', ' ')}
                                                </div>
                                                <div className="font-medium text-gray-800">
                                                    {value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Synonyms */}
                    {drug.synonyms && drug.synonyms.length > 0 && (
                        <div className="border rounded-xl overflow-hidden">
                            <button
                                onClick={() => toggleSection('synonyms')}
                                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Tag className="w-5 h-5 text-violet-600" />
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Synonyms ({drug.synonyms.length})
                                    </h3>
                                </div>
                                {expandedSections.synonyms ? (
                                    <ChevronUp className="w-5 h-5 text-violet-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-violet-600" />
                                )}
                            </button>
                            {expandedSections.synonyms && (
                                <div className="p-6 bg-white">
                                    <div className="flex flex-wrap gap-2">
                                        {drug.synonyms.map((synonym, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 rounded-lg font-medium border border-violet-200 hover:from-violet-200 hover:to-purple-200 transition-colors"
                                            >
                                                {synonym.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* General References */}
                    {drug.general_references && (
                        <div className="border rounded-xl overflow-hidden">
                            <button
                                onClick={() => toggleSection('references')}
                                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <LinkIcon className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold text-gray-800">References</h3>
                                </div>
                                {expandedSections.references ? (
                                    <ChevronUp className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                            {expandedSections.references && (
                                <div className="p-6 bg-white">
                                    <div className="space-y-4">
                                        {drug.general_references.articles && drug.general_references.articles.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-3">Articles</h4>
                                                <div className="space-y-3">
                                                    {drug.general_references.articles.slice(0, 3).map((article, idx) => (
                                                        <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                                                            {article.citation && (
                                                                <div className="text-gray-700">{article.citation}</div>
                                                            )}
                                                            {article.pmid && (
                                                                <div className="text-sm text-gray-600 mt-1">PMID: {article.pmid}</div>
                                                            )}
                                                            {article.doi && (
                                                                <div className="text-sm text-blue-600 mt-1">DOI: {article.doi}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {drug.general_references.links && drug.general_references.links.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-gray-700 mb-3">Links</h4>
                                                <div className="space-y-2">
                                                    {drug.general_references.links.slice(0, 3).map((link, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={link.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
                                                        >
                                                            <LinkIcon className="w-4 h-4 text-blue-600" />
                                                            <span className="text-blue-600 group-hover:text-blue-800 truncate">
                                                                {link.title || link.url}
                                                            </span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <span className="font-semibold">Created:</span>
                            <span>{formatDate(drug.created)}</span>
                        </div>
                        {drug.updated && (
                            <div className="flex items-center gap-1">
                                <span className="font-semibold">Updated:</span>
                                <span>{formatDate(drug.updated)}</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-2 md:mt-0">
                        <div className="text-right">
                            Source: DrugBank • Version 5.1
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}