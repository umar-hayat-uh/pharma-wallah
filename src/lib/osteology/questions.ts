/**
 * The Osteology Lab question engine — SERVER-SIDE (it reads the spotting-image map,
 * whose ids name their answers; see spotting-images.ts).
 *
 * Every question is derived from content we can trace, never written free-hand here:
 *  - identify-bone / bone-side / identify-joint   ← which model a render is of;
 *  - landmark   ← a render whose marker sits on a Z-Anatomy label anchor, matched to the
 *                 content landmark carrying that `zName`;
 *  - ligament   ← a render with one modelled ligament highlighted, matched by `zName`;
 *  - articulating-bone, classify-joint, joint-bones, written ← the content fields.
 *
 * Deterministic: the same (filter, seed) always yields the same questions and option
 * order, so an exam token only has to carry the seed — the server re-creates the paper
 * to grade it, and the answer key never travels to the browser.
 */
import { BONES, JOINTS, boneHref, jointHref } from "./registry";
import { SPOTTING_IMAGES, spottingSrc, viewWords, type SpottingImage } from "./spotting-images";
import type { QType } from "./exam-config";
import type { BoneContent, JointContent, Landmark, Region } from "./types";

// ─── Types ──────────────────────────────────────────────────────────────────

export type Topic = {
  kind: "bone" | "joint";
  slug: string;
  name: string;
  region: Region;
  /** Set for landmark questions. */
  landmark?: string;
};

type Template = {
  key: string;
  type: QType;
  topic: Topic;
  prompt: string;
  image?: { src: string; alt: string; marker?: { x: number; y: number } };
  correct: string;
  /** Distractor pool (never contains `correct`); three are drawn per question. */
  pool: string[];
  /** When set, these are the options (in this order before shuffling), e.g. Right / Left. */
  fixed?: string[];
  /** Keep `fixed` in its given order (Right/Left reads oddly shuffled). */
  keepOrder?: boolean;
  explanation: string;
  learnHref: string;
};

export type PublicQuestion = {
  index: number;
  type: QType;
  prompt: string;
  image?: { src: string; alt: string; marker?: { x: number; y: number } };
  options: string[];
};

export type FullQuestion = PublicQuestion & {
  answer: number;
  explanation: string;
  topic: Topic;
  learnHref: string;
};

export type Filter = {
  regions: Region[];
  types: QType[];
  scope: "bones" | "joints" | "both";
};

// ─── Seeded randomness ──────────────────────────────────────────────────────

/** mulberry32: small, fast, good enough to shuffle a question paper. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: readonly T[], rand: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Distinct by meaning-ish: drop candidates equal to, or contained in, the answer and each other. */
function distinctFrom(correct: string, pool: string[]): string[] {
  const seen = new Set([norm(correct)]);
  const out: string[] = [];
  for (const p of pool) {
    const n = norm(p);
    if (!n || seen.has(n)) continue;
    if (n.includes(norm(correct)) || norm(correct).includes(n)) continue;
    seen.add(n);
    out.push(p);
  }
  return out;
}

// ─── Template builders ──────────────────────────────────────────────────────

const RENDER_NOTE = "3D-model render (not a photograph or X-ray)";

const boneTopic = (b: BoneContent, landmark?: string): Topic => ({
  kind: "bone", slug: b.slug, name: b.name, region: b.region, ...(landmark ? { landmark } : {}),
});
const jointTopic = (j: JointContent): Topic => ({ kind: "joint", slug: j.slug, name: j.name, region: j.region });

/** Landmarks that make a clean "name the marked structure" target: a point, not a whole surface. */
const POINTED = new Set<Landmark["kind"]>([
  "head", "neck", "process", "spine", "tubercle", "tuberosity", "trochanter", "condyle", "epicondyle",
  "facet", "fossa", "notch", "groove", "foramen", "line", "crest", "angle", "other",
]);

