# PharmaWallah — Brand & Content Brief

> **Purpose:** paste this whole file into a fresh Claude (or any design tool) that is making social
> media content for PharmaWallah. It contains everything needed to get the colours, typeface, voice
> and facts right without seeing the codebase.
>
> **Every number and hex value here was read from the source on 2026-09-20.** Do not round the
> numbers up for effect — our audience is pharmacy students and they will check.

---

## 1. What PharmaWallah is

PharmaWallah is a free pharmacy education platform for **Doctor of Pharmacy (Pharm-D) students**,
built by pharmacy students in **Karachi, Pakistan**, for the syllabus they are sitting themselves.

It is free, it needs no account, and it is written and checked by the 18 students who make it.

There is also a **clinical sub-brand** at `clinical.pharmawallah.com` — decision-support tools aimed
at practising pharmacists rather than students. It shares the logo but uses a cooler, more clinical
palette (see §4).

**The site's own one-line story:**
> "We were never short of study material. We were short of one place to put it."

**Headline on the homepage:** *The whole Pharm-D, Solved.* — where the last word cycles through
**Solved. / Measured. / Practised. / Explained.**

**Logo tagline:** *Your Pharmacy Learning Hub*

---

## 2. Audience

| | |
| --- | --- |
| **Primary** | Pharm-D students, years 1–5, Pakistan-first (Karachi especially) |
| **Secondary** | Practising/community pharmacists (the `clinical.` sub-brand) |
| **Context** | Studying for semester exams, practicals, spotting tests and vivas |
| **Language** | English. Pakistani academic English is the register — not American campus slang |
| **What they feel** | Short on time, buried in photocopied handouts, unsure what's on the paper |
| **What wins them** | A specific formula solved correctly, faster than their notes would |

They are technical. They know what a Henderson–Hasselbalch equation is. **Do not talk down to them
and do not over-explain basic pharmacy terms.**

---

## 3. Voice and tone

PharmaWallah sounds like **a competent senior who has already sat the exam** — calm, exact, generous,
never hypey.

**Do:**
- Lead with the specific thing. "Clearance, dosing, isotonicity, half-life — worked and explained."
- Use exact measured numbers. "104 calculators", not "100+ calculators".
- Use real pharmacy vocabulary: Carr's index, AUC, Cockcroft-Gault, Rf value, zone of inhibition.
- Be honest about limits. Everything here is **educational**, not clinical advice.
- Short declarative sentences. Full stops do the work that exclamation marks would.
- Address the reader as "you" where it helps.

**Don't:**
- ❌ No hype words: "revolutionary", "game-changing", "unlock your potential", "level up", "10x".
- ❌ No emoji spam. At most one, and usually none. The brand is a lab bench, not a group chat.
- ❌ No fake urgency, countdowns or "limited time".
- ❌ No invented statistics. If a figure isn't in §6 of this file, don't state it.
- ❌ No claiming clinical authority (see §9 — this one matters legally).
- ❌ No "AI-powered" as the headline. AI is one feature, not the pitch.

**Sample lines in the right voice** (these are real product copy):
- "Every formula a Pharm-D asks of you, worked and explained."
- "Run the experiment before the practical."
- "Semester by semester, unit by unit, with an MCQ bank behind each subject."
- "Histology, pathology and powder microscopy slides — then a timed identification test."

---

## 4. Colour system

### Core brand — use these two above all else

| Token | Hex | Use |
| --- | --- | --- |
| **brandBlue** | `#1C7BD9` | Primary. Headlines, links, the blue half of the mark |
| **brandGreen** | `#21B67A` | Secondary/accent. Success states, the green half of the mark |

### The signature: the blue→green gradient

This gradient **is** the brand. It is the single most recognisable element after the logo.

```css
linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%)
```

**Critical rule — text on the gradient.** Raw `#21B67A` is too light for white text (2.61:1 contrast,
fails WCAG). Every surface that carries text lays a **navy scrim** over the gradient first:

```css
/* Panels, heroes, full-bleed bands with text — white text reaches 5.72:1 */
background: linear-gradient(rgba(6,18,36,.40), rgba(6,18,36,.40)),
            linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%);

/* Buttons / small strong labels — a touch brighter, white reaches 4.60:1 */
background: linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)),
            linear-gradient(120deg, #1C7BD9 0%, #21B67A 100%);
```

