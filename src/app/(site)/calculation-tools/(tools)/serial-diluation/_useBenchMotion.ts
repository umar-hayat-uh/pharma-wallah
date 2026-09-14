"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { gsap as GSAP } from "gsap";

/*
 * GSAP motion for the Serial Dose calculator's bench rack — one story, told
 * when it helps: a drop leaves the stock, travels each transfer arc into the
 * next tube (which glows as it receives it), and the last transfer draws up the
 * syringe. On a phone the rack scrolls sideways to follow the drop.
 *
 * When it runs: the first time the rack scrolls into view, again ~0.5 s after
 * the plan stops changing (typing a volume replays the new chain once, not on
 * every keystroke), and on "Replay".
 *
 * Rules this follows (CLAUDE.md §6 rule 13 exception, user request 2026-09-14):
 *  - GSAP is fetched with a dynamic import after first paint, so it never
 *    delays the calculator and the ~70 KB lands on this route only.
 *  - Nothing is hidden before the run: the rack is fully drawn by the server
 *    and the timeline only adds a drop, a glow and a stroke over it. The one
 *    thing it empties is the syringe barrel, for the length of the draw-up.
 *  - Each run lives in a gsap.context scoped to the rack; reverting it (next
 *    run, or unmount) puts every attribute and style back as React rendered it.
 *  - prefers-reduced-motion: no runs at all.
 */

const SETTLE_MS = 480;

export function useBenchMotion(root: RefObject<HTMLDivElement>, signature: string) {
  const gsapRef = useRef<typeof GSAP | null>(null);
  const ctxRef = useRef<ReturnType<typeof GSAP.context> | null>(null);
  const seen = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("gsap")
      .then(({ gsap }) => {
        if (cancelled) return;
        gsapRef.current = gsap;
        setReady(true);
      })
      .catch(() => {
        // Offline without the chunk, or blocked: the rack is already complete.
      });
    return () => {
      cancelled = true;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  const play = useCallback(() => {
    const gsap = gsapRef.current;
    const el = root.current;
    if (!gsap || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    ctxRef.current?.revert();
    ctxRef.current = gsap.context(() => {
      const q = <T extends Element = HTMLElement>(sel: string) => Array.from(el.querySelectorAll<T>(sel));
      const links = q("[data-bench-link]");
      const vessels = q("[data-bench-vessel]");
      const syringe = el.querySelector<HTMLElement>("[data-bench-syringe]");
      const scroller = el.querySelector<HTMLElement>("[data-bench-scroller]");
      if (!links.length || !syringe) return;

      // The whole run stays under ~3 s however long the chain is.
      const per = Math.min(0.62, Math.max(0.34, 2.6 / links.length));
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      const canScroll = !!scroller && scroller.scrollWidth > scroller.clientWidth + 4;

      if (canScroll) tl.to(scroller, { scrollLeft: 0, duration: 0.35, ease: "power2.out" }, 0);

      // The stock glows first: this is where the drug starts.
      const stockSplash = vessels[0]?.querySelector("[data-splash]");
      if (stockSplash) tl.fromTo(stockSplash, { opacity: 0 }, { opacity: 0.9, duration: 0.22, yoyo: true, repeat: 1, ease: "power2.out" }, 0);

      links.forEach((link, i) => {
        const flow = link.querySelector<SVGPathElement>("path[data-flow]");
        const drop = link.querySelector<SVGCircleElement>("circle[data-drop]");
        if (!flow || !drop) return;
        const len = flow.getTotalLength();
        const at = 0.18 + i * per;
        const travel = per * 0.72;
        const receiver = i + 1 < vessels.length ? vessels[i + 1] : syringe;

        if (canScroll && scroller) {
          const target = receiver.offsetLeft + receiver.offsetWidth / 2 - scroller.clientWidth / 2;
          tl.to(scroller, { scrollLeft: Math.max(0, target), duration: per, ease: "power2.inOut" }, at);
        }

        tl.fromTo(
          flow,
          { attr: { "stroke-dasharray": len, "stroke-dashoffset": len }, opacity: 1 },
          { attr: { "stroke-dashoffset": 0 }, duration: travel, ease: "power2.inOut" },
          at,
        );
        const point = { t: 0 };
        tl.set(drop, { opacity: 1 }, at);
        tl.to(
          point,
          {
            t: 1,
            duration: travel,
            ease: "power2.inOut",
            onUpdate: () => {
              const p = flow.getPointAtLength(point.t * len);
              drop.setAttribute("cx", String(p.x));
              drop.setAttribute("cy", String(p.y));
            },
          },
          at,
        );
        tl.set(drop, { opacity: 0 }, at + travel);
        tl.to(flow, { opacity: 0, duration: per * 0.6, ease: "power1.out" }, at + travel);

        if (receiver !== syringe) {
          const splash = receiver.querySelector("[data-splash]");
          const conc = receiver.querySelector("[data-conc]");
          if (splash) tl.fromTo(splash, { opacity: 0 }, { opacity: 0.9, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }, at + travel * 0.9);
          // The figure stays readable until the drop lands (immediateRender off),
          // then lifts in brand blue and settles to the foreground colour (--foreground).
          if (conc)
            tl.fromTo(
              conc,
              { y: 4, color: "#1C7BD9" },
              { y: 0, color: "#0f172a", duration: per * 1.4, immediateRender: false, clearProps: "transform,color" },
              at + travel * 0.9,
            );
        } else {
          // Drawing up: the plunger rises as the dose fills the barrel.
          const fill = syringe.querySelector("[data-syringe-fill]");
          const plunger = syringe.querySelector<SVGGElement>("[data-plunger]");
          const dose = syringe.querySelector("[data-dose]");
          const rise = Number(plunger?.dataset.travel ?? 0);
          if (fill) tl.fromTo(fill, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.9 }, at + travel * 0.8);
          if (plunger) tl.fromTo(plunger, { y: rise }, { y: 0, duration: 0.9 }, at + travel * 0.8);
          if (dose)
            tl.fromTo(
              dose,
              { y: 4, color: "#21B67A" },
              { y: 0, color: "#0f172a", duration: 1.1, immediateRender: false, clearProps: "transform,color" },
              at + travel,
            );
        }
      });
    }, el);
  }, [root]);

  // First view — once, when at least a third of the rack is on screen.
  useEffect(() => {
    const el = root.current;
    if (!ready || !el || seen.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          seen.current = true;
          io.disconnect();
          play();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready, play, root]);

  // Plan changed — replay once the student stops typing, if the rack has been seen.
  const firstSignature = useRef(signature);
  useEffect(() => {
    if (!ready || !seen.current || signature === firstSignature.current) return;
    firstSignature.current = signature;
    const t = window.setTimeout(play, SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [signature, ready, play]);

  /** Slide a freshly added row in. A no-op until GSAP is loaded or under reduced motion. */
  const enter = useCallback((node: Element | null) => {
    const gsap = gsapRef.current;
    if (!gsap || !node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(node, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "expo.out", clearProps: "transform,opacity" });
  }, []);

  return { play, enter, ready };
}
