import Link from "next/link";
import {
  LayoutDashboard,
  ArrowRight,
  BookOpen,
  Microscope,
  FlaskConical,
  Beaker,
  Stethoscope,
  Leaf,
  Pill,
  Sparkles,
  Construction,
} from "lucide-react";

const GRAD = "from-blue-600 to-green-400";

const BG_ICONS = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 30 },
  { Icon: Beaker, top: "38%", left: "1%", size: 28 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 30 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 28 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 28 },
];

export default function DashboardComingSoon() {
  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden flex items-center justify-center">
      {/* Floating background icons */}
      {BG_ICONS.map(({ Icon, top, left, size }, i) => (
        <div
          key={i}
          className="fixed pointer-events-none text-blue-100 z-0 hidden md:block"
          style={{ top, left }}
        >
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        {/* Gradient card */}
        <div className="relative rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-xl shadow-blue-100/50">
          {/* Top accent bar */}
          <div className={`h-2 bg-gradient-to-r ${GRAD}`} />

          <div className="p-8 sm:p-12">
            {/* Icon */}
            <div
              className={`mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br ${GRAD} flex items-center justify-center mb-6 shadow-lg shadow-blue-200/50`}
            >
              <Construction className="w-10 h-10 text-white" />
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Your Dashboard is
              <span className={`block bg-gradient-to-r ${GRAD} bg-clip-text text-transparent`}>
                Coming Soon
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto mb-8">
              We&apos;re building a powerful student dashboard to track your
              progress, streaks, and activity across all Pharmacy subjects.
              Stay tuned!
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                { icon: <BookOpen className="w-3.5 h-3.5" />, label: "Course Tracking" },
                { icon: <Microscope className="w-3.5 h-3.5" />, label: "Quiz Analytics" },
                { icon: <Sparkles className="w-3.5 h-3.5" />, label: "Smart Insights" },
              ].map(({ icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold"
                >
                  {icon}
                  {label}
                </span>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/courses"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r ${GRAD} text-white font-extrabold text-sm shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 hover:shadow-xl transition-all`}
              >
                <BookOpen className="w-4 h-4" />
                Explore Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-extrabold text-sm hover:border-blue-400 hover:text-blue-600 transition-all"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}