import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SemesterData } from "@/app/api/semester-data";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Download,
  Calendar,
} from "lucide-react";

interface Props {
  params: {
    semester: string;
    subject: string;
  };
}

const slugify = (str: string) => str.toLowerCase().replace(/\s+/g, "-");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { semester, subject } = params;

  const semesterData = SemesterData.find(
    (s) => slugify(s.semester) === semester,
  );

  if (!semesterData) {
    return {
      title: "Subject Not Found | Pharm-D Material",
    };
  }

  const subjectData = semesterData.subjects.find(
    (s) => slugify(s.name) === subject,
  );

  return {
    title: subjectData
      ? `${subjectData.name} | ${semesterData.semester} | Pharm-D Material`
      : "Subject Not Found | Pharm-D Material",
    description: subjectData?.description || "Pharm-D study materials",
  };
}

export default function SubjectPage({ params }: Props) {
  const { semester, subject } = params;

  const semesterData = SemesterData.find(
    (s) => slugify(s.semester) === semester,
  );

  if (!semesterData) return notFound();

  const subjectData = semesterData.subjects.find(
    (s) => slugify(s.name) === subject,
  );

  if (!subjectData) return notFound();

  // Generate proper back link
  const backLink = `/material/semester-${semester.split("-").pop()}`;

  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 pt-0">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">

          {/* Subject Hero Content */}
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                {subjectData.icon || (
                  <BookOpen className="w-6 h-6 text-white" />
                )}
              </div>
              <span className="text-sm font-medium text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {semesterData.semester}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {subjectData.name}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl leading-relaxed">
              {subjectData.description}
            </p>

            {/* Stats Bar */}
            <div className="flex flex-wrap gap-4 mb-6">
              {subjectData.lessons?.length ? (
                <div className="flex items-center gap-2 text-white/90">
                  <FileText className="w-5 h-5" />
                  <span className="font-medium">
                    {subjectData.lessons.length} lessons
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-white/90">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Coming Soon</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {subjectData.lessons?.length ? (
          <div>
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Available Lessons
                </h2>
                <p className="text-gray-600 max-w-2xl">
                  Browse through structured lessons designed to help you prepare
                  for exams, viva voce, and competitive examinations.
                </p>
              </div>
              <div className="hidden md:block">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                  {subjectData.lessons.length}{" "}
                  {subjectData.lessons.length === 1 ? "lesson" : "lessons"}
                </span>
              </div>
            </div>

            {/* Lessons Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjectData.lessons.map((lesson, index) => (
                <Link
                  key={lesson.title}
                  href={lesson.link}
                  className="group block"
                >
                  <div
                    className="h-full bg-white rounded-xl shadow-sm border-2 border-gray-50 p-6 
                    hover:shadow-lg hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 
                    hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl 
                        flex items-center justify-center shadow-sm"
                      >
                        <span className="text-blue-600 font-bold text-lg">
                          {index + 1}
                        </span>
                      </div>
                      <div
                        className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-100 
                        flex items-center justify-center transition-colors"
                      >
                        <div
                          className="w-2 h-2 bg-blue-600 rounded-full group-hover:w-3 group-hover:h-3 
                          transition-all duration-300"
                        ></div>
                      </div>
                    </div>

                    <h3
                      className="font-bold text-gray-900 text-lg mb-3 group-hover:text-blue-700 
                      transition-colors line-clamp-2"
                    >
                      {lesson.title}
                    </h3>

                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center text-blue-600 font-medium text-sm group-hover:text-blue-700">
                        <span>View Lesson</span>
                        <svg
                          className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="max-w-2xl mx-auto text-center py-16">
            <div
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-green-50 
              rounded-full flex items-center justify-center shadow-sm"
            >
              <BookOpen className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Lessons Coming Soon
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              We're currently preparing high-quality study materials for{" "}
              {subjectData.name}. Check back soon for comprehensive lessons,
              notes, and practice materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={backLink}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r 
                  from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg 
                  transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                Browse Other Subjects
              </Link>
              <Link
                href="/material"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 
                  font-medium rounded-lg border-2 border-blue-100 hover:border-blue-200 
                  hover:shadow-lg transition-all duration-300"
              >
                <BookOpen className="w-4 h-4" />
                All Semesters
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
