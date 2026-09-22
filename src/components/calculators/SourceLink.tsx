"use client";

import { useEffect, useState } from "react";
import { ExternalLink, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { IS_MOBILE_APP } from "./lab-math";

/**
 * A link out to a source document (a DailyMed monograph, an FDA label, a drug
 * database) from inside a calculator.
 *
 * The website can just render an anchor. The packaged apps cannot: they are
 * offline calculators, so tapping a source link with no signal hands the
 * student off to a browser error page with no explanation. Only three of the
 * 104 calculators have such a link — qt-interval, reconstitution and
 * renal-dosing-adjuster — but a broken hand-off is exactly the "misleading
 * experience" the app is supposed to avoid.
 *
 * So in the app the link states that it opens a web page, and while the device
 * is offline it stops being a link at all and says why. Nothing is hidden: the
 * source is still named, because the citation is useful even when the document
 * is out of reach.
 */
export function SourceLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  // Always starts true so the server-rendered HTML and the first client render
  // agree; the effect corrects it. Same reasoning as the app's useOnlineStatus,
  // which this cannot import — that hook lives in the mobile project root and
  // the kit is shared with the website.
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!IS_MOBILE_APP) return;
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const base = "inline-flex items-center gap-1.5 text-xs font-medium";

  if (IS_MOBILE_APP && !online) {
    return (
      <span className={cn(base, "text-muted-foreground", className)}>
        <WifiOff className="h-3 w-3 shrink-0" aria-hidden="true" />
        {children}
        <span className="font-normal">— needs a connection</span>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(base, "text-primary hover:underline", className)}
    >
      {children}
      <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
      {IS_MOBILE_APP && <span className="font-normal text-muted-foreground">— opens a web page</span>}
    </a>
  );
}
