import { teamMembers } from "@/app/api/team-members";
import {
  User, Linkedin, Instagram, Mail, Sparkles, Award, BookOpen,
  Wrench, Megaphone, Pill, FlaskConical, Beaker, Microscope,
  Stethoscope, Leaf, Dna, Activity, Users, GraduationCap,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About Us | Team PharmaWallah" };

const bgIcons = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

export default function AboutPage() {
  const productionMembers = teamMembers.filter(m =>
    ["Shayan Hussain","Umar Hayat","Jazil bin kashef","Sumaiya Saeed","Syed M. Ali","Rumaisa Farooqui","Misbah Yameen","Muhammad Salman"].includes(m.name)
  );
  const marketingMembers = teamMembers.filter(m =>
    ["Syed Tanzeel Ali","Romana Abbbas","Abdul Rafay","Muhammad Dayyan"].includes(m.name)
  );

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {/* Symmetric 3+3 floating bg icons */}
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-20  w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-20 bottom-4   opacity-15"><Dna      size={60} className="text-white" /></div>
        <div className="absolute right-44 top-6      opacity-15"><Activity size={40} className="text-white" /></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Users className="w-3.5 h-3.5" /> University of Karachi
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            About
            <span className="block text-green-200 mt-1">PharmaWallah</span>
          </h1>

          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Empowering pharmacy students with curated study materials, comprehensive guides, and a supportive learning community built by students, for students.
          </p>

          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { n: "10+", l: "Team Members"    },
              { n: "UOK", l: "Karachi"         },
              { n: "Free", l: "Always"         },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-extrabold text-white">{n}</div>
                <div className="text-sm text-blue-200">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 space-y-20">

        {/* ── Our Story ── */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Our Story</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
            <div className="absolute inset-0 bg-blue-50/20 pointer-events-none" />
            <p className="relative z-10 text-gray-600 leading-relaxed text-base max-w-4xl">
              We are a group of passionate pharmacy students from the{" "}
              <span className="font-extrabold text-gray-900">University of Karachi (UOK)</span>{" "}
              who understand the challenges of university-level pharmacy education firsthand. After experiencing our own struggles with complex curriculum and scattered resources, we decided to create something better.{" "}
              <span className="font-extrabold text-blue-600">PharmaWallah</span>{" "}
              was born from a simple idea: to make pharmacy education more accessible, organized, and effective for every student who shares our passion for pharmaceutical sciences.
            </p>
          </div>
        </div>

        {/* ── Mission / Values / Approach ── */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">What Drives Us</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { Icon: Award,    title: "Our Mission",  body: "To empower pharmacy students with accurate, concise, and easy-to-understand study materials that help them excel in their academic journey. We believe quality education should be accessible to everyone." },
              { Icon: Sparkles, title: "Our Values",   body: "Quality content, student-first approach, collaborative learning, and commitment to accessible education that never compromises on accuracy or clarity." },
              { Icon: BookOpen, title: "Our Approach", body: "Deep curriculum understanding combined with clarity to simplify complex pharmaceutical concepts into digestible, well-structured learning material." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="group relative rounded-2xl border border-gray-200 bg-white p-6 flex flex-col hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/40 transition-colors duration-300 pointer-events-none" />
                <div className="relative z-10 w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4
                  group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-400 group-hover:border-transparent transition-all duration-300">
                  <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="relative z-10 text-sm font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="relative z-10 text-xs text-gray-500 leading-relaxed flex-1">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Production Team ── */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Production Team</h2>
              <p className="text-xs text-gray-400 mt-0.5">The creative minds behind our content, resources, and educational tools</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 shrink-0">
              {productionMembers.length} members
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {productionMembers.map((member, i) => (
              <TeamCard key={i} member={member} />
            ))}
          </div>
        </div>

        {/* ── Marketing Team ── */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Marketing Team</h2>
              <p className="text-xs text-gray-400 mt-0.5">Spreading the word and building our community</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-3 py-1 shrink-0">
              {marketingMembers.length} members
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-3xl">
            {marketingMembers.map((member, i) => (
              <TeamCard key={i} member={member} />
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden p-10 md:p-14 text-center">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
          <div className="absolute inset-0 bg-blue-50/30 pointer-events-none" />

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200/50">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Join Our Learning Community
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Whether you're just starting your pharmacy journey or preparing for finals, PharmaWallah is here to support your success every step of the way.
            </p>
            <Link href="/material"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 hover:-translate-y-0.5 transition-all duration-300">
              <BookOpen className="w-4 h-4" />
              Explore Our Materials
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Team Card ──────────────────────────────────────────────────────
function TeamCard({ member }: { member: typeof teamMembers[0] }) {
  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-300">
      {/* Top stripe */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
      {/* Hover tint */}
      <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 transition-colors duration-300 pointer-events-none" />

      {/* Photo */}
      <div className="relative z-10 pt-7 pb-3 flex justify-center">
        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200 group-hover:border-blue-300 transition-colors duration-300 shadow-sm">
          {member.imgSrc ? (
            <img src={member.imgSrc} alt={member.name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="relative z-10 px-5 pb-5 text-center">
        <h3 className="text-sm font-extrabold text-gray-900 mb-1.5 group-hover:text-blue-700 transition-colors duration-300">
          {member.name}
        </h3>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-green-400" />
          {member.role}
        </span>

        <div className="w-full h-px bg-gray-100 mb-3" />

        <div className="text-[10px] text-gray-400 mb-3 font-medium">University of Karachi</div>

        <div className="flex justify-center items-center gap-2">
          {[
            { Icon: Linkedin,  bg: "bg-blue-50",  text: "text-blue-700",  hover: "hover:bg-blue-100"  },
            { Icon: Instagram, bg: "bg-pink-50",  text: "text-pink-700",  hover: "hover:bg-pink-100"  },
            { Icon: Mail,      bg: "bg-green-50", text: "text-green-700", hover: "hover:bg-green-100" },
          ].map(({ Icon, bg, text, hover }, j) => (
            <button key={j} className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg} ${text} ${hover} border border-gray-100 transition-colors duration-200`}>
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}