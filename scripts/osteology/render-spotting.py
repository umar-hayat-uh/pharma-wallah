"""
Render the Osteology Lab's spotting images from the exported GLB models.

    blender -b --factory-startup --python scripts/osteology/render-spotting.py -- <repo root>

Run after export-zanatomy.py (it reads public/models/osteology/*.glb and
src/lib/osteology/generated/models.json). Writes:

    public/images/osteology/spotting/<id>.webp            transparent, unlabelled renders
    src/lib/osteology/generated/spotting-images.json       per image: model, side, view, and
                                                            the landmarks visible in it with
                                                            their position as a fraction of
                                                            the frame

These are renders of the Z-Anatomy / BodyParts3D models (CC BY-SA 4.0), not photographs of
specimens, and the lab labels them that way. They are NOT X-rays. A marker is only recorded
when a ray from the camera reaches the landmark's anchor without first hitting another
surface, so a question never points at something hidden behind the bone.
"""

import bpy
import json
import math
import os
import sys
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

REPO = sys.argv[sys.argv.index("--") + 1]
MODELS = json.load(open(os.path.join(REPO, "src/lib/osteology/generated/models.json")))
MODEL_DIR = os.path.join(REPO, "public/models/osteology")
IMG_DIR = os.path.join(REPO, "public/images/osteology/spotting")
OUT_JSON = os.path.join(REPO, "src/lib/osteology/generated/spotting-images.json")
os.makedirs(IMG_DIR, exist_ok=True)
SIZE = int(os.environ.get("PW_RENDER_SIZE", "720"))
SAMPLES = int(os.environ.get("PW_RENDER_SAMPLES", "48"))

# Blender frame after glTF import: anterior = -Y, superior = +Z, body's right = -X.
DIRS = {
    "anterior": Vector((0, -1, 0)), "posterior": Vector((0, 1, 0)),
    "superior": Vector((0, 0, 1)), "inferior": Vector((0, 0, -1)),
    "right": Vector((-1, 0, 0)), "left": Vector((1, 0, 0)),
}

# Which views each bone is shown in. "lateral"/"medial" resolve to right/left by side.
# Hand: palmar = anterior in the anatomical position. Foot: dorsal = superior.
BONE_VIEWS = {
    "clavicle": ["superior", "inferior"], "scapula": ["anterior", "posterior"],
    "humerus": ["anterior", "posterior"], "radius": ["anterior", "posterior"],
    "ulna": ["anterior", "lateral"], "carpals": ["anterior", "posterior"],
    "metacarpals": ["anterior", "posterior"], "hand-phalanges": ["anterior", "posterior"],
    "hip-bone": ["lateral", "medial"], "femur": ["anterior", "posterior"],
    "patella": ["anterior", "posterior"], "tibia": ["anterior", "posterior"],
    "fibula": ["lateral", "medial"], "tarsals": ["superior", "medial"],
    "metatarsals": ["superior", "inferior"], "foot-phalanges": ["superior", "inferior"],
    "typical-vertebra": ["superior", "lateral"], "atlas": ["superior", "inferior"],
    "axis": ["anterior", "lateral"], "sternum": ["anterior", "lateral"],
    "rib": ["anterior", "posterior"], "sacrum": ["anterior", "posterior"],
}
MIDLINE = {"typical-vertebra", "atlas", "axis", "sternum", "sacrum"}
JOINT_VIEWS = {
    "sternoclavicular": ["anterior"], "acromioclavicular": ["anterior", "superior"],
    "glenohumeral": ["anterior", "posterior"], "elbow": ["anterior", "medial"],
    "wrist": ["anterior", "posterior"], "radioulnar": ["anterior"],
    "carpometacarpal": ["anterior", "posterior"], "metacarpophalangeal": ["anterior", "lateral"],
    "hand-interphalangeal": ["lateral", "anterior"], "sacroiliac": ["anterior", "posterior"],
    "pubic-symphysis": ["anterior"], "hip": ["anterior", "posterior"],
    "knee": ["anterior", "posterior"], "ankle": ["lateral", "medial"],
    "tarsometatarsal": ["superior", "inferior"], "metatarsophalangeal": ["superior", "medial"],
    "foot-interphalangeal": ["superior", "medial"],
}

COLOURS = {
    "Bone": ((0.80, 0.74, 0.61, 1), 0.6),
    "Cartilage": ((0.70, 0.82, 0.93, 1), 0.35),
    "Ligament": ((0.62, 0.68, 0.76, 1), 0.5),
    "Membrane": ((0.66, 0.71, 0.78, 1), 0.5),
    "Fibrocartilage": ((0.80, 0.86, 0.92, 1), 0.4),
    "Capsule": ((0.74, 0.78, 0.84, 0.35), 0.5),
    "Highlight": ((0.11, 0.48, 0.85, 1), 0.4),
}
MATS = {}


