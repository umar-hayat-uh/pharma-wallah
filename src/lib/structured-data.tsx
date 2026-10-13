import { SITE_NAME, SITE_URL } from "@/lib/seo";

/**
 * JSON-LD structured data (added 2026-10-12).
 *
 * Only types that describe what is visibly on the page: the organisation and
 * site (every page), breadcrumbs (calculators, guides), and Article (guides,
 * which are genuine articles with a byline and a date). Deliberately absent:
 * ratings, reviews, MedicalWebPage/medical-audience claims and invented
 * authors — Google treats markup that the page does not show as spam, and a
 * review we did not receive would be a fabrication.
 */

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue | undefined };

/** Server-safe <script type="application/ld+json">. `<` is escaped so text can never close the tag. */
export function JsonLd({ data }: { data: JsonValue }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- JSON is serialised and `<` escaped, see above.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export function organizationLd(): JsonValue {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icons/icon-512x512.png`,
    description:
      "Free pharmacy-education resources built by pharmacy students for the Pharm-D syllabus: calculators, guides, course notes, spotting labs and simulations.",
  };
}

export function websiteLd(): JsonValue {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en",
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]): JsonValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

export function articleLd(a: {
  title: string;
  description: string;
  path: string;
  updated: string;
  author: string;
  /** From src/lib/content/bylines.ts — only a real, filled-in person. */
  personAuthor?: string;
  reviewedBy?: string;
}): JsonValue {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    mainEntityOfPage: `${SITE_URL}${a.path}`,
    dateModified: a.updated,
    inLanguage: "en",
    // A Person only when a real author is recorded; otherwise the team, as an
    // Organization. Never a guessed or placeholder name.
    author: a.personAuthor
      ? { "@type": "Person", name: a.personAuthor }
      : { "@type": "Organization", name: a.author, url: `${SITE_URL}/about-us` },
    ...(a.reviewedBy ? { reviewedBy: { "@type": "Person", name: a.reviewedBy } } : {}),
    // Inline rather than an @id reference, so the Article is complete on its own.
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icons/icon-512x512.png` },
  };
}
