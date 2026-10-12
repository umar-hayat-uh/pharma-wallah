import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { GUIDES, findGuide } from "@/lib/guides";
import { SITE_NAME } from "@/lib/seo";
import { JsonLd, articleLd, breadcrumbLd } from "@/lib/structured-data";

// An unknown slug renders the not-found UI with HTTP 200, not 404: the root
// loading.tsx starts streaming before notFound() runs (MEMORY.md gotcha 183),
// and `dynamicParams = false` does not change that (measured 2026-10-12). The
// not-found page is noindexed, so it still stays out of search results.

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const guide = findGuide(params.slug);
  if (!guide) return {};
  const title = `${guide.title} | ${SITE_NAME}`;
  return {
    title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { title, description: guide.description, type: "article", modifiedTime: guide.meta.updated },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = findGuide(params.slug);
  if (!guide) notFound();
  const path = `/guides/${guide.slug}`;

  return (
    <>
      <JsonLd
        data={articleLd({ title: guide.title, description: guide.description, path, updated: guide.meta.updated, author: guide.meta.author })}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Guides", path: "/guides" },
          { name: guide.title, path },
        ])}
      />
      <GuideArticle guide={guide} />
    </>
  );
}
