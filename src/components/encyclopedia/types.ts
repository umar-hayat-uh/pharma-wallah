/*
 * The drug document as `/api/search` returns it (a DrugBank import in the
 * `pharmacopedia` Mongo database). Written against real records, 2026-09-13 —
 * every field is optional in practice: "Morphine glucuronide" has no
 * description, no products and no interactions; biotech drugs have no SMILES.
 * `src/types/drugs.ts` is older and narrower; it is left alone because the
 * clinical DrugSearch/DrugCard pair still imports it.
 */

export type Property = { kind?: string; value?: string; source?: string };

export type EncDrug = {
  _id?: string;
  drugbank_ids?: { id: string; primary?: boolean }[];
  name: string;
  smiles?: string;
  description?: string;
  drug_type?: string;
  status?: string;
  cas_number?: string;
  unii?: string;
  created?: string;
  updated?: string;
  properties?: {
    average_mass?: number;
    monoisotopic_mass?: number;
    state?: string;
    experimental_properties?: Property[];
    calculated_properties?: Property[];
  };
  pharmacokinetics?: Partial<
    Record<
      | "absorption"
      | "volume_of_distribution"
      | "protein_binding"
      | "metabolism"
      | "half_life"
      | "route_of_elimination"
      | "clearance",
      string
    >
  >;
  pharmacodynamics?: Partial<Record<"indication" | "pharmacodynamics" | "mechanism_of_action" | "toxicity", string>>;
  interactions?: {
    drug_interactions?: { drugbank_id: string; name: string; description: string; type?: string }[];
    total_count?: number;
    food_interactions?: string[];
  };
  classification?: {
    description?: string;
    kingdom?: string;
    superclass?: string;
    class?: string;
    subclass?: string;
    direct_parent?: string;
    alternative_parents?: string[];
    substituents?: string[];
  };
  synonyms?: { name: string; language?: string; coder?: string }[];
  "general-references"?: {
    articles?: { "ref-id"?: string; "pubmed-id"?: string; citation?: string }[];
    links?: { "ref-id"?: string; title?: string; url?: string }[];
  };
  products?: {
    name: string;
    labeller?: string;
    dosage_form?: string;
    strength?: string;
    route?: string;
    generic?: boolean;
    over_the_counter?: boolean;
    approved?: boolean;
    country?: string;
    started_marketing_on?: string | null;
    ended_marketing_on?: string | null;
  }[];
};

export type SearchPayload = {
  data: EncDrug[];
  total: number;
  page: number;
  totalPages: number;
};

/** The stable id a monograph is addressed by (URL `?drug=`). */
export function drugId(d: EncDrug): string {
  return d.drugbank_ids?.find((x) => x.primary)?.id ?? d.drugbank_ids?.[0]?.id ?? d.unii ?? d.name;
}
