// src/app/clinical/resources/[source]/page.tsx
import { notFound } from "next/navigation";
import { RESOURCE_SOURCES, ResourceSourceId } from "@/types/clinical-resources";
import ClinicalResourceSearch from "@/components/Clinical/ClinicalResourceSearch";
import DailyMedResourceView from "@/components/Clinical/DailyMedResourceView";

interface PageProps {
    params: Promise<{ source: string }> | { source: string };
}

export default async function ResourceSourcePage({ params }: PageProps) {
    const { source } = await params;

    const isValid = RESOURCE_SOURCES.some((s) => s.id === source);
    if (!isValid) {
        notFound();
    }

    const sourceId = source as ResourceSourceId;

    // DailyMed uses a dedicated autocomplete-driven flow because DailyMed's
    // /spls.json requires an EXACT drug name match — a plain free-text
    // search box against it returns 0 results for almost everything. The
    // dedicated component drives a name-suggestion dropdown first, then
    // looks up the exact selected name. The other three sources (PubMed,
    // ClinicalTrials.gov, MedlinePlus) support real free-text search, so
    // they keep using the generic search UI.
    if (sourceId === "dailymed") {
        return <DailyMedResourceView />;
    }

    return <ClinicalResourceSearch sourceId={sourceId} />;
}

export function generateStaticParams() {
    return RESOURCE_SOURCES.map((s) => ({ source: s.id }));
}