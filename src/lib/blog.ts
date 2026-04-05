import fs from "fs";
import path from "path";
import matter from "gray-matter";

// Read from multiple directories — deduplicated by slug (first found wins)
const BLOG_DIRS = [
  path.join(process.cwd(), "markdown/blog"),
  path.join(process.cwd(), "src/content/blog"),
];

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readingTime: number;
  content: string;
  tags?: string[];
}

function calcReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function parseFile(dir: string, filename: string): BlogPost {
  const slug = filename.replace(/\.(mdx?|md)$/, "");
  const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    excerpt:
      data.excerpt ??
      content.slice(0, 160).replace(/[#*`_]/g, "").trim() + "…",
    date: data.date ? String(data.date) : new Date().toISOString(),
    author: data.author ?? "PharmaWallah Team",
    category: data.category ?? "General",
    readingTime: calcReadingTime(content),
    content,
    tags: data.tags ?? [],
  };
}

export function getAllPosts(): BlogPost[] {
  const seenSlugs = new Set<string>();
  const posts: BlogPost[] = [];

  for (const dir of BLOG_DIRS) {
    if (!fs.existsSync(dir)) continue;

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

    for (const filename of files) {
      const slug = filename.replace(/\.(mdx?|md)$/, "");
      if (seenSlugs.has(slug)) continue; // skip duplicates
      seenSlugs.add(slug);
      posts.push(parseFile(dir, filename));
    }
  }

  // Sort newest first — by date field, fallback to filename desc
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | null {
  return getAllPosts().find((p) => p.slug === slug) ?? null;
}