import { Poppins } from "next/font/google";
import { headers } from "next/headers";
import type { Metadata } from "next";
// @ts-expect-error Next.js handles this global CSS side-effect import at build time.
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AppShell from "@/components/AppShell";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      manifest: "/manifest.json",
    };
  }

  return {
    title: "PharmaWallah",
    description: "AI-powered pharmacy platform",
    manifest: "/manifest.json",
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
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider attribute="class" enableSystem defaultTheme="light">
          <AppShell isClinicalSubdomain={isClinicalSubdomain}>
            {children}
          </AppShell>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}