function sideSentence(b: BoneContent) {
  return b.sideDetermination.steps.slice(0, 3).join(" ");
}

function boneTemplates(images: SpottingImage[]): Template[] {
  const out: Template[] = [];
  for (const b of BONES) {
    const others = BONES.filter((o) => o.slug !== b.slug);
    const sameRegion = others.filter((o) => o.region === b.region).map((o) => o.name);
    const restNames = others.filter((o) => o.region !== b.region).map((o) => o.name);
    const imgs = images.filter((i) => i.kind === "bone" && i.model === b.slug);

    for (const img of imgs) {
      const alt = `Bone specimen, ${viewWords(img)} — ${RENDER_NOTE}`;
      out.push({
        key: `identify-bone:${img.id}`,
        type: "identify-bone",
        topic: boneTopic(b),
        prompt: b.isGroup ? "Identify this group of bones." : "Identify this bone.",
        image: { src: spottingSrc(img), alt },
        correct: b.name,
        pool: [...sameRegion, ...restNames],
        explanation: `${b.name} (${b.latin}). ${b.summary}`,
        learnHref: boneHref(b.slug),
      });
      if (b.sideType === "paired" && (img.side === "right" || img.side === "left")) {
        const side = img.side === "right" ? "Right" : "Left";
        out.push({
          key: `bone-side:${img.id}`,
          type: "bone-side",
          topic: boneTopic(b),
          prompt: `This is a ${b.name.toLowerCase()}${b.isGroup ? " set" : ""} (${viewWords(img)}). Which side is it from?`,
          image: { src: spottingSrc(img), alt },
          correct: side,
          pool: [],
          fixed: ["Right", "Left"],
          keepOrder: true,
          explanation: `${side}. ${sideSentence(b)}`,
          learnHref: `${boneHref(b.slug)}#side`,
        });
      }
    }

    // Landmarks: one question per landmark, on the first image that shows its marker.
    const done = new Set<string>();
    for (const img of imgs) {
      for (const m of img.markers) {
        const lm = b.landmarks.find(
          (l) => l.zName === m.name && (!l.mesh || l.mesh === m.mesh) && POINTED.has(l.kind),
        );
        if (!lm || done.has(lm.id)) continue;
        const pool = b.landmarks
          .filter((l) => l.id !== lm.id && POINTED.has(l.kind) && (!b.isGroup || !lm.mesh || l.mesh === lm.mesh || !l.mesh))
          .map((l) => l.name);
        if (distinctFrom(lm.name, pool).length < 3) continue;
        done.add(lm.id);
        out.push({
          key: `landmark:${b.slug}:${lm.id}`,
          type: "landmark",
          topic: boneTopic(b, lm.name),
          prompt: `Name the structure marked on this ${b.isGroup ? (lm.mesh ?? b.name).toLowerCase() : b.name.toLowerCase()}.`,
          image: { src: spottingSrc(img), alt: `Bone specimen with one structure marked, ${viewWords(img)} — ${RENDER_NOTE}`, marker: { x: m.x, y: m.y } },
          correct: lm.name,
          pool,
          explanation: `${lm.name}: ${lm.definition} ${lm.significance}`,
          learnHref: `${boneHref(b.slug)}#lm-${lm.id}`,
        });
      }
    }

    // Articulating bone, from the content's articulation list.
    const partners = new Set(b.articulations.map((a) => norm(a.with)));
    const allNames = BONES.map((o) => o.name);
    b.articulations.forEach((a, i) => {
      const pool = allNames.filter((n) => !partners.has(norm(n)) && n !== b.name);
      out.push({
        key: `articulating-bone:${b.slug}:${i}`,
        type: "articulating-bone",
        topic: boneTopic(b),
        prompt: `Which bone articulates with the ${a.surface.replace(/^the /i, "")} of the ${b.name.toLowerCase()}?`,
        correct: a.with,
        pool,
        explanation: `The ${a.surface} of the ${b.name.toLowerCase()} articulates with the ${a.with.toLowerCase()} at the ${a.joint}.`,
        learnHref: a.jointSlug ? jointHref(a.jointSlug) : boneHref(b.slug),
      });
    });
  }
  return out;
}

