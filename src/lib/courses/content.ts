// src/lib/courses/content.ts
// Runs on the SERVER ONLY (called from Server Components / generateStaticParams).
// Reads markdown straight off disk at build/request time — no client-side
// fetch, no loading spinner, no race condition where content never arrives.

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