"use server";
import markdownToHtml from "@/utils/markdownToHtml";

export async function getLessonContent(
  semester: string,
  subject: string,
  lesson: string,
) {
  try {
    console.log("Looking for lesson:", { semester, subject, lesson });

    // For Vercel/Production: Use absolute URL
    // For local development: Use relative URL
    let fileUrl;
    
    if (process.env.NODE_ENV === 'production') {
      // Production on Vercel
      fileUrl = `https://pharma-wallah.vercel.app/content/${semester}/${subject}/${lesson}.md`;
    } else {
      // Local development
      fileUrl = `/content/${semester}/${subject}/${lesson}.md`;
    }
    
    console.log("Fetching from URL:", fileUrl);

    // Fetch the markdown file
    const response = await fetch(fileUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'text/markdown',
      },
    });
    
    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);
    
    if (!response.ok) {
      console.log("Failed to fetch markdown file:", response.status, response.statusText);
      
      // Try with absolute URL in development
      if (process.env.NODE_ENV === 'development') {
        const absoluteUrl = `http://localhost:3000${fileUrl}`;
        console.log("Trying absolute URL:", absoluteUrl);
        const absoluteResponse = await fetch(absoluteUrl, { cache: 'no-store' });
        
        if (!absoluteResponse.ok) {
          console.log("Failed to fetch from absolute URL");
          return null;
        }
        
        const mdContent = await absoluteResponse.text();
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