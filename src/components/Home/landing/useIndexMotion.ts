"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

/*
 * Every piece of motion on the landing page — a whiteboard explainer video.
 *
 * GSAP is confined to src/components/Home/landing/ (CLAUDE.md §6 rule 13) —
 * nothing else in src/ may import it, or ~70 KB lands on every route.
 *
 * Structure:
 *   gsap.matchMedia(root)
 *     ├ reduced motion — no leader, no entrance, no pen; every marker mark and
 *     │                  note renders fully drawn. The index still tracks the
 *     │                  active row, because that is information.
 *     └ full motion    — countdown leader, load choreography, the marks drawn
 *                        on (hero: as it opens; everything else: scrubbed to
 *                        scroll, so scrolling back un-draws them like rewinding
 *                        a video), the pen riding each stroke, the counting
 *                        numeral, and magnetic buttons on a fine pointer.
 *   Every tween, ScrollTrigger and listener is created inside a branch, so
 *   mm.revert() on unmount removes all of it. A surviving ScrollTrigger would
 *   break the next route.
 *
 * Deliberately NOT used: ScrollSmoother. It transforms a wrapper around the
 * whole page — which fights the site's fixed header and the Radix mega-menu
 * viewport, and would put any future ad placement inside a transformed parent,
 * breaking AdSense viewability (MEMORY.md gotcha 29). Native scroll it is.
 */

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** The countdown leader is a first-impression device; it plays once per tab session. */
const SEEN_KEY = "pw-idx-preloader-seen";

type Q = <T extends Element = HTMLElement>(sel: string) => T | null;
type QA = <T extends Element = HTMLElement>(sel: string) => T[];

