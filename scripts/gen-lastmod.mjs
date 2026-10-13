#!/usr/bin/env node
/**
 * Writes src/generated/lastmod.json: for each sitemap path, the date of the last
 * git commit that touched the files the page is built from.
 *
 *   node scripts/gen-lastmod.mjs        # run after committing content, then commit the JSON
 *
 * Why a committed file: Vercel builds from a shallow clone, so `git log` at build
 * time would give every page the same (wrong) date. `lastmod` is only useful to
 * a crawler if it is true; a build timestamp on every URL is a fabricated date.
 * A path with no resolvable source simply gets no `lastmod`.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const rel = (...p) => path.join(...p);
const lastCommit = (files) => {
  const existing = files.filter((f) => existsSync(path.join(ROOT, f)));
  if (!existing.length) return null;
  const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...existing], { cwd: ROOT, encoding: "utf8" }).trim();
  return out || null;
};

/** Source files a URL path is rendered from. */
function sourcesFor(p) {
  const tools = "src/app/(site)/calculation-tools/(tools)";
  let m;
  if ((m = p.match(/^\/calculation-tools\/([^/]+)$/)) && existsSync(path.join(ROOT, tools, m[1]))) return [rel(tools, m[1])];
  if ((m = p.match(/^\/guides\/([^/]+)$/))) return [`src/lib/guides/content/${m[1]}.ts`];
  if ((m = p.match(/^\/courses\/([^/]+)\/([^/]+)$/))) {
    const subjects = readdirSync(path.join(ROOT, "src/lib/courses/subjects"));
    for (const f of subjects) {
      const src = readFileSync(path.join(ROOT, "src/lib/courses/subjects", f), "utf8");
      if (!src.includes(`slug: "${m[1]}"`)) continue;
      const cf = src.match(new RegExp(`id:\\s*"${m[2]}"[\\s\\S]*?contentFile:\\s*"([^"]+)"`));
      return cf ? [`content/${cf[1]}`, `src/lib/courses/subjects/${f}`] : [`src/lib/courses/subjects/${f}`];
    }
  }
  if ((m = p.match(/^\/courses\/([^/]+)$/))) {
    const f = readdirSync(path.join(ROOT, "src/lib/courses/subjects")).find((x) =>
      readFileSync(path.join(ROOT, "src/lib/courses/subjects", x), "utf8").includes(`slug: "${m[1]}"`),
    );
    return f ? [`src/lib/courses/subjects/${f}`] : [];
  }
  if ((m = p.match(/^\/mcqs-bank\/[^/]+\/([^/]+)$/))) {
    const f = `src/app/api/mcq-data/${m[1]}.ts`;
    return [f, "src/app/(site)/mcqs-bank/[semesterSlug]"];
  }
  if ((m = p.match(/^\/spotting\/histology\/lessons\/([^/]+)$/))) return ["src/app/(site)/spotting/histology/lessons", "src/components/spotting/HistologyLessonTemplate"];
  if (p === "/") return ["src/app/page.tsx", "src/components/Home/landing"];
  for (const base of ["src/app/(site)", "src/app"]) {
    const dir = rel(base, p);
    if (existsSync(path.join(ROOT, dir, "page.tsx"))) return [dir];
  }
  return [];
}

const sitemapSrc = readFileSync(path.join(ROOT, "src/app/sitemap.ts"), "utf8");
// Every path the sitemap can emit: crawl its own static list plus the registries.
const paths = new Set([...sitemapSrc.matchAll(/^\s*"(\/[^"]*)",/gm)].map((m) => m[1]));
for (const d of readdirSync(path.join(ROOT, "src/app/(site)/calculation-tools/(tools)"))) {
  if (existsSync(path.join(ROOT, "src/app/(site)/calculation-tools/(tools)", d, "page.tsx"))) paths.add(`/calculation-tools/${d}`);
}
for (const f of readdirSync(path.join(ROOT, "src/lib/guides/content"))) paths.add(`/guides/${f.replace(/\.ts$/, "")}`);
for (const f of readdirSync(path.join(ROOT, "src/lib/courses/subjects"))) {
  const src = readFileSync(path.join(ROOT, "src/lib/courses/subjects", f), "utf8");
  const slug = src.match(/^\s*slug:\s*"([^"]+)"/m)?.[1];
  if (!slug) continue;
  paths.add(`/courses/${slug}`);
  for (const u of src.matchAll(/id:\s*"([^"]+)",\s*\n\s*title:/g)) paths.add(`/courses/${slug}/${u[1]}`);
}
for (const d of ["histology/lessons", "pathology"]) {
  const dir = path.join(ROOT, "src/app/(site)/spotting", d);
  if (existsSync(dir)) for (const x of readdirSync(dir)) if (existsSync(path.join(dir, x, "page.tsx"))) paths.add(`/spotting/${d}/${x}`);
}

const out = {};
for (const p of [...paths].sort()) {
  const date = lastCommit(sourcesFor(p));
  if (date) out[p] = date;
}
mkdirSync(path.join(ROOT, "src/generated"), { recursive: true });
writeFileSync(path.join(ROOT, "src/generated/lastmod.json"), JSON.stringify(out, null, 1) + "\n");
console.log(`${Object.keys(out).length} of ${paths.size} paths dated`);
