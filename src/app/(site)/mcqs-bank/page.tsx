import { Metadata } from "next";
import { SemesterData } from "@/app/api/semester-data";

export const metadata: Metadata = {
  title: "MCQ's Bank | Pharm-D Subject Wise",
};

export default function McqsBankPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 p-0">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">

            {/* Main Heading */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Pharm-D Subject Wise MCQs
              <span className="block text-green-300 mt-2">(Semester Wise)</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Access Pharm-D subject-wise MCQ sets arranged semester-wise. Each
              subject links to topic-wise MCQs with around 50 questions and
              answers, helpful for sessional exams, university exams, viva and
              competitive preparation.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 mt-10 lg:px-8 pb-16 md:pb-20">
        {SemesterData.map(({ semester, subjects }) => (
          <div key={semester} className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">{semester}</h2>
            <hr className="mb-6 border-gray-300" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {subjects.map(({ name, icon, description }) => (
                <div
                  key={name}
                  className="p-4 rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer
    flex flex-col items-center gap-2
    bg-blue-200/20 backdrop-blur-lg border border-blue-100"
                >
                  <div className="self-start flex items-center justify-center w-8 h-8 flex-shrink-0">
                    {icon}
                  </div>

                  <div className="self-start">
                    <h3 className="text-xl font-semibold text-black">{name}</h3>
                    <p className="text-gray-600 text-sm mt-2">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
