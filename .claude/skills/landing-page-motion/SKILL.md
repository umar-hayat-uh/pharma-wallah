# Landing Page & GSAP Motion

## Purpose
Change the marketing landing page at `/` — its sections, its copy, its marker annotations or its
motion — without breaking scroll, leaking GSAP into the rest of the site, covering an ad, or
tripping the site-wide CSS that fights it.

## Trigger Examples
- "change the hero headline / the stats / the pillar list"
- "add a section / an annotation / a chapter to the landing page"
- "the marker doesn't draw" / "the pen is in the wrong place" / "something flashes before it animates"
- anything touching `src/components/Home/landing/`

## Read First
- `src/components/Home/landing/LandingPage.tsx` — what the page is made of, in order.
- `src/components/Home/landing/useIndexMotion.ts` — **every** GSAP tween on the page.
- `src/components/Home/landing/landing.css` — the scoped styles (`.pw-idx`), including the block at
  the bottom that neutralises `globals.css`.
- `.claude/MEMORY.md` §8 gotchas **29, 30, 33, 41–45** — all paid for on this page.
- `.claude/skills/top-design/SKILL.md` — the design standard the page was built to.
- `.claude/skills/adsense-monetization/SKILL.md` before adding any ad back (there are none now).

## Architecture Context

The page is **"The Index", played as a whiteboard explainer video** (rebuilt 2026-09-13; the
previous ADME page is in git at `5dbe98c`).

- **The board.** `.pw-idx` paints a white board with a 26px dot grid and soft light pools. Sections
  are panels separated by dashed marker rules; ghost formulas (`::before`) look half-erased.
- **Marker annotations** (`Marks.tsx`): `<Mark kind>` renders hand-authored SVG strokes, each
  `<path data-draw>`; `<Note>` is Caveat handwriting with `data-write`. All are `aria-hidden`.
- **Playback is scroll.** Marks and notes outside the hero are scrubbed to scroll position, so
  scrolling back un-draws them. Hero marks are *played* in the load timeline (they are on screen
  at frame one). A marker pen (`Pen` in `Chrome.tsx`) rides the tip of whatever is drawing.
- **No timeline bar, no play button.** The fixed scroll-timecode bar (`Player.tsx`) and its
  `CHAPTERS` / `data-chapter` hooks were **removed on 2026-09-13** at the user's request; its
  14px `backdrop-filter` was also the page's biggest scroll cost (gotcha 51). Playback stays
  scroll-only by the user's earlier decision.
- **No black grounds.** Strong surfaces (primary buttons, the specimen's active tab and link hover,
  the drawn phone, its active chip) use `--brand-button` / `--brand-surface` — the blue→green
  gradient under a navy scrim (user rule 2026-09-13; values match `src/components/page-kit/brand.ts`).
- **No ad placements** — the user removed the three ad bands on 2026-09-13.

| Section | File | The one idea |
| --- | --- | --- |
| Leader | `Chrome.tsx` `Preloader` | 3-2-1 film countdown with a marker sweep; once per tab session |
| Hero (`intro`) | `Hero.tsx`, `Specimen.tsx` | cycling last word; a taped-up worked example whose figures are **computed** from real formulas. No meta strip above the headline (removed 2026-09-13, with its PKT clock) |
| Tape | `Sections.tsx` `Tape` | constant-velocity readout of the platform's figures |
| Index (`index`) | `IndexSection.tsx` | six pillars; the active row gets a highlighter in its marker colour and re-letters the numeral |
| Instrument (`tools`) | `Sections.tsx` `Instrument` | the tool count counts up, ringed in red; one ruler tick per tool |
| Offline (`offline`) | `Sections.tsx` `Offline` | the real app home screen drawn in markup |
| Close (`begin`) | `Sections.tsx` `Close` | "Begin anywhere." |

**Division of labour.** Components are markup + `data-*` hooks. `useIndexMotion.ts` owns all GSAP,
inside one `gsap.matchMedia(root)` with two branches: `reduce` (everything in its final state,
marks fully drawn, no pen) and `motion`. Copy and every figure live in `data.ts` — **all counts
derive from `STATS`**, which must match the repo (97 tool directories as of 2026-09-13).

**Fonts.** Outfit (site), plus two faces loaded by `next/font` in `LandingPage.tsx` for this route
only: JetBrains Mono (instrument labels) and Caveat (marker handwriting — annotation only, never
content).

**Plugins in use:** ScrollTrigger, CustomEase, DrawSVGPlugin (all free, in the npm package).

## Procedure

1. **Decide: copy, markup, or motion.** Copy/figures → `data.ts`. Markup → the section file.
   Motion → `useIndexMotion.ts`.
2. **Adding an annotation:** drop a `<Mark kind color className>` or `<Note>` into the section and
   position it with a class in `landing.css`. It is picked up automatically — hero ones are played,
   everything else is scrubbed. Add a new stroke shape to `SHAPES` in `Marks.tsx`; set `stretch`
   if it must fit the width of a word.
