/**
 * Hands a finished lab-record card to the platform share sheet — iOS's
 * UIActivityViewController, Android's chooser — so a student can put it in
 * Files, Mail, WhatsApp or AirDrop without the app needing a server.
 *
 * Why this exists: the website offers "Download card" and "Print", and both are
 * hidden inside the packaged apps because a WebView does nothing useful with a
 * blob download (MEMORY.md gotcha 40) and has no print dialog. That left the
 * apps able only to copy text. Everything here runs on the device; nothing is
 * uploaded anywhere.
 *
 * Every import is dynamic and every call is behind `isNativeShareAvailable()`,
 * so the website never loads the Capacitor plugins and `mobile/out` served in a
 * plain desktop browser degrades to the Copy button instead of throwing.
 */

import { IS_MOBILE_APP } from "./lab-math";

/** True only inside the packaged iOS/Android app, never on the website. */
export async function isNativeShareAvailable(): Promise<boolean> {
  if (!IS_MOBILE_APP || typeof window === "undefined") return false;
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return false;
    const { Share } = await import("@capacitor/share");
    // Android chooser is always there; iOS reports its own availability.
    const { value } = await Share.canShare();
    return value;
  } catch {
    return false;
  }
}

/** Strips the `data:image/png;base64,` prefix Filesystem does not want. */
function base64Of(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
}

/**
 * Writes the card into the app's own cache directory and opens the share
 * sheet on it. The cache directory is the right home for this: the OS may
 * reclaim it, which is what you want for a file the student has already sent
 * on, and it needs no storage permission on either platform.
 *
 * Returns false when the sheet is unavailable, and throws only on a real
 * failure, so the caller can fall back to Copy and say something useful.
 */
export async function shareReportCard({
  pngDataUrl,
  fileName,
  title,
}: {
  pngDataUrl: string;
  fileName: string;
  title: string;
}): Promise<boolean> {
  if (!(await isNativeShareAvailable())) return false;

  const { Filesystem, Directory } = await import("@capacitor/filesystem");
  const { Share } = await import("@capacitor/share");

  const path = `${fileName}.png`;
  // No `encoding` means "this string is base64", which is what a PNG needs.
  await Filesystem.writeFile({ path, data: base64Of(pngDataUrl), directory: Directory.Cache });
  const { uri } = await Filesystem.getUri({ path, directory: Directory.Cache });

  // `text` is deliberately omitted: on iOS, adding a string alongside a file
  // makes some targets (Mail, Messages) take the string and drop the image.
  await Share.share({ title, files: [uri], dialogTitle: "Share this calculation" });
  return true;
}
