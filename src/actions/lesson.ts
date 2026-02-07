"use server";
import markdownToHtml from "@/utils/markdownToHtml";

export async function getLessonContent(
  semester: string,
  subject: string,
  lesson: string,
) {
  try {
    console.log("Looking for lesson:", { semester, subject, lesson });

    // For Vercel/Production: Fetch from public directory
    // For local development: Use relative path
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://pharma-wallah.vercel.app/')
      : 'http://localhost:3000';
    
    const fileUrl = `${baseUrl}/content/${semester}/${subject}/${lesson}.md`;
    console.log("Fetching from URL:", fileUrl);

    // Fetch the markdown file
    const response = await fetch(fileUrl, {
      // Important: Add cache control to prevent stale data
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.log("Failed to fetch markdown file:", response.status, response.statusText);
      
      // Try alternative path for local dev
      if (process.env.NODE_ENV === 'development') {
        const localUrl = `/content/${semester}/${subject}/${lesson}.md`;
        console.log("Trying local URL:", localUrl);
        const localResponse = await fetch(localUrl);
        
        if (!localResponse.ok) {
          console.log("Failed to fetch from local URL");
          return null;
        }
        
        const mdContent = await localResponse.text();
        return await processMarkdownContent(mdContent, lesson);
      }
      
      return null;
    }

    const mdContent = await response.text();
    console.log("Found markdown content, length:", mdContent.length);
    
    return await processMarkdownContent(mdContent, lesson);
  } catch (error) {
    console.error("Error in getLessonContent:", error);
    return null;
  }
}

// Helper function to process markdown content
async function processMarkdownContent(mdContent: string, lesson: string) {
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
}