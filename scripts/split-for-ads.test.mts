import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { splitForAds } from "../src/lib/ads/split-for-ads.ts";

const para = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

test("short lesson gets no in-content ad", () => {
  assert.deepEqual(splitForAds(`## A\n${para(200)}\n## B\n${para(100)}`).length, 1);
});

test("chunks rejoin to the original markdown", () => {
  const md = `intro\n## A\n${para(400)}\n## B\n${para(400)}\n### C\n${para(400)}`;
  assert.equal(splitForAds(md).join("\n"), md);
});

test("breaks only at headings, and at most maxAds", () => {
  const md = Array.from({ length: 12 }, (_, i) => `## S${i}\n${para(400)}`).join("\n");
  const chunks = splitForAds(md);
  assert.equal(chunks.length, 5); // 4 ads
  for (const c of chunks.slice(1)) assert.match(c, /^## /);
});

test("never splits inside a fenced code block", () => {
  const md = `## A\n${para(400)}\n\`\`\`\n## not a heading\n\`\`\`\n${para(10)}\n## B\n${para(400)}`;
  const chunks = splitForAds(md);
  for (const c of chunks) assert.equal((c.match(/```/g) ?? []).length % 2, 0);
});

test("no ad in the last minWordsAfter words", () => {
  const md = `## A\n${para(400)}\n## B\n${para(50)}`;
  assert.equal(splitForAds(md).length, 1);
});

test("every real lesson: lossless, ≤5 chunks, ≥350 words before each break", () => {
  const root = "content";
  for (const dir of readdirSync(root)) {
    for (const f of readdirSync(join(root, dir))) {
      if (!f.endsWith(".md")) continue;
      const md = readFileSync(join(root, dir, f), "utf-8");
      const chunks = splitForAds(md);
      assert.equal(chunks.join("\n"), md, f);
      assert.ok(chunks.length <= 5, f);
      for (const c of chunks.slice(0, -1)) {
        assert.ok((c.match(/[A-Za-z0-9À-ɏ]+/g) ?? []).length >= 350, f);
      }
    }
  }
});
