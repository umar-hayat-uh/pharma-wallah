import type { Metadata } from "next";
import { Suspense } from "react";
import EncyclopediaClient from "@/components/encyclopedia/EncyclopediaClient";
import EncyclopediaFigures, { EncyclopediaFiguresFallback } from "@/components/encyclopedia/EncyclopediaFigures";

// A server page (it used to be one "use client" file with a comment saying
// metadata was omitted): it can export metadata, hand the URL's search to the
// client for the first render, and stream the database figures.

export const metadata: Metadata = {
  title: "Drug Encyclopedia (Pharmacopedia) | PharmaWallah",
  description:
    "Search DrugBank drug monographs by generic or British name, DrugBank ID, CAS or UNII — indication, mechanism, pharmacokinetics, interactions, products and chemistry.",
};

type Params = { q?: string | string[]; page?: string | string[]; drug?: string | string[] };

const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

export default function EncyclopediaPage({ searchParams }: { searchParams: Params }) {
  const q = (one(searchParams.q) ?? "").slice(0, 80);
  const pageNum = Number(one(searchParams.page));
  const page = Number.isFinite(pageNum) ? Math.min(Math.max(Math.floor(pageNum), 1), 500) : 1;
  const drug = one(searchParams.drug)?.slice(0, 40) || null;

  return (
    <EncyclopediaClient
      initialQuery={q}
      initialPage={page}
      initialDrug={drug}
      figures={
        <Suspense fallback={<EncyclopediaFiguresFallback />}>
          <EncyclopediaFigures />
        </Suspense>
      }
    />
  );
}