/** One canonical label per classification, or null when the content describes a mix. */
export function classLabel(j: JointContent): string | null {
  const text = `${j.synovialSubtype ?? ""}`.toLowerCase();
  if (!j.synovialSubtype) {
    const s = j.structural.toLowerCase();
    if (s.includes("symphysis")) return "Secondary cartilaginous joint (symphysis)";
    if (s.includes("syndesmosis") && !s.includes("synovial")) return "Fibrous joint (syndesmosis)";
    return null;
  }
  const kinds: [RegExp, string][] = [
    [/ball/, "Synovial — ball-and-socket"],
    [/saddle|sellar/, "Synovial — saddle"],
    [/hinge|ginglym/, "Synovial — hinge"],
    [/pivot|trochoid/, "Synovial — pivot"],
    [/plane|gliding/, "Synovial — plane"],
    // Texts disagree on calling the wrist and MCP joints "ellipsoid" or "condylar", so
    // the two are one option: a student who learned either is right.
    [/condyl|ellipso/, "Synovial — condylar (ellipsoid)"],
  ];
  const hits = kinds.filter(([re]) => re.test(text));
  return hits.length === 1 ? hits[0][1] : null;
}

const ALL_CLASSES = [
  "Fibrous joint (suture)", "Fibrous joint (syndesmosis)", "Primary cartilaginous joint (synchondrosis)",
  "Secondary cartilaginous joint (symphysis)", "Synovial — plane", "Synovial — hinge", "Synovial — pivot",
  "Synovial — condylar (ellipsoid)", "Synovial — saddle", "Synovial — ball-and-socket",
];

function jointTemplates(images: SpottingImage[]): Template[] {
  const out: Template[] = [];
  for (const j of JOINTS) {
    const others = JOINTS.filter((o) => o.slug !== j.slug);
    const sameRegion = others.filter((o) => o.region === j.region).map((o) => o.name);
    const rest = others.filter((o) => o.region !== j.region).map((o) => o.name);
    const imgs = images.filter((i) => i.kind === "joint" && i.model === j.slug);

    for (const img of imgs.filter((i) => !i.highlight)) {
      out.push({
        key: `identify-joint:${img.id}`,
        type: "identify-joint",
        topic: jointTopic(j),
        prompt: "Identify this joint.",
        image: { src: spottingSrc(img), alt: `Joint specimen with ligaments, ${viewWords(img)} — ${RENDER_NOTE}` },
        correct: j.name,
        pool: [...sameRegion, ...rest],
        explanation: `${j.name}: ${j.location}`,
        learnHref: jointHref(j.slug),
      });
    }

    const structures = [...j.ligaments, ...j.special];
    for (const img of imgs.filter((i) => i.highlight)) {
      const s = structures.find((x) => x.zName === img.highlight);
      if (!s) continue; // modelled but not taught on this joint's page: no question
      const pool = [
        ...structures.filter((x) => x !== s).map((x) => x.name),
        ...others.flatMap((o) => o.ligaments.map((x) => x.name)),
      ];
      out.push({
        key: `ligament:${img.id}`,
        type: "ligament",
        topic: jointTopic(j),
        prompt: `Name the structure highlighted in blue at the ${j.name.toLowerCase()}.`,
        image: { src: spottingSrc(img), alt: `Joint specimen with one structure highlighted in blue, ${viewWords(img)} — ${RENDER_NOTE}` },
        correct: s.name,
        pool,
        explanation: `${s.name}: ${s.attachments} ${s.role}`,
        learnHref: `${jointHref(j.slug)}#structures`,
      });
    }

    const label = classLabel(j);
    if (label) {
      out.push({
        key: `classify-joint:${j.slug}`,
        type: "classify-joint",
        topic: jointTopic(j),
        prompt: `Classify the ${j.name.toLowerCase()}.`,
        correct: label,
        pool: ALL_CLASSES,
        explanation: `${j.structural}${j.synovialSubtype ? ` — ${j.synovialSubtype}` : ""}. ${j.functional}.`,
        learnHref: `${jointHref(j.slug)}#classification`,
      });
    }

    if (j.bones.length >= 2 && j.bones.length <= 3) {
      const answer = j.bones.map((b) => b.name).join(", ");
      const pool = others
        .filter((o) => o.bones.length >= 2 && o.bones.length <= 3)
        .map((o) => o.bones.map((b) => b.name).join(", "));
      out.push({
        key: `joint-bones:${j.slug}`,
        type: "joint-bones",
        topic: jointTopic(j),
        prompt: `Which bones form the ${j.name.toLowerCase()}?`,
        correct: answer,
        pool,
        explanation: `${j.surfaces.join("; ")}.`,
        learnHref: jointHref(j.slug),
      });
    }
  }
  return out;
}

