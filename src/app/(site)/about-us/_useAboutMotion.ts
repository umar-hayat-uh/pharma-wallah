"use client";

import { useEffect } from "react";

/*
 * Every piece of scroll motion on /about-us.
 *
 * CLAUDE.md §6 rule 13 confines GSAP to src/components/Home/landing/, with
 * exceptions granted per page by the user. This is one (user request,
 * 2026-09-16: "use proper scroll animations and gsap heavy page"), and it
 * follows the same discipline as the other two:
 *
 *  - GSAP and ScrollTrigger are fetched with a DYNAMIC import after first
 *    paint, so the ~70 KB is a chunk on this route only and never delays the
 *    page. Nothing on the page waits for it.
 *  - Nothing is hidden before GSAP arrives. Every element this hook touches is
 *    fully rendered and readable in the server HTML; the hook only sets a
 *    "from" state once it is running, so a visitor with no JavaScript — or with
 *    the chunk blocked — sees the finished page (MEMORY.md gotcha 65).
 *  - Everything is built inside one `gsap.context` scoped to the page root, and
 *    inside a `matchMedia` branch. Reverting on unmount removes every tween,
 *    ScrollTrigger and inline style GSAP left behind; a surviving ScrollTrigger
 *    would break the next route (and gotcha 44: a `from` tween leaves an inline
 *    transform that outranks the stylesheet).
 *  - Under `prefers-reduced-motion` no tween and no ScrollTrigger is created at
 *    all. The page keeps every state change, and loses only the movement.
 *
 * The choreography, in scroll order:
 *   1. The stage recedes  — the beam drifts, the lede and deck part, the whole
 *      screen dims a little as you leave it. Scrubbed, so scrolling back
 *      restores it exactly.
 *   2. The figures count  — 0 → the real number, once, on entry.
 *   3. The role band      — the conveyor's speed and direction follow scroll
 *      velocity, and it idles when the page is still.
 *   4. The origin quote   — revealed a word at a time, scrubbed to scroll: the
 *      sentence is literally read out by scrolling it.
 *   5. The pillar index   — rows deal in from the left in a stagger.
 *   6. The register       — each row rises and its monogram plate scales in,
 *      batched so a screenful arrives together rather than one at a time.
 *   7. The closing band   — the ghost wordmark and the grid drift at different
 *      rates, so the sign-off has depth.
 *   8. The chapter rail   — a fixed progress line whose ticks light as each
 *      chapter passes, and whose fill tracks the whole page.
 */

/** The page root is resolved by class so page.tsx can stay a server component. */
const ROOT = ".pw-about";

export function useAboutMotion() {
    useEffect(() => {
        let cancelled = false;
        let cleanup: (() => void) | undefined;

        Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
            .then(([{ gsap }, { ScrollTrigger }]) => {
                if (cancelled) return;
                const root = document.querySelector<HTMLElement>(ROOT);
                if (!root) return;

                gsap.registerPlugin(ScrollTrigger);

                // globals.css sets `html { scroll-behavior: smooth }`, which
                // desynchronises every scrubbed ScrollTrigger (gotcha 30a).
                // Suspended for as long as this page is mounted; in-page jumps
                // pass `behavior: "smooth"` explicitly instead.
                document.documentElement.classList.add("pw-about-mounted");

                const context = gsap.context(() => {
                    const mm = gsap.matchMedia(root);

                    mm.add("(prefers-reduced-motion: no-preference)", () => {
                        const q = <T extends Element = HTMLElement>(sel: string) =>
                            root.querySelector<T>(sel);
                        const qa = <T extends Element = HTMLElement>(sel: string) =>
                            Array.from(root.querySelectorAll<T>(sel));

                        stageRecedes(gsap, q);
                        countFigures(gsap, qa);
                        bandFollowsScroll(gsap, ScrollTrigger, q);
                        readTheQuote(gsap, qa);
                        dealTheIndex(gsap, ScrollTrigger, qa);
                        dealTheRegister(gsap, ScrollTrigger, root);
                        closingDrifts(gsap, q);
                        chapterRail(gsap, ScrollTrigger, qa, root);
                    });

                    // Web fonts land after this runs and change every element's
                    // height; without a refresh, triggers fire at the wrong
                    // scroll positions.
                    document.fonts?.ready.then(() => {
                        if (!cancelled) ScrollTrigger.refresh();
                    });
                }, root);

                cleanup = () => {
                    context.revert();
                    document.documentElement.classList.remove("pw-about-mounted");
                };
            })
            .catch(() => {
                // Chunk blocked or offline: the page is already complete.
            });

        return () => {
            cancelled = true;
            cleanup?.();
        };
    }, []);
}

