---
name: reel-ads
description: Make a 9:16 PharmaWallah reel ad (Instagram Reels / TikTok / Shorts / WhatsApp Status) with the frame-exact HTML video kit that lives OUTSIDE this repo — storyboard, real product UI, verified figures, original music, render, inspect. Use for "make an ad / reel / promo video / TikTok for X".
---

# Reel Ads

## Purpose
Produce premium vertical video ads for PharmaWallah — the website, the offline app and individual
calculators — that look like a tech-product launch, not a slideshow, **and say nothing untrue**.
The creative standard is the owner's brief (`BRIEF.md`, verbatim, 2026-10-10). The tooling already
exists and has shipped three ads; this skill is how to use it to that standard.

## Trigger Examples
- "make a reel / ad / promo video for the app", "an Instagram ad for the TLC analyzer"
- "the visuals look bland", "change the music", "re-render ad-02 with …"
- "ad for the new calculator we just built"

## Read First
- `BRIEF.md` (this folder) — what the owner asked for. Then the override table below.
- `.claude/BRAND_KIT.md` — §3 voice, §4 colour, §5 type, §6 logo rules, **§8 the only publishable
  figures**, §9 clinical-claims limits.
- `~/personal/pharmawallah-marketing/README.md` — the kit's commands, transitions and render traps.
- `.claude/MEMORY.md` §8 gotchas **190** (calculators compute live; "Calculate" exists on only 17
  tools), **193** (video traps), **194** (this skill's brief overrides).
- The newest `ad-NN/ad.html` — the current house style. Copy, don't start blank.

## Architecture Context

**The kit is not in this repo, on purpose** (owner, 2026-10-08): every push to `main` deploys the
website. Never create video files under `pharma-wallah/` — `/marketing/video/` is gitignored as a
guard. Work in `/home/umar-hayat/personal/pharmawallah-marketing/video/` (not a git repo).

| Path (under `video/`) | What it is |
| --- | --- |
| `render.mjs` | Headless Chrome over CDP → PNG per frame → ffmpeg. 1080×1920, 30 fps, frame-exact. Writes `*.part.mp4`, renames when done. **Silent by default** (the owner adds music in Canva); `--with-music` muxes `music.wav` and keeps a `-no-music` copy |
| `_kit/kit.css` | Tokens (`--blue #1C7BD9`, `--green #21B67A`, `--mint`, `--navy #071a2f`, `--grad`), `.glass`, `.paper`, `.abs`, `.grad-text`, `#stage`, `#motifs` |
| `_kit/kit.js` | `window.kit`: `show enter words type sheen burst wipe through bloom count ground camera seg ease clamp config` — every value a pure function of `t` |
| `_kit/music.mjs` | Original synthesised bed from `cues.json` (styles `phonk` default, `funk`, `piano`, `tech`) + whooshes/clicks/chimes/pops/riser/impact on the cues; mastered to −14 LUFS |
| `_kit/assets/` | `outfit-latin.woff2`, `JetBrainsMono-Regular.ttf`, `mark.png` (the real logo mark) |
| `_kit/vendor/gsap/` | gsap 3.15 + DrawSVG, MotionPath, CustomEase — copied from the repo's `node_modules` (no npm in the kit) |
| `ad-01/` | 106 calculators + how-to-use guide, 20 s, glass look |
| `ad-02/` | Drug Stability Kinetics Calculator, 22 s, glass look, every figure from `analyseStability()` |
| `ad-03/` | "Dead zone" — the offline Android app, 20 s, blueprint look |
| `ad-05/` | "No Internet? No Problem.", 24 s: the offline app. Three real calculators captured **offline** (`capture.mjs`), an illustrated lab-bench hook, a white/blue end card, a cover poster (`poster.html` → `cover.png`) and a timed voice-over script (`vo.srt`, not recorded: no TTS here) |
| `ad-06/` | Biopharmaceutics & PK collection, 36 s (the brief asked 30–40): six real tools driven by `capture.mjs` (Cl & Vd half-life, bioavailability, clearance, first- vs zero-order plot, dialysis-membrane practical, category list), cards cropped by `crop.py`, white end card, `VOICEOVER.md` + `voiceover.srt` (not recorded) |
| `ad-07/` | Animal Weight-Based Dose + Serial Dose ("Dose Calculation" / "Animal Dose Dilution" in the owner's words), 40 s (the brief asked 40): both tools typed into keystroke by keystroke (`capture.mjs`, scroll pinned), result cards cropped from viewport shots (`crop.py`) and floated out of the phone, ring → dilution-tube transition, two phones joined by an energy line, white end card |
| `ad-08/` | "One Platform. A Whole Pharmacy Lab.", 20 s, **white ground, animated with GSAP** (one paused timeline, `render(t)` = `tl.seek(t)`): four real tools on their own example chips (Dilution, First-/Zero-Order Kinetics, Calibration Curve, Dissolution); each chart's **own SVG marks** redrawn with DrawSVG over the same chart shot bare (`capture.mjs`). New transition types (magnet assemble, container transform, 3D carousel, deck deal, column shutter) and the `"swipe"` cut sound + `"bright"` music style |
| `ad-09/` | Virtual Osteology Lab, 30 s: **the lab's own 3D models drawn live with three.js** (`_kit/vendor/three/`, GLBs embedded in `assets/models.js`, `window.READY`), six humerus labels on Z-Anatomy's anchors in anatomical columns, real lab screens from a local production build (`capture.mjs`); the lab was not deployed, so the end card says "coming soon" / "follow for updates" |
| `ad-04/` | "Stop Calculating the Hard Way", 25 s — **the reference for real app screens**: `capture.mjs` + `cdp.mjs` drive the app export and screenshot every keystroke; one persistent 3D phone (`#rig`, keyframed in `phone(t)`) carries them through all five scenes |

A scene file `ad-NN/ad.html` defines `window.DURATION`, `window.STILLS`, a `CUTS` array and
`render(t)`. Opened in a browser **without** `?capture` it loops in real time — the quick preview.

**Why not Remotion** (the brief suggests it): it is a new npm dependency with nothing to add — the
kit already gives frame-exact React-free rendering, needs only `google-chrome`, `ffmpeg` and Node
24, and has three shipped ads behind it. Introducing a second toolchain needs the owner's say-so.

### Where this brief is overridden — and why

| Brief says | Do instead | Why |
| --- | --- | --- |
| Blue `#2563EB`, green `#4ADE80` | `#1C7BD9`, `#21B67A` (kit tokens) | Those are the brand (BRAND_KIT §4) and the logo's own colours; a Tailwind-default blue beside the real mark looks off-brand. Same call every redesign session made |
| Dark navy `#0B1220` ground | Blue→green gradient under a navy scrim; navy only as scrim or ink | Standing rule: **no black grounds** (CLAUDE.md §6 rule 15) |
| Inter or Manrope | **Outfit** (+ JetBrains Mono for figures) | The product's single typeface; the kit ships it. A third face is a "Do not" |
| Example hooks | Fine — but no hype words ("level up", "revolutionary", "10x") | BRAND_KIT §3 voice |
| "App" CTAs | **Android** app only, at `pharmawallah.com/download` | The iOS app has never been run or signed; the Windows app has never been compiled. Neither exists for a student to get |
| "Mention offline only when supported" | Offline = the Android app (v1.5, all 106 calculators + guide). The **website is not offline** | MEMORY / BRAND_KIT §8 |
| 15–30 s | 18–24 s, 4–5 scenes | Tested length for the kit; still inside the brief |

Everything else in the brief stands: 1080×1920 at 30 fps, hook in the first seconds, real
interfaces, one idea per scene, readable without sound, licensed audio only, never claim a render
that does not exist.

## Procedure

1. **Pick the subject and pull the facts.** Figures only from BRAND_KIT §8, or produced by running
   the real code — e.g. a calculator's pure module (`_<tool>.ts`, `analyse…()`) through Node, on the
   same inputs the ad will show. Re-count anything older than the brand kit's date. Write each
   figure and its source in the scene file's header comment (see `ad-02/ad.html`).
2. **Check the real UI before animating it.** Results appear as you type; don't show a "Calculate"
   tap unless the tool has one (MEMORY 190). Open the page or the app to see what it really shows.
3. **Storyboard** in the header comment, mapping the brief's five beats onto the duration:
   hook (0–~3 s) · reveal · demo (the longest beat, real inputs → real result) · benefit · end card
   (mark on a white tile, `pharmawallah.com` or `pharmawallah.com/download`, "For study and practice").
   One idea per scene. Choose the `CUTS`.
4. **Copy the nearest ad**: `cp -r ad-02 ad-NN` (glass) or `ad-03` (blueprint). Give it its own
   concept — don't reskin the previous ad. Delete the copied `.mp4`, `music.*`, stills.
5. **Product UI — two options, both real:**
   - *Markup* (as ads 01–03): rebuild the screen in HTML using the real copy, labels and computed
     figures. Animatable field-by-field. Must match the live page — compare side by side.
   - *Screenshot* (verified 2026-10-10): `google-chrome --headless=new --hide-scrollbars
     --window-size=390,844 --force-device-scale-factor=3 --virtual-time-budget=8000
     --screenshot=ad-NN/assets/<name>.png "https://www.pharmawallah.com/<path>"` → a 1170×2532 PNG,
     drop it in a phone frame as an `<img>`. Look at it first: crop out any ad unit or cookie banner.
     A screenshot of a page that needs scrolling to the result: crop, or use markup.
   - *Driven app frames* (ad-04, the best of the three): serve the app export
     (`python3 -m http.server 4719 -d ../../../pharma-wallah/mobile/out`) and copy `ad-04/capture.mjs`.
     It types into the real calculator with `Input.insertText`, one screenshot per keystroke, taps
     the real button, and full-page-captures the result for panning. Hide the caret while capturing
     (it blinks in some frames and not others). Use a calculator's own example data set, so the
     figures are the tool's, and re-derive them independently before quoting them.
   - *Offline-proven app frames* (ad-05): copy `ad-05/capture.mjs` whenever the ad says "offline".
     It fails every non-local request for the whole session, and switches the browser fully offline
     after each page loads and **before** any typing or tapping, then asserts each result on the
     offline page. It writes `assets/offline-log.json` (0 external requests so far). The app bar's
     own "Offline" pill appears in every frame, an honest indicator you don't have to draw (MEMORY 195).
   Never fake an interface state the product cannot reach.
6. **3D (ad-09)**: when the subject is a 3D model the product ships, draw it live with `_kit/vendor/three/three-gltf.min.js` (the kit README's "Or three.js") rather than rendering frames elsewhere — no Blender download, frame-exact, and labels can be projected from real anchors.
   **Motion — two engines, pick one per ad.** *GSAP* (ad-08, the owner's preference since 2026-10-17 for
   "GSAP-like visuals"): load `../_kit/vendor/gsap/*.min.js`, build one `gsap.timeline({ paused: true })` lazily
   inside `render(t)` and `tl.seek(t)`; never the GSAP ticker. Use `fromTo` for entrances (immediateRender hides
   them from frame 0), CustomEase for snaps, MotionPath for curved flights, DrawSVG for lines. Split headlines
   into one masked row per visual line (MEMORY 212t). Or *the kit*:
   **Build with kit helpers only**: `kit.config.sceneOuts = true`; `through([[el,a,b],…], t,
   {styles})` for cuts — vary the style per cut (`zoom whip rise spin flip slide iris blinds`);
   `type` for kinetic words, `enter` for cards, `count` for number reveals, `sheen`/`burst` when a
   result lands, `camera` for the push, `bloom` at cuts, `ground` for the backdrop. 3D phone
   rotation = CSS `perspective` + `rotateY` driven from `seg(t,…)`. No CSS transitions, no
   `Math.random()`, no wall clock.
7. **Safe zones**: nothing important above ~200 px or below ~1540 px (platform UI covers them).
   Headlines ≥ 96 px, body ≥ 34 px, figures in JetBrains Mono.
8. **Stills, then look**: `node video/render.mjs ad-NN --stills`, and `--at a,b` around **every cut**
   to catch mid-transition frames. Read the PNGs. Fix, repeat.
9. **Music** (optional): write `cues.json` from the real timings (`cuts`, `clicks` on typed values,
   `chimes` on results, `riser`/`impact` into the end card), then `node video/_kit/music.mjs ad-NN`.
   The groove **stops at `impact`** — for an end card longer than ~3 s set `grooveUntil` (tech style)
   and a `hits` entry on the last beat, or the CTA plays in near-silence (ad-04 hit this).
   Original synthesis only — never embed a commercial track.
   To add music to an already-rendered silent MP4 without re-rendering, run the same mux as
   `render.mjs --with-music`: `ffmpeg -i ad-NN.mp4 -i music.wav -map 0:v -map 1:a -c:v copy -c:a aac
   -b:a 192k -af afade=t=out:st=<dur−0.8>:d=0.8 -t <dur> -movflags +faststart ad-NN-with-music.mp4`.
10. **Full render**: `node video/render.mjs ad-NN [--with-music]` (from `pharmawallah-marketing/`). A 25 s ad is
    750 frames and takes **over 10 minutes** — run it in the background. Done when `ad-NN.mp4`
    exists under its real name.

## Files Usually Involved
- `~/personal/pharmawallah-marketing/video/ad-NN/{ad.html,cues.json}` — new per ad.
- `~/personal/pharmawallah-marketing/video/_kit/*` — only when a helper is genuinely missing; a kit
  change must not break the existing ads (re-render a still of each).
- In this repo, **read only**: the calculator's `_<tool>.ts`, `.claude/BRAND_KIT.md`,
  `public/icons/icon-512x512.png`.

## Security Checks
- No secrets, emails, phone numbers or student names on screen. Battle Royale players are real
  people — never use their names or scores without the owner's say-so.
- Screenshots from a signed-in session can leak an account — capture signed out (the command above is).

## Validation
- Every figure traced to BRAND_KIT §8 or a re-run of the real code.
- No clinical-authority claim; "educational" framing intact.
- Logo is the unaltered `mark.png` on a white tile, never stretched or recoloured.
- Every cut has content on both sides (no empty incoming scene).
- Text readable with sound off.

## Tests & Verification
- `ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate -of csv ad-NN/ad-NN.mp4`
  → h264 1080×1920 30/1 (+ aac if music).
- Pull 4–5 frames **from the MP4**, not the stills: `ffmpeg -ss 2.5 -i ad-NN.mp4 -frames:v 1 f.png`.
- Music: `ffmpeg -i music.wav -lavfi showspectrumpic=s=1024x512 spec.png` and
  `ffmpeg -i ad-NN.mp4 -af ebur128 -f null -` (≈ −14 LUFS). **There is no audio output on this
  machine — say the music was not listened to.**
- Not verifiable here: how it looks inside the Instagram/TikTok UI, and on a real phone.

## Common Failure Modes
- Gradient phrase invisible → `background-clip:text` doesn't reach transformed word spans; use
  `.grad-text` (kit gives each `.w` the gradient). MEMORY 193a.
- `class="abs glass"` loses its position → `.abs.glass` must stay after `.glass` in kit.css. 193b.
- White text vanishes on a phone screen → translucent glass over white; use a solid card. 193c.
- Decoration painting over cards → append it to `#motifs`, never to `#stage`.
- A transition "does nothing" → the incoming scene was empty at the cut; pull entrances up
  (`sceneOuts`) or finish hand-timed `seg()` animations before the cut.
- Next scene's elements visible *before* the cut → with `sceneOuts`, `enter`/`type` pull any
  entrance in a scene's first 0.9 s up to before the cut. Elements outside the scene `<section>`
  (front layers, the phone) are not clipped by the transition, so they show early — hand-time them.
- Ghost of the previous scene's headline under the new one → `iris`/`blinds` hold the outgoing
  scene underneath, and the incoming ground is translucent over a darkened stage (ad-04's navy
  scene). Use a non-overlap cut (`whip`, `zoom`, `rise`, `spin`, `flip`) into a darkened scene.
- Camera island over the app bar → the app screenshots have no status bar; give the screen a
  56 px status strip and start the screenshot below it (ad-04 `.sb`).
- A whole-line gradient phrase shows a doubled ghost ("CALCULATE." twice) → the parent `.grad-text`
  paints its own clipped copy; add `.grad-text:has(.w) { background: none !important; }` to the ad (ad-05).
- Gradient headline looks grey → `text-shadow` shows through transparent glyphs; use `filter: drop-shadow`.
- App bar blank over a panned full-page capture → a slice of a 7,000 px+ image isn't decoded in time;
  crop the bar into a small `<img>` (ad-05 `yld-bar.png`/`stb-bar.png`).
- Stopping a render with `pkill -f "render.mjs …"` kills your own shell too → `pgrep -f "^node video/render.mjs ad-NN"`.
- Two sessions made the same `ad-NN` at once (2026-10-11) → run `ListAgents` and `ls video/` right
  before `mkdir`, then message peers which number you took.
- Typed value flashes a red validation error → it passed through 0 on the way ("0.0866" is 0 first).
  Choose a method or value with no leading zero (ad-06 used Half-Life's Cl & Vd method).
- An opaque end-card ground vanishes → `through()` rewrites every scene's inline `background` each
  frame; put the ground on an inner `<div>` (ad-06 `#white`).
- White end card looks grey → the kit's `.vignette`, `.grain` and `#motifs` sit above the scenes; fade
  them in the end scene.
- A count beside a real screen contradicts it → the app's category view can list more tools than the web
  hub (Biopharm: 16 vs 14). Don't print a number next to the screen that disagrees with it.
- Captured frames sit at different scroll positions → the app's `html{scroll-behavior:smooth}` makes
  `scrollTo` animate; inject `html{scroll-behavior:auto!important}` before capturing (ad-07, MEMORY 197).
- App bar painted over a cropped result card → don't `captureBeyondViewport`-clip an element; shoot the
  viewport at scroll 0 and crop (ad-07 `crop.py`). Full-page `clip.scale: 2` on a 2× device = 4× image.
- Handwritten "?" reads as "!" → Caveat's glyph overhangs; pad the right edge of a clip-revealed line.
- Near-empty frames before an `iris` → whatever leads into it (a growing ring) left the frame too early.
- Opacity silently ignored → NaN from `seg(t, Infinity, Infinity)`; the kit clamps it now.
- zsh aborts on an unmatched glob (`rm -f still-*.png`) → `find ad-NN -name 'still-*' -delete`.
- Owner asked for different transitions/sound from the last ad → don't reuse a `through()` style or the default
  whoosh; `cues.json` `"cutSound": "swipe"` (+ `snaps`) and styles `tech`/`bright`/`piano`/`funk` exist (ad-08).
- A CDP `clip` on a scrolled page is blank, and a page wider than the phone offsets the visual viewport —
  shoot the viewport and crop by `visualViewport.pageTop` (ad-08, MEMORY 212).
- A GSAP `fromTo` whose from-state is visible (opacity > 0, a flash, a ring) shows it on **every earlier frame** when the timeline is seeked — use `set` + `to` (ad-09: a whole 3D canvas was hidden for 24 s).
- Someone opens a half-rendered file → only trust `ad-NN.mp4`, never `*.part.mp4`.

## Do Not
- Put video files, the kit or renders inside `pharma-wallah/`.
- Use black grounds, a third typeface, or off-brand colours (including the brief's hexes).
- Show a result the real calculator would not produce, or a UI state it cannot reach.
- Advertise the iOS or Windows app, or offline use of the website.
- Embed commercial music (Montagem Gloria etc.). The owner posts `-no-music` and adds trending audio in-app.
- Invent users, ratings, testimonials or "trusted by" figures.
- Add Remotion or any npm package to the kit without asking. (GSAP is vendored as plain files since 2026-10-17, at the owner's request.)

## Update Project Knowledge
- New ad → a line in `~/personal/pharmawallah-marketing/README.md`'s layout list and a short
  CLAUDE.md §8 entry (what it advertises, where every figure came from, what was verified).
- A new render trap → the marketing README's "Traps" and MEMORY 193.
- A product fact changes (app version, tool count, iOS ships) → BRAND_KIT §8 and this skill's override table.
