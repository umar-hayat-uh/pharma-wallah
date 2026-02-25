import { Metadata } from "next";
import { SemesterData } from "@/app/api/semester-data";
import Link from "next/link";
import {
  Pill,
  FlaskConical,
  Beaker,
  Microscope,
  Atom,
  Dna,
  HeartPulse,
  Leaf,
  Syringe,
  TestTube,
  Tablet,
  ClipboardList,
  Stethoscope,
  Bandage,
  Droplet,
  Eye,
  Bone,
  Brain,
  Heart,
  Activity,
  AlertCircle,
  Scissors,
  Thermometer,
  Wind,
  Zap,
  Droplets,
  FlaskRound,
  // Capsule excluded
} from "lucide-react";

export const metadata: Metadata = {
  title: "MCQ's Bank | Pharm-D Subject Wise",
};

export default function McqsBankPage() {
  const semesters = SemesterData.map((item) => item.semester);

  const iconList = [
    { Icon: Pill, color: "text-blue-800/10" },
    { Icon: FlaskConical, color: "text-green-800/10" },
    { Icon: Beaker, color: "text-purple-800/10" },
    { Icon: Microscope, color: "text-amber-800/10" },
    { Icon: Atom, color: "text-blue-800/10" },
    { Icon: Dna, color: "text-green-800/10" },
    { Icon: HeartPulse, color: "text-purple-800/10" },
    { Icon: Leaf, color: "text-amber-800/10" },
    { Icon: Syringe, color: "text-blue-800/10" },
    { Icon: TestTube, color: "text-green-800/10" },
    { Icon: Tablet, color: "text-purple-800/10" },
    { Icon: ClipboardList, color: "text-amber-800/10" },
    { Icon: Stethoscope, color: "text-blue-800/10" },
    { Icon: Bandage, color: "text-green-800/10" },
    { Icon: Droplet, color: "text-purple-800/10" },
    { Icon: Eye, color: "text-amber-800/10" },
    { Icon: Bone, color: "text-blue-800/10" },
    { Icon: Brain, color: "text-green-800/10" },
    { Icon: Heart, color: "text-purple-800/10" },
    { Icon: Activity, color: "text-amber-800/10" },
    { Icon: AlertCircle, color: "text-blue-800/10" },
    { Icon: Scissors, color: "text-green-800/10" },
    { Icon: Thermometer, color: "text-purple-800/10" },
    { Icon: Wind, color: "text-amber-800/10" },
    { Icon: Zap, color: "text-blue-800/10" },
    { Icon: Droplets, color: "text-green-800/10" },
    { Icon: FlaskRound, color: "text-purple-800/10" },
  ];

  const bgIcons = [];
  for (let i = 0; i < 40; i++) {
    const item = iconList[i % iconList.length];
    bgIcons.push({
      ...item,
      color: i % 4 === 0 ? "text-blue-800/10" :
             i % 4 === 1 ? "text-green-800/10" :
             i % 4 === 2 ? "text-purple-800/10" : "text-amber-800/10",
    });
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 p-0 relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      {/* Hero Section (unchanged) */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
           
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
              Pharm-D Subject Wise MCQs
              <span className="block text-green-300 mt-2">(Semester Wise)</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Access Pharm-D subject-wise MCQ sets arranged semester-wise. Each
              subject links to topic-wise MCQs with around 50 questions and
              answers, helpful for sessional exams, university exams, viva and
              competitive preparation.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {semesters.map((sem) => (
                <a
                  key={sem}
                  href={`#${sem.replace(/\s+/g, "-").toLowerCase()}`}
                  className="px-4 py-2 text-sm font-medium text-white bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                >
                  {sem}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - with floating icons in background */}
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 z-10">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="relative w-full h-full">
            {bgIcons.map(({ Icon, color }, index) => {
              const left = `${(index * 13) % 90 + 5}%`;
              const top = `${(index * 19) % 90 + 5}%`;
              const size = 30 + (index * 7) % 90;
              const rotate = (index * 23) % 360;
              return (
                <Icon
                  key={index}
                  size={size}
                  className={`absolute ${color}`}
                  style={{ left, top, transform: `rotate(${rotate}deg)` }}
                />
              );
            })}
          </div>
        </div>

        {SemesterData.map(({ semester, subjects }) => (
          <div
            key={semester}
            id={semester.replace(/\s+/g, "-").toLowerCase()}
            className="mb-16 scroll-mt-20"
          >
            <div className="text-center mb-10">
              <div className="inline-block px-6 py-3 bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {semester}
                </h2>
              </div>
              <hr className="mt-4 border-t-2 border-blue-200/50 max-w-xs mx-auto" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {subjects.map((subj) => {
                const subjectLink = `/mcqs/semester-6/${subj.name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`;

                return (
                  <Link key={subj.name} href={subjectLink} className="group">
                    <div
                      className={`relative p-6 rounded-2xl backdrop-blur-md transition-all duration-300 flex flex-col h-full
                        ${
                          subjectLink !== "#"
                            ? "bg-white/40 border border-white/50 shadow-lg hover:shadow-2xl hover:scale-105 hover:bg-white/60"
                            : "bg-gray-100/50 border border-gray-200/50 opacity-50 cursor-not-allowed"
                        }`}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                      <div className="relative mb-4 flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100/50 to-green-100/50 backdrop-blur-sm border border-white/50 shadow-sm">
                        <div className="text-3xl">{subj.icon}</div>
                      </div>

                      <h3 className="relative text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                        {subj.name}
                      </h3>
                      <p className="relative text-sm text-gray-600 leading-relaxed line-clamp-3">
                        {subj.description}
                      </p>

                      {subjectLink !== "#" && (
                        <div className="relative mt-4 flex justify-end">
                          <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </div>
                      )}
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