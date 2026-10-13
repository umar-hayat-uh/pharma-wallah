import type { MetadataRoute } from "next";
import { SITE_URL, HISTOLOGY_LESSONS, PATHOLOGY_LESSONS, POWDER_LESSONS } from "@/lib/seo";
import { HUB_SUBJECTS, UNLISTED_TOOLS, toolHref } from "@/app/(site)/calculation-tools/tool-index";
import { SUBJECTS } from "@/lib/courses/registry";
import { GUIDES } from "@/lib/guides";
import { isNoindex } from "@/lib/indexing";
// Last git commit date per path (scripts/gen-lastmod.mjs) — true dates, never the build time.
import LASTMOD from "@/generated/lastmod.json";
import { semestersWithQuestions } from "@/lib/mcq-availability";
import { semesterToSlug, subjectToSlug } from "@/lib/mcq-utils";

/**
 * /sitemap.xml — added 2026-09-23 (it was a 404).
 *
 * Every entry is derived from the registry that renders the page, so a tool,
 * course unit or MCQ bank added in the usual place is listed automatically and a
 * removed one drops out. Only indexable, content-bearing pages are listed:
 * nothing behind sign-in, nothing noindexed in src/lib/seo.ts, no MCQ subject
 * without a bank, and no ended-event pages.
 */

const STATIC_PATHS = [
  "/",
  "/calculation-tools",
  "/calculation-tools/how-to-use",
  "/guides",
  "/courses",
  "/mcqs-bank",
  "/flash-cards",
  "/spotting",
  "/spotting/histology/lessons",
  "/spotting/histology/test",
  "/spotting/pathology/lessons",
  "/spotting/pathology/test",
  "/spotting/powder-microscopy/lessons",
  "/simulations",
  "/simulations/titration",
  "/simulations/buffer-lab",
  "/simulations/dilution-lab",
  "/simulations/disk-diffusion",
  "/simulations/uv-lab",
  "/simulations/staining-lab",
  "/simulations/organic-id-lab",
  "/simulations/lab-guide",
  "/encyclopedia",
  "/molecular-lab",
  "/pharmacy-counter",
  "/compounding-lab",
  "/antibiogram-simulator",
  "/adr-detective",
  "/drug-finder",
  "/ai-guide",
  "/community",
  // Battle Royale: the menu and the board only. Register and How to play were
  // listed until 2026-10-12; since the event closed they answer with a client
  // redirect to /battle-royale (an HTTP 200 with no content of its own), which
  // a crawler sees as a thin duplicate. Re-add them if the event reopens.
  "/battle-royale",
  "/battle-royale/leaderboard",
  "/download",
  "/about-us",
  "/editorial-policy",
  "/faqs",
  "/contact",
  "/careers",
  "/privacy",
  "/terms",
  "/clinical",
  "/clinical/about",
  "/clinical/calculators",
  "/clinical/dose-calculators",
  "/clinical/drug-drug-interaction",
  "/clinical/drug-food-interaction",
  "/clinical/adr",
  "/clinical/amr",
  "/clinical/encyclopedia",
  "/clinical/resources",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = new Set<string>(STATIC_PATHS);

  for (const subject of HUB_SUBJECTS) for (const tool of subject.tools) paths.add(toolHref(tool.slug));
  for (const slug of Object.keys(UNLISTED_TOOLS)) paths.add(toolHref(slug));

  // Drafts are already filtered out of GUIDES.
  for (const guide of GUIDES) paths.add(`/guides/${guide.slug}`);

  for (const subject of SUBJECTS) {
    paths.add(`/courses/${subject.slug}`);
    for (const unit of subject.units) paths.add(`/courses/${subject.slug}/${unit.id}`);
  }

  for (const sem of semestersWithQuestions()) {
    const semSlug = semesterToSlug(sem.semester);
    paths.add(`/mcqs-bank/${semSlug}`);
    for (const sub of sem.subjects) {
      const subSlug = subjectToSlug(sub.name);
      // A subject in two semesters is listed once, at its first (canonical) URL.
      if (!Array.from(paths).some((p) => p.startsWith("/mcqs-bank/") && p.endsWith(`/${subSlug}`))) {
        paths.add(`/mcqs-bank/${semSlug}/${subSlug}`);
      }
    }
  }

  // The orphan simple-columnar-epithelium lesson is noindexed; leave it out.
  for (const id of Object.keys(HISTOLOGY_LESSONS)) {
    if (id !== "simple-columnar-epithelium") paths.add(`/spotting/histology/lessons/${id}`);
  }
  for (const id of Object.keys(PATHOLOGY_LESSONS)) paths.add(`/spotting/pathology/${id}`);
  for (const id of Object.keys(POWDER_LESSONS)) paths.add(`/spotting/powder-microscopy/lessons/${id}`);

  // Anything switched off in src/lib/indexing.ts stays out, so a noindexed page
  // is never also submitted for indexing.
  return Array.from(paths).filter((path) => !isNoindex(path)).map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    ...((LASTMOD as Record<string, string>)[path] ? { lastModified: (LASTMOD as Record<string, string>)[path] } : {}),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : path.split("/").length <= 2 ? 0.8 : 0.6,
  }));
}