def material(kind):
    if kind in MATS:
        return MATS[kind]
    colour, rough = COLOURS[kind]
    m = bpy.data.materials.new("pw-" + kind)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = colour
    bsdf.inputs["Roughness"].default_value = rough
    if colour[3] < 1:
        bsdf.inputs["Alpha"].default_value = colour[3]
        m.blend_method = "BLEND"
    MATS[kind] = m
    return m


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATS.clear()
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = SAMPLES
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.render.resolution_x = SIZE
    sc.render.resolution_y = SIZE
    sc.render.image_settings.file_format = "WEBP"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.quality = 80
    sc.view_settings.view_transform = "Standard"
    world = bpy.data.worlds.new("w")
    sc.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.92, 0.93, 0.95, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.22
    return sc


def import_model(file_name, mirror):
    bpy.ops.import_scene.gltf(filepath=os.path.join(MODEL_DIR, file_name))
    meshes = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    for o in meshes:
        if mirror:
            o.scale.x *= -1
    bpy.context.view_layer.update()
    return meshes


def style(meshes, highlight=None):
    for o in meshes:
        for i, slot in enumerate(o.material_slots):
            src = slot.material.name if slot.material else "Bone"
            kind = src.split(".")[0] if src.split(".")[0] in COLOURS else "Bone"
            if highlight and o.name.split(".")[0] == highlight:
                kind = "Highlight"
            o.material_slots[i].material = material(kind)


def setup_camera_and_lights(meshes, direction):
    sc = bpy.context.scene
    pts = [o.matrix_world @ v.co for o in meshes for v in o.data.vertices]
    centre = sum(pts, Vector()) / len(pts)
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    centre = (lo + hi) / 2
    cam_data = bpy.data.cameras.new("cam")
    cam_data.type = "ORTHO"
    cam = bpy.data.objects.new("cam", cam_data)
    sc.collection.objects.link(cam)
    sc.camera = cam
    cam.location = centre + direction * 4
    up = Vector((0, 0, 1)) if abs(direction.z) < 0.9 else Vector((0, -1, 0))
    if direction.z > 0.9:
        up = Vector((0, 1, 0))  # superior view: posterior at the top, anterior at the bottom
    cam.rotation_euler = (-direction).to_track_quat("-Z", "Y").to_euler()
    # roll so `up` points up on screen
    fwd = -direction
    right = fwd.cross(up).normalized()
    true_up = right.cross(fwd).normalized()
    from mathutils import Matrix
    rot = Matrix((right, true_up, -fwd)).transposed()
    cam.rotation_euler = rot.to_euler()
    bpy.context.view_layer.update()
    # fit: project the points onto the camera plane
    xs = [(p - centre).dot(right) for p in pts]
    ys = [(p - centre).dot(true_up) for p in pts]
    cx = (max(xs) + min(xs)) / 2
    cy = (max(ys) + min(ys)) / 2
    cam.location = centre + right * cx + true_up * cy + direction * 4
    cam_data.ortho_scale = max(max(xs) - min(xs), max(ys) - min(ys)) * 1.12
    cam_data.clip_end = 20
    # three-point light, key from the viewer's upper left
    for name, offset, energy in (("key", (-1.2, 1.4), 2.6), ("fill", (1.4, 0.4), 0.55), ("rim", (0.0, -1.6), 0.45)):
        ld = bpy.data.lights.new(name, "SUN")
        ld.energy = energy
        ld.angle = math.radians(25)
        lo_ = bpy.data.objects.new(name, ld)
        sc.collection.objects.link(lo_)
        d = (direction + right * offset[0] + true_up * offset[1]).normalized()
        lo_.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
    return cam, right, true_up


def visible_markers(cam, direction, landmarks, mirror):
    sc = bpy.context.scene
    dg = bpy.context.evaluated_depsgraph_get()
    out = []
    for lm in landmarks:
        g = lm["p"]
        # glTF (x, y, z) -> Blender (x, -z, y); a left bone is the mirror in x.
        p = Vector(((-g[0] if mirror else g[0]), -g[2], g[1]))
        uv = world_to_camera_view(sc, cam, p)
        if not (0.04 < uv.x < 0.96 and 0.04 < uv.y < 0.96):
            continue
        origin = p + direction * 5
        hit, loc, *_ = sc.ray_cast(dg, origin, -direction)
        reach = (origin - p).length
        if hit and (origin - loc).length < reach - 0.012:
            continue  # something sits between the camera and the anchor
        out.append({"name": lm["name"], "mesh": lm["mesh"], "x": round(uv.x, 4), "y": round(1 - uv.y, 4)})
    return out


