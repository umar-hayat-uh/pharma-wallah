import { Outfit } from "next/font/google";
import { headers } from "next/headers";
import type { Metadata } from "next";
// @ts-ignore -- the stylesheet is handled by Next.js at build time.
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import AppShell from "@/components/AppShell";
import ServiceWorkerCleanup from "@/components/ServiceWorkerCleanup";
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  metaForPath,
  canonicalFor,
} from "@/lib/seo";
import { mcqLookup } from "@/lib/mcq-availability";
import { ADSENSE_CLIENT } from "@/lib/adsense";

/*
 * Outfit is the single typeface for the whole product. It is a variable font on
 * Google Fonts, so no `weight` list is given — the full 100–900 range ships in
 * one file and `font-extrabold` / `font-black` render as real weights instead of
 * being synthesised, which is what happened under the old four-weight Poppins.
 *
 * `variable` exposes it as --font-outfit, which tailwind.config.ts uses for the
 * `sans` family. Pages that set `font-sans` (or their own font-family) therefore
 * still land on Outfit rather than falling back to the system stack.
 */
const font = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

// The publisher ID — see src/lib/adsense.ts for why it is hardcoded. This root
// layout is never part of the packaged apps (they have their own project roots),
// so here it is always defined.
const PUBLISHER_ID = ADSENSE_CLIENT!;


/* ── Metadata: per page, per host ─────────────────────────────────────────
 *
 * Most pages are client components and cannot export metadata, so this layout
 * supplies it from the request path (set as `x-pathname` by middleware) — see
 * src/lib/seo.ts for why. Any page or layout that exports its own metadata
 * overrides these fields.
 *
 * `metadataBase` makes every relative canonical and OG URL resolve to www, on
 * both hosts. Without it the handful of pages that set `alternates.canonical`
 * pointed the clinical subdomain's copy of the site at itself.
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const isClinical = headersList.get("x-subdomain") === "clinical";
  const path = headersList.get("x-pathname") || "/";

  // The clinical subdomain's home page is the clinical landing (same content
  // as www /clinical); every other path on that host is the main site.
  const lookupPath = isClinical && path === "/" ? "/clinical" : path;
  const page = metaForPath(lookupPath, mcqLookup);

  const title = page?.title ?? DEFAULT_TITLE;
  const description = page?.description ?? DEFAULT_DESCRIPTION;
  const canonical = canonicalFor(page?.canonicalPath ?? path, isClinical);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical },
    robots: page?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_PK",
    },
    // AdSense's meta-tag verification method. A second, independent way for
    // the crawler to recognise the site, in case it cannot execute or reach
    // the loader script.
    other: { "google-adsense-account": PUBLISHER_ID },
  };
}

export const viewport = {
  themeColor: "#2563eb",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const subdomain = headersList.get("x-subdomain");
  const isClinicalSubdomain = subdomain === "clinical";

  return (
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider attribute="class" enableSystem defaultTheme="light">
          <AppShell isClinicalSubdomain={isClinicalSubdomain}>
            {children}
          </AppShell>
        </ThemeProvider>

        <ServiceWorkerCleanup />

        <Analytics />
        <SpeedInsights />

        {/* AdSense loader — on every page of both the site and the clinical
            subdomain, because this is the single root layout.

            `beforeInteractive` is what puts the tag inside <head> in the
            server-rendered HTML, which is where AdSense asks for it and where
            its crawler looks. `afterInteractive` (the previous setting) is
            injected by the Next runtime after hydration, so a crawler reading
            the raw HTML may never see it.

            Unconditional: the loader is also what AdSense verifies against and
            what Auto ads needs, so it must not be switchable off by a missing
            env var. Individual ad units are still gated — see AdSlot. */}
        <Script
          id="adsbygoogle-init"
          async
          strategy="beforeInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUBLISHER_ID}`}
        />
      </body>
    </html>
  );
}