import React from "react";
import Hero from "@/components/Home/Hero";
import Companies from "@/components/Home/Companies";
import Features from "@/components/Home/Features";
import Mentor from "@/components/Home/Mentor";
import Testimonial from "@/components/Home/Testimonials";
import ContactForm from "@/components/Home/ContactForm";
import UnderConstructionBanner from "@/components/UnderConstructionBanner";
import { Metadata } from "next";
import Courses from "@/components/Home/Courses";

export const metadata: Metadata = {
  title: "PharmaWallah | Pharmacy eLearning Platform",
  description: "Master Pharmacy and Pharmaceutical Sciences with comprehensive study materials, MCQs, tools, and community support.",
};

export default function Home() {
  return (
    <main className="bg-white">
      <UnderConstructionBanner />
      <Hero />
      <Companies />
      <Courses />
      <Features />
      <Mentor />
      <Testimonial />
      <ContactForm />
    </main>
  );
}