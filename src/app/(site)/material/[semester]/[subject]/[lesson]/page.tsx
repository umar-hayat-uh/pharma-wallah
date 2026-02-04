"use client";

import { notFound, useRouter } from "next/navigation";
import { ArrowLeft, Download, ChevronRight, Home, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLessonContent } from "@/actions/lesson";

interface Props {
  params: {
    semester: string;
    subject: string;
    lesson: string;
  };
}

export default function LessonPage({ params }: Props) {
  const { semester, subject, lesson } = params;
  const [lessonContent, setLessonContent] = useState<string>("");
  const [lessonTitle, setLessonTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Generate breadcrumb links
  const subjectLink = `/material/${semester}/${subject}`;
  const semesterLink = `/material/${semester}`;

  useEffect(() => {
    async function loadContent() {
      try {
        const data = await getLessonContent(semester, subject, lesson);
        setLessonContent(data.content);
        setLessonTitle(data.lessonTitle);
        setError(null);
      } catch (err) {
        console.error("Error loading lesson:", err);
        setError("Lesson not found");
        notFound(); // This will trigger the 404 page
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [semester, subject, lesson]);

  const handleDownloadPDF = () => {
    // Enhanced PDF download functionality
    const content = document.querySelector('.prose')?.innerHTML || '';
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${lessonTitle}</title>
            <meta charset="UTF-8">
            <style>
              body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                padding: 40px; 
                line-height: 1.6;
                color: #333;
                max-width: 1200px;
                margin: 0 auto;
              }
              h1 { 
                color: #1f2937; 
                font-size: 2.5em;
                border-bottom: 3px solid #3b82f6;
                padding-bottom: 10px;
                margin-bottom: 30px;
              }
              h2 { 
                color: #1e40af; 
                font-size: 1.8em;
                margin-top: 40px;
              }
              h3 { 
                color: #374151; 
                font-size: 1.4em;
                margin-top: 30px;
              }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 20px 0;
                font-size: 0.9em;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left; 
              }
              th { 
                background-color: #f3f4f6; 
                font-weight: 600;
              }
              .references-section { 
                font-weight: bold; 
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #3b82f6;
                margin-top: 30px;
              }
              .table-responsive {
                overflow: visible;
                margin: 20px 0;
              }
              .table-responsive table {
                min-width: 100%;
              }
              @media print {
                body { padding: 20px; }
                h1 { font-size: 2em; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="no-print" style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #eee;">
              <h2 style="color: #1e40af; margin-bottom: 10px;">${subject.replace(/-/g, ' ').toUpperCase()}</h2>
              <p style="color: #666;">${semester.replace(/-/g, ' ').replace('semester', 'Semester ')} | Generated: ${new Date().toLocaleDateString()}</p>
            </div>
            <h1>${lessonTitle}</h1>
            ${content}
            <div class="no-print" style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #666; font-size: 0.9em;">
              <p>Study Material | ${new Date().getFullYear()}</p>
            </div>
            <script>
              // Auto-print and close after a delay
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 1000);
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Lesson Not Found</h2>
            <p className="text-gray-600 mb-6">The lesson you're looking for doesn't exist or couldn't be loaded.</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20">

      {/* Desktop Breadcrumb Navigation */}
      <div className="hidden lg:block bg-white border-b mt-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 flex-wrap">
              <Link href="/material" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span>Materials</span>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="hover:text-blue-600 transition-colors truncate max-w-[150px]">
                {semester.replace(/-/g, ' ').replace('semester', 'Semester ')}
              </span>
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

      <div className="w-full px-0 sm:px-4 lg:px-8 py-4 mt-5 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div>
            <div className="bg-white rounded-none sm:rounded-xl lg:rounded-2xl shadow-sm border-0 sm:border p-4 sm:p-6 lg:p-8 mx-0 sm:mx-2 lg:mx-4">
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
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2 sm:px-0">
                  {lessonTitle}
                </h1>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 px-2 sm:px-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Updated: Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Reading: 15 min</span>
                  </div>
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </button>
                </div>
              </div>

              {/* Markdown Content with Mobile Responsive Styling */}
              <div className="px-2 sm:px-0">
                <div 
                  className="prose prose-sm sm:prose-base lg:prose-lg max-w-none w-full
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
                    prose-th:bg-gray-50 prose-th:text-gray-700 prose-th:font-semibold
                    prose-th:p-2 sm:prose-th:p-3 lg:prose-th:p-4 prose-th:border prose-th:border-gray-300
                    prose-td:p-2 sm:prose-td:p-3 lg:prose-td:p-4 prose-td:border prose-td:border-gray-200
                    prose-td:text-gray-700
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-3 sm:prose-pre:p-4 
                    prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:text-xs sm:prose-pre:text-sm
                    prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-1 
                    prose-code:py-0.5 prose-code:rounded prose-code:text-xs sm:prose-code:text-sm
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-800
                    prose-a:font-medium
                    prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:max-w-full
                    prose-hr:my-4 sm:prose-hr:my-8 prose-hr:border-gray-300"
                  dangerouslySetInnerHTML={{ __html: lessonContent }}
                />
                <style jsx global>{`
                  .references-section {
                    font-weight: 700 !important;
                  }
                  .references-section p, 
                  .references-section li, 
                  .references-section a {
                    font-weight: 700 !important;
                  }
                  .table-responsive {
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    margin: 1rem 0;
                    border-radius: 0.5rem;
                    border: 1px solid #e5e7eb;
                  }
                  .table-responsive table {
                    margin: 0 !important;
                    min-width: 768px;
                  }
                  @media (max-width: 768px) {
                    .table-responsive {
                      margin-left: -1rem;
                      margin-right: -1rem;
                      border-left: none;
                      border-right: none;
                      border-radius: 0;
                      background: linear-gradient(90deg, transparent 0%, transparent 95%, rgba(0,0,0,0.05) 100%);
                    }
                    .table-responsive table {
                      min-width: 100%;
                    }
                    .table-responsive::-webkit-scrollbar {
                      height: 8px;
                    }
                    .table-responsive::-webkit-scrollbar-track {
                      background: #f1f1f1;
                      border-radius: 4px;
                    }
                    .table-responsive::-webkit-scrollbar-thumb {
                      background: #888;
                      border-radius: 4px;
                    }
                    .table-responsive::-webkit-scrollbar-thumb:hover {
                      background: #555;
                    }
                  }
                `}</style>
              </div>
            </div>

            {/* Mobile Bottom Navigation Bar - Sticky */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 p-3">
              <div className="flex justify-between items-center">
                <button 
                  onClick={() => router.back()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 
                    font-medium rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back</span>
                </button>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-50 text-gray-700 
                    font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
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
            <div className="hidden lg:block mt-6 lg:mt-8 px-4 lg:px-0">
              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                <button 
                  onClick={() => router.back()}
                  className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 
                    font-medium rounded-lg border-2 border-blue-100 hover:border-blue-200 
                    hover:shadow-lg transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Subject
                </button>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  <button 
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r 
                    from-blue-50 to-blue-100 text-blue-700 font-medium rounded-lg 
                    hover:shadow-lg transition-all duration-300 text-sm sm:text-base w-full sm:w-auto"
                  >
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
    </section>
  );
}