3. **Strong surfaces use `var(--brand-button)` (controls) or `var(--brand-surface)` (panels)**,
   never `var(--ink)` as a background. Gradients are not valid border colours — use `transparent`.
4. **Anything that must not flash before hydration** carries `data-in` (hero) — hidden under
   `.is-loading`, with a 4s CSS failsafe so a broken script can never hide the page.
5. **Plain scroll reveals** get `data-reveal`; do not write a bespoke trigger for them.
6. **In any GSAP callback on a `fromTo`/`from` tween, use `this`, never the returned variable** —
   see gotcha 42.
7. **Tweens on elements that also have CSS transforms** (tilted card, hover lift, rotated
   numeral) need `clearProps: "transform"` or must restate the CSS transform — gotcha 44.
8. **Register every listener in `cleanups`**, and never create a tween outside `mm.add()`.
   `mm.revert()` on unmount is the only cleanup.
9. **Bespoke CSS goes in `landing.css` under `.pw-idx`.** Shared controls still come from
   `src/components/ui`.
10. **The page has no ads, by the user's decision.** If one is ever re-added, it must not sit
    inside a transformed, scrubbed or animated parent, and no fixed overlay may cover it.

## Files Usually Involved
- `src/components/Home/landing/*` — the whole page.
- `src/app/page.tsx` — renders it for the non-clinical branch.
- `src/components/Home/tournament/index.tsx` — the Science Fair launch strip. **Unmounted since
  2026-09-13** (event over); re-mount it above `<Hero />` in `LandingPage.tsx` for a future event.

## Security Checks
- [ ] No `NEXT_PUBLIC_*` secret referenced — the page is entirely client-rendered.
- [ ] No service-role import (`@/lib/supabase-admin`, `createServiceSupabaseClient`).
- [ ] Figures in `data.ts` are counted from the repo, not invented. The specimen card's results are
      computed in code — never type a result in.

## Validation
- Every `href` in `data.ts`, `Specimen.tsx` and `Sections.tsx` resolves to a real route.
- No horizontal scrollbar at 390px (`document.documentElement.scrollWidth === 390`).
- Headings are in the server HTML; the hero sentence is in an `sr-only` span.

## Tests & Verification
```bash
npx tsc --noEmit        # baseline 0 errors
```
**There are no tests and lint does not run.** Verify by looking, with headless Chrome over CDP:

- **Both** `prefers-reduced-motion: reduce` (every mark drawn, full layout review) **and**
  `no-preference` (real motion). Reduced motion alone missed a crash that full motion caught.
- Capture full pages with `Page.captureScreenshot { captureBeyondViewport: true, clip }` at a
  real viewport size — **never** by resizing the viewport to the page height (gotcha 45).
- Preset `localStorage.pw_launch_banner_dismissed_at` or the launch dialog covers the page.
- 1440×900 and 390×844; collect `Runtime.exceptionThrown`.

**Do not run `npm run build` while a dev server is up** — `MEMORY.md` §8 gotcha 21.

## Common Failure Modes
- **"Cannot access 'tween' before initialization", hundreds of times.** A callback read the tween
  variable; use `this` (gotcha 42).
- **A card's hover lift or tilt stops working after load.** GSAP's inline transform won (gotcha 44).
- **An outlined numeral or wordmark shows stray lines through its letters.** `-webkit-text-stroke`
  on Outfit's variable glyphs draws contour overlaps — use a filled ghost instead (gotcha 43).
- **A circle mark is far too small for its word.** Aspect-locked SVG is capped by height; the shape
  needs `stretch: true`.
- **Scroll feels laggy.** First suspect anything `position: fixed` with `backdrop-filter` (the old
  timeline bar; the site header's blur) — it re-blurs the moving content every frame (gotcha 51).
  Measure with the wheel-scroll frame-time recipe in gotcha 51, not by eye. Also:
  `html.pw-idx-mounted` suspends `globals.css`'s smooth scroll-behavior while `LandingPage` is mounted.
- **Bullets appear in a list.** `globals.css`'s `li:not(.prose li)` is (0,1,2); use the doubled
  `.pw-idx.pw-idx` selector.

## Do Not
- Do not import `gsap` anywhere outside `src/components/Home/landing/` (~70 KB on ~170 routes).
- Do not add a play button or autoplay — scroll-only playback is the user's decision (2026-09-13).
- Do not move landing styles into `globals.css`.
- Do not hard-code the calculator count anywhere; derive it from `STATS`.
- Do not delete `src/components/Home/{Hero,Companies,Courses,Features,ContactForm}` without a
  decision about the contact form's Resend lead channel.

## Update Project Knowledge
New section, chapter or annotation type → this skill's table and `.claude/PROJECT_MAP.md`. A trap
that cost time → `.claude/MEMORY.md` §8 and Common Failure Modes above.
