# Virtual Labs — Testing and verification

Everything below was actually run on 2026-10-20. Where something was **not** verified, it says so.

## 1. Unit tests — the pure layer

```bash
node --test scripts/virtual-labs.test.mts
```

**42 pass, 0 fail.** The suite covers:

| Area | What is asserted |
|---|---|
| Catalogue | Exactly four labs and four experiment definitions, one per discipline; routes resolve; unknown paths do not; every step's focus equipment exists; every question's key is valid; no lab claims `faculty_reviewed`; any `source_verified` lab cites a source |
| Run machine | Deterministic RNG; undo restores the bench but keeps mistakes; reset clears; hints reveal one at a time and cap; assessment closed until bench work is complete; answers lock; submit gated; a mistake is scored once |
| Titration chemistry | Assay formula (normal, unit-sensitive: doubling molarity halves titre for the same assay, invalid inputs → NaN); equivalence factor 7.005 mg/mL at 0.1 M; titre boundaries (0, 50 mL, reversed, above zero, beyond capacity); pH model (acid start, alkaline equivalence 8.5–10, monotonic, phenolphthalein colourless before / deep pink after); concordance |
| Titration runs | A careful scripted student: no mistakes, assay within 0.6 % of the sample's true content, technique 100, grade Distinction, actions refused after submit. Unrinsed burette → assay high by ~1.5 % and recorded. Methyl orange → assay < 60 % and recorded. Out-of-order actions refused with an explanation. Wrong calculation refused. A bubble left in the tip is reachable and recorded |
| Syrup physics | NBS C457 table points reproduced exactly; interpolation monotonic and close to Brix tables; 85 % w/v ≈ 64.6 % w/w at ≈ 1.313 g/mL; batch quantities; volume at 20 °C = 100 mL; hot volume larger; density from weighing; deviation % |
| Syrup runs | Careful student → 85 % w/v, density ≈ 1.313, clear, technique 100. Untared balance → recorded and weak syrup. Volume read while hot → recorded and wrong at 20 °C. Boiling → recorded and yellow. Wrong calculations refused |
| Dose–response | Hill boundaries and inverse; stock volumes in µL for every permitted concentration (1–200 µL); fit recovers known parameters (log EC50 ±0.011, Emax ±0.2, n ±0.05); careful student → log EC50 within 0.15 of −7 and unknown within 0.12 log unit; unknown kept out of the standard curve; no-washout and cold-bath runs recorded with the right effect; deterministic per seed; gating |
| Microscopy / clove | Field of view 4.5/1.8/0.45 mm; slide deterministic; recognisability follows magnification, focus, lamp and clearing; the reference never draws an absent feature (no starch, trichomes or prisms on the slide); careful student sees the diagnostic elements and identifies clove with no mistakes; coarse focus at 40× recorded; a poor mount can be remade (mistake kept) |
| Asset manifest | Every shipped asset file exists with exactly the recorded byte size; no NC/ND licence ships |

All existing suites still pass: `node --test scripts/*.test.mts` gave 315 pass, 0 fail (13 files) when run after the legacy removal; the virtual-labs suite has since grown from 39 to 42.

## 2. Type-check and build

