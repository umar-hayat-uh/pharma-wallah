"""
Export the Osteology Lab's 3D models from the Z-Anatomy Blender atlas.

Repeatable pipeline (see scripts/osteology/README.md for the full procedure):

    blender -b --factory-startup --disable-autoexec <Z-Anatomy>/Startup.blend \
        --python scripts/osteology/export-zanatomy.py -- <repo root>

Inputs   scripts/osteology/zanatomy-specs.json — which Z-Anatomy objects form which model.
Outputs  public/models/osteology/<kind>-<slug>.glb      one GLB per bone / joint, plus skeleton.glb
         src/lib/osteology/generated/models.json        mesh lists, real sizes, landmark anchors

Licence: Z-Anatomy is CC BY-SA 4.0 and derives its meshes from BodyParts3D (DBCLS,
CC BY-SA 2.1 JP). Every file this script writes is an adaptation of that material and is
distributed under CC BY-SA 4.0 with both attributions (src/lib/osteology/attribution.ts).

Why the choices below:
- Geometry is read from the *evaluated* depsgraph. Z-Anatomy's ligaments and capsules carry
  Subdivision + Solidify modifiers, and its label leader lines are positioned by Hook
  modifiers, so the raw mesh data is not what the atlas shows.
- Landmark anchors are the end of each Z-Anatomy label's leader line that lies nearer the
  bone. They are recorded exactly as the atlas places them — never snapped or nudged — so
  every 3D landmark in the lab is a point an anatomist placed, not one we invented.
- Each model is centred and scaled so its largest dimension is 1 unit; the real size in
  centimetres is kept in models.json. Blender is Z-up; glTF is Y-up, so a Blender point
  (x, y, z) becomes (x, z, -y). In that frame the body's anterior is +Z, superior is +Y and
  the body's right is -X (Z-Anatomy places right-sided structures at negative x).
- Only right-sided structures are exported. Z-Anatomy's left meshes are mirror copies of the
  right (same vertex count, x negated), so the viewer shows a left bone by mirroring X.
"""

import bpy
import json
import os
import sys
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

REPO = sys.argv[sys.argv.index("--") + 1]
SPECS = json.load(open(os.path.join(REPO, "scripts/osteology/zanatomy-specs.json")))
MODEL_DIR = os.path.join(REPO, "public/models/osteology")
DATA_PATH = os.path.join(REPO, "src/lib/osteology/generated/models.json")
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)

DEPSGRAPH = bpy.context.evaluated_depsgraph_get()
OUT_COLL = bpy.data.collections.new("__export__")
bpy.context.scene.collection.children.link(OUT_COLL)

# Shared, flat materials for soft tissue. Bones keep Z-Anatomy's own "Bone" / "Cartilage"
# material slots, which is how the viewer tells articular cartilage from bone.
SOFT_MAT = {}


def soft_material(kind):
    if kind not in SOFT_MAT:
        m = bpy.data.materials.new(kind)
        SOFT_MAT[kind] = m
    return SOFT_MAT[kind]


def soft_kind(name):
    n = name.lower()
    if "capsule" in n or "zona orbicularis" in n:
        return "Capsule"
    if "disc" in n or "menisc" in n or "labrum" in n or "symphysis" in n:
        return "Fibrocartilage"
    if "membrane" in n or "cord" in n:
        return "Membrane"
    return "Ligament"


# Blender suffixes a duplicate object name ("Sacrum" → "Sacrum.001"), and that suffixed name
# is what lands in the GLB — so the export copy of a midline structure would no longer match
# its name in models.json or the content's zName. Before naming a copy, the source object
# with that name is renamed aside (this script never saves the .blend).
ASIDE = "~src"


def obj(name):
    return bpy.data.objects.get(name) or bpy.data.objects.get(name + ASIDE)


def resolve(name):
    """Z-Anatomy name -> object. Explicit '.l' / '.r' wins; otherwise try right, then midline."""
    if name.endswith(".l") or name.endswith(".r"):
        return obj(name)
    return obj(name + ".r") or obj(name)


def base_name(obj_name):
    if obj_name.endswith(ASIDE):
        obj_name = obj_name[: -len(ASIDE)]
    for suffix in (".r", ".l", ".t", ".s", ".j", ".i"):
        if obj_name.endswith(suffix):
            return obj_name[: -len(suffix)]
    return obj_name


def world_mesh(obj):
    """Evaluated mesh of obj, transformed into world space."""
    ev = obj.evaluated_get(DEPSGRAPH)
    me = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=False, depsgraph=DEPSGRAPH)
    me.transform(obj.matrix_world)
    return me


def to_gltf(v):
    return [round(v.x, 5), round(v.z, 5), round(-v.y, 5)]


