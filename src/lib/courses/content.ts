// src/lib/courses/content.ts
// Runs on the SERVER ONLY (called from Server Components / generateStaticParams).
// Reads markdown straight off disk at build/request time — no client-side
// fetch, no loading spinner, no race condition where content never arrives.

import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";

// Outside public/ since 2026-09-23. Under public/ every file was also served raw
// at /content/…, which put unstyled duplicates of the lesson pages — and drafts
// for subjects that are not published — on the open web. The lesson pages are
// the only way to read them now. next.config.mjs traces this folder into the
// server bundle (outputFileTracingIncludes), because the path is built at
// request time and the tracer cannot see it.
const CONTENT_ROOT = path.join(process.cwd(), "content");

export async function getUnitMarkdown(contentFile: string): Promise<string | null> {
  try {
    const fullPath = path.join(CONTENT_ROOT, contentFile);
    return await readFile(fullPath, "utf-8");
  } catch {
    return null; // file missing — caller renders a friendly "not found" state
  }
}
/**
 * The same read, synchronous — used by the unit page (2026-10-13).
 *
 * An `await` in a page under the root loading.tsx suspends it, so Next streams
 * the lesson after the shell as a hidden `<div hidden id="S:…">` that JavaScript
 * moves into place. A crawler that does not run JS saw an empty <main> (0 unique
 * words on all 22 units, AUDIT.md). A synchronous read of a local file renders
 * the lesson inline in the first HTML, at the cost of a few milliseconds of disk.
 */
export function getUnitMarkdownSync(contentFile: string): string | null {
  try {
    return readFileSync(path.join(CONTENT_ROOT, contentFile), "utf-8");
  } catch {
    return null;
  }
}
