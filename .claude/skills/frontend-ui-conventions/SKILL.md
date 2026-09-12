# Frontend & UI Conventions

## Purpose
Build pages and components that look and behave like the rest of PharmaWallah.

## Trigger Examples
- "build the X page"
- "this page looks inconsistent"
- "add a card / modal / tab to Y"
- "fix the dark mode on Z"

## Read First
- `tailwind.config.ts` — the brand tokens, shadows, and animations.
- `src/app/layout.tsx` + `src/components/AppShell.tsx` — the shell every page sits inside.
- The closest existing page in the same pillar.

## Architecture Context

### Stack
- **Tailwind CSS v3** (JS config, `darkMode: "class"`) — not v4, so no CSS-first config.
- **`next-themes`**, `attribute="class"`, `enableSystem`, `defaultTheme="light"`.
- **`lucide-react`** for icons (`@iconify/react` exists but is marginal — prefer lucide).
- **`framer-motion`** for animation, on nearly every page.
- **Outfit** via `next/font/google` (variable, full 100–900), applied as `font.className` on
  `<body>` **and** as `font.variable` (`--font-outfit`) on `<html>`. `tailwind.config.ts` maps
  `fontFamily.sans` to that variable, so `font-sans` is Outfit too. It is the **only** face on
  the site apart from monospace — do not introduce another; see `MEMORY.md` §2.
- Charts `recharts`; canvas `konva`/`react-konva`; 3D `three`/`3dmol`; `react-slick` carousels;
  `react-hot-toast` toasts; `canvas-confetti` for celebrations; `jspdf` + `html2canvas` for exports.

### Brand tokens (`tailwind.config.ts`)
```
brandBlue #1C7BD9   brandGreen #21B67A
primary   #1C7BD9   secondary  #21B67A   success #21B67A
textDark  #1A1A1A   textLight  #4A4A4A   grey    #6B7280
softBg    #F4FBFF   softBg2    #E9F7F2   deepSlate #E0F5FF

clinicalPrimary #1C7BD9  clinicalAccent #0D9488  clinicalDark #0F172A
clinicalMuted   #64748B  clinicalSurface #F8FAFC
```
Shadows: `input-shadow`, `course-shadow`, `testimonial-shadow1/2`, `clinical-glow`.
Animations: `marquee`, `fade-up`, `clinical-float`, `clinical-float-delayed`, `clinical-pulse`.

### Page conventions
- **Pages are `"use client"`** almost without exception. Server work lives in route handlers and
  `src/actions/lesson.ts`.
- **Large single files are the norm** — a page carries its own types, constants, presets, and UI.
  Extract to `src/components/` only when something is genuinely reused.
- **Decorative background icons** are a recurring motif: a `BG_ICONS`/`bgIcons` array of
  `{ Icon, top, left, size }` scattered behind the content.
- **Motion variants** are declared as module constants:
  ```ts
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const fadeUp  = { hidden: { opacity: 0, y: 18 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } } };
  ```
- **Section banner comments** separate regions:
  `// ─── STRICT TYPES & INTERFACES ───` / `// ══════ SLIDE DATA ══════`.
- **Spotting test pages deliberately opt out** of the brand palette in favour of local hex
  stain-palette constants (`INK`, `PAPER`, `VIOLET`, `ROSE`, `TEAL`…). Follow the neighbour.

### Route groups
`(site)` and `(tools)` add **no URL segment** — they exist only to group files and share a layout.

## Procedure
1. **Open the closest existing page and match it.** Structure, naming, comment banners, motion
   variants, icon choices. Consistency here matters more than personal preference.
2. Start `"use client"` unless the page genuinely needs server-only data.
3. Use brand tokens, not raw hex — except where the neighbouring page uses a local palette.
4. Use `lucide-react` icons and `framer-motion` motion. Do not introduce a third library for either.
5. Support **dark mode** (`darkMode: "class"`) — every colour needs a `dark:` counterpart.
6. Make it **responsive**; these pages are used on phones during labs and lectures.
7. **Add tracking** if it is a learning surface — `useTracker()` / `<UnitTracker />`, never a raw
   fetch (see `progress-tracking`).
8. **Register it** where relevant: nav (`src/components/Layout/Header/Navigation/`), the calculator
   hub, or the course registry. A page nothing links to is invisible.
9. Add a disclaimer via `src/components/MedicalDisclaimerBanner.tsx` on anything clinical.

## Files Usually Involved
- `tailwind.config.ts`, `src/app/globals.css`, `src/Style/`
- `src/components/AppShell.tsx`, `src/components/Layout/`
- `src/components/{ui,Common,SharedComponent}/`
- `src/components/{MedicalDisclaimerBanner,ScrollToTop,Metadata}.tsx`

## Security Checks
- [ ] No `NEXT_PUBLIC_*` secret referenced in a client component.
- [ ] **Never import `@/lib/supabase-admin` or `createServiceSupabaseClient` from a client
      component** — that would put the service-role key in the browser bundle.
- [ ] No `dangerouslySetInnerHTML` with unsanitised content. Lesson HTML comes from in-repo
      markdown via `src/actions/lesson.ts`; user-submitted content must use `react-markdown`.
- [ ] External images must have their host in `next.config.mjs` `remotePatterns` (currently only
      `upload.wikimedia.org` and `princetonlibrary.org`).

## Validation
- Form inputs guard against `NaN` and empty values before displaying a result.
- Loading and error states exist for anything fetching — `DashboardErrorBoundary.tsx` is the
  precedent for error boundaries.
- Images have `alt` text; interactive elements are keyboard reachable.

## Tests & Verification
```bash
npx tsc --noEmit
npm run dev
```
Check in the browser: light **and** dark mode; a narrow viewport; the page reachable from its
navigation entry (not just by URL); animations do not fight the scroll. **No tests exist** and there
is no visual regression tooling — looking at it is the verification.

## Common Failure Modes
- **Building a page nothing links to.** Registries and nav are hand-maintained.
- **Forgetting dark mode** — `darkMode: "class"` means nothing is automatic.
- **Setting a `font-family` in a page's own CSS.** The site has one typeface. If a page really must
  name a stack (styled-jsx, a `const CSS` string, an inline style), lead it with
  `var(--font-outfit)`. In SVG `<text>`, use `fontFamily="inherit"` — a `var()` in a presentation
  attribute is not reliably substituted.
- **Raw hex instead of brand tokens** (outside the deliberate spotting-palette exception).
- **Importing a server-only module into a client component** — build error at best, key exposure at
  worst.
- **Adding a remote image host** without updating `next.config.mjs`.
- **Applying Tailwind v4 syntax.** This is v3 with a JS config.
- **Over-extracting components** into a shared directory when the repo's norm is self-contained
  pages — it makes the change read foreign.
- **Tracking progress with a raw fetch** instead of `queueActivity`/`useTracker`.

## Do Not
- Do not add a competing icon, animation, or styling library.
- Do not restyle unrelated pages while working on one.
- Do not remove existing rationale comments.
- Do not hand-edit `public/sw.js` or `public/workbox-*.js`.

## Update Project Knowledge
Add genuinely new shared components to `.claude/PROJECT_MAP.md`. If you establish a new UI
convention (a first shared calculator layout, say), record it in `CLAUDE.md` §6 Engineering Rules.
