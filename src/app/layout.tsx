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
    };
  }

  return {
    title: "PharmaWallah",
    description: "AI-powered pharmacy platform",
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

        {/* AdSense loader. Rendered only once a publisher ID is configured, so
            nothing is requested while approval is pending. Individual
            placements come from <AdSlot /> in src/components/calculators. */}
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
          />
        )}
      </body>
    </html>
  );
}