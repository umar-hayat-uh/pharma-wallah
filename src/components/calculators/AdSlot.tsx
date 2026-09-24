"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

import { ADSENSE_CLIENT, IS_PACKAGED_APP as IS_MOBILE_APP } from "@/lib/adsense";

/**
 * A Google AdSense placement.
 *
 * Deliberately renders NOTHING in three cases:
 *  - inside the Android app, which is offline by design and must not phone home
 *    to an ad network (it would also breach AdSense policy to serve ads there);
 *  - in production when this placement's slot ID is not configured, so the
 *    live site never shows an empty grey box;
 *  - during server rendering of the ad push, which must happen client-side.
 *
 * In development with no slot it shows a labelled placeholder, so the space an
 * ad will occupy is visible while designing a page.
 *
 * `data-html2canvas-ignore` keeps every placement out of the lesson and lab
 * PDF exports (they rasterise the page with html2canvas), so an ad can sit
 * inside the exported area without printing into the student's PDF; and
 * `print:hidden` does the same for the browser's own print dialog.
 */
export function AdSlot({
  slot,
  format = "auto",
  className,
  label = "Advertisement",
}: {
  /** The AdSense ad-unit ID for this placement. */
  slot?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  label?: string;
}) {
  const pushed = useRef(false);

  useEffect(() => {
    if (IS_MOBILE_APP || !ADSENSE_CLIENT || !slot) return;
    // React runs effects twice in development StrictMode; pushing the same slot
    // twice makes AdSense log "already have ads in them".
    if (pushed.current) return;
    pushed.current = true;

    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ??= []).push({});
    } catch {
      // An ad failing to load must never take the calculator down with it.
    }
  }, [slot]);

  if (IS_MOBILE_APP) return null;

  if (!ADSENSE_CLIENT || !slot) {
    if (process.env.NODE_ENV !== "development") return null;
    return (
      <div
        data-html2canvas-ignore="true"
        className={cn(
          "grid min-h-[250px] place-items-center rounded-xl border border-dashed bg-card text-center print:hidden",
          className,
        )}
      >
        <div className="px-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Ad slot
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Set NEXT_PUBLIC_ADSENSE_CLIENT and pass a <code>slot</code> to activate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-html2canvas-ignore="true" className={cn("overflow-hidden rounded-xl print:hidden", className)}>
      <p className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