Use **white** (or `white/90` minimum) for text on either. **Never put green text on the gradient.**

### Neutrals

| Token | Hex | Use |
| --- | --- | --- |
| textDark | `#1A1A1A` | Body text, headings on light grounds |
| textLight | `#4A4A4A` | Secondary text |
| grey | `#6B7280` | Muted labels, captions |
| softBg | `#F4FBFF` | Pale blue page background |
| softBg2 | `#E9F7F2` | Pale green alternate background |
| deepSlate | `#E0F5FF` | Slightly deeper blue tint |
| Pure white | `#FFFFFF` | Cards, the ground the logo sits on |

### Accent / category colours

These identify the six product pillars. Useful for giving a series of posts distinct identities:

| Pillar | Hex | Colour |
| --- | --- | --- |
| Calculations | `#1C7BD9` | brand blue |
| Courses | `#1F9D63` | deep green |
| Spotting | `#F08C2E` | amber |
| Simulations | `#13A89E` | teal |
| Tournament | `#E5484D` | red |
| Clinical | `#7A5AF8` | violet |

### Clinical sub-brand palette

Cooler and more restrained than the student site:

| Token | Hex |
| --- | --- |
| clinicalPrimary | `#1C7BD9` (same blue) |
| clinicalAccent | `#0D9488` (teal) |
| clinicalDark | `#0F172A` (slate navy) |
| clinicalMuted | `#64748B` |
| clinicalSurface | `#F8FAFC` |

### ⛔ The hardest colour rule: **no black grounds**

This is an explicit, standing brand rule. Anywhere a design would reach for a black or dark-ink
background, **it uses the blue→green gradient with the navy scrim instead**. Black backgrounds are
off-brand. The darkest legitimate ground is the scrimmed gradient (which reads as deep navy-teal).

Ink (`#1A1A1A`) stays a *text* colour, never a background.

---

## 5. Typography

