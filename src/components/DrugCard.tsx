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
  History,
  GitCompare,
  Utensils,
  Apple,
  AlertOctagon,
  Scale,
  Package,
  Building2,
  Globe,
  CheckCircle2,
  XCircle,
  ShieldAlert,
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
    products?: Array<{
      name: string;
      labeller: string;
      ndc_id: string | null;
      ndc_product_code: string | null;
      dosage_form: string;
      strength: string;
      route: string;
      fda_application_number: string | null;
      generic: boolean;
      over_the_counter: boolean;
      approved: boolean;
      country: string;
      source: string;
      started_marketing_on: string | null;
      ended_marketing_on: string | null;
    }>;
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
    products: false,
  });

  // State for "show all" in drug interactions
  const [showAllDrugInteractions, setShowAllDrugInteractions] = useState(false);

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
  const hasProducts = drug.products && drug.products.length > 0;

  // Determine which interactions to display
  const drugInteractionsList = drug.interactions?.drug_interactions || [];
  const displayedInteractions = showAllDrugInteractions
    ? drugInteractionsList
    : drugInteractionsList.slice(0, 10);
  const hasMoreInteractions = drugInteractionsList.length > 10;

  return (
    // Full width with maximum width, reduced padding on smallest screens
    <div className="w-full max-w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Pill className="w-6 h-6 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-bold break-words">{drug.name}</h2>
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
          <div className="text-right flex-shrink-0">
            <div className="text-sm text-blue-200 mb-1">UNII</div>
            <div className="font-mono text-lg font-bold bg-white/10 px-3 py-1 rounded-lg break-all">
              {drug.unii}
            </div>
          </div>
        </div>
      </div>

      {/* Reduced padding on mobile: p-3 on smallest, p-4 on sm, p-6 on larger */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Quick Info Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tag className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold truncate">DrugBank ID:</span>
            </div>
            <div className="font-mono text-gray-800 bg-white px-3 py-1 rounded border break-words">
              {drug.drugbank_ids?.[0]?.id || "N/A"}
            </div>
          </div>

          {drug.cas_number && (
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FlaskConical className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold truncate">CAS Number:</span>
              </div>
              <div className="font-mono text-gray-800 bg-white px-3 py-1 rounded border break-words">
                {drug.cas_number}
              </div>
            </div>
          )}

          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <History className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold truncate">Created:</span>
            </div>
            <div className="text-gray-800 bg-white px-3 py-1 rounded border break-words">
              {formatDate(drug.created)}
            </div>
          </div>

          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold truncate">Last Updated:</span>
            </div>
            <div className="text-gray-800 bg-white px-3 py-1 rounded border break-words">
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
          <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100 break-words">
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
                <div className="flex items-center gap-3 min-w-0">
                  <FlaskConical className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    Physical & Chemical Properties
                  </h3>
                </div>
                {expandedSections.properties ? (
                  <ChevronUp className="w-5 h-5 text-purple-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-purple-600 flex-shrink-0" />
                )}
              </button>
              {expandedSections.properties && (
                <div className="p-4 sm:p-6 bg-white">
                  <div className="space-y-4">
                    {drug.physical_chemical_properties.state && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">State</h4>
                        <div className="px-3 py-2 bg-gray-100 rounded-lg break-words">
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
                                <div className="font-medium text-gray-800 break-words">{prop.kind}</div>
                              )}
                              {prop.value && (
                                <div className="text-gray-600 mt-1 break-words">{prop.value}</div>
                              )}
                              {prop.source && (
                                <div className="text-sm text-gray-500 mt-2 break-words">Source: {prop.source}</div>
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
                onClick={() => toggleSection("pharmacokinetics")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Activity className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">Pharmacokinetics</h3>
                </div>
                {expandedSections.pharmacokinetics ? (
                  <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                )}
              </button>
              {expandedSections.pharmacokinetics && (
                <div className="p-4 sm:p-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(drug.pharmacokinetics).map(([key, value]) => (
                      <div key={key} className="space-y-2 min-w-0">
                        <h4 className="font-semibold text-gray-700 capitalize break-words">
                          {key.replace("_", " ")}
                        </h4>
                        <div className="text-gray-600 p-3 bg-gray-50 rounded-lg border break-words">
                          {value || "Not available"}
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
                onClick={() => toggleSection("pharmacodynamics")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">Pharmacodynamics</h3>
                </div>
                {expandedSections.pharmacodynamics ? (
                  <ChevronUp className="w-5 h-5 text-amber-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-amber-600 flex-shrink-0" />
                )}
              </button>
              {expandedSections.pharmacodynamics && (
                <div className="p-4 sm:p-6 bg-white">
                  <div className="space-y-4">
                    {drug.pharmacodynamics.indication && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Indication</h4>
                        <div className="text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-100 break-words">
                          {drug.pharmacodynamics.indication}
                        </div>
                      </div>
                    )}
                    {drug.pharmacodynamics.mechanism_of_action && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Mechanism of Action</h4>
                        <div className="text-gray-600 p-3 bg-green-50 rounded-lg border border-green-100 break-words">
                          {drug.pharmacodynamics.mechanism_of_action}
                        </div>
                      </div>
                    )}
                    {drug.pharmacodynamics.toxicity && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Toxicity</h4>
                        <div className="text-gray-600 p-3 bg-red-50 rounded-lg border border-red-100 break-words">
                          {drug.pharmacodynamics.toxicity}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Products Section */}
          {hasProducts && (
            <div className="border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection("products")}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Package className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    Products ({drug.products!.length})
                  </h3>
                </div>
                {expandedSections.products ? (
                  <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                )}
              </button>
              {expandedSections.products && (
                <div className="p-4 sm:p-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {drug.products!.map((product, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-gradient-to-br from-white to-indigo-50 border border-indigo-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Product header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="min-w-0">
                            <div className="font-bold text-gray-800 break-words">{product.name}</div>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <Building2 className="w-3 h-3 flex-shrink-0" />
                              <span className="break-words">{product.labeller}</span>
                            </div>
                          </div>
                          {product.approved ? (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex-shrink-0">
                              <XCircle className="w-3 h-3 mr-1" />
                              Unapproved
                            </span>
                          )}
                        </div>

                        {/* Dosage & route */}
                        <div className="space-y-2 text-sm">
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md break-words">
                              {product.dosage_form}
                            </span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md break-words">
                              {product.strength}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md break-words">
                              {product.route}
                            </span>
                          </div>

                          {/* Country & source */}
                          <div className="flex items-center gap-3 text-gray-600 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Globe className="w-3 h-3 flex-shrink-0" />
                              <span className="break-words">{product.country}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full break-words">
                                {product.source}
                              </span>
                            </div>
                          </div>

                          {/* Marketing dates */}
                          <div className="text-xs text-gray-500 border-t border-indigo-100 pt-2 mt-2">
                            {product.started_marketing_on && (
                              <div className="break-words">
                                <span className="font-medium">Started:</span>{" "}
                                {formatDate(product.started_marketing_on)}
                              </div>
                            )}
                            {product.ended_marketing_on && (
                              <div className="break-words">
                                <span className="font-medium">Ended:</span>{" "}
                                {formatDate(product.ended_marketing_on)}
                              </div>
                            )}
                          </div>

                          {/* Flags */}
                          <div className="flex gap-2 text-xs flex-wrap">
                            {product.generic && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">Generic</span>
                            )}
                            {product.over_the_counter && (
                              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">OTC</span>
                            )}
                          </div>

                          {/* NDC / FDA numbers */}
                          {(product.ndc_product_code || product.fda_application_number) && (
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
                              {product.ndc_product_code && (
                                <div className="break-words">NDC: {product.ndc_product_code}</div>
                              )}
                              {product.fda_application_number && (
                                <div className="break-words">FDA App#: {product.fda_application_number}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
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
                <div className="flex items-center gap-3 min-w-0">
                  <GitCompare className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    Drug-Drug Interactions ({drugInteractionsList.length})
                  </h3>
                </div>
                {expandedSections.drugInteractions ? (
                  <ChevronUp className="w-5 h-5 text-red-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </button>
              {expandedSections.drugInteractions && (
                <div className="p-4 sm:p-6 bg-white">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {displayedInteractions.map((interaction, idx) => (
                        <div
                          key={idx}
                          className="p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-semibold text-red-800 break-words">{interaction.name}</div>
                              <div className="text-sm text-red-600 mt-1 break-words">{interaction.description}</div>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full flex-shrink-0">
                              {interaction.type.replace("drug-", "")}
                            </span>
                          </div>
                          {interaction.drugbank_id && (
                            <div className="text-xs text-red-500 mt-2 break-words">DrugBank ID: {interaction.drugbank_id}</div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Show more/less button */}
                    {hasMoreInteractions && (
                      <div className="flex justify-center">
                        <button
                          onClick={() => setShowAllDrugInteractions(!showAllDrugInteractions)}
                          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                        >
                          {showAllDrugInteractions
                            ? "Show less"
                            : `Show all ${drugInteractionsList.length} interactions`}
                        </button>
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
                <div className="flex items-center gap-3 min-w-0">
                  <Utensils className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    Drug-Food Interactions ({drug.interactions!.food_interactions!.length})
                  </h3>
                </div>
                {expandedSections.foodInteractions ? (
                  <ChevronUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-orange-600 flex-shrink-0" />
                )}
              </button>
              {expandedSections.foodInteractions && (
                <div className="p-4 sm:p-6 bg-white">
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <Apple className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-amber-800 mb-2">Important Note</h4>
                          <p className="text-amber-700 break-words">
                            These interactions may affect drug absorption, metabolism, or increase the risk of side
                            effects. Always consult with your healthcare provider about food interactions.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {drug.interactions!.food_interactions!.map((interaction, idx) => (
                        <div key={idx} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="flex items-start gap-3">
                            <AlertOctagon className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div className="text-gray-700 break-words">{interaction}</div>
                          </div>
                        </div>
                      ))}
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
                <div className="flex items-center gap-3 min-w-0">
                  <Scale className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    Dosage Forms ({drug.dosages.forms.length})
                  </h3>
                </div>
                {expandedSections.dosages ? (
                  <ChevronUp className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                )}
              </button>
              {expandedSections.dosages && (
                <div className="p-4 sm:p-6 bg-white">
                  <div className="space-y-6">
                    {drug.dosages.routes && drug.dosages.routes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Administration Routes</h4>
                        <div className="flex flex-wrap gap-2">
                          {drug.dosages.routes.map((route, idx) => (
                            <span key={idx} className="px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full font-medium break-words">
                              {route}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {drug.dosages.forms && drug.dosages.forms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Available Forms</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {drug.dosages.forms.map((form, idx) => (
                            <div key={idx} className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                              <div className="font-medium text-teal-800 break-words">{form}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {drug.dosages.details && drug.dosages.details.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Detailed Specifications</h4>
                        <div className="space-y-3">
                          {drug.dosages.details.map((detail, idx) => (
                            <div key={idx} className="p-4 bg-gray-50 rounded-lg border">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {detail.form && (
                                  <div className="min-w-0">
                                    <div className="text-sm text-gray-500">Form</div>
                                    <div className="font-medium break-words">{detail.form}</div>
                                  </div>
                                )}
                                {detail.route && (
                                  <div className="min-w-0">
                                    <div className="text-sm text-gray-500">Route</div>
                                    <div className="font-medium break-words">{detail.route}</div>
                                  </div>
                                )}
                                {detail.strength && (
                                  <div className="min-w-0">
                                    <div className="text-sm text-gray-500">Strength</div>
                                    <div className="font-medium break-words">{detail.strength}</div>
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
                <div className="flex items-center gap-3 min-w-0">
                  <Tag className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">Classification</h3>
                </div>
                {expandedSections.classification ? (
                  <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-600 flex-shrink-0" />
                )}
              </button>
              {expandedSections.classification && (
                <div className="p-4 sm:p-6 bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(drug.classification).map(([key, value]) => (
                      <div key={key} className="text-center p-4 bg-gradient-to-b from-white to-gray-50 rounded-lg border shadow-sm">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 break-words">
                          {key.replace("_", " ")}
                        </div>
                        <div className="font-medium text-gray-800 break-words">{value}</div>
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
                <div className="flex items-center gap-3 min-w-0">
                  <Tag className="w-5 h-5 text-violet-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">Synonyms ({drug.synonyms.length})</h3>
                </div>
                {expandedSections.synonyms ? (
                  <ChevronUp className="w-5 h-5 text-violet-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-violet-600 flex-shrink-0" />
                )}
              </button>
              {expandedSections.synonyms && (
                <div className="p-4 sm:p-6 bg-white">
                  <div className="flex flex-wrap gap-2">
                    {drug.synonyms.map((synonym, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-800 rounded-lg font-medium border border-violet-200 hover:from-violet-200 hover:to-purple-200 transition-colors break-words"
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
                <div className="flex items-center gap-3 min-w-0">
                  <LinkIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-800 truncate">References</h3>
                </div>
                {expandedSections.references ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                )}
              </button>
              {expandedSections.references && (
                <div className="p-4 sm:p-6 bg-white">
                  <div className="space-y-4">
                    {drug["general-references"].articles && drug["general-references"].articles.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Articles</h4>
                        <div className="space-y-3">
                          {drug["general-references"].articles.slice(0, 3).map((article, idx) => (
                            <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                              {article.citation && <div className="text-gray-700 break-words">{article.citation}</div>}
                              {article.pmid && <div className="text-sm text-gray-600 mt-1 break-words">PMID: {article.pmid}</div>}
                              {article.doi && <div className="text-sm text-blue-600 mt-1 break-words">DOI: {article.doi}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {drug["general-references"].links && drug["general-references"].links.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3">Links</h4>
                        <div className="space-y-2">
                          {drug["general-references"].links.slice(0, 3).map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
                            >
                              <LinkIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-blue-600 group-hover:text-blue-800 truncate">{link.title || link.url}</span>
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
      <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-500">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="font-semibold">Created:</span>
              <span className="break-words">{formatDate(drug.created)}</span>
            </div>
            {drug.updated && (
              <div className="flex items-center gap-1">
                <span className="font-semibold">Updated:</span>
                <span className="break-words">{formatDate(drug.updated)}</span>
              </div>
            )}
            {(hasDrugInteractions || hasFoodInteractions) && (
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">Interactions:</span>
                <span className="break-words">
                  {hasDrugInteractions && `${drug.interactions!.drug_interactions!.length} drug`}
                  {hasDrugInteractions && hasFoodInteractions && ", "}
                  {hasFoodInteractions && `${drug.interactions!.food_interactions!.length} food`}
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 md:mt-0">
            <div className="text-right break-words">Source: DrugBank • Version 5.1</div>
          </div>
        </div>
      </div>
    </div>
  );
}