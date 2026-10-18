# Osteology Lab — 3D asset pipeline

Repeatable path from the Z-Anatomy Blender atlas to the lab's GLB models, landmark anchors
and spotting images. Everything it writes is committed; nobody needs Blender to run the site.

## Source and licence

- **Z-Anatomy** — <https://github.com/Z-Anatomy/Models-of-human-anatomy>, file `Z-Anatomy.zip`
  → `Z-Anatomy/Startup.blend` (≈ 300 MB). CC BY-SA 4.0 (the repo's `License.txt`).
- Its meshes derive from **BodyParts3D** (© DBCLS, CC BY-SA 2.1 JP). Both must be credited.
- Our outputs are adaptations and are distributed under **CC BY-SA 4.0**
  (`src/lib/osteology/attribution.ts`, shown on `/osteology-lab/about#credits`).
  This covers the model and image files only, not the lab's code or written content.

## Tools (not project dependencies)

- Blender **4.2 LTS**, portable tarball from <https://download.blender.org/release/Blender4.2/>.
  Used headless; nothing is installed into the repo.
- Node (for `hash-images.mjs`).

## Steps

```bash
# 1. Export models + landmark anchors (~30 s). Writes public/models/osteology/*.glb and
#    src/lib/osteology/generated/models.json.
blender -b --factory-startup --disable-autoexec <path>/Z-Anatomy/Startup.blend \
  --python scripts/osteology/export-zanatomy.py -- "$PWD"

# 2. Render spotting images (~40 min on 8 CPU cores, Cycles). Writes
#    public/images/osteology/spotting/<id>.webp and generated/spotting-images.json.
#    PW_ONLY=<slug> renders one model; PW_RENDER_SAMPLES / PW_RENDER_SIZE tune quality.
blender -b --factory-startup --python scripts/osteology/render-spotting.py -- "$PWD"

# 3. Publish the renders under content-hash names (an id names its answer).
node scripts/osteology/hash-images.mjs

# 4. Check content against the new assets.
node --test scripts/osteology.test.mts
```

`--disable-autoexec` matters: the Z-Anatomy file embeds a Python add-on we do not run.

## What to choose, where

- **Which structures form a model:** `zanatomy-specs.json` (Z-Anatomy object names without the
  `.r` / `.l` suffix; the right side is exported, and the viewer mirrors it for a left bone).
- **Which views each bone / joint is rendered in:** `BONE_VIEWS` / `JOINT_VIEWS` in
  `render-spotting.py`.

## Verify after a re-export

1. The exporter prints `missing [...]` per model — it must be empty.
2. `models.json` → each landmark's `offMm` is the leader end's distance from the bone surface.
   Non-zero is expected for holes (foramina, the sacral hiatus); a large value elsewhere means
   the label moved — look at it in the viewer.
3. Open a few renders: the bone is ivory, articular cartilage pale blue, ligaments grey-blue,
   the highlighted structure brand blue.
4. `node --test scripts/osteology.test.mts` — every `zName` in the content must still exist.

## Facts worth knowing

- Z-Anatomy labels are FONT objects parented to the bone (`.t` right, `.s` left); each has a
  2-vertex leader mesh (`.j` / `.i`) placed by **Hook** modifiers, so only the *evaluated*
  geometry has the real points.
- Z-Anatomy's materials crash Blender's glTF exporter (IndexError in its node-tree search);
  the exporter replaces them with plain `Bone` / `Cartilage` / `Ligament` / `Capsule` /
  `Fibrocartilage` / `Membrane` materials, keeping per-face assignment.
- Z-Anatomy's typical vertebra is **L3** and its typical rib is the **sixth rib** — the only
  ones it labels; the lab uses them and says so.
- three.js's GLTFLoader sanitises node names (`Femur.r` → `Femurr`); the original is in
  `object.userData.name`, which is what the viewer uses.
