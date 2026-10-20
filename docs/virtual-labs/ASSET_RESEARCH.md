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
