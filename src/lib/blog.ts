import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  excerpt: string;
  content: string;
  readingTime: number;
};

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
    console.warn(`⚠️ Blog directory created at ${BLOG_DIR}. Please add .mdx files.`);
  }
}

export function getAllPosts(): BlogPost[] {
  ensureBlogDir();
  const files = fs.readdirSync(BLOG_DIR);
  const mdxFiles = files.filter((file) => file.endsWith(".mdx"));
  
  if (mdxFiles.length === 0) {
    console.warn(`⚠️ No .mdx files found in ${BLOG_DIR}`);
    return [];
  }
  
  const posts = mdxFiles
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const fullPath = path.join(BLOG_DIR, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);
      
      if (!data.title || !data.date || !data.author || !data.category || !data.excerpt) {
        console.error(`❌ Missing frontmatter in ${file}`);
        return null;
      }
      
      const wordCount = content.split(/\s+/g).length;
      const readingTime = Math.ceil(wordCount / 200);
      
      return {
        slug,
        title: data.title,
        date: data.date,
        author: data.author,
        category: data.category,
        excerpt: data.excerpt,
        content,
        readingTime,
      };
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | null {
  ensureBlogDir();
  try {
    const fullPath = path.join(BLOG_DIR, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Post not found: ${slug}`);
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    const wordCount = content.split(/\s+/g).length;
    const readingTime = Math.ceil(wordCount / 200);
    return {
      slug,
      title: data.title,
      date: data.date,
      author: data.author,
      category: data.category,
      excerpt: data.excerpt,
      content,
      readingTime,
    };
  } catch (error) {
    console.error(`❌ Error reading post ${slug}:`, error);
    return null;
  }
}

export function getAllCategories(): string[] {
  const posts = getAllPosts();
  // Fix: use filter to get unique values without Set iteration issue
  const categories = posts.map(p => p.category);
  const uniqueCategories = categories.filter((value, index, self) => self.indexOf(value) === index);
  return uniqueCategories;
}