/**
 * ClinicalTrials.gov API v2 client (NIH National Library of Medicine).
 * Free, no API key, no auth. JSON responses, cursor-based pagination.
 *
 * Base: https://clinicaltrials.gov/api/v2
 * Docs: https://clinicaltrials.gov/data-api/api
 */

const CTGOV_BASE = "https://clinicaltrials.gov/api/v2/studies";

export type TrialStatus =
    | "RECRUITING"
    | "COMPLETED"
    | "NOT_YET_RECRUITING"
    | "ACTIVE_NOT_RECRUITING"
    | "TERMINATED";

export interface ClinicalTrial {
    nctId: string;
    title: string;
    status: string;
    phase: string[];
    conditions: string[];
    sponsor: string;
    startDate: string;
    summary: string;
    locationCountries: string[];
    url: string;
}

export interface ClinicalTrialsSearchResult {
    query: string;
    totalCount: number;
    trials: ClinicalTrial[];
    nextPageToken: string | null;
}

const FIELDS = [
    "NCTId",
    "BriefTitle",
    "OverallStatus",
    "Phase",
    "Condition",
    "LeadSponsorName",
    "StartDate",
    "BriefSummary",
    "LocationCountry",
].join(",");

export async function searchClinicalTrials(
    query: string,
    opts: { status?: TrialStatus; pageSize?: number; pageToken?: string } = {}
): Promise<ClinicalTrialsSearchResult> {
    const params = new URLSearchParams({
        "query.term": query,
        fields: FIELDS,
        pageSize: String(opts.pageSize ?? 10),
        format: "json",
        countTotal: "true",
    });

    if (opts.status) params.set("filter.overallStatus", opts.status);
    if (opts.pageToken) params.set("pageToken", opts.pageToken);

    const res = await fetch(`${CTGOV_BASE}?${params}`);
    if (!res.ok) throw new Error(`ClinicalTrials.gov search failed: ${res.status}`);
    const json = await res.json();

    const studies = json?.studies ?? [];

    const trials: ClinicalTrial[] = studies.map((s: any) => {
        const proto = s.protocolSection ?? {};
        const ident = proto.identificationModule ?? {};
        const status = proto.statusModule ?? {};
        const design = proto.designModule ?? {};
        const conditions = proto.conditionsModule ?? {};
        const sponsor = proto.sponsorCollaboratorsModule ?? {};
        const description = proto.descriptionModule ?? {};
        const locations = proto.contactsLocationsModule?.locations ?? [];

        const countries: string[] = Array.from(
            new Set(locations.map((l: any) => l.country).filter(Boolean))
        );

        return {
            nctId: ident.nctId,
            title: ident.briefTitle || "Untitled study",
            status: status.overallStatus || "UNKNOWN",
            phase: design.phases || [],
            conditions: conditions.conditions || [],
            sponsor: sponsor.leadSponsor?.name || "",
            startDate: status.startDateStruct?.date || "",
            summary: description.briefSummary || "",
            locationCountries: countries,
            url: `https://clinicaltrials.gov/study/${ident.nctId}`,
        };
    });

    return {
        query,
        totalCount: json.totalCount ?? trials.length,
        trials,
        nextPageToken: json.nextPageToken ?? null,
    };
}