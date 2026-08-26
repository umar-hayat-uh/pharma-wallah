export type ResourceSourceId =
    | "dailymed"
    | "pubmed"
    | "clinicaltrials"
    | "medlineplus";

export type AudienceType = "patient" | "clinician" | "researcher";

export interface ResourceSource {
    id: ResourceSourceId;
    name: string;
    tagline: string;
    description: string;
    audience: AudienceType[];
    previewImage: string;
    accentColor: string;
    apiRoute: string;
    externalUrl: string;
    provider: string;
}

export const RESOURCE_SOURCES: ResourceSource[] = [
    {
        id: "dailymed",
        name: "DailyMed",
        tagline: "Official drug labeling",
        description:
            "FDA-approved prescribing information, package inserts, and structured product labels for medications marketed in the U.S.",
        audience: ["clinician", "patient"],
        previewImage:
            "https://upload.wikimedia.org/wikipedia/commons/b/b9/DailyMedLogo.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
        accentColor: "#2563EB",
        apiRoute: "/api/clinical/dailymed",
        externalUrl: "https://dailymed.nlm.nih.gov",
        provider: "U.S. National Library of Medicine",
    },

    {
        id: "pubmed",
        name: "PubMed",
        tagline: "Biomedical research & evidence",
        description:
            "Search biomedical literature and abstracts spanning medicine, pharmacology, and life sciences.",
        audience: ["clinician", "researcher"],
        previewImage:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/US-NLM-PubMed-Logo.svg/960px-US-NLM-PubMed-Logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail",
        accentColor: "#0D9488",
        apiRoute: "/api/clinical/pubmed",
        externalUrl: "https://pubmed.ncbi.nlm.nih.gov",
        provider: "National Center for Biotechnology Information (NCBI)",
    },

    {
        id: "clinicaltrials",
        name: "ClinicalTrials.gov",
        tagline: "Active & completed trials",
        description:
            "Browse the global registry of clinical studies — recruitment status, phases, sponsors, and eligibility criteria.",
        audience: ["clinician", "researcher", "patient"],
        previewImage:
            "https://upload.wikimedia.org/wikipedia/commons/a/a6/NIH_2013_logo_vertical.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original",
        accentColor: "#7C3AED",
        apiRoute: "/api/clinical/clinicaltrials",
        externalUrl: "https://clinicaltrials.gov",
        provider: "U.S. National Library of Medicine",
    },

    {
        id: "medlineplus",
        name: "MedlinePlus",
        tagline: "Patient-friendly explanations",
        description:
            "Plain-language health topics, conditions, and treatment overviews written for patients and families, in English and Spanish.",
        audience: ["patient"],
        previewImage:
            "https://princetonlibrary.org/wp-content/uploads/2023/09/database-medline-plus-1024x549.webp",
        accentColor: "#DB2777",
        apiRoute: "/api/clinical/medlineplus",
        externalUrl: "https://medlineplus.gov",
        provider: "U.S. National Library of Medicine",
    },
];