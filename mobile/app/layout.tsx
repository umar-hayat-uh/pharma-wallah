import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
// The app's own stylesheet: Tailwind base + shadcn/ui tokens mapped to the
// PharmaWallah brand. It replaces src/app/globals.css rather than importing it,
// because no calculator uses a custom class defined there.
import "./globals.css";
import MobileShell from "./_components/MobileShell";
import { TOOL_SLUGS } from "./_generated/tool-slugs";
import StartupSplash from "./_components/StartupSplash";
import NativeShell from "./_components/NativeShell";

// next/font self-hosts the font files into the static export, so the app bar
// renders correctly with the device in airplane mode.
// Outfit is variable, so one file covers every weight the calculators use.
const font = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "PharmaWallah Calculators",
  // Counted from the generated slug list rather than typed, so it cannot go
  // stale the way the hand-written "89" did once the library reached 105.
  description: `${TOOL_SLUGS.length} pharmacy calculators that work with no internet connection.`,
};

export const viewport: Viewport = {
  themeColor: "#1C7BD9",
  width: "device-width",
  initialScale: 1,
  // Calculators are dense forms; letting the WebView zoom on focus makes
  // inputs jump around, so the viewport is pinned.
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // No ThemeProvider: no calculator uses a single `dark:` class,
  // so a theme switcher here would toggle nothing but the app bar.
  return (
    <html lang="en" className={`light ${font.variable}`} style={{ colorScheme: "light" }}>
      <body className={font.className}>
        {/* Covers the gap between the native launch screen and the first paint
            of the catalogue. Removes itself after ~1.5s. */}
        <StartupSplash />
        {/* Renders nothing; configures the iOS keyboard. See NativeShell. */}
        <NativeShell />
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