def landmarks_for(bone, bvh):
    """Every label parented to obj, with the leader-line end that lies on (or nearest) the bone."""
    side_label = ".s" if bone.name.endswith(".l") else ".t"
    side_line = ".i" if bone.name.endswith(".l") else ".j"
    own = base_name(bone.name)
    found = []
    for child in bone.children:
        if child.type != "FONT" or not child.name.endswith(side_label):
            continue
        name = base_name(child.name)
        if name == own:
            continue  # the label naming the bone itself
        line = obj(name + side_line)
        if line is None or line.type != "MESH":
            continue
        me = world_mesh(line)
        pts = [v.co.copy() for v in me.vertices]
        bpy.data.meshes.remove(me)
        if len(pts) < 2:
            continue
        best = None
        for p in pts:
            hit = bvh.find_nearest(p)
            if hit[0] is None:
                continue
            if best is None or hit[3] < best[3]:
                best = (p, hit[0], hit[1], hit[3])
        if best is None:
            continue
        p, _surface, normal, dist = best
        found.append({"name": name, "label": child.data.body.strip(), "p": p, "n": normal, "d": dist})
    return found


def make_object(src, display_name, kind):
    me = world_mesh(src)
    for poly in me.polygons:
        poly.use_smooth = True
    if kind != "bone":
        me.materials.clear()
        me.materials.append(soft_material(soft_kind(display_name)))
    else:
        # Z-Anatomy's own node trees crash the glTF exporter (IndexError in its node search),
        # so swap each slot for a plain material of the same role. Face assignments are kept,
        # which is what lets the viewer colour articular cartilage apart from bone.
        for i, m in enumerate(me.materials):
            me.materials[i] = soft_material("Cartilage" if m and "cartilage" in m.name.lower() else "Bone")
    clash = bpy.data.objects.get(display_name)
    if clash is not None:
        clash.name = display_name + ASIDE
    ob = bpy.data.objects.new(display_name, me)
    OUT_COLL.objects.link(ob)
    assert ob.name == display_name, f"export name clash: {display_name} -> {ob.name}"
    return ob


def export_model(slug, file_name, parts, with_landmarks):
    """parts: list of (z-anatomy name, 'bone' | 'soft'). Returns the models.json entry."""
    objs, meta, missing, raw_landmarks = [], [], [], []
    for name, kind in parts:
        src = resolve(name)
        if src is None or src.type != "MESH":
            missing.append(name)
            continue
        display = base_name(src.name)
        if src.name.endswith(".l"):
            display += " (left)"
        ob = make_object(src, display, kind)
        objs.append(ob)
        meta.append({"name": display, "kind": kind if kind == "bone" else soft_kind(display), "verts": len(ob.data.vertices)})
        if with_landmarks:
            bvh = BVHTree.FromObject(src, DEPSGRAPH)  # world space is applied below
            # FromObject builds in object space; transform the query points instead.
            inv = src.matrix_world.inverted()
            rot = src.matrix_world.to_3x3()
            for lm in landmarks_for_world(src, bvh, inv, rot):
                lm["mesh"] = display
                raw_landmarks.append(lm)

    # Normalise: centre on the bounding box, largest dimension = 1.
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for ob in objs:
        for v in ob.data.vertices:
            for i in range(3):
                lo[i] = min(lo[i], v.co[i])
                hi[i] = max(hi[i], v.co[i])
    size = hi - lo
    centre = (lo + hi) / 2
    scale = 1.0 / max(size)
    norm = Matrix.Scale(scale, 4) @ Matrix.Translation(-centre)
    for ob in objs:
        ob.data.transform(norm)

    bpy.ops.object.select_all(action="DESELECT")
    for ob in objs:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    path = os.path.join(MODEL_DIR, file_name)
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=False,
        export_yup=True,
        export_texcoords=False,
        export_normals=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=False,
    )

    landmarks = []
    for lm in raw_landmarks:
        p = norm @ lm["p"]
        landmarks.append({
            "name": lm["name"],
            "mesh": lm["mesh"],
            "p": to_gltf(p),
            "n": to_gltf(lm["n"].normalized()),
            # distance from the leader end to the bone surface, in mm, for QA: a foramen or
            # notch is legitimately off the surface; a large value elsewhere needs a look.
            "offMm": round(lm["d"] * 1000, 1),
        })

    entry = {
        "slug": slug,
        "file": file_name,
        "bytes": os.path.getsize(path),
        "sizeCm": [round(size.x * 100, 1), round(size.z * 100, 1), round(size.y * 100, 1)],
        "parts": meta,
        "missing": missing,
        "landmarks": sorted(landmarks, key=lambda l: (l["mesh"], l["name"])),
    }
    for ob in objs:
        me = ob.data
        bpy.data.objects.remove(ob)
        bpy.data.meshes.remove(me)
    return entry


