import type { Metadata } from "next";
import { statSync } from "node:fs";
import { join } from "node:path";
import DownloadClient, { type PlatformFile } from "./DownloadClient";

export const metadata: Metadata = {
  title: "Download the apps | PharmaWallah",
  description:
    "PharmaWallah's pharmacy calculators for Windows and Android. Works completely offline — no account, no internet needed after install.",
  alternates: { canonical: "/download" },
};

/**
 * Measures the release files on disk at build time.
 *
 * The old page hard-coded `APK_SIZE = "8.9 MB"` beside the APK, which meant the
 * stated size drifted every time a build was published and nobody remembered to
 * edit it. Reading the real file has two further benefits: the size is always
 * true, and a platform whose build has not been committed yet renders an honest
 * "not ready" state instead of a button that 404s.
 *
 * This is a server component, so the read happens once during `next build` and
 * never in the browser.
 */
function measure(publicPath: string): PlatformFile {
  try {
    const bytes = statSync(join(process.cwd(), "public", publicPath)).size;
    return {
      href: publicPath,
      // One decimal is the right precision here: "8.9 MB" is useful, "8.94 MB"
      // is noise, and "9 MB" reads like a guess.
      size: `${(bytes / 1024 / 1024).toFixed(1)} MB`,
    };
  } catch {
    // Not built/committed yet.
    return null;
  }
}

export default function DownloadPage() {
  return (
    <DownloadClient
      android={measure("/downloads/pharmawallah-calculators.apk")}
      windows={measure("/downloads/PharmaWallah-Setup.exe")}
    />
  );
}
