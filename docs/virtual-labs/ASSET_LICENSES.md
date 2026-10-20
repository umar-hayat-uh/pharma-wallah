# Virtual Labs: licences of shipped assets

This file covers **only what ships**: the rows of `src/lib/virtual-labs/assets/manifest.ts` with `used: true`.
Everything that was researched but not shipped is in [ASSET_RESEARCH](ASSET_RESEARCH.md).

File sizes were measured with `ls -l public/models/virtual-labs/**` on 2026-10-20 and match the `bytes` values in the
manifest.

## 1. Third-party files

| Asset | Source | Creator | Licence | Commercial | Modification | Redistribution | Share-alike | Attribution text | Manifest status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Interior Tiles (texture) | https://polyhaven.com/a/interior_tiles | Charlotte Baglioni (Poly Haven) | CC0 1.0 | Yes | Yes | Yes | No | Not required (CC0); credited as a courtesy | approved |
| Beige Wall 001 (texture) | https://polyhaven.com/a/beige_wall_001 | Dimitrios Savva, Rico Cilliers (Poly Haven) | CC0 1.0 | Yes | Yes | Yes | No | Not required (CC0); credited as a courtesy | approved |
| Small Empty Room 3 (HDRI) | https://polyhaven.com/a/small_empty_room_3 | Sergej Majboroda (Poly Haven) | CC0 1.0 | Yes | Yes | Yes | No | Not required (CC0); credited as a courtesy | approved |
| Oil glands of clove powder under light microscope (photo) | https://commons.wikimedia.org/wiki/File:Oil_glands_of_clove_powder_under_light_microscope.jpg | آية تاج الدين (Wikimedia Commons user) | **CC BY-SA 4.0** | Yes | Yes | Yes | **Yes** | "Photo: آية تاج الدين, Wikimedia Commons, CC BY-SA 4.0" (shown with its credit under the image) | **needs_review** (scientific identification not yet confirmed) |

### Shipped files

| File | Bytes | From asset | Note |
| --- | ---: | --- | --- |
| `public/models/virtual-labs/environments/textures/interior_tiles_nor_gl_1k.webp` | 19,916 | Interior Tiles | Normal map (OpenGL), 1k, re-encoded JPG → WebP q82 |
| `public/models/virtual-labs/environments/textures/interior_tiles_rough_1k.webp` | 53,116 | Interior Tiles | Roughness, 1k, re-encoded JPG → WebP q82 |
| `public/models/virtual-labs/environments/textures/beige_wall_001_nor_gl_1k.webp` | 78,506 | Beige Wall 001 | Normal map, 1k |
| `public/models/virtual-labs/environments/textures/beige_wall_001_rough_1k.webp` | 76,110 | Beige Wall 001 | Roughness, 1k |
| `public/models/virtual-labs/environments/hdri/small_empty_room_3_1k.hdr` | 1,533,412 | Small Empty Room 3 | 1024×512 Radiance RGBE. Environment lighting and reflections only, never shown as the background. Loaded on Medium and High quality only |
| `public/models/virtual-labs/specimens/clove-oil-glands-commons.jpg` | 35,208 | Clove oil glands photo | 774×1032 JPEG. **Unmodified original** (the SHA-1 matched the Commons record) |
| **Total** | **1,796,268** | | |

### How each file is used
- **The CC0 textures** are used for their normal and roughness maps only. The colour maps were not shipped: the
  floor and wall colours are the lab's own procedural canvas textures. On Low quality they are not loaded at all
  (`three/runtime.ts`, `ASSETS`).
- **The CC0 HDRI** goes through `RGBELoader` and `PMREMGenerator` and is used as `scene.environment`. If it fails to
  load, the procedural `RoomEnvironment` is used.
- **The CC BY-SA photograph is served unmodified.** It is not cropped, annotated, recompressed or resized, so no
  derivative of it exists. Share-alike applies to the image and to any edit of it, not to the 3D lab or the page
  around it. If anyone ever crops or annotates it, the edited file must also be released under CC BY-SA 4.0 and
  credited as modified.

## 2. Original work (no third-party licence)

The following are **original procedural work** generated at runtime by code in
`src/components/virtual-labs/three/`. No model file is downloaded for them:
- the rooms, furniture and benches (`kit.ts`, `rooms/*.ts`);
- the glassware (`glass.ts`), lathe-turned from real dimensions;
- the instruments (`instruments.ts`): balances, hot plate, organ-bath rig and recorder, compound microscope, and the
  others;
- the materials (`materials.ts`);
- every label, safety sign, poster, LCD display and graduation scale (`textures.ts`), drawn on a canvas.

The safety signs follow the ISO 7010 colour and shape conventions and the GHS hazard diamond, with simplified
pictograms drawn for this project. The 2D eyepiece view of the clove powder (`benches/MicroscopeView.tsx`) is an
original schematic illustration drawn from the reference description.

The manifest records this as the `procedural-rooms` row (licence "PharmaWallah — original work", `bytes: 0`).

## 3. Where attribution is displayed

| Asset | Where the credit appears |
| --- | --- |
| The three Poly Haven CC0 assets | The landing page `/virtual-labs`, section **"Credits and sources"**. It lists every manifest row with `status === "approved" && used`: name (linked to the source), creator, licence and attribution text. It also says the rooms, furniture, glassware and instruments are original procedural models |
| The clove oil-gland photograph (CC BY-SA 4.0) | Under the image, in the clove lab's **step 7, "Compare with the reference"** (`benches/CloveBench.tsx` → `Reference`). The caption reads: "Photo: آية تاج الدين, Wikimedia Commons, CC BY-SA 4.0", with links to the Commons file page and to the licence. It also says the photo has no scale bar and is **"Not yet confirmed by our reviewer."** |

**Known gap.** The clove photograph's manifest status is `needs_review`, so the landing page's filter
(`status === "approved"`) leaves it out of "Credits and sources". Its licence is still satisfied by the caption
beside the image. When a pharmacognosy teacher confirms the identification, set the row's `status` to `"approved"`.
It will then also appear in the landing-page credits.

## 4. Rules for adding an asset
1. Read the licence on the asset's own page or API record, on the day. Reject NC, ND, unknown, and BlendKit "Royalty
   Free" until it has been reviewed.
2. Add a row to `assets/manifest.ts` with: source URL, creator, licence, commercial / modification / redistribution,
   attribution text, share-alike, status, `used`, every shipped file with its byte size, and the decision.
3. Add the asset to the tables above, with sizes from `ls -l`.
4. If attribution is required, make sure it is visible. Either set the status to `approved` so the landing page lists
   it, or put a caption beside the asset as the clove photo has.
