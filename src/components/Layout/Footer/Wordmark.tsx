"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The outlined PHARMAWALLAH wordmark that closes the footer.
 *
 * It rises out of its own mask the first time it scrolls into view and the
 * stroke thickens behind it. Deliberately CSS + IntersectionObserver rather
 * than GSAP: the footer renders on every one of the site's ~170 routes, and
 * pulling the animation library into every page for one decorative flourish is
 * not a trade worth making. The landing page owns GSAP; the footer does not.
 */
export default function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect the reader's motion preference: show it, just don't move it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="mt-10 sm:mt-16 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1200 172"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          transform: shown ? "translateY(0)" : "translateY(104%)",
          transition: "transform 1.2s cubic-bezier(.16,1,.3,1)",
        }}
      >
        <text
          x="600"
          y="134"
          textAnchor="middle"
          fontSize="168"
          textLength="1176"
          lengthAdjust="spacingAndGlyphs"
          style={{
            fontWeight: 800,
            fill: "none",
            stroke: "rgba(255,255,255,.45)",
            strokeWidth: shown ? 1.6 : 0.7,
            paintOrder: "stroke",
            transition: "stroke-width 1.4s ease .35s",
          }}
        >
          PHARMAWALLAH
        </text>
      </svg>
    </div>
  );
}
