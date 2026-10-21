# Virtual Labs: asset research

The research was done on 2026-10-20 for four stations: the titration bench (analytical), the compounding bench with a
balance (pharmaceutics), the organ-bath station (pharmacology) and the microscopy station (pharmacognosy). The engine
is plain three.js.

This file records **everything that was investigated**. What actually ships is listed in
[ASSET_LICENSES](ASSET_LICENSES.md). The machine-readable version of both is
`src/lib/virtual-labs/assets/manifest.ts`.

## How licences were checked
- Every licence was read on the day, from that asset's own page or from its own API record. Where only a site-wide
  statement exists, the row says so.
- **Anything NonCommercial (NC), NoDerivs (ND) or of unknown licence was rejected.** The site runs ads, so NC can
  never apply.
- Poly Haven files were checked against the md5 in their API records. The Wikimedia file was checked against the
  SHA-1 in its API record.
- **No login wall or bot challenge was bypassed.** Nothing was downloaded from Sketchfab (it needs an account or
  token), BlendKit (its licence needs review), NIH 3D or Smithsonian.

## Summary of decisions

| Source | Licence basis | Outcome |
| --- | --- | --- |
| Poly Haven | CC0 1.0, read from each asset page's JSON-LD | **Used**: 2 textures (normal and roughness maps only) and 1 HDRI. Other CC0 candidates were approved but not used |
| ambientCG | CC0 1.0, from a **site-wide** statement only | Metal 009 approved; **not used** (procedural PBR metal is enough) |
| Sketchfab | Per-model API record, mostly CC BY 4.0 | **Nothing downloaded**: an account or token is required. NC, ND and "Free Standard" rejected |
| Smithsonian 3D | n/a | 3d.si.edu returned an HTTP 403 "request verification" page (not bypassed). The Open Access API found nothing suitable. **Nothing downloaded** |
| NIH 3D | Per-entry licence field | Pollen models are **CC-BY-NC → rejected**. Two public-domain tube racks approved but not downloaded |
| BlendKit (formerly BlenderKit) | "Royalty Free" | **Needs legal review**: the licence does not say whether serving a raw model from a public website is allowed |
| Wikimedia Commons | Per-file extmetadata and wikitext | **One CC BY-SA 4.0 photo used** (clove oil glands), marked *needs review (scientific)* |
| Khronos glTF-Sample-Assets | Each model's README "Legal" | Reference only for glass materials; nothing shipped |

**Why the rooms and instruments are procedural.** No openly licensed burette, analytical balance with a draught
shield, organ bath, fume cupboard or eyewash station could be downloaded under an acceptable licence. Poly Haven has
none. The Sketchfab candidates need an account and, for the organ bath, do not exist: searches for "organ bath",
"tissue bath", "isolated tissue", "kymograph" and "physiograph" returned 0 downloadable results. Building them in
code also keeps them scientifically exact. Examples:
- a lathe-turned burette with a canvas graduation scale;
- a glass draught shield;
- a jacketed bath.

## 1. Poly Haven (CC0 1.0)

**Licence evidence:**
- Each asset page carries JSON-LD reading
  `"license":"https://creativecommons.org/publicdomain/zero/1.0/"` and `"copyrightNotice":"CC0 1.0 Universal - public
  domain dedication, no attribution required"`. This was checked for all 24 shortlisted ids.
- `https://polyhaven.com/license` says: any purpose including commercial, no credit needed, redistribution allowed.

**API note.** The Poly Haven API Terms of Service require a "Powered by Poly Haven" credit **only if the site calls
the live API at runtime**. That clause does not apply to the CC0 files once they are self-hosted. PharmaWallah
self-hosts the files and credits Poly Haven as a courtesy.

### Textures