def landmarks_for_world(src, bvh_local, inv, rot):
    """landmarks_for() against an object-space BVH: query in object space, report in world."""

    class WorldBVH:
        def find_nearest(self, p):
            loc, normal, idx, dist = bvh_local.find_nearest(inv @ p)
            if loc is None:
                return (None, None, None, None)
            return (src.matrix_world @ loc, (rot @ normal).normalized(), idx, (src.matrix_world @ loc - p).length)

    return landmarks_for(src, WorldBVH())


# ── Skeleton overview (for the Skeleton Viva bone picker) ─────────────────────────────
SKELETON_SKIP = ("cartilage", "tooth", "molar", "premolar", "incisor", "canine", "incus", "malleus",
                 "stapes", "cells of ethmoid", "sinus of", "aperture", "infrasternal", "pelvic inlet",
                 "pelvic outlet", "sesamoid")


def export_skeleton(bone_lookup):
    coll = bpy.data.collections.get("1: Skeletal system")
    parts, objs = [], []
    for src in coll.all_objects:
        if src.type != "MESH" or len(src.data.vertices) <= 4 or src.name.endswith(".g"):
            continue
        low = src.name.lower()
        if any(s in low for s in SKELETON_SKIP):
            continue
        base = base_name(src.name)
        side = "left" if src.name.endswith(".l") else "right" if src.name.endswith(".r") else "midline"
        label = base if side == "midline" else f"{base} ({side})"
        ob = make_object(src, label, "bone")
        # The overview only needs to be recognisable, and it is the one model that loads
        # ~200 meshes at once: thin it to keep the download small on a phone.
        if len(ob.data.vertices) > 300:
            dec = ob.modifiers.new("dec", "DECIMATE")
            dec.ratio = 0.2
            bpy.context.view_layer.objects.active = ob
            with bpy.context.temp_override(object=ob, active_object=ob):
                bpy.ops.object.modifier_apply(modifier=dec.name)
        objs.append(ob)
        parts.append({"name": label, "base": base, "side": side, "bone": bone_lookup.get(base)})
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for ob in objs:
        for v in ob.data.vertices:
            for i in range(3):
                lo[i] = min(lo[i], v.co[i])
                hi[i] = max(hi[i], v.co[i])
    size = hi - lo
    norm = Matrix.Scale(1.0 / max(size), 4) @ Matrix.Translation(-(lo + hi) / 2)
    for ob in objs:
        ob.data.transform(norm)
    bpy.ops.object.select_all(action="DESELECT")
    for ob in objs:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    path = os.path.join(MODEL_DIR, "skeleton.glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True, export_apply=False,
                              export_yup=True, export_texcoords=False, export_normals=True,
                              export_materials="NONE", export_cameras=False, export_lights=False)
    for ob in objs:
        me = ob.data
        bpy.data.objects.remove(ob)
        bpy.data.meshes.remove(me)
    return {"file": "skeleton.glb", "bytes": os.path.getsize(path),
            "sizeCm": [round(size.x * 100, 1), round(size.z * 100, 1), round(size.y * 100, 1)],
            "parts": sorted(parts, key=lambda p: p["name"])}


def main():
    out = {"source": "Z-Anatomy Startup.blend (github.com/Z-Anatomy/Models-of-human-anatomy, master)",
           "frame": "glTF Y-up; +Y superior, +Z anterior, -X = body's right; largest dimension = 1",
           "bones": [], "joints": []}
    bone_lookup = {}
    for spec in SPECS["bones"]:
        for m in spec["meshes"]:
            bone_lookup[m] = spec["slug"]
        entry = export_model(spec["slug"], f"bone-{spec['slug']}.glb", [(m, "bone") for m in spec["meshes"]], True)
        out["bones"].append(entry)
        print("bone", spec["slug"], entry["bytes"], "landmarks", len(entry["landmarks"]), "missing", entry["missing"])
    for spec in SPECS["joints"]:
        parts = [(b, "bone") for b in spec["bones"]] + [(s, "soft") for s in spec["soft"]]
        entry = export_model(spec["slug"], f"joint-{spec['slug']}.glb", parts, False)
        out["joints"].append(entry)
        print("joint", spec["slug"], entry["bytes"], "missing", entry["missing"])
    out["skeleton"] = export_skeleton(bone_lookup)
    print("skeleton", out["skeleton"]["bytes"], len(out["skeleton"]["parts"]))
    with open(DATA_PATH, "w") as f:
        json.dump(out, f, indent=1)


main()
