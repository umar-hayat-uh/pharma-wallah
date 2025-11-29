import { Metadata } from "next";
import { SemesterData } from "@/app/api/semester-data";

export const metadata: Metadata = {
  title: "Material | Pharm-D Semester Wise",
};

export default function MaterialPage() {
  return (
    <section id="home-section" className="min-h-screen mt-5">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md pt-5">
        <div className="mx-auto py-10 px-4">
          <div className="mb-5">
            <h1 className="text-4xl font-bold text-black">
              Pharm-D Material (Semester Wise)
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse Pharm-D study materials organized semester-wise, covering lecture notes,
              handouts. Each subject section provides structured, easy-to-revise content designed
              to help you prepare for sessional exams, university finals, viva voce, and competitive
              examination preparation.
            </p>

          </div>

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
      </div>
    </section>
  );
}