| Asset | Author(s) | Intended use | Decision |
| --- | --- | --- | --- |
| [Interior Tiles](https://polyhaven.com/a/interior_tiles) | Charlotte Baglioni | Lab floor | **Approved and used** (normal and roughness only). The tile grid runs at 45° in the map, so it is rotated in code |
| [Beige Wall 001](https://polyhaven.com/a/beige_wall_001) | Dimitrios Savva, Rico Cilliers | Painted plaster walls | **Approved and used** (normal and roughness only, tinted near-white) |
| [Granite Tile](https://polyhaven.com/a/granite_tile) | Charlotte Baglioni | Dark floor or bench top | Approved; not used (bench tops are procedural epoxy) |
| [Ash Veneer](https://polyhaven.com/a/ash_veneer) | Jenelle van Heerden | Cabinet fronts | Approved; not used (casework is white laminate) |
| [Long White Tiles](https://polyhaven.com/a/long_white_tiles) | Jenelle van Heerden, Sergej Majboroda | Backsplash | Approved; not used (tagged "weathered, chipped") |

These were checked and not shortlisted (all CC0):
- `terrazzo_tiles`;
- `floor_tiles_08`;
- `smooth_concrete_floor`;
- `white_plaster_02`;
- `oak_veneer_02`, `kitchen_wood`, `plywood`;
- `rounded_square_tiled_wall` (downloaded, then deleted).

Poly Haven has no clean brushed stainless texture.

The research suggested shipping diffuse, `nor_gl` and the packed `arm` maps. The build instead ships only `nor_gl`
and `rough`, re-encoded from 1k JPG to WebP (q82). The surface colour stays the lab's own procedural vinyl and
plaster.

### HDRIs

| Asset | Author(s) | 1k file | Decision |
| --- | --- | --- | --- |
| [Small Empty Room 3](https://polyhaven.com/a/small_empty_room_3) | Sergej Majboroda | 1,533,412 B | **Approved and used**. A neutral office with LED panels that reads well on glass. Used for environment and reflections only, never as the background; Medium and High quality only |
| [Hospital Room 2](https://polyhaven.com/a/hospital_room_2) | Dimitrios Savva, Jarod Guest | 1,609,763 B | Approved; not used (beds visible; one HDRI is enough) |

These alternatives were considered (CC0) but not downloaded: `studio_small_08`, `white_studio_05`,
`photo_studio_01`, `unfinished_office`.

### Models

| Asset | Author | Notes | Decision |
| --- | --- | --- | --- |
| [Industrial Microscope](https://polyhaven.com/a/industrial_microscope) | Lukas Walzer | A binocular compound microscope at real scale. 16,598 triangles; 1k glTF set 2,456,539 B | **Licence approved, but NOT used.** It is a single rigid mesh plus a cable, so its nosepiece, focus knobs and stage cannot move to reflect what the student does. A procedural compound microscope with separate parts was built instead (`three/instruments.ts` → `compoundMicroscope`). In the current build the revolving nosepiece turns to the selected objective, the illuminator lights, and the prepared slide sits in the stage holder. The focus knobs and stage are modelled but static: focus and stage position are shown in the 2D eyepiece view |
| Vintage Microscope | Luis José Fernández Rodríguez | Antique brass monocular | Approved (CC0), optional; not used |
| Bunsen Burner | BKS | | Approved (CC0), optional; not used |
| Chemistry Set | Jiří Ptáček | 41,958 tris, heavy | Approved (CC0), heavy; not used |
| Metal Stool 01 / 02 / 03 | Ulan Cabanilla; Flo Tasser | | Approved (CC0); not used (stools are procedural) |
| Drawer Cabinet, Steel Frame Shelves 03, Metal Office Desk | Ulan Cabanilla | | Approved (CC0); not used |
| Wooden Display Shelves 01 | James Ray Cock | | Approved (CC0); not used |
| Medical Box | Ulan Cabanilla | | Approved (CC0); not used |
| Wall Clock | PierreB3D | The dial reads "URBAN" | Needs review (possible branding); not used |
| Modern Ceiling Lamp 01, Potted Plant 04 | James Ray Cock | | Approved (CC0); not used |
| Clipboard | ProgrammerOnCoffee | | Approved (CC0); not used |
| Magnifying Glass 01 | Nazar Borodavka | | Approved (CC0); not used |
| School Chair 01 | Ethan Place | | Approved (CC0); not used |
| Desk Lamp Arm 01 | Yann Kervran, Kuutti Siitonen | | Approved (CC0), optional; not used |

Poly Haven has **no** burette, analytical balance, beaker set, organ bath or fume hood.

## 1b. ambientCG (CC0 1.0)

**Licence evidence:**
- `https://docs.ambientcg.com/license/` says all assets are CC0 1.0, and that the raw files may be included in a
  project.
- The Metal009 page has no per-asset licence line. **The licence was read from a site-wide statement**, not from a
  per-asset field.

| Asset | Notes | Decision |
| --- | --- | --- |
| [Metal 009](https://ambientcg.com/a/Metal009) (brushed steel) | Fills Poly Haven's brushed-metal gap | Approved; **not used**: procedural PBR metal is sufficient at bench scale |

Alternatives noted: `Metal011`, `Metal051A`.

## 2. Sketchfab (Data API v3, `downloadable=true`)

**Licence evidence.** Each model's licence was read from `GET https://api.sketchfab.com/v3/models/<uid>`. CC BY 4.0
allows commercial use, modification and redistribution. It requires attribution: author, title, link, licence, and
a note of changes.

**Every candidate below needs a logged-in Sketchfab account or API token to download. We had none, so nothing was
downloaded.** Every row is at best "needs review: download requires a Sketchfab account".

| Station | Candidates (author, licence) | Notes |
| --- | --- | --- |
| Titration | Burette (3dLabWare, CC BY), with no graduation texture; Burette (itschemistry2, CC BY), graduations to be checked; Burette stand and Iron stand (VeeRuby, CC BY); Chemistry Glassware (maxdragonn, CC BY); Lab Glassware (thelegokid4455, CC BY); Volumetric Flask, Erlenmeyer, Beaker and Cylinder collections (3dLabWare, CC BY, heavy); FREE Conical Flask and FREE Pipette (Naked Singularity Studio, CC BY) | Stirrer Box (Annah): rejected, a DIY box, not a lab stirrer |
| Compounding | Electronic Balance (mustaqeem1, CC BY), with no draught shield and possible branding; Balance (K Wang, CC BY), a beam balance; Mortar and Pestle (Emmalsawyer, CC BY); Spatula (mbames, CC BY) | Digital Scale (pocket scale) and Digital Weight Scale (bathroom scale): rejected as the wrong object. Health Pack mortar: rejected (stylised game art) |
| Organ bath | Water Bath (VeeRuby, CC BY) | **No organ bath, tissue bath, kymograph or physiograph model with an acceptable licence exists** (0 downloadable results) |
| Microscopy | Microscope (lionclaw0612, CC BY); Microscope (VeeRuby, CC BY); Binocular Microscope (Michael Perez, CC BY); FMB_Microscope_01 (FreeMeshBase, CC BY); PBR Vintage Microscope (Christina Lauridsen, CC BY); Compound microscope, Carl Zeiss 1911 (Virtual Museums of Małopolska, **CC0**, 520k faces, 145 MB); 1974.15 Microscope (Cleveland Museum of Art, **CC0**, 126 MB); Petridish and loop (filip.hans.nyberg, CC BY) | Microscope Slide Holder: rejected (forensic field holder) |
| Furniture | lab bench (Konstantin_Keller); Chemistry Lab Table (Jawahar Yokesh); Lab Counter W/ Sink (Kimbell Whatley); Laboratory stool (SirWyrm), all CC BY | Lab-Fume-Cupboard: rejected on quality. Fume Hood (cashblack77): rejected (a laser-engraver hood) |

**Rejected on licence:**
- Microscope SWIFT SW380B (CC BY-NC);
- ApertureVR Lab Chair (CC BY-NC);
- ScIl lab chair (CC BY-NC-SA);
- Takeda fume hood (CC BY-NC-SA);
- the Erlenmeyer "Witchtober" models (BY-NC-ND);
- the landessammlungen-noe beakers (BY-NC);
- the alienor.org burette and pipette (BY-NC-ND);
- the "Laboratory Glasswares Pack" (powers28): **Free Standard**, Sketchfab's own licence, which limits raw
  redistribution.

**Naming trap.** "CC0 - Funnel 3" by plaggy has CC0 in its title, but its **licence field is CC BY 4.0**. It would
have to be treated as CC BY.

Sketchfab "eyewash" searches returned only eyelash models.

## 3. Smithsonian 3D

- **3d.si.edu returned an HTTP 403 "Smithsonian request verification" page** to every scripted request and to
  WebFetch. This is a bot challenge, and it was **not bypassed**.
- The Smithsonian Open Access API (`api.si.edu/openaccess`, DEMO_KEY, media type `3d_voyager`) returned **0**
  objects for `microscope`, `apothecary` and `pharmacy`. `balance` returned only the 1903 Wright Flyer. The `drug
  jar`, `mortar` and `beaker` searches were cut off by the shared DEMO_KEY rate limit, so they are **not
  confirmed**.
- Smithsonian's CC0 Sketchfab account had only Chinese export "beaker-shaped" **vases**. Rejected.
- **Result: nothing suitable found, nothing downloaded.** A person with a browser could still search 3d.si.edu for
  "apothecary" and "microscope" with the CC0 filter.

## 4. NIH 3D

Licences vary per entry and were read from each entry page's `"license"` field.

| Entry | Licence | Decision |
| --- | --- | --- |
| Pollen grains (Anthony J. Hayes, Cardiff University / Amgueddfa Cymru), e.g. [3DPX-021554](https://3d.nih.gov/entries/3DPX-021554), 3DPX-017818, 3DPX-021267 | **CC-BY-NC** on all three checked | **Rejected: NonCommercial** (the site runs ads). None is clove pollen anyway |
| Modular Test Tube Rack (3DPX-000776); Test Tube Rack for 15 mm Tubes (3DPX-004890) | Public Domain | Licence approved; not downloaded (low priority) |
| Multifunctional rack for laboratory tubes (3DPX-022833) | CC-BY | Needs review (attribution); not needed |
| Multipurpose Universal Laboratory Tube Rack (3DPX-020367) | CC-BY-NC-SA | Rejected (NC) |

No NIH 3D microscope, lab-equipment or plant-cell model with an acceptable licence was found in the time available.

## 5. BlendKit (formerly BlenderKit)

`blenderkit.com` now redirects to `blendkit.com`. Its **Royalty Free** licence:
- allows commercial use without credit;
- forbids re-selling the asset "in the same form";
- **does not say whether shipping the raw model inside a web app is allowed**. A three.js page serves the GLB to
  every visitor.

| Asset | Licence | Decision |
| --- | --- | --- |
| Monocular Microscope (Krystalzzz Ming), free GLB 349,524 B | royalty_free | **Needs legal review**; not used |
| Lab Beaker (Krystalzzz Ming), `.blend` only | royalty_free | **Needs legal review**; not used |
| Industrial Microscope / Chemistry Set | cc_zero (mirrors of Poly Haven) | Take from Poly Haven directly |

## 6. Wikimedia Commons: clove microscopy

**Access.** `commons.wikimedia.org` did not resolve from the research sandbox. Search went through the Wikimedia API
gateway, metadata through `en.wikipedia.org/w/api.php` (`extmetadata`), and the download through
`upload.wikimedia.org`.

**Queries run** included clove microscopy, *Syzygium aromaticum* microscopy, section, pollen and sclereid, clove
powder, Caryophylli flos, *Eugenia caryophyllata*, and others.

| File | Licence | Assessment | Decision |
| --- | --- | --- | --- |
| [Oil glands of clove powder under light microscope.jpg](https://commons.wikimedia.org/wiki/File:Oil_glands_of_clove_powder_under_light_microscope.jpg), by آية تاج الدين ("own work", 2020-08-06) | **CC BY-SA 4.0** (`{{self|cc-by-sa-4.0}}`, AttributionRequired: true) | 774×1032, 35,208 B; the SHA-1 matched the API. A phone photo through the eyepiece: dark vignette, no scale bar, no magnification stated. It shows a brownish parenchyma fragment with rounded oil cavities, which is consistent with clove powder. **The identification is the uploader's own claim** | **Used, status `needs_review` (scientific).** The licence permits commercial use with attribution. Share-alike applies to the image and any edits of it, not to the 3D lab. A pharmacognosy teacher must confirm the identification |
| The microscopy of vegetable foods (Winton & Moeller, 1906), PDF | Public domain (`{{PD-US-expired}}`) | 730 pages, 51.6 MB, **not downloaded**. Has line drawings of clove powder elements | Needs review: the figure page still has to be found, extracted and cropped. The best openly licensed source for accurate clove figures |
| Köhler's Medizinal-Pflanzen plate, *Syzygium aromaticum* | Not checked | A botanical plate, not microscopy | Rejected for this purpose |

No Commons file of clove pollen or of a stained clove transverse section was found. Other "… powder under light
microscope.jpg" files exist from the same student set (cassia, cinchona, belladonna, stramonium, frangula, tilia),
but they were not assessed.

## 7. KhronosGroup glTF-Sample-Assets

| Asset | Licence (README "Legal") | Use |
| --- | --- | --- |
| GlassHurricaneCandleHolder | © 2021 Wayfair LLC, CC BY 4.0, **and a Khronos trademark mark** | Reference for `KHR_materials_transmission` and `volume`; not shipped |
| GlassVaseFlowers | CC0 1.0 | Reference for glass material; not shipped |
| WaterBottle | CC0 1.0 (Microsoft) | Not lab-relevant |
| CommercialRefrigerator | CC BY 4.0 | Possible lab-fridge stand-in; needs review; not shipped |
| DiffuseTransmissionPlant | CC BY 4.0 and CC0 parts | Optional; not shipped |

The repository has no burette, balance, microscope or lab glassware.

## 8. Notes carried into the build
1. **Glass** follows the research's advice: `MeshPhysicalMaterial` with `transmission: 1`, `ior: 1.47` and low
   roughness, on **High** quality only, because transmission costs an extra render pass. Medium and Low use a
   cheaper clearcoated transparent material (`three/materials.ts`).
2. **Procedural instruments.** The burette (lathe plus canvas graduation scale), the analytical balance with a glass
   draught shield, the jacketed organ bath with aerator and transducer, and the compound microscope (rotating nosepiece) are all built
   in code.
3. **Texture budget.** Only normal and roughness maps ship, as 1k WebP. Total shipped third-party texture bytes:
   227,648.
4. **If Sketchfab CC BY models are ever used**, add them to `assets/manifest.ts` with `used: true` and credit each on
   the landing page: "Title" by Author (link), CC BY 4.0, modified. Re-read the licence at download time, because
   authors can change it.

## Addendum — 2026-10-21 (immersive upgrade)

**Method.** The same rules as above: every licence was read on 2026-10-21 from that asset's own page or API
record, NC/ND/unknown is rejected, and no login wall or bot challenge was bypassed. NIH 3D was searched through its
own public Discover search (18 terms, title matches only). Poly Haven was searched through its public API (all 521
models), and each new candidate's licence was read from its page's JSON-LD. Commons was searched through the
`api.wikimedia.org` gateway, because `commons.wikimedia.org` still does not resolve from the sandbox. Openverse,
Europe PMC and GitHub were searched for clove micrographs. **Nothing was downloaded into the repo.** Small glTF JSON
headers and one PDF were fetched to the session scratchpad only, to read node names and figure sizes.

### A. 3dassets.dev

| Item | Finding | Decision |
| --- | --- | --- |
| What it is | A catalogue of "free, web-optimised CC0 GLB models and game asset packs" (10,000+ assets, 361 packs per search snippets) with a REST API and an MCP server. Accounts upload models, and uploads are "human-reviewed before publication". Run by 3DAssets.dev; repo [3dassets-dev/3dassets](https://github.com/3dassets-dev/3dassets), created 2026-09-07 | — |
| Licence statement | Repo README: "Every asset on the site is CC0 1.0." But its `SKILL.md` says "All **new** uploads use CC0 1.0", tells agents to "Preserve `license.attributionText` when present", and the API has a `/licenses` list. So **a per-asset licence field exists** and the site-wide claim cannot stand in for it. The CC0 is the uploader's own declaration, and assets can carry an AI-model attribution | — |
| Availability | **HTTP 503** ("no available server", behind Cloudflare) for `/`, `/assets`, `/api/v1/assets?q=microscope`, `/api/v1/licenses` and `/llms.txt`, retried during the session. GitHub issue #1 "3dassets.dev Down – HTTP 503" has been open since 2026-10-14. The Internet Archive was also offline, so no snapshot could be read | — |
| Lab assets | **None could be seen.** No asset page, licence field or provenance could be read | **Rejected: unverifiable.** If it comes back, re-check each asset's own `license` record and uploader before use |

### B. Smithsonian 3D

| Route tried | Result | Decision |
| --- | --- | --- |
| `3d.si.edu/explore?edan_q=microscope` (curl and WebFetch) | HTTP 403 "Smithsonian request verification" | Not bypassed |
| `collections.si.edu` and `si.edu/search/collection-images` with the 3D filter | Same 403 page | Not bypassed |
| Open Access API (`DEMO_KEY`), `online_media_type:"3D Images"` | 0 rows for microscope, balance, scale, beaker, flask, apothecary, drug jar, mortar and burette, then `OVER_RATE_LIMIT`. The zero rows may come from the filter syntax rather than an empty collection, so they are **not confirmed** | — |
| Sketchfab, CC0 + downloadable, "microscope" | Only museum models already recorded above: 1974.15 Microscope (Cleveland Museum of Art, CC0, 99,498 faces) and **three** "Compound microscope" scans by Virtual Museums of Małopolska (CC0, 520k–586k faces). None is Smithsonian's | Already covered; too heavy for a phone |

**Result: no Smithsonian object page or licence statement could be read. Rejected: unverifiable.** Someone with a
browser, or with a free api.data.gov key, could repeat the search.

### C. NIH 3D

The page licence label "Public Domain" links to CC0 1.0 on every entry checked. Sizes are the NIH-converted files.

| Entry | Creator | Licence on page | Format, size, polys | Suitability | Decision |
| --- | --- | --- | --- | --- | --- |
| [Binocular Compound Microscope 3d Model, 3DPX-022786](https://3d.nih.gov/entries/3DPX-022786) | Sourav Pan | Public Domain (CC0 1.0) | GLB 16,778,032 B (submitted GLB 4,103,120 B), OBJ, FBX, BLEND; 149,981 polys; 11 MB texture zip | Every file is named `tripo_convert_…`, which suggests it was generated by an AI image-to-3D tool (an inference; the page does not say). The source image is undisclosed. One fused mesh, so nothing can move | **Rejected**: heavy, rigid, and its provenance is unclear. The licence itself is acceptable |
| [3D Model of Transmission Electron Microscope, 3DPX-022795](https://3d.nih.gov/entries/3DPX-022795) | Sourav Pan | Public Domain (CC0 1.0) | GLB 16,626,004 B; 149,998 polys | Wrong instrument | Rejected (not relevant) |
| [150mL beaker, 3DPX-022915](https://3d.nih.gov/entries/3DPX-022915) | LeBlancResearchGroup | CC-BY | GLB 41,780 B; 1,058 polys | A CAD beaker for 3D printing, with no graduations and no glass material | Usable with attribution; **not better** than the lathe-built glassware |
| [Burette Clamp, 3DPX-012313](https://3d.nih.gov/entries/3DPX-012313) / [Parametric Burette Clamp, 3DPX-012438](https://3d.nih.gov/entries/3DPX-012438) | kalessi22 | CC-BY | GLB 603,900 B / 321,820 B; 9,586 / 6,046 polys | 3D-printable plastic clamps, not the cast-metal clamp on a retort stand | Rejected (wrong object) |
| [Laboratory Electric Stirrer, 3DPX-002142](https://3d.nih.gov/entries/3DPX-002142) | tajubenv | Public Domain (CC0 1.0) | GLB 73,828 B; 1,614 polys | A printable DIY stirrer case, not a hot plate | Rejected (wrong object) |
| [Simple Beaker Clamp, 3DPX-002153](https://3d.nih.gov/entries/3DPX-002153) | Mr_Harmless | Public Domain (CC0 1.0) | GLB 11,828 B; 256 polys | A printable part | Rejected (not needed) |
| [Wall Mounted Glassware Drying Rack, 3DPX-010032](https://3d.nih.gov/entries/3DPX-010032) | dwsweene | Public Domain (CC0 1.0) | GLB 1,142,432 B; 19,020 polys | A printable peg rack. Possible wall dressing | Licence approved; not recommended (the procedural equivalent is trivial) |

These searches had **no relevant title match**: balance, hot plate, graduated cylinder, magnetic stirrer, retort
stand, organ bath, tissue bath, fume hood. The other "pipette", "flask" and "test tube" hits are printable holders and
adaptors, and several are CC-BY-NC or CC-BY-NC-SA, which is rejected.

### D. Poly Haven models (new candidates only; CC0 1.0 read from each page's JSON-LD)

Sizes are the 1k glTF set: the `.gltf`, its `.bin` and its textures.

| Asset | Author | Tris | 1k glTF | Suitability | Decision |
| --- | --- | ---: | ---: | --- | --- |
| [Mounted Fluorescent Lights](https://polyhaven.com/a/mounted_fluorescent_lights) | Ulan Cabanilla | 17,820 | 1,864,362 B | Strip fittings with separate housings and glass (7 meshes). Fits a lab ceiling | **Approved, optional.** The best room-dressing candidate found |
| [Steel Frame Shelves 01](https://polyhaven.com/a/steel_frame_shelves_01) | James Ray Cock | 4,348 | 1,597,356 B | Clean steel shelving with wooden planks, 2.14 m tall. Could hold reagent bottles | Approved, optional |
| [Vintage Microscope](https://polyhaven.com/a/vintage_microscope) | Luis José Fernández Rodríguez | 20,631 | 2,312,802 B | An antique brass monocular with a mirror. It has **separate** nodes for the revolver, focus adjustment, condenser and mirror arm, so parts can move. But it is not the modern illuminated microscope the practical uses | Approved; display prop only |
| [Standing Chalkboard 01](https://polyhaven.com/a/standing_chalkboard_01) | ParzivalCG | 2,372 | 2,617,256 B | A wooden A-frame. Not lab-typical | Approved; not recommended |
| [Plastic Container](https://polyhaven.com/a/plastic_container) | PierreB3D | 4,070 | 1,340,359 B | A black storage bin with a red lid | Approved; not needed |
| [Electric Stove](https://polyhaven.com/a/electric_stove) | Kuutti Siitonen | 13,914 | 2,045,696 B | A kitchen cooker with an oven, not a lab hot plate | Rejected (wrong object) |
| [Hanging Industrial Lamp](https://polyhaven.com/a/hanging_industrial_lamp), [Industrial Storage Cart](https://polyhaven.com/a/industrial_storage_cart), [Tool Cart](https://polyhaven.com/a/tool_cart), [Metal Trash Can](https://polyhaven.com/a/metal_trash_can), [Plastic Bottle Gallon](https://polyhaven.com/a/plastic_bottle_gallon) | various | 9,530–29,394 | 1.4–5.0 MB | Each page's description says chipped, weathered, worn, rusted or stained. Wrong for a clean teaching lab | Rejected (look) |
| [Modern Arm Chair 01](https://polyhaven.com/a/modern_arm_chair_01) | Vibrant Nordic | 8,916 | 2,698,032 B | A lounge chair | Rejected (wrong object) |

A re-check confirmed the earlier finding on Industrial Microscope: its glTF has only two nodes,
`industrial_microscope` and `industrial_microscope_cable`. Poly Haven still has no burette, analytical balance,
beaker, flask, hot plate or organ bath.

### E. Powdered clove microscopy images (other than the Commons photo in the manifest)

| Image | Creator | Licence as stated | Format, size | Assessment | Decision |
| --- | --- | --- | --- | --- | --- |
| **Figure 3**, "Microscopy of clove powder showing: a) epidermal cell, b) fragment of hypanthium showing portions of oil gland, c) phloem fibre ×40, d) epidermal cell and stoma of hypanthium, e) pollen grains, f) sclereid, g) parenchyma of hypanthium", in *Quality assessment and antibacterial properties of a commercial clove sample…*, GSC Biol. Pharm. Sci. 9(1):32–38, 2019, doi 10.30574/gscbps.2019.9.1.0178. Copy: [Zenodo 4283305](https://zenodo.org/records/4283305) | Odumosu P.O., Okwori V.A., Chris-Otubor G.O. | Zenodo record `license: cc-by-4.0`. The PDF says "published under the terms of the Creative Commons Attribution Liscense 4.0" [sic], and that the authors keep copyright | One embedded JPEG, **880×463 px**, 42.4 KB, 7 panels of about 220 px each. PDF 1,538,166 B, SHA-1 `586906969541787f195a90098e2f29f0ad75f68a` | These are **the diagnostic elements of the powder**: triangular pollen, a sclereid, phloem fibres, and an oil-gland fragment. The authors say the work followed BP methods. Panels are small, have no scale bar, and only (c) states a magnification. Using one panel means cropping it, and the credit must then say "cropped". The publisher's peer-review standard was not assessed | **Usable with attribution**, status *needs review (scientific)*. The best openly licensed powder image found |
| **Figure 12 A–B**, "Micrograph of clove flower bud" and a labelled TS of the *Syzygium aromaticum* bud (cuticle, epidermis, oil glands, columella, sphaeraphides, vascular bundles, aerenchyma), in Khan et al., *Herbal Spices as Food and Medicine: Microscopic Authentication of Commercial Herbal Spices*, Plants 13(8):1067, 2024, doi 10.3390/plants13081067, PMC11054362 | Khan et al. (MDPI) | **CC BY 4.0**, read from the article's JATS `<license>` | JPEG. **Size not checked**: Europe PMC and MDPI returned HTTP 403 to scripted requests | A **section of the whole bud, not powder**. Useful as a reference for where oil glands sit. Panels C–D are carom (ajwain), so cropping is required | Usable with attribution; reference only |
| Commons, Openverse, GitHub | — | — | — | The `api.wikimedia.org` search (15 queries, including German and French) and Openverse found **no clove micrograph** other than "Oil glands of clove powder under light microscope.jpg", which is already used. Openverse's other hits were NC Flickr photos of garlic. GitHub repository search returned 0 for 6 queries | Nothing new |
| ResearchGate copy of the GSC figure | — | Not readable (HTTP 403) | — | The same figure. Use the Zenodo copy, whose licence can be read | Not used |

### Recommendation

**None of the 3D models found is better than the procedural instruments.** The burette, balance, organ bath and
student microscope have to move and read out what the student does. Every candidate found was one of these:
- a single rigid mesh (the NIH microscope, which also looks AI-generated);
- the wrong object (printable clamps and holders, a kitchen stove);
- a worn or weathered prop;
- unverifiable (3dassets.dev, Smithsonian).

Each optional Poly Haven prop costs about **1.3–2.7 MB** at 1k, and the entire shipped third-party set today is
1.8 MB. For mobile-first users, that weighs against room dressing. If the room needs one more piece of realism,
**Mounted Fluorescent Lights** (CC0, 1.86 MB) is the only addition worth considering.

The more valuable finding is an image. **GSC 2019 Figure 3 (CC BY 4.0) shows the clove powder elements a student
must identify**: pollen, sclereid, phloem fibre and the oil-gland fragment. The current reference photo shows only
oil glands. It is worth adding as a cropped panel set with the credit "Odumosu et al. 2019, CC BY 4.0, cropped",
marked *needs review*, once a pharmacognosy teacher confirms the panels. The Winton & Moeller (1906) public-domain
drawings recorded in §6 remain the best source for exact line figures.
