"use server";
import fs from "fs";
import path from "path";
import markdownToHtml from "@/utils/markdownToHtml";

export async function getLessonContent(
  semester: string,
  subject: string,
  lesson: string,
) {
  const lessonPath = path.join(
    process.cwd(),
    "src",
    "content",
    semester,
    subject,
    `${lesson}.md`,
  );

  if (!fs.existsSync(lessonPath)) {
    throw new Error("Lesson not found");
  }

  const mdContent = fs.readFileSync(lessonPath, "utf-8");
  const html = await markdownToHtml(mdContent);

  // Extract title from markdown (first h1)
  const titleMatch = mdContent.match(/^#\s+(.+)$/m);
  const lessonTitle = titleMatch ? titleMatch[1] : lesson.replace(/-/g, " ");

  // Process HTML for tables and references
  const processedHtml = html
    .replace(
      /<h3[^>]*>References<\/h3>([\s\S]*?)(?=<h[1-6]|$)/i,
      (match, content) => {
        return `<div class="references-section"><h3>References</h3>${content}</div>`;
      }
    )
    .replace(
      /<table[^>]*>[\s\S]*?<\/table>/g,
      (match) => `<div class="table-responsive">${match}</div>`
    );

  return { lessonTitle, content: processedHtml };
}