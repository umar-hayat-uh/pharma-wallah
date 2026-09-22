"use client";

import { useEffect, useState } from "react";
import { Link2Off } from "lucide-react";

/**
 * Tells the reader what happened when they click a reference link.
 *
 * Several calculators cite FDA labels, CredibleMeds and journal articles. This
 * application is offline and holds no permission to launch a browser, so
 * DesktopShell intercepts those clicks and copies the address instead; this is
 * the part that says so. Doing nothing at all would read as a broken link.
 */
export function ExternalLinkNotice() {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    let timer = 0;
    const onLink = (event: Event) => {
      setHref((event as CustomEvent<string>).detail);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setHref(null), 7000);
    };
    window.addEventListener("pw-external-link", onLink);
    return () => {
      window.removeEventListener("pw-external-link", onLink);
      window.clearTimeout(timer);
    };
  }, []);

  if (!href) return null;

  return (
    <div
      role="status"
      data-print="hide"
      className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border border-border bg-card p-4 shadow-lg"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Link2Off className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        This reference is online
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
        PharmaWallah for Windows does not open web pages. The address has been copied, so you can
        paste it into a browser when you have a connection.
      </p>
      <p className="mt-2 break-all rounded-lg bg-muted px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">
        {href}
      </p>
    </div>
  );
}