function writtenTemplates(scope: Filter["scope"]): Template[] {
  const out: Template[] = [];
  const add = (topic: Topic, href: string, mcqs: BoneContent["mcqs"], prefix: string) =>
    mcqs.forEach((m, i) =>
      out.push({
        key: `written:${prefix}:${i}`,
        type: "written",
        topic,
        prompt: m.q,
        correct: m.options[m.answer],
        pool: [],
        fixed: [...m.options],
        explanation: m.explanation,
        learnHref: href,
      }),
    );
  if (scope !== "joints") BONES.forEach((b) => add(boneTopic(b), boneHref(b.slug), b.mcqs, `bone:${b.slug}`));
  if (scope !== "bones") JOINTS.forEach((j) => add(jointTopic(j), jointHref(j.slug), j.mcqs, `joint:${j.slug}`));
  return out;
}

let cached: { bones: Template[]; joints: Template[]; written: Record<Filter["scope"], Template[]> } | null = null;

function templates() {
  if (!cached) {
    cached = {
      bones: boneTemplates(SPOTTING_IMAGES),
      joints: jointTemplates(SPOTTING_IMAGES),
      written: { bones: writtenTemplates("bones"), joints: writtenTemplates("joints"), both: writtenTemplates("both") },
    };
  }
  return cached;
}

/** Every template the filter allows, in a stable order. */
export function poolFor(filter: Filter): Template[] {
  const t = templates();
  const all = [
    ...(filter.scope !== "joints" ? t.bones : []),
    ...(filter.scope !== "bones" ? t.joints : []),
    ...t.written[filter.scope],
  ];
  return all.filter((x) => filter.types.includes(x.type) && filter.regions.includes(x.topic.region));
}

/** A short fingerprint of a pool, so a paper made before a content change is not graded after it. */
export function poolHash(pool: Template[]): string {
  let h = 2166136261;
  for (const t of pool) {
    for (let i = 0; i < t.key.length; i++) h = Math.imul(h ^ t.key.charCodeAt(i), 16777619);
    for (let i = 0; i < t.correct.length; i++) h = Math.imul(h ^ t.correct.charCodeAt(i), 16777619);
  }
  return (h >>> 0).toString(36);
}

/**
 * Build a paper: up to `count` questions, spread across the allowed types round-robin so
 * a 20-station exam is not 15 landmark questions, then shuffled.
 */
