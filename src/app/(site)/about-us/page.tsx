import { teamMembers } from "@/app/api/data";
import { User } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About US | Team PharmaWallah",
};

export default function AboutUs() {
  return (
    <section id="home-section" className="min-h-screen bg-gray-50">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4 pt-10">
        {/* About Us Header */}
        <div className="text-center py-10">
          <h1 className="text-4xl font-bold">About Us</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            We are a group of passionate pharmacy students from University of Karachi <strong>(UOK)</strong> who have experienced firsthand the challenges of university-level pharmacy studies. Driven by our own struggles and a desire to make learning easier for others, we decided to create <strong>PharmaWallah</strong>. With a deep understanding of the curriculum, we curate accurate, concise, and easy-to-understand study materials, charts, and guides. <strong>Our mission</strong> is to empower fellow students to learn effectively and excel in their academic journey.
          </p>
        </div>

        {/* Team Section */}
        <div className="py-16">
          <h2 className="text-3xl font-bold text-center mb-10">Meet Our Team</h2>

          {/* Marquee Wrapper */}
          <div className="overflow-hidden h-80 sm:h-90 md:h-80 lg:h-96">
            <div className="flex animate-marquee gap-8">
              {teamMembers.concat(teamMembers).map((member, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-lg flex flex-col items-center text-center min-w-[220px] hover:scale-105 transition-transform"
                >
                  <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-white/50">
                    {member.imgSrc ? (
                      <img
                        src={member.imgSrc}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-full h-full text-gray-300" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-black">{member.name}</h3>
                  <p className="text-gray-700 mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
