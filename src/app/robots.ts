import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * /robots.txt — added 2026-09-23. The site had none (it returned 404), and no
 * sitemap either, so crawlers had to discover ~200 pages by following links.
 *
 * Disallowed: API routes and the signed-in areas. (The raw lesson markdown used
 * to be served from /content/; it moved out of public/ on 2026-09-23.) Pages that should be
 * reachable but not indexed (sign-in, the ended tournament…) carry a `noindex`
 * meta tag instead (src/lib/seo.ts); they are NOT disallowed here, because a
 * crawler that is blocked from a page never sees its noindex.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/dashboard"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