| Check | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run build` | **exit 0**. `/virtual-labs` 2.31 kB / 108 kB first load; lab pages 13.2–17.2 kB / 198–202 kB first load; shared JS 88.8 kB (baseline 88.7); middleware 82.5 kB (unchanged). The "Dynamic server usage" lines in the log are pre-existing route logs (CLAUDE.md §9) |
| Lint | Not available — the repository has no ESLint configuration (CLAUDE.md §9) |

## 3. Browser — every lab completed end to end

Headless Chrome with software WebGL (`--enable-unsafe-swiftshader --use-angle=swiftshader`) against `next dev`, driven over the DevTools protocol by a script that **acts like a student**: it clicks the real controls and reads every instrument from what the page draws — the burette and cylinder scales from the meniscus position against the graduations, the balance from its LCD, the flask colour from the swatch, recorder peaks from the trace, EC50 and the unknown from where the read-off guide lands on the graph axis, and microscope focus from the eyepiece view. Runs use `?seed=` so they are reproducible.

| Lab | 1440 × 900 (mouse) | 390 × 844 (touch emulation) | Notes |
|---|---|---|---|
| Titration | Complete. Assay 100.41 % from readings 0.67 → 27.67 mL (sample's true content 99.82 %) | Complete, same result | One deliberate mistake (25 mL burette chosen first) recorded −3; the harness answers assessment option 2 everywhere, hence 4/8 |
| Simple Syrup | Complete. 84.5 % w/v, density 1.313 g/mL | Complete, 100 %, 0 mistakes | The first run exposed a real defect (see §5) |
| Dose–response | Complete, 100 %. pEC50 read off the graph 7.02 (model 7.00); unknown read from the student's own curve | Complete, 100 % | |
| Powdered clove | Complete, 100 %. Checklist 10/10; all 5 main elements recognised through the eyepiece | Complete, 100 % | |

Every run: **0 console errors, 0 horizontal overflow** (measured as `scrollWidth − emulated width`, MEMORY 221).

Also checked at **360 px** (touch): the landing page, all four briefings and all four labs — 0 page overflow after the grid fix in §5.

## 4. 3D scene loading and fallbacks

| Check | Result |
|---|---|
| All four rooms load at low, medium and high quality | Yes (stats in §6) |
| Equipment selection → close-up | Verified by `window.__vlab.focus(id)` and by clicking procedure chips (which select → inspect → fly) |
| Guided mode follows the procedure | Verified visually (camera flies to each step's station) |
| No-WebGL fallback | The 2D lab (every item a button; every action in the Bench panel) was driven to completion for Simple Syrup ("Use the 2D lab instead", 1440 px); the WebGL probe chooses it automatically when WebGL is missing. **A browser with WebGL actually disabled was not tested.** |
| Context loss | Handled in code (message + 2D fallback offered). **Not triggered in testing.** |

## 5. Defects found by testing and fixed

| Found by | Defect | Fix |
|---|---|---|
| Titration drive | The white-tile control sat in a section that collapsed when its step completed — unreachable | Tile control also in the Titrate step; and generally, a step's section now stays open once it has been current |
| Titration drive | Only the last feedback line showed, hiding the *explanation* of a wrong choice | The feedback area shows all messages from the action, mistakes first |
| Screenshots | Highlight glow tinted glass and dark metal | Glow skips transparent materials; step equipment is marked with a floating chevron instead |
| Screenshots | GHS corrosive pictogram read as a face | Redrawn as test tubes dripping onto a surface and a hand |
| Slow-device rendering | Camera flights stalled on software WebGL | Tweens advance on real time |
| Dose drive | The final wash was hidden after the trials step completed | Sections stay open (above) |
| Syrup drive | "No crystals visible" appeared while > 0.3 g was still undissolved, so a careful student was penalised | Observation text uses the engine's own threshold |
| Docs review | The titration's air-bubble mistake was unreachable | A gentle run-out route that leaves the bubble |
| Docs review | A wrong mountant blocked the clove Observe step permanently | "Discard this slide and prepare a new one" (mistake kept) |
| 360 px sweep | Labs were 47–150 px wider than the phone (grid item without `min-w-0`) | Grid column `minmax(0,1fr)` + `min-w-0` on every column |
| Phone review | Feedback appeared over the 3D view while the student was scrolled to the controls | A bottom toast on phones; objective shown in full under the header |

## 6. Performance

Measured 2026-10-20 against `next start` (production build), cache disabled, headless Chrome on an **Intel Core i7-8565U (8 threads), no GPU** — WebGL ran in **software (SwiftShader)**. That is a worst case for frame rate and shader-compile time; any phone or laptop GPU is far faster. No universal FPS figure is claimed.

### 6.1 Payload

| What | Size |
|---|---|
| Lab page first load (JS, from the build) | 198–202 kB per lab; `/virtual-labs` 108 kB |
| three.js in any route's first load | **none** (checked in `app-build-manifest.json`) |
| Room module per lab (lazy) | 3.9–5.7 kB each (1.9–2.6 kB gzipped) |
| Runtime + shared 3D code (lazy) | 37.9 kB (12.6 kB gzipped) + the three.js async chunk |
| Transferred when "Enter the 3D lab" is pressed — **Low** | **185–210 KB** (no HDRI, no texture maps) |
| Transferred when entering — **Medium / High** | **1.9 MB** (of which the HDRI is 1.53 MB) |
| All shipped 3D assets on disk | 1,796,268 B (HDRI 1,533,412; 4 WebP maps 227,648; clove photo 35,208) |
| Landing thumbnails | 82,588 B for all four (WebP) |

Default quality is **Low** on phones, small screens, ≤ 4 GB device memory or Save-Data; Medium elsewhere.

### 6.2 Scene cost (from `renderer.info`, after load, at the spawn view, 1440 × 900)

| Lab | Low: draw calls / triangles | Medium | High |
|---|---|---|---|
| Titration | 137 / 49k | 256 / 94k | 459 / 151k |
| Simple Syrup | 86 / 31k | 187 / 75k | 288 / 100k |
| Dose–response | 107 / 38k | 200 / 78k | 318 / 111k |
| Powdered clove | 196 / 54k | 396 / 112k | 603 / 164k |

Medium/High add shadow passes (which roughly double draw calls), the HDRI environment and the floor/wall detail maps.

### 6.3 Load time and frame rate on this machine (software rendering)

| Measure | Result |
|---|---|
| "Enter 3D" → scene ready, Low | 6.8–14.7 s |
| "Enter 3D" → scene ready, High | 24.8–35.2 s |
| Frame rate, 390 × 844, Low (continuous rendering for 5 s) | 2–3 fps |
| Frame rate, 1440 × 900 | too few frames in 5 s to report (< 2 fps) |

These times are dominated by CPU shader compilation and software rasterisation. **They do not represent a GPU device and were not measured on one.** Mitigations in the code: rendering is on demand (an idle lab draws nothing), Low quality drops shadows, antialiasing, HDRI and maps, pixel ratio is capped, and every action works from the panels while the scene loads.

### 6.4 Known performance limitations

- Glass on High uses transmission (an extra render pass); clove room on High is the heaviest scene (603 draw calls) because of the five decorative microscopes and specimen jars — candidates for instancing if a GPU device shows strain.
- The HDRI (1.5 MB) is the largest single download; Low quality never fetches it.
- No measurement on a real phone GPU yet.

## 7. Not verified

- A real phone, Safari/iOS, Firefox, or any GPU-accelerated browser.
- Signed-in progress actually written to Supabase (no test account used). The tracker calls reuse existing, tested paths.
- Screen-reader use end to end (labels and live regions exist; keyboard-only completion is possible because every action is a button).
- A browser with WebGL disabled; WebGL context loss.
- Faculty review of any content.
