"use client";

import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { AI_ANSWER, HERO_WORDS } from "./data";

/* ──────────────────────────────────────────────────────────────────────────
 * The landing page's entire motion system.
 *
 * Everything lives in one hook, mirroring the prototype's single IIFE, because
 * the timelines are genuinely coupled: the spine's draw progress, the rail's
 * fill and the stations' pins all describe one journey (absorption →
 * distribution → metabolism → elimination) and reading them apart is harder
 * than reading them together.
 *
 * Structure:
 *   gsap.matchMedia(root)      — one desktop branch, one touch branch, one
 *                                reduced-motion branch that plays nothing
 *     └ every timeline is created inside, so mm.revert() on unmount kills all
 *       tweens, ScrollTriggers, Draggables, SplitText instances and inline
 *       styles. Next.js client navigation away from "/" must leave nothing
 *       behind — a stale pinned ScrollTrigger would break the next page.
 * ────────────────────────────────────────────────────────────────────────── */

/** useLayoutEffect warns during SSR; the motion only ever runs in the browser. */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Motion vocabulary — durations, eases and the one stagger the page uses. */
const D = { xs: 0.24, s: 0.42, m: 0.72, l: 1.1, xl: 1.5 };
const E = {
  pw: "pw",
  out: "power3.out",
  io: "power2.inOut",
  pop: "back.out(1.7)",
  in: "power2.in",
};
const STAGGER = 0.07;

/** GSAP ships no throttle util, and resize work here is expensive enough to need one. */
function throttle(fn: () => void, ms: number) {
  let last = 0;
  let queued: ReturnType<typeof setTimeout> | null = null;
  return () => {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn();
    } else if (!queued) {
      queued = setTimeout(() => {
        queued = null;
        last = Date.now();
        fn();
      }, ms - (now - last));
    }
  };
}

