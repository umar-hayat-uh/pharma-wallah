"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { gsap as GSAP } from "gsap";

/*
 * Every piece of GSAP motion on /dashboard.
 *
 * GSAP is imported dynamically, after first paint, so it never sits between
 * the student and their data — the page's first job is to load fast (the
 * user's complaint about the old dashboard). The module is only reachable
 * from this route, so the ~70 KB never lands on any other page
 * (CLAUDE.md §6 rule 13 names this directory as the second GSAP exception).
 *
 * Structure:
 *   gsap.matchMedia(root)
 *     ├ reduced motion — no tweens at all; figures print their final values.
 *     └ full motion    — panels rise in, figures count up, the coverage ring
 *                        and quiz trend draw, calendar and syllabus cells
 *                        cascade as they scroll into view, milestone bars
 *                        fill, the next-up CTA is magnetic on a fine pointer.
 *   Scroll-spy runs in both branches — which section you are in is information.
 *   mm.revert() on unmount kills every tween, trigger and listener; a
 *   surviving ScrollTrigger breaks the next route's scrolling.
 */

/** If GSAP has not taken over by then, show the content without an intro. */
const INTRO_GATE_MS = 1200;

export function useDashboardMotion(
  root: RefObject<HTMLDivElement>,
  { ready, sections, onSection }: { ready: boolean; sections: string[]; onSection: (id: string) => void },
) {
  const [intro, setIntro] = useState<"wait" | "play">("wait");
  const onSectionRef = useRef(onSection);
  onSectionRef.current = onSection;

  useEffect(() => {
    // Start fetching the GSAP chunks in parallel with /api/progress, so the
    // intro is usually ready the moment the data is.
    import("gsap").catch(() => {});
    import("gsap/ScrollTrigger").catch(() => {});
    document.documentElement.classList.add("pw-dash-mounted");
    return () => document.documentElement.classList.remove("pw-dash-mounted");
  }, []);

  useEffect(() => {
    if (!ready) return;
    const el = root.current;
    if (!el) return;

    let cancelled = false;
    let mm: ReturnType<typeof GSAP.matchMedia> | null = null;
    // Nothing to choreograph under reduced motion, so nothing to wait for.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gate = window.setTimeout(() => setIntro("play"), reduced ? 0 : INTRO_GATE_MS);

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
      .then(([{ gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const qa = <T extends Element = HTMLElement>(sel: string) => Array.from(el.querySelectorAll<T>(sel));
        const ease = "expo.out";
        mm = gsap.matchMedia(el);

        mm.add(
          { reduce: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" },
          (ctx) => {
            const { full } = ctx.conditions as { reduce: boolean; full: boolean };
            const cleanups: (() => void)[] = [];

            // Scroll-spy — both branches.
            sections.forEach((id) => {
              const section = el.querySelector(`#${id}`);
              if (!section) return;
              ScrollTrigger.create({
                trigger: section,
                start: "top 45%",
                end: "bottom 45%",
                onToggle: (self) => self.isActive && onSectionRef.current(id),
              });
            });

            // Reduced motion: React already rendered every final value.
            if (!full) return;
            const counters = qa("[data-count]");

            // Above the fold: one choreographed entrance.
            const intro = qa("[data-reveal]");
            gsap.fromTo(
              intro,
              { autoAlpha: 0, y: 26 },
              { autoAlpha: 1, y: 0, duration: 1.1, ease, stagger: 0.07, clearProps: "transform,visibility" },
            );

            counters.forEach((c) => {
              const target = Number(c.dataset.count) || 0;
              // A plain object as the tween target, so onUpdate never reads the
              // tween variable during construction (MEMORY.md gotcha 42).
              const state = { v: 0 };
              c.textContent = "0";
              gsap.to(state, {
                v: target,
                duration: 1.6,
                delay: 0.25,
                ease: "power3.out",
                onUpdate: () => (c.textContent = Math.round(state.v).toLocaleString()),
              });
            });

            qa<SVGCircleElement>("[data-ring]").forEach((ring) => {
              const len = Number(ring.dataset.len);
              const to = Number(ring.dataset.offset);
              gsap.fromTo(ring, { strokeDashoffset: len }, { strokeDashoffset: to, duration: 1.8, delay: 0.3, ease });
            });

            qa<SVGPathElement>("[data-draw]").forEach((path) => {
              const len = path.getTotalLength();
              gsap.fromTo(
                path,
                { strokeDasharray: len, strokeDashoffset: len },
                {
                  strokeDashoffset: 0,
                  duration: 1.6,
                  ease: "power2.inOut",
                  scrollTrigger: { trigger: path, start: "top 90%", once: true },
                },
              );
            });

            // Cascades that play as each block scrolls into view.
            qa("[data-cascade]").forEach((group) => {
              const cells = Array.from(group.querySelectorAll("[data-cell]"));
              if (!cells.length) return;
              gsap.from(cells, {
                autoAlpha: 0,
                scale: 0.55,
                duration: 0.7,
                ease: "back.out(1.6)",
                stagger: { amount: Number(group.dataset.cascade) || 0.6, grid: "auto", from: "start" },
                clearProps: "transform,visibility",
                scrollTrigger: { trigger: group, start: "top 88%", once: true },
              });
            });

            qa("[data-bar]").forEach((bar) => {
              gsap.from(bar, {
                scaleX: 0,
                transformOrigin: "left center",
                duration: 1.3,
                ease,
                clearProps: "transform",
                scrollTrigger: { trigger: bar, start: "top 92%", once: true },
              });
            });

            qa("[data-rise]").forEach((block) => {
              gsap.from(block, {
                autoAlpha: 0,
                y: 30,
                duration: 1,
                ease,
                clearProps: "transform,visibility",
                scrollTrigger: { trigger: block, start: "top 90%", once: true },
              });
            });

            // The ghost numeral on the next-up panel drifts against the scroll.
            qa("[data-drift]").forEach((n) => {
              gsap.to(n, {
                yPercent: -18,
                ease: "none",
                scrollTrigger: { trigger: n.parentElement, start: "top top+=64", end: "bottom top", scrub: 0.6 },
              });
            });

            // Magnetic primary action, fine pointers only.
            if (window.matchMedia("(pointer: fine)").matches) {
              qa("[data-magnetic]").forEach((btn) => {
                const x = gsap.quickTo(btn, "x", { duration: 0.6, ease: "power3.out" });
                const y = gsap.quickTo(btn, "y", { duration: 0.6, ease: "power3.out" });
                const move = (e: PointerEvent) => {
                  const r = btn.getBoundingClientRect();
                  x((e.clientX - (r.left + r.width / 2)) * 0.25);
                  y((e.clientY - (r.top + r.height / 2)) * 0.35);
                };
                const leave = () => {
                  x(0);
                  y(0);
                };
                btn.addEventListener("pointermove", move);
                btn.addEventListener("pointerleave", leave);
                cleanups.push(() => {
                  btn.removeEventListener("pointermove", move);
                  btn.removeEventListener("pointerleave", leave);
                });
              });
            }

            return () => cleanups.forEach((fn) => fn());
          },
        );

        window.clearTimeout(gate);
        setIntro("play");
        // Sections below may have changed height as data rendered.
        requestAnimationFrame(() => ScrollTrigger.refresh());
      })
      .catch((err) => {
        console.error("[dashboard] motion failed to load", err);
        setIntro("play");
      });

    return () => {
      cancelled = true;
      window.clearTimeout(gate);
      mm?.revert();
    };
    // `sections` is a module constant at the call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, root]);

  return intro;
}
