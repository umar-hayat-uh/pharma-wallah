// components/DrugCard.tsx
"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Pill,
  FlaskConical,
  Activity,
  FileText,
  Link as LinkIcon,
  Calendar,
  Tag,
  AlertCircle,
  TestTube,
  Droplets,
  Brain,
  ShieldAlert,
  Scale,
  History,
  Cpu,
  AlertTriangle,
  Beaker,
  Utensils,
  AlertOctagon,
  GitCompare,
  Apple,
} from "lucide-react";

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
    status?: string;
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
    interactions?: {
      drug_interactions?: Array<{
        drugbank_id: string;
        name: string;
        description: string;
        type: string;
      }>;
      total_count?: number;
      food_interactions?: string[];
    };
    dosages?: {
      forms: string[];
      routes: string[];
      details: Array<{
        form?: string;
        route?: string;
        strength?: string;
      }>;
      total_forms?: number;
    };
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
    "general-references"?: {
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
    properties: false,
    pharmacokinetics: false,
    pharmacodynamics: false,
    classification: false,
    references: false,
    synonyms: false,
    drugInteractions: false,
    foodInteractions: false,
    dosages: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const drugTypeColors: Record<string, string> = {
    biotech: "bg-purple-100 text-purple-800",
    small_molecule: "bg-blue-100 text-blue-800",
    nutraceutical: "bg-green-100 text-green-800",
    approved: "bg-emerald-100 text-emerald-800",
    investigational: "bg-amber-100 text-amber-800",
    experimental: "bg-orange-100 text-orange-800",
    withdrawn: "bg-red-100 text-red-800",
    illicit: "bg-gray-100 text-gray-800",
  };

  const getDrugTypeColor = (type: string) => {
    return drugTypeColors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    const colors: Record<string, string> = {
      approved: "bg-green-100 text-green-800",
      investigational: "bg-yellow-100 text-yellow-800",
      withdrawn: "bg-red-100 text-red-800",
      experimental: "bg-purple-100 text-purple-800",
      nutraceutical: "bg-blue-100 text-blue-800",
      illicit: "bg-gray-100 text-gray-800",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const hasDrugInteractions =
    drug.interactions?.drug_interactions &&
    drug.interactions.drug_interactions.length > 0;
  const hasFoodInteractions =
    drug.interactions?.food_interactions &&
    drug.interactions.food_interactions.length > 0;

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
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getDrugTypeColor(drug.drug_type)}`}
              >
                {drug.drug_type.replace("_", " ").toUpperCase()}
              </span>
              {drug.status && (
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(drug.status)}`}
                >
                  {drug.status.toUpperCase()}
                </span>
              )}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tag className="w-4 h-4" />
              <span className="font-semibold">DrugBank ID:</span>
            </div>
            <div className="font-mono text-gray-800 bg-white px-3 py-1 rounded border">
              {drug.drugbank_ids?.[0]?.id || "N/A"}
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
              <History className="w-4 h-4" />
              <span className="font-semibold">Created:</span>
            </div>
            <div className="text-gray-800 bg-white px-3 py-1 rounded border">
              {formatDate(drug.created)}
            </div>
          </div>

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
                onClick={() => toggleSection("properties")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Physical & Chemical Properties
                  </h3>
                </div>
                {expandedSections.properties ? (
                  <ChevronUp className="w-5 h-5 text-purple-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-purple-600" />
                )}
              </button>
              {expandedSections.properties && (
                <div className="p-6 bg-white">
                  <div className="space-y-4">
                    {drug.physical_chemical_properties.state && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          State
                        </h4>
                        <div className="px-3 py-2 bg-gray-100 rounded-lg">
                          {drug.physical_chemical_properties.state}
                        </div>
                      </div>
                    )}
                    {drug.physical_chemical_properties
                      .experimental_properties && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Experimental Properties
                        </h4>
                        <div className="space-y-3">
                          {drug.physical_chemical_properties.experimental_properties.map(
                            (prop, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-gray-50 rounded-lg border"
                              >
                                {prop.kind && (
                                  <div className="font-medium text-gray-800">
                                    {prop.kind}
                                  </div>
                                )}
                                {prop.value && (
                                  <div className="text-gray-600 mt-1">
                                    {prop.value}
                                  </div>
                                )}
                                {prop.source && (
                                  <div className="text-sm text-gray-500 mt-2">
                                    Source: {prop.source}
                                  </div>
                                )}
                              </div>
                            ),
                          )}
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
                onClick={() => toggleSection("pharmacokinetics")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Pharmacokinetics
                  </h3>
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
                    {Object.entries(drug.pharmacokinetics).map(
                      ([key, value]) => (
                        <div key={key} className="space-y-2">
                          <h4 className="font-semibold text-gray-700 capitalize">
                            {key.replace("_", " ")}
                          </h4>
                          <div className="text-gray-600 p-3 bg-gray-50 rounded-lg border">
                            {value || "Not available"}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pharmacodynamics */}
          {drug.pharmacodynamics && (
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("pharmacodynamics")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Pharmacodynamics
                  </h3>
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
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Indication
                        </h4>
                        <div className="text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          {drug.pharmacodynamics.indication}
                        </div>
                      </div>
                    )}
                    {drug.pharmacodynamics.mechanism_of_action && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Mechanism of Action
                        </h4>
                        <div className="text-gray-600 p-3 bg-green-50 rounded-lg border border-green-100">
                          {drug.pharmacodynamics.mechanism_of_action}
                        </div>
                      </div>
                    )}
                    {drug.pharmacodynamics.toxicity && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Toxicity
                        </h4>
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

          {/* Drug-Drug Interactions */}
          {hasDrugInteractions && (
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("drugInteractions")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GitCompare className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Drug-Drug Interactions (
                    {drug.interactions!.drug_interactions!.length})
                  </h3>
                </div>
                {expandedSections.drugInteractions ? (
                  <ChevronUp className="w-5 h-5 text-red-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-red-600" />
                )}
              </button>
              {expandedSections.drugInteractions && (
                <div className="p-6 bg-white">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {drug
                        .interactions!.drug_interactions!.slice(0, 10)
                        .map((interaction, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-red-800">
                                  {interaction.name}
                                </div>
                                <div className="text-sm text-red-600 mt-1">
                                  {interaction.description}
                                </div>
                              </div>
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                {interaction.type.replace("drug-", "")}
                              </span>
                            </div>
                            {interaction.drugbank_id && (
                              <div className="text-xs text-red-500 mt-2">
                                DrugBank ID: {interaction.drugbank_id}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                    {drug.interactions!.drug_interactions!.length > 10 && (
                      <div className="text-center text-gray-500">
                        Showing 10 of{" "}
                        {drug.interactions!.drug_interactions!.length} drug
                        interactions
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Drug-Food Interactions */}
          {hasFoodInteractions && (
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("foodInteractions")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Drug-Food Interactions (
                    {drug.interactions!.food_interactions!.length})
                  </h3>
                </div>
                {expandedSections.foodInteractions ? (
                  <ChevronUp className="w-5 h-5 text-orange-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-orange-600" />
                )}
              </button>
              {expandedSections.foodInteractions && (
                <div className="p-6 bg-white">
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Apple className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-800 mb-2">
                            Important Note
                          </h4>
                          <p className="text-amber-700">
                            These interactions may affect drug absorption,
                            metabolism, or increase the risk of side effects.
                            Always consult with your healthcare provider about
                            food interactions.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {drug.interactions!.food_interactions!.map(
                        (interaction, idx) => (
                          <div
                            key={idx}
                            className="p-4 bg-orange-50 rounded-lg border border-orange-200"
                          >
                            <div className="flex items-start gap-3">
                              <AlertOctagon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                              <div className="text-gray-700">{interaction}</div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dosages */}
          {drug.dosages && (
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("dosages")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Dosage Forms ({drug.dosages.forms.length})
                  </h3>
                </div>
                {expandedSections.dosages ? (
                  <ChevronUp className="w-5 h-5 text-cyan-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-600" />
                )}
              </button>
              {expandedSections.dosages && (
                <div className="p-6 bg-white">
                  <div className="space-y-6">
                    {/* Routes */}
                    {drug.dosages.routes && drug.dosages.routes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Administration Routes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {drug.dosages.routes.map((route, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full font-medium"
                            >
                              {route}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Forms */}
                    {drug.dosages.forms && drug.dosages.forms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">
                          Available Forms
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {drug.dosages.forms.map((form, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-teal-50 border border-teal-200 rounded-lg"
                            >
                              <div className="font-medium text-teal-800">
                                {form}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detailed Information */}
                    {drug.dosages.details &&
                      drug.dosages.details.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">
                            Detailed Specifications
                          </h4>
                          <div className="space-y-3">
                            {drug.dosages.details.map((detail, idx) => (
                              <div
                                key={idx}
                                className="p-4 bg-gray-50 rounded-lg border"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {detail.form && (
                                    <div>
                                      <div className="text-sm text-gray-500">
                                        Form
                                      </div>
                                      <div className="font-medium">
                                        {detail.form}
                                      </div>
                                    </div>
                                  )}
                                  {detail.route && (
                                    <div>
                                      <div className="text-sm text-gray-500">
                                        Route
                                      </div>
                                      <div className="font-medium">
                                        {detail.route}
                                      </div>
                                    </div>
                                  )}
                                  {detail.strength && (
                                    <div>
                                      <div className="text-sm text-gray-500">
                                        Strength
                                      </div>
                                      <div className="font-medium">
                                        {detail.strength}
                                      </div>
                                    </div>
                                  )}
                                </div>
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

          {/* Classification */}
          {drug.classification && (
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("classification")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Classification
                  </h3>
                </div>
                {expandedSections.classification ? (
                  <ChevronUp className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                )}
              </button>
              {expandedSections.classification && (
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(drug.classification).map(([key, value]) => (
                      <div
                        key={key}
                        className="text-center p-4 bg-gradient-to-b from-white to-gray-50 rounded-lg border shadow-sm"
                      >
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          {key.replace("_", " ")}
                        </div>
                        <div className="font-medium text-gray-800">{value}</div>
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
                onClick={() => toggleSection("synonyms")}
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
          {drug["general-references"] && (
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("references")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    References
                  </h3>
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
                    {drug["general-references"].articles &&
                      drug["general-references"].articles.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">
                            Articles
                          </h4>
                          <div className="space-y-3">
                            {drug["general-references"].articles
                              .slice(0, 3)
                              .map((article, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-gray-50 rounded-lg border"
                                >
                                  {article.citation && (
                                    <div className="text-gray-700">
                                      {article.citation}
                                    </div>
                                  )}
                                  {article.pmid && (
                                    <div className="text-sm text-gray-600 mt-1">
                                      PMID: {article.pmid}
                                    </div>
                                  )}
                                  {article.doi && (
                                    <div className="text-sm text-blue-600 mt-1">
                                      DOI: {article.doi}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                    {drug["general-references"].links &&
                      drug["general-references"].links.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">
                            Links
                          </h4>
                          <div className="space-y-2">
                            {drug["general-references"].links
                              .slice(0, 3)
                              .map((link, idx) => (
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
          <div className="flex flex-wrap items-center gap-4">
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
            {(hasDrugInteractions || hasFoodInteractions) && (
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span className="font-semibold">Interactions:</span>
                <span>
                  {hasDrugInteractions &&
                    `${drug.interactions!.drug_interactions!.length} drug`}
                  {hasDrugInteractions && hasFoodInteractions && ", "}
                  {hasFoodInteractions &&
                    `${drug.interactions!.food_interactions!.length} food`}
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 md:mt-0">
            <div className="text-right">Source: DrugBank • Version 5.1</div>
          </div>
        </div>
      </div>
    </div>
  );
}
