import { GeographicType } from '@/types/amr';

export const WHO_REGIONS: Record<string, { name: string; short: string }> = {
    WPR: { name: 'Western Pacific Region (WHO)', short: 'WHO WPR' },
    EMR: { name: 'Eastern Mediterranean Region (WHO)', short: 'WHO EMR' },
    EUR: { name: 'European Region (WHO)', short: 'WHO EUR' },
    AMR: { name: 'Region of the Americas (WHO)', short: 'WHO PAHO/AMR' },
    AFR: { name: 'African Region (WHO)', short: 'WHO AFR' },
    SEAR: { name: 'South-East Asia Region (WHO)', short: 'WHO SEAR' },
    GLOBAL: { name: 'Global Aggregate (WHO)', short: 'WHO Global' },
};

export const COUNTRY_NAMES: Record<string, { name: string; flag: string }> = {
    PAK: { name: 'Pakistan', flag: '🇵🇰' },
    IND: { name: 'India', flag: '🇮🇳' },
    SAU: { name: 'Saudi Arabia', flag: '🇸🇦' },
    DEU: { name: 'Germany', flag: '🇩🇪' },
    GBR: { name: 'United Kingdom', flag: '🇬🇧' },
    USA: { name: 'United States', flag: '🇺🇸' },
    AUS: { name: 'Australia', flag: '🇦🇺' },
    JPN: { name: 'Japan', flag: '🇯🇵' },
    CAN: { name: 'Canada', flag: '🇨🇦' },
    FRA: { name: 'France', flag: '🇫🇷' },
    ITA: { name: 'Italy', flag: '🇮🇹' },
    ESP: { name: 'Spain', flag: '🇪🇸' },
    BRA: { name: 'Brazil', flag: '🇧🇷' },
    ZAF: { name: 'South Africa', flag: '🇿🇦' },
    EGY: { name: 'Egypt', flag: '🇪🇬' },
    IDN: { name: 'Indonesia', flag: '🇮🇩' },
    TUR: { name: 'Türkiye', flag: '🇹🇷' },
    IRN: { name: 'Iran', flag: '🇮🇷' },
    BGD: { name: 'Bangladesh', flag: '🇧🇩' },
    NGA: { name: 'Nigeria', flag: '🇳🇬' },
    CHN: { name: 'China', flag: '🇨🇳' },
    MEX: { name: 'Mexico', flag: '🇲🇽' },
    ARG: { name: 'Argentina', flag: '🇦🇷' },
    CHL: { name: 'Chile', flag: '🇨🇱' },
    COL: { name: 'Colombia', flag: '🇨🇴' },
    PHL: { name: 'Philippines', flag: '🇵🇭' },
    THA: { name: 'Thailand', flag: '🇹🇭' },
    VNM: { name: 'Viet Nam', flag: '🇻🇳' },
    MYS: { name: 'Malaysia', flag: '🇲🇾' },
    SGP: { name: 'Singapore', flag: '🇸🇬' },
    NZL: { name: 'New Zealand', flag: '🇳🇿' },
    NLD: { name: 'Netherlands', flag: '🇳🇱' },
    BEL: { name: 'Belgium', flag: '🇧🇪' },
    SWE: { name: 'Sweden', flag: '🇸🇪' },
    NOR: { name: 'Norway', flag: '🇳🇴' },
    DNK: { name: 'Denmark', flag: '🇩🇰' },
    FIN: { name: 'Finland', flag: '🇫🇮' },
    CHE: { name: 'Switzerland', flag: '🇨🇭' },
    AUT: { name: 'Austria', flag: '🇦🇹' },
    POL: { name: 'Poland', flag: '🇵🇱' },
    UKR: { name: 'Ukraine', flag: '🇺🇦' },
    ARE: { name: 'United Arab Emirates', flag: '🇦🇪' },
    QAT: { name: 'Qatar', flag: '🇶🇦' },
    KWT: { name: 'Kuwait', flag: '🇰🇼' },
    OMN: { name: 'Oman', flag: '🇴🇲' },
    BHR: { name: 'Bahrain', flag: '🇧🇭' },
    JOR: { name: 'Jordan', flag: '🇯🇴' },
    LBN: { name: 'Lebanon', flag: '🇱🇧' },
    IRQ: { name: 'Iraq', flag: '🇮🇶' },
    KOR: { name: 'Republic of Korea', flag: '🇰🇷' },
    KEN: { name: 'Kenya', flag: '🇰🇪' },
    ETH: { name: 'Ethiopia', flag: '🇪🇹' },
    GHA: { name: 'Ghana', flag: '🇬🇭' },
    UGA: { name: 'Uganda', flag: '🇺🇬' },
    TZA: { name: 'Tanzania', flag: '🇹🇿' },
    NPL: { name: 'Nepal', flag: '🇳🇵' },
    LKA: { name: 'Sri Lanka', flag: '🇱🇰' },
};

export function getGeographicClassification(code: string): {
    type: GeographicType;
    label: string;
    flag: string;
} {
    const normalized = code.trim().toUpperCase();

    if (normalized === 'GLOBAL') {
        return { type: 'GLOBAL', label: 'Global Aggregate (WHO)', flag: '🌐' };
    }

    if (WHO_REGIONS[normalized]) {
        return {
            type: 'REGION',
            label: WHO_REGIONS[normalized].name,
            flag: '🏛️',
        };
    }

    if (COUNTRY_NAMES[normalized]) {
        return {
            type: 'COUNTRY',
            label: COUNTRY_NAMES[normalized].name,
            flag: COUNTRY_NAMES[normalized].flag,
        };
    }

    return {
        type: 'COUNTRY',
        label: normalized,
        flag: '📍',
    };
}