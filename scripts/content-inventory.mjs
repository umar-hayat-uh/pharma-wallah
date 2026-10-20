#!/usr/bin/env node
/**
 * Content inventory for the AdSense low-value-content remediation (2026-10-12).
 *
 *   node scripts/content-inventory.mjs
 *
 * Writes docs/adsense-content-inventory.json (machine-readable) and
 * docs/adsense-content-inventory.md (the same, as tables). Everything is read
 * from the source of truth — the tool directories, the hub registry, the
 * recorded-fault list, the course registry, the guides — never typed, so the
 * report can be regenerated after any change instead of going stale.
 *
 * Static analysis only: "has a worked example" means the tool ships a
 * `_learn.ts` with one, not that a person has judged it good. Rendering and
 * correctness are verified separately (CLAUDE.md §9). Regex, not a TS parser,
 * on purpose: the registry and subject files are flat literals, and a parser
 * would be a new dependency for one report.
 */
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (p) => readFileSync(path.join(ROOT, p), "utf8");
const TOOLS_DIR = "src/app/(site)/calculation-tools/(tools)";

// ── Hub registry: subject → tools, and the unlisted tools ─────────────────
const indexSrc = read("src/app/(site)/calculation-tools/tool-index.ts");
const hub = new Map(); // slug → { name, subjects: [] }
{
  const subjectRe = /label:\s*"([^"]+)"[\s\S]*?tools:\s*\[([\s\S]*?)\n\s*\],/g;
  for (const m of indexSrc.matchAll(subjectRe)) {
    for (const t of m[2].matchAll(/name:\s*"([^"]+)",\s*slug:\s*"([^"]+)"/g)) {
      const entry = hub.get(t[2]) ?? { name: t[1], subjects: [] };
      entry.subjects.push(m[1]);
      hub.set(t[2], entry);
    }
  }
}
const unlisted = new Map();
{
  const block = indexSrc.slice(indexSrc.indexOf("export const UNLISTED_TOOLS"));
  for (const m of block.matchAll(/^\s*"?([\w-]+)"?:\s*\{\s*name:\s*"([^"]+)"/gm)) unlisted.set(m[1], m[2]);
}

// ── Recorded formula faults (redesign tracker, "Suspected maths issues") ──
const tracker = read(".claude/redesign-tracker.md");
const faultText = tracker.slice(tracker.indexOf("## Suspected maths issues"));
function faultsFor(slug) {
  const out = [];
  for (const line of faultText.split("\n")) {
    const bullet = line.match(/^- \*{0,2}`?([\w-]+)`?\*{0,2}[:(]/);
    const row = line.match(/^\|\s*`([^`]+)`(?:,\s*`[^`]+`)*\s*\|\s*(.+?)\s*\|/);
    if (bullet && bullet[1] === slug) out.push(line.replace(/^- /, "").slice(0, 220));
    else if (row && line.includes(`\`${slug}\``) && !/^No mat/.test(row[2])) out.push(row[2].slice(0, 220));
  }
  return out;
}

// ── Per-calculator analysis ───────────────────────────────────────────────
const count = (src, re) => (src.match(re) ?? []).length;
const calculators = [];
for (const slug of readdirSync(path.join(ROOT, TOOLS_DIR)).sort()) {
  const dir = path.join(TOOLS_DIR, slug);
  if (!statSync(path.join(ROOT, dir)).isDirectory()) continue;
  const page = path.join(dir, "page.tsx");
  if (!existsSync(path.join(ROOT, page))) continue;

  const pageSrc = read(page);
  const learnPath = path.join(dir, "_learn.ts");
  const learn = existsSync(path.join(ROOT, learnPath)) ? read(learnPath) : "";
  const learnWired = /<CalcLearn\b/.test(pageSrc);
  const refIds = learn ? [...(learn.match(/refs:\s*\[([^\]]*)\]/)?.[1] ?? "").matchAll(/"(\w+)"/g)].map((m) => m[1]) : [];
  const faults = faultsFor(slug);
  const listed = hub.has(slug);

  const row = {
    slug,
    url: `/calculation-tools/${slug}`,
    name: hub.get(slug)?.name ?? unlisted.get(slug) ?? slug,
    subjects: hub.get(slug)?.subjects ?? [],
    linkedFromHub: listed,
    pageLines: pageSrc.split("\n").length,
    hasFormula: /<FormulaNote\b/.test(pageSrc),
    hasAbout: /<CalcAbout\b/.test(pageSrc),
    faqCount: count(pageSrc.slice(pageSrc.indexOf("<CalcFaq")), /\bq:\s*["'`]/g),
    hasExampleChips: /example/i.test(pageSrc),
    hasWorkedExample: learnWired && /workedExample:/.test(learn),
    mistakes: learnWired ? count(learn.slice(learn.indexOf("mistakes:"), learn.indexOf("]", learn.indexOf("mistakes:"))), /^\s*"/gm) : 0,
    hasLimitations: learnWired && /limitations:/.test(learn),
    references: learnWired ? refIds : [],
    linksGuide: learnWired && /guide:\s*\{/.test(learn),
    recordedFaults: faults,
  };
  row.action = faults.length
    ? "repair — recorded formula fault (owner decision)"
    : !row.hasWorkedExample
      ? "improve — add worked example, mistakes, references"
      : "meets standard";
  calculators.push(row);
}

// ── Course lessons (registered subjects only — the rest are not pages) ────
const lessons = [];
for (const file of readdirSync(path.join(ROOT, "src/lib/courses/subjects"))) {
  const src = read(`src/lib/courses/subjects/${file}`);
  const slug = src.match(/^\s*slug:\s*"([^"]+)"/m)?.[1];
  if (!slug || !read("src/lib/courses/registry.ts").includes(file.replace(/\.ts$/, ""))) continue;
  for (const m of src.matchAll(/id:\s*"([^"]+)",\s*\n\s*title:\s*"([^"]+)"[\s\S]*?contentFile:\s*"([^"]+)"/g)) {
    const md = path.join(ROOT, "content", m[3]);
    const words = existsSync(md) ? readFileSync(md, "utf8").split(/\s+/).filter(Boolean).length : 0;
    lessons.push({ url: `/courses/${slug}/${m[1]}`, title: m[2], words, action: words === 0 ? "repair — markdown missing" : words < 600 ? "investigate — short" : "ok" });
  }
}

// ── Guides ────────────────────────────────────────────────────────────────
const guides = existsSync(path.join(ROOT, "src/lib/guides/content"))
  ? readdirSync(path.join(ROOT, "src/lib/guides/content")).map((f) => {
      const src = read(`src/lib/guides/content/${f}`);
      const strings = [...src.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => m[1]).join(" ");
      return {
        url: `/guides/${f.replace(/\.ts$/, "")}`,
        title: src.match(/title:\s*"([^"]+)"/)?.[1],
        approxWords: strings.split(/\s+/).filter(Boolean).length,
        examples: count(src, /kind:\s*"example"/g),
        practice: count(src.slice(src.indexOf("practice:")), /\bq:\s*"/g),
        review: src.match(/status:\s*"([^"]+)"/)?.[1],
      };
    })
  : [];

