// types/drug.ts
export type Drug = {
  drugbank_ids: { id: string; primary: boolean }[];
  name: string;
  description: string;
  cas_number?: string;
  unii: string;
  drug_type: string;
  created?: string;
  updated?: string;
  properties?: {
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
  synonyms?: Array<{
    name: string;
    language?: string;
    coder?: string;
  }>;
  "general-references"?: {
    articles?: Array<{
      "ref-id"?: string;
      "pubmed-id"?: string;
      citation?: string;
    }>;
    textbooks?: any[];
    links?: Array<{
      "ref-id"?: string;
      title?: string;
      url?: string;
    }>;
    attachments?: any[];
  };
};

export interface AutocompleteItem {
  name: string;
  unii: string;
  drug_type: string;
  drugbank_id?: string;
}