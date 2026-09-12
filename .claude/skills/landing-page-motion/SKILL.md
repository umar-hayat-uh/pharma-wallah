# Landing Page & GSAP Motion

## Purpose
Change the marketing landing page at `/` — its sections, its copy, or its motion — without
breaking the scroll, leaking GSAP into the rest of the site, or tripping the site-wide CSS that
fights it.

## Trigger Examples
- "change the hero headline / the stats / the discipline list"
- "add a section to the landing page"
- "the homepage scroll is janky / a section is pinned wrong"
- "the animation doesn't fire" / "something flashes before it animates"
- anything touching `src/components/Home/landing/`

## Read First
- `src/components/Home/landing/LandingPage.tsx` — what the page is made of, in order.
- `src/components/Home/landing/useLandingMotion.ts` — **every** timeline on the page.
- `src/components/Home/landing/landing.css` — the scoped styles, including the block at the bottom
  that neutralises `globals.css`.
- `.claude/MEMORY.md` §8 gotchas **30, 33, 34, 35** — all four were paid for on this page.
- `.claude/skills/adsense-monetization/SKILL.md` before moving anything near an ad band.

## Architecture Context

The page is **ADME** — what happens to a drug after you take it. Four stations, one idea each, so
no two sections animate the same way:

| Station | Section | The one idea |
| --- | --- | --- |
| 01 Absorption | `StationAbsorption.tsx` | a rail of notes travels sideways while pinned (Draggable + inertia on touch) |
| 02 Distribution | `StationDistribution.tsx` | rows sweep a gradient up; a preview tile trails the cursor |
| 03 Metabolism | `StationMetabolism.tsx` | a pinned, scrubbed MCQ answered over three labelled beats |
| 04 Elimination | `StationElimination.tsx` | a DrawSVG dial and a counting scoreboard |

Around them: a preloader, the pointer-repelling bond lattice, a cycling headline word, an SVG
"spine" a molecule rides the whole length of, a ScrambleText AI answer, magnetic buttons, a fixed
ADME rail, and three ad bands.

**Division of labour.** The section components are markup plus `data-*` attributes; they contain
no animation. `useLandingMotion.ts` owns all of it, inside a single `gsap.matchMedia(root)` with
three branches — `desk` (min-width 1025px), `mob`, and `reduce`. The copy lives in `data.ts`.

**Plugins in use** (all free since GSAP 3.13, all shipped in the npm package): ScrollTrigger,
ScrollToPlugin, Draggable, InertiaPlugin, DrawSVGPlugin, MotionPathPlugin, ScrambleTextPlugin,
SplitText, CustomEase.

## Procedure

1. **Find out whether you are changing markup, copy, or motion.** Copy → `data.ts`. Markup → the
   station file. Motion → `useLandingMotion.ts`. Do not blur the three.
2. **Adding an element you want animated:** give it a `data-*` hook in the markup and address it
   from the hook. Selector strings inside the hook are scoped to the page root by
   `gsap.matchMedia(root)` — plain `".leaf"` is safe, it cannot reach another page.
3. **Anything that fades or slides in on scroll** gets `data-anim` and is picked up automatically
   by `genericReveals()`. Do not write a bespoke trigger for a plain reveal.
4. **Anything that must not flash before hydration** must be covered by the `is-loading` rule in
   `landing.css`. That class is removed in the same layout effect that sets the GSAP start states,
   and `<noscript>` in `LandingPage.tsx` unhides everything for a client that never runs it.
5. **Register every listener you add in `disposers`**, and never create a tween outside the
   `mm.add()` callback. `mm.revert()` on unmount is the only cleanup, and a pinned ScrollTrigger
   that survives a client-side navigation breaks the *next* page's scrolling silently.
6. **Fill in all three matchMedia branches.** A new interaction needs a non-pinned touch fallback
   and a static reduced-motion end state, or the page is broken for both.
7. **New bespoke CSS goes in `landing.css` under `.pw-landing`**, not `globals.css`. Shared
   controls (buttons, cards, badges, inputs) still come from `src/components/ui`.