export function useLandingMotion(rootRef: RefObject<HTMLElement>) {
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(
      ScrollTrigger,
      ScrollToPlugin,
      Draggable,
      InertiaPlugin,
      DrawSVGPlugin,
      MotionPathPlugin,
      ScrambleTextPlugin,
      SplitText,
      CustomEase,
    );

    // One signature ease, used for every large move on the page.
    if (!CustomEase.get("pw")) CustomEase.create("pw", "M0,0 C0.16,1 0.3,1 1,1");

    // globals.css sets `html { scroll-behavior: smooth }`, which desynchronises
    // every scrubbed ScrollTrigger and fights ScrollToPlugin. Suspended for as
    // long as this page is mounted, restored on unmount.
    document.documentElement.classList.add("pw-landing-mounted");

    const q = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = root) =>
      scope.querySelector<T>(sel);
    const qa = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = root) =>
      Array.from(scope.querySelectorAll<T>(sel));

    const mm = gsap.matchMedia(root);
    const disposers: Array<() => void> = [];

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)",
        desk: "(min-width: 1025px)",
        mob: "(max-width: 1024px)",
      },
      (ctx) => {
        const { reduce, desk } = ctx.conditions as { reduce: boolean; desk: boolean };

        // The server-rendered markup hides anything about to animate in so it
        // cannot flash at its final position. Released now that start states
        // are about to be set.
        root.classList.remove("is-loading");
        root.classList.toggle("is-desk", Boolean(desk));

        if (reduce) {
          reducedMotion();
          return;
        }

        chrome();
        preloader().then(() => {
          heroIntro();
          if (desk) heroLive();
        });
        headings();
        genericReveals();
        numbers(false);
        gallery(Boolean(desk));
        disciplineIndex(Boolean(desk));
        deck(Boolean(desk));
        dial();
        aiAnswer(false);
        if (desk) {
          spine();
          magnets();
        }
        adAudit();

        /* ═══════════ reduced motion: show the finished state, animate nothing ═══════════ */
        function reducedMotion() {
          gsap.set(q("[data-pre]"), { display: "none" });
          gsap.set(qa("[data-anim], .leaf, .irow"), { clearProps: "all", autoAlpha: 1, y: 0 });
          gsap.set(q("[data-why]"), { autoAlpha: 1 });
          q("[data-opts] [data-ok]")?.classList.add("ok");
          qa("[data-rail] i b").forEach((b) => gsap.set(b, { scaleY: 1 }));
          const dialRing = q<SVGCircleElement>("[data-dial]");
          if (dialRing) gsap.set(dialRing, { drawSVG: "82%" });
          numbers(true);
          aiAnswer(true);
          // Only the first paragraph of the deck's three is visible without the
          // scrubbed timeline that swaps them.
          gsap.set(qa("[data-copy] p").slice(1), { display: "none" });
        }

        /* ═══════════ chrome: in-page anchors and the ADME rail ═══════════ */
        function chrome() {
          qa<HTMLAnchorElement>('a[href^="#"], [data-scroll-to]').forEach((a) => {
            const targetSel = a.dataset.scrollTo || a.getAttribute("href");
            if (!targetSel || targetSel === "#") return;
            const handler = (e: Event) => {
              const t = q(targetSel);
              if (!t) return;
              e.preventDefault();
              gsap.to(window, { duration: 1, ease: E.io, scrollTo: { y: t, offsetY: 90 } });
            };
            a.addEventListener("click", handler);
            disposers.push(() => a.removeEventListener("click", handler));
          });

          // The rail belongs to the four stations. Once the AI section arrives
          // there is no stage left to report, so it retires rather than sitting
          // over the footer.
          const rail = q("[data-rail]");
          if (rail) {
            ScrollTrigger.create({
              trigger: "#ai",
              start: "top 80%",
              onEnter: () => gsap.to(rail, { autoAlpha: 0, x: -10, duration: 0.4, ease: E.in }),
              onLeaveBack: () => gsap.to(rail, { autoAlpha: 1, x: 0, duration: 0.4, ease: E.pw }),
            });
          }

          // Each rail bar fills across its own station; its label fades in while
          // that station owns the viewport.
          const bars = qa("[data-rail] i b");
          const labels = qa("[data-rail] em");
          qa("[data-station]").forEach((sec, i) => {
            const bar = bars[i];
            const lbl = labels[i];
            if (!bar) return;
            gsap.fromTo(
              bar,
              { scaleY: 0 },
              {
                scaleY: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: sec,
                  start: "top 70%",
                  end: "bottom 40%",
                  scrub: true,
                  onToggle: (self) =>
                    gsap.to(lbl, {
                      autoAlpha: self.isActive ? 1 : 0,
                      x: self.isActive ? 0 : -6,
                      duration: 0.3,
                    }),
                },
              },
            );
          });
        }

        /* ═══════════ preloader ═══════════ */
        function preloader(): Promise<unknown> {
          const pre = q("[data-pre]");
          const pct = q("[data-pct]");
          if (!pre) return Promise.resolve();
          const o = { v: 0 };
          return gsap
            .timeline()
            .to(o, {
              v: 100,
              duration: 0.9,
              ease: "power1.inOut",
              onUpdate: () => {
                if (pct) pct.textContent = `LOADING ${Math.round(o.v)}%`;
              },
            })
            .to("[data-cap-a]", { y: -10, duration: 0.45, ease: E.pw }, 0)
            .to("[data-cap-b]", { y: 10, duration: 0.45, ease: E.pw }, 0)
            .to("[data-cap-a]", { y: 0, duration: 0.4, ease: E.pw }, 0.5)
            .to("[data-cap-b]", { y: 0, duration: 0.4, ease: E.pw }, 0.5)
            .to(".pw-pre .capsule", { rotate: 45, scale: 0.8, duration: 0.5, ease: E.pw }, 0.62)
            .to(pct, { autoAlpha: 0, duration: 0.25 }, 0.7)
            .to(pre, { yPercent: -100, duration: 0.8, ease: E.pw }, 0.9)
            .set(pre, { display: "none" })
            .then();
        }

        /* ═══════════ hero ═══════════ */
        function heroIntro() {
          const lines = qa(".hero h1 .line > span");
          gsap
            .timeline({ defaults: { ease: E.pw } })
            .from(".hero .kicker", { y: 14, autoAlpha: 0, duration: D.m }, 0.05)
            .from(lines, { yPercent: 108, duration: D.xl, stagger: 0.08 }, 0.1)
            .from(".hero .lede", { y: 22, autoAlpha: 0, duration: D.m }, 0.5)
            .from(".hero-acts [data-mag]", { y: 20, autoAlpha: 0, duration: D.m, stagger: STAGGER }, 0.6)
            .from(".hero-meta > *", { y: 14, autoAlpha: 0, duration: D.s, stagger: 0.05 }, 0.72)
            .from("[data-aura]", { scale: 0.4, autoAlpha: 0, duration: D.xl, stagger: 0.1 }, 0)
            .from("[data-cap-top]", { x: -70, y: 40, rotate: -14, autoAlpha: 0, duration: 1.3 }, 0.2)
            .from("[data-cap-bot]", { x: 70, y: 60, rotate: 12, autoAlpha: 0, duration: 1.3 }, 0.34)
            .from("[data-rl]", { autoAlpha: 0, scale: 0.8, duration: D.s, stagger: 0.07, ease: E.pop }, 0.95)
            .from("[data-rail] i", { scaleY: 0, autoAlpha: 0, duration: D.s, stagger: 0.05 }, 1)
            .from("[data-cue]", { autoAlpha: 0, y: -10, duration: D.s }, 1.1);

          gsap.to("[data-cue] .bar", {
            scaleY: 0.3,
            transformOrigin: "50% 100%",
            duration: 1.1,
            ease: "power2.inOut",
            yoyo: true,
            repeat: -1,
          });

          wordSwap();
          bonds();
        }

        /** The headline's last word cycles: understood / calculated / remembered / passed. */
        function wordSwap() {
          const live = q("[data-word-live]");
          const next = q("[data-word-next]");
          if (!live || !next) return;
          let i = 0;
          const cycle = () => {
            i = (i + 1) % HERO_WORDS.length;
            next.textContent = HERO_WORDS[i];
            gsap
              .timeline({
                onComplete: () => {
                  live.textContent = HERO_WORDS[i];
                  gsap.set(live, { yPercent: 0, autoAlpha: 1 });
                  gsap.set(next, { autoAlpha: 0 });
                  gsap.delayedCall(2.4, cycle);
                },
              })
              .to(live, { yPercent: -104, autoAlpha: 0, duration: 0.5, ease: E.pw })
              .fromTo(
                next,
                { yPercent: 104, autoAlpha: 1 },
                { yPercent: 0, duration: 0.55, ease: E.pw },
                0.06,
              );
          };
          gsap.delayedCall(2.2, cycle);
        }

        /** Molecular bond network behind the hero; nodes drift and repel the pointer. */
        function bonds() {
          const svg = q<SVGSVGElement>("[data-bonds]");
          const host = q("[data-hero]");
          if (!svg || !host) return;

          const w = host.offsetWidth;
          const h = host.offsetHeight;
          svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

          const N = window.innerWidth < 700 ? 16 : 30;
          type Node = { x: number; y: number };
          const pts: Node[] = Array.from({ length: N }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
          }));

          const NS = "http://www.w3.org/2000/svg";
          const frag = document.createDocumentFragment();
          const lines: Array<[SVGLineElement, Node, Node]> = [];
          pts.forEach((p, i) =>
            pts.slice(i + 1).forEach((r) => {
              if (Math.hypot(p.x - r.x, p.y - r.y) < w / 5.2) {
                const l = document.createElementNS(NS, "line");
                l.setAttribute("stroke", "#CFE0F5");
                l.setAttribute("stroke-width", "1");
                lines.push([l, p, r]);
                frag.appendChild(l);
              }
            }),
          );
          const dots = pts.map(() => {
            const c = document.createElementNS(NS, "circle");
            c.setAttribute("r", "2.6");
            c.setAttribute("fill", "#2563EB");
            c.setAttribute("fill-opacity", ".22");
            frag.appendChild(c);
            return c;
          });
          svg.appendChild(frag);

          const draw = () => {
            dots.forEach((c, i) => {
              c.setAttribute("cx", String(pts[i].x));
              c.setAttribute("cy", String(pts[i].y));
            });
            lines.forEach(([l, a, b]) => {
              l.setAttribute("x1", String(a.x));
              l.setAttribute("y1", String(a.y));
              l.setAttribute("x2", String(b.x));
              l.setAttribute("y2", String(b.y));
            });
          };
          draw();

          pts.forEach((p) => {
            gsap.to(p, {
              x: p.x + gsap.utils.random(-38, 38),
              y: p.y + gsap.utils.random(-30, 30),
              duration: gsap.utils.random(5, 9),
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              onUpdate: draw,
            });
          });

          const onMove = (e: PointerEvent) => {
            const r = host.getBoundingClientRect();
            const mx = e.clientX - r.left;
            const my = e.clientY - r.top;
            pts.forEach((p) => {
              const d = Math.hypot(p.x - mx, p.y - my);
              if (d < 150 && d > 0) {
                gsap.to(p, {
                  x: p.x + ((p.x - mx) / d) * 12,
                  y: p.y + ((p.y - my) / d) * 12,
                  duration: 0.6,
                  ease: "power2.out",
                  onUpdate: draw,
                  overwrite: "auto",
                });
              }
            });
          };
          host.addEventListener("pointermove", onMove);
          disposers.push(() => host.removeEventListener("pointermove", onMove));
        }

        /** Pointer tilt on the card stack, then a scrubbed parallax exit. */
        function heroLive() {
          const st = q("[data-stage]");
          if (!st) return;
          const rx = gsap.quickTo(st, "rotationY", { duration: 0.8, ease: "power3" });
          const ry = gsap.quickTo(st, "rotationX", { duration: 0.8, ease: "power3" });
          gsap.set(st, { transformPerspective: 1100, transformStyle: "preserve-3d" });

          const onMove = (e: PointerEvent) => {
            const r = st.getBoundingClientRect();
            rx(((e.clientX - r.left) / r.width - 0.5) * 10);
            ry(-((e.clientY - r.top) / r.height - 0.5) * 8);
          };
          const onLeave = () => {
            rx(0);
            ry(0);
          };
          st.addEventListener("pointermove", onMove);
          st.addEventListener("pointerleave", onLeave);
          disposers.push(() => {
            st.removeEventListener("pointermove", onMove);
            st.removeEventListener("pointerleave", onLeave);
          });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: "[data-hero]",
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            })
            .to("[data-hero-in] > div:first-child", { y: -90, autoAlpha: 0.15, ease: "none" }, 0)
            .to("[data-cap-top]", { y: -120, rotate: -9, ease: "none" }, 0)
            .to("[data-cap-bot]", { y: 60, rotate: 7, ease: "none" }, 0)
            .to("[data-rl]", { autoAlpha: 0, y: -40, ease: "none" }, 0)
            .to("[data-bonds]", { autoAlpha: 0, ease: "none" }, 0)
            .to("[data-cue]", { autoAlpha: 0, ease: "none" }, 0);
        }

        /* ═══════════ the spine: a drawn path the molecule rides ═══════════ */
        function spine() {
          const host = q("[data-light]");
          const svg = q<SVGSVGElement>("[data-spine]");
          const track = q<SVGPathElement>("[data-track]");
          const live = q<SVGPathElement>("[data-live]");
          const mol = q("[data-mol]");
          if (!host || !svg || !track || !live || !mol) return;

          const buildPath = () => {
            const w = host.offsetWidth;
            const h = host.offsetHeight;
            svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
            svg.setAttribute("width", String(w));
            svg.setAttribute("height", String(h));
            const cx = w * 0.5;
            const amp = Math.min(w * 0.3, 360);
            // An S-curve that leans towards each station in turn.
            const d = `M ${cx} 0
              C ${cx + amp} ${h * 0.12}, ${cx - amp} ${h * 0.2}, ${cx - amp * 0.55} ${h * 0.32}
              C ${cx + amp * 0.2} ${h * 0.44}, ${cx + amp} ${h * 0.5}, ${cx + amp * 0.35} ${h * 0.63}
              C ${cx - amp * 0.8} ${h * 0.74}, ${cx - amp * 0.3} ${h * 0.84}, ${cx} ${h}`;
            track.setAttribute("d", d);
            live.setAttribute("d", d);
          };

          let drawTween: gsap.core.Tween | null = null;
          let rideTween: gsap.core.Tween | null = null;

          const makeTweens = () => {
            gsap.set(live, { drawSVG: "0%" });
            drawTween = gsap.to(live, {
              drawSVG: "100%",
              ease: "none",
              scrollTrigger: { trigger: host, start: "top 80%", end: "bottom bottom", scrub: 0.6 },
            });
            // MotionPathPlugin samples the path when the tween is built, so the
            // tween has to be recreated whenever the path is rebuilt — not just
            // refreshed.
            rideTween = gsap.to(mol, {
              ease: "none",
              motionPath: { path: live, align: live, alignOrigin: [0.5, 0.5], autoRotate: false },
              scrollTrigger: { trigger: host, start: "top 80%", end: "bottom bottom", scrub: 0.6 },
            });
          };

          buildPath();
          makeTweens();

          gsap.to("[data-mol] .halo", {
            scale: 2.1,
            autoAlpha: 0,
            duration: 1.6,
            ease: "power2.out",
            repeat: -1,
          });
          gsap.fromTo(
            mol,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: 0.4,
              scrollTrigger: { trigger: host, start: "top 82%", toggleActions: "play none none reverse" },
            },
          );

          // The pinned stations only add their spacers once ScrollTrigger has
          // measured the page, so the first path is built against a height that
          // is about to change. Rebuild once the layout has settled, and again
          // on a debounced resize.
          const rebuild = () => {
            drawTween?.scrollTrigger?.kill();
            drawTween?.kill();
            rideTween?.scrollTrigger?.kill();
            rideTween?.kill();
            buildPath();
            makeTweens();
          };
          const settle = gsap.delayedCall(0.35, rebuild);
          const onResize = throttle(() => {
            rebuild();
            ScrollTrigger.refresh();
          }, 400);
          window.addEventListener("resize", onResize);
          disposers.push(() => {
            settle.kill();
            window.removeEventListener("resize", onResize);
          });
        }

        /* ═══════════ headings and generic reveals ═══════════ */
        function headings() {
          qa("[data-lines]").forEach((el) => {
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                return gsap.from(self.lines, {
                  yPercent: 112,
                  duration: 1,
                  ease: E.pw,
                  stagger: 0.09,
                  scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
                });
              },
            });
          });
        }

        function genericReveals() {
          // Ad slots are never animated: an animated opacity or transform on an
          // ad breaks viewability measurement and risks an AdSense policy
          // violation. They carry no [data-anim], and this filter is the belt
          // to that braces.
          const els = qa("[data-anim]").filter((el) => !el.closest("[data-ad-band]"));
          gsap.set(els, { autoAlpha: 0, y: 34 });
          ScrollTrigger.batch(els, {
            start: "top 90%",
            onEnter: (b) =>
              gsap.to(b, { autoAlpha: 1, y: 0, duration: D.m, ease: E.pw, stagger: STAGGER, overwrite: true }),
            onLeaveBack: (b) =>
              gsap.to(b, { autoAlpha: 0, y: 34, duration: D.s, ease: E.in, overwrite: true }),
          });
        }

        function numbers(instant: boolean) {
          qa<HTMLElement>("[data-num]").forEach((el) => {
            const end = Number(el.dataset.num);
            const sfx = el.dataset.suffix || "";
            const fmt = (v: number) => Math.round(v).toLocaleString("en-US") + sfx;
            el.textContent = fmt(end);
            if (instant) return;
            const o = { v: 0 };
            gsap.to(o, {
              v: end,
              duration: 1.6,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = fmt(o.v);
              },
              scrollTrigger: { trigger: el, start: "top 94%", once: true },
            });
          });
        }

        /* ═══════════ 01 · the pinned horizontal gallery ═══════════ */
        function gallery(isDesk: boolean) {
          const gal = q("[data-gal]");
          const track = q("[data-gal-track]");
          const bar = q("[data-galbar]");
          if (!gal || !track) return;
          const leaves = qa(".leaf", track);
          const dist = () => Math.max(0, track.scrollWidth - gal.offsetWidth);

          if (isDesk) {
            const sideways = gsap.to(track, {
              x: () => -dist(),
              ease: "none",
              scrollTrigger: {
                trigger: gal,
                start: "top 28%",
                end: () => `+=${dist()}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) =>
                  gsap.set(bar, { scaleX: 0.28 + self.progress * 0.72, transformOrigin: "0 50%" }),
              },
            });
            // Each leaf lifts and counter-rotates as it crosses the middle of
            // the screen, driven by the sideways tween rather than page scroll.
            leaves.forEach((leaf) =>
              gsap.fromTo(
                leaf,
                { y: 34, rotate: 1.4 },
                {
                  y: -18,
                  rotate: -1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: leaf,
                    containerAnimation: sideways,
                    start: "left right",
                    end: "right left",
                    scrub: true,
                  },
                },
              ),
            );
          } else {
            // Touch gets a native swipe rail with inertia instead of a pin.
            const [drag] = Draggable.create(track, {
              type: "x",
              inertia: true,
              bounds: { minX: -dist(), maxX: 0 },
              dragClickables: true,
              onDrag() {
                gsap.set(bar, {
                  scaleX: 0.28 + (dist() ? Math.abs(this.x) / dist() : 0) * 0.72,
                  transformOrigin: "0 50%",
                });
              },
            });
            // scrollWidth is only trustworthy once fonts and images have landed.
            const rebound = () => drag?.applyBounds({ minX: -dist(), maxX: 0 });
            window.addEventListener("load", rebound);
            window.addEventListener("resize", rebound);
            disposers.push(() => {
              window.removeEventListener("load", rebound);
              window.removeEventListener("resize", rebound);
            });
          }

          gsap.set(leaves, { autoAlpha: 0, y: 50 });
          ScrollTrigger.create({
            trigger: gal,
            start: "top 82%",
            once: true,
            onEnter: () =>
              gsap.to(leaves, { autoAlpha: 1, y: 0, duration: 0.8, ease: E.pw, stagger: 0.07 }),
          });
        }

        /* ═══════════ 02 · the index with a cursor-following preview ═══════════ */
        function disciplineIndex(isDesk: boolean) {
          const prev = q("[data-preview]");
          const label = q("[data-preview-t]");
          const rows = qa("[data-index] .irow");
          if (!prev || !label) return;

          const xTo = gsap.quickTo(prev, "x", { duration: 0.5, ease: "power3" });
          const yTo = gsap.quickTo(prev, "y", { duration: 0.55, ease: "power3" });

          rows.forEach((row, i) => {
            const sweep = q(".sweep", row);
            const title = q("h3", row);
            const nEl = q(".n", row);
            const metaEl = q(".meta", row);
            gsap.set(row, { autoAlpha: 0, y: 22 });
            ScrollTrigger.create({
              trigger: row,
              start: "top 92%",
              once: true,
              onEnter: () =>
                gsap.to(row, { autoAlpha: 1, y: 0, duration: 0.6, ease: E.pw, delay: i * 0.04 }),
            });
            if (!isDesk) return;

            const enter = () => {
              gsap.to(sweep, {
                scaleY: 1,
                duration: 0.45,
                ease: E.pw,
                transformOrigin: "50% 100%",
                overwrite: "auto",
              });
              gsap.to(title, { color: "#fff", x: 14, duration: 0.4, ease: E.pw, overwrite: "auto" });
              gsap.to([nEl, metaEl], { color: "rgba(255,255,255,.85)", duration: 0.3, overwrite: "auto" });
              label.textContent = (row as HTMLElement).dataset.title || "";
              (label.parentElement as HTMLElement).style.background =
                (row as HTMLElement).dataset.grad || "";
              gsap.to(prev, { autoAlpha: 1, scale: 1, duration: 0.35, ease: E.pw, overwrite: "auto" });
            };
            const leave = () => {
              gsap.to(sweep, {
                scaleY: 0,
                duration: 0.35,
                ease: E.in,
                transformOrigin: "50% 0%",
                overwrite: "auto",
              });
              gsap.to(title, { color: "", x: 0, duration: 0.4, ease: E.pw, overwrite: "auto" });
              gsap.to([nEl, metaEl], { color: "", duration: 0.3, overwrite: "auto" });
              gsap.to(prev, { autoAlpha: 0, scale: 0.92, duration: 0.25, ease: E.in, overwrite: "auto" });
            };
            row.addEventListener("pointerenter", enter);
            row.addEventListener("pointerleave", leave);
            disposers.push(() => {
              row.removeEventListener("pointerenter", enter);
              row.removeEventListener("pointerleave", leave);
            });
          });

          if (!isDesk) return;
          gsap.set(prev, { scale: 0.92, xPercent: -50, yPercent: -50 });
          const index = q("[data-index]");
          if (!index) return;
          const onMove = (e: PointerEvent) => {
            xTo(e.clientX);
            yTo(e.clientY);
          };
          index.addEventListener("pointermove", onMove);
          disposers.push(() => index.removeEventListener("pointermove", onMove));
        }

        /* ═══════════ 03 · the deck (pinned, scrubbed) ═══════════ */
        function deck(isDesk: boolean) {
          const sec = q("[data-practice]");
          if (!sec) return;
          const steps = qa("[data-steps] .step");
          const bars = qa("[data-steps] .ln b");
          const copies = qa("[data-copy] p");
          const opts = qa("[data-opts] .opt");
          const ok = q("[data-opts] [data-ok]");
          const wrong = opts[2];
          if (!ok || !wrong) return;

          if (!isDesk) {
            // Without the scrub there is nothing to reveal progressively, so the
            // card shows its answered state and only the first copy block runs.
            gsap.set("[data-why]", { autoAlpha: 1 });
            ok.classList.add("ok");
            gsap.set(copies.slice(1), { display: "none" });
            return;
          }

          gsap.set(copies.slice(1), { autoAlpha: 0, yPercent: 22 });
          gsap.set("[data-why]", { autoAlpha: 0, y: 18 });

          const timer = q("[data-timer]");
          const clock = { v: 42 };

          let tl: gsap.core.Timeline;
          tl = gsap.timeline({
            defaults: { ease: E.io },
            scrollTrigger: {
              trigger: sec,
              start: "top top",
              end: "+=2400",
              pin: true,
              scrub: 1,
              snap: { snapTo: "labelsDirectional", duration: { min: 0.2, max: 0.6 }, delay: 0.08 },
              onUpdate() {
                const i = ["a", "b", "c"].indexOf(tl.currentLabel());
                steps.forEach((s, k) => s.classList.toggle("on", k === Math.max(0, i)));
              },
            },
          });

          tl.addLabel("a")
            .fromTo(bars[0], { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 2 }, "a")
            .to(
              clock,
              {
                v: 29,
                duration: 1.5,
                ease: "none",
                onUpdate: () => {
                  if (timer) timer.textContent = `00:${String(Math.round(clock.v)).padStart(2, "0")}`;
                },
              },
              "a",
            )
            .call(() => wrong.classList.add("no"))
            .to(wrong, { x: -7, duration: 0.06, repeat: 5, yoyo: true }, "a+=1.1")

            .addLabel("b", "+=.3")
            .to(copies[0], { autoAlpha: 0, yPercent: -22, duration: 0.5 }, "b")
            .to(copies[1], { autoAlpha: 1, yPercent: 0, duration: 0.5 }, "b+=.12")
            .fromTo(bars[1], { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 2 }, "b")
            .call(() => ok.classList.add("ok"))
            .fromTo(ok, { scale: 0.97 }, { scale: 1, duration: 0.5, ease: E.pop }, "b+=.15")
            .to(
              opts.filter((o) => o !== ok && o !== wrong),
              { autoAlpha: 0.4, duration: 0.4 },
              "b+=.15",
            )
            .to("[data-why]", { autoAlpha: 1, y: 0, duration: 0.55, ease: E.pw }, "b+=.45")

            // The answered card is dealt away and the next one steps forward.
            .addLabel("c", "+=.3")
            .to(copies[1], { autoAlpha: 0, yPercent: -22, duration: 0.5 }, "c")
            .to(copies[2], { autoAlpha: 1, yPercent: 0, duration: 0.5 }, "c+=.12")
            .fromTo(bars[2], { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 2 }, "c")
            .to("[data-c1]", { xPercent: 116, rotate: 7, autoAlpha: 0, duration: 0.8, ease: E.pw }, "c+=.2")
            .to("[data-c2]", { y: 0, scale: 1, duration: 0.7, ease: E.pw }, "c+=.34")
            .to("[data-c3]", { y: 14, scale: 0.97, duration: 0.7, ease: E.pw }, "c+=.34")
            .addLabel("end");

          // Reversing past label "a" has to undo the state the .call()s set,
          // otherwise scrolling back up leaves the question already answered.
          tl.eventCallback("onReverseComplete", () => {
            wrong.classList.remove("no");
            ok.classList.remove("ok");
          });
        }

        /* ═══════════ 04 · the dial ═══════════ */
        function dial() {
          const d = q<SVGCircleElement>("[data-dial]");
          if (!d) return;
          gsap.fromTo(
            d,
            { drawSVG: "0%" },
            {
              drawSVG: "82%",
              duration: 1.5,
              ease: E.pw,
              scrollTrigger: { trigger: d, start: "top 88%", once: true },
            },
          );
          gsap.from("[data-topics] span", {
            autoAlpha: 0,
            y: 16,
            scale: 0.94,
            duration: 0.5,
            ease: E.pop,
            stagger: 0.08,
            scrollTrigger: { trigger: "[data-topics]", start: "top 92%", once: true },
          });
        }

        /* ═══════════ the AI answer types itself in ═══════════ */
        function aiAnswer(instant: boolean) {
          const el = q("[data-scramble]");
          if (!el) return;
          if (instant) {
            el.textContent = AI_ANSWER;
            return;
          }
          el.textContent = "";
          gsap.set("[data-cite] span", { autoAlpha: 0, y: 8 });
          ScrollTrigger.create({
            trigger: "[data-term]",
            start: "top 72%",
            once: true,
            onEnter() {
              gsap
                .timeline()
                .from("[data-ask]", { autoAlpha: 0, y: 14, scale: 0.96, duration: 0.45, ease: E.pop })
                .to(
                  el,
                  {
                    duration: 2.6,
                    ease: "none",
                    scrambleText: {
                      text: AI_ANSWER,
                      chars: "ACGT-+0123456789",
                      speed: 0.5,
                      revealDelay: 0.2,
                    },
                  },
                  0.5,
                )
                .to("[data-cite] span", { autoAlpha: 1, y: 0, duration: 0.4, ease: E.pw, stagger: 0.1 }, "-=0.5");
            },
          });
          gsap.to("[data-caret]", {
            autoAlpha: 0,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "steps(1)",
          });
        }

        /* ═══════════ magnetic buttons ═══════════ */
        function magnets() {
          qa("[data-mag]").forEach((el) => {
            if (el.closest("[data-ad-band]")) return;
            const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
            const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
            const fill = q("[data-fill]", el);

            const onMove = (e: PointerEvent) => {
              const r = el.getBoundingClientRect();
              xTo((e.clientX - r.left - r.width / 2) * 0.3);
              yTo((e.clientY - r.top - r.height / 2) * 0.45);
            };
            const onEnter = () => {
              if (fill)
                gsap.fromTo(
                  fill,
                  { scaleX: 0, transformOrigin: "0 50%" },
                  { scaleX: 1, duration: 0.5, ease: E.pw },
                );
            };
            const onLeave = () => {
              xTo(0);
              yTo(0);
              if (fill)
                gsap.to(fill, { scaleX: 0, transformOrigin: "100% 50%", duration: 0.35, ease: E.in });
            };
            el.addEventListener("pointermove", onMove);
            el.addEventListener("pointerenter", onEnter);
            el.addEventListener("pointerleave", onLeave);
            disposers.push(() => {
              el.removeEventListener("pointermove", onMove);
              el.removeEventListener("pointerenter", onEnter);
              el.removeEventListener("pointerleave", onLeave);
            });
          });
        }

        /* ═══════════ ad safety audit (development aid) ═══════════ */
        function adAudit() {
          if (process.env.NODE_ENV === "production") return;
          const run = () => {
            qa("[data-ad-band]").forEach((band) => {
              const s = getComputedStyle(band);
              if (s.visibility === "hidden" || Number(s.opacity) < 1)
                console.error("[ads] hidden slot", band);
              if (band.closest(".pin-spacer, [data-practice], [data-gal], .term"))
                console.error("[ads] slot inside an animated container", band);
            });
          };
          window.addEventListener("load", run);
          disposers.push(() => window.removeEventListener("load", run));
        }
      },
    );

    const onFontsReady = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onFontsReady);
    window.addEventListener("load", onFontsReady);

    return () => {
      window.removeEventListener("load", onFontsReady);
      disposers.forEach((fn) => fn());
      mm.revert();
      document.documentElement.classList.remove("pw-landing-mounted");
    };
  }, [rootRef]);
}
