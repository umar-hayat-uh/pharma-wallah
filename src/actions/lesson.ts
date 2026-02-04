"use server";
import fs from "fs";
import path from "path";
import markdownToHtml from "@/utils/markdownToHtml";

export async function getLessonContent(
  semester: string,
  subject: string,
  lesson: string,
) {
  try {
    console.log("Looking for lesson:", { semester, subject, lesson });

    const lessonPath = path.join(
      process.cwd(),
      "src",
      "content",
      semester,
      subject,
      `${lesson}.md`,
    );

    console.log("Lesson path:", lessonPath);

    if (!fs.existsSync(lessonPath)) {
      console.log("Lesson file does not exist");
      return null;
    }

    const mdContent = fs.readFileSync(lessonPath, "utf-8");
    console.log("Found markdown content, length:", mdContent.length);

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
        },
      )
      .replace(
        /<table[^>]*>[\s\S]*?<\/table>/g,
        (match) => `<div class="table-responsive">${match}</div>`,
      );

    console.log("Successfully processed lesson");
    return { lessonTitle, content: processedHtml };
  } catch (error) {
    console.error("Error in getLessonContent:", error);
    return null;
  }
}