/* eslint-disable @typescript-eslint/no-explicit-any -- gsap types come from the
   dynamic import, so they are not available at this module's top level. */
type G = any;

/** 1. The stage recedes as you leave it. */
function stageRecedes(gsap: G, q: (sel: string) => HTMLElement | null) {
    const stage = q(".pw-stage");
    if (!stage) return;

    gsap.timeline({
        scrollTrigger: { trigger: stage, start: "top top", end: "bottom top", scrub: 0.6 },
    })
        .to(q(".pw-stage__beam"), { yPercent: 22, scale: 1.14, ease: "none" }, 0)
        .to(q(".pw-stage__lede"), { yPercent: -18, opacity: 0.35, ease: "none" }, 0)
        .to(q(".pw-stage__card"), { yPercent: -8, opacity: 0.5, ease: "none" }, 0)
        .to(q(".pw-stage__deck"), { yPercent: 40, opacity: 0.2, ease: "none" }, 0)
        .to(q(".pw-stage__vignette"), { opacity: 1, ease: "none" }, 0);
}

/**
 * 2. The figures count up once, on entry. The final value is in the HTML, so a
 * blocked chunk simply shows it without the count.
 */
function countFigures(gsap: G, qa: (sel: string) => HTMLElement[]) {
    for (const node of qa(".pw-about-fig__count")) {
        const target = Number(node.textContent?.replace(/\D/g, "") ?? 0);
        if (!Number.isFinite(target) || target <= 0) continue;
        const counter = { value: 0 };
        gsap.to(counter, {
            value: target,
            duration: 1.5,
            ease: "power2.out",
            snap: { value: 1 },
            onUpdate: () => {
                node.textContent = String(Math.round(counter.value));
            },
            scrollTrigger: { trigger: node, start: "top 88%", once: true },
        });
    }
}

/**
 * 3. The role band answers the scroll: it speeds up with it, runs backwards
 * when you scroll up, and eases back to its idle pace when the page settles.
 */
function bandFollowsScroll(gsap: G, ScrollTrigger: G, q: (sel: string) => HTMLElement | null) {
    const track = q(".pw-about-band__track");
    if (!track) return;

    // The band is a CSS animation; GSAP drives its playback rate rather than
    // re-implementing the loop, so the seam stays invisible.
    const state = { rate: 1 };
    const apply = () => {
        track.style.animationDirection = state.rate < 0 ? "reverse" : "normal";
        track.style.animationPlayState = "running";
        track.style.setProperty("animation-duration", `${52 / Math.max(0.25, Math.abs(state.rate))}s`);
    };

    ScrollTrigger.create({
        trigger: q(".pw-about-band") ?? track,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self: G) => {
            const velocity = self.getVelocity();
            const rate = gsap.utils.clamp(-6, 6, 1 + velocity / 380);
            gsap.to(state, { rate, duration: 0.25, ease: "none", onUpdate: apply });
            gsap.to(state, { rate: 1, duration: 1.1, delay: 0.25, ease: "power2.out", onUpdate: apply, overwrite: "auto" });
        },
    });
}

/**
 * 4. The origin quote is read out by scrolling: each word comes up to full ink
 * in turn, scrubbed, so scrolling back un-reads it.
 *
 * The words are real text nodes wrapped in spans by the server, so the sentence
 * is selectable, searchable and fully legible before this runs.
 */
function readTheQuote(gsap: G, qa: (sel: string) => HTMLElement[]) {
    const words = qa(".pw-about-word");
    if (!words.length) return;

    gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
            opacity: 1,
            ease: "none",
            stagger: 0.4,
            scrollTrigger: {
                trigger: words[0].closest(".pw-about-quote"),
                start: "top 78%",
                end: "bottom 52%",
                scrub: 0.5,
            },
        },
    );
}

