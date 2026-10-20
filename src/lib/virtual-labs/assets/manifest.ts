/**
 * Machine-readable asset manifest for the Virtual Labs (2026-10-20).
 *
 * Every row was checked on the individual asset's own page or API record on 2026-10-20
 * (docs/virtual-labs/ASSET_RESEARCH.md has the evidence). `used: true` = shipped in
 * public/; everything else is recorded so the decision is traceable. File sizes are the
 * shipped files' actual sizes (bytes), measured from disk. The rooms, furniture, glassware
 * and instruments themselves are original procedural geometry (src/components/virtual-labs/three/).
 */

export type AssetStatus = "approved" | "needs_review" | "rejected";

export interface AssetRecord {
  id: string;
  name: string;
  kind: "texture" | "hdri" | "model" | "image" | "procedural";
  sourceUrl: string;
  creator: string;
  licence: string;
  commercial: boolean | null;
  modification: boolean | null;
  redistribution: boolean | null;
  attribution: string;
  shareAlike: boolean;
  status: AssetStatus;
  used: boolean;
  files: { path: string; bytes: number; note?: string }[];
  technical?: string;
  decision: string;
}

export const ASSET_MANIFEST: AssetRecord[] = [
  {
    id: "polyhaven-interior-tiles",
    name: "Interior Tiles",
    kind: "texture",
    sourceUrl: "https://polyhaven.com/a/interior_tiles",
    creator: "Charlotte Baglioni (Poly Haven)",
    licence: "CC0 1.0",
    commercial: true,
    modification: true,
    redistribution: true,
    attribution: "Not required (CC0); credited as a courtesy.",
    shareAlike: false,
    status: "approved",
    used: true,
    files: [
      { path: "public/models/virtual-labs/environments/textures/interior_tiles_nor_gl_1k.webp", bytes: 19916, note: "normal map (OpenGL), 1k, re-encoded JPG→WebP q82" },
      { path: "public/models/virtual-labs/environments/textures/interior_tiles_rough_1k.webp", bytes: 53116, note: "roughness, 1k, re-encoded JPG→WebP q82" },
    ],
    technical: "1024×1024; grid runs at 45° in the map, rotated in code. Colour map not shipped: the floor colour is the lab's own pale vinyl.",
    decision: "Approved. Normal + roughness give the floor real tile seams and sheen at low cost.",
  },
  {
    id: "polyhaven-beige-wall-001",
    name: "Beige Wall 001",
    kind: "texture",
    sourceUrl: "https://polyhaven.com/a/beige_wall_001",
    creator: "Dimitrios Savva, Rico Cilliers (Poly Haven)",
    licence: "CC0 1.0",
    commercial: true,
    modification: true,
    redistribution: true,
    attribution: "Not required (CC0); credited as a courtesy.",
    shareAlike: false,
    status: "approved",
    used: true,
    files: [
      { path: "public/models/virtual-labs/environments/textures/beige_wall_001_nor_gl_1k.webp", bytes: 78506 },
      { path: "public/models/virtual-labs/environments/textures/beige_wall_001_rough_1k.webp", bytes: 76110 },
    ],
    technical: "1024×1024 painted plaster detail; tinted near-white in code.",
    decision: "Approved. Breaks up large flat walls.",
  },
  {
    id: "polyhaven-small-empty-room-3",
    name: "Small Empty Room 3 (HDRI)",
    kind: "hdri",
    sourceUrl: "https://polyhaven.com/a/small_empty_room_3",
    creator: "Sergej Majboroda (Poly Haven)",
    licence: "CC0 1.0",
    commercial: true,
    modification: true,
    redistribution: true,
    attribution: "Not required (CC0); credited as a courtesy.",
    shareAlike: false,
    status: "approved",
    used: true,
    files: [{ path: "public/models/virtual-labs/environments/hdri/small_empty_room_3_1k.hdr", bytes: 1533412 }],
    technical: "1024×512 Radiance RGBE; environment lighting and reflections only (never shown as background). Loaded on Medium/High quality only.",
    decision: "Approved. Neutral office light with LED panels — reads well on glassware.",
  },
  {
    id: "commons-clove-oil-glands",
    name: "Oil glands of clove powder under light microscope",
    kind: "image",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Oil_glands_of_clove_powder_under_light_microscope.jpg",
    creator: "آية تاج الدين (Wikimedia Commons user)",
    licence: "CC BY-SA 4.0",
    commercial: true,
    modification: true,
    redistribution: true,
    attribution: "Photo: آية تاج الدين, Wikimedia Commons, CC BY-SA 4.0 — shown with its credit under the image.",
    shareAlike: true,
    status: "needs_review",
    used: true,
    files: [{ path: "public/models/virtual-labs/specimens/clove-oil-glands-commons.jpg", bytes: 35208, note: "unmodified original (SHA-1 matched the Commons record)" }],
    technical: "774×1032 JPEG, eyepiece photo, no scale bar.",
    decision: "Shown only in the clove lab's 'Compare with the reference' step, unmodified, credited, and labelled 'not yet confirmed by our reviewer' until a pharmacognosy teacher confirms it.",
  },
  {
    id: "procedural-rooms",
    name: "Rooms, furniture, glassware and instruments",
    kind: "procedural",
    sourceUrl: "https://www.pharmawallah.com/virtual-labs",
    creator: "PharmaWallah (original procedural geometry)",
    licence: "PharmaWallah — original work",
    commercial: true,
    modification: true,
    redistribution: true,
    attribution: "—",
    shareAlike: false,
    status: "approved",
    used: true,
    files: [{ path: "src/components/virtual-labs/three/", bytes: 0, note: "generated at runtime; no model download" }],
    technical: "Lathe-turned glassware at real dimensions; canvas-drawn labels, GHS/ISO-style signs and displays.",
    decision: "Built because no openly licensed burette, analytical balance with draught shield, organ bath, fume cupboard or eyewash was downloadable under an acceptable licence.",
  },
  // ── researched, not shipped ──
  { id: "polyhaven-hospital-room-2", name: "Hospital Room 2 (HDRI)", kind: "hdri", sourceUrl: "https://polyhaven.com/a/hospital_room_2", creator: "Dimitrios Savva, Jarod Guest", licence: "CC0 1.0", commercial: true, modification: true, redistribution: true, attribution: "Not required", shareAlike: false, status: "approved", used: false, files: [], technical: "1k .hdr, 1,609,763 B", decision: "Approved; not used — one HDRI is enough and the office HDRI is more neutral." },
  { id: "polyhaven-granite-tile", name: "Granite Tile", kind: "texture", sourceUrl: "https://polyhaven.com/a/granite_tile", creator: "Charlotte Baglioni", licence: "CC0 1.0", commercial: true, modification: true, redistribution: true, attribution: "Not required", shareAlike: false, status: "approved", used: false, files: [], decision: "Approved; not used — the epoxy bench tops are procedural." },
  { id: "polyhaven-ash-veneer", name: "Ash Veneer", kind: "texture", sourceUrl: "https://polyhaven.com/a/ash_veneer", creator: "Jenelle van Heerden", licence: "CC0 1.0", commercial: true, modification: true, redistribution: true, attribution: "Not required", shareAlike: false, status: "approved", used: false, files: [], decision: "Approved; not used — casework is white laminate." },
  { id: "polyhaven-long-white-tiles", name: "Long White Tiles", kind: "texture", sourceUrl: "https://polyhaven.com/a/long_white_tiles", creator: "Jenelle van Heerden, Sergej Majboroda", licence: "CC0 1.0", commercial: true, modification: true, redistribution: true, attribution: "Not required", shareAlike: false, status: "approved", used: false, files: [], decision: "Approved; not used (tagged 'weathered')." },
  { id: "ambientcg-metal009", name: "Metal 009 (brushed steel)", kind: "texture", sourceUrl: "https://ambientcg.com/a/Metal009", creator: "ambientCG", licence: "CC0 1.0 (site-wide statement)", commercial: true, modification: true, redistribution: true, attribution: "Not required", shareAlike: false, status: "approved", used: false, files: [], decision: "Approved; not used — procedural PBR metal is sufficient at bench scale." },
  { id: "polyhaven-industrial-microscope", name: "Industrial Microscope (glTF)", kind: "model", sourceUrl: "https://polyhaven.com/a/industrial_microscope", creator: "Lukas Walzer", licence: "CC0 1.0", commercial: true, modification: true, redistribution: true, attribution: "Not required", shareAlike: false, status: "approved", used: false, files: [], technical: "16,598 triangles; 1k glTF set 2,456,539 B", decision: "Licence approved; not used — one rigid mesh, so its nosepiece, focus and stage cannot move to reflect the student's actions. A procedural compound microscope with working parts is used instead." },
  { id: "sketchfab-candidates", name: "Sketchfab lab models (burettes, retort stand, glassware set, electronic balance, compound microscope, lab benches, water bath)", kind: "model", sourceUrl: "https://sketchfab.com", creator: "Various (see ASSET_RESEARCH.md)", licence: "Mostly CC BY 4.0 (per model record)", commercial: true, modification: true, redistribution: true, attribution: "Required per model", shareAlike: false, status: "needs_review", used: false, files: [], decision: "Needs review — downloading requires a Sketchfab account; none was used. NC/ND/'Free Standard' models were rejected." },
  { id: "nih3d-pollen", name: "NIH 3D pollen-grain models", kind: "model", sourceUrl: "https://3d.nih.gov/entries/21554", creator: "NIH 3D contributors", licence: "CC BY-NC", commercial: false, modification: true, redistribution: false, attribution: "Required", shareAlike: false, status: "rejected", used: false, files: [], decision: "Rejected — NonCommercial; the site runs ads." },
  { id: "blendkit-royalty-free", name: "BlendKit 'Royalty Free' microscope and beaker", kind: "model", sourceUrl: "https://www.blenderkit.com", creator: "Various", licence: "BlendKit Royalty Free", commercial: true, modification: true, redistribution: null, attribution: "Not required", shareAlike: false, status: "needs_review", used: false, files: [], decision: "Needs legal review — the licence does not say whether serving the raw model from a public website is permitted." },
];
