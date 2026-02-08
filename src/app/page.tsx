import React from "react";
import Hero from "@/components/Home/Hero";
import Companies from "@/components/Home/Companies";
import Features from "@/components/Home/Features"; // New
import Mentor from "@/components/Home/Mentor";
import Testimonial from "@/components/Home/Testimonials";
import Newsletter from "@/components/Home/Newsletter";
import ContactForm from "@/components/Home/ContactForm"; // New
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PharmaWallah | Pharmacy eLearning Platform",
  description: "Master Pharmacy and Pharmaceutical Sciences with comprehensive study materials, MCQs, tools, and community support.",
};

export default function Home() {
  return (
    <main className="overflow-hidden">
      <Hero />
      <Companies />
      <Features />
      <Mentor />
      <Testimonial />
      <Newsletter />
      <ContactForm />
    </main>
  );
}