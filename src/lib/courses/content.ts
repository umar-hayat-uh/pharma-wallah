// src/lib/courses/content.ts
// Runs on the SERVER ONLY (called from Server Components / generateStaticParams).
// Reads markdown straight off disk at build/request time — no client-side
// fetch, no loading spinner, no race condition where content never arrives.

import { readFile } from "fs/promises";
import path from "path";

const CONTENT_ROOT = path.join(process.cwd(), "public", "content");

export async function getUnitMarkdown(contentFile: string): Promise<string | null> {
  try {
    const fullPath = path.join(CONTENT_ROOT, contentFile);
    return await readFile(fullPath, "utf-8");
  } catch {
    return null; // file missing — caller renders a friendly "not found" state
  }
}