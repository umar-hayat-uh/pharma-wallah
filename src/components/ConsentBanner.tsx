"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CONSENT_COOKIE, type ConsentValue } from "@/lib/consent";

/**
 * Ad-cookie consent for visitors in the EEA, UK and Switzerland (see
 * src/lib/consent.ts). Rendered by the root layout only for those visitors and
 * only while they have not chosen. "Accept" stores the choice and loads the
 * AdSense script now; "Reject" stores the choice and loads nothing.
 */
function save(value: ConsentValue) {
  // One year; SameSite=Lax; readable server-side by the root layout.
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
}

export function ConsentBanner({ publisherId }: { publisherId: string }) {
  const [open, setOpen] = useState(true);

  const accept = () => {
    save("granted");
    if (!document.querySelector("script[data-pw-ads]")) {
      const s = document.createElement("script");
      s.async = true;
      s.crossOrigin = "anonymous";
      s.dataset.pwAds = "1";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
      document.head.appendChild(s);
    }
    setOpen(false);
  };
  const reject = () => {
    save("denied");
    setOpen(false);
  };

  // Escape = reject, the conservative choice.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && reject();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="pw-consent-title"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-[#16181d]/10 bg-white p-4 text-[#16181d] shadow-[0_18px_40px_-18px_rgba(22,24,29,.45)] sm:p-5"
    >
      <p id="pw-consent-title" className="text-[15px] font-semibold">Cookies for advertising</p>
      <p className="mt-1.5 text-sm leading-relaxed text-[#16181d]/70">
        PharmaWallah is free and may show Google ads. With your consent, Google and its partners can use cookies to
        show and measure ads, including personalised ads. You can change this later on the{" "}
        <Link href="/privacy#cookies" className="font-medium text-[#1C7BD9] underline-offset-2 hover:underline">
          privacy page
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={accept}
          className="h-10 rounded-xl bg-[#1C7BD9] px-5 text-sm font-semibold text-white hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1C7BD9]/30"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={reject}
          className="h-10 rounded-xl border border-[#16181d]/15 px-5 text-sm font-semibold hover:bg-[#16181d]/[0.03] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1C7BD9]/20"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

/** "Change my ad-cookie choice" — clears the stored choice so the banner asks again. */
export function ConsentReset() {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
        setDone(true);
        window.location.reload();
      }}
      className="mt-2 inline-flex h-9 items-center rounded-lg border border-[#16181d]/15 px-3 text-sm font-medium hover:bg-[#16181d]/[0.03]"
    >
      {done ? "Reloading…" : "Change my ad-cookie choice"}
    </button>
  );
}
