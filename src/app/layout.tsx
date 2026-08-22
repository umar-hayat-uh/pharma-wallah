import { Poppins } from "next/font/google";
import { headers } from "next/headers";
import type { Metadata } from "next";
// @ts-ignore: CSS import type declarations are handled by Next.js
import "./globals.css";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import ClinicalNavbar from "@/components/Clinical/ClinicalNavbar";
import ClinicalFooter from "@/components/Clinical/ClinicalFooter";
import { ThemeProvider } from "next-themes";
import ScrollToTop from "@/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LaunchPopup from "@/components/LaunchPopup";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* ── Dynamic metadata based on subdomain ─────────────────────────────────── */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = headers();
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  const subdomain = headersList.get("x-subdomain");
  const isClinical = subdomain === "clinical";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={font.className}>
        <ThemeProvider attribute="class" enableSystem defaultTheme="light">
          {isClinical ? <ClinicalNavbar /> : <Header />}
          <main>{children}</main>
          {isClinical ? <ClinicalFooter /> : <Footer />}
          {!isClinical && <ScrollToTop />}
          {!isClinical && <LaunchPopup />}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}