export function useIndexMotion(root: RefObject<HTMLDivElement>) {
  useIsoLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger, CustomEase, DrawSVGPlugin);
    if (!CustomEase.get("pw-expo")) CustomEase.create("pw-expo", "M0,0 C0.16,1 0.3,1 1,1");

    // globals.css sets `html { scroll-behavior: smooth }`, which desynchronises
    // ScrollTrigger. Suspended while this page is mounted.
    document.documentElement.classList.add("pw-idx-mounted");

    const q: Q = (sel) => el.querySelector(sel);
    const qa: QA = (sel) => Array.from(el.querySelectorAll(sel));

    const mm = gsap.matchMedia(el);

    mm.add(
      {
        reduce: "(prefers-reduced-motion: reduce)",
        motion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const reduce = Boolean(context.conditions?.reduce);
        const finePointer = window.matchMedia("(pointer: fine)").matches;
        const cleanups: Array<() => void> = [];

        cleanups.push(bindIndex(q, qa, !reduce, finePointer));

        const pre = q("[data-pre]");

        if (reduce) {
          if (pre) pre.style.display = "none";
          el.classList.remove("is-loading");
          return () => cleanups.forEach((fn) => fn());
        }

        const pen = createPen(q("[data-pen]"));
        cleanups.push(pen.dispose);

        /* ── Load: the hero, then its marks drawn on ────────────────────── */
        const hero = q("[data-hero]");
        const lines = qa("[data-hero-title] [data-line]");
        const inEls = qa("[data-in]");

        const load = gsap.timeline({ defaults: { ease: "pw-expo" }, paused: true });
        // `from` tweens render their start state immediately, so the headline
        // is already below its mask before `is-loading` is released.
        load.from(lines, { yPercent: 112, duration: 1.25, stagger: 0.085, immediateRender: true }, 0);
        // clearProps: GSAP otherwise leaves an inline `transform` behind, which
        // outranks the CSS transforms on these elements (the specimen card is
        // tilted, and lifts on hover).
        load.from(
          inEls,
          { y: 22, autoAlpha: 0, duration: 1, stagger: 0.09, clearProps: "transform,opacity,visibility", immediateRender: true },
          0.28,
        );
        if (hero) {
          // In view from the first frame, so these are played, not scrubbed.
          hero.querySelectorAll<SVGSVGElement>("[data-draw-group]").forEach((svg, i) => {
            load.add(drawGroup(svg, pen), 1.05 + i * 0.35);
          });
          hero.querySelectorAll<HTMLElement>("[data-write]").forEach((note, i) => {
            load.add(writeNote(note, pen), 1.5 + i * 0.3);
          });
        }

        let seen = false;
        try {
          seen = sessionStorage.getItem(SEEN_KEY) === "1";
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {
          // Storage can throw in private mode; then the leader just plays.
        }

        if (pre && !seen) {
          cleanups.push(playLeader(q, pre, el, load));
        } else {
          if (pre) pre.style.display = "none";
          el.classList.remove("is-loading");
          load.play(0);
        }

        /* ── Hero: the last word cycles ─────────────────────────────────── */
        const words = qa("[data-cycle-word]");
        if (words.length > 1) {
          gsap.set(words.slice(1), { yPercent: 115, opacity: 1 });
          let current = 0;
          const roll = () => {
            const next = (current + 1) % words.length;
            gsap.to(words[current], { yPercent: -115, duration: 0.95, ease: "expo.inOut" });
            gsap.fromTo(words[next], { yPercent: 115 }, { yPercent: 0, duration: 0.95, ease: "expo.inOut" });
            current = next;
            call.restart(true);
          };
          const call = gsap.delayedCall(2.8, roll);
        }

        /* ── Everywhere else: marks and notes scrubbed to scroll ────────── */
        qa<SVGSVGElement>("[data-draw-group]")
          .filter((svg) => !hero?.contains(svg))
          .forEach((svg) => {
            const tl = drawGroup(svg, pen);
            ScrollTrigger.create({
              trigger: svg,
              start: "top 86%",
              end: "top 52%",
              scrub: 0.6,
              animation: tl,
            });
          });
        qa("[data-write]")
          .filter((note) => !hero?.contains(note))
          .forEach((note) => {
            const tl = writeNote(note, pen);
            ScrollTrigger.create({
              trigger: note,
              start: "top 84%",
              end: "top 56%",
              scrub: 0.6,
              animation: tl,
            });
          });

        /* ── Reveals ────────────────────────────────────────────────────── */
        const reveals = qa("[data-reveal]");
        gsap.set(reveals, { y: 44, autoAlpha: 0 });
        ScrollTrigger.batch(reveals, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              y: 0,
              autoAlpha: 1,
              duration: 1.15,
              ease: "pw-expo",
              stagger: 0.09,
              overwrite: true,
            }),
        });

        /* ── The Instrument: count up to the tool total while the ruler fills ─ */
        const countEl = q("[data-count]");
        const fill = q("[data-ruler-fill]");
        if (countEl) {
          const target = Number(countEl.dataset.count) || 0;
          const state = { v: 0 };
          countEl.textContent = "00";
          gsap.set(fill, { scaleX: 0 });
          gsap.to(state, {
            v: target,
            duration: 2,
            ease: "power3.out",
            onUpdate: () => {
              countEl.textContent = String(Math.round(state.v)).padStart(2, "0");
              if (fill) gsap.set(fill, { scaleX: state.v / target });
            },
            scrollTrigger: { trigger: countEl, start: "top 82%", once: true },
          });
        }

        /* ── Close: the two lines rise out of their masks ───────────────── */
        const closeLines = qa("[data-close-line]");
        if (closeLines.length) {
          gsap.from(closeLines, {
            yPercent: 112,
            duration: 1.35,
            ease: "pw-expo",
            stagger: 0.11,
            scrollTrigger: { trigger: closeLines[0], start: "top 85%", once: true },
          });
        }

        /* ── The phone drifts against the scroll. Decorative only. ──────── */
        const phone = q("[data-phone]");
        if (phone) {
          gsap.fromTo(
            phone,
            { yPercent: 7, rotate: -2.5 },
            {
              yPercent: -7,
              rotate: 2.5,
              ease: "none",
              scrollTrigger: { trigger: phone, start: "top bottom", end: "bottom top", scrub: 0.7 },
            },
          );
        }

        /* ── Fine pointer: magnetic buttons ─────────────────────────────── */
        if (finePointer) cleanups.push(bindMagnetic(qa("[data-magnetic]")));

        // Outfit and Caveat swap in after first paint and change every line's
        // height; positions measured before that are wrong.
        let alive = true;
        document.fonts?.ready.then(() => alive && ScrollTrigger.refresh());

        return () => {
          alive = false;
          cleanups.forEach((fn) => fn());
        };
      },
    );

    return () => {
      mm.revert();
      document.documentElement.classList.remove("pw-idx-mounted");
    };
  }, [root]);
}

