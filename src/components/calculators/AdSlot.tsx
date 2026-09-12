"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Set to "true" only by the Android build (mobile/next.config.mjs). */
const IS_MOBILE_APP = process.env.NEXT_PUBLIC_IS_MOBILE_APP === "true";
/** e.g. "ca-pub-0000000000000000". Unset until AdSense approves the site. */
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

/**
 * A Google AdSense placement.
 *
 * Deliberately renders NOTHING in three cases:
 *  - inside the Android app, which is offline by design and must not phone home
 *    to an ad network (it would also breach AdSense policy to serve ads there);
 *  - in production when no publisher ID is configured, so the live site never
 *    shows an empty grey box while approval is pending;
 *  - during server rendering of the ad push, which must happen client-side.
 *
 * In development with no publisher ID it shows a labelled placeholder, so the
 * space an ad will occupy is visible while designing a page.
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
        className={cn(
          "grid min-h-[250px] place-items-center rounded-xl border border-dashed bg-card text-center",
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
    <div className={cn("overflow-hidden rounded-xl", className)}>
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
