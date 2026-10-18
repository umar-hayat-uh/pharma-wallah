/**
 * Osteology & Arthrology Lab — the pure layer (added 2026-10-18).
 *
 *   node --test scripts/osteology.test.mts
 *
 * Content integrity (every bone/joint complete, every Z-Anatomy name real, every asset
 * on disk), the question engine (deterministic, keys stripped, answers correct), grading,
 * and the signed session token. Rendering and the 3D viewer are not covered here.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

register("./lib/ts-resolve.mjs", import.meta.url);
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-only-key-not-a-secret";

const ROOT = path.resolve(import.meta.dirname, "..");
const { BONES, JOINTS, getBone, jointsOfBone } = await import("../src/lib/osteology/registry.ts");
const { BONE_MODELS, JOINT_MODELS, SKELETON } = await import("../src/lib/osteology/models.ts");
const { SPOTTING_IMAGES } = await import("../src/lib/osteology/spotting-images.ts");
const { REFERENCES } = await import("../src/lib/content/references.ts");
const Q = await import("../src/lib/osteology/questions.ts");
const { EXAM_PRESETS } = await import("../src/lib/osteology/exam-config.ts");
const { signSession, verifySession } = await import("../src/lib/osteology/token.ts");

const ALL_TYPES = ["identify-bone", "bone-side", "landmark", "articulating-bone", "identify-joint", "classify-joint", "joint-bones", "ligament", "written"];
const ALL_REGIONS = ["upper-limb", "lower-limb", "axial"];

// ── Content ────────────────────────────────────────────────────────────────

test("the brief's bones and joints are all present (guards against a vacuous pass)", () => {
  assert.equal(BONES.length, 22);
  assert.equal(JOINTS.length, 17);
  for (const s of ["sternoclavicular", "acromioclavicular", "glenohumeral", "elbow", "wrist", "radioulnar", "carpometacarpal", "metacarpophalangeal", "hand-interphalangeal"]) {
    assert.ok(JOINTS.some((j) => j.slug === s && j.region === "upper-limb"), s);
  }
  for (const s of ["sacroiliac", "pubic-symphysis", "hip", "knee", "ankle", "tarsometatarsal", "metatarsophalangeal", "foot-interphalangeal"]) {
    assert.ok(JOINTS.some((j) => j.slug === s), s);
  }
});

test("every bone is complete", () => {
  for (const b of BONES) {
    assert.ok(b.landmarks.length >= 6, `${b.slug} landmarks`);
    assert.equal(new Set(b.landmarks.map((l) => l.id)).size, b.landmarks.length, `${b.slug} landmark ids unique`);
    for (const k of ["orientation", "functions", "clinical", "examQuestions", "tips", "mistakes", "revision", "articulations"] as const) {
      assert.ok((b[k] as unknown[]).length > 0, `${b.slug}.${k}`);
    }
    assert.ok(b.sideDetermination.steps.length > 0, `${b.slug} side steps`);
    assert.ok(b.mcqs.length >= 4, `${b.slug} mcqs`);
    for (const r of b.refs) assert.ok(r in REFERENCES, `${b.slug} ref ${r}`);
  }
});

test("every joint is complete, and only synovial joints have a synovial subtype", () => {
  for (const j of JOINTS) {
    assert.ok(j.bones.length >= 2, `${j.slug} bones`);
    for (const k of ["surfaces", "movements", "functions", "clinical", "examPoints", "viva", "mistakes", "revision"] as const) {
      assert.ok((j[k] as unknown[]).length > 0, `${j.slug}.${k}`);
    }
    if (j.synovialSubtype) assert.match(j.structural.toLowerCase(), /synovial/, `${j.slug} subtype but not synovial`);
    for (const r of j.refs) assert.ok(r in REFERENCES, `${j.slug} ref ${r}`);
    for (const rel of j.related) assert.ok(JOINTS.some((x) => x.slug === rel), `${j.slug} related ${rel}`);
  }
  // The two the brief singled out.
  const ps = JOINTS.find((j) => j.slug === "pubic-symphysis")!;
  assert.equal(ps.synovialSubtype, null);
  assert.match(ps.structural.toLowerCase(), /cartilaginous/);
  const ru = JOINTS.find((j) => j.slug === "radioulnar")!;
  assert.ok(ru.components.some((c) => /proximal/i.test(c.name)) && ru.components.some((c) => /distal/i.test(c.name)));
});

test("every written MCQ has four distinct options and an answer in range", () => {
  const all = [...BONES.flatMap((b) => b.mcqs.map((m) => [b.slug, m] as const)), ...JOINTS.flatMap((j) => j.mcqs.map((m) => [j.slug, m] as const))];
  assert.ok(all.length > 150, `mcqs: ${all.length}`);
  for (const [slug, m] of all) {
    assert.equal(m.options.length, 4, slug);
    assert.equal(new Set(m.options.map((o) => o.trim().toLowerCase())).size, 4, `${slug}: ${m.q}`);
    assert.ok(m.answer >= 0 && m.answer < 4, slug);
    assert.ok(m.explanation.length > 10, slug);
  }
});

test("cross-links point at real lessons", () => {
  for (const b of BONES) {
    for (const a of b.articulations) {
      if (a.withSlug) assert.ok(getBone(a.withSlug), `${b.slug} → bone ${a.withSlug}`);
      if (a.jointSlug) assert.ok(JOINTS.some((j) => j.slug === a.jointSlug), `${b.slug} → joint ${a.jointSlug}`);
    }
  }
  for (const j of JOINTS) for (const x of j.bones) if (x.slug) assert.ok(getBone(x.slug), `${j.slug} → ${x.slug}`);
  assert.ok(jointsOfBone("humerus").some((j) => j.slug === "glenohumeral"));
});

// ── Content ↔ 3D models ────────────────────────────────────────────────────

test("every landmark zName is a real Z-Anatomy anchor on that bone's model (and mesh)", () => {
  let n = 0;
  for (const b of BONES) {
    const m = BONE_MODELS.get(b.slug);
    assert.ok(m, `${b.slug} has a model`);
    for (const l of b.landmarks) {
      if (!l.zName) continue;
      n++;
      assert.ok(
        m!.landmarks.some((a) => a.name === l.zName && (!l.mesh || a.mesh === l.mesh)),
        `${b.slug}: ${l.zName}${l.mesh ? ` on ${l.mesh}` : ""}`,
      );
    }
  }
  assert.ok(n > 250, `landmarks with markers: ${n}`);
});

test("every joint zName is a mesh in that joint's model", () => {
  for (const j of JOINTS) {
    const m = JOINT_MODELS.get(j.slug);
    assert.ok(m, `${j.slug} has a model`);
    const names = new Set(m!.parts.map((p) => p.name));
    for (const s of [...j.bones, ...j.special, ...j.ligaments]) {
      if (s.zName) assert.ok(names.has(s.zName), `${j.slug}: ${s.zName}`);
    }
    assert.deepEqual(m!.missing, [], `${j.slug} export missing meshes`);
  }
});

test("GLB node names equal the manifest's part names (no Blender '.001' suffixes)", () => {
  // The viewer highlights and picks by node name; a clash-suffixed name silently matches nothing.
  const nodeNames = (file: string) => {
    const buf = readFileSync(path.join(ROOT, "public/models/osteology", file));
    const len = buf.readUInt32LE(12);
    const gltf = JSON.parse(buf.subarray(20, 20 + len).toString("utf8")) as { nodes: { name?: string }[] };
    return new Set(gltf.nodes.map((n) => n.name));
  };
  for (const m of [...BONE_MODELS.values(), ...JOINT_MODELS.values()]) {
    const names = nodeNames(m.file);
    for (const p of m.parts) assert.ok(names.has(p.name), `${m.file}: ${p.name}`);
  }
  const sk = nodeNames(SKELETON.file);
  for (const p of SKELETON.parts) assert.ok(sk.has(p.name), `skeleton: ${p.name}`);
});

test("every model and spotting image is on disk; image names do not reveal answers", () => {
  for (const m of [...BONE_MODELS.values(), ...JOINT_MODELS.values()]) {
    assert.ok(existsSync(path.join(ROOT, "public/models/osteology", m.file)), m.file);
  }
  assert.ok(existsSync(path.join(ROOT, "public/models/osteology", SKELETON.file)));
  assert.ok(SPOTTING_IMAGES.length > 80, `images: ${SPOTTING_IMAGES.length}`);
  for (const img of SPOTTING_IMAGES) {
    assert.match(img.file, /^[0-9a-f]{16}\.webp$/, `${img.id} published under a hash`);
    assert.ok(existsSync(path.join(ROOT, "public/images/osteology/spotting", img.file)), img.id);
    for (const mk of img.markers) assert.ok(mk.x > 0 && mk.x < 1 && mk.y > 0 && mk.y < 1, `${img.id} marker`);
  }
});

// ── Question engine ────────────────────────────────────────────────────────

const everything = { regions: ALL_REGIONS, types: ALL_TYPES, scope: "both" as const };

test("a paper is deterministic for a seed and different for another", () => {
  const a = Q.buildPaper(everything, 30, 12345);
  const b = Q.buildPaper(everything, 30, 12345);
  const c = Q.buildPaper(everything, 30, 999);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.map((q) => q.prompt), c.map((q) => q.prompt));
});

test("every question type is generated, with a correct key and distinct options", () => {
  const pool = Q.poolFor(everything);
  for (const t of ALL_TYPES) assert.ok(pool.some((x) => x.type === t), `type ${t} generated`);
  for (let seed = 1; seed <= 40; seed++) {
    for (const q of Q.buildPaper(everything, 25, seed)) {
      assert.ok(q.answer >= 0 && q.answer < q.options.length, `${q.type} answer in range`);
      assert.equal(new Set(q.options).size, q.options.length, `${q.type} options distinct: ${q.options.join(" | ")}`);
      if (q.type === "bone-side") assert.deepEqual(q.options, ["Right", "Left"]);
      else assert.equal(q.options.length, 4, q.type);
    }
  }
});

test("generated answers are the right ones", () => {
  for (let seed = 1; seed <= 30; seed++) {
    for (const q of Q.buildPaper(everything, 25, seed)) {
      const correct = q.options[q.answer];
      if (q.type === "identify-bone") assert.equal(correct, getBone(q.topic.slug)!.name);
      if (q.type === "identify-joint") assert.equal(correct, JOINTS.find((j) => j.slug === q.topic.slug)!.name);
      if (q.type === "landmark") assert.equal(correct, q.topic.landmark);
      if (q.type === "bone-side") {
        const img = SPOTTING_IMAGES.find((i) => q.image && q.image.src.endsWith(i.file))!;
        assert.equal(correct, img.side === "left" ? "Left" : "Right");
      }
    }
  }
});

test("the public question carries no answer, explanation or image id", () => {
  for (const q of Q.buildPaper(everything, 30, 7)) {
    const pub = Q.toPublic(q) as Record<string, unknown>;
    assert.equal(pub.answer, undefined);
    assert.equal(pub.explanation, undefined);
    assert.equal(pub.topic, undefined);
    assert.equal(pub.learnHref, undefined);
    assert.ok(!/bone-|joint-/.test(q.image?.src ?? ""), `image src hides the id: ${q.image?.src}`);
    // The options name the answer by design; the image's URL and alt text must not.
    if (q.image && (q.type === "identify-bone" || q.type === "identify-joint" || q.type === "ligament" || q.type === "landmark")) {
      const name = q.options[q.answer].toLowerCase();
      assert.ok(!q.image.src.toLowerCase().includes(q.topic.slug), `src names ${q.topic.slug}`);
      assert.ok(!q.image.alt.toLowerCase().includes(name), `alt names the answer: ${q.image.alt}`);
    }
  }
});

test("every exam preset can fill its stations", () => {
  for (const p of EXAM_PRESETS) {
    const paper = Q.buildPaper({ regions: p.regions, types: p.types, scope: p.scope }, p.stations, 42);
    assert.equal(paper.length, p.stations, `${p.id}: ${paper.length}/${p.stations}`);
  }
});

test("grading counts correct answers and ignores invalid ones", () => {
  const paper = Q.buildPaper(everything, 10, 5);
  const answers = paper.map((q, i) => (i < 6 ? q.answer : i === 6 ? 99 : i === 7 ? -1 : null));
  const g = Q.grade(paper, answers, 2);
  assert.equal(g.correct, 6);
  assert.equal(g.marks, 12);
  assert.equal(g.maxMarks, 20);
  assert.equal(g.attempted, 6); // 99 and -1 are not valid choices
  assert.equal(g.items[6].chosen, null);
  assert.ok(g.weak.topics.length > 0);
});

test("classification labels are unambiguous or absent", () => {
  const knee = JOINTS.find((j) => j.slug === "knee")!;
  const hip = Q.classLabel(JOINTS.find((j) => j.slug === "hip")!);
  assert.equal(hip, "Synovial — ball-and-socket");
  assert.equal(Q.classLabel(JOINTS.find((j) => j.slug === "pubic-symphysis")!), "Secondary cartilaginous joint (symphysis)");
  const label = Q.classLabel(knee);
  assert.ok(label === null || label.startsWith("Synovial"));
});

// ── Token ──────────────────────────────────────────────────────────────────

test("a session token verifies, and any edit to it fails", () => {
  const { token, claims } = signSession({ mode: "exam", preset: "full", regions: ["axial"], types: ["written"], scope: "both", count: 5, pool: "x", limit: 600, marks: 1 });
  assert.deepEqual(verifySession(token), claims);
  const [body, sig] = token.split(".");
  const forged = Buffer.from(JSON.stringify({ ...claims, limit: 99999 })).toString("base64url");
  assert.equal(verifySession(`${forged}.${sig}`), null);
  assert.equal(verifySession(`${body}.${sig.slice(0, -2)}AA`), null);
  assert.equal(verifySession("nonsense"), null);
  assert.equal(verifySession(42), null);
});