/** 5. The pillar index deals in, a row at a time. */
function dealTheIndex(gsap: G, ScrollTrigger: G, qa: (sel: string) => HTMLElement[]) {
    const rows = qa(".pw-about-index > li");
    if (!rows.length) return;

    ScrollTrigger.batch(rows, {
        start: "top 92%",
        once: true,
        onEnter: (batch: Element[]) =>
            gsap.from(batch, {
                opacity: 0,
                x: -28,
                duration: 0.85,
                ease: "expo.out",
                stagger: 0.07,
                overwrite: true,
            }),
    });
}

/** 6. The register deals a screenful of rows at a time, plates first. */
function dealTheRegister(gsap: G, ScrollTrigger: G, root: HTMLElement) {
    const rows = Array.from(root.querySelectorAll<HTMLElement>(".pw-about-person"));
    if (!rows.length) return;

    ScrollTrigger.batch(rows, {
        start: "top 94%",
        once: true,
        onEnter: (batch: Element[]) => {
            gsap.from(batch, {
                opacity: 0,
                y: 26,
                duration: 0.9,
                ease: "expo.out",
                stagger: 0.06,
                overwrite: true,
            });
            gsap.from(
                batch.map((row) => row.querySelector(".pw-about-plate")).filter(Boolean),
                { scale: 0.7, opacity: 0, duration: 0.8, ease: "back.out(1.6)", stagger: 0.06, overwrite: true },
            );
        },
    });
}

/** 7. The sign-off gets depth: the wordmark and the grid drift at their own rates. */
function closingDrifts(gsap: G, q: (sel: string) => HTMLElement | null) {
    const band = q(".pw-about-closing");
    if (!band) return;

    gsap.timeline({ scrollTrigger: { trigger: band, start: "top bottom", end: "bottom bottom", scrub: 0.7 } })
        .fromTo(q(".pw-about-closing__ghost"), { xPercent: 16 }, { xPercent: -6, ease: "none" }, 0)
        .fromTo(q(".pw-about-closing__grid"), { yPercent: -8 }, { yPercent: 8, ease: "none" }, 0);
}

/**
 * 8. The chapter rail: a fixed hairline whose fill tracks the whole page, and
 * whose ticks light as their chapter comes into view. It is the page's HUD, and
 * it is the only fixed element added here — no backdrop-filter (gotcha 51).
 */
function chapterRail(gsap: G, ScrollTrigger: G, qa: (sel: string) => HTMLElement[], root: HTMLElement) {
    const fill = root.querySelector<HTMLElement>(".pw-about-rail__fill");
    if (fill) {
        gsap.fromTo(
            fill,
            { scaleY: 0 },
            {
                scaleY: 1,
                ease: "none",
                transformOrigin: "top center",
                scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.3 },
            },
        );
    }

    for (const tick of qa(".pw-about-rail__tick")) {
        const target = tick.dataset.target ? root.querySelector(tick.dataset.target) : null;
        if (!target) continue;
        ScrollTrigger.create({
            trigger: target,
            start: "top 60%",
            end: "bottom 40%",
            toggleClass: { targets: tick, className: "is-live" },
        });
    }

    // The rail is hidden until the stage has been passed: it is a reading aid,
    // and there is nothing to track while the opening screen is still up.
    //
    // `endTrigger` is the closing band, not the stage and not the page. With the
    // stage as both, the window closed the moment the stage scrolled off the
    // top; with the page, the rail stayed lit over the site footer, where its
    // ink-coloured ticks sat unreadable on top of the footer's links.
    const rail = root.querySelector<HTMLElement>(".pw-about-rail");
    const stage = root.querySelector<HTMLElement>(".pw-stage");
    const closing = root.querySelector<HTMLElement>(".pw-about-closing");
    if (rail && stage && closing) {
        ScrollTrigger.create({
            trigger: stage,
            start: "bottom 70%",
            endTrigger: closing,
            end: "top 40%",
            toggleClass: { targets: rail, className: "is-on" },
        });
    }
}
