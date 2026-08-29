import { AMRFilters, AMRRecord } from '@/types/amr';
import { getGeographicClassification } from './constants';

export function formatResistanceValue(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return 'Not reported';
    }
    return `${value.toFixed(1)}%`;
}

export function formatIsolates(count: number | null | undefined): string {
    if (count === null || count === undefined) {
        return 'Not reported';
    }
    return new Intl.NumberFormat('en-US').format(count);
}

export function buildAMRQueryString(filters: AMRFilters, view?: string): string {
    const params = new URLSearchParams();
    if (filters.country) params.set('country', filters.country);
    if (filters.pathogen) params.set('pathogen', filters.pathogen);
    if (filters.antibiotic) params.set('antibiotic', filters.antibiotic);
    if (filters.specimen) params.set('specimen', filters.specimen);
    if (filters.year) params.set('year', filters.year.toString());
    if (filters.includeRegions) params.set('includeRegions', 'true');
    if (filters.searchQuery) params.set('q', filters.searchQuery);
    if (view) params.set('view', view);
    return params.toString();
}

export function parseAMRQueryParams(searchParams: URLSearchParams | Record<string, string | string[] | undefined>): AMRFilters {
    const getParam = (key: string): string | undefined => {
        if (searchParams instanceof URLSearchParams) {
            return searchParams.get(key) || undefined;
        }
        const val = searchParams[key];
        return Array.isArray(val) ? val[0] : val;
    };

    const yearStr = getParam('year');
    const year = yearStr ? parseInt(yearStr, 10) : undefined;

    return {
        country: getParam('country'),
        pathogen: getParam('pathogen'),
        antibiotic: getParam('antibiotic'),
        specimen: getParam('specimen'),
        year: !isNaN(year as number) ? year : undefined,
        includeRegions: getParam('includeRegions') === 'true',
        searchQuery: getParam('q'),
    };
}

export function exportAMRDataToCSV(data: AMRRecord[], filename = 'amr_surveillance_export.csv'): void {
    const headers = [
        'Year',
        'Country Code',
        'Country / Region Name',
        'Geographic Type',
        'Pathogen',
        'Antibiotic',
        'Specimen',
        'Reported Resistance %',
        'CI Lower %',
        'CI Upper %',
        'Interpretable AST',
        'Total Isolates',
        'Source',
        'Source Indicator',
    ];

    const rows = data.map((record) => {
        const geo = getGeographicClassification(record.country_iso3);
        return [
            record.year,
            record.country_iso3,
            `"${geo.label}"`,
            record.geographic_type,
            `"${record.pathogen}"`,
            `"${record.antibiotic}"`,
            `"${record.specimen}"`,
            record.resistant_percent !== null ? record.resistant_percent : 'Not reported',
            record.resistant_percent_lower !== null ? record.resistant_percent_lower : '',
            record.resistant_percent_upper !== null ? record.resistant_percent_upper : '',
            record.interpretable_ast !== null ? record.interpretable_ast : 'Not reported',
            record.total_pathogen_isolates !== null ? record.total_pathogen_isolates : 'Not reported',
            `"${record.source}"`,
            `"${record.source_indicator || ''}"`,
        ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportAMRDataToJSON(data: AMRRecord[], filename = 'amr_surveillance_export.json'): void {
    const exportPayload = {
        metadata: {
            generatedAt: new Date().toISOString(),
            source: 'WHO GLASS (Global Antimicrobial Resistance and Use Surveillance System)',
            platform: 'PharmaWallah Clinical AMR Intelligence',
            totalRecords: data.length,
            disclaimer: 'Surveillance data only. Not a clinical treatment recommendation.',
        },
        observations: data,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}