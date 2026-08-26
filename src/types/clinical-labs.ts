export type LabCategory =
  | "Hematology"
  | "Clinical Chemistry"
  | "Renal Function"
  | "Liver Function"
  | "Endocrinology"
  | "Cardiac"
  | "Electrolytes"
  | "Urinalysis"
  | "Immunology"
  | "Other";

export interface ClinicalLab {
  slug: string;
  name: string;
  shortName?: string;
  loinc: string;
  category: LabCategory;
  specimen: string;
  commonUnits: string[];
  description: string;
  clinicalUse: string;
  keywords: string[];
  medlinePlusUrl?: string;
}