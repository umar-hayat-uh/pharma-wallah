import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
// The desktop app's own stylesheet: Tailwind base + shadcn/ui tokens mapped to
// the PharmaWallah brand. It replaces src/app/globals.css rather than importing
// it, exactly as the Android app's does.
import "./globals.css";
import { DesktopShell } from "./_components/DesktopShell";
import { ExternalLinkNotice } from "./_components/ExternalLinkNotice";

// next/font SELF-HOSTS the font files into the static export. That is what
// keeps this build free of a fonts.googleapis.com request at startup — the
// single most common way an "offline" app turns out not to be.
// Outfit is variable, so one file covers every weight the calculators use.
const font = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "PharmaWallah — Offline Pharmaceutical Calculator Suite",
  description:
    "Pharmaceutical calculators, values, formulas and unit conversions that run entirely on this computer.",
};

export const viewport: Viewport = {
  themeColor: "#1C7BD9",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // No ThemeProvider: none of the shared calculators uses a single `dark:`
  // class, so a theme switcher here would toggle the chrome and nothing else.
  return (
    <html lang="en" className={`light ${font.variable}`} style={{ colorScheme: "light" }}>
      <body className={font.className}>
        <DesktopShell>{children}</DesktopShell>
        <ExternalLinkNotice />
      </body>
    </html>
  );
}