def best_view(target):
    """The direction from which the largest share of target's vertices is unobstructed."""
    sc = bpy.context.scene
    dg = bpy.context.evaluated_depsgraph_get()
    verts = [target.matrix_world @ v.co for v in target.data.vertices]
    step = max(1, len(verts) // 300)
    sample = verts[::step]
    best = ("anterior", 0.0)
    for name in ("anterior", "posterior", "right", "left", "superior", "inferior"):
        d = DIRS[name]
        seen = 0
        for p in sample:
            origin = p + d * 5
            hit, loc, _n, _i, obj, _m = sc.ray_cast(dg, origin, -d)
            if hit and (obj.name == target.name or (loc - p).length < 0.01):
                seen += 1
        frac = seen / len(sample)
        if frac > best[1]:
            best = (name, frac)
    return best


def resolve_view(view, side):
    if view == "lateral":
        return "right" if side == "right" else "left"
    if view == "medial":
        return "left" if side == "right" else "right"
    return view


def render(image_id):
    path = os.path.join(IMG_DIR, image_id + ".webp")
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    return os.path.getsize(path)


def main():
    only = os.environ.get("PW_ONLY")
    images = []
    for b in MODELS["bones"]:
        slug = b["slug"]
        if only and slug != only:
            continue
        sides = ["midline"] if slug in MIDLINE else ["right", "left"]
        for side in sides:
            for view in BONE_VIEWS[slug]:
                sc = reset_scene()
                meshes = import_model(b["file"], side == "left")
                style(meshes)
                d = DIRS[resolve_view(view, "right" if side == "midline" else side)]
                cam, *_ = setup_camera_and_lights(meshes, d)
                iid = f"bone-{slug}-{side}-{view}"
                size = render(iid)
                images.append({"id": iid, "kind": "bone", "model": slug, "side": side, "view": view, "bytes": size,
                               "markers": visible_markers(cam, d, b["landmarks"], side == "left")})
                print("render", iid, size, len(images[-1]["markers"]))
    for j in MODELS["joints"]:
        slug = j["slug"]
        if only and slug != only:
            continue
        for view in JOINT_VIEWS[slug]:
            sc = reset_scene()
            meshes = import_model(j["file"], False)
            style(meshes)
            d = DIRS[resolve_view(view, "right")]
            setup_camera_and_lights(meshes, d)
            iid = f"joint-{slug}-{view}"
            size = render(iid)
            images.append({"id": iid, "kind": "joint", "model": slug, "side": "right", "view": view,
                           "highlight": None, "bytes": size, "markers": []})
            print("render", iid, size)
        # One image per ligament / membrane / disc, highlighted in brand blue, in whichever
        # of the six views shows most of it. The capsule is hidden in these: it wraps the
        # capsular ligaments and would otherwise hide the structure being asked about.
        soft = [p["name"] for p in j["parts"] if p["kind"] in ("Ligament", "Membrane", "Fibrocartilage")]
        for hl in soft:
            sc = reset_scene()
            meshes = import_model(j["file"], False)
            for o in meshes:
                if o.name.split(".")[0].startswith("Articular capsule") or o.name.split(".")[0] == "Zona orbicularis":
                    o.hide_render = True
                    o.hide_viewport = True
            target = next((o for o in meshes if o.name.split(".")[0] == hl), None)
            if target is None:
                continue
            view, frac = best_view(target)
            if frac < 0.3:
                print("skip (hidden in every view)", slug, hl, round(frac, 2))
                continue
            style(meshes, hl)
            setup_camera_and_lights([o for o in meshes if not o.hide_render], DIRS[view])
            iid = f"joint-{slug}-hl-{hl.lower().replace(' ', '-').replace('(', '').replace(')', '')}"
            size = render(iid)
            images.append({"id": iid, "kind": "joint", "model": slug, "side": "right", "view": view,
                           "highlight": hl, "visibleFraction": round(frac, 2), "bytes": size, "markers": []})
            print("render", iid, size, view, round(frac, 2))
    if only and os.path.exists(OUT_JSON):
        prev = [i for i in json.load(open(OUT_JSON))["images"] if i["model"] != only]
        images = prev + images
    with open(OUT_JSON, "w") as f:
        json.dump({"note": "Renders of the Z-Anatomy/BodyParts3D models (CC BY-SA 4.0). Not photographs, not X-rays.",
                   "size": SIZE, "images": images}, f, indent=1)


main()