// ── Write ─────────────────────────────────────────────────────────────────
const summary = {
  generated: new Date().toISOString().slice(0, 10),
  calculators: calculators.length,
  linkedFromHub: calculators.filter((c) => c.linkedFromHub).length,
  withWorkedExample: calculators.filter((c) => c.hasWorkedExample).length,
  withReferences: calculators.filter((c) => c.references.length).length,
  withRecordedFaults: calculators.filter((c) => c.recordedFaults.length).length,
  lessons: lessons.length,
  guides: guides.length,
};
writeFileSync(path.join(ROOT, "docs/adsense-content-inventory.json"), JSON.stringify({ summary, calculators, lessons, guides }, null, 2) + "\n");

const yes = (b) => (b ? "✓" : "—");
const esc = (s) => String(s).replace(/\|/g, "\\|");
let md = `# AdSense content inventory

> **Generated** by \`node scripts/content-inventory.mjs\` on ${summary.generated}. Do not edit by hand —
> change the source and regenerate. Machine-readable copy: \`docs/adsense-content-inventory.json\`.
> Static analysis only; see the method notes at the end.

## Summary

| Measure | Count |
| --- | --- |
| Calculator pages | ${summary.calculators} |
| … linked from the hub | ${summary.linkedFromHub} |
| … with a worked example, mistakes and references (\`_learn.ts\`) | ${summary.withWorkedExample} |
| … with at least one recorded formula fault | ${summary.withRecordedFaults} |
| Published course units | ${summary.lessons} |
| Guides | ${summary.guides} |

Every calculator page already has a formula panel, an "About" section and an FAQ (counted below), so
none is an empty tool page. The gap the remediation addresses is *teaching depth* (worked examples,
mistakes, references) and *correctness* (recorded faults).

## Calculators

Columns: F = formula panel, A = About section, FAQ = number of questions, WE = worked example,
M = common mistakes listed, L = limitations, Refs = references cited, G = links a guide.

| Calculator | Hub | F | A | FAQ | WE | M | L | Refs | G | Recorded faults | Action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
`;
for (const c of calculators) {
  md += `| [${esc(c.name)}](${c.url}) | ${c.linkedFromHub ? esc(c.subjects.join(", ")) : "not listed"} | ${yes(c.hasFormula)} | ${yes(c.hasAbout)} | ${c.faqCount} | ${yes(c.hasWorkedExample)} | ${c.mistakes || "—"} | ${yes(c.hasLimitations)} | ${c.references.length ? c.references.join(", ") : "—"} | ${yes(c.linksGuide)} | ${c.recordedFaults.length ? esc(c.recordedFaults.join(" / ")) : "—"} | ${c.action} |\n`;
}
md += `\n## Guides\n\n| Guide | ≈ words | Worked examples | Practice questions | Review status |\n| --- | --- | --- | --- | --- |\n`;
for (const g of guides) md += `| [${esc(g.title)}](${g.url}) | ${g.approxWords} | ${g.examples} | ${g.practice} | ${g.review} |\n`;
md += `\n## Course units (registered subjects)\n\n| Unit | Words of lesson text | Action |\n| --- | --- | --- |\n`;
for (const l of lessons) md += `| [${esc(l.title)}](${l.url}) | ${l.words} | ${l.action} |\n`;
md += `
## Not inventoried here

- **Spotting lessons** (histology 16, pathology 15, powder microscopy 3) are page files, not data;
  their word counts need a render. Powder microscopy has no images (CLAUDE.md Known Issue 23).
- **Virtual Labs, Molecular Lab, Pharmacy Counter, Osteology Lab** are interactive tools whose value
  is not measured by word count.
- **Clinical subdomain pages** share the main site's content (they canonicalise to www).

## Method notes

- *Formula / About / FAQ* are detected from the shared kit components in the page source.
- *Worked example, mistakes, limitations, references, guide* come from the tool's \`_learn.ts\` and
  count only when the page actually renders \`<CalcLearn>\`.
- *Recorded faults* are read from \`.claude/redesign-tracker.md\` → "Suspected maths issues". A tool
  with none listed is not proven correct; it has simply not been reported faulty.
- *Short lesson* means under 600 words of markdown; it is a prompt to look, not a verdict.
`;
writeFileSync(path.join(ROOT, "docs/adsense-content-inventory.md"), md);
console.log(JSON.stringify(summary));