8. **Never put an ad band inside a pinned or transformed parent**, never animate one, and keep its
   `z-index` above every decorative layer.

## Files Usually Involved
- `src/components/Home/landing/*` — the whole page.
- `src/app/page.tsx` — renders it for the non-clinical branch.
- `src/components/calculators/AdSlot.tsx` — the ad units the bands wrap.
- `src/components/Home/tournament/index.tsx` — the launch banner above the hero.

## Security Checks
- [ ] No `NEXT_PUBLIC_*` secret referenced — the page is entirely client-rendered.
- [ ] No service-role import: `@/lib/supabase-admin` and `createServiceSupabaseClient` would ship
      the key to the browser.
- [ ] Copy claims (student counts, MCQ counts) are marketing figures in `data.ts`, not live data —
      don't wire them to a real query without deciding whether the number should be public.

## Validation
- Every `href` in `data.ts` resolves to a route that exists under `src/app/(site)/`.
- The page still renders its text server-side: the AI answer and every heading are in the HTML
  before JavaScript runs (`curl localhost:3000/ | grep`), because the effects clear and retype them.
- No horizontal scrollbar at 390px.

## Tests & Verification
```bash
npx tsc --noEmit        # baseline 0 errors
npm run dev             # then exercise the page
```
**There are no tests and lint does not run.** Looking at it is the verification, and the cheap way
to do that thoroughly is headless Chrome over CDP — load the page, scroll to a list of offsets,
screenshot each, and collect `Runtime.exceptionThrown` / console errors. Check, at minimum:

- desktop (1440×900) full sweep, touch (390×844) full sweep;
- `Emulation.setEmulatedMedia` with `prefers-reduced-motion: reduce` — preloader skipped, every
  element visible, answer marked, dial at 82%, AI text unscrambled;
- `document.querySelectorAll('.pin-spacer').length` is **2** on desktop and **0** on touch;
- the launch popup (`localStorage: pw_launch_banner_dismissed_at`) dismissed, or it covers the page.

**Do not run `npm run build` while a dev server is up** — `MEMORY.md` §8 gotcha 21.

## Common Failure Modes
- **A section animates but nothing is visible.** The element is hidden by the `is-loading` rule and
  your tween never ran, or it is not covered by the rule and flashed instead.
- **Scroll feels laggy or a scrub lags the pointer.** `globals.css` sets
  `html { scroll-behavior: smooth }`; the page suspends it with `html.pw-landing-mounted`. If you
  render the page outside `LandingPage.tsx`, that class is never applied.
- **Bullets appear in a menu or list.** `globals.css` styles every `ul`/`li` with a `:not()`
  selector that out-specifies plain utilities — you need `!list-none`.
- **A `motionPath` tween ignores a rebuilt path.** MotionPathPlugin samples the path when the tween
  is created. `spine()` kills and recreates both tweens rather than refreshing them.
- **A pinned section's height is measured before the pins exist**, so the spine is built against the
  wrong page height. `spine()` rebuilds after a short delay and on a throttled resize.
- **`gsap.utils.throttle` does not exist.** GSAP ships no throttle util; `useLandingMotion.ts` has a
  local one. The original prototype called it and would have thrown.
- **Scrolling back up leaves the MCQ already answered.** The deck timeline adds classes with
  `.call()`; `onReverseComplete` removes them again.

## Do Not
- Do not import `gsap` anywhere outside `src/components/Home/landing/`. It is ~70 KB and the site
  has ~170 routes — `CLAUDE.md` §6 rule 13 and `MEMORY.md` §8 gotcha 33.
- Do not move landing styles into `globals.css`.
- Do not animate, transform, or pin anything containing an ad band.
- Do not delete `src/components/Home/{Hero,Companies,Courses,Features,ContactForm}` without a
  decision about the contact form's Resend lead channel.

## Update Project Knowledge
New section or new motion → update this skill's station table and `.claude/PROJECT_MAP.md`. A trap
that cost you time → `.claude/MEMORY.md` §8 and this skill's Common Failure Modes.
