export type GeographicType = 'COUNTRY' | 'REGION' | 'GLOBAL' | 'UNKNOWN';

export interface AMRRecord {
    id: number | string;
    year: number;
    country_iso3: string;
    geographic_type: GeographicType;
    country_m49?: string | null;
    specimen: string;
    pathogen: string;
    antibiotic: string;
    total_pathogen_isolates: number | null;
    interpretable_ast: number | null;
    resistant_count: number | null;
    susceptible_count: number | null;
    resistant_percent: number | null;
    resistant_percent_lower: number | null;
    resistant_percent_upper: number | null;
    isolates_per_million: number | null;
    above_75_percent: boolean | null;
    source: string;
    source_indicator: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface AMRFilters {
    country?: string;
    pathogen?: string;
    antibiotic?: string;
    specimen?: string;
    year?: number;
    includeRegions?: boolean;
    searchQuery?: string;
}

export interface AMRSummary {
    totalObservations: number;
    reportingEntitiesCount: number;
    pathogensCount: number;
    antibioticsCount: number;
    specimensCount: number;
    yearsAvailable: number[];
    reportedResistanceCount: number;
    unreportedResistanceCount: number;
    dataQualityScore: number; // 0 - 100 percentage
}

export interface AMRTrendPoint {
    year: number;
    observationCount: number;
    resistantPercent: number | null;
    interpretableAST: number | null;
    reportingEntities: number;
    isReported: boolean;
}

export interface AntibioticComparisonItem {
    antibiotic: string;
    observationCount: number;
    resistantPercent: number | null;
    interpretableAST: number | null;
    isReported: boolean;
}

export interface CountryComparisonItem {
    countryCode: string;
    countryName: string;
    geographicType: GeographicType;
    observationCount: number;
    resistantPercent: number | null;
    interpretableAST: number | null;
    isReported: boolean;
}

export interface PathogenProfileData {
    pathogen: string;
    totalObservations: number;
    reportingEntities: number;
    antibioticCount: number;
    specimenDistribution: { name: string; count: number; resistantPercent: number | null }[];
    antibioticDistribution: { name: string; count: number; resistantPercent: number | null }[];
    yearlyTrend: { year: number; count: number; resistantPercent: number | null }[];
}

export interface SpecimenAnalysisData {
    specimen: string;
    totalObservations: number;
    pathogensCount: number;
    antibioticsCount: number;
    topPathogens: { name: string; count: number; resistantPercent: number | null }[];
    yearlyTrend: { year: number; count: number }[];
}

export interface MatrixCell {
    pathogen: string;
    antibiotic: string;
    observationCount: number;
    resistantPercent: number | null;
    isReported: boolean;
}

export interface AMRMatrixData {
    pathogens: string[];
    antibiotics: string[];
    cells: MatrixCell[];
}

export interface AMRFilterOptions {
    countries: { code: string; name: string; type: GeographicType; count: number }[];
    pathogens: { name: string; count: number }[];
    antibiotics: { name: string; count: number }[];
    specimens: { name: string; count: number }[];
    years: number[];
}

export interface AMRAPIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    meta?: {
        total?: number;
        page?: number;
        pageSize?: number;
        timestamp: string;
        filtersApplied: AMRFilters;
    };
}