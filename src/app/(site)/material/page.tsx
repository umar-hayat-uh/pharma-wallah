import { Metadata } from "next";
import { SemesterData } from "@/app/api/semester-data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Material | Pharm-D Semester Wise",
};

export default function MaterialPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 p-0">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Pharm-D Material
              <span className="block text-green-300 mt-2">(Semester Wise)</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Browse Pharm-D study materials organized semester-wise, covering
              lecture notes, handouts. Each subject section provides structured,
              easy-to-revise content designed to help you prepare for sessional
              exams, university finals, viva voce, and competitive examination
              preparation.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 mt-10 lg:px-8 pb-16 md:pb-20">
        {SemesterData.map(({ semester, subjects }) => (
          <div key={semester} className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
              {semester}
            </h2>
            <hr className="mb-6 border-gray-300" />

            <div className="grid md:grid-cols-4 gap-4">
              {subjects.map((subj) => {
                // URL to Subject page instead of first lesson
                const subjectLink = `/material/semester-6/${subj.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`;

                return (
                  <Link key={subj.name} href={subjectLink} className="group">
                    <div
                      className={`p-4 rounded-lg shadow-md transition-transform flex flex-col gap-2
          ${subjectLink !== "#" ? "cursor-pointer group-hover:shadow-xl hover:scale-105" : "opacity-50 cursor-not-allowed"}
          bg-blue-200/20 backdrop-blur-lg border border-blue-100`}
                    >
                      <div className="flex items-center gap-3">{subj.icon}</div>
                      <h3 className="text-xl font-semibold">{subj.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {subj.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
