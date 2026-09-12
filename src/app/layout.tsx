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

/*
 * The AdSense publisher ID.
 *
 * Hardcoded, with an env override, deliberately. It is a *public* identifier —
 * it is served to every visitor in the page source and in /ads.txt — so it is
 * not a secret. Keeping it only in `.env` (which is gitignored) meant Vercel
 * never received it, so the deployed site carried no AdSense code at all and
 * AdSense answered "Couldn't verify your site". Both site verification and
 * Auto ads need the snippet on the LIVE site, so the default must not depend
 * on someone remembering to set a dashboard variable.
 *
 * Ad *units* are still env-gated — see src/components/calculators/AdSlot.tsx.
 */
const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-9553986083846603";

/* ── Dynamic metadata based on subdomain ─────────────────────────────────── */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const subdomain = headersList.get("x-subdomain");

  if (subdomain === "clinical") {
    return {
      title: "PharmaWallah Clinical | Clinical Pharmacy Tools",
      description:
        "Clinical pharmacy tools, medication resources, calculators, interaction checking and practical decision-support resources from PharmaWallah.",
      openGraph: {
        title: "PharmaWallah Clinical | Clinical Pharmacy Tools",
        description:
          "Clinical pharmacy tools, medication resources, calculators, interaction checking and practical decision-support resources from PharmaWallah.",
        siteName: "PharmaWallah Clinical",
        type: "website",
      },
      // AdSense's meta-tag verification method. A second, independent way for
      // the crawler to recognise the site, in case it cannot execute or reach
      // the loader script.
      other: { "google-adsense-account": ADSENSE_CLIENT },
    };
  }

  return {
    title: "PharmaWallah",
    description: "AI-powered pharmacy platform",
    other: { "google-adsense-account": ADSENSE_CLIENT },
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
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        />
      </body>
    </html>
  );
}