export function buildPaper(filter: Filter, count: number, seed: number): FullQuestion[] {
  const rand = rng(seed);
  const pool = poolFor(filter);
  const byType = new Map<QType, Template[]>();
  for (const t of pool) byType.set(t.type, [...(byType.get(t.type) ?? []), t]);
  const queues = Array.from(byType.entries()).map(([type, list]) => ({ type, list: shuffle(list, rand) }));
  const chosen: Template[] = [];
  const usedTopicType = new Set<string>();
  // Pass 1 avoids asking the same type about the same bone twice; pass 2 fills up.
  for (const strict of [true, false]) {
    let progressed = true;
    while (chosen.length < count && progressed) {
      progressed = false;
      for (const q of shuffle(queues, rand)) {
        if (chosen.length >= count) break;
        const idx = q.list.findIndex((t) => !strict || !usedTopicType.has(`${t.type}:${t.topic.slug}`));
        if (idx === -1) continue;
        const [t] = q.list.splice(idx, 1);
        usedTopicType.add(`${t.type}:${t.topic.slug}`);
        chosen.push(t);
        progressed = true;
      }
    }
  }
  const out: FullQuestion[] = [];
  for (const t of shuffle(chosen, rand)) {
    let options: string[];
    if (t.fixed) {
      options = t.keepOrder ? [...t.fixed] : shuffle(t.fixed, rand);
    } else {
      const distractors = shuffle(distinctFrom(t.correct, t.pool), rand).slice(0, 3);
      if (distractors.length < 3) continue;
      options = shuffle([t.correct, ...distractors], rand);
    }
    out.push({
      index: out.length,
      type: t.type,
      prompt: t.prompt,
      ...(t.image ? { image: t.image } : {}),
      options,
      answer: options.indexOf(t.correct),
      explanation: t.explanation,
      topic: t.topic,
      learnHref: t.learnHref,
    });
  }
  return out;
}

export const toPublic = (q: FullQuestion): PublicQuestion => ({
  index: q.index,
  type: q.type,
  prompt: q.prompt,
  ...(q.image ? { image: q.image } : {}),
  options: q.options,
});

// ─── Grading ────────────────────────────────────────────────────────────────

export type Graded = {
  correct: number;
  attempted: number;
  total: number;
  marks: number;
  maxMarks: number;
  items: (FullQuestion & { chosen: number | null; isCorrect: boolean })[];
  /** Weakest first: share wrong per bone/joint and per question type. */
  weak: { topics: WeakRow[]; types: WeakRow[]; landmarks: string[] };
};
export type WeakRow = { key: string; label: string; href?: string; wrong: number; asked: number };

export function grade(paper: FullQuestion[], answers: (number | null)[], marksPer: number): Graded {
  const items = paper.map((q, i) => {
    const raw = answers[i];
    const chosen = typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw < q.options.length ? raw : null;
    return { ...q, chosen, isCorrect: chosen === q.answer };
  });
  const correct = items.filter((i) => i.isCorrect).length;
  const tally = (keyOf: (q: (typeof items)[number]) => { key: string; label: string; href?: string }) => {
    const m = new Map<string, WeakRow>();
    for (const it of items) {
      const k = keyOf(it);
      const row = m.get(k.key) ?? { ...k, wrong: 0, asked: 0 };
      row.asked += 1;
      if (!it.isCorrect) row.wrong += 1;
      m.set(k.key, row);
    }
    return Array.from(m.values()).filter((r) => r.wrong > 0).sort((a, b) => b.wrong / b.asked - a.wrong / a.asked || b.wrong - a.wrong);
  };
  return {
    correct,
    attempted: items.filter((i) => i.chosen !== null).length,
    total: items.length,
    marks: correct * marksPer,
    maxMarks: items.length * marksPer,
    items,
    weak: {
      topics: tally((q) => ({
        key: `${q.topic.kind}:${q.topic.slug}`,
        label: q.topic.name,
        href: q.topic.kind === "bone" ? boneHref(q.topic.slug) : jointHref(q.topic.slug),
      })),
      types: tally((q) => ({ key: q.type, label: q.type })),
      landmarks: items.filter((i) => !i.isCorrect && i.topic.landmark).map((i) => `${i.topic.landmark} (${i.topic.name})`),
    },
  };
}