**One typeface across the entire product: [Outfit](https://fonts.google.com/specimen/Outfit)** —
a geometric sans, loaded as a variable font so the full 100–900 weight range is available.

| Role | Treatment |
| --- | --- |
| Display headlines | Outfit, 700–900, tight tracking (`-0.02em` to `-0.03em`), balanced wrapping |
| Body | Outfit 400–500, generous line height (~1.6) |
| Eyebrows / small labels | Outfit or mono, **uppercase**, letter-spaced `0.12em`–`0.14em`, ~11px |
| Figures and data | Tabular/monospace numerals — numbers should align in a column |

**Supporting faces (use sparingly, only where they earn it):**
- **JetBrains Mono** — instrument labels, codes, measured figures, "01 / 02 / 03" numerals.
- **Caveat** — handwritten marker annotations. The homepage is styled as a whiteboard explainer,
  so a hand-drawn underline or circled word in Caveat is on-brand for teaching moments.

If Outfit is unavailable, the closest substitutes are Poppins or Jost — but Outfit is strongly
preferred and is free on Google Fonts.

---

## 6. Logo and mark

### The mark
An **open book** seen head-on, its left half in brand blue and its right half in brand green, with a
**vertical capsule standing in the gutter** of the book — the capsule's top half blue, bottom half
green, each half carrying a soft white highlight stroke. It sits on **white**.

Meaning: medicine (capsule) and study (book), in one symbol.

### The wordmark
Mark to the left, then **"PharmaWallah"** set in a geometric sans (Outfit-compatible), with
**"Your Pharmacy Learning Hub"** as a lighter line beneath, optically aligned to the wordmark's width.
Aspect ratio of the full lockup is roughly **3.24 : 1**.

### Usage rules
- The mark's home is a **white or very light tile** — that is how it appears in the app icon, the
  header CTA and the download page. Do not place the colour mark directly on the gradient; put it on
  a white rounded tile first.
- A **white/monochrome** version exists for dark or gradient grounds.
- Keep clear space of at least the capsule's width on all sides.
- Never recolour, stretch, rotate, add effects to, or reconstruct the mark.
- **Asset files in the repo:** `public/images/logo/logo.svg` (white lockup),
  `public/icons/icon-512x512.png` (colour mark on white, plus 48–384px sizes).

---

## 7. Visual language

The product's design language is **a laboratory bench and a well-set textbook**, not a SaaS landing
page.

- **Measured, ruled, precise.** Hairline rules, numbered sections (`01`, `02`), index-style lists,
  table-of-contents leader dots.
- **The whiteboard explainer.** The homepage is built as a scroll-scrubbed whiteboard lesson —
  marker highlights swiping behind words, a pen drawing a stroke, hand-lettered numerals. Marker
  strokes and circled terms are strongly on-brand.
- **Result first.** Every calculator shows the answer at the top, then the working below. Mirror that
  hierarchy in posts: the answer/hook first, the explanation after.
- **Glass and depth, lightly.** Result cards use a soft "liquid glass" treatment — a specular sheen
  drifting across the gradient. Subtle, never gaudy.
- **Generous whitespace.** Light grounds (`#F4FBFF`, white) with one strong gradient element.
- **Motion curve**, if anything animates: `cubic-bezier(0.16, 1, 0.3, 1)` — it settles like a physical
  control rather than a UI easing.

**Imagery:** diagrams, molecular structures, petri dishes, TLC plates, titration burettes, histology
slides, tablet presses. **Avoid** generic stock photos of smiling people in lab coats, and avoid
the pill-pile / mortar-and-pestle clichés.

---

## 8. Verified facts you may state in posts

All measured from the codebase on **2026-09-20**. These are safe to publish.

| Fact | Figure |
| --- | --- |
| Pharmacy calculators | **104** built (98 listed on the hub across 10 subject categories) |
| Calculator categories | Pharmaceutical Chemistry (16), Clinical & Hospital Pharmacy (18), Pharmaceutics (16), Biopharmaceutics & Pharmacokinetics (14), Pharmaceutical Analysis (10), Unit Conversion (6), Pharmacology (6), Microbiology (6), Pharmaceutical Engineering (4), Physiology (2) |
| Course lessons | **69** markdown lessons |
| Wet-lab simulations | **8** — titration, disk diffusion, UV, staining, buffer, dilution, organic ID, lab guide |
| Spotting disciplines | **3** — histology, pathology, powder microscopy (with timed identification tests) |
| Drug encyclopedia | **12,673** drugs (4,398 approved, 9,404 small molecules, 3,269 biotech) |
| Community spaces | **12** pharmacy-specific spaces |
| Android app | **v1.4**, **8.9 MB**, works fully **offline**, contains all **104** calculators, **ad-free** |
| Team | **18** students |
| Price | **Free.** No account required to use the tools |

**The six pillars, with the site's own words** (excellent as a six-post carousel):

| # | Pillar | Figure | Line |
| --- | --- | --- | --- |
| 01 | Calculations | 104 tools | Clearance, dosing, isotonicity, half-life — every formula a Pharm-D asks of you, worked and explained. |
| 02 | Courses | 69 lessons | Semester by semester, unit by unit, with an MCQ bank behind each subject. |
| 03 | Spotting | 3 disciplines | Histology, pathology and powder microscopy slides — then a timed identification test. |
| 04 | Simulations | 8 wet labs | Titration, disk diffusion, UV, staining — run the experiment before the practical. |
| 05 | Tournament | Live scoring | A science-fair competition with server-graded answers and a public leaderboard. |
| 06 | Clinical | Decision support | Drug finder, interaction checkers, AMR surveillance and a literature search for practising pharmacists. |

**Standout features worth their own posts:**
- **TLC Rf Analyzer** — photograph a TLC plate, get every Rf value calculated on your device.
- **Colony Counter** — photograph an agar plate; it finds and counts colonies, you verify each one,
  then it calculates CFU/mL. Works offline.
- **Molecular Lab** — draw molecules from scratch, see them in 2D and 3D, with an 83-molecule library.
- **Community Pharmacy Simulation** — work a real counter: clinical checks, interventions, dispensing,
  labelling and counselling, with a debrief across six competencies.
- **Disk Diffusion Lab** — swab the plate, place the disks, incubate, then measure each zone yourself
  with a draggable calliper.
- **AI Guide** — a streaming pharmacy tutor with five study modes.

**Links and handles:**
- Website: `pharmawallah.com`
- Clinical: `clinical.pharmawallah.com`
- Instagram: **@pharmawallah_com**

---

## 9. ⚠️ Things you must never claim

These are not stylistic preferences — they protect the project.

1. **Never present PharmaWallah as clinical advice or a clinical authority.** Every calculator on the
   site carries an "educational purposes only" disclaimer. Posts must not imply a pharmacist or
   student should dose a real patient from our output.
2. **Never state a number that isn't in §8.** No "thousands of students", no "trusted by X
   universities", no user counts — none of that is measured.
3. **Never claim the calculators are clinically validated or error-free.** Some formulas are known to
   need review. Position them as study and practice tools.
4. **Never claim clinical content has been reviewed by a pharmacist** — the simulation content is
   written as teaching material and has not been.
5. **Never reproduce or offer textbook content.** We deliberately removed a books library over
   copyright. The line the site uses is: *"We don't host textbook scans — those aren't ours to give
   away."*
6. **Never imply medical, diagnostic or prescribing capability** for the AI features.

Safe framing: *"for study and revision"*, *"practise before the practical"*, *"check your working"*,
*"educational use only"*.

---

## 10. Post formats and ideas

**Sizes:** Instagram square 1080×1080 · portrait 1080×1350 · story/reel 1080×1920 ·
LinkedIn 1200×627 · carousel slides 1080×1350.

**Layout template that matches the brand:**
- Ground: white or `#F4FBFF`, **or** the scrimmed gradient for a "hero" post.
- Top-left: small uppercase mono eyebrow, letter-spaced (e.g. `PHARMACOKINETICS`).
- Centre: one large Outfit headline, tight tracking, ink `#1A1A1A` (or white on gradient).
- A single accent element: a marker swipe, a hairline rule, or a numeral in the pillar colour.
- Bottom: the logo tile + `pharmawallah.com`, small and quiet.
- **One idea per image.** Resist filling the space.

**Series ideas that fit the brand:**
1. **"Formula of the day"** — one equation, set beautifully, with the worked example underneath and
   a link to the matching calculator.
2. **"Spot it"** — a histology or powder-microscopy slide with four options; answer in the next slide.
3. **"Before the practical"** — a single step from a simulation (standardise the inoculum, measure the
   zone) as a teaching card.
4. **The six pillars carousel** — one slide per pillar using the table in §8, each in its own colour.
5. **"Works offline"** — the Android app: 104 calculators, 8.9 MB, no ads, no account.
6. **Exam-season countdown** — a subject a day, linking to its lessons and MCQ bank.
7. **Myth vs method** — a common calculation mistake, then the correct working.

---

## 11. Copy-paste summary (the short version)

> PharmaWallah is a free Pharm-D study platform built by 18 pharmacy students in Karachi.
> Brand colours: blue `#1C7BD9` → green `#21B67A`, used as a 120° gradient; when text sits on it,
> lay `rgba(6,18,36,.40)` navy over the gradient first and set the text in white.
> **Never use a black background** — use the scrimmed gradient instead.
> Typeface: **Outfit** (variable, 100–900), with JetBrains Mono for figures and Caveat for
> handwritten marker annotations. Ink `#1A1A1A`, pale grounds `#F4FBFF` / `#E9F7F2`.
> Logo: an open book, left half blue and right half green, with a two-tone capsule standing in the
> gutter, on a white tile. Tagline: *Your Pharmacy Learning Hub.*
> Voice: precise, calm, generous, never hypey; exact numbers only; real pharmacy vocabulary; no
> emoji spam; no clinical claims — everything is for education only.
> Headline to build from: **"The whole Pharm-D, Solved."**
> Facts: 104 calculators, 69 lessons, 8 wet-lab simulations, 3 spotting disciplines, 12,673 drugs,
> a free offline Android app (v1.4, 8.9 MB, ad-free). Free, no account needed.
> Site: pharmawallah.com · Instagram: @pharmawallah_com

---

*Maintained alongside the code. If a colour token, typeface or headline count changes in the repo,
update this file in the same task — it is the only brand reference the marketing side has.*
