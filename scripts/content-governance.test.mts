/**
 * Educational content integrity (added 2026-10-12, AdSense remediation).
 *
 *   node --test scripts/content-governance.test.mts
 *
 * Checks the *structure* the content review policy promises
 * (docs/content-review-policy.md): every guide and every calculator teaching
 * section is complete, cites only registered references, links only to
 * calculators and guides that exist, and claims no review that has not
 * happened. The arithmetic inside examples was verified by hand/Python when
 * written; this suite stops the structure rotting afterwards.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

register("./lib/ts-resolve.mjs", import.meta.url);

const ROOT = path.resolve(import.meta.dirname, "..");
const TOOLS = path.join(ROOT, "src/app/(site)/calculation-tools/(tools)");
const { REFERENCES } = await import("../src/lib/content/references.ts");

const guideFiles = readdirSync(path.join(ROOT, "src/lib/guides/content"));
const guides = await Promise.all(guideFiles.map(async (f) => (await import(`../src/lib/guides/content/${f}`)).guide));
const guideSlugs = new Set(guides.map((g) => g.slug));

const learnDirs = readdirSync(TOOLS).filter((d) => existsSync(path.join(TOOLS, d, "_learn.ts")));
const learns = await Promise.all(
  learnDirs.map(async (d) => ({ slug: d, learn: (await import(path.join(TOOLS, d, "_learn.ts"))).LEARN })),
);

const toolExists = (slug: string) => existsSync(path.join(TOOLS, slug, "page.tsx"));

test("the content actually loaded (guards against a vacuous pass)", () => {
  assert.ok(guides.length >= 5, `guides: ${guides.length}`);
  assert.ok(learns.length >= 15, `calculator teaching sections: ${learns.length}`);
});

test("every reference has a citation and a record of how it was checked", () => {
  for (const [id, r] of Object.entries(REFERENCES) as [string, { citation: string; checked: string; url?: string }][]) {
    assert.ok(r.citation.length > 20, `${id}: citation`);
    assert.ok(r.checked.length > 10, `${id}: checked`);
    if (r.url) assert.match(r.url, /^https:\/\//, `${id}: url`);
  }
});

test("guides: file name matches slug, and every required part is present", () => {
  for (const [i, g] of guides.entries()) {
    assert.equal(`${g.slug}.ts`, guideFiles[i]);
    assert.ok(g.description.length <= 200, `${g.slug}: description length ${g.description.length}`);
    assert.ok(g.objectives.length >= 3, `${g.slug}: objectives`);
    assert.ok(g.terms.length >= 5, `${g.slug}: terms`);
    assert.ok(g.sections.length >= 4, `${g.slug}: sections`);
    const examples = g.sections.flatMap((s: { blocks: { kind: string }[] }) => s.blocks).filter((b: { kind: string }) => b.kind === "example");
    assert.ok(examples.length >= 3, `${g.slug}: worked examples`);
    assert.ok(g.mistakes.length >= 4, `${g.slug}: mistakes`);
    assert.ok(g.practice.length >= 4, `${g.slug}: practice`);
    for (const p of g.practice) assert.ok(p.working.length > 0 && p.answer.trim(), `${g.slug}: practice working/answer`);
    assert.ok(g.limitations.length >= 2, `${g.slug}: limitations`);
    assert.ok(g.refs.length >= 1, `${g.slug}: references`);
  }
});

test("guides: section anchors are unique and do not collide with the fixed ones", () => {
  const fixed = new Set(["objectives", "key-terms", "common-mistakes", "practice", "limitations", "references", "practise-with", "more-guides"]);
  for (const g of guides) {
    const ids = g.sections.map((s: { id: string }) => s.id);
    assert.equal(new Set(ids).size, ids.length, `${g.slug}: duplicate section id`);
    for (const id of ids) assert.ok(!fixed.has(id), `${g.slug}: section id ${id} collides`);
  }
});

test("guides and calculators link only to calculators and guides that exist", () => {
  for (const g of guides) {
    for (const t of g.relatedTools) assert.ok(toolExists(t.slug), `${g.slug} → ${t.slug}`);
    for (const s of g.relatedGuides ?? []) assert.ok(guideSlugs.has(s), `${g.slug} → guide ${s}`);
  }
  for (const { slug, learn } of learns) {
    for (const r of learn.related ?? []) assert.ok(toolExists(r.slug), `${slug} → ${r.slug}`);
    if (learn.guide) assert.ok(guideSlugs.has(learn.guide.slug), `${slug} → guide ${learn.guide.slug}`);
  }
});

test("calculator teaching sections are wired into their page and cite something", () => {
  for (const { slug, learn } of learns) {
    const page = readdirSync(path.join(TOOLS, slug)).includes("page.tsx");
    assert.ok(page, slug);
    assert.ok(learn.refs.length >= 1, `${slug}: references`);
    if (learn.workedExample) {
      assert.ok(learn.workedExample.steps.length >= 2, `${slug}: steps`);
      assert.ok(learn.workedExample.answer.trim(), `${slug}: answer`);
    }
  }
});

test("no content claims an expert review (none has happened yet)", () => {
  // When a real review happens, record it as `expert-reviewed` with the
  // reviewer's name, qualification and date, and update this test.
  for (const g of guides) assert.notEqual(g.meta.review.status, "expert-reviewed", g.slug);
});

test("a guide added after the first five is published only with a recorded reviewer (2026-10-13 rule)", async () => {
  const { GUIDES } = await import("../src/lib/guides/index.ts");
  const { creditsFor, isReviewed } = await import("../src/lib/content/bylines.ts");
  const grandfathered = new Set([
    "dilution-and-concentration", "dose-calculations", "reaction-kinetics-drug-stability",
    "accuracy-precision-recovery", "pharmacokinetic-parameters",
  ]);
  for (const g of GUIDES as { slug: string }[]) {
    if (grandfathered.has(g.slug)) continue;
    assert.ok(isReviewed(creditsFor(`/guides/${g.slug}`)), `${g.slug} is published without a reviewer in src/lib/content/bylines.ts`);
  }
});
