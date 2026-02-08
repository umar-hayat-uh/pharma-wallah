import { teamMembers } from "@/app/api/team-members";
import { User, Linkedin, Instagram, Mail, Sparkles, Award, BookOpen } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Team PharmaWallah",
};

export default function AboutUs() {
  return (
    <section id="home-section" className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative overflow-hidden p-0">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 py-20 relative z-10">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl px-6 py-2 shadow-lg">
              <span className="text-sm font-semibold text-slate-700">Your Pharmacy learning Hub</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight">
            About <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">PharmaWallah</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Empowering pharmacy students with curated study materials, 
            comprehensive guides, and a supportive learning community.
          </p>
        </div>

        {/* Our Story Section - Glassmorphic */}
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-10 md:p-16 mb-20">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/50 backdrop-blur-sm rounded-full p-4 border border-white/60">
              <BookOpen className="w-10 h-10 text-slate-700" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-center mb-8 text-slate-900">Our Story</h2>
          <p className="text-lg text-slate-700 leading-relaxed text-center max-w-4xl mx-auto">
            We are a group of passionate pharmacy students from the <strong>University of Karachi (UOK)</strong> who 
            understand the challenges of university-level pharmacy education firsthand. After experiencing our own 
            struggles with complex curriculum and scattered resources, we decided to create something better. 
            <strong> PharmaWallah</strong> was born from a simple idea: to make pharmacy education more accessible, 
            organized, and effective for every student who shares our passion for pharmaceutical sciences.
          </p>
        </div>

        {/* Mission & Values - Creative Asymmetric Layout */}
        <div className="grid md:grid-cols-2 gap-6 mb-24 max-w-6xl mx-auto">
          {/* Large card spanning top */}
          <div className="md:col-span-2 bg-white/40 backdrop-blur-lg rounded-3xl border border-black/50 p-10 hover:bg-white/50 transition-all duration-300">
            <div className="flex items-start gap-6">
              <div className="bg-slate-800 rounded-2xl p-4 flex-shrink-0">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">Our Mission</h3>
                <p className="text-slate-700 leading-relaxed">
                  To empower pharmacy students with accurate, concise, and easy-to-understand study materials 
                  that help them excel in their academic journey. We believe quality education should be 
                  accessible to everyone.
                </p>
              </div>
            </div>
          </div>

          {/* Two smaller cards at bottom */}
          <div className="bg-white/40 backdrop-blur-lg rounded-3xl border border-black/50 p-8 hover:bg-white/50 transition-all duration-300">
            <div className="bg-slate-800 rounded-2xl p-3 inline-block mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Our Values</h3>
            <p className="text-slate-700">
              Quality content, student-first approach, collaborative learning, and commitment to accessible education.
            </p>
          </div>

          <div className="bg-white/40 backdrop-blur-lg rounded-3xl border border-black/50 p-8 hover:bg-white/50 transition-all duration-300">
            <div className="bg-slate-800 rounded-2xl p-3 inline-block mb-4">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Our Approach</h3>
            <p className="text-slate-700">
              Deep curriculum understanding combined with clarity to simplify complex pharmaceutical concepts.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-slate-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Dedicated pharmacy students working together to transform pharmaceutical education at UOK
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group relative"
              >
                {/* Card with gradient border */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-green-500 rounded-3xl blur opacity-0 group-hover:opacity-70 transition duration-500 group-hover:duration-200"></div>
                
                {/* Main card */}
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 overflow-hidden transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                  
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 to-green-400/20"></div>
                  </div>
                  
                  {/* Profile image with gradient border */}
                  <div className="relative pt-10 pb-6 flex justify-center">
                    
                    {/* Image container */}
                        {member.imgSrc ? (
                          <img
                            src={member.imgSrc}
                            alt={member.name}
                            className="object-cover h-32 w-32 transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                            <User className="w-16 h-16 text-white" />
                          </div>
                        )}
                   
                  </div>
                  
                  {/* Content */}
                  <div className="px-8 pb-8 text-center">
                    {/* Name with gradient */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-green-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {member.name}
                    </h3>
                    
                    {/* Role with pill design */}
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-green-50 px-4 py-2 rounded-full border border-blue-100/50 mb-4 group-hover:border-blue-200/50 transition-colors duration-300">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-slate-700">
                        {member.role}
                      </span>
                    </div>
                    
                    {/* Decorative separator */}
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white/80 backdrop-blur-sm px-4 text-sm text-slate-500">
                        University of Karachi
                        </span>
                      </div>
                    </div>
                    
                    {/* Social links (optional - can add to teamMembers data later) */}
                    <div className="flex justify-center items-center gap-4 mt-6 opacity-100">
                      <button className="p-2 bg-blue-100 rounded-full text-blue-700 300 hover:scale-110">
                        <Linkedin className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-pink-100 rounded-full text-pink-700  hover:scale-110">
                        <Instagram className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-green-100 rounded-full text-green-700  hover:scale-110">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Hover overlay content */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/95 to-green-500/95 backdrop-blur-sm rounded-3xl p-8 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-500">
                      <Sparkles className="w-8 h-8 text-white mb-4" />
                      <h4 className="text-xl font-bold text-white mb-2">Pharmacy Student</h4>
                      <p className="text-white/90 text-center text-sm mb-4">
                        Passionate about pharmaceutical sciences and dedicated to making education accessible
                      </p>
                      <div className="flex items-center gap-2 text-white/80">
                        <Award className="w-4 h-4" />
                        <span className="text-sm">Batch { member.batch }</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom gradient accent */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400/0 via-blue-500 to-green-400/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action - Minimal Glass Design */}
        <div className="bg-white/20 backdrop-blur-2xl rounded-3xl border border-white/40 p-12 md:p-16 text-center shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Join Our Learning Community</h2>
          <p className="text-lg mb-10 text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Whether you're just starting your pharmacy journey or preparing for finals, 
            PharmaWallah is here to support your success every step of the way.
          </p>
          <Link href='/material' className="bg-slate-900 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-slate-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
            Explore Our Materials
          </Link>
        </div>
      </div>
    </section>
  );
}