/* ══════════════════ The countdown leader ══════════════════ */

/**
 * 3 → 2 → 1, a marker sweep round the ring for each, then the board wipes up
 * and the hero plays. About 1.9s — long enough to read as a film leader, short
 * enough not to be a wait. Returns a cleanup that kills it if the page unmounts
 * mid-count.
 */
function playLeader(q: Q, pre: HTMLElement, root: HTMLElement, load: gsap.core.Timeline) {
  const count = q("[data-pre-count]");
  const sweep = q<SVGCircleElement>("[data-pre-sweep]");
  const tl = gsap.timeline();

  ["3", "2", "1"].forEach((n, i) => {
    const at = i * 0.5;
    tl.add(() => {
      if (count) count.textContent = n;
    }, at);
    tl.fromTo(count, { scale: 1.25, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.32, ease: "back.out(2)" }, at);
    if (sweep) tl.fromTo(sweep, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.46, ease: "power1.inOut" }, at);
  });

  tl.to(pre, { yPercent: -100, duration: 0.85, ease: "expo.inOut" }, 1.55)
    .add(() => {
      root.classList.remove("is-loading");
      load.play(0);
    }, 1.75)
    .set(pre, { display: "none" });

  return () => tl.kill();
}

/* ══════════════════ Marker drawing ══════════════════ */

type Pen = {
  /** Put the nib at a viewport point and keep the pen visible for a moment. */
  at: (x: number, y: number) => void;
  dispose: () => void;
};

/**
 * The pen shows only while something is actually being drawn: every update
 * stamps a time, and a ticker hides it once updates stop — which is exactly
 * what happens when the reader stops scrolling mid-stroke.
 */
function createPen(node: HTMLElement | null): Pen {
  if (!node) return { at: () => {}, dispose: () => {} };

  const xTo = gsap.quickTo(node, "x", { duration: 0.12, ease: "power2.out" });
  const yTo = gsap.quickTo(node, "y", { duration: 0.12, ease: "power2.out" });
  let last = 0;

  const tick = () => {
    if (last && performance.now() - last > 180) {
      node.classList.remove("is-drawing");
      last = 0;
    }
  };
  gsap.ticker.add(tick);

  return {
    at(x, y) {
      if (!last) gsap.set(node, { x, y });
      xTo(x);
      yTo(y);
      last = performance.now();
      node.classList.add("is-drawing");
    },
    dispose() {
      gsap.ticker.remove(tick);
      node.classList.remove("is-drawing");
    },
  };
}

/** Draw every stroke of one mark in sequence, with the pen on the tip. */
function drawGroup(svg: SVGSVGElement, pen: Pen) {
  const tl = gsap.timeline();
  svg.querySelectorAll<SVGPathElement>("[data-draw]").forEach((path, i) => {
    const length = path.getTotalLength();
    // Duration follows length, so a long underline is not drawn as fast as a tick.
    const duration = Math.min(0.9, Math.max(0.25, length / 520));
    // `this`, not the returned variable: GSAP renders a fromTo's start state
    // synchronously inside the constructor, which fires onUpdate before
    // `const tween = …` has been assigned (a TDZ ReferenceError).
    const tween = gsap.fromTo(
      path,
      { drawSVG: "0%" },
      {
        drawSVG: "100%",
        duration,
        ease: "power1.inOut",
        onUpdate(this: gsap.core.Tween) {
          const r = this.ratio;
          if (r <= 0.01 || r >= 0.995) return;
          const m = path.getScreenCTM();
          if (!m) return;
          const p = path.getPointAtLength(length * r);
          const s = new DOMPoint(p.x, p.y).matrixTransform(m);
          pen.at(s.x, s.y);
        },
      },
    );
    tl.add(tween, i === 0 ? 0 : ">+0.06");
  });
  return tl;
}

