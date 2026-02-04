import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import markdownToHtml from "@/utils/markdownToHtml";
import { ArrowLeft, BookOpen, Download, Printer, Bookmark, ChevronLeft, ChevronRight, Home, Menu } from "lucide-react";
import Link from "next/link";

interface Props {
  params: {
    semester: string;
    subject: string;
    lesson: string;
  };
}

export default async function LessonPage({ params }: Props) {
  const { semester, subject, lesson } = params;

  const lessonPath = path.join(
    process.cwd(),
    "src",
    "content",
    semester,
    subject,
    `${lesson}.md`
  );

  if (!fs.existsSync(lessonPath)) {
    return notFound();
  }

  const mdContent = fs.readFileSync(lessonPath, "utf-8");
  const html = await markdownToHtml(mdContent);

  // Extract title from markdown (first h1)
  const titleMatch = mdContent.match(/^#\s+(.+)$/m);
  const lessonTitle = titleMatch ? titleMatch[1] : lesson.replace(/-/g, ' ');

  // Generate breadcrumb links
  const subjectLink = `/material/${semester}/${subject}`;
  const semesterLink = `/material/${semester}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20">
      {/* Mobile Header - Sticky */}
      <div className="lg:hidden sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Link href={subjectLink} className="flex items-center gap-2 text-blue-600">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px] mx-auto">
              {lessonTitle}
            </h1>
          </div>
          <button className="p-2 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Breadcrumb Navigation */}
      <div className="hidden lg:block bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 flex-wrap">
              <Link href="/material" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span>Materials</span>
              </Link>
              <span className="text-gray-400">/</span>
              <Link href={semesterLink} className="hover:text-blue-600 transition-colors truncate max-w-[150px]">
                {semester.replace(/-/g, ' ').replace('semester', 'Semester ')}
              </Link>
              <span className="text-gray-400">/</span>
              <Link href={subjectLink} className="hover:text-blue-600 transition-colors truncate max-w-[150px]">
                {subject.replace(/-/g, ' ')}
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-blue-600 font-medium truncate max-w-[200px]">{lessonTitle}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border p-4 sm:p-6 lg:p-8">
              {/* Lesson Header - Mobile optimized */}
              <div className="mb-6 sm:mb-8 pb-4 sm:pb-6 border-b">
                <div className="lg:hidden mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded-full">
                    Lesson
                  </span>
                </div>
                <div className="hidden lg:block">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-3">
                    Lesson
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {lessonTitle}
                </h1>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Updated: Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Reading: 15 min</span>
                  </div>
                </div>
              </div>

              {/* Markdown Content with Mobile Responsive Styling */}
              <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none 
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:mt-6 sm:prose-h1:mt-8 prose-h1:mb-4 sm:prose-h1:mb-6
                prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-6 sm:prose-h2:mt-8 prose-h2:mb-3 sm:prose-h2:mb-4 prose-h2:text-blue-700
                prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-4 sm:prose-h3:mt-6 prose-h3:mb-2 sm:prose-h3:mb-3 prose-h3:text-gray-800
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3 sm:prose-p:mb-4 prose-p:text-sm sm:prose-p:text-base
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-ul:list-disc prose-ul:pl-4 sm:prose-ul:pl-6 prose-ul:mb-4 sm:prose-ul:mb-6
                prose-li:text-gray-700 prose-li:mb-1 sm:prose-li:mb-2 prose-li:text-sm sm:prose-li:text-base
                prose-ol:list-decimal prose-ol:pl-4 sm:prose-ol:pl-6 prose-ol:mb-4 sm:prose-ol:mb-6
                prose-blockquote:border-l-2 sm:prose-blockquote:border-l-4 prose-blockquote:border-blue-300 
                prose-blockquote:pl-3 sm:prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                prose-blockquote:bg-blue-50 prose-blockquote:py-1 sm:prose-blockquote:py-2 prose-blockquote:px-3 sm:prose-blockquote:px-4
                prose-blockquote:text-sm sm:prose-blockquote:text-base
                prose-table:w-full prose-table:border-collapse prose-table:mb-4 sm:prose-table:mb-8
                prose-table:shadow-sm prose-table:border prose-table:border-gray-200 prose-table:text-xs sm:prose-table:text-sm
                prose-th:bg-gray-50 prose-th:text-gray-700 prose-th:font-semibold
                prose-th:p-2 sm:prose-th:p-3 lg:prose-th:p-4 prose-th:border prose-th:border-gray-300 prose-th:text-xs sm:prose-th:text-sm
                prose-td:p-2 sm:prose-td:p-3 lg:prose-td:p-4 prose-td:border prose-td:border-gray-200
                prose-td:text-gray-700 prose-td:text-xs sm:prose-td:text-sm
                prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 sm:prose-pre:p-4 
                prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:text-xs sm:prose-pre:text-sm
                prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-1 
                prose-code:py-0.5 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-800
                prose-a:font-medium prose-a:text-sm sm:prose-a:text-base
                prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:max-w-full
                prose-hr:my-4 sm:prose-hr:my-8 prose-hr:border-gray-300
                prose-table:overflow-x-auto prose-table:block prose-table:max-w-full prose-table:overflow-scroll"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>

            {/* Mobile Bottom Navigation Bar - Sticky */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 p-3">
              <div className="flex justify-between items-center">
                <Link 
                  href={subjectLink}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 
                    font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back</span>
                </Link>
                
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-2 bg-gray-50 text-gray-700 
                    font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    <span className="hidden xs:inline">PDF</span>
                  </button>
                  <button className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white 
                    font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    <span className="hidden xs:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Buttons */}
            <div className="hidden lg:block mt-6 lg:mt-8">
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                <Link 
                  href={subjectLink}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 
                    font-medium rounded-lg border-2 border-blue-100 hover:border-blue-200 
                    hover:shadow-lg transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Subject
                </Link>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  <button className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r 
                    from-blue-50 to-blue-100 text-blue-700 font-medium rounded-lg 
                    hover:shadow-lg transition-all duration-300 text-sm sm:text-base w-full sm:w-auto">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r 
                    from-blue-600 to-blue-700 text-white font-medium rounded-lg 
                    hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base w-full sm:w-auto">
                    Next Lesson
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Spacing for mobile bottom nav */}
            <div className="lg:hidden h-16"></div>
          </div>
        </div>
      </div>
    </div>
  );
}