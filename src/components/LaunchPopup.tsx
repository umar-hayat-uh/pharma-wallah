"use client";

import { useState, useEffect, useRef } from "react";
import { X, ArrowRight, Stethoscope } from "lucide-react";

// ---- Cache config ----
// Key used in localStorage to remember the dismissal.
const STORAGE_KEY = "pw_launch_banner_dismissed_at";
// How long to keep the popup hidden after it's closed, in milliseconds.
// 24 hours here — change this number if you want a shorter/longer "cooldown".
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000;

function wasRecentlyDismissed() {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const dismissedAt = parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_DURATION_MS;
  } catch {
    // localStorage unavailable (e.g. private mode edge cases) — fail open, show banner
    return false;
  }
}

function markDismissed() {
  try {
    window.localStorage.setItem(STORAGE_KEY, Date.now().toString());
  } catch {
    // ignore write failures silently
  }
}

const FORMAT = [
  { figure: "10", label: "Questions" },
  { figure: "10s", label: "Per answer" },
  { figure: "8/10", label: "To win" },
];

/**
 * The Science Fair 2026 launch dialog, shown once per 24 hours on every
 * non-clinical page (mounted by AppShell).
 *
 * Redesigned 2026-09-13 to match the landing page and the launch strip: an ink
 * header with a live status, the quiz format as three tabular figures, and one
 * solid call to action — replacing gradient text, a gradient button, a flowing
 * gradient edge and two floating blurred orbs.
 *
 * Also made a real dialog: role="dialog" + aria-modal, labelled by its heading,
 * Escape closes it, and focus moves to the primary action when it opens and
 * returns to where it was when it closes.
 */
export default function LaunchBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Skip entirely if the user dismissed it within the cooldown window.
    if (wasRecentlyDismissed()) return;

    const openTimer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(openTimer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      primaryRef.current?.focus({ preventScroll: true });
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
    // `close` is stable in behaviour; re-binding on every render is unnecessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const close = () => {
    markDismissed();
    setVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      restoreFocusRef.current?.focus?.({ preventScroll: true });
    }, 320);
  };

  if (!isOpen) return null;

  const ease = "cubic-bezier(0.16, 1, 0.3, 1)";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0b0c0e]/50 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      style={{ opacity: visible ? 1 : 0, transition: `opacity 320ms ${ease}` }}
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pw-launch-title"
        aria-describedby="pw-launch-desc"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] overflow-hidden rounded-[28px] bg-[#f7f5f1] text-[#0b0c0e] shadow-[0_40px_90px_-30px_rgba(11,12,14,0.6)]"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(18px) scale(0.985)",
          transition: `opacity 420ms ${ease}, transform 620ms ${ease}`,
        }}
      >
        {/* Ink header */}
        <div className="relative bg-[#0b0c0e] px-6 pb-7 pt-6 text-[#f7f5f1] sm:px-7">
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-[#1c7bd9]" />

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-emerald-400">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70 motion-reduce:animate-none" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live now · 2026
            </span>
            <button
              onClick={close}
              className="-mr-2 grid h-9 w-9 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/50">Science Fair</p>
          <h2
            id="pw-launch-title"
            className="mt-1.5 text-[2.35rem] font-extrabold leading-[0.92] tracking-[-0.045em]"
          >
            Rapid Pharmacy
            <br />
            Quiz<span className="text-[#1c7bd9]">.</span>
          </h2>
        </div>

        <div className="px-6 pb-6 pt-5 sm:px-7">
          <p id="pw-launch-desc" className="text-[15px] leading-relaxed text-[#0b0c0e]/65">
            Think fast, answer correctly, and win a prize.
          </p>

          {/* The format, as figures rather than chips. */}
          <dl className="mt-5 grid grid-cols-3 border-y border-[#0b0c0e]/10">
            {FORMAT.map((item, i) => (
              <div key={item.label} className={`py-3.5 ${i > 0 ? "border-l border-[#0b0c0e]/10 pl-4" : ""}`}>
                <dt className="sr-only">{item.label}</dt>
                <dd className="text-2xl font-bold leading-none tracking-[-0.04em] tabular-nums">{item.figure}</dd>
                <dd aria-hidden="true" className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#0b0c0e]/50">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-col gap-2">
            <a
              ref={primaryRef}
              href="/pw"
              className="group flex min-h-[52px] items-center justify-between rounded-full bg-[#0b0c0e] pl-6 pr-2 font-semibold text-white transition-colors duration-500 hover:bg-[#1c7bd9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7bd9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f5f1]"
            >
              Play the quiz
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-transform duration-500 group-hover:-rotate-45">
                <ArrowRight size={16} />
              </span>
            </a>

            {/* Cross-link, demoted to a quiet row rather than a second card. */}
            <a
              href="/clinical"
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-full text-sm font-medium text-[#0b0c0e]/70 transition-colors hover:bg-[#0b0c0e]/5 hover:text-[#0b0c0e]"
            >
              <Stethoscope size={15} className="text-emerald-600" aria-hidden="true" />
              Also new: PharmaWallah Clinical
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