/** Write a handwritten note on left to right, the pen tracking the edge. */
function writeNote(note: HTMLElement, pen: Pen) {
  return gsap.fromTo(
    note,
    { clipPath: "inset(-30% 100% -30% -5%)" },
    {
      clipPath: "inset(-30% -5% -30% -5%)",
      duration: 0.9,
      ease: "none",
      // `this` for the same reason as in drawGroup.
      onUpdate(this: gsap.core.Tween) {
        const r = this.ratio;
        if (r <= 0.01 || r >= 0.995) return;
        const rect = note.getBoundingClientRect();
        pen.at(rect.left + rect.width * r, rect.top + rect.height * 0.72);
      },
    },
  );
}

/* ══════════════════ The Index ══════════════════ */

/**
 * Tracks which pillar row is under the reading line, and re-colours the
 * section's marker to that pillar.
 *
 * The active row is chosen from LIVE bounding rects on every scroll update,
 * not from ScrollTrigger start/end positions: the active row expands and the
 * previous one collapses, so any cached position is stale the moment it is
 * used, and the section would flicker between rows. With exactly one row open
 * at a time the reading line always stays inside the row it just activated.
 */
function bindIndex(q: Q, qa: QA, animated: boolean, finePointer: boolean) {
  const section = q("[data-index]");
  const numeral = q("[data-index-numeral]");
  const rows = qa("[data-row]");
  if (!section || rows.length === 0) return () => {};

  let active = Math.max(0, rows.findIndex((row) => row.classList.contains("is-active")));
  let refreshTimer: number | undefined;

  const setActive = (index: number) => {
    if (index === active || !rows[index]) return;
    rows[active]?.classList.remove("is-active");
    const row = rows[index];
    row.classList.add("is-active");
    section.style.setProperty("--hl", row.dataset.marker ?? "");

    if (numeral) {
      const nextNum = row.dataset.num ?? "";
      if (animated) {
        const direction = index > active ? 1 : -1;
        // `rotation` restates the CSS tilt: GSAP's inline transform replaces
        // the stylesheet's, so it has to carry the -4deg itself.
        gsap
          .timeline()
          .to(numeral, { yPercent: -12 * direction, rotation: -4, autoAlpha: 0, duration: 0.26, ease: "power2.in" })
          .add(() => {
            numeral.textContent = nextNum;
          })
          .fromTo(
            numeral,
            { yPercent: 12 * direction, rotation: -9, autoAlpha: 0 },
            { yPercent: 0, rotation: -4, autoAlpha: 1, duration: 0.7, ease: "pw-expo" },
          );
      } else {
        numeral.textContent = nextNum;
      }
    }

    active = index;

    // Rows below this section (the counter, the reveals) were measured against
    // the previous open row. Remeasure once the height transition has settled.
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 850);
  };

  const pick = () => {
    const line = window.innerHeight * 0.52;
    for (let i = 0; i < rows.length; i += 1) {
      const rect = rows[i].getBoundingClientRect();
      if (rect.top <= line && rect.bottom > line) {
        setActive(i);
        return;
      }
    }
  };

  const trigger = ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onUpdate: pick,
  });

  const offs: Array<() => void> = [];
  if (finePointer) {
    rows.forEach((row, i) => {
      const onEnter = () => setActive(i);
      row.addEventListener("mouseenter", onEnter);
      offs.push(() => row.removeEventListener("mouseenter", onEnter));
    });
  }

  return () => {
    window.clearTimeout(refreshTimer);
    trigger.kill();
    offs.forEach((fn) => fn());
  };
}

/* ══════════════════ Micro-interactions ══════════════════ */

/** Buttons lean toward the pointer, and settle back when it leaves. */
function bindMagnetic(buttons: HTMLElement[]) {
  const offs = buttons.map((btn) => {
    const xTo = gsap.quickTo(btn, "x", { duration: 0.7, ease: "power3.out" });
    const yTo = gsap.quickTo(btn, "y", { duration: 0.7, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      const rect = btn.getBoundingClientRect();
      xTo((event.clientX - (rect.left + rect.width / 2)) * 0.26);
      yTo((event.clientY - (rect.top + rect.height / 2)) * 0.36);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    btn.addEventListener("pointermove", onMove);
    btn.addEventListener("pointerleave", onLeave);
    return () => {
      btn.removeEventListener("pointermove", onMove);
      btn.removeEventListener("pointerleave", onLeave);
    };
  });

  return () => offs.forEach((fn) => fn());
}
